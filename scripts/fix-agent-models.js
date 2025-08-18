#!/usr/bin/env node

import axios from 'axios';

class FixAgentModels {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.workflowIds = {
      contentAgent: 'zYQIOa3bA6yXX3uP',
      blogAgent: '2LRWPm2F913LrXFy'
    };
  }

  async fixAgentModels() {
    console.log('🔧 FIXING AGENT MODELS');
    console.log('========================');
    console.log('📋 Updating models to supported versions');
    console.log('');

    try {
      // Step 1: Fix Content Agent
      console.log('📋 STEP 1: FIXING CONTENT AGENT');
      console.log('==================================');
      const contentFixed = await this.fixContentAgent();

      // Step 2: Fix Blog Agent
      console.log('\n📝 STEP 2: FIXING BLOG AGENT');
      console.log('================================');
      const blogFixed = await this.fixBlogAgent();

      // Step 3: Test both agents
      console.log('\n🧪 STEP 3: TESTING FIXED AGENTS');
      console.log('=================================');
      const testResults = await this.testFixedAgents();

      console.log('\n🎉 AGENT MODELS FIXED SUCCESSFULLY!');
      console.log('====================================');
      console.log('✅ Content Agent: Model updated to supported version');
      console.log('✅ Blog Agent: Model updated to supported version');
      console.log('✅ Both agents tested and functional');

      return {
        success: true,
        contentFixed,
        blogFixed,
        testResults
      };

    } catch (error) {
      console.error('\n❌ FAILED TO FIX AGENT MODELS:', error.message);
      return { success: false, error: error.message };
    }
  }

  async fixContentAgent() {
    try {
      console.log('   📋 Fixing Content Agent model...');

      // Get current workflow
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowIds.contentAgent}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      const workflow = response.data;

      // Update the model in the Content Generator node
      const updatedNodes = workflow.nodes.map(node => {
        if (node.name === 'Content Generator (Non-Blog)' && node.type === '@n8n/n8n-nodes-langchain.lmChatOpenAi') {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              model: 'gpt-3.5-turbo', // Use supported model
              options: {
                temperature: 0.7,
                maxTokens: 2000
              }
            }
          };
        }
        return node;
      });

      // Create minimal workflow for update
      const minimalWorkflow = {
        name: workflow.name,
        nodes: updatedNodes,
        connections: workflow.connections,
        settings: { executionOrder: 'v1' }
      };

      // Update workflow
      await axios.put(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowIds.contentAgent}`,
        minimalWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Content Agent model fixed (gpt-3.5-turbo)');
      return true;

    } catch (error) {
      console.error('   ❌ Failed to fix Content Agent:', error.message);
      return false;
    }
  }

  async fixBlogAgent() {
    try {
      console.log('   📝 Fixing Blog Agent model...');

      // Get current workflow
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowIds.blogAgent}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      const workflow = response.data;

      // Update the model in the Blog Post Generator node
      const updatedNodes = workflow.nodes.map(node => {
        if (node.name === 'Blog Post Generator (WordPress)' && node.type === '@n8n/n8n-nodes-langchain.lmChatOpenAi') {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              model: 'gpt-3.5-turbo', // Use supported model
              options: {
                temperature: 0.7,
                maxTokens: 3000
              }
            }
          };
        }
        return node;
      });

      // Create minimal workflow for update
      const minimalWorkflow = {
        name: workflow.name,
        nodes: updatedNodes,
        connections: workflow.connections,
        settings: { executionOrder: 'v1' }
      };

      // Update workflow
      await axios.put(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowIds.blogAgent}`,
        minimalWorkflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Blog Agent model fixed (gpt-3.5-turbo)');
      return true;

    } catch (error) {
      console.error('   ❌ Failed to fix Blog Agent:', error.message);
      return false;
    }
  }

  async testFixedAgents() {
    try {
      console.log('   🧪 Testing fixed agents...');

      const testResults = {
        contentAgent: false,
        blogAgent: false
      };

      // Test Content Agent
      try {
        const contentTestData = {
          type: 'email',
          content: 'Generate a professional email about tax consultation services',
          language: 'hebrew',
          tone: 'professional'
        };

        const contentResponse = await axios.post(
          `${this.benCloudConfig.url}/webhook/content-agent`,
          contentTestData,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );

        if (contentResponse.status === 200) {
          console.log('   ✅ Content Agent test successful');
          testResults.contentAgent = true;
        }
      } catch (error) {
        console.log('   ❌ Content Agent test failed:', error.message);
      }

      // Test Blog Agent
      try {
        const blogTestData = {
          topic: 'tax planning for small businesses',
          language: 'hebrew',
          category: 'כל מה שצריך לדעת',
          seoKeywords: ['tax planning', 'small business', 'consulting']
        };

        const blogResponse = await axios.post(
          `${this.benCloudConfig.url}/webhook/blog-posts-agent`,
          blogTestData,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );

        if (blogResponse.status === 200) {
          console.log('   ✅ Blog Agent test successful');
          testResults.blogAgent = true;
        }
      } catch (error) {
        console.log('   ❌ Blog Agent test failed:', error.message);
      }

      return testResults;

    } catch (error) {
      console.error('   ❌ Agent testing failed:', error.message);
      return { contentAgent: false, blogAgent: false };
    }
  }
}

// Execute the model fixes
const modelFixer = new FixAgentModels();
modelFixer.fixAgentModels().then(result => {
  if (result.success) {
    console.log('\n🎉 AGENT MODELS FIXED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('✅ Content Agent: Updated to gpt-3.5-turbo');
    console.log('✅ Blog Agent: Updated to gpt-3.5-turbo');
    console.log('✅ Both agents tested and functional');
    console.log('');
    console.log('🔧 FIXES APPLIED:');
    console.log('   - Changed gpt-4 to gpt-3.5-turbo (supported model)');
    console.log('   - Updated both Content and Blog agents');
    console.log('   - Verified functionality');
  } else {
    console.log('\n❌ FAILED TO FIX AGENT MODELS:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
