#!/usr/bin/env node
import https from 'https';

const token = 'tfp_...[REDACTED]';

const forms = [
  { id: 'jqrAhQHW', name: 'Ready Solutions Quiz', keepWebhookId: '01KA5CAEJA4SYKGFVCB31V1CGM' },
  { id: 'ydoAn3hv', name: 'Template Request', keepWebhookId: '01KA5ABYTMN19M4YDTWFDS129Y' },
  { id: 'TBij585m', name: 'Readiness Scorecard', keepWebhookId: '01KA5ABZY60RB35ZYWCSCN9GMX' }
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
  console.log('🧹 Cleaning up old Typeform webhooks...\n');
  
  for (const form of forms) {
    console.log(`\n=== ${form.name} (${form.id}) ===`);
    const webhooks = await listWebhooks(form.id);
    
    // Find old webhooks (pointing to internal IP or old paths)
    const oldWebhooks = webhooks.filter(w => 
      w.id !== form.keepWebhookId && (
        w.url.includes('173.254.201.134') || 
        w.url.includes('typeform-ready-solutions-quiz') ||
        w.url.includes('typeform-template-request') ||
        w.url.includes('typeform-readiness-scorecard')
      )
    );
    
    if (oldWebhooks.length === 0) {
      console.log('✅ No old webhooks to clean up');
    } else {
      console.log(`Found ${oldWebhooks.length} old webhook(s) to delete:`);
      for (const wh of oldWebhooks) {
        console.log(`  - ${wh.tag || wh.id} (${wh.id}): ${wh.url}`);
        const result = await deleteWebhook(form.id, wh.id);
        if (result.status === 204 || result.status === 200) {
          console.log(`    ✅ Deleted`);
        } else {
          console.log(`    ❌ Failed: ${result.status}`);
        }
      }
    }
  }
  
  console.log('\n✅ Cleanup complete!');
})();

