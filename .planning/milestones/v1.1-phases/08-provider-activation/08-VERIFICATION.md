---
phase: 08-provider-activation
verified: 2026-03-15T01:10:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 08: Provider Activation Verification Report

**Phase Goal:** Real video generations flow through fal.ai (Sora 2 and Wan 2.6) and Veo 3.1 dialogue shots work end-to-end, with long-running jobs handled via webhook (not polling timeout)
**Verified:** 2026-03-15T01:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A shot routed to fal.ai produces a completed video via FalAdapter using the correct model ID (fal-ai/sora-2/image-to-video/pro or wan/v2.6/image-to-video) | VERIFIED | fal-adapter.ts:_buildRequestBody() branches on modelId; SHOT_DEFAULT_MODELS.environment='fal-ai/sora-2/image-to-video/pro', .social='wan/v2.6/image-to-video'; 48 adapter tests pass |
| 2 | POST /api/webhooks/fal receives fal.ai callbacks, is idempotent on request_id, and updates the job record on completion | VERIFIED | fal-webhook.ts exists with processedRequestIds Set, falRequestRegistry lookup, trackExpense on OK; 8 webhook tests pass; mounted in routes.ts |
| 3 | A dialogue shot type routed to Veo 3.1 calls POST /api/v1/veo/generate (not the Kling task endpoint) and polls at /api/v1/veo/record-info until complete | VERIFIED | kie-adapter.ts:_submitVeoJob calls createVeoTask (which POSTs to /api/v1/veo/generate); pollStatus branches on 'veo::' prefix to call getVeoTaskStatus (which GETs /api/v1/veo/record-info); all tests pass |

**Score:** 3/3 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/worker/src/services/model-router/provider-adapters/fal-adapter.ts` | Model-specific request bodies + webhook_url injection | VERIFIED | _buildRequestBody() with Sora 2 / Wan 2.6 / default branches; webhook_url top-level when WORKER_PUBLIC_URL set; falRequestRegistry exported |
| `apps/worker/src/api/fal-webhook.ts` | Express route for fal.ai webhook callbacks | VERIFIED | Exports falWebhookRouter; POST /webhooks/fal; 200 ack-then-process; ED25519 gated behind FAL_WEBHOOK_VERIFY; idempotency Set |
| `apps/worker/src/api/fal-webhook.test.ts` | Tests for webhook handler (ack, idempotency, signature) | VERIFIED | 8 tests; 214 lines; covers 200 ack, completion, error, idempotency x2, sig-verify x2, bypass |
| `apps/worker/src/services/model-router/provider-adapters/kie-adapter.ts` | Veo 3.1 branch in submitJob and pollStatus | VERIFIED | _submitVeoJob calls createVeoTask; pollStatus branches on 'veo::' prefix; backward-compat Kling path unchanged |
| `apps/worker/src/services/model-router/shot-types.ts` | Fixed dialogue modelId matching DB ('veo-3.1-fast/video') | VERIFIED | SHOT_DEFAULT_MODELS.dialogue.modelId = 'veo-3.1-fast/video'; environment = 'fal-ai/sora-2/image-to-video/pro'; social = 'wan/v2.6/image-to-video' |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| fal-adapter.ts | fal.ai queue API | webhook_url in submitJob body | WIRED | Line 75-77: `WORKER_PUBLIC_URL/api/webhooks/fal`; test at adapters.test.ts:572 asserts presence at body top-level |
| fal-webhook.ts | routes.ts | apiRouter.use(falWebhookRouter) | WIRED | routes.ts line 26: import; line 38: apiRouter.use(falWebhookRouter) confirmed |
| kie-adapter.ts | kie.ts | import createVeoTask, getVeoTaskStatus | WIRED | Line 8: explicit named import; _submitVeoJob calls createVeoTask; pollStatus calls getVeoTaskStatus |
| SHOT_DEFAULT_MODELS.dialogue.modelId | DB ai_models table | string match 'veo-3.1-fast/video' | WIRED | shot-types.ts line 47; test asserts exact match; DB row seeded in Phase 07 |
| router.ts | FalAdapter | 'wan/' prefix recognized as fal provider | WIRED | router.ts line 125: `startsWith('fal-ai/') || startsWith('wan/')` — Wan 2.6 routes correctly to FalAdapter |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PROV-01 | 08-01-PLAN.md | System can route shots to fal.ai provider with correct model IDs (sora-2/image-to-video/pro, wan/v2.6/image-to-video) | SATISFIED | FalAdapter._buildRequestBody() branches for Sora 2 and Wan 2.6; SHOT_DEFAULT_MODELS uses correct model IDs; 48 adapter tests pass |
| PROV-02 | 08-01-PLAN.md | System can receive fal.ai webhook callbacks for long-running generations (>10min) | SATISFIED | POST /api/webhooks/fal mounted; immediate 200 ack; idempotency via Set; falRequestRegistry cross-module lookup; 8 webhook tests pass |
| PROV-04 | 08-02-PLAN.md | System can generate dialogue/talking-head video via Veo 3.1 on kie.ai (/api/v1/veo/generate) | SATISFIED | KieAdapter._submitVeoJob calls createVeoTask which POSTs to /api/v1/veo/generate; pollStatus calls getVeoTaskStatus at /api/v1/veo/record-info; 6 Veo-specific tests pass |

No orphaned requirements — all three IDs declared in plan frontmatter map to verified implementation.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| fal-webhook.ts | 209-211 | Body reconstructed from JSON.stringify(req.body) for signature — comment notes this is inaccurate for production sig check | Info | FAL_WEBHOOK_VERIFY defaults to 'false'; production use requires express.raw() middleware before route. Known issue, documented in code. |

No blockers. No placeholders. No stub returns. No TODO/FIXME blocking production paths.

---

### Human Verification Required

#### 1. Live fal.ai webhook callback

**Test:** Set WORKER_PUBLIC_URL, submit a real Sora 2 or Wan 2.6 job via FalAdapter, wait for completion
**Expected:** Worker logs show "FalWebhook: job completed" with requestId; trackExpense called
**Why human:** Requires live fal.ai credentials and a real API round-trip; ED25519 exact message format can only be validated with real fal.ai delivery headers

#### 2. Live Veo 3.1 dialogue generation

**Test:** Submit a dialogue shot via routeShot() with budgetTier='standard'; check logs
**Expected:** Logs show "KieAdapter: veo job submitted" with taskId; subsequent pollStatus calls getVeoTaskStatus; completion returns video_url
**Why human:** Requires live kie.ai credentials and real API call to /api/v1/veo/generate

---

### Test Suite Results (Verified Live)

```
src/services/model-router/provider-adapters/adapters.test.ts  48 tests PASS
src/api/fal-webhook.test.ts                                    8 tests PASS
Total: 56 tests, 0 failures
```

Coverage includes:
- Sora 2 numeric duration enum (4/8/12/16/20) with snapToNearest clamping
- Sora 2 delete_video:false mandatory flag
- Wan 2.6 string duration enum ('5'/'10'/'15') with clamping + stringify
- webhook_url top-level presence/absence per WORKER_PUBLIC_URL
- falRequestRegistry populated at submitJob, consumed by webhook handler
- 200 immediate ack regardless of body
- Idempotency: duplicate request_id skipped (verified with mock.calls count assertion)
- ED25519 signature rejection path (gated by FAL_WEBHOOK_VERIFY=true)
- KieAdapter Veo routing: createVeoTask called, externalJobId starts with 'veo::'
- KieAdapter pollStatus: 'veo::' prefix routes to getVeoTaskStatus with stripped taskId
- Backward-compat: non-veo modelIds still call createKlingTask/getTaskStatus('kling')
- SHOT_DEFAULT_MODELS assertions: all three model IDs match DB and real API paths

---

### Gap Summary

No gaps. All must-haves are verified at all three levels (exists, substantive, wired). All 56 unit tests pass. All three requirement IDs (PROV-01, PROV-02, PROV-04) are satisfied. The only unverifiable items are live API round-trips which require human verification with real credentials.

---

_Verified: 2026-03-15T01:10:00Z_
_Verifier: Claude (gsd-verifier)_
