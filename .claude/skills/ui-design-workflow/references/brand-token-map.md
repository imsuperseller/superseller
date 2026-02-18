# Rensto Brand Token Map

Complete mapping from generic Tailwind/shadcn/CSS values to Rensto brand tokens.
Use this when rebranding externally generated components.

Source of truth: `apps/web/rensto-site/src/app/globals.css`

## Color Replacements

### Background Colors
| Generic (replace this) | Rensto Token | CSS Variable | Hex |
|------------------------|-------------|--------------|-----|
| `bg-gray-900`, `bg-slate-900`, `bg-zinc-900`, `bg-neutral-900`, `#111827`, `#0f172a`, `#18181b` | `bg-[var(--rensto-bg-primary)]` | `--rensto-bg-primary` | `#110d28` |
| `bg-gray-800`, `bg-slate-800`, `bg-zinc-800`, `#1f2937`, `#1e293b`, `#27272a` | `bg-[var(--rensto-bg-secondary)]` | `--rensto-bg-secondary` | `#1a162f` |
| `bg-gray-800/50`, `bg-slate-800/80`, `bg-zinc-800/50`, dark card backgrounds | `bg-[var(--rensto-bg-card)]` | `--rensto-bg-card` | `#1a153f` |
| `bg-gray-850`, `bg-slate-850`, elevated surfaces | `bg-[var(--rensto-bg-surface)]` | `--rensto-bg-surface` | `#17123a` |

### Accent Colors
| Generic (replace this) | Rensto Token | CSS Variable | Hex |
|------------------------|-------------|--------------|-----|
| `bg-red-500`, `bg-rose-500`, `text-red-500`, `#ef4444`, `#f43f5e` | Use `--rensto-red` | `--rensto-red` | `#fe3d51` |
| `bg-orange-600`, `bg-amber-600`, `text-orange-600`, `#ea580c`, `#d97706` | Use `--rensto-orange` | `--rensto-orange` | `#bf5700` |
| `bg-blue-500`, `bg-sky-500`, `text-blue-500`, `#3b82f6`, `#0ea5e9` | Use `--rensto-blue` | `--rensto-blue` | `#1eaef7` |
| `bg-cyan-400`, `bg-teal-400`, `text-cyan-400`, `#22d3ee`, `#2dd4bf` | Use `--rensto-cyan` | `--rensto-cyan` | `#5ffbfd` |

### Text Colors
| Generic (replace this) | Rensto Token | CSS Variable | Hex |
|------------------------|-------------|--------------|-----|
| `text-white`, `text-gray-50`, `text-slate-50`, `#ffffff`, `#f8fafc` | `text-[var(--rensto-text-primary)]` | `--rensto-text-primary` | `#fffff3` |
| `text-gray-300`, `text-slate-300`, `text-zinc-300`, `#d1d5db`, `#cbd5e1` | `text-[var(--rensto-text-secondary)]` | `--rensto-text-secondary` | `#b0bec5` |
| `text-gray-400`, `text-slate-400`, `text-zinc-400`, `#9ca3af`, `#94a3b8` | `text-[var(--rensto-text-muted)]` | `--rensto-text-muted` | `#94a3b8` |
| Highlighted/accent text in cyan/teal/emerald | `text-[var(--rensto-text-accent)]` | `--rensto-text-accent` | `#5ffbfd` |

### Border Colors
| Generic (replace this) | Rensto Token | Hex |
|------------------------|-------------|-----|
| `border-gray-700`, `border-slate-700`, `border-zinc-700` | `border-[var(--rensto-bg-secondary)]` | `#1a162f` |
| `border-gray-600`, `border-slate-600` | `border-[var(--rensto-bg-secondary)]` | `#1a162f` |
| `border-cyan-500`, `border-teal-500`, accent borders | `border-[var(--rensto-cyan)]` | `#5ffbfd` |

## Gradient Replacements

| Generic Pattern | Rensto Class | CSS Value |
|----------------|-------------|-----------|
| Red-to-orange gradient | `.rensto-gradient-primary` | `linear-gradient(135deg, #fe3d51 0%, #bf5700 100%)` |
| Blue-to-cyan gradient | `.rensto-gradient-secondary` | `linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)` |
| Multi-color brand gradient | `.rensto-gradient-brand` | `linear-gradient(135deg, #fe3d51 0%, #bf5700 50%, #1eaef7 100%)` |
| Neon/glow gradient | `.rensto-gradient-neon` | `linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)` |

## Shadow/Glow Replacements

| Generic Pattern | Rensto Class | CSS Value |
|----------------|-------------|-----------|
| Red/rose shadow | `.rensto-glow-primary` | `0 0 20px rgba(254, 61, 81, 0.45)` |
| Blue/sky shadow | `.rensto-glow-secondary` | `0 0 20px rgba(30, 174, 247, 0.45)` |
| Cyan/teal shadow | `.rensto-glow-accent` | `0 0 20px rgba(95, 251, 253, 0.45)` |
| Strong neon glow | `.rensto-glow-neon` | `0 0 30px rgba(95, 251, 253, 0.7)` |

## Component Class Replacements

| Instead Of | Use |
|-----------|-----|
| Custom dark card with border | `.rensto-card` |
| Card with cyan neon border | `.rensto-card-neon` |
| Card with gradient background | `.rensto-card-gradient` |
| Custom dark input | `.rensto-input` |
| Success badge (green) | `.rensto-badge-success` |
| Warning badge (orange) | `.rensto-badge-warning` |
| Error badge (red) | `.rensto-badge-error` |
| Info badge (blue) | `.rensto-badge-info` |
| Neon badge (cyan) | `.rensto-badge-neon` |

## Animation Replacements

| Generic Pattern | Rensto Class | Effect |
|----------------|-------------|--------|
| Pulsing glow shadow | `.rensto-animate-glow` | Alternating glow, 2s infinite |
| Opacity pulse | `.rensto-animate-pulse` | Subtle opacity change, 2s |
| Shimmer/loading effect | `.rensto-animate-shimmer` | Cyan shimmer sweep, 2s |
| Fade-in on mount | `.rensto-animate-fadeIn` | Translate up + fade, 0.5s |

## Tailwind Config Extensions

The following are available in `tailwind.config.ts` via theme extensions:

```
colors.rensto.red: #fe3d51
colors.rensto.orange: #bf5700
colors.rensto.blue: #1eaef7
colors.rensto.cyan: #5ffbfd
colors.rensto.bg.primary: #110d28
colors.rensto.bg.secondary: #1a162f
colors.rensto.bg.card: #1a153f
colors.rensto.text.primary: #fffff3
colors.rensto.text.secondary: #b0bec5
```

Usage: `bg-rensto-bg-primary`, `text-rensto-cyan`, `border-rensto-blue`, etc.
(Depends on Tailwind config having these extensions defined.)
