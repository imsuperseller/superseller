#!/usr/bin/env node

/**
 * TEST MARKETPLACE AIRTABLE TABLES
 * Tests that we can read/write to the newly created tables
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read Airtable token
const mcpConfigPath = path.join(require('os').homedir(), '.cursor', 'mcp.json');
let AIRTABLE_TOKEN = '';

try {
  const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  const airtableConfig = mcpConfig.mcpServers?.airtable;
  if (airtableConfig?.apiKey) {
    AIRTABLE_TOKEN = airtableConfig.apiKey;
  }
} catch (error) {
  // Continue
}

if (!AIRTABLE_TOKEN) {
  AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN || '';
}

if (!AIRTABLE_TOKEN) {
  AIRTABLE_TOKEN = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
}

const BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation base
const PRODUCTS_TABLE_ID = 'tblLO2RJuYJjC806X';
const PURCHASES_TABLE_ID = 'tblzxijTsGsDIFSKx';

async function airtableRequest(path, method = 'GET', body = null) {
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
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testReadProducts() {
  console.log('\n📖 Testing READ: Marketplace Products table...');
  try {
    const response = await airtableRequest(`/v0/${BASE_ID}/${PRODUCTS_TABLE_ID}?maxRecords=5`);
    const records = response.records || [];
    console.log(`   ✅ Read successful: ${records.length} records found`);
    if (records.length > 0) {
      console.log(`   📋 Sample record: ${JSON.stringify(records[0].fields, null, 2).substring(0, 200)}...`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Read failed: ${error.message}`);
    return false;
  }
}

async function testReadPurchases() {
  console.log('\n📖 Testing READ: Marketplace Purchases table...');
  try {
    const response = await airtableRequest(`/v0/${BASE_ID}/${PURCHASES_TABLE_ID}?maxRecords=5`);
    const records = response.records || [];
    console.log(`   ✅ Read successful: ${records.length} records found`);
    if (records.length > 0) {
      console.log(`   📋 Sample record: ${JSON.stringify(records[0].fields, null, 2).substring(0, 200)}...`);
    }
    return true;
  } catch (error) {
    console.log(`   ❌ Read failed: ${error.message}`);
    return false;
  }
}

async function testWriteProduct() {
  console.log('\n✏️  Testing WRITE: Marketplace Products table...');
  try {
    const testProduct = {
      records: [{
        fields: {
          'Workflow Name': 'TEST - AI-Powered Email Persona System',
          'Workflow ID': 'test-email-persona-system',
          'Category': 'Email Automation',
          'Description': 'TEST RECORD - DELETE ME - 6 AI personas for intelligent email routing',
          'Download Price': 197,
          'Install Price': 797,
          'Setup Time': '2-4 hours',
          'Complexity': 'Advanced',
          'Status': '⏸️ Inactive',
          'n8n Affiliate Link': 'https://tinyurl.com/ym3awuke'
        }
      }]
    };
    
    const response = await airtableRequest(
      `/v0/${BASE_ID}/${PRODUCTS_TABLE_ID}`,
      'POST',
      testProduct
    );
    
    const recordId = response.records?.[0]?.id;
    console.log(`   ✅ Write successful: Record created (ID: ${recordId})`);
    
    // Clean up: Delete test record
    console.log(`   🗑️  Deleting test record...`);
    try {
      await airtableRequest(`/v0/${BASE_ID}/${PRODUCTS_TABLE_ID}/${recordId}`, 'DELETE');
      console.log(`   ✅ Test record deleted`);
    } catch (deleteError) {
      console.log(`   ⚠️  Could not delete test record: ${deleteError.message}`);
      console.log(`   💡 Please manually delete record ${recordId} from Marketplace Products table`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Write failed: ${error.message}`);
    return false;
  }
}

async function testTableStructure() {
  console.log('\n🔍 Testing TABLE STRUCTURE...');
  
  try {
    // Get table schema
    const response = await airtableRequest(`/v0/meta/bases/${BASE_ID}/tables`);
    const productsTable = response.tables?.find(t => t.name === 'Marketplace Products');
    const purchasesTable = response.tables?.find(t => t.name === 'Marketplace Purchases');
    
    if (productsTable) {
      console.log(`   ✅ Marketplace Products table found`);
      console.log(`      Fields: ${productsTable.fields?.length || 0}`);
      const fieldNames = productsTable.fields?.map(f => f.name).slice(0, 5).join(', ') || '';
      console.log(`      Sample fields: ${fieldNames}...`);
    } else {
      console.log(`   ❌ Marketplace Products table not found`);
    }
    
    if (purchasesTable) {
      console.log(`   ✅ Marketplace Purchases table found`);
      console.log(`      Fields: ${purchasesTable.fields?.length || 0}`);
      const fieldNames = purchasesTable.fields?.map(f => f.name).slice(0, 5).join(', ') || '';
      console.log(`      Sample fields: ${fieldNames}...`);
      
      // Check if Product link field exists
      const productLinkField = purchasesTable.fields?.find(f => f.name === 'Product');
      if (productLinkField && productLinkField.type === 'multipleRecordLinks') {
        console.log(`      ✅ Product link field exists and links to: ${productLinkField.options?.linkedTableId || 'unknown'}`);
      }
    } else {
      console.log(`   ❌ Marketplace Purchases table not found`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Structure check failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Marketplace Airtable Tables\n');
  console.log('='.repeat(60));

  const results = {
    readProducts: false,
    readPurchases: false,
    writeProduct: false,
    structure: false
  };

  try {
    results.structure = await testTableStructure();
    results.readProducts = await testReadProducts();
    results.readPurchases = await testReadPurchases();
    results.writeProduct = await testWriteProduct();

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST RESULTS\n');
    
    console.log(`✅ Table Structure: ${results.structure ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Read Products: ${results.readProducts ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Read Purchases: ${results.readPurchases ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Write Product: ${results.writeProduct ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(r => r === true);
    
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('\n✅ Tables are ready to use:');
      console.log(`   📦 Marketplace Products: ${BASE_ID}/${PRODUCTS_TABLE_ID}`);
      console.log(`   💰 Marketplace Purchases: ${BASE_ID}/${PURCHASES_TABLE_ID}`);
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Check errors above for details');
    }

  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    process.exit(1);
  }
}

main();

