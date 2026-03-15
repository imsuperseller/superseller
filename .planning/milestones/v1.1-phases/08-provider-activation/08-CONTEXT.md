# Phase 08: Provider Activation - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Live fal.ai generation (Sora 2 + Wan 2.6) with webhook handling for long-running jobs, and Veo 3.1 dialogue re-integration via Kie.ai. Router, adapters, cost rates, and input validation are already in place from Phase 07 — this phase wires them into production traffic.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User delegated all four gray areas to Claude. Decisions below reflect codebase analysis, prior context, and architectural consistency:

**fal.ai webhook vs polling:**
- Implement webhook endpoint (`POST /api/webhooks/fal`) on the worker Express app (not the Next.js web app) — worker already has Express routes in `src/api/routes.ts`
- Webhook receives fal.ai callbacks, is idempotent on `request_id`, updates the BullMQ job record on completion
- Keep polling as fallback for webhook delivery failure — FalAdapter.pollStatus() already works
- Webhook endpoint must validate fal.ai request authenticity (shared secret or signature if fal.ai provides one)

**Veo 3.1 model ID resolution:**
- Canonical model ID in SHOT_DEFAULT_MODELS should match the DB `ai_models` row — resolve the mismatch by updating SHOT_DEFAULT_MODELS to use whatever the DB row's `model_id` is
- The model ID is a routing key only — `kie.ts` always calls `/api/v1/veo/generate` regardless of the ID string
- Researcher should verify the exact DB row and update SHOT_DEFAULT_MODELS accordingly

**First test job strategy:**
- Run a single Sora 2 test job first (higher value, proves the full fal.ai webhook flow)
- Use a known good image URL from R2 (existing tenant asset) to eliminate input variables
- Budget: $0.50 max for test jobs (covers 2-3 attempts if first fails)
- Wan 2.6 test second (budget tier, simpler — if Sora 2 works, Wan 2.6 likely works too)
- Document fal.ai billing-on-failure behavior from the test results

**KieAdapter Veo wiring:**
- Branch inside KieAdapter by modelId (if modelId contains 'veo' → use createVeoTask/getVeoTaskStatus, else → existing Kling path)
- Do NOT create a separate VeoAdapter — both Veo and Kling go through the same Kie.ai provider, same API key, same base URL
- This follows the existing pattern: KieAdapter already branches for music (suno) vs video (kling) shot types
- shotType='dialogue' in SHOT_DEFAULT_MODELS already maps to veo-3.1, so the router selects KieAdapter and passes the veo modelId

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FalAdapter` (fal-adapter.ts): Complete queue REST API implementation — submit/poll/cancel via fetch. Never called in production. Returns composite jobId `"{modelId}::{requestId}"`
- `KieAdapter` (kie-adapter.ts): Production-proven, wraps createKlingTask/getTaskStatus. Needs Veo branch added
- `createVeoTask`/`getVeoTaskStatus` (kie.ts lines 657-705): Full Veo 3.1 API integration — POST /api/v1/veo/generate, GET /api/v1/veo/record-info
- `routeShot()` (router.ts): Production-ready routing with budget enforcement, Observatory query, adapter instantiation
- `validateImageInput()`: Pre-submission guard for format/reachability — callable from pipeline
- Worker Express routes (src/api/routes.ts): Where to add the fal webhook endpoint

### Established Patterns
- Provider adapters implement `ProviderAdapter` interface: submitJob, pollStatus, cancelJob, estimateCost
- Provider detection: `modelId.startsWith('fal-ai/') ? 'fal' : 'kie'` in router.ts
- KieAdapter already branches by shotType (music vs video) — same pattern for Veo
- Expense tracking via `trackExpense()` — non-blocking, auto-calculates from COST_RATES
- Webhook pattern on worker: Telnyx voice webhook exists at `src/api/telnyx-voice-webhook.ts` — follow same Express route pattern

### Integration Points
- `SHOT_DEFAULT_MODELS` (shot-types.ts): dialogue → veo-3.1 (provider: 'kie'), narrative → fal-ai/kling (provider: 'fal'), environment → fal-ai/sora (provider: 'fal'), social → fal-ai/wan-i2v (provider: 'fal')
- Model ID mismatch to resolve: SHOT_DEFAULT_MODELS uses 'veo-3.1' but DB ai_models has 'veo-3.1-fast/video'
- Worker routes (src/api/routes.ts): Add POST /api/webhooks/fal endpoint
- BullMQ job workers: Where routeShot() gets called for video generation jobs

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User delegated all implementation decisions with high trust (consistent pattern from Phase 07).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-provider-activation*
*Context gathered: 2026-03-15*
