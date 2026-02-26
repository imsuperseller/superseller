import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';

interface CustomSolutionCheckoutRequest {
    packageId: 'starter' | 'professional' | 'enterprise';
    contractId: string;
    clientEmail: string;
    clientName: string;
    returnUrl?: string;
}

const PACKAGES = {
    starter: {
        name: 'Starter Automation Package',
        price: 2997,
        monthlyPrice: 97,
        description: 'Essential automation foundation with 3 workflows',
    },
    professional: {
        name: 'Professional Automation Package',
        price: 4997,
        monthlyPrice: 147,
        description: 'Comprehensive automation suite with 7 workflows',
    },
    enterprise: {
        name: 'Enterprise Automation Package',
        price: 9997,
        monthlyPrice: 297,
        description: 'Full-service automation with unlimited workflows',
    },
};

export async function POST(request: NextRequest) {
    try {
        const body: CustomSolutionCheckoutRequest = await request.json();
        const { packageId, contractId, clientEmail, clientName, returnUrl } = body;

        const selectedPackage = PACKAGES[packageId];
        if (!selectedPackage) {
            return NextResponse.json(
                { error: 'Invalid package selected' },
                { status: 400 }
            );
        }

        if (!contractId) {
            return NextResponse.json(
                { error: 'Contract must be signed before payment' },
                { status: 400 }
            );
        }

        const baseUrl = returnUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://superseller.agency';

        const order = await createOrder({
            amount: selectedPackage.price,
            description: `${selectedPackage.name} - ${selectedPackage.description}`,
            returnUrl: `${baseUrl}/api/paypal/capture`,
            cancelUrl: `${baseUrl}/custom/canceled`,
            metadata: {
                flowType: 'custom_solution',
                packageId,
                contractId,
                clientEmail,
                clientName,
                monthlyPrice: String(selectedPackage.monthlyPrice),
            },
        });

        return NextResponse.json({
            success: true,
            checkoutUrl: order.approvalUrl,
            orderId: order.id,
        });

    } catch (error: any) {
        console.error('PayPal checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
