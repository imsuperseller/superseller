---
name: Daily Financial Report
description: Generate daily P&L — revenue, API costs, margin per customer, and anomalies
---

# Daily Financial Report

Generate a comprehensive daily profit and loss report for SuperSeller AI.

## Process

### Step 1: Revenue (Subscriptions)

Query active subscriptions and their monthly values:

```sql
SELECT
  u.name AS customer,
  t.name AS tenant,
  s."planId",
  s.status,
  CASE s."planId"
    WHEN 'starter' THEN 79
    WHEN 'pro' THEN 149
    WHEN 'team' THEN 299
    ELSE 0
  END AS monthly_revenue,
  s."currentPeriodEnd" AS next_renewal
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
LEFT JOIN "TenantUser" tu ON tu."userId" = u.id
LEFT JOIN "Tenant" t ON tu."tenantId" = t.id
WHERE s.status = 'active'
ORDER BY monthly_revenue DESC;
```

Calculate:
- **Total MRR** (Monthly Recurring Revenue)
- **Daily revenue rate** = MRR / 30
- **Renewals due this week**

### Step 2: API Costs (Last 24 Hours)

Query the expense tracker for today's API costs:

```sql
SELECT
  operation,
  COUNT(*) AS call_count,
  SUM(cost) AS total_cost
FROM expense_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY operation
ORDER BY total_cost DESC;
```

If `expense_log` table doesn't exist, check usage logs for credit consumption:

```sql
SELECT
  ul.product,
  ul.action,
  COUNT(*) AS operations,
  SUM(ul."creditsUsed") AS credits_consumed
FROM "UsageLog" ul
WHERE ul."createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY ul.product, ul.action
ORDER BY credits_consumed DESC;
```

Apply cost rates:
| API | Cost per call |
|-----|--------------|
| Kling Pro (video) | $0.10 |
| Kling Standard | $0.03 |
| Suno (music) | $0.06 |
| Nano Banana Pro (image) | $0.09 |
| Gemini Flash (text) | $0.001 |
| Recraft (image) | $0.04 |
| Seedream (image) | $0.02 |

### Step 3: Margin per Customer

For each active customer, calculate:

```
Customer margin = (Monthly subscription fee / 30) - (Daily API costs for that customer)
```

```sql
SELECT
  u.name,
  CASE s."planId"
    WHEN 'starter' THEN 79.0/30
    WHEN 'pro' THEN 149.0/30
    WHEN 'team' THEN 299.0/30
    ELSE 0
  END AS daily_revenue,
  COALESCE(costs.daily_cost, 0) AS daily_cost,
  CASE s."planId"
    WHEN 'starter' THEN 79.0/30
    WHEN 'pro' THEN 149.0/30
    WHEN 'team' THEN 299.0/30
    ELSE 0
  END - COALESCE(costs.daily_cost, 0) AS daily_margin
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
LEFT JOIN (
  SELECT "userId", SUM("creditsUsed" * 0.05) AS daily_cost
  FROM "UsageLog"
  WHERE "createdAt" > NOW() - INTERVAL '24 hours'
  GROUP BY "userId"
) costs ON costs."userId" = u.id
WHERE s.status = 'active'
ORDER BY daily_margin ASC;
```

### Step 4: Anomaly Detection

Flag any of the following:
- API cost spike > 2x the 7-day average for any operation
- Customer credit consumption > 50% of monthly allotment in one day
- Failed API calls > 10% of total calls (wasted spend)
- Any individual API call > $1.00

### Step 5: Infrastructure Costs (Fixed)

| Service | Monthly Cost | Daily Cost |
|---------|-------------|------------|
| RackNerd VPS | $15 | $0.50 |
| Vercel Pro | $20 | $0.67 |
| PostgreSQL (included in VPS) | $0 | $0 |
| Domain (superseller.agency) | $15/yr | $0.04 |
| **Total Fixed** | **~$36/mo** | **~$1.21/day** |

## Output Format

```
SUPERSELLER AI — DAILY P&L
Date: [YYYY-MM-DD]
═══════════════════════════

REVENUE
  MRR:              $[X]
  Daily Rate:       $[X/30]
  Active Subs:      [N] customers

API COSTS (Last 24h)
  Kling Pro:        [N] calls × $0.10 = $[X]
  Kling Std:        [N] calls × $0.03 = $[X]
  Suno:             [N] calls × $0.06 = $[X]
  Nano Banana:      [N] calls × $0.09 = $[X]
  Gemini:           [N] calls × $0.001 = $[X]
  ─────────────────────────
  Total API:        $[X]

FIXED COSTS (Daily)
  Infrastructure:   $1.21

MARGIN
  Daily Revenue:    $[X]
  Daily Costs:      $[X] (API + Fixed)
  Daily Margin:     $[X] ([X]%)

PER-CUSTOMER MARGIN
  [Customer 1]:     $[rev/day] rev - $[cost/day] cost = $[margin] margin
  [Customer 2]:     ...

ANOMALIES
  [Any flagged items, or "None detected"]

UPCOMING
  Renewals this week:  [List]
  Credits running low: [List of customers below 20%]
```
