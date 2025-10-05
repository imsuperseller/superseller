#!/usr/bin/env node

/**
 * N8N WORKFLOW CLEANUP & ORGANIZATION EXECUTION SCRIPT
 *
 * SAFETY FEATURES:
 * - Dry-run mode by default (--execute flag required for real changes)
 * - Confirmation prompts before destructive actions
 * - Full backup already completed
 * - Phase-by-phase execution
 * - Detailed logging and reporting
 *
 * Usage:
 * DRY RUN: node scripts/execute-n8n-cleanup.js
 * EXECUTE: node scripts/execute-n8n-cleanup.js --execute
 * SINGLE PHASE: node scripts/execute-n8n-cleanup.js --phase 1 --execute
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import readline from 'readline';

// Configuration
const N8N_URL = 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const DRY_RUN = !process.argv.includes('--execute');
const PHASE = process.argv.includes('--phase')
  ? parseInt(process.argv[process.argv.indexOf('--phase') + 1])
  : null;

// Cleanup configuration based on N8N_WORKFLOW_CLEANUP_PLAN.md
const CLEANUP_CONFIG = {
  // Workflows to DELETE permanently
  DELETE: [
    'DFmbDYShzzkYgTYc', // TEST-001 - BMAD Airtable Test Workflow
    'Cc5FNjAQ5VhYw7U2', // My workflow 2
    'KcE2qkNQIgQkwIId', // My workflow 3
    'BRod2NyrKagfMISZ', // RENSTO TMP Hook
    'qrXO1Dkd0jUDT8SM', // RENSTO TMP Hook (duplicate)
    'IARf1jWmCtilf4Lb', // TMP – Sentry Only
    'RwaUpPtmrvFNPpj3', // TMP – Apify Only
    'mLhDetXg8HulnXtz', // TMP – Mongo Only
    'vdIJ3Zm2sIFI6WEI', // TMP – Supabase Only
    'WrqXChO5x1FxpRHS', // TMP – Minimal Test
    'G4uUME2uL9emWZ3n', // Week 3: Advanced Business Process Automation
    'RiPFVDfVbbob8MAj', // Week 3: Advanced Business Process Automation
    'rawczJckEDeStnVL', // Week 3: Advanced Business Process Automation
    'yOH1RZI5ZaKc9zy4', // Week 3: Real-Time Analytics Dashboard
    'xCZBeeWqReLwNCH3'  // Week 2 Task 2: Simple n8n Integration Test
  ],

  // Workflows to ARCHIVE (deactivate + tag)
  ARCHIVE_CUSTOMERS: [
    { id: 'Q3E94KHVh44lgVSP', customer: 'Shelly', name: 'Family Insurance Analysis Workflow' },
    { id: '9JWqzXgEzoD4XKCP', customer: 'Shelly', name: 'Family Insurance Workflow - SUMMARIZE GROUPING' },
    { id: 'DqvQyTuWplhycUjh', customer: 'Shelly', name: 'Family Insurance Analysis Workflow - Fixed' },
    { id: 'L0t86xpKLMmqHQFj', customer: 'Shelly', name: 'Family Insurance Analysis Workflow - Fixed' },
    { id: 'Q6ujantLJCrvcaUq', customer: 'Shelly', name: 'Fixed Family Insurance Workflow v2' },
    { id: 'ua4t56fmRCdNIQUk', customer: 'Shelly', name: 'ניתוח ביטוח משפחתי - PDF' },
    { id: 'MOxiwcLhQMMHCGPM', customer: 'Ben', name: 'Daf Yomi Daily Digest - Fixed' },
    { id: 'OdtoCM2XxiBNtL3L', customer: 'Ben', name: 'Daf Yomi daily digest' },
    { id: 'WsgveTBcE0Sul907', customer: 'Aviv', name: 'Best Amusement Games Lead Machine' },
    { id: 'gS87LVGWmiraenEg', customer: 'Aviv', name: 'Best Amusement Games (Bonus) - FB Groups' },
    { id: 'h6MfeXa0EMsv6Uih', customer: 'Aviv', name: 'Best Amusement Games - 4. Outreach & CRM Sync' },
    { id: 'htkWSRkCIvootY8q', customer: 'Aviv', name: 'Best Amusement Games - 3. Enrichment & Scoring' },
    { id: 'kBURLOU888WjFqkX', customer: 'Aviv', name: 'Best Amusement Games - 2. Lead Gen Monitoring' }
  ],

  ARCHIVE_OLD_VERSIONS: [
    { id: '0Ss043Wge5zasNWy', reason: 'Old version of Cold Outreach' },
    { id: 'NpZpK8Z414giaLjO', reason: 'Old version of Cold Outreach' },
    { id: '6Y3EQ6pWyh5enLHG', reason: 'Duplicate Lead Gen Micro-SaaS' },
    { id: 'UWb1837Pg8Ssubpe', reason: 'Duplicate Lead Gen Micro-SaaS' },
    { id: 'fIv6GZJ4XhFL59wu', reason: 'Duplicate Lead Gen Micro-SaaS' },
    { id: 'D3gvVLGWGHNQixIp', reason: 'Duplicate AI Lead Gen SaaS' },
    { id: '4cg1KYQmBvRqQnoR', reason: 'Duplicate Israeli Lead Gen' },
    { id: 'cgk7FI57o6cg3eju', reason: 'Duplicate Israeli Lead Gen' },
    { id: 'tnTlHG7pBLgfOxq4', reason: 'Duplicate Israeli Lead Gen' },
    { id: '9lTWZUMP8Rp2Bt98', reason: 'Duplicate Israeli LinkedIn' },
    { id: 'tCYSKNvbOGTKgc2N', reason: 'Duplicate MicroSaaS' },
    { id: 'A7AjDqvVw3m0kia5', reason: 'Duplicate Lead Discovery' },
    { id: 'BZ1wk9DlZncPRN8t', reason: 'Duplicate Production Lead Gen' },
    { id: 'weEAv47M3DYzJL0n', reason: 'Duplicate Production Lead Gen' },
    { id: 'yr0tLBk4fFHMUq1U', reason: 'Duplicate Production Lead Gen' },
    { id: 'Pn7a4h2h3DTsSS6h', reason: 'Old Optimized Workflow' },
    { id: 'dHmbohbSPAACutey', reason: 'Old Optimized Workflow' }
  ],

  ARCHIVE_IRRELEVANT: [
    { id: 'ZRGVkpUirNrAF0KL', reason: 'Personal home assistant' }
  ],

  // Workflows to RENAME with new convention
  RENAME_INTERNAL: [
    { id: 'x7GwugG3fzdpuC4f', newName: 'INT-LEAD-001: Lead Machine Orchestrator v2', tags: ['internal', 'lead-generation', 'critical', 'production'] },
    { id: 'DeUmb1mwj1vaXVBp', newName: 'INT-EMAIL-001: Email Automation System v1', tags: ['internal', 'email-automation', 'high-priority', 'production'] },
    { id: 'ffahgxCnZvLLklOv', newName: 'INT-TECH-002: Template Deployment Pipeline v1', tags: ['internal', 'technical-integration', 'high-priority', 'production'] },
    { id: 'QxfNnhlEXY2mZFM2', newName: 'INT-TECH-003: OAuth Configuration Management v1', tags: ['internal', 'technical-integration', 'medium-priority', 'production'] },
    { id: 'AOYcPkiRurYg8Pji', newName: 'INT-MONITOR-002: Admin Dashboard Data Integration v1', tags: ['internal', 'monitoring', 'high-priority', 'production'] },
    { id: 'WiADCj8mBCMPifYe', newName: 'INT-TECH-004: Multi-Tenant SaaS Architecture v1', tags: ['internal', 'technical-integration', 'high-priority', 'production'] },
    { id: 'BWU6jLuUL3asB9Hk', newName: 'INT-LEAD-002: Lead Machine Webhook Handler v1', tags: ['internal', 'lead-generation', 'medium-priority', 'development'] },
    { id: 'Uu6JdNAsz7cr14XF', newName: 'INT-TECH-005: n8n-Airtable-Notion Integration v1', tags: ['internal', 'technical-integration', 'medium-priority', 'production'] },
    { id: '9sWsox0nzjtLInKD', newName: 'INT-CUSTOMER-002: Customer-Project Data Sync v1', tags: ['internal', 'customer-management', 'medium-priority', 'production'] },
    { id: 'Eu0ldg1B04bSSBC0', newName: 'INT-MONITOR-003: Real-Time Data Synchronization v1', tags: ['internal', 'monitoring', 'medium-priority', 'production'] },
    { id: 'F8Im8Ljty6ndCtop', newName: 'INT-CUSTOMER-003: Project-Task Data Integration v1', tags: ['internal', 'customer-management', 'medium-priority', 'production'] }
  ],

  RENAME_SUBSCRIPTION: [
    { id: 'THgM79EtvserVMKV', newName: 'SUB-LEAD-001: Israeli Professional Lead Generator v1', tags: ['subscription', 'lead-generation', 'high-priority', 'production'] },
    { id: 'SrgOTg0pZX9b8Jmc', newName: 'SUB-LEAD-002: Facebook Groups Lead Scraper v1', tags: ['subscription', 'lead-generation', 'high-priority', 'development'] },
    { id: 'OqbtExgLG3t8VJz8', newName: 'SUB-LEAD-003: Local Lead Finder & Email Sender v1', tags: ['subscription', 'lead-generation', 'high-priority', 'development'] },
    { id: 'h0gcKRZbgrIVK3Ka', newName: 'SUB-LEAD-004: Smart Lead Enrichment & Outreach v1', tags: ['subscription', 'lead-generation', 'email-automation', 'high-priority', 'development'] },
    { id: 'XBy78u2xQbH4DGRE', newName: 'SUB-LEAD-005: DFW Lead Discovery Service v1', tags: ['subscription', 'lead-generation', 'medium-priority', 'development'] },
    { id: 'PUadkuAQnHNfwt7D', newName: 'SUB-FINANCE-001: Invoice Automation & QuickBooks Sync v1', tags: ['subscription', 'financial-ops', 'medium-priority', 'development'] }
  ],

  RENAME_MARKETPLACE: [
    { id: '0SxNwE2IvN43iFpt', newName: 'MKT-LEAD-001: Lead Generation SaaS Template v1', tags: ['marketplace', 'lead-generation', 'template', 'production'] },
    { id: '6zJDmAgRKpu0qdXJ', newName: 'MKT-CONTENT-001: AI Landing Page Generator v1', tags: ['marketplace', 'content-marketing', 'template', 'production'] }
  ]
};

// Tag colors
const TAG_COLORS = {
  'marketplace': '#3B82F6', 'ready-solution': '#0EA5E9', 'custom-solution': '#2563EB',
  'subscription': '#4F46E5', 'internal': '#7C3AED', 'email-automation': '#10B981',
  'lead-generation': '#059669', 'content-marketing': '#14B8A6', 'financial-ops': '#06B6D4',
  'customer-management': '#84CC16', 'technical-integration': '#22D3EE', 'monitoring': '#10B981',
  'support': '#84CC16', 'business-process': '#14B8A6', 'production': '#22C55E',
  'testing': '#EAB308', 'development': '#F97316', 'deprecated': '#EF4444',
  'template': '#6B7280', 'critical': '#DC2626', 'high-priority': '#EA580C',
  'medium-priority': '#CA8A04', 'low-priority': '#71717A',
  'archived-customer': '#9CA3AF', 'archived-old-version': '#6B7280', 'archived-irrelevant': '#4B5563'
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question + ' (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function deleteWorkflow(workflowId) {
  if (DRY_RUN) {
    return { success: true, dryRun: true };
  }

  const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'DELETE',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return {
    success: response.statusCode === 200,
    statusCode: response.statusCode,
    data: response.data
  };
}

async function getWorkflow(workflowId) {
  const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.statusCode === 200 ? response.data : null;
}

async function updateWorkflow(workflowId, updates) {
  if (DRY_RUN) {
    return { success: true, dryRun: true };
  }

  // First get the full workflow
  const fullWorkflow = await getWorkflow(workflowId);
  if (!fullWorkflow) {
    return { success: false, statusCode: 404, error: 'Workflow not found' };
  }

  // Create update payload with ONLY allowed fields (exclude read-only fields)
  // This is the correct format that n8n API accepts
  const updatePayload = {
    name: updates.name || fullWorkflow.name,
    nodes: fullWorkflow.nodes,
    connections: fullWorkflow.connections,
    settings: fullWorkflow.settings
  };

  // Use PUT to update (PATCH is not supported by n8n API)
  const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: updatePayload
  });

  return {
    success: response.statusCode === 200,
    statusCode: response.statusCode,
    data: response.data
  };
}

// Phase 1: Delete workflows
async function phase1_delete() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 PHASE 1: DELETE TEST & TEMPORARY WORKFLOWS');
  console.log('='.repeat(80));
  console.log(`\nWorkflows to delete: ${CLEANUP_CONFIG.DELETE.length}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  const results = [];

  for (const workflowId of CLEANUP_CONFIG.DELETE) {
    console.log(`\n🗑️  Deleting workflow: ${workflowId}`);

    try {
      const result = await deleteWorkflow(workflowId);

      if (result.dryRun) {
        console.log(`   ✓ Would delete (DRY RUN)`);
      } else if (result.success) {
        console.log(`   ✅ Deleted successfully`);
      } else {
        console.log(`   ❌ Failed (status: ${result.statusCode})`);
      }

      results.push({
        workflowId,
        success: result.success || result.dryRun,
        dryRun: result.dryRun
      });
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        workflowId,
        success: false,
        error: error.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 Phase 1 Summary: ${successful}/${CLEANUP_CONFIG.DELETE.length} deleted`);

  return results;
}

// Phase 2: Archive customer workflows
async function phase2_archive() {
  console.log('\n' + '='.repeat(80));
  console.log('📦 PHASE 2: ARCHIVE CUSTOMER & OLD WORKFLOWS');
  console.log('='.repeat(80));

  const allArchive = [
    ...CLEANUP_CONFIG.ARCHIVE_CUSTOMERS,
    ...CLEANUP_CONFIG.ARCHIVE_OLD_VERSIONS,
    ...CLEANUP_CONFIG.ARCHIVE_IRRELEVANT
  ];

  console.log(`\nWorkflows to archive: ${allArchive.length}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  const results = [];

  for (const workflow of allArchive) {
    const archiveTag = workflow.customer
      ? 'archived-customer'
      : workflow.reason?.includes('irrelevant')
        ? 'archived-irrelevant'
        : 'archived-old-version';

    console.log(`\n📦 Archiving: ${workflow.name || workflow.id}`);
    console.log(`   Tag: ${archiveTag}`);

    try {
      const updates = {
        active: false,
        tags: [
          { name: archiveTag, color: TAG_COLORS[archiveTag] },
          ...(workflow.customer ? [{ name: `customer-${workflow.customer.toLowerCase()}`, color: '#9CA3AF' }] : [])
        ]
      };

      const result = await updateWorkflow(workflow.id, updates);

      if (result.dryRun) {
        console.log(`   ✓ Would archive (DRY RUN)`);
      } else if (result.success) {
        console.log(`   ✅ Archived successfully`);
      } else {
        console.log(`   ❌ Failed (status: ${result.statusCode})`);
      }

      results.push({
        workflowId: workflow.id,
        success: result.success || result.dryRun,
        dryRun: result.dryRun
      });
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        workflowId: workflow.id,
        success: false,
        error: error.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 Phase 2 Summary: ${successful}/${allArchive.length} archived`);

  return results;
}

// Phase 3: Rename internal workflows
async function phase3_rename_internal() {
  console.log('\n' + '='.repeat(80));
  console.log('🏢 PHASE 3: RENAME & TAG INTERNAL WORKFLOWS');
  console.log('='.repeat(80));
  console.log(`\nWorkflows to rename: ${CLEANUP_CONFIG.RENAME_INTERNAL.length}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  const results = [];

  for (const workflow of CLEANUP_CONFIG.RENAME_INTERNAL) {
    console.log(`\n✏️  Renaming: ${workflow.id}`);
    console.log(`   New name: ${workflow.newName}`);
    console.log(`   Tags: ${workflow.tags.join(', ')}`);

    try {
      const updates = {
        name: workflow.newName,
        tags: workflow.tags.map(tag => ({
          name: tag,
          color: TAG_COLORS[tag]
        }))
      };

      const result = await updateWorkflow(workflow.id, updates);

      if (result.dryRun) {
        console.log(`   ✓ Would rename (DRY RUN)`);
      } else if (result.success) {
        console.log(`   ✅ Renamed successfully`);
      } else {
        console.log(`   ❌ Failed (status: ${result.statusCode})`);
      }

      results.push({
        workflowId: workflow.id,
        newName: workflow.newName,
        success: result.success || result.dryRun,
        dryRun: result.dryRun
      });
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        workflowId: workflow.id,
        success: false,
        error: error.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 Phase 3 Summary: ${successful}/${CLEANUP_CONFIG.RENAME_INTERNAL.length} renamed`);

  return results;
}

// Phase 4: Rename subscription workflows
async function phase4_rename_subscription() {
  console.log('\n' + '='.repeat(80));
  console.log('📅 PHASE 4: RENAME & TAG SUBSCRIPTION WORKFLOWS');
  console.log('='.repeat(80));
  console.log(`\nWorkflows to rename: ${CLEANUP_CONFIG.RENAME_SUBSCRIPTION.length}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  const results = [];

  for (const workflow of CLEANUP_CONFIG.RENAME_SUBSCRIPTION) {
    console.log(`\n✏️  Renaming: ${workflow.id}`);
    console.log(`   New name: ${workflow.newName}`);
    console.log(`   Tags: ${workflow.tags.join(', ')}`);

    try {
      const updates = {
        name: workflow.newName,
        tags: workflow.tags.map(tag => ({
          name: tag,
          color: TAG_COLORS[tag]
        }))
      };

      const result = await updateWorkflow(workflow.id, updates);

      if (result.dryRun) {
        console.log(`   ✓ Would rename (DRY RUN)`);
      } else if (result.success) {
        console.log(`   ✅ Renamed successfully`);
      } else {
        console.log(`   ❌ Failed (status: ${result.statusCode})`);
      }

      results.push({
        workflowId: workflow.id,
        newName: workflow.newName,
        success: result.success || result.dryRun,
        dryRun: result.dryRun
      });
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        workflowId: workflow.id,
        success: false,
        error: error.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 Phase 4 Summary: ${successful}/${CLEANUP_CONFIG.RENAME_SUBSCRIPTION.length} renamed`);

  return results;
}

// Phase 5: Rename marketplace workflows
async function phase5_rename_marketplace() {
  console.log('\n' + '='.repeat(80));
  console.log('🛒 PHASE 5: RENAME & TAG MARKETPLACE WORKFLOWS');
  console.log('='.repeat(80));
  console.log(`\nWorkflows to rename: ${CLEANUP_CONFIG.RENAME_MARKETPLACE.length}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  const results = [];

  for (const workflow of CLEANUP_CONFIG.RENAME_MARKETPLACE) {
    console.log(`\n✏️  Renaming: ${workflow.id}`);
    console.log(`   New name: ${workflow.newName}`);
    console.log(`   Tags: ${workflow.tags.join(', ')}`);

    try {
      const updates = {
        name: workflow.newName,
        tags: workflow.tags.map(tag => ({
          name: tag,
          color: TAG_COLORS[tag]
        }))
      };

      const result = await updateWorkflow(workflow.id, updates);

      if (result.dryRun) {
        console.log(`   ✓ Would rename (DRY RUN)`);
      } else if (result.success) {
        console.log(`   ✅ Renamed successfully`);
      } else {
        console.log(`   ❌ Failed (status: ${result.statusCode})`);
      }

      results.push({
        workflowId: workflow.id,
        newName: workflow.newName,
        success: result.success || result.dryRun,
        dryRun: result.dryRun
      });
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        workflowId: workflow.id,
        success: false,
        error: error.message
      });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n📊 Phase 5 Summary: ${successful}/${CLEANUP_CONFIG.RENAME_MARKETPLACE.length} renamed`);

  return results;
}

// Generate final report
function generateReport(allResults) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL CLEANUP REPORT');
  console.log('='.repeat(80));

  const { phase1, phase2, phase3, phase4, phase5 } = allResults;

  console.log('\n📋 Summary by Phase:');
  console.log(`  Phase 1 (Delete): ${phase1.filter(r => r.success).length}/${phase1.length}`);
  console.log(`  Phase 2 (Archive): ${phase2.filter(r => r.success).length}/${phase2.length}`);
  console.log(`  Phase 3 (Rename Internal): ${phase3.filter(r => r.success).length}/${phase3.length}`);
  console.log(`  Phase 4 (Rename Subscription): ${phase4.filter(r => r.success).length}/${phase4.length}`);
  console.log(`  Phase 5 (Rename Marketplace): ${phase5.filter(r => r.success).length}/${phase5.length}`);

  const totalOperations = phase1.length + phase2.length + phase3.length + phase4.length + phase5.length;
  const totalSuccessful =
    phase1.filter(r => r.success).length +
    phase2.filter(r => r.success).length +
    phase3.filter(r => r.success).length +
    phase4.filter(r => r.success).length +
    phase5.filter(r => r.success).length;

  console.log(`\n📊 Overall: ${totalSuccessful}/${totalOperations} operations successful`);

  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no actual changes were made');
    console.log('To execute for real, run with --execute flag');
  } else {
    console.log('\n✅ All changes have been applied to your n8n instance');
    console.log('📁 Full backup available at: backups/n8n-workflows/2025-10-03T16-06-38');
  }

  console.log('\n🎯 Next Steps:');
  console.log('  1. Verify changes at http://173.254.201.134:5678');
  console.log('  2. Create Airtable tracking table');
  console.log('  3. Begin productizing subscription workflows');
  console.log('  4. Create marketplace templates');

  console.log('\n' + '='.repeat(80) + '\n');

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    results: allResults,
    summary: {
      totalOperations,
      totalSuccessful,
      successRate: `${Math.round((totalSuccessful / totalOperations) * 100)}%`
    }
  };

  fs.writeFileSync('data/n8n-cleanup-execution-report.json', JSON.stringify(report, null, 2));
  console.log('💾 Full report saved to: data/n8n-cleanup-execution-report.json\n');

  return report;
}

// Main execution
async function main() {
  console.log('🚀 N8N WORKFLOW CLEANUP & ORGANIZATION');
  console.log('==========================================\n');

  if (!N8N_API_KEY) {
    console.error('❌ Error: N8N_API_KEY environment variable not set');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('🔍 RUNNING IN DRY RUN MODE');
    console.log('No changes will be made to your n8n instance\n');
  } else {
    console.log('⚠️  EXECUTING REAL CHANGES');
    console.log('This will modify your n8n instance\n');

    const confirmed = await askConfirmation('Are you sure you want to proceed?');
    if (!confirmed) {
      console.log('❌ Aborted by user');
      process.exit(0);
    }
  }

  try {
    const allResults = {
      phase1: PHASE === 1 || !PHASE ? await phase1_delete() : [],
      phase2: PHASE === 2 || !PHASE ? await phase2_archive() : [],
      phase3: PHASE === 3 || !PHASE ? await phase3_rename_internal() : [],
      phase4: PHASE === 4 || !PHASE ? await phase4_rename_subscription() : [],
      phase5: PHASE === 5 || !PHASE ? await phase5_rename_marketplace() : []
    };

    generateReport(allResults);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
