#!/usr/bin/env node

/**
 * ADVANCED DATA INTEGRATION WITHOUT LINKED TABLES
 * 
 * This script creates comprehensive data integration using:
 * - n8n workflows for data relationships
 * - Cross-table data aggregation
 * - Real-time data synchronization
 * - Business logic automation
 * - Instead of relying on Airtable's linked tables
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        bases: {
            original: 'appQijHhqqP4z6wGe',
            new: 'appqY1p53ge7UqxUO'
        }
    },
    n8n: {
        url: 'https://n8n.rensto.com',
        token: process.env.N8N_API_KEY || 'your-n8n-api-key'
    }
};

class AdvancedDataIntegration {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            workflows: {},
            dataRelationships: {},
            summary: {
                workflows: 0,
                relationships: 0,
                automations: 0
            }
        };
    }

    async createCustomerProjectRelationshipWorkflow() {
        console.log('\n🔗 Creating Customer-Project Relationship Workflow...');

        const workflow = {
            name: 'Customer-Project Data Integration',
            description: 'Creates relationships between customers and projects without linked tables',
            nodes: [
                {
                    type: 'airtable',
                    name: 'Get All Customers',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Customers',
                        operation: 'read'
                    }
                },
                {
                    type: 'airtable',
                    name: 'Get All Projects',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Projects',
                        operation: 'read'
                    }
                },
                {
                    type: 'code',
                    name: 'Match Customer-Project Relationships',
                    config: {
                        code: `
// Match customers with their projects
const customers = $('Get All Customers').all();
const projects = $('Get All Projects').all();

const relationships = [];

for (const customer of customers) {
    const customerProjects = projects.filter(project => 
        project.fields.Customer === customer.fields.Name
    );
    
    // Calculate customer metrics
    const totalProjects = customerProjects.length;
    const totalValue = customerProjects.reduce((sum, project) => 
        sum + (project.fields.Budget || 0), 0
    );
    const activeProjects = customerProjects.filter(project => 
        project.fields.Status === 'In Progress'
    ).length;
    
    // Create enhanced customer record
    const enhancedCustomer = {
        ...customer.fields,
        ProjectCount: totalProjects,
        TotalProjectValue: totalValue,
        ActiveProjects: activeProjects,
        CustomerType: totalValue > 1000 ? 'Premium' : 'Standard',
        Status: activeProjects > 0 ? 'Active' : 'Inactive'
    };
    
    relationships.push({
        customer: enhancedCustomer,
        projects: customerProjects,
        metrics: {
            totalProjects,
            totalValue,
            activeProjects
        }
    });
}

return relationships;
                        `
                    }
                },
                {
                    type: 'airtable',
                    name: 'Update Customer Metrics',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Customers',
                        operation: 'update',
                        data: '{{$json.customer}}'
                    }
                },
                {
                    type: 'webhook',
                    name: 'Trigger Dashboard Update',
                    config: {
                        url: 'https://rensto-dashboard.com/api/update-customer-metrics',
                        method: 'POST',
                        data: '{{$json}}'
                    }
                }
            ]
        };

        this.results.workflows.customerProjectRelationship = workflow;
        console.log('✅ Customer-Project relationship workflow created');

        return workflow;
    }

    async createProjectTaskIntegrationWorkflow() {
        console.log('\n🔗 Creating Project-Task Integration Workflow...');

        const workflow = {
            name: 'Project-Task Data Integration',
            description: 'Integrates project and task data for progress tracking',
            nodes: [
                {
                    type: 'airtable',
                    name: 'Get All Projects',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Projects',
                        operation: 'read'
                    }
                },
                {
                    type: 'airtable',
                    name: 'Get All Tasks',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Tasks',
                        operation: 'read'
                    }
                },
                {
                    type: 'code',
                    name: 'Calculate Project Progress',
                    config: {
                        code: `
// Calculate project progress and metrics
const projects = $('Get All Projects').all();
const tasks = $('Get All Tasks').all();

const projectProgress = [];

for (const project of projects) {
    const projectTasks = tasks.filter(task => 
        task.fields.Project === project.fields.Name
    );
    
    // Calculate progress metrics
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => 
        task.fields.Status === 'Done'
    ).length;
    const inProgressTasks = projectTasks.filter(task => 
        task.fields.Status === 'In Progress'
    ).length;
    
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Determine project health
    let projectHealth = 'Good';
    if (progressPercentage < 50) projectHealth = 'At Risk';
    if (progressPercentage < 25) projectHealth = 'Critical';
    if (progressPercentage >= 80) projectHealth = 'Excellent';
    
    // Create enhanced project record
    const enhancedProject = {
        ...project.fields,
        TaskCount: totalTasks,
        CompletedTasks: completedTasks,
        InProgressTasks: inProgressTasks,
        ProgressPercentage: progressPercentage,
        ProjectHealth: projectHealth,
        Status: progressPercentage === 100 ? 'Completed' : project.fields.Status
    };
    
    projectProgress.push({
        project: enhancedProject,
        tasks: projectTasks,
        metrics: {
            totalTasks,
            completedTasks,
            inProgressTasks,
            progressPercentage,
            projectHealth
        }
    });
}

return projectProgress;
                        `
                    }
                },
                {
                    type: 'airtable',
                    name: 'Update Project Progress',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Projects',
                        operation: 'update',
                        data: '{{$json.project}}'
                    }
                },
                {
                    type: 'email',
                    name: 'Send Progress Alerts',
                    config: {
                        to: '{{$json.project.Project Manager}}',
                        subject: 'Project Progress Update: {{$json.project.Name}}',
                        body: `
Project: \${{\$json.project.Name}}
Progress: \${{\$json.metrics.progressPercentage}}%
Health: \${{\$json.metrics.projectHealth}}
Tasks: \${{\$json.metrics.completedTasks}}/\${{\$json.metrics.totalTasks}} completed
                        `
                    }
                }
            ]
        };

        this.results.workflows.projectTaskIntegration = workflow;
        console.log('✅ Project-Task integration workflow created');

        return workflow;
    }

    async createInvoiceAutomationWorkflow() {
        console.log('\n🔗 Creating Invoice Automation Workflow...');

        const workflow = {
            name: 'Invoice Automation & Integration',
            description: 'Automates invoice generation and integrates with project data',
            nodes: [
                {
                    type: 'airtable',
                    name: 'Monitor Project Milestones',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Projects',
                        operation: 'watch',
                        filter: { Status: 'Completed' }
                    }
                },
                {
                    type: 'airtable',
                    name: 'Get Customer Data',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Customers',
                        operation: 'read',
                        filter: { Name: '{{$json.Customer}}' }
                    }
                },
                {
                    type: 'code',
                    name: 'Generate Invoice Data',
                    config: {
                        code: `
// Generate invoice data from project completion
const project = $input.first();
const customer = $('Get Customer Data').first();

// Generate invoice number
const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);

// Calculate invoice amount (can be based on project budget or milestones)
const invoiceAmount = project.fields.Budget || 0;

// Create invoice record
const invoice = {
    Name: \`Invoice for \${project.fields.Name}\`,
    'Invoice Number': invoiceNumber,
    Customer: customer.fields.Name,
    Project: project.fields.Name,
    Amount: invoiceAmount,
    Status: 'Draft',
    'Due Date': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    Notes: \`Automatically generated for completed project: \${project.fields.Name}\`
};

return {
    invoice,
    customer: customer.fields,
    project: project.fields
};
                        `
                    }
                },
                {
                    type: 'airtable',
                    name: 'Create Invoice',
                    config: {
                        baseId: config.airtable.bases.original,
                        tableName: 'Invoices',
                        operation: 'create',
                        data: '{{$json.invoice}}'
                    }
                },
                {
                    type: 'email',
                    name: 'Send Invoice Email',
                    config: {
                        to: '{{$json.customer.Email}}',
                        subject: 'Invoice Generated: {{$json.invoice.Name}}',
                        body: `
Dear \${{\$json.customer.Name}},

Your invoice has been generated for the completed project: \${{\$json.project.Name}}

Invoice Number: \${{\$json.invoice.Invoice Number}}
Amount: $\${{\$json.invoice.Amount}}
Due Date: \${{\$json.invoice.Due Date}}

Thank you for your business!

Best regards,
Rensto Team
                        `
                    }
                }
            ]
        };

        this.results.workflows.invoiceAutomation = workflow;
        console.log('✅ Invoice automation workflow created');

        return workflow;
    }

    async createRealTimeDataSyncWorkflow() {
        console.log('\n🔗 Creating Real-Time Data Sync Workflow...');

        const workflow = {
            name: 'Real-Time Data Synchronization',
            description: 'Synchronizes data across all tables in real-time',
            nodes: [
                {
                    type: 'webhook',
                    name: 'Data Change Trigger',
                    config: {
                        path: '/airtable-webhook',
                        method: 'POST'
                    }
                },
                {
                    type: 'code',
                    name: 'Process Data Change',
                    config: {
                        code: `
// Process data changes and trigger related updates
const change = $input.first();

// Determine what changed and what needs to be updated
const tableName = change.table;
const recordId = change.recordId;
const fields = change.fields;

let updates = [];

switch (tableName) {
    case 'Customers':
        // When customer changes, update related projects
        updates.push({
            table: 'Projects',
            filter: { Customer: fields.Name },
            updates: { 'Customer Email': fields.Email, 'Customer Phone': fields.Phone }
        });
        break;
        
    case 'Projects':
        // When project changes, update related tasks
        updates.push({
            table: 'Tasks',
            filter: { Project: fields.Name },
            updates: { 'Project Status': fields.Status, 'Project Priority': fields.Priority }
        });
        break;
        
    case 'Tasks':
        // When task changes, update project progress
        updates.push({
            table: 'Projects',
            filter: { Name: fields.Project },
            updates: { 'Last Task Update': new Date().toISOString() }
        });
        break;
        
    case 'Invoices':
        // When invoice changes, update customer payment status
        updates.push({
            table: 'Customers',
            filter: { Name: fields.Customer },
            updates: { 'Last Payment': fields.Status === 'Paid' ? new Date().toISOString() : null }
        });
        break;
}

return {
    change,
    updates,
    timestamp: new Date().toISOString()
};
                        `
                    }
                },
                {
                    type: 'airtable',
                    name: 'Update Related Records',
                    config: {
                        baseId: config.airtable.bases.original,
                        operation: 'update',
                        data: '{{$json.updates}}'
                    }
                },
                {
                    type: 'webhook',
                    name: 'Notify Dashboard',
                    config: {
                        url: 'https://rensto-dashboard.com/api/data-updated',
                        method: 'POST',
                        data: '{{$json}}'
                    }
                }
            ]
        };

        this.results.workflows.realTimeSync = workflow;
        console.log('✅ Real-time data sync workflow created');

        return workflow;
    }

    async createBusinessIntelligenceWorkflow() {
        console.log('\n🔗 Creating Business Intelligence Workflow...');

        const workflow = {
            name: 'Business Intelligence & Analytics',
            description: 'Generates business intelligence from integrated data',
            nodes: [
                {
                    type: 'cron',
                    name: 'Daily Analytics Trigger',
                    config: {
                        cronExpression: '0 9 * * *' // Daily at 9 AM
                    }
                },
                {
                    type: 'airtable',
                    name: 'Get All Data',
                    config: {
                        baseId: config.airtable.bases.original,
                        tables: ['Customers', 'Projects', 'Tasks', 'Invoices']
                    }
                },
                {
                    type: 'code',
                    name: 'Generate Business Intelligence',
                    config: {
                        code: `
// Generate comprehensive business intelligence
const customers = $('Get All Data').filter(table => table.name === 'Customers').all();
const projects = $('Get All Data').filter(table => table.name === 'Projects').all();
const tasks = $('Get All Data').filter(table => table.name === 'Tasks').all();
const invoices = $('Get All Data').filter(table => table.name === 'Invoices').all();

// Calculate key metrics
const totalCustomers = customers.length;
const activeCustomers = customers.filter(c => c.fields.Status === 'Active').length;
const totalProjects = projects.length;
const completedProjects = projects.filter(p => p.fields.Status === 'Completed').length;
const totalRevenue = invoices.filter(i => i.fields.Status === 'Paid')
    .reduce((sum, inv) => sum + (inv.fields.Amount || 0), 0);
const pendingRevenue = invoices.filter(i => i.fields.Status === 'Sent')
    .reduce((sum, inv) => sum + (inv.fields.Amount || 0), 0);

// Calculate project success rate
const projectSuccessRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

// Calculate average project value
const averageProjectValue = totalProjects > 0 ? 
    projects.reduce((sum, p) => sum + (p.fields.Budget || 0), 0) / totalProjects : 0;

// Generate insights
const insights = [];

if (projectSuccessRate < 80) {
    insights.push('Project success rate below target - review project management processes');
}

if (pendingRevenue > totalRevenue * 0.3) {
    insights.push('High pending revenue - focus on invoice collection');
}

if (activeCustomers < totalCustomers * 0.7) {
    insights.push('Low customer activation rate - review customer success processes');
}

// Create business intelligence report
const biReport = {
    date: new Date().toISOString(),
    metrics: {
        totalCustomers,
        activeCustomers,
        customerActivationRate: (activeCustomers / totalCustomers) * 100,
        totalProjects,
        completedProjects,
        projectSuccessRate,
        totalRevenue,
        pendingRevenue,
        averageProjectValue
    },
    insights,
    recommendations: [
        'Implement automated project tracking',
        'Set up invoice reminders',
        'Create customer success workflows',
        'Monitor project health metrics'
    ]
};

return biReport;
                        `
                    }
                },
                {
                    type: 'email',
                    name: 'Send Daily Report',
                    config: {
                        to: 'shaifriedman@gmail.com',
                        subject: 'Daily Business Intelligence Report',
                        body: `
# Daily Business Intelligence Report

## Key Metrics
- Total Customers: \${{\$json.metrics.totalCustomers}}
- Active Customers: \${{\$json.metrics.activeCustomers}} (\${{\$json.metrics.customerActivationRate}}%)
- Total Projects: \${{\$json.metrics.totalProjects}}
- Completed Projects: \${{\$json.metrics.completedProjects}} (\${{\$json.metrics.projectSuccessRate}}%)
- Total Revenue: $\${{\$json.metrics.totalRevenue}}
- Pending Revenue: $\${{\$json.metrics.pendingRevenue}}
- Average Project Value: $\${{\$json.metrics.averageProjectValue}}

## Insights
\${{\#each \$json.insights}}
- \${{\$this}}
\${{\/each}}

## Recommendations
\${{\#each \$json.recommendations}}
- \${{\$this}}
\${{\/each}}
                        `
                    }
                },
                {
                    type: 'webhook',
                    name: 'Update Dashboard',
                    config: {
                        url: 'https://rensto-dashboard.com/api/update-bi',
                        method: 'POST',
                        data: '{{$json}}'
                    }
                }
            ]
        };

        this.results.workflows.businessIntelligence = workflow;
        console.log('✅ Business intelligence workflow created');

        return workflow;
    }

    async executeAdvancedIntegration() {
        console.log('\n🚀 EXECUTING ADVANCED DATA INTEGRATION...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);

        try {
            // Create all advanced integration workflows
            console.log('\n🎯 PHASE 1: CREATING ADVANCED WORKFLOWS...');
            await this.createCustomerProjectRelationshipWorkflow();
            await this.createProjectTaskIntegrationWorkflow();
            await this.createInvoiceAutomationWorkflow();
            await this.createRealTimeDataSyncWorkflow();
            await this.createBusinessIntelligenceWorkflow();

            // Save results
            console.log('\n💾 SAVING RESULTS...');
            const resultsPath = path.join(__dirname, '../docs/advanced-data-integration-workflows.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));

            // Generate summary
            this.generateIntegrationSummary();

            console.log('\n🎉 ADVANCED DATA INTEGRATION COMPLETE!');
            console.log(`📊 Summary: ${Object.keys(this.results.workflows).length} workflows created`);
            console.log(`🔗 Relationships: ${this.results.summary.relationships} data relationships defined`);
            console.log(`📄 Results saved to: ${resultsPath}`);

            return this.results;

        } catch (error) {
            console.error('\n❌ Advanced integration failed:', error.message);
            return null;
        }
    }

    generateIntegrationSummary() {
        console.log('\n📋 ADVANCED DATA INTEGRATION SUMMARY:');
        console.log('\n🔧 WORKFLOWS CREATED:');

        for (const [name, workflow] of Object.entries(this.results.workflows)) {
            console.log(`📊 ${name.toUpperCase()}: ${workflow.description}`);
        }

        console.log('\n🎯 KEY FEATURES:');
        console.log('✅ Customer-Project relationship tracking without linked tables');
        console.log('✅ Real-time project progress calculation');
        console.log('✅ Automated invoice generation');
        console.log('✅ Real-time data synchronization');
        console.log('✅ Business intelligence and analytics');

        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Deploy workflows to n8n');
        console.log('2. Configure webhooks for real-time sync');
        console.log('3. Set up dashboard for business intelligence');
        console.log('4. Test all automation workflows');
        console.log('5. Monitor system performance');
    }
}

// Run the advanced integration
async function main() {
    const integrator = new AdvancedDataIntegration();
    const results = await integrator.executeAdvancedIntegration();
    process.exit(results ? 0 : 1);
}

main().catch(console.error);
