#!/usr/bin/env node

/**
 * Stripe Lite MCP Server
 * Focuses on core billing and customer tools to keep tool count low for Opus 4.5 stability.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class StripeLiteServer {
    constructor() {
        this.server = new Server(
            {
                name: 'stripe-lite',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.apiKey = process.env.STRIPE_API_KEY;
        this.setupHandlers();
    }

    async makeRequest(method, endpoint, params = {}) {
        try {
            const response = await axios({
                method,
                url: `https://api.stripe.com/v1${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: method === 'GET' ? params : undefined,
                data: method !== 'GET' ? new URLSearchParams(params).toString() : undefined,
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            const msg = error.response?.data?.error?.message || error.message;
            throw new Error(`Stripe API error: ${msg}`);
        }
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'stripe_list_customers',
                        description: 'List Stripe customers',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                limit: { type: 'number', description: 'Maximum number of customers to return (default: 10)' },
                                email: { type: 'string', description: 'Filter by email' }
                            }
                        }
                    },
                    {
                        name: 'stripe_get_customer',
                        description: 'Retrieve a customer by ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Customer ID (cus_...)' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'stripe_list_invoices',
                        description: 'List recent invoices',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                limit: { type: 'number', description: 'Default is 10' },
                                customer: { type: 'string', description: 'Filter by customer ID' }
                            }
                        }
                    },
                    {
                        name: 'stripe_get_balance',
                        description: 'Get Stripe account balance',
                        inputSchema: {
                            type: 'object',
                            properties: {}
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
                    case 'stripe_list_customers': {
                        result = await this.makeRequest('GET', '/customers', args);
                        break;
                    }
                    case 'stripe_get_customer': {
                        result = await this.makeRequest('GET', `/customers/${args.id}`);
                        break;
                    }
                    case 'stripe_list_invoices': {
                        result = await this.makeRequest('GET', '/invoices', args);
                        break;
                    }
                    case 'stripe_get_balance': {
                        result = await this.makeRequest('GET', '/balance');
                        break;
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }

                return {
                    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: `Error: ${error.message}` }],
                    isError: true
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Stripe Lite MCP Server running on stdio');
    }
}

const server = new StripeLiteServer();
server.run().catch(console.error);
