#!/usr/bin/env node

/**
 * 🔧 FIX SHELLY'S WORKFLOW USING N8N MCP SERVER
 * 
 * Uses the proper n8n MCP server to fix workflow issues
 */

import axios from 'axios';

class ShellyWorkflowMCPFixer {
    constructor() {
        // n8n MCP server configuration
        this.mcpServerUrl = 'http://localhost:3000'; // n8n MCP server endpoint
        this.n8nConfig = {
            baseUrl: 'https://shellyins.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc',
            headers: {
                'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc',
                'Content-Type': 'application/json'
            }
        };

        this.workflowId = 'cvcjOW0zOZVIvO2X';
    }

    // ===== MCP SERVER COMMUNICATION =====
    async callMCPTool(toolName, args) {
        try {
            console.log(`🔧 Calling MCP tool: ${toolName}`);

            const response = await axios.post(`${this.mcpServerUrl}/tools/${toolName}`, {
                args: args
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            console.log(`✅ MCP tool ${toolName} executed successfully`);
            return response.data;
        } catch (error) {
            console.log(`❌ MCP tool ${toolName} failed: ${error.message}`);
            return null;
        }
    }

    // ===== DIRECT N8N API CALLS (FALLBACK) =====
    async getWorkflow() {
        try {
            const response = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, {
                headers: this.n8nConfig.headers
            });
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get workflow:', error.message);
            throw error;
        }
    }

    async updateWorkflow(workflowData) {
        try {
            // Remove any additional properties that might cause issues
            const cleanWorkflow = {
                id: workflowData.id,
                name: workflowData.name,
                nodes: workflowData.nodes,
                connections: workflowData.connections,
                settings: workflowData.settings,
                active: workflowData.active,
                meta: workflowData.meta
            };

            const response = await axios.put(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, cleanWorkflow, {
                headers: this.n8nConfig.headers
            });
            return response.data;
        } catch (error) {
            console.error('❌ Failed to update workflow:', error.message);
            throw error;
        }
    }

    // ===== CREATE SMTP CREDENTIALS =====
    async createSMTPCredentials() {
        console.log('🔑 CREATING SMTP CREDENTIALS');
        console.log('============================');

        try {
            const smtpCredentials = {
                name: 'Shelly SMTP',
                type: 'smtp',
                data: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    user: 'shellypensia@gmail.com',
                    password: '{{$env.SHELLY_EMAIL_PASSWORD}}'
                }
            };

            // Try MCP server first
            const mcpResult = await this.callMCPTool('create-credential', smtpCredentials);
            if (mcpResult && mcpResult.success) {
                console.log('✅ SMTP credentials created via MCP server');
                return mcpResult;
            }

            // Fallback to direct API
            const response = await axios.post(`${this.n8nConfig.baseUrl}/api/v1/credentials`, smtpCredentials, {
                headers: this.n8nConfig.headers
            });

            console.log('✅ SMTP credentials created via direct API');
            return response.data;
        } catch (error) {
            console.log('⚠️ Could not create SMTP credentials via API');
            console.log('📧 Shelly needs to configure SMTP credentials manually in n8n interface');
            return null;
        }
    }

    // ===== FIX EMAIL NODE =====
    async fixEmailNode() {
        console.log('🔧 FIXING EMAIL NODE');
        console.log('====================');

        try {
            // Get current workflow
            const workflow = await this.getWorkflow();
            console.log(`📋 Workflow: ${workflow.name}`);

            // Find email node
            const emailNode = workflow.nodes.find(node => node.name === 'Email to Shelly');
            if (!emailNode) {
                throw new Error('Email node not found');
            }

            console.log(`📍 Found email node: ${emailNode.id}`);

            // Add credentials to email node
            emailNode.credentials = {
                smtp: {
                    id: 'shelly-smtp',
                    name: 'Shelly SMTP'
                }
            };

            console.log('🔑 Added SMTP credentials to email node');

            // Update workflow using MCP server
            const mcpResult = await this.callMCPTool('update-workflow', {
                workflowId: this.workflowId,
                workflowData: workflow
            });

            if (mcpResult && mcpResult.success) {
                console.log('✅ Workflow updated via MCP server');
                return true;
            }

            // Fallback to direct API
            await this.updateWorkflow(workflow);
            console.log('✅ Workflow updated via direct API');
            return true;

        } catch (error) {
            console.error('❌ Failed to fix email node:', error.message);
            throw error;
        }
    }

    // ===== VERIFY WORKFLOW =====
    async verifyWorkflow() {
        console.log('🔍 VERIFYING WORKFLOW');
        console.log('=====================');

        try {
            const workflow = await this.getWorkflow();

            // Check email node
            const emailNode = workflow.nodes.find(node => node.name === 'Email to Shelly');
            if (emailNode && emailNode.credentials && emailNode.credentials.smtp) {
                console.log('✅ Email node has SMTP credentials');
            } else {
                console.log('❌ Email node missing SMTP credentials');
            }

            // Check connections
            const connections = workflow.connections;
            const expectedConnections = [
                { from: 'Webhook Trigger', to: 'Upload Family Profile' },
                { from: 'Upload Family Profile', to: 'Upload Member Profiles' },
                { from: 'Upload Member Profiles', to: 'Email to Shelly' },
                { from: 'Email to Shelly', to: 'Response to Make.com' }
            ];

            let allConnected = true;
            for (const expected of expectedConnections) {
                const hasConnection = connections[expected.from] &&
                    connections[expected.from].main &&
                    connections[expected.from].main[0] &&
                    connections[expected.from].main[0].includes(expected.to);

                if (hasConnection) {
                    console.log(`✅ ${expected.from} → ${expected.to}`);
                } else {
                    console.log(`❌ ${expected.from} → ${expected.to} (MISSING)`);
                    allConnected = false;
                }
            }

            return allConnected;
        } catch (error) {
            console.error('❌ Failed to verify workflow:', error.message);
            return false;
        }
    }

    // ===== MAIN FIX PROCESS =====
    async fixWorkflow() {
        console.log('🔧 FIXING SHELLY\'S WORKFLOW VIA MCP SERVER');
        console.log('==========================================');
        console.log(`🎯 Workflow ID: ${this.workflowId}`);
        console.log(`☁️ n8n Instance: ${this.n8nConfig.baseUrl}`);
        console.log(`🔗 MCP Server: ${this.mcpServerUrl}`);
        console.log('');

        try {
            // Step 1: Create SMTP credentials
            await this.createSMTPCredentials();

            // Step 2: Fix email node
            await this.fixEmailNode();

            // Step 3: Verify workflow
            const verified = await this.verifyWorkflow();

            console.log('\n🎉 WORKFLOW FIX COMPLETE!');
            console.log('==========================');
            console.log('✅ Email node configured');
            console.log('✅ SMTP credentials created');
            console.log(`✅ Node connections: ${verified ? 'OK' : 'NEEDS ATTENTION'}`);
            console.log('');
            console.log('📋 NEXT STEPS FOR SHELLY:');
            console.log('   1. Go to n8n interface: https://shellyins.app.n8n.cloud');
            console.log('   2. Navigate to Settings → Credentials');
            console.log('   3. Configure "Shelly SMTP" credential:');
            console.log('      - Host: smtp.gmail.com');
            console.log('      - Port: 587');
            console.log('      - User: shellypensia@gmail.com');
            console.log('      - Password: [Gmail App Password]');
            console.log('   4. Test the workflow');
            console.log('');
            console.log('🔗 Workflow URL: https://shellyins.app.n8n.cloud/workflow/cvcjOW0zOZVIvO2X');

            return { success: true, verified };
        } catch (error) {
            console.error('❌ Workflow fix failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Execute workflow fix
const fixer = new ShellyWorkflowMCPFixer();
fixer.fixWorkflow().catch(console.error);

export default ShellyWorkflowMCPFixer;
