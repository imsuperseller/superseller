#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceFinalPopulation {
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
    }

    async populateAllModules() {
        console.log('🚀 FINAL BOOST.SPACE POPULATION - ALL MODULES');
        console.log('============================================\n');

        try {
            // Step 1: Create contacts first (they work)
            await this.createContacts();

            // Step 2: Create products (they work)
            await this.createProducts();

            // Step 3: Create other modules with correct requirements
            await this.createBusinessCases();
            await this.createInvoices();
            await this.createEvents();
            await this.createNotes();
            await this.createBusinessOffers();
            await this.createBusinessOrders();
            await this.createBusinessContracts();
            await this.createForms();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n📊 FINAL POPULATION SUMMARY:');
            console.log(`✅ Successful Modules: ${this.results.summary.successfulModules}/${this.results.summary.totalModules}`);
            console.log(`✅ Successful Records: ${this.results.summary.successfulRecords}/${this.results.summary.totalRecords}`);
            console.log(`❌ Failed Modules: ${this.results.summary.failedModules}/${this.results.summary.totalModules}`);

            console.log('\n✅ FINAL POPULATION COMPLETED!');
            console.log('\n🌐 Check your data at: https://superseller.boost.space');

        } catch (error) {
            console.error('❌ Population failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async createContacts() {
        console.log('\n📦 1. CREATING CONTACTS');
        console.log('======================');

        const contacts = [
            {
                name: 'Ginati Business Solutions',
                firstname: 'Ben',
                type: 'person',
                email: 'ben@ginati.com',
                phone: '+972-50-123-4567',
                spaces: [this.spaceId]
            },
            {
                name: 'Mizrahi Insurance Services',
                firstname: 'Shelly',
                type: 'person',
                email: 'shelly@mizrahi-insurance.com',
                phone: '+972-52-987-6543',
                spaces: [this.spaceId]
            }
        ];

        this.results.populationResults.contacts = {
            description: 'Customer contacts',
            endpoint: '/contact',
            records: [],
            summary: { total: contacts.length, successful: 0, failed: 0 }
        };

        for (const contact of contacts) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/contact`, contact, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created contact: ${contact.name}`);
                this.contactIds.push(response.data.id); // Store contact ID for other modules
                this.results.populationResults.contacts.records.push({
                    data: contact,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.contacts.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed contact: ${contact.name} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.contacts.records.push({
                    data: contact,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.contacts.summary.failed++;
            }
        }

        if (this.results.populationResults.contacts.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createProducts() {
        console.log('\n📦 2. CREATING PRODUCTS');
        console.log('=======================');

        const products = [
            {
                name: 'Business Automation Package',
                code: 'BAP-001',
                price: 15000,
                currency: 'USD',
                spaces: [this.spaceId]
            },
            {
                name: 'Document Processing System',
                code: 'DPS-002',
                price: 8000,
                currency: 'USD',
                spaces: [this.spaceId]
            }
        ];

        this.results.populationResults.products = {
            description: 'Product catalog',
            endpoint: '/product',
            records: [],
            summary: { total: products.length, successful: 0, failed: 0 }
        };

        for (const product of products) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/product`, product, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created product: ${product.name}`);
                this.results.populationResults.products.records.push({
                    data: product,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.products.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed product: ${product.name} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.products.records.push({
                    data: product,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.products.summary.failed++;
            }
        }

        if (this.results.populationResults.products.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createBusinessCases() {
        console.log('\n📦 3. CREATING BUSINESS CASES');
        console.log('=============================');

        const businessCases = [
            {
                name: 'Ginati Business Automation',
                status: 'in_progress',
                spaceId: this.spaceId // Using spaceId instead of spaces array
            },
            {
                name: 'Mizrahi Insurance System',
                status: 'in_progress',
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
                this.results.populationResults.businessCases.records.push({
                    data: businessCase,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.businessCases.summary.failed++;
            }
        }

        if (this.results.populationResults.businessCases.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createInvoices() {
        console.log('\n📦 4. CREATING INVOICES');
        console.log('=======================');

        if (this.contactIds.length === 0) {
            console.log('  ⚠️  No contacts available, skipping invoices');
            return;
        }

        const invoices = [
            {
                number: 'INV-2024-001',
                status: 'pending',
                contactId: this.contactIds[0], // Using first contact ID
                spaceId: this.spaceId
            },
            {
                number: 'INV-2024-002',
                status: 'pending',
                contactId: this.contactIds[1] || this.contactIds[0], // Using second contact ID or first if only one
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.invoices = {
            description: 'Invoice management',
            endpoint: '/invoice',
            records: [],
            summary: { total: invoices.length, successful: 0, failed: 0 }
        };

        for (const invoice of invoices) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/invoice`, invoice, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created invoice: ${invoice.number}`);
                this.results.populationResults.invoices.records.push({
                    data: invoice,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.invoices.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed invoice: ${invoice.number} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.invoices.records.push({
                    data: invoice,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.invoices.summary.failed++;
            }
        }

        if (this.results.populationResults.invoices.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createEvents() {
        console.log('\n📦 5. CREATING EVENTS');
        console.log('=====================');

        const events = [
            {
                title: 'Ben Ginati Project Kickoff',
                start: '2024-01-15T10:00:00Z',
                end: '2024-01-15T11:00:00Z',
                spaceId: this.spaceId // Using spaceId instead of spaces array
            },
            {
                title: 'Shelly Mizrahi System Demo',
                start: '2024-01-20T14:00:00Z',
                end: '2024-01-20T15:00:00Z',
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.events = {
            description: 'Calendar events',
            endpoint: '/event',
            records: [],
            summary: { total: events.length, successful: 0, failed: 0 }
        };

        for (const event of events) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/event`, event, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created event: ${event.title}`);
                this.results.populationResults.events.records.push({
                    data: event,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.events.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed event: ${event.title} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.events.records.push({
                    data: event,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.events.summary.failed++;
            }
        }

        if (this.results.populationResults.events.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createNotes() {
        console.log('\n📦 6. CREATING NOTES');
        console.log('===================');

        const notes = [
            {
                title: 'Ben Ginati Project Requirements',
                content: 'Complete business automation including document processing, workflow management, and reporting.',
                spaceId: this.spaceId
            },
            {
                title: 'Shelly Mizrahi Insurance System',
                content: 'Insurance document processing system requirements and specifications.',
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.notes = {
            description: 'Notes and documentation',
            endpoint: '/note',
            records: [],
            summary: { total: notes.length, successful: 0, failed: 0 }
        };

        for (const note of notes) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/note`, note, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created note: ${note.title}`);
                this.results.populationResults.notes.records.push({
                    data: note,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.notes.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed note: ${note.title} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.notes.records.push({
                    data: note,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.notes.summary.failed++;
            }
        }

        if (this.results.populationResults.notes.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createBusinessOffers() {
        console.log('\n📦 7. CREATING BUSINESS OFFERS');
        console.log('=============================');

        const offers = [
            {
                name: 'Ginati Business Automation Offer',
                status: 'active',
                spaceId: this.spaceId
            },
            {
                name: 'Mizrahi Insurance System Offer',
                status: 'active',
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.offers = {
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

                console.log(`  ✅ Created offer: ${offer.name}`);
                this.results.populationResults.offers.records.push({
                    data: offer,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.offers.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed offer: ${offer.name} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.offers.records.push({
                    data: offer,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.offers.summary.failed++;
            }
        }

        if (this.results.populationResults.offers.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createBusinessOrders() {
        console.log('\n📦 8. CREATING BUSINESS ORDERS');
        console.log('=============================');

        const orders = [
            {
                number: 'ORD-2024-001',
                status: 'confirmed',
                spaceId: this.spaceId
            },
            {
                number: 'ORD-2024-002',
                status: 'confirmed',
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.orders = {
            description: 'Business orders',
            endpoint: '/business-order',
            records: [],
            summary: { total: orders.length, successful: 0, failed: 0 }
        };

        for (const order of orders) {
            try {
                const response = await axios.post(`${this.apiBaseUrl}/business-order`, order, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created order: ${order.number}`);
                this.results.populationResults.orders.records.push({
                    data: order,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.orders.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed order: ${order.number} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.orders.records.push({
                    data: order,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.orders.summary.failed++;
            }
        }

        if (this.results.populationResults.orders.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createBusinessContracts() {
        console.log('\n📦 9. CREATING BUSINESS CONTRACTS');
        console.log('================================');

        const contracts = [
            {
                name: 'Ginati Service Agreement',
                status: 'active',
                spaceId: this.spaceId
            },
            {
                name: 'Mizrahi Insurance Contract',
                status: 'active',
                spaceId: this.spaceId
            }
        ];

        this.results.populationResults.contracts = {
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

                console.log(`  ✅ Created contract: ${contract.name}`);
                this.results.populationResults.contracts.records.push({
                    data: contract,
                    status: 'success',
                    statusCode: response.status,
                    response: response.data
                });
                this.results.populationResults.contracts.summary.successful++;
                this.results.summary.successfulRecords++;

            } catch (error) {
                console.log(`  ❌ Failed contract: ${contract.name} - ${error.response?.status || 'Error'}`);
                this.results.populationResults.contracts.records.push({
                    data: contract,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.contracts.summary.failed++;
            }
        }

        if (this.results.populationResults.contracts.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async createForms() {
        console.log('\n📦 10. CREATING FORMS');
        console.log('=====================');

        const forms = [
            {
                name: 'Customer Onboarding Form',
                status: 'active',
                domain: 'superseller.boost.space' // Adding required domain field
            },
            {
                name: 'Project Requirements Form',
                status: 'active',
                domain: 'superseller.boost.space'
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
                this.results.populationResults.forms.records.push({
                    data: form,
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                });
                this.results.populationResults.forms.summary.failed++;
            }
        }

        if (this.results.populationResults.forms.summary.successful > 0) {
            this.results.summary.successfulModules++;
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-final-population';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-final-population-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const population = new BoostSpaceFinalPopulation();
    await population.populateAllModules();
}

main().catch(console.error);
