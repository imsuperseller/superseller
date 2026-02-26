import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/app/approvals/[id]/respond
 * Approve or reject an approval request (ownership-checked).
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifySession();

        if (!session.isValid || !session.clientId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { status } = await request.json();

        if (status !== 'approved' && status !== 'rejected') {
            return NextResponse.json(
                { error: 'Status must be "approved" or "rejected"' },
                { status: 400 }
            );
        }

        const { id } = await params;

        // Ownership check: must belong to this client
        const approval = await prisma.approvalRequest.findFirst({
            where: { id, clientId: session.clientId },
        });

        if (!approval) {
            return NextResponse.json(
                { error: 'Approval request not found' },
                { status: 404 }
            );
        }

        await prisma.approvalRequest.update({
            where: { id },
            data: { status, respondedAt: new Date() },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Approvals Respond API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to update approval' },
            { status: 500 }
        );
    }
}
