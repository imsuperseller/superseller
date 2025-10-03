#!/usr/bin/env node

/**
 * Cloudflare OAuth2 Configuration Script
 * Configures DNS and tunnel settings for n8n OAuth2 callback
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// Configuration
const CLOUDFLARE_API_TOKEN = 'd6921e18b648f2be2d2c8eeb969ed9fd1614c';
const DOMAIN = 'rensto.com';
const OAUTH2_SUBDOMAIN = 'n8n-oauth2';
const N8N_PORT = 5678;

class CloudflareConfigurator {
    constructor() {
        this.apiToken = CLOUDFLARE_API_TOKEN;
        this.domain = DOMAIN;
        this.oauth2Subdomain = OAUTH2_SUBDOMAIN;
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.cloudflare.com',
                port: 443,
                path: endpoint,
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(body);
                        resolve(result);
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${body}`));
                    }
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async getZoneId() {
        console.log('🔍 Getting zone ID for domain:', this.domain);
        
        try {
            const response = await this.makeRequest('/client/v4/zones');
            
            if (!response.success) {
                throw new Error(`API Error: ${JSON.stringify(response.errors)}`);
            }

            const zone = response.result.find(z => z.name === this.domain);
            if (!zone) {
                throw new Error(`Zone not found for domain: ${this.domain}`);
            }

            console.log('✅ Zone ID found:', zone.id);
            return zone.id;
        } catch (error) {
            console.error('❌ Failed to get zone ID:', error.message);
            throw error;
        }
    }

    async createDNSRecord(zoneId) {
        console.log('🌐 Creating DNS record for OAuth2 callback...');
        
        const recordData = {
            type: 'CNAME',
            name: this.oauth2Subdomain,
            content: 'tunnel-id.cfargotunnel.com', // This needs to be updated with actual tunnel ID
            ttl: 1, // Auto TTL
            proxied: true // Enable Cloudflare proxy (orange cloud)
        };

        try {
            const response = await this.makeRequest(
                `/client/v4/zones/${zoneId}/dns_records`,
                'POST',
                recordData
            );

            if (!response.success) {
                throw new Error(`DNS Record Creation Failed: ${JSON.stringify(response.errors)}`);
            }

            console.log('✅ DNS record created successfully');
            console.log('📋 Record details:', response.result);
            return response.result;
        } catch (error) {
            console.error('❌ Failed to create DNS record:', error.message);
            throw error;
        }
    }

    generateTunnelConfig() {
        console.log('🔧 Generating Cloudflare Tunnel configuration...');
        
        const tunnelConfig = {
            tunnel: 'YOUR-TUNNEL-ID-HERE',
            credentialsFile: '/etc/cloudflared/YOUR-TUNNEL-ID.json',
            ingress: [
                {
                    hostname: 'n8n.rensto.com',
                    service: `http://localhost:${N8N_PORT}`,
                    originRequest: {
                        noTLSVerify: true,
                        httpHostHeader: 'n8n.rensto.com'
                    }
                },
                {
                    hostname: `${this.oauth2Subdomain}.${this.domain}`,
                    service: `http://localhost:${N8N_PORT}`,
                    originRequest: {
                        noTLSVerify: true,
                        httpHostHeader: `${this.oauth2Subdomain}.${this.domain}`
                    }
                },
                {
                    service: 'http_status:404'
                }
            ]
        };

        const configPath = '/etc/cloudflared/config.yml';
        const configContent = `tunnel: ${tunnelConfig.tunnel}
credentials-file: ${tunnelConfig.credentialsFile}

# Ingress rules - order matters!
ingress:
  # n8n interface
  - hostname: ${tunnelConfig.ingress[0].hostname}
    service: ${tunnelConfig.ingress[0].service}
    originRequest:
      noTLSVerify: ${tunnelConfig.ingress[0].originRequest.noTLSVerify}
      httpHostHeader: ${tunnelConfig.ingress[0].originRequest.httpHostHeader}

  # n8n OAuth2 callback (for Slack integration)
  - hostname: ${tunnelConfig.ingress[1].hostname}
    service: ${tunnelConfig.ingress[1].service}
    originRequest:
      noTLSVerify: ${tunnelConfig.ingress[1].originRequest.noTLSVerify}
      httpHostHeader: ${tunnelConfig.ingress[1].originRequest.httpHostHeader}

  # Catch-all rule (required)
  - service: ${tunnelConfig.ingress[2].service}
`;

        console.log('📝 Tunnel configuration generated:');
        console.log(configContent);
        
        return {
            configPath,
            configContent,
            tunnelConfig
        };
    }

    generateSetupInstructions() {
        console.log('\n🚀 SETUP INSTRUCTIONS:');
        console.log('=====================================');
        console.log('');
        console.log('1. 📋 DNS Configuration:');
        console.log(`   - Go to Cloudflare Dashboard → DNS → Records`);
        console.log(`   - Add CNAME record:`);
        console.log(`     Type: CNAME`);
        console.log(`     Name: ${this.oauth2Subdomain}`);
        console.log(`     Target: YOUR-TUNNEL-ID.cfargotunnel.com`);
        console.log(`     Proxy status: Proxied (orange cloud) ✅`);
        console.log('');
        console.log('2. 🔧 Update Cloudflare Tunnel:');
        console.log(`   - Edit /etc/cloudflared/config.yml`);
        console.log(`   - Add the OAuth2 callback hostname configuration`);
        console.log(`   - Restart tunnel: sudo systemctl restart cloudflared`);
        console.log('');
        console.log('3. 🔗 Slack OAuth2 Configuration:');
        console.log(`   - Use this HTTPS URL in Slack:`);
        console.log(`     https://${this.oauth2Subdomain}.${this.domain}/rest/oauth2-credential/callback`);
        console.log('');
        console.log('4. ✅ Test the setup:');
        console.log(`   - Test DNS: nslookup ${this.oauth2Subdomain}.${this.domain}`);
        console.log(`   - Test HTTPS: curl -I https://${this.oauth2Subdomain}.${this.domain}`);
        console.log(`   - Test callback: curl -I https://${this.oauth2Subdomain}.${this.domain}/rest/oauth2-credential/callback`);
        console.log('');
    }

    async run() {
        try {
            console.log('🚀 Starting Cloudflare OAuth2 Configuration...');
            console.log('===============================================');
            console.log('');

            // Step 1: Get zone ID
            const zoneId = await this.getZoneId();
            
            // Step 2: Create DNS record
            await this.createDNSRecord(zoneId);
            
            // Step 3: Generate tunnel configuration
            const tunnelConfig = this.generateTunnelConfig();
            
            // Step 4: Generate setup instructions
            this.generateSetupInstructions();
            
            console.log('✅ Configuration completed successfully!');
            console.log('');
            console.log('📋 Next Steps:');
            console.log('1. Update your Cloudflare Tunnel configuration with the generated config');
            console.log('2. Restart the cloudflared service');
            console.log('3. Use the HTTPS URL in your Slack OAuth2 configuration');
            console.log('');
            console.log(`🔗 OAuth2 Callback URL: https://${this.oauth2Subdomain}.${this.domain}/rest/oauth2-credential/callback`);
            
        } catch (error) {
            console.error('❌ Configuration failed:', error.message);
            console.log('');
            console.log('🔧 Manual Setup Required:');
            console.log('Since the API configuration failed, please follow the manual setup instructions above.');
            this.generateSetupInstructions();
            process.exit(1);
        }
    }
}

// Run the configuration
const configurator = new CloudflareConfigurator();
configurator.run();

export default CloudflareConfigurator;
