#!/usr/bin/env node

/**
 * Webflow Automated Deployment
 * Uses Webflow API + Designer Extension to deploy homepage, scripts, and schema markup
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebflowDeployer {
    constructor() {
        this.siteId = '66c7e551a317e0e9c9f906d8';
        this.apiToken = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
        this.designerExtensionUrl = 'https://68df6e8d3098a65fadc8f111.webflow-ext.com';
        this.clientId = '9019376a6596d4dff6bc765563e07aee92469e257a7cfefd7c8839ccc3773edb';
        this.results = {
            pages: {},
            deployments: [],
            errors: []
        };
    }

    async listPages() {
        console.log('\n📄 Listing Webflow Pages...');
        try {
            const response = await axios.get(
                `https://api.webflow.com/v2/sites/${this.siteId}/pages`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Accept-Version': '2.0',
                        'Content-Type': 'application/json'
                    }
                }
            );

            const pages = response.data.pages || [];
            console.log(`  ✅ Found ${pages.length} pages`);
            
            // Store page IDs by slug
            pages.forEach(page => {
                const slug = page.slug || '';
                console.log(`    ${slug} → ${page.id}`);
                this.results.pages[slug] = {
                    id: page.id,
                    name: page.name,
                    slug: slug
                };
            });

            return pages;
        } catch (error) {
            console.log(`  ❌ Error: ${error.response?.data?.message || error.message}`);
            this.results.errors.push({ action: 'listPages', error: error.message });
            return [];
        }
    }

    async getPageContent(pageId) {
        try {
            const response = await axios.get(
                `${this.designerExtensionUrl}/api/designer/page-content/${pageId}`,
                { timeout: 5000 }
            );
            return response.data;
        } catch (error) {
            console.log(`    ⚠️  Designer Extension not accessible: ${error.message}`);
            return null;
        }
    }

    async updatePageCustomCode(pageId, customCodeType, content) {
        console.log(`  📝 Updating ${customCodeType} for page ${pageId.substring(0, 8)}...`);
        
        try {
            // Try Designer Extension first
            const extResponse = await axios.put(
                `${this.designerExtensionUrl}/api/designer/page-content/${pageId}`,
                {
                    customCode: {
                        [customCodeType]: content
                    }
                },
                { timeout: 5000 }
            );

            if (extResponse.data.success) {
                console.log(`    ✅ Updated via Designer Extension`);
                return { success: true, method: 'designer-extension' };
            }
        } catch (error) {
            console.log(`    ⚠️  Designer Extension unavailable, using fallback`);
        }

        // Fallback: Note that page custom code can't be updated via Data API
        // This requires manual deployment or active Designer Extension
        console.log(`    ⚠️  Page-level custom code requires Designer Extension or manual deployment`);
        return { success: false, method: 'manual-required' };
    }

    async deployHomepage() {
        console.log('\n🏠 Deploying Homepage...');
        
        const homepage = this.results.pages[''] || this.results.pages['home'] || Object.values(this.results.pages).find(p => p.slug === '/' || !p.slug);
        
        if (!homepage) {
            console.log('  ❌ Homepage not found');
            return;
        }

        const homepagePath = path.join(__dirname, 'deployment-snippets', 'homepage-body-code.txt');
        if (!fs.existsSync(homepagePath)) {
            console.log('  ❌ Homepage content file not found');
            return;
        }

        let content = fs.readFileSync(homepagePath, 'utf8');
        // Remove comment lines
        content = content.replace(/^<!--.*?-->\n?/gm, '').trim();

        console.log(`  📄 Homepage content: ${content.length} characters`);
        console.log(`  🆔 Page ID: ${homepage.id}`);

        const result = await this.updatePageCustomCode(homepage.id, 'bodyEnd', content);
        this.results.deployments.push({
            page: 'homepage',
            type: 'body-code',
            result
        });
    }

    async deployServicePageScripts(pageSlug, scriptFile) {
        console.log(`\n📄 Deploying Scripts to ${pageSlug}...`);
        
        const page = this.results.pages[pageSlug];
        if (!page) {
            console.log(`  ❌ Page not found: ${pageSlug}`);
            return;
        }

        const scriptPath = path.join(__dirname, 'deployment-snippets', scriptFile);
        if (!fs.existsSync(scriptPath)) {
            console.log(`  ❌ Script file not found: ${scriptFile}`);
            return;
        }

        let content = fs.readFileSync(scriptPath, 'utf8');
        // Remove comment lines, keep script tags
        content = content.replace(/^<!--.*?-->\n?/gm, '').trim();

        console.log(`  📝 Scripts: ${content.length} characters`);
        console.log(`  🆔 Page ID: ${page.id}`);

        const result = await this.updatePageCustomCode(page.id, 'bodyEnd', content);
        this.results.deployments.push({
            page: pageSlug,
            type: 'scripts',
            result
        });
    }

    async deploySchemaMarkup(pageSlug, schemaFile) {
        console.log(`\n📊 Deploying Schema Markup to ${pageSlug}...`);
        
        const page = this.results.pages[pageSlug];
        if (!page) {
            console.log(`  ❌ Page not found: ${pageSlug}`);
            return;
        }

        const schemaPath = path.join(__dirname, 'deployment-snippets', schemaFile);
        if (!fs.existsSync(schemaPath)) {
            console.log(`  ❌ Schema file not found: ${schemaFile}`);
            return;
        }

        let content = fs.readFileSync(schemaPath, 'utf8');
        // Remove comment lines
        content = content.replace(/^<!--.*?-->\n?/gm, '').trim();

        console.log(`  📝 Schema: ${content.length} characters`);
        console.log(`  🆔 Page ID: ${page.id}`);

        const result = await this.updatePageCustomCode(page.id, 'headCode', content);
        this.results.deployments.push({
            page: pageSlug,
            type: 'schema',
            result
        });
    }

    async publishSite() {
        console.log('\n📤 Publishing Webflow Site...');
        
        try {
            const response = await axios.post(
                `https://api.webflow.com/v1/sites/${this.siteId}/publish`,
                { domains: ['rensto.com', 'www.rensto.com'] },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Accept-Version': '1.0.0',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.queued) {
                console.log('  ✅ Site publish queued successfully');
                this.results.publish = { success: true, queued: true };
            } else {
                console.log(`  ⚠️  Unexpected response: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            console.log(`  ❌ Publish error: ${error.response?.data?.message || error.message}`);
            this.results.errors.push({ action: 'publish', error: error.message });
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            siteId: this.siteId,
            pagesFound: Object.keys(this.results.pages).length,
            deployments: this.results.deployments,
            errors: this.results.errors,
            publish: this.results.publish
        };

        const reportPath = path.join(__dirname, 'deployment-snippets', 'WEBFLOW_DEPLOYMENT_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Report saved: ${reportPath}`);

        return report;
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 DEPLOYMENT SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`\n📄 Pages Found: ${Object.keys(this.results.pages).length}`);
        console.log(`🚀 Deployments Attempted: ${this.results.deployments.length}`);
        
        const successful = this.results.deployments.filter(d => d.result.success).length;
        const manual = this.results.deployments.filter(d => !d.result.success).length;
        
        console.log(`✅ Successful: ${successful}`);
        console.log(`⚠️  Manual Required: ${manual}`);
        
        if (manual > 0) {
            console.log('\n📝 Manual Deployment Required:');
            this.results.deployments
                .filter(d => !d.result.success)
                .forEach(d => {
                    console.log(`  - ${d.page} (${d.type})`);
                });
        }

        if (this.results.publish?.success) {
            console.log('\n✅ Site publish queued');
        }

        console.log('\n📁 All deployment snippets ready in: webflow/deployment-snippets/');
        console.log('='.repeat(60) + '\n');
    }

    async run() {
        console.log('🚀 Webflow Automated Deployment');
        console.log('='.repeat(60));
        console.log(`Site ID: ${this.siteId}`);
        console.log(`Designer Extension: ${this.designerExtensionUrl}`);
        
        await this.listPages();
        
        // Deploy homepage
        await this.deployHomepage();
        
        // Deploy service page scripts
        await this.deployServicePageScripts('subscriptions', 'subscriptions-scripts.txt');
        await this.deployServicePageScripts('marketplace', 'marketplace-scripts.txt');
        await this.deployServicePageScripts('ready-solutions', 'ready-solutions-scripts.txt');
        await this.deployServicePageScripts('custom-solutions', 'custom-solutions-scripts.txt');
        
        // Deploy schema markup
        await this.deploySchemaMarkup('subscriptions', 'subscriptions-schema-head-code.txt');
        await this.deploySchemaMarkup('marketplace', 'marketplace-schema-head-code.txt');
        await this.deploySchemaMarkup('ready-solutions', 'ready-solutions-schema-head-code.txt');
        await this.deploySchemaMarkup('custom-solutions', 'custom-solutions-schema-head-code.txt');
        
        // Publish site
        await this.publishSite();
        
        const report = this.generateReport();
        this.printSummary();
        
        return report;
    }
}

// Execute
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('webflow-deployer')) {
    const deployer = new WebflowDeployer();
    deployer.run().catch(console.error);
}

export default WebflowDeployer;

