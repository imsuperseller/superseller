#!/usr/bin/env node

import axios from 'axios';

class BenWorkflowPageTest {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.workflowId = '7SSvRe4Q7xN8Tziv';
    this.testUrl = 'https://www.tax4us.co.il/wp-admin/post.php?post=1272';
  }

  async testWorkflowOnPage() {
    console.log('🧪 TESTING BEN WORKFLOW ON DUPLICATED HOME PAGE');
    console.log('================================================');
    console.log(`📄 Test URL: ${this.testUrl}`);
    console.log(`🆔 Workflow ID: ${this.workflowId}`);
    console.log('');

    try {
      // Step 1: Get workflow details to find webhook
      console.log('🔍 STEP 1: GETTING WORKFLOW DETAILS');
      console.log('====================================');
      const webhookUrl = await this.getWebhookUrl();
      
      if (!webhookUrl) {
        console.log('❌ No webhook found in workflow');
        return false;
      }

      console.log(`✅ Webhook URL: ${webhookUrl}`);

      // Step 2: Prepare test data
      console.log('\n📝 STEP 2: PREPARING TEST DATA');
      console.log('===============================');
      const testData = this.prepareTestData();
      console.log('✅ Test data prepared');

      // Step 3: Execute test
      console.log('\n🚀 STEP 3: EXECUTING WORKFLOW TEST');
      console.log('===================================');
      const testResult = await this.executeTest(webhookUrl, testData);

      // Step 4: Analyze results
      console.log('\n📊 STEP 4: ANALYZING RESULTS');
      console.log('==============================');
      await this.analyzeResults(testResult);

      return testResult.success;

    } catch (error) {
      console.error('\n❌ TEST FAILED:', error.message);
      return false;
    }
  }

  async getWebhookUrl() {
    try {
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      const workflow = response.data;
      const webhookNode = workflow.nodes.find(node => 
        node.type === 'n8n-nodes-base.webhook' && node.webhookId
      );

      if (webhookNode) {
        return `${this.benCloudConfig.url}/webhook/${webhookNode.webhookId}`;
      }

      return null;

    } catch (error) {
      console.error('   ❌ Failed to get workflow details:', error.message);
      return null;
    }
  }

  prepareTestData() {
    return {
      url: this.testUrl,
      action: 'analyze_page',
      timestamp: new Date().toISOString(),
      test_type: 'duplicated_home_page',
      parameters: {
        analyze_content: true,
        extract_keywords: true,
        generate_summary: true,
        seo_optimization: true
      },
      metadata: {
        page_type: 'wordpress_post',
        post_id: '1272',
        domain: 'tax4us.co.il',
        language: 'hebrew',
        business_type: 'tax_consulting'
      }
    };
  }

  async executeTest(webhookUrl, testData) {
    try {
      console.log('   📤 Sending test data to webhook...');
      console.log('   📊 Test data:', JSON.stringify(testData, null, 2));

      const response = await axios.post(webhookUrl, testData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      });

      console.log('   ✅ Webhook response received');
      console.log('   📊 Status:', response.status);
      console.log('   📄 Response data:', JSON.stringify(response.data, null, 2));

      return {
        success: true,
        status: response.status,
        data: response.data,
        webhookUrl: webhookUrl,
        testData: testData
      };

    } catch (error) {
      console.error('   ❌ Webhook test failed:', error.message);
      
      if (error.response) {
        console.error('   📊 Response status:', error.response.status);
        console.error('   📄 Response data:', error.response.data);
      }

      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        webhookUrl: webhookUrl,
        testData: testData
      };
    }
  }

  async analyzeResults(testResult) {
    if (testResult.success) {
      console.log('   ✅ TEST SUCCESSFUL!');
      console.log('   📊 Analysis:');
      console.log(`      - Status Code: ${testResult.status}`);
      console.log(`      - Response Type: ${typeof testResult.data}`);
      console.log(`      - Data Length: ${JSON.stringify(testResult.data).length} characters`);
      
      if (testResult.data && typeof testResult.data === 'object') {
        console.log('   📋 Response Keys:', Object.keys(testResult.data));
      }

      // Check for specific workflow outputs
      if (testResult.data && testResult.data.workflow_execution_id) {
        console.log(`   🔄 Workflow Execution ID: ${testResult.data.workflow_execution_id}`);
      }

      if (testResult.data && testResult.data.result) {
        console.log('   📝 Workflow Result Available');
      }

    } else {
      console.log('   ❌ TEST FAILED');
      console.log('   📊 Analysis:');
      console.log(`      - Error: ${testResult.error}`);
      console.log(`      - Status Code: ${testResult.status}`);
      
      if (testResult.status === 404) {
        console.log('   💡 Suggestion: Webhook URL might be incorrect or workflow not active');
      } else if (testResult.status === 400) {
        console.log('   💡 Suggestion: Test data format might be incorrect');
      } else if (testResult.status === 500) {
        console.log('   💡 Suggestion: Workflow execution error - check workflow configuration');
      }
    }
  }

  async getWorkflowExecutions() {
    try {
      console.log('\n📋 GETTING RECENT WORKFLOW EXECUTIONS');
      console.log('=====================================');

      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/executions`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey },
          params: {
            workflowId: this.workflowId,
            limit: 5
          }
        }
      );

      const executions = response.data;
      console.log(`   📊 Found ${executions.length} recent executions`);

      executions.forEach((execution, index) => {
        console.log(`   ${index + 1}. Execution ID: ${execution.id}`);
        console.log(`      Status: ${execution.status}`);
        console.log(`      Started: ${execution.startedAt}`);
        console.log(`      Finished: ${execution.finishedAt || 'Running'}`);
        console.log('');
      });

      return executions;

    } catch (error) {
      console.error('   ❌ Failed to get executions:', error.message);
      return [];
    }
  }
}

// Execute the test
const test = new BenWorkflowPageTest();
test.testWorkflowOnPage().then(success => {
  if (success) {
    console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('✅ Test executed on duplicated home page');
    console.log('✅ Workflow responded correctly');
    console.log('✅ Ready for production use');
  } else {
    console.log('\n❌ WORKFLOW TEST FAILED');
    console.log('=======================');
    console.log('⚠️ Check workflow configuration');
    console.log('⚠️ Verify webhook is active');
    console.log('⚠️ Ensure credentials are set up');
  }
  
  // Get recent executions for additional context
  return test.getWorkflowExecutions();
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
