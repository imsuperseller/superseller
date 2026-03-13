---
phase: 02-onboarding-modules-asset-social-compete
plan: 02
subsystem: onboarding
tags: [whatsapp, r2, waha, media-ingestion, social-media, state-machine, tdd]

requires:
  - phase: 02-01
    provides: "OnboardingModule interface, ModuleState DB CRUD, module-router with priority activation"
provides:
  - "Asset collection module: WhatsApp media -> R2 upload -> TenantAsset registration"
  - "Social setup module: conversational preference collection -> ServiceInstance.configuration"
affects: [02-03, group-agent, onboarding-integration]

tech-stack:
  added: []
  patterns:
    - "OnboardingModule state machine pattern (phase transitions via upsertModuleState)"
    - "WAHA media download with localhost URL rewrite"
    - "Caption-based asset classification (guessAssetType helper)"
    - "ServiceInstance.configuration JSON merge pattern"

key-files:
  created:
    - apps/worker/src/services/onboarding/modules/asset-collection.ts
    - apps/worker/src/services/onboarding/modules/asset-collection.test.ts
    - apps/worker/src/services/onboarding/modules/social-setup.ts
    - apps/worker/src/services/onboarding/modules/social-setup.test.ts
  modified:
    - apps/worker/src/__tests__/setup.ts

key-decisions:
  - "Reused ep-asset-ingestion.ts media download pattern (localhost rewrite, X-Api-Key, buffer size check)"
  - "Asset classification uses simple keyword matching on caption (logo, team, project) with fallback to mediaType"
  - "Social setup stores preferences only (no passwords/tokens) in ServiceInstance.configuration JSON with merge"
  - "Platform name parsing uses case-insensitive substring matching against known platform list"

patterns-established:
  - "OnboardingModule TDD pattern: 9 tests per module covering shouldActivate, getIntroMessage, and all state transitions"
  - "WAHA media URL rewrite: localhost:3000 -> config.waha.url for same-server media access"

requirements-completed: [ASSET-02, ASSET-03, ASSET-04, SOCIAL-02, SOCIAL-03, SOCIAL-04]

duration: 4min
completed: 2026-03-13
---

# Phase 02 Plan 02: Asset Collection & Social Setup Modules Summary

**WhatsApp-driven asset collection (media->R2->TenantAsset) and conversational social preference setup (platforms/frequency/style->ServiceInstance.configuration) as OnboardingModule state machines**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T23:22:05Z
- **Completed:** 2026-03-13T23:26:23Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Asset collection module downloads WhatsApp media, uploads to R2 with TenantAsset registration, classifies by caption, reacts with checkmark
- Social setup module walks through platform/frequency/style collection conversationally, stores merged JSON in ServiceInstance.configuration
- Both modules implement OnboardingModule interface and plug into module-router
- 18 tests passing (9 per module), all 30 module tests green together

## Task Commits

Each task was committed atomically:

1. **Task 1: Asset collection module** - `a2bc75a8` (feat)
2. **Task 2: Social setup module** - `07805ade` (feat)

_Both tasks followed TDD: RED (tests fail) -> GREEN (implement) -> verify_

## Files Created/Modified
- `apps/worker/src/services/onboarding/modules/asset-collection.ts` - Asset collection OnboardingModule (intro->collecting->complete)
- `apps/worker/src/services/onboarding/modules/asset-collection.test.ts` - 9 tests covering activation, classification, media flow, done transition
- `apps/worker/src/services/onboarding/modules/social-setup.ts` - Social setup OnboardingModule (asking_platforms->asking_frequency->asking_style->confirming->complete)
- `apps/worker/src/services/onboarding/modules/social-setup.test.ts` - 9 tests covering activation, phase transitions, DB storage, confirmation
- `apps/worker/src/__tests__/setup.ts` - Added waha config to test mock

## Decisions Made
- Reused ep-asset-ingestion.ts download pattern (localhost URL rewrite, X-Api-Key header, buffer size validation)
- Asset type guessed from caption keywords; mediaType used as fallback
- Social module collects preferences only (platforms, frequency, style) -- no credentials
- ServiceInstance.configuration updated via SELECT+merge+UPDATE pattern to preserve existing config

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added waha config to test setup**
- **Found during:** Task 1 (asset-collection tests)
- **Issue:** Test setup.ts config mock lacked `waha` property, causing config.waha.url to be undefined
- **Fix:** Added `waha: { url, apiKey, session }` to the config mock in setup.ts
- **Files modified:** apps/worker/src/__tests__/setup.ts
- **Verification:** All tests pass
- **Committed in:** a2bc75a8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for test infrastructure. No scope creep.

## Issues Encountered
- Test 6 (asset classification) initially failed because `fetch` mock returned same Response object (body consumed on first read). Fixed by using `mockImplementation` returning fresh Response per call.
- Test 9 (ServiceInstance merge) had wrong SQL param index. Fixed param access from `[1][1]` to `[1][0]`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 3 onboarding modules now implemented (asset-collection, social-setup, competitor-research)
- Module router already wired with lazy imports for all 3 modules
- Ready for integration testing and group-agent wiring

---
*Phase: 02-onboarding-modules-asset-social-compete*
*Completed: 2026-03-13*
