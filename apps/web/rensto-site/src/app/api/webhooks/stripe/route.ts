import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
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

                // Create a secure download token
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

            // 3. Specialized handling for Service Purchases (e.g. Automation Audit)
            if (metadata.flowType === 'service-purchase') {
                const customerEmail = session.customer_details?.email;
                if (customerEmail) {
                    const clientsRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS);

                    // Check if client already exists
                    const existingClient = await clientsRef.where('email', '==', customerEmail.toLowerCase()).limit(1).get();

                    const clientData = {
                        email: customerEmail.toLowerCase(),
                        name: session.customer_details?.name || 'Valued Client',
                        status: 'paid',
                        amountPaid: session.amount_total ? session.amount_total / 100 : 0,
                        lastPaidAt: Timestamp.now(),
                        productId: metadata.productId || 'automation-audit',
                        tier: metadata.tier || 'standard',
                        stripeCustomerId: session.customer as string,
                        updatedAt: Timestamp.now()
                    };

                    if (existingClient.empty) {
                        // Create new client record
                        const newClient = await clientsRef.add({
                            ...clientData,
                            createdAt: Timestamp.now(),
                        });

                        await auditAgent.log({
                            service: 'firebase',
                            action: 'client_provisioned',
                            status: 'success',
                            details: { clientId: newClient.id, email: customerEmail }
                        });
                    } else {
                        // Update existing client record
                        await existingClient.docs[0].ref.update(clientData);

                        await auditAgent.log({
                            service: 'firebase',
                            action: 'client_updated_post_purchase',
                            status: 'success',
                            details: { clientId: existingClient.docs[0].id, email: customerEmail }
                        });
                    }
                }
            }

            // 4. Specialized handling for Managed Plans (WhatsApp)
            if (metadata.flowType === 'managed-plan') {
                const customerEmail = session.customer_details?.email;
                if (customerEmail) {
                    const clientsRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS);
                    const existingClient = await clientsRef.where('email', '==', customerEmail.toLowerCase()).limit(1).get();

                    const planData = {
                        email: customerEmail.toLowerCase(),
                        name: session.customer_details?.name || 'Valued Client',
                        status: 'active',
                        subscriptionId: session.subscription as string,
                        stripeCustomerId: session.customer as string,
                        planId: metadata.productId || 'managed-base',
                        addons: metadata.selectedAddons ? metadata.selectedAddons.split(',') : [],
                        extraNumbers: parseInt(metadata.extraNumbers || '0'),
                        lastPaidAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    };

                    if (existingClient.empty) {
                        await clientsRef.add({ ...planData, createdAt: Timestamp.now() });
                    } else {
                        await existingClient.docs[0].ref.update(planData);
                    }

                    await auditAgent.log({
                        service: 'firebase',
                        action: 'managed_plan_provisioned',
                        status: 'success',
                        details: { email: customerEmail, plan: planData.planId }
                    });
                }
            }

            // 5. Specialized handling for other flow types
            const otherFlows = [
                'marketplace-install',
                'marketplace-custom',
                'ready-solutions',
                'custom-solutions',
                'custom-config'
            ];

            if (otherFlows.includes(metadata.flowType)) {
                await auditAgent.log({
                    service: 'stripe',
                    action: 'specialized_flow_detected',
                    status: 'success',
                    details: { flowType: metadata.flowType, sessionId: session.id }
                });
            }

            // 6. Forward to n8n for QuickBooks and other integrations
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
