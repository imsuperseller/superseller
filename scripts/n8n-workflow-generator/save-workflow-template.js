#!/usr/bin/env node

/**
 * Save Exported Workflow as Template
 * Saves a workflow JSON exported from n8n to the templates directory
 */

const fs = require('fs');
const path = require('path');

// Read workflow JSON from stdin or file
const workflowJson = process.argv[2] 
  ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  : JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));

const templatePath = path.join(__dirname, 'templates', 'base-whatsapp-agent-workflow.json');

// Save the workflow
fs.writeFileSync(templatePath, JSON.stringify(workflowJson, null, 2), 'utf8');

console.log(`✅ Saved workflow to: ${templatePath}`);
console.log(`   Workflow name: ${workflowJson.name || 'Unknown'}`);
console.log(`   Nodes: ${workflowJson.nodes?.length || 0}`);

