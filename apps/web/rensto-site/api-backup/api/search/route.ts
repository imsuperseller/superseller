import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchService } from '@/lib/search';
import { withRateLimit, searchRateLimiter } from '@/lib/rate-limiter';

async function searchHandler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const types = searchParams.get('types')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const organizationId = searchParams.get('orgId');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results = await searchService.globalSearch(query, {
      organizationId: organizationId || undefined,
      types,
      limit,
      offset,
    });

    return NextResponse.json({
      results,
      query,
      total: results.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(searchHandler, searchRateLimiter);
