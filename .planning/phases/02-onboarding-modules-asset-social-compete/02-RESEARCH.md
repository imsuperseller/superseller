# Phase 2: Onboarding Modules — Asset Collection, Social Setup, Competitor Research - Research

**Researched:** 2026-03-13
**Domain:** WhatsApp conversational modules, media ingestion, R2 asset management, ServiceInstance configuration
**Confidence:** HIGH

## Summary

Phase 2 builds three conversational onboarding modules that the Phase 1 product-aware agent activates based on a customer's products. The critical insight is that **nearly all infrastructure already exists**: WAHA media download (`downloadMedia` + `ingestGroupMedia` pattern), R2 upload with `TenantAsset` registration, `ServiceInstance.configuration` JSON field for storing preferences, and the ClaudeClaw group agent pipeline for routing messages through Claude.

The main work is: (1) a **module router** that intercepts group messages before they hit raw Claude, detects which module should handle a message based on conversation state, and routes accordingly; (2) three **module implementations** that maintain conversation state, collect data conversationally, and persist results to DB/R2; (3) **integration with the existing ClaudeClaw worker** so modules are invoked during group message processing.

**Primary recommendation:** Model each module as a state machine with phases (intro, collecting, confirming, complete). Store module state in a `onboarding_module_state` table keyed by (groupId, moduleType). The module router checks this state on each incoming group message and delegates to the active module. When no module is active, the agent operates in general Q&A mode.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ASSET-01 | Agent activates asset collection when customer has any visual product | Module router uses `fetchTenantProducts()` to check for VideoForge/Lead Pages/SocialHub |
| ASSET-02 | Agent requests business photos, logos, brand materials via WhatsApp | Module sends structured prompts asking for specific asset types |
| ASSET-03 | Received media downloaded via WAHA, uploaded to R2, registered as TenantAsset | Existing `downloadMedia()` + `uploadBufferToR2()` + `registerAsset()` pattern from ep-asset-ingestion.ts |
| ASSET-04 | Agent categorizes assets and confirms receipt | Caption keyword matching (from ep-asset-ingestion.ts) + react with emoji + confirmation message |
| SOCIAL-01 | Agent activates social setup when customer has SocialHub/Buzz | Module router checks product list for SocialHub/Buzz |
| SOCIAL-02 | Agent collects social media credentials and preferences | Conversational state machine: platform selection, frequency, content style |
| SOCIAL-03 | Agent stores preferences in ServiceInstance.configuration JSON | Direct SQL UPDATE on `ServiceInstance.configuration` using existing `query()` |
| SOCIAL-04 | Agent explains what SocialHub will do and sets expectations | Part of module intro phase - static content in prompt |
| COMPETE-01 | Agent activates competitor briefing when customer has Maps/SEO or Lead Pages | Module router checks product list |
| COMPETE-02 | Agent asks for top 3 competitors | Conversational collection, one at a time |
| COMPETE-03 | Agent stores competitor info in ServiceInstance.configuration or dedicated table | ServiceInstance.configuration JSON field is simplest for v1 |
| COMPETE-04 | Agent shares initial findings when AgentForge research completes | AgentForge NOT YET BUILT - store competitor info now, trigger research later (Phase 5 or post-v1) |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| WAHA Pro | Self-hosted | WhatsApp media download, message sending | Already integrated in waha-client.ts |
| @aws-sdk/client-s3 | In worker deps | R2 upload via S3-compatible API | Already in r2.ts |
| BullMQ | In worker deps | Message queue for ClaudeClaw processing | Already in claudeclaw.worker.ts |
| Vitest | 4.0.18 | Unit testing | Already configured in worker |
| Claude Agent SDK | In worker deps | AI responses for conversational flow | Already in claudeclaw.worker.ts |

### Supporting (No New Dependencies Needed)
This phase requires **zero new npm packages**. Everything builds on existing infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
apps/worker/src/services/onboarding/
  prompt-assembler.ts          # [EXISTS] Dynamic system prompt from products
  group-bootstrap.ts           # [EXISTS] WhatsApp group creation
  module-router.ts             # [NEW] Routes messages to active module
  module-state.ts              # [NEW] DB state management for modules
  modules/
    asset-collection.ts        # [NEW] Media download + R2 + TenantAsset
    social-setup.ts            # [NEW] Credential/preference collection
    competitor-research.ts     # [NEW] Competitor info collection
    types.ts                   # [NEW] Shared module interfaces
```

### Pattern 1: Module State Machine
**What:** Each module is a state machine with well-defined phases. State persists in DB so conversations survive worker restarts.
**When to use:** Every module follows this pattern.

```typescript
// Module state stored in DB
interface ModuleState {
  groupId: string;
  tenantId: string;
  moduleType: 'asset-collection' | 'social-setup' | 'competitor-research';
  phase: string;        // e.g., 'intro' | 'collecting_logos' | 'collecting_photos' | 'confirming' | 'complete'
  collectedData: Record<string, any>;  // JSON - accumulated answers
  updatedAt: Date;
}

// Each module implements this interface
interface OnboardingModule {
  moduleType: string;
  // Check if this module should activate for given products
  shouldActivate(products: ProductInfo[]): boolean;
  // Handle an incoming message in context of this module
  handleMessage(params: {
    groupId: string;
    tenantId: string;
    messageBody: string;
    hasMedia: boolean;
    mediaUrl?: string;
    mediaType?: string;
    messageId?: string;
    senderChatId?: string;
    state: ModuleState;
  }): Promise<ModuleHandleResult>;
  // Generate the intro message when module first activates
  getIntroMessage(tenantName: string): string;
}
```

### Pattern 2: Module Router Integration with ClaudeClaw
**What:** The module router intercepts group messages in the ClaudeClaw worker BEFORE they go to raw Claude. If a module is active, the module handles the message and generates a response. If no module is active, fall through to Claude with the existing system prompt.
**When to use:** This is how modules plug into the existing message flow.

The key integration point is in `claudeclaw.worker.ts` at the group message handling section (line ~90). After media ingestion and before quick handlers, check if a module should handle this message:

```typescript
// In claudeclaw.worker.ts group handling, after media ingestion:
const { routeToModule } = await import("../../services/onboarding/module-router");
const moduleResult = await routeToModule({
  groupId: chatId,
  tenantId: groupConfig.tenantId,
  messageBody: body,
  hasMedia,
  mediaUrl,
  mediaType,
  messageId,
  senderChatId,
});

if (moduleResult.handled) {
  // Module generated response — send it
  await sendText(chatId, moduleResult.response, target);
  return { handled: "onboarding-module", module: moduleResult.moduleType };
}
// else: fall through to existing Claude flow
```

### Pattern 3: Asset Ingestion (Reuse ep-asset-ingestion.ts Pattern)
**What:** The Elite Pro asset ingestion (`ep-asset-ingestion.ts`) already demonstrates the full media pipeline: WAHA mediaUrl fetch, localhost rewrite, R2 upload, caption-based classification, DB insert, emoji reaction. The asset collection module should reuse this pattern but write to `TenantAsset` (universal) instead of `ep_incoming_assets` (Elite Pro specific).
**When to use:** ASSET-03 implementation.

Key details from the existing pattern:
- WAHA provides `mediaUrl` in webhook payload (e.g., `http://localhost:3000/api/files/{session}/{messageId}.{ext}`)
- Must rewrite `localhost:3000` to actual WAHA host (`config.waha.url`)
- Requires `X-Api-Key` header for download
- Buffer size check (`< 100` bytes = error response, not media)
- R2 key format: `{tenantSlug}/onboarding/{date}/{safeId}.{ext}`

### Pattern 4: ServiceInstance Configuration Update
**What:** `ServiceInstance.configuration` is a `Json?` field. Modules write structured data into it.
**When to use:** SOCIAL-03, COMPETE-03.

```typescript
// Read current config, merge new data, write back
async function updateServiceConfig(
  tenantId: string,
  productName: string,
  configPatch: Record<string, any>,
): Promise<void> {
  const row = await queryOne<{ id: string; configuration: any }>(
    `SELECT id, configuration FROM "ServiceInstance"
     WHERE "tenantId" = $1 AND "productName" = $2 AND status IN ('active', 'pending_setup')
     LIMIT 1`,
    [tenantId, productName],
  );
  if (!row) return;

  const existing = row.configuration || {};
  const merged = { ...existing, ...configPatch };

  await query(
    `UPDATE "ServiceInstance" SET configuration = $1, "updatedAt" = NOW() WHERE id = $2`,
    [JSON.stringify(merged), row.id],
  );
}
```

### Anti-Patterns to Avoid
- **Don't use Claude for module routing.** Module activation is deterministic based on product list and state. Use code logic, not AI inference.
- **Don't store module state in memory.** Worker restarts would lose conversation progress. Use DB.
- **Don't build AgentForge integration now.** AgentForge is NOT YET BUILT (all files are "NOT YET CREATED" per skill doc). COMPETE-04 should store data and mark the module as complete. Research trigger is Phase 5 or post-v1.
- **Don't create a separate webhook for modules.** Modules integrate into the existing ClaudeClaw worker pipeline.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Media download from WhatsApp | Custom HTTP client | `downloadMedia()` or direct fetch of `mediaUrl` with API key | WAHA serves media at a URL, no need for message-ID based download |
| R2 upload + TenantAsset | New upload function | `uploadBufferToR2()` from r2.ts with `assetInfo` param | Already handles TenantAsset registration automatically |
| Asset type classification | Complex ML classifier | Caption keyword matching (ep-asset-ingestion.ts pattern) | Simple keyword → type mapping handles 90% of cases |
| Phone normalization | Manual string ops | `phoneToChatId()` from waha-client.ts | Already handles Israeli/US/international formats |
| Message reaction | Custom implementation | `reactToMessage()` from waha-client.ts | Existing function, used in EP pipeline |

## Common Pitfalls

### Pitfall 1: WAHA Media URL Localhost Rewrite
**What goes wrong:** WAHA webhook sends `mediaUrl` as `http://localhost:3000/api/files/...` but worker may run on a different host or the WAHA server address is different.
**Why it happens:** WAHA generates URLs relative to its own hostname.
**How to avoid:** Always rewrite `http://localhost:3000` to `config.waha.url` before fetching. See `ep-asset-ingestion.ts` lines 106-109.
**Warning signs:** Download returns HTML error page or empty buffer.

### Pitfall 2: Module State Race Conditions
**What goes wrong:** Customer sends multiple messages quickly, two workers pick up jobs, both read same state, both advance the state.
**Why it happens:** ClaudeClaw concurrency is 1, but state reads aren't transactional with writes.
**How to avoid:** ClaudeClaw worker already has `concurrency: 1` which prevents parallel processing per group. For extra safety, use `SELECT ... FOR UPDATE` when reading module state.
**Warning signs:** Duplicate confirmation messages, skipped questions.

### Pitfall 3: Module Activation Without Products
**What goes wrong:** Module tries to activate but tenant has no matching products, or ServiceInstance doesn't exist.
**Why it happens:** Products may have been removed between group creation and module activation.
**How to avoid:** Always re-fetch products in module router (don't cache from bootstrap time). Check `shouldActivate()` returns true before starting.
**Warning signs:** Module sends intro message for a product the customer doesn't have.

### Pitfall 4: AgentForge Not Ready for COMPETE-04
**What goes wrong:** Competitor research module tries to trigger AgentForge which doesn't exist yet.
**Why it happens:** AgentForge files are all "NOT YET CREATED" per the skill doc.
**How to avoid:** COMPETE-04 should mark the module as complete with collected data. Add a TODO/flag for triggering research when AgentForge is built. Don't call non-existent code.
**Warning signs:** Import errors at runtime.

### Pitfall 5: Media-Only Messages in Group
**What goes wrong:** Customer sends a photo without any text caption. The module needs to handle this gracefully.
**Why it happens:** WhatsApp allows sending media without caption. `messageBody` will be empty string.
**How to avoid:** Check `hasMedia` flag independently of `messageBody`. When media arrives during asset collection, process it even without caption text.
**Warning signs:** Photos sent but not acknowledged, module stuck waiting for text.

## Code Examples

### Asset Collection: Download + Upload + Register

```typescript
// Source: Adapted from ep-asset-ingestion.ts pattern
import { uploadBufferToR2, AssetInfo } from "../../r2";
import { reactToMessage } from "../../waha-client";
import { config } from "../../../config";

async function ingestOnboardingMedia(params: {
  tenantId: string;
  tenantSlug: string;
  mediaUrl: string;
  mediaType: string;
  messageId: string;
  chatId: string;
  caption: string;
}): Promise<{ r2Key: string; publicUrl: string; assetType: string } | null> {
  // Rewrite localhost URL
  const fetchUrl = params.mediaUrl.startsWith("http://localhost")
    ? params.mediaUrl.replace("http://localhost:3000", config.waha.url)
    : params.mediaUrl;

  // Download
  const res = await fetch(fetchUrl, {
    headers: { "X-Api-Key": config.waha.apiKey },
  });
  if (!res.ok) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 100) return null;

  // Classify from caption
  const assetType = guessAssetType(params.caption, params.mediaType);
  const ext = mimeToExt(params.mediaType);

  // Upload to R2 with TenantAsset registration
  const date = new Date().toISOString().slice(0, 10);
  const safeId = params.messageId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(-32);
  const r2Key = `${params.tenantSlug}/onboarding/${date}/${safeId}.${ext}`;

  const publicUrl = await uploadBufferToR2(buffer, r2Key, params.mediaType, {
    tenantId: params.tenantId,
    type: assetType,
    filename: `${safeId}.${ext}`,
    metadata: { source: "onboarding", caption: params.caption },
  });

  // React with checkmark
  await reactToMessage(params.chatId, params.messageId, "check_mark");

  return { r2Key, publicUrl, assetType };
}
```

### Module State Table

```sql
-- Source: New table for module state persistence
CREATE TABLE IF NOT EXISTS onboarding_module_state (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  module_type TEXT NOT NULL,  -- 'asset-collection' | 'social-setup' | 'competitor-research'
  phase TEXT NOT NULL DEFAULT 'pending',
  collected_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, module_type)
);
CREATE INDEX IF NOT EXISTS idx_oms_group ON onboarding_module_state(group_id);
CREATE INDEX IF NOT EXISTS idx_oms_tenant ON onboarding_module_state(tenant_id);
```

### ServiceInstance Configuration Update

```typescript
// Source: Based on Prisma schema ServiceInstance.configuration Json? field
async function storeCompetitorInfo(
  tenantId: string,
  competitors: Array<{ name: string; url?: string; location?: string }>,
): Promise<void> {
  // Find the Maps/SEO or Lead Pages service instance
  const si = await queryOne<{ id: string; configuration: any }>(
    `SELECT id, configuration FROM "ServiceInstance"
     WHERE "tenantId" = $1
     AND "productName" IN ('Maps/SEO', 'Google Maps', 'Lead Pages')
     AND status IN ('active', 'pending_setup')
     LIMIT 1`,
    [tenantId],
  );
  if (!si) return;

  const existing = si.configuration || {};
  const merged = {
    ...existing,
    competitors,
    competitorResearchCollectedAt: new Date().toISOString(),
  };

  await query(
    `UPDATE "ServiceInstance" SET configuration = $1, "updatedAt" = NOW() WHERE id = $2`,
    [JSON.stringify(merged), si.id],
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| EP-specific asset ingestion (ep_incoming_assets table) | Universal TenantAsset via r2.ts `assetInfo` param | Already exists | Module uses universal TenantAsset, not EP-specific table |
| Character-specific group-bootstrap.ts | Universal group-bootstrap.ts | Phase 1 (this project) | Module router extends this universal foundation |

**Key insight:** The ep-asset-ingestion.ts is a specialized version of what we need. The universal version uses `uploadBufferToR2()` with `assetInfo` parameter which auto-registers in `TenantAsset`.

## Open Questions

1. **Module activation order**
   - What we know: Three modules can all be relevant for a single tenant (e.g., VideoForge customer needs assets + social + competitor research).
   - What's unclear: Should modules run sequentially (asset first, then social, then competitor) or should the agent offer choice?
   - Recommendation: Sequential with defined priority: asset-collection first (quick, tangible), then social-setup, then competitor-research. Agent announces "Next, let's..." between modules.

2. **AgentForge trigger for COMPETE-04**
   - What we know: AgentForge is NOT YET BUILT. All key files are "NOT YET CREATED."
   - What's unclear: When will it be ready?
   - Recommendation: Store competitor data in ServiceInstance.configuration. Add a `competitorResearchPending: true` flag. A future integration can scan for this flag and trigger research. For now, COMPETE-04 sends a "I've noted your competitors. Once our research system processes this, I'll share findings here." message.

3. **Social media credential storage security**
   - What we know: ServiceInstance.configuration is a JSON field, not encrypted.
   - What's unclear: Should social media credentials (IG passwords, tokens) be stored in this JSON?
   - Recommendation: Do NOT store actual passwords in ServiceInstance.configuration. Collect platform names and preferences only. Actual credential handoff happens through a separate secure flow (not in scope for this phase).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `apps/worker/vitest.config.ts` |
| Quick run command | `cd apps/worker && npx vitest --run` |
| Full suite command | `cd apps/worker && npx vitest --run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ASSET-01 | Module activates for visual products | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/asset-collection.test.ts` | Wave 0 |
| ASSET-02 | Agent requests specific asset types | unit | Same file | Wave 0 |
| ASSET-03 | Media download + R2 upload + TenantAsset | unit | Same file | Wave 0 |
| ASSET-04 | Asset categorization + confirmation | unit | Same file | Wave 0 |
| SOCIAL-01 | Module activates for SocialHub/Buzz | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/social-setup.test.ts` | Wave 0 |
| SOCIAL-02 | Collects preferences conversationally | unit | Same file | Wave 0 |
| SOCIAL-03 | Stores in ServiceInstance.configuration | unit | Same file | Wave 0 |
| SOCIAL-04 | Explains SocialHub capabilities | unit | Same file | Wave 0 |
| COMPETE-01 | Module activates for Maps/SEO or Lead Pages | unit | `cd apps/worker && npx vitest --run src/services/onboarding/modules/competitor-research.test.ts` | Wave 0 |
| COMPETE-02 | Asks for competitor info | unit | Same file | Wave 0 |
| COMPETE-03 | Stores competitor info | unit | Same file | Wave 0 |
| COMPETE-04 | Shares findings message (placeholder) | unit | Same file | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/worker && npx vitest --run`
- **Per wave merge:** `cd apps/worker && npx vitest --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/worker/src/services/onboarding/modules/asset-collection.test.ts` -- covers ASSET-01..04
- [ ] `apps/worker/src/services/onboarding/modules/social-setup.test.ts` -- covers SOCIAL-01..04
- [ ] `apps/worker/src/services/onboarding/modules/competitor-research.test.ts` -- covers COMPETE-01..04
- [ ] `apps/worker/src/services/onboarding/module-router.test.ts` -- covers routing logic

Framework already installed and configured. Existing test pattern in `prompt-assembler.test.ts` shows mocking strategy: `vi.mocked(query)` for DB calls.

## Sources

### Primary (HIGH confidence)
- `apps/worker/src/services/onboarding/prompt-assembler.ts` -- Phase 1 product detection logic
- `apps/worker/src/services/onboarding/group-bootstrap.ts` -- Phase 1 group creation flow
- `apps/worker/src/services/group-agent.ts` -- Group registry, system prompt assembly, message routing
- `apps/worker/src/services/waha-client.ts` -- WAHA API: downloadMedia, sendText, reactToMessage, sendImage
- `apps/worker/src/services/r2.ts` -- R2 upload with automatic TenantAsset registration
- `apps/worker/src/services/tenant-asset.ts` -- TenantAsset DB insert
- `apps/worker/src/services/ep-asset-ingestion.ts` -- Complete media ingestion pattern (download + classify + upload + react)
- `apps/worker/src/queue/workers/claudeclaw.worker.ts` -- Group message handling pipeline, media ingestion integration point
- `apps/worker/src/api/routes.ts` -- WAHA webhook handler, media URL extraction from payload
- `apps/web/superseller-site/prisma/schema.prisma` -- ServiceInstance.configuration, TenantAsset schema

### Secondary (MEDIUM confidence)
- `.claude/skills/whatsapp-waha/SKILL.md` -- WAHA session details, env vars
- `.claude/skills/agentforge/SKILL.md` -- AgentForge status (NOT YET BUILT)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- module pattern directly extends existing ClaudeClaw worker pipeline
- Pitfalls: HIGH -- derived from reading actual production code (ep-asset-ingestion.ts, claudeclaw.worker.ts)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- internal codebase, no external API changes expected)
