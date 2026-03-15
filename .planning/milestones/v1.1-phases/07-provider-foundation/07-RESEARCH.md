# Phase 07: Provider Foundation - Research

**Researched:** 2026-03-14
**Domain:** Multi-provider AI model routing, DB schema seeding, expense tracking, input validation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None — user delegated all implementation decisions to Claude.

### Claude's Discretion

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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROV-08 | DECISIONS.md entry documents Veo 3.1 re-integration rationale (reversing Feb 2026 removal) | Existing DECISIONS.md structure confirmed; append-only pattern used in all prior entries |
| PROV-03 | Router instantiates correct adapter (Kie or Fal) based on Observatory result, not static provider hint | Bug confirmed at router.ts line 125: `const provider = defaultHint.provider` ignores Observatory result; `adapterForProvider()` helper already exists and correctly handles 'kie'/'fal' |
| PROV-05 | ai_models table seeded with Sora 2, Wan 2.6, Veo 3.1 rows including correct pricing and capability flags | `seed-initial-models.mjs` already contains Veo 3.1, Wan 2.6, Sora 2 rows — but they may not be in production DB; seed script is idempotent (`ON CONFLICT DO NOTHING`) |
| PROV-06 | expense-tracker COST_RATES includes fal.ai provider rates as fallback | COST_RATES map in `apps/worker/src/services/expense-tracker.ts` confirmed; has `kie`, `gemini`, `resend`, `r2`, `anthropic` blocks — no `fal` block yet |
| PROV-07 | Input format validation before provider submission (image type, dimensions) to prevent format rejection errors | `UnrecoverableError` from `bullmq` is the established pattern; existing uses in `video-pipeline.worker.ts` are the reference; validation must live outside `FalAdapter.submitJob()` |
</phase_requirements>

---

## Summary

Phase 07 is a precision surgical phase — five discrete changes across five files, no new architecture needed. All components exist; the phase resolves the gap between built-but-unused infrastructure and production-safe activation.

The biggest risk in this phase is the router bug (PROV-03). The current `routeShot()` at line 125 reads `const provider = defaultHint.provider` — it uses the SHOT_DEFAULT_MODELS static hint regardless of what the Observatory returned. Since `ModelSelection` does not carry a `provider` field, the fix requires either (a) adding a `provider` field to `ModelSelection`, or (b) deriving provider from the model ID prefix. Option (b) is simpler and doesn't require interface changes: any modelId starting with `fal-ai/` maps to `fal`, everything else maps to `kie`.

The seed data is largely pre-written in `seed-initial-models.mjs` which already contains correct Veo 3.1, Wan 2.6, and Sora 2 rows. The task is to verify these rows exist in the live DB and run the seed if not. The script is idempotent (`ON CONFLICT (provider, model_id) DO NOTHING`).

**Primary recommendation:** Fix router.ts provider inference first (PROV-03), then seed the DB (PROV-05), then add fal rates to expense-tracker (PROV-06), then write the input validator (PROV-07), then append to DECISIONS.md (PROV-08). This ordering means tests can cover the most complex change first.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `bullmq` | Already in use | Job queue with `UnrecoverableError` | Established pattern in `video-pipeline.worker.ts`; prevents infinite retries on format rejects |
| `vitest` | Already configured | Test framework | `vitest.config.ts` present, `npm test` runs all `src/**/*.test.ts` |
| Node.js `fetch` | Built-in | HEAD requests for URL reachability validation | No new dependency; `FalAdapter` already uses native fetch |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node-pg` (`pg`) | Already in use | Running idempotent seed script | Seed script uses raw `pg` with `ON CONFLICT DO NOTHING` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Deriving provider from modelId prefix | Adding `provider` field to `ModelSelection` | Interface change cascades to all callers of `getRecommendedModel`; prefix approach is a local fix inside `routeShot()` |
| HEAD request for URL validation | Full GET + Content-Type check | HEAD is idiomatic for existence/type checks, avoids downloading the image |
| Validation in `FalAdapter.submitJob()` | Validation in a wrapper function before submit | Context says keep adapter clean; wrapper function is the prescribed pattern |

**Installation:** No new dependencies required. All libraries are already in `apps/worker/package.json`.

## Architecture Patterns

### Router Bug: Provider Inference Fix

**What:** `routeShot()` at line 125 reads `const provider = defaultHint.provider` — uses the static SHOT_DEFAULT_MODELS entry rather than the Observatory-recommended model's actual provider.

**Current code (line 123-126 of router.ts):**
```typescript
// Step 4: Instantiate correct adapter based on default provider for shot type
// (Observatory may recommend a different modelId but the provider comes from SHOT_DEFAULT_MODELS)
const provider = defaultHint.provider;          // ← BUG: ignores Observatory result
const adapter = adapterForProvider(provider);
```

**Fix — derive provider from modelId prefix:**
```typescript
// Step 4: Infer provider from Observatory-recommended modelId prefix
// fal.ai model IDs always start with "fal-ai/"; all others route to Kie
function providerFromModelId(modelId: string): 'kie' | 'fal' {
    return modelId.startsWith('fal-ai/') ? 'fal' : 'kie';
}
const provider = providerFromModelId(selection.modelId);
const adapter = adapterForProvider(provider);
```

**Why this works:** `SHOT_DEFAULT_MODELS` for fal-routed shots already uses fal-ai/ prefixed model IDs (e.g., `fal-ai/sora`, `fal-ai/wan-i2v`). Observatory recommendations for fal models will also use fal-ai/ prefixes. The function requires no interface changes.

**Budget override path:** When `selection = selectionFromDefault(shotType, budgetCeiling)` triggers, `defaultHint.provider` was correct by coincidence because SHOT_DEFAULT_MODELS had the right hint. With the fix, `selectionFromDefault()` must also use fal-ai/ prefixed modelIds for fal shots — verify that `SHOT_DEFAULT_MODELS.narrative.modelId = 'fal-ai/kling-video/v2.1/pro/image-to-video'` (already the case per shot-types.ts inspection).

### Input Validation Pattern

**What:** A standalone async function `validateImageInput()` that runs before any `FalAdapter.submitJob()` call. Lives outside the adapter.

**Pattern (established from video-pipeline.worker.ts):**
```typescript
import { UnrecoverableError } from 'bullmq';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/jpg']);
const MIN_DIMENSION = 256;
const MAX_DIMENSION = 4096;

export async function validateImageInput(imageUrl: string): Promise<void> {
    // 1. Type check from URL extension
    const lower = imageUrl.toLowerCase();
    if (lower.endsWith('.webp') || lower.includes('.webp?')) {
        throw new UnrecoverableError(
            `Image format rejected: WebP not supported by fal.ai (${imageUrl}). Convert to JPEG/PNG before submission.`
        );
    }

    // 2. HEAD request for Content-Type confirmation
    const head = await fetch(imageUrl, { method: 'HEAD' });
    if (!head.ok) {
        throw new UnrecoverableError(`Image URL unreachable: ${head.status} ${imageUrl}`);
    }
    const contentType = head.headers.get('content-type') ?? '';
    const baseType = contentType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(baseType)) {
        throw new UnrecoverableError(
            `Image content-type rejected: ${contentType} not supported. Allowed: image/jpeg, image/png`
        );
    }

    // 3. Dimension check (if Content-Dimensions header is present — not universal)
    // For future: parse Content-Range or use image-size library if needed
    // For now: rely on extension + content-type as sufficient gates
}
```

**Where to call it:** In the code path that calls `FalAdapter.submitJob()` — not inside `submitJob()` itself, and not inside `routeShot()`. It belongs in the pipeline code that invokes the router result (e.g., `video-pipeline.worker.ts` or a future shot-execution wrapper).

**Note on dimensions:** HTTP HEAD responses rarely include image dimensions in headers. The context specifies "validate dimensions if available" — the pragmatic implementation checks URL extension and Content-Type, which covers the Feb 2026 WebP burn case. Dimension validation can be added later with an image-size library if needed.

### DB Seed Pattern

**What:** Idempotent upsert of Sora 2, Wan 2.6, and Veo 3.1 rows into `ai_models`.

**Established pattern from seed-initial-models.mjs:**
```sql
INSERT INTO ai_models (...fields...)
VALUES (...values...)
ON CONFLICT (provider, model_id) DO NOTHING;
```

The unique constraint is on `(provider, model_id)` — running the seed twice is safe.

**Where the data lives:** `tools/model-observatory/seed-initial-models.mjs` already contains correct rows for all three models (lines 83-174 confirmed). The issue is whether these rows have been applied to the live DB. The plan task is:
1. Check if rows exist: `SELECT model_id FROM ai_models WHERE model_id IN ('veo-3.1', 'wan-2.6/video', 'sora-2/video')`
2. If missing, run: `source /opt/tourreel-worker/apps/worker/.env && node tools/model-observatory/seed-initial-models.mjs`

### COST_RATES Extension Pattern

**What:** Add a `fal` block to `COST_RATES` in `apps/worker/src/services/expense-tracker.ts`.

**Established pattern:**
```typescript
const COST_RATES: Record<string, Record<string, number>> = {
  kie: {
    kling_clip_pro: 0.10,
    // ...
  },
  gemini: { /* ... */ },
  // ADD:
  fal: {
    sora_2_per_second_720p: 0.30,   // fal-ai/sora-2/image-to-video/pro, 720p
    sora_2_per_second_1080p: 0.50,  // fal-ai/sora-2/image-to-video/pro, 1080p
    wan_2_6_per_second_720p: 0.10,  // wan/v2.6/image-to-video, 720p
    wan_2_6_per_second_1080p: 0.15, // wan/v2.6/image-to-video, 1080p
  },
};
```

**Key:** These are **fallback rates only**. Primary pricing comes from `ai_models.cost_per_second_usd` via `model-selector.ts`. The `trackExpense()` function uses `COST_RATES[service]?.[operation] ?? 0` as fallback when `estimatedCost` is not provided.

**Naming convention:** Match the `kie` block style — underscore-separated, no hyphens.

### DECISIONS.md Entry Pattern

**What:** Append a new dated decision block to `DECISIONS.md`. All existing entries follow the same format.

**Pattern (from existing entries):**
```markdown
## N. [DECISION TITLE]

**Date:** [date]
**Requirement:** [req ID]

| Decision | Answer |
|----------|--------|
| ... | ... |

[Narrative explanation]
```

**Key content requirements (from CONTEXT.md):**
- Feb 2026 removal reason: instability/cost concerns during Kling-only mandate
- Re-integration rationale: Veo 3.1 is optimal for dialogue/talking-head (distinct capability), routing layer enforces budget + fallback, Observatory validates over time
- Must note Veo 3.1 runs through Kie.ai (`/api/v1/veo/generate`), not a new provider
- Must reference PROV-08

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| No-retry on format errors | Custom retry skip logic | `UnrecoverableError` from bullmq | Built-in BullMQ mechanism; already used in 8+ places in video-pipeline.worker.ts |
| Provider detection | Custom provider registry | ModelId prefix inference (`fal-ai/` prefix) | All existing fal model IDs in SHOT_DEFAULT_MODELS already use this prefix convention |
| Idempotent DB seed | Manual INSERT with checks | `ON CONFLICT (provider, model_id) DO NOTHING` | Already used in seed-initial-models.mjs |
| URL reachability check | Custom HTTP client | Native `fetch` with `{ method: 'HEAD' }` | FalAdapter already uses native fetch; no new dep |

## Common Pitfalls

### Pitfall 1: Router Bug Fix Breaks Budget Override Path
**What goes wrong:** When `selectionFromDefault()` is called for budget override, it uses `defaultHint.modelId` from `SHOT_DEFAULT_MODELS`. If `providerFromModelId()` is applied to that modelId and the default is a fal model (e.g., `fal-ai/wan-i2v` for `social`), the override correctly routes to FalAdapter. But if the defaults ever use non-prefixed IDs, provider inference breaks.
**Why it happens:** SHOT_DEFAULT_MODELS.narrative.modelId = `fal-ai/kling-video/v2.1/pro/image-to-video`, social = `fal-ai/wan-i2v`, environment = `fal-ai/sora` — all correctly prefixed. Safe.
**How to avoid:** Verify all fal entries in SHOT_DEFAULT_MODELS use `fal-ai/` prefix before merging.
**Warning signs:** Test case "cost over budget ceiling downgrades to hardcoded fallback" (router.test.ts line 123) will catch this.

### Pitfall 2: HEAD Request Fails on R2 URLs
**What goes wrong:** Property photos are uploaded to R2 before Kling/Fal submission. R2 URLs require no auth and serve Content-Type correctly. But if a URL is a signed URL with expiry, HEAD may return 403 if called after expiry.
**Why it happens:** R2 presigned URLs have TTL. The pipeline uploads and then immediately submits — the window should be safe.
**How to avoid:** Validate immediately before submit, not in a deferred queue step. If HEAD fails on a valid-looking R2 URL, wrap in retryable Error (not UnrecoverableError) to allow one retry.
**Warning signs:** `head.ok === false` with status 403 on an R2 URL.

### Pitfall 3: Seed Script Runs Against Wrong DB
**What goes wrong:** The seed script reads `DATABASE_URL` from env. On local, this may point to a local test DB, not production.
**Why it happens:** Environment not sourced correctly before running seed.
**How to avoid:** Use RackNerd sourcing pattern: `source /opt/tourreel-worker/apps/worker/.env && node tools/model-observatory/seed-initial-models.mjs`. Verify after with a SELECT.
**Warning signs:** Seed reports "0 rows affected".

### Pitfall 4: ModelSelection Missing Provider Field
**What goes wrong:** Someone adds `provider` to `ModelSelection` interface (reasonable) but forgets to populate it in `getRecommendedModel()` fallback path, which hardcodes Kie params.
**Why it happens:** The fallback path in model-selector.ts always returns Kie endpoint defaults regardless of model.
**How to avoid:** Don't add `provider` to `ModelSelection`. Use prefix inference in `routeShot()` only — simpler, no interface change needed.

### Pitfall 5: WebP Detection via Extension Only Is Incomplete
**What goes wrong:** A JPEG URL with a query parameter like `?format=webp` or a URL without extension but Content-Type `image/webp` passes the extension check.
**Why it happens:** URL extension check is a quick scan — Content-Type check catches the rest.
**How to avoid:** The two-step check (extension + HEAD Content-Type) in the prescribed pattern handles this. Extension check is a fast-path to fail early without a network call; Content-Type is the authoritative check.

## Code Examples

### Current Router Bug Location

```typescript
// apps/worker/src/services/model-router/router.ts — lines 123-126
// Step 4: Instantiate correct adapter based on default provider for shot type
// (Observatory may recommend a different modelId but the provider comes from SHOT_DEFAULT_MODELS)
const provider = defaultHint.provider;       // ← PROV-03 BUG
const adapter = adapterForProvider(provider);
```

### The Fix

```typescript
// Replace lines 123-126 with:
// Step 4: Infer provider from Observatory-recommended modelId
// fal.ai model IDs always start with "fal-ai/"; all others are Kie.ai
const provider: 'kie' | 'fal' = selection.modelId.startsWith('fal-ai/') ? 'fal' : 'kie';
const adapter = adapterForProvider(provider);
```

### Verified fal.ai Pricing (March 2026)

From official fal.ai model pages:

| Model | fal.ai endpoint | Resolution | Rate |
|-------|----------------|-----------|------|
| Sora 2 | `fal-ai/sora-2/image-to-video/pro` | 720p | $0.30/s |
| Sora 2 | `fal-ai/sora-2/image-to-video/pro` | 1080p | $0.50/s |
| Wan 2.6 | `wan/v2.6/image-to-video` | 720p | $0.10/s |
| Wan 2.6 | `wan/v2.6/image-to-video` | 1080p | $0.15/s |

**Source:** https://fal.ai/models/fal-ai/sora-2/image-to-video/pro (verified March 2026), https://fal.ai/models/wan/v2.6/image-to-video (verified March 2026)

**Important note for expense-tracker COST_RATES:** These are direct fal.ai API rates. The pipeline uses the 5-second billing unit convention (`cost_per_5s_usd` in ai_models). Convert: Wan 2.6 1080p = $0.15/s × 5 = $0.75/5s. Sora 2 1080p = $0.50/s × 5 = $2.50/5s. Since these are fallback rates (primary comes from Observatory), log at per-second granularity with the operation name encoding duration.

### Existing UnrecoverableError Pattern (reference)

```typescript
// apps/worker/src/queue/workers/video-pipeline.worker.ts — line 70
import { Worker, Job, UnrecoverableError } from "bullmq";

// Usage pattern (4xx-equivalent conditions):
throw new UnrecoverableError("Insufficient Credits"); // No retry—won't fix

// Format rejection (proposed, same pattern):
throw new UnrecoverableError(
    `Image format rejected: WebP not supported by fal.ai (${imageUrl}). Convert to JPEG/PNG.`
);
```

### ai_models Seed Row Structure (confirmed from seed-initial-models.mjs)

The following rows already exist in the seed file for the three required models. The planner needs only to verify they're in the live DB and insert if missing:

- **Veo 3.1** (line 83): `model_id: "veo-3.1-fast/video"`, `provider: "kie.ai"`, `kie_endpoint: "/api/v1/veo/generate"`, `cost_per_call_usd: 0.40`
- **Wan 2.6** (line 139): `model_id: "wan-2.6/video"`, `provider: "kie.ai"`, `fal_endpoint: "fal-ai/wan-i2v"`, `cost_per_5s_usd: 0.53`
- **Sora 2** (line 159): `model_id: "sora-2/video"`, `provider: "kie.ai"`, `cost_per_second_usd: 0.015`, `cost_per_5s_usd: 0.075`

**Note:** The seed file has Sora 2 and Wan 2.6 via Kie.ai (`provider: "kie.ai"`) at Kie.ai bulk rates. The COST_RATES fallback for fal.ai direct access is separate — it covers the case where the FalAdapter calls fal.ai directly at fal.ai rates (not Kie.ai bulk rates). Both rows should exist in `ai_models` (the fal.ai direct-access rows may need adding separately with `provider: "fal.ai"`).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded Kie-only via SHOT_DEFAULT_MODELS | Observatory-driven with provider inference | Phase 07 | FalAdapter can receive production traffic |
| No fal.ai model rows in ai_models | Seeded Sora 2, Wan 2.6, Veo 3.1 | Phase 07 | Observatory can recommend fal models with correct pricing |
| No input validation before provider submission | validateImageInput() before FalAdapter.submitJob() | Phase 07 | Prevents credit burn on repeated WebP/format rejections |

**Not changing in Phase 07 (Phase 08 scope):**
- fal.ai webhook callbacks for long-running jobs (PROV-02)
- Veo 3.1 dialogue generation integration (PROV-04)
- Live production traffic to fal.ai (Phase 08 activates after Phase 07 safety rails)

## Open Questions

1. **Are fal.ai model rows needed with `provider: "fal.ai"` in addition to the existing Kie.ai rows?**
   - What we know: `seed-initial-models.mjs` has Sora 2 and Wan 2.6 under `provider: "kie.ai"` (Kie.ai bulk pricing). The FalAdapter accesses fal.ai directly at fal.ai rates.
   - What's unclear: Does the Observatory need separate `provider: "fal.ai"` rows to correctly price fal-direct calls? Or is the Kie.ai row sufficient since the adapter choice is made by modelId prefix, not the DB provider field?
   - Recommendation: For PROV-05, seed the existing rows (ensure they exist). If `cost_per_second_usd` needs to reflect fal-direct pricing, add separate `provider: "fal.ai"` rows. The COST_RATES fallback in expense-tracker handles pricing regardless.

2. **Veo 3.1 model_id in seed (`veo-3.1-fast/video`) vs. SHOT_DEFAULT_MODELS (`veo-3.1`)**
   - What we know: `SHOT_DEFAULT_MODELS.dialogue.modelId = 'veo-3.1'`. The seed has `model_id: "veo-3.1-fast/video"`.
   - What's unclear: Are these the same model? Is there a `veo-3.1` row (non-fast) needed?
   - Recommendation: Verify by querying `SELECT model_id FROM ai_models WHERE model_id LIKE '%veo%'` on production DB. The PROV-05 success criterion says "Veo 3.1" — add a row with `model_id: 'veo-3.1'` if the fast variant doesn't satisfy the Observatory lookup for `avatar_talking_head` use case.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (configured in `apps/worker/vitest.config.ts`) |
| Config file | `apps/worker/vitest.config.ts` |
| Quick run command | `cd apps/worker && npm test -- --reporter=verbose src/services/model-router/router.test.ts` |
| Full suite command | `cd apps/worker && npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROV-03 | `routeShot()` with social/fal shot returns FalAdapter | unit | `cd apps/worker && npm test -- router.test.ts` | ✅ `router.test.ts` — needs new test case for Observatory provider override |
| PROV-03 | `routeShot()` with dialogue/kie shot returns KieAdapter even when Observatory returns fal modelId | unit | `cd apps/worker && npm test -- router.test.ts` | ✅ existing test passes but doesn't cover provider override path |
| PROV-05 | ai_models rows exist for Sora 2, Wan 2.6, Veo 3.1 | smoke | `cd apps/worker && npx tsx -e "import {query} from './src/db/client'; query(\"SELECT model_id FROM ai_models WHERE model_id IN ('veo-3.1','wan-2.6/video','sora-2/video')\").then(r=>console.log(r.rows))"` | ❌ Wave 0 — write seed verification script |
| PROV-06 | COST_RATES.fal block exists with sora/wan keys | unit | `cd apps/worker && npm test -- expense-tracker` | ❌ Wave 0 — no expense-tracker test exists yet |
| PROV-07 | validateImageInput throws UnrecoverableError for .webp URL | unit | `cd apps/worker && npm test -- input-validator` | ❌ Wave 0 |
| PROV-07 | validateImageInput throws UnrecoverableError for HEAD 404 | unit | `cd apps/worker && npm test -- input-validator` | ❌ Wave 0 |
| PROV-07 | validateImageInput passes for valid .jpg URL with image/jpeg Content-Type | unit | `cd apps/worker && npm test -- input-validator` | ❌ Wave 0 |
| PROV-08 | DECISIONS.md contains Veo 3.1 re-integration entry | manual | Check file content | ❌ Wave 0 (doc change, manual verify) |

### Sampling Rate
- **Per task commit:** `cd apps/worker && npm test -- --reporter=verbose src/services/model-router/router.test.ts`
- **Per wave merge:** `cd apps/worker && npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/worker/src/services/model-router/input-validator.test.ts` — covers PROV-07 (3 test cases: webp reject, HEAD 404 reject, valid jpg pass)
- [ ] `apps/worker/src/services/expense-tracker.test.ts` — covers PROV-06 (fal block exists, correct keys)
- [ ] Router test addition — new test case in `router.test.ts` for Observatory returning fal modelId → FalAdapter selected (PROV-03)
- [ ] DB verification query — inline check that PROV-05 seed rows are present (can be a script, not a unit test)

## Sources

### Primary (HIGH confidence)
- Direct codebase read — `apps/worker/src/services/model-router/router.ts` (bug confirmed at line 125)
- Direct codebase read — `apps/worker/src/services/expense-tracker.ts` (COST_RATES structure confirmed)
- Direct codebase read — `apps/worker/src/services/model-router/provider-adapters/fal-adapter.ts` (full implementation confirmed, never called in production)
- Direct codebase read — `tools/model-observatory/seed-initial-models.mjs` (Veo 3.1, Wan 2.6, Sora 2 rows confirmed)
- Direct codebase read — `apps/worker/src/services/model-router/shot-types.ts` (SHOT_DEFAULT_MODELS confirmed, all fal entries use fal-ai/ prefix)
- https://fal.ai/models/fal-ai/sora-2/image-to-video/pro — Sora 2 pricing verified ($0.30/s 720p, $0.50/s 1080p)
- https://fal.ai/models/wan/v2.6/image-to-video — Wan 2.6 pricing verified ($0.10/s 720p, $0.15/s 1080p)

### Secondary (MEDIUM confidence)
- `apps/worker/src/queue/workers/video-pipeline.worker.ts` — UnrecoverableError usage patterns (8+ existing uses)
- `.claude/skills/model-observatory/SKILL.md` — Observatory architecture and key file map
- `.claude/skills/videoforge-pipeline/SKILL.md` — Cost tracking requirements and known rates

### Tertiary (LOW confidence)
- None — all claims verified from codebase or official fal.ai docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already in project
- Architecture: HIGH — all patterns verified from existing codebase
- Pitfalls: HIGH — router bug confirmed by direct read; UnrecoverableError pattern confirmed by 8 existing usages
- Pricing: HIGH — verified from official fal.ai model pages (March 2026)

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (fal.ai pricing can change; re-verify if >30 days)
