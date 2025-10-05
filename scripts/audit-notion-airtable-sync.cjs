#!/usr/bin/env node

const https = require('https');

const NOTION_TOKEN = 'NOTION_TOKEN_REDACTED';
const AIRTABLE_TOKEN = 'AIRTABLE_KEY_REDACTED';

// Known Notion Database IDs from previous sync
const NOTION_DATABASES = {
  'Business References': '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
  'Customer Management': '7840ad47-64dc-4e8a-982c-cb3a0dcc3a14',
  'Project Tracking': '2123596d-d33c-40bb-91d9-3d2983dbfb23'
};

// Airtable bases and tables
const AIRTABLE_SOURCES = {
  'Business References': {
    baseId: 'app4nJpP1ytGukXQT',
    tableName: 'Business References'
  },
  'Customer Management': {
    baseId: 'appQijHhqqP4z6wGe',
    tableName: 'Customers'
  },
  'Project Tracking': {
    baseId: 'appQijHhqqP4z6wGe',
    tableName: 'Projects'
  }
};

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
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Notion API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function airtableRequest(baseId, tableName, maxRecords = 100) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=${maxRecords}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse Airtable response: ${e.message}`));
          }
        } else {
          reject(new Error(`Airtable API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function auditNotionAirtableSync() {
  console.log('🔍 NOTION-AIRTABLE SYNC AUDIT\\n');
  console.log('='.repeat(80));
  console.log('\\n');

  const auditResults = {
    timestamp: new Date().toISOString(),
    notion: {},
    airtable: {},
    syncStatus: {},
    gaps: [],
    recommendations: []
  };

  // 1. Audit Notion Databases
  console.log('📦 AUDITING NOTION DATABASES\\n');

  for (const [dbName, dbId] of Object.entries(NOTION_DATABASES)) {
    console.log(`  📊 ${dbName} (${dbId})`);

    try {
      // Get database metadata
      const dbInfo = await notionRequest(`/v1/databases/${dbId}`);

      // Query database for pages
      const queryResult = await notionRequest(`/v1/databases/${dbId}/query`, 'POST', {
        page_size: 100
      });

      auditResults.notion[dbName] = {
        id: dbId,
        title: dbInfo.title?.[0]?.plain_text || dbName,
        properties: Object.keys(dbInfo.properties || {}),
        propertyCount: Object.keys(dbInfo.properties || {}).length,
        recordCount: queryResult.results?.length || 0,
        status: 'Active',
        lastEdited: dbInfo.last_edited_time
      };

      console.log(`     Properties: ${auditResults.notion[dbName].propertyCount}`);
      console.log(`     Records: ${auditResults.notion[dbName].recordCount}`);
      console.log(`     Status: ✅ Active`);
      console.log('');

    } catch (error) {
      console.log(`     Status: ❌ Error - ${error.message}`);
      console.log('');

      auditResults.notion[dbName] = {
        id: dbId,
        status: 'Error',
        error: error.message
      };
    }
  }

  // 2. Audit Airtable Tables
  console.log('\\n📦 AUDITING AIRTABLE TABLES\\n');

  for (const [dbName, source] of Object.entries(AIRTABLE_SOURCES)) {
    console.log(`  📊 ${dbName} (Base: ${source.baseId}, Table: ${source.tableName})`);

    try {
      const tableData = await airtableRequest(source.baseId, source.tableName, 100);

      auditResults.airtable[dbName] = {
        baseId: source.baseId,
        tableName: source.tableName,
        recordCount: tableData.records?.length || 0,
        fields: tableData.records?.[0] ? Object.keys(tableData.records[0].fields) : [],
        fieldCount: tableData.records?.[0] ? Object.keys(tableData.records[0].fields).length : 0,
        status: 'Active'
      };

      console.log(`     Records: ${auditResults.airtable[dbName].recordCount}`);
      console.log(`     Fields: ${auditResults.airtable[dbName].fieldCount}`);
      console.log(`     Status: ✅ Active`);
      console.log('');

    } catch (error) {
      console.log(`     Status: ❌ Error - ${error.message}`);
      console.log('');

      auditResults.airtable[dbName] = {
        baseId: source.baseId,
        tableName: source.tableName,
        status: 'Error',
        error: error.message
      };
    }
  }

  // 3. Compare and Identify Gaps
  console.log('\\n🔍 SYNC GAP ANALYSIS\\n');

  for (const dbName of Object.keys(NOTION_DATABASES)) {
    const notionData = auditResults.notion[dbName];
    const airtableData = auditResults.airtable[dbName];

    if (!notionData || notionData.status === 'Error') {
      auditResults.gaps.push({
        type: 'notion_missing',
        database: dbName,
        issue: 'Notion database not accessible or missing',
        severity: 'Critical'
      });
      console.log(`  ❌ ${dbName}: Notion database not accessible`);
      continue;
    }

    if (!airtableData || airtableData.status === 'Error') {
      auditResults.gaps.push({
        type: 'airtable_missing',
        database: dbName,
        issue: 'Airtable table not accessible or missing',
        severity: 'Critical'
      });
      console.log(`  ❌ ${dbName}: Airtable table not accessible`);
      continue;
    }

    // Check record count discrepancy
    const recordDiff = Math.abs(notionData.recordCount - airtableData.recordCount);

    if (recordDiff > 0) {
      const percentage = ((recordDiff / Math.max(notionData.recordCount, airtableData.recordCount)) * 100).toFixed(1);
      auditResults.gaps.push({
        type: 'record_count_mismatch',
        database: dbName,
        notionCount: notionData.recordCount,
        airtableCount: airtableData.recordCount,
        difference: recordDiff,
        percentage: percentage,
        severity: percentage > 10 ? 'High' : 'Medium'
      });
      console.log(`  ⚠️  ${dbName}: Record count mismatch`);
      console.log(`      Notion: ${notionData.recordCount}, Airtable: ${airtableData.recordCount} (Δ ${recordDiff})`);
    } else {
      console.log(`  ✅ ${dbName}: Record counts match (${notionData.recordCount})`);
    }

    auditResults.syncStatus[dbName] = {
      notionRecords: notionData.recordCount,
      airtableRecords: airtableData.recordCount,
      synced: recordDiff === 0,
      lastAudit: new Date().toISOString()
    };
  }

  // 4. Check for Additional Airtable Bases that could be synced
  console.log('\\n\\n📋 ADDITIONAL SYNC OPPORTUNITIES\\n');

  const allAirtableBases = [
    { id: 'appQijHhqqP4z6wGe', name: 'Rensto Client Operations' },
    { id: 'app4nJpP1ytGukXQT', name: 'Core Business Operations' },
    { id: 'app6yzlm67lRNuQZD', name: 'Financial Management' },
    { id: 'appQhVkIaWoGJG301', name: 'Marketing & Sales' },
    { id: 'app6saCaH88uK3kCO', name: 'Operations & Automation' },
    { id: 'appSCBZk03GUCTfhN', name: 'Customer Success' }
  ];

  const syncedBases = new Set([
    'appQijHhqqP4z6wGe',  // Rensto Client Operations
    'app4nJpP1ytGukXQT'   // Core Business Operations
  ]);

  for (const base of allAirtableBases) {
    if (!syncedBases.has(base.id)) {
      auditResults.recommendations.push({
        type: 'new_sync_opportunity',
        base: base.name,
        baseId: base.id,
        priority: base.name.includes('Operations') ? 'High' : 'Medium'
      });
      console.log(`  💡 ${base.name} (${base.id}) - Not synced to Notion yet`);
    }
  }

  // 5. Generate Recommendations
  console.log('\\n\\n💡 RECOMMENDATIONS\\n');

  if (auditResults.gaps.length === 0) {
    console.log('  ✅ No sync gaps detected! All databases are in sync.\\n');
  } else {
    console.log(`  ⚠️  Found ${auditResults.gaps.length} sync gaps:\\n`);

    auditResults.gaps.forEach(gap => {
      console.log(`  ${gap.severity === 'Critical' ? '🔴' : '⚠️ '} ${gap.type}: ${gap.database}`);
      console.log(`     ${gap.issue || 'Record count mismatch'}`);
      if (gap.difference) {
        console.log(`     Action: Sync ${gap.difference} records`);
      }
      console.log('');
    });
  }

  if (auditResults.recommendations.length > 0) {
    console.log(`\\n  💡 Found ${auditResults.recommendations.length} sync opportunities:\\n`);

    auditResults.recommendations.forEach(rec => {
      console.log(`  ${rec.priority === 'High' ? '🔥' : '💡'} ${rec.type}: ${rec.base}`);
      console.log(`     Base ID: ${rec.baseId}`);
      console.log(`     Priority: ${rec.priority}`);
      console.log('');
    });
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    '/Users/shaifriedman/New Rensto/rensto/NOTION_AIRTABLE_SYNC_AUDIT.json',
    JSON.stringify(auditResults, null, 2)
  );

  console.log('\\n' + '='.repeat(80));
  console.log('\\n✅ Audit complete. Results saved to NOTION_AIRTABLE_SYNC_AUDIT.json\\n');

  // Summary
  console.log('📊 SUMMARY:\\n');
  console.log(`  Total Notion Databases: ${Object.keys(NOTION_DATABASES).length}`);
  console.log(`  Total Airtable Sources: ${Object.keys(AIRTABLE_SOURCES).length}`);
  console.log(`  Sync Gaps: ${auditResults.gaps.length}`);
  console.log(`  Sync Opportunities: ${auditResults.recommendations.length}`);
  console.log('');
}

// Run audit
auditNotionAirtableSync().catch(error => {
  console.error('\\n❌ Audit failed:', error.message);
  process.exit(1);
});
