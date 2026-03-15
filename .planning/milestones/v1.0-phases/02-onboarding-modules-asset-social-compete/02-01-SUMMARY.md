---
phase: 02-onboarding-modules-asset-social-compete
plan: 01
subsystem: api
tags: [typescript, vitest, postgres, jsonb, onboarding, whatsapp]

requires:
  - phase: 01-universal-group-product-aware-agent
    provides: prompt-assembler with fetchTenantProducts, db/client query helpers

provides:
  - OnboardingModule, ModuleState, ModuleHandleResult shared interfaces
  - DB-backed module state persistence (onboarding_module_state table)
  - Module router with priority-based activation (asset > social > competitor)

affects: [02-02-asset-collection, 02-03-social-setup, 02-04-competitor-research]

tech-stack:
  added: []
  patterns: [module-registry-lazy-import, upsert-state-pattern, priority-based-routing]

key-files:
  created:
    - apps/worker/src/services/onboarding/modules/types.ts
    - apps/worker/src/services/onboarding/module-state.ts
    - apps/worker/src/services/onboarding/module-router.ts
    - apps/worker/src/services/onboarding/module-state.test.ts
    - apps/worker/src/services/onboarding/module-router.test.ts
  modified: []

key-decisions:
  - "SocialHub triggers asset-collection (highest priority visual product) before social-setup"
  - "Module loader uses lazy dynamic imports to handle missing module files gracefully"
  - "Fallback intro messages hardcoded for when module files not yet implemented"

patterns-established:
  - "Module registry pattern: array of {type, loader, triggerProducts} with priority ordering"
  - "DB state pattern: upsert with ON CONFLICT for idempotent module state updates"
  - "Graceful degradation: router returns {handled: false} when module imports fail"

requirements-completed: [ASSET-01, SOCIAL-01, COMPETE-01]

duration: 3min
completed: 2026-03-13
---

# Phase 02 Plan 01: Module Foundation Summary

**Module router with DB-backed state persistence and priority-based activation (asset > social > competitor) for onboarding modules**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T23:16:55Z
- **Completed:** 2026-03-13T23:20:01Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Shared type interfaces (OnboardingModule, ModuleState, ModuleHandleResult) for all three modules
- DB CRUD layer for onboarding_module_state table with upsert, get, and active-module queries
- Module router that checks active state, fetches tenant products, and activates modules in priority order
- 15 unit tests (7 state + 8 router) all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Module types + state persistence** - `fb7177ec` (feat)
2. **Task 2: Module router with activation logic** - `0ba41ed1` (feat)

## Files Created/Modified
- `apps/worker/src/services/onboarding/modules/types.ts` - Shared interfaces (OnboardingModule, ModuleState, ModuleHandleResult, ProductInfo re-export)
- `apps/worker/src/services/onboarding/module-state.ts` - DB CRUD for onboarding_module_state table
- `apps/worker/src/services/onboarding/module-router.ts` - Priority-based message routing to modules
- `apps/worker/src/services/onboarding/module-state.test.ts` - 7 tests for state persistence
- `apps/worker/src/services/onboarding/module-router.test.ts` - 8 tests for routing logic

## Decisions Made
- SocialHub is in the asset-collection trigger list (visual product), so it activates asset-collection before social-setup. Test adjusted to use Buzz for social-only scenario.
- Module loader uses lazy dynamic imports (`import()`) so router works even before individual module files exist (Plans 02/03).
- Fallback intro messages are hardcoded in router for when module files are not yet implemented.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test expectation for SocialHub routing**
- **Found during:** Task 2 (Module router tests)
- **Issue:** Test expected SocialHub to activate social-setup, but per plan requirements SocialHub is in asset-collection trigger list (highest priority)
- **Fix:** Changed test to use Buzz (social-only product) for social-setup activation test
- **Files modified:** module-router.test.ts
- **Verification:** All 8 router tests pass
- **Committed in:** 0ba41ed1

---

**Total deviations:** 1 auto-fixed (1 bug in test expectation)
**Impact on plan:** Minor test adjustment to align with documented activation rules. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Module foundation complete: types, state, router all in place
- Plans 02-02, 02-03, 02-04 can now implement individual modules (asset-collection, social-setup, competitor-research) that plug into the router
- Each module just needs to export an `OnboardingModule` implementation

---
*Phase: 02-onboarding-modules-asset-social-compete*
*Completed: 2026-03-13*
