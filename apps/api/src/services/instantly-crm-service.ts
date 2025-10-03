import axios from 'axios';

export class InstantlyCRMService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env['INSTANTLY_API_KEY'] || 'ZjAwMDhhN2EtNjM1YS00MTBiLTlkNjItMTY5MDA1NWVhMWMzOmVZTnloeHVqQVRyVA==';
    this.apiUrl = process.env['INSTANTLY_API_URL'] || 'https://api.instantly.ai/api/v1';
  }

  /**
   * Create contact in instantly.ai CRM
   */
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
    try {
      const response = await axios.post(`${this.apiUrl}/contacts/create`, {
        email: contactData.email,
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        company: contactData.company,
        title: contactData.title,
        phone: contactData.phone,
        location: contactData.location,
        source: contactData.source,
        tags: contactData.tags || [],
        custom_fields: contactData.customFields || {}
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        contactId: response.data.id,
        contact: response.data
      };

    } catch (error) {
      console.error('Error creating contact in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Create multiple contacts in batch
   */
  async createContactsBatch(contacts: Array<{
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
  }>) {
    try {
      const response = await axios.post(`${this.apiUrl}/contacts/create-batch`, {
        contacts: contacts
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        createdCount: response.data.created_count,
        failedCount: response.data.failed_count,
        contacts: response.data.contacts
      };

    } catch (error) {
      console.error('Error creating contacts batch in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Update contact in instantly.ai CRM
   */
  async updateContact(contactId: string, updateData: {
    first_name?: string;
    last_name?: string;
    company?: string;
    title?: string;
    phone?: string;
    location?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) {
    try {
      const response = await axios.put(`${this.apiUrl}/contacts/${contactId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        contact: response.data
      };

    } catch (error) {
      console.error('Error updating contact in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Get contact from instantly.ai CRM
   */
  async getContact(contactId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/contacts/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        contact: response.data
      };

    } catch (error) {
      console.error('Error getting contact from instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Search contacts in instantly.ai CRM
   */
  async searchContacts(searchParams: {
    email?: string;
    company?: string;
    tags?: string[];
    source?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const response = await axios.get(`${this.apiUrl}/contacts/search`, {
        params: searchParams,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        contacts: response.data.contacts,
        total: response.data.total,
        hasMore: response.data.has_more
      };

    } catch (error) {
      console.error('Error searching contacts in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Create campaign in instantly.ai
   */
  async createCampaign(campaignData: {
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
    try {
      const response = await axios.post(`${this.apiUrl}/campaign/create`, campaignData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        campaignId: response.data.id,
        campaign: response.data
      };

    } catch (error) {
      console.error('Error creating campaign in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Add leads to campaign
   */
  async addLeadsToCampaign(campaignId: string, leads: Array<{
    email: string;
    first_name: string;
    last_name: string;
    company?: string;
    title?: string;
    phone?: string;
    location?: string;
    source?: string;
    customFields?: Record<string, any>;
  }>) {
    try {
      const response = await axios.post(`${this.apiUrl}/campaign/${campaignId}/leads/add`, {
        leads: leads
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        addedCount: response.data.added_count,
        failedCount: response.data.failed_count,
        leads: response.data.leads
      };

    } catch (error) {
      console.error('Error adding leads to campaign in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Start campaign
   */
  async startCampaign(campaignId: string) {
    try {
      const response = await axios.post(`${this.apiUrl}/campaign/${campaignId}/start`, {}, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        status: response.data.status
      };

    } catch (error) {
      console.error('Error starting campaign in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string) {
    try {
      const response = await axios.post(`${this.apiUrl}/campaign/${campaignId}/pause`, {}, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        status: response.data.status
      };

    } catch (error) {
      console.error('Error pausing campaign in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Get campaign status
   */
  async getCampaignStatus(campaignId: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/campaign/${campaignId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        status: response.data.status,
        stats: response.data.stats
      };

    } catch (error) {
      console.error('Error getting campaign status from instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string, dateRange?: {
    start_date: string;
    end_date: string;
  }) {
    try {
      const params = dateRange ? { ...dateRange } : {};
      const response = await axios.get(`${this.apiUrl}/campaign/${campaignId}/analytics`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        analytics: response.data
      };

    } catch (error) {
      console.error('Error getting campaign analytics from instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Create sequence in instantly.ai
   */
  async createSequence(sequenceData: {
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
    try {
      const response = await axios.post(`${this.apiUrl}/sequences/create`, sequenceData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        sequenceId: response.data.id,
        sequence: response.data
      };

    } catch (error) {
      console.error('Error creating sequence in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Add contacts to sequence
   */
  async addContactsToSequence(sequenceId: string, contacts: Array<{
    email: string;
    first_name: string;
    last_name: string;
    company?: string;
    title?: string;
    phone?: string;
    location?: string;
    source?: string;
  }>) {
    try {
      const response = await axios.post(`${this.apiUrl}/sequences/${sequenceId}/contacts/add`, {
        contacts: contacts
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        addedCount: response.data.added_count,
        failedCount: response.data.failed_count
      };

    } catch (error) {
      console.error('Error adding contacts to sequence in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Get sequence analytics
   */
  async getSequenceAnalytics(sequenceId: string, dateRange?: {
    start_date: string;
    end_date: string;
  }) {
    try {
      const params = dateRange ? { ...dateRange } : {};
      const response = await axios.get(`${this.apiUrl}/sequences/${sequenceId}/analytics`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        analytics: response.data
      };

    } catch (error) {
      console.error('Error getting sequence analytics from instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Create custom field in instantly.ai
   */
  async createCustomField(fieldData: {
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    options?: string[];
    required?: boolean;
  }) {
    try {
      const response = await axios.post(`${this.apiUrl}/custom-fields/create`, fieldData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        fieldId: response.data.id,
        field: response.data
      };

    } catch (error) {
      console.error('Error creating custom field in instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo() {
    try {
      const response = await axios.get(`${this.apiUrl}/account/info`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        account: response.data
      };

    } catch (error) {
      console.error('Error getting account info from instantly.ai:', error);
      throw error;
    }
  }

  /**
   * Get account usage and limits
   */
  async getAccountUsage() {
    try {
      const response = await axios.get(`${this.apiUrl}/account/usage`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        usage: response.data
      };

    } catch (error) {
      console.error('Error getting account usage from instantly.ai:', error);
      throw error;
    }
  }
}
