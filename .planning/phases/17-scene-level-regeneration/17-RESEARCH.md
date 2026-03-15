# Phase 17: Scene-Level Regeneration - Research

**Researched:** 2026-03-15
**Domain:** BullMQ worker orchestration, Sora 2 scene generation, Remotion mixed-scene assembly, WhatsApp delivery via WAHA
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scene Status Tracking (REGEN-02)**
- Per-scene status stored as `sceneStatuses: string[]` in `onboarding_module_state.collectedData` JSONB — no new table needed, aligns with existing pattern where collectedData already stores sceneUrls
- Valid statuses: `approved`, `pending`, `rejected`
- All 5 scenes default to `approved` after initial delivery (Phase 4/character-video-gen completion)
- When regen is dispatched: target scene set to `pending`; on success → `approved`; on failure → scene reverts to previous `approved` URL
- Scene status array is parallel to sceneUrls array (same indices)

**Regen Dispatch & Execution (REGEN-01)**
- After change request poll vote = "Yes" and status = `confirmed`, change-request-handler enqueues a job on `character-regen` BullMQ queue (per PROJECT.md decision — same Redis, no new infrastructure)
- Job data: `{ changeRequestId, sceneIndex, tenantId, groupId, characterBibleId }`
- Dedicated `character-regen.worker.ts` processes the queue — not inline in claudeclaw worker
- Reuse existing `generateScene()` logic from character-video-gen: same CharacterBible + same scene prompt from `bible.metadata.scenario_prompts[sceneIndex]` + same Sora 2 model routing
- Follow character-video-gen Sora 2 pattern (not regen-clips.ts which is VideoForge/Kling — different product)
- On generation success: upload to R2 with same key pattern `character-videos/{tenantId}/scene-{i}.mp4` (overwrites old scene file)
- On generation failure: send admin alert via sendAdminAlert(), send customer apology, mark change request as `failed`
- Cost tracked via trackExpense() with correct provider attribution (Phase 15 pattern)

**Mixed-Scene Assembly (ASSEM-01)**
- Clone existing `sceneUrls` array from module state collectedData
- Replace only the regen'd scene index with the new R2 URL
- Pass full 5-element array to Remotion CharacterRevealComposition — composition already accepts `sceneClips: string[]`, no changes needed to composition code
- Scene labels stay unchanged — scene content changed, not scene type/name
- New reveal video uploaded to R2 as `character-videos/{tenantId}/reveal-{timestamp}.mp4` (new timestamp, old reveal preserved)
- Update module state collectedData with new sceneUrls array and new revealUrl

**WhatsApp Delivery Flow (REGEN-03)**
- Exactly two messages per REGEN-03:
  1. Acknowledgment at request start: "Regenerating scene [N]... You'll receive the updated video shortly."
  2. Updated reveal video sent via sendVideo() at completion
- Ack sent immediately when regen job starts processing (not when enqueued)
- After delivery, module returns to `delivered` state (not `complete`) — customer can request more changes, enabling iteration loop
- Change request status updated: `confirmed` → `in-progress` → `completed` (or `failed`)
- PipelineRun created for the regen job with `pipelineType: 'character-regen'`, cost, duration

**Concurrency Guard**
- Only one active regen per tenant at a time — check for existing `in-progress` change requests before dispatching
- If concurrent request arrives: respond with "A scene is currently being regenerated. Please wait for it to complete."
- Per STATE.md blocker: budget gate + dispatch must guard against simultaneous change requests

### Claude's Discretion
- Exact retry strategy for failed scene generation (reuse character-video-gen retry count or adjust)
- Whether to extract generateScene as a shared utility or import from character-video-gen
- character-regen worker concurrency setting (likely 1-2 per tenant)
- Exact status field values and transitions on change_requests table
- R2 key pattern for regen scenes (overwrite vs versioned key)

### Deferred Ideas (OUT OF SCOPE)
- FAL_WEBHOOK_VERIFY=false resolution (STATE.md blocker — needs addressing before production regen webhooks, but may be out of Phase 17 scope if using polling)
- fal.ai @handle cross-session consistency verification (STATE.md risk — document adjacency regen policy)
- Multiple concurrent scene regens (regen scenes 2 and 4 simultaneously) — keep single-scene for v1, batch in future
- Customer-facing progress bar during regen — out of scope per REQUIREMENTS.md (rate limit risk + no meaningful AI progress signal)
- Scene comparison (before/after) in WhatsApp — nice to have, not essential for v1
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REGEN-01 | System regenerates a single specified scene without touching other approved scenes | character-video-gen.generateScene() is directly reusable; BullMQ character-regen queue pattern confirmed; sceneUrls array clone-and-replace pattern verified in character-video-gen runGenerationPipeline |
| REGEN-02 | Per-scene status tracking (approved/pending/rejected) on scene records | onboarding_module_state.collectedData JSONB stores sceneUrls already; adding parallel sceneStatuses array is a trivial collectedData extension; upsertModuleState handles the write atomically |
| REGEN-03 | Customer receives acknowledgment at request start and new video at completion (two messages only) | sendText() for ack and sendVideo() for delivery already in waha-client.ts; character-video-gen delivery pattern confirmed identical |
| ASSEM-01 | CharacterReveal Remotion composition accepts per-scene URL props (mixed old + new scenes) | CharacterRevealProps.sceneClips: string[] confirmed in types file; composition already renders from URL array; runCompositionPipeline() can be called directly with modified sceneUrls — zero composition code changes needed |
</phase_requirements>

---

## Summary

Phase 17 wires the confirmed change request (status=`confirmed` in change_requests table, set in Phase 16 by `handleChangeRequestPollVote`) into an actual scene generation + re-composition pipeline. The integration point is already marked in change-request-handler.ts line 301: "NOTE: Do NOT dispatch to any BullMQ queue here — Phase 17 will add character-regen queue dispatch."

The implementation is highly mechanical: three new artifacts (a BullMQ queue definition, a worker file, a dispatch call in handleChangeRequestPollVote) plus two small state-machine additions (initialize sceneStatuses in character-video-gen delivery, update sceneStatuses during regen). All generation logic, Remotion rendering, R2 upload, cost tracking, and WhatsApp delivery patterns are fully established in the existing codebase and can be reused verbatim.

The most significant design decision is the concurrency guard: checking for existing `in-progress` change requests before dispatching. This is a DB query against the change_requests table and must happen in handleChangeRequestPollVote before the BullMQ enqueue, not inside the worker. The worker itself should also validate (defence-in-depth) but the authoritative gate is at dispatch time.

**Primary recommendation:** Add `characterRegenQueue` to queues.ts, create `character-regen.worker.ts` following the onboarding.worker.ts pattern, add dispatch call in handleChangeRequestPollVote confirmed branch, initialize sceneStatuses in character-video-gen delivered transition, and add a `getInProgressChangeRequest()` query to change-request-intake.ts for the concurrency guard.

---

## Standard Stack

### Core (all pre-existing — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| BullMQ | existing | `character-regen` queue + worker lifecycle | All async jobs in this stack use BullMQ; same Redis connection; no new infra |
| ioredis | existing | Redis connection shared across all queues | `redisConnection` from `queue/connection.ts` — import directly |
| fal.ai Sora 2 | existing | Scene video generation | Established via routeShot() + adapter pattern in model-router; generateScene() already handles polling |
| Remotion 4.0 | existing | Re-render CharacterReveal with mixed scenes | renderComposition() wrapper in `services/remotion-renderer.ts`; CharacterRevealComposition unchanged |
| WAHA | existing | sendText (ack) + sendVideo (delivery) | waha-client.ts exports both; same pattern as character-video-gen delivery |
| Cloudflare R2 | existing | Store regen'd scene + new reveal video | uploadToR2() from services/r2.ts; same key pattern `character-videos/{tenantId}/scene-{i}.mp4` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| trackExpense + normalizeProvider | existing | Cost attribution for Sora 2 regen | Call after each successful scene generation; same pattern as character-video-gen lines 340-346 |
| createPipelineRun + updatePipelineRun | existing | Audit trail for regen job | pipelineType: `'character-regen'`; same pipeline-run.ts functions |
| sendAdminAlert | existing | Non-blocking failure alert | On terminal regen failure; same non-throwing pattern as Phase 15 |
| sendCustomerFailureMessage | existing | Customer apology on failure | On terminal regen failure; already in admin-alerts.ts |

**Installation:** None — zero new npm packages required.

---

## Architecture Patterns

### Recommended File Structure (new files only)

```
apps/worker/src/
├── queue/
│   ├── queues.ts                             # MODIFY: add characterRegenQueue + CharacterRegenJobData
│   └── workers/
│       └── character-regen.worker.ts         # NEW: processes character-regen queue
├── services/onboarding/
│   ├── change-request-handler.ts             # MODIFY: add dispatch in handleChangeRequestPollVote confirmed branch
│   ├── change-request-intake.ts              # MODIFY: add getInProgressChangeRequest() for concurrency guard
│   └── modules/
│       └── character-video-gen.ts            # MODIFY: initialize sceneStatuses on delivery transition
└── index.ts                                  # MODIFY: import + register character-regen worker
```

### Pattern 1: BullMQ Queue + Worker Registration

Follow the exact pattern of every other worker in the codebase.

**queues.ts addition:**
```typescript
// Source: apps/worker/src/queue/queues.ts (existing pattern)
export const characterRegenQueue = new Queue("character-regen", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 30000 },
        removeOnComplete: { age: 86400 * 7 },
        removeOnFail: { age: 86400 * 30 },
    },
});

export interface CharacterRegenJobData {
    changeRequestId: string;
    sceneIndex: number;        // 0-based
    tenantId: string;
    groupId: string;
    characterBibleId?: string;
}
```

**index.ts registration (follow existing pattern lines 80-82):**
```typescript
import { characterRegenWorker, initCharacterRegenWorker } from "./queue/workers/character-regen.worker";
// ...
await initCharacterRegenWorker();
// In SIGTERM handler:
await characterRegenWorker.close();
```

### Pattern 2: Worker File Structure

Follow onboarding.worker.ts and the claudeclaw.worker.ts patterns. The worker is a thin BullMQ wrapper around a processing function.

```typescript
// Source: apps/worker/src/queue/workers/character-regen.worker.ts (new file)
export const characterRegenWorker = new Worker<CharacterRegenJobData>(
    "character-regen",
    async (job: Job<CharacterRegenJobData>) => {
        return processCharacterRegen(job.data);
    },
    {
        connection: redisConnection,
        concurrency: 2,  // Low: Sora jobs are long-running + expensive
    },
);

export async function initCharacterRegenWorker(): Promise<void> {
    logger.info({ msg: "character-regen worker initialized" });
}
```

### Pattern 3: Dispatch from handleChangeRequestPollVote

The dispatch point is in `change-request-handler.ts` at the confirmed branch (currently line 301, marked "Phase 17 will add character-regen queue dispatch").

```typescript
// Source: apps/worker/src/services/onboarding/change-request-handler.ts confirmed branch
if (isYes) {
    await updateChangeRequestStatus(changeRequestId, "confirmed");

    // Concurrency guard — check before dispatching
    const inProgress = await getInProgressChangeRequest(groupId);
    if (inProgress) {
        await sendText(groupId, "A scene is currently being regenerated. Please wait for it to complete.");
        return;
    }

    if (cr.intent === "scene-change") {
        // Phase 17: dispatch regen job
        const { characterRegenQueue } = await import("../../queue/queues");
        await characterRegenQueue.add("regen-scene", {
            changeRequestId,
            sceneIndex: (cr.scene_number ?? 1) - 1,  // scene_number is 1-based; sceneIndex is 0-based
            tenantId,
            groupId,
        });
        // Confirmation message is sent by the worker on job start (ack), not here
    }
    // ...
}
```

**Critical detail:** `scene_number` in change_requests is 1-based (customer says "scene 3") but `sceneIndex` in sceneUrls array is 0-based. Subtract 1 at dispatch. This conversion must be explicit and documented in the code.

### Pattern 4: generateScene Reuse Strategy

`generateScene()` is defined in character-video-gen.ts but is not exported. Two options:

1. **Export it** — add `export` keyword to the function signature, import in character-regen.worker.ts. Cleanest.
2. **Inline a copy** — duplicate the ~80-line function. Creates drift risk.

**Recommendation:** Export `generateScene` and `buildScenePrompts` from character-video-gen.ts. The worker imports them directly. This is the correct refactor — they are utilities, not module internals.

```typescript
// Source: character-video-gen.ts (add export)
export async function generateScene(params: {
    tenantId: string;
    sceneIndex: number;
    prompt: string;
    shotType: "narrative" | "dialogue";
}): Promise<{ resultUrl: string; provider: string }>

export function buildScenePrompts(bible: CharacterBibleRow): { prompt: string; shotType: "narrative" | "dialogue" }[]
```

### Pattern 5: Scene Status Initialization

At the end of character-video-gen.ts `runCompositionPipeline()`, after setting phase to `delivered` (line 643), add sceneStatuses initialization:

```typescript
// Source: character-video-gen.ts runCompositionPipeline() delivery transition
const completionData = {
    ...data,
    revealUrl: revealUrl!,
    deliveredAt: new Date().toISOString(),
    deliveredVia: wahaDelivered ? "whatsapp" : "failed",
    sceneStatuses: (data.sceneUrls ?? []).map(() => "approved"),  // All scenes approved after initial delivery
};
await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", completionData);
```

### Pattern 6: Mixed-Scene Re-Assembly in Worker

The core assembly logic in the worker:

```typescript
// Source: character-regen.worker.ts processCharacterRegen()
// 1. Load current module state
const state = await getModuleState(groupId, "character-video-gen");
const sceneUrls: string[] = [...(state.collectedData.sceneUrls ?? [])];
const sceneStatuses: string[] = [...(state.collectedData.sceneStatuses ?? sceneUrls.map(() => "approved"))];

// 2. Mark target scene pending
sceneStatuses[sceneIndex] = "pending";
await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
    ...state.collectedData,
    sceneStatuses,
});

// 3. Send acknowledgment (first of two messages — REGEN-03)
await sendText(groupId, `Regenerating scene ${sceneIndex + 1}... You'll receive the updated video shortly.`);

// 4. Generate scene (reuse generateScene from character-video-gen)
const { resultUrl, provider } = await generateScene({ tenantId, sceneIndex, prompt, shotType });

// 5. Download + upload to R2 (same key = overwrites)
const r2Key = `character-videos/${tenantId}/scene-${sceneIndex}.mp4`;
const newSceneUrl = await uploadToR2(localPath, r2Key, "video/mp4", { ... });

// 6. Update sceneUrls + sceneStatuses
sceneUrls[sceneIndex] = newSceneUrl;
sceneStatuses[sceneIndex] = "approved";

// 7. Re-render reveal via runCompositionPipeline pattern (inline the composition logic)
// Pass complete 5-element sceneUrls to Remotion — only one URL changed
// Upload reveal to R2 as character-videos/{tenantId}/reveal-{timestamp}.mp4

// 8. Deliver (second of two messages — REGEN-03)
await sendVideo(groupId, newRevealUrl, caption);

// 9. Update module state with new sceneUrls + revealUrl + sceneStatuses
await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
    ...state.collectedData,
    sceneUrls,
    sceneStatuses,
    revealUrl: newRevealUrl,
});
```

### Anti-Patterns to Avoid

- **Sending a third WhatsApp message:** REGEN-03 is strict — exactly two messages. Do not send "change request confirmed" AND "regenerating scene..." AND video. The current `handleChangeRequestPollVote` sends "Change request confirmed! We'll start working on it shortly." — this must be REMOVED or replaced by the worker's ack message.
- **Using scene_number directly as array index:** scene_number is 1-based (UI-facing). Always subtract 1 for array access.
- **Dispatching from inside the worker:** The concurrency guard must run at dispatch time in handleChangeRequestPollVote, not only inside the worker. The worker can also guard but the UX response ("please wait") only works at dispatch time.
- **Re-running full runGenerationPipeline:** That regenerates all 5 scenes. The regen worker only generates scene at sceneIndex, then splices it into the existing array.
- **Composition code changes:** CharacterRevealComposition.tsx accepts `sceneClips: string[]` already. No changes to Remotion composition files are needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video generation polling | Custom poll loop | `generateScene()` from character-video-gen.ts (after export) | Already handles 10-min timeout, 15s intervals, error classification, provider normalization |
| R2 upload | Direct S3 calls | `uploadToR2()` from services/r2.ts | Handles metadata, content-type, returns public URL |
| Remotion render | Direct Remotion CLI | `renderComposition()` from services/remotion-renderer.ts | Handles concurrency, crf, progress callback, retry |
| Cost tracking | Ad-hoc logging | `trackExpense()` + `normalizeProvider()` from expense-tracker.ts | Mandatory per CLAUDE.md; correctly routes to api_expenses |
| Admin failure alert | Direct sendText | `sendAdminAlert()` from admin-alerts.ts | Non-blocking, falls back to config.admin.defaultPhone, standard format |
| Module state persistence | Direct DB queries | `upsertModuleState()` / `getModuleState()` from module-state.ts | Handles ON CONFLICT, proper JSONB storage |
| PipelineRun tracking | Custom table | `createPipelineRun()` / `updatePipelineRun()` from pipeline-run.ts | Standard audit trail used by all generation jobs |

---

## Common Pitfalls

### Pitfall 1: Three WhatsApp Messages Instead of Two

**What goes wrong:** REGEN-03 requires exactly two messages (ack + video). The existing `handleChangeRequestPollVote` already sends "Change request confirmed! We'll start working on it shortly." (line 302-305). If the worker also sends an ack, the customer receives three messages.

**Why it happens:** The confirmation text was added in Phase 16 as a placeholder per the code comment "Phase 17 will add character-regen queue dispatch." The Phase 16 message is now superseded.

**How to avoid:** When adding the dispatch to handleChangeRequestPollVote, REMOVE the "Change request confirmed! We'll start working on it shortly." sendText call from the scene-change confirmed branch. The worker sends the ack. For character-change (Phase 18), this message may remain if Phase 18 has a different flow.

**Warning signs:** Test log shows three waha-client sendText/sendVideo calls for a single regen cycle.

### Pitfall 2: scene_number vs sceneIndex Off-by-One

**What goes wrong:** `change_requests.scene_number` is 1-based (customer language: "scene 3"). `sceneUrls[i]` is 0-based. If not converted, the wrong scene is regenerated.

**Why it happens:** The classification system extracts "scene 3" → stores 3 in scene_number. Array index for scene 3 is 2.

**How to avoid:** Single conversion point at dispatch in handleChangeRequestPollVote: `sceneIndex: (cr.scene_number ?? 1) - 1`. The CharacterRegenJobData type should document that sceneIndex is 0-based.

**Warning signs:** Customer reports "I asked to change scene 3 but scene 4 changed."

### Pitfall 3: Concurrency Race Condition

**What goes wrong:** Customer sends two change requests rapidly. Both pass the confirmed check before either is marked `in-progress`. Two regen jobs enqueue. Both overwrite R2 scene-{i}.mp4. Final state is unpredictable.

**Why it happens:** Check-then-set is not atomic. Between `getInProgressChangeRequest()` returning null and `characterRegenQueue.add()`, a second request could be confirmed.

**How to avoid:** The concurrency guard uses status=`in-progress` in change_requests. Immediately after checking, the worker sets status to `in-progress` before doing any generation. Also check at dispatch time (belt-and-suspenders). For v1 single-scene regen, this is adequate — the window is small and consequences are a wasted Sora call, not data corruption.

**Warning signs:** Two concurrent PipelineRun rows with pipelineType=`character-regen` for the same tenantId.

### Pitfall 4: runCompositionPipeline Expects /tmp Files

**What goes wrong:** `runCompositionPipeline` in character-video-gen.ts tries to read scene files from `/tmp/character-video/{tenantId}/scene-{i}.mp4`. For a regen, only scene-{sceneIndex}.mp4 was just downloaded. The other 4 scenes are NOT in /tmp (they were cleaned up after initial delivery).

**Why it happens:** The composition pipeline was designed for the initial generation flow where all 5 scenes are freshly downloaded. The cleanup at line 654 removes the entire `/tmp` directory after delivery.

**How to avoid:** The regen worker must either:
  - Download all 5 scene files from R2 before calling composition (expensive but safe), OR
  - Pass R2 URLs directly to Remotion (Remotion can render from URLs — see character-video-gen line 439 fallback pattern).

**Recommended approach:** Use the R2 URL fallback pattern already proven in line 435-439 of character-video-gen.ts. For composition, pass the R2 URLs directly as `sceneClips`. Remotion's `OffthreadVideo` component fetches URLs during render. This is already the documented fallback: "Use R2 URL directly — Remotion can render from URLs as well."

**Warning signs:** Remotion render error referencing missing local file paths.

### Pitfall 5: sceneStatuses Not Initialized on Existing tenants

**What goes wrong:** Tenants who completed onboarding before Phase 17 deployed have no `sceneStatuses` in their collectedData. Reading `state.collectedData.sceneStatuses` returns undefined. Array operations throw or produce incorrect length.

**Why it happens:** sceneStatuses is new in Phase 17. Old state rows don't have it.

**How to avoid:** Always initialize with fallback in the worker:
```typescript
const sceneStatuses: string[] = state.collectedData.sceneStatuses
    ?? (state.collectedData.sceneUrls ?? []).map(() => "approved");
```
This defaults all scenes to `approved` for tenants who pre-date Phase 17, which is the correct semantic (they have a delivered video with all approved scenes).

**Warning signs:** TypeError on sceneStatuses[sceneIndex] assignment for tenants onboarded before Phase 17.

---

## Code Examples

### Verified Pattern: Exporting generateScene from character-video-gen.ts

```typescript
// Source: apps/worker/src/services/onboarding/modules/character-video-gen.ts line 183
// Add 'export' keyword — no other changes needed
export async function generateScene(params: {
    tenantId: string;
    sceneIndex: number;
    prompt: string;
    shotType: "narrative" | "dialogue";
}): Promise<{ resultUrl: string; provider: string }>
```

### Verified Pattern: Retry strategy (match character-video-gen)

```typescript
// Source: character-video-gen.ts generateAllScenes() lines 280-303
// 2 attempts (1 retry) per scene — same for regen
for (let attempt = 0; attempt < 2; attempt++) {
    try {
        sceneOutput = await generateScene({ tenantId, sceneIndex, prompt, shotType });
        break;
    } catch (err: any) {
        logger.warn({ attempt: attempt + 1, sceneIndex, error: err.message });
        if (attempt === 1) {
            // permanent failure — handle below
        }
    }
}
```

### Verified Pattern: R2 scene upload (overwrite)

```typescript
// Source: character-video-gen.ts lines 320-333
const r2Key = `character-videos/${tenantId}/scene-${sceneIndex}.mp4`;
const r2Url = await uploadToR2(localPath, r2Key, "video/mp4", {
    tenantId,
    type: "character-video-scene",
    filename: `scene-${sceneIndex}.mp4`,
    metadata: {
        sceneIndex,
        shotType,
        pipelineRunId,
        isRegen: true,
        changeRequestId,
    },
});
```

### Verified Pattern: Remotion from URLs (no /tmp needed)

```typescript
// Source: character-video-gen.ts lines 431-445 (re-download fallback)
// Regen worker can use sceneUrls directly instead of localScenePaths
const revealProps: CharacterRevealProps = {
    characterName: bible.name,
    businessName,
    tagline,
    accentColor,
    bgColor: DEFAULT_BG_COLOR,
    logoUrl: brand?.logoUrl ?? undefined,
    sceneClips: sceneUrls,   // R2 URLs — Remotion OffthreadVideo fetches during render
    sceneLabels,
};
```

### Verified Pattern: concurrency guard query to add to change-request-intake.ts

```typescript
// New function to add to change-request-intake.ts
export async function getInProgressChangeRequest(groupId: string): Promise<ChangeRequestRow | null> {
    return queryOne<ChangeRequestRow>(
        `SELECT id, group_id, tenant_id, message_body, intent, scope, scene_number,
                change_summary, status, estimated_cost_cents, poll_message_id,
                character_bible_version_id, created_at, updated_at
         FROM change_requests
         WHERE group_id = $1 AND status = 'in-progress'
         ORDER BY created_at DESC
         LIMIT 1`,
        [groupId],
    );
}
```

### Verified Pattern: PipelineRun for regen job

```typescript
// Source: pipeline-run.ts createPipelineRun() signature
const pipelineRunId = await createPipelineRun({
    tenantId,
    pipelineType: "character-regen",
    status: "running",
    inputJson: { groupId, changeRequestId, sceneIndex, characterBibleId },
    modelUsed: "sora-2-pro-text-to-video",
});
```

### Verified Pattern: change_requests status flow for Phase 17

```
awaiting-confirmation → confirmed → in-progress → completed
                                               └→ failed
```

```typescript
// At dispatch (handleChangeRequestPollVote confirmed branch):
await updateChangeRequestStatus(changeRequestId, "confirmed");
// After concurrency guard passes and job enqueued — OR update in worker on job start

// In worker, on job start:
await updateChangeRequestStatus(changeRequestId, "in-progress");

// In worker, on success:
await updateChangeRequestStatus(changeRequestId, "completed");

// In worker, on terminal failure:
await updateChangeRequestStatus(changeRequestId, "failed");
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full 5-scene regeneration on any change | Single-scene targeted regen with approved-scene preservation | Phase 17 | ~80% cost reduction on scene changes |
| All state in memory | Persistent collectedData JSONB in onboarding_module_state | v1.0 | Survives worker restarts |
| Hardcoded provider in cost tracking | normalizeProvider() from expense-tracker + generateScene returns provider | Phase 15 | Correct per-provider attribution in api_expenses |
| Poll vote goes directly to module selection | Poll vote disambiguates change-request vs module-selection | Phase 16 | Prevents wrong handler consuming confirmation polls |

---

## Open Questions

1. **Remove or keep the Phase 16 confirmation text in handleChangeRequestPollVote**
   - What we know: Line 302-305 sends "Change request confirmed! We'll start working on it shortly." for all confirmed intents including scene-change.
   - What's unclear: Whether Phase 18 (character-change) needs this message or relies on its own worker ack.
   - Recommendation: For scene-change branch specifically, remove this message (worker ack replaces it). For character-change branch, keep it until Phase 18 is designed. Add a code comment explaining the asymmetry.

2. **sceneIndex bounds validation**
   - What we know: scene_number is extracted by the intent classifier in Phase 16; it was validated as 1-5.
   - What's unclear: Edge cases where scene_number is null (ambiguous classification that somehow reached confirmed status).
   - Recommendation: In the worker, guard: `if (sceneIndex < 0 || sceneIndex >= sceneUrls.length)` → mark failed, alert admin.

3. **Regen reveal caption**
   - What we know: The original caption lists all 5 scene labels and optionally the credit cost.
   - What's unclear: Should the regen delivery caption say "Updated scene N" or use the same format?
   - Recommendation (Claude's discretion): Simpler caption for regen: "Your updated character reveal video is ready! Scene {N} has been regenerated." — avoids duplicating the full scene list for a partial update.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected (no jest.config, vitest.config, or test/ directory in worker) |
| Config file | None — Wave 0 gap |
| Quick run command | N/A until Wave 0 sets up framework |
| Full suite command | N/A until Wave 0 sets up framework |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REGEN-01 | Single scene regenerated; sceneUrls[other indices] unchanged | unit | `jest tests/character-regen.worker.test.ts -t "only regen target scene"` | Wave 0 |
| REGEN-02 | sceneStatuses initialized to all-approved on delivery; set to pending on regen start; set to approved on success | unit | `jest tests/character-regen.worker.test.ts -t "sceneStatuses state machine"` | Wave 0 |
| REGEN-03 | Exactly two WAHA calls per regen cycle (sendText + sendVideo, no extras) | unit | `jest tests/character-regen.worker.test.ts -t "two messages only"` | Wave 0 |
| ASSEM-01 | CharacterReveal renderComposition called with 5-element sceneClips where only index N is new URL | unit | `jest tests/character-regen.worker.test.ts -t "mixed scene assembly"` | Wave 0 |

### Sampling Rate
- Per task commit: unit tests for modified file (manual verification in this phase until framework installed)
- Per wave merge: full suite green
- Phase gate: Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/worker/src/tests/character-regen.worker.test.ts` — covers REGEN-01, REGEN-02, REGEN-03, ASSEM-01
- [ ] Test framework setup: `cd apps/worker && npm install --save-dev jest @types/jest ts-jest` (or vitest equivalent)
- [ ] `apps/worker/jest.config.ts` — ts-jest preset

*(Existing worker codebase has no test infrastructure — all tests are Wave 0 gaps for this phase.)*

---

## Sources

### Primary (HIGH confidence)
- Direct code read: `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — generateScene(), buildScenePrompts(), runCompositionPipeline(), sceneUrls storage pattern, SORA_COST_PER_SCENE, /tmp cleanup
- Direct code read: `apps/worker/src/services/onboarding/change-request-handler.ts` — handleChangeRequestPollVote confirmed branch (Phase 17 hook point at line 301), existing confirmation message at line 302-305
- Direct code read: `apps/worker/src/queue/queues.ts` — all queue definitions, redisConnection import, Queue constructor pattern, job data interfaces
- Direct code read: `apps/worker/src/queue/workers/onboarding.worker.ts` — Worker constructor pattern, initXxxWorker() function pattern, BullMQ error handler
- Direct code read: `apps/worker/src/services/onboarding/change-request-intake.ts` — change_requests schema, updateChangeRequestStatus(), getPendingChangeRequest() pattern for new getInProgressChangeRequest()
- Direct code read: `apps/worker/remotion/src/types/character-reveal-props.ts` — CharacterRevealProps.sceneClips: string[] confirmed
- Direct code read: `apps/worker/src/services/expense-tracker.ts` — COST_RATES.fal.sora_2_scene_1080p, normalizeProvider(), trackExpense()
- Direct code read: `apps/worker/src/services/admin-alerts.ts` — sendAdminAlert(), sendCustomerFailureMessage()
- Direct code read: `apps/worker/src/services/pipeline-run.ts` — createPipelineRun(), updatePipelineRun() signatures
- Direct code read: `apps/worker/src/index.ts` — worker bootstrap pattern for new worker registration
- Direct code read: `apps/worker/src/services/onboarding/module-state.ts` — upsertModuleState(), getModuleState(), collectedData JSONB

### Secondary (MEDIUM confidence)
- `apps/worker/src/queue/workers/claudeclaw.worker.ts` lines 206-237 — poll vote disambiguation flow confirms change-request poll check runs before module-selection poll (Phase 16 pattern continues into Phase 17)

### Tertiary (LOW confidence)
- None — all findings are from direct code reads of the production codebase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use; confirmed by direct import reads
- Architecture: HIGH — patterns verified verbatim from existing workers and service files
- Pitfalls: HIGH — pitfalls derived from reading actual code paths (e.g., /tmp cleanup, 1-based scene_number, Phase 16 confirmation message)
- Test infrastructure: LOW — no existing test framework in worker; Wave 0 gaps flagged

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable codebase; fal.ai API pricing reviewed; Remotion composition unchanged)
