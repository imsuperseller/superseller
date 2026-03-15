# Universal Customer Onboarding System

## What This Is

A universal WhatsApp-first customer onboarding system for SuperSeller AI. Every new customer — regardless of which product they bought — gets a WhatsApp group auto-created with an AI agent. The agent dynamically assembles its behavior from the customer's subscribed products/services, then activates conversational modules (asset collection, social setup, competitor research, character questionnaire, video generation) based on what the customer bought. Includes BullMQ pipeline orchestration with admin commands, cost tracking, and stale detection.

## Core Value

Every customer gets an AI agent in a WhatsApp group from Day 1. Zero friction. The agent knows what the customer bought and handles onboarding, Q&A, asset collection, and delivery — all through WhatsApp. No web forms, no email chains, no manual steps.

## Requirements

### Validated

- ✓ Universal group auto-creation with product-aware AI agent — v1.0
- ✓ Dynamic system prompt assembly from tenant's ServiceInstance/products — v1.0
- ✓ Module: Asset collection (WhatsApp media → R2 → TenantAsset) — v1.0
- ✓ Module: Social media setup (conversational preference collection) — v1.0
- ✓ Module: Competitor research briefing (up to 3 competitors) — v1.0
- ✓ Module: Character questionnaire → CharacterBible via Claude — v1.0
- ✓ Module: Character video gen (Sora 2 → Remotion CharacterReveal → WhatsApp delivery) — v1.0
- ✓ Multi-model Best Shot routing with Model Observatory + budget enforcement — v1.0
- ✓ BullMQ pipeline orchestration with module routing — v1.0
- ✓ Admin commands (APPROVE/RETRY/SKIP/PAUSE) via WhatsApp — v1.0
- ✓ Cost tracking via trackExpense() + PipelineRun — v1.0
- ✓ Poll-based module selection (WhatsApp polls → pipeline advance) — v1.0
- ✓ Stale detection (48h customer nudge, 7d admin alert) — v1.0
- ✓ Admin status API (GET /api/onboarding/status/:tenantId) — v1.0

### Active

- [ ] Auto-trigger from PayPal/Stripe subscription webhook (new customer)
- [ ] Voice note transcription via Whisper before processing
- [ ] Multi-language auto-detection and response
- [ ] Module: Voice AI setup (FrontDesk Telnyx configuration)
- [ ] Client-requested character changes + scene regeneration

### Out of Scope

- Web UI forms for onboarding — WhatsApp-first, PWA works well
- Customer self-service pipeline management — admin-only for now
- Music/audio on reveal video — visual-only for v1
- Offline mode — real-time WhatsApp is core value

## Context

Shipped v1.0 with 14,213 LOC TypeScript across 80 files in 3 days.
Tech stack: Node.js worker + BullMQ + WAHA + ClaudeClaw + Kie.ai + Remotion + R2 + PostgreSQL.
7 phases, 15 plans, 46 requirements — all satisfied.
4 tech debt items (0 blockers): render failure silent fail, AgentForge placeholder, 2 pre-existing TS errors.

**Admin project ID:** `cmmpgo3k60000h5zuaxfqac80`

## Constraints

- **WhatsApp-first**: All customer interaction through WhatsApp groups
- **Product-aware**: Agent behavior driven by tenant's ServiceInstance config
- **Module architecture**: Each product onboarding flow is an independent module
- **Cost tracking**: Every API generation tracked via trackExpense()
- **Existing infra**: Build on worker BullMQ + WAHA + ClaudeClaw, not new systems

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Universal group + custom modules | Every customer gets WhatsApp group; what happens inside depends on products | ✓ Good — clean separation of concerns |
| Kie.ai for Sora 2 (not fal.ai) | Existing Kie.ai integration, proven pattern | ✓ Good — fal.ai adapter added as backup via model router |
| Admin trigger first, webhook later | Get it working manually before automating | ✓ Good — webhook trigger is v2 requirement |
| Module architecture | Product flows are independent, composable modules | ✓ Good — 5 modules built, easily extensible |
| Multi-model routing layer | Shared infrastructure for all video products | ✓ Good — Observatory integration + budget enforcement |
| Poll-based module selection | WhatsApp polls for user choice, not text parsing | ✓ Good — native WAHA NOWEB Plus support |
| Brand table (not TenantBrand) | Matches current Prisma schema | ✓ Good — avoided schema migration |
| Direct fetch for Claude API | @anthropic-ai/sdk not installed in worker | ✓ Good — no new dependency |

---
*Last updated: 2026-03-15 after v1.0 milestone*
