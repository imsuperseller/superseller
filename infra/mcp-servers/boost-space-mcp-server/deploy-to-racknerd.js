#!/usr/bin/env node

/**
 * Boost.space HTTP Server Deployment to Racknerd VPS
 * Following the BMAD plan: "Deploy MCP server on Racknerd VPS"
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class BoostSpaceDeployment {
  constructor() {
    this.racknerdConfig = {
      host: '173.254.201.134',
      user: 'root',
      port: 22,
      password: '05ngBiq2pTA8XSF76x',
      projectPath: '/root/rensto/infra/mcp-servers/boost-space-mcp-server'
    };
  }

  async deploy() {
    console.log('🚀 Starting Boost.space HTTP Server deployment to Racknerd VPS...');
    
    try {
      // Step 1: Create deployment package
      await this.createDeploymentPackage();
      
      // Step 2: Upload to Racknerd VPS
      await this.uploadToRacknerd();
      
      // Step 3: Install dependencies on VPS
      await this.installDependencies();
      
      // Step 4: Start the HTTP server
      await this.startHTTPServer();
      
      // Step 5: Configure systemd service
      await this.configureSystemdService();
      
      console.log('✅ Boost.space HTTP Server successfully deployed to Racknerd VPS!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  async createDeploymentPackage() {
    console.log('📦 Creating deployment package...');
    
    const packageFiles = [
      'server-http.js',
      'package.json',
      'package-lock.json'
    ];
    
    // Ensure all files exist
    for (const file of packageFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    
    console.log('✅ Deployment package created');
  }

  async uploadToRacknerd() {
    console.log('📤 Uploading to Racknerd VPS...');
    
    // Create SSH key file for passwordless authentication
    const sshKeyFile = this.createSSHKeyFile();
    
    const commands = [
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "mkdir -p ${this.racknerdConfig.projectPath}"`,
      `sshpass -p '${this.racknerdConfig.password}' scp -o StrictHostKeyChecking=no -P ${this.racknerdConfig.port} server-http.js ${this.racknerdConfig.user}@${this.racknerdConfig.host}:${this.racknerdConfig.projectPath}/`,
      `sshpass -p '${this.racknerdConfig.password}' scp -o StrictHostKeyChecking=no -P ${this.racknerdConfig.port} package.json ${this.racknerdConfig.user}@${this.racknerdConfig.host}:${this.racknerdConfig.projectPath}/`,
      `sshpass -p '${this.racknerdConfig.password}' scp -o StrictHostKeyChecking=no -P ${this.racknerdConfig.port} package-lock.json ${this.racknerdConfig.user}@${this.racknerdConfig.host}:${this.racknerdConfig.projectPath}/`
    ];
    
    for (const command of commands) {
      await this.executeCommand(command);
    }
    
    // Clean up SSH key file
    this.cleanupSSHKeyFile(sshKeyFile);
    
    console.log('✅ Files uploaded to Racknerd VPS');
  }

  async installDependencies() {
    console.log('📥 Installing dependencies on VPS...');
    
    const command = `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "cd ${this.racknerdConfig.projectPath} && npm install"`;
    
    await this.executeCommand(command);
    console.log('✅ Dependencies installed');
  }

  async startHTTPServer() {
    console.log('🚀 Starting HTTP server on VPS...');
    
    const command = `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "cd ${this.racknerdConfig.projectPath} && nohup node server-http.js > http-server.log 2>&1 &"`;
    
    await this.executeCommand(command);
    console.log('✅ HTTP server started');
  }

  async configureSystemdService() {
    console.log('⚙️ Configuring systemd service...');
    
    const serviceContent = `[Unit]
Description=Boost.space HTTP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${this.racknerdConfig.projectPath}
ExecStart=/usr/bin/node server-http.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target`;

    const serviceFile = 'boost-space-http.service';
    fs.writeFileSync(serviceFile, serviceContent);
    
    const commands = [
      `sshpass -p '${this.racknerdConfig.password}' scp -o StrictHostKeyChecking=no -P ${this.racknerdConfig.port} ${serviceFile} ${this.racknerdConfig.user}@${this.racknerdConfig.host}:/etc/systemd/system/`,
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "systemctl daemon-reload"`,
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "systemctl enable boost-space-http"`,
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "systemctl start boost-space-http"`
    ];
    
    for (const command of commands) {
      await this.executeCommand(command);
    }
    
    // Clean up local service file
    fs.unlinkSync(serviceFile);
    
    console.log('✅ Systemd service configured and started');
  }

  createSSHKeyFile() {
    // This is a simplified approach - in production you'd use proper SSH key management
    return null;
  }

  cleanupSSHKeyFile(sshKeyFile) {
    // Cleanup if needed
  }

  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Command failed: ${command}`);
          console.error(`Error: ${error.message}`);
          reject(error);
          return;
        }
        
        if (stdout) console.log(stdout);
        if (stderr) console.warn(stderr);
        resolve();
      });
    });
  }

  async checkStatus() {
    console.log('🔍 Checking deployment status...');
    
    const commands = [
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "systemctl status boost-space-http"`,
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "cd ${this.racknerdConfig.projectPath} && tail -n 10 http-server.log"`,
      `sshpass -p '${this.racknerdConfig.password}' ssh -o StrictHostKeyChecking=no -p ${this.racknerdConfig.port} ${this.racknerdConfig.user}@${this.racknerdConfig.host} "curl -s http://localhost:3001/health"`
    ];
    
    for (const command of commands) {
      await this.executeCommand(command);
    }
  }
}

// Run deployment
const deployment = new BoostSpaceDeployment();

if (process.argv.includes('--status')) {
  deployment.checkStatus();
} else {
  deployment.deploy();
}
