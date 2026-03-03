---
name: Cost Rates
description: API cost rates for all AI services, mandatory expense tracking rules, and anomaly detection
---

# API Cost Rates

Canonical cost rates for all external AI API calls made by SuperSeller AI. These rates must be tracked via `trackExpense()` after every generation call.

## Rate Table

| Service | Model/Tier | Cost per Call | Notes |
|---------|-----------|---------------|-------|
| **Kling (Kie.ai)** | Kling 3.0 Pro | $0.10 | High-quality video clips, 5-10s |
| **Kling (Kie.ai)** | Kling 3.0 Standard | $0.03 | Standard quality video clips |
| **Suno** | Music generation | $0.06 | Background music for videos |
| **Nano Banana** | nano-banana-pro | $0.09 | Image generation (NOT nano-banana-2, which fails) |
| **Gemini** | Gemini Flash | $0.001 | Text generation, analysis, content |
| **Recraft** | Image generation | $0.04 | Alternative image generation |
| **Seedream** | Seedream 5 Lite | $0.02 | Budget image generation |
| **Remotion** | Photo composition | $0.00 | Free — runs locally on RackNerd |
| **Claude** | Content generation | ~$0.01 | Via Anthropic API for SocialHub content |

## Mandatory Expense Tracking

**EVERY API generation call MUST log its cost. No exceptions.**

### In Automated Pipelines

Call `trackExpense()` immediately after each API call:

```typescript
import { trackExpense } from '@/lib/monitoring/expense-tracker';

// After Kling API call
await trackExpense({
  operation: 'kling_pro',
  cost: 0.10,
  userId: job.userId,
  jobId: job.id,
  metadata: { model: 'kling-3.0', quality: 'pro' }
});
```

### In Manual/Ad-Hoc Sessions

Add a cost table to the session's progress entry before closing:

```markdown
| Operation | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| Kling Pro | 3 | $0.10 | $0.30 |
| Nano Banana | 2 | $0.09 | $0.18 |
| **Session Total** | | | **$0.48** |
```

## Expense Tracker

**File**: `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts`

Features:
- `trackExpense()` — Log individual API costs
- Anomaly detection — Flags spend > 2x the rolling average
- Per-customer cost attribution
- Daily/weekly/monthly aggregation

## Cost Optimization Rules

1. **Prefer Kling Standard over Pro** unless customer specifically needs high quality
2. **Use Remotion for photo compositions** — zero cost vs $0.10+ per Kling clip
3. **Batch operations** where possible to reduce per-call overhead
4. **Cache results** — never regenerate content that was already created
5. **Validate inputs BEFORE calling APIs** — the Feb 28 WebP incident burned $8.60+ on failed Kling calls because WebP images were sent instead of JPG/PNG

## Budget Guardrails

| Metric | Threshold | Action |
|--------|-----------|--------|
| Daily API spend | > $50 | Alert — review what's running |
| Single customer daily spend | > $20 | Alert — possible runaway job |
| Failed API call rate | > 10% | Halt — fix the root cause before continuing |
| Monthly total API spend | > $500 | Review — check if revenue justifies costs |

## Incident History

- **Feb 28, 2026**: WebP format sent to Kling API, causing 422 errors. Five test jobs burned $8.60+ before the issue was caught. Root cause: missing image format conversion. Prevention: Pre-deploy trace rule now mandatory.
- **Feb 27, 2026**: nano-banana-2 model returns "Models task execute failed" on Kie.ai. Reverted to nano-banana-pro. Cost per failed call: $0.09 wasted.

## Model Observatory Integration

The Model Observatory (34 models in `ai_models` table) tracks model availability and pricing. The runtime selector (`apps/worker/src/services/model-selector.ts`) queries the observatory with a 5-minute cache and falls back to hardcoded values.

Current gap: Kling clip generation still hardcodes `kling-3.0/video` and is not yet wired to the observatory for dynamic model selection.
