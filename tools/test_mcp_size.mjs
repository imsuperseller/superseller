import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';

// Mock log
function log(msg) { console.error(msg); }

class Tester {
    constructor() {
        this.server = new Server({ name: 'test', version: '1.0' }, { capabilities: { tools: {} } });
        this.instances = { 'superseller': {} };
        this.setupHandlers();
    }

    setupHandlers() {
        // Copy the ListTools handler logic from your main file
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const instanceEnum = Object.keys(this.instances);
            return {
                tools: [
                    { name: 'n8n_list_workflows', description: 'List workflows from a specific n8n instance', inputSchema: { type: 'object', properties: { instance: { type: 'string', enum: instanceEnum, default: 'superseller' }, limit: { type: 'number', default: 20 } } } },
                    { name: 'n8n_get_workflow', description: 'Get workflow definition for analysis or editing', inputSchema: { type: 'object', properties: { id: { type: 'string' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_execute_workflow', description: 'Trigger a workflow execution', inputSchema: { type: 'object', properties: { id: { type: 'string' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' }, data: { type: 'object' } }, required: ['id'] } },
                    { name: 'n8n_update_workflow', description: 'Update an existing workflow. Requires the full workflow object with name, nodes, connections, and settings.', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Workflow ID to update' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' }, workflow: { type: 'object', description: 'Full workflow object with name, nodes, connections, settings' }, workflowFilePath: { type: 'string', description: 'Absolute path to a JSON file containing the workflow object. Use this to bypass token limits.' } }, required: ['id'] } },
                    { name: 'n8n_get_executions', description: 'Get list of workflow executions. Filter by workflow ID, status, or date.', inputSchema: { type: 'object', properties: { workflowId: { type: 'string', description: 'Filter by specific workflow ID' }, status: { type: 'string', enum: ['error', 'success', 'waiting'], description: 'Filter by execution status' }, limit: { type: 'number', default: 20 }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } } } },
                    { name: 'n8n_get_execution', description: 'Get details of a specific execution by ID, including input/output data.', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Execution ID' }, includeData: { type: 'boolean', default: true, description: 'Include execution data (input/output)' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_activate_workflow', description: 'Activate a workflow (set active=true)', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Workflow ID to activate' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_deactivate_workflow', description: 'Deactivate a workflow (set active=false)', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Workflow ID to deactivate' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_create_workflow', description: 'Create a new workflow from a JSON definition.', inputSchema: { type: 'object', properties: { instance: { type: 'string', enum: instanceEnum, default: 'superseller' }, workflow: { type: 'object', description: 'Full workflow object (name, nodes, connections, settings)' } }, required: ['workflow'] } },
                    { name: 'n8n_delete_workflow', description: 'Delete a workflow by ID.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_stop_execution', description: 'Stop a running workflow execution.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_search_workflows', description: 'Search workflows by name.', inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Text to search for in workflow names' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' }, limit: { type: 'number', default: 20 } } } },
                    { name: 'n8n_get_credentials', description: 'List available credentials (metadata only).', inputSchema: { type: 'object', properties: { instance: { type: 'string', enum: instanceEnum, default: 'superseller' } } } },
                    { name: 'n8n_get_tags', description: 'List all workflow tags.', inputSchema: { type: 'object', properties: { instance: { type: 'string', enum: instanceEnum, default: 'superseller' } } } },
                    { name: 'n8n_validate_workflow', description: 'Technical audit of a workflow for deprecated nodes or malformed connections.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_autofix_workflow', description: 'Automatically resolve common issues in a workflow (e.g. updating node versions).', inputSchema: { type: 'object', properties: { id: { type: 'string' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_analyze_execution_errors', description: 'Pattern detection across failed executions with root cause suggestions.', inputSchema: { type: 'object', properties: { instance: { type: 'string', enum: instanceEnum, default: 'superseller' }, limit: { type: 'number', default: 50, description: 'Number of recent executions to analyze' } } } },
                    { name: 'n8n_get_workflow_dependencies', description: 'Map node relationships, data flow, and external service connections.', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Workflow ID' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_validate_data_mapping', description: 'Check expression syntax and data paths before deployment.', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Workflow ID' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'n8n_credential_usage_audit', description: 'Track which workflows use which credentials for security reviews.', inputSchema: { type: 'object', properties: { instance: { type: 'string', enum: instanceEnum, default: 'superseller' } } } },
                    { name: 'n8n_generate_workflow_docs', description: 'Auto-generate markdown documentation from workflow structure.', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'Workflow ID' }, instance: { type: 'string', enum: instanceEnum, default: 'superseller' } }, required: ['id'] } },
                    { name: 'stripe_list_customers', description: 'List Stripe customers', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
                    { name: 'stripe_get_balance', description: 'Get Stripe balance', inputSchema: { type: 'object' } },
                    { name: 'stripe_list_invoices', description: 'List invoices', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
                    { name: 'firebase_list_projects', description: 'List Firebase projects', inputSchema: { type: 'object' } },
                    { name: 'firebase_deploy', description: 'Deploy to Firebase', inputSchema: { type: 'object', properties: { project: { type: 'string' } }, required: ['project'] } },
                    { name: 'get_status', description: 'Get server health and environment status', inputSchema: { type: 'object' } }
                ]
            };
        });
    }

    async run() {
        const handler = this.server._requestHandlers.get(ListToolsRequestSchema.method);
        const result = await handler({});
        const json = JSON.stringify(result);
        console.log(`TOOL_LIST_SIZE: ${json.length} bytes`);
        // console.log(json);
    }
}

const t = new Tester();
t.run();
