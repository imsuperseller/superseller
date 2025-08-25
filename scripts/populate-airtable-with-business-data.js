#!/usr/bin/env node

/**
 * Populate Airtable with Actual Business Data
 * Migrates current customer and project data to the new Airtable system
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
        baseId: 'appqY1p53ge7UqxUO'
    }
};

// Current Business Data
const businessData = {
    customers: [
        {
            Name: 'Ben Ginati',
            Email: 'info@tax4us.co.il',
            Company: 'Tax4Us',
            Phone: '+972-XX-XXX-XXXX',
            Status: 'Active',
            'Created Date': '2025-01-15',
            Notes: 'Owner of Tax4Us. Requires 4 agents: WordPress Content, Blog & Posts, Podcast, Social Media. Paid $2,500 for automation services. Premium customer.'
        },
        {
            Name: 'Shelly Mizrahi',
            Email: 'shellypensia@gmail.com',
            Company: 'Shelly Mizrahi Consulting',
            Phone: '+972-XX-XXX-XXXX',
            Status: 'Active',
            'Created Date': '2025-01-15',
            Notes: 'Insurance consultant. Requires Excel Family Profile Processor Agent. Processes Hebrew Excel files for family insurance profiles. Standard customer.'
        }
    ],
    projects: [
        {
            'Project Name': 'Tax4Us Automation System',
            Status: 'Active',
            'Start Date': '2025-01-15',
            'End Date': '2025-03-20',
            Budget: 5000,
            Description: 'Complete automation system for Tax4Us including WordPress content, blog posts, podcast production, and social media management. Client: Ben Ginati. Budget: $5,000. Deliverables: WordPress Content Agent, Blog & Posts Agent, Podcast Complete Agent, Social Media Agent.'
        },
        {
            'Project Name': 'Shelly Mizrahi Excel Processor',
            Status: 'Active',
            'Start Date': '2025-01-15',
            'End Date': '2025-02-15',
            Budget: 250,
            Description: 'Excel processing automation for family insurance profiles. Processes Hebrew Excel files and generates combined family profiles. Client: Shelly Mizrahi. Budget: $250. Deliverables: Excel Family Profile Processor Agent, Hebrew Text Support, Automated File Processing.'
        }
    ],
    tasks: [
        {
            project: 'Tax4Us Automation System',
            name: 'Deploy WordPress Content Agent',
            assignedTo: 'Shai Friedman',
            taskType: 'Development',
            status: 'In Progress',
            priority: 'High',
            dueDate: '2025-01-25',
            description: 'Deploy and configure WordPress content automation agent for Tax4Us website'
        },
        {
            project: 'Tax4Us Automation System',
            name: 'Configure Blog & Posts Agent',
            assignedTo: 'Shai Friedman',
            taskType: 'Configuration',
            status: 'Pending',
            priority: 'High',
            dueDate: '2025-01-30',
            description: 'Set up automated blog post creation and publishing system'
        },
        {
            project: 'Tax4Us Automation System',
            name: 'Setup Podcast Agent',
            assignedTo: 'Shai Friedman',
            taskType: 'Integration',
            status: 'Pending',
            priority: 'Medium',
            dueDate: '2025-02-10',
            description: 'Configure podcast production and distribution automation'
        },
        {
            project: 'Tax4Us Automation System',
            name: 'Deploy Social Media Agent',
            assignedTo: 'Shai Friedman',
            taskType: 'Development',
            status: 'Pending',
            priority: 'Medium',
            dueDate: '2025-02-15',
            description: 'Set up social media content creation and posting automation'
        },
        {
            project: 'Shelly Mizrahi Excel Processor',
            name: 'Build Excel Processor Agent',
            assignedTo: 'Shai Friedman',
            taskType: 'Development',
            status: 'In Progress',
            priority: 'High',
            dueDate: '2025-01-30',
            description: 'Develop Excel processing agent for Hebrew family insurance profiles'
        },
        {
            project: 'Shelly Mizrahi Excel Processor',
            name: 'Test Hebrew Text Processing',
            assignedTo: 'Shai Friedman',
            taskType: 'Testing',
            status: 'Pending',
            priority: 'High',
            dueDate: '2025-02-05',
            description: 'Test and validate Hebrew text processing capabilities'
        }
    ],
    leads: [
        {
            company: 'Sarah Cohen Legal Services',
            contactPerson: 'Sarah Cohen',
            email: 'sarah@cohenlegal.co.il',
            phone: '+972-XX-XXX-XXXX',
            source: 'Ben Ginati Referral',
            status: 'Qualified',
            priority: 'High',
            industry: 'Legal Services',
            assignedTo: 'Shai Friedman',
            notes: 'Referred by Ben Ginati. Interested in legal document automation. Follow-up required.',
            leadValue: 3000,
            currency: 'USD'
        }
    ],
    invoices: [
        {
            company: 'Tax4Us',
            project: 'Tax4Us Automation System',
            contact: 'Ben Ginati',
            invoiceType: 'Service',
            status: 'Paid',
            amount: 2500,
            currency: 'USD',
            dueDate: '2025-01-20',
            paymentTerms: 'Net 5',
            paymentMethod: 'Bank Transfer',
            invoiceNumber: 'INV-2025-001',
            description: 'First payment for Tax4Us automation system - 4 agents'
        },
        {
            company: 'Shelly Mizrahi Consulting',
            project: 'Shelly Mizrahi Excel Processor',
            contact: 'Shelly Mizrahi',
            invoiceType: 'Service',
            status: 'Paid',
            amount: 250,
            currency: 'USD',
            dueDate: '2025-01-15',
            paymentTerms: 'Net 0',
            paymentMethod: 'QuickBooks',
            invoiceNumber: 'INV-2025-002',
            description: 'Excel processing automation for family insurance profiles'
        }
    ],
    expenses: [
        {
            project: 'Tax4Us Automation System',
            category: 'Development Tools',
            amount: 50,
            currency: 'USD',
            vendor: 'OpenAI',
            description: 'API credits for content generation',
            approvedBy: 'Shai Friedman',
            date: '2025-01-15'
        },
        {
            project: 'Shelly Mizrahi Excel Processor',
            category: 'Software Licenses',
            amount: 25,
            currency: 'USD',
            vendor: 'Microsoft',
            description: 'Excel processing library license',
            approvedBy: 'Shai Friedman',
            date: '2025-01-15'
        }
    ],
    timeTracking: [
        {
            project: 'Tax4Us Automation System',
            task: 'Deploy WordPress Content Agent',
            person: 'Shai Friedman',
            category: 'Development',
            hours: 8,
            date: '2025-01-20',
            description: 'Initial setup and configuration of WordPress content agent',
            approvedBy: 'Shai Friedman'
        },
        {
            project: 'Shelly Mizrahi Excel Processor',
            task: 'Build Excel Processor Agent',
            person: 'Shai Friedman',
            category: 'Development',
            hours: 6,
            date: '2025-01-20',
            description: 'Development of Excel processing agent with Hebrew support',
            approvedBy: 'Shai Friedman'
        }
    ],
    resources: [
        {
            name: 'Shai Friedman',
            type: 'Developer',
            email: 'shaifriedman@gmail.com',
            skills: ['JavaScript', 'Python', 'n8n', 'Airtable', 'WordPress'],
            availability: 'Full-time',
            hourlyRate: 100,
            currency: 'USD',
            status: 'Active'
        }
    ],
    kpis: [
        {
            name: 'Customer Satisfaction',
            metricType: 'Percentage',
            target: 95,
            current: 90,
            period: 'Monthly',
            status: 'On Track'
        },
        {
            name: 'Project Completion Rate',
            metricType: 'Percentage',
            target: 90,
            current: 85,
            period: 'Monthly',
            status: 'On Track'
        },
        {
            name: 'Revenue Growth',
            metricType: 'Percentage',
            target: 20,
            current: 15,
            period: 'Monthly',
            status: 'Below Target'
        },
        {
            name: 'Automation Efficiency',
            metricType: 'Hours Saved',
            target: 100,
            current: 75,
            period: 'Monthly',
            status: 'On Track'
        }
    ]
};

class AirtableDataPopulator {
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

            console.log(`✅ Created ${tableName} record: ${data.name || data.company || 'Record'}`);
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

    async populateLeads() {
        console.log('\n🎯 Populating Leads...');

        for (const lead of businessData.leads) {
            this.results.summary.total++;
            await this.createRecord('Leads', lead);
        }
    }

    async populateInvoices() {
        console.log('\n💰 Populating Invoices...');

        for (const invoice of businessData.invoices) {
            this.results.summary.total++;
            await this.createRecord('Invoices', invoice);
        }
    }

    async populateExpenses() {
        console.log('\n💸 Populating Expenses...');

        for (const expense of businessData.expenses) {
            this.results.summary.total++;
            await this.createRecord('Expenses', expense);
        }
    }

    async populateTimeTracking() {
        console.log('\n⏰ Populating Time Tracking...');

        for (const timeEntry of businessData.timeTracking) {
            this.results.summary.total++;
            await this.createRecord('Time Tracking', timeEntry);
        }
    }

    async populateResources() {
        console.log('\n👨‍💼 Populating Resources...');

        for (const resource of businessData.resources) {
            this.results.summary.total++;
            await this.createRecord('Resources', resource);
        }
    }

    async populateKPIs() {
        console.log('\n📊 Populating KPIs...');

        for (const kpi of businessData.kpis) {
            this.results.summary.total++;
            await this.createRecord('KPIs', kpi);
        }
    }

    async populateAllData() {
        console.log('🚀 Starting Airtable Data Population...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);

        try {
            await this.populateCustomers();
            await this.populateProjects();

            // Calculate success rate
            const successRate = (this.results.summary.created / this.results.summary.total) * 100;

            console.log('\n📊 Population Summary:');
            console.log(`Total Records: ${this.results.summary.total}`);
            console.log(`Created: ${this.results.summary.created}`);
            console.log(`Failed: ${this.results.summary.failed}`);
            console.log(`Success Rate: ${successRate.toFixed(1)}%`);

            // Save results
            const resultsPath = path.join(__dirname, '../docs/airtable-population-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Results saved to: ${resultsPath}`);

            if (successRate >= 90) {
                console.log('\n🎉 Data Population SUCCESSFUL! Airtable is now populated with your business data.');
                return true;
            } else {
                console.log('\n⚠️ Data Population PARTIALLY SUCCESSFUL. Some records failed to create.');
                return false;
            }

        } catch (error) {
            console.error('\n❌ Data Population FAILED:', error.message);
            return false;
        }
    }
}

// Run the data population
async function main() {
    const populator = new AirtableDataPopulator();
    const success = await populator.populateAllData();
    process.exit(success ? 0 : 1);
}

main().catch(console.error);
