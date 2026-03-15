---
phase: 06-fix-social-intro-poll-vote
plan: 01
subsystem: api
tags: [waha, bullmq, webhooks, onboarding, module-router, poll]

# Dependency graph
requires:
  - phase: 05-pipeline-orchestration
    provides: ClaudeClawJobData with isPollVote/pollOption fields, onboarding pipeline state machine
provides:
  - poll.vote WAHA webhook events routed to BullMQ claudeclawQueue with isPollVote=true and pollOption
  - routeToModule() honors pipeline currentModule before priority walk
affects: [onboarding pipeline, claudeclaw worker, module selection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "poll.vote handler added before message-only filter in handleClaudeClawWebhook"
    - "getPipelineState imported in module-router for step 2b currentModule check"

key-files:
  created: []
  modified:
    - apps/worker/src/api/routes.ts
    - apps/worker/src/services/onboarding/module-router.ts

key-decisions:
  - "poll.vote handler placed before the message-only event filter so it short-circuits cleanly"
  - "WAHA poll.vote payload nested under payload.vote — handled with votePayload = payload.vote || payload fallback"
  - "currentModule check (step 2b) placed after products fetch but before priority walk — customer choice overrides default order"

patterns-established:
  - "Pattern: Poll vote pipeline — WAHA poll.vote -> routes.ts -> claudeclawQueue -> claudeclaw.worker -> handlePipelineEvent"
  - "Pattern: Pipeline currentModule override — getPipelineState in routeToModule() bypasses priority walk when set"

requirements-completed: [PIPE-02, SOCIAL-02]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 06 Plan 01: Poll Vote Webhook Wiring + Module Router Fix Summary

**poll.vote WAHA webhook events now reach BullMQ with isPollVote=true, and routeToModule() activates the customer's poll-selected module instead of defaulting to priority order**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T03:30:00Z
- **Completed:** 2026-03-15T03:34:43Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added poll.vote event handler in routes.ts before the message-only filter — extracts selectedOptions[0].name and group chatId, validates group membership, enqueues to claudeclawQueue with isPollVote=true and pollOption
- Added pipeline currentModule check in module-router.ts between product fetch and priority walk — when onboarding pipeline has currentModule set, activates that module directly
- TypeScript compiles clean (zero new errors in production source files)

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire poll.vote webhook events to BullMQ** - `2137ac2a` (feat)
2. **Task 2: Honor pipeline currentModule in routeToModule()** - `9c0b59db` (feat)

**Plan metadata:** _(docs commit, added below)_

## Files Created/Modified
- `apps/worker/src/api/routes.ts` - Added poll.vote handler before message event filter in handleClaudeClawWebhook
- `apps/worker/src/services/onboarding/module-router.ts` - Added getPipelineState import and step 2b currentModule override before priority walk

## Decisions Made
- poll.vote handler placed before the existing message-only event filter so it short-circuits without hitting the filter
- WAHA poll.vote payload is nested as `payload.vote` — handled with `votePayload = payload.vote || payload` fallback for resilience
- currentModule check (step 2b) placed after products fetch but before priority walk — customer's poll choice overrides default activation order

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. Pre-existing TypeScript errors in `__tests__/` files (top-level await in test files) are unrelated to this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Poll vote pipeline is wired end-to-end: WAHA poll.vote -> routes.ts -> claudeclawQueue -> claudeclaw.worker (isPollVote check at line 142) -> handlePipelineEvent
- routeToModule() will activate the poll-selected module on next customer message after pipeline sets currentModule
- Ready to test with a live WAHA group poll vote

---
*Phase: 06-fix-social-intro-poll-vote*
*Completed: 2026-03-15*
