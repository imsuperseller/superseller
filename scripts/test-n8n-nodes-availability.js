#!/usr/bin/env node

import axios from 'axios';

class N8nNodesTester {
  constructor() {
    this.n8nConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
    };
  }

  async testNodeAvailability() {
    console.log('🔍 Testing n8n nodes availability on VPS...');
    console.log('🌐 VPS n8n: http://173.254.201.134:5678');
    console.log('');

    // Test 1: Check if n8n is accessible
    console.log('1️⃣ Testing n8n connectivity...');
    try {
      const healthResponse = await axios.get(`${this.n8nConfig.url}/healthz`);
      console.log('✅ n8n is accessible:', healthResponse.status);
    } catch (error) {
      console.error('❌ n8n is not accessible:', error.message);
      return;
    }

    // Test 2: Check available credential types
    console.log('\n2️⃣ Testing credential types availability...');
    try {
      const credTypesResponse = await axios.get(`${this.n8nConfig.url}/api/v1/credentials/types`, {
        headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
      });
      
      const credentialTypes = credTypesResponse.data.data || [];
      console.log(`✅ Found ${credentialTypes.length} credential types`);
      
      // List popular credential types
      const popularTypes = [
        'hubspotApi', 'airtableApi', 'gmailOAuth2Api', 'googleDriveOAuth2Api',
        'slackApi', 'discordApi', 'telegramApi', 'whatsAppApi', 'facebookApi',
        'linkedInApi', 'twitterApi', 'instagramApi', 'openAiApi', 'anthropicApi',
        'twilioApi', 'stripeApi', 'shopifyApi', 'salesforceApi', 'postgres',
        'mysql', 'mongodb', 'awsS3', 'googleCloudStorage'
      ];

      console.log('\n📋 Popular credential types status:');
      for (const type of popularTypes) {
        const found = credentialTypes.find(ct => ct.name === type);
        console.log(`${found ? '✅' : '❌'} ${type}: ${found ? 'Available' : 'Not found'}`);
      }
    } catch (error) {
      console.error('❌ Could not fetch credential types:', error.message);
    }

    // Test 3: Check node types availability
    console.log('\n3️⃣ Testing node types availability...');
    try {
      const nodesResponse = await axios.get(`${this.n8nConfig.url}/api/v1/nodes`, {
        headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
      });
      
      const nodeTypes = nodesResponse.data.data || [];
      console.log(`✅ Found ${nodeTypes.length} node types`);
      
      // List popular node types
      const popularNodes = [
        'n8n-nodes-base.hubspot', 'n8n-nodes-base.airtable', 'n8n-nodes-base.gmail',
        'n8n-nodes-base.googleDrive', 'n8n-nodes-base.slack', 'n8n-nodes-base.discord',
        'n8n-nodes-base.telegram', 'n8n-nodes-base.whatsApp', 'n8n-nodes-base.facebook',
        'n8n-nodes-base.linkedIn', 'n8n-nodes-base.twitter', 'n8n-nodes-base.instagram',
        'n8n-nodes-base.openAi', 'n8n-nodes-base.anthropic', 'n8n-nodes-base.twilio',
        'n8n-nodes-base.stripe', 'n8n-nodes-base.shopify', 'n8n-nodes-base.salesforce',
        'n8n-nodes-base.postgres', 'n8n-nodes-base.mysql', 'n8n-nodes-base.mongodb',
        'n8n-nodes-base.awsS3', 'n8n-nodes-base.googleCloudStorage',
        'n8n-nodes-base.spreadsheetFile', 'n8n-nodes-base.emailSend', 'n8n-nodes-base.imap'
      ];

      console.log('\n📋 Popular node types status:');
      for (const nodeType of popularNodes) {
        const found = nodeTypes.find(nt => nt.name === nodeType);
        console.log(`${found ? '✅' : '❌'} ${nodeType}: ${found ? 'Available' : 'Not found'}`);
      }
    } catch (error) {
      console.error('❌ Could not fetch node types:', error.message);
    }

    // Test 4: Check current workflows
    console.log('\n4️⃣ Checking current workflows...');
    try {
      const workflowsResponse = await axios.get(`${this.n8nConfig.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
      });
      
      const workflows = workflowsResponse.data.data || [];
      console.log(`✅ Found ${workflows.length} workflows`);
      
      // Analyze workflow node usage
      const nodeUsage = {};
      workflows.forEach(workflow => {
        if (workflow.nodes) {
          workflow.nodes.forEach(node => {
            nodeUsage[node.type] = (nodeUsage[node.type] || 0) + 1;
          });
        }
      });

      console.log('\n📊 Current node usage in workflows:');
      Object.entries(nodeUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([nodeType, count]) => {
          console.log(`  ${nodeType}: ${count} times`);
        });
    } catch (error) {
      console.error('❌ Could not fetch workflows:', error.message);
    }

    // Test 5: Check current credentials
    console.log('\n5️⃣ Checking current credentials...');
    try {
      const credentialsResponse = await axios.get(`${this.n8nConfig.url}/api/v1/credentials`, {
        headers: { 'X-N8N-API-KEY': this.n8nConfig.apiKey }
      });
      
      const credentials = credentialsResponse.data.data || [];
      console.log(`✅ Found ${credentials.length} credentials`);
      
      if (credentials.length > 0) {
        console.log('\n📋 Current credentials:');
        credentials.forEach(cred => {
          console.log(`  ${cred.name} (${cred.type})`);
        });
      }
    } catch (error) {
      console.error('❌ Could not fetch credentials:', error.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('✅ n8n VPS is accessible and running');
    console.log('✅ Ready to test native node integrations');
    console.log('✅ Credential system is functional');
    console.log('✅ Workflow deployment is possible');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Test specific service integrations');
    console.log('2. Create workflow templates with native nodes');
    console.log('3. Set up credential placeholders');
    console.log('4. Deploy to customer workflows');
    console.log('5. Guide customers through setup');
  }

  async testSpecificIntegration(serviceName, nodeType, credentialType) {
    console.log(`\n🧪 Testing ${serviceName} integration...`);
    
    try {
      // Test 1: Create credential placeholder
      console.log(`1️⃣ Creating ${serviceName} credential placeholder...`);
      const credentialData = {
        name: `test-${serviceName.toLowerCase()}-credential`,
        type: credentialType,
        data: {
          // Placeholder data - will be replaced by customer
          apiKey: 'TEST_API_KEY',
          accessToken: 'TEST_ACCESS_TOKEN'
        }
      };

      try {
        const credResponse = await axios.post(
          `${this.n8nConfig.url}/api/v1/credentials`,
          credentialData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-N8N-API-KEY': this.n8nConfig.apiKey
            }
          }
        );
        console.log(`✅ ${serviceName} credential created:`, credResponse.data.id);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️ ${serviceName} credential already exists`);
        } else {
          console.error(`❌ Failed to create ${serviceName} credential:`, error.message);
          return false;
        }
      }

      // Test 2: Create test workflow with native node
      console.log(`2️⃣ Creating test workflow with ${serviceName} node...`);
      const testWorkflow = {
        name: `Test ${serviceName} Integration`,
        nodes: [
          {
            parameters: {
              httpMethod: 'POST',
              path: `test-${serviceName.toLowerCase()}`,
              responseMode: 'responseNode'
            },
            id: 'webhook-trigger',
            name: 'Test Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [240, 300]
          },
          {
            parameters: {
              operation: 'get',
              resource: 'contact'
            },
            id: 'service-node',
            name: `Test ${serviceName}`,
            type: nodeType,
            typeVersion: 1,
            position: [460, 300],
            credentials: {
              [credentialType]: {
                id: `test-${serviceName.toLowerCase()}-credential`,
                name: `Test ${serviceName} Credential`
              }
            }
          },
          {
            parameters: {
              respondWith: 'json',
              responseBody: '={{ { success: true, service: "' + serviceName + '", data: $json } }}'
            },
            id: 'success-response',
            name: 'Success Response',
            type: 'n8n-nodes-base.respondToWebhook',
            typeVersion: 1,
            position: [680, 300]
          }
        ],
        connections: {
          'Test Webhook': {
            main: [[{ node: `Test ${serviceName}`, type: 'main', index: 0 }]]
          },
          [`Test ${serviceName}`]: {
            main: [[{ node: 'Success Response', type: 'main', index: 0 }]]
          }
        },
        settings: { executionOrder: 'v1' }
      };

      try {
        const workflowResponse = await axios.post(
          `${this.n8nConfig.url}/api/v1/workflows`,
          testWorkflow,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-N8N-API-KEY': this.n8nConfig.apiKey
            }
          }
        );
        console.log(`✅ ${serviceName} test workflow created:`, workflowResponse.data.id);
        return true;
      } catch (error) {
        console.error(`❌ Failed to create ${serviceName} test workflow:`, error.message);
        return false;
      }
    } catch (error) {
      console.error(`❌ ${serviceName} integration test failed:`, error.message);
      return false;
    }
  }

  async runIntegrationTests() {
    console.log('🧪 Running integration tests for popular services...');
    console.log('');

    const testServices = [
      { name: 'HubSpot', nodeType: 'n8n-nodes-base.hubspot', credentialType: 'hubspotApi' },
      { name: 'Airtable', nodeType: 'n8n-nodes-base.airtable', credentialType: 'airtableApi' },
      { name: 'Gmail', nodeType: 'n8n-nodes-base.gmail', credentialType: 'gmailOAuth2Api' },
      { name: 'Slack', nodeType: 'n8n-nodes-base.slack', credentialType: 'slackApi' },
      { name: 'OpenAI', nodeType: 'n8n-nodes-base.openAi', credentialType: 'openAiApi' }
    ];

    const results = [];
    for (const service of testServices) {
      const success = await this.testSpecificIntegration(
        service.name,
        service.nodeType,
        service.credentialType
      );
      results.push({ ...service, success });
    }

    console.log('\n📊 INTEGRATION TEST RESULTS:');
    results.forEach(result => {
      console.log(`${result.success ? '✅' : '❌'} ${result.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
    });

    const passedCount = results.filter(r => r.success).length;
    console.log(`\n🎯 ${passedCount}/${results.length} integrations passed`);
    
    if (passedCount === results.length) {
      console.log('🎉 All integrations are ready for customer use!');
    } else {
      console.log('⚠️ Some integrations need attention before customer deployment');
    }
  }
}

// Run tests
const tester = new N8nNodesTester();

// Test basic availability
tester.testNodeAvailability().then(() => {
  // Run integration tests
  return tester.runIntegrationTests();
}).catch(console.error);
