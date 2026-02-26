# Execution Plan — Phased

**Date**: February 2026  
**Source**: DECISIONS.md. Execute in order.

---

## Phase 1: Immediate (Done)

- [x] Remove production gate from `/api/video/jobs/from-zillow` — video create works in production
- [x] Create DECISIONS.md
- [x] Create CREDENTIAL_REFERENCE.md
- [x] Add REALTOR_PLACEMENT to 0baf5f36, archive from codebase
- [x] Update VIDEO_APP_USER_GUIDE (production enabled)
- [x] Add VIDEO_WORKER_URL to .env.example

**Verify**: [x] Deployed superseller-site (Feb 2026). superseller.agency no longer returns 503 production gate. Video create works when VIDEO_WORKER_URL is set and worker is reachable.

---

## Phase 2: Vercel Deploy Unification

**Goal**: One project (api-superseller-site) serves superseller.agency + api.superseller.agency. Single deploy on push.

**Steps** (manual in Vercel dashboard or via API):

1. In **api-superseller-site** → Settings → Domains: Add `superseller.agency`, `www.superseller.agency`
2. In **superseller-site** → Settings → Domains: Remove `superseller.agency`, `www.superseller.agency`
3. Merge env vars: Ensure api-superseller-site has all vars from superseller-site (VIDEO_WORKER_URL, DATABASE_URL, Stripe, etc.)
4. Rename api-superseller-site to superseller (optional) or leave as is
5. Update VERCEL_PROJECT_MAP.md
6. Test: Push to main → both domains deploy

**Rollback**: Re-add superseller.agency to superseller-site, remove from api-superseller-site. Redeploy superseller-site.

---

## Phase 3: QuickBooks MCP

**Goal**: Canonical QuickBooks = quickbooks-online-mcp-server. Docs updated. Optionally enable in MCP config.

**Steps**:

1. Update infra/README.md: `quickbooks-mcp-server` → `quickbooks-online-mcp-server` (canonical, Node.js)
2. Update .cursor/MCP_CONFIGURATION_STATUS.md: quickbooks-online-mcp-server is the one to use
3. Update .cursor/SETUP_COMPLETE.md: quickbooks-online-mcp-server
4. If enabling: Add quickbooks-online-mcp-server to ~/.cursor/mcp.json (command: node path/to/server). Requires .env with QUICKBOOKS_CLIENT_ID, etc.
5. quickbooks-mcp-server (Java): Document as legacy/disabled. Optionally move to infra/archive.

---

## Phase 4: Infra Cleanup + NotebookLM Scope

**Goal**: Verify infra folder usage. Move descriptions to notebooks. Archive unused.

**Steps**:

1. **saas-frontend**: Grep for imports. If none, add "Lead enrichment SaaS prototype; superseded by superseller-site" to notebook. Archive folder.
2. **design-tools**: Check usage. Add purpose to notebook. Archive if unused.
3. **n8n-client-delivery**: Confirm used for customer delivery. Add "when to use" to fc048ba8 (N8n). Keep if used.
4. **library/client-workflows**: Add summary to N8n notebook. Keep as reference or archive.
5. **waha**: Keep. Document as active in NOTEBOOKLM_SCOPE.

---

## Phase 5: Doc Consolidation

1. Add DECISIONS.md, CREDENTIAL_REFERENCE.md, NOTEBOOKLM_SCOPE to brain.md "Where to Read"
2. Add DECISIONS to CLAUDE.md Quick Reference
3. Questions answered → DECISIONS.md (QUESTIONS_FOR_USER archived)

---

## Verification Checklist (After Phase 1 Deploy)

- [ ] superseller.agency loads
- [ ] superseller.agency/video/create loads
- [ ] Paste Zillow URL + realtor image → Generate Tour → job created (not 503)
- [ ] /video/[jobId] loads with job data
- [ ] VIDEO_WORKER_URL set in Vercel for superseller-site (and api-superseller-site when merged)
