---
phase: 07-provider-foundation
plan: 01
subsystem: api
tags: [model-router, provider-adapter, fal-ai, kie-ai, vitest, observatory]

# Dependency graph
requires: []
provides:
  - Provider adapter selection based on Observatory modelId prefix (fal-ai/ -> FalAdapter, else KieAdapter)
  - DECISIONS.md entry #24 documenting Veo 3.1 re-integration rationale
affects:
  - 07-02 (subsequent provider foundation plans)
  - 08-provider-activation (fal adapter now correctly called in production)
  - 09-observatory-feedback (quality scoring will now see actual fal adapter usage)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Provider inference from modelId prefix: modelId.startsWith('fal-ai/') determines adapter, not static SHOT_DEFAULT_MODELS"

key-files:
  created: []
  modified:
    - apps/worker/src/services/model-router/router.ts
    - apps/worker/src/services/model-router/router.test.ts
    - DECISIONS.md

key-decisions:
  - "Infer provider adapter from modelId prefix, not SHOT_DEFAULT_MODELS.provider field"
  - "Veo 3.1 re-integrated for dialogue shots via Kie.ai /api/v1/veo/generate (PROV-08)"

patterns-established:
  - "modelId prefix pattern: all fal.ai models use 'fal-ai/' prefix as discriminant for routing"

requirements-completed: [PROV-08, PROV-03]

# Metrics
duration: 10min
completed: 2026-03-15
---

# Phase 07 Plan 01: Provider Foundation — Router Fix Summary

**Router bug fixed: provider adapter now inferred from Observatory-recommended modelId prefix (fal-ai/) instead of static SHOT_DEFAULT_MODELS, with DECISIONS.md #24 documenting Veo 3.1 re-integration**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-15T05:00:00Z
- **Completed:** 2026-03-15T05:06:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Fixed router bug where FalAdapter was never selected even when Observatory recommended fal.ai models
- Added 3 new test cases covering Observatory fal->FalAdapter, Observatory kie->KieAdapter, and budget override with fal default
- Documented Veo 3.1 re-integration decision reversing the Feb 2026 Kling-only mandate

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix router provider inference and add test coverage** - `3437b9f8` (fix)
2. **Task 2: Append DECISIONS.md entry for Veo 3.1 re-integration** - `00fa82d9` (docs)

## Files Created/Modified

- `apps/worker/src/services/model-router/router.ts` - Replaced `defaultHint.provider` with `selection.modelId.startsWith('fal-ai/')` inference
- `apps/worker/src/services/model-router/router.test.ts` - Added 3 provider inference test cases; all 10 tests passing
- `DECISIONS.md` - Appended entry #24: VEO 3.1 RE-INTEGRATION with PROV-08 reference

## Decisions Made

- Provider adapter selection now driven by modelId prefix, not a separate `provider` field. This ensures Observatory recommendations fully control routing end-to-end.
- Veo 3.1 returns to production via Kie.ai endpoint (not a new provider). Budget ceilings and Observatory quality scoring provide the safety rails that were missing in Feb 2026.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The existing test suite already had two tests that implicitly validated the behavior (dialogue/KieAdapter and social/FalAdapter). After the fix, all 7 existing tests continued to pass, confirming the change was backward-compatible with correct test expectations.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Router is now correctness-complete: FalAdapter will receive production traffic when Observatory recommends fal-ai/ models
- DECISIONS.md entry #24 satisfies the prerequisite for Phase 08 Veo 3.1 code changes
- Phase 08 can proceed: fal.ai billing-on-failure test job recommended before enabling production tenant traffic

## Self-Check: PASSED

- router.ts: FOUND
- router.test.ts: FOUND
- DECISIONS.md: FOUND
- 07-01-SUMMARY.md: FOUND
- Commit 3437b9f8: FOUND
- Commit 00fa82d9: FOUND

---
*Phase: 07-provider-foundation*
*Completed: 2026-03-15*
