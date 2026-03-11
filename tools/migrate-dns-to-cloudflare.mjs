#!/usr/bin/env node
/**
 * Migrate superseller.agency DNS from Namecheap to Cloudflare.
 * 
 * PREREQUISITE: Add superseller.agency at dash.cloudflare.com first:
 *   1. Go to https://dash.cloudflare.com
 *   2. Log in (Google/GitHub)
 *   3. Add site → superseller.agency → Free plan
 *   4. Run this script: CLOUDFLARE_API_TOKEN=xxx npx node tools/migrate-dns-to-cloudflare.mjs
 *   5. Update Namecheap nameservers to the values this script prints
 */

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'UH1jMzVfPgk2NxMkrmucvgIK5xv4Q_tTvtb3zvo1';
const API_BASE = 'https://api.cloudflare.com/client/v4';
const DOMAIN = 'superseller.agency';

const RESEND_DKIM = 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNsb+VHg7614VSK8f5fZ2wNYwQARvI/mVOLX+LmLn0bg2oNDcUK7nnV1scSwaliG0QCSx+7LcTRu66yuYZWxEAHYv6hWgnNqqbfmFUnkuBlSRC8+WFX7bxCFaZE6hgGnFjrFe0eCxpdHh0FbKJMjuLvVApoIJJPGO0ZwzKoyw0DwIDAQAB';

// Current Namecheap records (from Advanced DNS snapshot Mar 2026)
const RECORDS = [
  { type: 'A', name: '@', content: '76.76.21.21', ttl: 300 },
  { type: 'A', name: 'n8n', content: '172.245.56.50', ttl: 1 },
  { type: 'A', name: 'n8n-personal', content: '172.245.56.50', ttl: 1 },
  { type: 'CNAME', name: 'admin', content: 'cname.vercel-dns.com', ttl: 1 },
  { type: 'CNAME', name: 'api', content: 'cname.vercel-dns.com', ttl: 1 },
  { type: 'CNAME', name: 'studio', content: 'cname.vercel-dns.com', ttl: 1 },
  { type: 'CNAME', name: 'www', content: 'cname.vercel-dns.com', ttl: 1 },
  { type: 'TXT', name: '@', content: 'google-site-verification=aefbTUvEp_8VrBK_RSNUserFYB3Jj37vWrovmFKk5_8', ttl: 1 },
  { type: 'TXT', name: '@', content: 'zoho-verification=zb53144850.zmverify.zoho.com', ttl: 1 },
  { type: 'TXT', name: '@', content: 'v=spf1 include:zohomail.com ~all', ttl: 1 },
  { type: 'TXT', name: 'send', content: 'v=spf1 include:amazonses.com ~all', ttl: 1 },
  { type: 'TXT', name: 'resend._domainkey', content: RESEND_DKIM, ttl: 1 },
  { type: 'MX', name: '@', content: 'mx.zoho.com', priority: 10, ttl: 1 },
  { type: 'MX', name: '@', content: 'mx2.zoho.com', priority: 20, ttl: 1 },
  { type: 'MX', name: '@', content: 'mx3.zoho.com', priority: 10, ttl: 1 },
  { type: 'MX', name: 'send', content: 'feedback-smtp.us-east-1.amazonses.com', priority: 10, ttl: 1 },
];

async function api(method, path, body) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const j = await r.json();
  if (!j.success) throw new Error(JSON.stringify(j.errors));
  return j;
}

const POLL_INTERVAL_MS = 15000;
const POLL_MAX = 24; // 6 min

async function main() {
  const wait = process.argv.includes('--wait');
  let zones;

  for (let i = 0; i < (wait ? POLL_MAX : 1); i++) {
    if (i > 0) {
      console.log(`Waiting ${POLL_INTERVAL_MS / 1000}s... (${i}/${POLL_MAX})`);
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    }
    console.log('Checking for superseller.agency zone...');
    zones = await api('GET', `/zones?name=${DOMAIN}`);
    if (zones.result?.length) break;
    if (!wait) {
      console.error('\n❌ Zone not found. Add superseller.agency at dash.cloudflare.com first:');
      console.error('   1. Go to https://dash.cloudflare.com');
      console.error('   2. Log in (Google/GitHub)');
      console.error('   3. Add site → superseller.agency → Free plan');
      console.error('   4. Re-run: node tools/migrate-dns-to-cloudflare.mjs --wait\n');
      process.exit(1);
    }
  }

  if (!zones?.result?.length) {
    console.error('\n❌ Zone still not found after waiting. Add the site and re-run.\n');
    process.exit(1);
  }

  const zone = zones.result[0];
  const zoneId = zone.id;
  const status = zone.status;
  const nameservers = zone.name_servers || [];

  console.log(`Zone: ${zone.name} (${zoneId}), status: ${status}`);

  if (status !== 'active') {
    console.log('\n⚠ Zone not yet active. Wait a few minutes for Cloudflare to initialize, then re-run.');
    if (nameservers?.length) {
      console.log('\nNameservers to set at Namecheap:');
      nameservers.forEach(ns => console.log(`  ${ns}`));
    }
    process.exit(1);
  }

  // Fetch existing records
  const existing = await api('GET', `/zones/${zoneId}/dns_records`);
  const byKey = new Map(existing.result.map(r => [`${r.type}:${r.name}`, r]));

  for (const rec of RECORDS) {
    const name = rec.name === '@' ? DOMAIN : `${rec.name}.${DOMAIN}`;
    const key = `${rec.type}:${rec.name}`;
    const payload = {
      type: rec.type,
      name: rec.name === '@' ? DOMAIN : rec.name,
      content: rec.content,
      ttl: rec.ttl,
    };
    if (rec.priority != null) payload.priority = rec.priority;
    if ((rec.type === 'CNAME' || rec.type === 'MX') && !rec.content.endsWith('.')) payload.content += '.';

    const existingRec = byKey.get(key);
    if (existingRec) {
      const same = existingRec.content === payload.content && existingRec.ttl === payload.ttl;
      if (same) {
        console.log(`  skip ${key} (unchanged)`);
        continue;
      }
      await api('PUT', `/zones/${zoneId}/dns_records/${existingRec.id}`, payload);
      console.log(`  update ${key}`);
    } else {
      await api('POST', `/zones/${zoneId}/dns_records`, payload);
      console.log(`  add ${key}`);
    }
  }

  console.log('\n✅ DNS records migrated.');
  console.log('\n📋 Update Namecheap nameservers:');
  console.log('   Domain List → superseller.agency → Manage → Nameservers → Custom DNS');
  nameservers.forEach(ns => console.log(`   ${ns}`));
  console.log('\n   Then at Resend: Domains → superseller.agency → Verify DNS Records');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
