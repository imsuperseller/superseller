import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

/**
 * GET /api/checkout/stripe-subscribe?tenant=elite-pro
 *
 * Creates a Stripe Checkout Session for a tenant's subscription with
 * sales tax calculated server-side (no Stripe Tax fee).
 *
 * Redirects the customer directly to Stripe Checkout.
 *
 * Tax rates are looked up from the Tenant's state. Currently supports TX.
 * Expand the TAX_RATES map as needed for other states.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// State sales tax rates (state + avg local)
// TX: 6.25% state + ~2% local = 8.25% for most DFW cities
// Add more states as customers expand
const TAX_RATES: Record<string, { rate: number; label: string }> = {
    TX: { rate: 0.0825, label: 'TX Sales Tax (8.25%)' },
    CA: { rate: 0.0875, label: 'CA Sales Tax (8.75%)' },
    FL: { rate: 0.07, label: 'FL Sales Tax (7%)' },
};

// Tenant subscription configs — maps tenant slug to Stripe price + metadata
// This replaces the static payment link approach with dynamic, tax-aware checkout
const TENANT_CONFIGS: Record<string, {
    priceId: string;
    amount: number; // in cents
    productName: string;
    tenantId: string;
    subscriptionType: string;
    serviceType: string;
    whatsappGroup?: string;
    state: string; // for tax calculation
}> = {
    'elite-pro-remodeling': {
        priceId: 'price_1TADQfDE8rt1dEs1PUPGDEfc',
        amount: 200000, // $2,000
        productName: 'Autonomous Instagram Growth',
        tenantId: 'e1a25182-4830-42c8-8c91-a80aeae0d8cb',
        subscriptionType: 'custom_solution',
        serviceType: 'content_automation',
        whatsappGroup: '120363408376076110@g.us',
        state: 'TX',
    },
};

export async function GET(req: NextRequest) {
    const tenantSlug = req.nextUrl.searchParams.get('tenant');

    if (!tenantSlug) {
        return NextResponse.json({ error: 'Missing tenant parameter' }, { status: 400 });
    }

    const config = TENANT_CONFIGS[tenantSlug];
    if (!config) {
        return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 });
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant || tenant.status !== 'active') {
        return NextResponse.json({ error: 'Tenant not found or inactive' }, { status: 404 });
    }

    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://superseller.agency';

    try {
        // Calculate tax
        const taxInfo = TAX_RATES[config.state];
        const taxAmount = taxInfo ? Math.round(config.amount * taxInfo.rate) : 0;

        // Build line items
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price: config.priceId,
                quantity: 1,
            },
        ];

        // Add tax as a separate one-time line item on the first checkout
        // For recurring tax, we create a Stripe tax rate object
        let defaultTaxRates: string[] = [];

        if (taxInfo) {
            // Create or retrieve a tax rate for this state
            const existingRates = await stripe.taxRates.list({ limit: 100, active: true });
            let taxRate = existingRates.data.find(
                r => r.jurisdiction === config.state && r.percentage === taxInfo.rate * 100,
            );

            if (!taxRate) {
                taxRate = await stripe.taxRates.create({
                    display_name: 'Sales Tax',
                    jurisdiction: config.state,
                    percentage: taxInfo.rate * 100,
                    inclusive: false,
                    country: 'US',
                    state: config.state,
                    description: taxInfo.label,
                });
            }

            defaultTaxRates = [taxRate.id];

            // Apply tax rate to the subscription line item
            lineItems[0].tax_rates = [taxRate.id];
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: lineItems,
            success_url: `${origin}/onboard/${tenantSlug}?payment=success`,
            cancel_url: `${origin}/onboard/${tenantSlug}?payment=cancelled`,
            metadata: {
                tenant: tenantSlug,
                tenantId: config.tenantId,
                subscriptionType: config.subscriptionType,
                productName: config.productName,
                serviceType: config.serviceType,
                whatsappGroup: config.whatsappGroup || '',
            },
            subscription_data: {
                metadata: {
                    tenant: tenantSlug,
                    tenantId: config.tenantId,
                },
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            customer_email: undefined, // let them enter their email
        });

        // Redirect to Stripe Checkout
        return NextResponse.redirect(session.url!, 303);
    } catch (err: any) {
        console.error('[checkout/stripe-subscribe] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
