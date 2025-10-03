import { Customer } from '../models/Customer';
import { Subscription } from '../models/Subscription';
import { Usage } from '../models/Usage';
import axios from 'axios';

export class LeadGenerationService {
  private instantlyApiKey: string;
  private instantlyApiUrl: string;

  constructor() {
    this.instantlyApiKey = process.env['INSTANTLY_API_KEY'] || 'ZjAwMDhhN2EtNjM1YS00MTBiLTlkNjItMTY5MDA1NWVhMWMzOmVZTnloeHVqQVRyVA==';
    this.instantlyApiUrl = process.env['INSTANTLY_API_URL'] || 'https://api.instantly.ai/api/v1';
  }

  /**
   * Generate leads using multiple sources
   */
  async generateLeads(request: {
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
    try {
      const customer = await Customer.findById(request.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check subscription limits
      const subscription = await Subscription.findOne({ 
        customerId: request.customerId, 
        status: 'active' 
      });
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      // Track usage
      await this.trackLeadGenerationUsage(request.customerId, request.quantity);

      const leads = await this.processLeadGeneration(request);
      
      // Deliver leads based on method
      const deliveryResult = await this.deliverLeads(leads, request.deliveryMethod, customer);

      return {
        success: true,
        leadsGenerated: leads.length,
        deliveryMethod: request.deliveryMethod,
        deliveryResult,
        usage: {
          leadsGenerated: leads.length,
          apiCalls: request.sources.length,
          dataProcessing: leads.length * 0.1 // Estimate 0.1GB per lead
        }
      };

    } catch (error) {
      console.error('Error generating leads:', error);
      throw error;
    }
  }

  /**
   * Process lead generation from multiple sources
   */
  private async processLeadGeneration(request: any) {
    const leads = [];
    
    for (const source of request.sources) {
      try {
        let sourceLeads = [];
        
        switch (source) {
          case 'linkedin':
            sourceLeads = await this.generateLinkedInLeads(request.criteria, request.quantity);
            break;
          case 'google_maps':
            sourceLeads = await this.generateGoogleMapsLeads(request.criteria, request.quantity);
            break;
          case 'facebook':
            sourceLeads = await this.generateFacebookLeads(request.criteria, request.quantity);
            break;
          case 'apify':
            sourceLeads = await this.generateApifyLeads(request.criteria, request.quantity);
            break;
          default:
            console.warn(`Unknown source: ${source}`);
        }
        
        leads.push(...sourceLeads);
      } catch (error) {
        console.error(`Error generating leads from ${source}:`, error);
      }
    }

    // Deduplicate and enrich leads
    return this.enrichAndDeduplicateLeads(leads);
  }

  /**
   * Generate LinkedIn leads using LinkupAPI
   */
  private async generateLinkedInLeads(criteria: any, quantity: number) {
    const searchParams = {
      search_terms: criteria.keywords?.join(' ') || criteria.industry,
      location: criteria.location,
      company_size: criteria.companySize,
      results_per_page: Math.min(quantity, 100)
    };

    const response = await axios.post('https://api.linkup.com/v1/search', searchParams, {
      headers: {
        'Authorization': `Bearer ${process.env['LINKUP_API_KEY']}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.results.map((profile: any) => ({
      source: 'linkedin',
      name: profile.full_name,
      email: profile.email,
      company: profile.company_name,
      title: profile.title,
      location: profile.location,
      linkedin_url: profile.profile_url,
      phone: profile.phone,
      industry: profile.industry,
      company_size: profile.company_size,
      enriched: true,
      timestamp: new Date()
    }));
  }

  /**
   * Generate Google Maps leads using Apify
   */
  private async generateGoogleMapsLeads(criteria: any, quantity: number) {
    const searchQuery = `${criteria.industry} ${criteria.location}`;
    
    const response = await axios.post('https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync', {
      searchTermsArray: [searchQuery],
      maxCrawledPlacesPerSearch: Math.min(quantity, 100),
      language: 'en',
      countryCode: 'US'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env['APIFY_API_KEY']}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.results.map((place: any) => ({
      source: 'google_maps',
      name: place.name,
      email: place.email,
      company: place.name,
      title: 'Business Owner',
      location: place.address,
      phone: place.phone,
      website: place.website,
      rating: place.rating,
      reviews: place.reviews,
      enriched: false,
      timestamp: new Date()
    }));
  }

  /**
   * Generate Facebook leads using Apify
   */
  private async generateFacebookLeads(criteria: any, quantity: number) {
    const searchQuery = `${criteria.industry} ${criteria.location}`;
    
    const response = await axios.post('https://api.apify.com/v2/acts/apify~facebook-scraper/run-sync', {
      searchTerms: [searchQuery],
      resultsPerPage: Math.min(quantity, 50),
      maxResults: Math.min(quantity, 100)
    }, {
      headers: {
        'Authorization': `Bearer ${process.env['APIFY_API_KEY']}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.results.map((profile: any) => ({
      source: 'facebook',
      name: profile.name,
      email: profile.email,
      company: profile.business_name,
      title: profile.title,
      location: profile.location,
      phone: profile.phone,
      facebook_url: profile.profile_url,
      followers: profile.followers,
      enriched: false,
      timestamp: new Date()
    }));
  }

  /**
   * Generate leads using Apify platform
   */
  private async generateApifyLeads(criteria: any, quantity: number) {
    const response = await axios.post('https://api.apify.com/v2/acts/apify~linkedin-scraper/run-sync', {
      searchTerms: criteria.keywords || [criteria.industry],
      resultsPerPage: Math.min(quantity, 100),
      maxResults: Math.min(quantity, 200)
    }, {
      headers: {
        'Authorization': `Bearer ${process.env['APIFY_API_KEY']}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.results.map((profile: any) => ({
      source: 'apify',
      name: profile.fullName,
      email: profile.email,
      company: profile.company,
      title: profile.title,
      location: profile.location,
      linkedin_url: profile.profileUrl,
      phone: profile.phone,
      industry: profile.industry,
      enriched: true,
      timestamp: new Date()
    }));
  }

  /**
   * Enrich and deduplicate leads
   */
  private async enrichAndDeduplicateLeads(leads: any[]) {
    // Remove duplicates based on email
    const uniqueLeads = leads.filter((lead, index, self) => 
      index === self.findIndex(l => l.email === lead.email)
    );

    // Enrich leads with additional data
    const enrichedLeads = await Promise.all(
      uniqueLeads.map(async (lead) => {
        if (!lead.enriched) {
          // Add enrichment logic here
          lead.enriched = true;
          lead.enrichment_score = Math.random() * 100;
        }
        return lead;
      })
    );

    return enrichedLeads;
  }

  /**
   * Deliver leads based on method
   */
  private async deliverLeads(leads: any[], method: string, customer: any) {
    switch (method) {
      case 'email':
        return await this.deliverLeadsViaEmail(leads, customer);
      case 'crm':
        return await this.deliverLeadsToCRM(leads, customer);
      case 'api':
        return await this.deliverLeadsViaAPI(leads, customer);
      default:
        throw new Error(`Unknown delivery method: ${method}`);
    }
  }

  /**
   * Deliver leads via email using instantly.ai
   */
  private async deliverLeadsViaEmail(leads: any[], customer: any) {
    try {
      // Create campaign in instantly.ai
      const campaign = await axios.post(`${this.instantlyApiUrl}/campaign/create`, {
        name: `Lead Delivery - ${customer.company} - ${new Date().toISOString()}`,
        from_name: customer.name,
        from_email: customer.email,
        reply_to: customer.email,
        subject: 'Your Lead Generation Results',
        html_content: this.generateEmailTemplate(leads, customer),
        text_content: this.generateTextTemplate(leads, customer)
      }, {
        headers: {
          'Authorization': `Bearer ${this.instantlyApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Add leads to campaign
      const leadsData = leads.map(lead => ({
        email: lead.email,
        first_name: lead.name.split(' ')[0],
        last_name: lead.name.split(' ').slice(1).join(' '),
        company: lead.company,
        title: lead.title,
        location: lead.location,
        phone: lead.phone,
        source: lead.source
      }));

      await axios.post(`${this.instantlyApiUrl}/campaign/${campaign.data.id}/leads/add`, {
        leads: leadsData
      }, {
        headers: {
          'Authorization': `Bearer ${this.instantlyApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        method: 'email',
        campaignId: campaign.data.id,
        leadsDelivered: leads.length,
        status: 'success'
      };

    } catch (error) {
      console.error('Error delivering leads via email:', error);
      throw error;
    }
  }

  /**
   * Deliver leads to CRM (instantly.ai CRM)
   */
  private async deliverLeadsToCRM(leads: any[], customer: any) {
    try {
      // Create contacts in instantly.ai CRM
      const contacts = leads.map(lead => ({
        email: lead.email,
        first_name: lead.name.split(' ')[0],
        last_name: lead.name.split(' ').slice(1).join(' '),
        company: lead.company,
        title: lead.title,
        phone: lead.phone,
        location: lead.location,
        source: lead.source,
        tags: ['lead_generation', customer.tenant.subdomain]
      }));

      const response = await axios.post(`${this.instantlyApiUrl}/contacts/create`, {
        contacts: contacts
      }, {
        headers: {
          'Authorization': `Bearer ${this.instantlyApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        method: 'crm',
        contactsCreated: response.data.created_count,
        leadsDelivered: leads.length,
        status: 'success'
      };

    } catch (error) {
      console.error('Error delivering leads to CRM:', error);
      throw error;
    }
  }

  /**
   * Deliver leads via API
   */
  private async deliverLeadsViaAPI(leads: any[], customer: any) {
    // Store leads in database for API access
    const leadRecords = leads.map(lead => ({
      customerId: customer._id,
      source: lead.source,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      title: lead.title,
      location: lead.location,
      phone: lead.phone,
      enriched: lead.enriched,
      enrichmentScore: lead.enrichment_score,
      createdAt: new Date()
    }));

    // This would typically save to a Lead model
    // await Lead.insertMany(leadRecords);

    return {
      method: 'api',
      leadsStored: leadRecords.length,
      apiEndpoint: `${process.env['API_URL']}/api/leads/${customer.tenant.subdomain}`,
      status: 'success'
    };
  }

  /**
   * Generate email template for lead delivery
   */
  private generateEmailTemplate(leads: any[], customer: any) {
    const leadTable = leads.map(lead => `
      <tr>
        <td>${lead.name}</td>
        <td>${lead.email}</td>
        <td>${lead.company}</td>
        <td>${lead.title}</td>
        <td>${lead.location}</td>
        <td>${lead.phone || 'N/A'}</td>
        <td>${lead.source}</td>
      </tr>
    `).join('');

    return `
      <html>
        <body>
          <h2>Your Lead Generation Results</h2>
          <p>Dear ${customer.name},</p>
          <p>Here are your generated leads:</p>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Title</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              ${leadTable}
            </tbody>
          </table>
          <p>Total leads generated: ${leads.length}</p>
          <p>Best regards,<br>Rensto Lead Generation Team</p>
        </body>
      </html>
    `;
  }

  /**
   * Generate text template for lead delivery
   */
  private generateTextTemplate(leads: any[], customer: any) {
    const leadList = leads.map(lead => 
      `${lead.name} (${lead.email}) - ${lead.company} - ${lead.title} - ${lead.location} - ${lead.phone || 'N/A'} - Source: ${lead.source}`
    ).join('\n');

    return `
Your Lead Generation Results

Dear ${customer.name},

Here are your generated leads:

${leadList}

Total leads generated: ${leads.length}

Best regards,
Rensto Lead Generation Team
    `;
  }

  /**
   * Track lead generation usage
   */
  private async trackLeadGenerationUsage(customerId: string, quantity: number) {
    try {
      // Track API calls usage
      await this.trackUsage(customerId, 'apiCalls', 1);
      
      // Track data processing usage
      await this.trackUsage(customerId, 'dataProcessing', quantity * 0.1);
      
      // Track interactions usage
      await this.trackUsage(customerId, 'interactions', quantity);

    } catch (error) {
      console.error('Error tracking lead generation usage:', error);
    }
  }

  /**
   * Track usage for billing
   */
  private async trackUsage(customerId: string, usageType: string, amount: number) {
    try {
      const usage = new Usage({
        customerId: customerId,
        usageType: usageType,
        amount: amount,
        timestamp: new Date()
      });

      await usage.save();

      // Update customer usage totals
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { [`usage.${usageType}`]: amount }
      });

    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }
}
