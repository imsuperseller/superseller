#!/usr/bin/env node

/**
 * Populate Original Airtable Base with Real Business Data
 * Populates the original base appQijHhqqP4z6wGe with actual customer and project data
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

// Real Business Data
const businessData = {
    customers: [
        {
            Name: 'Ben Ginati',
            Email: 'info@tax4us.co.il',
            Phone: '+972-XX-XXX-XXXX',
            Company: 'Tax4Us',
            Status: 'Active',
            Notes: 'Owner of Tax4Us. Requires 4 agents: WordPress Content, Blog & Posts, Podcast, Social Media. Paid $2,500 for automation services. Premium customer.'
        },
        {
            Name: 'Shelly Mizrahi',
            Email: 'shellypensia@gmail.com',
            Phone: '+972-XX-XXX-XXXX',
            Company: 'Shelly Mizrahi Consulting',
            Status: 'Active',
            Notes: 'Insurance consultant. Requires Excel Family Profile Processor Agent. Processes Hebrew Excel files for family insurance profiles. Standard customer.'
        }
    ],
    projects: [
        {
            Name: 'Tax4Us Automation System',
            Customer: 'Ben Ginati',
            Status: 'In Progress',
            Priority: 'High',
            Description: 'Complete automation system for Tax4Us including WordPress content, blog posts, podcast production, and social media management. Client: Ben Ginati. Budget: $5,000. Deliverables: WordPress Content Agent, Blog & Posts Agent, Podcast Complete Agent, Social Media Agent.'
        },
        {
            Name: 'Shelly Mizrahi Excel Processor',
            Customer: 'Shelly Mizrahi',
            Status: 'In Progress',
            Priority: 'Medium',
            Description: 'Excel processing automation for family insurance profiles. Processes Hebrew Excel files and generates combined family profiles. Client: Shelly Mizrahi. Budget: $250. Deliverables: Excel Family Profile Processor Agent, Hebrew Text Support, Automated File Processing.'
        }
    ],
    tasks: [
        {
            Name: 'Deploy WordPress Content Agent',
            Project: 'Tax4Us Automation System',
            'Assigned To': 'Shai Friedman',
            Status: 'In Progress',
            Priority: 'High',
            Description: 'Deploy and configure WordPress content automation agent for Tax4Us website'
        },
        {
            Name: 'Configure Blog & Posts Agent',
            Project: 'Tax4Us Automation System',
            'Assigned To': 'Shai Friedman',
            Status: 'To Do',
            Priority: 'High',
            Description: 'Set up automated blog post creation and publishing system'
        },
        {
            Name: 'Setup Podcast Agent',
            Project: 'Tax4Us Automation System',
            'Assigned To': 'Shai Friedman',
            Status: 'To Do',
            Priority: 'Medium',
            Description: 'Configure podcast production and distribution automation'
        },
        {
            Name: 'Deploy Social Media Agent',
            Project: 'Tax4Us Automation System',
            'Assigned To': 'Shai Friedman',
            Status: 'To Do',
            Priority: 'Medium',
            Description: 'Set up social media content creation and posting automation'
        },
        {
            Name: 'Build Excel Processor Agent',
            Project: 'Shelly Mizrahi Excel Processor',
            'Assigned To': 'Shai Friedman',
            Status: 'In Progress',
            Priority: 'High',
            Description: 'Develop Excel processing agent for Hebrew family insurance profiles'
        },
        {
            Name: 'Test Hebrew Text Processing',
            Project: 'Shelly Mizrahi Excel Processor',
            'Assigned To': 'Shai Friedman',
            Status: 'To Do',
            Priority: 'High',
            Description: 'Test and validate Hebrew text processing capabilities'
        }
    ],
    invoices: [
        {
            Name: 'Tax4Us Automation System - First Payment',
            'Invoice Number': 'INV-2025-001',
            Customer: 'Ben Ginati',
            Project: 'Tax4Us Automation System',
            Status: 'Paid',
            Notes: 'First payment for Tax4Us automation system - 4 agents. Amount: $2,500'
        },
        {
            Name: 'Shelly Mizrahi Excel Processor',
            'Invoice Number': 'INV-2025-002',
            Customer: 'Shelly Mizrahi',
            Project: 'Shelly Mizrahi Excel Processor',
            Status: 'Paid',
            Notes: 'Excel processing automation for family insurance profiles. Amount: $250'
        }
    ],
    leads: [
        {
            Name: 'Sarah Cohen Legal Services - Ben Ginati Referral'
        }
    ]
};

class OriginalBasePopulator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            created: {},
            errors: {},
            summary: {
                total: 0,
                created: 0,
                failed: 0
            }
        };
    }

    async createRecord(tableName, data) {
        try {
            const response = await axios.post(
                `https://api.airtable.com/v0/${config.airtable.baseId}/${tableName}`,
                { records: [{ fields: data }] },
                {
                    headers: {
                        'Authorization': `Bearer ${config.airtable.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.results.created[tableName] = this.results.created[tableName] || [];
            this.results.created[tableName].push(response.data.records[0]);
            this.results.summary.created++;

            console.log(`✅ Created ${tableName} record: ${data.Name || data.Company || 'Record'}`);
            return response.data.records[0];
        } catch (error) {
            this.results.errors[tableName] = this.results.errors[tableName] || [];
            this.results.errors[tableName].push({ data, error: error.message });
            this.results.summary.failed++;

            console.log(`❌ Failed to create ${tableName} record: ${error.message}`);
            throw error;
        }
    }

    async populateCustomers() {
        console.log('\n👥 Populating Customers...');

        for (const customer of businessData.customers) {
            this.results.summary.total++;
            await this.createRecord('Customers', customer);
        }
    }

    async populateProjects() {
        console.log('\n📋 Populating Projects...');

        for (const project of businessData.projects) {
            this.results.summary.total++;
            await this.createRecord('Projects', project);
        }
    }

    async populateTasks() {
        console.log('\n✅ Populating Tasks...');

        for (const task of businessData.tasks) {
            this.results.summary.total++;
            await this.createRecord('Tasks', task);
        }
    }

    async populateInvoices() {
        console.log('\n💰 Populating Invoices...');

        for (const invoice of businessData.invoices) {
            this.results.summary.total++;
            await this.createRecord('Invoices', invoice);
        }
    }

    async populateLeads() {
        console.log('\n🎯 Populating Leads...');

        for (const lead of businessData.leads) {
            this.results.summary.total++;
            await this.createRecord('Leads', lead);
        }
    }

    async populateAllData() {
        console.log('🚀 Starting Original Base Population...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);
        console.log(`🎯 Target Base: ${config.airtable.baseId}`);

        try {
            await this.populateCustomers();
            await this.populateProjects();
            await this.populateTasks();
            await this.populateInvoices();
            await this.populateLeads();

            // Calculate success rate
            const successRate = (this.results.summary.created / this.results.summary.total) * 100;

            console.log('\n📊 Population Summary:');
            console.log(`Total Records: ${this.results.summary.total}`);
            console.log(`Created: ${this.results.summary.created}`);
            console.log(`Failed: ${this.results.summary.failed}`);
            console.log(`Success Rate: ${successRate.toFixed(1)}%`);

            // Save results
            const resultsPath = path.join(__dirname, '../docs/original-base-population-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Results saved to: ${resultsPath}`);

            if (successRate >= 90) {
                console.log('\n🎉 Original Base Population SUCCESSFUL!');
                console.log('\n📋 NEXT STEPS FOR MANUAL ENHANCEMENT:');
                console.log('1. Go to Airtable base: appQijHhqqP4z6wGe');
                console.log('2. Add Linked Record Fields:');
                console.log('   - Customers.Projects (multiple)');
                console.log('   - Projects.Customer (single)');
                console.log('   - Projects.Tasks (multiple)');
                console.log('   - Tasks.Project (single)');
                console.log('   - Invoices.Customer (single)');
                console.log('   - Invoices.Project (single)');
                console.log('3. Add Formula Fields:');
                console.log('   - Status Indicators (✅❌👁️🎯)');
                console.log('   - Priority Indicators (🔴🟠🟡🟢)');
                console.log('   - Summary Fields (concatenated info)');
                console.log('4. Add Rollup Fields:');
                console.log('   - Customer.Project Count');
                console.log('   - Project.Task Count');
                console.log('   - Project.Completion %');
                console.log('5. Add Lookup Fields:');
                console.log('   - Project.Customer Email');
                console.log('   - Task.Project Name');
                console.log('   - Invoice.Customer Email');
                return true;
            } else {
                console.log('\n⚠️ Original Base Population PARTIALLY SUCCESSFUL. Some records failed to create.');
                return false;
            }

        } catch (error) {
            console.error('\n❌ Original Base Population FAILED:', error.message);
            return false;
        }
    }
}

// Run the population
async function main() {
    const populator = new OriginalBasePopulator();
    const success = await populator.populateAllData();
    process.exit(success ? 0 : 1);
}

main().catch(console.error);
