#!/usr/bin/env node

/**
 * Custom n8n SSE Proxy for Antigravity
 * Connects to n8n SSE endpoint and bridges to stdio for MCP
 */

const { EventSource } = require('eventsource');
const axios = require('axios');
const readline = require('readline');

const fs = require('fs');
const path = require('path');

// Configuration
const N8N_HOST = 'http://172.245.56.50:5678';
const N8N_PATH = '/mcp/907043da-60a4-4729-882d-d3205ff386fa';
const N8N_URL = `${N8N_HOST}${N8N_PATH}`;
const LOG_FILE = path.join(__dirname, 'proxy.log');

// State
let postEndpoint = null;
let eventSource = null;
let pendingRequests = [];

// Logging
function log(msg) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, logMsg);
    console.error(`[n8n-proxy] ${msg}`);
}

// Initialize SSE Connection
function connectSSE() {
    log(`Connecting to SSE: ${N8N_URL}`);

    eventSource = new EventSource(N8N_URL, {
        headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'User-Agent': 'curl/8.7.1'
        }
    });

    eventSource.onopen = () => {
        log('SSE Connection opened');
    };

    eventSource.onmessage = (event) => {
        log(`Received SSE message: ${event.data}`);
        try {
            // Forward JSON-RPC messages from n8n to Antigravity (stdout)
            const data = JSON.parse(event.data);
            const responseStr = JSON.stringify(data);
            log(`Sending to stdout: ${responseStr}`);
            console.log(responseStr);
        } catch (e) {
            log(`Error parsing SSE data: ${e.message}`);
        }
    };

    eventSource.addEventListener('endpoint', (event) => {
        log(`Received endpoint event: ${event.data}`);
        // event.data is the relative path with session ID, e.g. /mcp/UUID?sessionId=...
        postEndpoint = `${N8N_HOST}${event.data}`;
        log(`POST Endpoint set: ${postEndpoint}`);

        // Flush pending requests
        if (pendingRequests.length > 0) {
            log(`Flushing ${pendingRequests.length} pending requests...`);
            pendingRequests.forEach(req => forwardRequest(req));
            pendingRequests = [];
        }
    });

    eventSource.onerror = (err) => {
        log(`SSE Error: ${JSON.stringify(err)}`);
        // Attempt to reconnect after a delay
        if (eventSource) {
            eventSource.close();
        }
        log('Attempting to reconnect in 5 seconds...');
        setTimeout(connectSSE, 5000);
    };
}

async function forwardRequest(request) {
    if (!postEndpoint) {
        log('Queueing request (no endpoint yet)');
        pendingRequests.push(request);
        return;
    }

    try {
        log(`Forwarding request ${request.id} (${request.method}) to ${postEndpoint}`);
        const response = await axios.post(postEndpoint, request, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 300000 // 300 second timeout (5 minutes)
        });
        log(`Forward request success: ${response.status}`);
        // Note: The response will come back via the SSE stream (onmessage)
    } catch (e) {
        log(`Error forwarding request: ${e.message}`);
        if (e.response) {
            log(`Response: ${e.response.status} ${JSON.stringify(e.response.data)}`);
        }
    }
}

// Handle Process Exit
process.on('exit', (code) => {
    log(`Process exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`);
    log(err.stack);
    process.exit(1);
});

// Handle Stdin (JSON-RPC requests from Antigravity)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', async (line) => {
    if (!line.trim()) return;

    try {
        log(`Received Stdin: ${line}`);
        const request = JSON.parse(line);
        // log(`Received Stdin: ${request.method}`);

        // Handle 'initialize' locally to keep Antigravity happy immediately
        if (request.method === 'initialize') {
            const response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: 'n8n-rensto-proxy',
                        version: '1.0.0'
                    }
                }
            };
            console.log(JSON.stringify(response));

            // Start SSE connection after initialization
            connectSSE();
            return;
        }

        // Handle 'notifications/initialized' - do not forward to n8n
        if (request.method === 'notifications/initialized') {
            log('Skipping notifications/initialized forwarding');
            return;
        }

        // Forward all other requests (tools/list, tools/call, etc.) to n8n
        forwardRequest(request);

    } catch (e) {
        log(`Error processing stdin: ${e.message}`);
    }
});

log('n8n-proxy started');
