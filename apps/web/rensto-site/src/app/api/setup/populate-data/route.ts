import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

/**
 * POST /api/setup/populate-data
 * Admin-only: trigger data population for development/staging.
 * Currently a stub — returns success without action.
 */
export async function POST(req: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement actual data population when needed
    return NextResponse.json({
        success: true,
        message: 'Data population not yet implemented. Use Prisma seed scripts instead.',
    });
}
