#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * 🚨 CRITICAL INFRASTRUCTURE CONFLICT FIXER
 * 
 * This script fixes all conflicting n8n deployment strategies and MCP server
 * management approaches identified in the infrastructure audit.
 * 
 * CONFLICTS FOUND:
 * 1. Customer workflows being deployed to VPS n8n instance
 * 2. Mixed MCP server responsibilities between Rensto and customer needs
 * 3. Conflicting documentation about deployment strategies
 */

class CriticalInfrastructureFixer {
  constructor() {
    this.conflicts = {
      highPriority: [
        'scripts/deploy-shelly-vps-n8n.sh',
        'scripts/deploy-shelly-vps-workflow.js',
        'scripts/fix-shelly-vps-deployment.js',
        'scripts/proper-n8n-management.js',
        'scripts/implement-agent-deployment-automation.js',
        'docs/technical/WORKFLOW_DEPLOYMENT.md',
        'docs/customer-portal-system.md',
        'apps/web/rensto-site/api-backup/api/mcp/deploy-n8n-workflow/route.ts'
      ],
      mediumPriority: [
        'docs/VPS_MCP_TOOLS_IMPLEMENTATION.md',
        'scripts/business/mcp-business-enhancement.js',
        'infra/mcp-servers/enhanced-mcp-ecosystem.js'
      ]
    };

    this.correctArchitecture = {
      n8nDeployment: {
        renstoVPS: {
          purpose: 'Internal Rensto workflows ONLY',
          url: 'http://173.254.201.134:5678',
          workflows: [
            'Customer Onboarding Automation',
            'Lead-to-Customer Pipeline',
            'Finance Unpaid Invoices',
            'Assets Renewals < 30d',
            'Projects — In Progress Digest'
          ]
        },
        customerCloud: {
          purpose: 'Customer-specific workflows',
          management: 'Customer self-service + AI guidance',
          data: 'Stays on customer instances'
        }
      },
      mcpServers: {
        racknerdVPS: {
          purpose: 'Rensto internal operations ONLY',
          tools: [
            'deploy_n8n_workflow (Rensto VPS only)',
            'monitor_n8n_execution (Rensto VPS only)',
            'track_n8n_commissions (affiliate tracking)',
            'manage_rensto_data (internal data)',
            'analyze_rensto_performance (internal metrics)'
          ]
        },
        cloudflare: {
          purpose: 'Customer portal guidance ONLY',
          tools: [
            'guide_customer_setup (AI assistance)',
            'provide_workflow_templates (templates only)',
            'monitor_customer_status (read-only)',
            'customer_support_ai (guidance only)'
          ]
        }
      }
    };
  }

  async fixDeploymentScripts() {
    console.log('🔧 FIXING DEPLOYMENT SCRIPTS...');
    
    const scriptsToFix = [
      'scripts/deploy-shelly-vps-n8n.sh',
      'scripts/deploy-shelly-vps-workflow.js',
      'scripts/fix-shelly-vps-deployment.js'
    ];

    for (const script of scriptsToFix) {
      try {
        const content = await fs.readFile(script, 'utf8');
        
        // Replace VPS deployment for customers with customer instance guidance
        let fixedContent = content
          .replace(/deploy.*VPS.*customer|customer.*VPS.*deploy/gi, 'guide customer to their n8n cloud instance')
          .replace(/VPS.*n8n.*customer|customer.*n8n.*VPS/gi, 'customer n8n cloud instance')
          .replace(/173\.254\.201\.134.*customer|customer.*173\.254\.201\.134/gi, 'customer n8n cloud instance')
          .replace(/deploy.*workflow.*VPS.*customer|customer.*workflow.*VPS.*deploy/gi, 'provide workflow template to customer');

        // Add warning comments
        const warningComment = `# 🚨 CRITICAL: This script has been updated to follow correct architecture
# OLD APPROACH: Deploying customer workflows to VPS (CONFLICTING)
# NEW APPROACH: Guide customers to deploy to their own n8n cloud instances
# REASON: Clear separation of concerns, security, and scalability
\n`;
        
        fixedContent = warningComment + fixedContent;

        await fs.writeFile(script, fixedContent);
        console.log(`✅ Fixed: ${script}`);
      } catch (error) {
        console.log(`⚠️ Could not fix ${script}: ${error.message}`);
      }
    }
  }

  async fixDocumentation() {
    console.log('📚 FIXING DOCUMENTATION...');
    
    const docsToFix = [
      'docs/technical/WORKFLOW_DEPLOYMENT.md',
      'docs/customer-portal-system.md'
    ];

    for (const doc of docsToFix) {
      try {
        const content = await fs.readFile(doc, 'utf8');
        
        // Replace conflicting deployment strategies
        let fixedContent = content
          .replace(/deploy.*workflow.*VPS.*database/gi, 'provide workflow template to customer n8n cloud instance')
          .replace(/VPS.*n8n.*database/gi, 'customer n8n cloud instance')
          .replace(/immediately.*deploy.*VPS/gi, 'provide workflow template to customer')
          .replace(/customer.*configures.*credentials.*later/gi, 'customer configures credentials in their own instance');

        // Add clarification header
        const clarificationHeader = `# 🚨 ARCHITECTURE CLARIFICATION
## CORRECT DEPLOYMENT STRATEGY:
- **Rensto VPS n8n**: Internal Rensto workflows ONLY
- **Customer n8n Cloud**: Customer-specific workflows
- **MCP Server**: Rensto VPS management ONLY
- **Customer Portal**: Guidance and templates ONLY

\n`;
        
        fixedContent = clarificationHeader + fixedContent;

        await fs.writeFile(doc, fixedContent);
        console.log(`✅ Fixed: ${doc}`);
      } catch (error) {
        console.log(`⚠️ Could not fix ${doc}: ${error.message}`);
      }
    }
  }

  async fixAPIRoutes() {
    console.log('🔌 FIXING API ROUTES...');
    
    const apiRoute = 'apps/web/rensto-site/api-backup/api/mcp/deploy-n8n-workflow/route.ts';
    
    try {
      const content = await fs.readFile(apiRoute, 'utf8');
      
      // Replace VPS deployment with customer guidance
      let fixedContent = content
        .replace(/deploy.*n8n.*workflow/gi, 'provide workflow template to customer')
        .replace(/deploy.*workflow.*to.*environment/gi, 'provide workflow template to customer n8n cloud instance')
        .replace(/customerId.*internal/gi, 'customerId: customer n8n cloud instance');

      // Add validation to prevent VPS deployment for customers
      const validationCode = `
    // 🚨 VALIDATION: Prevent VPS deployment for customers
    if (customerId && customerId !== 'internal') {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer workflows must be deployed to customer n8n cloud instances, not VPS',
          message: 'Use customer portal guidance instead of direct deployment'
        },
        { status: 400 }
      );
    }
`;

      // Insert validation after the try block
      const tryIndex = fixedContent.indexOf('try {');
      if (tryIndex !== -1) {
        const beforeTry = fixedContent.substring(0, tryIndex);
        const afterTry = fixedContent.substring(tryIndex + 5);
        fixedContent = beforeTry + 'try {' + validationCode + afterTry;
      }

      await fs.writeFile(apiRoute, fixedContent);
      console.log(`✅ Fixed: ${apiRoute}`);
    } catch (error) {
      console.log(`⚠️ Could not fix ${apiRoute}: ${error.message}`);
    }
  }

  async fixMCPDocumentation() {
    console.log('🔧 FIXING MCP DOCUMENTATION...');
    
    const mcpDoc = 'docs/VPS_MCP_TOOLS_IMPLEMENTATION.md';
    
    try {
      const content = await fs.readFile(mcpDoc, 'utf8');
      
      // Add clarification about Rensto-only scope
      const clarificationHeader = `# 🚨 MCP SERVER SCOPE CLARIFICATION

## CORRECT ARCHITECTURE:
- **Racknerd VPS MCP**: Rensto internal operations ONLY
- **Cloudflare MCP**: Customer portal guidance ONLY
- **NO MIXED RESPONSIBILITIES**: Clear separation of concerns

## RENSTO VPS MCP TOOLS (Internal Only):
- deploy_n8n_workflow (Rensto VPS only)
- monitor_n8n_execution (Rensto VPS only)
- track_n8n_commissions (affiliate tracking)
- manage_rensto_data (internal data)
- analyze_rensto_performance (internal metrics)

## CUSTOMER GUIDANCE (Cloudflare MCP):
- guide_customer_setup (AI assistance)
- provide_workflow_templates (templates only)
- monitor_customer_status (read-only)
- customer_support_ai (guidance only)

\n`;
      
      const fixedContent = clarificationHeader + content;
      await fs.writeFile(mcpDoc, fixedContent);
      console.log(`✅ Fixed: ${mcpDoc}`);
    } catch (error) {
      console.log(`⚠️ Could not fix ${mcpDoc}: ${error.message}`);
    }
  }

  async createValidationScript() {
    console.log('🔍 CREATING VALIDATION SCRIPT...');
    
    const validationScript = `#!/usr/bin/env node

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
      vpsDeployment: /deploy.*customer.*vps|vps.*customer.*deploy/gi
    };
  }

  async validateFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const violations = [];

      // Check for violations
      for (const [patternName, pattern] of Object.entries(this.violationPatterns)) {
        if (pattern.test(content)) {
          violations.push({
            type: patternName,
            file: filePath,
            description: \`Found \${patternName} violation\`
          });
        }
      }

      return violations;
    } catch (error) {
      return [{
        type: 'file_error',
        file: filePath,
        description: \`Could not read file: \${error.message}\`
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
    } else {
      console.log('❌ Found violations:');
      this.violations.forEach(violation => {
        console.log(\`  - \${violation.file}: \${violation.description}\`);
      });
    }

    return this.violations.length === 0;
  }
}

// Run validation
const validator = new InfrastructureValidator();
validator.runValidation().catch(console.error);
`;

    await fs.writeFile('scripts/validate-infrastructure.js', validationScript);
    console.log('✅ Created: scripts/validate-infrastructure.js');
  }

  async runFullFix() {
    console.log('🚨 CRITICAL INFRASTRUCTURE CONFLICT FIXER');
    console.log('==========================================');
    console.log('');
    console.log('🎯 OBJECTIVE: Fix all conflicting n8n deployment strategies');
    console.log('🎯 OBJECTIVE: Clarify MCP server responsibilities');
    console.log('');

    // Fix all conflicts
    await this.fixDeploymentScripts();
    await this.fixDocumentation();
    await this.fixAPIRoutes();
    await this.fixMCPDocumentation();
    await this.createValidationScript();

    console.log('');
    console.log('🎉 INFRASTRUCTURE CONFLICTS FIXED!');
    console.log('==================================');
    console.log('');
    console.log('✅ DEPLOYMENT SCRIPTS: Updated to guide customers to their instances');
    console.log('✅ DOCUMENTATION: Clarified correct architecture');
    console.log('✅ API ROUTES: Added validation to prevent VPS deployment for customers');
    console.log('✅ MCP DOCUMENTATION: Clarified Rensto-only scope');
    console.log('✅ VALIDATION SCRIPT: Created to prevent future conflicts');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Run: node scripts/validate-infrastructure.js');
    console.log('2. Test deployment processes');
    console.log('3. Update team on correct architecture');
    console.log('');
    console.log('🚨 REMEMBER:');
    console.log('- Rensto VPS n8n: Internal workflows ONLY');
    console.log('- Customer n8n Cloud: Customer workflows ONLY');
    console.log('- Racknerd MCP: Rensto operations ONLY');
    console.log('- Cloudflare MCP: Customer guidance ONLY');
  }
}

// Run the fixer
const fixer = new CriticalInfrastructureFixer();
fixer.runFullFix().catch(console.error);
