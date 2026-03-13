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
1. Saar adds shai@superseller.agency as Admin on Elite Pro Facebook Page in Meta Business Suite
2. We get Page Access Token + IG Business Account ID from the Graph API (no username/password needed)
3. Fix IG_ACCOUNT_ID in config.py with correct ID
4. Set `DRY_RUN=False` (or `SS_DRY_RUN=false` env var)

**WRONG approach (previously asked)**: Do NOT ask for username+password. Meta Graph API needs Facebook Page Access Token + IG Business Account ID. Obtained by being added as Page Admin → OAuth flow.

## ElevenLabs Voice

Mor Dayan: `1prnFNmpCkb2bx39pQSi` (eleven_multilingual_v2)
Saar Bitton: `jlOXsp2JeEQ29fkljTTO` (eleven_multilingual_v2)
Used in V12 demo video — alternating dialogue pattern.

## Contract Status

eSignatures.com template ID: `99de20b5-2bb9-4439-9532-e00902fe6824`
Contract ID: `3c2ce265-4d1a-41db-a8ef-179f44b78eb8`
Contract signing link: https://esignatures.com/sign/2bd50a3f-2987-44ca-9264-3c0423038d45
Status: SENT to Saar (Mar 13, 2026). Stripe terms. Expires Mar 27, 2026.
Price: $2,000/mo (custom deal).

## Payment — STRIPE (NOT PayPal)

Stripe account: `acct_1R4wsKDE8rt1dEs1` (Rensto LLC)
Stripe product: `prod_U8UPuEkgpefAGQ`
Stripe price: `price_1TADQfDE8rt1dEs1PUPGDEfc` ($2,000/mo)
Checkout URL: https://superseller.agency/api/checkout/stripe-subscribe?tenant=elite-pro-remodeling
Old payment link (fallback): `plink_1TADQmDE8rt1dEs1gMlyRXCA`
Webhook: `we_1TADRKDE8rt1dEs1WfMIYsEm`
Tax: TX 8.25% on 80% of price (TX §151.351 data processing exemption) = $132/mo
Status: SENT to Saar (Mar 13, 2026), awaiting payment.

**PayPal was created in error (Mar 13) — DO NOT USE for Elite Pro.**

## Revenue Model

$2,000/mo + $132/mo TX sales tax via Stripe subscription. Post-payment flow fully wired: welcome email, invoice PDF, WhatsApp notifications, DB records, n8n forwarding.

## Content Strategy

- 16-20 Instagram Reels/month
- Competitive intelligence from 63 scraped ads (indexed in RAG)
- AI video clips (Kling 2.6/3.0, 5s, 9:16 vertical)
- No music, no text overlays
- Dual approval before publishing
- Weekly insights report via WhatsApp
