#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🔒 SECURITY MONITOR
 * 
 * This script provides comprehensive security monitoring and alerting
 * for all AI agent interactions and system activities.
 */

class SecurityMonitor {
  constructor() {
    this.securityLogFile = path.join(process.cwd(), 'logs', 'security-events.log');
    this.securityData = {
      events: [],
      alerts: [],
      blockedRequests: [],
      suspiciousActivity: [],
      summary: {
        totalEvents: 0,
        securityAlerts: 0,
        blockedRequests: 0,
        suspiciousActivity: 0,
        lastUpdated: null
      }
    };
    
    this.securityRules = {
      maxFailedAttempts: 5,
      suspiciousPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /<iframe/gi,
        /union\s+select/gi,
        /drop\s+table/gi,
        /insert\s+into/gi,
        /delete\s+from/gi
      ],
      blockedKeywords: [
        'password', 'api_key', 'secret', 'token', 'credential',
        'admin', 'root', 'sudo', 'exec', 'system', 'eval'
      ],
      rateLimitThresholds: {
        requestsPerMinute: 50,
        requestsPerHour: 500,
        requestsPerDay: 5000
      }
    };
  }

  async logSecurityEvent(event) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      type: event.type,
      severity: event.severity || 'info',
      source: event.source,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      userId: event.userId,
      customerId: event.customerId
    };

    // Add to memory
    this.securityData.events.push(securityEvent);
    this.securityData.summary.totalEvents++;
    this.securityData.summary.lastUpdated = new Date().toISOString();

    // Check for security alerts
    await this.checkSecurityAlerts(securityEvent);

    // Persist to file
    await this.persistSecurityEvent(securityEvent);

    // Keep only last 1000 events in memory
    if (this.securityData.events.length > 1000) {
      this.securityData.events = this.securityData.events.slice(-1000);
    }
  }

  async checkSecurityAlerts(event) {
    const alerts = [];

    // Check for suspicious patterns
    if (event.details?.input && this.detectSuspiciousPatterns(event.details.input)) {
      alerts.push({
        type: 'suspicious_pattern',
        severity: 'high',
        message: 'Suspicious pattern detected in input',
        timestamp: new Date().toISOString(),
        event: event
      });
    }

    // Check for blocked keywords
    if (event.details?.input && this.detectBlockedKeywords(event.details.input)) {
      alerts.push({
        type: 'blocked_keyword',
        severity: 'medium',
        message: 'Blocked keyword detected in input',
        timestamp: new Date().toISOString(),
        event: event
      });
    }

    // Check for high rate of failed attempts
    if (event.type === 'authentication_failure') {
      const recentFailures = this.securityData.events.filter(e => 
        e.type === 'authentication_failure' && 
        e.userId === event.userId &&
        new Date(e.timestamp) > new Date(Date.now() - 3600000) // Last hour
      );

      if (recentFailures.length >= this.securityRules.maxFailedAttempts) {
        alerts.push({
          type: 'multiple_failed_attempts',
          severity: 'high',
          message: `Multiple failed authentication attempts for user ${event.userId}`,
          timestamp: new Date().toISOString(),
          event: event,
          details: { failureCount: recentFailures.length }
        });
      }
    }

    // Check for unusual activity patterns
    if (event.type === 'ai_request') {
      const recentRequests = this.securityData.events.filter(e => 
        e.type === 'ai_request' && 
        e.userId === event.userId &&
        new Date(e.timestamp) > new Date(Date.now() - 60000) // Last minute
      );

      if (recentRequests.length > this.securityRules.rateLimitThresholds.requestsPerMinute) {
        alerts.push({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          message: `Rate limit exceeded for user ${event.userId}`,
          timestamp: new Date().toISOString(),
          event: event,
          details: { requestCount: recentRequests.length }
        });
      }
    }

    // Add alerts to security data
    this.securityData.alerts.push(...alerts);
    this.securityData.summary.securityAlerts += alerts.length;

    // Log high severity alerts immediately
    const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
    for (const alert of highSeverityAlerts) {
      console.error(`🚨 HIGH SECURITY ALERT: ${alert.message}`);
      await this.sendSecurityAlert(alert);
    }
  }

  detectSuspiciousPatterns(input) {
    return this.securityRules.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  detectBlockedKeywords(input) {
    const lowerInput = input.toLowerCase();
    return this.securityRules.blockedKeywords.some(keyword => lowerInput.includes(keyword));
  }

  async persistSecurityEvent(event) {
    try {
      await fs.mkdir(path.dirname(this.securityLogFile), { recursive: true });
      const logEntry = JSON.stringify(event) + '\n';
      await fs.appendFile(this.securityLogFile, logEntry);
    } catch (error) {
      console.error('Failed to persist security event:', error);
    }
  }

  async sendSecurityAlert(alert) {
    // In a real implementation, this would send alerts via:
    // - Email notifications
    // - Slack/Discord webhooks
    // - SMS alerts
    // - Security team notifications
    
    console.error(`🔒 SECURITY ALERT: ${alert.type.toUpperCase()}`);
    console.error(`   Severity: ${alert.severity}`);
    console.error(`   Message: ${alert.message}`);
    console.error(`   Timestamp: ${alert.timestamp}`);
    console.error(`   Details:`, alert.details);
  }

  // ===== SECURITY ANALYSIS =====

  generateSecurityReport() {
    const report = {
      summary: this.securityData.summary,
      recentAlerts: this.securityData.alerts.slice(-10),
      securityMetrics: this.calculateSecurityMetrics(),
      recommendations: this.generateSecurityRecommendations()
    };

    return report;
  }

  calculateSecurityMetrics() {
    const events = this.securityData.events;
    const last24Hours = events.filter(e => 
      new Date(e.timestamp) > new Date(Date.now() - 86400000)
    );

    const metrics = {
      totalEvents24h: last24Hours.length,
      securityAlerts24h: last24Hours.filter(e => e.severity === 'high').length,
      authenticationFailures24h: last24Hours.filter(e => e.type === 'authentication_failure').length,
      suspiciousActivity24h: last24Hours.filter(e => e.type === 'suspicious_pattern').length,
      rateLimitViolations24h: last24Hours.filter(e => e.type === 'rate_limit_exceeded').length
    };

    return metrics;
  }

  generateSecurityRecommendations() {
    const recommendations = [];
    const metrics = this.calculateSecurityMetrics();

    if (metrics.authenticationFailures24h > 10) {
      recommendations.push({
        priority: 'high',
        action: 'Review authentication system and consider implementing MFA',
        reason: 'High number of authentication failures detected'
      });
    }

    if (metrics.suspiciousActivity24h > 5) {
      recommendations.push({
        priority: 'high',
        action: 'Review input validation and consider additional security measures',
        reason: 'Multiple suspicious activity patterns detected'
      });
    }

    if (metrics.rateLimitViolations24h > 20) {
      recommendations.push({
        priority: 'medium',
        action: 'Review and adjust rate limiting policies',
        reason: 'High number of rate limit violations'
      });
    }

    if (this.securityData.summary.securityAlerts > 50) {
      recommendations.push({
        priority: 'high',
        action: 'Conduct security audit and review all security policies',
        reason: 'High number of security alerts generated'
      });
    }

    return recommendations;
  }

  // ===== SECURITY UTILITIES =====

  validateInput(input, context = {}) {
    const validation = {
      valid: true,
      warnings: [],
      blocked: false,
      reason: null
    };

    // Check for suspicious patterns
    if (this.detectSuspiciousPatterns(input)) {
      validation.valid = false;
      validation.blocked = true;
      validation.reason = 'Suspicious pattern detected';
    }

    // Check for blocked keywords
    if (this.detectBlockedKeywords(input)) {
      validation.warnings.push('Blocked keyword detected');
    }

    // Check input length
    if (input.length > 15000) {
      validation.warnings.push('Input exceeds recommended length');
    }

    return validation;
  }

  isIPBlocked(ipAddress) {
    // In a real implementation, this would check against:
    // - Known malicious IP lists
    // - Geographic restrictions
    // - Previous violation history
    
    const blockedIPs = [
      '192.168.1.100', // Example blocked IP
      '10.0.0.50'      // Example blocked IP
    ];

    return blockedIPs.includes(ipAddress);
  }

  shouldBlockRequest(event) {
    // Check if IP is blocked
    if (this.isIPBlocked(event.ipAddress)) {
      return { blocked: true, reason: 'IP address is blocked' };
    }

    // Check for suspicious patterns
    if (event.details?.input && this.detectSuspiciousPatterns(event.details.input)) {
      return { blocked: true, reason: 'Suspicious pattern detected' };
    }

    // Check for multiple failed attempts
    if (event.type === 'authentication_failure') {
      const recentFailures = this.securityData.events.filter(e => 
        e.type === 'authentication_failure' && 
        e.userId === event.userId &&
        new Date(e.timestamp) > new Date(Date.now() - 3600000) // Last hour
      );

      if (recentFailures.length >= this.securityRules.maxFailedAttempts) {
        return { blocked: true, reason: 'Too many failed authentication attempts' };
      }
    }

    return { blocked: false };
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

// Example usage and testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new SecurityMonitor();
  
  async function testSecurityMonitor() {
    console.log('🔒 Testing Security Monitor...');
    
    // Test normal event
    await monitor.logSecurityEvent({
      type: 'ai_request',
      severity: 'info',
      source: 'api',
      details: { input: 'Hello, how are you?' },
      ipAddress: '192.168.1.1',
      userAgent: 'test-agent',
      userId: 'user_test123',
      customerId: 'ben'
    });
    
    // Test suspicious event
    await monitor.logSecurityEvent({
      type: 'ai_request',
      severity: 'high',
      source: 'api',
      details: { input: '<script>alert("xss")</script>' },
      ipAddress: '192.168.1.2',
      userAgent: 'test-agent',
      userId: 'user_test456',
      customerId: 'ben'
    });
    
    // Test authentication failure
    await monitor.logSecurityEvent({
      type: 'authentication_failure',
      severity: 'medium',
      source: 'auth',
      details: { reason: 'Invalid credentials' },
      ipAddress: '192.168.1.3',
      userAgent: 'test-agent',
      userId: 'user_test789'
    });
    
    // Generate security report
    console.log('\n📊 Security Report:');
    console.log(JSON.stringify(monitor.generateSecurityReport(), null, 2));
    
    // Test input validation
    console.log('\n🔍 Input Validation Test:');
    const validation = monitor.validateInput('<script>alert("test")</script>');
    console.log(JSON.stringify(validation, null, 2));
  }
  
  testSecurityMonitor().catch(console.error);
}
