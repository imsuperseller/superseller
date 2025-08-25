#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableFieldSetup {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.bases = {
            'core': 'app4nJpP1ytGukXQT',
            'finance': 'app6yzlm67lRNuQZD',
            'marketing': 'appQhVkIaWoGJG301',
            'operations': 'app6saCaH88uK3kCO',
            'customers': 'appSCBZk03GUCTfhN'
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: {},
            errors: []
        };
    }

    async addAllFields() {
        console.log('🔧 AIRTABLE FIELD SETUP');
        console.log('========================');
        console.log('Adding detailed fields to all tables...');

        try {
            // Step 1: Get current table structures
            await this.getCurrentStructures();

            // Step 2: Add fields to each base
            await this.addFieldsToCoreBase();
            await this.addFieldsToFinanceBase();
            await this.addFieldsToMarketingBase();
            await this.addFieldsToOperationsBase();
            await this.addFieldsToCustomersBase();

            // Step 3: Save results
            await this.saveResults();

            console.log('\n✅ AIRTABLE FIELD SETUP COMPLETED!');
            console.log('🎯 All detailed fields added to business tables');

        } catch (error) {
            console.error('❌ Field setup failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async getCurrentStructures() {
        console.log('\n📊 Getting current table structures...');

        for (const [baseName, baseId] of Object.entries(this.bases)) {
            try {
                const response = await axios.get(`${this.baseUrl}/meta/bases/${baseId}/tables`, {
                    headers: this.headers
                });

                const tables = response.data.tables || [];
                console.log(`  📋 ${baseName}: ${tables.length} tables found`);

                this.results.bases[baseName] = {
                    id: baseId,
                    tables: tables.map(t => ({ id: t.id, name: t.name, fields: t.fields }))
                };

            } catch (error) {
                console.error(`  ❌ Failed to get ${baseName} structure: ${error.message}`);
            }
        }
    }

    async addFieldsToCoreBase() {
        console.log('\n🏢 Adding fields to Core Business Operations...');
        const baseId = this.bases['core'];

        const fieldDefinitions = {
            'Companies': [
                {
                    name: 'Company Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Client' }, { name: 'Vendor' }, { name: 'Partner' }, { name: 'Internal' }
                        ]
                    }
                },
                { name: 'Industry', type: 'singleLineText' },
                { name: 'Website', type: 'url' },
                { name: 'Phone', type: 'phoneNumber' },
                { name: 'Address', type: 'longText' },
                { name: 'Tax ID', type: 'singleLineText' },
                { name: 'Founded Date', type: 'date' },
                { name: 'Employee Count', type: 'number' },
                { name: 'Annual Revenue', type: 'currency' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }
                        ]
                    }
                },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Contacts': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Email', type: 'email' },
                { name: 'Phone', type: 'phoneNumber' },
                { name: 'Role', type: 'singleLineText' },
                { name: 'Department', type: 'singleLineText' },
                {
                    name: 'Contact Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Customer' }, { name: 'Vendor' }, { name: 'Team Member' }, { name: 'Partner' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Lead' }
                        ]
                    }
                },
                { name: 'LinkedIn', type: 'url' },
                { name: 'Twitter', type: 'url' },
                { name: 'Birthday', type: 'date' },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Contact', type: 'date' }
            ],
            'Projects': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Project Manager', type: 'singleLineText' },
                {
                    name: 'Project Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Client Project' }, { name: 'Internal' }, { name: 'R&D' }, { name: 'Maintenance' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Planning' }, { name: 'In Progress' }, { name: 'On Hold' }, { name: 'Completed' }, { name: 'Cancelled' }
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
                { name: 'Start Date', type: 'date' },
                { name: 'End Date', type: 'date' },
                { name: 'Budget', type: 'currency' },
                { name: 'Description', type: 'longText' },
                { name: 'Requirements', type: 'longText' },
                { name: 'Deliverables', type: 'longText' },
                { name: 'Risk Assessment', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Tasks': [
                { name: 'Project', type: 'singleLineText' },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Created By', type: 'singleLineText' },
                {
                    name: 'Task Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Development' }, { name: 'Design' }, { name: 'Content' }, { name: 'Testing' }, { name: 'Deployment' }, { name: 'Maintenance' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'To Do' }, { name: 'In Progress' }, { name: 'Review' }, { name: 'Done' }, { name: 'Cancelled' }
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
                { name: 'Due Date', type: 'date' },
                { name: 'Estimated Hours', type: 'number' },
                { name: 'Description', type: 'longText' },
                { name: 'Acceptance Criteria', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Time Tracking': [
                { name: 'Project', type: 'singleLineText' },
                { name: 'Task', type: 'singleLineText' },
                { name: 'Person', type: 'singleLineText' },
                { name: 'Date', type: 'date' },
                { name: 'Start Time', type: 'dateTime' },
                { name: 'End Time', type: 'dateTime' },
                { name: 'Duration', type: 'number' },
                { name: 'Billable Hours', type: 'number' },
                { name: 'Rate', type: 'currency' },
                { name: 'Total Amount', type: 'currency' },
                { name: 'Description', type: 'longText' },
                {
                    name: 'Category', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Development' }, { name: 'Design' }, { name: 'Meeting' }, { name: 'Research' }, { name: 'Support' }
                        ]
                    }
                },
                { name: 'Approved', type: 'checkbox' },
                { name: 'Approved By', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Documents': [
                { name: 'Project', type: 'singleLineText' },
                { name: 'Company', type: 'singleLineText' },
                {
                    name: 'Document Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Contract' }, { name: 'Proposal' }, { name: 'Invoice' }, { name: 'Report' }, { name: 'Manual' }, { name: 'Code' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Draft' }, { name: 'Review' }, { name: 'Approved' }, { name: 'Published' }, { name: 'Archived' }
                        ]
                    }
                },
                { name: 'File', type: 'multipleAttachments' },
                { name: 'File Size', type: 'number' },
                { name: 'File Type', type: 'singleLineText' },
                { name: 'Version', type: 'singleLineText' },
                { name: 'Created By', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Modified', type: 'date' },
                { name: 'Expiry Date', type: 'date' },
                { name: 'Description', type: 'longText' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToFinanceBase() {
        console.log('\n💰 Adding fields to Financial Management...');
        const baseId = this.bases['finance'];

        const fieldDefinitions = {
            'Invoices': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Project', type: 'singleLineText' },
                { name: 'Contact', type: 'singleLineText' },
                {
                    name: 'Invoice Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Standard' }, { name: 'Recurring' }, { name: 'Credit' }, { name: 'Debit' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Draft' }, { name: 'Sent' }, { name: 'Paid' }, { name: 'Overdue' }, { name: 'Cancelled' }
                        ]
                    }
                },
                { name: 'Issue Date', type: 'date' },
                { name: 'Due Date', type: 'date' },
                { name: 'Payment Terms', type: 'singleLineText' },
                { name: 'Subtotal', type: 'currency' },
                { name: 'Tax Rate', type: 'number' },
                { name: 'Tax Amount', type: 'currency' },
                { name: 'Total Amount', type: 'currency' },
                { name: 'Amount Paid', type: 'currency' },
                { name: 'Balance Due', type: 'currency' },
                {
                    name: 'Payment Method', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Credit Card' }, { name: 'Bank Transfer' }, { name: 'Check' }, { name: 'Cash' }
                        ]
                    }
                },
                { name: 'Payment Date', type: 'date' },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Payments': [
                { name: 'Invoice', type: 'singleLineText' },
                { name: 'Company', type: 'singleLineText' },
                {
                    name: 'Payment Method', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Credit Card' }, { name: 'Bank Transfer' }, { name: 'Check' }, { name: 'Cash' }
                        ]
                    }
                },
                { name: 'Payment Date', type: 'date' },
                { name: 'Amount', type: 'currency' },
                { name: 'Reference Number', type: 'singleLineText' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Pending' }, { name: 'Completed' }, { name: 'Failed' }, { name: 'Refunded' }
                        ]
                    }
                },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Expenses': [
                { name: 'Project', type: 'singleLineText' },
                {
                    name: 'Category', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Travel' }, { name: 'Office' }, { name: 'Software' }, { name: 'Hardware' }, { name: 'Marketing' }, { name: 'Legal' }
                        ]
                    }
                },
                { name: 'Amount', type: 'currency' },
                {
                    name: 'Currency', type: 'singleSelect', options: {
                        choices: [
                            { name: 'USD' }, { name: 'EUR' }, { name: 'ILS' }
                        ]
                    }
                },
                { name: 'Expense Date', type: 'date' },
                { name: 'Receipt', type: 'multipleAttachments' },
                { name: 'Vendor', type: 'singleLineText' },
                { name: 'Description', type: 'longText' },
                { name: 'Approved', type: 'checkbox' },
                { name: 'Approved By', type: 'singleLineText' },
                { name: 'Reimbursed', type: 'checkbox' },
                { name: 'Reimbursement Date', type: 'date' },
                { name: 'Created Date', type: 'date' }
            ],
            'Revenue': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Project', type: 'singleLineText' },
                {
                    name: 'Revenue Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Project Revenue' }, { name: 'Recurring' }, { name: 'One-time' }, { name: 'Commission' }
                        ]
                    }
                },
                { name: 'Amount', type: 'currency' },
                {
                    name: 'Currency', type: 'singleSelect', options: {
                        choices: [
                            { name: 'USD' }, { name: 'EUR' }, { name: 'ILS' }
                        ]
                    }
                },
                { name: 'Revenue Date', type: 'date' },
                { name: 'Invoice', type: 'singleLineText' },
                { name: 'Description', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Budgets': [
                { name: 'Project', type: 'singleLineText' },
                {
                    name: 'Budget Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Project' }, { name: 'Department' }, { name: 'Company' }, { name: 'Annual' }
                        ]
                    }
                },
                { name: 'Period Start', type: 'date' },
                { name: 'Period End', type: 'date' },
                { name: 'Planned Amount', type: 'currency' },
                { name: 'Actual Amount', type: 'currency' },
                { name: 'Variance', type: 'currency' },
                { name: 'Variance Percentage', type: 'number' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'On Track' }, { name: 'Over Budget' }, { name: 'Under Budget' }
                        ]
                    }
                },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Tax Records': [
                { name: 'Company', type: 'singleLineText' },
                {
                    name: 'Tax Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Income Tax' }, { name: 'VAT' }, { name: 'Sales Tax' }, { name: 'Property Tax' }
                        ]
                    }
                },
                { name: 'Tax Period', type: 'singleLineText' },
                { name: 'Due Date', type: 'date' },
                { name: 'Amount', type: 'currency' },
                { name: 'Amount Paid', type: 'currency' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Pending' }, { name: 'Paid' }, { name: 'Overdue' }
                        ]
                    }
                },
                { name: 'Filing Date', type: 'date' },
                { name: 'Reference Number', type: 'singleLineText' },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToMarketingBase() {
        console.log('\n📢 Adding fields to Marketing & Sales...');
        const baseId = this.bases['marketing'];

        const fieldDefinitions = {
            'Leads': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Contact Person', type: 'singleLineText' },
                { name: 'Email', type: 'email' },
                { name: 'Phone', type: 'phoneNumber' },
                {
                    name: 'Source', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Website' }, { name: 'Social Media' }, { name: 'Referral' }, { name: 'Cold Call' }, { name: 'Event' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'New' }, { name: 'Contacted' }, { name: 'Qualified' }, { name: 'Unqualified' }, { name: 'Converted' }
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
                { name: 'Estimated Value', type: 'currency' },
                { name: 'Industry', type: 'singleLineText' },
                { name: 'Notes', type: 'longText' },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Contact', type: 'date' }
            ],
            'Opportunities': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Contact', type: 'singleLineText' },
                { name: 'Lead', type: 'singleLineText' },
                {
                    name: 'Stage', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Prospecting' }, { name: 'Qualification' }, { name: 'Proposal' }, { name: 'Negotiation' }, { name: 'Closed Won' }, { name: 'Closed Lost' }
                        ]
                    }
                },
                { name: 'Probability', type: 'number' },
                { name: 'Expected Value', type: 'currency' },
                { name: 'Expected Close Date', type: 'date' },
                { name: 'Actual Close Date', type: 'date' },
                { name: 'Won Amount', type: 'currency' },
                { name: 'Lost Reason', type: 'singleLineText' },
                { name: 'Description', type: 'longText' },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Campaigns': [
                {
                    name: 'Campaign Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Email' }, { name: 'Social Media' }, { name: 'Content' }, { name: 'Event' }, { name: 'Paid Ads' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Planning' }, { name: 'Active' }, { name: 'Paused' }, { name: 'Completed' }
                        ]
                    }
                },
                { name: 'Start Date', type: 'date' },
                { name: 'End Date', type: 'date' },
                { name: 'Budget', type: 'currency' },
                { name: 'Actual Spend', type: 'currency' },
                { name: 'Target Audience', type: 'longText' },
                { name: 'Goals', type: 'longText' },
                { name: 'Results', type: 'longText' },
                { name: 'ROI', type: 'number' },
                { name: 'Created By', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Content': [
                {
                    name: 'Content Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Blog Post' }, { name: 'Video' }, { name: 'Podcast' }, { name: 'Whitepaper' }, { name: 'Case Study' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Draft' }, { name: 'Review' }, { name: 'Published' }, { name: 'Archived' }
                        ]
                    }
                },
                { name: 'Author', type: 'singleLineText' },
                { name: 'Campaign', type: 'singleLineText' },
                { name: 'Publish Date', type: 'date' },
                { name: 'URL', type: 'url' },
                { name: 'Description', type: 'longText' },
                { name: 'Keywords', type: 'multipleSelect' },
                { name: 'Performance Metrics', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Social Media': [
                {
                    name: 'Platform', type: 'singleSelect', options: {
                        choices: [
                            { name: 'LinkedIn' }, { name: 'Twitter' }, { name: 'Facebook' }, { name: 'Instagram' }, { name: 'YouTube' }
                        ]
                    }
                },
                {
                    name: 'Content Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Text' }, { name: 'Image' }, { name: 'Video' }, { name: 'Link' }, { name: 'Poll' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Draft' }, { name: 'Scheduled' }, { name: 'Published' }, { name: 'Archived' }
                        ]
                    }
                },
                { name: 'Scheduled Date', type: 'dateTime' },
                { name: 'Published Date', type: 'dateTime' },
                { name: 'Content', type: 'longText' },
                { name: 'URL', type: 'url' },
                { name: 'Engagement Metrics', type: 'longText' },
                { name: 'Campaign', type: 'singleLineText' },
                { name: 'Created By', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Analytics': [
                {
                    name: 'Metric Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Traffic' }, { name: 'Conversion' }, { name: 'Revenue' }, { name: 'Engagement' }, { name: 'Performance' }
                        ]
                    }
                },
                {
                    name: 'Period', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Daily' }, { name: 'Weekly' }, { name: 'Monthly' }, { name: 'Quarterly' }, { name: 'Yearly' }
                        ]
                    }
                },
                { name: 'Date', type: 'date' },
                { name: 'Value', type: 'number' },
                { name: 'Target', type: 'number' },
                { name: 'Variance', type: 'number' },
                { name: 'Variance Percentage', type: 'number' },
                { name: 'Source', type: 'singleLineText' },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToOperationsBase() {
        console.log('\n⚙️ Adding fields to Operations & Automation...');
        const baseId = this.bases['operations'];

        const fieldDefinitions = {
            'Workflows': [
                {
                    name: 'Workflow Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'n8n' }, { name: 'Airtable' }, { name: 'Zapier' }, { name: 'Custom' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Development' }, { name: 'Testing' }
                        ]
                    }
                },
                { name: 'Trigger', type: 'singleLineText' },
                { name: 'Actions', type: 'longText' },
                { name: 'Schedule', type: 'singleLineText' },
                { name: 'Last Run', type: 'dateTime' },
                { name: 'Next Run', type: 'dateTime' },
                { name: 'Success Rate', type: 'number' },
                { name: 'Error Count', type: 'number' },
                { name: 'Performance Metrics', type: 'longText' },
                { name: 'Documentation', type: 'longText' },
                { name: 'Created By', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Automations': [
                {
                    name: 'Platform', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Airtable' }, { name: 'n8n' }, { name: 'Zapier' }, { name: 'Custom' }
                        ]
                    }
                },
                {
                    name: 'Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Trigger' }, { name: 'Action' }, { name: 'Scheduled' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Error' }
                        ]
                    }
                },
                { name: 'Trigger Conditions', type: 'longText' },
                { name: 'Actions', type: 'longText' },
                { name: 'Schedule', type: 'singleLineText' },
                { name: 'Last Run', type: 'dateTime' },
                { name: 'Next Run', type: 'dateTime' },
                { name: 'Success Count', type: 'number' },
                { name: 'Error Count', type: 'number' },
                { name: 'Performance Metrics', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Integrations': [
                {
                    name: 'Platform', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Airtable' }, { name: 'n8n' }, { name: 'Zapier' }, { name: 'Webflow' }, { name: 'QuickBooks' }, { name: 'Slack' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Development' }, { name: 'Testing' }
                        ]
                    }
                },
                { name: 'API Key', type: 'singleLineText' },
                { name: 'Endpoint URL', type: 'url' },
                {
                    name: 'Authentication Method', type: 'singleSelect', options: {
                        choices: [
                            { name: 'API Key' }, { name: 'OAuth' }, { name: 'Basic Auth' }
                        ]
                    }
                },
                { name: 'Last Sync', type: 'dateTime' },
                { name: 'Sync Frequency', type: 'singleLineText' },
                { name: 'Error Count', type: 'number' },
                { name: 'Performance Metrics', type: 'longText' },
                { name: 'Documentation', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'System Logs': [
                {
                    name: 'System', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Airtable' }, { name: 'n8n' }, { name: 'Webflow' }, { name: 'Custom' }
                        ]
                    }
                },
                {
                    name: 'Log Level', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Info' }, { name: 'Warning' }, { name: 'Error' }, { name: 'Critical' }
                        ]
                    }
                },
                { name: 'Message', type: 'longText' },
                { name: 'Details', type: 'longText' },
                { name: 'Timestamp', type: 'dateTime' },
                { name: 'User', type: 'singleLineText' },
                { name: 'IP Address', type: 'singleLineText' },
                { name: 'User Agent', type: 'longText' },
                { name: 'Resolved', type: 'checkbox' },
                { name: 'Resolution Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Maintenance': [
                {
                    name: 'System', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Airtable' }, { name: 'n8n' }, { name: 'Webflow' }, { name: 'Server' }, { name: 'Database' }
                        ]
                    }
                },
                {
                    name: 'Maintenance Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Scheduled' }, { name: 'Emergency' }, { name: 'Update' }, { name: 'Backup' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Scheduled' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'Cancelled' }
                        ]
                    }
                },
                { name: 'Scheduled Date', type: 'dateTime' },
                { name: 'Start Time', type: 'dateTime' },
                { name: 'End Time', type: 'dateTime' },
                { name: 'Duration', type: 'number' },
                { name: 'Description', type: 'longText' },
                { name: 'Actions Taken', type: 'longText' },
                { name: 'Issues Found', type: 'longText' },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Backups': [
                {
                    name: 'System', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Airtable' }, { name: 'n8n' }, { name: 'Webflow' }, { name: 'Database' }, { name: 'Files' }
                        ]
                    }
                },
                {
                    name: 'Backup Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Full' }, { name: 'Incremental' }, { name: 'Differential' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Scheduled' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'Failed' }
                        ]
                    }
                },
                { name: 'Backup Date', type: 'dateTime' },
                { name: 'File Size', type: 'number' },
                { name: 'Location', type: 'singleLineText' },
                { name: 'Retention Period', type: 'number' },
                { name: 'Expiry Date', type: 'date' },
                {
                    name: 'Verification Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Pending' }, { name: 'Verified' }, { name: 'Failed' }
                        ]
                    }
                },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToCustomersBase() {
        console.log('\n👥 Adding fields to Customer Success...');
        const baseId = this.bases['customers'];

        const fieldDefinitions = {
            'Customers': [
                { name: 'Company', type: 'singleLineText' },
                { name: 'Contact Person', type: 'singleLineText' },
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
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Churned' }, { name: 'Prospect' }
                        ]
                    }
                },
                {
                    name: 'Onboarding Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Not Started' }, { name: 'In Progress' }, { name: 'Completed' }
                        ]
                    }
                },
                { name: 'Subscription Plan', type: 'singleLineText' },
                { name: 'Monthly Recurring Revenue', type: 'currency' },
                { name: 'Total Revenue', type: 'currency' },
                { name: 'Customer Since', type: 'date' },
                { name: 'Last Activity', type: 'date' },
                { name: 'Notes', type: 'longText' },
                { name: 'Success Manager', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Support Tickets': [
                { name: 'Customer', type: 'singleLineText' },
                { name: 'Contact', type: 'singleLineText' },
                { name: 'Project', type: 'singleLineText' },
                {
                    name: 'Priority', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Open' }, { name: 'In Progress' }, { name: 'Waiting for Customer' }, { name: 'Resolved' }, { name: 'Closed' }
                        ]
                    }
                },
                {
                    name: 'Category', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Technical' }, { name: 'Billing' }, { name: 'Feature Request' }, { name: 'Bug Report' }
                        ]
                    }
                },
                { name: 'Subject', type: 'singleLineText' },
                { name: 'Description', type: 'longText' },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Updated Date', type: 'date' },
                { name: 'Resolved Date', type: 'date' },
                { name: 'Resolution Time', type: 'number' },
                { name: 'Customer Satisfaction', type: 'number' }
            ],
            'Onboarding': [
                { name: 'Customer', type: 'singleLineText' },
                { name: 'Onboarding Manager', type: 'singleLineText' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Not Started' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'On Hold' }
                        ]
                    }
                },
                { name: 'Start Date', type: 'date' },
                { name: 'Completion Date', type: 'date' },
                { name: 'Duration', type: 'number' },
                { name: 'Milestones', type: 'longText' },
                { name: 'Completed Milestones', type: 'longText' },
                { name: 'Next Steps', type: 'longText' },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Success Metrics': [
                { name: 'Customer', type: 'singleLineText' },
                {
                    name: 'Metric Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Usage' }, { name: 'Engagement' }, { name: 'Satisfaction' }, { name: 'Revenue' }
                        ]
                    }
                },
                { name: 'Metric Name', type: 'singleLineText' },
                { name: 'Value', type: 'number' },
                { name: 'Target', type: 'number' },
                { name: 'Variance', type: 'number' },
                {
                    name: 'Period', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Daily' }, { name: 'Weekly' }, { name: 'Monthly' }, { name: 'Quarterly' }
                        ]
                    }
                },
                { name: 'Date', type: 'date' },
                { name: 'Notes', type: 'longText' },
                { name: 'Created Date', type: 'date' }
            ],
            'Feedback': [
                { name: 'Customer', type: 'singleLineText' },
                { name: 'Contact', type: 'singleLineText' },
                {
                    name: 'Feedback Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Survey' }, { name: 'Interview' }, { name: 'Review' }, { name: 'Support' }
                        ]
                    }
                },
                { name: 'Rating', type: 'number' },
                {
                    name: 'Category', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Product' }, { name: 'Service' }, { name: 'Support' }, { name: 'Overall' }
                        ]
                    }
                },
                { name: 'Feedback', type: 'longText' },
                { name: 'Action Items', type: 'longText' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'New' }, { name: 'In Review' }, { name: 'Actioned' }, { name: 'Closed' }
                        ]
                    }
                },
                { name: 'Assigned To', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ],
            'Retention': [
                { name: 'Customer', type: 'singleLineText' },
                {
                    name: 'Retention Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Monthly' }, { name: 'Quarterly' }, { name: 'Annual' }
                        ]
                    }
                },
                { name: 'Period Start', type: 'date' },
                { name: 'Period End', type: 'date' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Retained' }, { name: 'Churned' }, { name: 'At Risk' }
                        ]
                    }
                },
                { name: 'Churn Reason', type: 'singleLineText' },
                { name: 'Retention Score', type: 'number' },
                { name: 'Risk Factors', type: 'longText' },
                { name: 'Intervention Actions', type: 'longText' },
                { name: 'Success Manager', type: 'singleLineText' },
                { name: 'Created Date', type: 'date' },
                { name: 'Last Updated', type: 'date' }
            ]
        };

        await this.addFieldsToBase(baseId, fieldDefinitions);
    }

    async addFieldsToBase(baseId, fieldDefinitions) {
        const tables = this.results.bases[Object.keys(this.bases).find(k => this.bases[k] === baseId)]?.tables || [];

        for (const table of tables) {
            const fields = fieldDefinitions[table.name];
            if (fields) {
                console.log(`  📋 Adding fields to ${table.name}...`);
                for (const field of fields) {
                    await this.addFieldToTable(baseId, table.id, field);
                }
            }
        }
    }

    async addFieldToTable(baseId, tableId, fieldDef) {
        try {
            const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
                name: fieldDef.name,
                type: fieldDef.type,
                ...(fieldDef.options && { options: fieldDef.options })
            }, {
                headers: this.headers
            });

            console.log(`    ✅ Added field "${fieldDef.name}"`);

        } catch (error) {
            console.error(`    ❌ Failed to add field "${fieldDef.name}": ${error.message}`);
            this.results.errors.push({
                step: 'addField',
                base: baseId,
                table: tableId,
                field: fieldDef.name,
                error: error.message
            });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/field-setup-results-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const setup = new AirtableFieldSetup();
setup.addAllFields().catch(console.error);
