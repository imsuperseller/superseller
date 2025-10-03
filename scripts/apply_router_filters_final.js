#!/usr/bin/env node

const { spawn } = require('child_process');

// Get the current blueprint first
const getBlueprint = () => {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/make-mcp-server/server.js'], {
      env: {
        MAKE_API_KEY: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
        MAKE_TEAM: '1300459',
        MAKE_ZONE: 'us2'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "get_scenario_blueprint",
        arguments: {
          scenarioId: "3022209"
        }
      }
    };

    let output = '';
    let error = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      error += data.toString();
    });

    server.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = output.split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          if (jsonLine) {
            const response = JSON.parse(jsonLine);
            if (response.result && response.result.blueprint) {
              resolve(JSON.parse(response.result.blueprint));
            } else {
              reject(new Error('No blueprint in response'));
            }
          } else {
            reject(new Error('No JSON response found'));
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      } else {
        reject(new Error(`Server exited with code ${code}: ${error}`));
      }
    });

    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
  });
};

// Apply router filters to the blueprint
const applyRouterFilters = (blueprint) => {
  // Router 2 (Is watermark empty?) - Add filter condition
  if (blueprint.flow && blueprint.flow[1] && blueprint.flow[1].routes) {
    blueprint.flow[1].routes[0].filter = {
      conditions: [
        {
          left: "{{1.value}}",
          op: "empty",
          right: null
        }
      ]
    };
  }

  // Router 11 (Eligibility) - Add filter condition  
  if (blueprint.flow && blueprint.flow[1] && blueprint.flow[1].routes && blueprint.flow[1].routes[0] && blueprint.flow[1].routes[0].flow) {
    const router11 = blueprint.flow[1].routes[0].flow.find(module => module.id === 11);
    if (router11 && router11.routes) {
      router11.routes[0].filter = {
        conditions: [
          {
            left: "{{8.Interest Name}}",
            op: "contains",
            right: "בריאות"
          }
        ]
      };
    }
  }

  // Router 22 (Eligibility) - Add filter condition
  if (blueprint.flow && blueprint.flow[1] && blueprint.flow[1].routes && blueprint.flow[1].routes[1] && blueprint.flow[1].routes[1].flow) {
    const router22 = blueprint.flow[1].routes[1].flow.find(module => module.id === 22);
    if (router22 && router22.routes) {
      router22.routes[0].filter = {
        conditions: [
          {
            left: "{{10.Interest Name}}",
            op: "contains", 
            right: "בריאות"
          }
        ]
      };
    }
  }

  return blueprint;
};

// Update the scenario with the modified blueprint
const updateScenario = (blueprint) => {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/make-mcp-server/server.js'], {
      env: {
        MAKE_API_KEY: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
        MAKE_TEAM: '1300459',
        MAKE_ZONE: 'us2'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const request = {
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

    let output = '';
    let error = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      error += data.toString();
    });

    server.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = output.split('\n');
          const jsonLine = lines.find(line => line.trim().startsWith('{'));
          if (jsonLine) {
            const response = JSON.parse(jsonLine);
            if (response.result) {
              resolve(response.result);
            } else if (response.error) {
              reject(new Error(`Update failed: ${response.error.message}`));
            } else {
              reject(new Error('Unexpected response format'));
            }
          } else {
            reject(new Error('No JSON response found'));
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      } else {
        reject(new Error(`Server exited with code ${code}: ${error}`));
      }
    });

    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
  });
};

// Main execution
async function main() {
  try {
    console.log('🔍 Getting current blueprint...');
    const blueprint = await getBlueprint();
    console.log('✅ Blueprint retrieved successfully');

    console.log('🔧 Applying router filters...');
    const updatedBlueprint = applyRouterFilters(blueprint);
    console.log('✅ Router filters applied');

    console.log('📤 Updating scenario...');
    const result = await updateScenario(updatedBlueprint);
    console.log('✅ Scenario updated successfully');
    console.log('Result:', result);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
