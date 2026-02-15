# Repo Map – What You're Seeing

**Last Updated**: February 2026  
**Purpose**: Plain-language guide to the Rensto codebase.

---

## The One App That Ships

**`apps/web/rensto-site/`** is the only live application in this repo. It serves:

- rensto.com (main site, marketplace, niche pages)
- admin.rensto.com (admin dashboard)
- api.rensto.com (API routes at `/api/*`)

All pages are Next.js on Vercel. Webflow is retired.

---

## What Lives Where

| What | Where |
|------|-------|
| Public pages (home, marketplace, niches) | `apps/web/rensto-site/src/app/` |
| Admin dashboard | `apps/web/rensto-site/src/app/admin/` |
| API routes | `apps/web/rensto-site/src/app/api/` |
| Components | `apps/web/rensto-site/src/components/` |
| Libs (Prisma, services, etc.) | `apps/web/rensto-site/src/lib/` |
| Database schema | `apps/web/rensto-site/prisma/schema.prisma` |
| MCP servers | `infra/mcp-servers/` |
| n8n workflow scripts | `infra/n8n-scripts/` |
| Workflow JSONs (canonical) | `infra/` (unified_marketplace_master_production.json) |
| Video pipeline worker (TourReel) | `apps/worker/` |
| Marketplace platform config | `platforms/marketplace/` |
| Rules for agents | `.cursor/`, `.cursorrules` |
| Master documentation | `CLAUDE.md` |

---

## What's Gone

- **apps/api** — Deleted
- **apps/gateway-worker** — Deleted
- **apps/marketplace** — Deleted (marketplace is in rensto-site)
- **apps/web/admin-dashboard** — Deleted (admin is in rensto-site)
- **firestore/** — Deleted (migration to PostgreSQL complete Feb 2026)
- **legal-pages/** — Deleted (legal content in rensto-site or external)
- **directives/** — Deleted (n8n governance in NotebookLM)

---

## Current Stack

- **Database (primary)**: PostgreSQL + Redis (on RackNerd). Migration from Firestore complete Feb 2026.
- **Automation**: Antigravity (primary), n8n (backup only)
- **Methodology**: B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger)
- **Retired**: Webflow, BMAD, Firestore, Airtable.com. **Aitable.ai**: In use (dashboards, syncs)

---

## Where to Read More

- **brain.md** — Mission Control (read first)
- **CLAUDE.md** — Full technical context
- **ARCHITECTURE.md** — Folder map
- **.cursor/AGENT_CONTEXT.md** — Business priorities
- **docs/NOTEBOOKLM_INDEX.md** — NotebookLM notebook registry
