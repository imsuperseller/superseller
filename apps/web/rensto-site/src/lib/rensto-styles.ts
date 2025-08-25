// Professional styling utilities for Rensto components
export const renstoStyles = {
  // Text colors
  textPrimary: 'text-rensto-text-primary',
  textSecondary: 'text-rensto-text-secondary',
  textMuted: 'text-rensto-text-muted',
  textAccent: 'text-rensto-text-accent',
  textRed: 'text-rensto-red',
  textBlue: 'text-rensto-blue',
  textOrange: 'text-rensto-orange',
  textCyan: 'text-rensto-cyan',

  // Background colors
  bgPrimary: 'bg-rensto-bg-primary',
  bgSecondary: 'bg-rensto-bg-secondary',
  bgCard: 'bg-rensto-bg-card',
  bgSurface: 'bg-rensto-bg-surface',

  // Gradients
  gradientPrimary: 'bg-gradient-to-r from-rensto-red to-rensto-orange',
  gradientSecondary: 'bg-gradient-to-r from-rensto-blue to-rensto-cyan',
  gradientBrand: 'bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue',

  // Glow effects
  glowPrimary: 'shadow-rensto-glow-primary',
  glowSecondary: 'shadow-rensto-glow-secondary',
  glowAccent: 'shadow-rensto-glow-accent',
  glowNeon: 'shadow-rensto-glow-neon',

  // Interactive states
  hoverGlow: 'hover:shadow-rensto-glow-primary/80',
  focusRing: 'focus:ring-2 focus:ring-rensto-cyan focus:ring-offset-2',
  transition: 'transition-all duration-300 ease-in-out'
};

// Professional component variants
export const componentVariants = {
  button: {
    primary: `${renstoStyles.gradientPrimary} ${renstoStyles.textPrimary} ${renstoStyles.glowPrimary} ${renstoStyles.hoverGlow} ${renstoStyles.transition}`,
    secondary: `${renstoStyles.gradientSecondary} ${renstoStyles.textPrimary} ${renstoStyles.glowSecondary} hover:shadow-rensto-glow-secondary/80 ${renstoStyles.transition}`,
    ghost: `bg-transparent ${renstoStyles.textCyan} border-2 border-rensto-cyan hover:bg-rensto-cyan/10 ${renstoStyles.glowAccent} ${renstoStyles.transition}`,
    neon: `bg-transparent border-2 border-rensto-cyan ${renstoStyles.textCyan} hover:bg-rensto-cyan hover:text-rensto-bg-primary ${renstoStyles.glowNeon} hover:shadow-rensto-glow-neon/80 ${renstoStyles.transition}`
  },
  card: {
    default: `${renstoStyles.bgCard} ${renstoStyles.textPrimary} border border-rensto-bg-secondary ${renstoStyles.glowAccent}`,
    elevated: `${renstoStyles.bgCard} ${renstoStyles.textPrimary} border border-rensto-bg-secondary ${renstoStyles.glowPrimary} hover:${renstoStyles.glowPrimary}/80`
  },
  input: {
    default: `${renstoStyles.bgSecondary} ${renstoStyles.textPrimary} border border-rensto-bg-card focus:border-rensto-cyan ${renstoStyles.focusRing}`,
    error: `${renstoStyles.bgSecondary} ${renstoStyles.textRed} border border-red-500 focus:border-red-500 ${renstoStyles.focusRing}`
  }
};

// Professional status indicators
export const statusStyles = {
  success: 'text-green-500 bg-green-100 border-green-200',
  error: 'text-red-500 bg-red-100 border-red-200',
  warning: 'text-yellow-500 bg-yellow-100 border-yellow-200',
  info: 'text-rensto-blue bg-blue-100 border-blue-200',
  pending: 'text-rensto-orange bg-orange-100 border-orange-200'
};

// Professional animation classes
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  shimmer: 'animate-rensto-shimmer',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
};
