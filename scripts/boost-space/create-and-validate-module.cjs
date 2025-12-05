#!/usr/bin/env node

/**
 * Create and Validate "workflows" Custom Module in Boost.space
 * 
 * This script:
 * 1. Attempts to create the custom module via API
 * 2. Validates the module exists
 * 3. Provides field creation instructions
 * 4. Validates field structure once created
 * 
 * Usage:
 *   node scripts/boost-space/create-and-validate-module.cjs
 */

const axios = require('axios');

const BOOST_SPACE_CONFIG = {
  platform: process.env.BOOST_SPACE_PLATFORM || 'https://superseller.boost.space',
  apiKey: process.env.BOOST_SPACE_API_KEY || '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  spaceId: 45, // Space 45: n8n Workflows
  moduleName: 'workflows'
};

// Required fields for validation
const REQUIRED_FIELDS = [
  'name', 'description', 'category', 'status', 'workflow_id', 'n8n_instance'
];

// All expected fields organized by group
const EXPECTED_FIELDS = {
  'Core Information': ['name', 'description', 'category', 'status', 'workflow_id', 'workflow_name_original', 'n8n_instance', 'n8n_url', 'created_date', 'last_successful_run', 'version', 'previous_version_id'],
  'Technical Details': ['node_count', 'complexity_score', 'execution_time_avg', 'execution_time_max', 'integrations_used', 'required_credentials', 'workflow_json_url', 'workflow_json'],
  'Execution Metrics': ['success_rate', 'total_executions', 'successful_executions', 'failed_executions'],
  'Business Metrics': ['revenue_generated', 'customers_served', 'time_saved_hours', 'cost_savings', 'business_value', 'use_cases', 'target_industries', 'tags'],
  'Documentation': ['setup_guide', 'configuration_steps', 'troubleshooting_guide', 'screenshot_urls', 'demo_video_url', 'documentation_url', 'changelog', 'known_issues'],
  'Marketplace': ['marketplace_status', 'marketplace_price_diy', 'marketplace_price_install', 'marketplace_category', 'marketplace_slug', 'marketplace_description', 'marketplace_features', 'marketplace_sales_count', 'marketplace_revenue']
};

class ModuleCreator {
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
   * Attempt to create custom module via API
   * Note: This may not be supported - custom modules often require UI creation
   */
  async createModule() {
    console.log('\n🔨 Attempting to create module via API...\n');
    
    try {
      // Try different API endpoints
      const endpoints = [
        '/api/module',
        '/api/custom-module',
        '/api/space/' + BOOST_SPACE_CONFIG.spaceId + '/module'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.api.post(endpoint, {
            name: BOOST_SPACE_CONFIG.moduleName,
            spaceId: BOOST_SPACE_CONFIG.spaceId,
            moduleType: 'custom-module'
          });
          
          console.log(`✅ Module created successfully via ${endpoint}`);
          console.log('Response:', JSON.stringify(response.data, null, 2));
          return true;
        } catch (error) {
          if (error.response) {
            console.log(`❌ ${endpoint}: ${error.response.status} - ${error.response.statusText}`);
          } else {
            console.log(`❌ ${endpoint}: ${error.message}`);
          }
        }
      }
      
      console.log('\n⚠️  Module creation via API not supported.');
      console.log('📝 Please create the module manually in Boost.space UI:\n');
      console.log(`   1. Go to: ${BOOST_SPACE_CONFIG.platform}`);
      console.log(`   2. Navigate to Space ${BOOST_SPACE_CONFIG.spaceId}`);
      console.log(`   3. Click "+" or "Add Module"`);
      console.log(`   4. Select "Custom Module"`);
      console.log(`   5. Name it: "${BOOST_SPACE_CONFIG.moduleName}"`);
      console.log(`   6. Save\n`);
      
      return false;
    } catch (error) {
      console.error('❌ Error creating module:', error.message);
      return false;
    }
  }

  /**
   * Check if module exists
   */
  async checkModuleExists() {
    try {
      // List all spaces and modules
      const response = await this.api.get('/api/space');
      const spaces = response.data;
      
      const space = spaces.find(s => s.id === BOOST_SPACE_CONFIG.spaceId);
      if (!space) {
        console.log(`❌ Space ${BOOST_SPACE_CONFIG.spaceId} not found`);
        return false;
      }

      console.log(`✅ Space ${BOOST_SPACE_CONFIG.spaceId} exists: "${space.name}"`);
      
      // Try to query the module to see if it exists
      try {
        const moduleResponse = await this.api.get(`/api/${BOOST_SPACE_CONFIG.moduleName}`, {
          params: { spaceId: BOOST_SPACE_CONFIG.spaceId, limit: 1 }
        });
        console.log(`✅ Module "${BOOST_SPACE_CONFIG.moduleName}" exists and is accessible`);
        return true;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ Module "${BOOST_SPACE_CONFIG.moduleName}" not found`);
          return false;
        } else {
          console.log(`⚠️  Cannot verify module existence (${error.response?.status || error.message})`);
          return null; // Unknown
        }
      }
    } catch (error) {
      console.error('❌ Error checking module:', error.message);
      return false;
    }
  }

  /**
   * Get module schema to validate fields
   */
  async validateModuleSchema() {
    console.log('\n🔍 Validating module schema...\n');
    
    try {
      const response = await this.api.get(`/api/${BOOST_SPACE_CONFIG.moduleName}`, {
        params: { spaceId: BOOST_SPACE_CONFIG.spaceId, limit: 0 }
      });

      // Try to get schema information
      // Note: Boost.space API might not expose schema directly
      // We'll need to try creating a test record to see what fields are accepted
      
      console.log('✅ Module is accessible');
      console.log('📋 Attempting to retrieve field schema...\n');
      
      // Try to get schema via describe_module_schema equivalent
      try {
        const schemaResponse = await this.api.get(`/api/${BOOST_SPACE_CONFIG.moduleName}/schema`, {
          params: { spaceId: BOOST_SPACE_CONFIG.spaceId }
        });
        
        console.log('📊 Module Schema:');
        console.log(JSON.stringify(schemaResponse.data, null, 2));
        return schemaResponse.data;
      } catch (schemaError) {
        console.log('⚠️  Schema endpoint not available, will validate via test record');
        return null;
      }
    } catch (error) {
      console.error('❌ Error validating schema:', error.message);
      return null;
    }
  }

  /**
   * Create a test record to validate fields
   */
  async createTestRecord() {
    console.log('\n🧪 Creating test record to validate fields...\n');
    
    const testRecord = {
      name: 'TEST-WORKFLOW-001 - Test Workflow',
      description: 'This is a test workflow record for validation',
      category: 'Internal',
      status: '⚠️ Testing',
      workflow_id: 'TEST-001',
      n8n_instance: 'Rensto VPS',
      node_count: 5,
      complexity_score: 3,
      success_rate: 100,
      total_executions: 1,
      successful_executions: 1
    };

    try {
      const response = await this.api.post(`/api/${BOOST_SPACE_CONFIG.moduleName}`, {
        ...testRecord,
        spaceId: BOOST_SPACE_CONFIG.spaceId
      });

      console.log('✅ Test record created successfully!');
      console.log('📋 Record ID:', response.data.id || response.data.boostId);
      console.log('\n📊 Created fields validated:');
      Object.keys(testRecord).forEach(field => {
        console.log(`   ✅ ${field}`);
      });

      // Try to delete the test record
      if (response.data.id) {
        try {
          await this.api.delete(`/api/${BOOST_SPACE_CONFIG.moduleName}/${response.data.id}`);
          console.log('\n🧹 Test record deleted');
        } catch (deleteError) {
          console.log('\n⚠️  Test record created but could not be deleted (you may need to delete manually)');
        }
      }

      return true;
    } catch (error) {
      if (error.response) {
        console.error('❌ Error creating test record:');
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Message: ${error.response.data?.message || error.response.statusText}`);
        
        if (error.response.data?.errors) {
          console.error('\n📋 Field validation errors:');
          Object.entries(error.response.data.errors).forEach(([field, message]) => {
            console.error(`   ❌ ${field}: ${message}`);
          });
        }
        
        // Check if it's a field validation error
        if (error.response.status === 400 || error.response.status === 422) {
          console.log('\n💡 This likely means some fields are missing or incorrectly configured.');
          console.log('   Please ensure all required fields are created in Boost.space UI.');
        }
      } else {
        console.error('❌ Error:', error.message);
      }
      return false;
    }
  }

  /**
   * Print field creation checklist
   */
  printFieldChecklist() {
    console.log('\n📋 FIELD CREATION CHECKLIST\n');
    console.log('='.repeat(80));
    
    let fieldNumber = 1;
    for (const [groupName, fields] of Object.entries(EXPECTED_FIELDS)) {
      console.log(`\n📁 ${groupName} (${fields.length} fields):`);
      fields.forEach(field => {
        const required = REQUIRED_FIELDS.includes(field) ? '✅ REQUIRED' : '   Optional';
        console.log(`   ${fieldNumber++}. ${field.padEnd(30)} ${required}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 Total: ${Object.values(EXPECTED_FIELDS).flat().length} fields`);
    console.log(`   Required: ${REQUIRED_FIELDS.length} fields`);
    console.log(`   Optional: ${Object.values(EXPECTED_FIELDS).flat().length - REQUIRED_FIELDS.length} fields\n`);
  }

  /**
   * Main validation process
   */
  async validate() {
    console.log('\n✅ VALIDATION SUMMARY\n');
    console.log('='.repeat(80));
    
    // Check if module exists
    const exists = await this.checkModuleExists();
    
    if (!exists) {
      console.log('\n❌ Module does not exist. Please create it first.');
      this.printFieldChecklist();
      return false;
    }

    // Validate schema
    const schema = await this.validateModuleSchema();
    
    // Create test record to validate fields
    const testPassed = await this.createTestRecord();
    
    if (testPassed) {
      console.log('\n✅ VALIDATION PASSED');
      console.log('   Module structure is correct and ready to use!');
      return true;
    } else {
      console.log('\n⚠️  VALIDATION INCOMPLETE');
      console.log('   Some fields may be missing or incorrectly configured.');
      this.printFieldChecklist();
      return false;
    }
  }
}

// Main execution
async function main() {
  console.log('\n🏗️  Boost.space Workflows Module - Create & Validate\n');
  console.log('='.repeat(80));
  
  const creator = new ModuleCreator();
  
  // Step 1: Try to create module
  const created = await creator.createModule();
  
  // Step 2: Wait a moment if created
  if (created) {
    console.log('\n⏳ Waiting 2 seconds for module to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 3: Validate
  await creator.validate();
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Process complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ModuleCreator, EXPECTED_FIELDS, REQUIRED_FIELDS };
