# Universal Customer Onboarding System

## What This Is

A universal WhatsApp-first customer onboarding system for SuperSeller AI. Every new customer — regardless of which product they bought — gets a WhatsApp group auto-created with an AI agent. The agent dynamically assembles its behavior from the customer's subscribed products/services, then activates conversational modules (asset collection, social setup, competitor research, character questionnaire, video generation) based on what the customer bought. Includes BullMQ pipeline orchestration with admin commands, cost tracking, and stale detection.

## Current State

Shipped v1.3 (2026-03-16). 4 milestones complete (v1.0-v1.3), 19 phases, 40 plans.

Full character iteration pipeline: customers send natural-language change requests via WhatsApp → intent classification → cost confirmation → scene-level or character-level regen → admin approval gate for character changes → mixed-scene Remotion assembly → WhatsApp delivery → approve/change loop. Admin portal with version timeline, rollback, and cost audit.

Tech stack: Node.js worker + BullMQ + WAHA + ClaudeClaw + Sora 2 (via fal.ai/Kie.ai) + Remotion + R2 + PostgreSQL + Prisma/Drizzle.

**Next milestone:** Not yet defined. Run `/gsd:new-milestone` to start v1.4 planning.

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
- ✓ Multi-provider routing: fal.ai (Sora 2, Wan 2.6) + Kie.ai adapter pattern — v1.1
- ✓ Veo 3.1 re-integration for dialogue/talking head shots — v1.1
- ✓ fal.ai webhook endpoint with ED25519 verification — v1.1
- ✓ Per-clip generation metadata + quality scoring — v1.1
- ✓ Nightly quality aggregation feeding Observatory model routing — v1.1
- ✓ Prompt effectiveness tracking API — v1.1
- ✓ Per-clip cost attribution (model_id + provider in api_expenses) — v1.1
- ✓ BeforeAfterComposition parametric Remotion template (dual aspect ratio) — v1.1
- ✓ Auto-trigger onboarding from PayPal/Stripe subscription webhooks — v1.2
- ✓ Voice note transcription via Whisper with Hebrew support — v1.2
- ✓ Multi-language auto-detection and response (Hebrew/English) — v1.2

- ✓ Client-requested character changes via WhatsApp (scene-level + character-level) — v1.3
- ✓ Scene regeneration with modified character parameters (single + multi-scene) — v1.3
- ✓ Iterative refinement loop (request → classify → confirm → regen → approve/change) — v1.3
- ✓ Admin approval gate for character-level changes (approve/deny/narrow scope) — v1.3
- ✓ CharacterBible version timeline + rollback + cost audit in admin portal — v1.3

### Active

(None — v1.4 not yet defined. Run `/gsd:new-milestone` to plan next.)

### Backlog

- [ ] Module: Voice AI setup (FrontDesk Telnyx configuration)
- [ ] Pre-sale data architecture: prospect research in DB, template-driven landing pages
- [ ] Video prompt reference images / mood boards for Sora 2
- [ ] R2 CORS fix for video serving (currently must use same-origin)

### Out of Scope

- Web UI forms for onboarding — WhatsApp-first, PWA works well
- Customer self-service pipeline management — admin-only for now
- Music/audio on reveal video — visual-only for v1
- Offline mode — real-time WhatsApp is core value

## Context

Shipped v1.3 (2026-03-16). Cumulative: 19 phases, 40 plans across 4 milestones.
Tech stack: Node.js worker + BullMQ + WAHA + ClaudeClaw + Sora 2 (fal.ai/Kie.ai) + Remotion + R2 + PostgreSQL + Prisma/Drizzle + OpenAI Whisper.
Open tech debt: v1.0 (2 items — AgentForge placeholder, TS errors), v1.1 (2 items — FAL_WEBHOOK_VERIFY, fal.ai billing), v1.2 (3 items — INT-01/02/03 integration bugs), v1.3 (1 item — fal.ai handle consistency).
Known gap: pre-sale data architecture (customer research in files, not DB; landing pages hardcoded, not template-driven).

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
| Provider adapter inferred from modelId prefix | fal-ai/ → FalAdapter, wan/ → FalAdapter, else KieAdapter | ✓ Good — extensible, no config needed |
| Veo 3.1 re-integrated via Kie.ai | Reversed Feb 2026 Kling-only mandate; dialogue shots need Veo | ✓ Good — documented in DECISIONS.md #24 |
| veo:: prefix for job ID routing | Disambiguates Veo vs Kling pollStatus without DB schema change | ✓ Good — zero-migration solution |
| Flat props schema for Remotion | No nested branding object in BeforeAfterComposition | ✓ Good — simpler API for parametric templates |
| MIN_SAMPLES=20 for quality aggregation | Prevents noise from small samples corrupting Observatory scores | ✓ Good — below-threshold models retain static seeds |
| Direct SQL for WebhookEvent migration | Avoids dropping 20+ production tables from Prisma schema drift | ✓ Good — zero-downtime schema addition |
| Worker auth outside try/catch | WORKER_API_SECRET 401 returns before schema validation | ✓ Good — fast-fail for unauthorized requests |
| PayPal custom_id compact keys | 127 char PayPal limit requires {bn, svc} not full names | ✓ Good — fits all needed data |
| OpenAI Whisper API over local Ollama | Better accuracy for Hebrew, predictable costs at $0.006/min | ✓ Good — cost-effective for voice volume |
| effectiveBody pattern | transcribedText ∥ messageBody — single variable for all handlers | ✓ Good — clean transcription integration |
| Language instructions in English only | No dual-language system prompts; Claude handles language switching from English instructions | ✓ Good — simpler maintenance |
| Non-blocking admin alerts | sendAdminAlert catches errors internally to avoid masking primary failure path | ✓ Good — zero risk of alert code crashing pipeline |
| normalizeProvider() in expense-tracker | Single import for provider normalization, not a separate util | ✓ Good — clean API surface |
| generateScene returns { resultUrl, provider } | Provider attribution collocated with result, not in a closure | ✓ Good — accurate cost tracking |

---
*Last updated: 2026-03-16 after v1.3 milestone completion*
