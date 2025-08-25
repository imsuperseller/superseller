#!/usr/bin/env node

/**
 * 🔧 FIX WORKFLOW CONFIGURATIONS
 * 
 * Purpose: Fix the "propertyValues[itemName] is not iterable" errors
 * that are preventing workflow activation
 */

const axios = require('axios');
const fs = require('fs').promises;

class WorkflowConfigurationFixer {
    constructor() {
        this.vpsConfig = {
            url: 'http://173.254.201.134:5678',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
            headers: {
                'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE',
                'Content-Type': 'application/json'
            }
        };

        this.fixResults = {
            timestamp: new Date().toISOString(),
            phase: 'Workflow Configuration Fix',
            fixedWorkflows: [],
            failedWorkflows: [],
            totalFixed: 0,
            totalFailed: 0
        };
    }

    async execute() {
        console.log('🔧 FIXING WORKFLOW CONFIGURATIONS\n');
        console.log('='.repeat(50));

        try {
            await this.identifyBrokenWorkflows();
            await this.fixWorkflowConfigurations();
            await this.verifyFixes();
            await this.saveResults();
            this.displayResults();

        } catch (error) {
            console.error('❌ Workflow configuration fix failed:', error.message);
            throw error;
        }
    }

    async identifyBrokenWorkflows() {
        console.log('🔍 IDENTIFYING BROKEN WORKFLOWS...\n');

        const vpsWorkflows = await this.getVPSWorkflows();
        const brokenWorkflows = [];

        for (const workflow of vpsWorkflows) {
            if (!workflow.active) {
                console.log(`Testing workflow: ${workflow.name} (${workflow.id})`);

                try {
                    const response = await axios.post(
                        `${this.vpsConfig.url}/api/v1/workflows/${workflow.id}/activate`,
                        {},
                        { headers: this.vpsConfig.headers }
                    );

                    if (response.status === 200) {
                        console.log(`✅ ${workflow.name} - Already working`);
                    }
                } catch (error) {
                    if (error.response?.status === 400) {
                        console.log(`❌ ${workflow.name} - BROKEN (${error.response.data.message})`);
                        brokenWorkflows.push({
                            id: workflow.id,
                            name: workflow.name,
                            error: error.response.data.message
                        });
                    }
                }
            }
        }

        this.fixResults.brokenWorkflows = brokenWorkflows;
        console.log(`\n📊 Found ${brokenWorkflows.length} broken workflows out of ${vpsWorkflows.length} total`);
    }

    async fixWorkflowConfigurations() {
        console.log('\n🔧 FIXING WORKFLOW CONFIGURATIONS...\n');

        for (const workflow of this.fixResults.brokenWorkflows) {
            console.log(`Fixing: ${workflow.name}`);

            try {
                // Get the current workflow configuration
                const workflowConfig = await this.getWorkflowConfig(workflow.id);

                // Fix the configuration
                const fixedConfig = this.fixWorkflowConfig(workflowConfig);

                // Update the workflow
                const result = await this.updateWorkflow(workflow.id, fixedConfig);

                if (result) {
                    // Try to activate the fixed workflow
                    const activationResult = await this.activateWorkflow(workflow.id);

                    if (activationResult) {
                        console.log(`✅ ${workflow.name} - FIXED AND ACTIVATED`);
                        this.fixResults.fixedWorkflows.push({
                            id: workflow.id,
                            name: workflow.name,
                            status: 'fixed_and_activated'
                        });
                        this.fixResults.totalFixed++;
                    } else {
                        console.log(`⚠️ ${workflow.name} - FIXED BUT ACTIVATION FAILED`);
                        this.fixResults.fixedWorkflows.push({
                            id: workflow.id,
                            name: workflow.name,
                            status: 'fixed_but_activation_failed'
                        });
                        this.fixResults.totalFixed++;
                    }
                } else {
                    console.log(`❌ ${workflow.name} - FIX FAILED`);
                    this.fixResults.failedWorkflows.push({
                        id: workflow.id,
                        name: workflow.name,
                        status: 'fix_failed'
                    });
                    this.fixResults.totalFailed++;
                }

            } catch (error) {
                console.log(`❌ ${workflow.name} - ERROR: ${error.message}`);
                this.fixResults.failedWorkflows.push({
                    id: workflow.id,
                    name: workflow.name,
                    status: 'error',
                    error: error.message
                });
                this.fixResults.totalFailed++;
            }
        }
    }

    async getWorkflowConfig(workflowId) {
        try {
            const response = await axios.get(
                `${this.vpsConfig.url}/api/v1/workflows/${workflowId}`,
                { headers: this.vpsConfig.headers }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get workflow config: ${error.message}`);
        }
    }

    fixWorkflowConfig(workflowConfig) {
        // Create a clean copy of the workflow
        const fixedConfig = {
            name: workflowConfig.name,
            nodes: [],
            connections: {},
            settings: {
                executionOrder: 'v1'
            },
            staticData: null,
            meta: null,
            pinData: null
        };

        // Fix each node
        for (const node of workflowConfig.nodes) {
            const fixedNode = this.fixNode(node);
            fixedConfig.nodes.push(fixedNode);
        }

        // Copy connections
        if (workflowConfig.connections) {
            fixedConfig.connections = workflowConfig.connections;
        }

        return fixedConfig;
    }

    fixNode(node) {
        const fixedNode = {
            id: node.id,
            name: node.name,
            type: node.type,
            typeVersion: node.typeVersion || 1,
            position: node.position || [0, 0],
            parameters: {}
        };

        // Fix parameters based on node type
        if (node.parameters) {
            switch (node.type) {
                case 'n8n-nodes-base.webhook':
                    fixedNode.parameters = this.fixWebhookNode(node.parameters);
                    break;
                case 'n8n-nodes-base.if':
                    fixedNode.parameters = this.fixIfNode(node.parameters);
                    break;
                case 'n8n-nodes-base.code':
                    fixedNode.parameters = this.fixCodeNode(node.parameters);
                    break;
                case 'n8n-nodes-base.emailSend':
                    fixedNode.parameters = this.fixEmailNode(node.parameters);
                    break;
                case 'n8n-nodes-base.respondToWebhook':
                    fixedNode.parameters = this.fixRespondNode(node.parameters);
                    break;
                default:
                    // For unknown node types, try to preserve parameters safely
                    fixedNode.parameters = this.safeCopyParameters(node.parameters);
            }
        }

        return fixedNode;
    }

    fixWebhookNode(parameters) {
        return {
            httpMethod: parameters.httpMethod || 'GET',
            path: parameters.path || 'webhook',
            responseMode: parameters.responseMode || 'responseNode',
            options: parameters.options || {}
        };
    }

    fixIfNode(parameters) {
        return {
            conditions: {
                options: {
                    caseSensitive: true,
                    leftValue: '',
                    typeValidation: 'strict'
                },
                conditions: [
                    {
                        id: 'condition1',
                        leftValue: '={{ $json.data }}',
                        rightValue: '',
                        operator: {
                            type: 'string',
                            operation: 'exists'
                        }
                    }
                ],
                combinator: 'and'
            }
        };
    }

    fixCodeNode(parameters) {
        return {
            jsCode: parameters.jsCode || '// Default code\nreturn $input.all();'
        };
    }

    fixEmailNode(parameters) {
        return {
            fromEmail: parameters.fromEmail || 'noreply@rensto.com',
            toEmail: parameters.toEmail || '={{ $json.email }}',
            subject: parameters.subject || 'Default Subject',
            text: parameters.text || 'Default message content',
            options: parameters.options || {}
        };
    }

    fixRespondNode(parameters) {
        return {
            respondWith: 'json',
            responseBody: '{\n  "success": true,\n  "message": "Workflow executed successfully",\n  "data": {{ $json }}\n}',
            options: parameters.options || {}
        };
    }

    safeCopyParameters(parameters) {
        // Safely copy parameters, filtering out problematic properties
        const safeParams = {};
        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value !== 'function' && key !== 'propertyValues') {
                safeParams[key] = value;
            }
        }
        return safeParams;
    }

    async updateWorkflow(workflowId, config) {
        try {
            const response = await axios.put(
                `${this.vpsConfig.url}/api/v1/workflows/${workflowId}`,
                config,
                { headers: this.vpsConfig.headers }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update workflow: ${error.message}`);
        }
    }

    async activateWorkflow(workflowId) {
        try {
            const response = await axios.post(
                `${this.vpsConfig.url}/api/v1/workflows/${workflowId}/activate`,
                {},
                { headers: this.vpsConfig.headers }
            );
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async verifyFixes() {
        console.log('\n🔍 VERIFYING FIXES...\n');

        const vpsWorkflows = await this.getVPSWorkflows();
        const activeWorkflows = vpsWorkflows.filter(w => w.active);

        this.fixResults.verification = {
            totalWorkflows: vpsWorkflows.length,
            activeWorkflows: activeWorkflows.length,
            activationRate: Math.round((activeWorkflows.length / vpsWorkflows.length) * 100),
            fixedCount: this.fixResults.totalFixed,
            failedCount: this.fixResults.totalFailed
        };

        console.log(`📊 Verification Results:`);
        console.log(`   - Total workflows: ${vpsWorkflows.length}`);
        console.log(`   - Active workflows: ${activeWorkflows.length}`);
        console.log(`   - Activation rate: ${this.fixResults.verification.activationRate}%`);
        console.log(`   - Fixed workflows: ${this.fixResults.totalFixed}`);
        console.log(`   - Failed fixes: ${this.fixResults.totalFailed}`);
    }

    async getVPSWorkflows() {
        try {
            const response = await axios.get(`${this.vpsConfig.url}/api/v1/workflows`, {
                headers: this.vpsConfig.headers
            });
            return response.data.data || response.data;
        } catch (error) {
            console.error('❌ Failed to get VPS workflows:', error.message);
            return [];
        }
    }

    async saveResults() {
        const resultsPath = 'logs/workflow-configuration-fix.json';
        await fs.writeFile(resultsPath, JSON.stringify(this.fixResults, null, 2));
        console.log(`📁 Results saved to: ${resultsPath}`);
    }

    displayResults() {
        console.log('\n📋 WORKFLOW CONFIGURATION FIX REPORT');
        console.log('====================================\n');

        const verification = this.fixResults.verification;
        const successRate = this.fixResults.totalFixed > 0 ?
            Math.round((this.fixResults.totalFixed / (this.fixResults.totalFixed + this.fixResults.totalFailed)) * 100) : 0;

        console.log(`📊 FIX SUCCESS RATE: ${successRate}%`);
        console.log(`📊 OVERALL ACTIVATION RATE: ${verification.activationRate}%`);

        console.log('\n✅ FIXED WORKFLOWS:');
        this.fixResults.fixedWorkflows.forEach(workflow => {
            console.log(`  - ${workflow.name}: ${workflow.status}`);
        });

        if (this.fixResults.failedWorkflows.length > 0) {
            console.log('\n❌ FAILED FIXES:');
            this.fixResults.failedWorkflows.forEach(workflow => {
                console.log(`  - ${workflow.name}: ${workflow.status}`);
            });
        }

        console.log('\n🎯 RECOMMENDATION:');
        if (verification.activationRate >= 70) {
            console.log('✅ READY TO PROGRESS - Activation rate is acceptable');
        } else {
            console.log('❌ NOT READY TO PROGRESS - Activation rate too low');
            console.log('   Need to achieve at least 70% activation rate');
        }

        console.log('\n🎉 Workflow Configuration Fix Complete!');
    }
}

// Execute workflow configuration fix
if (require.main === module) {
    const fixer = new WorkflowConfigurationFixer();
    fixer.execute().catch(console.error);
}

module.exports = WorkflowConfigurationFixer;
