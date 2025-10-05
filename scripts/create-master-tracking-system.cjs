#!/usr/bin/env node

/**
 * MASTER TRACKING SYSTEM SETUP
 * Creates comprehensive Airtable tracking tables for all Rensto operations
 * Based on: /CLAUDE.md (Single Source of Truth)
 */

const https = require('https');

const AIRTABLE_TOKEN = 'AIRTABLE_KEY_REDACTED';
const BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation base

async function airtableRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          console.error(`Airtable Error ${res.statusCode}:`, data);
          reject(new Error(`Airtable: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function createTable(tableName, description) {
  console.log(`\n📋 Creating table: ${tableName}`);
  try {
    await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      {
        name: tableName,
        description: description,
        fields: [
          { name: 'Name', type: 'singleLineText' },
          { name: 'Status', type: 'singleSelect', options: {
            choices: [
              { name: '🔴 Not Started', color: 'redBright' },
              { name: '🟡 In Progress', color: 'yellowBright' },
              { name: '🟢 Completed', color: 'greenBright' },
              { name: '⏸️ On Hold', color: 'grayBright' },
              { name: '❌ Cancelled', color: 'redLight' }
            ]
          }},
          { name: 'Priority', type: 'singleSelect', options: {
            choices: [
              { name: '🔥 Critical', color: 'redBright' },
              { name: '⚠️ High', color: 'orangeBright' },
              { name: '📊 Medium', color: 'yellowBright' },
              { name: '📝 Low', color: 'grayBright' }
            ]
          }},
          { name: 'Notes', type: 'multilineText' },
          { name: 'Created', type: 'createdTime' },
          { name: 'Last Modified', type: 'lastModifiedTime' }
        ]
      }
    );
    console.log(`   ✅ Created: ${tableName}`);
  } catch (error) {
    if (error.message.includes('INVALID_REQUEST_BODY') && error.message.includes('already exists')) {
      console.log(`   ⚠️  Table already exists: ${tableName}`);
    } else {
      console.error(`   ❌ Failed to create ${tableName}:`, error.message);
    }
  }
}

async function createAffiliateLinksTable() {
  console.log(`\n📋 Creating Affiliate Links table`);
  try {
    await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      {
        name: 'Affiliate Links',
        description: 'Track all affiliate links and referral revenue',
        fields: [
          { name: 'Platform', type: 'singleLineText' },
          { name: 'Affiliate Link', type: 'url' },
          { name: 'Commission Rate', type: 'percent', options: { precision: 2 } },
          { name: 'Tracking Method', type: 'singleSelect', options: {
            choices: [
              { name: 'URL Parameter', color: 'blueBright' },
              { name: 'Dashboard API', color: 'greenBright' },
              { name: 'Manual', color: 'grayBright' }
            ]
          }},
          { name: 'Revenue to Date', type: 'currency', options: { precision: 2, symbol: '$' } },
          { name: 'Clicks', type: 'number', options: { precision: 0 } },
          { name: 'Conversions', type: 'number', options: { precision: 0 } },
          { name: 'Status', type: 'singleSelect', options: {
            choices: [
              { name: '✅ Active', color: 'greenBright' },
              { name: '⏸️ Paused', color: 'yellowBright' },
              { name: '❌ Inactive', color: 'grayBright' }
            ]
          }},
          { name: 'Notes', type: 'multilineText' }
        ]
      }
    );
    console.log(`   ✅ Created: Affiliate Links table`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ⚠️  Affiliate Links table already exists`);
    } else {
      console.error(`   ❌ Failed:`, error.message);
    }
  }
}

async function createAppsAndSoftwareTable() {
  console.log(`\n📋 Creating Apps & Software table`);
  try {
    await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      {
        name: 'Apps & Software',
        description: 'Track all SaaS subscriptions, usage, and costs',
        fields: [
          { name: 'App Name', type: 'singleLineText' },
          { name: 'Category', type: 'singleSelect', options: {
            choices: [
              { name: 'AI/ML', color: 'purpleBright' },
              { name: 'Automation', color: 'blueBright' },
              { name: 'Database', color: 'greenBright' },
              { name: 'Hosting', color: 'orangeBright' },
              { name: 'Marketing', color: 'pinkBright' },
              { name: 'Analytics', color: 'yellowBright' },
              { name: 'Development', color: 'cyanBright' },
              { name: 'Other', color: 'grayBright' }
            ]
          }},
          { name: 'Monthly Cost', type: 'currency', options: { precision: 2, symbol: '$' } },
          { name: 'Usage This Month', type: 'multilineText' },
          { name: 'API Connected', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
          { name: 'Last Sync', type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } },
          { name: 'Auto-Tracking', type: 'singleSelect', options: {
            choices: [
              { name: '✅ Automated', color: 'greenBright' },
              { name: '🔄 Partial', color: 'yellowBright' },
              { name: '📝 Manual', color: 'grayBright' }
            ]
          }},
          { name: 'Renewal Date', type: 'date', options: { dateFormat: { name: 'us' } } },
          { name: 'Account Email', type: 'email' },
          { name: 'Status', type: 'singleSelect', options: {
            choices: [
              { name: '✅ Active', color: 'greenBright' },
              { name: '⚠️ Expiring Soon', color: 'yellowBright' },
              { name: '❌ Cancelled', color: 'redBright' }
            ]
          }},
          { name: 'Notes', type: 'multilineText' }
        ]
      }
    );
    console.log(`   ✅ Created: Apps & Software table`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ⚠️  Apps & Software table already exists`);
    } else {
      console.error(`   ❌ Failed:`, error.message);
    }
  }
}

async function createCustomerJourneyTable() {
  console.log(`\n📋 Creating Customer Journey table`);
  try {
    await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      {
        name: 'Customer Journey',
        description: 'Track customer lifecycle stages and touchpoints',
        fields: [
          { name: 'Customer Name', type: 'singleLineText' },
          { name: 'Service Type', type: 'singleSelect', options: {
            choices: [
              { name: 'Marketplace', color: 'blueBright' },
              { name: 'Ready Solutions', color: 'greenBright' },
              { name: 'Subscriptions', color: 'purpleBright' },
              { name: 'Custom Solutions', color: 'orangeBright' }
            ]
          }},
          { name: 'Current Stage', type: 'singleSelect', options: {
            choices: [
              { name: '🎯 Awareness', color: 'grayBright' },
              { name: '🤝 Engagement', color: 'blueBright' },
              { name: '📧 Subscribe', color: 'cyanBright' },
              { name: '💳 Convert', color: 'greenBright' },
              { name: '🎉 Excite', color: 'yellowBright' },
              { name: '⬆️ Ascend', color: 'orangeBright' },
              { name: '❤️ Advocate', color: 'pinkBright' },
              { name: '📢 Promote', color: 'purpleBright' }
            ]
          }},
          { name: 'Purchase Date', type: 'date', options: { dateFormat: { name: 'us' } } },
          { name: 'Total Revenue', type: 'currency', options: { precision: 2, symbol: '$' } },
          { name: 'Project Status', type: 'singleSelect', options: {
            choices: [
              { name: '🔴 Not Started', color: 'redBright' },
              { name: '🟡 In Progress', color: 'yellowBright' },
              { name: '🟢 Delivered', color: 'greenBright' },
              { name: '✅ Complete', color: 'blueBright' }
            ]
          }},
          { name: 'Last Touchpoint', type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'America/New_York' } },
          { name: 'Next Action', type: 'multilineText' },
          { name: 'n8n Cloud Details', type: 'multilineText' },
          { name: 'Portal URL', type: 'url' },
          { name: 'Satisfaction Score', type: 'rating', options: { icon: 'star', max: 5, color: 'yellowBright' } },
          { name: 'Notes', type: 'multilineText' }
        ]
      }
    );
    console.log(`   ✅ Created: Customer Journey table`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ⚠️  Customer Journey table already exists`);
    } else {
      console.error(`   ❌ Failed:`, error.message);
    }
  }
}

async function createImplementationTrackerTable() {
  console.log(`\n📋 Creating Implementation Tracker table`);
  try {
    await airtableRequest(
      `/v0/meta/bases/${BASE_ID}/tables`,
      'POST',
      {
        name: 'Implementation Tracker',
        description: 'Track all features from CLAUDE.md - master implementation progress',
        fields: [
          { name: 'Feature', type: 'singleLineText' },
          { name: 'Category', type: 'singleSelect', options: {
            choices: [
              { name: 'Payments', color: 'greenBright' },
              { name: 'Customer Onboarding', color: 'blueBright' },
              { name: 'Admin Tools', color: 'purpleBright' },
              { name: 'Automation', color: 'orangeBright' },
              { name: 'Integrations', color: 'cyanBright' },
              { name: 'Data Sync', color: 'yellowBright' },
              { name: 'Analytics', color: 'pinkBright' },
              { name: 'Other', color: 'grayBright' }
            ]
          }},
          { name: 'Status', type: 'singleSelect', options: {
            choices: [
              { name: '❌ Not Implemented', color: 'redBright' },
              { name: '📝 Documented Only', color: 'yellowBright' },
              { name: '🔄 In Progress', color: 'blueBright' },
              { name: '⚠️ Partially Built', color: 'orangeBright' },
              { name: '✅ Fully Implemented', color: 'greenBright' }
            ]
          }},
          { name: 'Priority', type: 'singleSelect', options: {
            choices: [
              { name: '🔥 Critical', color: 'redBright' },
              { name: '⚠️ High', color: 'orangeBright' },
              { name: '📊 Medium', color: 'yellowBright' },
              { name: '📝 Low', color: 'grayBright' }
            ]
          }},
          { name: 'Est. Days', type: 'number', options: { precision: 1 } },
          { name: 'Revenue Impact', type: 'multilineText' },
          { name: 'Blockers', type: 'multilineText' },
          { name: 'Documentation Link', type: 'url' },
          { name: 'Assigned To', type: 'singleLineText' },
          { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'us' } } },
          { name: 'Completed Date', type: 'date', options: { dateFormat: { name: 'us' } } },
          { name: 'Notes', type: 'multilineText' }
        ]
      }
    );
    console.log(`   ✅ Created: Implementation Tracker table`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ⚠️  Implementation Tracker table already exists`);
    } else {
      console.error(`   ❌ Failed:`, error.message);
    }
  }
}

async function populateAffiliateLinks() {
  console.log(`\n📝 Populating Affiliate Links...`);

  const affiliates = [
    { platform: 'Apify', link: 'https://tinyurl.com/Rensto', commission: 20, method: 'URL Parameter', status: '✅ Active' },
    { platform: 'Instantly.ai', link: 'https://tinyurl.com/rensto-instantly', commission: 30, method: 'URL Parameter', status: '✅ Active' },
    { platform: 'Airtable', link: 'https://tinyurl.com/4xujacz6', commission: 20, method: 'URL Parameter', status: '✅ Active' },
    { platform: 'Make.com', link: 'https://tinyurl.com/bdemt8ht', commission: 20, method: 'URL Parameter', status: '✅ Active' },
    { platform: 'Hyperise', link: 'https://share.hyperise.io?fp_ref=myperise20off', commission: 20, method: 'URL Parameter', status: '⏸️ Paused' },
    { platform: 'n8n', link: 'https://tinyurl.com/ym3awuke', commission: 25, method: 'URL Parameter', status: '✅ Active' },
    { platform: 'JoinSecret.com', link: 'https://tinyurl.com/mxdafenx', commission: 30, method: 'URL Parameter', status: '✅ Active' }
  ];

  for (const affiliate of affiliates) {
    try {
      await airtableRequest(
        `/v0/${BASE_ID}/Affiliate%20Links`,
        'POST',
        {
          fields: {
            'Platform': affiliate.platform,
            'Affiliate Link': affiliate.link,
            'Commission Rate': affiliate.commission / 100,
            'Tracking Method': affiliate.method,
            'Revenue to Date': 0,
            'Clicks': 0,
            'Conversions': 0,
            'Status': affiliate.status,
            'Notes': `Added from CLAUDE.md master documentation`
          }
        }
      );
      console.log(`   ✅ Added: ${affiliate.platform}`);
      await new Promise(resolve => setTimeout(resolve, 250)); // Rate limiting
    } catch (error) {
      console.error(`   ❌ Failed to add ${affiliate.platform}:`, error.message);
    }
  }
}

async function populateAppsAndSoftware() {
  console.log(`\n📝 Populating Apps & Software...`);

  const apps = [
    { name: 'OpenAI', category: 'AI/ML', cost: 150, autoTracking: '✅ Automated', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'Anthropic Claude', category: 'AI/ML', cost: 100, autoTracking: '✅ Automated', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'Airtable', category: 'Database', cost: 20, autoTracking: '✅ Automated', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'n8n', category: 'Automation', cost: 0, autoTracking: '✅ Automated', status: '✅ Active', account: 'Self-hosted' },
    { name: 'Vercel', category: 'Hosting', cost: 20, autoTracking: '🔄 Partial', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'Webflow', category: 'Hosting', cost: 42, autoTracking: '📝 Manual', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'RackNerd VPS', category: 'Hosting', cost: 10, autoTracking: '📝 Manual', status: '✅ Active', account: '173.254.201.134' },
    { name: 'Notion', category: 'Database', cost: 0, autoTracking: '✅ Automated', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'Apify', category: 'Automation', cost: 49, autoTracking: '🔄 Partial', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'Stripe', category: 'Development', cost: 0, autoTracking: '🔄 Partial', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'QuickBooks', category: 'Analytics', cost: 30, autoTracking: '📝 Manual', status: '✅ Active', account: 'shai@rensto.com' },
    { name: 'Hyperise', category: 'Marketing', cost: 99, autoTracking: '📝 Manual', status: '⚠️ Expiring Soon', account: 'shai@rensto.com' }
  ];

  for (const app of apps) {
    try {
      await airtableRequest(
        `/v0/${BASE_ID}/Apps%20%26%20Software`,
        'POST',
        {
          fields: {
            'App Name': app.name,
            'Category': app.category,
            'Monthly Cost': app.cost,
            'Auto-Tracking': app.autoTracking,
            'Status': app.status,
            'Account Email': app.account,
            'API Connected': app.autoTracking === '✅ Automated',
            'Notes': 'Added from CLAUDE.md - Update with actual usage data'
          }
        }
      );
      console.log(`   ✅ Added: ${app.name}`);
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`   ❌ Failed to add ${app.name}:`, error.message);
    }
  }
}

async function populateImplementationTracker() {
  console.log(`\n📝 Populating Implementation Tracker...`);

  const features = [
    { feature: 'Stripe Payment Flow - Marketplace Template', category: 'Payments', status: '❌ Not Implemented', priority: '🔥 Critical', days: 0.5, impact: '$10K-50K/month potential', doc: 'CLAUDE.md#critical-gaps' },
    { feature: 'Stripe Payment Flow - Marketplace Install', category: 'Payments', status: '❌ Not Implemented', priority: '🔥 Critical', days: 0.5, impact: '$10K-50K/month potential', doc: 'CLAUDE.md#critical-gaps' },
    { feature: 'Stripe Payment Flow - Ready Solutions', category: 'Payments', status: '❌ Not Implemented', priority: '🔥 Critical', days: 0.5, impact: '$10K-50K/month potential', doc: 'CLAUDE.md#critical-gaps' },
    { feature: 'Stripe Payment Flow - Subscriptions', category: 'Payments', status: '❌ Not Implemented', priority: '🔥 Critical', days: 0.5, impact: '$10K-50K/month potential', doc: 'CLAUDE.md#critical-gaps' },
    { feature: 'Stripe Payment Flow - Custom Solutions', category: 'Payments', status: '❌ Not Implemented', priority: '🔥 Critical', days: 0.5, impact: '$10K-50K/month potential', doc: 'CLAUDE.md#critical-gaps' },

    { feature: 'Define Subscription Type 2', category: 'Customer Onboarding', status: '❌ Not Implemented', priority: '⚠️ High', days: 1, impact: 'Complete business model', doc: 'CLAUDE.md#priority-2' },
    { feature: 'Define Subscription Type 3', category: 'Customer Onboarding', status: '❌ Not Implemented', priority: '⚠️ High', days: 1, impact: 'Complete business model', doc: 'CLAUDE.md#priority-2' },

    { feature: 'Typeform - Ready Solutions Quiz', category: 'Customer Onboarding', status: '❌ Not Implemented', priority: '⚠️ High', days: 0.5, impact: 'Customer qualification', doc: 'CLAUDE.md#priority-3' },
    { feature: 'Typeform - Subscriptions Sample Request', category: 'Customer Onboarding', status: '❌ Not Implemented', priority: '⚠️ High', days: 0.5, impact: 'Lead capture', doc: 'CLAUDE.md#priority-3' },
    { feature: 'Typeform - Marketplace Template Request', category: 'Customer Onboarding', status: '❌ Not Implemented', priority: '⚠️ High', days: 0.5, impact: 'Template interest tracking', doc: 'CLAUDE.md#priority-3' },
    { feature: 'Typeform - Custom Solutions Scorecard', category: 'Customer Onboarding', status: '❌ Not Implemented', priority: '⚠️ High', days: 0.5, impact: 'Project scoping', doc: 'CLAUDE.md#priority-3' },

    { feature: 'Admin Dashboard Redesign', category: 'Admin Tools', status: '⚠️ Partially Built', priority: '⚠️ High', days: 5, impact: 'Business visibility & control', doc: 'CLAUDE.md#priority-4' },

    { feature: 'INT-SYNC-001: n8n → Airtable', category: 'Data Sync', status: '📝 Documented Only', priority: '⚠️ High', days: 2, impact: 'Automated reporting', doc: 'DATA_ARCHITECTURE_STRATEGY.md' },
    { feature: 'INT-SYNC-002: n8n → Notion', category: 'Data Sync', status: '📝 Documented Only', priority: '📊 Medium', days: 2, impact: 'Documentation sync', doc: 'DATA_ARCHITECTURE_STRATEGY.md' },
    { feature: 'INT-SYNC-003: Airtable → n8n', category: 'Data Sync', status: '📝 Documented Only', priority: '📊 Medium', days: 2, impact: 'Manual edit sync', doc: 'DATA_ARCHITECTURE_STRATEGY.md' },
    { feature: 'Update INT-TECH-005 Automation', category: 'Data Sync', status: '⚠️ Partially Built', priority: '⚠️ High', days: 0.5, impact: 'Notion-Airtable sync', doc: 'COMPLETE_SYNC_ARCHITECTURE_FINAL.md' },

    { feature: 'Stripe → QuickBooks Integration', category: 'Integrations', status: '❌ Not Implemented', priority: '📊 Medium', days: 3, impact: 'Automated accounting', doc: 'CLAUDE.md#priority-6' },
    { feature: 'QuickBooks → Airtable Sync', category: 'Integrations', status: '❌ Not Implemented', priority: '📊 Medium', days: 2, impact: 'Financial dashboard', doc: 'CLAUDE.md#priority-6' },

    { feature: 'Voice AI Consultation System', category: 'Customer Onboarding', status: '📝 Documented Only', priority: '📊 Medium', days: 4, impact: 'Custom Solutions onboarding', doc: 'CLAUDE.md#priority-7' },
    { feature: 'eSignatures System', category: 'Customer Onboarding', status: '📝 Documented Only', priority: '📊 Medium', days: 3, impact: 'Legal compliance', doc: 'CLAUDE.md#priority-7' },

    { feature: 'Airtable Cleanup (53 empty tables)', category: 'Data Sync', status: '🔄 In Progress', priority: '📝 Low', days: 1, impact: 'Reduced clutter', doc: 'AIRTABLE_COMPREHENSIVE_CLEANUP_PLAN.md' },
    { feature: 'Mobile Testing Suite', category: 'Other', status: '❌ Not Implemented', priority: '⚠️ High', days: 3, impact: 'User experience', doc: 'CLAUDE.md#mobile--testing' },
    { feature: 'Hyperise Replacement Deployment', category: 'Integrations', status: '⚠️ Partially Built', priority: '📊 Medium', days: 1, impact: '$50-200/month savings', doc: 'CLAUDE.md#implementation-status' }
  ];

  for (const feature of features) {
    try {
      await airtableRequest(
        `/v0/${BASE_ID}/Implementation%20Tracker`,
        'POST',
        {
          fields: {
            'Feature': feature.feature,
            'Category': feature.category,
            'Status': feature.status,
            'Priority': feature.priority,
            'Est. Days': feature.days,
            'Revenue Impact': feature.impact,
            'Documentation Link': `file:///Users/shaifriedman/New Rensto/rensto/${feature.doc}`,
            'Assigned To': 'Shai Friedman',
            'Notes': 'Imported from CLAUDE.md master documentation'
          }
        }
      );
      console.log(`   ✅ Added: ${feature.feature}`);
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`   ❌ Failed to add ${feature.feature}:`, error.message);
    }
  }
}

async function run() {
  console.log('🚀 MASTER TRACKING SYSTEM SETUP');
  console.log('================================\n');
  console.log('Creating comprehensive tracking tables in Airtable...');
  console.log(`Base: Operations & Automation (${BASE_ID})\n`);

  try {
    // Create tables
    await createAffiliateLinksTable();
    await createAppsAndSoftwareTable();
    await createCustomerJourneyTable();
    await createImplementationTrackerTable();

    console.log('\n⏳ Waiting 5 seconds for tables to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Populate data
    await populateAffiliateLinks();
    await populateAppsAndSoftware();
    await populateImplementationTracker();

    console.log('\n' + '='.repeat(80));
    console.log('✅ MASTER TRACKING SYSTEM SETUP COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📊 Tables Created:');
    console.log('   1. Affiliate Links (7 records)');
    console.log('   2. Apps & Software (12 records)');
    console.log('   3. Customer Journey (empty - populate as customers onboard)');
    console.log('   4. Implementation Tracker (25+ features tracked)');
    console.log('\n🔗 View in Airtable:');
    console.log(`   https://airtable.com/${BASE_ID}`);
    console.log('\n📋 Next Steps:');
    console.log('   1. Review Implementation Tracker for priorities');
    console.log('   2. Update Apps & Software with actual usage data');
    console.log('   3. Track affiliate link performance monthly');
    console.log('   4. Add customers to Customer Journey as they onboard');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  }
}

run().catch(console.error);
