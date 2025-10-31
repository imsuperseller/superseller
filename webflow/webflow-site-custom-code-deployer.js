#!/usr/bin/env node

/**
 * Webflow Site Custom Code Deployer
 * Uses Webflow v2 Site Custom Code API to register scripts site-wide
 * This works without Designer Extension!
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebflowSiteCustomCodeDeployer {
    constructor() {
        this.siteId = '66c7e551a317e0e9c9f906d8';
        this.apiToken = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
        this.results = {
            scripts: [],
            errors: []
        };
    }

    async getExistingCustomCode() {
        console.log('\n📋 Checking Existing Site Custom Code...');
        try {
            const response = await axios.get(
                `https://api.webflow.com/v2/sites/${this.siteId}/custom_code`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Accept-Version': '2.0',
                        'Accept': 'application/json'
                    }
                }
            );

            const scripts = response.data.scripts || [];
            console.log(`  ✅ Found ${scripts.length} existing script(s)`);
            
            scripts.forEach(script => {
                console.log(`    - ${script.id}: ${script.location} (${script.sourceType})`);
            });

            return scripts;
        } catch (error) {
            console.log(`  ⚠️  Error: ${error.response?.data?.message || error.message}`);
            return [];
        }
    }

    async registerScript(scriptUrl, location = 'bodyEnd') {
        console.log(`\n📝 Registering Script: ${scriptUrl.substring(0, 50)}...`);
        
        try {
            const response = await axios.post(
                `https://api.webflow.com/v2/sites/${this.siteId}/custom_code`,
                {
                    canCopy: true,
                    sourceType: 'url',
                    location: location,
                    code: `<script src="${scriptUrl}"></script>`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Accept-Version': '2.0',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.id) {
                console.log(`  ✅ Script registered: ${response.data.id}`);
                this.results.scripts.push({
                    id: response.data.id,
                    url: scriptUrl,
                    location: location,
                    success: true
                });
                return response.data;
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            console.log(`  ❌ Error: ${errorMsg}`);
            
            // Check if script already exists
            if (errorMsg.includes('already exists') || error.response?.status === 409) {
                console.log(`  ⚠️  Script may already be registered`);
            }
            
            this.results.errors.push({ script: scriptUrl, error: errorMsg });
            return null;
        }
    }

    async deployStripeCore() {
        console.log('\n💳 Deploying Stripe Core Script...');
        
        const coreUrl = 'https://rensto-webflow-scripts.vercel.app/shared/stripe-core.js';
        return await this.registerScript(coreUrl, 'bodyEnd');
    }

    async deployServicePageScripts() {
        console.log('\n📄 Deploying Service Page Scripts...');
        
        const scripts = [
            {
                name: 'Marketplace',
                url: 'https://rensto-webflow-scripts.vercel.app/marketplace/checkout.js',
                location: 'bodyEnd'
            },
            {
                name: 'Subscriptions',
                url: 'https://rensto-webflow-scripts.vercel.app/subscriptions/checkout.js?v=2', // Cache-busting
                location: 'bodyEnd'
            },
            {
                name: 'Ready Solutions',
                url: 'https://rensto-webflow-scripts.vercel.app/ready-solutions/checkout.js',
                location: 'bodyEnd'
            },
            {
                name: 'Custom Solutions',
                url: 'https://rensto-webflow-scripts.vercel.app/custom-solutions/checkout.js',
                location: 'bodyEnd'
            }
        ];

        const results = [];
        for (const script of scripts) {
            console.log(`\n  📝 ${script.name}...`);
            const result = await this.registerScript(script.url, script.location);
            if (result) {
                results.push({ name: script.name, id: result.id });
            }
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return results;
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
                console.log('  ✅ Site publish queued');
                return { success: true, queued: true };
            }
        } catch (error) {
            console.log(`  ❌ Publish error: ${error.response?.data?.message || error.message}`);
            if (error.response?.status === 404) {
                console.log('    💡 May need Site API token or different endpoint');
            }
            return { success: false, error: error.message };
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            siteId: this.siteId,
            scriptsRegistered: this.results.scripts.length,
            scripts: this.results.scripts,
            errors: this.results.errors
        };

        const reportPath = path.join(__dirname, 'deployment-snippets', 'SITE_CUSTOM_CODE_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📊 Report saved: ${reportPath}`);

        return report;
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 SITE CUSTOM CODE DEPLOYMENT SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`\n✅ Scripts Registered: ${this.results.scripts.length}`);
        this.results.scripts.forEach(script => {
            console.log(`  ✅ ${script.url.substring(0, 60)}...`);
        });

        if (this.results.errors.length > 0) {
            console.log(`\n⚠️  Errors: ${this.results.errors.length}`);
            this.results.errors.forEach(err => {
                console.log(`  ⚠️  ${err.script}: ${err.error}`);
            });
        }

        console.log('\n📋 Note: Site Custom Code applies to ALL pages');
        console.log('   For page-specific code, use manual deployment or Designer Extension');
        console.log('='.repeat(60) + '\n');
    }

    async run() {
        console.log('🚀 Webflow Site Custom Code Deployer');
        console.log('='.repeat(60));
        console.log(`Site ID: ${this.siteId}`);
        console.log('Using: Webflow v2 Site Custom Code API');
        
        await this.getExistingCustomCode();
        await this.deployStripeCore();
        await this.deployServicePageScripts();
        await this.publishSite();
        
        const report = this.generateReport();
        this.printSummary();
        
        return report;
    }
}

// Execute
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('webflow-site-custom-code-deployer')) {
    const deployer = new WebflowSiteCustomCodeDeployer();
    deployer.run().catch(console.error);
}

export default WebflowSiteCustomCodeDeployer;

