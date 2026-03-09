# SuperSeller AI Architecture – Folder Map

**Last Updated**: February 2026  
**Purpose**: Quick reference for where things live. For mission and protocol: **brain.md**. For full context: **CLAUDE.md**.

---

## Active Paths

| Path | Purpose |
|------|---------|
| **apps/web/superseller-site/** | Main Next.js app (superseller.agency, admin.superseller.agency, api.superseller.agency) |
| **apps/worker/** | Video pipeline worker (VideoForge: Remotion composition + Kling AI clips, R2) |
| **apps/web/superseller-site/src/app/** | Pages and API routes |
| **apps/web/superseller-site/src/app/(main)/admin/** | Admin dashboard (served via admin.superseller.agency) |
| **apps/web/superseller-site/src/app/api/** | API endpoints |
| **infra/** | MCP servers, n8n scripts, migrations, workflow artifacts |
| **infra/mcp-servers/** | MCP server configs |
| **infra/n8n-scripts/** | n8n workflow deploy/fix scripts |
| **infra/archive/** | Archived infra (old workflows, legacy) |
| **library/** | Legacy data, client workflows, reference configs |
| **platforms/marketplace/** | Marketplace platform config and engine |
| **docs/** | Documentation: **docs/frameworks/**, **docs/templates/videoforge/**, **docs/n8n/N8N_WORKFLOWS_CATALOG.md**, **docs/NOTEBOOKLM_INDEX.md** |
| **security/** | Security policies, credential rotation |
| **.cursor/** | Agent rules, context, MCP status |
| **.claude/skills/** | Agent skills (antigravity, database, rag-pgvector, billing-credits, videoforge-pipeline, ui-design-workflow, ui-ux-pro-max) |

---

---

## Monitoring & Observability Layer

| Path | Purpose |
|------|---------|
| `src/lib/monitoring/service-registry.ts` | Central config for 10 monitored services |
| `src/lib/monitoring/health-checker.ts` | Concurrent health checks, DB persistence, uptime calc |
| `src/lib/monitoring/alert-engine.ts` | Alert rules evaluation, cooldown, email/audit notifications |
| `src/lib/monitoring/expense-tracker.ts` | API cost tracking, anomaly detection |
| `src/components/admin/SystemMonitor.tsx` | Admin UI (Services, Alerts, Expenses views) |
| `src/app/api/admin/monitoring/route.ts` | Health check API |
| `src/app/api/admin/alerts/route.ts` | Alert management API |
| DB: `service_health`, `alert_rules`, `alert_history`, `api_expenses` | 4 monitoring tables |

---

## Not Present at Repo Root

- **packages/** — Does not exist. Use `apps/web/superseller-site/src/` or `infra/`.
- **scripts/** — Exists but in .cursorignore. Use `infra/n8n-scripts/` for automation scripts.
- **archives/** — Does not exist. Use `infra/archive/` or `docs/archive/` for archived material.
- **directives/** — Deleted. n8n governance in NotebookLM 1dc7ce26.
- **legal-pages/** — Deleted. Legal content in superseller-site or external.
- **apps/api**, **apps/gateway-worker**, **apps/marketplace** — Deleted from repo.
- **apps/web/admin-dashboard** — Deleted. Admin lives in `superseller-site/src/app/admin`.

---

## Data Storage (Target)

- **Primary**: PostgreSQL + pgvector 0.8.1 + Redis
- **RAG**: Ollama nomic-embed-text (768-dim) → pgvector HNSW → `documents` table (multi-tenant)
- **Automation**: Antigravity (primary), n8n (backup only)
- **Retired**: Firestore, Airtable.com. **In use**: Aitable.ai (dashboards, syncs)

**Firestore → Postgres migration**: ✅ **COMPLETE** (February 2026). PostgreSQL is now the primary database. See `docs/REMOVAL_LOG.md` for migration history.

---

## Domain Mapping

| Domain | Serves |
|--------|--------|
| superseller.agency, www.superseller.agency | Main site, marketplace, all public pages |
| admin.superseller.agency | Admin dashboard |
| api.superseller.agency | Same app as superseller.agency (separate Vercel project) |

**Deploy details**: See **VERCEL_PROJECT_MAP.md** — which Vercel project owns each domain, auto-deploy vs manual.

---

*See CLAUDE.md for complete architecture, data flow, and tech stack.*
