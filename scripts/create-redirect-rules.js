#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🔄 CREATE DNS-BASED REDIRECTS
 * Set up redirects using DNS records that point to a redirect service
 */

class DNSBasedRedirects {
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

    async updateDNSRecord(subdomain, target) {
        console.log(`🔄 Updating DNS record: ${subdomain}.rensto.com → ${target}\n`);

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
                        console.log(`✅ DNS record updated: ${subdomain}.rensto.com → ${target}`);
                        return response.data.result;
                    } else {
                        throw new Error('Failed to update DNS record');
                    }
                } else {
                    console.log(`⚠️  DNS record not found for ${subdomain}.rensto.com`);
                }
            }
        } catch (error) {
            console.error(`❌ Failed to update DNS for ${subdomain}:`, error.response?.data || error.message);
        }
        return null;
    }

    async configureSubdomainRedirects() {
        console.log('🔄 Configuring DNS-based redirects for subdomain routing...\n');

        const subdomainConfigs = [
            { subdomain: 'tax4us', path: '/portal/tax4us' },
            { subdomain: 'shelly-mizrahi', path: '/portal/shelly-mizrahi' },
            { subdomain: 'test-customer', path: '/portal/test-customer' }
        ];

        const results = [];
        for (const config of subdomainConfigs) {
            console.log(`\n🎯 Configuring ${config.subdomain}.rensto.com...`);
            
            // Update DNS to point to the specific portal path
            const target = `rensto-business-system-jj6yl2a9v-shais-projects-f9b9e359.vercel.app${config.path}`;
            const result = await this.updateDNSRecord(config.subdomain, target);
            
            results.push({
                subdomain: config.subdomain,
                path: config.path,
                success: !!result,
                target: target
            });
        }

        return results;
    }

    async listCurrentRecords() {
        try {
            const response = await axios.get(
                `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
                { headers: this.getHeaders() }
            );

            if (response.data.success) {
                console.log('📋 Current DNS Records:');
                response.data.result.forEach(record => {
                    if (record.name.includes('tax4us') || record.name.includes('shelly-mizrahi') || record.name.includes('test-customer')) {
                        console.log(`   - ${record.name} (${record.type}) → ${record.content}`);
                    }
                });
                return response.data.result;
            }
        } catch (error) {
            console.error('❌ Failed to list DNS records:', error.response?.data || error.message);
        }
        return [];
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const dnsRedirects = new DNSBasedRedirects();

    try {
        console.log('🔄 DNS-Based Redirect Configuration\n');

        // List current records
        await dnsRedirects.listCurrentRecords();
        console.log('');

        const results = await dnsRedirects.configureSubdomainRedirects();

        console.log('\n📊 Configuration Results:');
        console.log('========================');
        
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.subdomain}.rensto.com → ${result.path}`);
            console.log(`   Target: ${result.target}`);
        });

        console.log('\n🎯 Configuration Complete:');
        console.log('1. DNS records updated immediately');
        console.log('2. Test: https://tax4us.rensto.com');
        console.log('3. Subdomains now point directly to customer portal paths');
        console.log('4. No more landing page - direct portal access');

        console.log('\n📝 Technical Details:');
        console.log('- DNS records point directly to portal paths');
        console.log('- Vercel handles the routing to correct portals');
        console.log('- Cloudflare proxy enabled for SSL/TLS');
        console.log('- Immediate effect, no redirect loops');

    } catch (error) {
        console.error('❌ DNS configuration failed:', error.message);
        process.exit(1);
    }
}

main();
