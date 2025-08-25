#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableCompleteSetup {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
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

    async completeSetup() {
        console.log('🚀 AIRTABLE COMPLETE SETUP');
        console.log('============================');
        console.log(`📋 Using base: Rensto (${this.renstoBaseId})`);
        
        try {
            // Step 1: Get current table structures
            await this.getCurrentTableStructures();
            
            // Step 2: Add fields to tables
            await this.addFieldsToTables();
            
            // Step 3: Migrate data
            await this.migrateData();
            
            // Step 4: Save results
            await this.saveResults();
            
            console.log('\n✅ AIRTABLE COMPLETE SETUP FINISHED!');
            console.log('🎯 Business data structure and data migration completed');
            console.log(`📊 Check your Airtable workspace: https://airtable.com/${this.renstoBaseId}`);
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async getCurrentTableStructures() {
        console.log('\n📊 Getting current table structures...');
        
        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases/${this.renstoBaseId}/tables`, {
                headers: this.headers
            });
            
            const tables = response.data.tables || [];
            console.log(`  ✅ Found ${tables.length} tables:`);
            
            tables.forEach(table => {
                console.log(`    - ${table.name} (${table.id})`);
                console.log(`      Fields: ${table.fields.map(f => f.name).join(', ')}`);
                
                this.results.tables[table.name] = {
                    id: table.id,
                    fields: table.fields.map(f => ({ name: f.name, type: f.type, id: f.id }))
                };
            });
            
        } catch (error) {
            console.error(`  ❌ Failed to get table structures: ${error.message}`);
            this.results.errors.push({ step: 'getTableStructures', error: error.message });
        }
    }

    async addFieldsToTables() {
        console.log('\n🏗️ Adding fields to tables...');
        
        const fieldDefinitions = {
            'Customers': [
                { name: 'Email', type: 'email' },
                { name: 'Phone', type: 'phoneNumber' },
                { name: 'Company', type: 'singleLineText' },
                { name: 'Status', type: 'singleSelect', options: { choices: [
                    { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' }
                ]}},
                { name: 'Notes', type: 'multilineText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Projects': [
                { name: 'Customer', type: 'singleLineText' },
                { name: 'Status', type: 'singleSelect', options: { choices: [
                    { name: 'Planning' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'On Hold' }
                ]}},
                { name: 'Start Date', type: 'date' },
                { name: 'End Date', type: 'date' },
                { name: 'Budget', type: 'currency' },
                { name: 'Description', type: 'multilineText' },
                { name: 'Priority', type: 'singleSelect', options: { choices: [
                    { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                ]}}
            ],
            'Invoices': [
                { name: 'Invoice Number', type: 'singleLineText' },
                { name: 'Customer', type: 'singleLineText' },
                { name: 'Project', type: 'singleLineText' },
                { name: 'Amount', type: 'currency' },
                { name: 'Status', type: 'singleSelect', options: { choices: [
                    { name: 'Draft' }, { name: 'Sent' }, { name: 'Paid' }, { name: 'Overdue' }
                ]}},
                { name: 'Issue Date', type: 'date' },
                { name: 'Due Date', type: 'date' },
                { name: 'Notes', type: 'multilineText' }
            ],
            'Tasks': [
                { name: 'Project', type: 'singleLineText' },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Status', type: 'singleSelect', options: { choices: [
                    { name: 'To Do' }, { name: 'In Progress' }, { name: 'Review' }, { name: 'Done' }
                ]}},
                { name: 'Priority', type: 'singleSelect', options: { choices: [
                    { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                ]}},
                { name: 'Due Date', type: 'date' },
                { name: 'Description', type: 'multilineText' }
            ]
        };

        for (const [tableName, fields] of Object.entries(fieldDefinitions)) {
            if (this.results.tables[tableName]) {
                console.log(`  📋 Adding fields to ${tableName}...`);
                await this.addFieldsToTable(tableName, fields);
            }
        }
    }

    async addFieldsToTable(tableName, fields) {
        const tableId = this.results.tables[tableName].id;
        
        for (const field of fields) {
            try {
                const response = await axios.post(`${this.baseUrl}/meta/bases/${this.renstoBaseId}/tables/${tableId}/fields`, {
                    name: field.name,
                    type: field.type,
                    ...(field.options && { options: field.options })
                }, {
                    headers: this.headers
                });
                
                console.log(`    ✅ Added field "${field.name}" to ${tableName}`);
                
                // Update our local table structure
                this.results.tables[tableName].fields.push({
                    name: field.name,
                    type: field.type,
                    id: response.data.id
                });
                
            } catch (error) {
                console.error(`    ❌ Failed to add field "${field.name}" to ${tableName}: ${error.message}`);
                this.results.errors.push({
                    step: 'addField',
                    table: tableName,
                    field: field.name,
                    error: error.message
                });
            }
        }
    }

    async migrateData() {
        console.log('\n📊 Migrating data to tables...');
        
        // Migrate data to each table
        await this.migrateCustomerData();
        await this.migrateProjectData();
        await this.migrateInvoiceData();
        await this.migrateTaskData();
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
                    'Name': 'Ben Ginati Podcast Automation',
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
                    'Name': 'Shelly Mizrahi Insurance CRM',
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
                    'Name': 'INV-2025-001',
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
                    'Name': 'INV-2025-002',
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
        console.log('  ✅ Migrating task data...');
        
        const tasks = [
            {
                fields: {
                    'Name': 'Set up podcast automation workflow',
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
                    'Name': 'Design CRM interface',
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
        const filename = `docs/airtable-migration/complete-setup-results-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const setup = new AirtableCompleteSetup();
setup.completeSetup().catch(console.error);
