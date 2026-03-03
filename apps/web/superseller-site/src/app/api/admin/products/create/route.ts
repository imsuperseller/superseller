import { NextRequest, NextResponse } from 'next/server';
import { createProduct, createPlan } from '@/lib/paypal';
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

        // Create PayPal product and plan
        const product = await createProduct({
            name: `${name} (Agent)`,
            description: description || `Subscription for ${name}`,
        });

        const plan = await createPlan({
            productId: product.id,
            name: `${name} Monthly`,
            description: `Monthly subscription for ${name}`,
            amount: pricing.subscription / 100, // Convert cents to dollars
        });

        const manifest = {
            id: slug,
            name,
            slug,
            description,
            type,
            active: true,
            pricing,
            n8n,
            paypal: {
                productId: product.id,
                planId: plan.id,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await prisma.serviceInstance.create({
            data: {
                clientId: slug,
                clientEmail: '',
                productName: name,
                status: 'active',
                configuration: manifest as any,
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
