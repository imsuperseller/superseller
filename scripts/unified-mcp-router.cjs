#!/usr/bin/env node
/**
 * Unified MCP Router Proxy
 * 
 * Single MCP server that routes to multiple downstream services:
 * - n8n (via HTTP MCP endpoint)
 * - Firebase (via spawned subprocess)
 * - GitHub (via spawned subprocess)
 * - Stripe (via spawned subprocess)
 * 
 * This pattern prevents the blocking issue when multiple MCP servers are configured.
 */

const { spawn } = require('child_process');
const https = require('https');
const http = require('http');
const fs = require('fs');

const LOG_FILE = '/tmp/unified-mcp-router.log';

// Configuration
const CONFIG = {
    n8n: {
        url: process.env.N8N_MCP_URL || 'https://n8n.rensto.com/mcp-server/http',
        token: process.env.N8N_MCP_TOKEN || ''
    },
    stripe: {
        apiKey: process.env.STRIPE_API_KEY || ''
    },
    github: {
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || ''
    }
};

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('========== UNIFIED MCP ROUTER STARTED ==========');
log(`N8N URL: ${CONFIG.n8n.url}`);

// Parse n8n URL
const n8nUrl = new URL(CONFIG.n8n.url);
const httpModule = n8nUrl.protocol === 'https:' ? https : http;

// Route request to n8n HTTP endpoint
function sendToN8n(jsonRpcRequest) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(jsonRpcRequest);
        const options = {
            hostname: n8nUrl.hostname,
            port: n8nUrl.port || (n8nUrl.protocol === 'https:' ? 443 : 80),
            path: n8nUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        if (CONFIG.n8n.token) {
            options.headers['Authorization'] = `Bearer ${CONFIG.n8n.token}`;
        }

        const req = httpModule.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 202) {
                    resolve(null);
                    return;
                }
                // Parse SSE format
                if (data.includes('data: ')) {
                    const lines = data.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                resolve(JSON.parse(line.substring(6)));
                                return;
                            } catch (e) { }
                        }
                    }
                }
                try {
                    resolve(data.trim() ? JSON.parse(data) : null);
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}`));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.write(postData);
        req.end();
    });
}

let pendingRequests = 0;

async function handleRequest(line) {
    pendingRequests++;
    try {
        const request = JSON.parse(line);
        const method = request.method;
        const isNotification = method && method.startsWith('notifications/');

        if (!request.params) request.params = {};

        // Add clientInfo for initialize
        if (method === 'initialize' && !request.params.clientInfo) {
            request.params.clientInfo = { name: 'unified-mcp-router', version: '1.0.0' };
        }

        // Route to n8n (primary handler for now)
        const response = await sendToN8n(request);

        if (response !== null && request.id !== undefined) {
            process.stdout.write(JSON.stringify(response) + '\n');
        }
    } catch (error) {
        log(`ERROR: ${error.message}`);
        let id = null;
        try { id = JSON.parse(line).id; } catch (e) { }
        if (id !== undefined && id !== null) {
            const errorResponse = {
                jsonrpc: '2.0',
                error: { code: -32603, message: error.message },
                id: id
            };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
    } finally {
        pendingRequests--;
    }
}

let buffer = '';
process.stdin.on('data', (chunk) => {
    buffer += chunk.toString();
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        if (line) handleRequest(line);
    }
});

process.stdin.on('end', () => {
    const checkPending = () => {
        if (pendingRequests === 0) process.exit(0);
        else setTimeout(checkPending, 100);
    };
    checkPending();
});

process.stdin.resume();
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
