#!/usr/bin/env node

/**
 * SIMPLE NOTION POPULATION
 * Populate Notion databases with basic data using only the Name field
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 Starting simple Notion population...');

const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });

// Database configurations - using only Name field
const databases = [
  {
    name: 'Rensto Business References',
    notion_db_id: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtable_base_id: 'app4nJpP1ytGukXQT',
    airtable_table_name: 'Business References'
  },
  {
    name: 'Rensto Customer Management',
    notion_db_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Customers'
  },
  {
    name: 'Rensto Project Tracking',
    notion_db_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Projects'
  }
];

async function populateDatabase(dbConfig) {
  console.log(`\n🔄 Populating ${dbConfig.name}...`);
  
  const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(dbConfig.airtable_base_id);
  const airtableTable = airtable(dbConfig.airtable_table_name);
  
  try {
    const airtableRecords = await airtableTable.select().firstPage();
    console.log(`   📊 Found ${airtableRecords.length} records in Airtable`);
    
    let createdCount = 0;
    
    for (const record of airtableRecords) {
      const name = record.get('Name') || record.get('Title') || `Record ${record.id}`;
      const rgid = record.get('RGID') || `RGID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`   🔍 Processing: ${name}`);
      
      // Check if page already exists
      const searchResponse = await notion.search({
        query: name,
        filter: {
          property: 'object',
          value: 'page'
        }
      });
      
      const existingPage = searchResponse.results.find(page => 
        page.parent.type === 'database_id' && 
        page.parent.database_id === dbConfig.notion_db_id &&
        page.properties.Name?.title?.[0]?.plain_text === name
      );
      
      if (existingPage) {
        console.log(`      ⚠️  Page already exists, skipping`);
        continue;
      }
      
      // Create page with just Name field
      try {
        await notion.pages.create({
          parent: { database_id: dbConfig.notion_db_id },
          properties: {
            Name: { title: [{ text: { content: name } }] }
          }
        });
        console.log(`      ✅ Created page: ${name}`);
        createdCount++;
      } catch (error) {
        console.log(`      ❌ Error creating page: ${error.message}`);
      }
    }
    
    console.log(`   📊 Population complete for ${dbConfig.name}:`);
    console.log(`      Created: ${createdCount} pages`);
    
  } catch (error) {
    console.error(`   ❌ Error populating ${dbConfig.name}: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting simple population of Notion databases...');
  
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  let totalCreated = 0;
  
  for (const dbConfig of databases) {
    await populateDatabase(dbConfig);
  }
  
  console.log('\n🎉 Simple population completed!');
  console.log('📋 Notion databases now contain basic records from Airtable.');
  console.log('💡 Next step: Add proper fields to Notion databases manually, then run full sync.');
}

main().catch(console.error);
