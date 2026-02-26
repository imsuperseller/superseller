/**
 * n8n API Utilities
 *
 * Reusable functions for common n8n operations.
 * Bypasses MCP layer - uses direct HTTP requests.
 *
 * Usage:
 *   const { getConfig } = require('./n8n-config.js');
 *   const api = require('./n8n-api.js');
 *   const config = getConfig('superseller');
 *   const workflows = await api.listWorkflows(config);
 */

import https from 'https';
import http from 'http';

/**
 * Make HTTP request to n8n API
 * @param {object} config - Instance configuration from n8n-config.js
 * @param {string} method - HTTP method
 * @param {string} path - API path (e.g., '/workflows')
 * @param {object} body - Request body (optional)
 * @returns {Promise<object>} Response data
 */
async function request(config, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.endpoint(path));
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: config.headers,
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Health check - test if n8n API is accessible
 */
async function healthCheck(config) {
  try {
    const workflows = await request(config, 'GET', '/workflows?limit=1');
    return {
      status: 'healthy',
      instance: config.name,
      url: config.url,
      accessible: true,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      instance: config.name,
      url: config.url,
      accessible: false,
      error: error.message,
    };
  }
}

/**
 * List all workflows
 */
async function listWorkflows(config, options = {}) {
  const { active, tags, limit = 100 } = options;
  let path = `/workflows?limit=${limit}`;
  if (active !== undefined) path += `&active=${active}`;
  if (tags) path += `&tags=${tags}`;

  return request(config, 'GET', path);
}

/**
 * Get a specific workflow by ID
 */
async function getWorkflow(config, workflowId) {
  return request(config, 'GET', `/workflows/${workflowId}`);
}

/**
 * Create a new workflow
 */
async function createWorkflow(config, workflowData) {
  return request(config, 'POST', '/workflows', workflowData);
}

/**
 * Update an existing workflow
 */
async function updateWorkflow(config, workflowId, workflowData) {
  return request(config, 'PATCH', `/workflows/${workflowId}`, workflowData);
}

/**
 * Delete a workflow
 */
async function deleteWorkflow(config, workflowId) {
  return request(config, 'DELETE', `/workflows/${workflowId}`);
}

/**
 * Activate/deactivate a workflow
 */
async function toggleWorkflow(config, workflowId, active) {
  return request(config, 'PATCH', `/workflows/${workflowId}`, { active });
}

/**
 * List executions for a workflow
 */
async function listExecutions(config, workflowId, options = {}) {
  const { limit = 10, status } = options;
  let path = `/executions?workflowId=${workflowId}&limit=${limit}`;
  if (status) path += `&status=${status}`;

  return request(config, 'GET', path);
}

/**
 * Get a specific execution
 */
async function getExecution(config, executionId) {
  return request(config, 'GET', `/executions/${executionId}`);
}

/**
 * Delete an execution
 */
async function deleteExecution(config, executionId) {
  return request(config, 'DELETE', `/executions/${executionId}`);
}

/**
 * Trigger a workflow (manual execution)
 */
async function triggerWorkflow(config, workflowId, data = {}) {
  return request(config, 'POST', `/workflows/${workflowId}/execute`, data);
}

/**
 * Get workflow statistics
 */
async function getWorkflowStats(config, workflowId) {
  const executions = await listExecutions(config, workflowId, { limit: 100 });

  const stats = {
    total: executions.data?.length || 0,
    success: 0,
    error: 0,
    running: 0,
    waiting: 0,
  };

  executions.data?.forEach((exec) => {
    if (exec.status === 'success') stats.success++;
    else if (exec.status === 'error') stats.error++;
    else if (exec.status === 'running') stats.running++;
    else if (exec.status === 'waiting') stats.waiting++;
  });

  return stats;
}

/**
 * Validate workflow configuration
 */
async function validateWorkflow(config, workflowId) {
  try {
    const workflow = await getWorkflow(config, workflowId);
    const issues = [];

    // Check if workflow is active
    if (!workflow.active) {
      issues.push('Workflow is not active');
    }

    // Check if workflow has nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      issues.push('Workflow has no nodes');
    }

    // Check for trigger nodes
    const hasTrigger = workflow.nodes?.some(
      (node) => node.type === 'n8n-nodes-base.manualTrigger' || node.type.includes('Trigger')
    );
    if (!hasTrigger) {
      issues.push('Workflow has no trigger node');
    }

    return {
      valid: issues.length === 0,
      issues,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        nodeCount: workflow.nodes?.length || 0,
      },
    };
  } catch (error) {
    return {
      valid: false,
      issues: [`Failed to fetch workflow: ${error.message}`],
    };
  }
}

export {
  request,
  healthCheck,
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflow,
  listExecutions,
  getExecution,
  deleteExecution,
  triggerWorkflow,
  getWorkflowStats,
  validateWorkflow,
};
