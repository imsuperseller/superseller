#!/usr/bin/env node

/**
 * n8n Workflow Validator
 * 
 * Validates that all workflow JSON files have the required structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkflowValidator {
    constructor() {
        this.workflowsDir = path.join(__dirname, '../../workflows/n8n');
        this.errors = [];
        this.warnings = [];
        this.validated = 0;
    }

    async validateAll() {
        console.log('🔍 Validating n8n workflows...\n');

        try {
            // Check if workflows directory exists
            if (!fs.existsSync(this.workflowsDir)) {
                throw new Error(`Workflows directory not found: ${this.workflowsDir}`);
            }

            // Get all JSON files in the workflows directory
            const files = fs.readdirSync(this.workflowsDir)
                .filter(file => file.endsWith('.json'));

            if (files.length === 0) {
                throw new Error('No workflow JSON files found');
            }

            console.log(`📁 Found ${files.length} workflow files:`);

            // Validate each workflow file
            for (const file of files) {
                await this.validateWorkflow(file);
            }

            // Print results
            this.printResults();

            // Exit with appropriate code
            if (this.errors.length > 0) {
                console.error(`\n❌ Validation failed with ${this.errors.length} errors`);
                process.exit(1);
            } else {
                console.log(`\n✅ All ${this.validated} workflows validated successfully!`);
                process.exit(0);
            }

        } catch (error) {
            console.error(`\n❌ Validation failed: ${error.message}`);
            process.exit(1);
        }
    }

    async validateWorkflow(filename) {
        const filepath = path.join(this.workflowsDir, filename);
        console.log(`  📄 ${filename}...`);

        try {
            // Read and parse JSON
            const content = fs.readFileSync(filepath, 'utf8');
            const workflowData = JSON.parse(content);

            // Validate required top-level fields
            this.validateRequiredFields(workflowData, filename);

            // Validate nodes
            this.validateNodes(workflowData, filename);

            // Validate connections
            this.validateConnections(workflowData, filename);

            // Validate settings
            this.validateSettings(workflowData, filename);

            // Validate meta
            this.validateMeta(workflowData, filename);

            this.validated++;

        } catch (error) {
            this.errors.push(`${filename}: ${error.message}`);
        }
    }

    validateRequiredFields(workflow, filename) {
        const required = ['name', 'nodes', 'connections', 'settings'];

        for (const field of required) {
            if (!workflow[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate field types
        if (typeof workflow.name !== 'string') {
            throw new Error('name must be a string');
        }

        if (!Array.isArray(workflow.nodes)) {
            throw new Error('nodes must be an array');
        }

        if (typeof workflow.connections !== 'object') {
            throw new Error('connections must be an object');
        }

        if (typeof workflow.settings !== 'object') {
            throw new Error('settings must be an object');
        }
    }

    validateNodes(workflowData, filename) {
        if (workflowData.nodes.length === 0) {
            throw new Error('Workflow must have at least one node');
        }

        for (let i = 0; i < workflowData.nodes.length; i++) {
            const node = workflowData.nodes[i];
            this.validateNode(node, filename, i);
        }
    }

        validateNode(node, filename, index) {
        const required = ['id', 'name', 'type', 'typeVersion', 'position', 'parameters'];
        
        for (const field of required) {
            if (!node[field]) {
                throw new Error(`Node ${index}: Missing required field: ${field}`);
            }
        }

        // Validate field types
        if (typeof node.id !== 'string') {
            throw new Error(`Node ${index}: id must be a string`);
        }

        if (typeof node.name !== 'string') {
            throw new Error(`Node ${index}: name must be a string`);
        }

        if (typeof node.type !== 'string') {
            throw new Error(`Node ${index}: type must be a string`);
        }

        if (typeof node.typeVersion !== 'number') {
            throw new Error(`Node ${index}: typeVersion must be a number`);
        }

        if (!Array.isArray(node.position) || node.position.length !== 2) {
            throw new Error(`Node ${index}: position must be an array with 2 numbers`);
        }

        if (typeof node.parameters !== 'object') {
            throw new Error(`Node ${index}: parameters must be an object`);
        }

        // Validate position coordinates are numbers
        if (typeof node.position[0] !== 'number' || typeof node.position[1] !== 'number') {
            throw new Error(`Node ${index}: position coordinates must be numbers`);
        }
    }

        validateConnections(workflowData, filename) {
        const nodeIds = workflowData.nodes.map(n => n.id);
        
        for (const [sourceNodeName, connections] of Object.entries(workflowData.connections)) {
            // Check if source node exists
            const sourceNode = workflowData.nodes.find(n => n.name === sourceNodeName);
            if (!sourceNode) {
                this.warnings.push(`${filename}: Connection references non-existent node: ${sourceNodeName}`);
                continue;
            }

            // Validate connection structure
            if (!Array.isArray(connections.main)) {
                throw new Error(`Invalid connection structure for node: ${sourceNodeName}`);
            }

            for (const connectionGroup of connections.main) {
                if (!Array.isArray(connectionGroup)) {
                    throw new Error(`Invalid connection group for node: ${sourceNodeName}`);
                }

                for (const connection of connectionGroup) {
                    if (typeof connection !== 'object' || !connection.node || !connection.type || !connection.index) {
                        throw new Error(`Invalid connection object for node: ${sourceNodeName}`);
                    }

                    // Check if target node exists
                    const targetNode = workflowData.nodes.find(n => n.name === connection.node);
                    if (!targetNode) {
                        this.warnings.push(`${filename}: Connection references non-existent target node: ${connection.node}`);
                    }
                }
            }
        }
    }

    validateSettings(workflowData, filename) {
        if (!workflowData.settings.executionOrder) {
            this.warnings.push(`${filename}: Missing executionOrder in settings`);
        }
    }

    validateMeta(workflowData, filename) {
        if (!workflowData.meta) {
            this.warnings.push(`${filename}: Missing meta field`);
        } else if (typeof workflowData.meta !== 'object') {
            throw new Error('meta must be an object');
        }
    }

    printResults() {
        console.log('\n📊 Validation Results:');
        console.log(`  ✅ Validated: ${this.validated} workflows`);

        if (this.warnings.length > 0) {
            console.log(`  ⚠️  Warnings: ${this.warnings.length}`);
            for (const warning of this.warnings) {
                console.log(`    - ${warning}`);
            }
        }

        if (this.errors.length > 0) {
            console.log(`  ❌ Errors: ${this.errors.length}`);
            for (const error of this.errors) {
                console.log(`    - ${error}`);
            }
        }
    }
}

// Run validation
const validator = new WorkflowValidator();
validator.validateAll().catch(console.error);
