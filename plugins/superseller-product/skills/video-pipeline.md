---
name: Video Pipeline
description: TourReel and Winner Studio video generation architecture
---

# Video Pipeline

## TourReel — Dual-Path Architecture

### Path 1: Kling AI Clips (Cinematic)
- **Input**: Zillow listing URL → scrape photos + details
- **Processing**: Floorplan analysis → room detection → shot planning
- **Generation**: Kie.ai Kling 3.0 Pro/Standard → AI-generated cinematic clips
- **Assembly**: FFmpeg → master video with transitions, music, branding
- **Cost**: $0.10/clip (Pro), $0.03/clip (Standard)
- **Output**: R2-hosted MP4, playable URL

### Path 2: Remotion Composition (Photo)
- **Input**: Property photos (up to 50)
- **Processing**: Ken Burns pan/zoom effects, light transitions, branding overlays
- **Rendering**: Remotion 4.0 on RackNerd (7.4s bundle warmup, cached)
- **Cost**: $0.00 per render (CPU only)
- **Output**: R2-hosted MP4

### Pipeline Components
- **Worker**: `apps/worker/src/queue/workers/` — BullMQ job processing
- **Renderer**: `apps/worker/src/services/remotion-renderer.ts`
- **Remotion**: `apps/worker/remotion/` — 11 components, 4 aspect ratios
- **API**: `POST /api/jobs/remotion`, `POST /api/jobs/remotion/from-zillow`

## Winner Studio — Avatar Videos
- **Brain**: Gemini Flash routing for script generation
- **Video**: Kie.ai Avatar Pro / Infinitalk for lip-sync avatar
- **Delivery**: WhatsApp via WAHA
- **Storage**: R2
- **Status**: Built end-to-end, Yossi not actively using

## Model Observatory Integration
- 34 models tracked in `ai_models` table
- Runtime selector: `apps/worker/src/services/model-selector.ts`
- 5-minute cache with hardcoded fallback
- Gap: Kling clip generation still hardcodes `kling-3.0/video`

## Cost Tracking (MANDATORY)
Every API call must log via `trackExpense()` in `expense-tracker.ts`.
