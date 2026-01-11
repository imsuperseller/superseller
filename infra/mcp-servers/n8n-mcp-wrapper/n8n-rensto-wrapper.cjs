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
const fs = require('fs');

// Log startup (to file for debugging)
const logFile = '/tmp/n8n-rensto-wrapper.log';
try {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Wrapper starting\n`);
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] PID: ${process.pid}\n`);
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Env vars check:\n`);
  fs.appendFileSync(logFile, `  N8N_API_URL: ${process.env.N8N_API_URL || 'NOT SET'}\n`);
} catch (e) {
  // Ignore log errors
}

// Set environment variables explicitly
process.env.MCP_MODE = 'stdio';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_CONSOLE_OUTPUT = 'true';
process.env.N8N_API_URL = 'https://n8n.rensto.com';
process.env.N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY2OTM4NjY0fQ.3itUOIDGe-_0vpK4K0X0a99YRh8puycRXnqz_sQwtbE';
process.env.N8N_INSTANCE_ID = 'rensto-selfhosted';
process.env.ENABLE_ALL_TOOLS = 'true';
process.env.NODE_DB_PATH = '/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/data/nodes.db';

try {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Env vars set, spawning n8n-mcp\n`);
} catch (e) { }

// Path to n8n-mcp entry point
const n8nMcpPath = '/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js';
const n8nMcpDir = '/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp';

// Spawn n8n-mcp with environment variables
// Set cwd to n8n-mcp directory so it can find the database
const n8nMcp = spawn('node', [n8nMcpPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env,
  cwd: n8nMcpDir
});

n8nMcp.on('error', (error) => {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR: ${error.message}\n`);
  } catch (e) { }
  console.error('[n8n-rensto-wrapper] Failed to start n8n-mcp:', error);
  process.exit(1);
});

n8nMcp.on('exit', (code) => {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] n8n-mcp exited with code: ${code}\n`);
  } catch (e) { }
  process.exit(code || 0);
});

