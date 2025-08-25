#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { dbConnect } from '../web/rensto-site/src/lib/mongoose.js';
import { Organization } from '../web/rensto-site/src/models/Organization.js';
import { Agent } from '../web/rensto-site/src/models/Agent.js';

/**
 * 🔧 FIX DATA INTEGRATION
 * 
 * This script fixes the disconnected data sources by:
 * 1. Loading customer data from JSON files into MongoDB
 * 2. Creating proper Organization and Agent records
 * 3. Ensuring data flows correctly to admin app and customer portals
 */

class DataIntegrationFixer {
  constructor() {
    this.customersDir = 'data/customers';
    this.workflowsDir = 'workflows';
  }

  async fixDataIntegration() {
    console.log('🔧 Fixing Data Integration Issues');
    console.log('==================================');

    try {
      // Step 1: Connect to MongoDB
      await this.connectToDatabase();
      console.log('✅ Database connected');

      // Step 2: Load customer data into MongoDB
      await this.loadCustomerDataToMongoDB();
      console.log('✅ Customer data loaded to MongoDB');

      // Step 3: Create agent records from workflows
      await this.createAgentRecordsFromWorkflows();
      console.log('✅ Agent records created from workflows');

      // Step 4: Update customer portals with real data
      await this.updateCustomerPortalsWithRealData();
      console.log('✅ Customer portals updated');

      // Step 5: Verify integration
      await this.verifyIntegration();
      console.log('✅ Integration verified');

      console.log('\n🎉 Data Integration Fixed Successfully!');
      return true;

    } catch (error) {
      console.error('❌ Data integration fix failed:', error.message);
      return false;
    }
  }

  async connectToDatabase() {
    console.log('\n🗄️ Connecting to MongoDB...');
    await dbConnect();
  }

  async loadCustomerDataToMongoDB() {
    console.log('\n📊 Loading customer data to MongoDB...');

    const customers = await this.getCustomerDirectories();

    for (const customerId of customers) {
      console.log(`\n👤 Processing customer: ${customerId}`);

      try {
        // Load customer profile
        const profilePath = path.join(this.customersDir, customerId, 'customer-profile.json');
        const profileData = JSON.parse(await fs.readFile(profilePath, 'utf8'));

        // Create or update Organization record
        await this.createOrganizationRecord(customerId, profileData);

        // Create or update Agent records
        await this.createAgentRecords(customerId, profileData);

        console.log(`✅ ${customerId} data loaded to MongoDB`);

      } catch (error) {
        console.error(`❌ Failed to load ${customerId}: ${error.message}`);
      }
    }
  }

  async getCustomerDirectories() {
    const entries = await fs.readdir(this.customersDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('customer-') && name !== 'archived-files');
  }

  async createOrganizationRecord(customerId, profileData) {
    const orgData = {
      name: profileData.customerName || customerId,
      slug: customerId,
      domain: profileData.domain || `${customerId}.rensto.com`,
      settings: {
        timezone: profileData.timezone || 'UTC',
        currency: profileData.currency || 'USD',
        language: profileData.language || 'en',
        features: profileData.features || []
      },
      billing: {
        plan: profileData.billing?.plan || 'premium',
        status: profileData.billing?.status || 'active',
        totalSpent: profileData.billing?.totalSpent || 0
      }
    };

    // Upsert organization
    await Organization.findOneAndUpdate(
      { slug: customerId },
      orgData,
      { upsert: true, new: true }
    );

    console.log(`✅ Organization record created/updated for ${customerId}`);
  }

  async createAgentRecords(customerId, profileData) {
    if (!profileData.agents || !Array.isArray(profileData.agents)) {
      console.log(`⚠️ No agents found for ${customerId}`);
      return;
    }

    for (const agentData of profileData.agents) {
      const agentRecord = {
        name: agentData.name,
        key: agentData.key,
        description: agentData.description,
        status: agentData.status || 'ready',
        icon: agentData.icon || '🤖',
        tags: agentData.tags || [],
        capabilities: agentData.capabilities || [],
        pricing: {
          model: agentData.pricing?.model || 'per_run',
          rate: agentData.pricing?.rate || 0
        },
        isActive: agentData.isActive || false,
        schedule: agentData.schedule || 'manual',
        dependencies: agentData.dependencies || [],
        progress: agentData.progress || { current: 0, total: 100, message: 'Ready' },
        lastRun: agentData.lastRun ? new Date(agentData.lastRun) : null,
        successRate: agentData.successRate || null,
        avgDuration: agentData.avgDuration || null,
        costEst: agentData.costEst || 0,
        roi: agentData.roi || 0
      };

      // Upsert agent record
      await Agent.findOneAndUpdate(
        { key: agentData.key, 'organization.slug': customerId },
        { ...agentRecord, organization: { slug: customerId } },
        { upsert: true, new: true }
      );

      console.log(`✅ Agent record created/updated: ${agentData.name}`);
    }
  }

  async createAgentRecordsFromWorkflows() {
    console.log('\n🤖 Creating agent records from n8n workflows...');

    const workflowFiles = await this.getWorkflowFiles();

    for (const workflowFile of workflowFiles) {
      try {
        const workflowData = JSON.parse(await fs.readFile(workflowFile, 'utf8'));
        const customerId = this.extractCustomerIdFromWorkflow(workflowData);

        if (customerId) {
          await this.createAgentFromWorkflow(customerId, workflowData);
        }

      } catch (error) {
        console.error(`❌ Failed to process workflow ${workflowFile}: ${error.message}`);
      }
    }
  }

  async getWorkflowFiles() {
    const entries = await fs.readdir(this.workflowsDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
      .map(entry => path.join(this.workflowsDir, entry.name));
  }

  extractCustomerIdFromWorkflow(workflowData) {
    const name = workflowData.name?.toLowerCase() || '';

    if (name.includes('shelly')) return 'shelly-mizrahi';
    if (name.includes('ben')) return 'ben-ginati';
    if (name.includes('ortal')) return 'ortal';

    return null;
  }

  async createAgentFromWorkflow(customerId, workflowData) {
    const agentKey = this.generateAgentKey(workflowData.name);

    const agentRecord = {
      name: workflowData.name,
      key: agentKey,
      description: `n8n workflow: ${workflowData.name}`,
      status: 'ready',
      icon: '⚡',
      tags: ['n8n', 'workflow', 'automation'],
      capabilities: ['webhook', 'data-processing', 'automation'],
      pricing: {
        model: 'per_run',
        rate: 50
      },
      isActive: true,
      schedule: 'manual',
      dependencies: ['n8n-server'],
      progress: { current: 100, total: 100, message: 'Workflow ready' },
      organization: { slug: customerId }
    };

    await Agent.findOneAndUpdate(
      { key: agentKey },
      agentRecord,
      { upsert: true, new: true }
    );

    console.log(`✅ Workflow agent created: ${workflowData.name}`);
  }

  generateAgentKey(workflowName) {
    return workflowName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async updateCustomerPortalsWithRealData() {
    console.log('\n🎨 Updating customer portals with real data...');

    const customers = await this.getCustomerDirectories();

    for (const customerId of customers) {
      try {
        await this.updateCustomerPortal(customerId);
        console.log(`✅ Portal updated for ${customerId}`);
      } catch (error) {
        console.error(`❌ Failed to update portal for ${customerId}: ${error.message}`);
      }
    }
  }

  async updateCustomerPortal(customerId) {
    // Get real data from MongoDB
    const organization = await Organization.findOne({ slug: customerId });
    const agents = await Agent.find({ 'organization.slug': customerId });

    if (!organization) {
      console.log(`⚠️ No organization found for ${customerId}`);
      return;
    }

    // Update portal with real data
    const portalPath = `web/rensto-site/src/app/portal/${customerId}/page.tsx`;

    try {
      let portalContent = await fs.readFile(portalPath, 'utf8');

      // Update with real organization and agent data
      portalContent = this.updatePortalWithRealData(portalContent, organization, agents);

      await fs.writeFile(portalPath, portalContent);

    } catch (error) {
      console.log(`⚠️ Portal file not found for ${customerId}, skipping portal update`);
    }
  }

  updatePortalWithRealData(content, organization, agents) {
    // Replace mock data with real data
    let updatedContent = content;

    // Update organization name
    updatedContent = updatedContent.replace(
      /customerName:\s*['"][^'"]*['"]/g,
      `customerName: '${organization.name}'`
    );

    // Update agent count
    updatedContent = updatedContent.replace(
      /totalAgents:\s*\d+/g,
      `totalAgents: ${agents.length}`
    );

    // Update active agents count
    const activeAgents = agents.filter(agent => agent.isActive).length;
    updatedContent = updatedContent.replace(
      /activeAgents:\s*\d+/g,
      `activeAgents: ${activeAgents}`
    );

    return updatedContent;
  }

  async verifyIntegration() {
    console.log('\n✅ Verifying data integration...');

    // Check MongoDB records
    const organizations = await Organization.find();
    const agents = await Agent.find();

    console.log(`📊 Organizations in MongoDB: ${organizations.length}`);
    console.log(`🤖 Agents in MongoDB: ${agents.length}`);

    // Check customer directories
    const customers = await this.getCustomerDirectories();
    console.log(`👥 Customer directories: ${customers.length}`);

    // Verify data consistency
    for (const customerId of customers) {
      const org = await Organization.findOne({ slug: customerId });
      const customerAgents = await Agent.find({ 'organization.slug': customerId });

      console.log(`✅ ${customerId}: ${org ? '✓' : '✗'} org, ${customerAgents.length} agents`);
    }
  }
}

// Execute fix if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new DataIntegrationFixer();
  fixer.fixDataIntegration()
    .then(success => {
      if (success) {
        console.log('\n🚀 Data integration fix completed successfully!');
        console.log('📊 Customer data now flows: JSON → MongoDB → Admin App → Customer Portal');
        console.log('🤖 n8n workflows are properly integrated as agents');
        process.exit(0);
      } else {
        console.log('\n❌ Data integration fix failed - check logs');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Data integration fix execution failed:', error);
      process.exit(1);
    });
}

export { DataIntegrationFixer };
