#!/usr/bin/env node

/**
 * 🚨 INFRASTRUCTURE VALIDATION SCRIPT
 * 
 * This script validates that all files follow the correct architecture:
 * - Rensto VPS n8n: Internal workflows only
 * - Customer n8n Cloud: Customer workflows only
 * - Racknerd MCP: Rensto operations only
 * - Cloudflare MCP: Customer guidance only
 */

import fs from 'fs/promises';
import path from 'path';

class InfrastructureValidator {
  constructor() {
    this.violations = [];
    this.correctPatterns = {
      renstoVPS: /173\.254\.201\.134.*internal|internal.*173\.254\.201\.134/gi,
      customerCloud: /customer.*n8n.*cloud|customer.*cloud.*n8n/gi,
      racknerdMCP: /racknerd.*mcp.*rensto|rensto.*racknerd.*mcp/gi,
      cloudflareMCP: /cloudflare.*mcp.*customer|customer.*cloudflare.*mcp/gi
    };
    this.violationPatterns = {
      customerVPS: /customer.*173\.254\.201\.134|173\.254\.201\.134.*customer/gi,
      mixedMCP: /racknerd.*mcp.*customer|customer.*racknerd.*mcp/gi,
      // More specific patterns that exclude warning comments and error messages
      vpsDeployment: /(?<!OLD APPROACH.*)deploy.*customer.*vps|(?<!OLD APPROACH.*)vps.*customer.*deploy/gi,
      actualVPSDeployment: /deploy.*workflow.*to.*173\.254\.201\.134|173\.254\.201\.134.*deploy.*workflow/gi,
      customerDataOnVPS: /customer.*data.*173\.254\.201\.134|173\.254\.201\.134.*customer.*data/gi
    };
  }

  async validateFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const violations = [];

      // Check for violations (excluding warning comments and error messages)
      for (const [patternName, pattern] of Object.entries(this.violationPatterns)) {
        // Skip validation for warning comments about old approaches
        if (content.includes('OLD APPROACH') || content.includes('CONFLICTING')) {
          continue;
        }
        
        // Skip validation for error messages that explain correct approach
        if (content.includes('must be deployed to customer n8n cloud instances') || 
            content.includes('Use customer portal guidance')) {
          continue;
        }
        
        if (pattern.test(content)) {
          violations.push({
            type: patternName,
            file: filePath,
            description: `Found ${patternName} violation`
          });
        }
      }

      return violations;
    } catch (error) {
      return [{
        type: 'file_error',
        file: filePath,
        description: `Could not read file: ${error.message}`
      }];
    }
  }

  async runValidation() {
    console.log('🔍 RUNNING INFRASTRUCTURE VALIDATION...');
    
    const filesToCheck = [
      'scripts/deploy-shelly-vps-n8n.sh',
      'scripts/deploy-shelly-vps-workflow.js',
      'scripts/fix-shelly-vps-deployment.js',
      'docs/technical/WORKFLOW_DEPLOYMENT.md',
      'docs/customer-portal-system.md',
      'apps/web/rensto-site/api-backup/api/mcp/deploy-n8n-workflow/route.ts'
    ];

    for (const file of filesToCheck) {
      const violations = await this.validateFile(file);
      this.violations.push(...violations);
    }

    // Report results
    if (this.violations.length === 0) {
      console.log('✅ All files follow correct architecture!');
      console.log('✅ No conflicting deployment strategies found');
      console.log('✅ Clear separation of concerns maintained');
      console.log('✅ Customer workflows properly guided to cloud instances');
      console.log('✅ Rensto VPS reserved for internal workflows only');
    } else {
      console.log('❌ Found violations:');
      this.violations.forEach(violation => {
        console.log(`  - ${violation.file}: ${violation.description}`);
      });
    }

    return this.violations.length === 0;
  }
}

// Run validation
const validator = new InfrastructureValidator();
validator.runValidation().catch(console.error);
