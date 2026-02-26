# 🎯 RENSTO MASTER DOCUMENTATION — Technical Router

**Current Era**: Self-Serving SaaS (Programmatic Stack)
**Main Engine**: Antigravity (Node.js/Postgres/R2)
**Authority**: For conflict resolution and precedence, see [`brain.md`](brain.md) Authority Precedence table.

> [!IMPORTANT]
> **Key References**:
> 1. **Master Index**: [`docs/BUSINESS_COVERAGE_INDEX.md`](docs/BUSINESS_COVERAGE_INDEX.md) — Unified mapping of all business matters to SoTs.
> 2. **Infrastructure**: [`docs/INFRA_SSOT.md`](docs/INFRA_SSOT.md) — Server, DB, Storage, R2, Environment, n8n, MCP.
> 3. **Products**: [`docs/PRODUCT_BIBLE.md`](docs/PRODUCT_BIBLE.md) — SaaS billing, Credit logic, Agent specs, Service offerings.
> 4. **Notebook Hub**: Brain 5811a372 (B.L.A.S.T.), 0baf5f36 (TourReel), 12724368 (Changelog).

> [!NOTE]
> **Database Stack**: 
> - **Primary (Web)**: Prisma + PostgreSQL (apps/web/superseller-site/prisma/schema.prisma).
> - **Video Worker**: Drizzle + PostgreSQL (apps/worker-packages/db/src/schema.ts).
> - Both use the same `DATABASE_URL`. Shared tables like `User` must be manually synced.

> [!WARNING]
> **Pivots & Deprecations**:
> - **n8n** is backup for NEW automation. Antigravity is primary. Existing production n8n workflows (FB Bot lead pipeline) still run.
> - **Firestore/Airtable.com** are retired. **PostgreSQL** is the only transactional DB truth.
> - **Webflow/BMAD** are retired. The system is 100% programmatic.

> [!CAUTION]
> **Content Extraction Rule (NEVER invent content)**:
> When building customer-facing pages/content, ALWAYS extract from existing strategy docs — NEVER invent.
> 1. Search for customer docs (e.g., `customer-leads/`, strategy files in separate repos)
> 2. READ every doc fully — not skim
> 3. Extract verbatim — copy from docs, don't paraphrase or fabricate
> 4. If content doesn't exist in docs, **leave it empty** — never fabricate testimonials, case studies, quotes
> 5. If docs say "we don't have this yet" → OMIT the section
> 6. Cite source in seed scripts (which doc, which section)
> **Violation history**: Past violations include fabricated testimonials despite docs explicitly stating content didn't exist. See `findings.md` for full history and prevention checklist.
> **Note**: Customer-specific content lives in separate private repositories, not in the SuperSeller AI codebase.

---

## 📖 Canonical Docs

- **Methodology (single system)**: [`METHODOLOGY.md`](METHODOLOGY.md) — B.L.A.S.T. vs Agent Behavior, no conflicts.
- **Codebase vs NotebookLM**: [`CODEBASE_VS_NOTEBOOKLM.md`](CODEBASE_VS_NOTEBOOKLM.md) — What lives in codebase vs notebooks. Codebase = IDE essentials; NotebookLM = specs, methodology.
- **Reference Alignment**: NotebookLM 5811a372 — Hierarchy, cross-reference map, sync discipline. Consult when sources conflict.
- **Mission Control**: [`brain.md`](brain.md) — North Star, Agent protocol.
- **This file**: Technical router. For full context, read the Bibles above.
- **Architecture**: [`ARCHITECTURE.md`](ARCHITECTURE.md), [`REPO_MAP.md`](REPO_MAP.md).
- **Terminal workflow**: [`CLAUDE_CODE_WORKFLOW.md`](CLAUDE_CODE_WORKFLOW.md).
- **Business context**: [`.cursor/AGENT_CONTEXT.md`](.cursor/AGENT_CONTEXT.md).

---

## 2. Architecture (Brief)

**Data Flow**: PostgreSQL + Redis (primary) → Antigravity (operational) → n8n (existing production workflows + backup for new).

**Store in PostgreSQL**: Service instances, customers, payments, leads, fulfillment.  
**Use Redis**: Sessions, rate limits, BullMQ job queues.  
**Retired**: Firestore (fully removed Feb 2026 — zero runtime usage), Airtable.com. **Aitable.ai** for dashboards only. `firebase-admin` kept for Storage only (onboarding secrets).

**Active production n8n workflows (DO NOT disable)**: Telnyx polling UAD, Telnyx polling MissParty, FB Bot lead analysis UAD (U6EZ2iLQ4zCGg31H), FB Bot lead analysis MissParty (9gfvZo9sB4b3pMWQ).

---

## 3. Tech Stack (Brief)

| Layer | Stack |
|-------|-------|
| **Web** | Next.js 14+ (superseller-site), Vercel |
| **Worker** | Node.js, BullMQ, FFmpeg (Auto-updated), Kie.ai (Kling 3.0 & Nano Banana), R2 |
| **RAG** | Ollama nomic-embed-text (768-dim) + pgvector 0.8.1 HNSW |
| **Automation** | Antigravity (primary), n8n (backup) |
| **Database** | PostgreSQL + pgvector (Prisma + Drizzle), Redis |

**Key paths**: `apps/web/superseller-site/`, `apps/worker/`, `apps/worker-packages/db/`, `platforms/marketplace/`, `fb marketplace lister/deploy-package/`.

---

## 4. Quick Reference

### URLs
| Service | URL |
|---------|-----|
| superseller.agency | https://superseller.agency |
| admin | https://admin.superseller.agency |
| n8n | https://n8n.superseller.agency |
| Vercel | https://vercel.com/dashboard |

### Key Files
| Resource | Location |
|----------|----------|
| **Decisions** | `DECISIONS.md` — user decisions as canonical truth |
| **Credentials** | `CREDENTIAL_REFERENCE.md` — where to look (paths only) |
| **Vercel deploy** | `VERCEL_PROJECT_MAP.md` — domain → project, auto-deploy vs manual |
| **Ports** | `PORT_REFERENCE.md` — site 3002, worker 3001 (local both) or 3002 (RackNerd) |
| TourReel Spec | NotebookLM 0baf5f36 |
| Prisma Schema | `apps/web/superseller-site/prisma/schema.prisma` |
| Drizzle Schema | `apps/worker-packages/db/src/schema.ts` |
| **Data Dictionary** | `docs/DATA_DICTIONARY.md` — where every entity lives, sync rules, mismatches |
| **Schema Sentinel** | `tools/schema-sentinel.ts` — Prisma vs Drizzle drift detector (`npx tsx tools/schema-sentinel.ts`) |
| Credits Logic | `apps/web/superseller-site/src/lib/credits.ts`, `apps/worker/src/services/credits.ts` |
| **Cost Tracking** | `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts` — trackExpense(), rates, anomalies |
| Cost Rates | Kling Pro $0.10, Std $0.03, Suno $0.02, Nano $0.05, Gemini $0.001 — see tourreel-pipeline SKILL.md |
| FB Bot Config | `fb marketplace lister/deploy-package/bot-config.json` (local), `/opt/fb-marketplace-bot/bot-config.json` (server) |
| FB Bot Status | `PRODUCT_STATUS.md` §2 (feature matrix), `platforms/marketplace/PLATFORM_BIBLE.md` |

### Credentials
API keys in `~/.cursor/mcp.json`, Vercel dashboard, n8n credentials.

---

## 5. Implementation Status (Feb 2026)

> **Canonical product status**: See `PRODUCT_STATUS.md` for detailed per-product status, feature matrices, and priority order.

| Product | Status | Notes |
|---------|--------|-------|
| **TourReel** | ✅ Live | 25+ videos generated, full pipeline working |
| **Winner Studio** | ✅ Live | Customer deployed (Mivnim/Yossi), avatar-pro + fallback |
| **FB Marketplace Bot** | ✅ Live | UAD + MissParty posting, 96%/94% feature complete |
| **Lead Landing Pages** | ✅ Complete | `/lp/[slug]` infrastructure done, WAHA + email notifications |
| **FrontDesk Voice AI** | ⚠️ Partial | Voice assistant working, eSignatures not started |
| **AgentForge** | ⚠️ Spec only | Internal tool decision made, code not started |
| **SocialHub** | ⏳ Phase 2 | Spec complete (7 docs), code not started |

**Infrastructure ✅ Done**: Firestore→Postgres migration, PayPal checkout (migrated from Stripe Feb 2026), credits schema, worker gating, Phase 2 credit-based SaaS.

---

## 6. Build / Deploy / Test Commands

### Web (apps/web/superseller-site)
```bash
cd apps/web/superseller-site
npm run dev              # Local dev on port 3002
npm run build            # prisma generate + next build
npm run lint             # Next.js lint
npm run db:generate      # Prisma generate only
npm run db:push          # Push schema to DB
npm run test:credits     # Credit system test
npm run test:e2e         # Playwright E2E tests
```
**Deploy**: `git push` auto-deploys `api.superseller.agency`. For `superseller.agency`: run `cd apps/web/superseller-site && vercel --prod` (requires VERCEL_TOKEN in environment).

### Worker (apps/worker)
```bash
cd apps/worker
npm run dev              # tsx watch src/index.ts (local port 3001)
npm run build            # tsc
```
### Worker (RackNerd)
```bash
./apps/worker/deploy-to-racknerd.sh
```
*(Handles rsync, npm install, PM2 restarts, and installs the daily FFmpeg update cron job automatically).*
Or rsync from local: `rsync -avz --exclude node_modules apps/worker/ root@172.245.56.50:/opt/tourreel-worker/apps/worker/`

### Health Checks
```bash
curl -s https://superseller.agency/api/health          # Web
curl -s http://172.245.56.50:3002/api/health   # Worker
curl -s http://172.245.56.50:11434/api/tags    # Ollama
curl -s http://172.245.56.50:8082/health       # FB Marketplace Bot
```

---

**For detailed systems, products, customer journey, financial tracking, admin portal, MCP list, Airtable/Notion reference: see the references above.**
