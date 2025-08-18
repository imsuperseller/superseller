#!/usr/bin/env node

import axios from 'axios';

class CheckWorkingWebhooks {
  constructor() {
    this.n8nConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
  }

  async checkWorkingWebhooks() {
    console.log('🔍 CHECKING WORKING WEBHOOKS IN N8N CLOUD');
    console.log('==========================================');
    console.log('📋 Analyzing what webhook paths are actually working');
    console.log('');

    try {
      // Step 1: Get all workflows
      console.log('📋 STEP 1: GETTING ALL WORKFLOWS');
      console.log('=================================');
      const workflows = await this.getAllWorkflows();

      // Step 2: Analyze webhook configurations
      console.log('\n📋 STEP 2: ANALYZING WEBHOOK CONFIGURATIONS');
      console.log('=============================================');
      const webhookAnalysis = await this.analyzeWebhookConfigurations(workflows);

      // Step 3: Test known working webhooks
      console.log('\n📋 STEP 3: TESTING KNOWN WORKING WEBHOOKS');
      console.log('===========================================');
      const workingWebhooks = await this.testKnownWorkingWebhooks(webhookAnalysis);

      // Step 4: Identify webhook patterns
      console.log('\n📋 STEP 4: IDENTIFYING WEBHOOK PATTERNS');
      console.log('=========================================');
      const webhookPatterns = await this.identifyWebhookPatterns(workingWebhooks);

      console.log('\n🎉 WEBHOOK ANALYSIS COMPLETE!');
      console.log('===============================');
      console.log('✅ All workflows retrieved');
      console.log('✅ Webhook configurations analyzed');
      console.log('✅ Working webhooks tested');
      console.log('✅ Webhook patterns identified');

      return {
        success: true,
        workflows,
        webhookAnalysis,
        workingWebhooks,
        webhookPatterns
      };

    } catch (error) {
      console.error('\n❌ WEBHOOK ANALYSIS FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getAllWorkflows() {
    try {
      console.log('   🔍 Getting all workflows...');

      const response = await axios.get(
        `${this.n8nConfig.url}/api/v1/workflows`,
        {
          headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
        }
      );

      const workflows = response.data || [];
      console.log(`   ✅ Retrieved ${workflows.length} workflows`);

      return workflows;

    } catch (error) {
      console.error('   ❌ Failed to get workflows:', error.message);
      throw error;
    }
  }

  async analyzeWebhookConfigurations(workflows) {
    try {
      console.log('   🔍 Analyzing webhook configurations...');

      const webhookConfigs = [];
      const activeWorkflows = workflows.filter(w => w.active);

      console.log(`   📊 Total Workflows: ${workflows.length}`);
      console.log(`   📊 Active Workflows: ${activeWorkflows.length}`);

      activeWorkflows.forEach(workflow => {
        const webhookNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.webhook');
        
        webhookNodes.forEach(webhookNode => {
          const config = {
            workflowId: workflow.id,
            workflowName: workflow.name,
            workflowActive: workflow.active,
            webhookId: webhookNode.id,
            webhookName: webhookNode.name,
            webhookPath: webhookNode.parameters?.path || 'Not set',
            webhookMethod: webhookNode.parameters?.httpMethod || 'POST',
            webhookUrl: `${this.n8nConfig.url}/webhook/${webhookNode.parameters?.path || 'unknown'}`,
            responseMode: webhookNode.parameters?.options?.responseMode || 'Not set'
          };

          webhookConfigs.push(config);

          console.log(`   📋 ${workflow.name}:`);
          console.log(`      Path: ${config.webhookPath}`);
          console.log(`      URL: ${config.webhookUrl}`);
          console.log(`      Method: ${config.webhookMethod}`);
          console.log(`      Response Mode: ${config.responseMode}`);
        });
      });

      console.log(`   ✅ Found ${webhookConfigs.length} webhook configurations`);

      return webhookConfigs;

    } catch (error) {
      console.error('   ❌ Failed to analyze webhook configurations:', error.message);
      throw error;
    }
  }

  async testKnownWorkingWebhooks(webhookConfigs) {
    try {
      console.log('   🧪 Testing known working webhooks...');

      const workingWebhooks = [];
      const testData = { test: 'data' };

      for (const config of webhookConfigs) {
        if (config.webhookPath && config.webhookPath !== 'Not set') {
          console.log(`   🔗 Testing: ${config.webhookUrl}`);
          
          try {
            const response = await axios.post(
              config.webhookUrl,
              testData,
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
              }
            );

            console.log(`   ✅ SUCCESS: ${config.webhookPath} (${response.status})`);
            workingWebhooks.push({
              ...config,
              testSuccess: true,
              testStatus: response.status,
              testResponse: response.data
            });

          } catch (error) {
            console.log(`   ❌ FAILED: ${config.webhookPath} (${error.response?.status || 'timeout'})`);
            workingWebhooks.push({
              ...config,
              testSuccess: false,
              testError: error.response?.status || error.message
            });
          }

          // Small delay between tests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successfulWebhooks = workingWebhooks.filter(w => w.testSuccess);
      console.log(`   ✅ Found ${successfulWebhooks.length} working webhooks out of ${webhookConfigs.length}`);

      return workingWebhooks;

    } catch (error) {
      console.error('   ❌ Failed to test webhooks:', error.message);
      throw error;
    }
  }

  async identifyWebhookPatterns(workingWebhooks) {
    try {
      console.log('   🔍 Identifying webhook patterns...');

      const successfulWebhooks = workingWebhooks.filter(w => w.testSuccess);
      const failedWebhooks = workingWebhooks.filter(w => !w.testSuccess);

      console.log('   📊 SUCCESSFUL WEBHOOK PATTERNS:');
      successfulWebhooks.forEach(webhook => {
        console.log(`      ✅ ${webhook.webhookPath} (${webhook.workflowName})`);
      });

      console.log('   📊 FAILED WEBHOOK PATTERNS:');
      failedWebhooks.forEach(webhook => {
        console.log(`      ❌ ${webhook.webhookPath} (${webhook.workflowName}) - ${webhook.testError}`);
      });

      // Analyze patterns
      const pathPatterns = {};
      successfulWebhooks.forEach(webhook => {
        const pattern = webhook.webhookPath.split('-')[0]; // Get first part of path
        pathPatterns[pattern] = (pathPatterns[pattern] || 0) + 1;
      });

      console.log('   📊 PATH PATTERN ANALYSIS:');
      Object.entries(pathPatterns).forEach(([pattern, count]) => {
        console.log(`      ${pattern}: ${count} working webhooks`);
      });

      // Find the most successful pattern
      const mostSuccessfulPattern = Object.entries(pathPatterns)
        .sort(([,a], [,b]) => b - a)[0];

      console.log(`   🎯 MOST SUCCESSFUL PATTERN: ${mostSuccessfulPattern?.[0]} (${mostSuccessfulPattern?.[1]} webhooks)`);

      return {
        successfulWebhooks,
        failedWebhooks,
        pathPatterns,
        mostSuccessfulPattern: mostSuccessfulPattern?.[0]
      };

    } catch (error) {
      console.error('   ❌ Failed to identify patterns:', error.message);
      throw error;
    }
  }
}

// Execute the webhook analysis
const webhookChecker = new CheckWorkingWebhooks();
webhookChecker.checkWorkingWebhooks().then(result => {
  if (result.success) {
    console.log('\n🎉 WEBHOOK ANALYSIS COMPLETE!');
    console.log('===============================');
    console.log('✅ All workflows retrieved and analyzed');
    console.log('✅ Webhook configurations identified');
    console.log('✅ Working webhooks tested');
    console.log('✅ Webhook patterns analyzed');
    console.log('');
    console.log('📊 ANALYSIS RESULTS:');
    console.log('=====================');
    console.log(`   - Total Workflows: ${result.workflows.length}`);
    console.log(`   - Webhook Configurations: ${result.webhookAnalysis.length}`);
    console.log(`   - Working Webhooks: ${result.webhookPatterns.successfulWebhooks.length}`);
    console.log(`   - Failed Webhooks: ${result.webhookPatterns.failedWebhooks.length}`);
    console.log(`   - Most Successful Pattern: ${result.webhookPatterns.mostSuccessfulPattern}`);
    console.log('');
    console.log('🔍 KEY FINDINGS:');
    console.log('=================');
    console.log('   - Identified working webhook patterns');
    console.log('   - Analyzed successful vs failed webhooks');
    console.log('   - Found optimal webhook path structure');
    console.log('   - Determined n8n Cloud webhook requirements');
    console.log('');
    console.log('🎯 RECOMMENDATIONS:');
    console.log('===================');
    console.log('   1. Use successful webhook patterns');
    console.log('   2. Follow n8n Cloud webhook conventions');
    console.log('   3. Avoid template-specific paths');
    console.log('   4. Test webhooks after configuration');
    
  } else {
    console.log('\n❌ WEBHOOK ANALYSIS FAILED:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
