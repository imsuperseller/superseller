---
name: Pricing Strategy
description: SuperSeller AI SaaS pricing model — three tiers, credit-based billing, PayPal subscriptions, and the economics behind the pricing.
---

# Pricing Strategy

SuperSeller AI uses a credit-based SaaS pricing model with three tiers, billed monthly via PayPal. The model is designed for the primary customer avatar: Israeli/Jewish small business owners spending $100K-$1M/year who see $79/month as less than one day's revenue.

## Pricing Tiers

| Tier | Monthly Price | Credits/Month | Target Customer | Key Value |
|------|--------------|---------------|-----------------|-----------|
| **Starter** | $79/mo | 300 credits | Solo operator, just getting started with AI | "Get online and start generating leads" |
| **Pro** | $149/mo | 800 credits | Growing business, needs content + lead gen | "Full AI crew working daily for your business" |
| **Team** | $299/mo | 2,000 credits | Multi-location or high-volume business | "Enterprise-grade AI at small business prices" |

## Credit Economics

Credits are the universal billing unit across all SuperSeller AI products. Each AI operation consumes credits based on its computational cost.

### Credit Costs by Operation

| Operation | Credits | Underlying Cost | Margin |
|-----------|---------|-----------------|--------|
| **AI video clip** (Kling 3.0 Pro) | 10 credits | $0.10 | ~60% at Starter |
| **AI video clip** (Kling 3.0 Standard) | 3 credits | $0.03 | ~75% |
| **AI music track** (Suno) | 6 credits | $0.06 | ~65% |
| **AI image** (Nano Banana Pro) | 9 credits | $0.09 | ~57% |
| **Social media post** (Claude AI text + image) | 5 credits | ~$0.02 | ~95% |
| **Voice call handling** (Telnyx + AI) | 2 credits | ~$0.01 | ~98% |
| **Landing page generation** | 15 credits | ~$0.01 | ~99% |
| **Photo composition video** (Remotion) | 0 credits | $0.00 | 100% (zero marginal cost) |

### Credit Math by Tier

| Tier | Credits | Typical Monthly Usage | Headroom |
|------|---------|----------------------|----------|
| **Starter** (300) | 300 | ~8 social posts (40) + 2 videos (20) + 10 voice calls (20) + 1 landing page (15) = 95 credits | 68% unused -- room to grow |
| **Pro** (800) | 800 | ~20 social posts (100) + 5 videos (50) + 30 voice calls (60) + 3 landing pages (45) = 255 credits | 68% unused |
| **Team** (2,000) | 2,000 | ~50 social posts (250) + 15 videos (150) + 100 voice calls (200) + 5 landing pages (75) = 675 credits | 66% unused |

Credits reset monthly on the subscription renewal date. Unused credits do not roll over.

## Billing Infrastructure

### PayPal Integration

- **Migrated from Stripe**: February 2026
- **DB columns**: Retain `stripe*` naming but store PayPal IDs (intentional -- avoids schema migration risk)
  - `stripeCustomerId` --> PayPal customer/payer ID
  - `stripeSubscriptionId` --> PayPal subscription ID
  - `stripePriceId` --> PayPal plan ID
- **Webhook**: PayPal IPN/webhooks update `Payment` and `Subscription` tables
- **Checkout**: PayPal Smart Buttons on superseller.agency pricing page

### Database Tables

| Table | Purpose |
|-------|---------|
| `Subscription` | Active subscriptions -- tier, amount, billing interval, period dates, cancellation status |
| `Entitlement` (mapped: `entitlements`) | Credit balance, plan tier, status, reset date |
| `UsageEvent` (mapped: `usage_events`) | Every credit deduction/refund with metadata for auditing |
| `Payment` | Payment event log from PayPal webhooks |

### Credit Operations (via CreditService)

```
CreditService.getBalance(userId)     -- Check current balance
CreditService.deductCredits(...)     -- Deduct with usage logging
CreditService.refundCredits(...)     -- Refund with reason tracking
CreditService.addCredits(...)        -- Top-up, grant, or monthly reset
```

All credit operations are transactional (PostgreSQL transaction) to prevent race conditions.

## Pricing Psychology

### Why These Price Points

| Price | Psychology |
|-------|-----------|
| **$79** | Less than one day's revenue for any viable service business. "If this gets you even one extra customer, it pays for itself." Non-threatening entry point. |
| **$149** | Natural upgrade once Starter value is proven. Positions as "serious about growth." Still far below hiring a marketing person ($3K+/mo) or agency ($2K-5K/mo). |
| **$299** | Premium tier signals "real business tool." Only sold to customers already seeing value from lower tier. Often multi-location operators. |

### Competitive Anchoring

| Alternative | Monthly Cost | SuperSeller Advantage |
|-------------|-------------|----------------------|
| Marketing agency | $2,000-5,000 | 25-65x cheaper |
| Freelance marketer | $1,000-3,000 | 12-38x cheaper |
| Individual AI tools (Canva + Jasper + scheduling + voice) | $243-475 | 3-6x cheaper for more functionality |
| Doing it yourself | $0 + 20 hrs/week | Time value: at $50/hr, that is $4,000/mo of owner time |

### Objection Handling

| Objection | Response |
|-----------|----------|
| "Too expensive" | "How much does a missed customer cost you? One job probably pays for 3 months." |
| "I'll think about it" | "No pressure. Want me to create a free sample for your business so you can see the quality?" |
| "I can do this myself" | "You absolutely can. The question is: is your time worth more doing [their craft] or making social media posts?" |
| "What if it doesn't work?" | "Cancel anytime, no contract. And your first deliverable ships within 24 hours." |
| "My nephew can do this" | "That works for a one-time website. But who posts 5x/week, answers calls at 2am, and generates leads daily?" |

## Upsell Strategy

1. **Starter to Pro**: After 60 days on Starter, if credit usage is >70% consistently, suggest Pro with "You're clearly growing -- Pro gives you the headroom to scale."
2. **Pro to Team**: When customer adds a second location or business, or when credit usage hits 90%+ consistently.
3. **Add-on products**: Offer specific products (FrontDesk for missed calls, TourReel for video) as entry points, then upsell to full crew.

## Annual Pricing (Future)

Not yet implemented. Planned discount: 2 months free (16.7% discount) for annual commitment.

| Tier | Monthly | Annual (planned) |
|------|---------|-----------------|
| Starter | $79/mo | $790/yr ($65.83/mo effective) |
| Pro | $149/mo | $1,490/yr ($124.17/mo effective) |
| Team | $299/mo | $2,990/yr ($249.17/mo effective) |

## Key Rules

1. **Never lead with price** -- demonstrate value first, discuss pricing only after the prospect has seen a sample or demo
2. **No free tier** -- free samples yes, free ongoing tier no. The customer must have skin in the game.
3. **Cancel anytime** -- no annual lock-in (yet). Reduces friction to start.
4. **First deliverable in 24 hours** -- the customer must feel value immediately after paying
5. **Track credit costs religiously** -- the expense tracker (`trackExpense()`) must log every API call that costs money
6. **Remotion compositions are free** -- photo-based videos have zero marginal cost and should be promoted as high-value inclusions
