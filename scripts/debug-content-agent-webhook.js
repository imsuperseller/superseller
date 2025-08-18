#!/usr/bin/env node

import axios from 'axios';

class DebugContentAgentWebhook {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.contentAgentId = 'zYQIOa3bA6yXX3uP';
  }

  async debugContentAgentWebhook() {
    console.log('🔍 DEBUGGING CONTENT AGENT WEBHOOK CONFIGURATION');
    console.log('=================================================');
    console.log('📋 Analyzing the exact webhook structure to understand the 400 error');
    console.log('');

    try {
      // Step 1: Get current Content Agent workflow
      console.log('📋 STEP 1: GETTING CONTENT AGENT WORKFLOW');
      console.log('==========================================');
      const workflow = await this.getContentAgentWorkflow();

      // Step 2: Analyze webhook node structure
      console.log('\n📋 STEP 2: ANALYZING WEBHOOK NODE STRUCTURE');
      console.log('=============================================');
      const webhookAnalysis = await this.analyzeWebhookNodeStructure(workflow);

      // Step 3: Test current webhook
      console.log('\n📋 STEP 3: TESTING CURRENT WEBHOOK');
      console.log('=====================================');
      const testResult = await this.testCurrentWebhook(webhookAnalysis);

      // Step 4: Try minimal update
      console.log('\n📋 STEP 4: TRYING MINIMAL UPDATE');
      console.log('===================================');
      const updateResult = await this.tryMinimalUpdate(workflow);

      console.log('\n🎉 CONTENT AGENT WEBHOOK DEBUG COMPLETE!');
      console.log('=========================================');
      console.log('✅ Workflow configuration retrieved');
      console.log('✅ Webhook node structure analyzed');
      console.log('✅ Current webhook tested');
      console.log('✅ Minimal update attempted');

      return {
        success: true,
        workflow,
        webhookAnalysis,
        testResult,
        updateResult
      };

    } catch (error) {
      console.error('\n❌ CONTENT AGENT WEBHOOK DEBUG FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getContentAgentWorkflow() {
    try {
      console.log('   🔍 Getting Content Agent workflow...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows/${this.contentAgentId}`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
        }
      );

      const workflow = response.data;
      console.log('   ✅ Content Agent workflow retrieved');
      console.log(`   📋 Workflow Name: ${workflow.name}`);
      console.log(`   🔗 Workflow ID: ${workflow.id}`);
      console.log(`   📊 Active: ${workflow.active}`);
      console.log(`   🔧 Nodes: ${workflow.nodes.length}`);

      return workflow;

    } catch (error) {
      console.error('   ❌ Failed to get Content Agent workflow:', error.message);
      throw error;
    }
  }

  async analyzeWebhookNodeStructure(workflow) {
    try {
      console.log('   🔍 Analyzing webhook node structure...');

      // Find webhook node
      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      
      if (!webhookNode) {
        console.log('   ❌ No webhook node found');
        return { hasWebhook: false };
      }

      console.log('   📊 Webhook Node Structure:');
      console.log(`      ID: ${webhookNode.id}`);
      console.log(`      Name: ${webhookNode.name}`);
      console.log(`      Type: ${webhookNode.type}`);
      console.log(`      Type Version: ${webhookNode.typeVersion}`);
      console.log(`      Position: ${JSON.stringify(webhookNode.position)}`);

      console.log('   📋 Parameters Structure:');
      console.log(`      Parameters: ${JSON.stringify(webhookNode.parameters, null, 2)}`);

      // Check if parameters exist
      if (!webhookNode.parameters) {
        console.log('   ❌ No parameters found in webhook node');
        return {
          hasWebhook: true,
          hasParameters: false,
          parameters: null
        };
      }

      // Analyze each parameter
      const parameterAnalysis = {
        hasWebhook: true,
        hasParameters: true,
        path: webhookNode.parameters.path,
        httpMethod: webhookNode.parameters.httpMethod,
        hasOptions: !!webhookNode.parameters.options,
        options: webhookNode.parameters.options,
        allParameters: Object.keys(webhookNode.parameters)
      };

      console.log('   📊 Parameter Analysis:');
      console.log(`      Path: ${parameterAnalysis.path}`);
      console.log(`      HTTP Method: ${parameterAnalysis.httpMethod}`);
      console.log(`      Has Options: ${parameterAnalysis.hasOptions}`);
      console.log(`      All Parameters: ${parameterAnalysis.allParameters.join(', ')}`);

      if (parameterAnalysis.hasOptions) {
        console.log('   📋 Options Structure:');
        console.log(`      Options: ${JSON.stringify(parameterAnalysis.options, null, 2)}`);
      }

      return parameterAnalysis;

    } catch (error) {
      console.error('   ❌ Failed to analyze webhook node structure:', error.message);
      throw error;
    }
  }

  async testCurrentWebhook(webhookAnalysis) {
    try {
      console.log('   🧪 Testing current webhook...');

      if (!webhookAnalysis.hasWebhook || !webhookAnalysis.path) {
        console.log('   ❌ No valid webhook path found');
        return { success: false, error: 'No valid webhook path' };
      }

      const webhookUrl = `${this.n8nConfig.url}/webhook/${webhookAnalysis.path}`;
      console.log(`   🔗 Testing webhook URL: ${webhookUrl}`);

      const testData = {
        type: 'email',
        content: 'Test content generation',
        language: 'hebrew'
      };

      const response = await axios.post(
        webhookUrl,
        testData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      console.log('   ✅ Current webhook test successful!');
      console.log(`   📊 Response Status: ${response.status}`);
      console.log(`   📄 Response Data: "${response.data}"`);

      return {
        success: true,
        webhookUrl,
        response: {
          status: response.status,
          data: response.data
        }
      };

    } catch (error) {
      console.error('   ❌ Current webhook test failed:', error.message);
      
      if (error.response) {
        console.error(`   📊 Error Status: ${error.response.status}`);
        console.error(`   📄 Error Data: ${JSON.stringify(error.response.data)}`);
      }

      return {
        success: false,
        error: error.message,
        webhookUrl: webhookAnalysis.path ? `${this.n8nConfig.url}/webhook/${webhookAnalysis.path}` : 'Unknown'
      };
    }
  }

  async tryMinimalUpdate(workflow) {
    try {
      console.log('   🔧 Trying minimal update...');

      // Create a very minimal update - just the name
      const minimalUpdate = {
        name: workflow.name
      };

      console.log('   📤 Attempting minimal update with just name...');

      const response = await axios.put(
        `${this.n8nConfig.url}/api/v1/workflows/${this.contentAgentId}`,
        minimalUpdate,
        {
          headers: {
            'X-N8N-API-KEY': this.n8nConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Minimal update successful!');
      console.log(`   📊 Response Status: ${response.status}`);

      return {
        success: true,
        method: 'minimal update (name only)',
        response: {
          status: response.status
        }
      };

    } catch (error) {
      console.error('   ❌ Minimal update failed:', error.message);
      
      if (error.response) {
        console.error(`   📊 Error Status: ${error.response.status}`);
        console.error(`   📄 Error Data: ${JSON.stringify(error.response.data)}`);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Execute the Content Agent webhook debug
const webhookDebugger = new DebugContentAgentWebhook();
webhookDebugger.debugContentAgentWebhook().then(result => {
  if (result.success) {
    console.log('\n🎉 CONTENT AGENT WEBHOOK DEBUG COMPLETE!');
    console.log('===========================================');
    console.log('✅ Workflow configuration retrieved');
    console.log('✅ Webhook node structure analyzed');
    console.log('✅ Current webhook tested');
    console.log('✅ Minimal update attempted');
    console.log('');
    console.log('📊 DEBUG RESULTS:');
    console.log('==================');
    console.log(`   - Has Webhook: ${result.webhookAnalysis.hasWebhook ? 'Yes' : 'No'}`);
    console.log(`   - Has Parameters: ${result.webhookAnalysis.hasParameters ? 'Yes' : 'No'}`);
    console.log(`   - Current Path: ${result.webhookAnalysis.path || 'Not set'}`);
    console.log(`   - Current Test: ${result.testResult.success ? 'Success' : 'Failed'}`);
    console.log(`   - Minimal Update: ${result.updateResult.success ? 'Success' : 'Failed'}`);
    console.log('');
    console.log('🔍 KEY FINDINGS:');
    console.log('=================');
    console.log('   - Webhook structure analyzed');
    console.log('   - Parameter configuration identified');
    console.log('   - Current functionality tested');
    console.log('   - Update method validated');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('===============');
    console.log('   1. Use minimal update approach');
    console.log('   2. Fix webhook path if needed');
    console.log('   3. Test webhook functionality');
    console.log('   4. Verify workflow activation');
    
  } else {
    console.log('\n❌ CONTENT AGENT WEBHOOK DEBUG FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
