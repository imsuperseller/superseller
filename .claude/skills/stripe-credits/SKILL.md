---
name: stripe-credits
description: >
  Stripe integration and credit-based billing for Rensto SaaS.
  Covers credit ledger, subscriptions ($79/$149/$299), payment webhooks,
  usage tracking, and provisioning. Use for any billing, credits, or Stripe work.
autoTrigger:
  - "credits"
  - "stripe"
  - "billing"
  - "payment"
  - "subscription"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "n8n"
---

# Stripe Credits Management

## When to Use
Use when working on billing, credits, subscriptions, payment webhooks, or usage tracking. Not for video pipeline, UI/UX design, or n8n workflows.

## Critical Rules
1. **Credits are the universal currency.** All SaaS products consume credits. Never bypass the credit check.
2. **50 credits per TourReel video, 10 per regen clip.** These are canonical costs. Do not change without updating PRODUCT_BIBLE.md.
3. **Stripe webhook is the source of truth for payments.** Never trust client-side payment confirmation.
4. **UnrecoverableError for insufficient credits.** BullMQ must NOT retry when credits are insufficient (prevents double-charging Kie.ai).

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `apps/web/rensto-site/src/lib/credits.ts` | Credit balance, deduction, top-up logic (web) |
| `apps/worker/src/services/credits.ts` | Worker-side credit checks before Kie.ai calls |
| `apps/web/rensto-site/src/app/api/webhooks/stripe/route.ts` | Stripe webhook handler (provisioning) |
| `apps/web/rensto-site/src/lib/services/ProvisioningService.ts` | Subscription → credit grant logic |
| `apps/web/rensto-site/src/app/api/video/subscribe/route.ts` | Subscription checkout creation |
| `apps/web/rensto-site/src/app/api/video/credits/route.ts` | Credit balance endpoint |
| `apps/web/rensto-site/src/app/api/video/usage/route.ts` | Usage history endpoint |

### Database Tables
- **UsageEvent** (Prisma): `id, userId, type (event_type), amount, jobId, createdAt` — Types: debit, refund, topup, grant, reset
- **users** (Drizzle): `credits_balance, tier, monthly_limit` — Worker reads this for gating
- **Subscription** (Prisma): `userEmail, stripeSubscriptionId, currentPeriodStart, currentPeriodEnd`
- **Payment** (Prisma): `userId, amount, status, flowType, stripeSessionId`

### Subscription Tiers (Canonical)
| Plan | Price | Videos | Credits | Stripe Product |
|------|-------|--------|---------|----------------|
| Starter | $79/mo | 5 | 500 | STRIPE_STARTER_PRICE_ID |
| Pro | $149/mo | 15 | 1,500 | STRIPE_PRO_PRICE_ID |
| Team | $299/mo | 50 | 4,000 | STRIPE_TEAM_PRICE_ID |

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

### Stripe Webhook Flow
```
Stripe checkout.session.completed
  → Verify signature (STRIPE_WEBHOOK_SECRET)
  → Extract metadata (userId, plan, credits)
  → ProvisioningService.provisionSubscription()
  → Grant credits to user
  → Create UsageEvent (type: 'grant')
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Webhook returns 400 `Signature verification failed` | `STRIPE_WEBHOOK_SECRET` mismatch between Stripe dashboard and Vercel/worker env. | Compare `whsec_...` in Stripe Dashboard → Webhooks with Vercel env var. Update + redeploy. |
| Credits not granted after successful payment | Webhook event type not handled. Only `checkout.session.completed` triggers provisioning. | Check route handler processes the correct event type. Verify ProvisioningService is called. |
| Double credit grant | Webhook replayed (Stripe retries on 5xx). Missing idempotency check. | Use `checkout.session.id` as idempotency key. Check if Payment record already exists before granting. |
| `UnrecoverableError: Insufficient Credits` | User's credit balance < job cost. BullMQ correctly stops retry. | Expected behavior. User must purchase more credits or upgrade plan. |
| Credit balance shows 0 but user paid | `credits_balance` in Drizzle (worker) not synced with Prisma UsageEvent ledger. | Recalculate: `SELECT SUM(amount) FROM usage_events WHERE "userId" = ?`. Update `users.credits_balance`. |
| Checkout session creates but redirect fails | `success_url` or `cancel_url` misconfigured in checkout creation route. | Check `/api/video/subscribe` or `/api/checkout` for correct URLs. Must include `{CHECKOUT_SESSION_ID}`. |

## References
- PRODUCT_BIBLE.md § SaaS Billing — Canonical pricing
- NotebookLM 719854ee — Subscription tiers and pricing
- `apps/web/rensto-site/src/app/api/webhooks/stripe/route.ts` — Webhook handler
- `apps/web/rensto-site/src/lib/credits.ts` — Credit balance logic
