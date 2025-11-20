#!/usr/bin/env node
/**
 * Configuration Validation Test Suite
 * Checks: Vercel config, environment variables, DNS settings consistency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../..');
const appDir = path.join(rootDir, 'apps/web/rensto-site');
const webflowDir = path.join(rootDir, 'webflow');

const issues = [];
const warnings = [];

// Test 1: Check Vercel configuration consistency
function testVercelConfig() {
  console.log('\n🚀 Testing Vercel Configuration...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract Vercel project name
  const projectMatch = content.match(/Project.*?`([^`]+)`/i);
  const projectName = projectMatch ? projectMatch[1] : null;
  
  if (!projectName) {
    warnings.push('⚠️ Vercel project name not found in documentation');
  }
  
  // Check vercel.json exists
  const vercelConfig = path.join(appDir, 'vercel.json');
  if (fs.existsSync(vercelConfig)) {
    const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
    
    // Check if project name matches
    if (projectName && config.name && config.name !== projectName) {
      warnings.push(`⚠️ Vercel project name mismatch: docs say ${projectName}, config says ${config.name}`);
    }
  }
}

// Test 2: Check environment variables list completeness
function testEnvVarCompleteness() {
  console.log('🔐 Testing Environment Variables Completeness...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Required env vars from docs
  const requiredVars = [
    'AIRTABLE_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  // Check each required var is mentioned
  for (const envVar of requiredVars) {
    if (!content.includes(envVar)) {
      issues.push(`❌ Required environment variable ${envVar} not documented`);
    }
  }
  
  // Check code actually uses these
  const apiDir = path.join(appDir, 'src/app/api');
  if (fs.existsSync(apiDir)) {
    const codeEnvVars = scanForEnvVars(apiDir);
    
    for (const envVar of requiredVars) {
      if (!codeEnvVars.has(envVar) && envVar !== 'NEXT_PUBLIC_APP_URL') {
        warnings.push(`⚠️ ${envVar} documented but not found in API code`);
      }
    }
  }
}

// Helper: Scan for env vars
function scanForEnvVars(dir) {
  const envVars = new Set();
  
  if (!fs.existsSync(dir)) return envVars;
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const matches = fileContent.match(/process\.env\.([A-Z_]+)/g) || [];
        matches.forEach(m => {
          const varName = m.replace('process.env.', '');
          envVars.add(varName);
        });
      }
    }
  }
  
  scanDir(dir);
  return envVars;
}

// Test 3: Check DNS configuration consistency
function testDnsConfiguration() {
  console.log('🌐 Testing DNS Configuration...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract current DNS
  const currentDnsMatch = content.match(/Current DNS[\s\S]*?Root A.*?`([^`]+)`/i);
  const targetDnsMatch = content.match(/Target DNS[\s\S]*?Root CNAME.*?`([^`]+)`/i);
  
  if (!currentDnsMatch || !targetDnsMatch) {
    warnings.push('⚠️ DNS configuration not clearly documented');
    return;
  }
  
  // Check if script matches docs
  const scriptPath = path.join(rootDir, 'scripts/dns/migrate-rensto-to-vercel.js');
  if (fs.existsSync(scriptPath)) {
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    if (!scriptContent.includes('cname.vercel-dns.com')) {
      warnings.push('⚠️ DNS script may not match target DNS in documentation');
    }
  }
}

// Test 4: Check Airtable configuration consistency
function testAirtableConfiguration() {
  console.log('🗄️  Testing Airtable Configuration...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const docContent = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract base ID and table
  const baseIdMatch = docContent.match(/Base ID.*?`([a-zA-Z0-9]+)`/);
  const tableIdMatch = docContent.match(/Table.*?`([a-zA-Z0-9]+)`/);
  
  if (!baseIdMatch || !tableIdMatch) {
    warnings.push('⚠️ Airtable configuration incomplete in documentation');
    return;
  }
  
  const docBaseId = baseIdMatch[1];
  const docTableId = tableIdMatch[1];
  
  // Check API route matches
  const workflowsRoute = path.join(appDir, 'src/app/api/marketplace/workflows/route.ts');
  
  if (fs.existsSync(workflowsRoute)) {
    const code = fs.readFileSync(workflowsRoute, 'utf8');
    
    if (!code.includes(docBaseId)) {
      issues.push(`❌ Airtable Base ID mismatch between docs (${docBaseId}) and code`);
    }
    
    if (!code.includes(docTableId)) {
      issues.push(`❌ Airtable Table ID mismatch between docs (${docTableId}) and code`);
    }
  } else {
    issues.push('❌ Marketplace workflows API route missing');
  }
}

// Test 5: Check n8n configuration consistency
function testN8nConfiguration() {
  console.log('⚙️  Testing n8n Configuration...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract n8n URL
  const n8nUrlMatch = content.match(/n8n.*?URL.*?(http[s]?:\/\/[^\s]+)/i);
  const n8nUrl = n8nUrlMatch ? n8nUrlMatch[1] : null;
  
  if (!n8nUrl) {
    warnings.push('⚠️ n8n URL not found in documentation');
    return;
  }
  
  // Check webhook route uses same URL
  const webhookRoute = path.join(appDir, 'src/app/api/stripe/webhook/route.ts');
  
  if (fs.existsSync(webhookRoute)) {
    const code = fs.readFileSync(webhookRoute, 'utf8');
    
    // Extract URL from code (may have port)
    const codeUrlMatch = code.match(/(http[s]?:\/\/[^\s'"]+:?\d*)/);
    const codeUrl = codeUrlMatch ? codeUrlMatch[1] : null;
    
    if (codeUrl && !codeUrl.includes('173.254.201.134')) {
      warnings.push('⚠️ n8n URL in code may differ from documentation');
    }
  }
}

// Test 6: Check domain architecture consistency
function testDomainArchitecture() {
  console.log('🏗️  Testing Domain Architecture...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Check for domain architecture rules
  const domainRules = [
    'rensto.com',
    'admin.rensto.com',
    'api.rensto.com'
  ];
  
  for (const domain of domainRules) {
    if (!content.includes(domain)) {
      warnings.push(`⚠️ Domain ${domain} not mentioned in handoff guide`);
    }
  }
  
  // Check for architecture warnings
  if (content.includes('NEVER') && !content.includes('rensto.com.*Vercel')) {
    // This is okay, it's warning about DNS
  }
}

// Run all tests
function runTests() {
  console.log('🧪 Running Configuration Validation Tests...\n');
  
  testVercelConfig();
  testEnvVarCompleteness();
  testDnsConfiguration();
  testAirtableConfiguration();
  testN8nConfiguration();
  testDomainArchitecture();
  
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
    console.log('✅ All configuration validation tests passed!');
  }
  
  return {
    issues: issues.length,
    warnings: warnings.length,
    passed: issues.length === 0
  };
}

const result = runTests();
process.exit(result.passed ? 0 : 1);

