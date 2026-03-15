---
phase: 07-provider-foundation
plan: "02"
subsystem: api
tags: [fal, expense-tracker, input-validation, bullmq, vitest, tdd, ai-models, postgresql]

# Dependency graph
requires:
  - phase: 07-provider-foundation plan 01
    provides: router bug fix, DECISIONS.md entry for Veo 3.1 re-integration

provides:
  - fal provider cost rates in expense-tracker COST_RATES (Sora 2 + Wan 2.6 720p/1080p)
  - validateImageInput() function preventing WebP/unreachable URL credit burn
  - ai_models DB seeded with veo-3.1-fast/video, wan-2.6/video, sora-2/video rows

affects:
  - phase 08 (FalAdapter activation — will call validateImageInput before submitJob)
  - phase 09 (Observatory feedback loop — ai_models rows required)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD: RED (failing tests) -> GREEN (implementation) -> commit, per task"
    - "UnrecoverableError from bullmq for permanent failures (no retry semantics)"
    - "Fast-path extension check before network HEAD request to minimize cost"
    - "COST_RATES exported for direct test access (was unexported)"

key-files:
  created:
    - apps/worker/src/services/expense-tracker.test.ts
    - apps/worker/src/services/model-router/input-validator.ts
    - apps/worker/src/services/model-router/input-validator.test.ts
  modified:
    - apps/worker/src/services/expense-tracker.ts

key-decisions:
  - "COST_RATES exported (was const) to enable direct test access without mocking internals"
  - "validateImageInput lives outside FalAdapter — keeps adapter clean, callable from pipeline pre-submission"
  - "WebP rejected via URL extension before HEAD request — avoids network cost for obvious rejections"
  - "model_id discrepancy: SHOT_DEFAULT_MODELS uses 'veo-3.1' but DB has 'veo-3.1-fast/video' and 'veo-3.1/video' — Phase 08 must resolve"

patterns-established:
  - "Pattern 1: Input validation before provider submission — call validateImageInput() before any fal.ai submitJob()"
  - "Pattern 2: UnrecoverableError for format/reachability failures — prevents BullMQ retry loops"
  - "Pattern 3: COST_RATES keyed by provider then operation, exported for testability"

requirements-completed: [PROV-05, PROV-06, PROV-07]

# Metrics
duration: 4min
completed: "2026-03-15"
---

# Phase 07 Plan 02: Provider Foundation — Expense Rates, Input Validation, DB Seed Summary

**fal.ai cost rates added (Sora 2 + Wan 2.6 at verified March 2026 pricing), WebP/unreachable URL guard with UnrecoverableError, and ai_models seeded with 3 target rows**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T05:05:00Z
- **Completed:** 2026-03-15T05:08:38Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added fal COST_RATES block to expense-tracker with verified pricing: Sora 2 (720p $0.30/s, 1080p $0.50/s), Wan 2.6 (720p $0.10/s, 1080p $0.15/s)
- Created validateImageInput() that rejects WebP by URL extension (fast-path, no network) and by Content-Type, rejects unreachable URLs — all via UnrecoverableError to prevent BullMQ retries
- Seeded ai_models table: veo-3.1-fast/video ($0.40/5s), wan-2.6/video ($0.53/5s), sora-2/video ($0.075/5s) — all 3 rows verified in production DB

## Task Commits

Each task was committed atomically:

1. **Task 1: Add fal cost rates to expense-tracker with tests** - `3a3c649d` (feat)
2. **Task 2: Create input image validator with tests** - `f3672c4b` (feat)
3. **Task 3: Verify and run ai_models DB seed** - No code commit needed (server-side DB operation, seed script already committed)

_Note: TDD tasks had RED (failing tests first) -> GREEN (implementation) -> commit pattern_

## Files Created/Modified

- `/apps/worker/src/services/expense-tracker.ts` - Exported COST_RATES, added fal block with 4 rate entries
- `/apps/worker/src/services/expense-tracker.test.ts` - 6 tests covering fal rate values and trackExpense() lookup
- `/apps/worker/src/services/model-router/input-validator.ts` - validateImageInput() export with WebP fast-path + HEAD validation
- `/apps/worker/src/services/model-router/input-validator.test.ts` - 7 tests covering all rejection and pass-through cases

## Decisions Made

- Exported COST_RATES (was private const) — plan permitted this as alternative to mocking trackExpense internals
- validateImageInput placed outside FalAdapter — keeps adapter clean per CONTEXT.md decision, callable independently
- Server seed script synced from local (server had older version with `veo-3.1/video`, local had updated `veo-3.1-fast/video`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Server seed script out of sync with local version**
- **Found during:** Task 3 (Verify and run ai_models DB seed)
- **Issue:** Server had older seed with `model_id: "veo-3.1/video"` while local had `model_id: "veo-3.1-fast/video"`. DB query for `veo-3.1-fast/video` returned 0 rows after seed ran.
- **Fix:** rsync'd updated seed script from local to server, then re-ran. Both `veo-3.1/video` (pre-existing) and `veo-3.1-fast/video` (newly seeded) now exist in DB.
- **Files modified:** `tools/model-observatory/seed-initial-models.mjs` (server-side sync only, file already committed)
- **Verification:** `SELECT count(*) FROM ai_models WHERE model_id IN ('veo-3.1-fast/video', 'wan-2.6/video', 'sora-2/video')` returns 3
- **Committed in:** Pre-existing commit (seed file already tracked, only server copy was stale)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential to complete Task 3. No scope creep.

## Issues Encountered

- Pre-existing test failure in `src/services/onboarding/module-router.test.ts` (1 test) confirmed pre-existing before these changes via git stash verification. Out of scope per deviation rules — logged to deferred-items.

## Model ID Discrepancy (Phase 08 Action Required)

SHOT_DEFAULT_MODELS in `shot-types.ts` references `veo-3.1` (no `/video` suffix, no `-fast`). DB now has both `veo-3.1/video` and `veo-3.1-fast/video`. Phase 08 must align SHOT_DEFAULT_MODELS to use `veo-3.1-fast/video` (the seeded, active row) or add a lookup alias.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- expense-tracker has fal rates — fal expenses will no longer log $0
- validateImageInput() ready for Phase 08 to call before FalAdapter.submitJob()
- ai_models has all 3 target rows — Observatory can recommend fal.ai models
- Phase 08 blocker: resolve SHOT_DEFAULT_MODELS `veo-3.1` vs DB `veo-3.1-fast/video` model_id mismatch before enabling live traffic

## Self-Check: PASSED

- expense-tracker.test.ts: FOUND
- input-validator.ts: FOUND
- input-validator.test.ts: FOUND
- SUMMARY.md: FOUND
- Commit 3a3c649d (expense-tracker): FOUND
- Commit f3672c4b (input-validator): FOUND
- fal block in expense-tracker: FOUND
- DB rows (3/3): VERIFIED via production query

---
*Phase: 07-provider-foundation*
*Completed: 2026-03-15*
