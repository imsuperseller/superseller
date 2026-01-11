#!/usr/bin/env node

/**
 * n8n-mcp Local Server
 * Runs n8n-mcp locally in stdio mode, connecting to remote n8n instance
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables for n8n-mcp
process.env.MCP_MODE = 'stdio';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_CONSOLE_OUTPUT = 'true';
process.env.N8N_API_URL = process.env.N8N_API_URL || 'http://172.245.56.50:5678';
process.env.N8N_API_KEY = process.env.N8N_API_KEY || '';

// Find n8n-mcp binary
const n8nMcpBin = path.join(__dirname, 'node_modules', '.bin', 'n8n-mcp');

// Spawn n8n-mcp
const n8nMcp = spawn(n8nMcpBin, [], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: process.env
});

n8nMcp.on('error', (error) => {
    console.error('Failed to start n8n-mcp:', error);
    process.exit(1);
});

n8nMcp.on('exit', (code) => {
    process.exit(code || 0);
});

// Handle termination
process.on('SIGTERM', () => n8nMcp.kill('SIGTERM'));
process.on('SIGINT', () => n8nMcp.kill('SIGINT'));
