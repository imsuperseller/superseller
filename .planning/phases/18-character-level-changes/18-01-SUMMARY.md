---
phase: 18-character-level-changes
plan: "01"
subsystem: character-level-changes
tags: [character, change-request, admin-approval, tdd, queue, db-migration]
dependency_graph:
  requires:
    - 16-02 (change-request-handler, change-request-intake)
    - 17-02 (character-regen queue, characterRegenQueue)
  provides:
    - classifyChangeDelta (field classification for routing in Plan 02)
    - sendAdminCharacterChangeReview (admin review + poll for Phase 18 flows)
    - handleAdminCharacterApprovalPollVote (approve/deny/scene-selection dispatch)
    - handleAdminSceneSelectionText (partial regen from admin text reply)
    - handleNameOnlyChange (name-only shortcut at $0 cost)
    - admin_approval_poll_id column (DB schema extension)
    - affectedSceneIndices on CharacterRegenJobData (multi-scene queue interface)
  affects:
    - apps/worker/src/services/onboarding/change-request-intake.ts
    - apps/worker/src/queue/queues.ts
tech_stack:
  added: []
  patterns:
    - TDD (RED → GREEN): vitest mocks, vi.mock for WAHA + DB + queue
    - Idempotent ALTER TABLE with information_schema check
    - Safe unknown-field default (VISUAL_FIELDS set + fallthrough)
    - Append-only status state machine: pending-admin-approval → admin-approved/admin-denied/pending-scene-selection
key_files:
  created:
    - apps/worker/src/services/onboarding/character-level-changes.ts
    - apps/worker/src/services/onboarding/character-level-changes.test.ts
  modified:
    - apps/worker/src/services/onboarding/change-request-intake.ts
    - apps/worker/src/queue/queues.ts
decisions:
  - VISUAL_FIELDS = Set(["visualStyle", "soraHandle"]); unknown fields default to visual (safe)
  - NON_VISUAL_FIELDS = Set(["name", "personaDescription"]); only these bypass visual regen
  - affectedSceneIndices always [0,1,2,3,4] for full regen; partial indices for scene-selection path
  - getPendingAdminApprovalRequest queries globally (not per groupId) — concurrency guard ensures at-most-one pending
  - getInProgressChangeRequest now blocks on both in-progress AND pending-admin-approval statuses
  - updateChangeRequestStatus extended with adminApprovalPollId extra field
  - handleAdminSceneSelectionText reuses getPendingAdminApprovalRequest with status guard (pending-scene-selection)
metrics:
  duration: "~7 min (execution)"
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_modified: 4
---

# Phase 18 Plan 01: Character-Level Changes Service Module Summary

**One-liner:** VISUAL_FIELDS-based classifier + admin WAHA poll approval flow + name-only $0 shortcut with 18 passing TDD tests.

## What Was Built

### Task 1: Extend DB Schema + Queue Interface

Extended two existing files to support the Phase 18 admin approval lifecycle:

**change-request-intake.ts:**
- Added `admin_approval_poll_id TEXT` column via idempotent `DO $$ BEGIN ... ALTER TABLE` migration in `initChangeRequestTable()`
- Added `admin_approval_poll_id: string | null` to `ChangeRequestRow` interface
- Added `adminApprovalPollId?: string` to `UpdateChangeRequestExtraFields` + wired into `updateChangeRequestStatus`
- Added `getPendingAdminApprovalRequest()` — global query for the admin poll vote router
- Updated `getInProgressChangeRequest` WHERE clause from `status = 'in-progress'` to `status IN ('in-progress', 'pending-admin-approval')` to prevent new change requests while admin review is pending
- Updated all SELECT queries to include `admin_approval_poll_id` column

**queues.ts:**
- Added `affectedSceneIndices?: number[]` to `CharacterRegenJobData` interface with explanatory comment

### Task 2: character-level-changes.ts Service Module (TDD)

Created `apps/worker/src/services/onboarding/character-level-changes.ts` with 5 exported functions:

**`classifyChangeDelta(changeDelta)`**
- `VISUAL_FIELDS = Set(["visualStyle", "soraHandle"])`
- `NON_VISUAL_FIELDS = Set(["name", "personaDescription"])`
- Any field NOT in NON_VISUAL_FIELDS → visual (safe default for unknown fields)
- Returns `{ hasVisualChanges, affectedSceneCount, changedFields }`

**`sendAdminCharacterChangeReview(params)`**
- Resolves admin chatId via `phoneToChatId(config.admin.defaultPhone)`
- Sends formatted diff text to admin
- Sends 3-option poll: "Approve all N scenes" / "Deny" / "Select specific scenes"
- Updates CR status to `pending-admin-approval` with `adminApprovalPollId`
- Returns poll message ID or null

**`handleAdminCharacterApprovalPollVote(params)`**
- Queries `getPendingAdminApprovalRequest()` for the current pending CR
- "Approve all" → `admin-approved` + `characterRegenQueue.add` with `affectedSceneIndices: [0,1,2,3,4]` + customer ack
- "Deny" → `admin-denied` + customer notification
- "Select specific scenes" → `pending-scene-selection` + asks admin for scene numbers
- Returns false for unrecognized options

**`handleAdminSceneSelectionText(params)`**
- Parses 1-based scene numbers (1-5) from admin text via `/\d+/g` regex
- Converts to 0-based, deduplicates, sorts
- Dispatches `characterRegenQueue.add` with partial `affectedSceneIndices`
- Sends "could not parse" retry message if no valid numbers found

**`handleNameOnlyChange(params)`**
- Sends existing `revealUrl` video to customer group with "Meet {newName}" caption
- Updates CR to `completed` with `estimatedCostCents: 0`

## Test Coverage

18 vitest tests covering all exported functions (RED → GREEN TDD):
- 7 tests: classifyChangeDelta edge cases
- 2 tests: sendAdminCharacterChangeReview (success + sendPoll failure)
- 5 tests: handleAdminCharacterApprovalPollVote (approve, deny, scene-select, no-CR, unknown option)
- 3 tests: handleAdminSceneSelectionText (no-CR, valid parse, invalid parse)
- 1 test: handleNameOnlyChange

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

**Files exist:**
- `apps/worker/src/services/onboarding/character-level-changes.ts` — CREATED
- `apps/worker/src/services/onboarding/character-level-changes.test.ts` — CREATED

**Commits exist:**
- `3d58dc03` — feat(18-01): extend DB schema + queue interface for character-level changes
- `27e174b8` — test(18-01): add failing tests for character-level-changes service (RED)
- `b47c24a7` — feat(18-01): create character-level-changes service module (GREEN)

## Self-Check: PASSED
