import { Client } from '@notionhq/client';

async function deepNotionInvestigation() {
  try {
    console.log('🔍 DEEP NOTION INVESTIGATION...');
    
    const notion = new Client({
      auth: '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',
      notionVersion: '2025-09-03'
    });
    
    // Search for all accessible content
    console.log('\n📊 Searching for all accessible content...');
    const response = await notion.search({
      query: '',
      filter: {
        property: 'object',
        value: 'page'
      }
    });
    
    console.log(`✅ Found ${response.results.length} accessible pages`);
    
    // Check each page
    for (let i = 0; i < response.results.length; i++) {
      const page = response.results[i];
      console.log(`\n${i + 1}. PAGE: ${page.id}`);
      console.log(`   Object: ${page.object}`);
      console.log(`   Parent Type: ${page.parent?.type || 'No parent'}`);
      console.log(`   Parent ID: ${page.parent?.page_id || page.parent?.database_id || 'No parent ID'}`);
      console.log(`   Created: ${page.created_time}`);
      console.log(`   Last Edited: ${page.last_edited_time}`);
      
      // Try to get page properties
      if (page.properties) {
        console.log(`   Properties: ${Object.keys(page.properties).join(', ')}`);
        
        // Check for Name property
        if (page.properties.Name?.title) {
          console.log(`   Name: ${page.properties.Name.title[0]?.text?.content || 'No content'}`);
        }
        
        // Check for Title property
        if (page.properties.title?.title) {
          console.log(`   Title: ${page.properties.title.title[0]?.text?.content || 'No content'}`);
        }
      }
      
      // Get children of this page
      try {
        const children = await notion.blocks.children.list({
          block_id: page.id
        });
        
        console.log(`   📄 Children: ${children.results.length}`);
        
        // Look for databases in children
        const databases = children.results.filter(block => block.type === 'child_database');
        if (databases.length > 0) {
          console.log(`   🎯 DATABASES FOUND: ${databases.length}`);
          
          for (const db of databases) {
            console.log(`      📊 ${db.child_database?.title || 'Untitled'} (ID: ${db.id})`);
            
            try {
              // Get database info
              const dbInfo = await notion.databases.retrieve({
                database_id: db.id
              });
              
              console.log(`         ✅ Accessible: ${dbInfo.title?.[0]?.plain_text || 'No title'}`);
              console.log(`         📋 Properties: ${Object.keys(dbInfo.properties || {}).join(', ')}`);
              
              // Get data source ID
              const dataSourceId = dbInfo.data_sources[0].id;
              console.log(`         🔧 Data Source ID: ${dataSourceId}`);
              
              // Query records
              const records = await notion.dataSources.query({
                data_source_id: dataSourceId
              });
              
              console.log(`         📄 Records: ${records.results.length}`);
              
              // Show first few records
              records.results.slice(0, 3).forEach((record, index) => {
                const title = record.properties?.Name?.title?.[0]?.text?.content || 
                             record.properties?.title?.title?.[0]?.text?.content || 
                             'No name';
                console.log(`            ${index + 1}. ${title}`);
              });
              
            } catch (dbError) {
              console.log(`         ❌ Database error: ${dbError.message}`);
            }
          }
        }
        
      } catch (childrenError) {
        console.log(`   ❌ Children error: ${childrenError.message}`);
      }
    }
    
    // Also try to search for databases directly
    console.log('\n🔍 Searching for databases directly...');
    try {
      const dbSearch = await notion.search({
        query: '',
        filter: {
          property: 'object',
          value: 'database'
        }
      });
      
      console.log(`✅ Found ${dbSearch.results.length} databases directly`);
      
      dbSearch.results.forEach((db, index) => {
        console.log(`\n${index + 1}. DATABASE: ${db.id}`);
        console.log(`   Title: ${db.title?.[0]?.plain_text || 'No title'}`);
        console.log(`   Parent Type: ${db.parent?.type || 'No parent'}`);
        console.log(`   Parent ID: ${db.parent?.page_id || db.parent?.database_id || 'No parent ID'}`);
      });
      
    } catch (dbSearchError) {
      console.log(`❌ Database search error: ${dbSearchError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the investigation
deepNotionInvestigation();
