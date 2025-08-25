#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceFixedWithBusinessProcess {
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
        this.categoryId = 2; // "Everyone" category
        
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

    async fixWithBusinessProcess() {
        console.log('🔧 FIXING WITH BUSINESS PROCESS FIELD');
        console.log('=====================================\n');

        try {
            // Step 1: Get existing contact IDs
            await this.getExistingContacts();

            // Step 2: Try to populate the remaining modules with business process field
            await this.tryBusinessCasesWithProcess();
            await this.tryBusinessContractsWithProcess();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n📊 FIX RESULTS SUMMARY:');
            console.log(`✅ Successful Modules: ${this.results.summary.successfulModules}/${this.results.summary.totalModules}`);
            console.log(`✅ Successful Records: ${this.results.summary.successfulRecords}/${this.results.summary.totalRecords}`);
            console.log(`❌ Failed Modules: ${this.results.summary.failedModules}/${this.results.summary.totalModules}`);

            console.log('\n🎯 FINAL STATUS:');
            if (this.results.summary.successfulModules === this.results.summary.totalModules) {
                console.log('🎉 ALL MODULES SUCCESSFULLY POPULATED!');
            } else {
                console.log('⚠️  Some modules still need manual configuration');
            }
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

    async tryBusinessCasesWithProcess() {
        console.log('\n📦 2. TRYING BUSINESS CASES WITH BUSINESS PROCESS');
        console.log('==================================================');

        const businessCases = [
            {
                name: 'Ginati Business Automation Case',
                statusSystemId: this.statusSystemIds.businessCase,
                spaceId: this.spaceId,
                categoryBusiness: this.categoryId, // Adding the missing required field
                typeOfInterest: 'consulting', // Adding potential required field
                contactId: this.contactIds[0] // Adding contact reference
            },
            {
                name: 'Mizrahi Insurance System Case',
                statusSystemId: this.statusSystemIds.businessCase,
                spaceId: this.spaceId,
                categoryBusiness: this.categoryId, // Adding the missing required field
                typeOfInterest: 'development', // Adding potential required field
                contactId: this.contactIds[1] || this.contactIds[0] // Adding contact reference
            }
        ];

        this.results.populationResults.businessCases = {
            description: 'Business cases with business process field',
            endpoint: '/business-case',
            records: [],
            summary: { total: businessCases.length, successful: 0, failed: 0 }
        };

        for (const businessCase of businessCases) {
            try {
                console.log(`  🔄 Attempting to create: ${businessCase.name}`);
                console.log(`  📝 Data: ${JSON.stringify(businessCase)}`);
                
                const response = await axios.post(`${this.apiBaseUrl}/business-case`, businessCase, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ SUCCESS! Created business case: ${businessCase.name}`);
                console.log(`  📊 Response: ${JSON.stringify(response.data).substring(0, 200)}`);
                
                this.results.populationResults.businessCases.records.push({
                    data: businessCase,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.businessCases.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ FAILED business case: ${businessCase.name}`);
                console.log(`  🔍 Status: ${error.response?.status || 'Unknown'}`);
                if (error.response?.data) {
                    console.log(`  📝 Error details: ${JSON.stringify(error.response.data).substring(0, 300)}`);
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

    async tryBusinessContractsWithProcess() {
        console.log('\n📦 3. TRYING BUSINESS CONTRACTS WITH BUSINESS PROCESS');
        console.log('======================================================');

        const contracts = [
            {
                name: 'Ginati Service Agreement Contract',
                statusSystemId: this.statusSystemIds.businessContract,
                spaceId: this.spaceId,
                categoryBusiness: this.categoryId, // Adding the missing required field
                contactId: this.contactIds[0] // Adding contact reference
            },
            {
                name: 'Mizrahi Insurance Contract',
                statusSystemId: this.statusSystemIds.businessContract,
                spaceId: this.spaceId,
                categoryBusiness: this.categoryId, // Adding the missing required field
                contactId: this.contactIds[1] || this.contactIds[0] // Adding contact reference
            }
        ];

        this.results.populationResults.businessContracts = {
            description: 'Business contracts with business process field',
            endpoint: '/business-contract',
            records: [],
            summary: { total: contracts.length, successful: 0, failed: 0 }
        };

        for (const contract of contracts) {
            try {
                console.log(`  🔄 Attempting to create: ${contract.name}`);
                console.log(`  📝 Data: ${JSON.stringify(contract)}`);
                
                const response = await axios.post(`${this.apiBaseUrl}/business-contract`, contract, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ SUCCESS! Created business contract: ${contract.name}`);
                console.log(`  📊 Response: ${JSON.stringify(response.data).substring(0, 200)}`);
                
                this.results.populationResults.businessContracts.records.push({
                    data: contract,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.businessContracts.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ FAILED business contract: ${contract.name}`);
                console.log(`  🔍 Status: ${error.response?.status || 'Unknown'}`);
                if (error.response?.data) {
                    console.log(`  📝 Error details: ${JSON.stringify(error.response.data).substring(0, 300)}`);
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

    async saveResults() {
        const resultsDir = 'docs/boost-space-fixed-with-process';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `fixed-with-process-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const fixer = new BoostSpaceFixedWithBusinessProcess();
    await fixer.fixWithBusinessProcess();
}

main().catch(console.error);
