/**
 * Register workflows.js script to Webflow and apply to Marketplace page
 * 
 * Requires:
 * 1. workflows.js deployed to: https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js
 * 2. WEBFLOW_TOKEN env var set
 */

import axios from 'axios';

const SITE_ID = '66c7e551a317e0e9c9f906d8';
const MARKETPLACE_PAGE_ID = '68ddb0fb5b6408d0687890dd';
const SCRIPT_URL = 'https://rensto-webflow-scripts.vercel.app/marketplace/workflows.js';

const API_TOKEN = process.env.WEBFLOW_TOKEN || process.env.WEBFLOW_API_TOKEN;

async function registerScript() {
  console.log('\n📝 Registering workflows.js script to Webflow...');
  
  if (!API_TOKEN) {
    throw new Error('WEBFLOW_TOKEN environment variable required');
  }

  try {
    const response = await axios.post(
      `https://api.webflow.com/v2/sites/${SITE_ID}/custom_code`,
      {
        canCopy: true,
        codeLocation: 'bodyEnd',
        hostedLocation: SCRIPT_URL,
        name: 'Marketplace Dynamic Workflows'
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

    console.log(`  ✅ Script registered: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
      console.log('  ⚠️  Script may already be registered, checking existing scripts...');
      // Try to find existing script
      const existing = await getRegisteredScripts();
      const match = existing.find(s => s.hostedLocation?.includes('workflows.js') || s.name?.includes('workflows'));
      if (match) {
        console.log(`  ✅ Found existing script: ${match.id}`);
        return match.id;
      }
    }
    throw error;
  }
}

async function getRegisteredScripts() {
  try {
    const response = await axios.get(
      `https://api.webflow.com/v2/sites/${SITE_ID}/custom_code`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept-Version': '2.0',
          'Accept': 'application/json'
        }
      }
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching scripts:', error.message);
    return [];
  }
}

async function applyScriptToPage(scriptId) {
  console.log(`\n📄 Applying script to Marketplace page...`);
  
  try {
    // First get existing scripts on page
    const existing = await getPageScripts();
    
    // Add workflows.js script to the list
    const scripts = [...(existing || []), { scriptId }];
    
    const response = await axios.put(
      `https://api.webflow.com/v2/pages/${MARKETPLACE_PAGE_ID}/custom_code`,
      { scripts },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept-Version': '2.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`  ✅ Script applied to Marketplace page`);
    return response.data;
  } catch (error) {
    console.error(`  ❌ Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function getPageScripts() {
  try {
    const response = await axios.get(
      `https://api.webflow.com/v2/pages/${MARKETPLACE_PAGE_ID}/custom_code`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept-Version': '2.0',
          'Accept': 'application/json'
        }
      }
    );
    return response.data?.scripts || [];
  } catch (error) {
    // If endpoint doesn't exist, return empty array
    return [];
  }
}

async function verifyScriptDeployment() {
  console.log('\n🔍 Verifying script is deployed...');
  try {
    const response = await axios.head(SCRIPT_URL);
    if (response.status === 200) {
      console.log('  ✅ Script is accessible');
      return true;
    }
  } catch (error) {
    console.log('  ❌ Script not yet deployed (404)');
    console.log('     Deploy workflows.js to rensto-webflow-scripts repo first');
    return false;
  }
}

async function main() {
  console.log('🚀 Deploying workflows.js to Webflow Marketplace Page\n');
  
  // Check if script is deployed
  const isDeployed = await verifyScriptDeployment();
  if (!isDeployed) {
    console.log('\n⚠️  Script not yet accessible on CDN (Vercel may still be rebuilding)');
    console.log('    File is committed to GitHub (commit 1342be6)');
    console.log('    Proceeding with registration anyway - will work once Vercel rebuilds...\n');
  }
  
  try {
    // Register script
    const scriptId = await registerScript();
    
    // Apply to page
    await applyScriptToPage(scriptId);
    
    console.log('\n✅ Success! workflows.js added to Marketplace page');
    console.log('\n📋 Next steps:');
    console.log('   1. Add <div class="workflows-container"></div> to page via Designer');
    console.log('   2. Publish site');
    console.log('   3. Test on live site');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run when executed directly
main().catch(console.error);

export { registerScript, applyScriptToPage, verifyScriptDeployment };

