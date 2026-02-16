# Codebase Audit — Scripts, MD, JSON Cleanup

**Methodology**: B.L.A.S.T. for new projects; Agent Behavior for routine. SSOT: [METHODOLOGY.md](METHODOLOGY.md)  
**Source**: brain.md, CLAUDE.md, REPO_MAP.md, .cursorrules  
**Last Updated**: February 2026

**Contradictions resolved (Feb 2026)**:
- Airtable.com: Retired; Aitable.ai for dashboards. CLAUDE.md Section 3 updated.
- Firestore: Fully removed (Feb 2026). Zero runtime usage. `firebase-admin` kept for Storage only.

**Trim complete (Feb 2026)**:
- CLAUDE.md reduced to lean router (~3.7k chars, was 45k). Reference material moved to docs/INFRA_SSOT.md and docs/PRODUCT_BIBLE.md.

---

## 1. SCRIPTS DELETED ✅ (Obsolete per Architecture)

| Path | Reason |
|------|--------|
| `scripts/webflow/*` (5 files) | **Webflow retired.** All pages served by Next.js on Vercel. |
| `scripts/maintenance/deployment/deploy-webflow-mcp-server-simple.js` | Webflow retired. |
| `scripts/maintenance/bmad-testing-framework/*` (2 files) | **BMAD retired.** Use B.L.A.S.T. |
| `scripts/maintenance/seed-firestore.ts` | **Firestore retired.** Migration to Postgres complete. |
| `fix_proxy.js` (repo root) | One-off; hardcoded token (security). |
| `platforms/marketplace/engine/fix-proxy.js` | Duplicate. |
| `apps/web/rensto-site/debug_db.js` | Ad-hoc; not part of app. |
| `apps/web/rensto-site/simulate_fix.js` | Ad-hoc. |

---

## 2. SCRIPTS TO MOVE/MERGE (Future)

| From | To | Reason |
|------|-----|--------|
| `scripts/n8n/examples/*` | `infra/n8n-scripts/` | Consolidate n8n tooling. |

`apps/worker/tools/*` — **Keep in place.** Worker-specific diagnostics/E2E.

---

## 3. MD FILES — No Deletions

All MD files are either canonical (brain, CLAUDE, ARCHITECTURE, REPO_MAP) or in `legacy_archive`/`archive-root`. No redundant MD identified.

---

## 4. JSON FILES — Audit Only

- `local_bot_config.json`, `manual_cookies.json` at root — Ensure `.gitignore` excludes.
- `infra/workflow-artifacts/*.json` — Per README, gitignored artifacts.
