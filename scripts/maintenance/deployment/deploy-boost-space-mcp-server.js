#!/usr/bin/env node

/**
 * 🎯 DEPLOY BOOST.SPACE MCP SERVER
 * BMAD Methodology: DEPLOY Phase
 * 
 * Purpose: Deploy Boost.space MCP server as a proper systemd service
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class BoostSpaceMCPServerDeployer {
    constructor() {
        this.vpsConfig = {
            host: '172.245.56.50',
            port: 22,
            user: 'root',
            password: '05ngBiq2pTA8XSF76x'
        };
    }

    async deploy() {
        console.log('🎯 DEPLOYING BOOST.SPACE MCP SERVER - BMAD DEPLOY PHASE\n');
        console.log('='.repeat(60));

        try {
            await this.createSystemdService();
            await this.enableAndStartService();
            await this.verifyDeployment();

            console.log('='.repeat(60));
            console.log('✅ BOOST.SPACE MCP SERVER DEPLOYMENT COMPLETE');
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            throw error;
        }
    }

    async createSystemdService() {
        console.log('🔧 Creating systemd service...\n');

        const serviceContent = `[Unit]
Description=Boost.space MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mcp-servers/boost-space-mcp-server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=BOOST_SPACE_API_KEY=BOOST_SPACE_KEY_REDACTED
Environment=BOOST_SPACE_PLATFORM=https://superseller.boost.space

[Install]
WantedBy=multi-user.target`;

        const createServiceCommand = `sshpass -p '${this.vpsConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.vpsConfig.port} ${this.vpsConfig.user}@${this.vpsConfig.host} "echo '${serviceContent}' > /etc/systemd/system/boost-space-mcp.service"`;

        await execAsync(createServiceCommand);
        console.log('✅ Systemd service file created');

        // Reload systemd
        const reloadCommand = `sshpass -p '${this.vpsConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.vpsConfig.port} ${this.vpsConfig.user}@${this.vpsConfig.host} "systemctl daemon-reload"`;
        await execAsync(reloadCommand);
        console.log('✅ Systemd daemon reloaded\n');
    }

    async enableAndStartService() {
        console.log('🚀 Enabling and starting service...\n');

        // Enable the service
        const enableCommand = `sshpass -p '${this.vpsConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.vpsConfig.port} ${this.vpsConfig.user}@${this.vpsConfig.host} "systemctl enable boost-space-mcp.service"`;
        await execAsync(enableCommand);
        console.log('✅ Service enabled');

        // Start the service
        const startCommand = `sshpass -p '${this.vpsConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.vpsConfig.port} ${this.vpsConfig.user}@${this.vpsConfig.host} "systemctl start boost-space-mcp.service"`;
        await execAsync(startCommand);
        console.log('✅ Service started\n');
    }

    async verifyDeployment() {
        console.log('🔍 Verifying deployment...\n');

        // Check service status
        const statusCommand = `sshpass -p '${this.vpsConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.vpsConfig.port} ${this.vpsConfig.user}@${this.vpsConfig.host} "systemctl status boost-space-mcp.service --no-pager"`;
        const { stdout: statusOutput } = await execAsync(statusCommand);

        if (statusOutput.includes('Active: active (running)')) {
            console.log('✅ Boost.space MCP server is running');
        } else {
            throw new Error('Service is not running properly');
        }

        // Check if it's listening on a port (MCP servers typically use stdio, but let's verify)
        const processCommand = `sshpass -p '${this.vpsConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.vpsConfig.port} ${this.vpsConfig.user}@${this.vpsConfig.host} "ps aux | grep 'boost-space-mcp' | grep -v grep"`;
        const { stdout: processOutput } = await execAsync(processCommand);

        if (processOutput.includes('server.js')) {
            console.log('✅ Boost.space MCP server process is active');
        } else {
            throw new Error('MCP server process not found');
        }

        console.log('\n📊 DEPLOYMENT SUMMARY:');
        console.log('   ✅ Systemd service created: boost-space-mcp.service');
        console.log('   ✅ Service enabled and started');
        console.log('   ✅ MCP server process active');
        console.log('   ✅ Ready for Email Persona System integration\n');
    }
}

// Run deployment
if (require.main === module) {
    const deployer = new BoostSpaceMCPServerDeployer();
    deployer.deploy().catch(console.error);
}

module.exports = BoostSpaceMCPServerDeployer;
