# Roadmap: Universal Customer Onboarding System

**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6 (shipped 2026-03-15) — [Archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Intelligent Content Engine** — Phases 07-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) — SHIPPED 2026-03-15</summary>

- [x] Phase 1: Universal Group + Product-Aware Agent (2/2 plans) — completed 2026-03-12
- [x] Phase 2: Onboarding Modules — Asset, Social, Compete (3/3 plans) — completed 2026-03-13
- [x] Phase 3: Character Questionnaire (1/1 plan) — completed 2026-03-13
- [x] Phase 3.1: Multi-Model Best Shot Routing (2/2 plans) — completed 2026-03-13
- [x] Phase 4: Character Video Gen + Delivery (3/3 plans) — completed 2026-03-14
- [x] Phase 5: Pipeline Orchestration (2/2 plans) — completed 2026-03-14
- [x] Phase 6: Fix Social Intro + Poll Vote (2/2 plans) — completed 2026-03-14

</details>

### 🚧 v1.1 Intelligent Content Engine (In Progress)

**Milestone Goal:** Multi-model content production with self-improving quality routing — activate dormant providers, build feedback loops, and create parametric templates for local businesses.

- [x] **Phase 07: Provider Foundation** - Decision doc, router bug fix, DB seed, cost rates, and input validation — everything required before any fal.ai traffic goes live (completed 2026-03-15)
- [x] **Phase 08: Provider Activation** - Live fal.ai generation (Sora 2 + Wan 2.6) with webhook handling, and Veo 3.1 dialogue re-integration via Kie.ai (completed 2026-03-15)
- [ ] **Phase 09: Quality Feedback Loop** - Per-clip generation metadata, nightly aggregation, and Observatory score updates that feed back into routing decisions
- [ ] **Phase 10: Remotion Templates** - BeforeAfterComposition for local businesses — parametric, dual aspect ratio, brand-configurable

## Phase Details

### Phase 07: Provider Foundation
**Goal**: All safety rails, DB schema, and code correctness issues are resolved so that fal.ai production traffic can be enabled without credit-burn risk
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: PROV-08, PROV-03, PROV-05, PROV-06, PROV-07
**Success Criteria** (what must be TRUE):
  1. DECISIONS.md contains a dated entry reversing the Feb 2026 Kling-only mandate and documenting Veo 3.1 re-integration rationale
  2. `routeShot()` instantiates the adapter (KieAdapter or FalAdapter) from the Observatory recommendation's `provider` field, not from a hardcoded `defaultHint.provider`
  3. `ai_models` table contains seeded rows for Sora 2, Wan 2.6, and Veo 3.1 with correct `cost_per_second_usd`, `provider`, and capability flags
  4. `expense-tracker` COST_RATES map includes fal.ai provider rates for Sora 2 and Wan 2.6 as fallback entries
  5. Image URL format validation (type + dimensions) runs before any `FalAdapter.submitJob()` call, with 4xx responses wrapped in `UnrecoverableError`
**Plans:** 2/2 plans complete

Plans:
- [ ] 07-01: DECISIONS.md entry + router adapter-selection fix (PROV-08, PROV-03)
- [ ] 07-02: ai_models seed + cost rates + input validation (PROV-05, PROV-06, PROV-07)

### Phase 08: Provider Activation
**Goal**: Real video generations flow through fal.ai (Sora 2 and Wan 2.6) and Veo 3.1 dialogue shots work end-to-end, with long-running jobs handled via webhook (not polling timeout)
**Depends on**: Phase 07
**Requirements**: PROV-01, PROV-02, PROV-04
**Success Criteria** (what must be TRUE):
  1. A shot routed to fal.ai produces a completed video via `FalAdapter` using the correct model ID (`fal-ai/sora-2/image-to-video/pro` or `wan/v2.6/image-to-video`)
  2. `POST /api/webhooks/fal` receives fal.ai callbacks, is idempotent on `request_id`, and updates the job record on completion
  3. A `dialogue` shot type routed to Veo 3.1 calls `POST /api/v1/veo/generate` (not the Kling task endpoint) and polls at `/api/v1/veo/record-info` until complete
**Plans:** 2/2 plans complete

Plans:
- [ ] 08-01: FalAdapter activation — model-specific request body + webhook endpoint (PROV-01, PROV-02)
- [ ] 08-02: Veo 3.1 re-integration — createVeoTask + pollVeoTask + KieAdapter branch (PROV-04)

### Phase 09: Quality Feedback Loop
**Goal**: Every completed generation records metadata and a quality signal; a nightly job aggregates these signals and updates Observatory routing scores so the system self-improves over time
**Depends on**: Phase 08
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06
**Success Criteria** (what must be TRUE):
  1. Every completed generation writes `generation_meta` JSONB to `content_entries` (model_id, provider, prompt_key, prompt_version, generation_cost_usd, duration_sec, shot_type)
  2. Every completed generation logs a row to `api_expenses` with `provider` and `model_id` metadata for per-clip cost attribution
  3. A nightly BullMQ job runs and writes aggregated `avg quality_score` per model to `ai_model_recommendations` — but only when `sample_count >= 20`
  4. Admin can call `GET /api/admin/prompt-effectiveness` and receive ranked avg `performanceScore` by prompt_key, version, and shot_type
  5. `routeShot()` reads `quality_score` from the Observatory's real aggregated data (not static seeds) when selecting models
**Plans:** TBD

Plans:
- [ ] 09-01: generation_meta column + per-clip cost attribution (QUAL-01, QUAL-05)
- [ ] 09-02: Nightly aggregation job + Observatory reader (QUAL-02, QUAL-03, QUAL-06)
- [ ] 09-03: Prompt effectiveness admin endpoint (QUAL-04)

### Phase 10: Remotion Templates
**Goal**: A parametric BeforeAfterComposition delivers local-business split-screen/wipe videos in both 16x9 and 9x16, configurable entirely via props, and registered as a renderable composition
**Depends on**: Phase 07 (independent of 08/09 but benefits from optimized clip inputs)
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04
**Success Criteria** (what must be TRUE):
  1. `renderComposition('BeforeAfterComposition', props)` completes without error on RackNerd
  2. Rendering with `aspectRatio: '16x9'` produces a landscape video; `aspectRatio: '9x16'` produces a portrait video with correct dimensions
  3. Props `beforeImageUrl`, `afterImageUrl`, `serviceLabel`, `brandColor`, `logoUrl`, and `tagline` all render visibly in the output without hardcoded defaults
  4. The wipe/split-screen transition is visible and smooth between before and after images
**Plans:** TBD

Plans:
- [ ] 10-01: BeforeAfterComposition build + Root.tsx registration (TMPL-01, TMPL-02, TMPL-03, TMPL-04)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Universal Group + Agent | v1.0 | 2/2 | Complete | 2026-03-12 |
| 2. Onboarding Modules | v1.0 | 3/3 | Complete | 2026-03-13 |
| 3. Character Questionnaire | v1.0 | 1/1 | Complete | 2026-03-13 |
| 3.1. Best Shot Routing | v1.0 | 2/2 | Complete | 2026-03-13 |
| 4. Character Video Gen | v1.0 | 3/3 | Complete | 2026-03-14 |
| 5. Pipeline Orchestration | v1.0 | 2/2 | Complete | 2026-03-14 |
| 6. Fix Social + Poll Vote | v1.0 | 2/2 | Complete | 2026-03-14 |
| 07. Provider Foundation | v1.1 | Complete    | 2026-03-15 | - |
| 08. Provider Activation | 2/2 | Complete   | 2026-03-15 | - |
| 09. Quality Feedback Loop | v1.1 | 0/3 | Not started | - |
| 10. Remotion Templates | v1.1 | 0/1 | Not started | - |

---
*Created: 2026-03-13*
*Updated: 2026-03-15 — v1.1 roadmap added (Phases 07-10)*
