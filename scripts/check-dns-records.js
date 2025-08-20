#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import https from 'https';

/**
 * 🔍 CHECK CURRENT DNS RECORDS
 * 
 * Display current DNS records to verify configuration
 */

class DNSChecker {
  constructor() {
    this.config = {
      apiToken: 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2',
      domain: 'rensto.com',
      baseUrl: 'https://api.cloudflare.com/client/v4',
      zoneId: '031333b77c859d1dd4d4fd4afdc1b9bc'
    };
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async checkDNSRecords() {
    console.log('🔍 Checking current DNS records...\n');

    try {
      const response = await axios.get(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        const allRecords = response.data.result;

        // Filter for customer and relevant records
        const relevantRecords = allRecords.filter(record =>

          record.name === 'shelly-mizrahi.rensto.com' ||
          record.name === 'tax4us.rensto.com' ||
          record.name === 'www.rensto.com' ||
          record.name === 'test-customer.rensto.com' ||
          record.name === 'rensto.com'
        );

        console.log('📋 Current DNS Records:');
        console.log('========================');

        relevantRecords.forEach(record => {
          console.log(`\n📝 ${record.name}`);
          console.log(`   Type: ${record.type}`);
          console.log(`   Target: ${record.content}`);
          console.log(`   Proxied: ${record.proxied ? '☁️ Yes' : '🔒 No'}`);
          console.log(`   TTL: ${record.ttl === 1 ? 'Auto' : record.ttl + 's'}`);
          console.log(`   ID: ${record.id}`);
        });

        console.log(`\n✅ Found ${relevantRecords.length} relevant DNS records`);

        // Check if records are pointing to correct targets
        console.log('\n🎯 Verification:');
        const customerRecords = relevantRecords.filter(r =>
          r.name.includes('ben-ginati') ||
          r.name.includes('shelly-mizrahi') ||
          r.name.includes('tax4us') ||
          r.name.includes('test-customer')
        );

        customerRecords.forEach(record => {
          const isCorrect = record.content === 'rensto-business-system-jj6yl2a9v-shais-projects-f9b9e359.vercel.app';
          const status = isCorrect ? '✅' : '❌';
          console.log(`   ${status} ${record.name} → ${record.content}`);
        });

        return relevantRecords;
      } else {
        throw new Error('Failed to fetch DNS records');
      }
    } catch (error) {
      console.error('❌ Failed to check DNS records:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Cloudflare API configuration
const CLOUDFLARE_API_TOKEN = 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2';
const ZONE_ID = '031333b77c859d1dd4d4fd4afdc1b9bc';

async function makeCloudflareRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(error);
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

async function checkDNSRecords() {
  try {
    console.log('🔍 Checking DNS records for tax4us.rensto.com...');
    
    const dnsResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records?name=tax4us.rensto.com`);
    console.log('DNS records for tax4us.rensto.com:', JSON.stringify(dnsResponse, null, 2));
    
    if (dnsResponse.result && dnsResponse.result.length > 0) {
      console.log('\n📋 Current DNS records:');
      dnsResponse.result.forEach((record, index) => {
        console.log(`${index + 1}. Type: ${record.type}, Name: ${record.name}, Content: ${record.content}, Proxied: ${record.proxied}`);
      });
    } else {
      console.log('❌ No DNS records found for tax4us.rensto.com');
    }
    
    // Also check for any CNAME records that might be causing issues
    console.log('\n🔍 Checking all CNAME records...');
    const allCnameResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records?type=CNAME`);
    console.log('All CNAME records:', JSON.stringify(allCnameResponse, null, 2));
    
  } catch (error) {
    console.error('Error checking DNS records:', error);
  }
}

async function fixDNSRecords() {
  try {
    console.log('\n🔧 Fixing DNS records...');
    
    // Get current DNS records
    const dnsResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records?name=tax4us.rensto.com`);
    
    if (dnsResponse.result && dnsResponse.result.length > 0) {
      // Delete existing records
      for (const record of dnsResponse.result) {
        console.log(`🗑️ Deleting record: ${record.type} ${record.name} → ${record.content}`);
        await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records/${record.id}`, 'DELETE');
      }
    }
    
    // Create correct CNAME record
    const correctCnameRecord = {
      type: 'CNAME',
      name: 'tax4us',
      content: 'rensto-business-system-6n3mo5ki4-shais-projects-f9b9e359.vercel.app',
      proxied: true,
      ttl: 1
    };
    
    console.log('✅ Creating correct CNAME record:', JSON.stringify(correctCnameRecord, null, 2));
    const createResponse = await makeCloudflareRequest(`/client/v4/zones/${ZONE_ID}/dns_records`, 'POST', correctCnameRecord);
    console.log('Create response:', JSON.stringify(createResponse, null, 2));
    
  } catch (error) {
    console.error('Error fixing DNS records:', error);
  }
}

async function main() {
  console.log('🚀 DNS Record Checker and Fixer');
  console.log('================================');
  
  await checkDNSRecords();
  console.log('\n');
  await fixDNSRecords();
  
  console.log('\n✅ Done! Please wait a few minutes for DNS propagation and check https://tax4us.rensto.com again.');
}

main().catch(console.error);

export default DNSChecker;
