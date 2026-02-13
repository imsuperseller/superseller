# Local Docs → NotebookLM Migration Plan

**Purpose**: Migrate essential content from local .md files into NotebookLM notebooks. After migration, remove local docs so agents use NotebookLM only—no mixed references.

**Status**: Complete (Feb 13, 2026)

---

## Migration Map (Local Doc → Target Notebook)

| Local Doc | Target Notebook | Notebook ID | Rationale |
|-----------|-----------------|-------------|------------|
| REFERENCE_ALIGNMENT.md | B.L.A.S.T. canonical | 5811a372 | Hierarchy, conflict rules, cross-reference map |
| RENSTO_DESIGN_SYSTEM_REFERENCE.md | Google Stitch OR rensto website | 286f3e4a / 719854ee | Design tokens, colors, typography—Stitch uses for design; rensto website for site-specific |
| PIPELINE_SPEC.md | Zillow-to-Video | 0baf5f36 | Pipeline architecture, model rules |
| PIPELINE_MODEL_COMPLIANCE.md | Zillow-to-Video | 0baf5f36 | Model rules, realtor, tour, transitions |
| TOURREEL_STATUS_AND_FIXES.md | Zillow-to-Video | 0baf5f36 | Current status, fix history |
| AGENT_BEHAVIOR.md | B.L.A.S.T. canonical | 5811a372 | Completion rules, drift prevention |
| gemini.md (Constitution) | B.L.A.S.T. canonical | 5811a372 | Core constraints, data residency |

---

## Execution Order

1. Add content to notebooks (notebook_add_text)
2. Verify via notebook_query that content is findable
3. Update brain.md to minimal: NotebookLM index only; "All detail in notebooks"
4. Archive local docs to infra/archive/local-docs-migrated-2026-02/
5. Update .cursorrules to point to NotebookLM for all detail
6. Remove REFERENCE_ALIGNMENT, RENSTO_DESIGN_SYSTEM_REFERENCE (after in notebooks)
7. Remove apps/worker/*.md that were migrated (PIPELINE_SPEC, etc.)
8. Keep: progress.md, findings.md (execution logs—not reference)
9. Keep: Minimal brain.md (index only), minimal CLAUDE.md (router to notebooks)
10. Update docs/REMOVAL_LOG.md with migration record

---

## What Stays (Minimal)

- **brain.md** — NotebookLM index, North Star (1 para), conflict rule. No detailed hierarchy—that's in 5811a372 now.
- **CLAUDE.md** — "Read brain.md. Query NotebookLM for [topic]. Notebook IDs: ..." — router only
- **progress.md** — Execution log
- **findings.md** — Discoveries log
- **.cursorrules** — Architecture constraints (domains, Stripe URLs)—minimal, immutable
- **.cursor/rules/*.mdc** — Work method, agent behavior (alwaysApply)
- **README.md** — Project intro, how to run

---

## What Went (Archived → infra/archive/local-docs-migrated-2026-02/)

- REFERENCE_ALIGNMENT.md ✓
- RENSTO_DESIGN_SYSTEM_REFERENCE.md
- apps/worker/PIPELINE_SPEC.md
- apps/worker/PIPELINE_MODEL_COMPLIANCE.md
- apps/worker/TOURREEL_STATUS_AND_FIXES.md
- apps/worker/AGENT_SELF_AUDIT.md ✓ (archived to infra/archive/worker-docs-in-notebooklm-2026-02/)
- apps/worker/AGENT_HANDOFF.md ✓
- apps/worker/3-SCENE_VERIFICATION.md ✓
- AGENT_BEHAVIOR.md (→ 5811a372)
- gemini.md (→ 5811a372)
- apps/web/rensto-site/gemini.md
- docs/INFRA_SSOT.md, PRODUCT_BIBLE.md (if in cursorignore, add to notebooks first)
- Other worker/marketplace docs—batch after first wave

---

*Run migration, then delete this plan or move to REMOVAL_LOG.*
