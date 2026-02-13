#!/usr/bin/env node
/**
 * List Workflows for a Specific Instance
 *
 * Lists all workflows with stats.
 *
 * Usage:
 *   node scripts/n8n/examples/list-workflows.js rensto
 *   node scripts/n8n/examples/list-workflows.js tax4us
 *   node scripts/n8n/examples/list-workflows.js shelly
 */

import { getConfig } from '../n8n-config.js';
import * as api from '../n8n-api.js';

async function main() {
  const instanceName = process.argv[2];

  if (!instanceName) {
    console.error('❌ Usage: node list-workflows.js <instance>');
    console.error('   Valid instances: rensto, tax4us, shelly');
    process.exit(1);
  }

  try {
    const config = getConfig(instanceName);
    console.log(`📋 Listing workflows for ${config.name}...\n`);

    const result = await api.listWorkflows(config);

    if (!result.data || result.data.length === 0) {
      console.log('No workflows found.');
      return;
    }

    console.log(`Found ${result.data.length} workflows:\n`);

    for (const workflow of result.data) {
      const status = workflow.active ? '✅ Active' : '⏸️  Inactive';
      console.log(`${status} | ${workflow.name}`);
      console.log(`  ID: ${workflow.id}`);
      console.log(`  Nodes: ${workflow.nodes?.length || 0}`);
      console.log(`  Updated: ${new Date(workflow.updatedAt).toLocaleString()}`);
      console.log('');
    }

    // Summary
    const active = result.data.filter((w) => w.active).length;
    const inactive = result.data.filter((w) => !w.active).length;
    console.log('📊 Summary:');
    console.log(`  Total: ${result.data.length}`);
    console.log(`  Active: ${active}`);
    console.log(`  Inactive: ${inactive}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
