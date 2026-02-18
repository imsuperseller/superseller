---
name: tourreel-pipeline
description: >-
  TourReel real estate video pipeline automation. Covers Zillow scraping, floorplan analysis,
  Kling 3.0 video generation, FFmpeg assembly, clip regeneration, and deployment on RackNerd.
  Use when working on TourReel, real estate video, property video, listing video, video pipeline,
  Kie.ai, Kling, clip generation, or video worker code. Not for UI/UX design, n8n workflows,
  WhatsApp bots, or non-video backend code.
  Example: "Fix the double realtor bug in the video pipeline".
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

## Pipeline Overview

```
Zillow Scrape → Floorplan Analysis → Prompt Generation → Kling Clip Gen → FFmpeg Assembly → R2 Upload
```

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
| 6 | generating_clips | 20-70% | Kling 3.0 clip generation + polling (10s intervals, 15min timeout) |
| 7-9 | stitching/adding_music | 75-90% | FFmpeg concat → music overlay → text overlays (stub) |
| 10-12 | exporting | 90-100% | Generate variants (vertical/square/portrait/thumb) → upload → complete |

### Key Files

| File | Purpose |
|------|---------|
| `apps/worker/src/queue/workers/video-pipeline.worker.ts` | Main pipeline orchestrator (694 lines) |
| `apps/worker/src/services/kie.ts` | Kling 3.0 + Suno API (411 lines) |
| `apps/worker/src/services/gemini.ts` | Gemini 3 Pro — vision, prompts (266 lines) |
| `apps/worker/src/services/ffmpeg.ts` | Video normalization, stitching, variants (348 lines) |
| `apps/worker/src/services/prompt-generator.ts` | Clip prompt generation (319 lines) |
| `apps/worker/src/services/room-photo-mapper.ts` | Photo-to-room assignment (157 lines) |
| `apps/worker/src/services/floorplan-analyzer.ts` | Floorplan vision analysis (356 lines) |
| `apps/worker/src/services/regen-clips.ts` | Clip regeneration (191 lines) |
| `apps/worker/src/services/apify.ts` | Zillow scraping (190 lines) |
| `apps/worker/src/api/routes.ts` | API endpoints (295 lines) |

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

### Three Prompt Modes

1. **Property-Only** — no realtor, empty rooms, cinematic camera
2. **Realtor-in-Frame** — Nano Banana composite as start frame, minimal prompt (no person actions)
3. **Kling Elements** — native `@realtor` reference (no Nano composite needed)

### Environment Overrides

| Variable | Effect |
|----------|--------|
| `FORCE_NO_REALTOR=1` | Disable realtor even if avatar present |
| `USE_KLING_ELEMENTS=1` | Enable native Kling character reference |
| `USE_AI_PHOTO_MATCH=false` | Disable vision-based photo matching |
| `KIE_KLING_MODE=std` | Override to 720p (for Kie 500 recovery) |
| `NANO_BANANA_RESOLUTION=2K` | Lower composite resolution |

### When Debugging

1. Check `findings.md` for known issues and root causes (NEVER REPEAT section)
2. Check `apps/worker/src/services/kie.ts` for API constraints and prompt patterns
3. Check `apps/worker/src/services/room-photo-mapper.ts` for room sequencing logic
4. Check job status: `curl -s http://172.245.56.50:3002/api/jobs/<jobId>`
5. Check worker health: `curl -s http://172.245.56.50:3002/api/health`
6. Worker logs: `ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 100"`

### When Modifying Prompts

Key rules:
- One primary camera movement per clip
- Eye-level POV (5ft)
- Room-specific camera flows are hardcoded in `kie.ts`
- Negative prompts are composited from multiple layers (silent + identity + duplicate + spatial + room-specific)
