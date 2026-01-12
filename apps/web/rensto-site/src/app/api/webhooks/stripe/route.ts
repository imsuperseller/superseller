import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';
import { emails } from '@/lib/email';

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

            // 1. Log payment event to Firestore
            const db = getFirestoreAdmin();
            await db.collection('payments').add({
                stripeSessionId: session.id,
                customerId: session.customer,
                customerEmail: session.customer_details?.email || null,
                amountTotal: session.amount_total ?? 0,
                currency: session.currency || 'usd',
                flowType: metadata.flowType || 'unknown',
                productId: metadata.productId || metadata.workflowId || null,
                tier: metadata.tier || null,
                platform: metadata.platform || 'rensto-web',
                timestamp: Timestamp.now()
            });

            // 2. Specialized handling for Marketplace Templates
            if (metadata.flowType === 'marketplace-template') {
                const templateId = (metadata.productId || metadata.workflowId) as string;
                const customerEmail = session.customer_details?.email;
                const customerName = session.customer_details?.name || 'Valued Client';

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

                // CORE 7 UPGRADE: If this is a Core 7 template, provision a service instance for "Activation"
                const CORE_7_IDS = [
                    '4OYGXXMYeJFfAo6X', // Celebrity Selfie
                    '8GC371u1uBQ8WLmu', // Meta Ad Analyzer
                    '5pMi01SwffYB6KeX', // YouTube Clone
                    'U6EZ2iLQ4zCGg31H', // Call Analyzer
                    '5Fl9WUjYTpodcloJ', // Calendar Assistant
                    'stj8DmATqe66D9j4', // Floor Plan Property Tour
                    'vCxY2DXUZ8vUb30f'  // CRO Insights
                ];

                if (CORE_7_IDS.includes(templateId)) {
                    await db.collection(COLLECTIONS.SERVICE_INSTANCES).add({
                        clientId: metadata.clientId || session.id, // Use metadata.clientId
                        clientEmail: customerEmail,
                        productName: metadata.productName || 'Rensto Template',
                        productId: templateId,
                        status: 'pending_setup',
                        type: 'marketplace_implementation',
                        stripeSessionId: session.id,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                }

                await auditAgent.log({
                    service: 'firebase',
                    action: 'purchase_recorded',
                    status: 'success',
                    details: { templateId, customerEmail, downloadUrl }
                });

                // Send download delivery email
                if (customerEmail) {
                    await emails.downloadDelivery(
                        customerEmail,
                        metadata.productName || 'Rensto Template',
                        downloadUrl,
                        session.id
                    );
                }
            }

            // 3. Specialized handling for Service Purchases (e.g. Automation Audit)
            if (metadata.flowType === 'service-purchase') {
                const customerEmail = session.customer_details?.email;
                if (customerEmail) {
                    const clientsRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS);
                    const userDocId = customerEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    const userRef = db.collection(COLLECTIONS.USERS).doc(userDocId);

                    // Check if client already exists in custom solutions
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
                        await clientsRef.add({ ...clientData, createdAt: Timestamp.now() });
                    } else {
                        await existingClient.docs[0].ref.update(clientData);
                    }

                    // [NEW] Entitlement Sync: If this is the Lead Machine, grant pillar access
                    if (metadata.productId === 'the-lead-machine') {
                        const userSnap = await userRef.get();
                        if (userSnap.exists) {
                            const userData = userSnap.data()!;
                            const currentPillars = userData.entitlements?.pillars || [];
                            if (!currentPillars.includes('leads')) {
                                await userRef.update({
                                    'entitlements.pillars': Array.from(new Set([...currentPillars, 'leads', 'outreach'])),
                                    'entitlements.freeLeadsTrial': false,
                                    updatedAt: Timestamp.now()
                                });
                            }
                        } else {
                            // Create user with lead entitlement if they don't exist
                            await userRef.set({
                                email: customerEmail.toLowerCase(),
                                name: session.customer_details?.name || null,
                                createdAt: Timestamp.now(),
                                dashboardToken: require('uuid').v4().slice(0, 8),
                                stripeCustomerId: session.customer,
                                entitlements: {
                                    freeLeadsTrial: false,
                                    freeLeadsRemaining: 0,
                                    pillars: ['leads', 'outreach'],
                                    marketplaceProducts: [],
                                    customSolution: null
                                }
                            });
                        }
                    }

                    // Send welcome email for service purchases
                    await emails.welcome(customerEmail, session.customer_details?.name || undefined);

                    // Send receipt
                    if (session.amount_total) {
                        await emails.invoiceReceipt(
                            customerEmail,
                            metadata.productId || 'Automation Service',
                            session.amount_total / 100,
                            session.id
                        );
                    }
                }
            }

            // NEW: Handle Pillar/Service Purchases (Get More Leads, Automated Outreach, etc.)
            if (metadata.flowType === 'pillar-purchase' || metadata.flowType === 'service-pillar') {
                const customerEmail = session.customer_details?.email?.toLowerCase();
                const pillarId = metadata.pillarId as 'leads' | 'outreach' | 'voice' | 'content';

                if (customerEmail && pillarId) {
                    // Find user by email
                    const userDocId = customerEmail.replace(/[^a-z0-9]/g, '_');
                    const userRef = db.collection('users').doc(userDocId);
                    const userSnap = await userRef.get();

                    if (userSnap.exists) {
                        const userData = userSnap.data()!;
                        const currentPillars: string[] = userData.entitlements?.pillars || [];

                        // Add pillar if not already present
                        if (!currentPillars.includes(pillarId)) {
                            const updatedPillars = [...currentPillars, pillarId];
                            await userRef.update({
                                'entitlements.pillars': updatedPillars,
                                'entitlements.freeLeadsTrial': pillarId === 'leads' ? false : userData.entitlements?.freeLeadsTrial,
                                'stripeCustomerId': session.customer,
                                updatedAt: Timestamp.now()
                            });

                            await auditAgent.log({
                                service: 'stripe',
                                action: 'pillar_entitlement_granted',
                                status: 'success',
                                details: { email: customerEmail, pillar: pillarId, allPillars: updatedPillars }
                            });
                        }
                    } else {
                        // Create new user with pillar entitlement
                        await userRef.set({
                            email: customerEmail,
                            name: session.customer_details?.name || null,
                            createdAt: Timestamp.now(),
                            dashboardToken: require('uuid').v4().slice(0, 8),
                            stripeCustomerId: session.customer,
                            entitlements: {
                                freeLeadsTrial: false,
                                freeLeadsRemaining: 0,
                                pillars: [pillarId],
                                marketplaceProducts: [],
                                customSolution: null
                            }
                        });

                        await auditAgent.log({
                            service: 'stripe',
                            action: 'user_created_with_pillar',
                            status: 'success',
                            details: { email: customerEmail, pillar: pillarId }
                        });
                    }

                    // Send welcome email
                    await emails.welcome(customerEmail, session.customer_details?.name || undefined);
                }
            }

            // 4. Specialized handling for Managed Plans (WhatsApp)
            if (metadata.flowType === 'managed-plan') {
                const customerEmail = session.customer_details?.email?.toLowerCase();
                const userName = session.customer_details?.name || 'Valued Client';

                if (customerEmail) {
                    const usersRef = db.collection(COLLECTIONS.USERS);
                    const subscriptionsRef = db.collection(COLLECTIONS.SUBSCRIPTIONS);
                    const instancesRef = db.collection(COLLECTIONS.WHATSAPP_INSTANCES);

                    // A. Find or Create User
                    let userId = '';
                    const existingUser = await usersRef.where('email', '==', customerEmail).limit(1).get();

                    if (existingUser.empty) {
                        const newUser = await usersRef.add({
                            email: customerEmail,
                            name: userName,
                            status: 'active',
                            emailVerified: true,
                            businessType: 'other', // Default, user can update later
                            businessSize: 'small_team',
                            activeServices: {
                                marketplace: false,
                                whatsapp: true,
                                subscriptions: true,
                                care_plan: 'none'
                            },
                            stripeCustomerId: session.customer,
                            source: 'paid_ad', // Assumed from checkout
                            createdAt: Timestamp.now(),
                            updatedAt: Timestamp.now()
                        });
                        userId = newUser.id;
                    } else {
                        userId = existingUser.docs[0].id;
                        await usersRef.doc(userId).update({
                            'activeServices.whatsapp': true,
                            'activeServices.subscriptions': true,
                            stripeCustomerId: session.customer,
                            updatedAt: Timestamp.now()
                        });
                    }

                    // B. Create Subscription Record
                    const subscriptionData = {
                        userId,
                        userEmail: customerEmail,
                        stripeSubscriptionId: session.subscription as string,
                        stripeCustomerId: session.customer as string,
                        stripePriceId: metadata.priceId || 'managed-base', // Ideally from line items but metadata is easier
                        subscriptionType: 'whatsapp',
                        whatsappBundle: metadata.whatsappBundle || 'manual_custom',
                        amount: session.amount_total || 0,
                        currency: session.currency || 'usd',
                        billingInterval: 'month',
                        status: 'active',
                        currentPeriodStart: Timestamp.now(),
                        currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Approx
                        cancelAtPeriodEnd: false,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    };
                    const subDoc = await subscriptionsRef.add(subscriptionData);

                    // C. Create WhatsApp Instance
                    // Derive features based on bundle
                    const bundle = metadata.whatsappBundle;
                    const features = {
                        instantResponse: true,
                        faqAutoAnswer: true,
                        leadCapture: true,
                        qualification: false,
                        appointmentBooking: false,
                        quoteSending: false,
                        objectionHandling: false,
                        multiLanguage: false,
                        humanEscalation: false
                    };

                    if (bundle === 'auto_qualify_book' || bundle === 'full_ai_sales_rep') {
                        features.qualification = true;
                        features.appointmentBooking = true;
                    }
                    if (bundle === 'full_ai_sales_rep') {
                        features.quoteSending = true;
                        features.objectionHandling = true;
                        features.multiLanguage = true;
                        features.humanEscalation = true;
                    }

                    // Parse Addons
                    const addonList = metadata.selectedAddons ? (metadata.selectedAddons as string).split(',') : [];
                    const addOns = {
                        sendPhotosQuotes: addonList.includes('media'),
                        teamInbox: addonList.includes('groups'),
                        smartMenus: addonList.includes('interactive'),
                        multiLocation: addonList.includes('reliability')
                    };

                    await instancesRef.add({
                        userId,
                        userEmail: customerEmail,
                        businessName: userName + "'s Business", // Placeholder
                        businessType: 'other',
                        phoneNumber: '', // To be provisioned
                        bundle: bundle || 'custom',
                        bundleFeatures: features,
                        addOns: addOns,
                        status: 'pending_setup',
                        metrics: {
                            totalMessages: 0,
                            averageResponseTime: 0,
                            leadsCaptured: 0,
                            appointmentsBooked: 0,
                            quotesSent: 0,
                            humanEscalations: 0
                        },
                        subscriptionId: subDoc.id,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });

                    await auditAgent.log({
                        service: 'firebase',
                        action: 'managed_plan_provisioned_v2',
                        status: 'success',
                        details: {
                            userId,
                            email: customerEmail,
                            bundle: metadata.whatsappBundle,
                            subscriptionId: subDoc.id
                        }
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

            // 7. Lead Pack Purchases
            if (metadata.flowType === 'lead-pack') {
                const customerEmail = session.customer_details?.email?.toLowerCase();
                const leadsCount = parseInt(metadata.leadsCount || '0', 10);

                if (customerEmail && leadsCount > 0) {
                    const userDocId = customerEmail.replace(/[^a-z0-9]/g, '_');
                    const userRef = db.collection(COLLECTIONS.USERS).doc(userDocId);
                    const userSnap = await userRef.get();

                    if (userSnap.exists) {
                        const userData = userSnap.data()!;
                        const currentLeads = userData.entitlements?.freeLeadsRemaining || 0;
                        const currentPillars = userData.entitlements?.pillars || [];

                        // Grant access to leads and outreach if missing
                        const newPillars = Array.from(new Set([...currentPillars, 'leads', 'outreach']));

                        await userRef.update({
                            'entitlements.freeLeadsRemaining': currentLeads + leadsCount,
                            'entitlements.freeLeadsTrial': false,
                            'entitlements.pillars': newPillars,
                            updatedAt: Timestamp.now()
                        });

                        await auditAgent.log({
                            service: 'stripe',
                            action: 'lead_pack_provisioned',
                            status: 'success',
                            details: { email: customerEmail, leadsAdded: leadsCount, totalLeads: currentLeads + leadsCount }
                        });
                    }
                }
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
