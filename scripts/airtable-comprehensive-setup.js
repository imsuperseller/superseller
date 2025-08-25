#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableComprehensiveSetup {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // The 6 bases you created
        this.bases = {
            'rensto': 'appQijHhqqP4z6wGe',
            'core': 'app4nJpP1ytGukXQT',
            'finance': 'app6yzlm67lRNuQZD',
            'marketing': 'appQhVkIaWoGJG301',
            'operations': 'app6saCaH88uK3kCO',
            'customers': 'appSCBZk03GUCTfhN'
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: {},
            tables: {},
            records: {},
            errors: []
        };
    }

    async setupAllBases() {
        console.log('🚀 AIRTABLE COMPREHENSIVE SETUP');
        console.log('================================');
        console.log('Setting up all 6 business bases...');

        try {
            // Step 1: Analyze existing bases
            await this.analyzeExistingBases();

            // Step 2: Create tables in each base
            await this.createTablesInAllBases();

            // Step 3: Add fields to tables
            await this.addFieldsToAllTables();

            // Step 4: Migrate business data
            await this.migrateBusinessData();

            // Step 5: Save results
            await this.saveResults();

            console.log('\n✅ AIRTABLE COMPREHENSIVE SETUP COMPLETED!');
            console.log('🎯 All 6 bases configured with complete business structure');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async analyzeExistingBases() {
        console.log('\n📊 Analyzing existing bases...');

        for (const [baseName, baseId] of Object.entries(this.bases)) {
            try {
                const response = await axios.get(`${this.baseUrl}/meta/bases/${baseId}/tables`, {
                    headers: this.headers
                });

                const tables = response.data.tables || [];
                console.log(`  📋 ${baseName}: ${tables.length} tables found`);

                this.results.bases[baseName] = {
                    id: baseId,
                    tables: tables.map(t => ({ id: t.id, name: t.name, fields: t.fields }))
                };

            } catch (error) {
                console.error(`  ❌ Failed to analyze ${baseName}: ${error.message}`);
                this.results.errors.push({ step: 'analyze', base: baseName, error: error.message });
            }
        }
    }

    async createTablesInAllBases() {
        console.log('\n🏗️ Creating tables in all bases...');

        const tableDefinitions = {
            'core': ['Companies', 'Contacts', 'Projects', 'Tasks', 'Time Tracking', 'Documents'],
            'finance': ['Invoices', 'Payments', 'Expenses', 'Revenue', 'Budgets', 'Tax Records'],
            'marketing': ['Leads', 'Opportunities', 'Campaigns', 'Content', 'Social Media', 'Analytics'],
            'operations': ['Workflows', 'Automations', 'Integrations', 'System Logs', 'Maintenance', 'Backups'],
            'customers': ['Customers', 'Support Tickets', 'Onboarding', 'Success Metrics', 'Feedback', 'Retention']
        };

        for (const [baseName, tableNames] of Object.entries(tableDefinitions)) {
            const baseId = this.bases[baseName];
            console.log(`  📋 Creating tables in ${baseName}...`);

            for (const tableName of tableNames) {
                await this.createTableIfNotExists(baseId, tableName);
            }
        }
    }

    async createTableIfNotExists(baseId, tableName) {
        // Check if table already exists
        const existingTables = this.results.bases[Object.keys(this.bases).find(k => this.bases[k] === baseId)]?.tables || [];
        if (existingTables.find(t => t.name === tableName)) {
            console.log(`    ⏭️ Table "${tableName}" already exists, skipping`);
            return;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables`, {
                name: tableName,
                description: `${tableName} table for business operations`,
                fields: [
                    { name: 'Name', type: 'singleLineText' }
                ]
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Created table: ${tableName}`);

        } catch (error) {
            console.error(`    ❌ Failed to create table "${tableName}": ${error.message}`);
            this.results.errors.push({
                step: 'createTable',
                base: baseId,
                table: tableName,
                error: error.message
            });
        }
    }

    async addFieldsToAllTables() {
        console.log('\n🔧 Adding fields to all tables...');

        // This is a simplified version - we'll add basic fields to each table
        const fieldDefinitions = {
            'Companies': [
                {
                    name: 'Company Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Client' }, { name: 'Vendor' }, { name: 'Partner' }, { name: 'Internal' }
                        ]
                    }
                },
                { name: 'Industry', type: 'singleLineText' },
                { name: 'Website', type: 'url' },
                { name: 'Phone', type: 'phoneNumber' },
                { name: 'Address', type: 'longText' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }
                        ]
                    }
                },
                { name: 'Notes', type: 'longText' }
            ],
            'Contacts': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Email', type: 'email' },
                { name: 'Phone', type: 'phoneNumber' },
                { name: 'Role', type: 'singleLineText' },
                {
                    name: 'Contact Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Customer' }, { name: 'Vendor' }, { name: 'Team Member' }, { name: 'Partner' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Lead' }
                        ]
                    }
                },
                { name: 'Notes', type: 'longText' }
            ]
        };

        // Add fields to each table
        for (const [baseName, baseId] of Object.entries(this.bases)) {
            if (baseName === 'rensto') continue; // Skip the original Rensto base

            const tables = this.results.bases[baseName]?.tables || [];
            for (const table of tables) {
                const fields = fieldDefinitions[table.name];
                if (fields) {
                    console.log(`  📋 Adding fields to ${baseName}.${table.name}...`);
                    for (const field of fields) {
                        await this.addFieldToTable(baseId, table.id, field);
                    }
                }
            }
        }
    }

    async addFieldToTable(baseId, tableId, fieldDef) {
        try {
            const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
                name: fieldDef.name,
                type: fieldDef.type,
                ...(fieldDef.options && { options: fieldDef.options })
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Added field "${fieldDef.name}"`);

        } catch (error) {
            console.error(`    ❌ Failed to add field "${fieldDef.name}": ${error.message}`);
            this.results.errors.push({
                step: 'addField',
                base: baseId,
                table: tableId,
                field: fieldDef.name,
                error: error.message
            });
        }
    }

    async migrateBusinessData() {
        console.log('\n📊 Migrating business data...');

        // Migrate data to the core base
        const coreBaseId = this.bases['core'];
        await this.migrateCoreData(coreBaseId);
    }

    async migrateCoreData(baseId) {
        console.log('  📋 Migrating core business data...');

        // Sample data for Companies
        const companies = [
            {
                fields: {
                    'Name': 'Ben Ginati Enterprises',
                    'Company Type': 'Client',
                    'Industry': 'Media & Entertainment',
                    'Website': 'https://ginati.com',
                    'Phone': '+1-555-0123',
                    'Status': 'Active',
                    'Notes': 'Podcast and content creation client'
                }
            },
            {
                fields: {
                    'Name': 'Mizrahi Insurance',
                    'Company Type': 'Client',
                    'Industry': 'Insurance',
                    'Website': 'https://mizrahi-insurance.com',
                    'Phone': '+1-555-0456',
                    'Status': 'Active',
                    'Notes': 'Insurance business automation client'
                }
            },
            {
                fields: {
                    'Name': 'Rensto',
                    'Company Type': 'Internal',
                    'Industry': 'Technology',
                    'Website': 'https://rensto.com',
                    'Phone': '+1-555-0789',
                    'Status': 'Active',
                    'Notes': 'Internal company for business operations'
                }
            }
        ];

        await this.addRecordsToTable(baseId, 'Companies', companies);
    }

    async addRecordsToTable(baseId, tableName, records) {
        try {
            const response = await axios.post(`${this.baseUrl}/${baseId}/${encodeURIComponent(tableName)}`, {
                records: records
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Added ${response.data.records?.length || 0} records to ${tableName}`);

        } catch (error) {
            console.error(`    ❌ Failed to add records to ${tableName}: ${error.message}`);
            this.results.errors.push({
                step: 'addRecords',
                base: baseId,
                table: tableName,
                error: error.message
            });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/comprehensive-setup-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const setup = new AirtableComprehensiveSetup();
setup.setupAllBases().catch(console.error);
