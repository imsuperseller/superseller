#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableExistingTableMigration {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // Use existing Rensto base
        this.renstoBaseId = 'appQijHhqqP4z6wGe';

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            baseId: this.renstoBaseId,
            tables: {},
            records: {},
            errors: []
        };
    }

    async migrateToExistingTables() {
        console.log('🚀 AIRTABLE EXISTING TABLE MIGRATION');
        console.log('=====================================');
        console.log(`📋 Using base: Rensto (${this.renstoBaseId})`);

        try {
            // Step 1: Get existing table structures
            await this.getExistingTableStructures();

            // Step 2: Migrate data to existing tables
            await this.migrateDataToExistingTables();

            // Step 3: Save results
            await this.saveResults();

            console.log('\n✅ AIRTABLE EXISTING TABLE MIGRATION COMPLETED!');
            console.log('🎯 Data successfully migrated to existing tables');
            console.log(`📊 Check your Airtable workspace: https://airtable.com/${this.renstoBaseId}`);

        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            this.results.errors.push({ step: 'migration', error: error.message });
            await this.saveResults();
        }
    }

    async getExistingTableStructures() {
        console.log('\n📊 Getting existing table structures...');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${this.renstoBaseId}/tables`, {
                headers: this.headers
            });

            const tables = response.data.tables || [];
            console.log(`  ✅ Found ${tables.length} existing tables:`);

            tables.forEach(table => {
                console.log(`    - ${table.name} (${table.id})`);
                console.log(`      Fields: ${table.fields.map(f => f.name).join(', ')}`);

                this.results.tables[table.name] = {
                    id: table.id,
                    fields: table.fields.map(f => ({ name: f.name, type: f.type }))
                };
            });

        } catch (error) {
            console.error(`  ❌ Failed to get table structures: ${error.message}`);
            this.results.errors.push({ step: 'getTableStructures', error: error.message });
        }
    }

    async migrateDataToExistingTables() {
        console.log('\n📊 Migrating data to existing tables...');

        // Migrate data to existing Leads table
        if (this.results.tables['Leads']) {
            await this.migrateToLeadsTable();
        }
    }

    async migrateToLeadsTable() {
        console.log('  📋 Migrating data to existing Leads table...');

        // Create lead records using the existing field structure
        const leads = [
            {
                fields: {
                    'lead_id': 'Ben Ginati - Podcast Automation Project\nEmail: ben@ginati.com\nCompany: Ginati Enterprises\nStatus: Converted\nNotes: Podcast and content creation client - converted to customer\nCreated: 2025-01-10'
                }
            },
            {
                fields: {
                    'lead_id': 'Shelly Mizrahi - Insurance CRM Project\nEmail: shelly@mizrahi.com\nCompany: Mizrahi Insurance\nStatus: Converted\nNotes: Insurance business automation client - converted to customer\nCreated: 2025-02-15'
                }
            },
            {
                fields: {
                    'lead_id': 'Rensto Business Data Migration\nEmail: admin@rensto.com\nCompany: Rensto\nStatus: Active\nNotes: Internal project for migrating business data to Airtable\nCreated: 2025-08-25'
                }
            }
        ];

        await this.addRecords('Leads', leads);
    }

    async addRecords(tableName, records) {
        try {
            const response = await axios.post(`${this.baseUrl}/${this.renstoBaseId}/${encodeURIComponent(tableName)}`, {
                records: records
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Added ${response.data.records?.length || 0} records to ${tableName}`);

            if (!this.results.records[tableName]) {
                this.results.records[tableName] = [];
            }
            this.results.records[tableName].push(...(response.data.records || []));

        } catch (error) {
            console.error(`    ❌ Failed to add records to ${tableName}: ${error.message}`);
            this.results.errors.push({
                step: 'addRecords',
                table: tableName,
                error: error.message
            });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/existing-table-migration-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const migration = new AirtableExistingTableMigration();
migration.migrateToExistingTables().catch(console.error);
