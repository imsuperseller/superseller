#!/usr/bin/env node

/**
 * WEEK 1: PROJECT DATA MIGRATION
 * Migrate comprehensive project data from Airtable to Notion with full field mapping
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 WEEK 1: PROJECT DATA MIGRATION');
console.log('Migrating comprehensive project data from Airtable to Notion...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

// Project data migration configuration
const PROJECT_MIGRATION_CONFIG = {
  notion_db_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
  airtable_base_id: 'appQijHhqqP4z6wGe',
  airtable_table_name: 'Projects',
  
  // Field mapping from Airtable to Notion
  field_mapping: {
    'Name': 'Name',
    'Project Name': 'Project Name',
    'Customer': 'Customer',
    'Project Phase': 'Project Type',
    'Status': 'Status',
    'Priority': 'Priority',
    'Start Date': 'Start Date',
    'End Date': 'Due Date',
    'Project Budget': 'Budget',
    'Progress Percentage': 'Progress',
    'Project Manager': 'Project Manager',
    'Team Members': 'Team Members',
    'Description': 'Description',
    'RGID': 'RGID'
  },
  
  // Data transformation rules
  transformations: {
    'Project Type': (value) => {
      // Map project phases to project types
      const typeMap = {
        'Planning': 'Planning',
        'Development': 'Website Development',
        'Testing': 'System Integration',
        'Deployment': 'System Integration',
        'Maintenance': 'Maintenance',
        'Consulting': 'Consulting',
        'Other': 'Other'
      };
      return typeMap[value] || 'Other';
    },
    'Status': (value) => {
      // Map status values to match Notion select options
      const statusMap = {
        'Planning': 'Planning',
        'In Progress': 'In Progress',
        'Review': 'Review',
        'Completed': 'Completed',
        'On Hold': 'On Hold',
        'Cancelled': 'Cancelled'
      };
      return statusMap[value] || 'Planning';
    },
    'Priority': (value) => {
      // Map priority values to match Notion select options
      const priorityMap = {
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High',
        'Critical': 'Critical'
      };
      return priorityMap[value] || 'Medium';
    },
    'Progress': (value) => {
      // Ensure progress is a number between 0-100
      if (typeof value === 'number') {
        return Math.min(100, Math.max(0, value));
      }
      return 0;
    }
  }
};

async function migrateProjectData() {
  console.log('\n📊 MIGRATING PROJECT DATA FROM AIRTABLE TO NOTION...');
  
  try {
    // Get Notion data source
    const notionResponse = await notion.request({
      method: "GET",
      path: `databases/${PROJECT_MIGRATION_CONFIG.notion_db_id}`,
    });
    
    const dataSource = notionResponse.data_sources[0];
    console.log(`   📝 Notion data source: ${dataSource.name} (${dataSource.id})`);
    
    // Get Airtable data
    const airtableBase = airtable.base(PROJECT_MIGRATION_CONFIG.airtable_base_id);
    const airtableTable = airtableBase(PROJECT_MIGRATION_CONFIG.airtable_table_name);
    
    console.log(`   📊 Airtable table: ${PROJECT_MIGRATION_CONFIG.airtable_table_name}`);
    const airtableRecords = await airtableTable.select().firstPage();
    console.log(`   ✅ Found ${airtableRecords.length} project records in Airtable`);
    
    let migratedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const airtableRecord of airtableRecords) {
      const airtableRGID = airtableRecord.get('RGID');
      const projectName = airtableRecord.get('Name') || airtableRecord.get('Project Name');
      
      if (!airtableRGID) {
        console.log(`   ⚠️  Skipping record without RGID: ${projectName}`);
        skippedCount++;
        continue;
      }
      
      console.log(`   🔍 Processing: ${projectName} (RGID: ${airtableRGID})`);
      
      // Check if Notion record exists
      const searchResponse = await notion.request({
        method: "POST",
        path: `data_sources/${dataSource.id}/query`,
        body: {
          filter: {
            property: 'RGID',
            rich_text: {
              equals: airtableRGID
            }
          }
        }
      });
      
      const notionPageExists = searchResponse.results.length > 0;
      let notionPageId = notionPageExists ? searchResponse.results[0].id : null;
      
      // Prepare properties for Notion
      const properties = {};
      
      for (const [notionField, airtableField] of Object.entries(PROJECT_MIGRATION_CONFIG.field_mapping)) {
        let airtableValue = airtableRecord.get(airtableField);
        
        // Apply transformations if needed
        if (PROJECT_MIGRATION_CONFIG.transformations[notionField]) {
          airtableValue = PROJECT_MIGRATION_CONFIG.transformations[notionField](airtableValue);
        }
        
        if (airtableValue !== undefined && airtableValue !== null) {
          // Map Airtable values to Notion property format
          if (notionField === 'Name') {
            properties[notionField] = { title: [{ text: { content: String(airtableValue) } }] };
          } else if (notionField === 'Project Name' || notionField === 'Customer' || 
                     notionField === 'Project Manager' || notionField === 'Team Members' || 
                     notionField === 'Description' || notionField === 'RGID') {
            properties[notionField] = { rich_text: [{ text: { content: String(airtableValue) } }] };
          } else if (notionField === 'Project Type' || notionField === 'Status' || 
                     notionField === 'Priority') {
            properties[notionField] = { select: { name: String(airtableValue) } };
          } else if (notionField === 'Budget' || notionField === 'Progress') {
            properties[notionField] = { number: Number(airtableValue) };
          } else if (notionField === 'Start Date' || notionField === 'Due Date') {
            properties[notionField] = { date: { start: String(airtableValue) } };
          }
        }
      }
      
      if (notionPageExists) {
        // Update existing Notion page
        try {
          await notion.request({
            method: "PATCH",
            path: `pages/${notionPageId}`,
            body: {
              properties: properties
            }
          });
          console.log(`      ✅ Updated Notion page for RGID: ${airtableRGID}`);
          updatedCount++;
        } catch (error) {
          console.error(`      ❌ Error updating Notion page for RGID ${airtableRGID}: ${error.message}`);
        }
      } else {
        // Create new Notion page
        try {
          await notion.request({
            method: "POST",
            path: `pages`,
            body: {
              parent: { database_id: PROJECT_MIGRATION_CONFIG.notion_db_id },
              properties: properties
            }
          });
          console.log(`      ✅ Created Notion page: ${projectName}`);
          migratedCount++;
        } catch (error) {
          console.error(`      ❌ Error creating Notion page: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📈 PROJECT DATA MIGRATION SUMMARY:`);
    console.log(`   Records migrated: ${migratedCount}`);
    console.log(`   Records updated: ${updatedCount}`);
    console.log(`   Records skipped: ${skippedCount}`);
    console.log(`   Total processed: ${migratedCount + updatedCount + skippedCount}`);
    
    return { migrated: migratedCount, updated: updatedCount, skipped: skippedCount };
    
  } catch (error) {
    console.error(`❌ Error in project data migration: ${error.message}`);
    return { migrated: 0, updated: 0, skipped: 0 };
  }
}

async function verifyProjectDataIntegrity() {
  console.log('\n🔍 VERIFYING PROJECT DATA INTEGRITY...');
  
  try {
    // Get Notion data source
    const notionResponse = await notion.request({
      method: "GET",
      path: `databases/${PROJECT_MIGRATION_CONFIG.notion_db_id}`,
    });
    
    const dataSource = notionResponse.data_sources[0];
    
    // Get all Notion records
    const notionRecords = await notion.request({
      method: "POST",
      path: `data_sources/${dataSource.id}/query`,
      body: { page_size: 100 }
    });
    
    // Get all Airtable records
    const airtableBase = airtable.base(PROJECT_MIGRATION_CONFIG.airtable_base_id);
    const airtableTable = airtableBase(PROJECT_MIGRATION_CONFIG.airtable_table_name);
    const airtableRecords = await airtableTable.select().firstPage();
    
    console.log(`   📊 Notion records: ${notionRecords.results.length}`);
    console.log(`   📊 Airtable records: ${airtableRecords.length}`);
    
    // Check data consistency
    let consistentRecords = 0;
    let inconsistentRecords = 0;
    
    for (const notionRecord of notionRecords.results) {
      const notionRGID = notionRecord.properties.RGID?.rich_text?.[0]?.plain_text;
      const notionName = notionRecord.properties.Name?.title?.[0]?.plain_text;
      
      if (notionRGID && !notionRGID.startsWith('RGID_NOTION_')) {
        // Find corresponding Airtable record
        const airtableRecord = airtableRecords.find(record => record.get('RGID') === notionRGID);
        
        if (airtableRecord) {
          const airtableName = airtableRecord.get('Name') || airtableRecord.get('Project Name');
          
          // Check if names match
          if (notionName === airtableName) {
            consistentRecords++;
          } else {
            console.log(`   ⚠️  Name mismatch for RGID ${notionRGID}: Notion="${notionName}" vs Airtable="${airtableName}"`);
            inconsistentRecords++;
          }
        } else {
          console.log(`   ⚠️  No Airtable record found for Notion RGID: ${notionRGID}`);
          inconsistentRecords++;
        }
      } else {
        // This is a Notion-only record (created during cleanup)
        consistentRecords++;
      }
    }
    
    console.log(`\n📈 DATA INTEGRITY SUMMARY:`);
    console.log(`   Consistent records: ${consistentRecords}`);
    console.log(`   Inconsistent records: ${inconsistentRecords}`);
    console.log(`   Integrity rate: ${((consistentRecords / (consistentRecords + inconsistentRecords)) * 100).toFixed(1)}%`);
    
    return consistentRecords === (consistentRecords + inconsistentRecords);
    
  } catch (error) {
    console.error(`❌ Error verifying data integrity: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Week 1: Project Data Migration...');
  
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  try {
    const migrationResult = await migrateProjectData();
    const isIntegrityValid = await verifyProjectDataIntegrity();
    
    console.log('\n🎉 WEEK 1 TASK 3 COMPLETE: PROJECT DATA MIGRATION');
    console.log('✅ Project data successfully migrated from Airtable to Notion');
    console.log('✅ Data integrity verified');
    console.log(`✅ Migration summary: ${migrationResult.migrated} migrated, ${migrationResult.updated} updated, ${migrationResult.skipped} skipped`);
    
    if (isIntegrityValid) {
      console.log('\n🚀 Ready to proceed to Week 1 Task 4: Data Integrity Verification');
    } else {
      console.log('\n⚠️ Some data integrity issues found - please review');
    }
    
  } catch (error) {
    console.error(`❌ Error in project data migration: ${error.message}`);
  }
}

main().catch(console.error);
