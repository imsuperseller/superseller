#!/usr/bin/env node

/**
 * Set Market Active Script
 * Activates or deactivates a marketplace instance for a specific client
 * 
 * Usage: node set-market-active.js <client-id> <active|inactive>
 * Example: node set-market-active.js uad active
 * Example: node set-market-active.js missparty inactive
 */

const https = require('https');

const API_BASE = 'https://api.n8n.io/api/v1';
const API_KEY = process.env.N8N_API_KEY || '${N8N_API_KEY}';

const WORKFLOW_ID = '8Ay9qG9GgOfrMUzXiC5KJ';

const CLIENT_CONFIGS = {
  uad: {
    name: 'Up & Down Garage Doors',
    slug: 'uad',
    phoneNumbers: [
      '+1-469-300-2011',
      '+1-972-639-9966', 
      '+1-469-708-5888',
      '+1-214-305-7755'
    ],
    strategy: 'professional',
    engine: 'kie_ai',
    locations: ['Dallas, TX', 'Fort Worth, TX', 'Arlington, TX', 'Plano, TX'],
    collection: 'garage_doors'
  },
  missparty: {
    name: 'Miss Party Rentals',
    slug: 'missparty',
    phoneNumbers: ['+1-469-444-8765'],
    strategy: 'fun_event',
    engine: 'high_stealth',
    locations: ['Dallas, TX', 'Richardson, TX', 'Garland, TX', 'Irving, TX'],
    collection: 'party_rentals'
  }
};

async function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.n8n.io',
      path: `/api/v1${endpoint}`,
      method: method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function setMarketActive(clientId, isActive) {
  const client = CLIENT_CONFIGS[clientId.toLowerCase()];
  
  if (!client) {
    console.error(`❌ Unknown client: ${clientId}`);
    console.log('Available clients:', Object.keys(CLIENT_CONFIGS).join(', '));
    process.exit(1);
  }

  console.log(`\n🔧 ${isActive ? 'Activating' : 'Deactivating'} ${client.name}...`);

  try {
    // Get current workflow
    const workflow = await makeRequest('GET', `/workflows/${WORKFLOW_ID}`);
    
    if (!workflow || !workflow.data) {
      throw new Error('Failed to fetch workflow');
    }

    // Update workflow with client config
    const updatedWorkflow = {
      ...workflow.data,
      staticData: {
        ...workflow.data.staticData,
        activeClient: isActive ? clientId : null,
        clientConfig: isActive ? client : {},
        lastUpdated: new Date().toISOString()
      },
      active: isActive
    };

    // Update workflow
    const result = await makeRequest('PUT', `/workflows/${WORKFLOW_ID}`, updatedWorkflow);
    
    if (result.data) {
      console.log(`✅ ${client.name} is now ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
      
      if (isActive) {
        console.log('\n📋 Configuration:');
        console.log(`   • Phone Numbers: ${client.phoneNumbers.join(', ')}`);
        console.log(`   • Locations: ${client.locations.join(', ')}`);
        console.log(`   • Strategy: ${client.strategy}`);
        console.log(`   • Engine: ${client.engine}`);
        console.log('\n🚀 Workflow will run every 20 minutes');
      }
    } else {
      throw new Error('Failed to update workflow');
    }

    // If activating, also trigger a test run
    if (isActive) {
      console.log('\n🧪 Triggering test run...');
      const execution = await makeRequest('POST', `/executions/${WORKFLOW_ID}`, {
        data: { 
          testMode: true,
          clientId: clientId
        }
      });
      
      if (execution.data) {
        console.log(`✅ Test execution started: ${execution.data.id}`);
        console.log(`   View at: https://app.n8n.io/executions/${execution.data.id}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node set-market-active.js <client-id> <active|inactive>');
  console.log('\nExamples:');
  console.log('  node set-market-active.js uad active');
  console.log('  node set-market-active.js missparty inactive');
  console.log('\nAvailable clients:', Object.keys(CLIENT_CONFIGS).join(', '));
  process.exit(1);
}

const [clientId, status] = args;
const isActive = status.toLowerCase() === 'active';

// Run the script
setMarketActive(clientId, isActive)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });