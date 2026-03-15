---
phase: 15-tech-debt-fixes
verified: 2026-03-15T20:30:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 15: Tech Debt Fixes — Verification Report

**Phase Goal:** Load-bearing bugs that would corrupt budget gates and swallow generation failures are fixed before any iteration code ships
**Verified:** 2026-03-15T20:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | When a Remotion render fails after all retries, admin receives a WhatsApp message with the error and the customer receives a "our team will follow up" message — no silent failures | VERIFIED | `sendAdminAlert` + `sendCustomerFailureMessage` called at 5 terminal failure paths in `character-video-gen.ts` (lines 416, 504, 559, 842, 887). The broken `sendVideo(groupId, "", undefined)` is gone (grep count = 0). |
| 2 | Cost entries in `api_expenses` show the correct provider (`fal` or `kie.ai`) based on which model actually ran the job, not a hardcoded label | VERIFIED | Hardcoded `service: "kie.ai"` removed. `trackExpense` call at line 341 uses `normalizeProvider(sceneOutput.provider)`. `generateScene` returns `{ resultUrl, provider }` tuple propagated from `jobResult.provider`. |
| 3 | Pipelines missing `admin_phone` fall back to the configured default admin number rather than throwing a null error | VERIFIED | `pipeline-state.ts` line 204: `config.admin.defaultPhone` fallback. `config.ts` lines 151-153: `admin.defaultPhone` set from `ADMIN_PHONE` env var (with `HEALTH_MONITOR_ALERT_PHONE` as secondary fallback). Warning log fires when fallback used. |

**Score: 3/3 success criteria verified**

---

### Required Artifacts

| Artifact | Provides | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `apps/worker/src/services/admin-alerts.ts` | `sendAdminAlert()` and `sendCustomerFailureMessage()` utilities | Yes | Yes — 69 lines, exports both functions, non-blocking try/catch, imports `sendText`/`phoneToChatId`/`config` | Yes — imported in `character-video-gen.ts` line 33, called 5 times each | VERIFIED |
| `apps/worker/src/services/onboarding/modules/character-video-gen.ts` | Failure paths call `sendAdminAlert` + `sendCustomerFailureMessage` | Yes | Yes — 5 calls each confirmed, broken `sendVideo("")` removed | Yes — wired to admin-alerts and expense-tracker | VERIFIED |
| `apps/worker/src/services/onboarding/pipeline-state.ts` | Admin phone fallback to `ADMIN_PHONE` env var | Yes | Yes — `config.admin.defaultPhone` used at lines 201, 204 with warning log | Yes — `config` imported at line 13 | VERIFIED |
| `apps/worker/src/config.ts` | `admin.defaultPhone` config entry | Yes | Yes — `admin: { defaultPhone: process.env.ADMIN_PHONE \|\| process.env.HEALTH_MONITOR_ALERT_PHONE \|\| "" }` at lines 151-153 | Yes — consumed by admin-alerts.ts and pipeline-state.ts | VERIFIED |
| `apps/worker/src/services/expense-tracker.ts` | `PROVIDER_LABELS` map + `normalizeProvider()` function | Yes | Yes — `PROVIDER_LABELS` at lines 51-62 covering kie/kie.ai/fal/fal.ai/replicate/openai/anthropic/gemini/resend/r2. `normalizeProvider()` at lines 65-67 | Yes — imported in `character-video-gen.ts` line 28, called at line 341 | VERIFIED |
| `apps/worker/src/scripts/backfill-expense-providers.ts` | Migration script to fix misattributed `api_expenses` rows | Yes | Yes — 3 `UPDATE api_expenses` statements, idempotent, imports from `../db/client`, `process.exit(0/1)` | Standalone script — wiring not applicable | VERIFIED |

---

### Key Link Verification

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `character-video-gen.ts` | `admin-alerts.ts` | `import { sendAdminAlert, sendCustomerFailureMessage }` + 5 call sites each | WIRED | Line 33 import confirmed; grep count = 5 for each function |
| `pipeline-state.ts` | `config.ts` | `config.admin.defaultPhone` fallback | WIRED | `import { config }` at line 13; `config.admin.defaultPhone` used at lines 201 and 204 |
| `character-video-gen.ts` | `expense-tracker.ts` | `trackExpense({ service: normalizeProvider(sceneOutput.provider) })` | WIRED | Line 28 import confirmed; line 341 uses `normalizeProvider(sceneOutput.provider)`, not hardcoded string |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| DEBT-01 | 15-01-PLAN.md | Admin receives WhatsApp notification when render/composition fails (silent failure fix) | SATISFIED | 5 terminal failure paths wired with `sendAdminAlert` + `sendCustomerFailureMessage`. Broken `sendVideo(groupId, "")` removed. Admin phone fallback in `pipeline-state.ts`. |
| DEBT-02 | 15-02-PLAN.md | Cost tracking attributes fal.ai generations to correct provider (not kie.ai) | SATISFIED | `normalizeProvider(sceneOutput.provider)` replaces hardcoded `"kie.ai"`. `PROVIDER_LABELS` map normalizes all known provider strings. Backfill script corrects historical rows. |

No orphaned requirements — both DEBT-01 and DEBT-02 are claimed by plans and verified in code.

---

### Anti-Patterns Found

No anti-patterns detected in the files modified by this phase.

- No TODO/FIXME/PLACEHOLDER comments in admin-alerts.ts, expense-tracker.ts, or backfill-expense-providers.ts
- No stub return values (`return null`, `return {}`, `return []`)
- No console.log-only implementations (backfill script uses `console.log` for script output, which is appropriate for a CLI tool)
- Broken `sendVideo(groupId, "", undefined)` is confirmed removed (grep count = 0)

---

### Commits Verified

All 4 commits documented in summaries exist in git history:

| Commit | Message |
|--------|---------|
| `d76f627e` | feat(15-01): create admin-alerts utility and add ADMIN_PHONE config |
| `0f0b9598` | feat(15-01): wire failure alerts into character-video-gen terminal paths |
| `48d20112` | feat(15-02): add provider normalization map and fix cost tracking attribution |
| `ed4295ed` | feat(15-02): create backfill script for misattributed api_expenses rows |

---

### Human Verification Required

None. All success criteria are verifiable programmatically via code inspection.

One item is deferred to production operation rather than requiring human verification now:
- The backfill script (`backfill-expense-providers.ts`) must be run against the production database to correct historical rows. This is a one-time operational step documented in 15-02-SUMMARY.md and does not block phase goal achievement — it is a migration, not a code defect.

---

## Summary

Phase 15 goal is achieved. All three success criteria are verified against the actual codebase:

1. Silent failure elimination: `admin-alerts.ts` utility created and wired into all 5 terminal failure paths in `character-video-gen.ts`. The broken no-op `sendVideo("", undefined)` call is confirmed removed. Both admin (WhatsApp) and customer (group message) notifications are in place.

2. Cost attribution fix: The hardcoded `service: "kie.ai"` bug is gone. `generateScene` now returns `{ resultUrl, provider }` and the provider is propagated to `trackExpense` via `normalizeProvider()`. Future fal.ai jobs will be tracked under "fal", kie jobs under "kie". Backfill script ready for production run.

3. Admin phone null-safety: `pipeline-state.ts` falls back to `config.admin.defaultPhone` (populated from `ADMIN_PHONE` env var) rather than storing an empty string when no per-pipeline override is provided. Logs a warning when fallback is used.

No stubs, no orphaned artifacts, no missing links. Phase 16+ can ship without inheriting these load-bearing bugs.

---

_Verified: 2026-03-15T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
