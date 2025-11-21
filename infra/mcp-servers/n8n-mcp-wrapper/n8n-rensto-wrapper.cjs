#!/usr/bin/env node

/**
 * n8n-MCP Wrapper for Rensto Instance
 * 
 * This wrapper ensures environment variables are properly set before
 * spawning the n8n-mcp server, working around Cursor's env var passing bug.
 * 
 * Usage in ~/.cursor/mcp.json:
 * {
 *   "n8n-rensto": {
 *     "command": "node",
 *     "args": ["/path/to/n8n-rensto-wrapper.js"]
 *   }
 * }
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables explicitly
process.env.MCP_MODE = 'stdio';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_CONSOLE_OUTPUT = 'true';
process.env.N8N_API_URL = 'http://173.254.201.134:5678';
process.env.N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ';
process.env.N8N_INSTANCE_ID = 'rensto-selfhosted';
process.env.ENABLE_ALL_TOOLS = 'true';

// Path to n8n-mcp entry point
const n8nMcpPath = '/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js';

// Spawn n8n-mcp with environment variables
const n8nMcp = spawn('node', [n8nMcpPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env
});

n8nMcp.on('error', (error) => {
  console.error('[n8n-rensto-wrapper] Failed to start n8n-mcp:', error);
  process.exit(1);
});

n8nMcp.on('exit', (code) => {
  process.exit(code || 0);
});

