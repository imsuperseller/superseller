#!/usr/bin/env node

/**
 * HYPERISE DATA EXTRACTION
 * Extract all accessible data from working API endpoint before migration
 */

import fetch from 'node-fetch';
import fs from 'fs';

class HyperiseDataExtractor {
    constructor() {
        this.apiKey = 'C1pmwMHptlUTQNZYzdMwRLjuqoVWXTLf8UtnNvEZrWzymNFyQ0lDH8CWv597';
        this.baseUrl = 'https://app.hyperise.io/api/v1';
        this.extractedData = {
            timestamp: new Date().toISOString(),
            user_account: {},
            account_settings: {},
            usage_data: {},
            templates: {},
            campaigns: {},
            analytics: {},
            billing: {},
            errors: [],
            summary: {}
        };
    }

    async extractAllData() {
        console.log('🔍 **STARTING HYPERISE DATA EXTRACTION**\n');
        console.log('📊 Extracting all accessible data before migration...\n');

        try {
            // Extract user account data
            await this.extractUserAccountData();

            // Extract account settings
            await this.extractAccountSettings();

            // Extract usage data
            await this.extractUsageData();

            // Extract templates
            await this.extractTemplates();

            // Extract campaigns
            await this.extractCampaigns();

            // Extract analytics
            await this.extractAnalytics();

            // Extract billing information
            await this.extractBillingData();

            // Generate summary
            this.generateSummary();

            // Save extracted data
            this.saveExtractedData();

        } catch (error) {
            console.log(`❌ Data extraction failed: ${error.message}`);
            this.extractedData.errors.push(error.message);
        }
    }

    async extractUserAccountData() {
        console.log('👤 **EXTRACTING USER ACCOUNT DATA**\n');

        try {
            const response = await fetch(`${this.baseUrl}/regular/users/current`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('✅ User account data extracted successfully');
                console.log('📋 User Details:');
                console.log(`  - ID: ${userData.id}`);
                console.log(`  - Name: ${userData.name}`);
                console.log(`  - Email: ${userData.email}`);
                console.log(`  - Created: ${userData.created_at}`);
                console.log(`  - App URL: ${userData.app_url}`);

                this.extractedData.user_account = userData;
            } else {
                console.log(`❌ Failed to extract user data: ${response.status} ${response.statusText}`);
                this.extractedData.errors.push(`User Account: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ User account extraction failed: ${error.message}`);
            this.extractedData.errors.push(`User Account: ${error.message}`);
        }
    }

    async extractAccountSettings() {
        console.log('\n⚙️ **EXTRACTING ACCOUNT SETTINGS**\n');

        const settingsEndpoints = [
            '/account',
            '/settings',
            '/profile',
            '/preferences',
            '/api-settings',
            '/integrations'
        ];

        for (const endpoint of settingsEndpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}: Settings extracted`);
                    this.extractedData.account_settings[endpoint] = data;
                } else {
                    console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }

    async extractUsageData() {
        console.log('\n📊 **EXTRACTING USAGE DATA**\n');

        const usageEndpoints = [
            '/usage',
            '/analytics/usage',
            '/billing/usage',
            '/limits',
            '/quota'
        ];

        for (const endpoint of usageEndpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}: Usage data extracted`);
                    this.extractedData.usage_data[endpoint] = data;
                } else {
                    console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }

    async extractTemplates() {
        console.log('\n🎨 **EXTRACTING TEMPLATES**\n');

        const templateEndpoints = [
            '/templates',
            '/image-templates',
            '/landing-page-templates',
            '/personalization-templates'
        ];

        for (const endpoint of templateEndpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}: Templates extracted`);
                    this.extractedData.templates[endpoint] = data;
                } else {
                    console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }

    async extractCampaigns() {
        console.log('\n📢 **EXTRACTING CAMPAIGNS**\n');

        const campaignEndpoints = [
            '/campaigns',
            '/marketing-campaigns',
            '/personalization-campaigns',
            '/active-campaigns'
        ];

        for (const endpoint of campaignEndpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}: Campaigns extracted`);
                    this.extractedData.campaigns[endpoint] = data;
                } else {
                    console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }

    async extractAnalytics() {
        console.log('\n📈 **EXTRACTING ANALYTICS**\n');

        const analyticsEndpoints = [
            '/analytics',
            '/analytics/overview',
            '/analytics/performance',
            '/analytics/campaigns',
            '/analytics/templates'
        ];

        for (const endpoint of analyticsEndpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}: Analytics extracted`);
                    this.extractedData.analytics[endpoint] = data;
                } else {
                    console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }

    async extractBillingData() {
        console.log('\n💰 **EXTRACTING BILLING DATA**\n');

        const billingEndpoints = [
            '/billing',
            '/billing/plan',
            '/billing/invoices',
            '/billing/subscription',
            '/billing/usage'
        ];

        for (const endpoint of billingEndpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}: Billing data extracted`);
                    this.extractedData.billing[endpoint] = data;
                } else {
                    console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    }

    generateSummary() {
        console.log('\n📋 **GENERATING EXTRACTION SUMMARY**\n');

        const summary = {
            extraction_timestamp: this.extractedData.timestamp,
            user_account_extracted: Object.keys(this.extractedData.user_account).length > 0,
            account_settings_extracted: Object.keys(this.extractedData.account_settings).length,
            usage_data_extracted: Object.keys(this.extractedData.usage_data).length,
            templates_extracted: Object.keys(this.extractedData.templates).length,
            campaigns_extracted: Object.keys(this.extractedData.campaigns).length,
            analytics_extracted: Object.keys(this.extractedData.analytics).length,
            billing_extracted: Object.keys(this.extractedData.billing).length,
            total_errors: this.extractedData.errors.length,
            migration_readiness: this.assessMigrationReadiness()
        };

        this.extractedData.summary = summary;

        console.log('📊 **EXTRACTION SUMMARY**:');
        console.log(`  ✅ User Account: ${summary.user_account_extracted ? 'Extracted' : 'Failed'}`);
        console.log(`  📋 Account Settings: ${summary.account_settings_extracted} endpoints`);
        console.log(`  📊 Usage Data: ${summary.usage_data_extracted} endpoints`);
        console.log(`  🎨 Templates: ${summary.templates_extracted} endpoints`);
        console.log(`  📢 Campaigns: ${summary.campaigns_extracted} endpoints`);
        console.log(`  📈 Analytics: ${summary.analytics_extracted} endpoints`);
        console.log(`  💰 Billing: ${summary.billing_extracted} endpoints`);
        console.log(`  ❌ Errors: ${summary.total_errors}`);
        console.log(`  🎯 Migration Readiness: ${summary.migration_readiness}`);
    }

    assessMigrationReadiness() {
        const hasUserData = Object.keys(this.extractedData.user_account).length > 0;
        const hasSettings = Object.keys(this.extractedData.account_settings).length > 0;
        const hasUsage = Object.keys(this.extractedData.usage_data).length > 0;
        const hasTemplates = Object.keys(this.extractedData.templates).length > 0;
        const hasCampaigns = Object.keys(this.extractedData.campaigns).length > 0;
        const hasAnalytics = Object.keys(this.extractedData.analytics).length > 0;
        const hasBilling = Object.keys(this.extractedData.billing).length > 0;

        const extractedDataPoints = [hasUserData, hasSettings, hasUsage, hasTemplates, hasCampaigns, hasAnalytics, hasBilling].filter(Boolean).length;

        if (extractedDataPoints >= 5) {
            return 'HIGH - Comprehensive data extracted';
        } else if (extractedDataPoints >= 3) {
            return 'MEDIUM - Partial data extracted';
        } else if (extractedDataPoints >= 1) {
            return 'LOW - Minimal data extracted';
        } else {
            return 'FAILED - No data extracted';
        }
    }

    saveExtractedData() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `docs/HYPERISE_EXTRACTED_DATA_${timestamp}.json`;

        fs.writeFileSync(filename, JSON.stringify(this.extractedData, null, 2));
        console.log(`\n💾 Extracted data saved to: ${filename}`);

        // Also save a summary file
        const summaryFilename = `docs/HYPERISE_EXTRACTION_SUMMARY_${timestamp}.md`;
        const summaryContent = this.generateMarkdownSummary();
        fs.writeFileSync(summaryFilename, summaryContent);
        console.log(`📄 Summary report saved to: ${summaryFilename}`);

        console.log('\n✅ **HYPERISE DATA EXTRACTION COMPLETE!**');
    }

    generateMarkdownSummary() {
        const summary = this.extractedData.summary;

        return `# HYPERISE DATA EXTRACTION SUMMARY

## 📊 **EXTRACTION OVERVIEW**

**Extraction Date**: ${summary.extraction_timestamp}  
**Migration Readiness**: ${summary.migration_readiness}  
**Total Errors**: ${summary.total_errors}

---

## **📋 EXTRACTED DATA SUMMARY**

### **✅ SUCCESSFUL EXTRACTIONS:**
- **User Account**: ${summary.user_account_extracted ? '✅ Extracted' : '❌ Failed'}
- **Account Settings**: ${summary.account_settings_extracted} endpoints
- **Usage Data**: ${summary.usage_data_extracted} endpoints
- **Templates**: ${summary.templates_extracted} endpoints
- **Campaigns**: ${summary.campaigns_extracted} endpoints
- **Analytics**: ${summary.analytics_extracted} endpoints
- **Billing**: ${summary.billing_extracted} endpoints

---

## **🎯 MIGRATION ASSESSMENT**

### **Data Availability:**
${this.generateDataAvailabilityTable()}

### **Migration Impact:**
${this.generateMigrationImpactAssessment()}

---

## **📄 NEXT STEPS**

Based on the extraction results, the following actions are recommended:

1. **Review extracted data** for migration planning
2. **Analyze user account information** for account setup
3. **Examine templates and campaigns** for feature replication
4. **Assess billing information** for cost analysis
5. **Plan custom solution development** based on extracted features

---

**📊 Total Data Points Extracted**: ${Object.values(summary).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0)}  
**🎯 Migration Readiness**: ${summary.migration_readiness}
`;
    }

    generateDataAvailabilityTable() {
        const data = this.extractedData;
        let table = '| Data Type | Status | Records | Notes |\n|-----------|--------|---------|-------|\n';

        table += `| User Account | ${Object.keys(data.user_account).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.user_account).length} | Account information for migration |\n`;
        table += `| Account Settings | ${Object.keys(data.account_settings).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.account_settings).length} | Configuration data |\n`;
        table += `| Usage Data | ${Object.keys(data.usage_data).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.usage_data).length} | Usage patterns and limits |\n`;
        table += `| Templates | ${Object.keys(data.templates).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.templates).length} | Landing page templates |\n`;
        table += `| Campaigns | ${Object.keys(data.campaigns).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.campaigns).length} | Marketing campaigns |\n`;
        table += `| Analytics | ${Object.keys(data.analytics).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.analytics).length} | Performance data |\n`;
        table += `| Billing | ${Object.keys(data.billing).length > 0 ? '✅ Available' : '❌ Not Available'} | ${Object.keys(data.billing).length} | Subscription and billing info |\n`;

        return table;
    }

    generateMigrationImpactAssessment() {
        const summary = this.extractedData.summary;

        if (summary.migration_readiness.includes('HIGH')) {
            return '**HIGH IMPACT**: Comprehensive data available for migration planning. Full feature replication possible.';
        } else if (summary.migration_readiness.includes('MEDIUM')) {
            return '**MEDIUM IMPACT**: Partial data available. Some features may need to be recreated from scratch.';
        } else if (summary.migration_readiness.includes('LOW')) {
            return '**LOW IMPACT**: Minimal data available. Most features will need to be rebuilt.';
        } else {
            return '**NO IMPACT**: No data extracted. Complete rebuild required.';
        }
    }
}

// Start data extraction
const extractor = new HyperiseDataExtractor();
extractor.extractAllData().catch(console.error);
