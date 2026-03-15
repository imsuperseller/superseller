---
phase: 17-scene-level-regeneration
plan: "02"
subsystem: character-regen-worker
tags: [worker, bullmq, scene-regen, waha, remotion, r2, pipeline]
dependency_graph:
  requires: [17-01]
  provides: [character-regen-end-to-end, scene-change-dispatch]
  affects: [change-request-handler, character-regen.worker]
tech_stack:
  added: []
  patterns: [bullmq-worker, retry-loop-2-attempts, tmp-cleanup-finally, sceneStatuses-fallback]
key_files:
  created: []
  modified:
    - apps/worker/src/services/onboarding/change-request-handler.ts
    - apps/worker/src/queue/workers/character-regen.worker.ts
decisions:
  - "renderComposition used directly (not remotionQueue) — regen worker must not depend on queue consumer availability"
  - "buildScenePrompts cast as any to bridge CharacterBibleRow from character-bible-versioning vs character-video-gen"
  - "trackExpense call uses actual TrackExpenseParams interface (service+operation+estimatedCost), not the plan's pseudocode signature"
  - "tmpDir cleanup in finally block (not try body) ensures cleanup on all paths including unhandled errors"
  - "Re-throw error in catch block so BullMQ marks job failed and triggers retries per queue config"
metrics:
  duration: "~18 min"
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_modified: 2
---

# Phase 17 Plan 02: Scene-Level Regen Worker + Dispatch Summary

**One-liner:** Scene-change dispatch wired into characterRegenQueue with concurrency guard; full worker pipeline: ack -> generate -> R2 upload -> Remotion mixed-scene re-render -> WhatsApp delivery with cost tracking and status audit trail.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire dispatch in change-request-handler + concurrency guard | 80b67e97 | change-request-handler.ts |
| 2 | Implement full character-regen worker processing logic | 9256b8f4 | character-regen.worker.ts |

## What Was Built

### Task 1 — change-request-handler.ts

Modified `handleChangeRequestPollVote` in the `isYes` + `scene-change` confirmed branch:

- Added `getInProgressChangeRequest` to imports
- **Concurrency guard:** If another regen is in-progress for this `groupId`, sends "A scene is currently being regenerated..." message and returns early
- **Dispatch:** Dynamic import `characterRegenQueue` → `characterRegenQueue.add("regen-scene", { changeRequestId, sceneIndex: (cr.scene_number ?? 1) - 1, tenantId, groupId })`
- **Message suppression:** Generic "Change request confirmed!" message now gated on `cr.intent !== "scene-change"` — scene-change gets zero messages from handler (worker sends both ack and video)

### Task 2 — character-regen.worker.ts

Full 15-step processing pipeline replacing the placeholder stub:

1. `updateChangeRequestStatus(changeRequestId, "in-progress")` + ack sendText
2. `createPipelineRun` with pipelineType "character-regen"
3. Load module state, extract `sceneUrls` + `sceneStatuses` (fallback: `sceneUrls.map(() => "approved")`)
4. Validate `sceneIndex` bounds — admin alert + customer message + early return on invalid
5. Set `sceneStatuses[sceneIndex] = "pending"` + upsertModuleState
6. `getLatestCharacterBible` + `buildScenePrompts` → get target scene prompt
7. `generateScene()` with 2-attempt retry; terminal failure reverts sceneStatuses, alerts admin, notifies customer
8. Download generated video, write to `/tmp`, upload to R2 at `character-videos/{tenantId}/scene-{i}.mp4`
9. `trackExpense` with service/operation/estimatedCost
10. `sceneUrls[sceneIndex] = newSceneUrl; sceneStatuses[sceneIndex] = "approved"`
11. `renderComposition("CharacterReveal-16x9", revealProps)` — passes mixed sceneUrls (N-1 original + 1 new)
12. Upload rendered reveal.mp4 to R2 → `sendVideo(groupId, newRevealUrl, caption)` (message 2 of 2)
13. `upsertModuleState` with updated sceneUrls, sceneStatuses, revealUrl
14. `updateChangeRequestStatus(changeRequestId, "completed")` + `updatePipelineRun` with costCents, durationMs
15. `/tmp` cleanup in `finally` block

**Error handling:** Unhandled errors revert `sceneStatuses[sceneIndex]` to "approved", update CR to failed, alert admin, notify customer, re-throw for BullMQ retry tracking.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] trackExpense actual signature differs from plan pseudocode**
- **Found during:** Task 2 — TypeScript compilation error `TS2353: 'tenantId' does not exist in type 'TrackExpenseParams'`
- **Issue:** Plan provided pseudocode with `{ tenantId, operation, provider, costCents }` but actual `TrackExpenseParams` uses `{ service, operation, estimatedCost, metadata }`
- **Fix:** Used correct interface fields; `tenantId` moved to metadata; cost in dollars not cents for `estimatedCost`
- **Files modified:** character-regen.worker.ts
- **Commit:** 9256b8f4

**2. [Rule 1 - Bug] sendAdminAlert takes params object, not plain string**
- **Found during:** Task 2 — plan pseudocode showed `sendAdminAlert("message string", { metadata })` but actual signature is `sendAdminAlert({ error, module, groupId })`
- **Fix:** Used `AdminAlertParams` object format throughout
- **Files modified:** character-regen.worker.ts
- **Commit:** 9256b8f4

**3. [Rule 2 - Completeness] renderComposition returns local path, not URL**
- **Found during:** Task 2 — plan pseudocode expected `renderResult.outputUrl` but `renderComposition` returns `{ outputPath, durationSeconds, renderTimeSeconds }`
- **Fix:** Used `renderResult.outputPath` as input to `uploadToR2`, then used the R2 URL returned from that call as `newRevealUrl`
- **Files modified:** character-regen.worker.ts
- **Commit:** 9256b8f4

## Self-Check: PASSED

- change-request-handler.ts: FOUND
- character-regen.worker.ts: FOUND
- Commit 80b67e97: FOUND
- Commit 9256b8f4: FOUND
