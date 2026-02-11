import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import registry from '../../configs/service-registry.json';
import { User, ServiceInstance, Subscription } from '@/types/firestore';
import { AITableService } from './AITableService';
import * as dbUsers from '@/lib/db/users';
import * as dbServices from '@/lib/db/services';
import prisma from '@/lib/prisma';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export class ProvisioningService {
    /**
     * Standardizes User Identity across all flows.
     * Uses email-based ID for consistency and easy lookup.
     *
     * [MIGRATION] Phase 1: Postgres is PRIMARY, Firestore is backup.
     */
    static async getOrCreateUser(email: string, name?: string, stripeCustomerId?: string): Promise<string> {
        const normalizedEmail = email.toLowerCase().trim();
        const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');

        // ── PRIMARY: Postgres ──
        await dbUsers.getOrCreate(normalizedEmail, { name, stripeCustomerId });

        // ── BACKUP: Firestore (non-blocking) ──
        await firestoreBackupWrite('ProvisioningService.getOrCreateUser', async () => {
            const db = getFirestoreAdmin();
            const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
            const userSnap = await userRef.get();

            if (!userSnap.exists) {
                const newUser: Partial<User> = {
                    id: userId,
                    email: normalizedEmail,
                    name: name || undefined,
                    status: 'active',
                    emailVerified: true,
                    stripeCustomerId: stripeCustomerId || undefined,
                    dashboardToken: uuidv4(),
                    activeServices: {
                        marketplace: false,
                        whatsapp: false,
                        subscriptions: false,
                        custom_solutions: false,
                        care_plan: 'none'
                    },
                    preferences: {
                        language: 'en',
                        emailNotifications: true,
                        smsNotifications: false
                    },
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                };
                await userRef.set(newUser);

                // Legacy clients backup
                await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(userId).set({
                    email: normalizedEmail,
                    name: name || 'Valued Client',
                    status: 'qualified',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            } else {
                const updates: any = { updatedAt: Timestamp.now() };
                if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId;
                if (name) updates.name = name;
                await userRef.update(updates);
            }
        });

        return userId;
    }

    /**
     * Provisions a service based on product metadata.
     *
     * [MIGRATION] Phase 2: Postgres is PRIMARY (transactional), Firestore is backup.
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
        const db = getFirestoreAdmin();
        const customerName = params.stripeSession?.customer_details?.name || params.metadata.customerName || 'Valued Client';
        const userId = await this.getOrCreateUser(params.email, customerName, params.stripeSession?.customer);

        // ═══════════════════════════════════════════════
        // 1. Marketplace Template Handling
        // ═══════════════════════════════════════════════
        if (params.flowType === 'marketplace-template') {
            const templateId = params.productId;
            const tokenData = `${templateId}:${params.email}:${Date.now()}`;
            const downloadToken = Buffer.from(tokenData).toString('base64url');
            const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rensto.com'}/api/marketplace/download/${downloadToken}`;

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
                    name: (params.productName || 'Solution Engine').replace('Rensto ', ''),
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

            // ── BACKUP: Firestore (non-blocking) ──
            await firestoreBackupWrite('provisionService.marketplace', async () => {
                await db.collection(COLLECTIONS.PURCHASES).add({
                    userId, templateId, customerEmail: params.email,
                    stripeSessionId: params.stripeSessionId,
                    downloadToken, downloadUrl, tier: params.metadata.tier,
                    timestamp: Timestamp.now(),
                });
                if (isCore7) {
                    const engineId = serviceInstance?.id || uuidv4();
                    await db.collection(COLLECTIONS.SERVICE_INSTANCES).doc(engineId).set({
                        id: engineId, clientId: userId, clientEmail: params.email,
                        productId: templateId, productName: params.productName,
                        status: 'pending_setup', type: 'marketplace_implementation',
                        stripeSessionId: params.stripeSessionId,
                        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
                    });
                }
            });

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
                name: (params.productName || 'WhatsApp AI Agent').replace('Rensto ', ''),
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

            // ── BACKUP: Firestore (non-blocking) ──
            await firestoreBackupWrite('provisionService.managedPlan', async () => {
                const subDoc = await db.collection(COLLECTIONS.SUBSCRIPTIONS).add({
                    userId, userEmail: params.email,
                    stripeSubscriptionId: params.stripeSubscriptionId,
                    stripeCustomerId: params.stripeSession?.customer,
                    subscriptionType: 'whatsapp',
                    whatsappBundle: params.metadata.whatsappBundle || 'manual_custom',
                    amount: params.stripeSession?.amount_total || 0,
                    status: 'active', currentPeriodStart: Timestamp.now(),
                    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
                });
                await db.collection(COLLECTIONS.WHATSAPP_INSTANCES).doc(whatsappInstance.id).set({
                    id: whatsappInstance.id, userId, userEmail: params.email,
                    businessName: `${customerName}'s Business`,
                    bundle: params.metadata.whatsappBundle || 'custom',
                    status: 'pending_setup', subscriptionId: subDoc.id,
                    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
                });
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

            // ── BACKUP: Firestore (non-blocking) ──
            await firestoreBackupWrite('provisionService.registryPurchase', async () => {
                const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
                const fsUpdates: any = { updatedAt: Timestamp.now() };
                if (entitlements.featureFlags) {
                    const userSnap = await userRef.get();
                    const currentFlags = (userSnap.data() as any)?.entitlements?.pillars || [];
                    fsUpdates['entitlements.pillars'] = Array.from(new Set([...currentFlags, ...entitlements.featureFlags]));
                }
                if (pPillarId) {
                    const serviceKey = pPillarId === 'lead-machine' ? 'leads' :
                        pPillarId === 'autonomous-secretary' ? 'whatsapp' :
                            pPillarId.replace(/-/g, '_');
                    fsUpdates[`activeServices.${serviceKey}`] = true;
                }
                await userRef.update(fsUpdates);
            });

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
}
