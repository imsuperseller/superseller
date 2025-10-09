#!/usr/bin/env node

/**
 * MCP Instance Switcher
 * Dynamically updates MCP server configuration without requiring Cursor restarts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPInstanceSwitcher {
  constructor() {
    this.mcpConfigPath = path.join(__dirname, '..', 'mcp-servers', 'n8n-mcp-server', 'config.json');
    this.instancesPath = path.join(__dirname, 'n8n-instances.json');
    this.instances = this.loadInstances();
  }

  loadInstances() {
    if (fs.existsSync(this.instancesPath)) {
      return JSON.parse(fs.readFileSync(this.instancesPath, 'utf8'));
    }
    return { instances: {}, current: null };
  }

  async switchMCPToInstance(instanceId) {
    if (!this.instances.instances[instanceId]) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const instance = this.instances.instances[instanceId];
    
    console.log(`🔄 Switching MCP to instance: ${instance.name}`);
    console.log(`🌐 URL: ${instance.url}`);
    
    // Update MCP server configuration
    await this.updateMCPConfig(instance);
    
    // Update environment variables
    await this.updateEnvironment(instance);
    
    // Update current instance tracking
    this.instances.current = instanceId;
    this.instances.instances[instanceId].metadata.lastUsed = new Date().toISOString();
    
    // Save updated configuration
    fs.writeFileSync(this.instancesPath, JSON.stringify(this.instances, null, 2));
    
    console.log(`✅ MCP switched to: ${instance.name}`);
    console.log(`🔒 Isolation mode: ${instance.safety.isolationMode ? 'ENABLED' : 'DISABLED'}`);
    
    return instance;
  }

  async updateMCPConfig(instance) {
    console.log('🔧 Updating MCP server configuration...');
    
    // Create MCP config directory if it doesn't exist
    const mcpDir = path.dirname(this.mcpConfigPath);
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }
    
    // Read existing config or create new one
    let config = {};
    if (fs.existsSync(this.mcpConfigPath)) {
      config = JSON.parse(fs.readFileSync(this.mcpConfigPath, 'utf8'));
    }
    
    // Update n8n configuration
    config.n8n = {
      apiUrl: instance.url,
      apiKey: instance.apiKey,
      instanceType: instance.type,
      instanceId: instance.id,
      instanceName: instance.name,
      lastUpdated: new Date().toISOString()
    };
    
    // Add instance-specific credentials
    if (instance.credentials) {
      config.credentials = instance.credentials;
    }
    
    // Write updated config
    fs.writeFileSync(this.mcpConfigPath, JSON.stringify(config, null, 2));
    
    console.log('✅ MCP configuration updated');
  }

  async updateEnvironment(instance) {
    console.log('🔧 Updating environment variables...');
    
    const envPath = path.join(__dirname, '.env');
    const envVars = {
      N8N_API_URL: instance.url,
      N8N_API_KEY: instance.apiKey,
      N8N_INSTANCE_TYPE: instance.type,
      N8N_INSTANCE_ID: instance.id,
      N8N_INSTANCE_NAME: instance.name
    };
    
    // Write environment file
    let envContent = '';
    for (const [key, value] of Object.entries(envVars)) {
      envContent += `${key}=${value}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Environment variables updated');
  }

  // Hot-reload MCP server (if possible)
  async hotReloadMCP() {
    console.log('🔄 Attempting MCP hot-reload...');
    
    try {
      // Try to send reload signal to MCP server
      const { spawn } = await import('child_process');
      
      // This would need to be implemented based on your MCP server setup
      // For now, we'll just log that a reload is needed
      console.log('⚠️  MCP server reload needed - this may require manual intervention');
      console.log('   The configuration has been updated, but MCP tools may need to reconnect');
      
    } catch (error) {
      console.log(`⚠️  Hot-reload failed: ${error.message}`);
      console.log('   Configuration updated, but MCP tools may need to reconnect');
    }
  }

  // Get current MCP configuration
  getCurrentMCPConfig() {
    if (fs.existsSync(this.mcpConfigPath)) {
      return JSON.parse(fs.readFileSync(this.mcpConfigPath, 'utf8'));
    }
    return null;
  }

  // List available instances
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

  // Quick switch with MCP update
  async quickSwitch(instanceName) {
    const instanceId = Object.keys(this.instances.instances).find(id => 
      this.instances.instances[id].name.toLowerCase().includes(instanceName.toLowerCase())
    );
    
    if (!instanceId) {
      console.log(`❌ Instance "${instanceName}" not found`);
      this.listInstances();
      return;
    }
    
    await this.switchMCPToInstance(instanceId);
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const switcher = new MCPInstanceSwitcher();
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'list':
      switcher.listInstances();
      break;
      
    case 'switch':
      if (!arg) {
        console.log('Usage: node mcp-instance-switcher.js switch <instance-name>');
        break;
      }
      switcher.quickSwitch(arg);
      break;
      
    case 'config':
      const config = switcher.getCurrentMCPConfig();
      console.log('Current MCP Configuration:');
      console.log(JSON.stringify(config, null, 2));
      break;
      
    default:
      console.log(`
MCP Instance Switcher
====================

Commands:
  list                    - List all instances
  switch <name>          - Switch MCP to instance
  config                 - Show current MCP config
  
Examples:
  node mcp-instance-switcher.js list
  node mcp-instance-switcher.js switch rensto
  node mcp-instance-switcher.js switch tax4us
      `);
  }
}

export default MCPInstanceSwitcher;
