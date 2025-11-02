#!/usr/bin/env node

/**
 * POPULATE MARKETPLACE PRODUCTS TABLE
 * Reads product-catalog.json and creates records in Airtable Marketplace Products table
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
const PRODUCT_CATALOG_PATH = path.join(__dirname, '..', 'products', 'product-catalog.json');

// Pricing tier mapping: Download Price → Install Price
const INSTALL_PRICE_MULTIPLIER = 4; // Install is typically 4x download price
const MIN_INSTALL_PRICE = 797; // Minimum install price
const MAX_INSTALL_PRICE = 3500; // Maximum install price

// Category mapping: product-catalog category → Airtable singleSelect value
const CATEGORY_MAP = {
  'Email Automation': 'Email Automation',
  'Business Process': 'Business Process',
  'Content Generation': 'Content Marketing',
  'Financial Automation': 'Financial Automation',
  'Customer Management': 'Customer Management',
  'Technical Integration': 'Technical Integration'
};

// Complexity mapping
const COMPLEXITY_MAP = {
  'Simple': 'Simple',
  'Intermediate': 'Intermediate',
  'Advanced': 'Advanced',
  'Expert': 'Advanced' // Map Expert to Advanced
};

// Setup time mapping
const SETUP_TIME_MAP = {
  '10 minutes': '10 minutes',
  '30 minutes': '30 minutes',
  '1-2 hours': '1-2 hours',
  '2-4 hours': '2-4 hours',
  '3-5 hours': '2-4 hours', // Map to closest
  '4-6 hours': '4-6 hours'
};

// Feature keywords → Airtable multipleSelects mapping
const FEATURE_KEYWORDS = {
  'Airtable Integration': ['airtable', 'database', 'crm'],
  'Gmail Automation': ['gmail', 'email'],
  'WhatsApp Integration': ['whatsapp', 'messaging'],
  'OpenAI Integration': ['openai', 'ai', 'gpt', 'claude'],
  'Slack Notifications': ['slack', 'notifications', 'alerts'],
  'Real-time Sync': ['sync', 'real-time', 'live'],
  'Multi-language Support': ['multi-language', 'hebrew', 'rtl', 'translation'],
  'Custom AI Personas': ['persona', 'ai persona', 'personas']
};

// Pricing tier calculation based on price
function calculatePricingTiers(downloadPrice) {
  const tiers = [];
  if (downloadPrice <= 97) {
    tiers.push('$29 - Simple');
    if (downloadPrice >= 29) tiers.push('$97 - Advanced');
  } else if (downloadPrice <= 197) {
    tiers.push('$97 - Advanced');
    tiers.push('$197 - Enterprise');
  } else {
    tiers.push('$197 - Enterprise');
  }
  
  // Always add install tier based on install price
  const installPrice = calculateInstallPrice(downloadPrice);
  if (installPrice >= 797 && installPrice < 1997) {
    tiers.push('$797 - Install');
  } else if (installPrice >= 1997 && installPrice < 3500) {
    tiers.push('$1,997 - System Install');
  } else if (installPrice >= 3500) {
    tiers.push('$3,500+ - Custom');
  }
  
  return tiers;
}

function calculateInstallPrice(downloadPrice) {
  const calculated = Math.round(downloadPrice * INSTALL_PRICE_MULTIPLIER);
  return Math.max(MIN_INSTALL_PRICE, Math.min(MAX_INSTALL_PRICE, calculated));
}

function extractFeatures(featuresArray, description) {
  const allText = [...featuresArray, description || ''].join(' ').toLowerCase();
  const matchedFeatures = [];
  
  for (const [featureName, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      matchedFeatures.push(featureName);
    }
  }
  
  return matchedFeatures;
}

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
          reject(new Error(`Airtable API ${res.statusCode}: ${data.substring(0, 200)}`));
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

async function checkExistingProduct(workflowId) {
  try {
    const response = await airtableRequest(
      `/v0/${BASE_ID}/${PRODUCTS_TABLE_ID}?filterByFormula=${encodeURIComponent(`{Workflow ID}='${workflowId}'`)}&maxRecords=1`
    );
    return response.records?.[0] || null;
  } catch (error) {
    return null;
  }
}

async function createProductRecord(product) {
  const workflowId = product.id;
  const downloadPrice = product.price || 0;
  const installPrice = calculateInstallPrice(downloadPrice);
  const pricingTiers = calculatePricingTiers(downloadPrice);
  const features = extractFeatures(product.features || [], product.targetMarket || '');
  const featuresText = product.features?.join('\n• ') || '';
  
  // Check if workflow file exists
  let sourceFile = '';
  let workflowJsonUrl = '';
  
  if (product.source) {
    // Skip customer implementations (they're not marketplace templates)
    if (product.source.includes('implementation') || 
        product.source.includes('Shelly') || 
        product.source.includes('Ben Ginati') ||
        product.source.includes('Ben Ginati')) {
      sourceFile = '';
    } else {
      // Try different possible paths
      const possiblePaths = [
        product.source, // Original path
        path.join('workflows', path.basename(product.source)),
        path.join('workflows', 'templates', path.basename(product.source)),
        path.join('workflows', 'rensto', path.basename(product.source))
      ];
      
      for (const tryPath of possiblePaths) {
        const fullPath = path.join(__dirname, '..', tryPath);
        if (fs.existsSync(fullPath)) {
          sourceFile = tryPath;
          // In production, this would be a GitHub/CDN URL
          workflowJsonUrl = `https://github.com/imsuperseller/rensto/tree/main/${tryPath}`;
          break;
        }
      }
    }
  }
  
  const fields = {
    'Workflow Name': product.name,
    'Workflow ID': workflowId,
    'Category': CATEGORY_MAP[product.category] || 'Business Process',
    'Description': `${product.name}\n\n${product.features?.join('. ') || ''}\n\nTarget Market: ${product.targetMarket || 'General businesses'}`,
    'Download Price': downloadPrice,
    'Install Price': installPrice,
    'Pricing Tiers': pricingTiers,
    'Features': features.length > 0 ? features : undefined,
    'Features Text': featuresText || product.features?.join(', ') || '',
    'Setup Time': SETUP_TIME_MAP[product.setupTime] || '2-4 hours',
    'Complexity': COMPLEXITY_MAP[product.complexity] || 'Intermediate',
    'Target Market': product.targetMarket || '',
    'Status': '✅ Active',
    'n8n Affiliate Link': 'https://tinyurl.com/ym3awuke',
    'Product Catalog ID': workflowId,
    'Source File': sourceFile,
    'Workflow JSON File URL': workflowJsonUrl || undefined
  };
  
  // Remove undefined values
  Object.keys(fields).forEach(key => {
    if (fields[key] === undefined) {
      delete fields[key];
    }
  });
  
  return fields;
}

async function createOrUpdateProduct(product) {
  const existing = await checkExistingProduct(product.id);
  
  if (existing) {
    console.log(`   ⏩ Skipping "${product.name}" (already exists: ${existing.id})`);
    return { action: 'skipped', record: existing };
  }
  
  const fields = await createProductRecord(product);
  
  try {
    const response = await airtableRequest(
      `/v0/${BASE_ID}/${PRODUCTS_TABLE_ID}`,
      'POST',
      { records: [{ fields }] }
    );
    
    const record = response.records?.[0];
    console.log(`   ✅ Created: "${product.name}" (ID: ${record?.id})`);
    return { action: 'created', record };
  } catch (error) {
    console.error(`   ❌ Failed to create "${product.name}":`, error.message);
    return { action: 'failed', error: error.message };
  }
}

async function main() {
  console.log('🚀 Populating Marketplace Products from Product Catalog\n');
  console.log('='.repeat(60));
  
  // Read product catalog
  if (!fs.existsSync(PRODUCT_CATALOG_PATH)) {
    console.error(`❌ Product catalog not found: ${PRODUCT_CATALOG_PATH}`);
    process.exit(1);
  }
  
  const catalog = JSON.parse(fs.readFileSync(PRODUCT_CATALOG_PATH, 'utf8'));
  const products = catalog.products || [];
  
  console.log(`\n📦 Found ${products.length} products in catalog\n`);
  
  const results = {
    created: 0,
    skipped: 0,
    failed: 0
  };
  
  for (const product of products) {
    console.log(`\n📋 Processing: ${product.name}`);
    const result = await createOrUpdateProduct(product);
    
    if (result.action === 'created') {
      results.created++;
    } else if (result.action === 'skipped') {
      results.skipped++;
    } else {
      results.failed++;
    }
    
    // Rate limiting: wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  console.log(`✅ Created: ${results.created}`);
  console.log(`⏩ Skipped (already exist): ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📦 Total: ${products.length}`);
  
  if (results.created > 0) {
    console.log('\n💡 Next Steps:');
    console.log('   1. Verify records in Airtable: Marketplace Products table');
    console.log('   2. Update n8n workflows to reference these products');
    console.log('   3. Test purchase flow with one product');
  }
  
  console.log('\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});

