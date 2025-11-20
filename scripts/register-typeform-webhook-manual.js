#!/usr/bin/env node
import https from 'https';

const token = 'tfp_...[REDACTED]';
const base = 'https://n8n.rensto.com';  // Public URL via Cloudflare tunnel

// Updated webhook IDs from workflow staticData
const webhooks = [
  { 
    form: 'jqrAhQHW', 
    formName: 'Ready Solutions Quiz',
    webhookId: 'n8n-mjxvf0njku',  // Updated from staticData
    path: 'KXVJUtRiwozkKBmO/typeform trigger/webhook',
    pathEncoded: 'KXVJUtRiwozkKBmO/typeform%20trigger/webhook'  // URL-encoded spaces
  },
  { 
    form: 'ydoAn3hv', 
    formName: 'Template Request',
    webhookId: 'n8n-ifsdodhorz',
    path: '1NgUtwNhG19JoVCX/typeform trigger/webhook',
    pathEncoded: '1NgUtwNhG19JoVCX/typeform%20trigger/webhook'
  },
  { 
    form: 'TBij585m', 
    formName: 'Readiness Scorecard',
    webhookId: 'n8n-ipnv8bn6pl',
    path: 'NgqR5LtBhhaFQ8j0/typeform trigger/webhook',
    pathEncoded: 'NgqR5LtBhhaFQ8j0/typeform%20trigger/webhook'
  }
];

async function listWebhooks(formId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.typeform.com',
      path: `/forms/${formId}/webhooks`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.items || []);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function registerWebhook(wh) {
  console.log(`\n=== ${wh.formName} (${wh.form}) ===`);
  
  // List existing webhooks
  const existing = await listWebhooks(wh.form);
  console.log(`Found ${existing.length} existing webhook(s):`);
  existing.forEach(w => {
    console.log(`  - ${w.tag || w.id} (ID: ${w.id}): ${w.url} [${w.enabled ? 'ENABLED' : 'DISABLED'}]`);
  });
  
  // Find our webhook by ID or tag
  const ourWebhook = existing.find(w => w.id === wh.webhookId || w.tag === wh.webhookId);
  
  const webhookUrl = `${base}/webhook/${wh.path}`;
  console.log(`\nTarget URL: ${webhookUrl}`);
  console.log(`Webhook ID: ${wh.webhookId}`);
  
  if (ourWebhook) {
    console.log(`\nUpdating existing webhook (ID: ${ourWebhook.id})...`);
    // Update using webhook ID
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ url: webhookUrl, enabled: true });
      const options = {
        hostname: 'api.typeform.com',
        path: `/forms/${wh.form}/webhooks/${ourWebhook.id}`,  // Use webhook ID for PUT
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`✅ Updated successfully`);
            try {
              const result = JSON.parse(body);
              console.log(`   URL: ${result.url}`);
              console.log(`   Enabled: ${result.enabled ? 'YES' : 'NO'}`);
            } catch (e) {}
          } else {
            console.log(`❌ Failed: ${res.statusCode}`);
            console.log(`   Response: ${body.substring(0, 200)}`);
          }
          resolve();
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  } else {
    console.log(`\nCreating new webhook with tag: ${wh.webhookId}...`);
    // Create new webhook using tag
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ url: webhookUrl, enabled: true });
      const options = {
        hostname: 'api.typeform.com',
        path: `/forms/${wh.form}/webhooks/${wh.webhookId}`,  // Use tag for initial PUT (create)
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log(`✅ Created successfully`);
            try {
              const result = JSON.parse(body);
              console.log(`   ID: ${result.id}`);
              console.log(`   URL: ${result.url}`);
              console.log(`   Enabled: ${result.enabled ? 'YES' : 'NO'}`);
            } catch (e) {}
          } else {
            console.log(`❌ Failed: ${res.statusCode}`);
            console.log(`   Response: ${body.substring(0, 500)}`);
          }
          resolve();
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

(async () => {
  console.log('🔧 Registering Typeform Webhooks with Updated IDs...\n');
  
  for (const wh of webhooks) {
    await registerWebhook(wh);
  }
  
  // Verify final state
  console.log('\n\n🔍 Verifying final webhook configuration...');
  for (const wh of webhooks) {
    const existing = await listWebhooks(wh.form);
    const ourWebhook = existing.find(w => w.id === wh.webhookId || w.tag === wh.webhookId);
    if (ourWebhook) {
      const expectedUrl = `${base}/webhook/${wh.path}`;
      const expectedUrlEncoded = `${base}/webhook/${wh.pathEncoded}`;
      // URLs are equivalent (spaces can be encoded as %20)
      const urlMatches = ourWebhook.url === expectedUrl || ourWebhook.url === expectedUrlEncoded || 
                         decodeURIComponent(ourWebhook.url) === decodeURIComponent(expectedUrl);
      
      if (urlMatches) {
        console.log(`✅ ${wh.formName}: Correct URL - ${ourWebhook.url}`);
      } else {
        console.log(`⚠️  ${wh.formName}: URL mismatch`);
        console.log(`   Expected: ${expectedUrl}`);
        console.log(`   Actual: ${ourWebhook.url}`);
      }
      console.log(`   Enabled: ${ourWebhook.enabled ? 'YES ✅' : 'NO ❌'}`);
    } else {
      console.log(`❌ ${wh.formName}: Webhook not found`);
    }
  }
  
  console.log('\n✅ Done!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test webhook from Typeform admin: https://admin.typeform.com/form/{formId}/connect#/section/webhooks');
  console.log('2. Check n8n executions: https://n8n.rensto.com/executions');
  console.log('3. Verify Boost.space contacts created in Space 53');
})();

