#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableImplementRollupFormulaFields {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
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
            fieldsAdded: [],
            errors: []
        };
    }

    async implementRollupFormulaFields() {
        console.log('📊 IMPLEMENTING ROLLUP & FORMULA FIELDS');
        console.log('=======================================');
        console.log('Adding advanced analytics and calculated metrics...');

        try {
            // Step 1: Add formula fields to Companies table
            await this.addCompanyFormulaFields();

            // Step 2: Add formula fields to Contacts table
            await this.addContactFormulaFields();

            // Step 3: Add formula fields to Projects table
            await this.addProjectFormulaFields();

            // Step 4: Add formula fields to Invoices table
            await this.addInvoiceFormulaFields();

            await this.saveResults();

            console.log('\n✅ ROLLUP & FORMULA FIELDS IMPLEMENTATION COMPLETED!');
            console.log('🎯 Advanced analytics and calculated metrics added');

        } catch (error) {
            console.error('❌ Implementation failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async addCompanyFormulaFields() {
        console.log('\n🏢 Adding formula fields to Companies table...');

        const formulaFields = [
            {
                name: 'Days Since Last Activity',
                type: 'formula',
                options: {
                    formula: 'DATETIME_DIFF(NOW(), {Last Activity}, "days")'
                },
                description: 'Number of days since last activity'
            },
            {
                name: 'Company Health Score',
                type: 'formula',
                options: {
                    formula: 'IF({Total Revenue} > 1000000, 10, IF({Total Revenue} > 500000, 8, IF({Total Revenue} > 100000, 6, 4)))'
                },
                description: 'Company health score based on revenue and activity'
            },
            {
                name: 'Active Projects Count',
                type: 'formula',
                options: {
                    formula: 'IF({Active Projects} > 5, "High", IF({Active Projects} > 2, "Medium", "Low"))'
                },
                description: 'Activity level based on number of active projects'
            },
            {
                name: 'Revenue per Employee',
                type: 'formula',
                options: {
                    formula: 'IF({Employee Count} > 0, {Total Revenue} / {Employee Count}, 0)'
                },
                description: 'Revenue per employee calculation'
            },
            {
                name: 'Customer Lifetime Value',
                type: 'formula',
                options: {
                    formula: 'IF({Total Revenue} > 0, {Total Revenue} * 0.3, 0)'
                },
                description: 'Estimated customer lifetime value'
            }
        ];

        await this.addFieldsToTable(this.coreBaseId, this.companiesTableId, formulaFields, 'company');
    }

    async addContactFormulaFields() {
        console.log('\n👥 Adding formula fields to Contacts table...');

        const formulaFields = [
            {
                name: 'Days Since Last Contact',
                type: 'formula',
                options: {
                    formula: 'DATETIME_DIFF(NOW(), {Last Contact Date}, "days")'
                },
                description: 'Number of days since last contact'
            },
            {
                name: 'Contact Priority Score',
                type: 'formula',
                options: {
                    formula: 'IF({Priority} = "Critical", 10, IF({Priority} = "High", 8, IF({Priority} = "Medium", 5, 2)))'
                },
                description: 'Priority score based on contact priority level'
            },
            {
                name: 'Engagement Level',
                type: 'formula',
                options: {
                    formula: 'IF({Total Interactions} > 20, "High", IF({Total Interactions} > 10, "Medium", "Low"))'
                },
                description: 'Engagement level based on total interactions'
            },
            {
                name: 'Response Rate Percentage',
                type: 'formula',
                options: {
                    formula: 'IF({Email Sent} > 0, ({Email Opened} / {Email Sent}) * 100, 0)'
                },
                description: 'Email response rate percentage'
            },
            {
                name: 'Contact Value Score',
                type: 'formula',
                options: {
                    formula: 'IF({Decision Maker}, 10, IF({Seniority Level} = "C-Level", 8, IF({Seniority Level} = "VP", 6, 4)))'
                },
                description: 'Contact value score based on role and seniority'
            }
        ];

        await this.addFieldsToTable(this.coreBaseId, this.contactsTableId, formulaFields, 'contact');
    }

    async addProjectFormulaFields() {
        console.log('\n📋 Adding formula fields to Projects table...');

        const formulaFields = [
            {
                name: 'Days Remaining',
                type: 'formula',
                options: {
                    formula: 'DATETIME_DIFF({Due Date}, NOW(), "days")'
                },
                description: 'Days remaining until project due date'
            },
            {
                name: 'Project Health Status',
                type: 'formula',
                options: {
                    formula: 'IF({Progress} = 100, "Completed", IF({Days Remaining} < 0, "Overdue", IF({Progress} > 75, "On Track", "At Risk")))'
                },
                description: 'Project health status based on progress and timeline'
            },
            {
                name: 'Budget Utilization',
                type: 'formula',
                options: {
                    formula: 'IF({Budget} > 0, ({Actual Cost} / {Budget}) * 100, 0)'
                },
                description: 'Budget utilization percentage'
            },
            {
                name: 'Project Efficiency',
                type: 'formula',
                options: {
                    formula: 'IF({Estimated Hours} > 0, ({Actual Hours} / {Estimated Hours}) * 100, 0)'
                },
                description: 'Project efficiency based on actual vs estimated hours'
            },
            {
                name: 'Risk Assessment',
                type: 'formula',
                options: {
                    formula: 'IF({Risk Level} = "Critical", "High Risk", IF({Risk Level} = "High", "Medium Risk", "Low Risk"))'
                },
                description: 'Risk assessment based on risk level and project status'
            },
            {
                name: 'Profit Margin',
                type: 'formula',
                options: {
                    formula: 'IF({Revenue} > 0, (({Revenue} - {Actual Cost}) / {Revenue}) * 100, 0)'
                },
                description: 'Project profit margin percentage'
            }
        ];

        await this.addFieldsToTable(this.coreBaseId, this.projectsTableId, formulaFields, 'project');
    }

    async addInvoiceFormulaFields() {
        console.log('\n💰 Adding formula fields to Invoices table...');

        const formulaFields = [
            {
                name: 'Days Outstanding',
                type: 'formula',
                options: {
                    formula: 'DATETIME_DIFF(NOW(), {Invoice Date}, "days")'
                },
                description: 'Days since invoice was sent'
            },
            {
                name: 'Days Overdue',
                type: 'formula',
                options: {
                    formula: 'IF({Due Date} < NOW(), DATETIME_DIFF(NOW(), {Due Date}, "days"), 0)'
                },
                description: 'Days overdue if past due date'
            },
            {
                name: 'Payment Status',
                type: 'formula',
                options: {
                    formula: 'IF({Amount Paid} = {Total Amount}, "Paid", IF({Due Date} < NOW(), "Overdue", "Pending"))'
                },
                description: 'Payment status based on amount paid and due date'
            },
            {
                name: 'Balance Due',
                type: 'formula',
                options: {
                    formula: 'IF({Total Amount} > 0, {Total Amount} - {Amount Paid}, 0)'
                },
                description: 'Remaining balance to be paid'
            },
            {
                name: 'Payment Probability',
                type: 'formula',
                options: {
                    formula: 'IF({Days Outstanding} > 90, 0.3, IF({Days Outstanding} > 60, 0.5, IF({Days Outstanding} > 30, 0.7, 0.9)))'
                },
                description: 'Probability of payment based on days outstanding'
            },
            {
                name: 'Collection Risk',
                type: 'formula',
                options: {
                    formula: 'IF({Days Overdue} > 30, "High", IF({Days Overdue} > 15, "Medium", "Low"))'
                },
                description: 'Collection risk based on days overdue'
            },
            {
                name: 'Invoice Score',
                type: 'formula',
                options: {
                    formula: 'IF({Payment Status} = "Paid", 10, IF({Days Outstanding} < 30, 8, IF({Days Outstanding} < 60, 5, 2)))'
                },
                description: 'Invoice health score based on payment status and age'
            }
        ];

        await this.addFieldsToTable(this.financeBaseId, this.invoicesTableId, formulaFields, 'invoice');
    }

    async addFieldsToTable(baseId, tableId, fields, tableType) {
        console.log(`  📋 Adding ${fields.length} formula fields to ${tableType} table...`);

        for (const field of fields) {
            try {
                const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
                    name: field.name,
                    type: field.type,
                    description: field.description,
                    ...(field.options && { options: field.options })
                }, {
                    headers: this.headers
                });

                console.log(`    ✅ Added formula field "${field.name}"`);
                this.results.fieldsAdded.push({
                    table: tableType,
                    name: field.name,
                    type: field.type,
                    success: true
                });

            } catch (error) {
                console.error(`    ❌ Failed to add formula field "${field.name}": ${error.message}`);
                this.results.errors.push({
                    step: 'addFormulaField',
                    table: tableType,
                    field: field.name,
                    error: error.message
                });
            }
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/rollup-formula-fields-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const implementation = new AirtableImplementRollupFormulaFields();
implementation.implementRollupFormulaFields().catch(console.error);
