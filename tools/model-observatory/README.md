# AI Model Observatory
**Purpose:** Automated monitoring and tracking of all AI models across providers (Kie.ai, Google, OpenAI, Anthropic, etc.)

**Why:** User mandate: "i cannot afford u not being fully updated on kie.ai/market and all llm's and models without exception"

---

## Architecture

### 1. Model Database (`ai_models` table in Postgres)

```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,              -- 'kie.ai', 'google', 'openai', 'anthropic'
  model_name TEXT NOT NULL,            -- 'gemini-3-flash', 'gpt-4o', 'claude-opus-4'
  model_id TEXT NOT NULL,              -- Canonical ID for API calls
  version TEXT,                        -- '1.0', '2.5', etc.
  release_date DATE,
  capabilities JSONB,                  -- {vision: true, reasoning: 'high', context_window: 1000000}
  pricing JSONB,                       -- {input_per_1m: 0.15, output_per_1m: 0.90}
  benchmarks JSONB,                    -- {arc_agi: 77.1, mmlu: 85.3, ...}
  kie_endpoint TEXT,                   -- For Kie.ai models: 'gemini-3-flash/v1/chat/completions'
  status TEXT DEFAULT 'active',        -- 'active', 'deprecated', 'beta'
  discovered_at TIMESTAMP DEFAULT NOW(),
  last_checked TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, model_name, version)
);

CREATE INDEX idx_models_provider ON ai_models(provider);
CREATE INDEX idx_models_status ON ai_models(status);
CREATE INDEX idx_models_capabilities ON ai_models USING GIN(capabilities);
```

### 2. Model Recommendations (`model_recommendations` table)

```sql
CREATE TABLE model_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case TEXT NOT NULL,              -- 'vision_analysis', 'text_generation', 'reasoning'
  recommended_model_id UUID REFERENCES ai_models(id),
  fallback_model_id UUID REFERENCES ai_models(id),
  reasoning TEXT,                      -- Why this model was chosen
  cost_per_1k_tokens DECIMAL(10,6),   -- Calculated cost
  performance_score DECIMAL(5,2),      -- 0-100 score
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Observatory Agent (Cron Job)

**Script:** `tools/model-observatory/observatory-agent.mjs`

**Schedule:** Daily at 3 AM UTC

**Tasks:**
1. **Scrape Kie.ai/market** for new models
2. **Check Google AI Studio** model list
3. **Query OpenAI API** for model updates
4. **Parse Anthropic releases** from their blog/API
5. **Compare with database** → detect new models, version updates, deprecations
6. **Update database** with new discoveries
7. **Send alert** to admin if major model release detected
8. **Generate report** of recommended model changes

---

## Usage

### Query Best Model for Use Case

```typescript
import { getRecommendedModel } from './model-observatory';

const model = await getRecommendedModel('vision_analysis', {
  maxCostPer1M: 1.0,        // Budget constraint
  minContextWindow: 100000,  // Token requirement
  requiresReasoning: true    // Capability requirement
});

console.log(model);
// {
//   provider: 'kie.ai',
//   modelName: 'gemini-3-flash',
//   endpoint: 'https://api.kie.ai/gemini-3-flash/v1/chat/completions',
//   pricing: { input: 0.15, output: 0.90 },
//   reasoning: '15% better accuracy than 2.5-flash, 70% cheaper than official Google API'
// }
```

### Manual Model Discovery

```bash
cd tools/model-observatory
node observatory-agent.mjs --discover
```

### Generate Model Comparison Report

```bash
node observatory-agent.mjs --report vision
```

**Output:** Markdown table comparing all vision-capable models by cost, performance, features.

---

## Initial Seed (Manual)

**Run once to populate database:**

```bash
cd tools/model-observatory
node seed-initial-models.mjs
```

**Seeds:**
- Kie.ai models (gemini-3-flash, gemini-2.5-pro, kling-3.0, nano-banana, etc.)
- Google models (gemini-3.1-pro, gemini-3-pro, gemini-2.5-flash)
- OpenAI models (gpt-4o, gpt-4-turbo, o1)
- Anthropic models (claude-opus-4, claude-sonnet-4)

---

## Research Workflow Integration

**Before making AI model decision:**

1. **Query Observatory:**
   ```typescript
   const options = await getRecommendedModel('video_generation');
   ```

2. **Check for updates:**
   ```bash
   node observatory-agent.mjs --check-updates
   ```

3. **Document decision:**
   ```typescript
   await logModelDecision({
     useCase: 'tourreel_vision_analysis',
     chosenModel: 'gemini-3-flash',
     reasoning: 'Best balance of cost ($0.15/1M) and accuracy (15% > 2.5-flash)',
     alternativesConsidered: ['gemini-2.5-pro', 'gpt-4-vision'],
   });
   ```

---

## Alerts

**Notify admin when:**
- New model released (e.g., Gemini 3.1 Pro)
- Model deprecated (e.g., GPT-3.5)
- Price change (e.g., Kling raised prices)
- Better model available for current use case

**Delivery:** Email + Slack webhook

---

## Next Steps

1. **Build schema** (Prisma migration)
2. **Seed initial data** (current known models)
3. **Build scraper** for Kie.ai/market
4. **Build agent** (cron job)
5. **Integrate into decision workflow** (require Observatory check before model selection)

---

**Status:** 📋 Spec complete, code NOT started
**Priority:** 🔴 HIGH (user mandate)
**Owner:** Claude
