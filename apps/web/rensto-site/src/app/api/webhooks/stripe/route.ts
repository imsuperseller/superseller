import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!;

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        if (!sig || !webhookSecret) return new NextResponse('Missing signature or secret', { status: 400 });
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        // Handle successful checkout sessions
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata || {};

            console.log(`Processing checkout session: ${session.id}, flowType: ${metadata.flowType}`);

            // 1. Log payment event to Firestore
            const db = getFirestoreAdmin();
            await db.collection('payments').add({
                stripeSessionId: session.id,
                customerId: session.customer,
                customerEmail: session.customer_details?.email,
                amountTotal: session.amount_total,
                currency: session.currency,
                flowType: metadata.flowType,
                productId: metadata.productId || metadata.workflowId,
                tier: metadata.tier,
                platform: metadata.platform || 'rensto-web',
                timestamp: Timestamp.now()
            });

            // 2. Specialized handling for Marketplace Templates
            if (metadata.flowType === 'marketplace-template') {
                const templateId = metadata.productId || metadata.workflowId;
                const customerEmail = session.customer_details?.email;

                // Create a secure download token (valid indefinitely for now, can add expiration later)
                // Format: templateId:customerEmail:timestamp
                const tokenData = `${templateId}:${customerEmail}:${Date.now()}`;
                const downloadToken = Buffer.from(tokenData).toString('base64url');
                const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rensto.com'}/api/marketplace/download/${downloadToken}`;

                // Mark purchase in Firestore
                await db.collection('purchases').add({
                    templateId,
                    customerEmail,
                    stripeSessionId: session.id,
                    downloadToken,
                    downloadUrl,
                    tier: metadata.tier,
                    timestamp: Timestamp.now()
                });

                await auditAgent.log({
                    service: 'firebase',
                    action: 'purchase_recorded',
                    status: 'success',
                    details: { templateId, customerEmail, downloadUrl }
                });
            }

            // 3. Forward to n8n for QuickBooks and other integrations
            if (n8nWebhookUrl) {
                await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`Error processing webhook: ${err.message}`);
        await auditAgent.log({
            service: 'stripe',
            action: 'webhook_processing_failed',
            status: 'error',
            errorMessage: err.message,
            details: { eventId: event.id, eventType: event.type }
        });
        return new NextResponse(`Internal Error: ${err.message}`, { status: 500 });
    }
}
