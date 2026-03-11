import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
export const dynamic = 'force-dynamic';

/** Raw follower row from follower_snapshots (Drizzle/worker table, read via raw SQL) */
interface FollowerRow {
  id: string;
  account_id: string;
  platform: string;
  source_handle: string;
  follower_id: string | null;
  follower_username: string | null;
  follower_name: string | null;
  profile_url: string | null;
  research_status: string | null;
  prospect_score: number | null;
  prospect_reasons: unknown;
  fit_score: number | null;
  warmth_tier: string | null;
  scraped_at: string;
  researched_at: string | null;
  profile_bio: string | null;
}

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || 'shai-personal-brand';
    const platform = searchParams.get('platform'); // optional: instagram | facebook
    const researchStatus = searchParams.get('researchStatus'); // optional: pending | done | skipped
    const minProspectScore = searchParams.get('minProspectScore'); // optional
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500);

    const conditions: string[] = ['account_id = $1'];
    const params: (string | number)[] = [accountId];
    let paramIdx = 2;

    if (platform) {
      conditions.push(`platform = $${paramIdx}`);
      params.push(platform);
      paramIdx++;
    }
    if (researchStatus) {
      conditions.push(`research_status = $${paramIdx}`);
      params.push(researchStatus);
      paramIdx++;
    }
    if (minProspectScore !== null && minProspectScore !== undefined && minProspectScore !== '') {
      conditions.push(`prospect_score >= $${paramIdx}`);
      params.push(parseInt(minProspectScore, 10));
      paramIdx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);
    const limitParam = params.length;

    const rows = await prisma.$queryRawUnsafe<FollowerRow[]>(
      `SELECT id, account_id, platform, source_handle, follower_id, follower_username, follower_name,
              profile_url, research_status, prospect_score, prospect_reasons, fit_score, warmth_tier,
              scraped_at, researched_at, profile_bio
       FROM follower_snapshots
       ${whereClause}
       ORDER BY prospect_score DESC NULLS LAST, scraped_at DESC
       LIMIT $${limitParam}`,
      ...params
    );

    const followers = rows.map(r => ({
      id: r.id,
      accountId: r.account_id,
      platform: r.platform,
      sourceHandle: r.source_handle,
      followerId: r.follower_id,
      followerUsername: r.follower_username,
      followerName: r.follower_name,
      profileUrl: r.profile_url,
      researchStatus: r.research_status,
      prospectScore: r.prospect_score,
      prospectReasons: r.prospect_reasons,
      fitScore: r.fit_score,
      warmthTier: r.warmth_tier,
      scrapedAt: r.scraped_at,
      researchedAt: r.researched_at,
      profileBio: r.profile_bio,
    }));

    // Summary counts
    const [totalRes, doneRes, prospectRes] = await Promise.all([
      prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*)::bigint as count FROM follower_snapshots WHERE account_id = $1`,
        accountId
      ),
      prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*)::bigint as count FROM follower_snapshots WHERE account_id = $1 AND research_status = 'done'`,
        accountId
      ),
      prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*)::bigint as count FROM follower_snapshots WHERE account_id = $1 AND prospect_score > 0`,
        accountId
      ),
    ]);

    return NextResponse.json({
      followers,
      summary: {
        total: Number(totalRes[0]?.count ?? 0),
        researched: Number(doneRes[0]?.count ?? 0),
        prospects: Number(prospectRes[0]?.count ?? 0),
      },
    });
  } catch (error) {
    console.error('Failed to fetch followers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    );
  }
}
