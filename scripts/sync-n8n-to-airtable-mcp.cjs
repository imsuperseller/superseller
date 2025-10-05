#!/usr/bin/env node

const http = require('http');

const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA';
const N8N_URL = 'http://173.254.201.134:5678';
const AIRTABLE_API_KEY = 'AIRTABLE_KEY_REDACTED';
const AIRTABLE_BASE_ID = 'app6saCaH88uK3kCO'; // Operations & Automation
const AIRTABLE_TABLE_ID = 'tblMxN9pRVaw3UA52'; // Workflows table

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function httpsRequest(url, options = {}) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Request failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function categorizeWorkflow(name) {
  // Determine business model from workflow name
  if (name.startsWith('INT-')) return { model: 'Internal', category: 'Internal Operations' };
  if (name.startsWith('SUB-')) return { model: 'Subscription', category: 'Subscription Service' };
  if (name.startsWith('MKT-')) return { model: 'Marketplace', category: 'Marketplace Template' };
  if (name.startsWith('DEV-')) return { model: 'Development', category: 'Development/Testing' };
  if (name.includes('[ARCHIVED]')) return { model: 'Archived', category: 'Archived/Deprecated' };

  // Customer workflows
  if (name.includes('Shelly') || name.includes('שלי')) return { model: 'Customer', category: 'Customer: Shelly' };
  if (name.includes('Family Insurance') || name.includes('ביטוח משפחתי')) return { model: 'Customer', category: 'Customer: Shelly' };
  if (name.includes('Best Amusement') || name.includes('Aviv')) return { model: 'Customer', category: 'Customer: Aviv Lavi' };
  if (name.includes('Daf Yomi')) return { model: 'Customer', category: 'Customer: Ben/Tax4Us' };

  return { model: 'Customer', category: 'Customer: Other' };
}

function extractWorkflowType(name) {
  // Extract type from name prefix
  const match = name.match(/^(INT|SUB|MKT|DEV)-([A-Z]+)-/);
  if (match) {
    const typeMap = {
      'LEAD': 'Lead Generation',
      'EMAIL': 'Email Automation',
      'MONITOR': 'Monitoring',
      'CUSTOMER': 'Customer Management',
      'TECH': 'Technical Infrastructure',
      'FINANCE': 'Finance/Billing',
      'CONTENT': 'Content Generation'
    };
    return typeMap[match[2]] || 'Other';
  }
  return 'Other';
}

async function syncWorkflowsToAirtable() {
  console.log('🚀 SYNCING N8N WORKFLOWS TO AIRTABLE\n');

  try {
    // Get all workflows from n8n
    console.log('📥 Fetching workflows from n8n...');
    const response = await makeRequest(`${N8N_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });

    const workflows = response.data;
    console.log(`✅ Found ${workflows.length} workflows\n`);

    // Process each workflow
    let successCount = 0;
    let errorCount = 0;

    for (const workflow of workflows) {
      const { model, category } = categorizeWorkflow(workflow.name);
      const workflowType = extractWorkflowType(workflow.name);
      const status = workflow.active ? 'Active' : 'Inactive';
      const nodeCount = workflow.nodes ? workflow.nodes.length : 0;

      const airtableRecord = {
        fields: {
          'Name': workflow.name,
          'RGID': workflow.id,
          'Workflow Type': 'n8n',
          'Status': status,
          'What it does': `${model} workflow - ${category}`,
          'Trigger': workflowType,
          'Node Count': nodeCount
        }
      };

      try {
        console.log(`  Syncing: ${workflow.name.substring(0, 50)}...`);

        await httpsRequest(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: airtableRecord
        });

        console.log(`  ✅ Synced successfully`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 SYNC COMPLETE');
    console.log(`✅ Successfully synced: ${successCount}/${workflows.length}`);
    console.log(`❌ Failed: ${errorCount}/${workflows.length}`);

    // Print summary by business model
    console.log('\n📈 WORKFLOW BREAKDOWN:');
    const breakdown = workflows.reduce((acc, w) => {
      const { model } = categorizeWorkflow(w.name);
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});

    Object.entries(breakdown).forEach(([model, count]) => {
      console.log(`  ${model}: ${count} workflows`);
    });

  } catch (error) {
    console.error('❌ SYNC FAILED:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncWorkflowsToAirtable();
