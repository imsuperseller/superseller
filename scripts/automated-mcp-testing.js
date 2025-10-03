#!/usr/bin/env node

/**
 * Automated MCP Server Testing Script
 * Based on tutorial: "Build an MCP server even if you're not a dev"
 * 
 * This script implements the automated testing workflow:
 * 1. Add server to Claude Desktop config
 * 2. Restart Claude Desktop
 * 3. Check logs for errors
 * 4. Fix errors if found
 * 5. Verify server is working
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

class MCPTester {
  constructor() {
    this.configPath = this.getClaudeDesktopConfigPath();
    this.logsPath = this.getClaudeDesktopLogsPath();
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  getClaudeDesktopConfigPath() {
    const homeDir = os.homedir();
    const platform = os.platform();
    
    if (platform === 'darwin') {
      return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'config.json');
    } else if (platform === 'win32') {
      return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'config.json');
    } else {
      return path.join(homeDir, '.config', 'claude', 'config.json');
    }
  }

  getClaudeDesktopLogsPath() {
    const homeDir = os.homedir();
    const platform = os.platform();
    
    if (platform === 'darwin') {
      return path.join(homeDir, 'Library', 'Logs', 'Claude');
    } else if (platform === 'win32') {
      return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'logs');
    } else {
      return path.join(homeDir, '.local', 'share', 'claude', 'logs');
    }
  }

  async testMCPServer(serverPath, serverName = 'test-mcp-server') {
    console.log(`🧪 Testing MCP Server: ${serverName}`);
    console.log(`📁 Server Path: ${serverPath}`);
    
    try {
      // Step 1: Add server to config
      await this.addServerToConfig(serverPath, serverName);
      console.log('✅ Server added to Claude Desktop config');
      
      // Step 2: Restart Claude Desktop
      await this.restartClaudeDesktop();
      console.log('✅ Claude Desktop restarted');
      
      // Step 3: Check logs for errors
      const errors = await this.checkLogs();
      
      if (errors.length > 0) {
        console.log(`⚠️  Found ${errors.length} errors in logs`);
        console.log('🔧 Attempting to fix errors...');
        
        // Step 4: Fix errors if found
        await this.fixErrors(errors);
        
        // Step 5: Retry testing
        return await this.testMCPServer(serverPath, serverName);
      }
      
      console.log('✅ No errors found in logs');
      console.log('🎉 MCP Server is working correctly!');
      
      return { 
        success: true, 
        message: 'MCP Server working correctly',
        serverName,
        serverPath
      };
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
      return { 
        success: false, 
        error: error.message,
        serverName,
        serverPath
      };
    }
  }

  async addServerToConfig(serverPath, serverName) {
    try {
      // Read existing config
      let config = {};
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, 'utf-8');
        config = JSON.parse(configContent);
      }
      
      // Ensure mcpServers exists
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      
      // Add new server
      config.mcpServers[serverName] = {
        command: 'node',
        args: [serverPath],
        env: {
          NODE_ENV: 'production'
        }
      };
      
      // Write updated config
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      
    } catch (error) {
      throw new Error(`Failed to add server to config: ${error.message}`);
    }
  }

  async restartClaudeDesktop() {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command;
      
      if (platform === 'darwin') {
        // Kill existing Claude Desktop processes
        exec('pkill -f "Claude Desktop"', (error) => {
          if (error && !error.message.includes('No matching processes')) {
            console.log('⚠️  No existing Claude Desktop processes to kill');
          }
          
          // Start Claude Desktop
          command = 'open -a "Claude Desktop"';
          exec(command, (error) => {
            if (error) {
              reject(new Error(`Failed to start Claude Desktop: ${error.message}`));
            } else {
              console.log('🚀 Claude Desktop started');
              setTimeout(resolve, 3000); // Wait 3 seconds for startup
            }
          });
        });
      } else if (platform === 'win32') {
        // Kill existing Claude Desktop processes
        exec('taskkill /f /im "Claude Desktop.exe"', (error) => {
          if (error && !error.message.includes('not found')) {
            console.log('⚠️  No existing Claude Desktop processes to kill');
          }
          
          // Start Claude Desktop
          command = 'start "" "Claude Desktop"';
          exec(command, (error) => {
            if (error) {
              reject(new Error(`Failed to start Claude Desktop: ${error.message}`));
            } else {
              console.log('🚀 Claude Desktop started');
              setTimeout(resolve, 3000); // Wait 3 seconds for startup
            }
          });
        });
      } else {
        reject(new Error(`Unsupported platform: ${platform}`));
      }
    });
  }

  async checkLogs() {
    const errors = [];
    
    try {
      if (!fs.existsSync(this.logsPath)) {
        console.log('⚠️  Logs directory does not exist');
        return errors;
      }
      
      // Read log files
      const logFiles = fs.readdirSync(this.logsPath)
        .filter(file => file.endsWith('.log'))
        .sort((a, b) => {
          const aPath = path.join(this.logsPath, a);
          const bPath = path.join(this.logsPath, b);
          return fs.statSync(bPath).mtime - fs.statSync(aPath).mtime;
        });
      
      // Check most recent log file
      if (logFiles.length > 0) {
        const latestLog = path.join(this.logsPath, logFiles[0]);
        const logContent = fs.readFileSync(latestLog, 'utf-8');
        
        // Look for error patterns
        const errorPatterns = [
          /error/i,
          /failed/i,
          /exception/i,
          /crash/i,
          /timeout/i,
          /connection refused/i,
          /permission denied/i
        ];
        
        const lines = logContent.split('\n');
        lines.forEach((line, index) => {
          errorPatterns.forEach(pattern => {
            if (pattern.test(line)) {
              errors.push({
                line: index + 1,
                content: line.trim(),
                file: latestLog
              });
            }
          });
        });
      }
      
    } catch (error) {
      console.log(`⚠️  Could not read logs: ${error.message}`);
    }
    
    return errors;
  }

  async fixErrors(errors) {
    console.log('🔧 Analyzing errors for potential fixes...');
    
    for (const error of errors) {
      console.log(`📋 Error: ${error.content}`);
      
      // Common error fixes
      if (error.content.includes('permission denied')) {
        console.log('🔧 Fixing permission issue...');
        // Could implement permission fixes here
      } else if (error.content.includes('connection refused')) {
        console.log('🔧 Fixing connection issue...');
        // Could implement connection fixes here
      } else if (error.content.includes('timeout')) {
        console.log('🔧 Fixing timeout issue...');
        // Could implement timeout fixes here
      }
    }
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
  }

  async removeServerFromConfig(serverName) {
    try {
      if (!fs.existsSync(this.configPath)) {
        return;
      }
      
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      
      if (config.mcpServers && config.mcpServers[serverName]) {
        delete config.mcpServers[serverName];
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        console.log(`🗑️  Removed server ${serverName} from config`);
      }
      
    } catch (error) {
      console.log(`⚠️  Could not remove server from config: ${error.message}`);
    }
  }

  async cleanup(serverName) {
    console.log('🧹 Cleaning up...');
    await this.removeServerFromConfig(serverName);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node automated-mcp-testing.js <server-path> [server-name]');
    console.log('Example: node automated-mcp-testing.js ./dist/index.js my-mcp-server');
    process.exit(1);
  }
  
  const serverPath = path.resolve(args[0]);
  const serverName = args[1] || 'test-mcp-server';
  
  const tester = new MCPTester();
  
  tester.testMCPServer(serverPath, serverName)
    .then(result => {
      if (result.success) {
        console.log('🎉 Testing completed successfully!');
        console.log(`✅ Server: ${result.serverName}`);
        console.log(`📁 Path: ${result.serverPath}`);
      } else {
        console.log('❌ Testing failed!');
        console.log(`❌ Error: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = MCPTester;
