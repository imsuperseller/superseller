#!/usr/bin/env node
import https from 'https';

const token = 'tfp_...[REDACTED]';

const forms = [
  { id: 'jqrAhQHW', name: 'Ready Solutions Quiz' },
  { id: 'ydoAn3hv', name: 'Template Request' },
  { id: 'TBij585m', name: 'Readiness Scorecard' }
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

async function deleteWebhook(formId, webhookId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.typeform.com',
      path: `/forms/${formId}/webhooks/${webhookId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  console.log('🗑️  Deleting ALL Typeform webhooks...\n');
  console.log('⚠️  This will delete all webhooks for the 3 forms.\n');
  console.log('After this, you should:\n');
  console.log('1. Go to n8n UI: http://173.254.201.134:5678');
  console.log('2. For each workflow, deactivate and reactivate the Typeform Trigger node');
  console.log('3. This will auto-register the webhook via the native node\n');
  
  for (const form of forms) {
    console.log(`\n=== ${form.name} (${form.id}) ===`);
    const webhooks = await listWebhooks(form.id);
    
    if (webhooks.length === 0) {
      console.log('✅ No webhooks to delete');
      continue;
    }
    
    console.log(`Found ${webhooks.length} webhook(s) to delete:`);
    for (const wh of webhooks) {
      console.log(`  - ${wh.tag || 'no-tag'} (ID: ${wh.id}): ${wh.url}`);
      
      // Try deleting by ID first
      const result = await deleteWebhook(form.id, wh.id);
      if (result.status === 204 || result.status === 200) {
        console.log(`    ✅ Deleted`);
      } else {
        console.log(`    ⚠️  Failed with ID (Status: ${result.status}), trying tag...`);
        // Try deleting by tag if ID fails
        if (wh.tag) {
          const tagResult = await deleteWebhook(form.id, wh.tag);
          if (tagResult.status === 204 || tagResult.status === 200) {
            console.log(`    ✅ Deleted using tag`);
          } else {
            console.log(`    ❌ Could not delete (Status: ${tagResult.status})`);
          }
        }
      }
    }
  }
  
  console.log('\n\n✅ All webhooks deleted!');
  console.log('\n📋 Next Steps:');
  console.log('1. Go to n8n: http://173.254.201.134:5678');
  console.log('2. For each of the 3 workflows:');
  console.log('   - Open the workflow');
  console.log('   - Find the "Typeform Trigger" node');
  console.log('   - Toggle it OFF (deactivate)');
  console.log('   - Wait 2 seconds');
  console.log('   - Toggle it ON (activate)');
  console.log('   - This will auto-register the webhook');
  console.log('3. Come back and tell me when done, and I\'ll verify the webhooks');
})();

