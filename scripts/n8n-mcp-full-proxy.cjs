#!/usr/bin/env node
/**
 * n8n MCP Full Proxy Server
 * 
 * Spawns npx n8n-mcp as a subprocess and forwards stdin/stdout.
 * This provides all 21 tools while adding a stability layer.
 * 
 * Environment Variables:
 *   N8N_API_URL - n8n API URL (required)
 *   N8N_API_KEY - n8n API key (required)
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Log file for debugging
const LOG_FILE = '/tmp/n8n-mcp-full-proxy.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('========== FULL PROXY STARTED ==========');
log(`N8N_API_URL: ${process.env.N8N_API_URL}`);
log(`N8N_API_KEY: ${process.env.N8N_API_KEY ? 'Set' : 'NOT SET'}`);

// Spawn npx n8n-mcp as subprocess
const child = spawn('npx', ['-y', 'n8n-mcp@2.29.5'], {
    env: {
        ...process.env,
        MCP_MODE: 'stdio',
        LOG_LEVEL: 'error'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

log(`Spawned npx n8n-mcp with PID: ${child.pid}`);

// Forward stdin to child
process.stdin.on('data', (data) => {
    const str = data.toString();
    log(`STDIN -> child: ${str.substring(0, 200)}`);
    child.stdin.write(data);
});

process.stdin.on('end', () => {
    log('stdin ended, closing child stdin');
    child.stdin.end();
});

// Forward child stdout to our stdout
child.stdout.on('data', (data) => {
    const str = data.toString();
    log(`child -> STDOUT: ${str.substring(0, 200)}`);
    process.stdout.write(data);
});

// Log child stderr
child.stderr.on('data', (data) => {
    log(`child STDERR: ${data.toString()}`);
});

// Handle child exit
child.on('close', (code) => {
    log(`Child process exited with code ${code}`);
    process.exit(code || 0);
});

child.on('error', (err) => {
    log(`Child process error: ${err.message}`);
    process.exit(1);
});

// Handle signals
process.on('SIGTERM', () => {
    log('SIGTERM received');
    child.kill('SIGTERM');
});

process.on('SIGINT', () => {
    log('SIGINT received');
    child.kill('SIGINT');
});

// Keep process alive
process.stdin.resume();
