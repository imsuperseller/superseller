#!/usr/bin/env node
/**
 * Firebase MCP Proxy Server
 * 
 * Spawns firebase-tools mcp as a subprocess and forwards stdin/stdout.
 * Provides stability layer to prevent blocking.
 */

const { spawn } = require('child_process');
const fs = require('fs');

const LOG_FILE = '/tmp/firebase-mcp-proxy.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

log('========== FIREBASE MCP PROXY STARTED ==========');

// Spawn firebase-tools mcp as subprocess
const child = spawn('npx', ['-y', 'firebase-tools@latest', 'mcp'], {
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe']
});

log(`Spawned firebase-tools mcp with PID: ${child.pid}`);

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
