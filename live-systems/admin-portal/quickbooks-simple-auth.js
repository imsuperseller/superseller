#!/usr/bin/env node

// Simple QuickBooks Manual Authentication
// This script generates the auth URL and helps with manual token exchange

const axios = require('axios');

class QuickBooksSimpleAuth {
    constructor() {
        this.config = {
            clientId: 'ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f',
            clientSecret: 'Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j',
            realmId: '9341454031329905',
            redirectUri: 'https://rensto.com/oauth/callback',
            scope: 'com.intuit.quickbooks.accounting'
        };
    }

    generateAuthUrl() {
        console.log('🔄 QUICKBOOKS MANUAL AUTHENTICATION');
        console.log('====================================\n');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scope,
            state: 'rensto-quickbooks-auth-' + Date.now()
        });

        const authUrl = `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;

        console.log('📋 Step 1: Visit this URL in your browser:');
        console.log('==========================================');
        console.log(authUrl);
        console.log('\n📋 Step 2: Complete the authentication process');
        console.log('==============================================');
        console.log('1. Sign in to your QuickBooks account');
        console.log('2. Authorize the Rensto application');
        console.log('3. You will be redirected to: https://rensto.com/oauth/callback?code=YOUR_AUTH_CODE');
        console.log('4. Copy the authorization code from the URL');
        console.log('\n📋 Step 3: Use the token exchange script');
        console.log('=========================================');
        console.log('Run: node scripts/exchange-auth-code.js YOUR_AUTH_CODE');

        return authUrl;
    }

    async exchangeCodeForTokens(authorizationCode) {
        console.log('\n🔄 EXCHANGING AUTHORIZATION CODE FOR TOKENS');
        console.log('============================================\n');

        const endpoints = [
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            'https://accounts.platform.intuit.com/oauth2/v1/tokens/bearer'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                
                const formData = new URLSearchParams();
                formData.append('grant_type', 'authorization_code');
                formData.append('code', authorizationCode);
                formData.append('redirect_uri', this.config.redirectUri);

                const response = await axios.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
                    },
                    timeout: 30000
                });

                if (response.data.access_token) {
                    console.log(`✅ Success with ${endpoint}`);
                    return {
                        success: true,
                        data: {
                            accessToken: response.data.access_token,
                            refreshToken: response.data.refresh_token,
                            expiresIn: response.data.expires_in,
                            tokenType: response.data.token_type,
                            realmId: response.data.realmId || this.config.realmId
                        }
                    };
                }

            } catch (error) {
                console.log(`❌ Failed: ${error.response?.status || error.message}`);
                if (error.response?.data) {
                    console.log(`   Error details: ${JSON.stringify(error.response.data)}`);
                }
            }
        }

        return { success: false, error: 'All token exchange endpoints failed' };
    }

    async testNewTokens(accessToken) {
        console.log('\n🧪 TESTING NEW TOKENS');
        console.log('=====================\n');

        try {
            const response = await axios.get(`https://quickbooks.api.intuit.com/v3/company/${this.config.realmId}/companyinfo/${this.config.realmId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            console.log('✅ API test successful');
            console.log(`Company: ${response.data.CompanyInfo.CompanyName}`);
            console.log(`Email: ${response.data.CompanyInfo.Email?.Address}`);

            return { success: true, data: response.data };

        } catch (error) {
            console.log(`❌ API test failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    saveNewCredentials(tokens) {
        const fs = require('fs');

        // Save to JSON file
        const credentialsFile = './quickbooks-fresh-credentials.json';
        const credentialsData = {
            ...tokens,
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            realmId: tokens.realmId || this.config.realmId,
            obtainedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
        };

        fs.writeFileSync(credentialsFile, JSON.stringify(credentialsData, null, 2));
        console.log(`✅ Credentials saved to: ${credentialsFile}`);

        // Create environment variables file
        const envContent = `# QuickBooks API Credentials (Fresh Authentication)
QUICKBOOKS_CLIENT_ID=${this.config.clientId}
QUICKBOOKS_CLIENT_SECRET=${this.config.clientSecret}
QUICKBOOKS_REALM_ID=${tokens.realmId || this.config.realmId}
QUICKBOOKS_ACCESS_TOKEN=${tokens.accessToken}
QUICKBOOKS_REFRESH_TOKEN=${tokens.refreshToken}
QUICKBOOKS_TOKEN_TYPE=${tokens.tokenType}
QUICKBOOKS_EXPIRES_IN=${tokens.expiresIn}
QUICKBOOKS_OBTAINED_AT=${new Date().toISOString()}
QUICKBOOKS_EXPIRES_AT=${new Date(Date.now() + tokens.expiresIn * 1000).toISOString()}
`;

        const envFile = './quickbooks-fresh-credentials.env';
        fs.writeFileSync(envFile, envContent);
        console.log(`✅ Environment file created: ${envFile}`);

        // Display credentials summary
        console.log('\n🔑 NEW CREDENTIALS SUMMARY:');
        console.log('==========================');
        console.log(`Access Token: ${tokens.accessToken.substring(0, 50)}...`);
        console.log(`Refresh Token: ${tokens.refreshToken}`);
        console.log(`Token Type: ${tokens.tokenType}`);
        console.log(`Expires In: ${tokens.expiresIn} seconds`);
        console.log(`Expires At: ${new Date(Date.now() + tokens.expiresIn * 1000).toISOString()}`);
        console.log(`Realm ID: ${tokens.realmId || this.config.realmId}`);

        return { credentialsFile, envFile };
    }
}

// Execute based on command line arguments
async function main() {
    const auth = new QuickBooksSimpleAuth();
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Generate auth URL
        auth.generateAuthUrl();
    } else if (args.length === 1) {
        // Exchange authorization code
        const authCode = args[0];
        console.log(`🔄 Exchanging authorization code: ${authCode.substring(0, 20)}...`);
        
        const result = await auth.exchangeCodeForTokens(authCode);
        
        if (result.success) {
            console.log('✅ Token exchange successful!');
            
            // Test the new tokens
            await auth.testNewTokens(result.data.accessToken);
            
            // Save credentials
            auth.saveNewCredentials(result.data);
            
            console.log('\n🎉 AUTHENTICATION COMPLETE!');
            console.log('============================');
            console.log('✅ New QuickBooks credentials are ready to use');
            console.log('✅ Update your environment variables with the new credentials');
            console.log('✅ Test the Ben Ginati payment verification');
            
        } else {
            console.log('❌ Token exchange failed:', result.error);
            process.exit(1);
        }
    } else {
        console.log('Usage:');
        console.log('  node scripts/quickbooks-simple-auth.js                    # Generate auth URL');
        console.log('  node scripts/quickbooks-simple-auth.js YOUR_AUTH_CODE     # Exchange code for tokens');
    }
}

if (require.main === module) {
    main();
}

module.exports = QuickBooksSimpleAuth;
