# Phase 10: Remotion Templates - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a parametric BeforeAfterComposition for local businesses that renders split-screen/wipe transition videos in both 16x9 and 9x16 aspect ratios. Fully configurable via props (beforeImageUrl, afterImageUrl, serviceLabel, brandColor, logoUrl, tagline). Registered in Root.tsx as a renderable composition.

Scope is ONE composition (BeforeAfterComposition). TestimonialComposition and SeasonalAlertComposition are deferred to v1.2 (TMPL-05, TMPL-06).

</domain>

<decisions>
## Implementation Decisions

### Transition Style
- Wipe reveal (left-to-right) as the primary transition — `@remotion/transitions/wipe` already imported and used in PropertyTourComposition
- Before image fills the frame first, then wipe reveals the after image underneath
- Transition duration: ~1.5 seconds (consistent with existing `transitionDurationFrames: 15` at 30fps in PropertyTourComposition)
- Ken Burns subtle zoom on both before and after images during their hold — reuse existing `KenBurnsSlide` component and `getKenBurnsConfig` from config/ken-burns-patterns.ts

### Video Structure and Timing
- Total duration: ~8 seconds (short-form, social-optimized)
- Structure: Intro card (1s) → Before image with serviceLabel (2.5s) → Wipe transition (1.5s) → After image with tagline (2.5s) → CTA outro (0.5s)
- No audio track — visual-only (consistent with v1 out-of-scope decision in PROJECT.md)

### Text Overlays and Branding
- serviceLabel appears as a pill/badge overlay on the before image (e.g., "Kitchen Remodel", "Hair Color")
- tagline appears on the after image (e.g., "See the difference")
- CTA text is optional prop, defaults to "Book Now" — brief flash at end
- Logo rendered in configurable corner position — reuse BrandingConfigSchema pattern from composition-props.ts (logoUrl, logoPosition, logoWidth)
- Brand color applied to: serviceLabel pill background, text accents, CTA background
- Text color: white on dark overlay, consistent with existing overlayBgColor pattern

### Aspect Ratio Handling
- Same component handles both 16x9 and 9x16 via `useVideoConfig()` width/height detection
- 16x9: Side-by-side split during transition, horizontal wipe
- 9x16: Top-bottom split during transition, vertical wipe (natural for mobile viewing)
- Register both variants in Root.tsx: `BeforeAfter-16x9` (1920x1080) and `BeforeAfter-9x16` (1080x1920)

### Props Interface
- Follow existing Zod schema pattern from composition-props.ts
- Props: beforeImageUrl, afterImageUrl, serviceLabel, brandColor (hex), logoUrl (optional), tagline, ctaText (optional, default "Book Now"), aspectRatio (derived from composition registration)
- No nested branding object — flatten props since this is a simpler composition than PropertyTour

### Claude's Discretion
- Exact easing curves for wipe transition
- Ken Burns zoom magnitude and direction per image
- Font size scaling between 16x9 and 9x16
- Exact overlay opacity values
- Whether serviceLabel pill has rounded corners or sharp

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `KenBurnsSlide` component (`remotion/src/components/KenBurnsSlide.tsx`): Handles image display with Ken Burns pan/zoom — reuse for before and after image display
- `IntroCard` / `OutroCard` components: Existing intro/outro patterns — reference for CTA card
- `BrandingConfigSchema` (`remotion/src/types/composition-props.ts`): Zod schema for branding props — pattern to follow for BeforeAfterProps
- `FONT_FAMILY` from `config/fonts.ts`: Consistent typography
- `FPS`, `sec()` from `config/timing.ts`: Frame/timing utilities
- `wipe` transition from `@remotion/transitions/wipe`: Already imported in PropertyTourComposition

### Established Patterns
- All compositions register both 16x9 and 9x16 variants in Root.tsx
- Props use Zod schemas with sensible defaults
- Compositions use `useVideoConfig()` for responsive layout
- `TransitionSeries` with `linearTiming` / `springTiming` for transitions
- `Sequence` for timed segments within compositions

### Integration Points
- Root.tsx: Add BeforeAfterComposition import + two `<Composition>` registrations (16x9, 9x16)
- New file: `remotion/src/BeforeAfterComposition.tsx` (main component)
- New file: `remotion/src/types/before-after-props.ts` (Zod props schema)
- Worker rendering: `renderComposition('BeforeAfter-16x9', props)` — must match composition IDs in Root.tsx

</code_context>

<specifics>
## Specific Ideas

- Target use case: GP Homes (contractor before/after renovations), Hair Approach (color transformations), any service business with visual before/after
- The wipe transition is the hero moment — should feel satisfying and clean, not gimmicky
- Keep it under 10 seconds — social media attention span

</specifics>

<deferred>
## Deferred Ideas

- TestimonialComposition — v1.2 (TMPL-05)
- SeasonalAlertComposition — v1.2 (TMPL-06)
- Slider-style interactive before/after (not possible in video format)
- Audio/music track on compositions — v1 out-of-scope per PROJECT.md

</deferred>

---

*Phase: 10-remotion-templates*
*Context gathered: 2026-03-15*
