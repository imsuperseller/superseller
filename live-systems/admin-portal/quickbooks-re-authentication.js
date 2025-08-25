#!/usr/bin/env node

// QuickBooks Re-Authentication Script
// This script handles the complete OAuth2 authentication flow for QuickBooks

const axios = require('axios');
const http = require('http');
const url = require('url');
const open = require('open');

class QuickBooksReAuthenticator {
    constructor() {
        this.config = {
            clientId: 'ABCqMFH2hc4AoEbcx9UzJBSruOKTKtLeosq4XZIqxm3Af9uV0f',
            clientSecret: 'Cf2WeEhdIZLoJCKs60YrR17yMeqLJmth2WaSuK3j',
            realmId: '9341454031329905',
            redirectUri: 'https://rensto.com/oauth/callback',
            scope: 'com.intuit.quickbooks.accounting',
            state: 'rensto-quickbooks-auth-' + Date.now()
        };

        this.authServer = null;
        this.authorizationCode = null;
    }

    async startReAuthentication() {
        console.log('🔄 QUICKBOOKS RE-AUTHENTICATION PROCESS');
        console.log('========================================\n');

        try {
            // Step 1: Generate authorization URL
            console.log('📋 Step 1: Generating Authorization URL');
            const authUrl = this.generateAuthorizationUrl();
            console.log(`✅ Authorization URL generated`);
            console.log(`🔗 URL: ${authUrl}\n`);

            // Step 2: Start local server to receive callback
            console.log('🌐 Step 2: Starting Local Callback Server');
            await this.startCallbackServer();
            console.log('✅ Callback server started on port 3001\n');

            // Step 3: Manual browser opening
            console.log('🌍 Step 3: Manual Browser Authentication');
            console.log('Please copy and paste this URL into your browser:');
            console.log(`\n${authUrl}\n`);
            console.log('Then complete the authentication process...\n');

            // Step 4: Wait for authorization code
            console.log('⏳ Step 4: Waiting for Authorization Code...');
            const authCode = await this.waitForAuthorizationCode();

            if (!authCode) {
                throw new Error('Authorization code not received');
            }

            console.log('✅ Authorization code received!\n');

            // Step 5: Exchange authorization code for tokens
            console.log('🔄 Step 5: Exchanging Authorization Code for Tokens');
            const tokens = await this.exchangeCodeForTokens(authCode);

            if (!tokens.success) {
                throw new Error('Failed to exchange code for tokens: ' + tokens.error);
            }

            console.log('✅ Tokens received successfully!\n');

            // Step 6: Test the new tokens
            console.log('🧪 Step 6: Testing New Tokens');
            const testResult = await this.testNewTokens(tokens.data.accessToken);

            if (testResult.success) {
                console.log('✅ New tokens work perfectly!\n');
            } else {
                console.log('⚠️ Token test failed, but tokens were received\n');
            }

            // Step 7: Save new credentials
            console.log('💾 Step 7: Saving New Credentials');
            this.saveNewCredentials(tokens.data);

            // Step 8: Cleanup
            this.cleanup();

            console.log('🎉 RE-AUTHENTICATION COMPLETE!');
            console.log('===============================');
            console.log('✅ New QuickBooks credentials are ready to use');
            console.log('✅ Update your environment variables with the new credentials');
            console.log('✅ Test the Ben Ginati payment verification');

            return { success: true, tokens: tokens.data };

        } catch (error) {
            console.error('❌ Re-authentication failed:', error.message);
            this.cleanup();
            return { success: false, error: error.message };
        }
    }

    generateAuthorizationUrl() {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scope,
            state: this.config.state
        });

        return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
    }

    startCallbackServer() {
        return new Promise((resolve, reject) => {
            this.authServer = http.createServer((req, res) => {
                const parsedUrl = url.parse(req.url, true);

                if (parsedUrl.pathname === '/oauth/callback') {
                    const { code, state, error } = parsedUrl.query;

                    if (error) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                    <h2 style="color: #d32f2f;">❌ Authentication Failed</h2>
                                    <p>Error: ${error}</p>
                                    <p>You can close this window and try again.</p>
                                </body>
                            </html>
                        `);
                        reject(new Error(`OAuth error: ${error}`));
                        return;
                    }

                    if (code && state === this.config.state) {
                        this.authorizationCode = code;

                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                    <h2 style="color: #4caf50;">✅ Authentication Successful!</h2>
                                    <p>Authorization code received successfully.</p>
                                    <p>You can close this window now.</p>
                                    <script>setTimeout(() => window.close(), 2000);</script>
                                </body>
                            </html>
                        `);

                        resolve();
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                                    <h2 style="color: #d32f2f;">❌ Invalid Response</h2>
                                    <p>Missing authorization code or invalid state.</p>
                                    <p>You can close this window and try again.</p>
                                </body>
                            </html>
                        `);
                        reject(new Error('Invalid OAuth response'));
                    }
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            });

            this.authServer.listen(3001, () => {
                console.log('   ✅ Callback server listening on port 3001');
                resolve();
            });

            this.authServer.on('error', (error) => {
                reject(error);
            });
        });
    }

    waitForAuthorizationCode(timeout = 300000) { // 5 minutes timeout
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout waiting for authorization code'));
            }, timeout);

            const checkCode = () => {
                if (this.authorizationCode) {
                    clearTimeout(timeoutId);
                    resolve(this.authorizationCode);
                } else {
                    setTimeout(checkCode, 1000);
                }
            };

            checkCode();
        });
    }

    async exchangeCodeForTokens(authorizationCode) {
        const endpoints = [
            'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
            'https://accounts.platform.intuit.com/oauth2/v1/tokens/bearer'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`   Trying endpoint: ${endpoint}`);

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
                    console.log(`   ✅ Success with ${endpoint}`);
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
                console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
                if (error.response?.data) {
                    console.log(`      Error details: ${JSON.stringify(error.response.data)}`);
                }
            }
        }

        return { success: false, error: 'All token exchange endpoints failed' };
    }

    async testNewTokens(accessToken) {
        try {
            const response = await axios.get(`https://quickbooks.api.intuit.com/v3/company/${this.config.realmId}/companyinfo/${this.config.realmId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            console.log('   ✅ API test successful');
            console.log(`   Company: ${response.data.CompanyInfo.CompanyName}`);
            console.log(`   Email: ${response.data.CompanyInfo.Email?.Address}`);

            return { success: true, data: response.data };

        } catch (error) {
            console.log(`   ❌ API test failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    saveNewCredentials(tokens) {
        const fs = require('fs');
        const path = require('path');

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
        console.log(`   ✅ Credentials saved to: ${credentialsFile}`);

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
        console.log(`   ✅ Environment file created: ${envFile}`);

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

    cleanup() {
        if (this.authServer) {
            this.authServer.close();
            console.log('   ✅ Callback server closed');
        }
    }
}

// Execute the re-authentication
async function main() {
    const authenticator = new QuickBooksReAuthenticator();

    try {
        const result = await authenticator.startReAuthentication();

        if (result.success) {
            console.log('\n📋 NEXT STEPS:');
            console.log('1. Copy the new credentials from quickbooks-fresh-credentials.env');
            console.log('2. Update your environment variables');
            console.log('3. Update the QuickBooks MCP server configuration');
            console.log('4. Test the Ben Ginati payment verification');
            console.log('5. Deploy the QuickBooks MCP server to Racknerd VPS');

        } else {
            console.log('\n❌ RE-AUTHENTICATION FAILED');
            console.log('Please check the error and try again.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Re-authentication execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = QuickBooksReAuthenticator;
