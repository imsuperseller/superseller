# Project 5: Social & Content (SocialHub + Voice + WhatsApp)

> **Role**: Social media automation, content creation, WhatsApp WAHA, Telnyx voice AI.
> **Status**: Phase 2 product — mostly new code creation, very low conflict risk.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
shai friedman social/**
social app/**
```

### CANNOT edit (owned by other projects)
```
apps/**                           → Projects 1 & 2
fb marketplace lister/**          → Project 3 (Marketplace Bot)
platforms/marketplace/**          → Project 3 (Marketplace Bot)
infra/**                          → Project 4 (Infrastructure)
scripts/**                        → Project 4 (Infrastructure)
.env*                             → Project 4 (Infrastructure)
docs/**                           → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)  → Project 7 (Strategy & Docs)
```

### CAN read (for reference, but never modify)
- `apps/web/superseller-site/src/app/api/` — existing API patterns
- `apps/worker/src/services/kie.ts` — Kie.ai integration patterns
- All root `.md` files

---

## Assigned Skills
- socialhub
- whatsapp-waha
- frontdesk-voice

---

## Key Context

### SocialHub (Phase 1 — LIVE)
- Text generation via Claude AI
- Image generation via Kie.ai
- Facebook publishing to SuperSeller AI page (Page ID: 294290977372290)
- WAHA approval workflow (WhatsApp-based content approval)
- Aitable sync for dashboard

### WhatsApp WAHA
- **Session**: superseller-whatsapp
- **Server**: RackNerd Docker container
- Used by: Winner Studio (delivery), Lead Pages (notifications), FB Bot (alerts)
- API: REST endpoints for send text/video/file

### Telnyx FrontDesk Voice AI
- **Assistant**: `assistant-f2838322-edfa-4c22-9997-ca53b151175f` "Superseller FrontDesk"
- **Phone**: +14699299314
- **Stack**: Llama 3.3 70B, KokoroTTS.af_heart, Deepgram Nova 3
- **Worker**: BullMQ poller for conversation polling

### Social Media Accounts
- **Facebook Page**: SuperSeller AI — Page ID `294290977372290`, 1,094 followers
- **Instagram**: Account ID `17841410951596580`
- Both connected via Meta Graph API with permanent page token

---

## Build / Test / Deploy

```bash
# Currently no standalone build — SocialHub code lives partially in web app
# Future: dedicated SocialHub app will have its own build

# Test WhatsApp
curl -X POST http://172.245.56.50:3001/api/sendText \
  -H "Content-Type: application/json" \
  -d '{"chatId": "...", "text": "test"}'

# Test Telnyx
# Outbound call test via Telnyx API
```

---

## Cross-Project Rules

1. **Web integration**: SocialHub API routes currently live in `apps/web/`. To modify those, create a request for Project 1.
2. **Worker integration**: Voice poller runs in worker. To modify, create a request for Project 2.
3. **Low conflict risk**: Most work is new code creation in `shai friedman social/` or new app scaffolding.
4. **Root docs**: To update root `.md` files, create a request for Project 7.
