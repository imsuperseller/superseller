---
phase: 08-provider-activation
plan: 02
subsystem: api
tags: [kie.ai, veo, video-generation, model-router, adapter-pattern, tdd]

# Dependency graph
requires:
  - phase: 08-01
    provides: FalAdapter with model-specific bodies and webhook endpoint
  - phase: 07-02
    provides: DB seed with veo-3.1-fast/video ai_models row

provides:
  - KieAdapter Veo 3.1 branch routing modelId containing 'veo' to createVeoTask
  - 'veo::' prefix encoding for pollStatus routing disambiguation
  - SHOT_DEFAULT_MODELS aligned with real DB and API model IDs
  - Router inference updated to recognize 'wan/' prefix as fal.ai model

affects: [09-observatory-feedback, 10-pipeline-integration, any code that reads SHOT_DEFAULT_MODELS]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prefix encoding for job ID routing: 'veo::taskId' disambiguates Veo vs Kling in pollStatus without DB lookup"
    - "Router fal.ai inference: modelId.startsWith('fal-ai/') || modelId.startsWith('wan/') covers all fal.ai models"

key-files:
  created: []
  modified:
    - apps/worker/src/services/model-router/provider-adapters/kie-adapter.ts
    - apps/worker/src/services/model-router/provider-adapters/adapters.test.ts
    - apps/worker/src/services/model-router/shot-types.ts
    - apps/worker/src/services/model-router/shot-types.test.ts
    - apps/worker/src/services/model-router/router.ts
    - apps/worker/src/services/model-router/router.test.ts

key-decisions:
  - "'veo::' prefix on externalJobId is the routing key — pollStatus checks jobId.startsWith('veo::') to select getVeoTaskStatus vs getTaskStatus('kling')"
  - "SHOT_DEFAULT_MODELS.dialogue.modelId corrected from 'veo-3.1' to 'veo-3.1-fast/video' to match Phase 07 DB seed row"
  - "SHOT_DEFAULT_MODELS.social.modelId corrected from 'fal-ai/wan-i2v' to 'wan/v2.6/image-to-video' (real fal.ai API path)"
  - "Router provider inference extended: 'wan/' prefix treated as fal.ai (Wan 2.6 is a fal.ai queued model despite different path prefix)"

patterns-established:
  - "KieAdapter prefix routing: check jobId prefix in pollStatus to branch between API clients without DB schema changes"
  - "Model ID alignment: SHOT_DEFAULT_MODELS must exactly match DB ai_models.model_id — enforced by test assertions in adapters.test.ts"

requirements-completed: [PROV-04]

# Metrics
duration: 12min
completed: 2026-03-15
---

# Phase 08 Plan 02: KieAdapter Veo 3.1 Branch Summary

**KieAdapter routes 'veo' model IDs to createVeoTask/getVeoTaskStatus via 'veo::' prefix encoding, with all SHOT_DEFAULT_MODELS model IDs corrected to match DB and real fal.ai API paths**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-15T00:49:00Z
- **Completed:** 2026-03-15T00:51:20Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments

- Added Veo 3.1 branch to KieAdapter: `_submitVeoJob` calls `createVeoTask` with mode=fast, aspect_ratio=16:9, sound=false
- Added `pollStatus` Veo branch: jobId starting `veo::` routes to `getVeoTaskStatus`, stripping prefix before call
- Fixed `SHOT_DEFAULT_MODELS.dialogue.modelId` from `veo-3.1` to `veo-3.1-fast/video` (DB alignment)
- Fixed `environment` and `social` model IDs to real fal.ai API endpoint paths
- Updated router provider inference to handle `wan/` prefix as fal.ai
- All 80 model-router tests pass (48 adapter tests, 15 shot-types tests, 10 router tests, 7 input-validator tests)

## Task Commits

1. **Task 1: KieAdapter Veo 3.1 branch + model ID fix** - `39085d30` (feat)

## Files Created/Modified

- `apps/worker/src/services/model-router/provider-adapters/kie-adapter.ts` - Added Veo branch in _submitVideoJob, _submitVeoJob method, Veo branch in pollStatus
- `apps/worker/src/services/model-router/provider-adapters/adapters.test.ts` - Added createVeoTask/getVeoTaskStatus mocks, submitJob(veo) tests, pollStatus(veo) tests, SHOT_DEFAULT_MODELS assertions
- `apps/worker/src/services/model-router/shot-types.ts` - Fixed dialogue/environment/social modelIds to match DB and real API paths
- `apps/worker/src/services/model-router/shot-types.test.ts` - Updated stale expected values to match corrected model IDs
- `apps/worker/src/services/model-router/router.ts` - Extended fal.ai inference to recognize 'wan/' prefix
- `apps/worker/src/services/model-router/router.test.ts` - Updated comments to reflect new model IDs

## Decisions Made

- Used `veo::` prefix encoding (not a DB column) for Veo/Kling disambiguation in pollStatus — avoids schema changes and is consistent with FalAdapter's `modelId::requestId` pattern from 08-01
- `_submitVeoJob` defaults to `mode: 'fast'` and `sound: false` to match `veo-3.1-fast/video` model capabilities
- Router updated to recognize `wan/` prefix as fal.ai — Wan 2.6 is queued via fal.ai but uses a non-`fal-ai/` path prefix

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing shot-types.test.ts had stale expected model IDs**
- **Found during:** Task 1 (GREEN phase — running full model-router suite)
- **Issue:** `shot-types.test.ts` expected old model IDs (`veo-3.1`, `fal-ai/sora`, `fal-ai/wan-i2v`) which were the values we were correcting
- **Fix:** Updated three test assertions to match corrected model IDs
- **Files modified:** `apps/worker/src/services/model-router/shot-types.test.ts`
- **Verification:** All 15 shot-types tests pass
- **Committed in:** 39085d30 (Task 1 commit)

**2. [Rule 1 - Bug] Router provider inference broke for 'wan/v2.6/image-to-video' model ID**
- **Found during:** Task 1 (GREEN phase — running full model-router suite)
- **Issue:** Router inferred provider from `fal-ai/` prefix only; `wan/v2.6/image-to-video` doesn't start with `fal-ai/` so `social` shots were incorrectly routed to KieAdapter
- **Fix:** Extended router inference: `modelId.startsWith('fal-ai/') || modelId.startsWith('wan/')` — Wan 2.6 is a fal.ai queued model
- **Files modified:** `apps/worker/src/services/model-router/router.ts`, `apps/worker/src/services/model-router/router.test.ts`
- **Verification:** Budget override fal inference test passes, all 10 router tests pass
- **Committed in:** 39085d30 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2x Rule 1 - Bug)
**Impact on plan:** Both auto-fixes necessary for correctness. The model ID corrections would have broken routing without these cascading fixes. No scope creep.

## Issues Encountered

- Pre-existing `onboarding/module-router.test.ts` failure (1 test) confirmed pre-existing via git stash verification — not caused by our changes, logged as out-of-scope

## Next Phase Readiness

- KieAdapter fully routes Veo 3.1 dialogue shots end-to-end
- FalAdapter (08-01) + KieAdapter (08-02) both complete — provider layer activation done
- SHOT_DEFAULT_MODELS model IDs now match DB rows and real API paths
- Ready for Phase 09: Observatory feedback loop (real generation data flows in)

---
*Phase: 08-provider-activation*
*Completed: 2026-03-15*
