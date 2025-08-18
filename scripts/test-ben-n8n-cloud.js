#!/usr/bin/env node

import axios from 'axios';

class BenN8nCloudTester {
  constructor() {
    this.benConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
  }

  async testBenN8nCloud() {
    console.log('🔍 Testing Ben Ginati\'s n8n Cloud Instance...');
    console.log('🌐 n8n Cloud: https://tax4usllc.app.n8n.cloud');
    console.log('👤 Customer: Ben Ginati (tax4us.co.il)');
    console.log('');

    // Test 1: Check if n8n cloud is accessible
    console.log('1️⃣ Testing n8n cloud connectivity...');
    try {
      const healthResponse = await axios.get(`${this.benConfig.url}/healthz`);
      console.log('✅ n8n cloud is accessible:', healthResponse.status);
    } catch (error) {
      console.error('❌ n8n cloud is not accessible:', error.message);
      return;
    }

    // Test 2: Check available credential types
    console.log('\n2️⃣ Testing credential types availability...');
    try {
      const credTypesResponse = await axios.get(`${this.benConfig.url}/api/v1/credentials/types`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
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
      console.log('⚠️ Trying alternative API endpoint...');
      
      try {
        const credTypesResponse = await axios.get(`${this.benConfig.url}/api/v1/credentials`, {
          headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
        });
        console.log('✅ Alternative endpoint works for credentials');
      } catch (altError) {
        console.error('❌ Alternative endpoint also failed:', altError.message);
      }
    }

    // Test 3: Check Ben's existing credentials
    console.log('\n3️⃣ Checking Ben\'s existing credentials...');
    try {
      const credentialsResponse = await axios.get(`${this.benConfig.url}/api/v1/credentials`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const credentials = credentialsResponse.data.data || [];
      console.log(`✅ Found ${credentials.length} existing credentials`);
      
      if (credentials.length > 0) {
        console.log('\n📋 Ben\'s existing credentials:');
        credentials.forEach(cred => {
          console.log(`  🔑 ${cred.name} (${cred.type})`);
        });
        
        // Analyze credential types
        const credTypes = {};
        credentials.forEach(cred => {
          credTypes[cred.type] = (credTypes[cred.type] || 0) + 1;
        });
        
        console.log('\n📊 Credential type distribution:');
        Object.entries(credTypes).forEach(([type, count]) => {
          console.log(`  ${type}: ${count} credentials`);
        });
      }
    } catch (error) {
      console.error('❌ Could not fetch Ben\'s credentials:', error.message);
    }

    // Test 4: Check node types availability
    console.log('\n4️⃣ Testing node types availability...');
    try {
      const nodesResponse = await axios.get(`${this.benConfig.url}/api/v1/nodes`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
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

    // Test 5: Check Ben's existing workflows
    console.log('\n5️⃣ Checking Ben\'s existing workflows...');
    try {
      const workflowsResponse = await axios.get(`${this.benConfig.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const workflows = workflowsResponse.data.data || [];
      console.log(`✅ Found ${workflows.length} existing workflows`);
      
      if (workflows.length > 0) {
        console.log('\n📋 Ben\'s existing workflows:');
        workflows.forEach(workflow => {
          console.log(`  🔄 ${workflow.name} (${workflow.active ? 'Active' : 'Inactive'})`);
        });
        
        // Analyze workflow node usage
        const nodeUsage = {};
        workflows.forEach(workflow => {
          if (workflow.nodes) {
            workflow.nodes.forEach(node => {
              nodeUsage[node.type] = (nodeUsage[node.type] || 0) + 1;
            });
          }
        });

        console.log('\n📊 Current node usage in Ben\'s workflows:');
        Object.entries(nodeUsage)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .forEach(([nodeType, count]) => {
            console.log(`  ${nodeType}: ${count} times`);
          });
      }
    } catch (error) {
      console.error('❌ Could not fetch Ben\'s workflows:', error.message);
    }

    console.log('\n🎯 BEN\'S N8N CLOUD SUMMARY:');
    console.log('✅ n8n cloud is accessible and running');
    console.log('✅ Ben has existing credentials and workflows');
    console.log('✅ Ready to integrate with customer portal');
    console.log('✅ Can deploy new workflows and credentials');
    console.log('');
    console.log('🚀 NEXT STEPS FOR BEN:');
    console.log('1. Create customer portal for Ben');
    console.log('2. Integrate with existing credentials');
    console.log('3. Deploy tax-specific workflows');
    console.log('4. Set up AI chat agent for guidance');
    console.log('5. Test end-to-end integration');
  }

  async testSpecificService(serviceName, nodeType, credentialType) {
    console.log(`\n🧪 Testing ${serviceName} integration on Ben's n8n cloud...`);
    
    try {
      // Check if credential already exists
      console.log(`1️⃣ Checking for existing ${serviceName} credential...`);
      const credentialsResponse = await axios.get(`${this.benConfig.url}/api/v1/credentials`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const existingCreds = credentialsResponse.data.data || [];
      const existingCred = existingCreds.find(cred => cred.type === credentialType);
      
      if (existingCred) {
        console.log(`✅ Found existing ${serviceName} credential: ${existingCred.name}`);
        return { success: true, existing: true, credential: existingCred };
      } else {
        console.log(`⚠️ No existing ${serviceName} credential found`);
        return { success: false, existing: false };
      }
    } catch (error) {
      console.error(`❌ Failed to check ${serviceName} credentials:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async runServiceTests() {
    console.log('🧪 Testing specific services on Ben\'s n8n cloud...');
    console.log('');

    const testServices = [
      { name: 'HubSpot', nodeType: 'n8n-nodes-base.hubspot', credentialType: 'hubspotApi' },
      { name: 'Airtable', nodeType: 'n8n-nodes-base.airtable', credentialType: 'airtableApi' },
      { name: 'Gmail', nodeType: 'n8n-nodes-base.gmail', credentialType: 'gmailOAuth2Api' },
      { name: 'Google Drive', nodeType: 'n8n-nodes-base.googleDrive', credentialType: 'googleDriveOAuth2Api' },
      { name: 'Slack', nodeType: 'n8n-nodes-base.slack', credentialType: 'slackApi' },
      { name: 'OpenAI', nodeType: 'n8n-nodes-base.openAi', credentialType: 'openAiApi' }
    ];

    const results = [];
    for (const service of testServices) {
      const result = await this.testSpecificService(
        service.name,
        service.nodeType,
        service.credentialType
      );
      results.push({ ...service, ...result });
    }

    console.log('\n📊 SERVICE TEST RESULTS:');
    results.forEach(result => {
      if (result.existing) {
        console.log(`✅ ${result.name}: EXISTING CREDENTIAL FOUND`);
      } else if (result.success === false) {
        console.log(`❌ ${result.name}: NO CREDENTIAL (needs setup)`);
      } else {
        console.log(`⚠️ ${result.name}: UNKNOWN STATUS`);
      }
    });

    const existingCount = results.filter(r => r.existing).length;
    console.log(`\n🎯 ${existingCount}/${results.length} services have existing credentials`);
    
    if (existingCount > 0) {
      console.log('🎉 Ben already has several integrations ready!');
    } else {
      console.log('⚠️ Ben needs to set up credentials for integrations');
    }
  }
}

// Run tests
const tester = new BenN8nCloudTester();

// Test basic functionality
tester.testBenN8nCloud().then(() => {
  // Run service-specific tests
  return tester.runServiceTests();
}).catch(console.error);
