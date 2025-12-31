#!/usr/bin/env node
/**
 * Stripe MCP Proxy Server
 * 
 * Spawns Stripe MCP as a subprocess and forwards stdin/stdout.
 * Provides stability layer to prevent blocking.
 * 
 * Environment Variables:
 *   STRIPE_API_KEY - Stripe API key (required)
 */

const { spawn } = require('child_process');
const fs = require('fs');

const LOG_FILE = '/tmp/stripe-mcp-proxy.log';
const STRIPE_API_KEY = process.env.STRIPE_API_KEY || '';

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('========== STRIPE MCP PROXY STARTED ==========');
log(`STRIPE_API_KEY: ${STRIPE_API_KEY ? 'Set' : 'NOT SET'}`);

// Spawn Stripe MCP as subprocess
const child = spawn('npx', ['-y', '@stripe/mcp', '--tools=all', `--api-key=${STRIPE_API_KEY}`], {
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe']
});

log(`Spawned Stripe MCP with PID: ${child.pid}`);

// Forward stdin to child
process.stdin.on('data', (data) => {
    child.stdin.write(data);
});

process.stdin.on('end', () => {
    child.stdin.end();
});

// Forward child stdout to our stdout
child.stdout.on('data', (data) => {
    process.stdout.write(data);
});

// Log child stderr
child.stderr.on('data', (data) => {
    log(`STDERR: ${data.toString()}`);
});

// Handle child exit
child.on('close', (code) => {
    log(`Exited with code ${code}`);
    process.exit(code || 0);
});

child.on('error', (err) => {
    log(`Error: ${err.message}`);
    process.exit(1);
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
process.stdin.resume();
