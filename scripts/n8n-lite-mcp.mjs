#!/usr/bin/env node

/**
 * Rensto n8n Lite MCP Server
 * Minimal version with only 4 core tools to avoid blocking issues
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import fs from 'fs';

const LOG_FILE = '/tmp/n8n-lite-mcp.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('--- SERVER STARTING ---');

class N8nLiteServer {
    constructor() {
        this.server = new Server(
            {
                name: 'n8n-lite',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.apiUrl = process.env.N8N_API_URL || 'http://n8n.rensto.com';
        this.apiKey = process.env.N8N_API_KEY;

        this.setupHandlers();
    }

    async makeRequest(method, endpoint, data = null) {
        try {
            const response = await axios({
                method,
                url: `${this.apiUrl}/api/v1${endpoint}`,
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                },
                data,
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            throw new Error(`n8n API error: ${error.message}`);
        }
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'n8n_list_workflows',
                        description: 'List all workflows from n8n',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                limit: { type: 'number', description: 'Number of workflows to return (default: 20)' }
                            }
                        }
                    },
                    {
                        name: 'n8n_get_workflow',
                        description: 'Get workflow details by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Workflow ID' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'n8n_execute_workflow',
                        description: 'Execute a workflow by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Workflow ID' },
                                data: { type: 'object', description: 'Input data for the workflow' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'n8n_list_executions',
                        description: 'List recent workflow executions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                workflowId: { type: 'string', description: 'Optional workflow ID to filter' },
                                limit: { type: 'number', description: 'Number of executions to return (default: 10)' }
                            }
                        }
                    }
                ]
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                let result;

                switch (name) {
                    case 'n8n_list_workflows': {
                        const limit = args?.limit || 20;
                        const data = await this.makeRequest('GET', `/workflows?limit=${limit}`);
                        result = JSON.stringify(data, null, 2);
                        break;
                    }

                    case 'n8n_get_workflow': {
                        const { id } = args;
                        const data = await this.makeRequest('GET', `/workflows/${id}`);
                        result = JSON.stringify(data, null, 2);
                        break;
                    }

                    case 'n8n_execute_workflow': {
                        const { id, data: inputData } = args;
                        const response = await this.makeRequest('POST', `/workflows/${id}/run`, inputData || {});
                        result = JSON.stringify(response, null, 2);
                        break;
                    }

                    case 'n8n_list_executions': {
                        const limit = args?.limit || 10;
                        const workflowId = args?.workflowId;
                        let endpoint = `/executions?limit=${limit}`;
                        if (workflowId) endpoint += `&workflowId=${workflowId}`;
                        const data = await this.makeRequest('GET', endpoint);
                        result = JSON.stringify(data, null, 2);
                        break;
                    }

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }

                return {
                    content: [{ type: 'text', text: result }]
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: `Error: ${error.message}` }]
                };
            }
        });
    }

    async run() {
        log('Connecting transport...');
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        log('Server connected to stdio');
        console.error('n8n Lite MCP Server running on stdio');
    }
}

log('Initializing server class...');
const server = new N8nLiteServer();
server.run().catch((err) => {
    log(`CRITICAL ERROR: ${err.message}`);
    console.error(err);
});
