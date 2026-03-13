---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_plan: 02-01 complete
status: executing
stopped_at: Completed 02-01-PLAN.md
last_updated: "2026-03-13T23:21:20.039Z"
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 5
  completed_plans: 3
  percent: 60
---

# State: Universal Customer Onboarding System

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction
**Current focus:** Phase 2 — Onboarding Modules (Asset, Social, Compete)

## Current Phase

**Phase:** 2 — Onboarding Modules (Asset, Social, Compete)
**Status:** Executing
**Current Plan:** 02-01 complete
**Progress:** [██████░░░░] 60%

## Decisions

- Used `Brand` table (not `TenantBrand`) — matches current Prisma schema
- Pass inputJson as object to createPipelineRun (avoids double-stringify bug)
- ServiceInstance takes priority over Subscription when deduplicating products
- Auto-approved human-verify checkpoint for 01-02: type-check clean, worker healthy, WhatsApp test deferred to integration
- SocialHub triggers asset-collection first (highest priority visual product) before social-setup
- Module loader uses lazy dynamic imports for graceful handling of not-yet-implemented modules
- Fallback intro messages hardcoded in router for pre-implementation phase

## Phase History

- **01-01** (Core Onboarding Modules): COMPLETE — prompt-assembler + group-bootstrap (2min)
- **01-02** (API Endpoint + Verification): COMPLETE — POST /api/onboarding/start wired (1min)
- **02-01** (Module Foundation): COMPLETE — types, DB state, module router with priority activation (3min)

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
| 02-01 | 3min | 2 | 5 |

## Last Session

- **Stopped at:** Completed 02-01-PLAN.md
- **Timestamp:** 2026-03-13T23:20:01Z

---
*Last updated: 2026-03-13 — completed plan 02-01 (Module Foundation)*
