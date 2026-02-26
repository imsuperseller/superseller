#!/usr/bin/env tsx
/**
 * One-time setup script: Creates PayPal Products and Plans for SuperSeller AI subscriptions.
 * Run: npx tsx tools/setup-paypal-plans.ts
 *
 * Requires: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE in environment or .env.local
 */

import 'dotenv/config';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
    return (await res.json()).access_token;
}

async function paypalPost(token: string, path: string, body: any): Promise<any> {
    const res = await fetch(`${PAYPAL_API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
}

async function main() {
    console.log(`Mode: ${process.env.PAYPAL_MODE || 'sandbox'}`);
    console.log(`API Base: ${PAYPAL_API_BASE}`);

    const token = await getAccessToken();
    console.log('Authenticated with PayPal.\n');

    // 1. Create Product
    console.log('Creating product...');
    const product = await paypalPost(token, '/v1/catalogs/products', {
        name: 'SuperSeller AI Video',
        description: 'AI-powered video generation platform for businesses',
        type: 'SERVICE',
        category: 'SOFTWARE',
    });
    console.log(`Product created: ${product.id}\n`);

    // 2. Create Plans
    const plans = [
        { name: 'Starter', amount: '79.00', credits: 500 },
        { name: 'Pro', amount: '149.00', credits: 1500 },
        { name: 'Team', amount: '299.00', credits: 4000 },
    ];

    const planIds: Record<string, string> = {};

    for (const plan of plans) {
        console.log(`Creating ${plan.name} plan ($${plan.amount}/mo, ${plan.credits} credits)...`);
        const result = await paypalPost(token, '/v1/billing/plans', {
            product_id: product.id,
            name: `SuperSeller AI ${plan.name}`,
            description: `${plan.name} plan — ${plan.credits} credits/month`,
            billing_cycles: [{
                frequency: { interval_unit: 'MONTH', interval_count: 1 },
                tenure_type: 'REGULAR',
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                    fixed_price: {
                        value: plan.amount,
                        currency_code: 'USD',
                    },
                },
            }],
            payment_preferences: {
                auto_bill_outstanding: true,
                payment_failure_threshold: 3,
            },
        });
        planIds[plan.name.toLowerCase()] = result.id;
        console.log(`  ${plan.name} plan: ${result.id}`);
    }

    console.log('\n=== Add these to .env.local and Vercel ===');
    console.log(`PAYPAL_PRODUCT_ID=${product.id}`);
    console.log(`PAYPAL_STARTER_PLAN_ID=${planIds.starter}`);
    console.log(`PAYPAL_PRO_PLAN_ID=${planIds.pro}`);
    console.log(`PAYPAL_TEAM_PLAN_ID=${planIds.team}`);
    console.log('\nDone!');
}

main().catch(console.error);
