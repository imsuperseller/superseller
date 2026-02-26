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

**Core Stack**:
- **Antigravity** (RackNerd): Primary automation. Executes workflows, builds apps.
- **n8n** (RackNerd): Backup for new automation. Existing production workflows (FB Bot lead pipeline) still run on n8n.
- **Kie.ai**: Creative AI (Kling 3.0, Suno, Nano Banana) — credit-based APIs. Veo and FAL are deprecated.
- **Stripe**: Payments, subscriptions, credit ledger.
- **PostgreSQL + Redis**: App backends and marketplace products.
- **Aitable.ai**: Internal dashboards and syncs only (not production app DB).

---

## 🧠 KNOWLEDGE HIERARCHY (NotebookLM Index)

NotebookLM + Stitch MCP are connected to Antigravity. Draw from these notebooks via `notebooklm-mcp`. **36 notebooks total** (32 active, 4 empty).

### Core SuperSeller AI (8 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 1 | [5811a372-2d18-4f46-b421-9d026a57205b](https://notebooklm.google.com/notebook/5811a372-2d18-4f46-b421-9d026a57205b) | **B.L.A.S.T. canonical** — Project Template, Agentic Brand Identity, Antigravity Integration, System Blueprint, Skill Engineering, Error Handling. ALL SuperSeller AI work MUST follow this notebook. Use `notebooklm_notebook_query` to align. |
| 2 | [0baf5f36-7ff0-4550-a878-923dbf59de5c](https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c) | **Zillow-to-Video** — TourReel pipeline spec (23 sources). Canonical for pipeline (Nano Banana Pro + Kling 3, no FAL/Veo). |
| 3 | [3e820274-6839-4921-aa83-ad003dd2fb93](https://notebooklm.google.com/notebook/3e820274-6839-4921-aa83-ad003dd2fb93) | **KIE.AI** — API docs, models, usage (40 sources) |
| 4 | [fc048ba8-12b7-432a-b8d9-65baae62d529](https://notebooklm.google.com/notebook/fc048ba8-12b7-432a-b8d9-65baae62d529) | **Master: Automation & Core Infra** — Antigravity, n8n, automation workflows (39 sources) |
| 5 | [cb99e6aa-967f-40d4-9580-c02b3250bc78](https://notebooklm.google.com/notebook/cb99e6aa-967f-40d4-9580-c02b3250bc78) | **Master: Social Media, Lead Gen & Marketing** — FB Bot, social (50 sources) **AT MAX (50/50)** |
| 6 | [719854ee-b94e-4555-9b2b-48ae136335b8](https://notebooklm.google.com/notebook/719854ee-b94e-4555-9b2b-48ae136335b8) | **superseller website** — Site content (30 sources) |
| 7 | [12724368-e4af-488c-a8a3-ce04da043d60](https://notebooklm.google.com/notebook/12724368-e4af-488c-a8a3-ce04da043d60) | **SuperSeller AI Product Changelog** — Feature releases (3 sources) |
| 8 | [b906e69f-7b8c-4e31-88b8-4939c830604c](https://notebooklm.google.com/notebook/b906e69f-7b8c-4e31-88b8-4939c830604c) | **Claude Code** — Agent behavior, brain.md hierarchy, tooling (10 sources) |

### Customer / Business (6 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 9 | [e109bcb2-d29e-44d5-bd4a-f67b88929be6](https://notebooklm.google.com/notebook/e109bcb2-d29e-44d5-bd4a-f67b88929be6) | **mivnim (yossi laham)** — Winner Studio customer (38 sources) |
| 10 | [b42dabb0-62d5-4381-aa9c-ccd4fa9b1f46](https://notebooklm.google.com/notebook/b42dabb0-62d5-4381-aa9c-ccd4fa9b1f46) | **AC & C HVAC** — SuperSeller AI Pitch for Eliran Matzrafi, prospect (2 sources) |
| 11 | [6a4eb203-9479-4919-869f-7a83489ff0af](https://notebooklm.google.com/notebook/6a4eb203-9479-4919-869f-7a83489ff0af) | **לידים יורם פרידמן** — Leads (10 sources) |
| 12 | [8df32896-d93b-4a32-961f-40c6fa3ccf7a](https://notebooklm.google.com/notebook/8df32896-d93b-4a32-961f-40c6fa3ccf7a) | **SuperSeller AI Market Intelligence** — Competitor research, pricing trends (3 sources) |
| 13 | [02c3946b-c69b-423b-b188-9b79ecdd1629](https://notebooklm.google.com/notebook/02c3946b-c69b-423b-b188-9b79ecdd1629) | **SuperSeller AI AI Cost & Performance** — LLM benchmarks, cost budgets (3 sources) |
| 14 | [7630d154-341b-40a7-9a10-6f9e1f3ddc7d](https://notebooklm.google.com/notebook/7630d154-341b-40a7-9a10-6f9e1f3ddc7d) | **SuperSeller AI Legal & Compliance** — TOS, GDPR, domain ownership (3 sources) |

### Tools & APIs (7 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 15 | [f54f121b-97b1-45b2-8a05-156d1c8ad3f7](https://notebooklm.google.com/notebook/f54f121b-97b1-45b2-8a05-156d1c8ad3f7) | **Apify** — Scraping, actors (23 sources) |
| 16 | [0789acdb-2485-43ec-9b4a-6dc227fcaead](https://notebooklm.google.com/notebook/0789acdb-2485-43ec-9b4a-6dc227fcaead) | **WAHA Pro** — WhatsApp API (14 sources) |
| 17 | [286f3e4a-a3a2-40ab-9c45-d198e91b27f4](https://notebooklm.google.com/notebook/286f3e4a-a3a2-40ab-9c45-d198e91b27f4) | **Google Stitch** — Stitch API, assets (9 sources) |
| 18 | [6bb5f16d-22b8-42c4-a479-0bcf60aa314d](https://notebooklm.google.com/notebook/6bb5f16d-22b8-42c4-a479-0bcf60aa314d) | **Kling 3.0** — Cinematic prompt engineering (2 sources) |
| 19 | [98b120fa-bc5e-466a-a8d2-7a609c044283](https://notebooklm.google.com/notebook/98b120fa-bc5e-466a-a8d2-7a609c044283) | **aitable.ai** — Dashboards, syncs (9 sources) |
| 20 | [f39b9a6b-5225-4287-a591-7a99b601dae3](https://notebooklm.google.com/notebook/f39b9a6b-5225-4287-a591-7a99b601dae3) | **higgsfield.ai** — Video AI reference (18 sources) |
| 21 | [f540f799-8346-4756-b560-352183e51f1b](https://notebooklm.google.com/notebook/f540f799-8346-4756-b560-352183e51f1b) | **sora2** — Sora video AI (21 sources) |

### Learning & Reference (11 notebooks)

| # | Notebook | Purpose |
|---|----------|---------|
| 22 | [749832c6-a85d-49a4-98da-1585ee7e325a](https://notebooklm.google.com/notebook/749832c6-a85d-49a4-98da-1585ee7e325a) | **design prompts** — UI/UX design (49 sources) |
| 23 | [44494df5-e465-4ed7-bcc7-41898fe8e396](https://notebooklm.google.com/notebook/44494df5-e465-4ed7-bcc7-41898fe8e396) | **Mastering Claude Code: AntiGravity Workflows** (4 sources) |
| 24 | [9222cc37-caf6-4ca6-8d28-924c16af82bc](https://notebooklm.google.com/notebook/9222cc37-caf6-4ca6-8d28-924c16af82bc) | **Mastering Claude Code: Agentic Workflows and Skills** (5 sources) |
| 25 | [e1acc83c-978f-4601-b98a-d4c4b4b9ff50](https://notebooklm.google.com/notebook/e1acc83c-978f-4601-b98a-d4c4b4b9ff50) | **Resources** — Reference materials (6 sources) |
| 26 | [f0747c8b-1dd1-4451-8a02-9b1231c82dac](https://notebooklm.google.com/notebook/f0747c8b-1dd1-4451-8a02-9b1231c82dac) | **prd template** — PRD templates (6 sources) |
| 27 | [7d06c748-49ce-4801-be5c-672a56a420a2](https://notebooklm.google.com/notebook/7d06c748-49ce-4801-be5c-672a56a420a2) | **AgentForge** — AI research pipeline (7 sources) |
| 28 | [382e5982-ef37-4fe8-bbc0-e16abfd4b755](https://notebooklm.google.com/notebook/382e5982-ef37-4fe8-bbc0-e16abfd4b755) | **Instagram** (7 sources) |
| 29 | [b666ec88-6fbd-4dc7-b24a-c5720c0bd1e7](https://notebooklm.google.com/notebook/b666ec88-6fbd-4dc7-b24a-c5720c0bd1e7) | **Rentahuman** (4 sources) |
| 30 | [e99673f2-32b2-4759-9cc5-90694cd18f2f](https://notebooklm.google.com/notebook/e99673f2-32b2-4759-9cc5-90694cd18f2f) | **joinsecret worthy deals?** (8 sources) |
| 31 | [0996f6ab-a403-4d21-93f5-d1737ccb8f17](https://notebooklm.google.com/notebook/0996f6ab-a403-4d21-93f5-d1737ccb8f17) | **stack** (1 source) |
| 32 | [e419bca1-17d8-4edf-a1ac-ff1d37cd67ea](https://notebooklm.google.com/notebook/e419bca1-17d8-4edf-a1ac-ff1d37cd67ea) | **Israeli Expatriates in Dallas** (1 source) |

### Empty Notebooks (4 notebooks -- EMPTY, populate or delete)

| # | Notebook | Purpose |
|---|----------|---------|
| 33 | [b4974f45-5809-4a2f-b7be-8c4a3eddd98e](https://notebooklm.google.com/notebook/b4974f45-5809-4a2f-b7be-8c4a3eddd98e) | **Master: SuperSeller AI Business Operations** — EMPTY (0 sources, created Feb 20) |
| 34 | [df1029dd-7dc0-4466-8f93-6111d99a3526](https://notebooklm.google.com/notebook/df1029dd-7dc0-4466-8f93-6111d99a3526) | **Master: Templates & Design** — EMPTY (0 sources, created Feb 20) |
| 35 | [2b5ed4df-6ef2-4a45-8e06-7ccaf8d26d50](https://notebooklm.google.com/notebook/2b5ed4df-6ef2-4a45-8e06-7ccaf8d26d50) | **Master: AI Media APIs** — EMPTY (0 sources, created Feb 20) |
| 36 | [8ace0529-3819-4325-8013-d7127f3053bc](https://notebooklm.google.com/notebook/8ace0529-3819-4325-8013-d7127f3053bc) | **tiktok** — EMPTY (0 sources, created Feb 20) |

*Map notebook IDs to purpose in `docs/NOTEBOOKLM_INDEX.md`. Use `source_get_content` to extract key modules as Markdown to save tokens.*

**Codebase vs NotebookLM**: See [`CODEBASE_VS_NOTEBOOKLM.md`](CODEBASE_VS_NOTEBOOKLM.md). Codebase = IDE essentials (paths, env, routers). NotebookLM = specs, methodology, references. When in doubt → query notebooks.

---

## ⚡ EXECUTIVE OPERATING PROTOCOL

**Before every response:** If the conversation has been summarized or spans many messages, query NotebookLM 5811a372 for agent behavior and completion rules.

- **Mode: Executive**. Do not ask permission for small technical fixes. Propose a **Plan Artifact**, then execute. When the user gives access (credentials, APIs), USE it — do not ask clarifying questions or send instructions back.
- **Conflict Resolution Rule**: When NotebookLM (The Vision) and local code (The Reality) disagree:
  1. **Compare**: Highlight the contradiction.
  2. **Fix**: Propose the change that aligns with the North Star.
  3. **Test**: Verify the fix in terminal/browser.
  4. **Learn**: Update `findings.md` with root cause so the mistake never repeats.
- **Anti-Disorganization Guardrail**: Never start a new feature until the current one has a "Working Demo" or verifiable Artifact. No zombie half-finished files.
- **Data-First Rule**: When writing *new* scripts in `tools/`, define JSON schema first (B.L.A.S.T. Blueprint). For routine fixes to existing tools, use Agent Behavior—no HALT.

### Agent Completion Rules (from NotebookLM 5811a372)

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
│   ├── templates/tourreel/  ← Blueprint, Implementation Spec, Prompt Playbook
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
└── .claude/skills/          ← Agent skills (rag-pgvector, tourreel-pipeline, stripe-credits, ui-ux-pro-max, etc.)
```

**Tools**: `apps/worker/tools/` (pipeline diagnostics), `apps/web/superseller-site/tools/` (aitable sync). No root-level `tools/` or `architecture/`.

---

## 🛠️ TECHNICAL STACK

| Component | Provider | Role |
|-----------|----------|------|
| **Automation** | Antigravity (RackNerd) | Primary workflow execution |
| **Automation (backup)** | n8n (RackNerd) | Use only when Antigravity cannot |
| **Payments** | Stripe | Credits, subscriptions, token ledger |
| **Creative AI** | Kie.ai | Video (Kling 3.0), audio (Suno), compositing (Nano Banana) |
| **App database** | PostgreSQL + pgvector + Redis | All marketplace apps and app backends |
| **RAG** | Ollama nomic-embed-text + pgvector HNSW | Multi-tenant document embeddings, hybrid search |
| **Internal dashboards** | Aitable.ai | Syncs, config, reference data |
| **Frontend** | Next.js, Tailwind, shadcn/ui | SuperSeller AI design system |
| **Deployment** | Vercel | superseller.agency, admin, API |

---

## 📦 MARKETPLACE APPS (Credit-Based SaaS)

**TourReel** is the first credit-based SaaS app and the **template** for future apps.

For every new marketplace app:
1. Start from `docs/templates/tourreel/` (Blueprint, Implementation Spec, Prompt Playbook).
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

Before any code:
1. **North Star**: Singular desired outcome?
2. **Integrations**: External keys (Stripe, Kie.ai) ready?
3. **Source of Truth**: Where does primary data live?
4. **Delivery Payload**: Where is the final result delivered?
5. **Behavioral Rules**: Any "Do Not" constraints?

Initialize `task_plan.md`, `findings.md`, `progress.md`. **HALT** until Blueprint is verified. *(For routine tasks, skip Protocol 0—see METHODOLOGY.md.)*

---

## 📚 CANONICAL REFERENCES

**Reference hierarchy**: Query NotebookLM 5811a372 — hierarchy, cross-reference map, sync discipline.

| Topic | Location |
|-------|----------|
| Full technical context | CLAUDE.md |
| B.L.A.S.T. + Design + Error handling | docs/frameworks/blast-framework.md |
| Antigravity skill engineering | docs/frameworks/antigravity-skill-engineering.md |
| Brand identity structure | docs/frameworks/agentic-brand-identity-framework.md |
| TourReel app template | docs/templates/tourreel/ |
| NotebookLM index | docs/NOTEBOOKLM_INDEX.md |
| n8n workflow catalog | docs/n8n/N8N_WORKFLOWS_CATALOG.md |
| Business coverage index (all tracked elements, SoT map, dashboard mapping) | docs/BUSINESS_COVERAGE_INDEX.md |

---

*When in doubt, read brain.md first. See Authority Precedence table above for conflict resolution.*
