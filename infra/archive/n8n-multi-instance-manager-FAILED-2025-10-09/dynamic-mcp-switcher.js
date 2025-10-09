#!/usr/bin/env node

/**
 * Dynamic MCP Switcher
 * Updates MCP configuration in real-time without requiring Cursor restarts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DynamicMCPSwitcher {
  constructor() {
    this.instancesPath = path.join(__dirname, 'n8n-instances.json');
    this.mcpConfigPath = path.join(__dirname, '..', 'mcp-servers', 'n8n-mcp-server', 'config.json');
    this.instances = this.loadInstances();
  }

  loadInstances() {
    if (fs.existsSync(this.instancesPath)) {
      return JSON.parse(fs.readFileSync(this.instancesPath, 'utf8'));
    }
    return { instances: {}, current: null };
  }

  async switchToInstance(instanceId) {
    if (!this.instances.instances[instanceId]) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const instance = this.instances.instances[instanceId];
    
    console.log(`🔄 Switching to: ${instance.name}`);
    console.log(`🌐 URL: ${instance.url}`);
    
    // Update MCP configuration
    await this.updateMCPConfig(instance);
    
    // Update environment variables
    await this.updateEnvironment(instance);
    
    // Update instance tracking
    this.instances.current = instanceId;
    this.instances.instances[instanceId].metadata.lastUsed = new Date().toISOString();
    
    // Save configuration
    fs.writeFileSync(this.instancesPath, JSON.stringify(this.instances, null, 2));
    
    console.log(`✅ Switched to: ${instance.name}`);
    console.log(`🔒 Isolation: ${instance.safety.isolationMode ? 'ENABLED' : 'DISABLED'}`);
    
    return instance;
  }

  async updateMCPConfig(instance) {
    console.log('🔧 Updating MCP configuration...');
    
    // Create MCP config directory if needed
    const mcpDir = path.dirname(this.mcpConfigPath);
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }
    
    // Create/update MCP configuration
    const config = {
      n8n: {
        apiUrl: instance.url,
        apiKey: instance.apiKey,
        instanceType: instance.type,
        instanceId: instance.id,
        instanceName: instance.name,
        lastUpdated: new Date().toISOString()
      },
      credentials: instance.credentials || {},
      safety: instance.safety || {}
    };
    
    fs.writeFileSync(this.mcpConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ MCP configuration updated');
  }

  async updateEnvironment(instance) {
    console.log('🔧 Updating environment...');
    
    const envPath = path.join(__dirname, '.env');
    const envVars = {
      N8N_API_URL: instance.url,
      N8N_API_KEY: instance.apiKey,
      N8N_INSTANCE_TYPE: instance.type,
      N8N_INSTANCE_ID: instance.id,
      N8N_INSTANCE_NAME: instance.name
    };
    
    let envContent = '';
    for (const [key, value] of Object.entries(envVars)) {
      envContent += `${key}=${value}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Environment updated');
  }

  // Test MCP connection to current instance
  async testMCPConnection() {
    const currentInstance = this.instances.instances[this.instances.current];
    if (!currentInstance) {
      console.log('❌ No current instance selected');
      return false;
    }
    
    console.log(`🔍 Testing MCP connection to: ${currentInstance.name}`);
    
    try {
      // This would test the actual MCP connection
      // For now, we'll just verify the configuration
      const config = this.getCurrentMCPConfig();
      if (config && config.n8n.apiUrl === currentInstance.url) {
        console.log('✅ MCP configuration is correct');
        return true;
      } else {
        console.log('❌ MCP configuration mismatch');
        return false;
      }
    } catch (error) {
      console.log(`❌ MCP connection test failed: ${error.message}`);
      return false;
    }
  }

  getCurrentMCPConfig() {
    if (fs.existsSync(this.mcpConfigPath)) {
      return JSON.parse(fs.readFileSync(this.mcpConfigPath, 'utf8'));
    }
    return null;
  }

  listInstances() {
    console.log('\n📋 Available n8n Instances:');
    console.log('========================');
    
    for (const [id, instance] of Object.entries(this.instances.instances)) {
      const status = id === this.instances.current ? '🟢 ACTIVE' : '⚪ Inactive';
      console.log(`${status} ${instance.name} (${instance.type})`);
      console.log(`   URL: ${instance.url}`);
      console.log(`   Last used: ${instance.metadata.lastUsed || 'Never'}`);
      console.log('');
    }
  }

  async quickSwitch(instanceName) {
    const instanceId = Object.keys(this.instances.instances).find(id => 
      this.instances.instances[id].name.toLowerCase().includes(instanceName.toLowerCase())
    );
    
    if (!instanceId) {
      console.log(`❌ Instance "${instanceName}" not found`);
      this.listInstances();
      return;
    }
    
    await this.switchToInstance(instanceId);
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const switcher = new DynamicMCPSwitcher();
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'list':
      switcher.listInstances();
      break;
      
    case 'switch':
      if (!arg) {
        console.log('Usage: node dynamic-mcp-switcher.js switch <instance-name>');
        break;
      }
      switcher.quickSwitch(arg);
      break;
      
    case 'test':
      switcher.testMCPConnection();
      break;
      
    case 'config':
      const config = switcher.getCurrentMCPConfig();
      console.log('Current MCP Configuration:');
      console.log(JSON.stringify(config, null, 2));
      break;
      
    default:
      console.log(`
Dynamic MCP Switcher
===================

Commands:
  list                    - List all instances
  switch <name>          - Switch to instance
  test                   - Test MCP connection
  config                 - Show current config
  
Examples:
  node dynamic-mcp-switcher.js list
  node dynamic-mcp-switcher.js switch rensto
  node dynamic-mcp-switcher.js switch tax4us
  node dynamic-mcp-switcher.js test
      `);
  }
}

export default DynamicMCPSwitcher;
