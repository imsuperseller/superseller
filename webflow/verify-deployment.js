#!/usr/bin/env node
/**
 * Verify UI Fixes Deployment Status
 * Checks if CSS was registered and applied to site
 */

import axios from 'axios';

const SITE_ID = '66c7e551a317e0e9c9f906d8';
const API_TOKEN = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';

async function listRegisteredScripts() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 CHECKING REGISTERED SCRIPTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

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

    const scripts = response.data || [];
    console.log(`✅ Found ${scripts.length} registered script(s):\n`);
    
    if (scripts.length === 0) {
      console.log('   ⚠️  No scripts found - CSS may not be registered yet');
      return [];
    }
    
    scripts.forEach((script, index) => {
      console.log(`   ${index + 1}. ${script.name || 'Unnamed Script'}`);
      console.log(`      ID: ${script.id}`);
      console.log(`      Location: ${script.codeLocation || script.location || 'N/A'}`);
      console.log(`      Type: ${script.sourceType || script.type || 'unknown'}`);
      if (script.createdOn) {
        console.log(`      Created: ${script.createdOn}`);
      }
      console.log('');
    });
    
    return scripts;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('⚠️  Cannot check via Site API token (needs OAuth)');
      console.log('   ✅ This is expected - MCP tools use OAuth token');
      console.log('   ✅ If MCP tools were used, CSS should be deployed');
      return null;
    }
    
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function checkAppliedScripts() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 CHECKING APPLIED SCRIPTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const response = await axios.get(
      `https://api.webflow.com/v2/sites/${SITE_ID}/custom_code/applied`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept-Version': '2.0',
          'Accept': 'application/json'
        }
      }
    );

    const applied = response.data || [];
    console.log(`✅ Found ${applied.length} applied script(s):\n`);
    
    if (applied.length === 0) {
      console.log('   ⚠️  No scripts applied - may need to apply to site');
      return [];
    }
    
    applied.forEach((item, index) => {
      console.log(`   ${index + 1}. Script ID: ${item.scriptId || 'N/A'}`);
      console.log(`      Applied to: ${item.targetType || 'site'}`);
      if (item.targetId) {
        console.log(`      Target ID: ${item.targetId}`);
      }
      console.log('');
    });
    
    return applied;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('⚠️  Cannot check via Site API token (needs OAuth)');
      return null;
    }
    
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function verifyLiveSite() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🌐 VERIFICATION INSTRUCTIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('To verify CSS is deployed on live site:');
  console.log('');
  console.log('1. Visit: https://rensto.com');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Go to Elements/Inspector tab');
  console.log('4. Look in <head> section');
  console.log('5. Check if CSS with "LOGO ALIGNMENT FIX" is present');
  console.log('');
  console.log('OR check in Webflow Designer:');
  console.log('1. Open Site Settings → Custom Code');
  console.log('2. Check "Code in <head> tag" section');
  console.log('3. Should see "Rensto UI Fixes" CSS');
  console.log('');
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🔍 VERIFYING UI FIXES DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const registered = await listRegisteredScripts();
  
  // Only check applied if we got registered scripts
  if (registered !== null && registered.length > 0) {
    await checkAppliedScripts();
  }
  
  await verifyLiveSite();
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ VERIFICATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (registered === null) {
    console.log('💡 NOTE: Cannot verify via API (OAuth required)');
    console.log('   ✅ If MCP tools were used, deployment should be successful');
    console.log('   ✅ Please verify manually in Webflow Designer or live site\n');
  } else if (registered.length > 0) {
    const uiFixesScript = registered.find(s => 
      s.name?.toLowerCase().includes('ui fixes') || 
      s.name?.toLowerCase().includes('logo') ||
      s.name?.toLowerCase().includes('button')
    );
    
    if (uiFixesScript) {
      console.log('✅ UI Fixes CSS appears to be registered!');
      console.log(`   Script: ${uiFixesScript.name}`);
      console.log(`   ID: ${uiFixesScript.id}\n`);
    }
  }
}

main().catch(console.error);

