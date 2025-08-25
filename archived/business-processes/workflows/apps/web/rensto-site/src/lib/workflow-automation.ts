import { apiClient } from './api-client';
import { wsServer } from './websocket';

// Workflow automation types
export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'manual' | 'webhook';
  config: {
    cron?: string;
    eventType?: string;
    conditions?: Record<string, string | number | boolean>;
    webhookUrl?: string;
  };
}

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'condition' | 'delay' | 'notification' | 'data_sync' | 'api_call';
  name: string;
  config: {
    agentId?: string;
    condition?: string;
    delayMs?: number;
    notification?: {
      type: 'email' | 'sms' | 'push' | 'webhook';
      template: string;
      recipients: string[];
    };
    dataSync?: {
      source: string;
      target: string;
      operation: 'create' | 'update' | 'delete';
    };
    apiCall?: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      url: string;
      headers?: Record<string, string>;
      body?: unknown;
    };
  };
  onSuccess?: string; // Next step ID
  onFailure?: string; // Next step ID
  retryConfig?: {
    maxRetries: number;
    delayMs: number;
    backoffMultiplier: number;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  orgId: string;
  createdBy: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: Record<string, string | number | boolean>;
  metadata: {
    version: number;
    createdAt: Date;
    updatedAt: Date;
    lastExecuted?: Date;
    executionCount: number;
    successCount: number;
    failureCount: number;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  orgId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  stepResults: Record<string, unknown>;
  variables: Record<string, string | number | boolean>;
  startedAt: Date;
  completedAt?: Date;
  error?: {
    message: string;
    stepId?: string;
    stack?: string;
  };
}

// Workflow automation class
export class WorkflowAutomation {
  private workflows = new Map<string, Workflow>();
  private executions = new Map<string, WorkflowExecution>();
  private eventListeners = new Map<string, Function[]>();

  constructor() {
    this.initializeEventListeners();
  }

  // Initialize event listeners for workflow triggers
  private initializeEventListeners() {
    // Listen for agent execution events
    wsServer.on('agent_execution', (data) => {
      this.handleAgentExecutionEvent(data);
    });

    // Listen for system events
    wsServer.on('system_update', (data) => {
      this.handleSystemEvent(data);
    });

    // Listen for data sync events
    wsServer.on('data_sync', (data) => {
      this.handleDataSyncEvent(data);
    });
  }

  // Create a new workflow
  async createWorkflow(workflowData: Omit<Workflow, 'id' | 'metadata'>): Promise<Workflow> {
    const workflow: Workflow = {
      ...workflowData,
      id: this.generateId(),
      metadata: {
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
      },
    };

    this.workflows.set(workflow.id, workflow);
    
    // Set up triggers
    await this.setupWorkflowTriggers(workflow);
    
    return workflow;
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string, variables: Record<string, any> = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    const execution: WorkflowExecution = {
      id: this.generateId(),
      workflowId,
      orgId: workflow.orgId,
      status: 'running',
      stepResults: {},
      variables: { ...workflow.variables, ...variables },
      startedAt: new Date(),
    };

    this.executions.set(execution.id, execution);

    // Update workflow metadata
    workflow.metadata.executionCount++;
    workflow.metadata.lastExecuted = new Date();
    workflow.metadata.updatedAt = new Date();

    // Broadcast execution start
    wsServer.broadcast('workflow_execution', {
      workflowId,
      executionId: execution.id,
      status: 'started',
      orgId: workflow.orgId,
    });

    try {
      await this.executeWorkflowSteps(workflow, execution);
      execution.status = 'completed';
      execution.completedAt = new Date();
      workflow.metadata.successCount++;
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      };
      workflow.metadata.failureCount++;
    }

    // Broadcast execution completion
    wsServer.broadcast('workflow_execution', {
      workflowId,
      executionId: execution.id,
      status: execution.status,
      orgId: workflow.orgId,
    });

    return execution;
  }

  // Execute workflow steps
  private async executeWorkflowSteps(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    let currentStepId = workflow.steps[0]?.id;

    while (currentStepId) {
      const step = workflow.steps.find(s => s.id === currentStepId);
      if (!step) {
        throw new Error(`Step ${currentStepId} not found`);
      }

      execution.currentStep = currentStepId;

      try {
        const result = await this.executeStep(step, execution);
        execution.stepResults[currentStepId] = result;

        // Determine next step
        currentStepId = step.onSuccess;

      } catch (error) {
        execution.stepResults[currentStepId] = { error: error instanceof Error ? error.message : 'Unknown error' };

        // Handle retries
        if (step.retryConfig) {
          const retryCount = (execution.stepResults[currentStepId].retryCount || 0) + 1;
          if (retryCount <= step.retryConfig.maxRetries) {
            execution.stepResults[currentStepId].retryCount = retryCount;
            
            // Wait before retry
            await this.delay(step.retryConfig.delayMs * Math.pow(step.retryConfig.backoffMultiplier, retryCount - 1));
            continue; // Retry the same step
          }
        }

        // Move to failure step or throw error
        currentStepId = step.onFailure;
        if (!currentStepId) {
          throw error;
        }
      }
    }
  }

  // Execute a single workflow step
  private async executeStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    switch (step.type) {
      case 'agent':
        return this.executeAgentStep(step, execution);
      
      case 'condition':
        return this.executeConditionStep(step, execution);
      
      case 'delay':
        return this.executeDelayStep(step, execution);
      
      case 'notification':
        return this.executeNotificationStep(step, execution);
      
      case 'data_sync':
        return this.executeDataSyncStep(step, execution);
      
      case 'api_call':
        return this.executeApiCallStep(step, execution);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  // Execute agent step
  private async executeAgentStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    if (!step.config.agentId) {
      throw new Error('Agent ID required for agent step');
    }

    const response = await apiClient.triggerAgent(step.config.agentId, execution.variables);
    
    if (!response.success) {
      throw new Error(`Agent execution failed: ${response.error}`);
    }

    return response.data;
  }

  // Execute condition step
  private async executeConditionStep(step: WorkflowStep, execution: WorkflowExecution): Promise<boolean> {
    if (!step.config.condition) {
      throw new Error('Condition required for condition step');
    }

    // Simple condition evaluation (in production, use a proper expression evaluator)
    const condition = step.config.condition;
    const variables = execution.variables;
    
    // Replace variables in condition
    const evaluatedCondition = condition.replace(/\$\{(\w+)\}/g, (match, varName) => {
      return JSON.stringify(variables[varName]);
    });

    // Evaluate condition (simplified - use proper expression evaluator in production)
    return eval(evaluatedCondition);
  }

  // Execute delay step
  private async executeDelayStep(step: WorkflowStep, execution: WorkflowExecution): Promise<void> {
    const delayMs = step.config.delayMs || 1000;
    await this.delay(delayMs);
  }

  // Execute notification step
  private async executeNotificationStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    const notification = step.config.notification;
    if (!notification) {
      throw new Error('Notification config required for notification step');
    }

    // Send notification based on type
    switch (notification.type) {
      case 'email':
        return this.sendEmailNotification(notification, execution);
      
      case 'sms':
        return this.sendSmsNotification(notification, execution);
      
      case 'push':
        return this.sendPushNotification(notification, execution);
      
      case 'webhook':
        return this.sendWebhookNotification(notification, execution);
      
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
  }

  // Execute data sync step
  private async executeDataSyncStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    const dataSync = step.config.dataSync;
    if (!dataSync) {
      throw new Error('Data sync config required for data sync step');
    }

    // Implement data synchronization logic
    // This would typically involve syncing data between different systems
    return { synced: true, operation: dataSync.operation };
  }

  // Execute API call step
  private async executeApiCallStep(step: WorkflowStep, execution: WorkflowExecution): Promise<any> {
    const apiCall = step.config.apiCall;
    if (!apiCall) {
      throw new Error('API call config required for api call step');
    }

    const response = await fetch(apiCall.url, {
      method: apiCall.method,
      headers: apiCall.headers,
      body: apiCall.body ? JSON.stringify(apiCall.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Set up workflow triggers
  private async setupWorkflowTriggers(workflow: Workflow): Promise<void> {
    const { trigger } = workflow;

    switch (trigger.type) {
      case 'schedule':
        if (trigger.config.cron) {
          // Set up cron job (in production, use a proper cron library)
          this.setupCronTrigger(workflow.id, trigger.config.cron);
        }
        break;

      case 'event':
        if (trigger.config.eventType) {
          this.setupEventTrigger(workflow.id, trigger.config.eventType, trigger.config.conditions);
        }
        break;

      case 'webhook':
        if (trigger.config.webhookUrl) {
          this.setupWebhookTrigger(workflow.id, trigger.config.webhookUrl);
        }
        break;
    }
  }

  // Set up cron trigger
  private setupCronTrigger(workflowId: string, cronExpression: string): void {
    // In production, use a proper cron library like node-cron
    console.log(`Setting up cron trigger for workflow ${workflowId}: ${cronExpression}`);
  }

  // Set up event trigger
  private setupEventTrigger(workflowId: string, eventType: string, conditions?: Record<string, any>): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push((data: unknown) => {
      if (this.evaluateEventConditions(conditions, data)) {
        this.executeWorkflow(workflowId, { eventData: data });
      }
    });
    this.eventListeners.set(eventType, listeners);
  }

  // Set up webhook trigger
  private setupWebhookTrigger(workflowId: string, webhookUrl: string): void {
    // In production, this would set up a webhook endpoint
    console.log(`Setting up webhook trigger for workflow ${workflowId}: ${webhookUrl}`);
  }

  // Evaluate event conditions
  private evaluateEventConditions(conditions: Record<string, any> | undefined, data: unknown): boolean {
    if (!conditions) return true;

    // Simple condition evaluation (use proper expression evaluator in production)
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // Handle agent execution events
  private handleAgentExecutionEvent(data: unknown): void {
    const eventType = 'agent_execution';
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  // Handle system events
  private handleSystemEvent(data: unknown): void {
    const eventType = 'system_update';
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  // Handle data sync events
  private handleDataSyncEvent(data: unknown): void {
    const eventType = 'data_sync';
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Notification methods
  private async sendEmailNotification(notification: unknown, execution: WorkflowExecution): Promise<any> {
    // Implement email sending logic
    console.log('Sending email notification:', notification);
    return { sent: true, type: 'email' };
  }

  private async sendSmsNotification(notification: unknown, execution: WorkflowExecution): Promise<any> {
    // Implement SMS sending logic
    console.log('Sending SMS notification:', notification);
    return { sent: true, type: 'sms' };
  }

  private async sendPushNotification(notification: unknown, execution: WorkflowExecution): Promise<any> {
    // Implement push notification logic
    console.log('Sending push notification:', notification);
    return { sent: true, type: 'push' };
  }

  private async sendWebhookNotification(notification: unknown, execution: WorkflowExecution): Promise<any> {
    // Implement webhook notification logic
    console.log('Sending webhook notification:', notification);
    return { sent: true, type: 'webhook' };
  }

  // Public methods
  async getWorkflow(workflowId: string): Promise<Workflow | undefined> {
    return this.workflows.get(workflowId);
  }

  async getWorkflows(orgId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.orgId === orgId);
  }

  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return undefined;

    const updatedWorkflow = {
      ...workflow,
      ...updates,
      metadata: {
        ...workflow.metadata,
        version: workflow.metadata.version + 1,
        updatedAt: new Date(),
      },
    };

    this.workflows.set(workflowId, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(workflowId: string): Promise<boolean> {
    return this.workflows.delete(workflowId);
  }

  async getExecution(executionId: string): Promise<WorkflowExecution | undefined> {
    return this.executions.get(executionId);
  }

  async getExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    return Array.from(this.executions.values()).filter(e => e.workflowId === workflowId);
  }
}

// Export singleton instance
export const workflowAutomation = new WorkflowAutomation();
