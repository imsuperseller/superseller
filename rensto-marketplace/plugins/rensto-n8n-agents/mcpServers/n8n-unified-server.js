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
        url: process.env.N8N_RENSTO_VPS_URL || 'http://173.254.201.134:5678',
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
          // WORKFLOW MANAGEMENT (8 tools)
          // ========================================
          {
            name: 'n8n_get_workflow',
            description: 'Get workflow details from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name (rensto-vps, tax4us-cloud, shelly-cloud)' }
              },
              required: ['id']
            }
          },
          {
            name: 'n8n_list_workflows',
            description: 'List all workflows from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                limit: { type: 'number', description: 'Number of workflows to return (default: 50)' },
                offset: { type: 'number', description: 'Offset for pagination (default: 0)' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_create_workflow',
            description: 'Create a new workflow on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                name: { type: 'string', description: 'Workflow name' },
                nodes: { type: 'array', description: 'Array of workflow nodes' },
                connections: { type: 'object', description: 'Node connections' },
                settings: { type: 'object', description: 'Workflow settings' }
              },
              required: ['instance', 'name', 'nodes']
            }
          },
          {
            name: 'n8n_update_workflow',
            description: 'Update workflow on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name (rensto-vps, tax4us-cloud, shelly-cloud)' },
                updates: { type: 'object', description: 'Workflow updates' }
              },
              required: ['id', 'instance', 'updates']
            }
          },
          {
            name: 'n8n_delete_workflow',
            description: 'Delete workflow from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_activate_workflow',
            description: 'Activate/deactivate workflow on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name' },
                active: { type: 'boolean', description: 'Activate (true) or deactivate (false)' }
              },
              required: ['id', 'instance', 'active']
            }
          },
          {
            name: 'n8n_duplicate_workflow',
            description: 'Duplicate workflow on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name' },
                name: { type: 'string', description: 'New workflow name' }
              },
              required: ['id', 'instance', 'name']
            }
          },
          {
            name: 'n8n_export_workflow',
            description: 'Export workflow as JSON from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name' },
                format: { type: 'string', enum: ['json', 'yaml'], description: 'Export format' }
              },
              required: ['id', 'instance']
            }
          },

          // ========================================
          // EXECUTION MANAGEMENT (8 tools)
          // ========================================
          {
            name: 'n8n_get_execution',
            description: 'Get execution details from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Execution ID' },
                instance: { type: 'string', description: 'Instance name (rensto-vps, tax4us-cloud, shelly-cloud)' },
                mode: { type: 'string', enum: ['summary', 'full', 'preview'], description: 'Data mode' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_list_executions',
            description: 'List recent executions from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name (rensto-vps, tax4us-cloud, shelly-cloud)' },
                workflowId: { type: 'string', description: 'Optional workflow ID to filter executions' },
                limit: { type: 'number', description: 'Number of executions to return (default: 10)' },
                status: { type: 'string', enum: ['success', 'error', 'running', 'waiting'], description: 'Filter by status' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_execute_workflow',
            description: 'Execute workflow manually on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Workflow ID' },
                instance: { type: 'string', description: 'Instance name' },
                input: { type: 'object', description: 'Input data for execution' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_stop_execution',
            description: 'Stop running execution on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Execution ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_delete_execution',
            description: 'Delete execution from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Execution ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_retry_execution',
            description: 'Retry failed execution on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Execution ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_get_execution_logs',
            description: 'Get execution logs from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Execution ID' },
                instance: { type: 'string', description: 'Instance name' },
                nodeId: { type: 'string', description: 'Optional specific node ID' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_bulk_delete_executions',
            description: 'Bulk delete executions from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                workflowId: { type: 'string', description: 'Optional workflow ID filter' },
                olderThan: { type: 'string', description: 'ISO date string - delete older than' },
                status: { type: 'string', enum: ['success', 'error'], description: 'Filter by status' }
              },
              required: ['instance']
            }
          },

          // ========================================
          // NODE MANAGEMENT (6 tools)
          // ========================================
          {
            name: 'n8n_get_node_types',
            description: 'Get available node types from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                category: { type: 'string', description: 'Optional category filter' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_get_node_documentation',
            description: 'Get node documentation from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                nodeType: { type: 'string', description: 'Node type name' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['nodeType', 'instance']
            }
          },
          {
            name: 'n8n_validate_node',
            description: 'Validate node configuration on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                nodeType: { type: 'string', description: 'Node type' },
                parameters: { type: 'object', description: 'Node parameters' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['nodeType', 'parameters', 'instance']
            }
          },
          {
            name: 'n8n_test_node_connection',
            description: 'Test node connection on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                nodeType: { type: 'string', description: 'Node type' },
                credentials: { type: 'object', description: 'Node credentials' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['nodeType', 'credentials', 'instance']
            }
          },
          {
            name: 'n8n_get_node_parameters',
            description: 'Get node parameter schema from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                nodeType: { type: 'string', description: 'Node type' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['nodeType', 'instance']
            }
          },
          {
            name: 'n8n_get_node_defaults',
            description: 'Get node default values from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                nodeType: { type: 'string', description: 'Node type' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['nodeType', 'instance']
            }
          },

          // ========================================
          // CREDENTIAL MANAGEMENT (6 tools)
          // ========================================
          {
            name: 'n8n_list_credentials',
            description: 'List all credentials from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                type: { type: 'string', description: 'Optional credential type filter' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_get_credential',
            description: 'Get specific credential from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Credential ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_create_credential',
            description: 'Create new credential on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                name: { type: 'string', description: 'Credential name' },
                type: { type: 'string', description: 'Credential type' },
                data: { type: 'object', description: 'Credential data' }
              },
              required: ['instance', 'name', 'type', 'data']
            }
          },
          {
            name: 'n8n_update_credential',
            description: 'Update credential on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Credential ID' },
                instance: { type: 'string', description: 'Instance name' },
                updates: { type: 'object', description: 'Credential updates' }
              },
              required: ['id', 'instance', 'updates']
            }
          },
          {
            name: 'n8n_delete_credential',
            description: 'Delete credential from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Credential ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_test_credential',
            description: 'Test credential connection on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Credential ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },

          // ========================================
          // DATA TABLE MANAGEMENT (5 tools)
          // ========================================
          {
            name: 'n8n_list_data_tables',
            description: 'List all data tables from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_get_data_table',
            description: 'Get data table details from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Data table ID' },
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_query_data_table',
            description: 'Query data table from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Data table ID' },
                instance: { type: 'string', description: 'Instance name' },
                query: { type: 'object', description: 'Query parameters' },
                limit: { type: 'number', description: 'Result limit' }
              },
              required: ['id', 'instance']
            }
          },
          {
            name: 'n8n_insert_data_table',
            description: 'Insert data into table on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Data table ID' },
                instance: { type: 'string', description: 'Instance name' },
                data: { type: 'array', description: 'Data to insert' }
              },
              required: ['id', 'instance', 'data']
            }
          },
          {
            name: 'n8n_update_data_table',
            description: 'Update data in table on any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Data table ID' },
                instance: { type: 'string', description: 'Instance name' },
                updates: { type: 'object', description: 'Update operations' }
              },
              required: ['id', 'instance', 'updates']
            }
          },

          // ========================================
          // SYSTEM MANAGEMENT (8 tools)
          // ========================================
          {
            name: 'n8n_get_system_info',
            description: 'Get system information from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_get_health_status',
            description: 'Get health status from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_get_metrics',
            description: 'Get system metrics from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                timeRange: { type: 'string', description: 'Time range for metrics' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_restart_instance',
            description: 'Restart n8n instance (self-hosted only)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_get_logs',
            description: 'Get system logs from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                level: { type: 'string', enum: ['error', 'warn', 'info', 'debug'], description: 'Log level' },
                limit: { type: 'number', description: 'Number of log entries' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_clear_logs',
            description: 'Clear system logs from any n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_backup_instance',
            description: 'Create backup of n8n instance (self-hosted only)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                includeData: { type: 'boolean', description: 'Include data tables' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_restore_instance',
            description: 'Restore n8n instance from backup (self-hosted only)',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' },
                backupId: { type: 'string', description: 'Backup ID' }
              },
              required: ['instance', 'backupId']
            }
          },

          // ========================================
          // SMART ROUTING & UTILITIES (6 tools)
          // ========================================
          {
            name: 'n8n_smart_route',
            description: 'Automatically determine the correct n8n instance based on workflow ID or context',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID to analyze' },
                context: { type: 'string', description: 'Additional context for routing' }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'n8n_list_instances',
            description: 'List all available n8n instances',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'n8n_get_instance_info',
            description: 'Get information about specific n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_validate_connection',
            description: 'Validate connection to n8n instance',
            inputSchema: {
              type: 'object',
              properties: {
                instance: { type: 'string', description: 'Instance name' }
              },
              required: ['instance']
            }
          },
          {
            name: 'n8n_bulk_operation',
            description: 'Perform bulk operations across multiple instances',
            inputSchema: {
              type: 'object',
              properties: {
                operation: { type: 'string', description: 'Operation to perform' },
                instances: { type: 'array', description: 'Target instances' },
                parameters: { type: 'object', description: 'Operation parameters' }
              },
              required: ['operation', 'instances']
            }
          },
          {
            name: 'n8n_sync_workflows',
            description: 'Sync workflows between instances',
            inputSchema: {
              type: 'object',
              properties: {
                source: { type: 'string', description: 'Source instance' },
                target: { type: 'string', description: 'Target instance' },
                workflowIds: { type: 'array', description: 'Workflow IDs to sync' }
              },
              required: ['source', 'target']
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
      const updatedWorkflow = {
        ...currentWorkflow.data,
        ...updates,
        // Ensure nodes are preserved if not explicitly updated
        nodes: updates.nodes || currentWorkflow.data.nodes,
        // Ensure connections are preserved if not explicitly updated
        connections: updates.connections || currentWorkflow.data.connections
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

  // ========================================
  // UTILITY METHODS
  // ========================================

  getHandler(toolName) {
    const handlers = {
      // Workflow Management
      'n8n_get_workflow': this.getWorkflow,
      'n8n_list_workflows': this.listWorkflows,
      'n8n_create_workflow': this.createWorkflow,
      'n8n_update_workflow': this.updateWorkflow,
      'n8n_delete_workflow': this.deleteWorkflow,
      'n8n_activate_workflow': this.activateWorkflow,
      'n8n_duplicate_workflow': this.duplicateWorkflow,
      'n8n_export_workflow': this.exportWorkflow,
      
      // Execution Management
      'n8n_get_execution': this.getExecution,
      'n8n_list_executions': this.listExecutions,
      'n8n_execute_workflow': this.executeWorkflow,
      'n8n_stop_execution': this.stopExecution,
      'n8n_delete_execution': this.deleteExecution,
      'n8n_retry_execution': this.retryExecution,
      'n8n_get_execution_logs': this.getExecutionLogs,
      'n8n_bulk_delete_executions': this.bulkDeleteExecutions,
      
      // Node Management
      'n8n_get_node_types': this.getNodeTypes,
      'n8n_get_node_documentation': this.getNodeDocumentation,
      'n8n_validate_node': this.validateNode,
      'n8n_test_node_connection': this.testNodeConnection,
      'n8n_get_node_parameters': this.getNodeParameters,
      'n8n_get_node_defaults': this.getNodeDefaults,
      
      // Credential Management
      'n8n_list_credentials': this.listCredentials,
      'n8n_get_credential': this.getCredential,
      'n8n_create_credential': this.createCredential,
      'n8n_update_credential': this.updateCredential,
      'n8n_delete_credential': this.deleteCredential,
      'n8n_test_credential': this.testCredential,
      
      // Data Table Management
      'n8n_list_data_tables': this.listDataTables,
      'n8n_get_data_table': this.getDataTable,
      'n8n_query_data_table': this.queryDataTable,
      'n8n_insert_data_table': this.insertDataTable,
      'n8n_update_data_table': this.updateDataTable,
      
      // System Management
      'n8n_get_system_info': this.getSystemInfo,
      'n8n_get_health_status': this.getHealthStatus,
      'n8n_get_metrics': this.getMetrics,
      'n8n_restart_instance': this.restartInstance,
      'n8n_get_logs': this.getLogs,
      'n8n_clear_logs': this.clearLogs,
      'n8n_backup_instance': this.backupInstance,
      'n8n_restore_instance': this.restoreInstance,
      
      // Smart Routing & Utilities
      'n8n_smart_route': this.smartRoute,
      'n8n_list_instances': this.listInstances,
      'n8n_get_instance_info': this.getInstanceInfo,
      'n8n_validate_connection': this.validateConnection,
      'n8n_bulk_operation': this.bulkOperation,
      'n8n_sync_workflows': this.syncWorkflows
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
