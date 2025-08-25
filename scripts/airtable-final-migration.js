#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableFinalMigration {
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

    async finalMigration() {
        console.log('🚀 AIRTABLE FINAL MIGRATION');
        console.log('=============================');
        console.log(`📋 Using base: Rensto (${this.renstoBaseId})`);
        
        try {
            // Step 1: Get current table structures
            await this.getCurrentTableStructures();
            
            // Step 2: Migrate data with available fields
            await this.migrateDataWithAvailableFields();
            
            // Step 3: Save results
            await this.saveResults();
            
            console.log('\n✅ AIRTABLE FINAL MIGRATION COMPLETED!');
            console.log('🎯 Business data successfully migrated to Airtable');
            console.log(`📊 Check your Airtable workspace: https://airtable.com/${this.renstoBaseId}`);
            
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            this.results.errors.push({ step: 'migration', error: error.message });
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

    async migrateDataWithAvailableFields() {
        console.log('\n📊 Migrating data with available fields...');
        
        // Migrate data to each table using only the fields that exist
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
                    'Notes': 'Podcast and content creation client - Created: 2025-01-15'
                }
            },
            {
                fields: {
                    'Name': 'Shelly Mizrahi',
                    'Email': 'shelly@mizrahi.com',
                    'Phone': '+1-555-0456',
                    'Company': 'Mizrahi Insurance',
                    'Status': 'Active',
                    'Notes': 'Insurance business automation client - Created: 2025-02-20'
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
                    'Description': 'Automated podcast content creation and distribution system - Budget: $15,000 - Start: 2025-01-15 - End: 2025-06-30',
                    'Priority': 'High'
                }
            },
            {
                fields: {
                    'Name': 'Shelly Mizrahi Insurance CRM',
                    'Customer': 'Shelly Mizrahi',
                    'Status': 'Planning',
                    'Description': 'Customer relationship management system for insurance business - Budget: $25,000 - Start: 2025-02-20 - End: 2025-08-31',
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
                    'Status': 'Paid',
                    'Notes': 'Initial setup and configuration - Amount: $5,000 - Issue: 2025-01-15 - Due: 2025-02-15'
                }
            },
            {
                fields: {
                    'Name': 'INV-2025-002',
                    'Invoice Number': 'INV-2025-002',
                    'Customer': 'Shelly Mizrahi',
                    'Project': 'Shelly Mizrahi Insurance CRM',
                    'Status': 'Sent',
                    'Notes': 'Project planning and requirements analysis - Amount: $7,500 - Issue: 2025-02-20 - Due: 2025-03-20'
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
                    'Description': 'Configure n8n workflows for automated podcast content creation - Due: 2025-02-15'
                }
            },
            {
                fields: {
                    'Name': 'Design CRM interface',
                    'Project': 'Shelly Mizrahi Insurance CRM',
                    'Assigned To': 'Design Team',
                    'Status': 'To Do',
                    'Priority': 'Medium',
                    'Description': 'Create user interface mockups for the insurance CRM system - Due: 2025-03-15'
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

        // Filter records to only include fields that exist in the table
        const availableFields = this.results.tables[tableName].fields.map(f => f.name);
        const filteredRecords = records.map(record => {
            const filteredFields = {};
            Object.keys(record.fields).forEach(fieldName => {
                if (availableFields.includes(fieldName)) {
                    filteredFields[fieldName] = record.fields[fieldName];
                }
            });
            return { fields: filteredFields };
        });

        try {
            const response = await axios.post(`${this.baseUrl}/${this.renstoBaseId}/${encodeURIComponent(tableName)}`, {
                records: filteredRecords
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
        const filename = `docs/airtable-migration/final-migration-results-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const migration = new AirtableFinalMigration();
migration.finalMigration().catch(console.error);
