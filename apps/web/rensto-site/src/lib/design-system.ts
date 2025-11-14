// Rensto Design System
// This file contains all design tokens, brand guidelines, and component rules

export const BRAND = {
  name: 'Rensto',
  tagline: 'Strategic automation partner that delivers measurable business outcomes',
  description: 'Transform your manual processes into intelligent workflows',

  // Brand Colors - Rensto Official Brand System
  colors: {
    primary: {
      red: '#fe3d51', // Rensto Primary Red
      orange: '#bf5700', // Rensto Secondary Orange
      blue: '#1eaef7', // Rensto Accent Blue
      cyan: '#5ffbfd', // Rensto Accent Cyan
      gradient: 'linear-gradient(135deg, #fe3d51 0%, #bf5700 100%)',
      gradientSecondary: 'linear-gradient(135deg, #1eaef7 0%, #5ffbfd 100%)',
      gradientBrand: 'linear-gradient(135deg, #fe3d51 0%, #bf5700 50%, #1eaef7 100%)',
    },
    background: {
      primary: '#110d28', // Rensto Dark Background
      secondary: '#1a162f', // Rensto Dark Secondary
      card: '#1a153f', // Rensto Card Background
      surface: '#17123a', // Rensto Surface Background
    },
    text: {
      primary: '#fffff3', // Rensto Light Text
      secondary: '#b0bec5', // Rensto Gray Text
      muted: '#94a3b8', // Rensto Muted Text
      accent: '#5ffbfd', // Rensto Accent Text (Cyan)
    },
    border: {
      light: 'rgba(254, 61, 81, 0.2)', // Rensto Primary Border
      dark: 'rgba(255,255,255,0.08)',
      accent: 'rgba(95, 251, 253, 0.3)', // Rensto Cyan Border
    },
    status: {
      success: '#10b981', // Emerald-500
      error: '#fe3d51', // Rensto Red for errors
      warning: '#f59e0b', // Amber-500
      info: '#1eaef7', // Rensto Blue for info
    },
  },

  // Typography - Rensto Official Brand System
  typography: {
    fontFamily: {
      primary: "'Outfit', sans-serif", // Rensto Official Font
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

  // Shadows - Rensto Brand Glow Effects
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glass: '0 10px 30px rgba(0,0,0,0.25)',
    glow: '0 0 20px rgba(254, 61, 81, 0.45)', // Rensto Primary Glow
    glowSecondary: '0 0 20px rgba(30, 174, 247, 0.45)', // Rensto Blue Glow
    glowAccent: '0 0 20px rgba(95, 251, 253, 0.45)', // Rensto Cyan Glow
    glowNeon: '0 0 30px rgba(95, 251, 253, 0.7)', // Rensto Neon Glow
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
  // Button variants - Rensto Brand Buttons
  button: {
    primary: {
      background: BRAND.colors.primary.gradient,
      color: '#ffffff',
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.bold,
      shadow: BRAND.shadows.glow,
      hover: {
        opacity: 0.9,
        shadow: BRAND.shadows.glowNeon,
        transform: 'translateY(-2px)',
      },
    },
    secondary: {
      background: 'transparent',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${BRAND.colors.primary.red}`,
      color: BRAND.colors.primary.red,
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.bold,
      hover: {
        background: BRAND.colors.primary.red,
        color: '#ffffff',
        transform: 'translateY(-2px)',
      },
    },
    accent: {
      background: BRAND.colors.primary.gradientSecondary,
      color: '#ffffff',
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.bold,
      shadow: BRAND.shadows.glowSecondary,
      hover: {
        shadow: BRAND.shadows.glowNeon,
        transform: 'translateY(-2px)',
      },
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

  // Card components - Rensto Brand Cards
  card: {
    background: BRAND.colors.background.card,
    border: `1px solid ${BRAND.colors.border.light}`,
    borderRadius: BRAND.borderRadius.xl,
    padding: BRAND.spacing.xl,
    shadow: BRAND.shadows.glowAccent,
    hover: {
      borderColor: BRAND.colors.primary.red,
      shadow: BRAND.shadows.glow,
      transform: 'translateY(-4px)',
    },
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

  // Login page specific - Rensto Dark Theme
  login: {
    background: BRAND.colors.background.primary,
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

  // Generate gradient - Rensto Brand Gradients
  gradient: (direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' = 'to-r', type: 'primary' | 'secondary' | 'brand' = 'primary') => {
    const gradients = {
      primary: BRAND.colors.primary.gradient,
      secondary: BRAND.colors.primary.gradientSecondary,
      brand: BRAND.colors.primary.gradientBrand,
    };
    return gradients[type];
  },

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
