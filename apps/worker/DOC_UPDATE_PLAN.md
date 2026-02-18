# Documentation Update Plan — Zero Irrelevance, Zero Conflicts

**Purpose**: Systematic process to keep all docs aligned after code changes.  
**Last sync**: Feb 2026  
**Trigger**: After major feature work (e.g. video pipeline, selective regen, new APIs).

**Status**: Executed Feb 2026. Grep for PIPELINE_SPEC|TOURREEL_STATUS_AND_FIXES: all refs are explanatory (migrated/deleted); no broken links.

---

## 1. SSOT Hierarchy (What Wins When Docs Conflict)

| Topic | Primary SSOT | Secondary |
|-------|--------------|-----------|
| Video pipeline architecture | NotebookLM 0baf5f36 | `TOURREEL_REALTOR_HANDOFF_SPEC.md` |
| Video user flows, progress, APIs | `VIDEO_APP_USER_GUIDE.md` | — |
| Product/deployment status | `ZILLOW_VIDEO_PRODUCT_STATUS.md` | — |
| Infrastructure | `docs/INFRA_SSOT.md` | — |
| Product/billing | `docs/PRODUCT_BIBLE.md` | — |

**Broken refs to fix**: `PIPELINE_SPEC.md` and `TOURREEL_STATUS_AND_FIXES.md` are **deleted/migrated**. Replace with `TOURREEL_REALTOR_HANDOFF_SPEC.md` or NotebookLM 0baf5f36.

**Pipeline flow (technical)**: `TOURREEL_REALTOR_HANDOFF_SPEC.md` §0 — Nano composite → Kling interpolate; no injection at Kling. Kie refs: kie.ai/kling-3-0, kie.ai/nano-banana-pro.

---

## 2. Change Log (What Changed — Use for Updates)

**Recent changes (Feb 2026)**:

| Change | Files | Docs to update |
|--------|-------|----------------|
| Selective clip regeneration | `tools/regen-clips.ts`, `services/regen-clips.ts`, API `POST /jobs/:id/regenerate` | VIDEO_APP_USER_GUIDE, TOURREEL_REALTOR_HANDOFF_SPEC |
| Nano Banana progress 20→35% | `video-pipeline.worker.ts` | VIDEO_APP_USER_GUIDE |
| Double-realtor fix | `kie.ts`, `video-pipeline.worker.ts` | VIDEO_APP_USER_GUIDE, DOUBLE_REALTOR_RESEARCH |
| TOURREEL_REALTOR_HANDOFF_SPEC §6 | Selective regen done | — (already updated) |
| In-app Regenerate button | `VideoGeneration.tsx` | VIDEO_APP_USER_GUIDE, REFERENCE_VS_REALITY |

---

## 3. Doc-by-Doc Update Checklist

### A. `VIDEO_APP_USER_GUIDE.md` ✅ (Feb 15, 2026)

| Section | Status |
|---------|--------|
| §2 What's Deployed | Done: double-realtor, Nano progress, selective regen |
| §3 Feedback/Regenerate | Done: marked Selective regen + Re-stitch as DONE; in-app regen button DONE; backlog clarified |
| §4 Will It Work? | Done: selective regen Yes, full feedback No |
| §5 References | Done: PIPELINE_SPEC → TOURREEL_REALTOR_HANDOFF_SPEC |
| Progress behavior | Done: full progress curve in §2 |

### B. `ZILLOW_VIDEO_PRODUCT_STATUS.md` ✅ (Feb 15, 2026)

| Section | Status |
|---------|--------|
| §2 Current State | Done: worker deployed, create UI at /video/create |
| §1 ref | Done: TOURREEL_STATUS_AND_FIXES → TOURREEL_REALTOR_HANDOFF_SPEC |

### C. References to `PIPELINE_SPEC.md` or `TOURREEL_STATUS_AND_FIXES.md` ✅ (Feb 15, 2026)

| File | Status |
|------|--------|
| `VIDEO_APP_USER_GUIDE.md` | Done |
| `ZILLOW_VIDEO_PRODUCT_STATUS.md` | Done |
| `REFERENCE_VS_REALITY.md` | Done |
| `CLAUDE_CODE_WORKFLOW.md` (root) | Done |
| `platforms/marketplace/PRODUCT_SPEC_TEMPLATE.md` | Done |

---

## 4. Process (Repeat After Major Changes)

1. **Maintain change log** (§2) when shipping features.
2. **Run this checklist** — for each doc in §3, verify and apply fixes.
3. **Grep for broken refs**: `rg "PIPELINE_SPEC|TOURREEL_STATUS_AND_FIXES" -g "*.md"`
4. **Conflict rule**: Code > SSOT doc > older doc. When in doubt, delete or archive stale content.
5. **Date docs**: Add "Last updated: YYYY-MM-DD" at top.
6. **Commit together**: Doc updates in same PR as code when possible.

---

## 5. UI vs Wireframe (Job Detail — Section 8)

**Wireframe**: `legacy_archive/claude ref/ui wireframe.md` §8 Job Detail Page.

| Wireframe element | Status | Notes |
|-------------------|--------|-------|
| Progress bar, pipeline steps | ✅ | VideoGeneration has ProgressBar, steps |
| Clip grid / queue | ✅ | Clip Queue panel, scene selection |
| Main video player | ✅ | Active clip or master preview |
| Regenerate section | ✅ | In-app: select scenes → Regenerate selected |
| Download Panel (16:9, 9:16, 1:1, 4:5) | ❌ Backlog | Wire wants format cards + Download buttons |
| Share section (copy link, embed) | ❌ Backlog | Wire wants direct link + embed code inputs |
| Metadata collapsible | ❌ Backlog | Wire wants Created, Duration, Model, etc. |

**Agent behavior**: After UI changes, re-check this table and update REFERENCE_VS_REALITY.

---

## 6. Handover / Stray File Audit

Before handover: Check findings.md (doc hygiene), progress.md, broken refs. Stray/learning audit archived.

---

## 7. Quick Audit Commands

```bash
rg "PIPELINE_SPEC|TOURREEL_STATUS_AND_FIXES" -g "*.md"
rg -i "tourreel|video.pipeline|regen.clips|selective.regen" -g "*.md" --files-with-matches
```
