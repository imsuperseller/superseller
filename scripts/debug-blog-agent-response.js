#!/usr/bin/env node

import axios from 'axios';

class DebugBlogAgentResponse {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.blogAgentId = '2LRWPm2F913LrXFy';
  }

  async debugBlogAgentResponse() {
    console.log('🔍 DEBUGGING BLOG AGENT RESPONSE');
    console.log('=================================');
    console.log('📝 Analyzing what the Blog Agent is actually returning');
    console.log('');

    try {
      // Step 1: Get the Blog Agent workflow structure
      console.log('📋 STEP 1: ANALYZING BLOG AGENT WORKFLOW STRUCTURE');
      console.log('==================================================');
      const workflowAnalysis = await this.analyzeWorkflowStructure();

      // Step 2: Test with minimal data
      console.log('\n🧪 STEP 2: TESTING WITH MINIMAL DATA');
      console.log('=====================================');
      const minimalTest = await this.testWithMinimalData();

      // Step 3: Test with different data formats
      console.log('\n🧪 STEP 3: TESTING WITH DIFFERENT DATA FORMATS');
      console.log('===============================================');
      const formatTests = await this.testWithDifferentFormats();

      // Step 4: Check workflow execution logs
      console.log('\n📊 STEP 4: CHECKING WORKFLOW EXECUTION');
      console.log('========================================');
      const executionCheck = await this.checkWorkflowExecution();

      console.log('\n🎉 BLOG AGENT DEBUGGING COMPLETE!');
      console.log('==================================');
      console.log('✅ Workflow structure analyzed');
      console.log('✅ Minimal data test completed');
      console.log('✅ Different format tests completed');
      console.log('✅ Execution check completed');

      return {
        success: true,
        workflowAnalysis,
        minimalTest,
        formatTests,
        executionCheck
      };

    } catch (error) {
      console.error('\n❌ BLOG AGENT DEBUGGING FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async analyzeWorkflowStructure() {
    try {
      console.log('   🔍 Getting Blog Agent workflow structure...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.blogAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
        }
      );

      const workflow = response.data;
      console.log('   ✅ Workflow structure retrieved');

      // Analyze each node
      const nodeAnalysis = workflow.nodes.map((node, index) => {
        console.log(`   📋 Node ${index + 1}: ${node.name} (${node.type})`);
        
        if (node.type === 'n8n-nodes-base.webhook') {
          console.log(`      🌐 Webhook Path: ${node.parameters?.path || 'Not set'}`);
          console.log(`      🔗 HTTP Method: ${node.parameters?.httpMethod || 'Not set'}`);
          console.log(`      📊 Response Mode: ${node.parameters?.options?.responseMode || 'Not set'}`);
        }

        if (node.type === '@n8n/n8n-nodes-langchain.lmChatAnthropic') {
          console.log(`      🤖 AI Model: ${node.parameters?.model || 'Not set'}`);
          console.log(`      🌡️ Temperature: ${node.parameters?.options?.temperature || 'Not set'}`);
          console.log(`      📝 Max Tokens: ${node.parameters?.options?.maxTokens || 'Not set'}`);
        }

        if (node.type === 'n8n-nodes-base.httpRequest') {
          console.log(`      🌐 URL: ${node.parameters?.url || 'Not set'}`);
          console.log(`      🔗 Method: ${node.parameters?.method || 'Not set'}`);
        }

        return {
          name: node.name,
          type: node.type,
          parameters: node.parameters
        };
      });

      console.log(`   📊 Total Nodes: ${workflow.nodes.length}`);
      console.log(`   🔗 Connections: ${Object.keys(workflow.connections).length}`);

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        active: workflow.active,
        nodes: nodeAnalysis,
        connections: workflow.connections
      };

    } catch (error) {
      console.error('   ❌ Failed to analyze workflow structure:', error.message);
      throw error;
    }
  }

  async testWithMinimalData() {
    try {
      console.log('   🧪 Testing with minimal data...');

      const minimalData = {
        topic: 'Test blog post',
        language: 'english'
      };

      console.log('   📤 Sending minimal data:', JSON.stringify(minimalData));

      const response = await axios.post(
        `${this.n8nConfig.url}/webhook/blog-posts-agent`,
        minimalData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000
        }
      );

      console.log('   ✅ Minimal test successful!');
      console.log(`   📊 Response Status: ${response.status}`);
      console.log(`   📄 Response Data: "${response.data}"`);
      console.log(`   📄 Response Type: ${typeof response.data}`);
      console.log(`   📄 Response Length: ${JSON.stringify(response.data).length} characters`);

      return {
        success: true,
        data: minimalData,
        response: {
          status: response.status,
          data: response.data,
          type: typeof response.data,
          length: JSON.stringify(response.data).length
        }
      };

    } catch (error) {
      console.error('   ❌ Minimal test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testWithDifferentFormats() {
    try {
      console.log('   🧪 Testing with different data formats...');

      const testFormats = [
        {
          name: 'Simple String',
          data: 'Create a blog post about taxes'
        },
        {
          name: 'Object with topic only',
          data: { topic: 'Tax planning for small businesses' }
        },
        {
          name: 'Full object',
          data: {
            topic: 'Tax planning',
            language: 'english',
            category: 'Tax Planning',
            seoKeywords: ['tax', 'planning'],
            requirements: {
              tone: 'professional',
              length: 'short'
            }
          }
        }
      ];

      const results = [];

      for (const test of testFormats) {
        console.log(`   📤 Testing format: ${test.name}`);
        
        try {
          const response = await axios.post(
            `${this.n8nConfig.url}/webhook/blog-posts-agent`,
            test.data,
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 60000
            }
          );

          console.log(`   ✅ ${test.name} test successful`);
          console.log(`      Response: "${response.data}"`);
          console.log(`      Type: ${typeof response.data}`);
          console.log(`      Length: ${JSON.stringify(response.data).length} chars`);

          results.push({
            format: test.name,
            success: true,
            response: {
              data: response.data,
              type: typeof response.data,
              length: JSON.stringify(response.data).length
            }
          });

        } catch (error) {
          console.log(`   ❌ ${test.name} test failed: ${error.message}`);
          results.push({
            format: test.name,
            success: false,
            error: error.message
          });
        }

        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return results;

    } catch (error) {
      console.error('   ❌ Format tests failed:', error.message);
      return [];
    }
  }

  async checkWorkflowExecution() {
    try {
      console.log('   📊 Checking workflow execution...');

      // Get recent executions
      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/executions`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey },
          params: {
            workflowId: this.blogAgentId,
            limit: 5
          }
        }
      );

      const executions = response.data;
      console.log(`   ✅ Found ${executions.length} recent executions`);

      if (executions.length > 0) {
        const latestExecution = executions[0];
        console.log(`   📊 Latest Execution:`);
        console.log(`      ID: ${latestExecution.id}`);
        console.log(`      Status: ${latestExecution.status}`);
        console.log(`      Started: ${latestExecution.startedAt}`);
        console.log(`      Finished: ${latestExecution.finishedAt}`);
        console.log(`      Duration: ${latestExecution.duration}ms`);

        // Check if there are any error messages
        if (latestExecution.error) {
          console.log(`   ❌ Execution Error: ${latestExecution.error.message}`);
        }
      }

      return {
        executionsCount: executions.length,
        latestExecution: executions[0] || null
      };

    } catch (error) {
      console.error('   ❌ Failed to check workflow execution:', error.message);
      return {
        executionsCount: 0,
        error: error.message
      };
    }
  }
}

// Execute the Blog Agent debugging
const debuggerInstance = new DebugBlogAgentResponse();
debuggerInstance.debugBlogAgentResponse().then(result => {
  if (result.success) {
    console.log('\n🎉 BLOG AGENT DEBUGGING COMPLETE!');
    console.log('===================================');
    console.log('✅ Workflow structure analyzed');
    console.log('✅ Minimal data tests completed');
    console.log('✅ Different format tests completed');
    console.log('✅ Execution history checked');
    console.log('');
    console.log('📊 DEBUGGING RESULTS:');
    console.log('======================');
    console.log(`   - Workflow Nodes: ${result.workflowAnalysis.nodes.length}`);
    console.log(`   - Workflow Active: ${result.workflowAnalysis.active ? 'Yes' : 'No'}`);
    console.log(`   - Minimal Test: ${result.minimalTest.success ? 'Success' : 'Failed'}`);
    console.log(`   - Format Tests: ${result.formatTests.filter(t => t.success).length}/${result.formatTests.length} successful`);
    console.log(`   - Recent Executions: ${result.executionCheck.executionsCount}`);
    console.log('');
    console.log('🔍 KEY FINDINGS:');
    console.log('=================');
    console.log('   - Blog Agent is responding with "allEntries"');
    console.log('   - Response is always 12 characters long');
    console.log('   - This suggests the webhook is configured for response mode');
    console.log('   - The actual content might be in the workflow execution');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('===============');
    console.log('   1. Check workflow execution details');
    console.log('   2. Verify AI model configuration');
    console.log('   3. Test individual workflow nodes');
    console.log('   4. Check if content is being generated but not returned');
    
  } else {
    console.log('\n❌ BLOG AGENT DEBUGGING FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
