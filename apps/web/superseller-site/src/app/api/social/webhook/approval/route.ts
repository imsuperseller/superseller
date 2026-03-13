/**
 * POST /api/social/webhook/approval
 * WAHA webhook — processes WhatsApp approval replies (buttons + text).
 * On "approve" → auto-publishes to the platform + edits original message.
 * On "reject" → updates status in Postgres + Aitable + edits message.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseApprovalResponse, sendPublishNotification, editApprovalMessage } from "@/lib/services/social/approval-flow";
import { publishToFacebook, publishToInstagram } from "@/lib/services/social/facebook-publisher";
import { publishToX } from "@/lib/services/social/x-publisher";
import { publishToLinkedIn } from "@/lib/services/social/linkedin-publisher";
import { publishToYouTube } from "@/lib/services/social/youtube-publisher";
import { findRecordByPostgresId, updateContentRecord } from "@/lib/services/social/aitable-sync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // WAHA webhook payload
    const event = body.event;
    if (event !== "message") {
      return NextResponse.json({ ok: true, skipped: "not a message event" });
    }

    const payload = body.payload;
    const messageBody = payload?.body || "";
    const from = payload?.from?.replace("@c.us", "")?.replace("@s.whatsapp.net", "") || "";

    // Extract button ID from WAHA interactive message payload
    const buttonId =
      payload?.selectedButtonId ||
      payload?.buttonId ||
      payload?._data?.quotedMsg?.selectedButtonId ||
      undefined;

    if (!from || (!messageBody && !buttonId)) {
      return NextResponse.json({ ok: true, skipped: "empty message" });
    }

    const { action, reason, postIdPrefix } = await parseApprovalResponse(messageBody, buttonId);
    if (action === "unknown") {
      return NextResponse.json({ ok: true, skipped: "not an approval response" });
    }

    // Find the target post — use button postId prefix if available, otherwise most recent
    let pendingPost;
    if (postIdPrefix) {
      // Button click — find by ID prefix (first 8 chars of UUID)
      pendingPost = await prisma.contentPost.findFirst({
        where: {
          id: { startsWith: postIdPrefix },
          approvalStatus: "pending",
          status: "pending_approval",
        },
      });
    }

    // Fallback: most recent pending post for this approver
    if (!pendingPost) {
      pendingPost = await prisma.contentPost.findFirst({
        where: {
          approvalStatus: "pending",
          status: "pending_approval",
          metadata: { path: ["approverPhone"], equals: from },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Last resort: any pending post
    if (!pendingPost) {
      pendingPost = await prisma.contentPost.findFirst({
        where: {
          approvalStatus: "pending",
          status: "pending_approval",
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!pendingPost) {
      return NextResponse.json({ ok: true, skipped: "no pending posts" });
    }

    const meta = pendingPost.metadata as Record<string, unknown> | null;
    const aitableRecordId =
      (meta?.aitableRecordId as string) || (await findRecordByPostgresId(pendingPost.id));
    const approvalMessageId = meta?.approvalMessageId as string | undefined;
    const chatId = `${from}@c.us`;

    // === APPROVE ===
    if (action === "approve") {
      // Update Postgres
      await prisma.contentPost.update({
        where: { id: pendingPost.id },
        data: {
          approvalStatus: "approved",
          approvedBy: from,
          approvedAt: new Date(),
          status: "approved",
        },
      });

      // Update Aitable
      if (aitableRecordId) {
        await updateContentRecord(aitableRecordId, {
          status: "Approved",
          approvedBy: from,
        });
      }

      // Edit the original approval message
      if (approvalMessageId) {
        editApprovalMessage(approvalMessageId, chatId, "✅ *APPROVED* — publishing now...").catch(() => {});
      }

      // Auto-publish: tenant-specific env vars take priority over PlatformAccount
      const tenantSlug = (meta?.tenantSlug as string) || "";
      const igAccountFromEnv = pendingPost.platform === "instagram"
        ? getIgAccountFromEnv(tenantSlug)
        : null;

      const account = !igAccountFromEnv
        ? await prisma.platformAccount.findFirst({
            where: {
              userId: pendingPost.userId,
              platform: pendingPost.platform || "facebook",
              isActive: true,
            },
          })
        : null;

      const effectiveAccount = igAccountFromEnv
        ? igAccountFromEnv
        : account
          ? { accessToken: account.accessToken, accountId: account.accountId }
          : null;

      if (effectiveAccount?.accessToken && effectiveAccount.accountId) {
        const content = pendingPost.content || "";
        const mediaUrls = (pendingPost.mediaUrls as string[]) || [];
        let publishResult;

        if (pendingPost.platform === "facebook") {
          publishResult = await publishToFacebook({
            pageId: effectiveAccount.accountId!,
            accessToken: effectiveAccount.accessToken!,
            message: content,
            imageUrl: mediaUrls[0],
          });
        } else if (pendingPost.platform === "instagram" && mediaUrls[0]) {
          publishResult = await publishToInstagram({
            igUserId: effectiveAccount.accountId!,
            accessToken: effectiveAccount.accessToken!,
            caption: content,
            imageUrl: mediaUrls[0],
          });
        } else if (pendingPost.platform === "twitter" && account) {
          const acctMeta = (account.metadata as Record<string, string>) || {};
          if (acctMeta.authType === "oauth2" && account.accessToken) {
            publishResult = await publishToX({
              text: content,
              mediaUrl: mediaUrls[0],
              bearerToken: account.accessToken,
              username: acctMeta.username,
              apiKey: "", apiKeySecret: "", accessToken: "", accessTokenSecret: "",
            });
          } else {
            const apiKey = acctMeta.apiKey || process.env.X_API_KEY || "";
            const apiKeySecret = acctMeta.apiKeySecret || process.env.X_API_KEY_SECRET || "";
            const xAccessTokenSecret = acctMeta.accessTokenSecret || process.env.X_ACCESS_TOKEN_SECRET || "";
            if (apiKey && apiKeySecret && xAccessTokenSecret) {
              publishResult = await publishToX({
                text: content,
                mediaUrl: mediaUrls[0],
                apiKey,
                apiKeySecret,
                accessToken: account.accessToken!,
                accessTokenSecret: xAccessTokenSecret,
              });
            }
          }
        } else if (pendingPost.platform === "linkedin" && effectiveAccount.accountId) {
          publishResult = await publishToLinkedIn({
            accessToken: effectiveAccount.accessToken!,
            authorUrn: effectiveAccount.accountId,
            text: content,
            imageUrl: mediaUrls[0],
          });
        } else if (pendingPost.platform === "youtube" && account) {
          const postMeta = (pendingPost.metadata as Record<string, string>) || {};
          publishResult = await publishToYouTube({
            accessToken: account.accessToken!,
            title: postMeta.title || content.slice(0, 100),
            description: content,
            videoUrl: mediaUrls[0],
          });
        }

        if (publishResult?.success) {
          await prisma.contentPost.update({
            where: { id: pendingPost.id },
            data: {
              status: "published",
              platformPostId: publishResult.postId,
              platformUrl: publishResult.postUrl,
              publishedAt: new Date(),
            },
          });

          if (aitableRecordId) {
            await updateContentRecord(aitableRecordId, {
              status: "Published",
              platformUrl: publishResult.postUrl || "",
              platformPostId: publishResult.postId || "",
              publishedAt: new Date().toISOString(),
            });
          }

          // Edit original message to show published status
          if (approvalMessageId) {
            editApprovalMessage(
              approvalMessageId, chatId,
              `✅ *PUBLISHED*\n${publishResult.postUrl || "Post is live!"}`
            ).catch(() => {});
          }

          await sendPublishNotification(from, pendingPost.platform || "social", publishResult.postUrl);

          return NextResponse.json({
            ok: true,
            action: "approved_and_published",
            postId: pendingPost.id,
            platformUrl: publishResult.postUrl,
          });
        }
      }

      return NextResponse.json({
        ok: true,
        action: "approved",
        postId: pendingPost.id,
        note: "Approved but auto-publish skipped (no account or publish failed)",
      });
    }

    // === REJECT ===
    if (action === "reject") {
      await prisma.contentPost.update({
        where: { id: pendingPost.id },
        data: {
          approvalStatus: "rejected",
          approvedBy: from,
          approvedAt: new Date(),
          rejectionNote: reason || "Rejected without reason",
          status: "rejected",
        },
      });

      if (aitableRecordId) {
        await updateContentRecord(aitableRecordId, {
          status: "Rejected",
          approvedBy: from,
          rejectionNote: reason || "Rejected without reason",
        });
      }

      // Edit original message to show rejected status
      if (approvalMessageId) {
        editApprovalMessage(
          approvalMessageId, chatId,
          `❌ *REJECTED*${reason ? `\nReason: ${reason}` : ""}`
        ).catch(() => {});
      }

      return NextResponse.json({ ok: true, action: "rejected", postId: pendingPost.id, reason });
    }

    // === EDIT REQUEST ===
    if (action === "edit") {
      const existingMeta = (meta || {}) as Record<string, unknown>;
      const editRequests = Array.isArray(existingMeta.editRequests) ? existingMeta.editRequests : [];
      const updatedMeta = JSON.parse(JSON.stringify({
        ...existingMeta,
        editRequests: [
          ...editRequests,
          { from, reason, at: new Date().toISOString() },
        ],
      }));
      await prisma.contentPost.update({
        where: { id: pendingPost.id },
        data: { metadata: updatedMeta },
      });

      // Edit original message to show edit requested
      if (approvalMessageId) {
        editApprovalMessage(
          approvalMessageId, chatId,
          `✏️ *EDIT REQUESTED*${reason ? `\nNotes: ${reason}` : ""}`
        ).catch(() => {});
      }

      return NextResponse.json({ ok: true, action: "edit_requested", postId: pendingPost.id, instructions: reason });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[social/webhook/approval] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Env var fallback for IG publishing when no PlatformAccount exists.
 */
function getIgAccountFromEnv(tenantSlug: string): { accessToken: string; accountId: string } | null {
  const tokenMap: Record<string, { tokenEnv: string; accountIdEnv: string }> = {
    "rensto": { tokenEnv: "FB_PAGE_TOKEN_RENSTO", accountIdEnv: "IG_BUSINESS_ACCOUNT_ID_RENSTO" },
    "superseller": { tokenEnv: "FB_PAGE_TOKEN_SUPERSELLER", accountIdEnv: "IG_BUSINESS_ACCOUNT_ID_SUPERSELLER" },
  };

  const mapping = tokenMap[tenantSlug];
  if (mapping) {
    const token = process.env[mapping.tokenEnv];
    const accountId = process.env[mapping.accountIdEnv];
    if (token && accountId) return { accessToken: token, accountId };
  }

  const defaultToken = process.env.FB_PAGE_TOKEN_RENSTO;
  const defaultAccountId = process.env.IG_BUSINESS_ACCOUNT_ID_RENSTO;
  if (defaultToken && defaultAccountId) return { accessToken: defaultToken, accountId: defaultAccountId };

  return null;
}
