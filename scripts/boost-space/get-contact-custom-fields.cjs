#!/usr/bin/env node

/**
 * Get Custom Field IDs for Contacts Module
 * Fetches all custom fields in Contacts module and their input IDs
 */

const axios = require('axios');

const CONFIG = {
  boostSpace: {
    platform: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba'
  }
};

const BOOST_SPACE_API_URL = `${CONFIG.boostSpace.platform}/api`;
const BOOST_SPACE_API_KEY = CONFIG.boostSpace.apiKey;

const boostApi = axios.create({
  baseURL: BOOST_SPACE_API_URL,
  headers: {
    'Authorization': `Bearer ${BOOST_SPACE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function getContactCustomFields() {
  try {
    console.log('🔍 Fetching custom fields for Contacts module...\n');

    // Get all custom field groups
    let fieldGroups = [];
    try {
      const fieldGroupsResponse = await boostApi.get('/api/custom-field');
      fieldGroups = Array.isArray(fieldGroupsResponse.data) ? fieldGroupsResponse.data : [];
    } catch (err) {
      console.log('⚠️  Could not fetch all field groups, trying alternative method...\n');
      // Try fetching known field group IDs
      const knownGroupIds = [475, 479, 477]; // Known field group IDs from docs
      for (const id of knownGroupIds) {
        try {
          const response = await boostApi.get(`/api/custom-field/${id}`);
          fieldGroups.push(response.data);
        } catch (e) {
          // Skip
        }
      }
    }

    console.log(`📊 Found ${fieldGroups.length} custom field groups\n`);

    // Find field groups that are connected to contact module
    const contactFieldGroups = [];
    
    for (const group of fieldGroups) {
      // Get detailed info for this field group
      try {
        const groupId = group.id;
        const groupDetailResponse = await boostApi.get(`/api/custom-field/${groupId}`);
        const groupDetail = groupDetailResponse.data;
        
        // Check if this group is for contact module
        const isContactModule = groupDetail.module === 'contact' || 
                               groupDetail.table === 'contact' ||
                               (groupDetail.appliedModules && groupDetail.appliedModules.includes('contact'));

        if (isContactModule && groupDetail.inputs && groupDetail.inputs.length > 0) {
          contactFieldGroups.push({
            id: groupDetail.id,
            name: groupDetail.name || groupDetail.title || `Group ${groupDetail.id}`,
            inputs: groupDetail.inputs || []
          });
        }
      } catch (err) {
        // Skip if we can't get details
      }
    }

    if (contactFieldGroups.length === 0) {
      console.log('⚠️  No custom field groups found for Contacts module');
      console.log('\n📋 All field groups:');
      fieldGroups.forEach(group => {
        console.log(`   - ${group.name || group.title || `Group ${group.id}`} (ID: ${group.id})`);
      });
      return;
    }

    console.log(`✅ Found ${contactFieldGroups.length} field group(s) with Contact fields:\n`);

    // Display all contact custom fields
    const allFields = [];
    contactFieldGroups.forEach(group => {
      console.log(`📦 Field Group: "${group.name}" (ID: ${group.id})`);
      console.log(`   ${group.inputs.length} field(s):\n`);
      
      group.inputs.forEach(input => {
        const fieldInfo = {
          id: input.id,
          name: input.name || input.title || 'Unnamed',
          type: input.type || 'unknown',
          groupId: group.id,
          groupName: group.name
        };
        allFields.push(fieldInfo);
        
        console.log(`   ✅ ${fieldInfo.name}`);
        console.log(`      ID: ${fieldInfo.id}`);
        console.log(`      Type: ${fieldInfo.type}`);
        console.log('');
      });
    });

    // Look for ElevenLabs-related fields
    console.log('\n🔍 Searching for ElevenLabs-related fields...\n');
    const elevenLabsFields = allFields.filter(f => 
      f.name.toLowerCase().includes('elevenlabs') ||
      f.name.toLowerCase().includes('business_type') ||
      f.name.toLowerCase().includes('top_pains') ||
      f.name.toLowerCase().includes('automation_goal') ||
      f.name.toLowerCase().includes('complexity') ||
      f.name.toLowerCase().includes('price_estimate') ||
      f.name.toLowerCase().includes('timeline') ||
      f.name.toLowerCase().includes('consult') ||
      f.name.toLowerCase().includes('conversation') ||
      f.name.toLowerCase().includes('call_duration')
    );

    if (elevenLabsFields.length > 0) {
      console.log(`✅ Found ${elevenLabsFields.length} potentially ElevenLabs-related field(s):\n`);
      elevenLabsFields.forEach(field => {
        console.log(`   - ${field.name} (ID: ${field.id}, Type: ${field.type})`);
        console.log(`     Group: "${field.groupName}" (ID: ${field.groupId})`);
        console.log('');
      });
    } else {
      console.log('⚠️  No ElevenLabs-related fields found by name search');
      console.log('   Make sure field names match: business_type, top_pains, automation_goal, etc.\n');
    }

    // Generate field mapping for workflow
    console.log('\n📝 Field Mapping for n8n Workflow:\n');
    console.log('const CUSTOM_FIELDS = {');
    allFields.forEach(field => {
      const varName = field.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      console.log(`  ${varName}: ${field.id}, // ${field.name} (${field.type})`);
    });
    console.log('};\n');

  } catch (error) {
    console.error('❌ Error fetching custom fields:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run
getContactCustomFields();




