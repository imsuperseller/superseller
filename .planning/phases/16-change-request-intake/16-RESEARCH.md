# Phase 16: Change Request Intake — Research

**Researched:** 2026-03-15
**Domain:** WhatsApp post-delivery message routing, Claude intent classification, CharacterBible versioning, credit confirmation UX
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Intent Classification**
- Use Claude API call with structured JSON output to classify intent — consistent with existing ClaudeClaw pattern
- Single API call extracts both intent classification AND scene number (when applicable) — lower latency than two calls
- 4 intent categories per INTAKE-02: `scene-change`, `character-change`, `positive-feedback`, `unrelated`
- Scene number extraction handles natural language: "scene 3", "the third one", "the coffee shop scene" (match against scene descriptions from CharacterBible)
- Ambiguous messages get a clarifying question via WhatsApp before classification — avoids wasting credits on wrong intent
- Classification result stored in a change_requests table row immediately upon receipt

**Post-Delivery Message Routing**
- Extend character-video-gen module with a post-delivery phase (per PROJECT.md decision: extend existing module, not new module)
- Module state transitions: `...` → `delivered` (after video sent) → subsequent messages route to change-request handler
- Change request window is indefinite — no timeout, customer can request changes anytime after delivery
- Positive feedback is logged but does NOT close the change request window — customer may still want changes later
- Messages classified as `unrelated` pass through to normal ClaudeClaw handling (don't trap all messages)

**Credit Confirmation UX**
- WhatsApp poll format: "Scene regen costs X credits. Proceed? Yes / No" (leverages existing WAHA poll pattern)
- Cost estimate varies by change type: scene-level shows single scene cost, character-level shows multi-scene estimate with scene count
- Cost estimation uses COST_RATES from expense-tracker.ts — same source as actual tracking, stays consistent
- Insufficient credits: show current balance + cost, suggest contacting admin — no generation dispatched
- Poll confirmation required before any downstream dispatch (Phase 17/18) — this is the gate

**CharacterBible Versioning (CHAR-01)**
- Versioned-insert pattern: INSERT new row with same tenantId, ORDER BY createdAt DESC LIMIT 1 for current version
- Only character-level changes create a new CharacterBible version — scene-level changes don't modify it
- New version includes `changeDelta` JSON field showing what changed from previous — enables admin review in Phase 18
- Version numbering: auto-increment integer in `version` column — simple, monotonic
- Old versions are never deleted — full history preserved for rollback

### Claude's Discretion
- Exact structured output schema for the Claude classification call
- How to match "the coffee shop scene" to scene numbers (fuzzy matching approach)
- change_requests table schema details (columns beyond intent, scope, status, cost)
- Error handling for Claude API failures during classification
- Exact poll message wording and formatting

### Deferred Ideas (OUT OF SCOPE)
- Multi-round iterative conversation with session memory (ITER-01, v1.4+)
- Scene description matching for "the coffee shop scene" style references — may be simple enough to include, or may need fuzzy matching research
- Change request rate limiting (if customers spam changes) — monitor after shipping
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTAKE-01 | Customer can send natural-language change request in WhatsApp group after receiving character video | Post-delivery routing via `delivered` phase in character-video-gen + module-router change; `handleChangeRequest` entry point |
| INTAKE-02 | System classifies intent as scene-level change, character-level change, positive feedback, or unrelated | Claude API structured JSON call — same pattern as `character-bible-generator.ts`; 4-category output schema |
| INTAKE-03 | System extracts target scene number from message ("scene 3", "the third one") | Single Claude API call returns both intent AND sceneNumber; ordinal mapping in prompt; scene description lookup from CharacterBible metadata |
| INTAKE-04 | System shows credit cost estimate and gets customer confirmation via WhatsApp poll before any generation | `sendPoll()` from waha-client.ts; COST_RATES from expense-tracker.ts; poll vote routed via isPollVote flag in claudeclaw.worker.ts |
| CHAR-01 | System updates CharacterBible with requested changes and creates versioned record (old version preserved) | CharacterBible table already has `version` INT column; versioned-insert pattern: INSERT new row with incremented version + changeDelta JSONB; never UPDATE existing rows |
</phase_requirements>

---

## Summary

Phase 16 implements the intake layer for customer change requests. The work divides cleanly into two concerns: (1) the classification + storage layer (intent-classifier.ts, character-bible-versioning.ts, change_requests table), and (2) the routing + UX layer (extending character-video-gen to a `delivered` phase, wiring module-router, sending cost polls, handling poll votes).

The existing codebase already has all the building blocks. The Claude API call pattern is established in `character-bible-generator.ts` — direct `fetch()` to `https://api.anthropic.com/v1/messages`, structured JSON output, typed response parsing. The WAHA poll pattern is proven across module selection and onboarding. The `sendPoll()` function in waha-client.ts takes question string + options array. Poll votes arrive via `isPollVote: true` in ClaudeClawJobData and are already routed to `handlePipelineEvent` in claudeclaw.worker.ts — the same hook point can dispatch to `handleChangeRequestPollVote`.

The CharacterBible table in Prisma schema already has a `version INT @default(1)` column. The versioned-insert pattern means no schema migration is needed for the version column — only a `changeDelta` JSONB field needs to be added (via `ALTER TABLE IF NOT EXISTS` in worker startup, following the existing idempotent migration pattern in pipeline-state.ts). The worker reads CharacterBible via raw SQL (not Prisma), so it queries `SELECT ... ORDER BY "createdAt" DESC LIMIT 1` for the current version — already demonstrated in `fetchCharacterBible()` in character-video-gen.ts.

**Primary recommendation:** Implement in two plans. Plan 01 builds the pure service layer (intent-classifier, character-bible-versioning, change_requests table init). Plan 02 wires the routing (delivered phase, module-router, change-request-handler orchestrator, poll vote hook). This separation allows Plan 01 to be unit-tested in isolation before routing is wired in Plan 02.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fetch (Node built-in) | Node 18+ | Claude API calls | All existing Claude calls in worker use direct fetch, not SDK |
| vitest | ^4.0.18 | Unit tests | Already installed; all existing onboarding tests use vitest |
| BullMQ | Existing | Async job processing | change-request dispatch to Phase 17/18 will use existing queues |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sendPoll()` (waha-client.ts) | Internal | Credit confirmation poll | Already proven for module selection polls |
| `trackExpense()` (expense-tracker.ts) | Internal | Claude API cost tracking | Mandatory per CLAUDE.md for every API generation |
| `sendAdminAlert()` (admin-alerts.ts) | Internal | Alert admin on classification failure | Same pattern as character-video-gen.ts failures |
| `upsertModuleState()` (module-state.ts) | Internal | Phase transition delivered→change-pending | Existing state machine persistence |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct fetch to Claude API | @anthropic-ai/sdk | SDK not installed in worker; fetch pattern is established and tested |
| Poll for credit confirmation | Text message with typed Yes/No | Poll gives structured vote event (isPollVote); text requires free-text parsing |
| Versioned insert for CharacterBible | UPDATE in place | INSERT preserves history for rollback (ADMIN-03, Phase 19); decision locked |

---

## Architecture Patterns

### Recommended Project Structure
```
apps/worker/src/services/onboarding/
├── intent-classifier.ts          # NEW: Claude API call → ChangeRequestClassification
├── character-bible-versioning.ts # NEW: createCharacterBibleVersion, getLatestCharacterBible
├── change-request-intake.ts      # NEW: Table init + DB CRUD for change_requests
├── change-request-handler.ts     # NEW: Orchestrator — classify → store → poll → vote handling
├── modules/
│   └── character-video-gen.ts    # MODIFY: complete→delivered, route delivered phase msgs
└── module-router.ts              # MODIFY: add delivered phase routing to change-request-handler
```

### Pattern 1: Claude Structured JSON Classification
**What:** Single fetch() to Anthropic API with a prompt that forces JSON output and extracts both intent and scene number in one shot.
**When to use:** Any time we need structured classification from a free-text input.
**Example:**
```typescript
// Source: apps/worker/src/services/onboarding/character-bible-generator.ts (adapted)
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

export interface ChangeRequestClassification {
    intent: "scene-change" | "character-change" | "positive-feedback" | "unrelated" | "ambiguous";
    sceneNumber: number | null;       // 1-indexed; null if not applicable
    changeSummary: string;            // Brief human-readable summary of what to change
    clarifyingQuestion?: string;      // Only present when intent === "ambiguous"
}

// Structured output schema passed to Claude:
// { intent, sceneNumber, changeSummary, clarifyingQuestion? }
// Prompt includes scene list from CharacterBible metadata.scenario_names for "coffee shop scene" matching
```

### Pattern 2: Post-Delivery Phase Extension
**What:** character-video-gen transitions to `delivered` instead of `complete` after video delivery. The `delivered` phase routes all subsequent messages to the change-request handler.
**When to use:** When a module needs indefinite post-completion interaction without spawning a new module.
**Example:**
```typescript
// In character-video-gen.ts runCompositionPipeline — final state transition
// BEFORE (current): 'complete'
await upsertModuleState(groupId, tenantId, "character-video-gen", "complete", completionData);
// AFTER (Phase 16):
await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", completionData);

// New case in handleMessage switch:
case "delivered": {
    const { handleChangeRequest } = await import("../change-request-handler");
    return await handleChangeRequest({ groupId, tenantId, messageBody, state });
}
```

### Pattern 3: Credit Poll Vote Routing
**What:** Poll votes arrive in claudeclaw.worker.ts as `job.data.isPollVote === true`. The existing poll vote handler dispatches to `handlePipelineEvent`. Phase 16 needs a second dispatch path: if the poll is a change-request cost confirmation, route to `handleChangeRequestPollVote`.
**When to use:** Whenever a poll vote needs context-specific handling beyond module selection.
**Example:**
```typescript
// In claudeclaw.worker.ts, within the poll vote detection block
if (groupCfg?.tenantId && job.data.isPollVote && job.data.pollOption) {
    // Check if this is a change-request confirmation poll vs module selection poll
    // Strategy: look up pending change_request for the group with status='awaiting-confirmation'
    const pendingRequest = await getPendingChangeRequest(chatId);
    if (pendingRequest) {
        const { handleChangeRequestPollVote } = await import("../../services/onboarding/change-request-handler");
        await handleChangeRequestPollVote({ groupId: chatId, tenantId, selectedOption: job.data.pollOption, changeRequestId: pendingRequest.id });
        return { handled: "change-request-poll-vote", isGroup: true };
    }
    // Fall through to existing handlePipelineEvent for module selection polls
}
```

### Pattern 4: Versioned CharacterBible Insert
**What:** When a character-level change is approved (poll vote Yes), insert a new CharacterBible row with incremented version and changeDelta. Never UPDATE the existing row.
**When to use:** Every character-level change that gets customer confirmation.
**Example:**
```typescript
// Source: apps/worker/src/services/onboarding/character-bible-generator.ts (insert pattern)
// getLatestCharacterBible: same query as fetchCharacterBible in character-video-gen.ts
const current = await getLatestCharacterBible(tenantId); // ORDER BY createdAt DESC LIMIT 1
const newVersion = (current?.version ?? 0) + 1;
await query(
    `INSERT INTO "CharacterBible" (id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle", metadata, version, "changeDelta", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, NOW(), NOW())`,
    [tenantId, updatedName, updatedPersona, updatedVisualStyle, updatedHandle, JSON.stringify(updatedMetadata), newVersion, JSON.stringify(changeDelta)]
);
```

### Pattern 5: change_requests Table Init (Idempotent)
**What:** Create the table on worker startup using the same `CREATE TABLE IF NOT EXISTS` + `DO $$ BEGIN ALTER TABLE IF NOT EXISTS` pattern established in pipeline-state.ts.
**When to use:** Any new table the worker owns.
**Example:**
```typescript
// Pattern from pipeline-state.ts initPipelineStateTable()
await query(`
    CREATE TABLE IF NOT EXISTS change_requests (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        group_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        message_body TEXT NOT NULL,
        intent TEXT NOT NULL,            -- scene-change | character-change | positive-feedback | unrelated | ambiguous
        scope TEXT,                      -- 'scene' | 'character' | null
        scene_number INTEGER,            -- 1-indexed scene; null if not scene-level
        change_summary TEXT,
        status TEXT NOT NULL DEFAULT 'received', -- received | awaiting-confirmation | confirmed | rejected | dispatched
        estimated_cost_cents INTEGER,
        poll_message_id TEXT,            -- WAHA message ID of the confirmation poll
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
`);
// Add changeDelta to CharacterBible if not exists:
await query(`
    DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CharacterBible' AND column_name='changeDelta') THEN
            ALTER TABLE "CharacterBible" ADD COLUMN "changeDelta" JSONB;
        END IF;
    END $$
`);
```

### Anti-Patterns to Avoid
- **Trapping all messages in delivered phase:** `unrelated` intent must fall through (`return { handled: false }`) so ClaudeClaw handles them normally. Only scene-change, character-change, positive-feedback, and ambiguous stay handled.
- **Sending two Claude API calls for classification:** One call extracts intent + sceneNumber simultaneously. Two calls double cost and latency for a trivial structured extraction.
- **Updating existing CharacterBible rows:** Always INSERT a new row. Never UPDATE. The ORDER BY createdAt DESC LIMIT 1 query always reads the latest.
- **Hardcoding cost per change type:** Read from `COST_RATES` in expense-tracker.ts, not inline constants. Keeps estimation consistent with actual tracking.
- **Blocking the claudeclaw worker on poll vote lookup:** `getPendingChangeRequest` must be a fast indexed query. The change_requests table needs an index on `(group_id, status)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Claude API call | Custom HTTP client wrapper | Existing `fetch()` pattern from character-bible-generator.ts | Already tested, error handling proven |
| Poll sending | Custom WhatsApp poll API | `sendPoll()` from waha-client.ts | Already handles WAHA session, options format, multipleAnswers flag |
| Poll vote detection | Parsing message text for "Yes"/"No" | `isPollVote` + `pollOption` in ClaudeClawJobData | WAHA delivers structured poll.vote events — don't re-implement |
| Module state persistence | Custom DB CRUD | `upsertModuleState()` from module-state.ts | Handles conflict, phase tracking, collectedData merging |
| Cost tracking | Inline expense logging | `trackExpense()` from expense-tracker.ts | MANDATORY per CLAUDE.md — non-blocking, unified schema |
| Admin failure notification | Direct sendText to admin | `sendAdminAlert()` from admin-alerts.ts | Non-blocking, falls back to config.admin.defaultPhone |
| Ordinal number parsing ("the third one") | Regex + word list | Claude prompt — include ordinal mapping table in the system prompt | Claude handles "third", "3rd", "scene 3", and "coffee shop scene" in one pass |

**Key insight:** Every utility needed (poll, state, costs, alerts) is already implemented and tested. Phase 16 is 90% wiring, 10% new code (intent-classifier, change-bible-versioning, change_requests table, change-request-handler).

---

## Common Pitfalls

### Pitfall 1: module-router.ts `getActiveModule` Returns `delivered` Phase as Active
**What goes wrong:** `getActiveModule` queries `WHERE phase != 'complete'` — so `delivered` phase IS returned as active. If module-router tries to delegate to character-video-gen for a `delivered` phase message without adding a case handler, the module falls through to `{ handled: false }` and ClaudeClaw processes the change request as a normal chat message.
**Why it happens:** The `delivered` phase is a new phase value not currently in the module's switch statement.
**How to avoid:** Add `case "delivered":` in character-video-gen.ts `handleMessage` that imports and calls `handleChangeRequest`. Test by verifying a post-delivery message returns `{ handled: true }`.
**Warning signs:** After video delivery, customer messages get generic Claude chat responses instead of change request acknowledgment.

### Pitfall 2: Poll Vote Collision Between Module Selection and Change Request Confirmation
**What goes wrong:** Both the module selection poll (which module to start) and the change request cost poll are sent via `sendPoll()`. When a vote comes in as `isPollVote: true`, the current handler always routes to `handlePipelineEvent`. If a change request poll is in flight, the vote gets misrouted to module selection logic.
**Why it happens:** No disambiguation exists in the current poll vote routing.
**How to avoid:** Query `change_requests` for a pending row with status=`awaiting-confirmation` for the group before deciding routing. If one exists, route to `handleChangeRequestPollVote`. Otherwise fall through to `handlePipelineEvent`.
**Warning signs:** Poll vote for "Yes" to a change request triggers a module selection, or module selection poll vote triggers a change request.

### Pitfall 3: CharacterBible `changeDelta` Column Missing in Production
**What goes wrong:** The Prisma schema doesn't have `changeDelta` on CharacterBible. Worker adds it via raw SQL at startup. If the startup migration runs but the column already has data from a prior failed run, the idempotent `IF NOT EXISTS` guard prevents double-add — correct behavior. But if the guard is omitted, `ALTER TABLE` fails on second startup.
**Why it happens:** Forgetting the `DO $$ BEGIN IF NOT EXISTS` pattern.
**How to avoid:** Follow the exact pattern from `initPipelineStateTable()` for all ALTER TABLE operations. Always wrap in `IF NOT EXISTS`.

### Pitfall 4: "coffee shop scene" Matching Fails When No Scenario Names Exist
**What goes wrong:** The CharacterBible `metadata.scenario_names` array may be null or empty for some tenants (CharacterBible generated before that field was added). The Claude prompt includes scenario names for fuzzy matching — if the list is empty, "the coffee shop scene" cannot be resolved to a scene number.
**Why it happens:** `buildSceneLabels()` in character-video-gen.ts has fallback names like "Brand in Action" — but if scenario_names is empty, all scenes look generic.
**How to avoid:** When metadata.scenario_names is empty, Claude prompt falls back to ordinal-only matching ("the first/second/third scene") and returns `intent: "ambiguous"` with a clarifying question like "Which scene number? (1-5)". Document this fallback in the classification prompt.

### Pitfall 5: Cost Estimation Mismatch — Estimate vs Actual
**What goes wrong:** Cost shown in poll ("3 credits") differs from cost actually charged at generation time. Customer feels deceived.
**Why it happens:** Using different cost sources for estimation vs tracking.
**How to avoid:** Both `estimateCost()` in change-request-handler and `trackExpense()` in Phase 17 must read from the same `COST_RATES` object in expense-tracker.ts. Never hardcode in either place.

### Pitfall 6: `change_requests` Row Not Updated on Poll Vote
**What goes wrong:** Customer votes "Yes" on the poll. `handleChangeRequestPollVote` creates the confirmed state and dispatches to Phase 17/18, but forgets to UPDATE the `change_requests` row from `awaiting-confirmation` to `confirmed`. ADMIN-01 (Phase 19 requirement) then shows all change requests as perpetually pending.
**Why it happens:** Vote handler only triggers generation without completing the intake record.
**How to avoid:** Always UPDATE `change_requests.status` and `change_requests.updated_at` in `handleChangeRequestPollVote` before dispatching. Include this as a must_have truth in Plan 02.

---

## Code Examples

### Intent Classifier — Structured Prompt Schema
```typescript
// Source: pattern from character-bible-generator.ts, adapted for classification
function buildClassificationPrompt(messageBody: string, scenarioNames: string[], sceneCount: number): string {
    const sceneList = scenarioNames.length > 0
        ? scenarioNames.map((name, i) => `  Scene ${i + 1}: ${name}`).join("\n")
        : `  ${sceneCount} scenes (no names available)`;

    return `You are classifying a customer message about their AI character video.

Customer message: "${messageBody}"

Video scenes:
${sceneList}

Classify the message and respond with ONLY a JSON object:
{
  "intent": "scene-change" | "character-change" | "positive-feedback" | "unrelated" | "ambiguous",
  "sceneNumber": <1-${sceneCount} or null>,
  "changeSummary": "<brief description of the requested change, or empty string>",
  "clarifyingQuestion": "<question to ask if ambiguous, otherwise omit>"
}

Rules:
- scene-change: Request to modify a specific scene (shorter hair IN that scene, change the setting, etc.)
- character-change: Request to change the character overall (more casual style, different look in ALL scenes)
- positive-feedback: Praise, approval, satisfaction with the video
- unrelated: Completely off-topic (asking about pricing, scheduling, etc.)
- ambiguous: Could be interpreted multiple ways, or refers to an unclear scene
- sceneNumber: Extract from "scene 3", "the third one", "the 3rd", ordinal words (first=1, second=2...)
  If message mentions a scene name from the list, map it to that scene number.
  If scene-change but no specific scene identified, set to null (will trigger ambiguous).`;
}
```

### CharacterBible Version Insert
```typescript
// Source: pattern from character-bible-generator.ts INSERT
export async function createCharacterBibleVersion(
    tenantId: string,
    updatedFields: Partial<CharacterBibleFields>,
    changeDelta: Record<string, { from: any; to: any }>,
): Promise<string | null> {
    const current = await getLatestCharacterBible(tenantId);
    if (!current) return null;

    const newVersion = (current.version ?? 1) + 1;
    // Merge current fields with updates
    const merged = { ...current, ...updatedFields };

    const rows = await query(
        `INSERT INTO "CharacterBible" (id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle", metadata, version, "changeDelta", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, NOW(), NOW())
         RETURNING id`,
        [tenantId, merged.name, merged.personaDescription, merged.visualStyle, merged.soraHandle,
         JSON.stringify(merged.metadata), newVersion, JSON.stringify(changeDelta)],
    );
    return Array.isArray(rows) ? rows[0]?.id ?? null : null;
}
```

### change_requests Table — Full Schema
```sql
CREATE TABLE IF NOT EXISTS change_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    group_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    message_body TEXT NOT NULL,
    intent TEXT NOT NULL,
    scope TEXT,                      -- 'scene' | 'character' | null
    scene_number INTEGER,
    change_summary TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    estimated_cost_cents INTEGER,
    poll_message_id TEXT,
    character_bible_version_id TEXT, -- FK to CharacterBible.id (set when version created)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cr_group_status ON change_requests(group_id, status);
CREATE INDEX IF NOT EXISTS idx_cr_tenant_id ON change_requests(tenant_id);
```

### Cost Estimation Helper
```typescript
// Uses same COST_RATES as trackExpense — no separate constant
import { COST_RATES } from "../expense-tracker";

const SORA_COST_PER_SCENE_CENTS = Math.round((COST_RATES.fal?.sora_2_per_second_1080p ?? 0.50) * 10 * 100);

export function estimateChangeCost(intent: "scene-change" | "character-change", affectedSceneCount: number): number {
    if (intent === "scene-change") return SORA_COST_PER_SCENE_CENTS;
    return SORA_COST_PER_SCENE_CENTS * affectedSceneCount; // character-change = all affected scenes
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| character-video-gen ends at `complete` | Ends at `delivered` — indefinite change window | Phase 16 | Messages after delivery route to change-request handler, not ClaudeClaw |
| CharacterBible single mutable row | Append-only versioned rows, `changeDelta` column | Phase 16 | Full history, rollback-capable (ADMIN-03) |
| No post-delivery state tracking | `change_requests` table with status machine | Phase 16 | Every request logged from receipt through dispatch |

**Existing schema note:** CharacterBible in Prisma already has `version Int @default(1)` and `active Boolean @default(true)`. The `changeDelta` column is new — added via idempotent worker startup migration. The `active` flag is not used in the versioned-insert pattern (query uses ORDER BY createdAt DESC, not WHERE active=true) — this avoids having to update prior rows.

---

## Open Questions

1. **How does Phase 17 (scene regen) receive the dispatch?**
   - What we know: Phase 16 ends with `change_requests.status = 'confirmed'`. Phase 17 needs to pick it up.
   - What's unclear: Does Phase 16 enqueue a BullMQ job (character-regen queue, mentioned in STATE.md decisions) or does it just write the DB row and Phase 17 polls?
   - Recommendation: Phase 16 change-request-handler should call `characterRegenQueue.add(...)` on `confirmed` status — fire-and-forget, same pattern as other pipeline steps. The queue is already planned in STATE.md ("character-regen BullMQ queue on same Redis connection"). For Phase 16 (intake only), the dispatch call is a placeholder that logs "dispatching to Phase 17" without the actual queue until Phase 17 exists.

2. **What is COST_RATES entry for scene regen specifically?**
   - What we know: `COST_RATES.fal.sora_2_per_second_1080p = 0.50` per second, and SORA_COST_PER_SCENE in character-video-gen.ts is hardcoded to `$1.00` (10s x $0.10/s via fal adapter). The fal rate in COST_RATES is $0.50/s which would give $5.00 for 10s — these are inconsistent.
   - What's unclear: The actual per-scene cost to show customers. `SORA_COST_PER_SCENE = 1.00` from character-video-gen.ts is likely the authoritative number for customer-facing cost display.
   - Recommendation: Use `SORA_COST_PER_SCENE = 1.00` as the cost constant for scene regen cost estimation. Define this as an exported constant in expense-tracker.ts or a shared constants file so both character-video-gen.ts and the new intent classifier read from the same place.

3. **Multi-scene cost for character-level changes — which scenes are "affected"?**
   - What we know: Character-level changes potentially affect all 5 scenes. The cost estimate should show "5 scenes × $1.00 = $5.00".
   - What's unclear: Is it always all 5, or only the scenes with the character prominently featured?
   - Recommendation: For Phase 16 (intake), use total scene count (5) for character-level cost estimate. Phase 18 (CHAR-04) adds admin scope selection — that's where actual affected scene count is refined.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `apps/worker/vite.config.ts` or inline in package.json |
| Quick run command | `cd apps/worker && npm test -- --reporter=verbose src/services/onboarding/intent-classifier.test.ts src/services/onboarding/character-bible-versioning.test.ts` |
| Full suite command | `cd apps/worker && npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTAKE-02 | Classifies "make her hair shorter" as scene-change | unit | `cd apps/worker && npm test -- src/services/onboarding/intent-classifier.test.ts` | ❌ Wave 0 |
| INTAKE-02 | Classifies "make her more casual overall" as character-change | unit | same | ❌ Wave 0 |
| INTAKE-02 | Returns ambiguous + clarifyingQuestion for unclear messages | unit | same | ❌ Wave 0 |
| INTAKE-03 | Extracts sceneNumber=3 from "change scene 3" | unit | same | ❌ Wave 0 |
| INTAKE-03 | Extracts sceneNumber=3 from "the third one" | unit | same | ❌ Wave 0 |
| INTAKE-01 | delivered phase message routes to change-request handler | unit | `cd apps/worker && npm test -- src/services/onboarding/modules/character-video-gen.test.ts` | ❌ Wave 0 (extend existing) |
| INTAKE-04 | sendPoll called with correct cost estimate | unit | `cd apps/worker && npm test -- src/services/onboarding/change-request-handler.test.ts` | ❌ Wave 0 |
| INTAKE-04 | Poll Yes vote transitions status to confirmed | unit | same | ❌ Wave 0 |
| INTAKE-04 | Poll No vote transitions status to rejected | unit | same | ❌ Wave 0 |
| CHAR-01 | createCharacterBibleVersion inserts new row with version=N+1 | unit | `cd apps/worker && npm test -- src/services/onboarding/character-bible-versioning.test.ts` | ❌ Wave 0 |
| CHAR-01 | createCharacterBibleVersion sets changeDelta JSON correctly | unit | same | ❌ Wave 0 |
| CHAR-01 | Old CharacterBible row is preserved (not updated) | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/worker && npm test -- src/services/onboarding/intent-classifier.test.ts` (fast, isolated)
- **Per wave merge:** `cd apps/worker && npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/worker/src/services/onboarding/intent-classifier.test.ts` — covers INTAKE-02, INTAKE-03
- [ ] `apps/worker/src/services/onboarding/character-bible-versioning.test.ts` — covers CHAR-01
- [ ] `apps/worker/src/services/onboarding/change-request-handler.test.ts` — covers INTAKE-01, INTAKE-04

Pattern for all three: mock `fetch` globally (`vi.stubGlobal("fetch", mockFetch)`), mock DB client (`vi.mock("../../db/client")`), mock logger — same pattern as `character-bible-generator.test.ts`.

---

## Sources

### Primary (HIGH confidence)
- `apps/worker/src/services/onboarding/character-bible-generator.ts` — Claude API call pattern (fetch, structured JSON output, error handling)
- `apps/worker/src/services/waha-client.ts` — sendPoll() signature, sendText, poll format
- `apps/worker/src/queue/workers/claudeclaw.worker.ts` — isPollVote routing, module router call, message flow
- `apps/worker/src/services/onboarding/module-router.ts` — getActiveModule query, module delegation
- `apps/worker/src/services/onboarding/pipeline-state.ts` — idempotent table init pattern, ALTER TABLE guard
- `apps/worker/src/services/onboarding/modules/character-video-gen.ts` — current phase machine, complete state, SORA_COST_PER_SCENE constant
- `apps/worker/src/services/onboarding/module-state.ts` — upsertModuleState signature, table structure
- `apps/web/superseller-site/prisma/schema.prisma` (CharacterBible model) — existing version INT column, no changeDelta column yet
- `apps/worker/src/services/expense-tracker.ts` — COST_RATES structure, trackExpense() signature
- `apps/worker/src/services/admin-alerts.ts` — sendAdminAlert() signature
- `apps/worker/src/queue/queues.ts` — existing queue definitions, ClaudeClawJobData interface (isPollVote, pollOption)

### Secondary (MEDIUM confidence)
- `.planning/phases/16-change-request-intake/16-CONTEXT.md` — All locked decisions verified against codebase
- `.planning/STATE.md` — character-regen queue decision, Phase 17 gate conditions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries read from live source files
- Architecture: HIGH — patterns extracted directly from running production code
- Pitfalls: HIGH — derived from concrete code paths in claudeclaw.worker.ts and module-router.ts
- Cost estimation: MEDIUM — SORA_COST_PER_SCENE constant in character-video-gen.ts ($1.00) conflicts with COST_RATES.fal rate; recommendation provided but needs confirmation

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable codebase, 30-day window)
