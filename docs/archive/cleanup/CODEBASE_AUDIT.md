# SuperSeller AI Codebase Master Audit

**Date**: February 8, 2026  
**Purpose**: Single checklist of what to fix, re-organize, optimize, consolidate, remove, or align so the project is unambiguous for you and any future agent.

---

**Current status (as of Feb 2026):** Critical doc conflicts (1.1–1.3), root clutter (2.1, 2.2, 2.3), legal consolidation (3.1), ARCHITECTURE alignment (4.1), tsconfig packages include, quick wins (4–6), and root files second pass (§7) are **done**. Still open: infra workflow JSON rationalization (3.2). **Done Feb 2026:** rules.md 4.2, consistency updates (Postgres, Antigravity, B.L.A.S.T.). Next: **full folder-by-folder pass per §9**. Next step: work through **§9** in order 1→15.

---

## 1. CRITICAL – Contradicting / outdated docs (fix first)

### 1.1 Architecture: superseller.agency → Webflow vs Vercel

| File | Says |
|------|------|
| **`.cursorrules`** (root) | superseller.agency → **Vercel** (Next.js `apps/web/superseller-site/`). Webflow **archived/inactive**. |
| **`.cursor/rules.md`** | ~~superseller.agency → Webflow~~ → **Updated to Vercel.** |

**Action**: ✅ **Done.** `.cursor/rules.md` now matches: superseller.agency → Vercel, Webflow archived.

---

### 1.2 Broken references in CLAUDE.md

- **`docs/BIBLE.md`** – Linked as "SuperSeller AI Bible" and canonical docs. **File does not exist.**
- Sub-links: `docs/business/MODEL.md`, `docs/technical/STACK.md`, `docs/design/SYSTEM.md`, `docs/reference/JARGON.md` – **verify these exist** or update/remove the block.

**Action**: ✅ **Done.** Block in CLAUDE.md replaced with pointer to CLAUDE.md, ARCHITECTURE.md, CODEBASE_AUDIT.md.

---

### 1.3 Broken references in .cursor/rules.md

- **`ONE_SOURCE_OF_TRUTH.md`** – Rule 23 says "Update ONE_SOURCE_OF_TRUTH.md". **File does not exist.**
- **`MCP_SERVERS_AUTHORITATIVE.md`** – Referenced at end of rules.md (in .cursor). **File does not exist** (only MCP_CONFIGURATION_STATUS.md exists).

**Action**: ✅ **Done.** rules.md now points to CLAUDE.md (architectural changes) and MCP_CONFIGURATION_STATUS.md (MCP reference).

---

## 2. Root directory clutter (reorganize / remove)

### 2.1 One-off Python scripts (n8n workflow deploy/fix/clean)

Many single-use or variant scripts at repo root. Consolidate or archive.

- `antigravity_repair.py`, `clean_final_workflow.py`, `clean_submission.py`, `cleanup_workflow_connections.py`
- `deploy_workflow*.py` (deploy_workflow.py, deploy_workflow_compound_fix.py, deploy_workflow_condition_fix.py, deploy_workflow_defensive.py, deploy_workflow_final.py, deploy_workflow_id_fix.py, deploy_workflow_port_switch.py, deploy_workflow_refactor.py)
- `emergency_repair.py`, `final_connection_fix.py`, `final_data_fix.py`, `final_repair_master.py`
- `fix_expressions.py`, `fix_exterior_connection.py`, `fix_final_logic.py`, `fix_schema_urllib.py`, `fix_workflow_final.py`, `fix_workflow_names.py`, `fix_workflow.py`
- `patch_workflow_logic.py`, `prepare_api_payload.py`, `push_workflow.py`, `remaster_workflow.py`, `rename_and_fix.py`, `renovate_workflow.py`, `restore_and_standardize.py`, `spaceless_restore.py`, `update_workflow_v2.py`, `update_workflow.py`, `validate_json.py`, `generate_v5.py`

**Action**: ✅ **Done.** Moved to **`infra/n8n-scripts/`**: canonical `push_workflow.py` and `validate_workflow_json.py`; all other variants in `infra/n8n-scripts/archive/`. (Root `scripts/` is in .cursorignore so `infra/n8n-scripts/` was used.)

---

### 2.2 Root JSON / workflow artifacts

- `compact.json`, `connections.json`, `deploy.json`, etc.

**Action**: ✅ **Done.** Moved to **`infra/workflow-artifacts/`**. Added `.gitignore` rule `infra/workflow-artifacts/*.json` so generated artifacts there are not committed.

---

### 2.3 Files that should not be in repo root

- **`=`** – ✅ **Done.** Deleted (was empty).
- **`database.sqlite-shm`**, **`database.sqlite-wal`** – ✅ **Done.** Added to .gitignore.
- **`people status 21.1.2026/`** – Folder name has spaces; looks like private/operational notes. ✅ **Done.** Renamed to `people-status-2026-01-21/`, gitignored.
- **`tiktokJFoB1Ovq3YvAzsEwVx2CDwQLWyvSXgZq (1).txt`** – ✅ **Done.** Deleted (redundant with app route).
- **`da30463872ca05dbf70ac6bee7af5d49-... copy.webp`** – ✅ **Done.** Duplicate deleted; other .webp moved to docs/media.
- **`image_b64.txt`**, **`manual_cookies.json`**, **`local_bot_config.json`**, **`probe_*.txt`** – ✅ **Done.** Added to .gitignore.

---

## 3. Duplication and redundancy

### 3.1 Legal pages (`legal-pages/`)

Multiple variants of the same content:

- Privacy, Terms, LinkedIn variants.

**Action**: ✅ **Done.** Canonical: `privacy-policy.html`, `terms-of-service.html`, `linkedin-verification.html`; `index.html` is a simple index linking to them. All other variants moved to `legal-pages/archive/`. COMPLIANCE.md updated with canonical file table.

---

### 3.2 Infra workflow JSONs

Many similarly named workflow JSONs under `infra/` (e.g. `unified_marketplace_master*.json`, `*_restore*.json`, `*_WORKFLOW.json`). Hard for any agent to know which is "live".

**Action**: Keep one production definition (e.g. `unified_marketplace_master_production.json` or the one actually deployed). Archive or remove the rest; add a short README in `infra/` stating which file is the source of truth for n8n.

---

## 4. Documentation and rules alignment

### 4.1 ARCHITECTURE.md vs actual layout

ARCHITECTURE.md lists as **[ACTIVE]**:

- `packages/` – **Does not exist** at repo root.
- `scripts/` – **Does not exist** at repo root.
- `archives/` – **Does not exist** at repo root.
- `data/firestore` – **Not verified**; Firestore docs are under `firestore/`.

**Action**: ✅ **Done.** ARCHITECTURE.md folder map updated: `packages/` and root `scripts/`/`archives/` marked as not present with notes; real paths (`infra/`, `infra/n8n-scripts/`, `infra/archive/`, `firestore/`, `legal-pages/`) documented. Dead Zones now reference `infra/archive/`.

---

### 4.2 .cursor/rules.md vs reality

Rules refer to:

- `packages/schema`, `services/adapters`, `packages/identity`, `packages/db/migrations`, `tests/integration`, `docs/adr/`, `data/bmad-projects/`

**Action**: If these paths don’t exist, either create minimal structure or rewrite rules to point at actual paths (e.g. `apps/web/superseller-site/`, `firestore/`, `docs/`, `library/`).

---

### 4.3 Root tsconfig.json

Includes `"packages/**/*.ts"` but there is no `packages/` at root.

**Action**: Remove `packages/**/*.ts` from include, or add a comment that it’s for a future monorepo layout.

---

## 5. Security and .gitignore

- **.gitignore** already has `*.sqlite`, `*.db`, and many env/secret patterns. Ensure `*.sqlite-shm`, `*.sqlite-wal` are ignored so SQLite runtime files are never committed.
- **Cloudflare API token** appears in `.cursorrules`. Prefer env var or secret store; if it must stay in docs, restrict access and rotate if exposed.

---

## 6. Quick wins (do early)

1. **Fix .cursor/rules.md** – ✅ **Done.** superseller.agency → Vercel; Webflow archived.
2. **Fix CLAUDE.md** – ✅ **Done.** BIBLE.md block replaced with canonical doc pointers.
3. **.cursor/rules.md** – ✅ **Done.** ONE_SOURCE_OF_TRUTH → CLAUDE.md; MCP ref → MCP_CONFIGURATION_STATUS.md.
4. **Delete or document** the root file named `=`. ✅ **Done.** Deleted (was empty).
5. **Add to .gitignore**: `*.sqlite-shm`, `*.sqlite-wal`. ✅ **Done.**
6. **Rename** `people status 21.1.2026` → `people-status-2026-01-21`, add to .gitignore. ✅ **Done.**

---

## 7. Root files pass (second pass)

A second pass over root found and addressed:

| Item | Issue | Action taken |
|------|--------|----------------|
| `da30463872ca05dbf70ac6bee7af5d49-uncropped_scaled_within_1536_1152 copy.webp` | Duplicate of same-named .webp (with " copy") | **Deleted** duplicate. |
| `da30463872ca05dbf70ac6bee7af5d49-... .webp` | Image at root | **Moved** to `docs/media/`. |
| `tiktokJFoB1Ovq3YvAzsEwVx2CDwQLWyvSXgZq (1).txt` | Redundant with app route that serves same verification | **Deleted.** |
| `workflows jan22-2026.md` | Misnamed (JSON), huge export, space in name | **Moved** to `infra/workflow-artifacts/workflows-2026-01-22.json`. |
| `racknerd_index.html` | n8n UI snapshot residue | **Moved** to `infra/archive/`. |
| `compass_artifact_wf-..._text_markdown.md` | Content doc with long artifact name | **Moved** to `docs/reference/compass-artifact-ai-video-guide.md`. |
| `schemas.txt` | n8n data table schema dump | **Moved** to `infra/reference/schemas-n8n-data-tables.txt`. |
| `migration.sql`, `migration_consolidate_price.sql`, `migration_fix_price.sql` | Migrations at root | **Moved** to `infra/migrations/`. |
| `modernize_master.cjs` | One-off n8n script | **Moved** to `infra/n8n-scripts/archive/`. |
| `n8n-maintenance.sh`, `n8n-upgrade-to-latest.sh` | n8n shell scripts | **Moved** to `infra/n8n-scripts/`. |
| `local_bot_config.json`, `manual_cookies.json`, `probe_output.txt`, `probe_results.txt`, `image_b64.txt` | Residue / config that may contain secrets | **Added** to `.gitignore`. |

**Root after pass:** Only essential config and docs remain: `.cursorignore`, `.cursorrules`, `.env.example`, `.gitignore`, `ARCHITECTURE.md`, `CLAUDE.md`, `CODEBASE_AUDIT.md`, `package.json`, `README.md`, `server.py`, `tsconfig.json` (and dotfiles like `.antigravityignore`). No unnecessary duplicates, residue, or misplaced data at root.

---

## 8. Summary table

| Category | Status | Priority |
|----------|--------|----------|
| Doc contradictions (architecture) | Done | Critical |
| Broken doc links (BIBLE, ONE_SOURCE, MCP) | Done | High |
| Root Python scripts to consolidate | Done (infra/n8n-scripts) | High |
| Root JSON/artifacts to move | Done (infra/workflow-artifacts) | Medium |
| Legal-page duplicates | Done (canonical + archive) | Medium |
| ARCHITECTURE.md paths that don’t exist | Done (doc updated) | Medium |
| Root clutter (e.g. `=`, db files, people-status) | Done | Low–Medium |
| Infra workflow JSON rationalization (3.2) | Open | Medium |
| Full folder-by-folder pass (section 9) | Open — next step | High |

After these fixes (and the root files pass), the repo has one clear architecture story, no broken "single source of truth" links, and a minimal root: only essential config, docs, and `server.py`. No unnecessary duplicates, residue, or misplaced files at root.

---

## 9. Audit order: what to go over first (and what to check inside)

Use this order when reviewing **all** folders and files so that the highest-impact areas are consistent, conflict-free, and residue-free. Inside each, check: **updated**, **no conflicts**, **no contradictions**, **no consolidable duplicates**, **no residue**.

| # | Path | Why this order | What to check inside |
|---|------|----------------|----------------------|
| **1** | **`.cursor/`** | Every agent reads rules, context, MCP status. Wrong here = wrong everywhere. | `AGENT_CONTEXT.md`, `rules.md`, `rules/*.mdc`, `MCP_CONFIGURATION_STATUS.md`, `SETUP_COMPLETE.md`, `context.json`. No contradicting rules; links point to existing files; dates/status current. |
| **2** | **Root config + canonical docs** | Single source of truth and repo-wide config. | `.cursorrules`, `.cursorignore`, `.gitignore`, `.env.example`, `tsconfig.json`, `package.json`, `ARCHITECTURE.md`, `CLAUDE.md`, `CODEBASE_AUDIT.md`, `README.md`. Align with each other; no stale links; no duplicate “truth” in two places. |
| **3** | **`apps/web/superseller-site/`** | The app that ships (Vercel). Revenue and users depend on it. | `src/app/`, `src/components/`, `src/lib/`, `public/`. Then `api-backup/`, `temp-backup/`, `org-backup/`, `scripts/`, `n8n/`, `data/`, `prisma/` — identify dead/backup vs active; consolidate or archive. Root-level `.js`/`.md` (e.g. `list_clients.js`, `PRODUCTION_SETUP.md`) — still needed or move/remove. |
| **4** | **`infra/`** | MCP servers, n8n scripts, migrations, workflow JSONs. Automation and deploy. | `n8n-scripts/` (canonical vs archive clear), `migrations/`, `mcp-servers/` (each server’s README and config), `workflow-artifacts/`, `reference/`. **infra root:** many `*_WORKFLOW.json`, `unified_marketplace_*.json` — pick one production source; archive or remove the rest; add one-line README. `archive/`, `logging-database/`, `saas-frontend/`, `video-merge/`, `design-tools/`, `waha/`, `systemd/` — no outdated or conflicting instructions. |
| **5** | **`library/`** | Reference workflows and configs. Wrong names or duplicates confuse agents. | `client-workflows/` — naming consistent; which are current vs legacy. `legacy_data/` — many JSON configs (notion, sync, webflow, etc.); any redundant or superseded; one canonical per purpose. `solution-data/` — CSVs and usage clear. |
| **6** | **`legal-pages/`** | Already consolidated; quick pass. | Only canonical files at top level; `archive/` for variants only; `COMPLIANCE.md` matches. |
| **7** | **`directives/`** | n8n-focused how-to. | `debug_n8n_workflow.md`, `monitor_n8n_execution.md`, `n8n_debugging_guide.md`, `n8n_governance.md`, `n8n_strategy_guide.md` — no overlap or contradiction; references to URLs/instances current. |
| **8** | **`firestore/`** | Firestore design and client notes. | `FIRESTORE_*.md`, `INITIAL_CLIENT_DATA.md`, `IOLITE_*.md` — aligned with CLAUDE.md (Firestore as primary); no contradicting storage rules. |
| **9** | **`n8n-skills-drafts/`** | Skills for n8n; if used, must match current n8n. | `README.md` plus each `skill-*/SKILL.md` — consistent with current n8n version and with `.cursor/rules/` and `directives/`; no duplicate or conflicting guidance. |
| **10** | **`platforms/`** | Marketplace and saas-engine. Secondary to main app. | `marketplace/` — README, PRD, PLATFORM_BIBLE, configs, engine, saas-engine; no stale or duplicate config (e.g. cookies.json vs cookies-manual.json); align with main app if they integrate. |
| **11** | **`security/`** | Policies and runbooks. | `CREDENTIAL_*.md`, `POLICIES.md`, `SECURITY_INCIDENT_*.md`, `UNBLOCK_SECRETS_*.md` — consistent with each other and with .cursorrules/CLAUDE (e.g. Vault, no direct n8n API). |
| **12** | **`docs/`** | Large knowledge base. | `archive/` (reference only), `operations/`, `technical/`, `reference/`, `vault/`, `antigravity/`, `media/` — no broken cross-links; no “current” doc that contradicts CLAUDE or ARCHITECTURE; consolidate obvious duplicates. |
| **13** | **`.github/`** | PR and secrets templates. | `pull_request_template.md`, `SECRETS_TEMPLATE.md` — up to date with current stack and secrets policy. |
| **14** | **`.claude/`** | Claude skills (n8n-related). | `skills/n8n-*/` — match n8n version and patterns in `n8n-skills-drafts/` and `directives/`; remove or archive if superseded. |
| **15** | **Root loose files** | Last pass. | `_chat 2.txt`, `server.py` — purpose clear; no other residue left. |

**How to use:** Go in order 1 → 15. For each path, open the folder, scan files, and fix or document: outdated content, conflicts with other docs, duplicate/consolidable files, and leftover residue. When done, the whole repo is ordered and safe to progress from.
