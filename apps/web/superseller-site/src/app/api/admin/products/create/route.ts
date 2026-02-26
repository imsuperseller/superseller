import { NextRequest, NextResponse } from 'next/server';
import { getStripeAdmin } from '@/lib/stripe';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, description, slug, pricing, n8n, type } = body;

        if (!name || !pricing.subscription || !n8n.webhookId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const stripe = getStripeAdmin();

        const product = await stripe.products.create({
            name: `${name} (Agent)`,
            description: description || `Subscription for ${name}`,
            metadata: {
                slug,
                type: 'superseller_agent',
                n8n_webhook: n8n.webhookId
            }
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: pricing.subscription,
            currency: 'usd',
            recurring: { interval: 'month' },
            metadata: { slug }
        });

        let setupPriceId = undefined;
        if (pricing.setup > 0) {
            const setupPrice = await stripe.prices.create({
                product: product.id,
                unit_amount: pricing.setup,
                currency: 'usd',
                nickname: 'One-time Setup Fee',
                metadata: { type: 'setup_fee', slug }
            });
            setupPriceId = setupPrice.id;
        }

        const manifest = {
            id: slug,
            name,
            slug,
            description,
            type,
            active: true,
            pricing,
            n8n,
            stripe: {
                productId: product.id,
                priceId: price.id,
                setupPriceId
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Store in Postgres instead of Firestore
        await prisma.serviceInstance.create({
            data: {
                slug,
                productName: name,
                status: 'active',
                metadata: manifest as any,
            },
        }).catch((err: any) => {
            console.warn('Could not save to ServiceInstance table:', err.message);
        });

        return NextResponse.json({ success: true, manifest });

    } catch (error: any) {
        console.error('Create Product Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
