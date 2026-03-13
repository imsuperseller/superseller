---
phase: 03-character-questionnaire
plan: 01
subsystem: onboarding-modules
tags: [character-questionnaire, character-bible, claude-api, state-machine, tdd]
dependency_graph:
  requires:
    - 02-01 (module types + state DB + router foundation)
    - 02-03 (competitor-research pattern reference)
  provides:
    - character-questionnaire OnboardingModule (activates for VideoForge/Winner Studio/Character-in-a-Box)
    - generateCharacterBible function (Claude-powered CharacterBible DB insert)
  affects:
    - module-router.ts (new registry entry)
    - modules/types.ts (expanded ModuleType union)
tech_stack:
  added:
    - character-questionnaire state machine (9-phase conversational flow)
    - fetch-based Claude API call (claude-sonnet-4-20250514)
  patterns:
    - OnboardingModule interface implementation
    - TDD red/green cycle for both files
    - Vague answer detection (< 10 chars threshold)
    - Competitor-research scenario collection pattern adapted for character scenarios
key_files:
  created:
    - apps/worker/src/services/onboarding/modules/character-questionnaire.ts
    - apps/worker/src/services/onboarding/modules/character-questionnaire.test.ts
    - apps/worker/src/services/onboarding/character-bible-generator.ts
    - apps/worker/src/services/onboarding/character-bible-generator.test.ts
  modified:
    - apps/worker/src/services/onboarding/modules/types.ts (added "character-questionnaire" to ModuleType union)
    - apps/worker/src/services/onboarding/module-router.ts (new MODULE_REGISTRY entry + INTRO_MESSAGES)
    - apps/worker/src/services/onboarding/module-router.test.ts (updated for new module priority)
decisions:
  - Used direct fetch instead of @anthropic-ai/sdk (sdk not installed in worker, worker uses fetch pattern)
  - character-questionnaire placed between asset-collection and social-setup in MODULE_REGISTRY (higher priority for video customers)
  - Vague threshold is 10 chars (matches plan spec) applied only to personality/visual_style/audience (not name/scenarios)
  - JSON parse fallback uses raw text as personaDescription (graceful degradation)
metrics:
  duration: 22min
  completed: "2026-03-13"
  tasks: 2
  files_created: 4
  files_modified: 3
  tests_added: 27
requirements_satisfied: [CHAR-01, CHAR-02, CHAR-03, CHAR-04]
---

# Phase 03 Plan 01: Character Questionnaire Module Summary

**One-liner:** Conversational WhatsApp state machine for brand character interview (9 phases) + Claude-powered CharacterBible DB generation via direct fetch API.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Character questionnaire module with state machine | cbb0207b | types.ts, character-questionnaire.ts, character-questionnaire.test.ts, module-router.ts |
| 2 | CharacterBible generator via Claude API | df1329e6 | character-bible-generator.ts, character-bible-generator.test.ts, module-router.test.ts |

## What Was Built

### Task 1: Character Questionnaire Module

`character-questionnaire.ts` implements `OnboardingModule` with a 9-phase state machine:

- **intro** — any message triggers transition to asking_name
- **asking_name** — stores character name, advances to asking_personality
- **asking_personality** — vague answer (< 10 chars) gets follow-up; valid answer advances to asking_visual_style
- **asking_visual_style** — same vague detection; advances to asking_audience
- **asking_audience** — same vague detection; advances to asking_scenarios
- **asking_scenarios** — collects up to 3 scenarios; "done" shortcut at any point (1+ required); auto-advances at 3
- **confirming** — shows full summary; "yes" calls generateCharacterBible + transitions to complete; "no" resets to asking_name
- **complete** — acknowledges with next steps message

`shouldActivate` returns true for VideoForge, Winner Studio, Character-in-a-Box (case-insensitive match).

Registered in MODULE_REGISTRY between asset-collection (priority 1) and social-setup (priority 3).

### Task 2: CharacterBible Generator

`character-bible-generator.ts` exports `generateCharacterBible(tenantId, data)`:

1. Builds structured Claude prompt with all 5 questionnaire fields
2. Calls `https://api.anthropic.com/v1/messages` via fetch (claude-sonnet-4-20250514, max_tokens: 1500)
3. Parses JSON response into CharacterBible fields (personaDescription, visualStyle, soraHandle, metadata)
4. Falls back to raw text as personaDescription if JSON is malformed
5. INSERTs into "CharacterBible" DB table via raw SQL, returns the new ID
6. Returns null on any failure (Claude error, network error, DB error, missing API key)

## Test Coverage

- **character-questionnaire.test.ts**: 20 tests — shouldActivate (5), getIntroMessage (1), all state machine phases (14)
- **character-bible-generator.test.ts**: 7 tests — valid JSON parse, structured DB insert, malformed JSON fallback, Claude 429 error, network error, DB error, missing API key

Total new tests: 27. All 83 onboarding tests pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] module-router.test.ts regression from new module**
- **Found during:** Task 2 verification (full onboarding test suite)
- **Issue:** Adding character-questionnaire between asset-collection and social-setup caused "activates next module in priority order" test to get character-questionnaire instead of social-setup — the mock only had 2 `mockResolvedValueOnce` calls but now 3 modules need checking for VideoForge+SocialHub products
- **Fix:** Added third `mockResolvedValueOnce` returning character-questionnaire=complete, plus added `vi.mock("./modules/character-questionnaire", ...)` to the mock registry
- **Files modified:** `apps/worker/src/services/onboarding/module-router.test.ts`
- **Commit:** df1329e6

**2. [Rule 2 - Missing functionality] @anthropic-ai/sdk not installed in worker**
- **Found during:** Task 2 implementation
- **Issue:** Plan specified `import Anthropic from "@anthropic-ai/sdk"` but worker only has `@anthropic-ai/claude-agent-sdk`. SDK pattern not available.
- **Fix:** Used direct fetch approach (matching existing `follower-research.ts` pattern in same codebase). No behavior difference — same Claude API, same response format.
- **Files modified:** `character-bible-generator.ts`

## Self-Check: PASSED

Files verified:
- FOUND: apps/worker/src/services/onboarding/modules/character-questionnaire.ts
- FOUND: apps/worker/src/services/onboarding/modules/character-questionnaire.test.ts
- FOUND: apps/worker/src/services/onboarding/character-bible-generator.ts
- FOUND: apps/worker/src/services/onboarding/character-bible-generator.test.ts

Commits verified:
- FOUND: cbb0207b (feat(03-01): character questionnaire module with state machine)
- FOUND: df1329e6 (feat(03-01): CharacterBible generator via Claude API + test fixes)
