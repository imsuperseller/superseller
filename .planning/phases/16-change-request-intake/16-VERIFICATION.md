---
phase: 16-change-request-intake
verified: 2026-03-15T21:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 16: Change Request Intake Verification Report

**Phase Goal:** Customers can send natural-language change requests after receiving their character video, see a cost estimate, confirm via poll, and have their intent correctly classified — no generation triggered yet
**Verified:** 2026-03-15
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Customer sends a WhatsApp message after video delivery and the system responds with the classified intent and affected scope (not the questionnaire) | VERIFIED | `character-video-gen.ts` line 787: `case "delivered"` dynamically imports and delegates to `handleChangeRequest`. Module final state transition is `"delivered"` (line 643), so the delivered phase is active. `handleChangeRequest` classifies intent via Claude API and routes (scene-change sends poll, positive-feedback sends thank-you, unrelated returns `handled:false`). |
| 2 | Customer receives a cost estimate poll and no generation is dispatched until they confirm Yes | VERIFIED | `change-request-handler.ts` lines 116-128 and 151-163: `sendPoll` is called for `scene-change` and `character-change` with dollar cost in the question. `handleChangeRequestPollVote` (line 301) explicitly comments "Do NOT dispatch to any BullMQ queue — Phase 17 handles generation" and does not contain any queue dispatch call. |
| 3 | System correctly extracts scene numbers from natural-language references ("scene 3", "the third one", "the coffee shop scene") | VERIFIED | `intent-classifier.ts` lines 34-85: `buildClassificationPrompt` constructs a system prompt with explicit ORDINAL MAP (first=1, second=2, third=3, fourth=4, fifth=5) and SCENE MATCHING RULES covering name-based, ordinal, and direct number references. Claude API call at line 117 returns structured `ChangeRequestClassification` with `sceneNumber`. Ordinal references are resolved; description-based references without scene names return `ambiguous` with a clarifying question. |
| 4 | A new CharacterBible version row is inserted for every approved character-change (old version preserved, rollback possible) | VERIFIED | `character-bible-versioning.ts` lines 94-162: `createCharacterBibleVersion` fetches the current row, computes `newVersion = current.version + 1`, and `INSERT`s a brand-new row. The file's own comment states "NEVER updates the existing row." The SQL is `INSERT INTO "CharacterBible" ... RETURNING id` — no UPDATE present anywhere in the file. `change-request-handler.ts` lines 259-289: calls `createCharacterBibleVersion` only when `cr.intent === "character-change"` and vote is Yes. |
| 5 | Every change request is logged with intent, scope, and status from the moment it is received | VERIFIED | `change-request-handler.ts` line 79: `createChangeRequest` is called unconditionally before the intent switch, for all intents including positive-feedback and unrelated. Inserts `intent`, `scope`, `scene_number`, `change_summary`, and default `status='received'` into `change_requests` table. |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/worker/src/services/onboarding/change-request-intake.ts` | change_requests table init + CRUD | VERIFIED | 205 lines. Exports: `initChangeRequestTable`, `createChangeRequest`, `updateChangeRequestStatus`, `getPendingChangeRequest`, `estimateChangeCost`, `SORA_COST_PER_SCENE_CENTS`, `ChangeRequestRow`. All substantive. |
| `apps/worker/src/services/onboarding/intent-classifier.ts` | Claude API intent classification | VERIFIED | 195 lines. Exports `classifyChangeRequest` and `ChangeRequestClassification`. Fetches `https://api.anthropic.com/v1/messages`, model `claude-sonnet-4-20250514`, non-throwing fallback, `trackExpense` after success, `sendAdminAlert` on failure. |
| `apps/worker/src/services/onboarding/character-bible-versioning.ts` | Versioned CharacterBible insert + latest query | VERIFIED | 163 lines. Exports `getLatestCharacterBible` (ORDER BY "createdAt" DESC LIMIT 1) and `createCharacterBibleVersion` (INSERT-only, never UPDATE). |
| `apps/worker/src/services/onboarding/change-request-handler.ts` | Orchestrator: classify -> store -> poll -> vote handling | VERIFIED | 349 lines. Exports `handleChangeRequest` and `handleChangeRequestPollVote`. Full intent routing wired. |
| `apps/worker/src/services/onboarding/modules/character-video-gen.ts` | Extended with delivered phase routing | VERIFIED | `case "delivered"` present at line 787. Final state transition uses `"delivered"` at line 643. `case "complete"` preserved for backwards compatibility. |
| `apps/worker/src/queue/workers/claudeclaw.worker.ts` | Poll vote disambiguation for change-request vs module-selection | VERIFIED | Lines 213-233: `getPendingChangeRequest` checked before `handlePipelineEvent`. If pending request exists, routes to `handleChangeRequestPollVote`, returns `"change-request-poll-vote"`. Falls through to `handlePipelineEvent` when no pending request. |
| `apps/worker/src/index.ts` | change_requests table initialized on startup | VERIFIED | Line 14: imports `initChangeRequestTable`. Line 82: calls `await initChangeRequestTable()`. |
| `apps/worker/src/services/expense-tracker.ts` | `sora_2_scene_1080p: 1.00` added to COST_RATES.fal | VERIFIED | Line 42: `sora_2_scene_1080p: 1.00` present in COST_RATES.fal. `SORA_COST_PER_SCENE_CENTS` in change-request-intake.ts derives from this value. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `character-video-gen.ts` | `change-request-handler.ts` | dynamic import in `case "delivered"` | WIRED | Line 788: `const { handleChangeRequest } = await import("../change-request-handler")` |
| `claudeclaw.worker.ts` | `change-request-handler.ts` | `handleChangeRequestPollVote` after `getPendingChangeRequest` check | WIRED | Lines 216-222: dynamic import of `handleChangeRequestPollVote` called with `pendingRequest.id` |
| `change-request-handler.ts` | `intent-classifier.ts` | `classifyChangeRequest` call | WIRED | Line 22 import, line 68 call |
| `change-request-handler.ts` | `change-request-intake.ts` | `createChangeRequest` + `updateChangeRequestStatus` | WIRED | Lines 25-29 imports, lines 79, 111, 116-127 calls |
| `change-request-handler.ts` | `waha-client.ts` | `sendPoll` for cost confirmation, `sendText` for feedback/ambiguous | WIRED | Line 30 import. `sendPoll` called lines 116, 151. `sendText` called lines 178, 194, 302, 316 |
| `change-request-handler.ts` | `character-bible-versioning.ts` | `createCharacterBibleVersion` on confirmed character-change poll vote | WIRED | Line 23 import, line 260 call (guarded by `cr.intent === "character-change"`) |
| `change-request-intake.ts` | `expense-tracker.ts` | `COST_RATES` for `SORA_COST_PER_SCENE_CENTS` derivation | WIRED | Line 13 import, line 23: `COST_RATES.fal?.sora_2_scene_1080p ?? 1.00` |
| `character-bible-versioning.ts` | `CharacterBible` table | INSERT new row, ORDER BY createdAt DESC LIMIT 1 for reads | WIRED | Lines 69-75 (getLatest), lines 124-139 (INSERT) |
| `change-request-intake.ts` | `change_requests` table | CREATE TABLE IF NOT EXISTS + CRUD queries | WIRED | Lines 53-90 (init), line 109 (INSERT), line 163 (UPDATE), line 175 (SELECT) |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INTAKE-01 | 16-02 | Customer can send natural-language change request in WhatsApp group after receiving character video | SATISFIED | `case "delivered"` in character-video-gen.ts routes to `handleChangeRequest`. Module stays in `delivered` phase (not `complete`) so messages are routed indefinitely. |
| INTAKE-02 | 16-01 | System classifies intent as scene-level change, character-level change, positive feedback, or unrelated | SATISFIED | `classifyChangeRequest` in intent-classifier.ts returns one of 5 structured intents. Claude API prompt defines all 4 categories plus `ambiguous`. |
| INTAKE-03 | 16-01 | System extracts target scene number from message ("scene 3", "the third one") | SATISFIED | Claude API prompt includes ORDINAL MAP and SCENE MATCHING RULES. `sceneNumber` field in `ChangeRequestClassification`. Handler treats null `sceneNumber` on `scene-change` as ambiguous and asks clarifying question. |
| INTAKE-04 | 16-02 | System shows credit cost estimate and gets customer confirmation via WhatsApp poll before any generation | SATISFIED | `sendPoll` called with `$X.XX` cost string for `scene-change` and `character-change`. `handleChangeRequestPollVote` explicitly avoids BullMQ dispatch. Status `confirmed` is set but no queue job dispatched. |
| CHAR-01 | 16-01 | System updates CharacterBible with requested changes and creates versioned record (old version preserved) | SATISFIED | `createCharacterBibleVersion` inserts new row with `version+1`, never updates the existing row. `changeDelta` JSONB records what changed. |

All 5 requirement IDs declared in plan frontmatter accounted for. No orphaned requirements mapped to Phase 16 in REQUIREMENTS.md that are missing from plans.

---

### Anti-Patterns Found

No blockers or stubs detected.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `intent-classifier.ts` | 182 | `COST_RATES.anthropic?.haiku_message ?? 0.02` — uses optional chain on `anthropic` key. If the key does not exist in COST_RATES, falls back to hardcoded `0.02`. | Info | Tracking only — does not affect correctness. Same fallback pattern used in other trackers. |

---

### Human Verification Required

#### 1. End-to-end WhatsApp change request flow

**Test:** Send a WhatsApp message to a test group that has a character video in `delivered` state (e.g. "I'd like scene 3 to have better lighting"). Observe whether ClaudeClaw routes to `handleChangeRequest` and a cost poll appears.
**Expected:** A WhatsApp poll arrives in the group: "Regenerating scene 3 will cost $1.00. Proceed?" — no generation begins.
**Why human:** Requires live WAHA session, a group in `delivered` phase state, and an active Anthropic API key.

#### 2. Poll vote confirmation — no generation dispatched

**Test:** Vote "Yes" on a cost-estimate poll and monitor BullMQ queues.
**Expected:** `change_requests` row flips to `status=confirmed`, a confirmation WhatsApp text is sent, no video generation job appears in any BullMQ queue.
**Why human:** Queue absence cannot be programmatically guaranteed without a live queue inspector (Bull Board or Redis scan).

#### 3. Character-change bible versioning

**Test:** Send a character-change message (e.g. "make her more professional-looking") and confirm Yes on the poll.
**Expected:** New `CharacterBible` row inserted with `version=N+1` and original row still present. Verify with DB query: `SELECT id, version, "createdAt" FROM "CharacterBible" WHERE "tenantId"='<test_id>' ORDER BY "createdAt" DESC`.
**Why human:** Requires live DB access and a group with an existing CharacterBible record.

---

### Gaps Summary

None. All 5 success criteria are verified, all 5 requirement IDs are satisfied, all key links are wired, and no stub patterns were found. The phase goal is fully achieved.

Phase 17 dependencies are correctly staged: `change_requests` rows with `status=confirmed` are the handoff point for the scene regen pipeline, and `characterBibleVersionId` is stored on the row for character-changes.

---

_Verified: 2026-03-15_
_Verifier: Claude (gsd-verifier)_
