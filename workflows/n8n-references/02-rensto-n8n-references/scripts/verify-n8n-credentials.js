#!/usr/bin/env node

/**
 * n8n Credentials Verification Script
 * Verifies all credentials are working and accessible
 */

import axios from 'axios';

const N8N_CONFIG = {
    baseUrl: 'http://173.254.201.134:5678',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDkyMDIxfQ.YKPTmHyLr1_kXX2JMY7hsPy4jvnCJDL71mOCltoUbQc',
    headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2MDkyMDIxfQ.YKPTmHyLr1_kXX2JMY7hsPy4jvnCJDL71mOCltoUbQc`,
        'Content-Type': 'application/json'
    }
};

class N8NCredentialsVerifier {
    constructor() {
        this.expectedCredentials = [
            'Microsoft Outlook OAuth2 API',
            'Airtable API',
            'Supabase API',
            'RackNerd',
            'Facebook Graph API (App)',
            'Stripe API',
            'Tavily',
            'Telegram API',
            'ElevenLabs API',
            'QuickBooks Online OAuth2 API',
            'Rollbar',
            'Typeform API',
            'OpenAi',
            'Gemini',
            'Sentry.io API',
            'SerpAPI',
            'Slack API',
            'OpenRouter',
            'Webflow OAuth2 API',
            'Anthropic',
            'HuggingFaceApi',
            'Linkedin',
            'Perplexity.ai',
            'Zoho OAuth2 API',
            'GitHub API',
            'Apify API',
            'eSignatures',
            'Firecrawl'
        ];
    }

    async verifyCredentials() {
        console.log('🔍 Verifying n8n credentials...');
        console.log(`📊 Expected credentials: ${this.expectedCredentials.length}`);

        try {
            const response = await axios.get(`${N8N_CONFIG.baseUrl}/api/v1/credentials`, {
                headers: N8N_CONFIG.headers
            });

            const credentials = response.data.data;
            console.log(`📋 Found credentials: ${credentials.length}`);

            const foundNames = credentials.map(cred => cred.name);
            const missing = this.expectedCredentials.filter(name => !foundNames.includes(name));
            const extra = foundNames.filter(name => !this.expectedCredentials.includes(name));

            console.log('\n✅ VERIFICATION RESULTS');
            console.log('=======================');
            console.log(`✅ Found: ${credentials.length}`);
            console.log(`❌ Missing: ${missing.length}`);
            console.log(`➕ Extra: ${extra.length}`);

            if (missing.length > 0) {
                console.log('\n❌ MISSING CREDENTIALS:');
                missing.forEach(name => console.log(`   - ${name}`));
            }

            if (extra.length > 0) {
                console.log('\n➕ EXTRA CREDENTIALS:');
                extra.forEach(name => console.log(`   - ${name}`));
            }

            console.log('\n📋 ALL CREDENTIALS:');
            credentials.forEach(cred => {
                const status = this.expectedCredentials.includes(cred.name) ? '✅' : '➕';
                console.log(`   ${status} ${cred.name} (${cred.type})`);
            });

            const successRate = Math.round(((this.expectedCredentials.length - missing.length) / this.expectedCredentials.length) * 100);
            console.log(`\n🎯 Success Rate: ${successRate}%`);

            return {
                total: credentials.length,
                expected: this.expectedCredentials.length,
                missing: missing.length,
                extra: extra.length,
                successRate: successRate
            };

        } catch (error) {
            console.log('❌ Failed to verify credentials:', error.response?.data?.message || error.message);
            return null;
        }
    }

    async run() {
        const result = await this.verifyCredentials();

        if (result) {
            if (result.successRate === 100) {
                console.log('\n🎉 All credentials are present and accounted for!');
            } else {
                console.log('\n⚠️  Some credentials are missing or extra.');
            }
        } else {
            console.log('\n❌ Verification failed');
        }
    }
}

// Run verification
const verifier = new N8NCredentialsVerifier();
verifier.run();

export { N8NCredentialsVerifier };
