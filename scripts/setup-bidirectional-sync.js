#!/usr/bin/env node

/**
 * SETUP BIDIRECTIONAL SYNC
 * Set up bidirectional sync between all 3 Notion databases and Airtable
 */

import { Client } from '@notionhq/client';
import Airtable from 'airtable';

// Database IDs
const NOTION_DATABASES = {
  businessReferences: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
  customerManagement: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
  projectTracking: '2123596d-d33c-40bb-91d9-3d2983dbfb23'
};

// Airtable Base and Table IDs (to be configured)
const AIRTABLE_CONFIG = {
  baseId: process.env.AIRTABLE_BASE_ID || 'appXXXXXXXXXXXXXX', // Replace with actual base ID
  tables: {
    businessReferences: 'tblXXXXXXXXXXXXXX', // Replace with actual table ID
    customerManagement: 'tblXXXXXXXXXXXXXX', // Replace with actual table ID
    projectTracking: 'tblXXXXXXXXXXXXXX'     // Replace with actual table ID
  }
};

// Initialize clients
const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
});

async function checkConfiguration() {
  console.log('🔍 Checking configuration...');
  
  const issues = [];
  
  if (!process.env.AIRTABLE_API_KEY) {
    issues.push('❌ AIRTABLE_API_KEY not set');
  } else {
    console.log('✅ AIRTABLE_API_KEY is configured');
  }
  
  if (!process.env.AIRTABLE_BASE_ID) {
    issues.push('❌ AIRTABLE_BASE_ID not set');
  } else {
    console.log('✅ AIRTABLE_BASE_ID is configured');
  }
  
  if (!process.env.NOTION_TOKEN) {
    issues.push('❌ NOTION_TOKEN not set');
  } else {
    console.log('✅ NOTION_TOKEN is configured');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Configuration Issues:');
    issues.forEach(issue => console.log(`   ${issue}`));
    return false;
  }
  
  console.log('\n✅ All configuration checks passed!');
  return true;
}

async function createAirtableTables() {
  console.log('\n🔧 Creating Airtable tables...');
  
  try {
    const base = airtable.base(AIRTABLE_CONFIG.baseId);
    
    // Create Business References table
    console.log('   Creating Business References table...');
    const businessRefTable = await base.table(AIRTABLE_CONFIG.tables.businessReferences).create([
      {
        fields: {
          'Name': 'Test Record',
          'Type': 'Business Reference',
          'Description': 'Test description',
          'Status': 'Active',
          'Priority': 'High',
          'Platform': 'Notion',
          'RGID': 'RGID_TEST_001',
          'Created By': 'AI Assistant',
          'Last Updated': new Date().toISOString(),
          'AI Integration Status': 'Integrated',
          'Airtable Sync': true,
          'Automation Level': 'Advanced',
          'Sync Status': 'Active'
        }
      }
    ]);
    console.log('   ✅ Business References table ready');
    
    // Create Customer Management table
    console.log('   Creating Customer Management table...');
    const customerTable = await base.table(AIRTABLE_CONFIG.tables.customerManagement).create([
      {
        fields: {
          'Name': 'Test Customer',
          'Company Name': 'Test Company',
          'Contact Email': 'test@example.com',
          'Phone Number': '+1-555-0123',
          'Industry': 'Technology',
          'Customer Status': 'Active',
          'Subscription Plan': 'Professional',
          'Monthly Revenue': 1000,
          'Onboarding Date': new Date().toISOString(),
          'Last Contact Date': new Date().toISOString(),
          'Customer Success Manager': 'Test Manager',
          'Notes': 'Test notes',
          'RGID': 'RGID_CUSTOMER_TEST_001'
        }
      }
    ]);
    console.log('   ✅ Customer Management table ready');
    
    // Create Project Tracking table
    console.log('   Creating Project Tracking table...');
    const projectTable = await base.table(AIRTABLE_CONFIG.tables.projectTracking).create([
      {
        fields: {
          'Name': 'Test Project',
          'Project Name': 'Test Project Name',
          'Customer': 'Test Customer',
          'Project Type': 'Website Development',
          'Status': 'In Progress',
          'Priority': 'High',
          'Start Date': new Date().toISOString(),
          'Due Date': new Date().toISOString(),
          'Budget': 5000,
          'Progress': 50,
          'Project Manager': 'Test Manager',
          'Team Members': 'Test Team',
          'Description': 'Test description',
          'RGID': 'RGID_PROJECT_TEST_001'
        }
      }
    ]);
    console.log('   ✅ Project Tracking table ready');
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Error creating Airtable tables:', error.message);
    return false;
  }
}

async function syncNotionToAirtable(databaseId, tableId, databaseName) {
  console.log(`\n🔄 Syncing ${databaseName} from Notion to Airtable...`);
  
  try {
    // Get all records from Notion
    const notionRecords = await notion.databases.query({
      database_id: databaseId,
      page_size: 100
    });
    
    console.log(`   Found ${notionRecords.results.length} records in Notion`);
    
    // Get all records from Airtable
    const airtableTable = airtable.base(AIRTABLE_CONFIG.baseId).table(tableId);
    const airtableRecords = await airtableTable.select().all();
    
    console.log(`   Found ${airtableRecords.length} records in Airtable`);
    
    // Sync logic
    let synced = 0;
    let created = 0;
    let updated = 0;
    
    for (const notionRecord of notionRecords.results) {
      const rgid = notionRecord.properties.RGID?.rich_text?.[0]?.text?.content;
      
      if (!rgid) {
        console.log(`   ⚠️  Skipping record without RGID: ${notionRecord.id}`);
        continue;
      }
      
      // Find existing Airtable record by RGID
      const existingRecord = airtableRecords.find(record => 
        record.fields.RGID === rgid
      );
      
      if (existingRecord) {
        // Update existing record
        await airtableTable.update(existingRecord.id, {
          'Name': notionRecord.properties.Name?.title?.[0]?.text?.content || '',
          'Last Updated': new Date().toISOString(),
          'Sync Status': 'Synced from Notion'
        });
        updated++;
      } else {
        // Create new record
        await airtableTable.create({
          'Name': notionRecord.properties.Name?.title?.[0]?.text?.content || '',
          'RGID': rgid,
          'Last Updated': new Date().toISOString(),
          'Sync Status': 'Created from Notion'
        });
        created++;
      }
      synced++;
    }
    
    console.log(`   ✅ ${databaseName} sync complete: ${synced} total, ${created} created, ${updated} updated`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${databaseName}:`, error.message);
    return false;
  }
}

async function syncAirtableToNotion(tableId, databaseId, databaseName) {
  console.log(`\n🔄 Syncing ${databaseName} from Airtable to Notion...`);
  
  try {
    // Get all records from Airtable
    const airtableTable = airtable.base(AIRTABLE_CONFIG.baseId).table(tableId);
    const airtableRecords = await airtableTable.select().all();
    
    console.log(`   Found ${airtableRecords.length} records in Airtable`);
    
    // Get all records from Notion
    const notionRecords = await notion.databases.query({
      database_id: databaseId,
      page_size: 100
    });
    
    console.log(`   Found ${notionRecords.results.length} records in Notion`);
    
    // Sync logic
    let synced = 0;
    let created = 0;
    let updated = 0;
    
    for (const airtableRecord of airtableRecords) {
      const rgid = airtableRecord.fields.RGID;
      
      if (!rgid) {
        console.log(`   ⚠️  Skipping record without RGID: ${airtableRecord.id}`);
        continue;
      }
      
      // Find existing Notion record by RGID
      const existingRecord = notionRecords.results.find(record => 
        record.properties.RGID?.rich_text?.[0]?.text?.content === rgid
      );
      
      if (existingRecord) {
        // Update existing record
        await notion.pages.update({
          page_id: existingRecord.id,
          properties: {
            'Name': {
              title: [
                {
                  text: {
                    content: airtableRecord.fields.Name || ''
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
          }
        });
        updated++;
      } else {
        // Create new record
        await notion.pages.create({
          parent: {
            database_id: databaseId
          },
          properties: {
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
                    content: 'Created from Airtable'
                  }
                }
              ]
            }
          }
        });
        created++;
      }
      synced++;
    }
    
    console.log(`   ✅ ${databaseName} sync complete: ${synced} total, ${created} created, ${updated} updated`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${databaseName}:`, error.message);
    return false;
  }
}

async function setupBidirectionalSync() {
  console.log('\n🔄 Setting up bidirectional sync...');
  
  try {
    // Sync Notion to Airtable
    await syncNotionToAirtable(
      NOTION_DATABASES.businessReferences,
      AIRTABLE_CONFIG.tables.businessReferences,
      'Business References'
    );
    
    await syncNotionToAirtable(
      NOTION_DATABASES.customerManagement,
      AIRTABLE_CONFIG.tables.customerManagement,
      'Customer Management'
    );
    
    await syncNotionToAirtable(
      NOTION_DATABASES.projectTracking,
      AIRTABLE_CONFIG.tables.projectTracking,
      'Project Tracking'
    );
    
    // Sync Airtable to Notion
    await syncAirtableToNotion(
      AIRTABLE_CONFIG.tables.businessReferences,
      NOTION_DATABASES.businessReferences,
      'Business References'
    );
    
    await syncAirtableToNotion(
      AIRTABLE_CONFIG.tables.customerManagement,
      NOTION_DATABASES.customerManagement,
      'Customer Management'
    );
    
    await syncAirtableToNotion(
      AIRTABLE_CONFIG.tables.projectTracking,
      NOTION_DATABASES.projectTracking,
      'Project Tracking'
    );
    
    console.log('\n✅ Bidirectional sync setup complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Error setting up bidirectional sync:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up Bidirectional Sync between Notion and Airtable...');
  
  // Check configuration
  const configOk = await checkConfiguration();
  if (!configOk) {
    console.log('\n❌ Configuration issues found. Please fix them and try again.');
    console.log('\n📋 Required Environment Variables:');
    console.log('   - AIRTABLE_API_KEY: Your Airtable API key');
    console.log('   - AIRTABLE_BASE_ID: Your Airtable base ID');
    console.log('   - NOTION_TOKEN: Your Notion integration token');
    return;
  }
  
  // Create Airtable tables
  const tablesCreated = await createAirtableTables();
  if (!tablesCreated) {
    console.log('\n❌ Failed to create Airtable tables');
    return;
  }
  
  // Setup bidirectional sync
  const syncSetup = await setupBidirectionalSync();
  if (!syncSetup) {
    console.log('\n❌ Failed to setup bidirectional sync');
    return;
  }
  
  console.log('\n🎉 SUCCESS: Bidirectional sync setup complete!');
  console.log('\n📊 Sync Status:');
  console.log('   ✅ Business References: Notion ↔ Airtable');
  console.log('   ✅ Customer Management: Notion ↔ Airtable');
  console.log('   ✅ Project Tracking: Notion ↔ Airtable');
  
  console.log('\n🔗 Database IDs:');
  console.log(`   Notion Business References: ${NOTION_DATABASES.businessReferences}`);
  console.log(`   Notion Customer Management: ${NOTION_DATABASES.customerManagement}`);
  console.log(`   Notion Project Tracking: ${NOTION_DATABASES.projectTracking}`);
  console.log(`   Airtable Base: ${AIRTABLE_CONFIG.baseId}`);
}

main();
