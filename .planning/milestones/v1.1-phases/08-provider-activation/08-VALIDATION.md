---
phase: 08
slug: provider-activation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npx vitest run src/services/model-router/` |
| **Full suite command** | `cd apps/worker && npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npx vitest run src/services/model-router/`
- **After every plan wave:** Run `cd apps/worker && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | PROV-01 | unit | `cd apps/worker && npx vitest run src/services/model-router/provider-adapters/adapters.test.ts` | ✅ extend | ⬜ pending |
| 08-01-02 | 01 | 1 | PROV-01 | unit | same | ✅ extend | ⬜ pending |
| 08-01-03 | 01 | 1 | PROV-02 | unit | `cd apps/worker && npx vitest run src/api/fal-webhook.test.ts` | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | PROV-02 | unit | same | ❌ W0 | ⬜ pending |
| 08-01-05 | 01 | 1 | PROV-02 | unit | same | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 1 | PROV-04 | unit | `cd apps/worker && npx vitest run src/services/model-router/provider-adapters/adapters.test.ts` | ✅ extend | ⬜ pending |
| 08-02-02 | 02 | 1 | PROV-04 | unit | same | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/api/fal-webhook.test.ts` — stubs for PROV-02 (webhook handler: 200 ack, idempotency, signature rejection)

*Existing test infrastructure (adapters.test.ts, setup.ts) covers PROV-01 and PROV-04 requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sora 2 end-to-end test job | PROV-01 | Requires live fal.ai API call + real credit spend | Submit single test job with known good R2 image, verify webhook delivery, check video URL accessible |
| Wan 2.6 end-to-end test job | PROV-01 | Requires live fal.ai API call | Submit after Sora 2 passes, verify string duration accepted |
| Veo 3.1 dialogue test job | PROV-04 | Requires live Kie.ai API call | Submit dialogue shot, verify createVeoTask called, poll returns video |
| fal.ai webhook HTTPS delivery | PROV-02 | Requires public HTTPS endpoint on RackNerd | Confirm WORKER_PUBLIC_URL resolves, fal.ai delivers callback |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
