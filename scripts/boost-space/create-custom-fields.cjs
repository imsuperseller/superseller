#!/usr/bin/env node

/**
 * Create Custom Fields for n8n Workflows Module in Boost.space
 * 
 * This script creates all 86 custom fields programmatically via Boost.space API
 * for the "n8n Workflow Fields" field group.
 * 
 * Usage:
 *   node scripts/boost-space/create-custom-fields.cjs
 * 
 * Environment Variables:
 *   BOOST_SPACE_PLATFORM - Default: https://superseller.boost.space
 *   BOOST_SPACE_API_KEY - Required
 */

const axios = require('axios');

const BOOST_SPACE_CONFIG = {
  platform: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupName: 'n8n Workflow Fields (Products)', // Field group for Products module - workflows are products!
  fieldGroupId: process.env.BOOST_SPACE_FIELD_GROUP_ID || null, // Will be created if doesn't exist
  module: 'product', // Native Products module - workflows are products
  spaceId: 39, // Space 39: MCP Servers & Business References (Products space)
};

// Field type mapping: Boost.space field types
const FIELD_TYPE_MAP = {
  'text': 'text', // Short text
  'textarea': 'textarea', // Long text
  'number': 'number',
  'decimal': 'decimal',
  'select': 'select',
  'multiselect': 'multiselect',
  'date': 'date',
  'datetime': 'datetime',
  'checkbox': 'checkbox',
  'url': 'url'
};

// All 86 fields organized by category
// Breakdown: Core (13) + Technical (11) + Business (35) + Documentation (8) + Marketplace (9) = 86
const FIELD_DEFINITIONS = [
  // ========================================
  // CORE FIELDS (13 fields)
  // ========================================
  { name: 'workflow_name', type: 'text', description: 'Workflow Name (e.g., INT-LEAD-001)', required: true },
  { name: 'description', type: 'textarea', description: 'Full description of what the workflow does', required: true },
  { name: 'category', type: 'select', description: 'Category', required: true, options: ['Internal', 'Subscription', 'Marketing', 'Customer', 'Development'] },
  { name: 'status', type: 'select', description: 'Workflow Status', required: true, options: ['✅ Active', '✅ Successful', '⚠️ Testing', '❌ Deprecated', '📦 Template'] },
  { name: 'workflow_id', type: 'text', description: 'n8n workflow ID (e.g., 1LWTwUuN6P6uq2Ha)', required: true },
  { name: 'workflow_name_original', type: 'text', description: 'Original name from n8n' },
  { name: 'n8n_instance', type: 'select', description: 'n8n Instance', options: ['Rensto VPS', 'Tax4Us Cloud', 'Shelly Cloud'] },
  { name: 'n8n_url', type: 'url', description: 'Full URL to workflow' },
  { name: 'created_date', type: 'date', description: 'Date workflow was created' },
  { name: 'last_successful_run', type: 'datetime', description: 'Date of last successful execution' },
  { name: 'version', type: 'text', description: 'Version number (e.g., v2, v1.3)' },
  { name: 'previous_version_id', type: 'text', description: 'Link to previous version record' },
  { name: 'failed_executions', type: 'number', description: 'Count of failed runs' },

  // ========================================
  // TECHNICAL FIELDS (11 fields)
  // ========================================
  { name: 'node_count', type: 'number', description: 'Total nodes in workflow' },
  { name: 'complexity_score', type: 'number', description: 'Complexity rating (1-10)' },
  { name: 'execution_time_avg', type: 'decimal', description: 'Average execution time (seconds)' },
  { name: 'execution_time_max', type: 'decimal', description: 'Maximum execution time (seconds)' },
  { name: 'integrations_used', type: 'textarea', description: 'List of integrations (JSON array)' },
  { name: 'required_credentials', type: 'textarea', description: 'Required API keys/services (JSON array)' },
  { name: 'workflow_json_url', type: 'url', description: 'URL to workflow JSON file' },
  { name: 'workflow_json', type: 'textarea', description: 'Full workflow JSON (if stored inline)' },
  { name: 'success_rate', type: 'number', description: 'Percentage of successful runs (0-100)' },
  { name: 'total_executions', type: 'number', description: 'Total times workflow has run' },
  { name: 'successful_executions', type: 'number', description: 'Count of successful runs' },

  // ========================================
  // BUSINESS FIELDS (35 fields)
  // ========================================
  // Revenue & Financial
  { name: 'revenue_generated', type: 'number', description: 'Total revenue from this workflow' },
  { name: 'revenue_model', type: 'select', description: 'Revenue Model', options: ['One-time', 'Subscription', 'Usage-based', 'Commission', 'Hybrid'] },
  { name: 'monthly_recurring_revenue', type: 'number', description: 'Monthly Recurring Revenue (MRR)' },
  { name: 'annual_recurring_revenue', type: 'number', description: 'Annual Recurring Revenue (ARR)' },
  { name: 'profit_margin', type: 'number', description: 'Profit margin percentage (0-100)' },
  { name: 'cost_per_acquisition', type: 'number', description: 'Customer Acquisition Cost (CAC)' },
  { name: 'customer_lifetime_value', type: 'number', description: 'Customer Lifetime Value (LTV)' },
  { name: 'ltv_cac_ratio', type: 'number', description: 'LTV/CAC Ratio' },
  
  // Customer & Market
  { name: 'customers_served', type: 'number', description: 'Number of customers using this workflow' },
  { name: 'target_customer_segment', type: 'select', description: 'Target Customer Segment', options: ['SMB', 'Mid-Market', 'Enterprise', 'Agency', 'Individual', 'Non-profit'] },
  { name: 'target_market_size', type: 'number', description: 'Total Addressable Market (TAM) size' },
  { name: 'market_opportunity', type: 'select', description: 'Market Opportunity', options: ['High', 'Medium', 'Low', 'Emerging'] },
  { name: 'competitive_advantage', type: 'textarea', description: 'Competitive advantage description' },
  { name: 'market_fit_score', type: 'number', description: 'Product-Market Fit Score (1-10)' },
  
  // Business Impact & ROI
  { name: 'time_saved_hours', type: 'number', description: 'Estimated hours saved per month' },
  { name: 'cost_savings', type: 'number', description: 'Estimated cost savings per month' },
  { name: 'roi_percentage', type: 'number', description: 'Return on Investment (ROI) percentage' },
  { name: 'payback_period_months', type: 'number', description: 'Payback period in months' },
  { name: 'business_value', type: 'select', description: 'Business Value Rating', options: ['High', 'Medium', 'Low'] },
  { name: 'business_impact_score', type: 'number', description: 'Business Impact Score (1-10)' },
  { name: 'strategic_priority', type: 'select', description: 'Strategic Priority', options: ['Critical', 'High', 'Medium', 'Low'] },
  
  // Business Relationships
  { name: 'client_name', type: 'text', description: 'Primary client/customer name' },
  { name: 'business_owner', type: 'text', description: 'Business owner/stakeholder name' },
  { name: 'executive_sponsor', type: 'text', description: 'Executive sponsor name' },
  { name: 'business_unit', type: 'text', description: 'Business unit or department' },
  { name: 'key_stakeholders', type: 'textarea', description: 'Key stakeholders (JSON array)' },
  
  // Business Case & Strategy
  { name: 'business_case', type: 'textarea', description: 'Business case documentation' },
  { name: 'business_justification', type: 'textarea', description: 'Business justification for workflow' },
  { name: 'strategic_alignment', type: 'textarea', description: 'Strategic alignment with business goals' },
  { name: 'success_criteria', type: 'textarea', description: 'Success criteria (JSON array)' },
  { name: 'business_requirements', type: 'textarea', description: 'Business requirements (JSON array)' },
  { name: 'business_metrics', type: 'textarea', description: 'Key business metrics (JSON object)' },
  { name: 'kpis', type: 'textarea', description: 'Key Performance Indicators (JSON array)' },
  
  // Market & Industry
  { name: 'use_cases', type: 'textarea', description: 'Use cases (JSON array)' },
  { name: 'target_industries', type: 'textarea', description: 'Target industries (JSON array)' },
  { name: 'market_segment', type: 'select', description: 'Market Segment', options: ['B2B', 'B2C', 'B2B2C', 'B2G'] },
  { name: 'industry_vertical', type: 'text', description: 'Primary industry vertical' },
  { name: 'geographic_market', type: 'text', description: 'Target geographic market' },
  
  // Business Model & Operations
  { name: 'business_model', type: 'select', description: 'Business Model', options: ['SaaS', 'Marketplace', 'Services', 'Product', 'Hybrid'] },
  { name: 'pricing_strategy', type: 'select', description: 'Pricing Strategy', options: ['Value-based', 'Cost-plus', 'Competitive', 'Freemium', 'Tiered'] },
  { name: 'sales_cycle_days', type: 'number', description: 'Average sales cycle in days' },
  { name: 'conversion_rate', type: 'number', description: 'Conversion rate percentage (0-100)' },
  { name: 'churn_risk', type: 'select', description: 'Churn Risk', options: ['Low', 'Medium', 'High'] },
  { name: 'upsell_opportunity', type: 'select', description: 'Upsell Opportunity', options: ['High', 'Medium', 'Low', 'None'] },
  
  // General
  { name: 'tags', type: 'textarea', description: 'Tags for searchability (JSON array)' },

  // ========================================
  // DOCUMENTATION FIELDS (8 fields)
  // ========================================
  { name: 'setup_guide', type: 'textarea', description: 'Markdown setup instructions' },
  { name: 'configuration_steps', type: 'textarea', description: 'Configuration steps (JSON array)' },
  { name: 'troubleshooting_guide', type: 'textarea', description: 'Common issues and solutions' },
  { name: 'screenshot_urls', type: 'textarea', description: 'Screenshot URLs (JSON array)' },
  { name: 'demo_video_url', type: 'url', description: 'URL to demo video' },
  { name: 'documentation_url', type: 'url', description: 'Link to full documentation' },
  { name: 'changelog', type: 'textarea', description: 'Version history and changes' },
  { name: 'known_issues', type: 'textarea', description: 'Known limitations or issues' },

  // ========================================
  // MARKETPLACE FIELDS (9 fields)
  // ========================================
  { name: 'marketplace_status', type: 'select', description: 'Marketplace Status', options: ['draft', 'pending_review', 'published', 'archived'] },
  { name: 'marketplace_price_diy', type: 'number', description: 'DIY template price (in cents)' },
  { name: 'marketplace_price_install', type: 'number', description: 'Full installation price (in cents)' },
  { name: 'marketplace_category', type: 'select', description: 'Marketplace Category', options: ['Lead Generation', 'Customer Support', 'E-commerce', 'Marketing', 'Sales', 'Operations'] },
  { name: 'marketplace_slug', type: 'text', description: 'URL-friendly slug' },
  { name: 'marketplace_description', type: 'textarea', description: 'Marketing description' },
  { name: 'marketplace_features', type: 'textarea', description: 'Features list (JSON array)' },
  { name: 'marketplace_sales_count', type: 'number', description: 'Total sales' },
  { name: 'marketplace_revenue', type: 'number', description: 'Total marketplace revenue' }
];

class CustomFieldCreator {
  constructor() {
    this.api = axios.create({
      baseURL: BOOST_SPACE_CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    this.fieldGroupId = null;
  }

  /**
   * Find the field group ID by name
   */
  async findFieldGroup() {
    // If manually specified, use it
    if (BOOST_SPACE_CONFIG.fieldGroupId) {
      console.log(`\n✅ Using manually specified field group ID: ${BOOST_SPACE_CONFIG.fieldGroupId}\n`);
      this.fieldGroupId = BOOST_SPACE_CONFIG.fieldGroupId;
      return this.fieldGroupId;
    }

    console.log(`\n🔍 Looking for field group: "${BOOST_SPACE_CONFIG.fieldGroupName}"...\n`);
    
    try {
      // Query custom-field endpoint to find field groups
      const response = await this.api.get('/api/custom-field');
      const groups = Array.isArray(response.data) ? response.data : [];
      
      const group = groups.find(g => 
        g.name === BOOST_SPACE_CONFIG.fieldGroupName || 
        g.title === BOOST_SPACE_CONFIG.fieldGroupName
      );
      
      if (group) {
        this.fieldGroupId = group.id;
        console.log(`✅ Found field group: ID = ${this.fieldGroupId} (${group.boostId})`);
        return this.fieldGroupId;
      }

      console.log(`\n⚠️  Field group not found via API.`);
      console.log(`   Attempting to create new field group: "${BOOST_SPACE_CONFIG.fieldGroupName}"...`);
      
      // Try to create the field group
      const createdGroupId = await this.createFieldGroup();
      if (createdGroupId) {
        this.fieldGroupId = createdGroupId;
        console.log(`✅ Created new field group: ID = ${this.fieldGroupId}`);
        return this.fieldGroupId;
      }
      
      console.log(`   Please ensure "${BOOST_SPACE_CONFIG.fieldGroupName}" exists in Boost.space UI.`);
      console.log(`   You can manually specify the field group ID by setting:`);
      console.log(`   BOOST_SPACE_FIELD_GROUP_ID=<id> node scripts/boost-space/create-custom-fields.cjs\n`);
      
      return null;
    } catch (error) {
      console.error(`❌ Error finding field group: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return null;
    }
  }

  /**
   * Create a new field group
   */
  async createFieldGroup() {
    try {
      const payload = {
        name: BOOST_SPACE_CONFIG.fieldGroupName,
        module: BOOST_SPACE_CONFIG.module,
        table: BOOST_SPACE_CONFIG.module,
        visible: true
      };

      // Try different endpoints for creating field groups
      const endpoints = [
        '/api/custom-field',
        '/api/custom-field-group',
        '/api/field-group'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.api.post(endpoint, payload);
          const groupId = response.data.id || response.data.boostId || response.data.groupId;
          
          if (groupId) {
            console.log(`   ✅ Field group created via ${endpoint}`);
            return groupId;
          }
        } catch (error) {
          if (error.response?.status === 409 || error.response?.status === 422) {
            // Field group might already exist with different name
            continue;
          }
          // Try next endpoint
          continue;
        }
      }

      console.log(`   ⚠️  Could not create field group via API.`);
      return null;
    } catch (error) {
      console.error(`   ❌ Error creating field group: ${error.message}`);
      return null;
    }
  }

  /**
   * Create a single custom field
   */
  async createField(fieldDef, index) {
    const { name, type, description, required = false, options = [] } = fieldDef;
    
    console.log(`\n[${index + 1}/${FIELD_DEFINITIONS.length}] Creating field: ${name} (${type})`);
    
    // Map field type to Boost.space inputType format
    // Based on existing field structure and API validation
    const inputTypeMap = {
      'text': 'text',
      'textarea': 'text', // Boost.space uses 'text' for both short and long text
      'number': 'number',
      'decimal': 'number', // Use 'number' for decimals
      'select': 'select',
      'multiselect': 'multiselect',
      'date': 'date',
      'datetime': 'datetime',
      'checkbox': 'checkbox',
      'url': 'text' // URLs might be stored as text
    };
    
    let inputType = inputTypeMap[type] || 'text';
    
    // Boost.space API field creation payload (based on existing field structure)
    const payload = {
      name: name,
      inputType: inputType,
      description: description || name,
      required: required,
      order: index,
      visible: true,
      protected: false,
      translatable: false,
      elementGroups: [this.fieldGroupId], // Array with field group ID
      spaces: [] // Can be empty or contain space IDs
    };

    // For textarea fields, we might need to set a size or use a different approach
    // For now, use 'text' type which works for both short and long text

    // Add inputOptions for select/multiselect fields
    if ((type === 'select' || type === 'multiselect') && options.length > 0) {
      payload.inputOptions = options.map(opt => ({ value: opt, label: opt }));
    }

    // Try to create field via the custom-field endpoint
    // The field is created as an "input" within the field group
    try {
      // First, get the field group to add the input to it
      const groupResponse = await this.api.get(`/api/custom-field/${this.fieldGroupId}`);
      const fieldGroup = groupResponse.data;
      
      // Create the input field
      // Based on API structure, we need to POST to create an input
      const inputPayload = {
        ...payload,
        module: BOOST_SPACE_CONFIG.module || fieldGroup.module || 'project',
        table: BOOST_SPACE_CONFIG.module || fieldGroup.table || 'project'
      };
      
      // Try POST to /api/custom-field/{groupId}/input or similar
      const endpoints = [
        `/api/custom-field/${this.fieldGroupId}/input`,
        `/api/custom-field-input`,
        `/api/input`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.api.post(endpoint, inputPayload);
          
          const fieldId = response.data.id || response.data.boostId || response.data.inputId;
          console.log(`   ✅ Created successfully! ID: ${fieldId}`);
          return { success: true, fieldId, name };
        } catch (error) {
          if (error.response) {
            // If field already exists, that's okay
            if (error.response.status === 409 || error.response.status === 422) {
              const errorMsg = error.response.data?.message || error.response.statusText;
              if (errorMsg.includes('exists') || errorMsg.includes('duplicate') || errorMsg.includes('already')) {
                console.log(`   ⚠️  Field already exists, skipping...`);
                return { success: true, skipped: true, name };
              }
            }
            
            // If it's a validation error, log it
            if (error.response.status === 400) {
              console.log(`   ⚠️  Validation error: ${error.response.data?.message || error.response.statusText}`);
              // Don't return yet, try next endpoint
              continue;
            }
          }
          
          // Try next endpoint
          continue;
        }
      }

      // If all endpoints failed, try updating the field group directly
      // by adding the input to the group's inputs array
      try {
        const updatePayload = {
          inputs: [...(fieldGroup.inputs || []), inputPayload]
        };
        
        const updateResponse = await this.api.put(`/api/custom-field/${this.fieldGroupId}`, updatePayload);
        console.log(`   ✅ Added to field group via update!`);
        return { success: true, name };
      } catch (updateError) {
        console.log(`   ❌ Failed to create field (tried all methods)`);
        if (updateError.response) {
          console.log(`   Error: ${updateError.response.data?.message || updateError.response.statusText}`);
        }
        return { success: false, error: 'All endpoints failed', name };
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return { success: false, error: error.message, name };
    }
  }

  /**
   * Create all fields
   */
  async createAllFields() {
    console.log('\n🏗️  Creating Custom Fields for n8n Workflows Module\n');
    console.log('='.repeat(80));
    
    // Step 1: Find field group
    const groupId = await this.findFieldGroup();
    
    if (!groupId) {
      console.log('\n❌ Cannot proceed without field group ID.');
      console.log('   Please create the field group manually or provide the ID.\n');
      return { success: false, created: 0, failed: FIELD_DEFINITIONS.length };
    }

    this.fieldGroupId = groupId;

    // Step 2: Create all fields
    console.log(`\n📋 Creating ${FIELD_DEFINITIONS.length} fields...\n`);
    
    const results = {
      created: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < FIELD_DEFINITIONS.length; i++) {
      const result = await this.createField(FIELD_DEFINITIONS[i], i);
      
      if (result.success) {
        if (result.skipped) {
          results.skipped++;
        } else {
          results.created++;
        }
      } else {
        results.failed++;
        results.errors.push({
          field: result.name,
          error: result.error
        });
      }

      // Small delay to avoid rate limiting
      if (i < FIELD_DEFINITIONS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Step 3: Summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY\n');
    console.log(`   ✅ Created: ${results.created} fields`);
    console.log(`   ⚠️  Skipped (already exist): ${results.skipped} fields`);
    console.log(`   ❌ Failed: ${results.failed} fields`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(err => {
        console.log(`   - ${err.field}: ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    
    return results;
  }
}

// Main execution
async function main() {
  console.log('\n🚀 Boost.space Custom Fields Creator\n');
  console.log('='.repeat(80));
  console.log(`Platform: ${BOOST_SPACE_CONFIG.platform}`);
  console.log(`Field Group: ${BOOST_SPACE_CONFIG.fieldGroupName}`);
  console.log(`Space ID: ${BOOST_SPACE_CONFIG.spaceId}`);
  console.log(`Total Fields: ${FIELD_DEFINITIONS.length}`);
  console.log('='.repeat(80));

  const creator = new CustomFieldCreator();
  const results = await creator.createAllFields();

  if (results.failed === 0) {
    console.log('\n✅ All fields processed successfully!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some fields failed to create. Check errors above.\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { CustomFieldCreator, FIELD_DEFINITIONS };
