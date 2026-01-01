
import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { ServiceInstance } from '@/types/firestore';
import { FieldValue } from 'firebase-admin/firestore';

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

        // 1. Create the Service Instance record
        const newInstance: Omit<ServiceInstance, 'id'> = {
            clientId,
            clientEmail: clientEmail || '',
            productId,
            productName: productName || 'Rensto Service',
            status: 'pending_setup',
            configuration,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            adminNotes: paymentIntentId ? `Paid via ${paymentIntentId}` : 'Manual initiation'
        };

        const docRef = await instancesRef.add(newInstance);
        const instanceId = docRef.id;

        // 2. Trigger N8N Fulfillment Orchestrator
        try {
            await fetch(N8N_FULFILLMENT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'service_initiation',
                    instanceId,
                    clientId,
                    clientEmail,
                    productName,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (webhookError) {
            console.error('Failed to trigger fulfillment webhook:', webhookError);
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
