---
name: Cost Report
description: Generate daily or weekly API cost reports from the api_expenses table
---

# Cost Report

Generate cost reports for API usage across all SuperSeller AI services. Data sourced from the `api_expenses` PostgreSQL table via `trackExpense()`.

## Usage

```
/cost-report today       — Today's costs
/cost-report week        — Last 7 days
/cost-report month       — Last 30 days
/cost-report session     — Current session only
```

## Rate Table (Canonical)

| Service | Model / Tier | Cost per Call | Notes |
|---------|-------------|---------------|-------|
| Kie.ai | Kling 3.0 Pro | $0.10 | AI video clips |
| Kie.ai | Kling 3.0 Standard | $0.03 | AI video clips (lower quality) |
| Kie.ai | Suno | $0.06 | Music generation |
| Kie.ai | Nano Banana Pro | $0.09 | Image upscaling |
| Kie.ai | Recraft | $0.04 | Image generation |
| Google | Gemini | $0.001 | Text/vision analysis |
| Anthropic | Claude | varies | Per-token pricing |
| Remotion | Photo composition | $0.00 | Self-hosted, zero marginal cost |
| FFmpeg | Video processing | $0.00 | Self-hosted utility |

## SQL Queries

### Daily Summary
```sql
SELECT
  service,
  model,
  COUNT(*) as calls,
  ROUND(SUM(cost)::numeric, 2) as total_cost,
  ROUND(AVG(cost)::numeric, 4) as avg_cost
FROM api_expenses
WHERE created_at >= CURRENT_DATE
GROUP BY service, model
ORDER BY total_cost DESC;
```

### Weekly Summary with Daily Breakdown
```sql
SELECT
  DATE(created_at) as day,
  service,
  COUNT(*) as calls,
  ROUND(SUM(cost)::numeric, 2) as total_cost
FROM api_expenses
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), service
ORDER BY day DESC, total_cost DESC;
```

### Monthly Total
```sql
SELECT
  ROUND(SUM(cost)::numeric, 2) as monthly_total,
  COUNT(*) as total_calls
FROM api_expenses
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

### Anomaly Detection
```sql
-- Find days where spending exceeded 2x the daily average
WITH daily_costs AS (
  SELECT DATE(created_at) as day, SUM(cost) as daily_total
  FROM api_expenses
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
),
avg_cost AS (
  SELECT AVG(daily_total) as avg_daily FROM daily_costs
)
SELECT dc.day, ROUND(dc.daily_total::numeric, 2) as spent,
       ROUND(ac.avg_daily::numeric, 2) as average
FROM daily_costs dc, avg_cost ac
WHERE dc.daily_total > ac.avg_daily * 2
ORDER BY dc.day DESC;
```

## Output Format

```
COST REPORT — [period]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| Service       | Calls | Cost    |
|---------------|-------|---------|
| Kling Pro     | 12    | $1.20   |
| Suno          | 4     | $0.24   |
| Nano Banana   | 8     | $0.72   |
| Gemini        | 45    | $0.05   |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: $2.21 (69 API calls)

Budget: $10/day | Used: 22.1%
Anomalies: None detected
```

## Expense Tracker Location

- **Web**: `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts`
- **Worker**: `apps/worker/src/services/credits.ts`
- **Rule**: MANDATORY `trackExpense()` after EVERY API call that costs money. No exceptions.

## Session Cost Table (for progress.md)

When closing a session, add this to `progress.md`:

```
| Operation | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| Kling Pro clips | 3 | $0.10 | $0.30 |
| Suno music | 1 | $0.06 | $0.06 |
| **Session Total** | | | **$0.36** |
```
