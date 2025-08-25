#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

/**
 * SIMPLIFIED CRITICAL INFRASTRUCTURE FIX
 * 
 * This script fixes the most critical issues using the correct n8n workflow format
 */

class SimpleCriticalFix {
  constructor() {
    this.vpsConfig = {
      url: 'http://173.254.201.134:5678',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE'
    };
    
    this.results = {
      timestamp: new Date().toISOString(),
      fixes: {},
      status: 'in-progress'
    };
  }

  // ===== PHASE 1: FIX MCP SERVER WEBHOOK =====

  async fixMCPServerWebhook() {
    console.log('\n🔧 PHASE 1: FIXING MCP SERVER WEBHOOK');
    console.log('=====================================');

    try {
      // Create a simple MCP webhook workflow using the correct format
      const mcpWorkflow = {
        name: 'MCP Server Webhook',
        nodes: [
          {
            id: 'webhook-trigger',
            name: 'MCP Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 2.1,
            position: [240, 300],
            parameters: {
              httpMethod: 'POST',
              path: 'proper-mcp-webhook',
              responseMode: 'responseNode',
              options: {}
            },
            webhookId: 'proper-mcp-webhook'
          },
          {
            id: 'mcp-processor',
            name: 'MCP Protocol Handler',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [460, 300],
            parameters: {
              jsCode: `
// MCP Protocol Handler
const request = $input.first().json;
console.log('MCP Request received:', JSON.stringify(request, null, 2));

// Extract MCP request data
const jsonrpc = request.jsonrpc || '2.0';
const id = request.id || null;
const method = request.method || '';
const params = request.params || {};

let response = {
  jsonrpc: jsonrpc,
  id: id,
  result: null,
  error: null
};

console.log('Processing method:', method);

switch (method) {
  case 'initialize':
    response.result = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'Rensto n8n MCP Server',
        version: '1.0.0'
      }
    };
    break;
    
  case 'tools/list':
    response.result = {
      tools: [
        {
          name: "list_workflows",
          description: "List all n8n workflows",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_workflow",
          description: "Get a specific workflow by ID",
          inputSchema: {
            type: "object",
            properties: {
              workflowId: {
                type: "string",
                description: "ID of workflow to retrieve"
              }
            },
            required: ["workflowId"]
          }
        },
        {
          name: "list_credentials",
          description: "List all n8n credentials",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        }
      ]
    };
    break;
    
  case 'tools/call':
    const toolName = params.name;
    const toolArgs = params.arguments || {};
    
    console.log('Calling tool:', toolName, 'with args:', toolArgs);
    
    switch (toolName) {
      case 'list_workflows':
        try {
          const workflowsResponse = await fetch('http://173.254.201.134:5678/api/v1/workflows', {
            headers: { 'X-N8N-API-KEY': '${this.vpsConfig.apiKey}' }
          });
          const workflows = await workflowsResponse.json();
          response.result = {
            content: [
              {
                type: "text",
                text: \`Found \${workflows.length} workflows\`
              }
            ]
          };
        } catch (error) {
          response.result = {
            content: [
              {
                type: "text",
                text: \`Error listing workflows: \${error.message}\`
              }
            ]
          };
        }
        break;
        
      case 'get_workflow':
        try {
          const workflowResponse = await fetch(\`http://173.254.201.134:5678/api/v1/workflows/\${toolArgs.workflowId}\`, {
            headers: { 'X-N8N-API-KEY': '${this.vpsConfig.apiKey}' }
          });
          const workflow = await workflowResponse.json();
          response.result = {
            content: [
              {
                type: "text",
                text: \`Workflow: \${workflow.name || 'Unknown'}\`
              }
            ]
          };
        } catch (error) {
          response.result = {
            content: [
              {
                type: "text",
                text: \`Error getting workflow: \${error.message}\`
              }
            ]
          };
        }
        break;
        
      case 'list_credentials':
        response.result = {
          content: [
            {
              type: "text",
              text: "Credentials API not available (405 error)"
            }
          ]
        };
        break;
        
      default:
        response.error = {
          code: "tool_not_found",
          message: \`Tool '\${toolName}' not found\`
        };
    }
    break;
    
  default:
    response.error = {
      code: "method_not_found",
      message: \`Method '\${method}' not supported\`
    };
}

console.log('MCP Response:', JSON.stringify(response, null, 2));

return {
  json: response
};
              `
            }
          },
          {
            id: 'mcp-response',
            name: 'MCP Response',
            type: 'n8n-nodes-base.respondToWebhook',
            typeVersion: 1,
            position: [680, 300],
            parameters: {
              respondWith: 'json',
              responseBody: '={{ $json }}',
              options: {}
            }
          }
        ],
        connections: {
          'MCP Webhook Trigger': {
            main: [['MCP Protocol Handler']]
          },
          'MCP Protocol Handler': {
            main: [['MCP Response']]
          }
        },
        settings: {
          executionOrder: 'v1'
        },
        staticData: null,
        meta: null,
        pinData: null,
        active: true
      };

      // Deploy MCP workflow
      console.log('Deploying MCP webhook workflow...');
      const deployResponse = await axios.post(`${this.vpsConfig.url}/api/v1/workflows`, mcpWorkflow, {
        headers: { 'X-N8N-API-KEY': this.vpsConfig.apiKey }
      });

      if (deployResponse.status === 200) {
        console.log('✅ MCP webhook workflow deployed successfully');
        this.results.fixes.mcpWebhook = { status: 'fixed', workflowId: deployResponse.data.id };
      } else {
        throw new Error(`Failed to deploy MCP workflow: ${deployResponse.status}`);
      }

    } catch (error) {
      console.error('❌ Failed to fix MCP webhook:', error.message);
      this.results.fixes.mcpWebhook = { status: 'failed', error: error.message };
    }
  }

  // ===== PHASE 2: VERIFY FIXES =====

  async verifyFixes() {
    console.log('\n✅ PHASE 2: VERIFYING FIXES');
    console.log('============================');

    try {
      // Test MCP webhook
      console.log('🔍 Testing MCP Server Webhook...');
      const testResponse = await axios.post(`${this.vpsConfig.url}/webhook/proper-mcp-webhook`, {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (testResponse.status === 200) {
        console.log('✅ MCP webhook is working');
        this.results.fixes.mcpWebhook = { ...this.results.fixes.mcpWebhook, verified: true };
      } else {
        console.log('❌ MCP webhook test failed');
        this.results.fixes.mcpWebhook = { ...this.results.fixes.mcpWebhook, verified: false };
      }

    } catch (error) {
      console.log('❌ MCP webhook verification failed:', error.message);
      this.results.fixes.mcpWebhook = { ...this.results.fixes.mcpWebhook, verified: false, error: error.message };
    }
  }

  // ===== MAIN EXECUTION =====

  async executeSimpleFixes() {
    console.log('🚨 SIMPLIFIED CRITICAL INFRASTRUCTURE FIX');
    console.log('========================================');
    console.log('Fixing the most critical MCP server webhook issue...\n');

    try {
      // Execute fixes
      await this.fixMCPServerWebhook();
      await this.verifyFixes();

      // Save results
      this.results.status = 'completed';
      await fs.writeFile('data/simple-critical-fix-results.json', JSON.stringify(this.results, null, 2));

      console.log('\n🎉 SIMPLIFIED CRITICAL FIXES COMPLETED!');
      console.log('=======================================');
      console.log('📁 Results saved to: data/simple-critical-fix-results.json');
      
      // Summary
      const summary = Object.entries(this.results.fixes).map(([key, value]) => {
        const status = value.status === 'fixed' && value.verified ? '✅' : '❌';
        return `${status} ${key}: ${value.status}${value.verified ? ' (verified)' : ''}`;
      }).join('\n');
      
      console.log('\n📊 FIX SUMMARY:');
      console.log(summary);

      return this.results;

    } catch (error) {
      console.error('❌ Simple critical fix failed:', error);
      this.results.status = 'failed';
      this.results.error = error.message;
      
      await fs.writeFile('data/simple-critical-fix-results.json', JSON.stringify(this.results, null, 2));
      throw error;
    }
  }
}

// Execute simple fixes
const simpleFix = new SimpleCriticalFix();
simpleFix.executeSimpleFixes().catch(console.error);
