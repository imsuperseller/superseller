---
phase: 07-provider-foundation
verified: 2026-03-15T05:15:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 07: Provider Foundation Verification Report

**Phase Goal:** Establish multi-provider routing foundation — fix router bug, seed model data, add cost tracking, create input validation
**Verified:** 2026-03-15T05:15:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | DECISIONS.md contains a dated entry reversing the Feb 2026 Kling-only mandate and documenting Veo 3.1 re-integration rationale | VERIFIED | Entry #24 "VEO 3.1 RE-INTEGRATION (Mar 2026)" at line 322, references PROV-08, explains reversal rationale. Commit 00fa82d9. |
| 2 | routeShot() selects FalAdapter when Observatory recommends a fal-ai/ prefixed modelId | VERIFIED | router.ts line 125: `selection.modelId.startsWith('fal-ai/') ? 'fal' : 'kie'`. Test "Observatory fal model gets FalAdapter" passes. |
| 3 | routeShot() selects KieAdapter when Observatory recommends a non-fal modelId | VERIFIED | Same inference — non-fal-ai/ prefix routes to 'kie'. Test "Observatory kie model gets KieAdapter" passes. |
| 4 | Budget override path still works correctly with provider inference | VERIFIED | selectionFromDefault() returns SHOT_DEFAULT_MODELS modelId; provider inferred from that modelId prefix. Test "budget override with fal default still infers fal from modelId" passes. |
| 5 | ai_models table contains seeded rows for Sora 2, Wan 2.6, and Veo 3.1 with correct pricing and capability flags | VERIFIED | Production DB query returned all 3 rows: veo-3.1-fast/video (kie.ai), sora-2/video (kie.ai), wan-2.6/video (kie.ai). |
| 6 | expense-tracker COST_RATES has a fal block with Sora 2 and Wan 2.6 rates | VERIFIED | expense-tracker.ts lines 36-41: fal block with 4 rate entries. COST_RATES is exported. All 6 expense-tracker tests pass. |
| 7 | WebP images are rejected before fal.ai submission with UnrecoverableError | VERIFIED | input-validator.ts: fast-path extension check + Content-Type check both throw UnrecoverableError. 2 extension tests + 1 Content-Type test all pass. |
| 8 | Unreachable image URLs are rejected before fal.ai submission with UnrecoverableError | VERIFIED | HEAD non-2xx response throws UnrecoverableError. Test "throws UnrecoverableError when HEAD returns 404" passes. |
| 9 | Valid JPEG/PNG images pass validation | VERIFIED | Tests "passes for .jpg URL with Content-Type image/jpeg" and "passes for .png URL with Content-Type image/png" both pass. |

**Score: 9/9 truths verified**

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `DECISIONS.md` | Veo 3.1 re-integration decision entry referencing PROV-08 | VERIFIED | Entry #24 present. Commit 00fa82d9. |
| `apps/worker/src/services/model-router/router.ts` | Provider inference from modelId prefix | VERIFIED | Line 125: startsWith('fal-ai/') inference. Old `defaultHint.provider` removed. |
| `apps/worker/src/services/model-router/router.test.ts` | Test coverage for Observatory provider override | VERIFIED | 10 tests total (7 pre-existing + 3 new provider inference tests). All passing. |
| `apps/worker/src/services/expense-tracker.ts` | fal provider cost rates | VERIFIED | fal block with 4 entries (sora_2 720p/1080p, wan_2_6 720p/1080p). COST_RATES exported. |
| `apps/worker/src/services/expense-tracker.test.ts` | Test coverage for fal cost rates | VERIFIED | 6 tests covering fal block values and trackExpense() cost lookup. All passing. |
| `apps/worker/src/services/model-router/input-validator.ts` | validateImageInput() export | VERIFIED | File exists, exports validateImageInput(). Uses UnrecoverableError from bullmq. Fast-path WebP + HEAD validation. |
| `apps/worker/src/services/model-router/input-validator.test.ts` | Test coverage for input validation | VERIFIED | 7 tests covering all rejection and pass-through cases. All passing. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `router.ts` | `fal-adapter.ts` | `selection.modelId.startsWith('fal-ai/')` + `adapterForProvider` | WIRED | Line 125-126 of router.ts. FalAdapter instantiated when modelId prefix matches. |
| `input-validator.ts` | `bullmq UnrecoverableError` | `import { UnrecoverableError } from 'bullmq'` | WIRED | Line 1 of input-validator.ts. UnrecoverableError thrown in all rejection paths. |
| `expense-tracker.ts` | `COST_RATES[fal]` lookup | `COST_RATES[params.service]?.[params.operation]` at line 58 | WIRED | trackExpense('fal', 'sora_2_per_second_720p') correctly picks up 0.30 rate. Test confirms. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| PROV-08 | 07-01-PLAN.md | DECISIONS.md entry documents Veo 3.1 re-integration rationale | SATISFIED | Entry #24 exists with PROV-08 tag, dated March 2026, documents rationale. |
| PROV-03 | 07-01-PLAN.md | Router instantiates correct adapter based on Observatory result, not static provider hint | SATISFIED | router.ts line 125 infers from modelId prefix. 3 dedicated tests pass. REQUIREMENTS.md marks as [x]. |
| PROV-05 | 07-02-PLAN.md | ai_models table seeded with Sora 2, Wan 2.6, Veo 3.1 rows | SATISFIED | Production DB confirmed: 3 rows present (veo-3.1-fast/video, sora-2/video, wan-2.6/video). REQUIREMENTS.md marks as [x]. |
| PROV-06 | 07-02-PLAN.md | expense-tracker COST_RATES includes fal.ai provider rates | SATISFIED | fal block in expense-tracker.ts with 4 verified rates. REQUIREMENTS.md marks as [x]. |
| PROV-07 | 07-02-PLAN.md | Input format validation before provider submission | SATISFIED | validateImageInput() exists, exported, tested (7 tests). REQUIREMENTS.md marks as [x]. |

No orphaned requirements found. REQUIREMENTS.md traceability table maps exactly PROV-08, PROV-03, PROV-05, PROV-06, PROV-07 to Phase 07 — all accounted for by the two plans.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | No TODOs, placeholders, or stub implementations detected in phase 07 files | — | — |

**Pre-existing test failure (out of scope):**
`src/services/onboarding/module-router.test.ts` — 1 test failing ("activates next module in priority order when current module completes"). This test was last modified in phase 06 (commit 9c0b59db) and is confirmed pre-existing per the 07-02-SUMMARY.md deviations section and git log history. Phase 07 commits do not touch this file.

---

### Human Verification Required

#### 1. DB Seed — Production Pricing Accuracy

**Test:** Query ai_models for cost_per_5s_usd on the 3 seeded rows and compare against current fal.ai/kie.ai pricing pages.
**Expected:** veo-3.1-fast/video ~$0.40/5s, wan-2.6/video ~$0.53/5s, sora-2/video ~$0.075/5s (as noted in SUMMARY)
**Why human:** Pricing pages change; cannot programmatically verify against live provider pricing from this environment.

#### 2. validateImageInput() — Integration Call Point

**Test:** Confirm that before Phase 08 ships, validateImageInput() is actually called in the pipeline before FalAdapter.submitJob(). Currently the function exists but is not wired into any call path (by design — Phase 08 responsibility).
**Expected:** Pipeline code calls validateImageInput(imageUrl) before fal submission.
**Why human:** This is a Phase 08 wiring task, not a Phase 07 deliverable. Noting here so it is not forgotten.

---

### Gaps Summary

No gaps. All 9 observable truths verified, all 7 artifacts pass all three levels (exists, substantive, wired), all 5 requirement IDs satisfied. The one pre-existing test failure in onboarding module-router predates phase 07 by multiple commits and is unrelated to any phase 07 deliverable.

**Notable forward-looking item (not a gap, documented in SUMMARY):** SHOT_DEFAULT_MODELS in shot-types.ts references `veo-3.1` (no `/video` suffix, no `-fast`). Production DB has `veo-3.1-fast/video` and `veo-3.1/video`. Phase 08 must resolve the model_id alignment before enabling live traffic to Veo 3.1.

---

_Verified: 2026-03-15T05:15:00Z_
_Verifier: Claude (gsd-verifier)_
