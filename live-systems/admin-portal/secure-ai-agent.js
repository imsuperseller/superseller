#!/usr/bin/env node

import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * 🔒 SECURE AI AGENT WRAPPER
 * 
 * This wrapper provides security guardrails for all AI agent interactions:
 * - Authentication and authorization
 * - Rate limiting
 * - Input validation and sanitization
 * - Audit logging
 * - Cost monitoring
 * - Error handling
 */

class SecureAIAgent {
  constructor() {
    this.config = {
      // Load API keys from secure environment
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1',
        maxTokens: 2000,
        maxCost: 0.10 // $0.10 per request max
      },
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        maxTokens: 2000,
        maxCost: 0.05 // $0.05 per request max
      }
    };
    
    // Rate limiting configuration
    this.rateLimits = {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 1000
    };
    
    // Security configuration
    this.security = {
      maxInputLength: 10000,
      allowedModels: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet'],
      blockedKeywords: ['password', 'api_key', 'secret', 'token'],
      requireAuthentication: true
    };
    
    // Audit logging
    this.auditLog = [];
    this.usageTracking = {};
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

  // ===== RATE LIMITING =====

  checkRateLimit(userId) {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);
    
    if (!this.usageTracking[userId]) {
      this.usageTracking[userId] = {
        minute: { count: 0, reset: minute },
        hour: { count: 0, reset: hour },
        day: { count: 0, reset: day }
      };
    }
    
    const user = this.usageTracking[userId];
    
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
    if (user.minute.count >= this.rateLimits.requestsPerMinute) {
      return { allowed: false, reason: 'Rate limit exceeded: per minute' };
    }
    if (user.hour.count >= this.rateLimits.requestsPerHour) {
      return { allowed: false, reason: 'Rate limit exceeded: per hour' };
    }
    if (user.day.count >= this.rateLimits.requestsPerDay) {
      return { allowed: false, reason: 'Rate limit exceeded: per day' };
    }
    
    // Increment counters
    user.minute.count++;
    user.hour.count++;
    user.day.count++;
    
    return { allowed: true };
  }

  // ===== AUTHENTICATION =====

  validateAuthentication(authToken) {
    if (!this.security.requireAuthentication) {
      return { valid: true, userId: 'anonymous' };
    }
    
    if (!authToken) {
      return { valid: false, error: 'Authentication token required' };
    }
    
    // In a real implementation, validate JWT or session token
    // For now, we'll use a simple token validation
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

  // ===== COST MONITORING =====

  estimateCost(model, tokens) {
    const costPer1kTokens = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'claude-3-sonnet': 0.015
    };
    
    return (tokens / 1000) * (costPer1kTokens[model] || 0.01);
  }

  checkCostLimit(estimatedCost, provider) {
    const maxCost = this.config[provider]?.maxCost || 0.10;
    return estimatedCost <= maxCost;
  }

  // ===== AUDIT LOGGING =====

  logAuditEvent(event) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      model: event.model,
      inputLength: event.inputLength,
      estimatedCost: event.estimatedCost,
      success: event.success,
      error: event.error,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent
    };
    
    this.auditLog.push(auditEntry);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
    
    // Log to file for persistence
    this.persistAuditLog(auditEntry);
  }

  async persistAuditLog(entry) {
    try {
      const logFile = path.join(process.cwd(), 'logs', 'ai-audit.log');
      const logEntry = JSON.stringify(entry) + '\n';
      
      await fs.mkdir(path.dirname(logFile), { recursive: true });
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  // ===== SECURE AI CALL =====

  async secureAICall(params) {
    const {
      input,
      model = 'gpt-4',
      provider = 'openai',
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
      
      // 2. Check rate limits
      const rateLimit = this.checkRateLimit(auth.userId);
      if (!rateLimit.allowed) {
        throw new Error(`Rate limit exceeded: ${rateLimit.reason}`);
      }
      
      // 3. Validate input
      const inputValidation = this.validateInput(input);
      if (!inputValidation.valid) {
        throw new Error(`Input validation failed: ${inputValidation.errors.join(', ')}`);
      }
      
      // 4. Estimate cost
      const estimatedCost = this.estimateCost(model, input.length);
      if (!this.checkCostLimit(estimatedCost, provider)) {
        throw new Error(`Cost limit exceeded: $${estimatedCost} > $${this.config[provider]?.maxCost}`);
      }
      
      // 5. Make AI call
      const aiResponse = await this.callAI(provider, model, input);
      
      // 6. Log successful event
      this.logAuditEvent({
        userId: auth.userId,
        action: 'ai_call',
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
          model,
          provider,
          estimatedCost,
          responseTime: Date.now() - startTime
        }
      };
      
    } catch (error) {
      // Log failed event
      this.logAuditEvent({
        userId: auth?.userId || 'unknown',
        action: 'ai_call',
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

  async callAI(provider, model, input) {
    const config = this.config[provider];
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
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

  // ===== ADMIN FUNCTIONS =====

  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit);
  }

  getUsageStats() {
    return this.usageTracking;
  }

  resetRateLimits(userId) {
    if (userId && this.usageTracking[userId]) {
      delete this.usageTracking[userId];
    } else {
      this.usageTracking = {};
    }
  }
}

// Export singleton instance
export const secureAIAgent = new SecureAIAgent();

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new SecureAIAgent();
  
  // Debug: Check if API key is loaded
  console.log('🔍 API Key loaded:', agent.config.openai.apiKey ? 'Yes' : 'No');
  console.log('🔍 API Key length:', agent.config.openai.apiKey?.length || 0);
  
  // Test secure AI call
  agent.secureAICall({
    input: 'Hello, how are you?',
    model: 'gpt-4',
    provider: 'openai',
    authToken: 'user_test123',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent'
  }).then(result => {
    console.log('✅ Secure AI call successful:', result);
  }).catch(error => {
    console.error('❌ Secure AI call failed:', error.message);
  });
}
