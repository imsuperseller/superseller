# Rensto.com — Design System Reference (Notebook LM)

**Single source for rensto.com design, fonts, layouts, and graphical specs.**  
Use this document in Notebook LM or any LLM context for consistent brand and UI decisions.  
Aligned with **2025–26 UX**, **accessibility (WCAG 2.1/2.2 AA)**, and **"spotlight" dark‑mode** practices for SaaS landings.

***

## 1. Brand colors (authoritative)

All values match the Webflow Brand System and are defined in `src/app/globals.css`.

### Primary palette (hex)

| Name | Hex | Usage |
|------|-----|--------|
| **Primary Red** | `#fe3d51` | Primary CTA, logo glow, accents, highlights |
| **Secondary Orange** | `#bf5700` | Secondary accents, gradients |

| **Accent Blue** | `#1eaef7` | Links, secondary CTAs, glows |
| **Accent Cyan / Neon** | `#5ffbfd` | Highlights, badges, neon effects |
| **Dark background** | `#110d28` | App/site background (primary) |

### Background colors

| Name | Hex | Usage |
|------|-----|--------|
| **Primary BG** | `#110d28` | Main page background |
| **Secondary BG** | `#1a162f` | Panels, surfaces |
| **Card BG** | `#1a153f` | Cards |
| **Surface** | `#17123a` | Elevated surfaces |
| **Alternate gradient base** | `#0f0c29` | Some pages (with gradient to `#1a1438`) |

### Text colors

| Name | Hex | Usage |
|------|-----|--------|
| **Primary text** | `#fffff3` | Body, headings |
| **Secondary text** | `#b0bec5` | Supporting copy (short) |
| **Muted text** | `#94a3b8` | Captions, hints |
| **Accent text** | `#5ffbfd` | Links, highlights |

### CSS variables (use in code)

- **Brand:** `--rensto-primary`, `--rensto-red`, `--rensto-secondary`, `--rensto-orange`, `--rensto-accent-blue`, `--rensto-blue`, `--rensto-accent-cyan`, `--rensto-cyan`, `--rensto-neon`, `--rensto-glow`
- **Backgrounds:** `--rensto-bg-primary`, `--rensto-bg-secondary`, `--rensto-bg-card`, `--rensto-bg-surface`
- **Text:** `--rensto-text-primary`, `--rensto-text-secondary`, `--rensto-text-muted`, `--rensto-text-accent`
- **Gradients:** `--rensto-gradient-primary`, `--rensto-gradient-secondary`, `--rensto-gradient-brand`, `--rensto-gradient-neon`
- **Glows:** `--rensto-glow-primary`, `--rensto-glow-secondary`, `--rensto-glow-accent`, `--rensto-glow-neon`

### Gradients (CSS)

- **Primary:** `linear-gradient(135deg, #fe3d51 0%, #bf5700 100%)`
- **Secondary (blue/cyan):** `linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)`
- **Brand (full):** `linear-gradient(135deg, #fe3d51 0%, #bf5700 50%, #1eaef7 100%)`
- **Neon:** `linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)`
- **Page background gradient:**  
  `radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)` or  
  `radial-gradient(circle at top center, #1a1438 0%, #110d28 100%)`

### Glow effects (box‑shadow)

- **Primary:** `0 0 20px rgba(254, 61, 81, 0.45)`
- **Secondary (blue):** `0 0 20px rgba(30, 174, 247, 0.45)`
- **Accent (cyan):** `0 0 20px rgba(95, 251, 253, 0.45)`
- **Neon:** `0 0 30px rgba(95, 251, 253, 0.7)`

### Contrast and restraint (2025–26)

- Use accent blue/cyan **sparingly** to create a visual path (links, CTAs, key metrics), not as background floods.  
- On dark backgrounds, never use mid‑grey on dark grey; body text must be near‑white for readability.  
- All body text and essential UI must meet **WCAG 2.1/2.2 AA**:  
  - Normal text ≥ 4.5:1 contrast  
  - Large text / UI ≥ 3:1 contrast  

**Do not**

- Don't place `#b0bec5` / `#94a3b8` directly on `#110d28` for long paragraphs; reserve them for short labels and meta text only.

***

## 2. Typography

### Font family

- **Primary font:** Outfit (Google Font), variable `--font-outfit`, fallback `sans-serif`.  
- **Loading:** Next.js `next/font/google` with `Outfit`, subsets `['latin']`, weights `['400','500','600','700']`, `display: 'swap'`.  
- **Body:** `fontFamily: 'var(--font-outfit), sans-serif'` on `<body>`.

### Scale and usage

| Element | Tailwind / class | Notes |
|--------|-------------------|--------|
| Hero / H1 | `text-5xl md:text-7xl font-bold` (optional `uppercase italic` accent) | Primary large headline |
| H2 | `text-4xl md:text-5xl` | Section titles |
| H3 | `text-2xl`–`text-3xl` | Subsections |
| Subheadline | `text-xl text-slate-400` | Below hero |
| Body | `text-base md:text-lg text-slate-200`–`text-slate-300` | Default copy |
| Small / labels | `text-[10px] font-black uppercase tracking-[0.3em]` | Badges, labels |
| Accent text | `text-cyan-400` / `text-[#fe3d51]` / `text-[#5ffbfd]` | Highlights |

### Weights and style

- Bold headlines: `font-bold`, `font-black`.  
- Uppercase + italic only when it directly supports the message (hero punchline, key promise).  
- Letter‑spacing: `tracking-tighter`, `tracking-widest`, `tracking-[0.3em]` for labels.

### 2025–26 SaaS / dark‑mode guidance

- Use **one** primary H1 style across marketing pages to keep brand consistent and avoid visual noise.  
- Avoid long blocks of body copy below 16px on dark backgrounds; default body size **16–18px**.  
- Link style must not rely on color alone; support with underline and/or weight change.

***

## 3. Layout and spacing

### Page shell

- Background: `bg-[#0f0c29]` or `bg-[#110d28]` with radial gradient.  
- Min height: `min-h-screen` for full pages.  
- Overflow: `overflow-x-clip` on html/body; `overflow-hidden` on sections when needed.

### Sections

- Vertical spacing: `py-24 px-4` or `py-16 px-4`.  
- Containers: `container mx-auto max-w-4xl`, `max-w-5xl`, `max-w-6xl` (hero/header up to `max-w-7xl`).  
- Grid gaps: `gap-8`, `gap-12`.

### Grids

- Cards: `grid md:grid-cols-3 gap-8` (or `gap-6`), `md:grid-cols-4` for smaller cards.

### Spotlight dark‑mode (2025–26)

- Treat the dark background as a **stage**, not the star: every section must have a clear focal zone (hero copy + CTA, or a card cluster) with brighter panels or soft glows creating a spotlight effect.  
- Above the fold, user must understand in 5 seconds: **who it's for**, **what they get**, **what to do next** (single primary CTA).  
- Critical forms or CTAs should use **high‑contrast panels** (e.g., light-ish card on dark background) so they pop.

***

## 4. Background and atmosphere

### Standard page stack

1. Base: `bg-[#0f0c29]` or `#110d28` with radial gradient (`#1a1438` at top).  
2. `AnimatedGridBackground` on marketing pages (grid lines, particles, orbs, scan line).  
3. `NoiseTexture` overlay, opacity `0.03`, `mix-blend-overlay`, full viewport.

### AnimatedGridBackground (concept)

- Radial gradient at top: `rgba(30, 174, 247, 0.15)` fading to transparent.  
- Grid: 60px cells, `rgba(30, 174, 247, 0.3)` lines, `gridMove` 20s.  
- Particles: 2–5px dots, brand colors (cyan, blue, primary), `particleFloat`.  
- Orbs: 300–500px blurred circles with `orbPulse`, using `--rensto-blue`, `--rensto-cyan`, `--rensto-primary`.  
- Scan line: horizontal gradient line, `scanLine` animation.

### NoiseTexture

- SVG `feTurbulence` fractal noise, `baseFrequency="0.65"`, `numOctaves="3"`.  
- Fixed overlay, `z-[100]`, `pointer-events-none`, opacity ~`0.03`.

### 2025–26 guidance: subtle texture

- Limit animated background elements per page (e.g., 1–2 orbs, low‑motion grid) to reduce distraction and motion sickness.  
- Avoid backgrounds that lower legibility of hero copy; if in doubt, darken or blur behind text and CTAs.  
- Respect `prefers-reduced-motion` to disable or slow non‑essential animations.

***

## 5. Components

### Cards

- Standard: `bg-white/[0.03] border border-white/5 rounded-[2rem]` (or `rounded-[3rem]`).  
- Hover: `hover:bg-white/[0.05] transition-all duration-500`.  
- Accent border: `hover:border-cyan-500/30` or `hover:border-[#fe3d51]/30`.  
- Alternative classes: `.rensto-card`, `.rensto-card-neon`, `.rensto-card-gradient` (see `globals.css`).  
- 2025–26: Use **1–2 card variants max**; keep padding, radius, and hover behavior consistent. On hover, use subtle scale/brightness, not large shifts.

### Buttons

- Primary: `bg-[#fe3d51]` or `bg-gradient-to-r from-rensto-red to-rensto-orange`, `text-white`, `font-bold`/`font-black`, `rounded-xl` or `rounded-2xl`, glow shadow like `shadow-[0_0_20px_rgba(254,61,81,0.2)]`, hover `hover:bg-[#ff4d61]` or `hover:brightness-110`.  
- Secondary (blue/cyan): `bg-gradient-to-r from-[#1eaef7] to-[#5ffbfd]` or `from-rensto-blue to-rensto-cyan`, `text-white`.  
- Variants: `renstoPrimary`, `renstoSecondary`, `renstoNeon`, `renstoGhost`; sizes `default`, `sm`, `lg`, `xl` (e.g., `h-[56px]`, `rounded-xl`, `text-lg`).  
- 2025–26: One primary CTA per main section, visually dominant; avoid multiple strong styles in one viewport. Maintain ≥3:1 contrast for button label vs background, and always show a visible focus state (outline or glow).

### Badges

- Cyan: `bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`.  
- Primary: `bg-[#fe3d51]/10 text-[#fe3d51] border-[#fe3d51]/20`, with `px-6 py-2` or `py-3`, `uppercase tracking-widest text-[10px] font-black rounded-full`.

### Inputs and forms

- `.rensto-input`: bg `--rensto-bg-secondary`, border `--rensto-bg-primary`, focus border/glow `--rensto-cyan`.  
- Focus ring: `focus:border-[#5ffbfd]` or `focus:border-rensto-cyan`.  
- 2025–26: Use labels outside inputs (not just placeholders). Errors must have strong contrast and text messages, not color only.

### Glass and blur

- Header: `backdrop-blur-2xl`, `background: rgba(10,10,10,0.65)`, `border-color: rgba(255,255,255,0.05)`.  
- Cards/panels: `backdrop-blur-xl` or `backdrop-blur-2xl` where it helps focus.

***

## 6. Animations

### Keyframes (globals.css)

- `rensto-glow`, `rensto-pulse`, `rensto-shimmer`, `rensto-fadeIn`, `gridMove`, `particleFloat`, `orbPulse`, `scanLine`.

### Tailwind animation classes

- `animate-rensto-glow`, `animate-rensto-pulse`, `animate-rensto-shimmer`, `animate-rensto-fadeIn`.  
- Utility: `.rensto-animate-glow`, `.rensto-animate-pulse`, `.rensto-animate-shimmer`, `.rensto-animate-fadeIn`.

### Framer Motion (entrance)

- Typical: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` with stagger.

### 2025–26: purposeful motion

- Use motion for state changes (hover, active, success), lightweight entrance on first load, and product/screen demos.  
- Keep micro‑interaction durations between 150–300ms.  
- Honor `prefers-reduced-motion`: disable looping background animations and replace big moves with opacity fades.

***

## 7. Logo and assets

### Logo

- Primary: `/rensto-logo.webp` (also `.avif`).  
- Header: 40×40, `object-contain`, with glow filter or flat variant as needed.  
- Wordmark: "Rensto", `text-2xl font-bold`, color `#ffffff`.  
- 2025–26: Ensure logo/wordmark meet contrast; use a flat or mono version on busy or very dark backgrounds.

### Favicon and app

- Favicon: `/favicon.ico`, `/favicon-16x16.webp`, `/favicon-32x32.webp` (and `.avif`).  
- Apple: `/rensto-logo.png`.  
- OG image: `/opengraph-image.png` (1200×630).

### Theme color (viewport)

- Meta `theme-color`: `#110d28` (light and dark).  
- Color scheme: `dark`.

***

## 8. Header and navigation

- Bar: sticky, `z-50`, `backdrop-blur-2xl`, dark semi‑transparent, `border border-white/5`.  
- Height: `h-16`.  
- Nav links: `text-sm font-medium text-white/70 hover:text-white`.  
- Phone CTA: `bg-cyan-500/10 border border-cyan-500/30 text-rensto-cyan rounded-lg`.  
- Mobile menu: `border-t border-white/10 bg-[#110d28]`.  
- 2025–26: Limit nav to **4–6 items plus one primary CTA** ("Get started", "See pricing"). Avoid deep dropdowns; group under "Products" / "Solutions" if needed. All links/icons need clear hover and focus states.

***

## 9. Footer

- Same dark background system; links per Footer component.  
- Social and legal links with `text-slate-400` / white and accents.  
- 2025–26: Include **accessibility**, **privacy**, and **cookie / tracking preferences** links. On mobile, use stacked columns; avoid dense multi‑column micro‑text.

***

## 10. Tailwind theme extension (summary)

- Colors: `rensto.red`, `rensto.orange`, `rensto.blue`, `rensto.cyan`, `rensto.neon`, `rensto.glow`, `rensto.bg-primary`, `rensto.bg-secondary`, `rensto.bg-card`, `rensto.bg-surface`, `rensto.text-primary`, `rensto.text-secondary`, `rensto.text-muted`, `rensto.text-accent`.  
- Border radius: default `1rem`, plus `lg` / `md` / `sm` from `--radius`.  
- Box shadow: `rensto-glow-primary`, `rensto-glow-secondary`, `rensto-glow-accent`, `rensto-glow-neon`, plus `glass`, `glow`.  
- Animations: `rensto-glow`, `rensto-pulse`, `rensto-shimmer`, `rensto-fadeIn`, `logo-glow`, `fade-up`.

***

## 11. Page design checklist (per page)

- Above the fold: in 5 seconds, user can answer: who this is for (busy service business owners), what Rensto does (AI office crew), what to do next (single primary CTA).  
- Contrast: all text and interactive elements meet WCAG 2.1/2.2 AA (4.5:1 body, 3:1 large text/UI).  
- Spotlight: use dark background as a stage; create bright "spotlight" zones behind copy and CTAs.  
- Accent restraint: per view, stick to primary red + **one** cool accent.  
- Accessibility: keyboard‑navigable buttons/links; visible focus states; meaningful alt text on illustrative images and gifs.  
- Motion: respect `prefers-reduced-motion`; avoid excessive looping animations; clarity beats "wow."  
- Use the background, grid, noise, hero, cards, buttons, badges, sections, and trust elements as defined above.

***

## 12. Quick reference (copy‑paste)

- Colors: `#fe3d51` (primary), `#bf5700` (orange), `#1eaef7` (blue), `#5ffbfd` (cyan), `#110d28` (dark).  
- Font: Outfit (400, 500, 600, 700).  
- Background: dark `#110d28` / `#0f0c29`, gradient to `#1a1438`.  
- Cards: `bg-white/[0.03] border border-white/5 rounded-[2rem]`.  
- Primary button: `bg-[#fe3d51] hover:bg-[#ff4d61]` with glow shadow.  
- Badge: `bg-[#fe3d51]/10 text-[#fe3d51] border-[#fe3d51]/20` or cyan equivalent.  
- Logo: `/rensto-logo.webp`, red+blue drop‑shadow or flat variant.

***

## 13. Layout patterns for busy service owners

Tie every page back to the core avatar: a busy service business owner (locksmith, HVAC, pool pro, investor) who is usually on a job, on mobile, and impatient.

### 13.1 Above-the-fold layout (Home)

**Do:**
- Use a single, blunt headline that speaks to lost money/time (e.g., "Every missed call is a job you just gave away.").  
- Show one primary CTA ("Get started with tokens") and one secondary ("Watch 60‑second overview").  
- Keep hero copy to 2–3 short lines, plus 3 bullets max, all easily readable on mobile.  
- Use a clear visual split: left = real‑world work scene, right = simple Rensto UI (no dense dashboards).

**Don't:**
- Don't open with abstract AI language ("agentic workflows", "LLM pipelines") or generic SaaS jargon.  
- Don't show more than two competing CTAs above the fold (no "Start", "Contact", "See pricing" all at once).  
- Don't bury the "who it's for" – always mention service trades in the first viewport.

***

### 13.2 Section ordering on rensto.com

**Recommended order for the Home page:**

1. Hero: pain + promise + CTA.  
2. "You can't grow a business from under a sink" – avatar-specific pain grid.  
3. "Meet your AI crew" – three core products (Hot Leads, Video Tours, Social Agent).  
4. "How it works" – 3–4 steps with simple icons.  
5. "Results from real service businesses" – short, outcome-first stories.  
6. Final CTA strip – repeat core promise and a single main action.

Always design sections so they can be skimmed in under 10 seconds each: strong heading, 3–5 bullets, one clear action.

***

### 13.3 Product cards tuned to trades

**Do:**
- Write card headings as outcomes, not feature names (e.g., "Hot leads, caught while you're on the job", not "Lead automation module").  
- Use examples that sound like real jobs: "emergency lockout", "no‑cool call", "weekly pool service route", "new listing video".  
- Keep per-card text to: 1 title, 1 sentence, 3 bullets, 1 CTA.

**Don't:**
- Don't show more than three primary products in a single row.  
- Don't stack long paragraphs inside cards; anything over 4–5 lines belongs on a detail page.

***

### 13.4 Mobile-first constraints

**Do:**
- Assume first contact is on a phone between jobs – design everything to work in one-thumb scroll.  
- Make CTAs tall, with full-width buttons on mobile and large tap targets.  
- Put the most important info in the first 2–3 lines of each section; avoid long intros.

**Don't:**
- Don't rely on hover-only affordances; busy owners may never notice subtle effects.  
- Don't hide critical copy in accordions for primary flows (pricing, how it works, guarantees).

***

### 13.5 "Time and brainspace tax" rules

Every extra decision costs attention the avatar doesn't have.

**Do:**
- Prefer "yes/no" decisions (approve / reject, choose plan) over complex option matrices.  
- Use consistent patterns for actions: same button color/label for "start", same position for "See plans".

**Don't:**
- Don't introduce new layouts or visual patterns on every page – reuse the same hero + spotlight + card layouts.  
- Don't make users read long comparisons; instead, highlight the "Recommended for 2–5 trucks/doors" plan and keep the rest secondary.

***

*Section 13 bridges design tokens → actual Rensto layout decisions for the core avatar.*
