/**
 * Checkout Product Configuration
 * Maps product slugs to payment details for the pre-checkout page.
 * PayPal plan IDs and Stripe price IDs are resolved from env vars at runtime.
 */

export interface CheckoutProduct {
  slug: string;
  name: string;
  description: string;
  price: string; // Display price e.g. "$997/mo"
  amountCents: number; // For Stripe
  currency: string;
  interval: 'month' | 'year';
  features: string[]; // Bullet points for checkout page
  paypalPlanIdEnvVar: string | null; // env var name, resolved at runtime
  stripePriceIdEnvVar: string | null; // env var name, resolved at runtime
  serviceType: string;
}

export interface ResolvedCheckoutProduct extends Omit<CheckoutProduct, 'paypalPlanIdEnvVar' | 'stripePriceIdEnvVar'> {
  paypalPlanId: string | null;
  stripePriceId: string | null;
}

const PRODUCTS: CheckoutProduct[] = [
  {
    slug: 'content-automation',
    name: 'Autonomous Instagram Growth',
    description: 'AI-powered content creation, scheduling, and publishing for your Instagram. Grow your business on autopilot.',
    price: '$997/mo',
    amountCents: 99700,
    currency: 'USD',
    interval: 'month',
    features: [
      'Daily AI-generated posts tailored to your brand',
      'Automatic caption writing + hashtag optimization',
      'WhatsApp group for content review and approval',
      'Monthly performance report',
      'Dedicated AI agent responds to DMs',
    ],
    paypalPlanIdEnvVar: 'PAYPAL_PLAN_CONTENT_AUTOMATION',
    stripePriceIdEnvVar: 'STRIPE_PRICE_CONTENT_AUTOMATION',
    serviceType: 'content_automation',
  },
  {
    slug: 'video-bundle',
    name: 'VideoForge — AI Video Production',
    description: 'Turn your listings, products, or properties into stunning AI-generated videos — ready to post in minutes.',
    price: '$497/mo',
    amountCents: 49700,
    currency: 'USD',
    interval: 'month',
    features: [
      '20 AI videos per month',
      'AI voiceover narration',
      'Auto-publish to Instagram and Facebook',
      'WhatsApp delivery for quick review',
      'Custom branding on every video',
    ],
    paypalPlanIdEnvVar: 'PAYPAL_PLAN_VIDEO_BUNDLE',
    stripePriceIdEnvVar: 'STRIPE_PRICE_VIDEO_BUNDLE',
    serviceType: 'video_production',
  },
  {
    slug: 'growth-starter',
    name: 'Growth Starter',
    description: 'Everything you need to launch your AI-powered business presence. Perfect for getting started.',
    price: '$297/mo',
    amountCents: 29700,
    currency: 'USD',
    interval: 'month',
    features: [
      '10 AI videos per month',
      'Automated social media scheduling',
      'WhatsApp AI agent for customer inquiries',
      'Lead capture + follow-up sequences',
      'Monthly business performance report',
    ],
    paypalPlanIdEnvVar: 'PAYPAL_PLAN_GROWTH_STARTER',
    stripePriceIdEnvVar: 'STRIPE_PRICE_GROWTH_STARTER',
    serviceType: 'growth_starter',
  },
];

/**
 * Get product config with env vars resolved.
 * Returns null if product not found.
 */
export function getProductConfig(slug: string): ResolvedCheckoutProduct | null {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;

  const { paypalPlanIdEnvVar, stripePriceIdEnvVar, ...rest } = product;

  return {
    ...rest,
    paypalPlanId: paypalPlanIdEnvVar ? (process.env[paypalPlanIdEnvVar] ?? null) : null,
    stripePriceId: stripePriceIdEnvVar ? (process.env[stripePriceIdEnvVar] ?? null) : null,
  };
}

/**
 * Get all products (with env vars resolved).
 */
export function getAllProducts(): ResolvedCheckoutProduct[] {
  return PRODUCTS.map((product) => {
    const { paypalPlanIdEnvVar, stripePriceIdEnvVar, ...rest } = product;
    return {
      ...rest,
      paypalPlanId: paypalPlanIdEnvVar ? (process.env[paypalPlanIdEnvVar] ?? null) : null,
      stripePriceId: stripePriceIdEnvVar ? (process.env[stripePriceIdEnvVar] ?? null) : null,
    };
  });
}
