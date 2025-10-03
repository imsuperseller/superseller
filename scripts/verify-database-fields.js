#!/usr/bin/env node

/**
 * VERIFY DATABASE FIELDS
 * Use direct Notion API to verify database fields
 */

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

const CUSTOMER_MANAGEMENT_DB_ID = '6b8cbaea-73f1-4094-aa55-2b4a858fd353';
const PROJECT_TRACKING_DB_ID = '6f911ef7-d44f-4b34-82ab-ca1b9fbd0ab4';

async function verifyDatabase(databaseId, databaseName) {
  console.log(`\n🔍 Verifying ${databaseName} database...`);
  
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    
    console.log(`   ✅ Database retrieved successfully`);
    console.log(`   Title: ${db.title[0]?.text?.content || 'No title'}`);
    console.log(`   Properties type: ${typeof db.properties}`);
    console.log(`   Properties: ${db.properties ? 'exists' : 'null/undefined'}`);
    
    if (db.properties) {
      console.log(`   Number of properties: ${Object.keys(db.properties).length}`);
      console.log(`   Properties:`);
      Object.keys(db.properties).forEach(field => {
        const prop = db.properties[field];
        console.log(`     - ${field} (${prop.type})`);
      });
    } else {
      console.log('   ❌ Properties is null/undefined');
    }
    
    return db;
    
  } catch (error) {
    console.error(`   ❌ Error retrieving ${databaseName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Verifying Database Fields...');
  
  const customerDb = await verifyDatabase(CUSTOMER_MANAGEMENT_DB_ID, 'Customer Management');
  const projectDb = await verifyDatabase(PROJECT_TRACKING_DB_ID, 'Project Tracking');
  
  console.log('\n📊 Summary:');
  if (customerDb && customerDb.properties) {
    console.log(`   Customer Management: ${Object.keys(customerDb.properties).length} fields`);
  } else {
    console.log('   Customer Management: ❌ No properties');
  }
  
  if (projectDb && projectDb.properties) {
    console.log(`   Project Tracking: ${Object.keys(projectDb.properties).length} fields`);
  } else {
    console.log('   Project Tracking: ❌ No properties');
  }
}

main();
