#!/usr/bin/env node

/**
 * Save Exported Workflow to Template
 * Reads workflow JSON from MCP export and saves to template file
 */

const fs = require('fs');
const path = require('path');

// The workflow JSON should be passed as a file path or we'll use a placeholder
// In practice, this will be called after exporting via MCP
const workflowPath = process.argv[2];
const templatePath = path.join(__dirname, 'templates', 'base-whatsapp-agent-workflow.json');

if (workflowPath && fs.existsSync(workflowPath)) {
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  fs.writeFileSync(templatePath, JSON.stringify(workflow, null, 2), 'utf8');
  console.log(`✅ Saved workflow to: ${templatePath}`);
  console.log(`   Workflow: ${workflow.name || workflow.id}`);
  console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
} else {
  console.log('⚠️  Usage: node save-exported-workflow.js <workflow-json-file>');
  console.log('   Or export workflow via MCP and save manually to:', templatePath);
}

