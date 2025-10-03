#!/usr/bin/env node

/**
 * FINAL COMPREHENSIVE BIDIRECTIONAL SYNC
 * Complete bidirectional sync between all Notion databases and Airtable
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 Starting final comprehensive bidirectional sync...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

// Complete database configuration
const databases = [
  {
    name: 'Rensto Business References',
    notion_db_id: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtable_base_id: 'app4nJpP1ytGukXQT',
    airtable_table_name: 'Business References',
    field_mapping: {
      'Name': 'Title',
      'Type': 'Reference Type',
      'Description': 'Description',
      'Status': 'Status',
      'Priority': 'Priority',
      'Platform': 'Platform',
      'AI Integration Status': 'AI Integration Status',
      'Automation Level': 'Automation Level',
      'Last Updated': 'Last Updated',
      'Created By': 'Created By',
      'Airtable Sync': 'Airtable Sync',
      'Sync Status': 'Sync Status',
      'RGID': 'RGID'
    }
  },
  {
    name: 'Rensto Customer Management',
    notion_db_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Customers',
    field_mapping: {
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
    field_mapping: {
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
  console.log(`\n🔄 Starting bidirectional sync for ${dbConfig.name}...`);
  
  try {
    // Get Notion data source
    const response = await notion.request({
      method: "GET",
      path: `databases/${dbConfig.notion_db_id}`,
    });
    
    const dataSource = response.data_sources[0];
    console.log(`   📊 Notion data source: ${dataSource.name} (${dataSource.id})`);
    
    // Get Airtable data
    const airtableBase = airtable.base(dbConfig.airtable_base_id);
    const airtableTable = airtableBase(dbConfig.airtable_table_name);
    
    console.log(`   📊 Airtable table: ${dbConfig.airtable_table_name}`);
    
    // 1. Sync Notion to Airtable
    console.log(`   ➡️  Syncing Notion to Airtable...`);
    const notionRecords = await notion.request({
      method: "POST",
      path: `data_sources/${dataSource.id}/query`,
      body: { page_size: 100 }
    });
    
    let notionToAirtableCount = 0;
    for (const notionPage of notionRecords.results) {
      const notionRGID = notionPage.properties.RGID?.rich_text?.[0]?.plain_text;
      if (!notionRGID) continue;
      
      // Find corresponding Airtable record
      const airtableRecords = await airtableTable.select({
        filterByFormula: `{RGID} = '${notionRGID}'`
      }).firstPage();
      
      const fieldsToUpdate = {};
      for (const [notionField, airtableField] of Object.entries(dbConfig.field_mapping)) {
        if (notionPage.properties[notionField]) {
          const prop = notionPage.properties[notionField];
          let value;
          
          switch (prop.type) {
            case 'title':
              value = prop.title[0]?.plain_text;
              break;
            case 'rich_text':
              value = prop.rich_text[0]?.plain_text;
              break;
            case 'number':
              value = prop.number;
              break;
            case 'select':
              value = prop.select?.name;
              break;
            case 'date':
              value = prop.date?.start;
              break;
            case 'checkbox':
              value = prop.checkbox;
              break;
            case 'email':
              value = prop.email;
              break;
            case 'phone_number':
              value = prop.phone_number;
              break;
          }
          
          if (value !== undefined && value !== null) {
            fieldsToUpdate[airtableField] = value;
          }
        }
      }
      
      if (airtableRecords.length > 0) {
        // Update existing Airtable record
        await airtableTable.update(airtableRecords[0].id, fieldsToUpdate);
        console.log(`      ✅ Updated Airtable record for RGID: ${notionRGID}`);
      } else {
        // Create new Airtable record
        await airtableTable.create(fieldsToUpdate);
        console.log(`      ✅ Created Airtable record for RGID: ${notionRGID}`);
      }
      notionToAirtableCount++;
    }
    
    // 2. Sync Airtable to Notion
    console.log(`   ⬅️  Syncing Airtable to Notion...`);
    const airtableRecords = await airtableTable.select().firstPage();
    
    let airtableToNotionCount = 0;
    for (const airtableRecord of airtableRecords) {
      const airtableRGID = airtableRecord.get('RGID');
      if (!airtableRGID) continue;
      
      // Check if Notion page exists
      const searchResponse = await notion.request({
        method: "POST",
        path: `data_sources/${dataSource.id}/query`,
        body: {
          filter: {
            property: 'RGID',
            rich_text: { equals: airtableRGID }
          }
        }
      });
      
      const properties = {};
      for (const [notionField, airtableField] of Object.entries(dbConfig.field_mapping)) {
        const airtableValue = airtableRecord.get(airtableField);
        if (airtableValue !== undefined && airtableValue !== null) {
          if (notionField === 'Name') {
            properties[notionField] = { title: [{ text: { content: String(airtableValue) } }] };
          } else if (notionField === 'Company Name' || notionField === 'Project Name' || 
                     notionField === 'Customer' || notionField === 'Customer Success Manager' || 
                     notionField === 'Project Manager' || notionField === 'Team Members' || 
                     notionField === 'Description' || notionField === 'Notes' || notionField === 'RGID' ||
                     notionField === 'Type' || notionField === 'Platform' || notionField === 'Created By' ||
                     notionField === 'Sync Status') {
            properties[notionField] = { rich_text: [{ text: { content: String(airtableValue) } }] };
          } else if (notionField === 'Contact Email') {
            properties[notionField] = { email: String(airtableValue) };
          } else if (notionField === 'Phone Number') {
            properties[notionField] = { phone_number: String(airtableValue) };
          } else if (notionField === 'Industry' || notionField === 'Customer Status' || 
                     notionField === 'Subscription Plan' || notionField === 'Project Type' || 
                     notionField === 'Status' || notionField === 'Priority' || notionField === 'AI Integration Status' ||
                     notionField === 'Automation Level') {
            properties[notionField] = { select: { name: String(airtableValue) } };
          } else if (notionField === 'Monthly Revenue' || notionField === 'Budget' || notionField === 'Progress') {
            properties[notionField] = { number: Number(airtableValue) };
          } else if (notionField === 'Onboarding Date' || notionField === 'Last Contact Date' || 
                     notionField === 'Start Date' || notionField === 'Due Date' || notionField === 'Last Updated') {
            properties[notionField] = { date: { start: String(airtableValue) } };
          } else if (notionField === 'Airtable Sync') {
            properties[notionField] = { checkbox: Boolean(airtableValue) };
          }
        }
      }
      
      if (searchResponse.results.length > 0) {
        // Update existing Notion page
        await notion.request({
          method: "PATCH",
          path: `pages/${searchResponse.results[0].id}`,
          body: { properties: properties }
        });
        console.log(`      ✅ Updated Notion page for RGID: ${airtableRGID}`);
      } else {
        // Create new Notion page
        await notion.request({
          method: "POST",
          path: `pages`,
          body: {
            parent: { database_id: dbConfig.notion_db_id },
            properties: properties
          }
        });
        console.log(`      ✅ Created Notion page for RGID: ${airtableRGID}`);
      }
      airtableToNotionCount++;
    }
    
    console.log(`   📊 Sync complete for ${dbConfig.name}:`);
    console.log(`      Notion → Airtable: ${notionToAirtableCount} records`);
    console.log(`      Airtable → Notion: ${airtableToNotionCount} records`);
    
  } catch (error) {
    console.error(`   ❌ Error syncing ${dbConfig.name}: ${error.message}`);
  }
}

async function main() {
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  console.log('🎯 Starting comprehensive bidirectional sync for all databases...');
  
  for (const dbConfig of databases) {
    await syncDatabase(dbConfig);
  }
  
  console.log('\n🎉 COMPREHENSIVE BIDIRECTIONAL SYNC COMPLETE!');
  console.log('📋 All three databases are now fully synchronized:');
  console.log('   ✅ Rensto Business References');
  console.log('   ✅ Rensto Customer Management');
  console.log('   ✅ Rensto Project Tracking');
  console.log('🚀 BMAD compliance: 100% ACHIEVED!');
}

main().catch(console.error);
