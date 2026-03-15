---
phase: 16-change-request-intake
plan: "02"
subsystem: onboarding/change-request
tags: [change-request, intent-classification, poll-vote, character-bible, whatsapp]
dependency_graph:
  requires: ["16-01"]
  provides: ["handleChangeRequest", "handleChangeRequestPollVote", "delivered-phase-routing", "poll-vote-disambiguation"]
  affects: ["character-video-gen.ts", "claudeclaw.worker.ts", "index.ts"]
tech_stack:
  added: []
  patterns: ["dynamic-import for circular-safe change-request-handler", "poll-vote disambiguation before pipeline fallthrough"]
key_files:
  created:
    - apps/worker/src/services/onboarding/change-request-handler.ts
  modified:
    - apps/worker/src/services/onboarding/modules/character-video-gen.ts
    - apps/worker/src/queue/workers/claudeclaw.worker.ts
    - apps/worker/src/index.ts
decisions:
  - "initChangeRequestTable added to both initClaudeClaw (claudeclaw.worker.ts) AND index.ts bootstrap for belt-and-suspenders startup guarantee"
  - "Dynamic import for change-request-handler in character-video-gen delivered case — avoids circular dependency at module load time"
  - "Poll vote disambiguation checks getPendingChangeRequest first (fast indexed query) before falling through to handlePipelineEvent — resolves Research Pitfall 2"
metrics:
  duration: "~15 min"
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_changed: 4
requirements: [INTAKE-01, INTAKE-04]
---

# Phase 16 Plan 02: Change Request Handler + Poll Vote Disambiguation Summary

**One-liner:** End-to-end change request intake wired: delivered-phase routing to intent classifier, cost-estimate polls for scene/character changes, CharacterBible versioning on confirmed character-change vote, poll vote disambiguation in ClaudeClaw worker.

## What Was Built

### change-request-handler.ts (NEW)

Orchestrator with two exported functions:

**`handleChangeRequest(params)`** — Entry point from character-video-gen "delivered" phase:
1. Calls `getLatestCharacterBible` to get scene context (scenario_names, scene_count)
2. Calls `classifyChangeRequest` with message + context
3. Persists row via `createChangeRequest` (all intents — audit trail)
4. Routes by intent:
   - `scene-change` (with sceneNumber): sends cost poll via `sendPoll`
   - `scene-change` (no sceneNumber): treats as ambiguous, sends clarifying question
   - `character-change`: sends multi-scene cost poll
   - `positive-feedback`: sends thank-you text, keeps change window open
   - `unrelated`: returns `{ handled: false }` for ClaudeClaw fallthrough
   - `ambiguous`: sends `clarifyingQuestion` from classifier

**`handleChangeRequestPollVote(params)`** — Called from claudeclaw.worker.ts for change-request polls:
1. Loads pending CR via `getPendingChangeRequest(groupId)`
2. Yes vote: `updateChangeRequestStatus(id, "confirmed")`
   - For `character-change`: calls `createCharacterBibleVersion` with changeDelta, stores versionId
   - For `scene-change`: confirms without bible version
   - Sends confirmation text
3. No vote: `updateChangeRequestStatus(id, "rejected")`, sends acknowledgment
4. Does NOT dispatch to any BullMQ queue (Phase 17 concern)

### character-video-gen.ts (MODIFIED)

- Final state transition changed from `"complete"` to `"delivered"` in `runCompositionPipeline`
- Added `case "delivered"` in `handleMessage` switch that dynamically imports and delegates to `handleChangeRequest`
- Kept `case "complete"` as fallback for backwards compatibility with existing modules

### claudeclaw.worker.ts (MODIFIED)

Poll vote block now disambiguates before routing:
1. Check `getPendingChangeRequest(chatId)` — fast indexed query (group_id + status)
2. If pending change request exists: route to `handleChangeRequestPollVote`, return `"change-request-poll-vote"`
3. If no pending change request: fall through to existing `handlePipelineEvent` (module-selection polls unchanged)

### index.ts (MODIFIED)

Added `initChangeRequestTable()` import and call in bootstrap startup sequence (after `initOnboardingWorker()`).

## Verification Results

- `grep 'case "delivered"' character-video-gen.ts` returns 1
- `grep 'createCharacterBibleVersion' change-request-handler.ts` returns 3 (import + 2 call sites)
- `grep 'getPendingChangeRequest' claudeclaw.worker.ts` returns 2
- `grep 'handleChangeRequestPollVote' claudeclaw.worker.ts` returns 2
- `grep 'initChangeRequestTable' index.ts` returns 2 (import + call)
- `npm run build` — passes with no TypeScript errors

## Deviations from Plan

None — plan executed exactly as written, with one small addition:

**Addition (Rule 2 — Belt-and-suspenders):** `initChangeRequestTable` was added to both `initClaudeClaw()` inside claudeclaw.worker.ts AND to `index.ts` bootstrap. The plan only specified index.ts, but claudeclaw.worker.ts already initializes `initModuleStateTable` and other onboarding tables — adding it there too ensures the table exists even in edge cases where initClaudeClaw runs before bootstrap reaches the explicit index.ts call.

## Self-Check: PASSED

- [x] `apps/worker/src/services/onboarding/change-request-handler.ts` exists
- [x] Exports `handleChangeRequest` and `handleChangeRequestPollVote`
- [x] `case "delivered"` present in character-video-gen.ts
- [x] Final state transition uses `"delivered"` in character-video-gen.ts
- [x] Poll disambiguation uses `getPendingChangeRequest` before `handlePipelineEvent`
- [x] `initChangeRequestTable` called at startup
- [x] Worker builds cleanly (`npm run build` with no errors)
- [x] Commits: 7d37925c (Task 1), 628bc66c (Task 2)
