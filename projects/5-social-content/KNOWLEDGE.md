# Project 5: Social & Content — Knowledge Base

## Architecture Overview

Social & Content covers three interconnected products:
1. **SocialHub/Buzz**: Multi-platform social media management with AI content creation
2. **WhatsApp WAHA**: Message bridge for approvals, notifications, and delivery
3. **FrontDesk Voice AI**: Telnyx-powered AI receptionist

## SocialHub Pipeline (Phase 1 — LIVE)
1. Content creation: Claude AI generates text + Kie.ai generates images
2. Approval: Content sent to WhatsApp via WAHA for human approval
3. Publishing: Approved content posted to Facebook page via Graph API
4. Tracking: Post synced to Aitable dashboard

### Phase 2 (NOT STARTED)
- Instagram publishing
- Multi-platform (LinkedIn, X, TikTok, YouTube)
- Analytics and competitive intelligence
- Social inbox
- Smart scheduling with AI

## WhatsApp WAHA
- **Docker container** on RackNerd
- **Session**: `superseller-whatsapp`
- **API**: REST endpoints (sendText, sendVideo, sendFile)
- **Consumers**: SocialHub (approval), Winner Studio (delivery), Lead Pages (notifications), FB Bot (alerts)

## FrontDesk Voice AI
- **Provider**: Telnyx
- **AI Model**: Llama 3.3 70B
- **TTS**: KokoroTTS.af_heart
- **STT**: Deepgram Nova 3
- **Phone**: +14699299314
- **Polling**: BullMQ worker polls Telnyx for conversation updates
- **Pending**: Webhook migration from n8n to worker

## Database
- SocialHub uses PostgreSQL `ContentPost` table (via Prisma in web app)
- Voice calls logged in `VoiceCallLog` table
- WAHA is stateless (Docker container, no persistent DB)

## API Contracts

### SocialHub Exposed (in web app)
- `POST /api/social/create` — generate and queue content
- `POST /api/social/approve` — approve content for publishing
- `POST /api/social/publish` — publish approved content

### WhatsApp WAHA
- `POST /api/sendText` — send text message
- `POST /api/sendVideo` — send video file
- `POST /api/sendFile` — send document
- `GET /api/sessions` — list active sessions

### Telnyx
- Assistant API for voice interactions
- Conversation polling API
- Call control API for transfers

## Key Integrations
- **Meta Graph API**: FB + IG publishing (permanent page token)
- **Kie.ai**: Image generation for social posts
- **Claude AI**: Content text generation
- **Aitable.ai**: Dashboard sync (API token: `uskBpO7SVJC8RMDSSOSs7tM`)
