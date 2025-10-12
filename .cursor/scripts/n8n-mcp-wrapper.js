#!/usr/bin/env node
/**
 * n8n-mcp Docker Wrapper (Node.js)
 * Purpose: Fixes stdin closing issue with n8n-mcp Docker container
 * Author: Claude AI (with Shai)
 * Date: October 9, 2025
 *
 * Problem: Docker stdio MCP servers close when stdin closes
 * Solution: Keep stdin open using Node.js stream management
 *
 * Usage: This script is called by Claude Code's MCP system
 * Configuration: Set in ~/.cursor/mcp.json
 */

const { spawn } = require('child_process');
const { createInterface } = require('readline');

// Get instance config from environment (set by MCP config)
const N8N_API_URL = process.env.N8N_API_URL || '';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const LOG_LEVEL = process.env.LOG_LEVEL || 'error';
const MCP_MODE = process.env.MCP_MODE || 'stdio';

// Validate required vars
if (!N8N_API_URL || !N8N_API_KEY) {
    console.error(JSON.stringify({
        error: 'Missing N8N_API_URL or N8N_API_KEY',
        provided: { N8N_API_URL: !!N8N_API_URL, N8N_API_KEY: !!N8N_API_KEY }
    }));
    process.exit(1);
}

// Spawn Docker container
const docker = spawn('docker', [
    'run',
    '-i',
    '--rm',
    '--init',
    '-e', `MCP_MODE=${MCP_MODE}`,
    '-e', `LOG_LEVEL=${LOG_LEVEL}`,
    '-e', 'DISABLE_CONSOLE_OUTPUT=true',
    '-e', `N8N_API_URL=${N8N_API_URL}`,
    '-e', `N8N_API_KEY=${N8N_API_KEY}`,
    'ghcr.io/czlonkowski/n8n-mcp:2.18.0'
], {
    stdio: ['pipe', 'pipe', 'pipe']
});

// Track if we're shutting down
let shuttingDown = false;

// Pipe stdin to Docker container
const rl = createInterface({
    input: process.stdin,
    output: docker.stdin,
    terminal: false
});

// Forward stdout from Docker to our stdout
docker.stdout.on('data', (data) => {
    process.stdout.write(data);
});

// Forward stderr from Docker to our stderr (filter out shutdown messages)
docker.stderr.on('data', (data) => {
    const msg = data.toString();
    // Filter out graceful shutdown messages
    if (!msg.includes('stdin closed') && !msg.includes('shutting down gracefully')) {
        process.stderr.write(data);
    }
});

// Handle stdin line by line
rl.on('line', (line) => {
    if (!shuttingDown) {
        docker.stdin.write(line + '\n');
    }
});

// When stdin closes, keep container alive briefly
process.stdin.on('end', () => {
    // Give container 5 seconds to finish any pending requests
    setTimeout(() => {
        if (!shuttingDown) {
            shuttingDown = true;
            docker.stdin.end();
        }
    }, 5000);
});

// Handle Docker exit
docker.on('close', (code) => {
    shuttingDown = true;
    if (code !== 0 && code !== null) {
        process.exit(code);
    }
    process.exit(0);
});

// Handle termination signals
process.on('SIGINT', () => {
    shuttingDown = true;
    docker.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    shuttingDown = true;
    docker.kill('SIGTERM');
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error(JSON.stringify({ error: 'Uncaught exception', message: err.message }));
    shuttingDown = true;
    docker.kill();
    process.exit(1);
});
