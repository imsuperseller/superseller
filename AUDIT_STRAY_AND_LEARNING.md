# Audit: Stray Files, Remaining Updates, Learning Documentation

**Date**: Feb 2026  
**Purpose**: Handover readiness — identify files that confuse, gaps to fix, and where we learn from issues.

---

## 1. Stray/Orphan Files (Could Confuse Handover)

### ✅ OK — Clear Purpose

| Path | Status |
|------|--------|
| `temp-backup/`, `api-backup/`, `org-backup/` | README: "Archive, do not add." Explicit. |
| `legacy_archive/` | Canonical archive; README points to TOURREEL_REALTOR_HANDOFF_SPEC. |
| `apps/worker/*RESEARCH*.md` (6 files) | Research supporting pipeline; DOC_UPDATE_PLAN covers them. |
| `SESSION_DEBUG_SUMMARY.md` | Session-specific fixes (hydration, route groups). Useful operational history. |
| `DEPLOY_VIDEO_PAGE_FIX.md` | Operational fix for Vercel root dir. Belongs. |
| `LOCAL_TO_NOTEBOOKLM_MIGRATION*.md` | Historical; "As of Feb 2026" note clarifies current SSOT. |

### ⚠️ Consider Archiving or Clarifying

| Path | Issue |
|------|-------|
| `AUDIT_REPORT_2026-02.md` | One-time audit. Add "Historical — Feb 2026" at top so it's not treated as live process. |
| `SESSION_DEBUG_SUMMARY.md` | Lives in rensto-site. Per CODEBASE_VS_NOTEBOOKLM, detailed lessons → NotebookLM. Could add: "Session notes; root causes also in findings.md." |

### ❌ Missing / Broken References

| Referenced | Exists? | Fix |
|------------|---------|-----|
| `REFERENCE_ALIGNMENT.md` | No (migrated) | findings.md line 9 says "Created" — historical; no fix needed. |
| `AGENT_BEHAVIOR.md` | No (content in .cursor/rules/agent-behavior.mdc) | findings.md line 22 references it — update to "work-method-accountability.mdc / agent-behavior" |
| `learning.log` | No | brain.md, .cursorrules reference it. Create or consolidate to findings.md. |

---

## 2. Remaining Updates After Recent Changes

| Item | Status |
|------|--------|
| PIPELINE_SPEC / Veo / Kie refs | ✅ Fixed in prior session |
| progress.md, findings.md refs | ✅ Fixed |
| learning.log vs findings.md | ⚠️ Unresolved — see §3 |
| findings.md line 9 (REFERENCE_ALIGNMENT) | Optional — historical |
| findings.md line 22 (AGENT_BEHAVIOR) | Update to correct rule path |

---

## 3. Document Progress & Learn From Issues

**Question**: Do we have somewhere where we document progress and use issues to learn so we never repeat them?

### Current State

| File | Purpose | Used For "Never Repeat"? |
|------|---------|-------------------------|
| **progress.md** | Execution logs, task completion | ✅ Yes — what was done |
| **findings.md** | Research, discoveries, root causes | ✅ Yes — work-method says "Update findings.md with root cause so it does not recur" |
| **learning.log** | Was referenced in brain, .cursorrules | ❌ Removed; findings.md is the single place |
| **lessons.md** | `legacy_archive/lessons.md` — patterns to avoid, gotchas | ✅ Good content but buried |

### Gap

- **learning.log** is referenced but missing. Either:
  - **A)** Create `learning.log` as a dedicated "never repeat" log, or
  - **B)** Treat **findings.md** as the single place; update brain and .cursorrules to drop learning.log and say "findings.md (root cause, never repeat)."

### Recommendation (Applied Feb 2026)

**findings.md** is the single place. Reasons:
- work-method-accountability already says "Update findings.md with root cause so it does not recur"
- findings.md has the right structure (dated entries, root causes)
- Avoids a third file (progress + findings + learning = redundant)

**Done**: brain.md and .cursorrules updated. findings.md = "root cause, never repeat."

### lessons.md (legacy)

- `apps/worker/legacy_archive/lessons.md` has: Verification Protocol, Patterns to Avoid, Known Gotchas, Hallucinated Data Leaks.
- Per CODEBASE_VS_NOTEBOOKLM, "Lessons learned" live in NotebookLM 0baf5f36.
- **Action**: Add a line to findings.md or brain.md: "Historical lessons: legacy_archive/lessons.md; ongoing: findings.md."

---

## 4. Handover Checklist (Strict Project Rules)

Before handover, ensure:
1. All refs point to existing files (no broken PIPELINE_SPEC, learning.log, etc.)
2. Single place for "never repeat" is explicit (findings.md)
3. Archive folders have clear README ("Do not add; reference only")
4. DOC_UPDATE_PLAN is run after any doc change

---

## 5. Folder Structure Alignment (Feb 2026)

**Completed**: brain.md UNIFIED LAYOUT, ARCHITECTURE.md, REPO_MAP.md, .claude/skills/README.md updated to match actual structure. Removed refs to: architecture/, tools/, .tmp/, .agent/skills/, directives/, legal-pages/. Fixed Firestore migration ref. Skills documented in .claude/skills/.
