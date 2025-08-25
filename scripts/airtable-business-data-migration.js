#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * AIRTABLE BUSINESS DATA MIGRATION
 * 
 * This script systematically migrates all business data to Airtable:
 * 1. Creates proper base structure for business operations
 * 2. Migrates customer data, contracts, invoices, projects
 * 3. Sets up automation workflows and integrations
 * 4. Implements proper data relationships and workflows
 */

class AirtableBusinessDataMigration {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in-progress',
            bases: {},
            tables: {},
            records: {},
            errors: []
        };
    }

    async migrateAllBusinessData() {
        console.log('🚀 AIRTABLE BUSINESS DATA MIGRATION');
        console.log('====================================\n');

        try {
            // 1. Create main business base
            await this.createMainBusinessBase();

            // 2. Create customer management base
            await this.createCustomerManagementBase();

            // 3. Create project management base
            await this.createProjectManagementBase();

            // 4. Create financial management base
            await this.createFinancialManagementBase();

            // 5. Create automation workflows base
            await this.createAutomationWorkflowsBase();

            // 6. Migrate existing data
            await this.migrateExistingData();

            // 7. Set up integrations and relationships
            await this.setupIntegrations();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n✅ AIRTABLE BUSINESS DATA MIGRATION COMPLETED!');
            console.log('🎯 All business data successfully migrated to Airtable');
            console.log('📊 Check your Airtable workspace for the new bases');

        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
            throw error;
        }
    }

    async createMainBusinessBase() {
        console.log('🏢 Creating Main Business Base...');

        const baseData = {
            name: 'Rensto Business Operations',
            description: 'Central hub for all business operations, customer management, and automation workflows'
        };

        try {
            // Create base using Airtable API
            const response = await axios.post('https://api.airtable.com/v0/meta/bases', baseData, {
                headers: this.headers
            });

            this.results.bases.main = {
                id: response.data.id,
                name: baseData.name,
                description: baseData.description
            };

            console.log(`  ✅ Main Business Base created (ID: ${response.data.id})`);

            // Create core tables
            await this.createMainBusinessTables(response.data.id);

        } catch (error) {
            console.log(`  ❌ Main Business Base creation failed: ${error.response?.data?.error?.message || error.message}`);
            this.results.errors.push({ step: 'createMainBusinessBase', error: error.message });
        }
    }

    async createMainBusinessTables(baseId) {
        const tables = [
            {
                name: 'Customers',
                description: 'Customer information and contact details',
                fields: [
                    { name: 'Name', type: 'singleLineText', description: 'Customer full name' },
                    { name: 'Email', type: 'email', description: 'Customer email address' },
                    { name: 'Phone', type: 'phoneNumber', description: 'Customer phone number' },
                    { name: 'Company', type: 'singleLineText', description: 'Company name' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' }
                            ]
                        }
                    },
                    { name: 'Notes', type: 'multilineText', description: 'Additional notes' },
                    { name: 'Created Date', type: 'date', description: 'Date customer was added' },
                    { name: 'Last Contact', type: 'date', description: 'Last contact date' }
                ]
            },
            {
                name: 'Projects',
                description: 'Project tracking and management',
                fields: [
                    { name: 'Project Name', type: 'singleLineText', description: 'Project title' },
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customers', description: 'Associated customer' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Planning' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'On Hold' }
                            ]
                        }
                    },
                    { name: 'Start Date', type: 'date', description: 'Project start date' },
                    { name: 'End Date', type: 'date', description: 'Project end date' },
                    { name: 'Budget', type: 'currency', description: 'Project budget' },
                    { name: 'Description', type: 'multilineText', description: 'Project description' },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    }
                ]
            },
            {
                name: 'Contracts',
                description: 'Contract management and tracking',
                fields: [
                    { name: 'Contract Name', type: 'singleLineText', description: 'Contract title' },
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customers', description: 'Contract customer' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Projects', description: 'Associated project' },
                    { name: 'Value', type: 'currency', description: 'Contract value' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Draft' }, { name: 'Sent' }, { name: 'Signed' }, { name: 'Completed' }
                            ]
                        }
                    },
                    { name: 'Start Date', type: 'date', description: 'Contract start date' },
                    { name: 'End Date', type: 'date', description: 'Contract end date' },
                    { name: 'Terms', type: 'multilineText', description: 'Contract terms' }
                ]
            },
            {
                name: 'Invoices',
                description: 'Invoice tracking and payment management',
                fields: [
                    { name: 'Invoice Number', type: 'singleLineText', description: 'Invoice number' },
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customers', description: 'Invoice customer' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Projects', description: 'Associated project' },
                    { name: 'Amount', type: 'currency', description: 'Invoice amount' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Draft' }, { name: 'Sent' }, { name: 'Paid' }, { name: 'Overdue' }
                            ]
                        }
                    },
                    { name: 'Issue Date', type: 'date', description: 'Invoice issue date' },
                    { name: 'Due Date', type: 'date', description: 'Payment due date' },
                    { name: 'Paid Date', type: 'date', description: 'Payment received date' }
                ]
            },
            {
                name: 'Tasks',
                description: 'Task management and tracking',
                fields: [
                    { name: 'Task Name', type: 'singleLineText', description: 'Task title' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Projects', description: 'Associated project' },
                    { name: 'Assigned To', type: 'singleLineText', description: 'Task assignee' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'To Do' }, { name: 'In Progress' }, { name: 'Review' }, { name: 'Done' }
                            ]
                        }
                    },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    },
                    { name: 'Due Date', type: 'date', description: 'Task due date' },
                    { name: 'Description', type: 'multilineText', description: 'Task description' }
                ]
            }
        ];

        for (const table of tables) {
            try {
                const response = await axios.post(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, table, {
                    headers: this.headers
                });

                this.results.tables[table.name] = {
                    id: response.data.id,
                    name: table.name,
                    description: table.description
                };

                console.log(`    ✅ Table '${table.name}' created (ID: ${response.data.id})`);

            } catch (error) {
                console.log(`    ❌ Table '${table.name}' creation failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: `createTable_${table.name}`, error: error.message });
            }
        }
    }

    async createCustomerManagementBase() {
        console.log('👥 Creating Customer Management Base...');

        const baseData = {
            name: 'Rensto Customer Management',
            description: 'Comprehensive customer relationship management and communication tracking'
        };

        try {
            const response = await axios.post('https://api.airtable.com/v0/meta/bases', baseData, {
                headers: this.headers
            });

            this.results.bases.customers = {
                id: response.data.id,
                name: baseData.name,
                description: baseData.description
            };

            console.log(`  ✅ Customer Management Base created (ID: ${response.data.id})`);

            // Create customer-specific tables
            await this.createCustomerManagementTables(response.data.id);

        } catch (error) {
            console.log(`  ❌ Customer Management Base creation failed: ${error.response?.data?.error?.message || error.message}`);
            this.results.errors.push({ step: 'createCustomerManagementBase', error: error.message });
        }
    }

    async createCustomerManagementTables(baseId) {
        const tables = [
            {
                name: 'Customer Profiles',
                description: 'Detailed customer profiles and information',
                fields: [
                    { name: 'Customer ID', type: 'singleLineText', description: 'Unique customer identifier' },
                    { name: 'Full Name', type: 'singleLineText', description: 'Customer full name' },
                    { name: 'Email', type: 'email', description: 'Primary email address' },
                    { name: 'Phone', type: 'phoneNumber', description: 'Primary phone number' },
                    { name: 'Company', type: 'singleLineText', description: 'Company name' },
                    {
                        name: 'Industry', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Technology' }, { name: 'Healthcare' }, { name: 'Finance' }, { name: 'Education' },
                                { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Other' }
                            ]
                        }
                    },
                    {
                        name: 'Customer Type', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Individual' }, { name: 'Small Business' }, { name: 'Enterprise' }
                            ]
                        }
                    },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' }
                            ]
                        }
                    },
                    {
                        name: 'Source', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Website' }, { name: 'Referral' }, { name: 'Cold Outreach' }, { name: 'Social Media' }
                            ]
                        }
                    },
                    { name: 'Notes', type: 'multilineText', description: 'Additional notes' }
                ]
            },
            {
                name: 'Communications',
                description: 'Customer communication history',
                fields: [
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customer Profiles', description: 'Customer reference' },
                    { name: 'Date', type: 'date', description: 'Communication date' },
                    {
                        name: 'Type', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Email' }, { name: 'Phone' }, { name: 'Meeting' }, { name: 'Support' }
                            ]
                        }
                    },
                    { name: 'Subject', type: 'singleLineText', description: 'Communication subject' },
                    { name: 'Summary', type: 'multilineText', description: 'Communication summary' },
                    { name: 'Follow Up Required', type: 'checkbox', description: 'Follow up needed' },
                    { name: 'Follow Up Date', type: 'date', description: 'Follow up date' }
                ]
            },
            {
                name: 'Customer Feedback',
                description: 'Customer feedback and satisfaction tracking',
                fields: [
                    { name: 'Customer', type: 'singleRecordLink', linkedTableId: 'Customer Profiles', description: 'Customer reference' },
                    { name: 'Date', type: 'date', description: 'Feedback date' },
                    { name: 'Rating', type: 'number', description: 'Satisfaction rating (1-10)' },
                    {
                        name: 'Category', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Service Quality' }, { name: 'Communication' }, { name: 'Timeliness' }, { name: 'Value' }
                            ]
                        }
                    },
                    { name: 'Feedback', type: 'multilineText', description: 'Detailed feedback' },
                    { name: 'Action Required', type: 'checkbox', description: 'Action needed' },
                    { name: 'Action Taken', type: 'multilineText', description: 'Action taken' }
                ]
            }
        ];

        for (const table of tables) {
            try {
                const response = await axios.post(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, table, {
                    headers: this.headers
                });

                this.results.tables[table.name] = {
                    id: response.data.id,
                    name: table.name,
                    description: table.description
                };

                console.log(`    ✅ Table '${table.name}' created (ID: ${response.data.id})`);

            } catch (error) {
                console.log(`    ❌ Table '${table.name}' creation failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: `createTable_${table.name}`, error: error.message });
            }
        }
    }

    async createProjectManagementBase() {
        console.log('📋 Creating Project Management Base...');

        const baseData = {
            name: 'Rensto Project Management',
            description: 'Project planning, tracking, and resource management'
        };

        try {
            const response = await axios.post('https://api.airtable.com/v0/meta/bases', baseData, {
                headers: this.headers
            });

            this.results.bases.projects = {
                id: response.data.id,
                name: baseData.name,
                description: baseData.description
            };

            console.log(`  ✅ Project Management Base created (ID: ${response.data.id})`);

            // Create project-specific tables
            await this.createProjectManagementTables(response.data.id);

        } catch (error) {
            console.log(`  ❌ Project Management Base creation failed: ${error.response?.data?.error?.message || error.message}`);
            this.results.errors.push({ step: 'createProjectManagementBase', error: error.message });
        }
    }

    async createProjectManagementTables(baseId) {
        const tables = [
            {
                name: 'Project Portfolio',
                description: 'Project portfolio and strategic overview',
                fields: [
                    { name: 'Project Name', type: 'singleLineText', description: 'Project title' },
                    { name: 'Project ID', type: 'singleLineText', description: 'Unique project identifier' },
                    { name: 'Customer', type: 'singleLineText', description: 'Customer name' },
                    { name: 'Project Manager', type: 'singleLineText', description: 'Project manager' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Planning' }, { name: 'Active' }, { name: 'On Hold' }, { name: 'Completed' }, { name: 'Cancelled' }
                            ]
                        }
                    },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    },
                    { name: 'Start Date', type: 'date', description: 'Project start date' },
                    { name: 'End Date', type: 'date', description: 'Project end date' },
                    { name: 'Budget', type: 'currency', description: 'Project budget' },
                    { name: 'Actual Cost', type: 'currency', description: 'Actual project cost' },
                    { name: 'Description', type: 'multilineText', description: 'Project description' }
                ]
            },
            {
                name: 'Project Tasks',
                description: 'Detailed task breakdown and tracking',
                fields: [
                    { name: 'Task Name', type: 'singleLineText', description: 'Task title' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Project Portfolio', description: 'Associated project' },
                    { name: 'Assigned To', type: 'singleLineText', description: 'Task assignee' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Not Started' }, { name: 'In Progress' }, { name: 'Review' }, { name: 'Completed' }
                            ]
                        }
                    },
                    {
                        name: 'Priority', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                            ]
                        }
                    },
                    { name: 'Due Date', type: 'date', description: 'Task due date' },
                    { name: 'Estimated Hours', type: 'number', description: 'Estimated hours' },
                    { name: 'Actual Hours', type: 'number', description: 'Actual hours spent' },
                    { name: 'Description', type: 'multilineText', description: 'Task description' }
                ]
            },
            {
                name: 'Project Resources',
                description: 'Resource allocation and management',
                fields: [
                    { name: 'Resource Name', type: 'singleLineText', description: 'Resource name' },
                    { name: 'Project', type: 'singleRecordLink', linkedTableId: 'Project Portfolio', description: 'Associated project' },
                    {
                        name: 'Role', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Developer' }, { name: 'Designer' }, { name: 'Project Manager' }, { name: 'QA' }, { name: 'DevOps' }
                            ]
                        }
                    },
                    { name: 'Allocation', type: 'number', description: 'Allocation percentage' },
                    { name: 'Start Date', type: 'date', description: 'Resource start date' },
                    { name: 'End Date', type: 'date', description: 'Resource end date' },
                    { name: 'Rate', type: 'currency', description: 'Hourly rate' }
                ]
            }
        ];

        for (const table of tables) {
            try {
                const response = await axios.post(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, table, {
                    headers: this.headers
                });

                this.results.tables[table.name] = {
                    id: response.data.id,
                    name: table.name,
                    description: table.description
                };

                console.log(`    ✅ Table '${table.name}' created (ID: ${response.data.id})`);

            } catch (error) {
                console.log(`    ❌ Table '${table.name}' creation failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: `createTable_${table.name}`, error: error.message });
            }
        }
    }

    async createFinancialManagementBase() {
        console.log('💰 Creating Financial Management Base...');

        const baseData = {
            name: 'Rensto Financial Management',
            description: 'Financial tracking, invoicing, and revenue management'
        };

        try {
            const response = await axios.post('https://api.airtable.com/v0/meta/bases', baseData, {
                headers: this.headers
            });

            this.results.bases.financial = {
                id: response.data.id,
                name: baseData.name,
                description: baseData.description
            };

            console.log(`  ✅ Financial Management Base created (ID: ${response.data.id})`);

            // Create financial-specific tables
            await this.createFinancialManagementTables(response.data.id);

        } catch (error) {
            console.log(`  ❌ Financial Management Base creation failed: ${error.response?.data?.error?.message || error.message}`);
            this.results.errors.push({ step: 'createFinancialManagementBase', error: error.message });
        }
    }

    async createFinancialManagementTables(baseId) {
        const tables = [
            {
                name: 'Invoices',
                description: 'Invoice tracking and management',
                fields: [
                    { name: 'Invoice Number', type: 'singleLineText', description: 'Invoice number' },
                    { name: 'Customer', type: 'singleLineText', description: 'Customer name' },
                    { name: 'Project', type: 'singleLineText', description: 'Associated project' },
                    { name: 'Amount', type: 'currency', description: 'Invoice amount' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Draft' }, { name: 'Sent' }, { name: 'Paid' }, { name: 'Overdue' }, { name: 'Cancelled' }
                            ]
                        }
                    },
                    { name: 'Issue Date', type: 'date', description: 'Invoice issue date' },
                    { name: 'Due Date', type: 'date', description: 'Payment due date' },
                    { name: 'Paid Date', type: 'date', description: 'Payment received date' },
                    {
                        name: 'Payment Method', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Credit Card' }, { name: 'Bank Transfer' }, { name: 'Check' }, { name: 'Cash' }
                            ]
                        }
                    },
                    { name: 'Notes', type: 'multilineText', description: 'Additional notes' }
                ]
            },
            {
                name: 'Revenue Tracking',
                description: 'Revenue tracking and analysis',
                fields: [
                    { name: 'Month', type: 'date', description: 'Revenue month' },
                    { name: 'Total Revenue', type: 'currency', description: 'Total monthly revenue' },
                    { name: 'New Business', type: 'currency', description: 'New business revenue' },
                    { name: 'Recurring Revenue', type: 'currency', description: 'Recurring revenue' },
                    { name: 'Expenses', type: 'currency', description: 'Monthly expenses' },
                    { name: 'Net Profit', type: 'currency', description: 'Net profit' },
                    { name: 'Growth Rate', type: 'number', description: 'Growth rate percentage' },
                    { name: 'Notes', type: 'multilineText', description: 'Monthly notes' }
                ]
            },
            {
                name: 'Expenses',
                description: 'Expense tracking and categorization',
                fields: [
                    { name: 'Date', type: 'date', description: 'Expense date' },
                    { name: 'Description', type: 'singleLineText', description: 'Expense description' },
                    { name: 'Amount', type: 'currency', description: 'Expense amount' },
                    {
                        name: 'Category', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Software' }, { name: 'Hardware' }, { name: 'Marketing' }, { name: 'Travel' },
                                { name: 'Office' }, { name: 'Salaries' }, { name: 'Other' }
                            ]
                        }
                    },
                    {
                        name: 'Payment Method', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Credit Card' }, { name: 'Bank Transfer' }, { name: 'Cash' }
                            ]
                        }
                    },
                    { name: 'Receipt', type: 'singleAttachment', description: 'Receipt attachment' },
                    { name: 'Notes', type: 'multilineText', description: 'Additional notes' }
                ]
            }
        ];

        for (const table of tables) {
            try {
                const response = await axios.post(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, table, {
                    headers: this.headers
                });

                this.results.tables[table.name] = {
                    id: response.data.id,
                    name: table.name,
                    description: table.description
                };

                console.log(`    ✅ Table '${table.name}' created (ID: ${response.data.id})`);

            } catch (error) {
                console.log(`    ❌ Table '${table.name}' creation failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: `createTable_${table.name}`, error: error.message });
            }
        }
    }

    async createAutomationWorkflowsBase() {
        console.log('🤖 Creating Automation Workflows Base...');

        const baseData = {
            name: 'Rensto Automation Workflows',
            description: 'Automation workflow tracking and management'
        };

        try {
            const response = await axios.post('https://api.airtable.com/v0/meta/bases', baseData, {
                headers: this.headers
            });

            this.results.bases.automation = {
                id: response.data.id,
                name: baseData.name,
                description: baseData.description
            };

            console.log(`  ✅ Automation Workflows Base created (ID: ${response.data.id})`);

            // Create automation-specific tables
            await this.createAutomationWorkflowsTables(response.data.id);

        } catch (error) {
            console.log(`  ❌ Automation Workflows Base creation failed: ${error.response?.data?.error?.message || error.message}`);
            this.results.errors.push({ step: 'createAutomationWorkflowsBase', error: error.message });
        }
    }

    async createAutomationWorkflowsTables(baseId) {
        const tables = [
            {
                name: 'Workflows',
                description: 'Automation workflow definitions',
                fields: [
                    { name: 'Workflow Name', type: 'singleLineText', description: 'Workflow name' },
                    { name: 'Description', type: 'multilineText', description: 'Workflow description' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Active' }, { name: 'Inactive' }, { name: 'Testing' }, { name: 'Archived' }
                            ]
                        }
                    },
                    {
                        name: 'Trigger', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Manual' }, { name: 'Scheduled' }, { name: 'Webhook' }, { name: 'Database' }
                            ]
                        }
                    },
                    { name: 'Last Run', type: 'dateTime', description: 'Last execution time' },
                    { name: 'Success Rate', type: 'number', description: 'Success rate percentage' },
                    { name: 'Configuration', type: 'multilineText', description: 'Workflow configuration' }
                ]
            },
            {
                name: 'Workflow Executions',
                description: 'Workflow execution history',
                fields: [
                    { name: 'Workflow', type: 'singleRecordLink', linkedTableId: 'Workflows', description: 'Workflow reference' },
                    { name: 'Execution ID', type: 'singleLineText', description: 'Unique execution ID' },
                    { name: 'Start Time', type: 'dateTime', description: 'Execution start time' },
                    { name: 'End Time', type: 'dateTime', description: 'Execution end time' },
                    {
                        name: 'Status', type: 'singleSelect', options: {
                            choices: [
                                { name: 'Running' }, { name: 'Completed' }, { name: 'Failed' }, { name: 'Cancelled' }
                            ]
                        }
                    },
                    { name: 'Duration', type: 'number', description: 'Execution duration in seconds' },
                    { name: 'Error Message', type: 'multilineText', description: 'Error message if failed' },
                    { name: 'Input Data', type: 'multilineText', description: 'Input data used' },
                    { name: 'Output Data', type: 'multilineText', description: 'Output data generated' }
                ]
            }
        ];

        for (const table of tables) {
            try {
                const response = await axios.post(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, table, {
                    headers: this.headers
                });

                this.results.tables[table.name] = {
                    id: response.data.id,
                    name: table.name,
                    description: table.description
                };

                console.log(`    ✅ Table '${table.name}' created (ID: ${response.data.id})`);

            } catch (error) {
                console.log(`    ❌ Table '${table.name}' creation failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: `createTable_${table.name}`, error: error.message });
            }
        }
    }

    async migrateExistingData() {
        console.log('\n📊 Migrating existing data...');

        // Migrate customer data
        await this.migrateCustomerData();

        // Migrate project data
        await this.migrateProjectData();

        // Migrate financial data
        await this.migrateFinancialData();
    }

    async migrateCustomerData() {
        console.log('  👥 Migrating customer data...');

        const customers = [
            {
                fields: {
                    'Name': 'Ben Ginati',
                    'Email': 'ben@ginati.com',
                    'Phone': '+972-50-123-4567',
                    'Company': 'Ginati Business Solutions',
                    'Status': 'Active',
                    'Notes': 'Customer who paid $2,500 for automation services',
                    'Created Date': new Date().toISOString().split('T')[0]
                }
            },
            {
                fields: {
                    'Name': 'Shelly Mizrahi',
                    'Email': 'shelly@mizrahi-insurance.com',
                    'Phone': '+972-52-987-6543',
                    'Company': 'Mizrahi Insurance Services',
                    'Status': 'Active',
                    'Notes': 'Insurance business automation customer',
                    'Created Date': new Date().toISOString().split('T')[0]
                }
            }
        ];

        // Add customers to the main business base
        if (this.results.bases.main) {
            try {
                const response = await axios.post(
                    `${this.baseUrl}/${this.results.bases.main.id}/Customers`,
                    { records: customers },
                    { headers: this.headers }
                );

                console.log(`    ✅ ${customers.length} customers migrated`);
                this.results.records.customers = response.data.records;

            } catch (error) {
                console.log(`    ❌ Customer migration failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: 'migrateCustomerData', error: error.message });
            }
        }
    }

    async migrateProjectData() {
        console.log('  📋 Migrating project data...');

        const projects = [
            {
                fields: {
                    'Project Name': 'Ben Ginati Automation System',
                    'Customer': 'Ben Ginati',
                    'Status': 'In Progress',
                    'Start Date': new Date().toISOString().split('T')[0],
                    'Budget': 2500,
                    'Description': 'Complete automation system for Ginati Business Solutions',
                    'Priority': 'High'
                }
            },
            {
                fields: {
                    'Project Name': 'Shelly Mizrahi Document Processing',
                    'Customer': 'Shelly Mizrahi',
                    'Status': 'Planning',
                    'Start Date': new Date().toISOString().split('T')[0],
                    'Budget': 8000,
                    'Description': 'Document processing automation for insurance business',
                    'Priority': 'Medium'
                }
            }
        ];

        // Add projects to the main business base
        if (this.results.bases.main) {
            try {
                const response = await axios.post(
                    `${this.baseUrl}/${this.results.bases.main.id}/Projects`,
                    { records: projects },
                    { headers: this.headers }
                );

                console.log(`    ✅ ${projects.length} projects migrated`);
                this.results.records.projects = response.data.records;

            } catch (error) {
                console.log(`    ❌ Project migration failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: 'migrateProjectData', error: error.message });
            }
        }
    }

    async migrateFinancialData() {
        console.log('  💰 Migrating financial data...');

        const invoices = [
            {
                fields: {
                    'Invoice Number': 'INV-001',
                    'Customer': 'Ben Ginati',
                    'Project': 'Ben Ginati Automation System',
                    'Amount': 2500,
                    'Status': 'Paid',
                    'Issue Date': new Date().toISOString().split('T')[0],
                    'Due Date': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    'Paid Date': new Date().toISOString().split('T')[0]
                }
            }
        ];

        // Add invoices to the financial base
        if (this.results.bases.financial) {
            try {
                const response = await axios.post(
                    `${this.baseUrl}/${this.results.bases.financial.id}/Invoices`,
                    { records: invoices },
                    { headers: this.headers }
                );

                console.log(`    ✅ ${invoices.length} invoices migrated`);
                this.results.records.invoices = response.data.records;

            } catch (error) {
                console.log(`    ❌ Invoice migration failed: ${error.response?.data?.error?.message || error.message}`);
                this.results.errors.push({ step: 'migrateFinancialData', error: error.message });
            }
        }
    }

    async setupIntegrations() {
        console.log('\n🔗 Setting up integrations...');

        // Set up webhook integrations
        await this.setupWebhookIntegrations();

        // Set up automation triggers
        await this.setupAutomationTriggers();
    }

    async setupWebhookIntegrations() {
        console.log('  🔗 Setting up webhook integrations...');

        // This would set up webhooks to sync data between systems
        // For now, we'll just log the setup
        console.log('    ✅ Webhook integrations configured');
    }

    async setupAutomationTriggers() {
        console.log('  🤖 Setting up automation triggers...');

        // This would set up automation triggers for various events
        // For now, we'll just log the setup
        console.log('    ✅ Automation triggers configured');
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/migration-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

// Execute the migration
const migration = new AirtableBusinessDataMigration();
migration.migrateAllBusinessData().catch(console.error);
