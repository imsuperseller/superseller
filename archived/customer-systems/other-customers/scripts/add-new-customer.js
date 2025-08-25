#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 👤 ADD NEW CUSTOMER AUTOMATION
 * 
 * Dynamically add new customers with automated DNS creation
 */

class CustomerOnboarding {
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

    async createCustomerSubdomain(customerId, customerName, company) {
        console.log(`👤 Creating subdomain for ${customerName} (${company})...`);

        try {
                  const dnsRecord = {
        type: 'CNAME',
        name: customerId,
        content: 'my-website-shais-projects-f9b9e359.vercel.app',
        proxied: true,
        ttl: 1
      };

            const response = await axios.post(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`, dnsRecord, {
                headers: this.getHeaders()
            });

            if (response.data.success) {
                const subdomain = `${customerId}.${this.config.domain}`;
                console.log(`✅ Customer subdomain created: https://${subdomain}`);
                return {
                    success: true,
                    subdomain: subdomain,
                    url: `https://${subdomain}`,
                    recordId: response.data.result.id
                };
            } else {
                throw new Error('Failed to create DNS record');
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.code === 81057) {
                console.log(`⚠️  Subdomain already exists: ${customerId}.${this.config.domain}`);
                return {
                    success: true,
                    subdomain: `${customerId}.${this.config.domain}`,
                    url: `https://${customerId}.${this.config.domain}`,
                    exists: true
                };
            } else {
                console.error(`❌ Failed to create subdomain for ${customerName}:`, error.response?.data || error.message);
                return { success: false, error: error.message };
            }
        }
    }

    async saveCustomerData(customerId, customerName, company, result) {
        const customerData = {
            id: customerId,
            name: customerName,
            company: company,
            subdomain: result.subdomain,
            url: result.url,
            created: new Date().toISOString(),
            dnsRecordId: result.recordId,
            status: 'active'
        };

        const configDir = 'data/customers';
        await fs.mkdir(configDir, { recursive: true });
        const filepath = path.join(configDir, `${customerId}.json`);
        await fs.writeFile(filepath, JSON.stringify(customerData, null, 2));

        console.log(`💾 Customer data saved: ${filepath}`);
        return customerData;
    }

    async addNewCustomer(customerId, customerName, company) {
        console.log(`🚀 Adding new customer: ${customerName} (${company})`);
        console.log(`📝 Customer ID: ${customerId}`);
        console.log(`🏢 Company: ${company}\n`);

        try {
            // Create DNS subdomain
            const dnsResult = await this.createCustomerSubdomain(customerId, customerName, company);

            if (dnsResult.success) {
                // Save customer data
                const customerData = await this.saveCustomerData(customerId, customerName, company, dnsResult);

                console.log('\n🎉 Customer onboarding completed!');
                console.log('📋 Customer Details:');
                console.log(`   Name: ${customerName}`);
                console.log(`   Company: ${company}`);
                console.log(`   Portal URL: ${customerData.url}`);
                console.log(`   Customer ID: ${customerId}`);

                if (dnsResult.exists) {
                    console.log(`   Status: Subdomain already existed`);
                } else {
                    console.log(`   Status: New subdomain created`);
                }

                return customerData;
            } else {
                console.error('❌ Customer onboarding failed');
                return null;
            }
        } catch (error) {
            console.error('❌ Customer onboarding failed:', error.message);
            return null;
        }
    }
}

// ===== COMMAND LINE INTERFACE =====

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('📋 Usage: node scripts/add-new-customer.js <customer-id> <customer-name> <company>');
        console.log('');
        console.log('📝 Examples:');
        console.log('   node scripts/add-new-customer.js john-doe "John Doe" "Tech Solutions"');
        console.log('   node scripts/add-new-customer.js sarah-smith "Sarah Smith" "Marketing Pro"');
        console.log('');
        console.log('🔧 Customer ID should be lowercase, no spaces, use hyphens');
        console.log('   This will create: https://customer-id.rensto.com');
        return;
    }

    const [customerId, customerName, company] = args;

    // Validate customer ID format
    if (!/^[a-z0-9-]+$/.test(customerId)) {
        console.error('❌ Customer ID must be lowercase letters, numbers, and hyphens only');
        console.error('   Example: john-doe, sarah-smith, tech-company-2024');
        return;
    }

    const onboarding = new CustomerOnboarding();
    await onboarding.addNewCustomer(customerId, customerName, company);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default CustomerOnboarding;
