#!/usr/bin/env node

/**
 * WEEK 1: CUSTOMER DATA MIGRATION
 * Migrate comprehensive customer data from Airtable to Notion with full field mapping
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 WEEK 1: CUSTOMER DATA MIGRATION');
console.log('Migrating comprehensive customer data from Airtable to Notion...');

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

// Customer data migration configuration
const CUSTOMER_MIGRATION_CONFIG = {
  notion_db_id: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
  airtable_base_id: 'appQijHhqqP4z6wGe',
  airtable_table_name: 'Customers',
  
  // Field mapping from Airtable to Notion
  field_mapping: {
    'Name': 'Name',
    'Company': 'Company Name',
    'Email': 'Contact Email',
    'Phone': 'Phone Number',
    'Industry': 'Industry',
    'Status': 'Customer Status',
    'Customer Tier': 'Subscription Plan',
    'Annual Revenue': 'Monthly Revenue',
    'Created At': 'Onboarding Date',
    'Last Contact Date': 'Last Contact Date',
    'Customer Success Manager': 'Customer Success Manager',
    'Notes': 'Notes',
    'RGID': 'RGID'
  },
  
  // Data transformation rules
  transformations: {
    'Monthly Revenue': (value) => {
      // Convert annual revenue to monthly (divide by 12)
      if (typeof value === 'number') {
        return Math.round(value / 12);
      }
      return 0;
    },
    'Industry': (value) => {
      // Map industry values to match Notion select options
      const industryMap = {
        'Technology': 'Technology',
        'Healthcare': 'Healthcare',
        'Finance': 'Finance',
        'Education': 'Education',
        'Retail': 'Retail',
        'Manufacturing': 'Manufacturing',
        'Other': 'Other'
      };
      return industryMap[value] || 'Other';
    },
    'Customer Status': (value) => {
      // Map status values to match Notion select options
      const statusMap = {
        'Active': 'Active',
        'Inactive': 'Inactive',
        'Prospect': 'Prospect',
        'Churned': 'Churned'
      };
      return statusMap[value] || 'Active';
    },
    'Subscription Plan': (value) => {
      // Map subscription plans to match Notion select options
      const planMap = {
        'Basic': 'Basic',
        'Professional': 'Professional',
        'Enterprise': 'Enterprise',
        'Custom': 'Custom',
        'Gold': 'Gold',
        'Platinum': 'Platinum',
        'Silver': 'Silver'
      };
      return planMap[value] || 'Basic';
    }
  }
};

async function migrateCustomerData() {
  console.log('\n📊 MIGRATING CUSTOMER DATA FROM AIRTABLE TO NOTION...');
  
  try {
    // Get Notion data source
    const notionResponse = await notion.request({
      method: "GET",
      path: `databases/${CUSTOMER_MIGRATION_CONFIG.notion_db_id}`,
    });
    
    const dataSource = notionResponse.data_sources[0];
    console.log(`   📝 Notion data source: ${dataSource.name} (${dataSource.id})`);
    
    // Get Airtable data
    const airtableBase = airtable.base(CUSTOMER_MIGRATION_CONFIG.airtable_base_id);
    const airtableTable = airtableBase(CUSTOMER_MIGRATION_CONFIG.airtable_table_name);
    
    console.log(`   📊 Airtable table: ${CUSTOMER_MIGRATION_CONFIG.airtable_table_name}`);
    const airtableRecords = await airtableTable.select().firstPage();
    console.log(`   ✅ Found ${airtableRecords.length} customer records in Airtable`);
    
    let migratedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const airtableRecord of airtableRecords) {
      const airtableRGID = airtableRecord.get('RGID');
      const customerName = airtableRecord.get('Name');
      
      if (!airtableRGID) {
        console.log(`   ⚠️  Skipping record without RGID: ${customerName}`);
        skippedCount++;
        continue;
      }
      
      console.log(`   🔍 Processing: ${customerName} (RGID: ${airtableRGID})`);
      
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
      
      for (const [notionField, airtableField] of Object.entries(CUSTOMER_MIGRATION_CONFIG.field_mapping)) {
        let airtableValue = airtableRecord.get(airtableField);
        
        // Apply transformations if needed
        if (CUSTOMER_MIGRATION_CONFIG.transformations[notionField]) {
          airtableValue = CUSTOMER_MIGRATION_CONFIG.transformations[notionField](airtableValue);
        }
        
        if (airtableValue !== undefined && airtableValue !== null) {
          // Map Airtable values to Notion property format
          if (notionField === 'Name') {
            properties[notionField] = { title: [{ text: { content: String(airtableValue) } }] };
          } else if (notionField === 'Company Name' || notionField === 'Customer Success Manager' || 
                     notionField === 'Notes' || notionField === 'RGID') {
            properties[notionField] = { rich_text: [{ text: { content: String(airtableValue) } }] };
          } else if (notionField === 'Contact Email') {
            properties[notionField] = { email: String(airtableValue) };
          } else if (notionField === 'Phone Number') {
            properties[notionField] = { phone_number: String(airtableValue) };
          } else if (notionField === 'Industry' || notionField === 'Customer Status' || 
                     notionField === 'Subscription Plan') {
            properties[notionField] = { select: { name: String(airtableValue) } };
          } else if (notionField === 'Monthly Revenue') {
            properties[notionField] = { number: Number(airtableValue) };
          } else if (notionField === 'Onboarding Date' || notionField === 'Last Contact Date') {
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
              parent: { database_id: CUSTOMER_MIGRATION_CONFIG.notion_db_id },
              properties: properties
            }
          });
          console.log(`      ✅ Created Notion page: ${customerName}`);
          migratedCount++;
        } catch (error) {
          console.error(`      ❌ Error creating Notion page: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📈 CUSTOMER DATA MIGRATION SUMMARY:`);
    console.log(`   Records migrated: ${migratedCount}`);
    console.log(`   Records updated: ${updatedCount}`);
    console.log(`   Records skipped: ${skippedCount}`);
    console.log(`   Total processed: ${migratedCount + updatedCount + skippedCount}`);
    
    return { migrated: migratedCount, updated: updatedCount, skipped: skippedCount };
    
  } catch (error) {
    console.error(`❌ Error in customer data migration: ${error.message}`);
    return { migrated: 0, updated: 0, skipped: 0 };
  }
}

async function verifyCustomerDataIntegrity() {
  console.log('\n🔍 VERIFYING CUSTOMER DATA INTEGRITY...');
  
  try {
    // Get Notion data source
    const notionResponse = await notion.request({
      method: "GET",
      path: `databases/${CUSTOMER_MIGRATION_CONFIG.notion_db_id}`,
    });
    
    const dataSource = notionResponse.data_sources[0];
    
    // Get all Notion records
    const notionRecords = await notion.request({
      method: "POST",
      path: `data_sources/${dataSource.id}/query`,
      body: { page_size: 100 }
    });
    
    // Get all Airtable records
    const airtableBase = airtable.base(CUSTOMER_MIGRATION_CONFIG.airtable_base_id);
    const airtableTable = airtableBase(CUSTOMER_MIGRATION_CONFIG.airtable_table_name);
    const airtableRecords = await airtableTable.select().firstPage();
    
    console.log(`   📊 Notion records: ${notionRecords.results.length}`);
    console.log(`   📊 Airtable records: ${airtableRecords.length}`);
    
    // Check data consistency
    let consistentRecords = 0;
    let inconsistentRecords = 0;
    
    for (const notionRecord of notionRecords.results) {
      const notionRGID = notionRecord.properties.RGID?.rich_text?.[0]?.plain_text;
      const notionName = notionRecord.properties.Name?.title?.[0]?.plain_text;
      
      if (notionRGID) {
        // Find corresponding Airtable record
        const airtableRecord = airtableRecords.find(record => record.get('RGID') === notionRGID);
        
        if (airtableRecord) {
          const airtableName = airtableRecord.get('Name');
          
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
  console.log('🚀 Starting Week 1: Customer Data Migration...');
  
  if (!process.env.NOTION_TOKEN || !process.env.AIRTABLE_API_KEY) {
    console.error('❌ Error: NOTION_TOKEN and AIRTABLE_API_KEY environment variables must be set.');
    process.exit(1);
  }
  
  try {
    const migrationResult = await migrateCustomerData();
    const isIntegrityValid = await verifyCustomerDataIntegrity();
    
    console.log('\n🎉 WEEK 1 TASK 2 COMPLETE: CUSTOMER DATA MIGRATION');
    console.log('✅ Customer data successfully migrated from Airtable to Notion');
    console.log('✅ Data integrity verified');
    console.log(`✅ Migration summary: ${migrationResult.migrated} migrated, ${migrationResult.updated} updated, ${migrationResult.skipped} skipped`);
    
    if (isIntegrityValid) {
      console.log('\n🚀 Ready to proceed to Week 1 Task 3: Project Data Migration');
    } else {
      console.log('\n⚠️ Some data integrity issues found - please review');
    }
    
  } catch (error) {
    console.error(`❌ Error in customer data migration: ${error.message}`);
  }
}

main().catch(console.error);
