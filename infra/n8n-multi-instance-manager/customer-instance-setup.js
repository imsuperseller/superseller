#!/usr/bin/env node

/**
 * Customer n8n Cloud Instance Setup
 * Automated setup for customer n8n Cloud instances with safety isolation
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CustomerInstanceSetup {
  constructor() {
    this.managerPath = path.join(__dirname, 'n8n-instance-manager.js');
  }

  async getManager() {
    if (!this.N8nInstanceManager) {
      this.N8nInstanceManager = (await import('./n8n-instance-manager.js')).default;
    }
    return this.N8nInstanceManager;
  }

  async setupCustomerInstance() {
    console.log('🏢 Customer n8n Cloud Instance Setup');
    console.log('=====================================\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      // Get customer information
      const customerName = await this.askQuestion(rl, 'Customer name: ');
      const customerEmail = await this.askQuestion(rl, 'Customer email: ');
      
      // Get n8n Cloud details
      console.log('\n📋 n8n Cloud Instance Details:');
      const cloudUrl = await this.askQuestion(rl, 'n8n Cloud URL (e.g., https://customer.n8n.cloud): ');
      const apiKey = await this.askQuestion(rl, 'API Key: ');
      
      // Get customer-specific credentials
      console.log('\n🔑 Customer Credentials (optional):');
      const airtableToken = await this.askQuestion(rl, 'Airtable Token (optional): ');
      const notionToken = await this.askQuestion(rl, 'Notion Token (optional): ');
      const stripeKey = await this.askQuestion(rl, 'Stripe Secret Key (optional): ');
      
      // Safety settings
      console.log('\n🛡️  Safety Settings:');
      const isolationMode = await this.askYesNo(rl, 'Enable isolation mode? (prevents cross-contamination) [Y/n]: ');
      const backupBeforeSwitch = await this.askYesNo(rl, 'Backup before switching instances? [Y/n]: ');
      
      rl.close();

      // Create customer instance
      const N8nInstanceManager = await this.getManager();
      const manager = new N8nInstanceManager();
      
      const customerConfig = {
        type: 'cloud',
        url: cloudUrl,
        apiKey: apiKey,
        credentials: {
          airtable: airtableToken || null,
          notion: notionToken || null,
          stripe: stripeKey || null
        }
      };

      const instanceId = manager.addInstance(`Customer: ${customerName}`, customerConfig);
      
      // Update safety settings
      manager.instances.instances[instanceId].safety = {
        backupBeforeSwitch: backupBeforeSwitch,
        validateConnection: true,
        isolationMode: isolationMode
      };

      // Add customer metadata
      manager.instances.instances[instanceId].customer = {
        name: customerName,
        email: customerEmail,
        setupDate: new Date().toISOString()
      };

      manager.saveInstances();

      console.log('\n✅ Customer instance setup complete!');
      console.log(`📋 Instance ID: ${instanceId}`);
      console.log(`🌐 URL: ${cloudUrl}`);
      console.log(`🔒 Isolation mode: ${isolationMode ? 'ENABLED' : 'DISABLED'}`);
      
      // Test connection
      console.log('\n🔍 Testing connection...');
      try {
        await manager.validateInstance(manager.instances.instances[instanceId]);
        console.log('✅ Connection test successful!');
      } catch (error) {
        console.log(`⚠️  Connection test failed: ${error.message}`);
        console.log('   Please verify the URL and API key');
      }

      return instanceId;

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      rl.close();
      process.exit(1);
    }
  }

  async askQuestion(rl, question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async askYesNo(rl, question) {
    const answer = await this.askQuestion(rl, question);
    return answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no';
  }

  // Quick setup for known customers
  async quickSetupCustomer(customerName, cloudConfig) {
    const N8nInstanceManager = await this.getManager();
    const manager = new N8nInstanceManager();
    
    const instanceId = manager.addInstance(`Customer: ${customerName}`, {
      type: 'cloud',
      url: cloudConfig.url,
      apiKey: cloudConfig.apiKey,
      credentials: cloudConfig.credentials || {}
    });

    // Set safety defaults for customers
    manager.instances.instances[instanceId].safety = {
      backupBeforeSwitch: true,
      validateConnection: true,
      isolationMode: true  // Always enable for customers
    };

    manager.instances.instances[instanceId].customer = {
      name: customerName,
      setupDate: new Date().toISOString()
    };

    manager.saveInstances();
    
    console.log(`✅ Quick setup complete for ${customerName}`);
    return instanceId;
  }

  // List all customer instances
  async listCustomerInstances() {
    const N8nInstanceManager = await this.getManager();
    const manager = new N8nInstanceManager();
    
    console.log('\n🏢 Customer n8n Instances:');
    console.log('==========================');
    
    const customerInstances = Object.values(manager.instances.instances)
      .filter(instance => instance.name.startsWith('Customer:'));
    
    if (customerInstances.length === 0) {
      console.log('No customer instances found');
      return;
    }
    
    customerInstances.forEach(instance => {
      const status = instance.id === manager.instances.current ? '🟢 ACTIVE' : '⚪ Inactive';
      console.log(`${status} ${instance.name}`);
      console.log(`   URL: ${instance.url}`);
      console.log(`   Customer: ${instance.customer?.name || 'Unknown'}`);
      console.log(`   Workflows: ${instance.metadata.workflowCount}`);
      console.log(`   Last used: ${instance.metadata.lastUsed || 'Never'}`);
      console.log('');
    });
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new CustomerInstanceSetup();
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      setup.setupCustomerInstance();
      break;
      
    case 'list':
      await setup.listCustomerInstances();
      break;
      
    case 'quick':
      const customerName = process.argv[3];
      const url = process.argv[4];
      const apiKey = process.argv[5];
      
      if (!customerName || !url || !apiKey) {
        console.log('Usage: node customer-instance-setup.js quick <customer-name> <url> <api-key>');
        process.exit(1);
      }
      
      setup.quickSetupCustomer(customerName, {
        url: url,
        apiKey: apiKey
      });
      break;
      
    default:
      console.log(`
Customer n8n Instance Setup
===========================

Commands:
  setup                   - Interactive customer setup
  list                    - List customer instances
  quick <name> <url> <key> - Quick setup with parameters
  
Examples:
  node customer-instance-setup.js setup
  node customer-instance-setup.js list
  node customer-instance-setup.js quick "Tax4Us" "https://tax4us.n8n.cloud" "api-key-here"
      `);
  }
}

export default CustomerInstanceSetup;
