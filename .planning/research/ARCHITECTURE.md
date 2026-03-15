# Architecture Research

**Domain:** Intelligent Content Engine — Multi-Model Video Production with Self-Improving Quality Routing
**Researched:** 2026-03-14
**Confidence:** HIGH (based on direct codebase analysis)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TRIGGER LAYER                                     │
│  WhatsApp Group Message → claudeclaw.worker → module-router          │
│  BullMQ Job → onboarding.worker → character-video-gen module         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    MODEL ROUTING LAYER (EXISTING)                    │
│                                                                      │
│  routeShot(ShotRequest)        ← PRIMARY ENTRY POINT                │
│    │                                                                 │
│    ├─► getRecommendedModel()   ← Observatory DB lookup + 5min cache  │
│    ├─► Budget ceiling check    ← BUDGET_CEILINGS per tier            │
│    ├─► adapterForProvider()    ← KieAdapter | FalAdapter             │
│    └─► logDecision()           ← ai_model_decisions table            │
│                                                                      │
│  [NEW] Quality Feedback Hook   ← reads RouterResult, writes scores   │
└──────────┬───────────────────────────┬──────────────────────────────┘
           │                           │
┌──────────▼────────┐       ┌──────────▼────────────────────────────┐
│  KieAdapter       │       │  FalAdapter                           │
│  (wraps kie.ts)   │       │  (native fetch, queue.fal.run)        │
│  Kling 3.0        │       │  Sora 2 (fal-ai/sora)                │
│  Suno v5          │       │  Wan 2.6 (fal-ai/wan-i2v)            │
│  Veo 3.1          │       │  Kling via fal fallback               │
└──────────┬────────┘       └──────────┬────────────────────────────┘
           │                           │
┌──────────▼───────────────────────────▼────────────────────────────┐
│                    COMPOSITION LAYER (EXISTING)                    │
│                                                                    │
│  remotion-renderer.ts → renderComposition(compositionId, props)   │
│                                                                    │
│  Root.tsx (Composition Registry):                                  │
│    PropertyTour-{16x9|9x16|1x1|4x5}   ← real estate              │
│    CrewReveal-{16x9|9x16}              ← crew intro               │
│    CrewDemo-{16x9|9x16}               ← agent product             │
│    CrewDemoV2, V3                      ← video embed variants      │
│    HairShowreel-{16x9|9x16}           ← local biz (hair)          │
│    CharacterReveal-16x9               ← character in a box        │
│    SocialMockup-*                      ← IG mockups                │
│  [NEW] LocalBizShowreel-{16x9|9x16}  ← parametric local biz       │
│  [NEW] DialogueScene-{16x9|9x16}     ← veo 3.1 talking heads      │
│                                                                    │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────────────┐
│                    DATA LAYER                                       │
│                                                                    │
│  Existing tables:                                                  │
│    ai_models, ai_model_recommendations, ai_model_decisions         │
│    PipelineRun, api_expenses, prompt_configs                       │
│    onboarding_pipeline, onboarding_module_state                    │
│    CharacterBible, Brand, Tenant, ServiceInstance                  │
│                                                                    │
│  [NEW] tables:                                                     │
│    generation_quality_scores   ← feedback loop scores per run      │
│    prompt_effectiveness        ← extends prompt_configs tracking   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | File | Responsibility | Status |
|-----------|------|---------------|--------|
| Model Router | `services/model-router/router.ts` | routeShot() — select model + adapter | Exists |
| Observatory | `services/model-selector.ts` | getRecommendedModel() — DB-driven model selection | Exists |
| KieAdapter | `provider-adapters/kie-adapter.ts` | Kling 3.0, Veo, Suno — wraps kie.ts | Exists |
| FalAdapter | `provider-adapters/fal-adapter.ts` | fal.ai queue — Sora 2, Wan 2.6, Kling fallback | Exists (stub only) |
| Shot Types | `model-router/shot-types.ts` | ShotType taxonomy, SHOT_DEFAULT_MODELS, budget ceilings | Exists |
| Remotion Renderer | `services/remotion-renderer.ts` | renderComposition(), renderPropertyTour() | Exists |
| Root.tsx | `remotion/src/Root.tsx` | Composition registry — all template IDs registered here | Exists |
| Pipeline Run | `services/pipeline-run.ts` | createPipelineRun(), updatePipelineRun() | Exists |
| Expense Tracker | `services/expense-tracker.ts` | trackExpense() → api_expenses | Exists |
| Prompt Store | `services/prompt-store.ts` | getPrompt(), renderPrompt() — DB-driven prompts | Exists |
| Quality Scorer | `services/quality-scorer.ts` | Score generation output, feed back to observatory | **New** |
| Prompt Index | `services/prompt-index.ts` | Track which prompts produce high-quality results | **New** |
| Veo Adapter | `provider-adapters/veo-adapter.ts` OR extend KieAdapter | Veo 3.1 via Kie.ai endpoint for dialogue shots | **New** |
| Local Biz Templates | `remotion/src/LocalBizShowreelComposition.tsx` | Parametric template for any local business niche | **New** |

---

## Recommended Project Structure (New Files Only)

```
apps/worker/src/
├── services/
│   ├── model-router/
│   │   ├── router.ts                      # MODIFY: add quality hook after RouterResult
│   │   ├── shot-types.ts                  # MODIFY: add 'dialogue' → veo-3.1 via fal or kie
│   │   └── provider-adapters/
│   │       ├── fal-adapter.ts             # MODIFY: activate real fal.ai calls (Sora 2, Wan 2.6)
│   │       ├── kie-adapter.ts             # MODIFY: add Veo 3.1 endpoint branch
│   │       └── types.ts                   # No change needed
│   ├── quality-scorer.ts                  # NEW: score generation output quality
│   └── prompt-index.ts                    # NEW: effectiveness tracking for prompts
│
apps/worker/remotion/src/
├── Root.tsx                               # MODIFY: register new compositions
├── LocalBizShowreelComposition.tsx        # NEW: parametric local biz template
├── DialogueSceneComposition.tsx           # NEW: veo 3.1 talking head template
└── types/
    ├── local-biz-showreel-props.ts        # NEW: props for local biz template
    └── dialogue-scene-props.ts            # NEW: props for dialogue template
```

---

## Architectural Patterns

### Pattern 1: Quality Feedback Hook on RouterResult

**What:** After `routeShot()` returns a `RouterResult` and the generation completes (success or failure), call `qualityScorer.record()` with the actual result. The scorer writes to `generation_quality_scores`. The Observatory's daily-sync reads these scores to update `ai_model_recommendations`.

**When to use:** Every call to `routeShot()` that produces a final result (not intermediate poll).

**Integration point:** `character-video-gen.ts` line 249 (after `pollResult.status === 'completed'`), and the video-pipeline worker after each clip completes.

**Why not in router.ts itself:** The router cannot know the final quality — it only submits the job. Quality is known after polling completes, which happens in the calling module.

```typescript
// Pattern: call after adapter.pollStatus() returns completed
if (pollResult.status === 'completed' && pollResult.resultUrl) {
    // existing: return resultUrl
    // NEW: record quality asynchronously (non-blocking, never throws)
    qualityScorer.record({
        shotType: routerResult.shotType,
        modelId: routerResult.selection.modelId,
        provider: jobResult.provider,
        pipelineRunId,
        tenantId,
        qualityScore: null,      // filled later by human approval or auto-scorer
        success: true,
        costCents: Math.round(routerResult.estimatedCost * 100),
    }).catch(() => {});
}
```

### Pattern 2: New Remotion Templates as Parametric Compositions

**What:** Every new local business niche gets the same `LocalBizShowreelComposition` with different props — not a new composition. Register once in `Root.tsx` with a single composition ID and wide-open props schema.

**Why:** The current pattern (HairShowreel with hardcoded Hair Approach URLs in defaultProps) creates one composition per customer. Parametric design means one composition handles all niches via `inputProps` at render time.

**Registration in Root.tsx:**
```tsx
<Composition
    id="LocalBizShowreel-16x9"
    component={LocalBizShowreelComposition}
    width={1920}
    height={1080}
    fps={FPS}
    durationInFrames={sec(30)}
    defaultProps={LOCAL_BIZ_DEFAULT_PROPS}
/>
```

**Calling from remotion-renderer.ts:**
```typescript
await renderComposition({
    compositionId: 'LocalBizShowreel-16x9',
    inputProps: localBizProps,  // tenant-specific, passed at render time
    outputPath,
    concurrency: 2,
});
```

### Pattern 3: FalAdapter Activation Without Breaking KieAdapter

**What:** The current `SHOT_DEFAULT_MODELS` in `shot-types.ts` already declares `fal` as the provider for `narrative`, `environment`, and `social` shot types. The `FalAdapter` class exists and has complete implementation. The only missing piece is `FAL_API_KEY` in the environment and validation that the fal.ai request body format matches each specific model.

**Critical detail:** Each fal.ai model has different input schemas. The current `FalAdapter.submitJob()` sends a generic `{ prompt, image_url, duration }` body. `fal-ai/sora` expects `{ prompt, duration }` (no image_url). `fal-ai/wan-i2v` expects `{ image_url, prompt }`. `fal-ai/kling-video/v2.1/pro/image-to-video` expects `{ prompt, image_url, duration }`.

**Fix pattern:** Add a model-specific body builder inside FalAdapter before activating in production:
```typescript
private buildRequestBody(req: ShotRequest, modelId: string): Record<string, unknown> {
    if (modelId.includes('sora')) {
        return { prompt: req.prompt, duration: req.durationSeconds ?? 5 };
    }
    if (modelId.includes('wan-i2v')) {
        return { image_url: req.imageUrl, prompt: req.prompt };
    }
    // default: Kling-compatible
    return { prompt: req.prompt, image_url: req.imageUrl, duration: req.durationSeconds ?? 5 };
}
```

### Pattern 4: Prompt Effectiveness Tracking (Extend, Don't Replace)

**What:** The existing `prompt_configs` table and `prompt-store.ts` manage prompt templates with version numbers. Prompt effectiveness tracking adds a parallel `prompt_effectiveness` table that records which prompt versions (by `service + prompt_key + version`) lead to high-quality outputs.

**Why not extend prompt_configs:** The configs table is the write source for prompts. Effectiveness is read-only aggregate data produced by the quality feedback loop. Mixing them creates a circular dependency (prompt selection depends on outcome, outcome depends on prompt selected).

**New table shape:**
```sql
CREATE TABLE IF NOT EXISTS prompt_effectiveness (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    service TEXT NOT NULL,
    prompt_key TEXT NOT NULL,
    prompt_version INTEGER NOT NULL,
    quality_score NUMERIC(4,2),       -- 0.00-1.00 aggregate
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    total_cost_cents INTEGER DEFAULT 0,
    last_scored_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Data Flow

### Flow 1: Generation with Quality Recording (New)

```
character-video-gen (or any producer)
    │
    ├─► routeShot({ shotType, budgetTier, prompt, tenantId })
    │       │
    │       ├─► getRecommendedModel(useCase)     [observatory — 5min cache]
    │       ├─► budget ceiling check
    │       ├─► adapterForProvider()             [KieAdapter | FalAdapter]
    │       └─► logDecision() → ai_model_decisions
    │
    ├─► adapter.submitJob()                       [fal.ai or Kie.ai API]
    │
    ├─► adapter.pollStatus() loop until complete
    │
    ├─► on complete: resultUrl obtained
    │       │
    │       ├─► [existing] download → R2 upload → trackExpense()
    │       └─► [NEW] qualityScorer.record()     → generation_quality_scores
    │
    └─► updatePipelineRun(status: completed)
```

### Flow 2: Observatory Self-Improvement Loop (New)

```
Daily cron (or triggered by admin)
    │
    └─► qualityAggregator.run()
            │
            ├─► SELECT AVG(quality_score) FROM generation_quality_scores
            │   GROUP BY model_id, shot_type, last 7 days
            │
            ├─► UPDATE ai_model_recommendations
            │   SET recommended_model_id = best_performing_model
            │   WHERE use_case = shot_use_case
            │
            └─► clearModelCache()               [invalidate 5min model cache]
```

### Flow 3: New Remotion Template Render (Parametric)

```
Admin or automated trigger
    │
    ├─► build LocalBizShowreelProps from tenant data (Brand, ServiceInstance, TenantAsset)
    │
    ├─► renderComposition({
    │       compositionId: 'LocalBizShowreel-16x9',
    │       inputProps: props,
    │       outputPath: '/tmp/...'
    │   })
    │       │
    │       └─► Root.tsx: <LocalBizShowreelComposition {...inputProps} />
    │
    ├─► uploadToR2(outputPath, r2Key)
    │
    └─► sendVideo(groupId, r2Url, caption)    [WhatsApp delivery]
```

### Flow 4: FalAdapter Activation Path

```
routeShot({ shotType: 'narrative', ... })
    │
    ├─► SHOT_DEFAULT_MODELS['narrative'].provider = 'fal'   [already set]
    ├─► adapterForProvider('fal') → new FalAdapter()        [already set]
    │
    └─► FalAdapter.submitJob(req, 'fal-ai/kling-video/v2.1/pro/image-to-video')
            │
            POST https://queue.fal.run/{modelId}
            Authorization: Key {FAL_API_KEY}       ← must be set in .env
            body: { input: { prompt, image_url, duration } }
            │
            └─► returns { request_id }
                    │
                    └─► externalJobId = "{modelId}::{request_id}"

FalAdapter.pollStatus("{modelId}::{request_id}")
    │
    GET https://queue.fal.run/{modelId}/requests/{requestId}/status
    │
    └─► { status: 'COMPLETED', output: { video: { url: '...' } } }
```

---

## Integration Points — New vs Existing

### router.ts Modifications

The router does NOT need internal changes to support quality feedback. The quality hook lives in the calling code (each module that calls `routeShot`). However, `routeShot` should expose `externalJobId` passthrough so callers can correlate quality scores to decisions logged in `ai_model_decisions`.

Recommended: add `jobId` to `RouterResult` (currently it is not returned, only logged).

### shot-types.ts Modifications

Current `dialogue` shot type points to `veo-3.1` via `kie` provider. Veo 3.1 uses a different Kie.ai endpoint (`/api/v1/veo/generate`) not the standard Kling endpoint. The `KieAdapter._submitVideoJob()` currently calls `createKlingTask()` for all video shot types. Veo 3.1 requires branching inside `KieAdapter.submitJob()` or a dedicated `VeoAdapter`.

Recommended: branch inside `KieAdapter` based on `modelId.startsWith('veo-')`, calling a `createVeoTask()` function in `kie.ts`.

### Root.tsx Registration (New Templates)

New compositions follow the exact pattern of existing ones. Registration in `Root.tsx` is the only change required — the renderer picks up compositions by ID string. No changes to `remotion-renderer.ts` needed.

### DB Tables Required

| Table | Action | Notes |
|-------|--------|-------|
| `generation_quality_scores` | CREATE | New — quality feedback loop |
| `prompt_effectiveness` | CREATE | New — prompt score aggregates |
| `ai_model_decisions` | No change | Already logs routeShot decisions |
| `ai_model_recommendations` | No change | Observatory reads/writes this |
| `PipelineRun` | No change | Already tracks cost + model |
| `prompt_configs` | No change | Prompt store — read only by pipeline |

### External Services

| Service | Integration Pattern | Activation Status | Notes |
|---------|---------------------|-------------------|-------|
| fal.ai (Sora 2) | FalAdapter → queue.fal.run | Code ready, needs FAL_API_KEY | Request body must be `{ prompt, duration }` (no image_url) |
| fal.ai (Wan 2.6) | FalAdapter → queue.fal.run | Code ready, needs FAL_API_KEY | `fal-ai/wan-i2v` needs `{ image_url, prompt }` |
| fal.ai (Kling fallback) | FalAdapter → queue.fal.run | Code ready, needs FAL_API_KEY | Same body as Kie.ai Kling |
| Veo 3.1 (via Kie.ai) | KieAdapter → Kie.ai /veo/generate | Needs branching in KieAdapter | Different endpoint than Kling |
| Remotion (new templates) | renderComposition() by ID | No infra change needed | Register in Root.tsx only |

---

## Build Order (Dependency-Constrained)

### Phase 1: Foundation — FalAdapter Activation

**What:** Make real fal.ai calls work for narrative, environment, and social shot types. No new infrastructure — the adapter and router already exist.

**Files to change:**
1. `provider-adapters/fal-adapter.ts` — add model-specific request body builder
2. `.env` — add `FAL_API_KEY`
3. `shot-types.ts` — verify `fal-ai/sora`, `fal-ai/wan-i2v` model IDs match fal.ai docs

**Why first:** Every other feature (quality scoring, self-learning) depends on having real generation data from multiple providers. Can't score what doesn't generate.

**Memory impact:** No new memory pressure — FalAdapter uses native fetch, no new process.

### Phase 2: Veo 3.1 Re-Integration for Dialogue

**What:** Branch `KieAdapter.submitJob()` to route dialogue shots to `/api/v1/veo/generate` endpoint on Kie.ai instead of the Kling endpoint.

**Files to change:**
1. `services/kie.ts` — add `createVeoTask()` function
2. `provider-adapters/kie-adapter.ts` — branch on `modelId.startsWith('veo-')`

**Why second:** Dialogue shot type is the most differentiated (talking heads). Once fal.ai is working for other types, completing the model coverage for dialogue rounds out the multi-model story.

**No dependency on Phase 1** — can be parallelized.

### Phase 3: Quality Feedback Loop

**What:** Add `generation_quality_scores` table, `quality-scorer.ts` service, and wire it into `character-video-gen.ts` (and `video-pipeline.worker.ts` for the broader pipeline).

**Files to change:**
1. New SQL migration — `generation_quality_scores` table
2. New `services/quality-scorer.ts`
3. `services/onboarding/modules/character-video-gen.ts` — add `qualityScorer.record()` after each completed scene
4. `services/model-selector.ts` or new `daily-sync.ts` — aggregate scores → update observatory

**Depends on:** Phase 1 (need real fal.ai data to score) and Phase 2 (need veo data to score dialogue).

**Memory impact:** Table write only — no new in-process memory.

### Phase 4: Prompt Effectiveness Tracking

**What:** Add `prompt_effectiveness` table. After quality scores are recorded, aggregate by `(service, prompt_key, version)` and update effectiveness table.

**Files to change:**
1. New SQL migration — `prompt_effectiveness` table
2. New `services/prompt-index.ts` — joins `generation_quality_scores` to `prompt_configs` via pipelineRunId

**Depends on:** Phase 3 (quality scores must exist before prompt effectiveness can be measured).

**Note:** `prompt_configs` already has `version` column. The link between a generation and its prompt version is via `PipelineRun.inputJson` (store which prompt version was used when generating).

### Phase 5: Parametric Remotion Templates

**What:** Build `LocalBizShowreelComposition.tsx` as a fully parametric template that accepts `businessName`, `niche`, `motionClips[]`, `photos[]`, `accentColor`, `ctaText`. Register in `Root.tsx`.

**Files to change:**
1. New `remotion/src/types/local-biz-showreel-props.ts`
2. New `remotion/src/LocalBizShowreelComposition.tsx`
3. `remotion/src/Root.tsx` — register `LocalBizShowreel-16x9` and `LocalBizShowreel-9x16`

**Why last:** Templates are a product delivery layer. They don't depend on quality routing to function, but having quality routing working first means the clips that feed into templates are optimized.

**Memory impact:** Remotion rendering is the most memory-intensive operation. Each concurrent render thread uses ~400MB on the 6GB VPS. Current `concurrency: 2` setting in `remotion-renderer.ts` is correct and must not change.

---

## Scaling Considerations (6GB VPS Constraint)

| Concern | Current | With New Features | Mitigation |
|---------|---------|-------------------|------------|
| Remotion render memory | ~800MB peak (2 threads) | Same — concurrency: 2 enforced | Never increase concurrency |
| Parallel fal.ai requests | 5 scenes concurrent (character-video-gen) | Same pattern | No new parallelism needed |
| Quality score writes | 0 | Low — one INSERT per completed generation | Non-blocking, never fails pipeline |
| Model cache memory | Map with 10-20 entries max | Add 2-3 entries for new models | Negligible |
| PM2 worker process | ~300MB baseline | +50MB estimate for new tables/services | No process split needed |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Separate Observatory for fal.ai

**What people do:** Create a second Observatory table or selector specifically for fal.ai models.

**Why wrong:** The existing `ai_models` table and `ai_model_recommendations` are provider-agnostic. The `model_id` column stores identifiers like `fal-ai/sora` already. Adding fal.ai models is a data migration (INSERT rows), not a schema or code change.

**Do this instead:** INSERT fal.ai model rows into `ai_models` with correct `cost_per_5s_usd` values. The Observatory already handles them.

### Anti-Pattern 2: Quality Score in router.ts

**What people do:** Try to close the feedback loop inside `routeShot()` itself.

**Why wrong:** `routeShot()` only submits jobs — it returns before the job completes. Quality can only be assessed after polling completes, which happens minutes later in the calling module. Adding a callback or promise chain inside the router breaks its clean separation.

**Do this instead:** Quality recording lives in the modules that call `routeShot()` and own the polling loop. The router stays stateless.

### Anti-Pattern 3: Per-Niche Remotion Compositions

**What people do:** Copy `HairShowreelComposition.tsx` and rename it `RestaurantShowreel`, `PlumberShowreel`, etc.

**Why wrong:** Each composition registration in `Root.tsx` increases bundle size. The renderer bundles the entire project once on startup. More compositions = slower startup, more memory on a 6GB VPS.

**Do this instead:** One `LocalBizShowreelComposition` with a `niche` prop that drives the visual treatment (color palette, intro text style). Test with `defaultProps` for the initial niche, override at render time for others.

### Anti-Pattern 4: Blocking Pipeline on Quality Scoring

**What people do:** `await qualityScorer.record(...)` before returning from the generation loop.

**Why wrong:** Quality scoring is observational. The customer's video should not wait for a DB write that's only useful for future routing. A failure in quality recording must never block delivery.

**Do this instead:** `qualityScorer.record(...).catch(() => {})` — fire and forget, same pattern as `logDecision()` in `router.ts`.

---

## Sources

- Direct codebase analysis (HIGH confidence):
  - `/apps/worker/src/services/model-router/router.ts` — routing logic
  - `/apps/worker/src/services/model-selector.ts` — observatory pattern
  - `/apps/worker/src/services/model-router/provider-adapters/fal-adapter.ts` — fal.ai implementation
  - `/apps/worker/src/services/model-router/shot-types.ts` — shot taxonomy
  - `/apps/worker/remotion/src/Root.tsx` — composition registry
  - `/apps/worker/src/services/remotion-renderer.ts` — render entry point
  - `/apps/worker/src/services/onboarding/modules/character-video-gen.ts` — existing generation pattern
  - `/apps/worker/src/services/prompt-store.ts` — prompt management pattern
  - `/apps/worker/src/queue/queues.ts` — 7 BullMQ queues
  - `/apps/worker/src/services/pipeline-run.ts` — run lifecycle
  - `/apps/worker/src/services/expense-tracker.ts` — cost tracking

---
*Architecture research for: Intelligent Content Engine (v1.1 milestone)*
*Researched: 2026-03-14*
