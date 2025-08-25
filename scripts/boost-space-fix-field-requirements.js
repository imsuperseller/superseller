#!/usr/bin/env node

/**
 * 🎯 FIX FIELD REQUIREMENTS FOR FAILED MODULES
 * Based on error messages from previous attempt
 */

import axios from 'axios';

class BoostSpaceFixFieldRequirements {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';

        this.results = {
            timestamp: new Date().toISOString(),
            fixedModules: 0,
            failedModules: 0,
            details: []
        };
    }

    async fixFieldRequirements() {
        console.log('🎯 FIXING FIELD REQUIREMENTS FOR FAILED MODULES');
        console.log('================================================\n');

        const failedModules = [
            { module: 'payment', error: 'Request data doesn\'t contain input \'module\'' },
            { module: 'import', error: 'Field \'importedAmount\' can\'t be empty' },
            { module: 'business-offer', error: 'Field \'contactId\' can\'t be empty' },
            { module: 'stock-request', error: 'Request data doesn\'t contain input \'stockCardId\'' },
            { module: 'address', error: 'Field \'alias\' can\'t be empty' },
            { module: 'purchase', error: 'Request data doesn\'t contain input \'language\'' },
            { module: 'stock-reservation', error: 'Request data doesn\'t contain input \'stockCardId\'' },
            { module: 'page', error: 'Request data doesn\'t contain input \'type\'' },
            { module: 'integration', error: 'Request data doesn\'t contain input \'remote\'' },
            { module: 'stock-inventory', error: 'Request data doesn\'t contain input \'datetime\'' },
            { module: 'work', error: 'At least one of these fields must be filled in: resourceId, userId' }
        ];

        for (const failedModule of failedModules) {
            console.log(`🔧 Fixing ${failedModule.module}...`);
            const result = await this.fixModule(failedModule);
            this.results.details.push(result);

            if (result.status === 'success') {
                this.results.fixedModules++;
                console.log(`  ✅ ${failedModule.module}: Fixed successfully (ID: ${result.recordId})`);
            } else {
                this.results.failedModules++;
                console.log(`  ❌ ${failedModule.module}: ${result.error}`);
            }
        }

        console.log('\n📊 FIX RESULTS');
        console.log('==============');
        console.log(`✅ Fixed: ${this.results.fixedModules}`);
        console.log(`❌ Still failed: ${this.results.failedModules}`);

        return this.results;
    }

    async fixModule(failedModule) {
        try {
            const data = this.getFixedModuleData(failedModule);
            const response = await axios.post(`${this.apiBaseUrl}/${failedModule.module}`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                module: failedModule.module,
                status: 'success',
                recordId: response.data.id,
                method: 'API with fixed fields'
            };
        } catch (error) {
            return {
                module: failedModule.module,
                status: 'failed',
                error: error.response?.data?.message || error.message,
                method: 'API with fixed fields'
            };
        }
    }

    getFixedModuleData(failedModule) {
        const baseData = {
            name: `Sample ${failedModule.module} Record`,
            spaceId: this.getSpaceId(failedModule.module),
            statusSystemId: this.getStatusSystemId(failedModule.module)
        };

        // Add specific fixes based on error messages
        const fixes = this.getSpecificFixes(failedModule);
        return { ...baseData, ...fixes };
    }

    getSpecificFixes(failedModule) {
        const fixes = {
            'payment': {
                module: 'payment',
                amount: 50.00,
                currency: 'USD'
            },
            'import': {
                importedAmount: 100.00,
                source: 'API Import'
            },
            'business-offer': {
                contactId: 11,
                amount: 1000.00
            },
            'stock-request': {
                stockCardId: 1,
                quantity: 10
            },
            'address': {
                alias: 'Sample Address',
                street: '123 Sample St',
                city: 'Sample City'
            },
            'purchase': {
                language: 'en',
                contactId: 11,
                amount: 100.00
            },
            'stock-reservation': {
                stockCardId: 1,
                quantity: 5
            },
            'page': {
                type: 'content',
                content: 'Sample page content'
            },
            'integration': {
                remote: 'sample-integration',
                name: 'Sample Integration'
            },
            'stock-inventory': {
                datetime: new Date().toISOString(),
                quantity: 100
            },
            'work': {
                resourceId: 1,
                userId: 1,
                title: 'Sample Work Record',
                startDate: new Date().toISOString()
            }
        };

        return fixes[failedModule.module] || {};
    }

    getSpaceId(module) {
        const spaceMapping = {
            'payment': 27,
            'import': 27,
            'business-offer': 27,
            'stock-request': 27,
            'address': 27,
            'purchase': 27,
            'stock-reservation': 27,
            'page': 27,
            'integration': 27,
            'stock-inventory': 27,
            'work': 27
        };
        return spaceMapping[module] || 27;
    }

    getStatusSystemId(module) {
        const statusMapping = {
            'payment': 89,
            'import': 87,
            'business-offer': 34,
            'stock-request': 96,
            'address': 43,
            'purchase': 62,
            'stock-reservation': 60,
            'page': 78,
            'integration': 83,
            'stock-inventory': 93,
            'work': 19
        };
        return statusMapping[module] || 1;
    }
}

async function main() {
    const fixer = new BoostSpaceFixFieldRequirements();
    await fixer.fixFieldRequirements();
}

main().catch(console.error);
