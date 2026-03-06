/**
 * n8n Instance Configuration
 *
 * Centralized configuration for all n8n instances.
 * Use this instead of MCP tools until Cursor bug is fixed.
 *
 * Usage:
 *   const { getConfig } = require('./n8n-config.js');
 *   const config = getConfig('superseller');  // or 'tax4us' or 'shelly'
 */

const N8N_INSTANCES = {
  // SuperSeller AI VPS - Self-hosted on RackNerd
  superseller: {
    type: 'vps',
    name: 'SuperSeller AI VPS',
    url: 'http://n8n.superseller.agency',
    apiKey: process.env.N8N_RENSTO_API_KEY || '${N8N_API_KEY}',
    description: 'SuperSeller AI internal workflows (68 workflows)',
    workflows: 68,
    version: 'v1.113.3',
    publicUrl: 'https://n8n.superseller.agency',  // Via Cloudflare tunnel
  },

  // Tax4Us Cloud - Customer instance
  tax4us: {
    type: 'cloud',
    name: 'Tax4Us Cloud',
    url: 'https://tax4usllc.app.n8n.cloud',
    apiKey: process.env.N8N_TAX4US_API_KEY || '${N8N_API_KEY}',
    description: 'Tax4Us AI agent workflows (4 workflows)',
    workflows: 4,
    customer: 'Tax4Us',
    publicUrl: 'https://tax4usllc.app.n8n.cloud',
  },

  // Shelly Cloud - Customer instance
  shelly: {
    type: 'cloud',
    name: 'Shelly Cloud',
    url: 'https://shellyins.app.n8n.cloud',
    apiKey: process.env.N8N_SHELLY_API_KEY || '${N8N_API_KEY}',
    description: 'Shelly Insurance workflows',
    customer: 'Shelly Insurance',
    publicUrl: 'https://shellyins.app.n8n.cloud',
  },
};

/**
 * Get configuration for a specific n8n instance
 * @param {string} instance - Instance name: 'superseller', 'tax4us', or 'shelly'
 * @returns {object} Configuration object with url, apiKey, headers, etc.
 */
function getConfig(instance) {
  const config = N8N_INSTANCES[instance];

  if (!config) {
    throw new Error(`Unknown n8n instance: ${instance}. Valid options: ${Object.keys(N8N_INSTANCES).join(', ')}`);
  }

  // Return config with prepared headers
  return {
    ...config,
    headers: {
      'X-N8N-API-KEY': config.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Helper to get API endpoint
    endpoint: (path) => `${config.url}/api/v1${path}`,
  };
}

/**
 * List all available instances
 * @returns {array} Array of instance names
 */
function listInstances() {
  return Object.keys(N8N_INSTANCES);
}

/**
 * Get all configurations
 * @returns {object} All configurations
 */
function getAllConfigs() {
  return N8N_INSTANCES;
}

export { getConfig, listInstances, getAllConfigs, N8N_INSTANCES };
