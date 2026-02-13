#!/usr/bin/env node
/**
 * Attempt to deploy HTML via Webflow Custom Code API
 * Strategy: Register as inline script with codeLocation: "body"
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBFLOW_API_TOKEN = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
const SITE_ID = '66c7e551a317e0e9c9f906d8';
const HOMEPAGE_ID = '688967be8e345bde39d46152';
const MARKETPLACE_ID = '68ddb0fb5b6408d0687890dd';

const API_BASE = 'https://api.webflow.com/v2';

async function deployHTML(pageId, pageName, htmlFile) {
  console.log(`\n📝 Deploying ${pageName}...`);
  
  const htmlContent = fs.readFileSync(
    path.join(__dirname, '../../webflow/pages', htmlFile),
    'utf8'
  );
  
  console.log(`   HTML size: ${htmlContent.length} characters`);
  
  // Check inline script limit (2000 chars)
  if (htmlContent.length > 2000) {
    console.log(`   ⚠️  HTML exceeds 2000 character limit for inline scripts`);
    console.log(`   💡 Attempting registration anyway (may fail, but worth trying)...`);
  }
  
  try {
    // Step 1: Register as inline script
    console.log(`   📤 Registering HTML as inline script...`);
    const registerResponse = await axios.post(
      `${API_BASE}/sites/${SITE_ID}/custom_code`,
      {
        codeLocation: 'body',
        sourceCode: htmlContent,
        name: `${pageName} Page Content`,
        canCopy: true
      },
      {
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    const scriptId = registerResponse.data.id;
    console.log(`   ✅ Registered as script: ${scriptId}`);
    
    // Step 2: Apply to page
    console.log(`   🔗 Applying script to page...`);
    const applyResponse = await axios.put(
      `${API_BASE}/pages/${pageId}/custom_code`,
      {
        scripts: [
          { scriptId: scriptId }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`   ✅ ${pageName} deployed successfully!`);
    return { success: true, scriptId };
    
  } catch (error) {
    if (error.response?.data?.message?.includes('2000')) {
      console.log(`   ❌ Failed: Inline script limit is 2000 characters`);
      console.log(`   📋 Manual paste required (API limitation)`);
    } else {
      console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      if (error.response?.data) {
        console.log(`   Details:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    return { success: false, error: error.response?.data || error.message };
  }
}

async function main() {
  console.log('🚀 Attempting HTML Deployment via Webflow API\n');
  
  const homepage = await deployHTML(HOMEPAGE_ID, 'Homepage', 'WEBFLOW_EMBED_HOMEPAGE_OPTIMIZED.html');
  const marketplace = await deployHTML(MARKETPLACE_ID, 'Marketplace', 'WEBFLOW_EMBED_MARKETPLACE_CVJ_OPTIMIZED.html');
  
  console.log('\n📊 Results:');
  console.log(`   Homepage: ${homepage.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Marketplace: ${marketplace.success ? '✅ Success' : '❌ Failed'}`);
  
  if (!homepage.success && !marketplace.success) {
    console.log('\n⚠️  Both deployments failed - likely due to size limits');
    console.log('📋 Manual paste required in Webflow Designer');
  }
}

main().catch(console.error);

