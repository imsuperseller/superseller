import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tenantId } = await params;
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    try {
        let changeRequests: any[];

        if (statusFilter) {
            changeRequests = await prisma.$queryRaw`
                SELECT *
                FROM change_requests
                WHERE tenant_id = ${tenantId}
                AND status = ${statusFilter}
                ORDER BY created_at DESC
            `;
        } else {
            changeRequests = await prisma.$queryRaw`
                SELECT *
                FROM change_requests
                WHERE tenant_id = ${tenantId}
                ORDER BY created_at DESC
            `;
        }

        // Compute total cost for completed/approved requests
        const costResult: any[] = await prisma.$queryRaw`
            SELECT COALESCE(SUM(estimated_cost_cents), 0) AS total_cost
            FROM change_requests
            WHERE tenant_id = ${tenantId}
            AND status IN ('completed', 'approved')
        `;
        const totalCostCents = Number(costResult[0]?.total_cost ?? 0);

        return NextResponse.json({ changeRequests, totalCostCents });
    } catch (error) {
        console.error('Error fetching change requests:', error);
        return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
    }
}
