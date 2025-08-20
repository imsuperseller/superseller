#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🔄 CONFIGURE SUBDOMAIN REDIRECTS
 * Set up redirects so subdomains automatically go to their customer portals
 */

class SubdomainRedirectConfigurator {
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

    async createRedirectRule(subdomain, targetPath) {
        console.log(`🔄 Creating redirect rule: ${subdomain}.rensto.com → ${targetPath}\n`);

        try {
            const redirectData = {
                type: 'redirect',
                name: `${subdomain}.rensto.com`,
                target: `https://rensto-business-system-jj6yl2a9v-shais-projects-f9b9e359.vercel.app${targetPath}`,
                status_code: 301,
                proxied: true
            };

            const response = await axios.post(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
                redirectData,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log(`✅ Redirect rule created: ${subdomain}.rensto.com → ${targetPath}`);
                return response.data.result;
            } else {
                throw new Error('Failed to create redirect rule');
            }
        } catch (error) {
            console.error(`❌ Failed to create redirect for ${subdomain}:`, error.response?.data || error.message);
            return null;
        }
    }

    async updateCNAMERecord(subdomain, target) {
        console.log(`📝 Updating CNAME record: ${subdomain}.rensto.com → ${target}\n`);

        try {
            // First, get the current record
            const recordsResponse = await axios.get(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
                { headers: this.getHeaders() }
            );

            if (recordsResponse.data.success) {
                const records = recordsResponse.data.result;
                const record = records.find(r => r.name === `${subdomain}.rensto.com` && r.type === 'CNAME');

                if (record) {
                    const updateData = {
                        type: 'CNAME',
                        name: subdomain,
                        content: target,
                        proxied: true,
                        ttl: 1
                    };

                    const response = await axios.put(
                        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${record.id}`,
                        updateData,
                        { headers: this.getHeaders() }
                    );

                    if (response.data.success) {
                        console.log(`✅ CNAME updated: ${subdomain}.rensto.com → ${target}`);
                        return response.data.result;
                    } else {
                        throw new Error('Failed to update CNAME record');
                    }
                } else {
                    console.log(`⚠️  CNAME record not found for ${subdomain}.rensto.com`);
                }
            }
        } catch (error) {
            console.error(`❌ Failed to update CNAME for ${subdomain}:`, error.response?.data || error.message);
        }
        return null;
    }

    async configureSubdomainRedirects() {
        console.log('🔄 Configuring subdomain redirects for customer portals...\n');

        const subdomainConfigs = [
            { subdomain: 'tax4us', path: '/portal/tax4us' },
            { subdomain: 'shelly-mizrahi', path: '/portal/shelly-mizrahi' },
            { subdomain: 'test-customer', path: '/portal/test-customer' }
        ];

        const results = [];
        for (const config of subdomainConfigs) {
            console.log(`\n🎯 Configuring ${config.subdomain}.rensto.com...`);

            // Update the CNAME to point to the Vercel deployment
            const cnameResult = await this.updateCNAMERecord(
                config.subdomain,
                'rensto-business-system-jj6yl2a9v-shais-projects-f9b9e359.vercel.app'
            );

            results.push({
                subdomain: config.subdomain,
                path: config.path,
                cnameUpdated: !!cnameResult
            });
        }

        return results;
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const configurator = new SubdomainRedirectConfigurator();

    try {
        console.log('🔄 Subdomain Redirect Configuration\n');

        const results = await configurator.configureSubdomainRedirects();

        console.log('\n📊 Configuration Results:');
        console.log('========================');

        results.forEach(result => {
            const status = result.cnameUpdated ? '✅' : '❌';
            console.log(`${status} ${result.subdomain}.rensto.com → /portal/${result.subdomain}`);
        });

        console.log('\n🎯 Next Steps:');
        console.log('1. Wait 2-5 minutes for DNS changes to propagate');
        console.log('2. Test: https://tax4us.rensto.com');
        console.log('3. The subdomain should now automatically redirect to the customer portal');
        console.log('4. If it still shows the landing page, clear your browser cache');

        console.log('\n📝 Note: The subdomains now point directly to the Vercel deployment.');
        console.log('   The application should handle the routing to the correct portal.');

    } catch (error) {
        console.error('❌ Configuration failed:', error.message);
        process.exit(1);
    }
}

main();
