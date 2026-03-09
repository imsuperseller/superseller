---
name: ui-design-workflow
description: >-
  Operational bridge between external UI generation tools (v0, Stitch, screenshot-to-code)
  and SuperSeller AI's branded React/Next.js codebase.
  MANDATORY: Read docs/DESIGN_STANDARDS.md before any UI work — enforceable quality gate. Use when converting external UI designs
  into SuperSeller AI-branded components, extracting UI from screenshots/URLs, or generating
  new pages from prompts via v0/Stitch. Complements ui-ux-pro-max (design intelligence)
  with execution workflows. Not for backend logic, video pipeline, or database work.
  Example: "Take this v0 component and rebrand it for SuperSeller AI".
autoTrigger:
  - "v0"
  - "Stitch"
  - "screenshot to code"
  - "rebrand component"
  - "external UI"
  - "convert design"
  - "UI generation"
  - "clone UI"
negativeTrigger:
  - "video pipeline"
  - "database"
  - "n8n"
  - "stripe"
  - "backend API"
  - "schema"
---

# UI Design Workflow — External UI to SuperSeller AI-Branded Code

## Critical
- **Always rebrand before committing** — generic shadcn/Tailwind must use `superseller-*` tokens
- **v0.dev is primary tool** for React/Next.js generation (beta API, shadcn/ui, design system support)
- **Google Stitch is secondary** — good for visual prototyping (350 free/month), outputs HTML/CSS not React
- **Run `rebrand-component.ts`** on all externally generated code before integration
- **ui-ux-pro-max provides design intelligence** — this skill provides execution pipelines

## Architecture

```
External Sources                    SuperSeller AI Pipeline
┌──────────────┐
│  v0.dev      │─── React/shadcn ──→ ┌─────────────────┐    ┌──────────────┐
│  Stitch      │─── HTML/CSS ──────→ │ rebrand-component│───→│ SuperSeller AI-branded│
│  Screenshot  │─── Image ─────────→ │ .ts (auto-token  │    │ .tsx component│
│  URL Clone   │─── HTML ──────────→ │  replacement)    │    │ in codebase   │
└──────────────┘                     └─────────────────┘    └──────────────┘
                                           │
                                     globals.css tokens
                                     (brand-token-map.md)
```

## Workflows

### Workflow 1: v0 + Claude Code (Primary — Recommended)

Best for: New pages, complex components, dashboard sections, forms.

**Steps:**
1. Generate design system context with `ui-ux-pro-max`:
   ```bash
   python3 .claude/skills/ui-ux-pro-max/scripts/search.py "saas dark dashboard" --design-system -p "SuperSeller AI"
   ```
2. Craft a v0 prompt incorporating SuperSeller AI brand:
   ```
   Create a [component] using shadcn/ui and Tailwind CSS.
   Dark theme: background #110d28, cards #1a153f, surfaces #17123a.
   Primary accent: cyan #5ffbfd. Secondary accent: blue #1eaef7.
   CTA buttons: red #fe3d51 with glow effect.
   Text: #fffff3 primary, #b0bec5 secondary, #94a3b8 muted.
   Use Inter font. Rounded corners (0.5rem). Subtle glow shadows.
   ```
3. Copy generated React/TSX code from v0
4. Run rebrand tool: `npx tsx tools/rebrand-component.ts <file.tsx>`
5. Integrate into codebase, verify with dev server

**v0 API (Beta):** Programmatic generation available at `v0.dev/docs/api/platform/overview`.
Supports custom Tailwind config and Shadcn Registry for design token injection.

### Workflow 2: Screenshot to Component (Quick Conversion)

Best for: Cloning existing UI you saw somewhere, reference designs, competitor analysis.

**Steps:**
1. Take screenshot of target UI
2. Feed screenshot to Claude Code: "Convert this screenshot to a React/Tailwind component"
3. Claude generates component matching the visual structure
4. Run rebrand tool to replace generic colors with SuperSeller AI tokens
5. Polish: add brand animations (`superseller-animate-glow`, `superseller-animate-shimmer`)

**Alternative tools:**
- **AIUI.me** (aiui.me) — Screenshot to code, free
- **Emergent.sh** — Full-stack, analyzes spacing/hierarchy from screenshots
- **screenshot-to-code** (github.com/abi/screenshot-to-code) — Open source

### Workflow 3: Google Stitch (Visual Prototyping)

Best for: Exploring multiple layout ideas quickly, early-stage wireframing, Figma handoff.

**Steps:**
1. Go to stitch.withgoogle.com
2. Prompt with SuperSeller AI context:
   ```
   Design a [page type] for a SaaS platform.
   Dark purple background (#110d28). Neon cyan accents (#5ffbfd).
   Cards on #1a153f. Red CTAs (#fe3d51). Modern, tech-forward.
   ```
3. **Standard Mode**: 350 gen/month, 10-20s, Figma export available
4. **Experimental Mode**: 50 gen/month, Gemini 3, higher quality, no Figma export
5. Export HTML/CSS code (read-only editor, copy/paste)
6. Convert HTML to React: Claude Code does this in one step
7. Run rebrand tool on the converted component

**MCP Integration (optional):**
Install `@_davideast/stitch-mcp` for Claude Code integration:
- `get_screen_code` — Retrieves screen HTML
- `get_screen_image` — Screenshot as base64
- `build_site` — Maps screens to Astro routes
- Auto token refresh, Vite dev server

**Limitations:**
- No official API yet (high-priority on Google's roadmap)
- No native design system import (prompt-based branding only)
- Generic layouts, weak accessibility, multi-screen consistency unreliable beyond 2-3
- HTML/CSS output, not React — requires conversion step

### Workflow 4: URL/HTML Extraction (Clone & Rebrand)

Best for: Specific sections from live websites you want to adapt.

**Steps:**
1. Target a live page URL
2. Use Claude Code to fetch and extract the relevant HTML section
3. Convert to React/Tailwind component
4. Run rebrand tool to apply SuperSeller AI tokens
5. Remove any external dependencies, replace with local equivalents

### Workflow 5: Component Library Adaptation

Best for: Data-heavy pages, standard UI patterns, admin panels.

**Steps:**
1. Browse component libraries:
   - **shadcn/ui** (ui.shadcn.com) — Our base library
   - **Aceternity UI** (ui.aceternity.com) — Animated, modern effects
   - **Magic UI** (magicui.design) — Animated React components
2. Copy the component code
3. Run rebrand tool
4. Customize content and behavior

## SuperSeller AI Brand Token Quick Reference

See `references/brand-token-map.md` for the complete mapping table.

### Colors
| Token | Hex | Use |
|-------|-----|-----|
| `--superseller-red` | `#fe3d51` | CTAs, primary actions, alerts |
| `--superseller-orange` | `#bf5700` | Secondary actions, warnings |
| `--superseller-blue` | `#1eaef7` | Links, info, secondary accent |
| `--superseller-cyan` | `#5ffbfd` | Highlights, neon effects, emphasis |

### Backgrounds
| Token | Hex | Use |
|-------|-----|-----|
| `--superseller-bg-primary` | `#110d28` | Page background |
| `--superseller-bg-secondary` | `#1a162f` | Panels, surfaces |
| `--superseller-bg-card` | `#1a153f` | Cards |
| `--superseller-bg-surface` | `#17123a` | Elevated surfaces |

### Text
| Token | Hex | Use |
|-------|-----|-----|
| `--superseller-text-primary` | `#fffff3` | Headings, body |
| `--superseller-text-secondary` | `#b0bec5` | Descriptions |
| `--superseller-text-muted` | `#94a3b8` | Captions, hints |
| `--superseller-text-accent` | `#5ffbfd` | Highlighted text |

### Ready-Made Classes (globals.css)
- Cards: `.superseller-card`, `.superseller-card-neon`, `.superseller-card-gradient`
- Inputs: `.superseller-input` (with focus glow)
- Badges: `.superseller-badge-success`, `-warning`, `-error`, `-info`, `-neon`
- Glows: `.superseller-glow-primary`, `-secondary`, `-accent`, `-neon`
- Gradients: `.superseller-gradient-primary`, `-secondary`, `-brand`, `-neon`
- Animations: `.superseller-animate-glow`, `-pulse`, `-shimmer`, `-fadeIn`

## Tool Comparison Matrix

| Tool | Output | React? | Design System? | API? | Best For |
|------|--------|--------|---------------|------|----------|
| **v0.dev** | React+shadcn | Yes | Shadcn Registry + Tailwind config | Beta | Production components |
| **Google Stitch** | HTML/CSS/Tailwind | Partial | Prompt-based only | Not yet | Visual prototyping |
| **Emergent.sh** | React/Next.js | Yes | Built-in | Yes | Full-stack apps |
| **Bolt.new** | React/multi-fw | Yes | Limited | No | Quick full-page apps |
| **Screenshot+Claude** | React/Tailwind | Yes | Manual | N/A | Cloning existing UI |
| **Aceternity/Magic UI** | React | Yes | Via CSS vars | N/A | Animated components |

## Workflow 6: Scroll-Driven Animation Pipeline

### Stack
- **Lenis** — smooth scroll (single rAF via GSAP ticker, no separate loop)
- **GSAP ScrollTrigger** — scroll-linked animations (parallax, reveals, scrub)
- **Framer Motion** — interaction-based animations (hover, click, accordion)

### Reusable Components

| Component | Path | API |
|-----------|------|-----|
| `SmoothScrollProvider` | `components/providers/SmoothScrollProvider.tsx` | Wrap `{children}` in layout.tsx. Bridges Lenis → ScrollTrigger. Disables on `prefers-reduced-motion`. |
| `ScrollReveal` | `components/animations/ScrollReveal.tsx` | `<ScrollReveal direction="up" delay={0.1}>` — GSAP fade+slide on viewport enter |
| `TextReveal` | `components/animations/TextReveal.tsx` | `<TextReveal splitBy="words" as="h2">` — splits text into spans, staggers in |
| `ParallaxLayer` | `components/animations/ParallaxLayer.tsx` | `<ParallaxLayer speed={-0.3}>` — depth-based scroll movement |

### Hooks (`hooks/useGsapScrollTrigger.ts`)
- `useRevealOnScroll(ref, {direction, duration, delay})` — fade+slide on viewport enter
- `useParallax(ref, {speed})` — depth-based scroll movement (scrubbed)
- `useSplitTextReveal(ref, {splitBy, stagger})` — split text into spans, animate sequentially

### Brand Token Customization

| Setting | SuperSeller | Rensto | Customer Sites |
|---------|-------------|--------|---------------|
| Easing | `power3.out` | `power2.out` | Per brand |
| Lenis lerp (desktop) | 0.1 | 0.1 | 0.08–0.12 |
| Lenis lerp (mobile) | 0.06 | 0.1 | 0.06–0.1 |
| Reveal distance | 40px | 40px | 30–50px |
| Stagger | 0.04s | 0.04s | 0.03–0.06s |

### Header Scroll Behavior
Both sites implement:
- **Hide on scroll down** (after 100px threshold)
- **Show on scroll up**
- **Background solidifies** after 100px scroll (transparent → opaque)
- Uses native `scroll` event listener (passive) — independent of GSAP/Lenis

### Integration Rules
1. **Lenis + FM `useScroll`**: If FM video scrub breaks, add `data-lenis-prevent` on container
2. **SSR safety**: All gsap/lenis imports via `await import()` inside `useEffect` — no webpack alias needed for Turbopack
3. **Keep FM for interactions**: Accordion, hover, modals stay with Framer Motion. Only scroll-triggered effects use GSAP.
4. **`prefers-reduced-motion`**: All scroll animations disabled when set

### For Customer Sites (`/lp/[slug]`)
Copy animation components into the customer page. Zero marginal cost (pure code, no API calls). Apply brand tokens from customer config.

## References

| File | Purpose |
|------|---------|
| `references/brand-token-map.md` | Complete Tailwind → SuperSeller AI token mapping |
| `globals.css` | Authoritative brand tokens, animations, components |
| `ui-ux-pro-max/SKILL.md` | Design intelligence (styles, palettes, fonts) |
| `tailwind.config.ts` | Tailwind theme extensions |
