#!/usr/bin/env node

/**
 * Save Full Workflow Template
 * Extracts the complete workflow from n8n export and saves it as a template
 */

// This script should be run after exporting the workflow via MCP
// The export_workflow MCP call returns a structure with:
// - Root level: metadata + empty nodes: []
// - activeVersion: { nodes: [...40+ nodes...], connections: {...} }

// To use:
// 1. Export workflow via MCP: mcp_n8n-ops_n8n_export_workflow
// 2. Copy the full JSON response
// 3. Run: node save-full-workflow.js <exported-json-file>

const fs = require('fs');
const path = require('path');

const exportedJsonPath = process.argv[2];
const templatePath = path.join(__dirname, 'templates', 'base-whatsapp-agent-workflow.json');

if (!exportedJsonPath || !fs.existsSync(exportedJsonPath)) {
  console.error('❌ Usage: node save-full-workflow.js <exported-json-file>');
  console.error('   The exported JSON file should contain the full workflow from n8n export_workflow MCP call');
  process.exit(1);
}

const exported = JSON.parse(fs.readFileSync(exportedJsonPath, 'utf8'));

// Extract the full workflow from activeVersion (which has the complete nodes array)
const fullWorkflow = exported.activeVersion || exported;

if (!fullWorkflow.nodes || fullWorkflow.nodes.length === 0) {
  console.error('❌ No nodes found in exported workflow!');
  console.error('   Make sure you exported the workflow with activeVersion.nodes');
  process.exit(1);
}

// Save the complete workflow
fs.writeFileSync(templatePath, JSON.stringify(fullWorkflow, null, 2), 'utf8');

console.log('✅ Saved complete workflow template!');
console.log(`   File: ${templatePath}`);
console.log(`   Nodes: ${fullWorkflow.nodes.length}`);
console.log(`   Connections: ${Object.keys(fullWorkflow.connections || {}).length}`);
console.log(`   Workflow: ${fullWorkflow.name || exported.name || 'Unknown'}`);

