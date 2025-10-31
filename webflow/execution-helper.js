#!/usr/bin/env node

/**
 * Webflow Deployment Execution Helper
 * Verifies current state and prepares deployment-ready code snippets
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class WebflowDeploymentHelper {
    constructor() {
        this.siteId = '66c7e551a317e0e9c9f906d8';
        this.cdnUrl = 'https://rensto-webflow-scripts.vercel.app';
        this.results = {
            cdn: {},
            files: {},
            ready: []
        };
    }

    async checkCDNStatus() {
        console.log('\n🔍 Checking CDN Status...');
        
        const scripts = [
            { name: 'subscriptions', path: '/subscriptions/checkout.js', expected: 2065 },
            { name: 'marketplace', path: '/marketplace/checkout.js', expected: 1200 },
            { name: 'ready-solutions', path: '/ready-solutions/checkout.js', expected: 1200 },
            { name: 'custom-solutions', path: '/custom-solutions/checkout.js', expected: 1200 },
            { name: 'stripe-core', path: '/shared/stripe-core.js', expected: 8500 }
        ];

        for (const script of scripts) {
            try {
                const url = `${this.cdnUrl}${script.path}`;
                const response = await this.fetch(url);
                const size = response.length;
                const hasPlanExtraction = response.includes('Extract plan from href');
                
                this.results.cdn[script.name] = {
                    size,
                    expected: script.expected,
                    matches: size >= script.expected * 0.9,
                    hasPlanExtraction: script.name === 'subscriptions' ? hasPlanExtraction : null,
                    url
                };

                console.log(`  ${script.name}: ${size} bytes ${size >= script.expected * 0.9 ? '✅' : '⚠️'}`);
                
                if (script.name === 'subscriptions' && !hasPlanExtraction) {
                    console.log(`    ⚠️  Missing plan extraction code - cache issue`);
                }
            } catch (error) {
                console.log(`  ${script.name}: ❌ Error - ${error.message}`);
                this.results.cdn[script.name] = { error: error.message };
            }
        }
    }

    async fetch(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            }).on('error', reject);
        });
    }

    prepareScriptSnippets() {
        console.log('\n📝 Preparing Deployment Snippets...');
        
        const pages = [
            {
                name: 'Subscriptions',
                slug: '/subscriptions',
                scripts: [
                    `${this.cdnUrl}/shared/stripe-core.js`,
                    `${this.cdnUrl}/subscriptions/checkout.js?v=2`  // Cache-busting added
                ]
            },
            {
                name: 'Marketplace',
                slug: '/marketplace',
                scripts: [
                    `${this.cdnUrl}/shared/stripe-core.js`,
                    `${this.cdnUrl}/marketplace/checkout.js`
                ]
            },
            {
                name: 'Ready Solutions',
                slug: '/ready-solutions',
                scripts: [
                    `${this.cdnUrl}/shared/stripe-core.js`,
                    `${this.cdnUrl}/ready-solutions/checkout.js`
                ]
            },
            {
                name: 'Custom Solutions',
                slug: '/custom-solutions',
                scripts: [
                    `${this.cdnUrl}/shared/stripe-core.js`,
                    `${this.cdnUrl}/custom-solutions/checkout.js`
                ]
            }
        ];

        const snippetsDir = path.join(__dirname, 'deployment-snippets');
        if (!fs.existsSync(snippetsDir)) {
            fs.mkdirSync(snippetsDir, { recursive: true });
        }

        pages.forEach(page => {
            const html = page.scripts.map(url => 
                `    <script src="${url}"></script>`
            ).join('\n');
            
            const snippet = `<!-- ${page.name} Page Scripts -->\n<!-- Paste this in Webflow: Page Settings → Custom Code → Before </body> tag -->\n${html}`;
            
            const filename = `${page.name.toLowerCase().replace(/\s+/g, '-')}-scripts.txt`;
            const filepath = path.join(snippetsDir, filename);
            
            fs.writeFileSync(filepath, snippet);
            console.log(`  ✅ Created: ${filename}`);
            this.results.ready.push({ page: page.name, file: filename });
        });
    }

    prepareSchemaMarkup() {
        console.log('\n📊 Preparing Schema Markup Snippets...');
        
        const schemaDir = path.join(__dirname, 'schema-markup');
        const snippetsDir = path.join(__dirname, 'deployment-snippets');
        
        if (!fs.existsSync(snippetsDir)) {
            fs.mkdirSync(snippetsDir, { recursive: true });
        }

        const schemas = [
            'marketplace-schema.json',
            'subscriptions-schema.json',
            'ready-solutions-schema.json',
            'custom-solutions-schema.json'
        ];

        schemas.forEach(schemaFile => {
            const schemaPath = path.join(schemaDir, schemaFile);
            if (fs.existsSync(schemaPath)) {
                const content = fs.readFileSync(schemaPath, 'utf8');
                const pageName = schemaFile.replace('-schema.json', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                const snippetPath = path.join(snippetsDir, `${schemaFile.replace('.json', '')}-head-code.txt`);
                
                const snippet = `<!-- ${pageName} Schema Markup -->\n<!-- Paste this in Webflow: Page Settings → Custom Code → Code in <head> tag -->\n${content}`;
                
                fs.writeFileSync(snippetPath, snippet);
                console.log(`  ✅ Created: ${schemaFile.replace('.json', '')}-head-code.txt`);
                this.results.ready.push({ type: 'schema', file: snippetPath });
            }
        });
    }

    prepareHomepageDeployment() {
        console.log('\n🏠 Preparing Homepage Deployment...');
        
        const homepagePath = path.join(__dirname, 'pages', 'WEBFLOW_EMBED_HOMEPAGE.html');
        const snippetsDir = path.join(__dirname, 'deployment-snippets');
        
        if (!fs.existsSync(snippetsDir)) {
            fs.mkdirSync(snippetsDir, { recursive: true });
        }

        if (fs.existsSync(homepagePath)) {
            const content = fs.readFileSync(homepagePath, 'utf8');
            const snippetPath = path.join(snippetsDir, 'homepage-body-code.txt');
            
            const snippet = `<!-- Homepage Content -->\n<!-- Copy this ENTIRE file and paste into Webflow: Homepage → Page Settings → Custom Code → Before </body> tag -->\n${content}`;
            
            fs.writeFileSync(snippetPath, snippet);
            console.log(`  ✅ Created: homepage-body-code.txt (${content.length} characters)`);
            this.results.ready.push({ type: 'homepage', file: 'homepage-body-code.txt' });
        } else {
            console.log(`  ⚠️  Homepage file not found: ${homepagePath}`);
        }
    }

    generateDeploymentReport() {
        console.log('\n📋 Generating Deployment Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            cdn: this.results.cdn,
            ready: this.results.ready,
            instructions: {
                cdnCacheIssue: {
                    problem: 'Subscriptions checkout.js serving old version (843 bytes)',
                    solution: 'Add ?v=2 cache-busting parameter (already included in snippet)',
                    status: 'Ready for deployment'
                },
                homepage: {
                    problem: 'Homepage content missing',
                    solution: 'Deploy homepage-body-code.txt to Webflow',
                    status: 'Snippet ready'
                },
                schemaMarkup: {
                    problem: 'No structured data on service pages',
                    solution: 'Deploy schema markup snippets to head section',
                    status: 'Snippets ready'
                }
            }
        };

        const reportPath = path.join(__dirname, 'deployment-snippets', 'DEPLOYMENT_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`  ✅ Created: DEPLOYMENT_REPORT.json`);
        
        return report;
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 DEPLOYMENT PREPARATION SUMMARY');
        console.log('='.repeat(60));
        
        console.log('\n🔍 CDN Status:');
        Object.entries(this.results.cdn).forEach(([name, status]) => {
            if (status.error) {
                console.log(`  ${name}: ❌ ${status.error}`);
            } else {
                const icon = status.matches ? '✅' : '⚠️';
                console.log(`  ${name}: ${icon} ${status.size} bytes`);
            }
        });

        console.log('\n📁 Ready for Deployment:');
        console.log(`  Deployment snippets: webflow/deployment-snippets/`);
        this.results.ready.forEach(item => {
            console.log(`  ✅ ${item.page || item.type}: ${item.file}`);
        });

        console.log('\n🎯 Next Steps:');
        console.log('  1. Open Webflow Designer');
        console.log('  2. Navigate to each page listed above');
        console.log('  3. Copy/paste snippets from deployment-snippets/ folder');
        console.log('  4. Publish changes');
        
        console.log('\n📖 Full instructions: See webflow/IMMEDIATE_ACTION_PLAN.md');
        console.log('='.repeat(60) + '\n');
    }

    async run() {
        console.log('🚀 Webflow Deployment Helper');
        console.log('='.repeat(60));
        
        await this.checkCDNStatus();
        this.prepareScriptSnippets();
        this.prepareSchemaMarkup();
        this.prepareHomepageDeployment();
        const report = this.generateDeploymentReport();
        this.printSummary();
        
        return report;
    }
}

// Execute if run directly
if (require.main === module) {
    const helper = new WebflowDeploymentHelper();
    helper.run().catch(console.error);
}

module.exports = WebflowDeploymentHelper;

