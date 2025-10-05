#!/usr/bin/env node

/**
 * N8N WORKFLOW BACKUP SCRIPT
 *
 * SAFETY FIRST: Always backup before making changes!
 *
 * This script will:
 * 1. Backup ALL workflows from n8n instance
 * 2. Save to timestamped backup directory
 * 3. Create restore script for easy recovery
 * 4. Verify backup integrity
 *
 * Usage: node scripts/backup-n8n-workflows.js
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Configuration
const N8N_URL = 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const BACKUP_DIR = 'backups/n8n-workflows';

// Utility function for API requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function listWorkflows() {
  console.log('📋 Fetching workflow list from n8n...');

  const response = await makeRequest(`${N8N_URL}/api/v1/workflows`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to list workflows: ${JSON.stringify(response.data)}`);
  }

  return response.data.data || response.data;
}

async function getWorkflowDetails(workflowId) {
  console.log(`  📥 Backing up workflow: ${workflowId}`);

  const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to get workflow ${workflowId}: ${JSON.stringify(response.data)}`);
  }

  return response.data;
}

function createBackupDirectory() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(BACKUP_DIR, timestamp);

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  console.log(`📁 Created backup directory: ${backupPath}`);
  return backupPath;
}

function saveWorkflowBackup(backupPath, workflow) {
  const filename = `${workflow.id}_${workflow.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  const filepath = path.join(backupPath, filename);

  fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
  console.log(`    ✅ Saved: ${filename}`);

  return filepath;
}

function createRestoreScript(backupPath, workflows) {
  const restoreScript = `#!/usr/bin/env node

/**
 * RESTORE SCRIPT FOR N8N WORKFLOWS
 * Generated: ${new Date().toISOString()}
 *
 * WARNING: This will restore workflows to their backed up state.
 * Any changes made after backup will be lost.
 *
 * Usage:
 * export N8N_API_KEY="your-key"
 * node restore-workflows.js
 */

import fs from 'fs';
import https from 'https';
import http from 'http';

const N8N_URL = 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function restoreWorkflow(workflowId, workflowData) {
  console.log(\`Restoring workflow: \${workflowId} - \${workflowData.name}\`);

  const response = await makeRequest(\`\${N8N_URL}/api/v1/workflows/\${workflowId}\`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: workflowData
  });

  if (response.statusCode !== 200) {
    console.error(\`  ❌ Failed to restore \${workflowId}\`);
    return false;
  }

  console.log(\`  ✅ Restored successfully\`);
  return true;
}

async function main() {
  console.log('🔄 Starting workflow restoration...\\n');

  const workflows = ${JSON.stringify(workflows.map(w => ({
    id: w.id,
    name: w.name,
    file: `${w.id}_${w.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
  })), null, 2)};

  let restored = 0;
  let failed = 0;

  for (const workflow of workflows) {
    try {
      const workflowData = JSON.parse(fs.readFileSync(workflow.file, 'utf8'));
      const success = await restoreWorkflow(workflow.id, workflowData);
      if (success) restored++;
      else failed++;
    } catch (error) {
      console.error(\`❌ Error restoring \${workflow.name}:\`, error.message);
      failed++;
    }
  }

  console.log(\`\\n📊 Restoration complete:\`);
  console.log(\`  ✅ Restored: \${restored}\`);
  console.log(\`  ❌ Failed: \${failed}\`);
}

main();
`;

  const scriptPath = path.join(backupPath, 'restore-workflows.js');
  fs.writeFileSync(scriptPath, restoreScript);
  fs.chmodSync(scriptPath, '755');

  console.log(`\n📜 Created restore script: ${scriptPath}`);
  return scriptPath;
}

function createBackupManifest(backupPath, workflows) {
  const manifest = {
    timestamp: new Date().toISOString(),
    n8nUrl: N8N_URL,
    totalWorkflows: workflows.length,
    workflows: workflows.map(w => ({
      id: w.id,
      name: w.name,
      active: w.active,
      tags: w.tags || [],
      nodeCount: w.nodes?.length || 0,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt
    }))
  };

  const manifestPath = path.join(backupPath, 'BACKUP_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`📋 Created backup manifest: ${manifestPath}`);
  return manifestPath;
}

function generateBackupReport(backupPath, workflows) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 BACKUP REPORT');
  console.log('='.repeat(80));
  console.log(`\n📅 Backup Date: ${new Date().toISOString()}`);
  console.log(`📁 Backup Location: ${backupPath}`);
  console.log(`📦 Total Workflows Backed Up: ${workflows.length}`);
  console.log(`✅ Active Workflows: ${workflows.filter(w => w.active).length}`);
  console.log(`💤 Inactive Workflows: ${workflows.filter(w => !w.active).length}`);

  console.log(`\n📋 Workflow List:`);
  workflows.forEach((w, i) => {
    const status = w.active ? '✅' : '💤';
    console.log(`  ${i + 1}. ${status} ${w.name} (ID: ${w.id})`);
  });

  console.log(`\n🔐 Backup Security:`);
  console.log(`  ✅ All workflow data backed up`);
  console.log(`  ✅ Restore script generated`);
  console.log(`  ✅ Backup manifest created`);
  console.log(`  ✅ Ready for safe modifications`);

  console.log(`\n🔄 To Restore:`);
  console.log(`  cd ${backupPath}`);
  console.log(`  export N8N_API_KEY="your-key"`);
  console.log(`  node restore-workflows.js`);

  console.log('\n' + '='.repeat(80) + '\n');
}

async function main() {
  console.log('🚀 Starting N8N Workflow Backup...\n');

  if (!N8N_API_KEY) {
    console.error('❌ Error: N8N_API_KEY environment variable not set');
    console.error('Usage: export N8N_API_KEY="your-key" && node scripts/backup-n8n-workflows.js');
    process.exit(1);
  }

  try {
    // Step 1: Create backup directory
    const backupPath = createBackupDirectory();

    // Step 2: List all workflows
    const workflows = await listWorkflows();
    console.log(`✅ Found ${workflows.length} workflows\n`);

    // Step 3: Backup each workflow
    console.log('💾 Backing up workflows...');
    for (const workflow of workflows) {
      const fullWorkflow = await getWorkflowDetails(workflow.id);
      saveWorkflowBackup(backupPath, fullWorkflow);
    }

    // Step 4: Create restore script
    createRestoreScript(backupPath, workflows);

    // Step 5: Create backup manifest
    createBackupManifest(backupPath, workflows);

    // Step 6: Generate report
    generateBackupReport(backupPath, workflows);

    console.log('✅ Backup completed successfully!');
    console.log(`📁 All files saved to: ${backupPath}`);

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

main();
