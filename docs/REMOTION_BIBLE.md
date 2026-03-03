# Remotion Video Engine Bible — SuperSeller AI

**Version:** 1.0 | **Date:** 2026-02-27
**Status:** Live (first render successful)
**Remotion Version:** 4.0.429
**Location:** `apps/worker/remotion/`

---

## 1. Architecture Overview

Remotion is a React-based programmatic video engine. Videos are React components rendered frame-by-frame using Chrome Headless Shell + FFmpeg → H.264 MP4.

**Why Remotion over AI Video (Kling 3.0):**
- **Deterministic:** Same input = same output, every time
- **Zero API cost:** No per-video generation fees
- **Control:** Pixel-perfect compositions, timing, transitions
- **Speed:** ~55s video renders in ~60s locally
- **Multi-format:** One codebase → 4 aspect ratios (16:9, 9:16, 1:1, 4:5)

**Stack:**
```
Remotion React Components (JSX/TSX)
  ↓ bundle() — Webpack (once at startup, ~2s cached)
  ↓ selectComposition() — resolves metadata
  ↓ renderMedia() — Chrome Headless Shell + FFmpeg
  ↓ H.264 MP4 → R2 upload → public URL
```

---

## 2. Directory Structure

```
apps/worker/
├── remotion/
│   ├── src/
│   │   ├── index.ts                    # registerRoot entry point
│   │   ├── Root.tsx                     # 4 Composition declarations
│   │   ├── PropertyTourComposition.tsx  # Main property tour
│   │   ├── components/
│   │   │   ├── KenBurnsSlide.tsx       # Photo pan/zoom animation
│   │   │   ├── RoomLabel.tsx           # Room name pill overlay
│   │   │   ├── IntroCard.tsx           # Address + stats + price
│   │   │   └── OutroCard.tsx           # Agent card + CTA
│   │   ├── config/
│   │   │   ├── timing.ts              # FPS, durations, constants
│   │   │   ├── ken-burns-patterns.ts   # Per-room KB configs
│   │   │   └── fonts.ts               # Google Fonts loading
│   │   └── types/
│   │       └── composition-props.ts    # Zod schemas
│   └── tsconfig.json
├── src/
│   ├── services/
│   │   └── remotion-renderer.ts        # Server-side render service
│   └── scripts/
│       └── test-remotion-render.ts     # Test script
└── .agents/skills/remotion-best-practices/  # 38 rule files
```

---

## 3. Installed Packages

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

---

## 4. Compositions (Root.tsx)

| ID | Dimensions | Use Case |
|----|-----------|----------|
| `PropertyTour-16x9` | 1920×1080 | Master (YouTube, website) |
| `PropertyTour-9x16` | 1080×1920 | Reels, TikTok, Stories |
| `PropertyTour-1x1` | 1080×1080 | Instagram/FB feed |
| `PropertyTour-4x5` | 1080×1350 | Instagram portrait feed |

Duration is dynamic via `calculateMetadata` based on photo count.

---

## 5. Property Tour Composition Flow

```
[Intro Card: 5s]
  → Hero image background (blurred, Ken Burns)
  → Logo spring-in
  → Address (Platypi display font)
  → City, State ZIP
  → Stats bar: N Beds | N Baths | N SqFt (staggered springs)
  → Price (spring scale)

[Room 1..N: 4-5.5s each]
  → Ken Burns pan/zoom on photo (unique per room type)
  → Room label pill (spring in, fade out)
  → Transitions: fade → slide(right) → wipe(left) → slide(bottom) → fade → flip → wipe(right) → slide(left)
  → Light leak overlays every 4th room (when --gl=angle available)

[Outro Card: 10s]
  → Agent photo (circular, branded border)
  → Agent name + company
  → Phone + email
  → "Schedule a Showing" CTA button
  → Powered by SuperSeller
  → All staggered spring animations
```

---

## 6. Ken Burns Patterns

Each room type has a unique pan/zoom configuration:
- **exterior_front**: Pull-back reveal (1.15→1.0 scale, bottom→center)
- **interior_living**: Right-to-left pan (1.12 scale, 8%→-5% X)
- **interior_kitchen**: Counter zoom (1.08→1.18 scale, -3%→3% X)
- **interior_bedroom**: Slow zoom out (1.2→1.05 scale)
- **interior_bathroom**: Left-to-right pan (1.1 scale, -8%→5% X)
- **pool**: Wide pan (1.15 scale, -10%→10% X)

5 alternate patterns prevent monotony when multiple rooms share a type.

---

## 7. Timing Constants

| Constant | Value | Frames@30fps |
|----------|-------|-------------|
| FPS | 30 | — |
| INTRO_DURATION | 5s | 150 |
| OUTRO_DURATION | 10s | 300 |
| Hero room duration | 5.5s | 165 |
| Standard room duration | 4.0s | 120 |
| Room label delay | 0.6s | 18 |
| Room label duration | 2.5s | 75 |
| Music fade in | 1.5s | 45 |
| Music fade out | 3.0s | 90 |
| Music volume | 0.25 | — |
| Transition duration | 15 frames | 0.5s |

**Duration scaling:** >10 rooms → 70% base duration; >7 rooms → 85% base duration.

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

## 10. Available Remotion Features (from docs research)

### Core Animation
- `interpolate(frame, inputRange, outputRange, options)` — map values
- `interpolateColors(frame, inputRange, colors)` — color transitions
- `spring({ frame, fps, config })` — physics-based easing
- `Easing.*` — 20+ easing functions (quad, cubic, elastic, bounce, bezier)

### Transitions
- `fade()`, `slide(direction)`, `wipe(direction)`, `flip(direction)`, `clockWipe({width, height})`
- `linearTiming()`, `springTiming()` — timing control
- `TransitionSeries.Overlay` — overlays at cut points (light leaks, etc.)

### Media
- `<Audio>` from `@remotion/media` — looping, volume callbacks, trim, pitch
- `<Video>` / `<OffthreadVideo>` — frame-accurate video embedding
- `<Img>` — load-safe images (MUST use instead of `<img>`)
- `<Gif>` from `@remotion/gif` — frame-synced GIF playback

### Typography
- `@remotion/google-fonts` — 1500+ fonts with `delayRender` auto-blocking
- `@remotion/fonts` — local font loading (.woff2, .ttf)
- Text measuring: `measureText()`, `fillTextBox()` for dynamic sizing

### Visual Effects
- `@remotion/light-leaks` — WebGL light leak overlays (requires `--gl=angle`)
- `@remotion/motion-blur` — `<Trail>`, `<CameraMotionBlur>` (film-like)
- `@remotion/noise` — Perlin noise for organic motion (noise2D, noise3D, noise4D)
- `@remotion/shapes` — Rect, Circle, Triangle, Star, Polygon with path data
- `@remotion/paths` — SVG path animation (evolvePath, interpolatePath, getPointAtLength)

### Sound
- `@remotion/sfx` — Built-in sounds: whoosh, whip, pageTurn, shutter, switch, click
- All Creative Commons 0, no attribution needed

### Advanced
- `@remotion/lottie` — Lottie animation embedding
- Mapbox integration — animated maps with camera movement
- Captions/subtitles — whisper-based transcription + rendering
- Voiceover — ElevenLabs TTS integration pattern
- Charts — bar, pie, line, stock (D3.js or SVG-native)

### Deployment Options
- **VPS (current):** renderMedia() on RackNerd via BullMQ
- **Lambda:** @remotion/lambda for AWS serverless rendering
- **Cloud Run:** @remotion/cloudrun for GCP
- **Player:** @remotion/player for real-time web preview

---

## 11. Critical Rules (from Remotion Skills)

1. **All animations MUST use `useCurrentFrame()`** — CSS transitions are FORBIDDEN
2. **Use `<Img>` not `<img>`** — prevents flickering/blank frames
3. **Use `<Audio>` from `@remotion/media`** — not HTML5 audio
4. **Bundle once, render many** — never re-bundle per video
5. **Load fonts via `@remotion/google-fonts`** — auto-blocks render until ready
6. **Memoize Lottie `animationData`** — prevents re-initialization
7. **Light leaks require `--gl=angle`** — WebGL dependency
8. **Maps require `--gl=angle --concurrency=1`** — Mapbox rendering constraint
9. **`calculateMetadata` runs once** — ideal for data fetching, not per-frame
10. **`OffthreadVideo` > `Video` for SSR** — FFmpeg frame extraction more reliable

---

## 12. Product Use Cases

### Tier 1 (Immediate)
| Product | Description | Status |
|---------|-------------|--------|
| **TourReel** | Property tour videos from Zillow photos | ✅ Live (first render done) |
| **Product Demos** | Automated SuperSeller product showcase videos | Planned |
| **Social Clips** | Platform-specific clips (Reels, TikTok, etc.) | Planned |

### Tier 2 (Near-term)
| Product | Description | Status |
|---------|-------------|--------|
| **VideoForge** | Business promo/product videos (white-label service) | Spec |
| **Listing Announcements** | "Just Listed" / "Price Reduced" social cards | Spec |
| **Agent Intro Videos** | Agent personal branding videos | Spec |

### Tier 3 (Future)
| Product | Description | Status |
|---------|-------------|--------|
| **InsightReel** | Data visualization videos (market reports) | Idea |
| **Testimonial Videos** | Client review + property showcase | Idea |
| **WhatsApp Video Cards** | Branded video cards for WhatsApp delivery | Idea |
| **Catalogue Videos** | Product catalogue walkthrough videos | Idea |

---

## 13. Licensing

Remotion uses a **dual license:**
- **Free tier:** Personal projects, evaluated revenue <$100K
- **Company license:** Required for >$100K revenue or >3 cloud renders/month
- **Enterprise:** Custom pricing

Our usage: Server-side rendering on VPS = **Company license required** once production revenue crosses threshold. Free tier OK for development and initial launch.

---

## 14. Test Results

### First Successful Render (2026-02-27)
- **Property:** 1531 Home Park Dr, Allen TX 75002
- **Photos:** 10 Zillow photos (front, foyer, living, kitchen, dining, 2 bedrooms, 2 bathrooms, pool)
- **Duration:** 55.4 seconds @ 30fps (1661 frames)
- **Size:** 21.6 MB (H.264, CRF 20)
- **Render time:** 62.9s (local MacBook, 4 threads)
- **Bundle time:** 1.5s (cached)
- **URL v1:** https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/remotion-test/16_9.mp4
- **URL v2 (improved fonts/transitions):** https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/remotion-test/16_9_v2.mp4

---

## 15. Next Steps

1. **Add background music** — upload royalty-free track to R2 (bypass CORS)
2. **Deploy to RackNerd VPS** — Chrome Headless Shell + deps
3. **Wire into BullMQ** — `remotion-property-tour` job type
4. **All 4 aspect ratios** — render all from single job
5. **Agent photo overlay** — circular PIP on room scenes
6. **Light leaks on VPS** — test `--gl=angle` on Linux
7. **Voiceover integration** — ElevenLabs TTS for narrated tours
8. **VideoForge templates** — business promo compositions
9. **Player preview** — web-based real-time preview before render
10. **Model Observatory integration** — auto-select optimal render settings

---

*Canonical reference for all Remotion video work. For TourReel pipeline specifics, see NotebookLM 0baf5f36.*
