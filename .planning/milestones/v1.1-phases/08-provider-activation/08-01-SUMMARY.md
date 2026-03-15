---
phase: 08-provider-activation
plan: 01
subsystem: api
tags: [fal-ai, sora-2, wan-2.6, webhook, ed25519, idempotency, tdd, vitest, express]

# Dependency graph
requires:
  - phase: 07-provider-foundation
    provides: FalAdapter base class, validateImageInput, model-router with fal-ai/ prefix routing
provides:
  - FalAdapter._buildRequestBody() with model-specific Sora 2 (numeric enum) and Wan 2.6 (string enum) bodies
  - webhook_url injection into fal.ai queue submission when WORKER_PUBLIC_URL is set
  - falRequestRegistry Map for requestId → BullMQ job lookup (no DB schema change)
  - POST /api/webhooks/fal Express route with immediate 200 ack, ED25519 signature verification, idempotent processing
affects: [09-feedback-loop, video-pipeline-worker]

# Tech tracking
tech-stack:
  added: [supertest (devDependency, Express route integration testing)]
  patterns:
    - TDD (RED→GREEN) for adapter body construction and webhook endpoint
    - Module-level Map for cross-module registry (falRequestRegistry exported from fal-adapter.ts)
    - Module-level Set for idempotency (processedRequestIds bounded to 10,000 entries)
    - JWKS caching (24h TTL, module-level variable) for ED25519 key material
    - setImmediate fire-and-forget after 200 response for async webhook processing

key-files:
  created:
    - apps/worker/src/api/fal-webhook.ts
    - apps/worker/src/api/fal-webhook.test.ts
  modified:
    - apps/worker/src/services/model-router/provider-adapters/fal-adapter.ts
    - apps/worker/src/services/model-router/provider-adapters/adapters.test.ts
    - apps/worker/src/api/routes.ts
    - apps/worker/package.json

key-decisions:
  - "Sora 2 duration: numeric enum [4,8,12,16,20] snapped to nearest; delete_video:false mandatory (Sora 2 deletes by default)"
  - "Wan 2.6 duration: string enum ['5','10','15'] snapped to nearest then stringified"
  - "webhook_url at top-level body (not inside input) when WORKER_PUBLIC_URL env is set"
  - "falRequestRegistry Map exported from fal-adapter.ts — shared state lets webhook handler resolve requestId to jobId without DB schema changes"
  - "Idempotency via Set<string> (bounded 10k entries) not fal_request_id DB column — no migrations required"
  - "FAL_WEBHOOK_VERIFY=false default gates ED25519 check — exact message format needs live validation before enabling"
  - "ED25519 message format: {requestId}\\n{timestamp}\\n{sha256hex(rawBody)} per fal.ai docs (needs live job validation)"

patterns-established:
  - "Webhook ack-then-process: respond 200 in route handler, kick off setImmediate for async work"
  - "Duration clamping: snapToNearest() helper snaps arbitrary seconds to nearest valid API enum value"
  - "Cross-module registry via exported Map: avoids DB schema changes for in-process job lookup"

requirements-completed: [PROV-01, PROV-02]

# Metrics
duration: 65min
completed: 2026-03-15
---

# Phase 08 Plan 01: Provider Activation Summary

**FalAdapter wired for production: model-specific Sora 2 (numeric enum + delete_video:false) and Wan 2.6 (string enum) request bodies, webhook_url injection, and POST /api/webhooks/fal endpoint with ED25519 signature verification, in-memory idempotency Set, and immediate 200 ack**

## Performance

- **Duration:** 65 min
- **Started:** 2026-03-15T00:41:00Z
- **Completed:** 2026-03-15T05:46:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- FalAdapter._buildRequestBody() branches on modelId for Sora 2 (numeric duration enum, resolution:1080p, aspect_ratio:auto, delete_video:false) and Wan 2.6 (string duration enum, resolution:1080p), with generic fallback for other models
- webhook_url injected top-level (not inside input) when WORKER_PUBLIC_URL is set; omitted when not set so polling fallback works
- falRequestRegistry Map exported from fal-adapter.ts and populated at submitJob time — lets webhook handler resolve requestId → jobId without any DB schema change
- POST /api/webhooks/fal: responds 200 immediately, verifies ED25519 signature (gated behind FAL_WEBHOOK_VERIFY env), processes completion/error idempotently, calls trackExpense() on success
- 77 tests pass across model-router and webhook suites (37 adapter + 8 webhook + 32 existing)

## Task Commits

1. **Task 1: FalAdapter model-specific request bodies + webhook_url** - `feaf8347` (feat)
2. **Task 2: fal.ai webhook endpoint with ED25519 verification and idempotency** - `83dfd43f` (feat)

## Files Created/Modified

- `apps/worker/src/services/model-router/provider-adapters/fal-adapter.ts` - Added _buildRequestBody(), snapToNearest(), falRequestRegistry, SORA/WAN duration enums
- `apps/worker/src/services/model-router/provider-adapters/adapters.test.ts` - 13 new model-specific body tests (Sora 2, Wan 2.6, default fallback, webhook_url presence/absence)
- `apps/worker/src/api/fal-webhook.ts` - New Express router: POST /webhooks/fal with ack, signature check, idempotency, job processing
- `apps/worker/src/api/fal-webhook.test.ts` - 8 integration tests: 200 ack, completion, error, idempotency (x2), sig verify (x2), bypass
- `apps/worker/src/api/routes.ts` - Added falWebhookRouter mount
- `apps/worker/package.json` - Added supertest devDependency

## Decisions Made

- **Sora 2 duration clamp**: snap to nearest `[4, 8, 12, 16, 20]`. Plan says "clamp" but nearest-snap is more correct semantically for enums — 9s snaps to 8 not 4.
- **falRequestRegistry as exported Map**: The plan mentioned a Map approach as the "simpler alternative." Implemented it — avoids any DB interaction in the webhook hot path.
- **FAL_WEBHOOK_VERIFY default = false**: Plan explicitly specified this. ED25519 message format in fal.ai docs needs live validation before enabling in production.
- **supertest added**: No integration test library was present for Express routes. Added as devDependency (Rule 3 — blocking).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing supertest devDependency**
- **Found during:** Task 2 (webhook test file creation)
- **Issue:** `supertest` not in package.json — test import failed immediately
- **Fix:** `npm install --save-dev supertest @types/supertest`
- **Files modified:** apps/worker/package.json
- **Verification:** Tests imported and ran successfully
- **Committed in:** 83dfd43f (Task 2 commit)

**2. [Rule 1 - Bug] Fixed test idempotency isolation — shared processedRequestIds Set caused test collision**
- **Found during:** Task 2 (webhook test execution)
- **Issue:** `processes error payload` test failed because `req-known` was already in processedRequestIds from the preceding completion test. Module-level Set is not reset between tests.
- **Fix:** Changed error payload test to use unique `req-error-unique` request_id and pre-seed registry
- **Files modified:** apps/worker/src/api/fal-webhook.test.ts
- **Verification:** All 8 tests pass
- **Committed in:** 83dfd43f (Task 2 commit)

**3. [Rule 1 - Bug] Fixed async timing in webhook tests — setImmediate not enough for async processor**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** Tests using `await new Promise(r => setImmediate(r))` resolved before the setImmediate+async chain in the route completed. trackExpense wasn't called yet.
- **Fix:** Changed to `await new Promise(r => setTimeout(r, 50))` for async tests that check side effects
- **Files modified:** apps/worker/src/api/fal-webhook.test.ts
- **Verification:** trackExpense and logger.info assertions pass reliably
- **Committed in:** 83dfd43f (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 missing dependency, 2 test bugs)
**Impact on plan:** All fixes necessary for correctness. No scope creep.

## Issues Encountered

- Pre-existing test failure in `src/services/onboarding/module-router.test.ts` (1 test) exists before this plan's work. Out of scope per deviation rules — logged to deferred-items.
- ED25519 exact message format unverifiable without a live fal.ai job. Implementation follows docs; FAL_WEBHOOK_VERIFY=false default ensures webhook works immediately.

## User Setup Required

**Environment variables to configure before enabling signature verification:**

| Variable | Value | When |
|----------|-------|------|
| `WORKER_PUBLIC_URL` | `https://worker.superseller.agency` (or tunnel URL) | Before live fal.ai traffic — enables webhook_url injection |
| `FAL_WEBHOOK_VERIFY` | `true` | After validating ED25519 message format with one real fal.ai job |
| `FAL_API_KEY` | (already set) | Already deployed |

**Verification after setting WORKER_PUBLIC_URL:**
```bash
curl -s http://172.245.56.50:3002/api/health
# Submit a test fal.ai job and check worker logs for "FalWebhook: job completed"
```

## Next Phase Readiness

- FalAdapter is production-ready for Sora 2 and Wan 2.6 traffic
- Webhook endpoint is mounted and will receive callbacks as soon as WORKER_PUBLIC_URL is configured
- ED25519 signature verification implemented but gated — enable after one live job validates the message format
- Phase 09 (feedback loop) can consume real fal.ai completion events via the webhook

---
*Phase: 08-provider-activation*
*Completed: 2026-03-15*
