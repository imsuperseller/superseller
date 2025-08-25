#!/usr/bin/env node

/**
 * 🎯 BOOST.SPACE CORRECT MODULE NAMES
 * Based on actual dashboard: Orders, Offers, Business cases, Contracts
 * NOT: Business Orders, Business Offers, Business Contracts
 */

import axios from 'axios';

class BoostSpaceCorrectModuleNames {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';

        // CORRECT module names from actual dashboard
        this.correctModules = {
            'order': { spaceId: 27, statusSystemId: 26, displayName: 'Orders' },
            'offer': { spaceId: 27, statusSystemId: 34, displayName: 'Offers' },
            'business-case': { spaceId: 29, statusSystemId: 30, displayName: 'Business cases' },
            'contract': { spaceId: 29, statusSystemId: 54, displayName: 'Contracts' }
        };
    }

    async populateCorrectModules() {
        console.log('🎯 BOOST.SPACE CORRECT MODULE NAMES');
        console.log('====================================\n');

        for (const [moduleName, config] of Object.entries(this.correctModules)) {
            console.log(`📦 Populating ${config.displayName} (${moduleName})...`);
            await this.populateModule(moduleName, config);
        }
    }

    async populateModule(moduleName, config) {
        try {
            const response = await axios.post(`${this.apiBaseUrl}/${moduleName}`, {
                name: `Sample ${config.displayName} Record`,
                spaceId: config.spaceId,
                statusSystemId: config.statusSystemId
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`  ✅ ${config.displayName}: Created successfully (ID: ${response.data.id})`);
        } catch (error) {
            console.log(`  ❌ ${config.displayName}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
        }
    }

    async verifyCorrectModules() {
        console.log('\n🔍 VERIFYING CORRECT MODULES');
        console.log('============================');

        for (const [moduleName, config] of Object.entries(this.correctModules)) {
            try {
                const response = await axios.get(`${this.apiBaseUrl}/${moduleName}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                const count = Array.isArray(response.data) ? response.data.length : 0;
                console.log(`  ${count > 0 ? '✅' : '❌'} ${config.displayName}: ${count} records`);
            } catch (error) {
                console.log(`  ❌ ${config.displayName}: ${error.response?.status || 'Error'}`);
            }
        }
    }
}

async function main() {
    const correctModules = new BoostSpaceCorrectModuleNames();
    await correctModules.populateCorrectModules();
    await correctModules.verifyCorrectModules();
}

main().catch(console.error);
