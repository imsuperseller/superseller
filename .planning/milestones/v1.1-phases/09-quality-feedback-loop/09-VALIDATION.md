---
phase: 09
slug: quality-feedback-loop
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npx vitest run src/services/quality-feedback/` |
| **Full suite command** | `cd apps/worker && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npx vitest run src/services/quality-feedback/`
- **After every plan wave:** Run `cd apps/worker && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | QUAL-01 | unit | `cd apps/worker && npx vitest run src/services/quality-feedback/generation-meta.test.ts` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | QUAL-05 | unit | `cd apps/worker && npx vitest run src/services/quality-feedback/cost-attribution.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | QUAL-02 | unit | `cd apps/worker && npx vitest run src/services/quality-feedback/aggregation-job.test.ts` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | QUAL-03 | unit | same | ❌ W0 | ⬜ pending |
| 09-02-03 | 02 | 1 | QUAL-06 | unit | `cd apps/worker && npx vitest run src/services/model-router/router.test.ts` | ✅ extend | ⬜ pending |
| 09-03-01 | 03 | 2 | QUAL-04 | integration | `cd apps/web/superseller-site && npx vitest run src/app/api/admin/prompt-effectiveness/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/services/quality-feedback/generation-meta.test.ts` — stubs for QUAL-01
- [ ] `apps/worker/src/services/quality-feedback/cost-attribution.test.ts` — stubs for QUAL-05
- [ ] `apps/worker/src/services/quality-feedback/aggregation-job.test.ts` — stubs for QUAL-02, QUAL-03

*Existing router.test.ts covers QUAL-06 requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Nightly job fires at 03:00 UTC | QUAL-02 | Requires waiting for scheduled time | Check BullMQ dashboard or PM2 logs at 03:00 UTC |
| Router uses real Observatory scores | QUAL-06 | Requires 20+ real generations in DB | After sufficient data accumulates, verify routeShot picks model with highest aggregated score |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
