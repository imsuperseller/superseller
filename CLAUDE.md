# 🎯 RENSTO MASTER DOCUMENTATION — Canonical SSOT Router

**Current Era**: Self-Serving SaaS (Programmatic Stack)  
**Main Engine**: Antigravity (Node.js/Postgres/R2)  

> [!IMPORTANT]
> **SSOT ARCHITECTURE**: Do NOT search for documentation elsewhere. Use these Bibles:
> 1. **Infrastructure Bible**: [`docs/INFRA_SSOT.md`](docs/INFRA_SSOT.md) — Server, DB, Storage, R2, Environment, n8n, MCP.
> 2. **Product Bible**: [`docs/PRODUCT_BIBLE.md`](docs/PRODUCT_BIBLE.md) — SaaS billing, Credit logic, Agent specs, Service offerings.
> 3. **History/Lessons Bible**: [`docs/REMOVAL_LOG.md`](docs/REMOVAL_LOG.md) — Archive of failures and pivots.
> 4. **Video Pipeline Spec**: NotebookLM 0baf5f36 (Zillow-to-Video) — TourReel technical truth.

> [!NOTE]
> **Database Stack**: 
> - **Primary (Web)**: Prisma + PostgreSQL (apps/web/rensto-site/prisma/schema.prisma).
> - **Video Worker**: Drizzle + PostgreSQL (apps/worker-packages/db/src/schema.ts).
> - Both use the same `DATABASE_URL`. Shared tables like `User` must be manually synced.

> [!WARNING]
> **Pivots & Deprecations**:
> - **n8n** is for storage/prototyping ONLY. Antigravity is primary automation.
> - **Firestore/Airtable.com** are retired. **PostgreSQL** is the only transactional DB truth.
> - **Webflow/BMAD** are retired. The system is 100% programmatic.

---

## 📖 Canonical Docs

- **Methodology (single system)**: [`METHODOLOGY.md`](METHODOLOGY.md) — B.L.A.S.T. vs Agent Behavior, no conflicts.
- **Codebase vs NotebookLM**: [`CODEBASE_VS_NOTEBOOKLM.md`](CODEBASE_VS_NOTEBOOKLM.md) — What lives in codebase vs notebooks. Codebase = IDE essentials; NotebookLM = specs, methodology.
- **Reference Alignment**: NotebookLM 5811a372 — Hierarchy, cross-reference map, sync discipline. Consult when sources conflict.
- **Mission Control**: [`brain.md`](brain.md) — North Star, Agent protocol.
- **This file**: Technical router. For full context, read the Bibles above.
- **Architecture**: [`ARCHITECTURE.md`](ARCHITECTURE.md), [`REPO_MAP.md`](REPO_MAP.md).
- **Cleanup**: [`CODEBASE_AUDIT.md`](CODEBASE_AUDIT.md).
- **Terminal workflow**: [`CLAUDE_CODE_WORKFLOW.md`](CLAUDE_CODE_WORKFLOW.md).
- **Business context**: [`.cursor/AGENT_CONTEXT.md`](.cursor/AGENT_CONTEXT.md).

---

## 2. Architecture (Brief)

**Data Flow**: PostgreSQL + Redis (primary) → Antigravity (operational) → n8n (backup only).

**Store in PostgreSQL**: Service instances, customers, payments, leads, fulfillment.  
**Use Redis**: Sessions, rate limits, BullMQ job queues.  
**Retired**: Firestore (fully removed Feb 2026 — zero runtime usage), Airtable.com. **Aitable.ai** for dashboards only. `firebase-admin` kept for Storage only (onboarding secrets).

---

## 3. Tech Stack (Brief)

| Layer | Stack |
|-------|-------|
| **Web** | Next.js 14+ (rensto-site), Vercel |
| **Worker** | Node.js, BullMQ, FFmpeg, Kie.ai Kling 3.0, R2 |
| **Automation** | Antigravity (primary), n8n (backup) |
| **Database** | PostgreSQL (Prisma + Drizzle), Redis |

**Key paths**: `apps/web/rensto-site/`, `apps/worker/`, `apps/worker-packages/db/`, `platforms/marketplace/`.

---

## 4. Quick Reference

### URLs
| Service | URL |
|---------|-----|
| rensto.com | https://rensto.com |
| admin | https://admin.rensto.com |
| n8n | https://n8n.rensto.com |
| Vercel | https://vercel.com/dashboard |

### Key Files
| Resource | Location |
|----------|----------|
| **Decisions** | `DECISIONS.md` — user decisions as canonical truth |
| **Credentials** | `CREDENTIAL_REFERENCE.md` — where to look (paths only) |
| **Vercel deploy** | `VERCEL_PROJECT_MAP.md` — domain → project, auto-deploy vs manual |
| **Ports** | `PORT_REFERENCE.md` — site 3002, worker 3001 (local both) or 3002 (RackNerd) |
| TourReel Spec | NotebookLM 0baf5f36 |
| Prisma Schema | `apps/web/rensto-site/prisma/schema.prisma` |
| Drizzle Schema | `apps/worker-packages/db/src/schema.ts` |
| Credits Logic | `apps/web/rensto-site/src/lib/credits.ts`, `apps/worker/src/services/credits.ts` |

### Credentials
API keys in `~/.cursor/mcp.json`, Vercel dashboard, n8n credentials.

---

## 5. Implementation Status (Feb 2026)

**✅ Done**: Firestore→Postgres migration, Stripe checkout (19 pages), credits schema, worker gating, Phase 2 credit-based SaaS.  
**⚠️ Partial**: Customer journey automation, admin redesign.  
**❌ Not done**: Customer portals, lifecycle automation, Voice AI / eSignatures refactor.

---

**For detailed systems, products, customer journey, financial tracking, admin portal, MCP list, Airtable/Notion reference: read the Bibles.**
