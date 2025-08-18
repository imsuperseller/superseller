// Rensto Design System
// This file contains all design tokens, brand guidelines, and component rules

export const BRAND = {
  name: 'Rensto',
  tagline: 'Automations that ship in days — not months',
  description: 'Transform your manual processes into intelligent workflows',

  // Brand Colors
  colors: {
    primary: {
      orange: '#f97316', // Orange-500
      blue: '#3b82f6', // Blue-500
      gradient: 'linear-gradient(to right, #f97316, #3b82f6)',
    },
    background: {
      light: '#f8fafc', // Slate-50
      dark: '#0B1318', // Custom dark
      card: '#ffffff', // White
    },
    text: {
      primary: '#1e293b', // Slate-800
      secondary: '#64748b', // Slate-500
      muted: '#94a3b8', // Slate-400
    },
    border: {
      light: '#e2e8f0', // Slate-200
      dark: 'rgba(255,255,255,0.08)',
    },
    status: {
      success: '#10b981', // Emerald-500
      error: '#ef4444', // Red-500
      warning: '#f59e0b', // Amber-500
      info: '#3b82f6', // Blue-500
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },

  // Border Radius
  borderRadius: {
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glass: '0 10px 30px rgba(0,0,0,0.25)',
    glow: '0 0 20px rgba(47,106,146,0.3)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

// Component-specific design rules
export const COMPONENTS = {
  // Button variants
  button: {
    primary: {
      background: BRAND.colors.primary.gradient,
      color: '#ffffff',
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.semibold,
      shadow: BRAND.shadows.md,
      hover: {
        opacity: 0.9,
        shadow: BRAND.shadows.lg,
      },
    },
    secondary: {
      background: 'rgba(17, 24, 39, 0.5)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${BRAND.colors.border.dark}`,
      color: BRAND.colors.text.primary,
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.semibold,
      shadow: BRAND.shadows.glass,
    },
  },

  // Form elements
  form: {
    input: {
      height: '3rem', // 48px
      padding: `${BRAND.spacing.md} ${BRAND.spacing.lg}`,
      border: `1px solid ${BRAND.colors.border.light}`,
      borderRadius: BRAND.borderRadius.lg,
      fontSize: BRAND.typography.fontSize.sm,
      focus: {
        borderColor: BRAND.colors.primary.orange,
        ringColor: BRAND.colors.primary.orange,
        ringWidth: '2px',
      },
    },
    label: {
      fontSize: BRAND.typography.fontSize.sm,
      fontWeight: BRAND.typography.fontWeight.medium,
      color: BRAND.colors.text.primary,
      marginBottom: BRAND.spacing.xs,
    },
  },

  // Card components
  card: {
    background: BRAND.colors.background.card,
    border: `1px solid ${BRAND.colors.border.light}`,
    borderRadius: BRAND.borderRadius.xl,
    padding: BRAND.spacing.xl,
    shadow: BRAND.shadows.md,
  },

  // Layout containers
  container: {
    maxWidth: '1200px',
    padding: `0 ${BRAND.spacing.md}`,
    margin: '0 auto',
    responsive: {
      sm: `0 ${BRAND.spacing.lg}`,
      lg: `0 ${BRAND.spacing['2xl']}`,
    },
  },

  // Login page specific
  login: {
    background: BRAND.colors.background.light,
    maxWidth: '28rem', // 448px - max-w-md
    padding: BRAND.spacing.xl,
    centered: true,
    formSpacing: BRAND.spacing.lg,
  },
};

// Animation presets
export const ANIMATIONS = {
  // GSAP presets
  gsap: {
    fadeIn: {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    },
    fadeInUp: {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
    },
    scaleIn: {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
    },
    slideInLeft: {
      opacity: 0,
      x: -30,
      duration: 0.6,
      ease: 'power2.out',
    },
    buttonPress: {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    },
    shake: {
      x: -10,
      duration: 0.1,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut',
    },
  },

  // CSS animations
  css: {
    fadeIn: 'fadeIn 0.8s ease-out forwards',
    slideUp: 'slideUp 0.8s ease-out forwards',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    spin: 'spin 1s linear infinite',
  },
};

// Utility functions
export const utils = {
  // Get brand color
  getColor: (colorPath: string) => {
    const path = colorPath.split('.');
    let value: unknown = BRAND.colors;
    for (const key of path) {
      if (typeof value === 'object' && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return value;
  },

  // Get spacing value
  getSpacing: (size: keyof typeof BRAND.spacing) => BRAND.spacing[size],

  // Get typography value
  getTypography: (type: keyof typeof BRAND.typography.fontSize) =>
    BRAND.typography.fontSize[type],

  // Generate gradient
  gradient: (direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' = 'to-r') =>
    `linear-gradient(${direction}, ${BRAND.colors.primary.orange}, ${BRAND.colors.primary.blue})`,

  // Check if color is light or dark
  isLightColor: (color: string) => {
    // Simple heuristic - could be improved with proper color analysis
    return (
      color.includes('white') || color.includes('50') || color.includes('100')
    );
  },
};

// Design System Utilities
export const DesignUtils = {
  // Validate color usage
  validateColors: (colors: string[]) => {
    const validColors = Object.values(BRAND.colors).flatMap(color =>
      typeof color === 'string' ? [color] : Object.values(color)
    );
    return colors.every(color => validColors.includes(color));
  },

  // Validate component usage
  validateComponent: (
    componentName: string,
    props: Record<string, unknown>
  ) => {
    // Implementation for component validation
    return true;
  },
};

export default BRAND;
