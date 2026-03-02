/**
 * POST /api/social/publish
 * Publish an approved content post to a social platform.
 * Updates both Postgres and Aitable on success/failure.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  publishToFacebook,
  publishToInstagram,
} from "@/lib/services/social/facebook-publisher";
import { publishToX } from "@/lib/services/social/x-publisher";
import { publishToLinkedIn } from "@/lib/services/social/linkedin-publisher";
import { publishToYouTube } from "@/lib/services/social/youtube-publisher";
import { sendPublishNotification } from "@/lib/services/social/approval-flow";
import { findRecordByPostgresId, updateContentRecord } from "@/lib/services/social/aitable-sync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, notifyPhone } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    // Fetch the post with platform account
    const post = await prisma.contentPost.findUnique({
      where: { id: postId },
      include: { platformAccount: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status === "published") {
      return NextResponse.json(
        { error: "Post already published", postUrl: post.platformUrl },
        { status: 409 }
      );
    }

    // Check approval status if it went through approval flow
    if (post.approvalStatus === "pending") {
      return NextResponse.json(
        { error: "Post is pending approval" },
        { status: 403 }
      );
    }

    if (post.approvalStatus === "rejected") {
      return NextResponse.json(
        { error: "Post was rejected", note: post.rejectionNote },
        { status: 403 }
      );
    }

    // Get platform account credentials — auto-resolve if not linked
    let account = post.platformAccount;
    if (!account || !account.accessToken) {
      // Try to find the default account for this platform
      account = await prisma.platformAccount.findFirst({
        where: {
          userId: post.userId,
          platform: post.platform || "facebook",
          isActive: true,
        },
      });

      if (!account || !account.accessToken) {
        return NextResponse.json(
          { error: "No platform account connected. Add a platform account first." },
          { status: 400 }
        );
      }
    }

    // Publish based on platform
    let result;
    const content = post.content || "";
    const mediaUrls = (post.mediaUrls as string[]) || [];

    switch (post.platform) {
      case "facebook":
        result = await publishToFacebook({
          pageId: account.accountId!,
          accessToken: account.accessToken,
          message: content,
          imageUrl: mediaUrls[0],
        });
        break;

      case "instagram":
        if (!mediaUrls[0]) {
          return NextResponse.json(
            { error: "Instagram requires an image" },
            { status: 400 }
          );
        }
        result = await publishToInstagram({
          igUserId: account.accountId!,
          accessToken: account.accessToken,
          caption: content,
          imageUrl: mediaUrls[0],
        });
        break;

      case "twitter": {
        const xMeta = (account.metadata as Record<string, string>) || {};

        // Prefer OAuth 2.0 Bearer token (from PKCE connect flow)
        if (xMeta.authType === "oauth2" && account.accessToken) {
          result = await publishToX({
            text: content,
            mediaUrl: mediaUrls[0],
            bearerToken: account.accessToken,
            username: xMeta.username,
            apiKey: "",
            apiKeySecret: "",
            accessToken: "",
            accessTokenSecret: "",
          });
        } else {
          // Fallback: OAuth 1.0a from metadata or env
          const apiKey = xMeta.apiKey || process.env.X_API_KEY || "";
          const apiKeySecret = xMeta.apiKeySecret || process.env.X_API_KEY_SECRET || "";
          const xAccessTokenSecret = xMeta.accessTokenSecret || process.env.X_ACCESS_TOKEN_SECRET || "";

          if (!apiKey || !apiKeySecret || !xAccessTokenSecret) {
            return NextResponse.json(
              { error: "X/Twitter credentials not configured. Connect your X account first." },
              { status: 400 }
            );
          }

          result = await publishToX({
            text: content,
            mediaUrl: mediaUrls[0],
            apiKey,
            apiKeySecret,
            accessToken: account.accessToken,
            accessTokenSecret: xAccessTokenSecret,
          });
        }
        break;
      }

      case "linkedin": {
        // LinkedIn uses OAuth 2.0 — authorUrn stored in accountId
        const authorUrn = account.accountId;
        if (!authorUrn) {
          return NextResponse.json(
            { error: "LinkedIn author URN not configured. Link your LinkedIn account first." },
            { status: 400 }
          );
        }

        result = await publishToLinkedIn({
          accessToken: account.accessToken,
          authorUrn,
          text: content,
          imageUrl: mediaUrls[0],
        });
        break;
      }

      case "youtube": {
        // YouTube uses OAuth 2.0 — video upload or comment
        const title = (post.metadata as Record<string, string>)?.title || content.slice(0, 100);
        result = await publishToYouTube({
          accessToken: account.accessToken,
          title,
          description: content,
          videoUrl: mediaUrls[0],
        });
        break;
      }

      case "tiktok":
        return NextResponse.json(
          { error: "TikTok publishing pending developer app approval. Coming soon." },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: `Unknown platform: ${post.platform}` },
          { status: 400 }
        );
    }

    // Find Aitable record for sync
    const meta = post.metadata as Record<string, unknown> | null;
    const aitableRecordId =
      (meta?.aitableRecordId as string) || (await findRecordByPostgresId(post.id));

    if (!result.success) {
      // Update post status to failed in Postgres
      await prisma.contentPost.update({
        where: { id: postId },
        data: {
          status: "failed",
          metadata: {
            ...(meta || {}),
            publishError: result.error,
            failedAt: new Date().toISOString(),
          },
        },
      });

      // Sync failure to Aitable
      if (aitableRecordId) {
        await updateContentRecord(aitableRecordId, { status: "Failed" });
      }

      return NextResponse.json(
        { error: `Publish failed: ${result.error}` },
        { status: 502 }
      );
    }

    // Update post as published in Postgres
    const updated = await prisma.contentPost.update({
      where: { id: postId },
      data: {
        status: "published",
        platformPostId: result.postId,
        platformUrl: result.postUrl,
        publishedAt: new Date(),
        metadata: {
          ...(meta || {}),
          publishResponse: { postId: result.postId, postUrl: result.postUrl },
        },
      },
    });

    // Sync published status to Aitable
    if (aitableRecordId) {
      await updateContentRecord(aitableRecordId, {
        status: "Published",
        platformUrl: result.postUrl || "",
        platformPostId: result.postId || "",
        publishedAt: new Date().toISOString(),
      });
    }

    // Send WhatsApp notification
    if (notifyPhone) {
      await sendPublishNotification(notifyPhone, post.platform || "social", result.postUrl);
    }

    return NextResponse.json({
      success: true,
      post: {
        id: updated.id,
        status: updated.status,
        platformUrl: updated.platformUrl,
      },
      platformPostId: result.postId,
      platformUrl: result.postUrl,
    });
  } catch (err) {
    console.error("[social/publish] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 500 }
    );
  }
}
