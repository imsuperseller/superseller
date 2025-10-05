#!/usr/bin/env node

/**
 * CORRECTED: Airtable → Boost.space Migration to Space 2
 *
 * Fixed issues:
 * - Products use "spaces": [2] not "spaceId": 27
 * - Migrating to Space 2 (Public menu) for visibility
 */

const axios = require('axios');

const BOOST_SPACE_CONFIG = {
  baseURL: 'https://superseller.boost.space',
  apiKey: 'process.env.BOOST_SPACE_API_KEY || 'REPLACE_WITH_YOUR_API_KEY'',
  spaceId: 2 // Using Space 2 (Public menu) for visibility
};

const AIRTABLE_CONFIG = {
  baseId: 'app6saCaH88uK3kCO', // Operations & Automation
  apiKey: 'process.env.AIRTABLE_API_KEY || 'REPLACE_WITH_YOUR_API_KEY''
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
      mcpServers: { total: 0, success: 0, failed: 0, errors: [] },
      businessReferences: { total: 0, success: 0, failed: 0, errors: [] }
    };
  }

  async migrateMCPServers() {
    console.log('\n🔌 Migrating MCP Servers (17 records) → Products (Space 2)...\n');

    try {
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
          spaces: [BOOST_SPACE_CONFIG.spaceId], // FIX: Use "spaces" array, not "spaceId"
          unit: 'pcs',
          unit_name: 'ks'
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
    console.log('\n📚 Migrating Business References (24 records) → Notes (Space 2)...\n');

    try {
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
          note: this.buildReferenceContent(fields), // Use "note" field for content
          spaceId: BOOST_SPACE_CONFIG.spaceId // Notes use spaceId (not spaces array)
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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log('MCP Servers → Products (Space 2):');
    console.log(`  Total: ${this.results.mcpServers.total}`);
    console.log(`  ✅ Success: ${this.results.mcpServers.success}`);
    console.log(`  ❌ Failed: ${this.results.mcpServers.failed}`);

    console.log('\nBusiness References → Notes (Space 2):');
    console.log(`  Total: ${this.results.businessReferences.total}`);
    console.log(`  ✅ Success: ${this.results.businessReferences.success}`);
    console.log(`  ❌ Failed: ${this.results.businessReferences.failed}`);

    const totalSuccess = this.results.mcpServers.success +
                         this.results.businessReferences.success;
    const totalRecords = this.results.mcpServers.total +
                         this.results.businessReferences.total;

    console.log('\n' + '-'.repeat(60));
    console.log(`TOTAL: ${totalSuccess}/${totalRecords} records migrated successfully`);
    console.log('='.repeat(60) + '\n');

    // Print errors if any
    const allErrors = [
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
    console.log('🚀 Starting Boost.space Migration to Space 2...\n');
    console.log('Fix Applied:');
    console.log('  • Products: Using "spaces": [2] (array)');
    console.log('  • Notes: Using "spaceId": 2');
    console.log('  • Target: Space 2 (Public menu) for visibility');

    try {
      await this.migrateMCPServers();
      await this.migrateBusinessReferences();

      this.printSummary();

      console.log('\n✅ Migration complete!');
      console.log('\n📋 Next Steps:');
      console.log('1. Log into https://superseller.boost.space');
      console.log('2. Check Products module (17 MCP servers should be visible)');
      console.log('3. Check Notes module (24 business references should be visible)');
      console.log('4. All records should now be in Space 2 (Public menu)');

    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

// Run migration
const migration = new BoostSpaceMigration();
migration.run();
