---
phase: 05-pipeline-orchestration
plan: 02
subsystem: api
tags: [bullmq, whatsapp, onboarding, pipeline, waha, postgres, admin-control]

requires:
  - phase: 05-01
    provides: customerOnboardingQueue, handlePipelineEvent, PipelineState, advancePipelineAfterApproval

provides:
  - handleAdminCommand (APPROVE/RETRY/SKIP/PAUSE) in onboarding.worker.ts
  - handleModuleFailure with 3x auto-retry + admin WhatsApp alert
  - aggregatePipelineCosts querying api_expenses grouped by moduleType
  - notifyAdmin helper with phone→chatId conversion
  - Stale detection: 48h customer nudge, 7d admin alert via setInterval every 6h
  - GET /api/onboarding/status/:tenantId — structured progress + per-module status + costs
  - POST /api/onboarding/start rewired to bootstrap group + create PipelineRun + enqueue BullMQ job
  - claudeclaw.worker.ts: admin command routing, poll vote routing, module-completed pipeline event firing
  - retry_counts + module_costs JSONB columns added to onboarding_pipeline table
  - isPollVote + pollOption fields added to ClaudeClawJobData for WAHA poll.vote events

affects: [claudeclaw-group-flow, onboarding-modules, admin-dashboard, waha-webhook]

tech-stack:
  added: []
  patterns:
    - Admin command pattern via WhatsApp (APPROVE/RETRY/SKIP/PAUSE) routing to pipeline state machine
    - Per-module cost aggregation via api_expenses.metadata->>'moduleType' grouping
    - Stale detection via setInterval in worker init with bounded thresholds (48h/7d)
    - Pipeline event firing from module router result (completed: true → handlePipelineEvent)

key-files:
  created: []
  modified:
    - apps/worker/src/queue/workers/onboarding.worker.ts
    - apps/worker/src/queue/workers/claudeclaw.worker.ts
    - apps/worker/src/services/onboarding/pipeline-state.ts
    - apps/worker/src/api/routes.ts
    - apps/worker/src/queue/queues.ts

key-decisions:
  - "Admin command detection compares senderPhone digits against adminPhone digits (strips all non-numeric) — handles different WhatsApp chatId formats"
  - "APPROVE with remaining modules delays 30s before sending next poll (setTimeout) — gives customer time to read celebration message"
  - "APPROVE with no remaining modules → awaiting-approval for final sign-off, not immediate completion — admin must give explicit final APPROVE"
  - "Cost aggregation queries api_expenses.job_id matched to PipelineRun.id — decoupled from module implementation"
  - "Stale check updates updated_at after sending nudge/alert to prevent re-triggering every 6h interval"
  - "POST /api/onboarding/start still calls bootstrapOnboardingGroup first (creates WA group), then enqueues BullMQ — group creation is synchronous prerequisite"
  - "isPollVote + pollOption added to ClaudeClawJobData so WAHA webhook handler can set these for poll.vote events"

requirements-completed: [PIPE-03, PIPE-04, PIPE-05]

duration: 5min
completed: 2026-03-15
---

# Phase 05 Plan 02: Pipeline Orchestration — Admin Control Summary

**Production-ready pipeline: admin WhatsApp commands (APPROVE/RETRY/SKIP/PAUSE), 3x auto-retry with failure alerts, 48h/7d stale detection, per-module cost aggregation, and structured status API**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T03:04:19Z
- **Completed:** 2026-03-15T03:09:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Admin can control onboarding pipeline via WhatsApp replies: APPROVE advances to next module (with 30s celebration delay), RETRY resets current module phase, SKIP marks module complete and repolis, PAUSE holds pipeline
- Failed modules auto-retry up to 3 times (resetting DB phase to 'intro'), then pause pipeline and send alert to admin with RETRY/SKIP/PAUSE options
- Stale pipelines: 48h active pipelines nudge customer, 7d inactive pipelines alert admin — both update updated_at to prevent repeat-fire every 6h
- Per-module cost aggregated from api_expenses via `job_id = PipelineRun.id` with metadata->>'moduleType' grouping; stored in module_costs JSONB
- GET /api/onboarding/status/:tenantId returns full structured response: progress %, module list with status+costCents+timestamps, total cost, lastActivity
- POST /api/onboarding/start now: creates WA group → creates PipelineRun → enqueues BullMQ job (was: called bootstrapOnboardingGroup only, no BullMQ)
- claudeclaw.worker.ts detects admin commands (phone match + APPROVE/RETRY/SKIP/PAUSE text), handles poll votes via isPollVote job flag, fires module-completed pipeline events when routeToModule returns completed:true

## Task Commits

1. **Task 1: Admin commands, retry logic, stale detection, cost aggregation, poll vote handling** - `5faf9310` (feat)
2. **Task 2: Admin status API + wire onboarding/start to BullMQ** - `9dfb344d` (feat)

## Files Created/Modified

- `apps/worker/src/queue/workers/onboarding.worker.ts` - handleAdminCommand, handleModuleFailure, aggregatePipelineCosts, notifyAdmin, startStaleDetection, updated handlePipelineEvent to fire cost aggregation and better admin notifications
- `apps/worker/src/queue/workers/claudeclaw.worker.ts` - Admin command detection block, poll vote routing block, module completion pipeline event firing in module router section
- `apps/worker/src/services/onboarding/pipeline-state.ts` - Added retry_counts + module_costs JSONB columns; updated all SELECT/INSERT/UPDATE to include them; getAllActivePipelines returns all non-terminal statuses
- `apps/worker/src/api/routes.ts` - GET /api/onboarding/status/:tenantId endpoint; POST /api/onboarding/start rewired to BullMQ + PipelineRun creation
- `apps/worker/src/queue/queues.ts` - Added isPollVote + pollOption to ClaudeClawJobData

## Decisions Made

- APPROVE with no remaining modules advances to awaiting-approval (not direct completion) — gives admin final sign-off control
- Cost aggregation is non-critical (wrapped in try/catch) — pipeline does not fail if cost query fails
- Admin phone matching uses digit-only comparison to handle different formats (with/without country code, with/without @c.us)
- Stale detection runs every 6h via setInterval — started in initOnboardingWorker, not on module import

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The `resetModuleState` function referenced in the plan does not exist in module-state.ts. Used direct SQL `UPDATE onboarding_module_state SET phase = 'intro'` inline instead (Rule 3 auto-fix — used existing DB query pattern).

## Next Phase Readiness

Pipeline is now production-ready with full admin control and observability. Requirements PIPE-03 (failure handling), PIPE-04 (cost tracking), PIPE-05 (admin status API) are all complete.

Next: Phase 05 is complete. All planned requirements for the Universal Customer Onboarding System are implemented.

---
*Phase: 05-pipeline-orchestration*
*Completed: 2026-03-15*
