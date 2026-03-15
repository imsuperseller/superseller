---
phase: 05-pipeline-orchestration
plan: 01
subsystem: onboarding-pipeline
tags: [bullmq, whatsapp, pipeline, onboarding, state-machine]
dependency_graph:
  requires: []
  provides:
    - customerOnboardingQueue
    - OnboardingJobData
    - sendPoll
    - initPipelineStateTable
    - getPipelineState
    - upsertPipelineState
    - onboardingWorker
    - handlePipelineEvent
    - advancePipelineAfterApproval
  affects:
    - apps/worker/src/index.ts
    - apps/worker/src/queue/queues.ts
    - apps/worker/src/services/waha-client.ts
    - apps/worker/src/services/onboarding/modules/types.ts
tech_stack:
  added: []
  patterns:
    - BullMQ Worker with attempts:1 for state-machine pipelines
    - WAHA sendPoll NOWEB Plus API
    - Raw SQL pipeline state table with upsert-on-conflict
    - Event-driven pipeline (worker initializes, webhook events advance)
key_files:
  created:
    - apps/worker/src/services/onboarding/pipeline-state.ts
    - apps/worker/src/queue/workers/onboarding.worker.ts
    - apps/worker/src/services/onboarding/pipeline-intro-triggers.ts
  modified:
    - apps/worker/src/queue/queues.ts
    - apps/worker/src/services/waha-client.ts
    - apps/worker/src/services/onboarding/modules/types.ts
    - apps/worker/src/index.ts
decisions:
  - "attempts:1 on customerOnboardingQueue — pipeline manages its own retries via DB state (avoids duplicate orchestration on BullMQ retry)"
  - "Worker job ends after first poll — all subsequent pipeline events flow through handlePipelineEvent() called from claudeclaw group message handler"
  - "advancePipelineAfterApproval() exported for Plan 02 admin APPROVE command wiring"
  - "MODULE_LABELS + LABEL_TO_MODULE dual-direction maps for poll option resolution"
metrics:
  duration: "3min"
  completed: "2026-03-14"
  tasks: 2
  files: 7
requirements_satisfied: [PIPE-01, PIPE-02]
---

# Phase 05 Plan 01: BullMQ Onboarding Pipeline — Summary

BullMQ customer-onboarding queue + worker that orchestrates the full onboarding lifecycle via WhatsApp polls, with event-driven state machine persisted in PostgreSQL.

## What Was Built

### Task 1: Foundation (queues.ts, waha-client.ts, pipeline-state.ts, types.ts)

- `customerOnboardingQueue` added to `queues.ts` with `attempts: 1` — the pipeline is a state machine, not a retry-based job
- `OnboardingJobData` interface: `{ tenantId, groupId, clientPhone, triggeredBy }`
- `sendPoll()` in `waha-client.ts` — POST to `/api/sendPoll` with question, options array, `multipleAnswers: false`
- `pipeline-state.ts` — new `onboarding_pipeline` table with full CRUD: `initPipelineStateTable`, `getPipelineState`, `upsertPipelineState`, `getAllActivePipelines`
- `PipelineStatus` type added to `modules/types.ts`

### Task 2: Worker + Orchestration (onboarding.worker.ts, index.ts)

- `onboarding.worker.ts` — BullMQ Worker that:
  1. Receives job (tenantId, groupId, clientPhone, triggeredBy)
  2. Calls `fetchTenantProducts` to get tenant products
  3. Walks `MODULE_REGISTRY` to find applicable modules
  4. Initializes `onboarding_pipeline` DB row
  5. Sends welcome text + module selection poll
  6. Job ends — subsequent events flow via WAHA webhook
- `handlePipelineEvent()` — callable from claudeclaw group message flow:
  - `poll-vote` type: maps label → ModuleType, sets `currentModule`, sends intro trigger text
  - `module-completed` type: marks module complete, updates status to `awaiting-approval`, notifies admin
- `advancePipelineAfterApproval()` — for Plan 02 admin APPROVE command: re-polls or sends completion summary
- `pipeline-intro-triggers.ts` — per-module trigger messages sent after poll vote
- Worker registered in `index.ts` with `initOnboardingWorker()` and `SIGTERM` close handler

## Deviations from Plan

### Auto-added: pipeline-intro-triggers.ts

- **Found during:** Task 2
- **Issue:** `handlePipelineEvent` needed to send an intro message after poll vote to activate the module (routeToModule needs a message to react to). No canonical location existed for these strings.
- **Fix:** Created `pipeline-intro-triggers.ts` with `INTRO_TRIGGERS` map, imported lazily in `handlePipelineEvent`
- **Files modified:** `apps/worker/src/services/onboarding/pipeline-intro-triggers.ts` (new)

### Plan used `awaiting-approval` per module

The plan spec said "after module completes → celebrate → re-poll." I implemented `awaiting-approval` (admin reviews each module) per the task spec's step 5 which explicitly states: "notify admin 'Module X complete for TenantName — awaiting your approval to continue'" and "Set pipeline status to 'awaiting-approval'." `advancePipelineAfterApproval()` is exported for Plan 02 to wire in the APPROVE command.

## Verification

- `npx tsc --noEmit` — zero errors in all plan-05-01 files
- `customerOnboardingQueue` exported from `queues.ts` ✓
- `sendPoll` exported from `waha-client.ts` ✓
- `initPipelineStateTable`, `getPipelineState`, `upsertPipelineState` exported from `pipeline-state.ts` ✓
- `onboardingWorker` and `handlePipelineEvent` exported from `onboarding.worker.ts` ✓
- Worker imported and registered in `index.ts` ✓

## Self-Check: PASSED

Files exist:
- `apps/worker/src/services/onboarding/pipeline-state.ts` ✓
- `apps/worker/src/queue/workers/onboarding.worker.ts` ✓
- `apps/worker/src/services/onboarding/pipeline-intro-triggers.ts` ✓

Commits exist:
- `6b93b8e6` — feat(05-01): add customerOnboardingQueue, sendPoll, pipeline-state table, PipelineStatus type ✓
- `268dd0e2` — feat(05-01): create onboarding.worker.ts with pipeline orchestration loop ✓
