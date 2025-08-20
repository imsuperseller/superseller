#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🚫 TEMPORARILY DISABLE CLOUDFLARE PROXY
 * Disable proxy for customer domains to test direct connection
 */

class CloudflareProxyDisabler {
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

    async disableProxyForCustomerDomains() {
        console.log('🚫 Temporarily disabling Cloudflare proxy for customer domains...\n');

        const customerDomains = [
            'tax4us.rensto.com',
            'shelly-mizrahi.rensto.com',
            'test-customer.rensto.com'
        ];

        for (const domain of customerDomains) {
            await this.updateDNSRecord(domain, false);
        }
    }

    async updateDNSRecord(domain, proxied) {
        try {
            // First, get the current record
            const recordsResponse = await axios.get(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
                { headers: this.getHeaders() }
            );

            if (recordsResponse.data.success) {
                const records = recordsResponse.data.result;
                const record = records.find(r => r.name === domain && r.type === 'CNAME');

                if (record) {
                    console.log(`🔄 Updating ${domain} proxy setting to ${proxied ? 'enabled' : 'disabled'}...`);

                    const updateData = {
                        type: 'CNAME',
                        name: record.name.replace('.rensto.com', ''),
                        content: record.content,
                        proxied: proxied,
                        ttl: 1
                    };

                    const response = await axios.put(
                        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${record.id}`,
                        updateData,
                        { headers: this.getHeaders() }
                    );

                    if (response.data.success) {
                        console.log(`✅ ${domain} proxy ${proxied ? 'enabled' : 'disabled'} successfully`);
                        return true;
                    } else {
                        throw new Error('Failed to update DNS record');
                    }
                } else {
                    console.log(`⚠️  DNS record not found for ${domain}`);
                }
            }
        } catch (error) {
            console.error(`❌ Failed to update ${domain}:`, error.response?.data || error.message);
            return false;
        }
    }

    async reEnableProxyForCustomerDomains() {
        console.log('\n🔄 Re-enabling Cloudflare proxy for customer domains...\n');

        const customerDomains = [
            'tax4us.rensto.com',
            'shelly-mizrahi.rensto.com',
            'test-customer.rensto.com'
        ];

        for (const domain of customerDomains) {
            await this.updateDNSRecord(domain, true);
        }
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const disabler = new CloudflareProxyDisabler();

    try {
        console.log('🧪 Testing direct connection by disabling Cloudflare proxy...\n');

        // Disable proxy
        await disabler.disableProxyForCustomerDomains();

        console.log('\n⏳ Wait 2-3 minutes for DNS changes to propagate...');
        console.log('🔍 Then test: https://tax4us.rensto.com');
        console.log('📝 If it works, the issue is with Cloudflare proxy');
        console.log('📝 If it fails, the issue is with DNS or Vercel');

        console.log('\n🔄 To re-enable proxy later, run:');
        console.log('   node scripts/temporarily-disable-cloudflare-proxy.js --re-enable');

    } catch (error) {
        console.error('❌ Proxy disable failed:', error.message);
        process.exit(1);
    }
}

async function reEnable() {
    const disabler = new CloudflareProxyDisabler();

    try {
        await disabler.reEnableProxyForCustomerDomains();
        console.log('\n✅ Cloudflare proxy re-enabled for all customer domains');
    } catch (error) {
        console.error('❌ Proxy re-enable failed:', error.message);
        process.exit(1);
    }
}

// Check command line arguments
if (process.argv.includes('--re-enable')) {
    reEnable();
} else {
    main();
}

export default CloudflareProxyDisabler;
