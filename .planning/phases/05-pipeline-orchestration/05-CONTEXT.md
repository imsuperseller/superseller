# Phase 5: Pipeline Orchestration - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire everything into a BullMQ pipeline that routes to correct modules based on tenant's products, with error handling, cost tracking, and admin visibility. Covers PIPE-01 through PIPE-05. Does not include auto-trigger from payment webhooks (v2), web UI for onboarding, or customer self-service pipeline management.

</domain>

<decisions>
## Implementation Decisions

### Pipeline trigger & flow
- Admin-only trigger via POST /api/onboarding/start (no auto-trigger from webhooks in v1)
- Customer chooses module order — NOT sequential by priority
- Agent presents available modules as a WhatsApp poll — customer taps to select
- After module completion: celebration message + ~30 second delay + poll with remaining modules

### Module completion gates
- Module self-reports completion (existing state machine), BUT admin must approve each module before next is offered
- Admin notified via WhatsApp when a module needs approval — reply APPROVE to continue
- Stale detection: agent nudges customer after 48h of no response; admin alerted after 7 days
- When ALL modules complete: agent sends summary, admin gives final approval, then agent sends "You're all set!" with per-product next steps

### Failure & retry strategy
- Auto-retry failed steps up to 3 times with backoff
- After 3rd failure: pause module + alert admin via WhatsApp
- Failures invisible to customer — agent says "Working on it" if something takes longer
- Admin failure alerts include quick-reply commands (RETRY / SKIP / PAUSE) AND link to admin portal for deeper investigation

### Admin visibility & status
- GET /api/onboarding/status/:tenantId returns: overall progress %, each module status (pending/active/awaiting-approval/complete/failed), last activity, total cost
- Per-module cost breakdown in status response (e.g., character-video-gen: $5.20, asset-collection: $0.00)
- Admin WhatsApp notifications on: pipeline started, module approval needed, failure alerts, first module complete, all modules complete (key milestones + action items)

### Claude's Discretion
- BullMQ queue design (job structure, concurrency, backoff config)
- Admin portal UI for onboarding status (API-only in this phase is fine)
- Exact WhatsApp message formatting for polls, celebrations, and admin alerts
- Database schema for pipeline state (extend existing onboarding_module_state or new table)
- How to handle the 30-second delay between celebration and next poll (setTimeout vs scheduled job)

</decisions>

<specifics>
## Specific Ideas

- WhatsApp polls proven to work (SocialHub approval flow) — use same WAHA poll pattern
- Admin reply commands via WhatsApp (APPROVE, RETRY, SKIP, PAUSE) — similar to existing ClaudeClaw command pattern
- Character video gen module already has a full orchestration template with parallel scenes + serial composition — reuse the pattern

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `queues.ts`: 6 existing BullMQ queues with connection pooling, retry configs — add `customer-onboarding` queue
- `module-router.ts`: routeToModule() with lazy loading, priority ordering — adapt for customer-choice ordering
- `module-state.ts`: PostgreSQL state persistence with upsertModuleState() — extend for pipeline-level state
- `pipeline-run.ts`: createPipelineRun() / updatePipelineRun() — use for per-module and overall tracking
- `expense-tracker.ts`: trackExpense() with COST_RATES — aggregate per module
- `character-video-gen.ts`: Full end-to-end orchestration template (state machine, polling, R2 upload, WAHA delivery)

### Established Patterns
- Module interface: OnboardingModule with shouldActivate(), handleMessage(), getIntroMessage()
- State machine per module: intro -> [module-specific phases] -> complete
- Lazy module loading via dynamic imports
- PipelineRun for job tracking with costCents, status, deliveredVia
- Non-blocking expense tracking (never throws)
- WAHA polls: sendPoll() for interactive choices (proven in SocialHub)

### Integration Points
- `claudeclaw.worker.ts`: Already calls routeToModule() before Claude fallback — pipeline hooks in here
- `POST /api/app/onboarding/submit`: Existing intake endpoint (creates OnboardingRequest) — wire to BullMQ job
- `POST /api/onboarding/start`: Target trigger endpoint (referenced in UGRP-01, already built in Phase 1)
- Admin WhatsApp: sendText() to admin session for notifications
- onboarding_module_state table: Current per-module state storage

</code_context>

<deferred>
## Deferred Ideas

- Auto-trigger from PayPal/Stripe webhooks (AUTO-01 in v2 requirements)
- Admin portal UI tab for onboarding status (API-only for now, UI in future phase)
- Daily digest of all active onboardings
- Customer self-service pipeline management

</deferred>

---

*Phase: 05-pipeline-orchestration*
*Context gathered: 2026-03-14*
