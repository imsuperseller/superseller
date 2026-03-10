# 🏗️ THE ARCHITECT'S COMMAND DECK

**Purpose**: Mission Control for SuperSeller AI. Top-level authority for all agents (Claude Code, Cursor, Antigravity). Read this first.

**Last Updated**: February 2026

---

## 📋 AUTHORITY PRECEDENCE (Conflict Resolution)

When sources conflict, higher tier wins. If same tier conflicts, brain.md decides.

| Tier | File | Authority Scope |
|------|------|-----------------|
| 1 | `brain.md` | Mission, north star, conflict resolution, final say |
| 2 | `CLAUDE.md` | Technical router — paths, URLs, stack, key files |
| 3 | `docs/INFRA_SSOT.md` | Infrastructure only (servers, DB, storage, env vars) |
| 3 | `docs/PRODUCT_BIBLE.md` | Products and services only (SaaS, billing, agents) |
| 4 | `METHODOLOGY.md` | Process methodology (B.L.A.S.T. vs Agent Behavior) |
| 5 | `.claude/rules/agent-behavior.md` | Agent execution rules (canonical copy) |
| 5 | `.cursor/rules/agent-behavior.mdc` | Agent execution rules (Cursor mirror) |
| 6 | `ARCHITECTURE.md`, `REPO_MAP.md` | Code structure reference |
| 7 | NotebookLM notebooks | Specs, deep context, methodology source |
| 8 | `.cursorrules` | Legacy pointer only — do not rely on for current state |

---

## 🎯 THE NORTH STAR (The Mission)

**Objective**: Ship a live, unified credit-based SaaS marketplace where businesses buy Credits to access high-value AI outputs (Hot Leads, AI Videos, Business Automations).

**The Hook**: "Try for free → See massive ROI → Convert to Premium."

**Identity Clarification**:
- **SuperSeller AI**: Unified SaaS ecosystem for AI Automations & Leads (superseller.agency).
- **Rensto**: Separate premium contractor directory business (rensto.com). Fully separate brand, codebase (`~/rensto - online directory/`), domain, nginx config, and systemd service (`rensto` on port 3001 RackNerd). NEVER touch rensto's nginx, DNS, or server config from SuperSeller sessions.
- **Brand Separation**: Two legally separate businesses under Rensto LLC DBA SuperSeller Agency. All code, docs, and infra must treat them as entirely independent.
- **Cross-Business Relationship** (intentional, not contamination): Contractors who list on Rensto are ideal SuperSeller AI prospects — they need AI video, leads, and automation. SuperSeller sales outreach can use Rensto's contractor DB as a warm lead source. This is a *business strategy*, not a technical dependency. No shared code, DB tables, or domains.
- For conflict/cross-contamination checks: run schema-sentinel (`npx tsx tools/schema-sentinel.ts`), grep for Rensto/superseller brand in code, and review DECISIONS.md §1b. (A dedicated consistency-checker script is not present in tools/.)

**Core Stack**:
- **Antigravity** (RackNerd): Primary automation. Executes workflows, builds apps.
- **n8n** (RackNerd): Backup for new automation. Existing production workflows (Telnyx voice lead analysis for UAD + MissParty) still run on n8n.
- **Kie.ai**: Creative AI (Kling 3.0, Suno, Nano Banana) — credit-based APIs. Veo and FAL are deprecated.
- **Remotion 4.0**: Programmatic video composition (Ken Burns, transitions, branding, multi-format) — zero API cost. See `docs/REMOTION_BIBLE.md`.
- **PayPal**: Payments, subscriptions, credit ledger (migrated from Stripe Feb 2026).
- **PostgreSQL + Redis**: App backends and marketplace products.
- **Aitable.ai**: Internal dashboards and syncs only (not production app DB).

---

## 🧠 KNOWLEDGE HIERARCHY (NotebookLM Index)

NotebookLM + Stitch MCP are connected to Antigravity. Draw from these notebooks via `notebooklm-mcp`. **27 notebooks total** (audited Mar 3, 2026; 4 junk deleted, 4 merged & deleted, B.L.A.S.T. recreated).

> **B.L.A.S.T. notebook recreated** (Mar 2, 2026): New ID `1dc7ce26` replaces old `1dc7ce26`. 3 sources: METHODOLOGY.md, Agent Behavior rules, B.L.A.S.T. Antigravity Protocol.

### Core SuperSeller AI (9 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 1 | [1dc7ce26](https://notebooklm.google.com/notebook/1dc7ce26-492c-4902-8541-6aff766257de) | **B.L.A.S.T. canonical** — Methodology, Agent Behavior, Antigravity Protocol (3 sources). Recreated Mar 2, 2026. |
| 2 | [0baf5f36](https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c) | **Zillow-to-Video** — VideoForge pipeline spec (30 sources). Canonical for pipeline. |
| 3 | [3e820274](https://notebooklm.google.com/notebook/3e820274-6839-4921-aa83-ad003dd2fb93) | **KIE.AI** — API docs, models, Kling 3.0 prompt engineering (47 sources). Merged from Kling 3.0 notebook. |
| 4 | [fc048ba8](https://notebooklm.google.com/notebook/fc048ba8-12b7-432a-b8d9-65baae62d529) | **Master: Automation & Core Infra** — Antigravity, n8n, infra ledger (45 sources). Merged from stack notebook. |
| 5 | [cb99e6aa](https://notebooklm.google.com/notebook/cb99e6aa-967f-40d4-9580-c02b3250bc78) | **Master: Social Media, Lead Gen & Marketing** — FB Bot, SocialHub, Instagram API (50 sources) **AT MAX**. Merged from Instagram notebook. |
| 6 | [719854ee](https://notebooklm.google.com/notebook/719854ee-b94e-4555-9b2b-48ae136335b8) | **superseller website** — Site content, i18n, pricing (36 sources) |
| 7 | [12724368](https://notebooklm.google.com/notebook/12724368-e4af-488c-a8a3-ce04da043d60) | **Product Changelog** — Feature releases (8 sources). ⚠️ Has stale Rensto entries. |
| 8 | [b906e69f](https://notebooklm.google.com/notebook/b906e69f-7b8c-4e31-88b8-4939c830604c) | **Claude Code** — Agent behavior, brain.md hierarchy, tooling (12 sources) |
| 9 | [f67b6668](https://notebooklm.google.com/notebook/f67b6668-edbf-4173-88fd-9a4535f7433e) | **Remotion** — Remotion 4.0 docs + SuperSeller video engine (50 sources) **AT MAX** |

### Customer / Business (7 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 10 | [e109bcb2](https://notebooklm.google.com/notebook/e109bcb2-d29e-44d5-bd4a-f67b88929be6) | **mivnim (yossi laham)** — Winner Studio customer (39 sources) |
| 11 | [b42dabb0](https://notebooklm.google.com/notebook/b42dabb0-62d5-4381-aa9c-ccd4fa9b1f46) | **AC & C HVAC** — Eliran Matzrafi (47 sources). ⚠️ Has "Rensto Pitch" doc with old pricing. |
| 12 | [6a4eb203](https://notebooklm.google.com/notebook/6a4eb203-9479-4919-869f-7a83489ff0af) | **Yoram Friedman leads** — Insurance agent leads (10 sources) |
| 13 | [8df32896](https://notebooklm.google.com/notebook/8df32896-d93b-4a32-961f-40c6fa3ccf7a) | **Market Intelligence** — Competitor research (4 sources). ⚠️ Rensto residue in source docs. |
| 14 | [02c3946b](https://notebooklm.google.com/notebook/02c3946b-c69b-423b-b188-9b79ecdd1629) | **Cost & Performance** — LLM benchmarks, cost budgets (5 sources). ⚠️ Rensto residue. |
| 15 | [7630d154](https://notebooklm.google.com/notebook/7630d154-341b-40a7-9a10-6f9e1f3ddc7d) | **Legal & Compliance** — TOS, GDPR, domain ownership (4 sources). ⚠️ Heavy Rensto residue. |
| 16 | [720eb7e6](https://notebooklm.google.com/notebook/720eb7e6-ec27-4f58-b032-0a52ca92073d) | **Kedem Real Estate** — Daniel Arbel, customer/prospect (41 sources) |

### Tools & APIs (4 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 17 | [f54f121b](https://notebooklm.google.com/notebook/f54f121b-97b1-45b2-8a05-156d1c8ad3f7) | **Apify** — Scraping, actors (24 sources) |
| 18 | [0789acdb](https://notebooklm.google.com/notebook/0789acdb-2485-43ec-9b4a-6dc227fcaead) | **WAHA Pro** — WhatsApp API (15 sources) |
| 19 | [98b120fa](https://notebooklm.google.com/notebook/98b120fa-bc5e-466a-a8d2-7a609c044283) | **aitable.ai** — Dashboards, syncs (10 sources) |
| 20 | [98127573](https://notebooklm.google.com/notebook/98127573-81a9-47bf-a2b9-1c82d18fee15) | **Workiz** — CRM API docs (2 sources) |

### Learning & Reference (7 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 21 | [749832c6](https://notebooklm.google.com/notebook/749832c6-a85d-49a4-98da-1585ee7e325a) | **design prompts** — UI/UX design (50 sources) **AT MAX** |
| 22 | [c204ed6d](https://notebooklm.google.com/notebook/c204ed6d-9b84-4407-a87e-351b00c28e27) | **Google AG/Stitch/Claude Code** — Stitch docs, MCP, Agent Skills (13 sources). Merged from Google Stitch. |
| 23 | [e1acc83c](https://notebooklm.google.com/notebook/e1acc83c-978f-4601-b98a-d4c4b4b9ff50) | **Resources** — Reference materials (7 sources) |
| 24 | [f0747c8b](https://notebooklm.google.com/notebook/f0747c8b-1dd1-4451-8a02-9b1231c82dac) | **prd template** — PRD templates (7 sources). ⚠️ Heavy Rensto residue + old pricing. |
| 25 | [7d06c748](https://notebooklm.google.com/notebook/7d06c748-49ce-4801-be5c-672a56a420a2) | **AgentForge** — AI research pipeline (8 sources) |
| 26 | [e419bca1](https://notebooklm.google.com/notebook/e419bca1-17d8-4edf-a1ac-ff1d37cd67ea) | **Israeli Expatriates in Dallas** — ICP community research (1 source) |
| 27 | [d25475c7](https://notebooklm.google.com/notebook/d25475c7-8130-4367-a516-90b64c592d95) | **Bounce House Rental Directory** — Market research (2 sources) |

### Audit Actions Log (Mar 2-3, 2026)

| Action | Status | Details |
|--------|--------|---------|
| ✅ **RECREATE** B.L.A.S.T. | Done | New ID `1dc7ce26` with 3 sources (METHODOLOGY, Agent Behavior, B.L.A.S.T. Protocol) |
| ✅ **DELETE** 4 junk | Done | higgsfield, sora2, Rentahuman, joinsecret — zero production use |
| ✅ **MERGE** Kling 3.0 → KIE.AI | Done | 2 sources (prompt handbook + API guide) added to 3e820274 |
| ✅ **MERGE** Instagram → Social Media | Done | 5 Instagram API URLs added to cb99e6aa (now at 50/50) |
| ✅ **MERGE** stack → Infra | Done | Subscription ledger added to fc048ba8 |
| ✅ **MERGE** Stitch → AG/Stitch/Claude | Done | 3 sources (Stitch docs, compliance, forum) added to c204ed6d |
| ⚠️ **Low-pri**: Rensto residue | Deferred | AC&C, Legal, PRD template, Cost, Market Intel have rebrand notices — content is contextualized |

*Previously deleted: 4 empty notebooks, 2 Claude Code duplicates. 34 → 27 notebooks after full audit.*

**Codebase vs NotebookLM**: Codebase = IDE essentials (paths, env, routers). NotebookLM = specs, methodology, references. When in doubt → query notebooks.

---

## ⚡ EXECUTIVE OPERATING PROTOCOL

**Before every response:** If the conversation has been summarized or spans many messages, query NotebookLM 1dc7ce26 (B.L.A.S.T.) for agent behavior and completion rules.

- **Mode: Executive**. Do not ask permission for small technical fixes. Propose a **Plan Artifact**, then execute. When the user gives access (credentials, APIs), USE it — do not ask clarifying questions or send instructions back.
- **Conflict Resolution Rule**: When NotebookLM (The Vision) and local code (The Reality) disagree:
  1. **Compare**: Highlight the contradiction.
  2. **Fix**: Propose the change that aligns with the North Star.
  3. **Test**: Verify the fix in terminal/browser.
  4. **Learn**: Update `findings.md` with root cause so the mistake never repeats.
- **Anti-Disorganization Guardrail**: Never start a new feature until the current one has a "Working Demo" or verifiable Artifact. No zombie half-finished files.
- **Data-First Rule**: When writing *new* scripts in `tools/`, define JSON schema first (B.L.A.S.T. Blueprint). For routine fixes to existing tools, use Agent Behavior—no HALT.

### Agent Completion Rules (from NotebookLM 1dc7ce26)

- **Test everything** before declaring done. Verification in terminal or browser. No claims without evidence.
- **Document everything**. Update `progress.md`, `findings.md`; record root causes in findings.md so issues never repeat.
- **Report only when complete** with a verifiable Artifact or Working Demo. Do not send short status updates or steps for the user to perform.
- **Never**: Short messages, asking permission when access was given, half-finished work, guessing at business logic.

---

## 📂 UNIFIED LAYOUT

```
/
├── brain.md                 ← YOU ARE HERE (Mission Control)
├── CLAUDE.md                ← Full technical context
├── METHODOLOGY.md           ← Single system: B.L.A.S.T. vs Agent Behavior (no conflicts)
├── DECISIONS.md             ← User decisions as canonical truth
├── CREDENTIAL_REFERENCE.md  ← Where credentials live (paths only, no secrets)
├── task_plan.md             ← Approved implementation phases
├── findings.md              ← Research, discoveries, root causes
├── progress.md              ← Execution logs, error tracking
├── CONFLICT_AUDIT.md        ← Run when asked "do you have conflicts?" — execute, don't guess
├── PORT_REFERENCE.md        ← Ports SSOT: 3001=worker (local both), 3002=site, RackNerd worker :3002
├── .env                     ← API keys (verified in Link phase)
│
├── docs/
│   ├── frameworks/          ← B.L.A.S.T., Antigravity, Brand Identity, etc.
│   ├── templates/videoforge/  ← Blueprint, Implementation Spec, Prompt Playbook
│   ├── n8n/                 ← N8N_WORKFLOWS_CATALOG.md
│   └── NOTEBOOKLM_INDEX.md  ← Notebook IDs mapped to purpose
│
├── apps/web/superseller-site/    ← Main Next.js app (superseller.agency, admin)
├── apps/worker/             ← Video pipeline (Nano Banana, Kling)
├── apps/worker-packages/    ← Shared packages (db, etc.)
├── infra/                   ← MCP servers, n8n scripts, migrations
├── platforms/marketplace/   ← Marketplace config
├── library/                 ← Client workflows, reference data
├── security/                ← Policies, credential rotation
│
├── .cursor/                 ← Agent rules, context, MCP status
└── .claude/skills/          ← Agent skills (rag-pgvector, videoforge-pipeline, spec-driven-dev, ui-ux-pro-max, etc.)
```

**Tools**: `apps/worker/tools/` (pipeline diagnostics), `apps/web/superseller-site/tools/` (aitable sync). No root-level `tools/` or `architecture/`.

---

## 🛠️ TECHNICAL STACK

| Component | Provider | Role |
|-----------|----------|------|
| **Automation** | Antigravity (RackNerd) | Primary workflow execution |
| **Automation (backup)** | n8n (RackNerd) | Use only when Antigravity cannot |
| **Payments** | PayPal REST API v2 | Credits, subscriptions, token ledger |
| **Creative AI** | Kie.ai | Video (Kling 3.0), audio (Suno), compositing (Nano Banana) |
| **App database** | PostgreSQL + pgvector + Redis | All marketplace apps and app backends |
| **RAG** | Ollama nomic-embed-text + pgvector HNSW | Multi-tenant document embeddings, hybrid search |
| **Internal dashboards** | Aitable.ai | Syncs, config, reference data |
| **Frontend** | Next.js, Tailwind, shadcn/ui | SuperSeller AI design system |
| **Deployment** | Vercel | superseller.agency, admin, API |

---

## 📦 MARKETPLACE APPS (Credit-Based SaaS)

**VideoForge** is the first credit-based SaaS app and the **template** for future apps.

For every new marketplace app:
1. Start from `docs/templates/videoforge/` (Blueprint, Implementation Spec, Prompt Playbook).
2. Adapt for purpose and needs — flexibility over rigid copy.
3. Use PostgreSQL for app data (never Aitable.ai for production SaaS).
4. Follow SuperSeller AI design system (query NotebookLM 286f3e4a or 719854ee).

---

## 🌊 B.L.A.S.T. PROTOCOL

**Scope**: New projects, major architecture changes. For routine tasks (fix, deploy, verify), use Agent Behavior—see METHODOLOGY.md.

1. **B**lueprint: Define vision, 5 discovery questions, data schema in brain.md/task_plan.
2. **L**ink: Verify API connections, .env credentials.
3. **A**rchitect: 3-layer A.N.T. (Architecture SOPs → Navigation → Tools).
4. **S**tylize: UI/UX per design tokens, SuperSeller AI style.
5. **T**rigger: Deploy to Vercel/n8n, activate automation.

*Full framework: `docs/frameworks/blast-framework.md` | Single system: `METHODOLOGY.md`*

---

## 📅 INITIALIZATION (Protocol 0)

For new projects, start with BLAST Blueprint phase: define vision, discover integrations, map data flow, and verify the design before coding. **HALT at Blueprint for approval.**

For routine tasks (fix, deploy, verify), skip Protocol 0 and use Agent Behavior directly—see METHODOLOGY.md.

---

## 📚 CANONICAL REFERENCES

**Reference hierarchy**: Query NotebookLM 1dc7ce26 — hierarchy, cross-reference map, sync discipline.

| Topic | Location |
|-------|----------|
| Full technical context | CLAUDE.md |
| B.L.A.S.T. + Design + Error handling | docs/frameworks/blast-framework.md |
| Antigravity skill engineering | docs/frameworks/antigravity-skill-engineering.md |
| Brand identity structure | docs/frameworks/agentic-brand-identity-framework.md |
| VideoForge app template | docs/templates/videoforge/ |
| NotebookLM index | docs/NOTEBOOKLM_INDEX.md |
| n8n workflow catalog | docs/n8n/N8N_WORKFLOWS_CATALOG.md |
| Business coverage index (all tracked elements, SoT map, dashboard mapping) | docs/BUSINESS_COVERAGE_INDEX.md |

---

*When in doubt, read brain.md first. See Authority Precedence table above for conflict resolution.*
