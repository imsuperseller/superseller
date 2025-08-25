#!/usr/bin/env node

import axios from 'axios';

// Multi-Instance n8n MCP Server with comprehensive tool set
class MultiInstanceN8nMCPServer {
  constructor() {
    // Define multiple n8n instances
    this.n8nInstances = {
      'rensto': {
        url: process.env.N8N_URL || 'http://173.254.201.134:5678',
        apiKey: process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
      },
      'tax4us': {
        url: 'https://tax4usllc.app.n8n.cloud',
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw'
      }
    };

    this.availableTools = {
      // Core Workflow Management
      'activate-workflow': this.activateWorkflow.bind(this),
      'create-workflow': this.createWorkflow.bind(this),
      'deactivate-workflow': this.deactivateWorkflow.bind(this),
      'delete-workflow': this.deleteWorkflow.bind(this),
      'get-workflow': this.getWorkflow.bind(this),
      'list-workflows': this.listWorkflows.bind(this),
      'update-workflow': this.updateWorkflow.bind(this),
      'update-workflow-tags': this.updateWorkflowTags.bind(this),
      'get-workflow-tags': this.getWorkflowTags.bind(this),

      // Execution Management
      'get-execution': this.getExecution.bind(this),
      'list-executions': this.listExecutions.bind(this),
      'delete-execution': this.deleteExecution.bind(this),
      'trigger-webhook-workflow': this.triggerWebhookWorkflow.bind(this),

      // Credential Management
      'create-credential': this.createCredential.bind(this),
      'delete-credential': this.deleteCredential.bind(this),
      'get-credential-schema': this.getCredentialSchema.bind(this),

      // Project Management
      'create-project': this.createProject.bind(this),
      'update-project': this.updateProject.bind(this),
      'delete-project': this.deleteProject.bind(this),
      'list-projects': this.listProjects.bind(this),

      // User Management
      'create-users': this.createUsers.bind(this),
      'get-user': this.getUser.bind(this),
      'delete-user': this.deleteUser.bind(this),
      'list-users': this.listUsers.bind(this),

      // Variable Management
      'create-variable': this.createVariable.bind(this),
      'delete-variable': this.deleteVariable.bind(this),
      'list-variables': this.listVariables.bind(this),

      // Tag Management
      'create-tag': this.createTag.bind(this),
      'get-tag': this.getTag.bind(this),
      'update-tag': this.updateTag.bind(this),
      'delete-tag': this.deleteTag.bind(this),
      'list-tags': this.listTags.bind(this),

      // Node Management
      'list-nodes': this.listNodes.bind(this),
      'get-node-info': this.getNodeInfo.bind(this),
      'get-node-essentials': this.getNodeEssentials.bind(this),
      'search-nodes': this.searchNodes.bind(this),
      'search-node-properties': this.searchNodeProperties.bind(this),
      'get-node-as-tool-info': this.getNodeAsToolInfo.bind(this),
      'get-node-for-task': this.getNodeForTask.bind(this),
      'get-node-documentation': this.getNodeDocumentation.bind(this),

      // Workflow Validation
      'validate-workflow': this.validateWorkflow.bind(this),
      'validate-workflow-connections': this.validateWorkflowConnections.bind(this),
      'validate-workflow-expressions': this.validateWorkflowExpressions.bind(this),
      'validate-node-operation': this.validateNodeOperation.bind(this),
      'validate-node-minimal': this.validateNodeMinimal.bind(this),

      // AI Tools
      'list-ai-tools': this.listAiTools.bind(this),
      'list-tasks': this.listTasks.bind(this),
      'get-property-dependencies': this.getPropertyDependencies.bind(this),

      // System Management
      'init-n8n': this.initN8n.bind(this),
      'health-check': this.healthCheck.bind(this),
      'diagnostic': this.diagnostic.bind(this),
      'list-available-tools': this.listAvailableTools.bind(this),
      'generate-audit': this.generateAudit.bind(this),
      'get-database-statistics': this.getDatabaseStatistics.bind(this),

      // Webhook Management
      'list-workflow-webhooks': this.listWorkflowWebhooks.bind(this),
      'call-webhook-get': this.callWebhookGet.bind(this),
      'call-webhook-post': this.callWebhookPost.bind(this),

      // Advanced Workflow Operations
      'get-workflow-details': this.getWorkflowDetails.bind(this),
      'get-workflow-structure': this.getWorkflowStructure.bind(this),
      'get-workflow-minimal': this.getWorkflowMinimal.bind(this),
      'update-full-workflow': this.updateFullWorkflow.bind(this),
      'update-partial-workflow': this.updatePartialWorkflow.bind(this),

      // Tools Documentation
      'tools-documentation': this.getToolsDocumentation.bind(this)
    };
  }

  // Helper method to get instance config
  getInstanceConfig(instanceName = 'rensto') {
    const config = this.n8nInstances[instanceName];
    if (!config) {
      throw new Error(`Unknown n8n instance: ${instanceName}. Available instances: ${Object.keys(this.n8nInstances).join(', ')}`);
    }
    return config;
  }

  // Core Workflow Management Methods
  async activateWorkflow(args) {
    const { workflowId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      await axios.post(
        `${config.url}/api/v1/workflows/${workflowId}/activate`,
        {},
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Workflow ${workflowId} activated successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to activate workflow on ${instance}: ${error.message}` };
    }
  }

  async createWorkflow(args) {
    const { workflowData, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.post(
        `${config.url}/api/v1/workflows`,
        workflowData,
        { headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Workflow created with ID: ${response.data.id} on ${instance}`, data: response.data };
    } catch (error) {
      return { success: false, message: `❌ Failed to create workflow on ${instance}: ${error.message}` };
    }
  }

  async deactivateWorkflow(args) {
    const { workflowId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      await axios.post(
        `${config.url}/api/v1/workflows/${workflowId}/deactivate`,
        {},
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Workflow ${workflowId} deactivated successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to deactivate workflow on ${instance}: ${error.message}` };
    }
  }

  async deleteWorkflow(args) {
    const { workflowId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      await axios.delete(
        `${config.url}/api/v1/workflows/${workflowId}`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Workflow ${workflowId} deleted successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to delete workflow on ${instance}: ${error.message}` };
    }
  }

  async getWorkflow(args) {
    const { workflowId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.get(
        `${config.url}/api/v1/workflows/${workflowId}`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, data: response.data, message: `✅ Workflow ${workflowId} retrieved from ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to get workflow from ${instance}: ${error.message}` };
    }
  }

  async listWorkflows(args) {
    const { instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.get(
        `${config.url}/api/v1/workflows`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, data: response.data, message: `✅ Found ${response.data.length} workflows on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to list workflows on ${instance}: ${error.message}` };
    }
  }

  async updateWorkflow(args) {
    const { workflowId, workflowData, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.put(
        `${config.url}/api/v1/workflows/${workflowId}`,
        workflowData,
        { headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Workflow ${workflowId} updated successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to update workflow on ${instance}: ${error.message}` };
    }
  }

  async updateWorkflowTags(args) {
    const { workflowId, tags, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.put(
        `${config.url}/api/v1/workflows/${workflowId}`,
        { tags },
        { headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Workflow ${workflowId} tags updated successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to update workflow tags on ${instance}: ${error.message}` };
    }
  }

  async getWorkflowTags(args) {
    const { workflowId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.get(
        `${config.url}/api/v1/workflows/${workflowId}`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, data: response.data.tags || [], message: `✅ Workflow ${workflowId} tags retrieved from ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to get workflow tags from ${instance}: ${error.message}` };
    }
  }

  // Execution Management
  async getExecution(args) {
    const { executionId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.get(
        `${config.url}/api/v1/executions/${executionId}`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, data: response.data, message: `✅ Execution ${executionId} retrieved from ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to get execution from ${instance}: ${error.message}` };
    }
  }

  async listExecutions(args) {
    const { instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.get(
        `${config.url}/api/v1/executions`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, data: response.data, message: `✅ Found ${response.data.length} executions on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to list executions on ${instance}: ${error.message}` };
    }
  }

  async deleteExecution(args) {
    const { executionId, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      await axios.delete(
        `${config.url}/api/v1/executions/${executionId}`,
        { headers: { 'X-N8N-API-KEY': config.apiKey } }
      );
      return { success: true, message: `✅ Execution ${executionId} deleted successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to delete execution on ${instance}: ${error.message}` };
    }
  }

  async triggerWebhookWorkflow(args) {
    const { workflowId, data = {}, instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.post(
        `${config.url}/webhook/${workflowId}`,
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return { success: true, data: response.data, message: `✅ Webhook triggered successfully on ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Failed to trigger webhook on ${instance}: ${error.message}` };
    }
  }

  // System Management
  async healthCheck(args) {
    const { instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const response = await axios.get(`${config.url}/healthz`);
      return { success: true, data: response.data, message: `✅ Health check passed for ${instance}` };
    } catch (error) {
      return { success: false, message: `❌ Health check failed for ${instance}: ${error.message}` };
    }
  }

  async diagnostic(args) {
    const { instance = 'rensto' } = args;
    const config = this.getInstanceConfig(instance);
    
    try {
      const healthCheck = await this.healthCheck({ instance });
      const workflows = await this.listWorkflows({ instance });
      
      return {
        success: true,
        data: {
          instance,
          health: healthCheck,
          workflows: workflows.data || [],
          config: { url: config.url, apiKeyConfigured: !!config.apiKey }
        },
        message: `✅ Diagnostic completed for ${instance}`
      };
    } catch (error) {
      return { success: false, message: `❌ Diagnostic failed for ${instance}: ${error.message}` };
    }
  }

  async listAvailableTools() {
    return {
      success: true,
      data: {
        tools: Object.keys(this.availableTools),
        instances: Object.keys(this.n8nInstances),
        totalTools: Object.keys(this.availableTools).length
      },
      message: `✅ Available ${Object.keys(this.availableTools).length} tools for ${Object.keys(this.n8nInstances).length} instances`
    };
  }

  // Placeholder methods for other tools
  async createCredential(args) { return { success: false, message: 'Not implemented yet' }; }
  async deleteCredential(args) { return { success: false, message: 'Not implemented yet' }; }
  async getCredentialSchema(args) { return { success: false, message: 'Not implemented yet' }; }
  async createProject(args) { return { success: false, message: 'Not implemented yet' }; }
  async updateProject(args) { return { success: false, message: 'Not implemented yet' }; }
  async deleteProject(args) { return { success: false, message: 'Not implemented yet' }; }
  async listProjects(args) { return { success: false, message: 'Not implemented yet' }; }
  async createUsers(args) { return { success: false, message: 'Not implemented yet' }; }
  async getUser(args) { return { success: false, message: 'Not implemented yet' }; }
  async deleteUser(args) { return { success: false, message: 'Not implemented yet' }; }
  async listUsers(args) { return { success: false, message: 'Not implemented yet' }; }
  async createVariable(args) { return { success: false, message: 'Not implemented yet' }; }
  async deleteVariable(args) { return { success: false, message: 'Not implemented yet' }; }
  async listVariables(args) { return { success: false, message: 'Not implemented yet' }; }
  async createTag(args) { return { success: false, message: 'Not implemented yet' }; }
  async getTag(args) { return { success: false, message: 'Not implemented yet' }; }
  async updateTag(args) { return { success: false, message: 'Not implemented yet' }; }
  async deleteTag(args) { return { success: false, message: 'Not implemented yet' }; }
  async listTags(args) { return { success: false, message: 'Not implemented yet' }; }
  async listNodes(args) { return { success: false, message: 'Not implemented yet' }; }
  async getNodeInfo(args) { return { success: false, message: 'Not implemented yet' }; }
  async getNodeEssentials(args) { return { success: false, message: 'Not implemented yet' }; }
  async searchNodes(args) { return { success: false, message: 'Not implemented yet' }; }
  async searchNodeProperties(args) { return { success: false, message: 'Not implemented yet' }; }
  async getNodeAsToolInfo(args) { return { success: false, message: 'Not implemented yet' }; }
  async getNodeForTask(args) { return { success: false, message: 'Not implemented yet' }; }
  async getNodeDocumentation(args) { return { success: false, message: 'Not implemented yet' }; }
  async validateWorkflow(args) { return { success: false, message: 'Not implemented yet' }; }
  async validateWorkflowConnections(args) { return { success: false, message: 'Not implemented yet' }; }
  async validateWorkflowExpressions(args) { return { success: false, message: 'Not implemented yet' }; }
  async validateNodeOperation(args) { return { success: false, message: 'Not implemented yet' }; }
  async validateNodeMinimal(args) { return { success: false, message: 'Not implemented yet' }; }
  async listAiTools(args) { return { success: false, message: 'Not implemented yet' }; }
  async listTasks(args) { return { success: false, message: 'Not implemented yet' }; }
  async getPropertyDependencies(args) { return { success: false, message: 'Not implemented yet' }; }
  async initN8n(args) { return { success: false, message: 'Not implemented yet' }; }
  async generateAudit(args) { return { success: false, message: 'Not implemented yet' }; }
  async getDatabaseStatistics(args) { return { success: false, message: 'Not implemented yet' }; }
  async listWorkflowWebhooks(args) { return { success: false, message: 'Not implemented yet' }; }
  async callWebhookGet(args) { return { success: false, message: 'Not implemented yet' }; }
  async callWebhookPost(args) { return { success: false, message: 'Not implemented yet' }; }
  async getWorkflowDetails(args) { return { success: false, message: 'Not implemented yet' }; }
  async getWorkflowStructure(args) { return { success: false, message: 'Not implemented yet' }; }
  async getWorkflowMinimal(args) { return { success: false, message: 'Not implemented yet' }; }
  async updateFullWorkflow(args) { return { success: false, message: 'Not implemented yet' }; }
  async updatePartialWorkflow(args) { return { success: false, message: 'Not implemented yet' }; }
  async getToolsDocumentation() { 
    return { 
      success: true, 
      data: {
        description: 'Multi-Instance n8n MCP Server',
        instances: Object.keys(this.n8nInstances),
        availableTools: Object.keys(this.availableTools),
        usage: 'All methods accept an optional "instance" parameter to specify which n8n instance to use'
      },
      message: '✅ Tools documentation retrieved'
    }; 
  }

  // MCP Server Protocol Handler
  async handleRequest(request) {
    const { method, params } = request;
    
    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: Object.keys(this.availableTools).map(toolName => ({
            name: toolName,
            description: `Execute ${toolName} operation`,
            inputSchema: {
              type: 'object',
              properties: {
                instance: {
                  type: 'string',
                  description: 'n8n instance to use (rensto, tax4us)',
                  default: 'rensto'
                }
              }
            }
          }))
        }
      };
    }
    
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      if (!this.availableTools[name]) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method ${name} not found`
          }
        };
      }
      
      try {
        const result = await this.availableTools[name](args);
        return {
          jsonrpc: '2.0',
          id: request.id,
          result: result
        };
      } catch (error) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32603,
            message: error.message
          }
        };
      }
    }
    
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32601,
        message: `Method ${method} not found`
      }
    };
  }
}

// Start the server
const server = new MultiInstanceN8nMCPServer();

console.log('🚀 Multi-Instance n8n MCP Server running');
console.log('✅ Available instances:', Object.keys(server.n8nInstances).join(', '));
console.log('✅ Available tools:', Object.keys(server.availableTools).length);

// Handle stdin/stdout for MCP protocol
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  
  try {
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.trim()) {
        const request = JSON.parse(line);
        const response = await server.handleRequest(request);
        console.log(JSON.stringify(response));
      }
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
  }
});

process.stdin.on('end', () => {
  process.exit(0);
});
