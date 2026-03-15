# Feature Research

**Domain:** Multi-model AI video production with self-improving quality routing
**Researched:** 2026-03-14
**Confidence:** HIGH (existing codebase verified + official fal.ai docs + market research)

---

## Context: What Already Exists

This is a SUBSEQUENT milestone. The following infrastructure is production-ready and must NOT be re-built:

| Existing Component | Location | Status |
|---|---|---|
| Model Observatory (`ai_models`, `ai_model_recommendations`, `ai_model_decisions` tables) | Prisma schema + model-selector.ts | Production |
| Model Router with 6 shot types (dialogue, narrative, environment, product, social, music) | model-router/router.ts + shot-types.ts | Production |
| FalAdapter (queue submit + poll, webhook-ready) | model-router/provider-adapters/fal-adapter.ts | Production |
| KieAdapter | model-router/provider-adapters/kie-adapter.ts | Production |
| Prompt Store (`prompt_configs` table, TTL cache, versioned templates) | services/prompt-store.ts | Production |
| Cost tracking (`api_expenses` table, trackExpense()) | services/expense-tracker.ts | Production |
| 8 Remotion compositions (PropertyTour, CrewReveal, CrewDemoV1/V2/V3, HairShowreel, CharacterReveal, SocialMockup) | remotion/src/*.tsx | Production |
| Content engagement metrics (impressions, reach, likes, performanceScore in content_entries) | Drizzle schema | Production |
| Budget tiers (budget=$0.05, standard=$0.12, premium=$999) | shot-types.ts BUDGET_CEILINGS | Production |

**The new features build ON TOP of this infrastructure. The routing layer already knows about fal.ai — the FalAdapter exists and fal.ai endpoints are wired into SHOT_DEFAULT_MODELS. The gap is: providers are declared but not fully activated, there is no quality feedback signal flowing back into routing decisions, and the Remotion template library has no local-business-specific templates.**

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features required for v1.1 to function. These must ship for the milestone to be called complete.

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| **fal.ai provider fully activated** (Sora 2 image-to-video, Wan 2.6 i2v, Veo 3.1 dialogue) | FalAdapter exists but model params need correct fal endpoint strings for each new model; Sora 2 image-to-video costs $0.30/s at 720p, Wan 2.6 costs ~$0.05/s — three distinct pricing rows needed in ai_models | MEDIUM | FalAdapter already written; needs model rows seeded in ai_models + correct fal_endpoint per model + Observatory recommendations updated |
| **fal.ai webhook receive endpoint** | Current FalAdapter polls; Sora 2 / Veo 3.1 generation can take 60-120s — polling 20× at 30s intervals will time out BullMQ jobs; webhook callback is how fal.ai handles long generation | MEDIUM | Needs a new Express route (`POST /api/webhooks/fal`) to receive fal's POST, resolve the BullMQ job, and trigger the next pipeline step; uses request_id for idempotency |
| **Per-clip generation metadata on content_entries** | Every generated clip needs model_id, provider, prompt_version, generation_cost, duration_sec attached to content_entries row for feedback loop to work; currently these fields are missing | LOW | Schema migration (add generation_meta JSONB column to content_entries) + populate in model-router after generation completes |
| **Prompt versioning hooked into generation audit** | prompt_configs already has version field; ai_model_decisions.reasoning JSONB already logs per-shot; gap is that promptKey + version is not captured alongside the generation result in content_entries | LOW | Add prompt_key + prompt_version to generation_meta JSONB; no schema change needed if using JSONB column above |
| **Cost rates for new providers in expense-tracker** | COST_RATES in expense-tracker.ts hardcodes kie/gemini/resend/r2/anthropic; fal.ai Sora 2 ($0.30/s), Wan 2.6 ($0.05/s), Veo 3.1 ($0.20-$0.40/s) need entries so trackExpense() uses correct rates | LOW | Pure code change in expense-tracker.ts + ai_models rows |

### Differentiators (Competitive Advantage)

Features that elevate the system beyond "just route to fal.ai."

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| **Quality feedback signal writing back to Observatory** | After a generation completes and a content_entry gets a performanceScore (engagement data), write a normalized quality_score back to ai_model_recommendations.quality_score for that use_case; the Observatory then has real outcome data, not just static editorial scores | HIGH | Requires: (1) generation_meta with model_id on content_entries, (2) a background job that joins content_entries WHERE performanceScore IS NOT NULL to ai_model_decisions and writes aggregated quality signals to ai_model_recommendations; this is the "self-learning" loop |
| **Prompt effectiveness index** | Track which prompt templates (by prompt_key + version) produce content_entries with higher performanceScore; surface top-performing templates per shot_type so the router can prefer them | HIGH | Requires: generation_meta capturing prompt_key + prompt_version on content_entries; an aggregation query computing avg(performanceScore) GROUP BY prompt_key, version, shot_type; admin endpoint to view rankings |
| **Before/after video template for local service businesses** | A Remotion composition that shows a problem state (before) transitioning to a resolved state (after) with a split-screen or wipe effect + text overlay + logo; this is the #1 performing video format for trades businesses (HVAC, plumbing, cleaning) per 2026 social data (63% of homeowners prefer authentic before/after over polished ads) | HIGH | New Remotion composition: BeforeAfterComposition (16x9 + 9x16); parametric props: beforeImageUrl, afterImageUrl, serviceLabel, brandColor, logoUrl, tagline; uses existing transition primitives already in remotion/src/components/ |
| **Social proof / testimonial video template** | A Remotion composition for customer testimonial quotes: animated text, brand colors, customer name + photo bubble; this is the second-highest performing local business content type; reuses existing GlassPanel + AnimatedBg components | MEDIUM | New Remotion composition: TestimonialComposition; parametric props: quote, customerName, customerPhotoUrl, ratingStars, brandColor, logoUrl |
| **Seasonal / urgency alert template** | Short-form Remotion composition (15-30s vertical) for "Now is the time to X" seasonal urgency content — HVAC tune-up before summer, holiday specials, weather-related emergency calls; drives demand spikes when posted 2 weeks early | MEDIUM | New Remotion composition: SeasonalAlertComposition (9x16 only); parametric props: headline, subtext, ctaText, urgencyIcon, brandColor, backgroundVideoUrl |
| **Router model score decay** | Current Observatory quality scores are static integers set at seed time; over time a model that degrades (worse outputs, pricing changes) should have its quality_score decay if no positive feedback arrives; implement a simple decay function that reduces quality_score by N% per week if no new performanceScore data arrives | MEDIUM | Background cron; reads ai_model_recommendations.updated_at + quality_score; writes decayed score if stale |
| **Veo 3.1 native audio activation for dialogue shots** | Veo 3.1 has native audio generation (dialogue + lip sync); currently SHOT_DEFAULT_MODELS.dialogue routes to 'veo-3.1' via Kie but does not pass audio=true flag; activating native audio for dialogue shots means local business owner avatar videos get synchronized speech without needing a separate ElevenLabs TTS step | MEDIUM | FalAdapter.submitJob() needs to accept an `enableAudio` flag; Veo 3.1 endpoint on fal is `fal-ai/veo3.1/image-to-video`; pricing: $0.20/s without audio, $0.40/s with audio — budget ceiling enforcement must account for this |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time generation status push to customer WhatsApp** | Customers want progress updates during 60-120s Sora 2 generation | Spams WhatsApp group with "processing…" messages; creates noise and erodes trust; WAHA rate limits can trigger if many jobs run simultaneously | Send ONE message when complete: the rendered video. Use BullMQ job progress events internally only. |
| **Scheduled Kie.ai/fal.ai generation crons** | "Auto-generate weekly content for all tenants" sounds like a product feature | Violates explicit business rule (feedback_no_scheduled_kie.md): never enable scheduled generation without a paying customer + WhatsApp approval + AI-optimized timing | On-demand generation triggered via WhatsApp approval poll. Future: SocialHub pipeline with human-in-the-loop approval. |
| **Per-model A/B test framework with control groups** | Wants to know "which model is better?" | Adds enormous orchestration complexity; controlling for prompt variation, subject matter, posting time, and audience simultaneously requires statistical rigor that a video production pipeline cannot provide | Use the Observatory quality_score feedback loop: aggregate performanceScore by model over 30+ generations per use_case, then update Observatory. This is statistically simpler and produces actionable routing decisions. |
| **Replacing Remotion with client-side video editor** | "Customers want to edit their own videos" | Defeats the zero-friction WhatsApp-first value prop; web editor requires customer logins, skills, and time; the parametric template approach (data in → video out) is what makes SuperSeller AI unique | Parametric template library with WhatsApp-driven customization: customer sends preferences via poll/message, system generates the video. No editor needed. |
| **Model quality scores from user ratings** | "Have customers rate each video" | Creates survey fatigue; local business owners (Israeli/Jewish small biz, Dallas ICPs) will not fill out rating forms; 1-5 stars is too coarse to drive routing decisions | Use engagement data (performanceScore = reach, likes, saves normalized score) as the quality signal — this is already in content_entries and requires zero customer action. |

---

## Feature Dependencies

```
[fal.ai webhook receive endpoint]
    └──required by──> [Veo 3.1 / Sora 2 long-generation jobs]
                          └──because──> [BullMQ timeouts at 20 × 30s poll = 10min; Sora 2 can take 15-20min]

[Per-clip generation metadata on content_entries]
    └──required by──> [Prompt effectiveness index]
    └──required by──> [Quality feedback signal → Observatory]
                          └──required by──> [Router model score decay]

[fal.ai provider models seeded in ai_models]
    └──required by──> [Cost tracking for new providers]
    └──required by──> [Observatory recommendations using fal endpoints]

[Before/After Remotion composition]
    └──independent of model routing; uses existing KenBurns + transition primitives]

[Testimonial Remotion composition]
    └──independent; reuses GlassPanel + AnimatedBg components]

[Veo 3.1 native audio]
    └──requires──> [FalAdapter.submitJob() audio flag]
    └──requires──> [Budget ceiling update for audio cost tier]
```

### Dependency Notes

- **Webhook endpoint before long-generation activation:** Sora 2 and Veo 3.1 both routinely exceed 10 minutes for high-quality outputs. The existing FalAdapter polls synchronously. Activating these models in production without webhook support will cause BullMQ job timeouts and orphaned generations that cost money but never deliver. The webhook endpoint must ship in the same phase as model activation.

- **Generation metadata before feedback loop:** The quality feedback loop is entirely dependent on knowing which model generated each content_entry. Without generation_meta, there is nothing to aggregate. The metadata column must ship before any feedback aggregation job is written.

- **fal.ai model seed before cost tracking:** expense-tracker.ts COST_RATES are fallback only; primary pricing comes from ai_models table via model-selector.ts. The ai_models rows for Sora 2, Wan 2.6, Veo 3.1 must be seeded with accurate cost_per_second_usd before the pipeline can track fal.ai costs correctly.

- **Remotion templates are fully independent:** BeforeAfterComposition, TestimonialComposition, and SeasonalAlertComposition have no dependencies on model routing or feedback loops. They can be built in parallel with or after the provider activation work.

---

## MVP Definition

### Launch With (v1.1 milestone complete)

These are the minimum features for v1.1 to deliver its stated goal: "Multi-model content production with self-improving quality routing."

- [ ] **fal.ai models seeded** — ai_models rows for fal-ai/sora-2/image-to-video, fal-ai/wan-i2v (Wan 2.6), fal-ai/veo3.1/image-to-video with correct cost_per_second_usd, fal_endpoint, and capability flags
- [ ] **fal.ai webhook endpoint** — `POST /api/webhooks/fal` on worker; receives fal's completion payload; resolves BullMQ job; idempotent on request_id
- [ ] **Per-clip generation_meta JSONB on content_entries** — schema migration + populate in model-router post-generation; fields: model_id, provider, prompt_key, prompt_version, generation_cost_usd, duration_sec, shot_type
- [ ] **Quality feedback aggregation job** — background BullMQ job that reads content_entries WHERE performanceScore IS NOT NULL, joins to generation_meta.model_id, and writes aggregated avg quality_score to ai_model_recommendations per use_case; runs nightly
- [ ] **Prompt effectiveness query** — admin endpoint `GET /api/admin/prompt-effectiveness` that returns avg performanceScore grouped by prompt_key + version + shot_type; no new tables required
- [ ] **BeforeAfterComposition** — new Remotion composition (16x9 + 9x16); parametric props; registered in remotion/src/index.ts; tested with real property/service images

### Add After Validation (v1.1.x)

- [ ] **TestimonialComposition** — add after BeforeAfter ships and first customer uses it; trigger: first customer requests a testimonial video via WhatsApp
- [ ] **SeasonalAlertComposition** — add when first seasonal campaign needed; 9x16 only
- [ ] **Router model score decay** — add after quality feedback loop has been running for 30+ days and has enough data to decay meaningfully
- [ ] **Veo 3.1 native audio for dialogue shots** — add after Veo 3.1 baseline is working; requires customer approval before enabling (audio doubles cost)

### Future Consideration (v2+)

- [ ] **Automated Observatory daily sync** — currently Observatory recommendations are updated manually; a daily background job that re-ranks models based on accumulated quality feedback could replace manual curation; defer until feedback loop has 90+ days of data
- [ ] **Multi-tenant prompt personalization** — different prompt templates per tenant for same shot_type; requires prompt_configs to have a tenant_id scope column; defer until a customer requests brand-specific language

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| fal.ai models seeded (Sora 2, Wan 2.6, Veo 3.1) | HIGH — unlocks cheaper/better models | LOW — SQL seed script | P1 |
| fal.ai webhook endpoint | HIGH — required for long-generation reliability | MEDIUM — new Express route + BullMQ integration | P1 |
| Per-clip generation_meta on content_entries | HIGH — foundation for all feedback loops | LOW — schema migration + populate in router | P1 |
| Quality feedback aggregation job | HIGH — this IS the "self-improving" claim | MEDIUM — BullMQ job + SQL aggregation | P1 |
| BeforeAfterComposition | HIGH — #1 performing local business video format | HIGH — new Remotion composition | P1 |
| Prompt effectiveness query | MEDIUM — admin insight, not customer-facing | LOW — SQL query + admin endpoint | P2 |
| TestimonialComposition | HIGH — #2 performing local business format | MEDIUM — reuses existing components | P2 |
| SeasonalAlertComposition | MEDIUM — campaign-specific | MEDIUM — new composition | P2 |
| Veo 3.1 native audio | MEDIUM — quality uplift for dialogue | MEDIUM — adapter flag + budget ceiling update | P2 |
| Router model score decay | LOW — prevents stale scores | MEDIUM — background cron + decay math | P3 |
| Automated Observatory daily sync | LOW — replaces manual curation | HIGH — full re-ranking logic | P3 |

**Priority key:**
- P1: Must have for v1.1 launch
- P2: Should have, add when core is stable
- P3: Nice to have, future consideration

---

## Local Business Video Template Analysis

Research finding: the 2026 social media landscape for trades businesses (HVAC, plumbing, cleaning, real estate) strongly favors three content formats. SuperSeller AI's existing Remotion library covers none of them.

| Template Type | Platform Fit | Why It Works | Complexity | Notes |
|---|---|---|---|---|
| **Before/After** (split-screen or wipe) | Instagram Reels, TikTok, Facebook | High save rate, algorithm favors transformation content; 2026 Instagram algorithm boosts before/after carousels; authentic beats polished | HIGH | Wipe transition already exists in remotion/src/transitions; need new composition wrapping it with brand/text overlay |
| **Customer Testimonial** (quote card + photo) | Instagram, Facebook | Social proof is the #1 conversion driver for local services; homeowners trust peer reviews over brand claims | MEDIUM | GlassPanel + AnimatedBg components already exist; mostly layout work |
| **Seasonal Urgency** (15-30s vertical) | TikTok, Reels | Posting 2 weeks before demand spikes (AC before summer, heat before winter) captures search intent early; short-form drives awareness | MEDIUM | 9x16 only; simpler than PropertyTour |

**Current gap:** All 8 existing Remotion compositions were built for the real estate / VideoForge vertical (PropertyTour, CrewReveal, CrewDemo) or for SuperSeller's own brand (HairShowreel, CharacterReveal, SocialMockup). None have parametric slots for trades business content (before/after images, service labels, testimonial quotes, seasonal urgency copy). The BeforeAfterComposition is the single highest-value addition.

---

## How Self-Learning Routing Works in Practice

The vague claim "self-learning model routing" translates to three concrete mechanisms in this codebase:

**Mechanism 1: Outcome capture (generation_meta JSONB)**
When `routeShot()` completes and a clip is generated, write to content_entries.generation_meta: `{ model_id, provider, prompt_key, prompt_version, shot_type, cost_usd, duration_sec }`. This creates the link between a model decision and its output.

**Mechanism 2: Engagement normalization (performanceScore)**
SocialHub already writes back impressions, reach, likes to content_entries. performanceScore is a normalized 0-1 score derived from these. No new work needed here — this already exists.

**Mechanism 3: Observatory update (quality feedback job)**
A nightly BullMQ job runs:
```sql
SELECT
  (generation_meta->>'model_id') AS model_id,
  AVG(performance_score) AS avg_quality,
  COUNT(*) AS sample_count
FROM content_entries
WHERE performance_score IS NOT NULL
  AND generation_meta IS NOT NULL
  AND posted_at > NOW() - INTERVAL '30 days'
GROUP BY generation_meta->>'model_id'
```
Then for each model_id with sample_count >= 10, update ai_model_recommendations.quality_score. The Observatory now reflects real-world outcome data. The next time routeShot() calls getRecommendedModel(), it picks up the updated score. This is the complete feedback loop.

**What it is NOT:** This is not RLHF, not fine-tuning, not neural network weight updates. It is a data-driven recommendation system where historical engagement statistics determine future model selection. That is the correct scope for a production pipeline — tractable, auditable, and reversible.

---

## Sources

- fal.ai Sora 2 image-to-video API: [https://fal.ai/models/fal-ai/sora-2/image-to-video/pro/api](https://fal.ai/models/fal-ai/sora-2/image-to-video/pro/api) — pricing $0.30/s at 720p, $0.50/s at 1080p (HIGH confidence, verified via WebFetch)
- fal.ai Queue API webhook pattern: [https://fal.ai/docs/model-apis/model-endpoints/queue](https://fal.ai/docs/model-apis/model-endpoints/queue) — webhook_url param, request_id idempotency (HIGH confidence, verified via WebFetch)
- Veo 3.1 on fal.ai: [https://blog.fal.ai/veo-3-1-is-now-available-on-fal/](https://blog.fal.ai/veo-3-1-is-now-available-on-fal/) — $0.20/s without audio, $0.40/s with audio, native lip sync (HIGH confidence, official fal.ai blog)
- Local business video formats: [https://www.truefuturemedia.com/articles/boring-business-boom-hvac-plumbing-pest-control-social-media](https://www.truefuturemedia.com/articles/boring-business-boom-hvac-plumbing-pest-control-social-media) — before/after and testimonials as top performers (MEDIUM confidence, industry publication)
- 2026 AI video model landscape: [https://www.teamday.ai/blog/best-ai-video-models-2026](https://www.teamday.ai/blog/best-ai-video-models-2026) — Kling 3.0 vs Veo 3.1 vs Sora 2 comparison (MEDIUM confidence, independent benchmark)
- Existing codebase: apps/worker/src/services/model-router/, apps/worker/src/services/expense-tracker.ts, apps/worker/src/services/model-selector.ts, apps/web/superseller-site/prisma/schema.prisma (HIGH confidence, direct code inspection)

---

*Feature research for: Intelligent Content Engine (v1.1 milestone)*
*Researched: 2026-03-14*
