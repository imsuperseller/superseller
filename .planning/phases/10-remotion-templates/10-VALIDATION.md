---
phase: 10
slug: remotion-templates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `apps/worker/vitest.config.ts` |
| **Quick run command** | `cd apps/worker && npm test` |
| **Full suite command** | `cd apps/worker && npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/worker && npm test`
- **After every plan wave:** Run `cd apps/worker && npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | TMPL-01, TMPL-03 | unit | `cd apps/worker && npm test` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | TMPL-02, TMPL-04 | smoke | `npx remotion compositions remotion/src/index.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/worker/src/__tests__/before-after-props.test.ts` — Zod schema validation for TMPL-01, TMPL-03
- [ ] No framework install needed — Vitest already configured

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wipe transition visual quality | TMPL-01 | Remotion hooks require renderer context — can't mount component in Vitest | Render locally via `npx remotion render remotion/src/index.ts BeforeAfter-16x9 out/test.mp4` and inspect video |
| 9x16 vertical wipe direction | TMPL-02 | Visual verification — vertical vs horizontal wipe | Render `BeforeAfter-9x16`, verify video is 1080x1920 with top-to-bottom wipe |
| Props render visibly (not defaults) | TMPL-03 | Visual — text, colors, images must appear in rendered output | Render with custom brandColor, serviceLabel, check they appear |
| renderComposition completes | TMPL-04 | Integration test on RackNerd with real Remotion renderer | Run `renderComposition('BeforeAfter-16x9', testProps)` on server |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
