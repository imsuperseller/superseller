#!/usr/bin/env node

/**
 * Verify Field Group Exists and Get Details
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupName: 'n8n Workflow Fields (Projects)',
  fieldGroupId: 477
};

async function verifyFieldGroup() {
  const api = axios.create({
    baseURL: CONFIG.platform,
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('🔍 Verifying field group...\n');

  try {
    // Get all field groups
    const response = await api.get('/api/custom-field');
    const groups = Array.isArray(response.data) ? response.data : [];
    
    console.log(`📊 Total field groups found: ${groups.length}\n`);
    
    // Find our field group
    const ourGroup = groups.find(g => 
      g.id === CONFIG.fieldGroupId || 
      g.name === CONFIG.fieldGroupName ||
      g.title === CONFIG.fieldGroupName
    );
    
    if (ourGroup) {
      console.log('✅ Field group found!\n');
      console.log('Details:');
      console.log(JSON.stringify(ourGroup, null, 2));
      
      // Check if it's associated with Projects module
      console.log('\n📋 Module info:');
      console.log(`   Module: ${ourGroup.module || 'N/A'}`);
      console.log(`   Table: ${ourGroup.table || 'N/A'}`);
      console.log(`   Spaces: ${JSON.stringify(ourGroup.spaces || [])}`);
      
    } else {
      console.log('❌ Field group not found!\n');
      console.log('Available field groups:');
      groups.slice(0, 10).forEach(g => {
        console.log(`   - ${g.name || g.title} (ID: ${g.id}, Module: ${g.module || 'N/A'})`);
      });
    }
    
    // Also try to get by ID directly
    console.log(`\n🔍 Trying to get field group by ID: ${CONFIG.fieldGroupId}...`);
    try {
      const byIdResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
      console.log('✅ Found by ID:');
      console.log(JSON.stringify(byIdResponse.data, null, 2));
    } catch (e) {
      console.log(`❌ Could not get by ID: ${e.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verifyFieldGroup();
