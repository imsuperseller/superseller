#!/usr/bin/env node

/**
 * Migrate Workflows from Products → Deployed Workflows Module
 * 
 * Fetches all workflow products from Products module and creates
 * corresponding records in Deployed Workflows module
 */

const axios = require('axios');

const CONFIG = {
  boostSpace: {
    platform: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    sourceModule: 'product',
    sourceSpaceId: 59, // Space 59 "n8n Workflows" (where workflows currently are)
    targetModule: 'custom-module-item', // Custom module table name
    targetModuleId: 17, // Deployed Workflows module ID (from URL: /list/17/61)
    targetSpaceId: 61, // Space ID (from URL: /list/17/61)
    fieldGroupId: 479 // "n8n Workflow Fields" - will need to connect/duplicate for new module
  }
};

class WorkflowMigrator {
  constructor() {
    this.boostApi = axios.create({
      baseURL: CONFIG.boostSpace.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    this.defaultStatusSystemId = null; // Will be fetched on first use
    this.fieldNameToIdMap = null; // Will cache field name to input ID mapping for target module
  }

  /**
   * Get custom field input IDs for Deployed Workflows module
   * Maps field names to their input IDs in the target module
   */
  async getFieldNameToIdMap() {
    if (this.fieldNameToIdMap) {
      return this.fieldNameToIdMap;
    }

    try {
      console.log('   🔍 Fetching custom field IDs for Deployed Workflows module...');
      
      // Get the field group
      const fieldGroupResponse = await this.boostApi.get(`/api/custom-field/${CONFIG.boostSpace.fieldGroupId}`);
      const fieldGroup = fieldGroupResponse.data;
      const inputs = fieldGroup.inputs || [];

      // Create map: field name -> input ID
      this.fieldNameToIdMap = {};
      inputs.forEach(input => {
        const fieldName = input.name || input.title;
        if (fieldName) {
          this.fieldNameToIdMap[fieldName] = input.id;
        }
      });

      console.log(`   ✅ Mapped ${Object.keys(this.fieldNameToIdMap).length} custom fields`);
      return this.fieldNameToIdMap;
    } catch (error) {
      console.error('   ❌ Error fetching field mapping:', error.message);
      return {};
    }
  }

  /**
   * Map custom fields from Products module to Deployed Workflows module
   * Converts field input IDs from Products to Deployed Workflows
   */
  async mapCustomFields(sourceCustomFields) {
    const fieldMap = await this.getFieldNameToIdMap();
    const mappedFields = [];

    for (const sourceField of sourceCustomFields) {
      const fieldName = sourceField.customFieldInputName;
      const targetInputId = fieldMap[fieldName];

      if (targetInputId) {
        // Create new custom field value with correct input ID for target module
        const mappedField = {
          customFieldInputId: targetInputId,
          customFieldInputName: fieldName,
          value: sourceField.value,
          valueInt: sourceField.valueInt,
          valueFloat: sourceField.valueFloat,
          valueDatetime: sourceField.valueDatetime,
          valueWysiwyg: sourceField.valueWysiwyg,
          fileId: sourceField.fileId,
          selected: sourceField.selected
        };
        mappedFields.push(mappedField);
      } else {
        console.log(`   ⚠️  Field "${fieldName}" not found in target module, skipping...`);
      }
    }

    return mappedFields;
  }

  /**
   * Get default status system ID for custom module
   */
  async getDefaultStatusSystemId() {
    if (this.defaultStatusSystemId) {
      return this.defaultStatusSystemId;
    }

    try {
      // Try to fetch existing records in the target module/space to see what statusSystemId is used
      const response = await this.boostApi.get(`/api/${CONFIG.boostSpace.targetModule}`, {
        params: { 
          limit: 10,
          spaceId: CONFIG.boostSpace.targetSpaceId 
        }
      });

      const items = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);

      if (items.length > 0 && items[0].statusSystemId) {
        this.defaultStatusSystemId = items[0].statusSystemId;
        console.log(`   ℹ️  Using status system ID: ${this.defaultStatusSystemId} (from existing records)`);
        return this.defaultStatusSystemId;
      }

      // If no existing records, use common default for custom modules
      // Status system ID 94 is commonly used for custom modules
      this.defaultStatusSystemId = 94;
      console.log(`   ℹ️  Using default status system ID: ${this.defaultStatusSystemId} (no existing records found)`);
      return this.defaultStatusSystemId;
    } catch (error) {
      // If all else fails, use a common default
      console.log(`   ⚠️  Could not fetch status system ID, using default: 94`);
      this.defaultStatusSystemId = 94;
      return this.defaultStatusSystemId;
    }
  }

  /**
   * Fetch all workflow products from Products module
   */
  async fetchWorkflowProducts() {
    console.log('📋 Fetching workflow products from Products module...\n');
    
    try {
      let allProducts = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await this.boostApi.get('/api/product', {
          params: {
            limit: limit,
            offset: offset
          }
        });

        const products = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);

        // Filter for workflows (INT-*, SUB-*, MKT-*, CUSTOMER-*, STRIPE-*, DEV-*, TYPEFORM-*)
        const workflows = products.filter(p => {
          const name = p.name || '';
          return name.includes('INT-') || 
                 name.includes('SUB-') || 
                 name.includes('MKT-') || 
                 name.includes('CUSTOMER-') || 
                 name.includes('STRIPE-') || 
                 name.includes('DEV-') || 
                 name.includes('TYPEFORM-');
        });

        allProducts = allProducts.concat(workflows);
        offset += limit;
        hasMore = products.length === limit;

        if (hasMore) {
          console.log(`   Fetched ${allProducts.length} workflows so far...`);
        }
      }

      console.log(`   ✅ Found ${allProducts.length} workflow products\n`);
      return allProducts;
    } catch (error) {
      console.error('❌ Error fetching workflow products:', error.message);
      throw error;
    }
  }

  /**
   * Find existing workflow in Deployed Workflows module by workflow_id
   */
  async findExistingWorkflow(workflowId) {
    try {
      // Search for existing workflow by workflow_id (key field)
      // Try different search approaches
      const searchParams = {
        limit: 100,
        spaceId: CONFIG.boostSpace.targetSpaceId
      };

      const response = await this.boostApi.get(`/api/${CONFIG.boostSpace.targetModule}`, {
        params: searchParams
      });

      const items = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);

      // Filter by space and search for workflow_id in custom fields or name
      const match = items.find(item => {
        // Check if workflow_id matches in custom fields
        if (item.customFieldsValues) {
          const workflowIdField = item.customFieldsValues.find(
            field => field.customFieldInputName === 'workflow_id' && field.value === workflowId
          );
          if (workflowIdField) return true;
        }
        // Check if name contains workflow_id
        if (item.name && item.name.includes(workflowId)) return true;
        return false;
      });

      return match || null;
    } catch (error) {
      console.log(`   ⚠️  Search failed for ${workflowId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Create record in Deployed Workflows module
   */
  async createDeployedWorkflow(product) {
    try {
      const workflowId = product.sku || product.customFieldsValues?.find(
        f => f.customFieldInputName === 'workflow_id'
      )?.value;

      if (!workflowId) {
        throw new Error('No workflow_id found in product');
      }

      // Check if workflow already exists
      const existing = await this.findExistingWorkflow(workflowId);
      if (existing) {
        console.log(`   ⏭️  Workflow already exists (ID: ${existing.id}), skipping...`);
        return { success: true, id: existing.id, action: 'skipped', data: existing };
      }

      // Extract custom fields from product and map to Deployed Workflows module
      const sourceCustomFields = product.customFieldsValues || [];
      const customFieldsValues = await this.mapCustomFields(sourceCustomFields);

      // Get default status system ID for custom module (required by API)
      const statusSystemId = await this.getDefaultStatusSystemId();

      // Map product data to deployed workflow format
      const workflowData = {
        name: product.name,
        description: product.description || product.invoice_description || product.name,
        spaces: [CONFIG.boostSpace.targetSpaceId],
        spaceId: CONFIG.boostSpace.targetSpaceId,
        statusSystemId: statusSystemId, // Required by Boost.space API for custom modules
        customFieldsValues: customFieldsValues
      };

      // Create in custom module
      // Custom modules use /api/custom-module-item endpoint
      const response = await this.boostApi.post(`/api/${CONFIG.boostSpace.targetModule}`, workflowData);
      
      return { success: true, id: response.data.id, action: 'created', data: response.data };
    } catch (error) {
      console.error(`   ❌ Error creating deployed workflow: ${error.message}`);
      if (error.response) {
        console.error(`      Status: ${error.response.status}`);
        console.error(`      Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Main migration process
   */
  async migrate() {
    console.log('🚀 Migrating Workflows from Products → Deployed Workflows\n');
    console.log(`Source: Products module (Space ${CONFIG.boostSpace.sourceSpaceId})`);
    console.log(`Target: Deployed Workflows module (Space ${CONFIG.boostSpace.targetSpaceId})\n`);

    try {
      // Fetch all workflow products
      const workflowProducts = await this.fetchWorkflowProducts();

      if (workflowProducts.length === 0) {
        console.log('⚠️  No workflow products found to migrate');
        return;
      }

      console.log(`📦 Migrating ${workflowProducts.length} workflows...\n`);

      let successCount = 0;
      let skippedCount = 0;
      let failCount = 0;

      for (let i = 0; i < workflowProducts.length; i++) {
        const product = workflowProducts[i];
        console.log(`[${i + 1}/${workflowProducts.length}] Migrating: ${product.name}`);

        const result = await this.createDeployedWorkflow(product);

        if (result.success) {
          if (result.action === 'skipped') {
            skippedCount++;
            console.log(`   ⏭️  Skipped (already exists)`);
          } else {
            successCount++;
            console.log(`   ✅ Created in Deployed Workflows (ID: ${result.id})`);
          }
        } else {
          failCount++;
          console.log(`   ❌ Failed: ${result.error}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log('\n📊 Migration Summary:');
      console.log(`   ✅ Created: ${successCount}`);
      console.log(`   ⏭️  Skipped: ${skippedCount} (already exist)`);
      console.log(`   ❌ Failed: ${failCount}`);
      console.log(`   📋 Total: ${workflowProducts.length}`);

      if (successCount > 0) {
        console.log('\n✅ Migration complete!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Verify workflows in Deployed Workflows module');
        console.log('   2. Optionally delete workflow products from Products module');
        console.log('   3. Set up relationships (Subscription → Deployed Workflows, etc.)');
      }

    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const migrator = new WorkflowMigrator();
  migrator.migrate().catch(console.error);
}

module.exports = WorkflowMigrator;
