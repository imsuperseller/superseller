import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/app/approvals
 * Returns all approval requests for the authenticated client.
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

        const approvals = await prisma.approvalRequest.findMany({
            where: { clientId: session.clientId },
            orderBy: { requestedAt: 'desc' },
        });

        return NextResponse.json(approvals);
    } catch (error) {
        console.error('[Approvals API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch approvals' },
            { status: 500 }
        );
    }
}
