# Milestones

## v1.3 Character Iteration (Shipped: 2026-03-16)

**Phases completed:** 5 phases, 10 plans, 6 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.2 Production-Ready Onboarding (Shipped: 2026-03-15)

**Phases completed:** 3 phases, 7 plans | 13 commits | 37 files | +4,174 LOC
**Timeline:** 1 day (2026-03-15)
**Git range:** `feat(12-01)..feat(14-01)` | `d276693a..5565e278`

**Delivered:** Zero-touch onboarding from payment to WhatsApp — PayPal/Stripe webhooks auto-create tenants, voice notes are transcribed via Whisper before AI processing, and the agent auto-detects Hebrew/English to respond in the customer's language.

**Key accomplishments:**
1. PayPal + Stripe subscription webhooks auto-trigger tenant creation + WhatsApp onboarding pipeline
2. Pre-checkout page with phone collection for both payment providers + branded success page
3. Webhook health monitoring with auto-alerts (>20% failure rate) in admin System Monitor
4. Voice note transcription via OpenAI Whisper API with R2 storage, cost tracking, 5-min limit
5. Bilingual Hebrew/English auto-detection across all 4 agent prompt paths (onboarding, groups, ClaudeClaw, character)

**Tech debt:**
- INT-01: Subscriptions page routes to old checkout flow, not new /checkout/[product]
- INT-02: PayPal custom_id key mismatch — 'bn' vs 'productName' (defaults to generic name)
- INT-03: Stripe webhook creates duplicate ServiceInstance for new checkout sessions

---

## v1.1 Intelligent Content Engine (Shipped: 2026-03-15)

**Phases completed:** 4 phases, 8 plans | 12 commits | 59 files | +6,439 LOC
**Timeline:** 1 day (2026-03-15)
**Git range:** `feat(07-02)..feat(10-01)` | `3a3c649d..26dbefc7`

**Delivered:** Multi-model content production with self-improving quality routing — fal.ai and Veo 3.1 activated, quality feedback loop closes the Observatory scoring gap, and parametric Remotion templates for local businesses.

**Key accomplishments:**
1. Multi-provider routing — fal.ai (Sora 2, Wan 2.6) activated alongside Kie.ai with adapter pattern
2. Veo 3.1 re-integrated for dialogue/talking head shots via Kie.ai API
3. fal.ai webhook endpoint with ED25519 signature verification and idempotent processing
4. Per-clip generation metadata + quality scoring + per-clip cost attribution
5. Nightly quality aggregation job feeding Observatory model routing (self-improving)
6. BeforeAfterComposition parametric Remotion template for local businesses (dual aspect ratio)

**Tech debt:**
- FAL_WEBHOOK_VERIFY=false default — ED25519 check needs live validation before enabling
- fal.ai billing on failure unknown — need test job before production tenant traffic

---

## v1.0 Universal Customer Onboarding System (Shipped: 2026-03-15)

**Phases completed:** 7 phases, 15 plans | 63 commits | 80 files | +14,213 LOC
**Timeline:** 3 days (2026-03-12 → 2026-03-14)
**Git range:** `feat(01-01)..docs(phase-06)` | `9f268ec7..39dcd1f5`

**Delivered:** Universal WhatsApp-first customer onboarding system — every new customer gets an AI agent in a WhatsApp group that knows their products and handles onboarding through conversational modules.

**Key accomplishments:**
1. Product-aware AI agent with dynamic system prompts assembled from tenant's product mix
2. Module architecture with priority-based routing — asset collection, social setup, competitor research
3. AI character questionnaire → CharacterBible generation via Claude
4. Multi-model "Best Shot" routing with Model Observatory integration + budget enforcement
5. Sora 2 scene generation + Remotion CharacterReveal composition + WhatsApp delivery
6. BullMQ pipeline orchestration with admin commands (APPROVE/RETRY/SKIP/PAUSE), cost tracking, stale detection

**Tech debt (4 items, 0 blockers):**
- Render failure silent fail (no WhatsApp fallback notification)
- AgentForge integration is placeholder (competitorResearchPending flag, no consumer)
- Pre-existing TS errors in social-setup.ts and routes.ts (runtime unaffected)

---

