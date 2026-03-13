import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

/**
 * GET /api/checkout/stripe-subscribe?tenant=elite-pro-remodeling
 *
 * Creates a Stripe Checkout Session for a tenant's subscription with
 * sales tax calculated server-side (no Stripe Tax fee).
 *
 * Redirects the customer directly to Stripe Checkout.
 *
 * Tax logic (TX Tax Code §151.0035 + §151.351):
 * - Service is "data processing" → taxable in TX
 * - 20% exemption: only 80% of the price is taxable
 * - Tax only applies when customer is in the same state (nexus)
 * - Out-of-state: no TX tax (their state rules apply at their nexus threshold)
 * - International: no US state sales tax
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// TX §151.351: Data processing services get a mandatory 20% exemption
// Only 80% of the charge is subject to sales tax
const DATA_PROCESSING_TAXABLE_FRACTION = 0.80;

// State sales tax rates (state + avg local) for data processing services
// Only charge when BOTH seller and buyer are in the same state (or seller has nexus)
// TX: 6.25% state + ~2% local = 8.25% for most DFW cities → effective 6.6% after 20% exemption
// Add more states as customers expand and nexus is established
const TAX_RATES: Record<string, { rate: number; label: string; effectiveLabel: string }> = {
    TX: { rate: 0.0825, label: 'TX Sales Tax (8.25% on 80%)', effectiveLabel: 'TX Sales Tax (eff. 6.6%)' },
    CA: { rate: 0.0875, label: 'CA Sales Tax (8.75%)', effectiveLabel: 'CA Sales Tax (8.75%)' },
    FL: { rate: 0.07, label: 'FL Sales Tax (7%)', effectiveLabel: 'FL Sales Tax (7%)' },
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
        // Build line items
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price: config.priceId,
                quantity: 1,
            },
        ];

        // Tax logic: only apply when customer is in a state where we have nexus
        // TX §151.351: 20% exemption on data processing services
        // Effective rate = nominal rate × 0.80 (e.g., 8.25% × 0.80 = 6.6%)
        const taxInfo = TAX_RATES[config.state];

        if (taxInfo) {
            // The Stripe tax rate percentage must reflect the 20% exemption
            // so it's applied correctly to each invoice automatically
            const effectivePercentage = parseFloat(
                (taxInfo.rate * 100 * DATA_PROCESSING_TAXABLE_FRACTION).toFixed(4)
            );

            // Create or retrieve a tax rate with the effective (post-exemption) percentage
            const existingRates = await stripe.taxRates.list({ limit: 100, active: true });
            let taxRate = existingRates.data.find(
                r => r.jurisdiction === config.state &&
                    Math.abs(r.percentage - effectivePercentage) < 0.001,
            );

            if (!taxRate) {
                taxRate = await stripe.taxRates.create({
                    display_name: 'Sales Tax',
                    jurisdiction: config.state,
                    percentage: effectivePercentage,
                    inclusive: false,
                    country: 'US',
                    state: config.state,
                    description: `${taxInfo.label} — TX §151.351 20% data processing exemption applied`,
                });
            }

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
