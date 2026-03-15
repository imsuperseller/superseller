# Requirements: Universal Customer Onboarding System

**Defined:** 2026-03-15
**Core Value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction

## v1.2 Requirements

Requirements for Production-Ready Onboarding milestone.

### Webhook Triggers

- [x] **HOOK-01**: Onboarding auto-triggers when PayPal subscription webhook fires for new customer
- [x] **HOOK-02**: Onboarding auto-triggers when Stripe subscription webhook fires for new customer
- [x] **HOOK-03**: Webhook handler creates Tenant + ServiceInstance before triggering pipeline
- [x] **HOOK-04**: Duplicate webhook events are idempotent (no double onboarding)
- [x] **HOOK-05**: Failed webhook processing retries with exponential backoff

### Voice Notes

- [ ] **VOICE-01**: Agent transcribes incoming WhatsApp voice notes before processing
- [ ] **VOICE-02**: Transcription uses Whisper (local Ollama or API) with Hebrew support
- [ ] **VOICE-03**: Transcribed text is passed to ClaudeClaw as if user typed it
- [ ] **VOICE-04**: Original voice note stored in R2 alongside transcription

### Language

- [ ] **LANG-01**: Agent auto-detects message language (Hebrew/English) per message
- [ ] **LANG-02**: Agent responds in the same language the customer used
- [ ] **LANG-03**: System prompts include bilingual instructions for all modules
- [ ] **LANG-04**: RTL text rendering works correctly in WhatsApp responses

## Future Requirements (v1.3+)

### Voice AI

- **VOICEAI-01**: Module: Voice AI setup (FrontDesk Telnyx configuration)

### Character Management

- **CHAR-01**: Client-requested character changes + scene regeneration

## Out of Scope

| Feature | Reason |
|---------|--------|
| SMS/email onboarding triggers | WhatsApp-first — payment webhook → WhatsApp group is the flow |
| Google/Apple Pay webhooks | PayPal + Stripe cover all current payment methods |
| Real-time translation | Auto-detect + respond in same language is sufficient; no mid-message translation |
| Voice note summarization | Full transcription passed to agent — agent handles context |
| Arabic/Russian language support | Hebrew + English covers current customer base; add languages as needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOOK-01 | Phase 12 | Complete |
| HOOK-02 | Phase 12 | Complete |
| HOOK-03 | Phase 12 | Complete |
| HOOK-04 | Phase 12 | Complete |
| HOOK-05 | Phase 12 | Complete |
| VOICE-01 | Phase 13 | Pending |
| VOICE-02 | Phase 13 | Pending |
| VOICE-03 | Phase 13 | Pending |
| VOICE-04 | Phase 13 | Pending |
| LANG-01 | Phase 14 | Pending |
| LANG-02 | Phase 14 | Pending |
| LANG-03 | Phase 14 | Pending |
| LANG-04 | Phase 14 | Pending |

**Coverage:**
- v1.2 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 — phase traceability added (phases 12-14)*
