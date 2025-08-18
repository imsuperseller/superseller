#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class ComprehensiveN8NTesting {
  constructor() {
    // VPS Configuration
    this.vpsConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
        'Content-Type': 'application/json'
      }
    };

    // Cloud Configuration
    this.cloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoRrilg8',
      headers: {
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoRrilg8',
        'Content-Type': 'application/json'
      }
    };

    // MCP Server Configuration
    this.mcpConfig = {
      url: 'http://173.254.201.134:5678/webhook/proper-mcp-webhook'
    };

    this.testResults = {
      vps: {},
      cloud: {},
      mcp: {},
      summary: {}
    };
  }

  async testEndpoint(url, method = 'GET', data = null, headers = {}) {
    try {
      const config = {
        method,
        url,
        headers,
        timeout: 10000
      };
      
      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: `${method} ${url} - Success (${response.status})`
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 'NETWORK_ERROR',
        error: error.message,
        message: `${method} ${url} - Failed (${error.response?.status || 'NETWORK_ERROR'})`
      };
    }
  }

  async testVPSInstance() {
    console.log('\n🏢 TESTING VPS INSTANCE (Full API Access)');
    console.log('==========================================');

    const vpsTests = [
      // Health Check
      { name: 'Health Check', url: `${this.vpsConfig.url}/healthz`, method: 'GET' },
      
      // Workflow Management
      { name: 'List Workflows', url: `${this.vpsConfig.url}/api/v1/workflows`, method: 'GET', headers: this.vpsConfig.headers },
      { name: 'Get Nodes', url: `${this.vpsConfig.url}/api/v1/nodes`, method: 'GET', headers: this.vpsConfig.headers },
      
      // Credential Management
      { name: 'List Credentials', url: `${this.vpsConfig.url}/api/v1/credentials`, method: 'GET', headers: this.vpsConfig.headers },
      { name: 'Create Test Credential', url: `${this.vpsConfig.url}/api/v1/credentials`, method: 'POST', headers: this.vpsConfig.headers, data: {
        name: 'test-credential-vps',
        type: 'genericApi',
        data: { apiKey: 'test-key', endpoint: 'https://test.com' }
      }},
      
      // Execution Management
      { name: 'List Executions', url: `${this.vpsConfig.url}/api/v1/executions`, method: 'GET', headers: this.vpsConfig.headers }
    ];

    for (const test of vpsTests) {
      console.log(`\n🔍 Testing: ${test.name}`);
      const result = await this.testEndpoint(test.url, test.method, test.data, test.headers);
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
        this.testResults.vps[test.name] = result;
      } else {
        console.log(`❌ ${result.message}`);
        this.testResults.vps[test.name] = result;
      }
    }

    // Test workflow activation if we have workflows
    const workflowsResult = this.testResults.vps['List Workflows'];
    if (workflowsResult?.success && workflowsResult.data?.data?.length > 0) {
      const firstWorkflow = workflowsResult.data.data[0];
      console.log(`\n🔍 Testing: Activate Workflow (${firstWorkflow.name})`);
      const activationResult = await this.testEndpoint(
        `${this.vpsConfig.url}/api/v1/workflows/${firstWorkflow.id}/activate`,
        'POST',
        {},
        this.vpsConfig.headers
      );
      
      if (activationResult.success) {
        console.log(`✅ Workflow activation: ${activationResult.message}`);
        this.testResults.vps['Activate Workflow'] = activationResult;
      } else {
        console.log(`❌ Workflow activation: ${activationResult.message}`);
        this.testResults.vps['Activate Workflow'] = activationResult;
      }
    }
  }

  async testCloudInstance() {
    console.log('\n☁️ TESTING CLOUD INSTANCE (Limited API Access)');
    console.log('===============================================');

    const cloudTests = [
      // Workflow Management (should work)
      { name: 'List Workflows', url: `${this.cloudConfig.url}/api/v1/workflows`, method: 'GET', headers: this.cloudConfig.headers },
      { name: 'List Executions', url: `${this.cloudConfig.url}/api/v1/executions`, method: 'GET', headers: this.cloudConfig.headers },
      
      // Credential Management (should fail)
      { name: 'List Credentials (Expected 405)', url: `${this.cloudConfig.url}/api/v1/credentials`, method: 'GET', headers: this.cloudConfig.headers },
      { name: 'Create Credential (Expected 405)', url: `${this.cloudConfig.url}/api/v1/credentials`, method: 'POST', headers: this.cloudConfig.headers, data: {
        name: 'test-credential-cloud',
        type: 'genericApi',
        data: { apiKey: 'test-key', endpoint: 'https://test.com' }
      }},
      
      // Node Discovery (should fail)
      { name: 'Get Nodes (Expected 404)', url: `${this.cloudConfig.url}/api/v1/nodes`, method: 'GET', headers: this.cloudConfig.headers },
      { name: 'Health Check (Expected 404)', url: `${this.cloudConfig.url}/healthz`, method: 'GET', headers: this.cloudConfig.headers }
    ];

    for (const test of cloudTests) {
      console.log(`\n🔍 Testing: ${test.name}`);
      const result = await this.testEndpoint(test.url, test.method, test.data, test.headers);
      
      // For expected failures, we mark them as "expected"
      const isExpectedFailure = test.name.includes('Expected');
      const expectedStatus = test.name.match(/Expected (\d+)/)?.[1];
      
      if (result.success && !isExpectedFailure) {
        console.log(`✅ ${result.message}`);
        this.testResults.cloud[test.name] = { ...result, expected: false };
      } else if (!result.success && isExpectedFailure && result.status == expectedStatus) {
        console.log(`✅ ${result.message} (Expected failure)`);
        this.testResults.cloud[test.name] = { ...result, expected: true };
      } else if (!result.success && !isExpectedFailure) {
        console.log(`❌ ${result.message}`);
        this.testResults.cloud[test.name] = { ...result, expected: false };
      } else {
        console.log(`⚠️ ${result.message} (Unexpected result)`);
        this.testResults.cloud[test.name] = { ...result, expected: false };
      }
    }

    // Test workflow activation if we have workflows
    const workflowsResult = this.testResults.cloud['List Workflows'];
    if (workflowsResult?.success && workflowsResult.data?.data?.length > 0) {
      const firstWorkflow = workflowsResult.data.data[0];
      console.log(`\n🔍 Testing: Activate Cloud Workflow (${firstWorkflow.name})`);
      const activationResult = await this.testEndpoint(
        `${this.cloudConfig.url}/api/v1/workflows/${firstWorkflow.id}/activate`,
        'POST',
        {},
        this.cloudConfig.headers
      );
      
      if (activationResult.success) {
        console.log(`✅ Cloud workflow activation: ${activationResult.message}`);
        this.testResults.cloud['Activate Workflow'] = activationResult;
      } else {
        console.log(`❌ Cloud workflow activation: ${activationResult.message}`);
        this.testResults.cloud['Activate Workflow'] = activationResult;
      }
    }
  }

  async testMCPServer() {
    console.log('\n🤖 TESTING MCP SERVER');
    console.log('====================');

    const mcpTests = [
      {
        name: 'List Workflows via MCP',
        data: {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: 'list_workflows', arguments: {} }
        }
      },
      {
        name: 'Get Workflow via MCP',
        data: {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: 'get_workflow', arguments: { workflowId: 'test-id' } }
        }
      },
      {
        name: 'List Credentials via MCP',
        data: {
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: { name: 'list_credentials', arguments: {} }
        }
      }
    ];

    for (const test of mcpTests) {
      console.log(`\n🔍 Testing: ${test.name}`);
      const result = await this.testEndpoint(
        this.mcpConfig.url,
        'POST',
        test.data,
        { 'Content-Type': 'application/json' }
      );
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
        this.testResults.mcp[test.name] = result;
      } else {
        console.log(`❌ ${result.message}`);
        this.testResults.mcp[test.name] = result;
      }
    }
  }

  async generateSummary() {
    console.log('\n📊 COMPREHENSIVE TESTING SUMMARY');
    console.log('================================');

    // Calculate success rates
    const vpsTests = Object.keys(this.testResults.vps).length;
    const vpsSuccesses = Object.values(this.testResults.vps).filter(r => r.success).length;
    const vpsSuccessRate = vpsTests > 0 ? (vpsSuccesses / vpsTests * 100).toFixed(1) : 0;

    const cloudTests = Object.keys(this.testResults.cloud).length;
    const cloudSuccesses = Object.values(this.testResults.cloud).filter(r => r.success && !r.expected).length;
    const cloudExpectedFailures = Object.values(this.testResults.cloud).filter(r => !r.success && r.expected).length;
    const cloudSuccessRate = cloudTests > 0 ? (cloudSuccesses / cloudTests * 100).toFixed(1) : 0;

    const mcpTests = Object.keys(this.testResults.mcp).length;
    const mcpSuccesses = Object.values(this.testResults.mcp).filter(r => r.success).length;
    const mcpSuccessRate = mcpTests > 0 ? (mcpSuccesses / mcpTests * 100).toFixed(1) : 0;

    console.log(`\n🏢 VPS Instance:`);
    console.log(`   - Tests: ${vpsTests}`);
    console.log(`   - Successes: ${vpsSuccesses}`);
    console.log(`   - Success Rate: ${vpsSuccessRate}%`);

    console.log(`\n☁️ Cloud Instance:`);
    console.log(`   - Tests: ${cloudTests}`);
    console.log(`   - Successes: ${cloudSuccesses}`);
    console.log(`   - Expected Failures: ${cloudExpectedFailures}`);
    console.log(`   - Success Rate: ${cloudSuccessRate}%`);

    console.log(`\n🤖 MCP Server:`);
    console.log(`   - Tests: ${mcpTests}`);
    console.log(`   - Successes: ${mcpSuccesses}`);
    console.log(`   - Success Rate: ${mcpSuccessRate}%`);

    // Overall assessment
    const overallSuccess = vpsSuccessRate >= 80 && cloudSuccessRate >= 60 && mcpSuccessRate >= 50;
    
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    console.log(`   - VPS API: ${vpsSuccessRate >= 80 ? '✅ WORKING' : '❌ ISSUES'}`);
    console.log(`   - Cloud API: ${cloudSuccessRate >= 60 ? '✅ WORKING' : '❌ ISSUES'}`);
    console.log(`   - MCP Server: ${mcpSuccessRate >= 50 ? '✅ WORKING' : '❌ ISSUES'}`);
    console.log(`   - Overall: ${overallSuccess ? '✅ READY FOR PRODUCTION' : '❌ NEEDS FIXES'}`);

    this.testResults.summary = {
      vps: { tests: vpsTests, successes: vpsSuccesses, successRate: vpsSuccessRate },
      cloud: { tests: cloudTests, successes: cloudSuccesses, expectedFailures: cloudExpectedFailures, successRate: cloudSuccessRate },
      mcp: { tests: mcpTests, successes: mcpSuccesses, successRate: mcpSuccessRate },
      overall: { success: overallSuccess, timestamp: new Date().toISOString() }
    };

    return this.testResults;
  }

  async runComprehensiveTesting() {
    console.log('🧪 COMPREHENSIVE N8N TESTING');
    console.log('============================');

    try {
      await this.testVPSInstance();
      await this.testCloudInstance();
      await this.testMCPServer();
      
      const results = await this.generateSummary();
      
      // Save detailed results
      await fs.writeFile('data/comprehensive-n8n-testing-results.json', JSON.stringify(results, null, 2));
      console.log('\n📁 Detailed results saved to: data/comprehensive-n8n-testing-results.json');
      
      return results;
    } catch (error) {
      console.error('❌ Comprehensive testing failed:', error);
      throw error;
    }
  }
}

// Run comprehensive testing
const tester = new ComprehensiveN8NTesting();
tester.runComprehensiveTesting().catch(console.error);
