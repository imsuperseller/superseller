#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
    WEBFLOW_SITE_ID: '66c7e551a317e0e9c9f906d8',
    WEBFLOW_CLIENT_ID: 'b77ecda6a3e0feba68ad9c75c1b18cf0fb71d8859c7e4ada713d228e4da73716',
    WEBFLOW_API_KEY: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b'
};

// Legal page content
const PRIVACY_POLICY_CONTENT = `
<div class="legal-page">
  <h1>Privacy Policy</h1>
  <p><strong>Last updated:</strong> August 29, 2025</p>
  
  <h2>1. Information We Collect</h2>
  <p>Rensto collects information you provide directly to us, such as when you create an account, contact us, or use our services.</p>
  
  <h2>2. How We Use Your Information</h2>
  <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure security.</p>
  
  <h2>3. Information Sharing</h2>
  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
  
  <h2>4. Data Security</h2>
  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
  
  <h2>5. Your Rights</h2>
  <p>You have the right to access, correct, or delete your personal information. Contact us at service@rensto.com to exercise these rights.</p>
  
  <h2>6. Contact Us</h2>
  <p>If you have questions about this Privacy Policy, please contact us at service@rensto.com</p>
</div>
`;

const TERMS_OF_SERVICE_CONTENT = `
<div class="legal-page">
  <h1>Terms of Service</h1>
  <p><strong>Last updated:</strong> August 29, 2025</p>
  
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing and using Rensto's services, you accept and agree to be bound by these Terms of Service.</p>
  
  <h2>2. Description of Service</h2>
  <p>Rensto provides business operations platform services including customer management, project tracking, and automation tools.</p>
  
  <h2>3. User Responsibilities</h2>
  <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
  
  <h2>4. Payment Terms</h2>
  <p>Payment is due upon receipt of invoice. Late payments may result in service suspension or termination.</p>
  
  <h2>5. Intellectual Property</h2>
  <p>All content, features, and functionality of our services are owned by Rensto and are protected by copyright, trademark, and other laws.</p>
  
  <h2>6. Limitation of Liability</h2>
  <p>Rensto shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
  
  <h2>7. Contact Information</h2>
  <p>For questions about these Terms of Service, contact us at service@rensto.com</p>
</div>
`;

async function testWebflowAPI() {
    console.log('🔍 Testing Webflow API connection...');

    try {
        // Test with the provided token
        const response = await axios.get(`https://api.webflow.com/v2/sites/${CONFIG.WEBFLOW_SITE_ID}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        console.log('✅ Webflow API connection successful!');
        console.log('📋 Site details:', response.data);
        return true;

    } catch (error) {
        console.log('❌ Webflow API connection failed:', error.response?.data || error.message);
        return false;
    }
}

async function getValidToken() {
    console.log('\n🔑 Getting valid Webflow API token...');
    console.log('\n📋 To get a valid API token:');
    console.log('1. Go to https://developers.webflow.com/data/reference/token/authorized-by?playground=/data/reference/token/authorized-by');
    console.log('2. Log in with your Webflow account');
    console.log('3. Generate a new token with full permissions');
    console.log('4. Copy the token and update the script');

    return false;
}

async function createWebflowPages() {
    console.log('\n📄 Creating legal pages in Webflow...');

    try {
        // First, let's get the existing pages to see what's already there
        console.log('🔍 Checking existing pages...');
        const pagesResponse = await axios.get(`https://api.webflow.com/v2/sites/${CONFIG.WEBFLOW_SITE_ID}/pages`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        console.log(`📋 Found ${pagesResponse.data.pages.length} existing pages`);

        // Check if legal pages already exist
        const existingPages = pagesResponse.data.pages;
        const privacyPolicyExists = existingPages.find(page => page.slug === 'privacy-policy');
        const termsOfServiceExists = existingPages.find(page => page.slug === 'terms-of-service');

        if (privacyPolicyExists) {
            console.log('⚠️  Privacy Policy page already exists');
        } else {
            console.log('✅ Privacy Policy page will be created');
        }

        if (termsOfServiceExists) {
            console.log('⚠️  Terms of Service page already exists');
        } else {
            console.log('✅ Terms of Service page will be created');
        }

        // For now, let's just show what we found
        console.log('\n📋 Existing pages:');
        existingPages.forEach(page => {
            console.log(`- ${page.name} (${page.slug})`);
        });

        console.log('\n🎯 Next steps:');
        console.log('1. The pages will be created via Webflow Designer');
        console.log('2. Content will be added via the Webflow CMS');
        console.log('3. Pages will be published to rensto.com');

        return true;

    } catch (error) {
        console.log('❌ Error checking pages:', error.response?.data || error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Rensto Webflow Legal Pages Setup');
    console.log('=====================================\n');

    // Test API connection
    const apiWorking = await testWebflowAPI();

    if (!apiWorking) {
        await getValidToken();
        await createWebflowPages();

        console.log('\n📝 Next Steps:');
        console.log('1. Get a valid Webflow API token from the playground');
        console.log('2. Update the WEBFLOW_CLIENT_SECRET in this script');
        console.log('3. Run this script again');
        console.log('4. The pages will be created at rensto.com/privacy-policy and rensto.com/terms-of-service');

        return;
    }

    // If API is working, proceed with page creation
    console.log('\n✅ Ready to create legal pages in Webflow!');
    await createWebflowPages();
}

main().catch(console.error);
