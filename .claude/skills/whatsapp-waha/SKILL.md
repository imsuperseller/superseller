---
name: whatsapp-waha
description: >-
  WhatsApp integration via WAHA Pro for SuperSeller AI. Covers message sending (text, video, file),
  session management, OTP authentication, lead notifications, and video delivery.
  Used by Winner Studio (delivery), Lead Pages (notifications), and FB Bot (alerts).
  Use when working on WhatsApp messaging, WAHA, OTP auth, or WhatsApp notifications.
  Not for Telnyx voice (see frontdesk-voice), video pipeline logic, or UI design.
  Example: "Fix WhatsApp delivery not sending in Winner Studio".
autoTrigger:
  - "WhatsApp"
  - "WAHA"
  - "whatsapp_jid"
  - "OTP"
  - "sendText"
  - "sendVideo"
  - "WhatsApp notification"
  - "WAHA_URL"
  - "chat_id"
negativeTrigger:
  - "Telnyx"
  - "voice"
  - "FrontDesk"
  - "video pipeline"
  - "UI design"
  - "TourReel"
  - "FB Marketplace posting"
---

# WhatsApp / WAHA Pro Integration

## Critical
- **WAHA is the WhatsApp HTTP API** — not the official Meta Business API. It runs its own session.
- **Chat ID format**: `{phoneWithCountryCode}@c.us` (e.g., `972501234567@c.us`). Never include `+` or dashes.
- **Session must be alive** — check `isSessionAlive()` before critical sends. Session name: `WAHA_SESSION` env var.
- **Two sessions**: `internalBoss` (business notifications/approvals to owner — functions like Slack for the business) and `superseller-whatsapp` (future website chatbot with full knowledge base — big project, not yet started).
- **All sends are best-effort** — catch errors, log, return null. Never fail a pipeline because WhatsApp is down.
- **WAHA is used by all products** — Studio (`WAHA_URL`), Lead Pages (`WAHA_BASE_URL`), FB Bot (`config.shared.wahaUrl`). Env var names differ per app.
- **OTP TTL is 5 minutes**, max 3 attempts. Stored in Redis key `otp:{phone}`.

## Architecture

```
WAHA Pro Server (self-hosted or cloud)
    ↓
apps/studio/src/lib/waha.ts (124 lines)
    ↓
Three consumers:
  1. Winner Studio → video delivery + error notifications (env: WAHA_URL)
  2. Lead Pages → lead capture notifications (env: WAHA_BASE_URL)
  3. FB Bot → session alerts + post notifications (env: config.shared.wahaUrl)
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/studio/src/lib/waha.ts` | WAHA client — sendText, sendVideo, sendFile, isSessionAlive (124 lines) |
| `apps/studio/src/lib/auth.ts` | WhatsApp OTP auth flow (173 lines) |
| `apps/studio/src/app/api/auth/whatsapp-otp/route.ts` | OTP send endpoint (25 lines) |
| `apps/web/superseller-site/src/app/api/leads/landing-page/route.ts` | Lead WhatsApp notification (WAHA, env: WAHA_BASE_URL) |
| `apps/web/superseller-site/src/app/(main)/whatsapp/WhatsAppClient.tsx` | WhatsApp AI Agent product page (680 lines) |

## WAHA API Functions

### phoneToChatId(phone)
```typescript
// Israeli: 0501234567 → 972501234567@c.us
// US: +15551234567 → 15551234567@c.us
// Already formatted: 972501234567 → 972501234567@c.us
```

### sendText(chatId, text)
- **Endpoint**: `{WAHA_URL}/api/sendText`
- **Payload**: `{ chatId, text, session }`
- **Returns**: Message ID or null

### sendVideo(chatId, videoUrl, caption?)
- **Endpoint**: `{WAHA_URL}/api/sendVideo`
- **Payload**: `{ chatId, file: { url, mimetype: "video/mp4" }, caption, session }`
- **Returns**: Message ID or null

### sendFile(chatId, mediaUrl, caption?, filename?)
- **Endpoint**: `{WAHA_URL}/api/sendFile`
- **Payload**: `{ chatId, file: { url }, caption, fileName, session }`
- **Returns**: Message ID or null

### isSessionAlive()
- **Endpoint**: `{WAHA_URL}/api/sessions/{session}`
- **Returns**: `data.status === "WORKING"` (boolean)

## WhatsApp OTP Auth Flow

```
1. POST /api/auth/whatsapp-otp { phone }
   → Normalize phone → phoneToChatId()
   → Upsert winner_users (phone, whatsapp_jid, auth_method='whatsapp')
   → Auto-create winner_user_credits (starter tier, 3 credits)
   → Generate 6-digit OTP → Redis (5min TTL, key: otp:{phone})
   → Send via WAHA: "SuperSeller AI Studio login code: {code}"
   → Return { ok: true }

2. POST /api/auth/verify-otp { phone, code }
   → Check Redis key otp:{phone}
   → Max 3 attempts (then deleted)
   → On success: createSession(userId) → set cookie → return token
   → On failure: decrement attempts or return error
```

## Environment Variables

All products use WAHA Pro. Env var names differ by app (historical reasons, not yet unified):

| Variable | Used By | Purpose |
|----------|---------|---------|
| `WAHA_URL` | Studio (`apps/studio`) | WAHA server base URL |
| `WAHA_BASE_URL` | superseller-site (`apps/web/superseller-site`) | WAHA server base URL (lead pages, health check) |
| `WAHA_API_KEY` | Studio, superseller-site | WAHA Bearer token |
| `WAHA_SESSION` | Studio, superseller-site | Session name (default: superseller-whatsapp) |
| `config.shared.wahaUrl` | FB Bot (`fb marketplace lister/`) | WAHA server URL (read from bot-config.json) |

**Note**: `WAHA_URL` and `WAHA_BASE_URL` point to the same server (`http://172.245.56.50:3000`). The naming differs per app but the value is identical.

## Usage by Product

### Winner Studio
- **Delivery**: Send finished video + gallery link on COMPLETE
- **Error notification**: Send error message + refund notice on FAILED
- **Hebrew messages**: `"🎬 הסרטון שלך מוכן!"` (success), `"⚠️ בוס, הייתה תקלה..."` (failure)

### Lead Pages
- **Lead notification**: Send lead details to business owner on form submission
- **Format**: Hebrew message with name, phone, email, timestamp (Asia/Jerusalem)
- **Best-effort**: Logs to console if credentials missing

### FB Marketplace Bot
- **Session alerts**: Cookie degradation warnings (via n8n, separate integration)
- **Not using WAHA directly** — uses n8n WhatsApp node

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| `isSessionAlive()` returns false | WAHA session expired or server down | Restart WAHA session via admin panel or API |
| sendVideo returns null | Video URL not accessible from WAHA server | Ensure R2 URL is public or use proxy |
| OTP not received | Phone number format wrong | Check `phoneToChatId()` — must produce `{countryCode}{number}@c.us` |
| Lead notification not sent | Missing `WHATSAPP_TOKEN` env var | Set in Vercel dashboard for superseller-site |
| Rate limit from WAHA | Too many messages in short period | Add delay between sends, check WAHA rate config |

## References

- NotebookLM 0789acdb — WAHA Pro documentation, session management, API reference
- Studio codebase: `apps/studio/src/lib/waha.ts`
- Lead Pages: `apps/web/superseller-site/src/app/api/leads/landing-page/route.ts`
