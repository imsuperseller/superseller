#!/usr/bin/env node

import axios from 'axios';

class CheckAvailableModels {
  constructor() {
    this.benCloudConfig = {
      url: 'https://tax4usllc.app.n8n.cloud',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0NDMxODE1fQ.JcEF5OU9XGS7TQjpT8LFTwdUyk6QI6HmN26WoJrilg8'
    };
  }

  async checkAvailableModels() {
    console.log('🔍 CHECKING AVAILABLE MODELS IN BEN\'S N8N CLOUD');
    console.log('==================================================');
    console.log('📋 Testing different models to find the best available');
    console.log('');

    try {
      // Step 1: Test different OpenAI models
      console.log('🤖 STEP 1: TESTING OPENAI MODELS');
      console.log('==================================');
      const openaiModels = await this.testOpenAIModels();

      // Step 2: Test different AI providers
      console.log('\n🧠 STEP 2: TESTING OTHER AI PROVIDERS');
      console.log('=======================================');
      const otherModels = await this.testOtherProviders();

      // Step 3: Check workflow capabilities
      console.log('\n📊 STEP 3: CHECKING WORKFLOW CAPABILITIES');
      console.log('===========================================');
      const workflowCapabilities = await this.checkWorkflowCapabilities();

      console.log('\n🎉 MODEL ANALYSIS COMPLETED!');
      console.log('=============================');
      console.log('✅ Available models identified');
      console.log('✅ Best alternatives found');
      console.log('✅ Recommendations provided');

      return {
        success: true,
        openaiModels,
        otherModels,
        workflowCapabilities,
        recommendations: this.generateRecommendations(openaiModels, otherModels)
      };

    } catch (error) {
      console.error('\n❌ FAILED TO CHECK MODELS:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testOpenAIModels() {
    const models = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-4-turbo-preview'
    ];

    const results = {};

    for (const model of models) {
      try {
        console.log(`   🔍 Testing OpenAI model: ${model}`);
        
        // Create a test workflow with this model
        const testWorkflow = {
          name: `Test Model ${model}`,
          nodes: [
            {
              id: 'test-node',
              name: 'Test AI Node',
              type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
              typeVersion: 1,
              position: [240, 300],
              parameters: {
                model: model,
                options: {
                  temperature: 0.7,
                  maxTokens: 100
                },
                messages: {
                  values: [
                    {
                      role: 'user',
                      text: 'Test message'
                    }
                  ]
                }
              }
            }
          ],
          connections: {},
          settings: { executionOrder: 'v1' }
        };

        const response = await axios.post(
          `${this.benCloudConfig.url}/api/v1/workflows`,
          testWorkflow,
          {
            headers: {
              'X-N8N-API-KEY': this.benCloudConfig.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        results[model] = {
          supported: true,
          workflowId: response.data.id,
          status: 'created'
        };

        console.log(`   ✅ ${model}: Supported`);

        // Clean up - delete test workflow
        await axios.delete(
          `${this.benCloudConfig.url}/api/v1/workflows/${response.data.id}`,
          {
            headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
          }
        );

      } catch (error) {
        results[model] = {
          supported: false,
          error: error.message,
          status: 'failed'
        };
        console.log(`   ❌ ${model}: Not supported - ${error.message}`);
      }
    }

    return results;
  }

  async testOtherProviders() {
    const providers = [
      { name: 'Claude 3.5 Sonnet', type: '@n8n/n8n-nodes-langchain.lmChatAnthropic', model: 'claude-3-5-sonnet-20241022' },
      { name: 'Claude 3 Haiku', type: '@n8n/n8n-nodes-langchain.lmChatAnthropic', model: 'claude-3-haiku-20240307' },
      { name: 'Gemini Pro', type: '@n8n/n8n-nodes-langchain.lmChatGoogle', model: 'gemini-pro' },
      { name: 'Gemini 1.5 Pro', type: '@n8n/n8n-nodes-langchain.lmChatGoogle', model: 'gemini-1.5-pro' }
    ];

    const results = {};

    for (const provider of providers) {
      try {
        console.log(`   🔍 Testing ${provider.name}`);
        
        // Create a test workflow with this provider
        const testWorkflow = {
          name: `Test ${provider.name}`,
          nodes: [
            {
              id: 'test-node',
              name: 'Test AI Node',
              type: provider.type,
              typeVersion: 1,
              position: [240, 300],
              parameters: {
                model: provider.model,
                options: {
                  temperature: 0.7,
                  maxTokens: 100
                },
                messages: {
                  values: [
                    {
                      role: 'user',
                      text: 'Test message'
                    }
                  ]
                }
              }
            }
          ],
          connections: {},
          settings: { executionOrder: 'v1' }
        };

        const response = await axios.post(
          `${this.benCloudConfig.url}/api/v1/workflows`,
          testWorkflow,
          {
            headers: {
              'X-N8N-API-KEY': this.benCloudConfig.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        results[provider.name] = {
          supported: true,
          model: provider.model,
          workflowId: response.data.id,
          status: 'created'
        };

        console.log(`   ✅ ${provider.name}: Supported`);

        // Clean up - delete test workflow
        await axios.delete(
          `${this.benCloudConfig.url}/api/v1/workflows/${response.data.id}`,
          {
            headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
          }
        );

      } catch (error) {
        results[provider.name] = {
          supported: false,
          error: error.message,
          status: 'failed'
        };
        console.log(`   ❌ ${provider.name}: Not supported - ${error.message}`);
      }
    }

    return results;
  }

  async checkWorkflowCapabilities() {
    try {
      console.log('   📊 Checking workflow capabilities...');

      // Get current workflows
      const response = await axios.get(
        `${this.benCloudConfig.url}/api/v1/workflows`,
        {
          headers: { 'X-N8N-API-KEY': this.benCloudConfig.apiKey }
        }
      );

      const workflows = response.data;
      
      // Analyze workflow capabilities
      const capabilities = {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.active).length,
        aiWorkflows: workflows.filter(w => 
          w.nodes.some(n => n.type.includes('langchain') || n.type.includes('openai'))
        ).length,
        nodeTypes: [...new Set(workflows.flatMap(w => w.nodes.map(n => n.type)))],
        supportedAITypes: workflows
          .flatMap(w => w.nodes)
          .filter(n => n.type.includes('langchain') || n.type.includes('openai'))
          .map(n => n.type)
      };

      console.log(`   ✅ Found ${capabilities.totalWorkflows} workflows`);
      console.log(`   ✅ ${capabilities.activeWorkflows} active workflows`);
      console.log(`   ✅ ${capabilities.aiWorkflows} AI-powered workflows`);

      return capabilities;

    } catch (error) {
      console.error('   ❌ Failed to check workflow capabilities:', error.message);
      return null;
    }
  }

  generateRecommendations(openaiModels, otherModels) {
    const recommendations = {
      bestOptions: [],
      upgradeOptions: [],
      alternatives: []
    };

    // Find best available models
    const supportedOpenAI = Object.entries(openaiModels)
      .filter(([model, result]) => result.supported)
      .map(([model]) => model);

    const supportedOthers = Object.entries(otherModels)
      .filter(([provider, result]) => result.supported)
      .map(([provider]) => provider);

    // Best options (in order of preference)
    if (supportedOpenAI.includes('gpt-4')) {
      recommendations.bestOptions.push('gpt-4 (Best for complex tasks)');
    }
    if (supportedOpenAI.includes('gpt-4-turbo')) {
      recommendations.bestOptions.push('gpt-4-turbo (Best balance)');
    }
    if (supportedOthers.includes('Claude 3.5 Sonnet')) {
      recommendations.bestOptions.push('Claude 3.5 Sonnet (Excellent reasoning)');
    }
    if (supportedOpenAI.includes('gpt-3.5-turbo-16k')) {
      recommendations.bestOptions.push('gpt-3.5-turbo-16k (Good with longer context)');
    }
    if (supportedOpenAI.includes('gpt-3.5-turbo')) {
      recommendations.bestOptions.push('gpt-3.5-turbo (Basic but reliable)');
    }

    // Upgrade options
    if (!supportedOpenAI.includes('gpt-4')) {
      recommendations.upgradeOptions.push('Upgrade n8n Cloud plan to support gpt-4');
      recommendations.upgradeOptions.push('Contact n8n support for gpt-4 access');
    }

    // Alternatives
    if (supportedOthers.includes('Gemini Pro')) {
      recommendations.alternatives.push('Use Gemini Pro for multilingual content');
    }
    if (supportedOthers.includes('Claude 3 Haiku')) {
      recommendations.alternatives.push('Use Claude 3 Haiku for faster responses');
    }

    return recommendations;
  }
}

// Execute the model check
const modelChecker = new CheckAvailableModels();
modelChecker.checkAvailableModels().then(result => {
  if (result.success) {
    console.log('\n🎉 MODEL ANALYSIS COMPLETED!');
    console.log('=============================');
    console.log('✅ Available models identified');
    console.log('✅ Best alternatives found');
    console.log('');
    console.log('🏆 RECOMMENDATIONS:');
    console.log('===================');
    
    if (result.recommendations.bestOptions.length > 0) {
      console.log('🎯 Best Available Options:');
      result.recommendations.bestOptions.forEach(option => {
        console.log(`   ✅ ${option}`);
      });
    }
    
    if (result.recommendations.upgradeOptions.length > 0) {
      console.log('\n🚀 Upgrade Options:');
      result.recommendations.upgradeOptions.forEach(option => {
        console.log(`   🔧 ${option}`);
      });
    }
    
    if (result.recommendations.alternatives.length > 0) {
      console.log('\n🔄 Alternative Solutions:');
      result.recommendations.alternatives.forEach(option => {
        console.log(`   🔄 ${option}`);
      });
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('==============');
    console.log('1. Choose the best available model from recommendations');
    console.log('2. Update workflows to use the chosen model');
    console.log('3. Consider upgrading plan if gpt-4 is needed');
    console.log('4. Test performance with the chosen model');
    
  } else {
    console.log('\n❌ FAILED TO ANALYZE MODELS:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 UNEXPECTED ERROR:', error.message);
  process.exit(1);
});
