#!/usr/bin/env node
/**
 * Fetch executions from n8n via MCP API and extract payloads
 * 
 * This script:
 * 1. Fetches execution list for workflow eQSCUFw91oXLxtvn
 * 2. Fetches detailed execution data for each
 * 3. Extracts payloads and creates test suite
 * 
 * Note: This is a template - actual MCP calls should be made via n8n MCP tools
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processExecutions } from './extract-payloads-from-executions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_ID = 'eQSCUFw91oXLxtvn';
const DATA_DIR = path.join(__dirname, '..', 'data', 'whatsapp-payloads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * This is a placeholder - actual implementation would use n8n MCP tools
 * For now, we'll process the execution data we've already fetched
 */
async function fetchAllExecutions() {
  console.log('🔍 Fetching executions for workflow:', WORKFLOW_ID);
  console.log('⚠️  Note: This script requires n8n MCP integration\n');
  
  // In real implementation, you would:
  // 1. Call mcp_n8n-rensto_n8n_list_executions with workflowId
  // 2. For each execution ID, call mcp_n8n-rensto_n8n_get_execution with mode='summary'
  // 3. Collect all execution data
  
  // For now, return empty array - will be populated by actual MCP calls
  return [];
}

/**
 * Process executions that were manually exported/fetched
 */
async function processFetchedExecutions() {
  // In real implementation, load from JSON files
  const executions = [];
  console.log(`📦 Processing ${executions.length} pre-fetched executions...\n`);
  return processExecutions(executions);
}

/**
 * Main execution
 */
async function main() {
  try {
    // Try to process pre-fetched executions
    const execFile = path.join(DATA_DIR, 'executions.json');
    if (fs.existsSync(execFile)) {
      console.log(`📂 Loading executions from ${execFile}...\n`);
      const executions = JSON.parse(fs.readFileSync(execFile, 'utf8'));
      return processExecutions(executions);
    }

    // Otherwise, fetch via MCP (if implemented)
    const executions = await fetchAllExecutions();
    if (executions.length > 0) {
      return processExecutions(executions);
    }

    console.log('❌ No execution data found. Please:');
    console.log('   1. Fetch executions via n8n MCP API');
    console.log('   2. Save to data/whatsapp-payloads/executions.json');
    console.log('   3. Re-run this script\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main().catch(console.error);

export { fetchAllExecutions, processFetchedExecutions };

