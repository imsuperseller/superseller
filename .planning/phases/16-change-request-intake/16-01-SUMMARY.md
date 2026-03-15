---
phase: 16-change-request-intake
plan: "01"
subsystem: database
tags: [postgres, anthropic, claude-api, character-bible, change-requests, cost-tracking]

# Dependency graph
requires:
  - phase: 15-admin-alerts-cost-attribution
    provides: sendAdminAlert, trackExpense, COST_RATES, normalizeProvider

provides:
  - change_requests table (CREATE TABLE IF NOT EXISTS, idempotent)
  - CharacterBible.changeDelta column migration (IF NOT EXISTS)
  - SORA_COST_PER_SCENE_CENTS exported constant derived from COST_RATES.fal.sora_2_scene_1080p
  - estimateChangeCost(intent, affectedSceneCount) for pricing scene/character changes
  - createChangeRequest, updateChangeRequestStatus, getPendingChangeRequest CRUD
  - classifyChangeRequest: Claude API intent classification returning ChangeRequestClassification
  - getLatestCharacterBible: ORDER BY createdAt DESC LIMIT 1 query
  - createCharacterBibleVersion: append-only insert pattern (never UPDATE)

affects:
  - 16-02 (change-request-handler orchestrator — imports all three services)
  - 17-character-regen (scene regen pipeline — uses SORA_COST_PER_SCENE_CENTS and getPendingChangeRequest)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Append-only CharacterBible versioning (INSERT new row, ORDER BY createdAt DESC LIMIT 1)
    - SORA_COST_PER_SCENE_CENTS derived from COST_RATES (not hardcoded)
    - Claude API classification with non-throwing fallback to ambiguous

key-files:
  created:
    - apps/worker/src/services/onboarding/change-request-intake.ts
    - apps/worker/src/services/onboarding/intent-classifier.ts
    - apps/worker/src/services/onboarding/character-bible-versioning.ts
  modified:
    - apps/worker/src/services/expense-tracker.ts (added sora_2_scene_1080p: 1.00 to COST_RATES.fal)

key-decisions:
  - "Added COST_RATES.fal.sora_2_scene_1080p = 1.00 to expense-tracker.ts to make SORA_COST_PER_SCENE_CENTS derivation explicit and auditable (matches existing SORA_COST_PER_SCENE = 1.00 in character-video-gen.ts)"
  - "classifyChangeRequest never throws — returns ambiguous fallback on API failure, parse error, or missing ANTHROPIC_API_KEY"
  - "buildClassificationPrompt handles empty scenarioNames with ordinal-only matching to avoid description-based ambiguity in early-phase customers"

patterns-established:
  - "CharacterBible versioning: INSERT new row with version+1 + changeDelta JSONB, never UPDATE existing rows"
  - "Cost derivation: Always import from COST_RATES rather than hardcoding dollar amounts in feature code"
  - "Classification prompt: ordinal map (first=1...fifth=5) + 5 intent categories + JSON-only response format"

requirements-completed: [INTAKE-02, INTAKE-03, CHAR-01]

# Metrics
duration: 2min
completed: "2026-03-15"
---

# Phase 16 Plan 01: Change Request Intake — Service Layer Summary

**Three service files for change request intake: Claude API intent classifier, append-only CharacterBible versioning, and change_requests table CRUD with cost estimation derived from COST_RATES**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-15T20:27:22Z
- **Completed:** 2026-03-15T20:30:03Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- change-request-intake.ts: idempotent table init (change_requests + indexes + CharacterBible.changeDelta migration), full CRUD (createChangeRequest, updateChangeRequestStatus, getPendingChangeRequest), and estimateChangeCost with SORA_COST_PER_SCENE_CENTS derived from COST_RATES
- intent-classifier.ts: Claude API classification returning structured ChangeRequestClassification with 5 intents, non-throwing fallback, ordinal-only fallback when scenarioNames is empty, trackExpense after success, sendAdminAlert on API failure
- character-bible-versioning.ts: append-only versioned INSERT pattern (getLatestCharacterBible + createCharacterBibleVersion with changeDelta JSONB, never UPDATE)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create change_requests table init + CRUD service** - `204cdb8d` (feat)
2. **Task 2: Create intent classifier + CharacterBible versioning services** - `5cb38da2` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/worker/src/services/onboarding/change-request-intake.ts` - change_requests table init, CRUD, cost estimation
- `apps/worker/src/services/onboarding/intent-classifier.ts` - Claude API intent classification for customer change messages
- `apps/worker/src/services/onboarding/character-bible-versioning.ts` - Append-only CharacterBible versioned insert + latest query
- `apps/worker/src/services/expense-tracker.ts` - Added COST_RATES.fal.sora_2_scene_1080p = 1.00

## Decisions Made

- Added `COST_RATES.fal.sora_2_scene_1080p = 1.00` to expense-tracker.ts so that SORA_COST_PER_SCENE_CENTS is derived from the rates table rather than hardcoded. This matches the existing `SORA_COST_PER_SCENE = 1.00` constant in character-video-gen.ts and makes pricing auditable in one place.
- `classifyChangeRequest` never throws — all error paths (missing API key, non-200 response, JSON parse failure) return the ambiguous fallback with a clarifying question. This prevents the orchestrator from crashing on transient API issues.
- Classification prompt includes explicit ordinal map (first=1...fifth=5) and handles missing scenarioNames gracefully — when scenarioNames is empty, description-based references return ambiguous with a clarifying question rather than guessing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added sora_2_scene_1080p to COST_RATES.fal in expense-tracker.ts**
- **Found during:** Task 1 (change-request-intake.ts implementation)
- **Issue:** Plan specified SORA_COST_PER_SCENE_CENTS should be derived from COST_RATES.fal.sora_2_scene_1080p, but that key did not exist in expense-tracker.ts (only sora_2_per_second_1080p existed)
- **Fix:** Added `sora_2_scene_1080p: 1.00` to COST_RATES.fal, matching the existing SORA_COST_PER_SCENE = 1.00 in character-video-gen.ts. Plan explicitly noted this addition was expected.
- **Files modified:** apps/worker/src/services/expense-tracker.ts
- **Verification:** SORA_COST_PER_SCENE_CENTS=100 confirmed by tsx import verification
- **Committed in:** 204cdb8d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — expected per plan spec)
**Impact on plan:** Required addition explicitly anticipated by plan spec. No scope creep.

## Issues Encountered

None — all services imported and verified cleanly without DB connection needed (module-level imports only).

## User Setup Required

None - no external service configuration required (ANTHROPIC_API_KEY already in environment from Phase 15).

## Next Phase Readiness

- All three service files ready for Plan 02 (change-request-handler.ts orchestrator) to import
- SORA_COST_PER_SCENE_CENTS and estimateChangeCost ready for cost gate in Plan 02
- getPendingChangeRequest indexed on group_id+status for fast poll vote routing
- createCharacterBibleVersion preserves old rows — append-only pattern established

---
*Phase: 16-change-request-intake*
*Completed: 2026-03-15*

## Self-Check: PASSED

- FOUND: apps/worker/src/services/onboarding/change-request-intake.ts
- FOUND: apps/worker/src/services/onboarding/intent-classifier.ts
- FOUND: apps/worker/src/services/onboarding/character-bible-versioning.ts
- FOUND: .planning/phases/16-change-request-intake/16-01-SUMMARY.md
- FOUND: commit 204cdb8d
- FOUND: commit 5cb38da2
