
import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { instanceId, n8nWorkflowId, adminNotes } = body;

        if (!instanceId || !n8nWorkflowId) {
            return NextResponse.json(
                { error: 'Missing instance ID or N8N Workflow ID' },
                { status: 400 }
            );
        }

        const db = getFirestoreAdmin();
        const instanceRef = db.collection(COLLECTIONS.SERVICE_INSTANCES).doc(instanceId);

        const doc = await instanceRef.get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
        }

        await instanceRef.update({
            n8nWorkflowId,
            status: 'active',
            activatedAt: FieldValue.serverTimestamp(),
            adminNotes: adminNotes || doc.data()?.adminNotes || '',
            updatedAt: FieldValue.serverTimestamp()
        });

        // Trigger Activation Notification via N8N/Webhook
        const N8N_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/fulfillment-orchestrator';
        try {
            await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'service_activated',
                    instanceId,
                    clientId: doc.data()?.clientId,
                    clientEmail: doc.data()?.clientEmail,
                    productName: doc.data()?.productName,
                    n8nWorkflowId,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            console.warn('Failed to trigger activation webhook:', e);
        }

        return NextResponse.json({
            success: true,
            message: 'Service instance activated successfully.'
        });

    } catch (error) {
        console.error('Error finalizing fulfillment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
