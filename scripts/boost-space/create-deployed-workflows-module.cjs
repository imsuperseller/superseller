#!/usr/bin/env node

/**
 * Create Deployed Workflows Module
 * 
 * Attempts to create "Deployed Workflows" custom module via API
 * Note: Custom modules may need to be created via UI
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  moduleName: 'Deployed Workflows',
  spaceId: 59, // "n8n Workflows" space (or create new space)
  fieldGroupId: 479 // "n8n Workflow Fields (Products)" - will need to duplicate for new module
};

class ModuleCreator {
  constructor() {
    this.api = axios.create({
      baseURL: CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Attempt to create custom module via API
   * Note: This may not be supported - custom modules often require UI creation
   */
  async createModule() {
    console.log('\n🔨 Attempting to create "Deployed Workflows" module via API...\n');
    console.log(`   Module Name: ${CONFIG.moduleName}`);
    console.log(`   Space ID: ${CONFIG.spaceId}\n`);

    try {
      // Try different API endpoints
      const endpoints = [
        '/api/module',
        '/api/custom-module',
        '/api/space/' + CONFIG.spaceId + '/module',
        '/api/custom-module-item'
      ];

      for (const endpoint of endpoints) {
        try {
          const payload = {
            name: CONFIG.moduleName,
            spaceId: CONFIG.spaceId,
            moduleType: 'custom-module',
            table: 'deployed_workflow' // Suggested table name
          };

          console.log(`   Trying: ${endpoint}...`);
          const response = await this.api.post(endpoint, payload);
          
          console.log(`   ✅ Module created successfully via ${endpoint}`);
          console.log('   Response:', JSON.stringify(response.data, null, 2));
          return response.data;
        } catch (error) {
          if (error.response) {
            console.log(`   ❌ ${endpoint}: ${error.response.status} - ${error.response.statusText}`);
            if (error.response.data) {
              console.log(`      ${JSON.stringify(error.response.data)}`);
            }
          } else {
            console.log(`   ❌ ${endpoint}: ${error.message}`);
          }
        }
      }
      
      console.log('\n⚠️  Module creation via API not supported.');
      console.log('📝 Please create the module manually in Boost.space UI:\n');
      console.log(`   1. Go to: ${CONFIG.platform}`);
      console.log(`   2. Navigate to Space ${CONFIG.spaceId} (or create new space "Deployed Workflows")`);
      console.log(`   3. Click "+" or "Add Module"`);
      console.log(`   4. Select "Custom Module"`);
      console.log(`   5. Name it: "${CONFIG.moduleName}"`);
      console.log(`   6. Save\n`);
      
      return null;
    } catch (error) {
      console.error('❌ Error creating module:', error.message);
      return null;
    }
  }

  /**
   * Check if module exists
   */
  async checkModuleExists() {
    try {
      // Try to list modules
      const response = await this.api.get('/api/module');
      const modules = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      const found = modules.find(m => 
        m.name === CONFIG.moduleName || 
        m.table === 'deployed_workflow' ||
        (m.name && m.name.toLowerCase().includes('deployed'))
      );
      
      if (found) {
        console.log(`✅ Module "${CONFIG.moduleName}" already exists!`);
        console.log(`   ID: ${found.id}`);
        console.log(`   Table: ${found.table || 'N/A'}`);
        return found;
      }
      
      return null;
    } catch (error) {
      console.log('⚠️  Could not check if module exists (API may not support listing modules)');
      return null;
    }
  }

  /**
   * Main execution
   */
  async execute() {
    console.log('🚀 Creating Deployed Workflows Module\n');
    console.log(`Platform: ${CONFIG.platform}`);
    console.log(`Module: ${CONFIG.moduleName}`);
    console.log(`Space: ${CONFIG.spaceId}\n`);

    // Check if module already exists
    const existing = await this.checkModuleExists();
    if (existing) {
      console.log('\n✅ Module already exists - no action needed');
      return existing;
    }

    // Attempt to create
    const created = await this.createModule();
    
    if (created) {
      console.log('\n✅ Module created successfully!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Add custom field group "n8n Workflow Fields" to this module');
      console.log('   2. Run migration script to move workflows from Products → Deployed Workflows');
    } else {
      console.log('\n📋 After creating module manually:');
      console.log('   1. Note the module ID/table name');
      console.log('   2. Add custom field group "n8n Workflow Fields" to this module');
      console.log('   3. Run migration script to move workflows from Products → Deployed Workflows');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const creator = new ModuleCreator();
  creator.execute().catch(console.error);
}

module.exports = ModuleCreator;
