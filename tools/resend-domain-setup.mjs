#!/usr/bin/env node
/**
 * Resend Domain Verification for superseller.agency
 *
 * Run with UNRESTRICTED Resend API key (dashboard → API Keys → create full-access key).
 * Restricted "send only" keys cannot add domains.
 *
 * Usage: RESEND_API_KEY=re_xxx node tools/resend-domain-setup.mjs
 *
 * Outputs exact records to add in Namecheap Advanced DNS.
 * DNS: https://ap.www.namecheap.com/Domains/DomainControlPanel/superseller.agency/advancedns
 * Guide: https://resend.com/docs/knowledge-base/namecheap
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY required (use full-access key, not send-only)');
  process.exit(1);
}

async function main() {
  const domain = 'superseller.agency';
  const res = await fetch('https://api.resend.com/domains', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain, region: 'us-east-1' }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.name === 'restricted_api_key') {
      console.error('API key is restricted. Create a full-access key at resend.com/dashboard');
      process.exit(1);
    }
    console.error('Resend error:', data);
    process.exit(1);
  }

  console.log('Domain added to Resend. Add these records in Namecheap:\n');
  console.log('Namecheap Advanced DNS: https://ap.www.namecheap.com/Domains/DomainControlPanel/superseller.agency/advancedns\n');

  const records = data.records || [];
  for (const r of records) {
    const host = r.name?.replace(`.${domain}`, '') || r.name;
    if (r.type === 'MX') {
      console.log(`MX Record: Host=${host}, Value=${r.value}, Priority=${r.priority || 10}`);
    } else if (r.type === 'TXT') {
      console.log(`TXT Record: Host=${host}, Value=${r.value}`);
    } else if (r.type === 'CNAME') {
      console.log(`CNAME Record: Host=${host}, Value=${r.value}`);
    }
  }

  console.log('\nAfter adding records, verify at: https://resend.com/domains');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
