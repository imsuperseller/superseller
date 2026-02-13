import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { emails } from '@/lib/email';
import { ProvisioningService } from '@/lib/services/ProvisioningService';
import * as dbPayments from '@/lib/db/payments';
import prisma from '@/lib/prisma';
import { CreditService } from '@/lib/credits';

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

            let provisioning: { userId: string; downloadUrl?: string; amount?: number } = { userId: userId || 'unknown' };

            if (customerEmail) {
                if (metadata.flowType === 'credit-topup') {
                    const creditAmount = parseInt(metadata.creditAmount || '0', 10);
                    if (creditAmount > 0) {
                        provisioning = await ProvisioningService.provisionCredits({
                            email: customerEmail,
                            amount: creditAmount,
                            type: 'topup',
                            stripeSessionId: session.id,
                        });
                        await emails.invoiceReceipt(
                            customerEmail,
                            `${creditAmount} Credits Refill`,
                            (session.amount_total || 0) / 100,
                            session.id
                        );
                    }
                } else {
                    provisioning = await ProvisioningService.provisionService({
                        email: customerEmail,
                        productId: (metadata.productId || metadata.workflowId || metadata.pillarId) as string,
                        productName: (metadata.productName || metadata.pillarName || 'Rensto Product') as string,
                        flowType: (metadata.flowType || (metadata.pillarId ? 'pillar-purchase' : 'unknown')) as string,
                        stripeSessionId: session.id,
                        stripeSubscriptionId: session.subscription as string,
                        metadata: metadata,
                        stripeSession: session,
                    });

                    if (metadata.flowType === 'marketplace-template' && provisioning.downloadUrl) {
                        await emails.downloadDelivery(
                            customerEmail,
                            (metadata.productName || 'Rensto Template') as string,
                            provisioning.downloadUrl,
                            session.id
                        );
                    }
                }
            }

            await auditAgent.log({
                service: 'provisioning',
                action: 'unified_flow_complete',
                status: 'success',
                details: { userId: provisioning.userId, flowType: metadata.flowType },
            });
        }

        // Handle invoice.paid for monthly subscription credit resets
        if (event.type === 'invoice.paid') {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
            if (subscriptionId) {
                const sub = await prisma.subscription.findFirst({
                    where: { stripeSubscriptionId: subscriptionId },
                    select: { userId: true },
                });
                if (sub) {
                    const creditsPerCycle = parseInt(
                        (invoice.metadata?.creditsPerCycle || process.env.CREDITS_PER_SUBSCRIPTION_CYCLE || '500') as string,
                        10
                    );
                    if (creditsPerCycle > 0) {
                        await CreditService.addCredits(sub.userId, creditsPerCycle, 'reset', {
                            stripeInvoiceId: invoice.id,
                            stripeSubscriptionId: subscriptionId,
                            billingReason: invoice.billing_reason || 'subscription_cycle',
                        });
                    }
                }
            }
        }

        // Forward to n8n for additional integrations (QuickBooks, etc)
        if (n8nWebhookUrl) {
            await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
            });
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`Error processing webhook: ${err.message}`);
        await auditAgent.log({
            service: 'stripe',
            action: 'webhook_processing_failed',
            status: 'error',
            errorMessage: err.message,
            details: { eventId: event.id, eventType: event.type },
        });
        return new NextResponse(`Internal Error: ${err.message}`, { status: 500 });
    }
}
