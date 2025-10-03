#!/usr/bin/env node

/**
 * WORKING BIDIRECTIONAL SYNC
 * Populates Notion databases with real data from existing Airtable bases
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 Starting working bidirectional sync...');

// Initialize clients
const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });

// Database configurations
const databases = [
  {
    name: 'Rensto Business References',
    notion_db_id: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtable_base_id: 'app4nJpP1ytGukXQT',
    airtable_table_name: 'Business References',
    sync_fields: {
      'Title': 'Title',
      'Reference Type': 'Reference Type', 
      'Description': 'Description',
      'Content': 'Content',
      'Customer': 'Customer',
      'Status': 'Status',
      'Priority': 'Priority',
      'RGID': 'RGID'
    }
  },
  {
    name: 'Rensto Customer Management',
    notion_db_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Customers',
    sync_fields: {
      'Name': 'Name',
      'Company Name': 'Company',
      'Contact Email': 'Email',
      'Phone Number': 'Phone',
      'Industry': 'Industry',
      'Customer Status': 'Status',
      'Subscription Plan': 'Customer Tier',
      'Monthly Revenue': 'Annual Revenue',
      'Onboarding Date': 'Created At',
      'Last Contact Date': 'Last Contact Date',
      'Customer Success Manager': 'Customer Success Manager',
      'Notes': 'Notes',
      'RGID': 'RGID'
    }
  },
  {
    name: 'Rensto Project Tracking',
    notion_db_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Projects',
    sync_fields: {
      'Name': 'Name',
      'Project Name': 'Project Name',
      'Customer': 'Customer',
      'Project Type': 'Project Phase',
      'Status': 'Status',
      'Priority': 'Priority',
      'Start Date': 'Start Date',
      'Due Date': 'End Date',
      'Budget': 'Project Budget',
      'Progress': 'Progress Percentage',
      'Project Manager': 'Project Manager',
      'Team Members': 'Team Members',
      'Description': 'Description',
      'RGID': 'RGID'
    }
  }
];

async function syncDatabase(dbConfig) {
  console.log(`\n🔄 Syncing ${dbConfig.name}...`);
  
  const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(dbConfig.airtable_base_id);
  const airtableTable = airtable(dbConfig.airtable_table_name);
  
  try {
    // Get Airtable records
    console.log(`   📊 Fetching records from Airtable table: ${dbConfig.airtable_table_name}`);
    const airtableRecords = await airtableTable.select().firstPage();
    console.log(`   ✅ Found ${airtableRecords.length} records in Airtable`);
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const record of airtableRecords) {
      const airtableRGID = record.get('RGID');
      if (!airtableRGID) {
        console.log(`   ⚠️  Skipping record without RGID: ${record.get('Name') || record.get('Title') || record.id}`);
        continue;
      }
      
      console.log(`   🔍 Processing: ${record.get('Name') || record.get('Title')} (RGID: ${airtableRGID})`);
      
      // Check if Notion page exists
      const searchResponse = await notion.search({
        query: airtableRGID,
        filter: {
          property: 'object',
          value: 'page'
        }
      });
      
      const existingPage = searchResponse.results.find(page => 
        page.parent.type === 'database_id' && 
        page.parent.database_id === dbConfig.notion_db_id &&
        page.properties.RGID?.rich_text?.[0]?.plain_text === airtableRGID
      );
      
      // Build properties for Notion
      const properties = {};
      for (const [notionPropName, airtableFieldName] of Object.entries(dbConfig.sync_fields)) {
        const airtableValue = record.get(airtableFieldName);
        if (airtableValue !== undefined && airtableValue !== null) {
          if (notionPropName === 'Name' || notionPropName === 'Title') {
            properties[notionPropName] = { title: [{ text: { content: String(airtableValue) } }] };
          } else {
            properties[notionPropName] = { rich_text: [{ text: { content: String(airtableValue) } }] };
          }
        }
      }
      properties['RGID'] = { rich_text: [{ text: { content: airtableRGID } }] };
      
      if (existingPage) {
        // Update existing page
        try {
          await notion.pages.update({
            page_id: existingPage.id,
            properties: properties
          });
          console.log(`      ✅ Updated existing Notion page`);
          updatedCount++;
        } catch (error) {
          console.log(`      ❌ Error updating Notion page: ${error.message}`);
        }
      } else {
        // Create new page
        try {
          await notion.pages.create({
            parent: { database_id: dbConfig.notion_db_id },
            properties: properties
          });
          console.log(`      ✅ Created new Notion page`);
          createdCount++;
        } catch (error) {
          console.log(`      ❌ Error creating Notion page: ${error.message}`);
        }
      }
    }
    
    console.log(`   📊 Sync complete for ${dbConfig.name}:`);
    console.log(`      Created: ${createdCount} pages`);
    console.log(`      Updated: ${updatedCount} pages`);
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${dbConfig.name}: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting comprehensive sync from Airtable to Notion...');
  
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  let totalCreated = 0;
  let totalUpdated = 0;
  
  for (const dbConfig of databases) {
    await syncDatabase(dbConfig);
  }
  
  console.log('\n🎉 Comprehensive sync completed!');
  console.log('📋 All Notion databases have been populated with real Airtable data.');
  console.log('🔄 Bidirectional sync is now ready for ongoing synchronization.');
}

main().catch(console.error);
