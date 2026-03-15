# Stack Research

**Domain:** Character Iteration — WhatsApp-driven change requests and selective scene regeneration
**Researched:** 2026-03-15
**Confidence:** HIGH (based on direct codebase analysis + confirmed existing patterns)

---

## Context: What This Milestone Adds

This is a subsequent milestone. The v1.0/v1.1 stack (BullMQ, Sora 2 via fal.ai, Kie.ai, Remotion, WAHA, pgvector, Claude direct fetch) is validated and active. Do NOT re-research those.

This milestone adds four net-new capabilities:

1. **Conversation state for iterative change loops** — customer says "make the hair darker" and the agent tracks which field changed, not a full restart
2. **Diff-based CharacterBible updates** — patch only changed fields, version-stamp the result, keep history
3. **Selective scene regeneration** — regenerate only affected scenes, not all 5
4. **Approval/rejection flow** — customer sees proposed change, approves or rejects before credits are consumed

---

## What Already Exists (DO NOT Rebuild)

| Existing | Location | Relevant to This Milestone |
|----------|----------|-----------------------------|
| `onboarding_module_state` table | `module-state.ts` | Stores `phase` + `collectedData` JSONB per `(group_id, module_type)` — extend for iteration context |
| `upsertModuleState()` | `module-state.ts` | Atomic phase + data update — reuse as-is |
| `CharacterBible` table | Prisma schema + `character-bible-generator.ts` | Has `version INT`, `active BOOL`, `metadata JSONB` — already supports versioning |
| `generateCharacterBible()` | `character-bible-generator.ts` | Calls Claude, inserts row — needs a sibling `updateCharacterBible()` variant |
| `generateScene()` + `generateAllScenes()` | `character-video-gen.ts` | Full 5-scene pipeline — needs a `regenerateScene(sceneIndex, prompt)` variant |
| `PipelineRun` table | Prisma schema | Already tracks `pipelineType`, `costCents`, `outputJson` — use `pipelineType: "character-iteration"` |
| `trackExpense()` | `expense-tracker.ts` | Existing cost tracking — use as-is |
| `ModuleState` / `ModuleHandleResult` types | `modules/types.ts` | `ModuleType` union needs `"character-iteration"` added |
| `routeShot()` | `model-router/router.ts` | Single-scene routing — already works for individual scene generation |

---

## Recommended Stack — Net New Only

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Native `pg` Pool (existing) | `^8.18.0` | CharacterBible versioning queries, iteration state reads | Already in worker. No new client needed — raw SQL handles the versioned-insert + deactivate-old pattern. |
| Claude API (direct fetch, existing) | `claude-sonnet-4-20250514` | Parse natural language change requests into structured field diffs | Already used in `character-bible-generator.ts` via `fetch()`. Same pattern: send diff prompt, receive JSON. |
| `zod` (existing) | `^4.3.6` | Validate the diff JSON returned by Claude before applying | Already installed. Add a `CharacterDiffSchema` to validate Claude's structured diff output. |
| BullMQ (existing) | `^5.67.3` | Queue individual scene regeneration jobs | Already has 7 queues. Add a `character-regen` queue for single-scene regeneration jobs — same pattern as existing queues. |

**No new npm packages required.** Every capability can be built on the existing foundation.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` (existing) | `^4.3.6` | `CharacterDiffSchema` — validate Claude's parsed change JSON | Every time a customer submits a change request before touching DB |
| `pg` Pool (existing) | `^8.18.0` | `character_iteration_history` table inserts, CharacterBible version upserts | Every approved change |
| BullMQ (existing) | `^5.67.3` | Enqueue `character-regen` jobs for selective scene regeneration | When customer approves a change that affects specific scenes |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript (existing) | Type-safe diff structure | Define `CharacterDiff` interface — enforces partial update shape |
| Existing `logger` | Structured logging for iteration attempts | Same `{ msg, tenantId, phase }` pattern throughout |

---

## Architecture: The Four Building Blocks

### 1. Conversation State for Iterative Loops

**Problem:** The existing `character-video-gen` module has phases `intro → generating → awaiting-composition → composing → uploading → delivering → complete`. Once it reaches `complete`, there is no path back for "change my character's hair color."

**Solution:** A new `character-iteration` module with its own phase machine. This is a NEW `ModuleType` — not a phase within `character-video-gen`. Customers who reach the `complete` phase of `character-video-gen` transition here when they send a change request.

**New `ModuleType` to add to `modules/types.ts`:**
```typescript
export type ModuleType =
    | "asset-collection"
    | "character-questionnaire"
    | "character-video-gen"
    | "character-iteration"     // NEW
    | "social-setup"
    | "competitor-research";
```

**Phase machine for `character-iteration`:**
```
idle
  │ (any message after character-video-gen complete)
  ▼
parsing-request
  │ Claude parses: "make the hair darker" → { field: "visualStyle", change: "darker hair" }
  ▼
awaiting-approval
  │ Show customer: "I'll update [visualStyle] to add darker hair. This will regenerate scenes 1, 3, 4."
  │ Reply YES to proceed, NO to cancel.
  ▼
applying-change      (on YES)
  │ Patch CharacterBible, version++, deactivate old
  ▼
regenerating
  │ Queue selective scene regeneration via BullMQ
  ▼
composing
  │ Re-render Remotion with new scenes (only affected slots replaced)
  ▼
delivering
  │ Send updated reveal video via WAHA
  ▼
idle                 (back to idle — ready for next change)
```

**State stored in `collectedData` JSONB:**
```typescript
interface IterationCollectedData {
    characterBibleId: string;         // current bible ID
    pendingDiff?: CharacterDiff;      // proposed change, waiting for approval
    affectedSceneIndices?: number[];  // which scenes need regeneration
    currentSceneUrls: string[];       // current R2 URLs (to avoid re-fetching)
    iterationCount: number;           // how many changes applied so far
    lastRevealUrl?: string;           // last delivered video URL
    pipelineRunId?: string;           // current iteration run ID
}
```

### 2. Diff-Based CharacterBible Updates

**Problem:** `generateCharacterBible()` always INSERT a new row. For changes, we need to:
- Identify WHICH fields changed
- Apply only those changes
- Keep the old version accessible (for rollback)
- Increment version number

**Solution:** Add `updateCharacterBible()` to `character-bible-generator.ts` using a versioned-insert pattern.

**DB pattern (raw SQL, no schema change):**
```sql
-- 1. Deactivate old version
UPDATE "CharacterBible" SET active = false WHERE id = $oldId;

-- 2. Insert new version (copy old, apply diff)
INSERT INTO "CharacterBible" (id, "tenantId", name, "personaDescription", "visualStyle",
  "soraHandle", metadata, version, active, "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "tenantId", name,
  COALESCE($newPersonaDesc, "personaDescription"),
  COALESCE($newVisualStyle, "visualStyle"),
  "soraHandle", metadata, version + 1, true, NOW(), NOW()
FROM "CharacterBible" WHERE id = $oldId
RETURNING id, version;
```

`CharacterBible` already has `version INT DEFAULT 1` and `active BOOLEAN DEFAULT true`. No schema migration needed for the bible itself.

**What Claude parses (the diff):**
```typescript
interface CharacterDiff {
    field: "name" | "personaDescription" | "visualStyle" | "audience" | "scenarios";
    originalValue: string;
    requestedChange: string;          // Customer's words: "make it darker"
    proposedValue: string;            // Claude's suggestion: "dark brown hair, deep shadows"
    affectedSceneTypes: Array<"narrative" | "dialogue">;  // which scene types need regen
}
```

**Claude prompt for parsing change requests:**
A new `parseChangeRequest()` function (200 lines max) in `character-bible-generator.ts`. Sends: current CharacterBible fields + customer message. Receives: `CharacterDiff` JSON. Same `callClaude()` function already exists.

### 3. Selective Scene Regeneration

**Problem:** Regenerating all 5 scenes for a minor change wastes $5 in Sora 2 credits. "Make the hair darker" only affects visually-driven scenes, not the dialogue scenes.

**Solution:** A `character-regen` BullMQ queue. Each job specifies `{ tenantId, sceneIndex, prompt, shotType }`. Completion triggers Remotion re-composition only for affected slots.

**Scene-to-field mapping (static, no DB needed):**
```typescript
const SCENE_FIELD_MAP: Record<number, Array<"name" | "visualStyle" | "scenarios" | "personaDescription">> = {
    0: ["name", "visualStyle", "personaDescription"],      // Scene 0: Studio portrait — visual
    1: ["scenarios", "personaDescription"],                // Scene 1-3: Scenario-driven
    2: ["scenarios", "personaDescription"],
    3: ["scenarios", "personaDescription"],
    4: ["visualStyle", "personaDescription"],              // Scene 4: Artistic closer — visual
};

function getAffectedScenes(diff: CharacterDiff): number[] {
    return Object.entries(SCENE_FIELD_MAP)
        .filter(([_, fields]) => fields.includes(diff.field))
        .map(([idx]) => parseInt(idx));
}
```

**New `character-regen` queue:**
```typescript
// In apps/worker/src/queue/queues.ts — add:
export const characterRegenQueue = new Queue("character-regen", { connection: redis });

// Job data shape:
interface CharacterRegenJobData {
    tenantId: string;
    groupId: string;
    sceneIndex: number;
    prompt: string;
    shotType: "narrative" | "dialogue";
    pipelineRunId: string;
    iterationId: string;   // groups all regen jobs for this change
}
```

**Composition after selective regen:** The existing `runCompositionPipeline()` accepts `sceneUrls: string[]`. After selective regen, merge updated scene URLs with unchanged scene URLs (stored in `currentSceneUrls` from `collectedData`) before passing to Remotion.

### 4. Approval/Rejection Flow

**Problem:** Changes should not consume credits until the customer confirms. "Make the hair darker" → show the proposed change → customer says YES before API calls happen.

**Solution:** The `awaiting-approval` phase shows the diff summary. No API calls happen until YES.

**Approval message template:**
```
I'll make this change to [Character Name]:

*What changes:* [field label] — [proposedValue excerpt]
*Scenes to regenerate:* Scenes [1, 3, 4] (~$X.XX in credits)
*Scenes kept as-is:* Scenes [2, 5]

Reply *yes* to apply this change, or *no* to cancel.
```

**Cost estimate before approval:** `affectedScenes.length * SORA_COST_PER_SCENE` — same constant already in `character-video-gen.ts`. Show this in the approval message.

**Rejection path:** Phase → `idle`, `pendingDiff` cleared from `collectedData`. No DB writes, no cost.

---

## New Files Required

```
apps/worker/src/services/onboarding/
├── modules/
│   └── character-iteration.ts         # NEW: handles iteration phase machine
└── character-bible-updater.ts         # NEW: updateCharacterBible(), parseChangeRequest()

apps/worker/src/queue/
├── queues.ts                          # MODIFY: add characterRegenQueue
└── workers/
    └── character-regen.worker.ts      # NEW: processes single-scene regen jobs
```

**Modified files:**
- `modules/types.ts` — add `"character-iteration"` to `ModuleType` union
- `modules/character-video-gen.ts` — on `complete` phase, detect change-request intent and hand off to `character-iteration` module

---

## DB Changes

### New Table: `character_iteration_history`

The existing `CharacterBible` versioning (`version`, `active`) handles the bible state. But we need an audit trail of what changed and why — especially for billing.

```sql
CREATE TABLE IF NOT EXISTS character_iteration_history (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id   TEXT NOT NULL,
    group_id    TEXT NOT NULL,
    bible_id_before TEXT NOT NULL,       -- old CharacterBible ID
    bible_id_after  TEXT,                -- new CharacterBible ID (null if rejected)
    diff_json   JSONB NOT NULL,          -- CharacterDiff — what changed
    status      TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | completed | failed
    scenes_regenerated  INT[] DEFAULT '{}',       -- which scene indices were rebuilt
    cost_cents  INT DEFAULT 0,
    pipeline_run_id TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_cih_tenant ON character_iteration_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cih_status ON character_iteration_history(status);
```

**Why a separate table vs extending `PipelineRun`:** `PipelineRun.inputJson` / `outputJson` are generic blobs. The iteration table has typed columns for `scenes_regenerated` (int array), `bible_id_before/after` (critical for rollback), and `status` that maps to the approval flow — none of which fit cleanly in PipelineRun's schema. PipelineRun is still created for cost tracking (via `trackExpense()`); this table tracks the change request lifecycle.

### No Changes to `onboarding_module_state`

The existing table already supports the new module via `module_type = 'character-iteration'`. `collectedData` JSONB holds the `IterationCollectedData` shape defined above. No migration needed.

### No Changes to `CharacterBible`

`version`, `active`, `metadata` columns already exist in Prisma schema. The versioned-insert SQL pattern handles everything.

---

## Installation

No new npm packages. Everything runs on existing dependencies.

```bash
# Verify existing packages are at expected versions (no install needed):
# bullmq@^5.67.3  ✓
# zod@^4.3.6      ✓
# pg@^8.18.0      ✓
# ioredis@^5.9.2  ✓
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| New `character-iteration` ModuleType | Add iteration phases to `character-video-gen` | `character-video-gen` already has 7 phases. Adding iteration phases to the same module creates an ambiguous `complete` state — is it complete-initial or complete-after-changes? Separate module = clean separation. |
| Versioned-insert pattern for CharacterBible | Mutable UPDATE on existing row | Loses history. If customer wants to roll back ("the old hair was better"), we'd have no prior bible to restore from. Versioned-insert + `active` flag costs one extra row and enables rollback at zero code cost. |
| Selective scene regen via BullMQ `character-regen` queue | Inline async regeneration inside `character-iteration.ts` | BullMQ gives retry logic, job-level failure isolation, and visibility in admin. A single inline `await generateScene()` that fails leaves the module in an unknown state. Queue jobs can be individually retried. |
| Approval gate before any API call | Optimistic: generate first, ask to keep or discard | Optimistic approach burns credits on rejected changes. At $1/scene and 3 affected scenes, that's $3 per rejected change. The approval gate adds one message exchange but prevents unintended credit burn. |
| Parse change intent with Claude (JSON diff) | Pattern matching / regex on message | Regex can't handle "make it more business casual" or Hebrew equivalents. Claude already handles this in the character-bible-generator — same pattern extends naturally. The diff schema keeps Claude's output structured and validated with zod. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Full CharacterBible regeneration on every change request | $10-15 per change (all 5 scenes + compose). Economically untenable for "make the font bigger" style requests. | Selective scene regen: only regenerate `getAffectedScenes(diff)` — typically 1-3 scenes |
| Separate vector DB for change history | pgvector is already on RackNerd. Change history is structured data, not semantic search. | `character_iteration_history` table with typed columns |
| Streaming Claude responses for diff parsing | Adds complexity. The diff JSON is small (~200 tokens). Wait-for-complete is fine. | Simple `await callClaude(prompt)` — same as existing |
| UI/admin for change approval | WhatsApp IS the interface. Approval via WhatsApp message is the design. | `awaiting-approval` phase in `character-iteration` module |
| `@anthropic-ai/sdk` | Worker already calls Claude via `fetch()` directly (intentional decision — avoids SDK dependency). | `callClaude()` in `character-bible-generator.ts` — extend to `character-bible-updater.ts` |
| Separate microservice for iteration | Iteration is one BullMQ queue + one module. The worker process handles it. | Add `character-regen.worker.ts` inside the existing worker process |

---

## Stack Patterns by Variant

**If customer requests a name change only:**
- `affectedScenes = []` (no scene regen needed — prompts use `name` but it doesn't visually matter)
- Skip BullMQ queue entirely — apply CharacterBible update, re-send existing reveal with updated caption
- Cost: $0 in AI credits

**If customer requests a visual style change:**
- `affectedScenes = [0, 4]` (studio portrait + artistic closer — both visual-driven)
- Queue 2 `character-regen` jobs
- Cost: ~$2.00

**If customer requests a scenario change:**
- `affectedScenes = [1, 2, 3]` (all scenario slots)
- Queue 3 `character-regen` jobs
- Cost: ~$3.00

**If customer requests a full character overhaul (>3 fields changed):**
- Treat as full regeneration — redirect to `character-video-gen` with phase reset to `intro`
- Threshold: if `affectedScenes.length >= 4`, suggest starting fresh vs. selective regen
- Show customer the cost comparison in the approval message

**If Hebrew change request detected (existing bilingual support):**
- Claude already handles Hebrew in `callClaude()` — no change needed
- Diff JSON is always English internally regardless of input language
- WhatsApp approval message sent in detected language (use existing language-detection from ClaudeClaw)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `bullmq@^5.67.3` | `ioredis@^5.9.2` | New `character-regen` queue uses same Redis connection as existing queues |
| `zod@^4.3.6` | TypeScript 5.x | `CharacterDiffSchema` follows same pattern as existing zod schemas in worker |
| `pg@^8.18.0` | PostgreSQL 14+ | `character_iteration_history` uses standard pg types, no extensions needed |
| `claude-sonnet-4-20250514` | Anthropic API 2023-06-01 | Same model + API version already in `character-bible-generator.ts` |

---

## Environment Variables Required

| Variable | Status | Notes |
|----------|--------|-------|
| `ANTHROPIC_API_KEY` | Already set | Used by `callClaude()` — no new credential |
| `FAL_API_KEY` | Must be set | For scene regeneration via Sora 2 on fal.ai (same requirement as v1.1) |
| `KIE_API_KEY` | Already set | For dialogue scene regen via Kling/Veo |
| `REDIS_URL` | Already set | BullMQ `character-regen` queue uses same Redis |

---

## Sources

- Direct codebase analysis (HIGH confidence):
  - `apps/worker/src/services/onboarding/module-state.ts` — `onboarding_module_state` schema, `upsertModuleState()` pattern
  - `apps/worker/src/services/onboarding/modules/character-questionnaire.ts` — phase machine pattern
  - `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — scene generation, composition pipeline, polling pattern
  - `apps/worker/src/services/onboarding/character-bible-generator.ts` — `callClaude()`, `generateCharacterBible()`, insert pattern
  - `apps/worker/src/services/onboarding/modules/types.ts` — `ModuleType`, `OnboardingModule`, `ModuleState` interfaces
  - `apps/web/superseller-site/prisma/schema.prisma` lines 1903-1923 — `CharacterBible` model fields (`version`, `active`, `metadata`)
  - `apps/worker-packages/db/src/schema.ts` — `onboarding_module_state` not in Drizzle schema (raw SQL only) — confirmed pattern
- `apps/worker/package.json` — confirmed `bullmq@^5.67.3`, `zod@^4.3.6`, `pg@^8.18.0`, `ioredis@^5.9.2` (HIGH confidence — direct file read)

---

*Stack research for: Character Iteration milestone — WhatsApp change requests + selective scene regeneration*
*Researched: 2026-03-15*
