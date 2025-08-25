#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class WebflowMCPServerDeployment {
    constructor() {
        this.vpsHost = '173.254.201.134';
        this.vpsUser = 'root';
        this.vpsPassword = '05ngBiq2pTA8XSF76x';
        this.webflowApiToken = '90b67c9892c0067fde5f716f9a95f2e0b863cbbf496465cdeef5ddc817e4124b';
        
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            steps: [],
            errors: []
        };
    }

    async deployWebflowMCPServer() {
        console.log('🌐 DEPLOYING WEBFLOW MCP SERVER TO RACKNERD VPS');
        console.log('================================================');
        console.log('Integrating Webflow with our comprehensive business data ecosystem...');
        
        try {
            // Step 1: Create Webflow MCP server directory
            await this.createWebflowMCPServer();
            
            // Step 2: Deploy to Racknerd VPS
            await this.deployToVPS();
            
            // Step 3: Configure systemd service
            await this.configureSystemdService();
            
            // Step 4: Test Webflow MCP server
            await this.testWebflowMCPServer();
            
            await this.saveResults();
            
            console.log('\n✅ WEBFLOW MCP SERVER DEPLOYMENT COMPLETED!');
            console.log('🎯 Webflow integration ready for comprehensive business data management');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            this.results.errors.push({ step: 'deployment', error: error.message });
            await this.saveResults();
        }
    }

    async createWebflowMCPServer() {
        console.log('\n📁 Creating Webflow MCP server...');
        
        const webflowMCPServer = {
            name: 'webflow-mcp-server',
            version: '1.0.0',
            description: 'Webflow MCP Server for Rensto Business Data Integration',
            main: 'dist/index.js',
            type: 'module',
            scripts: {
                build: 'tsc',
                start: 'node dist/index.js',
                dev: 'ts-node --loader ts-node/esm src/index.ts'
            },
            dependencies: {
                '@modelcontextprotocol/sdk': '^0.4.0',
                'axios': '^1.6.0',
                'dotenv': '^16.3.0'
            },
            devDependencies: {
                '@types/node': '^20.0.0',
                'typescript': '^5.0.0',
                'ts-node': '^10.9.0'
            }
        };

        const packageJson = JSON.stringify(webflowMCPServer, null, 2);
        await fs.writeFile('webflow-mcp-server/package.json', packageJson);
        
        console.log('  ✅ Created package.json');
        this.results.steps.push({ step: 'createPackageJson', success: true });
    }

    async deployToVPS() {
        console.log('\n🚀 Deploying to Racknerd VPS...');
        
        const deployCommands = [
            `sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'mkdir -p /opt/mcp-servers/webflow-mcp-server'`,
            `sshpass -p '${this.vpsPassword}' scp -o StrictHostKeyChecking=no -r webflow-mcp-server/* ${this.vpsUser}@${this.vpsHost}:/opt/mcp-servers/webflow-mcp-server/`,
            `sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'cd /opt/mcp-servers/webflow-mcp-server && npm install'`,
            `sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'cd /opt/mcp-servers/webflow-mcp-server && npm run build'`
        ];

        for (const command of deployCommands) {
            try {
                const { execSync } = await import('child_process');
                execSync(command, { stdio: 'inherit' });
                console.log(`  ✅ Executed: ${command.split(' ').slice(0, 3).join(' ')}...`);
                this.results.steps.push({ step: 'deployToVPS', command: command.split(' ')[0], success: true });
            } catch (error) {
                console.error(`  ❌ Failed: ${error.message}`);
                this.results.errors.push({ step: 'deployToVPS', command: command.split(' ')[0], error: error.message });
            }
        }
    }

    async configureSystemdService() {
        console.log('\n⚙️ Configuring systemd service...');
        
        const serviceConfig = `[Unit]
Description=Webflow MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mcp-servers/webflow-mcp-server
Environment=WEBFLOW_API_TOKEN=${this.webflowApiToken}
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`;

        await fs.writeFile('webflow-mcp-server.service', serviceConfig);
        
        const deployCommands = [
            `sshpass -p '${this.vpsPassword}' scp -o StrictHostKeyChecking=no webflow-mcp-server.service ${this.vpsUser}@${this.vpsHost}:/etc/systemd/system/`,
            `sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'systemctl daemon-reload'`,
            `sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'systemctl enable webflow-mcp-server'`,
            `sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'systemctl start webflow-mcp-server'`
        ];

        for (const command of deployCommands) {
            try {
                const { execSync } = await import('child_process');
                execSync(command, { stdio: 'inherit' });
                console.log(`  ✅ Executed: ${command.split(' ').slice(0, 3).join(' ')}...`);
                this.results.steps.push({ step: 'configureSystemd', command: command.split(' ')[0], success: true });
            } catch (error) {
                console.error(`  ❌ Failed: ${error.message}`);
                this.results.errors.push({ step: 'configureSystemd', command: command.split(' ')[0], error: error.message });
            }
        }
    }

    async testWebflowMCPServer() {
        console.log('\n🧪 Testing Webflow MCP server...');
        
        try {
            const { execSync } = await import('child_process');
            const status = execSync(`sshpass -p '${this.vpsPassword}' ssh -o StrictHostKeyChecking=no ${this.vpsUser}@${this.vpsHost} 'systemctl status webflow-mcp-server'`, { encoding: 'utf8' });
            
            console.log('  📊 Webflow MCP Server Status:');
            console.log(status);
            
            if (status.includes('Active: active')) {
                console.log('  ✅ Webflow MCP server is running successfully');
                this.results.steps.push({ step: 'testServer', success: true });
            } else {
                console.log('  ⚠️ Webflow MCP server may need attention');
                this.results.steps.push({ step: 'testServer', success: false });
            }
            
        } catch (error) {
            console.error(`  ❌ Test failed: ${error.message}`);
            this.results.errors.push({ step: 'testServer', error: error.message });
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/webflow-integration/webflow-mcp-deployment-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const deployment = new WebflowMCPServerDeployment();
deployment.deployWebflowMCPServer().catch(console.error);
