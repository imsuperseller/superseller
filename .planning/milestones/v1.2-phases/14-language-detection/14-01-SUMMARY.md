---
phase: 14-language-detection
plan: "01"
subsystem: agent-prompts
tags: [whatsapp, hebrew, bilingual, claude, system-prompt, onboarding, claudeclaw, character-pipeline]

# Dependency graph
requires:
  - phase: 13-voice-note-transcription
    provides: voice message transcription feeding into the same prompt paths this plan enhances
provides:
  - Detailed bilingual language detection instructions in all 4 agent prompt paths
  - Hebrew/English auto-detection per message across onboarding, registered groups, ClaudeClaw DMs, and character pipeline
affects:
  - Any future prompt changes to prompt-assembler, group-agent, claudeclaw-router, group-bootstrap

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Multi-paragraph language section in Claude system prompts covering: detect/match, mixed-language, technical terms, RTL formatting, tone consistency, first-message default"
    - "Group language config: fixed (he/en) branches get sub-instructions too, not just adaptive branch"

key-files:
  created: []
  modified:
    - apps/worker/src/services/onboarding/prompt-assembler.ts
    - apps/worker/src/services/group-agent.ts
    - apps/worker/src/services/claudeclaw-router.ts
    - apps/worker/src/services/character-pipeline/group-bootstrap.ts

key-decisions:
  - "All language instructions written in English only — no dual-language prompts (per prior user decision)"
  - "WhatsApp handles RTL rendering natively — no Unicode RTL markers emitted from our code"
  - "Technical English terms (AI, API, WhatsApp, video) kept in English even in Hebrew responses"
  - "First message in a new group defaults to English; switches to customer language from first reply"

patterns-established:
  - "Language section is always last in system prompts (after Rules, Memory, Customer Context)"
  - "Fixed-language groups (he/en) also receive formatting and technical-terms sub-instructions for completeness"

requirements-completed:
  - LANG-01
  - LANG-02
  - LANG-03
  - LANG-04

# Metrics
duration: 10min
completed: 2026-03-15
---

# Phase 14 Plan 01: Language Detection Summary

**Bilingual Hebrew/English auto-detection added to all 4 agent prompt paths (onboarding, registered groups, ClaudeClaw personal/business DMs, character pipeline) with RTL handling, technical-term rules, and first-message default**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-15T18:20:00Z
- **Completed:** 2026-03-15T18:30:55Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- prompt-assembler.ts: single-line language instruction replaced with 6-point bilingual section covering detect/match, mixed-language handling, Hebrew technical terms, RTL formatting, tone consistency, and first-message default
- group-agent.ts: all 3 language branches (he/en/adaptive) expanded with comprehensive sub-instructions — fixed branches now also receive formatting and technical-term guidance
- claudeclaw-router.ts: PERSONAL_SYSTEM_PROMPT and BUSINESS_SYSTEM_PROMPT both receive language detection instructions tailored to personal-assistant and business-assistant modes
- group-bootstrap.ts: single-line language hint replaced with full ## Language section in QUESTIONNAIRE_SYSTEM_PROMPT

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance onboarding and registered-group language prompts** - `b6c6ae0d` (feat)
2. **Task 2: Add language instructions to ClaudeClaw router and character pipeline** - `5565e278` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `apps/worker/src/services/onboarding/prompt-assembler.ts` - Replaced 1-line language section with 6-instruction bilingual block
- `apps/worker/src/services/group-agent.ts` - Expanded all 3 language branches with sub-instructions
- `apps/worker/src/services/claudeclaw-router.ts` - Appended language instruction to PERSONAL and BUSINESS system prompts
- `apps/worker/src/services/character-pipeline/group-bootstrap.ts` - Replaced single-line language hint with full ## Language section in QUESTIONNAIRE_SYSTEM_PROMPT

## Decisions Made
- All instructions stay in English (no dual-language prompts) — per prior user decision, Claude processes English instructions and outputs in target language
- WhatsApp handles RTL rendering natively — no Unicode markers or special formatting emitted
- Technical English terms (AI, API, deploy, WhatsApp, video, branding) kept in English in Hebrew responses
- First message defaults to English, switches to customer language from first reply

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compiled cleanly on both tasks.

## User Setup Required

None - no external service configuration required. Changes take effect on next worker deploy.

## Next Phase Readiness

- All 4 agent paths are now bilingual-ready
- Phase 14 plan 01 is the only plan in this phase — phase complete
- Worker can be deployed to RackNerd to activate Hebrew/English detection for all customers

---
*Phase: 14-language-detection*
*Completed: 2026-03-15*
