---
phase: 17
slug: scene-level-regeneration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected (no jest.config, vitest.config, or test/ directory in worker) |
| **Config file** | None — Wave 0 installs |
| **Quick run command** | `cd apps/worker && npx jest --testPathPattern character-regen` |
| **Full suite command** | `cd apps/worker && npx jest` |
| **Estimated runtime** | ~5 seconds (unit tests only) |

---

## Sampling Rate

- **After every task commit:** `npx tsc --noEmit` (type checking — tests not available until Wave 0)
- **After every plan wave:** `npx tsc --noEmit` + manual verification via grep
- **Before `/gsd:verify-work`:** Full suite must be green (if Wave 0 completed)
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | REGEN-01, REGEN-02 | unit | `jest tests/character-regen.worker.test.ts -t "only regen target scene"` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | REGEN-01 | unit | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 17-02-01 | 02 | 2 | REGEN-03 | unit | `jest tests/character-regen.worker.test.ts -t "two messages only"` | ❌ W0 | ⬜ pending |
| 17-02-02 | 02 | 2 | REGEN-01, REGEN-03, ASSEM-01 | unit | `jest tests/character-regen.worker.test.ts -t "mixed scene assembly"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/tests/character-regen.worker.test.ts` — stubs for REGEN-01, REGEN-02, REGEN-03, ASSEM-01
- [ ] Test framework setup: `cd apps/worker && npm install --save-dev jest @types/jest ts-jest`
- [ ] `apps/worker/jest.config.ts` — ts-jest preset

*Existing worker codebase has no test infrastructure — all tests are Wave 0 gaps for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp video delivery plays correctly | REGEN-03 | Requires WAHA + actual WhatsApp | Trigger regen, verify video received in WhatsApp group |
| Remotion render visual quality | ASSEM-01 | Requires visual inspection | Download rendered MP4, verify mixed scenes display correctly |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
