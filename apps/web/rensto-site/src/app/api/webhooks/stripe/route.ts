import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';
import { emails } from '@/lib/email';
import { ProvisioningService } from '@/lib/services/ProvisioningService';
import * as dbPayments from '@/lib/db/payments';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const n8nWebhookUrl = process.env.N8N_STRIPE_WEBHOOK_URL!;

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

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

            const customerEmail = session.customer_details?.email?.toLowerCase().trim() || null;
            const userId = customerEmail ? customerEmail.replace(/[^a-z0-9]/g, '_') : undefined;
            await dbPayments.createPayment({
                userId: userId || 'unknown',
                stripeSessionId: session.id,
                stripeCustomerId: (session.customer as string) || null,
                customerEmail,
                amount: session.amount_total ?? 0,
                amountTotal: session.amount_total ?? 0,
                currency: session.currency || 'usd',
                status: 'completed',
                flowType: metadata.flowType || 'unknown',
                productId: metadata.productId || metadata.workflowId || null,
                tier: metadata.tier || null,
                platform: metadata.platform || 'rensto-web',
                metadata: { customerEmail },
            });

            // Backup: Firestore (non-blocking)
            // 2. UNIFIED PROVISIONING (Postgres-first via ProvisioningService)
            if (customerEmail) {
                const provisioning = await ProvisioningService.provisionService({
                    email: customerEmail,
                    productId: (metadata.productId || metadata.workflowId || metadata.pillarId) as string,
                    productName: (metadata.productName || metadata.pillarName || 'Rensto Product') as string,
                    flowType: (metadata.flowType || (metadata.pillarId ? 'pillar-purchase' : 'unknown')) as string,
                    stripeSessionId: session.id,
                    stripeSubscriptionId: session.subscription as string,
                    metadata: metadata,
                    stripeSession: session
                });

                // 3. Trigger Specialized Emails based on Provisioning Result
                if (metadata.flowType === 'marketplace-template' && provisioning.downloadUrl) {
                    await emails.downloadDelivery(
                        customerEmail,
                        (metadata.productName || 'Rensto Template') as string,
                        provisioning.downloadUrl,
                        session.id
                    );
                } else if (metadata.flowType === 'managed-plan' || metadata.flowType === 'service-purchase') {
                    await emails.welcome(customerEmail, session.customer_details?.name || undefined);
                    if (session.amount_total) {
                        await emails.invoiceReceipt(
                            customerEmail,
                            (metadata.productId || 'Automation Service') as string,
                            session.amount_total / 100,
                            session.id
                        );
                    }
                }

                await auditAgent.log({
                    service: 'provisioning',
                    action: 'unified_flow_complete',
                    status: 'success',
                    details: { userId: provisioning.userId, flowType: metadata.flowType }
                });
            }

            // 4. Forward to n8n for additional integrations (QuickBooks, etc)
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
