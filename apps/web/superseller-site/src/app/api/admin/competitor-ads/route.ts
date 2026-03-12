import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface CompetitorAdRow {
  id: string;
  tenant_id: string;
  ad_id: string | null;
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
  meta: unknown;
  created_at: string | null;
}

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    let rows: CompetitorAdRow[];
    if (tenantId) {
      rows = await prisma.$queryRawUnsafe<CompetitorAdRow[]>(
        `SELECT * FROM competitor_ads WHERE tenant_id = $1 ORDER BY created_at DESC`,
        tenantId
      );
    } else {
      rows = await prisma.$queryRawUnsafe<CompetitorAdRow[]>(
        `SELECT * FROM competitor_ads ORDER BY created_at DESC`
      );
    }

    const ads = rows.map(r => ({
      id: r.id,
      tenantId: r.tenant_id,
      adId: r.ad_id,
      pageName: r.page_name,
      adUrl: r.ad_url,
      adText: r.ad_text,
      adTitle: r.ad_title,
      imageUrl: r.image_url,
      videoUrl: r.video_url,
      ctaText: r.cta_text,
      startDate: r.start_date,
      platforms: r.platforms,
      liked: r.liked,
      feedbackNote: r.feedback_note,
      feedbackBy: r.feedback_by,
      feedbackAt: r.feedback_at,
      meta: r.meta,
      createdAt: r.created_at,
    }));

    const total = ads.length;
    const reviewed = ads.filter(a => a.liked !== null).length;
    const liked = ads.filter(a => a.liked === true).length;
    const disliked = ads.filter(a => a.liked === false).length;
    const pending = total - reviewed;

    return NextResponse.json({
      ads,
      summary: { total, reviewed, liked, disliked, pending },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[admin/competitor-ads] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch competitor ads', detail: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, liked, feedbackNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing ad id' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `UPDATE competitor_ads SET liked = $1, feedback_note = $2, feedback_by = $3, feedback_at = NOW() WHERE id = $4`,
      liked ?? null,
      feedbackNote ?? null,
      session.email || 'admin',
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[admin/competitor-ads] PATCH Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update ad', detail: error.message },
      { status: 500 }
    );
  }
}
