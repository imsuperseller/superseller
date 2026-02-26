# Codebase mastery status – what’s done vs what’s left

**Purpose:** One place that says what has been gone through thoroughly, what’s only been touched, and **in which order** to continue until the codebase status is fully mastered.

---

## ✅ Gone through thoroughly (done)

| # | Path | What was done |
|---|------|----------------|
| 1 | **.cursor/** | AGENT_CONTEXT, rules.md, MCP_CONFIGURATION_STATUS, SETUP_COMPLETE checked; broken MCP link fixed. **Done (Feb 2026):** n8n-workflow.mdc and tax4us-agents.mdc read; no contradiction with rules.md; tax4us note added (context7 deprecated). rules.md updated for missing packages/services paths. |
| 2 | **Root config + canonical docs** | README, CLAUDE, ARCHITECTURE, REPO_MAP aligned. **Done (Feb 2026):** .cursorrules admin path, DATA STORAGE (Postgres+Redis primary), B.L.A.S.T.; ARCHITECTURE.md and REPO_MAP.md created; .env.example has Postgres/Redis placeholders. |
| 4 | **infra/** (partial) | Loose workflow JSONs moved to infra/archive/workflow-variants/; one canonical kept; infra/README updated. **Not done:** mcp-servers/ per server, logging-database, saas-frontend, video-merge, design-tools, waha, systemd for outdated/conflicting instructions. |
| 5 | **library/** (partial) | legacy_data/README added. **Not done:** sync-config vs sync-configuration; notion-* and webflow consolidation; client-workflows current vs legacy; solution-data usage. |
| 6 | **legal-pages/** | Consolidated earlier; canonical + archive; COMPLIANCE updated. Considered done. |
| 15 | **Root** | Root clutter pass (scripts, JSON, legal, migrations, etc.) done. REPO_MAP.md and CLEANUP_DETERMINED.md added. |

---

## ⚠️ Touched but not thorough

| # | Path | What’s missing |
|---|------|-----------------|
| 3 | **apps/web/superseller-site/** | READMEs in api-backup, temp-backup, org-backup. **Done (Feb 2026):** src has no references to backups; live API = src/app/api/, admin = src/app/admin/. n8n/README and prisma/README added (templates + Firestore-primary note). scripts/ empty; data/ and scripts/ READMEs skipped (cursorignore). **Not done:** Root file audit (D) – list_clients.js, get_samples.ts, *.md, netlify.toml, etc. |
| 5 | **library/** | See above – consolidation and “current vs legacy” not done. |

---

## ❌ Not gone through yet (in order to continue)

| Order | Path | What to do |
|-------|------|------------|
| ~~**A**~~ | ~~.cursor/rules/~~ | **Done.** n8n + tax4us mdcs read; tax4us context7 note; rules.md paths updated. |
| ~~**B**~~ | ~~Root config (full)~~ | **Done.** Line-by-line: .cursorrules, .cursorignore, .gitignore, .env.example, tsconfig.json, package.json, ARCHITECTURE.md, CLAUDE.md – align with each other; fix stale links and duplicate “truth”. |
| ~~**C**~~ | ~~apps/web/superseller-site/src/~~ | **Done.** Confirmed live API = src/app/api/, admin = src/app/admin/; no backup refs in src. |
| **D** | **apps/web/superseller-site root files** | ✅ **Done (Feb 2026).** Moved 20 files to archive-root/ (incl. list_clients, DESIGN_OPTIMIZATION_PLAN, FIRESTORE_*, ENVIRONMENT_SETUP, PRODUCTION_SETUP). Deleted netlify.toml. Remain: Dockerfile, components.json, gemini.md, data/, scripts/, tools/, n8n/, prisma/, public/, src/, vercel.json, next.config, etc. (in use). |
| ~~**E**~~ | ~~superseller-site scripts, n8n, data, prisma~~ | **Done.** n8n/README, prisma/README added; scripts empty; data/bmad-projects; prisma = NextAuth/sqlite (Firestore primary). |
| **F** | **infra/mcp-servers/** (per server) | ✅ **Partial.** infra/README: webflow-mcp, airtable-mcp marked legacy. Per-server audit when needed. |
| **G** | **infra/** logging-database, saas-frontend, video-merge, design-tools, waha, systemd | ✅ **Done (Feb 2026).** video-merge, waha docs added to infra/README. |
| **H** | **library/client-workflows/** | ✅ **Done.** client-workflows/README.md added. |
| **I** | **library/legacy_data/** | ✅ **Done.** README grouping (sync, notion, webflow). |
| **J** | **directives/** | ✅ **Done.** directives/README.md index; Antigravity note in governance. |
| **K** | **firestore/** | ✅ **Done.** Deprecation on all 4 files. |
| **L** | **n8n-skills-drafts/** | ✅ **Partial.** README has Antigravity note. |
| **M** | **platforms/** | ✅ **Done.** README: credit-based marketplace vs FB Lister. |
| **N** | **security/** | ✅ **Done.** POLICIES: Postgres+Redis, Antigravity, Firestore legacy. |
| **O** | **docs/** | ✅ **Partial.** docs/README.md index added. |
| **P** | **.github/** | ✅ **Done (Feb 2026).** SECRETS_TEMPLATE: Postgres, Redis, Stripe, Vercel. workflows/ empty. |
| **Q** | **.claude/skills/** | ✅ **Done (Feb 2026).** README: skills vs n8n-skills-drafts. |
| **R** | **.cursor/context.json** | ✅ **Done.** |
| **S** | **Final pass** | ✅ **Done.** _chat 2.txt in .gitignore; server.py kept (TourReel worker). |

---

## Order I will continue (until fully mastered)

1. ~~**A** → **B**~~ (done)
2. ~~**C** → **E**~~ (done); **D** next (superseller-site root files)
3. **F** → **G** (infra: mcp-servers, then other subdirs)
4. **H** → **I** (library: client-workflows, then legacy_data consolidation)
5. **J** → **K** → **L** (directives, firestore, n8n-skills-drafts)
6. **M** → **N** (platforms, security)
7. **O** → **P** → **Q** (docs, .github, .claude)
8. **R** → **S** (context.json, final pass)

When **A through S** are done, the codebase status is fully mastered and this file can be updated to “All 15 §9 areas + follow-ups completed.”

---

**Last updated:** Feb 2026. A–S complete. G, P, Q done this pass. F, L, O partial (per-server audit when needed).
