---
name: model-select
description: Query the Model Observatory for the best AI model for a given task
---

# Model Select

Query the SuperSeller AI Model Observatory (34 models, 7 categories) to find the optimal model for a specific task.

## Categories

1. **video** — Kling 3.0, Kling 2.0, Sora 2, HiDream, Wan 2.1
2. **llm** — Gemini Flash 2.5, GPT-5.2, Claude Opus 4.6
3. **upscale** — Topaz AI, Real-ESRGAN
4. **compositing** — Nano Banana Pro, Nano Banana 2
5. **image** — Recraft, Seedream 5, FLUX
6. **avatar** — Kie.ai Avatar Pro, Infinitalk
7. **music** — Suno v4, Udio

## Steps

1. Ask what the task is (e.g., "room transition video", "product image", "background music")
2. Query `ai_models` table filtered by `use_case` category
3. Compare on: quality score, cost per generation, speed, API reliability
4. Check `ai_model_recommendations` table for existing recommendations
5. Return top 3 options with pros/cons and cost comparison

## Decision Factors

- **Quality vs Cost**: Production renders use Pro models; test renders use Standard
- **Speed**: Some models are 10x faster but lower quality
- **API Reliability**: Check recent success rates from monitoring data
- **Credit Impact**: Map model cost to customer credit consumption

## Output

| Model | Provider | Cost | Speed | Quality | Recommendation |
