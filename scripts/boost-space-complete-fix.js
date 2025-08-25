#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceCompleteFix {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.systemKey = 'superseller';
        this.apiBaseUrl = `https://${this.systemKey}.boost.space/api`;
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            spacesCreated: {},
            modulesPopulated: {},
            summary: {
                totalSpaces: 0,
                createdSpaces: 0,
                totalModules: 0,
                successfulModules: 0,
                totalRecords: 0,
                successfulRecords: 0
            }
        };

        // Status system IDs
        this.statusSystemIds = {
            businessCase: 30,
            businessOffer: 34,
            businessContract: 54,
            form: 73,
            note: 13,
            event: 21,
            invoice: 38,
            businessOrder: 26,
            todo: 5,
            product: 52,
            contact: 68
        };

        // Space mappings for each module
        this.spaceMappings = {
            contact: 26, // "Contacts" space
            product: 27, // "Main" space for products
            invoice: 27, // "Main" space for invoices
            event: 27, // "Main" space for events
            note: 27, // "Main" space for notes
            'business-order': 29, // "Main Business Workflow" space
            'business-offer': 29, // "Main Business Workflow" space
            'business-case': 29, // "Main Business Workflow" space
            'business-contract': 29, // "Main Business Workflow" space
            form: 27, // "Main" space for forms
            todo: 27, // "Main" space for todos
            project: 31, // "Main" project space (NEWLY CREATED!)
            work: 27, // "Main" space for work
            activities: 27, // "Main" space for activities
            team: 27, // "Main" space for teams
            user: 27, // "Main" space for users
            category: 27, // "Main" space for categories
            submission: 27, // "Main" space for submissions
            purchase: 27, // "Main" space for purchases
            'stock-request': 27, // "Main" space for stock requests
            'stock-reservation': 27, // "Main" space for stock reservations
            'stock-inventory': 27, // "Main" space for stock inventory
            'stock-item': 27, // "Main" space for stock items
            address: 27, // "Main" space for addresses
            page: 27, // "Main" space for pages
            resource: 27, // "Main" space for resources
            integration: 27, // "Main" space for integrations
            chart: 27, // "Main" space for charts
            'custom-info': 27, // "Main" space for custom info
            'custom-module-item': 27, // "Main" space for custom module items
            automatization: 27, // "Main" space for automatization
            import: 27, // "Main" space for imports
            payment: 27 // "Main" space for payments
        };
    }

    async completeFix() {
        console.log('🔧 COMPLETE BOOST.SPACE FIX - SPACES & DATA POPULATION');
        console.log('=====================================================\n');

        try {
            // Step 1: Get existing spaces and contacts
            await this.getExistingSpaces();
            await this.getExistingContacts();

            // Step 2: Create missing spaces if needed
            await this.createMissingSpaces();

            // Step 3: Populate all modules with correct space IDs
            await this.populateAllModules();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n📊 COMPLETE FIX RESULTS SUMMARY:');
            console.log(`✅ Spaces Created: ${this.results.summary.createdSpaces}/${this.results.summary.totalSpaces}`);
            console.log(`✅ Modules Populated: ${this.results.summary.successfulModules}/${this.results.summary.totalModules}`);
            console.log(`✅ Records Created: ${this.results.summary.successfulRecords}/${this.results.summary.totalRecords}`);

            console.log('\n🎯 FINAL STATUS:');
            console.log('🎉 ALL MODULES SHOULD NOW BE VISIBLE IN THE WEB INTERFACE!');
            console.log('\n🌐 Check your complete data at: https://superseller.boost.space');

        } catch (error) {
            console.error('❌ Complete fix failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async getExistingSpaces() {
        console.log('\n📋 1. GETTING EXISTING SPACES');
        console.log('============================');

        try {
            const response = await axios.get(`${this.apiBaseUrl}/space`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                console.log(`  ✅ Found ${response.data.length} existing spaces:`);
                response.data.forEach(space => {
                    console.log(`    - ID: ${space.id}, Name: "${space.name}", Module: ${space.module}`);
                });
            } else {
                console.log('  ⚠️  No existing spaces found');
            }

        } catch (error) {
            console.log(`  ❌ Failed to get spaces: ${error.response?.status || 'Error'}`);
        }
    }

    async getExistingContacts() {
        console.log('\n📋 2. GETTING EXISTING CONTACTS');
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
                this.contactIds = [];
            }

        } catch (error) {
            console.log(`  ❌ Failed to get contacts: ${error.response?.status || 'Error'}`);
            this.contactIds = [];
        }
    }

    async createMissingSpaces() {
        console.log('\n📦 3. CREATING MISSING SPACES');
        console.log('=============================');

        // For now, we'll use existing spaces. If needed, we can create more spaces later
        console.log('  ✅ Using existing spaces for all modules');
    }

    async populateAllModules() {
        console.log('\n📦 4. POPULATING ALL MODULES WITH CORRECT SPACE IDS');
        console.log('====================================================');

        const modulesToPopulate = [
            'contact', 'product', 'invoice', 'event', 'note', 'business-order',
            'business-offer', 'form', 'business-case', 'business-contract',
            'todo', 'project', 'work', 'activities', 'team', 'user',
            'category', 'submission', 'purchase', 'stock-request',
            'stock-reservation', 'stock-inventory', 'stock-item', 'address',
            'page', 'resource', 'integration', 'chart', 'custom-info',
            'custom-module-item', 'automatization', 'import', 'payment'
        ];

        for (const moduleName of modulesToPopulate) {
            await this.populateModule(moduleName);
        }
    }

    async populateModule(moduleName) {
        console.log(`\n📦 Populating module: ${moduleName}`);

        const spaceId = this.spaceMappings[moduleName];
        if (!spaceId) {
            console.log(`  ⚠️  No space mapping found for ${moduleName}, skipping`);
            return;
        }

        try {
            // Check if module already has data
            const existingResponse = await axios.get(`${this.apiBaseUrl}/${moduleName}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const existingCount = Array.isArray(existingResponse.data) ? existingResponse.data.length : 0;

            if (existingCount > 0) {
                console.log(`  ✅ ${moduleName}: Already has ${existingCount} records`);
                this.results.modulesPopulated[moduleName] = {
                    status: 'already_populated',
                    recordCount: existingCount,
                    spaceId: spaceId
                };
                this.results.summary.successfulModules++;
                this.results.summary.successfulRecords += existingCount;
                return;
            }

            // Create new records for empty modules
            const records = this.generateModuleData(moduleName, spaceId);

            this.results.modulesPopulated[moduleName] = {
                status: 'populating',
                records: [],
                spaceId: spaceId,
                summary: { total: records.length, successful: 0, failed: 0 }
            };

            for (const record of records) {
                try {
                    const response = await axios.post(`${this.apiBaseUrl}/${moduleName}`, record, {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log(`  ✅ Created ${moduleName}: ${record.name || record.title || 'Record'}`);

                    this.results.modulesPopulated[moduleName].records.push({
                        data: record,
                        status: 'success',
                        response: response.data
                    });
                    this.results.modulesPopulated[moduleName].summary.successful++;
                    this.results.summary.successfulRecords++;

                } catch (error) {
                    console.log(`  ❌ Failed to create ${moduleName}: ${error.response?.status || 'Error'}`);
                    this.results.modulesPopulated[moduleName].records.push({
                        data: record,
                        status: 'failed',
                        error: error.message
                    });
                    this.results.modulesPopulated[moduleName].summary.failed++;
                }
            }

            if (this.results.modulesPopulated[moduleName].summary.successful > 0) {
                this.results.summary.successfulModules++;
            }

        } catch (error) {
            console.log(`  ❌ Failed to populate ${moduleName}: ${error.response?.status || 'Error'}`);
            this.results.modulesPopulated[moduleName] = {
                status: 'failed',
                error: error.message,
                spaceId: spaceId
            };
        }
    }

    generateModuleData(moduleName, spaceId) {
        const baseData = {
            spaceId: spaceId,
            statusSystemId: this.statusSystemIds[moduleName] || 1
        };

        switch (moduleName) {
            case 'contact':
                return [
                    { ...baseData, name: 'Ginati Business Solutions', firstname: 'Ben', type: 'person', email: 'ben@ginati.com', phone: '+972-50-123-4567' },
                    { ...baseData, name: 'Mizrahi Insurance', firstname: 'Shelly', type: 'person', email: 'shelly@mizrahi.com', phone: '+972-50-987-6543' }
                ];

            case 'product':
                return [
                    { ...baseData, name: 'Business Automation Package', price: 5000, description: 'Complete business automation solution' },
                    { ...baseData, name: 'Insurance Management System', price: 3000, description: 'Comprehensive insurance management platform' }
                ];

            case 'invoice':
                return [
                    { ...baseData, name: 'Invoice #001', amount: 5000, contactId: this.contactIds[0] || null },
                    { ...baseData, name: 'Invoice #002', amount: 3000, contactId: this.contactIds[1] || this.contactIds[0] || null }
                ];

            case 'event':
                return [
                    { ...baseData, name: 'Project Kickoff Meeting', startDate: '2024-01-15', endDate: '2024-01-15' },
                    { ...baseData, name: 'System Review', startDate: '2024-01-20', endDate: '2024-01-20' }
                ];

            case 'note':
                return [
                    { ...baseData, name: 'Project Requirements', content: 'Initial project requirements and specifications' },
                    { ...baseData, name: 'Meeting Notes', content: 'Key points from client meeting' }
                ];

            case 'business-case':
                return [
                    { ...baseData, name: 'Ginati Business Automation Case', contactId: this.contactIds[0] || null },
                    { ...baseData, name: 'Mizrahi Insurance System Case', contactId: this.contactIds[1] || this.contactIds[0] || null }
                ];

            case 'business-contract':
                return [
                    { ...baseData, name: 'Ginati Service Agreement', contactId: this.contactIds[0] || null },
                    { ...baseData, name: 'Mizrahi Insurance Contract', contactId: this.contactIds[1] || this.contactIds[0] || null }
                ];

            case 'business-order':
                return [
                    { ...baseData, name: 'Order #001', contactId: this.contactIds[0] || null },
                    { ...baseData, name: 'Order #002', contactId: this.contactIds[1] || this.contactIds[0] || null }
                ];

            case 'business-offer':
                return [
                    { ...baseData, name: 'Ginati Business Offer', contactId: this.contactIds[0] || null, currencyId: 1, startDate: '2024-01-15' },
                    { ...baseData, name: 'Mizrahi Insurance Offer', contactId: this.contactIds[1] || this.contactIds[0] || null, currencyId: 1, startDate: '2024-01-20' }
                ];

            case 'form':
                return [
                    { ...baseData, name: 'Customer Onboarding Form', domain: 'superseller.boost.space', spaces: [spaceId] },
                    { ...baseData, name: 'Project Requirements Form', domain: 'superseller.boost.space', spaces: [spaceId] }
                ];

            case 'todo':
                return [
                    { ...baseData, name: 'Review Project Requirements', description: 'Review and finalize project requirements' },
                    { ...baseData, name: 'Setup Development Environment', description: 'Configure development environment for the project' }
                ];

            case 'project':
                return [
                    { ...baseData, name: 'E-Signatures Implementation', description: 'Complete e-signatures system implementation' },
                    { ...baseData, name: 'Business Process Automation', description: 'Automate key business processes' }
                ];

            case 'work':
                return [
                    { ...baseData, name: 'System Development', description: 'Core system development work' },
                    { ...baseData, name: 'Testing & QA', description: 'Quality assurance and testing work' }
                ];

            case 'activities':
                return [
                    { ...baseData, name: 'Client Meeting', description: 'Initial client consultation meeting' },
                    { ...baseData, name: 'System Demo', description: 'Demonstration of system capabilities' }
                ];

            default:
                return [
                    { ...baseData, name: `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Record 1`, description: `Sample ${moduleName} record` },
                    { ...baseData, name: `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Record 2`, description: `Sample ${moduleName} record` }
                ];
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-complete-fix';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `complete-fix-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const completeFix = new BoostSpaceCompleteFix();
    await completeFix.completeFix();
}

main().catch(console.error);
