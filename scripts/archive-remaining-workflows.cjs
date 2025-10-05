#!/usr/bin/env node

const http = require('http');

const N8N_URL = 'http://173.254.201.134:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA';

// These are the 24 workflows that should be archived as old duplicates
const WORKFLOWS_TO_ARCHIVE = [
  { id: '0Ss043Wge5zasNWy', name: 'Cold Outreach Machine - FIXED v2', reason: 'Old version - replaced by INT-LEAD-001' },
  { id: 'NpZpK8Z414giaLjO', name: 'Cold Outreach 3.0 UPDATED_922', reason: 'Old version - replaced by INT-LEAD-001' },
  { id: '6Y3EQ6pWyh5enLHG', name: 'Lead Generation Micro-SaaS Workflow', reason: 'Duplicate - kept SUB-LEAD versions' },
  { id: 'UWb1837Pg8Ssubpe', name: 'Lead Generation Micro-SaaS Workflow', reason: 'Duplicate - kept SUB-LEAD versions' },
  { id: 'fIv6GZJ4XhFL59wu', name: 'Lead Generation Micro-SaaS Workflow', reason: 'Duplicate - kept SUB-LEAD versions' },
  { id: 'D3gvVLGWGHNQixIp', name: 'AI Lead Generation SaaS Workflow', reason: 'Duplicate - kept SUB-LEAD versions' },
  { id: '4cg1KYQmBvRqQnoR', name: 'Smart Israeli Leads Generator', reason: 'Duplicate - kept SUB-LEAD-001' },
  { id: 'cgk7FI57o6cg3eju', name: 'Smart Israeli Leads Generator - Customer vs Internal Storage', reason: 'Duplicate - kept SUB-LEAD-001' },
  { id: 'tnTlHG7pBLgfOxq4', name: 'Smart Israeli Leads Generator - Customer vs Internal Storage', reason: 'Duplicate - kept SUB-LEAD-001' },
  { id: '9lTWZUMP8Rp2Bt98', name: 'Israeli LinkedIn Leads Micro-SaaS', reason: 'Duplicate - kept SUB-LEAD-001' },
  { id: 'tCYSKNvbOGTKgc2N', name: 'MicroSaaS: Israel/Jewish Leads – NYC', reason: 'Duplicate - kept SUB-LEAD-001' },
  { id: 'A7AjDqvVw3m0kia5', name: 'Lead Discovery – DFW Working', reason: 'Duplicate - kept SUB-LEAD-005' },
  { id: 'BZ1wk9DlZncPRN8t', name: 'Production Lead Generation & Enrichment - Comprehensive', reason: 'Duplicate' },
  { id: 'weEAv47M3DYzJL0n', name: 'Production Lead Generation & Enrichment - Comprehensive', reason: 'Duplicate' },
  { id: 'yr0tLBk4fFHMUq1U', name: 'Production Lead Generation & Enrichment - Comprehensive', reason: 'Duplicate' },
  { id: 'Pn7a4h2h3DTsSS6h', name: 'Working Optimized Workflow - Complete', reason: 'Old workflow' },
  { id: 'dHmbohbSPAACutey', name: 'Working Optimized Workflow', reason: 'Old workflow' },
  { id: 'ZRGVkpUirNrAF0KL', name: 'airtable home assistant', reason: 'Irrelevant personal project' }
];

// Rename these as DEV workflows
const DEV_WORKFLOWS = [
  { id: 'X3jxeLsebWDY7uku', newName: 'DEV-001: Business Intelligence & Analytics v1' },
  { id: 'qEQbFBvjvygqovYm', newName: 'DEV-002: AI Solutions Framework v1' },
  { id: '8Fls0QPWnGyTkTz5', newName: 'DEV-003: Airtable Customer Scoring Automation v1' },
  { id: 'cJbG8MpomtNrR1Sa', newName: 'DEV-004: Landing Page Conversion Optimizer v1' },
  { id: 'yjDsmVCkO3vktM6e', newName: 'DEV-005: Medical Symptom Analysis Template v1' },
  { id: 'AdgeSyjBQS7brUBb', newName: 'DEV-006: Stripe Revenue Sync to Airtable v1' }
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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

async function archiveWorkflow(workflowId, workflowName) {
  // Get full workflow
  const getResponse = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });

  if (getResponse.statusCode !== 200) {
    return { success: false, error: 'Workflow not found' };
  }

  const workflow = getResponse.data;

  // Add [ARCHIVED] prefix to name
  const updatePayload = {
    name: `[ARCHIVED] ${workflowName}`,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings
  };

  const updateResponse = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: updatePayload
  });

  return {
    success: updateResponse.statusCode === 200,
    statusCode: updateResponse.statusCode
  };
}

async function renameWorkflow(workflowId, newName) {
  const getResponse = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });

  if (getResponse.statusCode !== 200) {
    return { success: false, error: 'Workflow not found' };
  }

  const workflow = getResponse.data;

  const updatePayload = {
    name: newName,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings
  };

  const updateResponse = await makeRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    },
    body: updatePayload
  });

  return {
    success: updateResponse.statusCode === 200,
    statusCode: updateResponse.statusCode
  };
}

async function main() {
  console.log('🧹 ARCHIVING REMAINING OLD/DUPLICATE WORKFLOWS\n');
  console.log('================================================\n');

  let archived = 0;
  let renamed = 0;
  let failed = 0;

  // Archive old duplicates
  console.log('📦 Archiving 18 old/duplicate workflows:\n');
  for (const wf of WORKFLOWS_TO_ARCHIVE) {
    process.stdout.write(`  Archiving: ${wf.name}... `);
    const result = await archiveWorkflow(wf.id, wf.name);
    if (result.success) {
      console.log('✅');
      archived++;
    } else {
      console.log(`❌ (${result.statusCode || result.error})`);
      failed++;
    }
  }

  // Rename development workflows with DEV- prefix
  console.log('\n🔧 Renaming 6 development/utility workflows:\n');
  for (const wf of DEV_WORKFLOWS) {
    process.stdout.write(`  Renaming to: ${wf.newName}... `);
    const result = await renameWorkflow(wf.id, wf.newName);
    if (result.success) {
      console.log('✅');
      renamed++;
    } else {
      console.log(`❌ (${result.statusCode || result.error})`);
      failed++;
    }
  }

  console.log('\n================================================');
  console.log(`📊 Results: ${archived} archived, ${renamed} renamed, ${failed} failed`);
}

main().catch(err => console.error('Error:', err.message));
