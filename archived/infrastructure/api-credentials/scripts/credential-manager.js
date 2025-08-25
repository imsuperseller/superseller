#!/usr/bin/env node

/**
 * 🔑 CREDENTIAL MANAGEMENT SYSTEM
 * 
 * Manages customer credentials and n8n authentication
 * Supports multiple authentication methods and secure storage
 */

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

class CredentialManager {
  constructor() {
    this.credentialsPath = path.join(process.cwd(), 'data/credentials');
    this.customersPath = path.join(process.cwd(), 'data/customers');
  }

  // ===== CREDENTIAL STORAGE =====
  async ensureCredentialsDirectory() {
    try {
      await fs.access(this.credentialsPath);
    } catch {
      await fs.mkdir(this.credentialsPath, { recursive: true });
    }
  }

  async saveCredentials(customerId, service, credentials) {
    await this.ensureCredentialsDirectory();
    
    const credentialFile = path.join(this.credentialsPath, `${customerId}-${service}.json`);
    const credentialData = {
      customerId,
      service,
      credentials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(credentialFile, JSON.stringify(credentialData, null, 2));
    console.log(`💾 Credentials saved for ${customerId} - ${service}`);
  }

  async loadCredentials(customerId, service) {
    try {
      const credentialFile = path.join(this.credentialsPath, `${customerId}-${service}.json`);
      const data = await fs.readFile(credentialFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`⚠️ No credentials found for ${customerId} - ${service}`);
      return null;
    }
  }

  // ===== N8N AUTHENTICATION =====
  async testN8nConnection(baseUrl, apiKey, authMethod = 'header') {
    console.log(`🔗 Testing n8n connection to: ${baseUrl}`);
    console.log(`🔑 Auth method: ${authMethod}`);
    
    const headers = {
      'Content-Type': 'application/json'
    };

    // Try different authentication methods
    if (authMethod === 'header') {
      headers['X-N8N-API-KEY'] = apiKey;
    } else if (authMethod === 'bearer') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (authMethod === 'query') {
      // Will be added to URL
    }

    const endpoints = [
      '/rest/workflows',
      '/api/v1/workflows', 
      '/healthz',
      '/health'
    ];

    for (const endpoint of endpoints) {
      try {
        let url = `${baseUrl}${endpoint}`;
        if (authMethod === 'query') {
          url += `?apiKey=${apiKey}`;
        }

        const response = await axios.get(url, { headers });
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        return {
          success: true,
          endpoint,
          status: response.status,
          data: response.data
        };
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
      }
    }

    return { success: false, message: 'All endpoints failed' };
  }

  async findWorkingN8nAuth(baseUrl, apiKey) {
    console.log('🔍 Finding working n8n authentication method...');
    
    const authMethods = ['header', 'bearer', 'query'];
    
    for (const method of authMethods) {
      const result = await this.testN8nConnection(baseUrl, apiKey, method);
      if (result.success) {
        console.log(`✅ Working auth method found: ${method}`);
        return { method, apiKey, baseUrl };
      }
    }

    throw new Error('No working authentication method found');
  }

  // ===== CUSTOMER CREDENTIAL MANAGEMENT =====
  async getCustomerN8nCredentials(customerId) {
    // Try to load from credential storage
    const stored = await this.loadCredentials(customerId, 'n8n');
    if (stored) {
      return stored.credentials;
    }

    // Try to load from customer profile
    try {
      const profilePath = path.join(this.customersPath, customerId, 'customer-profile.json');
      const profileData = await fs.readFile(profilePath, 'utf8');
      const profile = JSON.parse(profileData);
      
      if (profile.n8nCredentials) {
        return profile.n8nCredentials;
      }
    } catch (error) {
      console.log(`⚠️ No customer profile found for ${customerId}`);
    }

    return null;
  }

  async setCustomerN8nCredentials(customerId, baseUrl, apiKey) {
    console.log(`🔑 Setting n8n credentials for ${customerId}...`);
    
    // Test the credentials first
    const authConfig = await this.findWorkingN8nAuth(baseUrl, apiKey);
    
    // Save the working credentials
    await this.saveCredentials(customerId, 'n8n', {
      baseUrl,
      apiKey,
      authMethod: authConfig.method,
      testedAt: new Date().toISOString(),
      status: 'active'
    });

    console.log(`✅ n8n credentials saved for ${customerId}`);
    return authConfig;
  }

  // ===== CREDENTIAL VALIDATION =====
  async validateCustomerCredentials(customerId) {
    console.log(`🔍 Validating credentials for ${customerId}...`);
    
    const n8nCreds = await this.getCustomerN8nCredentials(customerId);
    if (!n8nCreds) {
      console.log(`❌ No n8n credentials found for ${customerId}`);
      return false;
    }

    try {
      const result = await this.testN8nConnection(
        n8nCreds.baseUrl, 
        n8nCreds.apiKey, 
        n8nCreds.authMethod
      );
      
      if (result.success) {
        console.log(`✅ Credentials valid for ${customerId}`);
        return true;
      } else {
        console.log(`❌ Credentials invalid for ${customerId}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Credential validation failed: ${error.message}`);
      return false;
    }
  }

  // ===== CREDENTIAL UPDATE =====
  async updateCustomerN8nCredentials(customerId, baseUrl, apiKey) {
    console.log(`🔄 Updating n8n credentials for ${customerId}...`);
    
    try {
      const authConfig = await this.setCustomerN8nCredentials(customerId, baseUrl, apiKey);
      
      // Update customer profile if it exists
      try {
        const profilePath = path.join(this.customersPath, customerId, 'customer-profile.json');
        const profileData = await fs.readFile(profilePath, 'utf8');
        const profile = JSON.parse(profileData);
        
        profile.n8nCredentials = {
          baseUrl,
          apiKey: '[REDACTED]',
          authMethod: authConfig.method,
          updatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(profilePath, JSON.stringify(profile, null, 2));
        console.log(`✅ Customer profile updated for ${customerId}`);
      } catch (error) {
        console.log(`⚠️ Could not update customer profile: ${error.message}`);
      }
      
      return authConfig;
    } catch (error) {
      console.error(`❌ Failed to update credentials: ${error.message}`);
      throw error;
    }
  }
}

// Export for use in other scripts
export default CredentialManager;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new CredentialManager();
  
  const command = process.argv[2];
  const customerId = process.argv[3];
  
  switch (command) {
    case 'test':
      const baseUrl = process.argv[4];
      const apiKey = process.argv[5];
      manager.testN8nConnection(baseUrl, apiKey).then(result => {
        console.log('Result:', JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('Error:', error.message);
      });
      break;
      
    case 'set':
      const setBaseUrl = process.argv[4];
      const setApiKey = process.argv[5];
      manager.setCustomerN8nCredentials(customerId, setBaseUrl, setApiKey).then(result => {
        console.log('Result:', JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('Error:', error.message);
      });
      break;
      
    case 'validate':
      manager.validateCustomerCredentials(customerId).then(result => {
        console.log('Result:', result);
      }).catch(error => {
        console.error('Error:', error.message);
      });
      break;
      
    case 'update':
      const updateBaseUrl = process.argv[4];
      const updateApiKey = process.argv[5];
      manager.updateCustomerN8nCredentials(customerId, updateBaseUrl, updateApiKey).then(result => {
        console.log('Result:', JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('Error:', error.message);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node credential-manager.js test <baseUrl> <apiKey>');
      console.log('  node credential-manager.js set <customerId> <baseUrl> <apiKey>');
      console.log('  node credential-manager.js validate <customerId>');
      console.log('  node credential-manager.js update <customerId> <baseUrl> <apiKey>');
  }
}
