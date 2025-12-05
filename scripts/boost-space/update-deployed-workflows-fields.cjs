#!/usr/bin/env node

/**
 * Update Deployed Workflows Custom Fields
 * 
 * Updates existing workflow records in Deployed Workflows module
 * with correct custom field values mapped from Products module
 */

const axios = require('axios');

const CONFIG = {
  boostSpace: {
    platform: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    sourceModule: 'product',
    sourceSpaceId: 59,
    targetModule: 'custom-module-item',
    targetSpaceId: 61,
    fieldGroupId: 475 // "n8n Workflow Fields" for custom-module-item (Deployed Workflows), NOT 479 (Products)
  }
};

class FieldUpdater {
  constructor() {
    this.boostApi = axios.create({
      baseURL: CONFIG.boostSpace.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    this.fieldNameToIdMap = null;
  }

  /**
   * Get custom field input IDs for Deployed Workflows module
   */
  async getFieldNameToIdMap() {
    if (this.fieldNameToIdMap) {
      return this.fieldNameToIdMap;
    }

    try {
      console.log('🔍 Fetching custom field IDs for Deployed Workflows module...\n');
      
      const fieldGroupResponse = await this.boostApi.get(`/api/custom-field/${CONFIG.boostSpace.fieldGroupId}`);
      const fieldGroup = fieldGroupResponse.data;
      const inputs = fieldGroup.inputs || [];

      this.fieldNameToIdMap = {};
      inputs.forEach(input => {
        const fieldName = input.name || input.title;
        if (fieldName) {
          this.fieldNameToIdMap[fieldName] = input.id;
        }
      });

      console.log(`✅ Mapped ${Object.keys(this.fieldNameToIdMap).length} custom fields\n`);
      return this.fieldNameToIdMap;
    } catch (error) {
      console.error('❌ Error fetching field mapping:', error.message);
      return {};
    }
  }

  /**
   * Map custom fields from Products to Deployed Workflows
   */
  async mapCustomFields(sourceCustomFields) {
    const fieldMap = await this.getFieldNameToIdMap();
    const mappedFields = [];

    for (const sourceField of sourceCustomFields) {
      const fieldName = sourceField.customFieldInputName;
      const targetInputId = fieldMap[fieldName];

      if (targetInputId) {
        const mappedField = {
          customFieldInputId: targetInputId,
          customFieldInputName: fieldName,
          value: sourceField.value,
          valueInt: sourceField.valueInt,
          valueFloat: sourceField.valueFloat,
          valueDatetime: sourceField.valueDatetime,
          valueWysiwyg: sourceField.valueWysiwyg,
          fileId: sourceField.fileId,
          selected: sourceField.selected,
          // CRITICAL: Products module includes module/table - required for custom modules
          module: 'custom-module-item',
          table: 'custom_module_item'
        };
        mappedFields.push(mappedField);
      }
    }

    return mappedFields;
  }

  /**
   * Fetch workflow products from Products module
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
          params: { limit, offset }
        });

        const products = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);

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

      console.log(`✅ Found ${allProducts.length} workflow products\n`);
      return allProducts;
    } catch (error) {
      console.error('❌ Error fetching workflow products:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all workflows from Deployed Workflows module
   */
  async fetchAllDeployedWorkflows() {
    try {
      let allWorkflows = [];
      let offset = 0;
      const limit = 200;
      let hasMore = true;

      while (hasMore) {
        const response = await this.boostApi.get(`/api/${CONFIG.boostSpace.targetModule}`, {
          params: { 
            limit, 
            offset,
            spaceId: CONFIG.boostSpace.targetSpaceId 
          }
        });

        const items = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);

        allWorkflows = allWorkflows.concat(items);
        offset += limit;
        hasMore = items.length === limit;
      }

      return allWorkflows;
    } catch (error) {
      console.error('Error fetching deployed workflows:', error.message);
      return [];
    }
  }

  /**
   * Extract workflow_id from product (SKU or custom field)
   */
  getWorkflowId(product) {
    return product.sku || product.customFieldsValues?.find(
      f => f.customFieldInputName === 'workflow_id'
    )?.value;
  }

  /**
   * Extract workflow_id from deployed workflow record
   */
  getWorkflowIdFromRecord(record) {
    if (record.customFieldsValues && record.customFieldsValues.length > 0) {
      const workflowIdField = record.customFieldsValues.find(
        field => field.customFieldInputName === 'workflow_id' && field.value
      );
      if (workflowIdField) return workflowIdField.value;
    }
    // Also check if name contains workflow_id (some records might have it in name)
    const itemName = record.name || '';
    if (itemName) {
      // Try to extract workflow ID from name (format: "Workflow Name (ID)")
      const match = itemName.match(/\(([A-Za-z0-9_-]+)\)/);
      if (match) return match[1];
    }
    return null;
  }

  /**
   * Find workflow in Deployed Workflows by workflow_id (primary) or name (fallback)
   * Also checks for key collisions (another record already has this workflow_id)
   */
  async findWorkflow(product, allDeployedWorkflows, currentRecordId = null) {
    const productName = product.name || '';
    const workflowId = this.getWorkflowId(product);

    // PRIMARY: Match by workflow_id in custom fields (most reliable)
    if (workflowId) {
      const match = allDeployedWorkflows.find(item => {
        // Skip current record if checking for collisions
        if (currentRecordId && item.id === currentRecordId) return false;
        
        const itemWorkflowId = this.getWorkflowIdFromRecord(item);
        if (itemWorkflowId === workflowId) return true;
        
        // Also check if name contains workflow_id
        const itemName = item.name || '';
        if (itemName && itemName.includes(workflowId)) return true;
        return false;
      });
      if (match) return match;
    }

    // FALLBACK: Try to find by exact name match
    if (productName) {
      const match = allDeployedWorkflows.find(item => {
        // Skip current record if checking for collisions
        if (currentRecordId && item.id === currentRecordId) return false;
        
        const itemName = item.name || '';
        return itemName === productName || itemName.trim() === productName.trim();
      });
      if (match) return match;

      // Try partial name match
      const partialMatch = allDeployedWorkflows.find(item => {
        // Skip current record if checking for collisions
        if (currentRecordId && item.id === currentRecordId) return false;
        
        const itemName = item.name || '';
        return itemName && productName && (
          itemName.includes(productName.substring(0, 30)) || 
          productName.includes(itemName.substring(0, 30))
        );
      });
      if (partialMatch) return partialMatch;
    }

    return null;
  }

  /**
   * Check if updating this record would cause a key collision
   * Returns the conflicting record if found, null otherwise
   */
  async checkKeyCollision(workflowRecord, product, allDeployedWorkflows) {
    const workflowId = this.getWorkflowId(product);
    if (!workflowId) return null; // No workflow_id to check

    // Check if another record already has this workflow_id
    const existingRecord = await this.findWorkflow(product, allDeployedWorkflows, workflowRecord.id);
    if (existingRecord) {
      const existingWorkflowId = this.getWorkflowIdFromRecord(existingRecord);
      if (existingWorkflowId === workflowId) {
        return existingRecord; // Collision detected
      }
    }

    return null; // No collision
  }

  /**
   * Update workflow with custom fields
   * Handles key collisions by finding the correct record
   */
  async updateWorkflow(workflowRecord, product, allDeployedWorkflows) {
    try {
      const workflowId = this.getWorkflowId(product);
      
      // Check for key collision BEFORE updating
      const collisionRecord = await this.checkKeyCollision(workflowRecord, product, allDeployedWorkflows);
      if (collisionRecord) {
        const currentWorkflowId = this.getWorkflowIdFromRecord(workflowRecord);
        const collisionWorkflowId = this.getWorkflowIdFromRecord(collisionRecord);
        
        // If current record doesn't have workflow_id but collision record does, update collision record instead
        if (!currentWorkflowId && collisionWorkflowId === workflowId) {
          console.log(`   🔄 Key collision detected: Record ${workflowRecord.id} would conflict with ${collisionRecord.id}`);
          console.log(`   🔄 Updating correct record ${collisionRecord.id} instead...`);
          // Recursively update the correct record
          const result = await this.updateWorkflow(collisionRecord, product, allDeployedWorkflows);
          if (result.success) {
            result.collisionResolved = true;
          }
          return result;
        }
        
        // If both have workflow_id and they match, skip (already updated)
        if (currentWorkflowId === workflowId && collisionWorkflowId === workflowId) {
          console.log(`   ⏭️  Record ${workflowRecord.id} already has correct workflow_id, skipping...`);
          return { success: true, id: workflowRecord.id, skipped: true, reason: 'Already has correct workflow_id' };
        }
        
        // Otherwise, this is a real collision - log and skip
        console.log(`   ⚠️  Key collision: Record ${workflowRecord.id} would conflict with ${collisionRecord.id}`);
        console.log(`   ⚠️  Current: ${currentWorkflowId || 'none'}, Product: ${workflowId}, Collision: ${collisionWorkflowId}`);
        return { success: false, error: `Key collision with record ${collisionRecord.id}`, collision: true };
      }

      const sourceCustomFields = product.customFieldsValues || [];
      let customFieldsValues = await this.mapCustomFields(sourceCustomFields);

      if (customFieldsValues.length === 0) {
        console.log(`   ⚠️  No custom fields to map, skipping...`);
        return { success: false, error: 'No custom fields mapped' };
      }

      // CRITICAL: Match Products module format EXACTLY
      // Products module does NOT include entityId - Boost.space adds it automatically
      // Products module sends ALL fields at once, not in batches
      // Filter out empty/null values (Products module excludes these)
      // Also filter out fields that might cause validation errors
      customFieldsValues = customFieldsValues
        .filter(field => {
          // Only include fields with actual values (like Products module does)
          const hasValue = field.value !== null && 
                          field.value !== undefined && 
                          field.value !== '';
          const hasValidId = field.customFieldInputId && 
                            typeof field.customFieldInputId === 'number';
          // Exclude very long values that might cause issues
          const valueLength = String(field.value || '').length;
          const reasonableLength = valueLength < 10000; // 10KB limit per field
          
          return hasValue && hasValidId && reasonableLength;
        })
        .map(field => ({
          customFieldInputId: field.customFieldInputId,
          value: String(field.value), // Ensure value is string
          module: 'custom-module-item',
          table: 'custom_module_item'
          // DO NOT include entityId - Boost.space adds it automatically
          // DO NOT include customFieldInputName - not needed
        }));

      // CRITICAL: Do NOT include 'name' field - custom-module-item doesn't support it
      // Test showed: With name = 0 fields saved, Without name = fields saved
      const updatePayload = {
        customFieldsValues: customFieldsValues
      };

      // Log first update attempt for debugging
      if (workflowRecord.id === 429 || product.name?.includes('CUSTOMER-WHATSAPP-002A')) {
        console.log(`   🔍 DEBUG: Sending ${customFieldsValues.length} fields`);
        console.log(`   🔍 DEBUG: First 3 fields: ${JSON.stringify(customFieldsValues.slice(0, 3), null, 2)}`);
      }

      const response = await this.boostApi.put(
        `/api/${CONFIG.boostSpace.targetModule}/${workflowRecord.id}`,
        updatePayload
      );

      // Check immediate response
      const immediateFields = response.data?.customFieldsValues || [];
      if (workflowRecord.id === 429 || product.name?.includes('CUSTOMER-WHATSAPP-002A')) {
        console.log(`   🔍 DEBUG: Immediate response has ${immediateFields.length} fields`);
      }

      // Wait a moment for Boost.space to process
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get final state to verify how many fields were actually saved
      const finalResponse = await this.boostApi.get(
        `/api/${CONFIG.boostSpace.targetModule}/${workflowRecord.id}`
      );
      const finalFields = finalResponse.data?.customFieldsValues || [];

      return { 
        success: true, 
        id: workflowRecord.id, 
        fieldsUpdated: customFieldsValues.length,
        fieldsActuallySaved: finalFields.length
      };
    } catch (error) {
      // Check if this is a key collision error from the API
      const errorMessage = error.message || '';
      const errorData = error.response?.data || {};
      const errorString = JSON.stringify(errorData);
      
      if (errorString.includes('Collision') || errorString.includes('collision') || 
          errorString.includes('key-column') || errorString.includes('workflow_id')) {
        console.error(`   ⚠️  Key collision error detected: ${errorMessage}`);
        
        // Try to find the correct record
        const workflowId = this.getWorkflowId(product);
        if (workflowId) {
          const correctRecord = await this.findWorkflow(product, allDeployedWorkflows, workflowRecord.id);
          if (correctRecord) {
            console.log(`   🔄 Found correct record ${correctRecord.id}, updating that instead...`);
            // Recursively update the correct record (but prevent infinite loops)
            if (correctRecord.id !== workflowRecord.id) {
              const result = await this.updateWorkflow(correctRecord, product, allDeployedWorkflows);
              if (result.success) {
                result.collisionResolved = true;
              }
              return result;
            }
          }
        }
        
        return { success: false, error: `Key collision: ${errorMessage}`, collision: true };
      }
      
      console.error(`   ❌ Error updating: ${errorMessage}`);
      if (error.response) {
        console.error(`      Status: ${error.response.status}`);
        console.error(`      Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Main update process
   */
  async update() {
    console.log('🚀 Updating Custom Fields in Deployed Workflows\n');
    console.log(`Source: Products module (Space ${CONFIG.boostSpace.sourceSpaceId})`);
    console.log(`Target: Deployed Workflows module (Space ${CONFIG.boostSpace.targetSpaceId})\n`);

    try {
      // Get field mapping first
      await this.getFieldNameToIdMap();

      // Fetch workflow products
      const workflowProducts = await this.fetchWorkflowProducts();

      if (workflowProducts.length === 0) {
        console.log('⚠️  No workflow products found');
        return;
      }

      console.log(`📦 Fetching all workflows from Deployed Workflows module...\n`);
      const allDeployedWorkflows = await this.fetchAllDeployedWorkflows();
      console.log(`✅ Found ${allDeployedWorkflows.length} workflows in Deployed Workflows module\n`);

      console.log(`📦 Updating ${workflowProducts.length} workflows...\n`);
      console.log(`🔍 Using improved matching: workflow_id → name → sequential\n`);

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;
      let collisionCount = 0;
      let resolvedCollisions = 0;

      // Try to match by workflow_id first, then fall back to sequential
      for (let i = 0; i < workflowProducts.length; i++) {
        const product = workflowProducts[i];
        const workflowId = this.getWorkflowId(product);
        
        // Try to find matching record
        let existing = await this.findWorkflow(product, allDeployedWorkflows);
        
        // Fallback to sequential matching if no match found
        if (!existing && i < allDeployedWorkflows.length) {
          existing = allDeployedWorkflows[i];
          console.log(`[${i + 1}/${workflowProducts.length}] ${product.name} → Record ID ${existing.id} (sequential fallback)`);
        } else if (existing) {
          console.log(`[${i + 1}/${workflowProducts.length}] ${product.name} → Record ID ${existing.id} (matched by ${workflowId ? 'workflow_id' : 'name'})`);
        } else {
          console.log(`[${i + 1}/${workflowProducts.length}] ${product.name} → ⚠️  No matching record found`);
          skippedCount++;
          continue;
        }

        // Update with custom fields
        const result = await this.updateWorkflow(existing, product, allDeployedWorkflows);

        if (result.success) {
          if (result.skipped) {
            skippedCount++;
            console.log(`   ⏭️  Skipped: ${result.reason}`);
          } else {
          successCount++;
            if (result.collisionResolved) {
              resolvedCollisions++;
            }
          if (result.fieldsActuallySaved === 0 && result.fieldsUpdated > 0) {
            console.log(`   ⚠️  Updated but 0 fields saved (${result.fieldsUpdated} sent) - may need to check field mapping`);
          } else if (result.fieldsActuallySaved < result.fieldsUpdated) {
            console.log(`   ⚠️  Updated (${result.fieldsActuallySaved}/${result.fieldsUpdated} fields saved)`);
          } else {
            console.log(`   ✅ Updated (${result.fieldsActuallySaved} fields)`);
            }
          }
        } else {
          failCount++;
          if (result.collision) {
            collisionCount++;
            console.log(`   ⚠️  Key collision: ${result.error}`);
          } else {
          console.log(`   ❌ Failed: ${result.error}`);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log('\n📊 Update Summary:');
      console.log(`   ✅ Updated: ${successCount}`);
      console.log(`   ⏭️  Skipped: ${skippedCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
      if (collisionCount > 0) {
        console.log(`   ⚠️  Key Collisions: ${collisionCount}`);
      }
      if (resolvedCollisions > 0) {
        console.log(`   🔄 Resolved Collisions: ${resolvedCollisions}`);
      }
      console.log(`   📋 Total: ${workflowProducts.length}`);

      if (successCount > 0) {
        console.log('\n✅ Update complete!');
        console.log('\n📋 Next Steps:');
        console.log('   1. ⚠️  IMPORTANT: Verify field group 475 is CONNECTED in UI');
        console.log('      Go to: https://superseller.boost.space/list/17/61');
        console.log('      Open a record → Look for "Connect" button on field group');
        console.log('      Connect: "n8n Workflow Fields" (ID: 475)');
        console.log('   2. After connection, fields should appear in UI');
        console.log('   3. If fields still empty, re-run this script after connecting');
      }

    } catch (error) {
      console.error('\n❌ Update failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const updater = new FieldUpdater();
  updater.update().catch(console.error);
}

module.exports = FieldUpdater;
