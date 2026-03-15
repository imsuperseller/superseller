# Phase 17: Scene-Level Regeneration - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning
**Mode:** Auto-selected (all defaults)

<domain>
## Phase Boundary

Customers can regenerate a single scene without touching approved scenes, and receive the updated reveal video via WhatsApp. The system tracks per-scene status (approved/pending/rejected), dispatches regen for only the target scene, re-renders the Remotion CharacterReveal composition with a mix of original + new scene URLs, and delivers the updated video. Customer receives exactly two WhatsApp messages: acknowledgment at start, video at completion.

Requirements: REGEN-01, REGEN-02, REGEN-03, ASSEM-01

</domain>

<decisions>
## Implementation Decisions

### Scene Status Tracking (REGEN-02)
- Per-scene status stored as `sceneStatuses: string[]` in `onboarding_module_state.collectedData` JSONB — no new table needed, aligns with existing pattern where collectedData already stores sceneUrls
- Valid statuses: `approved`, `pending`, `rejected`
- All 5 scenes default to `approved` after initial delivery (Phase 4/character-video-gen completion)
- When regen is dispatched: target scene set to `pending`; on success → `approved`; on failure → scene reverts to previous `approved` URL
- Scene status array is parallel to sceneUrls array (same indices)

### Regen Dispatch & Execution (REGEN-01)
- After change request poll vote = "Yes" and status = `confirmed`, change-request-handler enqueues a job on `character-regen` BullMQ queue (per PROJECT.md decision — same Redis, no new infrastructure)
- Job data: `{ changeRequestId, sceneIndex, tenantId, groupId, characterBibleId }`
- Dedicated `character-regen.worker.ts` processes the queue — not inline in claudeclaw worker
- Reuse existing `generateScene()` logic from character-video-gen: same CharacterBible + same scene prompt from `bible.metadata.scenario_prompts[sceneIndex]` + same Sora 2 model routing
- Follow character-video-gen Sora 2 pattern (not regen-clips.ts which is VideoForge/Kling — different product)
- On generation success: upload to R2 with same key pattern `character-videos/{tenantId}/scene-{i}.mp4` (overwrites old scene file)
- On generation failure: send admin alert via sendAdminAlert(), send customer apology, mark change request as `failed`
- Cost tracked via trackExpense() with correct provider attribution (Phase 15 pattern)

### Mixed-Scene Assembly (ASSEM-01)
- Clone existing `sceneUrls` array from module state collectedData
- Replace only the regen'd scene index with the new R2 URL
- Pass full 5-element array to Remotion CharacterRevealComposition — composition already accepts `sceneClips: string[]`, no changes needed to composition code
- Scene labels stay unchanged — scene content changed, not scene type/name
- New reveal video uploaded to R2 as `character-videos/{tenantId}/reveal-{timestamp}.mp4` (new timestamp, old reveal preserved)
- Update module state collectedData with new sceneUrls array and new revealUrl

### WhatsApp Delivery Flow (REGEN-03)
- Exactly two messages per REGEN-03:
  1. Acknowledgment at request start: "Regenerating scene [N]... You'll receive the updated video shortly."
  2. Updated reveal video sent via sendVideo() at completion
- Ack sent immediately when regen job starts processing (not when enqueued)
- After delivery, module returns to `delivered` state (not `complete`) — customer can request more changes, enabling iteration loop
- Change request status updated: `confirmed` → `in-progress` → `completed` (or `failed`)
- PipelineRun created for the regen job with `pipelineType: 'character-regen'`, cost, duration

### Concurrency Guard
- Only one active regen per tenant at a time — check for existing `in-progress` change requests before dispatching
- If concurrent request arrives: respond with "A scene is currently being regenerated. Please wait for it to complete."
- Per STATE.md blocker: budget gate + dispatch must guard against simultaneous change requests

### Claude's Discretion
- Exact retry strategy for failed scene generation (reuse character-video-gen retry count or adjust)
- Whether to extract generateScene as a shared utility or import from character-video-gen
- character-regen worker concurrency setting (likely 1-2 per tenant)
- Exact status field values and transitions on change_requests table
- R2 key pattern for regen scenes (overwrite vs versioned key)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scene generation (reuse this logic)
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — `generateScene()` function, scene prompt construction (lines 129-163), R2 upload pattern (lines 324-333), sceneUrls storage in module state (line 928)
- `apps/worker/src/services/model-router/router.ts` — Model routing for Sora 2 Pro, provider selection

### Change request system (trigger point)
- `apps/worker/src/services/onboarding/change-request-handler.ts` — Poll vote confirmation handler (lines 254-289), confirmed branch where Phase 17 dispatch hooks in
- `apps/worker/src/services/onboarding/change-request-intake.ts` — change_requests table schema (lines 54-88), status flow

### Remotion composition (no changes expected)
- `apps/worker/remotion/src/CharacterRevealComposition.tsx` — CharacterRevealProps interface, sceneClips/sceneLabels props, composition structure
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — Remotion render invocation pattern (look for renderComposition / remotionQueue usage)

### Module state machine
- `apps/worker/src/services/onboarding/module-state.ts` — getModuleState, updateModuleState, collectedData JSONB pattern
- `apps/worker/src/services/onboarding/pipeline-state.ts` — PipelineRun creation/update, status transitions

### BullMQ queues
- `apps/worker/src/queue/queues.ts` — Existing queue definitions; add character-regen queue here
- `apps/worker/src/queue/workers/` — Worker registration pattern for new queue

### Cost & alerts
- `apps/worker/src/services/expense-tracker.ts` — trackExpense(), COST_RATES, normalizeProvider()
- `apps/worker/src/services/admin-alerts.ts` — sendAdminAlert() for failure notifications

### WhatsApp delivery
- `apps/worker/src/services/waha-client.ts` — sendText (ack message), sendVideo (reveal delivery)

### Requirements
- `.planning/REQUIREMENTS.md` — REGEN-01, REGEN-02, REGEN-03, ASSEM-01 acceptance criteria

### Existing regen reference (different product, similar pattern)
- `apps/worker/src/services/regen-clips.ts` — Selective clip regen pattern from VideoForge; architectural reference only, don't reuse directly

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `generateScene()` in character-video-gen.ts: Scene generation via Sora 2 with CharacterBible prompts — core logic to reuse
- `sendAdminAlert()` in admin-alerts.ts: Failure notification pattern from Phase 15
- `trackExpense()` in expense-tracker.ts: Cost tracking with provider attribution from Phase 15
- `sendVideo()` / `sendText()` in waha-client.ts: WhatsApp messaging for ack + delivery
- `CharacterRevealComposition.tsx`: Already accepts `sceneClips: string[]` — no composition changes needed for mixed scenes
- `module-state.ts` getModuleState/updateModuleState: State persistence for sceneUrls, sceneStatuses
- `remotionQueue` in queues.ts: Existing queue for Remotion rendering — reuse for re-composition

### Established Patterns
- Module state collectedData JSONB stores all per-module persistent data (sceneUrls, pipelineRunId, etc.)
- BullMQ job → worker pattern: enqueue with job data, process in dedicated worker file
- R2 upload with metadata tracking: `r2Client.upload()` with sceneIndex, shotType, pipelineRunId
- PipelineRun tracks each generation job: type, status, cost, duration, output
- Non-blocking admin alerts: sendAdminAlert catches errors internally (Phase 15 decision)

### Integration Points
- `change-request-handler.ts` confirmed branch: Where regen dispatch job is enqueued
- `queues.ts`: Add `characterRegenQueue` definition
- `apps/worker/src/index.ts` or worker bootstrap: Register character-regen worker
- `module-state.ts` collectedData: Add sceneStatuses array alongside sceneUrls
- `character-video-gen.ts` delivery completion: Initialize sceneStatuses to all `approved`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-selected defaults based on existing patterns, PROJECT.md decisions, and Phase 16 context.

</specifics>

<deferred>
## Deferred Ideas

- FAL_WEBHOOK_VERIFY=false resolution (STATE.md blocker — needs addressing before production regen webhooks, but may be out of Phase 17 scope if using polling)
- fal.ai @handle cross-session consistency verification (STATE.md risk — document adjacency regen policy)
- Multiple concurrent scene regens (regen scenes 2 and 4 simultaneously) — keep single-scene for v1, batch in future
- Customer-facing progress bar during regen — out of scope per REQUIREMENTS.md (rate limit risk + no meaningful AI progress signal)
- Scene comparison (before/after) in WhatsApp — nice to have, not essential for v1

</deferred>

---

*Phase: 17-scene-level-regeneration*
*Context gathered: 2026-03-15*
