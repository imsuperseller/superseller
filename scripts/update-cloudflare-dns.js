#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🔄 UPDATE CLOUDFLARE DNS RECORDS
 * 
 * Update existing DNS records to point to correct Vercel URLs
 */

class CloudflareDNSUpdater {
  constructor() {
    this.config = {
      apiToken: 'O3pJlV8j-0Jw90xEK0394GLU145heSAOpSJFMqJ2',
      domain: 'rensto.com',
      baseUrl: 'https://api.cloudflare.com/client/v4',
      zoneId: '031333b77c859d1dd4d4fd4afdc1b9bc'
    };

    // Correct Vercel URL from our investigation
    this.correctTarget = 'my-website-loc54ui0j-shais-projects-f9b9e359.vercel.app';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllDNSRecords() {
    console.log('📋 Fetching all DNS records...');
    
    try {
      const response = await axios.get(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        console.log(`✅ Found ${response.data.result.length} total DNS records`);
        return response.data.result;
      } else {
        throw new Error('Failed to fetch DNS records');
      }
    } catch (error) {
      console.error('❌ Failed to fetch DNS records:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateDNSRecord(recordId, recordName, newTarget) {
    console.log(`🔄 Updating DNS record: ${recordName}.${this.config.domain} → ${newTarget}`);
    
    try {
      const dnsRecord = {
        type: 'CNAME',
        name: recordName,
        content: newTarget,
        proxied: true,
        ttl: 1
      };

      const response = await axios.put(`${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records/${recordId}`, dnsRecord, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        console.log(`✅ Updated DNS record: ${recordName}.${this.config.domain}`);
        return response.data.result;
      } else {
        throw new Error('Failed to update DNS record');
      }
    } catch (error) {
      console.error(`❌ Failed to update DNS record ${recordName}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async updateCustomerRecords() {
    console.log('🔍 Finding customer DNS records to update...');
    
    try {
      const allRecords = await this.getAllDNSRecords();
      
      // Find records that need updating
      const recordsToUpdate = allRecords.filter(record => 
        record.type === 'CNAME' && 
        (record.name === 'ben-ginati.rensto.com' || 
         record.name === 'shelly-mizrahi.rensto.com' || 
         record.name === 'test-customer.rensto.com') &&
        record.content !== this.correctTarget
      );

      console.log(`🎯 Found ${recordsToUpdate.length} records that need updating`);

      const results = [];
      for (const record of recordsToUpdate) {
        try {
          console.log(`\n📝 Current: ${record.name} → ${record.content}`);
          console.log(`📝 New: ${record.name} → ${this.correctTarget}`);
          
          const updated = await this.updateDNSRecord(record.id, record.name, this.correctTarget);
          results.push({
            name: record.name,
            oldTarget: record.content,
            newTarget: this.correctTarget,
            success: true,
            recordId: record.id
          });
        } catch (error) {
          results.push({
            name: record.name,
            oldTarget: record.content,
            newTarget: this.correctTarget,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Failed to update customer records:', error.message);
      throw error;
    }
  }

  async generateReport(results) {
    console.log('📊 Generating DNS update report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      domain: this.config.domain,
      correctTarget: this.correctTarget,
      updates: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };

    const configDir = 'data/cloudflare-dns';
    await fs.mkdir(configDir, { recursive: true });
    const filepath = path.join(configDir, 'dns-update-report.json');
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    
    console.log(`💾 Update report saved: ${filepath}`);
    return report;
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const updater = new CloudflareDNSUpdater();
  
  try {
    console.log('🔄 Starting Cloudflare DNS update process...\n');
    
    const results = await updater.updateCustomerRecords();
    const report = await updater.generateReport(results);
    
    console.log('\n🎉 DNS update process completed!');
    console.log('📋 Results:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.name}: ${result.oldTarget} → ${result.newTarget}`);
      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    console.log(`\n📊 Summary: ${report.summary.successful}/${report.summary.total} successful`);
    console.log('🔧 DNS records now pointing to correct Vercel deployment');
    
  } catch (error) {
    console.error('❌ DNS update process failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CloudflareDNSUpdater;
