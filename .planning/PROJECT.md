# Universal Customer Onboarding System

## What This Is

A universal WhatsApp-first customer onboarding system for SuperSeller AI. Every new customer — regardless of which product they bought (VideoForge, SocialHub, FB Bot, FrontDesk, Lead Pages, Maps/SEO, Character-in-a-Box) — gets a WhatsApp group auto-created with an AI agent. The agent's behavior is configured per customer based on their subscribed products/services. Product-specific flows (video character creation, social media setup, competitor research, voice AI onboarding) are **modules** the agent activates based on what the customer bought.

## Core Value

Every customer gets an AI agent in a WhatsApp group from Day 1. Zero friction. The agent knows what the customer bought and handles onboarding, Q&A, asset collection, and delivery — all through WhatsApp. No web forms, no email chains, no manual steps.

## Requirements

### Validated

- ✓ WAHA client with full group management (createGroup, setGroupIcon, sendText, sendVideo, downloadMedia) — existing
- ✓ Group agent framework (group_agent_config, registry, system prompts, guardrails, 3-tier memory) — existing
- ✓ ClaudeClaw WhatsApp→Claude bridge with group support — existing
- ✓ BullMQ queue infrastructure — existing
- ✓ Tenant model with Brand, ServiceInstance, products — existing
- ✓ PipelineRun tracking + TenantAsset registry + R2 storage — existing
- ✓ CharacterBible DB table — existing
- ✓ PayPal/Stripe webhook handlers with subscription provisioning — existing
- ✓ Team onboarding page (/onboard/[tenantSlug]) — existing
- ✓ Remotion renderer (renderComposition for arbitrary compositions) — existing
- ✓ Kie.ai Sora 2 integration via createTask API — existing pattern in deanna-pitch-video.ts

### Active

- [ ] Universal group auto-creation on customer signup (triggered by PayPal/Stripe webhook OR admin action)
- [ ] Product-aware agent system prompt assembly (reads tenant's ServiceInstance/products to build prompt)
- [ ] Module: Onboarding welcome + product explanation
- [ ] Module: Character-in-a-Box questionnaire → CharacterBible → Sora 2 video gen → Remotion reveal → delivery
- [ ] Module: Social media setup (collect credentials, preferences, content style)
- [ ] Module: Asset collection (photos, logos, brand materials via WhatsApp media)
- [ ] Module: Competitor research briefing (share findings in group)
- [ ] Admin trigger + monitoring for onboarding pipeline
- [ ] BullMQ `customer-onboarding` queue for orchestration
- [ ] PipelineRun tracking at each module step

### Out of Scope

- Web UI forms for onboarding — WhatsApp-first
- Customer self-service pipeline management — admin-only for v1
- Auto-trigger from PayPal webhook — admin trigger first, webhook trigger in v2
- Voice note transcription — text-only responses for v1
- Multi-language auto-detection — configured per tenant language field

## Context

**9+ products that customers can subscribe to:**
1. VideoForge (AI property videos) — $79-$299/mo
2. Winner Studio (AI avatar videos) — 50 credits/video
3. SocialHub/Buzz (social media management) — $49-$199/mo
4. FB Marketplace Bot (automated listing) — custom pricing
5. FrontDesk Voice AI (AI receptionist) — per-call credits
6. Lead Landing Pages — $500-$2,000+/mo
7. Character-in-a-Box (AI brand character) — part of video products
8. Maps/SEO (Google Maps automation) — $297-$1,297/mo
9. Custom Solutions (Elite Pro style) — $2,000+/mo

**Each customer gets a different mix.** The AI agent must adapt to whatever products the customer has.

**Existing patterns to follow:**
- Elite Pro already has a WhatsApp group with ClaudeClaw agent
- Group agent framework supports per-group system prompts
- `register-customer-group.ts` CLI tool exists for manual registration
- Sora 2 accessed via Kie.ai API (not fal.ai directly): `POST /v1/jobs/createTask` with `model: "sora-2-pro-text-to-video"`

**Admin project ID:** `cmmpgo3k60000h5zuaxfqac80`

## Constraints

- **WhatsApp-first**: All customer interaction through WhatsApp groups
- **Product-aware**: Agent behavior driven by tenant's ServiceInstance config
- **Module architecture**: Each product onboarding flow is an independent module
- **Cost tracking**: Every API generation tracked via trackExpense()
- **Existing infra**: Build on worker BullMQ + WAHA + ClaudeClaw, not new systems
- **Kie.ai for Sora 2**: Use existing Kie.ai API pattern, NOT fal.ai

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Universal group + custom modules | Every customer gets WhatsApp group; what happens inside depends on products | — Pending |
| Kie.ai for Sora 2 (not fal.ai) | Existing Kie.ai integration, proven pattern | — Pending |
| Admin trigger first, webhook later | Get it working manually before automating | — Pending |
| Module architecture | Product flows are independent, composable modules | — Pending |

---
*Last updated: 2026-03-13 after user correction — broadened from Character-in-a-Box to universal onboarding*
