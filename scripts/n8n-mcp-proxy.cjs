#!/usr/bin/env node
/**
 * n8n MCP Proxy Server
 * 
 * Bridges stdio (for Antigravity/Gemini) to n8n's native HTTP MCP endpoint.
 * Receives JSON-RPC requests on stdin, forwards to n8n, returns responses on stdout.
 * 
 * Environment Variables:
 *   N8N_MCP_URL - n8n MCP HTTP endpoint (default: https://n8n.rensto.com/mcp-server/http)
 *   N8N_MCP_TOKEN - Bearer token for authentication
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Configuration
const N8N_MCP_URL = process.env.N8N_MCP_URL || 'https://n8n.rensto.com/mcp-server/http';
const N8N_MCP_TOKEN = process.env.N8N_MCP_TOKEN || '';

// Log file for debugging
const LOG_FILE = '/tmp/n8n-mcp-proxy.log';

// Parse URL
const url = new URL(N8N_MCP_URL);
const httpModule = url.protocol === 'https:' ? https : http;

// Track pending requests
let pendingRequests = 0;

// Log to file
function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('========== PROXY STARTED ==========');
log(`Target: ${N8N_MCP_URL}`);

// Send request to n8n MCP server
function sendToN8n(jsonRpcRequest, expectResponse = true) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(jsonRpcRequest);

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        if (N8N_MCP_TOKEN) {
            options.headers['Authorization'] = `Bearer ${N8N_MCP_TOKEN}`;
        }

        log(`SENDING: ${postData}`);

        const req = httpModule.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                log(`RESPONSE (${res.statusCode}): ${data.substring(0, 300)}`);

                // 202 Accepted means notification was received, no response expected
                if (res.statusCode === 202 || !expectResponse) {
                    resolve(null);
                    return;
                }

                // Parse SSE response format: event: message\ndata: {...}\n\n
                if (data.includes('event: message') || data.includes('data: ')) {
                    const lines = data.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                resolve(JSON.parse(line.substring(6)));
                                return;
                            } catch (e) {
                                log(`Parse error: ${e.message}`);
                            }
                        }
                    }
                    reject(new Error('No valid JSON in SSE response'));
                } else if (data.trim()) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Parse error: ${e.message}`));
                    }
                } else {
                    // Empty response
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            log(`Request error: ${e.message}`);
            reject(e);
        });

        req.setTimeout(60000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

// Handle incoming JSON-RPC request
async function handleRequest(line) {
    pendingRequests++;
    log(`RAW INPUT: ${line}`);

    try {
        const request = JSON.parse(line);
        const method = request.method;
        const isNotification = method && method.startsWith('notifications/');

        log(`PARSED: method=${method}, id=${request.id}, isNotification=${isNotification}`);

        // Ensure params exists
        if (!request.params) {
            request.params = {};
        }

        // Add clientInfo if missing for initialize
        if (method === 'initialize') {
            if (!request.params.clientInfo) {
                request.params.clientInfo = {
                    name: 'antigravity-proxy',
                    version: '1.0.0'
                };
            }
        }

        // Send to n8n
        const response = await sendToN8n(request, !isNotification);

        // Only send response back for requests (not notifications)
        if (response !== null && request.id !== undefined) {
            const responseStr = JSON.stringify(response);
            log(`OUTPUT: ${responseStr.substring(0, 300)}`);
            process.stdout.write(responseStr + '\n');
        } else if (isNotification) {
            log(`Notification ${method} sent, no response needed`);
        }

    } catch (error) {
        log(`ERROR: ${error.message}`);

        let id = null;
        try { id = JSON.parse(line).id; } catch (e) { }

        // Only send error response for requests with ID
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

// Buffer for incomplete lines
let buffer = '';

// Handle raw stdin data
process.stdin.on('data', (chunk) => {
    buffer += chunk.toString();

    // Process complete lines
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);

        if (line) {
            handleRequest(line);
        }
    }
});

process.stdin.on('end', () => {
    log('stdin ended');
    const checkPending = () => {
        if (pendingRequests === 0) {
            process.exit(0);
        } else {
            setTimeout(checkPending, 100);
        }
    };
    checkPending();
});

process.stdin.resume();

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
