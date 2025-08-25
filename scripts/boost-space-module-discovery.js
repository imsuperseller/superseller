#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceModuleDiscovery {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.systemKey = 'superseller';
        this.apiBaseUrl = `https://${this.systemKey}.boost.space/api`;
        this.results = {
            timestamp: new Date().toISOString(),
            availableModules: {},
            workingModules: [],
            brokenModules: [],
            manualConfigurationNeeded: []
        };
    }

    async discoverAllModules() {
        console.log('🔍 DISCOVERING ALL BOOST.SPACE MODULES');
        console.log('=====================================\n');

        // Test all known modules from the API documentation
        const modulesToTest = [
            'contact', 'product', 'invoice', 'event', 'note', 'business-order',
            'business-offer', 'form', 'business-case', 'business-contract',
            'todo', 'file', 'project', 'work', 'activities', 'team', 'user',
            'category', 'space', 'submission', 'purchase', 'stock-request',
            'stock-reservation', 'stock-inventory', 'stock-item', 'address',
            'page', 'resource', 'integration', 'chart', 'custom-info',
            'custom-module-item', 'automatization', 'import', 'payment'
        ];

        for (const moduleName of modulesToTest) {
            await this.testModule(moduleName);
        }

        await this.analyzeResults();
        await this.saveResults();
    }

    async testModule(moduleName) {
        console.log(`🔍 Testing module: ${moduleName}`);

        try {
            const response = await axios.get(`${this.apiBaseUrl}/${moduleName}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            // If we get here, the module exists and is accessible
            const recordCount = Array.isArray(response.data) ? response.data.length : 0;

            this.results.availableModules[moduleName] = {
                status: 'available',
                recordCount: recordCount,
                endpoint: `/${moduleName}`,
                accessible: true
            };

            console.log(`  ✅ ${moduleName}: Available (${recordCount} records)`);

        } catch (error) {
            const statusCode = error.response?.status;

            if (statusCode === 404) {
                this.results.availableModules[moduleName] = {
                    status: 'not_found',
                    endpoint: `/${moduleName}`,
                    accessible: false,
                    error: '404 Not Found'
                };
                console.log(`  ❌ ${moduleName}: Not Found (404)`);
            } else if (statusCode === 500) {
                this.results.availableModules[moduleName] = {
                    status: 'server_error',
                    endpoint: `/${moduleName}`,
                    accessible: false,
                    error: '500 Server Error'
                };
                console.log(`  ⚠️  ${moduleName}: Server Error (500)`);
            } else {
                this.results.availableModules[moduleName] = {
                    status: 'error',
                    endpoint: `/${moduleName}`,
                    accessible: false,
                    error: error.message,
                    statusCode: statusCode
                };
                console.log(`  ❌ ${moduleName}: Error (${statusCode || 'Unknown'})`);
            }
        }
    }

    async analyzeResults() {
        console.log('\n📊 ANALYSIS RESULTS');
        console.log('==================');

        // Categorize modules
        for (const [moduleName, moduleInfo] of Object.entries(this.results.availableModules)) {
            if (moduleInfo.status === 'available') {
                this.results.workingModules.push(moduleName);
            } else if (moduleInfo.status === 'server_error') {
                this.results.manualConfigurationNeeded.push(moduleName);
            } else {
                this.results.brokenModules.push(moduleName);
            }
        }

        console.log(`\n✅ Working Modules (${this.results.workingModules.length}):`);
        this.results.workingModules.forEach(module => {
            const recordCount = this.results.availableModules[module].recordCount;
            console.log(`  - ${module} (${recordCount} records)`);
        });

        console.log(`\n⚠️  Manual Configuration Needed (${this.results.manualConfigurationNeeded.length}):`);
        this.results.manualConfigurationNeeded.forEach(module => {
            console.log(`  - ${module} (500 Server Error)`);
        });

        console.log(`\n❌ Broken/Not Found (${this.results.brokenModules.length}):`);
        this.results.brokenModules.forEach(module => {
            const error = this.results.availableModules[module].error;
            console.log(`  - ${module} (${error})`);
        });

        // Provide specific recommendations
        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('==================');

        if (this.results.manualConfigurationNeeded.length > 0) {
            console.log('\n📋 MANUAL CONFIGURATION REQUIRED:');
            console.log('These modules need to be enabled in the Boost.space web interface:');
            this.results.manualConfigurationNeeded.forEach(module => {
                console.log(`  1. Go to https://superseller.boost.space`);
                console.log(`  2. Navigate to Settings > Modules`);
                console.log(`  3. Enable the "${module}" module`);
                console.log(`  4. Configure any required settings`);
                console.log(`  5. Try the API again`);
                console.log('');
            });
        }

        console.log('\n📈 SUMMARY:');
        console.log(`- Total modules tested: ${Object.keys(this.results.availableModules).length}`);
        console.log(`- Working modules: ${this.results.workingModules.length}`);
        console.log(`- Need manual config: ${this.results.manualConfigurationNeeded.length}`);
        console.log(`- Broken/not found: ${this.results.brokenModules.length}`);
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-discovery';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `module-discovery-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const discovery = new BoostSpaceModuleDiscovery();
    await discovery.discoverAllModules();
}

main().catch(console.error);
