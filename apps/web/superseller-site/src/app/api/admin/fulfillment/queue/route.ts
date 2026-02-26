import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const [instances, onboardingRequests] = await Promise.all([
            prisma.serviceInstance.findMany({
                where: { status: 'pending_setup' },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.onboardingRequest.findMany({
                where: { status: 'submitted' },
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return NextResponse.json({ instances, onboardingRequests });
    } catch (error) {
        console.error('Error fetching fulfillment queue:', error);
        return NextResponse.json({ error: 'Failed to fetch fulfillment queue' }, { status: 500 });
    }
}
