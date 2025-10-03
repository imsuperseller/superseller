#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * BOOST.SPACE API DISCOVERY
 * 
 * This script discovers the correct API structure for Boost.space
 */

class BoostSpaceAPIDiscovery {
    constructor() {
        this.config = {
            platform: 'https://superseller.boost.space',
            apiKey: 'BOOST_SPACE_KEY_REDACTED',
            headers: {
                'Authorization': `Bearer BOOST_SPACE_KEY_REDACTED`,
                'Content-Type': 'application/json'
            }
        };

        this.results = {
            timestamp: new Date().toISOString(),
            discoveredEndpoints: {},
            workingEndpoints: {},
            dataStructures: {},
            recommendations: {}
        };
    }

    async discoverAPI() {
        console.log('🔍 DISCOVERING BOOST.SPACE API STRUCTURE');
        console.log('========================================\n');

        try {
            // 1. Test common API patterns
            await this.testCommonPatterns();

            // 2. Test user-specific endpoints
            await this.testUserEndpoints();

            // 3. Test module-specific endpoints
            await this.testModuleEndpoints();

            // 4. Analyze working endpoints
            await this.analyzeWorkingEndpoints();

            // 5. Generate recommendations
            await this.generateRecommendations();

            await this.saveResults();

            console.log('\n✅ API DISCOVERY COMPLETED!');
            console.log('🎯 Found working endpoints and data structures!');

        } catch (error) {
            console.error('❌ API discovery failed:', error.message);
            throw error;
        }
    }

    async testCommonPatterns() {
        console.log('🔍 1. TESTING COMMON API PATTERNS');
        console.log('----------------------------------');

        const patterns = [
            '/api/v1/contacts',
            '/api/v1/users',
            '/api/v1/modules',
            '/api/contacts',
            '/api/users',
            '/api/modules',
            '/contacts',
            '/users',
            '/modules',
            '/api/v1',
            '/api',
            '/v1/contacts',
            '/v1/users'
        ];

        for (const pattern of patterns) {
            const result = await this.testEndpoint(pattern);
            this.results.discoveredEndpoints[pattern] = result;

            if (result.status === 'passed') {
                console.log(`✅ ${pattern} - ${result.statusCode}`);
            } else {
                console.log(`❌ ${pattern} - ${result.error}`);
            }
        }
    }

    async testUserEndpoints() {
        console.log('\n👤 2. TESTING USER-SPECIFIC ENDPOINTS');
        console.log('-------------------------------------');

        const userEndpoints = [
            '/api/user',
            '/api/user/4',
            '/api/users',
            '/api/users/4',
            '/user',
            '/user/4',
            '/users',
            '/users/4'
        ];

        for (const endpoint of userEndpoints) {
            const result = await this.testAuthenticatedEndpoint(endpoint);
            this.results.discoveredEndpoints[endpoint] = result;

            if (result.status === 'passed') {
                console.log(`✅ ${endpoint} - ${result.statusCode}`);
                if (result.data) {
                    console.log(`   Data structure: ${typeof result.data} - ${Array.isArray(result.data) ? result.data.length : 'object'}`);
                }
            } else {
                console.log(`❌ ${endpoint} - ${result.error}`);
            }
        }
    }

    async testModuleEndpoints() {
        console.log('\n📦 3. TESTING MODULE ENDPOINTS');
        console.log('-------------------------------');

        const modules = [
            'business-case',
            'business-contract',
            'invoice',
            'todo',
            'event',
            'note',
            'products',
            'contacts',
            'users',
            'teams',
            'projects',
            'tasks',
            'customers',
            'clients'
        ];

        for (const module of modules) {
            const endpoints = [
                `/api/${module}`,
                `/api/${module}s`,
                `/${module}`,
                `/${module}s`
            ];

            for (const endpoint of endpoints) {
                const result = await this.testAuthenticatedEndpoint(endpoint);
                const key = `${module}:${endpoint}`;
                this.results.discoveredEndpoints[key] = result;

                if (result.status === 'passed') {
                    console.log(`✅ ${endpoint} - ${result.statusCode}`);
                    this.results.workingEndpoints[module] = {
                        endpoint: endpoint,
                        statusCode: result.statusCode,
                        data: result.data
                    };
                }
            }
        }
    }

    async analyzeWorkingEndpoints() {
        console.log('\n📊 4. ANALYZING WORKING ENDPOINTS');
        console.log('----------------------------------');

        const working = Object.entries(this.results.discoveredEndpoints)
            .filter(([key, result]) => result.status === 'passed');

        console.log(`Found ${working.length} working endpoints:`);

        for (const [endpoint, result] of working) {
            console.log(`  ✅ ${endpoint} (${result.statusCode})`);

            if (result.data) {
                this.analyzeDataStructure(endpoint, result.data);
            }
        }
    }

    analyzeDataStructure(endpoint, data) {
        if (Array.isArray(data)) {
            this.results.dataStructures[endpoint] = {
                type: 'array',
                length: data.length,
                sample: data.length > 0 ? data[0] : null
            };
            console.log(`    📊 Array with ${data.length} items`);
        } else if (typeof data === 'object') {
            this.results.dataStructures[endpoint] = {
                type: 'object',
                keys: Object.keys(data),
                sample: data
            };
            console.log(`    📊 Object with keys: ${Object.keys(data).join(', ')}`);
        }
    }

    async generateRecommendations() {
        console.log('\n💡 5. GENERATING RECOMMENDATIONS');
        console.log('--------------------------------');

        const recommendations = {
            workingModules: Object.keys(this.results.workingEndpoints),
            apiBaseUrl: `${this.config.platform}/api`,
            authentication: 'Bearer Token',
            dataEndpoints: {},
            contactAlternatives: []
        };

        // Find contact alternatives
        const contactAlternatives = Object.entries(this.results.discoveredEndpoints)
            .filter(([key, result]) =>
                result.status === 'passed' &&
                (key.includes('user') || key.includes('customer') || key.includes('client'))
            );

        recommendations.contactAlternatives = contactAlternatives.map(([key, result]) => ({
            endpoint: key,
            statusCode: result.statusCode,
            dataType: Array.isArray(result.data) ? 'array' : 'object'
        }));

        // Map working endpoints to data types
        for (const [module, info] of Object.entries(this.results.workingEndpoints)) {
            recommendations.dataEndpoints[module] = {
                endpoint: info.endpoint,
                statusCode: info.statusCode,
                dataType: Array.isArray(info.data) ? 'array' : 'object'
            };
        }

        this.results.recommendations = recommendations;

        console.log('✅ Working modules:', recommendations.workingModules.join(', '));
        console.log('✅ Contact alternatives:', recommendations.contactAlternatives.length);
        console.log('✅ API base URL:', recommendations.apiBaseUrl);
    }

    async testEndpoint(endpoint) {
        try {
            const url = `${this.config.platform}${endpoint}`;
            const response = await axios({
                method: 'GET',
                url,
                headers: this.config.headers,
                timeout: 10000
            });

            return {
                status: 'passed',
                statusCode: response.status,
                endpoint: endpoint,
                data: response.data
            };
        } catch (error) {
            return {
                status: 'failed',
                error: error.message,
                statusCode: error.response?.status,
                endpoint: endpoint
            };
        }
    }

    async testAuthenticatedEndpoint(endpoint) {
        try {
            const url = `${this.config.platform}${endpoint}`;
            const response = await axios({
                method: 'GET',
                url,
                headers: this.config.headers,
                timeout: 10000
            });

            return {
                status: 'passed',
                statusCode: response.status,
                endpoint: endpoint,
                data: response.data
            };
        } catch (error) {
            return {
                status: 'failed',
                error: error.message,
                statusCode: error.response?.status,
                endpoint: endpoint
            };
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-discovery';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-api-discovery-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`📁 Discovery results saved to: ${resultsDir}/${filename}`);
    }
}

// ===== CLI INTERFACE =====

async function main() {
    const discovery = new BoostSpaceAPIDiscovery();

    try {
        await discovery.discoverAPI();
    } catch (error) {
        console.error('❌ API discovery failed:', error.message);
        process.exit(1);
    }
}

// Execute main function
main().catch(console.error);
