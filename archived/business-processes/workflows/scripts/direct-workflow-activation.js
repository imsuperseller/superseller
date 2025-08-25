#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class DirectWorkflowActivator {
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

  async createCredential(credentialData) {
    try {
      console.log(`🔑 Creating credential: ${credentialData.name}`);
      const response = await axios.post(
        `${this.n8nConfig.url}/api/v1/credentials`,
        credentialData,
        { headers: this.n8nConfig.headers }
      );
      console.log(`✅ Created credential: ${credentialData.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️ Credential already exists: ${credentialData.name}`);
        return { id: 'existing', name: credentialData.name };
      }
      console.error(`❌ Failed to create credential ${credentialData.name}:`, error.message);
      return null;
    }
  }

  async createRequiredCredentials() {
    console.log('\n🔑 CREATING REQUIRED CREDENTIALS');
    console.log('================================');

    const credentials = [
      {
        name: 'Rensto Airtable',
        type: 'airtableApi',
        data: {
          apiKey: process.env.AIRTABLE_API_KEY || 'pat_placeholder_key',
          endpoint: 'https://api.airtable.com'
        }
      },
      {
        name: 'Rensto Slack',
        type: 'slackApi',
        data: {
          accessToken: process.env.SLACK_ACCESS_TOKEN || 'xoxb_placeholder_token'
        }
      },
      {
        name: 'Rensto Email',
        type: 'smtp',
        data: {
          host: 'smtp.gmail.com',
          port: 587,
          username: 'hello@renstoworkflows.com',
          password: process.env.EMAIL_PASSWORD || 'placeholder_password'
        }
      }
    ];

    const results = [];
    for (const credential of credentials) {
      const result = await this.createCredential(credential);
      results.push(result);
    }

    return results;
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
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }
      return null;
    }
  }

  async activateCriticalWorkflows() {
    console.log('\n🚀 ACTIVATING CRITICAL WORKFLOWS');
    console.log('================================');

    const workflows = await this.getWorkflows();
    console.log(`📊 Found ${workflows.length} workflows on VPS`);

    const activationResults = [];

    for (const workflowName of this.criticalWorkflows) {
      console.log(`\n🔍 Processing: ${workflowName}`);
      
      const workflow = workflows.find(w => 
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (!workflow) {
        console.log(`❌ Not found: ${workflowName}`);
        activationResults.push({
          name: workflowName,
          status: 'not_found',
          success: false
        });
        continue;
      }

      if (workflow.active) {
        console.log(`✅ Already active: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'already_active',
          success: true
        });
        continue;
      }

      console.log(`🔄 Activating: ${workflow.name} (ID: ${workflow.id})`);
      const result = await this.activateWorkflow(workflow.id);
      
      if (result) {
        console.log(`✅ Successfully activated: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'activated',
          success: true
        });
      } else {
        console.log(`❌ Failed to activate: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'activation_failed',
          success: false
        });
      }
    }

    return activationResults;
  }

  async executeCompleteActivation() {
    console.log('🎯 DIRECT WORKFLOW ACTIVATION');
    console.log('=============================');

    try {
      // Step 1: Create required credentials
      const credentialResults = await this.createRequiredCredentials();

      // Step 2: Activate workflows
      const activationResults = await this.activateCriticalWorkflows();

      // Step 3: Verify results
      console.log('\n📊 ACTIVATION RESULTS');
      console.log('=====================');
      
      const successful = activationResults.filter(r => r.success).length;
      const failed = activationResults.filter(r => !r.success).length;
      
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      
      activationResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}: ${result.status}`);
      });

      // Step 4: Final verification
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
      const results = {
        timestamp: new Date().toISOString(),
        credentialResults,
        activationResults,
        finalVerification: {
          totalCritical: criticalWorkflows.length,
          activeCritical: activeCritical.length,
          activeWorkflows: activeCritical.map(w => w.name)
        }
      };

      await fs.writeFile('data/direct-workflow-activation-results.json', JSON.stringify(results, null, 2));
      console.log('\n📁 Results saved to: data/direct-workflow-activation-results.json');

      return results;

    } catch (error) {
      console.error('❌ Direct Workflow Activation failed:', error);
      throw error;
    }
  }
}

// Execute direct activation
const activator = new DirectWorkflowActivator();
activator.executeCompleteActivation().catch(console.error);
