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

// PATCH /api/admin/capabilities/entity — toggle capability for a tenant
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const body = await req.json();
        const { capabilityId, tenantId, status, blockedReason, config, enabledBy } = body;

        if (!capabilityId || !status) {
            return NextResponse.json({ error: 'capabilityId and status are required' }, { status: 400 });
        }

        if (!['enabled', 'eligible', 'blocked', 'not_applicable'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Validate capability exists
        const capability = await prisma.capability.findUnique({ where: { id: capabilityId } });
        if (!capability) {
            return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
        }

        // Dependency check: if enabling, ensure all dependencies are enabled for this tenant
        if (status === 'enabled' && capability.dependencies.length > 0) {
            const depCapabilities = await prisma.capability.findMany({
                where: { name: { in: capability.dependencies } },
                select: { id: true, name: true },
            });

            const depIds = depCapabilities.map(d => d.id);
            const enabledDeps = await prisma.entityCapability.findMany({
                where: {
                    capabilityId: { in: depIds },
                    tenantId: tenantId || undefined,
                    status: 'enabled',
                },
            });

            const enabledDepIds = new Set(enabledDeps.map(d => d.capabilityId));
            const missingDeps = depCapabilities.filter(d => !enabledDepIds.has(d.id));

            if (missingDeps.length > 0) {
                return NextResponse.json({
                    error: `Missing dependencies: ${missingDeps.map(d => d.name).join(', ')}`,
                    missingDependencies: missingDeps.map(d => d.name),
                }, { status: 400 });
            }
        }

        const entityCapability = await prisma.entityCapability.upsert({
            where: {
                capabilityId_tenantId: {
                    capabilityId,
                    tenantId: tenantId || null,
                },
            },
            update: {
                status,
                blockedReason: status === 'blocked' ? blockedReason : null,
                config: config !== undefined ? config : undefined,
                enabledAt: status === 'enabled' ? new Date() : undefined,
                enabledBy: status === 'enabled' ? (enabledBy || 'admin') : undefined,
            },
            create: {
                capabilityId,
                tenantId: tenantId || null,
                status,
                blockedReason: status === 'blocked' ? blockedReason : null,
                config,
                enabledAt: status === 'enabled' ? new Date() : null,
                enabledBy: status === 'enabled' ? (enabledBy || 'admin') : null,
            },
        });

        return NextResponse.json({ success: true, entityCapability });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('PATCH /api/admin/capabilities/entity failed:', msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
