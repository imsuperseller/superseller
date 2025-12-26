import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

// Unified Product Map
const PRODUCTS = {
    'all-access': {
        name: 'Rensto All-Access Pass',
        description: 'Monthly unlimited access to all workflows, agents, and the Model Optimizer.',
        price: 49700,
        mode: 'subscription',
        interval: 'month'
    },
    'individual-blueprint': {
        name: 'Marketplace Blueprint',
        mode: 'payment',
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

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        let mode: Stripe.Checkout.Session.Mode = 'payment';

        // 1. All-Access Subscription
        if (flowType === 'subscription' && productId === 'all-access') {
            mode = 'subscription';
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: PRODUCTS['all-access'].name,
                        description: PRODUCTS['all-access'].description,
                    },
                    unit_amount: PRODUCTS['all-access'].price,
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            });
        }

        // 2. Marketplace Blueprint Download
        else if (flowType === 'marketplace-template') {
            mode = 'payment';
            const price = body.price || 9700; // Default if not provided
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: metadata.workflowName || 'Workflow Blueprint Download',
                        description: 'Secure JSON file download + setup guide',
                    },
                    unit_amount: price,
                },
                quantity: 1,
            });
        }

        // 3. Managed WhatsApp Plan (Legacy but support built-in)
        else if (flowType === 'managed-plan') {
            mode = 'subscription';
            const plan = PRODUCTS['managed-base'];
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
                tier
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
