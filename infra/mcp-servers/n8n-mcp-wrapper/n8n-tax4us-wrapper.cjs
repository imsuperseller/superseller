#!/usr/bin/env node

/**
 * n8n-MCP Wrapper for Tax4Us Instance
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables explicitly
process.env.MCP_MODE = 'stdio';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_CONSOLE_OUTPUT = 'true';
process.env.N8N_API_URL = 'https://tax4usllc.app.n8n.cloud';
process.env.N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0NjA1OTA2fQ.J3vPZjOepbtoBoo_tFiFqbU0eNbrIUOp9V06UAFFUGQ';
process.env.N8N_INSTANCE_ID = 'tax4us-cloud';
process.env.ENABLE_ALL_TOOLS = 'true';

// Path to n8n-mcp entry point
const n8nMcpPath = '/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js';

// Spawn n8n-mcp with environment variables
const n8nMcp = spawn('node', [n8nMcpPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env
});

n8nMcp.on('error', (error) => {
  console.error('[n8n-tax4us-wrapper] Failed to start n8n-mcp:', error);
  process.exit(1);
});

n8nMcp.on('exit', (code) => {
  process.exit(code || 0);
});

