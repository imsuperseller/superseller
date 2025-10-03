import axios from 'axios';

export class AirtableApi {
  private apiKey: string;
  private baseId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AIRTABLE_API_KEY || '';
    this.baseId = process.env.AIRTABLE_BASE_ID || 'appWxram633ChhzyY';
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async getTemplates(params: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { category, search, sort, page = 1, limit = 12 } = params;
      
      let filterByFormula = '';
      if (category) {
        filterByFormula += `AND({Category} = "${category}")`;
      }
      if (search) {
        filterByFormula += `AND(SEARCH("${search}", {Name}) + SEARCH("${search}", {Description}))`;
      }

      const response = await axios.get(`${this.baseUrl}/tblTemplates`, {
        headers: this.getHeaders(),
        params: {
          filterByFormula: filterByFormula || undefined,
          sort: this.getSortFields(sort),
          pageSize: limit,
          offset: (page - 1) * limit
        }
      });

      return response.data.records.map((record: any) => ({
        id: record.id,
        name: record.fields.Name,
        description: record.fields.Description,
        category: record.fields.Category,
        price: record.fields.Price,
        rating: record.fields.Rating || 0,
        downloads: record.fields.Downloads || 0,
        features: record.fields.Features || [],
        installation: record.fields.Installation || false,
        popular: record.fields.Popular || false,
        image: record.fields.Image || null,
        version: record.fields.Version || '1.0.0',
        fileSize: record.fields.FileSize || 0
      }));

    } catch (error) {
      console.error('Airtable getTemplates error:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  async getTemplate(templateId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/tblTemplates/${templateId}`, {
        headers: this.getHeaders()
      });

      const record = response.data;
      return {
        id: record.id,
        name: record.fields.Name,
        description: record.fields.Description,
        category: record.fields.Category,
        price: record.fields.Price,
        rating: record.fields.Rating || 0,
        downloads: record.fields.Downloads || 0,
        features: record.fields.Features || [],
        installation: record.fields.Installation || false,
        popular: record.fields.Popular || false,
        image: record.fields.Image || null,
        version: record.fields.Version || '1.0.0',
        fileSize: record.fields.FileSize || 0,
        content: record.fields.Content || null
      };

    } catch (error) {
      console.error('Airtable getTemplate error:', error);
      throw new Error('Failed to fetch template');
    }
  }

  async createTemplate(templateData: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/tblTemplates`, {
        fields: {
          Name: templateData.name,
          Description: templateData.description,
          Category: templateData.category,
          Price: templateData.price,
          Features: templateData.features || [],
          Installation: templateData.installation || false,
          Popular: templateData.popular || false,
          Version: templateData.version || '1.0.0',
          FileSize: templateData.fileSize || 0,
          Content: templateData.content || null
        }
      }, {
        headers: this.getHeaders()
      });

      return response.data;

    } catch (error) {
      console.error('Airtable createTemplate error:', error);
      throw new Error('Failed to create template');
    }
  }

  async logDownload(downloadData: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/tblDownloads`, {
        fields: {
          'Template ID': downloadData.templateId,
          'User ID': downloadData.userId,
          'Payment Intent ID': downloadData.paymentIntentId,
          'Download Link': downloadData.downloadLink,
          'Timestamp': downloadData.timestamp,
          'Status': '🆕 New Download'
        }
      }, {
        headers: this.getHeaders()
      });

      return response.data;

    } catch (error) {
      console.error('Airtable logDownload error:', error);
      throw new Error('Failed to log download');
    }
  }

  async getUserDownloads(userId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/tblDownloads`, {
        headers: this.getHeaders(),
        params: {
          filterByFormula: `{User ID} = "${userId}"`,
          sort: [{ field: 'Timestamp', direction: 'desc' }]
        }
      });

      return response.data.records.map((record: any) => ({
        id: record.id,
        templateId: record.fields['Template ID'],
        userId: record.fields['User ID'],
        downloadLink: record.fields['Download Link'],
        timestamp: record.fields['Timestamp'],
        status: record.fields['Status']
      }));

    } catch (error) {
      console.error('Airtable getUserDownloads error:', error);
      throw new Error('Failed to fetch user downloads');
    }
  }

  private getSortFields(sort?: string) {
    switch (sort) {
      case 'popular':
        return [{ field: 'Downloads', direction: 'desc' }];
      case 'newest':
        return [{ field: 'Created', direction: 'desc' }];
      case 'price-low':
        return [{ field: 'Price', direction: 'asc' }];
      case 'price-high':
        return [{ field: 'Price', direction: 'desc' }];
      case 'rating':
        return [{ field: 'Rating', direction: 'desc' }];
      default:
        return [{ field: 'Downloads', direction: 'desc' }];
    }
  }
}
