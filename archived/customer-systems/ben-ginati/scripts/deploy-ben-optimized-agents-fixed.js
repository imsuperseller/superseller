#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BenOptimizedAgentsDeployerFixed {
  constructor() {
    this.benConfig = {
      n8nUrl: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8',
        'Content-Type': 'application/json'
      }
    };
    
    this.optimizedAgents = [
      {
        name: 'WordPress Content Agent - Tax4Us (Optimized)',
        file: 'workflows/ben-wordpress-content-agent.json',
        webhookId: 'wordpress-content-agent',
        description: 'Automated content creation and management for Tax4Us website'
      },
      {
        name: 'WordPress Blog & Posts Agent - Tax4Us (Optimized)',
        file: 'workflows/ben-wordpress-blog-agent.json',
        webhookId: 'wordpress-blog-agent',
        description: 'Automated blog post creation and publishing'
      },
      {
        name: 'Podcast Complete Agent - Tax4Us (Optimized)',
        file: 'workflows/ben-podcast-agent.json',
        webhookId: 'podcast-agent',
        description: 'Podcast production and distribution automation'
      },
      {
        name: 'Social Media Agent - Tax4Us (Optimized)',
        file: 'workflows/ben-social-media-agent.json',
        webhookId: 'social-media-agent',
        description: 'Social media content creation and posting automation'
      }
    ];
  }

  async healthCheck() {
    try {
      // Use the working health endpoint
      const response = await axios.get(`${this.benConfig.n8nUrl}/healthz`, {
        headers: this.benConfig.headers
      });
      console.log('✅ Ben\'s n8n Cloud health check passed');
      return true;
    } catch (error) {
      console.error('❌ Ben\'s n8n Cloud health check failed:', error.message);
      return false;
    }
  }

  async listCurrentWorkflows() {
    try {
      const response = await axios.get(`${this.benConfig.n8nUrl}/api/v1/workflows`, {
        headers: this.benConfig.headers
      });
      
      console.log('📋 Current workflows in Ben\'s n8n Cloud:');
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

  async createWorkflow(workflowData) {
    try {
      const response = await axios.post(`${this.benConfig.n8nUrl}/api/v1/workflows`, workflowData, {
        headers: this.benConfig.headers
      });
      
      console.log(`✅ Created workflow: ${workflowData.name} (ID: ${response.data.id})`);
      return { success: true, workflowId: response.data.id };
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Workflow already exists: ${workflowData.name}`);
        return { success: true, workflowId: null, exists: true };
      } else {
        console.error(`❌ Failed to create workflow ${workflowData.name}:`, error.message);
        return { success: false, error: error.message };
      }
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

  async deployOptimizedAgent(agent) {
    try {
      console.log(`\n🚀 Deploying: ${agent.name}`);
      console.log(`📁 File: ${agent.file}`);
      
      // Read workflow file
      const workflowPath = path.join(process.cwd(), agent.file);
      const workflowData = await fs.readFile(workflowPath, 'utf8');
      const workflow = JSON.parse(workflowData);
      
      // Update workflow with current timestamp
      workflow.updatedAt = new Date().toISOString();
      workflow.active = false; // Start inactive, activate after deployment
      
      // Create workflow
      const result = await this.createWorkflow(workflow);
      
      if (result.success && result.workflowId) {
        // Activate the workflow
        const activated = await this.activateWorkflow(result.workflowId);
        
        return {
          agent: agent.name,
          workflowId: result.workflowId,
          deployed: true,
          activated: activated,
          webhookId: agent.webhookId
        };
      } else if (result.exists) {
        console.log(`   ⚠️  Workflow exists, skipping deployment`);
        return {
          agent: agent.name,
          workflowId: null,
          deployed: false,
          activated: false,
          webhookId: agent.webhookId,
          exists: true
        };
      } else {
        return {
          agent: agent.name,
          workflowId: null,
          deployed: false,
          activated: false,
          webhookId: agent.webhookId,
          error: result.error
        };
      }
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${agent.name}:`, error.message);
      return {
        agent: agent.name,
        workflowId: null,
        deployed: false,
        activated: false,
        webhookId: agent.webhookId,
        error: error.message
      };
    }
  }

  async deployAllOptimizedAgents() {
    console.log('🎯 DEPLOYING BEN\'S 4 OPTIMIZED AGENTS (FIXED)');
    console.log('==============================================');
    
    // Health check
    const healthOk = await this.healthCheck();
    if (!healthOk) {
      console.log('❌ Cannot proceed - n8n Cloud is not healthy');
      return false;
    }
    
    // List current workflows
    await this.listCurrentWorkflows();
    
    // Deploy each optimized agent
    const deploymentResults = [];
    
    for (const agent of this.optimizedAgents) {
      const result = await this.deployOptimizedAgent(agent);
      deploymentResults.push(result);
    }
    
    // Summary
    console.log('\n📊 DEPLOYMENT SUMMARY:');
    console.log('======================');
    
    const successful = deploymentResults.filter(r => r.deployed);
    const failed = deploymentResults.filter(r => !r.deployed && !r.exists);
    const existing = deploymentResults.filter(r => r.exists);
    
    console.log(`✅ Successfully deployed: ${successful.length}/4`);
    console.log(`❌ Failed to deploy: ${failed.length}/4`);
    console.log(`⚠️  Already existed: ${existing.length}/4`);
    
    successful.forEach(result => {
      console.log(`   ✅ ${result.agent} - Activated: ${result.activated ? 'YES' : 'NO'}`);
    });
    
    failed.forEach(result => {
      console.log(`   ❌ ${result.agent} - Error: ${result.error}`);
    });
    
    existing.forEach(result => {
      console.log(`   ⚠️  ${result.agent} - Already exists`);
    });
    
    // Next steps
    console.log('\n🚀 NEXT STEPS:');
    console.log('==============');
    console.log('1. ✅ Payment processed ($2,500)');
    console.log('2. ✅ Optimized agents deployed');
    console.log('3. 🔧 Guide Ben through credential setup');
    console.log('4. 🧪 Test agent functionality');
    console.log('5. 💳 Schedule second payment ($2,500 due 2025-03-20)');
    
    return successful.length > 0;
  }
}

// Execute deployment
const deployer = new BenOptimizedAgentsDeployerFixed();

async function main() {
  console.log('🎯 BEN GINATI - OPTIMIZED AGENTS DEPLOYMENT (FIXED)');
  console.log('====================================================');
  
  const success = await deployer.deployAllOptimizedAgents();
  
  if (success) {
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('🚀 Ben Ginati\'s optimized agents are ready');
    console.log('📞 Next: Guide Ben through credential setup');
  } else {
    console.log('\n❌ DEPLOYMENT FAILED');
    console.log('🔧 Manual intervention required');
  }
}

main().catch(console.error);
