#!/usr/bin/env node

/**
 * CLEANUP TBD RGIDS
 * Clean up records with "TBD" RGIDs and assign proper RGIDs
 */

import { Client as NotionClient } from '@notionhq/client';

console.log('🔧 Cleaning up TBD RGIDs...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const databases = [
  {
    name: 'Customer Management',
    database_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14'
  },
  {
    name: 'Project Tracking',
    database_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23'
  }
];

function generateRGID(type, identifier) {
  const timestamp = Date.now();
  const cleanIdentifier = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `RGID_NOTION_${type.toUpperCase()}_${timestamp}_${cleanIdentifier}`;
}

async function cleanupTBDRecords() {
  for (const dbConfig of databases) {
    console.log(`\n📊 Cleaning up ${dbConfig.name}...`);
    
    try {
      // Get the data source
      const response = await notion.request({
        method: "GET",
        path: `databases/${dbConfig.database_id}`,
      });
      
      const dataSource = response.data_sources[0];
      
      // Get all records
      const recordsResponse = await notion.request({
        method: "POST",
        path: `data_sources/${dataSource.id}/query`,
        body: { page_size: 100 }
      });
      
      const records = recordsResponse.results;
      let fixedCount = 0;
      
      for (const record of records) {
        const recordName = record.properties.Name?.title?.[0]?.plain_text || 'Unknown';
        const currentRGID = record.properties.RGID?.rich_text?.[0]?.plain_text;
        
        if (currentRGID === 'TBD') {
          const newRGID = generateRGID(
            dbConfig.name === 'Customer Management' ? 'customer' : 'project',
            recordName
          );
          
          console.log(`   🔄 Fixing ${recordName}: TBD -> ${newRGID}`);
          
          await notion.request({
            method: "PATCH",
            path: `pages/${record.id}`,
            body: {
              properties: {
                'RGID': {
                  rich_text: [{ text: { content: newRGID } }]
                }
              }
            }
          });
          
          fixedCount++;
        }
      }
      
      console.log(`   ✅ Fixed ${fixedCount} TBD RGIDs in ${dbConfig.name}`);
      
    } catch (error) {
      console.error(`   ❌ Error cleaning up ${dbConfig.name}: ${error.message}`);
    }
  }
}

async function main() {
  if (!process.env.NOTION_TOKEN) {
    console.error('❌ Error: NOTION_TOKEN environment variable must be set.');
    process.exit(1);
  }
  
  await cleanupTBDRecords();
  console.log('\n🎉 TBD RGID cleanup complete!');
}

main().catch(console.error);
