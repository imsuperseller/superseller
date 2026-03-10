# Remotion Video Engine Bible -- SuperSeller AI

**Version:** 2.0 | **Date:** 2026-03-03
**Status:** Live (deployed to RackNerd, BullMQ wired, 14 compositions)
**Remotion Version:** 4.0.429
**Location:** `apps/worker/remotion/`

---

## 1. Architecture Overview

Remotion is a React-based programmatic video engine. Videos are React components rendered frame-by-frame using Chrome Headless Shell + FFmpeg -> H.264 MP4.

**Why Remotion over AI Video (Kling 3.0):**
- **Deterministic:** Same input = same output, every time
- **Zero API cost:** No per-video generation fees (vs $0.10/clip for Kling)
- **Control:** Pixel-perfect compositions, timing, transitions
- **Speed:** ~55s video renders in ~60s locally, ~120s on VPS
- **Multi-format:** One codebase -> 4 aspect ratios (16:9, 9:16, 1:1, 4:5)

**When to use Kling/AI instead:** Cinematic motion (people walking, cars driving, water flowing), AI voiceover, photo-realistic scene generation. See Section 16 for the full decision matrix.

**Stack:**
```
Remotion React Components (JSX/TSX)
  | bundle() -- Webpack (once at startup, ~2s cached)
  | selectComposition() -- resolves metadata
  | renderMedia() -- Chrome Headless Shell + FFmpeg
  | H.264 MP4 -> R2 upload -> public URL
```

---

## 2. Directory Structure

```
apps/worker/
+-- remotion/
|   +-- src/
|   |   +-- index.ts                         # registerRoot entry point
|   |   +-- Root.tsx                          # 14 Composition declarations
|   |   +-- PropertyTourComposition.tsx       # Main property tour
|   |   +-- CrewRevealComposition.tsx         # Brand intro: logo explode, 7 agents
|   |   +-- CrewDemoComposition.tsx           # Per-agent feature showcase
|   |   +-- CrewDemoV2Composition.tsx         # Real video in device mockup
|   |   +-- CrewDemoV3Composition.tsx         # Full-screen video + overlay system
|   |   +-- components/
|   |   |   +-- KenBurnsSlide.tsx            # Photo pan/zoom (6 patterns + 5 alternates)
|   |   |   +-- RoomLabel.tsx                # Room name pill overlay
|   |   |   +-- IntroCard.tsx                # Address + stats + price
|   |   |   +-- OutroCard.tsx                # Agent card + CTA
|   |   |   +-- VideoSlide.tsx               # OffthreadVideo wrapper with KB zoom
|   |   |   +-- SceneOverlay.tsx             # 5 overlay layouts for video scenes
|   |   |   +-- PhoneMockup.tsx              # CSS-only iPhone frame
|   |   |   +-- LaptopMockup.tsx             # CSS-only MacBook frame
|   |   |   +-- ProductDemoScene.tsx          # Device mockup + video + annotations
|   |   |   +-- shared/
|   |   |       +-- AnimatedBg.tsx           # Animated gradient background
|   |   |       +-- FilmGrain.tsx            # SVG fractalNoise film grain
|   |   |       +-- GlassPanel.tsx           # Glassmorphism panel
|   |   |       +-- ParticleField.tsx        # Floating particle field
|   |   |       +-- Vignette.tsx             # Radial gradient vignette
|   |   +-- config/
|   |   |   +-- timing.ts                   # FPS, durations, sec() helper
|   |   |   +-- ken-burns-patterns.ts        # Per-room KB configs
|   |   |   +-- fonts.ts                    # Google Fonts loading
|   |   +-- types/
|   |       +-- composition-props.ts         # Zod schema: PropertyTourProps
|   |       +-- crew-demo-v2-props.ts        # CrewDemoV2 props
|   |       +-- crew-demo-v3-props.ts        # CrewDemoV3 props (scenes + overlays)
|   +-- tsconfig.json
+-- src/
|   +-- services/
|   |   +-- remotion-renderer.ts             # Server-side render service
|   +-- queue/
|       +-- workers/remotion.worker.ts       # BullMQ worker
|       +-- queues.ts                        # remotionQueue definition
+-- .agents/skills/remotion-best-practices/  # 38 rule files
```

---

## 3. Installed Packages (11)

| Package | Version | Purpose |
|---------|---------|---------|
| `remotion` | 4.0.429 | Core (Composition, Sequence, interpolate, spring) |
| `@remotion/cli` | 4.0.429 | CLI tools + Studio |
| `@remotion/renderer` | 4.0.429 | Server-side renderMedia/renderStill |
| `@remotion/bundler` | 4.0.429 | Webpack bundling |
| `@remotion/transitions` | 4.0.429 | TransitionSeries, fade/slide/wipe/flip |
| `@remotion/media` | 4.0.429 | Audio component (CORS-safe) |
| `@remotion/google-fonts` | 4.0.429 | Font loading (Montserrat, Platypi) |
| `@remotion/shapes` | 4.0.429 | SVG shapes (Rect, Circle, Star, etc.) |
| `@remotion/paths` | 4.0.429 | SVG path animation (evolvePath, interpolatePath) |
| `@remotion/light-leaks` | 4.0.429 | WebGL light leak overlays |
| `@remotion/sfx` | 4.0.429 | Sound effects (whoosh, whip, shutter) |

### Not Yet Installed (high value)

| Package | Purpose | Priority |
|---------|---------|----------|
| `@remotion/player` | Real-time web preview in Next.js -- customers preview before render | HIGH |
| `@remotion/lottie` | After Effects animations (JSON) with timeline sync | MEDIUM |
| `@remotion/noise` | Perlin noise (noise2D/3D/4D) for organic motion | MEDIUM |
| `@remotion/motion-blur` | `<Trail>`, `<CameraMotionBlur>` for film-quality motion | LOW |
| `@remotion/lambda` | AWS Lambda distributed rendering for scale | FUTURE |
| `@remotion/three` | React Three Fiber for 3D scenes | FUTURE |
| `@remotion/rive` | Rive animations (faster than Lottie) | FUTURE |
| `@remotion/skia` | React Native Skia for advanced 2D vector rendering | FUTURE |

---

## 4. Compositions (Root.tsx) -- 14 Total

### Property Tours (4 ratios)
| ID | Dimensions | Use Case |
|----|-----------|----------|
| `PropertyTour-16x9` | 1920x1080 | Master (YouTube, website) |
| `PropertyTour-9x16` | 1080x1920 | Reels, TikTok, Stories |
| `PropertyTour-1x1` | 1080x1080 | Instagram/FB feed |
| `PropertyTour-4x5` | 1080x1350 | Instagram portrait feed |

Duration is dynamic via `calculateMetadata` based on photo count.

### Crew/Brand Videos (10 compositions)
| ID | Dimensions | Duration | Description |
|----|-----------|----------|-------------|
| `CrewReveal-16x9` | 1920x1080 | 10s | Logo explode, 7 crew agents fly to grid, tagline |
| `CrewReveal-9x16` | 1080x1920 | 10s | Same, vertical |
| `CrewDemo-16x9` | 1920x1080 | 25s | Per-agent feature list + stats |
| `CrewDemo-9x16` | 1080x1920 | 25s | Same, vertical |
| `CrewDemoV2-16x9` | 1920x1080 | 22s | Real video in device mockup |
| `CrewDemoV2-9x16` | 1080x1920 | 22s | Same, vertical |
| `CrewDemoV3-16x9` | 1920x1080 | 30s | Full-screen AI video + 5 overlay layouts |
| `CrewDemoV3-9x16` | 1080x1920 | 30s | Same, vertical |

### CrewDemoV3 Overlay Layouts
1. **hero-intro** -- Crew name + subtitle with live badge
2. **core-action** -- Headline + subtitle describing the action
3. **result-showcase** -- Headline + bullet list of capabilities
4. **scale-impact** -- Animated counter (e.g., "50 Credits / Video")
5. **cta-outro** -- Final CTA ("Hire Forge -- 50 Credits/Video")

---

## 5. Property Tour Composition Flow

```
[Intro Card: 5s]
  -> Hero image background (blurred, Ken Burns)
  -> Logo spring-in
  -> Address (Platypi display font)
  -> City, State ZIP
  -> Stats bar: N Beds | N Baths | N SqFt (staggered springs)
  -> Price (spring scale)

[Room 1..N: 4-5.5s each]
  -> Ken Burns pan/zoom on photo (unique per room type)
  -> Room label pill (spring in, fade out)
  -> Transitions: fade -> slide(right) -> wipe(left) -> slide(bottom) -> fade -> flip -> wipe(right) -> slide(left)
  -> Light leak overlays every 4th room (when --gl=angle available)

[Outro Card: 10s]
  -> Agent photo (circular, branded border)
  -> Agent name + company
  -> Phone + email
  -> "Schedule a Showing" CTA button
  -> Powered by SuperSeller
  -> All staggered spring animations
```

---

## 6. Ken Burns Patterns

Each room type has a unique pan/zoom configuration:
- **exterior_front**: Pull-back reveal (1.15->1.0 scale, bottom->center)
- **interior_living**: Right-to-left pan (1.12 scale, 8%->-5% X)
- **interior_kitchen**: Counter zoom (1.08->1.18 scale, -3%->3% X)
- **interior_bedroom**: Slow zoom out (1.2->1.05 scale)
- **interior_bathroom**: Left-to-right pan (1.1 scale, -8%->5% X)
- **pool**: Wide pan (1.15 scale, -10%->10% X)

5 alternate patterns prevent monotony when multiple rooms share a type.

---

## 7. Timing Constants

| Constant | Value | Frames@30fps |
|----------|-------|-------------|
| FPS | 30 | -- |
| INTRO_DURATION | 5s | 150 |
| OUTRO_DURATION | 10s | 300 |
| Hero room duration | 5.5s | 165 |
| Standard room duration | 4.0s | 120 |
| Room label delay | 0.6s | 18 |
| Room label duration | 2.5s | 75 |
| Music fade in | 1.5s | 45 |
| Music fade out | 3.0s | 90 |
| Music volume | 0.25 | -- |
| Transition duration | 15 frames | 0.5s |

**Duration scaling:** >10 rooms -> 70% base duration; >7 rooms -> 85% base duration.

---

## 8. Branding System

```typescript
type BrandingConfig = {
  mode: "superseller" | "whitelabel";
  primaryColor: string;      // Button, accent, borders
  secondaryColor: string;    // Complementary
  textColor: string;         // Default "#FFFFFF"
  overlayBgColor: string;    // Labels: "rgba(0,0,0,0.55)"
  logoUrl?: string;          // Client logo URL
  showPoweredBy: boolean;    // Watermark toggle
  poweredByText: string;     // "Powered by SuperSeller"
  logoWidth: number;         // Logo size in px
  logoPosition: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};
```

- **SuperSeller mode:** Orange #F97316 primary, Teal #14B8A6 secondary
- **Whitelabel mode:** Client provides all colors and logo

---

## 9. Server-Side Rendering (remotion-renderer.ts)

Two render functions:
- `renderPropertyTour(props)` -- renders all 4 aspect ratios for property tours
- `renderComposition(id, props)` -- generic renderer for any composition ID
- `warmupRemotionBundle()` -- pre-warms the Webpack bundle at worker startup

```typescript
// Bundle once (cached)
const serveUrl = await ensureBundle();
// Select composition (resolves calculateMetadata)
const composition = await selectComposition({ serveUrl, id, inputProps });
// Render
await renderMedia({
  composition, serveUrl,
  codec: "h264",
  outputLocation: "/path/to/output.mp4",
  inputProps,
  concurrency: 2,  // Safe for 6GB VPS
  crf: 20,
  onProgress: ({ encodedFrames }) => { ... }
});
```

**Performance:**
- Bundle: ~2s (cached), ~10-30s (first time)
- Render 55s video: ~60-90s (4 threads local, ~120s VPS)
- Chrome Headless Shell: auto-downloaded (~90MB)

---

## 10. Available Remotion Features

### Core Animation
- `interpolate(frame, inputRange, outputRange, options)` -- map values
- `interpolateColors(frame, inputRange, colors)` -- color transitions
- `spring({ frame, fps, config })` -- physics-based easing (damping, stiffness, mass)
- `Easing.*` -- 20+ easing functions (quad, cubic, elastic, bounce, bezier)
- `useCurrentFrame()` -- the fundamental frame hook (ALL animations MUST use this)

### Composition Primitives
- `<Composition>` -- register renderable video
- `<Sequence>` -- time-shifted children with independent frame counter
- `<Series>` -- automatic sequential playback
- `<TransitionSeries>` -- series with visual transitions between segments
- `<AbsoluteFill>` -- full-canvas positioning
- `<Still>` -- single-frame image
- `<Loop>` -- repeat content
- `<Freeze>` -- freeze at specific frame

### Transitions
- `fade()`, `slide(direction)`, `wipe(direction)`, `flip(direction)`, `clockWipe({width, height})`
- `linearTiming()`, `springTiming()` -- timing control
- `TransitionSeries.Overlay` -- overlays at cut points (light leaks, etc.)

### Media
- `<Audio>` from `@remotion/media` -- looping, volume callbacks, trim, pitch
- `<Video>` / `<OffthreadVideo>` -- frame-accurate video embedding
- `<Img>` -- load-safe images (MUST use instead of `<img>`)
- `<Gif>` from `@remotion/gif` -- frame-synced GIF playback

### Typography
- `@remotion/google-fonts` -- 1500+ fonts with `delayRender` auto-blocking
- `@remotion/fonts` -- local font loading (.woff2, .ttf)
- Text measuring: `measureText()`, `fillTextBox()` for dynamic sizing

### Visual Effects
- `@remotion/light-leaks` -- WebGL light leak overlays (requires `--gl=angle`)
- `@remotion/motion-blur` -- `<Trail>`, `<CameraMotionBlur>` (film-like)
- `@remotion/noise` -- Perlin noise for organic motion (noise2D, noise3D, noise4D)
- `@remotion/shapes` -- Rect, Circle, Triangle, Star, Polygon with path data
- `@remotion/paths` -- SVG path animation (evolvePath, interpolatePath, getPointAtLength)

### Sound
- `@remotion/sfx` -- Built-in sounds: whoosh, whip, pageTurn, shutter, switch, click
- All Creative Commons 0, no attribution needed

### Advanced (not yet installed)
- `@remotion/lottie` -- Lottie animation embedding
- `@remotion/rive` -- Rive animations (faster/smaller than Lottie)
- `@remotion/three` -- React Three Fiber 3D scenes
- `@remotion/skia` -- React Native Skia 2D vector rendering
- Mapbox integration -- animated maps with camera movement
- Captions/subtitles -- Whisper transcription + rendering
- Charts -- bar, pie, line, stock (D3.js or SVG-native with @remotion/shapes)

### Deployment Options
- **VPS (current):** renderMedia() on RackNerd via BullMQ -- DEPLOYED
- **Lambda:** @remotion/lambda for AWS serverless, distributed chunk rendering
- **Cloud Run:** @remotion/cloudrun for GCP (Alpha)
- **Player:** @remotion/player for real-time web preview in Next.js
- **Studio:** npx remotion studio for local dev preview

---

## 11. Critical Rules (from Remotion Skills)

1. **All animations MUST use `useCurrentFrame()`** -- CSS transitions are FORBIDDEN
2. **Use `<Img>` not `<img>`** -- prevents flickering/blank frames
3. **Use `<Audio>` from `@remotion/media`** -- not HTML5 audio
4. **Bundle once, render many** -- never re-bundle per video
5. **Load fonts via `@remotion/google-fonts`** -- auto-blocks render until ready
6. **Memoize Lottie `animationData`** -- prevents re-initialization
7. **Light leaks require `--gl=angle`** -- WebGL dependency
8. **Maps require `--gl=angle --concurrency=1`** -- Mapbox rendering constraint
9. **`calculateMetadata` runs once** -- ideal for data fetching, not per-frame
10. **`OffthreadVideo` > `Video` for SSR** -- FFmpeg frame extraction more reliable
11. **Charts: disable ALL D3 animations** -- drive everything from useCurrentFrame()

---

## 12. Free Video Types (Zero API Cost)

Everything below uses only Remotion (React + Chrome Headless + FFmpeg). Zero per-video API costs.

### Already Built
| Type | Composition | Status |
|------|------------|--------|
| Property tour slideshows (4 ratios) | PropertyTour-* | LIVE |
| Brand intro (logo explode, 7 agents) | CrewReveal-* | LIVE |
| Per-agent product showcase | CrewDemo-* | LIVE |
| Device mockup with video | CrewDemoV2-* | LIVE |
| Full-screen video + overlays | CrewDemoV3-* | LIVE |

### Buildable with Existing Packages (No New Installs)
| Type | Key Components | Effort |
|------|---------------|--------|
| **Quote/testimonial cards** | animated text + star ratings + customer photo + Ken Burns bg | Small |
| **Stat highlight reels** | animated counters + spring() + ParticleField | Small |
| **Before/after comparisons** | clip-path slider + interpolate() | Small |
| **Data visualization** | @remotion/shapes + paths + spring() for animated charts | Medium |
| **Listing announcements** | "Just Listed" / "Price Reduced" + property photo | Small |
| **Logo animations** | @remotion/paths evolvePath() + spring reveals | Medium |
| **Pricing/feature tables** | animated table rows + checkmarks | Small |
| **Onboarding walkthroughs** | device mockup + step indicators + annotations | Medium |
| **Business announcements** | dynamic text + counters + branded animations | Small |
| **Catalog/portfolio videos** | multi-product Ken Burns + specs overlay | Medium |
| **WhatsApp video cards** | 5-10s personalized branded clips | Small |
| **Social tip-of-the-day** | branded tip cards for Instagram/TikTok | Small |

### Would Need AI APIs (Costs Money)
| Type | API Needed | Cost |
|------|-----------|------|
| Cinematic AI video clips | Kling 3.0 via Kie.ai | $0.10/clip |
| Realtor composited into scenes | Nano Banana via Kie.ai | $0.02/composite |
| AI voiceover/narration | ElevenLabs via Kie.ai | ~$0.02/generation |
| AI music generation | Suno V5 via Kie.ai | $0.06/track |
| Vision-based room detection | Gemini 3 Flash via Kie.ai | ~$0.001/image |
| Photo upscaling | Recraft Crisp via Kie.ai | $0.0025/image |

---

## 13. Licensing

Remotion uses tiered licensing:

| Tier | Who Qualifies | Cost |
|------|--------------|------|
| **Free** | Individuals, companies <=3 employees, non-profits, evaluation | $0 |
| **Company - Creators** | Companies 4+ employees creating videos for themselves | $25/month per seat |
| **Company - Automators** | SaaS where end-users trigger renders | $0.01/render, $100/month min |
| **Enterprise** | Custom terms, priority support | $500+/month |

**SuperSeller status:** Currently qualifies for Free tier. When scaling as SaaS, Automators tier ($100/month min) is the right fit. At $0.01/render, 10,000+ renders/month before exceeding minimum.

---

## 14. Test Results

### First Successful Render (2026-02-27)
- **Property:** 1531 Home Park Dr, Allen TX 75002
- **Photos:** 10 Zillow photos
- **Duration:** 55.4 seconds @ 30fps (1661 frames)
- **Size:** 21.6 MB (H.264, CRF 20)
- **Render time:** 62.9s (local MacBook, 4 threads)
- **Bundle time:** 1.5s (cached)
- **URL v1:** https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/remotion-test/16_9.mp4
- **URL v2:** https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/remotion-test/16_9_v2.mp4

---

## 15. Production Examples (Companies Using Remotion at Scale)

| Company | Use Case | Scale |
|---------|----------|-------|
| **GitHub Unwrapped** | Personalized year-in-review videos | 10,000+ users, 10K concurrent Lambdas |
| **SoundCloud** | Year-in-Review for artists | Platform-wide (millions) |
| **Icon.me** | Programmatic ad creation | $5M ARR in 30 days |
| **Crayo.ai** | Video stories generator | $6M+ ARR, 2M+ users |
| **Submagic** | AI shorts tool | $1M ARR in 3 months |
| **AIVideo.com** | Professional video creation | $1M ARR in <1 year |
| **YARX** | Personalized marathon finisher videos | Sports event scale |

NPM: 200,000+ monthly downloads.

---

## 16. Remotion vs Kie.ai Decision Matrix

| Content Type | Use Remotion (Free) | Use Kie.ai (Paid) |
|-------------|--------------------|--------------------|
| Photo slideshows with transitions | YES | No |
| Text/data animations | YES | No |
| Branded intros/outros | YES | No |
| Device mockups with screenshots | YES | No |
| Animated charts/graphs | YES | No |
| Film grain, vignette, light leaks | YES | No |
| Sound effects (whoosh, whip) | YES | No |
| Background music (pre-recorded) | YES (from R2) | No |
| Cinematic AI-generated video clips | No | Kling 3.0 ($0.10/clip) |
| Realtor composited into scenes | No | Nano Banana ($0.02) |
| AI voiceover/narration | No | ElevenLabs via Kie.ai |
| AI music generation | No | Suno V5 ($0.06/track) |
| Photo room detection | No | Gemini ($0.001/image) |
| 3D scenes | Partial (@remotion/three) | No |

**Key insight:** Remotion handles ALL compositing, timing, transitions, and rendering for free. Kie.ai only needed for generating NEW content (AI clips, voice, music). The two are complementary, not competing.

---

## 17. Scaling Options

| Option | Speed | Cost | When to Use |
|--------|-------|------|-------------|
| **VPS (current)** | ~120s/video | $0 compute | <50 videos/day |
| **Lambda** | ~19s/1min video | $0.01-0.10/video | 50+ videos/day |
| **Cloud Run** | Moderate | Pay-per-use | GCP preference |
| **Client-side** | Slowest | Free | Preview only |

Lambda benchmarks (2048MB, us-east-1): Hello World $0.001/7.5s, 1-min video $0.017/19s, 10-min HD $0.103/56s.

---

## 18. Next Steps

### Completed
- [x] Deploy to RackNerd VPS
- [x] Wire into BullMQ (remotion.worker.ts + remotionQueue)
- [x] All 4 aspect ratios from single job
- [x] CrewReveal, CrewDemo V1/V2/V3 compositions
- [x] Device mockups (phone + laptop)
- [x] Shared effects library (grain, vignette, particles, glass)

### Pending
1. **Add background music** -- upload royalty-free tracks to R2
2. **Light leaks on VPS** -- test `--gl=angle` on Linux
3. **Agent photo overlay** -- circular PIP on room scenes (placeholder fix)
4. **Install @remotion/player** -- web preview in superseller.agency
5. **Voiceover integration** -- ElevenLabs TTS via Kie.ai for narrated tours
6. **Testimonial video composition** -- quote + stars + photo
7. **Data visualization composition** -- animated charts from DB data
8. **Listing announcement composition** -- "Just Listed" / "Price Reduced"
9. **Batch rendering** -- render 100+ videos overnight from property database
10. **Captions/subtitles** -- Whisper transcription + rendering

---

*Canonical reference for all Remotion video work. For VideoForge pipeline specifics, see NotebookLM 0baf5f36. For AI model selection, see `.claude/skills/model-observatory/SKILL.md`.*
