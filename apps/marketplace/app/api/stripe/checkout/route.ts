import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCT_PRICES, SUBSCRIPTION_PRICES, DEPLOYMENT_PACKAGES, ProductId, SubscriptionTier, DeploymentPackage } from '@/lib/stripe';
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

    // Determine pricing based on type with strict validation
    if (type === 'product' && productId) {
      // Validate product ID exists in our configuration
      if (!(productId in PRODUCT_PRICES)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
      }
      
      const amount = PRODUCT_PRICES[productId as ProductId];
      if (amount === undefined || amount < 0) {
        return NextResponse.json({ error: 'Invalid product pricing' }, { status: 400 });
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
      // Validate subscription tier exists in our configuration
      if (!(subscriptionTier in SUBSCRIPTION_PRICES)) {
        return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
      }
      
      const tierPricing = SUBSCRIPTION_PRICES[subscriptionTier as SubscriptionTier];
      if (!tierPricing || tierPricing.monthly < 0) {
        return NextResponse.json({ error: 'Invalid subscription pricing' }, { status: 400 });
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
      // Validate deployment package exists in our configuration
      if (!(deploymentPackage in DEPLOYMENT_PACKAGES)) {
        return NextResponse.json({ error: 'Invalid deployment package' }, { status: 400 });
      }
      
      const amount = DEPLOYMENT_PACKAGES[deploymentPackage as DeploymentPackage];
      if (amount === undefined || amount < 0) {
        return NextResponse.json({ error: 'Invalid deployment package pricing' }, { status: 400 });
      }
      
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

    // Create checkout session with server-side price validation
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
      metadata: {
        ...metadata,
        // Add server-side validation metadata
        serverValidated: 'true',
        validatedAt: new Date().toISOString(),
        userId: session.user.id || '',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IL'],
      },
      // Additional security measures
      payment_intent_data: type === 'product' ? {
        metadata: {
          productId: productId || '',
          validatedPrice: amount?.toString() || '0',
        }
      } : undefined,
      subscription_data: type === 'subscription' ? {
        metadata: {
          subscriptionTier: subscriptionTier || '',
          validatedPrice: tierPricing?.monthly.toString() || '0',
        }
      } : undefined,
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

