#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Make.com API configuration
const MAKE_CONFIG = {
  apiKey: process.env.MAKE_API_KEY || '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
  teamId: process.env.MAKE_TEAM || '1300459',
  baseUrl: `https://${process.env.MAKE_ZONE || 'us2'}.make.com`
};

class MakeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'make-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_scenarios',
            description: 'List all Make.com scenarios',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_scenario',
            description: 'Get details of a specific scenario',
            inputSchema: {
              type: 'object',
              properties: {
                scenarioId: {
                  type: 'string',
                  description: 'The ID of the scenario to retrieve',
                },
              },
              required: ['scenarioId'],
            },
          },
          {
            name: 'run_scenario',
            description: 'Run a specific scenario on-demand',
            inputSchema: {
              type: 'object',
              properties: {
                scenarioId: {
                  type: 'string',
                  description: 'The ID of the scenario to run',
                },
                data: {
                  type: 'object',
                  description: 'Data to pass to the scenario',
                },
              },
              required: ['scenarioId'],
            },
          },
          {
            name: 'list_connections',
            description: 'List all Make.com connections',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_connection',
            description: 'Get details of a specific connection',
            inputSchema: {
              type: 'object',
              properties: {
                connectionId: {
                  type: 'string',
                  description: 'The ID of the connection to retrieve',
                },
              },
              required: ['connectionId'],
            },
          },
          {
            name: 'list_teams',
            description: 'List all teams in the organization',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_team',
            description: 'Get details of a specific team',
            inputSchema: {
              type: 'object',
              properties: {
                teamId: {
                  type: 'string',
                  description: 'The ID of the team to retrieve',
                },
              },
              required: ['teamId'],
            },
          },
          {
            name: 'health_check',
            description: 'Check Make.com API connectivity',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'update_scenario',
            description: 'Update a scenario blueprint with new modules',
            inputSchema: {
              type: 'object',
              properties: {
                scenarioId: {
                  type: 'string',
                  description: 'The ID of the scenario to update',
                },
                blueprint: {
                  type: 'object',
                  description: 'The updated blueprint configuration',
                },
              },
              required: ['scenarioId', 'blueprint'],
            },
          },
          {
            name: 'get_scenario_blueprint',
            description: 'Get the blueprint of a specific scenario',
            inputSchema: {
              type: 'object',
              properties: {
                scenarioId: {
                  type: 'string',
                  description: 'The ID of the scenario to get blueprint for',
                },
              },
              required: ['scenarioId'],
            },
          },
          // ============= CONNECTIONS =============
          {
            name: 'create_connection',
            description: 'Create a connection in a team',
            inputSchema: {
              type: 'object',
              properties: {
                team_id: { type: 'integer', description: 'Target teamId (required)' },
                account_name: { type: 'string', description: 'Optional: accountName' },
                account_type: { type: 'string', description: 'Optional: accountType (e.g., api-key, oauth2)' },
                name: { type: 'string', description: 'Optional: human name for the connection' },
                data: { type: 'object', description: 'Connection fields (keys vary by connection type)' }
              },
              required: ['team_id']
            }
          },
          {
            name: 'test_connection',
            description: 'Verify connection credentials are valid',
            inputSchema: {
              type: 'object',
              properties: { connection_id: { type: 'integer' } },
              required: ['connection_id']
            }
          },
          // ============= SCENARIOS =============
          {
            name: 'create_scenario',
            description: 'Create a scenario (empty shell) in a team',
            inputSchema: {
              type: 'object',
              properties: {
                team_id: { type: 'integer' },
                name: { type: 'string' },
                on_error: { type: 'string', description: 'Optional error handler mode' }
              },
              required: ['team_id', 'name']
            }
          },
          {
            name: 'activate_scenario',
            description: 'Activate a scenario',
            inputSchema: {
              type: 'object',
              properties: { scenario_id: { type: 'integer' } },
              required: ['scenario_id']
            }
          },
          {
            name: 'deactivate_scenario',
            description: 'Deactivate a scenario',
            inputSchema: {
              type: 'object',
              properties: { scenario_id: { type: 'integer' } },
              required: ['scenario_id']
            }
          },
          {
            name: 'get_scenario_interface',
            description: 'Get the interface (graph) of a scenario',
            inputSchema: {
              type: 'object',
              properties: { scenario_id: { type: 'integer' } },
              required: ['scenario_id']
            }
          },
          {
            name: 'update_scenario_interface',
            description: 'Patch scenario interface (graph) JSON',
            inputSchema: {
              type: 'object',
              properties: {
                scenario_id: { type: 'integer' },
                interface: { type: 'object', description: 'Interface payload to patch' }
              },
              required: ['scenario_id', 'interface']
            }
          },
          // ============= EXECUTIONS & LOGS =============
          {
            name: 'list_scenario_logs',
            description: 'List execution logs for a scenario',
            inputSchema: {
              type: 'object',
              properties: {
                scenario_id: { type: 'integer' },
                from: { type: 'integer', description: 'Unix ms start timestamp' },
                to: { type: 'integer', description: 'Unix ms end timestamp' },
                status: { type: 'integer', enum: [1, 2, 3], description: '1=success,2=warning,3=error' },
                pg_limit: { type: 'integer' },
                pg_offset: { type: 'integer' }
              },
              required: ['scenario_id']
            }
          },
          {
            name: 'get_execution_details',
            description: 'Get execution details (status, outputs)',
            inputSchema: {
              type: 'object',
              properties: {
                scenario_id: { type: 'integer' },
                execution_id: { type: 'string' }
              },
              required: ['scenario_id', 'execution_id']
            }
          },
          // ============= ORGANIZATIONS =============
          {
            name: 'list_organizations',
            description: 'List organizations for the current user',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_organization_usage',
            description: 'Get organization usage/consumption',
            inputSchema: {
              type: 'object',
              properties: {
                organization_id: { type: 'integer' },
                from: { type: 'string', description: 'ISO date (optional)' },
                to: { type: 'string', description: 'ISO date (optional)' }
              },
              required: ['organization_id']
            }
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_scenarios':
            return await this.listScenarios();
          case 'get_scenario':
            return await this.getScenario(args.scenarioId);
          case 'run_scenario':
            return await this.runScenario(args.scenarioId, args.data);
          case 'list_connections':
            return await this.listConnections();
          case 'get_connection':
            return await this.getConnection(args.connectionId);
          case 'list_teams':
            return await this.listTeams();
          case 'get_team':
            return await this.getTeam(args.teamId);
          case 'health_check':
            return await this.healthCheck();
          case 'update_scenario':
            return await this.updateScenario(args.scenarioId, args.blueprint);
          case 'get_scenario_blueprint':
            return await this.getScenarioBlueprint(args.scenarioId);
          // ============= CONNECTIONS =============
          case 'create_connection':
            return await this.createConnection(args);
          case 'test_connection':
            return await this.testConnection(args.connection_id);
          // ============= SCENARIOS =============
          case 'create_scenario':
            return await this.createScenario(args);
          case 'activate_scenario':
            return await this.activateScenario(args.scenario_id);
          case 'deactivate_scenario':
            return await this.deactivateScenario(args.scenario_id);
          case 'get_scenario_interface':
            return await this.getScenarioInterface(args.scenario_id);
          case 'update_scenario_interface':
            return await this.updateScenarioInterface(args.scenario_id, args.interface);
          // ============= EXECUTIONS & LOGS =============
          case 'list_scenario_logs':
            return await this.listScenarioLogs(args);
          case 'get_execution_details':
            return await this.getExecutionDetails(args.scenario_id, args.execution_id);
          // ============= ORGANIZATIONS =============
          case 'list_organizations':
            return await this.listOrganizations();
          case 'get_organization_usage':
            return await this.getOrganizationUsage(args.organization_id, args.from, args.to);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async makeApiRequest(endpoint, method = 'GET', options = {}) {
    const url = `${MAKE_CONFIG.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Token ${MAKE_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    console.error(`Making API request: ${method} ${url}`);
    console.error(`Headers:`, headers);
    if (options.body) {
      console.error(`Body:`, options.body);
    }

    const response = await fetch(url, {
      method,
      headers,
      ...options
    });

    console.error(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Make.com API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  // Helper function to replace path parameters
  replacePathParams(path, params) {
    let result = path;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  }

  // Helper function to build query string
  buildQueryString(params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    }
    return query.toString();
  }

  async listScenarios() {
    const data = await this.makeApiRequest(`/api/v2/scenarios?teamId=${MAKE_CONFIG.teamId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.scenarios.length} scenarios:\n${JSON.stringify(data.scenarios, null, 2)}`,
        },
      ],
    };
  }

  async getScenario(scenarioId) {
    const data = await this.makeApiRequest(`/api/v2/scenarios/${scenarioId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Scenario details:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async healthCheck() {
    try {
      await this.makeApiRequest(`/api/v2/scenarios?teamId=${MAKE_CONFIG.teamId}&limit=1`);
      return {
        content: [
          {
            type: 'text',
            text: '✅ Make.com API connectivity working',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Make.com API connectivity failed: ${error.message}`,
          },
        ],
      };
    }
  }

  async runScenario(scenarioId, data = {}) {
    try {
      console.error(`Running scenario ${scenarioId} with data:`, JSON.stringify(data, null, 2));
      
      const response = await fetch(`${MAKE_CONFIG.baseUrl}/api/v2/scenarios/${scenarioId}/executions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${MAKE_CONFIG.apiKey}`,
          'X-Team-Id': MAKE_CONFIG.teamId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.error(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to run scenario: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} executed successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      console.error(`Run scenario error: ${error.message}`);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to run scenario ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async listConnections() {
    try {
      const response = await this.makeApiRequest(`/api/v2/connections?teamId=${MAKE_CONFIG.teamId}`);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Connections: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to list connections: ${error.message}`,
          },
        ],
      };
    }
  }

  async getConnection(connectionId) {
    try {
      const response = await this.makeApiRequest(`/api/v2/connections/${connectionId}`);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Connection ${connectionId}: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get connection ${connectionId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async listTeams() {
    try {
      const response = await this.makeApiRequest(`/api/v2/teams?organizationId=4994164`);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Teams: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to list teams: ${error.message}`,
          },
        ],
      };
    }
  }

  async getTeam(teamId) {
    try {
      const response = await this.makeApiRequest(`/api/v2/teams/${teamId}`);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Team ${teamId}: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get team ${teamId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async getScenarioBlueprint(scenarioId) {
    try {
      const response = await this.makeApiRequest(`/api/v2/scenarios/${scenarioId}/blueprint?teamId=${MAKE_CONFIG.teamId}`);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} blueprint: ${JSON.stringify(response, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get scenario blueprint ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async updateScenario(scenarioId, blueprint) {
    try {
      console.error(`Updating scenario ${scenarioId} with blueprint:`, JSON.stringify(blueprint, null, 2));
      
      // Send blueprint as raw JSON object, not wrapped in string
      const response = await fetch(`${MAKE_CONFIG.baseUrl}/api/v2/scenarios/${scenarioId}?teamId=${MAKE_CONFIG.teamId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${MAKE_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blueprint: blueprint
        }),
      });

      console.error(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to update scenario: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} updated successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      console.error(`Update scenario error: ${error.message}`);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to update scenario ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  // ============= CONNECTIONS =============
  async createConnection(args) {
    try {
      const endpoint = '/api/v2/connections';
      const body = {
        teamId: args.team_id,
        ...(args.account_name && { accountName: args.account_name }),
        ...(args.account_type && { accountType: args.account_type }),
        ...(args.name && { name: args.name }),
        ...(args.data && { data: args.data })
      };
      
      const result = await this.makeApiRequest(endpoint, 'POST', { body: JSON.stringify(body) });
      return {
        content: [
          {
            type: 'text',
            text: `✅ Connection created successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to create connection: ${error.message}`,
          },
        ],
      };
    }
  }

  async testConnection(connectionId) {
    try {
      const endpoint = this.replacePathParams('/api/v2/connections/{connectionId}/test', { connectionId });
      const result = await this.makeApiRequest(endpoint, 'POST');
      return {
        content: [
          {
            type: 'text',
            text: `✅ Connection ${connectionId} test result: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to test connection ${connectionId}: ${error.message}`,
          },
        ],
      };
    }
  }

  // ============= SCENARIOS =============
  async createScenario(args) {
    try {
      const endpoint = '/api/v2/scenarios';
      const body = {
        teamId: args.team_id,
        name: args.name,
        blueprint: args.blueprint || JSON.stringify({
          flow: [],
          name: args.name,
          metadata: {
            instant: false,
            version: 1,
            scenario: {
              dlq: false,
              slots: null,
              dataloss: false,
              maxErrors: 3,
              autoCommit: true,
              roundtrips: 1,
              sequential: false,
              confidential: false,
              freshVariables: false,
              autoCommitTriggerLast: true
            }
          }
        }),
        scheduling: args.scheduling || JSON.stringify({
          type: "on-demand"
        }),
        ...(args.on_error && { onError: args.on_error })
      };
      
      const result = await this.makeApiRequest(endpoint, 'POST', { body: JSON.stringify(body) });
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario created successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to create scenario: ${error.message}`,
          },
        ],
      };
    }
  }

  async activateScenario(scenarioId) {
    try {
      const endpoint = this.replacePathParams('/api/v2/scenarios/{scenarioId}/activate', { scenarioId });
      const result = await this.makeApiRequest(endpoint, 'POST');
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} activated successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to activate scenario ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async deactivateScenario(scenarioId) {
    try {
      const endpoint = this.replacePathParams('/api/v2/scenarios/{scenarioId}/deactivate', { scenarioId });
      const result = await this.makeApiRequest(endpoint, 'POST');
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} deactivated successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to deactivate scenario ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async getScenarioInterface(scenarioId) {
    try {
      const endpoint = this.replacePathParams('/api/v2/scenarios/{scenarioId}/interface', { scenarioId });
      const result = await this.makeApiRequest(endpoint);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} interface: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get scenario interface ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async updateScenarioInterface(scenarioId, interfaceData) {
    try {
      const endpoint = this.replacePathParams('/api/v2/scenarios/{scenarioId}/interface', { scenarioId });
      const result = await this.makeApiRequest(endpoint, 'PATCH', { body: JSON.stringify(interfaceData) });
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${scenarioId} interface updated successfully: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to update scenario interface ${scenarioId}: ${error.message}`,
          },
        ],
      };
    }
  }

  // ============= EXECUTIONS & LOGS =============
  async listScenarioLogs(args) {
    try {
      const queryParams = {
        scenarioId: args.scenario_id,
        ...(args.from && { from: args.from }),
        ...(args.to && { to: args.to }),
        ...(args.status && { status: args.status }),
        ...(args.pg_limit && { pgLimit: args.pg_limit }),
        ...(args.pg_offset && { pgOffset: args.pg_offset })
      };
      
      const queryString = this.buildQueryString(queryParams);
      const endpoint = `/api/v2/scenarios/${args.scenario_id}/logs?${queryString}`;
      const result = await this.makeApiRequest(endpoint);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Scenario ${args.scenario_id} logs: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get scenario logs ${args.scenario_id}: ${error.message}`,
          },
        ],
      };
    }
  }

  async getExecutionDetails(scenarioId, executionId) {
    try {
      const endpoint = this.replacePathParams('/api/v2/scenarios/{scenarioId}/executions/{executionId}', { scenarioId, executionId });
      const result = await this.makeApiRequest(endpoint);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Execution ${executionId} details: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get execution details ${executionId}: ${error.message}`,
          },
        ],
      };
    }
  }

  // ============= ORGANIZATIONS =============
  async listOrganizations() {
    try {
      const result = await this.makeApiRequest('/api/v2/organizations');
      return {
        content: [
          {
            type: 'text',
            text: `✅ Organizations: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to list organizations: ${error.message}`,
          },
        ],
      };
    }
  }

  async getOrganizationUsage(organizationId, from, to) {
    try {
      const queryParams = {
        ...(from && { from }),
        ...(to && { to })
      };
      
      const queryString = this.buildQueryString(queryParams);
      const endpoint = `/api/v2/organizations/${organizationId}/usage?${queryString}`;
      const result = await this.makeApiRequest(endpoint);
      return {
        content: [
          {
            type: 'text',
            text: `✅ Organization ${organizationId} usage: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get organization usage ${organizationId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Make.com MCP server running on stdio');
  }
}

const server = new MakeMCPServer();
server.run().catch(console.error);
