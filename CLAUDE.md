# 🎯 SUPERSELLER MASTER DOCUMENTATION — Technical Router

**Current Era**: Self-Serving SaaS (Programmatic Stack)
**Main Engine**: Antigravity (Node.js/Postgres/R2)
**Authority**: For conflict resolution and precedence, see [`brain.md`](brain.md) Authority Precedence table.

> [!CAUTION]
> **RENSTO / SUPERSELLER HARD SEPARATION — NEVER VIOLATE**
> Rensto (rensto.com) and SuperSeller AI (superseller.agency) are TWO SEPARATE BUSINESSES under the same legal entity.
> - **Rensto codebase**: `~/rensto - online directory/` — NOT inside this repo. Never move, archive, or reference it here.
> - **Rensto server**: systemd `rensto` service, port 3001, RackNerd. nginx config `/etc/nginx/sites-available/rensto-redirect` proxies rensto.com → port 3001. NEVER touch this nginx block to redirect to superseller.agency.
> - **No shared code**: No imports, API calls, or DB tables shared between the two apps.
> - **Business relationship** (strategy only): Rensto contractors = SuperSeller AI prospects. Use Rensto's contractor data for outreach — never merge technically.
> - **History**: On March 5, 2026, I incorrectly archived the Rensto codebase and redirected rensto.com → superseller.agency. Both were fixed March 8, 2026. Do not repeat.

> [!IMPORTANT]
> **Key References**:
> 1. **Master Index**: [`docs/BUSINESS_COVERAGE_INDEX.md`](docs/BUSINESS_COVERAGE_INDEX.md) — Unified mapping of all business matters to SoTs.
> 2. **Infrastructure**: [`docs/INFRA_SSOT.md`](docs/INFRA_SSOT.md) — Server, DB, Storage, R2, Environment, n8n, MCP.
> 3. **Products**: [`docs/PRODUCT_BIBLE.md`](docs/PRODUCT_BIBLE.md) — SaaS billing, Credit logic, Agent specs, Service offerings.
> 4. **Notebook Hub**: Brain 1dc7ce26 (BLAST), 0baf5f36 (VideoForge), 12724368 (Changelog).

> [!NOTE]
> **Database Stack**: 
> - **Primary (Web)**: Prisma + PostgreSQL (apps/web/superseller-site/prisma/schema.prisma).
> - **Video Worker**: Drizzle + PostgreSQL (apps/worker-packages/db/src/schema.ts).
> - Both use the same `DATABASE_URL`. Shared tables like `User` must be manually synced.

> [!WARNING]
> **Deprecated (DO NOT USE)**: Firestore (except FB Bot posting schedule), Airtable.com, Stripe, Webflow, BMAD, QuickBooks. **n8n** = backup only (Antigravity is primary). DB `stripe*` columns store PayPal IDs.

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

- **Methodology (single system)**: [`METHODOLOGY.md`](METHODOLOGY.md) — BLAST vs Agent Behavior, no conflicts.
- **Reference Alignment**: NotebookLM 1dc7ce26 — Hierarchy, cross-reference map, sync discipline. Consult when sources conflict.
- **Mission Control**: [`brain.md`](brain.md) — North Star, Agent protocol.
- **This file**: Technical router. For full context, read the Bibles above.
- **Architecture**: [`ARCHITECTURE.md`](ARCHITECTURE.md), [`REPO_MAP.md`](REPO_MAP.md).
- **Business context**: [`.cursor/AGENT_CONTEXT.md`](.cursor/AGENT_CONTEXT.md).

---

## 2. Architecture (Brief)

**Data Flow**: PostgreSQL + Redis (primary) → Antigravity (operational) → n8n (existing production workflows + backup for new).

**Store in PostgreSQL**: Service instances, customers, payments, leads, fulfillment.  
**Use Redis**: Sessions, rate limits, BullMQ job queues.  
**Retired**: Firestore mostly removed Feb 2026. **Exception**: FB Marketplace Bot still uses Firestore (`platforms/marketplace/saas-engine/lib/firebase.js`) — pending Postgres migration. Airtable.com retired. **Aitable.ai** for dashboards only. `firebase-admin` kept for Storage only (onboarding secrets).

**Active production n8n workflows (DO NOT disable)**: Telnyx voice lead analysis UAD (U6EZ2iLQ4zCGg31H), Telnyx voice lead analysis MissParty (9gfvZo9sB4b3pMWQ). These are **Telnyx voice call pipelines**, not FB Bot workflows. The FB Marketplace Bot runs on Antigravity (webhook-server + fb-scheduler on PM2).

---

## 3. Tech Stack (Brief)

| Layer | Stack |
|-------|-------|
| **Web** | Next.js 14+ (superseller-site), Vercel |
| **Worker** | Node.js, BullMQ, Remotion 4.0 (photo composition), FFmpeg (utility), Kie.ai (Kling 3.0 AI clips), R2 |
| **RAG** | Ollama nomic-embed-text (768-dim) + pgvector 0.8.1 HNSW |
| **Automation** | Antigravity (primary), n8n (backup) |
| **Database** | PostgreSQL + pgvector (Prisma + Drizzle), Redis |

**Key paths**: `apps/web/superseller-site/`, `apps/worker/`, `apps/worker-packages/db/`, `platforms/marketplace/`, `fb-marketplace-lister/deploy-package/`.

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
| **Decisions** | `DECISIONS.md` |
| **Credentials** | `CREDENTIAL_REFERENCE.md` |
| **Schemas** | Prisma: `apps/web/superseller-site/prisma/schema.prisma`, Drizzle: `apps/worker-packages/db/src/schema.ts` |
| **All docs** | `docs/` — API docs, runbooks, monitoring, SLOs, model registry, onboarding, security, changelog, data dictionary |
| **Tools** | `tools/schema-sentinel.ts` (drift check), `tools/map-codebase.ts` (repo map) |

---

## 5. Implementation Status

> See `PRODUCT_STATUS.md` for detailed per-product status, feature matrices, and priority order.

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
**Deploy**: `git push` auto-deploys `api.superseller.agency`. For `superseller.agency`: run `vercel --prod` from **repo root** (NOT from `apps/web/superseller-site/` — Vercel project has rootDirectory configured). See `VERCEL_PROJECT_MAP.md`.

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

### Code Quality Tools
```bash
npx tsx tools/schema-sentinel.ts          # Prisma <-> Drizzle drift check
```

### Health Checks
```bash
curl -s https://superseller.agency/api/health          # Web
curl -s http://172.245.56.50:3002/api/health   # Worker
curl -s http://172.245.56.50:11434/api/tags    # Ollama
curl -s http://172.245.56.50:8082/health       # FB Marketplace Bot
```

---

**For detailed systems, products, customer journey, financial tracking, admin portal, MCP list: see the docs/ directory and references above.**
