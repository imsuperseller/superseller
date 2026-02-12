import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, config } = body;

        if (!clientId || !config) {
            return NextResponse.json(
                { error: 'Missing required fields: clientId, config' },
                { status: 400 }
            );
        }
        try {
            await prisma.requirement.upsert({
                where: { id: clientId },
                update: {
                    metadata: config,
                    status: 'submitted',
                },
                create: {
                    id: clientId,
                    clientId,
                    type: 'onboarding',
                    metadata: config,
                    status: 'submitted',
                },
            });
        } catch (pgError) {
            // If demo mode and Postgres fails, allow passthrough
            if (clientId === 'demo-wizard' || clientId === 'demo-wizard-2') {
                console.log('[Mock DB] Saved demo config:', config);
                return NextResponse.json({ success: true, mode: 'demo' });
            }
            console.error('[Intake] Postgres save failed:', pgError);
        }
        // Trigger n8n Webhook (fire-and-forget)
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    timestamp: new Date().toISOString(),
                    config,
                    source: 'rensto_intake_wizard',
                }),
            })
                .then(res => {
                    if (!res.ok) console.error(`[Intake] n8n webhook failed: ${res.status} ${res.statusText}`);
                    else console.log(`[Intake] n8n webhook triggered successfully`);
                })
                .catch(err => console.error('[Intake] n8n webhook error:', err));
        } else {
            console.warn('[Intake] N8N_WEBHOOK_URL not set, skipping workflow trigger');
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Intake Error]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
