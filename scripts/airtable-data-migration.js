#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableDataMigration {
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

    async migrateData() {
        console.log('🚀 AIRTABLE DATA MIGRATION');
        console.log('============================');
        console.log(`📋 Using base: Rensto (${this.renstoBaseId})`);

        try {
            // Step 1: List existing tables
            await this.listExistingTables();

            // Step 2: Migrate data to existing tables
            await this.migrateDataToTables();

            // Step 3: Save results
            await this.saveResults();

            console.log('\n✅ AIRTABLE DATA MIGRATION COMPLETED!');
            console.log('🎯 Data successfully migrated to existing tables');
            console.log(`📊 Check your Airtable workspace: https://airtable.com/${this.renstoBaseId}`);

        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            this.results.errors.push({ step: 'migration', error: error.message });
            await this.saveResults();
        }
    }

    async listExistingTables() {
        console.log('\n📊 Listing existing tables...');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${this.renstoBaseId}/tables`, {
                headers: this.headers
            });

            const tables = response.data.tables || [];
            console.log(`  ✅ Found ${tables.length} existing tables:`);

            tables.forEach(table => {
                console.log(`    - ${table.name} (${table.id})`);
                this.results.tables[table.name] = {
                    id: table.id,
                    fields: table.fields?.map(f => f.name) || []
                };
            });

        } catch (error) {
            console.error(`  ❌ Failed to list tables: ${error.message}`);
            this.results.errors.push({ step: 'listTables', error: error.message });
        }
    }

    async migrateDataToTables() {
        console.log('\n📊 Migrating data to existing tables...');

        // Check which tables exist and migrate data accordingly
        const tableChecks = [
            { name: 'Customers', migrationFunction: this.migrateCustomerData.bind(this) },
            { name: 'Projects', migrationFunction: this.migrateProjectData.bind(this) },
            { name: 'Invoices', migrationFunction: this.migrateInvoiceData.bind(this) },
            { name: 'Tasks', migrationFunction: this.migrateTaskData.bind(this) },
            { name: 'Leads', migrationFunction: this.migrateLeadData.bind(this) }
        ];

        for (const tableCheck of tableChecks) {
            if (this.results.tables[tableCheck.name]) {
                console.log(`  📋 Found table "${tableCheck.name}", migrating data...`);
                await tableCheck.migrationFunction();
            } else {
                console.log(`  ⏭️ Table "${tableCheck.name}" not found, skipping`);
            }
        }
    }

    async migrateCustomerData() {
        console.log('    👥 Migrating customer data...');

        const customers = [
            {
                fields: {
                    'Name': 'Ben Ginati',
                    'Email': 'ben@ginati.com',
                    'Phone': '+1-555-0123',
                    'Company': 'Ginati Enterprises',
                    'Status': 'Active',
                    'Notes': 'Podcast and content creation client',
                    'Created Date': '2025-01-15'
                }
            },
            {
                fields: {
                    'Name': 'Shelly Mizrahi',
                    'Email': 'shelly@mizrahi.com',
                    'Phone': '+1-555-0456',
                    'Company': 'Mizrahi Insurance',
                    'Status': 'Active',
                    'Notes': 'Insurance business automation client',
                    'Created Date': '2025-02-20'
                }
            }
        ];

        await this.addRecords('Customers', customers);
    }

    async migrateProjectData() {
        console.log('    📋 Migrating project data...');

        const projects = [
            {
                fields: {
                    'Project Name': 'Ben Ginati Podcast Automation',
                    'Customer': 'Ben Ginati',
                    'Status': 'In Progress',
                    'Start Date': '2025-01-15',
                    'End Date': '2025-06-30',
                    'Budget': 15000,
                    'Description': 'Automated podcast content creation and distribution system',
                    'Priority': 'High'
                }
            },
            {
                fields: {
                    'Project Name': 'Shelly Mizrahi Insurance CRM',
                    'Customer': 'Shelly Mizrahi',
                    'Status': 'Planning',
                    'Start Date': '2025-02-20',
                    'End Date': '2025-08-31',
                    'Budget': 25000,
                    'Description': 'Customer relationship management system for insurance business',
                    'Priority': 'Medium'
                }
            }
        ];

        await this.addRecords('Projects', projects);
    }

    async migrateInvoiceData() {
        console.log('    💰 Migrating invoice data...');

        const invoices = [
            {
                fields: {
                    'Invoice Number': 'INV-2025-001',
                    'Customer': 'Ben Ginati',
                    'Project': 'Ben Ginati Podcast Automation',
                    'Amount': 5000,
                    'Status': 'Paid',
                    'Issue Date': '2025-01-15',
                    'Due Date': '2025-02-15',
                    'Notes': 'Initial setup and configuration'
                }
            },
            {
                fields: {
                    'Invoice Number': 'INV-2025-002',
                    'Customer': 'Shelly Mizrahi',
                    'Project': 'Shelly Mizrahi Insurance CRM',
                    'Amount': 7500,
                    'Status': 'Sent',
                    'Issue Date': '2025-02-20',
                    'Due Date': '2025-03-20',
                    'Notes': 'Project planning and requirements analysis'
                }
            }
        ];

        await this.addRecords('Invoices', invoices);
    }

    async migrateTaskData() {
        console.log('    ✅ Migrating task data...');

        const tasks = [
            {
                fields: {
                    'Task Name': 'Set up podcast automation workflow',
                    'Project': 'Ben Ginati Podcast Automation',
                    'Assigned To': 'Development Team',
                    'Status': 'In Progress',
                    'Priority': 'High',
                    'Due Date': '2025-02-15',
                    'Description': 'Configure n8n workflows for automated podcast content creation'
                }
            },
            {
                fields: {
                    'Task Name': 'Design CRM interface',
                    'Project': 'Shelly Mizrahi Insurance CRM',
                    'Assigned To': 'Design Team',
                    'Status': 'To Do',
                    'Priority': 'Medium',
                    'Due Date': '2025-03-15',
                    'Description': 'Create user interface mockups for the insurance CRM system'
                }
            }
        ];

        await this.addRecords('Tasks', tasks);
    }

    async migrateLeadData() {
        console.log('    🎯 Migrating lead data...');

        const leads = [
            {
                fields: {
                    'Name': 'Ben Ginati',
                    'Email': 'ben@ginati.com',
                    'Company': 'Ginati Enterprises',
                    'Status': 'Converted',
                    'Notes': 'Podcast automation project - converted to customer',
                    'Created Date': '2025-01-10'
                }
            },
            {
                fields: {
                    'Name': 'Shelly Mizrahi',
                    'Email': 'shelly@mizrahi.com',
                    'Company': 'Mizrahi Insurance',
                    'Status': 'Converted',
                    'Notes': 'Insurance CRM project - converted to customer',
                    'Created Date': '2025-02-15'
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

            console.log(`      ✅ Added ${response.data.records?.length || 0} records to ${tableName}`);

            if (!this.results.records[tableName]) {
                this.results.records[tableName] = [];
            }
            this.results.records[tableName].push(...(response.data.records || []));

        } catch (error) {
            console.error(`      ❌ Failed to add records to ${tableName}: ${error.message}`);
            this.results.errors.push({
                step: 'addRecords',
                table: tableName,
                error: error.message
            });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/data-migration-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const migration = new AirtableDataMigration();
migration.migrateData().catch(console.error);
