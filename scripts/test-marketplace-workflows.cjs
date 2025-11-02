#!/usr/bin/env node

/**
 * TEST MARKETPLACE n8n WORKFLOWS
 * Tests the updated workflows with sample webhook payloads
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_URL = 'http://173.254.201.134:5678';

// Read n8n API key
const mcpConfigPath = path.join(require('os').homedir(), '.cursor', 'mcp.json');
let N8N_API_KEY = '';

try {
  const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  const n8nConfig = mcpConfig.mcpServers?.['n8n-rensto'];
  if (n8nConfig?.apiKey) {
    N8N_API_KEY = n8nConfig.apiKey;
  }
} catch (error) {
  // Continue
}

if (!N8N_API_KEY) {
  N8N_API_KEY = process.env.N8N_API_KEY || process.env.N8N_TOKEN || '';
}

// Fallback to key from other scripts
if (!N8N_API_KEY) {
  N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYyMTAxOWI4LWRlM2UtNGU3ZC1iZTYxLWY0ODg5MjVlMjVkZCIsImVtYWlsIjoic2VydmljZUByZW5zdG8uY29tIiwidXNlcm5hbWUiOiJzaGFpIiwiaWF0IjoxNzI4NTI1NTAxLCJleHAiOjE5ODc5MTUxMDEsInJvbGUiOiJvd25lciJ9.Uxv4wY8r0V4_6j2xP8Yx6Ea3a2gH1xV7xQ5xJ7xK9xL0';
}

async function triggerWebhook(webhookPath, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_URL}/webhook/${webhookPath}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
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
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function testTemplatePurchase() {
  console.log('\n🧪 Testing Template Purchase Workflow...\n');
  
  const testPayload = {
    event: 'payment_completed',
    sessionId: 'cs_test_template_' + Date.now(),
    customerEmail: 'test@rensto.com',
    customerName: 'Test Customer',
    amount: 197,
    currency: 'usd',
    flowType: 'marketplace-template',
    tier: 'advanced',
    productId: 'email-persona-system',
    metadata: {
      templateName: 'AI-Powered Email Persona System',
      templateCategory: 'Email Automation',
      templatePrice: 197
    },
    timestamp: new Date().toISOString()
  };

  try {
    console.log('📤 Sending test payload:', JSON.stringify(testPayload, null, 2));
    const response = await triggerWebhook('stripe-marketplace-template', testPayload);
    console.log('✅ Response:', JSON.stringify(response, null, 2));
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInstallPurchase() {
  console.log('\n🧪 Testing Installation Purchase Workflow...\n');
  
  const testPayload = {
    event: 'payment_completed',
    sessionId: 'cs_test_install_' + Date.now(),
    customerEmail: 'test@rensto.com',
    customerName: 'Test Customer',
    amount: 797,
    currency: 'usd',
    flowType: 'marketplace-install',
    tier: 'template',
    productId: 'email-persona-system',
    metadata: {
      templateName: 'AI-Powered Email Persona System',
      templateCategory: 'Email Automation',
      templatePrice: 797
    },
    timestamp: new Date().toISOString()
  };

  try {
    console.log('📤 Sending test payload:', JSON.stringify(testPayload, null, 2));
    const response = await triggerWebhook('stripe-marketplace-install', testPayload);
    console.log('✅ Response:', JSON.stringify(response, null, 2));
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function checkAirtableRecords() {
  console.log('\n🔍 Checking Airtable for test records...\n');
  
  // This would require Airtable API - just print instructions
  console.log('💡 Manual check required:');
  console.log('   1. Open Airtable: Operations & Automation base');
  console.log('   2. Check Marketplace Purchases table');
  console.log('   3. Look for records with test@rensto.com');
  console.log('   4. Verify fields are populated correctly');
  console.log('   5. Verify Product link works');
}

async function main() {
  console.log('🧪 Testing Marketplace n8n Workflows\n');
  console.log('='.repeat(60));

  const results = {
    template: null,
    install: null
  };

  try {
    // Test template purchase workflow
    results.template = await testTemplatePurchase();
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test installation purchase workflow
    results.install = await testInstallPurchase();

    // Check Airtable
    await checkAirtableRecords();

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST RESULTS\n');
    
    console.log(`Template Purchase: ${results.template?.success ? '✅ PASS' : '❌ FAIL'}`);
    if (results.template?.error) {
      console.log(`   Error: ${results.template.error}`);
    }
    
    console.log(`Installation Purchase: ${results.install?.success ? '✅ PASS' : '❌ FAIL'}`);
    if (results.install?.error) {
      console.log(`   Error: ${results.install.error}`);
    }

    if (results.template?.success && results.install?.success) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('\n💡 Next Steps:');
      console.log('   1. Verify records in Airtable Marketplace Purchases table');
      console.log('   2. Check that Product links are working');
      console.log('   3. Test with real Stripe checkout (test mode)');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Check errors above and workflow execution logs in n8n');
    }

  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    process.exit(1);
  }
}

main();

