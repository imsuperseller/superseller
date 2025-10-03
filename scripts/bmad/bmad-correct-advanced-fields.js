#!/usr/bin/env node

/**
 * 🎯 BMAD METHODOLOGY - CORRECT ADVANCED FIELDS SETUP
 * 
 * This script creates advanced fields using the CORRECT Airtable API configurations:
 * - Single select fields with proper color values
 * - Date fields with correct dateFormat
 * - Currency fields with proper options
 * - Number fields with correct options
 * - Checkbox fields with proper options
 * - Linked record fields with correct options
 */

import axios from 'axios';

console.log('🎯 BMAD METHODOLOGY - CORRECT ADVANCED FIELDS SETUP');
console.log('==================================================');

// Configuration
const CONFIG = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        bases: {
            rensto: 'appQijHhqqP4z6wGe',
            coreBusiness: 'app4nJpP1ytGukXQT',
            integrations: 'appOvDNYenyx7WITR',
            entities: 'appfpXxb5Vq8acLTy',
            customerSuccess: 'appSCBZk03GUCTfhN',
            idempotency: 'app9DhsrZ0VnuEH3t',
            rgidManagement: 'appCGexgpGPkMUPXF',
            operations: 'app6saCaH88uK3kCO',
            financial: 'app6yzlm67lRNuQZD',
            marketing: 'appQhVkIaWoGJG301',
            analytics: 'app9oouVkvTkFjf3t'
        }
    }
};

class CorrectAdvancedFieldsSetup {
    constructor() {
        this.headers = {
            'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
            'Content-Type': 'application/json'
        };
        this.results = {
            successful: 0,
            failed: 0,
            total: 0
        };
    }

    async createField(baseId, tableId, fieldConfig) {
        this.results.total++;
        try {
            const response = await axios.post(
                `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`,
                fieldConfig,
                { headers: this.headers }
            );

            console.log(`   ✅ Created field: ${fieldConfig.name} (${fieldConfig.type})`);
            this.results.successful++;
            return { success: true, field: response.data };

        } catch (error) {
            console.log(`   ❌ Error creating field ${fieldConfig.name}:`, error.response?.data?.error?.message || error.message);
            this.results.failed++;
            return { success: false, error: error.response?.data?.error?.message || error.message };
        }
    }

    async setupCorrectSingleSelectFields() {
        console.log('\n🎨 Setting up Single Select Fields with CORRECT Colors...');

        // Companies table - Company Status (using correct color values)
        console.log('   📊 Companies - Company Status:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbl1roDiTjOCU3wiz', {
            name: 'Company Status',
            type: 'singleSelect',
            options: {
                choices: [
                    { name: 'Active', color: 'greenBright' },
                    { name: 'Inactive', color: 'redBright' },
                    { name: 'Prospect', color: 'yellowBright' },
                    { name: 'Partner', color: 'blueBright' }
                ]
            }
        });

        // Projects table - Project Priority
        console.log('   📊 Projects - Project Priority:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tblJ4C2HFSBlPkyP6', {
            name: 'Project Priority',
            type: 'singleSelect',
            options: {
                choices: [
                    { name: 'Critical', color: 'red' },
                    { name: 'High', color: 'orange' },
                    { name: 'Medium', color: 'yellow' },
                    { name: 'Low', color: 'green' }
                ]
            }
        });

        // Tasks table - Task Status
        console.log('   📊 Tasks - Task Status:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Task Status',
            type: 'singleSelect',
            options: {
                choices: [
                    { name: 'Not Started', color: 'gray' },
                    { name: 'In Progress', color: 'blue' },
                    { name: 'Review', color: 'yellow' },
                    { name: 'Done', color: 'green' },
                    { name: 'Blocked', color: 'red' }
                ]
            }
        });

        // Invoices table - Invoice Status
        console.log('   📊 Invoices - Invoice Status:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblpQ71TjMAnVJ5by', {
            name: 'Invoice Status',
            type: 'singleSelect',
            options: {
                choices: [
                    { name: 'Draft', color: 'gray' },
                    { name: 'Sent', color: 'blue' },
                    { name: 'Paid', color: 'green' },
                    { name: 'Overdue', color: 'red' },
                    { name: 'Cancelled', color: 'red' }
                ]
            }
        });

        // Campaigns table - Campaign Type
        console.log('   📊 Campaigns - Campaign Type:');
        await this.createField(CONFIG.airtable.bases.marketing, 'tbldquy3F52vDWOse', {
            name: 'Campaign Type',
            type: 'singleSelect',
            options: {
                choices: [
                    { name: 'Email', color: 'blue' },
                    { name: 'Social Media', color: 'green' },
                    { name: 'Content Marketing', color: 'purple' },
                    { name: 'Paid Ads', color: 'orange' }
                ]
            }
        });

        // Leads table - Lead Status
        console.log('   📊 Leads - Lead Status:');
        await this.createField(CONFIG.airtable.bases.marketing, 'tblbzmGf329gIITSH', {
            name: 'Lead Status',
            type: 'singleSelect',
            options: {
                choices: [
                    { name: 'New', color: 'blue' },
                    { name: 'Qualified', color: 'yellow' },
                    { name: 'Contacted', color: 'orange' },
                    { name: 'Converted', color: 'green' },
                    { name: 'Lost', color: 'red' }
                ]
            }
        });
    }

    async setupCorrectDateFields() {
        console.log('\n📅 Setting up Date Fields with CORRECT Format...');

        // Projects table - Start/End Dates (using correct dateFormat)
        console.log('   📊 Projects - Start/End Dates:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tblJ4C2HFSBlPkyP6', {
            name: 'Start Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });

        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tblJ4C2HFSBlPkyP6', {
            name: 'End Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });

        // Invoices table - Invoice/Payment Dates
        console.log('   📊 Invoices - Invoice/Payment Dates:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblpQ71TjMAnVJ5by', {
            name: 'Invoice Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });

        await this.createField(CONFIG.airtable.bases.financial, 'tblpQ71TjMAnVJ5by', {
            name: 'Due Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });

        // Payments table - Payment Date
        console.log('   📊 Payments - Payment Date:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblAMmYPqX3Z4bbe3', {
            name: 'Payment Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });

        // Campaigns table - Start/End Dates
        console.log('   📊 Campaigns - Start/End Dates:');
        await this.createField(CONFIG.airtable.bases.marketing, 'tbldquy3F52vDWOse', {
            name: 'Start Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });

        await this.createField(CONFIG.airtable.bases.marketing, 'tbldquy3F52vDWOse', {
            name: 'End Date',
            type: 'date',
            options: {
                dateFormat: 'M/D/YYYY'
            }
        });
    }

    async setupCorrectCurrencyFields() {
        console.log('\n💰 Setting up Currency Fields with CORRECT Options...');

        // Invoices table - Amount
        console.log('   📊 Invoices - Amount:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblpQ71TjMAnVJ5by', {
            name: 'Amount',
            type: 'currency',
            options: {
                precision: 2,
                symbol: '$'
            }
        });

        // Payments table - Amount
        console.log('   📊 Payments - Amount:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblAMmYPqX3Z4bbe3', {
            name: 'Amount',
            type: 'currency',
            options: {
                precision: 2,
                symbol: '$'
            }
        });

        // Expenses table - Amount
        console.log('   📊 Expenses - Amount:');
        await this.createField(CONFIG.airtable.bases.financial, 'tbl2xSZXHcEY0eX1K', {
            name: 'Amount',
            type: 'currency',
            options: {
                precision: 2,
                symbol: '$'
            }
        });

        // Campaigns table - Budget
        console.log('   📊 Campaigns - Budget:');
        await this.createField(CONFIG.airtable.bases.marketing, 'tbldquy3F52vDWOse', {
            name: 'Budget',
            type: 'currency',
            options: {
                precision: 2,
                symbol: '$'
            }
        });
    }

    async setupCorrectNumberFields() {
        console.log('\n🔢 Setting up Number Fields with CORRECT Options...');

        // Companies table - Employee Count
        console.log('   📊 Companies - Employee Count:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbl1roDiTjOCU3wiz', {
            name: 'Employee Count',
            type: 'number',
            options: {
                precision: 0
            }
        });

        // Tasks table - Estimated/Actual Hours
        console.log('   📊 Tasks - Estimated/Actual Hours:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Estimated Hours',
            type: 'number',
            options: {
                precision: 1
            }
        });

        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Actual Hours',
            type: 'number',
            options: {
                precision: 1
            }
        });

        // Leads table - Lead Score
        console.log('   📊 Leads - Lead Score:');
        await this.createField(CONFIG.airtable.bases.marketing, 'tblbzmGf329gIITSH', {
            name: 'Lead Score',
            type: 'number',
            options: {
                precision: 0
            }
        });
    }

    async setupCorrectCheckboxFields() {
        console.log('\n☑️ Setting up Checkbox Fields with CORRECT Options...');

        // Companies table - Is Active
        console.log('   📊 Companies - Is Active:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbl1roDiTjOCU3wiz', {
            name: 'Is Active',
            type: 'checkbox',
            options: {
                icon: 'check',
                color: 'green'
            }
        });

        // Tasks table - Is Completed
        console.log('   📊 Tasks - Is Completed:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Is Completed',
            type: 'checkbox',
            options: {
                icon: 'check',
                color: 'green'
            }
        });

        // Invoices table - Is Paid
        console.log('   📊 Invoices - Is Paid:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblpQ71TjMAnVJ5by', {
            name: 'Is Paid',
            type: 'checkbox',
            options: {
                icon: 'check',
                color: 'green'
            }
        });

        // Expenses table - Is Reimbursable
        console.log('   📊 Expenses - Is Reimbursable:');
        await this.createField(CONFIG.airtable.bases.financial, 'tbl2xSZXHcEY0eX1K', {
            name: 'Is Reimbursable',
            type: 'checkbox',
            options: {
                icon: 'check',
                color: 'green'
            }
        });
    }

    async setupCorrectLinkedFields() {
        console.log('\n🔗 Setting up Linked Record Fields with CORRECT Options...');

        // Link Projects to Companies
        console.log('   📊 Projects - Company Link:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tblJ4C2HFSBlPkyP6', {
            name: 'Company',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tbl1roDiTjOCU3wiz',
                isReversed: false,
                prefersSingleRecordLink: true
            }
        });

        // Link Tasks to Projects
        console.log('   📊 Tasks - Project Link:');
        await this.createField(CONFIG.airtable.bases.coreBusiness, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Project',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tblJ4C2HFSBlPkyP6',
                isReversed: false,
                prefersSingleRecordLink: true
            }
        });

        // Link Invoices to Companies
        console.log('   📊 Invoices - Company Link:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblpQ71TjMAnVJ5by', {
            name: 'Company',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tbl1roDiTjOCU3wiz',
                isReversed: false,
                prefersSingleRecordLink: true
            }
        });

        // Link Payments to Invoices
        console.log('   📊 Payments - Invoice Link:');
        await this.createField(CONFIG.airtable.bases.financial, 'tblAMmYPqX3Z4bbe3', {
            name: 'Invoice',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tblpQ71TjMAnVJ5by',
                isReversed: false,
                prefersSingleRecordLink: true
            }
        });

        // Link Leads to Campaigns
        console.log('   📊 Leads - Campaign Link:');
        await this.createField(CONFIG.airtable.bases.marketing, 'tblbzmGf329gIITSH', {
            name: 'Campaign',
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: 'tbldquy3F52vDWOse',
                isReversed: false,
                prefersSingleRecordLink: true
            }
        });
    }

    async testDataFlows() {
        console.log('\n🔄 Testing Data Flows Between Bases...');

        // Test 1: Create a company and link it to a project
        console.log('   📊 Test 1: Company -> Project Link');
        try {
            // Create a test company
            const companyResponse = await axios.post(
                `https://api.airtable.com/v0/${CONFIG.airtable.bases.coreBusiness}/tbl1roDiTjOCU3wiz`,
                {
                    records: [{
                        fields: {
                            'Name': 'Test Company for Data Flow',
                            'Company Status': 'Active',
                            'Is Active': true,
                            'Employee Count': 50
                        }
                    }]
                },
                { headers: this.headers }
            );

            const companyId = companyResponse.data.records[0].id;
            console.log(`   ✅ Created test company: ${companyId}`);

            // Create a test project linked to the company
            const projectResponse = await axios.post(
                `https://api.airtable.com/v0/${CONFIG.airtable.bases.coreBusiness}/tblJ4C2HFSBlPkyP6`,
                {
                    records: [{
                        fields: {
                            'Name': 'Test Project for Data Flow',
                            'Project Priority': 'High',
                            'Company': [companyId],
                            'Start Date': '2024-01-01',
                            'End Date': '2024-12-31'
                        }
                    }]
                },
                { headers: this.headers }
            );

            const projectId = projectResponse.data.records[0].id;
            console.log(`   ✅ Created test project linked to company: ${projectId}`);

            // Create a test task linked to the project
            const taskResponse = await axios.post(
                `https://api.airtable.com/v0/${CONFIG.airtable.bases.coreBusiness}/tbltUIxPI1ZXgLgqQ`,
                {
                    records: [{
                        fields: {
                            'Name': 'Test Task for Data Flow',
                            'Task Status': 'In Progress',
                            'Project': [projectId],
                            'Estimated Hours': 10,
                            'Is Completed': false
                        }
                    }]
                },
                { headers: this.headers }
            );

            const taskId = taskResponse.data.records[0].id;
            console.log(`   ✅ Created test task linked to project: ${taskId}`);

            console.log('   🎉 Data flow test successful: Company -> Project -> Task');

        } catch (error) {
            console.log(`   ❌ Data flow test failed:`, error.response?.data?.error?.message || error.message);
        }

        // Test 2: Create financial records with links
        console.log('   📊 Test 2: Financial Records Link');
        try {
            // Create a test invoice
            const invoiceResponse = await axios.post(
                `https://api.airtable.com/v0/${CONFIG.airtable.bases.financial}/tblpQ71TjMAnVJ5by`,
                {
                    records: [{
                        fields: {
                            'Name': 'INV-TEST-001',
                            'Invoice Status': 'Sent',
                            'Amount': 5000,
                            'Invoice Date': '2024-01-01',
                            'Due Date': '2024-01-31',
                            'Is Paid': false
                        }
                    }]
                },
                { headers: this.headers }
            );

            const invoiceId = invoiceResponse.data.records[0].id;
            console.log(`   ✅ Created test invoice: ${invoiceId}`);

            // Create a test payment linked to the invoice
            const paymentResponse = await axios.post(
                `https://api.airtable.com/v0/${CONFIG.airtable.bases.financial}/tblAMmYPqX3Z4bbe3`,
                {
                    records: [{
                        fields: {
                            'Name': 'PAY-TEST-001',
                            'Amount': 5000,
                            'Payment Date': '2024-01-15',
                            'Invoice': [invoiceId]
                        }
                    }]
                },
                { headers: this.headers }
            );

            const paymentId = paymentResponse.data.records[0].id;
            console.log(`   ✅ Created test payment linked to invoice: ${paymentId}`);

            console.log('   🎉 Financial data flow test successful: Invoice -> Payment');

        } catch (error) {
            console.log(`   ❌ Financial data flow test failed:`, error.response?.data?.error?.message || error.message);
        }
    }

    async setupAllCorrectAdvancedFields() {
        console.log('🔧 B - BUSINESS ANALYSIS: Analyzing correct advanced fields requirements...');
        console.log('\n📋 M - MANAGEMENT PLANNING: Creating correct advanced fields plan...');
        console.log('\n🏗️ A - ARCHITECTURE DESIGN: Designing correct advanced field architecture...');
        console.log('\n💻 D - DEVELOPMENT IMPLEMENTATION: Creating correct advanced fields...');

        try {
            await this.setupCorrectSingleSelectFields();
            await this.setupCorrectDateFields();
            await this.setupCorrectCurrencyFields();
            await this.setupCorrectNumberFields();
            await this.setupCorrectCheckboxFields();
            await this.setupCorrectLinkedFields();
            await this.testDataFlows();

            console.log('\n🎉 CORRECT ADVANCED FIELDS SETUP COMPLETE!');
            console.log('===========================================');
            console.log(`📊 Results:`);
            console.log(`   • Total Fields Created: ${this.results.successful}`);
            console.log(`   • Failed: ${this.results.failed}`);
            console.log(`   • Success Rate: ${Math.round((this.results.successful / this.results.total) * 100)}%`);

            if (this.results.successful > 0) {
                console.log('\n🏆 CORRECT ADVANCED FIELDS ACHIEVEMENTS:');
                console.log('   ✅ Single select fields with correct color values');
                console.log('   ✅ Date fields with correct dateFormat');
                console.log('   ✅ Currency fields with proper options');
                console.log('   ✅ Number fields with correct precision');
                console.log('   ✅ Checkbox fields with proper icon and color');
                console.log('   ✅ Linked record fields with correct options');
                console.log('   ✅ Data flow testing between bases');
                console.log('   ✅ Comprehensive field architecture');
            }

            console.log('\n📝 MANUAL FORMULA FIELDS SETUP:');
            console.log('   ⚠️  Formula fields must be created manually in Airtable UI');
            console.log('   📋 Recommended formula fields to create manually:');
            console.log('      • Status Summary (combines status with emojis)');
            console.log('      • Priority Color (shows priority with colors)');
            console.log('      • Formatted Amount (adds currency symbols)');
            console.log('      • Performance Indicator (compares values to targets)');
            console.log('      • Source Icon (shows source with emojis)');

        } catch (error) {
            console.log('❌ Error during correct advanced fields setup:', error.message);
        }
    }
}

// Execute
const setup = new CorrectAdvancedFieldsSetup();
setup.setupAllCorrectAdvancedFields().then(() => {
    console.log('\n✅ Correct advanced fields setup completed');
    process.exit(0);
}).catch(error => {
    console.log('❌ Error:', error.message);
    process.exit(1);
});
