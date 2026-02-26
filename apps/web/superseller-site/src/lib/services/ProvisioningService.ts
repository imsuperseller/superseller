import registry from '../../configs/service-registry.json';
import { AITableService } from './AITableService';
import * as dbUsers from '@/lib/db/users';
import * as dbServices from '@/lib/db/services';
import prisma from '@/lib/prisma';
import { CreditService } from '../credits';
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
