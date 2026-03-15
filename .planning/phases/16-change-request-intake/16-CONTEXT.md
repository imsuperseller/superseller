# Phase 16: Change Request Intake - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning
**Mode:** Auto-selected (all defaults)

<domain>
## Phase Boundary

Customers can send natural-language change requests via WhatsApp after receiving their character video. The system classifies intent (scene-level, character-level, positive feedback, unrelated), extracts target scene numbers, shows a credit cost estimate, and gets customer confirmation via poll. No generation is triggered in this phase — that's Phase 17+. CharacterBible versioning is set up here (CHAR-01) so Phase 18 can use it.

Requirements: INTAKE-01, INTAKE-02, INTAKE-03, INTAKE-04, CHAR-01

</domain>

<decisions>
## Implementation Decisions

### Intent Classification
- Use Claude API call with structured JSON output to classify intent — consistent with existing ClaudeClaw pattern
- Single API call extracts both intent classification AND scene number (when applicable) — lower latency than two calls
- 4 intent categories per INTAKE-02: `scene-change`, `character-change`, `positive-feedback`, `unrelated`
- Scene number extraction handles natural language: "scene 3", "the third one", "the coffee shop scene" (match against scene descriptions from CharacterBible)
- Ambiguous messages get a clarifying question via WhatsApp before classification — avoids wasting credits on wrong intent
- Classification result stored in a change_requests table row immediately upon receipt

### Post-Delivery Message Routing
- Extend character-video-gen module with a post-delivery phase (per PROJECT.md decision: extend existing module, not new module)
- Module state transitions: `...` → `delivered` (after video sent) → subsequent messages route to change-request handler
- Change request window is indefinite — no timeout, customer can request changes anytime after delivery
- Positive feedback is logged but does NOT close the change request window — customer may still want changes later
- Messages classified as `unrelated` pass through to normal ClaudeClaw handling (don't trap all messages)

### Credit Confirmation UX
- WhatsApp poll format: "Scene regen costs X credits. Proceed? Yes / No" (leverages existing WAHA poll pattern)
- Cost estimate varies by change type: scene-level shows single scene cost, character-level shows multi-scene estimate with scene count
- Cost estimation uses COST_RATES from expense-tracker.ts — same source as actual tracking, stays consistent
- Insufficient credits: show current balance + cost, suggest contacting admin — no generation dispatched
- Poll confirmation required before any downstream dispatch (Phase 17/18) — this is the gate

### CharacterBible Versioning (CHAR-01)
- Versioned-insert pattern: INSERT new row with same tenantId, ORDER BY createdAt DESC LIMIT 1 for current version (per PROJECT.md decision)
- Only character-level changes create a new CharacterBible version — scene-level changes don't modify it
- New version includes `changeDelta` JSON field showing what changed from previous — enables admin review in Phase 18 (CHAR-03)
- Version numbering: auto-increment integer in `version` column — simple, monotonic
- Old versions are never deleted — full history preserved for rollback (ADMIN-03 in Phase 19)

### Claude's Discretion
- Exact structured output schema for the Claude classification call
- How to match "the coffee shop scene" to scene numbers (fuzzy matching approach)
- change_requests table schema details (columns beyond intent, scope, status, cost)
- Error handling for Claude API failures during classification
- Exact poll message wording and formatting

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### WhatsApp messaging & polls
- `apps/worker/src/services/waha-client.ts` — sendText, sendPoll functions for customer messaging
- `apps/worker/src/services/onboarding/modules/types.ts` — ModuleType union, ModuleState interface, OnboardingModule contract

### Character system (extend this)
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — Module to extend with post-delivery phase; has scene generation logic and existing terminal failure paths
- `apps/worker/src/services/onboarding/character-bible-generator.ts` — CharacterBible generation + DB insert; versioning extends this pattern

### Module routing & state
- `apps/worker/src/services/onboarding/module-router.ts` — Routes messages to active module; change-request routing integrates here
- `apps/worker/src/services/onboarding/pipeline-state.ts` — Pipeline state machine; post-delivery state transition goes here
- `apps/worker/src/services/onboarding/module-state.ts` — Per-module state persistence (phase, collectedData)

### Cost tracking
- `apps/worker/src/services/expense-tracker.ts` — COST_RATES constant, trackExpense(), normalizeProvider() — cost estimation source
- `CLAUDE.md` §6 "Generation Cost Tracking (MANDATORY)" — every API generation must log cost

### Message processing
- `apps/worker/src/queue/workers/claudeclaw.worker.ts` — WhatsApp message processing pipeline; change request classification hooks in here
- `apps/worker/src/queue/queues.ts` — BullMQ queue definitions; may need new queue for change-request processing

### Requirements
- `.planning/REQUIREMENTS.md` — INTAKE-01 through INTAKE-04, CHAR-01 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `waha-client.ts` sendPoll(): Already used for module selection polls — reuse for credit confirmation polls
- `expense-tracker.ts` COST_RATES: Contains per-model pricing — use for cost estimation
- `character-bible-generator.ts`: INSERT pattern for CharacterBible — extend with version column
- `claudeclaw.worker.ts`: Claude API call pattern with structured responses — reuse for intent classification
- `admin-alerts.ts` (new in Phase 15): sendAdminAlert() for failure notifications

### Established Patterns
- Module state machine: `phase` field on ModuleState drives behavior routing (intro → collecting → confirming → complete)
- Pipeline state: `onboarding_pipeline` table tracks overall progress, module_costs, status
- Poll-based confirmation: WAHA NOWEB Plus polls for user choices (proven in module selection)
- Direct Claude API fetch (not SDK): Worker uses fetch() to Anthropic API, not @anthropic-ai/sdk

### Integration Points
- `character-video-gen.ts` post-delivery: After `sendVideo()` succeeds, transition module phase to `delivered`
- `module-router.ts`: Add routing logic for `delivered` phase messages → change-request handler
- `ModuleType` union: May need `change-request` type or reuse `character-video-gen` with extended phases
- `onboarding_pipeline.status`: May need `iteration` status for post-delivery active state

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-selected defaults based on existing patterns and PROJECT.md decisions.

</specifics>

<deferred>
## Deferred Ideas

- Multi-round iterative conversation with session memory (ITER-01, v1.4+)
- Scene description matching for "the coffee shop scene" style references — may be simple enough to include, or may need fuzzy matching research
- Change request rate limiting (if customers spam changes) — monitor after shipping

</deferred>

---

*Phase: 16-change-request-intake*
*Context gathered: 2026-03-15*
