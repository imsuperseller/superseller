#!/usr/bin/env node

/**
 * 🎯 POPULATE REMAINING 20 EMPTY MODULES
 * Based on BMAD analysis results
 */

import axios from 'axios';

class BoostSpacePopulateRemainingModules {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';

        this.results = {
            timestamp: new Date().toISOString(),
            totalModules: 0,
            populatedModules: 0,
            failedModules: 0,
            details: []
        };
    }

    async populateAllRemainingModules() {
        console.log('🎯 POPULATING REMAINING 20 EMPTY MODULES');
        console.log('========================================\n');

        // Get all modules and identify empty ones
        const allModules = await this.getAllModules();
        const populatedModules = await this.getPopulatedModules(allModules);
        const emptyModules = allModules.filter(m => !populatedModules.includes(m));

        console.log(`📦 Found ${allModules.length} total modules`);
        console.log(`✅ ${populatedModules.length} already populated`);
        console.log(`❌ ${emptyModules.length} need population\n`);

        this.results.totalModules = allModules.length;
        this.results.populatedModules = populatedModules.length;

        // Populate each empty module
        for (const module of emptyModules) {
            console.log(`📦 Populating ${module}...`);
            const result = await this.populateModule(module);
            this.results.details.push(result);

            if (result.status === 'success') {
                this.results.populatedModules++;
                console.log(`  ✅ ${module}: Created successfully (ID: ${result.recordId})`);
            } else {
                this.results.failedModules++;
                console.log(`  ❌ ${module}: ${result.error}`);
            }
        }

        // Final summary
        console.log('\n📊 FINAL RESULTS');
        console.log('================');
        console.log(`✅ Successfully populated: ${this.results.populatedModules}`);
        console.log(`❌ Failed to populate: ${this.results.failedModules}`);
        console.log(`📦 Total modules now: ${this.results.totalModules}`);

        return this.results;
    }

    async getAllModules() {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/status-system`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const modules = [...new Set(response.data.map(item => item.module))];
            return modules.filter(module => module && module !== 'custom-module-item');
        } catch (error) {
            console.log(`❌ Failed to get modules: ${error.message}`);
            return [];
        }
    }

    async getPopulatedModules(modules) {
        const populated = [];

        for (const module of modules) {
            try {
                const response = await axios.get(`${this.apiBaseUrl}/${module}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                const count = Array.isArray(response.data) ? response.data.length : 0;
                if (count > 0) {
                    populated.push(module);
                }
            } catch (error) {
                // Module might not exist or have API access
            }
        }

        return populated;
    }

    async populateModule(module) {
        try {
            const data = this.getModuleData(module);
            const response = await axios.post(`${this.apiBaseUrl}/${module}`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                module: module,
                status: 'success',
                recordId: response.data.id,
                method: 'API'
            };
        } catch (error) {
            return {
                module: module,
                status: 'failed',
                error: error.response?.data?.message || error.message,
                method: 'API'
            };
        }
    }

    getModuleData(module) {
        const baseData = {
            name: `Sample ${module} Record`,
            spaceId: this.getSpaceId(module),
            statusSystemId: this.getStatusSystemId(module)
        };

        // Add module-specific fields
        const specificData = this.getSpecificModuleData(module);
        return { ...baseData, ...specificData };
    }

    getSpaceId(module) {
        const spaceMapping = {
            'contact': 26,
            'product': 27,
            'business-case': 29,
            'business-contract': 29,
            'business-order': 27,
            'business-offer': 27,
            'invoice': 27,
            'event': 27,
            'note': 27,
            'form': 27,
            'todo': 27,
            'project': 31,
            'work': 27,
            'purchase': 27,
            'file': 27,
            'submission': 27,
            'team': 27,
            'user': 27,
            'category': 27,
            'address': 27,
            'page': 27,
            'resource': 27,
            'integration': 27,
            'chart': 27,
            'custom-info': 27,
            'automatization': 27,
            'import': 27,
            'payment': 27,
            'stock-request': 27,
            'stock-reservation': 27,
            'stock-inventory': 27,
            'stock-item': 27,
            'activities': 27
        };
        return spaceMapping[module] || 27;
    }

    getStatusSystemId(module) {
        const statusMapping = {
            'contact': 108,
            'product': 52,
            'business-case': 30,
            'business-contract': 54,
            'business-order': 26,
            'business-offer': 34,
            'invoice': 38,
            'event': 21,
            'note': 13,
            'form': 73,
            'todo': 5,
            'project': 10,
            'work': 19,
            'purchase': 62,
            'file': 41,
            'submission': 45,
            'team': 15,
            'user': 8,
            'category': 17,
            'address': 43,
            'page': 78,
            'resource': 80,
            'integration': 83,
            'chart': 100,
            'custom-info': 104,
            'automatization': 98,
            'import': 87,
            'payment': 89,
            'stock-request': 96,
            'stock-reservation': 60,
            'stock-inventory': 93,
            'stock-item': 111,
            'activities': 22
        };
        return statusMapping[module] || 1;
    }

    getSpecificModuleData(module) {
        const specificData = {
            'todo': {
                title: 'Sample Todo Task',
                description: 'This is a sample todo task created via API'
            },
            'work': {
                title: 'Sample Work Record',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 3600000).toISOString()
            },
            'purchase': {
                title: 'Sample Purchase',
                contactId: 11,
                amount: 100.00
            },
            'file': {
                title: 'Sample File',
                image: 'sample-image.jpg',
                description: 'Sample file record'
            },
            'submission': {
                title: 'Sample Submission',
                description: 'Sample form submission'
            },
            'team': {
                title: 'Sample Team',
                description: 'Sample team record'
            },
            'user': {
                title: 'Sample User',
                email: 'sample@example.com'
            },
            'category': {
                title: 'Sample Category',
                description: 'Sample category record'
            },
            'address': {
                title: 'Sample Address',
                street: '123 Sample St',
                city: 'Sample City'
            },
            'page': {
                title: 'Sample Page',
                content: 'Sample page content'
            },
            'resource': {
                title: 'Sample Resource',
                description: 'Sample resource record'
            },
            'integration': {
                title: 'Sample Integration',
                description: 'Sample integration record'
            },
            'chart': {
                title: 'Sample Chart',
                description: 'Sample chart record'
            },
            'custom-info': {
                title: 'Sample Custom Info',
                description: 'Sample custom info record'
            },
            'automatization': {
                title: 'Sample Automatization',
                description: 'Sample automatization record'
            },
            'import': {
                title: 'Sample Import',
                description: 'Sample import record'
            },
            'payment': {
                title: 'Sample Payment',
                amount: 50.00,
                description: 'Sample payment record'
            },
            'stock-request': {
                title: 'Sample Stock Request',
                description: 'Sample stock request record'
            },
            'stock-reservation': {
                title: 'Sample Stock Reservation',
                description: 'Sample stock reservation record'
            },
            'stock-inventory': {
                title: 'Sample Stock Inventory',
                description: 'Sample stock inventory record'
            },
            'stock-item': {
                title: 'Sample Stock Item',
                description: 'Sample stock item record'
            },
            'activities': {
                title: 'Sample Activity',
                description: 'Sample activity record'
            }
        };

        return specificData[module] || {};
    }
}

async function main() {
    const population = new BoostSpacePopulateRemainingModules();
    await population.populateAllRemainingModules();
}

main().catch(console.error);
