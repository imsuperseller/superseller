#!/usr/bin/env node

const https = require('https');

const NOTION_TOKEN = 'NOTION_TOKEN_REDACTED';
const AIRTABLE_TOKEN = 'AIRTABLE_KEY_REDACTED';

const DATABASES = [
  {
    name: 'Business References',
    notionId: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtableBase: 'app4nJpP1ytGukXQT',
    airtableTable: 'Business References'
  },
  {
    name: 'Customer Management',
    notionId: '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
    airtableBase: 'appQijHhqqP4z6wGe',
    airtableTable: 'Customers'
  },
  {
    name: 'Project Tracking',
    notionId: '2123596d-d33c-40bb-91d9-3d2983dbfb23',
    airtableBase: 'appQijHhqqP4z6wGe',
    airtableTable: 'Projects'
  }
];

async function notionRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Notion: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function airtableRequest(baseId, tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=100`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Airtable: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function extractNotionText(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  if (prop.select) return prop.select?.name || '';
  if (prop.number) return prop.number;
  return '';
}

async function analyzeDatabase(db) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 ANALYZING: ${db.name}`);
  console.log('='.repeat(80));

  // Get Notion data
  const notionQuery = await notionRequest(`/v1/databases/${db.notionId}/query`, 'POST', { page_size: 100 });
  const notionRecords = notionQuery.results || [];

  // Get Airtable data
  const airtableData = await airtableRequest(db.airtableBase, db.airtableTable);
  const airtableRecords = airtableData.records || [];

  console.log(`\n📦 RECORD COUNTS:`);
  console.log(`   Notion: ${notionRecords.length} records`);
  console.log(`   Airtable: ${airtableRecords.length} records`);

  // Build maps by RGID
  const notionByRGID = new Map();
  const notionByName = new Map();
  const airtableByRGID = new Map();
  const airtableByName = new Map();

  // Process Notion records
  notionRecords.forEach(record => {
    const props = record.properties;
    const rgid = extractNotionText(props.RGID || props.rgid);
    const name = extractNotionText(props.Name || props.name);
    const created = record.created_time;
    const modified = record.last_edited_time;

    const data = {
      id: record.id,
      rgid,
      name,
      created,
      modified,
      properties: props,
      source: 'Notion'
    };

    if (rgid) notionByRGID.set(rgid, data);
    if (name) notionByName.set(name.toLowerCase().trim(), data);
  });

  // Process Airtable records
  airtableRecords.forEach(record => {
    const fields = record.fields;
    const rgid = fields.RGID || fields.rgid || '';
    const name = fields.Name || fields.name || '';

    const data = {
      id: record.id,
      rgid,
      name,
      created: record.createdTime,
      modified: fields['Last Modified'] || record.createdTime,
      fields,
      source: 'Airtable'
    };

    if (rgid) airtableByRGID.set(rgid, data);
    if (name) airtableByName.set(name.toLowerCase().trim(), data);
  });

  console.log(`\n🔍 RGID ANALYSIS:`);
  console.log(`   Notion records with RGID: ${notionByRGID.size}`);
  console.log(`   Airtable records with RGID: ${airtableByRGID.size}`);

  // Analysis results
  const analysis = {
    database: db.name,
    onlyInNotion: [],
    onlyInAirtable: [],
    inBoth: [],
    duplicatesNoRGID: [],
    recommendations: []
  };

  // Find records only in Notion
  notionRecords.forEach(nr => {
    const rgid = extractNotionText(nr.properties.RGID || nr.properties.rgid);
    const name = extractNotionText(nr.properties.Name || nr.properties.name);

    if (rgid && airtableByRGID.has(rgid)) {
      // In both - compare timestamps
      const ar = airtableByRGID.get(rgid);
      const notionMod = new Date(nr.last_edited_time);
      const airtableMod = new Date(ar.modified);

      analysis.inBoth.push({
        rgid,
        name,
        notionModified: nr.last_edited_time,
        airtableModified: ar.modified,
        newer: notionMod > airtableMod ? 'Notion' : 'Airtable',
        action: notionMod > airtableMod ? 'Update Airtable from Notion' : 'Update Notion from Airtable'
      });
    } else if (!rgid && name && airtableByName.has(name.toLowerCase().trim())) {
      // No RGID but name matches - possible duplicate
      analysis.duplicatesNoRGID.push({
        name,
        notionId: nr.id,
        airtableId: airtableByName.get(name.toLowerCase().trim()).id,
        action: 'Add RGID to both, then sync'
      });
    } else {
      // Only in Notion
      analysis.onlyInNotion.push({
        name,
        rgid,
        notionId: nr.id,
        created: nr.created_time,
        modified: nr.last_edited_time,
        action: rgid ? 'Add to Airtable' : 'Generate RGID, then add to Airtable'
      });
    }
  });

  // Find records only in Airtable
  airtableRecords.forEach(ar => {
    const rgid = ar.fields.RGID || ar.fields.rgid || '';
    const name = ar.fields.Name || ar.fields.name || '';

    if (rgid && !notionByRGID.has(rgid)) {
      analysis.onlyInAirtable.push({
        name,
        rgid,
        airtableId: ar.id,
        created: ar.createdTime,
        modified: ar.fields['Last Modified'] || ar.createdTime,
        action: 'Add to Notion'
      });
    } else if (!rgid && name && !notionByName.has(name.toLowerCase().trim())) {
      analysis.onlyInAirtable.push({
        name,
        rgid: 'MISSING',
        airtableId: ar.id,
        created: ar.createdTime,
        action: 'Generate RGID, add to Notion'
      });
    }
  });

  // Generate recommendations
  console.log(`\n📋 DETAILED ANALYSIS:\n`);

  if (analysis.onlyInNotion.length > 0) {
    console.log(`🔵 ONLY IN NOTION (${analysis.onlyInNotion.length} records):`);
    analysis.onlyInNotion.slice(0, 5).forEach(r => {
      console.log(`   - "${r.name}" (${r.rgid || 'NO RGID'})`);
      console.log(`     Created: ${r.created}`);
      console.log(`     Action: ${r.action}`);
    });
    if (analysis.onlyInNotion.length > 5) {
      console.log(`   ... and ${analysis.onlyInNotion.length - 5} more`);
    }
    analysis.recommendations.push({
      type: 'sync_to_airtable',
      count: analysis.onlyInNotion.length,
      action: 'Add these Notion records to Airtable'
    });
  }

  if (analysis.onlyInAirtable.length > 0) {
    console.log(`\n🟠 ONLY IN AIRTABLE (${analysis.onlyInAirtable.length} records):`);
    analysis.onlyInAirtable.slice(0, 5).forEach(r => {
      console.log(`   - "${r.name}" (${r.rgid || 'NO RGID'})`);
      console.log(`     Created: ${r.created}`);
      console.log(`     Action: ${r.action}`);
    });
    if (analysis.onlyInAirtable.length > 5) {
      console.log(`   ... and ${analysis.onlyInAirtable.length - 5} more`);
    }
    analysis.recommendations.push({
      type: 'sync_to_notion',
      count: analysis.onlyInAirtable.length,
      action: 'Add these Airtable records to Notion'
    });
  }

  if (analysis.inBoth.length > 0) {
    console.log(`\n✅ IN BOTH SYSTEMS (${analysis.inBoth.length} records):`);
    const needsNotionUpdate = analysis.inBoth.filter(r => r.newer === 'Airtable').length;
    const needsAirtableUpdate = analysis.inBoth.filter(r => r.newer === 'Notion').length;

    console.log(`   ${needsAirtableUpdate} need Airtable update (Notion is newer)`);
    console.log(`   ${needsNotionUpdate} need Notion update (Airtable is newer)`);

    if (needsNotionUpdate > 0) {
      analysis.recommendations.push({
        type: 'update_notion',
        count: needsNotionUpdate,
        action: 'Update Notion records with newer Airtable data'
      });
    }

    if (needsAirtableUpdate > 0) {
      analysis.recommendations.push({
        type: 'update_airtable',
        count: needsAirtableUpdate,
        action: 'Update Airtable records with newer Notion data'
      });
    }
  }

  if (analysis.duplicatesNoRGID.length > 0) {
    console.log(`\n⚠️  DUPLICATES WITHOUT RGID (${analysis.duplicatesNoRGID.length} records):`);
    analysis.duplicatesNoRGID.forEach(r => {
      console.log(`   - "${r.name}"`);
      console.log(`     Action: ${r.action}`);
    });
    analysis.recommendations.push({
      type: 'fix_rgid',
      count: analysis.duplicatesNoRGID.length,
      action: 'Add RGID to matched records'
    });
  }

  console.log(`\n💡 RECOMMENDATIONS:\n`);
  analysis.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec.action} (${rec.count} records)`);
  });

  return analysis;
}

async function run() {
  console.log('🔍 DEEP SYNC ANALYSIS - Comparing Notion vs Airtable\n');
  console.log('This will analyze all records, compare timestamps, and determine sync direction.\n');

  const allAnalysis = [];

  for (const db of DATABASES) {
    try {
      const analysis = await analyzeDatabase(db);
      allAnalysis.push(analysis);
    } catch (error) {
      console.error(`\n❌ Error analyzing ${db.name}:`, error.message);
    }
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    '/Users/shaifriedman/New Rensto/rensto/DEEP_SYNC_ANALYSIS_RESULTS.json',
    JSON.stringify(allAnalysis, null, 2)
  );

  console.log(`\n${'='.repeat(80)}`);
  console.log('\n✅ Analysis complete. Results saved to DEEP_SYNC_ANALYSIS_RESULTS.json\n');

  // Summary
  console.log('📊 OVERALL SUMMARY:\n');
  allAnalysis.forEach(a => {
    console.log(`${a.database}:`);
    console.log(`  - Only in Notion: ${a.onlyInNotion.length}`);
    console.log(`  - Only in Airtable: ${a.onlyInAirtable.length}`);
    console.log(`  - In both systems: ${a.inBoth.length}`);
    console.log(`  - Duplicates (no RGID): ${a.duplicatesNoRGID.length}`);
    console.log(`  - Actions needed: ${a.recommendations.length}\n`);
  });
}

run().catch(console.error);
