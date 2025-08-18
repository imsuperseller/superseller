/**
 * n8n Integration Service
 * 
 * Implements comprehensive n8n workflow integration for live agent data
 * Following BMAD methodology: BUILD phase of TASK 3
 */

// n8n configuration
export const N8N_CONFIG = {
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || '',
  webhookSecret: process.env.N8N_WEBHOOK_SECRET || '',
  timeout: 30000, // 30 seconds
};

// n8n workflow status
export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  RUNNING = 'running',
  STOPPED = 'stopped',
}

// n8n execution status
export enum ExecutionStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  RUNNING = 'running',
  WAITING = 'waiting',
  CANCELED = 'canceled',
}

// n8n workflow interface
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings: Record<string, any>;
  tags: string[];
  versionId: string;
  createdAt: string;
  updatedAt: string;
}

// n8n node interface
export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  webhookId?: string;
  credentials?: Record<string, any>;
}

// n8n execution interface
export interface N8nExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt?: string;
  data: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
  mode: 'manual' | 'trigger' | 'webhook';
  retryOf?: string;
  retrySuccess?: boolean;
  waitTill?: string;
  finished: boolean;
  executionTime: number;
}

// n8n webhook interface
export interface N8nWebhook {
  id: string;
  name: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  node: string;
  workflowId: string;
  authentication: 'none' | 'genericCredentialType' | 'predefinedCredentialType';
  isActive: boolean;
}

class N8nService {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.baseUrl = N8N_CONFIG.baseUrl;
    this.apiKey = N8N_CONFIG.apiKey;
    this.webhookSecret = N8N_CONFIG.webhookSecret;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-N8N-API-KEY'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Make authenticated request to n8n
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(N8N_CONFIG.timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const workflows = await this.makeRequest<N8nWorkflow[]>('/workflows');
      return workflows.filter(workflow => workflow.active);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw new Error('Failed to fetch workflows');
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    try {
      return await this.makeRequest<N8nWorkflow>(`/workflows/${id}`);
    } catch (error) {
      console.error(`Error fetching workflow ${id}:`, error);
      throw new Error(`Failed to fetch workflow ${id}`);
    }
  }

  /**
   * Create new workflow
   */
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    try {
      return await this.makeRequest<N8nWorkflow>('/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow),
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    try {
      return await this.makeRequest<N8nWorkflow>(`/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(workflow),
      });
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      throw new Error(`Failed to update workflow ${id}`);
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(id: string): Promise<void> {
    try {
      await this.makeRequest(`/workflows/${id}/activate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error(`Error activating workflow ${id}:`, error);
      throw new Error(`Failed to activate workflow ${id}`);
    }
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(id: string): Promise<void> {
    try {
      await this.makeRequest(`/workflows/${id}/deactivate`, {
        method: 'POST',
      });
    } catch (error) {
      console.error(`Error deactivating workflow ${id}:`, error);
      throw new Error(`Failed to deactivate workflow ${id}`);
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    try {
      await this.makeRequest(`/workflows/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      throw new Error(`Failed to delete workflow ${id}`);
    }
  }

  /**
   * Get workflow executions
   */
  async getExecutions(
    workflowId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<N8nExecution[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (workflowId) {
        params.append('workflowId', workflowId);
      }

      return await this.makeRequest<N8nExecution[]>(`/executions?${params}`);
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw new Error('Failed to fetch executions');
    }
  }

  /**
   * Get execution by ID
   */
  async getExecution(id: string): Promise<N8nExecution> {
    try {
      return await this.makeRequest<N8nExecution>(`/executions/${id}`);
    } catch (error) {
      console.error(`Error fetching execution ${id}:`, error);
      throw new Error(`Failed to fetch execution ${id}`);
    }
  }

  /**
   * Trigger workflow execution
   */
  async triggerWorkflow(
    workflowId: string,
    data: Record<string, any> = {}
  ): Promise<N8nExecution> {
    try {
      return await this.makeRequest<N8nExecution>(`/workflows/${workflowId}/trigger`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Error triggering workflow ${workflowId}:`, error);
      throw new Error(`Failed to trigger workflow ${workflowId}`);
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(workflowId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecution?: N8nExecution;
  }> {
    try {
      const executions = await this.getExecutions(workflowId, 100);
      
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => e.status === ExecutionStatus.SUCCESS).length;
      const failedExecutions = executions.filter(e => e.status === ExecutionStatus.ERROR).length;
      const averageExecutionTime = executions.length > 0 
        ? executions.reduce((sum, e) => sum + e.executionTime, 0) / executions.length 
        : 0;
      const lastExecution = executions.length > 0 ? executions[0] : undefined;

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageExecutionTime,
        lastExecution,
      };
    } catch (error) {
      console.error(`Error getting workflow stats for ${workflowId}:`, error);
      throw new Error(`Failed to get workflow stats for ${workflowId}`);
    }
  }

  /**
   * Get webhooks for workflow
   */
  async getWebhooks(workflowId: string): Promise<N8nWebhook[]> {
    try {
      const webhooks = await this.makeRequest<N8nWebhook[]>('/webhooks');
      return webhooks.filter(webhook => webhook.workflowId === workflowId);
    } catch (error) {
      console.error(`Error fetching webhooks for workflow ${workflowId}:`, error);
      throw new Error(`Failed to fetch webhooks for workflow ${workflowId}`);
    }
  }

  /**
   * Create webhook for workflow
   */
  async createWebhook(webhook: Partial<N8nWebhook>): Promise<N8nWebhook> {
    try {
      return await this.makeRequest<N8nWebhook>('/webhooks', {
        method: 'POST',
        body: JSON.stringify(webhook),
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw new Error('Failed to create webhook');
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    try {
      await this.makeRequest(`/webhooks/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting webhook ${id}:`, error);
      throw new Error(`Failed to delete webhook ${id}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('No webhook secret configured, skipping signature verification');
      return true;
    }

    // Simple signature verification (in production, use crypto.verify)
    const expectedSignature = `sha256=${this.webhookSecret}`;
    return signature === expectedSignature;
  }

  /**
   * Get agent workflows (workflows tagged as agents)
   */
  async getAgentWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const workflows = await this.getWorkflows();
      return workflows.filter(workflow => 
        workflow.tags.includes('agent') || 
        workflow.name.toLowerCase().includes('agent')
      );
    } catch (error) {
      console.error('Error fetching agent workflows:', error);
      throw new Error('Failed to fetch agent workflows');
    }
  }

  /**
   * Get agent execution history
   */
  async getAgentExecutionHistory(
    agentId: string,
    limit: number = 20
  ): Promise<N8nExecution[]> {
    try {
      const executions = await this.getExecutions(agentId, limit);
      return executions.map(execution => ({
        ...execution,
        // Add agent-specific metadata
        agentId,
        agentName: execution.data?.agentName || 'Unknown Agent',
        inputData: execution.data?.input || {},
        outputData: execution.data?.output || {},
      }));
    } catch (error) {
      console.error(`Error fetching agent execution history for ${agentId}:`, error);
      throw new Error(`Failed to fetch agent execution history for ${agentId}`);
    }
  }

  /**
   * Trigger agent execution
   */
  async triggerAgent(
    agentId: string,
    inputData: Record<string, any> = {}
  ): Promise<N8nExecution> {
    try {
      return await this.triggerWorkflow(agentId, {
        agentId,
        agentName: 'Agent Execution',
        input: inputData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error triggering agent ${agentId}:`, error);
      throw new Error(`Failed to trigger agent ${agentId}`);
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(agentId: string): Promise<{
    totalRuns: number;
    successRate: number;
    averageExecutionTime: number;
    lastRun: string | null;
    errorRate: number;
    totalExecutionTime: number;
  }> {
    try {
      const stats = await this.getWorkflowStats(agentId);
      
      return {
        totalRuns: stats.totalExecutions,
        successRate: stats.totalExecutions > 0 
          ? (stats.successfulExecutions / stats.totalExecutions) * 100 
          : 0,
        averageExecutionTime: stats.averageExecutionTime,
        lastRun: stats.lastExecution?.startedAt || null,
        errorRate: stats.totalExecutions > 0 
          ? (stats.failedExecutions / stats.totalExecutions) * 100 
          : 0,
        totalExecutionTime: stats.totalExecutions * stats.averageExecutionTime,
      };
    } catch (error) {
      console.error(`Error getting agent metrics for ${agentId}:`, error);
      throw new Error(`Failed to get agent metrics for ${agentId}`);
    }
  }

  /**
   * Health check for n8n service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    workflows: number;
    activeWorkflows: number;
  }> {
    try {
      const workflows = await this.getWorkflows();
      const activeWorkflows = workflows.filter(w => w.active).length;

      return {
        status: 'healthy',
        message: 'n8n service is operational',
        workflows: workflows.length,
        activeWorkflows,
      };
    } catch (error) {
      console.error('n8n health check failed:', error);
      return {
        status: 'unhealthy',
        message: 'n8n service is not responding',
        workflows: 0,
        activeWorkflows: 0,
      };
    }
  }
}

// Export singleton instance
export const n8nService = new N8nService();

// Export types
export type { N8nWorkflow, N8nNode, N8nExecution, N8nWebhook };
