---
name: cost-tracker
description: >-
  API cost and expense tracking for SuperSeller AI. Covers trackExpense() calls, per-service
  cost rates, api_expenses table, anomaly detection, session cost tables in progress.md,
  and monthly budget tracking. MANDATORY per CLAUDE.md — every API generation must log cost.
  Use when logging costs, checking expenses, tracking API spend, or adding cost tracking
  to new services. Not for health monitoring (see monitoring-alerts), PayPal billing,
  or UI design.
  Example: "Add trackExpense() to the Kling API calls" or "Check today's API spend".
autoTrigger:
  - "cost"
  - "expense"
  - "trackExpense"
  - "api_expenses"
  - "cost tracking"
  - "API spend"
  - "budget"
  - "cost rate"
  - "generation cost"
  - "session cost"
negativeTrigger:
  - "health check"
  - "alert"
  - "PayPal billing"
  - "credits"
  - "UI design"
  - "video pipeline logic"
---

# API Cost & Expense Tracking

## Critical
- **MANDATORY per CLAUDE.md** — Every API generation MUST log its cost. No exceptions, every session, forever.
- **`trackExpense()` is the canonical function** — call after each Kling/Suno/Nano/Gemini/Resend API call.
- **Worker-side tracker implemented** at `apps/worker/src/services/expense-tracker.ts` (raw SQL, non-blocking).
- **Wired into video-pipeline.worker.ts** — tracks Gemini (floorplan, prompts, vision), Nano Banana (opening/closing), Kling (per-clip), Suno (music), R2 (final uploads).
- **Session cost tables** must be added to `progress.md` before closing any session.
- **Anomaly detection** flags days where spend >2x the rolling 7-day average.

## Cost Rates (February 2026)

| Service | Operation | Cost | Notes |
|---------|-----------|------|-------|
| Kie.ai | Kling 3.0 Pro clip (10s) | $0.10 | Hero rooms, transitions |
| Kie.ai | Kling 3.0 Std clip (5s) | $0.03 | Standard rooms |
| Kie.ai | Suno music | $0.06 | Per track (12 credits) |
| Kie.ai | Nano Banana composite | $0.02 | Realtor + photo merge (4 credits × $0.005) |
| Kie.ai | ElevenLabs TTS (turbo) | $0.02 | Per generation |
| Kie.ai | ElevenLabs TTS (multilingual) | $0.02 | Per generation |
| Kie.ai | Avatar Pro | $0.10 | Per avatar video |
| Kie.ai | Infinitalk | $0.08 | Per lip-sync video |
| FakeYou | TTS (any model) | $0.00 | Free, no API key |
| Gemini | Flash prompt | $0.001 | Per call |
| Gemini | Flash vision | $0.002 | Per image analysis |
| Resend | Email | $0.001 | Per email |
| R2 | Upload | $0.0001 | Per operation |
| R2 | Storage | $0.015/GB/mo | Monthly |
| PayPal | Transaction | 2.9% + $0.30 | Per payment (Stripe dormant, reserved for rensto.com) |
| Ollama | Embeddings | $0.00 | Self-hosted |

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts` | Web-side expense tracking (Prisma, 191 lines) |
| `apps/worker/src/services/expense-tracker.ts` | Worker-side expense tracking (raw SQL, non-blocking) |
| `apps/web/superseller-site/prisma/schema.prisma` | ApiExpense model definition |
| `apps/worker/src/queue/workers/video-pipeline.worker.ts` | trackExpense() wired into all API calls |
| `apps/worker/src/utils/retry.ts` | withRetry() — exponential backoff for external APIs |
| `apps/studio/src/lib/pipeline.ts` | Studio pipeline — needs cost tracking |

## trackExpense() API

```typescript
import { trackExpense } from '@/lib/monitoring/expense-tracker';

// After each API call:
await trackExpense({
  service: 'kie',           // 'kie' | 'gemini' | 'resend' | 'r2' | 'paypal' | 'ollama'
  operation: 'kling-pro',   // Specific operation name
  estimatedCost: 0.10,      // USD
  jobId: 'uuid',            // Optional: link to job
  userId: 'uuid',           // Optional: link to user
  metadata: { clipId: '...' } // Optional: extra context
});
```

## Database Table

```prisma
model ApiExpense {
  id            String   @id @default(cuid())
  service       String   // kie, gemini, resend, r2, paypal
  operation     String   // kling-pro, flash-prompt, email, upload
  estimatedCost Float    // USD
  jobId         String?  // Link to video job
  userId        String?  // Link to user
  metadata      Json?    // Extra context
  createdAt     DateTime @default(now())

  @@index([service])
  @@index([createdAt])
  @@index([userId])
  @@map("api_expenses")
}
```

## Query Functions

```typescript
// Get today's expenses by service
const daily = await getDailyExpenses(); // or getDailyExpenses(new Date('2026-02-23'))

// Get expense trend (last N days)
const trend = await getExpenseTrend(30); // [{date, service, total}]

// Get per-customer costs
const customerCosts = await getCustomerCosts(30); // [{userId, service, total}]

// Detect anomalies (>2x 7-day average)
const anomalies = await detectAnomalies(); // [{date, total, average, ratio}]

// Get total expenses for period
const total = await getTotalExpenses(30); // {total, byService: {kie: $X, gemini: $Y}}
```

## Session Cost Table Format (for progress.md)

```markdown
### Session Cost Tracking
| Operation | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| Kling 3.0 Pro (hero rooms) | 4 | $0.10 | $0.40 |
| Kling 3.0 Std (standard) | 8 | $0.03 | $0.24 |
| Suno music | 1 | $0.06 | $0.06 |
| Nano Banana composite | 4 | $0.05 | $0.20 |
| Gemini Flash vision | 12 | $0.002 | $0.024 |
| Gemini Flash prompt | 6 | $0.001 | $0.006 |
| **Session Total** | | | **$0.93** |
```

## Where trackExpense() Must Be Added

### VideoForge Worker (`video-pipeline.worker.ts`)
- After each Kling clip generation (pro or std)
- After Suno music generation
- After Nano Banana composite
- After each Gemini vision/prompt call
- After R2 uploads

### Winner Studio (`apps/studio/src/lib/pipeline.ts`)
- After avatar-pro task creation
- After infinitalk task creation
- After kling-3.0 task creation
- After audio isolation task
- After Gemini brain call

### FB Marketplace Bot
- After Gemini copy generation
- After Seedream image variation
- After ImageMagick overlay (free, $0.00)

### AgentForge
- After each Claude API call (Haiku/Sonnet)
- After web search calls

## Anomaly Detection

```typescript
// Runs daily — flags if today's spend > 2x rolling 7-day average
const anomalies = await detectAnomalies();
// Returns: [{ date, totalSpend, rollingAverage, ratio }]
// Alert if ratio > 2.0
```

## Monthly Budget Targets

| Service | Monthly Budget | Alert At |
|---------|---------------|----------|
| Kie.ai (total) | $50 | $40 (80%) |
| Gemini | $10 | $8 (80%) |
| Resend | $5 | $4 (80%) |
| R2 Storage | $2 | $1.50 (75%) |
| **Total** | **$70** | **$56** |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| No expenses logged | `trackExpense()` not called in pipeline | Add calls after each API operation |
| Anomaly false positive | One-time batch job spike | Check if it's a legitimate bulk operation |
| Cost rates outdated | API pricing changed | Update rates in `expense-tracker.ts` and this SKILL.md |
| api_expenses table empty | Never seeded / never called | Run a test video job with tracking enabled |
| Budget alert not firing | No budget alert logic implemented yet | Implement in `expense-tracker.ts` |

## References

- NotebookLM 02c3946b — AI Cost & Performance benchmarks, budgets
- `CLAUDE.md` — Generation Cost Tracking (MANDATORY) section
- `INFRA_SSOT.md` §5b — Cost rates table
- `progress.md` — Session cost tables (mandatory before closing)
