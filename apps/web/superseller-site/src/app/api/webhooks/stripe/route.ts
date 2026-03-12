import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

/**
 * Stripe webhook handler — reactivated for Elite Pro and future Stripe customers.
 * Handles subscription lifecycle, invoice payments, and payment failures.
 * Webhook endpoint: https://superseller.agency/api/webhooks/stripe
 * Webhook ID: we_1TADRKDE8rt1dEs1WfMIYsEm
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// WhatsApp notification helper (best-effort, don't block webhook)
async function notifyShai(message: string) {
    const wahaUrl = process.env.WAHA_API_URL || 'http://172.245.56.50:3004';
    try {
        await fetch(`${wahaUrl}/api/sendText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: '14695885133@c.us',
                text: message,
                session: 'default',
            }),
        });
    } catch (e) {
        console.error('[stripe/webhook] WhatsApp notification failed:', e);
    }
}

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        return new NextResponse('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`[stripe/webhook] Signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`[stripe/webhook] ${event.type} — ${event.id}`);

    try {
        switch (event.type) {
            // ─── Checkout completed (new subscription or one-time) ───
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerEmail = session.customer_email || session.customer_details?.email;
                const subscriptionId = session.subscription as string | null;
                const metadata = session.metadata || {};

                console.log(`[stripe/webhook] Checkout completed: ${customerEmail}, sub: ${subscriptionId}`);

                if (subscriptionId && customerEmail) {
                    const sub = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = sub.items.data[0]?.price?.id;
                    const amount = sub.items.data[0]?.price?.unit_amount || 0;

                    await prisma.subscription.upsert({
                        where: { stripeSubscriptionId: subscriptionId },
                        create: {
                            userId: customerEmail.replace(/[^a-z0-9]/g, '_'),
                            userEmail: customerEmail.toLowerCase(),
                            stripeSubscriptionId: subscriptionId,
                            stripeCustomerId: session.customer as string,
                            stripePriceId: priceId || null,
                            subscriptionType: metadata.subscriptionType || 'custom_solution',
                            amount,
                            status: 'active',
                            currentPeriodStart: new Date(sub.current_period_start * 1000),
                            currentPeriodEnd: new Date(sub.current_period_end * 1000),
                        },
                        update: {
                            status: 'active',
                            currentPeriodStart: new Date(sub.current_period_start * 1000),
                            currentPeriodEnd: new Date(sub.current_period_end * 1000),
                        },
                    });

                    // Update tenant if metadata has tenant slug
                    if (metadata.tenant) {
                        await prisma.$executeRawUnsafe(
                            `UPDATE "Tenant" SET settings = jsonb_set(COALESCE(settings, '{}'), '{stripeSubscriptionId}', $1::jsonb) WHERE slug = $2`,
                            JSON.stringify(subscriptionId),
                            metadata.tenant,
                        );
                    }

                    await notifyShai(`💰 *Stripe* — New subscription!\n${customerEmail}\n$${(amount / 100).toFixed(0)}/mo\nTenant: ${metadata.tenant || 'N/A'}`);
                }
                break;
            }

            // ─── Invoice paid (recurring payment success) ───
            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string | null;
                const customerEmail = invoice.customer_email;
                const amountPaid = invoice.amount_paid;

                if (subscriptionId) {
                    await prisma.subscription.updateMany({
                        where: { stripeSubscriptionId: subscriptionId },
                        data: {
                            status: 'active',
                            currentPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : undefined,
                            currentPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
                        },
                    });

                    // Record payment
                    await prisma.payment.create({
                        data: {
                            stripeSessionId: invoice.id,
                            stripeCustomerId: invoice.customer as string,
                            customerEmail: customerEmail || undefined,
                            amountTotal: amountPaid,
                            amount: amountPaid,
                            currency: invoice.currency,
                            status: 'completed',
                            flowType: 'subscription_renewal',
                            platform: 'stripe',
                            metadata: {
                                subscriptionId,
                                invoiceNumber: invoice.number,
                                invoicePdf: invoice.invoice_pdf,
                                hostedInvoiceUrl: invoice.hosted_invoice_url,
                            },
                        },
                    });

                    console.log(`[stripe/webhook] Invoice paid: ${customerEmail} — $${(amountPaid / 100).toFixed(2)}`);

                    // Only notify on renewals (not the first invoice which is covered by checkout.session.completed)
                    if (invoice.billing_reason === 'subscription_cycle') {
                        await notifyShai(`💰 *Stripe* — Recurring payment received!\n${customerEmail}\n$${(amountPaid / 100).toFixed(0)}\nInvoice: ${invoice.number}`);
                    }
                }
                break;
            }

            // ─── Invoice payment failed ───
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string | null;
                const customerEmail = invoice.customer_email;

                if (subscriptionId) {
                    await prisma.subscription.updateMany({
                        where: { stripeSubscriptionId: subscriptionId },
                        data: { status: 'past_due' },
                    });
                }

                await notifyShai(`⚠️ *Stripe* — Payment FAILED!\n${customerEmail}\n$${((invoice.amount_due || 0) / 100).toFixed(0)}\nAttempt: ${invoice.attempt_count}`);
                break;
            }

            // ─── Subscription updated (plan change, status change) ───
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription;
                const statusMap: Record<string, string> = {
                    active: 'active',
                    past_due: 'past_due',
                    canceled: 'canceled',
                    unpaid: 'past_due',
                    trialing: 'trialing',
                    incomplete: 'past_due',
                    incomplete_expired: 'canceled',
                    paused: 'past_due',
                };

                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: sub.id },
                    data: {
                        status: statusMap[sub.status] || sub.status,
                        currentPeriodStart: new Date(sub.current_period_start * 1000),
                        currentPeriodEnd: new Date(sub.current_period_end * 1000),
                    },
                });
                break;
            }

            // ─── Subscription deleted (canceled) ───
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: sub.id },
                    data: { status: 'canceled' },
                });

                await notifyShai(`❌ *Stripe* — Subscription canceled!\nSubscription: ${sub.id}`);
                break;
            }

            default:
                console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`[stripe/webhook] Processing error: ${err.message}`);
        // Always return 200 to prevent Stripe from retrying
        return NextResponse.json({ received: true, error: err.message });
    }
}
