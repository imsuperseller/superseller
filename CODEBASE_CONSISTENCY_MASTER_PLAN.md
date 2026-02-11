# Codebase Consistency Master Plan

**Goal**: 100% confidence — no ancient history, no conflicts, no contradictions, no outdated references.

**Target Architecture** (per your direction):
- **Database**: Postgres + Redis (primary). Firestore and Airtable.com retired. **Aitable.ai in use** (dashboards, syncs).
- **Automation**: Antigravity on RackNerd (primary). n8n is backup/reference only.
- **Webflow**: Retired. Site is Next.js on Vercel.
- **Marketplace**: Credit-based self-serve SaaS apps, yearly subscription per app, different apps = different audiences, Rensto style.
- **Methodology**: B.L.A.S.T. only. BMAD is retired.

---

## Scope Overview

| Category | Files Affected | Effort |
|----------|----------------|--------|
| **Doc/Config updates** | ~35 files | Medium |
| **Firestore code** | ~50 API routes + libs | High (migration) |
| **Airtable references** | ~25 files | Medium |
| **Webflow references** | ~25 files | Low |
| **BMAD references** | ~15 files | Low |
| **admin-dashboard / archives** | ~8 files | Low |
| **Deleted apps (api, gateway-worker, marketplace)** | CLAUDE + README | Low |
| **Missing docs (ARCHITECTURE, REPO_MAP)** | Create or fix links | Low |
| **n8n → Antigravity context** | ~30 files | Medium (docs first) |

---

## Phase 1: Documentation & Config (No Code Changes)

*Goal: All canonical docs reflect target architecture. Agents and humans read one consistent story.*

### 1.1 Root Canonical Docs

| File | Changes Needed |
|------|----------------|
| **CLAUDE.md** | Replace Firestore/Airtable as primary with Postgres+Redis. Replace n8n-primary with Antigravity-primary, n8n-backup. Remove Webflow CMS from service URLs. Remove BMAD; B.L.A.S.T. only. Remove apps/api, gateway-worker, marketplace from Tech Stack (or mark archived). Fix admin-dashboard reference (no "moved to archives" — folder deleted). Fix MCP counts (pick one: 6 or 11 or 12). Fix n8n workflow count (56). |
| **.cursorrules** | Quick Decision Tree: admin path → `apps/web/rensto-site/src/app/admin`. Data storage: Postgres+Redis primary. Remove Airtable from "Which database" tree. Remove or update BMAD references; B.L.A.S.T. only. |
| **.cursor/rules.md** | Align with Postgres+Redis, B.L.A.S.T. Remove BMAD rule 11–13. Update ARCHITECTURE.md reference (create or remove link). |
| **.cursor/AGENT_CONTEXT.md** | Change "Firebase → PostgreSQL / Redis (under consideration)" to "PostgreSQL + Redis (primary). Migration from Firestore in progress." Remove ARCHITECTURE.md link if missing. |
| **README.md** | Remove ARCHITECTURE.md and REPO_MAP.md links (or create those files). Update Tech Architecture diagram if it references old stack. |
| **MASTERY_STATUS.md** | Update Firestore→Postgres. Remove references to scripts/bmad. |
| **CODEBASE_AUDIT.md** | Update for Postgres+Redis, Antigravity, B.L.A.S.T. Remove Firestore-primary language. |
| **CLEANUP_DETERMINED.md** | Update Airtable/Firestore mentions. |

### 1.2 Archives / admin-dashboard Fix

| Issue | Fix |
|-------|-----|
| CLAUDE.md says "admin-dashboard moved to archives/" | Change to: "admin-dashboard folder was deleted. Admin is in rensto-site/src/app/admin." |
| archives/ doesn't exist | Remove "moved to archives" language. Use "deleted" or "infra/archive/" for actual archives. |
| .cursorrules Quick Decision Tree → admin-dashboard | Change to `apps/web/rensto-site/src/app/admin` |

### 1.3 Missing Docs

| Doc | Action |
|-----|--------|
| ARCHITECTURE.md | Create minimal folder map OR remove all links to it (README, CLAUDE, AGENT_CONTEXT, rules) |
| REPO_MAP.md | Same: create OR remove links |
| docs/technical/products/PRODUCTIZATION_GUIDE.md | Remove CLAUDE link OR create stub |

### 1.4 BMAD → B.L.A.S.T.

| File | Change |
|------|--------|
| CLAUDE.md | Remove BMAD section or replace with "Retired. Use B.L.A.S.T." Remove /scripts/bmad/ reference (or note as archived). |
| .cursor/rules.md | Remove rules 11–13 (BMAD Integration). Keep B.L.A.S.T. in .cursorrules. |
| .gitignore | scripts/bmad/ — keep if folder exists for legacy; else remove |

### 1.5 Webflow

| File | Change |
|------|--------|
| CLAUDE.md | Service URLs: remove "via Webflow CMS". All pages served by rensto-site. |
| All other Webflow refs | Mark as "legacy/archived" or remove if redundant |

### 1.6 Deleted Apps

| App | Change in CLAUDE.md (Tech Stack section) |
|-----|------------------------------------------|
| apps/api | Remove or mark "Archived (deleted from repo)" |
| apps/gateway-worker | Same |
| apps/marketplace | Same — marketplace now lives in rensto-site |
| apps/web/admin-dashboard | Already noted legacy; ensure consistency |

### 1.7 Antigravity / n8n Context

| File | Change |
|------|--------|
| CLAUDE.md | Automation: Antigravity primary on RackNerd. n8n = backup/reference for n8n-only tasks. |
| .cursorrules | Update n8n section: "Antigravity primary; n8n backup." |
| directives/*.md | Add note: Antigravity is primary; n8n for reference. |

---

## Phase 2: Airtable / Firestore References in Non-Code Files

*Goal: All non-code docs, configs, and scripts stop implying Airtable/Firestore as primary.*

### 2.1 Documentation Only

| Path | Action |
|------|--------|
| firestore/*.md | Add deprecation header: "Legacy. Target: Postgres. See CODEBASE_CONSISTENCY_MASTER_PLAN." |
| infra/README.md | Postgres primary; Airtable/Firestore legacy |
| infra/mcp-servers/airtable-mcp-server/* | Add README note: "Legacy. Primary DB is Postgres." |
| library/legacy_data/README.md | Clarify legacy status |
| platforms/marketplace/*.md | Update for new marketplace vision (credit-based SaaS apps) |
| security/*.md | Update Firestore references |
| .cursor/MCP_CONFIGURATION_STATUS.md | Airtable MCP: mark legacy/optional |
| directives/n8n_*.md | Add Antigravity-primary note |

### 2.2 Config / Tool Scripts

| Path | Action |
|------|--------|
| apps/web/rensto-site/tools/*.js | setup_aitable, sync_*_to_aitable — add deprecation comment or archive |
| apps/web/rensto-site/tools/README.md | Note Airtable tools are legacy |

---

## Phase 3: Code Migration (Firestore → Postgres)

*This is a separate engineering project. The app currently uses Firestore in ~50 places.*

### 3.1 Prerequisites

- Postgres schema defined (users, payments, clients, leads, etc.)
- Redis plan (cache, sessions, queues)
- Migration strategy: feature flags, dual-write, or big-bang

### 3.2 Affected Code (Summary)

- `apps/web/rensto-site/src/lib/firebase-admin.ts` — core Firestore access
- `apps/web/rensto-site/src/lib/firebase-client.ts`
- `apps/web/rensto-site/src/types/firestore.ts`
- All `/api/*` routes importing `getFirestoreAdmin` or `COLLECTIONS`
- `ProvisioningService`, `UsageService`, `ServiceAuditAgent`
- Admin components (ClientManagement, WorkflowManagement, etc.)

### 3.3 Order of Work

1. Define Postgres schema + Prisma (or raw SQL) models
2. Create `lib/postgres.ts` / `lib/redis.ts` wrappers
3. Migrate one domain at a time (e.g. payments first, then clients)
4. Dual-write during transition if needed
5. Remove Firestore once traffic is on Postgres

---

## Phase 4: Marketplace Model Update

*Goal: Docs and config reflect credit-based SaaS apps, yearly subscriptions.*

### 4.1 Docs to Update

- CLAUDE.md Marketplace section
- platforms/marketplace/README.md, PRD.md, PLATFORM_BIBLE.md
- Any "workflow templates" language → "credit-based self-serve SaaS apps"

---

## Phase 5: Final Verification Checklist

After all phases:

- [ ] No doc says Firestore or Airtable is primary
- [ ] No doc says n8n is primary (Antigravity is)
- [ ] No doc says Webflow serves pages
- [ ] No doc says BMAD is current methodology
- [ ] No doc points to apps/web/admin-dashboard
- [ ] No doc says "moved to archives/" for non-existent archives/
- [ ] ARCHITECTURE.md and REPO_MAP.md exist OR all links removed
- [ ] README, CLAUDE, .cursorrules, .cursor/rules.md, AGENT_CONTEXT all aligned
- [ ] .cursorrules Quick Decision Tree paths correct
- [ ] No references to deleted apps (api, gateway-worker, marketplace) as active

---

## Recommended Execution Order

1. **Phase 1** (doc/config) — Do first. Gets you one consistent story.
2. **Phase 2** (non-code refs) — Quick follow-up.
3. **Phase 4** (marketplace docs) — Small scope.
4. **Phase 3** (code migration) — Separate project, multi-session.

---

## File Count Summary

| Phase | Est. Files | Est. Time |
|-------|------------|-----------|
| Phase 1 | ~15 | 1–2 hours |
| Phase 2 | ~20 | 1 hour |
| Phase 3 | ~55 | Days (schema + migration) |
| Phase 4 | ~5 | 30 min |
| Phase 5 | Verification | 30 min |

---

*Created: Feb 2026. Phases 1, 2, 4 executed Feb 2026. Phase 3 (code migration) pending.*

**Phase 3 detailed plan**: See `docs/technical/FIRESTORE_TO_POSTGRES_MIGRATION_PLAN.md`. **Provision Postgres**: Neon via Vercel Marketplace (not Supabase). See `docs/technical/PROVISION_NEON_POSTGRES.md`.
