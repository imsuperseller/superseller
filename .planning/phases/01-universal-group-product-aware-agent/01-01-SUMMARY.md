---
phase: 01-universal-group-product-aware-agent
plan: 01
subsystem: onboarding
tags: [whatsapp, waha, onboarding, ai-agent, product-aware, pipeline-run]

# Dependency graph
requires: []
provides:
  - "assembleProductPrompt(tenantId) — dynamic system prompt from tenant products"
  - "fetchTenantProducts(tenantId) — ServiceInstance + Subscription product list"
  - "getProductModuleHints(productName) — onboarding module descriptions"
  - "bootstrapOnboardingGroup(tenantId, phone) — universal WhatsApp group + agent setup"
affects: [01-02, 01-03, onboarding-api, customer-activation]

# Tech tracking
tech-stack:
  added: []
  patterns: [raw-sql-via-db-client, product-hint-mapping, pipeline-run-tracking]

key-files:
  created:
    - apps/worker/src/services/onboarding/prompt-assembler.ts
    - apps/worker/src/services/onboarding/prompt-assembler.test.ts
    - apps/worker/src/services/onboarding/group-bootstrap.ts
  modified: []

key-decisions:
  - "Used Brand table (not TenantBrand) — matches current Prisma schema"
  - "Pass inputJson as object to createPipelineRun (avoids double-stringify bug in old code)"
  - "ServiceInstance takes priority over Subscription when deduplicating products"

patterns-established:
  - "Product hint mapping: centralized MODULE_HINTS dict with fuzzy fallback matching"
  - "Universal onboarding bootstrap: tenant lookup -> product prompt -> group creation -> agent registration -> welcome message"

requirements-completed: [UGRP-02, UGRP-03, UGRP-04, UGRP-05, PAGENT-01, PAGENT-02, PAGENT-03, PAGENT-04, PAGENT-05]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 1 Plan 1: Core Onboarding Modules Summary

**Dynamic product-aware prompt assembly from ServiceInstance/Subscription tables, plus universal WhatsApp group bootstrap with branded icon, product-list description, and personalized welcome**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T22:45:49Z
- **Completed:** 2026-03-13T22:48:20Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- prompt-assembler.ts reads ServiceInstance + Subscription tables, deduplicates by productName, builds dynamic system prompt with role/products/hints/rules/language sections
- group-bootstrap.ts creates WhatsApp group via WAHA, sets brand icon and product-list description, registers product-aware AI agent, sends personalized welcome listing each product with onboarding hints
- 11 tests passing for prompt assembly logic (single product, multiple products, zero products, deduplication, module hints)

## Task Commits

Each task was committed atomically:

1. **Task 1: prompt-assembler.ts (RED)** - `15e2da71` (test)
2. **Task 1: prompt-assembler.ts (GREEN)** - `9f268ec7` (feat)
3. **Task 2: group-bootstrap.ts** - `a81e2d90` (feat)

_TDD task had RED + GREEN commits._

## Files Created/Modified
- `apps/worker/src/services/onboarding/prompt-assembler.ts` - Dynamic system prompt assembly from tenant products
- `apps/worker/src/services/onboarding/prompt-assembler.test.ts` - 11 tests for fetchTenantProducts, getProductModuleHints, assembleProductPrompt
- `apps/worker/src/services/onboarding/group-bootstrap.ts` - Universal WhatsApp group creation + agent registration

## Decisions Made
- Used `Brand` table (not `TenantBrand`) to match current Prisma schema — the old character-pipeline code referenced `TenantBrand` which appears outdated
- Pass `inputJson` as object to `createPipelineRun` (avoids double-stringify bug present in old character-pipeline code)
- ServiceInstance takes priority over Subscription when deduplicating products by name

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- prompt-assembler and group-bootstrap are ready for integration
- Next plan can build the onboarding API endpoint (POST /api/onboarding/start) that calls bootstrapOnboardingGroup
- The old character-pipeline/group-bootstrap.ts remains untouched for backward compatibility

---
*Phase: 01-universal-group-product-aware-agent*
*Completed: 2026-03-13*
