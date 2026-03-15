---
phase: 10-remotion-templates
plan: 01
subsystem: ui
tags: [remotion, react, zod, vitest, ken-burns, transitions, before-after, local-business]

# Dependency graph
requires: []
provides:
  - BeforeAfterPropsSchema (Zod schema + TypeScript type) with flat prop structure
  - BeforeAfterComposition (parametric 8s video: intro -> before -> wipe -> after -> CTA)
  - BeforeAfter-16x9 and BeforeAfter-9x16 registered in Root.tsx
  - 22 vitest unit tests covering schema validation
affects:
  - future plans that render BeforeAfter compositions via the worker pipeline
  - video-pipeline rendering job creation (needs composition ID + props)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Flat Zod schema pattern (no nested branding object) for parametric compositions
    - Inline Ken Burns configs per composition (not in ken-burns-patterns.ts registry)
    - isVertical detection via useVideoConfig() height > width for responsive wipe direction
    - Logo overlay as isolated sub-component rendered over TransitionSeries

key-files:
  created:
    - apps/worker/remotion/src/types/before-after-props.ts
    - apps/worker/src/__tests__/before-after-props.test.ts
    - apps/worker/remotion/src/BeforeAfterComposition.tsx
  modified:
    - apps/worker/remotion/src/Root.tsx

key-decisions:
  - "Flat props schema (no nested branding object) per prior user decision documented in plan"
  - "Ken Burns configs inline in BeforeAfterComposition (not registered in ken-burns-patterns.ts)"
  - "Fixed 8s duration (no calculateMetadata) per user decision"
  - "Visual-only composition — no audio imports"
  - "wipe direction: from-left for 16x9, from-top for 9x16 based on isVertical runtime check"

patterns-established:
  - "Parametric local-business template pattern: flat Zod schema + aspect-ratio-aware composition"
  - "Logo rendered via AbsoluteFill wrapper outside TransitionSeries (appears on all scenes)"
  - "Scene sub-components (IntroScene, BeforeScene, AfterScene, CtaScene) keep parent composition clean"

requirements-completed: [TMPL-01, TMPL-02, TMPL-03, TMPL-04]

# Metrics
duration: 12min
completed: 2026-03-15
---

# Phase 10 Plan 01: BeforeAfter Parametric Composition Summary

**Zod-validated BeforeAfterComposition with TransitionSeries wipe transition, Ken Burns before/after image scenes, and responsive 16x9/9x16 registration in Root.tsx**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-15T10:26:00Z
- **Completed:** 2026-03-15T10:28:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Flat Zod schema with 3 required fields + 6 defaults — 22 unit tests, all pass
- 4-scene TransitionSeries: dark intro card -> before image (Ken Burns + BEFORE pill) -> wipe -> after image (Ken Burns + tagline) -> CTA outro
- Wipe direction adapts at runtime: `from-left` for 16x9, `from-top` for 9x16 via `isVertical = height > width`
- Both BeforeAfter-16x9 (1920x1080) and BeforeAfter-9x16 (1080x1920) registered in Root.tsx with 240-frame (8s) fixed duration
- TypeScript compiles clean — no new dependencies installed

## Task Commits

1. **Task 1: Create BeforeAfterPropsSchema + unit tests** - `d6b7277d` (feat)
2. **Task 2: Build BeforeAfterComposition + Root.tsx registration** - `26dbefc7` (feat)

## Files Created/Modified

- `apps/worker/remotion/src/types/before-after-props.ts` — Zod schema + TypeScript type (flat, 9 fields)
- `apps/worker/src/__tests__/before-after-props.test.ts` — 22 vitest tests: required fields, defaults, enum, types
- `apps/worker/remotion/src/BeforeAfterComposition.tsx` — Parametric composition with 4 scenes + 3 transitions
- `apps/worker/remotion/src/Root.tsx` — Added BeforeAfterComposition + BeforeAfterPropsSchema imports, BEFORE_AFTER_DEFAULT_PROPS, and two Composition entries

## Decisions Made

- Flat props schema (no nested branding object) — maintains consistency with plan decision, avoids Remotion defaultProps deep-merge issues
- Inline Ken Burns configs in BeforeAfterComposition — avoids coupling local-business template to property tour KB registry
- Fixed duration via durationInFrames on Composition (no calculateMetadata) — local biz clips always 8s
- Visual-only — no audio imports, keeping the template simple for initial use

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required. All new files use existing remotion ^4.0.429 dependencies.

## Next Phase Readiness

- BeforeAfter compositions are registered and TypeScript-clean — ready for pipeline integration
- Worker rendering job can target `BeforeAfter-16x9` or `BeforeAfter-9x16` composition IDs with `BeforeAfterProps` payload
- Next plans in Phase 10 can build additional local-business templates following the same flat-schema pattern

---
*Phase: 10-remotion-templates*
*Completed: 2026-03-15*

## Self-Check: PASSED

- before-after-props.ts: FOUND
- before-after-props.test.ts: FOUND
- BeforeAfterComposition.tsx: FOUND
- 10-01-SUMMARY.md: FOUND
- Commit d6b7277d (Task 1): FOUND
- Commit 26dbefc7 (Task 2): FOUND
