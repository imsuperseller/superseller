#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class MCPWorkflowManager {
  constructor() {
    this.mcpServerUrl = 'http://173.254.201.134:5678/webhook/proper-mcp-webhook';
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

  async callMCPServer(method, params = {}) {
    try {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: method,
        params: params
      };

      console.log(`🤖 MCP Request: ${method}`);
      const response = await axios.post(this.mcpServerUrl, mcpRequest, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.error) {
        console.error(`❌ MCP Error: ${response.data.error.message}`);
        return null;
      }

      console.log(`✅ MCP Response: ${method} successful`);
      return response.data.result;
    } catch (error) {
      console.error(`❌ MCP Call failed: ${error.message}`);
      return null;
    }
  }

  async getWorkflowsViaMCP() {
    return await this.callMCPServer('tools/call', {
      name: 'list_workflows',
      arguments: {}
    });
  }

  async activateWorkflowViaMCP(workflowId) {
    return await this.callMCPServer('tools/call', {
      name: 'activate_workflow',
      arguments: { workflowId }
    });
  }

  async createCredentialViaMCP(credentialData) {
    return await this.callMCPServer('tools/call', {
      name: 'create_credential',
      arguments: credentialData
    });
  }

  async getWorkflowsDirect() {
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

  async analyzeWorkflowCredentials(workflow) {
    const nodes = workflow.nodes || [];
    const credentialRequirements = new Set();
    
    nodes.forEach(node => {
      if (node.credentials) {
        Object.keys(node.credentials).forEach(credType => {
          credentialRequirements.add(credType);
        });
      }
      
      // Check node type for common credential needs
      if (node.type?.includes('airtable')) {
        credentialRequirements.add('airtableApi');
      }
      if (node.type?.includes('slack')) {
        credentialRequirements.add('slackApi');
      }
      if (node.type?.includes('email') || node.type?.includes('smtp')) {
        credentialRequirements.add('smtp');
      }
    });
    
    return Array.from(credentialRequirements);
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

    for (const credential of credentials) {
      console.log(`🔑 Creating: ${credential.name}`);
      const result = await this.createCredentialViaMCP(credential);
      if (result) {
        console.log(`✅ Created: ${credential.name}`);
      } else {
        console.log(`⚠️ May already exist: ${credential.name}`);
      }
    }
  }

  async activateWorkflowsWithCredentialCheck() {
    console.log('\n🚀 ACTIVATING WORKFLOWS WITH CREDENTIAL CHECK');
    console.log('=============================================');

    const workflows = await this.getWorkflowsDirect();
    const activationResults = [];

    for (const workflowName of this.criticalWorkflows) {
      console.log(`\n🔍 Processing: ${workflowName}`);
      
      const workflow = workflows.find(w => 
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (!workflow) {
        console.log(`❌ Not found: ${workflowName}`);
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

      // Analyze credential requirements
      const requiredCreds = await this.analyzeWorkflowCredentials(workflow);
      console.log(`🔑 Required credentials: ${requiredCreds.join(', ') || 'None'}`);

      // Try to activate
      console.log(`🔄 Activating: ${workflow.name}`);
      const result = await this.activateWorkflowViaMCP(workflow.id);
      
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
          success: false,
          requiredCredentials: requiredCreds
        });
      }
    }

    return activationResults;
  }

  async executeCompleteWorkflowManagement() {
    console.log('🎯 MCP WORKFLOW MANAGEMENT SYSTEM');
    console.log('==================================');
    console.log('Using MCP server for automated workflow management...');

    try {
      // Step 1: Create required credentials
      await this.createRequiredCredentials();

      // Step 2: Activate workflows with credential checking
      const activationResults = await this.activateWorkflowsWithCredentialCheck();

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
        if (result.requiredCredentials) {
          console.log(`   🔑 Needs credentials: ${result.requiredCredentials.join(', ')}`);
        }
      });

      // Step 4: Final verification
      console.log('\n🔍 FINAL VERIFICATION');
      console.log('=====================');
      
      const finalWorkflows = await this.getWorkflowsDirect();
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
        activationResults,
        finalVerification: {
          totalCritical: criticalWorkflows.length,
          activeCritical: activeCritical.length,
          activeWorkflows: activeCritical.map(w => w.name)
        }
      };

      await fs.writeFile('data/mcp-workflow-management-results.json', JSON.stringify(results, null, 2));
      console.log('\n📁 Results saved to: data/mcp-workflow-management-results.json');

      return results;

    } catch (error) {
      console.error('❌ MCP Workflow Management failed:', error);
      throw error;
    }
  }
}

// Execute MCP workflow management
const mcpManager = new MCPWorkflowManager();
mcpManager.executeCompleteWorkflowManagement().catch(console.error);
