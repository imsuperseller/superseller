#!/usr/bin/env node
/**
 * Script Validation Test Suite
 * Checks: DNS scripts are valid, configuration matches, rollback works
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
const scriptsDir = path.join(rootDir, 'scripts/dns');

const issues = [];
const warnings = [];

// Test 1: Check DNS migration script exists and is valid
function testDnsMigrationScript() {
  console.log('\n🌐 Testing DNS Migration Script...');
  
  const scriptPath = path.join(scriptsDir, 'migrate-rensto-to-vercel.js');
  
  if (!fs.existsSync(scriptPath)) {
    issues.push('❌ DNS migration script missing: migrate-rensto-to-vercel.js');
    return;
  }
  
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  
  // Check for required functions
  const requiredFunctions = [
    'getZoneId',
    'getDNSRecords',
    'saveBackup',
    'loadBackup',
    'migrateToVercel'
  ];
  
  for (const func of requiredFunctions) {
    if (!scriptContent.includes(`function ${func}`) && !scriptContent.includes(`${func} =`) && !scriptContent.includes(`async function ${func}`)) {
      issues.push(`❌ DNS script missing function: ${func}`);
    }
  }
  
  // Check for rollback functionality (might be in main execution)
  if (!scriptContent.includes('rollback') && !scriptContent.includes('--rollback')) {
    warnings.push('⚠️ DNS script may not have rollback functionality');
  }
  
  // Check for Cloudflare API token usage
  if (!scriptContent.includes('CLOUDFLARE_API_TOKEN')) {
    warnings.push('⚠️ DNS script may not handle CLOUDFLARE_API_TOKEN correctly');
  }
  
  // Check for domain configuration
  if (!scriptContent.includes('rensto.com')) {
    warnings.push('⚠️ DNS script may not be configured for rensto.com');
  }
  
  // Check for Vercel DNS configuration
  if (!scriptContent.includes('vercel') || !scriptContent.includes('cname.vercel-dns.com')) {
    warnings.push('⚠️ DNS script may not be configured for Vercel');
  }
  
  // Check for dry-run mode
  if (!scriptContent.includes('dry-run') && !scriptContent.includes('dryRun')) {
    warnings.push('⚠️ DNS script may not have dry-run mode');
  }
  
  // Check for rollback functionality
  if (!scriptContent.includes('rollback')) {
    issues.push('❌ DNS script missing rollback functionality');
  }
}

// Test 2: Check script documentation matches script
function testScriptDocumentation() {
  console.log('📖 Testing Script Documentation...');
  
  const scriptPath = path.join(scriptsDir, 'migrate-rensto-to-vercel.js');
  const docPath = path.join(rootDir, 'webflow/DNS_MIGRATION_AUTOMATED.md');
  
  if (!fs.existsSync(scriptPath) || !fs.existsSync(docPath)) {
    return;
  }
  
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  const docContent = fs.readFileSync(docPath, 'utf8');
  
  // Check if script file is mentioned in docs
  if (!docContent.includes('migrate-rensto-to-vercel.js')) {
    warnings.push('⚠️ DNS migration script file not mentioned in documentation');
  }
  
  // Check if dry-run is documented
  if (scriptContent.includes('dry-run') && !docContent.includes('dry-run')) {
    warnings.push('⚠️ Dry-run mode exists in script but not documented');
  }
  
  // Check if rollback is documented
  if (scriptContent.includes('rollback') && !docContent.includes('rollback')) {
    warnings.push('⚠️ Rollback functionality exists but not documented');
  }
}

// Test 3: Check validation script exists
function testValidationScript() {
  console.log('✅ Testing Validation Script...');
  
  const validationScript = path.join(scriptsDir, 'validate-migration.js');
  const handoffGuide = path.join(rootDir, 'webflow/AGENT_HANDOFF_GUIDE.md');
  
  // Check if validation script exists
  if (!fs.existsSync(validationScript)) {
    warnings.push('⚠️ Validation script missing: validate-migration.js');
  } else {
    // Check if it's mentioned in handoff guide
    const content = fs.readFileSync(handoffGuide, 'utf8');
    if (!content.includes('validate-migration.js')) {
      warnings.push('⚠️ Validation script exists but not mentioned in handoff guide');
    }
  }
}

// Test 4: Check script configuration consistency
function testScriptConfiguration() {
  console.log('⚙️  Testing Script Configuration...');
  
  const scriptPath = path.join(scriptsDir, 'migrate-rensto-to-vercel.js');
  const handoffGuide = path.join(rootDir, 'webflow/AGENT_HANDOFF_GUIDE.md');
  
  if (!fs.existsSync(scriptPath)) return;
  
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  const docContent = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract Cloudflare token from docs
  const docTokenMatch = docContent.match(/Cloudflare.*?Token.*?`([^`]+)`/i);
  const docToken = docTokenMatch ? docTokenMatch[1] : null;
  
  // Extract domain from docs
  const docDomainMatch = docContent.match(/Domain.*?`([^`]+)`/i);
  const docDomain = docDomainMatch ? docDomainMatch[1] : null;
  
  // Check script uses same domain
  if (docDomain && !scriptContent.includes(docDomain)) {
    warnings.push(`⚠️ Domain mismatch: docs say ${docDomain}, script may use different`);
  }
  
  // Check Vercel DNS target
  const docVercelTarget = docContent.match(/cname\.vercel-dns\.com/i);
  if (docVercelTarget && !scriptContent.includes('cname.vercel-dns.com')) {
    warnings.push('⚠️ Vercel DNS target may not match documentation');
  }
}

// Test 5: Check backup functionality
function testBackupFunctionality() {
  console.log('💾 Testing Backup Functionality...');
  
  const scriptPath = path.join(scriptsDir, 'migrate-rensto-to-vercel.js');
  
  if (!fs.existsSync(scriptPath)) return;
  
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  
  // Check for backup creation
  if (!scriptContent.includes('backup') && !scriptContent.includes('BACKUP')) {
    warnings.push('⚠️ DNS script may not create backups before changes');
  }
  
  // Check for backup file location
  if (!scriptContent.includes('data/dns') && !scriptContent.includes('backup')) {
    warnings.push('⚠️ DNS script backup location may not be specified');
  }
}

// Run all tests
function runTests() {
  console.log('🧪 Running Script Validation Tests...\n');
  
  testDnsMigrationScript();
  testScriptDocumentation();
  testValidationScript();
  testScriptConfiguration();
  testBackupFunctionality();
  
  // Report results
  console.log('\n📊 Test Results:');
  console.log(`   Issues: ${issues.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);
  
  if (issues.length > 0) {
    console.log('❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All script validation tests passed!');
  }
  
  return {
    issues: issues.length,
    warnings: warnings.length,
    passed: issues.length === 0
  };
}

const result = runTests();
process.exit(result.passed ? 0 : 1);

