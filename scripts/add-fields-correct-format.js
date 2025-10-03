#!/usr/bin/env node

/**
 * ADD FIELDS WITH CORRECT FORMAT
 * Add fields using the correct 2025 API schema format
 */

import { Client as NotionClient } from '@notionhq/client';

console.log('🔧 Adding fields with correct 2025 API format...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const databases = [
  {
    name: 'Customer Management',
    database_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    fields: [
      { name: 'Company Name', type: 'rich_text', config: { rich_text: {} } },
      { name: 'Contact Email', type: 'email', config: { email: {} } },
      { name: 'Phone Number', type: 'phone_number', config: { phone_number: {} } },
      { 
        name: 'Industry', 
        type: 'select', 
        config: { 
          select: {
            options: [
              { name: 'Technology', color: 'blue' },
              { name: 'Healthcare', color: 'green' },
              { name: 'Finance', color: 'yellow' },
              { name: 'Education', color: 'purple' },
              { name: 'Retail', color: 'orange' },
              { name: 'Manufacturing', color: 'red' },
              { name: 'Other', color: 'gray' }
            ]
          }
        }
      },
      { 
        name: 'Customer Status', 
        type: 'select', 
        config: { 
          select: {
            options: [
              { name: 'Active', color: 'green' },
              { name: 'Inactive', color: 'gray' },
              { name: 'Prospect', color: 'yellow' },
              { name: 'Churned', color: 'red' }
            ]
          }
        }
      },
      { 
        name: 'Subscription Plan', 
        type: 'select', 
        config: { 
          select: {
            options: [
              { name: 'Basic', color: 'blue' },
              { name: 'Professional', color: 'green' },
              { name: 'Enterprise', color: 'purple' },
              { name: 'Custom', color: 'orange' }
            ]
          }
        }
      },
      { name: 'Monthly Revenue', type: 'number', config: { number: {} } },
      { name: 'Onboarding Date', type: 'date', config: { date: {} } },
      { name: 'Last Contact Date', type: 'date', config: { date: {} } },
      { name: 'Customer Success Manager', type: 'rich_text', config: { rich_text: {} } },
      { name: 'Notes', type: 'rich_text', config: { rich_text: {} } },
      { name: 'RGID', type: 'rich_text', config: { rich_text: {} } }
    ]
  },
  {
    name: 'Project Tracking',
    database_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    fields: [
      { name: 'Project Name', type: 'rich_text', config: { rich_text: {} } },
      { name: 'Customer', type: 'rich_text', config: { rich_text: {} } },
      { 
        name: 'Project Type', 
        type: 'select', 
        config: { 
          select: {
            options: [
              { name: 'Website Development', color: 'blue' },
              { name: 'Mobile App', color: 'green' },
              { name: 'System Integration', color: 'yellow' },
              { name: 'Consulting', color: 'purple' },
              { name: 'Maintenance', color: 'orange' },
              { name: 'Other', color: 'gray' }
            ]
          }
        }
      },
      { 
        name: 'Status', 
        type: 'select', 
        config: { 
          select: {
            options: [
              { name: 'Planning', color: 'yellow' },
              { name: 'In Progress', color: 'blue' },
              { name: 'Review', color: 'orange' },
              { name: 'Completed', color: 'green' },
              { name: 'On Hold', color: 'gray' },
              { name: 'Cancelled', color: 'red' }
            ]
          }
        }
      },
      { 
        name: 'Priority', 
        type: 'select', 
        config: { 
          select: {
            options: [
              { name: 'Low', color: 'blue' },
              { name: 'Medium', color: 'yellow' },
              { name: 'High', color: 'red' },
              { name: 'Critical', color: 'brown' }
            ]
          }
        }
      },
      { name: 'Start Date', type: 'date', config: { date: {} } },
      { name: 'Due Date', type: 'date', config: { date: {} } },
      { name: 'Budget', type: 'number', config: { number: {} } },
      { name: 'Progress', type: 'number', config: { number: {} } },
      { name: 'Project Manager', type: 'rich_text', config: { rich_text: {} } },
      { name: 'Team Members', type: 'rich_text', config: { rich_text: {} } },
      { name: 'Description', type: 'rich_text', config: { rich_text: {} } },
      { name: 'RGID', type: 'rich_text', config: { rich_text: {} } }
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
      
      // Prepare field configuration with correct format
      const fieldConfig = {
        name: field.name,
        type: field.type,
        ...field.config
      };
      
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
