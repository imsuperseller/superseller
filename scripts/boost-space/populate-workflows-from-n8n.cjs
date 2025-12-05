#!/usr/bin/env node

/**
 * Populate Boost.space Workflows Module from n8n Workflows
 * 
 * This script:
 * 1. Fetches workflows from n8n instances
 * 2. Gets execution statistics for each workflow
 * 3. Maps n8n data to Boost.space custom fields
 * 4. Creates/updates records in Boost.space
 * 
 * Usage:
 *   node populate-workflows-from-n8n.cjs [--instance rensto-vps] [--workflow-id ID] [--dry-run]
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
  // Boost.space
  boostSpace: {
    platform: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
    apiKey: process.env.BOOST_SPACE_API_KEY || '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    moduleId: 'note', // Space 45 uses 'note' module
    spaceId: 45
  },
  
  // n8n Instances
  n8nInstances: {
    'rensto-vps': {
      url: 'http://173.254.201.134:5678',
      apiKey: process.env.N8N_RENSTO_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzI3OTI1MjAsImV4cCI6MTczNTM4NDUyMCwidXNlcklkIjoiMSIsInNjb3BlIjoiZGVmYXVsdCJ9.7Q8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E',
      displayName: 'Rensto VPS'
    },
    'tax4us-cloud': {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: process.env.N8N_TAX4US_API_KEY,
      displayName: 'Tax4Us Cloud'
    },
    'shelly-cloud': {
      url: 'https://shellyins.app.n8n.cloud',
      apiKey: process.env.N8N_SHELLY_API_KEY,
      displayName: 'Shelly Cloud'
    }
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get n8n workflows from an instance
 */
async function getN8nWorkflows(instanceConfig) {
  try {
    const response = await axios.get(`${instanceConfig.url}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': instanceConfig.apiKey
      },
      params: {
        limit: 1000 // Get all workflows
      }
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error(`❌ Error fetching workflows from ${instanceConfig.displayName}:`, error.message);
    return [];
  }
}

/**
 * Get a specific workflow by ID
 */
async function getN8nWorkflow(instanceConfig, workflowId) {
  try {
    const response = await axios.get(`${instanceConfig.url}/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': instanceConfig.apiKey
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching workflow ${workflowId}:`, error.message);
    return null;
  }
}

/**
 * Get execution statistics for a workflow
 */
async function getWorkflowStats(instanceConfig, workflowId) {
  try {
    const response = await axios.get(`${instanceConfig.url}/api/v1/executions`, {
      headers: {
        'X-N8N-API-KEY': instanceConfig.apiKey
      },
      params: {
        workflowId: workflowId,
        limit: 100 // Get last 100 executions for stats
      }
    });
    
    const executions = response.data.data || [];
    
    if (executions.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        executionTimeAvg: 0,
        executionTimeMax: 0,
        lastSuccessfulRun: null
      };
    }
    
    const successful = executions.filter(e => e.finished && e.finished === true && (!e.stoppedAt || e.stoppedAt));
    const failed = executions.filter(e => e.finished === false || e.stoppedAt === null);
    
    // Calculate execution times
    const executionTimes = executions
      .filter(e => e.startedAt && e.stoppedAt)
      .map(e => {
        const start = new Date(e.startedAt);
        const stop = new Date(e.stoppedAt);
        return (stop - start) / 1000; // Convert to seconds
      });
    
    const avgTime = executionTimes.length > 0 
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
      : 0;
    const maxTime = executionTimes.length > 0 ? Math.max(...executionTimes) : 0;
    
    // Find last successful run
    const lastSuccessful = successful.length > 0 
      ? successful.sort((a, b) => new Date(b.stoppedAt) - new Date(a.stoppedAt))[0]
      : null;
    
    return {
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      successRate: executions.length > 0 ? (successful.length / executions.length) * 100 : 0,
      executionTimeAvg: avgTime,
      executionTimeMax: maxTime,
      lastSuccessfulRun: lastSuccessful ? lastSuccessful.stoppedAt : null
    };
  } catch (error) {
    console.warn(`⚠️  Could not get stats for workflow ${workflowId}:`, error.message);
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      successRate: 0,
      executionTimeAvg: 0,
      executionTimeMax: 0,
      lastSuccessfulRun: null
    };
  }
}

/**
 * Extract integrations from workflow nodes
 */
function extractIntegrations(workflow) {
  const nodes = workflow.nodes || [];
  const integrations = new Set();
  
  nodes.forEach(node => {
    if (node.type && node.type.includes('.')) {
      const service = node.type.split('.')[0];
      if (service !== 'n8n-nodes-base' && service !== 'n8n-nodes-langchain') {
        integrations.add(service);
      }
    }
  });
  
  return Array.from(integrations);
}

/**
 * Extract required credentials from workflow nodes
 */
function extractCredentials(workflow) {
  const nodes = workflow.nodes || [];
  const credentials = new Set();
  
  nodes.forEach(node => {
    if (node.credentials) {
      Object.keys(node.credentials).forEach(credType => {
        credentials.add(credType);
      });
    }
  });
  
  return Array.from(credentials);
}

/**
 * Determine workflow category from name
 */
function determineCategory(name) {
  const upperName = name.toUpperCase();
  if (upperName.startsWith('INT-')) return 'Internal';
  if (upperName.startsWith('SUB-')) return 'Subscription';
  if (upperName.startsWith('MKT-')) return 'Marketing';
  if (upperName.startsWith('DEV-')) return 'Development';
  if (upperName.startsWith('TEST-')) return 'Development';
  return 'Customer';
}

/**
 * Determine workflow status
 */
function determineStatus(workflow, stats) {
  if (!workflow.active) return '❌ Deprecated';
  if (stats.totalExecutions === 0) return '⚠️ Testing';
  if (stats.successRate >= 90 && stats.totalExecutions >= 10) return '✅ Successful';
  if (stats.successRate >= 50) return '✅ Active';
  return '⚠️ Testing';
}

/**
 * Map n8n workflow to Boost.space fields
 */
function mapWorkflowToBoostSpace(workflow, stats, instanceConfig, instanceKey) {
  const nodes = workflow.nodes || [];
  const integrations = extractIntegrations(workflow);
  const credentials = extractCredentials(workflow);
  
  // Calculate complexity score (1-10)
  const complexityScore = Math.min(10, Math.max(1, 
    Math.floor(nodes.length / 5) + 
    (workflow.connections ? Object.keys(workflow.connections).length : 0) / 10
  ));
  
  // Extract version from name (e.g., "INT-LEAD-001 v2" -> "v2")
  const versionMatch = workflow.name.match(/v(\d+(?:\.\d+)?)/i);
  const version = versionMatch ? versionMatch[0] : null;
  
  // Build workflow name (e.g., "INT-LEAD-001")
  const workflowNameMatch = workflow.name.match(/^([A-Z]+-[A-Z]+-\d+)/);
  const workflowName = workflowNameMatch ? workflowNameMatch[1] : workflow.name;
  
  return {
    // Core Fields
    workflow_name: workflowName,
    description: workflow.name || 'No description',
    category: determineCategory(workflow.name),
    status: determineStatus(workflow, stats),
    workflow_id: workflow.id,
    workflow_name_original: workflow.name,
    n8n_instance: instanceConfig.displayName,
    n8n_url: `${instanceConfig.url}/workflow/${workflow.id}`,
    created_date: workflow.createdAt ? workflow.createdAt.split('T')[0] : null,
    last_successful_run: stats.lastSuccessfulRun,
    version: version,
    previous_version_id: null, // Would need to track this separately
    failed_executions: stats.failedExecutions,
    
    // Technical Fields
    node_count: nodes.length,
    complexity_score: complexityScore,
    execution_time_avg: Math.round(stats.executionTimeAvg * 100) / 100, // Round to 2 decimals
    execution_time_max: Math.round(stats.executionTimeMax * 100) / 100,
    integrations_used: JSON.stringify(integrations),
    required_credentials: JSON.stringify(credentials),
    workflow_json_url: null, // Could store JSON in a file and link to it
    workflow_json: JSON.stringify(workflow, null, 2).substring(0, 10000), // Limit to 10K chars
    success_rate: Math.round(stats.successRate * 100) / 100,
    total_executions: stats.totalExecutions,
    successful_executions: stats.successfulExecutions,
    
    // Business Fields (mostly empty - to be filled manually)
    // Revenue & Financial
    revenue_generated: null,
    revenue_model: null,
    monthly_recurring_revenue: null,
    annual_recurring_revenue: null,
    profit_margin: null,
    cost_per_acquisition: null,
    customer_lifetime_value: null,
    ltv_cac_ratio: null,
    
    // Customer & Market
    customers_served: null,
    target_customer_segment: null,
    target_market_size: null,
    market_opportunity: null,
    competitive_advantage: null,
    market_fit_score: null,
    
    // Business Impact & ROI
    time_saved_hours: null,
    cost_savings: null,
    roi_percentage: null,
    payback_period_months: null,
    business_value: null,
    business_impact_score: null,
    strategic_priority: null,
    
    // Business Relationships
    client_name: null,
    business_owner: null,
    executive_sponsor: null,
    business_unit: null,
    key_stakeholders: null,
    
    // Business Case & Strategy
    business_case: null,
    business_justification: null,
    strategic_alignment: null,
    success_criteria: null,
    business_requirements: null,
    business_metrics: null,
    kpis: null,
    
    // Market & Industry
    use_cases: null,
    target_industries: null,
    market_segment: null,
    industry_vertical: null,
    geographic_market: null,
    
    // Business Model & Operations
    business_model: null,
    pricing_strategy: null,
    sales_cycle_days: null,
    conversion_rate: null,
    churn_risk: null,
    upsell_opportunity: null,
    
    // General
    tags: JSON.stringify([instanceKey, workflowName.split('-')[0]]),
    
    // Documentation Fields
    setup_guide: null,
    configuration_steps: null,
    troubleshooting_guide: null,
    screenshot_urls: null,
    demo_video_url: null,
    documentation_url: null,
    changelog: null,
    known_issues: null,
    
    // Marketplace Fields
    marketplace_status: 'draft',
    marketplace_price_diy: null,
    marketplace_price_install: null,
    marketplace_category: null,
    marketplace_slug: null,
    marketplace_description: null,
    marketplace_features: null,
    marketplace_sales_count: 0,
    marketplace_revenue: 0
  };
}

/**
 * Check if workflow record exists in Boost.space
 */
async function findExistingRecord(boostSpaceApi, workflowId) {
  try {
    const response = await boostSpaceApi.get('/api/note', {
      params: {
        filters: JSON.stringify({
          workflow_id: workflowId
        }),
        limit: 1
      }
    });
    
    const records = response.data.data || [];
    return records.length > 0 ? records[0].id : null;
  } catch (error) {
    // If query fails, assume no record exists
    return null;
  }
}

/**
 * Create or update record in Boost.space
 */
async function upsertWorkflowRecord(boostSpaceApi, data, existingRecordId, dryRun) {
  if (dryRun) {
    console.log('🔍 DRY RUN - Would create/update record:');
    console.log(JSON.stringify(data, null, 2));
    return { id: 'dry-run-id', created: !existingRecordId };
  }
  
  try {
    if (existingRecordId) {
      // Update existing record
      const response = await boostSpaceApi.put(`/api/note/${existingRecordId}`, {
        ...data,
        spaceId: CONFIG.boostSpace.spaceId
      });
      
      return { id: existingRecordId, created: false, data: response.data };
    } else {
      // Create new record
      const response = await boostSpaceApi.post('/api/note', {
        ...data,
        spaceId: CONFIG.boostSpace.spaceId
      });
      
      return { id: response.data.id, created: true, data: response.data };
    }
  } catch (error) {
    console.error('❌ Error creating/updating record:', error.response?.data || error.message);
    throw error;
  }
}

// ========================================
// MAIN FUNCTION
// ========================================

async function main() {
  const args = process.argv.slice(2);
  const instanceKey = args.find(arg => arg.startsWith('--instance'))?.split('=')[1] || 'rensto-vps';
  const workflowId = args.find(arg => arg.startsWith('--workflow-id'))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  
  console.log('🚀 Starting workflow population...');
  console.log(`📦 Instance: ${instanceKey}`);
  console.log(`🔍 Workflow ID: ${workflowId || 'ALL'}`);
  console.log(`🧪 Dry Run: ${dryRun ? 'YES' : 'NO'}`);
  console.log('');
  
  // Setup Boost.space API
  const boostSpaceApi = axios.create({
    baseURL: CONFIG.boostSpace.platform,
    headers: {
      'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });
  
  // Get instance config
  const instanceConfig = CONFIG.n8nInstances[instanceKey];
  if (!instanceConfig) {
    console.error(`❌ Unknown instance: ${instanceKey}`);
    console.error(`Available instances: ${Object.keys(CONFIG.n8nInstances).join(', ')}`);
    process.exit(1);
  }
  
  if (!instanceConfig.apiKey) {
    console.error(`❌ Missing API key for ${instanceKey}`);
    process.exit(1);
  }
  
  // Get workflows
  let workflows = [];
  if (workflowId) {
    const workflow = await getN8nWorkflow(instanceConfig, workflowId);
    if (workflow) {
      workflows = [workflow];
    }
  } else {
    workflows = await getN8nWorkflows(instanceConfig);
  }
  
  console.log(`✅ Found ${workflows.length} workflow(s)`);
  console.log('');
  
  // Process each workflow
  let successCount = 0;
  let errorCount = 0;
  
  for (const workflow of workflows) {
    try {
      console.log(`📋 Processing: ${workflow.name} (${workflow.id})`);
      
      // Get execution statistics
      const stats = await getWorkflowStats(instanceConfig, workflow.id);
      
      // Map to Boost.space fields
      const boostSpaceData = mapWorkflowToBoostSpace(workflow, stats, instanceConfig, instanceKey);
      
      // Check if record exists
      const existingRecordId = await findExistingRecord(boostSpaceApi, workflow.id);
      
      // Create or update
      const result = await upsertWorkflowRecord(
        boostSpaceApi, 
        boostSpaceData, 
        existingRecordId,
        dryRun
      );
      
      if (result.created) {
        console.log(`  ✅ Created record: ${result.id}`);
      } else {
        console.log(`  ✅ Updated record: ${result.id}`);
      }
      
      successCount++;
      
    } catch (error) {
      console.error(`  ❌ Error processing ${workflow.name}:`, error.message);
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('');
  console.log('📊 Summary:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total: ${workflows.length}`);
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
