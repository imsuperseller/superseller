#!/usr/bin/env node

/**
 * Node Customizer
 * Customizes n8n workflow nodes based on customer configuration
 */

class NodeCustomizer {
  constructor() {
    this.customizers = {
      'n8n-nodes-base.code': this.customizeCodeNode.bind(this),
      '@n8n/n8n-nodes-langchain.agent': this.customizeLangchainAgentNode.bind(this),
      '@n8n/n8n-nodes-langchain.toolCode': this.customizeToolCodeNode.bind(this),
      '@n8n/nodes-base.set': this.customizeSetNode.bind(this),
      '@devlikeapro/n8n-nodes-waha.WAHA': this.customizeWAHANode.bind(this)
    };
  }

  /**
   * Customize a node based on its type and customer config
   * @param {Object} node - n8n node object
   * @param {Object} customerConfig - Customer configuration
   * @returns {Object} Customized node
   */
  customizeNode(node, customerConfig) {
    const nodeType = node.type;
    const customizer = this.customizers[nodeType] || this.customizeGenericNode.bind(this);
    
    return customizer(node, customerConfig);
  }

  /**
   * Customize Code nodes (Smart Message Router, Process Media Context, etc.)
   */
  customizeCodeNode(node, config) {
    const customized = JSON.parse(JSON.stringify(node)); // Deep clone
    
    // Customize Smart Message Router
    if (node.name === 'Smart Message Router' || node.name?.includes('Message Router')) {
      if (config.storeName) {
        // Replace store_name in the code
        customized.parameters.jsCode = customized.parameters.jsCode.replace(
          /store_name:\s*['"]([^'"]+)['"]/g,
          `store_name: '${config.storeName}'`
        );
        customized.parameters.jsCode = customized.parameters.jsCode.replace(
          /fileSearchStores\/[^'"]+/g,
          config.storeName
        );
      }
    }

    // Customize Context Enricher
    if (node.name === 'Context Enricher') {
      if (config.niche) {
        // Update niche detection logic
        customized.parameters.jsCode = customized.parameters.jsCode.replace(
          /detectedNiche:\s*['"]general['"]/g,
          `detectedNiche: '${config.niche}'`
        );
      }
    }

    // Customize Prepare Shai Notification
    if (node.name === 'Prepare Shai Notification' || node.name?.includes('Notification')) {
      if (config.notificationPhone) {
        customized.parameters.jsCode = customized.parameters.jsCode.replace(
          /SHAI_PHONE\s*=\s*['"][^'"]+['"]/g,
          `SHAI_PHONE = '${config.notificationPhone}'`
        );
      }
    }

    return customized;
  }

  /**
   * Customize Langchain Agent nodes (Shai AI Sales Agent, etc.)
   */
  customizeLangchainAgentNode(node, config) {
    const customized = JSON.parse(JSON.stringify(node));
    
    // Customize system message
    if (config.agentSystemMessage) {
      customized.parameters.options.systemMessage = config.agentSystemMessage;
    } else if (config.agentName && config.agentPersonality) {
      // Generate system message from name and personality
      customized.parameters.options.systemMessage = this.generateSystemMessage(
        config.agentName,
        config.agentPersonality,
        config.agentPurpose || 'Help customers with their questions',
        config.language || 'English'
      );
    }

    // Customize prompt text if provided
    if (config.agentPrompt) {
      customized.parameters.text = config.agentPrompt;
    }

    return customized;
  }

  /**
   * Customize Tool Code nodes (Search Knowledge Base, etc.)
   */
  customizeToolCodeNode(node, config) {
    const customized = JSON.parse(JSON.stringify(node));
    
    if (node.name === 'Search Knowledge Base' || node.name?.includes('Knowledge Base')) {
      // Update store name
      if (config.storeName) {
        customized.parameters.jsCode = customized.parameters.jsCode.replace(
          /fileSearchStores\/[^'"]+/g,
          config.storeName
        );
        customized.parameters.jsCode = customized.parameters.jsCode.replace(
          /defaultStore\s*=\s*['"]([^'"]+)['"]/g,
          `defaultStore = '${config.storeName}'`
        );
      }

      // Update description
      if (config.knowledgeBaseDescription) {
        customized.parameters.description = config.knowledgeBaseDescription;
      }
    }

    return customized;
  }

  /**
   * Customize Set nodes
   */
  customizeSetNode(node, config) {
    const customized = JSON.parse(JSON.stringify(node));
    
    // Update store_name assignments
    if (node.name?.includes('Store Name')) {
      if (config.storeName) {
        customized.parameters.assignments.assignments.forEach(assignment => {
          if (assignment.name === 'store_name') {
            assignment.value = `'${config.storeName}'`;
          }
        });
      }
    }

    return customized;
  }

  /**
   * Customize WAHA nodes
   */
  customizeWAHANode(node, config) {
    const customized = JSON.parse(JSON.stringify(node));
    
    // Update session name if provided
    if (config.wahaSession && customized.parameters.session) {
      customized.parameters.session = config.wahaSession;
    }

    // Update credentials if provided
    if (config.wahaCredentialsId && customized.credentials?.wahaApi) {
      customized.credentials.wahaApi.id = config.wahaCredentialsId;
    }

    return customized;
  }

  /**
   * Customize generic nodes (fallback)
   */
  customizeGenericNode(node, config) {
    // Return as-is for now
    return JSON.parse(JSON.stringify(node));
  }

  /**
   * Generate system message for AI agent
   */
  generateSystemMessage(agentName, personality, purpose, language = 'English') {
    const personalityMap = {
      'professional': 'Professional, formal, and courteous',
      'friendly': 'Warm, approachable, and conversational',
      'casual': 'Relaxed, informal, and easy-going',
      'technical': 'Precise, detailed, and knowledgeable'
    };

    const personalityDesc = personalityMap[personality] || personality;

    return `You are ${agentName}, an AI assistant for ${purpose}.

## YOUR PERSONALITY
- ${personalityDesc}
- You speak like a helpful assistant
- You use simple language - no tech jargon unless the user uses it first
- You're enthusiastic but not pushy
- Always respond in ${language}

## YOUR GOALS
1. Understand the user's needs
2. Provide helpful and accurate information
3. Guide them toward solutions
4. Be patient and clear in all responses

## CRITICAL RULES
1. Never make up information
2. If you don't know something, say so
3. Always respond in ${language}
4. Be genuine and helpful
5. Match the user's communication style`;
  }
}

module.exports = NodeCustomizer;

// CLI usage
if (require.main === module) {
  const customizer = new NodeCustomizer();
  
  // Example usage
  const sampleNode = {
    type: '@n8n/n8n-nodes-langchain.agent',
    name: 'Shai AI Sales Agent',
    parameters: {
      options: {
        systemMessage: 'Default message'
      }
    }
  };

  const sampleConfig = {
    agentName: 'Tax4US Support Agent',
    agentPersonality: 'professional',
    agentPurpose: 'Help Tax4US customers with tax-related questions',
    language: 'English'
  };

  const customized = customizer.customizeNode(sampleNode, sampleConfig);
  console.log('Customized node:', JSON.stringify(customized, null, 2));
}
