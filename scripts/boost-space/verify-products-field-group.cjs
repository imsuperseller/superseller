#!/usr/bin/env node

/**
 * Verify Products Module Field Group
 * 
 * Checks if "n8n Workflow Fields (Products)" field group exists
 * and is correctly assigned to Products module
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupName: 'n8n Workflow Fields (Products)'
};

async function verifyFieldGroup() {
  console.log('🔍 Verifying Products Module Field Group\n');
  console.log(`Platform: ${CONFIG.platform}`);
  console.log(`Field Group: ${CONFIG.fieldGroupName}\n`);

  try {
    const api = axios.create({
      baseURL: CONFIG.platform,
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Fetch all custom field groups
    console.log('📋 Fetching all custom field groups...');
    const response = await api.get('/api/custom-field');
    const groups = Array.isArray(response.data) ? response.data : [];
    
    console.log(`   Found ${groups.length} total field groups\n`);

    // Find our field group
    const ourGroup = groups.find(g => 
      g.name === CONFIG.fieldGroupName || 
      g.title === CONFIG.fieldGroupName ||
      (g.name && g.name.includes('Products'))
    );

    if (!ourGroup) {
      console.log('❌ Field group not found!');
      console.log('\n📋 Available field groups:');
      groups.slice(0, 10).forEach(g => {
        console.log(`   - ${g.name || g.title || 'Unnamed'} (ID: ${g.id}, Module: ${g.module || 'unknown'})`);
      });
      if (groups.length > 10) {
        console.log(`   ... and ${groups.length - 10} more`);
      }
      return;
    }

    console.log('✅ Field group found!\n');
    console.log('📊 Field Group Details:');
    console.log(`   ID: ${ourGroup.id}`);
    console.log(`   Name: ${ourGroup.name || ourGroup.title}`);
    console.log(`   Module: ${ourGroup.module || 'NOT SET'} ${ourGroup.module === 'product' ? '✅' : '❌'}`);
    console.log(`   Table: ${ourGroup.table || 'NOT SET'}`);
    console.log(`   Spaces: ${ourGroup.spaces ? JSON.stringify(ourGroup.spaces) : 'NOT SET'}`);
    console.log(`   Inputs (Fields): ${ourGroup.inputs ? ourGroup.inputs.length : 0}`);

    // Check module assignment
    if (ourGroup.module === 'product') {
      console.log('\n✅ CORRECT: Field group is assigned to Products module!');
    } else if (ourGroup.module) {
      console.log(`\n⚠️  WARNING: Field group is assigned to "${ourGroup.module}" module, not "product"`);
      console.log('   You need to change the module assignment to "product"');
    } else {
      console.log('\n⚠️  WARNING: Module not set!');
      console.log('   You need to assign this field group to Products module');
    }

    // Check if fields exist
    if (ourGroup.inputs && ourGroup.inputs.length > 0) {
      console.log(`\n📝 Fields in group: ${ourGroup.inputs.length}`);
      console.log('   First 5 fields:');
      ourGroup.inputs.slice(0, 5).forEach((input, idx) => {
        console.log(`   ${idx + 1}. ${input.name || input.title || 'Unnamed'} (${input.type || 'unknown type'})`);
      });
      if (ourGroup.inputs.length > 5) {
        console.log(`   ... and ${ourGroup.inputs.length - 5} more`);
      }
    } else {
      console.log('\n📝 No fields created yet');
      console.log('   Next step: Create all 86 custom fields in this field group');
    }

    // Try to fetch directly by ID
    console.log(`\n🔍 Fetching field group directly by ID ${ourGroup.id}...`);
    try {
      const directResponse = await api.get(`/api/custom-field/${ourGroup.id}`);
      const directGroup = directResponse.data;
      console.log('✅ Direct fetch successful');
      console.log(`   Module: ${directGroup.module || 'NOT SET'}`);
      console.log(`   Table: ${directGroup.table || 'NOT SET'}`);
    } catch (err) {
      console.log('⚠️  Could not fetch directly (might need different endpoint)');
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
