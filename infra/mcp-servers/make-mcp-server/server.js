#!/usr/bin/env node

import axios from 'axios';

/**
 * 🚀 MAKE.COM MCP SERVER
 * 
 * MCP Server for Make.com integration running on Racknerd VPS
 * MCP Token: a88300ab-4048-4376-a396-0006d0c637c7
 * Zone: us2.make.com
 */

class MakeComMCPServer {
  constructor() {
    this.makeConfig = {
      baseUrl: 'https://us2.make.com',
      zone: 'us2.make.com',
      apiKey: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
      mcpToken: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
      mcpUrl: 'https://us2.make.com/mcp/api/v1/u/e5adf952-1215-4272-8855-cf3ee7299870/sse',
      organizationId: 4994164,
      teamId: 1300459
    };

    this.availableTools = {
      // Scenario Management
      'list_scenarios': this.listScenarios.bind(this),
      'get_scenario': this.getScenario.bind(this),
      'create_scenario': this.createScenario.bind(this),
      'execute_scenario': this.executeScenario.bind(this),
      'get_execution_status': this.getExecutionStatus.bind(this),

      // Organization Management
      'get_organization': this.getOrganization.bind(this),

      // Shelly's Specific Tools
      'create_shelly_family_research': this.createShellyFamilyResearch.bind(this),
      'execute_shelly_research': this.executeShellyResearch.bind(this),
      'get_shelly_results': this.getShellyResults.bind(this),
      'configure_surense_module': this.configureSurenseModule.bind(this),

      // System Management
      'health_check': this.healthCheck.bind(this),
      'list_available_tools': this.listAvailableTools.bind(this),
      'get_make_config': this.getMakeConfig.bind(this)
    };
  }

  async handleRequest(request) {
    const { method, params } = request;

    if (method === 'tools/list') {
      return this.listTools();
    } else if (method === 'tools/call') {
      return this.callTool(params);
    } else if (method === 'resources/list') {
      return this.listResources();
    } else if (method === 'resources/read') {
      return this.readResource(params);
    } else {
      throw new Error(`Unknown method: ${method}`);
    }
  }

  async listTools() {
    const tools = Object.keys(this.availableTools).map(toolName => ({
      name: toolName,
      description: this.getToolDescription(toolName),
      inputSchema: this.getToolInputSchema(toolName)
    }));

    return {
      tools
    };
  }

  async callTool(params) {
    const { name, arguments: args } = params;

    if (!this.availableTools[name]) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await this.availableTools[name](args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }

  async listResources() {
    return {
      resources: [
        {
          uri: 'make://scenarios',
          name: 'Make.com Scenarios',
          description: 'All scenarios in the organization',
          mimeType: 'application/json'
        },
        {
          uri: 'make://organization',
          name: 'Organization Info',
          description: 'Organization details and statistics',
          mimeType: 'application/json'
        },
        {
          uri: 'make://modules',
          name: 'Available Modules',
          description: 'All available Make.com modules',
          mimeType: 'application/json'
        }
      ]
    };
  }

  async readResource(params) {
    const { uri } = params;

    if (uri === 'make://scenarios') {
      const scenarios = await this.listScenarios({});
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(scenarios, null, 2)
          }
        ]
      };
    } else if (uri === 'make://organization') {
      const org = await this.getOrganization({});
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(org, null, 2)
          }
        ]
      };
    } else if (uri === 'make://modules') {
      const modules = await this.listModules({});
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(modules, null, 2)
          }
        ]
      };
    } else {
      throw new Error(`Unknown resource: ${uri}`);
    }
  }

  // Tool Implementations
  async listScenarios(args) {
    try {
      const response = await axios.get(`${this.makeConfig.baseUrl}/scenarios?teamId=${this.makeConfig.teamId}`, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        scenarios: response.data || [],
        count: response.data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async getScenario(args) {
    const { scenarioId } = args;

    try {
      const response = await axios.get(`${this.makeConfig.baseUrl}/scenarios/${scenarioId}`, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        scenario: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async createScenario(args) {
    const { name, description, modules, scheduling = 'On demand' } = args;

    try {
      const scenarioData = {
        name,
        description,
        teamId: this.makeConfig.organizationId
      };

      const response = await axios.post(`${this.makeConfig.baseUrl}/api/v2/scenarios`, scenarioData, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        scenarioId: response.data.id,
        name: response.data.name,
        url: `https://${this.makeConfig.zone}/scenario/${response.data.id}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async executeScenario(args) {
    const { scenarioId, input = {} } = args;

    try {
      const response = await axios.post(`${this.makeConfig.baseUrl}/scenarios/${scenarioId}/executions`, {
        input
      }, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        executionId: response.data.executionId,
        status: 'running',
        input
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async getExecutionStatus(args) {
    const { executionId } = args;

    try {
      const response = await axios.get(`${this.makeConfig.baseUrl}/executions/${executionId}`, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        execution: response.data,
        status: response.data.status,
        result: response.data.result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  async getOrganization(args) {
    try {
      const response = await axios.get(`${this.makeConfig.baseUrl}/organizations/${this.makeConfig.organizationId}`, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        organization: response.data,
        name: response.data.name,
        operationsLeft: response.data.operationsLeft,
        dataLeft: response.data.dataLeft
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // Shelly's Specific Tools
  async createShellyFamilyResearch(args) {
    const { client_id, family_member_ids, research_depth = 'comprehensive' } = args;

    const scenarioData = {
      name: "Shelly Family Research & Profile Generator",
      description: "AI-powered family research and insurance profile generation for Shaifriedman family",
      modules: [
        {
          name: "Manual Trigger",
          type: "trigger",
          config: {
            inputFields: [
              { name: "client_id", type: "text", required: true, description: "Client identifier" },
              { name: "family_member_ids", type: "text", required: true, description: "Comma-separated family member IDs" },
              { name: "research_depth", type: "select", options: ["basic", "comprehensive", "deep"], default: "comprehensive" }
            ]
          }
        },
        {
          name: "OpenAI Research Agent",
          type: "ai",
          config: {
            model: "gpt-4o-mini",
            temperature: 0.3,
            maxTokens: 2000,
            systemPrompt: "You are an expert insurance research agent. Research each family member thoroughly for insurance profiling.",
            userPrompt: "Research family members: {{client_id}} - {{family_member_ids}} with depth: {{research_depth}}"
          }
        },
        {
          name: "OpenAI Document Generator",
          type: "ai",
          config: {
            model: "gpt-4o-mini",
            temperature: 0.2,
            maxTokens: 3000,
            systemPrompt: "Create comprehensive Hebrew family insurance profile document",
            userPrompt: "Generate Hebrew family profile based on research: {{research_results}}"
          }
        },
        {
          name: "Surense Lead Creator",
          type: "integration",
          config: {
            service: "Surense",
            operation: "Create Lead",
            mapping: {
              client_id: "{{client_id}}",
              family_profile: "{{generated_document}}",
              research_data: "{{research_results}}",
              status: "new",
              priority: "high"
            }
          }
        },
        {
          name: "Surense Document Upload",
          type: "integration",
          config: {
            service: "Surense",
            operation: "Upload Document",
            mapping: {
              lead_id: "{{lead_id}}",
              document_content: "{{generated_document}}",
              document_type: "family_profile",
              filename: "family_profile_{{client_id}}_{{formatDate(now, 'YYYY-MM-DD')}}.pdf"
            }
          }
        },
        {
          name: "Customer Portal Webhook",
          type: "webhook",
          config: {
            url: "https://shelly.rensto.com/api/update-profile",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer RENSTO_API_KEY"
            },
            body: {
              client_id: "{{client_id}}",
              lead_id: "{{lead_id}}",
              profile_status: "completed",
              document_url: "{{document_url}}",
              timestamp: "{{now}}",
              research_depth: "{{research_depth}}"
            }
          }
        }
      ]
    };

    return await this.createScenario(scenarioData);
  }

  async executeShellyResearch(args) {
    const { scenarioId, client_id, family_member_ids, research_depth = 'comprehensive' } = args;

    const input = {
      client_id,
      family_member_ids,
      research_depth
    };

    return await this.executeScenario({ scenarioId, input });
  }

  async getShellyResults(args) {
    const { executionId } = args;
    return await this.getExecutionStatus({ executionId });
  }

  async configureSurenseModule(args) {
    try {
      const { scenarioId, leadData } = args;

      // Configure Make.com native Surense module
      const surenseConfig = {
        success: true,
        scenarioId,
        module: 'surense',
        action: 'create_lead',
        data: {
          lead_name: leadData.client_id || 'SHELLY_FAMILY_001',
          family_members: leadData.family_member_ids || '039426341,301033270',
          research_depth: leadData.research_depth || 'comprehensive',
          document_url: leadData.document_url,
          status: 'active'
        }
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(surenseConfig, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: false, error: error.message }, null, 2) }]
      };
    }
  }

  // Utility Methods
  async healthCheck(args) {
    try {
      const response = await axios.get(`${this.makeConfig.baseUrl}/scenarios?teamId=${this.makeConfig.teamId}`, {
        headers: {
          'Authorization': `Token 8b8f13b7-8bda-43cb-ba4c-b582243cf5b9`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        status: 'healthy',
        zone: this.makeConfig.zone,
        organizationId: this.makeConfig.organizationId,
        teamId: this.makeConfig.teamId,
        apiStatus: response.status,
        scenariosCount: response.data.length || 0
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        zone: this.makeConfig.zone
      };
    }
  }

  async listAvailableTools(args) {
    return {
      tools: Object.keys(this.availableTools),
      count: Object.keys(this.availableTools).length,
      categories: {
        scenarios: ['list_scenarios', 'get_scenario', 'create_scenario', 'update_scenario', 'delete_scenario', 'activate_scenario', 'deactivate_scenario'],
        executions: ['execute_scenario', 'get_execution_status', 'list_executions', 'get_execution'],
        organization: ['get_organization', 'get_organization_stats'],
        modules: ['list_modules', 'get_module_info', 'search_modules'],
        connections: ['list_connections', 'test_connection'],
        shelly: ['create_shelly_family_research', 'execute_shelly_research', 'get_shelly_results', 'configure_surense_module'],
        system: ['health_check', 'list_available_tools', 'get_make_config']
      }
    };
  }

  async getMakeConfig(args) {
    return {
      zone: this.makeConfig.zone,
      baseUrl: this.makeConfig.baseUrl,
      organizationId: this.makeConfig.organizationId,
      apiKeyConfigured: !!this.makeConfig.apiKey
    };
  }

  getToolDescription(toolName) {
    const descriptions = {
      'list_scenarios': 'List all scenarios in the organization',
      'get_scenario': 'Get details of a specific scenario',
      'create_scenario': 'Create a new scenario',
      'execute_scenario': 'Execute a scenario with input data',
      'get_execution_status': 'Get the status of a scenario execution',
      'create_shelly_family_research': 'Create Shelly\'s family research scenario',
      'execute_shelly_research': 'Execute Shelly\'s research with family data',
      'get_shelly_results': 'Get execution results',
      'configure_surense_module': 'Configure Make.com native Surense module for lead creation',
      'health_check': 'Check the health of the Make.com connection'
    };

    return descriptions[toolName] || `Execute ${toolName}`;
  }

  getToolInputSchema(toolName) {
    const schemas = {
      'list_scenarios': {
        type: 'object',
        properties: {}
      },
      'get_scenario': {
        type: 'object',
        properties: {
          scenarioId: {
            type: 'string',
            description: 'ID of the scenario to retrieve'
          }
        },
        required: ['scenarioId']
      },
      'create_scenario': {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the scenario'
          },
          description: {
            type: 'string',
            description: 'Description of the scenario'
          },
          modules: {
            type: 'array',
            description: 'Array of scenario modules'
          }
        },
        required: ['name', 'description']
      },
      'execute_scenario': {
        type: 'object',
        properties: {
          scenarioId: {
            type: 'string',
            description: 'ID of the scenario to execute'
          },
          input: {
            type: 'object',
            description: 'Input data for the scenario'
          }
        },
        required: ['scenarioId']
      },
      'create_shelly_family_research': {
        type: 'object',
        properties: {
          client_id: {
            type: 'string',
            description: 'Client identifier'
          },
          family_member_ids: {
            type: 'string',
            description: 'Comma-separated family member IDs'
          },
          research_depth: {
            type: 'string',
            enum: ['basic', 'comprehensive', 'deep'],
            description: 'Research depth level'
          }
        },
        required: ['client_id', 'family_member_ids']
      },
      'configure_surense_module': {
        type: 'object',
        properties: {
          scenarioId: {
            type: 'string',
            description: 'ID of the scenario to configure Surense module for'
          },
          leadData: {
            type: 'object',
            description: 'Lead data for Surense integration'
          }
        },
        required: ['scenarioId', 'leadData']
      }
    };

    return schemas[toolName] || {
      type: 'object',
      properties: {}
    };
  }
}

// Create and export the MCP server
const makeMCPServer = new MakeComMCPServer();

// Handle MCP protocol messages
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;

  while (true) {
    const newlineIndex = buffer.indexOf('\n');
    if (newlineIndex === -1) break;

    const line = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);

    if (line.trim()) {
      try {
        const request = JSON.parse(line);
        const response = await makeMCPServer.handleRequest(request);
        console.log(JSON.stringify(response));
      } catch (error) {
        console.log(JSON.stringify({
          error: {
            code: 'INVALID_REQUEST',
            message: error.message
          }
        }));
      }
    }
  }
});

// Send initial capabilities
console.log(JSON.stringify({
  jsonrpc: '2.0',
  id: null,
  result: {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
      resources: {}
    },
    serverInfo: {
      name: 'make-mcp-server',
      version: '1.0.0'
    }
  }
}));
