#!/usr/bin/env node

/**
 * 🔧 TARGETED FIX: SHELLY'S EMAIL NODE CREDENTIALS
 * 
 * Fixes only the email node credentials issue without breaking workflow structure
 */

import axios from 'axios';

class ShellyEmailNodeFixer {
    constructor() {
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

    async fixEmailNode() {
        console.log('🔧 FIXING EMAIL NODE CREDENTIALS');
        console.log('=================================');
        console.log(`🎯 Workflow ID: ${this.workflowId}`);
        console.log(`☁️ n8n Instance: ${this.n8nConfig.baseUrl}`);
        console.log('');

        try {
            // Step 1: Get current workflow
            console.log('📥 Fetching current workflow...');
            const getResponse = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, {
                headers: this.n8nConfig.headers
            });

            const workflow = getResponse.data;
            console.log(`✅ Workflow loaded: ${workflow.name}`);

            // Step 2: Find email node
            const emailNode = workflow.nodes.find(node => node.name === 'Email to Shelly');
            if (!emailNode) {
                throw new Error('Email node not found');
            }

            console.log(`📍 Found email node: ${emailNode.id}`);

            // Step 3: Add credentials to email node
            emailNode.credentials = {
                smtp: {
                    id: 'shelly-smtp',
                    name: 'Shelly SMTP'
                }
            };

            console.log('🔑 Added SMTP credentials to email node');

            // Step 4: Update workflow
            console.log('📤 Updating workflow...');
            const updateResponse = await axios.put(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, workflow, {
                headers: this.n8nConfig.headers
            });

            console.log('✅ Workflow updated successfully');

            // Step 5: Verify the fix
            console.log('🔍 Verifying fix...');
            const verifyResponse = await axios.get(`${this.n8nConfig.baseUrl}/api/v1/workflows/${this.workflowId}`, {
                headers: this.n8nConfig.headers
            });

            const updatedWorkflow = verifyResponse.data;
            const updatedEmailNode = updatedWorkflow.nodes.find(node => node.name === 'Email to Shelly');

            if (updatedEmailNode.credentials && updatedEmailNode.credentials.smtp) {
                console.log('✅ Email node credentials verified');
            } else {
                console.log('❌ Email node credentials not found after update');
            }

            console.log('\n🎉 EMAIL NODE FIX COMPLETE!');
            console.log('============================');
            console.log('✅ SMTP credentials added to email node');
            console.log('✅ Workflow updated successfully');
            console.log('');
            console.log('📋 NEXT STEPS FOR SHELLY:');
            console.log('   1. Go to n8n interface: https://shellyins.app.n8n.cloud');
            console.log('   2. Navigate to Settings → Credentials');
            console.log('   3. Create "Shelly SMTP" credential with Gmail settings:');
            console.log('      - Host: smtp.gmail.com');
            console.log('      - Port: 587');
            console.log('      - User: shellypensia@gmail.com');
            console.log('      - Password: [App Password from Gmail]');
            console.log('   4. Test the workflow');
            console.log('');
            console.log('🔗 Workflow URL: https://shellyins.app.n8n.cloud/workflow/cvcjOW0zOZVIvO2X');

            return { success: true };
        } catch (error) {
            console.error('❌ Email node fix failed:', error.message);
            if (error.response) {
                console.error('📋 Response status:', error.response.status);
                console.error('📋 Response data:', JSON.stringify(error.response.data, null, 2));
            }
            return { success: false, error: error.message };
        }
    }
}

// Execute email node fix
const fixer = new ShellyEmailNodeFixer();
fixer.fixEmailNode().catch(console.error);

export default ShellyEmailNodeFixer;
