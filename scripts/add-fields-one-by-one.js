#!/usr/bin/env node

/**
 * ADD FIELDS ONE BY ONE
 * Add fields to databases one at a time using direct Notion API
 */

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

const CUSTOMER_MANAGEMENT_DB_ID = '6b8cbaea-73f1-4094-aa55-2b4a858fd353';
const PROJECT_TRACKING_DB_ID = '6f911ef7-d44f-4b34-82ab-ca1b9fbd0ab4';

async function addSingleField(databaseId, fieldName, fieldConfig, databaseName) {
  try {
    console.log(`   Adding field: ${fieldName}`);
    
    // Get current database
    const currentDb = await notion.databases.retrieve({ database_id: databaseId });
    
    // Add the new field to existing properties
    const newProperties = {
      ...currentDb.properties,
      [fieldName]: fieldConfig
    };
    
    // Update database
    await notion.databases.update({
      database_id: databaseId,
      properties: newProperties
    });
    
    console.log(`   ✅ ${fieldName} added successfully`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error adding ${fieldName}:`, error.message);
    return false;
  }
}

async function addFieldsToDatabase(databaseId, fields, databaseName) {
  console.log(`\n🔧 Adding fields to ${databaseName} database...`);
  
  let successCount = 0;
  let totalCount = Object.keys(fields).length;
  
  for (const [fieldName, fieldConfig] of Object.entries(fields)) {
    const success = await addSingleField(databaseId, fieldName, fieldConfig, databaseName);
    if (success) successCount++;
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`   📊 Added ${successCount}/${totalCount} fields successfully`);
  return successCount === totalCount;
}

async function main() {
  console.log('🚀 Adding Fields One by One...');
  
  // Customer Management Database Fields
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

  // Project Tracking Database Fields
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
  
  try {
    // Add fields to Customer Management database
    const customerSuccess = await addFieldsToDatabase(
      CUSTOMER_MANAGEMENT_DB_ID, 
      CUSTOMER_MANAGEMENT_FIELDS, 
      'Customer Management'
    );
    
    // Add fields to Project Tracking database
    const projectSuccess = await addFieldsToDatabase(
      PROJECT_TRACKING_DB_ID, 
      PROJECT_TRACKING_FIELDS, 
      'Project Tracking'
    );
    
    if (customerSuccess && projectSuccess) {
      console.log('\n🎉 SUCCESS: All fields added successfully!');
      
      // Verify the results
      console.log('\n🔍 Verifying results...');
      
      const customerDb = await notion.databases.retrieve({ database_id: CUSTOMER_MANAGEMENT_DB_ID });
      const projectDb = await notion.databases.retrieve({ database_id: PROJECT_TRACKING_DB_ID });
      
      console.log(`\n📊 Final Status:`);
      console.log(`   Customer Management: ${Object.keys(customerDb.properties).length} fields`);
      console.log(`   Project Tracking: ${Object.keys(projectDb.properties).length} fields`);
      
      console.log(`\n🔗 Database IDs:`);
      console.log(`   Customer Management: ${CUSTOMER_MANAGEMENT_DB_ID}`);
      console.log(`   Project Tracking: ${PROJECT_TRACKING_DB_ID}`);
      
    } else {
      console.log('\n❌ FAILURE: Some fields could not be added');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
