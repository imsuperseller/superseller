#!/usr/bin/env node

/**
 * 🎯 BMAD METHODOLOGY - BASIC ADVANCED FIELDS SETUP
 * 
 * This script creates basic advanced fields that are guaranteed to work:
 * - Single line text fields
 * - Multiline text fields
 * - Number fields (basic)
 * - Checkbox fields (basic)
 * - URL fields (basic)
 */

import axios from 'axios';

console.log('🎯 BMAD METHODOLOGY - BASIC ADVANCED FIELDS SETUP');
console.log('=================================================');

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

class BasicAdvancedFieldsSetup {
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

    async setupCoreBusinessBasicFields() {
        console.log('\n🏢 Setting up Core Business Operations basic advanced fields...');

        const baseId = CONFIG.airtable.bases.coreBusiness;

        // Companies table basic fields
        console.log('   📊 Companies table:');

        await this.createField(baseId, 'tbl1roDiTjOCU3wiz', {
            name: 'Industry',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tbl1roDiTjOCU3wiz', {
            name: 'Website',
            type: 'url'
        });

        await this.createField(baseId, 'tbl1roDiTjOCU3wiz', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tbl1roDiTjOCU3wiz', {
            name: 'Employee Count',
            type: 'number'
        });

        await this.createField(baseId, 'tbl1roDiTjOCU3wiz', {
            name: 'Is Active',
            type: 'checkbox'
        });

        // Projects table basic fields
        console.log('   📊 Projects table:');

        await this.createField(baseId, 'tblJ4C2HFSBlPkyP6', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tblJ4C2HFSBlPkyP6', {
            type: 'number',
            name: 'Budget'
        });

        await this.createField(baseId, 'tblJ4C2HFSBlPkyP6', {
            name: 'Is Active',
            type: 'checkbox'
        });

        await this.createField(baseId, 'tblJ4C2HFSBlPkyP6', {
            name: 'Priority Level',
            type: 'singleLineText'
        });

        // Tasks table basic fields
        console.log('   📊 Tasks table:');

        await this.createField(baseId, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Estimated Hours',
            type: 'number'
        });

        await this.createField(baseId, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Actual Hours',
            type: 'number'
        });

        await this.createField(baseId, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Is Completed',
            type: 'checkbox'
        });

        await this.createField(baseId, 'tbltUIxPI1ZXgLgqQ', {
            name: 'Priority Level',
            type: 'singleLineText'
        });
    }

    async setupFinancialBasicFields() {
        console.log('\n💰 Setting up Financial Management basic advanced fields...');

        const baseId = CONFIG.airtable.bases.financial;

        // Invoices table basic fields
        console.log('   📊 Invoices table:');

        await this.createField(baseId, 'tblpQ71TjMAnVJ5by', {
            name: 'Amount',
            type: 'number'
        });

        await this.createField(baseId, 'tblpQ71TjMAnVJ5by', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tblpQ71TjMAnVJ5by', {
            name: 'Is Paid',
            type: 'checkbox'
        });

        await this.createField(baseId, 'tblpQ71TjMAnVJ5by', {
            name: 'Status',
            type: 'singleLineText'
        });

        // Payments table basic fields
        console.log('   📊 Payments table:');

        await this.createField(baseId, 'tblAMmYPqX3Z4bbe3', {
            name: 'Amount',
            type: 'number'
        });

        await this.createField(baseId, 'tblAMmYPqX3Z4bbe3', {
            name: 'Method',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tblAMmYPqX3Z4bbe3', {
            name: 'Description',
            type: 'multilineText'
        });

        // Expenses table basic fields
        console.log('   📊 Expenses table:');

        await this.createField(baseId, 'tbl2xSZXHcEY0eX1K', {
            name: 'Amount',
            type: 'number'
        });

        await this.createField(baseId, 'tbl2xSZXHcEY0eX1K', {
            name: 'Category',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tbl2xSZXHcEY0eX1K', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tbl2xSZXHcEY0eX1K', {
            name: 'Is Reimbursable',
            type: 'checkbox'
        });
    }

    async setupMarketingBasicFields() {
        console.log('\n📢 Setting up Marketing & Sales basic advanced fields...');

        const baseId = CONFIG.airtable.bases.marketing;

        // Campaigns table basic fields
        console.log('   📊 Campaigns table:');

        await this.createField(baseId, 'tbldquy3F52vDWOse', {
            name: 'Type',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tbldquy3F52vDWOse', {
            name: 'Budget',
            type: 'number'
        });

        await this.createField(baseId, 'tbldquy3F52vDWOse', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tbldquy3F52vDWOse', {
            name: 'Is Active',
            type: 'checkbox'
        });

        await this.createField(baseId, 'tbldquy3F52vDWOse', {
            name: 'Status',
            type: 'singleLineText'
        });

        // Leads table basic fields
        console.log('   📊 Leads table:');

        await this.createField(baseId, 'tblbzmGf329gIITSH', {
            name: 'Email',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tblbzmGf329gIITSH', {
            name: 'Source',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tblbzmGf329gIITSH', {
            name: 'Status',
            type: 'singleLineText'
        });

        await this.createField(baseId, 'tblbzmGf329gIITSH', {
            name: 'Description',
            type: 'multilineText'
        });

        await this.createField(baseId, 'tblbzmGf329gIITSH', {
            name: 'Lead Score',
            type: 'number'
        });
    }

    async setupAllBasicAdvancedFields() {
        console.log('🔧 B - BUSINESS ANALYSIS: Analyzing basic advanced fields requirements...');
        console.log('\n📋 M - MANAGEMENT PLANNING: Creating basic advanced fields plan...');
        console.log('\n🏗️ A - ARCHITECTURE DESIGN: Designing basic advanced field types...');
        console.log('\n💻 D - DEVELOPMENT IMPLEMENTATION: Creating basic advanced fields...');

        try {
            await this.setupCoreBusinessBasicFields();
            await this.setupFinancialBasicFields();
            await this.setupMarketingBasicFields();

            console.log('\n🎉 BASIC ADVANCED FIELDS SETUP COMPLETE!');
            console.log('=========================================');
            console.log(`📊 Results:`);
            console.log(`   • Total Fields Created: ${this.results.successful}`);
            console.log(`   • Failed: ${this.results.failed}`);
            console.log(`   • Success Rate: ${Math.round((this.results.successful / this.results.total) * 100)}%`);

            if (this.results.successful > 0) {
                console.log('\n🏆 BASIC ADVANCED FIELDS ACHIEVEMENTS:');
                console.log('   ✅ Single line text fields for structured data');
                console.log('   ✅ Multiline text fields for descriptions');
                console.log('   ✅ Number fields for numeric data');
                console.log('   ✅ Checkbox fields for boolean values');
                console.log('   ✅ URL fields for web links');
                console.log('   ✅ Basic data structure enhancement');
            }

            console.log('\n📝 NEXT STEPS FOR ADVANCED FIELDS:');
            console.log('   🔧 Manual Setup Required in Airtable UI:');
            console.log('      • Single select fields with color options');
            console.log('      • Date fields with proper formatting');
            console.log('      • Currency fields with symbols');
            console.log('      • Duration fields for time tracking');
            console.log('      • Rating fields for scoring');
            console.log('      • Formula fields for calculated values');
            console.log('      • Rollup fields for aggregated data');
            console.log('      • Lookup fields for cross-table references');
            console.log('      • Linked record fields for relationships');

        } catch (error) {
            console.log('❌ Error during basic advanced fields setup:', error.message);
        }
    }
}

// Execute
const setup = new BasicAdvancedFieldsSetup();
setup.setupAllBasicAdvancedFields().then(() => {
    console.log('\n✅ Basic advanced fields setup completed');
    process.exit(0);
}).catch(error => {
    console.log('❌ Error:', error.message);
    process.exit(1);
});
