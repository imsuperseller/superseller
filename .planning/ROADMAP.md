# Roadmap: Universal Customer Onboarding System

**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction

## Milestones

- ✅ **v1.0 MVP** — Phases 1-6 (shipped 2026-03-15) — [Archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Intelligent Content Engine** — Phases 07-10 (shipped 2026-03-15) — [Archive](milestones/v1.1-ROADMAP.md)
- 🚧 **v1.2 Production-Ready Onboarding** — Phases 12-14 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-6) — SHIPPED 2026-03-15</summary>

- [x] Phase 1: Universal Group + Product-Aware Agent (2/2 plans) — completed 2026-03-12
- [x] Phase 2: Onboarding Modules — Asset, Social, Compete (3/3 plans) — completed 2026-03-13
- [x] Phase 3: Character Questionnaire (1/1 plan) — completed 2026-03-13
- [x] Phase 3.1: Multi-Model Best Shot Routing (2/2 plans) — completed 2026-03-13
- [x] Phase 4: Character Video Gen + Delivery (3/3 plans) — completed 2026-03-14
- [x] Phase 5: Pipeline Orchestration (2/2 plans) — completed 2026-03-14
- [x] Phase 6: Fix Social Intro + Poll Vote (2/2 plans) — completed 2026-03-14

</details>

<details>
<summary>✅ v1.1 Intelligent Content Engine (Phases 07-10) — SHIPPED 2026-03-15</summary>

- [x] Phase 07: Provider Foundation (2/2 plans) — completed 2026-03-15
- [x] Phase 08: Provider Activation (2/2 plans) — completed 2026-03-15
- [x] Phase 09: Quality Feedback Loop (3/3 plans) — completed 2026-03-15
- [x] Phase 10: Remotion Templates (1/1 plan) — completed 2026-03-15

</details>

### 🚧 v1.2 Production-Ready Onboarding (In Progress)

**Milestone Goal:** Onboarding triggers automatically from payment webhooks, understands voice notes in Hebrew and English, and responds in the customer's language — zero manual steps from payment to WhatsApp group.

- [x] **Phase 12: Payment Webhooks** — PayPal and Stripe subscription events auto-create tenant and fire onboarding pipeline (completed 2026-03-15)
- [ ] **Phase 13: Voice Note Transcription** — Whisper transcribes incoming voice notes before agent processes them
- [ ] **Phase 14: Language Detection** — Agent auto-detects Hebrew/English and responds in kind

## Phase Details

### Phase 12: Payment Webhooks
**Goal**: A new customer's payment subscription event — from PayPal or Stripe — automatically creates their tenant, provisions their service instances, and fires the onboarding pipeline with no manual trigger required
**Depends on**: Phase 10 (v1.1 complete)
**Requirements**: HOOK-01, HOOK-02, HOOK-03, HOOK-04, HOOK-05
**Success Criteria** (what must be TRUE):
  1. A new PayPal subscription webhook fires and a WhatsApp onboarding group exists within seconds — no admin action required
  2. A new Stripe subscription webhook fires and a WhatsApp onboarding group exists within seconds — no admin action required
  3. Firing the same webhook event twice results in exactly one onboarding pipeline (no duplicate groups)
  4. A webhook that fails to process is automatically retried and eventually succeeds or alerts admin
**Plans:** 4/4 plans complete

Plans:
- [ ] 12-01-PLAN.md — Foundation: WebhookEvent schema, shared onboardNewCustomer service, worker API extension
- [ ] 12-02-PLAN.md — Wire PayPal and Stripe webhooks to shared onboarding service
- [x] 12-03-PLAN.md — Pre-checkout page (phone collection) and success page
- [ ] 12-04-PLAN.md — Admin webhook monitoring and end-to-end verification

### Phase 13: Voice Note Transcription
**Goal**: When a customer sends a voice note in their WhatsApp onboarding group, the agent transcribes it via Whisper and processes the text as if the customer typed it — Hebrew and English both supported
**Depends on**: Phase 12
**Requirements**: VOICE-01, VOICE-02, VOICE-03, VOICE-04
**Success Criteria** (what must be TRUE):
  1. Customer sends a voice note in Hebrew and the agent replies with a relevant response in the conversation (not an error or silence)
  2. Customer sends a voice note in English and the agent replies correctly
  3. The original voice note audio file is accessible in R2 storage after processing
  4. The transcribed text that was passed to the agent is recoverable (stored alongside the voice note)
**Plans**: TBD

### Phase 14: Language Detection
**Goal**: The agent automatically detects whether the customer is writing in Hebrew or English and responds in that same language throughout all onboarding modules
**Depends on**: Phase 13
**Requirements**: LANG-01, LANG-02, LANG-03, LANG-04
**Success Criteria** (what must be TRUE):
  1. Customer sends a Hebrew message and agent responds in Hebrew — no manual configuration required
  2. Customer sends an English message and agent responds in English — no manual configuration required
  3. Customer switches from Hebrew to English mid-conversation and the agent switches with them on the next response
  4. Hebrew text in WhatsApp messages renders right-to-left correctly (not garbled)
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Universal Group + Agent | v1.0 | 2/2 | Complete | 2026-03-12 |
| 2. Onboarding Modules | v1.0 | 3/3 | Complete | 2026-03-13 |
| 3. Character Questionnaire | v1.0 | 1/1 | Complete | 2026-03-13 |
| 3.1. Best Shot Routing | v1.0 | 2/2 | Complete | 2026-03-13 |
| 4. Character Video Gen | v1.0 | 3/3 | Complete | 2026-03-14 |
| 5. Pipeline Orchestration | v1.0 | 2/2 | Complete | 2026-03-14 |
| 6. Fix Social + Poll Vote | v1.0 | 2/2 | Complete | 2026-03-14 |
| 07. Provider Foundation | v1.1 | 2/2 | Complete | 2026-03-15 |
| 08. Provider Activation | v1.1 | 2/2 | Complete | 2026-03-15 |
| 09. Quality Feedback Loop | v1.1 | 3/3 | Complete | 2026-03-15 |
| 10. Remotion Templates | v1.1 | 1/1 | Complete | 2026-03-15 |
| 12. Payment Webhooks | 4/4 | Complete    | 2026-03-15 | - |
| 13. Voice Note Transcription | v1.2 | 0/TBD | Not started | - |
| 14. Language Detection | v1.2 | 0/TBD | Not started | - |

---
*Created: 2026-03-13*
*Updated: 2026-03-15 — Phase 12 plan 03 complete (checkout pages + Stripe session API)*
