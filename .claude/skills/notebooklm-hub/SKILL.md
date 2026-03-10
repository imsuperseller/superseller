---
name: notebooklm-hub
description: >-
  NotebookLM knowledge hub management for SuperSeller AI. Covers 36 notebooks as the spec/methodology
  source of truth, query patterns, auth flow, notebook index, research workflows, and
  conflict resolution. Use when querying NotebookLM, managing notebooks, researching specs,
  or resolving cross-reference conflicts. Not for codebase changes, video pipeline, or UI design.
  Example: "Query the Kie.ai notebook for API limits" or "Sync VideoForge spec from NotebookLM".
autoTrigger:
  - "NotebookLM"
  - "notebook"
  - "research"
  - "spec"
  - "methodology"
  - "BLAST"
  - "query notebook"
  - "notebook_query"
  - "notebooklm-mcp"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "database"
  - "deploy"
  - "Stripe"
---

# NotebookLM Knowledge Hub

## Critical
- **36 notebooks are the spec/methodology source of truth** — codebase has implementation, notebooks have specs.
- **Auth expires frequently** — when you get auth errors, run `notebooklm-mcp-auth` via Bash. Never use workaround tools.
- **Never use WebSearch when NotebookLM is the right tool** — tools are chosen for access control and context.
- **Conflict resolution**: When sources conflict, query NotebookLM 1dc7ce26 for hierarchy and cross-reference map.
- **Some notebooks are empty** — check source_count before querying.

## Auth Flow

```bash
# When authentication expires:
notebooklm-mcp-auth

# Fallback (only if CLI fails):
# Use save_auth_tokens MCP tool with fresh tokens
```

## Notebook Index (36 Active)

### Core System (5)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| 1dc7ce26 | Project Template (B.L.A.S.T.) | 19 | Methodology, hierarchy, conflict resolution |
| b906e69f | Claude Code | 10 | Agent behavior, brain.md, codebase rules |
| 9222cc37 | Agentic Workflows & Skill Creation | 5 | Skill creation patterns |
| 44494df5 | AntiGravity Workflows & Ollama | 4 | Automation patterns |
| f0747c8b | PRD Template | 6 | Product requirement docs |

### Products & APIs (8)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| 3e820274 | KIE.AI | 40 | Kie.ai API docs, models, limits |
| 0baf5f36 | Zillow-to-Video (VideoForge) | 25 | VideoForge production instructions |
| 6bb5f16d | Kling 3.0 | 2 | Cinematic prompt engineering |
| e109bcb2 | Mivnim (Yossi Laham) | 38 | Winner Studio client context |
| 7d06c748 | AgentForge | 7 | Research pipeline spec |
| f39b9a6b | Higgsfield.ai | 18 | Alternative video AI (reference) |
| f540f799 | Sora 2 | 21 | Sora 2 Pro API (media generation) |
| b666ec88 | Rentahuman | 4 | Avatar/character reference |

### Infrastructure & Tools (5)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| fc048ba8 | Automation & Core Infra | 39 | Antigravity, n8n, server config |
| f54f121b | Apify | 23 | Scraping actors, Zillow |
| 98b120fa | Aitable.ai | 9 | Dashboard syncs |
| 286f3e4a | Google Stitch | 9 | Design assets, brand tokens |
| 0789acdb | WAHA Pro | 14 | WhatsApp API, session management |

### Business & Marketing (6)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| 719854ee | SuperSeller AI Website | 30 | Site content, copy |
| cb99e6aa | Social Media & Marketing | 50 | Social strategy, lead gen |
| 8df32896 | Market Intelligence | 3 | Competitors, pricing |
| 749832c6 | Design Prompts | 49 | UI/UX prompt patterns |
| 382e5982 | Instagram | 7 | Instagram strategy |
| 8ace0529 | TikTok | 0 | TikTok (empty) |

### Compliance & Operations (4)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| 7630d154 | Legal & Compliance | 3 | ToS, GDPR, domain |
| 02c3946b | AI Cost & Performance | 3 | Benchmarks, budgets |
| 12724368 | Product Changelog | 3 | Feature releases |
| e1acc83c | Resources | 6 | Reference materials |

### Customer-Specific (3)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| 6a4eb203 | (Archived — external client) | 10 | Insurance landing page strategy (not part of SuperSeller AI) |
| b42dabb0 | AC & C HVAC | 2 | HVAC client pitch |
| e419bca1 | Israeli Expatriates Dallas | 1 | Community forum reference |

### Other / Exploration (5)
| ID | Title | Sources | Use For |
|----|-------|---------|---------|
| e99673f2 | JoinSecret Worthy Deals | 8 | SaaS tool deals |
| 0996f6ab | Stack | 1 | Tech stack reference |
| b4974f45 | SuperSeller AI Business Operations | 0 | Empty (planned) |
| df1029dd | Templates & Design | 0 | Empty (planned) |
| 2b5ed4df | AI Media APIs | 0 | Empty (planned) |

## Query Patterns

### notebook_query — Ask a specific notebook
```
Use: When you need specs, methodology, or domain knowledge
Tool: mcp__notebooklm__notebook_query
Params: { notebook_id: "uuid", query: "your question" }
```

### notebook_describe — Get notebook summary
```
Use: When you need an overview of what's in a notebook
Tool: mcp__notebooklm__notebook_describe
Params: { notebook_id: "uuid" }
```

### notebook_list — List all notebooks
```
Use: When you need to find the right notebook
Tool: mcp__notebooklm__notebook_list
```

### source_list_drive — List sources in a notebook
```
Use: When you need to know what documents feed a notebook
Tool: mcp__notebooklm__source_list_drive
Params: { notebook_id: "uuid" }
```

## Common Queries by Domain

| Domain | Notebook | Example Query |
|--------|----------|--------------|
| VideoForge spec | 0baf5f36 | "What are the 12 pipeline stages?" |
| Kie.ai API limits | 3e820274 | "What is the rate limit for Kling 3.0 Pro?" |
| Methodology | 1dc7ce26 | "What is the B.L.A.S.T. framework?" |
| Client context | e109bcb2 | "What characters does Yossi use?" |
| WhatsApp API | 0789acdb | "How to send a video via WAHA?" |
| Pricing research | 8df32896 | "What do competitors charge?" |
| Legal | 7630d154 | "What's our GDPR compliance status?" |

## Conflict Resolution

When codebase and NotebookLM disagree:
1. Query NotebookLM 1dc7ce26 for **authority precedence**
2. Hierarchy: brain.md > CLAUDE.md > INFRA_SSOT > PRODUCT_BIBLE > notebooks
3. If still unclear, **ask the user**

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| "authentication expired" | NotebookLM MCP token expired | Run `notebooklm-mcp-auth` via Bash |
| Empty response from query | Notebook has 0 sources | Check `source_count` in notebook list |
| Wrong notebook queried | ID confusion | Use this skill's index to find correct ID |
| Stale spec data | Sources not synced from Drive | Use `source_sync_drive` to refresh |

## References

- `brain.md` — Authority precedence table
- MCP config: `.cursor/mcp.json` — NotebookLM server config
