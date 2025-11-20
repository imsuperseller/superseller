#!/usr/bin/env node
/**
 * Documentation Consistency Test Suite
 * Checks for: broken links, missing files, contradictions, inconsistencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webflowDir = path.join(__dirname, '..');
const rootDir = path.join(__dirname, '../..');

const issues = [];
const warnings = [];

// Test 1: Check if all referenced files exist
function testFileReferences() {
  console.log('\n📄 Testing File References...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  if (!fs.existsSync(handoffGuide)) {
    issues.push('❌ AGENT_HANDOFF_GUIDE.md missing');
    return;
  }

  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Extract all markdown file references
  const mdRefs = content.match(/`([^`]+\.md)`/g) || [];
  const fileRefs = mdRefs.map(ref => ref.replace(/`/g, ''));
  
  // Check each reference
  for (const ref of fileRefs) {
    // Skip if it's the current file or if it's a fragment
    if (ref.includes('#') || ref.startsWith('./') || ref.startsWith('../')) continue;
    
    const filePath = path.join(webflowDir, ref);
    if (!fs.existsSync(filePath)) {
      issues.push(`❌ Referenced file missing: ${ref}`);
    }
  }

  // Check script references
  const scriptRefs = content.match(/`scripts\/[^`]+`/g) || [];
  for (const ref of scriptRefs) {
    const scriptPath = ref.replace(/`/g, '').replace(/^scripts\//, '');
    // Skip backup directories (created at runtime)
    if (scriptPath.includes('backup')) continue;
    const fullPath = path.join(rootDir, 'scripts', scriptPath);
    if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.js')) {
      issues.push(`❌ Referenced script missing: ${ref}`);
    }
  }
  
  // Check for document references (handle relative paths)
  const docRefs = content.match(/`([^`]+\.md)`/g) || [];
  for (const ref of docRefs) {
    const docPath = ref.replace(/`/g, '');
    // Skip if it's a relative path or fragment
    if (docPath.startsWith('./') || docPath.startsWith('../') || docPath.includes('#')) continue;
    // Check in docs directory
    const fullPath = path.join(rootDir, 'docs', docPath);
    const webflowPath = path.join(webflowDir, docPath);
    const rootPath = path.join(rootDir, docPath);
    if (!fs.existsSync(fullPath) && !fs.existsSync(webflowPath) && !fs.existsSync(rootPath)) {
      // Only flag if it's clearly a missing reference (not a generic mention)
      if (docPath.includes('/') || docPath.match(/^[A-Z_]+\.md$/)) {
        warnings.push(`⚠️ Referenced document may be missing: ${docPath} (check if relative path)`);
      }
    }
  }
}

// Test 2: Check for contradictions in documentation
function testContradictions() {
  console.log('🔍 Testing for Contradictions...');
  
  const files = [
    'AGENT_HANDOFF_GUIDE.md',
    'PRE_CUTOVER_FINAL_STATUS.md',
    'MIGRATION_EXECUTION_PLAN.md',
    'DNS_MIGRATION_AUTOMATED.md'
  ];

  const data = {};
  
  // Extract key values from each file
  for (const file of files) {
    const filePath = path.join(webflowDir, file);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract status percentages
    const statusMatch = content.match(/(\d+)%\s*(?:ready|complete|Ready|Complete)/i);
    if (statusMatch) {
      data[file] = { status: parseInt(statusMatch[1]) };
    } else {
      data[file] = {};
    }
    
    // Extract environment variables mentioned
    const envMatches = content.match(/`([A-Z_]+)`/g) || [];
    data[file].envVars = envMatches.map(m => m.replace(/`/g, ''));
  }

  // Check for status contradictions
  const statuses = Object.values(data).map(d => d.status).filter(Boolean);
  if (statuses.length > 1 && Math.max(...statuses) - Math.min(...statuses) > 10) {
    warnings.push('⚠️ Status percentages vary significantly across documents');
  }

  // Check environment variable consistency
  const allEnvVars = new Set();
  Object.values(data).forEach(d => {
    if (d.envVars) d.envVars.forEach(v => allEnvVars.add(v));
  });
  
  const envVarList = ['AIRTABLE_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  for (const envVar of envVarList) {
    const mentionedIn = Object.keys(data).filter(f => 
      data[f].envVars?.includes(envVar)
    );
    if (mentionedIn.length === 0) {
      warnings.push(`⚠️ ${envVar} not mentioned in documentation`);
    }
  }
}

// Test 3: Check cross-references
function testCrossReferences() {
  console.log('🔗 Testing Cross-References...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  // Check if README.md is mentioned
  if (!content.includes('README.md')) {
    warnings.push('⚠️ README.md not referenced in handoff guide');
  }
  
  // Check if DOCUMENTATION_INDEX.md is mentioned
  if (!content.includes('DOCUMENTATION_INDEX.md')) {
    warnings.push('⚠️ DOCUMENTATION_INDEX.md not referenced in handoff guide');
  }
}

// Test 4: Check for missing critical information
function testCriticalInfo() {
  console.log('🔑 Testing Critical Information...');
  
  const handoffGuide = path.join(webflowDir, 'AGENT_HANDOFF_GUIDE.md');
  const content = fs.readFileSync(handoffGuide, 'utf8');
  
  const criticalInfo = [
    { key: 'Vercel', check: /vercel/i },
    { key: 'Cloudflare', check: /cloudflare/i },
    { key: 'DNS', check: /dns/i },
    { key: 'Environment Variables', check: /environment.*variable/i },
    { key: 'Stripe', check: /stripe/i },
    { key: 'Airtable', check: /airtable/i },
    { key: 'n8n', check: /n8n/i },
    { key: 'API endpoints', check: /api.*endpoint/i }
  ];

  for (const info of criticalInfo) {
    if (!info.check.test(content)) {
      warnings.push(`⚠️ ${info.key} not mentioned in handoff guide`);
    }
  }
}

// Run all tests
function runTests() {
  console.log('🧪 Running Documentation Consistency Tests...\n');
  
  testFileReferences();
  testContradictions();
  testCrossReferences();
  testCriticalInfo();
  
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
    console.log('✅ All documentation consistency tests passed!');
  }
  
  return {
    issues: issues.length,
    warnings: warnings.length,
    passed: issues.length === 0
  };
}

const result = runTests();
process.exit(result.passed ? 0 : 1);

