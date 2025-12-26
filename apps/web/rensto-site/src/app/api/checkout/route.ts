import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

// Subscription Product Map
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
    }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
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

        // 1. All-Access Subscription
        if (flowType === 'subscription' && productId === 'all-access') {
            mode = 'subscription';
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: SUBSCRIPTIONS['all-access'].name,
                        description: SUBSCRIPTIONS['all-access'].description,
                    },
                    unit_amount: SUBSCRIPTIONS['all-access'].price,
                    recurring: { interval: 'month' },
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
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            customer_email: customerEmail,
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: mode,
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
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
            details: { body: await req.clone().json().catch(() => ({})) }
        });
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
