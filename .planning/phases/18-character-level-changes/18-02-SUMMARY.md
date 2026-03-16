---
phase: 18-character-level-changes
plan: "02"
subsystem: character-level-changes
tags: [character-regen, admin-gate, multi-scene, poll-routing, bullmq]
dependency_graph:
  requires:
    - 18-01  # character-level-changes.ts service functions
    - 17-02  # character-regen.worker.ts base implementation
    - 16-02  # change-request-handler.ts base + claudeclaw.worker.ts poll routing
  provides:
    - Full end-to-end character-change flow: customer confirm -> admin gate -> multi-scene regen -> delivery
    - Admin poll vote routing in ClaudeClaw DM section
    - Post-delivery approve/change poll (ASSEM-02)
  affects:
    - apps/worker/src/services/onboarding/change-request-handler.ts
    - apps/worker/src/queue/workers/claudeclaw.worker.ts
    - apps/worker/src/queue/workers/character-regen.worker.ts
tech_stack:
  added: []
  patterns:
    - Dynamic import for character-level-changes.ts in change-request-handler to avoid circular deps
    - affectedSceneIndices array pattern for multi-scene with single-scene backwards compat
    - Admin DM routing in claudeclaw before approval-service check
key_files:
  modified:
    - apps/worker/src/services/onboarding/change-request-handler.ts
    - apps/worker/src/queue/workers/claudeclaw.worker.ts
    - apps/worker/src/queue/workers/character-regen.worker.ts
decisions:
  - "Placed admin DM routing in the direct-message section of claudeclaw (not in group block) since admin responses come as 1:1 DMs not group messages"
  - "Used parseFloat((costCents/100).toFixed(2)) to match SendAdminCharacterChangeReviewParams.costDollars: number type"
  - "affectedIndices derived from affectedSceneIndices ?? [sceneIndex] at top of processCharacterRegen for clean backwards compat"
  - "totalCostCents accumulates across all scenes in loop for accurate PipelineRun cost tracking"
  - "No partial regen recovery: any scene failure reverts ALL affected sceneStatuses and throws to fail the job"
metrics:
  duration_minutes: 12
  tasks_completed: 2
  files_modified: 3
  completed_date: "2026-03-16"
---

# Phase 18 Plan 02: Admin Gate + Multi-Scene Regen Summary

**One-liner:** Admin approval gate wired into character-change flow with multi-scene regen loop and post-delivery approve/change poll.

## What Was Built

### Task 1: Admin gate in change-request-handler + admin poll routing in claudeclaw

**change-request-handler.ts** — The character-change confirmed branch now:
1. Fetches current bible to get the `from` value for the structured delta
2. Builds `structuredDelta = { visualStyle: { from: currentBible.visualStyle, to: cr.change_summary } }`
3. Calls `createCharacterBibleVersion` with proper `updatedFields` and the structured delta
4. Calls `classifyChangeDelta(structuredDelta)` to determine name-only vs visual
5. Name-only path: calls `handleNameOnlyChange` and returns (re-delivers existing video at $0)
6. Visual path: calls `sendAdminCharacterChangeReview` → sends customer "submitted for review" message → returns (no queue dispatch here)

**claudeclaw.worker.ts** — Two new try/catch blocks added in the DM handling section (before `handleApprovalResponse`):
- Admin poll vote block: checks `chatId === adminChatId` + `isPollVote` → routes to `handleAdminCharacterApprovalPollVote`
- Admin scene selection text block: checks `chatId === adminChatId` + `!isPollVote` → routes to `handleAdminSceneSelectionText`

### Task 2: Multi-scene loop + post-delivery poll in character-regen worker

**character-regen.worker.ts** changes:
- `affectedIndices = job.data.affectedSceneIndices ?? [sceneIndex]` at top (backwards compat)
- `isMultiScene = affectedIndices.length > 1` for conditional messaging
- Ack message adapts to single vs multi-scene count
- `buildScenePrompts` called once before loop
- Loop over `affectedIndices`: generate → download → R2 upload → track cost per scene
- Any scene failure: revert ALL affected sceneStatuses, send admin alert, notify customer, throw (no partial regen)
- `totalCostCents` accumulates across all scenes for PipelineRun cost
- Post-delivery poll after `sendVideo`: "Happy with your updated character?" with ["Yes, I love it!", "Request more changes"]
- Catch block reverts all pending-status indices (not just single `sceneIndex`)

## End-to-End Flow (Complete After This Plan)

```
Customer: "make her more casual"
  -> handleChangeRequest: character-change intent, cost-estimate poll
Customer: votes Yes
  -> handleChangeRequestPollVote: creates bible version with structuredDelta
  -> classifyChangeDelta: visualStyle = visual
  -> sendAdminCharacterChangeReview: diff + 3-option poll to admin DM
  -> customer: "submitted for review" message
Admin: votes "Approve all 5 scenes" (in their 1:1 DM)
  -> claudeclaw: chatId === adminChatId + isPollVote -> handleAdminCharacterApprovalPollVote
  -> status = admin-approved, characterRegenQueue.add with affectedSceneIndices=[0,1,2,3,4]
  -> customer: "Admin approved! Regenerating 5 scenes..."
character-regen worker:
  -> loop over [0,1,2,3,4]: generate, download, R2, track cost
  -> Remotion render with updated sceneUrls
  -> sendVideo reveal + post-delivery poll
Customer: votes "Yes, I love it!"
  -> handleChangeRequestPollVote: isYes -> status=confirmed (no-op for completed CR)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Admin blocks placed in DM section, not group section**
- **Found during:** Task 1
- **Issue:** Plan said "insert before line 206" which is inside `if (isGroup)`. Admin chatId is a 1:1 DM (`@c.us` suffix, not `@g.us`) so the check `chatId === adminChatId` inside the group block would never match.
- **Fix:** Placed admin poll vote and scene selection blocks in the DM handling section (after slash commands, before `handleApprovalResponse`). Functionally correct per the plan's intent.
- **Files modified:** `claudeclaw.worker.ts`

## Self-Check: PASSED

### Files Exist
- FOUND: apps/worker/src/services/onboarding/change-request-handler.ts
- FOUND: apps/worker/src/queue/workers/claudeclaw.worker.ts
- FOUND: apps/worker/src/queue/workers/character-regen.worker.ts

### Commits Exist
- e704a23c: feat(18-02): wire admin gate in change-request-handler + admin poll routing in claudeclaw
- 6169e34e: feat(18-02): extend character-regen worker with multi-scene loop + post-delivery poll
