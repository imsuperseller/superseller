#!/usr/bin/env node
import { execSync } from 'child_process';

/**
 * Fetch Resend DKIM record for superseller.agency.
 * Requires FULL-ACCESS API key (send-only keys return 401).
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx node tools/fetch-resend-dkim.mjs
 *   node tools/fetch-resend-dkim.mjs re_xxx
 *   node tools/fetch-resend-dkim.mjs  (interactive: copies from clipboard)
 */

let API_KEY = process.env.RESEND_API_KEY || process.argv[2];
if (!API_KEY) {
  console.error('Getting key from clipboard (copy from Resend first)...');
  let clip = '';
  try {
    clip = execSync('pbpaste', { encoding: 'utf8' }).trim();
  } catch {
    clip = '';
  }
  if (!clip || !clip.startsWith('re_')) {
    console.error('No key in clipboard. Run again after copying from Resend, or:');
    console.error('  node tools/fetch-resend-dkim.mjs re_YOUR_KEY');
    console.error('  RESEND_API_KEY=re_xxx node tools/fetch-resend-dkim.mjs');
    process.exit(1);
  }
  API_KEY = clip;
}

const DOMAIN_ID = 'e719f02e-3f51-4e16-8bc3-5bf123bc7bfc';

async function main() {
  const res = await fetch(`https://api.resend.com/domains/${DOMAIN_ID}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.name === 'restricted_api_key') {
      console.error('API key is send-only. Create a full-access key at resend.com/api-keys');
      process.exit(1);
    }
    console.error('Resend error:', data);
    process.exit(1);
  }

  const records = data.records || [];
  const dkim = records.find((r) => r.record === 'DKIM');
  if (!dkim) {
    console.error('No DKIM record found');
    process.exit(1);
  }

  console.log('Add this TXT record in Namecheap Advanced DNS:');
  console.log('');
  console.log('  Type: TXT');
  console.log('  Host:', dkim.name);
  console.log('  Value:', dkim.value);
  console.log('  TTL: Automatic');
  console.log('');
  console.log('Namecheap: https://ap.www.namecheap.com/Domains/DomainControlPanel/superseller.agency/advancedns');
  console.log('Resend Verify: https://resend.com/domains/' + DOMAIN_ID);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
