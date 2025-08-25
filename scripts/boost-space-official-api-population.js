#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceOfficialAPIPopulation {
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

    async populateExistingModules() {
        console.log('🚀 POPULATING EXISTING BOOST.SPACE MODULES');
        console.log('==========================================\n');

        try {
            // Define the modules with their official API endpoints
            const modules = [
                {
                    name: 'contact',
                    endpoint: '/contact',
                    description: 'Customer contacts',
                    data: [
                        {
                            name: 'Ben Ginati',
                            email: 'ben@ginati.com',
                            phone: '+972-50-123-4567',
                            company: 'Ginati Business Solutions',
                            status: 'Active Customer',
                            notes: 'Complete business automation project'
                        },
                        {
                            name: 'Shelly Mizrahi',
                            email: 'shelly@mizrahi-insurance.com',
                            phone: '+972-52-987-6543',
                            company: 'Mizrahi Insurance Services',
                            status: 'Active Customer',
                            notes: 'Insurance document processing system'
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
                            sku: 'BAP-001',
                            price: 15000,
                            category: 'Automation',
                            status: 'Active',
                            description: 'Complete business process automation solution'
                        },
                        {
                            name: 'Document Processing System',
                            sku: 'DPS-002',
                            price: 8000,
                            category: 'Documentation',
                            status: 'Active',
                            description: 'Advanced document processing and workflow automation'
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
                            status: 'In Progress',
                            customer: 'Ben Ginati',
                            budget: 15000,
                            timeline: '3 months',
                            description: 'Complete business process automation for Ginati Business Solutions'
                        },
                        {
                            name: 'Mizrahi Insurance System',
                            status: 'In Progress',
                            customer: 'Shelly Mizrahi',
                            budget: 12000,
                            timeline: '2 months',
                            description: 'Insurance document processing and workflow automation'
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
                            customer: 'Ben Ginati',
                            amount: 5000,
                            status: 'Pending',
                            due_date: '2024-12-31',
                            description: 'Business automation package payment'
                        },
                        {
                            number: 'INV-2024-002',
                            customer: 'Shelly Mizrahi',
                            amount: 3000,
                            status: 'Pending',
                            due_date: '2024-12-31',
                            description: 'Insurance system implementation'
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
                            start_date: '2024-01-15T10:00:00Z',
                            end_date: '2024-01-15T11:00:00Z',
                            location: 'Virtual Meeting',
                            description: 'Initial project planning and requirements gathering'
                        },
                        {
                            title: 'Shelly Mizrahi System Demo',
                            start_date: '2024-01-20T14:00:00Z',
                            end_date: '2024-01-20T15:00:00Z',
                            location: 'Virtual Meeting',
                            description: 'Insurance system demonstration and feedback session'
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
                            content: 'Complete business automation including document processing, workflow management, and reporting. Key requirements: 1) Automated document processing, 2) Workflow management, 3) Reporting dashboard, 4) Integration with existing systems.',
                            author: 'Shai Friedman',
                            category: 'Project',
                            tags: ['automation', 'business', 'ginati', 'requirements']
                        },
                        {
                            title: 'Shelly Mizrahi Insurance System',
                            content: 'Insurance document processing system requirements: 1) Document upload and processing, 2) Automated form filling, 3) Client portal access, 4) Integration with insurance databases, 5) Compliance reporting.',
                            author: 'Shai Friedman',
                            category: 'Project',
                            tags: ['insurance', 'documents', 'mizrahi', 'compliance']
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
                            customer: 'Ben Ginati',
                            value: 15000,
                            status: 'Active',
                            valid_until: '2024-12-31',
                            description: 'Complete business automation package including document processing, workflow management, and reporting dashboard.'
                        },
                        {
                            name: 'Mizrahi Insurance System Offer',
                            customer: 'Shelly Mizrahi',
                            value: 12000,
                            status: 'Active',
                            valid_until: '2024-12-31',
                            description: 'Insurance document processing system with client portal and compliance reporting.'
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
                            customer: 'Ben Ginati',
                            items: ['Business Automation Package'],
                            total: 15000,
                            status: 'Confirmed',
                            delivery_date: '2024-03-15'
                        },
                        {
                            number: 'ORD-2024-002',
                            customer: 'Shelly Mizrahi',
                            items: ['Insurance Document System'],
                            total: 12000,
                            status: 'Confirmed',
                            delivery_date: '2024-02-28'
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
                            parties: ['Rensto', 'Ginati Business Solutions'],
                            terms: 'Complete business automation service including implementation, training, and support.',
                            status: 'Active',
                            start_date: '2024-01-15',
                            end_date: '2024-12-31'
                        },
                        {
                            name: 'Mizrahi Insurance Contract',
                            parties: ['Rensto', 'Mizrahi Insurance Services'],
                            terms: 'Insurance document processing system implementation with ongoing support and maintenance.',
                            status: 'Active',
                            start_date: '2024-01-20',
                            end_date: '2024-12-31'
                        }
                    ]
                },
                {
                    name: 'submission',
                    endpoint: '/submission',
                    description: 'Document submissions',
                    data: [
                        {
                            name: 'Ginati Project Proposal',
                            customer: 'Ben Ginati',
                            status: 'Submitted',
                            submission_date: '2024-01-10',
                            content: 'Business automation project proposal with detailed requirements and implementation plan.'
                        },
                        {
                            name: 'Mizrahi Insurance Requirements',
                            customer: 'Shelly Mizrahi',
                            status: 'Submitted',
                            submission_date: '2024-01-12',
                            content: 'Insurance document processing system requirements and specifications.'
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
                            fields: ['name', 'email', 'company', 'requirements', 'budget'],
                            status: 'Active',
                            created_date: '2024-01-01'
                        },
                        {
                            name: 'Project Requirements Form',
                            fields: ['project_name', 'description', 'timeline', 'budget', 'contact_info'],
                            status: 'Active',
                            created_date: '2024-01-01'
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
                        this.results.populationResults[module.name].records.push({
                            data: record,
                            status: 'failed',
                            error: error.message,
                            statusCode: error.response?.status
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

            console.log('\n✅ EXISTING MODULES POPULATION COMPLETED!');

        } catch (error) {
            console.error('❌ Population failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-official-api';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-official-api-population-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const population = new BoostSpaceOfficialAPIPopulation();
    await population.populateExistingModules();
}

main().catch(console.error);
