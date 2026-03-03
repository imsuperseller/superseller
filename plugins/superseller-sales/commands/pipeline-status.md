---
name: Pipeline Status
description: Full sales pipeline review — prospects through paying customers, revenue metrics, and conversion health for SuperSeller AI SaaS.
---

# /pipeline-status

Generate a complete sales pipeline status report for SuperSeller AI. Covers every stage from raw prospect to paying customer, with revenue metrics and health indicators.

## What to do

### 1. Pull pipeline data from PostgreSQL

**Active leads by stage:**

```sql
SELECT
  status,
  qualification_status,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest,
  AVG(EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400)::int as avg_days_idle
FROM "Lead"
WHERE status NOT IN ('closed_lost', 'archived')
GROUP BY status, qualification_status
ORDER BY
  CASE status
    WHEN 'new' THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'responding' THEN 3
    WHEN 'qualified' THEN 4
    WHEN 'demo_scheduled' THEN 5
    WHEN 'proposal_sent' THEN 6
    WHEN 'negotiating' THEN 7
    WHEN 'trial' THEN 8
    WHEN 'closed_won' THEN 9
  END;
```

**Active subscriptions (paying customers):**

```sql
SELECT
  s.subscription_type,
  s.status,
  s.amount,
  s.billing_interval,
  s.user_email,
  s.created_at,
  s.current_period_end,
  s.cancel_at_period_end
FROM "Subscription" s
WHERE s.status IN ('active', 'past_due', 'trialing')
ORDER BY s.created_at DESC;
```

**Recent payments:**

```sql
SELECT
  p.customer_email,
  p.amount_total,
  p.currency,
  p.status,
  p.tier,
  p.created_at
FROM "Payment" p
WHERE p.created_at > NOW() - INTERVAL '30 days'
  AND p.status = 'completed'
ORDER BY p.created_at DESC;
```

**Credit balances (active users):**

```sql
SELECT
  e.plan,
  e.status,
  e.credits_balance,
  e.reset_at,
  e.updated_at
FROM entitlements e
WHERE e.status = 'active'
ORDER BY e.credits_balance DESC;
```

### 2. Build the pipeline funnel

Present as a visual funnel:

```
PIPELINE FUNNEL
===============
Prospects (new)           : [count] leads
Contacted                 : [count] leads
Engaged (responding)      : [count] leads
Qualified                 : [count] leads
Demo/Proposal             : [count] leads
Trial                     : [count] leads
-----------------------------------
Paying Customers          : [count] subscriptions
  Starter ($79/mo)        : [count]
  Pro ($149/mo)           : [count]
  Team ($299/mo)          : [count]
```

### 3. Revenue metrics

Calculate and display:

| Metric | Value |
|--------|-------|
| **MRR (Monthly Recurring Revenue)** | Sum of active subscription amounts |
| **Active subscribers** | Count of status='active' subscriptions |
| **Churn risk** | Subscriptions with `cancel_at_period_end = true` or `status = 'past_due'` |
| **Pipeline value** | Qualified+ leads x $79 (conservative starter estimate) |
| **Avg days to close** | Mean time from lead creation to `closed_won` |
| **Conversion rate** | `closed_won` / total leads (all time) |
| **30-day new leads** | Leads created in last 30 days |
| **30-day revenue** | Sum of completed payments in last 30 days |

### 4. Health indicators

Flag these issues:

- **Stale leads**: Any lead with no activity in 7+ days that is not closed
- **Uncontacted prospects**: Leads in `new` status for 48+ hours
- **At-risk subscriptions**: Past due payments, upcoming cancellations
- **Credit exhaustion**: Users with <10% of plan credits remaining (may churn)
- **Orphaned data**: Leads without a matching User record, or subscriptions without matching entitlements

### 5. Action items

Generate a prioritized list of recommended actions:

1. **Immediate** (today): Respond to leads waiting for reply, follow up on proposals, handle past-due payments
2. **This week**: Create demos for qualified leads, send proposals, re-engage stale leads
3. **This month**: Outreach to new prospects, referral requests to happy customers, content for lead generation

### 6. Cross-reference with Aitable

Check the Aitable dashboard (datasheet `dstTYYmleksXHj3sCj`) for any leads or pipeline data tracked there but not yet synced to PostgreSQL. Flag discrepancies.

## Output format

Start with a one-line health summary:

> **Pipeline Health: [STRONG / NEEDS ATTENTION / CRITICAL]** -- [MRR], [active customers] paying, [qualified leads] in pipeline.

Then the full funnel, metrics table, health flags, and action items.

## Notes

- Amounts in the `Subscription` and `Payment` tables are in cents (divide by 100 for display)
- `stripeCustomerId` and `stripeSubscriptionId` columns store PayPal IDs despite the column names (Feb 2026 migration)
- The `billingInterval` enum values are: `month`, `year`
- Credit plan tiers: starter (300 credits/mo), pro (800 credits/mo), team (2000 credits/mo)
