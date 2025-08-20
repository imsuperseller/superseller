import { NextRequest, NextResponse } from 'next/server';

// Customer-specific feature configurations
const CUSTOMER_CONFIGS = {
  'ben-ginati': {
    name: 'Ben Ginati',
    company: 'Tax4Us',
    industry: 'tax-services',
    businessType: 'tax-consulting',
    language: {
      customerApp: 'English',
      agentInterface: 'English',
      rtlSupport: false,
      locale: 'en-US'
    },
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'tasks', label: 'Tasks', icon: '📋' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'podcasts', label: 'Podcasts', icon: '🎙️' },
      { id: 'wordpress', label: 'WordPress', icon: '🌐' },
      { id: 'social', label: 'Social Media', icon: '📱' },
      { id: 'analytics', label: 'Analytics', icon: '📈' },
      { id: 'billing', label: 'Billing', icon: '💳' },
      { id: 'support', label: 'Support', icon: '💬' }
    ],
    agents: [
      {
        id: 'content-agent',
        name: 'WordPress Content Agent',
        description: 'Automated content creation for your website',
        icon: '📝',
        status: 'ready',
        type: 'content-generation',
        capabilities: ['Content generation', 'SEO optimization', 'Social media posts']
      },
      {
        id: 'podcast-agent',
        name: 'Podcast Management Agent',
        description: 'Manage your podcast workflow and distribution',
        icon: '🎙️',
        status: 'ready',
        type: 'podcast-management',
        capabilities: ['Episode planning', 'Distribution', 'Analytics']
      },
      {
        id: 'social-agent',
        name: 'Social Media Agent',
        description: 'Automated social media management',
        icon: '📱',
        status: 'ready',
        type: 'social-media',
        capabilities: ['Post scheduling', 'Engagement tracking', 'Content curation']
      }
    ],
    features: {
      podcastManagement: true,
      wordpressAutomation: true,
      socialMediaAutomation: true,
      contentGeneration: true,
      excelProcessing: false,
      dataAnalysis: false,
      documentManagement: false,
      clientManagement: false
    },
    availableIntegrations: ['WordPress', 'Captivate', 'Social Media APIs'],
    templates: ['podcast-episode-template', 'blog-post-template', 'social-media-template']
  },
  'shelly-mizrahi': {
    name: 'Shelly Mizrahi',
    company: 'Insurance Services',
    industry: 'insurance',
    businessType: 'insurance-consulting',
    language: {
      customerApp: 'Hebrew',
      agentInterface: 'Hebrew',
      rtlSupport: true,
      locale: 'he-IL'
    },
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'tasks', label: 'Tasks', icon: '📋' },
      { id: 'agents', label: 'Agents', icon: '🤖' },
      { id: 'excel', label: 'Excel Processing', icon: '📊' },
      { id: 'data', label: 'Data Analysis', icon: '📈' },
      { id: 'clients', label: 'Client Management', icon: '👥' },
      { id: 'reports', label: 'Reports', icon: '📋' },
      { id: 'billing', label: 'Billing', icon: '💳' },
      { id: 'support', label: 'Support', icon: '💬' }
    ],
    agents: [
      {
        id: 'excel-agent',
        name: 'Excel Processing Agent',
        description: 'Automated Excel file processing and analysis',
        icon: '📊',
        status: 'ready',
        type: 'excel-processing',
        capabilities: ['Data extraction', 'Format conversion', 'Analysis']
      },
      {
        id: 'data-agent',
        name: 'Data Analysis Agent',
        description: 'Advanced data analysis and reporting',
        icon: '📈',
        status: 'ready',
        type: 'data-analysis',
        capabilities: ['Trend analysis', 'Report generation', 'Insights']
      },
      {
        id: 'client-agent',
        name: 'Client Management Agent',
        description: 'Automated client communication and management',
        icon: '👥',
        status: 'ready',
        type: 'client-management',
        capabilities: ['Client onboarding', 'Communication', 'Follow-ups']
      }
    ],
    features: {
      podcastManagement: false,
      wordpressAutomation: false,
      socialMediaAutomation: false,
      contentGeneration: false,
      excelProcessing: true,
      dataAnalysis: true,
      documentManagement: true,
      clientManagement: true
    },
    availableIntegrations: ['Excel', 'Google Sheets', 'CRM Systems'],
    templates: ['insurance-quote-template', 'client-report-template', 'data-analysis-template']
  }
};

// Default configuration for new customers
const DEFAULT_CONFIG = {
  name: 'Customer',
  company: 'Company',
  industry: 'general',
  businessType: 'general',
  language: {
    customerApp: 'English',
    agentInterface: 'English',
    rtlSupport: false,
    locale: 'en-US'
  },
  tabs: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'support', label: 'Support', icon: '💬' }
  ],
  agents: [],
  features: {
    podcastManagement: false,
    wordpressAutomation: false,
    socialMediaAutomation: false,
    contentGeneration: false,
    excelProcessing: false,
    dataAnalysis: false,
    documentManagement: false,
    clientManagement: false
  },
  availableIntegrations: [],
  templates: []
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // Get customer configuration
    const config = CUSTOMER_CONFIGS[slug] || DEFAULT_CONFIG;
    
    // If customer doesn't exist in static config, try to load from Typeform data
    if (!CUSTOMER_CONFIGS[slug]) {
      try {
        // Try to load Typeform results to get language preferences
        const typeformPath = `data/customers/${slug}/typeform-results.json`;
        const fs = await import('fs/promises');
        
        try {
          const typeformData = await fs.readFile(typeformPath, 'utf-8');
          const typeformResults = JSON.parse(typeformData);
          
          // Extract language preferences from Typeform results
          const customerAppLanguage = typeformResults.customer_app_language || 'English';
          const agentInterfaceLanguage = typeformResults.agent_interface_language || 'English';
          const rtlSupport = typeformResults.rtl_support_needed === 'Yes, I need RTL support';
          
          // Update config with language preferences
          config.language = {
            customerApp: customerAppLanguage,
            agentInterface: agentInterfaceLanguage,
            rtlSupport,
            locale: getLocaleFromLanguage(customerAppLanguage)
          };
          
          // Update name and company if available
          if (typeformResults.business_name) {
            config.name = typeformResults.business_name;
          }
          if (typeformResults.industry) {
            config.industry = typeformResults.industry.toLowerCase().replace(/\s+/g, '-');
          }
          
        } catch (error) {
          console.log(`No Typeform data found for ${slug}, using default config`);
        }
      } catch (error) {
        console.log(`Error loading Typeform data for ${slug}:`, error);
      }
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching customer config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer configuration' },
      { status: 500 }
    );
  }
}

// Helper function to get locale from language
function getLocaleFromLanguage(language: string): string {
  const localeMap: Record<string, string> = {
    'English': 'en-US',
    'Hebrew (עברית)': 'he-IL',
    'Spanish (Español)': 'es-ES',
    'French (Français)': 'fr-FR',
    'German (Deutsch)': 'de-DE',
    'Arabic (العربية)': 'ar-SA',
    'Chinese (中文)': 'zh-CN',
    'Japanese (日本語)': 'ja-JP',
    'Korean (한국어)': 'ko-KR',
    'Russian (Русский)': 'ru-RU',
    'Portuguese (Português)': 'pt-BR',
    'Italian (Italiano)': 'it-IT',
    'Dutch (Nederlands)': 'nl-NL'
  };
  
  return localeMap[language] || 'en-US';
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    
    // Update customer configuration
    const updatedConfig = {
      ...CUSTOMER_CONFIGS[slug],
      ...body
    };
    
    // Save updated configuration
    const configPath = `data/customers/${slug}/config.json`;
    const fs = await import('fs/promises');
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
    
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating customer config:', error);
    return NextResponse.json(
      { error: 'Failed to update customer configuration' },
      { status: 500 }
    );
  }
}
