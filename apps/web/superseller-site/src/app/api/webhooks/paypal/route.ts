import { NextResponse } from 'next/server';
import { verifyWebhookSignature, getSubscriptionDetails } from '@/lib/paypal';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { emails } from '@/lib/email';
import { ProvisioningService } from '@/lib/services/ProvisioningService';
import prisma from '@/lib/prisma';
import { CreditService } from '@/lib/credits';

const webhookId = process.env.PAYPAL_WEBHOOK_ID!;
const n8nWebhookUrl = process.env.N8N_PAYPAL_WEBHOOK_URL;

export async function POST(req: Request) {
    const body = await req.text();
    let event: any;

    try {
        event = JSON.parse(body);
    } catch {
        return new NextResponse('Invalid JSON', { status: 400 });
    }

    // Verify webhook signature if webhook ID is configured
    if (webhookId) {
        const verified = await verifyWebhookSignature({
            authAlgo: req.headers.get('paypal-auth-algo') || '',
            certUrl: req.headers.get('paypal-cert-url') || '',
            transmissionId: req.headers.get('paypal-transmission-id') || '',
            transmissionSig: req.headers.get('paypal-transmission-sig') || '',
            transmissionTime: req.headers.get('paypal-transmission-time') || '',
            webhookId,
            webhookEvent: event,
        });

        if (!verified) {
            console.error('PayPal webhook signature verification failed');
            return new NextResponse('Invalid signature', { status: 401 });
        }
    }

    try {
        const eventType = event.event_type;
        const resource = event.resource;

        console.log(`PayPal webhook: ${eventType}`);

        // ─── Subscription Activated ───
        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
            const subscriptionId = resource.id;
            const planId = resource.plan_id;
            const subscriberEmail = resource.subscriber?.email_address?.toLowerCase().trim();
            let customMetadata: Record<string, string> = {};
            try { customMetadata = resource.custom_id ? JSON.parse(resource.custom_id) : {}; } catch { /* */ }

            if (subscriberEmail) {
                const userId = subscriberEmail.replace(/[^a-z0-9]/g, '_');

                // Find or create subscription record
                const existingSub = await prisma.subscription.findFirst({
                    where: { stripeSubscriptionId: subscriptionId },
                });

                if (!existingSub) {
                    await prisma.subscription.create({
                        data: {
                            userId,
                            userEmail: subscriberEmail,
                            stripeSubscriptionId: subscriptionId, // Reusing column for PayPal
                            stripeCustomerId: resource.subscriber?.payer_id || null,
                            stripePriceId: planId,
                            subscriptionType: customMetadata.subscriptionType || 'video',
                            amount: Math.round(parseFloat(resource.billing_info?.last_payment?.amount?.value || '0') * 100),
                            status: 'active',
                            currentPeriodStart: new Date(),
                        },
                    });
                }

                // Provision initial credits
                const creditsPerCycle = parseInt(customMetadata.creditsPerCycle || '500', 10);
                if (creditsPerCycle > 0) {
                    await CreditService.addCredits(userId, creditsPerCycle, 'credit_grant', {
                        paypalSubscriptionId: subscriptionId,
                        plan: customMetadata.plan,
                    });
                }

                console.log(`Subscription ${subscriptionId} activated for ${subscriberEmail}`);
            }
        }

        // ─── Subscription Payment (recurring billing) ───
        if (eventType === 'PAYMENT.SALE.COMPLETED') {
            const billingAgreementId = resource.billing_agreement_id;
            if (billingAgreementId) {
                // This is a recurring subscription payment
                const sub = await prisma.subscription.findFirst({
                    where: { stripeSubscriptionId: billingAgreementId },
                    select: { userId: true, stripePriceId: true },
                });

                if (sub) {
                    // Determine credits per cycle from plan
                    let creditsPerCycle = 500; // default
                    const starterPlanId = process.env.PAYPAL_STARTER_PLAN_ID;
                    const proPlanId = process.env.PAYPAL_PRO_PLAN_ID;
                    const teamPlanId = process.env.PAYPAL_TEAM_PLAN_ID;

                    if (sub.stripePriceId === proPlanId) creditsPerCycle = 1500;
                    else if (sub.stripePriceId === teamPlanId) creditsPerCycle = 4000;
                    else if (sub.stripePriceId === starterPlanId) creditsPerCycle = 500;

                    await CreditService.addCredits(sub.userId, creditsPerCycle, 'credit_reset', {
                        paypalSaleId: resource.id,
                        paypalSubscriptionId: billingAgreementId,
                        billingReason: 'subscription_cycle',
                    });

                    console.log(`Recurring payment for subscription ${billingAgreementId}, ${creditsPerCycle} credits added`);
                }
            }
        }

        // ─── Subscription Updated (e.g., plan change) ───
        if (eventType === 'BILLING.SUBSCRIPTION.UPDATED') {
            const subscriptionId = resource.id;
            const newStatus = resource.status?.toLowerCase();

            const sub = await prisma.subscription.findFirst({
                where: { stripeSubscriptionId: subscriptionId },
            });

            if (sub && newStatus) {
                const statusMap: Record<string, string> = {
                    active: 'active',
                    suspended: 'past_due',
                    cancelled: 'canceled',
                    expired: 'canceled',
                };

                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: statusMap[newStatus] || newStatus },
                });

                // Alert on suspended (payment failed)
                if (newStatus === 'suspended' && sub.userId) {
                    const user = await prisma.user.findUnique({ where: { id: sub.userId }, select: { email: true } });
                    if (user?.email) {
                        await emails.invoiceReceipt(user.email, 'Payment Failed - Action Required', 0, subscriptionId);
                    }
                }
            }
        }

        // ─── Subscription Cancelled ───
        if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const subscriptionId = resource.id;
            await prisma.subscription.updateMany({
                where: { stripeSubscriptionId: subscriptionId },
                data: { status: 'canceled' },
            });
            console.log(`Subscription ${subscriptionId} canceled`);
        }

        // ─── Subscription Suspended (payment failure) ───
        if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
            const subscriptionId = resource.id;
            await prisma.subscription.updateMany({
                where: { stripeSubscriptionId: subscriptionId },
                data: { status: 'past_due' },
            });
            console.log(`Subscription ${subscriptionId} suspended (payment failed)`);
        }

        // Forward to n8n for additional integrations
        if (n8nWebhookUrl) {
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event),
            }).catch(err => console.error('n8n forward failed:', err));
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`PayPal webhook error: ${err.message}`);
        await auditAgent.log({
            service: 'paypal',
            action: 'webhook_processing_failed',
            status: 'error',
            errorMessage: err.message,
            details: { eventType: event.event_type },
        });
        return new NextResponse(`Internal Error: ${err.message}`, { status: 500 });
    }
}
