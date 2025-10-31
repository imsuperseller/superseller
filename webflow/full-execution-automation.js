#!/usr/bin/env node

/**
 * Full Execution Automation
 * Uses Vercel, Webflow, GitHub, Cloudflare, n8n APIs to execute deployments
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FullExecutionAutomation {
    constructor() {
        this.siteId = '66c7e551a317e0e9c9f906d8';
        this.results = {
            webflow: {},
            vercel: {},
            github: {},
            cloudflare: {},
            n8n: {},
            deployments: []
        };
    }

    async loadCredentials() {
        // Try to load from environment or mcp.json
        let mcpConfig = {};
        try {
            const mcpPath = '/Users/shaifriedman/.cursor/mcp.json';
            if (fs.existsSync(mcpPath)) {
                const mcpContent = fs.readFileSync(mcpPath, 'utf8');
                mcpConfig = JSON.parse(mcpContent);
            }
        } catch (e) {
            // Ignore if can't read
        }

        const webflowEnv = mcpConfig?.mcpServers?.webflow?.env;
        const n8nEnv = mcpConfig?.mcpServers?.['n8n-rensto']?.env;
        
        const webflowToken = process.env.WEBFLOW_API_TOKEN || 
                            process.env.WEBFLOW_SITE_API_TOKEN ||
                            webflowEnv?.WEBFLOW_API_TOKEN;
        
        const vercelToken = process.env.VERCEL_TOKEN;
        const githubToken = process.env.GITHUB_TOKEN;
        const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
        const n8nApiKey = process.env.N8N_API_KEY || n8nEnv?.N8N_API_KEY;
        
        this.credentials = {
            webflow: webflowToken,
            vercel: vercelToken,
            github: githubToken,
            cloudflare: cloudflareToken,
            n8n: n8nApiKey,
            n8nUrl: n8nEnv?.N8N_API_URL || 'http://173.254.201.134:5678'
        };

        console.log('🔑 Credentials Status:');
        console.log(`  Webflow: ${webflowToken ? '✅' : '❌'}`);
        console.log(`  Vercel: ${vercelToken ? '✅' : '❌'}`);
        console.log(`  GitHub: ${githubToken ? '✅' : '❌'}`);
        console.log(`  Cloudflare: ${cloudflareToken ? '✅' : '❌'}`);
        console.log(`  n8n: ${n8nApiKey ? '✅' : '❌'}`);
    }

    async deployToWebflow() {
        console.log('\n🎨 Deploying to Webflow...');
        
        if (!this.credentials.webflow) {
            console.log('  ⚠️  Webflow token not available - skipping');
            return;
        }

        try {
            // 1. Deploy homepage content
            const homepagePath = path.join(__dirname, 'deployment-snippets', 'homepage-body-code.txt');
            if (fs.existsSync(homepagePath)) {
                const homepageContent = fs.readFileSync(homepagePath, 'utf8');
                // Extract just the HTML (skip comments)
                const htmlMatch = homepageContent.match(/<!-- Homepage Content -->[\s\S]*?(?=<\/script>|$)/);
                const htmlContent = htmlMatch ? homepageContent.split('<!-- Homepage Content -->')[1].trim() : homepageContent;
                
                console.log('  📄 Homepage content ready (45K chars)');
                this.results.webflow.homepage = { ready: true, size: htmlContent.length };
                // Note: Webflow API doesn't support page custom code updates via Data API
                // This requires Designer API which needs browser extension
                console.log('  ⚠️  Homepage deployment requires Webflow Designer (manual)');
            }

            // 2. Deploy schema markup via site custom code (if possible)
            const schemaFiles = [
                'marketplace-schema-head-code.txt',
                'subscriptions-schema-head-code.txt',
                'ready-solutions-schema-head-code.txt',
                'custom-solutions-schema-head-code.txt'
            ];

            for (const schemaFile of schemaFiles) {
                const schemaPath = path.join(__dirname, 'deployment-snippets', schemaFile);
                if (fs.existsSync(schemaPath)) {
                    console.log(`  ✅ ${schemaFile} ready for deployment`);
                    // Note: Schema markup requires page-level custom code (not site-level)
                    // This requires Designer API
                }
            }

            // 3. Try to publish site after changes
            try {
                const publishResponse = await axios.post(
                    `https://api.webflow.com/v1/sites/${this.siteId}/publish`,
                    { domains: ['rensto.com', 'www.rensto.com'] },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.credentials.webflow}`,
                            'Accept-Version': '1.0.0',
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (publishResponse.data.queued) {
                    console.log('  ✅ Site publish queued');
                    this.results.webflow.publish = { success: true };
                }
            } catch (error) {
                console.log(`  ⚠️  Publish error: ${error.message}`);
            }

        } catch (error) {
            console.log(`  ❌ Webflow deployment error: ${error.message}`);
            this.results.webflow.error = error.message;
        }
    }

    async checkVercelProjects() {
        console.log('\n🚀 Checking Vercel Projects...');
        
        if (!this.credentials.vercel) {
            console.log('  ⚠️  Vercel token not available - skipping');
            return;
        }

        try {
            // List all projects
            const projectsResponse = await axios.get('https://api.vercel.com/v9/projects', {
                headers: {
                    'Authorization': `Bearer ${this.credentials.vercel}`
                }
            });

            const projects = projectsResponse.data.projects || [];
            console.log(`  Found ${projects.length} projects`);
            
            projects.forEach(project => {
                const name = project.name;
                const domains = project.targets?.production?.alias || [];
                console.log(`  📦 ${name}: ${domains.length > 0 ? domains.join(', ') : 'No domains'}`);
                
                // Check for rensto-main-website conflict
                if (name === 'rensto-main-website' && domains.some(d => d.includes('rensto.com'))) {
                    console.log(`    ⚠️  CONFLICT: ${name} has rensto.com domain!`);
                    this.results.vercel.conflicts = this.results.vercel.conflicts || [];
                    this.results.vercel.conflicts.push({ project: name, domains });
                }
            });

            this.results.vercel.projects = projects.map(p => ({
                name: p.name,
                id: p.id,
                domains: p.targets?.production?.alias || []
            }));

            // Try to clear cache for rensto-webflow-scripts
            const scriptsProject = projects.find(p => p.name === 'rensto-webflow-scripts');
            if (scriptsProject) {
                console.log(`  🔄 Attempting to clear cache for ${scriptsProject.name}...`);
                // Note: Vercel doesn't have a direct cache clear API
                // We can trigger a redeploy instead
                try {
                    const redeployResponse = await axios.post(
                        `https://api.vercel.com/v13/deployments`,
                        {
                            name: scriptsProject.name,
                            target: 'production'
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${this.credentials.vercel}`
                            }
                        }
                    );
                    console.log(`  ✅ Redeployment triggered`);
                    this.results.vercel.redeploy = { success: true, deploymentId: redeployResponse.data.id };
                } catch (error) {
                    console.log(`  ⚠️  Redeploy error: ${error.message}`);
                }
            }

        } catch (error) {
            console.log(`  ❌ Vercel check error: ${error.message}`);
            this.results.vercel.error = error.message;
        }
    }

    async checkGitHubStatus() {
        console.log('\n🐙 Checking GitHub Status...');
        
        try {
            // Check rensto-webflow-scripts repo
            const scriptsRepoResponse = await axios.get(
                'https://api.github.com/repos/imsuperseller/rensto-webflow-scripts/commits/main',
                {
                    headers: this.credentials.github ? {
                        'Authorization': `Bearer ${this.credentials.github}`
                    } : {}
                }
            );

            const latestCommit = scriptsRepoResponse.data;
            console.log(`  ✅ Latest commit: ${latestCommit.sha.substring(0, 7)}`);
            console.log(`     Message: ${latestCommit.commit.message.split('\n')[0]}`);
            console.log(`     Date: ${latestCommit.commit.committer.date}`);
            
            this.results.github.scriptsRepo = {
                sha: latestCommit.sha,
                message: latestCommit.commit.message,
                date: latestCommit.commit.committer.date
            };

        } catch (error) {
            console.log(`  ⚠️  GitHub check: ${error.message}`);
        }
    }

    async checkCloudflareDNS() {
        console.log('\n☁️  Checking Cloudflare DNS...');
        
        if (!this.credentials.cloudflare) {
            console.log('  ⚠️  Cloudflare token not available - skipping');
            return;
        }

        try {
            // Get zone ID for rensto.com
            const zonesResponse = await axios.get('https://api.cloudflare.com/client/v4/zones', {
                headers: {
                    'Authorization': `Bearer ${this.credentials.cloudflare}`,
                    'Content-Type': 'application/json'
                },
                params: { name: 'rensto.com' }
            });

            if (zonesResponse.data.result && zonesResponse.data.result.length > 0) {
                const zoneId = zonesResponse.data.result[0].id;
                console.log(`  ✅ Zone found: ${zoneId}`);

                // Get DNS records
                const dnsResponse = await axios.get(
                    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.credentials.cloudflare}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const records = dnsResponse.data.result || [];
                console.log(`  📋 Found ${records.length} DNS records`);
                
                records.forEach(record => {
                    if (record.name === 'rensto.com' || record.name === 'www.rensto.com') {
                        const target = record.content || record.target || 'N/A';
                        console.log(`  ${record.name} → ${target} (${record.type})`);
                        this.results.cloudflare.records = this.results.cloudflare.records || [];
                        this.results.cloudflare.records.push({
                            name: record.name,
                            type: record.type,
                            target: target
                        });
                    }
                });

            } else {
                console.log('  ⚠️  Zone not found');
            }

        } catch (error) {
            console.log(`  ⚠️  Cloudflare check: ${error.message}`);
        }
    }

    async checkN8nWebhooks() {
        console.log('\n⚙️  Checking n8n Webhooks...');
        
        if (!this.credentials.n8n) {
            console.log('  ⚠️  n8n API key not available - skipping');
            return;
        }

        try {
            // Check webhook endpoint
            const webhookUrl = 'https://n8n.rensto.com/webhook/customer-data-sync';
            const testPayload = {
                type: 'health_check',
                timestamp: new Date().toISOString()
            };

            const webhookResponse = await axios.post(webhookUrl, testPayload, {
                timeout: 5000,
                validateStatus: () => true // Don't throw on any status
            });

            if (webhookResponse.status === 200 || webhookResponse.status === 201) {
                console.log(`  ✅ Webhook responsive: ${webhookResponse.status}`);
                this.results.n8n.webhook = { status: webhookResponse.status, responsive: true };
            } else {
                console.log(`  ⚠️  Webhook returned: ${webhookResponse.status}`);
                this.results.n8n.webhook = { status: webhookResponse.status, responsive: false };
            }

        } catch (error) {
            console.log(`  ⚠️  n8n webhook check: ${error.message}`);
            this.results.n8n.error = error.message;
        }
    }

    async publishWebflowSite() {
        console.log('\n📤 Publishing Webflow Site...');
        
        if (!this.credentials.webflow) {
            console.log('  ⚠️  Webflow token not available');
            return;
        }

        try {
            // Use v1 API for publishing
            const publishResponse = await axios.post(
                `https://api.webflow.com/v1/sites/${this.siteId}/publish`,
                { domains: ['rensto.com', 'www.rensto.com'] },
                {
                    headers: {
                        'Authorization': `Bearer ${this.credentials.webflow}`,
                        'Accept-Version': '1.0.0',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (publishResponse.data.queued) {
                console.log('  ✅ Site publish queued successfully');
                this.results.webflow.publish = { success: true, queued: true };
            } else {
                console.log(`  ⚠️  Publish response: ${JSON.stringify(publishResponse.data)}`);
            }
        } catch (error) {
            console.log(`  ❌ Publish error: ${error.response?.data?.message || error.message}`);
            if (error.response?.status === 401) {
                console.log('    💡 Token may need refresh or wrong token type');
            }
        }
    }

    generateDeploymentReport() {
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            summary: {
                webflow: Object.keys(this.results.webflow).length > 0,
                vercel: Object.keys(this.results.vercel).length > 0,
                github: Object.keys(this.results.github).length > 0,
                cloudflare: Object.keys(this.results.cloudflare).length > 0,
                n8n: Object.keys(this.results.n8n).length > 0
            }
        };

        const reportPath = path.join(__dirname, 'deployment-snippets', 'FULL_EXECUTION_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Report saved: ${reportPath}`);

        return report;
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 FULL EXECUTION SUMMARY');
        console.log('='.repeat(60));
        
        console.log('\n✅ Completed:');
        if (this.results.webflow.homepage) console.log('  ✅ Homepage content prepared');
        if (this.results.webflow.publish) console.log('  ✅ Webflow site publish queued');
        if (this.results.vercel.projects) console.log(`  ✅ ${this.results.vercel.projects.length} Vercel projects checked`);
        if (this.results.github.scriptsRepo) console.log('  ✅ GitHub repo verified');
        if (this.results.cloudflare.records) console.log('  ✅ Cloudflare DNS checked');
        if (this.results.n8n.webhook) console.log('  ✅ n8n webhook checked');

        console.log('\n⚠️  Manual Actions Required:');
        console.log('  1. Deploy homepage HTML in Webflow Designer');
        console.log('  2. Deploy schema markup to service pages');
        console.log('  3. Add cache-busting to subscriptions page');
        console.log('  4. Verify Vercel project conflicts if found');

        console.log('\n📁 All deployment snippets ready in: webflow/deployment-snippets/');
        console.log('='.repeat(60) + '\n');
    }

    async run() {
        console.log('🚀 Full Execution Automation');
        console.log('='.repeat(60));
        
        await this.loadCredentials();
        await this.deployToWebflow();
        await this.checkVercelProjects();
        await this.checkGitHubStatus();
        await this.checkCloudflareDNS();
        await this.checkN8nWebhooks();
        
        const report = this.generateDeploymentReport();
        this.printSummary();
        
        return report;
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('full-execution-automation')) {
    const automation = new FullExecutionAutomation();
    automation.run().catch(console.error);
}

export default FullExecutionAutomation;

