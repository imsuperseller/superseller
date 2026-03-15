import registry from '../../configs/service-registry.json';
import { AITableService } from './AITableService';
import * as dbUsers from '@/lib/db/users';
import * as dbServices from '@/lib/db/services';
import prisma from '@/lib/prisma';
import { CreditService } from '../credits';

// ─── Retry helper for worker HTTP calls ───
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delayMs = 2000): Promise<Response> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) return res;
            // Retry on 5xx/429, throw on 4xx
            if (res.status >= 500 || res.status === 429) {
                if (attempt === retries) throw new Error(`Worker returned ${res.status} after ${retries} attempts`);
                console.warn(`[ProvisioningService] Worker call attempt ${attempt}/${retries} failed (${res.status}), retrying in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                delayMs *= 2; // exponential backoff
                continue;
            }
            throw new Error(`Worker returned non-retryable ${res.status}: ${await res.text()}`);
        } catch (err: any) {
            if (err.name === 'AbortError' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
                if (attempt === retries) throw new Error(`Worker unreachable after ${retries} attempts: ${err.message}`);
                console.warn(`[ProvisioningService] Worker call attempt ${attempt}/${retries} failed (${err.message}), retrying in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                delayMs *= 2;
                continue;
            }
            throw err;
        }
    }
    throw new Error('fetchWithRetry exhausted all attempts');
}

// ─── WhatsApp notification helper ───
async function sendWhatsAppAlert(chatId: string, text: string): Promise<void> {
    const wahaUrl = process.env.WAHA_API_URL || 'http://172.245.56.50:3004';
    try {
        await fetch(`${wahaUrl}/api/sendText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId, text, session: 'default' }),
        });
    } catch (e) {
        console.error('[ProvisioningService] WhatsApp alert failed:', e);
    }
}

// ─── Slug helper ───
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
}
export class ProvisioningService {
    /**
     * Standardizes User Identity across all flows.
     * Uses email-based ID for consistency and easy lookup.
     */
    static async getOrCreateUser(email: string, name?: string, stripeCustomerId?: string): Promise<string> {
        const normalizedEmail = email.toLowerCase().trim();
        const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');

        await dbUsers.getOrCreate(normalizedEmail, { name, stripeCustomerId });

        return userId;
    }

    /**
     * Provisions a service based on product metadata.
     */
    static async provisionService(params: {
        email: string;
        productId: string;
        productName: string;
        flowType: string;
        stripeSessionId: string;
        stripeSubscriptionId?: string;
        metadata: any;
        stripeSession?: any;
    }) {
        const customerName = params.stripeSession?.customer_details?.name || params.metadata.customerName || 'Valued Client';
        const userId = await this.getOrCreateUser(params.email, customerName, params.stripeSession?.customer);

        // ═══════════════════════════════════════════════
        // 1. Marketplace Template Handling
        // ═══════════════════════════════════════════════
        if (params.flowType === 'marketplace-template') {
            const templateId = params.productId;
            const tokenData = `${templateId}:${params.email}:${Date.now()}`;
            const downloadToken = Buffer.from(tokenData).toString('base64url');
            const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://superseller.agency'}/api/marketplace/download/${downloadToken}`;

            const isCore7 = registry.products.core7.ids.includes(templateId);

            // ── PRIMARY: Postgres (atomic transaction) ──
            const { purchase, serviceInstance } = await dbServices.provisionMarketplaceTemplate({
                userId,
                email: params.email,
                templateId,
                productName: params.productName,
                stripeSessionId: params.stripeSessionId,
                downloadToken,
                downloadUrl,
                tier: params.metadata.tier,
                createServiceInstance: isCore7,
            });

            // Update user engines entitlement if Core 7
            if (isCore7 && serviceInstance) {
                const pgUser = await prisma.user.findUnique({ where: { id: userId } });
                const currentEngines = ((pgUser?.entitlements as any)?.engines || []) as any[];
                const engineInstance = {
                    id: serviceInstance.id,
                    solutionId: templateId,
                    name: (params.productName || 'Solution Engine').replace('SuperSeller AI ', ''),
                    status: 'pending_setup',
                    type: 'Builder',
                    activatedAt: new Date().toISOString(),
                };
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        entitlements: {
                            ...((pgUser?.entitlements as any) || {}),
                            engines: [...currentEngines, engineInstance],
                        },
                    },
                });
            }


            return { userId, downloadUrl };
        }

        // ═══════════════════════════════════════════════
        // 2. Managed Plan Handling (WhatsApp)
        // ═══════════════════════════════════════════════
        if (params.flowType === 'managed-plan') {
            // ── PRIMARY: Postgres (atomic transaction) ──
            const { subscription, whatsappInstance } = await dbServices.provisionManagedPlan({
                userId,
                email: params.email,
                productId: params.productId,
                productName: customerName ? `${customerName}'s Business` : params.productName,
                stripeSubscriptionId: params.stripeSubscriptionId,
                stripeCustomerId: params.stripeSession?.customer,
                whatsappBundle: params.metadata.whatsappBundle || 'manual_custom',
                amount: params.stripeSession?.amount_total || 0,
            });

            // Update user engines entitlement
            const pgUser = await prisma.user.findUnique({ where: { id: userId } });
            const currentEngines = ((pgUser?.entitlements as any)?.engines || []) as any[];
            const engineInstance = {
                id: whatsappInstance.id,
                solutionId: params.productId,
                name: (params.productName || 'WhatsApp AI Agent').replace('SuperSeller AI ', ''),
                status: 'pending_setup',
                type: 'Bundle',
                activatedAt: new Date().toISOString(),
            };
            await prisma.user.update({
                where: { id: userId },
                data: {
                    entitlements: {
                        ...((pgUser?.entitlements as any) || {}),
                        engines: [...currentEngines, engineInstance],
                    },
                },
            });


            return { userId, subscriptionId: subscription.id };
        }

        // ═══════════════════════════════════════════════
        // 3. Dynamic Registry-Driven Purchase (Pillars & Services)
        // ═══════════════════════════════════════════════
        const products = await AITableService.getProducts();
        const product = products.find(p => (p['Product ID'] || p.id) === params.productId);

        if (product) {
            const pFlowType = product['flowType'] || product.flowType;
            const pName = product['Product Name'] || product.name;
            const pWebhook = product['n8n Webhook'] || product.n8nWebhookId;
            const pPillarId = product['pillarId'] || product.pillarId || params.metadata.pillarId;

            // ── PRIMARY: Postgres ──
            const pgUser = await prisma.user.findUnique({ where: { id: userId } });
            const currentEntitlements = (pgUser?.entitlements as any) || {};
            const currentActiveServices = (pgUser?.activeServices as any) || {};
            const updates: any = {};

            // Apply Feature Flags/Entitlements
            const entitlements = product.entitlements || {};
            if (entitlements.featureFlags) {
                const currentFlags = currentEntitlements.pillars || [];
                updates.entitlements = {
                    ...currentEntitlements,
                    pillars: Array.from(new Set([...currentFlags, ...entitlements.featureFlags])),
                };
            }

            // Pillar-Specific Activation
            if (pPillarId) {
                const serviceKey = pPillarId === 'lead-machine' ? 'leads' :
                    pPillarId === 'autonomous-secretary' ? 'whatsapp' :
                        pPillarId.replace(/-/g, '_');
                updates.activeServices = {
                    ...currentActiveServices,
                    [serviceKey]: true,
                };
            }

            if (Object.keys(updates).length > 0) {
                await prisma.user.update({ where: { id: userId }, data: updates });
            }


            // 4. Trigger n8n Fulfillment Hook if defined
            if (pWebhook && process.env.N8N_OPTIMIZER_WEBHOOK) {
                try {
                    const n8nInstance = (pgUser?.n8nInstance as any);
                    const targetWebhook = n8nInstance?.url
                        ? `${n8nInstance.url.replace(/\/$/, '')}/webhook/${pWebhook}`
                        : process.env.N8N_OPTIMIZER_WEBHOOK;

                    await fetch(targetWebhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'provisioning_trigger',
                            productId: params.productId,
                            pillarId: pPillarId || '',
                            webhookId: pWebhook,
                            userId,
                            email: params.email,
                            stripeSessionId: params.stripeSessionId,
                        }),
                    });
                } catch (err) {
                    console.error('Failed to trigger n8n provisioning:', err);
                }
            }
        }

        return { userId };
    }

    /**
     * Shared onboarding handler for payment webhook triggers (PayPal + Stripe).
     * Handles idempotency, tenant creation, user linking, service instance creation,
     * and worker HTTP call with retry + WhatsApp alert on failure.
     */
    static async onboardNewCustomer(params: {
        provider: 'paypal' | 'stripe';
        eventId: string;
        eventType: string;
        payload: any;
        customerEmail: string;
        customerName: string;
        customerPhone: string;
        productName: string;
        serviceType: string;
        subscriptionId: string;
        amount: number;
        metadata?: Record<string, any>;
    }): Promise<{ tenantId: string; serviceInstanceId: string }> {
        // 1. Idempotency check — try to create WebhookEvent record
        let webhookEvent: { id: string };
        try {
            webhookEvent = await prisma.webhookEvent.create({
                data: {
                    provider: params.provider,
                    eventId: params.eventId,
                    eventType: params.eventType,
                    payload: params.payload,
                    status: 'processing',
                },
                select: { id: true },
            });
        } catch (err: any) {
            // Unique violation (P2002) = already processed
            if (err.code === 'P2002') {
                console.log(`[ProvisioningService] Duplicate webhook event ${params.provider}:${params.eventId} — skipping`);
                const existing = await prisma.webhookEvent.findUnique({
                    where: { provider_eventId: { provider: params.provider, eventId: params.eventId } },
                    select: { id: true },
                });
                // Return placeholder values since this was already processed
                return { tenantId: 'duplicate', serviceInstanceId: existing?.id || 'duplicate' };
            }
            throw err;
        }

        let tenantId: string;
        let serviceInstanceId: string;

        try {
            // 2. Find or create Tenant
            const normalizedEmail = params.customerEmail.toLowerCase().trim();
            const existingUser = await prisma.user.findUnique({
                where: { email: normalizedEmail },
                select: { id: true },
            });

            let tenant: { id: string } | null = null;
            if (existingUser) {
                const tenantUser = await prisma.tenantUser.findFirst({
                    where: { userId: existingUser.id },
                    select: { tenantId: true },
                });
                if (tenantUser) {
                    tenant = await prisma.tenant.findUnique({
                        where: { id: tenantUser.tenantId },
                        select: { id: true },
                    });
                }
            }

            if (!tenant) {
                // Create new Tenant
                let baseSlug = slugify(params.customerName || params.customerEmail.split('@')[0]);
                if (!baseSlug) baseSlug = 'customer';
                let slug = baseSlug;
                // Ensure unique slug
                const existing = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
                if (existing) {
                    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
                }
                tenant = await prisma.tenant.create({
                    data: {
                        name: `${params.customerName}'s Business`,
                        slug,
                        status: 'active',
                        settings: {
                            paymentProvider: params.provider,
                            subscriptionId: params.subscriptionId,
                        },
                    },
                    select: { id: true },
                });
            }
            tenantId = tenant.id;

            // 3. Get or create User + TenantUser
            const userId = await ProvisioningService.getOrCreateUser(normalizedEmail, params.customerName);
            await prisma.tenantUser.upsert({
                where: { tenantId_userId: { tenantId, userId } },
                update: { role: 'owner' },
                create: { tenantId, userId, role: 'owner' },
            });

            // 4. Create ServiceInstance
            const serviceInstance = await prisma.serviceInstance.create({
                data: {
                    clientId: userId,
                    clientEmail: normalizedEmail,
                    productName: params.productName,
                    type: params.serviceType,
                    tenantId,
                    status: 'pending_setup',
                },
                select: { id: true },
            });
            serviceInstanceId = serviceInstance.id;

            // 5. Call worker to start onboarding (with retry)
            const workerUrl = (process.env.WORKER_URL || process.env.VIDEO_WORKER_URL || 'http://172.245.56.50:3002').replace(/\/$/, '');
            const workerResponse = await fetchWithRetry(
                `${workerUrl}/api/onboarding/start`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-worker-secret': process.env.WORKER_API_SECRET || '',
                    },
                    body: JSON.stringify({
                        tenantId,
                        clientPhone: params.customerPhone,
                        triggeredBy: `webhook:${params.provider}`,
                        productName: params.productName,
                        serviceType: params.serviceType,
                    }),
                },
            );

            const workerData = await workerResponse.json();

            // 6. Send WhatsApp notification to Shai
            await sendWhatsAppAlert(
                '14695885133@c.us',
                `New customer onboarded!\n\n` +
                `Name: ${params.customerName}\n` +
                `Email: ${params.customerEmail}\n` +
                `Phone: ${params.customerPhone}\n` +
                `Product: ${params.productName}\n` +
                `Amount: $${(params.amount / 100).toFixed(2)}\n` +
                `Provider: ${params.provider}\n` +
                `Group: ${workerData.groupId || 'pending'}\n` +
                `Tenant: ${tenantId}`,
            );

            // 7. Update WebhookEvent status to completed
            await prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: { status: 'completed', processedAt: new Date() },
            });

        } catch (err: any) {
            // On failure: update WebhookEvent, send alert to Shai
            console.error(`[ProvisioningService] onboardNewCustomer failed for ${params.customerEmail}:`, err);
            await prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: { status: 'failed', errorMessage: err.message },
            }).catch(() => {}); // Don't throw if update fails

            // Alert Shai with failure details for manual follow-up
            await sendWhatsAppAlert(
                '14695885133@c.us',
                `[ONBOARDING FAILED] Customer: ${params.customerEmail}, Phone: ${params.customerPhone}, Product: ${params.productName}, Error: ${err.message}. Manual follow-up required.`,
            );

            throw err;
        }

        return { tenantId, serviceInstanceId };
    }

    /**
     * Specifically handles credit deposits.
     */
    static async provisionCredits(params: {
        email: string;
        amount: number;
        type: 'credit_topup' | 'credit_grant';
        stripeSessionId?: string;
    }) {
        const userId = await this.getOrCreateUser(params.email);

        await CreditService.addCredits(userId, params.amount, params.type, {
            stripeSessionId: params.stripeSessionId,
            email: params.email,
        });

        return { userId, amount: params.amount };
    }
}
