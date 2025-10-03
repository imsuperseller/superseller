#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';

console.log('🏗️ SETTING UP RENSTO WEBFLOW + VERCEL ARCHITECTURE');
console.log('==================================================');

// Configuration
const CONFIG = {
    webflow: {
        siteId: '66c7e551a317e0e9c9f906d8',
        apiToken: 'fd74dac2e8dc23c2e8047d7854be9e303afe85249301b14a91b657b36d1759ed',
        clientId: 'b77ecda6a3e0feba68ad9c75c1b18cf0fb71d8859c7e4ada713d228e4da73716',
        clientSecret: 'fd74dac2e8dc23c2e8047d7854be9e303afe85249301b14a91b657b36d1759ed'
    },
    cloudflare: {
        email: 'service@rensto.com',
        apiKey: 'd6921e18b648f2be2d2c8eeb969ed9fd1614c',
        zoneId: '031333b77c859d1dd4d4fd4afdc1b9bc'
    },
    vercel: {
        projectName: 'rensto-applications'
    }
};

class RenstoArchitectureSetup {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            webflow: {},
            vercel: {},
            dns: {},
            errors: []
        };
    }

    async setupCompleteArchitecture() {
        console.log('\n🎯 PHASE 1: WEBFLOW SITE ANALYSIS');
        await this.analyzeWebflowSite();

        console.log('\n🎯 PHASE 2: VERCEL APPLICATIONS SETUP');
        await this.setupVercelApplications();

        console.log('\n🎯 PHASE 3: DNS CONFIGURATION');
        await this.configureDNS();

        console.log('\n🎯 PHASE 4: INTEGRATION SETUP');
        await this.setupIntegrations();

        await this.saveResults();
        this.printSummary();
    }

    async analyzeWebflowSite() {
        try {
            console.log('🔍 Analyzing Webflow site...');

            // Get site information
            const siteResponse = await axios.get(`https://api.webflow.com/sites/${CONFIG.webflow.siteId}`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.webflow.apiToken}`,
                    'Accept': 'application/json'
                }
            });

            this.results.webflow.site = siteResponse.data;
            console.log('✅ Webflow site analyzed');
            console.log(`📍 Site: ${siteResponse.data.name}`);
            console.log(`🌐 Domain: ${siteResponse.data.shortName}.webflow.io`);

            // Get collections
            const collectionsResponse = await axios.get(`https://api.webflow.com/sites/${CONFIG.webflow.siteId}/collections`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.webflow.apiToken}`,
                    'Accept': 'application/json'
                }
            });

            this.results.webflow.collections = collectionsResponse.data;
            console.log(`📚 Collections found: ${collectionsResponse.data.length}`);

            // Get pages
            const pagesResponse = await axios.get(`https://api.webflow.com/sites/${CONFIG.webflow.siteId}/pages`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.webflow.apiToken}`,
                    'Accept': 'application/json'
                }
            });

            this.results.webflow.pages = pagesResponse.data;
            console.log(`📄 Pages found: ${pagesResponse.data.length}`);

        } catch (error) {
            console.log('❌ Webflow analysis failed:', error.response?.data || error.message);
            this.results.errors.push({ phase: 'webflow_analysis', error: error.message });
        }
    }

    async setupVercelApplications() {
        try {
            console.log('🚀 Setting up Vercel applications...');

            // Create admin dashboard project
            console.log('📊 Creating admin dashboard project...');
            await this.createVercelProject('rensto-admin-dashboard', 'admin.rensto.com');

            // Create customer portal project
            console.log('👥 Creating customer portal project...');
            await this.createVercelProject('rensto-customer-portal', 'portal.rensto.com');

            // Create API project
            console.log('🔌 Creating API project...');
            await this.createVercelProject('rensto-api', 'api.rensto.com');

            console.log('✅ Vercel applications setup completed');

        } catch (error) {
            console.log('❌ Vercel setup failed:', error.message);
            this.results.errors.push({ phase: 'vercel_setup', error: error.message });
        }
    }

    async createVercelProject(projectName, domain) {
        try {
            // This would typically use Vercel CLI or API
            // For now, we'll create the project structure
            const projectPath = `vercel-projects/${projectName}`;

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(projectPath, { recursive: true });
            }

            // Create basic project files
            const packageJson = {
                name: projectName,
                version: '1.0.0',
                private: true,
                scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start'
                },
                dependencies: {
                    next: 'latest',
                    react: 'latest',
                    'react-dom': 'latest'
                }
            };

            fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 2));

            // Create Next.js config
            const nextConfig = `module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};`;

            fs.writeFileSync(`${projectPath}/next.config.js`, nextConfig);

            this.results.vercel[projectName] = {
                path: projectPath,
                domain: domain,
                status: 'created'
            };

            console.log(`✅ Created ${projectName} for ${domain}`);

        } catch (error) {
            console.log(`❌ Failed to create ${projectName}:`, error.message);
            throw error;
        }
    }

    async configureDNS() {
        try {
            console.log('🌐 Configuring DNS records...');

            // Configure rensto.com to point to Webflow
            await this.updateDNSRecord('rensto.com', 'CNAME', `${CONFIG.webflow.siteId}.webflow.io`);

            // Configure subdomains for Vercel applications
            await this.updateDNSRecord('admin.rensto.com', 'CNAME', 'cname.vercel-dns.com');
            await this.updateDNSRecord('portal.rensto.com', 'CNAME', 'cname.vercel-dns.com');
            await this.updateDNSRecord('api.rensto.com', 'CNAME', 'cname.vercel-dns.com');

            console.log('✅ DNS configuration completed');

        } catch (error) {
            console.log('❌ DNS configuration failed:', error.message);
            this.results.errors.push({ phase: 'dns_configuration', error: error.message });
        }
    }

    async updateDNSRecord(name, type, content) {
        try {
            // First, check if record exists
            const listResponse = await axios.get(`https://api.cloudflare.com/client/v4/zones/${CONFIG.cloudflare.zoneId}/dns_records`, {
                headers: {
                    'X-Auth-Email': CONFIG.cloudflare.email,
                    'X-Auth-Key': CONFIG.cloudflare.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const existingRecord = listResponse.data.result.find(record =>
                record.name === name && record.type === type
            );

            if (existingRecord) {
                // Update existing record
                await axios.put(
                    `https://api.cloudflare.com/client/v4/zones/${CONFIG.cloudflare.zoneId}/dns_records/${existingRecord.id}`,
                    {
                        type: type,
                        name: name,
                        content: content,
                        proxied: false,
                        ttl: 1
                    },
                    {
                        headers: {
                            'X-Auth-Email': CONFIG.cloudflare.email,
                            'X-Auth-Key': CONFIG.cloudflare.apiKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`✅ Updated DNS record: ${name} → ${content}`);
            } else {
                // Create new record
                await axios.post(
                    `https://api.cloudflare.com/client/v4/zones/${CONFIG.cloudflare.zoneId}/dns_records`,
                    {
                        type: type,
                        name: name,
                        content: content,
                        proxied: false,
                        ttl: 1
                    },
                    {
                        headers: {
                            'X-Auth-Email': CONFIG.cloudflare.email,
                            'X-Auth-Key': CONFIG.cloudflare.apiKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`✅ Created DNS record: ${name} → ${content}`);
            }

            this.results.dns[name] = {
                type: type,
                content: content,
                status: 'configured'
            };

        } catch (error) {
            console.log(`❌ Failed to update DNS record ${name}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async setupIntegrations() {
        try {
            console.log('🔗 Setting up integrations...');

            // Create integration configuration
            const integrationConfig = {
                webflow: {
                    siteId: CONFIG.webflow.siteId,
                    apiToken: CONFIG.webflow.apiToken,
                    clientId: CONFIG.webflow.clientId,
                    endpoints: {
                        cms: `https://api.webflow.com/sites/${CONFIG.webflow.siteId}`,
                        collections: `https://api.webflow.com/sites/${CONFIG.webflow.siteId}/collections`,
                        items: `https://api.webflow.com/sites/${CONFIG.webflow.siteId}/collections`
                    }
                },
                vercel: {
                    projects: {
                        admin: 'rensto-admin-dashboard',
                        portal: 'rensto-customer-portal',
                        api: 'rensto-api'
                    },
                    domains: {
                        admin: 'admin.rensto.com',
                        portal: 'portal.rensto.com',
                        api: 'api.rensto.com'
                    }
                },
                cloudflare: {
                    zoneId: CONFIG.cloudflare.zoneId,
                    email: CONFIG.cloudflare.email
                }
            };

            fs.writeFileSync('config/rensto-architecture.json', JSON.stringify(integrationConfig, null, 2));
            console.log('✅ Integration configuration saved');

            this.results.integrations = integrationConfig;

        } catch (error) {
            console.log('❌ Integration setup failed:', error.message);
            this.results.errors.push({ phase: 'integration_setup', error: error.message });
        }
    }

    async saveResults() {
        const resultsPath = 'data/rensto-architecture-setup-results.json';
        fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
        console.log(`📊 Results saved to ${resultsPath}`);
    }

    printSummary() {
        console.log('\n🎉 RENSTO ARCHITECTURE SETUP COMPLETED!');
        console.log('=========================================');

        if (this.results.webflow.site) {
            console.log(`🌐 Webflow Site: ${this.results.webflow.site.name}`);
            console.log(`📚 Collections: ${this.results.webflow.collections?.length || 0}`);
            console.log(`📄 Pages: ${this.results.webflow.pages?.length || 0}`);
        }

        console.log('\n🚀 Vercel Applications:');
        Object.entries(this.results.vercel || {}).forEach(([name, config]) => {
            console.log(`   • ${name}: ${config.domain}`);
        });

        console.log('\n🌐 DNS Configuration:');
        Object.entries(this.results.dns || {}).forEach(([name, config]) => {
            console.log(`   • ${name} → ${config.content}`);
        });

        if (this.results.errors.length > 0) {
            console.log('\n⚠️ Issues encountered:');
            this.results.errors.forEach(error => {
                console.log(`   • ${error.phase}: ${error.error}`);
            });
        }

        console.log('\n📋 Next Steps:');
        console.log('1. Deploy Vercel applications with actual code');
        console.log('2. Configure Webflow custom domain');
        console.log('3. Set up authentication between applications');
        console.log('4. Configure webhooks for real-time updates');
    }
}

// Execute the setup
async function main() {
    const setup = new RenstoArchitectureSetup();
    await setup.setupCompleteArchitecture();
}

main().catch(console.error);
