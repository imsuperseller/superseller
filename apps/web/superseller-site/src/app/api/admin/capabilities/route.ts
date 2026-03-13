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

// GET /api/admin/capabilities — list all capabilities with entity status counts
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category') ?? undefined;
        const status = searchParams.get('status') ?? undefined;

        const capabilities = await prisma.capability.findMany({
            where: {
                ...(category ? { category } : {}),
                ...(status ? { status } : {}),
            },
            include: {
                entityCapabilities: {
                    select: { id: true, tenantId: true, status: true },
                },
            },
            orderBy: [{ category: 'asc' }, { displayName: 'asc' }],
        });

        const enriched = capabilities.map(cap => {
            const statusCounts = cap.entityCapabilities.reduce<Record<string, number>>((acc, ec) => {
                acc[ec.status] = (acc[ec.status] || 0) + 1;
                return acc;
            }, {});
            return { ...cap, statusCounts };
        });

        return NextResponse.json({ success: true, capabilities: enriched });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('GET /api/admin/capabilities failed:', msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

// POST /api/admin/capabilities — create a new capability
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const body = await req.json();
        const { name, displayName, category, type, description, configSchema, dependencies, filePaths, status } = body;

        if (!name || !displayName || !category || !type) {
            return NextResponse.json({ error: 'name, displayName, category, type are required' }, { status: 400 });
        }

        const capability = await prisma.capability.create({
            data: {
                name,
                displayName,
                description,
                category,
                type,
                status: status || 'active',
                configSchema,
                dependencies: dependencies || [],
                filePaths: filePaths || [],
            },
        });

        return NextResponse.json({ success: true, capability }, { status: 201 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('POST /api/admin/capabilities failed:', msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}

// PATCH /api/admin/capabilities — update an existing capability
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const capability = await prisma.capability.update({ where: { id }, data: updates });
        return NextResponse.json({ success: true, capability });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        if ((error as { code?: string }).code === 'P2025') {
            return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
        }
        console.error('PATCH /api/admin/capabilities failed:', msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
}
