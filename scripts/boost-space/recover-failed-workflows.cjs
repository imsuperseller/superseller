#!/usr/bin/env node

/**
 * Recover Failed Workflows - Key Collision Handler
 * 
 * This script handles workflows that failed due to key collisions.
 * It finds the correct record for each failed workflow and updates it.
 * 
 * Usage:
 *   node scripts/boost-space/recover-failed-workflows.cjs
 * 
 * Or with specific workflow IDs:
 *   node scripts/boost-space/recover-failed-workflows.cjs --workflow-ids "id1,id2,id3"
 */

const axios = require('axios');
const FieldUpdater = require('./update-deployed-workflows-fields.cjs');

const CONFIG = {
  boostSpace: {
    platform: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    sourceModule: 'product',
    sourceSpaceId: 59,
    targetModule: 'custom-module-item',
    targetSpaceId: 61,
    fieldGroupId: 475
  }
};

class FailedWorkflowRecovery {
  constructor() {
    this.updater = new FieldUpdater();
    this.boostApi = axios.create({
      baseURL: CONFIG.boostSpace.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get command line arguments
   */
  getArgs() {
    const args = process.argv.slice(2);
    const parsed = {
      workflowIds: null
    };

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--workflow-ids' && args[i + 1]) {
        parsed.workflowIds = args[i + 1].split(',').map(id => id.trim());
      }
    }

    return parsed;
  }

  /**
   * Find workflows with key collisions
   */
  async findCollisionWorkflows() {
    console.log('🔍 Scanning for workflows with key collisions...\n');
    
    try {
      // Fetch all deployed workflows
      const allWorkflows = await this.updater.fetchAllDeployedWorkflows();
      
      // Group by workflow_id to find duplicates
      const workflowIdMap = new Map();
      const collisions = [];

      for (const workflow of allWorkflows) {
        const workflowId = this.updater.getWorkflowIdFromRecord(workflow);
        if (workflowId) {
          if (!workflowIdMap.has(workflowId)) {
            workflowIdMap.set(workflowId, []);
          }
          workflowIdMap.get(workflowId).push(workflow);
        }
      }

      // Find duplicates
      for (const [workflowId, records] of workflowIdMap.entries()) {
        if (records.length > 1) {
          collisions.push({
            workflowId,
            records,
            count: records.length
          });
        }
      }

      console.log(`✅ Found ${collisions.length} workflow_ids with collisions\n`);
      return collisions;
    } catch (error) {
      console.error('❌ Error finding collisions:', error.message);
      return [];
    }
  }

  /**
   * Find workflows with missing workflow_id
   */
  async findWorkflowsWithoutId() {
    console.log('🔍 Scanning for workflows without workflow_id...\n');
    
    try {
      const allWorkflows = await this.updater.fetchAllDeployedWorkflows();
      const products = await this.updater.fetchWorkflowProducts();
      
      const missing = [];

      for (const workflow of allWorkflows) {
        const workflowId = this.updater.getWorkflowIdFromRecord(workflow);
        if (!workflowId) {
          // Try to find matching product
          const product = products.find(p => {
            const productName = p.name || '';
            const itemName = workflow.name || '';
            return itemName && productName && (
              itemName.includes(productName.substring(0, 30)) || 
              productName.includes(itemName.substring(0, 30))
            );
          });

          if (product) {
            missing.push({
              workflow,
              product,
              workflowId: this.updater.getWorkflowId(product)
            });
          }
        }
      }

      console.log(`✅ Found ${missing.length} workflows without workflow_id\n`);
      return missing;
    } catch (error) {
      console.error('❌ Error finding missing IDs:', error.message);
      return [];
    }
  }

  /**
   * Resolve collision by keeping the record with most fields populated
   */
  async resolveCollision(collision) {
    const { workflowId, records } = collision;
    
    console.log(`\n🔧 Resolving collision for workflow_id: ${workflowId}`);
    console.log(`   Found ${records.length} records with same workflow_id`);

    // Find the record with most fields populated
    let bestRecord = records[0];
    let maxFields = (bestRecord.customFieldsValues || []).length;

    for (const record of records.slice(1)) {
      const fieldCount = (record.customFieldsValues || []).length;
      if (fieldCount > maxFields) {
        bestRecord = record;
        maxFields = fieldCount;
      }
    }

    console.log(`   ✅ Keeping record ${bestRecord.id} (${maxFields} fields)`);
    console.log(`   🗑️  Other records: ${records.filter(r => r.id !== bestRecord.id).map(r => r.id).join(', ')}`);

    // Find matching product
    const products = await this.updater.fetchWorkflowProducts();
    const product = products.find(p => this.updater.getWorkflowId(p) === workflowId);

    if (!product) {
      console.log(`   ⚠️  No matching product found for workflow_id: ${workflowId}`);
      return { success: false, error: 'No matching product' };
    }

    // Update the best record
    console.log(`   🔄 Updating record ${bestRecord.id}...`);
    const result = await this.updater.updateWorkflow(bestRecord, product, records);

    if (result.success) {
      console.log(`   ✅ Successfully updated record ${bestRecord.id}`);
    } else {
      console.log(`   ❌ Failed to update: ${result.error}`);
    }

    return result;
  }

  /**
   * Update workflow without workflow_id
   */
  async updateWorkflowWithoutId(missing) {
    const { workflow, product, workflowId } = missing;
    
    console.log(`\n🔧 Updating workflow without workflow_id: Record ${workflow.id}`);
    console.log(`   Product: ${product.name}`);
    console.log(`   workflow_id: ${workflowId}`);

    const allWorkflows = await this.updater.fetchAllDeployedWorkflows();
    const result = await this.updater.updateWorkflow(workflow, product, allWorkflows);

    if (result.success) {
      console.log(`   ✅ Successfully updated record ${workflow.id}`);
    } else {
      console.log(`   ❌ Failed to update: ${result.error}`);
    }

    return result;
  }

  /**
   * Main recovery process
   */
  async recover() {
    console.log('🚀 Failed Workflow Recovery Script\n');
    console.log('================================================================================\n');

    const args = this.getArgs();
    let results = {
      collisionsResolved: 0,
      workflowsUpdated: 0,
      failed: 0
    };

    try {
      // If specific workflow IDs provided, handle those
      if (args.workflowIds && args.workflowIds.length > 0) {
        console.log(`📋 Processing ${args.workflowIds.length} specific workflows...\n`);
        
        const products = await this.updater.fetchWorkflowProducts();
        const allWorkflows = await this.updater.fetchAllDeployedWorkflows();
        
        for (const workflowId of args.workflowIds) {
          const product = products.find(p => this.updater.getWorkflowId(p) === workflowId);
          if (!product) {
            console.log(`⚠️  Product not found for workflow_id: ${workflowId}`);
            continue;
          }

          const workflow = allWorkflows.find(w => {
            const wId = this.updater.getWorkflowIdFromRecord(w);
            return wId === workflowId;
          });

          if (!workflow) {
            console.log(`⚠️  Workflow record not found for workflow_id: ${workflowId}`);
            continue;
          }

          console.log(`\n[${args.workflowIds.indexOf(workflowId) + 1}/${args.workflowIds.length}] ${product.name}`);
          const result = await this.updater.updateWorkflow(workflow, product, allWorkflows);
          
          if (result.success) {
            results.workflowsUpdated++;
          } else {
            results.failed++;
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        // Auto-detect and resolve collisions
        console.log('📋 Auto-detecting and resolving issues...\n');

        // Find and resolve collisions
        const collisions = await this.findCollisionWorkflows();
        for (const collision of collisions) {
          const result = await this.resolveCollision(collision);
          if (result.success) {
            results.collisionsResolved++;
            results.workflowsUpdated++;
          } else {
            results.failed++;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Find and update workflows without workflow_id
        const missing = await this.findWorkflowsWithoutId();
        for (const item of missing) {
          const result = await this.updateWorkflowWithoutId(item);
          if (result.success) {
            results.workflowsUpdated++;
          } else {
            results.failed++;
          }
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Summary
      console.log('\n================================================================================\n');
      console.log('📊 Recovery Summary:\n');
      console.log(`   🔧 Collisions Resolved: ${results.collisionsResolved}`);
      console.log(`   ✅ Workflows Updated: ${results.workflowsUpdated}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      console.log('\n================================================================================\n');

    } catch (error) {
      console.error('\n❌ Recovery failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const recovery = new FailedWorkflowRecovery();
  recovery.recover().catch(console.error);
}

module.exports = FailedWorkflowRecovery;
