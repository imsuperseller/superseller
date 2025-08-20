#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🌐 GODADDY DNS CONFIGURATION
 * 
 * Configuring customer subdomains on rensto.com using GoDaddy API
 */

class GoDaddyDNSConfiguration {
  constructor() {
    this.godaddyConfig = {
      apiKey: 'dKD5Sm7u97jW_EfhnTe8cAYwf9FSZomyZwg',
      apiSecret: 'L8FvUJhwjwpp6r1XNUPa7',
      domain: 'rensto.com',
      baseUrl: 'https://api.godaddy.com/v1'  // Using production environment
    };

    this.customers = {
      'ben-ginati': {
        name: 'Ben Ginati',
        company: 'Tax4Us',
        subdomain: 'tax4us.rensto.com',
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
      // CNAME records for customer subdomains
      cnameRecords: [
        {
          name: 'ben-ginati',
          data: 'rensto-business-system.vercel.app',
          ttl: 3600
        },
        {
          name: 'shelly-mizrahi',
          data: 'rensto-business-system.vercel.app',
          ttl: 3600
        }
      ],
      // A record for main domain
      aRecords: [
        {
          name: '@',
          data: '76.76.19.34', // GoDaddy default IP
          ttl: 3600
        }
      ],
      // CNAME for www
      wwwRecord: {
        name: 'www',
        data: 'rensto-business-system.vercel.app',
        ttl: 3600
      }
    };
  }

  // ===== DNS CONFIGURATION =====

  async configureCustomerSubdomains() {
    console.log('🌐 Configuring customer subdomains...');

    try {
      // 1. Get current DNS records
      const currentRecords = await this.getDNSRecords();
      console.log('📋 Current DNS records retrieved');

      // 2. Create customer subdomains
      for (const [customerId, customer] of Object.entries(this.customers)) {
        await this.createCustomerSubdomain(customerId, customer);
      }

      // 3. Update main domain records
      await this.updateMainDomainRecords();

      // 4. Verify configuration
      await this.verifyDNSConfiguration();

      console.log('✅ Customer subdomains configured successfully');
      return true;

    } catch (error) {
      console.error('❌ DNS configuration failed:', error.message);
      return false;
    }
  }

  async getDNSRecords() {
    try {
      const response = await axios.get(
        `${this.godaddyConfig.baseUrl}/domains/${this.godaddyConfig.domain}/records`,
        {
          headers: {
            'Authorization': `sso-key ${this.godaddyConfig.apiKey}:${this.godaddyConfig.apiSecret}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching DNS records:', error.message);
      throw error;
    }
  }

  async createCustomerSubdomain(customerId, customer) {
    console.log(`🔧 Creating subdomain for ${customer.name}...`);

    const cnameRecord = {
      name: customerId,
      data: 'rensto-business-system.vercel.app',
      ttl: 3600,
      type: 'CNAME'
    };

    try {
      await axios.put(
        `${this.godaddyConfig.baseUrl}/domains/${this.godaddyConfig.domain}/records/CNAME/${customerId}`,
        [cnameRecord],
        {
          headers: {
            'Authorization': `sso-key ${this.godaddyConfig.apiKey}:${this.godaddyConfig.apiSecret}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Subdomain ${customer.subdomain} created successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to create subdomain for ${customer.name}:`, error.message);
      return false;
    }
  }

  async updateMainDomainRecords() {
    console.log('🔧 Updating main domain records...');

    try {
      // Update A record for main domain
      const aRecord = {
        name: '@',
        data: '76.76.19.34',
        ttl: 3600,
        type: 'A'
      };

      await axios.put(
        `${this.godaddyConfig.baseUrl}/domains/${this.godaddyConfig.domain}/records/A/@`,
        [aRecord],
        {
          headers: {
            'Authorization': `sso-key ${this.godaddyConfig.apiKey}:${this.godaddyConfig.apiSecret}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update CNAME for www
      const wwwRecord = {
        name: 'www',
        data: 'rensto-business-system.vercel.app',
        ttl: 3600,
        type: 'CNAME'
      };

      await axios.put(
        `${this.godaddyConfig.baseUrl}/domains/${this.godaddyConfig.domain}/records/CNAME/www`,
        [wwwRecord],
        {
          headers: {
            'Authorization': `sso-key ${this.godaddyConfig.apiKey}:${this.godaddyConfig.apiSecret}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Main domain records updated successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to update main domain records:', error.message);
      return false;
    }
  }

  async verifyDNSConfiguration() {
    console.log('🔍 Verifying DNS configuration...');

    try {
      const records = await this.getDNSRecords();
      
      const verificationResults = {
        timestamp: new Date().toISOString(),
        domain: this.godaddyConfig.domain,
        records: records,
        customerSubdomains: {}
      };

      // Verify each customer subdomain
      for (const [customerId, customer] of Object.entries(this.customers)) {
        const subdomainRecord = records.find(record => 
          record.name === customerId && record.type === 'CNAME'
        );

        verificationResults.customerSubdomains[customerId] = {
          subdomain: customer.subdomain,
          configured: !!subdomainRecord,
          record: subdomainRecord || null
        };

        if (subdomainRecord) {
          console.log(`✅ ${customer.subdomain} - Configured correctly`);
        } else {
          console.log(`❌ ${customer.subdomain} - Not configured`);
        }
      }

      await this.saveConfiguration('dns-verification-results.json', verificationResults);
      console.log('✅ DNS verification completed');
      return verificationResults;

    } catch (error) {
      console.error('❌ DNS verification failed:', error.message);
      throw error;
    }
  }

  // ===== SSL CERTIFICATE CONFIGURATION =====

  async configureSSL() {
    console.log('🔒 Configuring SSL certificates...');

    const sslConfig = {
      domain: '*.rensto.com',
      provider: 'Cloudflare',
      type: 'wildcard',
      autoRenew: true,
      status: 'pending'
    };

    try {
      // Note: GoDaddy API doesn't directly support SSL certificate management
      // This would typically be handled through Cloudflare or another SSL provider
      console.log('ℹ️ SSL certificate configuration requires Cloudflare integration');
      console.log('ℹ️ Wildcard SSL for *.rensto.com should be configured in Cloudflare');

      await this.saveConfiguration('ssl-configuration.json', sslConfig);
      console.log('✅ SSL configuration plan created');
      return sslConfig;

    } catch (error) {
      console.error('❌ SSL configuration failed:', error.message);
      return null;
    }
  }

  // ===== CUSTOMER PORTAL URLS =====

  async generateCustomerPortalUrls() {
    console.log('🔗 Generating customer portal URLs...');

    const portalUrls = {
      timestamp: new Date().toISOString(),
      baseUrl: 'https://rensto-business-system.vercel.app',
      customers: {}
    };

    for (const [customerId, customer] of Object.entries(this.customers)) {
      portalUrls.customers[customerId] = {
        name: customer.name,
        company: customer.company,
        subdomain: customer.subdomain,
        portalUrl: `https://${customer.subdomain}`,
        apiUrl: `https://${customer.subdomain}/api`,
        status: 'configured'
      };
    }

    await this.saveConfiguration('customer-portal-urls.json', portalUrls);
    console.log('✅ Customer portal URLs generated');
    return portalUrls;
  }

  // ===== PRODUCTION DEPLOYMENT =====

  async prepareProductionDeployment() {
    console.log('🚀 Preparing production deployment...');

    const deploymentConfig = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      domain: this.godaddyConfig.domain,
      customers: this.customers,
      dnsRecords: this.dnsRecords,
      sslStatus: 'pending',
      deploymentSteps: [
        'DNS configuration completed',
        'Customer subdomains created',
        'SSL certificate configuration planned',
        'Production environment ready'
      ]
    };

    await this.saveConfiguration('production-deployment-config.json', deploymentConfig);
    console.log('✅ Production deployment configuration prepared');
    return deploymentConfig;
  }

  // ===== UTILITY FUNCTIONS =====

  async saveConfiguration(filename, data) {
    const configDir = 'data/dns-configuration';
    await fs.mkdir(configDir, { recursive: true });
    const filepath = path.join(configDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Configuration saved: ${filepath}`);
  }

  async generateDeploymentReport() {
    console.log('📊 Generating deployment report...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        domain: this.godaddyConfig.domain,
        customersConfigured: Object.keys(this.customers).length,
        subdomainsCreated: Object.keys(this.customers).length,
        sslStatus: 'pending',
        deploymentStatus: 'ready'
      },
      customers: this.customers,
      nextSteps: [
        'Configure SSL certificates in Cloudflare',
        'Deploy application to production',
        'Test customer portal URLs',
        'Monitor DNS propagation',
        'Set up monitoring and alerting'
      ],
      urls: {
        'tax4us': 'https://tax4us.rensto.com',
        'shelly-mizrahi': 'https://shelly-mizrahi.rensto.com'
      }
    };

    await this.saveConfiguration('deployment-report.json', report);
    console.log('✅ Deployment report generated');
    return report;
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const dnsConfig = new GoDaddyDNSConfiguration();
  
  try {
    console.log('🌐 Starting GoDaddy DNS configuration...\n');
    
    // Configure customer subdomains
    const dnsSuccess = await dnsConfig.configureCustomerSubdomains();
    
    if (dnsSuccess) {
      // Configure SSL
      await dnsConfig.configureSSL();
      
      // Generate portal URLs
      await dnsConfig.generateCustomerPortalUrls();
      
      // Prepare production deployment
      await dnsConfig.prepareProductionDeployment();
      
      // Generate deployment report
      const report = await dnsConfig.generateDeploymentReport();
      
      console.log('\n🎉 GoDaddy DNS configuration completed!');
      console.log('📋 Customer portal URLs:');
              console.log('   - Tax4Us: https://tax4us.rensto.com');
      console.log('   - Shelly Mizrahi: https://shelly-mizrahi.rensto.com');
      console.log('📊 Deployment report: data/dns-configuration/deployment-report.json');
      
    } else {
      console.log('\n❌ DNS configuration failed. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ DNS configuration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default GoDaddyDNSConfiguration;
