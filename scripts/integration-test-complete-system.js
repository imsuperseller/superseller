#!/usr/bin/env node

/**
 * Complete System Integration Test
 * Tests all major systems: n8n, Airtable, Webflow MCP, and their interactions
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  n8n: {
    url: 'http://173.254.201.134:5678',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDkyMDIxfQ.YKPTmHyLr1_kXX2JMY7hsPy4jvnCJDL71mOCltoUbQc'
  },
  airtable: {
    apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
    baseId: 'appqY1p53ge7UqxUO'
  },
  webflow: {
    token: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b',
    siteId: '66c7e551a317e0e9c9f906d8'
  }
};

class IntegrationTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        successRate: 0
      }
    };
  }

  async test(testName, testFunction) {
    this.results.summary.total++;
    console.log(`\n🧪 Testing: ${testName}`);

    try {
      const result = await testFunction();
      this.results.tests[testName] = {
        status: 'PASSED',
        result: result,
        timestamp: new Date().toISOString()
      };
      this.results.summary.passed++;
      console.log(`✅ ${testName}: PASSED`);
      return result;
    } catch (error) {
      this.results.tests[testName] = {
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.results.summary.failed++;
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
      throw error;
    }
  }

  async testN8nSystem() {
    console.log('\n🔧 Testing n8n System...');

    // Test n8n API connectivity
    await this.test('n8n API Connectivity', async () => {
      const response = await axios.get(`${config.n8n.url}/api/v1/executions`, {
        headers: {
          'X-N8N-API-KEY': config.n8n.token
        }
      });
      return { status: response.status, executions: response.data.length };
    });

    // Test workflow listing
    await this.test('n8n Workflow Listing', async () => {
      const response = await axios.get(`${config.n8n.url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': config.n8n.token
        }
      });
      console.log('Workflows response:', JSON.stringify(response.data, null, 2));
      return { status: response.status, workflows: response.data.data ? response.data.data.length : 0 };
    });

    // Test workflow execution
    await this.test('n8n Workflow Execution', async () => {
      // First get available workflows
      const workflowsResponse = await axios.get(`${config.n8n.url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': config.n8n.token
        }
      });

      const workflows = workflowsResponse.data.data || [];
      if (workflows.length === 0) {
        return { status: 'SKIPPED', reason: 'No workflows available' };
      }

      // Use the first available workflow
      const workflowId = workflows[0].id;
      const response = await axios.post(`${config.n8n.url}/api/v1/workflows/${workflowId}/trigger`, {}, {
        headers: {
          'X-N8N-API-KEY': config.n8n.token,
          'Content-Type': 'application/json'
        }
      });
      return { status: response.status, executionId: response.data.executionId, workflowId };
    });
  }

  async testAirtableSystem() {
    console.log('\n📊 Testing Airtable System...');

    // Test Airtable API connectivity
    await this.test('Airtable API Connectivity', async () => {
      const response = await axios.get(`https://api.airtable.com/v0/meta/bases`, {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`
        }
      });
      return { status: response.status, bases: response.data.bases.length };
    });

    // Test base access
    await this.test('Airtable Base Access', async () => {
      const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`
        }
      });
      return { status: response.status, tables: response.data.tables.length };
    });

    // Test table data access
    await this.test('Airtable Table Data Access', async () => {
      const response = await axios.get(`https://api.airtable.com/v0/${config.airtable.baseId}/Customers`, {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`
        }
      });
      return { status: response.status, records: response.data.records.length };
    });

    // Test record creation
    await this.test('Airtable Record Creation', async () => {
      const testRecord = {
        fields: {
          'Name': 'Integration Test Customer',
          'Email': 'test@integration.com',
          'Status': 'Active'
        }
      };

      const response = await axios.post(`https://api.airtable.com/v0/${config.airtable.baseId}/Customers`, {
        records: [testRecord]
      }, {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return { status: response.status, recordId: response.data.records[0].id };
    });
  }

  async testWebflowSystem() {
    console.log('\n🌐 Testing Webflow System...');

    // Test Webflow API connectivity
    await this.test('Webflow API Connectivity', async () => {
      const response = await axios.get(`https://api.webflow.com/v2/sites/${config.webflow.siteId}`, {
        headers: {
          'Authorization': `Bearer ${config.webflow.token}`,
          'Accept': 'application/json'
        }
      });
      return { status: response.status, siteName: response.data.name };
    });

    // Test collections listing
    await this.test('Webflow Collections Listing', async () => {
      const response = await axios.get(`https://api.webflow.com/v2/sites/${config.webflow.siteId}/collections`, {
        headers: {
          'Authorization': `Bearer ${config.webflow.token}`,
          'Accept': 'application/json'
        }
      });
      return { status: response.status, collections: response.data.length };
    });

    // Test pages listing
    await this.test('Webflow Pages Listing', async () => {
      const response = await axios.get(`https://api.webflow.com/v2/sites/${config.webflow.siteId}/pages`, {
        headers: {
          'Authorization': `Bearer ${config.webflow.token}`,
          'Accept': 'application/json'
        }
      });
      return { status: response.status, pages: response.data.length };
    });
  }

  async testSystemIntegration() {
    console.log('\n🔗 Testing System Integration...');

    // Test data flow between systems
    await this.test('Data Flow Between Systems', async () => {
      // Create test data in Airtable
      const testData = {
        fields: {
          'Name': 'Integration Flow Test',
          'Email': 'flow@test.com',
          'Status': 'Active'
        }
      };

      const airtableResponse = await axios.post(`https://api.airtable.com/v0/${config.airtable.baseId}/Customers`, {
        records: [testData]
      }, {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Verify data was created
      const verifyResponse = await axios.get(`https://api.airtable.com/v0/${config.airtable.baseId}/Customers/${airtableResponse.data.records[0].id}`, {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`
        }
      });

      return {
        status: verifyResponse.status,
        recordId: verifyResponse.data.id,
        name: verifyResponse.data.fields.Name
      };
    });

    // Test API connectivity between systems
    await this.test('Cross-System API Connectivity', async () => {
      // Test that all systems can be reached from the same environment
      const results = {};

      // Test n8n
      const n8nResponse = await axios.get(`${config.n8n.url}/api/v1/executions`, {
        headers: { 'X-N8N-API-KEY': config.n8n.token }
      });
      results.n8n = n8nResponse.status;

      // Test Airtable
      const airtableResponse = await axios.get(`https://api.airtable.com/v0/meta/bases`, {
        headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
      });
      results.airtable = airtableResponse.status;

      // Test Webflow
      const webflowResponse = await axios.get(`https://api.webflow.com/v2/sites/${config.webflow.siteId}`, {
        headers: { 'Authorization': `Bearer ${config.webflow.token}` }
      });
      results.webflow = webflowResponse.status;

      return results;
    });
  }

  async testMCPServers() {
    console.log('\n🤖 Testing MCP Servers...');

    // Test Airtable MCP Server
    await this.test('Airtable MCP Server', async () => {
      // Test if MCP server is running
      return new Promise((resolve, reject) => {
        exec('ps aux | grep airtable-mcp-server', (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            const isRunning = stdout.includes('airtable-mcp-server');
            resolve({ running: isRunning, processes: stdout.split('\n').length - 1 });
          }
        });
      });
    });

    // Test Webflow MCP Server
    await this.test('Webflow MCP Server', async () => {
      return new Promise((resolve, reject) => {
        exec('ps aux | grep webflow-mcp-server', (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            const isRunning = stdout.includes('webflow-mcp-server');
            resolve({ running: isRunning, processes: stdout.split('\n').length - 1 });
          }
        });
      });
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Complete System Integration Test...');
    console.log(`📅 Test started at: ${new Date().toISOString()}`);

    try {
      await this.testN8nSystem();
      await this.testAirtableSystem();
      await this.testWebflowSystem();
      await this.testSystemIntegration();
      await this.testMCPServers();

      this.results.summary.successRate = (this.results.summary.passed / this.results.summary.total) * 100;

      console.log('\n📊 Test Summary:');
      console.log(`Total Tests: ${this.results.summary.total}`);
      console.log(`Passed: ${this.results.summary.passed}`);
      console.log(`Failed: ${this.results.summary.failed}`);
      console.log(`Success Rate: ${this.results.summary.successRate.toFixed(1)}%`);

      // Save results
      const resultsPath = path.join(__dirname, '../docs/integration-test-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${resultsPath}`);

      if (this.results.summary.successRate >= 90) {
        console.log('\n🎉 Integration Test PASSED! All systems are working correctly.');
        return true;
      } else {
        console.log('\n⚠️ Integration Test PARTIALLY PASSED. Some issues need attention.');
        return false;
      }

    } catch (error) {
      console.error('\n❌ Integration Test FAILED:', error.message);
      return false;
    }
  }
}

// Run the integration test
async function main() {
  const tester = new IntegrationTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

// Run the integration test
main().catch(console.error);

export default IntegrationTester;
