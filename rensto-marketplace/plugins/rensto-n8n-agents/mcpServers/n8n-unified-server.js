#!/usr/bin/env node

/**
 * Rensto n8n Unified MCP Server
 * Handles multiple n8n instances with smart routing
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class N8nUnifiedServer {
  constructor() {
    this.server = new Server(
      {
        name: 'n8n-unified',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.instances = {
      'rensto-vps': {
        url: process.env.N8N_RENSTO_VPS_URL || 'http://n8n.rensto.com',
        apiKey: process.env.N8N_RENSTO_VPS_KEY,
        type: 'internal',
        apiType: 'self-hosted' // Full API support
      },
      'tax4us-cloud': {
        url: process.env.N8N_TAX4US_CLOUD_URL || 'https://tax4usllc.app.n8n.cloud',
        apiKey: process.env.N8N_TAX4US_CLOUD_KEY,
        type: 'customer',
        apiType: 'cloud' // Limited API support
      },
      'shelly-cloud': {
        url: process.env.N8N_SHELLY_CLOUD_URL || 'https://shellyins.app.n8n.cloud',
        apiKey: process.env.N8N_SHELLY_CLOUD_KEY,
        type: 'customer',
        apiType: 'cloud' // Limited API support
      }
    };

    this.allowedInstances = (process.env.N8N_OPS_ALLOWED_INSTANCES || Object.keys(this.instances).join(','))
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (this.allowedInstances.length === 0) {
      this.allowedInstances = Object.keys(this.instances);
    }

    this.auditLogEnabled = process.env.N8N_OPS_AUDIT_LOG === 'true';
    this.auditNamespace = process.env.N8N_OPS_AUDIT_NAMESPACE || 'n8n-ops';

    this.setupHandlers();
  }

  // Helper method to check if instance supports specific API endpoints
  getApiCapabilities(instance) {
    const config = this.instances[instance];
    if (!config) return { supported: false };

    const capabilities = {
      'self-hosted': {
        workflows: true,
        executions: true,
        credentials: true,
        health: true,
        systemInfo: true,
        logs: true,
        execute: true,
        dataTables: true,
        metrics: true
      },
      'cloud': {
        workflows: true,
        executions: true,
        credentials: false, // Limited or no credential API
        health: false,     // No health endpoint
        systemInfo: false, // No system info endpoint
        logs: false,       // No execution logs endpoint
        execute: false,    // No manual execution endpoint
        dataTables: false, // No data tables API
        metrics: false     // No metrics endpoint
      }
    };

    return {
      supported: true,
      capabilities: capabilities[config.apiType] || capabilities['cloud']
    };
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // ========================================
          // CONSOLIDATED OPS TOOLS
          // ========================================
          {
            name: 'n8n_workflow_ops',
            description: 'Workflow operations (list, get, create, update, delete, activate, duplicate, export)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                action: { type: 'string', enum: ['list', 'get', 'create', 'update', 'delete', 'activate', 'duplicate', 'export'], description: 'Action to perform' },
                id: { type: 'string', description: 'Workflow ID' },
                name: { type: 'string', description: 'New workflow name' },
                nodes: { type: 'array' },
                connections: { type: 'object' },
                settings: { type: 'object' },
                updates: { type: 'object' },
                active: { type: 'boolean' },
                format: { type: 'string', enum: ['json', 'yaml'] },
                limit: { type: 'number' },
                offset: { type: 'number' }
              },
              required: ['instance', 'action']
            }
          },
          {
            name: 'n8n_execution_ops',
            description: 'Execution operations (list, get, execute, stop, delete, retry, logs, bulk-delete)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                action: { type: 'string', enum: ['list', 'get', 'execute', 'stop', 'delete', 'retry', 'logs', 'bulk-delete'], description: 'Action to perform' },
                id: { type: 'string', description: 'Execution ID' },
                workflowId: { type: 'string' },
                input: { type: 'object' },
                mode: { type: 'string', enum: ['summary', 'full', 'preview'] },
                limit: { type: 'number' },
                status: { type: 'string' },
                nodeId: { type: 'string' },
                olderThan: { type: 'string' }
              },
              required: ['instance', 'action']
            }
          },
          {
            name: 'n8n_node_ops',
            description: 'Node operations (list-types, get-doc, validate, test-conn, get-params, get-defaults)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                action: { type: 'string', enum: ['list-types', 'get-doc', 'validate', 'test-conn', 'get-params', 'get-defaults'] },
                nodeType: { type: 'string' },
                category: { type: 'string' },
                parameters: { type: 'object' },
                credentials: { type: 'object' }
              },
              required: ['instance', 'action']
            }
          },
          {
            name: 'n8n_credential_ops',
            description: 'Credential operations (list, get, create, update, delete, test)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                action: { type: 'string', enum: ['list', 'get', 'create', 'update', 'delete', 'test'] },
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                data: { type: 'object' },
                updates: { type: 'object' }
              },
              required: ['instance', 'action']
            }
          },
          {
            name: 'n8n_data_table_ops',
            description: 'Data table operations (list, get, query, insert, update)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                action: { type: 'string', enum: ['list', 'get', 'query', 'insert', 'update'] },
                id: { type: 'string' },
                query: { type: 'object' },
                data: { type: 'array' },
                updates: { type: 'object' },
                limit: { type: 'number' }
              },
              required: ['instance', 'action']
            }
          },
          {
            name: 'n8n_system_ops',
            description: 'System operations (info, health, metrics, restart, logs, clear-logs, backup, restore)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                action: { type: 'string', enum: ['info', 'health', 'metrics', 'restart', 'logs', 'clear-logs', 'backup', 'restore'] },
                timeRange: { type: 'string' },
                level: { type: 'string' },
                limit: { type: 'number' },
                includeData: { type: 'boolean' },
                backupId: { type: 'string' }
              },
              required: ['instance', 'action']
            }
          },
          {
            name: 'n8n_instance_ops',
            description: 'Manage instances (list, smart-route, info, validate, bulk, sync)',
            inputSchema: {
              type: 'object',
              properties: {
                action: { type: 'string', enum: ['list', 'smart-route', 'info', 'validate', 'bulk', 'sync'] },
                instance: { type: 'string' },
                workflowId: { type: 'string' },
                context: { type: 'string' },
                operation: { type: 'string' },
                instances: { type: 'array' },
                parameters: { type: 'object' },
                source: { type: 'string' },
                target: { type: 'string' },
                workflowIds: { type: 'array' }
              },
              required: ['action']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Route to appropriate handler based on tool name
        const handler = this.getHandler(name);
        if (!handler) {
          throw new Error(`Unknown tool: ${name}`);
        }

        this.validateScope(args);
        this.logAudit('tool_call', {
          tool: name,
          instances: this.extractInstances(args),
        });

        // Pass args object directly to handlers
        const result = await handler.call(this, args);

        this.logAudit('tool_success', {
          tool: name,
        });

        return result;
      } catch (error) {
        this.logAudit('tool_error', {
          tool: name,
          error: error.message,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async smartRoute(args) {
    const { workflowId, context = '' } = args;

    // Smart routing logic based on workflow ID patterns and context
    let targetInstance = 'rensto-vps'; // Default to internal

    // Tax4Us Cloud workflows - comprehensive list
    const tax4usWorkflowIds = [
      '5LFzTa5z6fjyOIrJ', // AI Content Planning, Creation, Validation and Publishing Pipeline
      'zQIkACTYDgaehp6S', // Agent 1: WordPress Blog
      '3HrunP4OmMNNdNq7', // Agent 2: WordPress Pages  
      'GpFjZNtkwh1prsLT', // Agent 3: Social Media
      'wNV24WNtaEmAFXDy', // Agent 4 - Scheduler
      'GGDoM591l7Pg2fST', // Agent 4 - Pipeline
      'UCsldaoDl1HINI3K', // Tax4US Podcast Agent v2
      'Qm1XXTzNmvcv0nFx', // Sora Video Agent
      'RTTpslpqpminO85b', // Landing Page Intelligence
      'eGIGGRqTEzJAqibk'  // Legacy Tax4Us workflow
    ];

    // Check for Tax4Us workflows
    if (workflowId && (workflowId.includes('tax4us') || context.includes('tax4us') ||
      tax4usWorkflowIds.includes(workflowId))) {
      targetInstance = 'tax4us-cloud';
    } else if (workflowId && (workflowId.includes('shelly') || context.includes('shelly'))) {
      targetInstance = 'shelly-cloud';
    }

    // Check for internal workflow patterns
    if (workflowId && (workflowId.startsWith('INT-') || workflowId.startsWith('SUB-') ||
      workflowId.startsWith('MKT-') || workflowId.startsWith('DEV-'))) {
      targetInstance = 'rensto-vps';
    }

    return {
      content: [
        {
          type: 'text',
          text: `Smart routing determined: ${targetInstance} for workflow ${workflowId}`
        }
      ]
    };
  }

  async getWorkflow(args) {
    console.log('getWorkflow called with args:', args);
    const { id, instance } = args;
    console.log('Extracted id:', id, 'instance:', instance);
    const targetInstance = instance || await this.determineInstance(id);
    console.log('Target instance:', targetInstance);
    const config = this.instances[targetInstance];

    if (!config) {
      throw new Error(`Unknown instance: ${targetInstance}`);
    }

    const response = await axios.get(`${config.url}/api/v1/workflows/${id}`, {
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${id} from ${targetInstance}: ${JSON.stringify(response.data, null, 2)}`
        }
      ]
    };
  }

  async getExecution(args) {
    const { id, instance, mode = 'summary' } = args;

    // For execution IDs, we need to specify the instance explicitly
    // since execution IDs are not unique across instances
    if (!instance) {
      throw new Error('Instance must be specified for execution access. Use: tax4us-cloud, rensto-vps, or shelly-cloud');
    }

    const config = this.instances[instance];

    if (!config) {
      throw new Error(`Unknown instance: ${instance}`);
    }

    try {
      // Tax4Us Cloud doesn't support mode parameter, so we'll ignore it for now
      const response = await axios.get(`${config.url}/api/v1/executions/${id}`, {
        headers: {
          'X-N8N-API-KEY': config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Execution ${id} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error accessing execution ${id} from ${instance}: ${error.response?.status} ${error.response?.statusText} - ${error.message}`
          }
        ]
      };
    }
  }

  async listExecutions(args) {
    const { instance, workflowId, limit = 10, status } = args;

    if (!instance) {
      throw new Error('Instance must be specified for execution listing. Use: tax4us-cloud, rensto-vps, or shelly-cloud');
    }

    const config = this.instances[instance];

    if (!config) {
      throw new Error(`Unknown instance: ${instance}`);
    }

    try {
      let endpoint = `${config.url}/api/v1/executions?limit=${limit}`;
      if (workflowId) {
        endpoint += `&workflowId=${workflowId}`;
      }
      if (status) {
        endpoint += `&status=${status}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          'X-N8N-API-KEY': config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Recent executions from ${instance}: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing executions from ${instance}: ${error.response?.status} ${error.response?.statusText} - ${error.message}`
          }
        ]
      };
    }
  }

  async updateWorkflow(args) {
    const { id, instance, updates } = args;
    const targetInstance = instance || await this.determineInstance(id);
    const config = this.instances[targetInstance];

    if (!config) {
      throw new Error(`Unknown instance: ${targetInstance}`);
    }

    try {
      // First, get the current workflow to preserve existing structure
      const currentWorkflow = await axios.get(`${config.url}/api/v1/workflows/${id}`, {
        headers: {
          'X-N8N-API-KEY': config.apiKey
        }
      });

      // Merge updates with existing workflow data
      const mergedWorkflow = {
        ...currentWorkflow.data,
        ...updates,
        // Ensure nodes are preserved if not explicitly updated
        nodes: updates.nodes || currentWorkflow.data.nodes,
        // Ensure connections are preserved if not explicitly updated
        connections: updates.connections || currentWorkflow.data.connections
      };

      // Filter to only allowed fields for PUT request (n8n API rejects read-only fields)
      // Allowed fields: name, nodes, connections, settings
      // Note: 'active' is read-only in PUT - use activateWorkflow (PATCH) to change it
      const updatedWorkflow = {
        name: mergedWorkflow.name,
        nodes: mergedWorkflow.nodes,
        connections: mergedWorkflow.connections || {},
        settings: mergedWorkflow.settings || {}
      };

      const response = await axios.put(`${config.url}/api/v1/workflows/${id}`, updatedWorkflow, {
        headers: {
          'X-N8N-API-KEY': config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Workflow ${id} updated on ${targetInstance}: ${JSON.stringify(response.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error updating workflow ${id} on ${targetInstance}: ${error.response?.status} ${error.response?.statusText} - ${error.message}\nResponse data: ${JSON.stringify(error.response?.data, null, 2)}`
          }
        ]
      };
    }
  }

  async determineInstance(workflowId) {
    // Smart instance determination based on workflow ID patterns

    // Ensure workflowId is a string
    if (typeof workflowId !== 'string') {
      console.warn('determineInstance: workflowId is not a string:', typeof workflowId, workflowId);
      return 'rensto-vps'; // Default fallback
    }

    console.log('determineInstance called with:', workflowId, typeof workflowId);

    // Tax4Us Cloud workflows - comprehensive list
    const tax4usWorkflowIds = [
      '5LFzTa5z6fjyOIrJ', // AI Content Planning, Creation, Validation and Publishing Pipeline
      'zQIkACTYDgaehp6S', // Agent 1: WordPress Blog
      '3HrunP4OmMNNdNq7', // Agent 2: WordPress Pages  
      'GpFjZNtkwh1prsLT', // Agent 3: Social Media
      'wNV24WNtaEmAFXDy', // Agent 4 - Scheduler
      'GGDoM591l7Pg2fST', // Agent 4 - Pipeline
      'UCsldaoDl1HINI3K', // Tax4US Podcast Agent v2
      'Qm1XXTzNmvcv0nFx', // Sora Video Agent
      'RTTpslpqpminO85b', // Landing Page Intelligence
      'eGIGGRqTEzJAqibk'  // Legacy Tax4Us workflow
    ];

    try {
      if (workflowId.includes('tax4us') || workflowId.startsWith('TAX4US-') ||
        tax4usWorkflowIds.includes(workflowId)) {
        return 'tax4us-cloud';
      } else if (workflowId.includes('shelly') || workflowId.startsWith('SHELLY-')) {
        return 'shelly-cloud';
      } else if (workflowId.startsWith('INT-') || workflowId.startsWith('SUB-') ||
        workflowId.startsWith('MKT-') || workflowId.startsWith('DEV-') ||
        workflowId === 'GRlA3iuB7A8y8xFJ') {
        return 'rensto-vps';
      }
    } catch (error) {
      console.error('Error in determineInstance logic:', error);
      console.error('workflowId type:', typeof workflowId, 'value:', workflowId);
      return 'rensto-vps'; // Default fallback
    }

    // Default to rensto-vps for internal workflows
    return 'rensto-vps';
  }

  async handleWorkflowOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'list': return this.listWorkflows(rest);
      case 'get': return this.getWorkflow(rest);
      case 'create': return this.createWorkflow(rest);
      case 'update': return this.updateWorkflow(rest);
      case 'delete': return this.deleteWorkflow(rest);
      case 'activate': return this.activateWorkflow(rest);
      case 'duplicate': return this.duplicateWorkflow(rest);
      case 'export': return this.exportWorkflow(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  async handleExecutionOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'list': return this.listExecutions(rest);
      case 'get': return this.getExecution(rest);
      case 'execute': return this.executeWorkflow(rest);
      case 'stop': return this.stopExecution(rest);
      case 'delete': return this.deleteExecution(rest);
      case 'retry': return this.retryExecution(rest);
      case 'logs': return this.getExecutionLogs(rest);
      case 'bulk-delete': return this.bulkDeleteExecutions(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  async handleNodeOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'list-types': return this.getNodeTypes(rest);
      case 'get-doc': return this.getNodeDocumentation(rest);
      case 'validate': return this.validateNode(rest);
      case 'test-conn': return this.testNodeConnection(rest);
      case 'get-params': return this.getNodeParameters(rest);
      case 'get-defaults': return this.getNodeDefaults(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  async handleCredentialOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'list': return this.listCredentials(rest);
      case 'get': return this.getCredential(rest);
      case 'create': return this.createCredential(rest);
      case 'update': return this.updateCredential(rest);
      case 'delete': return this.deleteCredential(rest);
      case 'test': return this.testCredential(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  async handleDataTableOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'list': return this.listDataTables(rest);
      case 'get': return this.getDataTable(rest);
      case 'query': return this.queryDataTable(rest);
      case 'insert': return this.insertDataTable(rest);
      case 'update': return this.updateDataTable(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  async handleSystemOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'info': return this.getSystemInfo(rest);
      case 'health': return this.getHealthStatus(rest);
      case 'metrics': return this.getMetrics(rest);
      case 'restart': return this.restartInstance(rest);
      case 'logs': return this.getLogs(rest);
      case 'clear-logs': return this.clearLogs(rest);
      case 'backup': return this.backupInstance(rest);
      case 'restore': return this.restoreInstance(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  async handleInstanceOps(args) {
    const { action, ...rest } = args;
    switch (action) {
      case 'list': return this.listInstances(rest);
      case 'smart-route': return this.smartRoute(rest);
      case 'info': return this.getInstanceInfo(rest);
      case 'validate': return this.validateConnection(rest);
      case 'bulk': return this.bulkOperation(rest);
      case 'sync': return this.syncWorkflows(rest);
      default: throw new Error(`Invalid action: ${action}`);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getHandler(toolName) {
    // Consolidated Ops
    'n8n_workflow_ops': this.handleWorkflowOps,
      'n8n_execution_ops': this.handleExecutionOps,
        'n8n_node_ops': this.handleNodeOps,
          'n8n_credential_ops': this.handleCredentialOps,
            'n8n_data_table_ops': this.handleDataTableOps,
              'n8n_system_ops': this.handleSystemOps,
                'n8n_instance_ops': this.handleInstanceOps
  };

    return handlers[toolName];
  }

  // ========================================
  // WORKFLOW MANAGEMENT HANDLERS
  // ========================================

  async listWorkflows(args) {
  const { instance, limit = 50, offset = 0 } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.get(`${config.url}/api/v1/workflows?limit=${limit}&offset=${offset}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Workflows from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async createWorkflow(args) {
  const { instance, name, nodes, connections, settings } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const workflowData = {
    name,
    nodes,
    connections: connections || {},
    settings: settings || {},
    active: false
  };

  const response = await axios.post(`${config.url}/api/v1/workflows`, workflowData, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Workflow created on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async deleteWorkflow(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  await axios.delete(`${config.url}/api/v1/workflows/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Workflow ${id} deleted from ${instance}`
      }
    ]
  };
}

  async activateWorkflow(args) {
  const { id, instance, active } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.patch(`${config.url}/api/v1/workflows/${id}`, { active }, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Workflow ${id} ${active ? 'activated' : 'deactivated'} on ${instance}`
      }
    ]
  };
}

  async duplicateWorkflow(args) {
  const { id, instance, name } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  // First get the original workflow
  const originalResponse = await axios.get(`${config.url}/api/v1/workflows/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  const originalWorkflow = originalResponse.data;

  // Create duplicate with new name
  const duplicateData = {
    ...originalWorkflow,
    name,
    id: undefined, // Let n8n generate new ID
    active: false
  };

  const response = await axios.post(`${config.url}/api/v1/workflows`, duplicateData, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Workflow duplicated on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async exportWorkflow(args) {
  const { id, instance, format = 'json' } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.get(`${config.url}/api/v1/workflows/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  const workflow = response.data;

  if (format === 'yaml') {
    // Convert to YAML format
    const yaml = this.convertToYaml(workflow);
    return {
      content: [
        {
          type: 'text',
          text: yaml
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(workflow, null, 2)
        }
      ]
    };
  }
}

  // ========================================
  // EXECUTION MANAGEMENT HANDLERS
  // ========================================

  async executeWorkflow(args) {
  const { id, instance, input } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if manual execution is supported
  if (!capabilities.capabilities.execute) {
    return {
      content: [
        {
          type: 'text',
          text: `Manual workflow execution not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited manual execution API access. Workflows must be triggered through their configured triggers.`
        }
      ]
    };
  }

  const response = await axios.post(`${config.url}/api/v1/workflows/${id}/execute`, input || {}, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Workflow ${id} executed on ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async stopExecution(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.post(`${config.url}/api/v1/executions/${id}/stop`, {}, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Execution ${id} stopped on ${instance}`
      }
    ]
  };
}

  async deleteExecution(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  await axios.delete(`${config.url}/api/v1/executions/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Execution ${id} deleted from ${instance}`
      }
    ]
  };
}

  async retryExecution(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.post(`${config.url}/api/v1/executions/${id}/retry`, {}, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Execution ${id} retried on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getExecutionLogs(args) {
  const { id, instance, nodeId } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if execution logs API is supported
  if (!capabilities.capabilities.logs) {
    return {
      content: [
        {
          type: 'text',
          text: `Execution logs API not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited execution logs API access.`
        }
      ]
    };
  }

  let endpoint = `${config.url}/api/v1/executions/${id}/logs`;
  if (nodeId) {
    endpoint += `?nodeId=${nodeId}`;
  }

  const response = await axios.get(endpoint, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Execution logs for ${id} from ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async bulkDeleteExecutions(args) {
  const { instance, workflowId, olderThan, status } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const deleteData = {};
  if (workflowId) deleteData.workflowId = workflowId;
  if (olderThan) deleteData.olderThan = olderThan;
  if (status) deleteData.status = status;

  const response = await axios.post(`${config.url}/api/v1/executions/bulk-delete`, deleteData, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Bulk delete completed on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  // ========================================
  // NODE MANAGEMENT HANDLERS
  // ========================================

  async getNodeTypes(args) {
  const { instance, category } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  let endpoint = `${config.url}/api/v1/node-types`;
  if (category) {
    endpoint += `?category=${category}`;
  }

  const response = await axios.get(endpoint, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Node types from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getNodeDocumentation(args) {
  const { nodeType, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.get(`${config.url}/api/v1/node-types/${nodeType}/documentation`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Documentation for ${nodeType} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async validateNode(args) {
  const { nodeType, parameters, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.post(`${config.url}/api/v1/node-types/${nodeType}/validate`, {
    parameters
  }, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Validation result for ${nodeType} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async testNodeConnection(args) {
  const { nodeType, credentials, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.post(`${config.url}/api/v1/node-types/${nodeType}/test`, {
    credentials
  }, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Connection test for ${nodeType} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getNodeParameters(args) {
  const { nodeType, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.get(`${config.url}/api/v1/node-types/${nodeType}/parameters`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Parameters for ${nodeType} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getNodeDefaults(args) {
  const { nodeType, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.get(`${config.url}/api/v1/node-types/${nodeType}/defaults`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Defaults for ${nodeType} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  // ========================================
  // CREDENTIAL MANAGEMENT HANDLERS
  // ========================================

  async listCredentials(args) {
  const { instance, type } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if credentials API is supported
  if (!capabilities.capabilities.credentials) {
    return {
      content: [
        {
          type: 'text',
          text: `Credentials API not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited credential management API access.`
        }
      ]
    };
  }

  let endpoint = `${config.url}/api/v1/credentials`;
  if (type) {
    endpoint += `?type=${type}`;
  }

  const response = await axios.get(endpoint, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Credentials from ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getCredential(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if credentials API is supported
  if (!capabilities.capabilities.credentials) {
    return {
      content: [
        {
          type: 'text',
          text: `Credentials API not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited credential management API access.`
        }
      ]
    };
  }

  const response = await axios.get(`${config.url}/api/v1/credentials/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Credential ${id} from ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async createCredential(args) {
  const { instance, name, type, data } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const credentialData = {
    name,
    type,
    data
  };

  const response = await axios.post(`${config.url}/api/v1/credentials`, credentialData, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Credential created on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async updateCredential(args) {
  const { id, instance, updates } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.patch(`${config.url}/api/v1/credentials/${id}`, updates, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Credential ${id} updated on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async deleteCredential(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  await axios.delete(`${config.url}/api/v1/credentials/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Credential ${id} deleted from ${instance}`
      }
    ]
  };
}

  async testCredential(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if credentials API is supported
  if (!capabilities.capabilities.credentials) {
    return {
      content: [
        {
          type: 'text',
          text: `Credentials API not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited credential management API access.`
        }
      ]
    };
  }

  const response = await axios.post(`${config.url}/api/v1/credentials/${id}/test`, {}, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Credential test result from ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  // ========================================
  // DATA TABLE MANAGEMENT HANDLERS
  // ========================================

  async listDataTables(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if data tables API is supported
  if (!capabilities.capabilities.dataTables) {
    return {
      content: [
        {
          type: 'text',
          text: `Data tables API not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited data table API access.`
        }
      ]
    };
  }

  const response = await axios.get(`${config.url}/api/v1/data-tables`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Data tables from ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getDataTable(args) {
  const { id, instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.get(`${config.url}/api/v1/data-tables/${id}`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Data table ${id} from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async queryDataTable(args) {
  const { id, instance, query, limit } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const queryParams = { ...query };
  if (limit) queryParams.limit = limit;

  const response = await axios.post(`${config.url}/api/v1/data-tables/${id}/query`, queryParams, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Query result from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async insertDataTable(args) {
  const { id, instance, data } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.post(`${config.url}/api/v1/data-tables/${id}/insert`, { data }, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Data inserted into table ${id} on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async updateDataTable(args) {
  const { id, instance, updates } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const response = await axios.patch(`${config.url}/api/v1/data-tables/${id}/update`, updates, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Data table ${id} updated on ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  // ========================================
  // SYSTEM MANAGEMENT HANDLERS
  // ========================================

  async getSystemInfo(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  const capabilities = this.getApiCapabilities(instance);

  // Check if system info API is supported
  if (!capabilities.capabilities.systemInfo) {
    return {
      content: [
        {
          type: 'text',
          text: `System info API not supported on ${instance} (${config.apiType}). n8n Cloud instances have limited system information API access.`
        }
      ]
    };
  }

  const response = await axios.get(`${config.url}/api/v1/system/info`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `System info from ${instance} (${config.apiType}): ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async getHealthStatus(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  try {
    // Test connection with a simple API call
    const response = await axios.get(`${config.url}/api/v1/workflows?limit=1`, {
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Health status from ${instance} (${config.apiType}): Connected successfully (Status: ${response.status}) - API responsive and accessible`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Health check failed for ${instance} (${config.apiType}): ${error.response?.status} ${error.response?.statusText} - ${error.message}`
        }
      ]
    };
  }
}

  async getMetrics(args) {
  const { instance, timeRange } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  let endpoint = `${config.url}/api/v1/metrics`;
  if (timeRange) {
    endpoint += `?timeRange=${timeRange}`;
  }

  const response = await axios.get(endpoint, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Metrics from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async restartInstance(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  if (config.type !== 'internal') {
    throw new Error(`Restart only available for self-hosted instances`);
  }

  const response = await axios.post(`${config.url}/api/v1/system/restart`, {}, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Instance ${instance} restart initiated`
      }
    ]
  };
}

  async getLogs(args) {
  const { instance, level, limit } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  let endpoint = `${config.url}/api/v1/logs`;
  const params = new URLSearchParams();
  if (level) params.append('level', level);
  if (limit) params.append('limit', limit);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  const response = await axios.get(endpoint, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Logs from ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async clearLogs(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  await axios.delete(`${config.url}/api/v1/logs`, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Logs cleared on ${instance}`
      }
    ]
  };
}

  async backupInstance(args) {
  const { instance, includeData } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  if (config.type !== 'internal') {
    throw new Error(`Backup only available for self-hosted instances`);
  }

  const response = await axios.post(`${config.url}/api/v1/system/backup`, {
    includeData: includeData || false
  }, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Backup created for ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  async restoreInstance(args) {
  const { instance, backupId } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  if (config.type !== 'internal') {
    throw new Error(`Restore only available for self-hosted instances`);
  }

  const response = await axios.post(`${config.url}/api/v1/system/restore`, {
    backupId
  }, {
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    content: [
      {
        type: 'text',
        text: `Restore initiated for ${instance}: ${JSON.stringify(response.data, null, 2)}`
      }
    ]
  };
}

  // ========================================
  // SMART ROUTING & UTILITIES HANDLERS
  // ========================================

  async listInstances(args) {
  const instances = Object.keys(this.instances).map(key => ({
    name: key,
    url: this.instances[key].url,
    type: this.instances[key].type
  }));

  return {
    content: [
      {
        type: 'text',
        text: `Available n8n instances: ${JSON.stringify(instances, null, 2)}`
      }
    ]
  };
}

  async getInstanceInfo(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: `Instance info for ${instance}: ${JSON.stringify(config, null, 2)}`
      }
    ]
  };
}

  async validateConnection(args) {
  const { instance } = args;
  const config = this.instances[instance];

  if (!config) {
    throw new Error(`Unknown instance: ${instance}`);
  }

  try {
    // Test connection with workflows endpoint (works for both self-hosted and cloud)
    const response = await axios.get(`${config.url}/api/v1/workflows?limit=1`, {
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Connection to ${instance} (${config.apiType}) validated successfully (Status: ${response.status}) - API responsive and accessible`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Connection validation failed for ${instance} (${config.apiType}): ${error.response?.status} ${error.response?.statusText} - ${error.message}`
        }
      ]
    };
  }
}

  async bulkOperation(args) {
  const { operation, instances, parameters } = args;

  const results = [];

  for (const instance of instances) {
    try {
      const config = this.instances[instance];
      if (!config) {
        results.push({ instance, error: `Unknown instance: ${instance}` });
        continue;
      }

      // Perform the operation based on the operation type
      let result;
      switch (operation) {
        case 'health_check':
          result = await this.validateConnection({ instance });
          break;
        case 'list_workflows':
          result = await this.listWorkflows({ instance, ...parameters });
          break;
        case 'list_executions':
          result = await this.listExecutions({ instance, ...parameters });
          break;
        default:
          result = { error: `Unknown operation: ${operation}` };
      }

      results.push({ instance, result });
    } catch (error) {
      results.push({ instance, error: error.message });
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `Bulk operation ${operation} results: ${JSON.stringify(results, null, 2)}`
      }
    ]
  };
}

  async syncWorkflows(args) {
  const { source, target, workflowIds } = args;

  const sourceConfig = this.instances[source];
  const targetConfig = this.instances[target];

  if (!sourceConfig || !targetConfig) {
    throw new Error(`Invalid source or target instance`);
  }

  const results = [];

  // Get workflows from source
  const sourceWorkflows = await this.listWorkflows({ instance: source });

  // Filter by workflow IDs if specified
  let workflowsToSync = sourceWorkflows.content[0].text;
  if (workflowIds && workflowIds.length > 0) {
    // Filter logic would go here
  }

  // Sync each workflow to target
  for (const workflowId of workflowIds || []) {
    try {
      // Get workflow from source
      const workflow = await this.getWorkflow({ id: workflowId, instance: source });

      // Create workflow on target
      const result = await this.createWorkflow({
        instance: target,
        name: `Synced: ${workflowId}`,
        nodes: [], // Would extract from workflow
        connections: {},
        settings: {}
      });

      results.push({ workflowId, status: 'synced', result });
    } catch (error) {
      results.push({ workflowId, status: 'error', error: error.message });
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `Workflow sync results: ${JSON.stringify(results, null, 2)}`
      }
    ]
  };
}

convertToYaml(obj) {
  // Simple YAML conversion - in production, use a proper YAML library
  return JSON.stringify(obj, null, 2).replace(/"/g, '').replace(/,/g, '');
}

  async run() {
  const transport = new StdioServerTransport();
  await this.server.connect(transport);
  console.error('Rensto n8n Unified MCP Server running on stdio');
}

extractInstances(args = {}) {
  const instances = new Set();

  if (args.instance) {
    instances.add(args.instance);
  }

  if (Array.isArray(args.instances)) {
    args.instances.forEach((value) => value && instances.add(value));
  }

  if (args.source) {
    instances.add(args.source);
  }

  if (args.target) {
    instances.add(args.target);
  }

  return Array.from(instances);
}

validateScope(args = {}) {
  const instances = this.extractInstances(args);
  if (instances.length === 0) {
    return;
  }

  for (const instance of instances) {
    if (!this.allowedInstances.includes(instance)) {
      throw new Error(`Instance ${instance} is not allowed in OPS mode`);
    }
  }
}

logAudit(event, payload) {
  if (!this.auditLogEnabled) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...payload,
  };

  console.error(`[${this.auditNamespace}] ${JSON.stringify(entry)}`);
}
}

const server = new N8nUnifiedServer();
server.run().catch(console.error);
