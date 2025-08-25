// Rensto Design System
// This file contains all design tokens, brand guidelines, and component rules

export const BRAND = {
  name: 'Rensto',
  tagline: 'Automations that ship in days — not months',
  description: 'Transform your manual processes into intelligent workflows',

  // Brand Colors (AUTHORITATIVE - matches globals.css)
  colors: {
    primary: {
      red: '#fe3d51', // Rensto Red
      orange: '#bf5700', // Rensto Orange
      blue: '#1eaef7', // Rensto Blue
      cyan: '#5ffbfd', // Rensto Cyan
      gradient: 'linear-gradient(135deg, #fe3d51 0%, #bf5700 100%)',
    },
    background: {
      primary: '#110d28', // App background
      secondary: '#17123a', // Panels, surfaces
      card: '#1a153f', // Cards
      surface: '#17123a', // Surface elements
    },
    text: {
      primary: '#ffffff', // Primary text
      secondary: '#d1d5db', // Secondary text
      muted: '#94a3b8', // Muted text
      accent: '#5ffbfd', // Accent text
    },
    border: {
      light: '#e2e8f0', // Slate-200
      dark: 'rgba(255,255,255,0.08)',
    },
    status: {
      success: '#10b981', // Emerald-500
      error: '#ef4444', // Red-500
      warning: '#f59e0b', // Amber-500
      info: '#1eaef7', // Blue-500
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
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glass: '0 10px 30px rgba(0,0,0,0.25)',
  },

  // Z-Index
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
      background: 'var(--rensto-gradient-primary)',
      color: '#ffffff',
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.semibold,
      shadow: 'var(--rensto-glow-primary)',
      hover: {
        opacity: 0.9,
        shadow: 'var(--rensto-glow-primary)',
      },
    },
    secondary: {
      background: 'var(--rensto-gradient-secondary)',
      color: '#ffffff',
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.semibold,
      shadow: 'var(--rensto-glow-secondary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--rensto-text-accent)',
      border: '2px solid var(--rensto-cyan)',
      padding: `${BRAND.spacing.md} ${BRAND.spacing.xl}`,
      borderRadius: BRAND.borderRadius.lg,
      fontWeight: BRAND.typography.fontWeight.semibold,
      shadow: 'var(--rensto-glow-accent)',
    },
  },

  // Form elements
  form: {
    input: {
      height: '3rem', // 48px
      padding: `${BRAND.spacing.md} ${BRAND.spacing.lg}`,
      border: `1px solid var(--rensto-border)`,
      borderRadius: BRAND.borderRadius.lg,
      fontSize: BRAND.typography.fontSize.sm,
      background: 'var(--rensto-bg-secondary)',
      focus: {
        borderColor: 'var(--rensto-cyan)',
        ringColor: 'var(--rensto-cyan)',
        ringWidth: '2px',
        shadow: 'var(--rensto-glow-accent)',
      },
    },
    label: {
      fontSize: BRAND.typography.fontSize.sm,
      fontWeight: BRAND.typography.fontWeight.medium,
      color: 'var(--rensto-text-primary)',
      marginBottom: BRAND.spacing.xs,
    },
  },

  // Card components
  card: {
    background: 'var(--rensto-bg-card)',
    border: `1px solid var(--rensto-border)`,
    borderRadius: BRAND.borderRadius.xl,
    padding: BRAND.spacing.xl,
    shadow: 'var(--rensto-glow-accent)',
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

  // Navigation
  navigation: {
    background: 'var(--rensto-bg-secondary)',
    borderBottom: '1px solid var(--rensto-border)',
    backdropFilter: 'blur(10px)',
    padding: `${BRAND.spacing.md} 0`,
  },
};

// Animation configurations
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  keyframes: {
    fadeIn: 'fadeIn 0.5s ease-out',
    slideUp: 'slideUp 0.3s ease-out',
    slideDown: 'slideDown 0.3s ease-out',
    scale: 'scale 0.2s ease-out',
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
    `linear-gradient(${direction}, ${BRAND.colors.primary.red}, ${BRAND.colors.primary.orange})`,

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
  validateColors: (colors: Record<string, string>) => {
    const validColors = Object.values(BRAND.colors.primary);
    return Object.values(colors).every(color => validColors.includes(color));
  },

  // Generate CSS variables
  generateCSSVariables: () => {
    return Object.entries(BRAND.colors).map(([category, colors]) => {
      return Object.entries(colors).map(([name, value]) => {
        return `--rensto-${category}-${name}: ${value};`;
      }).join('\n');
    }).join('\n');
  },

  // Get component styles
  getComponentStyles: (componentName: keyof typeof COMPONENTS) => {
    return COMPONENTS[componentName];
  },
};
