#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BenOptimizedAgentsDeployer {
  constructor() {
    this.benConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
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
      const response = await axios.get(`${this.benConfig.url}/api/v1/health`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      console.log('✅ Ben\'s n8n Cloud is healthy');
      return true;
    } catch (error) {
      console.error('❌ Ben\'s n8n Cloud health check failed:', error.message);
      return false;
    }
  }

  async listCurrentWorkflows() {
    try {
      const response = await axios.get(`${this.benConfig.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      const workflows = response.data.data || [];
      console.log(`📊 Found ${workflows.length} current workflows in Ben's n8n Cloud`);
      return workflows;
    } catch (error) {
      console.error('❌ Failed to list workflows:', error.message);
      return [];
    }
  }

  async createWorkflow(workflowData) {
    try {
      const response = await axios.post(`${this.benConfig.url}/api/v1/workflows`, workflowData, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.benConfig.apiKey
        }
      });
      console.log(`✅ Created workflow: ${workflowData.name}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️ Workflow already exists: ${workflowData.name}`);
        return null;
      }
      console.error(`❌ Failed to create workflow ${workflowData.name}:`, error.message);
      return null;
    }
  }

  async activateWorkflow(workflowId) {
    try {
      const response = await axios.patch(`${this.benConfig.url}/api/v1/workflows/${workflowId}`, {
        active: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.benConfig.apiKey
        }
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
      console.log(`🚀 Deploying ${agent.name}...`);
      
      // Read workflow file
      const workflowPath = path.join(process.cwd(), agent.file);
      const workflowData = await fs.readFile(workflowPath, 'utf-8');
      const workflow = JSON.parse(workflowData);
      
      // Update workflow with Ben's specific configuration
      workflow.name = agent.name;
      workflow.id = agent.webhookId;
      workflow.active = false; // Start inactive until credentials are set up
      
      // Create workflow
      const createdWorkflow = await this.createWorkflow(workflow);
      
      if (createdWorkflow) {
        console.log(`✅ Successfully deployed ${agent.name}`);
        return {
          success: true,
          workflow: createdWorkflow,
          webhookUrl: `${this.benConfig.url}/webhook/${agent.webhookId}`
        };
      } else {
        console.log(`⚠️ Skipped ${agent.name} (already exists)`);
        return { success: false, reason: 'already_exists' };
      }
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${agent.name}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async deployAllOptimizedAgents() {
    console.log('🎯 DEPLOYING BEN\'S 4 OPTIMIZED AGENTS');
    console.log('=====================================');
    console.log('');
    
    // Health check
    const isHealthy = await this.healthCheck();
    if (!isHealthy) {
      console.log('❌ Cannot proceed - n8n Cloud is not healthy');
      return;
    }
    
    console.log('');
    
    // Deploy each optimized agent
    const results = [];
    for (const agent of this.optimizedAgents) {
      const result = await this.deployOptimizedAgent(agent);
      results.push({ agent: agent.name, ...result });
      console.log('');
    }
    
    // Summary
    console.log('📊 DEPLOYMENT SUMMARY:');
    console.log('======================');
    const successful = results.filter(r => r.success);
    const skipped = results.filter(r => !r.success && r.reason === 'already_exists');
    const failed = results.filter(r => !r.success && r.reason !== 'already_exists');
    
    console.log(`✅ Successfully deployed: ${successful.length}`);
    console.log(`⚠️ Already existed: ${skipped.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log('');
    
    if (successful.length > 0) {
      console.log('🎯 SUCCESSFULLY DEPLOYED AGENTS:');
      successful.forEach(result => {
        console.log(`  ✅ ${result.agent}`);
        console.log(`     Webhook: ${result.webhookUrl}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('❌ FAILED DEPLOYMENTS:');
      failed.forEach(result => {
        console.log(`  ❌ ${result.agent}: ${result.error}`);
      });
    }
    
    console.log('');
    console.log('🔐 NEXT STEPS:');
    console.log('==============');
    console.log('1. Ben needs to set up credentials in his n8n Cloud instance');
    console.log('2. Required credentials:');
    console.log('   - OpenAI API (for all agents)');
    console.log('   - WordPress API (for content & blog agents)');
    console.log('   - Social Media APIs (Facebook, LinkedIn, Twitter)');
    console.log('   - Podcast Platform APIs (Captivate, Spotify, Apple)');
    console.log('3. Activate agents after credential setup');
    console.log('4. Test each agent with sample data');
    
    return results;
  }
}

// Run deployment
const deployer = new BenOptimizedAgentsDeployer();
deployer.deployAllOptimizedAgents().catch(console.error);
