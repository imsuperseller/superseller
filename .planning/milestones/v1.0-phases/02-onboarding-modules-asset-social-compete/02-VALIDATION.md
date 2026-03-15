---
phase: 2
slug: onboarding-modules-asset-social-compete
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npx vitest --run` |
| **Full suite command** | `cd apps/worker && npx vitest --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npx vitest --run`
- **After every plan wave:** Run `cd apps/worker && npx vitest --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | ASSET-01..04 | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/asset-collection.test.ts` | Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SOCIAL-01..04 | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/social-setup.test.ts` | Wave 0 | ⬜ pending |
| 02-01-03 | 01 | 1 | COMPETE-01..04 | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/competitor-research.test.ts` | Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | ALL | unit | `cd apps/worker && npx vitest --run src/services/onboarding/module-router.test.ts` | Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/services/onboarding/modules/asset-collection.test.ts` — stubs for ASSET-01..04
- [ ] `apps/worker/src/services/onboarding/modules/social-setup.test.ts` — stubs for SOCIAL-01..04
- [ ] `apps/worker/src/services/onboarding/modules/competitor-research.test.ts` — stubs for COMPETE-01..04
- [ ] `apps/worker/src/services/onboarding/module-router.test.ts` — routing logic tests

*Framework already installed. Existing test pattern in `prompt-assembler.test.ts` shows mocking strategy.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp media download | ASSET-03 | Requires live WAHA session | Send photo to test group, verify R2 upload |
| AgentForge trigger | COMPETE-04 | AgentForge not yet built | Verify data stored, trigger deferred |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
