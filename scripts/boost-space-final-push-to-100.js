#!/usr/bin/env node

/**
 * 🎯 FINAL PUSH TO 100% COMPLETION
 * Handle the remaining modules with specific field requirements
 */

import axios from 'axios';

class BoostSpaceFinalPushTo100 {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';

        this.results = {
            timestamp: new Date().toISOString(),
            targetModules: 14,
            completedModules: 0,
            failedModules: 0,
            details: []
        };
    }

    async finalPushTo100() {
        console.log('🎯 FINAL PUSH TO 100% COMPLETION');
        console.log('==================================\n');

        const remainingModules = [
            { module: 'payment', error: 'Request data doesn\'t contain input \'statusId\'' },
            { module: 'import', error: 'Field \'fileToImportId\' can\'t be empty' },
            { module: 'stock-request', error: 'Operation has been blocked due to wrongly specified field stock_card_id' },
            { module: 'purchase', error: 'Field \'deliveryAddressId\' can\'t be empty' },
            { module: 'stock-reservation', error: 'Request data doesn\'t contain input \'from\'' },
            { module: 'integration', error: 'Request data doesn\'t contain input \'setting\'' },
            { module: 'work', error: 'only_one_can_be_filled' }
        ];

        for (const moduleInfo of remainingModules) {
            console.log(`🎯 Final push for ${moduleInfo.module}...`);
            const result = await this.finalPushModule(moduleInfo);
            this.results.details.push(result);

            if (result.status === 'success') {
                this.results.completedModules++;
                console.log(`  ✅ ${moduleInfo.module}: Completed successfully (ID: ${result.recordId})`);
            } else {
                this.results.failedModules++;
                console.log(`  ❌ ${moduleInfo.module}: ${result.error}`);
            }
        }

        console.log('\n📊 FINAL PUSH RESULTS');
        console.log('=====================');
        console.log(`✅ Completed: ${this.results.completedModules}/${this.results.targetModules}`);
        console.log(`❌ Failed: ${this.results.failedModules}/${this.results.targetModules}`);
        console.log(`📈 Success Rate: ${((this.results.completedModules / this.results.targetModules) * 100).toFixed(1)}%`);

        return this.results;
    }

    async finalPushModule(moduleInfo) {
        try {
            const data = this.getFinalPushData(moduleInfo);
            const response = await axios.post(`${this.apiBaseUrl}/${moduleInfo.module}`, data, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                module: moduleInfo.module,
                status: 'success',
                recordId: response.data.id,
                method: 'API with final field fixes'
            };
        } catch (error) {
            return {
                module: moduleInfo.module,
                status: 'failed',
                error: error.response?.data?.message || error.message,
                method: 'API with final field fixes'
            };
        }
    }

    getFinalPushData(moduleInfo) {
        const baseData = {
            name: `Sample ${moduleInfo.module} Record`,
            spaceId: this.getSpaceId(moduleInfo.module),
            statusSystemId: this.getStatusSystemId(moduleInfo.module)
        };

        const finalData = this.getFinalPushFields(moduleInfo);
        return { ...baseData, ...finalData };
    }

    getFinalPushFields(moduleInfo) {
        const finalFields = {
            'payment': {
                module: 'payment',
                recordId: 1,
                amount: 50.00,
                currency: 'USD',
                paymentMethod: 'credit_card',
                statusId: 89
            },
            'import': {
                module: 'import',
                importedAmount: 100.00,
                source: 'API Import',
                importType: 'data',
                fileToImportId: 1
            },
            'stock-request': {
                stockCardId: 1,
                quantity: 10,
                requestType: 'purchase',
                stock_card_id: 1
            },
            'purchase': {
                language: 'en',
                contactId: 11,
                amount: 100.00,
                currencyId: 1,
                deliveryAddressId: 1
            },
            'stock-reservation': {
                stockCardId: 1,
                quantity: 5,
                userId: 1,
                reservationType: 'hold',
                from: new Date().toISOString()
            },
            'integration': {
                remote: 'sample-integration',
                title: 'Sample Integration',
                integrationType: 'api',
                setting: 'default'
            },
            'work': {
                resourceId: 1,
                title: 'Sample Work Record',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 3600000).toISOString()
            }
        };

        return finalFields[moduleInfo.module] || {};
    }

    getSpaceId(module) {
        const spaceMapping = {
            'payment': 27,
            'import': 27,
            'stock-request': 27,
            'purchase': 27,
            'stock-reservation': 27,
            'integration': 27,
            'work': 27
        };
        return spaceMapping[module] || 27;
    }

    getStatusSystemId(module) {
        const statusMapping = {
            'payment': 89,
            'import': 87,
            'stock-request': 96,
            'purchase': 62,
            'stock-reservation': 60,
            'integration': 83,
            'work': 19
        };
        return statusMapping[module] || 1;
    }
}

async function main() {
    const finalPush = new BoostSpaceFinalPushTo100();
    await finalPush.finalPushTo100();
}

main().catch(console.error);
