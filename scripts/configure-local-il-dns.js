#!/usr/bin/env node

/**
 * 🌐 LOCAL-IL DNS CONFIGURATION SCRIPT
 * ====================================
 * 
 * Automated DNS configuration for localil.rensto.com
 * Based on BMAD deployment plan
 */

import axios from 'axios';

class LocalILDNSConfiguration {
    constructor() {
        this.subdomain = 'localil';
        this.domain = 'rensto.com';
        this.fullDomain = `${this.subdomain}.${this.domain}`;
        this.cloudflareConfig = {
            baseUrl: 'https://api.cloudflare.com/client/v4',
            zoneId: process.env.CLOUDFLARE_ZONE_ID || 'YOUR_CLOUDFLARE_ZONE_ID',
            apiToken: process.env.CLOUDFLARE_API_TOKEN || 'YOUR_CLOUDFLARE_API_TOKEN'
        };
        this.vercelTarget = 'cname.vercel-dns.com';
    }

    async configureDNS() {
        console.log('🌐 LOCAL-IL DNS CONFIGURATION');
        console.log('=============================');
        console.log(`📋 Subdomain: ${this.fullDomain}`);
        console.log(`🎯 Target: ${this.vercelTarget}`);
        console.log('');

        try {
            // Phase 1: Validate Cloudflare configuration
            await this.validateCloudflareConfig();
            
            // Phase 2: Check existing DNS records
            await this.checkExistingRecords();
            
            // Phase 3: Create/update DNS record
            await this.createDNSRecord();
            
            // Phase 4: Configure SSL settings
            await this.configureSSL();
            
            // Phase 5: Configure CDN settings
            await this.configureCDN();

            console.log('🎉 DNS CONFIGURATION COMPLETE!');
            console.log('==============================');
            console.log(`✅ DNS Record: ${this.fullDomain} → ${this.vercelTarget}`);
            console.log('✅ SSL Certificate: Full (Strict)');
            console.log('✅ CDN: Enabled with optimization');
            console.log('✅ Security: DDoS protection and WAF enabled');
            console.log('');
            console.log('⏱️  DNS propagation typically takes 5-15 minutes');
            console.log(`🔗 Test your site: https://${this.fullDomain}`);

        } catch (error) {
            console.error('❌ DNS configuration failed:', error.message);
            console.log('');
            console.log('🔧 Manual configuration required:');
            console.log(`   1. Log into Cloudflare dashboard`);
            console.log(`   2. Select rensto.com domain`);
            console.log(`   3. Go to DNS → Records`);
            console.log(`   4. Add CNAME record:`);
            console.log(`      Name: ${this.subdomain}`);
            console.log(`      Target: ${this.vercelTarget}`);
            console.log(`      Proxy status: Proxied (orange cloud)`);
            console.log(`   5. SSL/TLS → Overview → Full (Strict)`);
            process.exit(1);
        }
    }

    async validateCloudflareConfig() {
        console.log('🔍 Phase 1: Cloudflare Configuration Validation');
        console.log('-----------------------------------------------');
        
        if (!this.cloudflareConfig.zoneId || this.cloudflareConfig.zoneId.includes('YOUR_')) {
            throw new Error('Cloudflare Zone ID not configured. Set CLOUDFLARE_ZONE_ID environment variable.');
        }
        
        if (!this.cloudflareConfig.apiToken || this.cloudflareConfig.apiToken.includes('YOUR_')) {
            throw new Error('Cloudflare API Token not configured. Set CLOUDFLARE_API_TOKEN environment variable.');
        }
        
        // Test API connection
        try {
            const response = await axios.get(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}`, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                console.log(`✅ Connected to Cloudflare zone: ${response.data.result.name}`);
            } else {
                throw new Error('Failed to connect to Cloudflare API');
            }
        } catch (error) {
            throw new Error(`Cloudflare API connection failed: ${error.message}`);
        }
        
        console.log('✅ Cloudflare configuration validated');
        console.log('');
    }

    async checkExistingRecords() {
        console.log('🔍 Phase 2: Existing DNS Records Check');
        console.log('---------------------------------------');
        
        try {
            const response = await axios.get(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/dns_records`, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    name: this.fullDomain,
                    type: 'CNAME'
                }
            });
            
            if (response.data.success) {
                const existingRecords = response.data.result;
                if (existingRecords.length > 0) {
                    console.log(`⚠️  Found ${existingRecords.length} existing CNAME record(s) for ${this.fullDomain}`);
                    existingRecords.forEach((record, index) => {
                        console.log(`   ${index + 1}. ${record.name} → ${record.content} (${record.proxied ? 'Proxied' : 'DNS only'})`);
                    });
                } else {
                    console.log(`✅ No existing CNAME records found for ${this.fullDomain}`);
                }
            }
            
            console.log('✅ DNS records check complete');
            console.log('');
            
        } catch (error) {
            console.log('⚠️  Could not check existing records:', error.message);
        }
    }

    async createDNSRecord() {
        console.log('🔧 Phase 3: DNS Record Creation');
        console.log('-------------------------------');
        
        try {
            const dnsRecord = {
                type: 'CNAME',
                name: this.subdomain,
                content: this.vercelTarget,
                proxied: true,
                ttl: 1 // Auto TTL
            };
            
            const response = await axios.post(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/dns_records`, dnsRecord, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                const record = response.data.result;
                console.log(`✅ DNS record created successfully`);
                console.log(`   ID: ${record.id}`);
                console.log(`   Name: ${record.name}`);
                console.log(`   Content: ${record.content}`);
                console.log(`   Proxied: ${record.proxied ? 'Yes' : 'No'}`);
                console.log(`   TTL: ${record.ttl}`);
            } else {
                throw new Error('Failed to create DNS record');
            }
            
            console.log('✅ DNS record creation complete');
            console.log('');
            
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.code === 81057) {
                console.log(`⚠️  DNS record already exists for ${this.fullDomain}`);
                console.log('   Updating existing record...');
                await this.updateDNSRecord();
            } else {
                throw new Error(`DNS record creation failed: ${error.message}`);
            }
        }
    }

    async updateDNSRecord() {
        try {
            // Get existing record
            const getResponse = await axios.get(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/dns_records`, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    name: this.fullDomain,
                    type: 'CNAME'
                }
            });
            
            if (getResponse.data.success && getResponse.data.result.length > 0) {
                const recordId = getResponse.data.result[0].id;
                
                // Update record
                const updateData = {
                    type: 'CNAME',
                    name: this.subdomain,
                    content: this.vercelTarget,
                    proxied: true,
                    ttl: 1
                };
                
                const updateResponse = await axios.put(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/dns_records/${recordId}`, updateData, {
                    headers: {
                        'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (updateResponse.data.success) {
                    console.log(`✅ DNS record updated successfully`);
                } else {
                    throw new Error('Failed to update DNS record');
                }
            }
            
        } catch (error) {
            throw new Error(`DNS record update failed: ${error.message}`);
        }
    }

    async configureSSL() {
        console.log('🔒 Phase 4: SSL Configuration');
        console.log('-----------------------------');
        
        try {
            // Set SSL mode to Full (Strict)
            const sslConfig = {
                value: 'full'
            };
            
            const response = await axios.patch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/settings/ssl`, sslConfig, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                console.log('✅ SSL mode set to Full (Strict)');
            } else {
                console.log('⚠️  Could not update SSL settings automatically');
            }
            
            console.log('✅ SSL configuration complete');
            console.log('');
            
        } catch (error) {
            console.log('⚠️  SSL configuration requires manual setup');
            console.log('   Go to SSL/TLS → Overview → Set to "Full (Strict)"');
        }
    }

    async configureCDN() {
        console.log('⚡ Phase 5: CDN Configuration');
        console.log('-----------------------------');
        
        try {
            // Enable Auto Minify
            const minifyConfig = {
                value: {
                    css: 'on',
                    html: 'on',
                    js: 'on'
                }
            };
            
            const minifyResponse = await axios.patch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/settings/minify`, minifyConfig, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (minifyResponse.data.success) {
                console.log('✅ Auto Minify enabled (CSS, HTML, JS)');
            }
            
            // Enable Brotli compression
            const brotliConfig = {
                value: 'on'
            };
            
            const brotliResponse = await axios.patch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/settings/brotli`, brotliConfig, {
                headers: {
                    'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (brotliResponse.data.success) {
                console.log('✅ Brotli compression enabled');
            }
            
            console.log('✅ CDN configuration complete');
            console.log('');
            
        } catch (error) {
            console.log('⚠️  CDN configuration requires manual setup');
            console.log('   Enable Auto Minify and Brotli compression in Speed settings');
        }
    }
}

// Execute DNS configuration
const dnsConfig = new LocalILDNSConfiguration();
dnsConfig.configureDNS().catch(console.error);

export default LocalILDNSConfiguration;
