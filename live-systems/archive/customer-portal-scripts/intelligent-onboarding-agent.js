#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * INTELLIGENT ONBOARDING AGENT
 * 
 * This agent automates the customer onboarding process using AI analysis
 * to ensure complete information gathering and optimal setup.
 */

class IntelligentOnboardingAgent {
  constructor() {
    this.config = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1'
      },
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      },
      n8n: {
        url: 'http://172.245.56.50:5678',
        apiKey: process.env.N8N_API_KEY
      }
    };
    
    this.onboardingSteps = {
      initialAssessment: 'customer_analysis',
      informationGathering: 'data_collection',
      credentialValidation: 'api_testing',
      processConfiguration: 'workflow_setup',
      testingAndValidation: 'end_to_end_testing',
      completion: 'onboarding_complete'
    };
    
    this.requiredFields = {
      basic: ['name', 'email', 'company', 'website', 'industry'],
      business: ['businessSize', 'primaryUseCase', 'budget', 'timeline'],
      technical: ['currentAutomationLevel', 'integrations', 'preferences'],
      payment: ['paymentMethod', 'billingCycle', 'contactInfo']
    };
    
    this.currentCustomer = null;
    this.missingInfo = [];
    this.validationResults = {};
  }

  // ===== AI-POWERED ANALYSIS =====

  async analyzeCustomerData(customerData) {
    console.log('🔍 AI-POWERED CUSTOMER ANALYSIS');
    console.log('================================');
    
    try {
      const analysis = await this.callAI('analyze_customer', {
        customerData,
        requirements: this.requiredFields,
        businessContext: 'automation_services'
      });

      return {
        completeness: analysis.completeness,
        missingFields: analysis.missingFields,
        recommendations: analysis.recommendations,
        riskAssessment: analysis.riskAssessment,
        nextSteps: analysis.nextSteps
      };
    } catch (error) {
      console.error('❌ AI analysis failed:', error.message);
      return this.fallbackAnalysis(customerData);
    }
  }

  async detectMissingInformation(customerProfile) {
    console.log('🔍 DETECTING MISSING INFORMATION');
    console.log('=================================');
    
    const missingInfo = [];
    
    // Check basic information
    for (const field of this.requiredFields.basic) {
      if (!customerProfile.customer[field] || customerProfile.customer[field].trim() === '') {
        missingInfo.push({
          category: 'basic',
          field,
          priority: 'high',
          description: `Missing ${field} information`,
          question: this.generateQuestion(field)
        });
      }
    }
    
    // Check business information
    for (const field of this.requiredFields.business) {
      if (!customerProfile.customer[field] || customerProfile.customer[field].trim() === '') {
        missingInfo.push({
          category: 'business',
          field,
          priority: 'medium',
          description: `Missing ${field} information`,
          question: this.generateQuestion(field)
        });
      }
    }
    
    // Check technical requirements
    if (!customerProfile.agents || customerProfile.agents.length === 0) {
      missingInfo.push({
        category: 'technical',
        field: 'agents',
        priority: 'high',
        description: 'No agents specified',
        question: 'What automation agents do you need?'
      });
    }
    
    return missingInfo;
  }

  // ===== ONBOARDING PROCESS =====

  async startOnboarding(customerData) {
    console.log('🚀 STARTING INTELLIGENT ONBOARDING');
    console.log('==================================');
    
    this.currentCustomer = customerData;
    
    try {
      // Step 1: Initial Assessment
      const assessment = await this.performInitialAssessment(customerData);
      
      // Step 2: Information Gathering
      const gatheredInfo = await this.gatherMissingInformation(assessment);
      
      // Step 3: Credential Validation
      const validation = await this.validateCredentials(gatheredInfo);
      
      // Step 4: Process Configuration
      const configuration = await this.configureProcesses(validation);
      
      // Step 5: Testing and Validation
      const testing = await this.performTesting(configuration);
      
      // Step 6: Completion
      const completion = await this.completeOnboarding(testing);
      
      return completion;
      
    } catch (error) {
      console.error('❌ Onboarding failed:', error.message);
      return this.handleOnboardingFailure(error);
    }
  }

  async performInitialAssessment(customerData) {
    console.log('📊 PERFORMING INITIAL ASSESSMENT');
    console.log('================================');
    
    const analysis = await this.analyzeCustomerData(customerData);
    const missingInfo = await this.detectMissingInformation(customerData);
    
    return {
      customerData,
      analysis,
      missingInfo,
      completeness: analysis.completeness,
      riskLevel: analysis.riskAssessment.level,
      nextSteps: analysis.nextSteps
    };
  }

  async gatherMissingInformation(assessment) {
    console.log('📝 GATHERING MISSING INFORMATION');
    console.log('================================');
    
    if (assessment.missingInfo.length === 0) {
      console.log('✅ All required information is complete');
      return assessment.customerData;
    }
    
    console.log(`📋 Found ${assessment.missingInfo.length} missing fields`);
    
    // Generate questions for missing information
    const questions = assessment.missingInfo.map(item => ({
      field: item.field,
      question: item.question,
      priority: item.priority,
      category: item.category
    }));
    
    return {
      ...assessment.customerData,
      questions,
      missingFields: assessment.missingInfo
    };
  }

  async validateCredentials(customerData) {
    console.log('🔐 VALIDATING CREDENTIALS');
    console.log('=========================');
    
    const validationResults = {};
    
    // Validate API keys if provided
    if (customerData.apiKeys) {
      for (const [service, key] of Object.entries(customerData.apiKeys)) {
        try {
          const isValid = await this.testAPIKey(service, key);
          validationResults[service] = { valid: isValid, tested: true };
        } catch (error) {
          validationResults[service] = { valid: false, error: error.message };
        }
      }
    }
    
    // Validate website connectivity
    if (customerData.website) {
      try {
        const response = await axios.get(customerData.website, { timeout: 5000 });
        validationResults.website = { valid: true, status: response.status };
      } catch (error) {
        validationResults.website = { valid: false, error: error.message };
      }
    }
    
    return {
      ...customerData,
      validationResults
    };
  }

  async configureProcesses(customerData) {
    console.log('⚙️ CONFIGURING PROCESSES');
    console.log('========================');
    
    // Configure n8n workflows based on customer requirements
    const workflows = await this.setupWorkflows(customerData);
    
    // Configure AI agents
    const agents = await this.setupAgents(customerData);
    
    // Configure monitoring and alerts
    const monitoring = await this.setupMonitoring(customerData);
    
    return {
      ...customerData,
      workflows,
      agents,
      monitoring,
      configurationComplete: true
    };
  }

  async performTesting(configuration) {
    console.log('🧪 PERFORMING TESTING');
    console.log('=====================');
    
    const testResults = {};
    
    // Test workflows
    if (configuration.workflows) {
      for (const workflow of configuration.workflows) {
        try {
          const result = await this.testWorkflow(workflow);
          testResults[workflow.name] = { success: true, result };
        } catch (error) {
          testResults[workflow.name] = { success: false, error: error.message };
        }
      }
    }
    
    // Test agents
    if (configuration.agents) {
      for (const agent of configuration.agents) {
        try {
          const result = await this.testAgent(agent);
          testResults[agent.name] = { success: true, result };
        } catch (error) {
          testResults[agent.name] = { success: false, error: error.message };
        }
      }
    }
    
    return {
      ...configuration,
      testResults,
      allTestsPassed: Object.values(testResults).every(r => r.success)
    };
  }

  async completeOnboarding(testing) {
    console.log('✅ COMPLETING ONBOARDING');
    console.log('========================');
    
    const completion = {
      customer: testing.customerData,
      status: 'completed',
      timestamp: new Date().toISOString(),
      configuration: {
        workflows: testing.workflows,
        agents: testing.agents,
        monitoring: testing.monitoring
      },
      testResults: testing.testResults,
      nextSteps: [
        'Monitor system performance',
        'Schedule follow-up review',
        'Provide customer training',
        'Set up ongoing support'
      ]
    };
    
    // Save completion data
    await this.saveOnboardingCompletion(completion);
    
    return completion;
  }

  // ===== UTILITY METHODS =====

  async callAI(method, params) {
    if (!this.config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    try {
      const response = await axios.post(`${this.config.openai.baseURL}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an intelligent onboarding assistant for automation services.'
          },
          {
            role: 'user',
            content: JSON.stringify({ method, params })
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('❌ AI call failed:', error.message);
      throw error;
    }
  }

  fallbackAnalysis(customerData) {
    console.log('🔄 Using fallback analysis');
    
    const completeness = this.calculateCompleteness(customerData);
    const missingFields = this.identifyMissingFields(customerData);
    
    return {
      completeness,
      missingFields,
      recommendations: this.generateRecommendations(missingFields),
      riskAssessment: { level: completeness < 0.7 ? 'high' : 'medium' },
      nextSteps: this.generateNextSteps(missingFields)
    };
  }

  calculateCompleteness(customerData) {
    const totalFields = Object.values(this.requiredFields).flat().length;
    const filledFields = Object.values(this.requiredFields).flat().filter(field => 
      customerData.customer && customerData.customer[field] && customerData.customer[field].trim() !== ''
    ).length;
    
    return filledFields / totalFields;
  }

  identifyMissingFields(customerData) {
    const missing = [];
    
    for (const [category, fields] of Object.entries(this.requiredFields)) {
      for (const field of fields) {
        if (!customerData.customer || !customerData.customer[field] || customerData.customer[field].trim() === '') {
          missing.push({ category, field });
        }
      }
    }
    
    return missing;
  }

  generateRecommendations(missingFields) {
    return missingFields.map(field => ({
      field: field.field,
      recommendation: `Please provide ${field.field} information`,
      priority: field.category === 'basic' ? 'high' : 'medium'
    }));
  }

  generateNextSteps(missingFields) {
    if (missingFields.length === 0) {
      return ['Proceed with configuration', 'Set up workflows', 'Configure agents'];
    }
    
    return [
      'Complete missing information',
      'Validate provided data',
      'Configure automation processes'
    ];
  }

  generateQuestion(field) {
    const questions = {
      name: 'What is your full name?',
      email: 'What is your email address?',
      company: 'What is your company name?',
      website: 'What is your website URL?',
      industry: 'What industry are you in?',
      businessSize: 'How many employees does your company have?',
      primaryUseCase: 'What is your primary use case for automation?',
      budget: 'What is your budget for automation services?',
      timeline: 'What is your timeline for implementation?',
      currentAutomationLevel: 'What is your current level of automation?',
      integrations: 'What systems do you need to integrate with?',
      preferences: 'What are your preferences for automation?',
      paymentMethod: 'What is your preferred payment method?',
      billingCycle: 'What billing cycle do you prefer?',
      contactInfo: 'What is your contact information?'
    };
    
    return questions[field] || `Please provide ${field} information`;
  }

  async testAPIKey(service, key) {
    // Implement API key testing logic
    return true; // Placeholder
  }

  async setupWorkflows(customerData) {
    // Implement workflow setup logic
    return []; // Placeholder
  }

  async setupAgents(customerData) {
    // Implement agent setup logic
    return []; // Placeholder
  }

  async setupMonitoring(customerData) {
    // Implement monitoring setup logic
    return {}; // Placeholder
  }

  async testWorkflow(workflow) {
    // Implement workflow testing logic
    return { status: 'success' }; // Placeholder
  }

  async testAgent(agent) {
    // Implement agent testing logic
    return { status: 'success' }; // Placeholder
  }

  async saveOnboardingCompletion(completion) {
    const filepath = path.join(process.cwd(), 'data', 'onboarding-completions', `${completion.customer.id || 'unknown'}-${Date.now()}.json`);
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(completion, null, 2));
  }

  handleOnboardingFailure(error) {
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      nextSteps: [
        'Review error details',
        'Contact support if needed',
        'Retry onboarding process'
      ]
    };
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  const agent = new IntelligentOnboardingAgent();
  
  // Example customer data
  const customerData = {
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'TechCorp Inc',
      website: 'https://techcorp.com',
      industry: 'Technology'
    },
    agents: ['social_media', 'content_creation'],
    apiKeys: {
      openai: process.env.OPENAI_API_KEY
    }
  };
  
  try {
    const result = await agent.startOnboarding(customerData);
    console.log('✅ Onboarding completed successfully');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Onboarding failed:', error.message);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default IntelligentOnboardingAgent;
