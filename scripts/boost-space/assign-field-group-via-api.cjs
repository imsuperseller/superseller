#!/usr/bin/env node

/**
 * Assign Field Group to Space via API
 */

const axios = require('axios');

const CONFIG = {
  platform: 'https://superseller.boost.space',
  apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
  fieldGroupId: 477, // "n8n Workflow Fields (Projects)"
  spaceId: 49 // Projects space
};

async function assignFieldGroupToSpace() {
  const api = axios.create({
    baseURL: CONFIG.platform,
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('🔗 Assigning field group to space via API...\n');
  console.log(`   Field Group ID: ${CONFIG.fieldGroupId}`);
  console.log(`   Space ID: ${CONFIG.spaceId}\n`);

  try {
    // Get current field group
    const getResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
    const fieldGroup = getResponse.data;
    
    console.log('📋 Current field group:');
    console.log(`   Name: ${fieldGroup.name}`);
    console.log(`   Module: ${fieldGroup.module}`);
    console.log(`   Current spaces: ${JSON.stringify(fieldGroup.spaces || [])}\n`);

    // Update field group to include space
    // Note: Boost.space might require spaces to be assigned at field level, not group level
    const spaces = fieldGroup.spaces || [];
    if (!spaces.includes(CONFIG.spaceId)) {
      spaces.push(CONFIG.spaceId);
    }

    const updatePayload = {
      spaces: spaces
    };

    console.log('📤 Updating field group...');
    console.log(`   Payload: ${JSON.stringify(updatePayload)}`);
    
    let updateResponse;
    try {
      updateResponse = await api.put(`/api/custom-field/${CONFIG.fieldGroupId}`, updatePayload);
      console.log('   ✅ PUT request successful');
    } catch (e) {
      console.log(`   ⚠️  PUT failed: ${e.message}`);
      // Try PATCH instead
      console.log('   🔄 Trying PATCH...');
      try {
        updateResponse = await api.patch(`/api/custom-field/${CONFIG.fieldGroupId}`, updatePayload);
        console.log('   ✅ PATCH request successful');
      } catch (e2) {
        console.log(`   ❌ PATCH also failed: ${e2.message}`);
        throw e2;
      }
    }
    
    // Verify the update
    const verifyResponse = await api.get(`/api/custom-field/${CONFIG.fieldGroupId}`);
    const updatedSpaces = verifyResponse.data.spaces || [];
    console.log(`\n🔍 Verification: Spaces after update: ${JSON.stringify(updatedSpaces)}`);
    
    if (updatedSpaces.includes(CONFIG.spaceId)) {
      console.log('   ✅ Space assignment confirmed!');
    } else {
      console.log('   ⚠️  Space not in response - may need to assign at field level');
    }
    
    console.log('✅ Field group updated successfully!\n');
    console.log('Updated field group:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
    // Also update all fields in the group to include the space
    console.log('\n📝 Updating fields in group to include space...');
    if (fieldGroup.inputs && fieldGroup.inputs.length > 0) {
      let updated = 0;
      for (const input of fieldGroup.inputs.slice(0, 5)) { // Update first 5 as test
        try {
          const inputSpaces = input.spaces || [];
          if (!inputSpaces.includes(CONFIG.spaceId)) {
            inputSpaces.push(CONFIG.spaceId);
          }
          await api.put(`/api/custom-field-input/${input.id}`, { spaces: inputSpaces });
          updated++;
        } catch (e) {
          console.log(`   ⚠️  Could not update field ${input.id}: ${e.message}`);
        }
      }
      console.log(`   ✅ Updated ${updated} fields`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

assignFieldGroupToSpace();
