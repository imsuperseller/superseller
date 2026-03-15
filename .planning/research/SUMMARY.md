# Project Research Summary

**Project:** Character Iteration — WhatsApp-driven change requests and selective scene regeneration
**Domain:** Iterative AI character design with WhatsApp-native approval flows
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

This milestone adds iterative character modification on top of a production-ready WhatsApp-first AI character generation pipeline. The existing system (v1.0/v1.1) produces a 5-scene `CharacterReveal` video via Sora 2/fal.ai, stores a `CharacterBible` in Postgres, and delivers via WAHA WhatsApp — all validated in production. The gap this milestone closes: once a client receives their reveal video and wants changes, there is currently no supported path. Every change requires a full $5-10 pipeline re-run from scratch.

The recommended approach is to extend the existing `character-video-gen` module with post-delivery phases rather than spin up a separate module. This keeps all context (sceneUrls, pipelineRunId, bibleId) in `collectedData` and reuses the existing `runCompositionPipeline()` as a re-entry point. The core flow: client sends a WhatsApp message → Claude classifies intent → cost estimate shown with confirmation poll → only affected scenes are regenerated via BullMQ → composition re-renders with merged old/new scene URLs → updated video delivered. No new npm packages are required; the entire milestone builds on existing BullMQ, zod, pg, and Claude fetch patterns.

The primary risks are economic (uncapped regeneration spend), architectural (conversation state corruption routing change requests back into the questionnaire), and data integrity (CharacterBible mutated in-place losing rollback capability). Two pre-Phase-1 fixes are mandatory before any iteration feature ships: the silent Remotion render failure must be wired to admin WhatsApp notification, and the `service: "kie.ai"` cost tracking misattribution must be corrected to `fal`. Both are known tech debt items with unblocked fixes.

---

## Key Findings

### Recommended Stack

The existing worker stack is sufficient for all iteration capabilities — no new packages are needed. The four net-new capabilities (conversation state for iterative loops, diff-based CharacterBible updates, selective scene regeneration, approval/rejection flow) all run on BullMQ `^5.67.3`, zod `^4.3.6`, pg `^8.18.0`, and Claude via direct fetch — all already installed and version-confirmed in `apps/worker/package.json`. The only new infrastructure is a `character-regen` BullMQ queue (same Redis connection) and a `character_iteration_history` Postgres table (no migration impact on existing tables).

**Core technologies:**
- `character-video-gen` module extension (existing) — post-delivery phase machine — cleanest fit; avoids state loss from a new module registration
- Claude API via `fetch()` (existing, `claude-sonnet-4-20250514`) — natural language intent parsing and CharacterBible diff generation — already proven in `character-bible-generator.ts`
- BullMQ `character-regen` queue (new queue, existing connection) — single-scene regeneration jobs with retry isolation and admin visibility
- Zod `CharacterDiffSchema` (existing package) — validates Claude's structured diff JSON before any DB write
- Versioned-insert pattern for CharacterBible (no schema change) — `fetchCharacterBible()` already uses `ORDER BY createdAt DESC LIMIT 1`; inserting a new row = automatic latest-version resolution with full history preserved

### Expected Features

**Must have (P1 — table stakes for launch):**
- Natural-language change request via WhatsApp — zero-friction path for clients already operating in WhatsApp; no other channel is acceptable
- CharacterBible mutability + versioning — foundational blocker; every downstream feature depends on the bible being mutable with rollback capability
- Credit confirmation before regeneration — cost transparency is both an ethical requirement and a hard business rule (`feedback_predelivery_checklist.md`)
- Selective scene regeneration (scene-level) — regenerate only affected scenes, not all 5 at full $5 cost
- Per-scene status tracking (`approved | pending | rejected`) — required for selective re-assembly
- CharacterReveal mixed-scene re-assembly — Remotion accepts `sceneUrls: string[]` prop array; re-renders with merged old/new URLs
- Change request start acknowledgment + completion delivery — two WhatsApp messages only; no mid-generation polling (explicit business rule)

**Should have (P2 — add after core validated with at least one client):**
- Character-level change request support — CharacterBible field diff + multi-scene scope logic
- Targeted scope classification — which scenes are semantically affected by a character-level change
- Admin change request review gate — for expensive character-level changes before client credit spend
- Version history UI in admin portal — one-click rollback
- Change request history log (`character_iteration_history` table) for billing audit trail

**Defer (v2+):**
- Multi-round iterative conversation with session memory across days
- Client-facing change request portal (contradicts WhatsApp-first product positioning)
- Automatic scene drift detection using embedding similarity
- Per-client model fine-tuning via LoRA/DreamBooth (economically unviable at $10-50/character for this scope)

### Architecture Approach

The module router checks `phase !== 'complete'` to keep a module active. The correct pattern is to extend `character-video-gen` with post-delivery phases (`delivered → awaiting-change-request → [branch] → signed-off`), reserving `complete` only for true sign-off. This preserves all `collectedData` context without re-fetching and lets `runCompositionPipeline()` be re-entered by setting `phase = 'awaiting-composition'` with updated `sceneUrls` in `collectedData` — saving ~200 lines of duplicated render/upload/deliver code. The alternative (a new `character-iteration` module) was explicitly evaluated and rejected: it loses collectedData context and creates implicit module ordering that the registry doesn't support.

**Major components:**
1. `change-intent-parser.ts` (NEW, standalone) — Claude call returning typed `ChangeRequest`: `change-bible | regen-scenes | regen-all | sign-off | unclear`; tested independently before wiring into the phase machine
2. `character-video-gen.ts` (MODIFY) — add 4 post-delivery phases; split `complete` into `delivered` (module stays active, `completed: false`) and `signed-off` (true pipeline completion, `completed: true`)
3. `character-bible-generator.ts` (MODIFY) — add `updateCharacterBible(tenantId, delta)` using versioned-insert pattern; re-call Claude to re-synthesize `personaDescription` and scenario prompts from merged fields
4. `character-regen` BullMQ queue + worker (NEW) — processes `CharacterRegenJobData` jobs; retry isolation per scene; same Redis connection as existing 7 queues
5. `character_iteration_history` table (NEW, SQL not migration) — typed audit trail: `bible_id_before/after`, `diff_json`, `status`, `scenes_regenerated`, `cost_cents`

### Critical Pitfalls

1. **Runaway regeneration cost** — no per-tenant budget ceiling exists; three change rounds can burn $15+ before any human reviews. Prevention: query `api_expenses` sum before every regen trigger; enforce configurable ceiling via `ServiceInstance.configuration`; route to admin via WAHA if exceeded. This gate must be wired before exposing any change request CTA.

2. **Conversation state corruption** — change request messages hitting `character-questionnaire` `confirming` phase (confirmed bug at line 244) trigger a full questionnaire reset, overwriting the completed CharacterBible with the change request text as a personality answer. Prevention: post-delivery phases must live inside `character-video-gen` (not fall through to questionnaire); `confirming` phase must only accept explicit yes signals, never free-text.

3. **CharacterBible version drift** — if `soraHandle` is not cleared when `name` changes, Sora 2 prompts send `@alex` while the bible says `Jordan`. Prevention: always INSERT new CharacterBible row (never UPDATE in place); clear `soraHandle` on name changes; add `AND active = true` to `fetchCharacterBible()` query.

4. **Partial regeneration character inconsistency** — Sora 2 `@handle` consistency across separate API sessions is not officially documented as guaranteed. Retaining 4 original scenes while regenerating 1 may produce a visually different character. Prevention: store original fal.ai `request_id` in asset metadata; document adjacency regeneration policy before Phase 2 ships; consider regenerating adjacent scenes as default.

5. **Silent render failure (tech debt, Phase 0 blocker)** — when Remotion render fails after all retries, `sendVideo(groupId, "", undefined)` silently delivers nothing (confirmed at lines 491-498 of `character-video-gen.ts`). Admin phone is now populated in `onboarding_pipeline.admin_phone` — the fix is unblocked. Must close before adding more failure points via iteration paths. Prevention: on render failure, call `sendText(adminPhone, errorMessage)`, set `PipelineRun.status = 'failed'`, and send client a "our team will follow up" message.

6. **Cost tracking misattribution** — `trackExpense({ service: "kie.ai", ... })` is hardcoded in `generateAllScenes()` regardless of which provider ran the job. The budget gate in Phase 1 reads `api_expenses`; wrong labels produce wrong budget calculations. Prevention: propagate `jobResult.provider` to `trackExpense()` call; add `operation: 'sora-2-pro-regen'` distinct from initial generation — fix before any regen ships.

---

## Implications for Roadmap

The dependency graph enforces a clear 4-phase order with two mandatory Phase 0 prerequisites. Two known bugs must be closed before any iteration code ships — they are not edge cases but load-bearing infrastructure for the budget gate and admin fallback that all iteration features rely on.

### Phase 0: Pre-Requisite Tech Debt Fixes (Mandatory Before Any Iteration Code)
**Rationale:** Silent render failure and cost tracking misattribution are load-bearing bugs. The budget gate in Phase 1 reads `api_expenses`; wrong service labels produce wrong budget numbers. Admin failure notification is the only safety net when generation fails mid-iteration. Both fixes have exact file locations and line numbers — they are not research problems, just unfinished work.
**Delivers:** Admin failure notifications via WAHA on Remotion failure; correct `service` label (`fal` not `kie.ai`) in `api_expenses`; `operation: 'sora-2-pro-regen'` distinct expense category ready for Phase 1 budget gate; staleness cron alerting on pipelines stuck > 2 hours
**Fixes:**
- `character-video-gen.ts` lines 491-498: wire `sendText(adminPhone, errorMessage)` on Remotion failure; update `PipelineRun.status = 'failed'`
- `generateAllScenes()`: propagate `jobResult.provider` to `trackExpense({ service: jobResult.provider, ... })`
- `admin_phone` null guard: add fallback to configured default admin number for pipelines missing the field
- `FAL_WEBHOOK_VERIFY=false` tech debt: resolve before regen webhooks go live (spoofed completions could advance state without real generation)
**Avoids:** Silent customer abandonment during iteration; budget gate built on wrong data; webhook spoofing advancing pipeline state

### Phase 1: Change Request Intake Foundation
**Rationale:** Intent classification is the prerequisite for all downstream features. The budget gate, CharacterBible versioning decision, and state routing must all exist before any regeneration is triggered. This phase produces no visible AI generation — it wires the decision layer and the database foundation.
**Delivers:** Clients can send a change request, receive a cost-transparent confirmation poll, and see it correctly classified and routed — without triggering any generation yet; CharacterBible is mutable with full version history
**Addresses (P1 features):**
- Natural-language change request via WhatsApp (post-delivery phases wired)
- CharacterBible mutability + versioning (schema decision + `updateCharacterBible()`)
- Credit confirmation before regeneration (WAHA poll gate; no generation dispatched until YES)
- Per-scene status tracking (`scene_status` column setup)
**Implements:** `change-intent-parser.ts` (standalone, unit-testable with 10+ sample messages); post-delivery phases in `character-video-gen.ts` (`delivered → awaiting-change-request`); budget gate query against `api_expenses`; `character_iteration_history` table
**Avoids:** State corruption (Pitfall 2 — questionnaire fall-through); CharacterBible version drift (Pitfall 3); customer confusion on change types (Pitfall 5); runaway cost (Pitfall 1)
**Research flag:** Standard — all patterns confirmed in codebase; Claude prompt engineering for intent parsing needs real WhatsApp-style message samples but no external research required

### Phase 2: Scene-Level Selective Regeneration
**Rationale:** Scene-level changes (one scene, no CharacterBible update) are the most common and lowest-cost request type ($1-3 per change). Ship this before character-level changes to validate the regeneration loop with minimal credit risk, and to gather real client feedback that informs the scope classification logic needed in Phase 3.
**Delivers:** Client sends "change scene 3 background to coffee shop" → single scene regenerated → updated CharacterReveal delivered via WhatsApp; approved scenes untouched; full audit trail in `character_iteration_history`
**Addresses (P1 features):**
- Selective scene regeneration (scene-level)
- CharacterReveal mixed-scene re-assembly (Remotion `sceneUrls` prop + phase re-entry to `awaiting-composition`)
- Change request start + completion messages (two WAHA sends; no intermediate updates)
**Implements:** `character-regen` BullMQ queue + `character-regen.worker.ts`; `runSceneRegenPipeline()` function inside `character-video-gen.ts`; merge logic for old/new `sceneUrls`; new `PipelineRun` with `pipelineType: 'character-video-regen'` per regen run
**Avoids:** Partial regeneration character inconsistency (Pitfall 4 — document adjacency policy explicitly before shipping; store original fal.ai `request_id` in asset metadata); concurrent regen race (check `PipelineRun` for running regen before dispatching second job)
**Research flag:** Low risk — BullMQ queue pattern is identical to 7 existing queues; Remotion re-entry via `awaiting-composition` phase transition confirmed; fal.ai `@handle` cross-session consistency is the one unresolved uncertainty (treat as best-effort, document in decision log)

### Phase 3: Character-Level Change Requests
**Rationale:** Character-level changes (CharacterBible field update + multi-scene regeneration) are more expensive ($5-15 per request) and require both admin review and more sophisticated scope classification. Defer until the scene-level flow is validated with real client usage.
**Delivers:** Client says "make her more casual" → CharacterBible updated (new version inserted) → affected scenes identified by SCENE_FIELD_MAP → admin reviews scope + estimated cost → client confirms → selective multi-scene regen dispatched → updated CharacterReveal delivered
**Addresses (P2 features):**
- Character-level change request support
- Targeted scope classification (field-to-scene mapping via `SCENE_FIELD_MAP`)
- Admin change request review gate (WAHA notification with scope + cost before dispatch)
**Implements:** `changeType: 'change-bible'` branch in `character-video-gen.ts`; `updateCharacterBible()` delta merge + Claude re-synthesis; `SCENE_FIELD_MAP` for scope determination; admin WAHA approval step before BullMQ dispatch; cost comparison message for full-overhaul threshold (>= 4 affected scenes = suggest fresh start)
**Avoids:** Full 5-scene regeneration for name-only changes (name change → `affectedScenes = []`, skip regen, re-send existing reveal with updated caption, $0 AI cost); uncapped character-level regen without admin gate
**Research flag:** Medium — Claude prompt for CharacterBible delta requires careful engineering (field isolation + re-synthesis without hallucinating new character traits); scope mapping validation needs at least 5 real change request types before hardcoding the static map

### Phase 4: Admin Tooling and Version History
**Rationale:** Operational tooling adds no client-facing value until the iteration loop has real usage data worth reviewing. Build this after Phase 3 produces at least a few real character-level changes with an audit trail to display.
**Delivers:** Admin portal view of CharacterBible versions per character; one-click rollback with confirmation; change request history with cost per request; admin endpoint for per-tenant iteration spend
**Addresses (P2 features):**
- Version history UI in admin portal
- Change request history log (surface `character_iteration_history` data)
- Per-tenant iteration budget visibility
**Research flag:** Standard — admin portal component pattern is established; no novel integration needed; check existing admin portal structure before designing new views to reuse established table/modal patterns

### Phase Ordering Rationale

- Phase 0 before everything: the budget gate (Phase 1) reads `api_expenses`; if the service label is wrong, the gate produces wrong numbers. The admin fallback (Phase 0) is the only safety net when iteration pipelines fail.
- Phase 1 before Phase 2: intent classification and CharacterBible versioning are prerequisites for any regeneration. Exposing a regen queue without the budget gate creates runaway spend risk.
- Phase 2 before Phase 3: scene-level changes ($1-3) validate the regeneration loop cheaply before introducing character-level changes ($5-15). Real client feedback on scene-level regen will calibrate the `SCENE_FIELD_MAP` in Phase 3.
- Phase 4 last: operational tooling requires data to display. Building a version history UI before version history is being generated is premature.

### Research Flags

Phases needing deeper research during planning:
- **Phase 3:** Claude prompt engineering for CharacterBible delta (field isolation without hallucination) needs iteration with real change request samples before the prompt is finalized. The static `SCENE_FIELD_MAP` should be validated with real client change request types before hardcoding.

Phases with standard patterns (skip research-phase):
- **Phase 0:** Both fixes have exact file locations and line numbers — implementation not research
- **Phase 1:** Intent parser pattern mirrors `character-bible-generator.ts`; all integration points confirmed in codebase from direct inspection
- **Phase 2:** BullMQ queue pattern identical to 7 existing queues; Remotion phase re-entry confirmed as a data change only
- **Phase 4:** Admin portal patterns established; check existing structure before designing

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct codebase inspection of all referenced files; package versions confirmed in `apps/worker/package.json`; no new packages required — every capability maps to an existing dependency |
| Features | HIGH | Verified against HeyGen Video Agent official blog (Jan 2026 release), LTX Studio Elements vendor docs, ShapeOfAI official pattern library; business rules confirmed via project memory (`feedback_predelivery_checklist.md`, `feedback_no_scheduled_kie.md`) |
| Architecture | HIGH | All integration points read from source with line numbers cited; data flow traced end-to-end through `claudeclaw.worker.ts` → `module-router.ts` → `character-video-gen.ts`; two candidate patterns (new module vs. phase extension) evaluated against actual routing logic |
| Pitfalls | HIGH | Grounded in direct inspection of production code with specific line numbers; tech debt items (lines 491-498, service label hardcode) confirmed as known and unblocked; not inference |

**Overall confidence:** HIGH

### Gaps to Address

- **Sora 2 `@handle` cross-session consistency:** Not officially documented by fal.ai. The assumption that handles produce consistent character appearance across separate API calls made days apart is unverified. Mitigation documented: always include full visual description text alongside handle; document adjacency regeneration policy as an explicit decision before Phase 2 ships.

- **fal.ai webhook signature verification (`FAL_WEBHOOK_VERIFY=false`):** Documented v1.1 tech debt. Spoofed webhook completions could advance pipeline state without real generation. Must be resolved before regen webhooks go live — add to Phase 0 scope or gate Phase 2 ship on this fix.

- **Intent parser accuracy on Hebrew voice notes:** The bilingual requirement is documented but the parser's classification accuracy on transcribed Hebrew change requests is untested. Recommendation: build a test suite with 10+ Hebrew message samples before Phase 1 ships; voice notes arrive as `hasMedia: true` with `mediaType: 'audio'` — transcription must precede classification.

- **`admin_phone` null for older pipelines:** Pipelines created before the column was added may have empty `admin_phone`. All admin notification paths in Phase 0 and Phase 2 must guard against null and fall back to a configured default admin number.

- **Concurrent regen race condition:** Budget gate query and regen dispatch must be atomic or use a DB advisory lock. If two change requests arrive before the first regen `PipelineRun` row is written, both pass the budget gate and two concurrent regen jobs launch. Mitigation: check for `PipelineRun WHERE pipelineType = 'character-video-regen' AND status = 'running' AND tenantId = $1` before accepting any new change request.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase: `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — phase machine (lines 491-498 silent failure confirmed), CTA text, cost tracking hardcode
- Direct codebase: `apps/worker/src/services/onboarding/character-bible-generator.ts` — `callClaude()` pattern, INSERT pattern, `fetchCharacterBible()` ORDER BY query
- Direct codebase: `apps/worker/src/services/onboarding/module-router.ts` — `phase !== 'complete'` routing logic confirmed
- Direct codebase: `apps/worker/src/services/onboarding/modules/character-questionnaire.ts` — `confirming` phase reset bug confirmed at line 244
- Direct codebase: `apps/worker/src/services/onboarding/module-state.ts` — `onboarding_module_state` schema, `upsertModuleState()` pattern
- Direct codebase: `apps/web/superseller-site/prisma/schema.prisma` — `CharacterBible` model (`version Int @default(1)`, `active Boolean @default(true)`, `soraHandle String?` confirmed)
- Direct codebase: `apps/worker/package.json` — bullmq `^5.67.3`, zod `^4.3.6`, pg `^8.18.0`, ioredis `^5.9.2` confirmed
- HeyGen Video Agent January 2026 release (official blog) — conversational scene editing, scope detection, pre-build blueprint review
- ShapeOfAI Regenerate UX Pattern (official library) — overwrite vs. branching, guided regeneration, "set clear expectations for what will change"

### Secondary (MEDIUM confidence)
- HeyGen Video Agent help docs — scope detection (small change = one scene, structural = re-plan), post-render editability
- LTX Studio Elements blog — persistent character assets, versioned reuse across projects without regenerating from scratch
- Project memory (`feedback_predelivery_checklist.md`, `feedback_wire_before_deliver.md`, `feedback_no_scheduled_kie.md`) — business rule constraints on cost transparency and generation gating

### Tertiary (LOW confidence — needs validation)
- fal.ai `@handle` cross-session consistency — not officially documented; treat as best-effort until validated
- `FAL_WEBHOOK_VERIFY=false` resolution path — tech debt, fix approach not yet confirmed

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
