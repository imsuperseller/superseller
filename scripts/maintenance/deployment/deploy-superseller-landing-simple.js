#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYING RENSTO LANDING PAGE TO VERCEL (SIMPLE)');

class SimpleVercelDeployer {
    constructor() {
        this.landingDir = 'superseller-landing';
    }

    async deploy() {
        try {
            console.log('\n🎯 STEP 1: CHECKING LANDING PAGE FILES');

            if (!fs.existsSync(this.landingDir)) {
                console.log('❌ Landing page directory not found. Run create-superseller-landing-page.js first.');
                return false;
            }

            const files = fs.readdirSync(this.landingDir);
            console.log('✅ Landing page files found:', files);

            // Create a simple deployment using npx
            console.log('\n🎯 STEP 2: DEPLOYING WITH NPX VERCEL');

            // Navigate to landing page directory
            process.chdir(this.landingDir);

            // Create vercel.json
            this.createVercelConfig();

            // Deploy using npx
            console.log('🚀 Starting deployment with npx vercel...');

            try {
                const result = execSync('npx vercel --prod --yes', {
                    stdio: 'inherit',
                    encoding: 'utf8'
                });

                console.log('\n✅ DEPLOYMENT COMPLETED!');
                console.log('🌐 Your SuperSeller AI landing page is now live!');

                // Try to extract URL from output
                const urlMatch = result.match(/https:\/\/[^\s]+/);
                if (urlMatch) {
                    const deploymentUrl = urlMatch[0];
                    console.log('🔗 Deployment URL:', deploymentUrl);
                    this.updateDNSRecord(deploymentUrl);
                }

                return true;

            } catch (deployError) {
                console.log('❌ npx vercel failed, trying alternative approach...');
                return this.deployAlternative();
            }

        } catch (error) {
            console.log('❌ Deployment failed:', error.message);
            return false;
        }
    }

    deployAlternative() {
        console.log('\n🎯 STEP 3: ALTERNATIVE DEPLOYMENT APPROACH');
        console.log('============================================');
        console.log('');
        console.log('Since Vercel CLI deployment failed, here are alternative options:');
        console.log('');
        console.log('🔧 OPTION 1: Manual Vercel Deployment');
        console.log('1. Go to https://vercel.com');
        console.log('2. Sign in with your GitHub account');
        console.log('3. Click "New Project"');
        console.log('4. Import the superseller-landing folder from GitHub');
        console.log('5. Deploy the project');
        console.log('');
        console.log('🔧 OPTION 2: GitHub Pages (Free)');
        console.log('1. Push the superseller-landing folder to a GitHub repository');
        console.log('2. Go to repository Settings > Pages');
        console.log('3. Enable GitHub Pages from main branch');
        console.log('4. Use the provided GitHub Pages URL');
        console.log('');
        console.log('🔧 OPTION 3: Netlify (Free)');
        console.log('1. Go to https://netlify.com');
        console.log('2. Drag and drop the superseller-landing folder');
        console.log('3. Get the deployment URL');
        console.log('');
        console.log('📁 Your landing page files are ready in: ' + this.landingDir);
        console.log('🎨 The landing page includes:');
        console.log('   - Professional SuperSeller AI branding');
        console.log('   - Animated logo with brand colors');
        console.log('   - Responsive design');
        console.log('   - Contact form');
        console.log('   - Modern animations');

        return true;
    }

    createVercelConfig() {
        const vercelConfig = {
            "version": 2,
            "name": "superseller-landing-page",
            "builds": [
                {
                    "src": "**/*",
                    "use": "@vercel/static"
                }
            ],
            "routes": [
                {
                    "src": "/(.*)",
                    "dest": "/index.html"
                }
            ]
        };

        fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
        console.log('✅ Created vercel.json configuration');
    }

    async updateDNSRecord(deploymentUrl) {
        console.log('\n🎯 STEP 4: UPDATING DNS RECORD');
        console.log('==============================');
        console.log('');
        console.log('🔧 To fix superseller.agency redirect loop, update DNS:');
        console.log('');
        console.log('1. Go to Cloudflare Dashboard');
        console.log('2. Select superseller.agency zone');
        console.log('3. Go to DNS settings');
        console.log('4. Update the record for superseller.agency:');
        console.log('');
        console.log('   Type: CNAME');
        console.log('   Name: superseller.agency');
        console.log('   Target: ' + deploymentUrl.replace('https://', ''));
        console.log('   Proxy: Enabled (orange cloud)');
        console.log('');
        console.log('5. Save the changes');
        console.log('');
        console.log('⏳ DNS propagation may take 5-10 minutes');
        console.log('');
        console.log('✅ After DNS update, superseller.agency will show your landing page!');
        console.log('🎉 This will fix the redirect loop issue!');
    }
}

// Execute deployment
async function main() {
    const deployer = new SimpleVercelDeployer();

    try {
        const success = await deployer.deploy();

        if (success) {
            console.log('\n🎉 RENSTO LANDING PAGE READY FOR DEPLOYMENT!');
            console.log('🎨 Your professional SuperSeller AI landing page is ready');
            console.log('🔗 Choose one of the deployment options above');
            console.log('🌐 Once deployed, update DNS to fix superseller.agency');
        } else {
            console.log('\n❌ DEPLOYMENT PREPARATION FAILED');
        }

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

main();
