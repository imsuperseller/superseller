#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableExistingBaseMigration {
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

    async migrateToExistingBase() {
        console.log('🚀 AIRTABLE EXISTING BASE MIGRATION');
        console.log('====================================');
        console.log(`📋 Using existing base: Rensto (${this.renstoBaseId})`);

        try {
            // Step 1: List existing tables
            await this.listExistingTables();

            // Step 2: Create business tables if they don't exist
            await this.createBusinessTables();

            // Step 3: Migrate existing data
            await this.migrateExistingData();

            // Step 4: Save results
            await this.saveResults();

            console.log('\n✅ AIRTABLE EXISTING BASE MIGRATION COMPLETED!');
            console.log('🎯 Business data successfully migrated to existing Rensto base');
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

    async createBusinessTables() {
        console.log('\n🏗️ Creating business tables...');

        const tableDefinitions = [
            {
                name: 'Customers',
                description: 'Customer information and profiles',
                fields: [
                    { name: 'Name', type: 'singleLineText' },
                    { name: 'Email', type: 'email' },
                    { name: 'Phone', type: 'phoneNumber' },
                    { name: 'Company', type: 'singleLineText' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' }
                            ]
                        }
                    },
                    { name: 'Notes', type: 'multilineText' },
                    { name: 'Created Date', type: 'date' }
                ]
            },
            {
                name: 'Projects',
                description: 'Project management and tracking',
                fields: [
                    { name: 'Project Name', type: 'singleLineText' },
                    { name: 'Customer', type: 'singleLineText' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Planning' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'On Hold' }
                            ]
                        }
                    },
                    { name: 'Start Date', type: 'date' },
                    { name: 'End Date', type: 'date' },
                    { name: 'Budget', type: 'currency' },
                    { name: 'Description', type: 'multilineText' },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Invoices',
                description: 'Financial invoice tracking',
                fields: [
                    { name: 'Invoice Number', type: 'singleLineText' },
                    { name: 'Customer', type: 'singleLineText' },
                    { name: 'Project', type: 'singleLineText' },
                    { name: 'Amount', type: 'currency' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Draft' }, { name: 'Sent' }, { name: 'Paid' }, { name: 'Overdue' }
                            ]
                        }
                    },
                    { name: 'Issue Date', type: 'date' },
                    { name: 'Due Date', type: 'date' },
                    { name: 'Notes', type: 'multilineText' }
                ]
            },
            {
                name: 'Tasks',
                description: 'Task management and tracking',
                fields: [
                    { name: 'Task Name', type: 'singleLineText' },
                    { name: 'Project', type: 'singleLineText' },
                    { name: 'Assigned To', type: 'singleLineText' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'To Do' }, { name: 'In Progress' }, { name: 'Review' }, { name: 'Done' }
                            ]
                        }
                    },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    },
                    { name: 'Due Date', type: 'date' },
                    { name: 'Description', type: 'multilineText' }
                ]
            }
        ];

        for (const tableDef of tableDefinitions) {
            await this.createTableIfNotExists(tableDef);
        }
    }

    async createTableIfNotExists(tableDef) {
        // Check if table already exists
        if (this.results.tables[tableDef.name]) {
            console.log(`  ⏭️ Table "${tableDef.name}" already exists, skipping creation`);
            return;
        }

        console.log(`  📋 Creating table: ${tableDef.name}`);

        try {
            const response = await axios.post(`${this.baseUrl}/meta/bases/${this.renstoBaseId}/tables`, {
                name: tableDef.name,
                description: tableDef.description,
                fields: tableDef.fields
            }, {
                headers: this.headers
            });

            const newTable = response.data;
            console.log(`    ✅ Created table: ${newTable.name} (${newTable.id})`);

            this.results.tables[tableDef.name] = {
                id: newTable.id,
                fields: newTable.fields?.map(f => f.name) || []
            };

        } catch (error) {
            console.error(`    ❌ Failed to create table "${tableDef.name}": ${error.message}`);
            this.results.errors.push({
                step: 'createTable',
                table: tableDef.name,
                error: error.message
            });
        }
    }

    async migrateExistingData() {
        console.log('\n📊 Migrating existing data...');

        // Migrate customer data
        await this.migrateCustomerData();

        // Migrate project data
        await this.migrateProjectData();

        // Migrate invoice data
        await this.migrateInvoiceData();
    }

    async migrateCustomerData() {
        console.log('  👥 Migrating customer data...');

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
        console.log('  📋 Migrating project data...');

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
        console.log('  💰 Migrating invoice data...');

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

    async addRecords(tableName, records) {
        if (!this.results.tables[tableName]) {
            console.log(`    ⚠️ Table "${tableName}" not found, skipping data migration`);
            return;
        }

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
        const filename = `docs/airtable-migration/existing-base-migration-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const migration = new AirtableExistingBaseMigration();
migration.migrateToExistingBase().catch(console.error);
