#!/usr/bin/env node

/**
 * Enhance Airtable Base with Advanced Features
 * Adds linked records, formulas, rollups, and lookups to the original base
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        baseId: 'appQijHhqqP4z6wGe' // Original base
    }
};

class AirtableEnhancer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            added: {},
            errors: {},
            summary: {
                total: 0,
                added: 0,
                failed: 0
            }
        };
    }

    async addField(tableName, fieldData) {
        try {
            const response = await axios.post(
                `https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables/${tableName}/fields`,
                fieldData,
                {
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.results.added[tableName] = this.results.added[tableName] || [];
            this.results.added[tableName].push(response.data);
            this.results.summary.added++;

            console.log(`✅ Added field to ${tableName}: ${fieldData.name}`);
            return response.data;
        } catch (error) {
            this.results.errors[tableName] = this.results.errors[tableName] || [];
            this.results.errors[tableName].push({ fieldData, error: error.message });
            this.results.summary.failed++;

            console.log(`❌ Failed to add field to ${tableName}: ${error.message}`);
            if (error.response) {
                console.log(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
            }
            throw error;
        }
    }

    async enhanceCustomersTable() {
        console.log('\n👥 Enhancing Customers Table...');

        // Get table ID first
        const tablesResponse = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables`, {
            headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
        });

        const customersTable = tablesResponse.data.tables.find(t => t.name === 'Customers');
        if (!customersTable) {
            console.log('❌ Customers table not found');
            return;
        }

        const tableId = customersTable.id;

        // Add linked record field for projects
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Projects',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tblNopy7xK0IUYf8E', // Projects table ID
                isReversed: false,
                prefersSingleRecordLink: false,
                inverseLinkFieldId: 'Customers'
            }
        });

        // Add formula field for project count
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Count',
            type: 'formula',
            options: {
                formula: 'COUNT({Projects})'
            }
        });

        // Add formula field for total project value
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Total Project Value',
            type: 'formula',
            options: {
                formula: 'SUM({Projects}, "Budget")'
            }
        });

        // Add rollup field for active projects
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Active Projects',
            type: 'rollup',
            options: {
                linkedTableId: 'tblNopy7xK0IUYf8E', // Projects table ID
                fieldIdInLinkedTable: 'Status',
                fieldId: 'Status',
                recordLinkFieldId: 'Projects',
                isReversed: false
            }
        });
    }

    async enhanceProjectsTable() {
        console.log('\n📋 Enhancing Projects Table...');

        const tablesResponse = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables`, {
            headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
        });

        const projectsTable = tablesResponse.data.tables.find(t => t.name === 'Projects');
        if (!projectsTable) {
            console.log('❌ Projects table not found');
            return;
        }

        const tableId = projectsTable.id;

        // Add linked record field for customers
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Customer Link',
            type: 'singleRecordLink',
            options: {
                linkedTableId: 'tbl6BMipQQPJvPIWw', // Customers table ID
                isReversed: false,
                inverseLinkFieldId: 'Projects'
            }
        });

        // Add lookup field for customer email
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Customer Email',
            type: 'lookup',
            options: {
                fieldIdInLinkedTable: 'Email',
                recordLinkFieldId: 'Customer Link',
                isReversed: false
            }
        });

        // Add lookup field for customer phone
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Customer Phone',
            type: 'lookup',
            options: {
                fieldIdInLinkedTable: 'Phone',
                recordLinkFieldId: 'Customer Link',
                isReversed: false
            }
        });

        // Add linked record field for tasks
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Tasks',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tblUO4nQyDEXJ2jGu', // Tasks table ID
                isReversed: false,
                prefersSingleRecordLink: false,
                inverseLinkFieldId: 'Project'
            }
        });

        // Add rollup field for task count
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Task Count',
            type: 'rollup',
            options: {
                linkedTableId: 'tblUO4nQyDEXJ2jGu', // Tasks table ID
                fieldIdInLinkedTable: 'Name',
                fieldId: 'Name',
                recordLinkFieldId: 'Tasks',
                isReversed: false
            }
        });

        // Add rollup field for completed tasks
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Completed Tasks',
            type: 'rollup',
            options: {
                linkedTableId: 'tblUO4nQyDEXJ2jGu', // Tasks table ID
                fieldIdInLinkedTable: 'Status',
                fieldId: 'Status',
                recordLinkFieldId: 'Tasks',
                isReversed: false
            }
        });

        // Add formula field for completion percentage
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Completion %',
            type: 'formula',
            options: {
                formula: 'IF({Task Count} > 0, (COUNT({Completed Tasks}) / {Task Count}) * 100, 0)'
            }
        });
    }

    async enhanceTasksTable() {
        console.log('\n✅ Enhancing Tasks Table...');

        const tablesResponse = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables`, {
            headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
        });

        const tasksTable = tablesResponse.data.tables.find(t => t.name === 'Tasks');
        if (!tasksTable) {
            console.log('❌ Tasks table not found');
            return;
        }

        const tableId = tasksTable.id;

        // Add linked record field for project
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Link',
            type: 'singleRecordLink',
            options: {
                linkedTableId: 'tblNopy7xK0IUYf8E', // Projects table ID
                isReversed: false,
                inverseLinkFieldId: 'Tasks'
            }
        });

        // Add lookup field for project name
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Name',
            type: 'lookup',
            options: {
                fieldIdInLinkedTable: 'Name',
                recordLinkFieldId: 'Project Link',
                isReversed: false
            }
        });

        // Add lookup field for project priority
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Priority',
            type: 'lookup',
            options: {
                fieldIdInLinkedTable: 'Priority',
                recordLinkFieldId: 'Project Link',
                isReversed: false
            }
        });

        // Add formula field for priority score
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Priority Score',
            type: 'formula',
            options: {
                formula: 'SWITCH({Priority}, "Critical", 4, "High", 3, "Medium", 2, "Low", 1, 0)'
            }
        });

        // Add formula field for status color
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Status Color',
            type: 'formula',
            options: {
                formula: 'SWITCH({Status}, "Done", "Green", "In Progress", "Blue", "Review", "Yellow", "To Do", "Gray", "Gray")'
            }
        });
    }

    async enhanceInvoicesTable() {
        console.log('\n💰 Enhancing Invoices Table...');

        const tablesResponse = await axios.get(`https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables`, {
            headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
        });

        const invoicesTable = tablesResponse.data.tables.find(t => t.name === 'Invoices');
        if (!invoicesTable) {
            console.log('❌ Invoices table not found');
            return;
        }

        const tableId = invoicesTable.id;

        // Add linked record field for customer
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Customer Link',
            type: 'singleRecordLink',
            options: {
                linkedTableId: 'tbl6BMipQQPJvPIWw', // Customers table ID
                isReversed: false,
                inverseLinkFieldId: 'Invoices'
            }
        });

        // Add linked record field for project
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Link',
            type: 'singleRecordLink',
            options: {
                linkedTableId: 'tblNopy7xK0IUYf8E', // Projects table ID
                isReversed: false,
                inverseLinkFieldId: 'Invoices'
            }
        });

        // Add lookup field for customer email
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Customer Email',
            type: 'lookup',
            options: {
                fieldIdInLinkedTable: 'Email',
                recordLinkFieldId: 'Customer Link',
                isReversed: false
            }
        });

        // Add lookup field for project name
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Name',
            type: 'lookup',
            options: {
                fieldIdInLinkedTable: 'Name',
                recordLinkFieldId: 'Project Link',
                isReversed: false
            }
        });

        // Add formula field for status indicator
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Status Indicator',
            type: 'formula',
            options: {
                formula: 'SWITCH({Status}, "Paid", "✅", "Sent", "📤", "Draft", "📝", "Overdue", "⚠️", "❓")'
            }
        });
    }

    async enhanceAllTables() {
        console.log('🚀 Starting Airtable Enhancement...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);

        try {
            await this.enhanceCustomersTable();
            await this.enhanceProjectsTable();
            await this.enhanceTasksTable();
            await this.enhanceInvoicesTable();

            // Calculate success rate
            const successRate = (this.results.summary.added / this.results.summary.total) * 100;

            console.log('\n📊 Enhancement Summary:');
            console.log(`Total Fields: ${this.results.summary.total}`);
            console.log(`Added: ${this.results.summary.added}`);
            console.log(`Failed: ${this.results.summary.failed}`);
            console.log(`Success Rate: ${successRate.toFixed(1)}%`);

            // Save results
            const resultsPath = path.join(__dirname, '../docs/airtable-enhancement-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Results saved to: ${resultsPath}`);

            if (successRate >= 80) {
                console.log('\n🎉 Enhancement SUCCESSFUL! Airtable now has advanced features.');
                return true;
            } else {
                console.log('\n⚠️ Enhancement PARTIALLY SUCCESSFUL. Some fields failed to add.');
                return false;
            }

        } catch (error) {
            console.error('\n❌ Enhancement FAILED:', error.message);
            return false;
        }
    }
}

// Run the enhancement
async function main() {
    const enhancer = new AirtableEnhancer();
    const success = await enhancer.enhanceAllTables();
    process.exit(success ? 0 : 1);
}

main().catch(console.error);
