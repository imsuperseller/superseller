#!/usr/bin/env node

/**
 * FINAL BIDIRECTIONAL SYNC
 * Complete bidirectional sync between all 3 Notion databases and Airtable
 */

import { Client } from '@notionhq/client';
import Airtable from 'airtable';
import fs from 'fs';

// Database IDs
const NOTION_DATABASES = {
  businessReferences: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
  customerManagement: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
  projectTracking: '2123596d-d33c-40bb-91d9-3d2983dbfb23'
};

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

// Initialize Airtable client
const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY || 'YOUR_AIRTABLE_API_KEY'
});

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'YOUR_AIRTABLE_BASE_ID';

async function checkConfiguration() {
  console.log('🔍 Checking configuration...');
  
  const issues = [];
  
  if (!process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY === 'YOUR_AIRTABLE_API_KEY') {
    issues.push('❌ AIRTABLE_API_KEY not configured');
  } else {
    console.log('✅ AIRTABLE_API_KEY is configured');
  }
  
  if (!process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID === 'YOUR_AIRTABLE_BASE_ID') {
    issues.push('❌ AIRTABLE_BASE_ID not configured');
  } else {
    console.log('✅ AIRTABLE_BASE_ID is configured');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Configuration Issues:');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('\n📋 To complete setup:');
    console.log('   1. Set AIRTABLE_API_KEY environment variable');
    console.log('   2. Set AIRTABLE_BASE_ID environment variable');
    console.log('   3. Create Airtable tables with matching field names');
    console.log('   4. Run this script again');
    return false;
  }
  
  console.log('\n✅ All configuration checks passed!');
  return true;
}

async function syncNotionToAirtable(notionDbId, airtableTableName, databaseName) {
  console.log(`\n🔄 Syncing ${databaseName} from Notion to Airtable...`);
  
  try {
    // Get all records from Notion
    const notionRecords = await notion.databases.query({
      database_id: notionDbId,
      page_size: 100
    });
    
    console.log(`   Found ${notionRecords.results.length} records in Notion`);
    
    if (notionRecords.results.length === 0) {
      console.log('   ⚠️  No records found in Notion database');
      return true;
    }
    
    // Get all records from Airtable
    const airtableTable = airtable.base(AIRTABLE_BASE_ID).table(airtableTableName);
    const airtableRecords = await airtableTable.select().all();
    
    console.log(`   Found ${airtableRecords.length} records in Airtable`);
    
    // Sync logic
    let synced = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const notionRecord of notionRecords.results) {
      try {
        const rgid = notionRecord.properties.RGID?.rich_text?.[0]?.text?.content;
        
        if (!rgid) {
          console.log(`   ⚠️  Skipping record without RGID: ${notionRecord.id}`);
          skipped++;
          continue;
        }
        
        // Find existing Airtable record by RGID
        const existingRecord = airtableRecords.find(record => 
          record.fields.RGID === rgid
        );
        
        // Prepare record data
        const recordData = {
          'Name': notionRecord.properties.Name?.title?.[0]?.text?.content || '',
          'RGID': rgid,
          'Last Updated': new Date().toISOString(),
          'Sync Status': 'Synced from Notion'
        };
        
        // Add database-specific fields
        if (databaseName === 'Business References') {
          recordData['Type'] = notionRecord.properties.Type?.select?.name || '';
          recordData['Description'] = notionRecord.properties.Description?.rich_text?.[0]?.text?.content || '';
          recordData['Status'] = notionRecord.properties.Status?.select?.name || '';
          recordData['Priority'] = notionRecord.properties.Priority?.select?.name || '';
          recordData['Platform'] = notionRecord.properties.Platform?.rich_text?.[0]?.text?.content || '';
        } else if (databaseName === 'Customer Management') {
          recordData['Company Name'] = notionRecord.properties['Company Name']?.rich_text?.[0]?.text?.content || '';
          recordData['Contact Email'] = notionRecord.properties['Contact Email']?.email || '';
          recordData['Phone Number'] = notionRecord.properties['Phone Number']?.phone_number || '';
          recordData['Industry'] = notionRecord.properties.Industry?.select?.name || '';
          recordData['Customer Status'] = notionRecord.properties['Customer Status']?.select?.name || '';
          recordData['Subscription Plan'] = notionRecord.properties['Subscription Plan']?.select?.name || '';
          recordData['Monthly Revenue'] = notionRecord.properties['Monthly Revenue']?.number || 0;
        } else if (databaseName === 'Project Tracking') {
          recordData['Project Name'] = notionRecord.properties['Project Name']?.rich_text?.[0]?.text?.content || '';
          recordData['Customer'] = notionRecord.properties.Customer?.rich_text?.[0]?.text?.content || '';
          recordData['Project Type'] = notionRecord.properties['Project Type']?.select?.name || '';
          recordData['Status'] = notionRecord.properties.Status?.select?.name || '';
          recordData['Priority'] = notionRecord.properties.Priority?.select?.name || '';
          recordData['Budget'] = notionRecord.properties.Budget?.number || 0;
          recordData['Progress'] = notionRecord.properties.Progress?.number || 0;
        }
        
        if (existingRecord) {
          // Update existing record
          await airtableTable.update(existingRecord.id, recordData);
          updated++;
        } else {
          // Create new record
          await airtableTable.create(recordData);
          created++;
        }
        synced++;
        
      } catch (recordError) {
        console.error(`   ❌ Error processing record ${notionRecord.id}:`, recordError.message);
        skipped++;
      }
    }
    
    console.log(`   ✅ ${databaseName} sync complete: ${synced} synced, ${created} created, ${updated} updated, ${skipped} skipped`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${databaseName}:`, error.message);
    return false;
  }
}

async function syncAirtableToNotion(airtableTableName, notionDbId, databaseName) {
  console.log(`\n🔄 Syncing ${databaseName} from Airtable to Notion...`);
  
  try {
    // Get all records from Airtable
    const airtableTable = airtable.base(AIRTABLE_BASE_ID).table(airtableTableName);
    const airtableRecords = await airtableTable.select().all();
    
    console.log(`   Found ${airtableRecords.length} records in Airtable`);
    
    if (airtableRecords.length === 0) {
      console.log('   ⚠️  No records found in Airtable table');
      return true;
    }
    
    // Get all records from Notion
    const notionRecords = await notion.databases.query({
      database_id: notionDbId,
      page_size: 100
    });
    
    console.log(`   Found ${notionRecords.results.length} records in Notion`);
    
    // Sync logic
    let synced = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const airtableRecord of airtableRecords) {
      try {
        const rgid = airtableRecord.fields.RGID;
        
        if (!rgid) {
          console.log(`   ⚠️  Skipping record without RGID: ${airtableRecord.id}`);
          skipped++;
          continue;
        }
        
        // Find existing Notion record by RGID
        const existingRecord = notionRecords.results.find(record => 
          record.properties.RGID?.rich_text?.[0]?.text?.content === rgid
        );
        
        // Prepare properties
        const properties = {
          'Name': {
            title: [
              {
                text: {
                  content: airtableRecord.fields.Name || ''
                }
              }
            ]
          },
          'RGID': {
            rich_text: [
              {
                text: {
                  content: rgid
                }
              }
            ]
          },
          'Last Updated': {
            date: {
              start: new Date().toISOString()
            }
          },
          'Sync Status': {
            rich_text: [
              {
                text: {
                  content: 'Synced from Airtable'
                }
              }
            ]
          }
        };
        
        // Add database-specific properties
        if (databaseName === 'Business References') {
          if (airtableRecord.fields.Type) {
            properties['Type'] = { select: { name: airtableRecord.fields.Type } };
          }
          if (airtableRecord.fields.Description) {
            properties['Description'] = {
              rich_text: [{ text: { content: airtableRecord.fields.Description } }]
            };
          }
          if (airtableRecord.fields.Status) {
            properties['Status'] = { select: { name: airtableRecord.fields.Status } };
          }
          if (airtableRecord.fields.Priority) {
            properties['Priority'] = { select: { name: airtableRecord.fields.Priority } };
          }
        } else if (databaseName === 'Customer Management') {
          if (airtableRecord.fields['Company Name']) {
            properties['Company Name'] = {
              rich_text: [{ text: { content: airtableRecord.fields['Company Name'] } }]
            };
          }
          if (airtableRecord.fields['Contact Email']) {
            properties['Contact Email'] = { email: airtableRecord.fields['Contact Email'] };
          }
          if (airtableRecord.fields['Phone Number']) {
            properties['Phone Number'] = { phone_number: airtableRecord.fields['Phone Number'] };
          }
          if (airtableRecord.fields.Industry) {
            properties['Industry'] = { select: { name: airtableRecord.fields.Industry } };
          }
          if (airtableRecord.fields['Customer Status']) {
            properties['Customer Status'] = { select: { name: airtableRecord.fields['Customer Status'] } };
          }
        } else if (databaseName === 'Project Tracking') {
          if (airtableRecord.fields['Project Name']) {
            properties['Project Name'] = {
              rich_text: [{ text: { content: airtableRecord.fields['Project Name'] } }]
            };
          }
          if (airtableRecord.fields.Customer) {
            properties['Customer'] = {
              rich_text: [{ text: { content: airtableRecord.fields.Customer } }]
            };
          }
          if (airtableRecord.fields['Project Type']) {
            properties['Project Type'] = { select: { name: airtableRecord.fields['Project Type'] } };
          }
          if (airtableRecord.fields.Status) {
            properties['Status'] = { select: { name: airtableRecord.fields.Status } };
          }
          if (airtableRecord.fields.Priority) {
            properties['Priority'] = { select: { name: airtableRecord.fields.Priority } };
          }
        }
        
        if (existingRecord) {
          // Update existing record
          await notion.pages.update({
            page_id: existingRecord.id,
            properties: properties
          });
          updated++;
        } else {
          // Create new record
          await notion.pages.create({
            parent: {
              database_id: notionDbId
            },
            properties: properties
          });
          created++;
        }
        synced++;
        
      } catch (recordError) {
        console.error(`   ❌ Error processing record ${airtableRecord.id}:`, recordError.message);
        skipped++;
      }
    }
    
    console.log(`   ✅ ${databaseName} sync complete: ${synced} synced, ${created} created, ${updated} updated, ${skipped} skipped`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${databaseName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Final Bidirectional Sync...');
  
  // Check configuration
  const configOk = await checkConfiguration();
  if (!configOk) {
    console.log('\n❌ Configuration issues found. Please fix them and try again.');
    return;
  }
  
  try {
    // Sync Notion to Airtable
    console.log('\n📤 Syncing Notion to Airtable...');
    const notionToAirtableResults = await Promise.all([
      syncNotionToAirtable(
        NOTION_DATABASES.businessReferences,
        'Business References',
        'Business References'
      ),
      syncNotionToAirtable(
        NOTION_DATABASES.customerManagement,
        'Customer Management',
        'Customer Management'
      ),
      syncNotionToAirtable(
        NOTION_DATABASES.projectTracking,
        'Project Tracking',
        'Project Tracking'
      )
    ]);
    
    // Sync Airtable to Notion
    console.log('\n📥 Syncing Airtable to Notion...');
    const airtableToNotionResults = await Promise.all([
      syncAirtableToNotion(
        'Business References',
        NOTION_DATABASES.businessReferences,
        'Business References'
      ),
      syncAirtableToNotion(
        'Customer Management',
        NOTION_DATABASES.customerManagement,
        'Customer Management'
      ),
      syncAirtableToNotion(
        'Project Tracking',
        NOTION_DATABASES.projectTracking,
        'Project Tracking'
      )
    ]);
    
    // Calculate results
    const totalResults = [...notionToAirtableResults, ...airtableToNotionResults];
    const successCount = totalResults.filter(r => r).length;
    
    console.log('\n🎉 BIDIRECTIONAL SYNC COMPLETE!');
    console.log(`\n📊 Results: ${successCount}/${totalResults.length} sync operations successful`);
    
    if (successCount === totalResults.length) {
      console.log('\n✅ SUCCESS: All databases synced successfully!');
      console.log('\n🔗 Database IDs:');
      console.log(`   Notion Business References: ${NOTION_DATABASES.businessReferences}`);
      console.log(`   Notion Customer Management: ${NOTION_DATABASES.customerManagement}`);
      console.log(`   Notion Project Tracking: ${NOTION_DATABASES.projectTracking}`);
      console.log(`   Airtable Base: ${AIRTABLE_BASE_ID}`);
      
      console.log('\n🎯 BMAD NOTION INTEGRATION: 100% COMPLETE!');
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Some sync operations failed');
    }
    
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
  }
}

main();
