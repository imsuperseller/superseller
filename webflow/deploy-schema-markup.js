#!/usr/bin/env node
/**
 * Deploy Schema Markup to Service Pages
 * Uses Webflow MCP tools or provides manual instructions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_ID = '66c7e551a317e0e9c9f906d8';

const PAGE_MAP = {
  marketplace: {
    id: '68ddb0fb5b6408d0687890dd',
    slug: 'marketplace',
    file: 'marketplace-schema-head-code.txt'
  },
  subscriptions: {
    id: '68dfc41ffedc0a46e687c84b',
    slug: 'subscriptions',
    file: 'subscriptions-schema-head-code.txt'
  },
  'ready-solutions': {
    id: '68dfc5266816931539f098d5',
    slug: 'ready-solutions',
    file: 'ready-solutions-schema-head-code.txt'
  },
  'custom-solutions': {
    id: '68ddb0642b86f8d1a89ba166',
    slug: 'custom-solutions',
    file: 'custom-solutions-schema-head-code.txt'
  }
};

function readSchemaFile(filename) {
  const filePath = path.join(__dirname, 'deployment-snippets', filename);
  return fs.readFileSync(filePath, 'utf-8');
}

function extractSchemaOnly(content) {
  // Remove HTML comments and extract just the script tag
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

function generateDeploymentGuide() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 SCHEMA MARKUP DEPLOYMENT GUIDE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('📋 PAGES TO UPDATE:\n');

  Object.entries(PAGE_MAP).forEach(([key, page], index) => {
    const schema = readSchemaFile(page.file);
    const cleanSchema = extractSchemaOnly(schema);
    
    console.log(`${index + 1}. ${key.toUpperCase()} (/${page.slug})`);
    console.log(`   Page ID: ${page.id}`);
    console.log(`   File: ${page.file}`);
    console.log(`   Schema Length: ${cleanSchema.length} characters\n`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🎯 DEPLOYMENT OPTIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('OPTION 1: Use MCP Tools in Cursor');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('For each page, ask Cursor MCP:');
  console.log('');
  Object.entries(PAGE_MAP).forEach(([key, page], index) => {
    console.log(`${index + 1}. ${key}:`);
    console.log(`   "Add this schema markup to page ${page.id} (${page.slug}):`);
    console.log(`   [paste from ${page.file}]`);
  });

  console.log('\n───────────────────────────────────────────────────────────────\n');
  console.log('OPTION 2: Manual Deployment (Recommended)');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('For each page:\n');

  Object.entries(PAGE_MAP).forEach(([key, page], index) => {
    const schema = readSchemaFile(page.file);
    const cleanSchema = extractSchemaOnly(schema);
    
    console.log(`${index + 1}. ${key.toUpperCase()} (/${page.slug}):`);
    console.log(`   a. Open Webflow Designer`);
    console.log(`   b. Go to page: /${page.slug}`);
    console.log(`   c. Click Page Settings (gear icon)`);
    console.log(`   d. Custom Code → Code in <head> tag`);
    console.log(`   e. Paste schema from: deployment-snippets/${page.file}`);
    console.log(`   f. Save\n`);
  });

  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Generate deployment instructions
generateDeploymentGuide();

// Also create individual files for easy copy-paste
Object.entries(PAGE_MAP).forEach(([key, page]) => {
  const schema = readSchemaFile(page.file);
  const cleanSchema = extractSchemaOnly(schema);
  
  const outputFile = path.join(__dirname, `SCHEMA_${key.toUpperCase()}_CLEAN.txt`);
  fs.writeFileSync(outputFile, cleanSchema);
  
  console.log(`✅ Created: ${outputFile}`);
});

console.log('\n✅ Deployment guide generated!');
console.log('   See individual SCHEMA_*_CLEAN.txt files for easy copy-paste\n');

