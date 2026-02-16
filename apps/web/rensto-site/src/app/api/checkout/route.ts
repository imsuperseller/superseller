import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { AITableService } from '@/lib/services/AITableService';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    let body: any = {};
    try {
        body = await req.json();
        const {
            flowType,
            productId,
            tier,
            customerEmail,
            metadata = {}
        } = body;

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        let mode: Stripe.Checkout.Session.Mode = 'payment';

        // DYNAMIC REGISTRY LOOKUP
        const products = await AITableService.getProducts();
        const product = products.find(p => (p['Product ID'] || p.id) === productId);

        if (product) {
            const pFlowType = product['flowType'] || product.flowType;
            const pName = product['Product Name'] || product.name;
            const pStripeId = product['Stripe ID'] || product.stripePriceId;
            const pPrice = parseInt(product['Price'] || product.price);

            if (pFlowType === 'pillar-purchase' || pFlowType === 'managed-plan' || pFlowType === 'token-plan' || pFlowType === 'care-plan') {
                mode = 'subscription';
            }

            if (pStripeId && pStripeId.startsWith('price_')) {
                lineItems.push({
                    price: pStripeId,
                    quantity: 1,
                });
            } else {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: pName,
                            description: product.description || '',
                        },
                        unit_amount: pPrice * 100,
                        ...(mode === 'subscription' ? { recurring: { interval: 'month' } } : {}),
                    },
                    quantity: 1,
                });
            }

            Object.assign(metadata, {
                productId: productId,
                pillarId: product['pillarId'] || product.pillarId || '',
                productName: pName,
                flowType: pFlowType,
            });
        }
        // 2. Special Case: Marketplace Implementation (Legacy support)
        else if (flowType === 'marketplace-template') {
            mode = 'payment';

            const pgTemplate = await prisma.template.findUnique({ where: { id: productId } });
            if (!pgTemplate) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }
            const workflow = pgTemplate;

            let unitAmount = (workflow.price || 97) * 100;
            if (tier === 'install') unitAmount = (workflow.installPrice || 797) * 100;
            if (tier === 'custom') unitAmount = (workflow.customPrice || 1497) * 100;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${workflow.name} (${tier?.toUpperCase()})`,
                        description: `Secure access to the Rensto ${tier} solution`,
                    },
                    unit_amount: Math.round(unitAmount),
                },
                quantity: 1,
            });

            Object.assign(metadata, {
                workflowId: productId,
                workflowName: workflow.name,
                tier: tier
            });
        }
        else {
            return NextResponse.json({ error: 'Product not found in Registry' }, { status: 404 });
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
                platform: 'rensto-web'
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
