---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Production-Ready Onboarding
status: planning
stopped_at: Completed 13-02-PLAN.md
last_updated: "2026-03-15T18:06:55.788Z"
last_activity: 2026-03-15 — Roadmap created for v1.2 (phases 12-14)
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 6
  completed_plans: 6
---

# State: Universal Customer Onboarding System

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction
**Current focus:** Phase 12 — Payment Webhooks

## Current Position

Phase: 12 of 14 (Payment Webhooks)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-15 — Roadmap created for v1.2 (phases 12-14)

Progress (v1.2): [░░░░░░░░░░] 0% (3 phases, 0 complete)

## Performance Metrics

**Velocity (cumulative):**
- Total plans completed: 23 (v1.0 + v1.1)
- Average duration: ~25 min/plan
- Total execution time: ~9.6 hours

**By Milestone:**

| Milestone | Plans | Total | Avg/Plan |
|-----------|-------|-------|----------|
| v1.0 (phases 1-6) | 15 | ~6h | ~24 min |
| v1.1 (phases 07-10) | 8 | ~3.3h | ~25 min |
| v1.2 (phases 12-14) | 3 | ~54 min | ~18 min |

*Updated after each plan completion*
| Phase 12-payment-webhooks P01 | 4 | 3 tasks | 3 files |
| Phase 12-payment-webhooks P02 | 5 | 2 tasks | 2 files |
| Phase 12-payment-webhooks P04 | 18 | 2 tasks | 3 files |
| Phase 13-voice-note-transcription P01 | 12 | 1 tasks | 3 files |
| Phase 13-voice-note-transcription P02 | 4 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

See PROJECT.md Key Decisions table for full history.
Recent decisions affecting v1.2 work:

- [v1.0]: Admin trigger first, webhook later — now implementing webhook trigger in HOOK phase
- [v1.1]: FAL_WEBHOOK_VERIFY=false default — unrelated to v1.2 but open tech debt
- [Phase 12-payment-webhooks]: Used direct SQL instead of prisma db push for WebhookEvent migration to avoid dropping 20+ production tables from pre-existing schema drift
- [Phase 12-payment-webhooks]: Worker auth gate: WORKER_API_SECRET check outside try/catch so 401 returns before schema validation
- [Phase 12-plan-03]: PayPal custom_id uses compact keys (bn, svc) to stay under PayPal 127 char limit
- [Phase 12-plan-03]: CheckoutForm is 'use client', page.tsx is server component — standard Next.js App Router pattern
- [Phase 12-plan-03]: PayPal SDK via script tag (not @paypal/react-paypal-js — not installed in project)
- [Phase 12-payment-webhooks]: onboardNewCustomer is additive in both webhooks — all existing payment processing preserved
- [Phase 12-payment-webhooks]: PAYPAL_WEBHOOK_ID now mandatory (returns 500 if missing) — not silently skipped
- [Phase 12-payment-webhooks]: Webhook metrics added to system-monitoring API with bigint->Number coercion for PostgreSQL COUNT aggregates; SystemMonitor.tsx fetches both monitoring APIs in parallel
- [Phase 13-voice-note-transcription]: OpenAI Whisper API via verbose_json to get language+duration in single call; $0.006/min cost tracked dynamically
- [Phase 13-voice-note-transcription]: 5-minute max duration limit enforced before API call — pre-check saves R2 upload + API cost on oversized audio
- [Phase 13-voice-note-transcription]: No retry on 4xx errors (client errors), 3x retry with exponential backoff on 5xx/network errors
- [Phase 13-voice-note-transcription]: effectiveBody pattern: transcribedText || messageBody propagated to all group path handlers
- [Phase 13-voice-note-transcription]: maybeTranscribeAudio() helper shared by group path and DM path — no duplication

### Pending Todos

None captured yet for v1.2.

### Blockers/Concerns

- [v1.1] FAL_WEBHOOK_VERIFY=false default — needs live validation before enabling in production
- [v1.1] fal.ai billing on failure unknown — plan one test job before production tenant traffic
- [Phase 12] PayPal webhook signature method needs confirmation before implementation (HMAC-SHA256 with webhook ID)
- [Phase 13] Whisper deployment decision: local Ollama on RackNerd vs OpenAI Whisper API — cost vs latency tradeoff
- [Phase 14] RTL rendering in WAHA NOWEB — confirm if WhatsApp handles natively or if message formatting needed

## Session Continuity

Last session: 2026-03-15T18:06:55.786Z
Stopped at: Completed 13-02-PLAN.md
Resume file: None

---
*Last updated: 2026-03-15 — v1.2 roadmap created, phases 12-14*
