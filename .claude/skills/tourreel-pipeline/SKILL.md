---
name: tourreel-pipeline
description: >-
  TourReel real estate video pipeline automation. Dual-path: (1) Kling 3.0 AI clip generation +
  FFmpeg assembly, (2) Remotion photo composition (Ken Burns, transitions, branding). Covers Zillow
  scraping, floorplan analysis, clip generation, Remotion rendering, and deployment on RackNerd.
  Use when working on TourReel, real estate video, property video, listing video, video pipeline,
  Kie.ai, Kling, Remotion, composition, Ken Burns, clip generation, or video worker code.
  Not for UI/UX design, n8n workflows, WhatsApp bots, or non-video backend code.
  Example: "Fix the double realtor bug in the video pipeline" or "Update the Remotion intro card".
autoTrigger:
  - "TourReel"
  - "video pipeline"
  - "Kling"
  - "Kie.ai"
  - "clip generation"
  - "FFmpeg"
  - "Remotion"
  - "Ken Burns"
  - "composition"
  - "real estate video"
  - "listing video"
  - "Zillow scrape"
  - "floorplan"
  - "video worker"
  - "Nano Banana"
  - "Suno"
negativeTrigger:
  - "UI design"
  - "n8n"
  - "WhatsApp"
  - "schema migration"
  - "stripe"
  - "billing"
  - "agentforge"
  - "landing page"
  - "FB Marketplace"
---

# TourReel Video Pipeline

## Critical
- **Kling duration must be `"5"` or `"10"` (string enum)** — floats like `5.00` cause Kie 500 errors
- **NEVER pass Zillow photo URLs to Kling** — they block external fetches. Upload to R2 first.
- **negative_prompt max 500 chars** — longer strings cause request body errors
- **Double realtor fix**: When `realtor_in_frame: true`, prompt MUST start with "The person is ALREADY in the frame" and MUST NOT describe person actions
- **Pool safety**: Realtor stands on deck, gestures toward pool, NEVER walks toward water
- **Worker concurrency: 1** — only one video job per VPS at a time
- **Kling pro mode = 1080p native**; std mode = 720p (causes blur when upscaled)
- **Force 1920x1080 normalization**: ALL normalizeClip calls MUST pass explicit `{ width: config.video.outputWidth, height: config.video.outputHeight }` — Kling native resolution varies per clip
- **Exclude floorplan from photo pool**: After `detectFloorplanInPhotos()`, remove floorplan URL from both `flatPhotos` AND `additionalPhotos` — otherwise it appears as a clip start frame
- **Kling end-frame continuity**: Parallel mode passes `last_frame` (next clip's room photo) to Kling so each clip morphs toward the next room — zero crossfade, seamless concat only
- **Text overlay timing**: Use `getVideoDuration()` on normalized clips for actual durations — never trust DB `duration_seconds` for overlay positioning
- **CTA overlay minimum 4s**: `ctaDuration = Math.max(dur - 1.5, 4)` — user must have time to read
- **Sentinel clip pattern**: First clip generates alone to probe Kie.ai credits before batch submission

## Pipeline Overview

**Two generation paths** (both live):

```
PATH 1 — AI Clips (Kling):
Zillow Scrape → Floorplan Analysis → Prompt Generation → Kling Clip Gen → FFmpeg Assembly → R2 Upload

PATH 2 — Remotion Composition (Photos):
Zillow Scrape → Photo extraction → Remotion renderMedia() (Ken Burns, transitions, intro/outro, branding) → H.264 MP4 → R2 Upload
```

**When to use which:**
- **Kling path**: AI-generated cinematic clips with motion, realtor compositing, Kling Elements identity
- **Remotion path**: Photo-based tours with Ken Burns animation, zero API cost, deterministic, ~60s render time
- **Remotion Bible**: `docs/REMOTION_BIBLE.md` — canonical reference for Remotion composition
- **Remotion code**: `apps/worker/remotion/` (11 components, 4 compositions, renderer at `src/services/remotion-renderer.ts`)

### Pipeline Stages (12 steps)

| Stage | Status | Progress | What Happens |
|-------|--------|----------|--------------|
| 0 | analyzing | 0% | Idempotent check — skip if `master_video_url` exists |
| 1a | analyzing | 5% | Credit pre-check (balance >= maxClips * 15) |
| 1b | analyzing | 5% | Floorplan auto-detect via Gemini vision |
| 2 | analyzing | 5-15% | Floorplan analysis → TourRoom[] sequence |
| 2b | analyzing | 5-15% | Hero feature detection (pool, fireplace, etc.) |
| 3 | generating_prompts | 15% | LLM generates cinematic clip prompts per room |
| 4 | pending | 15-20% | Insert clip records into DB |
| 5a | generating_clips | 20% | Upload listing photos to R2 (Kling can't fetch Zillow URLs) |
| 5b-c | generating_clips | 20-34% | Nano Banana composites (realtor + photo) |
| 6 | generating_clips | 20-70% | Kling 3.0 clip generation (hero rooms 10s, others 5s) + end-frame continuity (next room photo as `last_frame`) + room-specific negatives + polling (10s intervals, 15min timeout) |
| 6b | generating_clips | 70% | Sentinel clip (first clip alone) probes Kie.ai credits before batch |
| 7-9 | stitching/adding_music | 75-90% | Force 1920x1080 normalize → seamless concat (NO crossfade) with boundary frames → music overlay → text overlays (actual measured durations, hero rooms get large text, CTA min 4s) |
| 10-12 | exporting | 90-100% | Generate variants (vertical/square/portrait/thumb) → upload → complete |

### Key Files

| File | Purpose |
|------|---------|
| `apps/worker/src/queue/workers/video-pipeline.worker.ts` | Main pipeline orchestrator (~1050 lines) |
| `apps/worker/src/services/kie.ts` | Kling 3.0 + Suno API (411 lines) |
| `apps/worker/src/services/gemini.ts` | Gemini 3 Pro — vision, prompts (266 lines) |
| `apps/worker/src/services/ffmpeg.ts` | Video normalization, stitching, variants (348 lines) |
| `apps/worker/src/services/prompt-generator.ts` | Clip prompt generation (319 lines) |
| `apps/worker/src/services/room-photo-mapper.ts` | Photo-to-room assignment (157 lines) |
| `apps/worker/src/services/floorplan-analyzer.ts` | Floorplan vision analysis (356 lines) |
| `apps/worker/src/services/regen-clips.ts` | Clip regeneration (191 lines) |
| `apps/worker/src/services/apify.ts` | Zillow scraping (190 lines) |
| `apps/worker/src/api/routes.ts` | API endpoints (295 lines) |
| `apps/worker/src/services/remotion-renderer.ts` | Remotion SSR (renderPropertyTour, ensureBundle) |
| `apps/worker/remotion/src/PropertyTourComposition.tsx` | Main Remotion composition (rooms, transitions, branding) |
| `apps/worker/remotion/src/components/` | IntroCard, OutroCard, RoomLabel, KenBurnsSlide |
| `apps/worker/remotion/src/config/timing.ts` | FPS, durations, room timing constants |
| `docs/REMOTION_BIBLE.md` | Canonical Remotion reference (15 sections) |

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/jobs/from-zillow` | Create job from Zillow address/URL |
| POST | `/api/jobs` | Create job from existing listing |
| GET | `/api/jobs?userId=` | List jobs for user |
| GET | `/api/jobs/:id` | Get job details + clips |
| POST | `/api/jobs/:id/regenerate` | Regenerate specific clips |
| POST | `/api/jobs/:id/retry-fresh` | Reset and re-queue job |
| GET | `/api/health` | Worker health check |

### Environment Overrides

| Variable | Effect |
|----------|--------|
| `FORCE_NO_REALTOR=1` | Disable realtor even if avatar present |
| `USE_KLING_ELEMENTS=1` | Enable native Kling character reference |
| `USE_AI_PHOTO_MATCH=false` | Disable vision-based photo matching |
| `KIE_KLING_MODE=std` | Override to 720p (for Kie 500 recovery) |
| `NANO_BANANA_RESOLUTION=2K` | Lower composite resolution |
| `USE_MULTI_SHOT=1` | Enable Kling 3.0 multi-shot (cinematic cuts within one clip) |
| `KLING_SOUND=1` | Enable Kling native ambient audio (footsteps, doors) |
| `KIE_WEBHOOK_URL=https://...` | Kling callBackUrl — webhook on clip completion |

### When Debugging

1. Check `findings.md` for known issues and root causes (NEVER REPEAT section)
2. Check `apps/worker/src/services/kie.ts` for API constraints and prompt patterns
3. Check `apps/worker/src/services/room-photo-mapper.ts` for room sequencing logic
4. Check job status: `curl -s http://172.245.56.50:3002/api/jobs/<jobId>`
5. Check worker health: `curl -s http://172.245.56.50:3002/api/health`
6. Worker logs: `ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 100"`

### Generation Cost Tracking (MANDATORY)

**Every API generation MUST log its cost.** This is persistent across sessions.

#### Known Rates (Feb 2026)

| Service | Operation | Cost | Notes |
|---------|-----------|------|-------|
| Kie.ai | Kling 3.0 Pro clip (10s) | $0.10 | Hero rooms, transitions |
| Kie.ai | Kling 3.0 Std clip (5s) | $0.03 | Standard rooms |
| Kie.ai | Suno music | $0.06 | Per track (12 credits) |
| Kie.ai | Nano Banana composite | $0.02 | Realtor + photo merge. 4 credits. |
| Kie.ai | ElevenLabs TTS (turbo-2-5) | $0.02 | Per generation |
| Kie.ai | ElevenLabs TTS (multilingual-v2) | $0.02 | Per generation |
| FakeYou | TTS (any model) | $0.00 | Free, no API key |
| Gemini | Flash prompt | $0.001 | Per call |
| Gemini | Flash vision | $0.002 | Per image analysis |
| R2 | Upload | $0.0001 | Per operation |
| R2 | Storage | $0.015/GB/mo | Monthly |
| Ollama | Embeddings | $0.00 | Self-hosted |

#### How to Log Costs

**In automated pipeline** (video-pipeline.worker.ts): Use `trackExpense()` from `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts`. Call after each Kling/Suno/Nano/Gemini API call.

**In manual/ad-hoc sessions** (like Purim video): Log costs in the session's progress entry in `progress.md` with a cost table:
```
| Operation | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| Kling 3.0 Pro (transitions) | 3 | $0.10 | $0.30 |
| FakeYou Trump TTS | 8 | $0.00 | $0.00 |
| ElevenLabs TTS | 5 | $0.02 | $0.10 |
| **Session Total** | | | **$0.40** |
```

#### Database Infrastructure (Ready)
- `api_expenses` table (Prisma: `ApiExpense` model) — per-call cost logging
- `LlmModelConfig` table — model registry with per-1M-token costs
- `UsageEvent.costUsd` — credit deductions with cost attribution
- `expense-tracker.ts` — `trackExpense()`, `getDailyExpenses()`, `getExpenseTrend()`, `detectAnomalies()`

### Deep API Reference (Level 2 — loaded on demand)

For detailed API patterns, prompt modes, TTS, transitions, and prompt engineering rules:
- `references/api-deep-reference.md` — Kling 3.0 API, FakeYou TTS, ElevenLabs, transitions, prompt modes
- `references/kling-api-patterns.md` — API constraints, prompt patterns
- `references/prompting-rules.md` — Cinematic prompt engineering
- `references/scene-management.md` — Room sequencing, transitions
- `references/troubleshooting.md` — Known issues, root causes
