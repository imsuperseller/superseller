#!/usr/bin/env node

/**
 * Workflow Assembler
 * Assembles complete n8n workflow JSON from template and customizations
 */

const NodeCustomizer = require('./node-customizer');

class WorkflowAssembler {
  constructor() {
    this.customizer = new NodeCustomizer();
  }

  /**
   * Assemble a complete workflow from template and customer config
   * @param {Object} template - Template object from WorkflowTemplateLoader
   * @param {Object} customerConfig - Customer configuration
   * @returns {Object} Complete n8n workflow JSON
   */
  assembleWorkflow(template, customerConfig) {
    const workflow = JSON.parse(JSON.stringify(template.workflow)); // Deep clone

    // Update workflow metadata
    workflow.name = customerConfig.workflowName || `${customerConfig.customerName} WhatsApp Agent`;
    workflow.description = customerConfig.workflowDescription || `WhatsApp agent workflow for ${customerConfig.customerName}`;

    // Customize all nodes
    if (workflow.nodes) {
      workflow.nodes = workflow.nodes.map(node => {
        return this.customizer.customizeNode(node, customerConfig);
      });
    }

    // Update node positions if needed (to avoid overlaps)
    if (customerConfig.nodePositions) {
      workflow.nodes.forEach((node, index) => {
        if (customerConfig.nodePositions[node.id]) {
          node.position = customerConfig.nodePositions[node.id];
        }
      });
    }

    // Update credentials references
    if (customerConfig.credentials) {
      workflow.nodes.forEach(node => {
        if (node.credentials) {
          Object.keys(node.credentials).forEach(credType => {
            if (customerConfig.credentials[credType]) {
              node.credentials[credType].id = customerConfig.credentials[credType];
            }
          });
        }
      });
    }

    // Generate unique IDs for new workflow
    const idMap = this.generateNewIds(workflow);
    this.replaceIds(workflow, idMap);

    return workflow;
  }

  /**
   * Generate new unique IDs for all nodes and connections
   */
  generateNewIds(workflow) {
    const idMap = new Map();
    
    // Generate new IDs for nodes
    workflow.nodes.forEach(node => {
      const newId = this.generateId();
      idMap.set(node.id, newId);
    });

    return idMap;
  }

  /**
   * Replace all IDs in workflow with new ones
   */
  replaceIds(workflow, idMap) {
    // Replace node IDs
    workflow.nodes.forEach(node => {
      if (idMap.has(node.id)) {
        node.id = idMap.get(node.id);
      }
    });

    // Replace connection IDs
    if (workflow.connections) {
      Object.keys(workflow.connections).forEach(nodeName => {
        const connections = workflow.connections[nodeName];
        Object.keys(connections).forEach(outputType => {
          connections[outputType].forEach(connectionArray => {
            connectionArray.forEach(connection => {
              // Find node by name and update reference
              const targetNode = workflow.nodes.find(n => n.name === connection.node);
              if (targetNode && idMap.has(targetNode.id)) {
                // Connection references are by node name, not ID, so we keep them
                // But we need to ensure node names are unique
              }
            });
          });
        });
      });
    }
  }

  /**
   * Generate a unique ID (similar to n8n's format)
   */
  generateId() {
    return `${this.randomHex(8)}-${this.randomHex(4)}-${this.randomHex(4)}-${this.randomHex(4)}-${this.randomHex(12)}`;
  }

  /**
   * Generate random hex string
   */
  randomHex(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Validate assembled workflow structure
   */
  validateWorkflow(workflow) {
    const errors = [];

    // Check required fields
    if (!workflow.name) errors.push('Missing workflow name');
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Missing or invalid nodes array');
    }

    // Check nodes have required fields
    workflow.nodes?.forEach((node, index) => {
      if (!node.id) errors.push(`Node ${index} missing ID`);
      if (!node.type) errors.push(`Node ${index} missing type`);
      if (!node.name) errors.push(`Node ${index} missing name`);
      if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
        errors.push(`Node ${index} missing or invalid position`);
      }
    });

    // Check connections reference valid nodes
    if (workflow.connections) {
      const nodeNames = new Set(workflow.nodes.map(n => n.name));
      Object.keys(workflow.connections).forEach(sourceNodeName => {
        if (!nodeNames.has(sourceNodeName)) {
          errors.push(`Connection references unknown source node: ${sourceNodeName}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = WorkflowAssembler;

// CLI usage
if (require.main === module) {
  const assembler = new WorkflowAssembler();
  
  // Example
  const sampleTemplate = {
    workflow: {
      name: 'Base Template',
      nodes: [
        {
          id: 'node1',
          type: 'n8n-nodes-base.code',
          name: 'Test Node',
          position: [100, 100],
          parameters: {}
        }
      ],
      connections: {}
    }
  };

  const sampleConfig = {
    customerName: 'Test Customer',
    workflowName: 'Test Customer WhatsApp Agent',
    agentName: 'Test Agent',
    agentPersonality: 'friendly'
  };

  const assembled = assembler.assembleWorkflow(sampleTemplate, sampleConfig);
  const validation = assembler.validateWorkflow(assembled);
  
  console.log('Assembled workflow:', JSON.stringify(assembled, null, 2));
  console.log('Validation:', validation);
}
