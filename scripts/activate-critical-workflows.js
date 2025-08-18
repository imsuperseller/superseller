#!/usr/bin/env node

import axios from 'axios';

class CriticalWorkflowActivator {
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

  async activateCriticalWorkflows() {
    console.log('🚀 ACTIVATING CRITICAL VPS WORKFLOWS');
    console.log('=====================================');

    const workflows = await this.getWorkflows();
    console.log(`📊 Found ${workflows.length} workflows on VPS`);

    const activationResults = [];

    for (const workflowName of this.criticalWorkflows) {
      console.log(`\n🔍 Looking for: ${workflowName}`);
      
      // Find workflow by name (case-insensitive)
      const workflow = workflows.find(w => 
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (workflow) {
        console.log(`✅ Found: ${workflow.name} (ID: ${workflow.id})`);
        
        if (workflow.active) {
          console.log(`⏭️ Already active: ${workflow.name}`);
          activationResults.push({
            name: workflow.name,
            id: workflow.id,
            status: 'already_active',
            success: true
          });
        } else {
          console.log(`🔄 Activating: ${workflow.name}`);
          const result = await this.activateWorkflow(workflow.id);
          
          if (result) {
            console.log(`✅ Activated: ${workflow.name}`);
            activationResults.push({
              name: workflow.name,
              id: workflow.id,
              status: 'activated',
              success: true
            });
          } else {
            console.log(`❌ Failed to activate: ${workflow.name}`);
            activationResults.push({
              name: workflow.name,
              id: workflow.id,
              status: 'activation_failed',
              success: false
            });
          }
        }
      } else {
        console.log(`❌ Not found: ${workflowName}`);
        activationResults.push({
          name: workflowName,
          id: null,
          status: 'not_found',
          success: false
        });
      }
    }

    // Summary
    console.log('\n📊 ACTIVATION SUMMARY');
    console.log('=====================');
    
    const successful = activationResults.filter(r => r.success).length;
    const failed = activationResults.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    activationResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.status}`);
    });

    return activationResults;
  }
}

// Execute activation
const activator = new CriticalWorkflowActivator();
activator.activateCriticalWorkflows().catch(console.error);
