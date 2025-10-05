#!/usr/bin/env node

const https = require('https');

const AIRTABLE_API_KEY = 'process.env.AIRTABLE_API_KEY || 'REPLACE_WITH_YOUR_API_KEY'';

const BASES = [
  { id: 'appQijHhqqP4z6wGe', name: 'Rensto Client Operations' },
  { id: 'app4nJpP1ytGukXQT', name: 'Core Business Operations' },
  { id: 'app6yzlm67lRNuQZD', name: 'Financial Management' },
  { id: 'appQhVkIaWoGJG301', name: 'Marketing & Sales' },
  { id: 'app6saCaH88uK3kCO', name: 'Operations & Automation' },
  { id: 'appSCBZk03GUCTfhN', name: 'Customer Success' },
  { id: 'appfpXxb5Vq8acLTy', name: 'Entities' },
  { id: 'app9oouVkvTkFjf3t', name: 'Analytics & Monitoring' },
  { id: 'appOvDNYenyx7WITR', name: 'Integrations' },
  { id: 'appCGexgpGPkMUPXF', name: 'RGID-based entity management' },
  { id: 'app9DhsrZ0VnuEH3t', name: 'Idempotency systems' }
];

async function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
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
          reject(new Error(`Request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function getBaseTables(baseId) {
  try {
    const response = await httpsRequest(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    return response.tables || [];
  } catch (error) {
    console.error(`  Error fetching tables: ${error.message}`);
    return [];
  }
}

async function getTableRecords(baseId, tableId, maxRecords = 100) {
  try {
    const response = await httpsRequest(`https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=${maxRecords}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });
    return response.records || [];
  } catch (error) {
    return [];
  }
}

function findDuplicates(records, fieldName) {
  const counts = {};
  const duplicates = {};

  records.forEach(record => {
    const value = record.fields[fieldName];
    if (!value) return;

    counts[value] = counts[value] || [];
    counts[value].push(record);
  });

  Object.entries(counts).forEach(([value, recs]) => {
    if (recs.length > 1) {
      duplicates[value] = recs;
    }
  });

  return duplicates;
}

async function auditAllBases() {
  console.log('🔍 AIRTABLE COMPREHENSIVE AUDIT\\n');
  console.log('='.repeat(80));
  console.log('\\n');

  const auditResults = {
    totalBases: 0,
    totalTables: 0,
    totalRecords: 0,
    emptyTables: [],
    duplicateTables: [],
    duplicateRecords: [],
    missingFields: [],
    testData: []
  };

  for (const base of BASES) {
    console.log(`\\n📦 BASE: ${base.name}`);
    console.log(`   ID: ${base.id}`);
    console.log('-'.repeat(80));

    auditResults.totalBases++;

    // Get all tables
    const tables = await getBaseTables(base.id);
    console.log(`   Tables found: ${tables.length}\\n`);

    auditResults.totalTables += tables.length;

    // Check for duplicate table names
    const tableNames = tables.map(t => t.name);
    const duplicateTableNames = tableNames.filter((name, index) => tableNames.indexOf(name) !== index);
    if (duplicateTableNames.length > 0) {
      auditResults.duplicateTables.push({ base: base.name, tables: duplicateTableNames });
      console.log(`   ⚠️  DUPLICATE TABLE NAMES: ${duplicateTableNames.join(', ')}\\n`);
    }

    // Audit each table
    for (const table of tables) {
      console.log(`   📊 Table: ${table.name} (${table.fields.length} fields)`);

      // Get records (sample)
      const records = await getTableRecords(base.id, table.id, 100);
      auditResults.totalRecords += records.length;

      console.log(`      Records: ${records.length}`);

      // Check if table is empty
      if (records.length === 0) {
        auditResults.emptyTables.push({ base: base.name, table: table.name, tableId: table.id });
        console.log(`      🔴 EMPTY TABLE`);
      }

      // Check for test/dummy data
      const testRecords = records.filter(r => {
        const nameField = r.fields.Name || r.fields.name || r.fields.Title || '';
        return nameField.toString().toLowerCase().includes('test') ||
               nameField.toString().toLowerCase().includes('dummy') ||
               nameField.toString().toLowerCase().includes('sample');
      });

      if (testRecords.length > 0) {
        auditResults.testData.push({
          base: base.name,
          table: table.name,
          count: testRecords.length,
          records: testRecords.map(r => ({ id: r.id, name: r.fields.Name || r.fields.name || r.fields.Title }))
        });
        console.log(`      ⚠️  TEST/DUMMY DATA: ${testRecords.length} records`);
      }

      // Check for duplicates by Name field (if exists)
      const nameField = table.fields.find(f => f.name === 'Name' || f.name === 'name');
      if (nameField && records.length > 0) {
        const duplicates = findDuplicates(records, nameField.name);
        const dupCount = Object.keys(duplicates).length;

        if (dupCount > 0) {
          auditResults.duplicateRecords.push({
            base: base.name,
            table: table.name,
            baseId: base.id,
            tableId: table.id,
            count: dupCount,
            duplicates: Object.entries(duplicates).map(([name, recs]) => ({
              name,
              count: recs.length,
              ids: recs.map(r => r.id)
            }))
          });
          console.log(`      🔴 DUPLICATE RECORDS: ${dupCount} names with duplicates`);
        }
      }

      // Check for missing RGID (if table has RGID field)
      const rgidField = table.fields.find(f => f.name === 'RGID');
      if (rgidField) {
        const missingRGID = records.filter(r => !r.fields.RGID || r.fields.RGID.trim() === '');
        if (missingRGID.length > 0) {
          auditResults.missingFields.push({
            base: base.name,
            table: table.name,
            field: 'RGID',
            count: missingRGID.length
          });
          console.log(`      ⚠️  MISSING RGID: ${missingRGID.length} records`);
        }
      }

      console.log('');
    }
  }

  // Print summary
  console.log('\\n' + '='.repeat(80));
  console.log('\\n📊 AUDIT SUMMARY\\n');
  console.log('='.repeat(80));
  console.log(`\\nTotal Bases Audited: ${auditResults.totalBases}`);
  console.log(`Total Tables: ${auditResults.totalTables}`);
  console.log(`Total Records Sampled: ${auditResults.totalRecords}`);

  console.log(`\\n🔴 ISSUES FOUND:\\n`);
  console.log(`Empty Tables: ${auditResults.emptyTables.length}`);
  console.log(`Duplicate Tables: ${auditResults.duplicateTables.length}`);
  console.log(`Tables with Duplicate Records: ${auditResults.duplicateRecords.length}`);
  console.log(`Tables with Test/Dummy Data: ${auditResults.testData.length}`);
  console.log(`Tables with Missing Fields: ${auditResults.missingFields.length}`);

  // Detailed issues
  if (auditResults.emptyTables.length > 0) {
    console.log(`\\n📋 EMPTY TABLES (${auditResults.emptyTables.length}):`);
    auditResults.emptyTables.forEach(item => {
      console.log(`   - ${item.base} > ${item.table}`);
    });
  }

  if (auditResults.duplicateRecords.length > 0) {
    console.log(`\\n📋 DUPLICATE RECORDS (${auditResults.duplicateRecords.length} tables):`);
    auditResults.duplicateRecords.forEach(item => {
      console.log(`\\n   ${item.base} > ${item.table}:`);
      console.log(`      Total duplicate names: ${item.count}`);
      item.duplicates.slice(0, 5).forEach(dup => {
        console.log(`      - "${dup.name}": ${dup.count} copies (IDs: ${dup.ids.join(', ')})`);
      });
      if (item.duplicates.length > 5) {
        console.log(`      ... and ${item.duplicates.length - 5} more`);
      }
    });
  }

  if (auditResults.testData.length > 0) {
    console.log(`\\n📋 TEST/DUMMY DATA (${auditResults.testData.length} tables):`);
    auditResults.testData.forEach(item => {
      console.log(`   - ${item.base} > ${item.table}: ${item.count} test records`);
    });
  }

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync(
    '/Users/shaifriedman/New Rensto/rensto/AIRTABLE_AUDIT_RESULTS.json',
    JSON.stringify(auditResults, null, 2)
  );

  console.log(`\\n✅ Audit complete. Results saved to AIRTABLE_AUDIT_RESULTS.json\\n`);
}

// Run audit
auditAllBases();
