#!/usr/bin/env node

/**
 * WEEK 1: DATA INTEGRITY VERIFICATION
 * Comprehensive verification of data integrity across all databases
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 WEEK 1: DATA INTEGRITY VERIFICATION');
console.log('Comprehensive verification of data integrity across all databases...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

// Database configurations
const databases = [
  {
    name: 'Business References',
    notion_db_id: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtable_base_id: 'app4nJpP1ytGukXQT',
    airtable_table_name: 'Business References'
  },
  {
    name: 'Customer Management',
    notion_db_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Customers'
  },
  {
    name: 'Project Tracking',
    notion_db_id: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    airtable_base_id: 'appQijHhqqP4z6wGe',
    airtable_table_name: 'Projects'
  }
];

async function verifyDataIntegrity() {
  console.log('\n🔍 COMPREHENSIVE DATA INTEGRITY VERIFICATION...');
  
  const integrityReport = {
    overall_status: 'PASS',
    databases: [],
    summary: {
      total_notion_records: 0,
      total_airtable_records: 0,
      consistent_records: 0,
      inconsistent_records: 0,
      missing_rgids: 0,
      orphaned_records: 0
    }
  };
  
  for (const dbConfig of databases) {
    console.log(`\n📊 Verifying ${dbConfig.name}...`);
    
    try {
      // Get Notion data
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
      
      // Get Airtable data
      const airtableBase = airtable.base(dbConfig.airtable_base_id);
      const airtableTable = airtableBase(dbConfig.airtable_table_name);
      const airtableRecords = await airtableTable.select().firstPage();
      
      console.log(`   📝 Notion records: ${notionRecords.results.length}`);
      console.log(`   📊 Airtable records: ${airtableRecords.length}`);
      
      // Analyze data integrity
      const dbReport = {
        name: dbConfig.name,
        notion_records: notionRecords.results.length,
        airtable_records: airtableRecords.length,
        consistent_records: 0,
        inconsistent_records: 0,
        missing_rgids: 0,
        orphaned_notion_records: 0,
        orphaned_airtable_records: 0,
        issues: []
      };
      
      // Check Notion records
      for (const notionRecord of notionRecords.results) {
        const notionRGID = notionRecord.properties.RGID?.rich_text?.[0]?.plain_text;
        const notionName = notionRecord.properties.Name?.title?.[0]?.plain_text || 
                          notionRecord.properties.Title?.title?.[0]?.plain_text;
        
        if (!notionRGID) {
          dbReport.missing_rgids++;
          dbReport.issues.push(`Notion record "${notionName}" missing RGID`);
        } else {
          // Find corresponding Airtable record
          const airtableRecord = airtableRecords.find(record => record.get('RGID') === notionRGID);
          
          if (airtableRecord) {
            const airtableName = airtableRecord.get('Name') || airtableRecord.get('Title');
            
            if (notionName === airtableName) {
              dbReport.consistent_records++;
            } else {
              dbReport.inconsistent_records++;
              dbReport.issues.push(`Name mismatch for RGID ${notionRGID}: Notion="${notionName}" vs Airtable="${airtableName}"`);
            }
          } else {
            dbReport.orphaned_notion_records++;
            dbReport.issues.push(`Notion record "${notionName}" (RGID: ${notionRGID}) has no corresponding Airtable record`);
          }
        }
      }
      
      // Check Airtable records
      for (const airtableRecord of airtableRecords) {
        const airtableRGID = airtableRecord.get('RGID');
        const airtableName = airtableRecord.get('Name') || airtableRecord.get('Title');
        
        if (!airtableRGID) {
          dbReport.missing_rgids++;
          dbReport.issues.push(`Airtable record "${airtableName}" missing RGID`);
        } else {
          // Find corresponding Notion record
          const notionRecord = notionRecords.results.find(record => 
            record.properties.RGID?.rich_text?.[0]?.plain_text === airtableRGID
          );
          
          if (!notionRecord) {
            dbReport.orphaned_airtable_records++;
            dbReport.issues.push(`Airtable record "${airtableName}" (RGID: ${airtableRGID}) has no corresponding Notion record`);
          }
        }
      }
      
      // Calculate integrity percentage
      const totalRecords = Math.max(notionRecords.results.length, airtableRecords.length);
      const integrityPercentage = totalRecords > 0 ? (dbReport.consistent_records / totalRecords) * 100 : 100;
      
      console.log(`   📈 Integrity Analysis:`);
      console.log(`      Consistent records: ${dbReport.consistent_records}`);
      console.log(`      Inconsistent records: ${dbReport.inconsistent_records}`);
      console.log(`      Missing RGIDs: ${dbReport.missing_rgids}`);
      console.log(`      Orphaned Notion records: ${dbReport.orphaned_notion_records}`);
      console.log(`      Orphaned Airtable records: ${dbReport.orphaned_airtable_records}`);
      console.log(`      Integrity rate: ${integrityPercentage.toFixed(1)}%`);
      
      if (dbReport.issues.length > 0) {
        console.log(`   ⚠️  Issues found:`);
        dbReport.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      // Update summary
      integrityReport.summary.total_notion_records += notionRecords.results.length;
      integrityReport.summary.total_airtable_records += airtableRecords.length;
      integrityReport.summary.consistent_records += dbReport.consistent_records;
      integrityReport.summary.inconsistent_records += dbReport.inconsistent_records;
      integrityReport.summary.missing_rgids += dbReport.missing_rgids;
      integrityReport.summary.orphaned_records += dbReport.orphaned_notion_records + dbReport.orphaned_airtable_records;
      
      integrityReport.databases.push(dbReport);
      
    } catch (error) {
      console.error(`   ❌ Error verifying ${dbConfig.name}: ${error.message}`);
      integrityReport.overall_status = 'FAIL';
    }
  }
  
  // Overall summary
  console.log(`\n📈 OVERALL DATA INTEGRITY SUMMARY:`);
  console.log(`   Total Notion records: ${integrityReport.summary.total_notion_records}`);
  console.log(`   Total Airtable records: ${integrityReport.summary.total_airtable_records}`);
  console.log(`   Consistent records: ${integrityReport.summary.consistent_records}`);
  console.log(`   Inconsistent records: ${integrityReport.summary.inconsistent_records}`);
  console.log(`   Missing RGIDs: ${integrityReport.summary.missing_rgids}`);
  console.log(`   Orphaned records: ${integrityReport.summary.orphaned_records}`);
  
  const overallIntegrity = integrityReport.summary.total_notion_records > 0 ? 
    (integrityReport.summary.consistent_records / integrityReport.summary.total_notion_records) * 100 : 100;
  
  console.log(`   Overall integrity rate: ${overallIntegrity.toFixed(1)}%`);
  
  if (integrityReport.summary.inconsistent_records > 0 || integrityReport.summary.missing_rgids > 0 || integrityReport.summary.orphaned_records > 0) {
    integrityReport.overall_status = 'NEEDS_ATTENTION';
    console.log(`   🎯 Overall Status: ⚠️ NEEDS ATTENTION`);
  } else {
    console.log(`   🎯 Overall Status: ✅ EXCELLENT`);
  }
  
  // Save integrity report
  const fs = await import('fs');
  fs.writeFileSync('scripts/data-integrity-report.json', JSON.stringify(integrityReport, null, 2));
  
  console.log(`\n📄 Integrity report saved to scripts/data-integrity-report.json`);
  
  return integrityReport;
}

async function generateSyncConfiguration() {
  console.log('\n⚙️ GENERATING SYNC CONFIGURATION...');
  
  const syncConfig = {
    version: '1.0',
    created: new Date().toISOString(),
    databases: [],
    sync_settings: {
      frequency_minutes: 5,
      conflict_resolution: 'notion_wins',
      retry_attempts: 3,
      retry_delay_seconds: 30
    }
  };
  
  for (const dbConfig of databases) {
    const dbSyncConfig = {
      name: dbConfig.name,
      notion: {
        database_id: dbConfig.notion_db_id
      },
      airtable: {
        base_id: dbConfig.airtable_base_id,
        table_name: dbConfig.airtable_table_name
      },
      field_mapping: {},
      bidirectional_fields: [],
      rgid_field: 'RGID'
    };
    
    // Add field mappings based on database type
    if (dbConfig.name === 'Business References') {
      dbSyncConfig.field_mapping = {
        'Name': 'Title',
        'Type': 'Reference Type',
        'Description': 'Description',
        'Status': 'Status',
        'Priority': 'Priority',
        'Platform': 'Platform',
        'AI Integration Status': 'AI Integration Status',
        'Automation Level': 'Automation Level',
        'Last Updated': 'Last Updated',
        'Created By': 'Created By',
        'Airtable Sync': 'Airtable Sync',
        'Sync Status': 'Sync Status',
        'RGID': 'RGID'
      };
      dbSyncConfig.bidirectional_fields = ['Type', 'Description', 'Status', 'Priority', 'Platform', 'AI Integration Status', 'Automation Level', 'Last Updated', 'Created By', 'Airtable Sync', 'Sync Status'];
    } else if (dbConfig.name === 'Customer Management') {
      dbSyncConfig.field_mapping = {
        'Name': 'Name',
        'Company Name': 'Company',
        'Contact Email': 'Email',
        'Phone Number': 'Phone',
        'Industry': 'Industry',
        'Customer Status': 'Status',
        'Subscription Plan': 'Customer Tier',
        'Monthly Revenue': 'Annual Revenue',
        'Onboarding Date': 'Created At',
        'Last Contact Date': 'Last Contact Date',
        'Customer Success Manager': 'Customer Success Manager',
        'Notes': 'Notes',
        'RGID': 'RGID'
      };
      dbSyncConfig.bidirectional_fields = ['Company Name', 'Contact Email', 'Phone Number', 'Industry', 'Customer Status', 'Subscription Plan', 'Monthly Revenue', 'Onboarding Date', 'Last Contact Date', 'Customer Success Manager', 'Notes'];
    } else if (dbConfig.name === 'Project Tracking') {
      dbSyncConfig.field_mapping = {
        'Name': 'Name',
        'Project Name': 'Project Name',
        'Customer': 'Customer',
        'Project Type': 'Project Phase',
        'Status': 'Status',
        'Priority': 'Priority',
        'Start Date': 'Start Date',
        'Due Date': 'End Date',
        'Budget': 'Project Budget',
        'Progress': 'Progress Percentage',
        'Project Manager': 'Project Manager',
        'Team Members': 'Team Members',
        'Description': 'Description',
        'RGID': 'RGID'
      };
      dbSyncConfig.bidirectional_fields = ['Project Name', 'Customer', 'Project Type', 'Status', 'Priority', 'Start Date', 'Due Date', 'Budget', 'Progress', 'Project Manager', 'Team Members', 'Description'];
    }
    
    syncConfig.databases.push(dbSyncConfig);
  }
  
  // Save sync configuration
  const fs = await import('fs');
  fs.writeFileSync('scripts/sync-configuration.json', JSON.stringify(syncConfig, null, 2));
  
  console.log('   ✅ Sync configuration saved to scripts/sync-configuration.json');
  
  return syncConfig;
}

async function main() {
  console.log('🚀 Starting Week 1: Data Integrity Verification...');
  
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  try {
    const integrityReport = await verifyDataIntegrity();
    const syncConfig = await generateSyncConfiguration();
    
    console.log('\n🎉 WEEK 1 TASK 4 COMPLETE: DATA INTEGRITY VERIFICATION');
    console.log('✅ Data integrity verification completed');
    console.log('✅ Sync configuration generated');
    console.log(`✅ Overall integrity rate: ${((integrityReport.summary.consistent_records / integrityReport.summary.total_notion_records) * 100).toFixed(1)}%`);
    
    if (integrityReport.overall_status === 'EXCELLENT') {
      console.log('\n🚀 Ready to proceed to Week 1 Task 5: Configure Sync for All 3 Databases');
    } else {
      console.log('\n⚠️ Some data integrity issues found - please review the report');
    }
    
  } catch (error) {
    console.error(`❌ Error in data integrity verification: ${error.message}`);
  }
}

main().catch(console.error);
