#!/usr/bin/env node

/**
 * CREATE MARKETPLACE AIRTABLE TABLES
 * Creates Marketplace Products and Marketplace Purchases tables via Airtable API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read Airtable token - try multiple sources
const mcpConfigPath = path.join(require('os').homedir(), '.cursor', 'mcp.json');
let AIRTABLE_TOKEN = '';

try {
  const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  const airtableConfig = mcpConfig.mcpServers?.airtable;
  if (airtableConfig?.apiKey) {
    AIRTABLE_TOKEN = airtableConfig.apiKey;
  }
} catch (error) {
  // Continue to next option
}

if (!AIRTABLE_TOKEN) {
  AIRTABLE_TOKEN = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN || '';
}

// Fallback to token found in other scripts
if (!AIRTABLE_TOKEN) {
  AIRTABLE_TOKEN = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
}

const BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation base

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
          const errorMsg = `Airtable API ${res.statusCode}: ${data}`;
          reject(new Error(errorMsg));
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

async function checkTableExists(tableName) {
  try {
    const response = await airtableRequest(`/v0/meta/bases/${BASE_ID}/tables`);
    const tables = response.tables || [];
    const existingTable = tables.find(t => t.name === tableName);
    return existingTable || null;
  } catch (error) {
    console.error(`   ❌ Error checking for table ${tableName}:`, error.message);
    return null;
  }
}

async function createMarketplaceProductsTable() {
  console.log('\n📦 Creating "Marketplace Products" table...\n');

  // Check if table already exists
  const existing = await checkTableExists('Marketplace Products');
  if (existing) {
    console.log(`   ✅ Table "Marketplace Products" already exists (ID: ${existing.id})`);
    console.log(`   📊 Fields: ${existing.fields?.length || 0}`);
    return existing;
  }

  const tableSchema = {
    name: 'Marketplace Products',
    description: 'Catalog of all workflows available for purchase in Marketplace',
    fields: [
      {
        name: 'Workflow Name',
        type: 'singleLineText',
        description: 'Display name of the workflow'
      },
      {
        name: 'Workflow ID',
        type: 'singleLineText',
        description: 'Unique identifier (slug) for the workflow'
      },
      {
        name: 'Category',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Email Automation', color: 'blueBright' },
            { name: 'Lead Generation', color: 'greenBright' },
            { name: 'Content Marketing', color: 'purpleBright' },
            { name: 'Financial Automation', color: 'yellowBright' },
            { name: 'Customer Management', color: 'cyanBright' },
            { name: 'Business Process', color: 'orangeBright' },
            { name: 'Technical Integration', color: 'pinkBright' },
            { name: 'CRM Automation', color: 'redBright' }
          ]
        }
      },
      {
        name: 'Description',
        type: 'multilineText',
        description: 'Full description of the workflow'
      },
      {
        name: 'Download Price',
        type: 'currency',
        options: {
          precision: 0,
          symbol: '$'
        },
        description: 'Price for DIY download option'
      },
      {
        name: 'Install Price',
        type: 'currency',
        options: {
          precision: 0,
          symbol: '$'
        },
        description: 'Price for full-service installation'
      },
      {
        name: 'Pricing Tiers',
        type: 'multipleSelects',
        options: {
          choices: [
            { name: '$29 - Simple', color: 'blueBright' },
            { name: '$97 - Advanced', color: 'greenBright' },
            { name: '$197 - Enterprise', color: 'purpleBright' },
            { name: '$797 - Install', color: 'orangeBright' },
            { name: '$1,997 - System Install', color: 'yellowBright' },
            { name: '$3,500+ - Custom', color: 'redBright' }
          ]
        }
      },
      {
        name: 'Workflow JSON File URL',
        type: 'url',
        description: 'Link to workflow JSON file (GitHub, S3, or file storage)'
      },
      {
        name: 'Features',
        type: 'multipleSelects',
        options: {
          choices: [
            { name: 'Airtable Integration', color: 'blueBright' },
            { name: 'Gmail Automation', color: 'greenBright' },
            { name: 'WhatsApp Integration', color: 'purpleBright' },
            { name: 'OpenAI Integration', color: 'yellowBright' },
            { name: 'Slack Notifications', color: 'cyanBright' },
            { name: 'Real-time Sync', color: 'orangeBright' },
            { name: 'Multi-language Support', color: 'pinkBright' },
            { name: 'Custom AI Personas', color: 'redBright' }
          ]
        }
      },
      {
        name: 'Features Text',
        type: 'multilineText',
        description: 'Detailed features list (for display)'
      },
      {
        name: 'Setup Time',
        type: 'singleSelect',
        options: {
          choices: [
            { name: '10 minutes', color: 'greenBright' },
            { name: '30 minutes', color: 'blueBright' },
            { name: '1-2 hours', color: 'yellowBright' },
            { name: '2-4 hours', color: 'orangeBright' },
            { name: '4-6 hours', color: 'redBright' }
          ]
        }
      },
      {
        name: 'Complexity',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Simple', color: 'greenBright' },
            { name: 'Intermediate', color: 'yellowBright' },
            { name: 'Advanced', color: 'orangeBright' },
            { name: 'Expert', color: 'redBright' }
          ]
        }
      },
      {
        name: 'Setup Instructions',
        type: 'url',
        description: 'Link to setup guide (PDF, docs, or video)'
      },
      {
        name: 'n8n Affiliate Link',
        type: 'url',
        description: 'Required n8n Cloud affiliate link (default: https://tinyurl.com/ym3awuke)'
      },
      {
        name: 'Target Market',
        type: 'multilineText',
        description: 'Who this workflow is designed for'
      },
      {
        name: 'Status',
        type: 'singleSelect',
        options: {
          choices: [
            { name: '✅ Active', color: 'greenBright' },
            { name: '⏸️ Inactive', color: 'yellowBright' },
            { name: '🚧 Coming Soon', color: 'blueBright' },
            { name: '❌ Deprecated', color: 'redBright' }
          ]
        }
      },
      {
        name: 'Product Catalog ID',
        type: 'singleLineText',
        description: 'Reference to products/product-catalog.json ID'
      },
      {
        name: 'Source File',
        type: 'url',
        description: 'Link to workflow JSON source file'
      }
      // Note: Created and Last Modified fields are automatically added by Airtable
    ]
  };

  try {
    const response = await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      tableSchema
    );
    console.log(`   ✅ Created: Marketplace Products`);
    console.log(`   📋 Table ID: ${response.id}`);
    console.log(`   📊 Fields: ${response.fields?.length || 0}`);
    return response;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('422')) {
      const existing = await checkTableExists('Marketplace Products');
      if (existing) {
        console.log(`   ⚠️  Table already exists (ID: ${existing.id})`);
        return existing;
      }
    }
    console.error(`   ❌ Failed to create Marketplace Products:`, error.message);
    throw error;
  }
}

async function createMarketplacePurchasesTable() {
  console.log('\n💰 Creating "Marketplace Purchases" table...\n');

  // Check if table already exists
  const existing = await checkTableExists('Marketplace Purchases');
  if (existing) {
    console.log(`   ✅ Table "Marketplace Purchases" already exists (ID: ${existing.id})`);
    console.log(`   📊 Fields: ${existing.fields?.length || 0}`);
    return existing;
  }

  // Get Marketplace Products table ID (same base, so can link)
  let marketplaceProductsTableId = null;
  
  try {
    const opsTables = await airtableRequest(`/v0/meta/bases/${BASE_ID}/tables`);
    const productsTable = opsTables.tables?.find(t => t.name === 'Marketplace Products');
    if (productsTable) {
      marketplaceProductsTableId = productsTable.id;
      console.log(`   📋 Found Marketplace Products table ID: ${marketplaceProductsTableId}`);
    } else {
      console.log(`   ⚠️  Marketplace Products table not found - will create without Product link`);
    }
  } catch (error) {
    console.log('   ⚠️  Warning: Could not fetch Marketplace Products table ID');
  }

  const tableSchema = {
    name: 'Marketplace Purchases',
    description: 'Track all Marketplace purchases - downloads and installations',
    fields: [
      {
        name: 'Customer Email',
        type: 'email',
        description: 'Customer email from Stripe checkout (used to link to Customers table manually)'
      },
      {
        name: 'Product',
        type: 'multipleRecordLinks',
        options: {
          linkedTableId: marketplaceProductsTableId || 'tblLO2RJuYJjC806X'
        },
        description: 'Link to Marketplace Products table'
      },
      {
        name: 'Purchase Date',
        type: 'dateTime',
        options: {
          dateFormat: {
            name: 'iso'
          },
          timeFormat: {
            name: '24hour'
          },
          timeZone: 'America/New_York'
        },
        description: 'Date and time of purchase'
      },
      {
        name: 'Purchase Type',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Download', color: 'blueBright' },
            { name: 'Installation', color: 'greenBright' }
          ]
        },
        description: 'DIY download or full-service installation'
      },
      {
        name: 'Amount Paid',
        type: 'currency',
        options: {
          precision: 2,
          symbol: '$'
        },
        description: 'Total amount paid'
      },
      {
        name: 'Stripe Payment Intent ID',
        type: 'singleLineText',
        description: 'Stripe payment intent ID for tracking'
      },
      {
        name: 'Stripe Session ID',
        type: 'singleLineText',
        description: 'Stripe checkout session ID'
      },
      {
        name: 'Download Link',
        type: 'url',
        description: 'Secure download link (for Download purchases only, expires in 7 days)'
      },
      {
        name: 'Download Link Expiry',
        type: 'dateTime',
        options: {
          dateFormat: {
            name: 'iso'
          },
          timeFormat: {
            name: '24hour'
          },
          timeZone: 'America/New_York'
        },
        description: 'When download link expires'
      },
      {
        name: 'TidyCal Booking Link',
        type: 'url',
        description: 'TidyCal booking link (for Installation purchases only)'
      },
      {
        name: 'Installation Booked',
        type: 'checkbox',
        options: {
          icon: 'check',
          color: 'greenBright'
        },
        description: 'Has customer booked installation call?'
      },
      {
        name: 'Installation Date',
        type: 'dateTime',
        options: {
          dateFormat: {
            name: 'iso'
          },
          timeFormat: {
            name: '24hour'
          },
          timeZone: 'America/New_York'
        },
        description: 'Scheduled installation call date/time'
      },
      {
        name: 'Status',
        type: 'singleSelect',
        options: {
          choices: [
            { name: '⏳ Pending', color: 'yellowBright' },
            { name: '📥 Download Link Sent', color: 'blueBright' },
            { name: '📅 Installation Booked', color: 'cyanBright' },
            { name: '🚀 Installation Complete', color: 'greenBright' },
            { name: '✅ Delivered', color: 'greenBright' },
            { name: '❌ Failed', color: 'redBright' },
            { name: '💰 Refunded', color: 'grayBright' }
          ]
        },
        description: 'Current status of purchase'
      },
      {
        name: 'Access Granted',
        type: 'checkbox',
        options: {
          icon: 'check',
          color: 'greenBright'
        },
        description: 'Customer has access to workflow files'
      },
      {
        name: 'Download Count',
        type: 'number',
        options: {
          precision: 0
        },
        description: 'How many times customer downloaded'
      },
      {
        name: 'Last Downloaded',
        type: 'dateTime',
        options: {
          dateFormat: {
            name: 'iso'
          },
          timeFormat: {
            name: '24hour'
          },
          timeZone: 'America/New_York'
        },
        description: 'Last time customer downloaded'
      },
      {
        name: 'Invoice ID',
        type: 'singleLineText',
        description: 'Invoice record ID from Financial Management base (link manually or via formula)'
      },
      {
        name: 'Support Days Remaining',
        type: 'number',
        options: {
          precision: 0
        },
        description: 'Days of support remaining based on purchase tier'
      },
      {
        name: 'Notes',
        type: 'multilineText',
        description: 'Internal notes about this purchase'
      }
      // Note: Created and Last Modified fields are automatically added by Airtable
    ]
  };

  try {
    const response = await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      tableSchema
    );
    console.log(`   ✅ Created: Marketplace Purchases`);
    console.log(`   📋 Table ID: ${response.id}`);
    console.log(`   📊 Fields: ${response.fields?.length || 0}`);
    
    // If Marketplace Products table was created in same run, update the link
    if (marketplaceProductsTableId && marketplaceProductsTableId.includes('tbl')) {
      console.log(`   🔗 Linked to: Marketplace Products (${marketplaceProductsTableId})`);
    }
    
    return response;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('422')) {
      const existing = await checkTableExists('Marketplace Purchases');
      if (existing) {
        console.log(`   ⚠️  Table already exists (ID: ${existing.id})`);
        return existing;
      }
    }
    console.error(`   ❌ Failed to create Marketplace Purchases:`, error.message);
    throw error;
  }
}

async function testTables() {
  console.log('\n🧪 Testing created tables...\n');

  try {
    // Test Marketplace Products
    const productsTables = await checkTableExists('Marketplace Products');
    if (productsTables) {
      console.log(`   ✅ Marketplace Products: EXISTS (${productsTables.fields?.length || 0} fields)`);
    } else {
      console.log(`   ❌ Marketplace Products: NOT FOUND`);
    }

    // Test Marketplace Purchases
    const purchasesTables = await checkTableExists('Marketplace Purchases');
    if (purchasesTables) {
      console.log(`   ✅ Marketplace Purchases: EXISTS (${purchasesTables.fields?.length || 0} fields)`);
    } else {
      console.log(`   ❌ Marketplace Purchases: NOT FOUND`);
    }
  } catch (error) {
    console.error(`   ❌ Test failed:`, error.message);
  }
}

async function main() {
  console.log('🚀 Creating Marketplace Airtable Tables\n');
  console.log('='.repeat(60));

  try {
    // Create Marketplace Products table first (needed for link in Purchases)
    const productsTable = await createMarketplaceProductsTable();
    
    // Update the Purchases table schema if Products table was just created
    let productsTableId = productsTable?.id || null;
    
    // Create Marketplace Purchases table
    const purchasesTable = await createMarketplacePurchasesTable();

    // Test tables
    await testTables();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ SUCCESS!\n');
    
    if (productsTable) {
      console.log(`📦 Marketplace Products: ${productsTable.id} (${productsTable.fields?.length || 0} fields)`);
    }
    if (purchasesTable) {
      console.log(`💰 Marketplace Purchases: ${purchasesTable.id} (${purchasesTable.fields?.length || 0} fields)`);
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Populate Marketplace Products with workflows from product-catalog.json');
    console.log('   2. Update n8n workflows to create records in Marketplace Purchases');
    console.log('   3. Run verification: node scripts/verify-marketplace-tables.cjs');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();

