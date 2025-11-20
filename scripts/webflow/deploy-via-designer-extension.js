#!/usr/bin/env node
/**
 * Deploy HTML via Webflow Designer Extension API
 * Uses the Designer Extension URI provided
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DESIGNER_EXTENSION_URL = 'https://68df6e8d3098a65fadc8f111.webflow-ext.com';
const HOMEPAGE_ID = '688967be8e345bde39d46152';
const MARKETPLACE_ID = '68ddb0fb5b6408d0687890dd';

async function deployViaDesignerExtension(pageId, pageName, htmlFile) {
  console.log(`\n📝 Deploying ${pageName} via Designer Extension...`);
  
  const htmlContent = fs.readFileSync(
    path.join(__dirname, '../../webflow/pages', htmlFile),
    'utf8'
  );
  
  console.log(`   HTML size: ${htmlContent.length} characters`);
  
  try {
    // Try Designer Extension API endpoint
    console.log(`   📤 Sending to Designer Extension...`);
    const response = await axios.put(
      `${DESIGNER_EXTENSION_URL}/api/designer/page-content/${pageId}`,
      {
        customCode: {
          bodyEnd: htmlContent  // "Code before </body> tag"
        }
      },
      {
        timeout: 15000,
        validateStatus: () => true  // Don't throw on any status
      }
    );
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data?.success) {
      console.log(`   ✅ ${pageName} deployed successfully!`);
      return { success: true };
    } else {
      console.log(`   ⚠️  Extension returned ${response.status}`);
      return { success: false, status: response.status, data: response.data };
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ Designer Extension not accessible (not running?)`);
      console.log(`   💡 Extension URL: ${DESIGNER_EXTENSION_URL}`);
      console.log(`   💡 Make sure Designer Extension is running`);
    } else if (error.response) {
      console.log(`   ❌ Error: ${error.response.status} - ${error.response.statusText}`);
      console.log(`   Details:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Deploying HTML via Designer Extension API\n');
  
  const homepage = await deployViaDesignerExtension(
    HOMEPAGE_ID,
    'Homepage',
    'WEBFLOW_EMBED_HOMEPAGE_OPTIMIZED.html'
  );
  
  const marketplace = await deployViaDesignerExtension(
    MARKETPLACE_ID,
    'Marketplace',
    'WEBFLOW_EMBED_MARKETPLACE_CVJ_OPTIMIZED.html'
  );
  
  console.log('\n📊 Results:');
  console.log(`   Homepage: ${homepage.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Marketplace: ${marketplace.success ? '✅ Success' : '❌ Failed'}`);
  
  if (homepage.success && marketplace.success) {
    console.log('\n✅ Both pages deployed! Publishing site...');
    // Trigger publish
  } else {
    console.log('\n⚠️  Some deployments failed - check errors above');
  }
}

main().catch(console.error);

