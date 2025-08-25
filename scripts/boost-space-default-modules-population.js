#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceDefaultModulesPopulation {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.systemKey = 'superseller';
        this.apiBaseUrl = `https://${this.systemKey}.boost.space/api`;
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            discoveredModules: {},
            populationResults: {}
        };
    }

    async populateDefaultModules() {
        console.log('🚀 POPULATING BOOST.SPACE DEFAULT MODULES');
        console.log('==========================================\n');

        try {
            // 1. Discover available default modules
            await this.discoverDefaultModules();

            // 2. Test different API patterns for each module
            await this.testModuleAPIPatterns();

            // 3. Populate data for working modules
            await this.populateWorkingModules();

            // 4. Generate instructions for manual module creation
            await this.generateManualInstructions();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n✅ DEFAULT MODULES POPULATION COMPLETED!');

        } catch (error) {
            console.error('❌ Population failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async discoverDefaultModules() {
        console.log('🔍 1. DISCOVERING DEFAULT MODULES');
        console.log('================================');

        // Based on your screenshots, these are the default modules available
        const defaultModules = [
            { name: 'contacts', endpoint: '/contacts', description: 'Customer contacts' },
            { name: 'products', endpoint: '/products', description: 'Product catalog' },
            { name: 'business-cases', endpoint: '/business-cases', description: 'Business cases' },
            { name: 'invoices', endpoint: '/invoices', description: 'Invoice management' },
            { name: 'events', endpoint: '/events', description: 'Calendar events' },
            { name: 'notes', endpoint: '/notes', description: 'Notes and documentation' },
            { name: 'tasks', endpoint: '/tasks', description: 'Task management' },
            { name: 'projects', endpoint: '/projects', description: 'Project management' },
            { name: 'contracts', endpoint: '/contracts', description: 'Contract management' },
            { name: 'offers', endpoint: '/offers', description: 'Business offers' },
            { name: 'orders', endpoint: '/orders', description: 'Order management' },
            { name: 'submissions', endpoint: '/submissions', description: 'Document submissions' },
            { name: 'forms', endpoint: '/forms', description: 'Form management' },
            { name: 'docs', endpoint: '/docs', description: 'Document management' },
            { name: 'work-hours', endpoint: '/work-hours', description: 'Time tracking' },
            { name: 'usage-cost', endpoint: '/usage-cost', description: 'Usage and cost tracking' }
        ];

        this.results.discoveredModules = {};

        for (const module of defaultModules) {
            console.log(`\n📦 Testing module: ${module.name}`);
            this.results.discoveredModules[module.name] = {
                description: module.description,
                endpoints: {},
                status: 'unknown'
            };

            // Test different endpoint patterns
            const endpointPatterns = [
                `${module.endpoint}`,
                `/api${module.endpoint}`,
                `/api/${module.name}`,
                `/api/${module.name}s`,
                `/v1${module.endpoint}`,
                `/v1/${module.name}`,
                `/data${module.endpoint}`,
                `/data/${module.name}`
            ];

            for (const pattern of endpointPatterns) {
                try {
                    const response = await axios.get(`${this.apiBaseUrl}${pattern}`, {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 5000
                    });

                    console.log(`  ✅ ${pattern}: ${response.status} - Working`);
                    this.results.discoveredModules[module.name].endpoints[pattern] = {
                        status: 'working',
                        statusCode: response.status,
                        dataType: typeof response.data,
                        dataLength: Array.isArray(response.data) ? response.data.length : 'object'
                    };

                } catch (error) {
                    console.log(`  ❌ ${pattern}: ${error.response?.status || 'Failed'}`);
                    this.results.discoveredModules[module.name].endpoints[pattern] = {
                        status: 'failed',
                        error: error.message,
                        statusCode: error.response?.status
                    };
                }
            }

            // Check if any endpoint worked for this module
            const workingEndpoints = Object.entries(this.results.discoveredModules[module.name].endpoints)
                .filter(([pattern, result]) => result.status === 'working');

            if (workingEndpoints.length > 0) {
                this.results.discoveredModules[module.name].status = 'available';
                console.log(`  🎯 Module ${module.name}: AVAILABLE (${workingEndpoints.length} working endpoints)`);
            } else {
                this.results.discoveredModules[module.name].status = 'not_found';
                console.log(`  ❌ Module ${module.name}: NOT FOUND`);
            }
        }
    }

    async testModuleAPIPatterns() {
        console.log('\n🔧 2. TESTING MODULE API PATTERNS');
        console.log('==================================');

        // Test additional API patterns that might work
        const additionalPatterns = [
            '/modules',
            '/collections',
            '/data',
            '/entities',
            '/records'
        ];

        for (const pattern of additionalPatterns) {
            try {
                const response = await axios.get(`${this.apiBaseUrl}${pattern}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                console.log(`✅ ${pattern}: ${response.status} - Working`);
                console.log(`   Data: ${JSON.stringify(response.data).substring(0, 200)}...`);

            } catch (error) {
                console.log(`❌ ${pattern}: ${error.response?.status || 'Failed'}`);
            }
        }
    }

    async populateWorkingModules() {
        console.log('\n📊 3. POPULATING WORKING MODULES');
        console.log('===============================');

        const availableModules = Object.entries(this.results.discoveredModules)
            .filter(([name, module]) => module.status === 'available');

        if (availableModules.length === 0) {
            console.log('❌ No modules found with working endpoints');
            console.log('💡 Need to create modules manually or discover correct API structure');
            return;
        }

        this.results.populationResults = {};

        for (const [moduleName, module] of availableModules) {
            console.log(`\n📦 Populating module: ${moduleName}`);

            // Find the working endpoint
            const workingEndpoint = Object.entries(module.endpoints)
                .find(([pattern, result]) => result.status === 'working');

            if (!workingEndpoint) {
                console.log(`  ❌ No working endpoint found for ${moduleName}`);
                continue;
            }

            const [endpointPattern, endpointResult] = workingEndpoint;
            console.log(`  🔗 Using endpoint: ${endpointPattern}`);

            // Get sample data for this module
            const sampleData = this.getSampleDataForModule(moduleName);

            try {
                // Try to create a record
                const response = await axios.post(`${this.apiBaseUrl}${endpointPattern}`, sampleData, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`  ✅ Created record: ${response.status}`);
                this.results.populationResults[moduleName] = {
                    status: 'success',
                    endpoint: endpointPattern,
                    statusCode: response.status,
                    data: response.data
                };

            } catch (error) {
                console.log(`  ❌ Failed to create record: ${error.response?.status || 'Error'}`);
                this.results.populationResults[moduleName] = {
                    status: 'failed',
                    endpoint: endpointPattern,
                    error: error.message,
                    statusCode: error.response?.status
                };
            }
        }
    }

    getSampleDataForModule(moduleName) {
        const sampleData = {
            contacts: {
                name: 'Ben Ginati',
                email: 'ben@ginati.com',
                phone: '+972-50-123-4567',
                company: 'Ginati Business Solutions',
                status: 'Active Customer',
                notes: 'Complete business automation project'
            },
            products: {
                name: 'Business Automation Package',
                sku: 'BAP-001',
                price: 5000,
                category: 'Automation',
                status: 'Active',
                description: 'Complete business process automation solution'
            },
            'business-cases': {
                name: 'Ginati Business Automation',
                status: 'In Progress',
                customer: 'Ben Ginati',
                budget: 15000,
                timeline: '3 months',
                description: 'Complete business process automation for Ginati Business Solutions'
            },
            invoices: {
                number: 'INV-2024-001',
                customer: 'Ben Ginati',
                amount: 5000,
                status: 'Pending',
                due_date: '2024-12-31',
                description: 'Business automation package payment'
            },
            events: {
                title: 'Project Kickoff Meeting',
                start_date: '2024-01-15T10:00:00Z',
                end_date: '2024-01-15T11:00:00Z',
                location: 'Virtual Meeting',
                description: 'Initial project planning and requirements gathering'
            },
            notes: {
                title: 'Project Requirements',
                content: 'Complete business automation including document processing, workflow management, and reporting',
                author: 'Shai Friedman',
                category: 'Project',
                tags: ['automation', 'business', 'ginati']
            }
        };

        return sampleData[moduleName] || { name: `Test ${moduleName}`, description: 'Test record' };
    }

    async generateManualInstructions() {
        console.log('\n📋 4. GENERATING MANUAL INSTRUCTIONS');
        console.log('====================================');

        const unavailableModules = Object.entries(this.results.discoveredModules)
            .filter(([name, module]) => module.status === 'not_found');

        if (unavailableModules.length > 0) {
            console.log('\n🔧 MODULES THAT NEED MANUAL CREATION:');
            unavailableModules.forEach(([name, module]) => {
                console.log(`\n📦 ${name.toUpperCase()}:`);
                console.log(`   Description: ${module.description}`);
                console.log(`   Action: Create this module in the Boost.space web interface`);
                console.log(`   Steps:`);
                console.log(`   1. Go to https://superseller.boost.space`);
                console.log(`   2. Navigate to Modules/Collections section`);
                console.log(`   3. Create new module named: "${name}"`);
                console.log(`   4. Add appropriate fields for: ${module.description}`);
                console.log(`   5. Save and activate the module`);
                console.log(`   6. Send me the module details so I can populate it`);
            });
        }

        const availableModules = Object.entries(this.results.discoveredModules)
            .filter(([name, module]) => module.status === 'available');

        if (availableModules.length > 0) {
            console.log('\n✅ AVAILABLE MODULES:');
            availableModules.forEach(([name, module]) => {
                const workingEndpoint = Object.entries(module.endpoints)
                    .find(([pattern, result]) => result.status === 'working');
                console.log(`   📦 ${name}: ${workingEndpoint ? workingEndpoint[0] : 'No working endpoint'}`);
            });
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-default-modules';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-default-modules-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const population = new BoostSpaceDefaultModulesPopulation();
    await population.populateDefaultModules();
}

main().catch(console.error);
