#!/usr/bin/env node

/**
 * Fix Products Module Assignment
 * 
 * Attempts to update field group module assignment from custom-module-item to product
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupId: 479, // "n8n Workflow Fields (Products)"
  targetModule: 'product'
};

async function fixModuleAssignment() {
  console.log('🔧 Fixing Products Module Assignment\n');
  console.log(`Field Group ID: ${CONFIG.fieldGroupId}`);
  console.log(`Target Module: ${CONFIG.targetModule}\n`);

  try {
    const api = axios.create({
      baseURL: CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Get current field group
    console.log('📋 Fetching current field group...');
    const currentResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
    const currentGroup = currentResponse.data;
    
    console.log(`   Current Module: ${currentGroup.module || 'NOT SET'}`);
    console.log(`   Current Table: ${currentGroup.table || 'NOT SET'}\n`);

    if (currentGroup.module === CONFIG.targetModule) {
      console.log('✅ Already assigned to Products module!');
      return;
    }

    // Try to update module
    console.log('🔄 Attempting to update module assignment...');
    const updatePayload = {
      module: CONFIG.targetModule,
      table: 'product' // Products module table name
    };

    try {
      const updateResponse = await api.put(`/api/custom-field/${CONFIG.fieldGroupId}`, updatePayload);
      console.log('✅ Update request sent');
      console.log('   Response:', JSON.stringify(updateResponse.data, null, 2));
      
      // Verify
      console.log('\n🔍 Verifying update...');
      const verifyResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
      const updatedGroup = verifyResponse.data;
      console.log(`   Module: ${updatedGroup.module || 'NOT SET'} ${updatedGroup.module === CONFIG.targetModule ? '✅' : '❌'}`);
      console.log(`   Table: ${updatedGroup.table || 'NOT SET'}`);
      
      if (updatedGroup.module === CONFIG.targetModule) {
        console.log('\n✅ SUCCESS: Module assignment updated!');
      } else {
        console.log('\n⚠️  Module may not have updated. Try UI method instead.');
      }
    } catch (updateError) {
      console.log('❌ API update failed:', updateError.message);
      if (updateError.response) {
        console.log('   Status:', updateError.response.status);
        console.log('   Data:', JSON.stringify(updateError.response.data, null, 2));
      }
      console.log('\n💡 Recommendation: Use UI method to change module assignment');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

fixModuleAssignment();
