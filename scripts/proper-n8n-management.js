#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class ProperN8NManager {
  constructor() {
    // VPS Configuration - Full API Access
    this.vpsConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
        'Content-Type': 'application/json'
      }
    };

    // Cloud Configuration - Limited API Access
    this.cloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoRrilg8',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoRrilg8',
        'Content-Type': 'application/json'
      }
    };

    // MCP Server Configuration
    this.mcpConfig = {
      url: 'http://173.254.201.134:5678/webhook/proper-mcp-webhook'
    };

    this.criticalWorkflows = [
      'Customer Onboarding Automation',
      'Lead-to-Customer Pipeline',
      'Finance Unpaid Invoices',
      'Assets Renewals < 30d',
      'Projects — In Progress Digest'
    ];
  }

  // ===== VPS METHODS (Full API Access) =====

  async callMCPServer(method, params = {}) {
    try {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: method,
          arguments: params
        }
      };

      console.log(`🤖 MCP Request: ${method}`);
      const response = await axios.post(this.mcpConfig.url, mcpRequest, {
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

  async getVPSWorkflows() {
    try {
      const response = await axios.get(`${this.vpsConfig.url}/api/v1/workflows`, {
        headers: this.vpsConfig.headers
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Failed to get VPS workflows:', error.message);
      return [];
    }
  }

  async createVPSCredential(credentialData) {
    try {
      console.log(`🔑 Creating VPS credential: ${credentialData.name}`);
      const response = await axios.post(
        `${this.vpsConfig.url}/api/v1/credentials`,
        credentialData,
        { headers: this.vpsConfig.headers }
      );
      console.log(`✅ Created VPS credential: ${credentialData.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️ VPS credential already exists: ${credentialData.name}`);
        return { id: 'existing', name: credentialData.name };
      }
      console.error(`❌ Failed to create VPS credential ${credentialData.name}:`, error.message);
      return null;
    }
  }

  async activateVPSWorkflow(workflowId) {
    try {
      const response = await axios.post(
        `${this.vpsConfig.url}/api/v1/workflows/${workflowId}/activate`,
        {},
        { headers: this.vpsConfig.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to activate VPS workflow ${workflowId}:`, error.message);
      return null;
    }
  }

  // ===== CLOUD METHODS (Limited API Access) =====

  async getCloudWorkflows() {
    try {
      const response = await axios.get(`${this.cloudConfig.url}/api/v1/workflows`, {
        headers: this.cloudConfig.headers
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Failed to get Cloud workflows:', error.message);
      return [];
    }
  }

  async activateCloudWorkflow(workflowId) {
    try {
      const response = await axios.post(
        `${this.cloudConfig.url}/api/v1/workflows/${workflowId}/activate`,
        {},
        { headers: this.cloudConfig.headers }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to activate Cloud workflow ${workflowId}:`, error.message);
      return null;
    }
  }

  // ===== UNIFIED MANAGEMENT METHODS =====

  async manageVPSInstance() {
    console.log('\n🏢 MANAGING RENSTO VPS INSTANCE');
    console.log('================================');

    // Step 1: Create required credentials (VPS has full API access)
    console.log('\n🔑 Creating VPS Credentials...');
    const vpsCredentials = [
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

    const credentialResults = [];
    for (const credential of vpsCredentials) {
      const result = await this.createVPSCredential(credential);
      credentialResults.push(result);
    }

    // Step 2: Get VPS workflows
    console.log('\n📊 Getting VPS Workflows...');
    const vpsWorkflows = await this.getVPSWorkflows();
    console.log(`Found ${vpsWorkflows.length} workflows on VPS`);

    // Step 3: Activate critical workflows using MCP server
    console.log('\n🚀 Activating Critical VPS Workflows...');
    const activationResults = [];

    for (const workflowName of this.criticalWorkflows) {
      console.log(`\n🔍 Processing: ${workflowName}`);
      
      const workflow = vpsWorkflows.find(w => 
        w.name.toLowerCase().includes(workflowName.toLowerCase())
      );

      if (!workflow) {
        console.log(`❌ Not found: ${workflowName}`);
        activationResults.push({
          name: workflowName,
          status: 'not_found',
          success: false,
          instance: 'vps'
        });
        continue;
      }

      if (workflow.active) {
        console.log(`✅ Already active: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'already_active',
          success: true,
          instance: 'vps'
        });
        continue;
      }

      console.log(`🔄 Activating via MCP: ${workflow.name}`);
      const result = await this.callMCPServer('activate_workflow', { workflowId: workflow.id });
      
      if (result) {
        console.log(`✅ Successfully activated: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'activated_via_mcp',
          success: true,
          instance: 'vps'
        });
      } else {
        console.log(`❌ Failed to activate: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'activation_failed',
          success: false,
          instance: 'vps'
        });
      }
    }

    return {
      credentials: credentialResults,
      workflows: vpsWorkflows,
      activations: activationResults
    };
  }

  async manageCloudInstance() {
    console.log('\n☁️ MANAGING CUSTOMER CLOUD INSTANCE');
    console.log('===================================');

    // Step 1: Get Cloud workflows (limited API access)
    console.log('\n📊 Getting Cloud Workflows...');
    const cloudWorkflows = await this.getCloudWorkflows();
    console.log(`Found ${cloudWorkflows.length} workflows on Cloud`);

    // Step 2: Note credential limitations
    console.log('\n⚠️ Cloud Instance Limitations:');
    console.log('- No credential API access (405 errors)');
    console.log('- Limited workflow creation (400 errors)');
    console.log('- Manual credential setup required');
    console.log('- AI chat agent guides customers');

    // Step 3: Activate available workflows
    console.log('\n🚀 Activating Available Cloud Workflows...');
    const activationResults = [];

    // For Cloud instances, we can only activate existing workflows
    const availableWorkflows = cloudWorkflows.filter(w => !w.active).slice(0, 5); // Limit to 5

    for (const workflow of availableWorkflows) {
      console.log(`\n🔄 Activating Cloud workflow: ${workflow.name}`);
      const result = await this.activateCloudWorkflow(workflow.id);
      
      if (result) {
        console.log(`✅ Successfully activated: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'activated',
          success: true,
          instance: 'cloud'
        });
      } else {
        console.log(`❌ Failed to activate: ${workflow.name}`);
        activationResults.push({
          name: workflow.name,
          status: 'activation_failed',
          success: false,
          instance: 'cloud'
        });
      }
    }

    return {
      workflows: cloudWorkflows,
      activations: activationResults,
      limitations: {
        noCredentialAPI: true,
        limitedWorkflowCreation: true,
        manualSetupRequired: true
      }
    };
  }

  async executeProperManagement() {
    console.log('🎯 PROPER N8N MANAGEMENT - VPS vs CLOUD');
    console.log('========================================');

    try {
      // Manage VPS Instance (Full API Access)
      const vpsResults = await this.manageVPSInstance();

      // Manage Cloud Instance (Limited API Access)
      const cloudResults = await this.manageCloudInstance();

      // Summary
      console.log('\n📊 MANAGEMENT RESULTS SUMMARY');
      console.log('=============================');
      
      const vpsSuccessful = vpsResults.activations.filter(r => r.success).length;
      const cloudSuccessful = cloudResults.activations.filter(r => r.success).length;
      
      console.log(`🏢 VPS Instance:`);
      console.log(`   - Workflows found: ${vpsResults.workflows.length}`);
      console.log(`   - Successful activations: ${vpsSuccessful}`);
      console.log(`   - Credentials created: ${vpsResults.credentials.filter(r => r).length}`);
      
      console.log(`\n☁️ Cloud Instance:`);
      console.log(`   - Workflows found: ${cloudResults.workflows.length}`);
      console.log(`   - Successful activations: ${cloudSuccessful}`);
      console.log(`   - Limitations: ${Object.keys(cloudResults.limitations).length} identified`);

      // Save results
      const finalResults = {
        timestamp: new Date().toISOString(),
        vps: vpsResults,
        cloud: cloudResults,
        summary: {
          vpsWorkflows: vpsResults.workflows.length,
          vpsActivations: vpsSuccessful,
          cloudWorkflows: cloudResults.workflows.length,
          cloudActivations: cloudSuccessful
        }
      };

      await fs.writeFile('data/proper-n8n-management-results.json', JSON.stringify(finalResults, null, 2));
      console.log('\n📁 Results saved to: data/proper-n8n-management-results.json');

      return finalResults;

    } catch (error) {
      console.error('❌ Proper N8N Management failed:', error);
      throw error;
    }
  }
}

// Execute proper management
const manager = new ProperN8NManager();
manager.executeProperManagement().catch(console.error);
