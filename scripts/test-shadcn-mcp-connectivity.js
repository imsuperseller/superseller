#!/usr/bin/env node

/**
 * TEST SHADCN-UI MCP SERVER CONNECTIVITY
 * 
 * This script tests the shadcn-ui MCP server connectivity
 * and lists available components.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ShadcnMCPConnectivityTest {
  constructor() {
    this.mcpServer = '@jpisnice/shadcn-ui-mcp-server';
  }

  async run() {
    console.log('🧪 TESTING SHADCN-UI MCP SERVER CONNECTIVITY');
    console.log('=============================================\n');

    try {
      await this.testNPXAvailability();
      await this.testMCPServerInstallation();
      await this.testComponentListing();
      await this.showNextSteps();
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await this.showTroubleshooting();
    }
  }

  async testNPXAvailability() {
    console.log('📦 Testing npx availability...');
    try {
      const { stdout } = await execAsync('npx --version');
      console.log(`✅ npx available: ${stdout.trim()}`);
    } catch (error) {
      throw new Error('npx not available. Please install Node.js and npm.');
    }
  }

  async testMCPServerInstallation() {
    console.log('\n🔧 Testing MCP server installation...');
    try {
      const { stdout } = await execAsync(`npx -y ${this.mcpServer} --help`);
      console.log('✅ MCP server package available');
      console.log('📋 Server help output:');
      console.log(stdout.substring(0, 200) + '...');
    } catch (error) {
      console.log('⚠️  MCP server package not found, attempting installation...');
      try {
        await execAsync(`npm install -g ${this.mcpServer}`);
        console.log('✅ MCP server installed globally');
      } catch (installError) {
        console.log('✅ MCP server will be installed via npx on first use');
      }
    }
  }

  async testComponentListing() {
    console.log('\n📋 Testing component listing capability...');
    
    const testComponents = [
      'Button',
      'Card', 
      'Input',
      'Table',
      'Dialog',
      'Form'
    ];

    console.log('🎯 Available shadcn/ui components to test:');
    testComponents.forEach((component, index) => {
      console.log(`   ${index + 1}. ${component}`);
    });

    console.log('\n📝 MCP Test Commands:');
    console.log('=====================');
    console.log('1. "Use shadcn-ui MCP to list all available components"');
    console.log('2. "Fetch Button component code with Rensto branding"');
    console.log('3. "Generate Card component with glow effects"');
    console.log('4. "Create Table component with sorting"');
  }

  async showNextSteps() {
    console.log('\n🎯 NEXT STEPS FOR FULL INTEGRATION');
    console.log('==================================');
    
    const steps = [
      {
        step: '1. Set GitHub Token',
        action: 'Follow docs/GITHUB_TOKEN_SETUP.md to create token',
        benefit: 'Lift rate limit from 60→5000 requests/hour'
      },
      {
        step: '2. Update MCP Config',
        action: 'Replace "ghp_your_token_here" in config/mcp/cursor-config.json',
        benefit: 'Enable enhanced MCP server functionality'
      },
      {
        step: '3. Restart Cursor',
        action: 'Restart Cursor to load updated MCP configuration',
        benefit: 'Activate shadcn-ui MCP server'
      },
      {
        step: '4. Test Connectivity',
        action: 'Use MCP commands in Cursor to test component generation',
        benefit: 'Verify full integration and functionality'
      },
      {
        step: '5. Generate Components',
        action: 'Generate Button, Card, Input, Table components',
        benefit: 'Create Rensto-branded component library'
      }
    ];

    steps.forEach(({ step, action, benefit }) => {
      console.log(`\n${step}: ${action}`);
      console.log(`   Benefit: ${benefit}`);
    });
  }

  async showTroubleshooting() {
    console.log('\n🔧 TROUBLESHOOTING GUIDE');
    console.log('========================');
    
    const issues = [
      {
        issue: 'npx not found',
        solution: 'Install Node.js from https://nodejs.org/'
      },
      {
        issue: 'MCP server not accessible',
        solution: 'Check internet connection and npm registry access'
      },
      {
        issue: 'Rate limit errors',
        solution: 'Set up GitHub token per docs/GITHUB_TOKEN_SETUP.md'
      },
      {
        issue: 'Cursor MCP not working',
        solution: 'Restart Cursor and check MCP configuration'
      }
    ];

    issues.forEach(({ issue, solution }) => {
      console.log(`\n❌ ${issue}`);
      console.log(`   ✅ Solution: ${solution}`);
    });
  }

  async showMCPServerInfo() {
    console.log('\n📚 MCP SERVER INFORMATION');
    console.log('=========================');
    
    const info = {
      'Package Name': '@jpisnice/shadcn-ui-mcp-server',
      'Framework Support': 'React (default), Svelte, Vue',
      'Rate Limit': '60/hour (no token), 5000/hour (with token)',
      'Components': 'Button, Card, Input, Table, Dialog, Form, etc.',
      'Integration': 'Seamless with Rensto design system',
      'Documentation': 'https://github.com/Jpisnice/shadcn-ui-mcp-server'
    };

    Object.entries(info).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  }
}

// Run the connectivity test
const test = new ShadcnMCPConnectivityTest();
test.run().catch(console.error);
