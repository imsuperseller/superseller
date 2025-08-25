#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceFixRemainingModules {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.systemKey = 'superseller';
        this.apiBaseUrl = `https://${this.systemKey}.boost.space/api`;
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            populationResults: {},
            summary: {
                totalModules: 0,
                successfulModules: 0,
                failedModules: 0,
                totalRecords: 0,
                successfulRecords: 0
            }
        };
        this.contactIds = []; // Will store created contact IDs
        this.spaceId = 2; // Using the user's space ID
        
        // Status system IDs from the API response
        this.statusSystemIds = {
            businessCase: 30, // "Active" status for business-case
            businessOffer: 34, // "Active" status for business-offer
            businessContract: 54, // "Active" status for business-contract
            form: 73, // "Active" status for form
            note: 13, // "Active" status for note
            event: 21, // "Active" status for activities
            invoice: 38, // "Created" status for invoice
            businessOrder: 26 // "Active" status for business-order
        };
    }

    async fixRemainingModules() {
        console.log('🔧 FIXING REMAINING BOOST.SPACE MODULES');
        console.log('=======================================\n');

        try {
            // Step 1: Get existing contact IDs
            await this.getExistingContacts();

            // Step 2: Fix the 4 remaining modules
            await this.fixBusinessCases();
            await this.fixBusinessOffers();
            await this.fixBusinessContracts();
            await this.fixForms();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n📊 FIX RESULTS SUMMARY:');
            console.log(`✅ Successful Modules: ${this.results.summary.successfulModules}/${this.results.summary.totalModules}`);
            console.log(`✅ Successful Records: ${this.results.summary.successfulRecords}/${this.results.summary.totalRecords}`);
            console.log(`❌ Failed Modules: ${this.results.summary.failedModules}/${this.results.summary.totalModules}`);

            console.log('\n✅ REMAINING MODULES FIXED!');
            console.log('\n🌐 Check your complete data at: https://superseller.boost.space');

        } catch (error) {
            console.error('❌ Fix failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async getExistingContacts() {
        console.log('\n📋 1. GETTING EXISTING CONTACTS');
        console.log('===============================');

        try {
            const response = await axios.get(`${this.apiBaseUrl}/contact`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                this.contactIds = response.data.map(contact => contact.id);
                console.log(`  ✅ Found ${this.contactIds.length} existing contacts`);
                console.log(`  📝 Contact IDs: ${this.contactIds.join(', ')}`);
            } else {
                console.log('  ⚠️  No existing contacts found');
            }

        } catch (error) {
            console.log(`  ❌ Failed to get contacts: ${error.response?.status || 'Error'}`);
        }
    }

    async fixBusinessCases() {
        console.log('\n📦 2. FIXING BUSINESS CASES');
        console.log('============================');

        const businessCases = [
            {
                name: 'Ginati Business Automation',
                statusSystemId: this.statusSystemIds.businessCase,
                spaceId: this.spaceId
            },
            {
                name: 'Mizrahi Insurance System',
                statusSystemId: this.statusSystemIds.businessCase,
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.businessCases = {
            description: 'Business cases',
            endpoint: '/business-case',
            records: [],
            summary: { total: businessCases.length, successful: 0, failed: 0 }
        };

        for (const businessCase of businessCases) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/business-case`, businessCase, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created business case: ${businessCase.name}`);
                this.results.populationResults.businessCases.records.push({
                    data: businessCase,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.businessCases.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed business case: ${businessCase.name} - ${error.response?.status || 'Error'}`);
                if (error.response?.data) {
                    console.log(`     Error details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
                }
                this.results.populationResults.businessCases.records.push({
                    data: businessCase,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status,
                    errorDetails: error.response?.data
                });
                this.results.populationResults.businessCases.summary.failed++;
            }
        }

        if (this.results.populationResults.businessCases.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async fixBusinessOffers() {
        console.log('\n📦 3. FIXING BUSINESS OFFERS');
        console.log('=============================');

        if (this.contactIds.length === 0) {
            console.log('  ⚠️  No contacts available, skipping business offers');
            return;
        }

        const offers = [
            {
                name: 'Ginati Business Automation Offer',
                statusSystemId: this.statusSystemIds.businessOffer,
                spaceId: this.spaceId,
                contactId: this.contactIds[0], // Using first contact ID
                currencyId: 1, // Assuming USD currency ID
                startDate: '2024-01-15'
            },
            {
                name: 'Mizrahi Insurance System Offer',
                statusSystemId: this.statusSystemIds.businessOffer,
                spaceId: this.spaceId,
                contactId: this.contactIds[1] || this.contactIds[0], // Using second contact ID or first if only one
                currencyId: 1, // Assuming USD currency ID
                startDate: '2024-01-20'
            }
        ];

        this.results.populationResults.businessOffers = {
            description: 'Business offers',
            endpoint: '/business-offer',
            records: [],
            summary: { total: offers.length, successful: 0, failed: 0 }
        };

        for (const offer of offers) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/business-offer`, offer, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created business offer: ${offer.name}`);
                this.results.populationResults.businessOffers.records.push({
                    data: offer,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.businessOffers.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed business offer: ${offer.name} - ${error.response?.status || 'Error'}`);
                if (error.response?.data) {
                    console.log(`     Error details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
                }
                this.results.populationResults.businessOffers.records.push({
                    data: offer,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status,
                    errorDetails: error.response?.data
                });
                this.results.populationResults.businessOffers.summary.failed++;
            }
        }

        if (this.results.populationResults.businessOffers.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async fixBusinessContracts() {
        console.log('\n📦 4. FIXING BUSINESS CONTRACTS');
        console.log('===============================');

        const contracts = [
            {
                name: 'Ginati Service Agreement',
                statusSystemId: this.statusSystemIds.businessContract,
                spaceId: this.spaceId
            },
            {
                name: 'Mizrahi Insurance Contract',
                statusSystemId: this.statusSystemIds.businessContract,
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.businessContracts = {
            description: 'Business contracts',
            endpoint: '/business-contract',
            records: [],
            summary: { total: contracts.length, successful: 0, failed: 0 }
        };

        for (const contract of contracts) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/business-contract`, contract, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created business contract: ${contract.name}`);
                this.results.populationResults.businessContracts.records.push({
                    data: contract,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.businessContracts.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed business contract: ${contract.name} - ${error.response?.status || 'Error'}`);
                if (error.response?.data) {
                    console.log(`     Error details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
                }
                this.results.populationResults.businessContracts.records.push({
                    data: contract,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status,
                    errorDetails: error.response?.data
                });
                this.results.populationResults.businessContracts.summary.failed++;
            }
        }

        if (this.results.populationResults.businessContracts.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async fixForms() {
        console.log('\n📦 5. FIXING FORMS');
        console.log('==================');

        const forms = [
            {
                name: 'Customer Onboarding Form',
                statusSystemId: this.statusSystemIds.form,
                domain: 'superseller.boost.space',
                spaces: [this.spaceId]
            },
            {
                name: 'Project Requirements Form',
                statusSystemId: this.statusSystemIds.form,
                domain: 'superseller.boost.space',
                spaces: [this.spaceId]
            }
        ];

        this.results.populationResults.forms = {
            description: 'Form management',
            endpoint: '/form',
            records: [],
            summary: { total: forms.length, successful: 0, failed: 0 }
        };

        for (const form of forms) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/form`, form, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created form: ${form.name}`);
                this.results.populationResults.forms.records.push({
                    data: form,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.forms.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed form: ${form.name} - ${error.response?.status || 'Error'}`);
                if (error.response?.data) {
                    console.log(`     Error details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
                }
                this.results.populationResults.forms.records.push({
                    data: form,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status,
                    errorDetails: error.response?.data
                });
                this.results.populationResults.forms.summary.failed++;
            }
        }

        if (this.results.populationResults.forms.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-fix-remaining';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-fix-remaining-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const fixer = new BoostSpaceFixRemainingModules();
    await fixer.fixRemainingModules();
}

main().catch(console.error);
