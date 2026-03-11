import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Raw row from audience_insights (Drizzle/worker table, read via raw SQL) */
interface AudienceInsightRow {
  id: string;
  account_id: string;
  platform: string;
  scraped_at: string | null;
  segments: unknown;
  top_products: unknown;
  messaging_angles: unknown;
  created_at: string | null;
}

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || 'shai-personal-brand';

    const rows = await prisma.$queryRawUnsafe<AudienceInsightRow[]>(
      `SELECT id, account_id, platform, scraped_at, segments, top_products, messaging_angles, created_at
       FROM audience_insights
       WHERE account_id = $1
       ORDER BY platform, created_at DESC`,
      accountId
    );

    const insights = rows.map(r => ({
      id: r.id,
      accountId: r.account_id,
      platform: r.platform,
      scrapedAt: r.scraped_at,
      segments: r.segments,
      topProducts: r.top_products,
      messagingAngles: r.messaging_angles,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Failed to fetch audience insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audience insights' },
      { status: 500 }
    );
  }
}
