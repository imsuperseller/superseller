import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import * as dbDashboard from '@/lib/db/dashboard';
export async function POST(req: Request) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { clientId, type, topic, platform } = body;

        if (!clientId || !type || !topic) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        let hasEntitlement = false;

        const pgUser = await prisma.user.findUnique({
            where: { id: clientId },
            select: { entitlements: true },
        });

        if (pgUser) {
            const ent = pgUser.entitlements as any;
            hasEntitlement = ent?.pillars?.includes('content') ?? false;
        }

        if (!hasEntitlement) {
            return NextResponse.json({
                error: 'Content entitlement required',
                upgradeUrl: '/pricing',
            }, { status: 403 });
        }
        const contentItem = await dbDashboard.createContentPost({
            userId: clientId,
            title: topic,
            type,
            status: 'draft',
            platform: platform || 'blog',
        });
        // Trigger n8n Content Engine
        const N8N_WEBHOOK_URL = 'https://n8n.rensto.com/webhook/content-engine-trigger';
        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId: contentItem.id,
                    clientId,
                    type,
                    topic,
                    platform,
                }),
            });
        } catch (webhookErr) {
            console.error('Failed to trigger n8n webhook:', webhookErr);
        }

        return NextResponse.json({
            success: true,
            contentId: contentItem.id,
            message: 'Content generation started',
        });

    } catch (err: any) {
        console.error('Content generation error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
