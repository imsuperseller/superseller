#!/usr/bin/env node

/**
 * COMPREHENSIVE NOTION VERIFICATION
 * Thoroughly verify all Notion databases are properly set up and populated
 */

import { Client as NotionClient } from '@notionhq/client';

console.log('🔍 COMPREHENSIVE NOTION VERIFICATION...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

// Database configurations
const databases = [
  {
    name: 'Rensto Business References',
    database_id: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    expected_fields: [
      'Name', 'Type', 'Description', 'Status', 'Priority', 'Platform',
      'AI Integration Status', 'Automation Level', 'Last Updated', 'Created By',
      'Airtable Sync', 'Sync Status', 'RGID'
    ]
  },
  {
    name: 'Rensto Customer Management',
    database_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    expected_fields: [
      'Name', 'Company Name', 'Contact Email', 'Phone Number', 'Industry',
      'Customer Status', 'Subscription Plan', 'Monthly Revenue', 'Onboarding Date',
      'Last Contact Date', 'Customer Success Manager', 'Notes', 'RGID'
    ]
  },
  {
    name: 'Rensto Project Tracking',
    database_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    expected_fields: [
      'Name', 'Project Name', 'Customer', 'Project Type', 'Status', 'Priority',
      'Start Date', 'Due Date', 'Budget', 'Progress', 'Project Manager',
      'Team Members', 'Description', 'RGID'
    ]
  }
];

async function verifyDatabase(dbConfig) {
  console.log(`\n📊 VERIFYING: ${dbConfig.name}`);
  console.log(`   Database ID: ${dbConfig.database_id}`);
  
  try {
    // Get the data source
    const response = await notion.request({
      method: "GET",
      path: `databases/${dbConfig.database_id}`,
    });
    
    const dataSource = response.data_sources[0];
    console.log(`   ✅ Data source found: ${dataSource.name} (${dataSource.id})`);
    
    // Get data source structure
    const dataSourceResponse = await notion.request({
      method: "GET",
      path: `data_sources/${dataSource.id}`,
    });
    
    const properties = dataSourceResponse.properties || {};
    const actualFields = Object.keys(properties);
    
    console.log(`\n   📋 FIELD VERIFICATION:`);
    console.log(`   Expected fields: ${dbConfig.expected_fields.length}`);
    console.log(`   Actual fields: ${actualFields.length}`);
    
    // Check each expected field
    let missingFields = [];
    let extraFields = [];
    
    for (const expectedField of dbConfig.expected_fields) {
      if (actualFields.includes(expectedField)) {
        const fieldType = properties[expectedField].type;
        console.log(`      ✅ ${expectedField}: ${fieldType}`);
        
        // Show options for select fields
        if (fieldType === 'select' && properties[expectedField].select?.options) {
          const options = properties[expectedField].select.options.map(opt => opt.name).join(', ');
          console.log(`         Options: ${options}`);
        }
      } else {
        console.log(`      ❌ MISSING: ${expectedField}`);
        missingFields.push(expectedField);
      }
    }
    
    // Check for extra fields
    for (const actualField of actualFields) {
      if (!dbConfig.expected_fields.includes(actualField)) {
        console.log(`      ⚠️  EXTRA: ${actualField} (${properties[actualField].type})`);
        extraFields.push(actualField);
      }
    }
    
    // Get all records
    console.log(`\n   📄 RECORD VERIFICATION:`);
    const recordsResponse = await notion.request({
      method: "POST",
      path: `data_sources/${dataSource.id}/query`,
      body: { page_size: 100 }
    });
    
    const records = recordsResponse.results;
    console.log(`   Total records: ${records.length}`);
    
    // Analyze record completeness
    let completeRecords = 0;
    let incompleteRecords = 0;
    let recordsWithRGID = 0;
    let recordsWithoutRGID = 0;
    
    console.log(`\n   📊 RECORD ANALYSIS:`);
    
    for (let i = 0; i < Math.min(records.length, 10); i++) {
      const record = records[i];
      const recordName = record.properties.Name?.title?.[0]?.plain_text || 
                        record.properties.Title?.title?.[0]?.plain_text || 
                        `Record ${i + 1}`;
      
      // Check if record has RGID
      const hasRGID = record.properties.RGID?.rich_text?.[0]?.plain_text;
      if (hasRGID) {
        recordsWithRGID++;
      } else {
        recordsWithoutRGID++;
        console.log(`      ⚠️  Record without RGID: ${recordName}`);
      }
      
      // Check field completeness
      let populatedFields = 0;
      let totalFields = 0;
      
      for (const fieldName of dbConfig.expected_fields) {
        if (fieldName === 'Name') continue; // Skip title field
        totalFields++;
        
        const field = record.properties[fieldName];
        let hasValue = false;
        
        if (field) {
          switch (field.type) {
            case 'rich_text':
              hasValue = field.rich_text?.[0]?.plain_text;
              break;
            case 'title':
              hasValue = field.title?.[0]?.plain_text;
              break;
            case 'select':
              hasValue = field.select?.name;
              break;
            case 'number':
              hasValue = field.number !== null && field.number !== undefined;
              break;
            case 'date':
              hasValue = field.date?.start;
              break;
            case 'checkbox':
              hasValue = true; // Checkbox always has a value
              break;
            case 'email':
              hasValue = field.email;
              break;
            case 'phone_number':
              hasValue = field.phone_number;
              break;
          }
        }
        
        if (hasValue) {
          populatedFields++;
        }
      }
      
      const completeness = (populatedFields / totalFields) * 100;
      if (completeness >= 80) {
        completeRecords++;
      } else {
        incompleteRecords++;
        console.log(`      ⚠️  Incomplete record: ${recordName} (${completeness.toFixed(1)}% complete)`);
      }
      
      if (i < 5) { // Show details for first 5 records
        console.log(`      ${i + 1}. ${recordName} - ${completeness.toFixed(1)}% complete`);
      }
    }
    
    if (records.length > 10) {
      console.log(`      ... and ${records.length - 10} more records`);
    }
    
    console.log(`\n   📈 SUMMARY:`);
    console.log(`      Complete records: ${completeRecords}/${records.length}`);
    console.log(`      Incomplete records: ${incompleteRecords}/${records.length}`);
    console.log(`      Records with RGID: ${recordsWithRGID}/${records.length}`);
    console.log(`      Records without RGID: ${recordsWithoutRGID}/${records.length}`);
    console.log(`      Missing fields: ${missingFields.length}`);
    console.log(`      Extra fields: ${extraFields.length}`);
    
    // Overall status
    const fieldStatus = missingFields.length === 0 ? '✅' : '❌';
    const recordStatus = incompleteRecords === 0 ? '✅' : '⚠️';
    const rgidStatus = recordsWithoutRGID === 0 ? '✅' : '⚠️';
    
    console.log(`\n   🎯 OVERALL STATUS:`);
    console.log(`      Fields: ${fieldStatus} ${missingFields.length === 0 ? 'All fields present' : `${missingFields.length} missing`}`);
    console.log(`      Records: ${recordStatus} ${incompleteRecords === 0 ? 'All records complete' : `${incompleteRecords} incomplete`}`);
    console.log(`      RGIDs: ${rgidStatus} ${recordsWithoutRGID === 0 ? 'All records have RGID' : `${recordsWithoutRGID} missing RGID`}`);
    
    return {
      name: dbConfig.name,
      fields: { expected: dbConfig.expected_fields.length, actual: actualFields.length, missing: missingFields },
      records: { total: records.length, complete: completeRecords, incomplete: incompleteRecords },
      rgids: { with: recordsWithRGID, without: recordsWithoutRGID },
      status: {
        fields: missingFields.length === 0,
        records: incompleteRecords === 0,
        rgids: recordsWithoutRGID === 0
      }
    };
    
  } catch (error) {
    console.error(`   ❌ Error verifying ${dbConfig.name}: ${error.message}`);
    return {
      name: dbConfig.name,
      error: error.message,
      status: { fields: false, records: false, rgids: false }
    };
  }
}

async function main() {
  console.log('🚀 Starting comprehensive Notion verification...');
  
  if (!process.env.NOTION_TOKEN) {
    console.error('❌ Error: NOTION_TOKEN environment variable must be set.');
    process.exit(1);
  }
  
  const results = [];
  
  for (const dbConfig of databases) {
    const result = await verifyDatabase(dbConfig);
    results.push(result);
  }
  
  // Overall summary
  console.log('\n' + '='.repeat(80));
  console.log('🎯 COMPREHENSIVE VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  
  let totalFieldsExpected = 0;
  let totalFieldsActual = 0;
  let totalRecords = 0;
  let totalCompleteRecords = 0;
  let totalRGIDs = 0;
  let totalWithoutRGIDs = 0;
  
  for (const result of results) {
    if (result.error) {
      console.log(`\n❌ ${result.name}: ERROR - ${result.error}`);
      continue;
    }
    
    totalFieldsExpected += result.fields.expected;
    totalFieldsActual += result.fields.actual;
    totalRecords += result.records.total;
    totalCompleteRecords += result.records.complete;
    totalRGIDs += result.rgids.with;
    totalWithoutRGIDs += result.rgids.without;
    
    const status = result.status.fields && result.status.records && result.status.rgids ? '✅ COMPLETE' : '⚠️ NEEDS ATTENTION';
    console.log(`\n${status} ${result.name}:`);
    console.log(`   Fields: ${result.fields.actual}/${result.fields.expected} (${result.fields.missing.length} missing)`);
    console.log(`   Records: ${result.records.complete}/${result.records.total} complete`);
    console.log(`   RGIDs: ${result.rgids.with}/${result.rgids.with + result.rgids.without} have RGID`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 OVERALL STATISTICS:');
  console.log(`   Total Fields: ${totalFieldsActual}/${totalFieldsExpected}`);
  console.log(`   Total Records: ${totalRecords} (${totalCompleteRecords} complete)`);
  console.log(`   RGID Coverage: ${totalRGIDs}/${totalRGIDs + totalWithoutRGIDs}`);
  
  const overallStatus = totalFieldsActual === totalFieldsExpected && 
                       totalCompleteRecords === totalRecords && 
                       totalWithoutRGIDs === 0;
  
  console.log('\n🎯 FINAL STATUS:');
  if (overallStatus) {
    console.log('✅ ALL DATABASES ARE COMPLETE AND READY FOR PRODUCTION!');
  } else {
    console.log('⚠️ SOME DATABASES NEED ATTENTION - SEE DETAILS ABOVE');
  }
  
  console.log('\n🚀 Verification complete!');
}

main().catch(console.error);
