// Lead Generation API Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rensto.com';

export class LeadGenerationAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_API_KEY || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Generate leads
  async generateLeads(data: {
    customerId: string;
    sources: string[];
    criteria: {
      industry?: string;
      location?: string;
      companySize?: string;
      keywords?: string[];
    };
    quantity: number;
    deliveryMethod: 'email' | 'crm' | 'api';
  }) {
    return this.request('/api/lead-generation/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get analytics
  async getAnalytics(customerId: string, period: string = '30d') {
    return this.request(`/api/lead-generation/analytics/${customerId}?period=${period}`);
  }

  // Create campaign
  async createCampaign(data: {
    name: string;
    from_name: string;
    from_email: string;
    reply_to: string;
    subject: string;
    html_content: string;
    text_content: string;
    schedule_time?: string;
    timezone?: string;
  }) {
    return this.request('/api/lead-generation/campaigns/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add leads to campaign
  async addLeadsToCampaign(campaignId: string, leads: any[]) {
    return this.request(`/api/lead-generation/campaigns/${campaignId}/leads`, {
      method: 'POST',
      body: JSON.stringify({ leads }),
    });
  }

  // Start campaign
  async startCampaign(campaignId: string) {
    return this.request(`/api/lead-generation/campaigns/${campaignId}/start`, {
      method: 'POST',
    });
  }

  // Get campaign status
  async getCampaignStatus(campaignId: string) {
    return this.request(`/api/lead-generation/campaigns/${campaignId}/status`);
  }

  // Get campaign analytics
  async getCampaignAnalytics(campaignId: string, dateRange?: { start_date: string; end_date: string }) {
    const params = dateRange ? `?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}` : '';
    return this.request(`/api/lead-generation/campaigns/${campaignId}/analytics${params}`);
  }

  // Create sequence
  async createSequence(data: {
    name: string;
    steps: Array<{
      step_number: number;
      subject: string;
      html_content: string;
      text_content: string;
      delay_days: number;
      delay_hours: number;
    }>;
  }) {
    return this.request('/api/lead-generation/sequences/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add contacts to sequence
  async addContactsToSequence(sequenceId: string, contacts: any[]) {
    return this.request(`/api/lead-generation/sequences/${sequenceId}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ contacts }),
    });
  }

  // Create contact
  async createContact(contactData: {
    email: string;
    first_name: string;
    last_name: string;
    company?: string;
    title?: string;
    phone?: string;
    location?: string;
    source?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) {
    return this.request('/api/lead-generation/contacts/create', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Create contacts batch
  async createContactsBatch(contacts: any[]) {
    return this.request('/api/lead-generation/contacts/create-batch', {
      method: 'POST',
      body: JSON.stringify({ contacts }),
    });
  }

  // Search contacts
  async searchContacts(searchParams: {
    email?: string;
    company?: string;
    tags?: string[];
    source?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return this.request(`/api/lead-generation/contacts/search?${params.toString()}`);
  }

  // Track usage
  async trackUsage(customerId: string, usageData: {
    interactions?: number;
    apiCalls?: number;
    dataProcessing?: number;
    storage?: number;
    leadGeneration?: number;
    crmContacts?: number;
    emailCampaigns?: number;
  }) {
    return this.request('/api/lead-generation/usage/track', {
      method: 'POST',
      body: JSON.stringify({ customerId, usageData }),
    });
  }

  // Get account info
  async getAccountInfo() {
    return this.request('/api/lead-generation/account/info');
  }

  // Get account usage
  async getAccountUsage() {
    return this.request('/api/lead-generation/account/usage');
  }

  // Get system analytics
  async getSystemAnalytics(period: string = '30d') {
    return this.request(`/api/lead-generation/analytics/system?period=${period}`);
  }
}

// Export singleton instance
export const leadGenerationAPI = new LeadGenerationAPI();
