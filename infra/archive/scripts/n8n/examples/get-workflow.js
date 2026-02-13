#!/usr/bin/env node
/**
 * Get Workflow Details
 *
 * Fetches full workflow configuration and shows validation results.
 *
 * Usage:
 *   node scripts/n8n/examples/get-workflow.js tax4us zQIkACTYDgaehp6S
 *   node scripts/n8n/examples/get-workflow.js rensto <workflow-id>
 */

import { getConfig } from '../n8n-config.js';
import * as api from '../n8n-api.js';
import fs from 'fs';

async function main() {
  const instanceName = process.argv[2];
  const workflowId = process.argv[3];

  if (!instanceName || !workflowId) {
    console.error('❌ Usage: node get-workflow.js <instance> <workflow-id>');
    console.error('   Valid instances: rensto, tax4us, shelly');
    process.exit(1);
  }

  try {
    const config = getConfig(instanceName);
    console.log(`📥 Fetching workflow ${workflowId} from ${config.name}...\n`);

    const workflow = await api.getWorkflow(config, workflowId);

    console.log(`✅ Workflow: ${workflow.name}`);
    console.log(`   ID: ${workflow.id}`);
    console.log(`   Active: ${workflow.active ? '✅ Yes' : '❌ No'}`);
    console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
    console.log(`   Connections: ${Object.keys(workflow.connections || {}).length}`);
    console.log(`   Created: ${new Date(workflow.createdAt).toLocaleString()}`);
    console.log(`   Updated: ${new Date(workflow.updatedAt).toLocaleString()}`);

    // Validation
    console.log('\n🔍 Validation:');
    const validation = await api.validateWorkflow(config, workflowId);
    if (validation.valid) {
      console.log('   ✅ Workflow is valid');
    } else {
      console.log('   ❌ Workflow has issues:');
      validation.issues.forEach((issue) => console.log(`      - ${issue}`));
    }

    // Node breakdown
    console.log('\n📦 Nodes:');
    const nodeTypes = {};
    workflow.nodes?.forEach((node) => {
      const type = node.type.replace('n8n-nodes-base.', '');
      nodeTypes[type] = (nodeTypes[type] || 0) + 1;
    });
    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Save to file
    const filename = `/tmp/${workflow.name.replace(/[^a-z0-9]/gi, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 Saved full workflow to: ${filename}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
