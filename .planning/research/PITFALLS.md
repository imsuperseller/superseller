# Pitfalls Research

**Domain:** Adding iterative character modification and scene regeneration to an existing WhatsApp-first AI pipeline
**Researched:** 2026-03-15
**Confidence:** HIGH (grounded in direct codebase inspection of character-video-gen.ts, character-questionnaire.ts, regen-clips.ts, pipeline-state.ts, module-state.ts, CharacterBible schema — not inference)

---

## Critical Pitfalls

### Pitfall 1: Runaway Regeneration Cost — No Per-Tenant Budget Gate on Change Requests

**What goes wrong:**
`character-video-gen.ts` tracks cost at `SORA_COST_PER_SCENE = $1.00` per scene. All 5 scenes are submitted in parallel via `Promise.all`. When a customer sends a WhatsApp change request ("make him more confident"), the new iteration adds another 5 scenes at $5.00 with no budget check. A customer who sends three rounds of changes burns $15+ before any human reviews the spend. The `complete` phase handler currently says "Reply here if you'd like any changes" — this is an open invitation with no throttle.

**Why it happens:**
The v1.0 pipeline was designed for a single generation pass. Budget enforcement via `BUDGET_CEILINGS` in `shot-types.ts` guards per-clip cost tier selection, not per-tenant cumulative regeneration spend. There is no `max_regeneration_rounds` field in `CharacterBible`, `onboarding_pipeline`, or `PipelineRun`.

**How to avoid:**
Before triggering any regeneration job:
1. Query `api_expenses WHERE metadata->>'tenantId' = $tenantId AND created_at > NOW() - INTERVAL '30 days'` and sum costs.
2. Enforce a per-tenant character regeneration budget ceiling (e.g., $10 total across all iterations, configurable per `ServiceInstance.configuration`).
3. If ceiling is reached, route to admin via WhatsApp to the `adminPhone` stored in `onboarding_pipeline.admin_phone` before proceeding.
4. Log the regeneration request as a distinct `PipelineRun` with `pipelineType: 'character-regen'` so cost is attributable and auditable separately from initial generation.
5. Never auto-approve a regeneration that would exceed the remaining budget ceiling.

**Warning signs:**
- `api_expenses` rows with `operation: 'sora-2-pro'` appear more than once per tenant within 48 hours
- `onboarding_pipeline.total_cost_cents` grows past the initial $5.00 (5 scenes) without an admin notification
- A customer sends more than 2 WhatsApp messages after `character-video-gen` reaches `complete` phase

**Phase to address:** Phase 1 (change request intake) — budget gate must be wired before any regeneration trigger is exposed in the `complete` phase handler.

---

### Pitfall 2: Conversation State Corruption — Change Requests Processed as New Onboarding Answers

**What goes wrong:**
When `character-video-gen` is in `complete` phase and a customer sends "I want the character to look more professional," the module returns `{ handled: true, response: "...", completed: true }`. If the module router then falls through to `character-questionnaire` (which is also in `complete` phase), and the questionnaire module does not handle the message, the router may fall through to the next available module — or worse, if the questionnaire is reset during a retry scenario, the customer's change request text ("more professional") lands in `asking_personality` and gets stored as the personality answer, overwriting the CharacterBible that was already generated.

Inspection of `character-questionnaire.ts` line 244: when `msgLower !== 'yes'`, the confirming phase resets state to `asking_name`. A customer who types a natural response during confirmation ("looks mostly good, can we change X?") triggers a full questionnaire reset, losing all collected data.

**Why it happens:**
The module router processes one module at a time in sequence. Module `complete` state returns `completed: true` but the pipeline state machine has no explicit "iteration mode" that routes change-request messages to a dedicated handler rather than back into the questionnaire flow.

**How to avoid:**
1. Add a `character-iteration` module type distinct from `character-questionnaire` and `character-video-gen`. This module owns all post-delivery change requests and routes them into a controlled change-request parser (Claude prompt) rather than the questionnaire state machine.
2. The `character-video-gen` `complete` phase must transition the pipeline to `status: 'awaiting-feedback'` in `onboarding_pipeline`, not leave it in `status: 'active'`. The router must check pipeline status before routing messages to modules.
3. The `character-questionnaire` `confirming` phase must be hardened: only `yes/y/yep/looks good/confirm` advance; anything else prompts "Please reply yes to confirm or no to restart." Never treat a free-text response as a "no."

**Warning signs:**
- `onboarding_module_state` shows `character-questionnaire` returning to `asking_name` after `character-video-gen` was already `complete`
- `CharacterBible` rows being overwritten (check `version` field: if `version` increments without an explicit admin-approved change request, something is resetting the questionnaire)
- Customer receives the intro questionnaire message again after the reveal video was delivered

**Phase to address:** Phase 1 (change request intake) — the pipeline status gate and `character-iteration` module registration must exist before the `complete` phase CTA is added.

---

### Pitfall 3: CharacterBible Version Drift — Partial Updates Leave Inconsistent State

**What goes wrong:**
`CharacterBible` schema has a `version Int @default(1)` field but no versioning logic exists anywhere in the codebase (`generateCharacterBible` in `character-bible-generator.ts` always creates a new row via INSERT, never INSERTs a new version or DEACTIVATEs the prior one). When a customer requests "change the name from Alex to Jordan," the correct flow is: create CharacterBible v2 with `name: 'Jordan'`, deactivate v1 (`active: false`), regenerate only name-dependent scenes.

Without this, two failure modes occur:
- The update mutates the existing CharacterBible row directly — all historical `PipelineRun` records that reference the old CharacterBible lose their ground truth (what was the character when each video was generated?)
- A partial field update succeeds (name changes) but the `soraHandle` is not updated to match the new name, so Sora 2 prompts still reference `@alex` while the Bible says `Jordan`.

**Why it happens:**
`character-video-gen.ts` `buildScenePrompts()` constructs the Sora 2 handle string as `bible.soraHandle ? \`@${bible.soraHandle}\` : bible.name`. If `soraHandle` is not regenerated when the name changes, the prompt sends `@alex` (old handle) but the character name is `Jordan` — Sora 2 will generate scenes for the old handle.

**How to avoid:**
1. Never mutate an existing CharacterBible row when processing a change request. Always create a new row with `version = oldVersion + 1`, `active = true`, and deactivate all prior rows for the same tenant (`active = false`).
2. When the change request affects `name` or `visualStyle`, the `soraHandle` must be either re-generated from the new name or explicitly cleared so `character-video-gen.ts` falls back to `bible.name` in prompt construction.
3. `fetchCharacterBible()` already queries `ORDER BY "createdAt" DESC LIMIT 1` — this is correct and will naturally pick up the latest version. Verify that the active flag is also checked: add `AND active = true` to the query.
4. Store the `characterBibleId` (not just the version number) in every `PipelineRun.inputJson` so that historical runs can be audited against the exact CharacterBible snapshot that was active at generation time.

**Warning signs:**
- `CharacterBible` `version` column stays at `1` through multiple change requests (no versioning happening)
- `PipelineRun.inputJson` does not contain `characterBibleId`
- Sora 2 prompts logged in `ai_model_decisions.reasoning` reference a character handle that doesn't match the current `CharacterBible.name`

**Phase to address:** Phase 1 (change request intake) — CharacterBible versioning schema must be decided before any change request writes to the DB. Phase 2 (scene regeneration) depends on correct version resolution.

---

### Pitfall 4: Partial Regeneration Inconsistency — Scene Set Is No Longer Coherent

**What goes wrong:**
The existing `regen-clips.ts` (VideoForge) solves partial regeneration for property tour clips by using `start_frame_url` and `end_frame_url` to maintain continuity with adjacent clips. Character scenes don't have the same frame-continuity requirement — but they have a character consistency requirement: all 5 scenes must depict the same character with the same visual attributes.

When a customer says "change the background in scene 2 to outdoors," only scene 2 is regenerated. Scenes 0, 1, 3, 4 were generated with a Sora 2 handle that may have been registered during the initial generation. If Sora 2's `@handle` lookup is session-specific or model-specific, scenes 0, 1, 3, 4 used a different Sora session state than the newly regenerated scene 2. The character's face, clothing, and proportions may differ between retained and regenerated scenes. The final Remotion reveal video shows a visually inconsistent character across scenes.

**Why it happens:**
Sora 2's `@handle` mechanism (referenced as `soraHandle` in CharacterBible) anchors character identity to a registered reference. But there is no documented guarantee that a handle registered in one API session produces pixel-consistent output across separate API calls made days apart — the model's underlying weights may be updated by fal.ai between the initial generation and the regeneration.

**How to avoid:**
1. When any scene is regenerated, regenerate ALL scenes that will appear adjacent to it in the reveal video unless the customer explicitly approves retaining adjacent scenes after seeing a side-by-side comparison. This is more expensive but produces a coherent output.
2. Store the fal.ai `request_id` from the original scene generation in `TenantAsset.metadata` or the `PipelineRun.outputJson`. When regenerating, log the original `request_id` alongside the new one so that character drift can be detected by comparing outputs.
3. After partial regeneration, before delivering the new reveal video, run a basic visual consistency check: compare the first frame of each scene using FFmpeg's `ffprobe` or a simple color histogram check. If scenes diverge significantly (histogram distance above threshold), send an admin WhatsApp alert before customer delivery.
4. Default behavior for a "change scene X" request should be: regenerate scene X + adjacent scenes (X-1, X+1), not just X alone.

**Warning signs:**
- Customer WhatsApp messages after partial regen say "that doesn't look like the same person"
- `TenantAsset.metadata` has no `originalRequestId` field on scene assets
- Remotion reveal video has visible character appearance shifts between scenes

**Phase to address:** Phase 2 (scene regeneration logic) — the adjacency regeneration policy must be documented as an explicit decision before any partial regen is shipped.

---

### Pitfall 5: Customer Confusion — No Clear Protocol for What "Change Request" Means

**What goes wrong:**
After delivery, the reveal video caption ends with: "Reply here if you'd like any changes." This is intentionally open-ended. Customers will send:
- "Can you make the background blue?" — visual scene change (expensive: full scene regen)
- "Change the name to Jordan" — CharacterBible field change (cheap: DB update + selective regen)
- "Looks great!" — positive feedback (should not trigger regen)
- "Make him taller" — anatomical change that Sora 2 handles via prompt modification, but the customer expects it to look identical to the original otherwise
- "Can I see a version without the logo?" — Remotion composition parameter change (free: re-render only)
- A voice note in Hebrew saying something ambiguous

The `complete` phase handler currently returns the same "Your character reveal video has been delivered!" response to all of these. There is no intent classification happening. Every message that could be a change request is treated identically — ignored, waited on, or routed to an inappropriate module.

**Why it happens:**
The `complete` phase handler has a single catch-all `case 'complete'` that returns a static acknowledgment. No intent parsing, no change-type classification, no cost estimate before commitment.

**How to avoid:**
1. After delivery, transition the pipeline to a `character-iteration` module in `awaiting-change-request` phase. This module receives every message and passes it through a Claude classification prompt before any action is taken.
2. The classification prompt must output a structured JSON: `{ changeType: 'scene_visual' | 'character_bible' | 'composition_only' | 'positive_feedback' | 'unclear', affectedScenes: number[], estimatedCostDollars: number }`.
3. For `composition_only` changes (logo, color, font): re-render Remotion with updated props — zero AI generation cost.
4. For `character_bible` changes (name, personality): update CharacterBible, then ask the customer which scenes to regenerate with a WAHA poll.
5. For `scene_visual` changes: always show the estimated cost ($X.XX for N scenes) and require explicit customer confirmation before submitting to fal.ai. Never auto-generate on a change request message.
6. Voice notes must be transcribed (existing infrastructure via voice note transcription in the pipeline) before classification. Hebrew messages must be handled — the bilingual requirement is already documented in CLAUDE.md.

**Warning signs:**
- Change request messages hit `character-video-gen` `complete` phase and return a generic "Your character reveal video has been delivered!" response
- Sora 2 jobs appear in `api_expenses` within minutes of a customer sending a casual message like "nice!"
- Customer sends a change request in Hebrew and receives an English response that misunderstands the intent

**Phase to address:** Phase 1 (change request intake) — intent classification is the foundation. Without it, all downstream phases (regeneration, versioning, cost gates) have no reliable trigger.

---

### Pitfall 6: Admin Oversight Gap — Render Failure Has No WhatsApp Fallback (Known v1.0 Tech Debt)

**What goes wrong:**
This is a documented tech debt item from v1.0. In `character-video-gen.ts` lines 491-498: when both Remotion render attempts fail, the code calls `sendVideo(groupId, "", undefined)` with an empty URL — this silently fails — then logs "group will need manual follow-up." The customer receives nothing. There is no WhatsApp message to the admin phone (`onboarding_pipeline.admin_phone`) and no `PipelineRun` status that an admin dashboard can filter on to detect stale failed deliveries.

When iteration is added, this failure mode becomes more common: regeneration involves multiple Remotion re-renders, and each re-render that fails leaves the customer waiting in silence while the pipeline is stuck in `awaiting-composition` or `composing` phase.

**Why it happens:**
The WhatsApp fallback notification to the admin was marked as tech debt in v1.0 because it required knowing the admin's phone at render time, and `adminPhone` was not always populated. `onboarding_pipeline.admin_phone` now exists and is populated — the blocker no longer exists. The fix was never completed.

**How to avoid:**
1. When a Remotion render fails after all retry attempts: send a WAHA text message to `onboarding_pipeline.admin_phone` with the error summary, tenantId, and pipelineRunId. Use `sendText(adminPhone, errorMessage)` — this already exists in the WAHA client.
2. Update `PipelineRun.status` to `'failed'` with a `failureCategory: 'render_failure'` field in `outputJson` so the admin dashboard can surface it.
3. For iteration-specific failures: if a change-request-triggered regen fails, send the customer a message: "I wasn't able to generate that change. Our team will follow up shortly." Don't leave the customer in silence.
4. Add a staleness cron: query `onboarding_pipeline WHERE status NOT IN ('complete', 'failed') AND updated_at < NOW() - INTERVAL '2 hours'` and alert admin for each stale pipeline.

**Warning signs:**
- `PipelineRun` rows with `status = 'composing'` that are older than 30 minutes (Remotion render shouldn't take that long)
- `onboarding_module_state` stuck in `awaiting-composition` or `composing` phase for more than 1 hour
- Customer sends "did you get my request?" after 20+ minutes of silence

**Phase to address:** Phase 0 (prerequisite before iteration ships) — the admin fallback notification is tech debt that must be closed before any iteration feature is added. Adding more failure points (regen pipelines) without fixing the silent failure mode is dangerous.

---

### Pitfall 7: Cost Tracking Misattribution — Regeneration Scenes Logged Under Wrong Service

**What goes wrong:**
In `character-video-gen.ts` line 338: `trackExpense({ service: "kie.ai", operation: "sora-2-pro", ... })`. This is wrong — Sora 2 is served via fal.ai, not kie.ai. When regeneration is added and fal.ai is used for new scenes, all regeneration costs will also be logged as `service: "kie.ai"` unless the tracking call is corrected. The `api_expenses` table becomes untrustworthy: the kie.ai billing dashboard will not show these charges (they appear on fal.ai), but the DB says kie.ai.

This same issue exists in the initial generation but has no downstream consequence yet because there is only one provider for character scenes. When the model router is allowed to pick between providers for different scenes (e.g., budget scenes via Wan 2.6, premium scenes via Sora 2), cost misattribution means there is no way to audit actual spend by provider.

**Why it happens:**
The `trackExpense()` call in `generateAllScenes()` hardcodes `service: "kie.ai"` regardless of which adapter (`routerResult.adapter`) actually executed the job. The provider name is available in `jobResult.provider` (returned from `adapter.submitJob()`) but is never passed to `trackExpense()`.

**How to avoid:**
1. In `generateAllScenes()`, propagate `jobResult.provider` to `trackExpense({ service: jobResult.provider, ... })`.
2. Add a regeneration-specific expense category: `operation: 'sora-2-pro-regen'` distinct from `'sora-2-pro'` for initial generation. This allows admin to query total regen cost separately from initial generation cost.
3. In the cost gate (Pitfall 1), sum only `operation LIKE '%-regen'` rows for the budget ceiling check — this prevents initial generation cost from counting toward the iteration budget.
4. Verify after the first regeneration: `SELECT service, SUM(estimated_cost) FROM api_expenses WHERE metadata->>'tenantId' = $tenantId GROUP BY service` should show fal.ai entries, not kie.ai.

**Warning signs:**
- `api_expenses` shows `service: 'kie.ai'` for character scene generations (kie.ai doesn't serve Sora 2)
- kie.ai billing dashboard shows less spend than `api_expenses` sums for `service = 'kie.ai'`
- No way to query "how much have we spent on character regenerations this month?" because initial and regen costs share the same `operation` string

**Phase to address:** Phase 0 (fix before any regen ships) — this is a data integrity issue. A wrong tracking label means no cost accountability for the iteration feature.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `service: "kie.ai"` hardcoded in character scene tracking | No refactor needed | fal.ai costs appear as kie.ai in DB; provider billing reconciliation impossible | Never — fix before first regen ship |
| No budget ceiling on change requests | Simpler initial implementation | One enthusiastic customer sends 5 change requests and spends $25 in a day | Never — budget gate is prerequisite |
| CharacterBible mutated in-place on change request | Simpler DB logic | No audit trail; soraHandle drift; historical PipelineRun integrity lost | Never — versioning must be present from day 1 of iteration |
| `sendVideo(groupId, "", undefined)` on render failure | No admin phone handling needed | Customer receives nothing; silent failure goes undetected | Never — fix is known and unblocked |
| All 5 scenes regenerated on any character change | Simpler logic (no partial regen) | $5 cost for a name change instead of $0 (composition re-render only) | Acceptable for MVP iteration; partial regen is Phase 2 |
| `complete` phase CTA ("Reply if you'd like changes") with no intent handler | Fast to ship | Every message after delivery triggers the same static response; no change request is ever actually processed | Never — CTA must have a real handler before it is sent |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| fal.ai Sora 2 `@handle` across sessions | Assuming handle produces consistent character appearance in separate API calls | Treat handles as best-effort consistency aids; always include detailed visual description text in the prompt alongside the handle; do not rely on handle alone for character consistency across regeneration sessions |
| WAHA voice notes in Hebrew | Passing raw audio message body to intent classifier | Voice notes arrive as `hasMedia: true` with `mediaType: 'audio'`; transcription must happen first (existing pipeline) before Claude intent classification; Hebrew transcription must be routed to Hebrew-aware Claude prompt |
| WAHA poll for scene selection | Sending a poll with 5 scene options (NOWEB limit is 12 options) | 5 scenes is within limits; but poll votes must be received via `poll.vote` webhook (NOWEB store required); do not use deprecated button format |
| Remotion re-render for composition-only changes | Re-rendering requires scene video files to be present in `/tmp` | On re-render triggered by iteration, files may have been cleaned up by `fs.rmSync(localDir)` at the end of the original pipeline; must re-download from R2 URLs stored in `PipelineRun.outputJson.sceneUrls` before re-rendering |
| `onboarding_pipeline.admin_phone` | `admin_phone` may be empty string for pipelines created before the column was added | Guard: `if (!adminPhone) { logger.warn(...); return; }` rather than throwing — fall back to a default admin WhatsApp number in config |
| Budget gate query timing | Querying `api_expenses` for costs while a parallel regeneration is still running | Use a DB-level advisory lock or check `PipelineRun` status before allowing a second concurrent regen; never allow two regen jobs for the same tenant to run simultaneously |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Parallel scene regeneration on every change request | 5 concurrent Sora 2 submissions per regen request; each takes 5-15 minutes; customer sends 3 change requests before first regen completes | Enforce one active `character-regen` PipelineRun per tenant at a time; check `PipelineRun WHERE pipelineType = 'character-regen' AND status = 'running' AND tenantId = $1` before accepting a new change request | First time a customer sends multiple WhatsApp messages before receiving a response |
| `/tmp` accumulation from regen jobs | RackNerd disk fills up when regen jobs fail mid-cleanup | Regen job must clean `/tmp/character-video/${tenantId}` on both success AND failure, in a `finally` block | After 3-4 failed regen attempts for different tenants |
| Remotion bundle re-initialization on rapid regen requests | `ensureBundle()` is a singleton — this is fine — but concurrent `renderComposition()` calls for the same composition may compete for Chromium headless instances | BullMQ concurrency for the `character-regen` queue must be set to 1 per worker process (same as video-pipeline.worker); do not increase concurrency to speed up regen | When more than 1 concurrent regen render is triggered |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Any WhatsApp message after delivery triggers a regen | Customer could type a change request from a non-admin group member (e.g., a team member added to the group) | Validate `senderChatId` against the tenant's registered admin phone before processing change requests; only the account owner (or explicitly approved approvers) can trigger paid regeneration |
| Cost estimate displayed in WhatsApp before customer approves | Customer forwards the "this will cost $5" message to competitors | This is a business confidentiality concern, not a security exploit; use approximate language: "regenerating these scenes uses AI credits" rather than exact dollar amounts |
| `FAL_WEBHOOK_VERIFY=false` is documented v1.1 tech debt | Spoofed fal.ai webhook completions could trigger scene completion without actual generation | `FAL_WEBHOOK_VERIFY=false` must be resolved before regen webhooks go live; regen scene completions received via webhook without signature verification could be spoofed to advance pipeline state with no actual generation cost recorded |

---

## "Looks Done But Isn't" Checklist

- [ ] **Change request CTA is live:** The `complete` phase sends "Reply if you'd like any changes" — but the `character-iteration` module has not been registered in `MODULE_REGISTRY`. The customer message goes into the void. Verify: send a test message after delivery; confirm it reaches the `character-iteration` module handler (not the generic fallback).

- [ ] **Budget gate wired:** `REGENERATION_BUDGET_CENTS` constant exists in `config.ts` — but the check is never called before `runGenerationPipeline()` in the iteration handler. Verify: simulate a change request that would exceed the budget ceiling; confirm the pipeline pauses and sends an admin notification instead of submitting to fal.ai.

- [ ] **CharacterBible versioning active:** A change request that modifies `name` creates a new CharacterBible row with `version = 2` and sets the old row to `active = false`. Verify: `SELECT version, active FROM "CharacterBible" WHERE "tenantId" = $1 ORDER BY "createdAt" DESC` shows the old row with `active = false`.

- [ ] **Admin failure notification live:** Remotion render failure sends a WAHA text to `admin_phone`. Verify: intentionally break a render (wrong compositionId) and confirm the admin phone receives a WhatsApp message within 30 seconds of failure.

- [ ] **Cost tracking uses provider name:** After a regeneration, `api_expenses.service` shows `'fal'` not `'kie.ai'`. Verify: `SELECT service FROM api_expenses WHERE operation LIKE '%regen%' ORDER BY created_at DESC LIMIT 5`.

- [ ] **Voice note change requests handled:** A Hebrew voice note change request is transcribed, classified, and handled correctly — not treated as a binary yes/no or dropped. Verify: send a voice note in Hebrew after delivery; confirm the intent classifier receives transcribed text.

- [ ] **Concurrent regen blocked:** A second change request arriving while a regen is in progress receives "I'm already working on your previous change request, please wait." — not a second $5 Sora 2 job. Verify: check `PipelineRun` table shows only one `running` regen per tenant at a time.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Runaway regen cost (budget exceeded before gate in place) | MEDIUM | Pull `api_expenses` for tenant, calculate actual spend; manually set `onboarding_pipeline.status = 'paused'` via `PATCH /api/admin/projects`; contact customer to discuss |
| State corruption (questionnaire reset mid-iteration) | LOW | Restore CharacterBible from the last `active = true` row; manually upsert `onboarding_module_state` to `complete` phase with the correct `collectedData`; resend the reveal video from `PipelineRun.outputJson.revealUrl` |
| Partial regen character inconsistency | HIGH | Full regen of all 5 scenes at original quality tier; update `PipelineRun` to absorb the cost; deliver new video; do not charge customer for the inconsistency (document in `findings.md`) |
| Silent render failure (customer waiting) | LOW | Check `PipelineRun` table for `status = 'composing'` > 30 min; re-download scenes from `outputJson.sceneUrls`; manually trigger `runCompositionPipeline()` via admin script or BullMQ job |
| Wrong cost tracking (kie.ai vs fal.ai) for past runs | LOW | Run a correction query updating `api_expenses.service` for rows where `operation = 'sora-2-pro'` and `metadata->>'provider'` is available; document correction in `findings.md` |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Runaway regeneration cost | Phase 1: change request intake | Simulate budget-exceeding request; confirm admin notification fires and fal.ai job is NOT submitted |
| State corruption via questionnaire re-entry | Phase 1: change request intake | Send change request after delivery; confirm it reaches `character-iteration` handler, not `character-questionnaire` |
| CharacterBible version drift | Phase 1: change request intake (schema/versioning decision) | `SELECT version, active FROM CharacterBible` shows v1 deactivated when v2 is created |
| Partial regen character inconsistency | Phase 2: scene regeneration logic | Regenerate scene 2 only; visually inspect all 5 scenes in output for character consistency |
| Customer confusion about change types | Phase 1: change request intake | Intent classifier routes "composition only" to free re-render; routes "scene visual" to cost estimate + confirmation |
| Admin oversight gap (silent failure) | Phase 0: fix before iteration ships | Force a render failure; confirm admin WhatsApp message arrives within 60s |
| Cost tracking misattribution | Phase 0: fix before iteration ships | Check `api_expenses.service` after first regen; must show `fal` not `kie.ai` |

---

## Sources

- **Direct codebase inspection:** `apps/worker/src/services/onboarding/modules/character-video-gen.ts` (generateAllScenes, cost tracking, phase handlers, complete phase CTA), `character-questionnaire.ts` (confirming phase reset bug), `regen-clips.ts` (partial regen pattern from VideoForge), `pipeline-state.ts` (admin_phone availability), `module-state.ts` (phase storage)
- **Schema inspection:** `apps/web/superseller-site/prisma/schema.prisma` — CharacterBible model (`version Int @default(1)`, `active Boolean @default(true)`, `soraHandle String?`, `testSceneUrls Json?`)
- **Known tech debt:** `character-video-gen.ts` lines 491-498 (silent render failure — group will need manual follow-up), `FAL_WEBHOOK_VERIFY=false` (documented v1.1 tech debt in milestone context)
- **Existing anti-patterns:** `feedback_no_scheduled_kie.md` — never auto-generate without WhatsApp approval; `feedback_wire_before_deliver.md` — trace full post-action flow before any CTA is sent; `agent-behavior.md` — "pre-deploy trace rule" and "3 attempts max" retry discipline
- **WAHA constraints:** `waha_interactive_messages.md` — poll votes require NOWEB store; buttons deprecated; `feedback_check_waha_docs.md` — never guess at WAHA capabilities
- **Business rules:** `CLAUDE.md` cost tracking section — `trackExpense()` after every generation, no exceptions; `feedback_no_scheduled_kie.md` — on-demand only with WhatsApp approval

---

*Pitfalls research for: Character Iteration Milestone — adding iterative character changes + scene regeneration to existing WhatsApp-first onboarding pipeline*
*Researched: 2026-03-15*
