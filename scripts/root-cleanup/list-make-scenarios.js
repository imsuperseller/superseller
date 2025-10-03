#!/usr/bin/env node

import { spawn } from 'child_process';

// Use Make.com MCP server to list all scenarios
// Updated: MCP servers now use NPX packages instead of VPS SSH deployment
async function listScenarios() {
  return new Promise((resolve, reject) => {
    // OBSOLETE: SSH-based MCP server deployment
    // Now using: npx @modelcontextprotocol/server-make
    const mcpServer = spawn('npx', [
      '@modelcontextprotocol/server-make',
      '--list-scenarios'
    ]);

    let output = '';
    let error = '';

    mcpServer.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpServer.stderr.on('data', (data) => {
      error += data.toString();
    });

    mcpServer.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(error));
      }
    });
  });
}

// Main function
async function main() {
  try {
    console.log('📋 Listing all Make.com scenarios...');
    
    const scenariosData = await listScenarios();
    console.log('📊 Scenarios data retrieved');
    
    // Parse the MCP response
    const lines = scenariosData.split('\n');
    const responseLine = lines.find(line => line.includes('"content"'));
    
    if (responseLine) {
      const response = JSON.parse(responseLine);
      if (response.content && response.content[0] && response.content[0].text) {
        const jsonData = response.content[0].text;
        console.log('📝 Scenarios response:');
        console.log(jsonData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
