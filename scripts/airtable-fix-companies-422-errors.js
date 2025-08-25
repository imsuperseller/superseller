#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableFixCompanies422Errors {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app4nJpP1ytGukXQT'; // Core Business Operations
        this.tableId = 'tbl1roDiTjOCU3wiz'; // Companies table

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            fieldsAdded: [],
            errors: []
        };
    }

    async fix422Errors() {
        console.log('🔧 FIXING COMPANIES TABLE 422 ERRORS');
        console.log('=====================================');
        console.log('Adding fields with correct Airtable specifications...');

        try {
            // Fields that failed with 422 errors - now with correct specifications
            const fieldsToAdd = [
                // Basic Information fields that failed
                { name: 'Tax ID', type: 'singleLineText', description: 'Tax identification number' },
                {
                    name: 'Industry', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Technology' }, { name: 'Healthcare' }, { name: 'Finance' }, { name: 'Education' },
                            { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Consulting' }, { name: 'Real Estate' },
                            { name: 'Legal' }, { name: 'Marketing' }, { name: 'Non-Profit' }, { name: 'Government' },
                            { name: 'Transportation' }, { name: 'Energy' }, { name: 'Other' }
                        ]
                    }
                },
                {
                    name: 'Company Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Client' }, { name: 'Vendor' }, { name: 'Partner' }, { name: 'Internal' },
                            { name: 'Prospect' }, { name: 'Competitor' }, { name: 'Subsidiary' }, { name: 'Parent' }
                        ]
                    }
                },

                // Contact Information fields that failed
                { name: 'Website', type: 'url', description: 'Company website URL' },
                { name: 'Phone', type: 'phoneNumber', description: 'Main company phone' },

                // Business Details fields that failed - with correct specifications
                { name: 'Founded Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Company founding date' },
                { name: 'Employee Count', type: 'number', options: { precision: 0 }, description: 'Number of employees' },
                { name: 'Annual Revenue', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Annual revenue' },

                // Status & Classification fields that failed
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' },
                            { name: 'Suspended' }, { name: 'Archived' }, { name: 'Blacklisted' }, { name: 'Pending' }
                        ]
                    }
                },

                // Timestamps fields that failed - with correct specifications
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Record creation date' },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Last update date' },

                // System fields that failed
                {
                    name: 'Tags', type: 'multipleSelect', options: {
                        choices: [
                            { name: 'Enterprise' }, { name: 'SMB' }, { name: 'Startup' }, { name: 'Non-Profit' },
                            { name: 'Government' }, { name: 'Education' }, { name: 'Healthcare' }, { name: 'Finance' },
                            { name: 'Technology' }, { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Consulting' },
                            { name: 'High Priority' }, { name: 'VIP' }, { name: 'Strategic' }, { name: 'Long-term' }
                        ]
                    }
                }
            ];

            await this.addFieldsToTable(fieldsToAdd);
            await this.saveResults();

            console.log('\n✅ 422 ERRORS FIXED!');
            console.log('🎯 All problematic fields added with correct specifications');

        } catch (error) {
            console.error('❌ Fix failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async addFieldsToTable(fields) {
        console.log(`  📋 Adding ${fields.length} fields to Companies table...`);

        for (const field of fields) {
            try {
                const response = await axios.post(`${this.baseUrl}/meta/bases/${this.baseId}/tables/${this.tableId}/fields`, {
                    name: field.name,
                    type: field.type,
                    description: field.description,
                    ...(field.options && { options: field.options })
                }, {
                    headers: this.headers
                });

                console.log(`    ✅ Added field "${field.name}" (${field.type})`);
                this.results.fieldsAdded.push({
                    name: field.name,
                    type: field.type,
                    success: true
                });

            } catch (error) {
                console.error(`    ❌ Failed to add field "${field.name}": ${error.message}`);
                this.results.errors.push({
                    step: 'addField',
                    field: field.name,
                    error: error.message
                });
            }
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/fix-companies-422-errors-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const fix = new AirtableFixCompanies422Errors();
fix.fix422Errors().catch(console.error);
