---
phase: 04-character-video-gen-delivery
plan: 01
subsystem: api
tags: [sora-2, kie.ai, model-router, onboarding-module, video-generation, r2, pipeline-run]

# Dependency graph
requires:
  - phase: 03-character-questionnaire
    provides: CharacterBible DB row with scenario_prompts in metadata
  - phase: 03.1-multi-model-best-shot-routing
    provides: routeShot() + KieAdapter + FalAdapter for model-routed generation
provides:
  - character-video-gen OnboardingModule (5-scene Sora 2 Pro generation)
  - Module registered in MODULE_REGISTRY (priority 3, after character-questionnaire)
  - character-video-gen added to ModuleType union
  - Background async pipeline: CharacterBible fetch -> prompt build -> routeShot -> poll -> R2 upload
affects: [04-02-remotion-composition, 04-03-delivery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - setImmediate fire-and-forget for long-running WhatsApp module pipelines
    - Parallel Promise.all scene generation with individual per-scene retry (1 retry each)
    - Partial success tolerance — 3+ of 5 scenes = proceed, fewer = PipelineRun failed + module reset to intro
    - routeShot() wraps model selection; adapter.submitJob/pollStatus for provider-agnostic generation

key-files:
  created:
    - apps/worker/src/services/onboarding/modules/character-video-gen.ts
  modified:
    - apps/worker/src/services/onboarding/modules/types.ts
    - apps/worker/src/services/onboarding/module-router.ts

key-decisions:
  - "Import path for db/client from modules/ subdirectory is ../../../db/client (3 levels up)"
  - "Background generation via setImmediate — WhatsApp handler returns immediately, pipeline runs async"
  - "Partial success: 3+ scenes = proceed to awaiting-composition; fewer = PipelineRun failed, module reset to intro for retry"
  - "routeShot() used for model selection — narrative shot type routes to fal adapter by default (observatory may override)"

patterns-established:
  - "character-video-gen module: intro -> generating (async bg pipeline) -> awaiting-composition -> complete"
  - "runGenerationPipeline() is a standalone async function called via setImmediate from handleMessage"
  - "All scene R2 keys follow: character-videos/{tenantId}/scene-{i}.mp4"

requirements-completed: [CHAR-05, CHAR-06, CHAR-10]

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 04 Plan 01: Character Video Gen Module Summary

**Sora 2 Pro 5-scene generation OnboardingModule with routeShot() routing, parallel submission, R2 upload, and partial-failure tolerance**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T02:17:44Z
- **Completed:** 2026-03-15T02:20:22Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Created `character-video-gen.ts` (522 lines) implementing OnboardingModule with full 5-scene Sora 2 Pro generation pipeline
- Registered module in MODULE_REGISTRY at priority 3 (between character-questionnaire and social-setup) with VideoForge/WinnerStudio/CIAB triggers
- Wired cost tracking (trackExpense per scene + updatePipelineRun with total costCents) and TenantAsset registration via uploadToR2 assetInfo

## Task Commits

1. **Task 1: Character video generation module with Sora 2 integration** - `e402a498` (feat)

## Files Created/Modified

- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` - OnboardingModule: state machine (intro/generating/awaiting-composition/complete), 5-scene prompt builder, parallel routeShot() submission, 15s poll loop, /tmp download, R2 upload, PipelineRun lifecycle
- `apps/worker/src/services/onboarding/modules/types.ts` - Added "character-video-gen" to ModuleType union
- `apps/worker/src/services/onboarding/module-router.ts` - Registered character-video-gen entry + INTRO_MESSAGES fallback

## Decisions Made

- Used `../../../db/client` import path (not `../../db/client`) — modules/ subdirectory is 3 levels from src/db/
- Background generation via `setImmediate` — WhatsApp message handler returns immediately; pipeline runs fully async
- Partial success tolerance: 3+ of 5 scenes = proceed to awaiting-composition; fewer = PipelineRun marked failed, module state reset to intro for retry
- `routeShot()` used for model selection as instructed — narrative shot type will route to fal adapter by default (observatory may override to Sora 2 when registered)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed import path depth for db/client**
- **Found during:** Task 1 (TypeScript compile verification)
- **Issue:** Used `../../db/client` but modules/ subdirectory needs `../../../db/client` (3 levels up to src/)
- **Fix:** Changed import to `../../../db/client` matching competitor-research.ts pattern
- **Files modified:** apps/worker/src/services/onboarding/modules/character-video-gen.ts
- **Verification:** `npx tsc --noEmit` shows zero errors in new files
- **Committed in:** e402a498 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor import path fix, no functional change.

## Issues Encountered

- Pre-existing TypeScript errors in test files and routes.ts (unrelated to this plan) — verified these existed before this plan and were not introduced by changes.

## Next Phase Readiness

- character-video-gen module is fully wired and TypeScript-clean
- Plan 02 (Remotion composition) can import sceneUrls from `collectedData.sceneUrls` once module reaches awaiting-composition
- `pipelineRunId` stored in module state for traceability in composition phase
- Model router (Phase 3.1) must have Sora 2 registered in Observatory for optimal routing; current fallback uses fal/kling adapter

---
*Phase: 04-character-video-gen-delivery*
*Completed: 2026-03-15*
