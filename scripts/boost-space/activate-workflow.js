#!/usr/bin/env node

const axios = require('axios');

const N8N_CONFIG = {
  url: 'http://173.254.201.134:5678',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA'
};

const workflowId = 'gH7MC2WuAkLDPhtY';

async function activateWorkflow() {
  try {
    console.log('🔄 Activating INT-SYNC-001...');

    // First get the workflow
    const getResponse = await axios.get(
      `${N8N_CONFIG.url}/api/v1/workflows/${workflowId}`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_CONFIG.apiKey
        }
      }
    );

    // Update with active: true
    const updateResponse = await axios.put(
      `${N8N_CONFIG.url}/api/v1/workflows/${workflowId}`,
      { ...getResponse.data, active: true },
      {
        headers: {
          'X-N8N-API-KEY': N8N_CONFIG.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow activated!');
    console.log(`   Status: ${updateResponse.data.active ? 'Active' : 'Inactive'}`);
    console.log('\n📊 INT-SYNC-001 Details:');
    console.log('   • Name: INT-SYNC-001: n8n to Boost.space Workflow Sync');
    console.log('   • Trigger: Every 15 minutes');
    console.log('   • Source: n8n API (all workflows)');
    console.log('   • Destination: Boost.space Space 43 (n8n Workflows)');
    console.log(`   • URL: ${N8N_CONFIG.url}/workflow/${workflowId}`);
    console.log('\n⏳ First sync will run in ~15 minutes');
    console.log('   Or trigger manually in n8n UI');

  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

activateWorkflow();
