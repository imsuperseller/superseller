import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { ServiceInstance } from '@/types/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { emails } from '@/lib/email';

// In production, this would be an env var
const N8N_FULFILLMENT_WEBHOOK = process.env.N8N_FULFILLMENT_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/fulfillment-orchestrator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId, clientEmail, productId, productName, configuration, paymentIntentId } = body;

        // Basic validation
        if (!clientId || !productId || !configuration) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = getFirestoreAdmin();
        const instancesRef = db.collection(COLLECTIONS.SERVICE_INSTANCES);

        // 1. Create/Update the Service Instance record
        const newInstance: Omit<ServiceInstance, 'id'> = {
            clientId,
            clientEmail: clientEmail || '',
            productId,
            productName: productName || productId,
            status: 'configuring',
            configuration,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            adminNotes: paymentIntentId ? `Paid via ${paymentIntentId}` : 'Manual initiation'
        };

        const docRef = await instancesRef.add(newInstance);
        const instanceId = docRef.id;

        // 2. Identify n8n Entry Point based on Product ID
        const configWebhooks: Record<string, string> = {
            'lead-machine': process.env.N8N_LEAD_MACHINE_INIT_WEBHOOK || N8N_FULFILLMENT_WEBHOOK,
            'autonomous-secretary': process.env.N8N_SECRETARY_INIT_WEBHOOK || N8N_FULFILLMENT_WEBHOOK,
            'knowledge-engine': process.env.N8N_KNOWLEDGE_INIT_WEBHOOK || N8N_FULFILLMENT_WEBHOOK,
            'content-engine': process.env.N8N_CONTENT_INIT_WEBHOOK || N8N_FULFILLMENT_WEBHOOK,
        };

        const targetWebhook = configWebhooks[productId] || N8N_FULFILLMENT_WEBHOOK;

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
                    timestamp: new Date().toISOString()
                })
            });
        } catch (webhookError) {
            console.error('Failed to trigger fulfillment webhook:', webhookError);
        }

        // 3. Send fulfillment started email
        if (clientEmail) {
            try {
                await emails.fulfillmentStarted(
                    clientEmail,
                    clientId, // Using clientId as name fallback
                    productName || 'Rensto Service'
                );
            } catch (emailError) {
                console.error('Failed to send fulfillment email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            instanceId,
            message: 'Service instance created and fulfillment initiated.'
        });

    } catch (error: any) {
        console.error('Error initiating fulfillment:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
