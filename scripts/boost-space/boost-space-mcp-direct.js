#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceMCPDirect {
    constructor() {
        this.mcpServerUrl = 'https://mcp.boost.space/v1/superseller/sse';
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.platform = 'https://superseller.boost.space';
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            mcpConnection: {},
            dataPopulation: {}
        };
    }

    async connectToMCPServer() {
        console.log('🔗 CONNECTING TO BOOST.SPACE MCP SERVER DIRECTLY');
        console.log('================================================\n');

        try {
            // Test MCP server connection
            const response = await axios.get(this.mcpServerUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                },
                timeout: 10000
            });

            console.log('✅ MCP Server: Connected successfully');
            console.log('📊 Response Status:', response.status);
            console.log('📊 Response Headers:', Object.keys(response.headers));

            this.results.mcpConnection = {
                status: 'connected',
                responseStatus: response.status,
                headers: Object.keys(response.headers),
                serverUrl: this.mcpServerUrl
            };

            return true;

        } catch (error) {
            console.log('❌ MCP Server: Connection failed');
            console.log('📊 Error Details:', error.message);
            
            if (error.response) {
                console.log('📊 Response Status:', error.response.status);
                console.log('📊 Response Data:', error.response.data);
            }

            this.results.mcpConnection = {
                status: 'failed',
                error: error.message,
                responseStatus: error.response?.status,
                responseData: error.response?.data
            };

            return false;
        }
    }

    async testBoostSpaceAPI() {
        console.log('\n🔍 TESTING BOOST.SPACE API ENDPOINTS');
        console.log('====================================');

        const endpoints = [
            '/api/contacts',
            '/api/business-case',
            '/api/invoice',
            '/api/todo',
            '/api/event',
            '/api/user',
            '/api/settings'
        ];

        this.results.apiTests = {};

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${this.platform}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                console.log(`✅ ${endpoint}: ${response.status}`);
                this.results.apiTests[endpoint] = {
                    status: 'success',
                    statusCode: response.status,
                    contentType: response.headers['content-type']
                };

            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.response?.status || 'Connection failed'}`);
                this.results.apiTests[endpoint] = {
                    status: 'failed',
                    statusCode: error.response?.status,
                    error: error.message
                };
            }
        }
    }

    async testBoostSpaceWebInterface() {
        console.log('\n🌐 TESTING BOOST.SPACE WEB INTERFACE');
        console.log('====================================');

        try {
            const response = await axios.get(this.platform, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Accept': 'text/html'
                },
                timeout: 10000
            });

            console.log('✅ Web Interface: Accessible');
            console.log('📊 Status Code:', response.status);
            console.log('📊 Content Type:', response.headers['content-type']);
            console.log('📊 Content Length:', response.data.length);

            this.results.webInterface = {
                status: 'accessible',
                statusCode: response.status,
                contentType: response.headers['content-type'],
                contentLength: response.data.length
            };

        } catch (error) {
            console.log('❌ Web Interface: Access failed');
            console.log('📊 Error:', error.message);

            this.results.webInterface = {
                status: 'failed',
                error: error.message
            };
        }
    }

    async testBoostSpaceModules() {
        console.log('\n📦 TESTING BOOST.SPACE MODULES');
        console.log('==============================');

        const modules = [
            'contacts',
            'business-case',
            'business-contract',
            'invoice',
            'todo',
            'event',
            'note',
            'products'
        ];

        this.results.moduleTests = {};

        for (const module of modules) {
            try {
                // Test both with and without /api prefix
                const endpoints = [
                    `/api/${module}`,
                    `/${module}`,
                    `/api/v1/${module}`,
                    `/v1/${module}`
                ];

                let success = false;
                let workingEndpoint = null;

                for (const endpoint of endpoints) {
                    try {
                        const response = await axios.get(`${this.platform}${endpoint}`, {
                            headers: {
                                'Authorization': `Bearer ${this.apiKey}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 5000
                        });

                        if (response.status === 200) {
                            success = true;
                            workingEndpoint = endpoint;
                            break;
                        }
                    } catch (error) {
                        // Continue to next endpoint
                    }
                }

                if (success) {
                    console.log(`✅ ${module}: Working (${workingEndpoint})`);
                    this.results.moduleTests[module] = {
                        status: 'working',
                        endpoint: workingEndpoint
                    };
                } else {
                    console.log(`❌ ${module}: Not accessible`);
                    this.results.moduleTests[module] = {
                        status: 'not_accessible'
                    };
                }

            } catch (error) {
                console.log(`❌ ${module}: Test failed`);
                this.results.moduleTests[module] = {
                    status: 'test_failed',
                    error: error.message
                };
            }
        }
    }

    async generateRecommendations() {
        console.log('\n💡 RECOMMENDATIONS FOR BOOST.SPACE POPULATION');
        console.log('==============================================');

        const workingModules = Object.entries(this.results.moduleTests || {})
            .filter(([module, test]) => test.status === 'working')
            .map(([module, test]) => ({ module, endpoint: test.endpoint }));

        if (workingModules.length > 0) {
            console.log('✅ Working modules found:');
            workingModules.forEach(({ module, endpoint }) => {
                console.log(`   - ${module}: ${endpoint}`);
            });

            console.log('\n🚀 Next Steps:');
            console.log('1. Use the working endpoints to populate data');
            console.log('2. Access Boost.space web interface directly');
            console.log('3. Use Boost.space MCP server for automation');
            console.log('4. Configure n8n workflows for data synchronization');

        } else {
            console.log('❌ No working API endpoints found');
            console.log('\n🔧 Alternative Approaches:');
            console.log('1. Access Boost.space web interface directly');
            console.log('2. Use Boost.space MCP server for data operations');
            console.log('3. Configure Boost.space through the web dashboard');
            console.log('4. Contact Boost.space support for API access');
        }

        this.results.recommendations = {
            workingModules,
            totalWorking: workingModules.length,
            suggestions: workingModules.length > 0 ? 'Use working endpoints' : 'Use web interface'
        };
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-mcp-analysis';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-mcp-analysis-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`\n📁 Analysis results saved to: ${resultsDir}/${filename}`);
    }

    async execute() {
        try {
            // 1. Test MCP server connection
            await this.connectToMCPServer();

            // 2. Test Boost.space API endpoints
            await this.testBoostSpaceAPI();

            // 3. Test web interface
            await this.testBoostSpaceWebInterface();

            // 4. Test individual modules
            await this.testBoostSpaceModules();

            // 5. Generate recommendations
            await this.generateRecommendations();

            // 6. Save results
            await this.saveResults();

            this.results.status = 'completed';
            console.log('\n🎉 BOOST.SPACE MCP ANALYSIS COMPLETED!');

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }
}

async function main() {
    const mcpAnalysis = new BoostSpaceMCPDirect();
    await mcpAnalysis.execute();
}

main().catch(console.error);
