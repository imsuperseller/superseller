#!/usr/bin/env node

/**
 * Complete Airtable → Boost.space Migration using MCP Tools
 *
 * Mapping Strategy (custom modules not accessible via REST API):
 * - workflows (62 records) → business-case module
 * - mcp-servers (17 records) → products module
 * - business-references (12 records) → note module
 *
 * Uses:
 * - Airtable MCP to read data
 * - Direct API calls to Boost.space (since Boost MCP tools use same endpoints)
 */

const axios = require('axios');

const BOOST_SPACE_CONFIG = {
  baseURL: 'https://superseller.boost.space',
  apiKey: 'BOOST_SPACE_KEY_REDACTED',
  spaceId: 27 // Default space ID for records
};

const AIRTABLE_CONFIG = {
  baseId: 'app6saCaH88uK3kCO', // Operations & Automation
  apiKey: 'AIRTABLE_KEY_REDACTED'
};

// Create API clients
const boostSpaceAPI = axios.create({
  baseURL: BOOST_SPACE_CONFIG.baseURL,
  headers: {
    'Authorization': `Bearer ${BOOST_SPACE_CONFIG.apiKey}`,
    'Content-Type': 'application/json'
  }
});

const airtableAPI = axios.create({
  baseURL: 'https://api.airtable.com/v0',
  headers: {
    'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
    'Content-Type': 'application/json'
  }
});

class BoostSpaceMigration {
  constructor() {
    this.results = {
      workflows: { total: 0, success: 0, failed: 0, errors: [] },
      mcpServers: { total: 0, success: 0, failed: 0, errors: [] },
      businessReferences: { total: 0, success: 0, failed: 0, errors: [] }
    };
  }

  async migrateWorkflows() {
    console.log('\n📦 Migrating Workflows (62 records) → Business Cases...\n');

    try {
      // Fetch workflows from Airtable
      const response = await airtableAPI.get(
        `/${AIRTABLE_CONFIG.baseId}/n8n%20Workflows`
      );

      const workflows = response.data.records;
      this.results.workflows.total = workflows.length;

      console.log(`Found ${workflows.length} workflows in Airtable`);

      for (const workflow of workflows) {
        const fields = workflow.fields;

        // Map Airtable fields to Boost.space business-case fields
        const businessCase = {
          name: fields['Workflow Name'] || fields['Name'] || 'Unnamed Workflow',
          description: this.buildWorkflowDescription(fields),
          spaceId: BOOST_SPACE_CONFIG.spaceId,
          // Additional fields based on what's available
          ...(fields['Status'] && { status_system_id: this.mapStatus(fields['Status']) })
        };

        try {
          const result = await boostSpaceAPI.post('/api/business-case', businessCase);
          this.results.workflows.success++;
          console.log(`  ✅ ${businessCase.name} → ID: ${result.data.id}`);
        } catch (error) {
          this.results.workflows.failed++;
          this.results.workflows.errors.push({
            record: businessCase.name,
            error: error.response?.data || error.message
          });
          console.log(`  ❌ ${businessCase.name} → ${error.message}`);
        }

        // Rate limiting: wait 200ms between requests
        await this.sleep(200);
      }

    } catch (error) {
      console.error(`❌ Failed to fetch workflows from Airtable: ${error.message}`);
    }
  }

  async migrateMCPServers() {
    console.log('\n🔌 Migrating MCP Servers (17 records) → Products...\n');

    try {
      // Fetch MCP servers from Airtable
      const response = await airtableAPI.get(
        `/${AIRTABLE_CONFIG.baseId}/MCP%20Servers`
      );

      const mcpServers = response.data.records;
      this.results.mcpServers.total = mcpServers.length;

      console.log(`Found ${mcpServers.length} MCP servers in Airtable`);

      for (const server of mcpServers) {
        const fields = server.fields;

        // Map Airtable fields to Boost.space product fields
        const product = {
          name: fields['Server Name'] || fields['Name'] || 'Unnamed MCP Server',
          sku: fields['Server ID'] || `mcp-${Date.now()}`,
          description: this.buildMCPDescription(fields),
          spaceId: BOOST_SPACE_CONFIG.spaceId,
          // Required fields for Product module
          unit: 'pcs', // pieces (standard unit for services)
          unit_name: 'ks' // Czech standard (Boost.space default)
        };

        try {
          const result = await boostSpaceAPI.post('/api/product', product);
          this.results.mcpServers.success++;
          console.log(`  ✅ ${product.name} → ID: ${result.data.id}`);
        } catch (error) {
          this.results.mcpServers.failed++;
          this.results.mcpServers.errors.push({
            record: product.name,
            error: error.response?.data || error.message
          });
          console.log(`  ❌ ${product.name} → ${error.message}`);
        }

        await this.sleep(200);
      }

    } catch (error) {
      console.error(`❌ Failed to fetch MCP servers from Airtable: ${error.message}`);
    }
  }

  async migrateBusinessReferences() {
    console.log('\n📚 Migrating Business References (12 records) → Notes...\n');

    try {
      // Fetch business references from Airtable
      const response = await airtableAPI.get(
        `/${AIRTABLE_CONFIG.baseId}/Business%20References`
      );

      const references = response.data.records;
      this.results.businessReferences.total = references.length;

      console.log(`Found ${references.length} business references in Airtable`);

      for (const reference of references) {
        const fields = reference.fields;

        // Map Airtable fields to Boost.space note fields
        const note = {
          title: fields['Title'] || fields['Name'] || 'Unnamed Reference',
          content: this.buildReferenceContent(fields),
          spaceId: BOOST_SPACE_CONFIG.spaceId
        };

        try {
          const result = await boostSpaceAPI.post('/api/note', note);
          this.results.businessReferences.success++;
          console.log(`  ✅ ${note.title} → ID: ${result.data.id}`);
        } catch (error) {
          this.results.businessReferences.failed++;
          this.results.businessReferences.errors.push({
            record: note.title,
            error: error.response?.data || error.message
          });
          console.log(`  ❌ ${note.title} → ${error.message}`);
        }

        await this.sleep(200);
      }

    } catch (error) {
      console.error(`❌ Failed to fetch business references from Airtable: ${error.message}`);
    }
  }

  buildWorkflowDescription(fields) {
    const parts = [];

    if (fields['Workflow ID']) parts.push(`ID: ${fields['Workflow ID']}`);
    if (fields['n8n ID']) parts.push(`n8n ID: ${fields['n8n ID']}`);
    if (fields['Type']) parts.push(`Type: ${fields['Type']}`);
    if (fields['Department']) parts.push(`Department: ${fields['Department']}`);
    if (fields['Description']) parts.push(`\n\n${fields['Description']}`);
    if (fields['Webhook URL']) parts.push(`\n\nWebhook: ${fields['Webhook URL']}`);
    if (fields['Revenue Potential']) parts.push(`\nRevenue: ${fields['Revenue Potential']}`);
    if (fields['Dependencies']) parts.push(`\nDependencies: ${fields['Dependencies']}`);

    return parts.join(' | ');
  }

  buildMCPDescription(fields) {
    const parts = [];

    if (fields['Server ID']) parts.push(`ID: ${fields['Server ID']}`);
    if (fields['Type']) parts.push(`Type: ${fields['Type']}`);
    if (fields['Status']) parts.push(`Status: ${fields['Status']}`);
    if (fields['Description']) parts.push(`\n\n${fields['Description']}`);
    if (fields['Endpoint URL']) parts.push(`\n\nEndpoint: ${fields['Endpoint URL']}`);
    if (fields['Authentication']) parts.push(`\nAuth: ${fields['Authentication']}`);
    if (fields['Documentation URL']) parts.push(`\nDocs: ${fields['Documentation URL']}`);

    return parts.join(' | ');
  }

  buildReferenceContent(fields) {
    const parts = [];

    if (fields['Reference ID']) parts.push(`ID: ${fields['Reference ID']}`);
    if (fields['Type']) parts.push(`Type: ${fields['Type']}`);
    if (fields['Category']) parts.push(`Category: ${fields['Category']}`);
    if (fields['Status']) parts.push(`Status: ${fields['Status']}`);
    if (fields['Description']) parts.push(`\n\n${fields['Description']}`);
    if (fields['Content']) parts.push(`\n\n${fields['Content']}`);
    if (fields['Author']) parts.push(`\n\nAuthor: ${fields['Author']}`);
    if (fields['Notion URL']) parts.push(`\nNotion: ${fields['Notion URL']}`);
    if (fields['External URL']) parts.push(`\nExternal: ${fields['External URL']}`);

    return parts.join(' | ');
  }

  mapStatus(status) {
    // Map Airtable status to Boost.space status_system_id
    const statusMap = {
      'Active': 1,
      'Inactive': 2,
      'Testing': 3,
      'Archived': 4,
      'Draft': 5
    };
    return statusMap[status] || 1;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log('Workflows → Business Cases:');
    console.log(`  Total: ${this.results.workflows.total}`);
    console.log(`  ✅ Success: ${this.results.workflows.success}`);
    console.log(`  ❌ Failed: ${this.results.workflows.failed}`);

    console.log('\nMCP Servers → Products:');
    console.log(`  Total: ${this.results.mcpServers.total}`);
    console.log(`  ✅ Success: ${this.results.mcpServers.success}`);
    console.log(`  ❌ Failed: ${this.results.mcpServers.failed}`);

    console.log('\nBusiness References → Notes:');
    console.log(`  Total: ${this.results.businessReferences.total}`);
    console.log(`  ✅ Success: ${this.results.businessReferences.success}`);
    console.log(`  ❌ Failed: ${this.results.businessReferences.failed}`);

    const totalSuccess = this.results.workflows.success +
                         this.results.mcpServers.success +
                         this.results.businessReferences.success;
    const totalRecords = this.results.workflows.total +
                         this.results.mcpServers.total +
                         this.results.businessReferences.total;

    console.log('\n' + '-'.repeat(60));
    console.log(`TOTAL: ${totalSuccess}/${totalRecords} records migrated successfully`);
    console.log('='.repeat(60) + '\n');

    // Print errors if any
    const allErrors = [
      ...this.results.workflows.errors,
      ...this.results.mcpServers.errors,
      ...this.results.businessReferences.errors
    ];

    if (allErrors.length > 0) {
      console.log('\n⚠️  ERRORS:\n');
      allErrors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.record}`);
        console.log(`   Error: ${JSON.stringify(err.error, null, 2)}`);
      });
    }
  }

  async run() {
    console.log('🚀 Starting Boost.space Migration...\n');
    console.log('Strategy: Using built-in modules (custom modules not accessible via REST API)');
    console.log('  • Workflows → Business Cases');
    console.log('  • MCP Servers → Products');
    console.log('  • Business References → Notes');

    try {
      await this.migrateWorkflows();
      await this.migrateMCPServers();
      await this.migrateBusinessReferences();

      this.printSummary();

      console.log('\n✅ Migration complete!');
      console.log('\n📋 Next Steps:');
      console.log('1. Verify data in Boost.space UI: https://superseller.boost.space');
      console.log('2. Create INT-SYNC-001 workflow for ongoing n8n → Boost.space sync');
      console.log('3. Update admin.rensto.com to read from Boost.space');

    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

// Run migration
const migration = new BoostSpaceMigration();
migration.run();
