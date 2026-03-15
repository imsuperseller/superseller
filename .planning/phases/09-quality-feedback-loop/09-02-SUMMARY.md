---
phase: 09-quality-feedback-loop
plan: 02
subsystem: database
tags: [bullmq, scheduler, postgres, aggregation, observatory, quality-score]

# Dependency graph
requires:
  - phase: 09-01
    provides: performance_score column on content_entries, generation_meta JSONB with model_id written by performance-tracker

provides:
  - Nightly BullMQ-style setInterval job that aggregates avg(performance_score) per model from content_entries
  - Observatory quality_score updates for models with >= 20 samples (MIN_SAMPLES gate)
  - Quality aggregation registered in scheduler as job #8 with DAY interval and 4-hour initial delay

affects: [09-03, model-selector, observatory, routing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dynamic import() inside scheduleJob callback (consistent with all 7 existing jobs)
    - MIN_SAMPLES = 20 guard before DB write (tunable constant, documented in STATE.md)
    - Defense-in-depth try/catch inside job function (scheduler also catches, belt+suspenders)

key-files:
  created:
    - apps/worker/src/jobs/quality-aggregation.ts
  modified:
    - apps/worker/src/services/scheduler.ts

key-decisions:
  - "MIN_SAMPLES = 20 prevents noise from small samples corrupting Observatory quality_score; below threshold models retain static seed scores"
  - "setInterval at DAY with 4-hour initial delay chosen over cron-at-03:00 UTC — acceptable for v1.1 (CONTEXT.md noted this as nice-to-have)"
  - "No change to model-selector.ts or router.ts needed — existing 5-minute cache on getRecommendedModel() automatically picks up updated quality_score values (QUAL-06 satisfied passively)"

patterns-established:
  - "Job modules live in apps/worker/src/jobs/, imported dynamically by scheduler"
  - "Aggregation queries use rolling 90-day window to prevent stale data from dragging scores"

requirements-completed: [QUAL-02, QUAL-03, QUAL-06]

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 09 Plan 02: Quality Aggregation Job Summary

**Nightly setInterval job aggregates avg(performance_score) per model from content_entries and writes quality_score to ai_model_recommendations, closing the Observatory self-improvement feedback loop**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-15T07:51:07Z
- **Completed:** 2026-03-15T07:53:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `apps/worker/src/jobs/quality-aggregation.ts` with `runQualityAggregation()` — queries content_entries over 90-day rolling window, skips models with < 20 samples, updates ai_model_recommendations.quality_score for qualifying models
- Registered job in scheduler as the 8th job with DAY interval and 4-hour initial delay (staggered from RAG at 1h, health-cleanup at 2h)
- Observatory feedback loop is now closed: performance-tracker (Plan 01) writes scores, aggregation job (Plan 02) propagates them to routing weights, model-selector cache picks them up automatically

## Task Commits

Each task was committed atomically:

1. **Task 1: Create quality aggregation job module** - `1c91063e` (feat)
2. **Task 2: Register nightly aggregation in scheduler** - `ca0b6d96` (feat)

## Files Created/Modified

- `apps/worker/src/jobs/quality-aggregation.ts` - Aggregation job with MIN_SAMPLES gate, 90-day window query, quality_score update
- `apps/worker/src/services/scheduler.ts` - Added quality-aggregation as job #8, job count updated to 8

## Decisions Made

- MIN_SAMPLES = 20 gate: prevents noise from small sample sets corrupting Observatory scores; models below threshold keep their static seed scores until sufficient production data accumulates
- 4-hour initial delay chosen for staggering — RAG runs at 1h, health-cleanup at 2h, system-cleanup at 3h, quality-aggregation at 4h
- No model-selector or router changes required — the existing 5-minute in-memory cache on `getRecommendedModel()` auto-refreshes after the nightly DB write (QUAL-06 satisfied with zero additional code)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The job runs automatically once the worker restarts.

## Next Phase Readiness

- Phase 09 is now feature-complete: performance tracking (Plan 01) + aggregation (Plan 02) together form the full quality feedback loop
- Phase 10 can proceed independently (marked as parallel-safe in ROADMAP.md)
- No blockers

---
*Phase: 09-quality-feedback-loop*
*Completed: 2026-03-15*
