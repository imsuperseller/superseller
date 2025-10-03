import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const pricingTiers = {
  basic: { price: 1900, leads: 10 },
  professional: { price: 4900, leads: 100 },
  enterprise: { price: 9900, leads: 500 }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, businessDescription, targetLeads, pricingTier, amount } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !businessDescription || !targetLeads || !pricingTier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate pricing tier
    if (!pricingTiers[pricingTier as keyof typeof pricingTiers]) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: email,
          name: `${firstName} ${lastName}`,
          metadata: {
            businessDescription,
            targetLeads,
            pricingTier
          }
        });
      }
    } catch (error) {
      console.error('Customer creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customer.id,
      metadata: {
        firstName,
        lastName,
        email,
        businessDescription,
        targetLeads,
        pricingTier,
        leads: pricingTiers[pricingTier as keyof typeof pricingTiers].leads.toString()
      },
      description: `Lead Generation - ${pricingTiers[pricingTier as keyof typeof pricingTiers].leads} leads for ${firstName} ${lastName}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
