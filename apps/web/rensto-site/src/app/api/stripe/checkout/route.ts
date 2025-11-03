import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars aren't available
function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2023-10-16' // Match working marketplace app exactly
  });
}

/**
 * Stripe Checkout API - All 5 Payment Flows
 *
 * Flow 1: Marketplace Template Purchase ($29-$197)
 * Flow 2: Marketplace Full-Service Install ($797-$3,500+)
 * Flow 3: Ready Solutions Package ($890-$2,990+)
 * Flow 4: Subscriptions Monthly ($299-$1,499)
 * Flow 5: Custom Solutions Project ($3,500-$8,000+)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      flowType,
      productId,
      tier,
      subscriptionType,
      customerEmail,
      customerName,
      metadata = {}
    } = body;

    // Validate required fields
    // Note: customerEmail is optional - Stripe checkout will collect it
    if (!flowType) {
      return NextResponse.json(
        { error: 'Missing required field: flowType' },
        { status: 400 }
      );
    }

    // Determine pricing and product details based on flow type
    // IMPORTANT: Create Stripe Price objects first (like marketplace app) - ensures account association
    let priceId: string;
    let successUrl: string;
    let webhookMetadata: any = { ...metadata, flowType, customerEmail, customerName };

    switch (flowType) {
      case 'marketplace-template':
        // Flow 1: Marketplace Template Purchase
        const templatePrices: Record<string, number> = {
          simple: 29,
          advanced: 97,
          complete: 197
        };
        const price = templatePrices[tier || 'simple'];

        // Create price object first (matches marketplace app pattern)
        const templatePriceObj = await getStripe().prices.create({
          unit_amount: price * 100,
          currency: 'usd',
          product_data: {
            name: `${tier?.toUpperCase()} Marketplace Template`,
          },
        });
        priceId = templatePriceObj.id;
        
        successUrl = `https://www.rensto.com/?payment=success&type=marketplace&product=${productId}`;
        webhookMetadata = { ...webhookMetadata, productId, tier, price };
        break;

      case 'marketplace-install':
        // Flow 2: Marketplace Full-Service Install
        const installPrices: Record<string, number> = {
          template: 797,
          system: 1997,
          enterprise: 3500
        };
        const installPrice = installPrices[tier || 'template'];

        // Create price object first (matches marketplace app pattern)
        const installPriceObj = await getStripe().prices.create({
          unit_amount: installPrice * 100,
          currency: 'usd',
          product_data: {
            name: `${tier?.toUpperCase()} Full-Service Installation`,
          },
        });
        priceId = installPriceObj.id;
        
        successUrl = `https://www.rensto.com/?payment=success&type=marketplace-install&product=${productId}`;
        webhookMetadata = { ...webhookMetadata, productId, tier, price: installPrice };
        break;

      case 'ready-solutions':
        // Flow 3: Ready Solutions Package
        // Support productId (niche ID like 'hvac', 'roofer') or tier pricing
        const solutionPrices: Record<string, number> = {
          starter: 890,
          professional: 2990,
          enterprise: 2990,
          // Niche-specific pricing (from productId)
          hvac: 499,
          roofer: 599,
          realtor: 399,
          insurance: 449,
          locksmith: 349,
          photographer: 299,
          // Legacy aliases
          single: 890,
          complete: 2990,
          'full-service': 3787
        };
        
        // Use productId price if it exists (niche-specific), otherwise use tier
        const nichePrice = productId && solutionPrices[productId] ? solutionPrices[productId] : null;
        const solutionPrice = nichePrice || solutionPrices[tier || 'starter'];
        const packageName = metadata.nicheName || `${tier?.toUpperCase()} Ready Solutions Package`;
        const packageDesc = metadata.nicheName 
          ? `${metadata.nicheName} automation package with ${metadata.solutionsCount || 5} solutions`
          : 'Industry-specific automation solution';

        // Create price object first (matches marketplace app pattern)
        const solutionPriceObj = await getStripe().prices.create({
          unit_amount: solutionPrice * 100,
          currency: 'usd',
          product_data: {
            name: packageName,
          },
        });
        priceId = solutionPriceObj.id;
        
        successUrl = `https://www.rensto.com/?payment=success&type=ready-solutions&niche=${productId || tier}`;
        webhookMetadata = { ...webhookMetadata, tier, productId, price: solutionPrice, ...metadata };
        break;

      case 'subscription':
        // Flow 4: Subscriptions Monthly
        const subPrices: Record<string, Record<string, number>> = {
          'lead-gen': { starter: 299, professional: 599, enterprise: 1499 },
          'crm': { starter: 299, professional: 599, enterprise: 1499 },
          'social': { starter: 299, professional: 599, enterprise: 1499 }
        };
        const subPrice = subPrices[subscriptionType || 'lead-gen']?.[tier || 'starter'] || 299;

        // Create recurring price object first (matches marketplace app pattern)
        const subPriceObj = await getStripe().prices.create({
          unit_amount: subPrice * 100,
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: `${subscriptionType?.toUpperCase()} Subscription - ${tier?.toUpperCase()}`,
          },
        });
        priceId = subPriceObj.id;
        
        successUrl = `https://www.rensto.com/?payment=success&type=subscription&plan=${(subscriptionType || 'lead-gen')}-${(tier || 'starter')}`;
        webhookMetadata = { ...webhookMetadata, subscriptionType, tier, price: subPrice };
        break;

      case 'custom-solutions':
        // Flow 5: Custom Solutions Project
        const customPrices: Record<string, number> = {
          // Entry-level products (use productId)
          audit: 297,
          sprint: 1997,
          // Full custom projects (use tier)
          simple: 3500,
          standard: 5500,
          complex: 8000
        };

        // Support both productId (for entry-level) and tier (for full custom)
        const customKey = productId || tier || 'audit';
        const customPrice = customPrices[customKey];
        const customName = productId
          ? (productId === 'audit' ? 'Business Audit' : 'Automation Sprint')
          : `${tier?.toUpperCase()} Custom Solution Build`;
        const customDesc = productId
          ? (productId === 'audit' ? 'Comprehensive automation readiness assessment' : '2-week workflow automation sprint')
          : 'Bespoke automation project with consultation';

        // Create price object first (matches marketplace app pattern)
        const customPriceObj = await getStripe().prices.create({
          unit_amount: customPrice * 100,
          currency: 'usd',
          product_data: {
            name: customName,
          },
        });
        priceId = customPriceObj.id;
        
        successUrl = `https://www.rensto.com/?payment=success&type=custom&product=${customKey}`;
        webhookMetadata = { ...webhookMetadata, product: customKey, productId, tier, price: customPrice };
        break;

      default:
        return NextResponse.json(
          { error: `Invalid flowType: ${flowType}` },
          { status: 400 }
        );
    }

    // ALWAYS create/retrieve customer FIRST (required for publishable key association)
    // Old working system always had customer attached - this was the key
    const stripe = getStripe();
    const emailToUse = (customerEmail && customerEmail.trim() && customerEmail.includes('@')) 
      ? customerEmail.trim() 
      : `customer-${Date.now()}@rensto.com`;
    
    const existingCustomers = await stripe.customers.list({
      email: emailToUse,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: emailToUse,
        name: customerName || undefined,
      });
      customerId = newCustomer.id;
    }

    // Create Stripe Checkout Session - EXACT MARKETPLACE APP MATCH
    // Include ALL parameters from working marketplace implementation
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      mode: flowType === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: `https://www.rensto.com/`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'IL'],
      },
    };
    
    // Add metadata - Stripe requires all values to be strings
    if (webhookMetadata && Object.keys(webhookMetadata).length > 0) {
      const stringMetadata: Record<string, string> = {};
      for (const [key, value] of Object.entries(webhookMetadata)) {
        if (value !== null && value !== undefined) {
          // Convert to string - handle objects/arrays by JSON stringifying
          stringMetadata[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
      }
      if (Object.keys(stringMetadata).length > 0) {
        sessionConfig.metadata = stringMetadata;
      }
    }
    
    // Add payment_intent_data for one-time payments (marketplace pattern)
    if (flowType !== 'subscription' && sessionConfig.metadata) {
      sessionConfig.payment_intent_data = {
        metadata: sessionConfig.metadata
      };
    }
    
    // Add subscription_data for subscriptions (marketplace pattern)
    if (flowType === 'subscription' && sessionConfig.metadata) {
      sessionConfig.subscription_data = {
        metadata: sessionConfig.metadata
      };
    }

    // Create session - Stripe automatically uses account from secret key
    // NOTE: Do NOT use stripeAccount parameter for your own account - that's for Connect only
    const session = await getStripe().checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      metadata: webhookMetadata
    });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
