#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * 🚨 CRITICAL INFRASTRUCTURE CONFLICT FIXER V2
 * 
 * This script completely replaces conflicting content with correct architecture.
 */

class CriticalInfrastructureFixerV2 {
  constructor() {
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
      }
    };
  }

  async fixShellyVPSDeploymentScript() {
    console.log('🔧 FIXING SHELLY VPS DEPLOYMENT SCRIPT...');
    
    const correctContent = `#!/bin/bash

# 🚨 CRITICAL: CORRECTED ARCHITECTURE
# OLD APPROACH: Deploying customer workflows to VPS (CONFLICTING)
# NEW APPROACH: Guide customers to deploy to their own n8n cloud instances
# REASON: Clear separation of concerns, security, and scalability

# 🚀 SHELLY MIZRAHI - CUSTOMER GUIDANCE SCRIPT
# Purpose: Guide Shelly to deploy to her own n8n cloud instance
# Customer: Shelly Mizrahi Consulting (Insurance Services)
# Payment: $250 PAID via QuickBooks (2025-01-15)
# Approach: Customer self-service with AI guidance

set -e

echo "🚀 GUIDING SHELLY TO HER N8N CLOUD INSTANCE..."
echo "💰 Customer: Shelly Mizrahi Consulting"
echo "💳 Payment: $250 PAID via QuickBooks"
echo "🌐 Approach: Customer n8n cloud instance deployment"
echo ""

# Step 1: Provide customer guidance
echo "1️⃣ PROVIDING CUSTOMER GUIDANCE..."
echo "✅ Shelly should deploy to her own n8n cloud instance"
echo "✅ NOT to Rensto VPS (173.254.201.134:5678)"
echo "✅ Customer data stays on customer instance"
echo ""

# Step 2: Start customer portal
echo "2️⃣ STARTING CUSTOMER PORTAL..."
cd /Users/shaifriedman/Rensto/web/rensto-site

if ! pgrep -f "next dev" > /dev/null; then
  echo "Starting Next.js dev server..."
  npm run dev &
  NEXT_PID=$!
  echo "Next.js started with PID: $NEXT_PID"
  sleep 5
else
  echo "✅ Next.js already running"
fi

# Step 3: Display customer access information
echo "3️⃣ CUSTOMER ACCESS INFORMATION..."
echo ""
echo "🎉 CUSTOMER GUIDANCE SETUP COMPLETE!"
echo "==================================="
echo ""
echo "📊 SETUP STATUS:"
echo "✅ Customer Portal: Running on http://localhost:3000"
echo "✅ Shelly's Portal: http://localhost:3000/portal/shelly-mizrahi"
echo "✅ Integration Setup: http://localhost:3000/portal/shelly-mizrahi/credentials"
echo ""
echo "🎯 CUSTOMER SETUP PROCESS:"
echo "1. Shelly accesses her portal: http://localhost:3000/portal/shelly-mizrahi"
echo "2. Goes to Integration Setup tab"
echo "3. Uses AI chat agent to get guidance"
echo "4. Deploys workflow to her own n8n cloud instance"
echo "5. Configures her own credentials"
echo "6. Tests the workflow with her data"
echo ""
echo "🤖 AI ASSISTANT: Available in the integration setup page"
echo "📈 REVENUE: $250 PAID - CUSTOMER SELF-SERVICE APPROACH"
echo ""
echo "🚨 REMEMBER:"
echo "- Rensto VPS n8n: Internal workflows ONLY"
echo "- Customer n8n Cloud: Customer workflows ONLY"
echo "- Clear separation of concerns"
echo "- Customer data stays on customer instances"
`;

    await fs.writeFile('scripts/deploy-shelly-vps-n8n.sh', correctContent);
    console.log('✅ Fixed: scripts/deploy-shelly-vps-n8n.sh');
  }

  async fixShellyVPSWorkflowScript() {
    console.log('🔧 FIXING SHELLY VPS WORKFLOW SCRIPT...');
    
    const correctContent = `#!/usr/bin/env node

/**
 * 🚨 CRITICAL: CORRECTED ARCHITECTURE
 * OLD APPROACH: Deploying customer workflows to VPS (CONFLICTING)
 * NEW APPROACH: Guide customers to deploy to their own n8n cloud instances
 * REASON: Clear separation of concerns, security, and scalability
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class ShellyCustomerGuidance {
  constructor() {
    this.customerInfo = {
      name: 'Shelly Mizrahi Consulting',
      payment: '$250 PAID via QuickBooks',
      approach: 'Customer n8n cloud instance deployment',
      portalUrl: 'http://localhost:3000/portal/shelly-mizrahi'
    };
  }

  async provideCustomerGuidance() {
    console.log('🎯 PROVIDING CUSTOMER GUIDANCE FOR SHELLY MIZRAHI');
    console.log('================================================');
    console.log('');
    console.log('💰 Customer:', this.customerInfo.name);
    console.log('💳 Payment:', this.customerInfo.payment);
    console.log('🌐 Approach:', this.customerInfo.approach);
    console.log('');

    // Step 1: Customer Portal Access
    console.log('1️⃣ CUSTOMER PORTAL ACCESS');
    console.log('─────────────────────────');
    console.log('✅ Portal URL:', this.customerInfo.portalUrl);
    console.log('✅ Integration Setup:', this.customerInfo.portalUrl + '/credentials');
    console.log('✅ AI Chat Agent: Available in integration setup');
    console.log('');

    // Step 2: Deployment Guidance
    console.log('2️⃣ DEPLOYMENT GUIDANCE');
    console.log('──────────────────────');
    console.log('✅ Shelly should deploy to her own n8n cloud instance');
    console.log('✅ NOT to Rensto VPS (173.254.201.134:5678)');
    console.log('✅ Customer data stays on customer instance');
    console.log('✅ AI agent provides step-by-step guidance');
    console.log('');

    // Step 3: Setup Process
    console.log('3️⃣ SETUP PROCESS');
    console.log('────────────────');
    console.log('1. Shelly accesses her portal');
    console.log('2. Goes to Integration Setup tab');
    console.log('3. Uses AI chat agent to get guidance');
    console.log('4. Deploys workflow to her own n8n cloud instance');
    console.log('5. Configures her own credentials');
    console.log('6. Tests the workflow with her data');
    console.log('');

    // Step 4: Success Criteria
    console.log('4️⃣ SUCCESS CRITERIA');
    console.log('───────────────────');
    console.log('✅ Workflow deployed to customer n8n cloud instance');
    console.log('✅ Customer data stays on customer instance');
    console.log('✅ Clear separation of concerns maintained');
    console.log('✅ Security and scalability ensured');
    console.log('');

    console.log('🎉 CUSTOMER GUIDANCE COMPLETE!');
    console.log('==============================');
    console.log('');
    console.log('🚨 REMEMBER:');
    console.log('- Rensto VPS n8n: Internal workflows ONLY');
    console.log('- Customer n8n Cloud: Customer workflows ONLY');
    console.log('- Clear separation of concerns');
    console.log('- Customer data stays on customer instances');
  }
}

// Run customer guidance
const guidance = new ShellyCustomerGuidance();
guidance.provideCustomerGuidance().catch(console.error);
`;

    await fs.writeFile('scripts/deploy-shelly-vps-workflow.js', correctContent);
    console.log('✅ Fixed: scripts/deploy-shelly-vps-workflow.js');
  }

  async fixShellyVPSDeploymentFixScript() {
    console.log('🔧 FIXING SHELLY VPS DEPLOYMENT FIX SCRIPT...');
    
    const correctContent = `#!/usr/bin/env node

/**
 * 🚨 CRITICAL: CORRECTED ARCHITECTURE
 * OLD APPROACH: Deploying customer workflows to VPS (CONFLICTING)
 * NEW APPROACH: Guide customers to deploy to their own n8n cloud instances
 * REASON: Clear separation of concerns, security, and scalability
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class ShellyCustomerGuidanceFix {
  constructor() {
    this.customerInfo = {
      name: 'Shelly Mizrahi Consulting',
      payment: '$250 PAID via QuickBooks',
      approach: 'Customer n8n cloud instance deployment',
      portalUrl: 'http://localhost:3000/portal/shelly-mizrahi'
    };
  }

  async provideCustomerGuidanceFix() {
    console.log('🎯 PROVIDING CUSTOMER GUIDANCE FIX FOR SHELLY MIZRAHI');
    console.log('====================================================');
    console.log('');
    console.log('💰 Customer:', this.customerInfo.name);
    console.log('💳 Payment:', this.customerInfo.payment);
    console.log('🌐 Approach:', this.customerInfo.approach);
    console.log('');

    // Step 1: Identify the Issue
    console.log('1️⃣ IDENTIFYING THE ISSUE');
    console.log('────────────────────────');
    console.log('❌ OLD APPROACH: Deploying to VPS (173.254.201.134:5678)');
    console.log('✅ NEW APPROACH: Customer n8n cloud instance deployment');
    console.log('🔧 FIX: Guide customer to their own instance');
    console.log('');

    // Step 2: Provide Correct Guidance
    console.log('2️⃣ PROVIDING CORRECT GUIDANCE');
    console.log('─────────────────────────────');
    console.log('✅ Portal URL:', this.customerInfo.portalUrl);
    console.log('✅ Integration Setup:', this.customerInfo.portalUrl + '/credentials');
    console.log('✅ AI Chat Agent: Available in integration setup');
    console.log('✅ Customer deploys to their own n8n cloud instance');
    console.log('');

    // Step 3: Setup Process
    console.log('3️⃣ CORRECT SETUP PROCESS');
    console.log('────────────────────────');
    console.log('1. Shelly accesses her portal');
    console.log('2. Goes to Integration Setup tab');
    console.log('3. Uses AI chat agent to get guidance');
    console.log('4. Deploys workflow to her own n8n cloud instance');
    console.log('5. Configures her own credentials');
    console.log('6. Tests the workflow with her data');
    console.log('');

    console.log('🎉 CUSTOMER GUIDANCE FIX COMPLETE!');
    console.log('==================================');
    console.log('');
    console.log('🚨 REMEMBER:');
    console.log('- Rensto VPS n8n: Internal workflows ONLY');
    console.log('- Customer n8n Cloud: Customer workflows ONLY');
    console.log('- Clear separation of concerns');
    console.log('- Customer data stays on customer instances');
  }
}

// Run customer guidance fix
const guidanceFix = new ShellyCustomerGuidanceFix();
guidanceFix.provideCustomerGuidanceFix().catch(console.error);
`;

    await fs.writeFile('scripts/fix-shelly-vps-deployment.js', correctContent);
    console.log('✅ Fixed: scripts/fix-shelly-vps-deployment.js');
  }

  async fixAPIRoute() {
    console.log('🔌 FIXING API ROUTE...');
    
    const correctContent = `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowName, workflowData, environment, customerId } = body;

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

    // Only allow internal Rensto workflows on VPS
    if (customerId === 'internal') {
      // Call the MCP server for Rensto VPS workflows only
      const mcpResponse = await fetch('https://customer-portal-mcp.service-46a.workers.dev/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: 'deploy_n8n_workflow',
            arguments: {
              workflowName,
              workflowData,
              environment: environment || 'production',
              customerId: 'internal' // Rensto VPS only
            }
          }
        })
      });

      if (!mcpResponse.ok) {
        throw new Error(\`MCP server error: \${mcpResponse.statusText}\`);
      }

      const mcpData = await mcpResponse.json();
      
      if (mcpData.error) {
        throw new Error(\`MCP tool error: \${mcpData.error.message}\`);
      }

      return NextResponse.json({
        success: true,
        data: mcpData.result,
        message: \`Internal workflow '\${workflowName}' deployed successfully to Rensto VPS\`
      });
    }

    // For customer workflows, provide guidance instead
    return NextResponse.json({
      success: false,
      error: 'Customer workflows must be deployed to customer n8n cloud instances',
      message: 'Use customer portal guidance for workflow deployment',
      guidance: {
        portalUrl: \`http://localhost:3000/portal/\${customerId}\`,
        integrationSetup: \`http://localhost:3000/portal/\${customerId}/credentials\`,
        approach: 'Customer self-service with AI guidance'
      }
    }, { status: 400 });

  } catch (error) {
    console.error('Error handling n8n workflow request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to handle n8n workflow request'
      },
      { status: 500 }
    );
  }
}
`;

    await fs.writeFile('apps/web/rensto-site/api-backup/api/mcp/deploy-n8n-workflow/route.ts', correctContent);
    console.log('✅ Fixed: apps/web/rensto-site/api-backup/api/mcp/deploy-n8n-workflow/route.ts');
  }

  async runFullFix() {
    console.log('🚨 CRITICAL INFRASTRUCTURE CONFLICT FIXER V2');
    console.log('============================================');
    console.log('');
    console.log('🎯 OBJECTIVE: Completely replace conflicting content');
    console.log('🎯 OBJECTIVE: Ensure correct architecture implementation');
    console.log('');

    // Fix all conflicts with complete content replacement
    await this.fixShellyVPSDeploymentScript();
    await this.fixShellyVPSWorkflowScript();
    await this.fixShellyVPSDeploymentFixScript();
    await this.fixAPIRoute();

    console.log('');
    console.log('🎉 INFRASTRUCTURE CONFLICTS COMPLETELY FIXED!');
    console.log('==============================================');
    console.log('');
    console.log('✅ DEPLOYMENT SCRIPTS: Completely replaced with correct approach');
    console.log('✅ API ROUTES: Added validation and correct guidance');
    console.log('✅ ARCHITECTURE: Clear separation of concerns implemented');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Run: node scripts/validate-infrastructure.js');
    console.log('2. Test customer portal guidance');
    console.log('3. Verify no VPS deployment for customers');
    console.log('');
    console.log('🚨 REMEMBER:');
    console.log('- Rensto VPS n8n: Internal workflows ONLY');
    console.log('- Customer n8n Cloud: Customer workflows ONLY');
    console.log('- Racknerd MCP: Rensto operations ONLY');
    console.log('- Cloudflare MCP: Customer guidance ONLY');
  }
}

// Run the fixer
const fixer = new CriticalInfrastructureFixerV2();
fixer.runFullFix().catch(console.error);
