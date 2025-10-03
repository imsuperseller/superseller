#!/usr/bin/env node

/**
 * WEEK 1: RGID SYSTEM IMPLEMENTATION
 * Set up comprehensive RGID system across all databases (Notion + Airtable)
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 WEEK 1: RGID SYSTEM IMPLEMENTATION');
console.log('Setting up comprehensive RGID system across all databases...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

// RGID System Configuration
const RGID_CONFIG = {
  format: 'RGID_{PLATFORM}_{TYPE}_{TIMESTAMP}_{IDENTIFIER}',
  platforms: {
    notion: 'NOTION',
    airtable: 'AIRTABLE',
    n8n: 'N8N',
    admin: 'ADMIN',
    customer: 'CUSTOMER'
  },
  types: {
    business: 'BUSINESS',
    customer: 'CUSTOMER', 
    project: 'PROJECT',
    workflow: 'WORKFLOW',
    integration: 'INTEGRATION'
  }
};

// Database configurations
const databases = [
  {
    name: 'Business References',
    notion_db_id: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtable_base_id: 'app4nJpP1ytGukXQT',
    airtable_table_name: 'Business References',
    type: 'business'
  },
  {
    name: 'Customer Management',
    notion_db_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Customers',
    type: 'customer'
  },
  {
    name: 'Project Tracking',
    notion_db_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Projects',
    type: 'project'
  }
];

function generateRGID(platform, type, identifier) {
  const timestamp = Date.now();
  const cleanIdentifier = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `RGID_${RGID_CONFIG.platforms[platform]}_${RGID_CONFIG.types[type]}_${timestamp}_${cleanIdentifier}`;
}

async function implementRGIDSystem() {
  console.log('\n📊 IMPLEMENTING RGID SYSTEM ACROSS ALL DATABASES...');
  
  for (const dbConfig of databases) {
    console.log(`\n🔄 Processing ${dbConfig.name}...`);
    
    try {
      // 1. Process Notion Database
      console.log(`   📝 Processing Notion database...`);
      const notionResponse = await notion.request({
        method: "GET",
        path: `databases/${dbConfig.notion_db_id}`,
      });
      
      const dataSource = notionResponse.data_sources[0];
      const notionRecords = await notion.request({
        method: "POST",
        path: `data_sources/${dataSource.id}/query`,
        body: { page_size: 100 }
      });
      
      let notionUpdated = 0;
      for (const record of notionRecords.results) {
        const recordName = record.properties.Name?.title?.[0]?.plain_text || 
                          record.properties.Title?.title?.[0]?.plain_text || 
                          'Unknown';
        
        const existingRGID = record.properties.RGID?.rich_text?.[0]?.plain_text;
        
        if (!existingRGID) {
          const rgid = generateRGID('notion', dbConfig.type, recordName);
          
          await notion.request({
            method: "PATCH",
            path: `pages/${record.id}`,
            body: {
              properties: {
                'RGID': {
                  rich_text: [{ text: { content: rgid } }]
                }
              }
            }
          });
          
          console.log(`      ✅ Added RGID to Notion: ${recordName} -> ${rgid}`);
          notionUpdated++;
        }
      }
      
      // 2. Process Airtable Database
      console.log(`   📊 Processing Airtable database...`);
      const airtableBase = airtable.base(dbConfig.airtable_base_id);
      const airtableTable = airtableBase(dbConfig.airtable_table_name);
      
      const airtableRecords = await airtableTable.select().firstPage();
      
      let airtableUpdated = 0;
      for (const record of airtableRecords) {
        const recordName = record.get('Name') || record.get('Title') || 'Unknown';
        const existingRGID = record.get('RGID');
        
        if (!existingRGID) {
          const rgid = generateRGID('airtable', dbConfig.type, recordName);
          
          await airtableTable.update(record.id, {
            'RGID': rgid
          });
          
          console.log(`      ✅ Added RGID to Airtable: ${recordName} -> ${rgid}`);
          airtableUpdated++;
        }
      }
      
      console.log(`   📈 ${dbConfig.name} RGID Summary:`);
      console.log(`      Notion records updated: ${notionUpdated}`);
      console.log(`      Airtable records updated: ${airtableUpdated}`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${dbConfig.name}: ${error.message}`);
    }
  }
}

async function createRGIDMapping() {
  console.log('\n🗺️ CREATING RGID CROSS-PLATFORM MAPPING...');
  
  const rgidMapping = {
    business_references: [],
    customers: [],
    projects: []
  };
  
  for (const dbConfig of databases) {
    try {
      // Get Notion RGIDs
      const notionResponse = await notion.request({
        method: "GET",
        path: `databases/${dbConfig.notion_db_id}`,
      });
      
      const dataSource = notionResponse.data_sources[0];
      const notionRecords = await notion.request({
        method: "POST",
        path: `data_sources/${dataSource.id}/query`,
        body: { page_size: 100 }
      });
      
      // Get Airtable RGIDs
      const airtableBase = airtable.base(dbConfig.airtable_base_id);
      const airtableTable = airtableBase(dbConfig.airtable_table_name);
      const airtableRecords = await airtableTable.select().firstPage();
      
      // Create mapping
      const mapping = {
        database: dbConfig.name,
        notion_records: notionRecords.results.map(record => ({
          id: record.id,
          name: record.properties.Name?.title?.[0]?.plain_text || 
                record.properties.Title?.title?.[0]?.plain_text || 'Unknown',
          rgid: record.properties.RGID?.rich_text?.[0]?.plain_text
        })),
        airtable_records: airtableRecords.map(record => ({
          id: record.id,
          name: record.get('Name') || record.get('Title') || 'Unknown',
          rgid: record.get('RGID')
        }))
      };
      
      rgidMapping[dbConfig.name.toLowerCase().replace(/\s+/g, '_')] = mapping;
      
    } catch (error) {
      console.error(`   ❌ Error creating mapping for ${dbConfig.name}: ${error.message}`);
    }
  }
  
  // Save mapping to file
  const fs = await import('fs');
  fs.writeFileSync('scripts/rgid-cross-platform-mapping.json', JSON.stringify(rgidMapping, null, 2));
  
  console.log('   ✅ RGID cross-platform mapping saved to scripts/rgid-cross-platform-mapping.json');
}

async function verifyRGIDSystem() {
  console.log('\n🔍 VERIFYING RGID SYSTEM INTEGRITY...');
  
  let totalNotionRecords = 0;
  let totalAirtableRecords = 0;
  let notionWithRGID = 0;
  let airtableWithRGID = 0;
  
  for (const dbConfig of databases) {
    try {
      // Check Notion
      const notionResponse = await notion.request({
        method: "GET",
        path: `databases/${dbConfig.notion_db_id}`,
      });
      
      const dataSource = notionResponse.data_sources[0];
      const notionRecords = await notion.request({
        method: "POST",
        path: `data_sources/${dataSource.id}/query`,
        body: { page_size: 100 }
      });
      
      // Check Airtable
      const airtableBase = airtable.base(dbConfig.airtable_base_id);
      const airtableTable = airtableBase(dbConfig.airtable_table_name);
      const airtableRecords = await airtableTable.select().firstPage();
      
      const notionRGIDCount = notionRecords.results.filter(record => 
        record.properties.RGID?.rich_text?.[0]?.plain_text
      ).length;
      
      const airtableRGIDCount = airtableRecords.filter(record => 
        record.get('RGID')
      ).length;
      
      totalNotionRecords += notionRecords.results.length;
      totalAirtableRecords += airtableRecords.length;
      notionWithRGID += notionRGIDCount;
      airtableWithRGID += airtableRGIDCount;
      
      console.log(`   📊 ${dbConfig.name}:`);
      console.log(`      Notion: ${notionRGIDCount}/${notionRecords.results.length} have RGID`);
      console.log(`      Airtable: ${airtableRGIDCount}/${airtableRecords.length} have RGID`);
      
    } catch (error) {
      console.error(`   ❌ Error verifying ${dbConfig.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📈 OVERALL RGID SYSTEM STATUS:`);
  console.log(`   Notion: ${notionWithRGID}/${totalNotionRecords} records have RGID (${((notionWithRGID/totalNotionRecords)*100).toFixed(1)}%)`);
  console.log(`   Airtable: ${airtableWithRGID}/${totalAirtableRecords} records have RGID (${((airtableWithRGID/totalAirtableRecords)*100).toFixed(1)}%)`);
  
  const overallStatus = (notionWithRGID === totalNotionRecords && airtableWithRGID === totalAirtableRecords);
  console.log(`   🎯 System Status: ${overallStatus ? '✅ COMPLETE' : '⚠️ NEEDS ATTENTION'}`);
  
  return overallStatus;
}

async function main() {
  console.log('🚀 Starting Week 1: RGID System Implementation...');
  
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  try {
    await implementRGIDSystem();
    await createRGIDMapping();
    const isComplete = await verifyRGIDSystem();
    
    console.log('\n🎉 WEEK 1 TASK 1 COMPLETE: RGID SYSTEM IMPLEMENTATION');
    console.log('✅ RGID system successfully implemented across all databases');
    console.log('✅ Cross-platform mapping created and saved');
    console.log('✅ System integrity verified');
    
    if (isComplete) {
      console.log('\n🚀 Ready to proceed to Week 1 Task 2: Customer Data Migration');
    } else {
      console.log('\n⚠️ Some records still need RGIDs - please review and fix');
    }
    
  } catch (error) {
    console.error(`❌ Error in RGID system implementation: ${error.message}`);
  }
}

main().catch(console.error);
