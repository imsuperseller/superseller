# 🧠 SuperSeller AI: Business Coverage Master Index
> **Last Updated**: February 2026 | **Authority**: Tier 3 (see `brain.md`) | **Owned by**: Admin Operations

This document defines the **Source of Truth** for every tracked business and technical element in the SuperSeller AI ecosystem.

For the full interactive version with automation details, see the [Antigravity Artifact](https://antigravity.internal/brain/ef8e3f5c-ae37-4b45-9025-9dc042dcb02a/master_index.md).

---

## Source of Truth (SoT) Legend

| Symbol | Store | Managed By |
|:---:|:---|:---|
| 🐘 | **PostgreSQL** | Auto-logged; Stripe webhooks; n8n/Antigravity outputs |
| 📋 | **Aitable.ai** | Human-editable; AI-summary syncs; business tracking |
| 📚 | **NotebookLM** | Deep-context specs, methodology, creative briefs |
| 💻 | **Codebase** | Config, schemas, CI/CD, agent skills |
| 🆕 | **Missing** | Gap — needs to be created |

---

## I. Infrastructure & Deployments

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Deployments (Vercel, RackNerd) | 💻 | System Monitor |
| Server inventory (each thing on server) | 💻🐘 | Vault & Infra |
| MCP Servers (status, versions) | 💻🐘 | Vault & Infra |
| Logs (deployment, error, access) | 🐘 | System Monitor |
| Routes (API endpoints, webhooks) | 💻 | Vault & Infra |
| Scripts (automation, utility) | 💻 | Vault & Infra |
| Credentials & Secrets (paths only) | 💻 | Vault & Infra |
| Structure (repo map, folder layout) | 💻 | Brain Docs |
| Stack (tech decisions, versions) | 💻📚 | Brain Docs |
| Ports, health endpoints | 💻🐘 | System Monitor |
| Error budgets / SLOs | 🆕 | System Monitor |

---

## II. Design & Brand

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Colors, fonts, style tokens | 💻 | Landing Content |
| Effects, animations, micro-interactions | 💻📚 | Landing Content |
| Tone & language (copy) | 📚 | Brain Docs |
| Wireframes, blueprints | 📚 | Brain Docs |
| Sitemaps | 💻 | Landing Content |
| Tags, SEO indexes | 💻 | Landing Content |
| Layout (page grids, spacing) | 💻📚 | Landing Content |
| Component library | 💻 | Ecosystem Map |
| Brand assets (logo, PDFs) | 💻📚 | Vault & Infra |

---

## III. AI, Agents & Pipelines

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Prompts (system, user, CoT) | 💻📚 | AI Agents |
| LLM models in use (versions, configs) | 💻📋🆕 | AI Agents |
| Internal agents (Terry, SEO, Pipeline) | 💻📚 | AI Agents |
| Pipelines (video, lead, content) | 💻📚🐘 | Workflows |
| Skills (agent capabilities) | 💻 | AI Agents |
| MCP tools (available functions) | 💻📚 | AI Agents |
| AI usage logs (tokens, cost, latency) | 🐘🆕 | Treasury |
| RAG / embeddings (pgvector) | 🐘💻 | AI Agents |
| Model cost tracking | 🐘📋🆕 | Treasury |

---

## IV. Financials & Business

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Expenses | 📋🐘🆕 | Treasury |
| Profits / Revenue | 🐘📋 | Treasury |
| Invoices | 🐘📋 | Treasury |
| Summaries (monthly, quarterly) | 📋🆕 | Treasury |
| Parameters (pricing tiers, limits) | 💻🐘 | Product Factory |
| Reports (financial, performance) | 📋🆕 | Analytics |
| LTV / Customer value predictions | 🆕 | Analytics |
| Stripe product/price catalog | 🐘💻 | Product Factory |

---

## V. Customers & Prospects

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Prospects (leads, qualification) | 🐘📋 | Client CRM |
| Customers (active users) | 🐘 | Client CRM |
| Messages (WhatsApp, email, chat) | 🐘 | Client CRM |
| Customer assets (videos, leads) | 🐘 | Client CRM |
| Onboarding requests | 🐘 | Client CRM |
| Insights (behavior, churn risk) | 🐘📋🆕 | Analytics |
| Support / Issues | 🐘 | Support Queue |
| Consultations | 🐘 | Client CRM |
| Voice call logs | 🐘 | Client CRM |

---

## VI. Products & Platforms

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Templates (marketplace) | 🐘💻 | Product Factory |
| Solutions catalog | 🐘 | Product Factory |
| Service manifests (n8n blueprints) | 🐘💻 | Product Factory |
| Components (UI building blocks) | 💻 | Ecosystem Map |
| Self-service apps (per-product) | 💻🐘 | Ecosystem Map |
| Admin dashboard modules | 💻 | Dashboard |
| User dashboards | 💻🐘 | Ecosystem Map |
| SuperSeller AI-related assets | 💻📚🐘 | Vault & Infra |
| Platforms (Vercel, RackNerd, etc.) | 💻🐘 | Vault & Infra |

---

## VII. Governance & Legal

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Legal (ToS, Privacy, contracts) | 📚📋🆕 | Vault & Infra |
| Rules & instructions (agent rules) | 💻📚 | Brain Docs |
| Security policies | 💻 | Vault & Infra |
| Credential rotation schedule | 📋🆕 | Vault & Infra |
| Compliance checklist | 🆕📋 | Vault & Infra |

---

## VIII. Operations & Monitoring

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| Statuses (workflow, service, customer) | 🐘 | System Monitor |
| Alerts (workflow errors, SLA breach) | 🐘📋🆕 | System Monitor |
| Notifications (customer-facing) | 🐘🆕 | Support Queue |
| Updates (changelog, release notes) | 📋💻🆕 | Launch Control |
| Projects | 📋🐘 | Projects |
| Tasks | 📋🐘 | Projects |
| Research (market, technical) | 📚📋🆕 | Brain Docs |
| Insights (business, product) | 📋🆕 | Analytics |

---

## IX. Knowledge & Documentation

| Item | SoT | Admin Tab |
|:---|:---:|:---|
| MD files (brain, decisions, findings) | 💻 | Brain Docs |
| NotebookLM notebooks | 📚 | Brain Docs |
| Artifacts (plans, walkthroughs) | 💻 | Brain Docs |
| Data tables / schemas | 💻🐘 | Vault & Infra |
| Blueprints (product SSOT) | 📚💻 | Brain Docs |

---

## X. Admin Dashboard Tab Assignments

| Tab | Purpose | Primary Data Sources |
|:---|:---|:---|
| **Dashboard** | Cortex AI Feed, KPI cards | Postgres + Aitable AI summaries |
| **Ecosystem Map** | Products, agents, pipelines (live status) | `ServiceInstance` + `SolutionInstance` |
| **Client CRM** | Full customer timeline, messages, assets | All `userId`-linked tables |
| **Projects** | Kanban synced from Aitable + GitHub | Aitable API + GitHub API |
| **Landing Content** | Design tokens, SEO, sitemap preview | `globals.css` + `sitemap.ts` + NotebookLM Stitch |
| **Product Factory** | Wizard, manifest editor, Stripe sync | `Template` + `ServiceManifest` + Stripe |
| **System Monitor** | Health pings, logs, error rates, MCP | Postgres logs + RackNerd API |
| **Vault & Infra** | Credential map, scripts, server inventory | `CREDENTIAL_REFERENCE.md` + Postgres |
| **Treasury** | Revenue, expenses, AI costs, profits | `Payment` table + Aitable expense table |
| **Analytics** | LTV, churn risk, pipeline conversion | Derived Postgres + AI scoring |
| **Workflows** | n8n / Antigravity state, history | n8n API + Antigravity MCP |
| **AI Agents** | Registry, skill map, token usage | `.claude/skills/` + `UsageEvent` |
| **Support Queue** | Cases, SLA timer, auto-triage | `SupportCase` table |
| **Launch Control** | Release pipeline, feature flags | GitHub + Vercel API |
| **Notebooks Hub** | Query NotebookLM from the dashboard | `notebooklm-mcp` |
| **Governance** | Legal tracker, compliance, credentials | Aitable + `security/` |

---

## XI. NotebookLM Index (Direct Links)

| # | Notebook | Purpose |
|---|---|---|
| 1-15 | **Core Stack** | [See `brain.md` Knowledge Hierarchy] |
| 16 | [**Market Intelligence**](https://notebooklm.google.com/notebook/8df32896-d93b-4a32-961f-40c6fa3ccf7a) | Competitors, ICP, Benchmarks |
| 17 | [**Legal & Compliance**](https://notebooklm.google.com/notebook/7630d154-341b-40a7-9a10-6f9e1f3ddc7d) | ToS, Privacy, Contract History |
| 18 | [**Product Changelog**](https://notebooklm.google.com/notebook/12724368-e4af-488c-a8a3-ce04da043d60) | Release Notes, KM Deployment |
| 19 | [**AI Cost & Performance**](https://notebooklm.google.com/notebook/02c3946b-c69b-423b-b188-9b79ecdd1629) | Benchmarks, Budget Optimization |

---

*Linked from: `brain.md` → `docs/NOTEBOOKLM_INDEX.md` → this file.*
