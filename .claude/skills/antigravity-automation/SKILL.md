---
name: antigravity-automation
description: >
  Antigravity is SuperSeller AI's primary automation engine (Node.js on RackNerd).
  Covers workflow orchestration, n8n backup patterns, NotebookLM integration
  via Stitch MCP, and programmatic automation replacing n8n for production.
autoTrigger:
  - "Antigravity"
  - "automation"
  - "workflow orchestration"
  - "n8n backup"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "Stripe"
---

# Antigravity Automation

## When to Use
Use when working on automation workflows, Antigravity engine, n8n backup patterns, or integrating NotebookLM/Stitch with automation. Not for video pipeline (use tourreel-pipeline), UI design, or billing logic.

## Critical Rules
1. **Antigravity is PRIMARY for new automation.** n8n runs existing production workflows (FB Bot lead pipeline) but all new automation must be programmatic. Per brain.md Tier 1.
2. **All new automation must be programmatic** (Node.js/TypeScript). Do NOT create n8n workflows for production features.
3. **n8n is acceptable for**: quick prototyping, storage, customer instance delivery (Tax4Us, Shelly).
4. **NotebookLM + Stitch MCP are connected to Antigravity.** Use `notebooklm-mcp` tools to query knowledge.

## Architecture

### Key Components
| Component | Location | Purpose |
|-----------|----------|---------|
| Antigravity Engine | RackNerd VPS (172.245.56.50) | Primary automation runtime |
| n8n Instance | https://n8n.superseller.agency (port 5678) | Backup for new automation; existing production workflows still run |
| NotebookLM MCP | `notebooklm-mcp` tools | Knowledge retrieval for automation |
| Stitch MCP | NotebookLM 286f3e4a | Design assets + Gemini integration |
| BullMQ | Redis-backed job queues | Async task processing |

### NotebookLM Integration
```
Antigravity (Node.js)
  ↓ queries via MCP
NotebookLM (15 notebooks)
  ↓ responds with context
Antigravity applies knowledge to automation
```

### n8n → Antigravity Migration Pattern
When replacing an n8n workflow with programmatic code:
1. Export n8n workflow JSON for reference
2. Identify triggers, transformations, outputs
3. Implement in TypeScript (apps/worker or standalone)
4. Use BullMQ for scheduling/retries instead of n8n cron
5. Test with dry-run before production
6. Keep n8n workflow as reference (do not delete)

## Key Notebooks (via notebooklm-mcp)
| Notebook | ID | Purpose |
|----------|-----|---------|
| Antigravity | 12c80d7d | Platform docs, MCP integration |
| B.L.A.S.T. | 1dc7ce26 | Methodology, agent behavior |
| n8n workflows | fc048ba8 | Legacy workflow catalog |
| n8n superseller | f360003f | Instance-specific patterns |

## Common Patterns

### Query NotebookLM for Context
```typescript
// Use notebooklm-mcp tools
notebook_query({
  notebook_id: "1dc7ce26-2d18-4f46-b421-9d026a57205b",
  query: "What is the agent behavior protocol?"
});
```

### BullMQ Job Pattern (Replacing n8n Cron)
```typescript
import { Queue, Worker } from 'bullmq';
import { config } from './config';

const queue = new Queue('automation', { connection: config.redis });

// Schedule repeating job (replaces n8n cron trigger)
await queue.add('daily-sync', {}, {
  repeat: { pattern: '0 9 * * *' } // 9 AM daily
});

// Worker processes jobs
new Worker('automation', async (job) => {
  // Your automation logic here
}, { connection: config.redis });
```

## Troubleshooting
Common n8n→Antigravity migration issues: Replace webhook triggers with BullMQ consumers, replace n8n HTTP Request nodes with `fetch()`, replace n8n IF/Switch with native JS logic. See `findings.md` for root causes.

## References
- NotebookLM 12c80d7d — Antigravity platform documentation
- NotebookLM fc048ba8 — n8n workflow reference patterns
- brain.md § Technical Stack — Authority on automation hierarchy
- docs/n8n/N8N_WORKFLOWS_CATALOG.md — Reference catalog of existing n8n workflows
