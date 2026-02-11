#!/usr/bin/env node
/**
 * Cloudflare DNS Migration Script
 * Migrates rensto.com from Webflow to Vercel
 * 
 * Usage:
 *   node scripts/dns/migrate-rensto-to-vercel.js --dry-run
 *   node scripts/dns/migrate-rensto-to-vercel.js --execute
 *   node scripts/dns/migrate-rensto-to-vercel.js --rollback
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'UH1jMzVfPgk2NxMkrmucvgIK5xv4Q_tTvtb3zvo1';
const DOMAIN = 'rensto.com';
const API_BASE = 'https://api.cloudflare.com/client/v4';

// Backup file location
const BACKUP_FILE = path.join(__dirname, '../../data/dns/cloudflare-backup.json');

// Vercel DNS values - Auto-configured (domains added to Vercel project)
// Using CNAME for root domain (Cloudflare supports CNAME flattening)
const VERCEL_DNS = {
  rootDomain: {
    type: 'CNAME', // Using CNAME instead of A record (simpler, Vercel handles IP changes)
    content: 'cname.vercel-dns.com', // Vercel CNAME target
    name: '@',
    proxied: false, // DNS Only (gray cloud)
    comment: 'Vercel root domain - Updated Nov 2, 2025'
  },
  wwwDomain: {
    type: 'CNAME',
    content: 'cname.vercel-dns.com', // Vercel CNAME target
    name: 'www',
    proxied: false, // DNS Only (gray cloud)
    comment: 'Vercel www subdomain - Updated Nov 2, 2025'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Cloudflare API Helper Functions
async function getZoneId(domain) {
  try {
    const response = await axios.get(`${API_BASE}/zones`, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        name: domain
      }
    });

    if (response.data.result.length === 0) {
      throw new Error(`Domain ${domain} not found in Cloudflare`);
    }

    return response.data.result[0].id;
  } catch (error) {
    log(`❌ Failed to get zone ID: ${error.message}`, 'red');
    throw error;
  }
}

async function getDNSRecords(zoneId) {
  try {
    const response = await axios.get(`${API_BASE}/zones/${zoneId}/dns_records`, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.result;
  } catch (error) {
    log(`❌ Failed to get DNS records: ${error.message}`, 'red');
    throw error;
  }
}

function findDNSRecord(records, name, type) {
  // Handle root domain: '@' maps to exact DOMAIN match
  if (name === '@') {
    return records.find(r => r.name === DOMAIN && r.type === type);
  }
  // Handle subdomains: 'www' maps to www.DOMAIN
  const expectedName = `www.${DOMAIN}`;
  return records.find(r => r.name === expectedName && r.type === type);
}

async function updateDNSRecord(zoneId, recordId, data, dryRun = false) {
  if (dryRun) {
    log(`  [DRY RUN] Would update record ${recordId}:`, 'cyan');
    log(`    Type: ${data.type}`, 'cyan');
    log(`    Name: ${data.name}`, 'cyan');
    log(`    Content: ${data.content}`, 'cyan');
    log(`    Proxied: ${data.proxied}`, 'cyan');
    return { success: true, dryRun: true };
  }

  try {
    const response = await axios.patch(
      `${API_BASE}/zones/${zoneId}/dns_records/${recordId}`,
      {
        type: data.type,
        name: data.name,
        content: data.content,
        proxied: data.proxied,
        comment: data.comment
      },
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    log(`❌ Failed to update DNS record: ${error.message}`, 'red');
    if (error.response) {
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    throw error;
  }
}

async function createDNSRecord(zoneId, data, dryRun = false) {
  if (dryRun) {
    log(`  [DRY RUN] Would create record:`, 'cyan');
    log(`    Type: ${data.type}`, 'cyan');
    log(`    Name: ${data.name}`, 'cyan');
    log(`    Content: ${data.content}`, 'cyan');
    return { success: true, dryRun: true };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/zones/${zoneId}/dns_records`,
      {
        type: data.type,
        name: data.name,
        content: data.content,
        proxied: data.proxied,
        comment: data.comment
      },
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    log(`❌ Failed to create DNS record: ${error.message}`, 'red');
    throw error;
  }
}

// Backup and Restore Functions
function saveBackup(records) {
  const backupDir = path.dirname(BACKUP_FILE);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backup = {
    timestamp: new Date().toISOString(),
    domain: DOMAIN,
    records: records.map(r => ({
      id: r.id,
      type: r.type,
      name: r.name,
      content: r.content,
      proxied: r.proxied,
      comment: r.comment || ''
    }))
  };

  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
  log(`✅ Backup saved to: ${BACKUP_FILE}`, 'green');
}

function loadBackup() {
  if (!fs.existsSync(BACKUP_FILE)) {
    throw new Error('No backup file found. Cannot rollback.');
  }

  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
  log(`📦 Loaded backup from: ${new Date(backup.timestamp).toLocaleString()}`, 'cyan');
  return backup;
}

// Main Migration Functions
async function migrateToVercel(dryRun = false) {
  log('\n🚀 Starting DNS Migration: Webflow → Vercel', 'bright');
  log(`   Domain: ${DOMAIN}`, 'cyan');
  log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'EXECUTE (making changes)'}`, dryRun ? 'yellow' : 'red');
  log('');

  try {
    // Step 1: Get Zone ID
    log('📡 Step 1: Getting Cloudflare Zone ID...', 'blue');
    const zoneId = await getZoneId(DOMAIN);
    log(`   ✅ Zone ID: ${zoneId}`, 'green');

    // Step 2: Get Current DNS Records
    log('\n📋 Step 2: Fetching current DNS records...', 'blue');
    const records = await getDNSRecords(zoneId);
    log(`   ✅ Found ${records.length} DNS records`, 'green');

    // Step 3: Save Backup
    log('\n💾 Step 3: Creating backup...', 'blue');
    saveBackup(records);

    // Step 4: Find Records to Update
    log('\n🔍 Step 4: Finding records to update...', 'blue');
    
    const rootRecord = findDNSRecord(records, '@', 'A');
    const wwwRecord = findDNSRecord(records, 'www', 'CNAME');

    if (!rootRecord) {
      log('   ⚠️  Warning: No A record found for root domain (@)', 'yellow');
      log('   Will create new CNAME record', 'cyan');
    } else {
      log(`   ✅ Found root A record: ${rootRecord.content || 'N/A'} (Webflow)`, 'green');
      log(`      Record ID: ${rootRecord.id}`, 'cyan');
    }

    if (!wwwRecord) {
      log('   ⚠️  Warning: No CNAME record found for www', 'yellow');
      log('   Will create new CNAME record', 'cyan');
    } else {
      log(`   ✅ Found www CNAME record: ${wwwRecord.content || 'N/A'} (Webflow)`, 'green');
      log(`      Record ID: ${wwwRecord.id}`, 'cyan');
    }

    // Step 5: Update Records
    log('\n🔄 Step 5: Updating DNS records...', 'blue');

    const results = [];

    // Update root domain A record
    if (rootRecord) {
      log(`\n   Updating root domain (@) A record:`, 'cyan');
      log(`     From: ${rootRecord.content} (Webflow)`, 'yellow');
      log(`     To:   ${VERCEL_DNS.rootDomain.content} (Vercel)`, 'green');
      
      const result = await updateDNSRecord(
        zoneId,
        rootRecord.id,
        {
          type: VERCEL_DNS.rootDomain.type,
          name: DOMAIN, // Cloudflare expects full domain name
          content: VERCEL_DNS.rootDomain.content,
          proxied: VERCEL_DNS.rootDomain.proxied,
          comment: VERCEL_DNS.rootDomain.comment
        },
        dryRun
      );
      results.push({ record: 'root', success: result.success });
      
      if (!dryRun && result.success) {
        log(`   ✅ Root domain A record updated`, 'green');
      }
    } else {
      log(`\n   Creating root domain (@) A record:`, 'cyan');
      const result = await createDNSRecord(
        zoneId,
        {
          type: VERCEL_DNS.rootDomain.type,
          name: DOMAIN,
          content: VERCEL_DNS.rootDomain.content,
          proxied: VERCEL_DNS.rootDomain.proxied,
          comment: VERCEL_DNS.rootDomain.comment
        },
        dryRun
      );
      results.push({ record: 'root', success: result.success });
      
      if (!dryRun && result.success) {
        log(`   ✅ Root domain A record created`, 'green');
      }
    }

    // Update www CNAME record
    if (wwwRecord) {
      log(`\n   Updating www CNAME record:`, 'cyan');
      log(`     From: ${wwwRecord.content} (Webflow)`, 'yellow');
      log(`     To:   ${VERCEL_DNS.wwwDomain.content} (Vercel)`, 'green');
      
      const result = await updateDNSRecord(
        zoneId,
        wwwRecord.id,
        {
          type: VERCEL_DNS.wwwDomain.type,
          name: `www.${DOMAIN}`,
          content: VERCEL_DNS.wwwDomain.content,
          proxied: VERCEL_DNS.wwwDomain.proxied,
          comment: VERCEL_DNS.wwwDomain.comment
        },
        dryRun
      );
      results.push({ record: 'www', success: result.success });
      
      if (!dryRun && result.success) {
        log(`   ✅ www CNAME record updated`, 'green');
      }
    } else {
      log(`\n   Creating www CNAME record:`, 'cyan');
      const result = await createDNSRecord(
        zoneId,
        {
          type: VERCEL_DNS.wwwDomain.type,
          name: `www.${DOMAIN}`,
          content: VERCEL_DNS.wwwDomain.content,
          proxied: VERCEL_DNS.wwwDomain.proxied,
          comment: VERCEL_DNS.wwwDomain.comment
        },
        dryRun
      );
      results.push({ record: 'www', success: result.success });
      
      if (!dryRun && result.success) {
        log(`   ✅ www CNAME record created`, 'green');
      }
    }

    // Summary
    log('\n' + '='.repeat(60), 'bright');
    if (dryRun) {
      log('✅ DRY RUN COMPLETE - No changes made', 'yellow');
      log('\nTo execute changes, run:', 'cyan');
      log('  node scripts/dns/migrate-rensto-to-vercel.js --execute', 'bright');
    } else {
      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        log('✅ DNS MIGRATION COMPLETE', 'green');
        log('\n📊 Next Steps:', 'blue');
        log('  1. Wait 5-30 minutes for DNS propagation', 'cyan');
        log('  2. Check DNS propagation: https://dnschecker.org', 'cyan');
        log('  3. Verify SSL certificates in Vercel dashboard', 'cyan');
        log('  4. Test rensto.com and www.rensto.com', 'cyan');
        log('  5. Monitor for errors in first hour', 'cyan');
      } else {
        log('⚠️  SOME CHANGES FAILED', 'yellow');
        log('  Review errors above and retry if needed', 'yellow');
      }
    }
    log('='.repeat(60) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    process.exit(1);
  }
}

async function rollback() {
  log('\n🔄 Starting DNS Rollback: Vercel → Webflow', 'bright');
  log(`   Domain: ${DOMAIN}`, 'cyan');
  log('');

  try {
    // Load backup
    const backup = loadBackup();

    // Get Zone ID
    log('📡 Getting Cloudflare Zone ID...', 'blue');
    const zoneId = await getZoneId(DOMAIN);
    log(`   ✅ Zone ID: ${zoneId}`, 'green');

    // Get current records
    log('\n📋 Fetching current DNS records...', 'blue');
    const records = await getDNSRecords(zoneId);

    // Restore root domain
    const rootBackup = backup.records.find(r => r.name === DOMAIN && r.type === 'A');
    const rootCurrent = findDNSRecord(records, '@', 'A');

    if (rootBackup && rootCurrent) {
      log('\n🔄 Restoring root domain A record...', 'blue');
      log(`   From: ${rootCurrent.content} (Vercel)`, 'yellow');
      log(`   To:   ${rootBackup.content} (Webflow)`, 'green');

      await updateDNSRecord(zoneId, rootCurrent.id, {
        type: rootBackup.type,
        name: rootBackup.name,
        content: rootBackup.content,
        proxied: rootBackup.proxied,
        comment: rootBackup.comment
      });

      log(`   ✅ Root domain restored`, 'green');
    }

    // Restore www
    const wwwBackup = backup.records.find(r => r.name === `www.${DOMAIN}` && r.type === 'CNAME');
    const wwwCurrent = findDNSRecord(records, 'www', 'CNAME');

    if (wwwBackup && wwwCurrent) {
      log('\n🔄 Restoring www CNAME record...', 'blue');
      log(`   From: ${wwwCurrent.content} (Vercel)`, 'yellow');
      log(`   To:   ${wwwBackup.content} (Webflow)`, 'green');

      await updateDNSRecord(zoneId, wwwCurrent.id, {
        type: wwwBackup.type,
        name: wwwBackup.name,
        content: wwwBackup.content,
        proxied: wwwBackup.proxied,
        comment: wwwBackup.comment
      });

      log(`   ✅ www CNAME restored`, 'green');
    }

    log('\n' + '='.repeat(60), 'bright');
    log('✅ ROLLBACK COMPLETE', 'green');
    log('\n📊 Next Steps:', 'blue');
    log('  1. Wait 5-30 minutes for DNS propagation', 'cyan');
    log('  2. Verify rensto.com loads from Webflow', 'cyan');
    log('='.repeat(60) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ Rollback failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Command Line Interface
const args = process.argv.slice(2);
const command = args[0];

if (command === '--dry-run' || command === '--dryrun') {
  migrateToVercel(true);
} else if (command === '--execute' || command === '--run') {
  log('⚠️  WARNING: This will make LIVE DNS changes!', 'red');
  log('   Press Ctrl+C within 5 seconds to cancel...', 'yellow');
  
  setTimeout(async () => {
    await migrateToVercel(false);
  }, 5000);
} else if (command === '--rollback') {
  rollback();
} else {
  log('DNS Migration Script for rensto.com', 'bright');
  log('');
  log('Usage:', 'cyan');
  log('  --dry-run    Show what would be changed (no actual changes)', 'green');
  log('  --execute    Make actual DNS changes (5 second warning)', 'red');
  log('  --rollback   Restore DNS records from backup', 'yellow');
  log('');
  log('⚠️  IMPORTANT: Update VERCEL_DNS values in script before executing!', 'yellow');
  log('   Get Vercel DNS values from Vercel dashboard after adding domain', 'cyan');
  process.exit(1);
}

