#!/usr/bin/env node
/**
 * Deploy Optimized HTML to Webflow Pages
 * Uses Webflow Pages API v2 to update custom code
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Webflow API Configuration
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN || '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
const SITE_ID = '66c7e551a317e0e9c9f906d8';

// Page IDs
const HOMEPAGE_ID = '688967be8e345bde39d46152';
const MARKETPLACE_ID = '68ddb0fb5b6408d0687890dd';

const API_BASE = 'https://api.webflow.com/v2';

async function readFile(filePath) {
  const fullPath = path.join(__dirname, '../../webflow/pages', filePath);
  return fs.readFileSync(fullPath, 'utf8');
}

async function updatePageCustomCode(pageId, htmlContent) {
  try {
    console.log(`\n📝 Updating page ${pageId}...`);
    
    // Webflow API v2 - Update page settings
    // Note: The API doesn't directly support custom code, but we can use the Pages API
    // to update page settings. Custom code might need to be set via Designer Extension API
    
    // For now, we'll try using the update_page_settings endpoint
    const response = await axios.patch(
      `${API_BASE}/pages/${pageId}`,
      {
        // The API structure - checking what fields are available
        // Custom code might be in a different endpoint
      },
      {
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log(`✅ Page ${pageId} updated`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating page ${pageId}:`, error.response?.data || error.message);
    throw error;
  }
}

async function deployViaDesignerExtension(htmlContent, pageSlug) {
  console.log(`\n⚠️  Webflow Pages API doesn't support custom code updates directly.`);
  console.log(`    Using Designer Extension approach...`);
  
  // The Designer Extension API requires OAuth flow
  // For now, we'll provide the content to paste manually
  console.log(`\n📋 Manual Step Required:`);
  console.log(`    1. Open Webflow Designer`);
  console.log(`    2. Go to ${pageSlug} page`);
  console.log(`    3. Page Settings → Custom Code → "Code before </body> tag"`);
  console.log(`    4. Paste the HTML content`);
  console.log(`\n    Content length: ${htmlContent.length} characters`);
}

async function main() {
  console.log('🚀 Deploying Optimized Pages to Webflow\n');
  
  try {
    // Read optimized HTML files
    console.log('📖 Reading optimized HTML files...');
    const homepageHTML = await readFile('WEBFLOW_EMBED_HOMEPAGE_OPTIMIZED.html');
    const marketplaceHTML = await readFile('WEBFLOW_EMBED_MARKETPLACE_CVJ_OPTIMIZED.html');
    
    console.log(`✅ Homepage HTML: ${homepageHTML.length} characters`);
    console.log(`✅ Marketplace HTML: ${marketplaceHTML.length} characters`);
    
    // Check if Webflow Pages API supports custom code updates
    console.log('\n🔍 Checking Webflow API capabilities...');
    
    // Try to get current page settings to see structure
    const homepageResponse = await axios.get(
      `${API_BASE}/pages/${HOMEPAGE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        }
      }
    );
    
    console.log('📊 Current page structure:', JSON.stringify(homepageResponse.data, null, 2));
    
    // Note: Webflow Pages API v2 doesn't directly support custom code updates
    // Custom code must be updated via Designer Extension API or manually
    console.log('\n⚠️  Webflow Pages API v2 does not support custom code updates via API');
    console.log('    Custom code must be updated via Designer Extension API or manually in Designer');
    
    // Save files for manual deployment
    const outputDir = path.join(__dirname, '../../webflow/deployment-ready');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'HOMEPAGE_READY_TO_PASTE.txt'),
      homepageHTML
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'MARKETPLACE_READY_TO_PASTE.txt'),
      marketplaceHTML
    );
    
    console.log('\n✅ Files saved for manual deployment:');
    console.log(`   - webflow/deployment-ready/HOMEPAGE_READY_TO_PASTE.txt`);
    console.log(`   - webflow/deployment-ready/MARKETPLACE_READY_TO_PASTE.txt`);
    console.log('\n📋 Next step: Use Webflow Designer Extension API or paste manually');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

main().catch(console.error);

