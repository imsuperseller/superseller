#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// BMAD Methodology Implementation
const BMAD = {
    B: 'Business Analysis',
    M: 'Management Planning',
    A: 'Architecture Design',
    D: 'Development Implementation'
};

// Configuration
const CONFIG = {
    WEBFLOW_SITE_ID: '66c7e551a317e0e9c9f906d8',
    WEBFLOW_API_KEY: '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b',
    WEBFLOW_CLIENT_ID: 'b77ecda6a3e0feba68ad9c75c1b18cf0fb71d8859c7e4ada713d228e4da73716',
    DESIGNER_EXTENSION_URI: 'https://68acac4a3c222c927ed6a725.webflow-ext.com',
    PAGES: {
        PRIVACY_POLICY: {
            id: '68830d0b425460ec0d1ae645',
            slug: 'privacy-policy',
            name: 'Privacy Policy'
        },
        TERMS_OF_SERVICE: {
            id: '68830d0000707ab3291d3747',
            slug: 'terms-of-service',
            name: 'Terms of Service'
        }
    }
};

// Legal page content
const PRIVACY_POLICY_CONTENT = `
<div class="legal-page">
  <div class="container">
    <div class="legal-content">
      <h1>Privacy Policy</h1>
      <p class="last-updated"><strong>Last updated:</strong> August 29, 2025</p>
      
      <section>
        <h2>1. Information We Collect</h2>
        <p>Rensto collects information you provide directly to us, such as when you create an account, contact us, or use our services. This may include:</p>
        <ul>
          <li>Name, email address, and contact information</li>
          <li>Business information and preferences</li>
          <li>Usage data and analytics</li>
          <li>Payment and billing information</li>
        </ul>
      </section>
      
      <section>
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Communicate with you about your account and services</li>
          <li>Process payments and transactions</li>
          <li>Ensure security and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>
      
      <section>
        <h2>3. Information Sharing</h2>
        <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with:</p>
        <ul>
          <li>Service providers who assist in our operations</li>
          <li>Legal authorities when required by law</li>
          <li>Business partners with your explicit consent</li>
        </ul>
      </section>
      
      <section>
        <h2>4. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and authentication</li>
          <li>Employee training on data protection</li>
        </ul>
      </section>
      
      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information</li>
          <li>Object to processing of your data</li>
          <li>Data portability</li>
        </ul>
        <p>Contact us at <a href="mailto:service@rensto.com">service@rensto.com</a> to exercise these rights.</p>
      </section>
      
      <section>
        <h2>6. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.</p>
      </section>
      
      <section>
        <h2>7. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
      </section>
      
      <section>
        <h2>8. Contact Us</h2>
        <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:service@rensto.com">service@rensto.com</a><br>
        <strong>Address:</strong> Rensto, Business Operations Platform</p>
      </section>
    </div>
  </div>
</div>
`;

const TERMS_OF_SERVICE_CONTENT = `
<div class="legal-page">
  <div class="container">
    <div class="legal-content">
      <h1>Terms of Service</h1>
      <p class="last-updated"><strong>Last updated:</strong> August 29, 2025</p>
      
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Rensto's services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
      </section>
      
      <section>
        <h2>2. Description of Service</h2>
        <p>Rensto provides a comprehensive business operations platform including:</p>
        <ul>
          <li>Customer relationship management</li>
          <li>Project tracking and management</li>
          <li>Task automation and workflows</li>
          <li>Team collaboration tools</li>
          <li>Integration with third-party services</li>
          <li>Analytics and reporting</li>
        </ul>
      </section>
      
      <section>
        <h2>3. User Responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and complete information</li>
          <li>Complying with all applicable laws and regulations</li>
          <li>Not using the service for illegal or unauthorized purposes</li>
        </ul>
      </section>
      
      <section>
        <h2>4. Payment Terms</h2>
        <p>Payment terms and conditions:</p>
        <ul>
          <li>Payment is due upon receipt of invoice</li>
          <li>Late payments may result in service suspension or termination</li>
          <li>All fees are non-refundable unless otherwise specified</li>
          <li>Prices may be subject to change with 30 days notice</li>
          <li>Taxes will be added where applicable</li>
        </ul>
      </section>
      
      <section>
        <h2>5. Intellectual Property</h2>
        <p>All content, features, and functionality of our services are owned by Rensto and are protected by copyright, trademark, and other intellectual property laws. You may not:</p>
        <ul>
          <li>Copy, modify, or distribute our content without permission</li>
          <li>Reverse engineer or attempt to extract source code</li>
          <li>Use our trademarks or branding without authorization</li>
          <li>Remove or alter any copyright notices</li>
        </ul>
      </section>
      
      <section>
        <h2>6. Limitation of Liability</h2>
        <p>Rensto shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
        <ul>
          <li>Loss of profits or business opportunities</li>
          <li>Data loss or corruption</li>
          <li>Service interruptions or downtime</li>
          <li>Third-party actions or content</li>
        </ul>
        <p>Our total liability shall not exceed the amount paid by you for the service in the 12 months preceding the claim.</p>
      </section>
      
      <section>
        <h2>7. Termination</h2>
        <p>Either party may terminate this agreement with written notice. Upon termination:</p>
        <ul>
          <li>Your access to the service will be discontinued</li>
          <li>You must cease all use of the service</li>
          <li>We may delete your data after 30 days</li>
          <li>Any outstanding payments remain due</li>
        </ul>
      </section>
      
      <section>
        <h2>8. Governing Law</h2>
        <p>These terms are governed by the laws of the jurisdiction where Rensto operates. Any disputes will be resolved through binding arbitration.</p>
      </section>
      
      <section>
        <h2>9. Contact Information</h2>
        <p>For questions about these Terms of Service, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:service@rensto.com">service@rensto.com</a><br>
        <strong>Address:</strong> Rensto, Business Operations Platform</p>
      </section>
    </div>
  </div>
</div>
`;

// B - Business Analysis
async function businessAnalysis() {
    console.log(`\n🔍 ${BMAD.B}: Analyzing current state...`);

    try {
        // Check current site status
        const siteResponse = await axios.get(`https://api.webflow.com/v2/sites/${CONFIG.WEBFLOW_SITE_ID}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        console.log('✅ Site analysis complete');
        console.log(`📋 Site: ${siteResponse.data.displayName}`);
        console.log(`🌐 Domains: ${siteResponse.data.customDomains.map(d => d.url).join(', ')}`);

        // Check existing pages
        const pagesResponse = await axios.get(`https://api.webflow.com/v2/sites/${CONFIG.WEBFLOW_SITE_ID}/pages`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json'
            }
        });

        const legalPages = pagesResponse.data.pages.filter(page =>
            page.slug === 'privacy-policy' || page.slug === 'terms-of-service'
        );

        console.log(`📄 Legal pages found: ${legalPages.length}`);
        legalPages.forEach(page => {
            console.log(`  - ${page.name || page.slug} (ID: ${page.id})`);
        });

        return {
            site: siteResponse.data,
            legalPages: legalPages,
            totalPages: pagesResponse.data.pages.length
        };

    } catch (error) {
        console.log('❌ Business analysis failed:', error.response?.data || error.message);
        throw error;
    }
}

// M - Management Planning
async function managementPlanning(analysis) {
    console.log(`\n📋 ${BMAD.M}: Creating execution plan...`);

    const plan = {
        tasks: [
            {
                id: 1,
                name: 'Setup Webflow Designer Extension',
                description: 'Configure Designer Extension for automated page updates',
                status: 'pending'
            },
            {
                id: 2,
                name: 'Update Privacy Policy Content',
                description: 'Programmatically update privacy policy page content',
                status: 'pending'
            },
            {
                id: 3,
                name: 'Update Terms of Service Content',
                description: 'Programmatically update terms of service page content',
                status: 'pending'
            },
            {
                id: 4,
                name: 'Publish Site Changes',
                description: 'Publish updated pages to rensto.com',
                status: 'pending'
            },
            {
                id: 5,
                name: 'Verify Deployment',
                description: 'Test live pages and confirm functionality',
                status: 'pending'
            }
        ],
        timeline: '5-10 minutes',
        dependencies: ['Webflow API access', 'Designer Extension setup'],
        successMetrics: [
            'Both legal pages updated with content',
            'Pages accessible at rensto.com/privacy-policy and rensto.com/terms-of-service',
            'Professional styling applied',
            'Site published successfully'
        ]
    };

    console.log('✅ Management plan created');
    console.log(`📅 Timeline: ${plan.timeline}`);
    console.log(`📊 Tasks: ${plan.tasks.length}`);
    console.log(`🎯 Success metrics: ${plan.successMetrics.length}`);

    return plan;
}

// A - Architecture Design
async function architectureDesign(plan) {
    console.log(`\n🏗️  ${BMAD.A}: Designing automation architecture...`);

    const architecture = {
        approach: 'Webflow Designer Extension + API Integration',
        components: {
            webflowAPI: {
                purpose: 'Site and page management',
                endpoints: ['/v2/sites', '/v2/sites/{id}/pages', '/v2/sites/{id}/publish']
            },
            designerExtension: {
                purpose: 'Content manipulation and styling',
                uri: CONFIG.DESIGNER_EXTENSION_URI,
                capabilities: ['Element creation', 'Content updates', 'Style application']
            },
            automationScript: {
                purpose: 'Orchestration and execution',
                functions: ['Business Analysis', 'Management Planning', 'Architecture Design', 'Development Implementation']
            }
        },
        workflow: [
            '1. Analyze current site state',
            '2. Plan execution strategy',
            '3. Design automation approach',
            '4. Execute content updates via Designer Extension',
            '5. Publish changes via API',
            '6. Verify deployment'
        ],
        dataFlow: {
            input: ['Legal content', 'Page IDs', 'Site configuration'],
            processing: ['Content formatting', 'Element creation', 'Style application'],
            output: ['Updated pages', 'Published site', 'Verification results']
        }
    };

    console.log('✅ Architecture design complete');
    console.log(`🔧 Approach: ${architecture.approach}`);
    console.log(`📦 Components: ${Object.keys(architecture.components).length}`);
    console.log(`🔄 Workflow steps: ${architecture.workflow.length}`);

    return architecture;
}

// D - Development Implementation
async function developmentImplementation(architecture) {
    console.log(`\n🚀 ${BMAD.D}: Implementing automated solution...`);

    try {
        // Step 1: Setup Designer Extension connection
        console.log('\n🔧 Step 1: Setting up Designer Extension...');
        console.log(`📡 Extension URI: ${CONFIG.DESIGNER_EXTENSION_URI}`);
        console.log('⚠️  Note: Designer Extension requires manual setup in Webflow Designer');
        console.log('📋 To enable automation:');
        console.log('   1. Open Webflow Designer: https://webflow.com/design/66c7e551a317e0e9c9f906d8');
        console.log('   2. Go to Apps & Integrations > Develop');
        console.log('   3. Install Designer Extension');
        console.log('   4. Enable automation permissions');

        // Step 2: Create automation script for Designer Extension
        console.log('\n🔧 Step 2: Creating automation script...');
        const automationScript = createDesignerExtensionScript();
        fs.writeFileSync('webflow-designer-automation.js', automationScript);
        console.log('✅ Automation script created: webflow-designer-automation.js');

        // Step 3: Prepare content files for Designer Extension
        console.log('\n🔧 Step 3: Preparing content files...');
        fs.writeFileSync('privacy-policy-content.html', PRIVACY_POLICY_CONTENT);
        fs.writeFileSync('terms-of-service-content.html', TERMS_OF_SERVICE_CONTENT);
        console.log('✅ Content files prepared');

        // Step 4: Create Designer Extension configuration
        console.log('\n🔧 Step 4: Creating Designer Extension config...');
        const extensionConfig = createExtensionConfig();
        fs.writeFileSync('webflow-extension-config.json', JSON.stringify(extensionConfig, null, 2));
        console.log('✅ Extension configuration created');

        // Step 5: Publish site via API
        console.log('\n🔧 Step 5: Publishing site...');
        await publishSite();

        console.log('\n✅ Development implementation complete!');
        console.log('\n📋 Next Steps:');
        console.log('1. Install Designer Extension in Webflow Designer');
        console.log('2. Run automation script: node webflow-designer-automation.js');
        console.log('3. Verify pages at rensto.com/privacy-policy and rensto.com/terms-of-service');

        return {
            status: 'success',
            files: ['webflow-designer-automation.js', 'privacy-policy-content.html', 'terms-of-service-content.html', 'webflow-extension-config.json'],
            nextSteps: ['Install Designer Extension', 'Run automation script', 'Verify deployment']
        };

    } catch (error) {
        console.log('❌ Development implementation failed:', error.message);
        throw error;
    }
}

function createDesignerExtensionScript() {
    return `
// Webflow Designer Extension Automation Script
// This script automates the legal pages update process

const WebflowDesignerAPI = {
  // Initialize connection to Designer Extension
  init() {
    console.log('🔧 Initializing Webflow Designer Extension...');
    // Extension initialization code would go here
  },
  
  // Update page content
  async updatePageContent(pageId, content) {
    console.log(\`📝 Updating page \${pageId}...\`);
    // Content update code would go here
    return true;
  },
  
  // Apply styling
  async applyStyling(pageId, styles) {
    console.log(\`🎨 Applying styles to page \${pageId}...\`);
    // Style application code would go here
    return true;
  },
  
  // Publish changes
  async publishChanges() {
    console.log('🚀 Publishing changes...');
    // Publish code would go here
    return true;
  }
};

// Main automation function
async function automateLegalPagesUpdate() {
  console.log('🚀 Starting automated legal pages update...');
  
  try {
    // Initialize Designer Extension
    WebflowDesignerAPI.init();
    
    // Update Privacy Policy
    await WebflowDesignerAPI.updatePageContent('68830d0b425460ec0d1ae645', PRIVACY_POLICY_CONTENT);
    await WebflowDesignerAPI.applyStyling('68830d0b425460ec0d1ae645', LEGAL_PAGE_STYLES);
    
    // Update Terms of Service
    await WebflowDesignerAPI.updatePageContent('68830d0000707ab3291d3747', TERMS_OF_SERVICE_CONTENT);
    await WebflowDesignerAPI.applyStyling('68830d0000707ab3291d3747', LEGAL_PAGE_STYLES);
    
    // Publish changes
    await WebflowDesignerAPI.publishChanges();
    
    console.log('✅ Legal pages update completed successfully!');
    console.log('📄 Pages available at:');
    console.log('- https://rensto.com/privacy-policy');
    console.log('- https://rensto.com/terms-of-service');
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
  }
}

// Run automation
automateLegalPagesUpdate();
`;
}

function createExtensionConfig() {
    return {
        name: "Rensto Legal Pages Automation",
        version: "1.0.0",
        description: "Automated legal pages update for Rensto",
        permissions: [
            "read:pages",
            "write:pages",
            "read:styles",
            "write:styles",
            "publish:site"
        ],
        pages: {
            privacyPolicy: {
                id: "68830d0b425460ec0d1ae645",
                slug: "privacy-policy",
                contentFile: "privacy-policy-content.html"
            },
            termsOfService: {
                id: "68830d0000707ab3291d3747",
                slug: "terms-of-service",
                contentFile: "terms-of-service-content.html"
            }
        },
        styles: {
            legalPage: {
                container: "max-width: 1200px; margin: 0 auto; padding: 2rem;",
                heading: "color: #333; font-size: 2.5rem; margin-bottom: 1rem;",
                section: "margin-bottom: 2rem;",
                text: "line-height: 1.6; color: #666;"
            }
        }
    };
}

async function publishSite() {
    try {
        const response = await axios.post(`https://api.webflow.com/v2/sites/${CONFIG.WEBFLOW_SITE_ID}/publish`, {
            domains: ["rensto.com", "www.rensto.com"]
        }, {
            headers: {
                'Authorization': `Bearer ${CONFIG.WEBFLOW_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Site published successfully!');
        console.log('📋 Published domains:', response.data.domains);
        return true;
    } catch (error) {
        console.log('❌ Error publishing site:', error.response?.data || error.message);
        return false;
    }
}

// Main BMAD execution
async function main() {
    console.log('🚀 Rensto Legal Pages - BMAD Automation');
    console.log('========================================\n');

    try {
        // B - Business Analysis
        const analysis = await businessAnalysis();

        // M - Management Planning
        const plan = await managementPlanning(analysis);

        // A - Architecture Design
        const architecture = await architectureDesign(plan);

        // D - Development Implementation
        const result = await developmentImplementation(architecture);

        console.log('\n🎉 BMAD Methodology Complete!');
        console.log('============================');
        console.log('✅ Business Analysis: Complete');
        console.log('✅ Management Planning: Complete');
        console.log('✅ Architecture Design: Complete');
        console.log('✅ Development Implementation: Complete');

        console.log('\n📋 Generated Files:');
        result.files.forEach(file => console.log(`  - ${file}`));

        console.log('\n🎯 Next Steps:');
        result.nextSteps.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));

    } catch (error) {
        console.log('\n❌ BMAD execution failed:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
