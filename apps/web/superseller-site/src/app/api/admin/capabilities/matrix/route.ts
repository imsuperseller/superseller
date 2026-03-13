import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

const CRON_SECRET = process.env.CRON_SECRET;

async function requireAdmin(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
        return { session: { isValid: true, role: 'admin' } };
    }
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { session };
}

// GET /api/admin/capabilities/matrix — full entity × capability grid
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const [tenants, capabilities, entityCapabilities] = await Promise.all([
            prisma.tenant.findMany({
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    settings: true,
                },
            }),
            prisma.capability.findMany({
                where: { status: { not: 'deprecated' } },
                orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
            }),
            prisma.entityCapability.findMany({
                select: {
                    id: true,
                    capabilityId: true,
                    tenantId: true,
                    status: true,
                    blockedReason: true,
                    config: true,
                    enabledAt: true,
                    enabledBy: true,
                },
            }),
        ]);

        // Build matrix: tenantId -> capabilityId -> EntityCapability
        const matrix: Record<string, Record<string, {
            id: string;
            status: string;
            blockedReason: string | null;
            config: unknown;
            enabledAt: Date | null;
            enabledBy: string | null;
        } | null>> = {};

        for (const t of tenants) {
            matrix[t.id] = {};
            for (const c of capabilities) {
                matrix[t.id][c.id] = null;
            }
        }

        for (const ec of entityCapabilities) {
            if (ec.tenantId && matrix[ec.tenantId]) {
                matrix[ec.tenantId][ec.capabilityId] = {
                    id: ec.id,
                    status: ec.status,
                    blockedReason: ec.blockedReason,
                    config: ec.config,
                    enabledAt: ec.enabledAt,
                    enabledBy: ec.enabledBy,
                };
            }
        }

        return NextResponse.json({
            success: true,
            tenants,
            capabilities,
            matrix,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('GET /api/admin/capabilities/matrix failed:', msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
