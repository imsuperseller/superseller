#!/usr/bin/env node

/**
 * 🔧 CONFIGURE LEADM.RENSTO.COM DNS
 * 
 * Adds the A record for leadm.rensto.com to point to Vercel
 */

import axios from 'axios';

class LeadmDNSConfigurer {
    constructor() {
        this.cloudflareConfig = {
            zoneId: '031333b77c859d1dd4d4fd4afdc1b9bc',
            email: 'service@rensto.com',
            apiKey: process.env.CLOUDFLARE_API_KEY || 'your-cloudflare-api-key'
        };
        
        this.vercelIP = '76.76.21.21'; // Vercel's IP for custom domains
    }

    async addLeadmDNSRecord() {
        try {
            console.log('🌐 Adding DNS record for leadm.rensto.com...');
            
            const response = await axios.post(
                `https://api.cloudflare.com/client/v4/zones/${this.cloudflareConfig.zoneId}/dns_records`,
                {
                    type: 'A',
                    name: 'leadm.rensto.com',
                    content: this.vercelIP,
                    ttl: 1, // Auto TTL
                    proxied: false // Don't proxy through Cloudflare
                },
                {
                    headers: {
                        'X-Auth-Email': this.cloudflareConfig.email,
                        'X-Auth-Key': this.cloudflareConfig.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                console.log('✅ DNS record added successfully!');
                console.log(`📋 Record ID: ${response.data.result.id}`);
                console.log(`🌐 leadm.rensto.com → ${this.vercelIP}`);
                console.log('');
                console.log('⏳ DNS propagation may take 5-10 minutes');
                console.log('🔗 Test: https://leadm.rensto.com');
                return true;
            } else {
                console.error('❌ Failed to add DNS record:', response.data.errors);
                return false;
            }
            
        } catch (error) {
            console.error('❌ DNS configuration failed:', error.message);
            if (error.response) {
                console.error('Response:', error.response.data);
            }
            return false;
        }
    }

    async checkExistingRecords() {
        try {
            console.log('🔍 Checking existing DNS records for leadm.rensto.com...');
            
            const response = await axios.get(
                `https://api.cloudflare.com/client/v4/zones/${this.cloudflareConfig.zoneId}/dns_records?name=leadm.rensto.com`,
                {
                    headers: {
                        'X-Auth-Email': this.cloudflareConfig.email,
                        'X-Auth-Key': this.cloudflareConfig.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const records = response.data.result;
                if (records.length > 0) {
                    console.log(`📋 Found ${records.length} existing record(s):`);
                    records.forEach((record, index) => {
                        console.log(`   ${index + 1}. ${record.type} ${record.name} → ${record.content}`);
                    });
                    return records;
                } else {
                    console.log('📋 No existing records found for leadm.rensto.com');
                    return [];
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to check existing records:', error.message);
            return [];
        }
    }
}

// Main execution
async function main() {
    const configurer = new LeadmDNSConfigurer();
    
    console.log('🚀 LEADM.RENSTO.COM DNS CONFIGURATION');
    console.log('=====================================');
    console.log('');
    
    // Check existing records first
    const existingRecords = await configurer.checkExistingRecords();
    
    if (existingRecords.length > 0) {
        console.log('⚠️  Existing records found. Please check if leadm.rensto.com is already configured.');
        console.log('💡 You may need to update the existing record instead of creating a new one.');
        return;
    }
    
    // Add the DNS record
    const success = await configurer.addLeadmDNSRecord();
    
    if (success) {
        console.log('');
        console.log('🎉 DNS CONFIGURATION COMPLETE!');
        console.log('================================');
        console.log('✅ leadm.rensto.com is now configured');
        console.log('⏳ Wait 5-10 minutes for DNS propagation');
        console.log('🔗 Then visit: https://leadm.rensto.com');
    } else {
        console.log('');
        console.log('❌ DNS CONFIGURATION FAILED');
        console.log('============================');
        console.log('💡 Please check your Cloudflare API key and try again');
    }
}

// Run the script
main().catch(console.error);
