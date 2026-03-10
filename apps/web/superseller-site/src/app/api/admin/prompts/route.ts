import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return null;
    }
    return session;
}

/**
 * GET /api/admin/prompts
 * Query params: ?service=videoforge  (optional filter)
 * Returns all prompt configs, ordered by service + key + version desc.
 */
export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const service = searchParams.get('service');

        const prompts = await prisma.promptConfig.findMany({
            where: service ? { service } : undefined,
            orderBy: [
                { service: 'asc' },
                { promptKey: 'asc' },
                { version: 'desc' },
            ],
        });

        return NextResponse.json({ prompts });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

/**
 * POST /api/admin/prompts
 * Create a new prompt config version.
 * Body: { service, promptKey, template, metadata? }
 * Automatically increments version and deactivates previous active version.
 */
export async function POST(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { service, promptKey, template, metadata } = await req.json();

        if (!service || !promptKey || !template) {
            return NextResponse.json(
                { error: 'service, promptKey, and template are required' },
                { status: 400 }
            );
        }

        // Find current max version for this service+key
        const existing = await prisma.promptConfig.findFirst({
            where: { service, promptKey },
            orderBy: { version: 'desc' },
        });

        const nextVersion = existing ? existing.version + 1 : 1;

        // Deactivate all current active versions for this service+key
        await prisma.promptConfig.updateMany({
            where: { service, promptKey, isActive: true },
            data: { isActive: false },
        });

        // Create new version
        const created = await prisma.promptConfig.create({
            data: {
                service,
                promptKey,
                template,
                version: nextVersion,
                isActive: true,
                metadata: metadata || null,
            },
        });

        return NextResponse.json({ success: true, prompt: created });
    } catch (error) {
        console.error('Error creating prompt:', error);
        return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/prompts
 * Update an existing prompt config (template, metadata, isActive).
 * Body: { id, template?, metadata?, isActive? }
 */
export async function PATCH(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, template, metadata, isActive } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const updateData: Record<string, any> = {};
        if (template !== undefined) updateData.template = template;
        if (metadata !== undefined) updateData.metadata = metadata;
        if (isActive !== undefined) updateData.isActive = isActive;

        // If activating this version, deactivate others for the same service+key
        if (isActive === true) {
            const target = await prisma.promptConfig.findUnique({ where: { id } });
            if (target) {
                await prisma.promptConfig.updateMany({
                    where: {
                        service: target.service,
                        promptKey: target.promptKey,
                        isActive: true,
                        NOT: { id },
                    },
                    data: { isActive: false },
                });
            }
        }

        const updated = await prisma.promptConfig.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, prompt: updated });
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/prompts?id=xxx
 * Hard-delete a prompt config version.
 */
export async function DELETE(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
        }

        await prisma.promptConfig.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }
}
