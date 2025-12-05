#!/usr/bin/env node

/**
 * Populate All Workflows to Products Module
 * 
 * Fetches all workflows from n8n and creates/updates Product records in Boost.space
 * with all 89 custom fields populated
 */

const axios = require('axios');

const CONFIG = {
  boostSpace: {
    platform: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    module: 'product',
    // Space ID for workflow products
    // Current: 39 = "MCP Servers & Business References" (mixed with infrastructure)
    // Recommended: Create new space "n8n Workflows" and update this ID
    // To create new space: Go to Boost.space UI → Products module → Add Space → "n8n Workflows"
    spaceId: 39, // TODO: Update to new space ID once "n8n Workflows" space is created
    fieldGroupId: 479 // "n8n Workflow Fields (Products)"
  },
  n8n: {
    url: 'http://173.254.201.134:5678',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ',
    instance: 'Rensto VPS'
  }
};

class WorkflowPopulator {
  constructor() {
    this.boostApi = axios.create({
      baseURL: CONFIG.boostSpace.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // n8n API calls will be made directly with axios (not using instance)
  }

  /**
   * Fetch all workflows from n8n
   */
  async fetchAllWorkflows() {
    console.log('📋 Fetching all workflows from n8n...\n');
    console.log(`   URL: ${CONFIG.n8n.url}/api/v1/workflows`);
    
    try {
      // Fetch workflows with pagination (n8n limit is 250 per request)
      let allWorkflows = [];
      let cursor = null;
      let hasMore = true;
      
      while (hasMore) {
        const params = {
          limit: 250 // Max allowed by n8n
        };
        
        if (cursor) {
          params.cursor = cursor;
        }
        
        const response = await axios.get(`${CONFIG.n8n.url}/api/v1/workflows`, {
          headers: {
            'X-N8N-API-KEY': CONFIG.n8n.apiKey
          },
          params: params
        });
        
        const data = response.data.data || response.data || [];
        allWorkflows = allWorkflows.concat(data);
        
        // Check if there's more data
        cursor = response.data.nextCursor || null;
        hasMore = !!cursor && data.length === 250;
        
        if (hasMore) {
          console.log(`   📄 Fetched ${allWorkflows.length} workflows so far...`);
        }
      }
      
      console.log(`   ✅ Found ${allWorkflows.length} total workflows\n`);
      return allWorkflows;
    } catch (error) {
      console.error('❌ Error fetching workflows:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        if (error.response.status === 401) {
          console.error('\n   ⚠️  Authentication failed. Please check:');
          console.error('      - API key is correct');
          console.error('      - API key has not expired');
          console.error('      - n8n instance is accessible');
        }
      }
      throw error;
    }
  }

  /**
   * Get workflow execution statistics
   */
  async getWorkflowStats(workflowId) {
    try {
      // Try to get execution stats
      const execResponse = await axios.get(`${CONFIG.n8n.url}/api/v1/executions`, {
        headers: {
          'X-N8N-API-KEY': CONFIG.n8n.apiKey
        },
        params: {
          workflowId: workflowId,
          limit: 100
        }
      });
      
      const executions = execResponse.data.data || execResponse.data.results || [];
      
      const stats = {
        total: executions.length,
        successful: executions.filter(e => e.finished && !e.stoppedAt).length,
        failed: executions.filter(e => e.stoppedAt || (e.finished && !e.finished)).length,
        avgExecutionTime: 0,
        maxExecutionTime: 0
      };

      // Calculate execution times
      if (executions.length > 0) {
        const times = executions
          .filter(e => e.startedAt && e.finishedAt)
          .map(e => {
            const start = new Date(e.startedAt);
            const end = new Date(e.finishedAt);
            return (end - start) / 1000; // seconds
          });
        
        if (times.length > 0) {
          stats.avgExecutionTime = times.reduce((a, b) => a + b, 0) / times.length;
          stats.maxExecutionTime = Math.max(...times);
        }
      }

      return stats;
    } catch (error) {
      // Stats are optional, return defaults
      return {
        total: 0,
        successful: 0,
        failed: 0,
        avgExecutionTime: 0,
        maxExecutionTime: 0
      };
    }
  }

  /**
   * Determine category from workflow name
   */
  getCategory(workflowName) {
    const name = workflowName.toUpperCase();
    if (name.startsWith('INT-')) return 'Internal';
    if (name.startsWith('SUB-')) return 'Subscription';
    if (name.startsWith('MKT-')) return 'Marketing';
    if (name.startsWith('DEV-')) return 'Development';
    if (name.startsWith('TEST-')) return 'Development';
    if (name.includes('CUSTOMER') || name.includes('CLIENT')) return 'Customer';
    return 'Internal'; // Default
  }

  /**
   * Determine status from workflow
   */
  getStatus(workflow) {
    if (!workflow.active) return '❌ Deprecated';
    if (workflow.name.includes('Template') || workflow.name.includes('TEMPLATE')) return '📦 Template';
    return '✅ Active';
  }

  /**
   * Determine marketplace readiness
   */
  getMarketplaceReadiness(workflow, category) {
    // Internal workflows are not applicable
    if (category === 'Internal') return 'not_applicable';
    
    // Check if workflow has template status
    if (workflow.name.includes('Template') || workflow.name.includes('TEMPLATE')) {
      return 'ready_for_review';
    }
    
    // Default: not ready (needs review)
    return 'not_ready';
  }

  /**
   * Extract integrations from workflow nodes
   */
  getIntegrations(workflow) {
    if (!workflow.nodes) return [];
    
    const integrations = new Set();
    workflow.nodes.forEach(node => {
      if (node.type && node.type.includes('.')) {
        const service = node.type.split('.')[0];
        if (service && service !== 'n8n-nodes-base') {
          integrations.add(service);
        }
      }
    });
    
    return Array.from(integrations);
  }

  /**
   * Map workflow to Boost.space Product record
   */
  async mapWorkflowToProduct(workflow) {
    const stats = await this.getWorkflowStats(workflow.id);
    const category = this.getCategory(workflow.name);
    const status = this.getStatus(workflow);
    const marketplaceReadiness = this.getMarketplaceReadiness(workflow, category);
    const integrations = this.getIntegrations(workflow);
    
    // Calculate success rate
    const successRate = stats.total > 0 
      ? Math.round((stats.successful / stats.total) * 100) 
      : 0;

    // Build the product record
    const product = {
      // Native Products fields
      name: workflow.name,
      description: workflow.description || workflow.name,
      sku: workflow.id, // Use workflow ID as SKU
      // Don't set status_system_id - let Boost.space use default or set it after creation
      
      // Custom fields - Core (13)
      workflow_name: workflow.name,
      description: workflow.description || workflow.name,
      category: category,
      status: status,
      workflow_id: workflow.id,
      workflow_name_original: workflow.name,
      n8n_instance: CONFIG.n8n.instance,
      n8n_url: `${CONFIG.n8n.url}/workflow/${workflow.id}`,
      created_date: workflow.createdAt ? workflow.createdAt.split('T')[0] : null,
      last_successful_run: stats.successful > 0 ? new Date().toISOString() : null, // Would need to get actual last run
      version: workflow.name.match(/v\d+/)?.[0] || 'v1',
      previous_version_id: null,
      failed_executions: stats.failed,
      
      // Custom fields - Technical (11)
      node_count: workflow.nodes ? workflow.nodes.length : 0,
      complexity_score: workflow.nodes ? Math.min(10, Math.max(1, Math.round(workflow.nodes.length / 5))) : 1,
      execution_time_avg: Math.round(stats.avgExecutionTime * 100) / 100,
      execution_time_max: Math.round(stats.maxExecutionTime * 100) / 100,
      integrations_used: JSON.stringify(integrations),
      required_credentials: JSON.stringify([]), // Would need to analyze nodes
      workflow_json_url: null,
      workflow_json: JSON.stringify(workflow),
      success_rate: successRate,
      total_executions: stats.total,
      successful_executions: stats.successful,
      
      // Custom fields - Business (35) - Set defaults
      revenue_generated: 0,
      revenue_model: 'One-time',
      monthly_recurring_revenue: 0,
      annual_recurring_revenue: 0,
      profit_margin: 0,
      cost_per_acquisition: 0,
      customer_lifetime_value: 0,
      ltv_cac_ratio: 0,
      customers_served: 0,
      target_customer_segment: 'SMB',
      target_market_size: 0,
      market_opportunity: 'Medium',
      competitive_advantage: '',
      market_fit_score: 5,
      time_saved_hours: 0,
      cost_savings: 0,
      roi_percentage: 0,
      payback_period_months: 0,
      business_value: 'Medium',
      business_impact_score: 5,
      strategic_priority: 'Medium',
      client_name: '',
      business_owner: '',
      executive_sponsor: '',
      business_unit: '',
      key_stakeholders: JSON.stringify([]),
      business_case: '',
      business_justification: '',
      strategic_alignment: '',
      success_criteria: JSON.stringify([]),
      business_requirements: JSON.stringify([]),
      business_metrics: JSON.stringify({}),
      kpis: JSON.stringify([]),
      use_cases: JSON.stringify([]),
      target_industries: JSON.stringify([]),
      market_segment: 'B2B',
      industry_vertical: '',
      geographic_market: '',
      business_model: 'Services',
      pricing_strategy: 'Value-based',
      sales_cycle_days: 0,
      conversion_rate: 0,
      churn_risk: 'Low',
      upsell_opportunity: 'Medium',
      tags: JSON.stringify([]),
      
      // Custom fields - Documentation (8)
      setup_guide: '',
      configuration_steps: JSON.stringify([]),
      troubleshooting_guide: '',
      screenshot_urls: JSON.stringify([]),
      demo_video_url: null,
      documentation_url: null,
      changelog: '',
      known_issues: '',
      
      // Custom fields - Marketplace (9)
      marketplace_status: marketplaceReadiness === 'published' ? 'published' : 'draft',
      marketplace_price_diy: 0,
      marketplace_price_install: 0,
      marketplace_category: 'Operations',
      marketplace_slug: workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      marketplace_description: workflow.description || '',
      marketplace_features: JSON.stringify([]),
      marketplace_sales_count: 0,
      marketplace_revenue: 0,
      
      // New marketplace readiness fields (3)
      is_internal_only: category === 'Internal',
      marketplace_readiness: marketplaceReadiness,
      marketplace_blockers: marketplaceReadiness === 'not_ready' ? 'Needs review and documentation' : null
    };

    return product;
  }

  /**
   * Find existing product by workflow_id
   */
  async findExistingProduct(workflowId) {
    try {
      // Search for product with matching SKU (workflow_id) OR name containing workflow_id
      // First try SKU search
      const skuResponse = await this.boostApi.get(`/api/product`, {
        params: {
          sku: workflowId,
          limit: 100
        }
      });
      
      let products = Array.isArray(skuResponse.data) ? skuResponse.data : (skuResponse.data.data || []);
      
      // Filter to exact SKU match
      const exactMatch = products.find(p => p.sku === workflowId);
      if (exactMatch) {
        return exactMatch;
      }
      
      // If no SKU match, search by name (workflow names often contain the workflow ID)
      const nameResponse = await this.boostApi.get(`/api/product`, {
        params: {
          limit: 100
        }
      });
      
      products = Array.isArray(nameResponse.data) ? nameResponse.data : (nameResponse.data.data || []);
      
      // Look for product with workflow_id in name or as SKU
      const match = products.find(p => 
        p.sku === workflowId || 
        (p.name && p.name.includes(workflowId)) ||
        (p.name && workflowId.includes(p.name.split(':')[0].trim()))
      );
      
      return match || null;
    } catch (error) {
      // If search fails, return null (will create new)
      console.log(`   ⚠️  Search failed for ${workflowId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get custom field input IDs for Products module
   */
  async getCustomFieldInputIds() {
    try {
      const response = await this.boostApi.get('/api/custom-field');
      const fieldGroups = Array.isArray(response.data) ? response.data : [];
      
      // Find our field group
      const ourGroup = fieldGroups.find(g => g.id === CONFIG.boostSpace.fieldGroupId);
      if (!ourGroup || !ourGroup.inputs) {
        console.log('   ⚠️  Field group not found or has no inputs');
        return {};
      }
      
      // Map field names to input IDs
      const fieldMap = {};
      ourGroup.inputs.forEach(input => {
        if (input.name) {
          fieldMap[input.name] = input.id;
        }
      });
      
      return fieldMap;
    } catch (error) {
      console.log('   ⚠️  Could not fetch field IDs, will try without them');
      return {};
    }
  }

  /**
   * Format custom fields as customFieldsValues array
   */
  formatCustomFields(product, fieldMap) {
    const customFieldsValues = [];
    
    // List of native fields to exclude
    const nativeFields = ['name', 'description', 'sku', 'status_system_id', 'quantity', 'unit_price', 'vat', 'discount', 'categories', 'labels', 'files', 'variants', 'specialPrices', 'spaces'];
    
    // Add all custom fields
    Object.keys(product).forEach(key => {
      if (!nativeFields.includes(key) && product[key] !== null && product[key] !== undefined && product[key] !== '') {
        const fieldId = fieldMap[key];
        if (fieldId) {
          customFieldsValues.push({
            customFieldInputId: fieldId,
            value: product[key],
            module: 'product',
            table: 'product'
          });
        }
      }
    });
    
    return customFieldsValues;
  }

  /**
   * Create or update product in Boost.space
   */
  async createOrUpdateProduct(product) {
    try {
      // Get field mapping
      const fieldMap = await this.getCustomFieldInputIds();
      
      // Try to find existing product
      const existing = await this.findExistingProduct(product.workflow_id);
      
      if (existing) {
        console.log(`   🔄 Updating existing product: ${product.name}`);
        
        // Format custom fields as customFieldsValues array
        const customFieldsValues = this.formatCustomFields(product, fieldMap);
        
        // For existing products, only update custom fields using customFieldsValues format
        // This avoids the "connected to product" error
        const updatePayload = {
          customFieldsValues: customFieldsValues
        };
        
        // Ensure product is in the configured workflow space (add if not already there)
        const existingSpaces = existing.spaces || [];
        if (!existingSpaces.includes(CONFIG.boostSpace.spaceId)) {
          updatePayload.spaces = [...existingSpaces, CONFIG.boostSpace.spaceId];
        }
        
        // Also update name/description if different (safe fields)
        if (product.name !== existing.name) {
          updatePayload.name = product.name;
        }
        if (product.description !== existing.description) {
          updatePayload.description = product.description;
        }
        
        try {
          const updateResponse = await this.boostApi.put(`/api/product/${existing.id}`, updatePayload);
          return { action: 'updated', id: existing.id, data: updateResponse.data };
        } catch (updateError) {
          // If that fails, try with just customFieldsValues
          if (updateError.response?.status === 403) {
            const minimalPayload = { customFieldsValues: customFieldsValues };
            const updateResponse = await this.boostApi.put(`/api/product/${existing.id}`, minimalPayload);
            return { action: 'updated', id: existing.id, data: updateResponse.data };
          }
          throw updateError;
        }
      } else {
        console.log(`   ➕ Creating new product: ${product.name}`);
        
        // Format custom fields
        const customFieldsValues = this.formatCustomFields(product, fieldMap);
        
        // Create new product with native fields + customFieldsValues + space assignment
        const createPayload = {
          name: product.name,
          description: product.description,
          sku: product.sku,
          // Don't set status_system_id - Boost.space will assign default
          spaces: [CONFIG.boostSpace.spaceId], // Workflow products space (currently 39, should be new "n8n Workflows" space)
          customFieldsValues: customFieldsValues
        };
        
        const createResponse = await this.boostApi.post('/api/product', createPayload);
        return { action: 'created', id: createResponse.data.id, data: createResponse.data };
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return { action: 'failed', error: error.message };
    }
  }

  /**
   * Main population process
   */
  async populate() {
    console.log('🚀 Populating All Workflows to Products Module\n');
    console.log('================================================================================\n');

    try {
      // Fetch all workflows
      const workflows = await this.fetchAllWorkflows();
      
      if (workflows.length === 0) {
        console.log('⚠️  No workflows found');
        return;
      }

      console.log(`📝 Processing ${workflows.length} workflows...\n`);

      const results = {
        created: 0,
        updated: 0,
        failed: 0,
        skipped: 0
      };

      // Process each workflow
      for (let i = 0; i < workflows.length; i++) {
        const workflow = workflows[i];
        console.log(`[${i + 1}/${workflows.length}] ${workflow.name} (${workflow.id})`);
        
        try {
          // Map workflow to product
          const product = await this.mapWorkflowToProduct(workflow);
          
          // Create or update in Boost.space
          const result = await this.createOrUpdateProduct(product);
          
          if (result.action === 'created') {
            results.created++;
          } else if (result.action === 'updated') {
            results.updated++;
          } else if (result.action === 'failed') {
            results.failed++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`   ❌ Error processing workflow: ${error.message}`);
          results.failed++;
        }
        
        console.log(''); // Blank line
      }

      // Summary
      console.log('================================================================================\n');
      console.log('📊 SUMMARY\n');
      console.log(`   ✅ Created: ${results.created} products`);
      console.log(`   🔄 Updated: ${results.updated} products`);
      console.log(`   ❌ Failed: ${results.failed} products`);
      console.log(`   📋 Total: ${workflows.length} workflows processed\n`);
      console.log('================================================================================\n');

    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Run the populator
const populator = new WorkflowPopulator();
populator.populate().catch(console.error);
