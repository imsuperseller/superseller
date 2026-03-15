# Architecture Research

**Domain:** Character Change Requests + Scene Regeneration — WhatsApp-driven iterative character refinement
**Researched:** 2026-03-15
**Confidence:** HIGH (direct codebase analysis — all integration points read from source)

---

## System Overview

The existing pipeline ends at `character-video-gen` module state `complete`. The module already invites changes at two points (line 584 caption: "Reply here if you'd like any changes" and line 770 response), but the `complete` case has no change-request parser — it just re-confirms completion. This milestone wires in what happens after that invitation.

The fundamental architecture question: does a change request reuse the existing `character-video-gen` module state machine by adding new phases, or does it become a separate module?

**Answer: new phases inside the existing module, not a new module.**

The `module-router.ts` only routes to a module while its state is `!= complete`. Once `complete`, control falls to general Claude chat. Adding a change-request listener as a new module would require registering it in MODULE_REGISTRY and deciding activation conditions — unnecessary complexity. The cleaner fit is extending `character-video-gen` with post-delivery phases, keeping the module open (not in `complete`) until the client explicitly signs off.

---

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHATSAPP TRIGGER LAYER                       │
│                                                                  │
│  Client WhatsApp message → claudeclaw.worker.ts                  │
│    → module-router.ts checks active module for group             │
│    → character-video-gen module is active (not complete)         │
│    → handleMessage() dispatched to character-video-gen           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│              CHARACTER-VIDEO-GEN MODULE (MODIFIED)               │
│                                                                  │
│  Existing phases:                                                │
│    intro → generating → awaiting-composition                     │
│            → composing → uploading → delivering                  │
│                                                                  │
│  New phases (post-delivery):                                     │
│    delivered → awaiting-change-request                           │
│    → [branch on intent]                                          │
│       ├─► change-bible:  re-run character-bible-generator        │
│       │   → regenerate-all: full 5-scene regen                  │
│       ├─► regenerate-scene: targeted scene regen (1-N scenes)    │
│       └─► signed-off: module truly complete                      │
│                                                                  │
└──────────┬──────────────────┬────────────────────────────────────┘
           │                  │
┌──────────▼────────┐ ┌───────▼─────────────────────────────────┐
│ character-bible   │ │  scene-regeneration pipeline             │
│ generator.ts      │ │                                          │
│ (existing)        │ │  - parse change request via Claude       │
│ generateCharacter │ │  - identify affected scene indices       │
│ Bible()           │ │  - call routeShot() for each             │
│                   │ │  - poll + R2 upload                      │
│ [NEW] updateChar- │ │  - re-run composition pipeline            │
│ acterBible()      │ │  - deliver updated video via WAHA        │
└──────────┬────────┘ └──────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
│                                                                │
│  CharacterBible — version column (Int, starts at 1)           │
│    existing row: UPDATE in place, increment version            │
│    OR: INSERT new row (ORDER BY createdAt DESC LIMIT 1 query  │
│         in fetchCharacterBible already picks latest)          │
│                                                                │
│  onboarding_module_state — phase + collected_data             │
│    collected_data.sceneUrls[] — R2 keys per scene             │
│    collected_data.changeHistory[] — log of what changed       │
│    collected_data.revealUrl — current delivered reveal URL    │
│                                                                │
│  PipelineRun — pipelineType: 'character-video-regen'          │
│    tracks cost + model per regen run (not mixed with orig)    │
│                                                                │
│  api_expenses — trackExpense() per regenerated scene          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

| Component | File | Responsibility | Status |
|-----------|------|---------------|--------|
| Module Router | `services/onboarding/module-router.ts` | Routes messages to active module by phase | No change — `complete` renamed to `signed-off` |
| Module State | `services/onboarding/module-state.ts` | Persists phase + collectedData across restarts | No change needed |
| character-video-gen | `services/onboarding/modules/character-video-gen.ts` | Full generation + delivery + change loop | MODIFY: add 4 new phases, intent parser, regen dispatcher |
| character-bible-generator | `services/onboarding/character-bible-generator.ts` | generateCharacterBible() from questionnaire data | MODIFY: add updateCharacterBible() for delta changes |
| Change Intent Parser | `services/onboarding/change-intent-parser.ts` | Claude call → structured ChangeRequest | NEW |
| Scene Regen Dispatcher | inside character-video-gen OR standalone service | Loop N scenes, call routeShot(), upload to R2 | NEW (inline or extracted) |
| Model Router | `services/model-router/router.ts` | routeShot() — already used for initial gen | No change — reuse as-is |
| Pipeline Run | `services/pipeline-run.ts` | createPipelineRun() / updatePipelineRun() | No change — create new run for each regen |
| Expense Tracker | `services/expense-tracker.ts` | trackExpense() per scene | No change — call per regenerated scene |
| WAHA Client | `services/waha-client.ts` | sendVideo() for delivery | No change |
| Composition pipeline | inside character-video-gen (runCompositionPipeline) | Remotion render + R2 + WhatsApp | Reuse as-is — pass new scene URLs |

---

## New vs Modified: Explicit Breakdown

### NEW (net-new files)

**`services/onboarding/change-intent-parser.ts`**

Single responsibility: take a raw WhatsApp message and return a structured `ChangeRequest` object. Uses Claude API (same pattern as `character-bible-generator.ts`). Returns one of:
- `{ type: 'change-bible', field: 'personality' | 'visualStyle' | 'name' | 'audience', newValue: string }`
- `{ type: 'regen-scenes', sceneIndices: number[] }` (e.g. [0,2] for scenes 1 and 3)
- `{ type: 'regen-all' }` (redo everything)
- `{ type: 'sign-off' }` (happy, done)
- `{ type: 'unclear' }` (ask clarifying question)

This isolation means the intent parser can be tested independently of the generation pipeline.

### MODIFIED (existing files with additions)

**`services/onboarding/modules/character-video-gen.ts`**

Add to `ModuleType` union: no change needed — the module type string stays `"character-video-gen"`.

Rename internal `complete` phase to `signed-off` (or keep `complete` as true termination and add new phases before it). The `module-router.ts` checks `phase !== 'complete'` to keep a module active. This means:

Option A: Keep `complete` as the terminal state, add intermediate `delivered` and `awaiting-change` phases before it. Module stays active (not `complete`) through change iteration.

Option B: Module transitions to `complete` after delivery, and a new `character-iteration` module handles changes.

**Option A is correct.** The existing `character-video-gen` module has all the context (sceneUrls, pipelineRunId, bibleId) in `collectedData`. Spinning up a second module loses that state without re-fetching.

New phases to add inside the existing state machine:

```
(existing) delivering → delivered → awaiting-change-request
                                      │
                                      ├─► change-bible
                                      │      │
                                      │      └─► (updateCharacterBible) → regenerating-all
                                      │                                       │
                                      │                                       └─► awaiting-composition (reuse existing)
                                      │
                                      ├─► regenerating-scenes
                                      │      │
                                      │      └─► awaiting-composition (reuse existing)
                                      │
                                      └─► signed-off (= true complete)
```

The `awaiting-composition` and subsequent phases already handle composition → upload → deliver. They can be re-entered by setting `phase = 'awaiting-composition'` with updated `sceneUrls` in `collectedData`. This is the critical reuse point.

**`services/onboarding/character-bible-generator.ts`**

Add `updateCharacterBible(tenantId, bibleId, delta)`. Delta contains only the changed fields. Claude prompt changes: instead of "create a character from scratch," prompt becomes "update this existing character profile with these changes, keep everything else the same."

The database operation: either `UPDATE CharacterBible SET ... WHERE id = $1` with `version = version + 1`, or INSERT a new row (the `fetchCharacterBible` query already uses `ORDER BY createdAt DESC LIMIT 1`, so inserting a new version is a zero-schema-change approach).

**Recommended: INSERT new row** — preserves full change history, zero schema migration, existing fetch query works unchanged.

---

## Data Flow: Iterative Change Request

```
Client WhatsApp: "I want her to look more professional, less casual"
    │
    ▼
claudeclaw.worker.ts
    │
    ▼
module-router.ts
    ├─► getActiveModule(groupId)
    │   └─► returns character-video-gen with phase='awaiting-change-request'
    └─► module.handleMessage(params, state)

character-video-gen.handleMessage() — case 'awaiting-change-request':
    │
    ├─► change-intent-parser.parseIntent(messageBody)
    │       │
    │       └─► Claude API call (200ms, ~$0.001)
    │           → ChangeRequest { type: 'change-bible', field: 'visualStyle', newValue: '...' }
    │
    ├─► [if type=change-bible]
    │   ├─► upsertModuleState(... 'change-bible' ...)
    │   ├─► updateCharacterBible(tenantId, currentBibleId, delta)
    │   │       └─► INSERT new CharacterBible row (version=2)
    │   │
    │   ├─► WA response: "Got it! Updating the character and regenerating all scenes. Takes a few minutes..."
    │   │
    │   └─► setImmediate → runGenerationPipeline() (reuse existing)
    │           └─► transitions to 'generating' → 'awaiting-composition' → 'composing' → 'uploading' → 'delivering' → 'delivered' → 'awaiting-change-request'
    │
    ├─► [if type=regen-scenes]
    │   ├─► upsertModuleState(... 'regenerating-scenes', { scenesToRegen: [0,2] } ...)
    │   ├─► WA response: "Regenerating scenes 1 and 3. Give me a few minutes!"
    │   └─► setImmediate → runSceneRegenPipeline({ sceneIndices: [0,2] })
    │           ├─► For each index: routeShot() → submitJob → poll → download → R2
    │           ├─► Merge with existing sceneUrls (replace indices 0 and 2)
    │           └─► transitions to 'awaiting-composition' (reuses existing runCompositionPipeline)
    │
    ├─► [if type=regen-all]
    │   └─► Same as change-bible but without bible update — directly triggers runGenerationPipeline()
    │
    ├─► [if type=sign-off]
    │   ├─► upsertModuleState(... 'complete' ...)
    │   └─► WA response: "Your character is finalized! Moving on."
    │
    └─► [if type=unclear]
        └─► WA response: clarifying question, stay in 'awaiting-change-request'
```

---

## Architectural Patterns

### Pattern 1: Phase Re-Entry for Composition Reuse

**What:** After targeted scene regen, the module sets `collectedData.sceneUrls` to the merged array (old scenes + newly generated ones) and transitions to `phase = 'awaiting-composition'`. The existing `runCompositionPipeline()` executes without modification.

**When to use:** Both `regen-scenes` and `change-bible` → regen-all paths.

**Trade-offs:** Saves ~200 lines of duplicated render/upload/deliver code. Risk: the composition pipeline reads `collectedData.pipelineRunId` — for regen runs a new PipelineRun is created, so `collectedData.pipelineRunId` must be updated before phase transition.

**Example:**
```typescript
// In runSceneRegenPipeline():
const newPipelineRunId = await createPipelineRun({
    tenantId,
    pipelineType: 'character-video-regen',
    status: 'running',
    inputJson: { scenesToRegen: sceneIndices, originalRunId: data.pipelineRunId },
    modelUsed: 'sora-2-pro-text-to-video',
});

// merge new scene URLs with existing
const mergedSceneUrls = [...data.sceneUrls];
for (const result of regenResults) {
    mergedSceneUrls[result.sceneIndex] = result.r2Url;
}

// Re-enter awaiting-composition with updated state
await upsertModuleState(groupId, tenantId, 'character-video-gen', 'awaiting-composition', {
    ...data,
    sceneUrls: mergedSceneUrls,
    pipelineRunId: newPipelineRunId,    // ← critical: update to new run
    regenHistory: [...(data.regenHistory ?? []), { at: new Date().toISOString(), scenes: sceneIndices }],
});

// Auto-trigger composition
await runCompositionPipeline({ groupId, tenantId, data: updatedData });
```

### Pattern 2: Claude-Powered Intent Classification

**What:** `change-intent-parser.ts` calls Claude with a structured prompt: given the CharacterBible summary + the client message, classify the intent and extract parameters. Returns typed `ChangeRequest`.

**When to use:** Every message in `awaiting-change-request` phase.

**Trade-offs:** Costs ~$0.001 per classification. Adds ~200ms latency before responding. The alternative (keyword matching) is fragile — clients say "make her more polished" not "change visualStyle." Claude classification is worth the cost.

**Example prompt structure:**
```typescript
const prompt = `You are parsing a client's change request for their AI brand character.

Current character:
Name: ${bible.name}
Personality: ${bible.metadata?.brand_tone ?? 'professional'}
Visual Style: ${bible.visualStyle}

Client message: "${messageBody}"

Classify this request. Respond with ONLY a JSON object:
{
  "type": "change-bible" | "regen-scenes" | "regen-all" | "sign-off" | "unclear",
  "field": "personality" | "visualStyle" | "name" | "audience" | null,
  "newValue": "the new description" | null,
  "sceneIndices": [0,1,2,3,4] | null,
  "clarifyingQuestion": "..." | null
}`;
```

### Pattern 3: INSERT New CharacterBible Row for Versioning

**What:** Each bible update inserts a new row rather than updating in place. `fetchCharacterBible()` uses `ORDER BY createdAt DESC LIMIT 1`, so it naturally picks the latest. No schema change. Full history retained.

**When to use:** Any `change-bible` type request.

**Trade-offs:** Slight storage overhead (a few KB per version). Benefit: rollback is trivial — just soft-delete the latest row. The `version` column in the existing schema already supports this (increment on insert).

**Example:**
```typescript
// In updateCharacterBible():
await query(`
    INSERT INTO "CharacterBible" (id, "tenantId", name, "personaDescription", "visualStyle",
                                   "soraHandle", metadata, version, "createdAt", "updatedAt")
    SELECT gen_random_uuid()::text, "tenantId", name,
           $2, COALESCE($3, "visualStyle"),  -- apply delta: null = keep existing
           "soraHandle",
           $4::jsonb,
           version + 1,
           NOW(), NOW()
    FROM "CharacterBible"
    WHERE "tenantId" = $1
    ORDER BY "createdAt" DESC
    LIMIT 1
`, [tenantId, newPersonaDescription, newVisualStyle, JSON.stringify(newMetadata)]);
```

---

## Integration Points: Exact Touch Points per File

### `character-video-gen.ts` (primary modification target)

1. **Phase machine**: Add cases `'delivered'`, `'awaiting-change-request'`, `'change-bible'`, `'regenerating-scenes'`, `'signed-off'` to the `switch(state.phase)` block.

2. **Rename terminal state**: Currently `'complete'` returns `completed: true`. Change final successful completion (sign-off path) to still use `'complete'` but add an intermediate `'delivered'` phase. The module stays active in `'delivered'` → `'awaiting-change-request'` and only moves to `'complete'` on sign-off.

3. **Import**: Add `import { parseChangeIntent } from '../change-intent-parser'` and `import { updateCharacterBible } from '../character-bible-generator'`.

4. **`runCompositionPipeline()`**: No changes. It reads `data.sceneUrls` and `data.pipelineRunId` from collectedData — both are updated by the regen dispatcher before re-entry.

5. **`runGenerationPipeline()`**: No changes. The change-bible path calls this directly — it already fetches the latest CharacterBible (ORDER BY createdAt DESC), so inserting a new bible row is sufficient to pick it up.

6. **Caption**: Change delivery caption from "Reply here if you'd like any changes" (which currently goes nowhere) to an explicit confirmation: "Your character is ready! Reply with any changes you'd like, or say *done* to finalize."

### `character-bible-generator.ts` (minor modification)

Add `updateCharacterBible(tenantId, delta: Partial<CharacterData>)` function that:
1. Fetches the current bible row
2. Merges delta fields (only non-null values overwrite)
3. Re-calls Claude with the existing + updated fields to re-synthesize `personaDescription` and `scenario_prompts`
4. INSERTs the new row with `version + 1`
5. Returns the new bible ID

### `module-router.ts` (no change needed)

The router checks `phase !== 'complete'` to keep a module active. As long as the change-request phases are not `'complete'`, messages continue routing to `character-video-gen`. No modification required.

### `onboarding.worker.ts` (no change needed)

The `handlePipelineEvent` fires when `moduleResult.completed === true`. The `completed: true` return only happens when phase transitions to `'complete'` (sign-off). Change iteration happens internally — no pipeline events fired mid-iteration.

### `types.ts` (minor: add new phases to documentation)

The `ModuleState.phase` field is typed as `string` (not a union), so no TypeScript change is required. Documentation comment update only.

### Database (no schema migration required)

All state is stored in:
- `onboarding_module_state.phase` (TEXT) — add new phase strings at runtime
- `onboarding_module_state.collected_data` (JSONB) — add `regenHistory`, `changeCount` fields
- `CharacterBible` — INSERT new rows (existing schema, `version` column already exists)
- `PipelineRun` — use existing table with `pipelineType: 'character-video-regen'`

No migrations. No new tables.

---

## Data Flow: Delivery Phase Transition (Critical Detail)

The current `'complete'` phase returns `completed: true` which fires `handlePipelineEvent({ type: 'module-completed' })`. This transitions the pipeline to `awaiting-approval` and notifies admin. The change-request milestone must NOT fire this event during iteration.

**Solution:** Only return `completed: true` from the `'signed-off'` (true complete) case, not from `'delivered'`. The `'delivered'` case returns `completed: false` and stays active.

```typescript
// Old complete case (line 766-774) — SPLIT into two cases:

case 'delivered': {
    // Module delivered video but awaiting client response
    // Transition to awaiting-change-request on next message
    await upsertModuleState(groupId, tenantId, 'character-video-gen', 'awaiting-change-request', data);
    return {
        handled: true,
        response: "Your character reveal video has been delivered! Reply with any changes, or say *done* to finalize.",
        moduleType: 'character-video-gen',
        completed: false,  // ← keeps module active, does NOT fire pipeline event
    };
}

case 'signed-off': {
    return {
        handled: true,
        response: `Your character ${data.characterName ?? ''} is finalized! We're all set.`,
        moduleType: 'character-video-gen',
        completed: true,   // ← fires pipeline event → admin approval flow
    };
}
```

---

## Build Order (Dependency-Constrained)

### Step 1: Change Intent Parser (no dependencies, standalone)

**File:** `services/onboarding/change-intent-parser.ts`

Standalone Claude API call returning typed `ChangeRequest`. Has no dependencies on generation infrastructure. Write and test independently with unit tests.

**Acceptance criteria:** Parser correctly classifies at least 10 sample messages covering the 5 intent types. Test with actual WhatsApp-style messages ("make it more casual", "redo scene 2", "looks perfect", "I'm not sure").

### Step 2: updateCharacterBible() in character-bible-generator.ts (no dependencies)

**File:** `services/onboarding/character-bible-generator.ts`

Add `updateCharacterBible()` function. Test: insert a CharacterBible, call update with delta, verify new row inserted with `version = 2` and `fetchCharacterBible()` returns it.

**No dependency on Step 1.**

### Step 3: Phase machine extension in character-video-gen.ts (depends on Steps 1 and 2)

**File:** `services/onboarding/modules/character-video-gen.ts`

Add new phase cases. Wire intent parser and bible updater. Split existing `'complete'` into `'delivered'` and `'signed-off'`. Add `runSceneRegenPipeline()` function (targeted regen loop, merges into existing sceneUrls, re-enters `awaiting-composition`).

This is the highest-risk file — it's the largest module and the one already in production. Make changes surgically: add new cases to the switch without touching existing ones.

### Step 4: Integration test on staging (depends on Step 3)

Walk a full character session on the staging group:
1. Complete questionnaire → video generated → delivered
2. Send change request → parser fires → regen → new video delivered
3. Send sign-off → pipeline event fires → admin notified

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: New Module for Change Requests

**What people do:** Register a `character-iteration` module in MODULE_REGISTRY to handle post-delivery changes.

**Why wrong:** The module router deactivates `character-video-gen` when it reaches `complete`, then looks for the next module. A `character-iteration` module would need to know it should only activate after `character-video-gen` is complete — creating implicit ordering that the registry doesn't support. It would also lose all the context (sceneUrls, pipelineRunId, bibleId) stored in character-video-gen's collectedData.

**Do this instead:** Keep change requests inside `character-video-gen` by adding post-delivery phases. The module's collectedData already carries everything needed.

### Anti-Pattern 2: Keyword-Matching for Intent Classification

**What people do:** `if (msg.includes('scene 2')) → regen scene 2`.

**Why wrong:** Clients say "that second scene doesn't look right" or "can we redo the office one?" Keywords miss these. The classifier also needs to distinguish "make her look more professional" (bible change) from "regen scene 3" (targeted regen) from "looks great!" (sign-off).

**Do this instead:** Claude intent classification with structured JSON output. Cost is negligible (~$0.001). The existing `character-bible-generator.ts` already proves this pattern works.

### Anti-Pattern 3: Updating CharacterBible In-Place

**What people do:** `UPDATE CharacterBible SET visualStyle = $1, version = version + 1 WHERE tenantId = $2`.

**Why wrong:** Loses the previous state. If the client says "actually I preferred the original style," rollback requires storing the old value separately. There's no audit trail.

**Do this instead:** INSERT new row. `fetchCharacterBible()` already uses `ORDER BY createdAt DESC LIMIT 1` — no query change needed. The `version` column auto-increments. Full history is preserved.

### Anti-Pattern 4: Firing module-completed During Change Iteration

**What people do:** Return `completed: true` after delivering the updated video.

**Why wrong:** This triggers `handlePipelineEvent({ type: 'module-completed' })` which transitions the pipeline to `awaiting-approval`, sends admin notification, and sends the next module poll to the client. Change iteration is not done — the client may have more requests.

**Do this instead:** Only return `completed: true` from the `signed-off` phase. The `delivered` and `awaiting-change-request` phases return `completed: false` to keep the module active.

### Anti-Pattern 5: Running Composition Pipeline for Every Scene Change

**What people do:** Full 5-scene regeneration for any change request.

**Why wrong:** Full regeneration costs ~$5.00 (5 Sora scenes). If the client wants one scene changed, regenerating 4 good scenes wastes money and time (10+ minutes).

**Do this instead:** The intent parser identifies specific scene indices to regen. Only those scenes are submitted to the model router. The remaining `sceneUrls` are merged from the existing `collectedData.sceneUrls`. Composition is re-run (CPU only, ~$0) to produce the new reveal video.

---

## Scaling Considerations

| Concern | Impact | Mitigation |
|---------|--------|------------|
| Parallel change requests from same group | Low (WhatsApp concurrency is serial in practice) | claudeclaw.worker concurrency: 1 already prevents races |
| Accumulating CharacterBible versions | Low (few KB per row) | No action needed for current scale |
| Change history in collectedData JSONB | Low (JSONB compressed, bounded) | Cap regenHistory at 20 entries |
| Credit burn from excessive regen | Medium (client could request infinite changes) | Add `changeCount` cap to collectedData (default: 5 free changes, then admin approval) |

---

## Sources

- Direct codebase analysis (HIGH confidence):
  - `/apps/worker/src/services/onboarding/modules/character-video-gen.ts` — existing phase machine, integration points
  - `/apps/worker/src/services/onboarding/modules/character-questionnaire.ts` — module pattern reference
  - `/apps/worker/src/services/onboarding/module-router.ts` — routing logic, active module detection
  - `/apps/worker/src/services/onboarding/module-state.ts` — state persistence
  - `/apps/worker/src/services/onboarding/character-bible-generator.ts` — Claude API call pattern
  - `/apps/worker/src/services/onboarding/pipeline-state.ts` — pipeline state, completed: true firing
  - `/apps/worker/src/queue/workers/claudeclaw.worker.ts` — message flow, handlePipelineEvent call
  - `/apps/worker/src/queue/workers/onboarding.worker.ts` — handlePipelineEvent, admin notification
  - `/apps/web/superseller-site/prisma/schema.prisma` — CharacterBible schema (version column exists)
  - `/apps/worker/src/services/onboarding/modules/types.ts` — OnboardingModule interface

---
*Architecture research for: Character Change Requests + Scene Regeneration milestone*
*Researched: 2026-03-15*
