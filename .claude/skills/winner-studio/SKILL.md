---
name: winner-studio
description: >-
  Winner Video Studio (Spoke agent) — AI avatar video pipeline for Mivnim/Yossi.
  Covers Gemini brain routing, Kie.ai avatar-pro/infinitalk/kling-3.0 video generation,
  audio isolation, WhatsApp delivery via WAHA, R2 storage, and credit billing.
  Use when working on Winner Studio, Spoke, avatar video, lip-sync, Mivnim, Yossi,
  studio.superseller.agency, or the apps/studio/ codebase. Not for VideoForge, FB Marketplace,
  UI design, or non-studio video work.
  Example: "Fix the avatar-pro fallback in Winner Studio".
autoTrigger:
  - "Winner Studio"
  - "Spoke"
  - "avatar"
  - "lip-sync"
  - "infinitalk"
  - "avatar-pro"
  - "Mivnim"
  - "Yossi"
  - "studio.superseller.agency"
  - "apps/studio"
  - "winner_generations"
  - "Gemini brain"
negativeTrigger:
  - "VideoForge"
  - "Zillow"
  - "FB Marketplace"
  - "UI design"
  - "floorplan"
  - "AgentForge"
  - "landing page"
  - "FrontDesk"
---

# Winner Video Studio (Spoke Agent)

## Critical
- **Gemini brain routes to 3 models** — avatar-pro (lip-sync, any duration), infinitalk (lip-sync, max 15s audio), kling-3.0/video (no audio, B-roll only). Never hardcode model selection.
- **Kie.ai cannot fetch presigned R2 URLs with query params** — use `/api/files/{key}` proxy via `ensurePublicUrl()`.
- **Fallback chain**: avatar-pro fails → kling-3.0/video (no lip-sync but produces video). This is intentional — never skip fallback.
- **Credit is 1 per generation** (fixed). Refund automatically on failure. Never charge twice.
- **Max 2 concurrent generations per user** — tracked in Redis `winner:rate:concurrent:{userId}`.
- **Pipeline is fire-and-forget** — POST /api/generate returns 201 immediately, processing happens async via /api/generate/process.
- **WhatsApp delivery is best-effort** — catch errors, don't fail the pipeline.

## Pipeline Stages

```
PENDING → SCRIPT_PROCESSING → [AUDIO_ISOLATING] → VIDEO_GENERATING → DELIVERING → COMPLETE
                                                                                    ↘ FAILED (at any stage)
```

| Stage | What Happens |
|-------|-------------|
| PENDING | Initial state after credit charge |
| SCRIPT_PROCESSING | Gemini brain analyzes audio/script, picks model, generates prompt |
| AUDIO_ISOLATING | ElevenLabs audio cleanup (only if needs_isolation=true) |
| VIDEO_GENERATING | Kie.ai task created (avatar-pro/infinitalk/kling-3.0) |
| DELIVERING | WhatsApp video + gallery link sent to user |
| COMPLETE | Terminal success |
| FAILED | Terminal failure — credit refunded, error notification sent |

## Key Files

| File | Purpose |
|------|---------|
| `apps/studio/src/lib/pipeline.ts` | Pipeline orchestrator (589 lines) — state machine, task firing, callbacks, delivery |
| `apps/studio/src/lib/gemini.ts` | Gemini brain — model routing, prompt generation (222 lines) |
| `apps/studio/src/lib/gemini-constants.ts` | System prompts, character definitions, model registry |
| `apps/studio/src/lib/kie.ts` | Kie.ai API — createTask, getTaskStatus (225 lines) |
| `apps/studio/src/lib/waha.ts` | WhatsApp WAHA — sendText, sendVideo, sendFile (124 lines) |
| `apps/studio/src/lib/r2.ts` | R2 storage — upload, download, proxy, presign (137 lines) |
| `apps/studio/src/lib/auth.ts` | WhatsApp OTP + magic-link auth (173 lines) |
| `apps/studio/src/lib/credits.ts` | Credit check/consume/refund (163 lines) |
| `apps/studio/src/lib/constants.ts` | Characters, vibes, languages config (121 lines) |
| `apps/studio/src/types/index.ts` | TypeScript types (150 lines) |
| `apps/studio/scripts/migrate.sql` | Full schema — 9 tables (331 lines) |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/generate` | Create generation (charge credit, return 201) |
| POST | `/api/generate/process` | Internal: Gemini brain + task creation |
| POST | `/api/callbacks/kie` | Kie.ai webhook (task completion/failure) |
| GET | `/api/generations` | List user's 50 most recent generations |
| GET | `/api/generations/[id]` | Generation detail + event history |
| POST | `/api/upload` | Upload audio/image to R2 |
| GET | `/api/files/[...key]` | R2 file proxy for external APIs |
| GET | `/api/cron/check-stuck` | Recover stuck generations (>10 min) |
| POST | `/api/auth/whatsapp-otp` | Send WhatsApp OTP |
| POST | `/api/auth/magic-link` | Send email magic link |

## Database Tables (9)

| Table | Purpose |
|-------|---------|
| `winner_users` | User identity (email, phone, whatsapp_jid, tenant) |
| `winner_user_credits` | Credit balance (tier, total, used, monthly cap) |
| `winner_credit_transactions` | Consume/refund/purchase audit log |
| `winner_generations` | Core pipeline state (input → Gemini → task → result → delivery) |
| `winner_generation_events` | Per-stage audit log (stage_enter, task_created, callback, etc.) |
| `winner_generation_costs` | Per-generation API cost breakdown |
| `winner_music_tracks` | Suno music selection (Phase 2) |
| `winner_sessions` | Auth sessions (7-day TTL) |
| `winner_api_logs` | External API call audit (latency, response codes) |

## Gemini Brain Routing

| Condition | Model Selected |
|-----------|---------------|
| No audio | `kling-3.0/video` (text-to-video B-roll) |
| Audio + image + duration <= 15s | `infinitalk/from-audio` (lip-sync) |
| Audio + image + duration > 15s | `kling/ai-avatar-pro` (avatar) |
| Audio + no image | `kling-3.0/video` (with prompt) |

## Characters

| ID | Name | Voice Style |
|----|------|-------------|
| ceo | CEO | Authoritative Hebrew + English power words |
| agent | Agent | Energetic, friendly, slang |
| architect | Architect | Polished, creative, professional |
| client | Client | Testimonial, authentic, emotional |
| trump | Trump | English superlatives, "tremendous" |
| asher | Asher | Broken English (Hebrew grammar) |
| nehorai | Nehorai | Broken English (Hebrew grammar) |

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL |
| `REDIS_URL` | Yes | BullMQ, rate limits, OTP, sessions |
| `R2_ACCOUNT_ID` | Yes | Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Yes | R2 auth |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 auth |
| `KIE_API_KEY` | Yes | Kie.ai (avatar-pro, kling, suno) |
| `WAHA_URL` | Yes | WhatsApp API base |
| `WAHA_API_KEY` | Yes | WAHA auth |
| `RESEND_API_KEY` | Yes | Email magic links |
| `R2_BUCKET_NAME` | No | Default: winner-video-studio |
| `R2_PUBLIC_URL` | No | Default: `https://pub-ac6c152d1390490f95184e78af932739.r2.dev` |
| `WAHA_SESSION` | No | Default: superseller-whatsapp |
| `CALLBACK_BASE_URL` | No | Kie.ai callback URL base |
| `INTERNAL_SECRET` | No | Internal API auth |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Generation stuck in VIDEO_GENERATING >10min | Kie.ai callback missed or task failed silently | Run `/api/cron/check-stuck` — polls task status, processes callback or retries |
| 402 from Kie.ai | Kie.ai balance depleted | Check balance: `curl -H "Authorization: Bearer $KIE_API_KEY" https://api.kie.ai/api/v1/user/balance` |
| Avatar-pro produces no lip-sync | Wrong model or audio too short | Check Gemini routing — may need infinitalk for <15s audio |
| WhatsApp delivery fails silently | WAHA session expired | Check: `isSessionAlive()`, restart WAHA session |
| Credit not refunded on failure | `failGeneration()` not called | Check pipeline error path — must always call `failGeneration()` which handles refund |
| R2 URLs rejected by Kie.ai | Presigned URLs have query params | Use `ensurePublicUrl()` → `/api/files/{key}` proxy |

## References

- NotebookLM e109bcb2 — Mivnim/Yossi client context, brand assets
- NotebookLM 3e820274 — Kie.ai API docs (avatar-pro, infinitalk, kling-3.0)
- NotebookLM 6bb5f16d — Kling 3.0 prompt engineering
- Codebase: `apps/studio/` (self-contained Next.js app)
- Deployment: `studio.superseller.agency` (Vercel, manual deploy)
