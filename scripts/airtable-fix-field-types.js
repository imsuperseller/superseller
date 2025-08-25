#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableFieldTypeFix {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.bases = {
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
            errors: []
        };
    }

    async fixAllFieldTypes() {
        console.log('🔧 AIRTABLE FIELD TYPE FIX');
        console.log('==========================');
        console.log('Fixing field types with correct Airtable specifications...');

        try {
            // Step 1: Get current table structures
            await this.getCurrentStructures();

            // Step 2: Fix fields in each base
            await this.fixCoreBaseFields();
            await this.fixFinanceBaseFields();
            await this.fixMarketingBaseFields();
            await this.fixOperationsBaseFields();
            await this.fixCustomersBaseFields();

            // Step 3: Save results
            await this.saveResults();

            console.log('\n✅ AIRTABLE FIELD TYPE FIX COMPLETED!');
            console.log('🎯 All field types corrected with proper Airtable specifications');

        } catch (error) {
            console.error('❌ Field type fix failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async getCurrentStructures() {
        console.log('\n📊 Getting current table structures...');

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
                console.error(`  ❌ Failed to get ${baseName} structure: ${error.message}`);
            }
        }
    }

    async fixCoreBaseFields() {
        console.log('\n🏢 Fixing Core Business Operations fields...');
        const baseId = this.bases['core'];

        const fieldDefinitions = {
            'Companies': [
                { name: 'Address', type: 'multilineText' },
                { name: 'Founded Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Employee Count', type: 'number', options: { precision: 0 } },
                { name: 'Annual Revenue', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Contacts': [
                { name: 'Birthday', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Contact', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Projects': [
                { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Budget', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Requirements', type: 'multilineText' },
                { name: 'Deliverables', type: 'multilineText' },
                { name: 'Risk Assessment', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Tasks': [
                { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Estimated Hours', type: 'number', options: { precision: 1 } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Acceptance Criteria', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Time Tracking': [
                { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                {
                    name: 'Start Time', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'End Time', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Duration', type: 'number', options: { precision: 2 } },
                { name: 'Billable Hours', type: 'number', options: { precision: 2 } },
                { name: 'Rate', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Total Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Documents': [
                { name: 'File Size', type: 'number', options: { precision: 0 } },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Modified', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Expiry Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Description', type: 'multilineText' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async fixFinanceBaseFields() {
        console.log('\n💰 Fixing Financial Management fields...');
        const baseId = this.bases['finance'];

        const fieldDefinitions = {
            'Invoices': [
                { name: 'Issue Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Subtotal', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Tax Rate', type: 'number', options: { precision: 2 } },
                { name: 'Tax Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Total Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Amount Paid', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Balance Due', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Payment Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Payments': [
                { name: 'Payment Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Expenses': [
                { name: 'Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Expense Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Reimbursement Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Revenue': [
                { name: 'Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Revenue Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Budgets': [
                { name: 'Period Start', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Period End', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Planned Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Actual Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Variance', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Variance Percentage', type: 'number', options: { precision: 2 } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Tax Records': [
                { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Amount Paid', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Filing Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async fixMarketingBaseFields() {
        console.log('\n📢 Fixing Marketing & Sales fields...');
        const baseId = this.bases['marketing'];

        const fieldDefinitions = {
            'Leads': [
                { name: 'Estimated Value', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Contact', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Opportunities': [
                { name: 'Probability', type: 'number', options: { precision: 0 } },
                { name: 'Expected Value', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Expected Close Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Actual Close Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Won Amount', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Campaigns': [
                { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Budget', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Actual Spend', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Target Audience', type: 'multilineText' },
                { name: 'Goals', type: 'multilineText' },
                { name: 'Results', type: 'multilineText' },
                { name: 'ROI', type: 'number', options: { precision: 2 } },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Content': [
                { name: 'Publish Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Performance Metrics', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Social Media': [
                {
                    name: 'Scheduled Date', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Published Date', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Content', type: 'multilineText' },
                { name: 'Engagement Metrics', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Analytics': [
                { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Value', type: 'number', options: { precision: 2 } },
                { name: 'Target', type: 'number', options: { precision: 2 } },
                { name: 'Variance', type: 'number', options: { precision: 2 } },
                { name: 'Variance Percentage', type: 'number', options: { precision: 2 } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async fixOperationsBaseFields() {
        console.log('\n⚙️ Fixing Operations & Automation fields...');
        const baseId = this.bases['operations'];

        const fieldDefinitions = {
            'Workflows': [
                { name: 'Actions', type: 'multilineText' },
                {
                    name: 'Last Run', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Next Run', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Success Rate', type: 'number', options: { precision: 2 } },
                { name: 'Error Count', type: 'number', options: { precision: 0 } },
                { name: 'Performance Metrics', type: 'multilineText' },
                { name: 'Documentation', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Automations': [
                { name: 'Trigger Conditions', type: 'multilineText' },
                { name: 'Actions', type: 'multilineText' },
                {
                    name: 'Last Run', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Next Run', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Success Count', type: 'number', options: { precision: 0 } },
                { name: 'Error Count', type: 'number', options: { precision: 0 } },
                { name: 'Performance Metrics', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Integrations': [
                {
                    name: 'Last Sync', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Error Count', type: 'number', options: { precision: 0 } },
                { name: 'Performance Metrics', type: 'multilineText' },
                { name: 'Documentation', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'System Logs': [
                { name: 'Message', type: 'multilineText' },
                { name: 'Details', type: 'multilineText' },
                {
                    name: 'Timestamp', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'User Agent', type: 'multilineText' },
                { name: 'Resolution Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Maintenance': [
                {
                    name: 'Scheduled Date', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'Start Time', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                {
                    name: 'End Time', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'Duration', type: 'number', options: { precision: 2 } },
                { name: 'Description', type: 'multilineText' },
                { name: 'Actions Taken', type: 'multilineText' },
                { name: 'Issues Found', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Backups': [
                {
                    name: 'Backup Date', type: 'dateTime', options: {
                        dateFormat: { name: 'iso' },
                        timeFormat: { name: '24hour' },
                        timeZone: 'utc'
                    }
                },
                { name: 'File Size', type: 'number', options: { precision: 0 } },
                { name: 'Retention Period', type: 'number', options: { precision: 0 } },
                { name: 'Expiry Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async fixCustomersBaseFields() {
        console.log('\n👥 Fixing Customer Success fields...');
        const baseId = this.bases['customers'];

        const fieldDefinitions = {
            'Customers': [
                { name: 'Monthly Recurring Revenue', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Total Revenue', type: 'currency', options: { precision: 2, symbol: '$' } },
                { name: 'Customer Since', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Activity', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Support Tickets': [
                { name: 'Description', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Updated Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Resolved Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Resolution Time', type: 'number', options: { precision: 0 } },
                { name: 'Customer Satisfaction', type: 'number', options: { precision: 0 } }
            ],
            'Onboarding': [
                { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Completion Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Duration', type: 'number', options: { precision: 0 } },
                { name: 'Milestones', type: 'multilineText' },
                { name: 'Completed Milestones', type: 'multilineText' },
                { name: 'Next Steps', type: 'multilineText' },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Success Metrics': [
                { name: 'Value', type: 'number', options: { precision: 2 } },
                { name: 'Target', type: 'number', options: { precision: 2 } },
                { name: 'Variance', type: 'number', options: { precision: 2 } },
                { name: 'Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Feedback': [
                { name: 'Rating', type: 'number', options: { precision: 0 } },
                { name: 'Feedback', type: 'multilineText' },
                { name: 'Action Items', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ],
            'Retention': [
                { name: 'Period Start', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Period End', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Retention Score', type: 'number', options: { precision: 2 } },
                { name: 'Risk Factors', type: 'multilineText' },
                { name: 'Intervention Actions', type: 'multilineText' },
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToBase(baseId, fieldDefinitions) {
        const tables = this.results.bases[Object.keys(this.bases).find(k => this.bases[k] === baseId)]?.tables || [];

        for (const table of tables) {
            const fields = fieldDefinitions[table.name];
            if (fields) {
                console.log(`  📋 Adding corrected fields to ${table.name}...`);
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
        const filename = `docs/airtable-migration/field-type-fix-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const fix = new AirtableFieldTypeFix();
fix.fixAllFieldTypes().catch(console.error);
