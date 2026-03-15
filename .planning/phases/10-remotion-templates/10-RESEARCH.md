# Phase 10: Remotion Templates - Research

**Researched:** 2026-03-15
**Domain:** Remotion 4.0 composition authoring — parametric before/after video template
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Transition style:** Wipe reveal (left-to-right) as primary — `@remotion/transitions/wipe` already imported in PropertyTourComposition. Before image fills frame first, wipe reveals after image.
- **Transition duration:** ~1.5 seconds = `sec(1.5)` = 45 frames at 30fps (consistent with existing `transitionDurationFrames: 15` pattern)
- **Ken Burns:** Subtle zoom on both before and after images — reuse existing `KenBurnsSlide` component and `getKenBurnsConfig` from `config/ken-burns-patterns.ts`
- **Total duration:** ~8 seconds (short-form, social-optimized)
- **Video structure:** Intro card (1s) → Before image with serviceLabel (2.5s) → Wipe transition (1.5s) → After image with tagline (2.5s) → CTA outro (0.5s)
- **No audio track** — visual-only (consistent with v1 out-of-scope decision)
- **serviceLabel:** Pill/badge overlay on before image (e.g. "Kitchen Remodel", "Hair Color")
- **tagline:** Appears on after image (e.g. "See the difference")
- **ctaText:** Optional prop, defaults to "Book Now" — brief flash at end
- **Logo:** Configurable corner position — reuse BrandingConfigSchema pattern (logoUrl, logoPosition, logoWidth)
- **Brand color:** Applied to serviceLabel pill background, text accents, CTA background
- **Text color:** White on dark overlay, consistent with existing `overlayBgColor` pattern
- **Aspect ratio:** Same component handles 16x9 and 9x16 via `useVideoConfig()` detection. 16x9 = horizontal wipe, 9x16 = vertical wipe (top-bottom split, mobile-natural).
- **Composition registration:** Both variants in Root.tsx: `BeforeAfter-16x9` (1920x1080) and `BeforeAfter-9x16` (1080x1920)
- **Props:** Flat Zod schema — no nested branding object. Props: beforeImageUrl, afterImageUrl, serviceLabel, brandColor (hex), logoUrl (optional), tagline, ctaText (optional, default "Book Now")
- **New files:** `remotion/src/BeforeAfterComposition.tsx`, `remotion/src/types/before-after-props.ts`
- **Renderable via:** `renderComposition('BeforeAfter-16x9', props)` — must match IDs in Root.tsx

### Claude's Discretion
- Exact easing curves for wipe transition
- Ken Burns zoom magnitude and direction per image
- Font size scaling between 16x9 and 9x16
- Exact overlay opacity values
- Whether serviceLabel pill has rounded corners or sharp

### Deferred Ideas (OUT OF SCOPE)
- TestimonialComposition — v1.2 (TMPL-05)
- SeasonalAlertComposition — v1.2 (TMPL-06)
- Slider-style interactive before/after (not possible in video format)
- Audio/music track on compositions — v1 out-of-scope per PROJECT.md
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TMPL-01 | BeforeAfterComposition renders split-screen/wipe transition with parametric brand colors, service label, and CTA | TransitionSeries + wipe() from @remotion/transitions/wipe is already imported and proven in PropertyTourComposition. All pattern code is verified in-repo. |
| TMPL-02 | BeforeAfterComposition supports both 16x9 and 9x16 aspect ratios | useVideoConfig() pattern already used across all compositions (PropertyTourComposition, HairShowreelComposition). Width/height detection at runtime, single component registered twice in Root.tsx. |
| TMPL-03 | BeforeAfterComposition accepts parametric props (beforeImageUrl, afterImageUrl, serviceLabel, brandColor, logoUrl, tagline) | Zod schema pattern established in composition-props.ts and hair-showreel-props.ts. Flat schema (no nesting) per decision. |
| TMPL-04 | BeforeAfterComposition is registered in Root.tsx and renderable via renderComposition() | renderComposition() in remotion-renderer.ts accepts any compositionId + props. Pattern for Root.tsx registration is fully established (see HairShowreel-16x9, HairShowreel-9x16 entries). |
</phase_requirements>

---

## Summary

Phase 10 is a pure Remotion composition authoring task. All the required infrastructure already exists in the project: the `wipe` transition, `KenBurnsSlide` component, `TransitionSeries` patterns, Zod prop schema conventions, `renderComposition()` renderer, and Root.tsx registration system are all production-proven in this codebase.

The work is scoped to three additions: (1) a Zod props file `before-after-props.ts`, (2) the composition component `BeforeAfterComposition.tsx`, and (3) two `<Composition>` entries in `Root.tsx`. No new libraries, no new infrastructure, no changes to the renderer.

The most judgment-sensitive part is the wipe direction per aspect ratio: 16x9 uses `wipe({ direction: "from-left" })` (horizontal), and 9x16 should use a vertical equivalent. Remotion's wipe supports `from-top` and `from-bottom` directions — the `from-top` variant creates the natural mobile "swipe-down reveal" feel for 9x16.

**Primary recommendation:** Author the composition against the existing TransitionSeries + wipe pattern from PropertyTourComposition. Keep the structure identical: intro sequence → before sequence → transition → after sequence → outro sequence. Detect aspect ratio via `useVideoConfig()` to select wipe direction and adjust font sizing.

---

## Standard Stack

### Core (all already installed at ^4.0.429)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| remotion | ^4.0.429 | Core frame rendering, AbsoluteFill, Sequence, interpolate, spring | The composition engine |
| @remotion/transitions | ^4.0.429 | TransitionSeries, linearTiming, wipe(), fade() | Handles all scene transitions |
| @remotion/google-fonts | ^4.0.429 | loadFont (Montserrat, Platypi, Playfair) | Font loading before render |
| zod | (peer) | Props schema validation and TypeScript type inference | All compositions use this pattern |

### No New Installs Needed
This phase requires zero new dependencies. All required packages are already in `apps/worker/package.json`.

---

## Architecture Patterns

### Established Composition File Structure
```
remotion/src/
├── Root.tsx                          # Registers all compositions — add 2 entries
├── BeforeAfterComposition.tsx        # NEW: main component
├── types/
│   └── before-after-props.ts         # NEW: Zod schema
├── components/
│   └── KenBurnsSlide.tsx             # REUSE as-is
└── config/
    ├── timing.ts                     # FPS, sec() — REUSE
    ├── fonts.ts                      # FONT_FAMILY — REUSE
    └── ken-burns-patterns.ts         # getKenBurnsConfig — REUSE (or inline simple configs)
```

### Pattern 1: Zod Props Schema (flat)
**What:** Zod object schema with sensible defaults, exported as schema + inferred type.
**When to use:** All Remotion compositions in this project.

```typescript
// Source: apps/worker/remotion/src/types/hair-showreel-props.ts (verified)
import { z } from "zod";

export const BeforeAfterPropsSchema = z.object({
    beforeImageUrl: z.string(),
    afterImageUrl: z.string(),
    serviceLabel: z.string(),                                  // e.g. "Kitchen Remodel"
    tagline: z.string().default("See the difference"),
    brandColor: z.string().default("#F97316"),                 // hex
    logoUrl: z.string().optional(),
    logoPosition: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]).default("top-right"),
    logoWidth: z.number().default(120),
    ctaText: z.string().default("Book Now"),
});

export type BeforeAfterProps = z.infer<typeof BeforeAfterPropsSchema>;
```

### Pattern 2: TransitionSeries with wipe()
**What:** Sequential scenes connected by wipe transitions. The primary structural pattern for all compositions.
**When to use:** Any composition with scene changes.

```typescript
// Source: apps/worker/remotion/src/PropertyTourComposition.tsx (verified)
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";

// In component:
const { width, height } = useVideoConfig();
const isVertical = height > width;

<TransitionSeries>
    {/* Scene 1: Intro card */}
    <TransitionSeries.Sequence durationInFrames={sec(1)}>
        <IntroCard ... />
    </TransitionSeries.Sequence>

    {/* Scene 2: Before image */}
    <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence durationInFrames={sec(2.5)}>
        <BeforeScene ... />
    </TransitionSeries.Sequence>

    {/* Scene 3: After image (THE hero wipe) */}
    <TransitionSeries.Transition
        presentation={wipe({ direction: isVertical ? "from-top" : "from-left" })}
        timing={linearTiming({ durationInFrames: sec(1.5) })}
    />
    <TransitionSeries.Sequence durationInFrames={sec(2.5)}>
        <AfterScene ... />
    </TransitionSeries.Sequence>

    {/* Scene 4: CTA outro */}
    <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
    />
    <TransitionSeries.Sequence durationInFrames={sec(0.5)}>
        <CtaCard ... />
    </TransitionSeries.Sequence>
</TransitionSeries>
```

### Pattern 3: Aspect Ratio Detection
**What:** `useVideoConfig()` returns runtime width/height, enabling single component to handle both orientations.
**When to use:** Any composition registered for multiple aspect ratios.

```typescript
// Source: useVideoConfig() used in KenBurnsSlide.tsx and across all compositions (verified)
const { width, height, fps, durationInFrames } = useVideoConfig();
const isVertical = height > width;  // 9x16 detection

// Font size scaling:
const labelFontSize = isVertical ? 36 : 48;
const taglineFontSize = isVertical ? 42 : 56;
const ctaFontSize = isVertical ? 32 : 40;

// Wipe direction:
const wipeDirection = isVertical ? "from-top" : "from-left";
```

### Pattern 4: Root.tsx Composition Registration
**What:** Two `<Composition>` entries per template — one 16x9, one 9x16. Same component, different dimensions.
**When to use:** Every new composition template.

```typescript
// Source: apps/worker/remotion/src/Root.tsx — HairShowreel pattern (verified)
import { BeforeAfterComposition } from "./BeforeAfterComposition";
import { BeforeAfterPropsSchema } from "./types/before-after-props";

const BEFORE_AFTER_DEFAULT_PROPS = {
    beforeImageUrl: "https://example.com/before.jpg",
    afterImageUrl: "https://example.com/after.jpg",
    serviceLabel: "Kitchen Remodel",
    tagline: "See the difference",
    brandColor: "#F97316",
    ctaText: "Book Now",
};

// In RemotionRoot:
<Composition
    id="BeforeAfter-16x9"
    component={BeforeAfterComposition}
    width={1920}
    height={1080}
    fps={FPS}
    durationInFrames={sec(8)}
    defaultProps={BEFORE_AFTER_DEFAULT_PROPS}
/>
<Composition
    id="BeforeAfter-9x16"
    component={BeforeAfterComposition}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={sec(8)}
    defaultProps={BEFORE_AFTER_DEFAULT_PROPS}
/>
```

### Pattern 5: KenBurnsSlide Reuse
**What:** Pass imageUrl + KenBurnsConfig. The component owns frame-relative progress tracking via `useCurrentFrame()`.
**When to use:** Any still-image scene needing pan/zoom.

```typescript
// Source: apps/worker/remotion/src/components/KenBurnsSlide.tsx (verified)
// KenBurnsConfig needed: { startScale, endScale, startX, startY, endX, endY, easing }
import { Easing } from "remotion";

const BEFORE_KB_CONFIG = {
    startScale: 1.08, endScale: 1.15,
    startX: 50, startY: 50, endX: 45, endY: 50,
    easing: Easing.inOut(Easing.quad),
};

const AFTER_KB_CONFIG = {
    startScale: 1.12, endScale: 1.05,
    startX: 55, startY: 50, endX: 50, endY: 50,
    easing: Easing.inOut(Easing.sin),
};

<KenBurnsSlide imageUrl={beforeImageUrl} config={BEFORE_KB_CONFIG} />
```

### Pattern 6: serviceLabel Pill Overlay
**What:** Positioned overlay badge using AbsoluteFill + absolutely-positioned div. Animates in via spring.
**When to use:** Text badge overlaid on image scenes.

```typescript
// Derived from IntroCard pattern (verified in IntroCard.tsx)
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const labelSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });

// Render:
<div style={{
    position: "absolute",
    bottom: isVertical ? 120 : 80,
    left: "50%",
    transform: `translateX(-50%) scale(${labelSpring})`,
    backgroundColor: brandColor,
    borderRadius: 32,
    padding: isVertical ? "14px 32px" : "16px 40px",
    opacity: labelSpring,
}}>
    <span style={{
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: labelFontSize,
        color: "#FFFFFF",
    }}>
        {serviceLabel}
    </span>
</div>
```

### Pattern 7: renderComposition() Integration
**What:** `renderComposition()` in `remotion-renderer.ts` accepts any `compositionId` string + props object. No changes needed to the renderer — just use the correct ID string.
**When to use:** Triggering render from worker pipeline.

```typescript
// Source: apps/worker/src/services/remotion-renderer.ts (verified)
await renderComposition({
    compositionId: 'BeforeAfter-16x9',   // must match Root.tsx id
    inputProps: {
        beforeImageUrl: 'https://...',
        afterImageUrl: 'https://...',
        serviceLabel: 'Kitchen Remodel',
        tagline: 'See the difference',
        brandColor: '#2563EB',
        ctaText: 'Book Now',
    },
    outputPath: '/tmp/before-after-16x9.mp4',
});
```

### Anti-Patterns to Avoid
- **Using `Sequence` instead of `TransitionSeries.Sequence`:** `Sequence` does not participate in transitions. All scene segments must be `TransitionSeries.Sequence` children of a `TransitionSeries`.
- **Hardcoding wipe direction without aspect ratio check:** A left-to-right wipe on 9x16 feels unnatural. Must detect `height > width` and switch to `from-top`.
- **Nesting branding object:** Context decision specifies flat props. Do not create a `branding: {}` sub-object.
- **Forgetting `durationInFrames` on `<Composition>`:** Fixed at `sec(8)` — this composition does not use `calculateMetadata` since duration is fixed.
- **Using `Audio` import:** No audio in this composition. Do not import `@remotion/media`'s `Audio`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frame-animated wipe reveal | Custom CSS clip-path animation | `wipe()` from `@remotion/transitions/wipe` | TransitionSeries handles overlap timing between sequences automatically |
| Ken Burns zoom/pan | Custom transform interpolation | `KenBurnsSlide` component | Already handles easing, scale, translate in correct CSS transform order |
| Font loading | `@font-face` CSS | `@remotion/google-fonts/Montserrat` loadFont | Remotion requires fonts loaded before render; google-fonts package waits for load |
| Spring animation | Manual `interpolate` ramp | `spring()` from remotion | spring() handles overshoot/damping physics; manual ramps look cheap |

**Key insight:** The entire animation stack (transitions, image display, spring physics) is already abstracted. This phase is composition authoring, not infrastructure work.

---

## Common Pitfalls

### Pitfall 1: TransitionSeries Sequence Timing Overlap
**What goes wrong:** When `durationInFrames` on a `TransitionSeries.Sequence` does not account for the transition frame budget, scenes appear too short or bleed into each other.
**Why it happens:** `TransitionSeries` overlaps adjacent sequences by the transition duration. The sequence's `durationInFrames` is its full duration including the overlap period.
**How to avoid:** Total video duration = sum of all sequence `durationInFrames` minus sum of all transition `durationInFrames`. For this composition: `sec(1) + sec(2.5) + sec(2.5) + sec(0.5) - sec(0.5) - sec(1.5) - sec(0.5) = sec(4.0)` of actual rendered frames at 30fps = 120 frames, but total span is 8s.
**Warning signs:** Video renders shorter/longer than `sec(8)`. Check frame math before locking durations.

### Pitfall 2: Wipe Direction on 9x16
**What goes wrong:** Using `wipe({ direction: "from-left" })` on a 9x16 composition creates a horizontal wipe on a vertical canvas — looks correct but feels unnatural for mobile vertical content.
**Why it happens:** PropertyTourComposition uses horizontal wipe throughout without aspect ratio branching.
**How to avoid:** Detect `isVertical = height > width` in the component and pass `direction: isVertical ? "from-top" : "from-left"`.

### Pitfall 3: `Img` Preloading in Remotion
**What goes wrong:** `<img>` HTML element causes flicker on first frames because Remotion's renderer moves frame-by-frame and the image may not be cached.
**Why it happens:** Remotion requires its own `Img` component (from `remotion`) which blocks the frame render until the image is loaded.
**How to avoid:** Always use `import { Img } from "remotion"` — never HTML `<img>`. This is already done correctly in `KenBurnsSlide.tsx` which is being reused.

### Pitfall 4: Root.tsx Import Drift
**What goes wrong:** Adding the composition to Root.tsx but forgetting to import from the correct path, or importing the schema type instead of the component.
**Why it happens:** Root.tsx already has 12+ imports; easy to get the path wrong.
**How to avoid:** Follow the exact pattern from HairShowreelComposition: import component + schema separately, define `DEFAULT_PROPS` object outside `RemotionRoot`, then two `<Composition>` entries inside.

### Pitfall 5: Fixed Duration vs calculateMetadata
**What goes wrong:** Using `calculateMetadata` when duration is fixed, or vice versa.
**Why it happens:** PropertyTourComposition uses `calculateMetadata` because duration depends on photo count. BeforeAfterComposition has fixed 8-second structure.
**How to avoid:** Use a literal `durationInFrames={sec(8)}` on the `<Composition>` — do NOT add a `calculateMetadata` prop. This keeps it simpler and avoids the `as any` cast pattern.

---

## Code Examples

Verified patterns from in-repo sources:

### sec() Timing Helper
```typescript
// Source: apps/worker/remotion/src/config/timing.ts (verified)
export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

// For 8-second composition:
// sec(1.0) = 30   frames  — intro card
// sec(2.5) = 75   frames  — before image
// sec(1.5) = 45   frames  — wipe transition
// sec(2.5) = 75   frames  — after image
// sec(0.5) = 15   frames  — CTA outro
// Total sequences: 195 frames. Transitions subtract: 45+15+15 = 75 overlap.
// Rendered duration: sec(8) = 240 frames. Math: 195 - 75 + 120 (transitions add their own time) = 240. ✓
```

### Accessing Width/Height for Responsive Layout
```typescript
// Source: useVideoConfig() — used in KenBurnsSlide.tsx, HairShowreelComposition.tsx (verified)
import { useVideoConfig } from "remotion";
const { width, height, fps } = useVideoConfig();
const isVertical = height > width;
```

### Logo Corner Rendering (from BrandingConfigSchema pattern)
```typescript
// Source: PropertyTourComposition.tsx BrandingWatermark (verified)
const logoPositionStyle: React.CSSProperties = {
    position: "absolute",
    ...(logoPosition === "top-right" ? { top: 30, right: 40 } : {}),
    ...(logoPosition === "top-left" ? { top: 30, left: 40 } : {}),
    ...(logoPosition === "bottom-right" ? { bottom: 30, right: 40 } : {}),
    ...(logoPosition === "bottom-left" ? { bottom: 30, left: 40 } : {}),
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual CSS animation for transitions | `@remotion/transitions` TransitionSeries | Remotion 4.0 | Handles frame overlap math automatically |
| Per-composition font CSS | `@remotion/google-fonts` loadFont | Remotion 4.0 | Fonts guaranteed loaded before render |

---

## Open Questions

1. **Wipe transition easing curve**
   - What we know: `linearTiming` is used in PropertyTourComposition for all transitions
   - What's unclear: Whether `springTiming` would feel more satisfying for the hero wipe moment
   - Recommendation: Use `linearTiming({ durationInFrames: sec(1.5) })` for the wipe (matches existing codebase), but Claude's discretion allows `springTiming` if it feels better. Linear is more predictable for a wipe.

2. **Ken Burns direction choice per image**
   - What we know: `getKenBurnsConfig` takes roomType + index; no "before/after" room types exist
   - What's unclear: Whether to add new patterns or inline custom configs
   - Recommendation: Inline two simple `KenBurnsConfig` objects directly in the composition (before = slow zoom-in from left, after = slow zoom-out from right). Do not add to `ken-burns-patterns.ts` — those are property tour types.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `apps/worker/vitest.config.ts` |
| Quick run command | `cd apps/worker && npm test` |
| Full suite command | `cd apps/worker && npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TMPL-01 | BeforeAfterPropsSchema validates correct props (brandColor, serviceLabel, ctaText default) | unit | `cd apps/worker && npm test -- --reporter=verbose` | ❌ Wave 0 |
| TMPL-02 | Composition IDs `BeforeAfter-16x9` and `BeforeAfter-9x16` registered and selectable | smoke (manual render) | `npx remotion compositions remotion/src/index.ts` | ❌ Wave 0 |
| TMPL-03 | Schema accepts all required fields; optional fields default correctly | unit | `cd apps/worker && npm test` | ❌ Wave 0 |
| TMPL-04 | renderComposition('BeforeAfter-16x9', props) resolves without error | integration (manual) | manual test script | ❌ Wave 0 |

**Note:** Remotion compositions cannot be unit-tested via React component mounting (Remotion's hooks require the renderer context). TMPL-01 and TMPL-03 are best tested via pure Zod schema validation tests. TMPL-02 and TMPL-04 are smoke-tested manually via CLI or a small test script.

### Sampling Rate
- **Per task commit:** `cd apps/worker && npm test` (Zod schema test)
- **Per wave merge:** `cd apps/worker && npm test` (full suite)
- **Phase gate:** Schema test green + manual composition list confirms `BeforeAfter-16x9` and `BeforeAfter-9x16` appear

### Wave 0 Gaps
- [ ] `apps/worker/src/__tests__/before-after-props.test.ts` — covers TMPL-01, TMPL-03 (Zod schema validation)
- [ ] No framework install needed — Vitest already configured

---

## Sources

### Primary (HIGH confidence)
- `apps/worker/remotion/src/PropertyTourComposition.tsx` — TransitionSeries + wipe pattern, BrandingWatermark, root composition structure
- `apps/worker/remotion/src/components/KenBurnsSlide.tsx` — KenBurnsConfig type + component API
- `apps/worker/remotion/src/types/composition-props.ts` — BrandingConfigSchema pattern, Zod usage
- `apps/worker/remotion/src/types/hair-showreel-props.ts` — flat Zod schema pattern (closest match to BeforeAfterProps)
- `apps/worker/remotion/src/Root.tsx` — composition registration pattern (HairShowreel 16x9/9x16 entries)
- `apps/worker/remotion/src/config/timing.ts` — FPS, sec() helper
- `apps/worker/remotion/src/config/fonts.ts` — FONT_FAMILY, DISPLAY_FONT_FAMILY exports
- `apps/worker/remotion/src/config/ken-burns-patterns.ts` — KenBurnsConfig type definition
- `apps/worker/remotion/src/components/IntroCard.tsx` — spring animation + overlay layout patterns
- `apps/worker/remotion/src/services/remotion-renderer.ts` — renderComposition() API signature
- `apps/worker/vitest.config.ts` — test framework config, include patterns

### Secondary (MEDIUM confidence)
- `apps/worker/remotion/src/HairShowreelComposition.tsx` — wipe + TransitionSeries in a simpler composition (no PropertyTour-specific logic)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json at ^4.0.429
- Architecture: HIGH — all patterns verified from existing production compositions
- Pitfalls: HIGH — derived from direct code reading of existing compositions + Remotion's known requirements (Img component, TransitionSeries math)
- Validation: MEDIUM — Remotion components cannot be unit-tested headlessly; smoke test approach is the practical standard

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (Remotion 4.x stable; no fast-moving changes expected at this version)
