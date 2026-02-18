# Codebase vs NotebookLM — Single Source of Truth Split

**Purpose**: Clear boundary so the codebase stays minimal and NotebookLM is the canonical reference.

---

## The Rule

**Codebase** = What IDEs, builds, and agents need to navigate and run the code.  
**NotebookLM** = Specs, methodology, reference content, lessons learned, agent handoffs.

When in doubt: **if it's a spec, methodology, or reference → NotebookLM**. If it's a file path, env var, or minimal routing → codebase.

---

## What Belongs in the Codebase

| Category | Examples |
|----------|----------|
| **File paths** | `apps/web/rensto-site/`, `apps/worker/`, `prisma/schema.prisma` |
| **Env vars** | `DATABASE_URL`, `KIE_API_KEY`, `STRIPE_SECRET_KEY` |
| **Router docs** | `brain.md`, `CLAUDE.md` — minimal routers that point to notebooks |
| **Bibles** | `docs/INFRA_SSOT.md`, `docs/PRODUCT_BIBLE.md` — infrastructure and product facts needed for builds and deploys |
| **Code comments** | Inline docs for complex logic |
| **Schema files** | Prisma, Drizzle — truth for data shape |
| **Monitoring** | Service registry, health checks, alerts, expense tracking (`src/lib/monitoring/`) |
| **Agent skills** | `.claude/skills/` — operational intelligence (9 skills) |
| **Tools** | `tools/rebrand-component.ts` — automated rebranding for external UI |
| **Config files** | `package.json`, `tsconfig`, `next.config` |

---

## What Belongs in NotebookLM

| Category | Examples | Notebook |
|----------|----------|----------|
| **Pipeline spec** | TourReel flow, Kling/Nano Banana, R2 | 0baf5f36 (Zillow-to-Video) |
| **Agent behavior** | Completion rules, anti-drift, executive protocol | 5811a372 (B.L.A.S.T.) |
| **Create page spec** | Form fields, API contract, UI notes | 0baf5f36 |
| **Lessons learned** | Past mistakes (R2 config, FAL removal) | 0baf5f36 |
| **Agent handoff** | Pipeline summary for second opinion | 0baf5f36 |
| **Verification matrices** | 3-scene success criteria, debugging | 0baf5f36 |
| **Design system** | Brand, Stitch assets | 286f3e4a (Stitch) |
| **Methodology** | B.L.A.S.T., Reference Alignment | 5811a372 |

---

## Notebook Index (Quick Reference)

| ID | Purpose |
|----|---------|
| **5811a372** | B.L.A.S.T. canonical — project template, agent behavior, methodology |
| **0baf5f36** | Zillow-to-Video — pipeline spec, create page, agent handoff, verification |
| **286f3e4a** | Stitch — design system, assets |
| **3e820274** | Kie.ai — API docs |
| **12c80d7d** | Antigravity — automation engine |
| **fc048ba8** | n8n workflows |
| **719854ee** | rensto website — main site, business model, subscription tiers |
| **b906e69f** | Claude Code — Claude Code mastery, agentic workflows, tooling |
| **f0747c8b** | prd template — **LEGACY** (different product version, do not use for current TourReel) |

Full index: `docs/NOTEBOOKLM_INDEX.md` (canonical), also referenced in `brain.md` Knowledge Hierarchy.

---

## Conflict Resolution

Per [`brain.md`](brain.md) Authority Precedence table:

1. **brain.md is Tier 1** — final authority on all conflicts.
2. **Methodology** → [METHODOLOGY.md](METHODOLOGY.md) (Tier 4). B.L.A.S.T. = new projects. Agent Behavior = routine tasks.
3. **Code vs NotebookLM disagree** → brain.md decides. NotebookLM provides deep context but does not override brain.md or codebase instruction files.
4. **TourReel pipeline specifics** → NotebookLM 0baf5f36 is the spec reference; brain.md and codebase override on authority questions.
5. **NotebookLM sources conflict** → 5811a372 Reference Alignment rules apply, subordinate to brain.md.

---

## What Was Removed from Codebase (Migrated to NotebookLM)

These were archived to `infra/archive/worker-docs-in-notebooklm-2026-02/` because they exist in NotebookLM 0baf5f36:

- `apps/worker/AGENT_SELF_AUDIT.md`
- `apps/worker/AGENT_HANDOFF.md`
- `apps/worker/3-SCENE_VERIFICATION.md`

Also archived (stale):

- `apps/web/rensto-site/src/app/video/create/CONFLICT_ANALYSIS.md` — said floorplan/realtor were removed; they are now required/optional again.
