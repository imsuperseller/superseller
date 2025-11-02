import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars aren't available
function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2024-11-20.acacia'
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
    let priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData;
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

        priceData = {
          currency: 'usd',
          product_data: {
            name: `${tier?.toUpperCase()} Marketplace Template`,
            description: 'Pre-built n8n workflow template ready to use',
            metadata: { type: 'marketplace-template', tier, productId }
          },
          unit_amount: price * 100
        };
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

        priceData = {
          currency: 'usd',
          product_data: {
            name: `${tier?.toUpperCase()} Full-Service Installation`,
            description: 'Template + professional installation and setup',
            metadata: { type: 'marketplace-install', tier, productId }
          },
          unit_amount: installPrice * 100
        };
        successUrl = `https://www.rensto.com/?payment=success&type=marketplace-install&product=${productId}`;
        webhookMetadata = { ...webhookMetadata, productId, tier, price: installPrice };
        break;

      case 'ready-solutions':
        // Flow 3: Ready Solutions Package
        const solutionPrices: Record<string, number> = {
          starter: 890,
          professional: 2990,
          enterprise: 2990, // Enterprise + Installation add-on
          // Legacy aliases
          single: 890,
          complete: 2990,
          'full-service': 3787
        };
        const solutionPrice = solutionPrices[tier || 'starter'];

        priceData = {
          currency: 'usd',
          product_data: {
            name: `${tier?.toUpperCase()} Ready Solutions Package`,
            description: 'Industry-specific automation solution',
            metadata: { type: 'ready-solutions', tier }
          },
          unit_amount: solutionPrice * 100
        };
        successUrl = `https://www.rensto.com/?payment=success&type=ready-solutions&tier=${tier}`;
        webhookMetadata = { ...webhookMetadata, tier, price: solutionPrice };
        break;

      case 'subscription':
        // Flow 4: Subscriptions Monthly
        const subPrices: Record<string, Record<string, number>> = {
          'lead-gen': { starter: 299, professional: 599, enterprise: 1499 },
          'crm': { starter: 299, professional: 599, enterprise: 1499 },
          'social': { starter: 299, professional: 599, enterprise: 1499 }
        };
        const subPrice = subPrices[subscriptionType || 'lead-gen']?.[tier || 'starter'] || 299;

        priceData = {
          currency: 'usd',
          product_data: {
            name: `${subscriptionType?.toUpperCase()} Subscription - ${tier?.toUpperCase()}`,
            description: 'Monthly recurring subscription service',
            metadata: { type: 'subscription', subscriptionType, tier }
          },
          unit_amount: subPrice * 100,
          recurring: {
            interval: 'month'
          }
        };
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

        priceData = {
          currency: 'usd',
          product_data: {
            name: customName,
            description: customDesc,
            metadata: { type: 'custom-solutions', product: productId || tier, tier, productId }
          },
          unit_amount: customPrice * 100
        };
        successUrl = `https://www.rensto.com/?payment=success&type=custom&product=${customKey}`;
        webhookMetadata = { ...webhookMetadata, product: customKey, productId, tier, price: customPrice };
        break;

      default:
        return NextResponse.json(
          { error: `Invalid flowType: ${flowType}` },
          { status: 400 }
        );
    }

    // Create Stripe Checkout Session
    // Minimal configuration to avoid "page not found" errors
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1
        }
      ],
      mode: flowType === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: `https://www.rensto.com/?canceled=true`
      // Only include metadata if it has valid string values (no complex objects)
      // Remove optional parameters that might cause rejection
    };
    
    // Only add metadata if webhookMetadata has valid string values
    if (webhookMetadata && Object.keys(webhookMetadata).length > 0) {
      // Convert all metadata values to strings (Stripe requires string values)
      const stringMetadata: Record<string, string> = {};
      for (const [key, value] of Object.entries(webhookMetadata)) {
        if (value !== null && value !== undefined) {
          stringMetadata[key] = String(value);
        }
      }
      if (Object.keys(stringMetadata).length > 0) {
        sessionConfig.metadata = stringMetadata;
      }
    }
    
    // Only add subscription_data for subscriptions
    if (flowType === 'subscription' && sessionConfig.metadata) {
      sessionConfig.subscription_data = {
        metadata: sessionConfig.metadata
      };
    }

    // Only include customer_email if provided - let Stripe collect it otherwise
    // Setting customer_email can cause "page not found" errors if email is invalid or pre-filled
    if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      sessionConfig.customer_email = customerEmail.trim();
    }
    // If no email provided, Stripe checkout will collect it - don't force a default

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
