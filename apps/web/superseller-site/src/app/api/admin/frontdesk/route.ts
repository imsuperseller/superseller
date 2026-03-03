import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

/**
 * GET /api/admin/frontdesk?clientId=xxx
 * List all FrontDesk configs, or a specific client's config.
 */
export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    try {
        if (clientId) {
            const config = await prisma.secretaryConfig.findFirst({
                where: { clientId },
            });
            return NextResponse.json({ config });
        }

        const configs = await prisma.secretaryConfig.findMany({
            where: { telnyxAssistantId: { not: null } },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ configs });
    } catch (error) {
        console.error('Error fetching FrontDesk configs:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

/**
 * POST /api/admin/frontdesk
 * Provision a FrontDesk for a client. Creates/updates SecretaryConfig with Telnyx fields.
 * Body: { clientId, agentName, greeting, tone, businessContext, transferNumber,
 *         telnyxAssistantId, telnyxPhoneNumberId, phoneNumber }
 */
export async function POST(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { clientId, ...fields } = data;

        if (!clientId) {
            return NextResponse.json({ error: 'clientId required' }, { status: 400 });
        }

        // Upsert: create or update
        const existing = await prisma.secretaryConfig.findFirst({ where: { clientId } });

        if (existing) {
            const updated = await prisma.secretaryConfig.update({
                where: { id: existing.id },
                data: {
                    agentName: fields.agentName ?? existing.agentName,
                    greeting: fields.greeting ?? existing.greeting,
                    tone: fields.tone ?? existing.tone,
                    businessContext: fields.businessContext ?? existing.businessContext,
                    phoneNumber: fields.phoneNumber ?? existing.phoneNumber,
                    transferNumber: fields.transferNumber ?? existing.transferNumber,
                    telnyxAssistantId: fields.telnyxAssistantId ?? existing.telnyxAssistantId,
                    telnyxPhoneNumberId: fields.telnyxPhoneNumberId ?? existing.telnyxPhoneNumberId,
                    availability: fields.availability ?? existing.availability,
                },
            });
            return NextResponse.json({ success: true, config: updated });
        }

        const created = await prisma.secretaryConfig.create({
            data: {
                clientId,
                agentName: fields.agentName || 'FrontDesk AI',
                greeting: fields.greeting || 'Hello! How can I help you today?',
                tone: fields.tone || 'professional',
                businessContext: fields.businessContext || '',
                phoneNumber: fields.phoneNumber || null,
                transferNumber: fields.transferNumber || null,
                telnyxAssistantId: fields.telnyxAssistantId || null,
                telnyxPhoneNumberId: fields.telnyxPhoneNumberId || null,
                availability: fields.availability || { enabled: true, hours: '24/7' },
            },
        });
        return NextResponse.json({ success: true, config: created });
    } catch (error) {
        console.error('Failed to provision FrontDesk:', error);
        return NextResponse.json({ error: 'Failed to provision' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/frontdesk
 * Update a FrontDesk config.
 * Body: { id, ...fieldsToUpdate }
 */
export async function PATCH(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await req.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const updated = await prisma.secretaryConfig.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json({ success: true, config: updated });
    } catch (error) {
        console.error('Failed to update FrontDesk config:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/frontdesk?id=xxx
 * Remove a FrontDesk config.
 */
export async function DELETE(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        await prisma.secretaryConfig.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete FrontDesk config:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
