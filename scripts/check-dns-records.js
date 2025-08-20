#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

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
          record.name === 'ben-ginati.rensto.com' || 
          record.name === 'shelly-mizrahi.rensto.com' || 
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
          r.name.includes('test-customer')
        );
        
        customerRecords.forEach(record => {
          const isCorrect = record.content === 'my-website-shais-projects-f9b9e359.vercel.app';
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

// ===== MAIN EXECUTION =====

async function main() {
  const checker = new DNSChecker();
  
  try {
    await checker.checkDNSRecords();
  } catch (error) {
    console.error('❌ DNS check failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DNSChecker;
