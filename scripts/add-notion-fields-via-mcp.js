#!/usr/bin/env node

/**
 * ADD NOTION FIELDS VIA MCP
 * Use the fixed MCP server to add fields to databases
 */

import { spawn } from 'child_process';

const CUSTOMER_MANAGEMENT_DB_ID = '73487f9d-c6f8-4fca-9a12-9bee24d4038c';
const PROJECT_TRACKING_DB_ID = '82181eb3-1a49-403c-9465-9eb064e3f28b';

// Customer Management Database Fields (12 fields total)
const CUSTOMER_MANAGEMENT_FIELDS = [
  'Company Name',
  'Contact Email', 
  'Phone Number',
  'Industry',
  'Customer Status',
  'Subscription Plan',
  'Monthly Revenue',
  'Onboarding Date',
  'Last Contact Date',
  'Customer Success Manager',
  'Notes',
  'RGID'
];

// Project Tracking Database Fields (13 fields total)
const PROJECT_TRACKING_FIELDS = [
  'Project Name',
  'Customer',
  'Project Type',
  'Status',
  'Priority',
  'Start Date',
  'Due Date',
  'Budget',
  'Progress',
  'Project Manager',
  'Team Members',
  'Description',
  'RGID'
];

function sendMCPRequest(method, params) {
  return new Promise((resolve, reject) => {
    const request = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000),
      method: method,
      params: params
    };

    const mcpProcess = spawn('node', ['scripts/fixed-notion-mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${output}`));
        }
      } else {
        reject(new Error(`MCP process exited with code ${code}: ${errorOutput}`));
      }
    });

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();
  });
}

async function addFieldsToDatabase(databaseId, fields, databaseName) {
  console.log(`\n🔧 Adding fields to ${databaseName} database...`);
  
  for (const fieldName of fields) {
    try {
      console.log(`  Adding field: ${fieldName}`);
      
      // For now, we'll just log what we would add
      // The Notion API doesn't support adding fields via the MCP server
      // We need to use the direct API
      console.log(`  ✅ ${fieldName} would be added`);
    } catch (error) {
      console.error(`  ❌ Error adding ${fieldName}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting Notion Database Fields Addition via MCP...');
  
  try {
    // Test MCP connection first
    console.log('🔍 Testing MCP connection...');
    const testResponse = await sendMCPRequest('tools/list', {});
    console.log('✅ MCP connection successful');
    
    // Get database info
    console.log('\n📊 Getting Customer Management database info...');
    const customerDbResponse = await sendMCPRequest('tools/call', {
      name: 'notion-get-database',
      arguments: { database_id: CUSTOMER_MANAGEMENT_DB_ID }
    });
    
    console.log('Customer Management Database fields:');
    const customerDb = JSON.parse(customerDbResponse.result.content[0].text);
    Object.keys(customerDb.properties).forEach(field => console.log(`  - ${field}`));
    
    console.log('\n📊 Getting Project Tracking database info...');
    const projectDbResponse = await sendMCPRequest('tools/call', {
      name: 'notion-get-database',
      arguments: { database_id: PROJECT_TRACKING_DB_ID }
    });
    
    console.log('Project Tracking Database fields:');
    const projectDb = JSON.parse(projectDbResponse.result.content[0].text);
    Object.keys(projectDb.properties).forEach(field => console.log(`  - ${field}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
