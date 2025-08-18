#!/usr/bin/env node

/**
 * Rensto Business System - Complete Data Population Script
 *
 * This script populates the system with realistic sample data for demonstration
 * and testing purposes. It creates organizations, users, agents, workflows,
 * analytics data, and portal-specific data with realistic relationships and patterns.
 *
 * Updated to include customer portal functionality and enhanced agent management.
 */

import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Configuration
const CONFIG = {
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rensto',

  // Data Generation
  organizations: 10,
  usersPerOrg: { min: 5, max: 20 },
  agentsPerOrg: { min: 3, max: 15 },
  workflowsPerOrg: { min: 5, max: 20 },
  historicalDays: 90,

  // Performance ranges
  successRates: { min: 85, max: 98 },
  responseTimes: { min: 0.5, max: 5.0 },
  executionRates: { min: 10, max: 100 },
};

// Organization templates by industry
const ORGANIZATION_TEMPLATES = {
  saas: {
    name: 'TechFlow Solutions',
    industry: 'Software as a Service',
    description: 'Cloud-based business automation platform',
    agents: [
      {
        name: 'User Onboarding Agent',
        type: 'onboarding',
        description: 'Automates new user onboarding process',
      },
      {
        name: 'Feature Analyzer',
        type: 'analytics',
        description: 'Analyzes user feature adoption patterns',
      },
      {
        name: 'Support Ticket Manager',
        type: 'support',
        description: 'Manages and routes support tickets',
      },
      {
        name: 'Usage Analytics Agent',
        type: 'analytics',
        description: 'Tracks and analyzes user behavior',
      },
      {
        name: 'Billing Automation Agent',
        type: 'billing',
        description: 'Handles subscription billing and renewals',
      },
    ],
    workflows: [
      {
        name: 'User Activation Campaign',
        type: 'activation',
        description: 'Automated user activation workflow',
      },
      {
        name: 'Feature Adoption Tracking',
        type: 'analytics',
        description: 'Monitors feature usage and adoption',
      },
      {
        name: 'Support Escalation',
        type: 'support',
        description: 'Escalates support tickets based on priority',
      },
      {
        name: 'Subscription Renewal',
        type: 'billing',
        description: 'Manages subscription renewals and upgrades',
      },
    ],
  },
  consulting: {
    name: 'GreenLeaf Consulting',
    industry: 'Business Consulting',
    description: 'Strategic business consulting and advisory services',
    agents: [
      {
        name: 'Lead Qualification Agent',
        type: 'lead_processing',
        description: 'Qualifies and scores incoming leads',
      },
      {
        name: 'Proposal Generator',
        type: 'content',
        description: 'Generates customized proposals',
      },
      {
        name: 'Client Manager',
        type: 'relationship',
        description: 'Manages client relationships and communications',
      },
      {
        name: 'Market Research Agent',
        type: 'research',
        description: 'Conducts market research and analysis',
      },
    ],
    workflows: [
      {
        name: 'Lead Nurturing Campaign',
        type: 'marketing',
        description: 'Automated lead nurturing workflow',
      },
      {
        name: 'Proposal Automation',
        type: 'sales',
        description: 'Automates proposal generation and delivery',
      },
      {
        name: 'Client Onboarding',
        type: 'onboarding',
        description: 'Streamlines client onboarding process',
      },
      {
        name: 'Project Status Updates',
        type: 'communication',
        description: 'Automated project status reporting',
      },
    ],
  },
  ecommerce: {
    name: 'ShopSmart Retail',
    industry: 'E-commerce',
    description: 'Online retail platform with automated inventory management',
    agents: [
      {
        name: 'Order Processor',
        type: 'order_processing',
        description: 'Processes and validates orders',
      },
      {
        name: 'Inventory Manager',
        type: 'inventory',
        description: 'Manages inventory levels and alerts',
      },
      {
        name: 'Customer Support Agent',
        type: 'support',
        description: 'Handles customer inquiries and issues',
      },
      {
        name: 'Recommendation Engine',
        type: 'ai',
        description: 'Provides personalized product recommendations',
      },
      {
        name: 'Fraud Detection Agent',
        type: 'security',
        description: 'Detects and prevents fraudulent transactions',
      },
    ],
    workflows: [
      {
        name: 'Order Fulfillment',
        type: 'operations',
        description: 'Automated order fulfillment process',
      },
      {
        name: 'Inventory Alerts',
        type: 'inventory',
        description: 'Monitors and alerts on inventory levels',
      },
      {
        name: 'Customer Feedback Collection',
        type: 'feedback',
        description: 'Collects and processes customer feedback',
      },
      {
        name: 'Abandoned Cart Recovery',
        type: 'marketing',
        description: 'Recovers abandoned shopping carts',
      },
    ],
  },
  healthcare: {
    name: 'HealthTech Innovations',
    industry: 'Healthcare Technology',
    description: 'Digital health solutions and patient management',
    agents: [
      {
        name: 'Patient Onboarding Agent',
        type: 'onboarding',
        description: 'Streamlines patient registration',
      },
      {
        name: 'Appointment Scheduler',
        type: 'scheduling',
        description: 'Manages appointment scheduling',
      },
      {
        name: 'Health Data Analyzer',
        type: 'analytics',
        description: 'Analyzes patient health data',
      },
      {
        name: 'Compliance Monitor',
        type: 'compliance',
        description: 'Monitors regulatory compliance',
      },
    ],
    workflows: [
      {
        name: 'Patient Registration',
        type: 'onboarding',
        description: 'Automated patient registration process',
      },
      {
        name: 'Appointment Reminders',
        type: 'communication',
        description: 'Sends appointment reminders',
      },
      {
        name: 'Health Report Generation',
        type: 'reporting',
        description: 'Generates health reports',
      },
      {
        name: 'Compliance Reporting',
        type: 'compliance',
        description: 'Automated compliance reporting',
      },
    ],
  },
  education: {
    name: 'EduTech Academy',
    industry: 'Education Technology',
    description: 'Online learning platform with AI-powered tutoring',
    agents: [
      {
        name: 'Student Onboarding Agent',
        type: 'onboarding',
        description: 'Onboards new students',
      },
      {
        name: 'Progress Tracker',
        type: 'analytics',
        description: 'Tracks student progress',
      },
      {
        name: 'Content Recommender',
        type: 'ai',
        description: 'Recommends personalized content',
      },
      {
        name: 'Assessment Generator',
        type: 'content',
        description: 'Generates assessments and quizzes',
      },
    ],
    workflows: [
      {
        name: 'Student Registration',
        type: 'onboarding',
        description: 'Automated student registration',
      },
      {
        name: 'Progress Reporting',
        type: 'reporting',
        description: 'Generates progress reports',
      },
      {
        name: 'Content Assignment',
        type: 'content',
        description: 'Assigns personalized content',
      },
      {
        name: 'Assessment Scheduling',
        type: 'scheduling',
        description: 'Schedules assessments',
      },
    ],
  },
};

// Sample data generators
const DATA_GENERATORS = {
  // Generate random number within range
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  // Generate random float within range
  randomFloat: (min, max) => Math.random() * (max - min) + min,

  // Generate random date within range
  randomDate: (start, end) =>
    new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    ),

  // Generate realistic name
  generateName: () => {
    const firstNames = [
      'John',
      'Jane',
      'Michael',
      'Sarah',
      'David',
      'Emily',
      'Robert',
      'Lisa',
      'James',
      'Maria',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
    ];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
  },

  // Generate realistic email
  generateEmail: (name, organization) => {
    const cleanName = name.toLowerCase().replace(' ', '.');
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
    return `${cleanName}@${
      domains[Math.floor(Math.random() * domains.length)]
    }`;
  },

  // Generate performance metrics
  generatePerformance: () => ({
    success_rate: DATA_GENERATORS.randomFloat(
      CONFIG.successRates.min,
      CONFIG.successRates.max
    ),
    avg_response_time: DATA_GENERATORS.randomFloat(
      CONFIG.responseTimes.min,
      CONFIG.responseTimes.max
    ),
    total_executions: DATA_GENERATORS.random(100, 5000),
    last_execution: DATA_GENERATORS.randomDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    ),
  }),

  // Generate historical data
  generateHistoricalData: (days, baseValue, variance) => {
    const data = [];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const value = baseValue + (Math.random() - 0.5) * variance;
      data.push({
        date: date.toISOString(),
        value: Math.max(0, value),
        timestamp: date,
      });
    }

    return data;
  },
};

// Main data population class
class DataPopulator {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(CONFIG.mongoUri);
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  // Clear existing data
  async clearData() {
    console.log('🧹 Clearing existing data...');
    const collections = [
      'organizations',
      'users',
      'agents',
      'workflows',
      'metrics',
      'analytics',
      'customers',
      'datasources',
    ];

    for (const collection of collections) {
      try {
        await this.db.collection(collection).deleteMany({});
        console.log(`✅ Cleared ${collection}`);
      } catch (error) {
        console.log(`⚠️ Could not clear ${collection}:`, error.message);
      }
    }
  }

  // Generate organizations
  async generateOrganizations() {
    console.log('🏢 Generating organizations...');
    const organizations = [];
    const industries = Object.keys(ORGANIZATION_TEMPLATES);

    for (let i = 0; i < CONFIG.organizations; i++) {
      const industry = industries[i % industries.length];
      const template = ORGANIZATION_TEMPLATES[industry];
      const size = ['small', 'medium', 'large'][i % 3];
      const subscription = ['starter', 'professional', 'enterprise'][i % 3];

      const organization = {
        _id: new ObjectId(),
        name: `${template.name} ${i + 1}`,
        slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        industry: template.industry,
        description: template.description,
        size: size,
        subscription: subscription,
        settings: {
          timezone: 'UTC',
          language: 'en',
          currency: 'USD',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      organizations.push(organization);
    }

    await this.db.collection('organizations').insertMany(organizations);
    console.log(`✅ Generated ${organizations.length} organizations`);
    return organizations;
  }

  // Generate users
  async generateUsers(organizations) {
    console.log('👥 Generating users...');
    const users = [];

    // System admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    users.push({
      _id: new ObjectId(),
      email: 'admin@rensto.com',
      name: 'System Administrator',
      role: 'admin',
      organizationId: null,
      permissions: ['*'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Organization users
    for (const org of organizations) {
      const userCount = DATA_GENERATORS.random(
        CONFIG.usersPerOrg.min,
        CONFIG.usersPerOrg.max
      );
      const roles = ['manager', 'agent', 'viewer'];

      for (let i = 0; i < userCount; i++) {
        const name = DATA_GENERATORS.generateName();
        const role = roles[i % roles.length];
        const email = DATA_GENERATORS.generateEmail(name, org.name);
        const password = await bcrypt.hash('password123', 10);

        users.push({
          _id: new ObjectId(),
          email: email,
          name: name,
          role: role,
          organizationId: org._id,
          permissions: this.getPermissionsForRole(role),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await this.db.collection('users').insertMany(users);
    console.log(`✅ Generated ${users.length} users`);
    return users;
  }

  // Generate agents
  async generateAgents(organizations) {
    console.log('🤖 Generating agents...');
    const agents = [];

    for (const org of organizations) {
      const industry = Object.keys(ORGANIZATION_TEMPLATES).find(
        key => ORGANIZATION_TEMPLATES[key].industry === org.industry
      );
      const template = ORGANIZATION_TEMPLATES[industry];
      const agentCount = DATA_GENERATORS.random(
        CONFIG.agentsPerOrg.min,
        CONFIG.agentsPerOrg.max
      );

      for (let i = 0; i < agentCount; i++) {
        const agentTemplate = template.agents[i % template.agents.length];
        const performance = DATA_GENERATORS.generatePerformance();

        agents.push({
          _id: new ObjectId(),
          name: agentTemplate.name,
          key: `${agentTemplate.type}-${org.slug}-${i}`,
          description: agentTemplate.description,
          type: agentTemplate.type,
          organizationId: org._id,
          status: 'active',
          icon: '🤖',
          tags: [agentTemplate.type],
          capabilities: [agentTemplate.type],
          pricing: { model: 'per_run', rate: 0.05 },
          isActive: true,
          schedule: 'daily',
          dependencies: [],
          configuration: {
            enabled: true,
            autoStart: true,
            retryAttempts: 3,
            timeout: 30000,
          },
          performance: performance,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await this.db.collection('agents').insertMany(agents);
    console.log(`✅ Generated ${agents.length} agents`);
    return agents;
  }

  // Generate workflows
  async generateWorkflows(organizations, agents) {
    console.log('🔄 Generating workflows...');
    const workflows = [];

    for (const org of organizations) {
      const industry = Object.keys(ORGANIZATION_TEMPLATES).find(
        key => ORGANIZATION_TEMPLATES[key].industry === org.industry
      );
      const template = ORGANIZATION_TEMPLATES[industry];
      const workflowCount = DATA_GENERATORS.random(
        CONFIG.workflowsPerOrg.min,
        CONFIG.workflowsPerOrg.max
      );
      const orgAgents = agents.filter(agent =>
        agent.organizationId.equals(org._id)
      );

      for (let i = 0; i < workflowCount; i++) {
        const workflowTemplate =
          template.workflows[i % template.workflows.length];
        const steps = this.generateWorkflowSteps(
          workflowTemplate.type,
          orgAgents
        );

        workflows.push({
          _id: new ObjectId(),
          name: workflowTemplate.name,
          description: workflowTemplate.description,
          organizationId: org._id,
          type: workflowTemplate.type,
          status: 'active',
          triggers: this.generateTriggers(workflowTemplate.type),
          steps: steps,
          executionCount: DATA_GENERATORS.random(10, 500),
          lastExecuted: DATA_GENERATORS.randomDate(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            new Date()
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await this.db.collection('workflows').insertMany(workflows);
    console.log(`✅ Generated ${workflows.length} workflows`);
    return workflows;
  }

  // Generate metrics and analytics
  async generateAnalytics(organizations, agents, workflows) {
    console.log('📊 Generating analytics data...');
    const analytics = [];

    // Generate metrics for each organization
    for (const org of organizations) {
      const orgAgents = agents.filter(agent =>
        agent.organizationId.equals(org._id)
      );
      const orgWorkflows = workflows.filter(workflow =>
        workflow.organizationId.equals(org._id)
      );

      // Agent execution metrics
      for (const agent of orgAgents) {
        const historicalData = DATA_GENERATORS.generateHistoricalData(
          CONFIG.historicalDays,
          agent.performance.total_executions / CONFIG.historicalDays,
          20
        );

        analytics.push({
          _id: new ObjectId(),
          organizationId: org._id,
          entityType: 'agent',
          entityId: agent._id,
          metricType: 'execution_rate',
          data: historicalData,
          createdAt: new Date(),
        });
      }

      // Workflow execution metrics
      for (const workflow of orgWorkflows) {
        const historicalData = DATA_GENERATORS.generateHistoricalData(
          CONFIG.historicalDays,
          workflow.executionCount / CONFIG.historicalDays,
          15
        );

        analytics.push({
          _id: new ObjectId(),
          organizationId: org._id,
          entityType: 'workflow',
          entityId: workflow._id,
          metricType: 'execution_rate',
          data: historicalData,
          createdAt: new Date(),
        });
      }
    }

    await this.db.collection('analytics').insertMany(analytics);
    console.log(`✅ Generated ${analytics.length} analytics records`);
    return analytics;
  }

  // Helper methods
  getPermissionsForRole(role) {
    const permissions = {
      admin: ['*'],
      manager: [
        'agents:read',
        'agents:write',
        'workflows:read',
        'workflows:write',
        'analytics:read',
      ],
      agent: ['agents:read', 'workflows:read', 'analytics:read'],
      viewer: ['agents:read', 'analytics:read'],
    };
    return permissions[role] || ['analytics:read'];
  }

  generateWorkflowSteps(type, agents) {
    const steps = [];

    switch (type) {
      case 'onboarding':
        steps.push(
          {
            type: 'agent',
            config: { agentId: agents.find(a => a.type === 'onboarding')?._id },
          },
          {
            type: 'notification',
            config: { type: 'email', template: 'welcome' },
          },
          { type: 'delay', config: { duration: 24 * 60 * 60 * 1000 } }, // 24 hours
          {
            type: 'agent',
            config: { agentId: agents.find(a => a.type === 'analytics')?._id },
          }
        );
        break;
      case 'marketing':
        steps.push(
          {
            type: 'condition',
            config: { field: 'lead_score', operator: 'gte', value: 70 },
          },
          {
            type: 'agent',
            config: {
              agentId: agents.find(a => a.type === 'lead_processing')?._id,
            },
          },
          {
            type: 'notification',
            config: { type: 'email', template: 'lead_qualified' },
          }
        );
        break;
      default:
        steps.push(
          { type: 'agent', config: { agentId: agents[0]?._id } },
          {
            type: 'notification',
            config: { type: 'email', template: 'default' },
          }
        );
    }

    return steps;
  }

  generateTriggers(type) {
    const triggers = {
      onboarding: ['user_registration', 'manual'],
      marketing: ['new_lead', 'lead_activity', 'schedule'],
      operations: ['order_created', 'inventory_low', 'schedule'],
      support: ['ticket_created', 'ticket_updated', 'manual'],
    };

    return triggers[type] || ['manual'];
  }

  // Generate portal-specific data
  async generatePortalData(organizations) {
    const customers = [];
    const dataSources = [];

    // Create portal test customer
    const portalCustomer = {
      _id: new ObjectId(),
      name: 'Portal Test Customer',
      email: 'portal@example.com',
      company: 'Portal Test Corp',
      phone: '+1-555-123-4567',
      industry: 'Technology',
      businessSize: 'medium',
      primaryUseCase: 'Test customer portal functionality',
      currentAutomationLevel: 'basic',
      plan: 'pro',
      status: 'active',
      billingCycle: 'monthly',
      projectTimeline: '1 month',
      budget: '$10k-25k',
      successMetrics: 'Improved efficiency and cost reduction',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    customers.push(portalCustomer);

    // Create enhanced agents for portal
    const portalAgents = [
      {
        _id: new ObjectId(),
        name: 'Facebook Group Scraper',
        key: 'fb-scraper',
        description: 'Scrapes public Facebook groups for lead generation',
        status: 'ready',
        icon: '📘',
        tags: ['scraping', 'social-media', 'lead-generation'],
        capabilities: ['data-extraction', 'api-integration', 'scheduling'],
        pricing: { model: 'per_run', rate: 0.05 },
        isActive: true,
        schedule: 'weekly',
        dependencies: ['apify', 'facebook'],
        successRate: 95,
        avgDuration: 45,
        costEst: 2.5,
        roi: 3.2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Email Automation Agent',
        key: 'email-automation',
        description: 'Automates email campaigns and follow-ups',
        status: 'ready',
        icon: '📧',
        tags: ['email', 'automation', 'marketing'],
        capabilities: ['email-sending', 'template-management', 'analytics'],
        pricing: { model: 'per_month', rate: 10 },
        isActive: true,
        schedule: 'daily',
        dependencies: ['stripe', 'mongodb'],
        successRate: 98,
        avgDuration: 12,
        costEst: 0.5,
        roi: 4.1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Data Processing Pipeline',
        key: 'data-pipeline',
        description: 'Processes and cleans customer data',
        status: 'provisioning',
        icon: '🔄',
        tags: ['data-processing', 'pipeline', 'etl'],
        capabilities: ['data-transformation', 'validation', 'export'],
        pricing: { model: 'per_run', rate: 0.02 },
        isActive: false,
        schedule: 'manual',
        dependencies: ['mongodb', 'n8n'],
        progress: {
          current: 3,
          total: 5,
          message: 'Setting up data validation rules',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create data sources for portal
    const portalDataSources = [
      {
        _id: new ObjectId(),
        name: 'Apify Web Scraping',
        type: 'apify',
        status: 'connected',
        icon: '🤖',
        credentials: {
          apiKey: 'apify_api_QfRR0XzZtbGi14p8xaTMc2Fg44a9aW0W5CQM',
          isConfigured: true,
        },
        setupInstructions: {
          title: 'Set up Apify for Web Scraping',
          steps: [
            'Visit Apify and create a free account',
            'Get your API token from Account Settings',
            'Start with the free plan (1,000 units/month)',
            'Paste your API token below to connect',
          ],
          pricingUrl: 'https://apify.com/pricing',
          signupUrl: 'https://console.apify.com/sign-up',
        },
        lastSync: new Date(),
        organizationId: portalCustomer._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'n8n Workflow Automation',
        type: 'n8n',
        status: 'disconnected',
        icon: '⚡',
        credentials: {
          apiKey: '',
          endpoint: '',
          isConfigured: false,
        },
        setupInstructions: {
          title: 'Set up n8n Cloud for Automation',
          steps: [
            'Sign up for n8n Cloud (free tier available)',
            'Create a new workspace',
            'Get your API key from Settings > API',
            'Enter your n8n Cloud URL and API key below',
          ],
          pricingUrl: 'https://n8n.io/pricing/',
          signupUrl: 'https://cloud.n8n.io/signup',
        },
        organizationId: portalCustomer._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
            name: 'MongoDB Database',
    type: 'mongodb',
        status: 'connected',
        icon: '📊',
        credentials: {
          apiKey: '***hidden***',
          isConfigured: true,
        },
        lastSync: new Date(Date.now() - 5 * 60 * 1000),
        organizationId: portalCustomer._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: 'Stripe Payments',
        type: 'stripe',
        status: 'connected',
        icon: '💳',
        credentials: {
          apiKey: '***hidden***',
          isConfigured: true,
        },
        lastSync: new Date(Date.now() - 2 * 60 * 1000),
        organizationId: portalCustomer._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    dataSources.push(...portalDataSources);

    // Insert portal data
    if (customers.length > 0) {
      await this.db.collection('customers').insertMany(customers);
    }

    if (portalAgents.length > 0) {
      await this.db.collection('agents').insertMany(portalAgents);
    }

    if (dataSources.length > 0) {
      await this.db.collection('datasources').insertMany(dataSources);
    }

    return { customers, dataSources };
  }

  // Main population method
  async populate() {
    try {
      console.log('🚀 Starting data population...');

      await this.connect();
      await this.clearData();

      const organizations = await this.generateOrganizations();
      const users = await this.generateUsers(organizations);
      const agents = await this.generateAgents(organizations);
      const workflows = await this.generateWorkflows(organizations, agents);
      const analytics = await this.generateAnalytics(
        organizations,
        agents,
        workflows
      );

      // Generate portal-specific data
      const portalData = await this.generatePortalData(organizations);

      console.log('\n🎉 Data population completed successfully!');
      console.log(`📊 Generated:`);
      console.log(`   - ${organizations.length} organizations`);
      console.log(`   - ${users.length} users`);
      console.log(`   - ${agents.length} agents`);
      console.log(`   - ${workflows.length} workflows`);
      console.log(`   - ${analytics.length} analytics records`);
      console.log(`   - ${portalData.customers.length} portal customers`);
      console.log(`   - ${portalData.dataSources.length} data sources`);

      console.log('\n🔑 Default login credentials:');
      console.log(`   Email: admin@rensto.com`);
      console.log(`   Password: admin123`);
      console.log(`   Portal Customer: portal@example.com`);
    } catch (error) {
      console.error('❌ Data population failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const populator = new DataPopulator();

  try {
    await populator.populate();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DataPopulator, CONFIG, ORGANIZATION_TEMPLATES };
