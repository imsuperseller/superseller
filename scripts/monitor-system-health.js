#!/usr/bin/env node

/**
 * MONITORING SYSTEM
 * Monitor sync health and performance
 */

import { Client as NotionClient } from '@notionhq/client';
import Airtable from 'airtable';

const notion = new NotionClient({ 
  auth: process.env.NOTION_TOKEN,
  notionVersion: "2025-09-03"
});

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

async function checkSystemHealth() {
  console.log('🔍 Checking system health...');
  
  try {
    // Test Notion connection
    const notionResponse = await notion.request({
      method: "GET",
      path: "databases/6f3c687f-91b4-46fc-a54e-193b0951d1a5",
    });
    console.log('   ✅ Notion connection: OK');
    
    // Test Airtable connection
    const airtableBase = airtable.base('app4nJpP1ytGukXQT');
    await airtableBase('Business References').select({ maxRecords: 1 }).firstPage();
    console.log('   ✅ Airtable connection: OK');
    
    console.log('   🎯 System health: EXCELLENT');
    return true;
    
  } catch (error) {
    console.error('   ❌ System health check failed:', error.message);
    return false;
  }
}

async function main() {
  const isHealthy = await checkSystemHealth();
  process.exit(isHealthy ? 0 : 1);
}

main().catch(console.error);
