#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 📄 CREATE CLOUDFLARE PAGE RULES
 * Set up page rules to redirect subdomains to their customer portals
 */

class CloudflarePageRules {
    constructor() {
        this.config = {
            apiToken: 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2',
            domain: 'rensto.com',
            baseUrl: 'https://api.cloudflare.com/client/v4',
            zoneId: '031333b77c859d1dd4d4fd4afdc1b9bc'
        };
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
        };
    }

    async createPageRule(subdomain, targetPath) {
        console.log(`📄 Creating page rule: ${subdomain}.rensto.com → ${targetPath}\n`);

        try {
            const pageRuleData = {
                targets: [
                    {
                        target: 'url',
                        constraint: {
                            operator: 'matches',
                            value: `${subdomain}.rensto.com/*`
                        }
                    }
                ],
                actions: [
                    {
                        id: 'forwarding_url',
                        value: {
                            url: `https://rensto-business-system-jj6yl2a9v-shais-projects-f9b9e359.vercel.app${targetPath}`,
                            status_code: 301
                        }
                    }
                ],
                status: 'active',
                priority: 1
            };

            const response = await axios.post(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/pagerules`,
                pageRuleData,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log(`✅ Page rule created: ${subdomain}.rensto.com → ${targetPath}`);
                console.log(`📝 Rule ID: ${response.data.result.id}`);
                return response.data.result;
            } else {
                throw new Error('Failed to create page rule');
            }
        } catch (error) {
            console.error(`❌ Failed to create page rule for ${subdomain}:`, error.response?.data || error.message);
            return null;
        }
    }

    async listPageRules() {
        try {
            const response = await axios.get(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/pagerules`,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log('📋 Current Page Rules:');
                response.data.result.forEach(rule => {
                    const target = rule.targets[0]?.constraint?.value || 'Unknown';
                    const action = rule.actions[0]?.value?.url || 'Unknown';
                    console.log(`   - ${target} → ${action} (${rule.status})`);
                });
                return response.data.result;
            }
        } catch (error) {
            console.error('❌ Failed to list page rules:', error.response?.data || error.message);
        }
        return [];
    }

    async deletePageRule(ruleId) {
        try {
            const response = await axios.delete(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/pagerules/${ruleId}`,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log(`🗑️  Page rule deleted: ${ruleId}`);
                return true;
            }
        } catch (error) {
            console.error(`❌ Failed to delete page rule ${ruleId}:`, error.response?.data || error.message);
        }
        return false;
    }

    async configureSubdomainRedirects() {
        console.log('📄 Configuring Cloudflare Page Rules for subdomain redirects...\n');

        const subdomainConfigs = [
            { subdomain: 'tax4us', path: '/portal/tax4us' },
            { subdomain: 'shelly-mizrahi', path: '/portal/shelly-mizrahi' },
            { subdomain: 'test-customer', path: '/portal/test-customer' }
        ];

        const results = [];
        for (const config of subdomainConfigs) {
            console.log(`\n🎯 Creating page rule for ${config.subdomain}.rensto.com...`);

            const result = await this.createPageRule(config.subdomain, config.path);

            results.push({
                subdomain: config.subdomain,
                path: config.path,
                success: !!result,
                ruleId: result?.id
            });
        }

        return results;
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const pageRules = new CloudflarePageRules();

    try {
        console.log('📄 Cloudflare Page Rules Configuration\n');

        // List current page rules
        await pageRules.listPageRules();
        console.log('');

        const results = await pageRules.configureSubdomainRedirects();

        console.log('\n📊 Configuration Results:');
        console.log('========================');

        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.subdomain}.rensto.com → ${result.path}`);
            if (result.ruleId) {
                console.log(`   Rule ID: ${result.ruleId}`);
            }
        });

        console.log('\n🎯 Next Steps:');
        console.log('1. Page rules are active immediately');
        console.log('2. Test: https://tax4us.rensto.com');
        console.log('3. The subdomain should now automatically redirect to the customer portal');
        console.log('4. Clear your browser cache if you still see the old page');

        console.log('\n📝 Note: Page rules take precedence over DNS records.');
        console.log('   The subdomains will now redirect directly to the customer portals.');

    } catch (error) {
        console.error('❌ Page rules configuration failed:', error.message);
        process.exit(1);
    }
}

main();
