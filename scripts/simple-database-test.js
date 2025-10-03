#!/usr/bin/env node

/**
 * SIMPLE DATABASE TEST
 * Test basic database operations step by step
 */

import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || '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',
});

const CUSTOMER_MANAGEMENT_DB_ID = '73487f9d-c6f8-4fca-9a12-9bee24d4038c';

async function testDatabaseOperations() {
  console.log('🔍 Testing basic database operations...');
  
  try {
    // Step 1: Test database retrieval
    console.log('\n1️⃣ Testing database retrieval...');
    const db = await notion.databases.retrieve({ database_id: CUSTOMER_MANAGEMENT_DB_ID });
    console.log('   ✅ Database retrieved successfully');
    console.log(`   Database title: ${db.title[0]?.text?.content || 'No title'}`);
    console.log(`   Database ID: ${db.id}`);
    console.log(`   Properties type: ${typeof db.properties}`);
    console.log(`   Properties: ${db.properties ? 'exists' : 'null/undefined'}`);
    
    if (db.properties) {
      console.log(`   Number of properties: ${Object.keys(db.properties).length}`);
      Object.keys(db.properties).forEach(field => console.log(`   - ${field}`));
    } else {
      console.log('   ❌ Properties is null or undefined');
      return false;
    }
    
    // Step 2: Test adding a simple field
    console.log('\n2️⃣ Testing field addition...');
    const newProperties = {
      ...db.properties,
      'Test Field': {
        type: 'rich_text',
        rich_text: {}
      }
    };
    
    console.log(`   Current properties count: ${Object.keys(db.properties).length}`);
    console.log(`   New properties count: ${Object.keys(newProperties).length}`);
    
    const updateResult = await notion.databases.update({
      database_id: CUSTOMER_MANAGEMENT_DB_ID,
      properties: newProperties
    });
    
    console.log('   ✅ Update call succeeded');
    console.log(`   Update result type: ${typeof updateResult}`);
    console.log(`   Update result has properties: ${!!updateResult.properties}`);
    
    // Step 3: Verify the update
    console.log('\n3️⃣ Verifying update...');
    const updatedDb = await notion.databases.retrieve({ database_id: CUSTOMER_MANAGEMENT_DB_ID });
    console.log(`   Updated properties count: ${Object.keys(updatedDb.properties).length}`);
    Object.keys(updatedDb.properties).forEach(field => console.log(`   - ${field}`));
    
    if (updatedDb.properties['Test Field']) {
      console.log('   ✅ Test field was added successfully!');
      return true;
    } else {
      console.log('   ❌ Test field was not added');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Error details:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Simple Database Test...');
  
  const success = await testDatabaseOperations();
  
  if (success) {
    console.log('\n🎉 Database operations are working!');
  } else {
    console.log('\n❌ Database operations are failing');
  }
}

main();
