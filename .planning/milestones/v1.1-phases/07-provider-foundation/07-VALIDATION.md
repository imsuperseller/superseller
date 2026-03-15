---
phase: 07
slug: provider-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (configured in `apps/worker/vitest.config.ts`) |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npm test -- --reporter=verbose src/services/model-router/router.test.ts` |
| **Full suite command** | `cd apps/worker && npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npm test -- --reporter=verbose src/services/model-router/router.test.ts`
- **After every plan wave:** Run `cd apps/worker && npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | PROV-08 | manual | Check DECISIONS.md content | N/A | ⬜ pending |
| 07-01-02 | 01 | 1 | PROV-03 | unit | `cd apps/worker && npm test -- router.test.ts` | ✅ needs new case | ⬜ pending |
| 07-02-01 | 02 | 1 | PROV-05 | smoke | DB seed verification query | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 1 | PROV-06 | unit | `cd apps/worker && npm test -- expense-tracker` | ❌ W0 | ⬜ pending |
| 07-02-03 | 02 | 1 | PROV-07 | unit | `cd apps/worker && npm test -- input-validator` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/services/model-router/input-validator.test.ts` — stubs for PROV-07 (webp reject, HEAD 404 reject, valid jpg pass)
- [ ] `apps/worker/src/services/expense-tracker.test.ts` — stubs for PROV-06 (fal block exists, correct keys)
- [ ] New test case in `apps/worker/src/services/model-router/router.test.ts` — PROV-03 Observatory provider override path
- [ ] DB seed verification script for PROV-05 (ai_models rows for Sora 2, Wan 2.6, Veo 3.1)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DECISIONS.md contains Veo 3.1 re-integration entry | PROV-08 | Documentation change, not code | Check DECISIONS.md for dated entry reversing Feb 2026 Kling-only mandate |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
