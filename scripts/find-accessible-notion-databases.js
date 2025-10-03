#!/usr/bin/env node

/**
 * FIND ACCESSIBLE NOTION DATABASES
 * Find all databases accessible to the integration
 */

import { Client as NotionClient } from '@notionhq/client';

console.log('🔍 Finding all accessible Notion databases...');

const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });

async function findAccessibleDatabases() {
  try {
    console.log('📊 Searching for accessible databases...');
    
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      }
    });
    
    console.log(`✅ Found ${response.results.length} accessible databases:`);
    
    response.results.forEach((database, index) => {
      const title = database.title[0]?.plain_text || 'Untitled';
      const id = database.id;
      console.log(`\n${index + 1}. ${title}`);
      console.log(`   ID: ${id}`);
      console.log(`   URL: https://www.notion.so/${id.replace(/-/g, '')}`);
      
      // Check if this matches our expected databases
      if (title.toLowerCase().includes('customer') || title.toLowerCase().includes('management')) {
        console.log(`   🎯 MATCH: This looks like Customer Management!`);
      }
      if (title.toLowerCase().includes('project') || title.toLowerCase().includes('tracking')) {
        console.log(`   🎯 MATCH: This looks like Project Tracking!`);
      }
      if (title.toLowerCase().includes('business') || title.toLowerCase().includes('reference')) {
        console.log(`   🎯 MATCH: This looks like Business References!`);
      }
    });
    
    return response.results;
    
  } catch (error) {
    console.error(`❌ Error searching databases: ${error.message}`);
    return [];
  }
}

async function main() {
  const databases = await findAccessibleDatabases();
  
  if (databases.length === 0) {
    console.log('\n❌ No accessible databases found. Check integration permissions.');
  } else {
    console.log('\n🎯 Database search complete!');
    console.log('💡 Use the correct IDs above to update the sync configuration.');
  }
}

main().catch(console.error);
