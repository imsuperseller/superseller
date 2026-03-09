/**
 * Competitor Ads API — public endpoints for tenant ad research.
 *
 * GET  /api/compete/ads/[tenantSlug]  → list ads for tenant (with longevity + AI analysis)
 * PATCH /api/compete/ads/[tenantSlug] → rate an ad (liked/disliked + feedback)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Longevity tier thresholds (days running → tier name)
function longevityTier(days: number | null): string | null {
  if (days === null || days < 14) return null; // still testing
  if (days >= 90) return "evergreen";
  if (days >= 60) return "winner";
  if (days >= 30) return "strong";
  return "promising";
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  if (!tenantSlug || tenantSlug.length > 100) {
    return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
  }

  try {
    const ads = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        page_name: string | null;
        ad_url: string | null;
        ad_text: string | null;
        ad_title: string | null;
        image_url: string | null;
        video_url: string | null;
        cta_text: string | null;
        start_date: string | null;
        platforms: unknown;
        liked: boolean | null;
        feedback_note: string | null;
        feedback_by: string | null;
        feedback_at: string | null;
        meta: Record<string, unknown> | null;
        created_at: string;
      }>
    >(
      `SELECT id, page_name, ad_url, ad_text, ad_title, image_url, video_url,
              cta_text, start_date, platforms, liked, feedback_note, feedback_by,
              feedback_at, meta, created_at
       FROM competitor_ads
       WHERE tenant_id = $1
       ORDER BY
         CASE WHEN liked IS NULL THEN 0 ELSE 1 END,
         created_at DESC`,
      tenantSlug
    );

    const now = Date.now();

    const mapped = ads.map((a) => {
      // Calculate days running from start_date
      let daysRunning: number | null = null;
      if (a.start_date) {
        const startMs = new Date(a.start_date).getTime();
        if (!isNaN(startMs)) {
          daysRunning = Math.floor((now - startMs) / (1000 * 60 * 60 * 24));
        }
      }

      // Extract AI analysis from meta if present
      const meta = (a.meta || {}) as Record<string, unknown>;
      const aiAnalysis = meta.aiAnalysis as Record<string, unknown> | undefined;

      return {
        id: a.id,
        pageName: a.page_name,
        adUrl: a.ad_url,
        adText: a.ad_text,
        adTitle: a.ad_title,
        imageUrl: a.image_url,
        videoUrl: a.video_url,
        ctaText: a.cta_text,
        startDate: a.start_date,
        platforms: a.platforms,
        liked: a.liked,
        feedbackNote: a.feedback_note,
        feedbackBy: a.feedback_by,
        feedbackAt: a.feedback_at,
        createdAt: a.created_at,
        daysRunning,
        longevityTier: longevityTier(daysRunning),
        aiAnalysis: aiAnalysis
          ? {
              hookType: aiAnalysis.hookType as string | undefined,
              angle: aiAnalysis.angle as string | undefined,
              emotionalTone: aiAnalysis.emotionalTone as string | undefined,
              visualStyle: aiAnalysis.visualStyle as string | undefined,
              overallScore: aiAnalysis.overallScore as number | undefined,
            }
          : null,
      };
    });

    const reviewed = mapped.filter((a) => a.liked !== null).length;

    return NextResponse.json({
      ads: mapped,
      total: mapped.length,
      reviewed,
      pending: mapped.length - reviewed,
      tiers: {
        evergreen: mapped.filter((a) => a.longevityTier === "evergreen").length,
        winner: mapped.filter((a) => a.longevityTier === "winner").length,
        strong: mapped.filter((a) => a.longevityTier === "strong").length,
        promising: mapped.filter((a) => a.longevityTier === "promising").length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/compete/ads error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> }
) {
  const { tenantSlug } = await params;
  if (!tenantSlug || tenantSlug.length > 100) {
    return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
  }

  let body: { adId?: string; liked?: boolean | null; feedbackNote?: string; feedbackBy?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { adId, liked, feedbackNote, feedbackBy } = body;
  if (!adId || typeof adId !== "string") {
    return NextResponse.json({ error: "adId is required" }, { status: 400 });
  }

  const note = feedbackNote ? String(feedbackNote).slice(0, 2000) : null;
  const by = feedbackBy ? String(feedbackBy).slice(0, 100) : null;

  try {
    const updated = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        ad_text: string | null;
        ad_title: string | null;
        image_url: string | null;
        video_url: string | null;
        liked: boolean | null;
        feedback_note: string | null;
        feedback_by: string | null;
        feedback_at: string | null;
      }>
    >(
      `UPDATE competitor_ads
       SET liked = $1, feedback_note = $2, feedback_by = $3, feedback_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING id, ad_text, ad_title, image_url, video_url, liked, feedback_note, feedback_by, feedback_at`,
      liked ?? null,
      note,
      by,
      adId,
      tenantSlug
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const a = updated[0];
    return NextResponse.json({
      ad: {
        id: a.id,
        adText: a.ad_text,
        adTitle: a.ad_title,
        imageUrl: a.image_url,
        videoUrl: a.video_url,
        liked: a.liked,
        feedbackNote: a.feedback_note,
        feedbackBy: a.feedback_by,
        feedbackAt: a.feedback_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("PATCH /api/compete/ads error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
