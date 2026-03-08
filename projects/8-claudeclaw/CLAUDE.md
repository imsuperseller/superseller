# Project 8: ClaudeClaw — WhatsApp AI Bridge

> **Role**: WhatsApp → Claude Agent SDK bridge. Personal + business DM mode plus group agent with 3-tier memory, guardrails, RAG, and approval flows.
> **Status**: ✅ FULLY OPERATIONAL as of March 8, 2026

---

## File Ownership

### CAN edit (this project OWNS these files)
```
apps/worker/src/services/claude-bridge.ts
apps/worker/src/services/claudeclaw-router.ts
apps/worker/src/services/group-agent.ts
apps/worker/src/services/group-memory.ts
apps/worker/src/services/guardrails.ts
apps/worker/src/services/approval-service.ts
apps/worker/src/services/rag.ts
apps/worker/src/services/rag-ingestor.ts
apps/worker/src/services/ep-asset-ingestion.ts   ← NEW (Elite Pro media pipeline)
apps/worker/src/queue/workers/claudeclaw.worker.ts
apps/worker/src/api/routes.ts         ← only the ClaudeClaw sections
apps/worker/tools/register-customer-group.ts     ← NEW onboarding script
```

### CANNOT edit (owned by other projects)
```
apps/worker/src/index.ts              → Project 4 (Infrastructure)
apps/worker/src/config.ts             → Project 4 (Infrastructure)
apps/worker/src/queue/queues.ts       → Project 4 (Infrastructure)
apps/web/**                           → Project 1 (Web)
docs/**                               → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)      → Project 7 (Strategy & Docs)
```

### CAN read
- `apps/worker/src/services/waha-client.ts` — for WhatsApp send API
- `apps/worker/src/services/health-monitor.ts` — for /health command
- `docs/INFRA_SSOT.md` — server context

---

## Assigned Skills
- whatsapp-waha
- rag-pgvector
- monitoring-alerts

---

## Key Files
| Resource | Path |
|----------|------|
| Core bridge | `apps/worker/src/services/claude-bridge.ts` |
| RAG enrichment + mode prompts | `apps/worker/src/services/claudeclaw-router.ts` |
| Group orchestrator | `apps/worker/src/services/group-agent.ts` |
| 3-tier group memory | `apps/worker/src/services/group-memory.ts` |
| Output + input guardrails | `apps/worker/src/services/guardrails.ts` |
| Approval flow | `apps/worker/src/services/approval-service.ts` |
| ClaudeClaw BullMQ worker | `apps/worker/src/queue/workers/claudeclaw.worker.ts` |
| RAG ingestion | `apps/worker/src/services/rag-ingestor.ts` |

---

## Architecture
```
WhatsApp message (WAHA webhook)
  → POST /api/whatsapp/webhook (routes.ts)
  → [personal/business]: BullMQ claudeclaw queue
  → claudeclaw.worker.ts
    → isCommand? → handleCommand() (local, no Claude)
    → isApproval? → handleApprovalResponse() (approval-service.ts)
    → else → runAgent() (claude-bridge.ts)
      → buildEnhancedPrompt() (claudeclaw-router.ts, RAG enrichment)
      → @anthropic-ai/claude-agent-sdk query()
      → formatForWhatsApp() + splitMessage()
      → sendText() (waha-client.ts)
  → [group]: filter: starts with "/" OR @superseller mention OR botJid in mentionedIds
    → handleGroupMessage() (group-agent.ts, quick handlers)
    → OR: assembleGroupContext() (group-memory.ts) → sdkQuery → finalizeGroupResponse()
```

## Slash Commands (direct message)
| Command | Action |
|---------|--------|
| /health | System health summary |
| /approvals | Pending approval requests |
| /rag [query] | Search system knowledge |
| /newchat | Clear session, start fresh |
| /memory | Show recent context |
| /status | Session info |
| /help | Command list |

## Group Agent Trigger Rules (as of Mar 8, 2026)
The group agent ONLY responds when:
1. Message starts with `/` (slash command)
2. Message body contains `@superseller` (case-insensitive)
3. WAHA `mentionedIds` includes the bot's JID (`14695885133@c.us`)
All other group messages are silently ignored.

## Database Tables
| Table | Purpose |
|-------|---------|
| `claudeclaw_sessions` | Session IDs per chatId (continuity) |
| `claudeclaw_turns` | Last 50 turns per chat (memory) |
| `group_agent_config` | Registered group IDs + tenantId + language |
| `group_messages` | Full message archive (3-tier memory) |
| `tenant_memories` | pgvector embeddings (semantic memory) |
| `tenant_profiles` | Entity profiles (semantic memory) |
| `approval_requests` | Pending WhatsApp approvals |
| `rag_documents` + `rag_chunks` | RAG knowledge store |
| `ep_incoming_assets` | Raw media from group members → R2 (Elite Pro pipeline) |

## WAHA Sessions
- **personal** (14695885133) — Shai's personal phone. Handles ClaudeClaw personal mode + Elite Pro group.
- **superseller-whatsapp** (12144362102) — Business phone. Handles ClaudeClaw business mode.

## Guardrails (4 layers)
1. **Output regex filter** — blocks revenue data, API keys, internal IPs, vendor names, infra details
2. **Input jailbreak detector** — blocks prompt injection attempts
3. **System prompt anchoring** — always prepended, never overrideable
4. **RAG tenant isolation** — embeddings scoped to tenantId, never cross-tenant

## Memory Architecture (3-tier for groups)
1. **Short-term buffer** — last 20 messages in `group_messages`
2. **Semantic memory** — pgvector embeddings in `tenant_memories` (Ollama nomic-embed-text, 768-dim)
3. **Entity profiles** — structured facts in `tenant_profiles`
Memory extraction: Claude Haiku fires every 15 messages → extracts facts/decisions/preferences → stores in tiers 2+3

## Registered Groups
| Group | chatId | Tenant |
|-------|--------|--------|
| Elite Pro Remodeling | `120363408376076110@g.us` | `elite-pro-remodeling` |

## Current Status (Mar 8, 2026)
- ✅ Personal DM mode: operational
- ✅ Business DM mode: operational
- ✅ Group agent: operational (Elite Pro group, Hebrew)
- ✅ Guardrails: tested, revenue-data pattern active
- ✅ 3-tier memory: tables created, extraction wired
- ✅ Group trigger filter: only @superseller / slash commands (deployed Mar 8)
- ✅ Media ingestion: tested end-to-end — photo → R2 → DB → ✅ react (Mar 8)
- ✅ WAHA NOWEB_STORE_MEDIA=true: container recreated, media auto-stored
- ✅ New customer onboarding: `register-customer-group.ts` script ready
- ⬜ Personal mode end-to-end test: not yet done
- ⬜ Additional groups: no new groups registered yet (Avi, Yehuda next)

## Cross-Project Rules
1. **Worker config changes** (adding env vars, config fields) → coordinate with Project 4.
2. **Route changes** that affect non-ClaudeClaw paths → coordinate with Project 2.
3. **New DB tables** → coordinate with Project 1 if Prisma-managed (ClaudeClaw tables are created via raw SQL in `initClaudeClawTables()`, not Prisma-managed).
4. **RAG ingestion** runs on scheduler (daily) — do not add new ingestor types without checking scheduler capacity.
