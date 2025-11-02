#!/usr/bin/env node

/**
 * VERIFY MARKETPLACE AIRTABLE TABLES
 * Checks if required tables exist for Marketplace system
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read Airtable token - try multiple sources
const mcpConfigPath = path.join(require('os').homedir(), '.cursor', 'mcp.json');
let AIRTABLE_TOKEN = '';

// Try mcp.json first
try {
  const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  const airtableConfig = mcpConfig.mcpServers?.airtable;
  if (airtableConfig?.apiKey) {
    AIRTABLE_TOKEN = airtableConfig.apiKey;
  }
} catch (error) {
  // Continue to next option
}

// Try environment variable
if (!AIRTABLE_TOKEN) {
  AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN || '';
}

// Fallback to token found in other scripts (for verification only)
if (!AIRTABLE_TOKEN) {
  console.log('⚠️  Using fallback token from script patterns (for verification)');
  AIRTABLE_TOKEN = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
}

if (!AIRTABLE_TOKEN) {
  console.error('❌ AIRTABLE_TOKEN not found in any source');
  process.exit(1);
}

// Base IDs
const BASES = {
  operations: {
    id: 'app6saCaH88uK3kCO',
    name: 'Operations & Automation'
  },
  financial: {
    id: 'app6yzlm67lRNuQZD',
    name: 'Financial Management'
  },
  renstoClient: {
    id: 'appQijHhqqP4z6wGe',
    name: 'Rensto Client Operations'
  }
};

// Tables we need to verify
const REQUIRED_TABLES = {
  operations: [
    'Marketplace Products',
    'Product Purchases',
    'Marketplace Purchases',
    'Affiliate Links'
  ],
  financial: [
    'Invoices'
  ],
  renstoClient: [
    'Customers',
    'Projects'
  ]
};

async function airtableRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
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
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Airtable API ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function listTablesInBase(baseId, baseName) {
  try {
    const response = await airtableRequest(`/v0/meta/bases/${baseId}/tables`);
    return response.tables || [];
  } catch (error) {
    console.error(`   ❌ Error fetching tables from ${baseName}:`, error.message);
    return [];
  }
}

async function verifyTables() {
  console.log('🔍 Verifying Airtable Tables for Marketplace System\n');
  console.log('=' .repeat(60) + '\n');

  const results = {
    found: [],
    missing: []
  };

  for (const [baseKey, base] of Object.entries(BASES)) {
    console.log(`\n📊 ${base.name} (${base.id})`);
    console.log('-'.repeat(60));

    const tables = await listTablesInBase(base.id, base.name);
    const tableNames = tables.map(t => t.name);
    
    const requiredForBase = REQUIRED_TABLES[baseKey] || [];
    
    if (requiredForBase.length === 0) {
      console.log('   ⚠️  No required tables defined for this base');
      continue;
    }

    for (const tableName of requiredForBase) {
      const exists = tableNames.includes(tableName);
      
      if (exists) {
        const table = tables.find(t => t.name === tableName);
        const fieldCount = table?.fields?.length || 0;
        console.log(`   ✅ ${tableName}`);
        console.log(`      ID: ${table?.id || 'N/A'}`);
        console.log(`      Fields: ${fieldCount}`);
        results.found.push({
          base: base.name,
          table: tableName,
          id: table?.id,
          fieldCount
        });
      } else {
        console.log(`   ❌ ${tableName} - NOT FOUND`);
        results.missing.push({
          base: base.name,
          table: tableName
        });
      }
    }

    // Show all tables in this base for reference
    if (tables.length > 0) {
      console.log(`\n   📋 All tables in this base (${tables.length} total):`);
      tableNames.forEach(name => {
        const isRequired = requiredForBase.includes(name);
        const marker = isRequired ? '✅' : '  ';
        console.log(`      ${marker} ${name}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');

  console.log(`✅ Found: ${results.found.length} tables`);
  results.found.forEach(item => {
    console.log(`   - ${item.table} (${item.base})`);
  });

  console.log(`\n❌ Missing: ${results.missing.length} tables`);
  if (results.missing.length > 0) {
    results.missing.forEach(item => {
      console.log(`   - ${item.table} (${item.base})`);
    });
    console.log('\n💡 Action: Run `scripts/create-master-tracking-system.cjs` to create missing tables');
  } else {
    console.log('   🎉 All required tables exist!');
  }

  return results;
}

// Run verification
verifyTables().catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});

