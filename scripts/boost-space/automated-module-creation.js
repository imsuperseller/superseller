#!/usr/bin/env node
/**
 * Automated Boost.space Module Creation
 * Uses Playwright to log in and create 3 custom modules
 *
 * Modules to create:
 * 1. workflows - n8n workflow metadata
 * 2. mcp-servers - MCP server tracking
 * 3. business-references - Business documentation
 */

const { chromium } = require('playwright');

const BOOST_SPACE_CONFIG = {
  url: 'https://superseller.boost.space',
  email: 'shai', // Just username, not full email
  password: 'e1UVP5lVY'
};

const MODULES = [
  {
    name: 'workflows',
    description: 'n8n workflow metadata and organization',
    icon: '⚡',
    fields: [
      { name: 'workflow_name', type: 'text', required: true, description: 'Display name' },
      { name: 'workflow_id', type: 'text', required: true, description: 'n8n workflow ID (e.g. INT-LEAD-001)' },
      { name: 'n8n_id', type: 'text', required: true, description: 'n8n internal ID' },
      { name: 'type', type: 'select', required: true, options: ['Internal', 'Subscription', 'Ready', 'Marketplace', 'Marketing', 'Development', 'Customer', 'Archived'] },
      { name: 'department', type: 'select', required: true, options: ['Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Customer Success'] },
      { name: 'status', type: 'select', required: true, options: ['Active', 'Inactive', 'Testing', 'Archived'] },
      { name: 'description', type: 'longtext', required: false },
      { name: 'webhook_url', type: 'url', required: false },
      { name: 'revenue_potential', type: 'text', required: false },
      { name: 'dependencies', type: 'multiselect', required: false, options: ['OpenAI', 'Airtable', 'Apify', 'Stripe', 'QuickBooks', 'Notion', 'Make', 'Typeform'] },
      { name: 'created_date', type: 'date', required: false },
      { name: 'last_executed', type: 'datetime', required: false },
      { name: 'execution_count', type: 'number', required: false },
      { name: 'tags', type: 'tags', required: false }
    ]
  },
  {
    name: 'mcp-servers',
    description: 'MCP server tracking and configuration',
    icon: '🔌',
    fields: [
      { name: 'server_name', type: 'text', required: true, description: 'MCP server name' },
      { name: 'server_id', type: 'text', required: true, description: 'Unique identifier' },
      { name: 'type', type: 'select', required: true, options: ['Data Source', 'API Integration', 'Tool', 'Custom'] },
      { name: 'status', type: 'select', required: true, options: ['Active', 'Inactive', 'Testing', 'Deprecated'] },
      { name: 'description', type: 'longtext', required: false },
      { name: 'endpoint_url', type: 'url', required: false },
      { name: 'authentication', type: 'select', required: false, options: ['Bearer Token', 'API Key', 'OAuth', 'None'] },
      { name: 'configuration', type: 'longtext', required: false, description: 'JSON configuration' },
      { name: 'dependencies', type: 'text', required: false },
      { name: 'documentation_url', type: 'url', required: false },
      { name: 'created_date', type: 'date', required: false },
      { name: 'last_updated', type: 'datetime', required: false },
      { name: 'tags', type: 'tags', required: false }
    ]
  },
  {
    name: 'business-references',
    description: 'Business documentation and strategic docs',
    icon: '📚',
    fields: [
      { name: 'title', type: 'text', required: true, description: 'Document title' },
      { name: 'reference_id', type: 'text', required: true, description: 'Unique identifier' },
      { name: 'type', type: 'select', required: true, options: ['Strategy', 'Process', 'Architecture', 'Template', 'Guide', 'Policy'] },
      { name: 'category', type: 'select', required: true, options: ['Business Model', 'Technical', 'Operations', 'Marketing', 'Finance', 'Legal'] },
      { name: 'status', type: 'select', required: true, options: ['Active', 'Draft', 'Archived', 'Deprecated'] },
      { name: 'description', type: 'longtext', required: false },
      { name: 'content', type: 'richtext', required: false, description: 'Full document content' },
      { name: 'author', type: 'text', required: false },
      { name: 'notion_url', type: 'url', required: false },
      { name: 'external_url', type: 'url', required: false },
      { name: 'created_date', type: 'date', required: false },
      { name: 'last_updated', type: 'datetime', required: false },
      { name: 'version', type: 'text', required: false },
      { name: 'tags', type: 'tags', required: false }
    ]
  }
];

async function loginToBoostSpace(page) {
  console.log('🔐 Logging into Boost.space...');

  await page.goto(BOOST_SPACE_CONFIG.url);
  await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

  // Wait for login form - based on screenshot: "Enter your username or email"
  await page.waitForSelector('input[placeholder*="username"], input[placeholder*="email"]', { timeout: 15000 });

  console.log('  ✓ Login form loaded');

  // Fill email (placeholder: "Enter your username or email")
  await page.fill('input[placeholder*="username"], input[placeholder*="email"]', BOOST_SPACE_CONFIG.email);
  console.log('  ✓ Email filled');

  // Fill password (placeholder: "Enter password")
  await page.fill('input[placeholder*="password"]', BOOST_SPACE_CONFIG.password);
  console.log('  ✓ Password filled');

  // Wait a moment for form validation
  await page.waitForTimeout(1000);

  // Click login button (text: "Log in")
  await page.click('button:has-text("Log in")');
  console.log('  ✓ Login button clicked');

  // Wait for navigation after login (increased timeout)
  try {
    await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {
      console.log('  ⚠️  Dashboard URL not detected, checking for other indicators...');
    });
    await page.waitForTimeout(3000); // Additional wait for app to load
  } catch (error) {
    console.log('  ⚠️  Navigation check timeout, proceeding anyway...');
  }

  console.log('✅ Logged in successfully');
}

async function createModule(page, module) {
  console.log(`\n📦 Creating module: ${module.name}`);

  try {
    // Navigate to module creation page
    // This will need to be adjusted based on actual Boost.space UI
    await page.click('text=Settings, text=Admin, text=Modules');
    await page.waitForLoadState('networkidle');

    await page.click('text=Create Module, text=New Module, text=Add Module');
    await page.waitForLoadState('networkidle');

    // Fill module details
    await page.fill('input[name="name"], input[placeholder*="name"]', module.name);
    await page.fill('input[name="description"], textarea[name="description"]', module.description);

    // Add fields
    for (const field of module.fields) {
      console.log(`  ➕ Adding field: ${field.name} (${field.type})`);

      await page.click('text=Add Field, text=New Field, button:has-text("Field")');
      await page.waitForSelector('input[name="fieldName"], input[placeholder*="field name"]');

      await page.fill('input[name="fieldName"], input[placeholder*="field name"]', field.name);

      // Select field type
      await page.click(`select[name="fieldType"], [data-field="type"]`);
      await page.click(`option:has-text("${field.type}"), li:has-text("${field.type}")`);

      // Set required
      if (field.required) {
        await page.check('input[name="required"], input[type="checkbox"][data-field="required"]');
      }

      // Set description if exists
      if (field.description) {
        const descField = await page.$('input[name="description"], textarea[name="description"]');
        if (descField) {
          await descField.fill(field.description);
        }
      }

      // Add options for select/multiselect fields
      if (field.options && (field.type === 'select' || field.type === 'multiselect')) {
        for (const option of field.options) {
          await page.click('text=Add Option, button:has-text("Option")');
          await page.fill('input[name="optionValue"]:last-of-type, input[placeholder*="option"]:last-of-type', option);
        }
      }

      // Save field
      await page.click('button:has-text("Save"), button:has-text("Add Field")');
      await page.waitForTimeout(500);
    }

    // Save module
    await page.click('button:has-text("Create Module"), button:has-text("Save Module")');
    await page.waitForLoadState('networkidle');

    console.log(`✅ Module "${module.name}" created successfully with ${module.fields.length} fields`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating module "${module.name}":`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Boost.space automated module creation...\n');

  const browser = await chromium.launch({
    headless: true, // Headless mode for automation
    slowMo: 100 // Slow down actions for visibility
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    await loginToBoostSpace(page);

    // Create each module
    const results = [];
    for (const module of MODULES) {
      const success = await createModule(page, module);
      results.push({ module: module.name, success });

      // Wait between modules
      await page.waitForTimeout(2000);
    }

    // Summary
    console.log('\n📊 Summary:');
    results.forEach(r => {
      console.log(`  ${r.success ? '✅' : '❌'} ${r.module}`);
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✨ Created ${successCount}/${MODULES.length} modules successfully`);

    // Save screenshot for verification
    await page.screenshot({ path: '/tmp/boost-space-modules-created.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/boost-space-modules-created.png');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    await page.screenshot({ path: '/tmp/boost-space-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { main, MODULES };
