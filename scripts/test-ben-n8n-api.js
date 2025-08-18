#!/usr/bin/env node
import axios from 'axios';

class BenN8nAPITester {
  constructor() {
    this.baseUrl = 'https://tax4usllc.app.n8n.cloud';
    this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8';
    
    this.endpoints = [
      '/api/v1/health',
      '/api/v1/healthz',
      '/health',
      '/healthz',
      '/api/health',
      '/api/v1/workflows',
      '/api/workflows',
      '/workflows',
      '/api/v1/credentials',
      '/api/credentials',
      '/credentials'
    ];
  }

  async testEndpoint(endpoint) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return { success: true, status: response.status, data: response.data };
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.code} - ${error.message}`);
      return { success: false, error: error.message, status: error.response?.status };
    }
  }

  async testWithoutAuth(endpoint) {
    try {
      console.log(`🔍 Testing (no auth): ${endpoint}`);
      
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        timeout: 10000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return { success: true, status: response.status, data: response.data };
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.code} - ${error.message}`);
      return { success: false, error: error.message, status: error.response?.status };
    }
  }

  async testAllEndpoints() {
    console.log('🔍 BEN GINATI n8n CLOUD API DIAGNOSTICS');
    console.log('========================================');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`🔑 API Key: ${this.apiKey.substring(0, 50)}...`);
    console.log('');
    
    const results = [];
    
    // Test with authentication
    console.log('🔐 TESTING WITH AUTHENTICATION:');
    console.log('===============================');
    
    for (const endpoint of this.endpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push({ endpoint, ...result });
      console.log('');
    }
    
    // Test without authentication
    console.log('🔓 TESTING WITHOUT AUTHENTICATION:');
    console.log('==================================');
    
    const noAuthEndpoints = ['/api/v1/health', '/health', '/api/v1/workflows'];
    for (const endpoint of noAuthEndpoints) {
      const result = await this.testWithoutAuth(endpoint);
      results.push({ endpoint: `${endpoint} (no auth)`, ...result });
      console.log('');
    }
    
    // Summary
    console.log('📊 DIAGNOSTIC SUMMARY:');
    console.log('======================');
    
    const working = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Working endpoints: ${working.length}`);
    console.log(`❌ Failed endpoints: ${failed.length}`);
    
    if (working.length > 0) {
      console.log('\n✅ WORKING ENDPOINTS:');
      working.forEach(result => {
        console.log(`   - ${result.endpoint} (${result.status})`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      failed.forEach(result => {
        console.log(`   - ${result.endpoint} (${result.status || 'timeout'})`);
      });
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    
    if (working.length === 0) {
      console.log('❌ No working endpoints found');
      console.log('🔧 Possible issues:');
      console.log('   - API key may be invalid or expired');
      console.log('   - n8n Cloud instance may be down');
      console.log('   - Network connectivity issues');
      console.log('   - Different API version or structure');
    } else {
      console.log('✅ Found working endpoints');
      console.log('🚀 Can proceed with agent activation using working endpoints');
    }
    
    return results;
  }
}

// Execute diagnostics
const tester = new BenN8nAPITester();

async function main() {
  const results = await tester.testAllEndpoints();
  
  // Return results for potential use
  return results;
}

main().catch(console.error);
