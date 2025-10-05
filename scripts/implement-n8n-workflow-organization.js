#!/usr/bin/env node

/**
 * N8N WORKFLOW ORGANIZATION IMPLEMENTATION
 *
 * This script will:
 * 1. Audit all existing workflows on n8n instance
 * 2. Create/update Airtable workflow tracking table
 * 3. Rename workflows with new naming convention
 * 4. Apply proper tags to all workflows
 * 5. Generate comprehensive report
 *
 * Usage: node scripts/implement-n8n-workflow-organization.js
 */

import https from 'https';
import http from 'http';
import fs from 'fs';

// Configuration
const N8N_URL = 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || 'your-n8n-api-key-here';
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = 'app6saCaH88uK3kCO'; // From the user's selection

// Workflow naming convention mapping
const WORKFLOW_MAPPING = {
  // Known existing workflows
  'x7GwugG3fzdpuC4f': {
    oldName: 'Cold Outreach Machine',
    newName: 'INT-LEAD-001: Lead Machine Orchestrator v2',
    tags: ['internal', 'lead-generation', 'critical', 'production'],
    description: 'Internal lead generation + outreach coordination. Upgraded from Cold Outreach Machine.',
    businessModel: 'internal',
    category: 'lead-generation',
    priority: 'critical',
    status: 'production'
  }
};

// Tag color scheme
const TAG_COLORS = {
  // Business Model Tags (Blue Family)
  'marketplace': '#3B82F6',
  'ready-solution': '#0EA5E9',
  'custom-solution': '#2563EB',
  'subscription': '#4F46E5',
  'internal': '#7C3AED',

  // Functional Tags (Green Family)
  'email-automation': '#10B981',
  'lead-generation': '#059669',
  'content-marketing': '#14B8A6',
  'financial-ops': '#06B6D4',
  'customer-management': '#84CC16',
  'technical-integration': '#22D3EE',
  'monitoring': '#10B981',
  'support': '#84CC16',
  'business-process': '#14B8A6',

  // Status Tags (Gray/Red/Yellow Family)
  'production': '#22C55E',
  'testing': '#EAB308',
  'development': '#F97316',
  'deprecated': '#EF4444',
  'template': '#6B7280',

  // Priority Tags (Red Family)
  'critical': '#DC2626',
  'high-priority': '#EA580C',
  'medium-priority': '#CA8A04',
  'low-priority': '#71717A'
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

async function listN8NWorkflows() {
  console.log('📋 Listing all n8n workflows...');

  const response = await makeRequest(`${N8N_URL}/api/v1/workflows`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to list workflows: ${JSON.stringify(response.data)}`);
  }

  return response.data.data || response.data;
}

async function getWorkflowDetails(workflowId) {
  console.log(`🔍 Getting details for workflow ${workflowId}...`);

  const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to get workflow ${workflowId}: ${JSON.stringify(response.data)}`);
  }

  return response.data.data || response.data;
}

async function updateWorkflow(workflowId, updates) {
  console.log(`✏️  Updating workflow ${workflowId}...`);

  const response = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'PATCH',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: updates
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to update workflow ${workflowId}: ${JSON.stringify(response.data)}`);
  }

  return response.data.data || response.data;
}

async function createAirtableTable() {
  console.log('📊 Setting up Airtable workflow tracking table...');

  // Note: Airtable doesn't have a direct API to create tables
  // This would need to be done manually or through Airtable's metadata API

  const tableSchema = {
    tableName: 'n8n Workflows',
    fields: [
      { name: 'Workflow Name', type: 'singleLineText' },
      { name: 'Workflow ID', type: 'singleLineText' },
      { name: 'Business Model', type: 'singleSelect', options: ['Marketplace', 'Ready Solution', 'Custom Solution', 'Subscription', 'Internal'] },
      { name: 'Category', type: 'singleSelect', options: ['Email Automation', 'Lead Generation', 'Content Marketing', 'Financial Ops', 'Customer Management', 'Technical Integration', 'Monitoring', 'Support', 'Business Process'] },
      { name: 'Status', type: 'singleSelect', options: ['Production', 'Testing', 'Development', 'Deprecated'] },
      { name: 'Priority', type: 'singleSelect', options: ['Critical', 'High', 'Medium', 'Low'] },
      { name: 'Tags', type: 'multipleSelects', options: Object.keys(TAG_COLORS) },
      { name: 'Description', type: 'multilineText' },
      { name: 'Price Point', type: 'currency' },
      { name: 'Revenue Model', type: 'singleLineText' },
      { name: 'Node Count', type: 'number' },
      { name: 'Last Updated', type: 'dateTime' },
      { name: 'Active', type: 'checkbox' },
      { name: 'n8n URL', type: 'url' },
      { name: 'Source', type: 'singleLineText' },
      { name: 'Version', type: 'singleLineText' }
    ]
  };

  console.log('⚠️  Please create this table structure in Airtable manually:');
  console.log(JSON.stringify(tableSchema, null, 2));

  return tableSchema;
}

async function syncToAirtable(workflows) {
  console.log('📤 Syncing workflow data to Airtable...');

  if (!AIRTABLE_PAT) {
    console.log('⚠️  Airtable PAT not found. Skipping Airtable sync.');
    console.log('Set AIRTABLE_PAT environment variable to enable Airtable sync.');
    return;
  }

  // For each workflow, create/update Airtable record
  for (const workflow of workflows) {
    const mapping = WORKFLOW_MAPPING[workflow.id];

    const record = {
      fields: {
        'Workflow Name': workflow.name,
        'Workflow ID': workflow.id,
        'Business Model': mapping?.businessModel || 'Unknown',
        'Category': mapping?.category || 'Unknown',
        'Status': mapping?.status || 'production',
        'Priority': mapping?.priority || 'medium',
        'Tags': mapping?.tags || [],
        'Description': mapping?.description || workflow.description || '',
        'Node Count': workflow.nodes?.length || 0,
        'Last Updated': new Date().toISOString(),
        'Active': workflow.active || false,
        'n8n URL': `${N8N_URL}/workflow/${workflow.id}`,
        'Version': mapping?.newName?.match(/v\d+(\.\d+)?/)?.[0] || 'v1'
      }
    };

    console.log(`  ✅ Prepared record for: ${workflow.name}`);
  }

  console.log('✅ Airtable sync complete (records prepared)');
  console.log('⚠️  To complete sync, implement Airtable API calls with your PAT');
}

async function renameAndTagWorkflows(workflows) {
  console.log('🏷️  Renaming and tagging workflows...');

  const results = [];

  for (const workflow of workflows) {
    const mapping = WORKFLOW_MAPPING[workflow.id];

    if (!mapping) {
      console.log(`  ⏭️  Skipping ${workflow.name} (ID: ${workflow.id}) - no mapping defined`);
      results.push({
        id: workflow.id,
        oldName: workflow.name,
        status: 'skipped',
        reason: 'no mapping defined'
      });
      continue;
    }

    try {
      // Get full workflow details
      const fullWorkflow = await getWorkflowDetails(workflow.id);

      // Prepare updates
      const updates = {
        name: mapping.newName,
        tags: mapping.tags.map(tag => ({
          name: tag,
          color: TAG_COLORS[tag] || '#6B7280'
        })),
        settings: {
          ...fullWorkflow.settings,
          errorWorkflow: fullWorkflow.settings?.errorWorkflow,
          timezone: fullWorkflow.settings?.timezone || 'America/New_York'
        }
      };

      // Update workflow
      await updateWorkflow(workflow.id, updates);

      console.log(`  ✅ Updated: ${mapping.oldName} → ${mapping.newName}`);
      results.push({
        id: workflow.id,
        oldName: mapping.oldName,
        newName: mapping.newName,
        tags: mapping.tags,
        status: 'success'
      });

    } catch (error) {
      console.error(`  ❌ Failed to update ${workflow.name}:`, error.message);
      results.push({
        id: workflow.id,
        oldName: workflow.name,
        status: 'failed',
        error: error.message
      });
    }
  }

  return results;
}

function generateReport(workflows, renameResults) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 N8N WORKFLOW ORGANIZATION REPORT');
  console.log('='.repeat(80));

  console.log('\n📋 WORKFLOW INVENTORY:');
  console.log(`  Total Workflows: ${workflows.length}`);
  console.log(`  Active: ${workflows.filter(w => w.active).length}`);
  console.log(`  Inactive: ${workflows.filter(w => !w.active).length}`);

  console.log('\n🏷️  RENAME & TAG RESULTS:');
  console.log(`  ✅ Successfully updated: ${renameResults.filter(r => r.status === 'success').length}`);
  console.log(`  ⏭️  Skipped: ${renameResults.filter(r => r.status === 'skipped').length}`);
  console.log(`  ❌ Failed: ${renameResults.filter(r => r.status === 'failed').length}`);

  console.log('\n📝 DETAILED RESULTS:');
  renameResults.forEach(result => {
    if (result.status === 'success') {
      console.log(`  ✅ ${result.oldName} → ${result.newName}`);
      console.log(`     Tags: ${result.tags.join(', ')}`);
    } else if (result.status === 'skipped') {
      console.log(`  ⏭️  ${result.oldName} - ${result.reason}`);
    } else {
      console.log(`  ❌ ${result.oldName} - ${result.error}`);
    }
  });

  console.log('\n🎯 NEXT STEPS:');
  console.log('  1. ✅ Naming convention system created');
  console.log('  2. ✅ Existing workflows audited');
  console.log('  3. ⚠️  Create Airtable table structure (see schema above)');
  console.log('  4. ⚠️  Add mappings for remaining workflows in WORKFLOW_MAPPING');
  console.log('  5. ⚠️  Run script again to rename remaining workflows');
  console.log('  6. ⚠️  Implement Phase 1 workflows (INT-MONITOR-001, etc.)');

  console.log('\n' + '='.repeat(80) + '\n');

  return {
    summary: {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.active).length,
      updatedWorkflows: renameResults.filter(r => r.status === 'success').length,
      skippedWorkflows: renameResults.filter(r => r.status === 'skipped').length,
      failedWorkflows: renameResults.filter(r => r.status === 'failed').length
    },
    workflows,
    renameResults
  };
}

async function main() {
  console.log('🚀 Starting N8N Workflow Organization Implementation...\n');

  try {
    // Step 1: Audit existing workflows
    const workflows = await listN8NWorkflows();
    console.log(`✅ Found ${workflows.length} workflows\n`);

    // Step 2: Setup Airtable table structure
    await createAirtableTable();
    console.log('');

    // Step 3: Rename and tag workflows
    const renameResults = await renameAndTagWorkflows(workflows);
    console.log('');

    // Step 4: Sync to Airtable
    await syncToAirtable(workflows);
    console.log('');

    // Step 5: Generate report
    const report = generateReport(workflows, renameResults);

    // Save report to file
    const reportPath = 'data/n8n-workflow-organization-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();

export {
  listN8NWorkflows,
  getWorkflowDetails,
  updateWorkflow,
  renameAndTagWorkflows,
  WORKFLOW_MAPPING,
  TAG_COLORS
};
