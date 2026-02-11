import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// [MIGRATION] Phase 3: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { ServiceInstance } from '@/types/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { emails } from '@/lib/email';
import { AITableService } from '@/lib/services/AITableService';
import * as dbServices from '@/lib/db/services';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

const N8N_FULFILLMENT_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/fulfillment-orchestrator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, clientEmail, productId, productName, configuration, paymentIntentId } = body;

        if (!clientId || !productId || !configuration) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // [MIGRATION] Phase 3: Create service instance in Postgres (primary)
        const instance = await dbServices.createServiceInstance({
            clientId,
            clientEmail: clientEmail || '',
            productId,
            productName: productName || productId,
            status: 'configuring',
            configuration,
            adminNotes: paymentIntentId ? `Paid via ${paymentIntentId}` : 'Manual initiation',
        });
        const instanceId = instance.id;

        // Backup: Firestore
        await firestoreBackupWrite('fulfillment/initiate', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.SERVICE_INSTANCES).doc(instanceId).set({
                id: instanceId,
                clientId,
                clientEmail: clientEmail || '',
                productId,
                productName: productName || productId,
                status: 'configuring',
                configuration,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                adminNotes: paymentIntentId ? `Paid via ${paymentIntentId}` : 'Manual initiation',
            });
        });

        // 2. Identify n8n Entry Point based on Product ID
        const products = await AITableService.getProducts();
        const aitProduct = products.find((p: any) => (p['Product ID'] || p.id) === productId);

        let targetWebhook = aitProduct?.['n8n Webhook'] || aitProduct?.n8nWorkflowId || N8N_FULFILLMENT_WEBHOOK;
        if (targetWebhook && !targetWebhook.startsWith('http')) {
            targetWebhook = `https://n8n.rensto.com/webhook/${targetWebhook}`;
        }

        // 3. Trigger N8N Fulfillment Orchestrator
        try {
            await fetch(targetWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'service_configuration_submitted',
                    instanceId,
                    clientId,
                    clientEmail,
                    productId,
                    productName,
                    config: configuration,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (webhookError) {
            console.error('Failed to trigger fulfillment webhook:', webhookError);
        }

        // 4. Send fulfillment started email
        if (clientEmail) {
            try {
                await emails.fulfillmentStarted(clientEmail, clientId, productName || 'Rensto Service');
            } catch (emailError) {
                console.error('Failed to send fulfillment email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            instanceId,
            message: 'Service instance created and fulfillment initiated.',
        });

    } catch (error: any) {
        console.error('Error initiating fulfillment:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
