#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableManualSetupGuide {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'manual_setup_required',
            bases: [],
            setupInstructions: {},
            sampleData: {}
        };
    }

    async generateSetupGuide() {
        console.log('📋 AIRTABLE MANUAL SETUP GUIDE');
        console.log('===============================');

        try {
            // Step 1: List all available bases
            await this.listAllBases();

            // Step 2: Generate setup instructions
            await this.generateInstructions();

            // Step 3: Create sample data
            await this.createSampleData();

            // Step 4: Save guide
            await this.saveGuide();

            console.log('\n✅ AIRTABLE MANUAL SETUP GUIDE GENERATED!');
            console.log('📖 Check the generated files for complete setup instructions');

        } catch (error) {
            console.error('❌ Guide generation failed:', error.message);
        }
    }

    async listAllBases() {
        console.log('\n📊 Listing all available bases...');

        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases`, {
                headers: this.headers
            });

            const bases = response.data.bases || [];
            console.log(`  ✅ Found ${bases.length} bases in workspace:`);

            bases.forEach(base => {
                console.log(`    - ${base.name} (${base.id}) - ${base.permissionLevel} access`);
                this.results.bases.push({
                    id: base.id,
                    name: base.name,
                    permissionLevel: base.permissionLevel
                });
            });

        } catch (error) {
            console.error(`  ❌ Failed to list bases: ${error.message}`);
        }
    }

    async generateInstructions() {
        console.log('\n📝 Generating setup instructions...');

        this.results.setupInstructions = {
            recommendedBase: 'appQijHhqqP4z6wGe', // Rensto base
            steps: [
                {
                    step: 1,
                    title: 'Create Business Tables',
                    description: 'Manually create the following tables in your Airtable base',
                    tables: [
                        {
                            name: 'Customers',
                            description: 'Customer information and profiles',
                            fields: [
                                { name: 'Name', type: 'Single line text' },
                                { name: 'Email', type: 'Email' },
                                { name: 'Phone', type: 'Phone number' },
                                { name: 'Company', type: 'Single line text' },
                                { name: 'Status', type: 'Single select', options: ['Active', 'Inactive', 'Prospect', 'Lead'] },
                                { name: 'Notes', type: 'Long text' },
                                { name: 'Created Date', type: 'Date' }
                            ]
                        },
                        {
                            name: 'Projects',
                            description: 'Project management and tracking',
                            fields: [
                                { name: 'Project Name', type: 'Single line text' },
                                { name: 'Customer', type: 'Single line text' },
                                { name: 'Status', type: 'Single select', options: ['Planning', 'In Progress', 'Completed', 'On Hold'] },
                                { name: 'Start Date', type: 'Date' },
                                { name: 'End Date', type: 'Date' },
                                { name: 'Budget', type: 'Currency' },
                                { name: 'Description', type: 'Long text' },
                                { name: 'Priority', type: 'Single select', options: ['Low', 'Medium', 'High', 'Critical'] }
                            ]
                        },
                        {
                            name: 'Invoices',
                            description: 'Financial invoice tracking',
                            fields: [
                                { name: 'Invoice Number', type: 'Single line text' },
                                { name: 'Customer', type: 'Single line text' },
                                { name: 'Project', type: 'Single line text' },
                                { name: 'Amount', type: 'Currency' },
                                { name: 'Status', type: 'Single select', options: ['Draft', 'Sent', 'Paid', 'Overdue'] },
                                { name: 'Issue Date', type: 'Date' },
                                { name: 'Due Date', type: 'Date' },
                                { name: 'Notes', type: 'Long text' }
                            ]
                        },
                        {
                            name: 'Tasks',
                            description: 'Task management and tracking',
                            fields: [
                                { name: 'Task Name', type: 'Single line text' },
                                { name: 'Project', type: 'Single line text' },
                                { name: 'Assigned To', type: 'Single line text' },
                                { name: 'Status', type: 'Single select', options: ['To Do', 'In Progress', 'Review', 'Done'] },
                                { name: 'Priority', type: 'Single select', options: ['Low', 'Medium', 'High', 'Critical'] },
                                { name: 'Due Date', type: 'Date' },
                                { name: 'Description', type: 'Long text' }
                            ]
                        }
                    ]
                },
                {
                    step: 2,
                    title: 'Set Up Views',
                    description: 'Create useful views for each table',
                    views: [
                        { table: 'Customers', view: 'All Customers', filter: 'None' },
                        { table: 'Customers', view: 'Active Customers', filter: 'Status = Active' },
                        { table: 'Projects', view: 'All Projects', filter: 'None' },
                        { table: 'Projects', view: 'Active Projects', filter: 'Status = In Progress' },
                        { table: 'Invoices', view: 'All Invoices', filter: 'None' },
                        { table: 'Invoices', view: 'Unpaid Invoices', filter: 'Status = Sent' },
                        { table: 'Tasks', view: 'All Tasks', filter: 'None' },
                        { table: 'Tasks', view: 'My Tasks', filter: 'Assigned To = Current User' }
                    ]
                },
                {
                    step: 3,
                    title: 'Create Relationships',
                    description: 'Set up linked record fields to connect tables',
                    relationships: [
                        { from: 'Projects', field: 'Customer', to: 'Customers', field: 'Name' },
                        { from: 'Invoices', field: 'Customer', to: 'Customers', field: 'Name' },
                        { from: 'Invoices', field: 'Project', to: 'Projects', field: 'Project Name' },
                        { from: 'Tasks', field: 'Project', to: 'Projects', field: 'Project Name' }
                    ]
                }
            ]
        };

        console.log('  ✅ Setup instructions generated');
    }

    async createSampleData() {
        console.log('\n📊 Creating sample data templates...');

        this.results.sampleData = {
            customers: [
                {
                    Name: 'Ben Ginati',
                    Email: 'ben@ginati.com',
                    Phone: '+1-555-0123',
                    Company: 'Ginati Enterprises',
                    Status: 'Active',
                    Notes: 'Podcast and content creation client',
                    'Created Date': '2025-01-15'
                },
                {
                    Name: 'Shelly Mizrahi',
                    Email: 'shelly@mizrahi.com',
                    Phone: '+1-555-0456',
                    Company: 'Mizrahi Insurance',
                    Status: 'Active',
                    Notes: 'Insurance business automation client',
                    'Created Date': '2025-02-20'
                }
            ],
            projects: [
                {
                    'Project Name': 'Ben Ginati Podcast Automation',
                    Customer: 'Ben Ginati',
                    Status: 'In Progress',
                    'Start Date': '2025-01-15',
                    'End Date': '2025-06-30',
                    Budget: 15000,
                    Description: 'Automated podcast content creation and distribution system',
                    Priority: 'High'
                },
                {
                    'Project Name': 'Shelly Mizrahi Insurance CRM',
                    Customer: 'Shelly Mizrahi',
                    Status: 'Planning',
                    'Start Date': '2025-02-20',
                    'End Date': '2025-08-31',
                    Budget: 25000,
                    Description: 'Customer relationship management system for insurance business',
                    Priority: 'Medium'
                }
            ],
            invoices: [
                {
                    'Invoice Number': 'INV-2025-001',
                    Customer: 'Ben Ginati',
                    Project: 'Ben Ginati Podcast Automation',
                    Amount: 5000,
                    Status: 'Paid',
                    'Issue Date': '2025-01-15',
                    'Due Date': '2025-02-15',
                    Notes: 'Initial setup and configuration'
                },
                {
                    'Invoice Number': 'INV-2025-002',
                    Customer: 'Shelly Mizrahi',
                    Project: 'Shelly Mizrahi Insurance CRM',
                    Amount: 7500,
                    Status: 'Sent',
                    'Issue Date': '2025-02-20',
                    'Due Date': '2025-03-20',
                    Notes: 'Project planning and requirements analysis'
                }
            ],
            tasks: [
                {
                    'Task Name': 'Set up podcast automation workflow',
                    Project: 'Ben Ginati Podcast Automation',
                    'Assigned To': 'Development Team',
                    Status: 'In Progress',
                    Priority: 'High',
                    'Due Date': '2025-02-15',
                    Description: 'Configure n8n workflows for automated podcast content creation'
                },
                {
                    'Task Name': 'Design CRM interface',
                    Project: 'Shelly Mizrahi Insurance CRM',
                    'Assigned To': 'Design Team',
                    Status: 'To Do',
                    Priority: 'Medium',
                    'Due Date': '2025-03-15',
                    Description: 'Create user interface mockups for the insurance CRM system'
                }
            ]
        };

        console.log('  ✅ Sample data templates created');
    }

    async saveGuide() {
        const timestamp = new Date().toISOString().split('T')[0];

        // Save main guide
        const guideFilename = `docs/airtable-migration/manual-setup-guide-${timestamp}.json`;
        await fs.mkdir(path.dirname(guideFilename), { recursive: true });
        await fs.writeFile(guideFilename, JSON.stringify(this.results, null, 2));

        // Save markdown guide
        const markdownFilename = `docs/airtable-migration/manual-setup-guide-${timestamp}.md`;
        const markdownContent = this.generateMarkdownGuide();
        await fs.writeFile(markdownFilename, markdownContent);

        console.log(`📁 Guide saved to: ${guideFilename}`);
        console.log(`📄 Markdown guide saved to: ${markdownFilename}`);
    }

    generateMarkdownGuide() {
        return `# Airtable Business Data Setup Guide

## Overview
This guide will help you set up the Rensto business data structure in Airtable manually, since the API doesn't support programmatic table creation.

## Available Bases
${this.results.bases.map(base => `- **${base.name}** (${base.id}) - ${base.permissionLevel} access`).join('\n')}

## Recommended Base
Use the **Rensto** base (${this.results.setupInstructions.recommendedBase}) for the business data structure.

## Setup Steps

### Step 1: Create Business Tables

#### 1.1 Customers Table
Create a new table called "Customers" with the following fields:
- **Name** (Single line text)
- **Email** (Email)
- **Phone** (Phone number)
- **Company** (Single line text)
- **Status** (Single select: Active, Inactive, Prospect, Lead)
- **Notes** (Long text)
- **Created Date** (Date)

#### 1.2 Projects Table
Create a new table called "Projects" with the following fields:
- **Project Name** (Single line text)
- **Customer** (Single line text)
- **Status** (Single select: Planning, In Progress, Completed, On Hold)
- **Start Date** (Date)
- **End Date** (Date)
- **Budget** (Currency)
- **Description** (Long text)
- **Priority** (Single select: Low, Medium, High, Critical)

#### 1.3 Invoices Table
Create a new table called "Invoices" with the following fields:
- **Invoice Number** (Single line text)
- **Customer** (Single line text)
- **Project** (Single line text)
- **Amount** (Currency)
- **Status** (Single select: Draft, Sent, Paid, Overdue)
- **Issue Date** (Date)
- **Due Date** (Date)
- **Notes** (Long text)

#### 1.4 Tasks Table
Create a new table called "Tasks" with the following fields:
- **Task Name** (Single line text)
- **Project** (Single line text)
- **Assigned To** (Single line text)
- **Status** (Single select: To Do, In Progress, Review, Done)
- **Priority** (Single select: Low, Medium, High, Critical)
- **Due Date** (Date)
- **Description** (Long text)

### Step 2: Set Up Views

Create the following views for better organization:

#### Customers Views
- **All Customers** (no filter)
- **Active Customers** (filter: Status = Active)

#### Projects Views
- **All Projects** (no filter)
- **Active Projects** (filter: Status = In Progress)

#### Invoices Views
- **All Invoices** (no filter)
- **Unpaid Invoices** (filter: Status = Sent)

#### Tasks Views
- **All Tasks** (no filter)
- **My Tasks** (filter: Assigned To = Current User)

### Step 3: Create Relationships

Set up linked record fields to connect tables:
- Projects.Customer → Customers.Name
- Invoices.Customer → Customers.Name
- Invoices.Project → Projects.Project Name
- Tasks.Project → Projects.Project Name

## Sample Data

### Customers
\`\`\`json
${JSON.stringify(this.results.sampleData.customers, null, 2)}
\`\`\`

### Projects
\`\`\`json
${JSON.stringify(this.results.sampleData.projects, null, 2)}
\`\`\`

### Invoices
\`\`\`json
${JSON.stringify(this.results.sampleData.invoices, null, 2)}
\`\`\`

### Tasks
\`\`\`json
${JSON.stringify(this.results.sampleData.tasks, null, 2)}
\`\`\`

## Next Steps

1. Follow the setup steps above to create the table structure
2. Import the sample data to populate your tables
3. Set up automation workflows using the Airtable MCP server
4. Configure integrations with other business systems

## Airtable MCP Server

The Airtable MCP server is deployed and available at:
- **Webhook URL**: http://173.254.201.134:5679/webhook/mcp
- **Health Check**: http://173.254.201.134:5679/health

Use this server to automate data operations and integrate with other systems.

## Support

If you need help with the setup, refer to the Airtable documentation or contact the development team.
`;
    }
}

const guide = new AirtableManualSetupGuide();
guide.generateSetupGuide().catch(console.error);
