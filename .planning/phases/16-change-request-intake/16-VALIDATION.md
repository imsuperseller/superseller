---
phase: 16
slug: change-request-intake
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `apps/worker/vite.config.ts` or inline in package.json |
| **Quick run command** | `cd apps/worker && npm test -- --reporter=verbose src/services/onboarding/intent-classifier.test.ts src/services/onboarding/character-bible-versioning.test.ts` |
| **Full suite command** | `cd apps/worker && npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npm test -- --reporter=verbose src/services/onboarding/intent-classifier.test.ts src/services/onboarding/character-bible-versioning.test.ts`
- **After every plan wave:** Run `cd apps/worker && npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | INTAKE-02, INTAKE-03 | unit | `cd apps/worker && npm test -- src/services/onboarding/intent-classifier.test.ts` | ❌ W0 | ⬜ pending |
| 16-01-02 | 01 | 1 | CHAR-01 | unit | `cd apps/worker && npm test -- src/services/onboarding/character-bible-versioning.test.ts` | ❌ W0 | ⬜ pending |
| 16-02-01 | 02 | 2 | INTAKE-01, INTAKE-04 | unit | `cd apps/worker && npm test -- src/services/onboarding/change-request-handler.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/services/onboarding/intent-classifier.test.ts` — stubs for INTAKE-02, INTAKE-03
- [ ] `apps/worker/src/services/onboarding/character-bible-versioning.test.ts` — stubs for CHAR-01
- [ ] `apps/worker/src/services/onboarding/change-request-handler.test.ts` — stubs for INTAKE-01, INTAKE-04

Pattern: mock `fetch` globally (`vi.stubGlobal("fetch", mockFetch)`), mock DB client (`vi.mock("../../db/client")`), mock logger — same pattern as `character-bible-generator.test.ts`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp poll renders correctly in WAHA | INTAKE-04 | WAHA API visual output | Send test poll via WAHA API, verify format in WhatsApp |
| Scene description fuzzy matching accuracy | INTAKE-03 | Requires Claude API | Test with various phrasings against real CharacterBible data |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
