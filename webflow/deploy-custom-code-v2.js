/**
 * Deploy Custom Code to Webflow using v2 API
 * Correct workflow: Register → Apply → Publish
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebflowCustomCodeDeployer {
    constructor() {
        this.siteId = '66c7e551a317e0e9c9f906d8';
        // Use Site API token for v2 API
        this.siteApiToken = process.env.WEBFLOW_API_TOKEN || '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
        this.baseUrl = 'https://api.webflow.com/v2';
        
        // Page IDs from previous discovery
        this.pageIds = {
            marketplace: '68ddb0fb5b6408d0687890dd',
            subscriptions: '68dfc41ffedc0a46e687c84b',
            readySolutions: '68dfc5266816931539f098d5',
            customSolutions: '68ddb0642b86f8d1a89ba166'
        };
    }

    /**
     * Register inline script (CSS) to site
     */
    async registerInlineScript(name, code, location = 'head') {
        console.log(`\n📝 Registering inline script: ${name}...`);
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/sites/${this.siteId}/custom_code`,
                {
                    name,
                    codeLocation: location,
                    sourceCode: code
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.siteApiToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`  ✅ Registered: ${response.data.id}`);
            return response.data;
        } catch (error) {
            console.error(`  ❌ Error: ${error.response?.data?.message || error.message}`);
            if (error.response?.data) {
                console.error(`     Details: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    /**
     * Register hosted script (external JS) to site
     */
    async registerHostedScript(name, url, location = 'body') {
        console.log(`\n📝 Registering hosted script: ${name}...`);
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/sites/${this.siteId}/custom_code`,
                {
                    name,
                    codeLocation: location,
                    hostedLocation: url
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.siteApiToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`  ✅ Registered: ${response.data.id}`);
            return response.data;
        } catch (error) {
            console.error(`  ❌ Error: ${error.response?.data?.message || error.message}`);
            if (error.response?.data) {
                console.error(`     Details: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    /**
     * Apply registered scripts to a page
     */
    async applyScriptsToPage(pageId, scriptIds) {
        console.log(`\n📄 Applying ${scriptIds.length} script(s) to page ${pageId.substring(0, 8)}...`);
        
        try {
            const scripts = scriptIds.map(id => ({ scriptId: id }));
            
            const response = await axios.put(
                `${this.baseUrl}/pages/${pageId}/custom_code`,
                { scripts },
                {
                    headers: {
                        'Authorization': `Bearer ${this.siteApiToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`  ✅ Applied scripts to page`);
            return response.data;
        } catch (error) {
            console.error(`  ❌ Error: ${error.response?.data?.message || error.message}`);
            if (error.response?.data) {
                console.error(`     Details: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    /**
     * Get registered scripts for site
     */
    async getRegisteredScripts() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/sites/${this.siteId}/custom_code`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.siteApiToken}`,
                        'Accept': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error(`  ❌ Error fetching scripts: ${error.message}`);
            return [];
        }
    }

    /**
     * Deploy UI fixes CSS
     */
    async deployUIFixes() {
        console.log('\n🎨 Deploying UI Fixes...');
        
        // Read CSS file
        const cssPath = path.join(__dirname, 'UI_FIXES_MINIMAL.txt');
        if (!fs.existsSync(cssPath)) {
            throw new Error('UI_FIXES_MINIMAL.txt not found');
        }

        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // Extract CSS from <style> tags if present
        const styleMatch = cssContent.match(/<style>([\s\S]*?)<\/style>/);
        if (styleMatch) {
            cssContent = styleMatch[1];
        } else if (cssContent.includes('<style>')) {
            // Handle unclosed style tag
            cssContent = cssContent.replace(/<style>/g, '').replace(/<\/style>/g, '').trim();
        }

        // Register as inline script
        const script = await this.registerInlineScript(
            'Rensto UI Fixes',
            `<style>${cssContent}</style>`,
            'head'
        );

        // Apply to all pages (site-wide via site settings)
        // Note: For site-wide, we might need to apply to site settings
        // For now, let's check what pages need it
        
        console.log('  ✅ UI Fixes registered (script ID:', script.id, ')');
        console.log('  ⚠️  Note: For site-wide CSS, may need to apply via site settings');
        
        return script;
    }

    /**
     * Deploy schema markup to a page
     */
    async deploySchemaMarkup(pageSlug, schemaFile) {
        console.log(`\n📄 Deploying Schema Markup to ${pageSlug}...`);
        
        const schemaPath = path.join(__dirname, 'deployment-snippets', schemaFile);
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaFile}`);
        }

        let schemaContent = fs.readFileSync(schemaPath, 'utf8');
        
        // Extract script content
        const scriptMatch = schemaContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (!scriptMatch) {
            throw new Error('No script tag found in schema file');
        }

        const scriptContent = `<script type="application/ld+json">${scriptMatch[1]}</script>`;

        // Register as inline script
        const script = await this.registerInlineScript(
            `Schema: ${pageSlug}`,
            scriptContent,
            'head'
        );

        // Apply to page
        const pageId = this.pageIds[pageSlug.replace('-', '')] || 
                      this.pageIds[pageSlug];
        
        if (!pageId) {
            throw new Error(`Page ID not found for: ${pageSlug}`);
        }

        await this.applyScriptsToPage(pageId, [script.id]);

        console.log(`  ✅ Schema deployed to ${pageSlug}`);
        return script;
    }

    /**
     * Publish site using v1 API
     */
    async publishSite() {
        console.log('\n📤 Publishing site...');
        
        try {
            const response = await axios.post(
                `https://api.webflow.com/v1/sites/${this.siteId}/publish`,
                {
                    domains: ['rensto.com', 'www.rensto.com']
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.siteApiToken}`,
                        'accept-version': '1.0.0',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.queued) {
                console.log('  ✅ Site publish queued successfully');
                return { success: true, queued: true };
            } else {
                console.log(`  ⚠️  Response: ${JSON.stringify(response.data)}`);
                return { success: false, response: response.data };
            }
        } catch (error) {
            console.error(`  ❌ Publish error: ${error.response?.data?.message || error.message}`);
            return { success: false, error: error.message };
        }
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new WebflowCustomCodeDeployer();
    
    (async () => {
        try {
            // Test: Get existing scripts
            console.log('🔍 Checking existing scripts...');
            const existing = await deployer.getRegisteredScripts();
            console.log(`   Found ${existing.length || 0} registered scripts`);
            
            // Deploy UI fixes
            await deployer.deployUIFixes();
            
            // Deploy schema markup for one page as test
            // await deployer.deploySchemaMarkup('marketplace', 'marketplace-schema-head-code.txt');
            
            // Publish
            await deployer.publishSite();
            
            console.log('\n✅ Deployment complete!');
        } catch (error) {
            console.error('\n❌ Deployment failed:', error.message);
            process.exit(1);
        }
    })();
}

export default WebflowCustomCodeDeployer;

