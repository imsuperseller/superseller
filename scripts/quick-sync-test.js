#!/usr/bin/env node

/**
 * QUICK SYNC TEST
 * Simple test to verify the sync is working
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

console.log('🚀 Starting quick sync test...');

// Initialize clients
const notion = new NotionClient({ auth: process.env.NOTION_TOKEN });
const renstoClientOps = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appQijHhqqP4z6wGe');

try {
  console.log('📊 Testing Airtable connection...');
  const customersTable = renstoClientOps('Customers');
  const customers = await customersTable.select({ maxRecords: 2 }).firstPage();
  console.log(`✅ Found ${customers.length} customers in Airtable`);
  
  if (customers.length > 0) {
    const customer = customers[0];
    console.log(`   Sample customer: ${customer.get('Name')} (${customer.get('Status')})`);
  }

  console.log('📊 Testing Notion connection...');
  const notionResponse = await notion.search({
    query: '',
    filter: {
      property: 'object',
      value: 'page'
    },
    page_size: 2
  });
  console.log(`✅ Found ${notionResponse.results.length} pages in Notion`);

  console.log('🎉 Quick sync test completed successfully!');
  console.log('📋 Ready to proceed with full bidirectional sync.');

} catch (error) {
  console.error('❌ Quick sync test failed:', error.message);
  process.exit(1);
}
