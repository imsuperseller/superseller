#!/usr/bin/env node

/**
 * HYPERISE API RESEARCH V2
 * Comprehensive exploration of Hyperise's API capabilities
 */

import fetch from 'node-fetch';
import fs from 'fs';

class HyperiseAPIResearchV2 {
    constructor() {
        this.apiKey = 'C1pmwMHptlUTQNZYzdMwRLjuqoVWXTLf8UtnNvEZrWzymNFyQ0lDH8CWv597';
        this.researchResults = {
            endpoints: [],
            features: [],
            pricing: {},
            limitations: [],
            integration: {},
            errors: [],
            recommendations: []
        };
    }

    async startResearch() {
        console.log('🔍 **STARTING HYPERISE API RESEARCH V2**\n');

        try {
            // Test different base URLs
            await this.testDifferentBaseUrls();

            // Test different authentication methods
            await this.testAuthenticationMethods();

            // Test common API patterns
            await this.testCommonAPIPatterns();

            // Research web interface capabilities
            await this.researchWebInterface();

            // Generate comprehensive report
            this.generateReport();

        } catch (error) {
            console.log(`❌ Research failed: ${error.message}`);
            this.researchResults.errors.push(error.message);
        }
    }

    async testDifferentBaseUrls() {
        console.log('🌐 **TESTING DIFFERENT BASE URLS**\n');

        const baseUrls = [
            'https://api.hyperise.io',
            'https://app.hyperise.io/api',
            'https://app.hyperise.io/api/v1',
            'https://hyperise.io/api',
            'https://api.hyperise.com',
            'https://app.hyperise.com/api'
        ];

        for (const baseUrl of baseUrls) {
            try {
                console.log(`Testing: ${baseUrl}`);
                const response = await fetch(`${baseUrl}/health`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    console.log(`✅ ${baseUrl}: Available`);
                    this.researchResults.integration.baseUrl = baseUrl;
                    break;
                } else {
                    console.log(`❌ ${baseUrl}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${baseUrl}: ${error.message}`);
            }
        }
    }

    async testAuthenticationMethods() {
        console.log('\n🔐 **TESTING AUTHENTICATION METHODS**\n');

        const authMethods = [
            { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${this.apiKey}` } },
            { name: 'API Key Header', headers: { 'X-API-Key': this.apiKey } },
            { name: 'API Key Query', url: `?api_key=${this.apiKey}`, headers: {} },
            { name: 'Basic Auth', headers: { 'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}` } }
        ];

        const testUrl = 'https://app.hyperise.io/api/account';

        for (const method of authMethods) {
            try {
                console.log(`Testing: ${method.name}`);
                const url = method.url ? `${testUrl}${method.url}` : testUrl;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...method.headers
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${method.name}: Success`);
                    this.researchResults.integration.authMethod = method.name;
                    this.researchResults.integration.accountData = data;
                    break;
                } else {
                    console.log(`❌ ${method.name}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${method.name}: ${error.message}`);
            }
        }
    }

    async testCommonAPIPatterns() {
        console.log('\n🔗 **TESTING COMMON API PATTERNS**\n');

        const patterns = [
            '/v1/account',
            '/v1/user',
            '/v1/campaigns',
            '/v1/landing-pages',
            '/v1/templates',
            '/v1/analytics',
            '/v1/webhooks',
            '/v1/integrations',
            '/v1/billing',
            '/v1/usage',
            '/account',
            '/user',
            '/campaigns',
            '/landing-pages',
            '/templates',
            '/analytics',
            '/webhooks',
            '/integrations',
            '/billing',
            '/usage'
        ];

        const baseUrl = 'https://app.hyperise.io/api';

        for (const pattern of patterns) {
            try {
                const response = await fetch(`${baseUrl}${pattern}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${pattern}: Available`);
                    this.researchResults.endpoints.push({
                        endpoint: pattern,
                        status: 'available',
                        data: data
                    });
                } else {
                    console.log(`❌ ${pattern}: ${response.status} ${response.statusText}`);
                    this.researchResults.endpoints.push({
                        endpoint: pattern,
                        status: 'unavailable',
                        error: `${response.status} ${response.statusText}`
                    });
                }
            } catch (error) {
                console.log(`❌ ${pattern}: ${error.message}`);
                this.researchResults.endpoints.push({
                    endpoint: pattern,
                    status: 'error',
                    error: error.message
                });
            }
        }
    }

    async researchWebInterface() {
        console.log('\n🌐 **RESEARCHING WEB INTERFACE CAPABILITIES**\n');

        try {
            // Test the main website
            const mainResponse = await fetch('https://app.hyperise.io/home', {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (mainResponse.ok) {
                const html = await mainResponse.text();
                console.log('✅ Main website accessible');

                // Extract information from HTML
                this.extractInfoFromHTML(html);
            } else {
                console.log('❌ Main website not accessible');
            }

            // Test documentation
            const docsResponse = await fetch('https://hyperise.io/docs', {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (docsResponse.ok) {
                console.log('✅ Documentation accessible');
                this.researchResults.integration.documentation = 'available';
            } else {
                console.log('❌ Documentation not accessible');
                this.researchResults.integration.documentation = 'unavailable';
            }

        } catch (error) {
            console.log(`❌ Web interface research failed: ${error.message}`);
            this.researchResults.errors.push(`Web Interface: ${error.message}`);
        }
    }

    extractInfoFromHTML(html) {
        // Extract pricing information
        const pricingMatches = html.match(/\$[\d,]+/g);
        if (pricingMatches) {
            this.researchResults.pricing.mentioned = pricingMatches;
            console.log('💰 Pricing mentioned:', pricingMatches);
        }

        // Extract feature mentions
        const featureKeywords = ['landing page', 'personalization', 'analytics', 'webhook', 'integration'];
        const foundFeatures = featureKeywords.filter(keyword =>
            html.toLowerCase().includes(keyword.toLowerCase())
        );

        if (foundFeatures.length > 0) {
            this.researchResults.features.push({
                feature: 'web_interface_features',
                status: 'available',
                data: foundFeatures
            });
            console.log('🎯 Features mentioned:', foundFeatures);
        }
    }

    generateReport() {
        console.log('\n📊 **HYPERISE API RESEARCH V2 REPORT**\n');

        console.log('🔗 **AVAILABLE ENDPOINTS**:');
        const availableEndpoints = this.researchResults.endpoints.filter(e => e.status === 'available');
        if (availableEndpoints.length > 0) {
            availableEndpoints.forEach(endpoint => {
                console.log(`  ✅ ${endpoint.endpoint}`);
            });
        } else {
            console.log('  ❌ No API endpoints available');
        }

        console.log('\n🎯 **AVAILABLE FEATURES**:');
        const availableFeatures = this.researchResults.features.filter(f => f.status === 'available');
        if (availableFeatures.length > 0) {
            availableFeatures.forEach(feature => {
                console.log(`  ✅ ${feature.feature}`);
            });
        } else {
            console.log('  ❌ No features available via API');
        }

        console.log('\n💰 **PRICING INFORMATION**:');
        if (this.researchResults.pricing.mentioned) {
            console.log('  💰 Pricing mentioned:', this.researchResults.pricing.mentioned);
        }

        console.log('\n🔌 **INTEGRATION STATUS**:');
        if (this.researchResults.integration.baseUrl) {
            console.log(`  ✅ Base URL: ${this.researchResults.integration.baseUrl}`);
        }
        if (this.researchResults.integration.authMethod) {
            console.log(`  ✅ Auth Method: ${this.researchResults.integration.authMethod}`);
        }
        if (this.researchResults.integration.documentation) {
            console.log(`  ✅ Documentation: ${this.researchResults.integration.documentation}`);
        }

        if (this.researchResults.errors.length > 0) {
            console.log('\n❌ **ERRORS ENCOUNTERED**:');
            this.researchResults.errors.forEach(error => {
                console.log(`  - ${error}`);
            });
        }

        // Save detailed research report
        const reportPath = 'docs/HYPERISE_API_RESEARCH_V2_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.researchResults, null, 2));
        console.log(`\n📄 Detailed research report saved to: ${reportPath}`);

        console.log('\n🎯 **FINAL RECOMMENDATIONS**:');
        this.generateFinalRecommendations();

        console.log('\n✅ **HYPERISE API RESEARCH V2 COMPLETE!**');
    }

    generateFinalRecommendations() {
        const availableEndpoints = this.researchResults.endpoints.filter(e => e.status === 'available').length;
        const availableFeatures = this.researchResults.features.filter(f => f.status === 'available').length;

        console.log(`\n📊 **RESEARCH SUMMARY**:`);
        console.log(`  - Available Endpoints: ${availableEndpoints}`);
        console.log(`  - Available Features: ${availableFeatures}`);
        console.log(`  - Authentication Method: ${this.researchResults.integration.authMethod || 'Unknown'}`);
        console.log(`  - Base URL: ${this.researchResults.integration.baseUrl || 'Unknown'}`);

        if (availableEndpoints === 0) {
            console.log('\n⚠️ **RECOMMENDATION: REPLACE HYPERISE**');
            console.log('  - No API endpoints available');
            console.log('  - Limited programmatic access');
            console.log('  - Custom solution would be more effective');
            console.log('  - Cost savings: $50-200/month');

            this.researchResults.recommendations.push({
                action: 'replace',
                reason: 'No API access available',
                cost_savings: '$50-200/month',
                implementation: 'Custom landing page solution'
            });
        } else {
            console.log('\n✅ **RECOMMENDATION: EVALUATE HYPERISE**');
            console.log('  - Some API capabilities available');
            console.log('  - Consider integration possibilities');
            console.log('  - Weigh cost vs. functionality');

            this.researchResults.recommendations.push({
                action: 'evaluate',
                reason: 'Limited API capabilities',
                cost_analysis: 'Compare with custom solution',
                implementation: 'Assess integration requirements'
            });
        }
    }
}

// Start research
const research = new HyperiseAPIResearchV2();
research.startResearch().catch(console.error);
