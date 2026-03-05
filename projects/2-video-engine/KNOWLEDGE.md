# Project 2: Video Engine — Knowledge Base

## Architecture Overview

The Video Engine is a Node.js worker running on RackNerd VPS (172.245.56.50). It processes video generation jobs via BullMQ queues, combining AI-generated clips (Kling via Kie.ai) with Remotion photo compositions and FFmpeg assembly.

## Tech Stack
- **Runtime**: Node.js + TypeScript (tsx for dev, tsc for build)
- **Queue**: BullMQ (Redis-backed job queues)
- **ORM**: Drizzle (PostgreSQL)
- **Video**: Remotion 4.0.429 (photo compositions), FFmpeg (assembly/transcoding)
- **AI**: Kie.ai (Kling 3.0 clips, image gen), Gemini (scene analysis), Suno (music), Nano Banana (upscaling)
- **Storage**: Cloudflare R2
- **Process Manager**: PM2 on RackNerd

## Key Patterns

### Video Pipeline Flow
1. Job created in BullMQ → `video-pipeline.worker.ts` picks up
2. Gemini analyzes property photos → room detection, scene planning
3. Kling 3.0 generates AI clips per scene (or Remotion for photo compositions)
4. FFmpeg assembles clips with transitions, music, branding
5. Final video uploaded to R2, URL stored in DB

### Model Selection
- `model-selector.ts` queries `ai_models` table with 5-minute cache
- 34 curated + 118 auto-discovered models in PostgreSQL
- Daily sync from Kie.ai + fal.ai at 6 AM UTC
- Runtime selection based on use-case, quality, cost, availability

### Remotion Integration
- 19 components in `apps/worker/remotion/`
- Types: PropertyTour, CrewReveal, CrewDemo V1/V2/V3
- `remotion-renderer.ts` handles `renderPropertyTour` + `renderComposition`
- BullMQ queue: `remotionQueue` via `remotion.worker.ts`
- Zero-cost alternative to Kling AI clips

### Cost Tracking (MANDATORY)
Every API call MUST log cost via `trackExpense()`:
| Service | Cost |
|---------|------|
| Kling Pro | $0.10/clip |
| Kling Std | $0.03/clip |
| Suno | $0.06/generation |
| Nano Banana | $0.04-$0.09/upscale |
| Gemini | $0.001/call |
| Recraft | $0.0025/image |

Kie.ai credit rate: 1 credit = $0.005 USD.

### Retry & Resilience
- Exponential backoff for external API calls
- Circuit breaker pattern for Kie.ai outages
- Fallback chains: Kling Pro → Kling Std → Remotion composition
- `apps/worker/src/utils/retry.ts` for retry logic

## Database Tables
- Uses Drizzle ORM pointing to same PostgreSQL as web
- **Shared table**: User (exists in both Prisma and Drizzle — must stay in sync)
- **Drizzle-only tables**: Job, Clip — these do NOT exist in Prisma. Worker owns these exclusively.
- Worker reads: AiModel, AiModelRecommendation (populated by daily sync, Prisma-managed)

## API Contracts

### Exposed
- `GET /api/health` — worker health status (port 3002 on RackNerd)
- `POST /api/jobs` — create video generation job
- `GET /api/jobs/:id` — job status
- BullMQ job completion → updates DB directly

### Consumed
- Kie.ai API (Kling, image gen, music, upscaling)
- Gemini API (scene analysis)
- Cloudflare R2 (storage)
- Web API for credit deductions

## PM2 Services on RackNerd
- `tourreel-worker` — main video pipeline worker
- Remotion queue worker
- Daily sync cron (model observatory)

## Important Constraints
- Kling only accepts jpg/png — NOT webp (caused $8.60 burn Feb 28)
- Rate limit: 20 req/10s, 100+ concurrent on Kie.ai
- FFmpeg must be kept updated: `tools/update-ffmpeg.sh` (cron daily)
- Worker port: 3002 on RackNerd, 3001 locally (when web runs on 3002)
