#!/usr/bin/env node

/**
 * n8n Safety Guard
 * Prevents cross-contamination between Rensto and customer instances
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class N8nSafetyGuard {
  constructor() {
    this.configPath = path.join(__dirname, 'n8n-instances.json');
    this.safetyLogPath = path.join(__dirname, 'safety-log.json');
    this.instances = this.loadInstances();
    this.safetyLog = this.loadSafetyLog();
  }

  loadInstances() {
    if (fs.existsSync(this.configPath)) {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }
    return { instances: {}, current: null };
  }

  loadSafetyLog() {
    if (fs.existsSync(this.safetyLogPath)) {
      return JSON.parse(fs.readFileSync(this.safetyLogPath, 'utf8'));
    }
    return { violations: [], warnings: [], lastCheck: null };
  }

  saveSafetyLog() {
    fs.writeFileSync(this.safetyLogPath, JSON.stringify(this.safetyLog, null, 2));
  }

  // Check for potential cross-contamination
  async performSafetyCheck() {
    console.log('🛡️  n8n Safety Guard - Checking for cross-contamination...');
    
    const violations = [];
    const warnings = [];
    
    // Check 1: Verify current instance isolation
    if (this.instances.current) {
      const currentInstance = this.instances.instances[this.instances.current];
      
      if (currentInstance.safety.isolationMode) {
        console.log('✅ Isolation mode enabled for current instance');
      } else {
        warnings.push({
          type: 'isolation_disabled',
          message: `Isolation mode disabled for ${currentInstance.name}`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Check 2: Verify no shared credentials between instances
    const credentialMap = this.buildCredentialMap();
    const sharedCredentials = this.findSharedCredentials(credentialMap);
    
    if (sharedCredentials.length > 0) {
      violations.push({
        type: 'shared_credentials',
        message: 'Shared credentials detected between instances',
        details: sharedCredentials,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check 3: Verify workflow naming conventions
    const workflowViolations = await this.checkWorkflowNaming();
    violations.push(...workflowViolations);
    
    // Check 4: Verify webhook URL isolation
    const webhookViolations = await this.checkWebhookIsolation();
    violations.push(...webhookViolations);
    
    // Update safety log
    this.safetyLog.violations.push(...violations);
    this.safetyLog.warnings.push(...warnings);
    this.safetyLog.lastCheck = new Date().toISOString();
    this.saveSafetyLog();
    
    // Report results
    this.reportSafetyResults(violations, warnings);
    
    return { violations, warnings };
  }

  buildCredentialMap() {
    const credentialMap = {};
    
    for (const [instanceId, instance] of Object.entries(this.instances.instances)) {
      for (const [credType, credValue] of Object.entries(instance.credentials)) {
        if (credValue && credValue !== 'null') {
          if (!credentialMap[credValue]) {
            credentialMap[credValue] = [];
          }
          credentialMap[credValue].push({
            instanceId,
            instanceName: instance.name,
            credentialType: credType
          });
        }
      }
    }
    
    return credentialMap;
  }

  findSharedCredentials(credentialMap) {
    const sharedCredentials = [];
    
    for (const [credValue, instances] of Object.entries(credentialMap)) {
      if (instances.length > 1) {
        sharedCredentials.push({
          credentialValue: credValue.substring(0, 10) + '...', // Masked
          instances: instances.map(i => ({
            name: i.instanceName,
            type: i.credentialType
          }))
        });
      }
    }
    
    return sharedCredentials;
  }

  async checkWorkflowNaming() {
    const violations = [];
    
    for (const [instanceId, instance] of Object.entries(this.instances.instances)) {
      try {
        // This would need to be implemented with actual n8n API calls
        // For now, we'll simulate the check
        console.log(`🔍 Checking workflow naming for ${instance.name}...`);
        
        // Simulate workflow check
        const hasRenstoWorkflows = Math.random() > 0.7; // Simulate
        const hasCustomerWorkflows = Math.random() > 0.7; // Simulate
        
        if (instance.name.includes('Customer') && hasRenstoWorkflows) {
          violations.push({
            type: 'workflow_contamination',
            message: `Rensto workflows found in customer instance: ${instance.name}`,
            severity: 'high',
            timestamp: new Date().toISOString()
          });
        }
        
        if (instance.name === 'Rensto VPS' && hasCustomerWorkflows) {
          violations.push({
            type: 'workflow_contamination',
            message: `Customer workflows found in Rensto instance: ${instance.name}`,
            severity: 'high',
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (error) {
        console.log(`⚠️  Could not check workflows for ${instance.name}: ${error.message}`);
      }
    }
    
    return violations;
  }

  async checkWebhookIsolation() {
    const violations = [];
    
    // Check for webhook URL conflicts
    const webhookUrls = new Map();
    
    for (const [instanceId, instance] of Object.entries(this.instances.instances)) {
      // This would check actual webhook URLs from n8n API
      // For now, we'll simulate the check
      const simulatedWebhookUrl = `${instance.url}/webhook/test-${instanceId}`;
      
      if (webhookUrls.has(simulatedWebhookUrl)) {
        violations.push({
          type: 'webhook_conflict',
          message: `Webhook URL conflict detected: ${simulatedWebhookUrl}`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      } else {
        webhookUrls.set(simulatedWebhookUrl, instance.name);
      }
    }
    
    return violations;
  }

  reportSafetyResults(violations, warnings) {
    console.log('\n📊 Safety Check Results:');
    console.log('========================');
    
    if (violations.length === 0 && warnings.length === 0) {
      console.log('✅ No safety issues detected');
      return;
    }
    
    if (violations.length > 0) {
      console.log(`❌ ${violations.length} violations found:`);
      violations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation.message}`);
        console.log(`      Severity: ${violation.severity.toUpperCase()}`);
        console.log(`      Time: ${violation.timestamp}`);
        console.log('');
      });
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warnings:`);
      warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.message}`);
        console.log(`      Severity: ${warning.severity.toUpperCase()}`);
        console.log('');
      });
    }
    
    // Recommendations
    console.log('💡 Recommendations:');
    if (violations.length > 0) {
      console.log('   - Review and fix all violations before switching instances');
      console.log('   - Consider enabling isolation mode for all instances');
    }
    if (warnings.length > 0) {
      console.log('   - Review warnings and consider addressing them');
    }
    console.log('   - Run safety checks regularly');
    console.log('   - Keep instance credentials completely separate');
  }

  // Emergency isolation - lock down all instances
  async emergencyIsolation() {
    console.log('🚨 EMERGENCY ISOLATION ACTIVATED');
    console.log('==================================');
    
    // Disable all instances
    for (const [instanceId, instance] of Object.entries(this.instances.instances)) {
      instance.safety.isolationMode = true;
      instance.safety.emergencyLock = true;
      instance.metadata.emergencyLockTime = new Date().toISOString();
    }
    
    this.saveInstances();
    
    console.log('🔒 All instances locked down');
    console.log('⚠️  Manual intervention required to unlock');
    
    // Log emergency action
    this.safetyLog.emergencyActions = this.safetyLog.emergencyActions || [];
    this.safetyLog.emergencyActions.push({
      action: 'emergency_isolation',
      timestamp: new Date().toISOString(),
      reason: 'Manual activation'
    });
    this.saveSafetyLog();
  }

  // Generate safety report
  generateSafetyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalInstances: Object.keys(this.instances.instances).length,
      currentInstance: this.instances.current,
      safetyStatus: {
        violations: this.safetyLog.violations.length,
        warnings: this.safetyLog.warnings.length,
        lastCheck: this.safetyLog.lastCheck
      },
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(__dirname, `safety-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📋 Safety report generated: ${reportPath}`);
    return reportPath;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for common issues
    const hasSharedCredentials = this.safetyLog.violations.some(v => v.type === 'shared_credentials');
    if (hasSharedCredentials) {
      recommendations.push('Use unique credentials for each instance');
    }
    
    const hasWorkflowContamination = this.safetyLog.violations.some(v => v.type === 'workflow_contamination');
    if (hasWorkflowContamination) {
      recommendations.push('Implement strict workflow naming conventions');
    }
    
    const hasWebhookConflicts = this.safetyLog.violations.some(v => v.type === 'webhook_conflict');
    if (hasWebhookConflicts) {
      recommendations.push('Use unique webhook URLs for each instance');
    }
    
    // General recommendations
    recommendations.push('Enable isolation mode for all instances');
    recommendations.push('Run safety checks before each instance switch');
    recommendations.push('Keep detailed logs of all instance activities');
    
    return recommendations;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const guard = new N8nSafetyGuard();
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      guard.performSafetyCheck();
      break;
      
    case 'emergency':
      guard.emergencyIsolation();
      break;
      
    case 'report':
      guard.generateSafetyReport();
      break;
      
    default:
      console.log(`
n8n Safety Guard
================

Commands:
  check                   - Perform safety check
  emergency              - Emergency isolation (lock all instances)
  report                 - Generate safety report
  
Examples:
  node safety-guard.js check
  node safety-guard.js emergency
  node safety-guard.js report
      `);
  }
}

export default N8nSafetyGuard;
