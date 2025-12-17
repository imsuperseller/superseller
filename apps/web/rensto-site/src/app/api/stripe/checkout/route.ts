import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { LITAL_PRICING_CONFIG } from '@/config/lital-pricing';

// Lazy initialization to avoid build-time errors when env vars aren't available
function getStripe(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-07-30.basil' as any
  });
}

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
      featureIds, // For custom-config
      metadata = {}
    } = body;

    if (!flowType) {
      return NextResponse.json(
        { error: 'Missing required field: flowType' },
        { status: 400 }
      );
    }

    let priceId: string | undefined;
    let successUrl: string;
    let webhookMetadata: any = { ...metadata, flowType, customerEmail, customerName };
    let customLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] | undefined;

    switch (flowType) {
      case 'marketplace-template':
        const templatePrices: Record<string, number> = { simple: 29, advanced: 97, complete: 197 };
        const tPrice = templatePrices[tier || 'simple'];
        const tPriceObj = await getStripe().prices.create({
          unit_amount: tPrice * 100, currency: 'usd', product_data: { name: `${tier?.toUpperCase()} Marketplace Template` },
        });
        priceId = tPriceObj.id;
        successUrl = `https://www.rensto.com/?payment=success&type=marketplace&product=${productId}`;
        webhookMetadata = { ...webhookMetadata, productId, tier, price: tPrice };
        break;

      case 'marketplace-install':
        const installPrices: Record<string, number> = { template: 797, system: 1997, enterprise: 3500 };
        const iPrice = installPrices[tier || 'template'];
        const iPriceObj = await getStripe().prices.create({
          unit_amount: iPrice * 100, currency: 'usd', product_data: { name: `${tier?.toUpperCase()} Full-Service Installation` },
        });
        priceId = iPriceObj.id;
        successUrl = `https://www.rensto.com/?payment=success&type=marketplace-install&product=${productId}`;
        webhookMetadata = { ...webhookMetadata, productId, tier, price: iPrice };
        break;

      case 'ready-solutions':
        const solutionPrices: Record<string, number> = {
          starter: 890, professional: 2990, enterprise: 2990,
          hvac: 499, roofer: 599, realtor: 399, insurance: 449, locksmith: 349, photographer: 299,
          single: 890, complete: 2990, 'full-service': 3787
        };
        const nichePrice = productId && solutionPrices[productId] ? solutionPrices[productId] : null;
        const sPrice = nichePrice || solutionPrices[tier || 'starter'];
        const packageName = metadata.nicheName || `${tier?.toUpperCase()} Industry Package`;
        const sPriceObj = await getStripe().prices.create({
          unit_amount: sPrice * 100, currency: 'usd', product_data: { name: packageName },
        });
        priceId = sPriceObj.id;
        successUrl = `https://www.rensto.com/?payment=success&type=ready-solutions&niche=${productId || tier}`;
        webhookMetadata = { ...webhookMetadata, tier, productId, price: sPrice, ...metadata };
        break;

      case 'subscription':
        const subPrices: Record<string, Record<string, number>> = {
          'lead-gen': { starter: 299, professional: 599, enterprise: 1499 },
          'crm': { starter: 299, professional: 599, enterprise: 1499 },
          'social': { starter: 299, professional: 599, enterprise: 1499 }
        };
        const sbPrice = subPrices[subscriptionType || 'lead-gen']?.[tier || 'starter'] || 299;
        const sbPriceObj = await getStripe().prices.create({
          unit_amount: sbPrice * 100, currency: 'usd', recurring: { interval: 'month' },
          product_data: { name: `${subscriptionType?.toUpperCase()} Subscription - ${tier?.toUpperCase()}` },
        });
        priceId = sbPriceObj.id;
        successUrl = `https://www.rensto.com/?payment=success&type=subscription&plan=${(subscriptionType || 'lead-gen')}-${(tier || 'starter')}`;
        webhookMetadata = { ...webhookMetadata, subscriptionType, tier, price: sbPrice };
        break;

      case 'custom-solutions':
        const customPrices: Record<string, number> = {
          audit: 297, sprint: 1997, simple: 3500, standard: 5500, complex: 8000,
          'lital-basic': 3000, 'lital-pro': 5800, 'lital-premium': 8500
        };
        const cKey = productId || tier || 'audit';
        const cPrice = customPrices[cKey];
        const cName = productId ? (productId === 'audit' ? 'Business Audit' : 'Automation Sprint') : `${tier?.toUpperCase()} Custom Solution Build`;
        const cPriceObj = await getStripe().prices.create({
          unit_amount: cPrice * 100, currency: 'usd', product_data: { name: cName },
        });
        priceId = cPriceObj.id;
        if (cKey.startsWith('lital')) {
          successUrl = `https://www.rensto.com/onboarding/lital?session_id={CHECKOUT_SESSION_ID}`;
        } else {
          successUrl = `https://www.rensto.com/?payment=success&type=custom&product=${cKey}`;
        }
        webhookMetadata = { ...webhookMetadata, product: cKey, productId, tier, price: cPrice };
        break;

      case 'custom-config':
        // Flow 6: Dynamic Configurator (Lital Hybrid)
        if (!Array.isArray(featureIds)) {
          return NextResponse.json({ error: 'featureIds must be an array' }, { status: 400 });
        }

        customLineItems = [];
        let hasRecurring = false;
        let hybridTotal = 0;

        // 1. Base (Always One-Time)
        // Check if explicit base ID is passed, OR just force add it if it's implicit? 
        // The frontend passes 'core_empire' ID now, so let's look for it or adding it if missing?
        // Let's stick to: "If it's in featureIds, we add it." (Frontend always sends it).
        // Actually, let's map through IDs to find them in config.

        // Helper to find in any category
        const findFeature = (id: string) => {
          if (id === LITAL_PRICING_CONFIG.base.id) return { ...LITAL_PRICING_CONFIG.base, type: 'base' };
          const support = LITAL_PRICING_CONFIG.supportOptions.find(o => o.id === id);
          if (support) return { ...support, type: 'subscription' };
          const upgrade = LITAL_PRICING_CONFIG.upgrades.find(u => u.id === id);
          if (upgrade) return { ...upgrade, type: 'upgrade' };
          return null;
        };

        for (const id of featureIds) {
          const item = findFeature(id);
          if (item) {
            const isRecurring = item.type === 'subscription';
            if (isRecurring) hasRecurring = true;

            const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
              price_data: {
                currency: LITAL_PRICING_CONFIG.currency,
                unit_amount: item.price * 100,
                product_data: {
                  name: item.label,
                  description: item.description,
                  tax_code: 'txcd_10000000'
                },
                tax_behavior: 'exclusive'
              },
              quantity: 1
            };

            // Add recurring details if needed
            if (isRecurring && 'interval' in item) {
              (lineItem.price_data as any).recurring = { interval: item.interval };
            }

            customLineItems.push(lineItem);
            hybridTotal += item.price; // Just for metadata tracking
          }
        }

        successUrl = `https://www.rensto.com/onboarding/lital?session_id={CHECKOUT_SESSION_ID}`;
        webhookMetadata = { ...webhookMetadata, flowType, featureIds: featureIds.join(','), price: hybridTotal };

        // sessionMode variable is not used by sessionConfig, it uses its own calculation.
        // sessionMode = 'payment'; 
        // if (hasRecurring) sessionMode = 'subscription';

        break;

      default:
        return NextResponse.json({ error: `Invalid flowType: ${flowType}` }, { status: 400 });
    }

    // Customer Logic
    const stripe = getStripe();
    let customerId: string | undefined;
    if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      const emailToUse = customerEmail.trim();
      const existingCustomers = await stripe.customers.list({ email: emailToUse, limit: 1 });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({ email: emailToUse, name: customerName || undefined });
        customerId = newCustomer.id;
      }
    }

    // Session Construction
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      ...(customerId && { customer: customerId }),
      ...(!customerId && customerEmail && customerEmail.trim() && customerEmail.includes('@') && { customer_email: customerEmail.trim() }),
      payment_method_types: ['card'],
      automatic_tax: { enabled: true },
      line_items: customLineItems || [
        {
          price: priceId,
          quantity: 1,
        }
      ],
      mode: (flowType === 'subscription' || (customLineItems && customLineItems.some(li => (li.price_data as any).recurring))) ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: `https://www.rensto.com/`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'IL'] }, // Removed 'IL' was in snapshot? Added it just in case.
    };

    // Metadata & Invoice Logic
    if (webhookMetadata && Object.keys(webhookMetadata).length > 0) {
      const stringMetadata: Record<string, string> = {};
      for (const [key, value] of Object.entries(webhookMetadata)) {
        if (value !== null && value !== undefined) {
          stringMetadata[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
      }
      if (Object.keys(stringMetadata).length > 0) {
        sessionConfig.metadata = stringMetadata;
      }
    }

    if (flowType !== 'subscription' && sessionConfig.metadata) {
      sessionConfig.payment_intent_data = { metadata: sessionConfig.metadata };
      sessionConfig.invoice_creation = { enabled: true };
    }
    if (flowType === 'subscription' && sessionConfig.metadata) {
      sessionConfig.subscription_data = { metadata: sessionConfig.metadata };
    }

    // SPECIAL LOGIC: For 'custom-config' (Lital Hybrid), if there is a subscription, we add a 30-day trial
    // so the Support fee starts NEXT month (1st Month Included).
    if (flowType === 'custom-config' && sessionConfig.mode === 'subscription') {
      sessionConfig.subscription_data = {
        ...sessionConfig.subscription_data,
        trial_period_days: 30, // Delay first recurring charge by 30 days
        metadata: sessionConfig.metadata
      };
    }

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
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
