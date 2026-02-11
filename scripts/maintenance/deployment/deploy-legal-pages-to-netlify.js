#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYING RENSTO LEGAL PAGES TO NETLIFY');
console.log('===========================================');

// Create a simple deployment package
const deployDir = 'netlify-deploy';
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
}

// Copy the legal pages
fs.copyFileSync('rensto-legal-pages/privacy-policy.html', `${deployDir}/privacy-policy.html`);
fs.copyFileSync('rensto-legal-pages/terms-of-service.html', `${deployDir}/terms-of-service.html`);

// Create a simple index page
const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rensto Legal Pages</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            background: #f8f9fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #fe3d51; margin-bottom: 30px; }
        .link {
            display: inline-block;
            margin: 10px;
            padding: 15px 30px;
            background: #fe3d51;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background 0.3s;
        }
        .link:hover {
            background: #bf5700;
        }
        .description {
            color: #666;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>RENSTO</h1>
        <h2>Legal Documents</h2>
        <p class="description">Choose a legal document to view:</p>
        <a href="/privacy-policy.html" class="link">Privacy Policy</a>
        <a href="/terms-of-service.html" class="link">Terms of Service</a>
    </div>
</body>
</html>`;

fs.writeFileSync(`${deployDir}/index.html`, indexContent);

// Create netlify.toml for configuration
const netlifyConfig = `[build]
  publish = "."

[[redirects]]
  from = "/privacy-policy"
  to = "/privacy-policy.html"
  status = 200

[[redirects]]
  from = "/terms-of-service"
  to = "/terms-of-service.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;

fs.writeFileSync(`${deployDir}/netlify.toml`, netlifyConfig);

console.log('✅ Legal pages prepared for Netlify deployment');
console.log('');
console.log('📋 DEPLOYMENT INSTRUCTIONS:');
console.log('1. Go to https://netlify.com');
console.log('2. Sign up/login with your account');
console.log('3. Click "New site from Git" or drag and drop the netlify-deploy folder');
console.log('4. If using drag and drop, upload the netlify-deploy folder');
console.log('5. Your site will be deployed to a URL like: https://amazing-site-123456.netlify.app');
console.log('');
console.log('🌐 Once deployed, update DNS records:');
console.log('• privacy-policy.rensto.com → your-netlify-url.netlify.app');
console.log('• terms-of-service.rensto.com → your-netlify-url.netlify.app');
console.log('');
console.log('📄 Your legal pages will be available at:');
console.log('• https://privacy-policy.rensto.com/privacy-policy');
console.log('• https://terms-of-service.rensto.com/terms-of-service');
console.log('');
console.log('🎯 Ready for Facebook approval!');

// Create a deployment summary
const summary = {
    timestamp: new Date().toISOString(),
    deployment: {
        type: 'netlify',
        directory: deployDir,
        files: fs.readdirSync(deployDir),
        instructions: 'Deploy to Netlify for immediate public access'
    },
    urls: {
        privacyPolicy: 'https://privacy-policy.rensto.com/privacy-policy',
        termsOfService: 'https://terms-of-service.rensto.com/terms-of-service'
    }
};

fs.writeFileSync('data/legal-pages-deployment-summary.json', JSON.stringify(summary, null, 2));
console.log('📊 Deployment summary saved to data/legal-pages-deployment-summary.json');
