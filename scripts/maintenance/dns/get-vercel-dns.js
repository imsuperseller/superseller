#!/usr/bin/env node
/**
 * Get Vercel DNS Configuration
 * Fetches DNS records needed from Vercel API
 * 
 * Usage:
 *   node scripts/dns/get-vercel-dns.js
 */

import axios from 'axios';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'qO8TKRoEuFOwsFuHFpM4AOWM';
const API_BASE = 'https://api.vercel.com/v2';
const PROJECT_NAME = 'superseller-site';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function getProjectId() {
  try {
    const response = await axios.get(`${API_BASE}/projects/${PROJECT_NAME}`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });
    return response.data.id;
  } catch (error) {
    // Try listing all projects to find it
    const response = await axios.get(`${API_BASE}/projects`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      },
      params: {
        limit: 100
      }
    });
    
    const project = response.data.projects?.find(p => p.name === PROJECT_NAME);
    if (!project) {
      throw new Error(`Project ${PROJECT_NAME} not found`);
    }
    return project.id;
  }
}

async function addDomain(domain, projectId) {
  try {
    log(`\n➕ Adding ${domain} to project...`, 'blue');
    const response = await axios.post(
      `${API_BASE}/projects/${projectId}/domains`,
      { name: domain },
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    log(`   ✅ Domain added successfully`, 'green');
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      log(`   ℹ️  Domain already exists in project`, 'yellow');
      return { name: domain };
    }
    throw error;
  }
}

async function getDomainConfig(domain) {
  try {
    log(`\n📡 Getting DNS configuration for ${domain}...`, 'blue');
    const response = await axios.get(`${API_BASE}/domains/${domain}/config`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });
    
    const config = response.data;
    
    log(`   ✅ DNS configuration retrieved`, 'green');
    return config;
  } catch (error) {
    log(`   ⚠️  Domain not fully configured yet: ${error.response?.data?.error?.message || error.message}`, 'yellow');
    return null;
  }
}

async function getProjectDomains(projectId) {
  try {
    const response = await axios.get(`${API_BASE}/projects/${projectId}/domains`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });
    return response.data.domains || [];
  } catch (error) {
    return [];
  }
}

async function main() {
  log('\n🌐 Vercel DNS Configuration Fetcher', 'cyan');
  log('='.repeat(60), 'cyan');
  
  try {
    // Get project ID
    log('\n📋 Step 1: Finding project...', 'blue');
    const projectId = await getProjectId();
    log(`   ✅ Project ID: ${projectId}`, 'green');
    
    // Add domains if not already added
    log('\n📋 Step 2: Ensuring domains are added to project...', 'blue');
    await addDomain('superseller.agency', projectId);
    await addDomain('www.superseller.agency', projectId);
    
    // Get domain configurations
    log('\n📋 Step 3: Fetching DNS configuration...', 'blue');
    const rootConfig = await getDomainConfig('superseller.agency');
    const wwwConfig = await getDomainConfig('www.superseller.agency');
    
    // Get project domains
    const domains = await getProjectDomains(projectId);
    
    // Display results
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 DNS CONFIGURATION RESULTS', 'cyan');
    log('='.repeat(60), 'cyan');
    
    if (rootConfig && rootConfig.intendedNameservers) {
      log('\n🌐 Root Domain (superseller.agency):', 'blue');
      log(`   DNS Configuration:`, 'cyan');
      
      if (rootConfig.verification?.record) {
        log(`   Verification Record (TXT):`, 'cyan');
        log(`     Name:  ${rootConfig.verification.record.name}`, 'green');
        log(`     Value: ${rootConfig.verification.record.value}`, 'green');
      }
      
      if (rootConfig.misconfigured) {
        log(`   ⚠️  Domain is misconfigured - DNS needs to be updated`, 'yellow');
      } else {
        log(`   ✅ Domain is properly configured`, 'green');
      }
    }
    
    if (wwwConfig) {
      log('\n🌐 WWW Subdomain (www.superseller.agency):', 'blue');
      log(`   CNAME Target: cname.vercel-dns.com`, 'green');
      
      if (wwwConfig.misconfigured) {
        log(`   ⚠️  Domain is misconfigured - DNS needs to be updated`, 'yellow');
      } else {
        log(`   ✅ Domain is properly configured`, 'green');
      }
    }
    
    // Extract DNS values for migration script
    log('\n' + '='.repeat(60), 'cyan');
    log('📝 DNS VALUES FOR MIGRATION SCRIPT', 'cyan');
    log('='.repeat(60), 'cyan');
    
    log('\nFor root domain (superseller.agency), you have two options:', 'blue');
    log('  1. Use Vercel\'s provided A record IP (if shown)', 'cyan');
    log('  2. Use CNAME to cname.vercel-dns.com (Cloudflare supports CNAME on root)', 'cyan');
    
    log('\nRecommended: Use CNAME on root (simpler, Vercel handles IP changes)', 'yellow');
    
    log('\nUpdate scripts/dns/migrate-superseller-to-vercel.js:', 'blue');
    log('', 'reset');
    log('  const VERCEL_DNS = {', 'cyan');
    log('    rootDomain: {', 'cyan');
    log('      type: \'CNAME\',  // Use CNAME instead of A record', 'cyan');
    log('      content: \'cname.vercel-dns.com\',', 'green');
    log('      name: \'@\',', 'cyan');
    log('      proxied: false,', 'cyan');
    log('      comment: \'Vercel root domain\'', 'cyan');
    log('    },', 'cyan');
    log('    wwwDomain: {', 'cyan');
    log('      type: \'CNAME\',', 'cyan');
    log('      content: \'cname.vercel-dns.com\',', 'green');
    log('      name: \'www\',', 'cyan');
    log('      proxied: false,', 'cyan');
    log('      comment: \'Vercel www subdomain\'', 'cyan');
    log('    }', 'cyan');
    log('  };', 'cyan');
    
    // Check if domains are in project
    log('\n' + '='.repeat(60), 'cyan');
    log('📋 PROJECT DOMAINS', 'cyan');
    log('='.repeat(60), 'cyan');
    
    if (domains.length > 0) {
      domains.forEach(domain => {
        log(`  ✅ ${domain.name}`, 'green');
      });
    } else {
      log('  ⚠️  No domains found in project', 'yellow');
      log('  Run: vercel domains add superseller.agency --project=superseller-site', 'cyan');
    }
    
    log('\n' + '='.repeat(60), 'cyan');
    log('✅ DNS configuration fetch complete!', 'green');
    log('='.repeat(60) + '\n', 'cyan');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    process.exit(1);
  }
}

main();

