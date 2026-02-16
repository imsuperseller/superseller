# Rensto Design System — Master File (SSOT)

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.
>
> **IMPORTANT:** This file overrides any auto-generated suggestions from the UI/UX Pro Max skill.
> The skill's search results are useful for patterns, layouts, and UX guidelines — but NEVER
> for colors, fonts, or theme direction. Rensto's brand is established and non-negotiable.

---

**Project:** Rensto
**Updated:** 2026-02-16
**Category:** SaaS for Service Businesses (HVAC, Plumbing, Locksmiths, Realtors)
**Theme:** Dark-first, Glassmorphism + Neon accents
**Avatar:** Busy service business owner — mobile-first, impatient, wants results fast

---

## Brand Colors (Non-Negotiable)

| Role | Hex | CSS Variable | Tailwind Class |
|------|-----|--------------|----------------|
| Primary Red | `#fe3d51` | `--rensto-red` | `rensto-red` |
| Secondary Orange | `#bf5700` | `--rensto-orange` | `rensto-orange` |
| Accent Blue | `#1eaef7` | `--rensto-blue` | `rensto-blue` |
| Neon Cyan | `#5ffbfd` | `--rensto-cyan` / `--rensto-neon` | `rensto-cyan` / `rensto-neon` |
| Background Primary | `#110d28` | `--rensto-bg-primary` | `rensto-bg-primary` |
| Background Secondary | `#1a162f` | `--rensto-bg-secondary` | `rensto-bg-secondary` |
| Background Card | `#1a153f` | `--rensto-bg-card` | `rensto-bg-card` |
| Background Surface | `#17123a` | `--rensto-bg-surface` | `rensto-bg-surface` |
| Text Primary | `#fffff3` | `--rensto-text-primary` | `rensto-text-primary` |
| Text Secondary | `#b0bec5` | `--rensto-text-secondary` | `rensto-text-secondary` |
| Text Muted | `#94a3b8` | `--rensto-text-muted` | `rensto-text-muted` |
| Text Accent | `#5ffbfd` | `--rensto-text-accent` | `rensto-text-accent` |

**Usage rules:**
- `#fe3d51` for primary CTAs, destructive actions, brand emphasis
- `#1eaef7` / `#5ffbfd` for info, links, success states, data highlights
- `#bf5700` for secondary emphasis, warnings
- Never use light backgrounds for main pages. Dark-first always.

---

## Typography

| Role | Font | Weight | Tailwind |
|------|------|--------|----------|
| **Heading** | Outfit | 900 (Black) | `font-black` |
| **Body** | System default (Inter via Next.js) | 400-600 | `font-medium` |
| **Monospace** | JetBrains Mono | 400 | `font-mono` |

**Style rules:**
- Headers: `tracking-tight` or `tracking-tighter`, `uppercase` for impact
- Small labels: `text-[10px] font-black uppercase tracking-[0.2em]`
- Hebrew labels: `dir="rtl"` with `text-sm font-bold`

---

## Component Patterns

All UI components follow the `*-enhanced` design system in `apps/web/rensto-site/src/components/ui/`.

### Cards
```css
/* Glassmorphism card */
bg-white/[0.02] border-white/5 rounded-[2.5rem] backdrop-blur-xl
hover:border-cyan-500/30 transition-all duration-500
```

### Buttons
```css
/* Primary (renstoPrimary variant) */
bg-[#fe3d51] hover:bg-[#fe3d51]/90 text-white font-black uppercase tracking-[0.2em]
rounded-[2rem] h-20

/* Secondary */
bg-white/5 border-white/5 hover:bg-white/10
```

### Inputs
```css
bg-white/5 border-white/5 h-16 rounded-2xl text-white font-medium
focus:border-cyan-500/50 transition-all text-lg px-6
```

### Badges
```css
/* Success */ bg-green-500/10 text-green-400
/* Error */ bg-red-500/10 text-red-500
/* Info */ bg-cyan-500/10 text-cyan-400
/* Neon */ bg-[#5ffbfd]/10 text-[#5ffbfd]
```

---

## Layout

- **Page background:** `bg-[#0a0a0a]` or `bg-[#110d28]`
- **Container:** `container mx-auto px-6`
- **Sections:** `py-20` spacing between major sections
- **Rounded corners:** `rounded-2xl` to `rounded-[3rem]` (aggressive rounding)
- **Grid:** `grid grid-cols-1 lg:grid-cols-3 gap-12`

---

## Animations

| Animation | Usage | Implementation |
|-----------|-------|---------------|
| `rensto-glow` | Card/button hover glow | `shadow-[0_0_100px_rgba(6,182,212,0.1)]` |
| `rensto-pulse` | Loading, attention | CSS `@keyframes rensto-pulse` |
| `rensto-shimmer` | Skeleton loading | Gradient sweep animation |
| `rensto-fadeIn` | Page enter | Opacity + translateY |
| Grid background | Hero sections | `AnimatedGridBackground` component |

**Rules:**
- Duration: 150-300ms for micro-interactions
- Use `transform` and `opacity` only (GPU-accelerated)
- Respect `prefers-reduced-motion`

---

## Anti-Patterns (NEVER Do)

- Light mode as default (Rensto is dark-first)
- Generic SaaS blue palettes (#2563EB, #3B82F6)
- Poppins, Open Sans, or other generic SaaS fonts
- Emojis as icons (use Lucide React)
- Missing `cursor-pointer` on clickable elements
- Low contrast text (maintain 4.5:1 minimum)
- Layout-shifting hover effects
- Scale transforms that reflow content

---

## Pre-Delivery Checklist

- [ ] Uses Rensto brand colors (not generic blue SaaS)
- [ ] Dark background (#110d28 or #0a0a0a)
- [ ] No emojis as icons (Lucide React only)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Hebrew text uses `dir="rtl"`

---

## Source Files

| File | Purpose |
|------|---------|
| `apps/web/rensto-site/src/app/globals.css` | CSS variables (live implementation) |
| `apps/web/rensto-site/tailwind.config.ts` | Tailwind theme extensions |
| `docs/technical/design/SYSTEM.md` | Component patterns reference |
| `infra/archive/.../RENSTO_DESIGN_SYSTEM_REFERENCE.md` | Full spec (archived) |
| NotebookLM 286f3e4a | Design system canonical source |
| `.cursor/rules.md` lines 43-47 | Brand color mandate |
