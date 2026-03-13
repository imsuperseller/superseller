# State: Universal Customer Onboarding System

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction
**Current focus:** Phase 1 — Universal Group + Product-Aware Agent

## Current Phase

**Phase:** 1 — Universal Group + Product-Aware Agent
**Status:** Complete
**Current Plan:** 2 of 2
**Progress:** [====================] 2/2 plans complete

## Decisions

- Used `Brand` table (not `TenantBrand`) — matches current Prisma schema
- Pass inputJson as object to createPipelineRun (avoids double-stringify bug)
- ServiceInstance takes priority over Subscription when deduplicating products
- Auto-approved human-verify checkpoint for 01-02: type-check clean, worker healthy, WhatsApp test deferred to integration

## Phase History

- **01-01** (Core Onboarding Modules): COMPLETE — prompt-assembler + group-bootstrap (2min)
- **01-02** (API Endpoint + Verification): COMPLETE — POST /api/onboarding/start wired (1min)

## Blockers

None identified.

## Notes

- Admin project ID: `cmmpgo3k60000h5zuaxfqac80`
- DB foundation already built (CharacterBible, PipelineRun, TenantAsset tables)
- WAHA client has full group management capabilities
- Group agent framework exists and is production-tested
- ServiceInstance + Subscription tables track customer's products (no enums — string types)
- Sora 2 accessed via Kie.ai API (NOT fal.ai): `POST /v1/jobs/createTask` with `model: "sora-2-pro-text-to-video"`
- Old `character-pipeline/group-bootstrap.ts` exists but is too narrow — Phase 1 replaces it with universal `onboarding/group-bootstrap.ts`

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| 01-01 | 2min | 2 | 3 |
| 01-02 | 1min | 2 | 1 |

## Last Session

- **Stopped at:** Completed 01-02-PLAN.md (Phase 1 complete)
- **Timestamp:** 2026-03-13T22:51:21Z

---
*Last updated: 2026-03-13 — completed plan 01-02 (Phase 1 complete)*
