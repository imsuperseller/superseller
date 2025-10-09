#!/usr/bin/env node

import N8nInstanceManager from './n8n-instance-manager.js';

async function main() {
  const manager = new N8nInstanceManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'list':
        manager.listInstances();
        break;

      case 'switch':
        if (!arg) {
          console.log('Usage: node switch-helper.js switch <instance-name>');
          break;
        }
        await manager.quickSwitch(arg);
        break;

      case 'switch-id':
        if (!arg) {
          console.log('Usage: node switch-helper.js switch-id <instance-id>');
          break;
        }
        await manager.switchToInstance(arg);
        break;

      default:
        console.log(`
n8n Multi-Instance Manager (Fixed)
==================================

Commands:
  list                    - List all instances
  switch <name>          - Switch to instance by name
  switch-id <id>         - Switch to instance by ID

Examples:
  node switch-helper.js list
  node switch-helper.js switch rensto
  node switch-helper.js switch-id n8n-rensto-vps
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
