---
name: model-observatory
version: 1.0.0
description: >-
  AI Model Observatory — track, query, and auto-select optimal models for pipeline tasks.
  Covers 50+ models across 8 categories (video, llm, upscale, compositing, image, avatar, music, audio),
  60+ structured fields per model, daily auto-sync from Kie.ai/fal.ai, pipeline recommendations,
  and decision audit logging. Use when selecting AI models, checking model pricing, comparing
  providers, updating model data, or querying the observatory. Not for video pipeline execution
  (see tourreel-pipeline), UI design, or billing.
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
  - "billing"
  - "credits"
  - "schema migration"
  - "landing page"
  - "WhatsApp"
  - "n8n"
---

# AI Model Observatory

## Critical
- **NEVER hardcode model selection** -- always query `ai_model_recommendations`
- **Daily sync is the heartbeat** -- if `daily-sync.ts` stops, pricing goes stale
- **Decision audit is mandatory** -- every selection logged to `ai_model_decisions`
- **Kie.ai credit rate**: 1 credit = $0.005 USD
- **New auto-discovered models need manual review** before pipeline use

## Key Files

| File | Purpose |
|------|---------|
| `tools/model-observatory/seed-initial-models.mjs` | Seed 34+ models with full data |
| `tools/model-observatory/daily-sync.ts` | Auto-update from Kie.ai/fal.ai (6 AM UTC cron) |
| `apps/worker/src/services/model-selector.ts` | Runtime query — bridges DB to pipeline |
| `apps/worker/src/services/kie.ts` | Kie.ai API client |
| `apps/web/superseller-site/prisma/schema.prisma` | AIModel, AIModelRecommendation, AIModelDecision schemas |

## Database Tables

- **`ai_models`** — 60+ fields per model (identity, pricing, capabilities, quality scores, real estate scores). Unique: `(provider, modelId)`.
- **`ai_model_recommendations`** — Best model per use case (12 use cases). Unique on `useCase`.
- **`ai_model_decisions`** — Audit log of every model selection with reasoning.

## Kie.ai Dedicated Endpoints

| Endpoint | Models |
|----------|--------|
| `/api/v1/jobs/createTask` | Kling, Nano Banana, Seedream, Flux-2, Qwen, Ideogram, Recraft, Topaz, others |
| `/api/v1/veo/generate` | Veo 3, Veo 3.1 Fast/Quality |
| `/api/v1/runway/generate` | Runway Gen3/Gen4 |
| `/api/v1/generate` | Suno (all versions) |
| `/api/v1/gpt4o-image/generate` | GPT-4o Image, GPT Image 1.5 |
| `/api/v1/flux/kontext/generate` | Flux Kontext Pro/Max |

The `kie_endpoint` column in `ai_models` stores the path for each model. Generic dispatcher: `createKieTask()` in `kie.ts`.

## Pipeline Recommendations (12 use cases)

| Use Case | Primary | Fallback | Cost |
|----------|---------|----------|------|
| `video_clip_generation` | Kling 3.0 Pro | Seedance 2.0 | ~$0.10/clip |
| `room_transition_flf` | Kling 3.0 (FLF) | Wan 2.1 FLF | $0.10-$0.40 |
| `photo_upscale` | Recraft Crisp | ESRGAN | $0.0025/img |
| `music_generation` | Suno V5 | Suno V4.5+ | $0.06/track |
| `photo_classify` | Gemini 3 Flash | Gemini 2.5 Flash | ~$0.001/call |
| `realtor_compositing` | Nano Banana 2 | Nano Banana Pro | $0.02/img |
| `avatar_talking_head` | Kling Avatar v2 Pro | InfiniteTalk | $0.08/s |
| `image_generation` | Seedream 4.5 | Flux Kontext Pro | $0.032/img |
| `image_editing` | Flux Kontext Pro | GPT-4o Image | $0.025/img |
| `voice_narration` | ElevenLabs TTS Turbo 2.5 | Dialogue V3 | $0.02/gen |
| `video_upscale` | Topaz Video | Recraft Crisp | $0.04/s |
| `sound_effects` | ElevenLabs SFX V2 | — | $0.02/sfx |

## Commands

```bash
node tools/model-observatory/seed-initial-models.mjs          # Seed (idempotent)
npx tsx tools/model-observatory/daily-sync.ts                  # Live sync
SYNC_DRY_RUN=1 npx tsx tools/model-observatory/daily-sync.ts  # Dry run
```

## Error-Cause-Fix

| Error | Fix |
|-------|-----|
| `daily-sync` extracts 0 models | Kie.ai changed page structure — update parser |
| Price data stale (>7 days) | Cron not running — `ssh root@172.245.56.50 "crontab -l"` |
| Wrong model selected | Update `ai_model_recommendations` row |
| New model has NULL scores | Manually populate quality/capability fields |

## Full Model Inventory

See [references/model-inventory.md](references/model-inventory.md) for all 50+ curated models with pricing, capabilities, and notes across 8 categories.

## References

- `tools/model-observatory/README.md` -- Architecture spec
- `.claude/skills/tourreel-pipeline/SKILL.md` -- Pipeline that consumes observatory
- `.claude/skills/cost-tracker/SKILL.md` -- Cost tracking paired with observatory pricing
- NotebookLM 02c3946b -- AI Cost & Performance benchmarks
