#!/usr/bin/env node

const https = require('https');

const NOTION_TOKEN = 'NOTION_TOKEN_REDACTED';
const AIRTABLE_TOKEN = 'AIRTABLE_KEY_REDACTED';

const DATABASES = [
  {
    name: 'Business References',
    notionId: '6f3c687f-91b4-46fc-a54e-193b0951d1a5',
    airtableBase: 'app4nJpP1ytGukXQT',
    airtableTable: 'Business References',
    airtableTableId: 'tbllE5b30XG00JBrn'
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

async function airtableRequest(baseId, tableName, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const path = method === 'GET'
      ? `/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=100`
      : `/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
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
          reject(new Error(`Airtable: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function extractNotionText(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  if (prop.select) return prop.select?.name || '';
  if (prop.number) return prop.number;
  if (prop.url) return prop.url;
  if (prop.email) return prop.email;
  if (prop.phone_number) return prop.phone_number;
  if (prop.date) return prop.date?.start || '';
  return '';
}

function notionToAirtableFields(notionRecord) {
  const props = notionRecord.properties;
  const fields = {};

  // Map common fields
  Object.keys(props).forEach(key => {
    const value = extractNotionText(props[key]);
    if (value !== '' && value !== null && value !== undefined) {
      fields[key] = value;
    }
  });

  return fields;
}

async function syncDatabase(db, dryRun = false) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 SYNCING: ${db.name}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(80));

  const stats = {
    added: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  try {
    // Get all records from both systems
    const notionQuery = await notionRequest(`/v1/databases/${db.notionId}/query`, 'POST', { page_size: 100 });
    const notionRecords = notionQuery.results || [];

    const airtableData = await airtableRequest(db.airtableBase, db.airtableTable);
    const airtableRecords = airtableData.records || [];

    console.log(`\n📊 Current state:`);
    console.log(`   Notion: ${notionRecords.length} records`);
    console.log(`   Airtable: ${airtableRecords.length} records`);

    // Build Airtable RGID map
    const airtableByRGID = new Map();
    airtableRecords.forEach(r => {
      const rgid = r.fields.RGID || r.fields.rgid;
      if (rgid) airtableByRGID.set(rgid, r);
    });

    console.log(`\n🔄 Processing ${notionRecords.length} Notion records...\n`);

    for (const notionRecord of notionRecords) {
      const props = notionRecord.properties;
      const rgid = extractNotionText(props.RGID || props.rgid);
      const name = extractNotionText(props.Name || props.name);

      if (!rgid) {
        console.log(`   ⚠️  Skipping "${name}" - No RGID`);
        stats.skipped++;
        continue;
      }

      const airtableFields = notionToAirtableFields(notionRecord);

      if (airtableByRGID.has(rgid)) {
        // Record exists - check if update needed
        const airtableRecord = airtableByRGID.get(rgid);
        const notionMod = new Date(notionRecord.last_edited_time);
        const airtableMod = new Date(airtableRecord.fields['Last Modified'] || airtableRecord.createdTime);

        if (notionMod > airtableMod) {
          console.log(`   📝 Updating "${name}" (Notion is newer)`);

          if (!dryRun) {
            try {
              await airtableRequest(
                db.airtableBase,
                `${db.airtableTable}/${airtableRecord.id}`,
                'PATCH',
                { fields: airtableFields }
              );
              stats.updated++;
            } catch (error) {
              console.log(`      ❌ Error: ${error.message}`);
              stats.errors++;
            }
          } else {
            stats.updated++;
          }
        } else {
          console.log(`   ✅ "${name}" is up to date`);
          stats.skipped++;
        }
      } else {
        // Record doesn't exist - add it
        console.log(`   ➕ Adding "${name}" to Airtable`);

        if (!dryRun) {
          try {
            await airtableRequest(
              db.airtableBase,
              db.airtableTable,
              'POST',
              { fields: airtableFields }
            );
            stats.added++;
          } catch (error) {
            console.log(`      ❌ Error: ${error.message}`);
            stats.errors++;
          }
        } else {
          stats.added++;
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log(`\n📊 Sync Results for ${db.name}:`);
    console.log(`   ➕ Added: ${stats.added}`);
    console.log(`   📝 Updated: ${stats.updated}`);
    console.log(`   ✅ Skipped (up to date): ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);

    return stats;

  } catch (error) {
    console.error(`\n❌ Error syncing ${db.name}:`, error.message);
    return { ...stats, errors: stats.errors + 1 };
  }
}

async function run() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('🔄 INTELLIGENT BIDIRECTIONAL SYNC');
  console.log('==================================\n');
  console.log('This will sync data from Notion to Airtable based on timestamps.');
  console.log('Only newer/missing records will be synced.\n');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  const allStats = {
    totalAdded: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalErrors: 0
  };

  for (const db of DATABASES) {
    const stats = await syncDatabase(db, dryRun);
    allStats.totalAdded += stats.added;
    allStats.totalUpdated += stats.updated;
    allStats.totalSkipped += stats.skipped;
    allStats.totalErrors += stats.errors;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('\n📊 OVERALL SUMMARY:');
  console.log(`   ➕ Total Added: ${allStats.totalAdded}`);
  console.log(`   📝 Total Updated: ${allStats.totalUpdated}`);
  console.log(`   ✅ Total Skipped: ${allStats.totalSkipped}`);
  console.log(`   ❌ Total Errors: ${allStats.totalErrors}`);

  if (dryRun) {
    console.log('\n💡 To execute the sync, run without --dry-run flag:');
    console.log('   node scripts/intelligent-bidirectional-sync.cjs\n');
  } else {
    console.log('\n✅ Sync complete!\n');
  }
}

run().catch(console.error);
