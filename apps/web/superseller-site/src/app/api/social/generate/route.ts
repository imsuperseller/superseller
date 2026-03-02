/**
 * POST /api/social/generate
 * Full pipeline: AI text → AI image → Save to Postgres + Aitable → WAHA approval
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContent } from "@/lib/services/social/content-generator";
import { generateSocialImage } from "@/lib/services/social/image-generator";
import { sendApprovalRequest } from "@/lib/services/social/approval-flow";
import { createContentRecord } from "@/lib/services/social/aitable-sync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      topic,
      platform = "facebook",
      tone = "professional",
      contentPillars,
      businessContext,
      language = "en",
      approverPhone, // If provided, auto-send for WAHA approval
      platformAccountId,
      generateImage = true, // Generate AI image by default
      imageAspectRatio = "1:1", // 1:1, 16:9, 9:16, 4:5
    } = body;

    if (!userId || !topic) {
      return NextResponse.json(
        { error: "userId and topic are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 1: Generate text content via Claude
    const generated = await generateContent({
      topic,
      platform,
      tone,
      contentPillars,
      businessContext:
        businessContext || `${user.businessName || "SuperSeller AI"} — AI automation agency`,
      language,
      includeHashtags: true,
    });

    // Step 2: Generate image via Kie.AI (if requested and we have an image prompt)
    let imageUrl: string | undefined;
    let imageCost = 0;
    if (generateImage && generated.imagePrompt) {
      const imageResult = await generateSocialImage(generated.imagePrompt, {
        aspectRatio: imageAspectRatio,
      });

      if ("imageUrl" in imageResult) {
        imageUrl = imageResult.imageUrl;
        imageCost = imageResult.cost;
      } else {
        console.warn("[social/generate] Image generation failed:", imageResult.error);
        // Continue without image — text post is still valid
      }
    }

    const contentType = imageUrl ? "Image Post" : "Text Only";
    const status = approverPhone ? "pending_approval" : "draft";

    // Step 3: Save to Postgres
    const post = await prisma.contentPost.create({
      data: {
        userId,
        title: topic,
        content: generated.text,
        type: "social",
        status,
        platform,
        aiModel: generated.model,
        aiPrompt: topic,
        hashtags: generated.hashtags,
        mediaUrls: imageUrl ? [imageUrl] : undefined,
        approvalStatus: approverPhone ? "pending" : null,
        platformAccountId: platformAccountId || null,
        metadata: {
          imagePrompt: generated.imagePrompt,
          characterCount: generated.characterCount,
          contentType,
          generationCost: imageCost,
          generatedAt: new Date().toISOString(),
          ...(approverPhone ? { approverPhone } : {}),
        },
      },
    });

    // Step 4: Sync to Aitable dashboard
    const aitableResult = await createContentRecord({
      title: topic,
      content: generated.text,
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      status: approverPhone ? "Pending Approval" : "Draft",
      contentType,
      aiPrompt: topic,
      aiModel: generated.model,
      hashtags: generated.hashtags.map((h: string) => (h.startsWith("#") ? h : `#${h}`)).join(", "),
      imagePrompt: generated.imagePrompt || "",
      imageUrl: imageUrl || "",
      postgresId: post.id,
      characterCount: String(generated.characterCount),
      tone: tone.charAt(0).toUpperCase() + tone.slice(1),
      generationCost: imageCost > 0 ? `$${imageCost.toFixed(2)}` : "$0.00",
    });

    // Store Aitable record ID in Postgres metadata for future sync
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

    // Step 5: Send for WhatsApp approval if phone provided
    let approvalResult = null;
    if (approverPhone) {
      approvalResult = await sendApprovalRequest({
        postId: post.id,
        approverPhone,
        platform,
        contentPreview: generated.text,
        imageUrl,
      });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        status: post.status,
        platform: post.platform,
        contentType,
      },
      generated: {
        text: generated.text,
        hashtags: generated.hashtags,
        imagePrompt: generated.imagePrompt,
        imageUrl,
        characterCount: generated.characterCount,
      },
      aitable: {
        recordId: aitableResult.recordId,
        error: aitableResult.error,
      },
      approval: approvalResult,
    });
  } catch (err) {
    console.error("[social/generate] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
