#!/usr/bin/env node

const axios = require('axios');

const N8N_CONFIG = {
  url: 'http://173.254.201.134:5678',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA'
};

const workflowId = 'gH7MC2WuAkLDPhtY';

async function activateWorkflow() {
  try {
    console.log('🔄 Fetching workflow...');

    const getResponse = await axios.get(
      `${N8N_CONFIG.url}/api/v1/workflows/${workflowId}`,
      { headers: { 'X-N8N-API-KEY': N8N_CONFIG.apiKey } }
    );

    const workflow = getResponse.data;
    console.log(`   Found: ${workflow.name}`);
    console.log(`   Current status: ${workflow.active ? 'Active' : 'Inactive'}`);

    // Only send fields that are writable
    const updatePayload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings,
      staticData: workflow.staticData,
      active: true // THIS is what we're changing
    };

    console.log('\n🔄 Activating...');

    await axios.put(
      `${N8N_CONFIG.url}/api/v1/workflows/${workflowId}`,
      updatePayload,
      {
        headers: {
          'X-N8N-API-KEY': N8N_CONFIG.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ INT-SYNC-001 is now ACTIVE!');
    console.log('\n📊 Workflow Details:');
    console.log('   • ID: gH7MC2WuAkLDPhtY');
    console.log('   • Trigger: Every 15 minutes');
    console.log('   • Syncs: 56 n8n workflows → Boost.space Space 43');
    console.log(`   • URL: ${N8N_CONFIG.url}/workflow/${workflowId}`);
    console.log('\n⏳ Next sync: Within 15 minutes');

  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

activateWorkflow();
