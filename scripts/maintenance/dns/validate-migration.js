#!/usr/bin/env node
/**
 * Validate DNS Migration Script
 * Tests all functions and validates the migration will work correctly
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOUDFLARE_API_TOKEN = 'UH1jMzVfPgk2NxMkrmucvgIK5xv4Q_tTvtb3zvo1';
const DOMAIN = 'superseller.agency';
const API_BASE = 'https://api.cloudflare.com/client/v4';
const BACKUP_FILE = path.join(__dirname, '../../data/dns/cloudflare-backup.json');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateCloudflareConnection() {
  log('\n📡 Test 1: Cloudflare API Connection', 'blue');
  try {
    const response = await axios.get(`${API_BASE}/zones`, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        name: DOMAIN
      }
    });

    if (response.data.result.length === 0) {
      throw new Error(`Domain ${DOMAIN} not found`);
    }

    const zoneId = response.data.result[0].id;
    log(`   ✅ Connected to Cloudflare`, 'green');
    log(`   ✅ Zone ID: ${zoneId}`, 'green');
    return zoneId;
  } catch (error) {
    log(`   ❌ Failed: ${error.message}`, 'red');
    throw error;
  }
}

async function validateDNSRecords(zoneId) {
  log('\n📋 Test 2: DNS Records Retrieval', 'blue');
  try {
    const response = await axios.get(`${API_BASE}/zones/${zoneId}/dns_records`, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const records = response.data.result;
    log(`   ✅ Retrieved ${records.length} DNS records`, 'green');

    // Find root A record
    const rootRecord = records.find(r => r.name === DOMAIN && r.type === 'A');
    if (rootRecord) {
      log(`   ✅ Found root A record: ${rootRecord.content}`, 'green');
      log(`      Record ID: ${rootRecord.id}`, 'cyan');
    } else {
      log(`   ⚠️  No root A record found (will create CNAME)`, 'yellow');
    }

    // Find www CNAME record
    const wwwRecord = records.find(r => r.name === `www.${DOMAIN}` && r.type === 'CNAME');
    if (wwwRecord) {
      log(`   ✅ Found www CNAME record: ${wwwRecord.content}`, 'green');
      log(`      Record ID: ${wwwRecord.id}`, 'cyan');
    } else {
      log(`   ⚠️  No www CNAME record found (will create)`, 'yellow');
    }

    return { rootRecord, wwwRecord, records };
  } catch (error) {
    log(`   ❌ Failed: ${error.message}`, 'red');
    throw error;
  }
}

function validateBackupFile() {
  log('\n💾 Test 3: Backup File Validation', 'blue');
  try {
    if (!fs.existsSync(BACKUP_FILE)) {
      log(`   ⚠️  Backup file doesn't exist yet (will be created on first run)`, 'yellow');
      return null;
    }

    const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    log(`   ✅ Backup file exists`, 'green');
    log(`   ✅ Timestamp: ${new Date(backup.timestamp).toLocaleString()}`, 'green');
    log(`   ✅ Records backed up: ${backup.records.length}`, 'green');

    // Check if backup has the records we need
    const rootBackup = backup.records.find(r => r.name === DOMAIN && r.type === 'A');
    const wwwBackup = backup.records.find(r => r.name === `www.${DOMAIN}` && r.type === 'CNAME');

    if (rootBackup) {
      log(`   ✅ Root A record backed up: ${rootBackup.content}`, 'green');
    }
    if (wwwBackup) {
      log(`   ✅ WWW CNAME backed up: ${wwwBackup.content}`, 'green');
    }

    return backup;
  } catch (error) {
    log(`   ❌ Failed: ${error.message}`, 'red');
    return null;
  }
}

function validateScriptConfiguration() {
  log('\n⚙️  Test 4: Script Configuration Validation', 'blue');
  try {
    const scriptPath = path.join(__dirname, 'migrate-superseller-to-vercel.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Check Vercel DNS values
    if (!scriptContent.includes('cname.vercel-dns.com')) {
      log(`   ❌ Vercel DNS values not configured`, 'red');
      return false;
    }

    log(`   ✅ Vercel DNS values configured`, 'green');
    log(`      Root domain: CNAME → cname.vercel-dns.com`, 'cyan');
    log(`      WWW domain: CNAME → cname.vercel-dns.com`, 'cyan');

    // Check API token
    if (!scriptContent.includes(CLOUDFLARE_API_TOKEN.substring(0, 10))) {
      log(`   ⚠️  API token might not be configured`, 'yellow');
    } else {
      log(`   ✅ Cloudflare API token configured`, 'green');
    }

    return true;
  } catch (error) {
    log(`   ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

async function validateVercelDomains() {
  log('\n🌐 Test 5: Vercel Domain Configuration', 'blue');
  try {
    const VERCEL_TOKEN = 'qO8TKRoEuFOwsFuHFpM4AOWM';
    const response = await axios.get('https://api.vercel.com/v2/projects/superseller-site/domains', {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });

    const domains = response.data.domains || [];
    const hasRoot = domains.some(d => d.name === DOMAIN);
    const hasWWW = domains.some(d => d.name === `www.${DOMAIN}`);

    if (hasRoot) {
      log(`   ✅ superseller.agency added to Vercel project`, 'green');
    } else {
      log(`   ⚠️  superseller.agency not found in Vercel project`, 'yellow');
    }

    if (hasWWW) {
      log(`   ✅ www.superseller.agency added to Vercel project`, 'green');
    } else {
      log(`   ⚠️  www.superseller.agency not found in Vercel project`, 'yellow');
    }

    return { hasRoot, hasWWW };
  } catch (error) {
    log(`   ⚠️  Could not verify Vercel domains: ${error.message}`, 'yellow');
    return { hasRoot: false, hasWWW: false };
  }
}

async function main() {
  log('\n🧪 DNS Migration Script Validation', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = {
    cloudflare: false,
    dnsRecords: false,
    backup: false,
    scriptConfig: false,
    vercel: false
  };

  try {
    // Test 1: Cloudflare Connection
    const zoneId = await validateCloudflareConnection();
    results.cloudflare = true;

    // Test 2: DNS Records
    const { rootRecord, wwwRecord } = await validateDNSRecords(zoneId);
    results.dnsRecords = true;

    // Test 3: Backup File
    const backup = validateBackupFile();
    results.backup = backup !== null;

    // Test 4: Script Configuration
    results.scriptConfig = validateScriptConfiguration();

    // Test 5: Vercel Domains
    const vercelStatus = await validateVercelDomains();
    results.vercel = vercelStatus.hasRoot && vercelStatus.hasWWW;

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 VALIDATION SUMMARY', 'cyan');
    log('='.repeat(60), 'cyan');

    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const color = passed ? 'green' : 'red';
      log(`  ${status}: ${test}`, color);
    });

    const allPassed = Object.values(results).every(r => r);
    
    log('\n' + '='.repeat(60), 'cyan');
    if (allPassed) {
      log('✅ ALL TESTS PASSED - Script is ready to use!', 'green');
    } else {
      log('⚠️  SOME TESTS FAILED - Review issues above', 'yellow');
    }
    log('='.repeat(60) + '\n', 'cyan');

    // Show what will happen
    if (rootRecord && wwwRecord) {
      log('📋 Migration Preview:', 'blue');
      log(`   Root domain: ${rootRecord.content} → cname.vercel-dns.com`, 'cyan');
      log(`   WWW domain: ${wwwRecord.content} → cname.vercel-dns.com`, 'cyan');
    }

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();

