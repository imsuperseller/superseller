#!/usr/bin/env node

/**
 * Simple Airtable Enhancement - Start with Formula Fields
 * Adds basic formula fields first, then we'll add linked records
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

class SimpleAirtableEnhancer {
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

    async addField(tableId, fieldData) {
        try {
            const response = await axios.post(
                `https://api.airtable.com/v0/meta/bases/${config.airtable.baseId}/tables/${tableId}/fields`,
                fieldData,
                {
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.results.added[tableId] = this.results.added[tableId] || [];
            this.results.added[tableId].push(response.data);
            this.results.summary.added++;

            console.log(`✅ Added field to table ${tableId}: ${fieldData.name}`);
            return response.data;
        } catch (error) {
            this.results.errors[tableId] = this.results.errors[tableId] || [];
            this.results.errors[tableId].push({ fieldData, error: error.message });
            this.results.summary.failed++;

            console.log(`❌ Failed to add field to table ${tableId}: ${error.message}`);
            if (error.response) {
                console.log(`Error details: ${JSON.stringify(error.response.data, null, 2)}`);
            }
            throw error;
        }
    }

    async enhanceCustomersTable() {
        console.log('\n👥 Enhancing Customers Table...');

        const tableId = 'tbl6BMipQQPJvPIWw'; // Customers table ID

        // Add formula field for customer status indicator
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Status Indicator',
            type: 'formula',
            options: {
                formula: 'SWITCH({Status}, "Active", "✅", "Inactive", "❌", "Prospect", "👁️", "Lead", "🎯", "❓")'
            }
        });

        // Add formula field for customer type
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Customer Type',
            type: 'formula',
            options: {
                formula: 'IF({Status} = "Active", "Current Customer", IF({Status} = "Prospect", "Potential Customer", IF({Status} = "Lead", "Lead", "Inactive")))'
            }
        });

        // Add formula field for contact info summary
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Contact Summary',
            type: 'formula',
            options: {
                formula: 'CONCATENATE({Name}, " - ", {Company}, " (", {Email}, ")")'
            }
        });
    }

    async enhanceProjectsTable() {
        console.log('\n📋 Enhancing Projects Table...');

        const tableId = 'tblNopy7xK0IUYf8E'; // Projects table ID

        // Add formula field for project status indicator
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Status Indicator',
            type: 'formula',
            options: {
                formula: 'SWITCH({Status}, "Planning", "📋", "In Progress", "🚀", "Completed", "✅", "On Hold", "⏸️", "❓")'
            }
        });

        // Add formula field for priority indicator
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Priority Indicator',
            type: 'formula',
            options: {
                formula: 'SWITCH({Priority}, "Critical", "🔴", "High", "🟠", "Medium", "🟡", "Low", "🟢", "⚪")'
            }
        });

        // Add formula field for project summary
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Project Summary',
            type: 'formula',
            options: {
                formula: 'CONCATENATE({Name}, " - ", {Customer}, " (", {Status}, ")")'
            }
        });
    }

    async enhanceTasksTable() {
        console.log('\n✅ Enhancing Tasks Table...');

        const tableId = 'tblUO4nQyDEXJ2jGu'; // Tasks table ID

        // Add formula field for task status indicator
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Status Indicator',
            type: 'formula',
            options: {
                formula: 'SWITCH({Status}, "To Do", "📝", "In Progress", "🔄", "Review", "👀", "Done", "✅", "❓")'
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

        // Add formula field for task summary
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Task Summary',
            type: 'formula',
            options: {
                formula: 'CONCATENATE({Name}, " - ", {Project}, " (", {Status}, ")")'
            }
        });
    }

    async enhanceInvoicesTable() {
        console.log('\n💰 Enhancing Invoices Table...');

        const tableId = 'tbl3jjJxyhj5VTSeb'; // Invoices table ID

        // Add formula field for invoice status indicator
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Status Indicator',
            type: 'formula',
            options: {
                formula: 'SWITCH({Status}, "Paid", "✅", "Sent", "📤", "Draft", "📝", "Overdue", "⚠️", "❓")'
            }
        });

        // Add formula field for invoice summary
        this.results.summary.total++;
        await this.addField(tableId, {
            name: 'Invoice Summary',
            type: 'formula',
            options: {
                formula: 'CONCATENATE({Name}, " - ", {Customer}, " (", {Status}, ")")'
            }
        });
    }

    async enhanceAllTables() {
        console.log('🚀 Starting Simple Airtable Enhancement...');
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
            const resultsPath = path.join(__dirname, '../docs/airtable-simple-enhancement-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Results saved to: ${resultsPath}`);

            if (successRate >= 80) {
                console.log('\n🎉 Simple Enhancement SUCCESSFUL! Airtable now has formula fields.');
                return true;
            } else {
                console.log('\n⚠️ Simple Enhancement PARTIALLY SUCCESSFUL. Some fields failed to add.');
                return false;
            }

        } catch (error) {
            console.error('\n❌ Simple Enhancement FAILED:', error.message);
            return false;
        }
    }
}

// Run the enhancement
async function main() {
    const enhancer = new SimpleAirtableEnhancer();
    const success = await enhancer.enhanceAllTables();
    process.exit(success ? 0 : 1);
}

main().catch(console.error);
