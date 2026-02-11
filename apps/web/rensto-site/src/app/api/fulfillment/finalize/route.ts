import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// [MIGRATION] Phase 3: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { emails } from '@/lib/email';
import * as dbServices from '@/lib/db/services';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

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

        // [MIGRATION] Phase 3: Read + update in Postgres (primary)
        const instance = await dbServices.getServiceInstance(instanceId);

        if (!instance) {
            // Fallback: check Firestore
            const db = getFirestoreAdmin();
            const doc = await db.collection(COLLECTIONS.SERVICE_INSTANCES).doc(instanceId).get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
            }
            // Firestore-only instance -- update there and return
            await db.collection(COLLECTIONS.SERVICE_INSTANCES).doc(instanceId).update({
                n8nWorkflowId,
                status: 'active',
                activatedAt: FieldValue.serverTimestamp(),
                adminNotes: adminNotes || doc.data()?.adminNotes || '',
                updatedAt: FieldValue.serverTimestamp(),
            });
            const clientEmail = doc.data()?.clientEmail;
            if (clientEmail) {
                try {
                    await emails.fulfillmentComplete(clientEmail, doc.data()?.clientId || 'Valued Customer', doc.data()?.productName || 'Rensto Service', `https://rensto.com/dashboard/${doc.data()?.clientId}`);
                } catch (e) { console.error('Email error:', e); }
            }
            return NextResponse.json({ success: true, message: 'Service instance activated (Firestore fallback).' });
        }

        // Postgres update
        await dbServices.updateServiceInstance(instanceId, {
            n8nWorkflowId,
            status: 'active',
            activatedAt: new Date(),
            adminNotes: adminNotes || instance.adminNotes || '',
        });

        // Backup: Firestore
        await firestoreBackupWrite('fulfillment/finalize', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.SERVICE_INSTANCES).doc(instanceId).set({
                n8nWorkflowId,
                status: 'active',
                activatedAt: FieldValue.serverTimestamp(),
                adminNotes: adminNotes || instance.adminNotes || '',
                updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        // Trigger Activation Notification via N8N
        const N8N_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/fulfillment-orchestrator';
        try {
            await fetch(N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'service_activated',
                    instanceId,
                    clientId: instance.clientId,
                    clientEmail: instance.clientEmail,
                    productName: instance.productName,
                    n8nWorkflowId,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (e) {
            console.warn('Failed to trigger activation webhook:', e);
        }

        // Send fulfillment complete email
        if (instance.clientEmail) {
            try {
                await emails.fulfillmentComplete(
                    instance.clientEmail,
                    instance.clientId || 'Valued Customer',
                    instance.productName || 'Rensto Service',
                    `https://rensto.com/dashboard/${instance.clientId}`
                );
            } catch (emailError) {
                console.error('Failed to send fulfillment complete email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Service instance activated successfully.',
        });

    } catch (error) {
        console.error('Error finalizing fulfillment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
