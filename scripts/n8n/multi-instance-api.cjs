#!/usr/bin/env node

/**
 * n8n Multi-Instance API Script
 * Provides command-line access to all 3 n8n instances (Rensto VPS, Tax4Us Cloud, Shelly Cloud)
 *
 * Usage:
 *   node multi-instance-api.js <command> <instance> [args]
 *
 * Examples:
 *   node multi-instance-api.js list-workflows rensto
 *   node multi-instance-api.js get-workflow tax4us zQIkACTYDgaehp6S
 *   node multi-instance-api.js activate-workflow shelly abc123
 *   node multi-instance-api.js list-executions rensto zQIkACTYDgaehp6S 5
 *
 * Created: October 12, 2025
 * Purpose: Workaround for Cursor MCP integration bug
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// =====================================================================
// Configuration
// =====================================================================

const CONFIG_PATH = path.join(__dirname, '../../infra/mcp-servers/mcp-n8n-workflow-builder/.config.json');

let CONFIG;
try {
  CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (error) {
  console.error('❌ Failed to load config from:', CONFIG_PATH);
  console.error('Error:', error.message);
  process.exit(1);
}

const INSTANCES = CONFIG.environments;
const DEFAULT_INSTANCE = CONFIG.defaultEnv || 'rensto';

// =====================================================================
// HTTP Request Helper
// =====================================================================

function makeRequest(instance, endpoint, method = 'GET', body = null) {
  const config = INSTANCES[instance];
  if (!config) {
    throw new Error(`Unknown instance: ${instance}. Available: ${Object.keys(INSTANCES).join(', ')}`);
  }

  const url = new URL(endpoint, config.n8n_host);
  const isHttps = url.protocol === 'https:';
  const httpModule = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': config.n8n_api_key,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = httpModule.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          };

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// =====================================================================
// API Operations
// =====================================================================

/**
 * List all workflows
 */
async function listWorkflows(instance) {
  const response = await makeRequest(instance, '/api/v1/workflows');
  return response.body;
}

/**
 * Get specific workflow by ID
 */
async function getWorkflow(instance, workflowId) {
  const response = await makeRequest(instance, `/api/v1/workflows/${workflowId}`);
  return response.body;
}

/**
 * Create new workflow
 */
async function createWorkflow(instance, workflowData) {
  const response = await makeRequest(instance, '/api/v1/workflows', 'POST', workflowData);
  return response.body;
}

/**
 * Update existing workflow
 */
async function updateWorkflow(instance, workflowId, updates) {
  const response = await makeRequest(instance, `/api/v1/workflows/${workflowId}`, 'PATCH', updates);
  return response.body;
}

/**
 * Delete workflow
 */
async function deleteWorkflow(instance, workflowId) {
  const response = await makeRequest(instance, `/api/v1/workflows/${workflowId}`, 'DELETE');
  return response.body;
}

/**
 * Activate workflow
 */
async function activateWorkflow(instance, workflowId) {
  const response = await makeRequest(instance, `/api/v1/workflows/${workflowId}/activate`, 'POST');
  return response.body;
}

/**
 * Deactivate workflow
 */
async function deactivateWorkflow(instance, workflowId) {
  const response = await makeRequest(instance, `/api/v1/workflows/${workflowId}/deactivate`, 'POST');
  return response.body;
}

/**
 * Execute workflow (trigger manually)
 */
async function executeWorkflow(instance, workflowId) {
  const response = await makeRequest(instance, `/api/v1/workflows/${workflowId}/execute`, 'POST');
  return response.body;
}

/**
 * List executions for a workflow
 */
async function listExecutions(instance, workflowId = null, limit = 10) {
  let endpoint = `/api/v1/executions?limit=${limit}`;
  if (workflowId) {
    endpoint += `&workflowId=${workflowId}`;
  }
  const response = await makeRequest(instance, endpoint);
  return response.body;
}

/**
 * Get specific execution by ID
 */
async function getExecution(instance, executionId) {
  const response = await makeRequest(instance, `/api/v1/executions/${executionId}`);
  return response.body;
}

/**
 * Delete execution
 */
async function deleteExecution(instance, executionId) {
  const response = await makeRequest(instance, `/api/v1/executions/${executionId}`, 'DELETE');
  return response.body;
}

/**
 * Get workflow tags
 */
async function getTags(instance) {
  const response = await makeRequest(instance, '/api/v1/tags');
  return response.body;
}

// =====================================================================
// CLI Interface
// =====================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  const instance = args[1] || DEFAULT_INSTANCE;

  try {
    let result;

    switch (command) {
      // Workflow operations
      case 'list-workflows':
      case 'list':
        result = await listWorkflows(instance);
        break;

      case 'get-workflow':
      case 'get':
        if (!args[2]) throw new Error('Workflow ID required');
        result = await getWorkflow(instance, args[2]);
        break;

      case 'create-workflow':
      case 'create':
        if (!args[2]) throw new Error('Workflow JSON file path required');
        const workflowData = JSON.parse(fs.readFileSync(args[2], 'utf8'));
        result = await createWorkflow(instance, workflowData);
        break;

      case 'update-workflow':
      case 'update':
        if (!args[2]) throw new Error('Workflow ID required');
        if (!args[3]) throw new Error('Updates JSON file path required');
        const updates = JSON.parse(fs.readFileSync(args[3], 'utf8'));
        result = await updateWorkflow(instance, args[2], updates);
        break;

      case 'delete-workflow':
      case 'delete':
        if (!args[2]) throw new Error('Workflow ID required');
        result = await deleteWorkflow(instance, args[2]);
        break;

      case 'activate-workflow':
      case 'activate':
        if (!args[2]) throw new Error('Workflow ID required');
        result = await activateWorkflow(instance, args[2]);
        break;

      case 'deactivate-workflow':
      case 'deactivate':
        if (!args[2]) throw new Error('Workflow ID required');
        result = await deactivateWorkflow(instance, args[2]);
        break;

      case 'execute-workflow':
      case 'execute':
        if (!args[2]) throw new Error('Workflow ID required');
        result = await executeWorkflow(instance, args[2]);
        break;

      // Execution operations
      case 'list-executions':
      case 'executions':
        const workflowId = args[2] || null;
        const limit = args[3] || 10;
        result = await listExecutions(instance, workflowId, limit);
        break;

      case 'get-execution':
      case 'execution':
        if (!args[2]) throw new Error('Execution ID required');
        result = await getExecution(instance, args[2]);
        break;

      case 'delete-execution':
        if (!args[2]) throw new Error('Execution ID required');
        result = await deleteExecution(instance, args[2]);
        break;

      // Tag operations
      case 'list-tags':
      case 'tags':
        result = await getTags(instance);
        break;

      // Special commands
      case 'list-instances':
      case 'instances':
        result = {
          instances: Object.keys(INSTANCES),
          default: DEFAULT_INSTANCE,
          details: Object.keys(INSTANCES).map(name => ({
            name,
            url: INSTANCES[name].n8n_host
          }))
        };
        break;

      default:
        throw new Error(`Unknown command: ${command}. Use --help for available commands.`);
    }

    // Output result as JSON
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
n8n Multi-Instance API Script
=============================

Usage: node multi-instance-api.js <command> <instance> [args]

Instances:
  rensto    Rensto VPS (http://173.254.201.134:5678) [default]
  tax4us    Tax4Us Cloud (https://tax4usllc.app.n8n.cloud)
  shelly    Shelly Cloud (https://shellyins.app.n8n.cloud)

Workflow Commands:
  list-workflows <instance>                    List all workflows
  get-workflow <instance> <id>                 Get workflow details
  create-workflow <instance> <json-file>       Create new workflow from JSON
  update-workflow <instance> <id> <json-file>  Update workflow with JSON
  delete-workflow <instance> <id>              Delete workflow
  activate-workflow <instance> <id>            Activate workflow
  deactivate-workflow <instance> <id>          Deactivate workflow
  execute-workflow <instance> <id>             Execute workflow manually

Execution Commands:
  list-executions <instance> [workflowId] [limit]  List executions (default: 10)
  get-execution <instance> <id>                     Get execution details
  delete-execution <instance> <id>                  Delete execution

Tag Commands:
  list-tags <instance>                         List all tags

Utility Commands:
  list-instances                               List available instances
  --help, -h                                   Show this help

Examples:
  # List workflows from Rensto VPS
  node multi-instance-api.js list-workflows rensto

  # Get specific workflow from Tax4Us
  node multi-instance-api.js get-workflow tax4us zQIkACTYDgaehp6S

  # Activate workflow on Shelly
  node multi-instance-api.js activate-workflow shelly abc123

  # List last 5 executions for a workflow
  node multi-instance-api.js list-executions rensto zQIkACTYDgaehp6S 5

  # List all available instances
  node multi-instance-api.js list-instances

Shortcuts:
  list, get, create, update, delete, activate, deactivate, execute
  executions, execution, tags, instances

Output: All results are returned as JSON for easy parsing
`);
}

// Run CLI
if (require.main === module) {
  main();
}

// Export functions for use as module
module.exports = {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  executeWorkflow,
  listExecutions,
  getExecution,
  deleteExecution,
  getTags,
  INSTANCES,
  DEFAULT_INSTANCE
};
