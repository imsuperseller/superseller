#!/usr/bin/env node

/**
 * Set workflow static data for Google API key
 */

import axios from 'axios';
import fs from 'fs';

const N8N_CONFIG = {
  url: 'http://173.254.201.134:5678',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ'
};

const workflowId = 'eQSCUFw91oXLxtvn';

async function setStaticData() {
  try {
    console.log('📥 Fetching workflow...');
    
    const getResponse = await axios.get(
      `${N8N_CONFIG.url}/api/v1/workflows/${workflowId}`,
      { headers: { 'X-N8N-API-KEY': N8N_CONFIG.apiKey } }
    );

    const workflow = getResponse.data;
    console.log(`   Found: ${workflow.name}`);

    // Update static data - only send writable fields
    const updatedWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings,
      staticData: {
        googleApiKey: 'AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE'
      }
    };

    console.log('\n💾 Setting static data...');
    console.log('   googleApiKey: AIzaSyB1nQdOOSeYdGv_R53dcyYDsIwenRU5ziE');

    const updateResponse = await axios.put(
      `${N8N_CONFIG.url}/api/v1/workflows/${workflowId}`,
      updatedWorkflow,
      {
        headers: {
          'X-N8N-API-KEY': N8N_CONFIG.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Static data set successfully!');
    console.log('\n📊 Workflow Details:');
    console.log(`   • Name: ${updateResponse.data.name}`);
    console.log(`   • Static Data: ${JSON.stringify(updateResponse.data.staticData)}`);

  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

setStaticData();

