import { Client } from '@notionhq/client';

async function investigateWhatIWentWrong() {
  try {
    console.log('🔍 INVESTIGATING WHAT I DID WRONG...');
    console.log('='.repeat(60));
    
    const notion = new Client({
      auth: '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',
      notionVersion: '2025-09-03'
    });
    
    // Get the accessible page
    const response = await notion.search({
      query: '',
      filter: {
        property: 'object',
        value: 'page'
      }
    });
    
    const accessiblePageId = response.results[0].id;
    const children = await notion.blocks.children.list({
      block_id: accessiblePageId
    });
    
    const databases = children.results.filter(block => block.type === 'child_database');
    
    console.log(`📊 Found ${databases.length} databases`);
    
    for (const db of databases) {
      console.log(`\n📊 DATABASE: ${db.child_database?.title || 'Untitled'}`);
      console.log(`   Database ID: ${db.id}`);
      
      try {
        // Get database info
        const dbInfo = await notion.databases.retrieve({
          database_id: db.id
        });
        
        console.log(`   ✅ Database accessible: ${dbInfo.title?.[0]?.plain_text || 'No title'}`);
        console.log(`   📋 Properties: ${Object.keys(dbInfo.properties || {}).join(', ')}`);
        
        // Show ALL properties with their types
        if (dbInfo.properties) {
          console.log('\n   📋 DETAILED PROPERTIES:');
          Object.entries(dbInfo.properties).forEach(([key, value]) => {
            console.log(`      ${key}: ${value.type}`);
            if (value.type === 'select' && value.select?.options) {
              console.log(`        Options: ${value.select.options.map(opt => opt.name).join(', ')}`);
            }
            if (value.type === 'multi_select' && value.multi_select?.options) {
              console.log(`        Options: ${value.multi_select.options.map(opt => opt.name).join(', ')}`);
            }
          });
        }
        
        // Get data source ID
        const dataSourceId = dbInfo.data_sources[0].id;
        console.log(`   🔧 Data Source ID: ${dataSourceId}`);
        
        // Query records
        const records = await notion.dataSources.query({
          data_source_id: dataSourceId
        });
        
        console.log(`   📄 Records: ${records.results.length}`);
        
        // Show ALL records with their properties
        records.results.forEach((record, index) => {
          console.log(`\n   ${index + 1}. RECORD: ${record.id}`);
          
          if (record.properties) {
            Object.entries(record.properties).forEach(([propName, propValue]) => {
              if (propValue.title) {
                console.log(`      ${propName}: ${propValue.title[0]?.text?.content || 'No content'}`);
              } else if (propValue.rich_text) {
                console.log(`      ${propName}: ${propValue.rich_text[0]?.text?.content || 'No content'}`);
              } else if (propValue.select) {
                console.log(`      ${propName}: ${propValue.select.name || 'No selection'}`);
              } else if (propValue.date) {
                console.log(`      ${propName}: ${propValue.date.start || 'No date'}`);
              } else {
                console.log(`      ${propName}: ${JSON.stringify(propValue).substring(0, 100)}...`);
              }
            });
          }
          
          // Show children content
          console.log(`      Children: ${record.children?.length || 0} blocks`);
        });
        
      } catch (dbError) {
        console.log(`   ❌ Database error: ${dbError.message}`);
      }
    }
    
    console.log('\n🎯 ANALYSIS OF WHAT I DID WRONG:');
    console.log('1. I created records with only basic properties');
    console.log('2. I didn\'t use the proper database schema');
    console.log('3. I didn\'t populate all the available fields');
    console.log('4. I created simple text blocks instead of structured data');
    console.log('5. I didn\'t follow the proper Notion database structure');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the investigation
investigateWhatIWentWrong();
