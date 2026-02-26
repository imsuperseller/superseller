# SuperSeller AI Brand Token Map

Complete mapping from generic Tailwind/shadcn/CSS values to SuperSeller AI brand tokens.
Use this when rebranding externally generated components.

Source of truth: `apps/web/superseller-site/src/app/globals.css`

## Color Replacements

### Background Colors
| Generic (replace this) | SuperSeller AI Token | CSS Variable | Hex |
|------------------------|-------------|--------------|-----|
| `bg-gray-900`, `bg-slate-900`, `bg-zinc-900`, `bg-neutral-900`, `#111827`, `#0f172a`, `#18181b` | `bg-[var(--superseller-bg-primary)]` | `--superseller-bg-primary` | `#110d28` |
| `bg-gray-800`, `bg-slate-800`, `bg-zinc-800`, `#1f2937`, `#1e293b`, `#27272a` | `bg-[var(--superseller-bg-secondary)]` | `--superseller-bg-secondary` | `#1a162f` |
| `bg-gray-800/50`, `bg-slate-800/80`, `bg-zinc-800/50`, dark card backgrounds | `bg-[var(--superseller-bg-card)]` | `--superseller-bg-card` | `#1a153f` |
| `bg-gray-850`, `bg-slate-850`, elevated surfaces | `bg-[var(--superseller-bg-surface)]` | `--superseller-bg-surface` | `#17123a` |

### Accent Colors
| Generic (replace this) | SuperSeller AI Token | CSS Variable | Hex |
|------------------------|-------------|--------------|-----|
| `bg-red-500`, `bg-rose-500`, `text-red-500`, `#ef4444`, `#f43f5e` | Use `--superseller-red` | `--superseller-red` | `#fe3d51` |
| `bg-orange-600`, `bg-amber-600`, `text-orange-600`, `#ea580c`, `#d97706` | Use `--superseller-orange` | `--superseller-orange` | `#bf5700` |
| `bg-blue-500`, `bg-sky-500`, `text-blue-500`, `#3b82f6`, `#0ea5e9` | Use `--superseller-blue` | `--superseller-blue` | `#1eaef7` |
| `bg-cyan-400`, `bg-teal-400`, `text-cyan-400`, `#22d3ee`, `#2dd4bf` | Use `--superseller-cyan` | `--superseller-cyan` | `#5ffbfd` |

### Text Colors
| Generic (replace this) | SuperSeller AI Token | CSS Variable | Hex |
|------------------------|-------------|--------------|-----|
| `text-white`, `text-gray-50`, `text-slate-50`, `#ffffff`, `#f8fafc` | `text-[var(--superseller-text-primary)]` | `--superseller-text-primary` | `#fffff3` |
| `text-gray-300`, `text-slate-300`, `text-zinc-300`, `#d1d5db`, `#cbd5e1` | `text-[var(--superseller-text-secondary)]` | `--superseller-text-secondary` | `#b0bec5` |
| `text-gray-400`, `text-slate-400`, `text-zinc-400`, `#9ca3af`, `#94a3b8` | `text-[var(--superseller-text-muted)]` | `--superseller-text-muted` | `#94a3b8` |
| Highlighted/accent text in cyan/teal/emerald | `text-[var(--superseller-text-accent)]` | `--superseller-text-accent` | `#5ffbfd` |

### Border Colors
| Generic (replace this) | SuperSeller AI Token | Hex |
|------------------------|-------------|-----|
| `border-gray-700`, `border-slate-700`, `border-zinc-700` | `border-[var(--superseller-bg-secondary)]` | `#1a162f` |
| `border-gray-600`, `border-slate-600` | `border-[var(--superseller-bg-secondary)]` | `#1a162f` |
| `border-cyan-500`, `border-teal-500`, accent borders | `border-[var(--superseller-cyan)]` | `#5ffbfd` |

## Gradient Replacements

| Generic Pattern | SuperSeller AI Class | CSS Value |
|----------------|-------------|-----------|
| Red-to-orange gradient | `.superseller-gradient-primary` | `linear-gradient(135deg, #fe3d51 0%, #bf5700 100%)` |
| Blue-to-cyan gradient | `.superseller-gradient-secondary` | `linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)` |
| Multi-color brand gradient | `.superseller-gradient-brand` | `linear-gradient(135deg, #fe3d51 0%, #bf5700 50%, #1eaef7 100%)` |
| Neon/glow gradient | `.superseller-gradient-neon` | `linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)` |

## Shadow/Glow Replacements

| Generic Pattern | SuperSeller AI Class | CSS Value |
|----------------|-------------|-----------|
| Red/rose shadow | `.superseller-glow-primary` | `0 0 20px rgba(254, 61, 81, 0.45)` |
| Blue/sky shadow | `.superseller-glow-secondary` | `0 0 20px rgba(30, 174, 247, 0.45)` |
| Cyan/teal shadow | `.superseller-glow-accent` | `0 0 20px rgba(95, 251, 253, 0.45)` |
| Strong neon glow | `.superseller-glow-neon` | `0 0 30px rgba(95, 251, 253, 0.7)` |

## Component Class Replacements

| Instead Of | Use |
|-----------|-----|
| Custom dark card with border | `.superseller-card` |
| Card with cyan neon border | `.superseller-card-neon` |
| Card with gradient background | `.superseller-card-gradient` |
| Custom dark input | `.superseller-input` |
| Success badge (green) | `.superseller-badge-success` |
| Warning badge (orange) | `.superseller-badge-warning` |
| Error badge (red) | `.superseller-badge-error` |
| Info badge (blue) | `.superseller-badge-info` |
| Neon badge (cyan) | `.superseller-badge-neon` |

## Animation Replacements

| Generic Pattern | SuperSeller AI Class | Effect |
|----------------|-------------|--------|
| Pulsing glow shadow | `.superseller-animate-glow` | Alternating glow, 2s infinite |
| Opacity pulse | `.superseller-animate-pulse` | Subtle opacity change, 2s |
| Shimmer/loading effect | `.superseller-animate-shimmer` | Cyan shimmer sweep, 2s |
| Fade-in on mount | `.superseller-animate-fadeIn` | Translate up + fade, 0.5s |

## Tailwind Config Extensions

The following are available in `tailwind.config.ts` via theme extensions:

```
colors.superseller.red: #fe3d51
colors.superseller.orange: #bf5700
colors.superseller.blue: #1eaef7
colors.superseller.cyan: #5ffbfd
colors.superseller.bg.primary: #110d28
colors.superseller.bg.secondary: #1a162f
colors.superseller.bg.card: #1a153f
colors.superseller.text.primary: #fffff3
colors.superseller.text.secondary: #b0bec5
```

Usage: `bg-superseller-bg-primary`, `text-superseller-cyan`, `border-superseller-blue`, etc.
(Depends on Tailwind config having these extensions defined.)
