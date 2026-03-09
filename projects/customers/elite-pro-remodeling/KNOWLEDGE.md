# Elite Pro Remodeling — Knowledge Base

## Business Profile

Elite Pro Remodeling and Construction LLC. Dallas TX (17744 Preston Rd STE 200, 75252). 4.9★ BBB-listed remodeling contractor. Services: kitchen/bath/bedroom remodel, new construction, pools, landscaping, foundation, roofing, fencing, concrete, electrical gates, smart security, siding, windows/doors, driveways.

Massive quality-visibility gap: 4.9 stars but only 22 IG followers / 9 posts. This is the core opportunity.

**Contacts:**
- Saar Bitton — owner/co-founder
- Mor Dayan — project manager (she handles day-to-day comms)
- Mike — field PM
- Nir — crew lead
- Luis Alfaro, Fort Worth — testimonial: "They did an incredible job, and finished early."

## What We've Delivered

**V12 Demo Video** (Mar 6, 2026, COMPLETE):
- 25.7s, 1080x1920, crossfade transitions (0.4s), background music at 12% volume
- Scene flow: Yard sign drone → demolished wall (BEFORE) → gutted bathroom (BEFORE) → marble shower (AFTER) → fireplace living room (AFTER + testimonial) → logo CTA card
- R2: `elite-pro-demo/elite-pro-v12-final.mp4`
- Assets on R2 (`elite-pro-demo/`): yard-sign.jpeg, before-{1,2,3}.jpeg, after-{1,2,3,4,5}.jpeg, logo.png, mor-voice-clean.mp3

**ClaudeClaw group agent** — LIVE in `120363408376076110@g.us`, tenant `elite-pro-remodeling`

**Landing page** — https://elite-pro-landing.vercel.app (Vercel)

## Instagram Pipeline (BLOCKED, Not Live)

Three Python agents running on RackNerd at `/opt/superseller-agents/`:
- **Scout Agent** — weekly IG ad scraping (63 competitor ads indexed in RAG)
- **Creator Agent** — daily: Claude → Kie.ai Kling 2.6 video → R2 → Aitable
- **Publisher Agent** — dual WhatsApp approval (Saar + Mor) → IG Graph API

**Current state**: All agents running on cron schedule, but `DRY_RUN=True` in config.py. Content is being generated and stored in Aitable but nothing is actually posted. WhatsApp sends are failing (blocked in dry run mode).

**Config errors in `/opt/superseller-agents/config.py`**:
1. `IG_ACCESS_TOKEN` — expired March 4, 2026. Needs Meta App ID/Secret from Saar to refresh.
2. `IG_ACCOUNT_ID = "17841410951596580"` — WRONG (this is SuperSeller's account). Need Elite Pro's actual IG account ID.
3. `ANTHROPIC_API_KEY` — different key from main worker (not a blocker, just different)

**To go live** (in order):
1. Get Meta App ID + Secret from Saar
2. Get Saar + Mor phone numbers for dual WhatsApp approval
3. Fix IG_ACCOUNT_ID in config.py
4. Refresh IG access token
5. Set `DRY_RUN=False` (or `SS_DRY_RUN=false` env var)

## ElevenLabs Voice

Mor Dayan: `1prnFNmpCkb2bx39pQSi` (eleven_multilingual_v2)
Saar Bitton: `jlOXsp2JeEQ29fkljTTO` (eleven_multilingual_v2)
Used in V12 demo video — alternating dialogue pattern.

## Contract Status

eSignatures.com template ID: `99de20b5-2bb9-4439-9532-e00902fe6824`
Status: NOT YET SENT. Waiting for Saar to formally commit to $2,000/mo.
Price: $2,000/mo (custom deal — not in the SaaS billing system).

## Revenue Model

$2,000/mo custom retainer (signed verbally, contract not sent). This is NOT a SaaS plan — it's a managed service agreement. No credits consumed. Manual invoicing (or PayPal invoice when we send).

## Content Strategy

- 16-20 Instagram Reels/month
- Competitive intelligence from 63 scraped ads (indexed in RAG)
- AI video clips (Kling 2.6/3.0, 5s, 9:16 vertical)
- No music, no text overlays
- Dual approval before publishing
- Weekly insights report via WhatsApp
