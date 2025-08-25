#!/usr/bin/env node

const axios = require('axios');

class BoostSpaceAPIDebug {
    constructor() {
        this.boostSpaceConfig = {
            platform: 'https://superseller.boost.space',
            apiKey: 'BOOST_SPACE_KEY_REDACTED',
            mcpServer: 'http://173.254.201.134:3001'
        };
    }

    async debugAPI() {
        console.log('🔍 BOOST.SPACE API DEBUG\n');

        try {
            await this.testDirectAPI();
            await this.testMCPServer();
            await this.analyzeIssues();
            await this.generateSolutions();
        } catch (error) {
            console.error('❌ Debug failed:', error);
        }
    }

    async testDirectAPI() {
        console.log('🌐 TESTING DIRECT BOOST.SPACE API');

        const testEndpoints = [
            '/api/contacts',
            '/api/business-case',
            '/api/invoice',
            '/api/business-contract',
            '/api/todo',
            '/api/products',
            '/api/event'
        ];

        for (const endpoint of testEndpoints) {
            try {
                const response = await axios.get(`${this.boostSpaceConfig.platform}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${this.boostSpaceConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                console.log(`✅ ${endpoint}: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.response?.status || error.code} - ${error.message}`);
            }
        }
    }

    async testMCPServer() {
        console.log('\n🔧 TESTING MCP SERVER');

        const testModules = ['contacts', 'business-case', 'invoice', 'business-contract', 'todo', 'products', 'event'];

        for (const module of testModules) {
            try {
                const response = await axios.post(`${this.boostSpaceConfig.mcpServer}/api/query`, {
                    module: module,
                    query: 'test'
                });

                console.log(`✅ ${module}: ${response.data.success ? 'Success' : 'Failed'}`);
                if (response.data.note) {
                    console.log(`   Note: ${response.data.note}`);
                }
            } catch (error) {
                console.log(`❌ ${module}: ${error.message}`);
            }
        }
    }

    async analyzeIssues() {
        console.log('\n🔍 ISSUE ANALYSIS');

        console.log('1. Boost.space API Issues:');
        console.log('   - 404 errors indicate incorrect endpoint URLs');
        console.log('   - May need different API structure');
        console.log('   - Authentication method may be incorrect');

        console.log('\n2. MCP Server Issues:');
        console.log('   - Working but using mock data');
        console.log('   - No real Boost.space connection');
        console.log('   - API calls falling back to mock data');

        console.log('\n3. Module Coverage:');
        console.log('   - Only 7 modules configured');
        console.log('   - Missing 40 modules from 47 total');
        console.log('   - Need complete module mapping');
    }

    async generateSolutions() {
        console.log('\n🚀 SOLUTION RECOMMENDATIONS');

        console.log('1. IMMEDIATE (Continue Development):');
        console.log('   ✅ Use MCP server with mock data for Phase 1 testing');
        console.log('   ✅ All features can be developed and tested');
        console.log('   ✅ No blocking issues for implementation');

        console.log('\n2. SHORT-TERM (Fix API):');
        console.log('   🔧 Research correct Boost.space API endpoints');
        console.log('   🔧 Verify API key and authentication method');
        console.log('   🔧 Test with Boost.space documentation');

        console.log('\n3. MEDIUM-TERM (Full Integration):');
        console.log('   📦 Configure all 47 modules');
        console.log('   📦 Populate real business data');
        console.log('   📦 Replace mock data with real data');

        console.log('\n🎯 RECOMMENDED ACTION:');
        console.log('   Continue with Phase 1 testing using mock data');
        console.log('   Debug Boost.space API in parallel');
        console.log('   Switch to real data when API is fixed');
    }
}

// Run the debug
const debug = new BoostSpaceAPIDebug();
debug.debugAPI();
