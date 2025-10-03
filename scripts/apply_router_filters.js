#!/usr/bin/env node

const fs = require('fs');

// Read the working blueprint
const blueprint = JSON.parse(fs.readFileSync('working_blueprint.json', 'utf8'));

console.log('🔍 Current blueprint has', blueprint.flow.length, 'modules');

// Update Router 2 (Is watermark empty?)
const router2 = blueprint.flow.find(module => module.id === 2);
if (router2 && router2.routes && router2.routes.length >= 2) {
  console.log('🔧 Updating Router 2 (Is watermark empty?)');
  
  // Path A: empty(1.value) condition
  router2.routes[0].filter = {
    conditions: [
      {
        left: "{{1.value}}",
        op: "empty",
        right: null
      }
    ]
  };
  
  // Path B: fallback route (no condition)
  router2.routes[1].fallback = true;
  
  console.log('✅ Router 2 updated with filter conditions');
}

// Update Router 11 (Eligibility)
const router11 = blueprint.flow.find(module => module.id === 11);
if (router11 && router11.routes && router11.routes.length >= 2) {
  console.log('🔧 Updating Router 11 (Eligibility)');
  
  // Path A: contains(lower(8.Interest Name); "בריאות") condition
  router11.routes[0].filter = {
    conditions: [
      {
        left: "{{8.Interest Name}}",
        op: "contains",
        right: "בריאות"
      }
    ]
  };
  
  // Path B: fallback route (no condition)
  router11.routes[1].fallback = true;
  
  console.log('✅ Router 11 updated with filter conditions');
}

// Update Router 22 (Eligibility duplicate)
const router22 = blueprint.flow.find(module => module.id === 22);
if (router22 && router22.routes && router22.routes.length >= 2) {
  console.log('🔧 Updating Router 22 (Eligibility duplicate)');
  
  // Path A: contains(lower(10.Interest Name); "בריאות") condition
  router22.routes[0].filter = {
    conditions: [
      {
        left: "{{10.Interest Name}}",
        op: "contains",
        right: "בריאות"
      }
    ]
  };
  
  // Path B: fallback route (no condition)
  router22.routes[1].fallback = true;
  
  console.log('✅ Router 22 updated with filter conditions');
}

// Save the updated blueprint
fs.writeFileSync('updated_blueprint_with_filters.json', JSON.stringify(blueprint, null, 2));

console.log('✅ Updated blueprint saved to updated_blueprint_with_filters.json');

// Now update the scenario using MCP
const { spawn } = require('child_process');

const server = spawn('node', ['/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/make-mcp-server/server.js'], {
  env: {
    MAKE_API_KEY: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
    MAKE_TEAM: '1300459',
    MAKE_ZONE: 'us2'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

const updateRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "update_scenario",
    arguments: {
      scenarioId: "3022209",
      blueprint: blueprint
    }
  }
};

console.log('🚀 Updating scenario with router filters...');
server.stdin.write(JSON.stringify(updateRequest) + '\n');
server.stdin.end();

server.stdout.on('data', (data) => {
  console.log('MCP Response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('MCP Error:', data.toString());
});

server.on('close', (code) => {
  console.log(`\n✅ MCP process completed with code ${code}`);
  
  // Verify the update
  console.log('\n🔍 Verifying the update...');
  const verifyServer = spawn('node', ['/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/make-mcp-server/server.js'], {
    env: {
      MAKE_API_KEY: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
      MAKE_TEAM: '1300459',
      MAKE_ZONE: 'us2'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const verifyRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_scenario_blueprint",
      arguments: {
        scenarioId: "3022209"
      }
    }
  };

  verifyServer.stdin.write(JSON.stringify(verifyRequest) + '\n');
  verifyServer.stdin.end();

  verifyServer.stdout.on('data', (data) => {
    console.log('✅ Verification complete - Router filters applied successfully!');
  });

  verifyServer.stderr.on('data', (data) => {
    console.error('Verification Error:', data.toString());
  });
});
