---
name: Product Catalog
description: All SuperSeller AI products with status, revenue model, and tech stack
---

# Product Catalog

## Live Products (3)

### TourReel — AI Property Videos
- **Status**: LIVE, 25+ videos produced
- **Customers**: Realtors (general market)
- **Revenue**: 50 credits/video, subscription tiers
- **Tech**: Kling 3.0 + Remotion 4.0 + FFmpeg + R2
- **Code**: `apps/worker/src/queue/workers/`, `apps/worker/remotion/`

### FB Marketplace Bot — Auto-Lister
- **Status**: LIVE since Feb 20, 2026
- **Customers**: UAD Garage Doors, MissParty Rentals
- **Revenue**: Per listing activation
- **Tech**: GoLogin + Kie.ai image gen + Firestore (pending Postgres migration)
- **Code**: `platforms/marketplace/`, `fb marketplace lister/deploy-package/`

### SocialHub/Buzz — Social Content AI
- **Status**: LIVE Phase 1
- **Features**: Claude text → Kie.ai image → WhatsApp approval → FB publish
- **Revenue**: Future $49-$199/mo subscription
- **Tech**: Claude API + Kie.ai + Meta Graph API + WAHA

## Built, Not Active (1)

### Winner Studio — AI Avatar Videos
- **Status**: Code verified end-to-end, Yossi not actively using
- **Customers**: Yossi/Mivnim (construction)
- **Revenue**: 50 credits/video
- **Tech**: Gemini brain + Kie.ai Avatar Pro + WAHA delivery

## Infrastructure Ready (3)

### Lead Landing Pages
- **Status**: /lp/[slug] code ready, no active customer pages
- **Tech**: Next.js dynamic routes, per-customer branding (colors, RTL/LTR)

### FrontDesk Voice AI
- **Status**: Voice assistant works, webhook migration pending
- **Tech**: Telnyx + KokoroTTS + Deepgram Nova 3
- **Phone**: +14699299314

### RAG/pgvector Search
- **Status**: Built, zero products connected
- **Tech**: Ollama nomic-embed-text (768-dim) + pgvector HNSW

## Spec Only (1)

### AgentForge — AI Research Pipeline
- **Status**: Internal tool decision made, code not started
- **Vision**: Multi-stage business discovery → design analysis → market research → deliverables

## Revenue Target: $20K/month by 2027
- Mature 3 live products → 10-15 customers each
- Activate Lead Pages + SocialHub Phase 2
- Enable self-serve onboarding
