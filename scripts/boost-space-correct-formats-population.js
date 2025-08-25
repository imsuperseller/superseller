#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceCorrectFormatsPopulation {
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
    }

    async populateWithCorrectFormats() {
        console.log('🚀 POPULATING BOOST.SPACE WITH CORRECT DATA FORMATS');
        console.log('==================================================\n');

        try {
            // Define modules with correct data formats based on official API schema
            const modules = [
                {
                    name: 'contact',
                    endpoint: '/contact',
                    description: 'Customer contacts',
                    data: [
                        {
                            name: 'Ginati Business Solutions',
                            firstname: 'Ben',
                            type: 'person',
                            email: 'ben@ginati.com',
                            phone: '+972-50-123-4567',
                            spaces: [2] // Using the user's category ID
                        },
                        {
                            name: 'Mizrahi Insurance Services',
                            firstname: 'Shelly',
                            type: 'person',
                            email: 'shelly@mizrahi-insurance.com',
                            phone: '+972-52-987-6543',
                            spaces: [2] // Using the user's category ID
                        }
                    ]
                },
                {
                    name: 'product',
                    endpoint: '/product',
                    description: 'Product catalog',
                    data: [
                        {
                            name: 'Business Automation Package',
                            code: 'BAP-001',
                            price: 15000,
                            currency: 'USD',
                            spaces: [2]
                        },
                        {
                            name: 'Document Processing System',
                            code: 'DPS-002',
                            price: 8000,
                            currency: 'USD',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'business-case',
                    endpoint: '/business-case',
                    description: 'Business cases',
                    data: [
                        {
                            name: 'Ginati Business Automation',
                            status: 'in_progress',
                            spaces: [2]
                        },
                        {
                            name: 'Mizrahi Insurance System',
                            status: 'in_progress',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'invoice',
                    endpoint: '/invoice',
                    description: 'Invoice management',
                    data: [
                        {
                            number: 'INV-2024-001',
                            status: 'pending',
                            spaces: [2]
                        },
                        {
                            number: 'INV-2024-002',
                            status: 'pending',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'event',
                    endpoint: '/event',
                    description: 'Calendar events',
                    data: [
                        {
                            title: 'Ben Ginati Project Kickoff',
                            start: '2024-01-15T10:00:00Z',
                            end: '2024-01-15T11:00:00Z',
                            spaces: [2]
                        },
                        {
                            title: 'Shelly Mizrahi System Demo',
                            start: '2024-01-20T14:00:00Z',
                            end: '2024-01-20T15:00:00Z',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'note',
                    endpoint: '/note',
                    description: 'Notes and documentation',
                    data: [
                        {
                            title: 'Ben Ginati Project Requirements',
                            content: 'Complete business automation including document processing, workflow management, and reporting.',
                            spaces: [2]
                        },
                        {
                            title: 'Shelly Mizrahi Insurance System',
                            content: 'Insurance document processing system requirements and specifications.',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'business-offer',
                    endpoint: '/business-offer',
                    description: 'Business offers',
                    data: [
                        {
                            name: 'Ginati Business Automation Offer',
                            status: 'active',
                            spaces: [2]
                        },
                        {
                            name: 'Mizrahi Insurance System Offer',
                            status: 'active',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'business-order',
                    endpoint: '/business-order',
                    description: 'Business orders',
                    data: [
                        {
                            number: 'ORD-2024-001',
                            status: 'confirmed',
                            spaces: [2]
                        },
                        {
                            number: 'ORD-2024-002',
                            status: 'confirmed',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'business-contract',
                    endpoint: '/business-contract',
                    description: 'Business contracts',
                    data: [
                        {
                            name: 'Ginati Service Agreement',
                            status: 'active',
                            spaces: [2]
                        },
                        {
                            name: 'Mizrahi Insurance Contract',
                            status: 'active',
                            spaces: [2]
                        }
                    ]
                },
                {
                    name: 'form',
                    endpoint: '/form',
                    description: 'Form management',
                    data: [
                        {
                            name: 'Customer Onboarding Form',
                            status: 'active',
                            spaces: [2]
                        },
                        {
                            name: 'Project Requirements Form',
                            status: 'active',
                            spaces: [2]
                        }
                    ]
                }
            ];

            this.results.summary.totalModules = modules.length;

            for (const module of modules) {
                console.log(`\n📦 Populating module: ${module.name.toUpperCase()}`);
                console.log(`   Description: ${module.description}`);
                console.log(`   Endpoint: ${module.endpoint}`);
                console.log(`   Records to create: ${module.data.length}`);

                this.results.populationResults[module.name] = {
                    description: module.description,
                    endpoint: module.endpoint,
                    records: [],
                    summary: {
                        total: module.data.length,
                        successful: 0,
                        failed: 0
                    }
                };

                for (const record of module.data) {
                    try {
                        const response = await axios.post(`${this.apiBaseUrl}${module.endpoint}`, record, {
                            headers: {
                                'Authorization': `Bearer ${this.apiKey}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        });

                        console.log(`  ✅ Created: ${record.name || record.title || record.number || 'Record'}`);
                        this.results.populationResults[module.name].records.push({
                            data: record,
                            status: 'success',
                            statusCode: response.status,
                            response: response.data
                        });
                        this.results.populationResults[module.name].summary.successful++;
                        this.results.summary.successfulRecords++;

                    } catch (error) {
                        console.log(`  ❌ Failed: ${record.name || record.title || record.number || 'Record'} - ${error.response?.status || 'Error'}`);
                        if (error.response?.data) {
                            console.log(`     Error details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
                        }
                        this.results.populationResults[module.name].records.push({
                            data: record,
                            status: 'failed',
                            error: error.message,
                            statusCode: error.response?.status,
                            errorDetails: error.response?.data
                        });
                        this.results.populationResults[module.name].summary.failed++;
                    }
                }

                const moduleSummary = this.results.populationResults[module.name].summary;
                if (moduleSummary.successful > 0) {
                    this.results.summary.successfulModules++;
                    console.log(`  🎯 Module ${module.name}: ${moduleSummary.successful}/${moduleSummary.total} records created successfully`);
                } else {
                    this.results.summary.failedModules++;
                    console.log(`  ❌ Module ${module.name}: All ${moduleSummary.total} records failed`);
                }
            }

            this.results.summary.totalRecords = modules.reduce((total, module) => total + module.data.length, 0);
            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n📊 POPULATION SUMMARY:');
            console.log(`✅ Successful Modules: ${this.results.summary.successfulModules}/${this.results.summary.totalModules}`);
            console.log(`✅ Successful Records: ${this.results.summary.successfulRecords}/${this.results.summary.totalRecords}`);
            console.log(`❌ Failed Modules: ${this.results.summary.failedModules}/${this.results.summary.totalModules}`);

            console.log('\n✅ CORRECT FORMATS POPULATION COMPLETED!');

        } catch (error) {
            console.error('❌ Population failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-correct-formats';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-correct-formats-population-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const population = new BoostSpaceCorrectFormatsPopulation();
    await population.populateWithCorrectFormats();
}

main().catch(console.error);
