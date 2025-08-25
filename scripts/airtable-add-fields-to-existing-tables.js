#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableAddFieldsToExistingTables {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // Base IDs and their existing table IDs
        this.bases = {
            'entities': {
                baseId: 'app9DhsrZ0VnuEH3t',
                tables: {
                    'Global Entities': 'tblyjH6tiW4vMvw46',
                    'External Identities': 'tblwVtFui8eHrkV47'
                }
            },
            'operations': {
                baseId: 'appCGexgpGPkMUPXF',
                tables: {
                    'Idempotency Keys': 'tblVC42de1P1K6or2',
                    'BMAD Projects': 'tblJj2hILjH2ciXjy'
                }
            },
            'analytics': {
                baseId: 'appOvDNYenyx7WITR',
                tables: {
                    'Usage Tracking': 'tblX93phi97sWf0Zj',
                    'Performance Metrics': 'tblVC42de1P1K6or2',
                    'Error Logs': 'tblJj2hILjH2ciXjy'
                }
            },
            'integrations': {
                baseId: 'app9oouVkvTkFjf3t',
                tables: {
                    'MCP Servers': 'tblJj2hILjH2ciXjy',
                    'External Services': 'tblVC42de1P1K6or2'
                }
            }
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: {},
            errors: []
        };
    }

    async addFieldsToAllTables() {
        console.log('🔧 ADDING FIELDS TO EXISTING TABLES');
        console.log('==================================');
        console.log('Adding comprehensive fields to existing tables...');

        try {
            await this.addFieldsToEntitiesTables();
            await this.addFieldsToOperationsTables();
            await this.addFieldsToAnalyticsTables();
            await this.addFieldsToIntegrationsTables();

            await this.saveResults();

            console.log('\n✅ FIELD ADDITION COMPLETED!');
            console.log('🎯 All tables enhanced with comprehensive fields');

        } catch (error) {
            console.error('❌ Field addition failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async addFieldsToEntitiesTables() {
        console.log('\n🏢 Adding fields to Entities Base...');
        const base = this.bases['entities'];

        // Global Entities table
        const globalEntitiesFields = [
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
        ];

        // External Identities table
        const externalIdentitiesFields = [
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
        ];

        await this.addFieldsToTable(base.baseId, base.tables['Global Entities'], globalEntitiesFields);
        await this.addFieldsToTable(base.baseId, base.tables['External Identities'], externalIdentitiesFields);
    }

    async addFieldsToOperationsTables() {
        console.log('\n⚙️ Adding fields to Operations Base...');
        const base = this.bases['operations'];

        // Idempotency Keys table
        const idempotencyKeysFields = [
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
        ];

        // BMAD Projects table
        const bmadProjectsFields = [
            { name: 'Project ID', type: 'autoNumber' },
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
        ];

        await this.addFieldsToTable(base.baseId, base.tables['Idempotency Keys'], idempotencyKeysFields);
        await this.addFieldsToTable(base.baseId, base.tables['BMAD Projects'], bmadProjectsFields);
    }

    async addFieldsToAnalyticsTables() {
        console.log('\n📊 Adding fields to Analytics & Monitoring Base...');
        const base = this.bases['analytics'];

        // Usage Tracking table
        const usageTrackingFields = [
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
        ];

        // Performance Metrics table
        const performanceMetricsFields = [
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
        ];

        // Error Logs table
        const errorLogsFields = [
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
        ];

        await this.addFieldsToTable(base.baseId, base.tables['Usage Tracking'], usageTrackingFields);
        await this.addFieldsToTable(base.baseId, base.tables['Performance Metrics'], performanceMetricsFields);
        await this.addFieldsToTable(base.baseId, base.tables['Error Logs'], errorLogsFields);
    }

    async addFieldsToIntegrationsTables() {
        console.log('\n🔗 Adding fields to Integrations Base...');
        const base = this.bases['integrations'];

        // MCP Servers table
        const mcpServersFields = [
            { name: 'Server ID', type: 'singleLineText', description: 'Unique server identifier' },
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
        ];

        // External Services table
        const externalServicesFields = [
            { name: 'Service ID', type: 'autoNumber' },
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
        ];

        await this.addFieldsToTable(base.baseId, base.tables['MCP Servers'], mcpServersFields);
        await this.addFieldsToTable(base.baseId, base.tables['External Services'], externalServicesFields);
    }

    async addFieldsToTable(baseId, tableId, fields) {
        console.log(`  📋 Adding ${fields.length} fields to table ${tableId}...`);

        for (const field of fields) {
            try {
                const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
                    name: field.name,
                    type: field.type,
                    description: field.description,
                    ...(field.options && { options: field.options })
                }, {
                    headers: this.headers
                });

                console.log(`    ✅ Added field "${field.name}" (${field.type})`);

            } catch (error) {
                console.error(`    ❌ Failed to add field "${field.name}": ${error.message}`);
                this.results.errors.push({
                    step: 'addField',
                    base: baseId,
                    table: tableId,
                    field: field.name,
                    error: error.message
                });
            }
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/add-fields-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const setup = new AirtableAddFieldsToExistingTables();
setup.addFieldsToAllTables().catch(console.error);
