#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';

/**
 * 🔒 CHECK CLOUDFLARE SSL/TLS SETTINGS
 * Verify and configure SSL settings for proper origin connection
 */

class CloudflareSSLChecker {
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

  async checkSSLSettings() {
    console.log('🔒 Checking Cloudflare SSL/TLS settings...\n');
    
    try {
      // Get SSL/TLS settings
      const sslResponse = await axios.get(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/settings/ssl`,
        { headers: this.getHeaders() }
      );

      if (sslResponse.data.success) {
        const sslSetting = sslResponse.data.result;
        console.log('📋 Current SSL/TLS Setting:', sslSetting.value);
        console.log('📝 Description:', sslSetting.editable ? 'Editable' : 'Not editable');
        
        // Check if we need to change it
        if (sslSetting.value !== 'full') {
          console.log('⚠️  SSL setting should be "full" for Vercel deployments');
          await this.updateSSLSetting('full');
        } else {
          console.log('✅ SSL setting is correct (full)');
        }
      }
    } catch (error) {
      console.error('❌ Failed to check SSL settings:', error.response?.data || error.message);
    }
  }

  async updateSSLSetting(value) {
    console.log(`🔄 Updating SSL setting to "${value}"...`);
    
    try {
      const response = await axios.patch(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/settings/ssl`,
        { value },
        { headers: this.getHeaders() }
      );

      if (response.data.success) {
        console.log('✅ SSL setting updated successfully!');
        return true;
      } else {
        throw new Error('Failed to update SSL setting');
      }
    } catch (error) {
      console.error('❌ Failed to update SSL setting:', error.response?.data || error.message);
      return false;
    }
  }

  async checkEdgeCertificates() {
    console.log('\n🔒 Checking Edge Certificates...');
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/ssl/certificate_packs`,
        { headers: this.getHeaders() }
      );

      if (response.data.success) {
        const certificates = response.data.result;
        console.log(`📋 Found ${certificates.length} certificate(s):`);
        
        certificates.forEach((cert, index) => {
          console.log(`   ${index + 1}. Type: ${cert.type}`);
          console.log(`      Status: ${cert.status}`);
          console.log(`      Hosts: ${cert.hosts.join(', ')}`);
          console.log(`      Validation Method: ${cert.validation_method}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to check certificates:', error.response?.data || error.message);
    }
  }

  async checkDNSSettings() {
    console.log('\n🌐 Checking DNS Settings...');
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/zones/${this.config.zoneId}/dns_records`,
        { headers: this.getHeaders() }
      );

      if (response.data.success) {
        const records = response.data.result;
        const customerRecords = records.filter(record => 
          record.name.includes('rensto.com') && record.type === 'CNAME'
        );
        
        console.log(`📋 Found ${customerRecords.length} customer CNAME records:`);
        
        customerRecords.forEach(record => {
          console.log(`   📝 ${record.name}`);
          console.log(`      Target: ${record.content}`);
          console.log(`      Proxied: ${record.proxied ? '☁️ Yes' : '❌ No'}`);
          console.log(`      TTL: ${record.ttl === 1 ? 'Auto' : record.ttl}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to check DNS settings:', error.response?.data || error.message);
    }
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const checker = new CloudflareSSLChecker();
  
  try {
    await checker.checkSSLSettings();
    await checker.checkEdgeCertificates();
    await checker.checkDNSSettings();
    
    console.log('\n🎉 SSL/TLS configuration check completed!');
    console.log('⏳ If SSL was updated, wait 2-5 minutes for changes to take effect...');
  } catch (error) {
    console.error('❌ SSL check failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CloudflareSSLChecker;
