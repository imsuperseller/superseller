# Project 7: Strategy & Docs — Knowledge Base

## Architecture Overview

This project manages the entire documentation layer of SuperSeller AI. It maintains the single source of truth for business strategy, product status, architecture decisions, and cross-system documentation. It also manages NotebookLM notebooks that serve as the spec/methodology source of truth.

## Documentation Hierarchy

### Tier 1 — North Star
- `brain.md` — Mission, agent protocol, authority precedence table
- `METHODOLOGY.md` — BLAST framework

### Tier 2 — Technical Reference
- `CLAUDE.md` — Technical router (architecture, stack, commands)
- `ARCHITECTURE.md` — System architecture
- `REPO_MAP.md` — Directory structure

### Tier 3 — Operational
- `PRODUCT_STATUS.md` — Per-product honest status
- `VERCEL_PROJECT_MAP.md` — Domain → Vercel project mapping
- `PORT_REFERENCE.md` — Port assignments
- `CREDENTIAL_REFERENCE.md` — Credential locations (paths only)

### Tier 4 — Living Logs
- `progress.md` — Task completion log (updated every task)
- `findings.md` — Root causes and lessons learned
- `DECISIONS.md` — User decisions as canonical truth

### Tier 5 — Deep Reference (docs/)
- `docs/BUSINESS_COVERAGE_INDEX.md` — Unified business-to-SoT mapping
- `docs/INFRA_SSOT.md` — Server, DB, Storage, R2, Environment
- `docs/PRODUCT_BIBLE.md` — SaaS billing, credits, agent specs
- `docs/DATA_DICTIONARY.md` — Where every entity lives
- `docs/REMOTION_BIBLE.md` — Remotion reference

## NotebookLM Management

### Sync Rules
1. After code changes to a product, update the corresponding notebook
2. If notebook is at 50/50 sources, ask user before deleting to make room
3. Never leave "pending upload" items — push in same session
4. On conversation start, query BLAST notebook for agent behavior rules

### 30 Notebooks (as of Mar 2, 2026)
- 5 newly tracked in brain.md (Remotion, Kedem, Workiz, AG/Stitch/Claude, Bounce House)
- BLAST (5811a372) needs recreation
- 4 pending merges identified
- 5 with Rensto residue (varying severity)

## Key Patterns

### Doc Hygiene
- Don't create new .md for every task — update existing canonical docs
- Merge one-off audits into findings/progress, then delete residue
- Prefer main docs over archived residue when searching

### Cross-Project Request Processing
This project processes `docs/cross-project-requests/doc-update-*.md` requests from other projects. When a code project needs documentation updated, they create a request file and this project fulfills it.

### Product-Thinking Mindset
Every experiment, test, or discovery should be evaluated for product potential and documented accordingly in PRODUCT_BIBLE.md or findings.md.

## Content Rules
- NEVER invent content for customer-facing documentation
- Extract from existing strategy docs
- If content doesn't exist, leave it empty
- Cite sources

## API Contracts Governance
- Track all 80+ API endpoints across web and worker
- Route inventory, input/output types, auth patterns
- Breaking-change detection
- Versioning strategy
