import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProductConfig } from '@/lib/checkout-config';

/**
 * POST /api/checkout/create-session
 *
 * Creates a Stripe Checkout Session for a product subscription.
 * Accepts customer data (phone, businessName, email) and embeds it in session metadata
 * so the Stripe webhook can trigger WhatsApp onboarding.
 *
 * Body: { productSlug, email, phone, businessName }
 * Returns: { sessionUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, email, phone, businessName } = body;

    if (!productSlug || !email || !phone || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields: productSlug, email, phone, businessName' },
        { status: 400 }
      );
    }

    // Validate phone — must have at least 8 digits
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      return NextResponse.json(
        { error: 'Invalid phone number — must contain at least 8 digits' },
        { status: 400 }
      );
    }

    const product = getProductConfig(productSlug);
    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${productSlug}` },
        { status: 404 }
      );
    }

    if (!product.stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe is not configured for this product. Please use PayPal.' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://superseller.agency';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        phone: digitsOnly,
        businessName,
        productName: product.name,
        serviceType: product.serviceType,
        productSlug,
      },
      subscription_data: {
        metadata: {
          phone: digitsOnly,
          businessName,
          productSlug,
          serviceType: product.serviceType,
        },
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/${productSlug}`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: any) {
    console.error('[checkout/create-session] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
