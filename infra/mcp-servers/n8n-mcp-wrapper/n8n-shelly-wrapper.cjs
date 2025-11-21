#!/usr/bin/env node

/**
 * n8n-MCP Wrapper for Shelly Instance
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables explicitly
process.env.MCP_MODE = 'stdio';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_CONSOLE_OUTPUT = 'true';
process.env.N8N_API_URL = 'https://shellyins.app.n8n.cloud';
process.env.N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc';
process.env.N8N_INSTANCE_ID = 'shelly-cloud';
process.env.ENABLE_ALL_TOOLS = 'true';

// Path to n8n-mcp entry point
const n8nMcpPath = '/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js';

// Spawn n8n-mcp with environment variables
const n8nMcp = spawn('node', [n8nMcpPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env
});

n8nMcp.on('error', (error) => {
  console.error('[n8n-shelly-wrapper] Failed to start n8n-mcp:', error);
  process.exit(1);
});

n8nMcp.on('exit', (code) => {
  process.exit(code || 0);
});

