/**
 * Design Token System for Landing Pages
 *
 * Converts the per-page design token fields (theme, style, cardStyle, etc.)
 * into CSS custom properties and Tailwind utility classes that the
 * LandingPageClient component can consume directly.
 *
 * Usage:
 *   const tokens = resolveDesignTokens(page);
 *   // tokens.cssVars  -> React.CSSProperties for the root wrapper
 *   // tokens.classes  -> className fragments keyed by section
 *   // tokens.fonts    -> { heading, body, urls[] }
 *   // tokens.animation -> framer-motion duration/spring configs
 */

// ---------------------------------------------------------------------------
// Input shape (matches the LandingPage Prisma fields)
// ---------------------------------------------------------------------------
export interface DesignTokenInput {
  theme?: string | null;            // "dark" | "light" | "glass"
  style?: string | null;            // "modern" | "corporate" | "creative" | "minimal"
  fontHeading?: string | null;      // Google Font name
  fontBody?: string | null;         // Google Font name
  animationSpeed?: string | null;   // "none" | "subtle" | "normal" | "dramatic"
  heroStyle?: string | null;        // "split" | "fullwidth" | "video" | "parallax"
  cardStyle?: string | null;        // "glass" | "solid" | "outline" | "elevated"
  sectionAlternation?: boolean | null;
  heroMediaUrl?: string | null;
  // Brand-level fallbacks (from the related Brand record)
  brand?: {
    primaryColor?: string | null;
    accentColor?: string | null;
    ctaColor?: string | null;
    fontFamily?: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Output shape
// ---------------------------------------------------------------------------
export interface DesignTokens {
  /** CSS custom properties to spread on the root element */
  cssVars: Record<string, string>;
  /** Tailwind class fragments grouped by section */
  classes: {
    root: string;
    hero: string;
    heroOverlay: string;
    section: string;
    sectionAlt: string;
    card: string;
    footer: string;
    formCard: string;
    text: string;
    textMuted: string;
  };
  /** Font configuration */
  fonts: {
    heading: string;
    body: string;
    urls: string[];
  };
  /** Framer-motion timing values */
  animation: {
    duration: number;
    staggerDelay: number;
    springStiffness: number;
    springDamping: number;
    enabled: boolean;
  };
  /** Hero layout metadata */
  hero: {
    style: string;
    mediaUrl: string | null;
    isVideo: boolean;
  };
  /** Whether to alternate section backgrounds */
  sectionAlternation: boolean;
}

// ---------------------------------------------------------------------------
// Theme palettes
// ---------------------------------------------------------------------------
const THEME_PALETTES = {
  dark: {
    root: "bg-slate-950 text-white",
    hero: "bg-slate-900",
    heroOverlay: "opacity-30",
    section: "bg-slate-950",
    sectionAlt: "bg-slate-900",
    card: "bg-slate-800/60 border-slate-700/50 text-slate-100",
    footer: "bg-slate-900 text-slate-400",
    formCard: "bg-slate-800 border-slate-700 text-white",
    text: "text-white",
    textMuted: "text-slate-400",
    // CSS vars
    "--dt-bg": "#0f172a",
    "--dt-bg-alt": "#1e293b",
    "--dt-surface": "rgba(30, 41, 59, 0.6)",
    "--dt-border": "rgba(51, 65, 85, 0.5)",
    "--dt-text": "#f8fafc",
    "--dt-text-muted": "#94a3b8",
  },
  light: {
    root: "bg-white text-slate-800",
    hero: "bg-slate-50",
    heroOverlay: "opacity-10",
    section: "bg-white",
    sectionAlt: "bg-slate-50",
    card: "bg-white border-slate-200 text-slate-800 shadow-sm",
    footer: "bg-slate-100 text-slate-500",
    formCard: "bg-white border-slate-100 text-slate-800 shadow-xl",
    text: "text-slate-800",
    textMuted: "text-slate-500",
    "--dt-bg": "#ffffff",
    "--dt-bg-alt": "#f8fafc",
    "--dt-surface": "#ffffff",
    "--dt-border": "#e2e8f0",
    "--dt-text": "#1e293b",
    "--dt-text-muted": "#64748b",
  },
  glass: {
    root: "bg-slate-950 text-white",
    hero: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    heroOverlay: "opacity-40",
    section: "bg-slate-950/80",
    sectionAlt: "bg-slate-900/60",
    card: "bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl",
    footer: "bg-slate-900/80 backdrop-blur text-slate-400",
    formCard: "bg-white/10 backdrop-blur-2xl border-white/20 text-white shadow-2xl",
    text: "text-white",
    textMuted: "text-slate-300",
    "--dt-bg": "#0f172a",
    "--dt-bg-alt": "rgba(15, 23, 42, 0.8)",
    "--dt-surface": "rgba(255, 255, 255, 0.05)",
    "--dt-border": "rgba(255, 255, 255, 0.1)",
    "--dt-text": "#f8fafc",
    "--dt-text-muted": "#cbd5e1",
  },
} as const;

// ---------------------------------------------------------------------------
// Style presets (layered on top of theme)
// ---------------------------------------------------------------------------
const STYLE_MODIFIERS: Record<string, Partial<Record<keyof DesignTokens["classes"], string>>> = {
  modern: {
    card: "rounded-2xl",
    hero: "pb-24 pt-16",
    formCard: "rounded-2xl",
  },
  corporate: {
    card: "rounded-lg",
    hero: "pb-20 pt-14",
    formCard: "rounded-lg",
    root: "tracking-tight",
  },
  creative: {
    card: "rounded-3xl",
    hero: "pb-28 pt-20",
    formCard: "rounded-3xl",
    root: "tracking-wide",
  },
  minimal: {
    card: "rounded-none border-0",
    hero: "pb-16 pt-12",
    formCard: "rounded-lg",
    root: "tracking-normal",
  },
};

// ---------------------------------------------------------------------------
// Card style classes (independent of theme)
// ---------------------------------------------------------------------------
const CARD_STYLE_CLASSES: Record<string, string> = {
  glass: "backdrop-blur-xl",
  solid: "shadow-none",
  outline: "bg-transparent shadow-none border-2",
  elevated: "shadow-xl hover:shadow-2xl transition-shadow duration-300",
};

// ---------------------------------------------------------------------------
// Animation speed presets
// ---------------------------------------------------------------------------
const ANIMATION_PRESETS: Record<string, DesignTokens["animation"]> = {
  none: {
    duration: 0,
    staggerDelay: 0,
    springStiffness: 999,
    springDamping: 99,
    enabled: false,
  },
  subtle: {
    duration: 0.3,
    staggerDelay: 0.06,
    springStiffness: 300,
    springDamping: 30,
    enabled: true,
  },
  normal: {
    duration: 0.6,
    staggerDelay: 0.12,
    springStiffness: 200,
    springDamping: 20,
    enabled: true,
  },
  dramatic: {
    duration: 1.0,
    staggerDelay: 0.2,
    springStiffness: 120,
    springDamping: 14,
    enabled: true,
  },
};

// ---------------------------------------------------------------------------
// Font resolution
// ---------------------------------------------------------------------------
function resolveFonts(input: DesignTokenInput): DesignTokens["fonts"] {
  const brandFont = input.brand?.fontFamily || "Inter";
  const heading = input.fontHeading || brandFont;
  const body = input.fontBody || brandFont;

  const uniqueFonts = [...new Set([heading, body])];
  const urls = uniqueFonts.map(
    (f) =>
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;500;600;700;800;900&display=swap`
  );

  return { heading, body, urls };
}

// ---------------------------------------------------------------------------
// Hero metadata
// ---------------------------------------------------------------------------
function resolveHero(input: DesignTokenInput): DesignTokens["hero"] {
  const style = input.heroStyle || "split";
  const mediaUrl = input.heroMediaUrl || null;
  const videoExtensions = [".mp4", ".webm", ".mov", ".ogg"];
  const isVideo = mediaUrl
    ? videoExtensions.some((ext) => mediaUrl.toLowerCase().includes(ext))
    : false;

  return { style, mediaUrl, isVideo };
}

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------
export function resolveDesignTokens(input: DesignTokenInput): DesignTokens {
  const themeKey = (input.theme || "dark") as keyof typeof THEME_PALETTES;
  const styleKey = input.style || "modern";
  const cardStyleKey = input.cardStyle || "glass";
  const animationKey = input.animationSpeed || "normal";

  // 1. Start with theme palette
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.dark;

  // 2. Extract CSS vars from palette
  const cssVars: Record<string, string> = {};
  for (const [k, v] of Object.entries(palette)) {
    if (k.startsWith("--")) {
      cssVars[k] = v;
    }
  }

  // 3. Add brand colors as CSS vars
  const primary = input.brand?.primaryColor || "#1e3a8a";
  const accent = input.brand?.accentColor || "#2563eb";
  const cta = input.brand?.ctaColor || "#f97316";
  cssVars["--dt-primary"] = primary;
  cssVars["--dt-accent"] = accent;
  cssVars["--dt-cta"] = cta;

  // 4. Build fonts and add font-family vars
  const fonts = resolveFonts(input);
  cssVars["--dt-font-heading"] = `'${fonts.heading}', sans-serif`;
  cssVars["--dt-font-body"] = `'${fonts.body}', sans-serif`;

  // 5. Build class fragments (theme base + style modifier + card style)
  const styleMod = STYLE_MODIFIERS[styleKey] || STYLE_MODIFIERS.modern;
  const cardExtra = CARD_STYLE_CLASSES[cardStyleKey] || CARD_STYLE_CLASSES.glass;

  const classes: DesignTokens["classes"] = {
    root: join(palette.root, styleMod.root),
    hero: join(palette.hero, styleMod.hero),
    heroOverlay: palette.heroOverlay,
    section: palette.section,
    sectionAlt: palette.sectionAlt,
    card: join(palette.card, styleMod.card, cardExtra),
    footer: palette.footer,
    formCard: join(palette.formCard, styleMod.formCard),
    text: palette.text,
    textMuted: palette.textMuted,
  };

  // 6. Animation config
  const animation = ANIMATION_PRESETS[animationKey] || ANIMATION_PRESETS.normal;

  // 7. Hero metadata
  const hero = resolveHero(input);

  return {
    cssVars,
    classes,
    fonts,
    animation,
    hero,
    sectionAlternation: input.sectionAlternation ?? true,
  };
}

// ---------------------------------------------------------------------------
// Helper: join class strings, filtering blanks
// ---------------------------------------------------------------------------
function join(...parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Convenience: generate <link> tags markup for fonts
// ---------------------------------------------------------------------------
export function fontLinkTags(tokens: DesignTokens): string[] {
  return tokens.fonts.urls;
}

// ---------------------------------------------------------------------------
// Convenience: get framer-motion variants tuned to animation speed
// ---------------------------------------------------------------------------
export function getAnimationVariants(tokens: DesignTokens) {
  const { duration, staggerDelay, springStiffness, springDamping, enabled } =
    tokens.animation;

  if (!enabled) {
    return {
      fadeUp: { hidden: {}, visible: {} },
      staggerContainer: { hidden: {}, visible: {} },
      scaleIn: { hidden: {}, visible: {} },
    };
  }

  return {
    fadeUp: {
      hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
      visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    },
    staggerContainer: {
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerDelay },
      },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: springStiffness, damping: springDamping },
      },
    },
  };
}
