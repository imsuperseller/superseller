# Project: Admin Command Center — Single Pane of Glass

**Created:** 2026-03-11
**Milestone:** v1.0
**Type:** brownfield (extending existing admin.superseller.agency)

## Vision

Transform admin.superseller.agency from a fragmented dashboard into the **single source of truth** for all business operations. Every project (internal or customer), every deploy, every test, every alert, every customer audit — flows into one system with instant WhatsApp alerts when anything breaks.

## Problem Statement

Currently work is tracked across 7+ disconnected systems:
- Projects tab synthesizes fake data from ServiceInstance + WhatsAppInstance (no real Project table)
- Product status is a hardcoded array that never updates
- CI results don't exist on admin
- Customer onboarding has no structured audit trail
- Alerts fragment across WhatsApp, email, GitHub issues (don't talk to each other)
- External projects (Rensto, Yoram, Iron Dome) aren't visible
- progress.md/findings.md capture session work but aren't on admin

## Success Criteria

1. Real `Project` model in Prisma — everything is a project (customer work, internal infra, CI pipelines)
2. Customer audit system — 130+ fields from SuperSeller Business Audit stored per customer
3. Rensto city-launch playbook — 140+ fields stored as structured data
4. CI pipeline — runs on every push, results visible on admin within 2 min
5. Multi-project portfolio — GitHub/Vercel status for SuperSeller, Rensto, Yoram, Iron Dome
6. Unified alerts — one engine, one WhatsApp channel, admin shows all history
7. Every future task (big or small) creates/updates a Project record on admin

## Tech Stack

- **Database:** Prisma + PostgreSQL (existing)
- **Frontend:** Next.js 14+ React components (existing admin dashboard)
- **APIs:** Next.js API routes (existing pattern)
- **Alerting:** WAHA WhatsApp (existing) + alert-engine.ts (existing)
- **CI:** GitHub Actions (existing workflows to extend)
- **External APIs:** GitHub REST API, Vercel API (tokens already available)

## Key Constraints

- Must not break existing admin functionality (16 tabs, 34 API routes)
- Rensto data model is directory-specific (different from SuperSeller customer audit)
- Business separation rules: Rensto/SuperSeller/Personal repos stay separate
- Content extraction rule: NEVER invent content for customer-facing pages
