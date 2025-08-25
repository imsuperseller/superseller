#!/usr/bin/env node

/**
 * 🎯 FINAL VERIFICATION OF ALL MODULES
 * Check current status after BMAD methodology execution
 */

import axios from 'axios';

class BoostSpaceFinalVerification {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.apiBaseUrl = 'https://superseller.boost.space/api';

        this.results = {
            timestamp: new Date().toISOString(),
            totalModules: 0,
            populatedModules: 0,
            emptyModules: 0,
            moduleDetails: []
        };
    }

    async verifyAllModules() {
        console.log('🎯 FINAL VERIFICATION OF ALL MODULES');
        console.log('====================================\n');

        // Get all modules
        const allModules = await this.getAllModules();
        console.log(`📦 Found ${allModules.length} total modules\n`);

        this.results.totalModules = allModules.length;

        // Check each module
        for (const module of allModules) {
            console.log(`🔍 Checking ${module}...`);
            const moduleStatus = await this.checkModuleStatus(module);
            this.results.moduleDetails.push(moduleStatus);

            if (moduleStatus.hasData) {
                this.results.populatedModules++;
                console.log(`  ✅ ${module}: ${moduleStatus.recordCount} records`);
            } else {
                this.results.emptyModules++;
                console.log(`  ❌ ${module}: Empty`);
            }
        }

        // Final summary
        console.log('\n📊 FINAL VERIFICATION RESULTS');
        console.log('==============================');
        console.log(`📦 Total Modules: ${this.results.totalModules}`);
        console.log(`✅ Populated: ${this.results.populatedModules}`);
        console.log(`❌ Empty: ${this.results.emptyModules}`);
        console.log(`📈 Success Rate: ${((this.results.populatedModules / this.results.totalModules) * 100).toFixed(1)}%`);

        // List populated modules
        console.log('\n✅ POPULATED MODULES:');
        this.results.moduleDetails
            .filter(m => m.hasData)
            .forEach(m => console.log(`  - ${m.module}: ${m.recordCount} records`));

        // List empty modules
        console.log('\n❌ EMPTY MODULES:');
        this.results.moduleDetails
            .filter(m => !m.hasData)
            .forEach(m => console.log(`  - ${m.module}: ${m.error || 'No data'}`));

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

    async checkModuleStatus(module) {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/${module}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const recordCount = Array.isArray(response.data) ? response.data.length : 0;

            return {
                module: module,
                hasData: recordCount > 0,
                recordCount: recordCount,
                status: 'success'
            };
        } catch (error) {
            return {
                module: module,
                hasData: false,
                recordCount: 0,
                error: error.response?.data?.message || error.message,
                status: 'error'
            };
        }
    }
}

async function main() {
    const verification = new BoostSpaceFinalVerification();
    await verification.verifyAllModules();
}

main().catch(console.error);
