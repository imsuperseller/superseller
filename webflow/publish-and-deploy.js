#!/usr/bin/env node
/**
 * Publish Site and Deploy Schema Markup
 */

import axios from 'axios';

const SITE_ID = '66c7e551a317e0e9c9f906d8';
const API_TOKEN = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';

async function publishSite() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🚀 PUBLISHING SITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const response = await axios.post(
      `https://api.webflow.com/v1/sites/${SITE_ID}/publish`,
      {
        domains: ['rensto.com', 'www.rensto.com']
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'accept-version': '1.0.0',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Site published successfully!');
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error publishing site:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    throw error;
  }
}

async function main() {
  try {
    await publishSite();
    console.log('\n✅ Publishing complete!');
    console.log('   UI fixes should now be live on https://rensto.com\n');
  } catch (error) {
    console.error('\n❌ Publishing failed. Error logged above.\n');
    process.exit(1);
  }
}

main();

