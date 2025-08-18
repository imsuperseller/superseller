import { Agent } from '@/types/agent';
import { Customer } from '@/models/Customer';
import { Organization } from '@/models/Organization';

export interface SearchResult {
  type: 'agent' | 'customer' | 'organization' | 'file';
  id: string;
  title: string;
  description: string;
  url: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface SearchOptions {
  organizationId?: string;
  types?: string[];
  limit?: number;
  offset?: number;
}

class SearchService {
  async searchAgents(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      // This would typically use a search engine like Elasticsearch or Algolia
      // For now, we'll implement a simple text search
      const response = await fetch(`/api/agents?search=${encodeURIComponent(query)}&orgId=${options.organizationId || ''}`);
      const agents: Agent[] = await response.json();

      return agents.map(agent => ({
        type: 'agent' as const,
        id: agent._id,
        title: agent.name,
        description: agent.description,
        url: `/agents/${agent._id}`,
        score: this.calculateScore(query, agent.name, agent.description),
        metadata: {
          status: agent.status,
          tags: agent.tags,
          capabilities: agent.capabilities,
        },
      }));
    } catch (error) {
      console.error('Error searching agents:', error);
      return [];
    }
  }

  async searchCustomers(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}&orgId=${options.organizationId || ''}`);
      const customers: Customer[] = await response.json();

      return customers.map(customer => ({
        type: 'customer' as const,
        id: customer._id,
        title: customer.name,
        description: customer.email,
        url: `/customers/${customer._id}`,
        score: this.calculateScore(query, customer.name, customer.email),
        metadata: {
          company: customer.company,
          status: customer.status,
          plan: customer.plan,
        },
      }));
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  }

  async searchOrganizations(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const response = await fetch(`/api/organizations?search=${encodeURIComponent(query)}`);
      const organizations: Organization[] = await response.json();

      return organizations.map(org => ({
        type: 'organization' as const,
        id: org._id,
        title: org.name,
        description: org.slug,
        url: `/organizations/${org.slug}`,
        score: this.calculateScore(query, org.name, org.slug),
        metadata: {
          status: org.status,
          subscriptionTier: org.subscriptionTier,
        },
      }));
    } catch (error) {
      console.error('Error searching organizations:', error);
      return [];
    }
  }

  async searchFiles(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const response = await fetch(`/api/files?search=${encodeURIComponent(query)}&orgId=${options.organizationId || ''}`);
      const files = await response.json();

      return files.map((file: unknown) => ({
        type: 'file' as const,
        id: file.id,
        title: file.name,
        description: `${file.type} file (${this.formatFileSize(file.size)})`,
        url: `/api/files/${file.id}`,
        score: this.calculateScore(query, file.name),
        metadata: {
          size: file.size,
          type: file.type,
          uploadedAt: file.uploadedAt,
        },
      }));
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  async globalSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Search across all types
    const searchPromises = [];

    if (!options.types || options.types.includes('agent')) {
      searchPromises.push(this.searchAgents(query, options));
    }

    if (!options.types || options.types.includes('customer')) {
      searchPromises.push(this.searchCustomers(query, options));
    }

    if (!options.types || options.types.includes('organization')) {
      searchPromises.push(this.searchOrganizations(query, options));
    }

    if (!options.types || options.types.includes('file')) {
      searchPromises.push(this.searchFiles(query, options));
    }

    const searchResults = await Promise.all(searchPromises);
    
    // Combine and sort results by score
    searchResults.forEach(resultSet => {
      results.push(...resultSet);
    });

    // Sort by score (highest first) and apply limit/offset
    results.sort((a, b) => b.score - a.score);
    
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    return results.slice(offset, offset + limit);
  }

  private calculateScore(query: string, ...texts: string[]): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    texts.forEach(text => {
      const textLower = text.toLowerCase();
      
      // Exact match gets highest score
      if (textLower === queryLower) {
        score += 100;
      }
      // Starts with query
      else if (textLower.startsWith(queryLower)) {
        score += 50;
      }
      // Contains query
      else if (textLower.includes(queryLower)) {
        score += 25;
      }
      // Word boundary match
      else {
        const words = textLower.split(/\s+/);
        const queryWords = queryLower.split(/\s+/);
        
        queryWords.forEach(queryWord => {
          if (words.some(word => word.includes(queryWord))) {
            score += 10;
          }
        });
      }
    });

    return score;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const searchService = new SearchService();
