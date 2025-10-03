import { Client } from '@notionhq/client';

async function tryOldApiVersion() {
  try {
    console.log('🔧 TRYING OLD API VERSION...');
    console.log('='.repeat(60));
    
    // Try with old API version
    const notion = new Client({
      auth: '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',
      notionVersion: '2022-06-28'
    });
    
    const businessReferencesDbId = '6f3c687f-91b4-46fc-a54e-193b0951d1a5';
    
    console.log('\n📊 TESTING WITH OLD API VERSION (2022-06-28)...');
    
    try {
      // Get database info
      const db = await notion.databases.retrieve({
        database_id: businessReferencesDbId
      });
      
      console.log(`Database Title: ${db.title?.[0]?.plain_text || 'No title'}`);
      console.log(`Properties Count: ${Object.keys(db.properties || {}).length}`);
      
      if (db.properties) {
        console.log('\n📋 PROPERTIES:');
        Object.entries(db.properties).forEach(([key, value]) => {
          console.log(`  ${key}: ${value.type}`);
        });
      } else {
        console.log('❌ No properties found!');
      }
      
      // Try to add properties with old API
      console.log('\n🔧 TRYING TO ADD PROPERTIES WITH OLD API...');
      
      const updatedDb = await notion.databases.update({
        database_id: businessReferencesDbId,
        properties: {
          'Name': {
            title: {}
          },
          'Type': {
            select: {
              options: [
                { name: 'Business Reference', color: 'blue' },
                { name: 'Technical Reference', color: 'green' }
              ]
            }
          },
          'Description': {
            rich_text: {}
          },
          'Status': {
            select: {
              options: [
                { name: 'Active', color: 'green' },
                { name: 'Completed', color: 'blue' },
                { name: 'In Progress', color: 'orange' }
              ]
            }
          },
          'Priority': {
            select: {
              options: [
                { name: 'High', color: 'red' },
                { name: 'Medium', color: 'orange' },
                { name: 'Low', color: 'green' }
              ]
            }
          },
          'RGID': {
            rich_text: {}
          }
        }
      });
      
      console.log('✅ Properties added with old API');
      console.log(`Properties now: ${Object.keys(updatedDb.properties || {}).join(', ')}`);
      
      // Check again
      const dbAfter = await notion.databases.retrieve({
        database_id: businessReferencesDbId
      });
      
      console.log(`Properties after update: ${Object.keys(dbAfter.properties || {}).length}`);
      
      if (dbAfter.properties) {
        console.log('\n📋 PROPERTIES AFTER UPDATE:');
        Object.entries(dbAfter.properties).forEach(([key, value]) => {
          console.log(`  ${key}: ${value.type}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Error with old API: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
tryOldApiVersion();
