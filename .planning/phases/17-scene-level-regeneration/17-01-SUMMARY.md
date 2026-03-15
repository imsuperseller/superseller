---
phase: 17-scene-level-regeneration
plan: "01"
subsystem: queue
tags: [bullmq, redis, worker, character-regen, scene-regeneration]

requires:
  - phase: 16-change-request-intake
    provides: change_requests table, ChangeRequestRow type, getPendingChangeRequest for poll routing

provides:
  - characterRegenQueue (BullMQ queue on Redis, queue name "character-regen")
  - CharacterRegenJobData interface (changeRequestId, sceneIndex, tenantId, groupId, characterBibleId)
  - character-regen.worker.ts skeleton registered at startup/shutdown in index.ts
  - generateScene exported from character-video-gen.ts for reuse in regen worker
  - buildScenePrompts exported from character-video-gen.ts for reuse
  - sceneStatuses initialized to all-approved on delivery transition in character-video-gen.ts
  - getInProgressChangeRequest concurrency guard query in change-request-intake.ts

affects: [17-02-scene-regen-dispatch-and-processing]

tech-stack:
  added: []
  patterns:
    - "character-regen BullMQ queue follows same Redis connection + defaultJobOptions pattern as remotionQueue"
    - "Worker skeleton exports initCharacterRegenWorker() + worker ref, registered in index.ts bootstrap/shutdown"
    - "sceneStatuses: (data.sceneUrls ?? []).map(() => 'approved') — initialized at delivery, tracks per-scene state"

key-files:
  created:
    - apps/worker/src/queue/workers/character-regen.worker.ts
  modified:
    - apps/worker/src/queue/queues.ts
    - apps/worker/src/services/onboarding/modules/character-video-gen.ts
    - apps/worker/src/services/onboarding/change-request-intake.ts
    - apps/worker/src/index.ts

key-decisions:
  - "character-regen worker uses concurrency:2 (allows two simultaneous scene regeneration jobs)"
  - "processCharacterRegen throws NotImplemented — Plan 02 fills full logic, skeleton only here"
  - "sceneStatuses derives length from data.sceneUrls ?? [] to avoid hardcoding TOTAL_SCENES constant"
  - "getInProgressChangeRequest uses same SELECT column list as getPendingChangeRequest for consistency"

patterns-established:
  - "Queue + interface co-located in queues.ts; worker in queue/workers/ follows init/export pattern"
  - "initChangeRequestTable called AFTER initOnboardingWorker and initCharacterRegenWorker in bootstrap"

requirements-completed: [REGEN-01, REGEN-02]

duration: 12min
completed: 2026-03-15
---

# Phase 17 Plan 01: Scene-Level Regeneration — Queue Infrastructure Summary

**characterRegenQueue + worker skeleton + generateScene/buildScenePrompts exports + sceneStatuses init + getInProgressChangeRequest concurrency guard — all prerequisites for Plan 02 dispatch logic**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-15T22:37:00Z
- **Completed:** 2026-03-15T22:49:33Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- `characterRegenQueue` defined in queues.ts with `CharacterRegenJobData` interface (changeRequestId, sceneIndex, tenantId, groupId, characterBibleId)
- `character-regen.worker.ts` skeleton created with concurrency:2, failed/completed event handlers, and initCharacterRegenWorker() registered in index.ts bootstrap + SIGTERM shutdown
- `generateScene` and `buildScenePrompts` exported from character-video-gen.ts enabling the regen worker to reuse scene generation logic without code duplication
- `sceneStatuses` array initialized to all-approved on delivery transition — tracking foundation for per-scene state machine in Plan 02
- `getInProgressChangeRequest` added as concurrency guard query (WHERE status = 'in-progress') to prevent dispatch when regen already running

## Task Commits

1. **Task 1: Add characterRegenQueue + export generateScene + init sceneStatuses** - `a429f647` (feat)
2. **Task 2: Create character-regen.worker.ts skeleton + register in index.ts** - `52d1838d` (feat)

## Files Created/Modified

- `apps/worker/src/queue/queues.ts` - Added characterRegenQueue + CharacterRegenJobData interface
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` - Exported generateScene + buildScenePrompts; init sceneStatuses on delivery
- `apps/worker/src/services/onboarding/change-request-intake.ts` - Added getInProgressChangeRequest (WHERE status = 'in-progress')
- `apps/worker/src/queue/workers/character-regen.worker.ts` - New BullMQ worker skeleton (concurrency:2)
- `apps/worker/src/index.ts` - Import + register characterRegenWorker in bootstrap/shutdown

## Decisions Made

- Worker concurrency set to 2: allows two simultaneous scene regeneration jobs (one per concurrent change request per tenant is realistic)
- processCharacterRegen() throws NotImplemented intentionally — Plan 02 fills all logic; skeleton confirms queue wiring works before building complex processing
- sceneStatuses uses `data.sceneUrls ?? []` to avoid a hardcoded scene count — future-proof if TOTAL_SCENES changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compilation passed cleanly after both tasks.

## Next Phase Readiness

- Queue infrastructure complete — Plan 02 can import `characterRegenQueue`, `CharacterRegenJobData`, `generateScene`, `buildScenePrompts` from their respective files
- `getInProgressChangeRequest` ready for concurrency guard in dispatch logic
- `sceneStatuses` tracking initialized at delivery — Plan 02 can read and mutate per-scene status without migration
- Blocker remains: FAL_WEBHOOK_VERIFY=false must be resolved before regen webhooks go live (tracked in STATE.md)

---
*Phase: 17-scene-level-regeneration*
*Completed: 2026-03-15*
