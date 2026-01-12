import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

// Subscription & Managed Plan Map
const SUBSCRIPTIONS = {
    'all-access': {
        name: 'Rensto All-Access Pass',
        description: 'Monthly unlimited access to all workflows, agents, and the Model Optimizer.',
        priceId: 'price_all_access_placeholder', // To be created if needed, keeping for now
        unitAmount: 49700
    },
    'managed-base': {
        name: 'Managed WhatsApp Agent - Base',
        description: 'Elite Level Architecture + Dedicated Instance',
        priceId: 'price_managed_base_placeholder',
        unitAmount: 24900,
        setupFee: 49900
    },
    'starter-care': {
        name: 'Starter Care Plan',
        description: 'Monitor automations, fix breaks, 1 monthly check-in. (5 hrs/mo)',
        priceId: 'price_1SniAJDE8rt1dEs181LWczCJ'
    },
    'growth-care': {
        name: 'Growth Care Plan',
        description: 'Build new automations, optimization, strategy calls. (15 hrs/mo)',
        priceId: 'price_1SniAKDE8rt1dEs1o3M5ieNG'
    },
    'scale-care': {
        name: 'Scale Care Plan',
        description: 'Dedicated engineer, custom features, priority response. (40 hrs/mo)',
        priceId: 'price_1SniAKDE8rt1dEs1T4QKSDDt'
    }
} as const;

// One-time Service Offers Map (Now Recurring Pillars)
const SERVICES = {
    'automation-audit': {
        name: 'Automation Audit & Gap Analysis',
        description: 'AI-driven analysis of your business processes and automation opportunities.',
        unitAmount: 49700
    },
    'crm-setup': {
        name: 'done-for-you CRM Integration',
        description: 'Expert configuration of your CRM webhook connection.',
        unitAmount: 29700
    },
    'the-lead-machine': {
        name: 'The Lead Machine',
        description: 'Autonomous outbound engine sourcing leads, enriching data, and sending custom outreach 24/7.',
        priceId: 'price_1SnYffDE8rt1dEs1oFKGGkQx'
    },
    'autonomous-secretary': {
        name: 'Voice AI Agent',
        description: 'AI assistant handling messages, booking meetings, and managing clients on WhatsApp 24/7.',
        priceId: 'price_1SniAIDE8rt12LERfNwT'
    },
    'knowledge-engine': {
        name: 'Knowledge Engine',
        description: 'Private intelligence system connected to your company data and best practices.',
        priceId: 'price_1SniAIDE8rt1dEs1K6TItcyb'
    },
    'the-content-engine': {
        name: 'The Content Engine',
        description: 'Autonomous systems for high-authority content generation and distribution.',
        priceId: 'price_1SniAJDE8rt1dEs1Cn01ETVN'
    },
    'full-ecosystem': {
        name: 'Full Automation Ecosystem',
        description: 'All four pillars of Rensto automation plus premium support and custom integrations.',
        priceId: 'price_1SniAJDE8rt1dEs1477uILmI'
    }
} as const;

// Lead Pack Maps
const LEAD_PACKS = {
    'lead-pack-starter': {
        name: 'Lead Machine: Starter Pack (50 leads)',
        description: '50 verified leads with AI icebreakers.',
        unitAmount: 14900,
        leads: 50
    },
    'lead-pack-growth': {
        name: 'Lead Machine: Growth Pack (100 leads)',
        description: '100 verified leads with AI icebreakers.',
        unitAmount: 24900,
        leads: 100
    },
    'lead-pack-scale': {
        name: 'Lead Machine: Scale Pack (500 leads)',
        description: '500 verified leads with AI icebreakers.',
        unitAmount: 99900,
        leads: 500
    }
} as const;

export async function POST(req: Request) {
    let body: any = {};
    try {
        body = await req.json();
        const {
            flowType, // 'subscription' | 'marketplace-template' | 'managed-plan'
            productId,
            tier,
            customerEmail,
            metadata = {}
        } = body;

        const db = getFirestoreAdmin();
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        let mode: Stripe.Checkout.Session.Mode = 'payment';

        // 1. Subscription Products (All-Access, Care Plans)
        if (flowType === 'subscription') {
            mode = 'subscription';
            const subKey = productId as keyof typeof SUBSCRIPTIONS;
            const sub = SUBSCRIPTIONS[subKey];

            if (!sub) {
                return NextResponse.json({ error: 'Subscription product not found' }, { status: 404 });
            }

            if (sub.priceId && sub.priceId.startsWith('price_')) {
                // Use static Price ID
                lineItems.push({
                    price: sub.priceId,
                    quantity: 1,
                });
            } else {
                // Fallback for placeholders
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: sub.name,
                            description: sub.description,
                        },
                        unit_amount: (sub as any).unitAmount || (sub as any).price,
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                });
            }
        }

        // 2. Marketplace Blueprint Download
        else if (flowType === 'marketplace-template') {
            mode = 'payment';

            // Fetch workflow data from Firestore
            const docRef = db.collection(COLLECTIONS.TEMPLATES).doc(productId);
            const doc = await docRef.get();

            if (!doc.exists) {
                await auditAgent.log({
                    service: 'other',
                    action: 'checkout_failed',
                    status: 'error',
                    errorMessage: `Workflow ${productId} not found in Firestore`,
                    details: { productId, flowType }
                });
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            const workflow = doc.data();
            const workflowName = workflow?.name || 'Workflow Blueprint';

            // Determine price based on tier (download, install, custom)
            let unitAmount = (workflow?.price || 97) * 100;
            if (tier === 'install') unitAmount = (workflow?.installPrice || 797) * 100;
            if (tier === 'custom') unitAmount = (workflow?.customPrice || 1497) * 100;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${workflowName} (${tier.toUpperCase()})`,
                        description: `Secure access to the Rensto ${tier} solution for: ${workflowName}`,
                    },
                    unit_amount: Math.round(unitAmount),
                },
                quantity: 1,
            });

            // Merge details into metadata for webhook processing
            Object.assign(metadata, {
                workflowId: productId,
                workflowName: workflowName,
                tier: tier
            });
        }

        // 3. Managed WhatsApp Plan
        else if (flowType === 'managed-plan') {
            mode = 'subscription';
            const plan = SUBSCRIPTIONS['managed-base'];
            const { selectedAddons = [], extraNumbers = 0 } = body;

            // Base Plan
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.name,
                        description: plan.description,
                    },
                    unit_amount: plan.unitAmount,
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            });

            // Base Setup Fee
            if (plan.setupFee) {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Implementation & Setup Fee',
                            description: 'Professional architecture configuration',
                        },
                        unit_amount: plan.setupFee,
                    },
                    quantity: 1,
                });
            }

            // Dynamic Add-ons
            const ADDON_DATA: Record<string, { name: string, price: number, setup: number }> = {
                'media': { name: 'Send Photos & Quotes', price: 7900, setup: 19900 },
                'handoff': { name: 'Alert Me Button', price: 19900, setup: 39900 },
                'groups': { name: 'Team Inbox', price: 14900, setup: 29900 },
                'broadcast': { name: 'Broadcast Pack', price: 19900, setup: 29900 },
                'interactive': { name: 'Smart Menus', price: 9900, setup: 19900 },
                'reliability': { name: 'Multi-Location', price: 24900, setup: 49900 },
                'security': { name: 'Security Hardening', price: 14900, setup: 39900 }
            };

            for (const addonId of selectedAddons) {
                const addon = ADDON_DATA[addonId];
                if (addon) {
                    // Recurring part
                    lineItems.push({
                        price_data: {
                            currency: 'usd',
                            product_data: { name: `Add-on: ${addon.name}`, description: 'Monthly subscription' },
                            unit_amount: addon.price,
                            recurring: { interval: 'month' },
                        },
                        quantity: 1,
                    });
                    // One-time setup part
                    lineItems.push({
                        price_data: {
                            currency: 'usd',
                            product_data: { name: `Setup: ${addon.name}`, description: 'One-time configuration' },
                            unit_amount: addon.setup,
                        },
                        quantity: 1,
                    });
                }
            }

            // Extra Numbers
            if (extraNumbers > 0) {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Extra WhatsApp Numbers', description: 'Additional active sessions' },
                        unit_amount: 14900,
                        recurring: { interval: 'month' },
                    },
                    quantity: extraNumbers,
                });
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Extra Numbers Setup', description: 'Session provisioning' },
                        unit_amount: 9900,
                    },
                    quantity: extraNumbers,
                });
            }

            // Map frontend bundle ID to Firestore enum
            let whatsappBundleString = '';
            if (body.selectedBundleId === 'bundle-1') whatsappBundleString = 'never_miss_lead';
            else if (body.selectedBundleId === 'bundle-2') whatsappBundleString = 'auto_qualify_book';
            else if (body.selectedBundleId === 'bundle-3') whatsappBundleString = 'full_ai_sales_rep';

            Object.assign(metadata, {
                selectedAddons: selectedAddons.join(','),
                extraNumbers: extraNumbers.toString(),
                whatsappBundle: whatsappBundleString
            });
        }

        // 4. One-time Service Purchases (Audit, Sprint)
        else if (flowType === 'service-purchase') {
            const serviceKey = productId as keyof typeof SERVICES;
            const service = SERVICES[serviceKey];

            if (!service) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }

            if ('priceId' in service && service.priceId) {
                // Official Pillar -> Subscription mode
                mode = 'subscription';
                lineItems.push({
                    price: service.priceId as string,
                    quantity: 1,
                });
            } else {
                // One-time Audit -> Payment mode
                mode = 'payment';
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: service.name,
                            description: service.description,
                        },
                        unit_amount: (service as any).unitAmount || (service as any).price,
                    },
                    quantity: 1,
                });
            }
        }

        // 5. Pillar-Purchase (for dashboard entitlements - leads, outreach, voice, content)
        else if (flowType === 'pillar-purchase') {
            mode = 'subscription';
            const pillarId = productId as 'leads' | 'outreach' | 'voice' | 'content';

            const PILLAR_PRICES: Record<string, { priceId: string; name: string; description: string }> = {
                'leads': {
                    priceId: 'price_1SnYffDE8rt1dEs1oFKGGkQx', // The Lead Machine
                    name: 'Get More Leads',
                    description: 'Automated lead generation for your business'
                },
                'outreach': {
                    priceId: 'price_1SniAIDE8rt12LERfNwT', // Voice AI / same tier
                    name: 'Automated Outreach',
                    description: 'Email & SMS follow-up sequences'
                },
                'voice': {
                    priceId: 'price_1SniAIDE8rt12LERfNwT',
                    name: 'AI Phone Agent',
                    description: '24/7 AI voice assistant'
                },
                'content': {
                    priceId: 'price_1SniAJDE8rt1dEs1Cn01ETVN',
                    name: 'Content Engine',
                    description: 'Automated content generation & publishing'
                }
            };

            const pillar = PILLAR_PRICES[pillarId];
            if (!pillar) {
                return NextResponse.json({ error: 'Invalid pillar ID' }, { status: 400 });
            }

            lineItems.push({
                price: pillar.priceId,
                quantity: 1,
            });

            Object.assign(metadata, {
                pillarId,
                pillarName: pillar.name
            });
        }

        // 6. Lead-Pack Purchase
        else if (flowType === 'lead-pack') {
            mode = 'payment';
            const packKey = productId as keyof typeof LEAD_PACKS;
            const pack = LEAD_PACKS[packKey];

            if (!pack) {
                return NextResponse.json({ error: 'Lead pack not found' }, { status: 404 });
            }

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: pack.name,
                        description: pack.description,
                    },
                    unit_amount: pack.unitAmount,
                },
                quantity: 1,
            });

            Object.assign(metadata, {
                packId: productId,
                leadsCount: pack.leads.toString()
            });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail,
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: mode,
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}&tier=${tier || ''}`,
            cancel_url: `${origin}/pricing`,
            metadata: {
                ...metadata,
                flowType,
                productId,
                tier,
                platform: 'rensto-firebase'
            }
        });

        await auditAgent.log({
            service: 'stripe',
            action: 'checkout_session_created',
            status: 'success',
            details: { sessionId: session.id, flowType, productId, customerEmail }
        });

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        await auditAgent.log({
            service: 'stripe',
            action: 'checkout_session_failed',
            status: 'error',
            errorMessage: err.message,
            details: { body: body || {} }
        });
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
