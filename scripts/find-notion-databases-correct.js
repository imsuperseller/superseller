#!/usr/bin/env node

/**
 * FIND NOTION DATABASES CORRECT
 * Find all accessible databases using correct search method
 */

import { Client as NotionClient } from '@notionhq/client';

console.log('🔍 Finding all accessible Notion databases...');

const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });

async function findAccessibleDatabases() {
  try {
    console.log('📊 Searching for accessible pages and databases...');
    
    // Search for pages first
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'page'
      }
    });
    
    console.log(`✅ Found ${response.results.length} accessible pages:`);
    
    const databases = [];
    
    response.results.forEach((page, index) => {
      const title = page.properties?.title?.title?.[0]?.plain_text || 
                   page.properties?.Name?.title?.[0]?.plain_text || 
                   'Untitled';
      const id = page.id;
      const parentType = page.parent?.type;
      
      console.log(`\n${index + 1}. ${title}`);
      console.log(`   ID: ${id}`);
      console.log(`   Parent Type: ${parentType}`);
      
      // Check if this is a database page
      if (parentType === 'database_id') {
        const databaseId = page.parent.database_id;
        console.log(`   Database ID: ${databaseId}`);
        databases.push({ title, id, databaseId });
      }
    });
    
    // Also try to search for specific database IDs we know
    console.log('\n🔍 Checking known database IDs...');
    const knownIds = [
      '6f3c687f-91b4-46fc-a54e-193b0951d1a5', // Business References
      '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14', // Customer Management  
      '2123596d-d33c-40bb-91d9-3d2983dbfb23'  // Project Tracking
    ];
    
    for (const dbId of knownIds) {
      try {
        const db = await notion.databases.retrieve({ database_id: dbId });
        console.log(`✅ Database accessible: ${db.title[0]?.plain_text || 'Untitled'} (${dbId})`);
      } catch (error) {
        console.log(`❌ Database not accessible: ${dbId} - ${error.message}`);
      }
    }
    
    return databases;
    
  } catch (error) {
    console.error(`❌ Error searching: ${error.message}`);
    return [];
  }
}

async function main() {
  const databases = await findAccessibleDatabases();
  
  console.log('\n🎯 Database search complete!');
  console.log('💡 Check the results above to see which databases are accessible.');
}

main().catch(console.error);
