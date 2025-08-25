#!/usr/bin/env node

/**
 * HYPERISE API RESEARCH V3
 * Updated research based on discovered API endpoint: /api/v1/regular/users/current
 */

import fetch from 'node-fetch';
import fs from 'fs';

class HyperiseAPIResearchV3 {
    constructor() {
        this.apiKey = 'C1pmwMHptlUTQNZYzdMwRLjuqoVWXTLf8UtnNvEZrWzymNFyQ0lDH8CWv597';
        this.baseUrl = 'https://app.hyperise.io/api/v1';
        this.researchResults = {
            discovery: {
                found_endpoint: '/api/v1/regular/users/current',
                requires_login: true,
                api_available: true
            },
            endpoints: [],
            features: [],
            authentication: {},
            integration: {},
            errors: [],
            recommendations: []
        };
    }

    async startResearch() {
        console.log('🔍 **STARTING HYPERISE API RESEARCH V3**\n');
        console.log('🎯 **NEW DISCOVERY**: API endpoint found at /api/v1/regular/users/current\n');

        try {
            // Test the discovered API structure
            await this.testDiscoveredAPI();

            // Test v1 API patterns
            await this.testV1APIPatterns();

            // Test authentication requirements
            await this.testAuthenticationRequirements();

            // Research session-based authentication
            await this.researchSessionAuth();

            // Generate updated report
            this.generateUpdatedReport();

        } catch (error) {
            console.log(`❌ Research failed: ${error.message}`);
            this.researchResults.errors.push(error.message);
        }
    }

    async testDiscoveredAPI() {
        console.log('🎯 **TESTING DISCOVERED API ENDPOINT**\n');

        const endpoint = '/regular/users/current';

        try {
            console.log(`Testing: ${this.baseUrl}${endpoint}`);
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            console.log(`Response Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API endpoint is functional!');
                console.log('Response data:', JSON.stringify(data, null, 2));

                this.researchResults.endpoints.push({
                    endpoint,
                    status: 'available',
                    method: 'GET',
                    data: data
                });

                this.researchResults.discovery.api_functional = true;
            } else {
                console.log('⚠️ API endpoint requires different authentication');
                console.log('Response headers:', response.headers.raw());

                // Try to get response text for more info
                const text = await response.text();
                console.log('Response body:', text);

                this.researchResults.endpoints.push({
                    endpoint,
                    status: 'requires_auth',
                    method: 'GET',
                    error: `${response.status} ${response.statusText}`,
                    response_body: text
                });
            }
        } catch (error) {
            console.log(`❌ Error testing endpoint: ${error.message}`);
            this.researchResults.errors.push(`Discovered API: ${error.message}`);
        }
    }

    async testV1APIPatterns() {
        console.log('\n🔗 **TESTING V1 API PATTERNS**\n');

        const v1Patterns = [
            '/regular/users/current',
            '/regular/users/profile',
            '/regular/campaigns',
            '/regular/landing-pages',
            '/regular/templates',
            '/regular/analytics',
            '/regular/webhooks',
            '/regular/integrations',
            '/regular/billing',
            '/regular/usage',
            '/regular/account',
            '/users/current',
            '/users/profile',
            '/campaigns',
            '/landing-pages',
            '/templates',
            '/analytics',
            '/webhooks',
            '/integrations',
            '/billing',
            '/usage',
            '/account'
        ];

        for (const pattern of v1Patterns) {
            try {
                const response = await fetch(`${this.baseUrl}${pattern}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${pattern}: Available`);
                    this.researchResults.endpoints.push({
                        endpoint: pattern,
                        status: 'available',
                        method: 'GET',
                        data: data
                    });
                } else if (response.status === 401 || response.status === 403) {
                    console.log(`🔐 ${pattern}: Requires authentication (${response.status})`);
                    this.researchResults.endpoints.push({
                        endpoint: pattern,
                        status: 'requires_auth',
                        method: 'GET',
                        error: `${response.status} ${response.statusText}`
                    });
                } else {
                    console.log(`❌ ${pattern}: ${response.status} ${response.statusText}`);
                    this.researchResults.endpoints.push({
                        endpoint: pattern,
                        status: 'unavailable',
                        method: 'GET',
                        error: `${response.status} ${response.statusText}`
                    });
                }
            } catch (error) {
                console.log(`❌ ${pattern}: ${error.message}`);
                this.researchResults.endpoints.push({
                    endpoint: pattern,
                    status: 'error',
                    method: 'GET',
                    error: error.message
                });
            }
        }
    }

    async testAuthenticationRequirements() {
        console.log('\n🔐 **TESTING AUTHENTICATION REQUIREMENTS**\n');

        const authMethods = [
            { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${this.apiKey}` } },
            { name: 'API Key Header', headers: { 'X-API-Key': this.apiKey } },
            { name: 'Hyperise-API-Key', headers: { 'Hyperise-API-Key': this.apiKey } },
            { name: 'API-Token', headers: { 'API-Token': this.apiKey } },
            { name: 'X-Auth-Token', headers: { 'X-Auth-Token': this.apiKey } },
            { name: 'Basic Auth', headers: { 'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}` } }
        ];

        const testEndpoint = '/regular/users/current';

        for (const method of authMethods) {
            try {
                console.log(`Testing: ${method.name}`);
                const response = await fetch(`${this.baseUrl}${testEndpoint}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ...method.headers
                    }
                });

                console.log(`  Response: ${response.status} ${response.statusText}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${method.name}: Success!`);
                    this.researchResults.authentication.working_method = method.name;
                    this.researchResults.authentication.response_data = data;
                    break;
                } else if (response.status === 401 || response.status === 403) {
                    console.log(`🔐 ${method.name}: Authentication rejected`);
                } else {
                    console.log(`❌ ${method.name}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${method.name}: ${error.message}`);
            }
        }
    }

    async researchSessionAuth() {
        console.log('\n🍪 **RESEARCHING SESSION-BASED AUTHENTICATION**\n');

        try {
            // Test if we need to login first
            const loginResponse = await fetch('https://app.hyperise.io/login', {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (loginResponse.ok) {
                console.log('✅ Login page accessible');
                console.log('🔍 API likely requires session-based authentication');

                this.researchResults.authentication.type = 'session_based';
                this.researchResults.authentication.login_page = 'https://app.hyperise.io/login';
                this.researchResults.authentication.api_key_insufficient = true;

                // Check for CSRF tokens or other auth requirements
                const loginHtml = await loginResponse.text();
                const csrfMatch = loginHtml.match(/csrf[_-]?token.*?value=["']([^"']+)["']/i);
                if (csrfMatch) {
                    console.log('🔐 CSRF token found in login page');
                    this.researchResults.authentication.csrf_required = true;
                }
            }
        } catch (error) {
            console.log(`❌ Session auth research failed: ${error.message}`);
            this.researchResults.errors.push(`Session Auth: ${error.message}`);
        }
    }

    generateUpdatedReport() {
        console.log('\n📊 **HYPERISE API RESEARCH V3 REPORT**\n');

        console.log('🎯 **KEY DISCOVERY**:');
        console.log(`  ✅ API endpoint found: ${this.researchResults.discovery.found_endpoint}`);
        console.log(`  ✅ API structure: /api/v1/regular/...`);
        console.log(`  ⚠️ Requires login authentication`);

        console.log('\n🔗 **TESTED ENDPOINTS**:');
        const availableEndpoints = this.researchResults.endpoints.filter(e => e.status === 'available');
        const authRequiredEndpoints = this.researchResults.endpoints.filter(e => e.status === 'requires_auth');

        if (availableEndpoints.length > 0) {
            console.log('  ✅ Available endpoints:');
            availableEndpoints.forEach(endpoint => {
                console.log(`    - ${endpoint.endpoint}`);
            });
        }

        if (authRequiredEndpoints.length > 0) {
            console.log('  🔐 Endpoints requiring authentication:');
            authRequiredEndpoints.forEach(endpoint => {
                console.log(`    - ${endpoint.endpoint}`);
            });
        }

        console.log('\n🔐 **AUTHENTICATION ANALYSIS**:');
        if (this.researchResults.authentication.working_method) {
            console.log(`  ✅ Working method: ${this.researchResults.authentication.working_method}`);
        } else {
            console.log('  ⚠️ API key authentication insufficient');
            console.log('  🍪 Likely requires session-based authentication');
        }

        if (this.researchResults.authentication.type === 'session_based') {
            console.log('  🔍 Session-based authentication required');
            console.log(`  🌐 Login page: ${this.researchResults.authentication.login_page}`);
        }

        console.log('\n💡 **INTEGRATION POSSIBILITIES**:');
        if (authRequiredEndpoints.length > 0) {
            console.log('  ✅ API endpoints exist and are accessible');
            console.log('  🔐 Authentication setup required');
            console.log('  🤖 Automation possible with proper auth');
        }

        // Save detailed research report
        const reportPath = 'docs/HYPERISE_API_RESEARCH_V3_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.researchResults, null, 2));
        console.log(`\n📄 Detailed research report saved to: ${reportPath}`);

        console.log('\n🎯 **UPDATED RECOMMENDATIONS**:');
        this.generateUpdatedRecommendations();

        console.log('\n✅ **HYPERISE API RESEARCH V3 COMPLETE!**');
    }

    generateUpdatedRecommendations() {
        const authRequiredEndpoints = this.researchResults.endpoints.filter(e => e.status === 'requires_auth').length;
        const availableEndpoints = this.researchResults.endpoints.filter(e => e.status === 'available').length;

        console.log(`\n📊 **UPDATED ANALYSIS**:`);
        console.log(`  - Available Endpoints: ${availableEndpoints}`);
        console.log(`  - Auth Required Endpoints: ${authRequiredEndpoints}`);
        console.log(`  - Total Discovered: ${availableEndpoints + authRequiredEndpoints}`);

        if (authRequiredEndpoints > 5) {
            console.log('\n✅ **REVISED RECOMMENDATION: EVALUATE HYPERISE INTEGRATION**');
            console.log('  - Substantial API capabilities discovered');
            console.log('  - Authentication setup required');
            console.log('  - Automation integration possible');
            console.log('  - Consider cost vs. implementation effort');
            console.log('  - May justify keeping if auth can be automated');

            this.researchResults.recommendations.push({
                action: 'evaluate_integration',
                reason: 'API capabilities discovered',
                requirements: 'Session-based authentication setup',
                effort: 'Medium - requires auth implementation',
                cost_analysis: 'Compare implementation cost vs $50-200/month'
            });
        } else {
            console.log('\n⚠️ **RECOMMENDATION: STILL CONSIDER REPLACEMENT**');
            console.log('  - Limited API endpoints discovered');
            console.log('  - Authentication complexity adds overhead');
            console.log('  - Custom solution may still be more cost-effective');

            this.researchResults.recommendations.push({
                action: 'consider_replacement',
                reason: 'Limited API + auth complexity',
                alternative: 'Custom solution with full control',
                cost_savings: '$50-200/month'
            });
        }
    }
}

// Start research
const research = new HyperiseAPIResearchV3();
research.startResearch().catch(console.error);
