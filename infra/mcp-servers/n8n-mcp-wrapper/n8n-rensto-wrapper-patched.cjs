#!/usr/bin/env node

// Wrapper for n8n-mcp that patches cleanWorkflowForUpdate before starting
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PATCH_FILE = '/app/dist/services/n8n-validation.js';

function patchFile() {
  try {
    // Read the file
    let content = fs.readFileSync(PATCH_FILE, 'utf8');
    
    // Check if already patched
    if (content.includes('webhookId, activeVersion, activeVersionId')) {
      console.error('[n8n-mcp-wrapper] File already patched');
      return true;
    }
    
    // Patch the function
    const oldPattern = /const \{ id, createdAt, updatedAt, versionId, versionCounter, meta, staticData, pinData, tags, description, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, \.\.\.cleanedWorkflow \} = workflow;/;
    const newPattern = 'const { id, createdAt, updatedAt, versionId, versionCounter, meta, staticData, pinData, tags, description, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, webhookId, activeVersion, activeVersionId, ...cleanedWorkflow } = workflow;';
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(PATCH_FILE, content, 'utf8');
      console.error('[n8n-mcp-wrapper] Patched cleanWorkflowForUpdate with webhookId, activeVersion, activeVersionId');
      return true;
    } else {
      console.error('[n8n-mcp-wrapper] Pattern not found - file may have different structure');
      return false;
    }
  } catch (error) {
    console.error('[n8n-mcp-wrapper] Patch failed:', error.message);
    return false;
  }
}

// This won't work because we're running inside Docker and the file is in the image
// We need to patch it differently - use a volume mount or entrypoint override

// For now, just spawn the original command
const dockerArgs = [
  'run',
  '-i',
  '--rm',
  '--init',
  '-e', 'MCP_MODE=stdio',
  '-e', 'LOG_LEVEL=error',
  '-e', 'DISABLE_CONSOLE_OUTPUT=true',
  '-e', `N8N_API_URL=${process.env.N8N_API_URL || 'http://173.254.201.134:5678'}`,
  '-e', `N8N_API_KEY=${process.env.N8N_API_KEY || ''}`,
  'ghcr.io/czlonkowski/n8n-mcp:2.26.5',
  'sh', '-c', `
    node -e "
      const fs = require('fs');
      const file = '/app/dist/services/n8n-validation.js';
      let content = fs.readFileSync(file, 'utf8');
      const oldPattern = /const \\{ id, createdAt, updatedAt, versionId, versionCounter, meta, staticData, pinData, tags, description, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, \\.\\.\\.cleanedWorkflow \\} = workflow;/;
      const newPattern = 'const { id, createdAt, updatedAt, versionId, versionCounter, meta, staticData, pinData, tags, description, isArchived, usedCredentials, sharedWithProjects, triggerCount, shared, active, webhookId, activeVersion, activeVersionId, ...cleanedWorkflow } = workflow;';
      if (oldPattern.test(content)) {
        content = content.replace(oldPattern, newPattern);
        fs.writeFileSync(file, content, 'utf8');
      }
    " && node /app/dist/index.js
  `
];

const docker = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  env: process.env
});

docker.on('error', (error) => {
  console.error('[n8n-mcp-wrapper] Failed to start:', error);
  process.exit(1);
});

docker.on('exit', (code) => {
  process.exit(code || 0);
});

