# 🏗️ THE ARCHITECT'S COMMAND DECK

**Purpose**: Mission Control for Rensto. Top-level authority for all agents (Claude Code, Cursor, Antigravity). Read this first.

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
- **n8n** (RackNerd): Backup/reference only. Use when Antigravity cannot do the task.
- **Kie.ai**: Creative AI (Kling 3.0, Suno, Nano Banana) — credit-based APIs. Veo and FAL are deprecated.
- **Stripe**: Payments, subscriptions, credit ledger.
- **PostgreSQL + Redis**: App backends and marketplace products.
- **Aitable.ai**: Internal dashboards and syncs only (not production app DB).

---

## 🧠 KNOWLEDGE HIERARCHY (NotebookLM Index)

NotebookLM + Stitch MCP are connected to Antigravity. Draw from these notebooks via `notebooklm-mcp`:

| # | Notebook | Purpose |
|---|----------|---------|
| 1 | [5811a372-2d18-4f46-b421-9d026a57205b](https://notebooklm.google.com/notebook/5811a372-2d18-4f46-b421-9d026a57205b) | **B.L.A.S.T. canonical** — Project Template, Agentic Brand Identity, Antigravity Integration, System Blueprint, Skill Engineering, Error Handling. ALL Rensto work (website, infrastructure, products) MUST follow this notebook. Use `notebooklm_notebook_query` to align. |
| 2 | [3e820274-6839-4921-aa83-ad003dd2fb93](https://notebooklm.google.com/notebook/3e820274-6839-4921-aa83-ad003dd2fb93) | **KIE.AI** — API docs, models, usage |
| 3 | [0baf5f36-7ff0-4550-a878-923dbf59de5c](https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c) | **Zillow-to-Video production instructions** — 12 sources. Canonical for pipeline (Nano Banana Pro + Kling 3, no FAL/Veo). |
| 4 | [fc048ba8-12b7-432a-b8d9-65baae62d529](https://notebooklm.google.com/notebook/fc048ba8-12b7-432a-b8d9-65baae62d529) | **Master: Automation & Core Infra** — Antigravity, n8n, automation workflows |
| 5 | [286f3e4a-a3a2-40ab-9c45-d198e91b27f4](https://notebooklm.google.com/notebook/286f3e4a-a3a2-40ab-9c45-d198e91b27f4) | **Google Stitch** — Stitch API, assets |
| 6 | [719854ee-b94e-4555-9b2b-48ae136335b8](https://notebooklm.google.com/notebook/719854ee-b94e-4555-9b2b-48ae136335b8) | **rensto website** — Site content |
| 7 | [e1acc83c-978f-4601-b98a-d4c4b4b9ff50](https://notebooklm.google.com/notebook/e1acc83c-978f-4601-b98a-d4c4b4b9ff50) | **Resources** — Reference materials |
| 8 | [cb99e6aa-967f-40d4-9580-c02b3250bc78](https://notebooklm.google.com/notebook/cb99e6aa-967f-40d4-9580-c02b3250bc78) | **Master: Social Media, Lead Gen & Marketing** — Social Media, FB Marketplace, Profiles |
| 9 | [98b120fa-bc5e-466a-a8d2-7a609c044283](https://notebooklm.google.com/notebook/98b120fa-bc5e-466a-a8d2-7a609c044283) | **aitable.ai** — Dashboards, syncs |
| 10 | [0789acdb-2485-43ec-9b4a-6dc227fcaead](https://notebooklm.google.com/notebook/0789acdb-2485-43ec-9b4a-6dc227fcaead) | **WAHA Pro** — WhatsApp API |
| 11 | [f54f121b-97b1-45b2-8a05-156d1c8ad3f7](https://notebooklm.google.com/notebook/f54f121b-97b1-45b2-8a05-156d1c8ad3f7) | **Apify** — Scraping, actors |
| 12 | [b906e69f-...](https://notebooklm.google.com/notebook/b906e69f) | **Claude Code** — Agent behavior, brain.md hierarchy, tooling |
| 13 | [6bb5f16d-...](https://notebooklm.google.com/notebook/6bb5f16d) | **Kling 3.0** — Cinematic prompt engineering, Video API |
| 14 | [8df32896-d93b-4a32-961f-40c6fa3ccf7a](https://notebooklm.google.com/notebook/8df32896-d93b-4a32-961f-40c6fa3ccf7a) | **Market Intelligence** — Competitor research, pricing trends |
| 15 | [7630d154-341b-40a7-9a10-6f9e1f3ddc7d](https://notebooklm.google.com/notebook/7630d154-341b-40a7-9a10-6f9e1f3ddc7d) | **Legal & Compliance** — TOS, GDPR, domain ownership |
| 16 | [12724368-e4af-488c-a8a3-ce04da043d60](https://notebooklm.google.com/notebook/12724368-e4af-488c-a8a3-ce04da043d60) | **Product Changelog** — Feature releases, migration notes |
| 17 | [02c3946b-c69b-423b-b188-9b79ecdd1629](https://notebooklm.google.com/notebook/02c3946b-c69b-423b-b188-9b79ecdd1629) | **AI Cost & Performance** — LLM benchmarks, cost budgets |

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
├── apps/web/rensto-site/    ← Main Next.js app (rensto.com, admin)
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

**Tools**: `apps/worker/tools/` (pipeline diagnostics), `apps/web/rensto-site/tools/` (aitable sync). No root-level `tools/` or `architecture/`.

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
| **Frontend** | Next.js, Tailwind, shadcn/ui | Rensto design system |
| **Deployment** | Vercel | rensto.com, admin, API |

---

## 📦 MARKETPLACE APPS (Credit-Based SaaS)

**TourReel** is the first credit-based SaaS app and the **template** for future apps.

For every new marketplace app:
1. Start from `docs/templates/tourreel/` (Blueprint, Implementation Spec, Prompt Playbook).
2. Adapt for purpose and needs — flexibility over rigid copy.
3. Use PostgreSQL for app data (never Aitable.ai for production SaaS).
4. Follow Rensto design system (query NotebookLM 286f3e4a or 719854ee).

---

## 🌊 B.L.A.S.T. PROTOCOL

**Scope**: New projects, major architecture changes. For routine tasks (fix, deploy, verify), use Agent Behavior—see METHODOLOGY.md.

1. **B**lueprint: Define vision, 5 discovery questions, data schema in brain.md/task_plan.
2. **L**ink: Verify API connections, .env credentials.
3. **A**rchitect: 3-layer A.N.T. (Architecture SOPs → Navigation → Tools).
4. **S**tylize: UI/UX per design tokens, Rensto style.
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
