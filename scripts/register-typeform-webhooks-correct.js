#!/usr/bin/env node

/**
 * Register Typeform Webhooks with Correct n8n URLs
 * Uses the format: {workflow-id}/{node-name}/webhook
 */

const https = require('https');

const TYPEFORM_API_TOKEN = 'tfp_...[REDACTED]';
const N8N_BASE_URL = 'http://173.254.201.134:5678';

const WEBHOOKS = [
  {
    formId: 'jqrAhQHW',
    formName: 'Ready Solutions Quiz',
    workflowId: 'KXVJUtRiwozkKBmO',
    webhookTag: 'n8n-ss6lfgypek',
    webhookPath: 'KXVJUtRiwozkKBmO/typeform trigger/webhook'
  },
  {
    formId: 'ydoAn3hv',
    formName: 'Template Request',
    workflowId: '1NgUtwNhG19JoVCX',
    webhookTag: 'n8n-ifsdodhorz',
    webhookPath: '1NgUtwNhG19JoVCX/typeform trigger/webhook'
  },
  {
    formId: 'TBij585m',
    formName: 'Readiness Scorecard',
    workflowId: 'NgqR5LtBhhaFQ8j0',
    webhookTag: 'n8n-ipnv8bn6pl',
    webhookPath: 'NgqR5LtBhhaFQ8j0/typeform trigger/webhook'
  }
];

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.typeform.com',
      path: path,
      method: method,
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
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
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

async function registerWebhooks() {
  console.log('🔧 Registering Typeform Webhooks with Correct n8n URLs...\n');

  for (const webhook of WEBHOOKS) {
    console.log(`\n=== ${webhook.formName} (Form: ${webhook.formId}) ===`);
    
    const webhookUrl = `${N8N_BASE_URL}/webhook/${webhook.webhookPath}`;
    console.log(`  Webhook URL: ${webhookUrl}`);
    console.log(`  Webhook Tag: ${webhook.webhookTag}`);
    
    try {
      const result = await makeRequest(
        `/forms/${webhook.formId}/webhooks/${webhook.webhookTag}`,
        'PUT',
        {
          url: webhookUrl,
          enabled: true
        }
      );
      
      if (result.status === 200 || result.status === 201) {
        console.log(`  ✅ Webhook registered successfully`);
        console.log(`     ID: ${result.data.id || webhook.webhookTag}`);
        console.log(`     Enabled: ${result.data.enabled ? 'YES' : 'NO'}`);
      } else {
        console.log(`  ❌ Failed: ${result.status}`);
        console.log(`     Response: ${JSON.stringify(result.data).substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n\n✅ Webhook registration complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test each webhook from Typeform admin');
  console.log('2. Check n8n executions: http://173.254.201.134:5678/executions');
  console.log('3. Verify Boost.space contacts are created');
}

registerWebhooks().catch(console.error);

