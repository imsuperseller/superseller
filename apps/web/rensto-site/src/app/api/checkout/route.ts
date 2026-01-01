import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

// Subscription & Managed Plan Map
const SUBSCRIPTIONS = {
    'all-access': {
        name: 'Rensto All-Access Pass',
        description: 'Monthly unlimited access to all workflows, agents, and the Model Optimizer.',
        price: 49700,
        mode: 'subscription',
        interval: 'month'
    },
    'managed-base': {
        name: 'Managed WhatsApp Agent - Base',
        description: 'Elite Level Architecture + Dedicated Instance',
        price: 24900,
        mode: 'subscription',
        interval: 'month',
        setupFee: 49900
    },
    'starter-care': {
        name: 'Starter Care Plan',
        description: '5 hours/mo development + system monitoring.',
        price: 49700,
        mode: 'subscription',
        interval: 'month'
    },
    'growth-care': {
        name: 'Growth Care Plan',
        description: '15 hours/mo development + priority support.',
        price: 99700,
        mode: 'subscription',
        interval: 'month'
    },
    'scale-care': {
        name: 'Scale Care Plan',
        description: '40 hours/mo development + dedicated engineer.',
        price: 249700,
        mode: 'subscription',
        interval: 'month'
    }
} as const;

// One-time Service Offers Map
const SERVICES = {
    'automation-audit': {
        name: 'Automation Audit & Gap Analysis',
        description: 'AI-driven analysis of your business processes and automation opportunities.',
        price: 49700
    },
    'the-lead-machine': {
        name: 'The Lead Machine',
        description: 'Autonomous outbound engine sourcing leads, enriching data, and sending custom outreach 24/7.',
        price: 99700
    },
    'autonomous-secretary': {
        name: 'Autonomous Secretary',
        description: 'AI assistant handling messages, booking meetings, and managing clients on WhatsApp 24/7.',
        price: 49700
    },
    'knowledge-engine': {
        name: 'Knowledge Engine',
        description: 'Private intelligence system connected to your company data and best practices.',
        price: 149700
    },
    'the-content-engine': {
        name: 'The Content Engine',
        description: 'Autonomous systems for high-authority content generation and distribution.',
        price: 149700
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

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: sub.name,
                        description: sub.description,
                    },
                    unit_amount: sub.price,
                    recurring: { interval: sub.interval as any },
                },
                quantity: 1,
            });
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
                    unit_amount: plan.price,
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
                'media': { name: 'Media Messaging Pack', price: 7900, setup: 19900 },
                'handoff': { name: 'Human Handoff Inbox', price: 19900, setup: 39900 },
                'groups': { name: 'Groups Automation', price: 14900, setup: 29900 },
                'broadcast': { name: 'Broadcast Pack', price: 19900, setup: 29900 },
                'interactive': { name: 'Interactive Pack', price: 9900, setup: 19900 },
                'presence': { name: 'Presence Timing', price: 9900, setup: 19900 },
                'labels': { name: 'Business Labels', price: 7900, setup: 19900 },
                'read_ops': { name: 'Read Operations', price: 7900, setup: 19900 },
                'profile': { name: 'Profile Management', price: 4900, setup: 9900 },
                'security': { name: 'Security Hardening', price: 14900, setup: 39900 },
                'reliability': { name: 'Reliability & Scale', price: 24900, setup: 49900 }
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

            Object.assign(metadata, {
                selectedAddons: selectedAddons.join(','),
                extraNumbers: extraNumbers.toString()
            });
        }

        // 4. One-time Service Purchases (Audit, Sprint)
        else if (flowType === 'service-purchase') {
            mode = 'payment';
            const serviceKey = productId as keyof typeof SERVICES;
            const service = SERVICES[serviceKey];

            if (!service) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: service.name,
                        description: service.description,
                    },
                    unit_amount: service.price,
                },
                quantity: 1,
            });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
