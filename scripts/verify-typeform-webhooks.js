#!/usr/bin/env node

/**
 * Verify Typeform Webhooks Configuration
 * Checks if webhooks are properly configured for all 3 forms
 */

const https = require('https');

const TYPEFORM_API_TOKEN = 'tfp_...[REDACTED]';

const FORMS = [
  {
    id: 'jqrAhQHW',
    name: 'Ready Solutions Industry Quiz',
    expectedWebhook: 'http://173.254.201.134:5678/webhook/typeform-ready-solutions-quiz'
  },
  {
    id: 'ydoAn3hv',
    name: 'Marketplace Template Request',
    expectedWebhook: 'http://173.254.201.134:5678/webhook/typeform-template-request'
  },
  {
    id: 'TBij585m',
    name: 'Readiness Scorecard',
    expectedWebhook: 'http://173.254.201.134:5678/webhook/typeform-readiness-scorecard'
  }
];

function makeRequest(formId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.typeform.com',
      path: `/forms/${formId}/webhooks`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, error: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function verifyWebhooks() {
  console.log('🔍 Verifying Typeform Webhooks Configuration...\n');

  for (const form of FORMS) {
    console.log(`\n📋 Form: ${form.name} (${form.id})`);
    console.log(`   Expected: ${form.expectedWebhook}`);

    try {
      const result = await makeRequest(form.id);

      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
        continue;
      }

      const webhooks = result.data.items || result.data || [];
      
      if (webhooks.length === 0) {
        console.log(`   ⚠️  NO WEBHOOKS FOUND - Webhook needs to be created!`);
        console.log(`   Action: Create webhook with URL: ${form.expectedWebhook}`);
      } else {
        console.log(`   ✅ Found ${webhooks.length} webhook(s):`);
        
        let foundMatch = false;
        webhooks.forEach((webhook, index) => {
          const isMatch = webhook.url === form.expectedWebhook;
          const status = webhook.enabled ? '✅ Enabled' : '❌ Disabled';
          const match = isMatch ? '✅ MATCH' : '❌ MISMATCH';
          
          console.log(`      ${index + 1}. ${webhook.url}`);
          console.log(`         Status: ${status}`);
          console.log(`         Match: ${match}`);
          
          if (isMatch) foundMatch = true;
        });

        if (!foundMatch) {
          console.log(`   ⚠️  NO MATCHING WEBHOOK - Expected URL not found!`);
          console.log(`   Action: Update or create webhook with URL: ${form.expectedWebhook}`);
        } else {
          const matchingWebhook = webhooks.find(w => w.url === form.expectedWebhook);
          if (!matchingWebhook.enabled) {
            console.log(`   ⚠️  WEBHOOK EXISTS BUT IS DISABLED - Enable it in Typeform admin!`);
          } else {
            console.log(`   ✅ Webhook is correctly configured and enabled!`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }

  console.log('\n\n📝 Summary:');
  console.log('   - Check each form above for webhook status');
  console.log('   - If webhooks are missing or incorrect, update them in Typeform admin');
  console.log('   - URL: https://admin.typeform.com → Form → Connect → Webhooks\n');
}

verifyWebhooks().catch(console.error);

