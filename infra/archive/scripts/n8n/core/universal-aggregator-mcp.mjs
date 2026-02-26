#!/usr/bin/env node

/**
 * Universal Aggregator MCP Server (High-Performance Edition)
 * Unifies n8n, Stripe, and Firebase into a stable, single-process server.
 * Optimized with caching, truncation, and 30-second timeouts.
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
const TRUNCATION_LIMIT = 50000; // 50KB - Safe for Opus
const DEFAULT_TIMEOUT = 300000; // 5 Minutes - For long running workflows

function log(msg) {
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        process.stderr.write(`[LOG ERROR] ${e.message}\n`);
    }
}

log('--- UNIVERSAL AGGREGATOR STARTING (OPTIMIZED) ---');

// Robust Error Handling for Process Stability
process.on('uncaughtException', (error) => {
    log(`FATAL: Uncaught Exception - ${error.message}`);
    log(error.stack);
    // Only exit if the error is truly critical (e.g., pipe broken)
    if (error.code === 'EPIPE' || error.message.includes('EBADF')) {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    log(`WARNING: Unhandled Rejection at: ${promise} reason: ${reason}`);
    // Do not exit on unhandled rejections to maintain IDE stability
});

process.on('SIGTERM', () => {
    log('Received SIGTERM - Shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('Received SIGINT - Shutting down gracefully');
    process.exit(0);
});

class UniversalAggregator {
    constructor() {
        this.server = new Server(
            {
                name: 'universal-aggregator',
                version: '1.3.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Multi-instance n8n configuration - synchronous, no async work here
        this.instances = {
            'superseller': {
                url: process.env.N8N_RENSTO_URL || 'http://n8n.superseller.agency',
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
        this.cache = {};
        this.CACHE_TTL = 60000; // 60 seconds

        // Set up handlers IMMEDIATELY - this is the critical path for IDE startup
        this.setupHandlers();

        // Non-critical logging deferred to after handlers are ready
        setImmediate(() => {
            Object.entries(this.instances).forEach(([name, config]) => {
                if (!config.key) log(`INFO: Key for n8n instance '${name}' is not set`);
            });
            if (!this.stripeKey) log('INFO: STRIPE_API_KEY is not set');
        });
    }

    // --- SERVICE HELPERS ---

    async n8nRequest(instanceName, method, endpoint, data = null) {
        const config = this.instances[instanceName] || this.instances['superseller'];

        if (!config.key) {
            log(`n8n Error [${instanceName}]: API Key missing`);
            throw new Error(`n8n [${instanceName}]: Configuration Error - API Key is missing. Please check .env file.`);
        }

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
                timeout: DEFAULT_TIMEOUT,
                maxContentLength: 10000000, // 10MB Max - Prevent OOM crashes
                maxBodyLength: 10000000 // 10MB Max
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
                timeout: DEFAULT_TIMEOUT
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
                timeout: DEFAULT_TIMEOUT
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
                                instance: { type: 'string', enum: instanceEnum, default: 'superseller' },
                                limit: { type: 'number', default: 20 }
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
                                instance: { type: 'string', enum: instanceEnum, default: 'superseller' }
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
                                instance: { type: 'string', enum: instanceEnum, default: 'superseller' },
                                data: { type: 'object' }
                            },
                            required: ['id']
                        }
                    },
                    { name: 'stripe_list_customers', description: 'List Stripe customers', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
                    { name: 'stripe_get_balance', description: 'Get Stripe balance', inputSchema: { type: 'object' } },
                    { name: 'stripe_list_invoices', description: 'List invoices', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
                    { name: 'firebase_list_projects', description: 'List Firebase projects', inputSchema: { type: 'object' } },
                    { name: 'firebase_deploy', description: 'Deploy to Firebase', inputSchema: { type: 'object', properties: { project: { type: 'string' } }, required: ['project'] } },
                    { name: 'get_status', description: 'Get server health and environment status', inputSchema: { type: 'object' } }
                ]
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            log(`Tool Call Requested: ${name}`);

            try {
                let result = null;
                if (name.startsWith('n8n_')) {
                    const inst = args.instance || 'superseller';
                    if (name === 'n8n_list_workflows') {
                        const cacheKey = `n8n_list_${inst}_${args.limit || 20}`;
                        if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].time < this.CACHE_TTL)) {
                            log(`Using cached result for ${cacheKey}`);
                            result = this.cache[cacheKey].data;
                        } else {
                            const rawResult = await this.n8nRequest(inst, 'GET', `/workflows?limit=${args.limit || 20}`);
                            // Optimize: Only return essential fields to reduce payload size
                            if (rawResult && Array.isArray(rawResult.data)) {
                                result = {
                                    ...rawResult,
                                    data: rawResult.data.map(w => ({
                                        id: w.id,
                                        name: w.name,
                                        active: w.active,
                                        createdAt: w.createdAt,
                                        updatedAt: w.updatedAt
                                    }))
                                };
                            } else {
                                result = rawResult;
                            }
                            this.cache[cacheKey] = { data: result, time: Date.now() };
                        }
                    } else if (name === 'n8n_get_workflow') {
                        result = await this.n8nRequest(inst, 'GET', `/workflows/${args.id}`);
                    } else if (name === 'n8n_execute_workflow') {
                        result = await this.n8nRequest(inst, 'POST', `/workflows/${args.id}/run`, args.data || {});
                    }
                } else if (name.startsWith('stripe_')) {
                    if (name === 'stripe_list_customers') {
                        result = await this.stripeRequest('GET', '/customers', args);
                    } else if (name === 'stripe_get_balance') {
                        result = await this.stripeRequest('GET', '/balance');
                    } else if (name === 'stripe_list_invoices') {
                        result = await this.stripeRequest('GET', '/invoices', args);
                    }
                } else if (name.startsWith('firebase_')) {
                    if (name === 'firebase_list_projects') {
                        const cacheKey = 'firebase_projects';
                        if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].time < 300000)) { // 5 min cache for firebase
                            log('Using cached result for firebase_projects');
                            result = this.cache[cacheKey].data;
                        } else {
                            const raw = await this.runFirebase('projects:list --json');
                            result = JSON.parse(raw || '{}');
                            this.cache[cacheKey] = { data: result, time: Date.now() };
                        }
                    } else if (name === 'firebase_deploy') {
                        const raw = await this.runFirebase(`deploy --project ${args.project} --json`);
                        result = JSON.parse(raw || '{}');
                    }
                } else if (name === 'get_status') {
                    result = {
                        status: 'online',
                        version: '1.2.2',
                        uptime: process.uptime(),
                        instances: Object.keys(this.instances).map(id => ({
                            id,
                            hasKey: !!this.instances[id].key,
                            url: this.instances[id].url
                        })),
                        stripe: { hasKey: !!this.stripeKey }
                    };
                }

                let textResponse;
                try {
                    textResponse = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
                } catch (e) {
                    textResponse = `Error stringifying response: ${e.message}`;
                    log(`JSON Stringify Error: ${e.message}`);
                }

                if (textResponse.length > TRUNCATION_LIMIT) {
                    const originalLength = textResponse.length;
                    textResponse = textResponse.substring(0, TRUNCATION_LIMIT) +
                        `\n\n[TRUNCATED: Response was ${originalLength} chars, limit is ${TRUNCATION_LIMIT}. Use filters or specific IDs to get more data.]`;
                }

                return {
                    content: [{
                        type: 'text',
                        text: textResponse
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
