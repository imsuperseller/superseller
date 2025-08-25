#!/usr/bin/env node

import fs from 'fs/promises';
import { spawn } from 'child_process';

class Tax4UsMCPDeployer {
    constructor() {
        this.workflowFiles = [
            'workflows/tax4us_enhanced_wordpress_agent.json',
            'workflows/tax4us_wordpress_agent_workflow.json'
        ];
    }

    async start() {
        console.log('🎯 TAX4US WORDPRESS AGENT DEPLOYMENT VIA MCP');
        console.log('=============================================\n');
        
        try {
            // Step 1: Check MCP server status
            await this.checkMCPServer();
            
            // Step 2: Deploy workflows via MCP
            await this.deployWorkflowsViaMCP();
            
            // Step 3: Activate workflows
            await this.activateWorkflowsViaMCP();
            
            console.log('\n✅ Tax4Us WordPress Agent deployment completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during deployment:', error.message);
        }
    }

    async checkMCPServer() {
        console.log('🏥 Step 1: Checking n8n MCP server status...');
        
        try {
            const result = await this.runSSHCommand('node /opt/mcp-servers/n8n-mcp-server/server-enhanced.js');
            console.log('✅ n8n MCP server is running');
            
        } catch (error) {
            console.error(`❌ MCP server check failed: ${error.message}`);
            throw error;
        }
    }

    async deployWorkflowsViaMCP() {
        console.log('\n🚀 Step 2: Deploying Tax4Us workflows via MCP...');
        
        for (const workflowFile of this.workflowFiles) {
            try {
                console.log(`\n📦 Deploying: ${workflowFile}`);
                
                // Read workflow file
                const workflowData = await fs.readFile(workflowFile, 'utf8');
                const workflow = JSON.parse(workflowData);
                
                // Create deployment command
                const deployCommand = `echo '${JSON.stringify({
                    jsonrpc: "2.0",
                    method: "tools/call",
                    params: {
                        name: "create_workflow",
                        arguments: {
                            instance: "tax4us",
                            workflow: workflow
                        }
                    },
                    id: Date.now()
                })}' | node /opt/mcp-servers/n8n-mcp-server/server-enhanced.js`;
                
                const result = await this.runSSHCommand(deployCommand);
                console.log(`  ✅ Deployed workflow: ${workflow.name}`);
                
            } catch (error) {
                console.error(`  ❌ Error deploying ${workflowFile}: ${error.message}`);
            }
        }
    }

    async activateWorkflowsViaMCP() {
        console.log('\n🔌 Step 3: Activating Tax4Us workflows via MCP...');
        
        try {
            // Get workflows
            const listCommand = `echo '${JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                    name: "list_workflows",
                    arguments: {
                        instance: "tax4us"
                    }
                },
                id: Date.now()
            })}' | node /opt/mcp-servers/n8n-mcp-server/server-enhanced.js`;
            
            const workflowsResult = await this.runSSHCommand(listCommand);
            console.log('✅ Retrieved workflows list');
            
            // Activate Tax4Us workflows
            const activateCommand = `echo '${JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                    name: "activate_workflow",
                    arguments: {
                        instance: "tax4us",
                        workflowName: "Tax4Us Enhanced WordPress Content Agent"
                    }
                },
                id: Date.now()
            })}' | node /opt/mcp-servers/n8n-mcp-server/server-enhanced.js`;
            
            const activateResult = await this.runSSHCommand(activateCommand);
            console.log('✅ Activated Tax4Us workflows');
            
        } catch (error) {
            console.error(`❌ Error activating workflows: ${error.message}`);
        }
    }

    runSSHCommand(command) {
        return new Promise((resolve, reject) => {
            const sshProcess = spawn('sshpass', [
                '-p', '05ngBiq2pTA8XSF76x',
                'ssh',
                '-o', 'StrictHostKeyChecking=no',
                'root@173.254.201.134',
                command
            ]);
            
            let output = '';
            let errorOutput = '';
            
            sshProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            sshProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            sshProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`SSH command failed with code ${code}: ${errorOutput}`));
                }
            });
            
            sshProcess.on('error', (error) => {
                reject(error);
            });
        });
    }
}

// Run the deployment
const deployer = new Tax4UsMCPDeployer();
deployer.start().catch(console.error);
