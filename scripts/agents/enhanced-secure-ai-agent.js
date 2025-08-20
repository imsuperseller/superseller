#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🔒 ENHANCED SECURE AI AGENT
 * 
 * This enhanced agent supports both Rensto and customer-specific API keys
 * with proper cost tracking, usage management, and security controls.
 */

class EnhancedSecureAIAgent {
  constructor() {
    this.config = {
      // Rensto credentials (system operations)
      rensto: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: 'https://api.openai.com/v1',
          maxCost: 0.10, // $0.10 per request max
          maxTokens: 2000,
          useCases: ['admin', 'support', 'development', 'onboarding', 'monitoring']
        },
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: 'https://openrouter.ai/api/v1',
          maxCost: 0.05, // $0.05 per request max
          maxTokens: 2000,
          useCases: ['backup', 'alternative', 'testing']
        }
      },
      // Customer credentials will be loaded from profile files
      customers: {}
    };
    
    // Rate limiting configuration
    this.rateLimits = {
      rensto: {
        requestsPerMinute: 20,
        requestsPerHour: 200,
        requestsPerDay: 2000
      },
      customers: {
        'ben-ginati': {
          requestsPerMinute: 30,
          requestsPerHour: 300,
          requestsPerDay: 3000
        },
        'shelly-mizrahi': {
          requestsPerMinute: 10,
          requestsPerHour: 100,
          requestsPerDay: 1000
        }
      }
    };
    
    // Security configuration
    this.security = {
      maxInputLength: 15000,
      allowedModels: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet'],
      blockedKeywords: ['password', 'api_key', 'secret', 'token', 'credential'],
      requireAuthentication: true
    };
    
    // Usage tracking
    this.usageTracking = {
      rensto: {},
      customers: {
        'ben-ginati': {},
        'shelly-mizrahi': {}
      }
    };
    
    // Audit logging
    this.auditLog = [];
  }

  // ===== CUSTOMER CREDENTIAL LOADING =====

  async loadCustomerCredentials(customerId) {
    try {
      const profilePath = path.join(process.cwd(), 'data', 'customers', customerId, 'customer-profile.json');
      const profileData = await fs.readFile(profilePath, 'utf8');
      const profile = JSON.parse(profileData);
      
      if (profile.customer?.apiCredentials?.openai) {
        const credentials = profile.customer.apiCredentials.openai;
        this.config.customers[customerId] = {
          openai: {
            apiKey: credentials.apiKey,
            baseURL: 'https://api.openai.com/v1',
            maxCost: credentials.usageLimit || 0.10,
            maxTokens: 2000,
            useCases: this.getCustomerUseCases(customerId)
          }
        };
        console.log(`✅ Loaded credentials for customer: ${customerId}`);
        return true;
      } else {
        console.log(`❌ No API credentials found for customer: ${customerId}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Failed to load credentials for customer ${customerId}:`, error.message);
      return false;
    }
  }

  getCustomerUseCases(customerId) {
    const useCaseMap = {
      'ben-ginati': ['wordpress', 'social', 'podcast', 'content-generation'],
      'shelly-mizrahi': ['excel', 'data-processing', 'analysis']
    };
    return useCaseMap[customerId] || ['general'];
  }

  // ===== CREDENTIAL DETERMINATION =====

  async determineCredentials(customerId, useCase) {
    // System operations use Rensto credentials
    if (this.isSystemOperation(useCase)) {
      return {
        provider: 'rensto',
        service: 'openai',
        config: this.config.rensto.openai
      };
    }
    
    // Customer operations use customer credentials if available
    if (customerId && this.config.customers[customerId]) {
      return {
        provider: 'customer',
        customerId,
        service: 'openai',
        config: this.config.customers[customerId].openai
      };
    }
    
    // Fallback to Rensto credentials
    return {
      provider: 'rensto',
      service: 'openai',
      config: this.config.rensto.openai
    };
  }

  isSystemOperation(useCase) {
    const systemUseCases = [
      'admin', 'support', 'development', 'onboarding', 
      'monitoring', 'backup', 'alternative', 'testing'
    ];
    return systemUseCases.includes(useCase);
  }

  // ===== RATE LIMITING =====

  checkRateLimit(provider, customerId = null) {
    const limits = customerId 
      ? this.rateLimits.customers[customerId] 
      : this.rateLimits.rensto;
    
    if (!limits) {
      return { allowed: false, reason: 'No rate limits configured' };
    }
    
    const userId = customerId || 'rensto';
    const tracking = customerId 
      ? this.usageTracking.customers[customerId] 
      : this.usageTracking.rensto;
    
    if (!tracking[userId]) {
      tracking[userId] = {
        minute: { count: 0, reset: Math.floor(Date.now() / 60000) },
        hour: { count: 0, reset: Math.floor(Date.now() / 3600000) },
        day: { count: 0, reset: Math.floor(Date.now() / 86400000) }
      };
    }
    
    const user = tracking[userId];
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);
    
    // Reset counters if time window has passed
    if (user.minute.reset !== minute) {
      user.minute = { count: 0, reset: minute };
    }
    if (user.hour.reset !== hour) {
      user.hour = { count: 0, reset: hour };
    }
    if (user.day.reset !== day) {
      user.day = { count: 0, reset: day };
    }
    
    // Check limits
    if (user.minute.count >= limits.requestsPerMinute) {
      return { allowed: false, reason: 'Rate limit exceeded: per minute' };
    }
    if (user.hour.count >= limits.requestsPerHour) {
      return { allowed: false, reason: 'Rate limit exceeded: per hour' };
    }
    if (user.day.count >= limits.requestsPerDay) {
      return { allowed: false, reason: 'Rate limit exceeded: per day' };
    }
    
    // Increment counters
    user.minute.count++;
    user.hour.count++;
    user.day.count++;
    
    return { allowed: true };
  }

  // ===== SECURITY VALIDATION =====

  validateInput(input) {
    const errors = [];
    
    // Check input length
    if (input.length > this.security.maxInputLength) {
      errors.push(`Input too long. Max length: ${this.security.maxInputLength}`);
    }
    
    // Check for blocked keywords
    const lowerInput = input.toLowerCase();
    for (const keyword of this.security.blockedKeywords) {
      if (lowerInput.includes(keyword)) {
        errors.push(`Input contains blocked keyword: ${keyword}`);
      }
    }
    
    // Check for suspicious patterns
    if (this.detectSuspiciousPatterns(input)) {
      errors.push('Input contains suspicious patterns');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  detectSuspiciousPatterns(input) {
    const patterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /javascript:/gi, // JavaScript injection
      /on\w+\s*=/gi, // Event handlers
      /data:text\/html/gi, // Data URLs
      /vbscript:/gi, // VBScript
      /<iframe/gi, // Iframe injection
    ];
    
    return patterns.some(pattern => pattern.test(input));
  }

  // ===== COST MONITORING =====

  estimateCost(model, tokens, provider = 'openai') {
    const costPer1kTokens = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'claude-3-sonnet': 0.015
    };
    
    return (tokens / 1000) * (costPer1kTokens[model] || 0.01);
  }

  checkCostLimit(estimatedCost, config) {
    return estimatedCost <= config.maxCost;
  }

  // ===== AUDIT LOGGING =====

  logAuditEvent(event) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      provider: event.provider,
      customerId: event.customerId,
      useCase: event.useCase,
      model: event.model,
      inputLength: event.inputLength,
      estimatedCost: event.estimatedCost,
      success: event.success,
      error: event.error,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      responseTime: event.responseTime
    };
    
    this.auditLog.push(auditEntry);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    // Persist to file
    this.persistAuditLog(auditEntry);
  }

  async persistAuditLog(entry) {
    try {
      const logFile = path.join(process.cwd(), 'logs', 'enhanced-ai-audit.log');
      const logEntry = JSON.stringify(entry) + '\n';
      
      await fs.mkdir(path.dirname(logFile), { recursive: true });
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  // ===== MAIN AI CALL METHOD =====

  async secureAICall(params) {
    const {
      input,
      model = 'gpt-3.5-turbo',
      useCase = 'general',
      customerId = null,
      authToken,
      ipAddress,
      userAgent
    } = params;

    const startTime = Date.now();
    let auth = null;
    
    try {
      // 1. Validate authentication
      auth = this.validateAuthentication(authToken);
      if (!auth.valid) {
        throw new Error(`Authentication failed: ${auth.error}`);
      }
      
      // 2. Load customer credentials if needed
      if (customerId && !this.config.customers[customerId]) {
        await this.loadCustomerCredentials(customerId);
      }
      
      // 3. Determine which credentials to use
      const credentials = await this.determineCredentials(customerId, useCase);
      
      // 4. Check rate limits
      const rateLimit = this.checkRateLimit(credentials.provider, credentials.customerId);
      if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded: ${rateLimit.reason}`);
      }
      
      // 5. Validate input
      const inputValidation = this.validateInput(input);
      if (!inputValidation.valid) {
        throw new Error(`Input validation failed: ${inputValidation.errors.join(', ')}`);
      }
      
      // 6. Estimate cost
      const estimatedCost = this.estimateCost(model, input.length);
      if (!this.checkCostLimit(estimatedCost, credentials.config)) {
        throw new Error(`Cost limit exceeded: $${estimatedCost} > $${credentials.config.maxCost}`);
      }
      
      // 7. Make AI call
      const aiResponse = await this.callAI(credentials, model, input);
      
      // 8. Log successful event
      this.logAuditEvent({
        provider: credentials.provider,
        customerId: credentials.customerId,
        useCase,
        model,
        inputLength: input.length,
        estimatedCost,
        success: true,
        ipAddress,
        userAgent,
        responseTime: Date.now() - startTime
      });
      
      return {
        success: true,
        response: aiResponse,
        metadata: {
          provider: credentials.provider,
          customerId: credentials.customerId,
          useCase,
          model,
          estimatedCost,
          responseTime: Date.now() - startTime
        }
      };
      
    } catch (error) {
      // Log failed event
      this.logAuditEvent({
        provider: auth?.provider || 'unknown',
        customerId: auth?.customerId || customerId,
        useCase,
        model,
        inputLength: input?.length || 0,
        estimatedCost: 0,
        success: false,
        error: error.message,
        ipAddress,
        userAgent,
        responseTime: Date.now() - startTime
      });
      
      throw error;
    }
  }

  // ===== AI CALL IMPLEMENTATION =====

  async callAI(credentials, model, input) {
    const config = credentials.config;
    
    if (credentials.provider === 'rensto' && credentials.service === 'openai') {
      return await this.callOpenAI(config, model, input);
    } else if (credentials.provider === 'rensto' && credentials.service === 'openrouter') {
      return await this.callOpenRouter(config, model, input);
    } else if (credentials.provider === 'customer') {
      return await this.callOpenAI(config, model, input);
    }
    
    throw new Error(`Unsupported provider/service combination: ${credentials.provider}/${credentials.service}`);
  }

  async callOpenAI(config, model, input) {
    const response = await axios.post(`${config.baseURL}/chat/completions`, {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide accurate and helpful responses.'
        },
        {
          role: 'user',
          content: input
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return response.data.choices[0].message.content;
  }

  async callOpenRouter(config, model, input) {
    const response = await axios.post(`${config.baseURL}/chat/completions`, {
      model: `openai/${model}`,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide accurate and helpful responses.'
        },
        {
          role: 'user',
          content: input
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rensto.com',
        'X-Title': 'Rensto AI System'
      },
      timeout: 30000
    });
    
    return response.data.choices[0].message.content;
  }

  // ===== AUTHENTICATION =====

  validateAuthentication(authToken) {
    if (!this.security.requireAuthentication) {
      return { valid: true, userId: 'anonymous' };
    }
    
    if (!authToken) {
      return { valid: false, error: 'Authentication token required' };
    }
    
    try {
      const decoded = this.decodeToken(authToken);
      return { valid: true, userId: decoded.userId };
    } catch (error) {
      return { valid: false, error: 'Invalid authentication token' };
    }
  }

  decodeToken(token) {
    // Simple token validation - replace with proper JWT validation
    if (token.startsWith('user_')) {
      return { userId: token };
    }
    throw new Error('Invalid token format');
  }

  // ===== ADMIN FUNCTIONS =====

  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit);
  }

  getUsageStats() {
    return {
      rensto: this.usageTracking.rensto,
      customers: this.usageTracking.customers
    };
  }

  resetRateLimits(provider, customerId = null) {
    if (provider === 'rensto') {
      this.usageTracking.rensto = {};
    } else if (provider === 'customer' && customerId) {
      if (this.usageTracking.customers[customerId]) {
        delete this.usageTracking.customers[customerId];
      }
    }
  }
}

// Export singleton instance
export const enhancedSecureAIAgent = new EnhancedSecureAIAgent();

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new EnhancedSecureAIAgent();
  
  console.log('🧪 Testing Enhanced Secure AI Agent...');
  
  // Test system operation (uses Rensto credentials)
  agent.secureAICall({
    input: 'Hello, this is a system test.',
    model: 'gpt-3.5-turbo',
    useCase: 'admin',
    authToken: 'user_test123',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent'
  }).then(result => {
    console.log('✅ System operation successful:', result.metadata);
  }).catch(error => {
    console.log('❌ System operation failed:', error.message);
  });
  
  // Test customer operation (uses customer credentials if available)
  agent.secureAICall({
    input: 'Hello, this is a customer test.',
    model: 'gpt-3.5-turbo',
    useCase: 'wordpress',
    customerId: 'ben-ginati',
    authToken: 'user_ben123',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent'
  }).then(result => {
    console.log('✅ Customer operation successful:', result.metadata);
  }).catch(error => {
    console.log('❌ Customer operation failed:', error.message);
  });
  
  // Test Shelly's customer operation
  agent.secureAICall({
    input: 'Hello, this is Shelly\'s test.',
    model: 'gpt-3.5-turbo',
    useCase: 'excel',
    customerId: 'shelly-mizrahi',
    authToken: 'user_shelly123',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent'
  }).then(result => {
    console.log('✅ Shelly operation successful:', result.metadata);
  }).catch(error => {
    console.log('❌ Shelly operation failed:', error.message);
  });
}
