# Doc 9: Task Plan — Phase 1 Sprint Breakdown

> **Purpose:** Ordered task list with acceptance criteria, dependencies, and estimated effort. Claude Code executes tasks sequentially, checking off each before moving to the next.
> **Scope:** Phase 1 only — core pipeline without Suno music, FFmpeg post-processing, or Stripe billing.

---

## Phase 1 Deliverable

A working web app where Yossi can:
1. Log in via WhatsApp OTP
2. Upload audio + optional headshot
3. Pick character, vibe, language
4. Click generate → Gemini processes → kie.ai generates video → R2 stores it
5. Get the video on WhatsApp + view it in the gallery
6. All within ~5-8 minutes, costing 1 credit

---

## Sprint Overview

| Sprint | Focus | Tasks | Est. Lines |
|--------|-------|-------|-----------|
| S1 | Foundation | Project scaffold, DB, env, auth | ~1,200 |
| S2 | Pipeline Core | Upload, Gemini, kie.ai, callbacks | ~1,400 |
| S3 | Frontend | Login, dashboard, form, tracker, gallery | ~1,500 |
| S4 | Delivery & Polish | WhatsApp, cron, health, testing | ~600 |
| **Total** | | **~28 tasks** | **~4,700 lines** |

---

## Sprint 1: Foundation

### Task 1.1 — Project Scaffold

**Reference:** Doc 1 (PROJECT_SETUP.md)

**Action:**
- `npx create-next-app@latest winner-video-studio --typescript --tailwind --app --src-dir`
- Configure `next.config.ts` (output, images, CORS headers for callbacks)
- Configure `tailwind.config.ts` (brand colors, Heebo/Rubik fonts, RTL)
- Create root `src/app/layout.tsx` with RTL, fonts, dark theme
- Create `src/app/page.tsx` — redirect to `/dashboard`

**Acceptance:**
- [ ] `npm run dev` starts without errors
- [ ] Page renders RTL with dark background
- [ ] Hebrew text renders in Heebo font
- [ ] Tailwind classes work with brand colors (`bg-[#3A388E]`, `text-[#B6E3D4]`)

**Dependencies:** None

---

### Task 1.2 — Environment & Config

**Reference:** Doc 3 (ENV_TEMPLATE.md)

**Action:**
- Create `src/lib/env.ts` — validated env singleton with typed accessors
- Create `src/env.d.ts` — ProcessEnv interface
- Create `.env.local` from template (all real values from Doc 3)
- Create `.env.example` with placeholder values (no secrets)

**Acceptance:**
- [ ] `env.kie.apiKey` returns the real API key
- [ ] `env.r2.bucketName` returns `winner-video-studio`
- [ ] Missing required var throws clear error on startup
- [ ] `.env.example` has no real secrets

**Dependencies:** 1.1

---

### Task 1.3 — Database Setup

**Reference:** Doc 2 (DATABASE_SCHEMA.md)

**Action:**
- Create `src/lib/db.ts` — Postgres pool with query helpers
- Create `scripts/migrate.sql` — all 9 tables
- Create `scripts/migrate.mjs` — migration runner
- Create `scripts/seed.mjs` — seed Yossi + Shai users
- Create `scripts/rollback.sql` — clean teardown
- Run migration against Vercel Postgres (or Racknerd if configured)

**Acceptance:**
- [ ] `node scripts/migrate.mjs` creates all 9 tables without errors
- [ ] `node scripts/seed.mjs` creates 2 users with credits
- [ ] `db.query('SELECT * FROM users')` returns seeded users
- [ ] `db.queryRow(...)` returns typed result
- [ ] `db.transaction(...)` commits or rolls back correctly

**Dependencies:** 1.2

---

### Task 1.4 — Redis Setup

**Reference:** Doc 2 (DATABASE_SCHEMA.md — Redis section), Doc 7 (redis.ts)

**Action:**
- Create `src/lib/redis.ts` — dual-backend client (Upstash REST / ioredis)
- Test with Vercel KV or Racknerd Redis

**Acceptance:**
- [ ] `redis.setJson('test', { foo: 'bar' }, 60)` succeeds
- [ ] `redis.getJson('test')` returns `{ foo: 'bar' }`
- [ ] `redis.incr('counter', 300)` returns incrementing values
- [ ] `redis.del('test')` removes the key

**Dependencies:** 1.2

---

### Task 1.5 — R2 Storage Client

**Reference:** Doc 7 (r2.ts)

**Action:**
- Create `src/lib/r2.ts` — S3-compatible client for Cloudflare R2
- Install `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

**Acceptance:**
- [ ] `uploadFile('test/hello.txt', Buffer.from('hello'), 'text/plain')` succeeds
- [ ] `getPublicUrl('test/hello.txt')` returns accessible URL
- [ ] `fileExists('test/hello.txt')` returns true
- [ ] `deleteFile('test/hello.txt')` removes the file

**Dependencies:** 1.2

---

### Task 1.6 — Auth Module

**Reference:** Doc 7 (auth.ts, resend.ts, waha.ts)

**Action:**
- Create `src/lib/auth.ts` — session management, token/OTP generation
- Create `src/lib/waha.ts` — WhatsApp API client
- Create `src/lib/resend.ts` — email client
- Create auth API routes:
  - `src/app/api/auth/whatsapp-otp/route.ts`
  - `src/app/api/auth/verify-otp/route.ts`
  - `src/app/api/auth/magic-link/route.ts`
  - `src/app/api/auth/verify/route.ts`
  - `src/app/api/auth/me/route.ts`

**Acceptance:**
- [ ] `POST /api/auth/whatsapp-otp` with Yossi's phone sends OTP via WAHA
- [ ] `POST /api/auth/verify-otp` with correct code sets session cookie
- [ ] `GET /api/auth/me` with valid cookie returns user info + credits
- [ ] `GET /api/auth/me` without cookie returns 401
- [ ] Magic link flow: send email → click link → session created → redirect
- [ ] Rate limit: 4th OTP request within 15 min returns 429

**Dependencies:** 1.3, 1.4

---

### Task 1.7 — Middleware & Auth Guard

**Reference:** Doc 1 (middleware section)

**Action:**
- Create `src/middleware.ts` — protect `/dashboard/*` routes
- Redirect unauthenticated users to `/login`
- Redirect authenticated users from `/login` to `/dashboard`

**Acceptance:**
- [ ] Visiting `/dashboard` without session → redirects to `/login`
- [ ] Visiting `/login` with valid session → redirects to `/dashboard`
- [ ] `/api/*` routes are NOT affected by middleware (they handle auth internally)
- [ ] `/api/callbacks/*` routes are always accessible (no auth)

**Dependencies:** 1.6

---

## Sprint 2: Pipeline Core

### Task 2.1 — kie.ai Client

**Reference:** Doc 7 (kie.ts)

**Action:**
- Create `src/lib/kie.ts` — createTask, getTaskStatus, callGemini
- Create `KieApiError` custom error class

**Acceptance:**
- [ ] `kie.getTaskStatus('nonexistent')` throws `KieApiError` with status 404
- [ ] `kie.createTask(...)` returns `{ code: 200, data: { taskId } }`
- [ ] `KieApiError.isRetryable` returns true for 500, false for 400

**Dependencies:** 1.2

---

### Task 2.2 — Aitable Client

**Reference:** Doc 7 (aitable.ts)

**Action:**
- Create `src/lib/aitable.ts` — read model registry, script examples, tone presets
- Implement 5-minute cache

**Acceptance:**
- [ ] `getActiveModels()` returns 3 models from Aitable
- [ ] `getScriptExamples('mivnim')` returns training examples
- [ ] `getActiveTonePreset('mivnim')` returns the Poscas Winner preset
- [ ] Second call within 5 min hits cache (no HTTP request)

**Dependencies:** 1.2

---

### Task 2.3 — Gemini Brain Module

**Reference:** Doc 4 (GEMINI_BRAIN_PROMPT.md), Doc 7 (gemini.ts)

**Action:**
- Create `src/lib/gemini.ts` — prompt builder + caller + sanitizer
- Create `src/lib/gemini-constants.ts` — SYSTEM_PROMPT_TEMPLATE, RESPONSE_SCHEMA, GEMINI_DEFAULTS
- Implement all sanitization rules (model validation, duration checks, prompt truncation)

**Acceptance:**
- [ ] `callGeminiBrain({ rawScript: 'test', character: 'ceo', vibe: 'winner', language: 'he', userTier: 'starter' })` returns valid `GeminiBrainOutput`
- [ ] Output contains all required fields (processed_script, video_prompt, recommended_model, etc.)
- [ ] If Gemini returns invalid model → sanitizer overrides to `kling/ai-avatar-pro`
- [ ] If Gemini call fails → returns GEMINI_DEFAULTS with raw script
- [ ] Audio URL > 15s + infinitalk → overrides to `kling/ai-avatar-pro`

**Dependencies:** 2.1, 2.2

---

### Task 2.4 — Credits Module

**Reference:** Doc 7 (credits.ts)

**Action:**
- Create `src/lib/credits.ts` — checkCredits, consumeCredit, refundCredit

**Acceptance:**
- [ ] `checkCredits(yossiId)` returns `{ available: 10, total: 10, ... }`
- [ ] `consumeCredit(yossiId, genId)` decrements to 9, logs transaction
- [ ] Second consume decrements to 8
- [ ] Consuming with 0 credits throws `InsufficientCreditsError`
- [ ] `refundCredit(genId)` restores credit + logs refund transaction
- [ ] Redis credit cache is invalidated after consume/refund

**Dependencies:** 1.3, 1.4

---

### Task 2.5 — Upload Route

**Reference:** Doc 5 (Route 6), Doc 7 (upload.ts)

**Action:**
- Create `src/lib/upload.ts` — validation + R2 upload helpers
- Create `src/app/api/upload/route.ts` — multipart file upload endpoint

**Acceptance:**
- [ ] Upload a 1MB mp3 → returns R2 URL
- [ ] Upload a 500KB jpg → returns R2 URL
- [ ] Upload a 15MB file → returns 413 error
- [ ] Upload an exe file → returns 400 error
- [ ] Uploaded file is accessible at the returned URL
- [ ] Route requires authentication (401 without session)

**Dependencies:** 1.5, 1.6

---

### Task 2.6 — Generate Route (Main Pipeline Entry)

**Reference:** Doc 5 (Route 7), Doc 6 (Pipeline State Machine)

**Action:**
- Create `src/lib/pipeline.ts` — transitionStage, fireIsolationTask, fireVideoTask
- Create `src/app/api/generate/route.ts` — main generation endpoint
- Implement: auth → rate limit → credit check → create generation → Gemini call → fire async task

**Acceptance:**
- [ ] `POST /api/generate` with audio URL + character + vibe + language → returns 201 with generation ID
- [ ] Generation row created in Postgres with stage = `SCRIPT_PROCESSING` then advancing
- [ ] Gemini brain called and output stored in generation row
- [ ] kie.ai task fired (isolation or video depending on needs_isolation)
- [ ] Redis task tracking key created
- [ ] Credit consumed and logged
- [ ] Rate limit counters incremented
- [ ] Without audio or script → 400 error
- [ ] Without credits → 402 error
- [ ] 6th generation within an hour → 429 error

**Dependencies:** 2.3, 2.4, 2.5, 1.6

---

### Task 2.7 — Callback Route

**Reference:** Doc 5 (Route 10), Doc 6 (Callback Processing Flow)

**Action:**
- Create `src/app/api/callbacks/kie/route.ts`
- Implement: parse → Redis lookup → stage validation → processSuccess/processFailure
- Include: download-to-R2 for video results, retry logic, model fallback

**Acceptance:**
- [ ] Receiving isolation success callback → stores cleaned_audio_url, fires video task, transitions to VIDEO_GENERATING
- [ ] Receiving video success callback → downloads video to R2, transitions to DELIVERING → COMPLETE
- [ ] Receiving failure callback with retries left → re-fires task, increments retry_count
- [ ] Receiving failure callback with retries exhausted → marks FAILED, refunds credit
- [ ] Unknown taskId → returns 200 (prevents kie.ai retry) + logs warning
- [ ] Duplicate callback (stage already advanced) → no-op, returns 200
- [ ] Isolation failure → falls back to original audio, continues pipeline

**Dependencies:** 2.6

---

### Task 2.8 — Generations List & Detail Routes

**Reference:** Doc 5 (Routes 8 & 9)

**Action:**
- Create `src/app/api/generations/route.ts` — list with filters
- Create `src/app/api/generations/[id]/route.ts` — single generation + events

**Acceptance:**
- [ ] `GET /api/generations` returns user's generations ordered by date
- [ ] `GET /api/generations?status=complete` filters correctly
- [ ] `GET /api/generations/{id}` returns full generation + events timeline
- [ ] Accessing another user's generation → 404
- [ ] Both routes require authentication

**Dependencies:** 1.6, 1.3

---

## Sprint 3: Frontend

### Task 3.1 — Login Page

**Reference:** Doc 8 (LoginPage, LoginForm, OtpForm)

**Action:**
- Create `src/app/login/page.tsx`
- Create `src/components/auth/LoginForm.tsx`
- Create `src/components/auth/OtpForm.tsx`

**Acceptance:**
- [ ] Phone input accepts Israeli numbers, auto-formats
- [ ] Click "שלח קוד" → OTP sent to WhatsApp, UI switches to OTP input
- [ ] 6-digit OTP entry with auto-advance between fields
- [ ] Correct OTP → redirect to `/dashboard`
- [ ] Wrong OTP → error message, can retry
- [ ] Email tab works (sends magic link)
- [ ] Mobile-friendly: works on phone screen (arrived via WhatsApp link)

**Dependencies:** 1.6, 1.7

---

### Task 3.2 — UI Primitives

**Reference:** Doc 8 (Section 19)

**Action:**
- Create `src/components/ui/Button.tsx`
- Create `src/components/ui/Card.tsx`
- Create `src/components/ui/Badge.tsx`
- Create `src/components/ui/Spinner.tsx`

**Acceptance:**
- [ ] `<Button variant="primary" size="xl">Text</Button>` renders correctly
- [ ] Loading state shows spinner
- [ ] All variants match brand design tokens
- [ ] RTL layout works (icon + text alignment)

**Dependencies:** 1.1

---

### Task 3.3 — Dashboard Layout & Header

**Reference:** Doc 8 (DashboardLayout, DashboardHeader, CreditsBadge)

**Action:**
- Create `src/app/dashboard/layout.tsx` — auth guard + user context
- Create `src/components/dashboard/DashboardHeader.tsx`
- Create `src/components/dashboard/CreditsBadge.tsx`

**Acceptance:**
- [ ] Visiting `/dashboard` without auth → redirect to `/login`
- [ ] Header shows Mivnim logo, nav links (יצירה, גלריה), credits badge
- [ ] Credits badge shows "⚡ 10" with correct number from API
- [ ] Active nav link highlighted in turquoise
- [ ] Mobile: header is compact, credits still visible

**Dependencies:** 1.7, 3.2

---

### Task 3.4 — Generation Form

**Reference:** Doc 8 (GenerationForm, AudioUpload, ImageUpload, CharacterPicker, VibePicker, LanguagePicker)

**Action:**
- Create `src/components/dashboard/GenerationForm.tsx`
- Create `src/components/dashboard/AudioUpload.tsx`
- Create `src/components/dashboard/ImageUpload.tsx`
- Create `src/components/dashboard/CharacterPicker.tsx`
- Create `src/components/dashboard/VibePicker.tsx`
- Create `src/components/dashboard/LanguagePicker.tsx`

**Acceptance:**
- [ ] Audio drag-and-drop: accepts mp3/wav/aac/ogg, rejects others, shows filename
- [ ] Image drag-and-drop: accepts jpg/png/webp, shows thumbnail preview
- [ ] Character grid: 7 characters, selected state visually distinct
- [ ] Vibe picker: 4 options with music genre hint
- [ ] Language picker: 4 flags in horizontal row
- [ ] CTA button disabled until audio OR script provided
- [ ] CTA button shows credit cost "(1 credit)"
- [ ] Click generate → uploads files → calls API → shows PipelineTracker
- [ ] Loading state: button shows spinner + "המנועים מתחממים..."
- [ ] Error state: red banner with error message

**Dependencies:** 3.3, 2.5, 2.6

---

### Task 3.5 — Pipeline Tracker

**Reference:** Doc 8 (PipelineTracker, StageIndicator)

**Action:**
- Create `src/components/dashboard/PipelineTracker.tsx`
- Create `src/components/dashboard/StageIndicator.tsx`

**Acceptance:**
- [ ] Shows after generation starts, displays progress dots
- [ ] Polls every 3 seconds, updates stage indicators
- [ ] Active stage pulses with animation
- [ ] Completed stages show green checkmark
- [ ] On COMPLETE: shows video player with play button
- [ ] On COMPLETE: shows "✅ נשלח בוואטסאפ" confirmation
- [ ] On COMPLETE: shows download + gallery + "create more" buttons
- [ ] On FAILED: shows error message + "credit refunded" notice
- [ ] Stops polling on terminal states

**Dependencies:** 3.4, 2.8

---

### Task 3.6 — Gallery Page

**Reference:** Doc 8 (GalleryPage, GalleryGrid, VideoCard)

**Action:**
- Create `src/app/dashboard/gallery/page.tsx`
- Create `src/components/gallery/GalleryGrid.tsx`
- Create `src/components/gallery/VideoCard.tsx`

**Acceptance:**
- [ ] Grid displays completed generations with thumbnails
- [ ] Each card shows: duration, resolution, character, time ago
- [ ] Active generations show spinner + "בהכנה" instead of thumbnail
- [ ] Click card → navigates to `/dashboard/gallery/{id}`
- [ ] Responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Empty state: "אין סרטונים עדיין — צור את הראשון!" with CTA

**Dependencies:** 3.3, 2.8

---

### Task 3.7 — Video Detail Page

**Reference:** Doc 8 (VideoDetailPage, VideoPlayer)

**Action:**
- Create `src/app/dashboard/gallery/[id]/page.tsx`
- Create `src/components/gallery/VideoPlayer.tsx`

**Acceptance:**
- [ ] Video player loads and plays the final video
- [ ] Download button triggers file download
- [ ] Copy link button copies R2 URL to clipboard
- [ ] Metadata section shows: model, character, vibe, duration, resolution, WhatsApp status, dates
- [ ] Script section shows processed_script
- [ ] Timeline shows generation events with timestamps
- [ ] Back button returns to gallery
- [ ] 404 if generation doesn't exist or belongs to other user

**Dependencies:** 3.6, 2.8

---

## Sprint 4: Delivery & Polish

### Task 4.1 — WhatsApp Delivery Integration

**Reference:** Doc 5 (WhatsApp delivery), Doc 6 (deliverGeneration)

**Action:**
- Integrate WhatsApp delivery into the callback handler (Task 2.7)
- Send video file + follow-up text on generation complete
- Send "generation started" notification in generate route
- Handle WAHA errors gracefully (don't fail generation if WhatsApp fails)

**Acceptance:**
- [ ] On generation complete: Yossi receives video on WhatsApp
- [ ] Follow-up text includes gallery link
- [ ] On generation start: Yossi receives "cooking" notification
- [ ] If WAHA is down: generation still completes, video in gallery
- [ ] `whatsapp_delivered` flag set correctly in DB

**Dependencies:** 2.7

---

### Task 4.2 — Cron Job: Stuck Task Recovery

**Reference:** Doc 5 (Route 11), Doc 6 (Section 11)

**Action:**
- Create `src/app/api/cron/check-stuck/route.ts`
- Configure Vercel Cron in `vercel.json`: every 2 minutes

**Acceptance:**
- [ ] Finds generations stuck > 10 minutes
- [ ] Polls kie.ai for actual task status
- [ ] Recovers tasks whose callbacks were lost
- [ ] Re-fires tasks stuck > 15 minutes
- [ ] Fails tasks that exceeded max retries
- [ ] Returns summary: checked, recovered, still_stuck, failed
- [ ] Vercel Cron secret required (rejects without it)
- [ ] Dedup: won't run if another instance already checking

**Dependencies:** 2.7

---

### Task 4.3 — Health Check

**Reference:** Doc 5 (Route 12)

**Action:**
- Create `src/app/api/health/route.ts`
- Check: Postgres, Redis, R2, WAHA connectivity

**Acceptance:**
- [ ] Returns 200 with all services "connected" when healthy
- [ ] Returns 503 with specific service "error" when degraded
- [ ] Fast: responds in < 2 seconds
- [ ] Public: no auth required

**Dependencies:** 1.3, 1.4, 1.5

---

### Task 4.4 — Vercel Deployment Configuration

**Action:**
- Create `vercel.json` with:
  - Function max duration: 60s for `/api/generate`, 30s for others
  - Cron: `/api/cron/check-stuck` every 2 minutes
  - Headers: CORS for callback routes
- Set all environment variables in Vercel dashboard
- Configure domain: `studio.rensto.com` → Vercel
- Deploy and verify

**Acceptance:**
- [ ] `vercel deploy` succeeds
- [ ] `studio.rensto.com` loads the app
- [ ] All env vars accessible in deployed functions
- [ ] Cron job visible in Vercel dashboard
- [ ] Callback URL `studio.rensto.com/api/callbacks/kie` accessible from kie.ai

**Dependencies:** All previous tasks

---

### Task 4.5 — End-to-End Smoke Test

**Action:**
Complete flow test with real data:

1. Open `studio.rensto.com/login`
2. Enter Yossi's phone number
3. Receive OTP on WhatsApp
4. Enter OTP → land on dashboard
5. Upload a test audio file (10-20s speech clip)
6. Select character: Trump, vibe: Winner, language: en
7. Click generate
8. Watch pipeline tracker progress through stages
9. Receive video on WhatsApp
10. View video in gallery
11. Open video detail page
12. Download video

**Acceptance:**
- [ ] Full flow completes in < 10 minutes
- [ ] Video received on WhatsApp
- [ ] Video plays in gallery
- [ ] Credit decremented (10 → 9)
- [ ] Generation events timeline shows all stages
- [ ] No console errors in browser
- [ ] No unhandled errors in Vercel logs

**Dependencies:** 4.4

---

## Task Dependency Graph

```
S1: Foundation
  1.1 Scaffold
   └── 1.2 Env
        ├── 1.3 Database
        ├── 1.4 Redis
        └── 1.5 R2
             │
        1.6 Auth (needs 1.3, 1.4)
         └── 1.7 Middleware

S2: Pipeline Core
  2.1 kie.ai client (needs 1.2)
  2.2 Aitable client (needs 1.2)
   └── 2.3 Gemini brain (needs 2.1, 2.2)
  2.4 Credits (needs 1.3, 1.4)
  2.5 Upload route (needs 1.5, 1.6)
   └── 2.6 Generate route (needs 2.3, 2.4, 2.5)
        └── 2.7 Callback route (needs 2.6)
  2.8 Generations routes (needs 1.3, 1.6)

S3: Frontend
  3.1 Login page (needs 1.6, 1.7)
  3.2 UI primitives (needs 1.1)
   └── 3.3 Dashboard layout (needs 1.7, 3.2)
        └── 3.4 Generation form (needs 3.3, 2.5, 2.6)
             └── 3.5 Pipeline tracker (needs 3.4, 2.8)
        └── 3.6 Gallery page (needs 3.3, 2.8)
             └── 3.7 Video detail page (needs 3.6)

S4: Delivery & Polish
  4.1 WhatsApp delivery (needs 2.7)
  4.2 Cron stuck check (needs 2.7)
  4.3 Health check (needs 1.3, 1.4, 1.5)
  4.4 Vercel deploy (needs all)
   └── 4.5 E2E smoke test (needs 4.4)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| kie.ai Gemini returns unexpected format | Sanitizer in gemini.ts overrides to defaults. Fallback values always produce a working generation. |
| kie.ai video task takes > 10 min | Cron job recovers stuck tasks. User gets WhatsApp notification — doesn't need to wait on screen. |
| WAHA session disconnects | WhatsApp delivery is best-effort. Video still saved in gallery. Admin alert on session down. |
| R2 upload fails during callback | Retry download-to-R2 once. If fails, store kie.ai CDN URL directly (ephemeral but buys time). |
| Vercel 60s function timeout on generate | Gemini call is ~5-15s. Everything else is fast. Budget is comfortable. If tight, split into background job. |
| User has no headshot image | Phase 1: image upload optional. If missing + model requires image, fall back to kling-3.0/video (text-only). |
| Aitable API down | 5-minute cache means brief outages are invisible. If extended, hardcode defaults in gemini-constants.ts. |

---

## Definition of Done (Phase 1)

- [ ] Yossi can log in via WhatsApp OTP
- [ ] Yossi can upload audio and generate a video
- [ ] Video arrives on WhatsApp within 10 minutes
- [ ] Video visible in gallery with full details
- [ ] Credits consumed and tracked correctly
- [ ] Failed generations refund credits automatically
- [ ] Stuck tasks recovered by cron within 12 minutes
- [ ] Health endpoint reports all services connected
- [ ] App deployed at `studio.rensto.com`
- [ ] Works on mobile (WhatsApp → browser flow)
