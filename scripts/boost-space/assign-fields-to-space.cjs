#!/usr/bin/env node

/**
 * Assign custom fields to Space 45
 * This may be required before fields can be used in records
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupId: 475,
  spaceId: 45
};

async function assignFieldsToSpace() {
  const api = axios.create({
    baseURL: CONFIG.platform,
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('📋 Getting field group...');
  const fieldGroupResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
  const fields = fieldGroupResponse.data.inputs || [];
  
  console.log(`✅ Found ${fields.length} fields`);
  console.log('📝 Assigning fields to Space 45...\n');
  
  let assigned = 0;
  let skipped = 0;
  
  for (const field of fields) {
    // Check if already assigned
    if (field.spaces && field.spaces.includes(CONFIG.spaceId)) {
      skipped++;
      continue;
    }
    
    try {
      // Update field to include space
      const spaces = field.spaces || [];
      if (!spaces.includes(CONFIG.spaceId)) {
        spaces.push(CONFIG.spaceId);
      }
      
      // Try to update the field (may need different endpoint)
      // Note: Field updates might need to go through the field group
      console.log(`   Assigning ${field.name} (ID: ${field.id}) to space ${CONFIG.spaceId}...`);
      
      // This might not work - Boost.space may not allow field updates via API
      // But let's try
      try {
        await api.put(`/api/custom-field/${CONFIG.fieldGroupId}/input/${field.id}`, {
          spaces: spaces
        });
        assigned++;
        console.log(`   ✅ Assigned`);
      } catch (error) {
        console.log(`   ⚠️  Could not assign via API (may need manual assignment in UI)`);
        skipped++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Complete: ${assigned} assigned, ${skipped} skipped/already assigned`);
  console.log('\n⚠️  Note: If fields could not be assigned via API, you may need to:');
  console.log('   1. Go to Boost.space UI');
  console.log('   2. Navigate to Settings → Custom Fields');
  console.log('   3. Find "n8n Workflow Fields" field group');
  console.log('   4. Assign all fields to Space 45');
}

assignFieldsToSpace().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
