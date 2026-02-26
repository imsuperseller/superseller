#!/usr/bin/env node

/**
 * Fix node types in Tax4Us Blog Master workflow
 * Problem: Node types missing "n8n-" prefix (e.g., "nodes-base.airtableTool" instead of "n8n-nodes-base.airtableTool")
 * Solution: Fetch workflow, fix all node types, update workflow
 */

const https = require('https');

const N8N_API_URL = 'https://tax4usllc.app.n8n.cloud/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw';
const WORKFLOW_ID = 'GRlA3iuB7A8y8xFJ';

// Node type mapping: incorrect -> correct
const NODE_TYPE_FIXES = {
  'nodes-base.airtableTool': 'n8n-nodes-base.airtableTool',
  'nodes-base.wordpressTool': 'n8n-nodes-base.wordpressTool',
  'nodes-base.slackTool': 'n8n-nodes-base.slackTool',
  '@tavily/n8n-nodes-tavily.tavilyTool': '@tavily/n8n-nodes-tavily.tavilyTool', // Already correct
};

// Slack operation fixes: incorrect -> correct
const SLACK_OPERATION_FIXES = {
  'message': 'post',
  'sendMessage': 'post',
  'send': 'post',
};

function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_API_URL);
    const options = {
      method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getWorkflow(workflowId) {
  console.log(`📥 Fetching workflow ${workflowId}...`);
  const workflow = await apiRequest('GET', `/workflows/${workflowId}`);
  console.log(`✅ Fetched workflow: ${workflow.name}`);
  console.log(`   Nodes: ${workflow.nodes.length}, Connections: ${Object.keys(workflow.connections).length}`);
  return workflow;
}

async function updateWorkflow(workflowId, workflow) {
  console.log(`📤 Updating workflow ${workflowId}...`);
  const updated = await apiRequest('PUT', `/workflows/${workflowId}`, workflow);
  console.log(`✅ Updated workflow: ${updated.name}`);
  return updated;
}

function fixNodeTypes(workflow) {
  console.log('\n🔧 Fixing node types...');
  let fixedCount = 0;

  workflow.nodes.forEach((node) => {
    const originalType = node.type;

    // Fix node types
    if (NODE_TYPE_FIXES[originalType]) {
      node.type = NODE_TYPE_FIXES[originalType];
      console.log(`   ✓ ${node.name}: ${originalType} → ${node.type}`);
      fixedCount++;
    }

    // Fix Slack operations
    if (node.type === 'n8n-nodes-base.slack' && node.parameters?.operation) {
      const originalOp = node.parameters.operation;
      if (SLACK_OPERATION_FIXES[originalOp]) {
        node.parameters.operation = SLACK_OPERATION_FIXES[originalOp];
        console.log(`   ✓ ${node.name}: operation "${originalOp}" → "${node.parameters.operation}"`);
        fixedCount++;
      }
    }

    // Fix Code node return structure (if needed)
    if (node.type === 'n8n-nodes-base.code' && node.name === 'Code in JavaScript1') {
      // Check if code returns primitive value
      const code = node.parameters?.jsCode || '';
      if (code.includes('return ') && !code.includes('return [') && !code.includes('return {')) {
        console.log(`   ⚠️  ${node.name}: May need manual code fix (returning primitive value)`);
      }
    }
  });

  console.log(`\n✅ Fixed ${fixedCount} node issues`);
  return workflow;
}

async function main() {
  try {
    console.log('🚀 Tax4Us Blog Master Workflow Fixer\n');

    // 1. Fetch workflow
    const workflow = await getWorkflow(WORKFLOW_ID);

    // 2. Fix node types
    const fixed = fixNodeTypes(workflow);

    // 3. Update workflow
    await updateWorkflow(WORKFLOW_ID, fixed);

    console.log('\n✨ All done! Workflow fixed successfully.');
    console.log('\n📝 Next steps:');
    console.log('   1. Validate workflow using n8n MCP: mcp__superseller-n8n__n8n_validate_workflow');
    console.log('   2. Check execution logs: https://n8n.superseller.agency/workflow/GRlA3iuB7A8y8xFJ/executions');
    console.log('   3. Activate workflow when ready');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
