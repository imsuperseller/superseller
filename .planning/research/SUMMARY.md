# Project Research Summary

**Project:** Intelligent Content Engine — v1.1 Multi-Model AI Video Production
**Domain:** Multi-model AI video pipeline with self-improving quality routing
**Researched:** 2026-03-14
**Confidence:** HIGH

## Executive Summary

This is not a greenfield project — it is a targeted activation and extension of infrastructure that already exists in production. The worker has a complete FalAdapter (written but never called), a Model Observatory with routing logic, 8 Remotion compositions, cost tracking, and engagement metrics columns that have never been written to. The v1.1 milestone's job is to close four open loops: activate fal.ai as a live provider (Sora 2, Wan 2.6), re-integrate Veo 3.1 via the correct Kie.ai endpoint, wire a real quality feedback signal from generation outcomes back into routing decisions, and add parametric Remotion templates for the local-business niche that currently has zero coverage.

The recommended approach is dependency-constrained sequential delivery: fal.ai activation first (every other feature depends on having real multi-provider generation data), Veo 3.1 dialogue re-integration second (can be parallelized with fal activation), quality feedback loop third (reader and writer must ship together — writer-only is logging, not a loop), and parametric Remotion templates last (independent of routing but benefits from optimized clip inputs). The "self-learning" claim must be understood precisely: this is a data-driven recommendation system where 30-day rolling engagement averages update Observatory scores, not RLHF or fine-tuning.

The primary risk is cost burn from undisciplined fal.ai activation. The Feb 2026 incident ($8.60 burned on format errors) is the established pattern for this codebase: code that looks ready burns credits before the validation layer is in place. Three pre-conditions must be enforced before any fal.ai production traffic: `FAL_API_KEY` set in `.env`, format validation on image URLs before `submitJob()`, and 4xx responses wrapped in `UnrecoverableError` to prevent BullMQ auto-retry. A secondary risk is the feedback loop that writes but never reads — the `performance_score` column already exists and has never been populated, which is the canonical example of schema-first development that never closes. Build the Observatory reader simultaneously with the generation writer.

## Key Findings

### Recommended Stack

The stack requires zero new major dependencies. The existing worker (BullMQ, Remotion 4.0.429, pg, zod, child_process) handles all new functionality without additions. Two optional packages are available if TypeScript type coverage is valued: `pgvector@0.2.1` for typed vector serialization (prompt_library queries) and `@fal-ai/client@1.9.4` for the Sora 2 Characters API typed response. Both are genuinely optional — raw SQL and native fetch work throughout.

**Core technologies:**
- `FalAdapter` (existing): fal.ai queue REST — already written, needs `FAL_API_KEY` + model-specific body builder
- `KieAdapter` + `kie.ts` (existing): Kling 3.0 + Veo 3.1 — Veo needs a branch to `/api/v1/veo/generate` endpoint (not the Kling task endpoint)
- FFmpeg via `child_process.spawn` (existing): heuristic quality scoring (blur, entropy, motion) — no reference video needed, no Python dependency
- Ollama nomic-embed-text + pgvector HNSW (existing on RackNerd): prompt_library embedding and similarity search
- Remotion 4.0.429 (existing): parametric `calculateMetadata` pattern for dynamic-duration local business templates
- `bullmq` (existing): new `quality-scoring` queue for async score computation post-generation

**Critical model ID corrections required before activation:**
- `environment` shot: `fal-ai/sora` → `fal-ai/sora-2/image-to-video/pro`
- `social` shot: `fal-ai/wan-i2v` → `wan/v2.6/image-to-video` (Flash variant: `wan/v2.6/image-to-video/flash` at $0.05/s)
- `dialogue` shot: must call `POST /api/v1/veo/generate` with `model: "veo3"` (NOT the Kling `createTask` endpoint)

**One new environment variable required:** `FAL_API_KEY` (format: `key_...` from fal.ai dashboard). `KIE_API_KEY` and `OLLAMA_BASE_URL` already exist and cover Veo 3.1 and prompt embedding respectively.

### Expected Features

**Must have (table stakes — v1.1 launch blockers):**
- fal.ai models seeded in `ai_models` table (Sora 2, Wan 2.6, Veo 3.1) with correct cost_per_second_usd and fal_endpoint
- fal.ai webhook endpoint (`POST /api/webhooks/fal`) — Sora 2 and Veo 3.1 routinely exceed 10-minute generation time, making BullMQ polling timeouts certain without webhooks; handler must be idempotent on `request_id` (fal delivers up to 10 times over 2 hours)
- Per-clip `generation_meta` JSONB column on `content_entries` — fields: model_id, provider, prompt_key, prompt_version, generation_cost_usd, duration_sec, shot_type; foundation for every feedback mechanism
- Quality feedback aggregation job — nightly BullMQ job that reads `content_entries WHERE performanceScore IS NOT NULL`, joins to `generation_meta.model_id`, writes aggregated avg to `ai_model_recommendations` per use_case; minimum 20 samples before any routing adjustment
- `BeforeAfterComposition` (Remotion) — #1 performing local business video format (2026 social data); wipe transition primitives already exist in the codebase

**Should have (competitive differentiators, add after core is stable):**
- `TestimonialComposition` — #2 performing local business format; GlassPanel + AnimatedBg components already exist
- `SeasonalAlertComposition` — 9x16 only, urgency-driven short-form
- Veo 3.1 native audio for dialogue shots — doubles cost ($0.20/s → $0.40/s); add after Veo baseline works
- Router model score decay — weekly decay of quality_score for models with no recent positive feedback; add after 30+ days of feedback data
- Prompt effectiveness query — admin endpoint for avg performanceScore by prompt_key + version + shot_type

**Defer (v2+):**
- Automated Observatory daily sync (replace manual curation) — defer until 90+ days of feedback data
- Multi-tenant prompt personalization — defer until a customer explicitly requests brand-specific prompt language
- Real-time generation status push to WhatsApp — anti-feature; sends ONE message on completion only
- Scheduled Kie.ai/fal.ai generation crons — violates explicit business rule; on-demand with WhatsApp approval only

### Architecture Approach

The system follows a layered architecture where the Model Routing Layer (existing `routeShot()`) sits between trigger sources (WhatsApp messages, BullMQ jobs) and provider adapters (KieAdapter, FalAdapter). Quality feedback is not inserted into the router itself — the router is stateless and returns before generation completes. Quality recording lives in the calling modules that own the polling loop. The Observatory (Model Selector) acts as the sole decision-making authority for model selection and is updated asynchronously by a daily aggregation job, not inline during generation.

**Major components:**
1. `routeShot()` in `model-router/router.ts` — MODIFY: expose `provider` field on RouterResult so callers can pass it to `trackExpense()`; the Observatory adapter selection must use `selection.provider` not `defaultHint.provider`
2. `FalAdapter` in `provider-adapters/fal-adapter.ts` — MODIFY: add `buildRequestBody()` switching on modelId (Sora 2 vs Wan 2.6 have different input schemas); add `UnrecoverableError` wrapping for 4xx
3. `KieAdapter` / `kie.ts` — MODIFY: branch on `modelId.startsWith('veo-')` to call `createVeoTask()` at `/api/v1/veo/generate`
4. `quality-scorer.ts` — NEW: fire-and-forget score recording after each completed generation; writes to `generation_quality_scores` table
5. `LocalBizShowreelComposition.tsx` — NEW: single parametric composition serving all local business niches via `inputProps`; registered once in `Root.tsx` (not per-niche)
6. Daily quality aggregation — NEW: BullMQ job that closes the Observatory feedback loop

**Two new DB tables required:**
- `generation_quality_scores` — per-generation quality feedback
- `prompt_effectiveness` — aggregate prompt performance by (service, prompt_key, version)

**Build order constraint:** Phase 1 (fal.ai activation) → Phase 3 (quality loop) requires real generation data; cannot build a feedback system with no generations. Phases 1 and 2 (Veo 3.1) can be parallelized. Phase 5 (Remotion templates) is fully independent.

### Critical Pitfalls

1. **Provider adapter mismatch** — `routeShot()` instantiates adapters from `defaultHint.provider` (hardcoded), not from the Observatory recommendation. If the Observatory recommends a fal.ai model for a shot type that defaults to `provider: 'kie'`, the KieAdapter is called with a fal model ID, returning 422. Fix: add `provider` column to `ai_models`; `getRecommendedModel()` returns provider alongside modelId; `routeShot()` uses `selection.provider`. Must be fixed in Phase 1 before any fal route goes live.

2. **fal.ai billing on failure is undocumented — assume you pay** — The Feb 2026 incident ($8.60 on format errors) established this pattern. fal.ai does not document whether charges apply on error vs. completion. Prevention: (a) image URL format validation before `submitJob()`; (b) `UnrecoverableError` for 4xx to block BullMQ retries; (c) log every `request_id` immediately for deduplication; (d) run one test job and monitor the billing dashboard before any production traffic.

3. **Quality feedback loop that writes but never reads** — `content_entries.performance_score` exists in schema, is never written. The Observatory is manually seeded and never updated by pipeline. Building only the writing side creates the illusion of a self-improving system. Prevention: build the Observatory reader (aggregation job that updates `ai_model_recommendations`) in the same phase as the writer. Verify with a SQL query that routing frequency shifts after score accumulation.

4. **Cold start degrades routing** — with small sample sizes (2-5 generations), a feedback loop that adjusts routing early can lock in a bad model. Prevention: `minSamplesBeforeAdjustment = 20` constant in `config.ts`; routing falls back to static defaults below threshold; aggregate across all tenants, not per-tenant.

5. **Veo 3.1 re-removal recurrence** — Veo 3.1 was removed in Feb 2026 as a documented strategy decision (Kling-only mandate). `shot-types.ts` currently references `veo-3.1` while `types/index.ts` and `kie.ts` say "No Veo." Re-integrating without a `DECISIONS.md` entry reversing the Feb 2026 decision means it will be removed again. Prevention: write the DECISIONS.md entry first, update `types/index.ts` and `kie.ts` comment to agree, then write code.

## Implications for Roadmap

Based on research, the dependency graph dictates 5 phases with 2 parallelization opportunities:

### Phase 1: fal.ai Provider Activation and Cost Safety
**Rationale:** Every other feature (quality scoring, feedback loops) requires real multi-provider generation data. Cannot build a feedback system with no generations. Also, every cost-safety measure must be in place before any production traffic.
**Delivers:** Working Sora 2 and Wan 2.6 generation via FalAdapter; correct cost attribution per provider; webhook endpoint for long-running generation jobs
**Addresses:** Table-stakes features: fal.ai models seeded, webhook endpoint, per-clip generation_meta, cost rates for new providers
**Avoids:** Provider adapter mismatch pitfall; fal.ai billing-on-failure pitfall; per-clip cost attribution broken pitfall
**Key tasks:** Fix `provider` column in `ai_models` + `routeShot()` adapter selection; add model-specific `buildRequestBody()` to FalAdapter; set `FAL_API_KEY` in production `.env`; add `generation_meta` JSONB column to `content_entries`; build `POST /api/webhooks/fal` with idempotent `request_id` handling; seed ai_models rows for Sora 2 and Wan 2.6
**Research flag:** Standard patterns — fal.ai queue API is well-documented; FalAdapter already written. Skip research-phase.

### Phase 2: Veo 3.1 Dialogue Re-Integration
**Rationale:** Independent of Phase 1 — can be parallelized. Veo 3.1 completion rounds out the multi-model coverage. Dialogue shots (talking heads) are the highest-differentiation shot type. Must be preceded by a DECISIONS.md entry reversing the Feb 2026 Kling-only mandate.
**Delivers:** Working `dialogue` shot type via Veo 3.1 at `/api/v1/veo/generate` (not Kling endpoint); `veo3_fast` for budget tier, `veo3` for premium
**Addresses:** Differentiator feature: Veo 3.1 native audio for dialogue shots (gate on baseline working first)
**Avoids:** Veo 3.1 re-removal recurrence pitfall; `shot-types.ts` / `types/index.ts` / `kie.ts` inconsistency
**Key tasks:** Write DECISIONS.md entry; add `createVeoTask()` + `pollVeoTask()` to `kie.ts`; branch `KieAdapter.submitJob()` on `modelId.startsWith('veo-')`; update `shot-types.ts` dialogue model ID; align `types/index.ts` ModelPreference enum
**Research flag:** Standard patterns — Kie.ai Veo 3.1 endpoint verified in STACK.md. Skip research-phase.

### Phase 3: Quality Feedback Loop (Writer + Reader Together)
**Rationale:** Requires Phases 1 and 2 complete (needs real generation data from both providers). Writer and reader must ship in the same phase — writer-only is logging, not a feedback system.
**Delivers:** Working Observatory self-improvement: generation outcomes → quality scores → Observatory update → routing changes; prompt effectiveness tracking as admin insight
**Addresses:** Must-have: quality feedback aggregation job. Differentiator: prompt effectiveness index; router model score decay (P3, add after 30 days of data)
**Avoids:** Feedback loop that writes but never reads; cold start routing degradation (minimum sample threshold); prompt index nobody queries (define effectiveness metric before building)
**Key tasks:** Create `generation_quality_scores` and `prompt_effectiveness` tables; build `quality-scorer.ts` (fire-and-forget pattern); wire `qualityScorer.record()` into character-video-gen and video-pipeline workers post-poll; build daily aggregation BullMQ job with `minSamplesBeforeAdjustment = 20`; build `GET /api/admin/prompt-effectiveness` admin endpoint; verify with SQL that routing frequency changes after accumulation
**Research flag:** Needs care on sample threshold tuning — use 20 as starting constant, make configurable. Standard aggregation patterns otherwise.

### Phase 4: Parametric Remotion Template Library
**Rationale:** Fully independent of Phases 1-3 but benefits from having optimized clip inputs when connected. Can be parallelized with Phase 3 if development capacity allows. BeforeAfterComposition is the highest-value addition — no local-business composition currently exists.
**Delivers:** `BeforeAfterComposition` (16x9 + 9x16), `TestimonialComposition`, `SeasonalAlertComposition`; single parametric LocalBizShowreel replacing per-niche copy-paste pattern
**Addresses:** P1 features: BeforeAfterComposition. P2 features: Testimonial, Seasonal. Anti-feature avoided: per-niche composition proliferation
**Avoids:** Remotion bundle bloat pitfall — one `LocalBizShowreelComposition` with `niche` prop, not separate compositions per customer; measure bundle size before and after each addition; validate RackNerd OOM safety after deployment
**Key tasks:** Benchmark current bundle size; build `LocalBizShowreelComposition.tsx` with `BusinessVideoProps` interface; build `BeforeAfterComposition` (wipe transition primitives exist); build `TestimonialComposition` (GlassPanel + AnimatedBg components exist); register all in Root.tsx; validate `ensureBundle()` completes without OOM on RackNerd
**Research flag:** Standard Remotion 4.0 patterns — calculateMetadata, parametric compositions are well-documented. Skip research-phase.

### Phase 5: Feedback Loop Maturation and Router Intelligence
**Rationale:** Cannot build meaningful decay or automated Observatory sync until 30+ days of Phase 3 feedback data exists. This phase operationalizes the feedback loop rather than building it.
**Delivers:** Router model score decay (prevents stale routing from degraded models); automated Observatory daily sync (removes manual curation); V1.1 milestone closes
**Addresses:** P3 features: router model score decay, automated Observatory sync
**Avoids:** Observatory cache invalidation after automated updates (call `clearModelCache()` after each sync)
**Key tasks:** Add decay cron (reduce quality_score N% per week if no positive feedback, configurable rate); convert manual Observatory curation to automated daily re-ranking; add `clearModelCache()` call after each automated update
**Research flag:** Standard patterns — skip research-phase.

### Phase Ordering Rationale

- Phase 1 before everything because fal.ai generation data is the dependency for all feedback features; cost safety must precede any production traffic
- Phases 1 and 2 can be parallelized by separate developers — no shared files except `shot-types.ts` which needs coordination
- Phase 3 cannot start until Phases 1 and 2 have produced at least a few real generations to validate the feedback schema
- Phase 4 is fully independent and can be scheduled in parallel with Phase 3 if capacity exists
- Phase 5 is explicitly gated on 30+ days of Phase 3 data — it should not be rushed

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (Quality Feedback Loop):** The minimum sample threshold (20 generations) is a starting estimate. The aggregation SQL and Observatory update logic should be reviewed for edge cases — e.g., what happens when a model is deprecated mid-accumulation, or when a tenant's content gets zero engagement (performanceScore = 0 vs NULL distinction matters for averages).

Phases with standard patterns (skip research-phase):
- **Phase 1:** fal.ai queue API fully documented; FalAdapter already written and validated against docs
- **Phase 2:** Kie.ai Veo 3.1 endpoint verified against official docs in STACK.md
- **Phase 4:** Remotion 4.0 parametric compositions are well-documented; wipe/transition primitives confirmed in codebase
- **Phase 5:** Score decay math is straightforward; Observatory sync follows existing aggregation pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All model IDs verified against official fal.ai and kie.ai docs; npm package versions confirmed via registry; existing codebase directly inspected |
| Features | HIGH | Existing schema and code inspected directly; fal.ai webhook behavior verified via official docs; local business video format data from industry publication (MEDIUM confidence for that specific claim) |
| Architecture | HIGH | Based entirely on direct codebase analysis — router.ts, fal-adapter.ts, model-selector.ts, shot-types.ts, remotion-renderer.ts all inspected; no inference |
| Pitfalls | HIGH | Grounded in this codebase's actual failure history (findings.md Feb 2026 incidents); fal.ai billing behavior is the one genuine unknown |

**Overall confidence:** HIGH

### Gaps to Address

- **fal.ai billing on failure:** Genuinely unknown from documentation. Plan one test job before any production tenant traffic and monitor the fal.ai dashboard. Accept that the first test may incur a small charge (~$0.30-$0.50 for a 5s Wan 2.6 Flash clip) to establish ground truth.
- **Veo 3.1 removal reason:** The Feb 2026 removal is documented as a "strategy decision" but the specific reason (API instability vs. quality vs. cost vs. codebase complexity) affects whether re-integration is appropriate. Before writing Phase 2 code, pull the full `findings.md` 2026-02-17 entry and confirm the reversal is justified.
- **Observable routing change:** No historical data exists to validate that 20 is the right minimum sample threshold. Monitor the first 60 days of Phase 3 to tune this constant before Phase 5 decay logic is built on top of it.
- **RackNerd memory headroom:** Current worker baseline is ~300MB with 3.1GB available. Adding quality-scorer service, new DB tables, and Remotion compositions is estimated at +50MB. Validate with `htop` post-Phase 4 deploy before assuming headroom is adequate.

## Sources

### Primary (HIGH confidence)
- fal.ai Sora 2 I2V API docs — model ID `fal-ai/sora-2/image-to-video/pro`, character_ids, response schema
- fal.ai Sora 2 Characters endpoint — `POST /characters`, `CreateCharacterOutput`
- fal.ai Wan 2.6 I2V API — model ID `wan/v2.6/image-to-video`, Flash variant, input schema
- fal.ai Webhooks API docs — 15s timeout, 10 retries over 2h, idempotency requirement
- docs.kie.ai Veo 3.1 Generate + Quickstart — `POST /api/v1/veo/generate`, poll at `/api/v1/veo/record-info`
- npm registry — `@fal-ai/client@1.9.4`, `pgvector@0.2.1` current versions confirmed
- Direct codebase inspection — router.ts, fal-adapter.ts, kie-adapter.ts, model-selector.ts, shot-types.ts, expense-tracker.ts, remotion-renderer.ts, Root.tsx, character-video-gen.ts, schema.prisma, schema.ts

### Secondary (MEDIUM confidence)
- findings.md 2026-02-17 (Veo deprecation decision, Kling-only mandate)
- findings.md 2026-02-28 (Kling 422 multi_shots $8.60 burn incident)
- truefuturemedia.com — before/after and testimonials as top-performing formats for trades businesses
- teamday.ai — 2026 AI video model benchmark (Kling 3.0 vs Veo 3.1 vs Sora 2)
- kie.ai pricing page — Veo 3.1 cost rates ($0.40/8s fast, $2.00/8s quality)

### Tertiary (LOW confidence)
- Remotion GitHub issue #479 — memory leak (fixed in v2.6.6; v4.0 `<OffthreadVideo>` cache defaults; relevant for OOM risk assessment but version-specific behavior may have changed)
- ResearchGate hybrid feedback systems — minimum sample threshold guidance (general ML reference, not specific to this codebase)

---
*Research completed: 2026-03-14*
*Ready for roadmap: yes*
