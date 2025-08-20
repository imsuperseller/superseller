#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🔍 GoDaddy API Diagnostic Test
 * 
 * Testing API connection and permissions
 */

class GoDaddyAPITest {
    constructor() {
        this.config = {
            apiKey: 'dKD5Sm7u97jW_EfhnTe8cAYwf9FSZomyZwg',
            apiSecret: 'L8FvUJhwjwpp6r1XNUPa7',
            domain: 'rensto.com',
            baseUrl: 'https://api.godaddy.com/v1'
        };
    }

    async testAPIConnection() {
        console.log('🔍 Testing GoDaddy API connection...\n');

        try {
            // Test 1: Basic API connection
            console.log('📡 Test 1: Basic API connection...');
            const response = await axios.get(`${this.config.baseUrl}/domains`, {
                headers: {
                    'Authorization': `sso-key ${this.config.apiKey}:${this.config.apiSecret}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ API connection successful!');
            console.log(`📊 Found ${response.data.length} domains`);

            // Test 2: Check specific domain access
            console.log('\n📡 Test 2: Domain access check...');
            const domainResponse = await axios.get(`${this.config.baseUrl}/domains/${this.config.domain}`, {
                headers: {
                    'Authorization': `sso-key ${this.config.apiKey}:${this.config.apiSecret}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Domain access successful!');
            console.log(`🌐 Domain: ${domainResponse.data.domain}`);
            console.log(`📅 Expires: ${domainResponse.data.expires}`);

            // Test 3: Check DNS records
            console.log('\n📡 Test 3: DNS records access...');
            const dnsResponse = await axios.get(`${this.config.baseUrl}/domains/${this.config.domain}/records`, {
                headers: {
                    'Authorization': `sso-key ${this.config.apiKey}:${this.config.apiSecret}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ DNS records access successful!');
            console.log(`📋 Found ${dnsResponse.data.length} DNS records`);

            // Display current DNS records
            console.log('\n📋 Current DNS Records:');
            dnsResponse.data.forEach((record, index) => {
                console.log(`  ${index + 1}. ${record.type} ${record.name} → ${record.data} (TTL: ${record.ttl})`);
            });

            return {
                success: true,
                domains: response.data.length,
                currentRecords: dnsResponse.data.length,
                domainInfo: domainResponse.data
            };

        } catch (error) {
            console.log('❌ API test failed!');

            if (error.response) {
                console.log(`📊 Status: ${error.response.status}`);
                console.log(`📋 Status Text: ${error.response.statusText}`);
                console.log(`📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);

                // Provide specific guidance based on error
                if (error.response.status === 403) {
                    console.log('\n🔧 403 Error - Possible Solutions:');
                    console.log('   1. Check if API key is activated (may take 24 hours)');
                    console.log('   2. Verify domain ownership in GoDaddy account');
                    console.log('   3. Ensure API key has DNS management permissions');
                    console.log('   4. Check if domain is in the correct GoDaddy account');
                } else if (error.response.status === 401) {
                    console.log('\n🔧 401 Error - Possible Solutions:');
                    console.log('   1. Verify API key and secret are correct');
                    console.log('   2. Check if API key is active');
                    console.log('   3. Ensure no extra spaces in credentials');
                } else if (error.response.status === 404) {
                    console.log('\n🔧 404 Error - Possible Solutions:');
                    console.log('   1. Verify domain name is correct');
                    console.log('   2. Check if domain exists in GoDaddy account');
                    console.log('   3. Ensure domain is not expired');
                }
            } else if (error.request) {
                console.log('📡 Network Error: No response received');
                console.log('🔧 Possible Solutions:');
                console.log('   1. Check internet connection');
                console.log('   2. Verify GoDaddy API is accessible');
                console.log('   3. Check firewall settings');
            } else {
                console.log('❌ Error:', error.message);
            }

            return {
                success: false,
                error: error.response?.status || 'Network Error',
                details: error.response?.data || error.message
            };
        }
    }

    async testDNSRecordCreation() {
        console.log('\n🧪 Test 4: DNS record creation test...');

        try {
            // Test creating a temporary record
            const testRecord = {
                data: 'test.rensto.com',
                name: 'test',
                ttl: 600,
                type: 'CNAME'
            };

            console.log('📝 Attempting to create test DNS record...');
            const response = await axios.put(
                `${this.config.baseUrl}/domains/${this.config.domain}/records/CNAME/test`,
                [testRecord],
                {
                    headers: {
                        'Authorization': `sso-key ${this.config.apiKey}:${this.config.apiSecret}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ DNS record creation successful!');

            // Clean up - delete the test record
            console.log('🧹 Cleaning up test record...');
            await axios.delete(
                `${this.config.baseUrl}/domains/${this.config.domain}/records/CNAME/test`,
                {
                    headers: {
                        'Authorization': `sso-key ${this.config.apiKey}:${this.config.apiSecret}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Test record cleaned up successfully!');
            return true;

        } catch (error) {
            console.log('❌ DNS record creation test failed!');

            if (error.response) {
                console.log(`📊 Status: ${error.response.status}`);
                console.log(`📋 Status Text: ${error.response.statusText}`);
                console.log(`📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
            }

            return false;
        }
    }
}

// ===== MAIN EXECUTION =====

async function main() {
    const apiTest = new GoDaddyAPITest();

    try {
        console.log('🔍 GoDaddy API Diagnostic Test\n');
        console.log('📋 Configuration:');
        console.log(`   Domain: ${apiTest.config.domain}`);
        console.log(`   API Base URL: ${apiTest.config.baseUrl}`);
        console.log(`   API Key: ${apiTest.config.apiKey.substring(0, 8)}...`);
        console.log(`   API Secret: ${apiTest.config.apiSecret.substring(0, 8)}...\n`);

        // Test basic API connection
        const connectionResult = await apiTest.testAPIConnection();

        if (connectionResult.success) {
            // Test DNS record creation if basic connection works
            await apiTest.testDNSRecordCreation();

            console.log('\n🎉 All API tests completed successfully!');
            console.log('✅ GoDaddy API is ready for DNS configuration');
        } else {
            console.log('\n❌ API tests failed');
            console.log('🔧 Please resolve the issues above before proceeding');
        }

    } catch (error) {
        console.error('❌ Diagnostic test failed:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default GoDaddyAPITest;
