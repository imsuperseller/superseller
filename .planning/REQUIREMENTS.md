# Requirements: Universal Customer Onboarding System

**Defined:** 2026-03-13
**Updated:** 2026-03-13 — corrected from Character-in-a-Box to universal onboarding
**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — zero friction, product-aware onboarding

## v1 Requirements

### Universal Group Creation (UGRP)

- [x] **UGRP-01**: Admin can trigger onboarding for any tenant via API endpoint (`POST /api/onboarding/start`)
- [x] **UGRP-02**: System auto-creates a WhatsApp group named "[BusinessName] — SuperSeller AI" with client phone + AI agent
- [x] **UGRP-03**: System reads tenant's ServiceInstance + Subscription records to determine which products the customer has
- [x] **UGRP-04**: Group icon set from tenant's Brand logo (if available)
- [x] **UGRP-05**: Group description includes customer name and list of active products/services

### Product-Aware Agent (PAGENT)

- [x] **PAGENT-01**: AI agent registered in group_agent_config with product-aware system prompt
- [x] **PAGENT-02**: System prompt assembled dynamically from tenant's active products (reads ServiceInstance/Subscription)
- [x] **PAGENT-03**: Agent knows which onboarding modules to activate based on customer's product mix
- [x] **PAGENT-04**: Agent sends personalized welcome message listing what it will help with (based on products)
- [x] **PAGENT-05**: Agent can handle general Q&A about any SuperSeller product the customer has

### Module: Character-in-a-Box (CHAR)

- [ ] **CHAR-01**: Agent activates character questionnaire when customer has VideoForge/Winner Studio/Character-in-a-Box product
- [ ] **CHAR-02**: Agent asks brand personality, visual style, target audience, 3 business scenarios — ONE question at a time
- [ ] **CHAR-03**: Agent handles text responses, asks follow-ups for vague answers
- [ ] **CHAR-04**: Agent confirms collected info with client, generates CharacterBible in DB via Claude
- [ ] **CHAR-05**: System generates reference character video via Kie.ai Sora 2 API
- [ ] **CHAR-06**: System generates 5 test scene videos via Kie.ai Sora 2 (job site, studio, street, office, stylized)
- [ ] **CHAR-07**: Remotion "CharacterReveal" composition wraps 5 scenes with branded overlays (logo, name, colors)
- [ ] **CHAR-08**: FFmpeg renders final MP4 on RackNerd, uploaded to R2 as TenantAsset
- [ ] **CHAR-09**: WAHA delivers character reveal video to WhatsApp group with summary message
- [ ] **CHAR-10**: All generation steps tracked via PipelineRun with cost via trackExpense()

### Module: Asset Collection (ASSET)

- [x] **ASSET-01**: Agent activates asset collection when customer has any visual product (VideoForge, Lead Pages, SocialHub)
- [x] **ASSET-02**: Agent requests business photos, logos, brand materials via WhatsApp media messages
- [x] **ASSET-03**: Received media downloaded via WAHA, uploaded to R2, registered as TenantAsset
- [x] **ASSET-04**: Agent categorizes assets (logo, photo, document) and confirms receipt

### Module: Social Media Setup (SOCIAL)

- [x] **SOCIAL-01**: Agent activates social setup when customer has SocialHub/Buzz product
- [x] **SOCIAL-02**: Agent collects social media credentials and preferences (platforms, posting frequency, content style)
- [x] **SOCIAL-03**: Agent stores preferences in ServiceInstance.configuration JSON
- [x] **SOCIAL-04**: Agent explains what SocialHub will do and sets expectations

### Module: Competitor Research Briefing (COMPETE)

- [x] **COMPETE-01**: Agent activates competitor briefing when customer has Maps/SEO or Lead Pages product
- [x] **COMPETE-02**: Agent asks for top 3 competitors (names, URLs, locations)
- [x] **COMPETE-03**: Agent stores competitor info in ServiceInstance.configuration or dedicated table
- [x] **COMPETE-04**: Agent shares initial findings in group when AgentForge research completes

### Pipeline Orchestration (PIPE)

- [ ] **PIPE-01**: BullMQ `customer-onboarding` queue orchestrates the full flow
- [ ] **PIPE-02**: Pipeline determines which modules to run based on tenant's products
- [ ] **PIPE-03**: Pipeline handles failures gracefully — retries, alerts on permanent failure
- [ ] **PIPE-04**: Pipeline tracks total cost via trackExpense() and PipelineRun
- [ ] **PIPE-05**: Admin can view onboarding status via admin API

## v2 Requirements

### Automation Triggers

- **AUTO-01**: Pipeline auto-triggers on PayPal/Stripe subscription webhook (new customer)
- **AUTO-02**: Voice note transcription via Whisper before processing
- **AUTO-03**: Multi-language auto-detection and response

### Module: Voice AI Setup (VOICE)

- **VOICE-01**: Agent activates when customer has FrontDesk Voice AI product
- **VOICE-02**: Agent collects business hours, greeting preferences, transfer rules
- **VOICE-03**: Agent configures Telnyx assistant via API

### Enhanced Character

- **ECHAR-01**: Client can request changes to character via WhatsApp
- **ECHAR-02**: System regenerates specific scenes based on feedback

## Out of Scope

| Feature | Reason |
|---------|--------|
| Web UI forms for onboarding | WhatsApp-first — zero friction |
| Customer self-service pipeline | Admin-only for v1 |
| Auto-trigger from webhooks | Admin trigger first, webhook in v2 |
| Voice note transcription | Text-only for v1 |
| Multi-language auto-detection | Per-tenant language field for v1 |
| Music/audio on reveal video | Visual-only for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UGRP-01 | Phase 1 | Complete (01-02) |
| UGRP-02..05 | Phase 1 | Complete (01-01) |
| PAGENT-01..05 | Phase 1 | Complete (01-01) |
| ASSET-01..04 | Phase 2 | Pending |
| SOCIAL-01..04 | Phase 2 | Pending |
| COMPETE-01..04 | Phase 2 | Pending |
| CHAR-01..04 | Phase 3 | Pending |
| CHAR-05..10 | Phase 4 | Pending |
| PIPE-01..05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 — rewritten for universal onboarding (not just Character-in-a-Box)*
