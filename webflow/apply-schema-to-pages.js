#!/usr/bin/env node
/**
 * Apply Registered Schema Scripts to Specific Pages
 * Uses v2 API: PUT /v2/pages/{pageId}/custom_code
 */

import axios from 'axios';

const SITE_ID = '66c7e551a317e0e9c9f906d8';
const API_TOKEN = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';

const PAGE_SCRIPTS = {
  '68ddb0fb5b6408d0687890dd': { // Marketplace
    slug: 'marketplace',
    scriptId: 'marketplace_schema_markup'
  },
  '68dfc41ffedc0a46e687c84b': { // Subscriptions
    slug: 'subscriptions',
    scriptId: 'subscriptions_schema_markup'
  },
  '68dfc5266816931539f098d5': { // Ready Solutions
    slug: 'ready-solutions',
    scriptId: 'ready_solutions_schema_markup'
  },
  '68ddb0642b86f8d1a89ba166': { // Custom Solutions
    slug: 'custom-solutions',
    scriptId: 'custom_solutions_schema_markup'
  }
};

async function applyScriptToPage(pageId, scriptId, pageName) {
  console.log(`\n📄 Applying schema to ${pageName} (${pageId.substring(0, 8)}...)`);
  
  try {
    const response = await axios.put(
      `https://api.webflow.com/v2/pages/${pageId}/custom_code`,
      {
        scripts: [
          { scriptId: scriptId }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept-Version': '2.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`  ✅ Schema applied successfully!`);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log(`  ⚠️  OAuth required - MCP tools should handle this`);
      return { success: false, error: 'oauth_required' };
    }
    
    console.error(`  ❌ Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error(`     Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 APPLYING SCHEMA MARKUP TO PAGES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];
  
  for (const [pageId, config] of Object.entries(PAGE_SCRIPTS)) {
    const result = await applyScriptToPage(pageId, config.scriptId, config.slug);
    results.push({ page: config.slug, ...result });
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.page}: Schema applied`);
    } else if (result.error === 'oauth_required') {
      console.log(`⚠️  ${result.page}: OAuth required (use MCP tools)`);
    } else {
      console.log(`❌ ${result.page}: ${result.error}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  const oauthCount = results.filter(r => r.error === 'oauth_required').length;

  console.log('\n═══════════════════════════════════════════════════════════════');
  
  if (successCount === 4) {
    console.log('✅ ALL SCHEMA MARKUP DEPLOYED!');
  } else if (oauthCount > 0) {
    console.log('⚠️  OAuth required - scripts registered, need to apply via MCP');
    console.log('   Use MCP tools to apply scripts to pages');
  } else {
    console.log('⚠️  Some pages failed - check errors above');
  }
  
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

