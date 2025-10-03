#!/usr/bin/env node

/**
 * ADD FIELDS TO CUSTOMER MANAGEMENT AND PROJECT TRACKING DATABASES
 * Add all the missing fields to make them complete like Business References
 */

import { Client as NotionClient } from '@notionhq/client';

console.log('🔧 Adding missing fields to Customer Management and Project Tracking databases...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const databases = [
  {
    name: 'Customer Management',
    database_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    fields: [
      { name: 'Company Name', type: 'rich_text' },
      { name: 'Contact Email', type: 'email' },
      { name: 'Phone Number', type: 'phone_number' },
      { name: 'Industry', type: 'select', options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other'] },
      { name: 'Customer Status', type: 'select', options: ['Active', 'Inactive', 'Prospect', 'Churned'] },
      { name: 'Subscription Plan', type: 'select', options: ['Basic', 'Professional', 'Enterprise', 'Custom'] },
      { name: 'Monthly Revenue', type: 'number' },
      { name: 'Onboarding Date', type: 'date' },
      { name: 'Last Contact Date', type: 'date' },
      { name: 'Customer Success Manager', type: 'rich_text' },
      { name: 'Notes', type: 'rich_text' },
      { name: 'RGID', type: 'rich_text' }
    ]
  },
  {
    name: 'Project Tracking',
    database_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    fields: [
      { name: 'Project Name', type: 'rich_text' },
      { name: 'Customer', type: 'rich_text' },
      { name: 'Project Type', type: 'select', options: ['Website Development', 'Mobile App', 'System Integration', 'Consulting', 'Maintenance', 'Other'] },
      { name: 'Status', type: 'select', options: ['Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'] },
      { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { name: 'Start Date', type: 'date' },
      { name: 'Due Date', type: 'date' },
      { name: 'Budget', type: 'number' },
      { name: 'Progress', type: 'number' },
      { name: 'Project Manager', type: 'rich_text' },
      { name: 'Team Members', type: 'rich_text' },
      { name: 'Description', type: 'rich_text' },
      { name: 'RGID', type: 'rich_text' }
    ]
  }
];

async function addFieldsToDatabase(dbConfig) {
  console.log(`\n📊 Adding fields to ${dbConfig.name}...`);
  console.log(`   Database ID: ${dbConfig.database_id}`);
  
  try {
    // Get the data source
    const response = await notion.request({
      method: "GET",
      path: `databases/${dbConfig.database_id}`,
    });
    
    const dataSource = response.data_sources[0];
    console.log(`   Using data source: ${dataSource.name} (${dataSource.id})`);
    
    // Get current properties
    const dataSourceResponse = await notion.request({
      method: "GET",
      path: `data_sources/${dataSource.id}`,
    });
    
    const currentProperties = dataSourceResponse.properties || {};
    console.log(`   Current properties: ${Object.keys(currentProperties).length}`);
    
    let addedCount = 0;
    
    for (const field of dbConfig.fields) {
      // Check if field already exists
      if (currentProperties[field.name]) {
        console.log(`      ⏭️  Field '${field.name}' already exists, skipping`);
        continue;
      }
      
      console.log(`      ➕ Adding field: ${field.name} (${field.type})`);
      
      // Prepare field configuration
      let fieldConfig = {
        name: field.name,
        type: field.type
      };
      
      // Add options for select fields
      if (field.type === 'select' && field.options) {
        fieldConfig.select = {
          options: field.options.map(option => ({ name: option }))
        };
      }
      
      // Update the data source with new field
      await notion.request({
        method: "PATCH",
        path: `data_sources/${dataSource.id}`,
        body: {
          properties: {
            [field.name]: fieldConfig
          }
        }
      });
      
      console.log(`         ✅ Added successfully`);
      addedCount++;
    }
    
    console.log(`   🎉 Added ${addedCount} new fields to ${dbConfig.name}`);
    
  } catch (error) {
    console.error(`   ❌ Error adding fields to ${dbConfig.name}: ${error.message}`);
  }
}

async function main() {
  for (const dbConfig of databases) {
    await addFieldsToDatabase(dbConfig);
  }
  
  console.log('\n🎉 Field addition complete!');
  console.log('📋 Customer Management and Project Tracking databases now have all required fields.');
  console.log('🚀 Ready to populate with data and set up bidirectional sync!');
}

main().catch(console.error);
