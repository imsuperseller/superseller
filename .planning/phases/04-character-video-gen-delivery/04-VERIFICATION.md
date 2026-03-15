---
phase: 04-character-video-gen-delivery
verified: 2026-03-15T02:45:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 04: Character Video Gen & Delivery Verification Report

**Phase Goal:** Generate character videos via Kie.ai Sora 2, wrap in Remotion reveal, deliver via WhatsApp.
**Verified:** 2026-03-15T02:45:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                | Status     | Evidence                                                                                             |
|----|--------------------------------------------------------------------------------------|------------|------------------------------------------------------------------------------------------------------|
| 1  | System generates 5 Sora 2 scene videos from CharacterBible prompts                  | VERIFIED   | `buildScenePrompts()` builds 5 scenes (2 auto + up to 3 from scenario_prompts, padded if short). `generateAllScenes()` submits all 5 in parallel via `Promise.all`. Lines 127-161, 265-360.     |
| 2  | 2 auto-generated scenes (intro portrait + stylized closer) plus 3 from scenario_prompts | VERIFIED | Scene 0: intro portrait prompt; Scenes 1-3: `scenarioPrompts.slice(0,3)` prefixed with handle; Scene 4: stylized closer. Lines 132-148. Padding logic fills if scenario_prompts < 3.          |
| 3  | All Sora 2 API costs tracked via trackExpense()                                      | VERIFIED   | `trackExpense({ service: "kie.ai", operation: "sora-2-pro", estimatedCost: SORA_COST_PER_SCENE })` called per scene after each successful upload. Lines 338-344.                              |
| 4  | Generation failures are retried once, partial success is acceptable                  | VERIFIED   | 2-attempt retry loop per scene (lines 278-303). `MIN_SCENES_TO_PROCEED = 3`; if < 3 succeed, PipelineRun marked failed; if 3+, pipeline continues. Lines 838-858.                            |
| 5  | Remotion CharacterReveal composition renders 5 scene clips with branded overlays     | VERIFIED   | `CharacterRevealComposition.tsx` (332 lines): IntroCard (3.5s) + 5 SceneClips (5s each, OffthreadVideo + label overlay + FilmGrain + Vignette) + OutroCard (3.5s) via TransitionSeries.       |
| 6  | Composition includes logo, character name, accent colors from inputProps             | VERIFIED   | `CharacterRevealProps` consumed directly: `characterName`, `accentColor`, `logoUrl` rendered in IntroCard. OutroCard renders `characterName` and `businessName`. Lines 56-122, 189-249.       |
| 7  | Remotion renders CharacterReveal composition into MP4 on disk                        | VERIFIED   | `renderComposition({ compositionId: "CharacterReveal-16x9", inputProps: revealProps, outputPath })` called with retry (2 attempts). Lines 462-502.                                            |
| 8  | Final MP4 uploaded to R2 and registered as TenantAsset                               | VERIFIED   | `uploadToR2(outputPath, r2Key, "video/mp4", { tenantId, type: "video", filename: "character-reveal.mp4", metadata: {...} })` with retry. Lines 518-550.                                      |
| 9  | WAHA sends the reveal video to the WhatsApp group with summary caption               | VERIFIED   | `sendVideo(groupId, revealUrl!, caption)` called with 5-scene caption. Billing-model-conditional cost line. Graceful failure: PipelineRun records `deliveredVia: "failed"` but module advances. Lines 592-596. |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact                                                                 | Expected                                              | Status     | Details                                                    |
|--------------------------------------------------------------------------|-------------------------------------------------------|------------|------------------------------------------------------------|
| `apps/worker/src/services/onboarding/modules/character-video-gen.ts`     | Sora 2 scene generation + polling + cost tracking     | VERIFIED   | 902 lines (plan min_lines: 150 for Plan 01, 250 for Plan 03). Substantive. |
| `apps/worker/src/services/onboarding/modules/types.ts`                   | "character-video-gen" in ModuleType union             | VERIFIED   | Line 16: `\| "character-video-gen"` present in union.      |
| `apps/worker/remotion/src/CharacterRevealComposition.tsx`                | Remotion composition rendering 5 AI scenes            | VERIFIED   | 332 lines. TransitionSeries, OffthreadVideo, IntroCard, SceneClip (with labels), OutroCard. |
| `apps/worker/remotion/src/types/character-reveal-props.ts`              | TypeScript props interface for CharacterReveal        | VERIFIED   | 10 lines. Exports `CharacterRevealProps` with all required fields. |
| `apps/worker/remotion/src/Root.tsx`                                      | Registration of CharacterReveal-16x9 composition      | VERIFIED   | Lines 369-385. `<Composition<CharacterRevealProps> id="CharacterReveal-16x9" .../>` registered. |

---

### Key Link Verification

| From                        | To                     | Via                                             | Status  | Details                                              |
|-----------------------------|------------------------|-------------------------------------------------|---------|------------------------------------------------------|
| `character-video-gen.ts`    | `model-router.ts`      | `routeShot()` for Sora 2 scene generation       | WIRED   | `import { routeShot } from "../../model-router"` (line 30); called at line 189 for each scene. |
| `character-video-gen.ts`    | `pipeline-run.ts`      | `createPipelineRun` + `updatePipelineRun`        | WIRED   | Imported line 27; `createPipelineRun` called line 799; `updatePipelineRun` called at lines 407, 485, 536, 599, 814, 847, 870. |
| `character-video-gen.ts`    | `expense-tracker.ts`   | `trackExpense` per Sora 2 scene                 | WIRED   | Imported line 28; called at line 338 per successful scene. |
| `character-video-gen.ts`    | `remotion-renderer.ts` | `renderComposition("CharacterReveal-16x9", ...)` | WIRED  | Imported line 31; called at line 462 with compositionId `"CharacterReveal-16x9"`. |
| `character-video-gen.ts`    | `r2.ts`                | `uploadToR2` for both scene clips + reveal MP4  | WIRED   | Imported line 29; called at line 322 per scene and line 520 for reveal MP4. |
| `character-video-gen.ts`    | `waha-client.ts`       | `sendVideo` to WhatsApp group                   | WIRED   | Imported line 32; called at line 592 with groupId + revealUrl + caption. |
| `Root.tsx`                  | `CharacterRevealComposition.tsx` | Composition registration with id and defaultProps | WIRED | Import at line 11; `<Composition<CharacterRevealProps> id="CharacterReveal-16x9" component={CharacterRevealComposition} .../>` at lines 369-385. |
| `CharacterRevealComposition.tsx` | `components/shared` | FilmGrain and Vignette from existing shared components | WIRED | Imports at lines 16-17; `<FilmGrain />` at lines 148, 322; `<Vignette />` at line 146. |
| `module-router.ts`          | `character-video-gen.ts` | MODULE_REGISTRY entry + lazy import           | WIRED   | Registry entry at line 50, loader at line 52: `import("./modules/character-video-gen").then(m => ({ module: m.characterVideoGenModule }))`. INTRO_MESSAGES entry at line 91. |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                                     | Status    | Evidence                                                                    |
|-------------|-------------|-------------------------------------------------------------------------------------------------|-----------|-----------------------------------------------------------------------------|
| CHAR-05     | 04-01       | System generates reference character video via Kie.ai Sora 2 API                               | SATISFIED | `generateScene()` uses `routeShot()` → adapter submits to Sora 2 Pro. Per-scene polling with 10-min timeout. |
| CHAR-06     | 04-01       | System generates 5 test scene videos via Kie.ai Sora 2 (job site, studio, street, office, stylized) | SATISFIED | 5 scenes built: auto intro portrait, 3 from scenario_prompts, auto stylized closer. Partial: no explicit "job site/street/office" scene types — prompts are CharacterBible-driven (more flexible). Plan accepted this variation. |
| CHAR-07     | 04-02       | Remotion "CharacterReveal" composition wraps 5 scenes with branded overlays (logo, name, colors) | SATISFIED | CharacterRevealComposition: logo via Img, character name in IntroCard/OutroCard, accentColor applied throughout, scene labels per clip. |
| CHAR-08     | 04-03       | FFmpeg renders final MP4 on RackNerd, uploaded to R2 as TenantAsset                            | SATISFIED (note) | Remotion's `renderComposition()` is used (which calls `@remotion/renderer` + FFmpeg internally). Not raw FFmpeg — but the outcome is identical: MP4 rendered locally, uploaded to R2 as TenantAsset. The requirement's intent (on-server render + R2 upload) is fully met. |
| CHAR-09     | 04-03       | WAHA delivers character reveal video to WhatsApp group with summary message                     | SATISFIED | `sendVideo(groupId, revealUrl!, caption)` with 5-scene caption. Graceful fallback on WAHA failure. |
| CHAR-10     | 04-01, 04-03 | All generation steps tracked via PipelineRun with cost via trackExpense()                       | SATISFIED | `createPipelineRun` at start; `trackExpense` per scene; `updatePipelineRun` at generation complete, render fail, upload fail, and final delivery with `costCents`, `deliveredVia`, `deliveredAt`. |

**Note on CHAR-08:** The requirement text says "FFmpeg renders" — the implementation uses Remotion's `renderMedia()` which calls FFmpeg under the hood (`@remotion/renderer`). This is a naming difference, not a functional gap. The outcome (MP4 on RackNerd disk → R2 upload → TenantAsset record) is fully satisfied.

---

### Anti-Patterns Found

| File                          | Line | Pattern                                   | Severity | Impact                                               |
|-------------------------------|------|-------------------------------------------|----------|------------------------------------------------------|
| `character-video-gen.ts`      | 494  | `sendVideo(groupId, "", undefined)` on render failure | Info | Called with empty string URL as error notification attempt — will fail silently (no real notification sent to group on render failure). Not a blocker: error is logged and PipelineRun is updated. Manual follow-up is noted in a comment. |

No TODO/FIXME comments, no placeholder implementations, no empty handlers, no stub returns in phase 04 files.

Pre-existing TypeScript errors confirmed to be in unrelated files (`social-setup.ts`, `social-setup.test.ts`, `proactive-digest.ts`) — verified by both Plan 01 and Plan 02 summaries and confirmed by `tsc` output showing zero errors in character-video-gen.ts, CharacterRevealComposition.tsx, and character-reveal-props.ts.

---

### Git Commits Verified

All four commit hashes referenced in SUMMARYs confirmed present in git log:

| Hash       | Commit Message                                                         |
|------------|------------------------------------------------------------------------|
| `e402a498` | feat(04-01): implement character-video-gen onboarding module           |
| `77919a47` | feat(04-02): CharacterReveal props type and composition                |
| `f8b4ac28` | feat(04-02): register CharacterReveal-16x9 composition in Root.tsx    |
| `92e47ad2` | feat(04-03): wire composition rendering, R2 upload, and WhatsApp delivery |

---

### Human Verification Required

#### 1. End-to-End Pipeline Execution

**Test:** Trigger the character-video-gen module for a tenant with a completed CharacterBible. Monitor logs for scene generation, Remotion render, R2 upload, and WhatsApp video delivery.
**Expected:** 5 Kie.ai jobs submitted; 3+ complete within 10 minutes; Remotion renders reveal.mp4; video arrives in WhatsApp group with scene-summary caption.
**Why human:** Requires live Kie.ai API calls, RackNerd Remotion render, active WAHA session, and WhatsApp group — cannot be verified programmatically without running the full pipeline.

#### 2. Render Failure Notification Gap

**Test:** Simulate a Remotion render failure (e.g., invalid input). Observe what the WhatsApp group receives.
**Expected:** Group should receive a text notification that composition failed.
**Why human:** The error path at line 494 calls `sendVideo(groupId, "", undefined)` with an empty URL — this call will fail silently. The group receives no failure notification. This is a UX gap (noted as "Info" severity above), not a blocker, but should be validated.

#### 3. Cost Visibility in Caption

**Test:** Trigger delivery for a tenant with `billing_model = "credit"` in their ServiceInstance, then for one without.
**Expected:** Credit-billing tenant sees `Credits used: $X.XX` in caption; flat/package tenant does not.
**Why human:** Requires live DB tenant setup with specific billing configurations.

---

### Gaps Summary

No blocking gaps found. Phase goal is fully achieved:

1. Scene generation via routeShot() + Kie.ai — substantive, wired, tested.
2. Remotion CharacterReveal composition — substantive, registered, wired to renderer.
3. R2 upload + TenantAsset registration — wired in both scene and reveal flows.
4. WhatsApp delivery via WAHA — wired with graceful failure handling.
5. PipelineRun lifecycle + trackExpense() — fully wired at every state transition.
6. Module registered in MODULE_REGISTRY at priority 3 (between character-questionnaire and social-setup).

One minor info-level finding: render failure path sends an empty-URL `sendVideo()` call rather than a text fallback — no notification reaches the WhatsApp group on render failure. This does not block the goal but is worth a follow-up fix.

---

_Verified: 2026-03-15T02:45:00Z_
_Verifier: Claude (gsd-verifier)_
