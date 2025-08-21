export interface WhiteLabelConfig {
  organizationId: string;
  brandName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customDomain?: string;
  hideMarketplace?: boolean;
  hidePricing?: boolean;
  customFooter?: string;
  favicon?: string;
  metaTitle?: string;
  metaDescription?: string;
  contactEmail?: string;
  supportUrl?: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#ea580c',
    secondary: '#1eaef7',
    accent: '#5ffbfd',
    background: '#ffffff',
    text: '#213544',
    muted: '#6b7280',
    border: '#e5e7eb',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
};

// White-label configuration management
export class WhiteLabelManager {
  private static instance: WhiteLabelManager;
  private configs: Map<string, WhiteLabelConfig> = new Map();

  static getInstance(): WhiteLabelManager {
    if (!WhiteLabelManager.instance) {
      WhiteLabelManager.instance = new WhiteLabelManager();
    }
    return WhiteLabelManager.instance;
  }

  // Get configuration for an organization
  async getConfig(organizationId: string): Promise<WhiteLabelConfig | null> {
    if (this.configs.has(organizationId)) {
      return this.configs.get(organizationId)!;
    }

    // In a real implementation, this would fetch from database
    try {
      const response = await fetch(`/api/white-label/${organizationId}`);
      if (response.ok) {
        const config = await response.json();
        this.configs.set(organizationId, config);
        return config;
      }
    } catch (error) {
      console.error('Failed to fetch white-label config:', error);
    }

    return null;
  }

  // Update configuration for an organization
  async updateConfig(organizationId: string, config: Partial<WhiteLabelConfig>): Promise<boolean> {
    try {
      const response = await fetch(`/api/white-label/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        this.configs.set(organizationId, updatedConfig);
        return true;
      }
    } catch (error) {
      console.error('Failed to update white-label config:', error);
    }

    return false;
  }

  // Generate CSS variables for a theme
  generateThemeCSS(config: WhiteLabelConfig): string {
    const theme = this.buildThemeFromConfig(config);
    
    return `
      :root {
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-background: ${theme.colors.background};
        --color-text: ${theme.colors.text};
        --color-muted: ${theme.colors.muted};
        --color-border: ${theme.colors.border};
        
        --font-heading: ${theme.fonts.heading};
        --font-body: ${theme.fonts.body};
        
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
        
        --radius-sm: ${theme.borderRadius.sm};
        --radius-md: ${theme.borderRadius.md};
        --radius-lg: ${theme.borderRadius.lg};
        --radius-xl: ${theme.borderRadius.xl};
      }
    `;
  }

  // Build theme configuration from white-label config
  private buildThemeFromConfig(config: WhiteLabelConfig): ThemeConfig {
    return {
      colors: {
        primary: config.primaryColor || defaultTheme.colors.primary,
        secondary: config.secondaryColor || defaultTheme.colors.secondary,
        accent: config.accentColor || defaultTheme.colors.accent,
        background: config.backgroundColor || defaultTheme.colors.background,
        text: config.textColor || defaultTheme.colors.text,
        muted: defaultTheme.colors.muted,
        border: defaultTheme.colors.border,
      },
      fonts: {
        heading: config.fontFamily || defaultTheme.fonts.heading,
        body: config.fontFamily || defaultTheme.fonts.body,
      },
      spacing: defaultTheme.spacing,
      borderRadius: defaultTheme.borderRadius,
    };
  }

  // Generate PWA manifest for white-label
  generatePWAManifest(config: WhiteLabelConfig): unknown {
    return {
      name: config.brandName || 'Rensto Customer Portal',
      short_name: config.brandName?.split(' ')[0] || 'Rensto',
      description: config.metaDescription || 'Multi-tenant automation platform',
      start_url: '/',
      display: 'standalone',
      background_color: config.backgroundColor || '#ffffff',
      theme_color: config.primaryColor || '#ea580c',
      orientation: 'portrait-primary',
      icons: [
        {
          src: config.favicon || '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any',
        },
        {
          src: config.favicon || '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any',
        },
      ],
      categories: ['business', 'productivity', 'utilities'],
      lang: 'en',
      dir: 'ltr',
      scope: '/',
      prefer_related_applications: false,
      related_applications: [],
    };
  }

  // Generate meta tags for white-label
  generateMetaTags(config: WhiteLabelConfig): Record<string, string> {
    return {
      title: config.metaTitle || config.brandName || 'Rensto Customer Portal',
      description: config.metaDescription || 'Multi-tenant automation platform for business process automation',
      'theme-color': config.primaryColor || '#ea580c',
      'apple-mobile-web-app-title': config.brandName || 'Rensto',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'msapplication-TileColor': config.primaryColor || '#ea580c',
      'msapplication-config': '/browserconfig.xml',
    };
  }

  // Check if feature should be hidden for organization
  shouldHideFeature(organizationId: string, feature: 'marketplace' | 'pricing'): boolean {
    const config = this.configs.get(organizationId);
    if (!config) return false;

    switch (feature) {
      case 'marketplace':
        return config.hideMarketplace || false;
      case 'pricing':
        return config.hidePricing || false;
      default:
        return false;
    }
  }

  // Get custom footer for organization
  getCustomFooter(organizationId: string): string | null {
    const config = this.configs.get(organizationId);
    return config?.customFooter || null;
  }

  // Validate configuration
  validateConfig(config: Partial<WhiteLabelConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.brandName && config.brandName.length < 2) {
      errors.push('Brand name must be at least 2 characters long');
    }

    if (config.primaryColor && !this.isValidColor(config.primaryColor)) {
      errors.push('Primary color must be a valid hex color');
    }

    if (config.secondaryColor && !this.isValidColor(config.secondaryColor)) {
      errors.push('Secondary color must be a valid hex color');
    }

    if (config.customDomain && !this.isValidDomain(config.customDomain)) {
      errors.push('Custom domain must be a valid domain name');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  private isValidDomain(domain: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);
  }
}

// Export singleton instance
export const whiteLabelManager = WhiteLabelManager.getInstance();
