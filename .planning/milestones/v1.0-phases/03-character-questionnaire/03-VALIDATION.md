---
phase: 3
slug: character-questionnaire
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npx vitest --run src/services/onboarding/modules/character-questionnaire.test.ts` |
| **Full suite command** | `cd apps/worker && npx vitest --run src/services/onboarding/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npx vitest --run src/services/onboarding/`
- **After every plan wave:** Run `cd apps/worker && npx vitest --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | CHAR-01..03 | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/character-questionnaire.test.ts` | Wave 0 | ⬜ pending |
| 03-01-02 | 01 | 1 | CHAR-04 | unit | `cd apps/worker && npx vitest --run src/services/onboarding/character-bible-generator.test.ts` | Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/services/onboarding/modules/character-questionnaire.test.ts` — stubs for CHAR-01..03
- [ ] `apps/worker/src/services/onboarding/character-bible-generator.test.ts` — stubs for CHAR-04

*Framework already installed. Existing test pattern in Phase 2 modules shows mocking strategy.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Claude generates coherent CharacterBible | CHAR-04 | LLM output quality | Review generated bible fields for completeness and relevance |
| Questionnaire conversation flow | CHAR-02 | Multi-turn WhatsApp interaction | Send test messages to group, verify state progression |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
