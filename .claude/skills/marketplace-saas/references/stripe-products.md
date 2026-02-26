# Stripe Products — FB Marketplace Bot SaaS

Created: February 23, 2026

> **DEPRECATED**: Standalone FB Bot pricing ($99/$299/$999) is superseded by the unified SaaS credit-based model.
> Canonical pricing: Starter $79/mo (500 credits), Pro $149/mo (1,500 credits), Team $299/mo (4,000 credits).
> See `.claude/skills/stripe-credits/SKILL.md` for current tiers.

## Archived Products (DEPRECATED — Do Not Use for New Customers)

### Starter Tier (DEPRECATED)
- **Product ID**: `prod_U2EFmrdU4xFlTK`
- **Price ID**: `price_1T49maDE8rt1dEs1yoVGzIfL`
- **Amount**: $99/mo (DEPRECATED)
- **Features**:
  - 100 posts per month
  - 1 product
  - Email support
  - Basic analytics

### Pro Tier (DEPRECATED)
- **Product ID**: `prod_U2EFxjzvGOvDsy`
- **Price ID**: `price_1T49maDE8rt1dEs1ysQsHB9U`
- **Amount**: $299/mo (DEPRECATED)
- **Features**:
  - 500 posts per month
  - Unlimited products
  - Priority support
  - Advanced analytics
  - Custom scheduling

### Enterprise Tier (DEPRECATED)
- **Product ID**: `prod_U2EFS8dpDfqjVB`
- **Price ID**: `price_1T49mbDE8rt1dEs1Z3eQ8aid`
- **Amount**: $999/mo (DEPRECATED)
- **Features**:
  - Unlimited posts
  - Unlimited products
  - Dedicated support
  - Account manager
  - White-label option
  - Custom integrations
  - API access

## Usage in Code

### API Route Example
```typescript
// apps/web/superseller-site/src/app/api/marketplace/checkout/route.ts
const PRICE_IDS = {
  starter: 'price_1T49maDE8rt1dEs1yoVGzIfL',
  pro: 'price_1T49maDE8rt1dEs1ysQsHB9U',
  enterprise: 'price_1T49mbDE8rt1dEs1Z3eQ8aid',
};

// Create checkout session
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: PRICE_IDS[tier],
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: `${origin}/dashboard/marketplace?success=true`,
  cancel_url: `${origin}/dashboard/marketplace/billing?canceled=true`,
  customer_email: user.email,
  metadata: {
    userId: user.id,
    service: 'fb_marketplace_bot',
    tier,
  },
});
```

### Webhook Handler
```typescript
// apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts
switch (event.type) {
  case 'checkout.session.completed':
    // Update marketplace_customers.subscription
    await prisma.marketplaceCustomer.update({
      where: { userId: metadata.userId },
      data: {
        subscription: metadata.tier.toUpperCase(),
        credits: metadata.tier === 'starter' ? 100 : metadata.tier === 'pro' ? 500 : 999999,
      },
    });
    break;

  case 'customer.subscription.deleted':
    // Pause customer account
    await prisma.marketplaceCustomer.update({
      where: { userId: customerId },
      data: { status: 'PAUSED', subscription: 'NONE' },
    });
    break;
}
```

## Metadata Schema

All products use consistent metadata for programmatic access:

```json
{
  "service": "fb_marketplace_bot",
  "tier": "starter" | "pro" | "enterprise",
  "post_limit": "100" | "500" | "unlimited",
  "product_limit": "1" | "unlimited",
  "support_level": "email" | "priority" | "dedicated",
  "includes_analytics": "true",
  "includes_whitelabel": "true",
  "includes_account_manager": "true"
}
```

## Post Limits Enforcement

| Tier | Monthly Limit | Credits Deducted per Post | Overage Handling |
|------|--------------|---------------------------|------------------|
| Starter | 100 | 1 credit | Block posting at limit |
| Pro | 500 | 1 credit | Allow overage at $0.60/post |
| Enterprise | Unlimited | N/A | Never block |

## Related Files

- `/apps/web/superseller-site/src/app/api/marketplace/checkout/route.ts` — Checkout flow
- `/apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts` — Subscription webhooks
- `/apps/web/superseller-site/src/app/(main)/dashboard/marketplace/billing/page.tsx` — Billing UI
- `/apps/web/superseller-site/prisma/schema.prisma` — marketplace_customers.subscription field
