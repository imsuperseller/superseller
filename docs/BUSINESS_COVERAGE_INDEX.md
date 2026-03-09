# SuperSeller AI — Business Coverage Navigation Map

> **Purpose**: Concrete file-location map. "Where do I find X?" → look here first.
> **Last Updated**: March 8, 2026
> **Rule**: Every product, customer, and system has ONE primary doc + supplementary files listed below.

---

## HOW TO USE THIS

1. Find the product/customer/topic below
2. Go to **Primary doc** first — it has the full context
3. Use **Supplementary** for code, credentials, or spec details
4. If something is missing here, add it — this is a living map

---

## PRODUCTS

### VideoForge — AI Property Videos
- **Primary doc**: `PRODUCT_STATUS.md` §4
- **Pipeline spec**: `docs/REMOTION_BIBLE.md` (Remotion path), NotebookLM `0baf5f36` (Kling path)
- **Code (worker)**: `apps/worker/src/workers/video-pipeline.worker.ts`
- **Code (web)**: `apps/web/superseller-site/src/app/api/jobs/`
- **Cost tracking**: `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts`
- **Live URL**: https://superseller.agency/video/create
- **Worker health**: http://172.245.56.50:3002/api/health
- **Status**: LIVE, quality fixes applied but NOT end-to-end validated (need 1 test job + full infra audit)

### FB Marketplace Bot — Miss Party + UAD
- **Primary doc**: `PRODUCT_STATUS.md` §1 (feature matrix, scores, configs)
- **Platform bible**: `platforms/marketplace/PLATFORM_BIBLE.md`
- **Bot config** (local): `fb-marketplace-lister/deploy-package/bot-config.json`
- **Bot config** (server): `/opt/fb-marketplace-bot/bot-config.json`
- **Server code**: `/opt/fb-marketplace-bot/` (PM2: webhook-server, fb-scheduler, image-pool, cookie-monitor)
- **n8n workflows (DO NOT TOUCH)**: UAD `U6EZ2iLQ4zCGg31H`, MissParty `9gfvZo9sB4b3pMWQ` (Telnyx voice pipelines)
- **Status**: Verified posting Mar 8. UAD 5/5, Miss Party 3/3, all exit 0.

### ClaudeClaw — WhatsApp AI Bridge
- **Primary doc**: `PRODUCT_STATUS.md` §6, `MEMORY.md` §ClaudeClaw
- **Service files** (all in `apps/worker/src/services/`):
  - `group-agent.ts` — orchestrator, group registry, system prompt builder
  - `group-memory.ts` — 3-tier memory (buffer + pgvector + profiles)
  - `guardrails.ts` — 4-layer output/input filters
  - `approval-service.ts` — token-based WhatsApp approval flow
  - `rag-ingestor.ts` — health context + full ingestion jobs
  - `claudeclaw-router.ts` — RAG enrichment + mode-specific prompts
- **Wired into**: `apps/worker/src/workers/claudeclaw.worker.ts`
- **DB tables**: `group_messages`, `tenant_profiles`, `group_agent_config`, `approval_requests`
- **Elite Pro group**: chatId `120363408376076110@g.us`, tenant `elite-pro-remodeling`
- **Status**: ✅ FULLY OPERATIONAL as of Mar 8, 2026

### SocialHub / Buzz
- **Primary doc**: `PRODUCT_STATUS.md` §5
- **Code**: `apps/web/superseller-site/src/app/api/social/`
- **Instagram rules**: `docs/INSTAGRAM_RULES_2025_2026.md` (research), `tools/seed-ig-content-rules.ts` (seed script)
- **Instagram DB tables**: `ig_content_rules` (44 rules), `hashtag_sets` (10 sets), `caption_templates` (8 templates)
- **Status**: Phase 1 LIVE (text+image → WhatsApp approval → FB publish)

### Winner Studio — Avatar Videos
- **Primary doc**: `PRODUCT_STATUS.md` §7
- **Code**: `apps/studio/`
- **Live URL**: https://studio.superseller.agency
- **Customer**: Yossi (Mivnim) — PAUSED until Pesach April 2026

### FrontDesk Voice AI
- **Primary doc**: `PRODUCT_STATUS.md` §9
- **Telnyx**: Phone +14699299314, Assistant `assistant-f2838322-edfa-4c22-9997-ca53b151175f`
- **Status**: Partial — voice works, webhook migration n8n → worker PENDING

### Lead Landing Pages (Landing Page Creation Service)
- **Primary doc**: `PRODUCT_STATUS.md` §8
- **Skill**: `.claude/skills/lead-pages/SKILL.md`
- **Code**: `apps/web/superseller-site/src/app/lp/[slug]/`, `LandingPageClient.tsx`
- **Product spec**: `docs/PRODUCT_BIBLE.md` §Landing Pages
- **Yoram live**: https://yoramfriedman.co.il
- **Status**: READY FOR SALE — infrastructure complete, design upgrade needed (5.2/10 visual quality)
- **Service tiers**: Starter $500, Pro $1,000, Enterprise $2,000+ (see `DECISIONS.md` §21)

### AgentForge
- **Primary doc**: `docs/PRODUCT_BIBLE.md` §AgentForge
- **Status**: Spec only — code NOT started

---

## CUSTOMERS

### Elite Pro Remodeling ($2,000/mo — SIGNED, not started)
- **Primary doc**: `docs/customer-projects/elite-pro-remodeling.md`
- **Customer profile**: `projects/6-customer-projects/CUSTOMERS.md` §1
- **Demo video**: R2 `elite-pro-demo/elite-pro-v12-final.mp4` (25.7s, 1080x1920)
- **Landing page**: https://elite-pro-landing.vercel.app
- **eSignatures template**: ID `99de20b5-2bb9-4439-9532-e00902fe6824` — NOT YET SENT
- **Contacts**: Saar Bitton (owner), Mor Dayan (PM) | (800) 476-7608
- **Voice IDs**: Mor `1prnFNmpCkb2bx39pQSi`, Saar `jlOXsp2JeEQ29fkljTTO` (ElevenLabs)
- **WhatsApp group**: `120363408376076110@g.us`
- **Blockers**: Meta App ID/Secret from Saar, Saar/Mor phone numbers, contract not sent

### UAD (David Szender — Garage Doors)
- **Primary doc**: `PRODUCT_STATUS.md` §1
- **Config**: `bot-config.json` — 4 Telnyx phones, 5 posts/15min, 30 DFW cities
- **Revenue**: Split on leads that convert (no fixed fee)
- **Status**: Verified posting Mar 8

### Miss Party (Michal Kacher Szender — Bouncy Castles)
- **Primary doc**: `PRODUCT_STATUS.md` §1
- **Config**: `bot-config.json` — 1 phone, 3 posts/30min
- **Revenue**: FREE (proving value)
- **Status**: Verified posting Mar 8

### Kedem Developments (Daniel Arbel — Luxury Real Estate)
- **Primary doc**: `projects/6-customer-projects/CUSTOMERS.md` §2
- **Status**: VideoForge pilot delivered (6847 Lakeshore Drive video)

### AC&C HVAC (Neitha Parkey)
- **Primary doc**: `projects/6-customer-projects/CUSTOMERS.md` §3
- **Website**: `dist-chi-three-91.vercel.app` (behind password `AcC-Site$2026`)
- **Dashboard**: `dist-dashboard-eight.vercel.app` (login: admin / `AcC-Lead$2026`)
- **Status**: Delivered, behind password gate — needs go-live activation

### Yoram Friedman Insurance (Shai's father)
- **Primary doc**: `projects/6-customer-projects/CUSTOMERS.md` §6
- **Live site**: https://yoramfriedman.co.il
- **GitHub** (account `yoramnfridman1`): `yoram-landing` (live), `yoram-friedman-insurance` (full site)
- **Credentials**: `CREDENTIAL_REFERENCE.md` §Yoram Friedman
- **Apify**: EMPTY — 0 actors, 0 tasks (Israeli insurance scraping not set up)
- **Revenue**: Pay per lead

### Wonder.care (Ortal Flanary — Israeli Healthtech)
- **Primary doc**: `projects/6-customer-projects/CUSTOMERS.md` §5
- **Delivered**: Google Sheets → Monday.com pipeline, n8n VPS (192.227.249.73)
- **Outstanding proposal**: $900-$6,450 across 4 tasks (sent Dec 18, 2025)

### Ortal Pilates (Saar Bitton's wife)
- **Primary doc**: `projects/6-customer-projects/CUSTOMERS.md` §4
- **Site**: https://imsuperseller.github.io/ortal-pilates/ (placeholder data, not operational)

### Rensto Online Directory (Internal — Separate Business)
- **Primary doc**: `MEMORY.md` §Rensto Online Directory
- **Codebase**: `~/rensto - online directory/` (NOT inside superseller repo)
- **GitHub**: `imsuperseller/rensto-app`
- **Live**: rensto.com → RackNerd port 3001 (systemd `rensto`)

---

## INFRASTRUCTURE

### Credentials & Keys
- **Master**: `CREDENTIAL_REFERENCE.md` — ALL keys, paths, API tokens
- **Vercel projects**: `VERCEL_PROJECT_MAP.md`
- **Ports**: `PORT_REFERENCE.md`
- **Environment**: `apps/worker/.env` + `apps/web/superseller-site/.env.local`

### Servers & Services
- **Full infra spec**: `docs/INFRA_SSOT.md`
- **RackNerd IP**: 172.245.56.50
- **WAHA**: port 3000, API key `4fc7e008d7d24fc995475029effc8fa8`
- **PostgreSQL**: `postgres_db` Docker, port 5432, user admin, db `app_db`
- **Redis**: `redis_cache` Docker, port 6379
- **Ollama**: systemd, port 11434
- **PM2 processes**: tourreel-worker, webhook-server, fb-scheduler, image-pool, cookie-monitor

### Database Schemas
- **Prisma** (web): `apps/web/superseller-site/prisma/schema.prisma`
- **Drizzle** (worker): `apps/worker-packages/db/src/schema.ts`
- **Drift detector**: `npx tsx tools/schema-sentinel.ts`

### Deployment
- **Worker deploy**: `./apps/worker/deploy-to-racknerd.sh`
- **Web deploy**: `cd apps/web/superseller-site && vercel --prod`
- **Health checks**: `CLAUDE.md` §6

---

## KEY DOCS (Read When Lost)

| Question | File |
|----------|------|
| What's the current priority order? | `PRODUCT_STATUS.md` top section |
| What are the current blockers? | `PRODUCT_STATUS.md` §Critical Technical Blockers |
| Where is credential X? | `CREDENTIAL_REFERENCE.md` |
| What did we decide about Y? | `DECISIONS.md` |
| What broke and how did we fix it? | `findings.md` |
| Which Vercel project = which domain? | `VERCEL_PROJECT_MAP.md` |
| Which port = which service? | `PORT_REFERENCE.md` |
| Full product spec (billing, credits, agents) | `docs/PRODUCT_BIBLE.md` |
| Full infra (DB, storage, n8n, MCP) | `docs/INFRA_SSOT.md` |
| Agent behavior rules | `.claude/rules/agent-behavior.md` |
| AI model selection + pricing | `docs/AI_MODEL_REGISTRY.md` (file must exist — was missing) |

---

---

## CANCELLED / DEPRECATED

### QuickBooks
- **Status**: CANCELLED (Mar 8, 2026) — saves $600/yr
- **Decision**: `DECISIONS.md` §20
- **Rationale**: Solo LLC, ~5 customers. PayPal reports + expense-tracker sufficient. Wave (free) as backup.

---

## ROADMAP

### Poe Bot (Lead-Gen Channel)
- **Status**: ROADMAP — not urgent
- **Decision**: `DECISIONS.md` §22
- **Purpose**: Demo/lead-gen channel to expose SuperSeller AI capabilities
- **Tracker**: `PRODUCT_STATUS.md` §Roadmap Items

---

*This replaces the abstract SoT table that existed before March 8, 2026. If you need the admin dashboard tab assignments, those are in `PRODUCT_BIBLE.md`.*
