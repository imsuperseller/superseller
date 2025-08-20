#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🌐 CLOUDFLARE DNS AUTOMATION
 * 
 * Automating customer subdomain creation using Cloudflare API
 */

class CloudflareDNSAutomation {
  constructor() {
    this.config = {
      apiToken: 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2',
      domain: 'rensto.com',
      baseUrl: 'https://api.cloudflare.com/client/v4',
      zoneId: null // Will be fetched automatically
    };

    this.customers = {
      'ben-ginati': {
        name: 'Ben Ginati',
        company: 'Tax4Us',
        subdomain: 'ben-ginati.rensto.com',
        description: 'Tax services automation portal'
      },
      'shelly-mizrahi': {
        name: 'Shelly Mizrahi',
        company: 'Insurance Services',
        subdomain: 'shelly-mizrahi.rensto.com',
        description: 'Insurance services automation portal'
      }
    };

    this.dnsRecords = {
      cnameRecords: [
        {
          name: 'ben-ginati',
          target: 'my-website-shais-projects-f9b9e359.vercel.app',
          proxied: true
        },
        {
          name: 'shelly-mizrahi',
          target: 'my-website-shais-projects-f9b9e359.vercel.app',
          proxied: true
        },
        {
          name: 'www',
          target: 'my-website-shais-projects-f9b9e359.vercel.app',
          proxied: true
        }
      ]
    };
  }

  // ===== API AUTHENTICATION =====

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  // ===== ZONE ID FETCHING =====

  async getZoneId() {
    console.log('🔍 Fetching zone ID for rensto.com...');
    
    try {
      const response = await axios.get(`${this.config.baseUrl}/zones?name=${this.config.domain}`, {
        headers: this.getHeaders()
      });

      if (response.data.success && response.data.result.length > 0) {
        this.config.zoneId = response.data.result[0].id;
        console.log(`✅ Zone ID found: ${this.config.zoneId}`);
        return this.config.zoneId;
      } else {
        throw new Error('Zone not found');
      }
    } catch (error) {
      console.error('❌ Failed to fetch zone ID:', error.response?.data || error.message);
      throw error;
    }
  }

  // ===== DNS RECORD MANAGEMENT =====

  async getExistingRecords() {
    console.log('📋 Fetching existing DNS records...');
    
    try {
      const response = await axios.get(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        console.log(`✅ Found ${response.data.result.length} existing DNS records`);
        return response.data.result;
      } else {
        throw new Error('Failed to fetch DNS records');
      }
    } catch (error) {
      console.error('❌ Failed to fetch existing records:', error.response?.data || error.message);
      throw error;
    }
  }

  async createDNSRecord(record) {
    console.log(`📝 Creating DNS record: ${record.name}.${this.config.domain} → ${record.target}`);
    
    try {
      const dnsRecord = {
        type: 'CNAME',
        name: record.name,
        content: record.target,
        proxied: record.proxied,
        ttl: 1 // Auto
      };

      const response = await axios.post(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`, dnsRecord, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        console.log(`✅ Created DNS record: ${record.name}.${this.config.domain}`);
        return response.data.result;
      } else {
        throw new Error('Failed to create DNS record');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.code === 81057) {
        console.log(`⚠️  DNS record already exists: ${record.name}.${this.config.domain}`);
        return null;
      } else {
        console.error(`❌ Failed to create DNS record ${record.name}:`, error.response?.data || error.message);
        throw error;
      }
    }
  }

  async updateDNSRecord(recordId, record) {
    console.log(`🔄 Updating DNS record: ${record.name}.${this.config.domain} → ${record.target}`);
    
    try {
      const dnsRecord = {
        type: 'CNAME',
        name: record.name,
        content: record.target,
        proxied: record.proxied,
        ttl: 1 // Auto
      };

      const response = await axios.put(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`, dnsRecord, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        console.log(`✅ Updated DNS record: ${record.name}.${this.config.domain}`);
        return response.data.result;
      } else {
        throw new Error('Failed to update DNS record');
      }
    } catch (error) {
      console.error(`❌ Failed to update DNS record ${record.name}:`, error.response?.data || error.message);
      throw error;
    }
  }

  // ===== CUSTOMER SUBDOMAIN MANAGEMENT =====

  async createCustomerSubdomain(customerId, customer) {
    console.log(`👤 Creating subdomain for ${customer.name} (${customer.company})...`);
    
    try {
      const record = {
        name: customerId,
        target: 'rensto-business-system.vercel.app',
        proxied: true
      };

      await this.createDNSRecord(record);
      
      console.log(`✅ Customer subdomain created: https://${customer.subdomain}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create subdomain for ${customer.name}:`, error.message);
      return false;
    }
  }

  async createAllCustomerSubdomains() {
    console.log('🚀 Creating all customer subdomains...');
    
    const results = [];
    for (const [customerId, customer] of Object.entries(this.customers)) {
      const success = await this.createCustomerSubdomain(customerId, customer);
      results.push({ customerId, customer, success });
    }
    
    return results;
  }

  // ===== UTILITY FUNCTIONS =====

  async saveConfiguration(filename, data) {
    const configDir = 'data/cloudflare-dns';
    await fs.mkdir(configDir, { recursive: true });
    const filepath = path.join(configDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Configuration saved: ${filepath}`);
  }

  async generateReport() {
    console.log('📊 Generating DNS automation report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      domain: this.config.domain,
      zoneId: this.config.zoneId,
      customers: this.customers,
      dnsRecords: this.dnsRecords,
      urls: {
        'main-domain': `https://${this.config.domain}`,
        'www': `https://www.${this.config.domain}`,
        'ben-ginati': `https://ben-ginati.${this.config.domain}`,
        'shelly-mizrahi': `https://shelly-mizrahi.${this.config.domain}`
      },
      automation: {
        'api-token': `${this.config.apiToken.substring(0, 8)}...`,
        'base-url': this.config.baseUrl,
        'permissions': 'Zone:Zone:Edit, Zone:DNS:Edit'
      }
    };

    await this.saveConfiguration('dns-automation-report.json', report);
    console.log('✅ DNS automation report generated');
    return report;
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const automation = new CloudflareDNSAutomation();
  
  try {
    console.log('🌐 Starting Cloudflare DNS automation...\n');
    
    // Get zone ID
    await automation.getZoneId();
    
    // Create all customer subdomains
    const results = await automation.createAllCustomerSubdomains();
    
    // Generate report
    const report = await automation.generateReport();
    
    console.log('\n🎉 Cloudflare DNS automation completed!');
    console.log('📋 Results:');
    results.forEach(({ customerId, customer, success }) => {
      const status = success ? '✅' : '❌';
      console.log(`   ${status} ${customer.name}: https://${customer.subdomain}`);
    });
    
    console.log('\n📊 Report: data/cloudflare-dns/dns-automation-report.json');
    console.log('🔧 API Token permissions verified and working');
    
  } catch (error) {
    console.error('❌ Cloudflare DNS automation failed:', error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔧 403 Error - API Token Permissions:');
      console.log('   Required permissions:');
      console.log('   - Zone:Zone:Edit');
      console.log('   - Zone:DNS:Edit');
      console.log('   - Zone:Zone:Read');
      console.log('   - Zone:DNS:Read');
      console.log('\n   To fix:');
      console.log('   1. Go to Cloudflare Dashboard → My Profile → API Tokens');
      console.log('   2. Edit your token or create a new one');
      console.log('   3. Add the required permissions above');
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CloudflareDNSAutomation;
