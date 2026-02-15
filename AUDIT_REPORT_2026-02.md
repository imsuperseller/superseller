# Audit Report — Codebase, NotebookLM, Server

**Date**: February 13, 2026  
**Scope**: Codebase, NotebookLM, server references, docs, security

---

## 1. Critical Fixes Applied

| Item | Location | Fix |
|------|----------|-----|
| **Hardcoded password** | `infra/execute-optimization-phase4-5.sh` | Replaced with `VPS_PASSWORD` env var. |
| **Hardcoded root password** | `apps/web/rensto-site/src/app/api/admin/n8n/route.ts` | Replaced with `VPS_PASSWORD` or `RACKNERD_SSH_PASSWORD`. Admin SSH to RackNerd requires env var. |

**Git history**: The old password `05ngBiq2pTA8XSF76x` appears in history (deleted `deploy-to-racknerd.js`, old execute script). Root password = SSH connection credential. Rotate it on the VPS; both old and any exposed current passwords should be changed.

---

## 2. Document Consolidation

| Doc | Status | Action |
|-----|--------|--------|
| **ZILLOW_VIDEO_PRODUCT_STATUS.md** | Deployment/UI status | Cross-ref to TOURREEL_REALTOR_HANDOFF_SPEC. |
| **TOURREEL_REALTOR_HANDOFF_SPEC.md** | Pipeline flow (§0), handoff | Canonical for pipeline. (TOURREEL_STATUS_AND_FIXES migrated.) |
| **brain.md** | NotebookLM index | Filled in purpose for notebooks 2–13 (KIE.AI, N8n, Stitch, etc.). |

---

## 3. NotebookLM

| Finding | Action |
|---------|--------|
| **18 notebooks** (brain had blanks) | brain.md updated with titles for #2–13. |
| **New notebooks**: mivnim, Claude Code, shai social, fal.ai, higgsfield.ai | Not in brain table; add to docs/NOTEBOOKLM_INDEX if maintained. |
| **fal.ai** (8a655666) | Legacy for TourReel. Keep for reference. |
| **n8n.rensto.com** | Health check OK. MCP online. |

---

## 4. Server References

| Reference | Status |
|-----------|--------|
| **172.245.56.50** | n8n (5678), video-merge (5050). Use n8n.rensto.com where applicable. |
| **RackNerd VPS** | Consistent across .cursorrules, infra. |

---

## 5. Suggested (Non-Critical)

| Item | Suggestion |
|------|------------|
| **library/solution-data/uad.csv** | URLs point to 172.245.56.50:8080. Update if server changes. |
| **docs/templates/tourreel/** vs **apps/worker/legacy_archive** | Verify which is canonical for TourReel templates. |
