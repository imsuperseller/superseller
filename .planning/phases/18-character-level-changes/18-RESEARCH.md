# Phase 18: Character-Level Changes - Research

**Researched:** 2026-03-15
**Domain:** BullMQ worker extension, WhatsApp poll routing (admin), CharacterBible field classification, multi-scene regen orchestration
**Confidence:** HIGH

## Summary

Phase 18 extends three existing systems: the `change-request-handler.ts` confirmation flow (Phase 16), the `character-regen.worker.ts` single-scene worker (Phase 17), and the CharacterBible versioning pattern (Phase 16). The new behaviour is: after a customer confirms a character-change request, the system classifies which CharacterBible fields changed (visual vs. non-visual), either auto-approves (name-only, $0) or sends admin a WhatsApp review poll, and then — upon admin approval — dispatches a multi-scene regen job that reuses the Phase 17 worker with a new `affectedSceneIndices` extension.

The critical architectural insight is that the admin approval gate is a **new poll routing path in `claudeclaw.worker.ts`**. Today only customer polls are disambiguated there (change-request vs. pipeline-poll). Phase 18 adds a second disambiguation layer: admin polls from the admin chatId (derived from `phoneToChatId(config.admin.defaultPhone)`) that carry a known `pollOption` ("Approve all N scenes" / "Deny" / "Select specific scenes").

All building blocks are verified in the codebase. No new infrastructure is needed.

**Primary recommendation:** Extend `handleChangeRequestPollVote` (character-change confirmed branch) to run the field-classification logic and either auto-complete (name-only) or persist an admin-approval row and send the admin poll. Extend `CharacterRegenJobData` with `affectedSceneIndices?: number[]` and add a multi-scene loop in `processCharacterRegen()`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Field-to-Scene Mapping (CHAR-02)**
- Visual fields that trigger multi-scene regen: `visualStyle`, `soraHandle`, any appearance-related metadata (these are baked into every scene prompt via `buildScenePrompts()`)
- Non-visual fields that trigger NO regen: `name`, `personaDescription`
- Detection: parse `changeDelta` from `createCharacterBibleVersion()` — it already records which fields changed. Classify each changed field as visual or non-visual
- If ANY visual field changed → all 5 scenes affected (because handle + visualStyle appear in every prompt)
- If ONLY non-visual fields changed → 0 scenes affected → name-only shortcut

**Admin Approval Flow (CHAR-03, CHAR-04)**
- After customer confirms character-change via poll AND CharacterBible version is created, send admin a review notification via WhatsApp (NOT a poll — a text message with details)
- Admin review message includes: customer name, change summary (from changeDelta), old→new values for each changed field, affected scene count, total cost estimate in dollars
- Admin responds via WhatsApp poll with 3 options: "Approve all [N] scenes" / "Deny" / "Select specific scenes"
- If "Select specific scenes": send follow-up text asking which scene numbers (1-5), parse response
- If "Approve": dispatch multi-scene regen
- If "Deny": mark change request as `denied`, notify customer "Admin reviewed and declined this change", CharacterBible version stays but is not used
- Admin phone: use `config.admin.defaultPhone` (same as sendAdminAlert pattern)

**Multi-Scene Regen Strategy (CHAR-02, ASSEM-02)**
- Reuse `character-regen` BullMQ queue — extend `CharacterRegenJobData` with optional `affectedSceneIndices: number[]`
- When `affectedSceneIndices` is present: sequential loop over all indices in a single worker job
- When absent: single-scene behavior (Phase 17 backwards compatible)
- Single PipelineRun per character-change (not per scene)
- Each scene: call `generateScene()` with prompt from new CharacterBible version → upload to R2 → update sceneUrls + sceneStatuses
- After all scenes regenerated: one Remotion re-render with all new URLs → one WhatsApp delivery
- Customer receives exactly 2 messages: ack at start ("Regenerating [N] scenes..."), video at completion
- Cost tracking: one `trackExpense()` per scene generation (accurate per-scene attribution)

**Name-Only Change Shortcut (Success Criteria #4)**
- If changeDelta contains ONLY non-visual fields (name, personaDescription): $0 change, skip generation entirely
- No admin approval needed for $0 changes — auto-approve immediately
- Re-deliver existing reveal video from module state `revealUrl` with updated caption: "Meet [new name] — your updated AI character!"
- Update change request status to `completed` with `estimated_cost_cents: 0`
- CharacterBible version is still created (for audit trail) but no scenes regenerated

**Post-Delivery State (ASSEM-02)**
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

### Deferred Ideas (OUT OF SCOPE)
- Admin web portal for change review (Phase 19 scope — ADMIN-02)
- Partial regen recovery (some scenes succeed, others fail) — log and retry manually for now
- Multi-round conversation memory for iterative refinements (ITER-01, v1.4+)
- Customer-facing progress bar during multi-scene regen — out of scope (2 messages only)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAR-02 | Character-level change triggers multi-scene regeneration for affected scenes | `CharacterRegenJobData` extension with `affectedSceneIndices?: number[]`; multi-scene loop in `processCharacterRegen()` |
| CHAR-03 | Admin receives review notification with diff preview and cost estimate before character-level regen executes | New `sendCharacterChangeAdminReview()` function using `sendText` + `sendPoll` on admin chatId (phoneToChatId pattern) |
| CHAR-04 | Admin can approve, modify scope (select which scenes), or deny | New admin-poll routing in `claudeclaw.worker.ts` + new `handleAdminCharacterApprovalPollVote()` handler |
| ASSEM-02 | Re-rendered video delivered to WhatsApp with approve/change options | Post-delivery `sendPoll` with "Happy with your updated character?" — wired into Phase 17's final delivery step |
</phase_requirements>

---

## Standard Stack

### Core (all verified in codebase)

| Component | File | Purpose |
|-----------|------|---------|
| BullMQ Worker | `apps/worker/src/queue/workers/character-regen.worker.ts` | Extend for multi-scene loop |
| Job Interface | `apps/worker/src/queue/queues.ts` — `CharacterRegenJobData` | Add `affectedSceneIndices?: number[]` |
| Change handler | `apps/worker/src/services/onboarding/change-request-handler.ts` | Insert admin gate in character-change confirmed branch |
| CharacterBible | `apps/worker/src/services/onboarding/character-bible-versioning.ts` | `changeDelta` already recorded; `CharacterBibleFields` defines all classifiable fields |
| Admin messaging | `apps/worker/src/services/admin-alerts.ts` + `waha-client.ts` | `sendText` + `sendPoll` on `phoneToChatId(config.admin.defaultPhone)` |
| Poll routing | `apps/worker/src/queue/workers/claudeclaw.worker.ts` (lines 206-237) | Add admin-poll routing layer before customer-poll routing |
| Module state | `apps/worker/src/services/onboarding/module-state.ts` | `upsertModuleState` for revealUrl re-delivery and post-regen state |

### Supporting

| Utility | Purpose | Already used in Phase 17 |
|---------|---------|--------------------------|
| `trackExpense()` | Per-scene cost attribution | Yes — call once per scene in multi-scene loop |
| `createPipelineRun()` / `updatePipelineRun()` | Single PipelineRun across all scenes | Yes — extend with multi-scene output |
| `renderComposition()` | Re-render CharacterReveal-16x9 after all scenes done | Yes — one call after loop |
| `uploadToR2()` | R2 upload for each regen'd scene | Yes |
| `generateScene()` | Calls model-router for Sora 2 Pro generation | Yes |
| `buildScenePrompts()` | Builds prompts from latest CharacterBible | Yes — multi-scene loop fetches bible once, builds all prompts |

### Installation

No new packages required. All dependencies available in `apps/worker`.

---

## Architecture Patterns

### Recommended File Touch Map

```
apps/worker/src/
├── queue/
│   ├── queues.ts                          # Extend CharacterRegenJobData
│   └── workers/
│       ├── character-regen.worker.ts      # Multi-scene loop + post-delivery poll
│       └── claudeclaw.worker.ts           # Admin poll routing (new layer)
└── services/
    └── onboarding/
        ├── change-request-handler.ts      # Admin gate dispatch in confirmed branch
        ├── change-request-intake.ts       # Add admin_approval_poll_id column + status='pending-admin-approval'
        └── character-level-changes.ts     # NEW: field classifier + admin review sender + approval handler
```

### Pattern 1: changeDelta Field Classification (CHAR-02)

**What:** Hardcoded set of visual fields. Any key in `changeDelta` that matches a visual field triggers full regen. Only non-visual keys → name-only shortcut.

**Visual fields:** `visualStyle`, `soraHandle` (the two fields that appear in every `buildScenePrompts()` call via `handle` and `style` variables — verified in `character-video-gen.ts` lines 130-131).

**Non-visual fields:** `name`, `personaDescription` (don't appear in any prompt template — only used for display/caption).

```typescript
// Source: character-video-gen.ts lines 130-131 (verified)
// handle = bible.soraHandle ? `@${bible.soraHandle}` : bible.name  -- soraHandle IS visual
// style = bible.visualStyle || "cinematic"                          -- visualStyle IS visual
// name is only used for characterName prop in CharacterRevealProps (caption, not scene content)

const VISUAL_FIELDS = new Set(["visualStyle", "soraHandle"]);

export function classifyChangeDelta(changeDelta: Record<string, any>): {
    hasVisualChanges: boolean;
    affectedSceneCount: number;  // 5 if visual, 0 if not
    changedFields: string[];
} {
    const changedFields = Object.keys(changeDelta);
    const hasVisualChanges = changedFields.some((f) => VISUAL_FIELDS.has(f));
    return {
        hasVisualChanges,
        affectedSceneCount: hasVisualChanges ? 5 : 0,
        changedFields,
    };
}
```

### Pattern 2: Admin Approval Gate (CHAR-03, CHAR-04)

**What:** After `handleChangeRequestPollVote` creates a CharacterBible version for a character-change, insert an admin-approval gate before dispatching regen. The flow forks:
- name-only → auto-complete
- visual change → send admin review text + approval poll, set status=`pending-admin-approval`

**Where to insert:** In `handleChangeRequestPollVote` (line 291 of `change-request-handler.ts`), after the `versionId` is set and before any dispatch.

**Admin poll routing:** The claudeclaw worker already has a poll-vote block (lines 206-237). Admin messages come from `phoneToChatId(config.admin.defaultPhone)` which is a 1:1 chatId (not a group). The current poll disambiguation checks `getPendingChangeRequest(chatId)` — this won't find anything for the admin chatId. A new check is needed: look for a `pending-admin-approval` change request by the admin poll message ID or by the admin chatId context.

**Recommended approach:** Store the admin poll message ID in `change_requests.admin_approval_poll_id` (new column). In claudeclaw.worker.ts, before the existing customer-poll check, check if the message is from the admin chatId AND isPollVote AND there's a pending-admin-approval request → route to `handleAdminCharacterApprovalPollVote()`.

### Pattern 3: Multi-Scene Loop (CHAR-02, ASSEM-02)

**What:** Extend `processCharacterRegen()` to handle `affectedSceneIndices` array in addition to the existing single `sceneIndex`. The loop runs sequentially to avoid concurrent fal.ai jobs for the same tenant. One PipelineRun covers the whole batch.

**Backwards compatibility:** When `affectedSceneIndices` is absent, fall through to existing single-scene behavior using `sceneIndex`.

```typescript
// Extension to CharacterRegenJobData in queues.ts
export interface CharacterRegenJobData {
    changeRequestId: string;
    sceneIndex: number;           // Used when affectedSceneIndices absent (Phase 17 path)
    tenantId: string;
    groupId: string;
    characterBibleId?: string;
    affectedSceneIndices?: number[];  // NEW: Phase 18 multi-scene path
}
```

**Loop structure in worker:**
1. Ack customer: "Regenerating [N] scenes..."
2. Fetch bible once (getLatestCharacterBible) — use new version (version created during customer confirmation)
3. Build all prompts once (buildScenePrompts)
4. Loop over affectedSceneIndices: generateScene → download → upload to R2 → update sceneUrls[i] → trackExpense
5. After loop: renderComposition with all-new sceneUrls → uploadToR2 reveal → sendVideo with caption
6. Send approve/change poll: "Happy with your updated character? Yes / Request more changes"
7. Update module state (sceneUrls, sceneStatuses all "approved", revealUrl)
8. Mark change request completed

### Pattern 4: Name-Only Shortcut (Success Criteria #4)

**What:** Skip generation entirely. Re-deliver the existing `state.collectedData.revealUrl` with an updated caption.

```typescript
// In change-request-handler.ts character-change confirmed branch, after versionId created:
const classification = classifyChangeDelta(cr.changeDelta ?? {});
if (!classification.hasVisualChanges) {
    // Name-only: $0, auto-approve, re-deliver
    const revealUrl = state.collectedData.revealUrl;
    const newName = latestBible.name;
    await sendVideo(groupId, revealUrl, `Meet ${newName} — your updated AI character!`);
    await updateChangeRequestStatus(changeRequestId, "completed", { estimatedCostCents: 0 });
    return;
}
// else: send admin review
```

Note: `changeDelta` on the `ChangeRequestRow` is NOT stored today. The `changeDelta` is on the `CharacterBible` version row (passed to `createCharacterBibleVersion`). To classify, either: (a) load the new bible version and read its `changeDelta`, or (b) pass the changeDelta forward when creating the version. Option (a) is cleaner — fetch the newly created version by its `versionId`.

### Pattern 5: Post-Delivery Approve/Change Poll (ASSEM-02)

**What:** After multi-scene regen delivery, send a poll to the customer group (not admin). Routes through the existing customer poll disambiguation in claudeclaw.worker.ts. Store poll ID as a new `post_delivery_poll_id` on the change request, or use the existing `poll_message_id` field.

**Poll options:** ["Yes, I love it!", "Request more changes"]
- "Yes, I love it!" → `updateChangeRequestStatus(id, "completed")`, log positive feedback
- "Request more changes" → module stays in `delivered` phase, customer sends next message

### Anti-Patterns to Avoid

- **Dispatching multi-scene via multiple single-scene jobs:** One job per character-change (single `PipelineRun`, single ack, single delivery). The loop is inside the worker.
- **Sending admin a poll from an admin-only number without routing support:** Must wire claudeclaw.worker.ts to recognize admin chatId poll votes before building the feature.
- **Calling createCharacterBibleVersion with empty `updatedFields: {}`:** This is what Phase 16 does (as a stub — it records `requestedChange` in changeDelta but doesn't actually update any fields). Phase 18 must pass the real field changes (extracted from the customer's message classification output) so the new bible version has the correct values and the prompts are actually different. This is a **critical gap** — see Open Questions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Admin phone resolution | Custom env lookup | `config.admin.defaultPhone` (already falls back to `HEALTH_MONITOR_ALERT_PHONE`) |
| Admin chatId format | Manual string concat | `phoneToChatId(phone)` from waha-client.ts |
| Scene prompt building | Re-implement prompt logic | `buildScenePrompts(bible)` from character-video-gen.ts |
| Cost per scene | Hardcode constant | `SORA_COST_PER_SCENE_CENTS` from change-request-intake.ts |
| R2 upload | Custom S3 client | `uploadToR2()` from r2.ts |
| Remotion render | Direct FFmpeg | `renderComposition()` from remotion-renderer.ts |
| Non-blocking admin notification | Try/catch around sendText | `sendAdminAlert()` from admin-alerts.ts |

---

## Common Pitfalls

### Pitfall 1: changeDelta is Empty in Phase 16 Stub
**What goes wrong:** Phase 16's `handleChangeRequestPollVote` calls `createCharacterBibleVersion(tenantId, {}, { requestedChange: { from: "current", to: cr.change_summary } })`. The `updatedFields` is `{}` — so the new CharacterBible row is **identical** to the old one. Running `buildScenePrompts()` on the new version produces the same prompts. Regen would generate identical scenes.

**Why it happens:** Phase 16 only needed to prove the versioning mechanism works. Actual field extraction from the customer message was deferred to Phase 18.

**How to avoid:** Phase 18 must extract changed field values from the `intent-classifier` output (or a new extraction step) and pass them as `updatedFields` to `createCharacterBibleVersion`. The classifier's `changeSummary` field has the natural language description but not structured field values. A new extraction pass (regex or Claude call) is needed to convert "make her more casual" → `{ visualStyle: "casual, relaxed..." }`.

**Warning signs:** Prompts for scene 0 and scene 4 still contain the old `@handle` and old `style` value after regen.

### Pitfall 2: Admin Poll Routing Collision
**What goes wrong:** The admin sends a poll vote from their 1:1 chatId. The claudeclaw worker currently routes ALL poll votes through `getPendingChangeRequest(chatId)` first. Since there's no change_request row for the admin's personal chatId, it falls through to `handlePipelineEvent` — which has no pipeline for that chatId and silently ignores it.

**Why it happens:** Admin messages come from a 1:1 chat, not a group. The routing logic was designed for group chatIds.

**How to avoid:** In claudeclaw.worker.ts, add a pre-check: if `senderChatId` (or the chatId itself for 1:1) matches `phoneToChatId(config.admin.defaultPhone)` AND isPollVote → route to the admin approval handler before customer poll disambiguation.

### Pitfall 3: Race Between Customer Confirmation and Admin Approval
**What goes wrong:** Customer confirms character-change → admin approval poll sent → customer sends another change request immediately → second change request enters `awaiting-confirmation` → second customer poll vote gets routed as first request.

**Why it happens:** `getPendingChangeRequest` returns `awaiting-confirmation` rows. The first character-change is now in `pending-admin-approval`, not `awaiting-confirmation`, so it's not blocked.

**How to avoid:** Extend `getInProgressChangeRequest` (or add a new query) to also block on `pending-admin-approval` status. Any new change request while one is in `pending-admin-approval` should get: "We're waiting for admin review of your previous request. Please wait."

### Pitfall 4: sceneUrls/sceneStatuses Array Length Mismatch After Multi-Scene Loop
**What goes wrong:** Multi-scene loop updates `sceneUrls[i]` for each index. If a scene fails mid-loop and status is reverted, but the `sceneUrls` array was partially updated in memory, the state saved to DB has mixed old/new URLs out of sync with sceneStatuses.

**Why it happens:** State is held in memory during the loop and saved once at the end. Mid-loop failure leaves partial state.

**How to avoid:** Use the in-memory copies of `sceneUrls` and `sceneStatuses` consistently. On any scene failure in the loop: log the failure, alert admin, mark the specific scene status back to "approved" (keep old URL), continue loop if possible OR fail the whole job depending on error type. Since partial regen recovery is deferred (CONTEXT.md deferred), simplest approach: fail the entire job on any scene error, revert all `sceneStatuses` for affected scenes to "approved".

### Pitfall 5: CharacterBibleVersion `changeDelta` Format
**What goes wrong:** Phase 18 code reads `versionRow.changeDelta` to classify fields. But the changeDelta shape stored in Phase 16 was `{ requestedChange: { from: "current", to: "..." } }` — not a field-name-keyed object like `{ visualStyle: { from: "...", to: "..." } }`.

**Why it happens:** Phase 16 used a free-form changeDelta structure. Phase 18 needs a structured format.

**How to avoid:** Phase 18 defines the structured changeDelta format and passes it when calling `createCharacterBibleVersion`. The field classifier reads THIS structured format, not the Phase 16 freeform one. Add a guard: if `changeDelta` doesn't have field-name keys, fall back to treating it as a visual change (safe default: regen all scenes).

---

## Code Examples

### Admin Review Message + Poll

```typescript
// Source: admin-alerts.ts pattern + waha-client.ts sendPoll (verified)
// In change-request-handler.ts or new character-level-changes.ts

async function sendAdminCharacterChangeReview(params: {
    groupId: string;          // Customer's group (for context)
    tenantId: string;
    changeRequestId: string;
    changeDelta: Record<string, { from: string; to: string }>;
    customerName: string;
    affectedSceneCount: number;
    costDollars: string;
}): Promise<string | null> {
    const { changeDelta, customerName, affectedSceneCount, costDollars, changeRequestId } = params;
    const adminPhone = config.admin.defaultPhone;
    const adminChatId = phoneToChatId(adminPhone);

    // Step 1: Text with diff details
    const deltaLines = Object.entries(changeDelta)
        .map(([field, { from, to }]) => `• ${field}: "${from}" → "${to}"`)
        .join("\n");

    const reviewText = [
        "--- Character Change Request ---",
        "",
        `Customer: ${customerName}`,
        `Change request ID: ${changeRequestId}`,
        "",
        "Changed fields:",
        deltaLines,
        "",
        `Affected scenes: ${affectedSceneCount}`,
        `Estimated cost: $${costDollars}`,
        "",
        "Please review and respond with your decision:",
    ].join("\n");

    await sendText(adminChatId, reviewText);

    // Step 2: Poll with 3 options
    const pollId = await sendPoll(
        adminChatId,
        `Approve character change for ${customerName}?`,
        [`Approve all ${affectedSceneCount} scenes`, "Deny", "Select specific scenes"],
    );

    return pollId;
}
```

### Admin Poll Vote Routing in claudeclaw.worker.ts

```typescript
// Source: claudeclaw.worker.ts lines 206-237 pattern (extend before existing customer poll check)
// Add this block BEFORE the existing "Onboarding Pipeline: Poll Vote Detection" block

try {
    const adminPhone = config.admin?.defaultPhone;
    const adminChatId = adminPhone ? phoneToChatId(adminPhone) : null;

    // Route admin approval poll votes (1:1 chatId from admin's phone)
    if (adminChatId && chatId === adminChatId && job.data.isPollVote && job.data.pollOption) {
        const { handleAdminCharacterApprovalPollVote } = await import(
            "../../services/onboarding/character-level-changes"
        );
        const handled = await handleAdminCharacterApprovalPollVote({
            pollOption: job.data.pollOption,
            adminChatId,
        });
        if (handled) {
            return { handled: "admin-character-approval-poll-vote", isGroup: false };
        }
    }
} catch (err: any) {
    logger.warn({ msg: "Admin character approval poll routing error (non-critical)", error: err.message });
}
```

### Multi-Scene Loop in character-regen.worker.ts

```typescript
// Source: character-regen.worker.ts processCharacterRegen pattern (extend existing)
// When job.data.affectedSceneIndices is present, use multi-scene loop

const affectedIndices: number[] = data.affectedSceneIndices ?? [data.sceneIndex];
const isMultiScene = (data.affectedSceneIndices?.length ?? 0) > 1;

// Ack (2-message rule — same for single and multi)
const ackMsg = isMultiScene
    ? `Regenerating ${affectedIndices.length} scenes with your character updates... You'll receive the updated video shortly.`
    : `Regenerating scene ${data.sceneIndex + 1}... You'll receive the updated video shortly.`;
await sendText(groupId, ackMsg);

// Fetch bible once — uses getLatestCharacterBible which returns the newest version
const bible = await getLatestCharacterBible(tenantId);
const scenePrompts = buildScenePrompts(bible as any);

// Sequential loop
for (const idx of affectedIndices) {
    // generateScene → download → R2 upload → trackExpense per scene
    // On failure: mark status reverted for this idx, sendAdminAlert, fail the job
}

// After loop: one renderComposition → one sendVideo → one approve/change poll
```

---

## State of the Art

| Phase 16 Pattern | Phase 18 Extension | Impact |
|------------------|-------------------|--------|
| `createCharacterBibleVersion(tenantId, {}, freeform_delta)` | `createCharacterBibleVersion(tenantId, extractedFields, structured_delta)` | New bible version has correct field values, prompts are actually different |
| `handleChangeRequestPollVote` — character-change: create version, send "confirmed" ack | Add: classify delta, name-only vs visual branch, admin gate or auto-complete | Stops short of dispatching regen without admin review |
| `CharacterRegenJobData.sceneIndex: number` | Add `affectedSceneIndices?: number[]` | Single-scene (Phase 17) path unchanged; multi-scene (Phase 18) uses array |
| claudeclaw.worker.ts: customer poll disambiguation only | Add admin chatId poll routing before customer check | Admin approval votes reach the correct handler |
| `updateChangeRequestStatus` statuses: received, awaiting-confirmation, confirmed, in-progress, completed, rejected, failed | Add: `pending-admin-approval`, `admin-approved`, `admin-denied` | Full audit trail for admin review lifecycle |

---

## Open Questions

1. **Field extraction from customer natural language**
   - What we know: `classifyChangeRequest()` returns `intent: "character-change"` and a free-form `changeSummary` (e.g. "make her more casual"). It does NOT return structured field values.
   - What's unclear: How does Phase 18 convert "make her more casual" → `{ visualStyle: "casual, relaxed style..." }`? Options: (a) another Claude call to extract structured fields, (b) pass the full changeSummary as `visualStyle` override (blunt but functional), (c) ask the customer for specific field values via follow-up question.
   - Recommendation: Option (b) for v1.3 simplicity — set `visualStyle: changeSummary` in `updatedFields` when the intent is character-change. The new bible version will have a descriptive visualStyle. Prompts will incorporate it. Mark as Claude's discretion.

2. **"Select specific scenes" admin response parsing**
   - What we know: The admin will send a follow-up text message (not poll) with scene numbers after selecting this option.
   - What's unclear: Text message routing in claudeclaw.worker.ts does not currently have a "waiting for admin text input" state. Admin messages normally skip module routing entirely.
   - Recommendation: Use regex `/(scene[s]?\s+)?(\d[\d,\s]+)/i` to parse scene numbers from the next admin text message. Store a `pending_scene_selection: true` flag on the change request row. In claudeclaw.worker.ts admin-message path, check for this flag and parse. Claude's discretion on exact implementation.

3. **Admin approval poll disambiguation when multiple change requests are pending**
   - What we know: There can only be one `pending-admin-approval` character-change at a time per design (concurrency guard blocks new requests while one is in-progress/pending-admin-approval).
   - What's unclear: `handleAdminCharacterApprovalPollVote` needs to find the right change request row to approve. It can query `WHERE status = 'pending-admin-approval' ORDER BY created_at DESC LIMIT 1` — simple and safe given the concurrency constraint.
   - Recommendation: Query by status. Confirmed safe given existing concurrency guards.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (config: `apps/worker/vitest.config.ts`) |
| Config file | `apps/worker/vitest.config.ts` |
| Quick run command | `cd apps/worker && npm test -- --reporter=verbose src/services/onboarding/character-level-changes.test.ts` |
| Full suite command | `cd apps/worker && npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAR-02 | `classifyChangeDelta` returns visual=true for visualStyle/soraHandle changes | unit | `cd apps/worker && npm test -- src/services/onboarding/character-level-changes.test.ts` | Wave 0 |
| CHAR-02 | `classifyChangeDelta` returns visual=false for name/personaDescription only changes | unit | same | Wave 0 |
| CHAR-03 | Admin review message sent after character-change confirmation with visual fields | unit (mocked sendText/sendPoll) | same | Wave 0 |
| CHAR-04 | "Approve all N scenes" poll vote dispatches regen job | unit (mocked characterRegenQueue) | same | Wave 0 |
| CHAR-04 | "Deny" poll vote marks change request as admin-denied and notifies customer | unit | same | Wave 0 |
| ASSEM-02 | Post-delivery approve/change poll sent after video delivery | unit (mocked sendPoll) | `cd apps/worker && npm test -- src/queue/workers/character-regen.test.ts` | Wave 0 |
| CHAR-02 | Name-only change auto-completes with $0 cost and re-delivers existing revealUrl | unit | `cd apps/worker && npm test -- src/services/onboarding/character-level-changes.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `cd apps/worker && npm test -- src/services/onboarding/character-level-changes.test.ts`
- **Per wave merge:** `cd apps/worker && npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/worker/src/services/onboarding/character-level-changes.test.ts` — covers CHAR-02 (classifyChangeDelta), CHAR-03 (admin review send), CHAR-04 (admin poll vote handling), name-only shortcut
- [ ] `apps/worker/src/queue/workers/character-regen.test.ts` — covers ASSEM-02 (post-delivery poll), multi-scene loop happy path

---

## Sources

### Primary (HIGH confidence)
- Codebase: `apps/worker/src/queue/workers/character-regen.worker.ts` — full Phase 17 worker implementation, verified multi-scene extension points
- Codebase: `apps/worker/src/queue/queues.ts` — `CharacterRegenJobData` interface, exact shape to extend
- Codebase: `apps/worker/src/services/onboarding/change-request-handler.ts` — `handleChangeRequestPollVote` line 255-290, exact insertion point for admin gate
- Codebase: `apps/worker/src/services/onboarding/character-bible-versioning.ts` — `CharacterBibleFields` interface, `changeDelta` storage pattern
- Codebase: `apps/worker/src/services/onboarding/modules/character-video-gen.ts` lines 129-163 — `buildScenePrompts()` showing which fields are visual
- Codebase: `apps/worker/src/queue/workers/claudeclaw.worker.ts` lines 206-237 — poll routing pattern to extend for admin
- Codebase: `apps/worker/src/services/waha-client.ts` — `sendPoll`, `sendVideo`, `phoneToChatId` signatures
- Codebase: `apps/worker/src/services/admin-alerts.ts` — `sendAdminAlert` non-blocking pattern
- Codebase: `apps/worker/src/config.ts` line 152 — `config.admin.defaultPhone` resolution

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions — locked implementation choices from /gsd:discuss-phase
- STATE.md accumulated decisions — Phase 15-17 patterns and architecture choices

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries and files verified in codebase, no new dependencies
- Architecture patterns: HIGH — all patterns derived from existing verified code in Phase 15-17
- Pitfalls: HIGH — all derived from direct code inspection (empty changeDelta, routing gaps, state array coherence)
- Open questions: MEDIUM — field extraction strategy involves Claude's discretion per CONTEXT.md

**Research date:** 2026-03-15
**Valid until:** 2026-04-14 (stable codebase, 30-day window)
