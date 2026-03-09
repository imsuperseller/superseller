# AI Model Registry — SuperSeller AI

> **Purpose**: Single source of truth for every AI model used across all products.
> **Last Updated**: March 8, 2026
> **Live observatory**: `ai_models` PostgreSQL table (auto-synced from Kie.ai + fal.ai daily at 6 AM UTC via Model Observatory)
> **Model selector**: `apps/worker/src/services/model-selector.ts` (queries `ai_models` table at runtime)

---

## Cost Rates (USD) — Canonical

| Model | Per-Unit Cost | Unit | Notes |
|-------|-------------|------|-------|
| Kling Pro (3.0) | $0.10 | clip | via Kie.ai |
| Kling Std (3.0) | $0.03 | clip | via Kie.ai |
| Nano Banana 2 | $0.02 | image | 4 credits × $0.005 |
| Suno V5 | $0.06 | track | 12 credits × $0.005 |
| ElevenLabs TTS | $0.02 | generation | via Kie.ai or direct |
| Flux 2 Pro | $0.025 | image | text-to-image V3 pipeline |
| Recraft | $0.0025 | image | 0.5 credits |
| Avatar Pro | $0.10 | video | Winner Studio |
| Infinitalk | $0.08 | video | Winner Studio |
| Gemini Flash (text) | $0.001 | prompt | via Kie.ai proxy |
| Gemini Flash (vision) | $0.002 | prompt | via Kie.ai proxy |
| Claude Haiku | ~$0.001 | call | memory extraction, guardrails |
| Resend email | $0.001 | email | |
| R2 upload | $0.0001 | upload | |

**Kie.ai credit rate**: 1 credit = $0.005 USD

---

## Models by Product

### TourReel — Real Estate Video
| Role | Model | Endpoint | Notes |
|------|-------|----------|-------|
| AI video clips | Kling 3.0 | `kling-3.0/video` | Pro = $0.10, Std = $0.03 |
| Room images | Nano Banana 2 | Kie.ai nano-banana | 4 credits/image |
| Background music | Suno V5 | `generate/record-info` | 12 credits/track |
| Property analysis | Gemini Flash Vision | Kie.ai proxy | Floorplan + room classifier |
| Script/prompts | Gemini Flash | Kie.ai proxy | Prompt generator |
| Photo composition | Remotion | Local render | Zero cost (Ken Burns, transitions) |

### Elite Pro Remodeling — Instagram Pipeline
| Role | Model | Notes |
|------|-------|-------|
| Video clips | Kling 3.0 / Sora cameos | 9:16 vertical reels |
| Images (carousels) | Nano Banana 2 | Brand-matched aesthetic |
| Voice (Mor/Saar) | ElevenLabs direct API | eleven_multilingual_v2. Voice IDs in elite-pro-remodeling.md |
| Captions/strategy | Claude (Sonnet/Haiku) | Via Anthropic API |
| Competitor scraping | Apify `curious_coder/facebook-ad-library-scraper` | $0.75/1K ads |

### Winner Studio — Avatar Videos
| Role | Model | Notes |
|------|-------|-------|
| Avatar lip-sync | Avatar Pro | $0.10/video |
| Long-form avatar | Infinitalk | $0.08/video |
| Script generation | Gemini Flash | Via Kie.ai |

### ClaudeClaw — WhatsApp AI Bridge
| Role | Model | Notes |
|------|-------|-------|
| Personal/business responses | Claude Sonnet 4.6 | `claude-sonnet-4-6` |
| Memory extraction | Claude Haiku | `claude-haiku-4-5-20251001` — fires every 15 messages |
| Embeddings (RAG) | nomic-embed-text | Ollama local, 768-dim, pgvector |

### FB Marketplace Bot
| Role | Model | Notes |
|------|-------|-------|
| Listing images | Nano Banana 2 | $0.02/image via Kie.ai |
| Listing text | Gemini Flash | Via Kie.ai proxy |
| Lead analysis | Gemini Flash | Telnyx voice → transcript → analysis (n8n) |

### AgentForge (Spec Only — Not Built)
| Role | Model | Notes |
|------|-------|-------|
| Business research | Claude Sonnet 4.6 | Multi-stage pipeline |
| Web analysis | Gemini Flash Vision | Screenshot analysis |

---

## Key Kie.ai Endpoints

| Task Type | Endpoint | Used For |
|-----------|----------|---------|
| Kling video | `/api/v1/jobs/createTask` | TourReel clips |
| Nano Banana | `/api/v1/jobs/createTask` | Room images, listing images |
| Suno music | `generate/record-info` | Background music |
| ElevenLabs TTS | `jobs/recordInfo` | Voice generation |
| Gemini text | `/gemini-3-flash/v1/chat/completions` | Analysis, prompts |
| Generic dispatcher | `createKieTask()` in `kie.ts` | Any model by endpoint |

---

## Model Selection (Runtime)

The `model-selector.ts` service queries the `ai_models` PostgreSQL table at runtime to get:
- `model_id` — internal identifier
- `kie_model_param` — exact string to pass Kie.ai
- `kie_endpoint` — which endpoint to hit
- `cost_per_unit` — live pricing
- `fallback_kie_endpoint` — if primary endpoint is down

**To add a new model**: Insert a row into `ai_models` table. The selector picks it up automatically without code changes.

---

## ElevenLabs (Direct API — NOT via Kie.ai)

Kie.ai does NOT support voice cloning. ElevenLabs must be called directly.

- **Max concurrent**: 5 TTS requests (generate sequentially)
- **Short sentence bug**: ~0.5s files produced → retry with padded text
- **Voice IDs**:
  - Mor Dayan: `1prnFNmpCkb2bx39pQSi`
  - Saar Bitton: `jlOXsp2JeEQ29fkljTTO`
- **Model**: `eleven_multilingual_v2`

---

## Ollama (Local — Zero Cost)

- **Model**: `nomic-embed-text` (768-dim embeddings)
- **Host**: http://172.245.56.50:11434
- **Used by**: ClaudeClaw RAG, pgvector semantic search
- **Managed by**: systemd `ollama` service on RackNerd

---

*For live model data, query: `SELECT model_id, category, cost_per_unit, kie_endpoint FROM ai_models ORDER BY category;`*
