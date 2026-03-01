# Codebase vs NotebookLM — Single Source of Truth Split

**Purpose**: Clear boundary so the codebase stays minimal and NotebookLM is the canonical reference.
**Last cleanup**: Mar 1, 2026 — removed 188 stale files (40,745 lines). Synced 5 notebooks.

---

## The Rule

**Codebase** = What IDEs, builds, and agents need to navigate and run the code.
**NotebookLM** = Specs, methodology, reference content, lessons learned, agent handoffs.

When in doubt: **if it's a spec, methodology, or reference → NotebookLM**. If it's a file path, env var, or minimal routing → codebase.

---

## Codebase Doc Inventory (What Remains)

### Root Level (15 files)
| File | Purpose |
|------|---------|
| `brain.md` | North Star, authority precedence (Tier 1) |
| `CLAUDE.md` | Technical router to all key references |
| `METHODOLOGY.md` | B.L.A.S.T. vs Agent Behavior decision rules |
| `DECISIONS.md` | User decisions as canonical truth |
| `PRODUCT_STATUS.md` | Living product status tracker |
| `ARCHITECTURE.md` | System design overview |
| `REPO_MAP.md` | File structure overview |
| `README.md` | Repo overview |
| `CREDENTIAL_REFERENCE.md` | Where to find credentials (paths only) |
| `PORT_REFERENCE.md` | Port assignments |
| `VERCEL_PROJECT_MAP.md` | Vercel projects → domains |
| `CLAUDE_CODE_WORKFLOW.md` | Terminal workflow patterns |
| `CODEBASE_VS_NOTEBOOKLM.md` | This file |
| `progress.md` | Session work log (truncate periodically) |
| `findings.md` | Root cause analysis (truncate periodically) |

### docs/ (6 files)
| File | Purpose |
|------|---------|
| `PRODUCT_BIBLE.md` | SaaS products, agents, credit logic |
| `INFRA_SSOT.md` | Server, DB, Storage, R2, Environment |
| `DATA_DICTIONARY.md` | Entity definitions, sync rules |
| `BUSINESS_COVERAGE_INDEX.md` | Business matters → sources of truth |
| `REMOTION_BIBLE.md` | Remotion 4.0 spec |
| `NOTEBOOKLM_INDEX.md` | Pointer index to 34 notebooks |

### .claude/skills/ (30 SKILL.md files + references)
Operational intelligence for each product/tool domain.

### apps/web/superseller-site/ (1 file)
`VERCEL_ENV_CHECKLIST.md` — deploy checklist.

---

## NotebookLM Notebook Index (34 total)

### Product Notebooks
| ID | Title | Product |
|----|-------|---------|
| `0baf5f36` | Zillow-to-Video | Forge/TourReel |
| `e109bcb2` | Mivnim (Yossi) | Spoke/Winner Studio |
| `cb99e6aa` | Social Media & Lead Gen | Buzz/Scout |
| `f67b6668` | Remotion | Remotion composition engine |
| `7d06c748` | AgentForge | AgentForge spec |

### Infrastructure Notebooks
| ID | Title | Scope |
|----|-------|-------|
| `fc048ba8` | Automation & Core Infra | Antigravity, n8n, deploy |
| `3e820274` | KIE.AI | Kie.ai API, models, pricing |
| `0789acdb` | WAHA Pro | WhatsApp integration |
| `98b120fa` | Aitable.ai | Dashboard analytics |
| `f54f121b` | Apify | Web scraping |

### Methodology
| ID | Title |
|----|-------|
| `5811a372` | B.L.A.S.T. — Agent behavior, methodology |
| `12724368` | Product Changelog |
| `02c3946b` | Cost & Performance |

### Website & Brand
| ID | Title |
|----|-------|
| `719854ee` | SuperSeller Website |
| `749832c6` | Design Prompts |
| `382e5982` | Instagram |

### Customer Notebooks
| ID | Title |
|----|-------|
| `b42dabb0` | AC&C HVAC |
| `6a4eb203` | Yoram leads |
| `720eb7e6` | Kedem Real Estate |
| `e109bcb2` | Mivnim (Yossi) |

---

## Conflict Resolution

Per `brain.md` Authority Precedence:
1. **brain.md is Tier 1** — final authority on all conflicts
2. **Methodology** → METHODOLOGY.md (Tier 4)
3. **Code vs NotebookLM disagree** → brain.md decides
4. **NotebookLM sources conflict** → 5811a372 Reference Alignment rules apply
