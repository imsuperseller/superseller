# Roadmap: Universal Customer Onboarding System

**Created:** 2026-03-13
**Updated:** 2026-03-13 — rewritten for universal onboarding (not just Character-in-a-Box)
**Phases:** 5
**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Universal Group + Product-Aware Agent | Auto-create WhatsApp group with AI agent that knows customer's products | UGRP-01..05, PAGENT-01..05 | 5 |
| 2 | Onboarding Modules: Asset Collection, Social Setup, Competitor Research | Product-specific conversational flows inside the group | ASSET-01..04, SOCIAL-01..04, COMPETE-01..04 | 4 |
| 3 | Module: Character Questionnaire | AI-driven brand character questionnaire → CharacterBible | CHAR-01..04 | 4 |
| 4 | Module: Character Video Generation + Delivery | Kie.ai Sora 2 → Remotion reveal → WhatsApp delivery | CHAR-05..10 | 4 |
| 5 | Pipeline Orchestration | BullMQ end-to-end pipeline with module routing, cost tracking, admin visibility | PIPE-01..05 | 4 |

---

## Phase 1: Universal Group + Product-Aware Agent

**Goal:** When admin triggers onboarding for a tenant, system creates a WhatsApp group, reads the tenant's products (ServiceInstance + Subscription), assembles a product-aware system prompt, registers the AI agent, and sends a personalized welcome.

**Requirements:** UGRP-01..05, PAGENT-01..05

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Core modules: prompt-assembler + universal group-bootstrap
- [ ] 01-02-PLAN.md — API endpoint + end-to-end verification

**Success Criteria:**
1. `POST /api/onboarding/start` with tenantId + clientPhone creates WhatsApp group
2. System reads tenant's ServiceInstance/Subscription records to know which products they have
3. AI agent system prompt is assembled dynamically based on active products
4. Agent sends welcome message listing specific products and what it will help with
5. Agent responds to messages with product-aware context (knows what customer bought)

**Key files to create/modify:**
- `apps/worker/src/services/onboarding/group-bootstrap.ts` — Universal group creation (replaces character-specific version)
- `apps/worker/src/services/onboarding/prompt-assembler.ts` — Build system prompt from tenant's product mix
- `apps/worker/src/api/routes.ts` — Add `/api/onboarding/start` endpoint
- Uses: `waha-client.ts`, `group-agent.ts`, `pipeline-run.ts`
- Reads: `ServiceInstance`, `Subscription`, `TenantBrand` via DB queries

---

## Phase 2: Onboarding Modules — Asset Collection, Social Setup, Competitor Research

**Goal:** Build the lightweight conversational modules that the product-aware agent activates based on customer's products. These collect info and assets — no heavy generation.

**Requirements:** ASSET-01..04, SOCIAL-01..04, COMPETE-01..04

**Success Criteria:**
1. Asset collection module downloads media from WhatsApp, uploads to R2, registers as TenantAsset
2. Social setup module collects credentials/preferences, stores in ServiceInstance.configuration
3. Competitor research module collects competitor info, triggers AgentForge research
4. Each module activates only when the customer has the relevant product

**Key files to create/modify:**
- `apps/worker/src/services/onboarding/modules/asset-collection.ts`
- `apps/worker/src/services/onboarding/modules/social-setup.ts`
- `apps/worker/src/services/onboarding/modules/competitor-research.ts`
- `apps/worker/src/services/onboarding/module-router.ts` — Routes to correct module based on conversation state

---

## Phase 3: Module — Character Questionnaire

**Goal:** AI agent conducts structured character creation questionnaire, collects brand info, generates CharacterBible in DB.

**Requirements:** CHAR-01..04

**Success Criteria:**
1. Questionnaire activates only for tenants with video products (VideoForge, Winner Studio, Character-in-a-Box)
2. Agent tracks questionnaire state across messages (which questions asked/answered)
3. Agent confirms collected info, then generates CharacterBible via Claude
4. CharacterBible saved to DB with all fields (persona, visual style, audience, scenarios)

**Key files to create/modify:**
- `apps/worker/src/services/onboarding/modules/character-questionnaire.ts`
- `apps/worker/src/services/onboarding/character-bible-generator.ts`
- Uses: `claudeclaw` queue for Claude responses

---

## Phase 4: Module — Character Video Generation + Delivery

**Goal:** Generate character videos via Kie.ai Sora 2, wrap in Remotion reveal, deliver via WhatsApp.

**Requirements:** CHAR-05..10

**Success Criteria:**
1. Kie.ai Sora 2 generates reference + 5 scene videos from CharacterBible prompts
2. Remotion CharacterReveal composition renders branded video with all 5 scenes
3. Final video uploaded to R2, registered as TenantAsset
4. WAHA delivers video to WhatsApp group with summary

**Key files to create/modify:**
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — Kie.ai Sora 2 integration
- `apps/worker/remotion/src/CharacterRevealComposition.tsx` — Remotion composition
- `apps/worker/remotion/src/Root.tsx` — Register new composition
- Uses: `remotion-renderer.ts`, `r2.ts`, `waha-client.ts`, `pipeline-run.ts`

---

## Phase 5: Pipeline Orchestration

**Goal:** Wire everything into a BullMQ pipeline that routes to correct modules based on tenant's products, with error handling, cost tracking, and admin visibility.

**Requirements:** PIPE-01..05

**Success Criteria:**
1. `customer-onboarding` BullMQ queue routes jobs to appropriate modules
2. Module selection driven by tenant's ServiceInstance/Subscription records
3. Pipeline retries failed steps (max 3), alerts on permanent failure
4. Total cost tracked via trackExpense() and PipelineRun
5. Admin can view onboarding status via GET `/api/onboarding/status/:tenantId`

**Key files to create/modify:**
- `apps/worker/src/queue/queues.ts` — Add `customerOnboardingQueue`
- `apps/worker/src/queue/workers/onboarding.worker.ts` — Main pipeline worker with module routing
- `apps/worker/src/api/routes.ts` — Add status endpoint

---

## Dependencies

```
Phase 1 (Universal Group + Agent) ← Foundation — everything depends on this
    ↓
Phase 2 (Light Modules: Asset, Social, Compete) — can run in parallel with Phase 3
Phase 3 (Character Questionnaire) — can run in parallel with Phase 2
    ↓
Phase 4 (Character Video Gen + Delivery) — depends on Phase 3
    ↓
Phase 5 (Pipeline Orchestration) — wires 1-4 together, can start after Phase 1-2
```

Phase 2 and Phase 3 are independent and can be built in parallel.
Phase 5 can start partially after Phase 1 is done (queue + routing skeleton).

---
*Created: 2026-03-13*
*Last updated: 2026-03-13 — rewritten for universal onboarding*
