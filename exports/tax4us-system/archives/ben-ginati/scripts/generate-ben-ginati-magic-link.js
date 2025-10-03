#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs/promises';

class MagicLinkGenerator {
    constructor() {
        this.secret = 'rensto-magic-link-secret-2025';
        this.baseUrl = 'https://rensto.com/ben-ginati-portal';
        this.expirationHours = 24;
    }

    generateMagicLink(email, customData = {}) {
        const timestamp = Date.now();
        const expiration = timestamp + (this.expirationHours * 60 * 60 * 1000);

        const payload = {
            email,
            timestamp,
            expiration,
            ...customData
        };

        const payloadString = JSON.stringify(payload);
        const signature = crypto
            .createHmac('sha256', this.secret)
            .update(payloadString)
            .digest('hex');

        const token = Buffer.from(payloadString).toString('base64url');

        return {
            url: `${this.baseUrl}?token=${token}&sig=${signature}`,
            payload,
            signature,
            expiresAt: new Date(expiration).toISOString()
        };
    }

    verifyMagicLink(token, signature) {
        try {
            const payloadString = Buffer.from(token, 'base64url').toString();
            const payload = JSON.parse(payloadString);

            const expectedSignature = crypto
                .createHmac('sha256', this.secret)
                .update(payloadString)
                .digest('hex');

            if (signature !== expectedSignature) {
                return { valid: false, error: 'Invalid signature' };
            }

            if (Date.now() > payload.expiration) {
                return { valid: false, error: 'Link expired' };
            }

            return { valid: true, payload };
        } catch (error) {
            return { valid: false, error: 'Invalid token' };
        }
    }

    async generateBenGinatiLink() {
        const email = 'ben@tax4us.co.il';
        const customData = {
            customerId: 'ben-ginati-tax4us',
            portalType: 'automation-dashboard',
            features: ['wordpress-content-agent', 'blog-agent', 'podcast-agent', 'social-media-agent'],
            wordpressSite: 'https://tax4us.co.il',
            apiKey: 'uVQm smKl vecQ WmEa 9cbW vn6N'
        };

        const magicLink = this.generateMagicLink(email, customData);

        const linkData = {
            customer: 'Ben Ginati (Tax4Us)',
            email: email,
            magicLink: magicLink.url,
            expiresAt: magicLink.expiresAt,
            features: customData.features,
            wordpressSite: customData.wordpressSite,
            generatedAt: new Date().toISOString(),
            instructions: [
                '1. Click the magic link to access your portal',
                '2. Set your new password on first login',
                '3. Test the WordPress Content Agent',
                '4. Explore your automation dashboard'
            ]
        };

        // Save to file
        await fs.writeFile(
            'ben-ginati-magic-link.json',
            JSON.stringify(linkData, null, 2)
        );

        return linkData;
    }

    async displayMagicLink() {
        console.log('🎯 BEN GINATI - MAGIC LOGIN LINK GENERATOR');
        console.log('==========================================');
        console.log('');

        const linkData = await this.generateBenGinatiLink();

        console.log('✅ Magic link generated successfully!');
        console.log('');
        console.log('📋 LINK DETAILS:');
        console.log('────────────────');
        console.log(`👤 Customer: ${linkData.customer}`);
        console.log(`📧 Email: ${linkData.email}`);
        console.log(`🔗 Magic Link: ${linkData.magicLink}`);
        console.log(`⏰ Expires: ${linkData.expiresAt}`);
        console.log('');

        console.log('🎯 FEATURES INCLUDED:');
        console.log('────────────────────');
        linkData.features.forEach((feature, index) => {
            console.log(`${index + 1}. ${feature}`);
        });
        console.log('');

        console.log('🌐 WORDPRESS INTEGRATION:');
        console.log('────────────────────────');
        console.log(`📄 Site: ${linkData.wordpressSite}`);
        console.log(`🔑 API Key: ${linkData.apiKey}`);
        console.log('');

        console.log('📋 INSTRUCTIONS FOR BEN:');
        console.log('────────────────────────');
        linkData.instructions.forEach((instruction, index) => {
            console.log(`${index + 1}. ${instruction}`);
        });
        console.log('');

        console.log('📄 Link data saved to: ben-ginati-magic-link.json');
        console.log('');

        // Generate a simple HTML file for easy sharing
        const htmlContent = this.generateHTMLPage(linkData);
        await fs.writeFile('ben-ginati-portal-access.html', htmlContent);
        console.log('📄 HTML page generated: ben-ginati-portal-access.html');

        return linkData;
    }

    generateHTMLPage(linkData) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ben Ginati - Tax4Us Portal Access</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #fe3d51, #bf5700);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .magic-link {
            background: linear-gradient(135deg, #fe3d51, #bf5700);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
            text-decoration: none;
            display: block;
            font-size: 18px;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .magic-link:hover {
            transform: translateY(-2px);
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #fe3d51;
        }
        .feature h3 {
            margin: 0 0 10px 0;
            color: #fe3d51;
        }
        .instructions {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
        }
        .instructions h3 {
            margin: 0 0 15px 0;
            color: #1976d2;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
        }
        .expiry {
            background: #fff3e0;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        .expiry strong {
            color: #f57c00;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BG</div>
            <h1>Ben Ginati - Tax4Us Portal</h1>
            <p>Your AI-Powered Automation Dashboard</p>
        </div>

        <div class="expiry">
            <strong>⏰ Link expires: ${new Date(linkData.expiresAt).toLocaleString()}</strong>
        </div>

        <a href="${linkData.magicLink}" class="magic-link">
            🚀 Access Your Portal Now
        </a>

        <div class="feature-list">
            <div class="feature">
                <h3>📄 WordPress Content Agent</h3>
                <p>Automated content generation for tax4us.co.il with AI-powered tax content creation.</p>
            </div>
            <div class="feature">
                <h3>📝 Blog Agent</h3>
                <p>Automated blog post creation and publishing with SEO optimization.</p>
            </div>
            <div class="feature">
                <h3>🎙️ Podcast Agent</h3>
                <p>Podcast content research, planning, and episode script generation.</p>
            </div>
            <div class="feature">
                <h3>📱 Social Media Agent</h3>
                <p>Multi-platform social media management and automated posting.</p>
            </div>
        </div>

        <div class="instructions">
            <h3>📋 Getting Started Instructions:</h3>
            <ol>
                ${linkData.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #666;">
            <p><strong>Need help?</strong> Contact Rensto support for immediate assistance.</p>
            <p>🌐 <a href="https://rensto.com">rensto.com</a> | 📧 support@rensto.com</p>
        </div>
    </div>
</body>
</html>`;
    }
}

// Run the generator
async function main() {
    const generator = new MagicLinkGenerator();
    await generator.displayMagicLink();
}

main().catch(console.error);
