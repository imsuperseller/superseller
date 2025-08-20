#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🌐 ADD VERCEL CUSTOM DOMAIN
 * Add tax4us.rensto.com to Vercel project for subdomain routing
 */

class VercelDomainManager {
    constructor() {
        this.config = {
            vercelToken: process.env.VERCEL_TOKEN || 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2', // Using Cloudflare token as placeholder
            projectId: 'rensto-business-system',
            teamId: 'team_9b9e359', // From the Vercel URL
            baseUrl: 'https://api.vercel.com/v1'
        };
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.config.vercelToken}`,
            'Content-Type': 'application/json'
        };
    }

    async addCustomDomain(domain) {
        console.log(`🌐 Adding custom domain to Vercel: ${domain}\n`);

        try {
            const response = await axios.post(
                `${this.config.baseUrl}/domains`,
                {
                    name: domain,
                    projectId: this.config.projectId,
                    teamId: this.config.teamId
                },
                { headers: this.getHeaders() }
            );

            if (response.data) {
                console.log(`✅ Domain added successfully: ${domain}`);
                console.log(`📝 Domain ID: ${response.data.id}`);
                console.log(`📊 Status: ${response.data.status}`);

                if (response.data.verification) {
                    console.log(`🔍 Verification required: ${response.data.verification.type}`);
                }

                return response.data;
            } else {
                throw new Error('Failed to add domain');
            }
        } catch (error) {
            console.error(`❌ Failed to add domain:`, error.response?.data || error.message);
            return null;
        }
    }

    async listDomains() {
        try {
            const response = await axios.get(
                `${this.config.baseUrl}/domains?teamId=${this.config.teamId}`,
                { headers: this.getHeaders() }
            );

            if (response.data && response.data.domains) {
                console.log('📋 Current Vercel domains:');
                response.data.domains.forEach(domain => {
                    console.log(`   - ${domain.name} (${domain.status})`);
                });
                return response.data.domains;
            }
        } catch (error) {
            console.error('❌ Failed to list domains:', error.response?.data || error.message);
        }
        return [];
    }

    async getProjectInfo() {
        try {
            const response = await axios.get(
                `${this.config.baseUrl}/projects/${this.config.projectId}?teamId=${this.config.teamId}`,
                { headers: this.getHeaders() }
            );

            if (response.data) {
                console.log('📊 Project Information:');
                console.log(`   Name: ${response.data.name}`);
                console.log(`   ID: ${response.data.id}`);
                console.log(`   Framework: ${response.data.framework}`);
                console.log(`   Domains: ${response.data.domains?.join(', ') || 'None'}`);
                return response.data;
            }
        } catch (error) {
            console.error('❌ Failed to get project info:', error.response?.data || error.message);
        }
        return null;
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const manager = new VercelDomainManager();

    try {
        console.log('🌐 Vercel Custom Domain Manager\n');

        // Get project info
        await manager.getProjectInfo();
        console.log('');

        // List current domains
        await manager.listDomains();
        console.log('');

        // Add tax4us.rensto.com domain
        const domain = 'tax4us.rensto.com';
        const result = await manager.addCustomDomain(domain);

        if (result) {
            console.log('\n🎯 Next steps:');
            console.log('1. Wait for DNS verification (can take up to 24 hours)');
            console.log('2. Test: https://tax4us.rensto.com');
            console.log('3. If verification fails, check DNS records are correct');
            console.log('4. The domain should now route to the Vercel project');
        } else {
            console.log('\n⚠️  Domain addition failed. You may need to:');
            console.log('1. Check Vercel API token permissions');
            console.log('2. Verify DNS records are pointing to Vercel');
            console.log('3. Add domain manually in Vercel dashboard');
        }

    } catch (error) {
        console.error('❌ Domain management failed:', error.message);
        process.exit(1);
    }
}

main();
