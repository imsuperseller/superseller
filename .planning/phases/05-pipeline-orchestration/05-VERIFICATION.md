---
phase: 05-pipeline-orchestration
verified: 2026-03-15T08:00:00Z
status: passed
score: 13/13 must-haves verified
gaps: []
human_verification:
  - test: "Send a BullMQ onboarding job and verify WhatsApp poll arrives in group"
    expected: "Group receives welcome text + module selection poll listing applicable modules"
    why_human: "Requires live WAHA session and real WhatsApp group — cannot mock full E2E"
  - test: "Reply APPROVE in group from admin phone and verify pipeline advances"
    expected: "Celebration message sent, after 30s next module poll appears"
    why_human: "Requires active pipeline state + live WhatsApp group + admin phone matching"
  - test: "Verify stale pipeline 48h nudge actually fires after idle period"
    expected: "Customer receives nudge message after 48h of no group activity"
    why_human: "Time-based behavior — cannot accelerate setInterval in production"
---

# Phase 05: Pipeline Orchestration — Verification Report

**Phase Goal:** Wire everything into a BullMQ pipeline that routes to correct modules based on tenant's products, with error handling, cost tracking, and admin visibility.
**Verified:** 2026-03-15
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                              | Status     | Evidence                                                                                   |
|----|---------------------------------------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| 1  | BullMQ customer-onboarding queue exists and accepts jobs                                          | VERIFIED   | `customerOnboardingQueue` defined in `queues.ts` lines 114-121, `OnboardingJobData` lines 123-128 |
| 2  | Worker picks up jobs, reads tenant products, determines applicable modules                        | VERIFIED   | `onboarding.worker.ts` lines 608-624: `fetchTenantProducts` + `MODULE_REGISTRY` walk      |
| 3  | Customer receives WhatsApp poll listing available modules to choose from                          | VERIFIED   | `sendModuleSelectionPoll()` lines 113-142 calls `sendPoll()` with remaining module labels  |
| 4  | When customer selects a module via poll, that module activates                                    | VERIFIED   | `claudeclaw.worker.ts` lines 141-153: `isPollVote` flag detected, `handlePipelineEvent({type:"poll-vote"})` called |
| 5  | After module completes, pipeline sends celebration + admin notified + awaits approval             | VERIFIED   | `handlePipelineEvent({type:"module-completed"})` lines 455-499: marks done, notifies admin, sets `awaiting-approval` |
| 6  | Admin can control pipeline via APPROVE/RETRY/SKIP/PAUSE WhatsApp commands                        | VERIFIED   | `handleAdminCommand()` lines 230-350; `claudeclaw.worker.ts` lines 104-135 detects commands |
| 7  | Failed module steps auto-retry up to 3 times before alerting admin                               | VERIFIED   | `handleModuleFailure()` lines 357-399: retry_count < 3 resets phase, >= 3 pauses + alerts  |
| 8  | Failures invisible to customer — agent says "Working on it" if pipeline is paused                | VERIFIED   | `claudeclaw.worker.ts` lines 127-130: paused pipeline sends holding message to customer    |
| 9  | Total cost tracked per module via PipelineRun + api_expenses aggregation                         | VERIFIED   | `aggregatePipelineCosts()` lines 173-222 queries `api_expenses` by `pipelineRunId`; `createPipelineRun` called in `routes.ts` line 58 |
| 10 | Admin can GET /api/onboarding/status/:tenantId and see progress %, per-module status, cost       | VERIFIED   | `routes.ts` lines 92-217: full structured response with progress %, module list, costs     |
| 11 | POST /api/onboarding/start enqueues BullMQ job after group creation                              | VERIFIED   | `routes.ts` lines 55-71: bootstrap → createPipelineRun → `customerOnboardingQueue.add`    |
| 12 | Stale pipelines nudge customer after 48h and alert admin after 7 days                            | VERIFIED   | `runStaleCheck()` lines 544-578 with `NUDGE_THRESHOLD_MS=48h`, `ALERT_THRESHOLD_MS=7d`    |
| 13 | Pipeline state persists in DB across worker restarts                                              | VERIFIED   | `onboarding_pipeline` table via `pipeline-state.ts`, called on startup via `initPipelineStateTable()` |

**Score:** 13/13 truths verified

---

### Required Artifacts

| Artifact                                                         | Provides                                               | Status     | Details                                                              |
|------------------------------------------------------------------|--------------------------------------------------------|------------|----------------------------------------------------------------------|
| `apps/worker/src/queue/queues.ts`                                | `customerOnboardingQueue` + `OnboardingJobData`        | VERIFIED   | Lines 113-128; `isPollVote`/`pollOption` added to `ClaudeClawJobData` |
| `apps/worker/src/services/waha-client.ts`                        | `sendPoll()` for WhatsApp polls                        | VERIFIED   | Lines 340-371; follows same error-handling pattern as `sendText`     |
| `apps/worker/src/services/onboarding/pipeline-state.ts`          | Pipeline-level state persistence                       | VERIFIED   | 235 lines; `initPipelineStateTable`, `getPipelineState`, `upsertPipelineState`, `getAllActivePipelines` all exported |
| `apps/worker/src/queue/workers/onboarding.worker.ts`             | BullMQ worker + full orchestration logic               | VERIFIED   | 725 lines; exports `onboardingWorker`, `handlePipelineEvent`, `handleAdminCommand`, `initOnboardingWorker` |
| `apps/worker/src/queue/workers/claudeclaw.worker.ts`             | Admin command routing + poll vote detection + module-completed firing | VERIFIED | Lines 104-201; three pipeline hook blocks |
| `apps/worker/src/api/routes.ts`                                  | `GET /api/onboarding/status/:tenantId` + rewired `POST /api/onboarding/start` | VERIFIED | Lines 92-217 and 43-88 |
| `apps/worker/src/services/onboarding/pipeline-intro-triggers.ts` | Per-module intro messages post poll vote              | VERIFIED   | 25 lines; `INTRO_TRIGGERS` map for all 5 module types                |

---

### Key Link Verification

| From                                      | To                                          | Via                             | Status  | Details                                                                  |
|-------------------------------------------|---------------------------------------------|---------------------------------|---------|--------------------------------------------------------------------------|
| `claudeclaw.worker.ts`                    | `onboarding.worker.ts`                      | `handlePipelineEvent`           | WIRED   | Lines 143-153 (poll-vote) and 184-194 (module-completed)                |
| `claudeclaw.worker.ts`                    | `onboarding.worker.ts`                      | `handleAdminCommand`            | WIRED   | Lines 120-123; admin phone match + APPROVE/RETRY/SKIP/PAUSE text check  |
| `onboarding.worker.ts`                    | `waha-client.ts`                            | `sendText` for admin notifications | WIRED | `notifyAdmin()` lines 99-105 wraps `sendText`; called on 4 milestones  |
| `routes.ts`                               | `queues.ts`                                 | `customerOnboardingQueue.add`   | WIRED   | Line 66; enqueues job after bootstrap + PipelineRun creation            |
| `routes.ts`                               | `pipeline-state.ts`                         | `getPipelineState` (via SQL)    | PARTIAL | Status endpoint queries `onboarding_pipeline` table directly (raw SQL), not via `getPipelineState()` exported function — functionally equivalent |
| `onboarding.worker.ts`                    | `pipeline-state.ts`                         | `upsertPipelineState`           | WIRED   | Multiple call sites throughout pipeline lifecycle                        |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                   | Status    | Evidence                                                                     |
|-------------|-------------|-------------------------------------------------------------------------------|-----------|------------------------------------------------------------------------------|
| PIPE-01     | 05-01       | BullMQ `customer-onboarding` queue orchestrates the full flow                | SATISFIED | `customerOnboardingQueue` in `queues.ts`; worker registered in `index.ts`   |
| PIPE-02     | 05-01       | Pipeline determines which modules to run based on tenant's products           | SATISFIED | `MODULE_REGISTRY` + `fetchTenantProducts` in `onboarding.worker.ts`          |
| PIPE-03     | 05-02       | Pipeline handles failures gracefully — retries, alerts on permanent failure   | SATISFIED | `handleModuleFailure()` (3x auto-retry), `handleAdminCommand()` (PAUSE/RETRY/SKIP) |
| PIPE-04     | 05-02       | Pipeline tracks total cost via trackExpense() and PipelineRun                 | SATISFIED | `createPipelineRun` at pipeline start (routes.ts:58); `aggregatePipelineCosts` reads from `api_expenses`; `trackExpense()` called in `character-video-gen` (the only AI-cost module) — free modules have no API costs to track |
| PIPE-05     | 05-02       | Admin can view onboarding status via admin API                                | SATISFIED | `GET /api/onboarding/status/:tenantId` returns full structured response      |

**Note on PIPE-04:** The requirement says "via trackExpense() AND PipelineRun". The `PipelineRun` half is wired at pipeline start. `trackExpense()` is only called by `character-video-gen` — the only module that incurs AI API costs (Kie.ai). The other four modules (asset-collection, character-questionnaire, social-setup, competitor-research) are free operations. No cost tracking gap exists functionally — the cost aggregation path is fully implemented and will capture expenses correctly for any module that calls `trackExpense()` with the `pipelineRunId` as `jobId`.

---

### Anti-Patterns Found

| File                              | Line      | Pattern           | Severity | Impact                                    |
|-----------------------------------|-----------|-------------------|----------|-------------------------------------------|
| `apps/worker/src/api/routes.ts`   | 1368      | Pre-existing TS error: `nextRun` vs `lastError/registeredAt` mismatch in scheduler status endpoint | INFO | Pre-existing; not introduced by phase-05; does not affect onboarding functionality |

No anti-patterns found in phase-05 files:
- No TODO/FIXME/placeholder comments in any of the 7 files
- No stub implementations (`return null`, `return {}`, empty handlers)
- No unhandled promise rejections (all async paths have try/catch)
- No console.log-only implementations

---

### Commit Verification

All SUMMARY-claimed commits confirmed in git log:

| Commit     | Description                                                   | Verified |
|------------|---------------------------------------------------------------|----------|
| `6b93b8e6` | feat(05-01): add customerOnboardingQueue, sendPoll, pipeline-state table, PipelineStatus type | YES |
| `268dd0e2` | feat(05-01): create onboarding.worker.ts with pipeline orchestration loop | YES |
| `5faf9310` | feat(05-02): admin commands, retry logic, stale detection, cost aggregation, poll vote handling | YES |
| `9dfb344d` | feat(05-02): admin status API + wire onboarding/start to BullMQ | YES |

---

### Human Verification Required

#### 1. End-to-End Pipeline Flow

**Test:** POST to `/api/onboarding/start` with a valid tenantId and clientPhone. Monitor the WhatsApp group.
**Expected:** (1) Group created, (2) Welcome message delivered, (3) Module selection poll appears with correct module labels, (4) Tapping a poll option triggers intro message for that module.
**Why human:** Requires live WAHA NOWEB PLUS session, a real WhatsApp group, and real poll delivery — cannot be verified programmatically.

#### 2. Admin APPROVE Command Flow

**Test:** After a module completes, send "APPROVE" from the admin phone registered as `triggeredBy` in the pipeline.
**Expected:** Celebration message sent to group. After ~30 seconds, next module poll appears (or "all done" if last module).
**Why human:** Requires active pipeline state, live WhatsApp session, and timing verification for the 30-second delay.

#### 3. 48h Stale Nudge

**Test:** Leave an active pipeline idle for 48+ hours. Check if the group receives a nudge message.
**Expected:** "Hey! Ready to continue your setup?" message appears in the WhatsApp group.
**Why human:** The `setInterval` runs every 6 hours — cannot fast-forward real time in production.

---

### Gaps Summary

No blocking gaps found. All 5 requirements (PIPE-01 through PIPE-05) are satisfied. All key links are wired. The pipeline is structurally complete:

- BullMQ queue and worker exist and are registered in `index.ts`
- Tenant product → module determination logic is implemented
- WhatsApp poll delivery path is wired (WAHA `sendPoll` → `handlePipelineEvent` poll-vote → module activation)
- Module completion cycling is wired (claudeclaw detects `completed:true` from `routeToModule` → fires `handlePipelineEvent`)
- Admin control commands (APPROVE/RETRY/SKIP/PAUSE) are detected and dispatched
- Auto-retry (3x) and failure escalation are implemented
- Stale detection (48h nudge, 7d admin alert) is running via `setInterval` started at init
- Cost aggregation reads from `api_expenses` via `PipelineRun` linkage
- Status API returns full structured response with progress %, per-module status, and cost breakdown
- TypeScript compiles clean on all phase-05 files (one pre-existing error in a non-phase-05 code path)

Three items flagged for human verification (E2E flow, APPROVE command timing, stale detection) — none are blockers, all are behavioral validations that cannot be asserted programmatically.

---

_Verified: 2026-03-15_
_Verifier: Claude (gsd-verifier)_
