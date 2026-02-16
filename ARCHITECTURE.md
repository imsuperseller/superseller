# Rensto Architecture – Folder Map

**Last Updated**: February 2026  
**Purpose**: Quick reference for where things live. For mission and protocol: **brain.md**. For full context: **CLAUDE.md**.

---

## Active Paths

| Path | Purpose |
|------|---------|
| **apps/web/rensto-site/** | Main Next.js app (rensto.com, admin.rensto.com, api.rensto.com) |
| **apps/worker/** | Video pipeline worker (TourReel: Nano Banana, Kling, R2) |
| **apps/web/rensto-site/src/app/** | Pages and API routes |
| **apps/web/rensto-site/src/app/(main)/admin/** | Admin dashboard (served via admin.rensto.com) |
| **apps/web/rensto-site/src/app/api/** | API endpoints |
| **infra/** | MCP servers, n8n scripts, migrations, workflow artifacts |
| **infra/mcp-servers/** | MCP server configs |
| **infra/n8n-scripts/** | n8n workflow deploy/fix scripts |
| **infra/archive/** | Archived infra (old workflows, legacy) |
| **library/** | Legacy data, client workflows, reference configs |
| **platforms/marketplace/** | Marketplace platform config and engine |
| **docs/** | Documentation: **docs/frameworks/**, **docs/templates/tourreel/**, **docs/n8n/N8N_WORKFLOWS_CATALOG.md**, **docs/NOTEBOOKLM_INDEX.md** |
| **security/** | Security policies, credential rotation |
| **.cursor/** | Agent rules, context, MCP status |
| **.claude/skills/** | Agent skills (n8n, Tax4Us, workflow generator) |

---

## Not Present at Repo Root

- **packages/** — Does not exist. Use `apps/web/rensto-site/src/` or `infra/`.
- **scripts/** — Exists but in .cursorignore. Use `infra/n8n-scripts/` for automation scripts.
- **archives/** — Does not exist. Use `infra/archive/` or `docs/archive/` for archived material.
- **directives/** — Deleted. n8n governance in NotebookLM 5811a372.
- **legal-pages/** — Deleted. Legal content in rensto-site or external.
- **apps/api**, **apps/gateway-worker**, **apps/marketplace** — Deleted from repo.
- **apps/web/admin-dashboard** — Deleted. Admin lives in `rensto-site/src/app/admin`.

---

## Data Storage (Target)

- **Primary**: PostgreSQL + Redis
- **Automation**: Antigravity (primary), n8n (backup only)
- **Retired**: Firestore, Airtable.com. **In use**: Aitable.ai (dashboards, syncs)

**Firestore → Postgres migration**: ✅ **COMPLETE** (February 2026). PostgreSQL is now the primary database. See `docs/REMOVAL_LOG.md` for migration history.

---

## Domain Mapping

| Domain | Serves |
|--------|--------|
| rensto.com, www.rensto.com | Main site, marketplace, all public pages |
| admin.rensto.com | Admin dashboard |
| api.rensto.com | Same app as rensto.com (separate Vercel project) |

**Deploy details**: See **VERCEL_PROJECT_MAP.md** — which Vercel project owns each domain, auto-deploy vs manual.

---

*See CLAUDE.md for complete architecture, data flow, and tech stack.*
