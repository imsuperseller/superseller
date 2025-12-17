import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10',
});

interface CustomSolutionCheckoutRequest {
    packageId: 'starter' | 'professional' | 'enterprise';
    contractId: string;
    clientEmail: string;
    clientName: string;
    returnUrl?: string;
}

// Package pricing configuration
const PACKAGES = {
    starter: {
        name: 'Starter Automation Package',
        price: 2997 * 100, // Stripe uses cents
        monthlyPrice: 97 * 100,
        description: 'Essential automation foundation with 3 workflows',
    },
    professional: {
        name: 'Professional Automation Package',
        price: 4997 * 100,
        monthlyPrice: 147 * 100,
        description: 'Comprehensive automation suite with 7 workflows',
    },
    enterprise: {
        name: 'Enterprise Automation Package',
        price: 9997 * 100,
        monthlyPrice: 297 * 100,
        description: 'Full-service automation with unlimited workflows',
    },
};

export async function POST(request: NextRequest) {
    try {
        const body: CustomSolutionCheckoutRequest = await request.json();
        const { packageId, contractId, clientEmail, clientName, returnUrl } = body;

        // Validate package
        const selectedPackage = PACKAGES[packageId];
        if (!selectedPackage) {
            return NextResponse.json(
                { error: 'Invalid package selected' },
                { status: 400 }
            );
        }

        // Verify contract exists and is signed
        // In a full implementation, you'd check with eSignatures API
        if (!contractId) {
            return NextResponse.json(
                { error: 'Contract must be signed before payment' },
                { status: 400 }
            );
        }

        // Check if customer already exists in Stripe
        const existingCustomers = await stripe.customers.list({
            email: clientEmail,
            limit: 1,
        });

        let customer: Stripe.Customer;
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: clientEmail,
                name: clientName,
                metadata: {
                    source: 'custom_solutions',
                    contract_id: contractId,
                    package: packageId,
                },
            });
        }

        // Create the one-time payment checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: selectedPackage.name,
                            description: selectedPackage.description,
                        },
                        unit_amount: selectedPackage.price,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: 'custom_solution',
                package_id: packageId,
                contract_id: contractId,
                client_email: clientEmail,
                monthly_price: selectedPackage.monthlyPrice.toString(),
            },
            success_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}/custom/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}/custom/canceled`,
            payment_intent_data: {
                metadata: {
                    package_id: packageId,
                    contract_id: contractId,
                },
            },
            // Set up for future monthly subscription
            payment_method_options: {
                card: {
                    setup_future_usage: 'off_session',
                },
            },
            custom_text: {
                submit: {
                    message: `After payment, we'll set up your monthly maintenance subscription ($${selectedPackage.monthlyPrice / 100}/mo) and begin your project within 24 hours.`,
                },
            },
        });

        return NextResponse.json({
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id,
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
