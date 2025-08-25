#!/usr/bin/env node

/**
 * HYPERISE API RESEARCH
 * Programmatically explore Hyperise's API capabilities
 */

import fetch from 'node-fetch';
import fs from 'fs';

class HyperiseAPIResearch {
  constructor() {
    this.apiKey = 'C1pmwMHptlUTQNZYzdMwRLjuqoVWXTLf8UtnNvEZrWzymNFyQ0lDH8CWv597';
    this.baseUrl = 'https://app.hyperise.io/api';
    this.researchResults = {
      endpoints: [],
      features: [],
      pricing: {},
      limitations: [],
      integration: {},
      errors: []
    };
  }

  async startResearch() {
    console.log('🔍 **STARTING HYPERISE API RESEARCH**\n');

    try {
      // Test API connectivity
      await this.testAPIConnectivity();

      // Research available endpoints
      await this.researchEndpoints();

      // Research features and capabilities
      await this.researchFeatures();

      // Research pricing and limitations
      await this.researchPricing();

      // Research integration capabilities
      await this.researchIntegration();

      // Generate comprehensive report
      this.generateReport();

    } catch (error) {
      console.log(`❌ Research failed: ${error.message}`);
      this.researchResults.errors.push(error.message);
    }
  }

  async testAPIConnectivity() {
    console.log('🔌 **TESTING API CONNECTIVITY**\n');

    try {
      // Test basic API health
      const healthResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ API Health Check:', healthData);
        this.researchResults.integration.health = healthData;
      } else {
        console.log('⚠️ Health endpoint not available or requires different auth');
      }

      // Test account info
      const accountResponse = await fetch(`${this.baseUrl}/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        console.log('✅ Account Information:', accountData);
        this.researchResults.integration.account = accountData;
      } else {
        console.log('⚠️ Account endpoint not available');
      }

    } catch (error) {
      console.log(`❌ Connectivity test failed: ${error.message}`);
      this.researchResults.errors.push(`Connectivity: ${error.message}`);
    }
  }

  async researchEndpoints() {
    console.log('🔗 **RESEARCHING API ENDPOINTS**\n');

    const endpointsToTest = [
      '/campaigns',
      '/landing-pages',
      '/templates',
      '/analytics',
      '/webhooks',
      '/integrations',
      '/users',
      '/teams',
      '/billing',
      '/api-docs'
    ];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: Available`);
          this.researchResults.endpoints.push({
            endpoint,
            status: 'available',
            data: data
          });
        } else {
          console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
          this.researchResults.endpoints.push({
            endpoint,
            status: 'unavailable',
            error: `${response.status} ${response.statusText}`
          });
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
        this.researchResults.endpoints.push({
          endpoint,
          status: 'error',
          error: error.message
        });
      }
    }
  }

  async researchFeatures() {
    console.log('🎯 **RESEARCHING FEATURES**\n');

    try {
      // Test landing page creation
      const landingPageResponse = await fetch(`${this.baseUrl}/landing-pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Landing Page',
          template: 'basic',
          personalization: {
            enabled: true,
            rules: []
          }
        })
      });

      if (landingPageResponse.ok) {
        const landingPageData = await landingPageResponse.json();
        console.log('✅ Landing Page Creation:', landingPageData);
        this.researchResults.features.push({
          feature: 'landing_page_creation',
          status: 'available',
          data: landingPageData
        });
      } else {
        console.log('❌ Landing Page Creation:', landingPageResponse.statusText);
        this.researchResults.features.push({
          feature: 'landing_page_creation',
          status: 'unavailable',
          error: landingPageResponse.statusText
        });
      }

      // Test personalization features
      const personalizationResponse = await fetch(`${this.baseUrl}/personalization/rules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (personalizationResponse.ok) {
        const personalizationData = await personalizationResponse.json();
        console.log('✅ Personalization Rules:', personalizationData);
        this.researchResults.features.push({
          feature: 'personalization_rules',
          status: 'available',
          data: personalizationData
        });
      } else {
        console.log('❌ Personalization Rules:', personalizationResponse.statusText);
        this.researchResults.features.push({
          feature: 'personalization_rules',
          status: 'unavailable',
          error: personalizationResponse.statusText
        });
      }

    } catch (error) {
      console.log(`❌ Features research failed: ${error.message}`);
      this.researchResults.errors.push(`Features: ${error.message}`);
    }
  }

  async researchPricing() {
    console.log('💰 **RESEARCHING PRICING & LIMITATIONS**\n');

    try {
      // Test usage limits
      const usageResponse = await fetch(`${this.baseUrl}/usage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        console.log('✅ Usage Information:', usageData);
        this.researchResults.pricing.usage = usageData;
      } else {
        console.log('❌ Usage Information:', usageResponse.statusText);
        this.researchResults.pricing.usage = { error: usageResponse.statusText };
      }

      // Test billing information
      const billingResponse = await fetch(`${this.baseUrl}/billing`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        console.log('✅ Billing Information:', billingData);
        this.researchResults.pricing.billing = billingData;
      } else {
        console.log('❌ Billing Information:', billingResponse.statusText);
        this.researchResults.pricing.billing = { error: billingResponse.statusText };
      }

    } catch (error) {
      console.log(`❌ Pricing research failed: ${error.message}`);
      this.researchResults.errors.push(`Pricing: ${error.message}`);
    }
  }

  async researchIntegration() {
    console.log('🔌 **RESEARCHING INTEGRATION CAPABILITIES**\n');

    try {
      // Test webhook creation
      const webhookResponse = await fetch(`${this.baseUrl}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://webhook.site/test',
          events: ['page_view', 'conversion'],
          name: 'Test Webhook'
        })
      });

      if (webhookResponse.ok) {
        const webhookData = await webhookResponse.json();
        console.log('✅ Webhook Creation:', webhookData);
        this.researchResults.integration.webhooks = webhookData;
      } else {
        console.log('❌ Webhook Creation:', webhookResponse.statusText);
        this.researchResults.integration.webhooks = { error: webhookResponse.statusText };
      }

      // Test third-party integrations
      const integrationsResponse = await fetch(`${this.baseUrl}/integrations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json();
        console.log('✅ Available Integrations:', integrationsData);
        this.researchResults.integration.available = integrationsData;
      } else {
        console.log('❌ Available Integrations:', integrationsResponse.statusText);
        this.researchResults.integration.available = { error: integrationsResponse.statusText };
      }

    } catch (error) {
      console.log(`❌ Integration research failed: ${error.message}`);
      this.researchResults.errors.push(`Integration: ${error.message}`);
    }
  }

  generateReport() {
    console.log('📊 **HYPERISE API RESEARCH REPORT**\n');

    console.log('🔗 **AVAILABLE ENDPOINTS**:');
    const availableEndpoints = this.researchResults.endpoints.filter(e => e.status === 'available');
    availableEndpoints.forEach(endpoint => {
      console.log(`  ✅ ${endpoint.endpoint}`);
    });

    console.log('\n🎯 **AVAILABLE FEATURES**:');
    const availableFeatures = this.researchResults.features.filter(f => f.status === 'available');
    availableFeatures.forEach(feature => {
      console.log(`  ✅ ${feature.feature}`);
    });

    console.log('\n💰 **PRICING & USAGE**:');
    if (this.researchResults.pricing.usage && !this.researchResults.pricing.usage.error) {
      console.log('  ✅ Usage tracking available');
    }
    if (this.researchResults.pricing.billing && !this.researchResults.pricing.billing.error) {
      console.log('  ✅ Billing information available');
    }

    console.log('\n🔌 **INTEGRATION CAPABILITIES**:');
    if (this.researchResults.integration.webhooks && !this.researchResults.integration.webhooks.error) {
      console.log('  ✅ Webhook creation available');
    }
    if (this.researchResults.integration.available && !this.researchResults.integration.available.error) {
      console.log('  ✅ Third-party integrations available');
    }

    if (this.researchResults.errors.length > 0) {
      console.log('\n❌ **ERRORS ENCOUNTERED**:');
      this.researchResults.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    // Save detailed research report
    const reportPath = 'docs/HYPERISE_API_RESEARCH_REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.researchResults, null, 2));
    console.log(`\n📄 Detailed research report saved to: ${reportPath}`);

    console.log('\n🎯 **RECOMMENDATIONS**:');
    this.generateRecommendations();

    console.log('\n✅ **HYPERISE API RESEARCH COMPLETE!**');
  }

  generateRecommendations() {
    const availableEndpoints = this.researchResults.endpoints.filter(e => e.status === 'available').length;
    const availableFeatures = this.researchResults.features.filter(f => f.status === 'available').length;

    console.log(`\n📊 **API CAPABILITIES SUMMARY**:`);
    console.log(`  - Available Endpoints: ${availableEndpoints}/${this.researchResults.endpoints.length}`);
    console.log(`  - Available Features: ${availableFeatures}/${this.researchResults.features.length}`);

    if (availableEndpoints > 5 && availableFeatures > 2) {
      console.log('\n✅ **RECOMMENDATION: KEEP HYPERISE**');
      console.log('  - Rich API capabilities available');
      console.log('  - Good integration possibilities');
      console.log('  - Consider enhancing automation integration');
    } else {
      console.log('\n⚠️ **RECOMMENDATION: REPLACE HYPERISE**');
      console.log('  - Limited API capabilities');
      console.log('  - Poor integration options');
      console.log('  - Custom solution would be more effective');
    }
  }
}

// Start research
const research = new HyperiseAPIResearch();
research.startResearch().catch(console.error);
