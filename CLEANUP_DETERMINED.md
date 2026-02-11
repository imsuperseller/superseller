# Cleanup – 100% determined (not in place / outdated / consolidatable / redundant)

Items below are determined as: **not in place**, **outdated**, **consolidatable**, or **redundant**. Action = what to do.

---

## Outdated (wrong or stale)

| Where | What | Action |
|-------|------|--------|
| **README.md** (root) | Referenced missing paths (lead-machine-unified, Customers/*, docs/UNIFIED_LEAD_*). | ✅ **Done.** KEY DOCUMENTATION now points to CLAUDE.md, ARCHITECTURE.md, REPO_MAP.md, CODEBASE_AUDIT.md, CLEANUP_DETERMINED.md, .cursor/*, infra/README. Quick Start uses apps/web/rensto-site. Core Files section updated to main app paths. |
| **.cursor/SETUP_COMPLETE.md** | Says "13 servers", lists context7. MCP_CONFIGURATION_STATUS.md says 11 active, context7 removed. | ✅ **Done.** Added note at top: superseded by MCP_CONFIGURATION_STATUS.md. |
| **.cursor/context.json** | References packages, services, services/mcp-servers. | ✅ **Done (Feb 2026).** Updated: canonical = apps, infra, docs, library, platforms; mcp.servers = infra/mcp-servers; mcp.config = ~/.cursor/mcp.json; migration.web = apps/web/rensto-site. Removed bmad, packages, services. |
| **infra/README.md** | Date and MCP counts. | ✅ **Done (Feb 2026).** Updated to February 2026; 12 MCP servers; context7 removed. |

---

## Not in place (misplaced or should move)

| Where | What | Action |
|-------|------|--------|
| **infra/** (root) | ~25 workflow *.json files at infra root. | ✅ **Done.** All moved to **infra/archive/workflow-variants/** except **unified_marketplace_master_production.json** (canonical). **infra/README.md** updated with workflow JSON / n8n-scripts summary. |
| **apps/web/rensto-site/** root | Loose scripts/docs. | ✅ **Done (Feb 2026).** Moved to `archive-root/`: webflow.json, list_all_clients.js, get_logos_status.js, explore_firestore.ts, master-bot-patched.js, mock_event.json, verify_db.js, verify_prod_db.js, update_logos_firestore.js, test-provisioning.ts, get_samples.ts, seed-approvals.cjs, seed-usage.cjs. Deleted netlify.toml (Vercel only). Remain: DESIGN_OPTIMIZATION_PLAN.md, FIRESTORE_*.md, ENVIRONMENT_SETUP.md, PRODUCTION_SETUP.md, Dockerfile, seed_logos.js (if exists) — decide when ready. |
| **_chat 2.txt** (root) | WhatsApp export; private-ish. | ✅ **Done (Feb 2026).** Added to .gitignore. |

---

## Consolidatable (merge or single source)

| Where | What | Action |
|-------|------|--------|
| **library/legacy_data/** | **sync-config.json** and **sync-configuration.json** | ✅ **Documented.** README explains: sync-config = high-level; sync-configuration = field mapping. Both legacy. |
| **library/legacy_data/** | **notion-*.json**, **webflow*.json** | **Documented** in README grouping. Full consolidate (notion-config/, webflow/) when ready. |
| **directives/** | 5 n8n docs | ✅ **Done.** directives/README.md indexes all 5; governance has Antigravity-primary note. |
| **apps/web/rensto-site/** | **api-backup/** vs **src/app/api/** | **Confirm** live routes are only in src/app/api/; then treat api-backup as read-only archive (add README: "Archive; live API is src/app/api/."). |
| **apps/web/rensto-site/** | **temp-backup/** and **org-backup/** | **Confirm** live admin is src/app/admin/; add README in each backup: "Archive; live admin is src/app/admin/." |

---

## Redundant (remove or archive)

| Where | What | Action |
|-------|------|--------|
| **apps/web/rensto-site/** | **netlify.toml** | **Remove** if you only deploy to Vercel (per .cursorrules). |
| **apps/web/rensto-site/** | **Dockerfile** | **Keep only if** you run Docker for this app; else archive or remove. |
| **.cursor/rules.md** | Rules 3–6 reference **packages/schema**, **services/adapters**. These don't exist. | ✅ **Done.** rules.md has B.L.A.S.T. (not BMAD). Paths: use apps/web/rensto-site or infra/ where packages/services don't exist. |

---

## Quick wins (do first)

1. **Update root README.md** – Done.  
2. **infra:** Move loose workflow *.json to **infra/archive/workflow-variants/**; **infra/README.md** – Done.  
3. **.cursor/SETUP_COMPLETE.md** – Done.  
4. **apps/web/rensto-site:** Add **api-backup/README.md**, **temp-backup/README.md**, **org-backup/README.md**. ✅ **Done.** Each says archive; live API = src/app/api/, live admin = src/app/admin/.  
5. **library/legacy_data:** Add **README.md** listing which configs are current vs legacy. ✅ **Done.** README added: all legacy unless stated; see CLAUDE.md and CLEANUP_DETERMINED for consolidation.  

---

After these, the repo will match the "new order" and you’ll have one place (this file + REPO_MAP.md) to recognize what’s in place and what’s not.
