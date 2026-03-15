# Phase 07: Provider Foundation - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

All safety rails, DB schema, and code correctness issues resolved so that fal.ai production traffic can be enabled without credit-burn risk. Includes: DECISIONS.md entry reversing Kling-only mandate, router bug fix (adapter selection from Observatory provider field), ai_models DB seed, expense-tracker cost rates, and image input validation before provider submission.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User delegated all three gray areas to Claude. Decisions below reflect codebase analysis and prior context:

**Veo 3.1 re-integration rationale (DECISIONS.md entry):**
- Document that Feb 2026 removal was due to instability/cost concerns during Kling-only mandate
- Re-integration rationale: Veo 3.1 is optimal for dialogue/talking-head shots (different capability than Kling), multi-model routing layer now provides budget enforcement and fallback, Observatory quality scoring will validate the decision over time
- Entry should reference PROV-08 requirement and note that Veo 3.1 runs through Kie.ai (`/api/v1/veo/generate`), not a new provider

**Cost rate strategy (expense-tracker COST_RATES):**
- Add `fal` provider block to COST_RATES map alongside existing `kie` block
- Sora 2 rate: based on fal.ai published pricing for `fal-ai/sora-2/image-to-video/pro`
- Wan 2.6 rate: based on fal.ai published pricing for `wan/v2.6/image-to-video` (budget tier — should be cheaper than Sora 2)
- These are fallback rates only — primary pricing comes from ai_models table via model-selector.ts
- Researcher should verify current fal.ai pricing before seeding

**Input validation strictness:**
- Validate image type (reject webp, allow jpg/jpeg/png only) — directly prevents the Feb 2026 $8.60 WebP→Kling 422 burn
- Validate image URL is reachable (HEAD request, check Content-Type header)
- Validate dimensions if available from response headers (reject images < 256px or > 4096px per side)
- Wrap validation failures in `UnrecoverableError` (BullMQ won't retry — prevents credit burn on repeated format rejections)
- Validation runs before ANY `FalAdapter.submitJob()` call, not inside the adapter (keep adapter clean)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FalAdapter` (fal-adapter.ts): Fully written, uses queue REST API via fetch, supports submit/poll/cancel — never been called in production
- `KieAdapter` (kie-adapter.ts): Production-proven, same ProviderAdapter interface
- `COST_RATES` map (expense-tracker.ts): Has kie/gemini/resend/r2 blocks — add fal block in same pattern
- `SHOT_DEFAULT_MODELS` (shot-types.ts): Already maps shot types to providers (some mapped to 'fal')
- `getRecommendedModel()` (model-selector.ts): Queries ai_model_recommendations + ai_models tables, returns ModelSelection with costPerUnit

### Established Patterns
- Provider adapters implement `ProviderAdapter` interface (types.ts): submitJob, pollStatus, cancelJob, estimateCost
- Expense tracking via `trackExpense()` — non-blocking, auto-calculates from COST_RATES if no explicit cost
- Observatory pattern: ai_model_recommendations → ai_models join, with 5-minute in-memory cache

### Integration Points
- **Router bug (line 125 of router.ts):** `const provider = defaultHint.provider` — should read provider from Observatory recommendation result, not from SHOT_DEFAULT_MODELS static config
- **ai_models table:** Needs seed rows for Sora 2, Wan 2.6, Veo 3.1 with correct cost_per_5s_usd, provider, kie_model_param, capability flags
- **DECISIONS.md:** Top-level project file — append new dated entry

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User delegated all implementation decisions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-provider-foundation*
*Context gathered: 2026-03-14*
