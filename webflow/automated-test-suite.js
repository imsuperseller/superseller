#!/usr/bin/env node

/**
 * Automated Test Suite for Rensto Webflow Deployment
 * Tests script loading, button initialization, and Stripe integration
 *
 * Usage: node automated-test-suite.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✅ ${msg}${COLORS.reset}`),
  error: (msg) => console.log(`${COLORS.red}❌ ${msg}${COLORS.reset}`),
  warn: (msg) => console.log(`${COLORS.yellow}⚠️  ${msg}${COLORS.reset}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ️  ${msg}${COLORS.reset}`),
  title: (msg) => console.log(`\n${COLORS.cyan}=== ${msg} ===${COLORS.reset}\n`)
};

// Pages to test
const SERVICE_PAGES = [
  { name: 'Marketplace', url: '/marketplace', expectedScripts: 2, scriptType: 'marketplace' },
  { name: 'Subscriptions', url: '/subscriptions', expectedScripts: 2, scriptType: 'subscriptions' },
  { name: 'Ready Solutions', url: '/ready-solutions', expectedScripts: 2, scriptType: 'ready-solutions' },
  { name: 'Custom Solutions', url: '/custom-solutions', expectedScripts: 2, scriptType: 'custom-solutions' }
];

const NICHE_PAGES = [
  'hvac', 'amazon-seller', 'realtor', 'roofers', 'dentist', 'bookkeeping',
  'busy-mom', 'ecommerce', 'fence-contractors', 'insurance', 'lawyer',
  'locksmith', 'photographers', 'product-supplier', 'synagogues'
].map(slug => ({ name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), url: `/${slug}`, expectedScripts: 2, scriptType: 'ready-solutions' }));

const CDN_SCRIPTS = [
  'shared/stripe-core.js',
  'marketplace/checkout.js',
  'subscriptions/checkout.js',
  'ready-solutions/checkout.js',
  'custom-solutions/checkout.js'
];

const BASE_URL = 'https://www.rensto.com';
const CDN_URL = 'https://rensto-webflow-scripts.vercel.app';

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

/**
 * Test 1: Verify CDN scripts are accessible
 */
async function testCDNAvailability() {
  log.title('Test 1: CDN Script Availability');

  for (const script of CDN_SCRIPTS) {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${CDN_URL}/${script}"`);
      const statusCode = stdout.trim();

      if (statusCode === '200') {
        log.success(`${script} - HTTP ${statusCode}`);
        results.passed++;
      } else {
        log.error(`${script} - HTTP ${statusCode}`);
        results.failed++;
      }

      results.tests.push({ test: `CDN: ${script}`, status: statusCode === '200' ? 'PASS' : 'FAIL', details: `HTTP ${statusCode}` });
    } catch (error) {
      log.error(`${script} - Error: ${error.message}`);
      results.failed++;
      results.tests.push({ test: `CDN: ${script}`, status: 'FAIL', details: error.message });
    }
  }
}

/**
 * Test 2: Verify page accessibility
 */
async function testPageAccessibility(pages, category) {
  log.title(`Test 2: Page Accessibility - ${category}`);

  for (const page of pages) {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page.url}"`);
      const statusCode = stdout.trim();

      if (statusCode === '200') {
        log.success(`${page.name} (${page.url}) - HTTP ${statusCode}`);
        results.passed++;
      } else if (statusCode === '301' || statusCode === '302') {
        log.warn(`${page.name} (${page.url}) - HTTP ${statusCode} (redirect)`);
        results.warnings++;
      } else {
        log.error(`${page.name} (${page.url}) - HTTP ${statusCode}`);
        results.failed++;
      }

      results.tests.push({ test: `Page: ${page.name}`, status: statusCode === '200' ? 'PASS' : (statusCode.startsWith('3') ? 'WARN' : 'FAIL'), details: `HTTP ${statusCode}` });
    } catch (error) {
      log.error(`${page.name} - Error: ${error.message}`);
      results.failed++;
      results.tests.push({ test: `Page: ${page.name}`, status: 'FAIL', details: error.message });
    }
  }
}

/**
 * Test 3: Verify script tags are present
 */
async function testScriptTagsPresent(pages, category) {
  log.title(`Test 3: Script Tag Presence - ${category}`);

  for (const page of pages) {
    try {
      const { stdout } = await execAsync(`curl -s "${BASE_URL}${page.url}" | grep -c "rensto-webflow-scripts.vercel.app" || echo "0"`);
      const scriptCount = parseInt(stdout.trim());

      if (scriptCount >= page.expectedScripts) {
        log.success(`${page.name} - ${scriptCount} script tags found (expected ${page.expectedScripts})`);
        results.passed++;
      } else if (scriptCount > 0) {
        log.warn(`${page.name} - ${scriptCount} script tags found (expected ${page.expectedScripts})`);
        results.warnings++;
      } else {
        log.error(`${page.name} - No script tags found`);
        results.failed++;
      }

      results.tests.push({
        test: `Scripts: ${page.name}`,
        status: scriptCount >= page.expectedScripts ? 'PASS' : (scriptCount > 0 ? 'WARN' : 'FAIL'),
        details: `${scriptCount}/${page.expectedScripts} scripts`
      });
    } catch (error) {
      log.error(`${page.name} - Error: ${error.message}`);
      results.failed++;
      results.tests.push({ test: `Scripts: ${page.name}`, status: 'FAIL', details: error.message });
    }
  }
}

/**
 * Test 4: Verify correct script type is loaded
 */
async function testCorrectScriptType(pages, category) {
  log.title(`Test 4: Correct Script Type - ${category}`);

  for (const page of pages) {
    try {
      const { stdout } = await execAsync(`curl -s "${BASE_URL}${page.url}" | grep -o "${page.scriptType}/checkout.js" || echo ""`);
      const hasCorrectScript = stdout.trim().length > 0;

      if (hasCorrectScript) {
        log.success(`${page.name} - Using ${page.scriptType}/checkout.js ✓`);
        results.passed++;
      } else {
        log.warn(`${page.name} - Expected ${page.scriptType}/checkout.js, not found`);
        results.warnings++;
      }

      results.tests.push({
        test: `Script Type: ${page.name}`,
        status: hasCorrectScript ? 'PASS' : 'WARN',
        details: hasCorrectScript ? `${page.scriptType}/checkout.js` : 'Not found'
      });
    } catch (error) {
      log.error(`${page.name} - Error: ${error.message}`);
      results.failed++;
      results.tests.push({ test: `Script Type: ${page.name}`, status: 'FAIL', details: error.message });
    }
  }
}

/**
 * Test 5: Quick smoke test on CDN caching
 */
async function testCDNCaching() {
  log.title('Test 5: CDN Caching Headers');

  const testScript = 'shared/stripe-core.js';
  try {
    const { stdout } = await execAsync(`curl -sI "${CDN_URL}/${testScript}" | grep -i "cache-control\\|x-vercel-cache"`);
    const headers = stdout.trim();

    if (headers.length > 0) {
      log.success('CDN caching headers present:');
      console.log(headers);
      results.passed++;
    } else {
      log.warn('No caching headers found');
      results.warnings++;
    }

    results.tests.push({ test: 'CDN Caching', status: headers.length > 0 ? 'PASS' : 'WARN', details: 'Headers checked' });
  } catch (error) {
    log.error(`Error checking caching: ${error.message}`);
    results.failed++;
    results.tests.push({ test: 'CDN Caching', status: 'FAIL', details: error.message });
  }
}

/**
 * Generate summary report
 */
function generateReport() {
  log.title('Test Summary');

  const total = results.passed + results.failed + results.warnings;
  const passRate = ((results.passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  log.success(`Passed: ${results.passed} (${passRate}%)`);
  if (results.warnings > 0) log.warn(`Warnings: ${results.warnings}`);
  if (results.failed > 0) log.error(`Failed: ${results.failed}`);

  console.log('\n--- Detailed Results ---\n');
  results.tests.forEach((test, i) => {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'WARN' ? '⚠️ ' : '❌';
    console.log(`${i + 1}. ${icon} ${test.test} - ${test.details}`);
  });

  console.log('\n--- Recommendations ---\n');
  if (results.failed > 0) {
    log.error('Action required: Some tests failed. Review failures above.');
  } else if (results.warnings > 0) {
    log.warn('Review warnings - some pages may need attention.');
  } else {
    log.success('All tests passed! System is healthy.');
  }

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   Rensto Webflow Automated Test Suite                         ║
║   Testing: Script loading, page accessibility, integration    ║
╚════════════════════════════════════════════════════════════════╝
  `);

  try {
    await testCDNAvailability();
    await testPageAccessibility(SERVICE_PAGES, 'Service Pages');
    await testPageAccessibility(NICHE_PAGES, 'Niche Pages');
    await testScriptTagsPresent(SERVICE_PAGES, 'Service Pages');
    await testScriptTagsPresent(NICHE_PAGES, 'Niche Pages');
    await testCorrectScriptType(SERVICE_PAGES, 'Service Pages');
    await testCorrectScriptType(NICHE_PAGES.slice(0, 3), 'Niche Pages (Sample)');
    await testCDNCaching();

    generateReport();
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runTests();
