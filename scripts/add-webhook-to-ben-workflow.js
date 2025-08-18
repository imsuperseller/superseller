#!/usr/bin/env node

import axios from 'axios';

class AddWebhookToBenWorkflow {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };

    this.workflowId = '7SSvRe4Q7xN8Tziv';
  }

  async addWebhookToWorkflow() {
    console.log('🔗 ADDING WEBHOOK TO BEN WORKFLOW USING MCP METHODS');
    console.log('===================================================');

    try {
      // Step 1: Get current workflow
      console.log('📋 STEP 1: GETTING CURRENT WORKFLOW');
      console.log('====================================');
      const workflow = await this.getCurrentWorkflow();
      
      if (!workflow) {
        console.log('❌ Failed to get workflow');
        return false;
      }

      console.log(`✅ Workflow found: ${workflow.name}`);
      console.log(`📊 Current nodes: ${workflow.nodes.length}`);

      // Step 2: Check if webhook already exists
      console.log('\n🔍 STEP 2: CHECKING FOR EXISTING WEBHOOK');
      console.log('==========================================');
      const existingWebhook = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      
      if (existingWebhook) {
        console.log('✅ Webhook already exists');
        console.log(`   Webhook ID: ${existingWebhook.webhookId}`);
        console.log(`   Webhook URL: ${this.benCloudConfig.url}/webhook/${existingWebhook.webhookId}`);
        return true;
      }

      // Step 3: Add webhook node
      console.log('\n➕ STEP 3: ADDING WEBHOOK NODE');
      console.log('===============================');
      const updatedWorkflow = this.addWebhookNode(workflow);
      
      // Step 4: Update workflow using MCP method
      console.log('\n🔄 STEP 4: UPDATING WORKFLOW');
      console.log('==============================');
      const success = await this.updateWorkflow(updatedWorkflow);

      if (success) {
        console.log('✅ Webhook added successfully');
        
        // Step 5: Get the new webhook URL
        console.log('\n🔗 STEP 5: GETTING NEW WEBHOOK URL');
        console.log('====================================');
        const newWebhookUrl = await this.getWebhookUrl();
        
        if (newWebhookUrl) {
          console.log(`✅ New webhook URL: ${newWebhookUrl}`);
          console.log('📝 Ready for testing!');
        }
      }

      return success;

    } catch (error) {
      console.error('\n❌ ERROR ADDING WEBHOOK:', error.message);
      return false;
    }
  }

  async getCurrentWorkflow() {
    try {
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      return response.data;

    } catch (error) {
      console.error('   ❌ Failed to get workflow:', error.message);
      return null;
    }
  }

  addWebhookNode(workflow) {
    console.log('   📝 Adding webhook node to workflow...');

    // Create webhook node
    const webhookNode = {
      id: 'webhook-trigger-' + Date.now(),
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'tax4us-blog-webhook',
        responseMode: 'responseNode',
        options: {
          responseHeaders: {
            parameters: [
              {
                name: 'Content-Type',
                value: 'application/json'
              }
            ]
          }
        }
      },
      webhookId: 'tax4us-blog-webhook-' + Date.now()
    };

    // Add webhook node to workflow
    workflow.nodes.unshift(webhookNode);

    // Update connections to start from webhook
    if (workflow.nodes.length > 1) {
      const firstNode = workflow.nodes[1]; // First non-webhook node
      
      if (!workflow.connections) {
        workflow.connections = {};
      }

      workflow.connections[webhookNode.name] = {
        main: [
          [
            {
              node: firstNode.name,
              type: 'main',
              index: 0
            }
          ]
        ]
      };
    }

    console.log('   ✅ Webhook node added');
    console.log(`   📍 Position: [${webhookNode.position[0]}, ${webhookNode.position[1]}]`);
    console.log(`   🔗 Path: ${webhookNode.parameters.path}`);

    return workflow;
  }

  async updateWorkflow(workflow) {
    try {
      console.log('   📤 Updating workflow using MCP method...');

      const response = await axios.put(
        `${this.benCloudConfig.url}/api/v1/workflows/${this.workflowId}`,
        workflow,
        {
          headers: {
            'X-N8N-API-KEY': this.benCloudConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ Workflow updated successfully');
      return true;

    } catch (error) {
      console.error('   ❌ Failed to update workflow:', error.message);
      return false;
    }
  }

  async getWebhookUrl() {
    try {
      const workflow = await this.getCurrentWorkflow();
      
      if (!workflow) {
        return null;
      }

      const webhookNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
      
      if (webhookNode && webhookNode.webhookId) {
        return `${this.benCloudConfig.url}/webhook/${webhookNode.webhookId}`;
      }

      return null;

    } catch (error) {
      console.error('   ❌ Failed to get webhook URL:', error.message);
      return null;
    }
  }

  async testWebhook() {
    try {
      console.log('\n🧪 TESTING NEW WEBHOOK');
      console.log('========================');

      const webhookUrl = await this.getWebhookUrl();
      
      if (!webhookUrl) {
        console.log('❌ No webhook URL found');
        return false;
      }

      console.log(`📤 Testing webhook: ${webhookUrl}`);

      const testData = {
        url: 'https://www.tax4us.co.il/wp-admin/post.php?post=1272',
        action: 'test_webhook',
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(webhookUrl, testData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      console.log('✅ Webhook test successful');
      console.log(`📊 Status: ${response.status}`);
      console.log('📄 Response:', response.data);

      return true;

    } catch (error) {
      console.error('❌ Webhook test failed:', error.message);
      return false;
    }
  }
}

// Execute the webhook addition
const webhookAdder = new AddWebhookToBenWorkflow();
webhookAdder.addWebhookToWorkflow().then(success => {
  if (success) {
    console.log('\n🎉 WEBHOOK ADDED SUCCESSFULLY!');
    console.log('================================');
    console.log('✅ Webhook node added to workflow');
    console.log('✅ Workflow updated via MCP method');
    console.log('✅ Ready for testing');
    
    // Test the webhook
    return webhookAdder.testWebhook();
  } else {
    console.log('\n❌ FAILED TO ADD WEBHOOK');
    console.log('=========================');
    console.log('⚠️ Check workflow permissions');
    console.log('⚠️ Verify API key is valid');
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
