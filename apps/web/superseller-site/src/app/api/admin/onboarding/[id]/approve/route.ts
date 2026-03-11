import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as dbAdmin from '@/lib/db/admin';
import { verifySession } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const pgOnboarding = await dbAdmin.getOnboardingRequest(id);
        if (!pgOnboarding) {
            return NextResponse.json({ error: 'Onboarding request not found' }, { status: 404 });
        }
        const onboardingData = pgOnboarding as any;
        const clientId = onboardingData.createdByUid || onboardingData.userId || id;

        // Create/update client record in Postgres
        await prisma.user.upsert({
            where: { id: clientId },
            create: {
                id: clientId,
                email: onboardingData.contactEmail || `${clientId}@unknown.com`,
                name: onboardingData.orgName,
                status: 'active',
            },
            update: {
                name: onboardingData.orgName,
                status: 'active',
            },
        });

        await dbAdmin.updateOnboardingRequest(id, {
            status: 'approved',
            approvedAt: new Date(),
        });
        return NextResponse.json({ success: true, message: 'Onboarding approved and client activated' });

    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
