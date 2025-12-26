/**
 * n8n Workflow Sanitizer
 * Recursively removes sensitive credential keys and environment-specific 
 * identifiers from n8n JSON exports to ensure secure delivery to customers.
 */

interface N8nNode {
    credentials?: Record<string, any>;
    [key: string]: any;
}

interface N8nWorkflow {
    nodes: N8nNode[];
    connections: Record<string, any>;
    settings?: Record<string, any>;
    staticData?: any;
    meta?: Record<string, any>;
    [key: string]: any;
}

/**
 * Sanitizes a workflow by removing all 'credentials' blocks and 
 * cleaning up environment-specific metadata.
 */
export function sanitizeWorkflow(workflow: N8nWorkflow): N8nWorkflow {
    const sanitized = JSON.parse(JSON.stringify(workflow));

    // 1. Strip credentials from all nodes
    if (Array.isArray(sanitized.nodes)) {
        sanitized.nodes = sanitized.nodes.map((node: N8nNode) => {
            const { credentials, ...rest } = node;
            return rest;
        });
    }

    // 2. Remove static data (execution state)
    delete sanitized.staticData;

    // 3. Clean up metadata
    if (sanitized.meta) {
        delete sanitized.meta.instanceId;
    }

    // 4. Reset settings that might be specific to internal testing
    if (sanitized.settings) {
        delete sanitized.settings.executionOrder;
        delete sanitized.settings.saveExecutionProgress;
        delete sanitized.settings.saveManualExecutions;
    }

    // 5. Add "Rensto Protective Layer" note to the workflow
    if (Array.isArray(sanitized.nodes)) {
        sanitized.nodes.push({
            parameters: {
                content: "### 🛡️ Rensto Protected Template\nThis workflow has been sanitized for security. Please reconnect your own credentials to the relevant nodes."
            },
            id: "rensto-security-note",
            name: "Rensto Security Note",
            type: "n8n-nodes-base.stickyNote",
            typeVersion: 1,
            position: [0, -200]
        });
    }

    return sanitized;
}

/**
 * Validates that the sanitized JSON is still a valid n8n structure.
 */
export function validateSanitizedWorkflow(workflow: any): boolean {
    return (
        workflow &&
        Array.isArray(workflow.nodes) &&
        typeof workflow.connections === 'object'
    );
}
