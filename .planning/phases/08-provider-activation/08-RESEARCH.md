# Phase 08: Provider Activation - Research

**Researched:** 2026-03-15
**Domain:** fal.ai webhook integration, KieAdapter Veo 3.1 branching, FalAdapter model-specific request bodies
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- fal.ai webhook endpoint lives on the worker Express app (`POST /api/webhooks/fal`), NOT Next.js web app
- Webhook receives fal.ai callbacks, is idempotent on `request_id`, updates BullMQ job record on completion
- Keep polling as fallback for webhook delivery failure — `FalAdapter.pollStatus()` already works
- Webhook must validate fal.ai request authenticity (ED25519 signature via JWKS)
- Model ID mismatch resolution: update `SHOT_DEFAULT_MODELS` to match DB `ai_models.model_id` row
- The model ID is a routing key only — `kie.ts` always calls `/api/v1/veo/generate` regardless of ID string
- First test job: single Sora 2 test (higher value, proves full fal.ai webhook flow), budget $0.50 max
- Wan 2.6 tested second (if Sora 2 works, Wan 2.6 likely works too)
- KieAdapter Veo branch: `if (modelId.includes('veo')) → createVeoTask/getVeoTaskStatus`, else existing Kling path
- Do NOT create a separate VeoAdapter — both Veo and Kling go through KieAdapter
- `shotType='dialogue'` already maps to veo-3.1 in SHOT_DEFAULT_MODELS; router selects KieAdapter and passes veo modelId

### Claude's Discretion
- All four gray areas (webhook auth, model ID resolution, test strategy, Veo wiring) already resolved by context analysis (listed as Locked Decisions above)

### Deferred Ideas (OUT OF SCOPE)
- None declared
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROV-01 | System can route shots to fal.ai provider with correct model IDs (`fal-ai/sora-2/image-to-video/pro`, `wan/v2.6/image-to-video`) | FalAdapter.submitJob() exists and works; model IDs verified against official fal.ai docs; request body field names confirmed |
| PROV-02 | System can receive fal.ai webhook callbacks for long-running generations (>10min) | fal.ai webhook mechanics fully documented; ED25519 JWKS verification protocol confirmed; Express route pattern established from Telnyx webhook |
| PROV-04 | System can generate dialogue/talking-head video via Veo 3.1 on kie.ai (`/api/v1/veo/generate`) | `createVeoTask`/`getVeoTaskStatus` already wired in kie.ts; KieAdapter branch pattern proven by existing music/video split |
</phase_requirements>

---

## Summary

Phase 08 wires three things that are already built but never exercised in production: FalAdapter (Sora 2 + Wan 2.6), fal.ai webhook ingestion, and Veo 3.1 via KieAdapter. The codebase investigation confirms all three have complete implementations — the gap is activation, not construction.

The biggest coordination task is the model ID mismatch: `SHOT_DEFAULT_MODELS` uses `'veo-3.1'` but the DB `ai_models` row uses a different string. This must be resolved before live traffic because the router infers provider from `modelId.startsWith('fal-ai/')` — a Veo shot must return a non-fal modelId to route to KieAdapter. The FalAdapter request body also needs model-specific field mapping (Sora 2 uses `duration` as an enum of seconds; Wan 2.6 uses a string duration).

The fal.ai webhook uses ED25519 signature verification via a JWKS endpoint, with a 15-second timeout on delivery and up to 10 retry attempts over 2 hours. The webhook payload on completion contains `status: "OK"` and a `payload` object with the model output (video URL inside `payload.video.url` for Sora 2). Idempotency on `request_id` is required because retries will deliver duplicates.

**Primary recommendation:** Wire FalAdapter request body per model spec, add `webhookUrl` to submitJob, implement `POST /api/webhooks/fal` with ED25519 signature verification + idempotent DB update, then add Veo branch in KieAdapter. Fix model ID mismatch in SHOT_DEFAULT_MODELS last (depends on live DB query result).

---

## Standard Stack

### Core (already in codebase, no installs needed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `FalAdapter` | Phase 07 | Submit/poll/cancel fal.ai jobs | Built, not called in production |
| `KieAdapter` | Phase 07 | Submit/poll Kie.ai jobs | Production-proven |
| `createVeoTask` / `getVeoTaskStatus` | Phase 07 | Veo 3.1 API functions in kie.ts | Built, not called via adapter |
| `routeShot()` | Phase 07 | Model selection + adapter instantiation | Production-ready |
| `validateImageInput()` | Phase 07 | Pre-submission image format guard | Built, Phase 08 is the call site |
| `trackExpense()` | Phase 07 | Cost logging after generation | Production, has fal COST_RATES |
| Express Router | worker app | HTTP routes including webhooks | Pattern: telnyx-voice-webhook.ts |

### Supporting (needs to be added)

| Problem | What to Add | Notes |
|---------|------------|-------|
| ED25519 signature verification | Crypto via Node.js built-in `crypto` module | `crypto.verify('ed25519', ...)` — no npm install |
| JWKS key fetching | `fetch` to `https://rest.fal.ai/.well-known/jwks.json` | Cache 24h in memory, never re-fetch per request |
| Webhook `webhookUrl` param | Add to `FalAdapter.submitJob()` body | fal.ai reads it as top-level key on the queue submission |

**Installation:** No new npm packages required. All dependencies already in worker.

---

## Architecture Patterns

### Recommended File Layout (changes only)

```
apps/worker/src/
├── api/
│   ├── routes.ts                     # Mount fal-webhook.ts router here
│   └── fal-webhook.ts                # NEW: POST /api/webhooks/fal
├── services/
│   └── model-router/
│       ├── shot-types.ts             # MODIFY: fix veo-3.1 modelId mismatch
│       └── provider-adapters/
│           ├── fal-adapter.ts        # MODIFY: model-specific body + webhookUrl
│           ├── kie-adapter.ts        # MODIFY: add Veo branch by modelId
│           └── adapters.test.ts      # MODIFY: tests for Veo branch + Fal model bodies
```

### Pattern 1: fal.ai Webhook Submission

When submitting a job to fal.ai, pass `webhook_url` in the request body top-level (not inside `input`):

```typescript
// Source: https://fal.ai/docs/model-endpoints/webhooks
const body = {
    input: {
        prompt: req.prompt,
        image_url: req.imageUrl,
        duration: req.durationSeconds ?? 5,
    },
    webhook_url: `${process.env.WORKER_PUBLIC_URL}/api/webhooks/fal`,
};
```

**Note:** fal.ai accepts `webhook_url` at the top-level of the queue POST body, not nested inside `input`. This is different from passing it as a query parameter.

### Pattern 2: Model-Specific Request Bodies

Sora 2 (`fal-ai/sora-2/image-to-video/pro`) and Wan 2.6 (`wan/v2.6/image-to-video`) have different field signatures. The current FalAdapter sends a generic body — Phase 08 must branch by modelId:

**Sora 2 (`fal-ai/sora-2/image-to-video/pro`):**
```typescript
// Source: https://fal.ai/models/fal-ai/sora-2/image-to-video/pro/api
{
    input: {
        prompt: string,           // required, max 5000 chars
        image_url: string,        // required
        duration: 4 | 8 | 12 | 16 | 20,   // enum of seconds, default 4
        resolution: 'auto' | '720p' | '1080p' | 'true_1080p',  // default 'auto'
        aspect_ratio: 'auto' | '9:16' | '16:9',                // default 'auto'
        delete_video: boolean,    // default true — set false if we need to cache URL
    },
    webhook_url: string,
}
```

**Wan 2.6 (`wan/v2.6/image-to-video`):**
```typescript
// Source: https://fal.ai/models/wan/v2.6/image-to-video/api
{
    input: {
        prompt: string,           // required, max 800 chars
        image_url: string,        // required
        duration: '5' | '10' | '15',       // STRING not number, default '5'
        resolution: '720p' | '1080p',      // default '1080p'
        negative_prompt?: string,           // optional
        enable_prompt_expansion?: boolean,  // default true
        seed?: number,
    },
    webhook_url: string,
}
```

**Critical:** Wan 2.6 takes `duration` as a string (`'5'`, `'10'`, `'15'`). Sora 2 takes `duration` as a numeric enum. The current FalAdapter sends `duration: req.durationSeconds ?? 5` (number) for both — this is wrong for Wan 2.6.

### Pattern 3: Webhook Handler — Express Route

Follow the established Telnyx webhook pattern exactly:

```typescript
// Source: apps/worker/src/api/telnyx-voice-webhook.ts
export const falWebhookRouter = Router();

falWebhookRouter.post('/webhooks/fal', async (req: Request, res: Response) => {
    // Respond 200 immediately — fal.ai has 15s timeout
    res.status(200).json({ status: 'ok' });

    // Verify signature (async, after ack)
    const valid = await verifyFalSignature(req);
    if (!valid) {
        logger.warn({ msg: 'FalWebhook: invalid signature, dropping' });
        return;
    }

    const { request_id, status, payload } = req.body;
    await handleFalCompletion(request_id, status, payload);
});
```

### Pattern 4: ED25519 Signature Verification

```typescript
// Source: https://fal.ai/docs/model-endpoints/webhooks
// Verification steps:
// 1. Fetch JWKS from https://rest.fal.ai/.well-known/jwks.json (cache 24h)
// 2. Check timestamp within ±5 minutes
// 3. Construct message: requestId + '\n' + userId + '\n' + timestamp + '\n' + sha256(body)
// 4. Verify ED25519 signature against any key in JWKS

import crypto from 'crypto';

async function verifyFalSignature(req: Request): Promise<boolean> {
    const requestId = req.headers['x-fal-webhook-request-id'] as string;
    const timestamp = req.headers['x-fal-webhook-timestamp'] as string;
    const signature = req.headers['x-fal-webhook-signature'] as string;

    // Timestamp check (±5 min)
    const tsSeconds = parseInt(timestamp, 10);
    if (Math.abs(Date.now() / 1000 - tsSeconds) > 300) return false;

    // Build message: requestId\nuserId\ntimestamp\nsha256(body)
    const rawBody = JSON.stringify(req.body);
    const bodyHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    // Note: userId is embedded in the request_id or available from JWKS — check fal.ai docs
    const message = `${requestId}\n${timestamp}\n${bodyHash}`;

    // Fetch + cache JWKS, verify against each key
    const keys = await getFalJwks(); // cached
    const sigBuffer = Buffer.from(signature, 'hex');
    const msgBuffer = Buffer.from(message);

    return keys.some(key =>
        crypto.verify('ed25519', msgBuffer, key, sigBuffer)
    );
}
```

**Note on JWKS structure:** The exact message construction (whether userId is included, exact field order) must be verified against the live JWKS docs. The pattern above is based on the official docs description but the exact string construction should be tested.

### Pattern 5: KieAdapter Veo Branch

```typescript
// Add to kie-adapter.ts _submitVideoJob()
// Pattern follows existing music branch in submitJob()

private async _submitVideoJob(req: ShotRequest, modelId: string): Promise<AdapterJobResult> {
    // Veo 3.1 branch — modelId contains 'veo'
    if (modelId.includes('veo')) {
        return this._submitVeoJob(req, modelId);
    }
    // Existing Kling path
    const taskId = await createKlingTask({ ... });
    return { externalJobId: taskId, provider: 'kie' };
}

private async _submitVeoJob(req: ShotRequest, _modelId: string): Promise<AdapterJobResult> {
    const taskId = await createVeoTask(req.prompt, {
        image_url: req.imageUrl,
        duration: req.durationSeconds ?? 8,
        mode: 'fast',
        aspect_ratio: '16:9',
        sound: false,
    });
    return { externalJobId: taskId, provider: 'kie' };
}
```

**And in `pollStatus()`:**
```typescript
async pollStatus(jobId: string): Promise<AdapterPollResult> {
    // Veo task IDs have a different format — but we don't know the format at submit time
    // Store taskType in externalJobId: "veo::{taskId}" vs "kling::{taskId}"
    // OR: keep jobId opaque and always try Veo poll first (slower but simpler)
    // Recommended: encode type in jobId prefix
    if (jobId.startsWith('veo::')) {
        return this._pollVeoStatus(jobId.slice(5));
    }
    // Existing Kling poll
    const response = await getTaskStatus(jobId, 'kling');
    ...
}
```

**Alternative (simpler):** The planner should decide between encoding type in `externalJobId` prefix vs passing modelId through. The prefix approach (`veo::taskId`) is self-contained and requires no schema changes.

### Anti-Patterns to Avoid

- **Polling instead of webhook for fal.ai:** Sora 2 jobs run 5-20 minutes. BullMQ job timeouts will expire before polling can catch completion. Always submit with `webhook_url`; fall back to poll only if webhook is unreachable.
- **Blocking on signature verification:** Fal.ai has a 15-second delivery timeout. Always `res.status(200)` first, verify async after.
- **Hardcoding `delete_video: true` for Sora 2:** fal.ai deletes the video after generation by default. Set `delete_video: false` if we intend to cache the URL; otherwise the URL becomes dead immediately.
- **Sending Wan 2.6 duration as number:** Must be string (`'5'`, `'10'`, `'15'`). The API will reject a numeric `5`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ED25519 verification | Custom crypto library | `crypto.verify('ed25519', ...)` from Node built-in | Already in Node 15+, no install |
| Job state storage | In-memory webhook cache | Write to DB via existing `query()` | Worker restarts would lose in-memory state |
| Veo API client | New HTTP client | `createVeoTask` / `getVeoTaskStatus` already in kie.ts | Retry logic, auth, and error handling are proven |
| Webhook routing | Custom HTTP server | Express Router, mount on `apiRouter.use(falWebhookRouter)` | Identical to how `telnyxVoiceRouter` is mounted |
| JWKS fetching | Hardcoded public key | Fetch from `https://rest.fal.ai/.well-known/jwks.json` | Keys rotate; hardcoding breaks silently |

---

## Common Pitfalls

### Pitfall 1: Sora 2 Video URL Is Temporary (delete_video Default)
**What goes wrong:** `delete_video` defaults to `true` in Sora 2. The video URL in the webhook payload becomes inaccessible after fal.ai deletes it — potentially within seconds of delivery.
**Why it happens:** Sora 2 is an OpenAI model; fal.ai deletes results for privacy by default.
**How to avoid:** Always set `delete_video: false` in the Sora 2 request body. Download and upload to R2 immediately in the webhook handler before acknowledging completion upstream.
**Warning signs:** `resultUrl` returns 403/404 when accessed minutes after job completion.

### Pitfall 2: Wan 2.6 Duration Must Be String
**What goes wrong:** `duration: 5` (number) → API returns 422 validation error.
**Why it happens:** The Wan 2.6 API schema expects `duration` as a string enum `'5' | '10' | '15'`.
**How to avoid:** In FalAdapter, when modelId is `wan/v2.6/image-to-video`, stringify duration: `duration: String(req.durationSeconds ?? 5)`.
**Warning signs:** Immediate 422 on submitJob, not a polling timeout.

### Pitfall 3: Webhook Not Registered = Polling Timeout
**What goes wrong:** Jobs submitted without `webhook_url` rely on polling. Sora 2 jobs take 5-20 minutes; BullMQ worker timeout will kill the job before poll catches completion.
**Why it happens:** FalAdapter.submitJob() currently does NOT include `webhook_url` in the body.
**How to avoid:** Add `webhook_url` to every fal.ai submission. If `WORKER_PUBLIC_URL` env var is missing, fall back to polling with extended timeout.
**Warning signs:** Jobs time out with `IN_PROGRESS` status when polling directly.

### Pitfall 4: Duplicate Webhook Deliveries (Idempotency Required)
**What goes wrong:** fal.ai retries failed webhook deliveries up to 10 times over 2 hours. Duplicate `request_id` deliveries → duplicate DB writes → double-counted expenses, double notifications.
**Why it happens:** fal.ai retry policy is aggressive; any 5xx or timeout triggers a retry.
**How to avoid:** `INSERT ... ON CONFLICT (request_id) DO NOTHING` on the job completion update. Check existing DB row before processing.
**Warning signs:** Same job appears completed multiple times in logs.

### Pitfall 5: Veo Branch Breaks Existing Kling pollStatus
**What goes wrong:** If KieAdapter.pollStatus() uses `getTaskStatus(jobId, 'kling')` for all jobs, Veo task IDs will fail — Veo status endpoint is `GET /api/v1/veo/record-info?taskId=` not the Kling endpoint.
**Why it happens:** KieAdapter currently has no type information about what was submitted — jobId is opaque.
**How to avoid:** Encode task type in externalJobId (`veo::taskId` vs raw Kling `taskId`). pollStatus() branches on prefix. submitJob() and pollStatus() must agree on encoding.
**Warning signs:** Veo polls return 404 or wrong task data.

### Pitfall 6: veo-3.1 Model ID Doesn't Match DB Row
**What goes wrong:** `SHOT_DEFAULT_MODELS.dialogue.modelId = 'veo-3.1'` but DB `ai_models` row has a different value (STATE.md notes possible mismatch with `veo-3.1-fast/video`). Observatory query returns the DB modelId; router then tries to infer provider from `'veo-3.1-fast/video'.startsWith('fal-ai/')` → `false` → KieAdapter (correct). But the modelId passed to KieAdapter may not match the Veo branch condition.
**Why it happens:** The DB was seeded in Phase 07 with a different string than the hardcoded SHOT_DEFAULT_MODELS value.
**How to avoid:** Before any live traffic: query DB for `SELECT model_id FROM ai_models WHERE model_family = 'veo' LIMIT 1` and update both `SHOT_DEFAULT_MODELS` and the Veo branch condition in KieAdapter to use the same string. The Veo branch check should use `modelId.includes('veo')` (loose match) to survive minor version string variations.

---

## Code Examples

### fal.ai Webhook Payload (Completion)
```json
// Source: https://fal.ai/docs/model-endpoints/webhooks
{
    "request_id": "abc123",
    "gateway_request_id": "gw-xyz",
    "status": "OK",
    "payload": {
        "video": {
            "url": "https://fal.media/files/...",
            "content_type": "video/mp4",
            "duration": 8.0,
            "width": 1280,
            "height": 720,
            "fps": 24
        },
        "video_id": "vid_abc123"
    }
}
```

For errors:
```json
{
    "request_id": "abc123",
    "status": "ERROR",
    "error": "Model inference failed"
}
```

### Mounting Webhook Router in routes.ts
```typescript
// Pattern from: apps/worker/src/api/routes.ts line 34
import { falWebhookRouter } from './fal-webhook';
apiRouter.use(falWebhookRouter);
```

### Idempotent Job Completion Update
```typescript
// Use ON CONFLICT to prevent duplicate processing
await query(
    `UPDATE video_jobs
     SET status = 'complete', result_url = $2, completed_at = NOW()
     WHERE fal_request_id = $1
       AND status != 'complete'`,  // Only update if not already done
    [requestId, resultUrl],
);
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Polling loop for async AI jobs | Webhook delivery + poll fallback | Eliminates BullMQ timeout risk for 10-20min jobs |
| Single Kling endpoint in KieAdapter | Branch by modelId (Kling vs Veo) | Enables multiple Kie.ai model families without new adapters |
| Generic fal.ai request body | Model-specific field mapping | Prevents 422 errors from field type mismatches |

**Deprecated/outdated:**
- `FalAdapter.submitJob()` without `webhook_url`: never used in production; must be updated before first live call
- `SHOT_DEFAULT_MODELS.dialogue.modelId = 'veo-3.1'`: needs alignment with DB row before Observatory queries return correct modelId

---

## Open Questions

1. **Exact Veo model_id in DB**
   - What we know: STATE.md says "mismatch: SHOT_DEFAULT_MODELS uses veo-3.1 but DB has veo-3.1-fast/video"
   - What's unclear: The exact string cannot be verified without a live DB query (DB not accessible from local)
   - Recommendation: Plan 08-01 or 08-02 must start with `SELECT model_id FROM ai_models WHERE kie_endpoint LIKE '%veo%' LIMIT 5` to get ground truth before any code changes

2. **fal.ai Webhook Message Construction for ED25519**
   - What we know: Official docs say "concatenate request ID, user ID, timestamp, and SHA-256 hash of body"
   - What's unclear: Whether userId is from a JWKS claim or a webhook header; exact newline separator positions
   - Recommendation: Plan should include a "verify signature format" step that tests with a real fal.ai job before treating verification as complete. If verification cannot be confirmed, implement but gate behind an env flag (`FAL_WEBHOOK_SKIP_VERIFY=true` for initial test).

3. **fal.ai Billing on Failure**
   - What we know: STATE.md notes "fal.ai billing on failure is unknown — plan one test job before production tenant traffic"
   - What's unclear: Whether fal.ai charges when generation fails (model error, safety filter, etc.)
   - Recommendation: Test plan includes intentional failure case (invalid image URL) to observe billing behavior. Document result in findings.md.

4. **WORKER_PUBLIC_URL Environment Variable**
   - What we know: Worker runs on RackNerd at 172.245.56.50, exposed via nginx
   - What's unclear: Whether a public HTTPS URL exists for the worker that fal.ai can reach (fal.ai requires HTTPS for webhook URLs)
   - Recommendation: Check nginx config for worker subdomain. If none exists, add `worker-api.superseller.agency` nginx proxy before testing webhooks. Plan 08-01 should include this infra check.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts) |
| Config file | `apps/worker/vitest.config.ts` |
| Quick run command | `cd apps/worker && npx vitest run src/services/model-router/` |
| Full suite command | `cd apps/worker && npx vitest run` |

**Current status:** 56 tests passing across 4 files in model-router. All green as of 2026-03-15.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROV-01 | FalAdapter sends model-specific body (Sora 2 enum duration, Wan 2.6 string duration) | unit | `cd apps/worker && npx vitest run src/services/model-router/provider-adapters/adapters.test.ts` | ✅ (extend existing) |
| PROV-01 | FalAdapter includes `webhook_url` in submission body | unit | same file | ✅ (extend existing) |
| PROV-02 | `POST /api/webhooks/fal` returns 200 immediately | unit | `cd apps/worker && npx vitest run src/api/fal-webhook.test.ts` | ❌ Wave 0 |
| PROV-02 | Webhook is idempotent on `request_id` (duplicate delivery → no double write) | unit | same file | ❌ Wave 0 |
| PROV-02 | Webhook rejects invalid ED25519 signature | unit | same file | ❌ Wave 0 |
| PROV-04 | KieAdapter routes `modelId.includes('veo')` to `createVeoTask` | unit | `cd apps/worker && npx vitest run src/services/model-router/provider-adapters/adapters.test.ts` | ✅ (extend existing) |
| PROV-04 | KieAdapter `pollStatus('veo::taskId')` calls `getVeoTaskStatus` not `getTaskStatus` | unit | same file | ✅ (extend existing) |

### Sampling Rate

- **Per task commit:** `cd apps/worker && npx vitest run src/services/model-router/`
- **Per wave merge:** `cd apps/worker && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/worker/src/api/fal-webhook.test.ts` — covers PROV-02 (webhook handler: 200 ack, idempotency, signature rejection)
- [ ] `apps/worker/src/api/fal-webhook.ts` — the implementation file itself (no test can exist without it)

*(Existing test infrastructure and setup.ts cover all other requirements — only the new webhook handler file is missing)*

---

## Sources

### Primary (HIGH confidence)
- Official fal.ai webhook docs (`https://fal.ai/docs/model-endpoints/webhooks`) — webhook payload format, ED25519 verification protocol, retry policy
- Official fal.ai Sora 2 API page (`https://fal.ai/models/fal-ai/sora-2/image-to-video/pro/api`) — confirmed model ID `fal-ai/sora-2/image-to-video/pro`, all input fields, duration enum, `delete_video` default
- Official fal.ai Wan 2.6 API page (`https://fal.ai/models/wan/v2.6/image-to-video/api`) — confirmed model ID `wan/v2.6/image-to-video`, string duration requirement, resolution options
- Direct codebase inspection — all adapter, router, kie.ts, expense-tracker, routes.ts, and test files read directly

### Secondary (MEDIUM confidence)
- fal.ai blog post `blog.fal.ai/sora-2-gpt-image-1-are-now-available-on-fal/` — confirms Sora 2 availability and model family naming on fal.ai platform

### Tertiary (LOW confidence)
- None — all critical claims verified against official docs or live code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all components already in codebase; no new dependencies
- Architecture: HIGH — fal.ai webhook mechanics confirmed against official docs; Express pattern established by Telnyx webhook
- Model-specific request bodies: HIGH — verified against official fal.ai API pages for both Sora 2 and Wan 2.6
- Veo branching: HIGH — `createVeoTask`/`getVeoTaskStatus` read directly from kie.ts; branch pattern confirmed from existing music/video split
- ED25519 verification exact message format: MEDIUM — documented by fal.ai but edge cases (userId field, exact separator) need live validation
- Pitfalls: HIGH — `delete_video` default, Wan 2.6 duration type, duplicate delivery all confirmed from official docs

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (fal.ai API stable; webhook protocol unlikely to change in 30 days)
