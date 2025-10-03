import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Product pricing configuration (in cents)
export const PRODUCT_PRICES = {
  'basic-automation': 9900, // $99.00
  'advanced-automation': 19900, // $199.00
  'enterprise-automation': 49900, // $499.00
  'custom-workflow': 29900, // $299.00
  'integration-setup': 14900, // $149.00
} as const;

// Subscription pricing configuration (in cents)
export const SUBSCRIPTION_PRICES = {
  'starter': {
    monthly: 2900, // $29.00
    yearly: 29000, // $290.00 (2 months free)
  },
  'professional': {
    monthly: 9900, // $99.00
    yearly: 99000, // $990.00 (2 months free)
  },
  'enterprise': {
    monthly: 29900, // $299.00
    yearly: 299000, // $2990.00 (2 months free)
  },
} as const;

// Deployment package pricing (in cents)
export const DEPLOYMENT_PACKAGES = {
  'basic-setup': 0, // Free
  'standard-setup': 19900, // $199.00
  'premium-setup': 49900, // $499.00
  'enterprise-setup': 99900, // $999.00
  'custom-setup': 0, // Contact for pricing
} as const;

// Type definitions for better type safety
export type ProductId = keyof typeof PRODUCT_PRICES;
export type SubscriptionTier = keyof typeof SUBSCRIPTION_PRICES;
export type DeploymentPackage = keyof typeof DEPLOYMENT_PACKAGES;

export const formatAmountForDisplay = (amount: number, currency: string): string => {
  let numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  return numberFormat.format(amount);
};

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};