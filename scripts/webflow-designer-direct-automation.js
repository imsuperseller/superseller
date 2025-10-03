#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';

// Configuration
const CONFIG = {
    WEBFLOW_SITE_ID: '66c7e551a317e0e9c9f906d8',
    WEBFLOW_API_KEY: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b',
    DESIGNER_EXTENSION_URI: 'https://68acac4a3c222c927ed6a725.webflow-ext.com',
    PAGES: {
        PRIVACY_POLICY: {
            id: '68830d0b425460ec0d1ae645',
            slug: 'privacy-policy'
        },
        TERMS_OF_SERVICE: {
            id: '68830d0000707ab3291d3747',
            slug: 'terms-of-service'
        }
    }
};

// Legal page content (simplified for Designer Extension)
const PRIVACY_POLICY_CONTENT = `
<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> August 29, 2025</p>

<h2>1. Information We Collect</h2>
<p>Rensto collects information you provide directly to us, such as when you create an account, contact us, or use our services.</p>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure security.</p>

<h2>3. Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information.</p>

<h2>5. Your Rights</h2>
<p>You have the right to access, correct, or delete your personal information. Contact us at service@rensto.com.</p>

<h2>6. Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at service@rensto.com</p>
`;

const TERMS_OF_SERVICE_CONTENT = `
<h1>Terms of Service</h1>
<p><strong>Last updated:</strong> August 29, 2025</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Rensto's services, you accept and agree to be bound by these Terms of Service.</p>

<h2>2. Description of Service</h2>
<p>Rensto provides a comprehensive business operations platform including customer management, project tracking, and automation tools.</p>

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
`;

async function testDesignerExtensionConnection() {
    console.log('🔍 Testing Designer Extension connection...');

    try {
        // Test the Designer Extension URI
        const response = await axios.get(CONFIG.DESIGNER_EXTENSION_URI, {
            timeout: 5000
        });

        console.log('✅ Designer Extension is accessible');
        return true;
    } catch (error) {
        console.log('❌ Designer Extension not accessible:', error.message);
        return false;
    }
}

async function createDesignerExtensionPayload() {
    console.log('📦 Creating Designer Extension payload...');

    const payload = {
        siteId: CONFIG.WEBFLOW_SITE_ID,
        apiKey: CONFIG.WEBFLOW_API_KEY,
        operations: [
            {
                type: 'updatePageContent',
                pageId: CONFIG.PAGES.PRIVACY_POLICY.id,
                pageSlug: CONFIG.PAGES.PRIVACY_POLICY.slug,
                content: PRIVACY_POLICY_CONTENT,
                styles: {
                    container: 'max-width: 1200px; margin: 0 auto; padding: 2rem;',
                    heading: 'color: #333; font-size: 2.5rem; margin-bottom: 1rem;',
                    text: 'line-height: 1.6; color: #666; margin-bottom: 1rem;'
                }
            },
            {
                type: 'updatePageContent',
                pageId: CONFIG.PAGES.TERMS_OF_SERVICE.id,
                pageSlug: CONFIG.PAGES.TERMS_OF_SERVICE.slug,
                content: TERMS_OF_SERVICE_CONTENT,
                styles: {
                    container: 'max-width: 1200px; margin: 0 auto; padding: 2rem;',
                    heading: 'color: #333; font-size: 2.5rem; margin-bottom: 1rem;',
                    text: 'line-height: 1.6; color: #666; margin-bottom: 1rem;'
                }
            },
            {
                type: 'publishSite',
                domains: ['rensto.com', 'www.rensto.com']
            }
        ]
    };

    fs.writeFileSync('designer-extension-payload.json', JSON.stringify(payload, null, 2));
    console.log('✅ Designer Extension payload created: designer-extension-payload.json');

    return payload;
}

async function createWebflowDesignerInstructions() {
    console.log('📋 Creating Webflow Designer instructions...');

    const instructions = `
# Webflow Designer Automation Instructions

## 🎯 Goal
Automatically update Privacy Policy and Terms of Service pages in Webflow Designer

## 📋 Prerequisites
1. Webflow Designer access: https://webflow.com/design/66c7e551a317e0e9c9f906d8
2. Designer Extension installed and configured
3. API permissions enabled

## 🚀 Automation Steps

### Step 1: Install Designer Extension
1. Open Webflow Designer: https://webflow.com/design/66c7e551a317e0e9c9f906d8
2. Go to Apps & Integrations > Develop
3. Install Designer Extension from: ${CONFIG.DESIGNER_EXTENSION_URI}
4. Enable automation permissions

### Step 2: Run Automation
1. Open the Designer Extension panel
2. Load the payload from: designer-extension-payload.json
3. Click "Execute Automation"
4. Monitor the progress in the extension panel

### Step 3: Verify Results
1. Check Privacy Policy page: https://rensto.com/privacy-policy
2. Check Terms of Service page: https://rensto.com/terms-of-service
3. Verify content and styling are applied correctly

## 📄 Content Files
- Privacy Policy content: privacy-policy-content.html
- Terms of Service content: terms-of-service-content.html
- Extension payload: designer-extension-payload.json

## 🔧 Manual Fallback
If automation fails, manually copy content from the HTML files into the respective pages in Webflow Designer.

## 📞 Support
For technical issues, contact: service@rensto.com
`;

    fs.writeFileSync('webflow-designer-instructions.md', instructions);
    console.log('✅ Instructions created: webflow-designer-instructions.md');

    return instructions;
}

async function createContentFiles() {
    console.log('📄 Creating content files...');

    // Create simplified HTML files for easy copy-paste
    const privacyPolicyHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Rensto</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1 { color: #333; font-size: 2.5rem; margin-bottom: 1rem; }
        h2 { color: #333; font-size: 1.8rem; margin-top: 2rem; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; }
        .last-updated { color: #666; font-style: italic; }
    </style>
</head>
<body>
${PRIVACY_POLICY_CONTENT}
</body>
</html>
`;

    const termsOfServiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Terms of Service - Rensto</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1 { color: #333; font-size: 2.5rem; margin-bottom: 1rem; }
        h2 { color: #333; font-size: 1.8rem; margin-top: 2rem; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; }
        .last-updated { color: #666; font-style: italic; }
    </style>
</head>
<body>
${TERMS_OF_SERVICE_CONTENT}
</body>
</html>
`;

    fs.writeFileSync('privacy-policy-complete.html', privacyPolicyHTML);
    fs.writeFileSync('terms-of-service-complete.html', termsOfServiceHTML);

    console.log('✅ Content files created:');
    console.log('  - privacy-policy-complete.html');
    console.log('  - terms-of-service-complete.html');
}

async function main() {
    console.log('🚀 Webflow Designer Direct Automation');
    console.log('=====================================\n');

    try {
        // Test Designer Extension connection
        const extensionAccessible = await testDesignerExtensionConnection();

        // Create automation payload
        await createDesignerExtensionPayload();

        // Create content files
        await createContentFiles();

        // Create instructions
        await createWebflowDesignerInstructions();

        console.log('\n✅ Automation setup complete!');
        console.log('\n📋 Generated Files:');
        console.log('  - designer-extension-payload.json (for Designer Extension)');
        console.log('  - privacy-policy-complete.html (for manual copy-paste)');
        console.log('  - terms-of-service-complete.html (for manual copy-paste)');
        console.log('  - webflow-designer-instructions.md (step-by-step guide)');

        console.log('\n🎯 Next Steps:');
        if (extensionAccessible) {
            console.log('1. ✅ Designer Extension is accessible');
            console.log('2. 🔧 Load designer-extension-payload.json into Designer Extension');
            console.log('3. 🚀 Execute automation in Webflow Designer');
        } else {
            console.log('1. ⚠️  Designer Extension not accessible - use manual approach');
            console.log('2. 📄 Copy content from privacy-policy-complete.html and terms-of-service-complete.html');
            console.log('3. 🔧 Paste into respective pages in Webflow Designer');
        }
        console.log('4. ✅ Verify pages at rensto.com/privacy-policy and rensto.com/terms-of-service');

        console.log('\n📄 Final URLs for Facebook:');
        console.log('- https://rensto.com/privacy-policy');
        console.log('- https://rensto.com/terms-of-service');

    } catch (error) {
        console.log('❌ Automation setup failed:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
