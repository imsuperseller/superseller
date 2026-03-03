---
name: Billing System
description: PayPal subscription management, credit ledger, and billing infrastructure for SuperSeller AI
---

# Billing System

SuperSeller AI billing infrastructure, migrated from Stripe to PayPal in February 2026.

## Payment Provider: PayPal

- **Migration**: Stripe to PayPal completed February 2026
- **Database convention**: DB columns retain `stripe*` naming but store PayPal IDs
  - `stripeCustomerId` stores PayPal customer/payer ID
  - `stripeSubscriptionId` stores PayPal subscription ID
- **API**: PayPal REST API v2 (api-m.paypal.com)
- **Webhook**: PayPal IPN/webhooks for subscription events (created, activated, cancelled, payment.completed)

## Subscription Tiers

| Tier | Price | Credits/Month | Target Customer |
|------|-------|---------------|-----------------|
| **Starter** | $79/month | 300 credits | Solo operator, 1-2 products |
| **Pro** | $149/month | 800 credits | Growing business, 3-4 products |
| **Team** | $299/month | 2,000 credits | Agency/multi-location, all products |

## Credit System

Credits are the internal currency for all AI operations.

### Credit Costs by Operation

| Operation | Credits |
|-----------|---------|
| TourReel video (Kling Pro) | 10 credits |
| TourReel video (Kling Std) | 3 credits |
| TourReel photo comp (Remotion) | 0 credits (free) |
| SocialHub post generation | 2 credits |
| SocialHub image (Nano Banana) | 5 credits |
| Winner Studio render | 8 credits |
| FrontDesk voice call | 1 credit/minute |
| Lead page generation | 3 credits |

### Credit Ledger

Table: `credit_transactions`

```sql
-- Schema
id          UUID PRIMARY KEY
userId      TEXT REFERENCES "User"(id)
type        TEXT -- 'credit' or 'debit'
amount      INTEGER
description TEXT
metadata    JSONB
createdAt   TIMESTAMP
```

Key operations:
- **Credit**: Monthly allotment on subscription renewal, manual top-ups, promotional credits
- **Debit**: Each AI operation consumes credits via `deductCredits()` in `apps/web/superseller-site/src/lib/credits.ts`

### Credit Logic Files

- **Web**: `apps/web/superseller-site/src/lib/credits.ts` — `checkCredits()`, `deductCredits()`, `getBalance()`
- **Worker**: `apps/worker/src/services/credits.ts` — Worker-side credit operations with gating

### Gating

Before any AI operation:
1. `checkCredits(userId, requiredAmount)` — returns boolean
2. If insufficient: return error with current balance and required amount
3. If sufficient: proceed, then `deductCredits(userId, amount, description)`

## Subscription Lifecycle

1. **Checkout**: User selects tier on superseller.agency/pricing, redirected to PayPal checkout
2. **Activation**: PayPal webhook fires `BILLING.SUBSCRIPTION.ACTIVATED`, we create Subscription record + initial credit allotment
3. **Renewal**: PayPal auto-charges monthly, webhook fires `PAYMENT.SALE.COMPLETED`, we add monthly credit allotment
4. **Cancellation**: User cancels in portal or PayPal, `cancelAtPeriodEnd` set to true, access continues until period end
5. **Past Due**: Payment fails, status set to `past_due`, 3-day grace period, then service suspension

## Key Database Tables

- `Subscription` — PayPal subscription state, plan, period dates
- `Payment` — Payment history (amount, status, method)
- `credit_transactions` — Credit ledger (all credits and debits)
- `UsageLog` — Per-operation usage tracking with credit amounts

## PayPal Integration Notes

- **Sandbox vs Production**: Use `PAYPAL_API_BASE` env var to switch
- **Webhook verification**: Validate PayPal webhook signatures on all incoming events
- **Idempotency**: PayPal webhook events may fire multiple times — use event ID for deduplication
- **Currency**: All amounts in USD
- **Refunds**: Via PayPal API, must also reverse credit transactions
