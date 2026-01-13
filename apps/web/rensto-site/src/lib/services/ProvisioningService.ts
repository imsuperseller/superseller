import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import registry from '../../../../../../configs/service-registry.json';
import { User, ServiceInstance, Subscription } from '@/types/firestore';
import { PRODUCT_REGISTRY } from '@/lib/registry/ProductRegistry';

export class ProvisioningService {
    /**
     * Standardizes User Identity across all flows.
     * Uses email-based ID for consistency and easy lookup.
     */
    static async getOrCreateUser(email: string, name?: string, stripeCustomerId?: string): Promise<string> {
        const db = getFirestoreAdmin();
        const normalizedEmail = email.toLowerCase().trim();
        const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');
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

            // For backward compatibility, also update legacy clients
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
        const db = getFirestoreAdmin();
        const customerName = params.stripeSession?.customer_details?.name || params.metadata.customerName || 'Valued Client';
        const userId = await this.getOrCreateUser(params.email, customerName, params.stripeSession?.customer);

        // 1. Marketplace Template Handling (with Secure Download)
        if (params.flowType === 'marketplace-template') {
            const templateId = params.productId;
            const tokenData = `${templateId}:${params.email}:${Date.now()}`;
            const downloadToken = Buffer.from(tokenData).toString('base64url');
            const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rensto.com'}/api/marketplace/download/${downloadToken}`;

            await db.collection(COLLECTIONS.PURCHASES).add({
                userId,
                templateId,
                customerEmail: params.email,
                stripeSessionId: params.stripeSessionId,
                downloadToken,
                downloadUrl,
                tier: params.metadata.tier,
                timestamp: Timestamp.now()
            });

            // Trigger Email (handled by caller or via internal service)
            // Provision Core 7 Activation if applicable
            if (registry.products.core7.ids.includes(templateId)) {
                await db.collection(COLLECTIONS.SERVICE_INSTANCES).add({
                    clientId: userId,
                    clientEmail: params.email,
                    productId: templateId,
                    productName: params.productName,
                    status: 'pending_setup',
                    type: 'marketplace_implementation',
                    stripeSessionId: params.stripeSessionId,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }
            return { userId, downloadUrl };
        }

        // 2. Managed Plan Handling (WhatsApp)
        if (params.flowType === 'managed-plan') {
            // Subscription Record
            const subDoc = await db.collection(COLLECTIONS.SUBSCRIPTIONS).add({
                userId,
                userEmail: params.email,
                stripeSubscriptionId: params.stripeSubscriptionId,
                stripeCustomerId: params.stripeSession?.customer,
                subscriptionType: 'whatsapp',
                whatsappBundle: params.metadata.whatsappBundle || 'manual_custom',
                amount: params.stripeSession?.amount_total || 0,
                status: 'active',
                currentPeriodStart: Timestamp.now(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            // Instance Provisioning
            await db.collection(COLLECTIONS.WHATSAPP_INSTANCES).add({
                userId,
                userEmail: params.email,
                businessName: `${customerName}'s Business`,
                bundle: params.metadata.whatsappBundle || 'custom',
                status: 'pending_setup',
                subscriptionId: subDoc.id,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

            return { userId, subscriptionId: subDoc.id };
        }

        // 3. Registry-Driven Purchase (Pillars & Services)
        const product = PRODUCT_REGISTRY[params.productId];

        if (product) {
            const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
            const userSnap = await userRef.get();
            const userData = userSnap.data() as User;

            const updates: any = { updatedAt: Timestamp.now() };

            // Apply Feature Flags/Entitlements
            if (product.entitlements.featureFlags) {
                const currentFlags = userData.entitlements?.pillars || [];
                const newFlags = Array.from(new Set([...currentFlags, ...product.entitlements.featureFlags]));
                updates['entitlements.pillars'] = newFlags;
            }

            // Pillar-Specific Activation
            const pillarId = product.pillarId || params.metadata.pillarId;
            if (pillarId) {
                // Keep camelCase/snakeCase consistency with types/firestore.ts
                const serviceKey = pillarId === 'lead-machine' ? 'leads' :
                    pillarId === 'autonomous-secretary' ? 'whatsapp' :
                        pillarId.replace(/-/g, '_');
                updates[`activeServices.${serviceKey}`] = true;
            }

            await userRef.update(updates);

            // 4. Trigger n8n Fulfillment Hook if defined
            if (product.n8nWebhookId && process.env.N8N_OPTIMIZER_WEBHOOK) {
                try {
                    // Send to n8n for orchestration
                    await fetch(process.env.N8N_OPTIMIZER_WEBHOOK, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'provisioning_trigger',
                            productId: product.id,
                            pillarId: pillarId || '',
                            webhookId: product.n8nWebhookId,
                            userId,
                            email: params.email,
                            stripeSessionId: params.stripeSessionId
                        })
                    });
                } catch (err) {
                    console.error('Failed to trigger n8n provisioning:', err);
                }
            }
        }

        return { userId };
    }
}
