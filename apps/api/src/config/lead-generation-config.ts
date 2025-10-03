export const LeadGenerationConfig = {
  // Instantly.ai CRM Integration
  instantly: {
    apiKey: process.env['INSTANTLY_API_KEY'] || 'ZjAwMDhhN2EtNjM1YS00MTBiLTlkNjItMTY5MDA1NWVhMWMzOmVZTnloeHVqQVRyVA==',
    apiUrl: process.env['INSTANTLY_API_URL'] || 'https://api.instantly.ai/api/v1',
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },

  // Lead Generation APIs
  apis: {
    linkup: {
      apiKey: process.env['LINKUP_API_KEY'] || '',
      apiUrl: 'https://api.linkup.com/v1',
      timeout: 30000
    },
    apify: {
      apiKey: process.env['APIFY_API_KEY'] || '',
      apiUrl: 'https://api.apify.com/v2',
      timeout: 60000
    },
    firecrawl: {
      apiKey: process.env['FIRECRAWL_API_KEY'] || '',
      apiUrl: 'https://api.firecrawl.dev/v1',
      timeout: 30000
    }
  },

  // Lead Generation Sources
  sources: {
    linkedin: {
      enabled: true,
      maxLeadsPerRequest: 100,
      costPerLead: 0.50,
      timeout: 30000
    },
    google_maps: {
      enabled: true,
      maxLeadsPerRequest: 100,
      costPerLead: 0.30,
      timeout: 45000
    },
    facebook: {
      enabled: true,
      maxLeadsPerRequest: 50,
      costPerLead: 0.40,
      timeout: 30000
    },
    apify: {
      enabled: true,
      maxLeadsPerRequest: 200,
      costPerLead: 0.25,
      timeout: 60000
    }
  },

  // Delivery Methods
  delivery: {
    email: {
      enabled: true,
      maxLeadsPerEmail: 100,
      templateRequired: true
    },
    crm: {
      enabled: true,
      maxLeadsPerBatch: 50,
      autoSync: true
    },
    api: {
      enabled: true,
      maxLeadsPerRequest: 1000,
      retentionDays: 30
    }
  },

  // Usage Tracking
  usage: {
    trackInteractions: true,
    trackApiCalls: true,
    trackDataProcessing: true,
    trackStorage: true,
    trackLeadGeneration: true,
    trackCrmContacts: true,
    trackEmailCampaigns: true
  },

  // Billing Configuration
  billing: {
    plans: {
      basic: {
        name: 'Basic Plan',
        price: 97,
        currency: 'USD',
        interval: 'month',
        features: {
          interactions: 100,
          apiCalls: 1000,
          storage: 1, // GB
          leadGeneration: 50,
          crmContacts: 100,
          emailCampaigns: 5
        },
        usagePricing: {
          interactions: 0.50,
          apiCalls: 0.01,
          storage: 0.05,
          leadGeneration: 2.00,
          crmContacts: 0.10,
          emailCampaigns: 5.00
        }
      },
      professional: {
        name: 'Professional Plan',
        price: 197,
        currency: 'USD',
        interval: 'month',
        features: {
          interactions: 500,
          apiCalls: 5000,
          storage: 10, // GB
          leadGeneration: 250,
          crmContacts: 500,
          emailCampaigns: 20
        },
        usagePricing: {
          interactions: 0.40,
          apiCalls: 0.008,
          storage: 0.04,
          leadGeneration: 1.50,
          crmContacts: 0.08,
          emailCampaigns: 4.00
        }
      },
      enterprise: {
        name: 'Enterprise Plan',
        price: 497,
        currency: 'USD',
        interval: 'month',
        features: {
          interactions: 2000,
          apiCalls: 20000,
          storage: 50, // GB
          leadGeneration: 1000,
          crmContacts: 2000,
          emailCampaigns: 100
        },
        usagePricing: {
          interactions: 0.30,
          apiCalls: 0.005,
          storage: 0.03,
          leadGeneration: 1.00,
          crmContacts: 0.05,
          emailCampaigns: 3.00
        }
      }
    }
  },

  // Analytics Configuration
  analytics: {
    trackCustomerMetrics: true,
    trackSystemMetrics: true,
    trackRevenueAnalytics: true,
    trackChurnAnalytics: true,
    generateRecommendations: true,
    alertThresholds: {
      highUtilization: 80,
      overageAlert: 100,
      churnRisk: 60
    }
  },

  // Automation Configuration
  automation: {
    emailSequences: {
      welcome: true,
      onboarding: true,
      usageAlerts: true,
      churnPrevention: true,
      upgradeRecommendations: true
    },
    billingAutomation: {
      overageInvoices: true,
      usageAlerts: true,
      upgradeRecommendations: true,
      churnPrevention: true
    },
    crmAutomation: {
      autoSync: true,
      leadEnrichment: true,
      campaignAutomation: true,
      sequenceAutomation: true
    }
  },

  // Rate Limiting
  rateLimiting: {
    leadGeneration: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10
    },
    apiCalls: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100
    },
    crmOperations: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 50
    }
  },

  // Error Handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    timeout: 30000, // 30 seconds
    logErrors: true,
    notifyOnError: true
  },

  // Security
  security: {
    encryptSensitiveData: true,
    validateApiKeys: true,
    rateLimitByIP: true,
    requireAuthentication: true
  }
};
