import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { AITableService } from '@/lib/services/AITableService';
import prisma from '@/lib/prisma';
import { apiRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    const rateLimited = apiRateLimiter.middleware()(req);
    if (rateLimited) return rateLimited;

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

        let description = 'SuperSeller AI Purchase';
        let amount = 0; // dollars

        // DYNAMIC REGISTRY LOOKUP
        const products = await AITableService.getProducts();
        const product = products.find(p => (p['Product ID'] || p.id) === productId);

        if (product) {
            const pFlowType = product['flowType'] || product.flowType;
            const pName = product['Product Name'] || product.name;
            const pPrice = parseInt(product['Price'] || product.price);

            // Subscriptions go through /api/video/subscribe — not this route
            if (pFlowType === 'pillar-purchase' || pFlowType === 'managed-plan' || pFlowType === 'token-plan' || pFlowType === 'care-plan') {
                return NextResponse.json(
                    { error: 'Subscription products should use /api/video/subscribe' },
                    { status: 400 }
                );
            }

            amount = pPrice;
            description = pName;

            Object.assign(metadata, {
                productId: productId,
                pillarId: product['pillarId'] || product.pillarId || '',
                productName: pName,
                flowType: pFlowType,
            });
        }
        // Legacy: Marketplace Implementation
        else if (flowType === 'marketplace-template') {
            const pgTemplate = await prisma.template.findUnique({ where: { id: productId } });
            if (!pgTemplate) {
                return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            }

            let unitAmount = pgTemplate.price || 97;
            if (tier === 'install') unitAmount = pgTemplate.installPrice || 797;
            if (tier === 'custom') unitAmount = pgTemplate.customPrice || 1497;

            amount = unitAmount;
            description = `${pgTemplate.name} (${tier?.toUpperCase()})`;

            Object.assign(metadata, {
                workflowId: productId,
                workflowName: pgTemplate.name,
                tier: tier,
                flowType: 'marketplace-template',
            });
        }
        else {
            return NextResponse.json({ error: 'Product not found in Registry' }, { status: 404 });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

        const order = await createOrder({
            amount,
            description,
            returnUrl: `${origin}/api/paypal/capture`,
            cancelUrl: `${origin}/pricing`,
            metadata: {
                ...metadata,
                flowType: flowType || metadata.flowType,
                productId,
                tier: tier || '',
                platform: 'superseller-web',
                customerEmail: customerEmail || '',
            },
        });

        await auditAgent.log({
            service: 'paypal',
            action: 'checkout_order_created',
            status: 'success',
            details: { orderId: order.id, flowType, productId, customerEmail }
        });

        return NextResponse.json({ url: order.approvalUrl });

    } catch (err: any) {
        await auditAgent.log({
            service: 'paypal',
            action: 'checkout_order_failed',
            status: 'error',
            errorMessage: err.message,
            details: { body: body || {} }
        });
        console.error('PayPal Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
