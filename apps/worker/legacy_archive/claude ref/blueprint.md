# Building an AI Property Tour Video SaaS: Complete Production Blueprint

**App Name:** TBD (e.g., "TourReel", "ShowingAI", "ReelTour")
**Version:** 2.0 — Corrected Stack
**Date:** February 10, 2026
**Author:** SuperSeller Agency / Shai Friedman

---

## Executive Summary

A self-serve SaaS where realtors upload their listing photos and floorplan, and receive back a fully produced AI-generated property tour video — complete with room-to-room transitions and background music.

The core innovation is  **frame-chaining** : each video clip's end frame becomes the next clip's start frame, creating seamless continuity as the camera "walks" through the property. AI analyzes the floorplan to determine the optimal room sequence. **Nano Banana Pro** (Kie.ai) places the realtor into scene images; **Kling 3.0** (Kie.ai) turns those images into video clips. No FAL. No Veo.

**Production cost per video:** ~$8–25 depending on model tier and clip count
**Target price point:** $49–149/month subscription or $29–39 per video
**Infrastructure cost:** ~$0/month during development, ~$20–25/month at launch
**MVP timeline:** 10–14 weeks

---

## Tech Stack — Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│         Vercel Hobby (Free) — Next.js 14+ App            │
│         Clerk Auth (Free tier — 10K MAUs)                 │
│         Stripe.js for payments                           │
└────────────────────────┬────────────────────────────────┘
                         │ API calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│              RACKNERD VPS (Ubuntu 24)                     │
│              6GB RAM / 100GB Disk / 9.77TB BW            │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  PostgreSQL   │  │    Redis     │  │   FFmpeg      │   │
│  │  (Database)   │  │  (Job Queue) │  │  (Stitching)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │          Node.js Worker Service (PM2)             │    │
│  │    Express API + BullMQ Job Processor             │    │
│  │                                                    │    │
│  │  Jobs:                                             │    │
│  │  1. Floorplan analysis (→ OpenRouter)              │    │
│  │  2. Prompt generation (→ OpenRouter)               │    │
│  │  3. Clip generation (→ kie.ai Kling 3.0)         │    │
│  │  4. Video stitching (→ FFmpeg local)               │    │
│  │  5. Music overlay (→ kie.ai Suno + FFmpeg)         │    │
│  │  6. Upload final (→ Cloudflare R2)                 │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼
┌──────────────────────┐ ┌──────────────────┐
│   kie.ai             │ │ OpenRouter       │
│ Kling 3 (video)      │ │ GPT-4o/Gemini    │
│ Nano Banana (realtor)│ │ (floorplan)      │
│ Suno V5 (music)      │ │                  │
└──────────────────────┘ └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Cloudflare R2   │
              │  (Free tier)     │
              │  Video storage   │
              │  + CDN delivery  │
              │  Zero egress     │
              └──────────────────┘
```

### Stack Decisions & Rationale

| Component           | Choice                                         | Why                                                                    |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| Frontend            | **Vercel Hobby**(Next.js)                | Free, instant deploys, SSR, API routes for lightweight ops             |
| Auth                | **Clerk**(free tier)                     | 10K MAUs free, pre-built components, 5-min Next.js setup               |
| Database            | **PostgreSQL on RackNerd**               | Already installed, full SQL, no row limits, no monthly cost            |
| Job Queue           | **Redis + BullMQ on RackNerd**           | Already installed, proven async job pattern, retries built-in          |
| Video Stitching     | **FFmpeg on RackNerd**                   | Already installed, xfade filter for transitions, zero API cost         |
| Video Gen           | **Kling 3.0 via kie.ai**                 | Image-to-video, 3–15s clips. No FAL. Kie Kling 3 only. |
| Realtor placement   | **Nano Banana Pro via kie.ai**           | Places realtor into room photos (avatar + room image) |
| Music               | **Suno V5 via kie.ai**                   | Watermark-free commercial, instrumental mode, ~$0.10–0.30/track       |
| LLM (floorplan)     | **OpenRouter**→ GPT-4o / Gemini 2.5 Pro | Vision models for floorplan analysis, $0.01–0.05/call                 |
| Object Storage      | **Cloudflare R2**(free tier)             | 10GB free, zero egress, S3-compatible, CDN included                    |
| Payments            | **Stripe**                               | Usage-based billing via Meters, 2.9% + $0.30                           |
| Version Control     | **GitHub**                               | CI/CD to Vercel on push, RackNerd deploys via GitHub Actions           |

---

## Video Generation Pipeline — Technical Deep Dive

### Phase 1: Input & Analysis

```
Realtor uploads:
  ├── Listing photo (exterior — realtor in front of house)
  ├── Floorplan (image/PDF — uploaded or pulled from listing)
  └── Optional: additional interior photos, headshot for reference
```

**Floorplan Analysis via OpenRouter:**

The floorplan image is sent to GPT-4o or Gemini 2.5 Pro Vision with a structured prompt requesting JSON output:

```json
// Prompt to LLM:
"Analyze this floorplan image. Return JSON with:
- rooms: array of {name, type, approximate_position, connects_to[]}
- suggested_tour_sequence: ordered array of room names
  starting from front_door, following a logical walkthrough
- total_rooms: count
- property_type: house/apartment/condo
- special_features: pool, garage, balcony, etc."

// Expected response:
{
  "rooms": [
    {"name": "Foyer", "type": "entrance", "connects_to": ["Living Room", "Hallway"]},
    {"name": "Living Room", "type": "living", "connects_to": ["Foyer", "Kitchen", "Dining Room"]},
    {"name": "Kitchen", "type": "kitchen", "connects_to": ["Living Room", "Pantry"]},
    ...
  ],
  "suggested_tour_sequence": [
    "Exterior → Front Door",
    "Front Door → Foyer",
    "Foyer → Living Room",
    "Living Room → Kitchen",
    "Kitchen → Dining Room",
    "Dining Room → Master Bedroom",
    "Master Bedroom → Master Bathroom",
    "Master Bathroom → Backyard"
  ],
  "total_rooms": 8,
  "property_type": "house",
  "special_features": ["pool", "two_car_garage"]
}
```

**Cost:** $0.01–0.05 per analysis via OpenRouter
**Fallback:** If no floorplan exists, show a manual drag-and-drop room sequencer UI where the realtor orders rooms themselves.

### Phase 2: Prompt Generation

A second LLM call generates the video prompts for each clip transition. Each prompt must:

* Describe the camera movement (smooth dolly, tracking shot)
* Reference the start frame (what's visible) and end frame (destination)
* Maintain consistent style language across all clips
* Specify lighting, time of day, architectural style

```json
{
  "clips": [
    {
      "clip_number": 1,
      "start_frame_description": "Realtor standing in front of a modern two-story home, warm afternoon light",
      "end_frame_description": "Camera arrives at the front door, hand reaching for the door handle",
      "prompt": "Smooth cinematic dolly shot approaching a modern two-story home. Camera glides along the walkway toward the front door. Warm golden hour lighting, slight lens flare. Professional real estate cinematography style, 4K quality.",
      "duration_seconds": 5,
      "start_frame_image": "url_to_exterior_photo",
      "end_frame_image": "generated_or_provided_door_image"
    },
    {
      "clip_number": 2,
      "start_frame_description": "Front door opening to reveal the foyer",
      "end_frame_description": "Camera enters the living room through an archway",
      "prompt": "Camera pushes through a front door into a bright foyer. Smooth forward tracking shot, natural light streaming through windows. Warm interior, hardwood floors. Professional real estate tour cinematography.",
      "duration_seconds": 5,
      "start_frame_image": "end_frame_from_clip_1",
      "end_frame_image": "generated_living_room_entrance"
    }
  ]
}
```

**Cost:** $0.02–0.05 via OpenRouter
**Key insight:** The end_frame_image of clip N becomes the start_frame_image of clip N+1. This is the frame-chain.

### Phase 3: Clip Generation (Rewired Architecture)

**Pipeline:** Nano Banana Pro → scene images with realtor → Kling 3.0 → video clips. No FAL. No Veo.

#### Step 1: Realtor in Scene Images — Nano Banana Pro (Kie.ai)

Nano Banana Pro places the realtor into room photos. **Opening:** Realtor walking from front of house toward front door (approach walk). **Pool:** Hero Moment — gesture toward pool, "Can you believe this?" expression. Input: realtor avatar URL + room photo URL. Output: composite image with realtor in the scene.

```javascript
// kie.ai Nano Banana Pro — realtor into room photo
const taskId = await createNanoBananaTask({
  prompt: "Professional guide from reference photo standing at entrance, gesturing naturally...",
  image_input: [realtorAvatarUrl, roomPhotoUrl],
  aspect_ratio: "16:9",
  resolution: "2K",
  output_format: "png",
});
const { image_url } = await waitForNanoBananaTask(taskId);
```

#### Step 2: Video Clips — Kling 3.0 (Kie.ai)

Kling 3.0 turns each scene image into a video clip. Start frame = Nano Banana output (or exterior photo). End frame chains to next clip for continuity.

```javascript
// kie.ai Kling 3.0 — Image to Video
const taskId = await createKlingTask({
  prompt: clipPrompt,
  image_url: startFrameUrl,   // From Nano Banana or previous clip's last frame
  mode: "std",
  aspect_ratio: "16:9",
});
const status = await waitForTask(taskId, "kling");
const videoUrl = status.result.video_url;
```

**Model stack:**
- **Nano Banana Pro** — Realtor placement in scene images
- **Kling 3.0** — Image-to-video. No fallback to Veo or FAL.

### Phase 4: Video Stitching on RackNerd (FFmpeg)

All clips are downloaded to RackNerd, normalized, and concatenated with crossfade transitions.

```bash
#!/bin/bash
# stitch_tour.sh — concatenate clips with xfade transitions
# Called by the Node.js worker after all clips are downloaded

CLIPS_DIR="$1"      # /tmp/jobs/{job_id}/clips/
OUTPUT="$2"          # /tmp/jobs/{job_id}/final.mp4
TRANSITION="fade"    # Options: fade, dissolve, wipeleft, circleopen, radial
XFADE_DURATION=0.5   # Half-second crossfade between clips

# Step 1: Normalize all clips to same resolution/framerate
for f in ${CLIPS_DIR}/*.mp4; do
  ffmpeg -i "$f" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
    -r 24 -c:v libx264 -preset fast -crf 18 \
    -c:a aac -ar 44100 -ac 2 \
    -y "${f%.mp4}_norm.mp4"
done

# Step 2: Build xfade filter chain dynamically
# For N clips, we need N-1 xfade filters chained together
# Each xfade offset = cumulative_duration - (clip_index * xfade_duration)

python3 build_xfade_chain.py \
  --clips-dir "${CLIPS_DIR}" \
  --transition "${TRANSITION}" \
  --xfade-duration "${XFADE_DURATION}" \
  --output "${OUTPUT}"
```

```python
# build_xfade_chain.py
import subprocess, glob, json, sys, argparse

def get_duration(filepath):
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", filepath],
        capture_output=True, text=True
    )
    return float(json.loads(result.stdout)["format"]["duration"])

def build_ffmpeg_command(clips, transition, xfade_dur, output):
    n = len(clips)
    if n < 2:
        # Single clip — just copy
        return ["ffmpeg", "-i", clips[0], "-c", "copy", output]

    inputs = []
    for c in clips:
        inputs.extend(["-i", c])

    # Build xfade filter chain
    durations = [get_duration(c) for c in clips]
    filter_parts = []
  
    # First xfade
    offset = durations[0] - xfade_dur
    filter_parts.append(
        f"[0:v][1:v]xfade=transition={transition}:duration={xfade_dur}:offset={offset}[v01]"
    )
  
    cumulative = durations[0] + durations[1] - xfade_dur
    for i in range(2, n):
        prev_label = f"v{str(i-2).zfill(2)}{str(i-1).zfill(2)}"
        curr_label = f"v{str(i-1).zfill(2)}{str(i).zfill(2)}"
        offset = cumulative - xfade_dur
        filter_parts.append(
            f"[{prev_label}][{i}:v]xfade=transition={transition}:duration={xfade_dur}:offset={offset}[{curr_label}]"
        )
        cumulative += durations[i] - xfade_dur

    final_label = f"v{str(n-2).zfill(2)}{str(n-1).zfill(2)}"
    filter_complex = ";".join(filter_parts)

    cmd = ["ffmpeg"] + inputs + [
        "-filter_complex", filter_complex,
        "-map", f"[{final_label}]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-movflags", "+faststart",
        "-y", output
    ]
    return cmd

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--clips-dir", required=True)
    parser.add_argument("--transition", default="fade")
    parser.add_argument("--xfade-duration", type=float, default=0.5)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    clips = sorted(glob.glob(f"{args.clips_dir}/*_norm.mp4"))
    cmd = build_ffmpeg_command(clips, args.transition, args.xfade_duration, args.output)
    subprocess.run(cmd, check=True)
    print(f"✅ Stitched {len(clips)} clips → {args.output}")
```

**RackNerd performance estimate:**

* 10 clips at 1080p/24fps, 5 seconds each: **30–90 seconds processing**
* Peak RAM usage with xfade: ~2–4GB (safe within 6GB)
* Disk per job: ~750MB temp (clips + output) → clean up immediately after R2 upload
* **Max concurrent jobs: 1–2** (enforce via BullMQ concurrency setting)

### Phase 5: Music Generation & Overlay

```javascript
// Generate background music via kie.ai Suno API
const musicResponse = await fetch("https://api.kie.ai/v1/suno/generate", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "v5",
    prompt: "Upbeat modern real estate tour background music, " +
            "warm and inviting, light acoustic guitar with soft piano, " +
            "professional and elegant",
    make_instrumental: true,    // No vocals
    duration: videoDurationSecs  // Match video length
  })
});
// Returns task_id → poll for audio_url
```

After music downloads, overlay onto the stitched video:

```bash
# Add music to video — fade in/out, mix at 30% volume
ffmpeg -i final_video.mp4 -i background_music.mp3 \
  -filter_complex "[1:a]volume=0.3,afade=t=in:st=0:d=2,afade=t=out:st=${FADE_OUT_START}:d=3[music];[0:a][music]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  -movflags +faststart \
  -y final_with_music.mp4

# If source video has no audio track (likely), simpler:
ffmpeg -i final_video.mp4 -i background_music.mp3 \
  -filter_complex "[1:a]volume=0.3,afade=t=in:st=0:d=2,afade=t=out:st=${FADE_OUT_START}:d=3[aout]" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k \
  -shortest \
  -movflags +faststart \
  -y final_with_music.mp4
```

**Suno cost:** ~$0.10–0.30 per instrumental track via kie.ai
**Music curation:** Pre-generate 20–30 real estate ambient tracks, store on R2, randomly assign or let agent choose. Only generate fresh music for premium tier or custom requests.

### Phase 6: Multi-Format Export & Upload to R2

```bash
# Generate social media variants from master
# 1:1 Square (Instagram feed)
ffmpeg -i final_with_music.mp4 \
  -vf "crop=ih:ih:(iw-ih)/2:0,scale=1080:1080" \
  -c:v libx264 -crf 20 -y square.mp4

# 9:16 Vertical (TikTok/Reels/Shorts)
ffmpeg -i final_with_music.mp4 \
  -vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920" \
  -c:v libx264 -crf 20 -y vertical.mp4

# 4:5 Portrait (Instagram portrait)
ffmpeg -i final_with_music.mp4 \
  -vf "crop=ih*4/5:ih:(iw-ih*4/5)/2:0,scale=1080:1350" \
  -c:v libx264 -crf 20 -y portrait.mp4

# Generate thumbnail
ffmpeg -i final_with_music.mp4 \
  -vf "select=eq(n\,0)" -frames:v 1 thumbnail.jpg
```

Upload all variants to Cloudflare R2:

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

async function uploadToR2(localPath, r2Key, contentType = "video/mp4") {
  await r2.send(new PutObjectCommand({
    Bucket: "tour-videos",
    Key: r2Key,
    Body: fs.createReadStream(localPath),
    ContentType: contentType,
  }));
  return `https://videos.yourdomain.com/${r2Key}`;
}

// Upload all variants
const urls = {
  master:    await uploadToR2("final_with_music.mp4", `${jobId}/master.mp4`),
  square:    await uploadToR2("square.mp4",           `${jobId}/square.mp4`),
  vertical:  await uploadToR2("vertical.mp4",         `${jobId}/vertical.mp4`),
  portrait:  await uploadToR2("portrait.mp4",         `${jobId}/portrait.mp4`),
  thumbnail: await uploadToR2("thumbnail.jpg",        `${jobId}/thumb.jpg`, "image/jpeg"),
};
```

---

## Database Schema (PostgreSQL on RackNerd)

```sql
-- Users & Auth (Clerk handles auth, we store profile + billing)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),          -- Brokerage name
    license_number VARCHAR(100),   -- Real estate license
    stripe_customer_id VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',  -- free, starter, pro, team
    videos_used_this_month INT DEFAULT 0,
    videos_limit INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(255),
    state VARCHAR(50),
    zip VARCHAR(20),
    property_type VARCHAR(50),      -- house, condo, apartment, townhouse
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    sqft INT,
    listing_price DECIMAL(12,2),
    mls_number VARCHAR(50),
    exterior_photo_url TEXT,        -- R2 URL
    floorplan_url TEXT,             -- R2 URL (image or PDF)
    floorplan_analysis JSONB,       -- LLM-parsed room layout
    additional_photos JSONB,        -- Array of R2 URLs
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_listings_user ON listings(user_id);

-- Video Jobs (the main pipeline tracker)
CREATE TABLE video_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    -- pending → analyzing → generating_clips → stitching →
    -- adding_music → exporting → complete → failed
  
    -- Configuration
    model_preference VARCHAR(50) DEFAULT 'kling_3',  -- kling_3 only (no Veo)
    tour_sequence JSONB,            -- Ordered room array (from AI or manual override)
    music_style VARCHAR(100),       -- "upbeat", "elegant", "modern", etc.
    music_track_id UUID,            -- Reference to pre-generated track or NULL for fresh
    transition_style VARCHAR(50) DEFAULT 'fade',  -- fade, dissolve, wipeleft
    include_realtor BOOLEAN DEFAULT false,  -- V2 feature
  
    -- Progress tracking
    total_clips INT,
    completed_clips INT DEFAULT 0,
    current_step VARCHAR(100),
    progress_percent INT DEFAULT 0,
  
    -- Results
    master_video_url TEXT,           -- R2 URL
    square_video_url TEXT,
    vertical_video_url TEXT,
    portrait_video_url TEXT,
    thumbnail_url TEXT,
    video_duration_seconds DECIMAL(6,2),
  
    -- Cost tracking
    total_api_cost DECIMAL(10,4) DEFAULT 0,
  
    -- Errors
    error_message TEXT,
    retry_count INT DEFAULT 0,
  
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_jobs_user ON video_jobs(user_id);
CREATE INDEX idx_jobs_status ON video_jobs(status);

-- Individual Clips (each room-to-room transition)
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_job_id UUID REFERENCES video_jobs(id) ON DELETE CASCADE,
    clip_number INT NOT NULL,       -- Order in sequence
  
    -- Generation config
    from_room VARCHAR(255),
    to_room VARCHAR(255),
    prompt TEXT,
    start_frame_url TEXT,            -- Input image URL
    end_frame_url TEXT,              -- Input image URL
    model_used VARCHAR(50),          -- kling_3
    provider VARCHAR(20),            -- kie
  
    -- API tracking
    external_task_id VARCHAR(255),   -- kie task_id
    status VARCHAR(50) DEFAULT 'pending',
    -- pending → generating → complete → failed → retrying
  
    -- Result
    video_url TEXT,                   -- Downloaded clip URL (temp)
    duration_seconds DECIMAL(6,2),
    api_cost DECIMAL(8,4),
    generation_time_seconds INT,
  
    -- Quality control
    approved BOOLEAN,                -- NULL = not reviewed, true/false
    rejection_reason TEXT,
  
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_clips_job ON clips(video_job_id);

-- Subscriptions & Usage
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255),
    tier VARCHAR(50) NOT NULL,       -- starter, pro, team
    status VARCHAR(50),              -- active, canceled, past_due
    monthly_video_limit INT,
    price_cents INT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage log (for Stripe metered billing)
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    video_job_id UUID REFERENCES video_jobs(id),
    event_type VARCHAR(50),          -- video_generated, clip_retry, premium_export
    credits_used INT DEFAULT 1,
    stripe_meter_event_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usage_user_date ON usage_events(user_id, created_at);

-- Pre-generated music library
CREATE TABLE music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    style VARCHAR(100),              -- "upbeat", "elegant", "modern", "warm"
    mood VARCHAR(100),
    duration_seconds DECIMAL(6,2),
    r2_url TEXT,
    suno_task_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Job Queue Architecture (Redis + BullMQ)

```javascript
// worker.js — runs on RackNerd via PM2
import { Worker, Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null
});

// Define queues
const videoQueue = new Queue("video-pipeline", { connection });

// Main worker — process ONE job at a time (RAM constraint)
const worker = new Worker("video-pipeline", async (job) => {
  const { jobId, listingId, userId } = job.data;
  
  try {
    // Step 1: Analyze floorplan
    await job.updateProgress(5);
    await updateJobStatus(jobId, "analyzing");
    const tourSequence = await analyzeFloorplan(listingId);
  
    // Step 2: Generate prompts
    await job.updateProgress(10);
    const clipPrompts = await generatePrompts(listingId, tourSequence);
  
    // Step 3: Generate clips (parallel with concurrency limit of 3)
    await updateJobStatus(jobId, "generating_clips");
    const clips = await generateAllClips(jobId, clipPrompts, {
      maxConcurrent: 3,  // Don't hammer API
      onProgress: (completed, total) => {
        const pct = 10 + Math.floor((completed / total) * 60);
        job.updateProgress(pct);
      }
    });
  
    // Step 4: Download clips to local disk
    await job.updateProgress(75);
    const localClips = await downloadClipsToTemp(jobId, clips);
  
    // Step 5: Stitch with FFmpeg
    await updateJobStatus(jobId, "stitching");
    await job.updateProgress(80);
    const stitchedPath = await stitchClips(jobId, localClips);
  
    // Step 6: Add music
    await updateJobStatus(jobId, "adding_music");
    await job.updateProgress(85);
    const finalPath = await addMusic(jobId, stitchedPath);
  
    // Step 7: Generate format variants
    await updateJobStatus(jobId, "exporting");
    await job.updateProgress(90);
    const variants = await generateVariants(jobId, finalPath);
  
    // Step 8: Upload to R2
    await job.updateProgress(95);
    const urls = await uploadAllToR2(jobId, variants);
  
    // Step 9: Clean up temp files
    await cleanupTempFiles(jobId);
  
    // Step 10: Mark complete
    await updateJobStatus(jobId, "complete", urls);
    await job.updateProgress(100);
  
    // Notify user (email / push)
    await notifyUser(userId, jobId, urls);
  
    // Track usage for Stripe
    await recordUsageEvent(userId, jobId);
  
  } catch (error) {
    await updateJobStatus(jobId, "failed", null, error.message);
    await cleanupTempFiles(jobId);
    throw error; // BullMQ will handle retry
  }
}, {
  connection,
  concurrency: 1,         // ONE job at a time (6GB RAM constraint)
  limiter: {
    max: 10,              // Max 10 jobs per hour
    duration: 3600000
  },
  settings: {
    backoffStrategy: (attemptsMade) => {
      return Math.min(attemptsMade * 30000, 300000); // 30s, 60s, ... max 5min
    }
  }
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed: ${err.message}`);
});
```

**Temp file management (critical with 100GB disk):**

```javascript
async function cleanupTempFiles(jobId) {
  const jobDir = `/tmp/jobs/${jobId}`;
  await fs.rm(jobDir, { recursive: true, force: true });
  console.log(`🧹 Cleaned up ${jobDir}`);
}

// Also run a cron job to catch orphaned files
// Add to crontab: 0 * * * * find /tmp/jobs -mmin +120 -delete
```

---

## Frontend — Vercel Hobby (Next.js)

### Key Pages

```
/                       → Landing page + pricing
/sign-in               → Clerk auth
/sign-up               → Clerk auth
/dashboard             → Video job list + usage stats
/dashboard/new         → Create new tour video
  Step 1: Enter listing details (address, photos)
  Step 2: Upload/confirm floorplan
  Step 3: Review AI-suggested tour sequence (drag to reorder)
  Step 4: Choose style (music mood, transition type)
  Step 5: Confirm & generate
/dashboard/jobs/[id]   → Job progress + preview + download
/dashboard/settings    → Account, subscription, billing
/pricing               → Plans comparison
```

### API Routes (Next.js → RackNerd)

The Vercel frontend communicates with the RackNerd worker via a lightweight Express API:

```
RackNerd Express API (port 3001, behind Cloudflare Tunnel or direct IP):

POST   /api/jobs              → Create new video job
GET    /api/jobs/:id          → Get job status + progress
GET    /api/jobs/:id/clips    → Get individual clip statuses
POST   /api/jobs/:id/approve  → Approve clip / request regen
DELETE /api/jobs/:id          → Cancel job
POST   /api/listings          → Create listing + upload to R2
GET    /api/listings          → List user's listings
POST   /api/floorplan/analyze → Analyze floorplan (returns room sequence)
GET    /api/usage             → Get current month usage stats
POST   /api/webhooks/stripe   → Stripe webhook handler
POST   /api/webhooks/kie      → kie.ai completion callback (optional; we poll for Kling/Nano Banana)
POST   /api/webhooks/kie      → kie.ai completion callback
```

**Auth flow:** Clerk JWT → verify on RackNerd Express middleware → extract user_id → authorize.

### Vercel Hobby Limits & When You'll Hit Them

| Resource             | Free Limit          | Estimated Usage (50 users)                                  | When to Upgrade                                                  |
| -------------------- | ------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| Bandwidth            | 100 GB/mo           | ~5–10 GB (dashboard is lightweight, videos served from R2) | Won't hit for a long time — videos come from R2 CDN, not Vercel |
| Serverless Functions | 150K invocations/mo | ~30K (dashboard loads, API proxies)                         | ~250 active users                                                |
| Build minutes        | 6,000/mo            | ~200 (a few deploys per week)                               | Never an issue                                                   |
| Edge Functions       | 500K/mo             | Minimal                                                     | Never an issue                                                   |

**Key insight:** Because all video delivery happens through Cloudflare R2 CDN (not Vercel), the bandwidth stays extremely low. Vercel only serves the Next.js dashboard UI. You can likely stay on Hobby through beta and early revenue.

**Upgrade trigger:** When you need team collaboration features or exceed 150K function invocations (~250+ active users). Budget: $20/mo.

---

## Cloudflare R2 — Storage & Delivery

### Free Tier Limits

| Resource                    | Free Allocation                         |
| --------------------------- | --------------------------------------- |
| Storage                     | 10 GB                                   |
| Class A operations (writes) | 1 million/mo                            |
| Class B operations (reads)  | 10 million/mo                           |
| Egress bandwidth            | **Unlimited (zero cost forever)** |

### Capacity Math

Average final video (all variants): ~100MB per listing

* Master (1080p 16:9): ~50MB
* Vertical (9:16): ~25MB
* Square (1:1): ~15MB
* Portrait (4:5): ~8MB
* Thumbnail: ~200KB

**10GB free = ~100 listings stored**

Once you exceed 10GB: $0.015/GB/month. So 50GB of videos = $0.60/month. R2 is essentially free at any reasonable scale.

### R2 Bucket Structure

```
tour-videos/
  {user_id}/
    {job_id}/
      master.mp4
      vertical.mp4
      square.mp4
      portrait.mp4
      thumb.jpg
      clips/             ← Optional: keep individual clips for regen
        clip_01.mp4
        clip_02.mp4
        ...
```

### Custom Domain Setup

Connect R2 to your domain via Cloudflare:

1. Add a CNAME record: `videos.yourdomain.com` → R2 bucket
2. Enable public access on the bucket
3. Videos served via: `https://videos.yourdomain.com/{user_id}/{job_id}/master.mp4`
4. Cloudflare CDN caches globally — zero egress cost

---

## Cost Model — Per Video Breakdown

### Scenario: 10-clip property tour, 50 seconds total

| Component                       | Kling 3.0 (Kie.ai) |
| ------------------------------- | ------------------ |
| Floorplan analysis (OpenRouter) | $0.03              |
| Prompt generation (OpenRouter)  | $0.03              |
| 10 clips generation             | ~$8–12             |
| 3 retries (~30% failure rate)   | ~$2–4              |
| Nano Banana (realtor images)    | ~$0.50–2           |
| Music (Suno via kie.ai)          | $0.20              |
| FFmpeg processing               | $0.00              |
| R2 storage + delivery           | $0.01              |
| **Total COGS per video**        | **~$11–20**        |

### Infrastructure Fixed Costs

| Service                       | Monthly Cost            |
| ----------------------------- | ----------------------- |
| RackNerd VPS                  | Already paid (existing) |
| Vercel Hobby                  | $0                      |
| Cloudflare R2 (under 10GB)    | $0                      |
| Clerk Auth (under 10K MAUs)   | $0                      |
| Domain (Cloudflare)           | ~$10/year               |
| **Total fixed monthly** | **~$0**           |

### Recommended Pricing Tiers

| Tier                            | Price                                    | Videos/mo | COGS (Kling default) | Gross Margin |
| ------------------------------- | ---------------------------------------- | --------- | -------------------- | ------------ |
| Pay-per-video                   | $29     | 1         | $11.19             | 61%       |                      |              |
| Starter                         | $49/mo  | 5         | $55.95             | -14% ⚠️ |                      |              |
| Starter (adjusted)              | $79/mo  | 5         | $55.95             | 29%       |                      |              |
| Professional                    | $149/mo | 15        | $167.85            | -13% ⚠️ |                      |              |
| Professional                    | $149/mo | 15        | ~$165–300          | varies    |
| Team / Brokerage                | $299/mo | 50        | ~$550–1000         | varies    |

**Margin strategy:** Kling 3.0 (Kie.ai) + Nano Banana Pro. No Veo. No FAL.

---

## Security & Auth

### Clerk + RackNerd API Authentication

```javascript
// RackNerd Express middleware — verify Clerk JWT
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const payload = await clerk.verifyToken(token);
    req.userId = payload.sub;
  
    // Get or create user in Postgres
    req.user = await getOrCreateUser(payload.sub, payload);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

### Cloudflare Tunnel (Secure RackNerd Access)

Instead of exposing RackNerd's IP directly, use Cloudflare Tunnel:

```bash
# On RackNerd
cloudflared tunnel create tour-api
cloudflared tunnel route dns tour-api api.yourdomain.com

# config.yml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
```

This gives you HTTPS, DDoS protection, and hides your VPS IP — all free on Cloudflare.

---

## What's Missing — 12 Critical Gaps to Address

### Must-Have for MVP

1. **Quality control / approval workflow** — Agents must preview and approve individual clips before final assembly. Add a "Review & Approve" step where they see each clip thumbnail, play it, and either approve or click "Regenerate" for any clip that looks bad.
2. **No-floorplan fallback** — Many listings don't have floorplans. Build a manual room sequencer: a simple drag-and-drop UI where agents type room names and order them. This bypasses the floorplan analysis entirely.
3. **Exterior/backyard/garage handling** — Floorplans don't show outdoor spaces. Add a checkbox list: "Include exterior approach? Backyard? Garage? Pool?" and generate those clips from listing photos separately.
4. **Processing time UX** — At 5–20 minutes per tour, the dashboard must be fully async. Show a progress bar (updated via polling every 5s), send email notification on completion, and optionally browser push notifications.
5. **End-frame generation** — The concept assumes you have an image for each room's entrance. In reality, you'll need to generate these intermediate frames. Options: (a) use the last frame extracted from the previous clip via FFmpeg, (b) use an image generation model to create the "entrance to next room" image from the floorplan + listing description, or (c) only specify start frames and let the video model interpolate naturally.
6. **Webhook infrastructure** — kie.ai is async. We poll for completion. Optional webhook for callbacks.

### Important for V1.1

7. **Multi-story homes** — Detect multiple floors in floorplan analysis. Generate a "walking upstairs" transition clip between floors.
8. **Open-concept layouts** — Large open spaces (kitchen → dining → living) should be treated as a single long scene, not three separate clips.
9. **Retry budget caps** — Set a maximum retry count (3) and total cost cap per video. If a clip fails 3 times, skip it and stitch without it rather than burning credits.
10. **Rate limit management** — kie.ai has concurrency limits. Implement exponential backoff and respect 429 responses.

### V2 Features

11. **Realtor-in-video** — Using Kling 3.0 Elements to maintain realtor identity across clips. Requires explicit consent form, California AB 723 disclosure compliance, and 3 reference photos.
12. **MLS integration** — Pull listing data and photos automatically from MLS via Bridge Interactive or SimplyRETS (RESO Web API). Each MLS requires separate licensing.

---

## Documents Needed Before Development

| #  | Document                                      | Purpose                                                                    | Priority |
| -- | --------------------------------------------- | -------------------------------------------------------------------------- | -------- |
| 1  | **Product Requirements Document (PRD)** | User stories, acceptance criteria, MoSCoW features                         | P0       |
| 2  | **Technical Architecture Doc**          | System diagram (use the one above), API contracts, data flow               | P0       |
| 3  | **Database Schema + Migrations**        | The SQL above, plus migration scripts                                      | P0       |
| 4  | **API Integration Specs**               | kie.ai (Kling, Nano Banana, Suno), OpenRouter endpoints, auth, schemas       | P0       |
| 5  | **Video Pipeline Spec**                 | Frame-chain logic, prompt templates, FFmpeg commands, error handling       | P0       |
| 6  | **Wireframes / UI Mockups**             | Dashboard, upload flow, progress view, preview/approve screen              | P0       |
| 7  | **User Flow Diagrams**                  | Signup → upload → generate → approve → download/share                  | P1       |
| 8  | **Cost Model Spreadsheet**              | Per-video COGS by model, break-even analysis, sensitivity to price changes | P1       |
| 9  | **Stripe Integration Spec**             | Subscription tiers, metered billing setup, webhook handling                | P1       |
| 10 | **Legal / Compliance Review**           | AI disclosure (CA AB 723), consent forms, ToS, Privacy Policy              | P1       |
| 11 | **Prompt Engineering Playbook**         | Tested prompt templates for each room type, style variations               | P1       |
| 12 | **Deployment & DevOps Guide**           | PM2 config, GitHub Actions for Vercel + RackNerd, monitoring, backups      | P2       |
| 13 | **Risk Register**                       | Technical, legal, market risks with mitigations                            | P2       |
| 14 | **Go-to-Market Plan**                   | Launch strategy, early access, realtor outreach                            | P2       |
| 15 | **Financial Projections**               | 12-month revenue model, customer acquisition cost, LTV                     | P2       |

---

## MVP Timeline — 12 Weeks

| Week  | Phase                      | Deliverable                                                                         |
| ----- | -------------------------- | ----------------------------------------------------------------------------------- |
| 1–2  | **Foundation**       | Postgres schema, Express API on RackNerd, Clerk auth, project scaffolding           |
| 3–4  | **Pipeline Core**    | kie.ai (Nano Banana + Kling 3) integration, single clip generation working       |
| 5–6  | **Chain Logic**      | Floorplan analysis, prompt generation, full clip chain (10 clips), FFmpeg stitching |
| 7–8  | **Music + Polish**   | Suno integration, music overlay, multi-format export, R2 upload pipeline            |
| 9–10 | **Frontend**         | Next.js dashboard, upload flow, job progress, video preview, download               |
| 11    | **Payments**         | Stripe subscriptions, usage tracking, billing webhook                               |
| 12    | **Testing + Launch** | End-to-end testing, error handling, beta invites, soft launch                       |

---

## Quick-Start Checklist

```
□ Sign up for API keys:
  □ kie.ai account + API key (Kling 3, Nano Banana Pro, Suno)
  □ OpenRouter account + API key
  □ Clerk account (auth)
  □ Stripe account (payments)
  □ Cloudflare account (R2 + DNS + Tunnel)

□ RackNerd setup:
  □ Verify PostgreSQL is running: sudo systemctl status postgresql
  □ Verify Redis is running: sudo systemctl status redis
  □ Verify FFmpeg version: ffmpeg -version
  □ Install Node.js 20 LTS: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  □ Install PM2: npm install -g pm2
  □ Install cloudflared (Cloudflare Tunnel)
  □ Create PostgreSQL database: createdb tourapp
  □ Run schema migrations

□ Cloudflare R2:
  □ Create bucket: tour-videos
  □ Create R2 API token (S3 compat)
  □ Connect custom domain: videos.yourdomain.com

□ Vercel:
  □ Create Next.js project
  □ Connect GitHub repo
  □ Set environment variables (Clerk, API URLs)
  □ Deploy

□ Proof of concept (do this FIRST):
  □ Generate 1 scene image with kie.ai Nano Banana Pro (realtor + room photo)
  □ Generate 1 clip with kie.ai Kling 3.0 (image to video)
  □ Chain 3 clips where end_frame[N] = start_frame[N+1]
  □ Stitch 3 clips with FFmpeg xfade
  □ Add Suno music overlay
  □ Upload to R2 and confirm CDN delivery
  □ ✅ If this works, the product is viable. Build everything else.
```
