import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/app/runs
 * Returns the last 50 usage logs (agent runs) for the authenticated client.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await verifySession();

        if (!session.isValid || !session.clientId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const runs = await prisma.usageLog.findMany({
            where: { clientId: session.clientId! },
            orderBy: { startedAt: 'desc' },
            take: 50,
        });

        return NextResponse.json(runs);
    } catch (error) {
        console.error('[Runs API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch runs' },
            { status: 500 }
        );
    }
}
