import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

// Price Map (In a real app, this should be in a DB or config)
const PRICES = {
    base: 24900, // $249.00
    base_setup: 49900, // $499.00
    addons: {
        media: { price: 7900, setup: 19900 },
        handoff: { price: 19900, setup: 39900 },
        groups: { price: 14900, setup: 29900 },
        broadcast: { price: 19900, setup: 29900 },
        interactive: { price: 9900, setup: 19900 },
        presence: { price: 9900, setup: 19900 },
        labels: { price: 7900, setup: 19900 },
        read_ops: { price: 7900, setup: 19900 },
        profile: { price: 4900, setup: 9900 },
        security: { price: 14900, setup: 39900 },
        reliability: { price: 24900, setup: 49900 }
    },
    extra_number: { price: 14900, setup: 9900 }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { selectedAddons = [], extraNumbers = 0 } = body;

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        // 1. Base Plan Subscription
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Rensto WhatsApp Agent - Base Platform',
                    description: 'Type II Architecture, Anti-Ban Protection, n8n Brain Connection',
                },
                unit_amount: PRICES.base,
                recurring: {
                    interval: 'month',
                },
            },
            quantity: 1,
        });

        // 2. Base Plan Setup Fee
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'One-time Setup Fee (Base)',
                    description: 'Architecture setup, number integration, verification',
                },
                unit_amount: PRICES.base_setup,
            },
            quantity: 1,
        });

        // 3. Add-ons
        selectedAddons.forEach((addonId: string) => {
            const priceConfig = PRICES.addons[addonId as keyof typeof PRICES.addons];
            if (priceConfig) {
                // Add-on Subscription
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Add-on: ${addonId.charAt(0).toUpperCase() + addonId.slice(1)}`,
                        },
                        unit_amount: priceConfig.price,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                });

                // Add-on Setup
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Setup: ${addonId.charAt(0).toUpperCase() + addonId.slice(1)}`,
                        },
                        unit_amount: priceConfig.setup,
                    },
                    quantity: 1,
                });
            }
        });

        // 4. Extra Numbers
        if (extraNumbers > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Extra WhatsApp Numbers (Sessions)',
                    },
                    unit_amount: PRICES.extra_number.price,
                    recurring: {
                        interval: 'month',
                    },
                },
                quantity: extraNumbers,
            });

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Setup: Extra Numbers',
                    },
                    unit_amount: PRICES.extra_number.setup,
                },
                quantity: extraNumbers,
            });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'subscription',
            success_url: `${origin}/whatsapp/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/whatsapp`,
            metadata: {
                selectedAddons: selectedAddons.join(','),
                extraNumbers: extraNumbers.toString()
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        console.error('Stripe Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
