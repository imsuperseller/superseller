#!/usr/bin/env node

/**
 * Add Tax4Us Credentials to n8n Cloud Instance
 * This script adds all the provided API keys to the Tax4Us n8n instance
 */

import https from 'https';

class Tax4UsCredentialManager {
    constructor() {
        this.baseUrl = 'https://tax4usllc.app.n8n.cloud';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw';

        this.credentials = {
            tavily: {
                name: 'Tax4Us Tavily API',
                type: 'httpHeaderAuth',
                data: {
                    name: 'Authorization',
                    value: 'Bearer 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'
                }
            },
            captivate: {
                name: 'Tax4Us Captivate.fm',
                type: 'httpHeaderAuth',
                data: {
                    name: 'xi-api-key',
                    value: 'cJ3zT4tcdgdRAhTf1tkJXOeS1O2LIyx2h01K8ag0'
                }
            },
            airtable: {
                name: 'Tax4Us Airtable',
                type: 'httpHeaderAuth',
                data: {
                    name: 'Authorization',
                    value: 'Bearer patnvGcDyEXcN6zbu.a5a237b0d3c661bc55cf83337a9128094dada5b58dcb145147fb89ecbbd779b3'
                }
            },
            wordpress: {
                name: 'Tax4Us WordPress',
                type: 'wordpressApi',
                data: {
                    url: 'https://tax4us.co.il',
                    username: 'admin',
                    password: 'E9ZW uijF JTWc 9IXB pJLR 3JsG'
                }
            },
            claude: {
                name: 'Tax4Us Claude API',
                type: 'anthropicApi',
                data: {
                    apiKey: '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'
                }
            },
            serpapi: {
                name: 'Tax4Us SerpAPI',
                type: 'serpApi',
                data: {
                    apiKey: '23a725585c44b67fc5fe617514538b7f22639179d5e7e10bf7b397ebf6d45ba3'
                }
            }
        };
    }

    async makeRequest(method, endpoint, data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, this.baseUrl);

            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                const postData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve({
                            statusCode: res.statusCode,
                            data: parsed
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            data: responseData
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async addCredential(credentialName, credentialData) {
        try {
            console.log(`\n🔑 Adding ${credentialName}...`);

            const response = await this.makeRequest('POST', '/api/v1/credentials', credentialData);

            if (response.statusCode === 201 || response.statusCode === 200) {
                console.log(`✅ ${credentialName} added successfully`);
                return { success: true, data: response.data };
            } else {
                console.log(`❌ Failed to add ${credentialName}: ${response.statusCode}`);
                console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
                return { success: false, error: response.data };
            }
        } catch (error) {
            console.log(`❌ Error adding ${credentialName}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async addAllCredentials() {
        console.log('🚀 Starting Tax4Us Credential Addition Process...');
        console.log(`📡 Target: ${this.baseUrl}`);

        const results = {};

        for (const [key, credential] of Object.entries(this.credentials)) {
            results[key] = await this.addCredential(credential.name, credential);

            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n📊 SUMMARY:');
        console.log('===========');

        let successCount = 0;
        let failureCount = 0;

        for (const [key, result] of Object.entries(results)) {
            if (result.success) {
                console.log(`✅ ${key}: SUCCESS`);
                successCount++;
            } else {
                console.log(`❌ ${key}: FAILED - ${result.error}`);
                failureCount++;
            }
        }

        console.log(`\n🎯 Results: ${successCount} successful, ${failureCount} failed`);

        if (successCount === Object.keys(this.credentials).length) {
            console.log('\n🎉 All credentials added successfully!');
        } else {
            console.log('\n⚠️  Some credentials failed to add. Check the errors above.');
        }

        return results;
    }

    async testConnection() {
        try {
            console.log('🔍 Testing connection to Tax4Us n8n instance...');
            const response = await this.makeRequest('GET', '/api/v1/workflows');

            if (response.statusCode === 200) {
                console.log('✅ Connection successful!');
                console.log(`📊 Found ${response.data.data?.length || 0} workflows`);
                return true;
            } else {
                console.log(`❌ Connection failed: ${response.statusCode}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Connection error: ${error.message}`);
            return false;
        }
    }
}

// Main execution
async function main() {
    const manager = new Tax4UsCredentialManager();

    // Test connection first
    const connected = await manager.testConnection();

    if (!connected) {
        console.log('❌ Cannot connect to Tax4Us n8n instance. Exiting.');
        process.exit(1);
    }

    // Add all credentials
    await manager.addAllCredentials();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} else {
    // Also run if no arguments or if this is the main module
    main().catch(console.error);
}

export default Tax4UsCredentialManager;
