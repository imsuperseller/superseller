#!/usr/bin/env node

/**
 * PROPERLY ADD NOTION FIELDS
 * Use the correct Notion API method to add fields to databases
 */

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

// Database IDs
const CUSTOMER_MANAGEMENT_DB_ID = '73487f9d-c6f8-4fca-9a12-9bee24d4038c';
const PROJECT_TRACKING_DB_ID = '82181eb3-1a49-403c-9465-9eb064e3f28b';

// Customer Management Database Fields (12 fields total)
const CUSTOMER_MANAGEMENT_FIELDS = {
  'Company Name': {
    type: 'rich_text',
    rich_text: {}
  },
  'Contact Email': {
    type: 'email',
    email: {}
  },
  'Phone Number': {
    type: 'phone_number',
    phone_number: {}
  },
  'Industry': {
    type: 'select',
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
  },
  'Customer Status': {
    type: 'select',
    select: {
      options: [
        { name: 'Active', color: 'green' },
        { name: 'Inactive', color: 'red' },
        { name: 'Prospect', color: 'yellow' },
        { name: 'Churned', color: 'gray' }
      ]
    }
  },
  'Subscription Plan': {
    type: 'select',
    select: {
      options: [
        { name: 'Basic', color: 'blue' },
        { name: 'Professional', color: 'green' },
        { name: 'Enterprise', color: 'purple' },
        { name: 'Custom', color: 'orange' }
      ]
    }
  },
  'Monthly Revenue': {
    type: 'number',
    number: {
      format: 'currency',
      currency: 'USD'
    }
  },
  'Onboarding Date': {
    type: 'date',
    date: {}
  },
  'Last Contact Date': {
    type: 'date',
    date: {}
  },
  'Customer Success Manager': {
    type: 'rich_text',
    rich_text: {}
  },
  'Notes': {
    type: 'rich_text',
    rich_text: {}
  },
  'RGID': {
    type: 'rich_text',
    rich_text: {}
  }
};

// Project Tracking Database Fields (13 fields total)
const PROJECT_TRACKING_FIELDS = {
  'Project Name': {
    type: 'rich_text',
    rich_text: {}
  },
  'Customer': {
    type: 'rich_text',
    rich_text: {}
  },
  'Project Type': {
    type: 'select',
    select: {
      options: [
        { name: 'Website Development', color: 'blue' },
        { name: 'Mobile App', color: 'green' },
        { name: 'System Integration', color: 'purple' },
        { name: 'Consulting', color: 'yellow' },
        { name: 'Maintenance', color: 'orange' },
        { name: 'Other', color: 'gray' }
      ]
    }
  },
  'Status': {
    type: 'select',
    select: {
      options: [
        { name: 'Planning', color: 'yellow' },
        { name: 'In Progress', color: 'blue' },
        { name: 'Review', color: 'orange' },
        { name: 'Completed', color: 'green' },
        { name: 'On Hold', color: 'red' },
        { name: 'Cancelled', color: 'gray' }
      ]
    }
  },
  'Priority': {
    type: 'select',
    select: {
      options: [
        { name: 'Low', color: 'blue' },
        { name: 'Medium', color: 'yellow' },
        { name: 'High', color: 'red' },
        { name: 'Critical', color: 'red' }
      ]
    }
  },
  'Start Date': {
    type: 'date',
    date: {}
  },
  'Due Date': {
    type: 'date',
    date: {}
  },
  'Budget': {
    type: 'number',
    number: {
      format: 'currency',
      currency: 'USD'
    }
  },
  'Progress': {
    type: 'number',
    number: {
      format: 'percent'
    }
  },
  'Project Manager': {
    type: 'rich_text',
    rich_text: {}
  },
  'Team Members': {
    type: 'rich_text',
    rich_text: {}
  },
  'Description': {
    type: 'rich_text',
    rich_text: {}
  },
  'RGID': {
    type: 'rich_text',
    rich_text: {}
  }
};

async function addFieldsToDatabase(databaseId, fields, databaseName) {
  console.log(`\n🔧 Adding fields to ${databaseName} database...`);
  
  // Get current database properties
  const currentDb = await notion.databases.retrieve({ database_id: databaseId });
  const currentProperties = currentDb.properties;
  
  console.log(`  Current fields: ${Object.keys(currentProperties).length}`);
  Object.keys(currentProperties).forEach(field => console.log(`    - ${field}`));
  
  // Prepare new properties object
  const newProperties = { ...currentProperties };
  
  // Add new fields
  for (const [fieldName, fieldConfig] of Object.entries(fields)) {
    if (!newProperties[fieldName]) {
      console.log(`  Adding field: ${fieldName}`);
      newProperties[fieldName] = fieldConfig;
    } else {
      console.log(`  ⚠️  ${fieldName} already exists, skipping`);
    }
  }
  
  // Update database with all properties
  try {
    await notion.databases.update({
      database_id: databaseId,
      properties: newProperties
    });
    
    console.log(`  ✅ ${databaseName} database updated successfully`);
    console.log(`  Total fields: ${Object.keys(newProperties).length}`);
    
  } catch (error) {
    console.error(`  ❌ Error updating ${databaseName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Proper Notion Database Fields Addition...');
  
  try {
    // Add fields to Customer Management database
    await addFieldsToDatabase(
      CUSTOMER_MANAGEMENT_DB_ID, 
      CUSTOMER_MANAGEMENT_FIELDS, 
      'Customer Management'
    );
    
    // Add fields to Project Tracking database
    await addFieldsToDatabase(
      PROJECT_TRACKING_DB_ID, 
      PROJECT_TRACKING_FIELDS, 
      'Project Tracking'
    );
    
    console.log('\n✅ All database fields have been added successfully!');
    
    // Verify the databases
    console.log('\n🔍 Final verification...');
    
    const customerDb = await notion.databases.retrieve({ database_id: CUSTOMER_MANAGEMENT_DB_ID });
    const projectDb = await notion.databases.retrieve({ database_id: PROJECT_TRACKING_DB_ID });
    
    console.log(`\n📊 Customer Management Database has ${Object.keys(customerDb.properties).length} fields:`);
    Object.keys(customerDb.properties).forEach(field => console.log(`  - ${field}`));
    
    console.log(`\n📊 Project Tracking Database has ${Object.keys(projectDb.properties).length} fields:`);
    Object.keys(projectDb.properties).forEach(field => console.log(`  - ${field}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
