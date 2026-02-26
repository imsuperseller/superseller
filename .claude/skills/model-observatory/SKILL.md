---
name: model-observatory
version: 1.0.0
description: >-
  AI Model Observatory — track, query, and auto-select optimal models for pipeline tasks.
  Covers 31+ models across 7 categories (video, llm, upscale, compositing, image, avatar, music),
  60+ structured fields per model, daily auto-sync from Kie.ai/fal.ai, pipeline recommendations,
  and decision audit logging. Use when selecting AI models, checking model pricing, comparing
  providers, updating model data, or querying the observatory. Not for video pipeline execution
  (see tourreel-pipeline), UI design, or Stripe billing.
  Example: "Which model should I use for room transitions?" or "Update Kling pricing".
autoTrigger:
  - "model"
  - "ai model"
  - "observatory"
  - "model selection"
  - "which model"
  - "best model for"
  - "model cost"
  - "model price"
  - "kie.ai"
  - "fal.ai"
  - "kling"
  - "veo"
  - "seedance"
  - "nano banana"
  - "suno"
negativeTrigger:
  - "UI design"
  - "Stripe billing"
  - "credits"
  - "schema migration"
  - "landing page"
  - "WhatsApp"
  - "n8n"
---

# AI Model Observatory

## Critical
- **NEVER hardcode model selection in pipeline workers** -- always query `ai_model_recommendations` for the current best model
- **NEVER assume yesterday's best model is still best** -- models get deprecated, prices change, new models launch weekly
- **Pipeline cost compounds at scale** -- even a $0.01/clip saving matters across 1000+ clips/month
- **Daily sync is the heartbeat** -- if `daily-sync.ts` stops running, pricing data goes stale and pipeline costs drift
- **Decision audit is mandatory** -- every model selection MUST be logged to `ai_model_decisions` with reasoning
- **New models from sync need manual review** -- auto-discovered models get minimal fields; populate quality scores, capability booleans, and real estate scores manually before pipeline use
- **Kie.ai bulk rates differ from listed prices** -- the seed script uses Kie.ai effective rates (e.g., Kling Pro ~$0.10/clip), not the per-second API list price

## Architecture

```
Kie.ai/market ──┐
                 ├──> daily-sync.ts ──> ai_models (Postgres) ──> Pipeline workers query
fal.ai/models ──┘                          │                        for optimal model
                                           v
                                   ai_model_recommendations ──> Primary + Fallback per use case
                                           │
                                           v
                                   ai_model_decisions ──> Audit log of every selection
```

## Key Files

| Level | File | Purpose |
|-------|------|---------|
| L0 | This SKILL.md | Routing doc |
| L1 | `apps/web/superseller-site/prisma/schema.prisma` (AIModel, AIModelRecommendation, AIModelDecision) | Schema -- 3 tables, 60+ fields |
| L1 | `tools/model-observatory/seed-initial-models.mjs` | Seed 31 models with full structured data |
| L1 | `tools/model-observatory/daily-sync.ts` | Auto-update from Kie.ai/fal.ai (1194 lines) |
| L1 | `tools/model-observatory/README.md` | Original spec and architecture overview |
| L2 | `apps/worker/src/services/kie.ts` | Kie.ai API client (Kling 3.0, Suno, Nano Banana) |
| L2 | `apps/worker/src/services/gemini.ts` | Gemini API client (vision, prompts) |
| L2 | `apps/worker/src/queue/workers/video-pipeline.worker.ts` | Pipeline worker that should query observatory |
| L2 | `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts` | Cost tracking (pairs with observatory pricing) |

## Database Schema

### `ai_models` -- 60+ structured fields per model

```
Identity:       provider, modelName, modelId, modelFamily, version, releaseDate, developer
Category:       category (7 types), subcategory
Endpoints:      kieEndpoint, kieModelParam, falEndpoint, directApiUrl
Pricing:        costPerSecondUsd, costPer5sUsd, costPer10sUsd, costPerImageUsd,
                costPerMinuteUsd, costPer1mInputUsd, costPer1mOutputUsd, costPerCallUsd,
                pricingNotes, pricingSource, pricingVerifiedAt
Video caps:     supportsImageToVideo, supportsTextToVideo, supportsStartEndFrame,
                supportsMultiShot, supportsNativeAudio, supportsCharacterRef,
                supportsElements, supportsLipSync, supportsVideoToVideo, supportsInpainting
Image caps:     supportsUpscale, supportsCompositing, supportsFaceSwap, supportsImageEdit
Output specs:   maxResolution, maxDurationSec, minDurationSec, outputFormats,
                maxUpscaleFactor, maxInputImages
Quality (0-100): qualityOverall, qualityRealism, qualityMotion, qualityConsistency,
                 qualityArchitecture, speedScore
Real estate:    realEstateScore, bestForRooms[], walkthroughNotes
Pipeline:       usedInPipeline, pipelineRole, envVarToEnable, fallbackFor
Metadata:       status, capabilities (JSON), benchmarks (JSON), rawPricingData (JSON),
                discoveredAt, lastChecked, lastPriceChange
```

Indexes: `provider`, `category`, `status`, `releaseDate`, `costPer5sUsd`, `realEstateScore`, `supportsStartEndFrame`, `supportsImageToVideo`.
Unique constraint: `(provider, modelId)`.

### `ai_model_recommendations` -- best model per use case

```
useCase, recommendedModelId, fallbackModelId, reasoning, costPerUnit, qualityScore, speedMs
```

7 use cases defined. Unique on `useCase`.

### `ai_model_decisions` -- audit log

```
useCase, chosenModelId, alternativesConsidered[], reasoning, createdAt, createdBy
```

## Model Inventory (31 models, 7 categories)

### Video Generation (13 models)

| Model | Provider | Cost (5s) | Real Estate | Resolution | Key Feature |
|-------|----------|-----------|-------------|------------|-------------|
| **Kling 3.0 Pro** | Kie.ai | ~$0.10* | 95 | 1080p | Primary. Multi-shot, Elements, start+end frame. 25+ TourReels. |
| Kling 3.0 Standard | Kie.ai | ~$0.03* | 70 | 720p | Budget. Blurs at 1080p. `KIE_KLING_MODE=std` |
| Kling 2.6 | Kie.ai | $0.28 | 60 | 1080p | Legacy version |
| **Veo 3.1** | Kie.ai | $1.25 | 85 | 4K | Best single-shot quality. Max 8s. Hero shots only. |
| **Seedance 2.0** | Kie.ai | TBD | 92 | 2K | 2K > Kling 1080p. Environment Lock. Test candidate. |
| Seedance 1.5 Pro | Kie.ai | $0.175 | 72 | 720p | Budget FLF. Start+end frame native. |
| Wan 2.6 | Kie.ai | $0.53 | 75 | 1080p | Reference-to-video for consistency |
| Sora 2 Standard | Kie.ai | $0.075 | 55 | 720p | Cheapest per-second. Quality inconsistent. |
| Hailuo 2.3 Standard | Kie.ai | $0.15 | 60 | 1080p | No 10s@1080p option |
| Runway Gen-4 Turbo | Kie.ai | $0.06 | 65 | 1080p | Fast ~1 min generation. Rapid iteration. |
| Wan 2.1 FLF | fal.ai | $0.40 | 70 | 720p | Cheapest dedicated FLF. Room-to-room transitions. |
| Veo 3.1 Fast FLF | fal.ai | $0.50 | 82 | 4K | High quality FLF. 4K capable. Max 8s. |
| LongCat Video | fal.ai | $0.20 | 50 | 720p | Very cheap. Walkthrough feel. |

*Kie.ai effective bulk rate, not per-second list price.

### Avatar / Talking Head (2 models)

| Model | Provider | Cost | Resolution | Notes |
|-------|----------|------|------------|-------|
| **Kling Avatar v2 Pro** | Kie.ai | $0.08/s | 1080p | Primary for Winner Studio. Photo + audio -> talking head. |
| InfiniteTalk | Kie.ai | $0.06/s | 720p | Budget fallback. Precise lip sync. |

### Image Upscaling (4 models)

| Model | Provider | Cost/Image | Max Factor | Notes |
|-------|----------|------------|------------|-------|
| **Recraft Crisp** | Kie.ai | $0.004 | 4x | Primary. Best for architectural photos. $0.004/img. |
| Topaz Image | Kie.ai | $0.05 | 8x | Gold standard quality. Hero shots only (12x more expensive). |
| ESRGAN | fal.ai | $0.001 | 8x | Cheapest. Batch/budget use. |
| Clarity Upscaler | fal.ai | $0.03 | 4x | Prompt-guided creative upscaling. |

### Compositing (3 models)

| Model | Provider | Cost/Image | Notes |
|-------|----------|------------|-------|
| **Nano Banana Pro** | Kie.ai | $0.09 | Primary. Realtor composite in opening/closing clips. |
| Easel AI Face+Body | fal.ai | $0.03 | Full body swap. 1/3 cost of Nano Banana. |
| FLUX.2 Pro Edit | fal.ai | $0.05 | Multi-reference compositing with natural language. |

### Music (2 models)

| Model | Provider | Cost/Track | Notes |
|-------|----------|------------|-------|
| **Suno V5** | Kie.ai | $0.02 | Primary. Luxury real estate piano/ambient. |
| Suno V4.5 Plus | Kie.ai | $0.02 | Fallback for V5. |

### LLM / Vision (5 models)

| Model | Provider | Input/1M | Output/1M | Notes |
|-------|----------|----------|-----------|-------|
| **Gemini 3 Flash** | Kie.ai | $0.15 | $0.90 | Primary vision. Photo classify, room detect, floorplan. |
| Gemini 2.5 Flash | Kie.ai | $0.15 | $0.60 | Fallback for Gemini 3. |
| Claude Opus 4.6 | Anthropic | $15.00 | $75.00 | Top reasoning. Used for code/planning. |
| Claude Sonnet 4.6 | Anthropic | $3.00 | $15.00 | Balanced reasoning + cost. |
| GPT-4o | OpenAI | $2.50 | $10.00 | Vision + text. |

### Image Generation (2 models)

| Model | Provider | Cost/Image | Notes |
|-------|----------|------------|-------|
| Seedream 4.0 | Kie.ai | $0.0175 | FB Bot listing variations. |
| GPT-Image-1 | Kie.ai | $0.04 | OpenAI image generation via Kie.ai. |

## Pipeline Recommendations (7 use cases)

| Use Case | Primary | Fallback | Effective Cost | Reasoning |
|----------|---------|----------|----------------|-----------|
| `video_clip_generation` | Kling 3.0 Pro | Seedance 2.0 | ~$0.10/clip | Best real estate quality + Elements for realtor. 25+ videos proven. |
| `room_transition_flf` | Kling 3.0 (FLF) | Wan 2.1 FLF (fal.ai) | $0.10-$0.40 | Kling start+end frame via Kie.ai. Wan FLF as cheaper fallback. |
| `photo_upscale` | Recraft Crisp | ESRGAN (fal.ai) | $0.004/img | Recraft preserves architecture. ESRGAN $0.001 budget fallback. |
| `music_generation` | Suno V5 | Suno V4.5+ | $0.02/track | Latest Suno quality at same price. |
| `photo_classify` | Gemini 3 Flash | Gemini 2.5 Flash | ~$0.001/call | 15% better accuracy for photo classification. |
| `realtor_compositing` | Nano Banana Pro | Easel AI | $0.09/img | Nano Banana integrated. Easel 1/3 cost as fallback. |
| `avatar_talking_head` | Kling Avatar v2 Pro | InfiniteTalk | $0.08/s | Winner Studio primary. InfiniteTalk as budget option. |

## Querying Models

### Best video model for real estate under $0.20/5s
```sql
SELECT model_name, cost_per_5s_usd, real_estate_score, quality_overall
FROM ai_models
WHERE category = 'video' AND supports_image_to_video = true
  AND cost_per_5s_usd < 0.20 AND status = 'active'
ORDER BY real_estate_score DESC;
```

### Get pipeline recommendation for a use case
```sql
SELECT r.use_case, m.model_name, m.provider, f.model_name as fallback,
       r.reasoning, r.cost_per_unit
FROM ai_model_recommendations r
JOIN ai_models m ON m.id = r.recommended_model_id
LEFT JOIN ai_models f ON f.id = r.fallback_model_id;
```

### Models that support start+end frame (for transitions)
```sql
SELECT model_name, provider, cost_per_5s_usd, real_estate_score
FROM ai_models
WHERE supports_start_end_frame = true AND status = 'active'
ORDER BY cost_per_5s_usd ASC;
```

### Cheapest video model per provider
```sql
SELECT DISTINCT ON (provider) provider, model_name, cost_per_5s_usd
FROM ai_models
WHERE category = 'video' AND cost_per_5s_usd IS NOT NULL AND status = 'active'
ORDER BY provider, cost_per_5s_usd ASC;
```

### Models used in current pipeline
```sql
SELECT model_name, provider, pipeline_role, cost_per_5s_usd, cost_per_image_usd, cost_per_call_usd
FROM ai_models
WHERE used_in_pipeline = true
ORDER BY pipeline_role;
```

### Recent model decisions (audit trail)
```sql
SELECT d.use_case, m.model_name, d.reasoning, d.created_at
FROM ai_model_decisions d
JOIN ai_models m ON m.id = d.chosen_model_id
ORDER BY d.created_at DESC
LIMIT 20;
```

## Daily Sync (`daily-sync.ts`)

### How It Works
1. Fetches HTML from `kie.ai/market` and `fal.ai/models`
2. Parses model listings via 3 strategies per provider:
   - `__NEXT_DATA__` hydration payload (preferred)
   - Inline JSON patterns (`window.__INITIAL_STATE__`, `"models":[]`)
   - HTML regex pattern matching (fallback)
3. Compares scraped data against existing `ai_models` rows
4. Detects: price changes, status changes, new models, possible deprecations
5. Applies changes to DB (or logs in dry-run mode)
6. Logs every change to `ai_model_decisions` audit table
7. Flags missing models as `review_needed` (not auto-deprecated)
8. Updates `last_checked` timestamp for all provider models

### Safety Features
- **Coverage threshold**: Removal detection only fires if scraper found >= 50% of known active models (prevents false mass-deprecation from scraper failures)
- **Fuzzy matching**: Matches by model_id, name, and partial name containment
- **No auto-deprecation**: Missing models flagged for manual review, never auto-removed
- **Dry-run mode**: `SYNC_DRY_RUN=1` logs all changes without DB writes

## Commands

```bash
# Seed all 31 models (idempotent, uses ON CONFLICT ... DO UPDATE)
node tools/model-observatory/seed-initial-models.mjs

# Run daily sync (live)
npx tsx tools/model-observatory/daily-sync.ts

# Dry run — log changes without writing to DB
SYNC_DRY_RUN=1 npx tsx tools/model-observatory/daily-sync.ts

# Custom DATABASE_URL
DATABASE_URL=postgresql://... npx tsx tools/model-observatory/daily-sync.ts

# Cron setup (RackNerd — 6 AM UTC daily)
0 6 * * * cd /opt/tourreel-worker && node dist/tools/model-observatory/daily-sync.js >> /var/log/model-observatory.log 2>&1
```

## Common Patterns

### Selecting a model for pipeline use
```typescript
// Query the observatory for the recommended model
const result = await pool.query(
  `SELECT r.use_case, m.model_name, m.kie_model_param, m.fal_endpoint,
          m.cost_per_5s_usd, f.model_name as fallback_name, f.kie_model_param as fallback_param
   FROM ai_model_recommendations r
   JOIN ai_models m ON m.id = r.recommended_model_id
   LEFT JOIN ai_models f ON f.id = r.fallback_model_id
   WHERE r.use_case = $1`,
  ['video_clip_generation']
);

const { kie_model_param, fallback_param } = result.rows[0];
// Use kie_model_param for primary, fallback_param if primary fails
```

### Logging a model decision
```typescript
await pool.query(
  `INSERT INTO ai_model_decisions (use_case, chosen_model_id, alternatives_considered, reasoning)
   VALUES ($1, (SELECT id FROM ai_models WHERE model_id = $2), $3, $4)`,
  [
    'video_clip_generation',
    'kling-3.0/video',
    ['seedance-2.0/video', 'veo-3.1/video'],
    'Kling 3.0 Pro: best real estate score (95), proven in pipeline, $0.10/clip via Kie.ai bulk rate'
  ]
);
```

### Checking if a cheaper model exists
```typescript
const cheaper = await pool.query(
  `SELECT model_name, provider, cost_per_5s_usd, real_estate_score
   FROM ai_models
   WHERE category = 'video'
     AND supports_image_to_video = true
     AND cost_per_5s_usd < $1
     AND real_estate_score >= $2
     AND status = 'active'
   ORDER BY cost_per_5s_usd ASC
   LIMIT 5`,
  [currentCost, minAcceptableQuality]
);
```

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| `daily-sync` extracts 0 models | Kie.ai/fal.ai changed page structure | Check HTML output, update parser strategies in `daily-sync.ts` |
| Price data stale (>7 days) | Cron job not running on RackNerd | `ssh root@172.245.56.50 "crontab -l"` -- verify entry exists |
| `ai_models` table empty | Schema pushed but never seeded | Run `node tools/model-observatory/seed-initial-models.mjs` |
| Wrong model selected by pipeline | Recommendation row outdated | Query `ai_model_recommendations` and update reasoning + model ID |
| `ON CONFLICT` error on seed | `(provider, model_id)` unique constraint | Seed script uses `ON CONFLICT DO UPDATE` -- check for model_id typos |
| New model has NULL quality scores | Auto-discovered by sync (minimal fields) | Manually populate quality_overall, real_estate_score, capability booleans |
| `review_needed` status on active model | Sync could not find model on scraped page | Manual check: is model still listed? If yes, update scraper pattern |
| Pipeline uses old fallback | `fallback_model_id` in recommendations table wrong | Update recommendation row with correct fallback model UUID |

## NEVER
- Hardcode model selection in pipeline workers -- always query the observatory
- Assume yesterday's best model is still best -- check recommendations
- Ignore cost changes -- even small price changes compound at scale
- Auto-deprecate models based on scraper results alone -- always flag for manual review
- Skip the decision audit log -- every selection must have a recorded reasoning
- Trust scraped prices over manually verified prices (`pricingVerifiedAt` takes precedence)

## ALWAYS
- Query `ai_model_recommendations` before selecting a model for pipeline tasks
- Log model decisions to `ai_model_decisions` with reasoning
- Run daily-sync to keep pricing current
- Consider `real_estate_score` for property-related tasks
- Check fallback chain when primary model fails
- Verify cost rates against `pricingSource` URLs when price looks wrong
- Populate all capability booleans for new models before pipeline use
- Update this SKILL.md when new models are added to the seed script

## References

- `tools/model-observatory/README.md` -- Original architecture spec and design rationale
- `apps/web/superseller-site/prisma/schema.prisma` -- AIModel, AIModelRecommendation, AIModelDecision models
- `.claude/skills/tourreel-pipeline/SKILL.md` -- Pipeline that consumes observatory data
- `.claude/skills/cost-tracker/SKILL.md` -- Cost tracking that pairs with observatory pricing
- `docs/INFRA_SSOT.md` -- Infrastructure context (RackNerd, Postgres, cron jobs)
- NotebookLM 02c3946b -- AI Cost & Performance benchmarks, budgets
