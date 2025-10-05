#!/usr/bin/env node

// QuickBooks Token Refresh Script
// This script refreshes the QuickBooks access token using the refresh token

const axios = require('axios');

class QuickBooksTokenRefresher {
    constructor() {
        this.config = {
            clientId: 'ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f',
            clientSecret: 'Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j',
            refreshToken: 'RT1-221-H0-1763094209oksbcubkf2wk7bfh6ll6',
            realmId: '9341454031329905'
        };
    }

    async refreshAccessToken() {
        console.log('🔄 REFRESHING QUICKBOOKS ACCESS TOKEN');
        console.log('=====================================\n');

        try {
            // Method 1: Try OAuth2 refresh token endpoint
            console.log('🔍 Method 1: OAuth2 Refresh Token Endpoint');
            const result1 = await this.tryOAuth2Refresh();
            
            if (result1.success) {
                console.log('✅ OAuth2 refresh successful!');
                this.saveNewCredentials(result1.data);
                return result1;
            }

            // Method 2: Try different OAuth endpoints
            console.log('\n🔍 Method 2: Alternative OAuth Endpoints');
            const result2 = await this.tryAlternativeEndpoints();
            
            if (result2.success) {
                console.log('✅ Alternative endpoint refresh successful!');
                this.saveNewCredentials(result2.data);
                return result2;
            }

            // Method 3: Try with authorization code
            console.log('\n🔍 Method 3: Authorization Code Flow');
            const result3 = await this.tryAuthorizationCode();
            
            if (result3.success) {
                console.log('✅ Authorization code flow successful!');
                this.saveNewCredentials(result3.data);
                return result3;
            }

            console.log('\n❌ All refresh methods failed');
            return { success: false, error: 'All refresh methods failed' };

        } catch (error) {
            console.error('❌ Token refresh failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async tryOAuth2Refresh() {
        const endpoints = [
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            'https://accounts.platform.intuit.com/oauth2/v1/tokens/bearer',
            'https://sandbox-oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`   Trying: ${endpoint}`);
                
                const response = await axios.post(endpoint, {
                    grant_type: 'refresh_token',
                    refresh_token: this.config.refreshToken
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
                    }
                });

                if (response.data.access_token) {
                    console.log(`   ✅ Success with ${endpoint}`);
                    return {
                        success: true,
                        data: {
                            accessToken: response.data.access_token,
                            refreshToken: response.data.refresh_token || this.config.refreshToken,
                            expiresIn: response.data.expires_in,
                            tokenType: response.data.token_type
                        }
                    };
                }

            } catch (error) {
                console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
            }
        }

        return { success: false, error: 'OAuth2 refresh failed' };
    }

    async tryAlternativeEndpoints() {
        const endpoints = [
            'https://oauth.platform.intuit.com/oauth2/v1/tokens',
            'https://accounts.platform.intuit.com/oauth2/v1/tokens',
            'https://oauth.intuit.com/oauth2/v1/tokens/bearer'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`   Trying: ${endpoint}`);
                
                const formData = new URLSearchParams();
                formData.append('grant_type', 'refresh_token');
                formData.append('refresh_token', this.config.refreshToken);

                const response = await axios.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
                    }
                });

                if (response.data.access_token) {
                    console.log(`   ✅ Success with ${endpoint}`);
                    return {
                        success: true,
                        data: {
                            accessToken: response.data.access_token,
                            refreshToken: response.data.refresh_token || this.config.refreshToken,
                            expiresIn: response.data.expires_in,
                            tokenType: response.data.token_type
                        }
                    };
                }

            } catch (error) {
                console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
            }
        }

        return { success: false, error: 'Alternative endpoints failed' };
    }

    async tryAuthorizationCode() {
        const authorizationCode = 'XAB11754368362HSLJbWm3k8jk5uXZwBfSx0rQM28QVJzYwleX';
        
        const endpoints = [
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            'https://accounts.platform.intuit.com/oauth2/v1/tokens/bearer'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`   Trying authorization code with: ${endpoint}`);
                
                const formData = new URLSearchParams();
                formData.append('grant_type', 'authorization_code');
                formData.append('code', authorizationCode);
                formData.append('redirect_uri', 'https://rensto.com/oauth/callback');

                const response = await axios.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
                    }
                });

                if (response.data.access_token) {
                    console.log(`   ✅ Success with authorization code`);
                    return {
                        success: true,
                        data: {
                            accessToken: response.data.access_token,
                            refreshToken: response.data.refresh_token || this.config.refreshToken,
                            expiresIn: response.data.expires_in,
                            tokenType: response.data.token_type
                        }
                    };
                }

            } catch (error) {
                console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
            }
        }

        return { success: false, error: 'Authorization code flow failed' };
    }

    saveNewCredentials(credentials) {
        console.log('\n💾 SAVING NEW CREDENTIALS');
        console.log('==========================');
        
        const fs = require('fs');
        const path = require('path');

        // Save to JSON file
        const credentialsFile = './quickbooks-new-credentials.json';
        fs.writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2));
        console.log(`✅ New credentials saved to: ${credentialsFile}`);

        // Create environment variables file
        const envContent = `# QuickBooks API Credentials (Refreshed)
QUICKBOOKS_CLIENT_ID=${this.config.clientId}
QUICKBOOKS_CLIENT_SECRET=${this.config.clientSecret}
QUICKBOOKS_REALM_ID=${this.config.realmId}
QUICKBOOKS_ACCESS_TOKEN=${credentials.accessToken}
QUICKBOOKS_REFRESH_TOKEN=${credentials.refreshToken}
QUICKBOOKS_TOKEN_TYPE=${credentials.tokenType}
QUICKBOOKS_EXPIRES_IN=${credentials.expiresIn}
`;

        const envFile = './quickbooks-credentials.env';
        fs.writeFileSync(envFile, envContent);
        console.log(`✅ Environment file created: ${envFile}`);

        // Display new credentials
        console.log('\n🔑 NEW CREDENTIALS:');
        console.log('==================');
        console.log(`Access Token: ${credentials.accessToken.substring(0, 50)}...`);
        console.log(`Refresh Token: ${credentials.refreshToken}`);
        console.log(`Token Type: ${credentials.tokenType}`);
        console.log(`Expires In: ${credentials.expiresIn} seconds`);
        console.log(`Expires At: ${new Date(Date.now() + credentials.expiresIn * 1000).toISOString()}`);

        return { credentialsFile, envFile };
    }

    async testNewCredentials(accessToken) {
        console.log('\n🧪 TESTING NEW CREDENTIALS');
        console.log('==========================');

        try {
            const response = await axios.get(`https://quickbooks.api.intuit.com/v3/company/${this.config.realmId}/companyinfo/${this.config.realmId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                }
            });

            console.log('✅ New credentials work!');
            console.log(`Company: ${response.data.CompanyInfo.CompanyName}`);
            console.log(`Email: ${response.data.CompanyInfo.Email?.Address}`);

            return { success: true, data: response.data };

        } catch (error) {
            console.log('❌ New credentials failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Execute the token refresh
async function main() {
    const refresher = new QuickBooksTokenRefresher();
    
    try {
        const result = await refresher.refreshAccessToken();
        
        if (result.success) {
            console.log('\n🎉 TOKEN REFRESH SUCCESSFUL!');
            console.log('============================');
            
            // Test the new credentials
            await refresher.testNewCredentials(result.data.accessToken);
            
            console.log('\n📋 NEXT STEPS:');
            console.log('1. Update your environment variables with the new credentials');
            console.log('2. Update the QuickBooks MCP server configuration');
            console.log('3. Test the Ben Ginati payment verification');
            
        } else {
            console.log('\n❌ TOKEN REFRESH FAILED');
            console.log('======================');
            console.log('The refresh token may be expired or invalid.');
            console.log('You may need to re-authenticate with QuickBooks.');
        }

    } catch (error) {
        console.error('❌ Token refresh execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = QuickBooksTokenRefresher;
