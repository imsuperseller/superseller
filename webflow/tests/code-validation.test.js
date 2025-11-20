#!/usr/bin/env node
/**
 * Code Validation Test Suite
 * Checks: API endpoints match docs, env vars consistent, file paths correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webflowDir = path.join(__dirname, '..');
const rootDir = path.join(__dirname, '../..');
const appDir = path.join(rootDir, 'apps/web/rensto-site');

const issues = [];
const warnings = [];

// Test 1: Check API endpoints match documentation
function testApiEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Expected endpoints from docs
  const expectedEndpoints = [
    '/api/marketplace/workflows',
    '/api/stripe/checkout',
    '/api/stripe/webhook'
  ];
  
  // Check if endpoints exist in code
  for (const endpoint of expectedEndpoints) {
    const parts = endpoint.split('/').filter(Boolean);
    const filePath = path.join(appDir, 'src/app', ...parts, 'route.ts');
    
    if (!fs.existsSync(filePath)) {
      issues.push(`❌ API endpoint missing: ${endpoint} (expected at ${filePath})`);
    } else {
      // Check if it's mentioned in docs
      if (!content.includes(endpoint)) {
        warnings.push(`⚠️ API endpoint ${endpoint} exists in code but not documented`);
      }
    }
  }
  
  // Check for undocumented endpoints
  const apiDir = path.join(appDir, 'src/app/api');
  if (fs.existsSync(apiDir)) {
    const endpoints = findAllRoutes(apiDir);
    for (const endpoint of endpoints) {
      if (!content.includes(endpoint)) {
        warnings.push(`⚠️ Undocumented API endpoint: ${endpoint}`);
      }
    }
  }
}

// Helper: Find all route files recursively
function findAllRoutes(dir, basePath = '/api') {
  const routes = [];
  
  if (!fs.existsSync(dir)) return routes;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subRoutes = findAllRoutes(
        fullPath,
        `${basePath}/${entry.name}`
      );
      routes.push(...subRoutes);
    } else if (entry.name === 'route.ts') {
      routes.push(basePath);
    }
  }
  
  return routes;
}

// Test 2: Check environment variables consistency
function testEnvironmentVariables() {
  console.log('🔐 Testing Environment Variables...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract env vars from docs
  const docEnvVars = (content.match(/`([A-Z_]+)`/g) || [])
    .map(m => m.replace(/`/g, ''))
    .filter(v => v.includes('_') && (v.includes('KEY') || v.includes('SECRET') || v.includes('API') || v.includes('TOKEN')));
  
  // Check API route files for env var usage
  const apiDir = path.join(appDir, 'src/app/api');
  const codeEnvVars = new Set();
  
  if (fs.existsSync(apiDir)) {
    scanForEnvVars(apiDir, codeEnvVars);
  }
  
  // Compare
  const docSet = new Set(docEnvVars);
  
  // Check if documented vars are used in code
  for (const envVar of docEnvVars) {
    if (!codeEnvVars.has(envVar)) {
      warnings.push(`⚠️ ${envVar} mentioned in docs but not found in API code`);
    }
  }
  
  // Check if code uses undocumented vars
  for (const envVar of codeEnvVars) {
    if (!docSet.has(envVar)) {
      warnings.push(`⚠️ ${envVar} used in code but not documented`);
    }
  }
  
  // Critical env vars must be documented
  const criticalVars = [
    'AIRTABLE_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  for (const envVar of criticalVars) {
    if (!content.includes(envVar)) {
      issues.push(`❌ Critical environment variable ${envVar} not documented`);
    }
    if (!codeEnvVars.has(envVar)) {
      issues.push(`❌ Critical environment variable ${envVar} not used in code`);
    }
  }
}

// Helper: Scan files for process.env usage
function scanForEnvVars(dir, envVars) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanForEnvVars(fullPath, envVars);
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

// Test 3: Check file paths mentioned in docs exist
function testFilePathReferences() {
  console.log('📁 Testing File Path References...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract file paths mentioned
  const pathMatches = content.match(/`apps\/web\/[^`]+`/g) || [];
  
  for (const match of pathMatches) {
    const filePath = match.replace(/`/g, '');
    const fullPath = path.join(rootDir, filePath);
    
    if (!fs.existsSync(fullPath)) {
      issues.push(`❌ Referenced file path missing: ${filePath}`);
    }
  }
}

// Test 4: Check Airtable configuration matches
function testAirtableConfig() {
  console.log('🗄️  Testing Airtable Configuration...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const docContent = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract base ID and table from docs
  const baseIdMatch = docContent.match(/Base ID.*?`([a-zA-Z0-9]+)`/);
  const tableIdMatch = docContent.match(/Table.*?`([a-zA-Z0-9]+)`/);
  
  if (!baseIdMatch || !tableIdMatch) {
    warnings.push('⚠️ Airtable Base ID or Table ID not found in docs');
    return;
  }
  
  const docBaseId = baseIdMatch[1];
  const docTableId = tableIdMatch[1];
  
  // Check API route for matching IDs
  const workflowsRoute = path.join(appDir, 'src/app/api/marketplace/workflows/route.ts');
  
  if (fs.existsSync(workflowsRoute)) {
    const code = fs.readFileSync(workflowsRoute, 'utf8');
    
    if (!code.includes(docBaseId)) {
      issues.push(`❌ Airtable Base ID mismatch: docs say ${docBaseId}, code has different`);
    }
    
    if (!code.includes(docTableId)) {
      issues.push(`❌ Airtable Table ID mismatch: docs say ${docTableId}, code has different`);
    }
  }
}

// Test 5: Check n8n webhook URLs match
function testN8nWebhooks() {
  console.log('⚙️  Testing n8n Webhook URLs...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const docContent = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract n8n URL from docs
  const n8nUrlMatch = docContent.match(/n8n.*?URL.*?http[s]?:\/\/[^\s]+/i);
  
  if (!n8nUrlMatch) {
    warnings.push('⚠️ n8n URL not found in documentation');
    return;
  }
  
  const docN8nUrl = n8nUrlMatch[0].match(/http[s]?:\/\/[^\s]+/)?.[0];
  
  if (!docN8nUrl) return;
  
  // Check webhook route for matching URL
  const webhookRoute = path.join(appDir, 'src/app/api/stripe/webhook/route.ts');
  
  if (fs.existsSync(webhookRoute)) {
    const code = fs.readFileSync(webhookRoute, 'utf8');
    
    if (!code.includes(docN8nUrl)) {
      warnings.push(`⚠️ n8n URL in code may differ from documentation`);
    }
  }
}

// Run all tests
function runTests() {
  console.log('🧪 Running Code Validation Tests...\n');
  
  testApiEndpoints();
  testEnvironmentVariables();
  testFilePathReferences();
  testAirtableConfig();
  testN8nWebhooks();
  
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
    console.log('✅ All code validation tests passed!');
  }
  
  return {
    issues: issues.length,
    warnings: warnings.length,
    passed: issues.length === 0
  };
}

const result = runTests();
process.exit(result.passed ? 0 : 1);

