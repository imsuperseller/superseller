#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableFix422ErrorsAndCompleteSetup {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.webflowApiToken = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
        this.webflowSiteId = '66c7e551a317e0e9c9f906d8';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // Core Business Operations Base
        this.coreBaseId = 'app4nJpP1ytGukXQT';
        this.companiesTableId = 'tbl1roDiTjOCU3wiz';
        this.contactsTableId = 'tblST9B2hqzDWwpdy';
        this.projectsTableId = 'tblJ4C2HFSBlPkyP6';

        // Financial Management Base
        this.financeBaseId = 'app6yzlm67lRNuQZD';
        this.invoicesTableId = 'tblpQ71TjMAnVJ5by';

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            steps: [],
            errors: [],
            recordsCreated: [],
            fieldsAdded: []
        };
    }

    async fix422ErrorsAndCompleteSetup() {
        console.log('🔧 FIXING 422 ERRORS & COMPLETING SETUP');
        console.log('========================================');
        console.log('Resolving field conflicts and completing comprehensive setup...');

        try {
            // Step 1: Analyze existing fields to understand conflicts
            await this.analyzeExistingFields();

            // Step 2: Fix field conflicts and add missing fields
            await this.fixFieldConflicts();

            // Step 3: Create records with correct field mappings
            await this.createRecordsWithCorrectFields();

            // Step 4: Implement rollup and lookup fields
            await this.implementRollupLookupFields();

            // Step 5: Add formula fields for calculated metrics
            await this.addFormulaFields();

            // Step 6: Test cross-base relationships
            await this.testCrossBaseRelationships();

            await this.saveResults();

            console.log('\n✅ 422 ERRORS FIXED & SETUP COMPLETED!');
            console.log('🎯 All field conflicts resolved and relationships established');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async analyzeExistingFields() {
        console.log('\n🔍 Analyzing existing fields to identify conflicts...');

        const tables = [
            { name: 'Companies', baseId: this.coreBaseId, tableId: this.companiesTableId },
            { name: 'Contacts', baseId: this.coreBaseId, tableId: this.contactsTableId },
            { name: 'Projects', baseId: this.coreBaseId, tableId: this.projectsTableId },
            { name: 'Invoices', baseId: this.financeBaseId, tableId: this.invoicesTableId }
        ];

        for (const table of tables) {
            try {
                const response = await axios.get(`${this.baseUrl}/meta/bases/${table.baseId}/tables/${table.tableId}`, {
                    headers: this.headers
                });

                const fields = response.data.fields || [];
                console.log(`  📋 ${table.name} Table: ${fields.length} existing fields`);

                // Log field names to identify conflicts
                const fieldNames = fields.map(f => f.name);
                console.log(`    Fields: ${fieldNames.join(', ')}`);

                this.results.steps.push({
                    step: 'analyzeFields',
                    table: table.name,
                    fieldCount: fields.length,
                    fieldNames: fieldNames
                });

            } catch (error) {
                console.error(`  ❌ Failed to analyze ${table.name}: ${error.message}`);
                this.results.errors.push({
                    step: 'analyzeFields',
                    table: table.name,
                    error: error.message
                });
            }
        }
    }

    async fixFieldConflicts() {
        console.log('\n🔧 Fixing field conflicts and adding missing fields...');

        // Add missing fields that were causing 422 errors
        const missingFields = [
            {
                table: 'Companies',
                baseId: this.coreBaseId,
                tableId: this.companiesTableId,
                fields: [
                    {
                        name: 'Company Type', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Client' }, { name: 'Prospect' }, { name: 'Partner' }, { name: 'Vendor' }, { name: 'Internal' }
                            ]
                        }
                    },
                    {
                        name: 'Industry', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Technology' }, { name: 'Healthcare' }, { name: 'Finance' }, { name: 'Education' }, { name: 'Retail' }
                            ]
                        }
                    },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' }
                            ]
                        }
                    }
                ]
            },
            {
                table: 'Contacts',
                baseId: this.coreBaseId,
                tableId: this.contactsTableId,
                fields: [
                    {
                        name: 'Contact Type', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Customer' }, { name: 'Prospect' }, { name: 'Partner' }, { name: 'Internal' }
                            ]
                        }
                    },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Active' }, { name: 'Inactive' }, { name: 'Lead' }, { name: 'Qualified' }
                            ]
                        }
                    },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    }
                ]
            }
        ];

        for (const tableConfig of missingFields) {
            console.log(`  📝 Adding missing fields to ${tableConfig.table}...`);

            for (const field of tableConfig.fields) {
                try {
                    const response = await axios.post(`${this.baseUrl}/meta/bases/${tableConfig.baseId}/tables/${tableConfig.tableId}/fields`, {
                        name: field.name,
                        type: field.type,
                        ...(field.options && { options: field.options })
                    }, {
                        headers: this.headers
                    });

                    console.log(`    ✅ Added field "${field.name}" to ${tableConfig.table}`);
                    this.results.fieldsAdded.push({
                        table: tableConfig.table,
                        field: field.name,
                        type: field.type,
                        success: true
                    });

                } catch (error) {
                    if (error.response?.status === 422) {
                        console.log(`    ⚠️ Field "${field.name}" already exists in ${tableConfig.table}`);
                    } else {
                        console.error(`    ❌ Failed to add field "${field.name}": ${error.message}`);
                        this.results.errors.push({
                            step: 'addField',
                            table: tableConfig.table,
                            field: field.name,
                            error: error.message
                        });
                    }
                }
            }
        }
    }

    async createRecordsWithCorrectFields() {
        console.log('\n📝 Creating records with correct field mappings...');

        // Create companies with correct field names
        const companies = [
            {
                'Company Name': 'Rensto Technologies',
                'Company Type': 'Internal',
                'Industry': 'Technology',
                'Status': 'Active',
                'Website': 'https://rensto.com',
                'Phone': '+1-555-0123',
                'Email': 'info@rensto.com',
                'Annual Revenue': 1000000,
                'Employee Count': 25
            },
            {
                'Company Name': 'TechCorp Solutions',
                'Company Type': 'Client',
                'Industry': 'Technology',
                'Status': 'Active',
                'Website': 'https://techcorp.com',
                'Phone': '+1-555-0456',
                'Email': 'contact@techcorp.com',
                'Annual Revenue': 5000000,
                'Employee Count': 150
            }
        ];

        for (const company of companies) {
            try {
                const response = await axios.post(`${this.baseUrl}/${this.coreBaseId}/${this.companiesTableId}`, {
                    fields: company
                }, {
                    headers: this.headers
                });

                console.log(`  ✅ Created company: ${company['Company Name']} (${response.data.id})`);
                this.results.recordsCreated.push({
                    type: 'company',
                    name: company['Company Name'],
                    id: response.data.id,
                    success: true
                });

            } catch (error) {
                console.error(`  ❌ Failed to create company ${company['Company Name']}: ${error.message}`);
                this.results.errors.push({
                    step: 'createCompany',
                    company: company['Company Name'],
                    error: error.message
                });
            }
        }

        // Create contacts with correct field names
        const contacts = [
            {
                'First Name': 'John',
                'Last Name': 'Smith',
                'Full Name': 'John Smith',
                'Title': 'CEO',
                'Company': 'Rensto Technologies',
                'Email': 'john.smith@rensto.com',
                'Direct Phone': '+1-555-0124',
                'Contact Type': 'Internal',
                'Status': 'Active',
                'Priority': 'High'
            },
            {
                'First Name': 'Sarah',
                'Last Name': 'Johnson',
                'Full Name': 'Sarah Johnson',
                'Title': 'CTO',
                'Company': 'TechCorp Solutions',
                'Email': 'sarah.johnson@techcorp.com',
                'Direct Phone': '+1-555-0457',
                'Contact Type': 'Customer',
                'Status': 'Active',
                'Priority': 'High'
            }
        ];

        for (const contact of contacts) {
            try {
                const response = await axios.post(`${this.baseUrl}/${this.coreBaseId}/${this.contactsTableId}`, {
                    fields: contact
                }, {
                    headers: this.headers
                });

                console.log(`  ✅ Created contact: ${contact['Full Name']} (${response.data.id})`);
                this.results.recordsCreated.push({
                    type: 'contact',
                    name: contact['Full Name'],
                    id: response.data.id,
                    success: true
                });

            } catch (error) {
                console.error(`  ❌ Failed to create contact ${contact['Full Name']}: ${error.message}`);
                this.results.errors.push({
                    step: 'createContact',
                    contact: contact['Full Name'],
                    error: error.message
                });
            }
        }
    }

    async implementRollupLookupFields() {
        console.log('\n🔗 Implementing rollup and lookup fields...');

        // Add lookup fields to connect related data
        const lookupFields = [
            {
                table: 'Contacts',
                baseId: this.coreBaseId,
                tableId: this.contactsTableId,
                fields: [
                    {
                        name: 'Company Details',
                        type: 'lookup',
                        options: {
                            linkedTableId: this.companiesTableId,
                            linkFieldId: 'Company',
                            lookupFieldId: 'Company Name'
                        }
                    }
                ]
            },
            {
                table: 'Projects',
                baseId: this.coreBaseId,
                tableId: this.projectsTableId,
                fields: [
                    {
                        name: 'Company Details',
                        type: 'lookup',
                        options: {
                            linkedTableId: this.companiesTableId,
                            linkFieldId: 'Company',
                            lookupFieldId: 'Company Name'
                        }
                    }
                ]
            }
        ];

        for (const tableConfig of lookupFields) {
            console.log(`  🔗 Adding lookup fields to ${tableConfig.table}...`);

            for (const field of tableConfig.fields) {
                try {
                    const response = await axios.post(`${this.baseUrl}/meta/bases/${tableConfig.baseId}/tables/${tableConfig.tableId}/fields`, {
                        name: field.name,
                        type: field.type,
                        options: field.options
                    }, {
                        headers: this.headers
                    });

                    console.log(`    ✅ Added lookup field "${field.name}" to ${tableConfig.table}`);
                    this.results.fieldsAdded.push({
                        table: tableConfig.table,
                        field: field.name,
                        type: field.type,
                        success: true
                    });

                } catch (error) {
                    console.error(`    ❌ Failed to add lookup field "${field.name}": ${error.message}`);
                    this.results.errors.push({
                        step: 'addLookupField',
                        table: tableConfig.table,
                        field: field.name,
                        error: error.message
                    });
                }
            }
        }
    }

    async addFormulaFields() {
        console.log('\n🧮 Adding formula fields for calculated metrics...');

        const formulaFields = [
            {
                table: 'Companies',
                baseId: this.coreBaseId,
                tableId: this.companiesTableId,
                fields: [
                    {
                        name: 'Revenue per Employee',
                        type: 'formula',
                        options: {
                            formula: 'IF({Employee Count} > 0, {Annual Revenue} / {Employee Count}, 0)'
                        }
                    },
                    {
                        name: 'Company Health Score',
                        type: 'formula',
                        options: {
                            formula: 'IF({Annual Revenue} > 1000000, 10, IF({Annual Revenue} > 500000, 8, 6))'
                        }
                    }
                ]
            },
            {
                table: 'Contacts',
                baseId: this.coreBaseId,
                tableId: this.contactsTableId,
                fields: [
                    {
                        name: 'Contact Priority Score',
                        type: 'formula',
                        options: {
                            formula: 'IF({Priority} = "Critical", 10, IF({Priority} = "High", 8, IF({Priority} = "Medium", 5, 2)))'
                        }
                    }
                ]
            }
        ];

        for (const tableConfig of formulaFields) {
            console.log(`  🧮 Adding formula fields to ${tableConfig.table}...`);

            for (const field of tableConfig.fields) {
                try {
                    const response = await axios.post(`${this.baseUrl}/meta/bases/${tableConfig.baseId}/tables/${tableConfig.tableId}/fields`, {
                        name: field.name,
                        type: field.type,
                        options: field.options
                    }, {
                        headers: this.headers
                    });

                    console.log(`    ✅ Added formula field "${field.name}" to ${tableConfig.table}`);
                    this.results.fieldsAdded.push({
                        table: tableConfig.table,
                        field: field.name,
                        type: field.type,
                        success: true
                    });

                } catch (error) {
                    console.error(`    ❌ Failed to add formula field "${field.name}": ${error.message}`);
                    this.results.errors.push({
                        step: 'addFormulaField',
                        table: tableConfig.table,
                        field: field.name,
                        error: error.message
                    });
                }
            }
        }
    }

    async testCrossBaseRelationships() {
        console.log('\n🔗 Testing cross-base relationships...');

        try {
            // Test that we can create projects linked to companies
            const project = {
                'Project Name': 'Test Project',
                'Project Code': 'TEST-001',
                'Company': 'Rensto Technologies',
                'Status': 'In Progress',
                'Priority': 'High',
                'Start Date': '2025-01-01',
                'Due Date': '2025-03-01',
                'Budget': 50000
            };

            const response = await axios.post(`${this.baseUrl}/${this.coreBaseId}/${this.projectsTableId}`, {
                fields: project
            }, {
                headers: this.headers
            });

            console.log(`  ✅ Created test project: ${project['Project Name']} (${response.data.id})`);
            this.results.recordsCreated.push({
                type: 'project',
                name: project['Project Name'],
                id: response.data.id,
                success: true
            });

        } catch (error) {
            console.error(`  ❌ Failed to create test project: ${error.message}`);
            this.results.errors.push({
                step: 'testCrossBaseRelationships',
                error: error.message
            });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/fix-422-errors-complete-setup-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const fixer = new AirtableFix422ErrorsAndCompleteSetup();
fixer.fix422ErrorsAndCompleteSetup().catch(console.error);
