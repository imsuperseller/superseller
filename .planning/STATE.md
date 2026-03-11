# Project State

**Project:** Admin Command Center — Single Pane of Glass
**Milestone:** v1.0
**Started:** 2026-03-11
**Current Phase:** 1 (not started)

## Decisions

- **Database:** Prisma + PostgreSQL (same DB as existing, extend schema)
- **No new services:** Everything runs within existing Next.js app + existing admin routes
- **Audit model:** Generic template system — same structure serves SuperSeller playbook, Rensto playbook, future customer templates
- **Project types:** internal, customer, infrastructure, external (covers all use cases)
- **Alert consolidation:** Build on existing alert-engine.ts, don't replace
- **CI approach:** GitHub Actions + POST to API (no Trigger.dev, no external CI service)
- **Business separation:** Rensto/Yoram/Iron Dome are "external" projects with read-only GitHub/Vercel data, no code mixing

## History

- 2026-03-11: Project initialized from conversation about making admin.superseller.agency the single pane of glass
- 2026-03-11: SuperSeller Business Audit (130 questions) and Rensto Operations Playbook (140 questions) identified as data model sources
- 2026-03-11: Existing admin audit revealed fake Projects system (no DB table, synthesized from ServiceInstance+WhatsAppInstance)
- 2026-03-11: 7 disconnected tracking systems identified for consolidation
