---
name: Cost Tracking
description: Mandatory expense tracking for every API call, rate tables, anomaly detection, and session cost reporting
---

# Cost Tracking

Every API generation MUST log its cost. No exceptions, every session, forever.

## The Rule

After EVERY API call that costs money, call `trackExpense()`. This is mandatory in:
- **Automated pipelines** (video-pipeline.worker.ts, remotion.worker.ts)
- **Manual/ad-hoc sessions** (cost table in progress.md before closing)
- **Test runs** (yes, tests burn real credits too)

## Expense Tracker Location

| Context | File | Function |
|---------|------|----------|
| Web app | `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts` | `trackExpense()` |
| Worker | `apps/worker/src/services/credits.ts` | `trackExpense()` |

### trackExpense() Signature
```typescript
trackExpense({
  service: string,      // 'kieai', 'google', 'anthropic'
  model: string,        // 'kling-3.0-pro', 'suno', 'nano-banana-pro'
  operation: string,    // 'video-clip', 'music-gen', 'upscale'
  cost: number,         // Dollar amount
  jobId?: string,       // BullMQ job ID if applicable
  metadata?: object     // Additional context
})
```

## Rate Table (Canonical — March 2026)

| Service | Model | Cost/Call | Category |
|---------|-------|-----------|----------|
| Kie.ai | Kling 3.0 Pro | $0.10 | Video generation |
| Kie.ai | Kling 3.0 Standard | $0.03 | Video generation |
| Kie.ai | Suno | $0.06 | Music generation |
| Kie.ai | Nano Banana Pro | $0.09 | Image upscaling |
| Kie.ai | Recraft | $0.04 | Image generation |
| Google | Gemini 2.0 Flash | $0.001 | Text/vision |
| Anthropic | Claude 3.5 Sonnet | ~$0.003-0.015 | Text (per 1K tokens) |
| Self-hosted | Remotion | $0.00 | Photo composition |
| Self-hosted | FFmpeg | $0.00 | Video processing |
| Self-hosted | Ollama | $0.00 | Local embeddings |

## Anomaly Detection

The system flags anomalies when:

1. **Daily spend >2x average** — Query checks rolling 30-day average
2. **Single job cost >$2.00** — Typical TourReel video is $1-3, anything above $5 is suspicious
3. **Rapid fire calls** — >10 calls to same API in 5 minutes without a job ID
4. **Unknown service/model** — Any trackExpense call with unrecognized service name

### Anomaly Query
```sql
SELECT
  DATE(created_at) as day,
  service,
  model,
  COUNT(*) as calls,
  ROUND(SUM(cost)::numeric, 2) as total
FROM api_expenses
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY DATE(created_at), service, model
HAVING SUM(cost) > 2.00
ORDER BY total DESC;
```

## Session Cost Table Format

Before closing any session that made API calls, add to `progress.md`:

```markdown
### Session Cost — [date]
| Operation | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| Kling Pro clips | 5 | $0.10 | $0.50 |
| Suno music | 1 | $0.06 | $0.06 |
| Nano Banana upscale | 3 | $0.09 | $0.27 |
| Gemini analysis | 12 | $0.001 | $0.01 |
| **Session Total** | | | **$0.84** |
```

## Budget Guidelines

| Period | Soft Limit | Hard Limit | Action at Hard |
|--------|-----------|------------|----------------|
| Daily | $10 | $25 | Pause non-essential jobs |
| Weekly | $50 | $100 | Review with user |
| Monthly | $200 | $400 | Halt all generation, audit |

## Pre-Deploy Credit Check

Before deploying changes that touch API-calling code paths:
1. Identify all API calls in the changed code
2. Estimate cost per execution
3. Calculate worst-case cost (if job runs N times)
4. **If estimated cost >$1 per run, confirm with user before deploying**

Origin: Feb 28, 2026 — five test jobs ($8.60+) burned debugging a WebP-to-Kling 422 error that a pre-deploy trace would have caught.
