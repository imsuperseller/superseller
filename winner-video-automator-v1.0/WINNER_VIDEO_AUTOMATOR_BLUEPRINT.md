# Winner Video Automator v1.0 — Architecture Blueprint

**Product:** Winner Video Automator (Rensto Product ID: `winner-video-studio`)
**Subdomain:** `studio.rensto.com`
**First Customer:** Yossi Laham / קבוצת מבנים (Mivnim Group)
**Status:** Phase 1 — Core Loop

---

## Infrastructure Map (Verified ✅)

| Service | Status | Details |
|---------|--------|---------|
| **Vercel** | ✅ Ready | Team: `team_a1gxSHNFg8Pp7qxoUN69QkVl` — New project needed: `winner-video-studio` |
| **Racknerd** | ✅ Online | `172.245.56.50` · Ubuntu 24.04 · 6GB RAM · 100GB disk |
| **WAHA Pro** | ✅ Working | 3 sessions active. Use `rensto-whatsapp` session (Rensto number: +12144362102) |
| **Cloudflare R2** | ✅ Ready | Account: `46a5b8a6516f86865992dbdfdb3cd77b` · 1 bucket exists |
| **Aitable** | ✅ Ready | Space: `spc4tjiuDMjfY` (Rensto) · Master Registry has product slots |
| **kie.ai** | ✅ Funded | API: Bearer token auth · `api.kie.ai` · All models available |
| **n8n** | ✅ Healthy | `n8n.rensto.com` · Status: OK |
| **Resend** | 🔧 Needs config | API key exists, needs domain verification for `studio.rensto.com` |
| **Stripe** | 🔧 Needs product | Account exists, Winner product/prices not created yet |
| **Postgres** | ✅ On Racknerd | Running (needs schema migration) |
| **Redis** | ✅ On Racknerd | Running (needs namespace for `winner:` keys) |

---

## Phase 1 Scope: Core Loop

**Goal:** Yossi uploads audio → gets branded video on WhatsApp in <15 minutes.

### What's IN Phase 1:
1. Magic link auth (Resend email + WhatsApp OTP fallback via WAHA)
2. Dashboard with video creation form
3. Gemini brain (script rewrite + model routing via kie.ai gemini-3-pro)
4. Audio isolation (conditional, via kie.ai elevenlabs/audio-isolation)
5. Video generation (kie.ai — model selected by Gemini brain)
6. R2 storage for final videos
7. WhatsApp delivery via WAHA `rensto-whatsapp` session
8. Gallery of completed videos
9. Basic credit system (hardcoded starter credits, no Stripe yet)

### What's DEFERRED to Phase 2:
- Suno music generation + selection UI
- FFmpeg post-processing (logo overlay, subtitle burn-in, audio mixing, upscaling)
- Stripe billing / credit purchase
- ROI dashboard
- Admin alerts
- Multi-tenant generalization

### What's DEFERRED to Phase 3:
- Tenant system for rensto.com products
- Per-tenant branding (logos, colors, tone presets)
- Self-serve onboarding
- Aitable-driven model registry admin UI

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   studio.rensto.com                       │
│                  (Vercel · Next.js 15)                    │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Auth    │  │  Create   │  │  Gallery  │  │ Settings │ │
│  │  Magic   │  │  Video    │  │  View +   │  │  Profile │ │
│  │  Link    │  │  Form     │  │  Download │  │  Credits │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                           │
│  API Routes: /api/auth/* /api/generate /api/callbacks/*   │
└───────────────────────┬─────────────────────────────────┘
                        │
          ┌─────────────┼─────────────────┐
          │             │                 │
          ▼             ▼                 ▼
   ┌──────────┐  ┌──────────┐     ┌──────────┐
   │  kie.ai  │  │Cloudflare│     │ Racknerd │
   │          │  │    R2    │     │172.245.56│
   │ Gemini   │  │          │     │   .50    │
   │ Brain    │  │  Videos  │     │          │
   │ ────────>│  │  Logos   │     │ Postgres │
   │ Audio    │  │  Assets  │     │ Redis    │
   │ Isolate  │  │          │     │ WAHA Pro │
   │ ────────>│  │          │     │ (FFmpeg) │
   │ Video    │  │          │     │          │
   │ Generate │  │          │     │          │
   └──────┬───┘  └──────────┘     └────┬─────┘
          │                             │
          │    callBackUrl POST         │
          └─────────────────────────────┘
                        │
                        ▼
              WhatsApp Delivery
              (WAHA rensto-whatsapp)
```

---

## Data Schema

### Postgres Tables (Racknerd)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  name TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'mivnim', -- future multi-tenant
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  whatsapp_jid TEXT, -- e.g. "972501234567@c.us"
  auth_method TEXT CHECK (auth_method IN ('email', 'whatsapp')),
  magic_token TEXT,
  magic_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Generations table (core state machine)
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id TEXT NOT NULL DEFAULT 'mivnim',
  
  -- Input
  input_audio_url TEXT,
  input_script TEXT,
  character TEXT,
  vibe TEXT,
  language TEXT DEFAULT 'he',
  
  -- Gemini Brain Output
  rewritten_script TEXT,
  video_prompt TEXT,
  routed_model TEXT,
  music_prompt TEXT,
  audio_quality_score INTEGER,
  needs_isolation BOOLEAN DEFAULT FALSE,
  gemini_raw_json JSONB,
  
  -- Pipeline State
  stage TEXT NOT NULL DEFAULT 'PENDING' CHECK (stage IN (
    'PENDING',
    'SCRIPT_PROCESSING',
    'AUDIO_ISOLATING',
    'VIDEO_GENERATING',
    'MUSIC_GENERATING',
    'AWAITING_MUSIC_SELECT',
    'POST_PROCESSING',
    'DELIVERING',
    'COMPLETE',
    'FAILED'
  )),
  
  -- Task IDs (kie.ai)
  gemini_task_id TEXT,
  isolation_task_id TEXT,
  video_task_id TEXT,
  music_task_id TEXT,
  
  -- Results
  isolated_audio_url TEXT,
  raw_video_url TEXT,
  final_video_url TEXT, -- R2 URL after post-processing
  music_urls JSONB, -- array of 3 Suno options
  selected_music_url TEXT,
  
  -- Delivery
  whatsapp_delivered BOOLEAN DEFAULT FALSE,
  whatsapp_message_id TEXT,
  
  -- Metadata
  credits_charged INTEGER DEFAULT 1,
  error_message TEXT,
  error_stage TEXT,
  duration_seconds INTEGER, -- final video duration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Audit log for debugging
CREATE TABLE generation_events (
  id SERIAL PRIMARY KEY,
  generation_id UUID NOT NULL REFERENCES generations(id),
  stage TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'stage_enter', 'callback_received', 'error', 'retry'
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table for auth
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generations_user ON generations(user_id);
CREATE INDEX idx_generations_stage ON generations(stage);
CREATE INDEX idx_generations_tenant ON generations(tenant_id);
CREATE INDEX idx_events_generation ON generation_events(generation_id);
CREATE INDEX idx_sessions_token ON sessions(token);
```

### Redis Keys (Racknerd)

```
winner:task:{kieTaskId}         → JSON { generationId, stage, model, retries }
winner:session:{sessionToken}   → JSON { userId, expiresAt }
winner:rate:{userId}            → Counter (TTL 3600) — max 5 videos/hour
winner:callback:pending         → Sorted set of taskIds by creation time
```

### Aitable Tables (to create)

**1. `Winner Model Registry`** — Which AI models to use and when
| Field | Type | Purpose |
|-------|------|---------|
| model_id | Text | e.g. `kling/ai-avatar-standard` |
| display_name | Text | Human label |
| provider | Text | `kie.ai` |
| model_type | SingleSelect | `video`, `audio`, `music`, `text` |
| use_case | Text | When Gemini should route to this model |
| accepts_audio | Checkbox | Can receive audio input? |
| accepts_image | Checkbox | Can receive image input? |
| max_duration_sec | Number | Max output seconds |
| avg_cost_credits | Number | Typical credit cost |
| status | SingleSelect | `active`, `testing`, `disabled` |
| default_params | Text | JSON string of default kie.ai params |
| notes | Text | Implementation notes |

**2. `Winner Script Library`** — Example scripts for Gemini training
| Field | Type | Purpose |
|-------|------|---------|
| title | Text | Script name |
| tenant_id | Text | `mivnim` or `*` for universal |
| character | SingleSelect | CEO, Agent, Architect, Client, Trump, Asher, Nehorai |
| vibe | SingleSelect | Winner, Luxury, Urgent, Family |
| language | SingleSelect | `he`, `en`, `ar`, `mixed` |
| original_script | Text | Input before rewrite |
| rewritten_script | Text | "Poscas Winner" version |
| video_prompt | Text | What Gemini generated as visual description |
| notes | Text | What worked, what didn't |

**3. `Winner Brand Assets`** — Per-tenant branding
| Field | Type | Purpose |
|-------|------|---------|
| tenant_id | Text | `mivnim` |
| asset_type | SingleSelect | `logo_white`, `logo_color`, `headshot`, `font`, `watermark` |
| asset_url | Text | R2 URL |
| position | Text | e.g. `top-right` |
| size_px | Text | e.g. `120x40` |
| notes | Text | Yossi wants white logo, top-right |

**4. `Winner Tone Presets`** — Gemini system prompt fragments per tenant
| Field | Type | Purpose |
|-------|------|---------|
| tenant_id | Text | `mivnim` |
| preset_name | Text | e.g. `poscas_winner_default` |
| system_prompt_fragment | Text | The tone/voice instructions for Gemini |
| example_rewrites | Text | Before/after pairs |
| active | Checkbox | Currently in use? |

---

## API Routes (Next.js App Router)

```
/api/auth/magic-link     POST  — Send magic link email via Resend
/api/auth/verify          GET   — Verify magic link token, create session
/api/auth/whatsapp-otp    POST  — Send OTP via WAHA (fallback)
/api/auth/verify-otp      POST  — Verify WhatsApp OTP
/api/auth/me              GET   — Get current user from session cookie

/api/generate             POST  — Start video generation pipeline
/api/generations          GET   — List user's generations (gallery)
/api/generations/[id]     GET   — Get single generation status

/api/callbacks/kie        POST  — kie.ai callback receiver (all models)

/api/cron/check-stuck     GET   — Vercel Cron: poll stuck tasks (every 60s)

/api/health               GET   — Health check
```

---

## Pipeline Flow (Phase 1)

### Stage 1: User Input → `POST /api/generate`

**Request body:**
```json
{
  "audioUrl": "https://...", // uploaded audio file URL
  "script": "optional manual script override",
  "character": "ceo",       // from constants
  "vibe": "winner",         // from constants
  "language": "he"          // he, en, ar, mixed
}
```

**Server actions:**
1. Validate session + check credits
2. Create `generations` row with stage `PENDING`
3. Upload audio to R2 if raw file
4. Move to Stage 2

### Stage 2: Gemini Brain → kie.ai gemini-3-pro

**Call:** `POST https://api.kie.ai/gemini-3-pro/v1/chat/completions`

**System prompt (non-streaming, JSON mode):**
```
You are the "Poscas Winner" creative director for {tenant_name}.
Your job: take raw audio/script and transform it into a viral video brief.

VOICE: High energy, Israeli real estate mogul, "winners" mentality.
{tone_preset_from_aitable}

RULES:
- Rewrite the script in Poscas Winner tone (keep meaning, amp energy)
- Generate a video prompt (max 500 chars): describe the VISUAL scene only
  (camera angles, movements, setting, character actions — NO dialogue)
- Select the best model from the registry: {model_registry_json}
- Generate a music prompt for Suno (genre, tempo, mood, instruments)
- Assess audio quality 1-10, flag if isolation needed (score < 7)
- If character is Trump: speaks proper English
- If character is Asher/Nehorai: broken English/Hebrew
- Trump catchphrase: "well we'll see what happens"
- Subtitles for broken English should be literal transliteration

Return JSON:
{
  "rewritten_script": "...",
  "video_prompt": "...", // max 500 chars, visual only
  "routed_model": "kling/ai-avatar-standard", // from registry
  "music_prompt": "...",
  "audio_quality_score": 8,
  "needs_isolation": false,
  "subtitle_text": "...", // with timestamps if possible
  "routing_reasoning": "..." // why this model
}
```

**On success:**
- Store Gemini output in `generations` row
- If `needs_isolation` → Stage 3
- Else → Stage 4

### Stage 3: Audio Isolation (Conditional)

**Call:** `POST https://api.kie.ai/api/v1/jobs/createTask`
```json
{
  "model": "elevenlabs/audio-isolation",
  "input": { "audio": "{audio_url}" },
  "callBackUrl": "https://studio.rensto.com/api/callbacks/kie"
}
```

**On callback success:** Update `isolated_audio_url`, move to Stage 4.

### Stage 4: Video Generation

**Call:** `POST https://api.kie.ai/api/v1/jobs/createTask`
```json
{
  "model": "{routed_model}",
  "input": {
    "prompt": "{video_prompt}",
    "audio": "{isolated_audio_url || input_audio_url}",
    // ... model-specific params from registry
  },
  "callBackUrl": "https://studio.rensto.com/api/callbacks/kie"
}
```

**On callback success:**
- Download video from result URL
- Upload to R2: `winner/{tenant_id}/{generation_id}/raw.mp4`
- Update `raw_video_url`
- Phase 1: Skip post-processing, set `final_video_url = raw_video_url`
- Move to Stage 7

### Stage 7: WhatsApp Delivery

**Call:** WAHA API
```
POST http://172.245.56.50:3000/api/sendFile
Headers: { "X-Api-Key": "4fc7e008d7d24fc995475029effc8fa8" }
Body: {
  "session": "rensto-whatsapp",
  "chatId": "{user.whatsapp_jid}",
  "file": { "url": "{final_video_url}" },
  "caption": "🎬 סרטון חדש מוכן! #{generation_id_short}"
}
```

**On success:** Mark `whatsapp_delivered = true`, stage `COMPLETE`.

---

## Callback Handler Design

`POST /api/callbacks/kie` receives all kie.ai completions.

```typescript
// Pseudocode
export async function POST(req: Request) {
  const body = await req.json();
  const { taskId, state, resultJson, failMsg } = body.data;
  
  // Look up which generation this belongs to
  const taskInfo = await redis.get(`winner:task:${taskId}`);
  if (!taskInfo) return Response.json({ error: 'unknown task' }, { status: 404 });
  
  const { generationId, stage } = JSON.parse(taskInfo);
  
  if (state === 'fail') {
    await markFailed(generationId, stage, failMsg);
    return Response.json({ ok: true });
  }
  
  if (state === 'success') {
    const result = JSON.parse(resultJson);
    
    switch (stage) {
      case 'AUDIO_ISOLATING':
        await handleIsolationComplete(generationId, result);
        break;
      case 'VIDEO_GENERATING':
        await handleVideoComplete(generationId, result);
        break;
      // ... etc
    }
  }
  
  return Response.json({ ok: true });
}
```

---

## File Structure (Next.js App Router)

```
winner-video-studio/
├── app/
│   ├── layout.tsx              # Root layout (RTL, fonts, theme)
│   ├── page.tsx                # Landing / redirect to dashboard
│   ├── login/
│   │   └── page.tsx            # Magic link + WhatsApp OTP form
│   ├── verify/
│   │   └── page.tsx            # Magic link verification handler
│   ├── dashboard/
│   │   ├── layout.tsx          # Auth-guarded layout
│   │   ├── page.tsx            # Main dashboard — create video
│   │   └── gallery/
│   │       └── page.tsx        # Video gallery
│   └── api/
│       ├── auth/
│       │   ├── magic-link/route.ts
│       │   ├── verify/route.ts
│       │   ├── whatsapp-otp/route.ts
│       │   ├── verify-otp/route.ts
│       │   └── me/route.ts
│       ├── generate/route.ts   # Start pipeline
│       ├── generations/
│       │   └── route.ts        # List generations
│       │   └── [id]/route.ts   # Get single generation
│       ├── callbacks/
│       │   └── kie/route.ts    # kie.ai callback handler
│       ├── upload/route.ts     # Audio file upload → R2
│       ├── cron/
│       │   └── check-stuck/route.ts
│       └── health/route.ts
├── components/
│   ├── VideoForm.tsx           # Create video form
│   ├── GenerationCard.tsx      # Status card for a generation
│   ├── Gallery.tsx             # Grid of completed videos
│   ├── AuthGuard.tsx           # Session check wrapper
│   ├── CreditsBadge.tsx        # Credits remaining display
│   └── StatusPipeline.tsx      # Visual stage indicator
├── lib/
│   ├── db.ts                   # Postgres client (pg)
│   ├── redis.ts                # Redis client (ioredis)
│   ├── r2.ts                   # Cloudflare R2 (S3-compatible)
│   ├── kie.ts                  # kie.ai API wrapper
│   ├── waha.ts                 # WAHA API wrapper
│   ├── resend.ts               # Resend email client
│   ├── aitable.ts              # Aitable API wrapper
│   ├── auth.ts                 # Auth utilities
│   ├── pipeline.ts             # Pipeline orchestration logic
│   └── constants.ts            # Characters, vibes, branding
├── public/
│   └── logos/                  # Mivnim white logo, LOFTI logo
├── .env.local                  # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── vercel.json
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:{password}@172.245.56.50:5432/winner

# Redis
REDIS_URL=redis://172.245.56.50:6379

# kie.ai
KIE_API_KEY=cb711f74a221be35a20df8e26e722e04

# Cloudflare R2
R2_ACCOUNT_ID=46a5b8a6516f86865992dbdfdb3cd77b
R2_ACCESS_KEY_ID={from cloudflare}
R2_SECRET_ACCESS_KEY={from cloudflare}
R2_BUCKET_NAME=winner-video-studio
R2_PUBLIC_URL=https://{custom-domain-or-r2-dev-url}

# WAHA
WAHA_API_URL=http://172.245.56.50:3000
WAHA_API_KEY=4fc7e008d7d24fc995475029effc8fa8
WAHA_SESSION=rensto-whatsapp

# Auth
RESEND_API_KEY={resend_key}
AUTH_SECRET={random_secret_for_jwt}
APP_URL=https://studio.rensto.com

# Aitable
AITABLE_API_KEY=uskBpO7SVJC8RMDSSOSs7tM
AITABLE_SPACE_ID=spc4tjiuDMjfY

# Stripe (Phase 2)
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

---

## WAHA Session Decision

**Use existing `rensto-whatsapp` session** (Rensto number: +12144362102)

This session is already `WORKING` and authenticated. For video delivery, we just need to:
1. Configure an additional webhook on this session pointing to our callback
2. Send videos via the existing session

**Webhook to add:** `https://studio.rensto.com/api/webhooks/waha`
**Session name:** `rensto-whatsapp`

However, current webhook goes to n8n. We have two options:
- **Option A:** Add a second webhook URL to the session config (WAHA supports array of webhooks)
- **Option B:** For Phase 1, we only SEND via WAHA (no incoming webhook needed — we don't need to receive messages yet). The WhatsApp delivery is fire-and-forget POST.

**Recommendation:** Option B for Phase 1. We just call WAHA's send API. No webhook config changes needed.

---

## Aitable Tables to Create

Will create in space `spc4tjiuDMjfY` (Rensto):

1. **Winner Model Registry** — Pre-populated with 4 models
2. **Winner Script Library** — Seeded with podcast brief + content wishes
3. **Winner Brand Assets** — Mivnim logos, LOFTI reference
4. **Winner Tone Presets** — Poscas Winner default prompt

Also: Add `winner-video-studio` to **Rensto Master Registry** (`dstwsqbXSmK5wYMmeQ`).

---

## R2 Bucket Structure

**Bucket:** `winner-video-studio`

```
winner-video-studio/
├── {tenant_id}/
│   ├── {generation_id}/
│   │   ├── input-audio.mp3      # Original upload
│   │   ├── isolated-audio.mp3   # After ElevenLabs isolation
│   │   ├── raw-video.mp4        # Direct from AI model
│   │   ├── final-video.mp4      # After FFmpeg (Phase 2)
│   │   └── metadata.json        # Generation params snapshot
│   ├── brand/
│   │   ├── logo-white.png       # Mivnim white logo
│   │   ├── logo-color.png       # Mivnim color logo
│   │   └── headshots/           # Character headshots
│   └── gallery/                 # Thumbnails for gallery UI
```

---

## Phase 1 Task Plan

### Sprint 1: Foundation (Days 1-2)
- [ ] Create Vercel project `winner-video-studio`
- [ ] Point `studio.rensto.com` subdomain
- [ ] Create R2 bucket `winner-video-studio`
- [ ] Run Postgres schema migration on Racknerd
- [ ] Create Aitable tables + seed data
- [ ] Register in Rensto Master Registry
- [ ] Set up Next.js project with base layout (RTL, dark theme, brand colors)
- [ ] Implement lib/ clients (db, redis, r2, kie, waha, resend, aitable)

### Sprint 2: Auth + Dashboard (Days 3-4)
- [ ] Magic link auth flow (Resend)
- [ ] WhatsApp OTP auth flow (WAHA)
- [ ] Session management (cookie + Redis)
- [ ] Dashboard page with video creation form
- [ ] Audio file upload to R2
- [ ] Credits badge display

### Sprint 3: Pipeline (Days 5-7)
- [ ] POST /api/generate — create generation + trigger Gemini
- [ ] Gemini brain integration (kie.ai gemini-3-pro with structured output)
- [ ] Audio isolation integration (conditional)
- [ ] Video generation integration (model routing)
- [ ] Callback handler for all kie.ai tasks
- [ ] Redis task tracking
- [ ] State machine transitions
- [ ] Cron job for stuck task recovery

### Sprint 4: Delivery + Gallery (Days 8-9)
- [ ] R2 upload after video generation
- [ ] WhatsApp delivery via WAHA
- [ ] Gallery page with video grid
- [ ] Generation detail page with status pipeline
- [ ] Real-time status polling on dashboard
- [ ] Error handling + retry logic

### Sprint 5: Polish + Testing (Day 10)
- [ ] End-to-end test with real audio
- [ ] Error state UI
- [ ] Loading states and animations
- [ ] Mobile responsive (Yossi uses phone)
- [ ] Hebrew RTL final pass

---

## Key Decisions Made

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Hosting | Vercel (Next.js) | Matches existing Rensto stack |
| Auth primary | Resend magic link | Email is universal, Yossi has email |
| Auth fallback | WhatsApp OTP via WAHA | Israeli users prefer WhatsApp |
| WAHA session | `rensto-whatsapp` | Already working, Rensto-branded |
| Video delivery | WAHA send API (no webhook needed) | Phase 1 simplicity |
| Gemini integration | kie.ai proxy (not direct Google API) | Consistent with all other models |
| Task tracking | Redis (fast) + Postgres (durable) | Redis for real-time, PG for audit |
| File storage | Cloudflare R2 | Already in stack, S3-compatible |
| Configuration | Aitable (not hardcoded) | Editable without deploy |
| Multi-tenant | tenant_id column from day 1 | Cheap to add now, expensive later |
