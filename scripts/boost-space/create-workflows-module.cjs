#!/usr/bin/env node

/**
 * Create "workflows" Custom Module in Boost.space
 * 
 * This script helps create the custom module and fields for storing successful n8n workflows.
 * 
 * Usage:
 *   node scripts/boost-space/create-workflows-module.js
 * 
 * Note: Custom modules must be created via Boost.space UI first.
 * This script provides the field structure and can verify the module exists.
 */

const axios = require('axios');

const BOOST_SPACE_CONFIG = {
  platform: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  spaceId: 45, // Space 45: n8n Workflows
  moduleName: 'workflows'
};

// Field definitions organized by field groups
const FIELD_DEFINITIONS = {
  'Core Information': [
    { name: 'name', type: 'text', required: true, description: 'Workflow name (e.g., INT-LEAD-001 - Lead Machine Orchestrator v2)' },
    { name: 'description', type: 'textarea', required: true, description: 'Full description of what the workflow does' },
    { name: 'category', type: 'select', required: true, options: ['Internal', 'Subscription', 'Marketing', 'Customer', 'Development'], description: 'Workflow category' },
    { name: 'status', type: 'select', required: true, options: ['✅ Active', '✅ Successful', '⚠️ Testing', '❌ Deprecated', '📦 Template'], description: 'Workflow status' },
    { name: 'workflow_id', type: 'text', required: true, description: 'n8n workflow ID (e.g., 1LWTwUuN6P6uq2Ha)' },
    { name: 'workflow_name_original', type: 'text', required: false, description: 'Original name from n8n' },
    { name: 'n8n_instance', type: 'select', required: true, options: ['Rensto VPS', 'Tax4Us Cloud', 'Shelly Cloud'], description: 'n8n instance where workflow runs' },
    { name: 'n8n_url', type: 'url', required: false, description: 'Full URL to workflow' },
    { name: 'created_date', type: 'date', required: false, description: 'Date workflow was created' },
    { name: 'last_successful_run', type: 'datetime', required: false, description: 'Date of last successful execution' },
    { name: 'version', type: 'text', required: false, description: 'Version number (e.g., v2, v1.3)' },
    { name: 'previous_version_id', type: 'text', required: false, description: 'Link to previous version record' }
  ],
  'Technical Details': [
    { name: 'node_count', type: 'number', required: false, description: 'Total nodes in workflow' },
    { name: 'complexity_score', type: 'number', required: false, description: 'Complexity rating (1-10)' },
    { name: 'execution_time_avg', type: 'number', required: false, description: 'Average execution time (seconds)' },
    { name: 'execution_time_max', type: 'number', required: false, description: 'Maximum execution time (seconds)' },
    { name: 'integrations_used', type: 'textarea', required: false, description: 'JSON array of integrations' },
    { name: 'required_credentials', type: 'textarea', required: false, description: 'JSON array of required API keys/services' },
    { name: 'workflow_json_url', type: 'url', required: false, description: 'URL to workflow JSON file' },
    { name: 'workflow_json', type: 'textarea', required: false, description: 'Full workflow JSON (if stored inline)' }
  ],
  'Execution Metrics': [
    { name: 'success_rate', type: 'number', required: false, description: 'Percentage of successful runs (0-100)' },
    { name: 'total_executions', type: 'number', required: false, description: 'Total times workflow has run' },
    { name: 'successful_executions', type: 'number', required: false, description: 'Count of successful runs' },
    { name: 'failed_executions', type: 'number', required: false, description: 'Count of failed runs' }
  ],
  'Business Metrics': [
    { name: 'revenue_generated', type: 'number', required: false, description: 'Total revenue from this workflow' },
    { name: 'customers_served', type: 'number', required: false, description: 'Number of customers using this workflow' },
    { name: 'time_saved_hours', type: 'number', required: false, description: 'Estimated hours saved per month' },
    { name: 'cost_savings', type: 'number', required: false, description: 'Estimated cost savings per month' },
    { name: 'business_value', type: 'select', required: false, options: ['High', 'Medium', 'Low'], description: 'Business value rating' },
    { name: 'use_cases', type: 'textarea', required: false, description: 'JSON array of use cases' },
    { name: 'target_industries', type: 'textarea', required: false, description: 'JSON array of target industries' },
    { name: 'tags', type: 'textarea', required: false, description: 'JSON array of tags for searchability' }
  ],
  'Documentation': [
    { name: 'setup_guide', type: 'textarea', required: false, description: 'Markdown setup instructions' },
    { name: 'configuration_steps', type: 'textarea', required: false, description: 'JSON array of config steps' },
    { name: 'troubleshooting_guide', type: 'textarea', required: false, description: 'Common issues and solutions' },
    { name: 'screenshot_urls', type: 'textarea', required: false, description: 'JSON array of screenshot URLs' },
    { name: 'demo_video_url', type: 'url', required: false, description: 'URL to demo video' },
    { name: 'documentation_url', type: 'url', required: false, description: 'Link to full documentation' },
    { name: 'changelog', type: 'textarea', required: false, description: 'Version history and changes' },
    { name: 'known_issues', type: 'textarea', required: false, description: 'Known limitations or issues' }
  ],
  'Marketplace': [
    { name: 'marketplace_status', type: 'select', required: false, options: ['draft', 'pending_review', 'published', 'archived'], description: 'Marketplace publishing status' },
    { name: 'marketplace_price_diy', type: 'number', required: false, description: 'DIY template price (in cents)' },
    { name: 'marketplace_price_install', type: 'number', required: false, description: 'Full installation price (in cents)' },
    { name: 'marketplace_category', type: 'select', required: false, options: ['Lead Generation', 'Customer Support', 'E-commerce', 'Marketing', 'Sales', 'Operations'], description: 'Marketplace category' },
    { name: 'marketplace_slug', type: 'text', required: false, description: 'URL-friendly slug' },
    { name: 'marketplace_description', type: 'textarea', required: false, description: 'Marketing description' },
    { name: 'marketplace_features', type: 'textarea', required: false, description: 'JSON array of features' },
    { name: 'marketplace_sales_count', type: 'number', required: false, description: 'Total sales' },
    { name: 'marketplace_revenue', type: 'number', required: false, description: 'Total marketplace revenue' }
  ]
};

class WorkflowsModuleCreator {
  constructor() {
    this.api = axios.create({
      baseURL: BOOST_SPACE_CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Check if module exists
   */
  async checkModuleExists() {
    try {
      const response = await this.api.get('/api/space');
      const spaces = response.data;
      
      // Check if workflows module exists in Space 45
      const space45 = spaces.find(s => s.id === BOOST_SPACE_CONFIG.spaceId);
      if (!space45) {
        console.log(`❌ Space ${BOOST_SPACE_CONFIG.spaceId} not found`);
        return false;
      }

      // Note: Custom modules might not show up in this API
      // This is a basic check
      console.log(`✅ Space ${BOOST_SPACE_CONFIG.spaceId} exists: ${space45.name}`);
      return true;
    } catch (error) {
      console.error('❌ Error checking module:', error.message);
      return false;
    }
  }

  /**
   * Print field definitions for manual creation
   */
  printFieldDefinitions() {
    console.log('\n📋 FIELD DEFINITIONS FOR MANUAL CREATION\n');
    console.log('='.repeat(80));
    
    let totalFields = 0;
    
    for (const [groupName, fields] of Object.entries(FIELD_DEFINITIONS)) {
      console.log(`\n📁 Field Group: ${groupName}`);
      console.log('-'.repeat(80));
      
      fields.forEach((field, index) => {
        totalFields++;
        console.log(`\n${totalFields}. ${field.name}`);
        console.log(`   Type: ${field.type}`);
        console.log(`   Required: ${field.required ? '✅ Yes' : '❌ No'}`);
        console.log(`   Description: ${field.description}`);
        if (field.options) {
          console.log(`   Options: ${field.options.join(', ')}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 Total Fields: ${totalFields} across ${Object.keys(FIELD_DEFINITIONS).length} field groups\n`);
  }

  /**
   * Generate JSON structure for field creation
   */
  generateFieldJSON() {
    const fields = [];
    
    for (const [groupName, fieldDefs] of Object.entries(FIELD_DEFINITIONS)) {
      fieldDefs.forEach(field => {
        const fieldObj = {
          name: field.name,
          type: field.type,
          required: field.required || false,
          description: field.description,
          group: groupName
        };
        if (field.options) {
          fieldObj.options = field.options;
        }
        fields.push(fieldObj);
      });
    }
    
    return JSON.stringify(fields, null, 2);
  }

  /**
   * Print instructions
   */
  printInstructions() {
    console.log('\n📖 INSTRUCTIONS\n');
    console.log('='.repeat(80));
    const totalFields = Object.values(FIELD_DEFINITIONS).flat().length;
    console.log(`
1. GO TO BOOST.SPACE UI:
   → https://superseller.boost.space
   → Navigate to Space ${BOOST_SPACE_CONFIG.spaceId}

2. CREATE CUSTOM MODULE:
   → Click "+" or "Add Module"
   → Select "Custom Module"
   → Name it: "${BOOST_SPACE_CONFIG.moduleName}"
   → Save

3. ADD FIELDS:
   → Use the field definitions printed above
   → Create fields in the order shown
   → Organize into field groups as specified

4. VERIFY:
   → Check that all ${totalFields} fields are created
   → Verify field groups are organized correctly
   → Test creating a record

5. NEXT STEPS:
   → Create a test workflow record
   → Set up automation to sync workflows from n8n
`);
    console.log('='.repeat(80));
  }
}

// Main execution
async function main() {
  console.log('\n🏗️  Boost.space Workflows Module Setup\n');
  console.log('='.repeat(80));
  
  const creator = new WorkflowsModuleCreator();
  
  // Check if space exists
  console.log('\n1️⃣ Checking Space...');
  await creator.checkModuleExists();
  
  // Print field definitions
  console.log('\n2️⃣ Field Definitions:');
  creator.printFieldDefinitions();
  
  // Print instructions
  creator.printInstructions();
  
  // Generate JSON for reference
  console.log('\n📄 Field JSON Structure (for reference):');
  console.log(creator.generateFieldJSON());
  
  console.log('\n✅ Setup guide complete!\n');
  console.log('📝 Next: Follow the instructions above to create the module in Boost.space UI\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WorkflowsModuleCreator, FIELD_DEFINITIONS };
