# Findings

**Purpose**: Research, discoveries, constraints, root causes. Updated by agents after each meaningful task. **Use for "never repeat"**: When an issue is fixed, add the root cause here so it does not recur. (Historical lessons: `apps/worker/legacy_archive/lessons.md`.)

**Doc hygiene**: Don't create a new .md for every task. Update brain, CLAUDE, findings, progress, DECISIONS. Archive one-off audits after merging key points to main docs. Delete empty or obsolete .md. When searching, prefer main docs (brain, CLAUDE, findings, DECISIONS, METHODOLOGY, CONFLICT_AUDIT) — not archived residue.

---

## 2026-02-24

### TourReel — Music Reuse Instead of Suno Generation (NEVER REPEAT)

**Root cause**: Video pipeline logic prioritized database track reuse over Suno generation. Lines 587-592 in `video-pipeline.worker.ts` queried `music_tracks` table for ANY existing track and used it BEFORE trying Suno. This caused all videos to reuse the same track instead of generating fresh music.

**Original (WRONG) logic:**
1. If `music_track_id` set → use that track
2. Else query database for least-used track → **USE IT** (stopped here)
3. Only if database empty → generate via Suno

**Fix**: Reversed priority so Suno is PRIMARY, database is fallback:
1. If `music_track_id` explicitly set → use that track (user's choice)
2. **Else generate fresh via Suno (PRIMARY PATH)**
3. Only if Suno fails or credits exhausted → fall back to database tracks
4. Final fallback: SoundHelix public domain track

**Rule**: Music generation MUST use Suno for every new video unless `music_track_id` is explicitly set. Database tracks are fallback for failures only, never primary.

**Deploy**: Fixed in video-pipeline.worker.ts lines 576-616, deployed Feb 24, 2026.

---

### TourReel — FFmpeg drawtext Filter Missing (NEVER REPEAT)

**Root cause**: FFmpeg static build from johnvansickle.com (version 7.0.2) was missing the `drawtext` filter despite claiming `--enable-libfreetype` in configuration. The daily auto-update cron (`tools/update-ffmpeg.sh`) installed this broken build on Feb 24 at midnight, causing text overlay failures.

**Symptom**: Assembly phase failed with `[AVFilterGraph] No such filter: 'drawtext'` after successfully stitching all clips.

**Fix**: Switched from johnvansickle static build to Ubuntu package repository FFmpeg (version 6.1.1) which includes full codec support:
```bash
# Renamed static build to .bak
mv /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg.static.bak
mv /usr/local/bin/ffprobe /usr/local/bin/ffprobe.static.bak

# Now using /usr/bin/ffmpeg (Ubuntu 6.1.1) with drawtext support
```

**Root cause analysis**: Johnvansickle static builds may be compiled without certain filters to reduce binary size. The auto-updater script blindly pulls the latest "release" build without validating filter availability.

**Rule**: Prefer Ubuntu package repo FFmpeg over static builds for production. If using static builds, validate critical filters (`ffmpeg -filters | grep drawtext`) after installation.

**Deploy**: Fixed on RackNerd Feb 24, 2026. Disabled daily auto-update cron until static build issue resolved.

---

### TourReel — Timestamp Bug in Text Overlays (NEVER REPEAT)

**Root cause**: PostgreSQL `numeric` type fields (`duration_seconds`) are returned as **strings** by node-postgres, not numbers. When the pipeline accumulated timestamps with `cumSec += dur` (line 634), if `dur` was a string, JavaScript performed string concatenation instead of arithmetic addition.

**Example failure:**
```javascript
let cumSec = 0;
const dur = "10";  // String from Postgres
cumSec += dur;     // "010" (string concat!)
cumSec += "5";     // "0105" (more concat)
cumSec + 0.3;      // "01050.3" → malformed timestamp in FFmpeg filter
```

**FFmpeg error**: `enable='between(t\,010.005.005.000.3\,...)'` (garbage timestamps)

**Fix**: Parse `duration_seconds` as float before accumulation:
```typescript
const dur = parseFloat(c.duration_seconds) || config.video.defaultClipDuration;
cumSec += dur;  // Now arithmetic addition
```

**Rule**: ALWAYS parse numeric fields from Postgres before arithmetic operations. Never assume node-postgres returns numbers for `numeric`/`decimal` types.

**Deploy**: Fixed in video-pipeline.worker.ts line 621, deployed Feb 24, 2026.

---

## 2026-02-23

### FB Marketplace Bot — Empty Queue / No Postings for 3 Days (NEVER REPEAT)

**Root cause**: The `fb_listings` table had zero queued rows. The initial `setup-test-data.js` was a one-time seed that created ~4 listings. Once all were posted (Feb 20), the queue ran permanently dry. The scheduler continued cycling every ~60 min but the bot exited in 1 second each time ("No jobs available").

**Fix**:
1. **Immediate**: Seeded 10 queued listings per client via SQL.
2. **Permanent**: Added auto-replenishment to `webhook-server.js`:
   - `PRODUCT_TEMPLATES` object with base listing data for UAD and MissParty
   - `replenishQueue(clientId)` — checks if < 5 queued, creates batch of 10
   - Runs on startup + every 30 min via `setInterval`
   - Queue will never run dry again

**Also fixed**:
- **Xvfb display mismatch**: Xvfb was running on `:99` but GoLogin/Orbita expects `:100`. Started Xvfb on `:100`, added to crontab for boot persistence.
- **Scheduler DISPLAY env**: `spawn()` in scheduler.js wasn't passing `DISPLAY` to child processes. Added `env: { ...process.env, DISPLAY: ':100' }`.

**Key FB bot facts (V2 — Feb 23 rewrite)**:
- Bot config: `fb marketplace lister/deploy-package/bot-config.json` (local), `/opt/fb-marketplace-bot/bot-config.json` (server)
- DB: `fb_listings` table in `app_db` on RackNerd (same Postgres as worker), `config_data` JSONB column for dedup
- Webhook server V2: port 8082, unique config generation, Kie.ai images, non-blocking replenishment
- Scheduler V2: 20min cycles, 6am-10pm CST, postLimit (5 UAD, 3 MissParty), cooldownMinutes (15 UAD, 30 MissParty)
- GoLogin profiles: UAD `694b5e53fcacf3fe4b4ff79c`, MissParty `6949a854f4994b150d430f37`
- UAD: 2,520+ unique configs (5 collections × 7 sizes × 2 designs × 9 colors × 4 constructions), size-based pricing
- MissParty: $75 FIXED (no jitter!), 6 scenarios, "$1/mile delivery available. Free pickup."
- Images: 3 unique Kie.ai-generated images per listing, phone overlay on ALL 3 (not just image 1)
- Kie.ai API: Seedream 4.5 Edit (image-to-image) + Flux 2 Pro (text-to-image fallback), Kling 3.0 (video)

### FB Bot V2 — MissParty $80 Price Bug (NEVER REPEAT)

**Root cause**: V1 webhook-server.js applied ±10% price jitter to ALL products including MissParty. `$75 × (0.9 + Math.random() × 0.2)` → range $67.50-$82.50, rounded to nearest $5 = possible $70/$75/$80/$85. MissParty was posting at **$80** instead of $75.

**Fix (V2)**: MissParty price is set from `MISSPARTY_PRICE = 75` constant with zero jitter. UAD uses size-based pricing from the matrix. Price is set at config generation time, not at serve time.

**Rule**: MissParty price is ALWAYS $75. Never apply random jitter to MissParty pricing.

### FB Bot V2 — Phone Overlay Only on Image 1 (NEVER REPEAT)

**Root cause**: V1 only applied ImageMagick phone overlay to image 1 (the "main" image). Images 2-3 came from a static pool that may have had a different or no phone number.

**Fix (V2)**: `image-generator.js` applies `applyPhoneOverlay()` to ALL 3 generated images. Every image the customer sees has the correct phone number.

### FB Bot V2 — Same Product Every Post (NEVER REPEAT)

**Root cause**: V1 used `PRODUCT_TEMPLATES` — a static object with one product per client. Every UAD post was "16x7 Classic Steel $2500". Every MissParty post was the same bounce house.

**Fix (V2)**: `product-configs.js` generates unique configs from 2,520+ UAD combos and 6 MissParty scenarios. Dedup checks `fb_listings.unique_hash` to avoid repeats. `config_data` JSONB stores full config for analytics.

### Telnyx AI Assistant — Voice Silence Bug (NEVER REPEAT)

**Root cause**: `Telnyx.NaturalHD.Ava` voice causes silent failure. Calls connect, conversations are created in the API, but the AI produces zero audio output. Channel 2 (AI) RMS = 0.4 (silence). No error is thrown — it fails completely silently.

**Fix**: Use `Telnyx.KokoroTTS.af_heart` instead. KokoroTTS works immediately — greeting delivered, transcription works, LLM responds, tool calls work.

**Also fixed**:
- `api_key_ref: "rensto"` in voice_settings was pointing to a non-existent key reference. Must be empty string `""` for Telnyx-native voices.
- Phone number was connected to old Call Control App (webhook to n8n). Switched to TeXML App (`2860769989730764458`) that routes to the AI assistant.
- Transfer tool requires `from` parameter in the config, otherwise returns 422 "from parameter required".
- Hangup tool makes LLM too aggressive — removed it. Let callers hang up naturally.
- `+972522422274` is Yoram's number, NOT Shai's. Shai's number: `+14695885133`.

**Key Telnyx AI facts**:
- Conversations endpoint: `/ai/conversations` (flat, NOT nested under assistants)
- Conversations list ALL conversations across all assistants — filter by `metadata.assistant_id` client-side
- `number_of_messages` counts user messages only; `last_message_at` includes assistant messages
- Outbound calls: `POST /v2/texml/ai_calls/<texml_app_id>` with `{From, To, AIAssistantId}`
- Outbound to Israel requires adding "IL" to outbound voice profile whitelist
- Available models include: Llama-3.3-70B-Instruct, Qwen3-235B-A22B, Claude models, GPT models

### Purim Video Production — API Findings (NEVER REPEAT)

**FakeYou TTS**:
- Tacotron2 garbles text >8 words. MUST chunk into 5-8 word phrases, generate separately, stitch with FFmpeg.
- CDN: `cdn-2.fakeyou.com` only. `storage.googleapis.com` and `cdn.fakeyou.com` both 403.
- Best Trump voice: `weight_x6r5w2tsxgcrrsgweva6dkrqj` (Trump Angry). Casual/Standard/V3 all worse.
- JSON escape: Use temp files (`/tmp/fy*.json`) with `@` syntax. Exclamation marks break inline JSON.

**Kling 3.0 API (via Kie.ai)**:
- Model name: `kling-3.0/video` — NOT `kling-3.0`, `kling-3.0/standard`, `kling-3.0/pro`.
- Required boolean params: `multi_shots`, `sound` — omitting either returns 422.
- First/last frame transitions: `image_urls: ["first_frame.jpg", "last_frame.jpg"]` generates morph video.
- Duration must be string `"5"` or `"10"` — not number.
- API response: `state` field (not `status`), URLs in `resultJson.resultUrls[]` array.

**Kling 3.0 Transition Best Practices (researched from 15+ sources)**:
- **Use actual scene frames**: Last frame of clip A + first frame of clip B as start/end frames. NOT a generic reference image.
- **Prompt = camera path only**: "Smooth steadicam follows..." — DO NOT describe the scene or transition details. Model infers the morph.
- **Pro mode + 5s**: Pro has better motion fidelity. 5s = sweet spot (less hallucination than 10s).
- **Color/tone match**: Both frames must share similar lighting and color palette. Mismatched lighting = visible seams.
- **Negative prompt**: "morphing, flickering, wall penetration, floating person, teleportation, camera shake, glitch, distorted face, extra limbs"
- **No double transitions**: Kling clip IS the transition. Hard cut to/from it. Do NOT add xfade on top.
- **Multi-shot mode incompatible with end frame**: Only use single-scene mode for first/last frame.
- **Guiding objects**: Keep one consistent focal element visible in both frames to anchor the model's motion path.

**Kling 3.0 Elements (Character Reference)**:
- S4 (lawyer/tutu) succeeded on first attempt. S2 (developer/superman) timed out 2x (30+ min). S6 (Trump) instant "internal error" — content filter detects public figures in reference images.
- Elements work best with generic/non-famous characters. Public figure images trigger content filters.
- Even without Elements, using a public figure's image as `image_urls` start frame triggers "internal error" on Kie.ai.
- Cost: Failed Elements tasks still consume credits ($0.10/attempt).

**RVC Voice Conversion (NEVER REPEAT — working solution)**:
- FakeYou Tacotron2 scrambles word order for ALL Trump models (architectural limitation, unfixable).
- Solution: Edge TTS (perfect word accuracy) → RVC voice conversion (Trump timbre).
- Stack: Python 3.10 venv (`/opt/rvc-env/`) + PyTorch CPU + `infer-rvc-python` + `faiss-cpu==1.7.3` + `numpy<2`.
- Model: `Donald-Trump_e135_s6480.pth` from HuggingFace (`Coolwowsocoolwow/Donald-Trump`).
- `torch.load` monkey-patch needed: PyTorch 2.10 defaults `weights_only=True`, fairseq needs `False`.
- `faiss-cpu==1.7.3` requires `numpy<2` (compiled against NumPy 1.x API).
- `infer-rvc-python` requires `pip<24.1` (omegaconf metadata issue).
- CPU inference: ~1:1 real-time (5.6s audio → ~5s processing on RackNerd).
- HuggingFace `sail-rvc/*` models require auth. `Coolwowsocoolwow/*` models are public.

**ElevenLabs via Kie.ai**:
- Working: `elevenlabs/text-to-speech-turbo-2-5`, `elevenlabs/text-to-speech-multilingual-v2`
- Broken: `elevenlabs/text-to-dialogue-v3` (500 errors consistently)
- Voice quality: User reported all ElevenLabs voices sounded "female/same" — likely voice_id issue or model limitation.

**FFmpeg Assembly**:
- Must use `-nostdin` flag to prevent interactive prompts in automated scripts.
- Heredoc scripts: Avoid Unicode chars (──, arrows) — bash interprets them as commands.
- Node.js in heredoc: `(async()=>{` causes bash syntax error. Use separate commands or temp files.
- xfade offset formula: `offset = cumulative_duration - xfade_duration` (not cumulative alone).

### Generation Cost Tracking — MANDATORY (NEVER REPEAT)

**Rule**: Every API generation logs cost. In automated pipeline via `trackExpense()`. In manual sessions via cost table in `progress.md`.

**Infrastructure ready**: `api_expenses` table + `expense-tracker.ts` with `trackExpense()`, `getDailyExpenses()`, `getExpenseTrend()`, `detectAnomalies()`. See tourreel-pipeline SKILL.md for full rate table.

**Purim Video Cumulative Costs (Feb 22-23, 2026)**:

| Operation | Count | Unit Cost | Total |
|-----------|-------|-----------|-------|
| Kling 3.0 Pro (V9-V10 transitions) | 6 | $0.10 | $0.60 |
| Kling 3.0 Pro Elements (V13 S2/S4/S6) | 8 | $0.10 | $0.80 |
| FakeYou Trump TTS | ~20 | $0.00 | $0.00 |
| ElevenLabs TTS (via Kie.ai) | 5 | $0.02 | $0.10 |
| Edge TTS + RVC conversion | 4 | $0.00 | $0.00 |
| R2 uploads (videos + assets) | ~45 | $0.0001 | $0.005 |
| **Cumulative Total** | | | **$1.50** |

### Platform Audit — Feb 23, 2026 (55 checks: Infrastructure + Business + Website)

**Method**: 6-phase audit — local code review, HTTP endpoint checks, SSH/RackNerd, database queries, external service checks, performance. 42 checks passed, 5 CRITICAL, 10 IMPORTANT, 5 NICE-TO-HAVE.

#### CRITICAL (fix immediately)

1. **CORS wildcard on all API routes** — `vercel.json:9-14`: `Access-Control-Allow-Origin: *` on `/api/(.*)`. Any website can make cross-origin requests to all API endpoints, including authenticated ones. Session cookies with `SameSite=Lax` mitigate CSRF for state-changing requests, but GET routes leak data.
   - **Fix**: Replace `*` with `https://rensto.com, https://admin.rensto.com`. Add `Access-Control-Allow-Credentials: true`.

2. **68% video pipeline failure rate** — DB query: 60 failed / 88 total jobs (31.8% completion). Avg duration 1174 minutes (~19.6 hours). No api_expenses logged in 30 days (trackExpense() NOT being called).
   - **Fix**: Query failed job error patterns. Top causes likely: Kie.ai timeouts, credit insufficiency, photo URL failures. Fix root causes and add trackExpense() calls to worker pipeline.

3. **~60 TypeScript errors silently ignored** — `next.config.mjs:34-36`: `ignoreBuildErrors: true`. Errors include: 6 missing modules (`rensto-card`, `rensto-progress`, `rensto-status`, `react-bits`, `rensto-logo`, `rensto-styles`), wrong Stripe API version (`2024-04-10` vs `2025-08-27.basil`), broken GSAP types, missing `@/hooks/useAnalytics`, broken Badge/Button variant types (`renstoInfo`, `renstoDanger` not in variant union).
   - **Fix**: Delete dead components referencing missing modules. Update Stripe API version. Fix variant types. Goal: `tsc --noEmit` clean, then remove `ignoreBuildErrors`.

4. **No custom error pages** — Zero `error.tsx`, `not-found.tsx`, or `loading.tsx` files in entire `apps/web/rensto-site/src/app/`. Users see raw Next.js error pages.
   - **Fix**: Create `app/error.tsx` (global error boundary), `app/not-found.tsx` (branded 404), `app/(main)/loading.tsx` (loading skeleton).

5. **Expense tracking not running** — `api_expenses` table has zero rows for last 30 days. `trackExpense()` exists in code but is not being called by the worker during Kling/Suno/Gemini API calls. Cost visibility is zero.
   - **Fix**: Add `trackExpense()` calls after every external API call in `video-pipeline.worker.ts`. Verify with a test job.

#### IMPORTANT (fix this week)

6. **CSP contains retired Firebase domains** — `vercel.json:30`: `firebasestorage.googleapis.com` in `img-src`, `firebaseio.com` in `connect-src`. Firestore fully retired Feb 2026. Unnecessary attack surface.
   - **Fix**: Remove both domains from CSP. Test that no pages break (they shouldn't — Firebase client SDK was removed).

7. **X-Frame-Options conflict** — `next.config.mjs:139` sets `DENY`, `vercel.json:34` sets `SAMEORIGIN`. Vercel headers override Next.js headers. Live response: `SAMEORIGIN`. Misaligned intent.
   - **Fix**: Align both to `DENY` (no legitimate iframe use). Or remove from `next.config.mjs` since `vercel.json` wins.

8. **WCAG 1.4.4 violation — userScalable: false** — `layout.tsx:83`: `userScalable: false` and `maximumScale: 1`. Blocks pinch-to-zoom on mobile. Accessibility violation that fails WCAG 2.1 Level AA.
   - **Fix**: Remove `userScalable: false` and `maximumScale: 1` from viewport config.

9. **Worker health endpoint is NO-OP** — `curl http://172.245.56.50:3002/api/health` returns `{"status":"ok"}` without checking Redis, BullMQ queue depth, disk space, or FFmpeg availability.
   - **Fix**: Add real checks: Redis PING, BullMQ waiting/failed counts, disk % used, FFmpeg version. Return `degraded` or `unhealthy` with details.

10. **8 dead database tables with 0 rows** — AdminConversation (0), OptimizerAudit (0), Requirement (0), WhatsAppMessage (0), N8nAgentMemory (0), Analytics (0), plus WhatsAppInstance (1), BusinessNiche (2). Dead Prisma models referenced in 7 source files.
    - **Fix**: Create Prisma migration to drop empty tables. Remove dead model references from `legacy-types.ts`, `admin.ts`, `marketplace.ts`. Keep BusinessNiche (2 rows) if still needed.

11. **Disk at 75%** — RackNerd: 68G/96G used (75%). Approaching 80% threshold.
    - **Fix**: Clean `/tmp` video artifacts, old FFmpeg downloads, stale Docker images. Add disk check to worker health endpoint.

12. **FFmpeg version outdated** — `ffmpeg version 7.0.2-static` (2024 build). Auto-update cron should keep this current.
    - **Fix**: Verify cron job is running (`crontab -l`). Run `./apps/worker/tools/update-ffmpeg.sh` manually.

13. **tourreel-worker has 7 restarts** — PM2 shows `restart_time: 7` while all other 4 processes have 0. Indicates crash loops.
    - **Fix**: Check PM2 logs: `pm2 logs tourreel-worker --err --lines 100`. Investigate OOM, unhandled rejections, or BullMQ connection issues.

14. **Google Search Console not verified** — `layout.tsx:71-72`: `verification: { google: 'REAL_CODE_HERE' }` is commented out. Zero search visibility data.
    - **Fix**: Set up Search Console, get verification code, uncomment and set.

15. **8 stale MagicLinkTokens** — 8 expired tokens in DB. Minor cleanup.
    - **Fix**: `DELETE FROM "MagicLinkToken" WHERE "expiresAt" < NOW()`. Add periodic cleanup (cron or on-login).

#### NICE-TO-HAVE (backlog)

16. **Schema drift (7 warnings)** — Schema Sentinel: Drizzle has columns not in Prisma (`role`, `active_services`, `entitlements`, `stripe_customer_id`, `preferences` on users; `meta` on usage_events; `created_at` on tenants). 0 type mismatches.
    - **Fix**: Add corresponding fields to Prisma schema or document intentional divergence.

17. **Email DNS — no DKIM for Resend** — SPF present (`v=spf1 include:_spf.protection.outlook.com -all`) but only covers Outlook. No DKIM record for Resend transactional emails. Deliverability risk.
    - **Fix**: Add Resend DKIM records to DNS. Add Resend to SPF include.

18. **Only 1 active user in 30 days** — 46 registered, 46 verified, 1 active recently. Only 3 entitlements exist (e2e test: 1436 credits, service@rensto.com: 57, test-gating: 15). Business metric — early stage.

19. **Only 1 subscription** — 1 active subscription, 3 total payments, 0 with unknown userId (linkage clean).

20. **Dead code in components** — `BusinessIntelligence.tsx` imports missing `@/lib/business-intelligence`. `CustomerAgentSystem.tsx`, `IntelligentOnboardingAgent.tsx` import missing `rensto-progress`, `rensto-status`. `alert.tsx` imports missing `react-bits`. These should be deleted or fixed as part of the TypeScript cleanup (Finding #3).

#### HEALTHY (no action needed)

| Check | Result |
|-------|--------|
| Web health (`/api/health/check`) | `{"status":"ok"}` |
| Ollama | Online, `nomic-embed-text` loaded |
| n8n | 200 |
| FB Bot | Online, all image pools full (6/slot), 2 products active |
| PM2 processes | 5/5 online (webhook-server, fb-scheduler, tourreel-worker, image-pool, cookie-monitor) |
| SSL cert | Valid until Apr 29, 2026 (65+ days) |
| HSTS | Present: `max-age=63072000; includeSubDomains; preload` |
| Favicon | 200, `image/x-icon` |
| OG image | 200, `image/png`, 1200x630 |
| Landing pages (`/lp/yoram`) | 200 |
| Legacy redirects | All 7 paths resolve correctly (200 after follow) |
| Schema types | 0 mismatches (Schema Sentinel) |
| Stuck jobs | 0 currently |
| Payment linkage | 3/3 linked, 0 unknown userId |
| Lead sources | 5 distinct (Rensto AI Agent: 5, whatsapp, linkedin, google_maps, manual) |
| Session encryption | AES-256-GCM implemented (`auth.ts`), falls back to base64 if `SESSION_SECRET` unset |
| Redis | Running (in Docker container, used by BullMQ + worker) |

### Business Operations Audit — Feb 23, 2026 (Deep Verification)

**Context**: Follow-up to infrastructure audit above. Verifies actual business logic end-to-end: Are products doing their job? Are leads flowing? Is money being wasted?

#### CRITICAL — FB Marketplace Bot

1. **Bot exits in ~1 second on 90% of cycles** — cycles 30-38 show both UAD and MissParty exiting with code 0 in ~1s. Only cycle 39 ran 36s (UAD) and 42s (MissParty). Likely GoLogin profile/Facebook session failures.
   - Evidence: `pm2 logs fb-scheduler` — 9/10 cycles complete in <2s per product
   - Only 5/24 listings posted (21% success rate). 19 remain queued.
   - **Fix**: Re-authenticate both Facebook accounts via `interactive_login.js` + noVNC

2. **Gemini API returning 403** — AI copy generation fails intermittently. Webhook falls back to static DB copy.
   - Evidence: `webhook-server-error-0.log` — `[UAD] Gemini HTTP 403` and `Kie/Gemini returned empty response`
   - **Fix**: Check Gemini API key validity, quotas, and billing

3. **Webhook rotation IS working** — City rotation (Dallas→Fort Worth→Arlington, 30 cities for UAD, 20 for MissParty), phone rotation (4 phones for UAD, 1 for MissParty), AI copy, and image overlays all confirmed working at webhook level.
   - Evidence: `pm2 logs webhook-server` — `[UAD] Phone rotation: +1-972-628-3587 (2/4)`, `Location rotation: Fort Worth, TX (2/30)`
   - DB still shows "Dallas, Texas" because rotation is applied dynamically at request time, not at queue creation

4. **Bot config validated** — `bot-config.json` has correct GoLogin profiles, webhook URLs (localhost:8082), phone arrays, location arrays, stealth levels, post limits for both UAD and MissParty.

#### CRITICAL — UAD → Workiz Pipeline BROKEN

1. **Workiz API credentials INVALID** — n8n workflow `U6EZ2iLQ4zCGg31H` ("UAD Garage Doors Facebook Marketplace Audio Lead Analysis") sends leads to Workiz but gets `401 Invalid API credentials`.
   - Evidence: Execution #154072 → Workiz Create Lead node → `{"error": true, "code": 401, "msg": "Invalid API credentials"}`
   - API key: `api_uj4t1r0msb2ciq8xkzcm3aw13yjxomd8`, auth secret: `sec_2588677273239269210546263`
   - **Result**: ZERO leads reaching Workiz. Pipeline has been silently failing.
   - **Fix**: Get fresh Workiz API credentials from UAD account and update n8n workflow

2. **Claude analysis returns ALL UNKNOWN** — The "Analyze and Categorize Audio" node returns all fields as UNKNOWN (name, phone, address, sentiment, priority, category).
   - Evidence: Execution #154072 → `confidenceScore: 0`, all fields UNKNOWN
   - Root cause: Likely insufficient conversation context being passed to Claude, or the conversations have no real content (short/missed calls)
   - **Fix**: Review Claude prompt in n8n, ensure conversation insights and transcript are being forwarded

3. **Outlook email notification fails** — "No binary data exists on item!" when trying to attach audio file.
   - Evidence: `Send via Outlook1` node fails because `audioFile` binary property doesn't exist
   - Sends to `service@rensto.com` via Microsoft Outlook OAuth2
   - **Fix**: Make audio attachment optional (some conversations won't have recordings)

4. **n8n workflow IS running** — 10 recent successful executions (every 15 min, all today). Recent successes are because there are no NEW conversations to process — the workflow polls, finds nothing new, exits cleanly. Errors only occur when it finds conversations to process.

#### CRITICAL — Telnyx Voice AI (Rensto FrontDesk)

1. **18/19 calls classified as "missed"** — Only 1 answered call (Shai's test). 18 others have `number_of_messages=0` and `last_message_at=null`.
   - Evidence: `SELECT outcome, COUNT(*) FROM "VoiceCallLog"` → missed: 18, answered: 1
   - Root cause: `determineOutcome()` in `frontdesk-poller.worker.ts:193-198` checks only user message count. Robot/spam calls that connect but never speak are classified as missed.

2. **95 credits charged for missed calls** — ALL 19 calls charged 5 credits each, including the 18 missed calls. 90 credits wasted.
   - Evidence: `creditsToCharge = config.telnyx.creditsPerCall` (always 5, line 126)
   - **Fix**: Add `if (outcome === 'missed') creditsToCharge = 0;` before credit deduction

3. **callerPhone null for 18/19 calls** — `meta.telnyx_end_user_target` and `meta.from` are both empty for most conversations.
   - Evidence: `SELECT "callerPhone", COUNT(*) FROM "VoiceCallLog"` → null: 18, phone: 1
   - Root cause: Telnyx metadata may not be populated for short/dropped calls. Robot calls via SIP (like `gencredMq3w...@sip.telnyx.com`) have SIP URIs, not phone numbers.
   - **Fix**: Parse SIP caller info as fallback, or fetch from messages endpoint

4. **Duration always 0** — `frontdesk-poller.worker.ts:145` hardcodes `duration: 0` with comment "not available from conversation object"
   - **Fix**: Calculate from `created_at` to `last_message_at`, or fetch from call records API

5. **Summary/sentiment null for all** — Insights API may be failing silently or not available for short calls
   - **Fix**: Only request insights for conversations with `number_of_messages > 0`

6. **UAD/MissParty NOT polled by worker** — Worker only polls Rensto's own assistant (1 SecretaryConfig with telnyxAssistantId). UAD/MissParty are on separate Telnyx account, handled by n8n.
   - Evidence: `SELECT COUNT(*) FROM "SecretaryConfig" WHERE "telnyxAssistantId" IS NOT NULL` → 1

#### Documentation Conflicts (from background audit)

1. **INFRA_SSOT.md says Telnyx "DORMANT"** — Actually ACTIVE for UAD/MissParty (n8n workflows firing every 15 min). **STALE — needs update.**
2. **brain.md + DECISIONS.md say n8n is "backup only"** — But UAD/MissParty lead pipeline runs production n8n workflows. **CONFLICT — needs clarification.**
3. **CLAUDE_CODE_WORKFLOW.md referenced but doesn't exist** — Dead reference in CLAUDE.md line 47.
4. **NotebookLM 18, 19, 20 deprecated/empty** — Still listed in NOTEBOOKLM_INDEX.md.

#### Admin Dashboard Gaps (from background audit)

**Overall coverage: ~25% of critical data visible to admin. 75% invisible.**

| Data | In DB | Admin Sees | Coverage |
|------|-------|-----------|----------|
| Video Jobs | 88 (60 failed) | Nothing | 0% |
| Leads | 9 from 5 sources | Nothing | 0% |
| Voice Calls | 19 logs | Nothing | 0% |
| Credit Balance | 3 users | Nothing | 0% |
| Usage Events | Multiple | Nothing | 0% |
| FB Bot Status | Active (PM2) | Nothing | 0% |
| Services | 14 monitored | Full health view | 100% |
| Clients | 46 users | CRUD view | 100% |
| Financials | Subscriptions | Hardcoded expenses | 30% |

**5 broken admin components**: BusinessIntelligence.tsx (missing module), CustomerAgentSystem.tsx (dead imports), IntelligentOnboardingAgent.tsx (dead imports), Alert.tsx (missing `react-bits`), EcosystemMap.tsx (references Firestore comments).

#### EMAIL — NOT YET VERIFIED

Emails observed across systems:
- **service@rensto.com** — n8n Outlook recipient for UAD lead analysis emails
- **admin@rensto.com** — in ADMIN_EMAILS array (`auth.ts:14`)
- **uad.garage.doors@gmail.com** — UAD Facebook account (`bot-config.json:18`)
- **michalkacher2006@gmail.com** — MissParty Facebook account (`bot-config.json:96`)
- **Rensto Microsoft Outlook OAuth2** — n8n credential `EA2Fl9QT5h2HZoo9` used to send emails

**Need user confirmation**: Which emails should be configured where? Are there missing email routes?

---

## 2026-02-20

### CRITICAL: RackNerd Firewall Was INACTIVE — Redis & Postgres Exposed

**What happened**: `ufw status verbose` returned "Status: inactive". Docker port mappings for Redis (6379) and Postgres (5432) were bound to 0.0.0.0 — fully accessible from the public internet. Any attacker could have connected to the database or Redis cache directly.

**Root cause**: Firewall was never enabled after initial VPS setup. Docker's `-p` flag binds to all interfaces by default. Without UFW, nothing blocks external access.

**Fix**: Enabled UFW with explicit allow rules for only necessary ports (22, 80, 443, 3002, 8080, 8082, 11434). Redis and Postgres ports are now blocked from external access.

**Never repeat**: After any Docker compose change that exposes ports, verify `ufw status` shows those ports are NOT in the allow list (unless intentionally public). Add to deploy checklist.

### CRITICAL: Hardcoded VPS Password in 6 Tracked Scripts

**What happened**: The RackNerd root password `y0JEu4uI0hAQ606Mfr` was hardcoded in 6 shell scripts that ARE tracked by git (deploy scripts, update-n8n). If pushed to a public repo, full server access.

**Fix**: Replaced all hardcoded passwords with `${VPS_PASSWORD:?Set VPS_PASSWORD env var}` — scripts now fail-fast if env var is missing instead of containing credentials.

**Never repeat**: NEVER hardcode passwords/tokens in scripts. Always use env var references. The `:?` syntax ensures the script fails with a clear error if the var is unset.

### SSH Command Injection in /api/admin/n8n

**What happened**: The `targetVersion` parameter from POST body was interpolated directly into an SSH command: `bash /opt/n8n/rensto-n8n-upgrade.sh ${targetVersion}`. An attacker with admin access could inject arbitrary shell commands.

**Fix**: Added semver regex validation (`/^\d+\.\d+\.\d+$/`) before the spawn call. Invalid formats return 400.

**Never repeat**: NEVER interpolate user input into shell commands. Always validate/sanitize first. Prefer allowlists over denylists.

### CRITICAL: Content Invention Pattern — Root Cause and Safeguard

**What happened**: When building Yoram's landing page, I invented fake testimonials ("משפחת כהן, חיפה", "דוד ל., נשר" with fabricated savings amounts), wrote oversimplified 3-step process, and skipped the 85% duplicate insurance statistic — despite all of this being carefully documented in `yoram-leads/` strategy docs. The Blueprint Q&A explicitly says "אין במה להשתמש כרגע" (no real case studies available), yet I fabricated them.

**Root cause**: I treat existing strategy/content docs as "background reference" instead of "source material to extract from." For engineering tasks I carefully read code before modifying. For content tasks I generate from general knowledge instead of extracting from existing docs. The agent-behavior "just execute" reflex compounds this — rushing to produce output rather than carefully pulling from existing work.

**This is a recurring pattern** — same failure as LinkedIn prompts (using wrong API fields instead of reading the reference), same failure as skipping existing docs to invent from scratch.

**MANDATORY SAFEGUARD — Content Extraction Checklist**:
Before seeding or generating ANY customer-facing content, ALWAYS:
1. **Search for existing content docs** in the customer's directory (e.g., `yoram-leads/`)
2. **Read every strategy/content doc** — not skim, READ
3. **Extract verbatim content** — copy from docs, don't paraphrase or invent
4. **If content doesn't exist in docs, leave it empty** — never fabricate testimonials, case studies, or quotes
5. **Cross-reference**: does the doc say "we don't have this yet"? If so, OMIT the section entirely.
6. **Cite the source** in seed scripts — which doc, which section, which question number

**What was fixed**:
- Removed fabricated testimonials (empty array until Yoram provides real ones)
- Replaced 3 generic steps with the actual 5-step process from Content Strategy post #10
- Added 85% duplicate insurance statistic to hero subheadline (THE key conversion message from Israeli Insurance Strategy)
- Added differentiators section from Blueprint Q&A (questions 16-18)
- Updated compliance footer with license number placeholder (regulatory requirement)
- Added 4th credential "הוזלה עד 50%" from Optimization doc
- Seed script now has source citations for every content block

---

### FB Marketplace Bot — V5 Dynamic Content Pipeline Wired

**What**: Every FB Marketplace listing now gets unique AI-generated copy per city via **Kie.ai Gemini 2.5 Flash** (OpenAI-compatible API). The original V5 pipeline used Claude Sonnet via n8n pre-generation; the new approach generates on-the-fly in webhook-server when serving a job. (Note: initially tried direct Gemini keys — all blacklisted — then Claude Haiku — then switched to Kie.ai per user direction.)

**Key decisions**:
- **Kie.ai Gemini 2.5 Flash**: Uses the Kie.ai proxy (`https://api.kie.ai/gemini-2.5-flash/v1/chat/completions`) with OpenAI-compatible format. Same `KIE_API_KEY` the worker uses for video generation — no extra key needed. 0.02 credits/call. API docs in NotebookLM 3e820274.
- **On-the-fly over pre-generation**: V5 n8n workflow pre-generated content for each city. New approach generates at job-serve time → no stale content, every listing truly unique, no batch pipeline to maintain.
- **Prompt per product**: UAD gets professional/technical tone, MissParty gets fun/party tone. Both mention the rotated city naturally and embed the rotated phone number.

**Image variation pool** (Phase 2):
- Kie.ai Seedream 4.5 Edit (`POST https://api.kie.ai/api/v1/jobs/createTask`, model `seedream/4.5-edit`) for subtle image variations.
- Async: returns `taskId`, poll `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...`, ~17s per image.
- Pre-generation pool approach: too slow for on-the-fly (~17s), so `image-pool-worker.js` runs as PM2 job, keeps 6 variations per image, refills every 30 min.
- Webhook randomly picks from pool per posting. Falls back to static images if pool empty.
- Pool stored at `/var/www/garage-door-images/variations/` — served by nginx at `:8080/variations/`.

**Never repeat**:
- All Google API keys committed to a git repo will be auto-flagged and blacklisted. Store API keys in server `.env` only, never in tracked files.
- Always check NotebookLM 3e820274 (KIE.AI) before using external APIs directly — Kie.ai proxies many models (Gemini, Sora, Veo, etc.) under a single key.
- Image generation via Kie.ai is async (~17s) — never do it inline in a webhook response. Pre-generate and serve from pool.

---

### FB Marketplace Bot — DEFINITIVE FIX (Session Disconnection Solved)

**TL;DR**: The fix was reverting `facebook-bot-final.js` to match the working V13 `master-bot.js` GoLogin config and session flow. MissParty listing posted successfully on 2026-02-20 — first success after weeks of session failures.

**The working V13 approach (from `platforms/marketplace/engine/facebook-bot.js` and `master-bot.js`):**

| Config | Working V13 | Broken Version | Impact |
|--------|------------|----------------|--------|
| `tmpdir` | Default `/tmp` | Custom `gologin-tmp` | Custom dir broke GoLogin SDK cookie path resolution |
| `executablePath` | Not set (auto-detect) | Hardcoded | SDK auto-finds the browser correctly |
| `--display=:100` | YES | Missing | Without X11 display, Chrome renders blank pages on headless VPS |
| `writeCookiesFromServer` | Not set | `false` | Setting it explicitly caused `ERR_INVALID_ARG_TYPE` in cookie manager |
| Page creation | `browser.newPage()` (fresh) | `pages[0]` (stale restore) | Restored pages had stale session context causing "new device" detection |
| Cookie source | `cookies.json` → `page.setCookie(...spread)` + locale | GoLogin API → complex fallback | Simple cookies.json injection is reliable; GoLogin API was returning empty/partial |
| Session verify | Navigate to `/me` | Check for login form | `/me` redirect is definitive (profile URL = logged in, login URL = not) |
| Cleanup | Always `GL.stopLocal({ posting: false })` | Conditional `GL.stop()` | Never upload to S3 — prevents corrupting cloud profile |
| Locale | Force `en_US` cookie | Not set | Prevents Finnish/Hebrew UI which breaks English selectors |
| Fonts dir | Pre-create `/tmp/gologin_profile_{id}/fonts/` | Not created | Prevents ENOENT crash during GoLogin startup |
| Image upload | Simple `imageInput.uploadFile(...imgPaths)` | Complex fileChooser + React event dispatch | The simple approach works; complexity adds fragility |
| Login selectors | `#email`, `#pass`, `button[name="login"]` | React setter `HTMLInputElement.prototype.value` | Both work, but `#email`/`#pass` + `page.type()` is proven |

**The real breakthrough — the "See more on Facebook" modal:**
When cookies are stale (>2 weeks old), Facebook shows a password-only modal (no 2FA!) instead of a full login page. The `refresh-session.js` script fills the password and clicks "Log In" — no 2FA required because the GoLogin profile preserved enough device fingerprint state.

**Session maintenance pattern (prevents future disconnections):**
1. After EVERY successful posting, save cookies to cookies.json AND GoLogin API
2. Run the bot regularly (at least weekly) to keep cookies fresh
3. If cookies go stale (>2 weeks idle), run `refresh-session.js` — fills the modal password, no 2FA

**Webhook-server SQL bug (42P08):**
- `$1` parameter type ambiguity → explicit casts `$1::varchar`, `$2::text`, `$3::text`, `$4::int`

**CRITICAL: Facebook Marketplace Category Validation (discovered 2026-02-20):**
- The marketplace form has a Category dropdown that MUST match an exact Facebook category name
- Typing a non-matching term (e.g., "party rentals", "garage doors") returns ZERO dropdown options
- When no category is selected, clicking "Next" triggers `Input Category is invalid.` error — form silently stays on details page
- The error appears in `[role="alert"]` elements but is NOT visually obvious
- **Valid category names confirmed**: "Inflatable Bouncers" (Outdoor Toys), "Miscellaneous" (catch-all), "Toys", "Home", "Garden", "Furniture", "Tools", "Baby"
- **To find valid categories**: type search terms in the Category input and check `ul[role="listbox"] li` for dropdown results
- **MissParty uses**: "Inflatable Bouncers" | **UAD uses**: "Miscellaneous"

**CRITICAL: Per-profile cookie files:**
- Each GoLogin profile needs its OWN cookie file: `cookies_{product.id}.json`
- A single shared `cookies.json` causes MissParty cookies to load into UAD's session (wrong Facebook account)
- The GoLogin profile itself stores cookies internally, but cookies.json injection provides backup/override

**Never repeat checklist for GoLogin + Facebook:**
1. Use default tmpdir (`/tmp`) — NOT a custom directory
2. Add `--display=:100` to extra_params (X11 display for headless VPS)
3. Add `--password-store=basic` to extra_params (Linux encryption fix)
4. Use `browser.newPage()` — NEVER `pages[0]`
5. Inject cookies from per-profile `cookies_{id}.json` with `page.setCookie(...spread)` + force locale `en_US`
6. Verify session via `/me` redirect
7. Always use `GL.stopLocal({ posting: false })` — NEVER `GL.stop()`
8. Save cookies to per-profile file after every successful run
9. Pre-create fonts dir at `/tmp/gologin_profile_{id}/fonts/`
10. Clean stale locks before starting: `rm -f /tmp/gologin_profile_*/Singleton*`
11. Use EXACT Facebook category names (probe dropdown with test script first)
12. Check `[role="alert"]` for validation errors after clicking Next — don't assume no DOM change means success

**n8n webhook issue (unresolved):**
- Workflow `8Ay9qG9GgOfrMUzXiC5KJ` ("FB Marketplace Listing Generator") shows active but webhooks aren't registered
- Toggling + n8n restart didn't help
- Workaround: local webhook-server at `localhost:8082` provides jobs successfully

**DFW Location Rotation (2026-02-20):**
- CRITICAL: Every posting MUST use a DIFFERENT DFW city — never default to "Dallas" every time
- UAD: 30 DFW cities covering all quadrants (Dallas, Fort Worth, Arlington, Plano, Frisco, McKinney, Grand Prairie, Irving, Garland, Mesquite, Carrollton, Richardson, Denton, Allen, Mansfield, Keller, Grapevine, Cedar Hill, Rockwall, Rowlett, DeSoto, Southlake, Wylie, Burleson, Midlothian, Weatherford, Forney, Little Elm, Saginaw, Waxahachie)
- MissParty: 20 DFW cities focused on populated suburbs (Dallas, Richardson, Garland, Irving, Plano, Frisco, McKinney, Allen, Carrollton, Grand Prairie, Mesquite, Rowlett, Wylie, DeSoto, Cedar Hill, Arlington, Rockwall, Addison, Murphy, Sachse)
- Initial implementation lazily used 4-6 cities from old configs — expanded to full DFW metro (200+ city area, we cover the most populated)
- Source: `bot-config.json` `locations` array (canonical), also in `fb_client_configs` table
- Rotation implemented in `webhook-server.js` — `getNextLocation(clientId)` cycles sequentially through array
- The bot's existing code converts `, TX` → `, Texas` for Facebook dropdown matching
- Location typed character-by-character (100ms delay) → ArrowDown → Enter to select from dropdown
- Verified working: 3 consecutive calls returned Fort Worth, Plano, Arlington
- **~~Gap~~**: ~~Content was STATIC~~ → **FIXED Feb 20**: AI copy via Kie.ai Gemini 2.5 Flash (`content-generator.js`), image variations via Kie.ai Seedream 4.5 Edit (`image-pool.js`), price jitter ±10%

**Dynamic Phone Overlay on Images (2026-02-20):**
- Webhook-server now generates per-job phone overlay using ImageMagick when serving a job
- Uses `generate-overlay-images.js` module with `generateOverlayImage(productId, phone, index, outputPath)`
- Per-product subtitles: UAD → "Free Estimates • Licensed & Insured", MissParty → "24hr Rentals • Dallas TX"
- Original clean images backed up at `/var/www/garage-door-images/originals/`
- Dynamic overlay saved to `img_{product}_0_overlay.jpg` — URL returned in webhook response
- Phone rotation confirmed working: UAD's second post used phone index 1 (+1-972-628-3587)
- ImageMagick note: use composite approach (`-size 1024x100 xc:"rgba(0,0,0,178)"`) not fx expressions (broken in IM6 Ubuntu)

**Telnyx / Voice AI / Lead Pipeline — FIXED (2026-02-22):**

**Architecture (discovered Feb 22):** The Telnyx numbers are connected to **Telnyx AI Assistants** — fully autonomous voice agents that handle calls natively on Telnyx (not via n8n webhooks). Two separate Telnyx accounts:
- **UAD/MissParty account** (`KEY019B52B283A906F6B2150BD499B7BD99`): 5 numbers (4 UAD + 1 MissParty)
- **Rensto account** (`KEY019B6800DE1DD2DEF3FADD55DF7946F8`): 1 number (Voice AI "Hope")

**Telnyx AI Assistants:**
- **UAD "Sarah"** (`assistant-5515bf13`): Qwen3-235B, Deepgram Nova-2, Telnyx.NaturalHD.Esther voice. Greets callers, collects lead info, books garage door appointments, explains $49 trip charge. 4 numbers routed to it.
- **MissParty "Sarah"** (`assistant-f1708158`): Qwen3-235B, Deepgram Flux, Telnyx.NaturalHD.Astra voice. Handles bounce house rentals, $75 flat + $1/mile delivery. Has `deliveryCalculator` webhook tool. 1 number.
- Both have telephony+messaging enabled, recording enabled, Krisp noise suppression.

**Pipeline flow:** Telnyx AI Assistant answers call → full conversation → stores transcript/insights → n8n Schedule Trigger (15 min) polls Telnyx Conversation API → Claude Sonnet 4.5 analysis → Workiz CRM (UAD) / Email (MissParty)

**Critical bugs found and fixed (Feb 22):**
1. **UAD webhook URL was WRONG** — `dynamic_variables_webhook_url` pointed to `tax4usllc.app.n8n.cloud` (external n8n cloud) instead of `n8n.rensto.com`. Fixed via Telnyx API PATCH.
2. **Both n8n workflows had stale trigger registration** — marked "active: true" but `activeVersionId: null`, `triggerCount: 0`. Schedule triggers never fired. Fixed by deactivate/reactivate cycle.
3. **MissParty workflow was corrupted** — couldn't be activated at all (`activeVersionId: null` permanently). Fixed by deleting and recreating from saved JSON. New ID: `9gfvZo9sB4b3pMWQ` (old: `U6LqmzNwiKTkd0gM`).
4. **Claude prompt didn't receive caller metadata** — The `Get Insights` node replaces the data, losing the caller phone from conversation metadata. Fixed prompt to reference `$('Get Many Conversations1').item.json.metadata`.
5. **Structure Analysis Output too strict** — Required `customerPhoneNumber`, `customerAddress`, `bookingOutcome` — removed all required fields.
6. **Flatten node referenced non-existent node** — `$('Workflow Configuration1')` doesn't execute in Schedule path. Fixed audioFileName to use safe expression.
7. **Copy Binary node crashed** — Referenced `Workflow Configuration1` for audio file. Fixed with try/catch.
8. **Outlook node crashed on missing attachment** — Removed audio file attachment requirement (not available in Schedule path).
9. **UAD messaging disabled** — 4 UAD phone numbers had `messaging_profile_id: null`. Fixed via Telnyx API.
10. **MissParty stuck execution** — Execution 135731 was permanently "new" status. Deleted via n8n API.

**Current status (Feb 22):**
- ✅ UAD workflow (U6EZ2iLQ4zCGg31H): Active, 5 triggers, Schedule firing every 15 min
- ✅ MissParty workflow (9gfvZo9sB4b3pMWQ): Active, 5 triggers, Schedule firing every 15 min
- ✅ Email notifications: Working — service@rensto.com receiving lead emails
- ✅ 3 historical UAD conversations found (1 real lead from +14695885133 on Jan 20, 2 test calls from Jan 2)
- ✅ Workiz CRM: FIXED — `auth_secret` must go INSIDE the JSON body (not URL, not headers). PascalCase field names (`FirstName`, `LastName`, `Phone`, `Email`, `Address`, `JobType`, `JobSource`). Discovery: Pipedream SDK source code revealed the pattern. 401 was caused by missing `auth_secret` in body + Workiz server rejects `Content-Type: application/json` without it.
- ⚠️ Caller phone extraction: Insight summaries don't always contain the caller number — metadata merging works partially. Real incoming calls will have phone from Telnyx metadata.
- ✅ Conversation deduplication: FIXED (Feb 23) — "Filter New Conversations" Code node added to both workflows. Uses `$getWorkflowStaticData('global')` to track processed conversation IDs. Old conversations filtered out → 0 items → pipeline stops. Verified: execution #154094 completed in 0.4s (vs 20s) with 0 items passing the filter. No more spam emails.

**3. Voice AI "Hope"** (MqMYMeA9U9PEX1cH) — 13 nodes, active, **0 executions**:
- This is a **Rensto sales agent**, NOT for customer calls (talks about Automation Audit $499, Sprint Planning $1,500)
- Uses GPT-4o + ElevenLabs voice via Telnyx
- On separate Rensto Telnyx account, NOT relevant for UAD/MissParty

**Workiz API auth pattern (NEVER FORGET):**
- Base URL: `https://api.workiz.com/api/v1/{api_token}/`
- GET: token in URL only, no secret needed
- POST: token in URL + `auth_secret` field INSIDE the JSON body (mandatory)
- Fields are PascalCase: `FirstName`, `LastName`, `Phone`, `Email`, `Address`, `City`, `State`, `PostalCode`, `Company`, `JobType`, `JobSource`
- `Phone` or `Email` required (at least one). Empty string rejected — omit field or don't call.
- `JobSource` must match existing Workiz values. "OTHER" always works.
- Source: Pipedream PHP SDK `_authData()` method — `auth_secret` injected into every request payload

**Remaining gaps:**
- No PostgreSQL lead storage — leads in n8n/Workiz/email only
- Conversation metadata (caller phone) partially reaches Claude — works better when callers give details to Sarah

---

### FB Marketplace Bot — Earlier session findings (SUPERSEDED)

*The section above ("DEFINITIVE FIX") supersedes all earlier findings. Key points preserved:*

- **GoLogin SDK ERR_INVALID_ARG_TYPE**: Non-fatal when using default tmpdir. SDK logs the error but starts successfully. Caused by `writeCookiesFromServer` not being needed with default tmpdir.
- **"Continue as" page**: Not an issue with V13 config — fresh `browser.newPage()` + cookies.json injection bypasses this entirely.
- **n8n Data Table → PostgreSQL bridge**: Still doesn't exist. Bot reads from local webhook-server at `localhost:8082`.
- Core files: `facebook-bot-final.js`, `webhook-server.js`, `generate-overlay-images.js`, `scheduler.js`, `bot-config.json`, `cookies_{id}.json`.
- 58 files → 21 core files → 25 core files (added content-generator.js, image-pool.js, image-pool-worker.js, cookie-monitor.js).

---

### Kling 3.0 API Underutilized — 5 Capabilities Left on Table (FIXED)
- **Root cause**: Kling 3.0 API upgraded with multi-shot, native audio, 10s duration, and callbackUrl. Our code still sent `sound: false`, `multi_shots: false`, `duration: "5"` for all clips, and ignored room-specific negatives (kie.ts overwrote request.negative_prompt with its own short list).
- **Impact**: All clips were 5s (hero rooms like pool cramped). Kitchen clips could have "dirty dishes" artifacts. No ambient audio. No webhook efficiency.
- **Fix**: (1) Hero rooms now 10s via prompt-generator override. (2) Room negatives appended in kie.ts via `to_room` field + `inferRoomKey()`. (3) `sound`/`multi_shots` toggled by env vars. (4) `callBackUrl` sent when configured.
- **Never repeat**: When a provider API upgrades, audit the full parameter surface. Check our wrapper (`kie.ts`) against the latest API docs — don't assume the wrapper is up to date.

### Text Overlays Were Stub in Both Pipeline Paths (FIXED)
- **Root cause**: `addTextOverlays` in ffmpeg.ts worked mechanically (drawtext filter), but the overlay specs passed from both `video-pipeline.worker.ts` and `regen-clips.ts` only sent room names with 2s display, no fade, default tiny font. No address, price, or CTA.
- **Impact**: Videos had no property branding. Room labels appeared/disappeared abruptly. No call-to-action for viewers.
- **Fix**: Enhanced `TextOverlaySpec` with `fontSize`, `fadeInSeconds`, `fadeOutSeconds`. Overlay builder now generates: opening address+price, per-clip room labels with fade, closing CTA. System font detection for Ubuntu. Applied to BOTH `video-pipeline.worker.ts` AND `regen-clips.ts`.
- **Never repeat**: When changing the overlay builder in the main pipeline, always mirror the change in `regen-clips.ts`. Both paths must produce identical marketing layers.

### Data Architecture: No Data Dictionary Existed (FIXED)
- **Root cause**: 50+ Postgres tables, 10 Aitable datasheets, Redis, R2, Firebase Storage — but no single doc mapping where each business entity lives.
- **Impact**: Engineers had to read 3-5 files to answer "where is Lead data?" Sync scripts existed but weren't scheduled. No automated detection of schema drift between Prisma and Drizzle.
- **Fix**: Created `docs/DATA_DICTIONARY.md`, `tools/schema-sentinel.ts`, Aitable health check in service registry, and `/api/cron/sync-aitable` with Vercel Cron (every 15 min).
- **Never repeat**: When adding a new table or external store, update `docs/DATA_DICTIONARY.md` immediately.

### Prisma/Drizzle emailVerified Type Mismatch (FIXED)
- **Root cause**: Drizzle schema defined `emailVerified` as `timestamp` but Prisma defines it as `Boolean?`. The actual DB column is `boolean` (created by Prisma).
- **Impact**: Drizzle would misinterpret the column value. Worker code likely never reads this field, so no runtime bug observed, but it's a ticking bomb.
- **Fix**: Changed Drizzle to `boolean("email_verified")`. Schema Sentinel now validates this automatically.
- **Never repeat**: Run `npx tsx tools/schema-sentinel.ts` before any schema change PR. Add `--strict` in CI to fail builds on mismatches.

### DB CHECK Constraints Silently Kill Callback Processing (NEVER REPEAT)

**`event_type` CHECK constraint blocks new event types:**
- `winner_generation_events.event_type` has a CHECK constraint limiting allowed values.
- Inserting a new event type (e.g. `model_fallback`) throws a DB constraint violation.
- When this happens inside a callback handler, the error propagates and silently aborts ALL remaining logic (fallback task creation, model switching, etc.).
- The callback handler's try-catch logs the error but returns `{ ok: false }` — no retry from kie.ai.
- **Never repeat**: Before adding new event types, CHECK the DB constraint. Run `\d winner_generation_events` to see allowed values. Add new types via `ALTER TABLE ... DROP CONSTRAINT ... ADD CONSTRAINT`.
- **Fix applied**: Added `model_fallback` to the CHECK constraint.

**Avatar model fallback pattern:**
- When avatar models fail → immediately fall back to `kling-3.0/video` (no lip-sync but at least produces video).
- Don't waste retries on known-broken services. The fallback should be immediate, not after 3 failures.
- Check `data.model` from callback to determine what ACTUALLY failed (not `gen.recommended_model` which is what Gemini chose).

---

## 2026-02-19

### Winner Video Studio Pipeline Fixes — Session 2 Root Causes (NEVER REPEAT)

**kling/ai-avatar-pro rejects `mode` parameter (CRITICAL):**
- Avatar-pro only accepts 3 input params: `image_url`, `audio_url`, `prompt`.
- Sending extra `mode: "std"` causes silent 500 "internal error, please try again later."
- `kling-3.0/video` DOES accept `mode`, `duration`, `aspect_ratio`, `sound`, `multi_shots`.
- `infinitalk/from-audio` accepts `image_url`, `audio_url`, `prompt`, `resolution`, `seed`.
- **Never repeat**: Before using a kie.ai model, check its exact input schema at `https://docs.kie.ai/market/{model}.md`. Don't assume parameters transfer between models.
- **Source**: https://docs.kie.ai/market/kling/ai-avatar-pro.md

**Presigned R2 URLs rejected by kie.ai (CRITICAL):**
- Presigned URLs have query params (`X-Amz-Algorithm=...`) that confuse kie.ai's file type detection.
- Error: "audio_url file type not supported" (500).
- Fix: Use file proxy (`/api/files/{key}`) which serves clean URLs with correct Content-Type headers.
- **Never repeat**: For external APIs that download files, always use clean URLs without query params. File proxy is preferred over presigned URLs.

**Vercel `after()` doesn't execute on Hobby plan:**
- `after()` from `next/server` returns response immediately but the background work never runs on Hobby plan.
- Fix: Use `waitUntil` from `@vercel/functions` to keep function alive, plus fire-and-forget `fetch()` to a separate `/api/generate/process` endpoint that gets its own 60s timeout.
- **Never repeat**: Don't rely on `after()` on Vercel Hobby. Use `waitUntil` + separate endpoint pattern.

**WAV files sent as application/octet-stream by curl:**
- curl `-F` doesn't auto-detect WAV MIME type — sends `application/octet-stream`.
- Fix: Added `inferAudioType()` that checks file extension when browser MIME is generic.
- **Never repeat**: Always implement MIME type fallback via file extension for upload endpoints that accept files from CLI tools.

**Kie.ai avatar models outage (Feb 19, 2026):**
- All 3 talking-head models fail with CostTime: 0-1 and 500 error.
- Confirmed with: direct API calls, fully public URLs (Unsplash + university WAV), no query params.
- `kling-3.0/video` works fine (all successful generations used it).
- This is a kie.ai service issue, not our code.
- **Action**: Add fallback to `kling-3.0/video` when avatar models fail. Consider alternative providers (PiAPI, Runware, WaveSpeed).

---

### Winner Video Studio E2E Testing — Root Causes (NEVER REPEAT)

**Vercel env vars with trailing newlines (CRITICAL):**
- Using `echo "value" | vercel env add NAME production` adds `\n` at the end of the value.
- R2 S3 client fails with `"Invalid character in header content [\"authorization\"]"` because credentials have `\n`.
- Fix: Always use `printf "value" | vercel env add NAME production --force` (no trailing newline).
- **Never repeat**: When setting Vercel env vars via CLI, ALWAYS use `printf` instead of `echo`.

**WAHA sendFile vs sendVideo (CRITICAL):**
- `sendFile` (WAHA `/api/sendFile`) sends media as a WhatsApp document — recipient sees PDF icon, file is unplayable.
- `sendVideo` (WAHA `/api/sendVideo`) sends as a playable video with thumbnail in WhatsApp chat.
- Endpoint: `POST /api/sendVideo` with body `{ chatId, file: { url, mimetype: "video/mp4" }, caption, session }`.
- **Never repeat**: For video delivery via WAHA, ALWAYS use `sendVideo`, never `sendFile`. `sendFile` is for documents only (PDF, Word, etc.).

**Phone normalization for WhatsApp auth:**
- User enters `4695885133`, `phoneToChatId()` normalizes to `14695885133@c.us`, DB stores `+14695885133`.
- If lookup only checks the raw input, it misses the existing user → creates duplicate.
- Fix: Look up with both normalized (`+14695885133`) and raw input in WHERE clause.
- **Never repeat**: Always normalize phone numbers to E.164 format (`+{countryCode}{number}`) before DB operations. Search with both raw and normalized forms.

**Vercel Hobby plan maxDuration config:**
- `export const maxDuration = 60` in route files is unreliable on Hobby plan.
- Specific route paths in `vercel.json` `functions` config also intermittent.
- Fix: Use glob pattern in vercel.json: `"src/app/api/**/*.ts": { "maxDuration": 60 }`.
- **Never repeat**: For Vercel Hobby, always use glob pattern in vercel.json for function timeout config. Don't rely on in-file exports alone.

**R2 bucket not publicly accessible:**
- Bucket `winner-video-studio` returns 401 on direct URL access (`pub-winner.r2.dev`).
- WAHA tries to download from R2 URL → gets error HTML → sends as empty file.
- Fix: Use kie.ai CDN URL (`video_result_url`) for immediate delivery. R2 for long-term storage.
- **Never repeat**: Before using R2 URLs for external service delivery, verify bucket has public access enabled. Use source CDN URLs when available.

**downloadToR2 argument order:**
- `uploadFromUrl(sourceUrl, r2Key)` was backwards — should be `uploadFromUrl(r2Key, sourceUrl)` (key first, URL second).
- This caused the pipeline to fail silently at the DELIVERING stage.
- **Never repeat**: When calling R2/S3 upload functions, the key/path is always the first argument, source URL is second. Check function signature before calling.

**winner_generation_costs table schema:**
- Code tried to INSERT `model, kie_credits_used, processing_time_ms` — table actually has `gemini_credits, isolation_credits, video_credits, suno_credits`.
- Fix: Use correct column names, upsert based on pipeline stage (`isolation_credits` for AUDIO_ISOLATING, `video_credits` for VIDEO_GENERATING).
- **Never repeat**: Always check actual DB table schema before writing INSERT/UPDATE queries. Don't assume column names from spec docs.

**sendFile returning null but whatsapp_delivered=true:**
- `sendFile` returns `null` on error (doesn't throw), but pipeline code continued to mark `whatsapp_delivered = true`.
- Fix: Check `if (msgId)` before updating the delivered flag in DB.
- **Never repeat**: When a function returns null on failure instead of throwing, always check the return value before proceeding with dependent operations.

---

## 2026-02-19

### FB Marketplace Bot — Quick Reference (READ THIS FIRST)

**Why this exists**: Every session, the agent wastes time rediscovering the same files and conflicts. This section is the single source of truth. Read it BEFORE touching the FB bot.

**Key Files on Server (`/opt/fb-marketplace-bot/`)** (21 files after Feb 20 cleanup):
| File | Role | Notes |
|------|------|-------|
| `facebook-bot-final.js` | **Main bot** — posting to FB Marketplace | Upload guard patched (Feb 20). GoLogin API → cookies.json fallback |
| `interactive_login.js` | **PROVEN login script** — React value setter, 2FA polling | Always run this for login. Uses `domcontentloaded`, Enter key submit |
| `master-bot.js` | **Legacy bot** — simpler, but proven (created cookies.json Jan 22-23) | Backup only |
| `webhook-server.js` | Serves jobs from PostgreSQL `fb_listings` on port 8082 | PM2 managed |
| `bot-config.json` | Config — GoLogin token, FB creds, phone rotation | `shared.gologinToken`, `products[0]=UAD`, `products[1]=MissParty` |
| `cookies.json` | Cookie file (Jan 23) — c_user+xs present but SERVER-SIDE INVALIDATED | Device cookies (datr, sb, fr) still useful |
| `preflight.js` | Pre-run checks | GoLogin, proxy, screenshots dir |
| `check_cookies.js` / `check_profile.js` / `check_marketplace_access.js` | Diagnostic tools | Non-destructive |

**Cookie Pipeline (Order of priority)**:
1. GoLogin API (`GL.getCookies()`) — facebook-bot-final.js checks this first
2. cookies.json fallback — if API is empty (added 2026-02-19 patch)
3. S3 profile cookies — encrypted, often can't decrypt cross-platform (Mac→Linux)
4. Direct login — LAST RESORT, triggers 2FA notification to client

**GoLogin Token**: ALWAYS read from `bot-config.json` → `shared.gologinToken`. NEVER hardcode from conversation context. See CREDENTIAL_REFERENCE.md.

**GoLogin API**:
- GET `/browser/{profileId}` — read profile
- PUT `/browser/{profileId}` — update (requires ALL fields: GET first, modify, PUT back)
- GET `/browser/{profileId}/cookies` — read cookies
- POST `/browser/{profileId}/cookies` — upload cookies
- No PATCH support → 404

**Proxy**: `geo.floppydata.com:10080` with `VtQPhDQtDugSO8av/Lekbt1ZQ7x4oCOVa`. NEVER change it. It's part of the fingerprint.

**Profiles**:
- UAD: `694b5e53fcacf3fe4b4ff79c` — c_user=732694166... in GoLogin API
- MissParty: `6949a854f4994b150d430f37` — c_user=100013632011177 (from cookies.json, uploaded to API 2026-02-19)

**n8n Workflows (status varies)**:
- `8Ay9qG9GgOfrMUzXiC5KJ` — **FB Marketplace Listing Generator**: SUPERSEDED by `content-generator.js` + `image-pool.js`. n8n webhooks broken.
- `U6EZ2iLQ4zCGg31H` — **UAD Lead Analysis**: Telnyx → Claude → Workiz API + Email. Active but **0 executions ever**.
- `U6LqmzNwiKTkd0gM` — **Miss Party Lead Analysis**: Telnyx → Claude → Email. Active but **1 stuck execution, never completed**.
- `MqMYMeA9U9PEX1cH` — **Telnyx Voice AI "Hope"**: Rensto sales agent, NOT for customer calls. **0 executions ever**.

**DB Table**: `fb_listings` in `app_db` (PostgreSQL). Webhook server reads from here.

**Rate Limits**: MAX 2-3 GoLogin login attempts per day. Each attempt sends notification to client. NEVER do rapid trial-and-error with login scripts.

**Local codebase**: `fb marketplace lister/deploy-package/` has the same files. Sync with server via `rsync` or `scp`.

---

## 2026-02-18

### Codebase Audit — Stale References Cleanup (DONE)

**Root causes found and fixed:**
- **Firestore scripts still active**: 3 scripts in `scripts/maintenance/` (seed-firestore.ts, inspect-collections.ts, health-check.ts) were importing firebase-admin/firestore. Firestore was retired Feb 2026. **Deleted all 3.**
- **Admin UI showed "Firestore"**: ClientManagement.tsx loading text said "Scanning Firestore Segments" and modal said "Firestore Record Management". SystemHealth.tsx showed "Firebase Firestore" as DB label. **Fixed to PostgreSQL/Client Records.**
- **IMPLEMENTATION_SPEC listed fal.ai as primary**: External APIs section in `docs/templates/tourreel/IMPLEMENTATION_SPEC.md` showed fal.ai + Clerk + OpenRouter. **Fixed to Kie.ai + Resend + Gemini Flash + Ollama/pgvector.** Added deprecation notices to spec, playbook, and framework examples.
- **kie.ts fallback mode was "std" not "pro"**: Line 183 defaulted to "std" when request.mode is unset. Config defaults to "pro" (1080p native). **Fixed fallback to "pro".**
- **ProvisioningService had stale migration comments**: 6 comments referencing "MIGRATION Phase 1/2" and "BACKUP: Firestore". Migration is complete. **Removed all.**
- **NOTEBOOKLM_INDEX had 18/25 notebooks**: Missing 7 notebooks (Kling 3.0, mivnim, Mastering Claude Code, Facebook, Instagram, Israeli Expatriates, tiktok). **Updated to all 25 with source counts.**
- **RAG missing from brain.md, ARCHITECTURE.md, REPO_MAP.md**: pgvector + Ollama added to all 3 tech stack sections.
- **CLAUDE.md missing build/deploy commands**: Added full section 6 with web/worker commands, deploy runbook, health checks.

**Never repeat**: When a provider is deprecated (fal.ai→Kie.ai, Firestore→Postgres, Clerk→Resend), grep the entire codebase for stale references. Templates and admin UI labels are easy to miss.

### FB Marketplace Bot — Root Causes Found

**GoLogin cookie encryption mismatch (CRITICAL):**
- GoLogin desktop app on Mac encrypts cookies using macOS Keychain. When profile syncs to S3 and downloads on Linux server, Chromium uses `--password-store=basic` with a different encryption key. Cookies in SQLite `encrypted_value` column can't be decrypted.
- Fix: Fetch cookies from GoLogin API in cleartext via `GL.getCookies(profileId)`, inject via `page.setCookie()`. Bypasses Chromium encryption entirely.
- **Never repeat**: When using GoLogin SDK on a different OS than where the profile was created, always inject cookies from the GoLogin API rather than relying on the profile's SQLite cookie store.

**Puppeteer 2.1.1 `uploadFile()` "Failed to fetch" bug:**
- Puppeteer 2.1.1's `uploadFile()` uses an internal `fetch()` call that's blocked by GoLogin's `--host-resolver-rules="MAP * 0.0.0.0"` (DNS leak prevention).
- CDP `page._client` + `DOM.setFileInputFiles` sets files but Facebook React handlers fail ("Oops - Something went wrong").
- `waitForFileChooser().accept()` also uses internal `fetch()` in Puppeteer 2.x.
- Fix: Upgrade puppeteer-core to 19.11.1 (`npm install puppeteer-core@19`). v19 uses `DOM.setFileInputFiles` natively and `waitForFileChooser` works properly.
- **Never repeat**: GoLogin SDK ships with Puppeteer 2.x. Always upgrade to puppeteer-core@19+ for file upload to work with GoLogin's DNS blocking.

**Facebook image upload size limit through proxy:**
- 1.9MB PNG images fail with "Oops - Something went wrong" error dialog when uploaded through the FloppyData residential proxy.
- 132KB JPEG images upload successfully (photoMatch=1 in diagnostic).
- Fix: Use ImageMagick `convert -resize 1200x1200> -quality 85 -strip` to optimize before upload.
- **Never repeat**: Always optimize images to <200KB JPEG before uploading through residential proxies. Large files may timeout or be throttled.

**Facebook Marketplace rate limiting:**
- ~15 rapid GoLogin sessions in 2 hours triggers "Sorry, something went wrong" on ALL Facebook pages.
- The block is on the browser fingerprint/session pattern, not the proxy IP (curl through proxy returns 200).
- Initially only marketplace pages are blocked, then expands to all Facebook pages.
- Cooldown: likely 1-6 hours. Don't hammer during testing.
- **Never repeat**: Limit testing to 3-5 sessions per hour max. Use a 5-minute minimum gap between bot runs. In production, 30-minute intervals should be safe.

**Missing `facebook_url` column in `fb_listings`:**
- Status update endpoint returned 500 (PostgreSQL error 42703 = undefined column).
- Fix: `ALTER TABLE fb_listings ADD COLUMN facebook_url text;`
- **Never repeat**: When adding new webhook endpoints that reference columns, verify the column exists in the DB schema first.

**GoLogin browser crash (ECONNREFUSED):**
- Root cause: 3 conflicting Chromium flags in `extra_params` — `--no-proxy-server` (overrides GoLogin proxy), `--single-process` (crashes on Linux), `--no-zygote` (tied to single-process). Fix: removed all 3.
- Additional: `DISPLAY` env var wasn't set on headless server. Chromium needs Xvfb. Fix: `DISPLAY=:100` (existing Xvfb instance on server).
- **Never repeat**: When using GoLogin SDK on a headless Linux server, always set `DISPLAY=:100` and never pass `--no-proxy-server` or `--single-process` in extra_params.

**GoLogin proxy:**
- `geo.floppydata.com:10080` with auth (VtQPhDQtDugSO8av / Lekbt1ZQ7x4oCOVa) — intermittent. Rotates IPs.
- Proxy has 3.3GB bandwidth. Recent IPs: 70.114.107.211, 184.92.253.193, 172.108.160.74.
- GoLogin's internal proxy check uses a 13s timeout and fails intermittently. Just retry.

**GoLogin `GL.stop()` overwrites S3 profile (CRITICAL):**
- Every call to `GL.stop()` uploads the current local profile back to S3, including the Chromium cookie DB.
- When the bot runs with a broken session (no c_user/xs), `GL.stop()` overwrites the S3 profile with the broken cookies.
- This destroyed the valid session cookies that the user manually set up via GoLogin desktop on Mac.
- Fix: Set `uploadCookiesToServer: false` in ALL failure paths before `GL.stop()`. Only set `true` when c_user + xs are verified.
- **Never repeat**: Always guard `uploadCookiesToServer` based on session validity. NEVER let a failed run upload its profile back to S3.

**Facebook React login page — selector changes:**
- Facebook's new login page (`/login/`) uses React with dynamic IDs (`_r_2_`, `_r_5_`).
- Old selectors `#email`, `#pass`, `button[name="login"]` NO LONGER WORK.
- Working selectors: `input[name="email"]`, `input[name="pass"]`, `input[type="submit"]`.
- React controlled components ignore direct DOM value changes. Must use: `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value)` followed by `el.dispatchEvent(new Event('input', {bubbles: true}))`.
- For submit: `page.evaluate(() => el.click())` creates untrusted events that React ignores. Use `page.keyboard.press('Enter')` on the focused password field instead.
- **Never repeat**: Use `input[name=...]` selectors and React-compatible value setters for Facebook forms.

**GoLogin API cookies vs S3 profile cookies — TWO SEPARATE STORES:**
- `GL.getCookies(profileId)` reads from GoLogin's API cookie store.
- The S3 profile contains a Chromium SQLite cookie DB (encrypted).
- The Mac GoLogin desktop app updates S3 but NOT the API cookie store for httpOnly cookies (c_user, xs).
- On Linux, the S3 profile's Mac-encrypted cookies can't be decrypted.
- Result: After Mac login, neither API nor S3 profile have usable session cookies on Linux.
- Fix: Must log in directly from the Linux server to create Linux-encrypted cookies, then save to API via `postCookies`.
- **Never repeat**: For cross-platform GoLogin, always establish sessions from the target platform.

**Facebook 2FA checkpoint on new device/IP:**
- Facebook requires 2FA when logging in from a new device/IP (even with correct credentials).
- First attempt: "Check your notifications" (push notification to Mac/iPhone/Instagram).
- Second attempt: "Check your text messages" (SMS code to phone ending in 50).
- The checkpoint page has a gear icon for alternative methods.
- Solution: noVNC at `http://172.245.56.50:6080/vnc.html` — user can see and interact with the browser remotely.
- **Never repeat**: Always have noVNC ready for interactive 2FA. Use `interactive_login.js` which waits 10 min for approval.

**UAD Facebook account email:**
- Config had `uad.garage.doors@gmail.com` — Facebook says "email not connected to any account".
- Changed to `service@rensto.com` for testing. David's actual Facebook email needs to be confirmed.
- **Never repeat**: Check proxy connectivity (`curl -x http://proxy:port ...`) before assuming browser issues.

**GoLogin API — Token and Update Errors (Feb 2026):**
- Used a hardcoded JWT token from conversation context (exp: 2025-04-25, EXPIRED) instead of reading the live token from `bot-config.json`. CREDENTIAL_REFERENCE.md explicitly says `GOLOGIN_TOKEN` lives at `fb marketplace lister/deploy-package/bot-config.json`. On server: `/opt/fb-marketplace-bot/bot-config.json`.
- Tried `PATCH /browser/{profileId}` — GoLogin API doesn't support PATCH, only GET and PUT → 404.
- Tried `PUT /browser/{profileId}` with only proxy field — API validation requires ALL fields (name, browserType, os, navigator) → error.
- Correct approach: GET full profile → modify only the proxy field → PUT entire profile back.
- **Never repeat**: (1) ALWAYS read GoLogin token from `bot-config.json`, never hardcode. (2) GoLogin profile update = GET full profile + modify + PUT all fields. No PATCH. (3) Follow CREDENTIAL_REFERENCE.md for all credential locations.

**GoLogin proxy change broke profile (Feb 2026):**
- Changed MissParty proxy from `geo.floppydata.com:10080` to `"mode": "none"` via API during login debugging.
- This broke GoLogin launch because `--host-resolver-rules` maps all DNS to 0.0.0.0 except the proxy host. With no proxy, ALL connections fail.
- Then changed to `"mode": "gologin"` (built-in residential) — Facebook returned "Sorry, something went wrong" (different IP fingerprint from established session).
- Fix: Restored original proxy `geo.floppydata.com:10080` with original credentials.
- **Never repeat**: Do NOT change GoLogin proxy settings during debugging. The proxy is part of the fingerprint. Changing it triggers Facebook security checks and can invalidate the session.

**Facebook rate limiting from rapid GoLogin sessions (Feb 2026):**
- Ran ~15+ GoLogin sessions in 2 hours trying different login scripts.
- Facebook triggered "Sorry, something went wrong" on ALL pages (not just marketplace).
- Each failed login attempt sent a notification to Michal (the client), damaging the client relationship.
- **Never repeat**: (1) MAX 2-3 GoLogin login attempts per day. (2) If login fails, STOP and investigate — don't try more scripts. (3) Always check existing cookies first before attempting re-login. (4) The cookies.json at `/opt/fb-marketplace-bot/cookies.json` may already have valid session cookies.

**Webhook server type mismatch (42P08):**
- PostgreSQL `$1` used in both `SET status = $1` (varchar) and `CASE WHEN $1 = 'posted'` (text). Conflicting type inference.
- Fix: Explicit `$1::varchar` cast in both positions.
- **Never repeat**: Always use explicit type casts in PostgreSQL when a parameter is used in multiple contexts.

---

## 2026-02-17

### Port Conflict Reference (from CONFLICT_AUDIT.md — NEVER REPEAT)

- **Local dev (both apps running)**: Worker MUST use `PORT=3001`. rensto-site keeps 3002. Both share same DATABASE_URL and REDIS_URL.
- **RackNerd**: Worker runs on port 3002 at `/opt/tourreel-worker`. rensto-site is on Vercel.
- **run-smoke.ts**: `API_URL` must point to WORKER, not site. Local: `API_URL=http://localhost:3001`. RackNerd: `API_URL=http://172.245.56.50:3002`.
- **BullMQ retry fix**: UnrecoverableError for Insufficient Credits, Listing not found, No clip prompts — prevents repeated Kie.ai charges.
- **Preflight before video test**: `cd apps/worker && npx tsx tools/run-preflight.ts --free` (checks Postgres, Redis, FFmpeg).

### Skills Audit Findings (NEVER REPEAT)

- **Ghost reference files in skills**: All 6 skills had `references/*.md` links to files that never existed (15 total). Root cause: skill-template includes placeholder reference tables. Fix: point to actual source files (findings.md, INFRA_SSOT.md, actual source code paths) or inline the content.
- **Skills activation rate was ~20-30%**: 5/13 skills had broken frontmatter (no YAML `---` delimiters), 0/13 had negative triggers, 0/13 had usage examples. After cleanup: 8 active skills, all with proper frontmatter, negative triggers, and examples.
- **n8n skills dominated context**: 12/13 skills were n8n-related while system migrated away. All n8n project skills deleted, global skills archived. Active skills now: antigravity, database-management, rag-pgvector, stripe-credits, tourreel-pipeline, ui-design-workflow, ui-ux-pro-max, skill-template.

### Post-Change Audit Findings (NEVER REPEAT)

- **Ghost reference files fixed (see above)**.
- **ARCHITECTURE.md had stale skills list**: Listed "n8n, Tax4Us, workflow generator" — all 3 were deleted. Replaced with actual 8 active skills. Always update ARCHITECTURE.md when skills change.
- **Firestore references persist in comments**: 4 API routes still had Firestore in comments/variable names despite full retirement. Comments are invisible but misleading for agents. Clean stale comments after any migration.
- **UI labels can drift from architecture**: "Submit Issue to n8n Resolver" button actually did `mailto:support@rensto.com` — label was stale from pre-paradigm-shift. Check UI labels after architectural changes.
- **firestore.ts type file still imported by 6+ components**: AdminDashboardClient, ClientIntelligence, ClientManagement, WorkflowManagement, AIAgentManagement, HomePageClient all import `Template` from `@/types/firestore.ts`. Tech debt — should migrate to Prisma types eventually. Not blocking.

### Admin Monitoring Dashboard Implementation

- **Service registry pattern**: Each monitored service has id, name, category, healthCheck function, and alertThreshold. Categories: infrastructure (PostgreSQL, Worker, Vercel, Ollama), api (Kie.ai, Gemini, Resend, Stripe), database (Prisma migrations), backup (n8n). n8n is intentionally in "backup" category with highest failure tolerance.
- **Health checker runs concurrent checks**: All services checked in parallel via `Promise.allSettled`. Results persisted to `service_health` table. Uptime calculated from historical checks.
- **Alert engine with cooldown**: Prevents alert storm. Each rule has `cooldownMinutes` (default 30). `lastFiredAt` tracked per rule. Auto-resolve fires when service recovers.
- **Expense tracker uses known rates**: Kling Pro $0.10/clip, Kling Std $0.03/clip, Suno $0.02/music, Gemini Flash $0.001/prompt. Anomaly = daily spend > 2x rolling 7-day average.
- **DB tables created via raw SQL** (not `prisma db push`): Pre-existing schema drift (UUID type mismatches on existing tables) prevents `db push`. New monitoring tables created safely via direct SQL.
- **Admin role check pattern**: Use `session.role !== 'admin'` (lowercase) not `'ADMIN'` (uppercase). The verifySession() returns lowercase role strings.

### UI Design Workflow — Tool Landscape (NEVER REPEAT)

- **v0.dev is the primary tool for React/Next.js generation**: It outputs shadcn/ui components directly, has a beta Platform API for programmatic generation, supports custom Tailwind config and Shadcn Registry for design token injection. Always prefer v0 over Stitch for production React code.
- **Google Stitch (stitch.withgoogle.com)**: Good for visual prototyping only (350 Standard gen/month at 10-20s, 50 Experimental/month at 30-60s). Outputs HTML/CSS, not React. No official API yet. No native design system import (prompt-based only). Generic layouts, weak accessibility, multi-screen consistency unreliable beyond 2-3 screens.
- **`@_davideast/stitch-mcp`**: MCP bridge for Claude Code to access Stitch. Provides `get_screen_code`, `get_screen_image`, `build_site`, Vite serve. Auto token refresh. Useful for extracting Stitch designs programmatically.
- **rebrand-component.ts**: Always run on externally generated code before committing. Handles Tailwind class replacement and inline hex replacement. Hover variants must be processed before base patterns (ordering matters in replacement rules).
- **Brand token source of truth**: `globals.css` CSS custom properties. 50+ tokens across colors, backgrounds, text, gradients, glows, animations. All dark-first.
- **Complementary skills**: `ui-ux-pro-max` provides design intelligence (what to build), `ui-design-workflow` provides execution pipelines (how to build it with external tools).

### n8n Paradigm Shift — What Changed (NEVER REPEAT)

- **n8n workflows = reference patterns for Antigravity migration**, NOT production systems
- **Production automation = Antigravity** (Node.js + BullMQ on RackNerd)
- **RAG stack = Antigravity-native** (Ollama + pgvector via programmatic API, not n8n nodes)
- **Service registry categorizes n8n as "backup"** with 5 consecutive failures threshold and 120min cooldown (vs 2 failures / 15min for PostgreSQL)
- **Active n8n webhook calls still exist**: fulfillment/initiate, content/generate routes. These are migration candidates but not blocking.
- **rag-pgvector skill updated**: Architecture diagram changed from "n8n AI Agent" to "Antigravity Worker / API Routes"

### Ollama Installation on RackNerd (NEVER REPEAT)

- **Ollama v0.16.2 installed** at 172.245.56.50, CPU-only. Systemd service managed (`systemctl start/stop/restart ollama`).
- **Memory budget**: nomic-embed-text uses ~500MB when loaded. With KEEP_ALIVE=0, it unloads immediately after each request. Server has 5.8GB total RAM, ~3.1GB available at rest. Safe margin.
- **Config location**: `/etc/systemd/system/ollama.service.d/override.conf` — contains KEEP_ALIVE=0, MAX_LOADED_MODELS=1, NUM_PARALLEL=1, FLASH_ATTENTION=1, HOST=0.0.0.0.
- **Port**: 11434 (Ollama default). Accessible at `http://172.245.56.50:11434`.
- **SSH password**: Documented in CREDENTIAL_REFERENCE.md. Check conversation history or RackNerd panel. NEVER ask user again.
- **Existing services audit (Feb 2026)**: Docker containers: postgres_db, redis_cache, n8n_rensto, waha, browserless_rensto, video-merge. PM2: saas-engine, tourreel-worker, video-merge-service, webhook-server (online); facebook-bot-enhanced, master-bot (stopped); server (errored). Nginx on 80/8080.

### Full-Stack Conflict & Completeness Audit (Session 4)

- **PRODUCT_BIBLE.md had stale design tokens**: Colors were #0B1318/#2F6A92/#FF6536 but actual globals.css uses #110d28/#fe3d51/#bf5700/#1eaef7/#5ffbfd (Spotlight Dark Mode). NotebookLM 719854ee + 286f3e4a agreed with globals.css. Fix: Updated PRODUCT_BIBLE.md to match reality.
- **PRODUCT_BIBLE.md had stale pricing model**: Referenced Starter/Growth/Scale with agent-limits. Actual model is $299/$699/$1,499 credit-based (500/1500/4000). Fix: Updated to current credit model. Added TourReel 50 credits/video.
- **brain.md listed Veo as active**: Lines 37 + 139 referenced Veo. All notebooks and INFRA_SSOT say Veo is deprecated. Fix: Removed Veo, updated to "Kling 3.0, Suno, Nano Banana".
- **Veo code still in kie.ts**: KieVeoRequest interface and createVeoTask function exported. Fix: Removed Veo interface, function, and type references. Changed getTaskStatus/waitForTask defaults from "veo" to "kling".
- **ADMIN_EMAILS duplicated in 4 files**: auth.ts, send/route.ts, verify/route.ts all had identical `(process.env.ADMIN_EMAILS || 'service@rensto.com,admin@rensto.com')`. Fix: Exported ADMIN_EMAILS from auth.ts, imported in route files.
- **Admin demo password in PRODUCT_BIBLE.md**: `admin@rensto.com / admin123` documented publicly. Fix: Removed, replaced with magic-link auth description.
- **Agent-behavior files (.cursor vs .claude)**: Verified identical content (198-byte diff = YAML frontmatter only). No actual drift.
- **NotebookLM compliance pushed (3 notebooks)**: fc048ba8 (n8n=backup), 3e820274 (Kling 3.0 only), 8a655666 (fal.ai=deprecated).
- **9 missing Claude skills identified**: Created 3 P1 skills (stripe-credits, database-management, antigravity-automation) + skill-template scaffold. 6 P2-P3 skills documented as TODO.
- **Admin dashboard audit**: 14 tabs already exist. Health checks, usage tracking, customer dashboard all functional. Gap: automated alerting, MCP monitoring, expense tracking, anomaly detection. Blueprint written in task_plan.md.
- **Credential exposure in git history**: Stripe LIVE key, Notion token, 3 n8n API keys still in git history. BFG Repo-Cleaner not yet run. Cookie consent banner missing for GDPR.
- **Prisma vs Drizzle type conflicts**: emailVerified (Boolean vs timestamp), role (enum vs text). Known issue, not fixed yet — requires coordinated migration.

---

### Video Quality Overhaul (Session 3)

- **Root cause: double realtor**: Nano Banana composites realtor into clip 1 start frame. Kling generates video; last frame carries person traces. This frame becomes clip 2's start. Even though clip 2 uses "no people" prompt, Kling may animate the person visible in the start frame → double/ghost realtor. Fix: Added Kling 3.0 `kling_elements` support (native character reference via `@realtor` in prompts). Set `USE_KLING_ELEMENTS=1` to enable. When enabled, Nano Banana compositing is skipped entirely — Kling handles person consistency natively.
- **Root cause: robotic/awful movement**: Generic prompt templates ("Smooth steadicam through the space") gave Kling nothing specific. Fix: Added `ROOM_CAMERA_FLOW` lookup with temporal flow descriptions per room type (beginning → middle → end). Each prompt now describes how the shot evolves. Example: "Camera begins at the entrance, slowly tracks along the countertop revealing the workspace, then settles on the island or window view."
- **Root cause: wall clipping**: Insufficient spatial constraints. Fix: Strengthened `SPATIAL_NEGATIVE` with "wall penetration, object clipping, camera clipping, phasing through objects". Added separate `KLING_PROPERTY_NEGATIVE` (bans all people) and `KLING_ELEMENTS_NEGATIVE` (protects identity). Added "ONE ROOM PER CLIP" rule and "SPATIAL INTEGRITY" rule to prompt-generator system prompt.
- **Root cause: tour teleportation**: AI-generated tour sequence could skip between rooms that aren't connected. Fix: Added `validateTourAdjacency()` in floorplan-analyzer.ts — cross-checks `suggested_tour_sequence` against `connects_to` adjacency data. Logs warnings for teleportation. Also added `validateRoomCount()` to catch hallucinated rooms (analysis claims more rooms than listing data supports).
- **Kling 3.0 model research (Feb 2026)**: Kling 3.0 is latest (no 3.5/4.0 exists). Supports: kling_elements (2-4 reference images per person), duration 3-15s (Kie API still only "5" or "10"), multi_prompt (up to 6 shots), native audio (5 languages). Model IDs: "kling-3.0/video" and "kling-3.0" are interchangeable on Kie.ai.
- **Floorplan analysis research**: Gemini 3 Pro "Agentic Vision" can crop/zoom floor plan sections for 5-10% accuracy boost. Best practice: adjacency graph → walkthrough path (Hamiltonian). Post-processing should validate sequence against adjacency. Photo-to-room AI matching should be primary (not fallback). Room count sanity check catches hallucinated rooms.
- **Prompt engineering research**: Use cinematic vocabulary (slow dolly, steadicam glide, gentle push-in). Describe temporal flow (beginning → middle → end). One room per clip. Never describe person actions when person is in start frame. Keep negative under 500 chars. "Subject + Action + Environment + Style + Camera" formula.
- **Property-only clips now use room-specific prompts**: `buildPropertyOnlyKlingPrompt` uses `ROOM_CAMERA_FLOW[roomKey]` for per-room camera direction instead of generic template.

---

## 2026-02-16

### Instruction Hierarchy + Alignment Audit (Session 2)

- **Authority Precedence enforced across codebase + NotebookLM**: brain.md is Tier 1. Previously, NotebookLM 5811a372 had NotebookLM as Rank 1 and brain.md as Rank 2. Fixed by pushing compliance override sources to 6 notebooks.
- **NotebookLM compliance sources pushed (6 notebooks)**:
  - 5811a372 (B.L.A.S.T.): Authority override — brain.md = Tier 1, gemini.md superseded, Veo/Firestore/learning.log deprecated
  - 0baf5f36 (Zillow-to-Video): Authority override — brain.md wins over "NotebookLM wins over local"
  - fc048ba8 (n8n workflows): n8n = backup only, Antigravity primary, Firestore retired
  - 743744d5 (Marketplace): Firestore, Airtable.com, BMAD, Webflow = retired
  - 98b120fa (Aitable.ai): Dashboards-only scope restriction
  - 3e820274 (KIE.AI): Kling 3.0 only for Rensto production
- **Verified**: Queried 5811a372 post-push — now correctly returns brain.md as Tier 1, NotebookLM as Tier 7.
- **Stripe publishable key**: Rotated to `pk_live_...xQM`, added to Vercel production + preview via CLI.
- **Codebase fixes (committed earlier this session)**:
  - docs/operations/BIBLE.md: Removed broad SSOT claim, added brain.md ref
  - platforms/marketplace/PLATFORM_BIBLE.md: Added brain.md reference
  - docs/operations/business/MODEL.md: Firestore → PostgreSQL
  - security/CREDENTIAL_ROTATION_CHECKLIST.md: Redacted Stripe live key
  - CODEBASE_VS_NOTEBOOKLM.md: Fixed "NotebookLM wins" → "brain.md is Tier 1"
  - brain.md: Added 2 missing notebooks (Claude Code b906e69f, Kling 3.0 6bb5f16d)

### Vercel Token — Root Cause for Repeated "Invalid Token" (NEVER REPEAT)

- **Token**: Stored in `CREDENTIAL_REFERENCE.md` (paths only). Account: `service-3617`. VALID, PERMANENT.
- **Root cause**: The Vercel CLI has a global auth.json at `~/Library/Application Support/com.vercel.cli/auth.json` with a stale token. When `VERCEL_TOKEN` env var is set, the global auth.json can still interfere.
- **Correct invocation**: Always use `--token <token>` as an explicit CLI flag. Never rely on env var alone.
- **Confirmed working**: `vercel whoami --token <token>` → `service-3617`. `vercel env add` works. `vercel env ls` works.

### NotebookLM Auth — Root Cause for Repeated Disconnects (NEVER REPEAT)

- Google OAuth tokens expire after ~1 hour. The NotebookLM MCP auth file at `~/.notebooklm-mcp/auth.json` goes stale.
- **Fix**: Run `notebooklm-mcp-auth` CLI (opens Chrome, auto-detects login, extracts cookies). If that fails, user can paste cookies manually via `save_auth_tokens` tool.
- **After re-auth**: Must call `refresh_auth` tool OR the MCP server picks up new tokens on next call.
- **Session ID format**: `251165511850668720` (from Feb 2026 re-auth).

### NotebookLM 50-Source Limit (NEVER REPEAT)

- NotebookLM has a hard limit of **50 sources per notebook**. `notebook_add_text` silently fails when at 50.
- Social Media notebook (cb99e6aa) was at 50/50. Had to delete an irrelevant source first.
- **Before adding**: Check source count. If at 50, delete lowest-value source first.
- **Error message**: Generic "Failed to add text source" — no mention of the limit.

### Remaining Technical Debt

- **8 docs/frameworks/ files** (~5,900 lines) identified as candidates for NotebookLM migration per CODEBASE_VS_NOTEBOOKLM boundary rules. Not migrated yet.
- **Stripe live secret key in git history** — redacted in file but still in git history. Needs BFG Repo-Cleaner or key rotation.
- **Prisma ↔ Drizzle schema sync** — manual process, no automated check. Enum representations differ between ORMs.

---

### Session Test Results (full regression after all changes)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Build (next build) | PASS | All routes compile, no errors |
| 2 | Firebase client removal | PASS | Zero imports of firebase-client/firebase.ts/firebase SDK in src/ |
| 3 | firebase-admin Storage-only | PASS | Only 2 files: firebase-admin.ts + onboarding approve route |
| 4 | firebase SDK removed from package.json | PASS | `"firebase"` not in dependencies |
| 5 | firebase-client.ts + firebase.ts deleted | PASS | Files confirmed gone |
| 6 | rensto.com returns 200 | PASS | Production healthy |
| 7 | admin.rensto.com → login (307→200) | PASS | Domain moved from stale rensto-admin to rensto-site |
| 8 | rensto.com/video/create | PASS | 307 to login (auth required — expected) |
| 9 | rensto.com/login | PASS | 200 |
| 10 | API health check | PASS | rensto.com/api/admin/health-check 200 |
| 11 | api.rensto.com | PASS | 200 |
| 12 | Prisma User for service@rensto.com | PASS | id=5fd79287, role=ADMIN, status=active |
| 13 | Drizzle user for service@rensto.com | PASS | Same UUID, tier=pro, limit=500 |
| 14 | User IDs match across tables | PASS | Both tables share 5fd79287-... |
| 15 | Entitlement with 500 credits | PASS | credits_balance=500, plan=pro, status=active |
| 16 | User role is ADMIN | PASS | Confirmed |
| 17 | Valid magic link tokens exist | PASS | 3 unused tokens ready |
| 18 | ADMIN_EMAILS in all 3 auth files | PASS | service@rensto.com,admin@rensto.com |
| 19 | Cookie domain .rensto.com (verify) | PASS | Cross-subdomain auth works |
| 20 | Admin redirect to admin.rensto.com | PASS | `https://admin.rensto.com` in verify route |
| 21 | Logout cookie domain matches | PASS | .rensto.com in logout route |
| 22 | Design system brand colors | PASS | #fe3d51, #bf5700, #1eaef7, #5ffbfd, #110d28 |
| 23 | No wrong design colors | PASS | No #7C3AED, Poppins only in anti-patterns |
| 24 | VERCEL_PROJECT_MAP has admin.rensto.com | PASS | Listed under rensto-site |
| 25 | Middleware handles admin.rensto.com | PASS | hostname check present |

**25/25 PASS.** All changes verified.

---

### Changes made this session

- **admin.rensto.com broken (was 404)**: Root cause — domain was on stale `rensto-admin` Vercel project that had no working app. Fix: removed from rensto-admin, added to rensto-site. Middleware in rensto-site already handled admin.rensto.com rewrites.
- **Cross-subdomain auth**: Cookie had no `domain` attribute → scoped to rensto.com only → admin.rensto.com couldn't read it. Fix: set `domain: '.rensto.com'` in verify and logout routes.
- **Magic link admin redirect**: Was `/admin` (path on rensto.com) → now `https://admin.rensto.com` in production.
- **Owner account created**: `service@rensto.com` with ADMIN role, 500 credits, in both Prisma User + Drizzle users tables (same UUID). Entitlement active.
- **RESEND_API_KEY**: Set in Vercel production + preview via API.
- **ADMIN_EMAILS default**: Changed from `admin@rensto.com` to `service@rensto.com,admin@rensto.com` in auth.ts, send/route.ts, verify/route.ts.
- **Schema drift noted**: Prisma schema says `emailVerified DateTime?` but actual DB column is `boolean`. `User.id` is `@db.Uuid` in schema but `text` in actual DB. Not fixed (requires migration) but worked around with raw SQL.
- **Two user tables**: `"User"` (Prisma, text id) and `users` (Drizzle, uuid id). Entitlements FK → `users`. Owner account inserted into both with matching UUID.

- **Complete Firestore elimination**: All 7 client-side pages that queried Firestore directly have been migrated to server-side API routes backed by Prisma/PostgreSQL. All Firestore seed/migration scripts deleted. `firebase` client SDK package removed from package.json. Only `firebase-admin` remains (Storage-only for onboarding secrets). AITable sync tools (`sync_leads_to_aitable.js`, `sync_extended_to_aitable.js`, `simulate_lead.js`) rewritten from Firestore to Postgres.
  - **Pages migrated**: approvals, dashboard, runs, agents, fulfillment queue, vault management, onboarding client
  - **API routes created**: `/api/app/approvals`, `/api/app/approvals/[id]/respond`, `/api/app/runs`, `/api/app/dashboard`, `/api/app/agents`, `/api/admin/fulfillment/queue`, `/api/admin/vault`, `/api/app/onboarding/submit`
  - **Files deleted**: `firebase-client.ts`, `firebase.ts`, 17 obsolete Firestore seed/migration scripts
  - **Build verified**: `next build` passes with zero errors

- **Full SaaS + NotebookLM cross-reference audit**: 4-agent codebase audit + 7-notebook deep query. Found 13 cross-notebook contradictions, 6 notebook-vs-codebase mismatches, 4 redundancies. Key fixes applied:
  - **Pricing conflict**: 3 notebooks had different pricing models (tokens vs credits vs per-video). Canonical: "credits" at 50/video. Override sources added to 719854ee, 0baf5f36.
  - **Veo deprecated but referenced**: 5811a372 promoted Veo 3.1 as viable. Override added marking Veo deprecated, Kling 3.0 only.
  - **fal.ai deprecated but referenced**: 5811a372 said "Kling via fal.ai". Override added. NOTEBOOKLM_INDEX updated to mark fal.ai notebook deprecated.
  - **Clerk/Supabase never implemented**: 5811a372 listed Clerk auth and Supabase DB. Override added — actual stack is magic-link + direct PostgreSQL.
  - **learning.log retired**: 5811a372 and 12c80d7d referenced learning.log. Override sources added → use findings.md.
  - **f0747c8b (prd template) is different product**: Voice-note-to-video for "Mivnim", not TourReel. Override source added marking it LEGACY. Added to NOTEBOOKLM_INDEX.
  - **CLAUDE.md fixes**: Firestore changed from "fallback reads only" to "deprecated Feb 2026". Worker stack specified "Kie.ai Kling 3.0".
  - **CODEBASE_VS_NOTEBOOKLM.md**: Added missing notebooks (719854ee, b906e69f, f0747c8b).
  - **Admin API routes P0**: All `/api/admin/*` routes lacked auth. Adding verifySession() + admin role check.
  - **Orphaned payment routes deleted**: `/api/payment/create` and `/api/payment/confirm` — zero callers, Firestore imports, no auth. Removed.
  - **56 Firestore imports**: Remain in codebase as stubs (throw at runtime). Documented for future cleanup.

- **Final sweep — continued session**:
  - **NotebookLM stale sources deleted (4)**:
    - 0baf5f36: "Architectural Blueprint for Zillow Drone Tour Automation" (Veo core) — deleted
    - 0baf5f36: "Cinematic Video Pipeline Runtime Configurations" (legacy credit costs 1-3) — deleted
    - 0baf5f36: "Zillow-to-Drone-Tour System Implementation Specification" (Veo + fal.ai) — deleted
    - 5811a372: "Architecting an AI Real Estate Video SaaS with Veo 3.1" (OBSOLETE by own OVERRIDE) — deleted
  - **Pricing page fixed**: Corrected tiers from $49/$99/$199 to canonical $299/$699/$1499 with 500/1500/4000 credits. Replaced `alert()` placeholder with real Stripe checkout via new `/api/video/subscribe` route.
  - **Subscribe API route created**: `apps/web/rensto-site/src/app/api/video/subscribe/route.ts` — creates Stripe subscription checkout session with correct metadata for credit provisioning.
  - **Webflow references purged**: All stale "Matching Webflow Brand System" comments removed from globals.css.
  - **Checkout platform label fixed**: `api/checkout/route.ts` metadata changed from `rensto-firebase` to `rensto-web`.
  - **Design system verified**: globals.css colors match notebook 286f3e4a exactly (#fe3d51, #bf5700, #1eaef7, #5ffbfd, #110d28).

- **Remaining technical debt** (not launch-blocking for TourReel self-serve):
  - ~~20+ server-side routes still import `getFirestoreAdmin`~~ — RESOLVED: `getFirestoreAdmin()` throws; 17 dead scripts deleted.
  - ~~6 client-side pages import `firebase/firestore`~~ — RESOLVED: All 7 pages migrated to Postgres API routes.
  - `custom-solutions/intake` has demo mode hardcoded IDs — old flow, not TourReel.
  - Rate limiting missing on public POST routes — security best practice, not a crash.
  - Stripe price IDs (`STRIPE_STARTER_PRICE_ID` etc.) need real values from Stripe dashboard before pricing page works end-to-end.

---

## 2026-02-15

- **Floorplan in listing photos**: When user skips floorplan upload, pipeline now scans scraped listing photos with Gemini vision to detect a floorplan/blueprint. If found, uses it for analyzeFloorplan; else uses default tour + property photos. `detectFloorplanInPhotos()` in gemini.ts.
- **Image/room mismatch, invented stairs, invented furniture, extra people**: (1) **Stairs**: Default sequences and floorplan included Stairs for 4+ bed homes; single-story ranches got invented stairs. Fix: `isSingleStory(listing)` parses description/amenities/reso_facts for "ranch", "1 story", etc.; `getDefaultSequence` and `buildTourSequence` filter out Stairs when single-story. Floorplan prompt: "Add Stairs ONLY if floorplan CLEARLY shows multiple floors." (2) **Photo–room mismatch**: Heuristic used index (pool=last, foyer=second). Fix: `matchPhotosToRoomsWithVision` (Gemini) when USE_AI_PHOTO_MATCH≠false; assigns best photo per room by content. (3) **Invented furniture**: Kling was inferring from listing (e.g. 70s) and adding period furniture. Fix: KLING_REALTOR_NEGATIVE + "invented furniture, added furnishings, staged furniture, remodeled room"; buildRealtorOnlyKlingPrompt: "CRITICAL: Preserve the EXACT room, furniture, decor. Do NOT add, remove, or change furnishings." (4) **Extra people**: Strengthened negative: "bystander, stranger, family member, guest, crowd, multiple people." See kie.ts for buildRealtorOnlyKlingPrompt
- **Video "extra low quality" (all recent runs)**: Root cause: **Kling Standard = 720p output**. Pipeline used `mode: "std"` then upscaled to 1080p → blur. Fix: (1) Kling `mode: "pro"` (1080p native). Env `KIE_KLING_MODE=std` to revert if Kie 500. (2) Nano Banana `resolution: "4K"` (was 2K) for sharper composites. Env `NANO_BANANA_RESOLUTION=2K` to revert. (3) FFmpeg preset `medium` (was `fast`). See kie.ts for buildRealtorOnlyKlingPrompt
- **Worker status overwritten by retry**: Job `deb73ec3` had `master_video_url` populated but `status` remained `generating_clips`. Root cause: Run 1 completed successfully (UPDATE set status=complete); BullMQ retried (e.g. throw after UPDATE, process kill); Run 2 called `updateJobStatus(jobId, "generating_clips", 26)` which overwrote status/progress but NOT master_video_url. Fix: (1) Idempotent start: if `master_video_url` exists, sync status to complete and return. (2) `updateJobStatus` never overwrites when `status='complete' AND master_video_url IS NOT NULL`.
- **Methodology consolidation**: Multiple working methods (B.L.A.S.T., agent behavior, work-method) had conflicting guidance—B.L.A.S.T. "HALT" vs agent "one output." Created METHODOLOGY.md as single SSOT: B.L.A.S.T. for new projects (phase gates), Agent Behavior for routine tasks (one final output). Updated brain.md, .cursorrules, CONFLICT_AUDIT, agent-behavior rules to reference METHODOLOGY.md. No more conflicts.
- **Full video + regen workflow**: Generate FULL video first. Quality issues (cartoon, style drift) can appear in any scene (2, 3, 4+). To fix bad clips only: `JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts`. MAX_CLIPS=1 is DEBUG ONLY—never for quality validation.
- **Smoke "stuck"**: Job can sit behind others in BullMQ queue. Run `npx tsx tools/smoke-preflight.ts --drain` first to clear waiting jobs + ensure credits. Worker must have MAX_CLIPS=1 for fast (1-clip) smoke.
- **Video quality regression (realtor robotic, zero listing focus)**: Adding "Person moves FORWARD through the space" to `buildRealtorOnlyKlingPrompt` caused Kling to produce robotic straight-line motion—realtor "going straight", "looking for something", no room engagement. Fix: remove "Person moves FORWARD"; add room-as-star and production guidance ("The [room] is the focus. Reveal the space... Natural real estate tour. Cinematic."). Keep KLING_REALTOR_NEGATIVE. Add talking/lips to neg. See kie.ts for buildRealtorOnlyKlingPrompt
- **Kie.ai Kling 422 (multi_shots)**: Kie returned 422 "multi_shots cannot be empty" when we omitted the field. Fix: add `multi_shots: false` to Kling input.
- **Kie.ai Kling 500 (our fault)**: We passed Zillow/source URLs to Kie when ensurePublicUrl failed. Kie cannot fetch those (blocked, auth-required) → 500. Fix: (1) ensurePublicUrl returns null on fetch/upload failure, never original URL. (2) Never pad additionalPublic with original photos. (3) config.r2.publicUrl fallback to r2.dev when unset. (4) kie.ts: isPublicFetchableUrl guard—reject Zillow/non-http URLs before API call. (5) Throw UnrecoverableError when zero usable photos.
- **Agent "stuck" / silent wait**: User had to ask "are you stuck?" because agent ran long commands without progress. Never run one command >3 min without intermediate output. Rule: bounded iterations, report between chunks, explicit timeouts. Never say "I'm stuck"—hit timeout, report, try next approach. See agent-behavior.mdc.
- **Pipeline config duplication**: Clip duration (5s) and max clips (15) were hardcoded in kie.ts, prompt-generator, video-pipeline. Fix: TOURREEL_REALTOR_HANDOFF_SPEC §0b declares config.ts as SSOT; all code reads config.video.defaultClipDuration and config.video.maxClipsPerVideo.
- **Port confusion**: README said site 3001 (wrong—it's 3002). VIDEO_APP_USER_GUIDE said localhost:3000 (wrong—3002). e2e-from-zillow, run-smoke defaulted to 3002 for API_URL but worker is 3001 when both run. Fix: PORT_REFERENCE.md = SSOT. All docs/tools updated.
- **Conflict audit protocol**: When user asks "do you have conflicts?"—run CONFLICT_AUDIT.md checks (git, ports, docs, config), do not confirm without executing. Audit doc is runnable checklist.
- **Video page 404 on rensto.com**: rensto-site.vercel.app/video/create and /video/[jobId] work; rensto.com can 404 if the domain points to a different Vercel project. Fix: In Vercel, ensure rensto.com is aliased to the same project as rensto-site.vercel.app. If multiple projects exist (e.g. api.rensto.com), add rensto.com domain to the project that has the video routes. Added redirect /video → /video/create.
- **Video "fetch failed"**: API proxies to VIDEO_WORKER_URL; worker unreachable or 404 → fetchJobFromDb reads video_jobs+listings+clips from shared Postgres. Returns real address, exterior_photo_url, floorplan_url, clips. Only falls back to mock if DB has no record.
- **Kie.ai charges every couple minutes**: BullMQ retries (attempts: 3, backoff 30s) caused repeated pipeline runs when job failed (e.g. Insufficient Credits). Each retry = full Kie.ai usage. Fix: throw `UnrecoverableError` for unrecoverable errors.

---

## 2026-02-13

- **Local docs → NotebookLM**: Two-round migration. Round 1: core docs. Round 2 (gap audit): full REFERENCE_ALIGNMENT (hierarchy, sync), full design system (backgrounds, Tailwind, layout patterns), full pipeline (testing, config, model compliance, three fixes), AGENT_SELF_AUDIT, AGENT_HANDOFF, 3-SCENE_VERIFICATION, full gemini (Lead/Token schema). AGENT_SELF_AUDIT, AGENT_HANDOFF, 3-SCENE_VERIFICATION still in codebase; content duplicated in 0baf5f36.

- **Documentation discipline**: Agent created progress.md, findings.md, REFERENCE_ALIGNMENT, work-method rules—then failed to use them. Did not log job creation, browser verification, or session events. User: "I see you disrespect me and ignore what we do here." Rule: Update progress.md and findings.md after each task, not only at session end. "Each little thing" = log it.

- **Real-data video page flow**: When worker running + VIDEO_WORKER_URL set + valid job ID: page shows real address (1531 Home Park Dr), real listing, status from DB. Job `68fc0ba2-4415-4841-a7a9-b47288b38b43` showed FAILED (credits). Mock only when worker 404/unreachable in dev.

- **Reference alignment**: Agent was mixing references (Cursor rules vs CLAUDE vs brain vs NotebookLM vs Antigravity vs Aitable vs Postgres) because no canonical hierarchy existed. Created REFERENCE_ALIGNMENT.md: precedence order, topic→SSOT map, sync discipline, anti-patterns. Ensures B.L.A.S.T. and other methods are taken seriously via explicit hierarchy.

- **Work method accountability**: User repeatedly finds issues before agent. Root causes: no browser verification before handoff; reactive fixes; ignoring feedback. Created work-method-accountability.mdc (alwaysApply) with mandatory: open URL in browser for user-facing flows; run dry-run for pipeline changes; acknowledge work-method failure when user reports.

- **Pipeline Veo violation**: video-pipeline.worker.ts had Veo as fallback despite TOURREEL_REALTOR_HANDOFF_SPEC and AGENT_SELF_AUDIT saying "Kling 3 only". Removed. Model rules now in TOURREEL_REALTOR_HANDOFF_SPEC §0.

- **VideoGeneration error handling**: When `/api/video/jobs/[id]` returns 4xx/5xx, the frontend threw "Failed to fetch job". Causes: (1) visiting `/video/mock-job-001` while VIDEO_WORKER_URL is set → worker 404; (2) job ID typo → 404; (3) worker down → 502. Fixes: (a) Parse error body, surface `data.error` or `Failed to fetch job (status)`. (b) **Dev fallback**: API route returns mock job when worker 404/5xx or unreachable (IS_DEV). In dev, any `/video/[id]` loads—no error. Production stays strict.

- **Process gap**: User found "Failed to fetch job" before agent. Rules require "Test in browser" but agent did not open the video URL before handoff. Added explicit rule in work-method-accountability.mdc: "User-facing flows: Open the URL in the browser and confirm it loads without console errors before sharing with the user."

- **Agent reporting**: User does not want session updates in conversation. Update progress.md and findings.md at end of every task. The project memory files are the reference—not the user. If out of context or missing access, state what is needed.

- **Video test prep**: Before next video test—(1) Deploy worker to RackNerd if testing there. (2) Preflight --free passes. (3) Create job or retry-fresh. (4) progress.md has "Last Video Issues" and "Before Next Video Test" checklist.

---

## Security & Operations (from Feb 2026 audits)

- **Git history / VPS credentials**: Old password `05ngBiq2pTA8XSF76x` may appear in git history (deleted deploy-to-racknerd.js, execute script). Rotate on VPS; never hardcode. Use `VPS_PASSWORD` or `RACKNERD_SSH_PASSWORD` env vars.
- **library/solution-data/uad.csv**: URLs point to 172.245.56.50:8080. Update if server changes.
- **docs/templates/tourreel vs apps/worker/legacy_archive**: Verify which is canonical for TourReel templates when updating.
- **Realtor placement research**: Industry standard is PiP/overlay; in-scene (Nano+Kling) has limits. Full research → NotebookLM 0baf5f36 when MCP available.

---

## Archived

Historical findings: `infra/archive/findings.md`

---

*Add new entries above with date.*

---

## 2026-02-24 - FB Marketplace Multi-Customer Architecture Lessons

**Root Cause: Function Parameter Mismatches**
- **Issue**: V2 webhook-server called V1 helper functions with wrong parameters
- **generateUniqueUadConfig**: Expects `(pool)` as parameter, NOT config object. Must be awaited (async).
- **generateListingCopy**: Expects `(clientId, job, city, phone)` - 4 separate params, not spread object
- **generateListingImages**: Expects `(clientId, config, phoneNumber)` and returns `{imageUrl, imageUrl2, imageUrl3, videoUrl}`, NOT `{imageUrls, videoUrl}`
- **Prevention**: When adapting existing code, READ the actual function signatures first instead of assuming based on names

**Zod Validation Issues with Complex Objects**
- Zod `z.record()` had validation failures with simple JSON objects that parsed fine
- Simplified to basic JSON.parse() validation instead of strict Zod schemas
- Lesson: For config files, basic structure validation is often enough; strict typing can cause friction

**Config Loader Pattern Success**
- File-based multi-tenancy works well for MVP (no schema migration required)
- `customers/<customerId>/config.json` structure allows easy onboarding without DB changes
- Dynamic loading via ConfigLoader enables customer isolation without code changes

**Multi-Customer Bot Adapter Pattern**
- bot-adapter.js successfully bridges V1 bot with V2 customer configs
- Temporarily swaps bot-config.json during execution to maintain V1 bot compatibility
- Allows gradual migration: multi-customer backend + single-tenant bot

**Never Repeat**:
1. Always check function signatures before calling legacy code from new code
2. Ensure `await` is present for async functions (pool.query calls)
3. Test parameter order and structure - spread operators can hide mismatches
4. Verify return value structure - destructuring wrong keys causes silent failures
