// import { getSession } from 'next-auth/react';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
};

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config = API_CONFIG) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retries = config.retries;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = await this.getAuthHeaders();
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: AbortSignal.timeout(this.timeout),
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429 && retryCount < this.retries) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * (retryCount + 1);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        // Handle authentication errors
        if (response.status === 401) {
          // Redirect to login or refresh token
          window.location.href = '/login';
          throw new Error('Authentication required');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (retryCount < this.retries && this.isRetryableError(error)) {
        const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private isRetryableError(error: unknown): boolean {
    // Network errors, 5xx server errors, and timeouts are retryable
    return (
      error.name === 'TypeError' || // Network error
      error.name === 'AbortError' || // Timeout
      (error.status >= 500 && error.status < 600) // Server error
    );
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Organization APIs
  async getOrganization(slug: string) {
    return this.get(`/organizations/${slug}`);
  }

  async updateOrganization(slug: string, data: unknown) {
    return this.put(`/organizations/${slug}`, data);
  }

  async getOrganizationAgents(slug: string) {
    return this.get(`/organizations/${slug}/agents`);
  }

  async createOrganizationAgent(slug: string, agentData: unknown) {
    return this.post(`/organizations/${slug}/agents`, agentData);
  }

  // Agent APIs
  async getAgents() {
    return this.get('/n8n/agents');
  }

  async getAgent(id: string) {
    return this.get(`/n8n/agents/${id}`);
  }

  async updateAgent(id: string, data: unknown) {
    return this.put(`/n8n/agents/${id}`, data);
  }

  async deleteAgent(id: string) {
    return this.delete(`/n8n/agents/${id}`);
  }

  async triggerAgent(id: string, inputData?: unknown) {
    return this.post(`/n8n/agents/${id}/trigger`, inputData);
  }

  async getAgentMetrics(id: string) {
    return this.get(`/n8n/agents/${id}/metrics`);
  }

  // n8n APIs
  async getN8nWorkflows() {
    return this.get('/n8n/workflows');
  }

  async createN8nWorkflow(workflowData: unknown) {
    return this.post('/n8n/workflows', workflowData);
  }

  async getN8nHealth() {
    return this.get('/n8n/health');
  }

  // System APIs
  async getSystemHealth() {
    return this.get('/health');
  }

  // User Management APIs
  async getUsers() {
    return this.get('/users');
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id: string, data: unknown) {
    return this.put(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  // Analytics APIs
  async getAnalytics(orgId: string, dateRange?: string) {
    const params = dateRange ? { dateRange } : undefined;
    return this.get(`/analytics/${orgId}`, params);
  }

  async getKPIs(orgId: string) {
    return this.get(`/analytics/${orgId}/kpis`);
  }

  // Data Source APIs
  async getDataSources(orgId: string) {
    return this.get(`/datasources/${orgId}`);
  }

  async connectDataSource(orgId: string, dataSourceData: unknown) {
    return this.post(`/datasources/${orgId}`, dataSourceData);
  }

  async testDataSource(orgId: string, dataSourceId: string) {
    return this.post(`/datasources/${orgId}/${dataSourceId}/test`);
  }

  // Event APIs
  async getEvents(orgId: string, filters?: unknown) {
    return this.get(`/events/${orgId}`, filters);
  }

  async createEvent(orgId: string, eventData: unknown) {
    return this.post(`/events/${orgId}`, eventData);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { ApiResponse, PaginatedResponse };
