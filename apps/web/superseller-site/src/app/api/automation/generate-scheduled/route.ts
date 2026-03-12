/**
 * POST /api/automation/generate-scheduled
 *
 * Vercel Cron or manual trigger — generates daily IG content for all
 * tenants that have contentAutomation enabled in their settings.
 *
 * Each tenant config (Tenant.settings.contentAutomation):
 * {
 *   enabled: boolean,
 *   platform: "instagram" | "facebook",
 *   approverPhone: string,          // WhatsApp number for approval
 *   businessContext: string,
 *   contentPillars: string[],
 *   language: "en" | "he",
 *   dailyContent: [
 *     { type: "reel", topicPool: string[], tone: string, aspectRatio: string },
 *     { type: "carousel", topicPool: string[], tone: string, aspectRatio: string },
 *     { type: "story", topicPool: string[], tone: string, aspectRatio: string },
 *   ]
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateContent } from "@/lib/services/social/content-generator";
import { generateSocialImage } from "@/lib/services/social/image-generator";
import { sendApprovalRequest } from "@/lib/services/social/approval-flow";
import { createContentRecord } from "@/lib/services/social/aitable-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes — generating multiple posts

interface ContentSlot {
  type: string;       // reel, carousel, story, post
  topicPool: string[];
  tone?: string;
  aspectRatio?: string;
}

interface ContentAutomationConfig {
  enabled: boolean;
  platform: string;
  approverPhone: string;
  businessContext: string;
  contentPillars: string[];
  language: "en" | "he";
  dailyContent: ContentSlot[];
  userId?: string; // which user account to save posts under
}

// Cron secret to prevent unauthorized triggers
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  // Verify cron secret or admin session
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    // Also accept admin cookie-based auth
    const { verifySession } = await import("@/lib/auth");
    const session = await verifySession();
    if (!session.isValid || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Find all tenants with content automation enabled
    const tenants = await prisma.tenant.findMany({
      where: { status: "active" },
    });

    const results: {
      tenant: string;
      posts: { type: string; postId: string; status: string }[];
      errors: string[];
    }[] = [];

    for (const tenant of tenants) {
      const settings = tenant.settings as Record<string, unknown> | null;
      const config = settings?.contentAutomation as ContentAutomationConfig | undefined;

      if (!config?.enabled || !config.dailyContent?.length) continue;

      const tenantResult: typeof results[0] = {
        tenant: tenant.slug,
        posts: [],
        errors: [],
      };

      // Find a user for this tenant to attach posts to
      const userId = config.userId || await findTenantUser(tenant.id);
      if (!userId) {
        tenantResult.errors.push("No user found for tenant");
        results.push(tenantResult);
        continue;
      }

      // Generate each content slot
      for (const slot of config.dailyContent) {
        try {
          const topic = pickTopic(slot.topicPool, config.contentPillars);
          const aspectRatio = slot.aspectRatio || (slot.type === "story" || slot.type === "reel" ? "9:16" : "1:1");

          // Step 1: Generate text
          const generated = await generateContent({
            topic: `${slot.type.toUpperCase()}: ${topic}`,
            platform: (config.platform as "instagram") || "instagram",
            tone: (slot.tone as "professional") || "professional",
            contentPillars: config.contentPillars,
            businessContext: config.businessContext,
            language: config.language || "en",
            includeHashtags: true,
          });

          // Step 2: Generate image
          let imageUrl: string | undefined;
          let imageCost = 0;
          if (generated.imagePrompt) {
            const imageResult = await generateSocialImage(generated.imagePrompt, {
              aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:5",
            });
            if ("imageUrl" in imageResult) {
              imageUrl = imageResult.imageUrl;
              imageCost = imageResult.cost;
            } else {
              console.warn(`[scheduled-gen] Image failed for ${tenant.slug}/${slot.type}:`, imageResult.error);
            }
          }

          // Step 3: Save to DB
          const post = await prisma.contentPost.create({
            data: {
              userId,
              title: `[${slot.type}] ${topic}`,
              content: generated.text,
              type: "social",
              status: "pending_approval",
              platform: config.platform || "instagram",
              aiModel: generated.model,
              aiPrompt: topic,
              hashtags: generated.hashtags,
              mediaUrls: imageUrl ? [imageUrl] : undefined,
              approvalStatus: "pending",
              metadata: {
                contentType: slot.type,
                imagePrompt: generated.imagePrompt,
                characterCount: generated.characterCount,
                generationCost: imageCost,
                generatedAt: new Date().toISOString(),
                approverPhone: config.approverPhone,
                scheduledGeneration: true,
                tenantSlug: tenant.slug,
              },
            },
          });

          // Step 4: Sync to Aitable
          const aitableResult = await createContentRecord({
            title: `[${slot.type}] ${topic}`,
            content: generated.text,
            platform: (config.platform || "Instagram").charAt(0).toUpperCase() + (config.platform || "instagram").slice(1),
            status: "Pending Approval",
            contentType: slot.type,
            aiPrompt: topic,
            aiModel: generated.model,
            hashtags: generated.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h}`)).join(", "),
            imagePrompt: generated.imagePrompt || "",
            imageUrl: imageUrl || "",
            postgresId: post.id,
            characterCount: String(generated.characterCount),
            tone: (slot.tone || "professional").charAt(0).toUpperCase() + (slot.tone || "professional").slice(1),
            generationCost: imageCost > 0 ? `$${imageCost.toFixed(2)}` : "$0.00",
          });

          if (aitableResult.recordId) {
            await prisma.contentPost.update({
              where: { id: post.id },
              data: {
                metadata: {
                  ...(post.metadata as Record<string, unknown>),
                  aitableRecordId: aitableResult.recordId,
                },
              },
            });
          }

          // Step 5: Send for WhatsApp approval
          const approvalResult = await sendApprovalRequest({
            postId: post.id,
            approverPhone: config.approverPhone,
            platform: config.platform || "instagram",
            contentPreview: generated.text,
            imageUrl,
          });

          tenantResult.posts.push({
            type: slot.type,
            postId: post.id,
            status: approvalResult.sent ? "sent_for_approval" : `approval_failed: ${approvalResult.error}`,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[scheduled-gen] Error for ${tenant.slug}/${slot.type}:`, msg);
          tenantResult.errors.push(`${slot.type}: ${msg}`);
        }
      }

      results.push(tenantResult);
    }

    const totalPosts = results.reduce((sum, r) => sum + r.posts.length, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return NextResponse.json({
      ok: true,
      generated: totalPosts,
      errors: totalErrors,
      tenants: results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[scheduled-gen] Fatal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scheduled generation failed" },
      { status: 500 }
    );
  }
}

/** Pick a random topic from the pool, enriched with a random content pillar. */
function pickTopic(topicPool: string[], pillars: string[]): string {
  const topic = topicPool[Math.floor(Math.random() * topicPool.length)];
  const pillar = pillars[Math.floor(Math.random() * pillars.length)];
  return `${topic} — focusing on ${pillar}`;
}

/** Find any user associated with this tenant. */
async function findTenantUser(tenantId: string): Promise<string | null> {
  const tu = await prisma.tenantUser.findFirst({
    where: { tenantId },
    select: { userId: true },
  });
  return tu?.userId || null;
}

// Also support GET for Vercel cron (crons call GET by default)
export async function GET(request: NextRequest) {
  return POST(request);
}
