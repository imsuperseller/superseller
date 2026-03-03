---
name: Cost Anomaly Detection
description: Detect and alert on cost anomalies — unexpected spend, failed API calls, usage spikes
---

# Cost Anomaly Detection

Proactively identify cost anomalies that could indicate bugs, abuse, or configuration errors.

## Process

### Step 1: Baseline Calculation (7-Day Average)

```sql
SELECT
  operation,
  AVG(daily_count) AS avg_daily_calls,
  AVG(daily_cost) AS avg_daily_cost,
  STDDEV(daily_cost) AS stddev_cost
FROM (
  SELECT
    operation,
    DATE(created_at) AS day,
    COUNT(*) AS daily_count,
    SUM(cost) AS daily_cost
  FROM expense_log
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY operation, DATE(created_at)
) daily_stats
GROUP BY operation;
```

If expense_log is unavailable, use UsageLog with cost rates:

```sql
SELECT
  product,
  action,
  AVG(daily_credits) AS avg_daily_credits,
  STDDEV(daily_credits) AS stddev_credits
FROM (
  SELECT
    product,
    action,
    DATE("createdAt") AS day,
    SUM("creditsUsed") AS daily_credits
  FROM "UsageLog"
  WHERE "createdAt" > NOW() - INTERVAL '7 days'
  GROUP BY product, action, DATE("createdAt")
) daily_stats
GROUP BY product, action;
```

### Step 2: Today's Costs vs Baseline

```sql
SELECT
  operation,
  COUNT(*) AS today_calls,
  SUM(cost) AS today_cost
FROM expense_log
WHERE created_at > DATE_TRUNC('day', NOW())
GROUP BY operation;
```

### Step 3: Anomaly Rules

Flag as anomaly if ANY of these conditions are true:

| Rule | Threshold | Severity |
|------|-----------|----------|
| **Cost spike** | Today's cost > 2x the 7-day average for any operation | HIGH |
| **Volume spike** | Today's call count > 3x the 7-day average | MEDIUM |
| **Failed call ratio** | > 10% of API calls returned errors | HIGH |
| **Single expensive call** | Any individual API call > $1.00 | MEDIUM |
| **Customer burn rate** | Customer used > 50% of monthly credits in 24h | HIGH |
| **Zero usage anomaly** | Active customer with zero usage for 3+ days (was active before) | LOW |
| **New operation** | API operation type never seen before in 7-day window | LOW |

### Step 4: Failed API Calls (Wasted Spend)

```sql
SELECT
  operation,
  error_code,
  COUNT(*) AS failure_count,
  SUM(cost) AS wasted_cost
FROM expense_log
WHERE created_at > DATE_TRUNC('day', NOW())
  AND status = 'failed'
GROUP BY operation, error_code
ORDER BY wasted_cost DESC;
```

Common expensive failures:
- **Kling 422**: WebP format sent instead of JPG/PNG ($0.10 per failed call)
- **Kling timeout**: Job started but never completed (credits consumed)
- **Nano Banana model error**: "Models task execute failed" on wrong model name ($0.09 wasted)

### Step 5: Per-Customer Anomalies

```sql
SELECT
  u.name,
  SUM(ul."creditsUsed") AS today_credits,
  s."planId",
  CASE s."planId"
    WHEN 'starter' THEN 300
    WHEN 'pro' THEN 800
    WHEN 'team' THEN 2000
    ELSE 0
  END AS monthly_allotment,
  ROUND(SUM(ul."creditsUsed")::numeric / CASE s."planId"
    WHEN 'starter' THEN 300
    WHEN 'pro' THEN 800
    WHEN 'team' THEN 2000
    ELSE 1
  END * 100, 1) AS pct_of_monthly
FROM "UsageLog" ul
JOIN "User" u ON ul."userId" = u.id
LEFT JOIN "Subscription" s ON s."userId" = u.id AND s.status = 'active'
WHERE ul."createdAt" > DATE_TRUNC('day', NOW())
GROUP BY u.name, s."planId"
HAVING SUM(ul."creditsUsed") > 0
ORDER BY pct_of_monthly DESC;
```

## Output Format

```
COST ANOMALY REPORT
Date: [YYYY-MM-DD HH:MM]
═══════════════════════

STATUS: [ALL CLEAR / ANOMALIES DETECTED]

ANOMALIES ([N] found)
─────────────────────

[HIGH] Cost Spike — Kling Pro
  Today: $[X] ([N] calls) vs 7-day avg: $[Y] ([M] calls)
  Increase: [Z]x baseline
  Likely cause: [assessment]

[HIGH] Failed Calls — [Operation]
  [N] failures out of [M] total ([P]%)
  Wasted cost: $[X]
  Error: [error code / message]
  Fix: [recommendation]

[MEDIUM] Customer Burn — [Customer Name]
  Used [X] credits today ([Y]% of monthly allotment)
  Normal daily average: [Z] credits
  Action: [monitor / investigate / alert customer]

DAILY COST SUMMARY
  Total API spend:    $[X]
  Failed call waste:  $[Y]
  Net effective cost: $[Z]
  vs 7-day average:   $[W] ([+/-]%)

RECOMMENDATIONS
  1. [Action item if anomalies found]
  2. [Preventive measure]
```

## Automated Checks

The expense tracker (`apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts`) has built-in anomaly detection via `trackExpense()`. This command provides a higher-level analysis on top of that:

1. Cross-customer comparison (is one customer consuming disproportionately?)
2. Trend analysis (is cost trending up week-over-week?)
3. Failed call root cause analysis (what's causing the failures?)
4. Recommendations (fix the bug, adjust rate limits, alert customer)

## When to Run

- **Daily**: As part of the daily report routine
- **On-demand**: When a cost alert triggers or after deploying changes to API-calling code
- **Post-incident**: After any production issue that may have caused credit burn (e.g., the Feb 28 WebP incident that burned $8.60+)
