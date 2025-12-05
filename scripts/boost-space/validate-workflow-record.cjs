#!/usr/bin/env node

/**
 * Validate INT-LEAD-001 record in Boost.space
 * Checks that all fields are populated correctly and no Airtable references exist
 */

const axios = require('axios');

const CONFIG = {
  boostSpace: {
    platform: 'https://superseller.boost.space',
    apiKey: '88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba',
    fieldGroupId: 475,
    recordId: 13
  }
};

async function validate() {
  console.log('\n🔍 Validating INT-LEAD-001 Record in Boost.space\n');
  console.log('='.repeat(80));
  
  const api = axios.create({
    baseURL: CONFIG.boostSpace.platform,
    headers: {
      'Authorization': `Bearer ${CONFIG.boostSpace.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Get field group to map field names to IDs
  console.log('\n📋 Step 1: Getting field definitions...');
  const fieldGroupResponse = await api.get(`/api/custom-field/${CONFIG.boostSpace.fieldGroupId}`);
  const fields = fieldGroupResponse.data.inputs || [];
  const fieldMap = {};
  fields.forEach(field => {
    fieldMap[field.name] = { id: field.id, boostId: field.boostId, type: field.inputType };
  });
  
  console.log(`✅ Found ${fields.length} fields in field group`);
  
  // Get the record
  console.log('\n📋 Step 2: Getting record...');
  const recordResponse = await api.get(`/api/custom-module-item/${CONFIG.boostSpace.recordId}`);
  const record = recordResponse.data;
  
  console.log(`✅ Record ID: ${record.id}`);
  console.log(`   Space ID: ${record.spaceId}`);
  console.log(`   Created: ${record.created}`);
  
  // Check custom fields
  console.log('\n📋 Step 3: Validating custom fields...');
  const customFields = record.customFieldsValues || [];
  console.log(`   Custom fields populated: ${customFields.length}`);
  
  if (customFields.length === 0) {
    console.log('\n❌ VALIDATION FAILED: No custom fields populated!');
    console.log('   The record exists but customFieldsValues is empty.');
    console.log('   This means the fields were not saved correctly.');
    return { valid: false, reason: 'No custom fields populated' };
  }
  
  // Map values by field name
  const valuesByFieldName = {};
  customFields.forEach(cf => {
    const field = fields.find(f => f.id === cf.customFieldId);
    if (field) {
      valuesByFieldName[field.name] = cf.value;
    }
  });
  
  // Check for Airtable references
  console.log('\n📋 Step 4: Checking for Airtable references...');
  const airtableReferences = [];
  Object.entries(valuesByFieldName).forEach(([fieldName, value]) => {
    if (value && typeof value === 'string' && value.toLowerCase().includes('airtable')) {
      airtableReferences.push({ field: fieldName, value: value.substring(0, 100) });
    }
  });
  
  if (airtableReferences.length > 0) {
    console.log(`\n❌ Found ${airtableReferences.length} Airtable references:`);
    airtableReferences.forEach(ref => {
      console.log(`   - ${ref.field}: ${ref.value}`);
    });
    return { valid: false, reason: 'Airtable references found', references: airtableReferences };
  } else {
    console.log('✅ No Airtable references found');
  }
  
  // Check for Boost.space references
  console.log('\n📋 Step 5: Checking for Boost.space references...');
  const boostSpaceReferences = [];
  Object.entries(valuesByFieldName).forEach(([fieldName, value]) => {
    if (value && typeof value === 'string' && value.toLowerCase().includes('boost.space')) {
      boostSpaceReferences.push({ field: fieldName });
    }
  });
  
  if (boostSpaceReferences.length > 0) {
    console.log(`✅ Found ${boostSpaceReferences.length} Boost.space references (correct)`);
  } else {
    console.log('⚠️  No Boost.space references found in populated fields');
  }
  
  // Check key fields
  console.log('\n📋 Step 6: Checking key fields...');
  const keyFields = {
    workflow_name: valuesByFieldName.workflow_name,
    workflow_id: valuesByFieldName.workflow_id,
    category: valuesByFieldName.category,
    status: valuesByFieldName.status,
    description: valuesByFieldName.description ? valuesByFieldName.description.substring(0, 50) + '...' : null
  };
  
  console.log('   Key fields:');
  Object.entries(keyFields).forEach(([field, value]) => {
    if (value) {
      console.log(`   ✅ ${field}: ${value}`);
    } else {
      console.log(`   ⚠️  ${field}: (empty)`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 VALIDATION SUMMARY\n');
  console.log(`   Total fields in group: ${fields.length}`);
  console.log(`   Fields populated: ${customFields.length}`);
  console.log(`   Airtable references: ${airtableReferences.length} ❌`);
  console.log(`   Boost.space references: ${boostSpaceReferences.length} ✅`);
  console.log(`   Key fields populated: ${Object.values(keyFields).filter(v => v).length}/${Object.keys(keyFields).length}`);
  
  if (customFields.length === 0) {
    console.log('\n❌ VALIDATION FAILED: Record exists but no custom fields are populated');
    console.log('   The API call succeeded but fields were not saved.');
    console.log('   This suggests the API format for custom fields may be incorrect.');
    return { valid: false, reason: 'No custom fields saved' };
  }
  
  if (airtableReferences.length > 0) {
    console.log('\n❌ VALIDATION FAILED: Airtable references still present');
    return { valid: false, reason: 'Airtable references found' };
  }
  
  console.log('\n✅ VALIDATION PASSED: Record is correctly populated with Boost.space references');
  return { valid: true, fieldsPopulated: customFields.length, totalFields: fields.length };
}

validate().catch(error => {
  console.error('\n❌ Validation error:', error.message);
  if (error.response) {
    console.error('   Status:', error.response.status);
    console.error('   Data:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
});
