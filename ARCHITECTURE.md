# Rensto Architecture – Folder Map

**Last Updated**: February 2026  
**Purpose**: Quick reference for where things live. For mission and protocol: **brain.md**. For full context: **CLAUDE.md**.

---

## Active Paths

| Path | Purpose |
|------|---------|
| **apps/web/rensto-site/** | Main Next.js app (rensto.com, admin.rensto.com, api.rensto.com) |
| **apps/web/rensto-site/src/app/** | Pages and API routes |
| **apps/web/rensto-site/src/app/admin/** | Admin dashboard |
| **apps/web/rensto-site/src/app/api/** | API endpoints |
| **infra/** | MCP servers, n8n scripts, migrations, workflow artifacts |
| **infra/mcp-servers/** | MCP server configs |
| **infra/n8n-scripts/** | n8n workflow deploy/fix scripts |
| **infra/archive/** | Archived infra (old workflows, legacy) |
| **firestore/** | Firestore docs (legacy; migration to Postgres in progress) |
| **library/** | Legacy data, client workflows, reference configs |
| **legal-pages/** | Privacy policy, terms, compliance |
| **platforms/marketplace/** | Marketplace platform config and engine |
| **docs/** | Documentation: **docs/frameworks/** (B.L.A.S.T., Antigravity, etc.), **docs/templates/tourreel/** (marketplace app template), **docs/n8n/N8N_WORKFLOWS_CATALOG.md** (workflow grouping), **docs/NOTEBOOKLM_INDEX.md** |
| **security/** | Security policies, credential rotation |
| **directives/** | n8n governance, debugging, strategy |
| **.cursor/** | Agent rules, context, MCP status |

---

## Not Present at Repo Root

- **packages/** — Does not exist. Use `apps/web/rensto-site/src/` or `infra/`.
- **scripts/** — In .cursorignore. Use `infra/n8n-scripts/` for automation scripts.
- **archives/** — Does not exist. Use `infra/archive/` for archived material.
- **apps/api**, **apps/gateway-worker**, **apps/marketplace** — Deleted from repo.
- **apps/web/admin-dashboard** — Deleted. Admin lives in `rensto-site/src/app/admin`.

---

## Data Storage (Target)

- **Primary**: PostgreSQL + Redis
- **Automation**: Antigravity (primary), n8n (backup only)
- **Retired**: Firestore, Airtable.com. **In use**: Aitable.ai (dashboards, syncs)

**Firestore → Postgres migration**: See `docs/technical/FIRESTORE_TO_POSTGRES_MIGRATION_PLAN.md`. **Provision Postgres**: Use Neon via Vercel Marketplace (Vercel Postgres retired Dec 2024). See `docs/technical/PROVISION_NEON_POSTGRES.md`.

---

## Domain Mapping

| Domain | Serves |
|--------|--------|
| rensto.com, www.rensto.com | Main site, marketplace, all public pages |
| admin.rensto.com | Admin dashboard |
| api.rensto.com | Same as rensto.com/api/* |

---

*See CLAUDE.md for complete architecture, data flow, and tech stack.*
