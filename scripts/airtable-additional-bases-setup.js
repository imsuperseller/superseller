#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableAdditionalBasesSetup {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // The 4 new bases you created (using correct base IDs)
        this.bases = {
            'entities': 'app9DhsrZ0VnuEH3t',
            'operations': 'appCGexgpGPkMUPXF', 
            'analytics': 'appOvDNYenyx7WITR',
            'integrations': 'app9oouVkvTkFjf3t'
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: {},
            errors: []
        };
    }

    async setupAdditionalBases() {
        console.log('🏗️ AIRTABLE ADDITIONAL BASES SETUP');
        console.log('==================================');
        console.log('Setting up 4 additional bases with advanced features...');

        try {
            // Step 1: Analyze existing bases
            await this.analyzeExistingBases();

            // Step 2: Create tables in each base
            await this.createTablesInAllBases();

            // Step 3: Add comprehensive fields
            await this.addFieldsToAllBases();

            // Step 4: Save results
            await this.saveResults();

            console.log('\n✅ ADDITIONAL BASES SETUP COMPLETED!');
            console.log('🎯 All 4 additional bases configured with advanced features');

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
            }
        }
    }

    async createTablesInAllBases() {
        console.log('\n🏗️ Creating tables in additional bases...');

        const tableDefinitions = {
            'entities': ['Global Entities', 'External Identities'],
            'operations': ['Idempotency Keys', 'BMAD Projects'],
            'analytics': ['Usage Tracking', 'Performance Metrics', 'Error Logs'],
            'integrations': ['MCP Servers', 'External Services']
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
        try {
            const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables`, {
                name: tableName,
                description: `Table for ${tableName} in ${baseId}`,
                fields: [
                    {
                        name: 'Name',
                        type: 'singleLineText',
                        description: 'Primary name field'
                    }
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

    async addFieldsToAllBases() {
        console.log('\n🔧 Adding comprehensive fields to all bases...');

        await this.addFieldsToEntitiesBase();
        await this.addFieldsToOperationsBase();
        await this.addFieldsToAnalyticsBase();
        await this.addFieldsToIntegrationsBase();
    }

    async addFieldsToEntitiesBase() {
        console.log('\n🏢 Adding fields to Entities Base...');
        const baseId = this.bases['entities'];

        const fieldDefinitions = {
            'Global Entities': [
                { name: 'RGID', type: 'singleLineText', description: 'Rensto Global ID for unique entity identification' },
                {
                    name: 'Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Customer' }, { name: 'Integration' }, { name: 'Operation' }, { name: 'Asset' }
                        ]
                    }
                },
                { name: 'Description', type: 'multilineText', description: 'Detailed entity description' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Archived' }, { name: 'Experimental' }
                        ]
                    }
                },
                {
                    name: 'Created At', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Updated At', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Created By', type: 'singleLineText' },
                { name: 'Usage Count', type: 'number', options: { precision: 0 } },
                { name: 'Total Errors', type: 'number', options: { precision: 0 } },
                { name: 'AI Summary', type: 'multilineText' },
                { name: 'Duplicate Check', type: 'singleLineText' },
                { name: 'Notes', type: 'multilineText' }
            ],
            'External Identities': [
                { name: 'External ID', type: 'singleLineText', description: 'External system identifier' },
                {
                    name: 'System', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Stripe' }, { name: 'Webflow' }, { name: 'OpenAI' }, { name: 'n8n' }
                        ]
                    }
                },
                { name: 'External Key', type: 'singleLineText' },
                { name: 'Mapped Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Status', type: 'checkbox' },
                { name: 'Lookup Entity Name', type: 'singleLineText' },
                { name: 'Lookup Entity Type', type: 'singleLineText' },
                { name: 'Sync Status', type: 'singleLineText' },
                { name: 'Notes', type: 'multilineText' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToOperationsBase() {
        console.log('\n⚙️ Adding fields to Operations Base...');
        const baseId = this.bases['operations'];

        const fieldDefinitions = {
            'Idempotency Keys': [
                { name: 'Key', type: 'singleLineText', description: 'Unique idempotency key' },
                {
                    name: 'Operation Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Create' }, { name: 'Update' }, { name: 'Sync' }, { name: 'Deploy' }
                        ]
                    }
                },
                { name: 'Entity RGID', type: 'singleLineText' },
                {
                    name: 'Timestamp', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Pending' }, { name: 'Completed' }, { name: 'Failed' }
                        ]
                    }
                },
                { name: 'Operation Count', type: 'number', options: { precision: 0 } },
                { name: 'Duplicate Prevention', type: 'singleLineText' },
                { name: 'AI Operation Notes', type: 'multilineText' },
                { name: 'Error Message', type: 'multilineText' },
                { name: 'Retry Count', type: 'number', options: { precision: 0 } }
            ],
            'BMAD Projects': [
                { name: 'Project ID', type: 'autoNumber' },
                { name: 'Name', type: 'singleLineText' },
                {
                    name: 'Phase', type: 'multipleSelect', options: {
                        choices: [
                            { name: 'Build' }, { name: 'Measure' }, { name: 'Analyze' }, { name: 'Deploy' }
                        ]
                    }
                },
                { name: 'Description', type: 'multilineText' },
                { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Progress', type: 'singleLineText' },
                { name: 'Optimization Gaps', type: 'multilineText' },
                { name: 'Success Metrics', type: 'multilineText' },
                { name: 'Performance Score', type: 'number', options: { precision: 2 } },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Planning' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'On Hold' }
                        ]
                    }
                },
                { name: 'Notes', type: 'multilineText' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToAnalyticsBase() {
        console.log('\n📊 Adding fields to Analytics & Monitoring Base...');
        const baseId = this.bases['analytics'];

        const fieldDefinitions = {
            'Usage Tracking': [
                { name: 'Tracking ID', type: 'autoNumber' },
                { name: 'Entity RGID', type: 'singleLineText' },
                { name: 'Customer Link', type: 'singleLineText' },
                {
                    name: 'Timestamp', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Usage Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'API Call' }, { name: 'Sync' }, { name: 'Portal Access' }
                        ]
                    }
                },
                { name: 'Count', type: 'number', options: { precision: 0 } },
                { name: 'Total Usage', type: 'number', options: { precision: 0 } },
                { name: 'Per-Customer Usage', type: 'number', options: { precision: 0 } },
                { name: 'Trend', type: 'singleLineText' },
                { name: 'AI Insights', type: 'multilineText' },
                { name: 'Cost', type: 'currency', options: { precision: 2, symbol: '$' } }
            ],
            'Performance Metrics': [
                { name: 'Metric ID', type: 'autoNumber' },
                { name: 'Entity RGID', type: 'singleLineText' },
                {
                    name: 'Metric Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Latency' }, { name: 'Success Rate' }, { name: 'Cost' }
                        ]
                    }
                },
                { name: 'Value', type: 'number', options: { precision: 2 } },
                { name: 'Timestamp', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Average Latency', type: 'number', options: { precision: 2 } },
                { name: 'Success Rate', type: 'singleLineText' },
                { name: 'Threshold Alert', type: 'singleLineText' },
                { name: 'Target Value', type: 'number', options: { precision: 2 } },
                { name: 'Variance', type: 'number', options: { precision: 2 } },
                { name: 'Trend', type: 'singleLineText' },
                { name: 'Notes', type: 'multilineText' }
            ],
            'Error Logs': [
                { name: 'Error ID', type: 'autoNumber' },
                { name: 'Entity RGID', type: 'singleLineText' },
                {
                    name: 'Timestamp', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Error Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Sync Failure' }, { name: 'Duplicate Detected' }, { name: 'API Error' }
                        ]
                    }
                },
                { name: 'Description', type: 'multilineText' },
                {
                    name: 'Severity', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                        ]
                    }
                },
                { name: 'Error Count', type: 'number', options: { precision: 0 } },
                { name: 'Resolution Status', type: 'checkbox' },
                { name: 'AI Root Cause', type: 'multilineText' },
                { name: 'Resolution Notes', type: 'multilineText' },
                { name: 'Resolved By', type: 'singleLineText' },
                { name: 'Resolution Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToIntegrationsBase() {
        console.log('\n🔗 Adding fields to Integrations Base...');
        const baseId = this.bases['integrations'];

        const fieldDefinitions = {
            'MCP Servers': [
                { name: 'Server ID', type: 'singleLineText', description: 'Unique server identifier' },
                { name: 'Name', type: 'singleLineText' },
                {
                    name: 'Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'n8n' }, { name: 'Airtable' }, { name: 'Webflow' }
                        ]
                    }
                },
                { name: 'Description', type: 'multilineText' },
                { name: 'API Key', type: 'singleLineText' },
                { name: 'Health', type: 'singleLineText' },
                {
                    name: 'Last Sync', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Error' }
                        ]
                    }
                },
                { name: 'Error Count', type: 'number', options: { precision: 0 } },
                { name: 'Performance Metrics', type: 'multilineText' },
                { name: 'Notes', type: 'multilineText' }
            ],
            'External Services': [
                { name: 'Service ID', type: 'autoNumber' },
                { name: 'Name', type: 'singleLineText' },
                {
                    name: 'Provider', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Stripe' }, { name: 'OpenAI' }, { name: 'Cloudflare' }
                        ]
                    }
                },
                { name: 'Credentials', type: 'multilineText' },
                { name: 'Cost', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Total Cost', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Integration Status', type: 'checkbox' },
                { name: 'AI Optimization', type: 'multilineText' },
                {
                    name: 'Last Sync', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Usage Count', type: 'number', options: { precision: 0 } },
                { name: 'Error Rate', type: 'number', options: { precision: 2 } },
                { name: 'Notes', type: 'multilineText' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToBase(baseId, fieldDefinitions) {
        const tables = this.results.bases[Object.keys(this.bases).find(k => this.bases[k] === baseId)]?.tables || [];

        for (const table of tables) {
            const fields = fieldDefinitions[table.name];
            if (fields) {
                console.log(`  📋 Adding fields to ${table.name}...`);
                for (const field of fields) {
                    await this.addFieldToTable(baseId, table.id, field);
                }
            }
        }
    }

    async addFieldToTable(baseId, tableId, fieldDef) {
        try {
            const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
                name: fieldDef.name,
                type: fieldDef.type,
                description: fieldDef.description,
                ...(fieldDef.options && { options: fieldDef.options })
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Added field "${fieldDef.name}" (${fieldDef.type})`);

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

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/additional-bases-setup-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const setup = new AirtableAdditionalBasesSetup();
setup.setupAdditionalBases().catch(console.error);
