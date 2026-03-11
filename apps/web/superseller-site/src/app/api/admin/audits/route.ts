import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

async function requireAdmin() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { session };
}

// GET /api/admin/audits — list templates or instances
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if ('error' in auth && auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') ?? 'templates';

    try {
        if (view === 'instances') {
            const instances = await prisma.auditInstance.findMany({
                include: {
                    template: { select: { name: true, version: true } },
                    project:  { select: { name: true, type: true } },
                    _count:   { select: { responses: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            return NextResponse.json({ success: true, instances });
        }

        const templates = await prisma.auditTemplate.findMany({
            include: {
                sections: {
                    include: { _count: { select: { items: true } } },
                    orderBy: { order: 'asc' },
                },
                _count: { select: { instances: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({ success: true, templates });
    } catch (error: any) {
        console.error('GET /api/admin/audits failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/audits — create an AuditInstance for a project
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if ('error' in auth && auth.error) return auth.error;

    try {
        const { templateId, projectId, label } = await req.json();
        if (!templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 });

        const instance = await prisma.auditInstance.create({
            data: { templateId, projectId, label },
        });

        return NextResponse.json({ success: true, instance }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/audits failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
