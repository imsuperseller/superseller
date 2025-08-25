#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs/promises';

class BenAgentActivatorFixed {
  constructor() {
    this.benConfig = {
      n8nUrl: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
        'Content-Type': 'application/json'
      }
    };
    
    this.agents = [
      {
        name: 'WordPress Content Agent',
        workflowId: 'wordpress-content-agent-optimized',
        webhookId: 'wordpress-content-agent',
        status: 'ready_for_activation'
      },
      {
        name: 'WordPress Blog & Posts Agent',
        workflowId: 'wordpress-blog-agent-optimized',
        webhookId: 'wordpress-blog-agent',
        status: 'ready_for_activation'
      },
      {
        name: 'Podcast Complete Agent',
        workflowId: 'podcast-agent-optimized',
        webhookId: 'podcast-agent',
        status: 'ready_for_activation'
      },
      {
        name: 'Social Media Agent',
        workflowId: 'social-media-agent-optimized',
        webhookId: 'social-media-agent',
        status: 'ready_for_activation'
      }
    ];
  }

  async healthCheck() {
    try {
      // Use the working health endpoint
      const response = await axios.get(`${this.benConfig.n8nUrl}/healthz`, {
        headers: this.benConfig.headers
      });
      console.log('✅ n8n Cloud Health Check: PASSED');
      return true;
    } catch (error) {
      console.error('❌ n8n Cloud Health Check: FAILED', error.message);
      return false;
    }
  }

  async listWorkflows() {
    try {
      // Use the working workflows endpoint
      const response = await axios.get(`${this.benConfig.n8nUrl}/api/v1/workflows`, {
        headers: this.benConfig.headers
      });
      
      console.log('📋 CURRENT WORKFLOWS:');
      if (response.data.data && response.data.data.length > 0) {
        response.data.data.forEach(workflow => {
          console.log(`   - ${workflow.name} (ID: ${workflow.id}) - ${workflow.active ? 'ACTIVE' : 'INACTIVE'}`);
        });
      } else {
        console.log('   No workflows found');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Failed to list workflows:', error.message);
      return [];
    }
  }

  async activateWorkflow(workflowId) {
    try {
      const response = await axios.post(`${this.benConfig.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {}, {
        headers: this.benConfig.headers
      });
      
      console.log(`✅ Activated workflow: ${workflowId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to activate workflow ${workflowId}:`, error.message);
      return false;
    }
  }

  async testWebhook(webhookId) {
    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Webhook test from Rensto activation script'
      };
      
      const response = await axios.post(`${this.benConfig.n8nUrl}/webhook/${webhookId}`, testPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ Webhook test successful: ${webhookId}`);
      return true;
    } catch (error) {
      console.error(`❌ Webhook test failed ${webhookId}:`, error.message);
      return false;
    }
  }

  async activateAllAgents() {
    console.log('🚀 ACTIVATING BEN GINATI AGENTS (FIXED)');
    console.log('========================================');
    
    // Health check
    const healthOk = await this.healthCheck();
    if (!healthOk) {
      console.log('❌ Cannot proceed - n8n Cloud is not accessible');
      return false;
    }
    
    // List current workflows
    const workflows = await this.listWorkflows();
    
    // Find and activate our optimized agents
    const activationResults = [];
    
    for (const agent of this.agents) {
      console.log(`\n🎯 Processing: ${agent.name}`);
      
      // Find workflow by ID or name
      const workflow = workflows.find(w => 
        w.id === agent.workflowId || 
        w.name.toLowerCase().includes(agent.name.toLowerCase().split(' ')[0]) // Match by first word
      );
      
      if (workflow) {
        console.log(`   Found workflow: ${workflow.name} (ID: ${workflow.id})`);
        
        if (!workflow.active) {
          const activated = await this.activateWorkflow(workflow.id);
          activationResults.push({
            agent: agent.name,
            workflowId: workflow.id,
            activated: activated,
            webhookTest: activated ? await this.testWebhook(agent.webhookId) : false
          });
        } else {
          console.log(`   ✅ Already active`);
          activationResults.push({
            agent: agent.name,
            workflowId: workflow.id,
            activated: true,
            webhookTest: await this.testWebhook(agent.webhookId)
          });
        }
      } else {
        console.log(`   ❌ Workflow not found for: ${agent.name}`);
        console.log(`   🔍 Available workflows:`);
        workflows.forEach(w => console.log(`      - ${w.name} (${w.id})`));
        activationResults.push({
          agent: agent.name,
          workflowId: null,
          activated: false,
          webhookTest: false
        });
      }
    }
    
    // Summary
    console.log('\n📊 ACTIVATION SUMMARY:');
    console.log('======================');
    
    const successful = activationResults.filter(r => r.activated);
    const failed = activationResults.filter(r => !r.activated);
    
    console.log(`✅ Successfully activated: ${successful.length}/4`);
    console.log(`❌ Failed to activate: ${failed.length}/4`);
    
    successful.forEach(result => {
      console.log(`   ✅ ${result.agent} - Webhook: ${result.webhookTest ? 'OK' : 'FAILED'}`);
    });
    
    failed.forEach(result => {
      console.log(`   ❌ ${result.agent} - Not found or failed`);
    });
    
    // Update customer profile
    await this.updateCustomerProfile(activationResults);
    
    return successful.length === 4;
  }

  async updateCustomerProfile(activationResults) {
    try {
      const profilePath = 'data/customers/ben-ginati/customer-profile.json';
      const profileData = await fs.readFile(profilePath, 'utf8');
      const profile = JSON.parse(profileData);
      
      // Update agent statuses
      profile.agents.forEach(agent => {
        const result = activationResults.find(r => r.agent === agent.name);
        if (result) {
          agent.status = result.activated ? 'active' : 'failed';
          agent.activatedAt = result.activated ? new Date().toISOString() : null;
          agent.webhookTest = result.webhookTest;
        }
      });
      
      // Update customer status
      const allActivated = activationResults.every(r => r.activated);
      profile.customer.status = allActivated ? 'fully_active' : 'partially_active';
      profile.customer.updatedAt = new Date().toISOString();
      
      await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));
      
      console.log('📝 Customer profile updated');
      
    } catch (error) {
      console.error('❌ Failed to update customer profile:', error.message);
    }
  }
}

// Execute agent activation
const activator = new BenAgentActivatorFixed();

async function main() {
  console.log('🎯 BEN GINATI - AGENT ACTIVATION (FIXED)');
  console.log('==========================================');
  
  const success = await activator.activateAllAgents();
  
  if (success) {
    console.log('\n🎉 ALL AGENTS ACTIVATED SUCCESSFULLY!');
    console.log('🚀 Ben Ginati is now fully operational');
    console.log('📞 Next: Guide Ben through credential setup');
  } else {
    console.log('\n⚠️  PARTIAL ACTIVATION - MANUAL REVIEW REQUIRED');
    console.log('🔧 Some agents may need manual activation');
  }
}

main().catch(console.error);
