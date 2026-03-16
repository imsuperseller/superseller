---
phase: 18
slug: character-level-changes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (config: `apps/worker/vitest.config.ts`) |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npm test -- --reporter=verbose src/services/onboarding/character-level-changes.test.ts` |
| **Full suite command** | `cd apps/worker && npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** `cd apps/worker && npm test -- src/services/onboarding/character-level-changes.test.ts`
- **After every plan wave:** `cd apps/worker && npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | CHAR-02 | unit | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 18-01-02 | 01 | 1 | CHAR-02, CHAR-03, CHAR-04 | unit | `npm test -- src/services/onboarding/character-level-changes.test.ts` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 2 | CHAR-03, CHAR-04 | unit | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 18-02-02 | 02 | 2 | CHAR-02, ASSEM-02 | unit | `npm test -- src/queue/workers/character-regen.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/services/onboarding/character-level-changes.test.ts` — covers CHAR-02 (classifyChangeDelta visual/non-visual), CHAR-03 (admin review send), CHAR-04 (admin poll vote handling), name-only shortcut
- [ ] `apps/worker/src/queue/workers/character-regen.test.ts` — covers ASSEM-02 (post-delivery poll), multi-scene loop happy path

*Vitest assumed installed from Plan 01 Task 2 setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin receives WhatsApp review notification | CHAR-03 | Requires WAHA + real WhatsApp | Trigger character-change, verify admin gets diff message + poll |
| Admin poll vote routes correctly | CHAR-04 | Requires admin WhatsApp session | Admin votes "Approve all", verify regen dispatches |
| Post-delivery approve/change poll works | ASSEM-02 | Requires WhatsApp delivery | Verify customer gets poll after regen video |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
