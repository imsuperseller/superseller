#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceRealSolution {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.systemKey = 'superseller';
        this.apiBaseUrl = `https://${this.systemKey}.boost.space/api`;
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            apiDiscovery: {},
            solution: {}
        };
    }

    async solveBoostSpaceIssues() {
        console.log('🔧 SOLVING BOOST.SPACE API ISSUES');
        console.log('==================================\n');

        try {
            // 1. Discover working API endpoints
            await this.discoverWorkingEndpoints();

            // 2. Test different authentication methods
            await this.testAuthenticationMethods();

            // 3. Check if modules need to be created first
            await this.checkModuleCreation();

            // 4. Test MCP server with correct approach
            await this.testMCPServerCorrectly();

            // 5. Generate solution recommendations
            await this.generateSolutionRecommendations();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n✅ BOOST.SPACE ISSUES ANALYZED AND SOLUTIONS PROVIDED!');

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async discoverWorkingEndpoints() {
        console.log('🔍 1. DISCOVERING WORKING API ENDPOINTS');
        console.log('=====================================');

        // Test known working endpoints
        const workingEndpoints = [
            '/settings',
            '/user'
        ];

        this.results.apiDiscovery.workingEndpoints = {};

        for (const endpoint of workingEndpoints) {
            try {
                const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });

                console.log(`✅ ${endpoint}: ${response.status} - Working`);
                this.results.apiDiscovery.workingEndpoints[endpoint] = {
                    status: 'working',
                    statusCode: response.status,
                    dataType: typeof response.data,
                    dataLength: Array.isArray(response.data) ? response.data.length : 'object'
                };

            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.response?.status || 'Failed'}`);
                this.results.apiDiscovery.workingEndpoints[endpoint] = {
                    status: 'failed',
                    error: error.message
                };
            }
        }
    }

    async testAuthenticationMethods() {
        console.log('\n🔐 2. TESTING DIFFERENT AUTHENTICATION METHODS');
        console.log('============================================');

        const authMethods = [
            {
                name: 'Bearer Token',
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            },
            {
                name: 'API Key Header',
                headers: { 'X-API-Key': this.apiKey }
            },
            {
                name: 'Token Header',
                headers: { 'Token': this.apiKey }
            },
            {
                name: 'Query Parameter',
                url: `${this.apiBaseUrl}/settings?token=${this.apiKey}`,
                headers: {}
            }
        ];

        this.results.apiDiscovery.authMethods = {};

        for (const method of authMethods) {
            try {
                const url = method.url || `${this.apiBaseUrl}/settings`;
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...method.headers
                    },
                    timeout: 10000
                });

                console.log(`✅ ${method.name}: ${response.status} - Working`);
                this.results.apiDiscovery.authMethods[method.name] = {
                    status: 'working',
                    statusCode: response.status
                };

            } catch (error) {
                console.log(`❌ ${method.name}: ${error.response?.status || 'Failed'}`);
                this.results.apiDiscovery.authMethods[method.name] = {
                    status: 'failed',
                    error: error.message
                };
            }
        }
    }

    async checkModuleCreation() {
        console.log('\n📦 3. CHECKING MODULE CREATION REQUIREMENTS');
        console.log('==========================================');

        // Test if we can create a custom data module
        const testModule = {
            name: 'test_contacts',
            fields: [
                { name: 'name', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'phone', type: 'text' }
            ]
        };

        try {
            // Try to create a custom data module
            const response = await axios.post(`${this.apiBaseUrl}/custom-data`, testModule, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Custom module creation: Working');
            this.results.apiDiscovery.moduleCreation = {
                status: 'working',
                statusCode: response.status
            };

        } catch (error) {
            console.log(`❌ Custom module creation: ${error.response?.status || 'Failed'}`);
            this.results.apiDiscovery.moduleCreation = {
                status: 'failed',
                error: error.message,
                statusCode: error.response?.status
            };
        }
    }

    async testMCPServerCorrectly() {
        console.log('\n🤖 4. TESTING MCP SERVER WITH CORRECT APPROACH');
        console.log('==============================================');

        // Test different MCP server URLs
        const mcpUrls = [
            `https://mcp.boost.space/v1/${this.systemKey}/sse`,
            `https://mcp.boost.space/v1/${this.systemKey}`,
            `https://mcp.boost.space/${this.systemKey}/sse`,
            `https://mcp.boost.space/${this.systemKey}`
        ];

        this.results.apiDiscovery.mcpServer = {};

        for (const url of mcpUrls) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Accept': 'text/event-stream',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 10000
                });

                console.log(`✅ MCP Server (${url}): ${response.status} - Working`);
                this.results.apiDiscovery.mcpServer[url] = {
                    status: 'working',
                    statusCode: response.status,
                    contentType: response.headers['content-type']
                };

            } catch (error) {
                console.log(`❌ MCP Server (${url}): ${error.response?.status || 'Failed'}`);
                this.results.apiDiscovery.mcpServer[url] = {
                    status: 'failed',
                    error: error.message,
                    statusCode: error.response?.status
                };
            }
        }
    }

    async generateSolutionRecommendations() {
        console.log('\n💡 5. GENERATING SOLUTION RECOMMENDATIONS');
        console.log('========================================');

        const workingEndpoints = Object.entries(this.results.apiDiscovery.workingEndpoints)
            .filter(([endpoint, result]) => result.status === 'working')
            .map(([endpoint]) => endpoint);

        const workingAuthMethods = Object.entries(this.results.apiDiscovery.authMethods)
            .filter(([method, result]) => result.status === 'working')
            .map(([method]) => method);

        const workingMCPUrls = Object.entries(this.results.apiDiscovery.mcpServer)
            .filter(([url, result]) => result.status === 'working')
            .map(([url]) => url);

        this.results.solution = {
            workingEndpoints,
            workingAuthMethods,
            workingMCPUrls,
            recommendations: []
        };

        console.log('\n📊 ANALYSIS RESULTS:');
        console.log(`✅ Working Endpoints: ${workingEndpoints.length}`);
        console.log(`✅ Working Auth Methods: ${workingAuthMethods.length}`);
        console.log(`✅ Working MCP URLs: ${workingMCPUrls.length}`);

        // Generate recommendations based on findings
        if (workingEndpoints.length > 0) {
            this.results.solution.recommendations.push({
                type: 'api_access',
                description: 'API is accessible via working endpoints',
                action: 'Use working endpoints for data operations',
                endpoints: workingEndpoints
            });
        }

        if (workingAuthMethods.length > 0) {
            this.results.solution.recommendations.push({
                type: 'authentication',
                description: 'Authentication methods are working',
                action: 'Use working authentication methods',
                methods: workingAuthMethods
            });
        }

        if (workingMCPUrls.length > 0) {
            this.results.solution.recommendations.push({
                type: 'mcp_server',
                description: 'MCP server is accessible',
                action: 'Use working MCP server URL for AI agent integration',
                urls: workingMCPUrls
            });
        }

        // Add specific recommendations
        this.results.solution.recommendations.push({
            type: 'web_interface',
            description: 'Use web interface for module creation',
            action: 'Create modules through Boost.space web interface first',
            steps: [
                '1. Access https://superseller.boost.space',
                '2. Create custom modules for your data',
                '3. Use API to populate the created modules'
            ]
        });

        this.results.solution.recommendations.push({
            type: 'data_population',
            description: 'Populate data after module creation',
            action: 'Use working API endpoints to populate data',
            steps: [
                '1. Create modules via web interface',
                '2. Use working endpoints to add data',
                '3. Verify data appears in web interface'
            ]
        });

        console.log('\n💡 RECOMMENDATIONS:');
        this.results.solution.recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.type.toUpperCase()}:`);
            console.log(`   ${rec.description}`);
            console.log(`   Action: ${rec.action}`);
            if (rec.steps) {
                rec.steps.forEach(step => console.log(`   ${step}`));
            }
        });
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-real-solution';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-real-solution-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Solution results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const solution = new BoostSpaceRealSolution();
    await solution.solveBoostSpaceIssues();
}

main().catch(console.error);
