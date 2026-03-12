---
phase: hair-approach-demo-package
plan: 04
title: Create 3 social content mockup renders using PhoneMockup
wave: 2
depends_on: [01]
files_modified:
  - apps/worker/remotion/src/SocialMockupComposition.tsx
  - apps/worker/remotion/src/types/social-mockup-props.ts
  - apps/worker/remotion/src/Root.tsx
  - apps/worker/src/scripts/hair-approach-mockups.ts
autonomous: true
must_haves:
  - 3 static PNG mockup images showing sample IG posts inside PhoneMockup frames
  - Each mockup is 1920x1080 (landscape for landing page gallery)
  - Mockup content uses Deanna's actual upscaled photos
  - Honey gold #C9A96E + dark charcoal #1a1a1a branding consistent
  - Mockups uploaded to R2 at hair-approach/mockups/mockup-{1,2,3}.png
  - Zero API cost (Remotion still frame renders only)
---

<tasks>
<task id="1">
<title>Create SocialMockup props type</title>
<instructions>
Create `apps/worker/remotion/src/types/social-mockup-props.ts`:

```typescript
import { z } from "zod";

export const SocialMockupPropsSchema = z.object({
    // The IG post content
    postImageUrl: z.string(),           // The main photo in the post
    postCaption: z.string(),            // IG caption text
    postType: z.enum(["result", "tip", "before-after"]),

    // Account info shown in IG header
    accountName: z.string().default("hairapproach"),
    accountAvatar: z.string().optional(),  // Small profile pic URL

    // Branding
    accentColor: z.string().default("#C9A96E"),
    bgColor: z.string().default("#1a1a1a"),

    // Layout
    phonePosition: z.enum(["center", "left", "right"]).default("center"),
    headline: z.string().optional(),    // Text next to phone (e.g. "Your Instagram, Elevated")
    subheadline: z.string().optional(),
});

export type SocialMockupProps = z.infer<typeof SocialMockupPropsSchema>;
```
</instructions>
<verify>TypeScript compiles without errors</verify>
<commit_message>feat: add SocialMockup props type</commit_message>
</task>

<task id="2">
<title>Build SocialMockupComposition component</title>
<instructions>
Create `apps/worker/remotion/src/SocialMockupComposition.tsx`:

This composition renders a SINGLE FRAME (still image) showing a phone mockup with an IG post inside.

**Layout (1920x1080):**
- Background: #1a1a1a solid
- Phone mockup positioned based on `phonePosition` prop
- If `headline` provided: phone on left/right, text on opposite side
- If no headline: phone centered

**Phone content (inside PhoneMockup viewport):**
Build a simplified IG post UI:
1. **IG Header bar** (top of phone screen):
   - Small circle (32px) as avatar placeholder (gray circle or accountAvatar image)
   - Account name "@hairapproach" in white, 14px font
   - Three dots icon (optional)

2. **Post image**: The main photo, fills phone width, aspect ratio 1:1 (square crop)
   - Use `<Img src={postImageUrl} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />`

3. **Engagement bar** below image:
   - Heart, Comment, Share icons (simple SVG or Unicode: ♡ 💬 ➤)
   - Like count: "127 likes" (static mockup number)

4. **Caption area**:
   - "@hairapproach" in bold, then caption text in regular weight
   - Font: system-ui or Montserrat (FONT_FAMILY from existing config — inside the phone IG UI is fine)
   - Truncate to 2 lines with "...more"

**Headline text (when provided):**
- Playfair Display, 48px, #C9A96E
- Positioned opposite the phone
- Subheadline below in 24px, white with 0.7 opacity

**Use the existing PhoneMockup component** from `./components/PhoneMockup.tsx`:
```tsx
import { PhoneMockup } from "./components/PhoneMockup";
```
Pass `accentColorRgb="201, 169, 110"` (RGB of #C9A96E) and `scale={0.9}`.

The PhoneMockup component accepts `children` — render the IG post UI as children.

**Important:** This will be rendered as a still frame (frame 0), so no animations needed. But PhoneMockup has spring animations — set `delay={0}` and the spring will settle at frame ~20. Render at frame 30 to capture the settled state, OR use `staticFrame` in the Composition registration.
</instructions>
<verify>
- Component renders in Remotion Studio
- Shows phone mockup with IG post layout
- Branding colors correct: gold accents, dark background
</verify>
<commit_message>feat: add SocialMockupComposition for IG post phone mockups</commit_message>
</task>

<task id="3">
<title>Register 3 mockup compositions and render script</title>
<instructions>
1. Add to `apps/worker/remotion/src/Root.tsx` — 3 Composition entries:

```tsx
import { SocialMockupComposition } from "./SocialMockupComposition";

{/* ─── Social Mockups (Hair Approach) ────────── */}
<Composition
    id="SocialMockup-Result"
    component={SocialMockupComposition}
    width={1920}
    height={1080}
    fps={1}
    durationInFrames={30}
    defaultProps={{
        postImageUrl: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg",
        postCaption: "Sun-kissed highlights for summer. Balayage is all about that natural, lived-in glow. DM to book your transformation.",
        postType: "result" as const,
        accountName: "hairapproach",
        accentColor: "#C9A96E",
        bgColor: "#1a1a1a",
        phonePosition: "left" as const,
        headline: "Your Instagram, Elevated",
        subheadline: "AI-powered content that books appointments",
    }}
/>
<Composition
    id="SocialMockup-Tip"
    component={SocialMockupComposition}
    width={1920}
    height={1080}
    fps={1}
    durationInFrames={30}
    defaultProps={{
        postImageUrl: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg",
        postCaption: "Pro tip: Always use a heat protectant before styling. Your hair will thank you. #hairtips #salonlife #dallashair",
        postType: "tip" as const,
        accountName: "hairapproach",
        accentColor: "#C9A96E",
        bgColor: "#1a1a1a",
        phonePosition: "right" as const,
        headline: "Content That Converts",
        subheadline: "Professional posts, zero effort",
    }}
/>
<Composition
    id="SocialMockup-Transform"
    component={SocialMockupComposition}
    width={1920}
    height={1080}
    fps={1}
    durationInFrames={30}
    defaultProps={{
        postImageUrl: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg",
        postCaption: "From brassy to icy platinum. This transformation took 2 sessions and the results speak for themselves.",
        postType: "result" as const,
        accountName: "hairapproach",
        accentColor: "#C9A96E",
        bgColor: "#1a1a1a",
        phonePosition: "center" as const,
    }}
/>
```

2. Create render script `apps/worker/src/scripts/hair-approach-mockups.ts`:

```typescript
import { renderStill } from '@remotion/renderer';
// Use ensureBundle equivalent — or use renderComposition and extract frame

async function main() {
    const { bundle } = await import("@remotion/bundler");
    const { renderStill, selectComposition } = await import("@remotion/renderer");
    const path = await import("path");
    const fs = await import("fs");

    const outputDir = '/tmp/hair-approach-mockups';
    fs.mkdirSync(outputDir, { recursive: true });

    const entryPoint = path.resolve(process.cwd(), "remotion/src/index.ts");
    const serveUrl = await bundle({ entryPoint, webpackOverride: (config: any) => config });

    const mockups = [
        { id: "SocialMockup-Result", output: "mockup-1.png" },
        { id: "SocialMockup-Tip", output: "mockup-2.png" },
        { id: "SocialMockup-Transform", output: "mockup-3.png" },
    ];

    for (const mockup of mockups) {
        console.log(`Rendering ${mockup.id}...`);
        const composition = await selectComposition({
            serveUrl,
            id: mockup.id,
        });
        await renderStill({
            composition,
            serveUrl,
            output: path.join(outputDir, mockup.output),
            frame: 25,  // After PhoneMockup spring settles
        });
        console.log(`  Done: ${mockup.output}`);
    }

    // Upload to R2
    const { uploadToR2 } = await import('../services/r2');
    for (const mockup of mockups) {
        const localPath = path.join(outputDir, mockup.output);
        const r2Key = `hair-approach/mockups/${mockup.output}`;
        const url = await uploadToR2(localPath, r2Key, 'image/png');
        console.log(`Uploaded: ${url}`);
    }

    console.log('\n[COST] Social mockup renders: $0.00 (local compute only)');
}

main().catch(console.error);
```

Note: `renderStill` is from `@remotion/renderer`. It renders a single frame as PNG/JPEG. This is more efficient than rendering a full video for still mockups.
</instructions>
<verify>
- 3 PNG files generated and uploaded to R2
- Each is 1920x1080
- Phone mockup shows IG post UI with Deanna's photos
- Accessible via R2 public URLs
</verify>
<commit_message>feat: render 3 Hair Approach social content mockups</commit_message>
</task>

<task id="4">
<title>Deploy and render mockups on RackNerd</title>
<instructions>
1. Deploy full worker to RackNerd:
   ```bash
   rsync -avz apps/worker/ root@172.245.56.50:/opt/tourreel-worker/apps/worker/ --exclude node_modules
   ```

2. Run render script:
   ```bash
   ssh root@172.245.56.50 "cd /opt/tourreel-worker/apps/worker && npx tsx src/scripts/hair-approach-mockups.ts"
   ```

3. Verify all 3 mockup PNGs are on R2 and look correct.
</instructions>
<verify>
- `curl -s -o /dev/null -w '%{http_code}' https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/mockups/mockup-1.png` → 200
- Same for mockup-2.png and mockup-3.png
- Each image is 1920x1080 and shows phone mockup with IG post
</verify>
<commit_message>chore: deploy and render Hair Approach social mockups on RackNerd</commit_message>
</task>
</tasks>
