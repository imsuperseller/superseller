#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class RenstoSystemCreator {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // Use the first accessible base for Rensto system
        this.targetBaseId = 'appqY1p53ge7UqxUO'; // משאבים base
        
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            baseId: this.targetBaseId,
            createdTables: [],
            errors: []
        };
    }

    async createRenstoSystem() {
        console.log('🏗️ CREATING RENSTO SYSTEM IN AIRTABLE');
        console.log('=====================================');
        console.log(`Target Base: ${this.targetBaseId}`);
        console.log('Creating complete Rensto business system...');
        
        try {
            // Step 1: Create Core Business Tables
            await this.createCoreBusinessTables();
            
            // Step 2: Create Financial Management Tables
            await this.createFinancialTables();
            
            // Step 3: Create Customer Management Tables
            await this.createCustomerTables();
            
            // Step 4: Create Project Management Tables
            await this.createProjectTables();
            
            // Step 5: Create Analytics & Monitoring Tables
            await this.createAnalyticsTables();
            
            await this.saveResults();
            
            console.log('\n✅ RENSTO SYSTEM CREATION COMPLETED!');
            console.log('🎯 System ready for use');
            
        } catch (error) {
            console.error('❌ Creation failed:', error.message);
            this.results.errors.push({ step: 'creation', error: error.message });
            await this.saveResults();
        }
    }

    async createCoreBusinessTables() {
        console.log('\n📊 Creating Core Business Tables...');
        
        const coreTables = [
            {
                name: 'Customers',
                description: 'Customer information and contact details',
                fields: [
                    { name: 'Name', type: 'singleLineText' },
                    { name: 'Email', type: 'email' },
                    { name: 'Phone', type: 'phoneNumber' },
                    { name: 'Company', type: 'singleLineText' },
                    { name: 'Status', type: 'singleSelect', options: ['Active', 'Inactive', 'Prospect'] },
                    { name: 'Created Date', type: 'date' },
                    { name: 'Notes', type: 'multilineText' }
                ]
            },
            {
                name: 'Projects',
                description: 'Project management and tracking',
                fields: [
                    { name: 'Project Name', type: 'singleLineText' },
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customers' },
                    { name: 'Status', type: 'singleSelect', options: ['Planning', 'Active', 'Completed', 'On Hold'] },
                    { name: 'Start Date', type: 'date' },
                    { name: 'End Date', type: 'date' },
                    { name: 'Budget', type: 'currency' },
                    { name: 'Description', type: 'multilineText' }
                ]
            },
            {
                name: 'Tasks',
                description: 'Task management and assignments',
                fields: [
                    { name: 'Task Name', type: 'singleLineText' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Projects' },
                    { name: 'Assigned To', type: 'singleLineText' },
                    { name: 'Status', type: 'singleSelect', options: ['To Do', 'In Progress', 'Done'] },
                    { name: 'Priority', type: 'singleSelect', options: ['Low', 'Medium', 'High', 'Urgent'] },
                    { name: 'Due Date', type: 'date' },
                    { name: 'Description', type: 'multilineText' }
                ]
            }
        ];

        for (const table of coreTables) {
            await this.createTable(table);
        }
    }

    async createFinancialTables() {
        console.log('\n💰 Creating Financial Management Tables...');
        
        const financialTables = [
            {
                name: 'Invoices',
                description: 'Invoice management and tracking',
                fields: [
                    { name: 'Invoice Number', type: 'singleLineText' },
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customers' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Projects' },
                    { name: 'Amount', type: 'currency' },
                    { name: 'Status', type: 'singleSelect', options: ['Draft', 'Sent', 'Paid', 'Overdue'] },
                    { name: 'Issue Date', type: 'date' },
                    { name: 'Due Date', type: 'date' },
                    { name: 'Description', type: 'multilineText' }
                ]
            },
            {
                name: 'Expenses',
                description: 'Expense tracking and management',
                fields: [
                    { name: 'Description', type: 'singleLineText' },
                    { name: 'Amount', type: 'currency' },
                    { name: 'Category', type: 'singleSelect', options: ['Office', 'Travel', 'Marketing', 'Software', 'Other'] },
                    { name: 'Date', type: 'date' },
                    { name: 'Receipt', type: 'attachment' },
                    { name: 'Notes', type: 'multilineText' }
                ]
            }
        ];

        for (const table of financialTables) {
            await this.createTable(table);
        }
    }

    async createCustomerTables() {
        console.log('\n👥 Creating Customer Management Tables...');
        
        const customerTables = [
            {
                name: 'Leads',
                description: 'Lead management and tracking',
                fields: [
                    { name: 'Lead Name', type: 'singleLineText' },
                    { name: 'Email', type: 'email' },
                    { name: 'Phone', type: 'phoneNumber' },
                    { name: 'Source', type: 'singleSelect', options: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Other'] },
                    { name: 'Status', type: 'singleSelect', options: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'] },
                    { name: 'Created Date', type: 'date' },
                    { name: 'Notes', type: 'multilineText' }
                ]
            },
            {
                name: 'Communications',
                description: 'Customer communication history',
                fields: [
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customers' },
                    { name: 'Type', type: 'singleSelect', options: ['Email', 'Phone', 'Meeting', 'Other'] },
                    { name: 'Subject', type: 'singleLineText' },
                    { name: 'Date', type: 'date' },
                    { name: 'Notes', type: 'multilineText' }
                ]
            }
        ];

        for (const table of customerTables) {
            await this.createTable(table);
        }
    }

    async createProjectTables() {
        console.log('\n📋 Creating Project Management Tables...');
        
        const projectTables = [
            {
                name: 'Time Tracking',
                description: 'Time tracking for projects and tasks',
                fields: [
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Projects' },
                    { name: 'Task', type: 'singleRecordLink', linkedTableId: 'Tasks' },
                    { name: 'Person', type: 'singleLineText' },
                    { name: 'Date', type: 'date' },
                    { name: 'Hours', type: 'number' },
                    { name: 'Description', type: 'multilineText' }
                ]
            },
            {
                name: 'Resources',
                description: 'Resource management and allocation',
                fields: [
                    { name: 'Resource Name', type: 'singleLineText' },
                    { name: 'Type', type: 'singleSelect', options: ['Person', 'Equipment', 'Software', 'Other'] },
                    { name: 'Availability', type: 'singleSelect', options: ['Available', 'Busy', 'Unavailable'] },
                    { name: 'Hourly Rate', type: 'currency' },
                    { name: 'Skills', type: 'multilineText' }
                ]
            }
        ];

        for (const table of projectTables) {
            await this.createTable(table);
        }
    }

    async createAnalyticsTables() {
        console.log('\n📈 Creating Analytics & Monitoring Tables...');
        
        const analyticsTables = [
            {
                name: 'KPIs',
                description: 'Key Performance Indicators tracking',
                fields: [
                    { name: 'KPI Name', type: 'singleLineText' },
                    { name: 'Category', type: 'singleSelect', options: ['Financial', 'Customer', 'Operational', 'Growth'] },
                    { name: 'Current Value', type: 'number' },
                    { name: 'Target Value', type: 'number' },
                    { name: 'Date', type: 'date' },
                    { name: 'Status', type: 'singleSelect', options: ['On Track', 'Behind', 'Ahead'] }
                ]
            },
            {
                name: 'Reports',
                description: 'Report generation and scheduling',
                fields: [
                    { name: 'Report Name', type: 'singleLineText' },
                    { name: 'Type', type: 'singleSelect', options: ['Financial', 'Project', 'Customer', 'Operational'] },
                    { name: 'Frequency', type: 'singleSelect', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'] },
                    { name: 'Last Generated', type: 'date' },
                    { name: 'Next Scheduled', type: 'date' },
                    { name: 'Recipients', type: 'multilineText' }
                ]
            }
        ];

        for (const table of analyticsTables) {
            await this.createTable(table);
        }
    }

    async createTable(tableConfig) {
        try {
            console.log(`  Creating table: ${tableConfig.name}`);
            
            // Create table using Airtable API
            const response = await axios.post(`${this.baseUrl}/meta/bases/${this.targetBaseId}/tables`, {
                name: tableConfig.name,
                description: tableConfig.description,
                fields: tableConfig.fields.map(field => ({
                    name: field.name,
                    type: field.type,
                    ...(field.options && { options: { choices: field.options.map(opt => ({ name: opt })) } })
                }))
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Created table: ${tableConfig.name} (${response.data.id})`);
            
            this.results.createdTables.push({
                name: tableConfig.name,
                id: response.data.id,
                description: tableConfig.description
            });
            
        } catch (error) {
            console.error(`    ❌ Failed to create table ${tableConfig.name}: ${error.message}`);
            this.results.errors.push({
                table: tableConfig.name,
                error: error.message
            });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/rensto-system-creation-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const creator = new RenstoSystemCreator();
creator.createRenstoSystem().catch(console.error);
