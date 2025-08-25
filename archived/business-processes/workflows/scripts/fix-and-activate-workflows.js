#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class WorkflowFixerAndActivator {
  constructor() {
    this.n8nConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
        'Content-Type': 'application/json'
      }
    };

    this.criticalWorkflows = [
      'Customer Onboarding Automation',
      'Lead-to-Customer Pipeline',
      'Finance Unpaid Invoices',
      'Assets Renewals < 30d',
      'Projects — In Progress Digest'
    ];
  }

  async getWorkflows() {
    try {
      const response = await axios.get(`${this.n8nConfig.url}/api/v1/workflows`, {
        headers: this.n8nConfig.headers
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Failed to get workflows:', error.message);
      return [];
    }
  }

  async getWorkflow(workflowId) {
    try {
      const response = await axios.get(`${this.n8nConfig.url}/api/v1/workflows/${workflowId}`, {
        headers: this.n8nConfig.headers
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get workflow ${workflowId}:`, error.message);
      return null;
    }
  }

  async updateWorkflow(workflowId, workflowData) {
    try {
      const response = await axios.put(
        `${this.n8nConfig.url}/api/v1/workflows/${workflowId}`,
        workflowData,
        { headers: this.n8nConfig.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to update workflow ${workflowId}:`, error.message);
      return null;
    }
  }

  async activateWorkflow(workflowId) {
    try {
      const response = await axios.post(
        `${this.n8nConfig.url}/api/v1/workflows/${workflowId}/activate`,
        {},
        { headers: this.n8nConfig.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to activate workflow ${workflowId}:`, error.message);
      return null;
    }
  }

  fixWorkflowConfiguration(workflow) {
    const fixedWorkflow = { ...workflow };
    
    // Fix nodes that have configuration issues
    if (fixedWorkflow.nodes) {
      fixedWorkflow.nodes = fixedWorkflow.nodes.map(node => {
        const fixedNode = { ...node };
        
        // Fix webhook nodes
        if (fixedNode.type === 'n8n-nodes-base.webhook') {
          if (!fixedNode.parameters) {
            fixedNode.parameters = {};
          }
          if (!fixedNode.parameters.options) {
            fixedNode.parameters.options = {};
          }
          if (!fixedNode.parameters.responseMode) {
            fixedNode.parameters.responseMode = 'responseNode';
          }
        }
        
        // Fix Airtable nodes
        if (fixedNode.type === 'n8n-nodes-base.airtable') {
          if (!fixedNode.parameters) {
            fixedNode.parameters = {};
          }
          if (!fixedNode.parameters.options) {
            fixedNode.parameters.options = {};
          }
        }
        
        // Fix email nodes
        if (fixedNode.type === 'n8n-nodes-base.emailSend') {
          if (!fixedNode.parameters) {
            fixedNode.parameters = {};
          }
          if (!fixedNode.parameters.options) {
            fixedNode.parameters.options = {};
          }
        }
        
        // Fix Slack nodes
        if (fixedNode.type === 'n8n-nodes-base.slack') {
          if (!fixedNode.parameters) {
            fixedNode.parameters = {};
          }
          if (!fixedNode.parameters.options) {
            fixedNode.parameters.options = {};
          }
        }
        
        // Fix cron nodes
        if (fixedNode.type === 'n8n-nodes-base.cron') {
          if (!fixedNode.parameters) {
            fixedNode.parameters = {};
          }
          if (!fixedNode.parameters.rule) {
            fixedNode.parameters.rule = {
              interval: [{
                field: 'hour',
                expression: '*/4'
              }]
            };
          }
        }
        
        return fixedNode;
      });
    }
    
    // Ensure connections object exists
    if (!fixedWorkflow.connections) {
      fixedWorkflow.connections = {};
    }
    
    // Ensure settings object exists
    if (!fixedWorkflow.settings) {
      fixedWorkflow.settings = {
        executionOrder: 'v1'
      };
    }
    
    return fixedWorkflow;
  }

  async fixAndActivateWorkflows() {
    console.log('🔧 FIXING AND ACTIVATING WORKFLOWS');
    console.log('==================================');

    const workflows = await this.getWorkflows();
    console.log(`📊 Found ${workflows.length} workflows on VPS`);

    const results = [];

    for (const workflowName of this.criticalWorkflows) {
      console.log(`\n🔍 Processing: ${workflowName}`);
      
      const workflow = workflows.find(w => 
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (!workflow) {
        console.log(`❌ Not found: ${workflowName}`);
        results.push({
          name: workflowName,
          status: 'not_found',
          success: false
        });
        continue;
      }

      if (workflow.active) {
        console.log(`✅ Already active: ${workflow.name}`);
        results.push({
          name: workflow.name,
          status: 'already_active',
          success: true
        });
        continue;
      }

      console.log(`🔧 Fixing configuration: ${workflow.name}`);
      
      // Get full workflow details
      const fullWorkflow = await this.getWorkflow(workflow.id);
      if (!fullWorkflow) {
        console.log(`❌ Could not get workflow details: ${workflow.name}`);
        results.push({
          name: workflow.name,
          status: 'get_failed',
          success: false
        });
        continue;
      }

      // Fix the workflow configuration
      const fixedWorkflow = this.fixWorkflowConfiguration(fullWorkflow);
      
      // Update the workflow
      console.log(`📝 Updating workflow: ${workflow.name}`);
      const updateResult = await this.updateWorkflow(workflow.id, fixedWorkflow);
      
      if (!updateResult) {
        console.log(`❌ Failed to update workflow: ${workflow.name}`);
        results.push({
          name: workflow.name,
          status: 'update_failed',
          success: false
        });
        continue;
      }

      // Activate the workflow
      console.log(`🚀 Activating workflow: ${workflow.name}`);
      const activationResult = await this.activateWorkflow(workflow.id);
      
      if (activationResult) {
        console.log(`✅ Successfully activated: ${workflow.name}`);
        results.push({
          name: workflow.name,
          status: 'fixed_and_activated',
          success: true
        });
      } else {
        console.log(`❌ Failed to activate: ${workflow.name}`);
        results.push({
          name: workflow.name,
          status: 'activation_failed',
          success: false
        });
      }
    }

    return results;
  }

  async executeCompleteFixAndActivation() {
    console.log('🎯 WORKFLOW FIX AND ACTIVATION');
    console.log('===============================');

    try {
      // Fix and activate workflows
      const results = await this.fixAndActivateWorkflows();

      // Summary
      console.log('\n📊 RESULTS SUMMARY');
      console.log('==================');
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}: ${result.status}`);
      });

      // Final verification
      console.log('\n🔍 FINAL VERIFICATION');
      console.log('=====================');
      
      const finalWorkflows = await this.getWorkflows();
      const criticalWorkflows = finalWorkflows.filter(w => 
        this.criticalWorkflows.some(name => 
          w.name.toLowerCase().includes(name.toLowerCase())
        )
      );
      
      const activeCritical = criticalWorkflows.filter(w => w.active);
      console.log(`📊 Critical workflows active: ${activeCritical.length}/${criticalWorkflows.length}`);
      
      activeCritical.forEach(w => {
        console.log(`✅ ${w.name}`);
      });

      // Save results
      const finalResults = {
        timestamp: new Date().toISOString(),
        results,
        finalVerification: {
          totalCritical: criticalWorkflows.length,
          activeCritical: activeCritical.length,
          activeWorkflows: activeCritical.map(w => w.name)
        }
      };

      await fs.writeFile('data/workflow-fix-and-activation-results.json', JSON.stringify(finalResults, null, 2));
      console.log('\n📁 Results saved to: data/workflow-fix-and-activation-results.json');

      return finalResults;

    } catch (error) {
      console.error('❌ Workflow Fix and Activation failed:', error);
      throw error;
    }
  }
}

// Execute fix and activation
const fixer = new WorkflowFixerAndActivator();
fixer.executeCompleteFixAndActivation().catch(console.error);
