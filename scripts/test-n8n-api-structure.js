#!/usr/bin/env node

import axios from 'axios';

class N8nApiStructureTester {
  constructor() {
    this.benConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
  }

  async discoverApiEndpoints() {
    console.log('🔍 Discovering n8n Cloud API structure...');
    console.log('🌐 Testing: https://tax4usllc.app.n8n.cloud');
    console.log('');

    const endpoints = [
      '/api/v1/credentials',
      '/api/v1/credentials/types',
      '/api/v1/workflows',
      '/api/v1/nodes',
      '/api/v1/executions',
      '/api/v1/active',
      '/api/v1/healthz',
      '/api/v1/version',
      '/api/v1/me',
      '/api/v1/owner',
      '/api/v1/credentials/',
      '/api/v1/workflows/',
      '/api/v1/nodes/',
      '/api/v1/executions/',
      '/api/v1/active/',
      '/api/v1/healthz/',
      '/api/v1/version/',
      '/api/v1/me/',
      '/api/v1/owner/'
    ];

    console.log('📋 Testing API endpoints...');
    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.benConfig.url}${endpoint}`, {
          headers: { 'X-N8N-API-KEY': this.benConfig.apiKey },
          timeout: 5000
        });
        results.push({
          endpoint,
          status: response.status,
          method: 'GET',
          success: true,
          dataType: typeof response.data,
          hasData: !!response.data
        });
        console.log(`✅ ${endpoint}: ${response.status} (${response.data ? 'Has data' : 'No data'})`);
      } catch (error) {
        const status = error.response?.status || 'TIMEOUT';
        const method = error.response?.config?.method || 'GET';
        results.push({
          endpoint,
          status,
          method,
          success: false,
          error: error.message
        });
        console.log(`❌ ${endpoint}: ${status} (${error.message})`);
      }
    }

    console.log('\n📊 API ENDPOINT ANALYSIS:');
    const workingEndpoints = results.filter(r => r.success);
    const failingEndpoints = results.filter(r => !r.success);

    console.log(`✅ Working endpoints: ${workingEndpoints.length}`);
    console.log(`❌ Failing endpoints: ${failingEndpoints.length}`);

    if (workingEndpoints.length > 0) {
      console.log('\n✅ WORKING ENDPOINTS:');
      workingEndpoints.forEach(result => {
        console.log(`  ${result.endpoint}: ${result.status} (${result.hasData ? 'Has data' : 'No data'})`);
      });
    }

    if (failingEndpoints.length > 0) {
      console.log('\n❌ FAILING ENDPOINTS:');
      failingEndpoints.forEach(result => {
        console.log(`  ${result.endpoint}: ${result.status} (${result.error})`);
      });
    }

    // Test POST methods for credentials
    console.log('\n🧪 Testing POST methods for credentials...');
    const testCredential = {
      name: 'test-credential-discovery',
      type: 'genericApi',
      data: {
        apiKey: 'test-key',
        apiUrl: 'https://test.com'
      }
    };

    try {
      const postResponse = await axios.post(`${this.benConfig.url}/api/v1/credentials`, testCredential, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.benConfig.apiKey
        }
      });
      console.log(`✅ POST /api/v1/credentials: ${postResponse.status}`);
      
      // Clean up test credential
      if (postResponse.data?.id) {
        try {
          await axios.delete(`${this.benConfig.url}/api/v1/credentials/${postResponse.data.id}`, {
            headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
          });
          console.log('🧹 Cleaned up test credential');
        } catch (cleanupError) {
          console.log('⚠️ Could not clean up test credential');
        }
      }
    } catch (error) {
      console.log(`❌ POST /api/v1/credentials: ${error.response?.status || 'TIMEOUT'} (${error.message})`);
    }

    return results;
  }

  async testWorkflowOperations() {
    console.log('\n🧪 Testing workflow operations...');
    
    // Test getting workflows
    try {
      const workflowsResponse = await axios.get(`${this.benConfig.url}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const workflows = workflowsResponse.data.data || workflowsResponse.data || [];
      console.log(`✅ Found ${workflows.length} workflows`);
      
      if (workflows.length > 0) {
        const firstWorkflow = workflows[0];
        console.log(`📋 First workflow: ${firstWorkflow.name} (ID: ${firstWorkflow.id})`);
        
        // Test getting specific workflow
        try {
          const singleWorkflowResponse = await axios.get(`${this.benConfig.url}/api/v1/workflows/${firstWorkflow.id}`, {
            headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
          });
          console.log(`✅ GET /api/v1/workflows/${firstWorkflow.id}: ${singleWorkflowResponse.status}`);
        } catch (error) {
          console.log(`❌ GET /api/v1/workflows/${firstWorkflow.id}: ${error.response?.status || 'TIMEOUT'}`);
        }
      }
    } catch (error) {
      console.log(`❌ GET /api/v1/workflows: ${error.response?.status || 'TIMEOUT'}`);
    }
  }

  async testCredentialOperations() {
    console.log('\n🧪 Testing credential operations...');
    
    // Test getting credentials
    try {
      const credentialsResponse = await axios.get(`${this.benConfig.url}/api/v1/credentials`, {
        headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
      });
      
      const credentials = credentialsResponse.data.data || credentialsResponse.data || [];
      console.log(`✅ Found ${credentials.length} credentials`);
      
      if (credentials.length > 0) {
        const firstCredential = credentials[0];
        console.log(`📋 First credential: ${firstCredential.name} (Type: ${firstCredential.type})`);
        
        // Test getting specific credential
        try {
          const singleCredentialResponse = await axios.get(`${this.benConfig.url}/api/v1/credentials/${firstCredential.id}`, {
            headers: { 'X-N8N-API-KEY': this.benConfig.apiKey }
          });
          console.log(`✅ GET /api/v1/credentials/${firstCredential.id}: ${singleCredentialResponse.status}`);
        } catch (error) {
          console.log(`❌ GET /api/v1/credentials/${firstCredential.id}: ${error.response?.status || 'TIMEOUT'}`);
        }
      }
    } catch (error) {
      console.log(`❌ GET /api/v1/credentials: ${error.response?.status || 'TIMEOUT'}`);
    }
  }
}

// Run discovery
const tester = new N8nApiStructureTester();

tester.discoverApiEndpoints().then(() => {
  return tester.testWorkflowOperations();
}).then(() => {
  return tester.testCredentialOperations();
}).catch(console.error);
