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

// GET /api/admin/audits/[instanceId]/responses — full audit with progress
export async function GET(req: NextRequest, { params }: { params: Promise<{ instanceId: string }> }) {
    const auth = await requireAdmin();
    if ('error' in auth && auth.error) return auth.error;

    const { instanceId } = await params;

    try {
        const instance = await prisma.auditInstance.findUnique({
            where: { id: instanceId },
            include: {
                template: {
                    include: {
                        sections: {
                            include: { items: { orderBy: { order: 'asc' } } },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                responses: true,
            },
        });

        if (!instance) return NextResponse.json({ error: 'AuditInstance not found' }, { status: 404 });

        const responseMap = instance.responses.reduce<Record<string, typeof instance.responses[0]>>(
            (acc, r) => { acc[r.itemId] = r; return acc; }, {}
        );

        let totalItems = 0, completedItems = 0;
        const sectionsWithProgress = instance.template.sections.map(section => {
            const done = section.items.filter(item => responseMap[item.id]?.status === 'complete').length;
            totalItems += section.items.length;
            completedItems += done;
            return { ...section, progress: section.items.length > 0 ? Math.round((done / section.items.length) * 100) : 0 };
        });

        return NextResponse.json({
            success: true,
            instance: {
                ...instance,
                template: { ...instance.template, sections: sectionsWithProgress },
                responseMap,
                overallProgress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
            },
        });
    } catch (error: any) {
        console.error('GET responses failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/audits/[instanceId]/responses — upsert a single response
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ instanceId: string }> }) {
    const auth = await requireAdmin();
    if ('error' in auth && auth.error) return auth.error;

    const { instanceId } = await params;

    try {
        const { itemId, status, answer, notes } = await req.json();
        if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 });

        const response = await prisma.auditResponse.upsert({
            where:  { instanceId_itemId: { instanceId, itemId } },
            update: { status, answer, notes },
            create: { instanceId, itemId, status, answer, notes },
        });

        return NextResponse.json({ success: true, response });
    } catch (error: any) {
        console.error('PATCH responses failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
