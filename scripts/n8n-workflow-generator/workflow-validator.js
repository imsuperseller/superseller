#!/usr/bin/env node

/**
 * Workflow Validator
 * Validates n8n workflow structure and node configurations
 */

class WorkflowValidator {
  constructor() {
    this.requiredNodeFields = ['id', 'type', 'name', 'position'];
    this.requiredWorkflowFields = ['name', 'nodes'];
  }

  /**
   * Validate complete workflow
   * @param {Object} workflow - n8n workflow JSON
   * @returns {Object} Validation result with errors and warnings
   */
  validate(workflow) {
    const errors = [];
    const warnings = [];

    // Validate workflow structure
    const structureValidation = this.validateStructure(workflow);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // Validate nodes
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      workflow.nodes.forEach((node, index) => {
        const nodeValidation = this.validateNode(node, index);
        errors.push(...nodeValidation.errors);
        warnings.push(...nodeValidation.warnings);
      });
    }

    // Validate connections
    if (workflow.connections) {
      const connectionValidation = this.validateConnections(workflow);
      errors.push(...connectionValidation.errors);
      warnings.push(...connectionValidation.warnings);
    }

    // Validate credentials
    const credentialValidation = this.validateCredentials(workflow);
    warnings.push(...credentialValidation.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate workflow structure
   */
  validateStructure(workflow) {
    const errors = [];
    const warnings = [];

    // Check required fields
    this.requiredWorkflowFields.forEach(field => {
      if (!workflow[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check nodes array
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array');
    } else if (workflow.nodes.length === 0) {
      warnings.push('Workflow has no nodes');
    }

    // Check for duplicate node IDs
    if (workflow.nodes) {
      const nodeIds = workflow.nodes.map(n => n.id).filter(Boolean);
      const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate node IDs found: ${duplicates.join(', ')}`);
      }
    }

    // Check for duplicate node names
    if (workflow.nodes) {
      const nodeNames = workflow.nodes.map(n => n.name).filter(Boolean);
      const duplicates = nodeNames.filter((name, index) => nodeNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        warnings.push(`Duplicate node names found: ${duplicates.join(', ')}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate individual node
   */
  validateNode(node, index) {
    const errors = [];
    const warnings = [];

    // Check required fields
    this.requiredNodeFields.forEach(field => {
      if (!node[field]) {
        errors.push(`Node ${index} (${node.name || 'unnamed'}) missing required field: ${field}`);
      }
    });

    // Validate position
    if (node.position) {
      if (!Array.isArray(node.position) || node.position.length !== 2) {
        errors.push(`Node ${index} (${node.name || 'unnamed'}) has invalid position`);
      } else {
        const [x, y] = node.position;
        if (typeof x !== 'number' || typeof y !== 'number') {
          errors.push(`Node ${index} (${node.name || 'unnamed'}) position must be numbers`);
        }
      }
    }

    // Validate node type
    if (node.type) {
      const validTypes = [
        'n8n-nodes-base.code',
        'n8n-nodes-base.webhook',
        'n8n-nodes-base.httpRequest',
        '@n8n/n8n-nodes-langchain.agent',
        '@n8n/n8n-nodes-langchain.toolCode',
        '@devlikeapro/n8n-nodes-waha.WAHA',
        '@elevenlabs/n8n-nodes-elevenlabs.elevenLabs',
        'n8n-nodes-base.set',
        'n8n-nodes-base.switch',
        'n8n-nodes-base.if'
      ];
      
      if (!validTypes.some(t => node.type.startsWith(t.split('.')[0]))) {
        warnings.push(`Node ${index} (${node.name || 'unnamed'}) has unknown type: ${node.type}`);
      }
    }

    // Validate parameters exist for nodes that need them
    if (node.type === 'n8n-nodes-base.code' && !node.parameters?.jsCode) {
      warnings.push(`Node ${index} (${node.name || 'unnamed'}) is a Code node but has no jsCode`);
    }

    // Validate credentials format
    if (node.credentials) {
      Object.keys(node.credentials).forEach(credType => {
        const cred = node.credentials[credType];
        if (!cred.id && !cred.name) {
          warnings.push(`Node ${index} (${node.name || 'unnamed'}) has credential ${credType} without id or name`);
        }
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate connections
   */
  validateConnections(workflow) {
    const errors = [];
    const warnings = [];

    if (!workflow.nodes) {
      return { errors, warnings };
    }

    const nodeNames = new Set(workflow.nodes.map(n => n.name).filter(Boolean));

    Object.keys(workflow.connections).forEach(sourceNodeName => {
      if (!nodeNames.has(sourceNodeName)) {
        errors.push(`Connection references unknown source node: ${sourceNodeName}`);
      }

      const connections = workflow.connections[sourceNodeName];
      Object.keys(connections).forEach(outputType => {
        connections[outputType].forEach(connectionArray => {
          connectionArray.forEach(connection => {
            if (!nodeNames.has(connection.node)) {
              errors.push(`Connection from ${sourceNodeName} references unknown target node: ${connection.node}`);
            }
          });
        });
      });
    });

    return { errors, warnings };
  }

  /**
   * Validate credentials
   */
  validateCredentials(workflow) {
    const warnings = [];

    if (!workflow.nodes) {
      return { warnings };
    }

    const nodesWithCredentials = workflow.nodes.filter(n => n.credentials);
    
    nodesWithCredentials.forEach(node => {
      Object.keys(node.credentials).forEach(credType => {
        const cred = node.credentials[credType];
        if (!cred.id && !cred.name) {
          warnings.push(`Node ${node.name} has credential ${credType} without id or name - may need manual setup`);
        }
      });
    });

    return { warnings };
  }

  /**
   * Quick validation (returns boolean)
   */
  isValid(workflow) {
    const result = this.validate(workflow);
    return result.valid;
  }
}

module.exports = WorkflowValidator;

// CLI usage
if (require.main === module) {
  const validator = new WorkflowValidator();
  
  const sampleWorkflow = {
    name: 'Test Workflow',
    nodes: [
      {
        id: 'node1',
        type: 'n8n-nodes-base.code',
        name: 'Test Node',
        position: [100, 100],
        parameters: {
          jsCode: 'return $input.all();'
        }
      }
    ],
    connections: {}
  };

  const result = validator.validate(sampleWorkflow);
  console.log('Validation result:', JSON.stringify(result, null, 2));
}
