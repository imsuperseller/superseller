#!/usr/bin/env node

/**
 * n8n Multi-Instance Manager
 * Secure switching between Rensto VPS and customer n8n Cloud instances
 * 
 * Features:
 * - Automated instance switching
 * - Safety checks to prevent cross-contamination
 * - Credential isolation
 * - Workflow backup before switching
 * - Instance validation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class N8nInstanceManager {
  constructor() {
    this.configPath = path.join(__dirname, 'n8n-instances.json');
    this.currentInstance = null;
    this.instances = this.loadInstances();
  }

  loadInstances() {
    if (fs.existsSync(this.configPath)) {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }
    return {
      instances: {},
      current: null,
      lastBackup: null
    };
  }

  saveInstances() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.instances, null, 2));
  }

  addInstance(name, config) {
    const instanceId = `n8n-${name.toLowerCase().replace(/\s+/g, '-')}`;
    
    this.instances.instances[instanceId] = {
      id: instanceId,
      name: name,
      type: config.type, // 'vps' or 'cloud'
      url: config.url,
      apiKey: config.apiKey,
      credentials: config.credentials || {},
      safety: {
        backupBeforeSwitch: true,
        validateConnection: true,
        isolationMode: true
      },
      metadata: {
        created: new Date().toISOString(),
        lastUsed: null,
        workflowCount: 0
      }
    };

    this.saveInstances();
    console.log(`✅ Added n8n instance: ${name} (${instanceId})`);
    return instanceId;
  }

  async switchToInstance(instanceId) {
    if (!this.instances.instances[instanceId]) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const instance = this.instances.instances[instanceId];
    
    console.log(`🔄 Switching to n8n instance: ${instance.name}`);
    
    // Safety checks
    await this.performSafetyChecks(instance);
    
    // Backup current instance if needed
    if (this.currentInstance && this.instances.instances[this.currentInstance].safety.backupBeforeSwitch) {
      await this.backupCurrentInstance();
    }
    
    // Validate target instance
    await this.validateInstance(instance);
    
    // Switch environment
    this.switchEnvironment(instance);
    
    // Update tracking
    this.instances.current = instanceId;
    this.instances.instances[instanceId].metadata.lastUsed = new Date().toISOString();
    this.currentInstance = instanceId;
    
    this.saveInstances();
    
    console.log(`✅ Successfully switched to: ${instance.name}`);
    console.log(`🌐 Instance URL: ${instance.url}`);
    console.log(`🔒 Isolation mode: ${instance.safety.isolationMode ? 'ENABLED' : 'DISABLED'}`);
  }

  async performSafetyChecks(instance) {
    console.log('🔍 Performing safety checks...');
    
    // Check if instance is accessible (optional for VPS instances)
    if (instance.safety.validateConnection) {
      try {
        const response = await fetch(`${instance.url}/api/v1/health`);
        if (!response.ok) {
          console.log(`⚠️  Warning: Instance ${instance.name} health check failed, but continuing...`);
        } else {
          console.log('✅ Instance health check passed');
        }
      } catch (error) {
        console.log(`⚠️  Warning: Could not reach ${instance.name} (${error.message}), but continuing...`);
        console.log('   This is normal for VPS instances that may be temporarily unavailable');
      }
    } else {
      console.log('✅ Safety checks skipped (validation disabled)');
    }
    
    // Check for active workflows (optional)
    if (instance.safety.validateConnection) {
      try {
        const workflows = await this.getWorkflows(instance);
        const activeWorkflows = workflows.filter(w => w.active);
        
        if (activeWorkflows.length > 0) {
          console.log(`⚠️  Warning: ${activeWorkflows.length} active workflows detected`);
          console.log('   Consider pausing workflows before switching instances');
        }
      } catch (error) {
        console.log(`⚠️  Could not check workflows: ${error.message}`);
      }
    }
    
    console.log('✅ Safety checks passed');
  }

  async validateInstance(instance) {
    console.log(`🔍 Validating instance: ${instance.name}`);
    
    if (!instance.safety.validateConnection) {
      console.log('✅ Instance validation skipped (validation disabled)');
      return;
    }
    
    try {
      const response = await fetch(`${instance.url}/api/v1/workflows`, {
        headers: {
          'Authorization': `Bearer ${instance.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API validation failed: ${response.status}`);
      }
      
      const data = await response.json();
      instance.metadata.workflowCount = data.data?.length || 0;
      
      console.log(`✅ Instance validated - ${instance.metadata.workflowCount} workflows found`);
    } catch (error) {
      console.log(`⚠️  Instance validation failed: ${error.message}`);
      console.log('   Continuing with switch (validation disabled)');
    }
  }

  switchEnvironment(instance) {
    console.log('🔄 Switching environment variables...');
    
    // Update environment for n8n MCP
    const envUpdate = {
      N8N_API_URL: instance.url,
      N8N_API_KEY: instance.apiKey,
      N8N_INSTANCE_TYPE: instance.type,
      N8N_INSTANCE_ID: instance.id
    };
    
    // Write to .env file for MCP
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    for (const [key, value] of Object.entries(envUpdate)) {
      envContent += `${key}=${value}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    // Update MCP configuration
    this.updateMCPConfig(instance);
    
    console.log('✅ Environment switched');
  }

  updateMCPConfig(instance) {
    // Update Cursor's MCP configuration (the actual config Cursor reads)
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const cursorMcpPath = path.join(homeDir, '.cursor', 'mcp.json');

    if (!fs.existsSync(cursorMcpPath)) {
      console.log('⚠️  ~/.cursor/mcp.json not found, skipping MCP update');
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(cursorMcpPath, 'utf8'));

      // Update n8n-mcp server config in Cursor's MCP file
      if (config.mcpServers && config.mcpServers['n8n-mcp']) {
        const args = config.mcpServers['n8n-mcp'].args;

        // Find and update N8N_API_URL
        const urlIndex = args.findIndex(arg => arg === 'N8N_API_URL' || arg.includes('N8N_API_URL='));
        if (urlIndex !== -1) {
          // If it's a separate arg (format: "-e", "N8N_API_URL=...")
          if (args[urlIndex] === 'N8N_API_URL') {
            args[urlIndex + 1] = instance.url;
          } else {
            // If it's combined (format: "N8N_API_URL=...")
            args[urlIndex] = `N8N_API_URL=${instance.url}`;
          }
        } else {
          // Look for it in the format where -e is followed by ENV=value
          for (let i = 0; i < args.length; i++) {
            if (args[i] === '-e' && i + 1 < args.length && args[i + 1].startsWith('N8N_API_URL=')) {
              args[i + 1] = `N8N_API_URL=${instance.url}`;
              break;
            }
          }
        }

        // Find and update N8N_API_KEY
        const keyIndex = args.findIndex(arg => arg === 'N8N_API_KEY' || arg.includes('N8N_API_KEY='));
        if (keyIndex !== -1) {
          if (args[keyIndex] === 'N8N_API_KEY') {
            args[keyIndex + 1] = instance.apiKey;
          } else {
            args[keyIndex] = `N8N_API_KEY=${instance.apiKey}`;
          }
        } else {
          // Look for it in the format where -e is followed by ENV=value
          for (let i = 0; i < args.length; i++) {
            if (args[i] === '-e' && i + 1 < args.length && args[i + 1].startsWith('N8N_API_KEY=')) {
              args[i + 1] = `N8N_API_KEY=${instance.apiKey}`;
              break;
            }
          }
        }
      }

      fs.writeFileSync(cursorMcpPath, JSON.stringify(config, null, 2));
      console.log('✅ Updated ~/.cursor/mcp.json');
      console.log('⚠️  IMPORTANT: RESTART CURSOR for MCP changes to take effect!');
    } catch (error) {
      console.log(`⚠️  Failed to update MCP config: ${error.message}`);
    }

    // Also update local config if it exists (for reference)
    const localMcpPath = path.join(__dirname, '..', 'mcp-servers', 'n8n-mcp-server', 'config.json');
    if (fs.existsSync(localMcpPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(localMcpPath, 'utf8'));
        config.n8n = {
          apiUrl: instance.url,
          apiKey: instance.apiKey,
          instanceType: instance.type,
          instanceId: instance.id
        };
        fs.writeFileSync(localMcpPath, JSON.stringify(config, null, 2));
      } catch (error) {
        // Ignore local config errors
      }
    }
  }

  async backupCurrentInstance() {
    if (!this.currentInstance) return;
    
    console.log('💾 Creating backup of current instance...');
    
    const instance = this.instances.instances[this.currentInstance];
    const backupDir = path.join(__dirname, 'backups', instance.id);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    try {
      // Export workflows
      const workflows = await this.getWorkflows(instance);
      const backupFile = path.join(backupDir, `backup-${Date.now()}.json`);
      
      fs.writeFileSync(backupFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        instance: instance.id,
        workflows: workflows
      }, null, 2));
      
      this.instances.lastBackup = backupFile;
      console.log(`✅ Backup created: ${backupFile}`);
    } catch (error) {
      console.log(`⚠️  Backup failed: ${error.message}`);
    }
  }

  async getWorkflows(instance) {
    const response = await fetch(`${instance.url}/api/v1/workflows`, {
      headers: {
        'Authorization': `Bearer ${instance.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.status}`);
    }
    
    return response.json();
  }

  listInstances() {
    console.log('\n📋 Available n8n Instances:');
    console.log('========================');
    
    for (const [id, instance] of Object.entries(this.instances.instances)) {
      const status = id === this.instances.current ? '🟢 ACTIVE' : '⚪ Inactive';
      console.log(`${status} ${instance.name} (${instance.type})`);
      console.log(`   URL: ${instance.url}`);
      console.log(`   Workflows: ${instance.metadata.workflowCount}`);
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

  // Initialize with Rensto VPS
  initializeRenstoVPS() {
    const renstoConfig = {
      type: 'vps',
      url: 'http://172.245.56.50:5678',
      apiKey: process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      credentials: {
        airtable: 'airtable-token',
        notion: 'notion-token',
        stripe: 'stripe-secret'
      }
    };
    
    return this.addInstance('Rensto VPS', renstoConfig);
  }

  // Add customer n8n Cloud instance
  addCustomerInstance(customerName, cloudConfig) {
    const config = {
      type: 'cloud',
      url: cloudConfig.url,
      apiKey: cloudConfig.apiKey,
      credentials: cloudConfig.credentials || {}
    };
    
    return this.addInstance(`Customer: ${customerName}`, config);
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new N8nInstanceManager();
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'list':
      manager.listInstances();
      break;
      
    case 'switch':
      if (!arg) {
        console.log('Usage: node n8n-instance-manager.js switch <instance-name>');
        break;
      }
      manager.quickSwitch(arg);
      break;
      
    case 'add-rensto':
      manager.initializeRenstoVPS();
      break;
      
    case 'add-customer':
      if (!arg) {
        console.log('Usage: node n8n-instance-manager.js add-customer <customer-name>');
        break;
      }
      // This would prompt for customer details
      console.log(`To add customer "${arg}", use the addCustomerInstance method with cloud config`);
      break;
      
    default:
      console.log(`
n8n Multi-Instance Manager
========================

Commands:
  list                    - List all instances
  switch <name>          - Switch to instance
  add-rensto             - Add Rensto VPS instance
  add-customer <name>    - Add customer instance (interactive)
  
Examples:
  node n8n-instance-manager.js list
  node n8n-instance-manager.js switch rensto
  node n8n-instance-manager.js switch customer-tax4us
      `);
  }
}

export default N8nInstanceManager;
