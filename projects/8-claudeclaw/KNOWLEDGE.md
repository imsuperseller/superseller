# Project 8: ClaudeClaw — Knowledge Base

## What ClaudeClaw Is

ClaudeClaw is SuperSeller AI's WhatsApp-to-Claude bridge. It lets Shai (personal mode), the SuperSeller business number (business mode), and registered customer WhatsApp groups talk directly to Claude — with persistent sessions, RAG-enriched context, conversation memory, and a full guardrails stack.

The system runs entirely inside the worker (`apps/worker/`) on RackNerd. WAHA delivers WhatsApp messages via webhook → BullMQ queues them → the worker processes them with the Claude Agent SDK.

## Live Configuration

**WAHA sessions (both on port 3000, RackNerd 172.245.56.50):**
- `personal` (Shai's phone: 14695885133) — personal DM + Elite Pro group messages
- `superseller-whatsapp` (business: 12144362102) — business DM mode

**Claude Agent SDK**: `@anthropic-ai/claude-agent-sdk` installed at `/opt/tourreel-worker/node_modules/`. The `query()` function streams events; `result` event = final response. The SDK spawns Claude Code CLI as a subprocess.

**Critical constraint**: The SDK call must NOT include `allowDangerouslySkipPermissions: true` or `permissionMode: "bypassPermissions"` — these flags cause Claude CLI to exit with code 1 when running as root on the server. Removed March 8, 2026.

**Claude project directory**: `CLAUDECLAW_PROJECT_DIR=/opt/claudeclaw` — this is where the Claude subprocess cwd is set.

## RAG Stack

- **Embeddings**: Ollama `nomic-embed-text` (768-dim) at `http://172.245.56.50:11434`
- **Storage**: pgvector in PostgreSQL, `rag_chunks` table with HNSW index
- **Retrieval**: `searchForContext()` in `rag.ts` — cosine similarity search, top-K results
- **Ingestion**: `rag-ingestor.ts` — health context hourly, full docs daily
- **Tenants**: `system` tenant for global context, `elite-pro-remodeling` for group-specific

## Group Agent Behavior (as of Mar 8, 2026)

**Registration**: Groups registered in `group_agent_config` DB table. Loaded at startup by `initGroupAgentTables()`.

**Message flow for registered group**:
1. WAHA webhook → routes.ts checks `isRegisteredGroup(chatId)`
2. **FILTER**: Only enqueues if body starts with `/` OR contains `@superseller` OR `mentionedIds` includes bot JID (`14695885133@c.us`)
3. `handleGroupMessage()` — tries quick handlers: slash commands, feedback patterns, approval flows
4. If not handled: `assembleGroupContext()` builds 3-tier memory context → Claude Agent SDK → `finalizeGroupResponse()` (guardrails) → send

**Elite Pro group**: `120363408376076110@g.us`, tenant `elite-pro-remodeling`
- Group has 63 competitor ads indexed
- System prompt references tenant-specific brand rules

## Guardrails Detail

**Output filter regex patterns** (in `guardrails.ts`):
- `revenue-data`: matches "revenue", "$X/mo", "monthly", profit figures → REDACTED
- `api-keys`: API key patterns → REDACTED
- `internal-ips`: 172.x.x.x, 10.x.x.x → REDACTED
- `vendor-names`: specific vendor/infra names → REDACTED
- Input: prompt injection patterns → blocked before Claude sees them

**Mar 8 test**: Claude mentioned "$2k/month" in a group response — guardrail caught it, text was redacted before sending. Guardrails confirmed working.

## Approval Flow

Approval requests (`approval-service.ts`) are token-based:
1. Any service can create an approval request with a token via `createApprovalRequest()`
2. User replies to WhatsApp with the token (approve/deny)
3. `handleApprovalResponse()` matches token, fires the registered callback
4. Pending approvals summary via `/approvals` command

## Memory Extraction Schedule

The scheduler (`apps/worker/src/services/scheduler.ts`) triggers:
- **Health context ingest**: hourly
- **Memory extraction** (`maybeExtractMemories`): every 15 group messages — Claude Haiku fires to extract facts/decisions/entities from `group_messages` → stores in `tenant_memories` (vector) + `tenant_profiles` (entity)

## Known Issues / Current Blockers

- **Personal mode test**: Not yet tested end-to-end with real WhatsApp message. Group mode is tested and working.
- **Session resume**: `existingSession ? { resume: existingSession }` — session IDs may expire on the Claude side. Behavior not fully tested after server restart.
- **RAG cold start**: If Ollama is down, RAG fails gracefully (empty context). But this means first-time context enrichment is lost without alert.

## New Customer Group Onboarding — The Routine

When Shai opens a WhatsApp group with a new customer:

### Step 1: Get the Group ID
Send any message in the group. Check WAHA logs:
```bash
ssh root@172.245.56.50 "pm2 logs tourreel-worker --lines 10 --nostream" | grep groupId
```
Or use WAHA API: `GET /api/personal/chats` and find the group by name.

### Step 2: Register the Group (one command)
```bash
ssh root@172.245.56.50
cd /opt/tourreel-worker
npx tsx apps/worker/tools/register-customer-group.ts \
  --groupId "120363408376076110@g.us" \
  --tenantId "customer-slug" \
  --agentName "SuperSeller AI" \
  --agentRole "Instagram Autopilot for [Business Name]" \
  --language he \
  --context "Customer context here — business name, location, service type, owner name"
```

### Step 3: Restart Worker (reloads in-memory registry)
```bash
pm2 restart tourreel-worker
```

### What the script does automatically:
1. ✅ Registers in `group_agent_config` DB
2. ✅ Sets group description
3. ✅ Sends introduction message in the right language

### What the group agent does automatically (from day 1):
- **Any photo/video** sent in group → downloaded → R2 → `ep_incoming_assets` → ✅ react
- **Caption keyword detection**: "לפני"/"before" → `before_photo`, "אחרי"/"after" → `after_photo`, "sora"/"דמות" → `sora_char`
- **@superseller or /command** → Claude responds with full memory context + guardrails
- Media messages without text → silently ingested (no Claude call, just ✅)

### WAHA Requirement
The WAHA container must be running with `WHATSAPP_NOWEB_STORE_MEDIA=true` for media ingestion to work. This is set in the current WAHA Docker run command (confirmed March 8, 2026).

### Checklist for new group
- [ ] Group created with customer + Shai's number
- [ ] Group ID captured from logs
- [ ] `register-customer-group.ts` run on server
- [ ] Worker restarted
- [ ] Test: send a photo in the group → check `ep_incoming_assets` table
- [ ] Test: @superseller hello → agent responds in correct language

---

## Media Ingestion Pipeline (Mar 8, 2026)

**Table**: `ep_incoming_assets`
**R2 path**: `{tenantId}/incoming/{date}/{messageId}.{ext}`
**Flow**: Webhook → hasMedia check → `ingestGroupMedia()` → WAHA mediaUrl fetch → uploadBufferToR2 → DB insert → reactToMessage ✅

**Asset classification** (from caption keywords):
- English: before/after/sora/character/logo/sign/reference/inspo
- Hebrew: לפני/אחרי/דמות/לוגו/שלט/השראה

**WAHA media URL**: `payload.media.url` = `http://localhost:3000/api/files/{session}/{messageId}.jpeg`
Worker rewrites localhost → `config.waha.url` (172.245.56.50:3000) for host-side fetch.

---

## Backlog (Not Started)

| Item | Priority | Notes |
|------|----------|-------|
| Personal mode real-message test | P0 | Send test message on personal session |
| Add second registered group | P1 | Next customer onboarding |
| Entity extraction tuning | P1 | Improve Haiku extraction quality |
| Auto-ingest WhatsApp docs | P2 | When user sends a doc in group, ingest to RAG |
| Template system for new tenants | P2 | Admin portal tab for group agent onboarding |
| ClaudeClaw pricing/billing gate | P2 | Currently free — no credits consumed |
| Admin portal "ClaudeClaw" tab | P3 | Monitor sessions, memory, approval queue |
