#!/usr/bin/env node

// Use built-in fetch (Node.js 18+)

class MakeMCPClient {
  constructor() {
    this.mcpUrl = 'https://us2.make.com/mcp/api/v1/u/e5adf952-1215-4272-8855-cf3ee7299870/sse';
    this.apiToken = '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9';
  }

  async sendMCPRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: method,
      params: params
    };

    console.error(`Sending MCP request: ${method}`);
    console.error(`Request:`, JSON.stringify(request, null, 2));

    try {
      const response = await fetch(this.mcpUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });

      console.error(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`MCP request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.error(`MCP response:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error(`MCP request error: ${error.message}`);
      throw error;
    }
  }

  async listTools() {
    return await this.sendMCPRequest('tools/list');
  }

  async callTool(name, arguments_ = {}) {
    return await this.sendMCPRequest('tools/call', {
      name: name,
      arguments: arguments_
    });
  }

  async listScenarios() {
    return await this.callTool('list_scenarios');
  }

  async getScenario(scenarioId) {
    return await this.callTool('get_scenario', { scenarioId });
  }

  async runScenario(scenarioId, data = {}) {
    return await this.callTool('run_scenario', { scenarioId, data });
  }

  async updateScenario(scenarioId, blueprint) {
    return await this.callTool('update_scenario', { scenarioId, blueprint });
  }

  async healthCheck() {
    return await this.callTool('health_check');
  }
}

// Test the MCP client
async function testMakeMCP() {
  const client = new MakeMCPClient();
  
  try {
    console.log('🔍 Testing Make.com MCP Client...');
    
    // Test 1: List available tools
    console.log('\n1. Listing available tools...');
    const tools = await client.listTools();
    console.log('✅ Tools:', JSON.stringify(tools, null, 2));
    
    // Test 2: Health check
    console.log('\n2. Health check...');
    const health = await client.healthCheck();
    console.log('✅ Health:', JSON.stringify(health, null, 2));
    
    // Test 3: List scenarios
    console.log('\n3. Listing scenarios...');
    const scenarios = await client.listScenarios();
    console.log('✅ Scenarios:', JSON.stringify(scenarios, null, 2));
    
    // Test 4: Get specific scenario
    console.log('\n4. Getting scenario 2983190...');
    const scenario = await client.getScenario('2983190');
    console.log('✅ Scenario:', JSON.stringify(scenario, null, 2));
    
  } catch (error) {
    console.error('❌ MCP Client test failed:', error.message);
  }
}

// Run the test if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('make_mcp_client.js')) {
  testMakeMCP();
}

export default MakeMCPClient;
