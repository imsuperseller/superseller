---
name: stripe-credits
description: >
  PayPal integration and credit-based billing for SuperSeller AI SaaS.
  Covers credit ledger, subscriptions ($79/$149/$299), payment webhooks,
  usage tracking, and provisioning. Use for any billing, credits, or PayPal work.
  (Skill name kept as stripe-credits for trigger compatibility.)
autoTrigger:
  - "credits"
  - "paypal"
  - "billing"
  - "payment"
  - "subscription"
  - "stripe"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "n8n"
---

# PayPal Credits Management

> **Migration note (Feb 25, 2026):** Stripe fully replaced by PayPal REST API v2. DB column names (`stripeCustomerId`, `stripeSessionId`, etc.) kept as-is to avoid destructive migration — they now store PayPal IDs.

## When to Use
Use when working on billing, credits, subscriptions, payment webhooks, or usage tracking. Not for video pipeline, UI/UX design, or n8n workflows.

## Critical Rules
1. **Credits are the universal currency.** All SaaS products consume credits. Never bypass the credit check.
2. **50 credits per TourReel video, 10 per regen clip.** These are canonical costs. Do not change without updating PRODUCT_BIBLE.md.
3. **PayPal webhook is the source of truth for payments.** Never trust client-side payment confirmation.
4. **UnrecoverableError for insufficient credits.** BullMQ must NOT retry when credits are insufficient (prevents double-charging Kie.ai).
5. **PAYPAL_MODE=live is mandatory.** Sandbox credentials don't exist. Never set to sandbox.

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `apps/web/superseller-site/src/lib/paypal.ts` | PayPal REST API v2 client (OAuth, Orders, Subscriptions, Refunds, Webhook verify) |
| `apps/web/superseller-site/src/lib/credits.ts` | Credit balance, deduction, top-up logic (web) |
| `apps/worker/src/services/credits.ts` | Worker-side credit checks before Kie.ai calls |
| `apps/web/superseller-site/src/app/api/webhooks/paypal/route.ts` | PayPal webhook handler (provisioning) |
| `apps/web/superseller-site/src/app/api/paypal/capture/route.ts` | Order capture after PayPal approval redirect |
| `apps/web/superseller-site/src/lib/services/ProvisioningService.ts` | Subscription → credit grant logic |
| `apps/web/superseller-site/src/app/api/video/subscribe/route.ts` | Subscription creation (PayPal) |
| `apps/web/superseller-site/src/app/api/checkout/route.ts` | One-time payment via PayPal Orders |

### Database Tables
- **UsageEvent** (Prisma): `id, userId, type (event_type), amount, jobId, createdAt` — Types: debit, refund, topup, grant, reset
- **users** (Drizzle): `credits_balance, tier, monthly_limit` — Worker reads this for gating
- **Subscription** (Prisma): `userEmail, stripeSubscriptionId` (stores PayPal subscription ID), `currentPeriodStart, currentPeriodEnd`
- **Payment** (Prisma): `userId, amount, status, flowType, stripeSessionId` (stores PayPal order ID)

### PayPal Live Resources
| Resource | ID |
|----------|----|
| Product | PROD-4W993698BV951770E |
| Starter Plan ($79/mo) | P-0B306329F7595150BNGP3YLI |
| Pro Plan ($149/mo) | P-8N117174GS808883MNGP3YLI |
| Team Plan ($299/mo) | P-0239494375225084CNGP3YLI |
| Webhook | 7K1581345X6344910 |

### Subscription Tiers (Canonical)
| Plan | Price | Videos | Credits | PayPal Plan ID |
|------|-------|--------|---------|----------------|
| Starter | $79/mo | 5 | 500 | PAYPAL_STARTER_PLAN_ID |
| Pro | $149/mo | 15 | 1,500 | PAYPAL_PRO_PLAN_ID |
| Team | $299/mo | 50 | 4,000 | PAYPAL_TEAM_PLAN_ID |

### PayPal Fee Structure
- 3.49% + $0.49 per transaction (tracked in expense-tracker.ts as `paypal_fees`)

## Common Patterns

### Check + Deduct Credits (Worker)
```typescript
import { checkCredits, deductCredits } from '../services/credits';
import { UnrecoverableError } from 'bullmq';

const balance = await checkCredits(userId);
if (balance < COST) {
  throw new UnrecoverableError('Insufficient Credits');
}
await deductCredits(userId, COST, jobId);
```

### PayPal Checkout Flow (One-time payment)
```
User clicks Buy → POST /api/checkout
  → createOrder() (PayPal Orders API)
  → Return approval URL → user redirects to PayPal
  → User approves → PayPal redirects to /api/paypal/capture?token=ORDER_ID
  → captureOrder() → Record Payment → ProvisioningService → Redirect /success
```

### PayPal Subscription Flow
```
User clicks Subscribe → POST /api/video/subscribe
  → createSubscription() (PayPal Subscriptions API)
  → Return approval URL → user redirects to PayPal
  → User approves → PayPal webhook fires BILLING.SUBSCRIPTION.ACTIVATED
  → Webhook handler → Create Subscription record → Grant credits → UsageEvent
```

### PayPal Webhook Flow
```
PayPal BILLING.SUBSCRIPTION.ACTIVATED
  → Verify signature (PAYPAL_WEBHOOK_ID)
  → Extract subscription details
  → ProvisioningService.provisionSubscription()
  → Grant credits to user
  → Create UsageEvent (type: 'grant')
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Webhook returns 400 `Signature verification failed` | `PAYPAL_WEBHOOK_ID` mismatch or missing on Vercel. | Check Vercel env: PAYPAL_WEBHOOK_ID must be `7K1581345X6344910`. |
| Credits not granted after payment | Webhook event type not handled, or webhook URL misconfigured. | Check PayPal webhook dashboard. Verify URL is `https://superseller.agency/api/webhooks/paypal`. |
| OAuth token expired | Token cached beyond 32400s TTL. | PayPal client auto-refreshes. If manual curl: combine token fetch + API call in single command. |
| `UnrecoverableError: Insufficient Credits` | User's credit balance < job cost. BullMQ correctly stops retry. | Expected behavior. User must purchase more credits or upgrade plan. |
| Credit balance shows 0 but user paid | `credits_balance` in Drizzle (worker) not synced with Prisma UsageEvent ledger. | Recalculate: `SELECT SUM(amount) FROM usage_events WHERE "userId" = ?`. Update `users.credits_balance`. |
| PayPal sandbox 401 | Credentials are LIVE only. PAYPAL_MODE must be `live`. | Never set PAYPAL_MODE to sandbox. |

## References
- PRODUCT_BIBLE.md § SaaS Billing — Canonical pricing
- DECISIONS.md §19 — Stripe → PayPal migration decision
- `apps/web/superseller-site/src/lib/paypal.ts` — PayPal API client
- `apps/web/superseller-site/src/lib/credits.ts` — Credit balance logic
- `apps/web/superseller-site/src/app/api/webhooks/paypal/route.ts` — Webhook handler
