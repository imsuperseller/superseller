# Zillow-to-Video Pipeline — Agent Handoff

**Purpose:** Share this document with another Claude agent to get a second opinion on architecture, approach, and improvements. Copy the entire file and paste into a new chat.

---

## 1. What It Is

An AI-powered property tour video pipeline. User pastes a Zillow listing URL; the system scrapes photos, generates cinematic video clips with a realtor avatar walking through the property, stitches them, adds music, and uploads to R2.

**Input:** Zillow URL  
**Output:** ~15–60 second property tour video (MP4) with realtor guiding the viewer

**Tech:** Node.js, Express, BullMQ, PostgreSQL, Redis, Kie.ai (Kling 3.0, Nano Banana Pro, Suno), Gemini, FFmpeg, Cloudflare R2

---

## 2. Pipeline Flow (As Implemented)

```
1. Scrape Zillow listing (Apify) → photos, description, amenities
2. Store listing in PostgreSQL
3. Create video_job, enqueue BullMQ job
4. Worker picks up job:
   a. Floorplan analysis (if URL provided) or default room sequence from beds/baths
   b. Hero features (pool, kitchen island, fireplace, etc.) from description
   c. Cap rooms to MAX_CLIPS (15 default, 3 for smoke)
   d. Generate clip prompts via Gemini (realtor-centric when user has avatar)
   e. Pick best opening photo via Gemini vision (front of house, reject pool/interior)
   f. Nano Banana: composite realtor into opening + each room photo (avatar + scene → composite)
   g. Kling 3.0: image-to-video. Clip 1: first=Nano opening, last=Nano room1. Clips 2+: first=extracted last frame from previous video (true continuity), last=Nano next room. NO Kling Elements (causes collage).
   h. FFmpeg: normalize clips, concat (no xfade)
   i. Suno: background music
   j. Upload master.mp4 to R2, update job
```

---

## 3. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Nano Banana for every clip** | Same avatar in every composite → same realtor identity. |
| **extractLastFrame for continuity** | Clip 2+ start = actual last frame from previous video. Same frame at cut = no visible transition. Kling does not output exact last_frame; using Nano end frames caused visible cuts. |
| **NO Kling Elements** | Elements combines/blends multiple images → collage effect. Realtor already in Nano Banana composite. |
| **Negative prompts** | Always send "talking, speaking, lips moving, mouth open" to Kling to prevent realtor from appearing to speak. |
| **Opening photo** | `pickBestApproachPhotoForOpening()` rejects pool, backyard, interior. Must start at front of house. |
| **Pool safety** | Realtor STANDS on deck, gestures toward pool. Never walks toward the water. |

---

## 4. Key Files

| File | Role |
|------|------|
| `src/queue/workers/video-pipeline.worker.ts` | Main pipeline orchestration |
| `src/services/kie.ts` | Kling 3.0, Suno, Veo (Kling only used) |
| `src/services/nano-banana.ts` | Realtor-in-scene composites |
| `src/services/nano-banana-prompts.ts` | Room-specific prompts, identity anchor, pool safety |
| `src/services/prompt-generator.ts` | LLM clip prompts, negative prompts |
| `src/services/gemini.ts` | Chat, vision, `pickBestApproachPhotoForOpening()` |
| `src/services/hero-features.ts` | Pool detection, hero focus (kitchen, fireplace, etc.) |
| `src/services/floorplan-analyzer.ts` | Tour sequence, default room order |
| `src/services/ffmpeg.ts` | Normalize, concat, music overlay |

---

## 5. Known Issues & Recent Fixes (Feb 2026)

### Fixed
- **Mixed realtors** → Nano Banana for every frame
- **Collage opening** → Removed Kling Elements (combines images → collage)
- **Visible transitions** → Use extractLastFrame from previous video for next clip start (true frame continuity)
- **Realtor speaking** → negative_prompt + "lips closed" in all prompts
- **Opening at pool** → pickBestApproachPhotoForOpening rejects pool/backyard
- **Walking into pool** → Pool prompts: "STANDING on deck, never toward water"

### Validation Order (Mandatory)
1. **Preflight** `--free` + **Dry-run** (with Gemini) → verify prompts, tour, opening
2. **1-clip first**: `MAX_CLIPS=1` → validates opening (pathway, no collage), cheapest
3. **2-clip**: `MAX_CLIPS=2` → validates continuity at cut 1→2
4. **3-clip**: `MAX_CLIPS=3` → full smoke

---

## 6. Sample Output

**Latest smoke test (Feb 2026):**  
https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/c60b6d2f-856d-49fd-8737-7e1fee3fa848/dc7ccb52-f7a4-466e-a805-9dadc0e5face/master.mp4

3 clips: Exterior Front → Front Door → Foyer → Living Room

---

## 7. How to Run

```bash
cd apps/worker

# 1. Preflight (zero credits)
JOB_ID=xxx npx tsx tools/run-preflight.ts --free

# 2. Dry-run WITH Gemini (validates prompts, tour, opening photo)
npx tsx tools/dry-run-pipeline.ts JOB_ID
# Check: Tour starts Exterior, Clip 1 has pathway/walkway, lips closed

# 3. 1-clip validation (opening only)
#    Terminal 1: MAX_CLIPS=1 npx tsx src/index.ts
#    Terminal 2: npx tsx tools/run-1clip-validation.ts
#    Verify: single shot, pathway to door, no collage, no talking

# 4. 2-clip (continuity at cut)
#    MAX_CLIPS=2, run smoke, verify cut 1→2 invisible

# 5. 3-clip full smoke (only after 1- and 2-clip pass)
#    MAX_CLIPS=3 npx tsx src/index.ts
#    npx tsx tools/run-smoke.ts
```

See `3-SCENE_VERIFICATION.md` for criteria → code mapping and failure analysis.

Requires: API server at localhost:3002, worker processing jobs, DATABASE_URL, REDIS_URL, KIE_API_KEY, R2 credentials.

---

## 8. Questions for Second Opinion

1. **Realtor consistency:** Nano Banana for all composites. extractLastFrame for clip-to-clip continuity. Still seeing drift?
2. **Seamless cuts:** Using actual last frame from previous video (not Kling’s target end frame) for next clip start. Validate with 1-clip first, then 2-clip.
3. **Cost optimization:** Full tour = 14+ Nano Banana + 13+ Kling calls. Any way to reduce without sacrificing quality?
4. **Opening photo:** Gemini vision picks from [exterior, photo1, photo2]. Sometimes Zillow leads with pool. Our prompt rejects pool—does this hold up in practice?
5. **Architecture:** Is Express + BullMQ the right fit, or would a different job system (e.g. Inngest, Trigger.dev) be better for long-running video jobs?

---

*Generated for agent handoff. Project lives in `apps/worker/` within rensto monorepo.*
