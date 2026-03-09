# Design Standards — Enforceable Rules

**Authority**: This file is the SINGLE SOURCE OF TRUTH for all UI/design decisions. Every page, component, and feature MUST comply. No exceptions.

**Quality gate**: Every page must score 7+/10 before deployment. If it looks generic, it's wrong.

---

## 1. Color System (NEVER use raw hex in inline styles)

Use Tailwind classes with CSS variables. Never hardcode colors.

| Purpose | Tailwind Class | CSS Variable | Hex |
|---------|---------------|-------------|-----|
| **Background primary** | `bg-superseller-bg-primary` | `--superseller-bg-primary` | `#0d1b2e` |
| **Background secondary** | `bg-superseller-bg-secondary` | `--superseller-bg-secondary` | `#152236` |
| **Background card** | `bg-superseller-bg-card` | `--superseller-bg-card` | `#1a153f` |
| **Background surface** | `bg-superseller-bg-surface` | `--superseller-bg-surface` | `#132038` |
| **Text primary** | `text-superseller-text-primary` | `--superseller-text-primary` | `#fffff3` |
| **Text secondary** | `text-superseller-text-secondary` | `--superseller-text-secondary` | `#b0bec5` |
| **Text muted** | `text-superseller-text-muted` | `--superseller-text-muted` | `#94a3b8` |
| **Text accent** | `text-superseller-text-accent` | `--superseller-text-accent` | `#5ffbfd` |
| **Orange (CTA/energy)** | `text-superseller-orange` / `bg-superseller-orange` | `--superseller-orange` | `#f47920` |
| **Teal (trust)** | `text-superseller-cyan` | `--superseller-cyan` | `#4ecdc4` |
| **Blue (info)** | `text-superseller-blue` | `--superseller-blue` | `#2494e0` |
| **Neon cyan (AI glow)** | `text-superseller-neon` | `--superseller-neon` | `#5ffbfd` |

**When inline `style={{}}` is unavoidable** (dynamic values, gradients): Use `var(--superseller-*)` CSS variables, NOT hex codes.

---

## 2. Typography

- **Font**: Outfit (loaded in root layout, variable `--font-outfit`)
- **Never import another font** for SuperSeller pages (customer landing pages `/lp/` excluded — they use per-customer fonts)
- **Heading scale**: Hero 3-4rem, H1 2.5rem, H2 1.875rem, H3 1.5rem, Body 1rem, Small 0.875rem, Tiny 0.75rem
- **Font weights**: 400 (body), 500 (labels), 600 (subheadings), 700 (headings), 800-900 (hero)
- **Line height**: 1.6 body, 1.2 headlines
- **Letter spacing**: `-0.02em` on large headlines, `0.05em` on uppercase labels

---

## 3. Component Patterns (Use these, not custom)

### Cards
```
className="superseller-card"          // Standard glassmorphic card
className="superseller-card-neon"     // Card with neon border glow
className="superseller-card-gradient" // Card with gradient border
```

### Buttons
```
className="superseller-btn-3d-primary" // Orange gradient, primary CTA
className="superseller-btn-3d-neon"    // Cyan outline, secondary
className="superseller-btn-3d-glass"   // Subtle glass, tertiary
className="superseller-btn-3d-accent"  // Blue, informational
```

### Badges
```
className="superseller-badge-success"  // Teal
className="superseller-badge-warning"  // Orange
className="superseller-badge-error"    // Red
className="superseller-badge-info"     // Blue
className="superseller-badge-neon"     // Cyan glow
```

### Inputs
```
className="superseller-input"          // Glass input with cyan focus glow
```

---

## 4. Glassmorphism Rules

- **Background**: `rgba(22, 37, 64, 0.6)` minimum — NEVER fully opaque cards on dark backgrounds
- **Backdrop blur**: `backdrop-blur-xl` (20px) for prominent cards, `backdrop-blur-md` (12px) for secondary
- **Border**: `border border-white/10` default, colored borders for states
- **Inner glow**: Use `ring-1 ring-inset ring-white/5` for subtle depth
- **Never**: Flat white/gray cards, opaque backgrounds, hard borders without glow

---

## 5. Spacing & Layout

- **Max content width**: `max-w-4xl` for reading content, `max-w-6xl` for dashboards, `max-w-3xl` for focused tools
- **Card gap**: `gap-5` (20px) standard, `gap-3` (12px) compact
- **Section padding**: `py-16` desktop, `py-10` mobile
- **Card padding**: `p-6` standard, `p-5` compact, `p-8` featured

---

## 6. Animation Standards

- **Page entrance**: Staggered fade-up (use `ScrollReveal` or `TextReveal` components)
- **Hover**: `transition-all duration-300`, scale max `1.02`, never `1.05`+
- **Active**: `active:scale-[0.98]`
- **Glow pulse**: `animate-superseller-glow` for featured elements
- **Loading**: Custom spinner with brand colors, never browser default
- **Timing**: `ease-[0.25, 0.1, 0.25, 1]` (custom cubic bezier) for reveals

---

## 7. Dark Mode (Always)

- Dark mode is the ONLY mode. Light mode is not supported.
- Every page must have `bg-superseller-bg-primary` or the gradient equivalent
- No white backgrounds, no light cards, no light text on light backgrounds
- Gradients: `bg-gradient-to-b from-[var(--superseller-bg-primary)] to-[var(--superseller-bg-surface)]`

---

## 8. RTL Support (Hebrew pages)

- Wrap in `<div dir="rtl">`
- Use `gap-*` not `ml-*`/`mr-*`
- Test badge positions with `right-*` / `left-*` for RTL
- Reference: `src/styles/hebrew-rtl.css`

---

## 9. Quality Checklist (MANDATORY before deploy)

- [ ] Uses brand CSS variables/Tailwind classes, NOT hardcoded hex
- [ ] Dark mode only — no light backgrounds
- [ ] Glassmorphism on all cards (blur + transparency + border)
- [ ] Outfit font applied (inherits from root layout)
- [ ] Animations on scroll reveal
- [ ] Responsive: tested at 375px, 768px, 1280px
- [ ] Text contrast: primary text on dark ≥ 4.5:1
- [ ] No generic/flat design — every element has depth
- [ ] SVG icons (no emoji), consistent stroke width (2px)
- [ ] Loading states with brand spinner, not browser default
- [ ] Hover/focus states on all interactive elements

---

## 10. Anti-Patterns (NEVER)

- Hardcoded hex colors in `style={{}}` when a Tailwind class exists
- Flat colored backgrounds without gradients or transparency
- Default browser form elements without styling
- Text smaller than 11px on mobile
- More than 3 font weights on a single page
- Generic gray (#333, #666, #999) — always use brand grays
- Box shadows without color tint (use brand glow shadows)
- White/light cards on dark backgrounds (use glass)

---

*This document is referenced by: ui-ux-pro-max SKILL, ui-design-workflow SKILL, lead-pages SKILL, brand-identity.md memory file.*
*Last updated: March 9, 2026*
