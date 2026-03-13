import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

const CRON_SECRET = process.env.CRON_SECRET;

async function requireAdmin(req: NextRequest) {
    // Allow CRON_SECRET bearer token (for programmatic updates from CI/agents)
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

// GET /api/admin/projects — real Project table + live stats
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const type   = searchParams.get('type')   ?? undefined;
        const status = searchParams.get('status') ?? undefined;

        const [projects, stats] = await Promise.all([
            prisma.project.findMany({
                where: {
                    ...(type   ? { type }   : {}),
                    ...(status ? { status } : {}),
                },
                include: {
                    milestones: { orderBy: { order: 'asc' } },
                    tasks:      { orderBy: { order: 'asc' } },
                },
                orderBy: { updatedAt: 'desc' },
            }),
            prisma.project.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);

        const statsMap = stats.reduce<Record<string, number>>((acc, row) => {
            acc[row.status] = row._count.status;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            projects,
            stats: {
                active:    (statsMap['in_progress'] ?? 0) + (statsMap['verification'] ?? 0),
                blocked:   statsMap['blocked']   ?? 0,
                completed: statsMap['completed'] ?? 0,
                upcoming:  statsMap['planning']  ?? 0,
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/projects — create a new Project
export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const body = await req.json();
        const { name, description, type = 'internal', status = 'planning', progress = 0,
                pillar, owner, githubRepo, vercelProjectId, startDate, dueDate, metadata, outlookEventId } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'name is required' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name, description, type, status, progress, pillar, owner,
                githubRepo, vercelProjectId, metadata, outlookEventId,
                startDate: startDate ? new Date(startDate) : undefined,
                dueDate:   dueDate   ? new Date(dueDate)   : undefined,
            },
        });

        return NextResponse.json({ success: true, project }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/projects — update an existing Project
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.dueDate)   updates.dueDate   = new Date(updates.dueDate);

        const project = await prisma.project.update({ where: { id }, data: updates });
        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        if (error.code === 'P2025') return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        console.error('PATCH /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/projects — delete by id (cascades milestones + tasks)
export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth && auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 });

        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'P2025') return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        console.error('DELETE /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
