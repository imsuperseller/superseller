#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYING RENSTO LANDING PAGE TO VERCEL');

class VercelDeployer {
    constructor() {
        this.landingDir = 'rensto-landing';
        this.projectName = 'rensto-landing-page';
    }

    async deploy() {
        try {
            console.log('\n🎯 STEP 1: CHECKING LANDING PAGE FILES');

            // Check if landing page exists
            if (!fs.existsSync(this.landingDir)) {
                console.log('❌ Landing page directory not found. Run create-rensto-landing-page.js first.');
                return false;
            }

            const files = fs.readdirSync(this.landingDir);
            console.log('✅ Landing page files found:', files);

            // Check if Vercel CLI is installed
            console.log('\n🎯 STEP 2: CHECKING VERCEL CLI');
            try {
                execSync('vercel --version', { stdio: 'pipe' });
                console.log('✅ Vercel CLI is installed');
            } catch (error) {
                console.log('❌ Vercel CLI not found. Installing...');
                execSync('npm install -g vercel', { stdio: 'inherit' });
            }

            // Navigate to landing page directory
            console.log('\n🎯 STEP 3: DEPLOYING TO VERCEL');
            process.chdir(this.landingDir);

            // Create vercel.json configuration
            this.createVercelConfig();

            // Deploy to Vercel
            console.log('🚀 Starting Vercel deployment...');
            const deployCommand = `vercel --prod --yes --name ${this.projectName}`;

            console.log('📋 Deploy command:', deployCommand);
            console.log('⏳ This may take a few minutes...');

            const result = execSync(deployCommand, {
                stdio: 'inherit',
                encoding: 'utf8'
            });

            console.log('\n✅ DEPLOYMENT COMPLETED!');
            console.log('🌐 Your Rensto landing page is now live!');

            // Extract deployment URL from output
            const urlMatch = result.match(/https:\/\/[^\s]+/);
            if (urlMatch) {
                const deploymentUrl = urlMatch[0];
                console.log('🔗 Deployment URL:', deploymentUrl);

                // Update DNS instructions
                this.updateDNSInstructions(deploymentUrl);
            }

            return true;

        } catch (error) {
            console.log('❌ Deployment failed:', error.message);
            return false;
        }
    }

    createVercelConfig() {
        const vercelConfig = {
            "version": 2,
            "name": "rensto-landing-page",
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
            ],
            "headers": [
                {
                    "source": "/(.*)",
                    "headers": [
                        {
                            "key": "X-Content-Type-Options",
                            "value": "nosniff"
                        },
                        {
                            "key": "X-Frame-Options",
                            "value": "DENY"
                        },
                        {
                            "key": "X-XSS-Protection",
                            "value": "1; mode=block"
                        }
                    ]
                }
            ]
        };

        fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
        console.log('✅ Created vercel.json configuration');
    }

    updateDNSInstructions(deploymentUrl) {
        console.log('\n🎯 STEP 4: DNS CONFIGURATION');
        console.log('================================');
        console.log('');
        console.log('🔧 To fix rensto.com, update your DNS record:');
        console.log('');
        console.log('1. Go to Cloudflare Dashboard');
        console.log('2. Select rensto.com zone');
        console.log('3. Go to DNS settings');
        console.log('4. Update the A record for rensto.com:');
        console.log('');
        console.log('   Type: CNAME');
        console.log('   Name: rensto.com');
        console.log('   Target: ' + deploymentUrl.replace('https://', ''));
        console.log('   Proxy: Enabled (orange cloud)');
        console.log('');
        console.log('5. Save the changes');
        console.log('');
        console.log('⏳ DNS propagation may take 5-10 minutes');
        console.log('');
        console.log('✅ After DNS update, rensto.com will show your landing page!');
    }

    async updateDNSRecord(deploymentUrl) {
        console.log('\n🎯 STEP 5: UPDATING DNS VIA CLOUDFLARE API');

        try {
            const targetDomain = deploymentUrl.replace('https://', '');

            const updateCommand = `curl -X PUT "https://api.cloudflare.com/client/v4/zones/031333b77c859d1dd4d4fd4afdc1b9bc/dns_records/49d91ed2194889c045ef62b9f4ea564a" \\
                -H "X-Auth-Email: service@rensto.com" \\
                -H "X-Auth-Key: d6921e18b648f2be2d2c8eeb969ed9fd1614c" \\
                -H "Content-Type: application/json" \\
                -d '{
                    "type": "CNAME",
                    "name": "rensto.com",
                    "content": "${targetDomain}",
                    "proxied": true,
                    "ttl": 1
                }'`;

            console.log('🔧 Updating DNS record...');
            execSync(updateCommand, { stdio: 'inherit' });

            console.log('✅ DNS record updated successfully!');
            console.log('🌐 rensto.com should now point to your landing page');

            return true;

        } catch (error) {
            console.log('❌ DNS update failed:', error.message);
            console.log('🔧 Please update DNS manually using the instructions above');
            return false;
        }
    }
}

// Execute deployment
async function main() {
    const deployer = new VercelDeployer();

    try {
        const success = await deployer.deploy();

        if (success) {
            console.log('\n🎉 RENSTO LANDING PAGE DEPLOYMENT COMPLETED!');
            console.log('🎨 Your professional Rensto landing page is now live');
            console.log('🔗 The redirect loop issue will be resolved once DNS propagates');
        } else {
            console.log('\n❌ DEPLOYMENT FAILED');
            console.log('🔧 Please check the error messages above');
        }

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

main();
