import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateInvoicePdf, type InvoiceData } from '@/lib/services/invoice-pdf';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Stripe webhook handler — reactivated for Elite Pro and future Stripe customers.
 * Handles subscription lifecycle, invoice payments, and payment failures.
 * Webhook endpoint: https://superseller.agency/api/webhooks/stripe
 * Webhook ID: we_1TADRKDE8rt1dEs1WfMIYsEm
 *
 * Post-payment flow (checkout.session.completed):
 * 1. Create Subscription record in DB
 * 2. Update Tenant settings with Stripe subscription ID
 * 3. Create/link TenantUser so customer can log in
 * 4. Create ServiceInstance record for service activation tracking
 * 5. Generate invoice PDF and store in R2
 * 6. Send welcome email to customer
 * 7. Update admin project status
 * 8. Forward to n8n for additional integrations
 * 9. Send WhatsApp notifications (to Shai + next-steps to customer group)
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const n8nWebhookUrl = process.env.N8N_STRIPE_WEBHOOK_URL;

// ─── WhatsApp notification helper (best-effort, don't block webhook) ───
async function sendWhatsApp(chatId: string, text: string) {
    const wahaUrl = process.env.WAHA_API_URL || 'http://172.245.56.50:3004';
    try {
        await fetch(`${wahaUrl}/api/sendText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, text, session: 'default' }),
        });
    } catch (e) {
        console.error('[stripe/webhook] WhatsApp notification failed:', e);
    }
}

async function notifyShai(message: string) {
    await sendWhatsApp('14695885133@c.us', message);
}

// ─── Invoice PDF generation + R2 upload (best-effort) ───
async function generateAndStoreInvoice(params: {
    tenantSlug: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    subscriptionId: string;
}): Promise<string | null> {
    try {
        const year = new Date().getFullYear();
        const existingCount = await prisma.payment.count();
        const seq = String(existingCount + 1).padStart(4, '0');
        const invoiceNumber = `INV-${year}-${seq}`;
        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const data: InvoiceData = {
            invoiceNumber,
            issueDate: today,
            dueDate: dueDate.toISOString().split('T')[0],
            customerName: params.customerName,
            customerEmail: params.customerEmail,
            lineItems: [{
                description: 'Autonomous Instagram Growth — Monthly Subscription',
                quantity: 1,
                unitPrice: params.amount / 100,
            }],
            notes: `Stripe Subscription: ${params.subscriptionId}`,
            status: 'paid',
        };

        const pdfBuffer = await generateInvoicePdf(data);

        // Upload to R2
        const accountId = (process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || '').trim();
        const accessKeyId = (process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '').trim();
        const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '').trim();

        if (!accountId || !accessKeyId || !secretAccessKey) {
            console.warn('[stripe/webhook] R2 credentials not configured, skipping invoice upload');
            return null;
        }

        const s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
            forcePathStyle: true,
        });

        const key = `invoices/${params.tenantSlug}/${invoiceNumber}.pdf`;
        await s3.send(new PutObjectCommand({
            Bucket: 'zillow-to-video-finals',
            Key: key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            CacheControl: 'public, max-age=31536000',
        }));

        const publicDomain = (process.env.R2_PUBLIC_DOMAIN || 'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev').trim();
        console.log(`[stripe/webhook] Invoice stored: ${publicDomain}/${key}`);
        return `${publicDomain}/${key}`;
    } catch (err: any) {
        console.error('[stripe/webhook] Invoice generation failed:', err.message);
        return null;
    }
}

// ─── Admin project status update (best-effort) ───
async function updateAdminProject(tenantSlug: string, status: string, description: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://superseller.agency';
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) return;

        // Find project by tenant slug in description
        const projects = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id FROM "Project" WHERE description ILIKE $1 LIMIT 1`,
            `%${tenantSlug}%`,
        );

        if (projects.length > 0) {
            await prisma.$executeRawUnsafe(
                `UPDATE "Project" SET status = $1, description = $2, "updatedAt" = NOW() WHERE id = $3`,
                status,
                description,
                projects[0].id,
            );
            console.log(`[stripe/webhook] Admin project ${projects[0].id} updated to ${status}`);
        }
    } catch (err: any) {
        console.error('[stripe/webhook] Admin project update failed:', err.message);
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
                const customerName = session.customer_details?.name || '';
                const subscriptionId = session.subscription as string | null;
                const metadata = session.metadata || {};

                console.log(`[stripe/webhook] Checkout completed: ${customerEmail}, sub: ${subscriptionId}, metadata:`, metadata);

                if (subscriptionId && customerEmail) {
                    const sub = await stripe.subscriptions.retrieve(subscriptionId);
                    const priceId = sub.items.data[0]?.price?.id;
                    const amount = sub.items.data[0]?.price?.unit_amount || 0;
                    const tenantSlug = metadata.tenant || '';
                    const tenantId = metadata.tenantId || '';
                    const normalizedEmail = customerEmail.toLowerCase().trim();
                    const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');

                    // ── 1. Create Subscription record ──
                    const existingSub = await prisma.subscription.findFirst({
                        where: { stripeSubscriptionId: subscriptionId },
                    });
                    if (existingSub) {
                        await prisma.subscription.update({
                            where: { id: existingSub.id },
                            data: {
                                status: 'active',
                                currentPeriodStart: new Date(sub.current_period_start * 1000),
                                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                            },
                        });
                    } else {
                        await prisma.subscription.create({
                            data: {
                                userId,
                                userEmail: normalizedEmail,
                                stripeSubscriptionId: subscriptionId,
                                stripeCustomerId: session.customer as string,
                                stripePriceId: priceId || null,
                                subscriptionType: metadata.subscriptionType || 'custom_solution',
                                amount,
                                status: 'active',
                                currentPeriodStart: new Date(sub.current_period_start * 1000),
                                currentPeriodEnd: new Date(sub.current_period_end * 1000),
                                tenantId: tenantId || undefined,
                            },
                        });
                    }

                    // ── 2. Update Tenant settings ──
                    if (tenantSlug) {
                        await prisma.$executeRawUnsafe(
                            `UPDATE "Tenant" SET settings = jsonb_set(
                                jsonb_set(COALESCE(settings, '{}'), '{stripeSubscriptionId}', $1::jsonb),
                                '{subscriptionStatus}', '"active"'::jsonb
                            ) WHERE slug = $2`,
                            JSON.stringify(subscriptionId),
                            tenantSlug,
                        );
                    }

                    // ── 3. Create/link TenantUser so customer can log into dashboard ──
                    if (tenantId) {
                        // Ensure User record exists
                        await prisma.user.upsert({
                            where: { email: normalizedEmail },
                            create: {
                                id: userId,
                                email: normalizedEmail,
                                name: customerName || undefined,
                                stripeCustomerId: session.customer as string,
                                status: 'active',
                            },
                            update: {
                                stripeCustomerId: session.customer as string,
                                name: customerName || undefined,
                            },
                        });

                        // Link user to tenant
                        await prisma.$executeRawUnsafe(
                            `INSERT INTO "TenantUser" ("tenantId", "userId", "role")
                             VALUES ($1, $2, 'owner')
                             ON CONFLICT ("tenantId", "userId") DO NOTHING`,
                            tenantId,
                            userId,
                        );
                        console.log(`[stripe/webhook] TenantUser linked: ${userId} → ${tenantId}`);
                    }

                    // ── 4. Create ServiceInstance for service activation tracking ──
                    const serviceInstance = await prisma.serviceInstance.create({
                        data: {
                            clientId: userId,
                            clientEmail: normalizedEmail,
                            productName: metadata.productName || 'Autonomous Instagram Growth',
                            status: 'pending_setup',
                            type: metadata.serviceType || 'content_automation',
                            tenantId: tenantId || undefined,
                            stripeSessionId: session.id,
                            configuration: {
                                stripeSubscriptionId: subscriptionId,
                                stripeCustomerId: session.customer,
                                priceId,
                                amount,
                                customerName,
                            },
                        },
                    });
                    console.log(`[stripe/webhook] ServiceInstance created: ${serviceInstance.id}`);

                    // ── 5. Generate invoice PDF and store in R2 (best-effort, async) ──
                    const invoiceUrl = await generateAndStoreInvoice({
                        tenantSlug: tenantSlug || 'stripe-customers',
                        customerName: customerName || normalizedEmail,
                        customerEmail: normalizedEmail,
                        amount,
                        subscriptionId,
                    });

                    // ── 6. Send welcome email to customer ──
                    await sendEmail({
                        to: normalizedEmail,
                        template: 'welcome',
                        data: { customerName: customerName || undefined },
                    }).catch(err => console.error('[stripe/webhook] Welcome email failed:', err));

                    // ── 7. Update admin project status ──
                    if (tenantSlug) {
                        await updateAdminProject(
                            tenantSlug,
                            'payment_received',
                            `Payment received via Stripe. $${(amount / 100).toFixed(0)}/mo. Subscription: ${subscriptionId}. Service instance: ${serviceInstance.id}. Awaiting onboarding prerequisites.`,
                        );
                    }

                    // ── 8. Forward to n8n for additional integrations ──
                    if (n8nWebhookUrl) {
                        fetch(n8nWebhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'stripe_checkout_completed',
                                customerEmail: normalizedEmail,
                                customerName,
                                subscriptionId,
                                amount,
                                tenantSlug,
                                tenantId,
                                serviceInstanceId: serviceInstance.id,
                                invoiceUrl,
                                metadata,
                            }),
                        }).catch(err => console.error('[stripe/webhook] n8n forward failed:', err));
                    }

                    // ── 9. WhatsApp notifications ──
                    // 9a. Notify Shai
                    await notifyShai(
                        `💰 *Stripe* — New subscription!\n` +
                        `${customerName || customerEmail}\n` +
                        `$${(amount / 100).toFixed(0)}/mo\n` +
                        `Tenant: ${tenantSlug || 'N/A'}\n` +
                        `Service: ${serviceInstance.id}\n` +
                        `${invoiceUrl ? `Invoice: ${invoiceUrl}` : 'Invoice: generation pending'}`,
                    );

                    // 9b. Send next-steps to customer's WhatsApp group (if configured in metadata)
                    if (metadata.whatsappGroup) {
                        await sendWhatsApp(
                            metadata.whatsappGroup,
                            `🎉 *Payment Confirmed — Thank You!*\n\n` +
                            `Welcome aboard, ${customerName || 'team'}! Your subscription is now active.\n\n` +
                            `*Next Steps:*\n` +
                            `1. We'll begin competitor research immediately (Days 1-3)\n` +
                            `2. Please share your Instagram credentials (Meta Business Suite admin access)\n` +
                            `3. Share brand assets: logo, project photos, team photos\n` +
                            `4. Content production begins once prerequisites are met\n\n` +
                            `Questions? Drop them right here in this group!`,
                        );
                    }
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

                        // Send renewal receipt email to customer
                        if (customerEmail) {
                            const sub = await prisma.subscription.findFirst({
                                where: { stripeSubscriptionId: subscriptionId },
                            });
                            await sendEmail({
                                to: customerEmail,
                                template: 'subscription-renewal',
                                data: {
                                    planName: 'Autonomous Instagram Growth',
                                    amount: (amountPaid / 100).toFixed(0),
                                    nextBillingDate: invoice.period_end
                                        ? new Date(invoice.period_end * 1000).toLocaleDateString()
                                        : 'See subscription details',
                                },
                            }).catch(err => console.error('[stripe/webhook] Renewal email failed:', err));
                        }
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

                // Alert customer via email
                if (customerEmail) {
                    await sendEmail({
                        to: customerEmail,
                        template: 'invoice-receipt',
                        data: {
                            productName: 'Payment Failed - Action Required',
                            amount: ((invoice.amount_due || 0) / 100).toFixed(0),
                            transactionId: subscriptionId || invoice.id,
                        },
                    }).catch(err => console.error('[stripe/webhook] Payment failed email error:', err));
                }
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

        // Forward ALL events to n8n (not just checkout)
        if (n8nWebhookUrl && event.type !== 'checkout.session.completed') {
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: event.type, data: event.data.object }),
            }).catch(err => console.error('[stripe/webhook] n8n forward failed:', err));
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`[stripe/webhook] Processing error: ${err.message}`);
        // Always return 200 to prevent Stripe from retrying
        return NextResponse.json({ received: true, error: err.message });
    }
}
