---
phase: 15-tech-debt-fixes
plan: "02"
subsystem: api
tags: [expense-tracking, cost-attribution, provider-normalization, fal, kie, backfill]

# Dependency graph
requires: []
provides:
  - PROVIDER_LABELS normalization map in expense-tracker.ts
  - normalizeProvider() function for all expense tracking callers
  - Fixed character-video-gen.ts: trackExpense uses actual provider from model router
  - Backfill script to correct historical misattributed api_expenses rows
affects:
  - Phase 16 (budget gates rely on correct provider labels in api_expenses)
  - Phase 17 (regen webhooks will track fal costs correctly)
  - Phase 18 (per-customer spend reports need accurate provider data)
  - Phase 19 (admin cost dashboard reads from api_expenses)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Provider normalization via PROVIDER_LABELS map — all expense callers must use normalizeProvider(raw) before passing service to trackExpense"
    - "generateScene returns { resultUrl, provider } tuple so caller can attribute cost to actual provider"
    - "Backfill scripts live in apps/worker/src/scripts/ and are idempotent"

key-files:
  created:
    - apps/worker/src/scripts/backfill-expense-providers.ts
  modified:
    - apps/worker/src/services/expense-tracker.ts
    - apps/worker/src/services/onboarding/modules/character-video-gen.ts

key-decisions:
  - "normalizeProvider() exported from expense-tracker.ts (not a separate util) so callers only need one import"
  - "generateScene return type widened to { resultUrl, provider } — provider stored in metadata for audit trail"
  - "Backfill uses PipelineRun.modelUsed and metadata.provider for attribution — not guessing from timestamps"

patterns-established:
  - "Provider attribution pattern: always use normalizeProvider(jobResult.provider) when calling trackExpense after model-router jobs"
  - "Backfill idempotency: UPDATE WHERE service = 'kie.ai' is safe to run multiple times (already-normalized rows are unaffected)"

requirements-completed: [DEBT-02]

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 15 Plan 02: Cost Tracking Provider Attribution Fix Summary

**Dynamic provider attribution in api_expenses via PROVIDER_LABELS normalization map — fal.ai costs no longer misattributed to kie**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-15T20:00:00Z
- **Completed:** 2026-03-15T20:08:00Z
- **Tasks:** 2
- **Files modified:** 3 (2 modified, 1 created)

## Accomplishments
- Replaced hardcoded `service: "kie.ai"` in character-video-gen with dynamic `normalizeProvider(sceneOutput.provider)` — fal.ai jobs now tracked under "fal", kie.ai jobs under "kie"
- Added `PROVIDER_LABELS` map and `normalizeProvider()` to expense-tracker.ts — all callers have a single normalization entry point
- Created backfill script that normalizes legacy "kie.ai" rows to "kie" and re-attributes sora-2-pro rows to "fal" using PipelineRun.modelUsed + metadata.provider hints

## Task Commits

Each task was committed atomically:

1. **Task 1: Add provider normalization map and fix character-video-gen attribution** - `48d20112` (feat)
2. **Task 2: Create backfill migration script for misattributed api_expenses rows** - `ed4295ed` (feat)

## Files Created/Modified
- `apps/worker/src/services/expense-tracker.ts` - Added PROVIDER_LABELS constant and normalizeProvider() export after COST_RATES
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` - Updated generateScene return type, fixed trackExpense to use actual provider
- `apps/worker/src/scripts/backfill-expense-providers.ts` - New idempotent backfill script for historical misattributed rows

## Decisions Made
- `normalizeProvider()` lives in expense-tracker.ts (not a standalone util) — callers only need one import path
- `generateScene()` return type widened to `{ resultUrl: string; provider: string }` rather than storing provider in a closure — keeps the data collocated with the result
- Provider stored in metadata field of api_expenses for audit trail even after normalization

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript passed clean on both tasks.

## User Setup Required

To fix existing historical rows in production:

```bash
npx tsx apps/worker/src/scripts/backfill-expense-providers.ts
```

Run from the worker directory with DATABASE_URL set. Script is idempotent — safe to run multiple times.

## Next Phase Readiness
- PROVIDER_LABELS and normalizeProvider() are ready for use in Phase 16 budget gate logic
- api_expenses will have accurate provider labels after backfill is run
- No blockers for Phase 16+

---
*Phase: 15-tech-debt-fixes*
*Completed: 2026-03-15*
