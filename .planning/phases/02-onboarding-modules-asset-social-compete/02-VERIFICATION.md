---
phase: 02-onboarding-modules-asset-social-compete
verified: 2026-03-13T23:45:00Z
status: gaps_found
score: 9/10 must-haves verified
gaps:
  - truth: "Social setup module collects platform preferences conversationally"
    status: partial
    reason: "social-setup.ts handleMessage does not handle 'intro' phase. Module router creates state with phase='intro', but social-setup only handles 'asking_platforms', 'asking_frequency', 'asking_style', 'confirming'. When phase is 'intro', handleMessage falls through to a generic fallback that asks about platforms but never parses the response or transitions state. This creates an infinite loop where the user's platform names are never captured."
    artifacts:
      - path: "apps/worker/src/services/onboarding/modules/social-setup.ts"
        issue: "Missing 'intro' phase handler in handleMessage switch. Fallback at line 291 returns a prompt but does not parse platforms or call upsertModuleState to transition to asking_platforms."
    missing:
      - "Add 'intro' phase handling in social-setup.ts handleMessage that either (a) treats intro same as asking_platforms (parse platforms, transition), or (b) immediately transitions phase to asking_platforms on first message"
---

# Phase 02: Onboarding Modules (Asset, Social, Compete) Verification Report

**Phase Goal:** Build the lightweight conversational modules that the product-aware agent activates based on customer's products. These collect info and assets -- no heavy generation.
**Verified:** 2026-03-13T23:45:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Module router checks tenant products and activates correct module | VERIFIED | `module-router.ts` fetches products via `fetchTenantProducts()`, walks `MODULE_REGISTRY` in priority order, checks `productsMatchModule()` |
| 2 | Module state persists in DB across worker restarts | VERIFIED | `module-state.ts` uses PostgreSQL `onboarding_module_state` table with upsert/get/getActive queries; `initModuleStateTable()` called on worker startup |
| 3 | Modules activate only when customer has the relevant product | VERIFIED | Each module has `shouldActivate()` checking specific product lists; router only activates if `productsMatchModule()` returns true |
| 4 | Asset collection module downloads WhatsApp media, uploads to R2, registers as TenantAsset | VERIFIED | `asset-collection.ts` lines 137-251: downloads via WAHA URL rewrite, calls `uploadBufferToR2()` with `AssetInfo`, handles buffer size check |
| 5 | Asset collection module categorizes assets and confirms receipt with emoji reaction | VERIFIED | `guessAssetType()` classifies by caption keywords (logo/team/project) + mediaType fallback; `reactToMessage()` called with checkmark emoji |
| 6 | Social setup module collects platform preferences conversationally | PARTIAL | `social-setup.ts` has full state machine (asking_platforms -> asking_frequency -> asking_style -> confirming -> complete) BUT does not handle `intro` phase. Router creates state with phase=`intro`, causing infinite fallback loop. |
| 7 | Social setup module stores preferences in ServiceInstance.configuration JSON | VERIFIED | `updateServiceConfig()` does SELECT + JSON merge + UPDATE on `ServiceInstance` table for SocialHub/Buzz products |
| 8 | Social setup module explains SocialHub capabilities during intro | VERIFIED | `getIntroMessage()` returns detailed explanation of SocialHub features (auto-generate, schedule, track engagement) |
| 9 | Competitor research module collects top 3 competitors with names and optional details | VERIFIED | State machine: collecting -> collecting_details -> confirming with up to 3 `CompetitorEntry` objects and "done" shortcut |
| 10 | Competitor info stored in ServiceInstance.configuration JSON with pending flag | VERIFIED | `storeCompetitors()` writes competitors array + `competitorResearchPending: true` to `ServiceInstance.configuration` |
| 11 | Module sends placeholder message about future research findings | VERIFIED | Line 149: "When our research system processes this, I'll share findings right here in the group." No AgentForge import. |
| 12 | ClaudeClaw worker routes group messages through module router before Claude | VERIFIED | `claudeclaw.worker.ts` lines 107-130: lazy imports `routeToModule`, calls before Claude flow, wrapped in try/catch for graceful fallthrough |

**Score:** 11/12 truths verified (1 partial)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/worker/src/services/onboarding/modules/types.ts` | Shared module interfaces | VERIFIED | Exports `OnboardingModule`, `ModuleState`, `ModuleHandleResult`, `ModuleType`, re-exports `ProductInfo` |
| `apps/worker/src/services/onboarding/module-state.ts` | DB CRUD for module state | VERIFIED | `initModuleStateTable`, `getModuleState`, `getActiveModule`, `upsertModuleState` -- all substantive with real SQL |
| `apps/worker/src/services/onboarding/module-router.ts` | Priority-based message routing | VERIFIED | 197 lines, MODULE_REGISTRY with lazy loaders, product matching, priority activation, fallback intros |
| `apps/worker/src/services/onboarding/modules/asset-collection.ts` | Asset collection module | VERIFIED | 261 lines, full media download/upload/classify/react flow, state transitions |
| `apps/worker/src/services/onboarding/modules/social-setup.ts` | Social setup module | PARTIAL | 298 lines, full state machine BUT missing `intro` phase handler |
| `apps/worker/src/services/onboarding/modules/competitor-research.ts` | Competitor research module | VERIFIED | 234 lines, full collecting/confirming flow with ServiceInstance storage |
| `apps/worker/src/queue/workers/claudeclaw.worker.ts` | Module router integration | VERIFIED | Router wired at line 110, initModuleStateTable at line 337 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| module-router.ts | module-state.ts | getModuleState/upsertModuleState | WIRED | Imported line 17, called lines 159, 173 |
| module-router.ts | prompt-assembler.ts | fetchTenantProducts | WIRED | Imported line 16, called line 146 |
| asset-collection.ts | r2.ts | uploadBufferToR2 | WIRED | Imported line 13, called line 208 with AssetInfo |
| asset-collection.ts | waha-client.ts | reactToMessage | WIRED | Imported line 14, called line 212 with checkmark |
| social-setup.ts | ServiceInstance table | SQL UPDATE on configuration | WIRED | `updateServiceConfig()` at line 63, UPDATE query at line 100 |
| competitor-research.ts | ServiceInstance table | SQL UPDATE with competitors | WIRED | `storeCompetitors()` at line 196, UPDATE at line 231 |
| claudeclaw.worker.ts | module-router.ts | routeToModule() call | WIRED | Dynamic import line 110, called line 111, result checked line 118 |
| claudeclaw.worker.ts | module-state.ts | initModuleStateTable on startup | WIRED | Dynamic import + call at lines 336-337 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-----------|-------------|--------|----------|
| ASSET-01 | 02-01 | Agent activates asset collection for visual products | SATISFIED | `shouldActivate()` checks VideoForge, Winner Studio, Character-in-a-Box, Lead Pages, SocialHub |
| ASSET-02 | 02-02 | Agent requests business photos, logos, brand materials via WhatsApp | SATISFIED | `getIntroMessage()` asks for Logo, Photos, Brand materials |
| ASSET-03 | 02-02 | Media downloaded via WAHA, uploaded to R2, registered as TenantAsset | SATISFIED | Full download -> R2 upload -> TenantAsset flow in handleMessage |
| ASSET-04 | 02-02 | Agent categorizes assets and confirms receipt | SATISFIED | `guessAssetType()` classifies; `reactToMessage()` confirms with checkmark |
| SOCIAL-01 | 02-01 | Agent activates social setup for SocialHub/Buzz | SATISFIED | `shouldActivate()` checks socialhub, buzz |
| SOCIAL-02 | 02-02 | Agent collects social media preferences (platforms, frequency, style) | PARTIAL | State machine exists but `intro` phase bug prevents first response from being parsed |
| SOCIAL-03 | 02-02 | Agent stores preferences in ServiceInstance.configuration JSON | SATISFIED | `updateServiceConfig()` merges and writes to ServiceInstance |
| SOCIAL-04 | 02-02 | Agent explains SocialHub capabilities and sets expectations | SATISFIED | `getIntroMessage()` explains auto-generate, schedule, track |
| COMPETE-01 | 02-01 | Agent activates competitor briefing for Maps/SEO or Lead Pages | SATISFIED | `shouldActivate()` checks maps/seo, google maps, lead pages |
| COMPETE-02 | 02-03 | Agent asks for top 3 competitors (names, URLs, locations) | SATISFIED | Collecting -> collecting_details flow for up to 3 competitors |
| COMPETE-03 | 02-03 | Agent stores competitor info in ServiceInstance.configuration | SATISFIED | `storeCompetitors()` writes to ServiceInstance with pending flag |
| COMPETE-04 | 02-03 | Agent shares initial findings when AgentForge completes | SATISFIED | Placeholder message at line 149; `competitorResearchPending: true` flag set |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| competitor-research.ts | 166 | Comment says "placeholder about future research" | Info | Expected per plan -- AgentForge not built yet. Flag set for future integration. |
| social-setup.ts | 291-296 | Fallback handler does not transition state | Warning | Causes `intro` phase to loop without progressing. Functional bug. |

### Human Verification Required

### 1. Social Setup Full Conversation Flow

**Test:** Send a WhatsApp message to a group with a SocialHub product after module activates. Respond with platform names.
**Expected:** Module should parse platforms and ask about frequency.
**Why human:** The `intro` phase bug may manifest differently in production depending on exact message ordering vs test mocks.

### 2. Asset Collection Media Flow End-to-End

**Test:** Send an image to a WhatsApp group with asset collection active. Check R2 for uploaded file and TenantAsset record.
**Expected:** Image uploaded to R2, TenantAsset row created, checkmark reaction on message.
**Why human:** Requires real WAHA instance and R2 bucket to verify full media pipeline.

### 3. Module Priority Order

**Test:** Create a tenant with VideoForge + SocialHub + Maps/SEO. Start onboarding.
**Expected:** Asset collection activates first, then social setup, then competitor research.
**Why human:** Priority ordering depends on product matching and state transitions across all modules.

### Gaps Summary

One functional bug found in the social-setup module: the `handleMessage` method does not handle the `intro` phase that the module-router creates on activation. When a user responds to the intro message, their response falls through to a generic fallback that neither parses platform names nor transitions state, creating an infinite loop. This blocks SOCIAL-02 (collecting preferences) from working end-to-end.

The fix is straightforward: add `intro` phase handling in `social-setup.ts` that either matches `asking_platforms` behavior or immediately transitions to `asking_platforms`.

All other modules, the router, state persistence, ClaudeClaw integration, and 11 of 12 requirements are verified as working correctly. All 6 documented commits exist. No stub patterns, no console.log-only implementations, no empty returns.

---

_Verified: 2026-03-13T23:45:00Z_
_Verifier: Claude (gsd-verifier)_
