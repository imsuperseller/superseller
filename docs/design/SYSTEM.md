# 🎨 Design System

> **Source of Truth for Rensto's visual identity and component patterns.**

---

## Brand Aesthetics
- **Theme**: "Neon/Dark" – Deep blues/purples with high-contrast cyan and red accents.
- **Primary Colors**: `#06b6d4` (Cyan), `#fe3d51` (Rensto Red), `#0f0c29` (Background).
- **Typography**: `tracking-tight` / `tracking-tighter` for headers, `font-black` weight.

---

## Component Patterns
All UI components follow the `*-enhanced` design system (e.g., `button-enhanced.tsx`, `card-enhanced.tsx`).

### Key Principles
1.  **Glassmorphism**: `backdrop-blur-xl`, `bg-white/[0.02]` for subtle transparency.
2.  **Micro-Animations**: `transition-all`, `hover:scale-[1.02]` for interactivity.
3.  **Rounded Corners**: `rounded-2xl` to `rounded-[3rem]` for soft, premium feel.
4.  **Glow Effects**: `shadow-[0_0_100px_rgba(6,182,212,0.1)]` for emphasis.

---

## RTL Support
- Set `dir="rtl"` on parent containers for Hebrew (`lang === 'he'`).
- Ensure all flexbox/grid layouts respect direction (`isRtl ? 'ml-3' : 'mr-3'`).

---

## Key Files
- [button-enhanced.tsx](file:///Users/shaifriedman/New%20Rensto/rensto/apps/web/rensto-site/src/components/ui/button-enhanced.tsx)
- [card-enhanced.tsx](file:///Users/shaifriedman/New%20Rensto/rensto/apps/web/rensto-site/src/components/ui/card-enhanced.tsx)
