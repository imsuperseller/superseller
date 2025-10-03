import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCT_PRICES, SUBSCRIPTION_PRICES, DEPLOYMENT_PACKAGES } from '@/lib/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      type, 
      productId, 
      subscriptionTier, 
      deploymentPackage,
      customerEmail,
      customerName 
    } = body;

    let priceId: string;
    let metadata: Record<string, string> = {
      customerEmail: session.user.email,
      customerName: session.user.name || '',
    };

    // Determine pricing based on type
    if (type === 'product' && productId) {
      const amount = PRODUCT_PRICES[productId as keyof typeof PRODUCT_PRICES];
      if (!amount) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
      }
      
      metadata.productId = productId;
      metadata.type = 'product';
      
      // Create a price for this one-time payment
      const price = await stripe.prices.create({
        unit_amount: amount,
        currency: 'usd',
        product_data: {
          name: `Rensto ${productId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          description: 'Automation workflow product',
        },
      });
      
      priceId = price.id;
    } else if (type === 'subscription' && subscriptionTier) {
      const tierPricing = SUBSCRIPTION_PRICES[subscriptionTier as keyof typeof SUBSCRIPTION_PRICES];
      if (!tierPricing) {
        return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
      }
      
      metadata.subscriptionTier = subscriptionTier;
      metadata.type = 'subscription';
      
      // Create recurring price
      const price = await stripe.prices.create({
        unit_amount: tierPricing.monthly,
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: {
          name: `Rensto ${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan`,
          description: 'Monthly subscription plan',
        },
      });
      
      priceId = price.id;
    } else if (type === 'deployment' && deploymentPackage) {
      const amount = DEPLOYMENT_PACKAGES[deploymentPackage as keyof typeof DEPLOYMENT_PACKAGES];
      
      metadata.deploymentPackage = deploymentPackage;
      metadata.type = 'deployment';
      
      if (amount === 0) {
        // Free deployment package - redirect to success page
        return NextResponse.json({ 
          success: true, 
          redirectUrl: '/success?type=deployment&package=' + deploymentPackage 
        });
      }
      
      const price = await stripe.prices.create({
        unit_amount: amount,
        currency: 'usd',
        product_data: {
          name: `Rensto ${deploymentPackage.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Package`,
          description: 'Deployment service package',
        },
      });
      
      priceId = price.id;
    } else {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || '',
        metadata: {
          userId: session.user.id || '',
        },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
      metadata,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IL'],
      },
    });

    return NextResponse.json({ 
      success: true, 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

