#!/usr/bin/env node

/**
 * 🎯 BOOST.SPACE FINAL ACCURATE SOLUTION
 * 
 * CORRECT API MODULE NAMES (from status-system):
 * - business-order (not "Orders")
 * - business-offer (not "Offers") 
 * - business-contract (not "Contracts")
 * - business-case (Business cases)
 * - contact (Contacts)
 * - product (Products)
 * - invoice (Invoices)
 * - event (Calendar)
 * - note (Notes)
 * - form (Forms)
 * - todo (Tasks)
 * - project (Projects)
 * - work (Work hours)
 * - submission (Submissions)
 * - purchase (Usage & Cost)
 * - file (Docs)
 */

import axios from 'axios';

class BoostSpaceFinalAccurateSolution {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';

        // ACCURATE module configurations from status-system
        this.accurateModules = {
            'business-order': { spaceId: 27, statusSystemId: 26, displayName: 'Orders' },
            'business-offer': { spaceId: 27, statusSystemId: 34, displayName: 'Offers' },
            'business-contract': { spaceId: 29, statusSystemId: 54, displayName: 'Contracts' },
            'business-case': { spaceId: 29, statusSystemId: 30, displayName: 'Business cases' },
            'contact': { spaceId: 26, statusSystemId: 108, displayName: 'Contacts' },
            'product': { spaceId: 27, statusSystemId: 52, displayName: 'Products' },
            'invoice': { spaceId: 27, statusSystemId: 38, displayName: 'Invoices' },
            'event': { spaceId: 27, statusSystemId: 21, displayName: 'Calendar' },
            'note': { spaceId: 27, statusSystemId: 13, displayName: 'Notes' },
            'form': { spaceId: 27, statusSystemId: 73, displayName: 'Forms' },
            'todo': { spaceId: 27, statusSystemId: 5, displayName: 'Tasks' },
            'project': { spaceId: 31, statusSystemId: 10, displayName: 'Projects' },
            'work': { spaceId: 27, statusSystemId: 19, displayName: 'Work hours' },
            'submission': { spaceId: 27, statusSystemId: 45, displayName: 'Submissions' },
            'purchase': { spaceId: 27, statusSystemId: 62, displayName: 'Usage & Cost' },
            'file': { spaceId: 27, statusSystemId: 41, displayName: 'Docs' }
        };
    }

    async populateAllAccurateModules() {
        console.log('🎯 BOOST.SPACE FINAL ACCURATE SOLUTION');
        console.log('======================================\n');

        const results = {
            successful: [],
            failed: [],
            summary: {
                total: Object.keys(this.accurateModules).length,
                successful: 0,
                failed: 0
            }
        };

        for (const [moduleName, config] of Object.entries(this.accurateModules)) {
            console.log(`📦 Populating ${config.displayName} (${moduleName})...`);

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
                results.successful.push({
                    module: moduleName,
                    displayName: config.displayName,
                    id: response.data.id
                });
                results.summary.successful++;

            } catch (error) {
                console.log(`  ❌ ${config.displayName}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
                results.failed.push({
                    module: moduleName,
                    displayName: config.displayName,
                    error: error.response?.status || 'Error',
                    message: error.response?.data?.message || error.message
                });
                results.summary.failed++;
            }
        }

        console.log('\n📊 FINAL RESULTS SUMMARY');
        console.log('========================');
        console.log(`✅ Successful: ${results.summary.successful}/${results.summary.total}`);
        console.log(`❌ Failed: ${results.summary.failed}/${results.summary.total}`);

        if (results.failed.length > 0) {
            console.log('\n❌ FAILED MODULES:');
            results.failed.forEach(fail => {
                console.log(`  - ${fail.displayName} (${fail.module}): ${fail.error} - ${fail.message}`);
            });
        }

        if (results.successful.length > 0) {
            console.log('\n✅ SUCCESSFUL MODULES:');
            results.successful.forEach(success => {
                console.log(`  - ${success.displayName} (${success.module}): ID ${success.id}`);
            });
        }

        return results;
    }

    async verifyAllModules() {
        console.log('\n🔍 VERIFYING ALL MODULES');
        console.log('========================');

        for (const [moduleName, config] of Object.entries(this.accurateModules)) {
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
    const solution = new BoostSpaceFinalAccurateSolution();
    await solution.populateAllAccurateModules();
    await solution.verifyAllModules();
}

main().catch(console.error);
