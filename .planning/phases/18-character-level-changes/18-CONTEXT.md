# Phase 18: Character-Level Changes - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning
**Mode:** Auto-selected (all defaults)

<domain>
## Phase Boundary

Customers can request changes to the character itself (appearance, personality, style), triggering a versioned CharacterBible update and selective multi-scene regen after admin approval. Admin reviews the diff and cost, can approve all scenes, narrow scope, or deny. Name-only changes ($0) skip generation and re-deliver the existing video with updated caption.

Requirements: CHAR-02, CHAR-03, CHAR-04, ASSEM-02

</domain>

<decisions>
## Implementation Decisions

### Field-to-Scene Mapping (CHAR-02)
- Visual fields that trigger multi-scene regen: `visualStyle`, `soraHandle`, any appearance-related metadata (these are baked into every scene prompt via `buildScenePrompts()`)
- Non-visual fields that trigger NO regen: `name`, `personaDescription`
- Detection: parse `changeDelta` from `createCharacterBibleVersion()` — it already records which fields changed. Classify each changed field as visual or non-visual
- If ANY visual field changed → all 5 scenes affected (because handle + visualStyle appear in every prompt)
- If ONLY non-visual fields changed → 0 scenes affected → name-only shortcut

### Admin Approval Flow (CHAR-03, CHAR-04)
- After customer confirms character-change via poll AND CharacterBible version is created, send admin a review notification via WhatsApp (NOT a poll — a text message with details)
- Admin review message includes: customer name, change summary (from changeDelta), old→new values for each changed field, affected scene count, total cost estimate in dollars
- Admin responds via WhatsApp poll with 3 options: "Approve all [N] scenes" / "Deny" / "Select specific scenes"
- If "Select specific scenes": send follow-up text asking which scene numbers (1-5), parse response
- If "Approve": dispatch multi-scene regen
- If "Deny": mark change request as `denied`, notify customer "Admin reviewed and declined this change", CharacterBible version stays but is not used
- Admin phone: use `config.admin.defaultPhone` (same as sendAdminAlert pattern)

### Multi-Scene Regen Strategy (CHAR-02, ASSEM-02)
- Reuse `character-regen` BullMQ queue — extend `CharacterRegenJobData` with optional `affectedSceneIndices: number[]`
- When `affectedSceneIndices` is present: sequential loop over all indices in a single worker job
- When absent: single-scene behavior (Phase 17 backwards compatible)
- Single PipelineRun per character-change (not per scene)
- Each scene: call `generateScene()` with prompt from new CharacterBible version → upload to R2 → update sceneUrls + sceneStatuses
- After all scenes regenerated: one Remotion re-render with all new URLs → one WhatsApp delivery
- Customer receives exactly 2 messages: ack at start ("Regenerating [N] scenes..."), video at completion
- Cost tracking: one `trackExpense()` per scene generation (accurate per-scene attribution)

### Name-Only Change Shortcut (Success Criteria #4)
- If changeDelta contains ONLY non-visual fields (name, personaDescription): $0 change, skip generation entirely
- No admin approval needed for $0 changes — auto-approve immediately
- Re-deliver existing reveal video from module state `revealUrl` with updated caption: "Meet [new name] — your updated AI character!"
- Update change request status to `completed` with `estimated_cost_cents: 0`
- CharacterBible version is still created (for audit trail) but no scenes regenerated

### Post-Delivery State (ASSEM-02)
- After regen delivery, module returns to `delivered` state (same as Phase 17) — customer can request more changes
- Deliver video with approve/change poll: "Happy with your updated character? Yes / Request more changes"
- "Yes" → mark all scenes as `approved`, log positive feedback
- "Request more changes" → loop back to change request handler

### Claude's Discretion
- Exact wording of admin review notification message
- How to parse "Select specific scenes" admin response (regex vs Claude classification)
- Whether to show a progress update per-scene during multi-scene regen (lean towards no — 2 messages only)
- Error handling when some scenes succeed and others fail mid-batch
- changeDelta field classification logic (hardcoded map vs dynamic)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Change request system (extend this)
- `apps/worker/src/services/onboarding/change-request-handler.ts` — Character-change poll vote handler (lines 255-290), dispatch point for Phase 18
- `apps/worker/src/services/onboarding/change-request-intake.ts` — estimateChangeCost(), change_requests table schema, status transitions
- `apps/worker/src/services/onboarding/intent-classifier.ts` — classifyChangeRequest() distinguishes scene-change from character-change

### Character system
- `apps/worker/src/services/onboarding/character-bible-versioning.ts` — createCharacterBibleVersion(), CharacterBibleFields interface, changeDelta format
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — buildScenePrompts() shows how handle + visualStyle are used in every prompt

### Regen worker (extend this)
- `apps/worker/src/queue/workers/character-regen.worker.ts` — Phase 17 single-scene worker, extend with multi-scene loop
- `apps/worker/src/queue/queues.ts` — CharacterRegenJobData interface, extend with affectedSceneIndices

### Admin & messaging
- `apps/worker/src/services/admin-alerts.ts` — sendAdminAlert() pattern for admin WhatsApp notifications
- `apps/worker/src/services/waha-client.ts` — sendText, sendVideo, sendPoll for customer + admin messaging

### Module state
- `apps/worker/src/services/onboarding/module-state.ts` — getModuleState, upsertModuleState, collectedData JSONB (sceneUrls, sceneStatuses, revealUrl)

### Requirements
- `.planning/REQUIREMENTS.md` — CHAR-02, CHAR-03, CHAR-04, ASSEM-02 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `character-regen.worker.ts` processCharacterRegen(): Phase 17 single-scene pipeline — extend with multi-scene loop
- `createCharacterBibleVersion()`: Already called on character-change confirmation — version row exists when Phase 18 dispatch runs
- `sendAdminAlert()`: Admin WhatsApp notification pattern — adapt for approval requests (currently error-only)
- `sendPoll()`: WhatsApp poll pattern for admin approval options
- `estimateChangeCost()`: Already handles character-change cost calculation (N scenes × $1.00)
- `buildScenePrompts()`: Automatically uses latest CharacterBible handle + visualStyle — new version = new prompts for all scenes

### Established Patterns
- Module state collectedData stores sceneUrls, sceneStatuses, revealUrl — multi-scene regen updates all
- Poll-based confirmation: customer → poll → handler (proven in Phase 16)
- Append-only CharacterBible versioning: INSERT new row, never UPDATE (Phase 16)
- Sequential scene generation with retries (Phase 17 worker has 2-attempt pattern)
- Non-blocking admin alerts via sendAdminAlert (Phase 15)

### Integration Points
- `change-request-handler.ts` character-change confirmed branch: Where admin notification + approval gate inserts
- `CharacterRegenJobData` in queues.ts: Add `affectedSceneIndices?: number[]`
- `character-regen.worker.ts`: Add multi-scene loop when affectedSceneIndices present
- Admin poll vote routing: Need new handler for admin approval poll (not just customer polls)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-selected defaults based on existing patterns, PROJECT.md decisions, and Phase 16-17 context.

</specifics>

<deferred>
## Deferred Ideas

- Admin web portal for change review (Phase 19 scope — ADMIN-02)
- Partial regen recovery (some scenes succeed, others fail) — log and retry manually for now
- Multi-round conversation memory for iterative refinements (ITER-01, v1.4+)
- Customer-facing progress bar during multi-scene regen — out of scope (2 messages only)

</deferred>

---

*Phase: 18-character-level-changes*
*Context gathered: 2026-03-15*
