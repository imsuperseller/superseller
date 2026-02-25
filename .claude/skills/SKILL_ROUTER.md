# Skill Routing Manifest

Central index for agent skill selection. When a task arrives, use this file to determine which skill(s) to load.

**Total skills**: 27 (26 existing + model-observatory planned)
**Last updated**: 2026-02-24

---

## 1. Complete Skill Index

### Product Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 1 | **tourreel-pipeline** | Real estate video pipeline -- Zillow scraping, Kling 3.0, FFmpeg assembly, clip regen | TourReel, video pipeline, Kling, Kie.ai, clip generation, FFmpeg, listing video, Zillow, floorplan, Nano Banana, Suno | Active |
| 2 | **winner-studio** | AI avatar video for Mivnim/Yossi -- Gemini brain, avatar-pro, lip-sync, WhatsApp delivery | Winner Studio, Spoke, avatar, lip-sync, infinitalk, avatar-pro, Mivnim, Yossi, studio.rensto.com | Active |
| 3 | **marketplace-saas** | FB Marketplace bot SaaS -- multi-tenant posting, GoLogin, Kie.ai image gen, customer isolation | FB Marketplace, marketplace bot, UAD, MissParty, GoLogin, listing generation, marketplace SaaS | Active |
| 4 | **lead-pages** | Dynamic lead landing pages -- /lp/[slug], per-customer branding, lead capture, RTL/LTR | landing page, lead page, /lp/, lead capture, customer branding, lead form, RTL | Active |
| 5 | **frontdesk-voice** | Telnyx AI voice assistant -- telephony routing, conversation polling, call transfer | FrontDesk, Telnyx, voice AI, AI receptionist, phone answering, call transfer, KokoroTTS | Active (partial) |
| 6 | **agentforge** | Multi-stage AI research pipeline -- business discovery, design analysis, market research | AgentForge, research pipeline, website intelligence, client proposal | Spec only |
| 7 | **socialhub** | Multi-platform social media management -- AI content, scheduling, analytics, publishing | SocialHub, social media, content distribution, multi-platform, content calendar | Spec only |

### Infrastructure Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 8 | **deploy-ops** | Deployment and DevOps -- RackNerd SSH/rsync/PM2, Vercel deploys, FFmpeg auto-update | deploy, RackNerd, PM2, rsync, Vercel deploy, VPS, server, health check, 172.245.56.50 | Active |
| 9 | **database-management** | Dual-ORM day-to-day DB work -- Prisma + Drizzle schema sync, queries, shared tables | database, schema, migration, Prisma, Drizzle, PostgreSQL | Active |
| 10 | **migration-validator** | Cross-ORM migration safety -- ensures schema changes compile in both apps before deploy | migration, schema change, deploy failed, build failed, prisma migrate, drizzle migrate, cross-orm | Active |
| 11 | **data-integrity** | Cross-store data consistency -- Postgres/Aitable reconciliation, sync watchdog, drift detection | schema drift, data integrity, data dictionary, sync aitable, data reconciliation, schema sentinel, data mismatch | Active |
| 12 | **api-contracts** | API contract governance -- 80+ endpoint inventory, Zod validation, breaking-change detection | api route, endpoint, api contract, breaking change, api version, route handler, request body | Active |
| 13 | **credential-guardian** | API key lifecycle management -- expiry monitoring, key rotation, connectivity validation | credential, api key, expired, token, secret, 401, unauthorized, key rotation, env var | Active |
| 14 | **monitoring-alerts** | Production monitoring -- 11 services, alert rules, health check persistence, uptime tracking | health check, monitoring, alert, service health, uptime, system monitor, alert rule | Active |
| 15 | **resilience-patterns** | Cross-cutting resilience -- retry, circuit breakers, fallback chains, error budgets, SLA tracking | retry, circuit breaker, fallback, resilience, exponential backoff, API outage, timeout, rate limit | Active |
| 16 | **antigravity-automation** | Primary automation engine -- workflow orchestration, n8n backup, NotebookLM/Stitch integration | Antigravity, automation, workflow orchestration, n8n backup | Active |

### Billing and Cost Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 17 | **stripe-credits** | Stripe billing + credit ledger -- subscriptions ($79/$149/$299), webhooks, usage tracking | credits, stripe, billing, payment, subscription | Active |
| 18 | **cost-tracker** | Operational API cost tracking -- trackExpense(), api_expenses table, anomaly detection, budgets | cost, expense, trackExpense, api_expenses, API spend, budget, generation cost | Active |

### UI/UX Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 19 | **ui-ux-pro-max** | Design intelligence -- 50+ styles, 97 palettes, 57 fonts, 9 stacks, accessibility rules | landing page, dashboard, color palette, design, typography, glassmorphism | Active |
| 20 | **ui-design-workflow** | External UI bridge -- v0/Stitch/screenshot-to-code to Rensto-branded React/Next.js components | v0, Stitch, screenshot to code, rebrand component, external UI, convert design, clone UI | Active |

### Knowledge and AI Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 21 | **notebooklm-hub** | NotebookLM knowledge management -- 36 notebooks, query patterns, auth flow, conflict resolution | NotebookLM, notebook, research, spec, methodology, B.L.A.S.T, query notebook | Active |
| 22 | **rag-pgvector** | RAG stack -- pgvector + Ollama + LiteLLM, HNSW indexing, multi-tenant document stores | RAG, pgvector, vector search, embedding, Ollama, LiteLLM, semantic search, HNSW | Active |
| 23 | **model-observatory** | AI model tracking -- capability matrix, cost/quality benchmarks, model selection guidance | model comparison, Kling version, model selection, AI model, benchmark, model cost | Planned |

### Customer and Portal Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 24 | **customer-journey** | Customer lifecycle pipeline -- 4-stage funnel, provisioning, magic-link auth, entitlements | onboarding, provisioning, customer journey, entitlements, customer dashboard, subscription management | Active |
| 25 | **admin-portal** | Admin dashboard at admin.rensto.com -- 8 tabs, CRM, treasury, workflow management, 23 API routes | admin, admin dashboard, admin portal, admin.rensto.com, AdminLayout, admin tab | Active |

### Communication Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 26 | **whatsapp-waha** | WhatsApp via WAHA Pro -- message sending, session management, OTP auth, lead notifications | WhatsApp, WAHA, OTP, sendText, sendVideo, WhatsApp notification | Active |

### Meta Skills

| # | Skill | Purpose | Trigger Keywords | Status |
|---|-------|---------|-----------------|--------|
| 27 | **skill-template** | Scaffold for creating new skills -- copy and customize | (manual use only) | Template |

---

## 2. Decision Tree -- Task to Skill Routing

Use this tree to map incoming tasks to the correct skill(s).

### Video Generation

```
"Generate a video" / "TourReel" / "real estate video"
  --> tourreel-pipeline (pipeline logic)
    + cost-tracker (MANDATORY: log every API call cost)
    + model-observatory (model selection, when available)
    + deploy-ops (if deploying worker changes)

"Avatar video" / "Winner Studio" / "Spoke" / "lip-sync"
  --> winner-studio (studio pipeline)
    + cost-tracker (MANDATORY: log costs)
    + whatsapp-waha (delivery to customer)
```

### Deployment

```
"Deploy to server" / "RackNerd" / "PM2"
  --> deploy-ops (primary)
    + migration-validator (if schema changes are included)
    + monitoring-alerts (post-deploy health check validation)

"Deploy to Vercel" / "frontend deploy"
  --> deploy-ops (primary)
```

### Database Work

```
"Add a column" / "write a query" / "day-to-day schema work"
  --> database-management

"Running a migration" / "deploying schema changes" / "build failing on schema"
  --> migration-validator (ensures both ORMs compile)
    + database-management (for the actual schema work)

"Data out of sync" / "records missing" / "Aitable mismatch" / "schema drift"
  --> data-integrity (cross-store reconciliation)
    + database-management (if schema fix needed)
```

### UI/UX Work

```
"Design a page" / "choose colors" / "pick typography" / "design system"
  --> ui-ux-pro-max (design intelligence and decisions)

"Convert a v0/Stitch output to Rensto code" / "clone a UI from screenshot"
  --> ui-design-workflow (execution bridge)
    + ui-ux-pro-max (for brand/style decisions)

"Build a customer landing page" / "/lp/ route"
  --> lead-pages (landing page infrastructure)
    + ui-ux-pro-max (design decisions)
```

### Payments and Billing

```
"Stripe webhook" / "subscription" / "credits" / "billing page"
  --> stripe-credits (customer-facing billing)

"How much did API calls cost?" / "trackExpense" / "API budget"
  --> cost-tracker (operational cost tracking)

"Wire billing for a new product"
  --> stripe-credits (Stripe integration)
    + customer-journey (provisioning and entitlements)
```

### API Work

```
"New API endpoint" / "modify a route" / "breaking change"
  --> api-contracts (governance, validation, types)
    + database-management (if new tables/columns needed)
    + credential-guardian (if new external API keys involved)

"401 error" / "API key expired" / "unauthorized"
  --> credential-guardian (first -- fix auth)
    + api-contracts (if the route itself needs fixing)
```

### Automation

```
"New automation workflow" / "Antigravity"
  --> antigravity-automation (primary engine)

"Existing n8n workflow issue" / "FB Bot lead pipeline"
  --> antigravity-automation (has n8n backup patterns)
```

### Monitoring and Resilience

```
"Service down" / "health check failing" / "uptime"
  --> monitoring-alerts (detection and alerting)

"API timing out" / "Kie.ai down" / "add retry logic"
  --> resilience-patterns (retry, circuit breaker, fallback)
    + monitoring-alerts (if alerting on the outage)
```

### Admin and Customer Portals

```
"Admin dashboard" / "admin tab" / "admin.rensto.com"
  --> admin-portal

"Customer dashboard" / "onboarding" / "provisioning"
  --> customer-journey
```

### Knowledge and Research

```
"Query NotebookLM" / "check the spec" / "methodology"
  --> notebooklm-hub

"Set up RAG" / "vector search" / "embeddings"
  --> rag-pgvector
```

### Communication

```
"Send WhatsApp message" / "WAHA" / "OTP"
  --> whatsapp-waha

"Voice AI" / "phone answering" / "Telnyx"
  --> frontdesk-voice
```

### Marketplace

```
"FB Marketplace" / "listing bot" / "GoLogin"
  --> marketplace-saas
```

---

## 3. Skill Combinations -- Common Multi-Skill Workflows

These are the most frequent scenarios where multiple skills work together.

### TourReel Video Job (end-to-end)

| Skill | Role |
|-------|------|
| tourreel-pipeline | Core pipeline logic, Kling generation, FFmpeg assembly |
| cost-tracker | Log every Kling/Suno/Nano/Gemini API call cost (MANDATORY) |
| model-observatory | Model selection and capability checks (when available) |
| deploy-ops | Deploy worker changes to RackNerd |
| resilience-patterns | Handle Kie.ai outages, retry logic |
| monitoring-alerts | Validate worker health post-deploy |

### New API Endpoint

| Skill | Role |
|-------|------|
| api-contracts | Route design, Zod validation, type definitions |
| database-management | New tables/columns if needed |
| credential-guardian | External API key setup if calling third-party services |
| admin-portal | If the endpoint serves admin.rensto.com |

### Schema Migration (safe deploy)

| Skill | Role |
|-------|------|
| database-management | Write the migration in Prisma or Drizzle |
| migration-validator | Verify both ORMs compile, run schema-sentinel |
| data-integrity | Check for cross-store drift after migration |
| deploy-ops | Deploy with confidence |

### Admin Dashboard Feature

| Skill | Role |
|-------|------|
| admin-portal | Tab structure, component patterns, admin API routes |
| monitoring-alerts | System Monitor tab, health check display |
| ui-ux-pro-max | Design decisions for new admin UI |

### Customer Onboarding Flow

| Skill | Role |
|-------|------|
| customer-journey | Funnel stages, provisioning, entitlements |
| stripe-credits | Stripe webhooks, subscription creation |
| lead-pages | Landing page for customer acquisition |
| whatsapp-waha | Welcome notifications |

### Winner Studio Generation

| Skill | Role |
|-------|------|
| winner-studio | Avatar generation, Gemini brain, Kie.ai calls |
| cost-tracker | Log generation costs (MANDATORY) |
| whatsapp-waha | Deliver final video to customer |
| resilience-patterns | Handle avatar-pro fallback chain |

### FB Marketplace Automation

| Skill | Role |
|-------|------|
| marketplace-saas | Bot logic, multi-tenant posting, product config |
| deploy-ops | Deploy bot changes to RackNerd |
| monitoring-alerts | Bot health monitoring |
| credential-guardian | GoLogin sessions, FB tokens |

### New Product Launch

| Skill | Role |
|-------|------|
| stripe-credits | Billing plan, credit pricing |
| customer-journey | Onboarding flow, provisioning |
| admin-portal | Admin management interface |
| api-contracts | Product API endpoints |
| database-management | Product schema |
| lead-pages | Product landing page |
| ui-ux-pro-max | Design system for product UI |

---

## 4. Known Overlaps and Disambiguation

### Database Skills (3-way overlap)

| Scenario | Use This | Not This |
|----------|----------|----------|
| Day-to-day: add column, write query, fix a type | **database-management** | migration-validator, data-integrity |
| Deploy-time: ensure both ORMs compile after schema change | **migration-validator** | database-management (use alongside, not instead) |
| Post-deploy: records missing, Aitable out of sync, drift detected | **data-integrity** | database-management |
| Schema Sentinel tool (`schema-sentinel.ts`) | **data-integrity** (owns the tool) | migration-validator (consumes its output) |

**Rule**: database-management = the schema itself. migration-validator = safe deployment of changes. data-integrity = correctness of data across stores.

### Cost Skills (billing vs operational)

| Scenario | Use This | Not This |
|----------|----------|----------|
| Customer sees their bill, buys credits, subscription management | **stripe-credits** | cost-tracker |
| Logging what Rensto pays for Kling/Suno/Gemini API calls | **cost-tracker** | stripe-credits |
| "How much does a TourReel video cost us to produce?" | **cost-tracker** | stripe-credits |
| "How much does a TourReel video cost the customer?" | **stripe-credits** | cost-tracker |

**Rule**: stripe-credits = customer-facing money flow. cost-tracker = internal operational expense.

### UI Skills (intelligence vs execution)

| Scenario | Use This | Not This |
|----------|----------|----------|
| "Choose a color palette for the dashboard" | **ui-ux-pro-max** | ui-design-workflow |
| "What typography should we use?" | **ui-ux-pro-max** | ui-design-workflow |
| "Take this v0 output and make it match Rensto brand" | **ui-design-workflow** | ui-ux-pro-max (use alongside) |
| "Clone this competitor's page layout" | **ui-design-workflow** | ui-ux-pro-max |
| Building a new page from scratch | **Both**: ui-ux-pro-max for decisions, ui-design-workflow for execution | -- |

**Rule**: ui-ux-pro-max = what to design (style, palette, fonts, accessibility). ui-design-workflow = how to build it (tool bridges, code conversion).

### Monitoring vs Resilience

| Scenario | Use This | Not This |
|----------|----------|----------|
| "Set up alerts for when Kie.ai is down" | **monitoring-alerts** | resilience-patterns |
| "Add retry logic when Kie.ai returns 500" | **resilience-patterns** | monitoring-alerts |
| "Kie.ai is down, what do we do?" | **Both**: resilience-patterns for fallback, monitoring-alerts for alerting | -- |

**Rule**: monitoring-alerts = detection and notification. resilience-patterns = self-healing code behavior.

### Automation

| Scenario | Use This | Not This |
|----------|----------|----------|
| Build new automation workflow | **antigravity-automation** | (never n8n for new production) |
| Fix existing FB Bot lead pipeline in n8n | **antigravity-automation** (has n8n patterns) | -- |
| Prototype a quick integration | **antigravity-automation** (n8n acceptable for prototyping) | -- |

### Landing Pages vs Customer Journey

| Scenario | Use This | Not This |
|----------|----------|----------|
| Build a /lp/[slug] page with branding and form | **lead-pages** | customer-journey |
| Wire what happens after form submission (provisioning) | **customer-journey** | lead-pages |
| Customer dashboard after signup | **customer-journey** | lead-pages |

---

## 5. Inactive Skills

These skills have specifications written but no production code. Use them for planning and scaffolding only.

| Skill | Status | What Exists | What Does Not |
|-------|--------|-------------|---------------|
| **agentforge** | Spec only | SKILL.md with full architecture, pipeline stages, credit pricing | No app code, no API routes, no UI |
| **socialhub** | Spec only | SKILL.md with 7 spec docs, multi-platform architecture | No app code, no API routes, no UI |
| **model-observatory** | Planned | Not yet created | No SKILL.md, no code |

When working on these products, load the skill for architectural guidance but expect to write all implementation code from scratch.

---

## 6. Quick Lookup -- "I need to..."

| Task | Primary Skill | Supporting Skills |
|------|--------------|-------------------|
| Generate a TourReel video | tourreel-pipeline | cost-tracker, model-observatory |
| Generate an avatar video | winner-studio | cost-tracker, whatsapp-waha |
| Deploy worker to RackNerd | deploy-ops | monitoring-alerts |
| Deploy frontend to Vercel | deploy-ops | -- |
| Add a database column | database-management | migration-validator |
| Run a migration safely | migration-validator | database-management, data-integrity |
| Fix data sync issues | data-integrity | database-management |
| Add an API endpoint | api-contracts | database-management, credential-guardian |
| Handle an API outage | resilience-patterns | monitoring-alerts |
| Set up health checks | monitoring-alerts | deploy-ops |
| Design a new page | ui-ux-pro-max | ui-design-workflow |
| Convert external UI to code | ui-design-workflow | ui-ux-pro-max |
| Build a lead landing page | lead-pages | ui-ux-pro-max |
| Set up Stripe billing | stripe-credits | customer-journey |
| Track API costs | cost-tracker | -- |
| Rotate an API key | credential-guardian | -- |
| Send WhatsApp message | whatsapp-waha | -- |
| Set up voice AI | frontdesk-voice | -- |
| Build FB Marketplace feature | marketplace-saas | deploy-ops |
| Create automation workflow | antigravity-automation | -- |
| Query specs/methodology | notebooklm-hub | -- |
| Set up vector search | rag-pgvector | database-management |
| Onboard a new customer | customer-journey | stripe-credits, lead-pages |
| Build admin feature | admin-portal | monitoring-alerts, ui-ux-pro-max |
| Launch a new product | stripe-credits | customer-journey, admin-portal, api-contracts, database-management |
