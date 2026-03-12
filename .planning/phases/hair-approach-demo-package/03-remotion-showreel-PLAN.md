---
phase: hair-approach-demo-package
plan: 03
title: Build and render branded Remotion showreel composition
wave: 2
depends_on: [01]
files_modified:
  - apps/worker/remotion/src/HairShowreelComposition.tsx
  - apps/worker/remotion/src/types/hair-showreel-props.ts
  - apps/worker/remotion/src/Root.tsx
  - apps/worker/remotion/src/config/fonts.ts
  - apps/worker/src/scripts/hair-approach-render.ts
autonomous: true
must_haves:
  - HairShowreelComposition renders 15-20s video at 1920x1080
  - Uses Playfair Display font (not Montserrat/Platypi)
  - Honey gold #C9A96E accents, dark charcoal #1a1a1a backgrounds
  - Ken Burns on all 6 upscaled photos with slow elegant pacing
  - Intro card with "Hair Approach" branding + tagline
  - Outro card with CTA "Book Your Transformation"
  - Final MP4 uploaded to R2 at hair-approach/showreel/master-16x9.mp4
  - Zero API cost (Remotion only)
---

<tasks>
<task id="1">
<title>Add Playfair Display font to Remotion config</title>
<instructions>
Edit `apps/worker/remotion/src/config/fonts.ts` to add Playfair Display:

```typescript
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";

const playfairResult = loadPlayfairDisplay("normal", {
    weights: ["400", "600", "700"],
    subsets: ["latin"],
});

export const PLAYFAIR_DISPLAY_FAMILY = playfairResult.fontFamily;
```

Add this AFTER the existing font loads. Do NOT remove existing fonts — they're used by PropertyTourComposition.

Check if `@remotion/google-fonts` includes PlayfairDisplay. The package supports all Google Fonts. Import path is the font name without spaces: `@remotion/google-fonts/PlayfairDisplay`.
</instructions>
<verify>
- `apps/worker/remotion/src/config/fonts.ts` exports `PLAYFAIR_DISPLAY_FAMILY`
- TypeScript compiles without errors
</verify>
<commit_message>feat: add Playfair Display font to Remotion config</commit_message>
</task>

<task id="2">
<title>Create HairShowreel props type</title>
<instructions>
Create `apps/worker/remotion/src/types/hair-showreel-props.ts`:

```typescript
import { z } from "zod";

export const HairShowreelPropsSchema = z.object({
    // Business info
    businessName: z.string(),          // "Hair Approach"
    tagline: z.string(),               // "Master Hair Stylist & Hair Colorist"
    subtitle: z.string().optional(),   // "Blonde Specialist | Balayage"

    // Contact
    ownerName: z.string().optional(),  // "DeAnna Delagarza Rozenblum"
    phone: z.string().optional(),
    website: z.string().optional(),
    ctaText: z.string().default("Book Your Transformation"),

    // Photos (ordered for showreel)
    photos: z.array(z.object({
        url: z.string(),
        label: z.string().optional(),  // e.g. "Blonde Highlights", shown briefly
    })).min(1),

    // Music
    musicUrl: z.string().optional(),

    // Branding
    primaryColor: z.string().default("#1a1a1a"),   // Dark charcoal background
    accentColor: z.string().default("#C9A96E"),    // Honey gold
    textColor: z.string().default("#FFFFFF"),

    // Powered by
    showPoweredBy: z.boolean().default(true),
    poweredByText: z.string().default("Powered by SuperSeller AI"),
});

export type HairShowreelProps = z.infer<typeof HairShowreelPropsSchema>;
```
</instructions>
<verify>
- File compiles with `npx tsc --noEmit apps/worker/remotion/src/types/hair-showreel-props.ts` (or check within full build)
- Schema exports both type and schema
</verify>
<commit_message>feat: add HairShowreel props type for salon showreel composition</commit_message>
</task>

<task id="3">
<title>Build HairShowreelComposition component</title>
<instructions>
Create `apps/worker/remotion/src/HairShowreelComposition.tsx`:

This is a NEW composition (NOT modifying PropertyTourComposition). Structure:

**Timeline (18s total at 30fps = 540 frames):**
- Frames 0-89 (0-3s): **Intro** — Dark charcoal bg, "Hair Approach" in Playfair Display (honey gold), tagline fades in below
- Frames 90-449 (3-15s): **Photo carousel** — 6 photos, ~2s each with Ken Burns, fade transitions (12 frames each)
- Frames 450-540 (15-18s): **Outro** — Dark bg, "Book Your Transformation" CTA in honey gold, powered by SuperSeller

**Component design:**

```tsx
import React from "react";
import { AbsoluteFill, Sequence, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { KenBurnsSlide } from "./components/KenBurnsSlide";
import { PLAYFAIR_DISPLAY_FAMILY } from "./config/fonts";
import { getKenBurnsConfig } from "./config/ken-burns-patterns";
import { FPS, sec } from "./config/timing";
import type { HairShowreelProps } from "./types/hair-showreel-props";
```

**Intro section:**
- AbsoluteFill with backgroundColor #1a1a1a
- Business name in Playfair Display, 72px, color #C9A96E, centered
- Spring animation for entrance (damping: 14, stiffness: 80)
- Tagline in Playfair Display, 32px, color #FFFFFF with 0.8 opacity, below name
- Subtle separator line (80px wide, 2px, #C9A96E) between name and tagline

**Photo carousel:**
- Use TransitionSeries with fade transitions (12 frames = 0.4s)
- Each photo gets 2s (60 frames)
- Use KenBurnsSlide component with room types mapped to salon-appropriate patterns:
  - Use alternating patterns from ken-burns-patterns.ts: `getKenBurnsConfig("interior_other", index)`
  - This gives a mix of zoom-in, zoom-out, and pan effects
- Optional: Show photo label (e.g. "Blonde Highlights") in bottom-left corner, Playfair Display 24px, with semi-transparent black bg pill

**Outro section:**
- AbsoluteFill with backgroundColor #1a1a1a
- First upscaled photo as blurred background (brightness 0.2, blur 8px)
- CTA text "Book Your Transformation" in Playfair Display, 48px, #C9A96E
- Spring entrance animation
- "Powered by SuperSeller AI" at bottom, 16px, opacity 0.4

**Key styling rules:**
- ALL text uses PLAYFAIR_DISPLAY_FAMILY — this is a luxury salon brand
- Accent color is ALWAYS #C9A96E (honey gold)
- Background is ALWAYS #1a1a1a (dark charcoal)
- Transitions are SLOW and elegant — no fast slides or flips
- Only use fade transitions (no slide, wipe, or flip — those are for real estate)

**Music:** If musicUrl provided, add `<Audio>` component with volume fade in/out.
</instructions>
<verify>
- Component renders without errors in Remotion Studio: `cd apps/worker && npx remotion studio`
- Preview shows: intro (3s) → 6 photos with Ken Burns (12s) → outro (3s) = 18s total
- All text uses Playfair Display
- Colors match: gold #C9A96E on dark #1a1a1a
</verify>
<commit_message>feat: add HairShowreelComposition — branded salon portfolio showreel</commit_message>
</task>

<task id="4">
<title>Register composition in Root.tsx</title>
<instructions>
Edit `apps/worker/remotion/src/Root.tsx`:

1. Import the new composition:
   ```typescript
   import { HairShowreelComposition } from "./HairShowreelComposition";
   import { HairShowreelPropsSchema } from "./types/hair-showreel-props";
   ```

2. Add two Composition registrations (after the existing ones, before closing `</>`):

   ```tsx
   {/* ─── Hair Showreel (Salon Portfolio) ────────── */}
   <Composition
       id="HairShowreel-16x9"
       component={HairShowreelComposition}
       width={1920}
       height={1080}
       fps={FPS}
       durationInFrames={sec(18)}
       defaultProps={{
           businessName: "Hair Approach",
           tagline: "Master Hair Stylist & Hair Colorist",
           subtitle: "Blonde Specialist | Balayage",
           ctaText: "Book Your Transformation",
           primaryColor: "#1a1a1a",
           accentColor: "#C9A96E",
           textColor: "#FFFFFF",
           showPoweredBy: true,
           poweredByText: "Powered by SuperSeller AI",
           photos: [
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg", label: "Blonde Highlights" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_client-waves.jpg", label: "Elegant Waves" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg", label: "Rich Brunette" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg", label: "Blonde Transformation" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_color-change.jpg", label: "Color Change" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg", label: "Platinum Result" },
           ],
       }}
   />
   <Composition
       id="HairShowreel-9x16"
       component={HairShowreelComposition}
       width={1080}
       height={1920}
       fps={FPS}
       durationInFrames={sec(18)}
       defaultProps={{
           businessName: "Hair Approach",
           tagline: "Master Hair Stylist & Hair Colorist",
           subtitle: "Blonde Specialist | Balayage",
           ctaText: "Book Your Transformation",
           primaryColor: "#1a1a1a",
           accentColor: "#C9A96E",
           textColor: "#FFFFFF",
           showPoweredBy: true,
           poweredByText: "Powered by SuperSeller AI",
           photos: [
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg", label: "Blonde Highlights" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_client-waves.jpg", label: "Elegant Waves" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg", label: "Rich Brunette" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg", label: "Blonde Transformation" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_color-change.jpg", label: "Color Change" },
               { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg", label: "Platinum Result" },
           ],
       }}
   />
   ```
</instructions>
<verify>
- Root.tsx compiles without errors
- `npx remotion studio` shows HairShowreel-16x9 and HairShowreel-9x16 in composition list
- Preview plays correctly with default props
</verify>
<commit_message>feat: register HairShowreel compositions in Remotion Root</commit_message>
</task>

<task id="5">
<title>Create render script and execute on RackNerd</title>
<instructions>
Create `apps/worker/src/scripts/hair-approach-render.ts`:

```typescript
import { renderComposition } from '../services/remotion-renderer';
import { uploadToR2 } from '../services/r2';
import { mkdirSync } from 'fs';

async function main() {
    const outputDir = '/tmp/hair-approach-showreel';
    mkdirSync(outputDir, { recursive: true });

    const props = {
        businessName: "Hair Approach",
        tagline: "Master Hair Stylist & Hair Colorist",
        subtitle: "Blonde Specialist | Balayage",
        ctaText: "Book Your Transformation",
        primaryColor: "#1a1a1a",
        accentColor: "#C9A96E",
        textColor: "#FFFFFF",
        showPoweredBy: true,
        poweredByText: "Powered by SuperSeller AI",
        photos: [
            { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg", label: "Blonde Highlights" },
            { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_client-waves.jpg", label: "Elegant Waves" },
            { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg", label: "Rich Brunette" },
            { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg", label: "Blonde Transformation" },
            { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_color-change.jpg", label: "Color Change" },
            { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg", label: "Platinum Result" },
        ],
    };

    // Render 16:9 master
    console.log('Rendering HairShowreel-16x9...');
    const result16x9 = await renderComposition({
        compositionId: 'HairShowreel-16x9',
        inputProps: props,
        outputPath: `${outputDir}/master-16x9.mp4`,
        concurrency: 2,
        crf: 18,
        onProgress: (pct) => process.stdout.write(`\r  16x9: ${pct}%`),
    });
    console.log(`\n  Done: ${result16x9.durationSeconds.toFixed(1)}s, rendered in ${result16x9.renderTimeSeconds.toFixed(1)}s`);

    // Render 9:16 vertical
    console.log('Rendering HairShowreel-9x16...');
    const result9x16 = await renderComposition({
        compositionId: 'HairShowreel-9x16',
        inputProps: props,
        outputPath: `${outputDir}/master-9x16.mp4`,
        concurrency: 2,
        crf: 18,
        onProgress: (pct) => process.stdout.write(`\r  9x16: ${pct}%`),
    });
    console.log(`\n  Done: ${result9x16.durationSeconds.toFixed(1)}s, rendered in ${result9x16.renderTimeSeconds.toFixed(1)}s`);

    // Upload both to R2
    const url16x9 = await uploadToR2(`${outputDir}/master-16x9.mp4`, 'hair-approach/showreel/master-16x9.mp4', 'video/mp4');
    const url9x16 = await uploadToR2(`${outputDir}/master-9x16.mp4`, 'hair-approach/showreel/master-9x16.mp4', 'video/mp4');

    console.log('\n=== SHOWREEL COMPLETE ===');
    console.log(`16:9 Master: ${url16x9}`);
    console.log(`9:16 Vertical: ${url9x16}`);
    console.log('[COST] Remotion render: $0.00 (local compute only)');
}

main().catch(console.error);
```

Deploy and run on RackNerd:
```bash
rsync -avz apps/worker/ root@172.245.56.50:/opt/tourreel-worker/apps/worker/ --exclude node_modules
ssh root@172.245.56.50 "cd /opt/tourreel-worker/apps/worker && npx tsx src/scripts/hair-approach-render.ts"
```

Note: The Remotion bundle step takes 10-30s on first run. The actual render should take ~30-60s for 18s of video.
</instructions>
<verify>
- Both MP4 files uploaded to R2 and accessible:
  - `curl -s -o /dev/null -w '%{http_code}' https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/showreel/master-16x9.mp4` → 200
  - Same for master-9x16.mp4
- 16x9 video is 1920x1080, ~18s duration
- 9x16 video is 1080x1920, ~18s duration
- Video plays correctly: intro → 6 photos → outro
</verify>
<commit_message>feat: render Hair Approach showreel — 18s branded portfolio video</commit_message>
</task>
</tasks>
