#!/usr/bin/env node

/**
 * Universal Aggregator MCP Server (High-Performance Edition)
 * Unifies n8n, Stripe, and Firebase into a stable, single-process server.
 * Optimized with async execution and 5-minute timeouts.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);
const LOG_FILE = '/tmp/universal-aggregator-mcp.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('--- UNIVERSAL AGGREGATOR STARTING (OPTIMIZED) ---');

class UniversalAggregator {
    constructor() {
        this.server = new Server(
            {
                name: 'universal-aggregator',
                version: '1.2.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Multi-instance n8n configuration
        this.instances = {
            'rensto': {
                url: process.env.N8N_RENSTO_URL || 'http://n8n.rensto.com',
                key: process.env.N8N_RENSTO_KEY || process.env.N8N_API_KEY
            },
            'tax4us': {
                url: process.env.N8N_TAX4US_URL || 'https://tax4usllc.app.n8n.cloud',
                key: process.env.N8N_TAX4US_KEY
            },
            'wondercare': {
                url: process.env.N8N_WONDERCARE_URL || 'http://192.227.249.73:5678',
                key: process.env.N8N_WONDERCARE_KEY
            }
        };

        this.stripeKey = process.env.STRIPE_API_KEY;

        // Logging status
        Object.entries(this.instances).forEach(([name, config]) => {
            if (!config.key) log(`WARNING: Key for n8n instance '${name}' is not set`);
        });
        if (!this.stripeKey) log('WARNING: STRIPE_API_KEY is not set');

        this.setupHandlers();
    }

    // --- SERVICE HELPERS ---

    async n8nRequest(instanceName, method, endpoint, data = null) {
        const config = this.instances[instanceName] || this.instances['rensto'];
        log(`n8n Request [${instanceName}]: ${method} ${endpoint}`);
        const startTime = Date.now();

        try {
            const res = await axios({
                method,
                url: `${config.url}/api/v1${endpoint}`,
                headers: {
                    'X-N8N-API-KEY': config.key,
                    'Content-Type': 'application/json'
                },
                data,
                timeout: 300000 // 5 minutes
            });
            log(`n8n Success [${instanceName}]: ${method} ${endpoint} (${Date.now() - startTime}ms)`);
            return res.data;
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            log(`n8n Error [${instanceName}]: ${method} ${endpoint} - ${msg} (${Date.now() - startTime}ms)`);
            throw new Error(`n8n [${instanceName}]: ${msg}`);
        }
    }

    async stripeRequest(method, endpoint, params = {}) {
        log(`Stripe Request: ${method} ${endpoint}`);
        const startTime = Date.now();
        try {
            const res = await axios({
                method,
                url: `https://api.stripe.com/v1${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.stripeKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: method === 'GET' ? params : undefined,
                data: method !== 'GET' ? new URLSearchParams(params).toString() : undefined,
                timeout: 60000
            });
            log(`Stripe Success: ${method} ${endpoint} (${Date.now() - startTime}ms)`);
            return res.data;
        } catch (error) {
            log(`Stripe Error: ${method} ${endpoint} - ${error.message} (${Date.now() - startTime}ms)`);
            throw error;
        }
    }

    async runFirebase(args) {
        log(`Firebase Operation: ${args}`);
        const startTime = Date.now();
        try {
            const { stdout } = await execAsync(`npx firebase-tools ${args}`, {
                timeout: 120000
            });
            log(`Firebase Success: ${args} (${Date.now() - startTime}ms)`);
            return stdout;
        } catch (error) {
            log(`Firebase Error: ${args} - ${error.message} (${Date.now() - startTime}ms)`);
            throw error;
        }
    }

    // --- MCP HANDLERS ---

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            log('Handling ListTools request');
            const instanceEnum = Object.keys(this.instances);

            return {
                tools: [
                    {
                        name: 'n8n_list_workflows',
                        description: 'List workflows from a specific n8n instance',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                instance: { type: 'string', enum: instanceEnum, default: 'rensto' },
                                limit: { type: 'number', default: 20 },
                                offset: { type: 'number' }
                            }
                        }
                    },
                    {
                        name: 'n8n_get_workflow',
                        description: 'Get workflow definition for analysis or editing',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                instance: { type: 'string', enum: instanceEnum, default: 'rensto' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'n8n_execute_workflow',
                        description: 'Trigger a workflow execution',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                instance: { type: 'string', enum: instanceEnum, default: 'rensto' },
                                data: { type: 'object' }
                            },
                            required: ['id']
                        }
                    },
                    { name: 'stripe_list_customers', description: 'List Stripe customers', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
                    { name: 'stripe_get_balance', description: 'Get Stripe balance', inputSchema: { type: 'object' } },
                    { name: 'stripe_list_invoices', description: 'List invoices', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
                    { name: 'firebase_list_projects', description: 'List Firebase projects', inputSchema: { type: 'object' } },
                    { name: 'firebase_deploy', description: 'Deploy to Firebase', inputSchema: { type: 'object', properties: { project: { type: 'string' } }, required: ['project'] } }
                ]
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            log(`Tool Call Requested: ${name}`);

            try {
                let result;
                if (name.startsWith('n8n_')) {
                    const inst = args.instance || 'rensto';
                    if (name === 'n8n_list_workflows') result = await this.n8nRequest(inst, 'GET', `/workflows?limit=${args.limit || 20}&offset=${args.offset || 0}`);
                    if (name === 'n8n_get_workflow') result = await this.n8nRequest(inst, 'GET', `/workflows/${args.id}`);
                    if (name === 'n8n_execute_workflow') result = await this.n8nRequest(inst, 'POST', `/workflows/${args.id}/run`, args.data || {});
                } else if (name.startsWith('stripe_')) {
                    if (name === 'stripe_list_customers') result = await this.stripeRequest('GET', '/customers', args);
                    if (name === 'stripe_get_balance') result = await this.stripeRequest('GET', '/balance');
                    if (name === 'stripe_list_invoices') result = await this.stripeRequest('GET', '/invoices', args);
                } else if (name.startsWith('firebase_')) {
                    if (name === 'firebase_list_projects') result = JSON.parse(await this.runFirebase('projects:list --json'));
                    if (name === 'firebase_deploy') result = JSON.parse(await this.runFirebase(`deploy --project ${args.project} --json`));
                }

                return {
                    content: [{
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                    }]
                };
            } catch (error) {
                log(`CRITICAL TOOL ERROR (${name}): ${error.message}`);
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
        log('Aggregator connected to stdio / Ready for requests');
    }
}

const aggregator = new UniversalAggregator();
aggregator.run().catch((err) => {
    log(`FATAL STARTUP ERROR: ${err.message}`);
    process.exit(1);
});
