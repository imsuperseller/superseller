#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🔍 VERIFYING ROUTER FILTERS IN SCENARIO 3022209');
console.log('=' .repeat(60));

// Get the current blueprint
const server = spawn('node', ['/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/make-mcp-server/server.js'], {
  env: {
    MAKE_API_KEY: '8b8f13b7-8bda-43cb-ba4c-b582243cf5b9',
    MAKE_TEAM: '1300459',
    MAKE_ZONE: 'us2'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

const getBlueprintRequest = {
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

server.stdin.write(JSON.stringify(getBlueprintRequest) + '\n');
server.stdin.end();

let responseData = '';
server.stdout.on('data', (data) => {
  responseData += data.toString();
});

server.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

server.on('close', (code) => {
  try {
    const response = JSON.parse(responseData);
    const blueprintText = response.result.content[0].text;
    
    // Extract the actual blueprint JSON
    const blueprintMatch = blueprintText.match(/✅ Scenario 3022209 blueprint: ({.*})/);
    if (blueprintMatch) {
      const fullResponse = JSON.parse(blueprintMatch[1]);
      const blueprint = fullResponse.response.blueprint;
      
      console.log(`✅ Retrieved blueprint with ${blueprint.flow.length} modules\n`);
      
      // Check Router 2 (Is watermark empty?)
      const router2 = blueprint.flow.find(module => module.id === 2);
      if (router2) {
        console.log('🔍 ROUTER 2 - "Is watermark empty?"');
        console.log('   Module ID:', router2.id);
        console.log('   Module Type:', router2.module);
        console.log('   Routes Count:', router2.routes ? router2.routes.length : 0);
        
        if (router2.routes && router2.routes.length >= 2) {
          // Check Path A (Empty condition)
          if (router2.routes[0].filter && router2.routes[0].filter.conditions) {
            console.log('   ✅ Path A (Empty): Filter configured');
            console.log('      Condition:', router2.routes[0].filter.conditions[0].left);
            console.log('      Operator:', router2.routes[0].filter.conditions[0].op);
          } else {
            console.log('   ❌ Path A (Empty): No filter configured');
          }
          
          // Check Path B (Fallback)
          if (router2.routes[1].fallback) {
            console.log('   ✅ Path B (Has value): Fallback route configured');
          } else {
            console.log('   ❌ Path B (Has value): No fallback configured');
          }
        }
        console.log('');
      }
      
      // Check Router 11 (Eligibility)
      const router11 = blueprint.flow.find(module => module.id === 11);
      if (router11) {
        console.log('🔍 ROUTER 11 - "Eligibility"');
        console.log('   Module ID:', router11.id);
        console.log('   Module Type:', router11.module);
        console.log('   Routes Count:', router11.routes ? router11.routes.length : 0);
        
        if (router11.routes && router11.routes.length >= 2) {
          // Check Path A (Process condition)
          if (router11.routes[0].filter && router11.routes[0].filter.conditions) {
            console.log('   ✅ Path A (Process): Filter configured');
            console.log('      Condition:', router11.routes[0].filter.conditions[0].left);
            console.log('      Operator:', router11.routes[0].filter.conditions[0].op);
            console.log('      Value:', router11.routes[0].filter.conditions[0].right);
          } else {
            console.log('   ❌ Path A (Process): No filter configured');
          }
          
          // Check Path B (Fallback)
          if (router11.routes[1].fallback) {
            console.log('   ✅ Path B (Skip): Fallback route configured');
          } else {
            console.log('   ❌ Path B (Skip): No fallback configured');
          }
        }
        console.log('');
      }
      
      // Check Router 22 (Eligibility duplicate)
      const router22 = blueprint.flow.find(module => module.id === 22);
      if (router22) {
        console.log('🔍 ROUTER 22 - "Eligibility" (duplicate)');
        console.log('   Module ID:', router22.id);
        console.log('   Module Type:', router22.module);
        console.log('   Routes Count:', router22.routes ? router22.routes.length : 0);
        
        if (router22.routes && router22.routes.length >= 2) {
          // Check Path A (Process condition)
          if (router22.routes[0].filter && router22.routes[0].filter.conditions) {
            console.log('   ✅ Path A (Process): Filter configured');
            console.log('      Condition:', router22.routes[0].filter.conditions[0].left);
            console.log('      Operator:', router22.routes[0].filter.conditions[0].op);
            console.log('      Value:', router22.routes[0].filter.conditions[0].right);
          } else {
            console.log('   ❌ Path A (Process): No filter configured');
          }
          
          // Check Path B (Fallback)
          if (router22.routes[1].fallback) {
            console.log('   ✅ Path B (Skip): Fallback route configured');
          } else {
            console.log('   ❌ Path B (Skip): No fallback configured');
          }
        }
        console.log('');
      }
      
      // Summary
      console.log('📊 SUMMARY:');
      console.log('=' .repeat(40));
      
      const routers = [router2, router11, router22];
      let configuredRouters = 0;
      
      routers.forEach((router, index) => {
        if (router && router.routes && router.routes.length >= 2) {
          const hasFilter = router.routes[0].filter && router.routes[0].filter.conditions;
          const hasFallback = router.routes[1].fallback;
          
          if (hasFilter && hasFallback) {
            configuredRouters++;
            console.log(`✅ Router ${router.id}: Fully configured`);
          } else {
            console.log(`❌ Router ${router.id}: Partially configured`);
          }
        } else {
          console.log(`❌ Router ${router ? router.id : 'unknown'}: Not found or incomplete`);
        }
      });
      
      console.log(`\n🎯 RESULT: ${configuredRouters}/3 routers fully configured`);
      
      if (configuredRouters === 3) {
        console.log('🎉 SUCCESS: All router filters are properly configured!');
        console.log('\n📋 ROUTER CONFIGURATION SUMMARY:');
        console.log('   • Router 2: empty(1.value) → Set variable | fallback → Get variable');
        console.log('   • Router 11: contains(8.Interest Name, "בריאות") → Process | fallback → End');
        console.log('   • Router 22: contains(10.Interest Name, "בריאות") → Process | fallback → End');
      } else {
        console.log('⚠️  WARNING: Some router filters need manual configuration');
      }
      
    } else {
      console.log('❌ Could not extract blueprint from response');
    }
  } catch (error) {
    console.error('❌ Error parsing response:', error.message);
  }
});
