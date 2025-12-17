import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

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

        const db = getFirestoreAdmin();
        const clientRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(clientId);

        // Verify client exists
        let clientExists = false;
        try {
            const clientDoc = await clientRef.get();
            clientExists = clientDoc.exists;
        } catch (readError) {
            console.warn('[Intake] DB Read Failed (Mock Mode)', readError);
        }

        if (!clientExists) {
            if (clientId === 'demo-wizard' || clientId === 'demo-wizard-2') {
                console.log('[Mock DB] Saved demo config:', config);
                return NextResponse.json({ success: true, mode: 'demo' });
            }
        }

        // Save configuration to Firestore
        try {
            await clientRef.set({
                onboardingConfig: config,
                status: 'onboarding_submitted',
                updatedAt: FieldValue.serverTimestamp(),
                // Add initial fields if creating new
                ...(clientExists ? {} : {
                    createdAt: FieldValue.serverTimestamp(),
                    id: clientId
                })
            }, { merge: true });

            console.log(`[Intake] Configuration saved for client ${clientId}`);
        } catch (dbError) {
            console.warn('[Intake] Firestore save failed (likely missing credentials). Proceeding in mock mode.');
            console.error(dbError);
            // In dev, we allow continuing even if DB fails
        }

        // Trigger n8n Webhook (Fire-and-forget pattern)
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    timestamp: new Date().toISOString(),
                    config,
                    source: 'rensto_intake_wizard'
                })
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
