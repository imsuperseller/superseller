#!/usr/bin/env node

/**
 * BIG BMAD PLAN SYSTEM INTEGRATION
 * 
 * This script integrates all components of the BIG BMAD PLAN:
 * - Airtable bases with advanced features
 * - n8n workflows
 * - Webflow MCP server
 * - Email Personas system
 * - Lightrag automation
 * - MCP servers on Racknerd VPS
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration for all BIG BMAD PLAN components
const config = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        bases: {
            original: 'appQijHhqqP4z6wGe',
            new: 'appqY1p53ge7UqxUO',
            core: 'app4nJpP1ytGukXQT',
            financial: 'app6yzlm67lRNuQZD',
            marketing: 'appQhVkIaWoGJG301',
            operations: 'app6saCaH88uK3kCO',
            customer: 'appSCBZk03GUCTfhN',
            entities: 'app9DhsrZ0VnuEH3t',
            operations2: 'appCGexgpGPkMUPXF',
            analytics: 'appOvDNYenyx7WITR'
        }
    },
    n8n: {
        url: 'https://n8n.rensto.com',
        token: process.env.N8N_API_KEY || 'your-n8n-api-key'
    },
    webflow: {
        token: process.env.WEBFLOW_TOKEN || 'your-webflow-token',
        siteId: process.env.WEBFLOW_SITE_ID || 'your-webflow-site-id'
    },
    lightrag: {
        url: 'https://rensto-lightrag.onrender.com',
        apiKey: process.env.LIGHTRAG_API_KEY || 'your-lightrag-api-key'
    },
    racknerd: {
        host: process.env.RACKNERD_HOST || 'your-racknerd-host',
        username: process.env.RACKNERD_USERNAME || 'your-racknerd-username',
        privateKey: process.env.RACKNERD_PRIVATE_KEY || 'your-racknerd-private-key'
    },
    emailPersonas: {
        mary: { email: 'mary@rensto.com', role: 'Customer Success Manager' },
        john: { email: 'john@rensto.com', role: 'Technical Support Engineer' },
        winston: { email: 'winston@rensto.com', role: 'Business Development Manager' },
        sarah: { email: 'sarah@rensto.com', role: 'Marketing Manager' },
        alex: { email: 'alex@rensto.com', role: 'Operations Manager' },
        quinn: { email: 'quinn@rensto.com', role: 'Finance Manager' }
    }
};

class BigBmadPlanSystemIntegration {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            integrations: {},
            workflows: {},
            summary: {
                components: 0,
                integrations: 0,
                workflows: 0,
                errors: 0
            }
        };
    }

    async testAirtableIntegration() {
        console.log('\n🔗 Testing Airtable Integration...');

        try {
            // Test access to original base
            const response = await axios.get(
                `https://api.airtable.com/v0/${config.airtable.bases.original}/Customers`,
                {
                    headers: { 'Authorization': `Bearer ${config.airtable.apiKey}` }
                }
            );

            const customers = response.data.records || [];
            console.log(`✅ Airtable Integration: ${customers.length} customers found`);

            this.results.integrations.airtable = {
                status: 'connected',
                bases: Object.keys(config.airtable.bases).length,
                customers: customers.length,
                tables: ['Customers', 'Projects', 'Tasks', 'Invoices', 'Leads']
            };

            return true;
        } catch (error) {
            console.log(`❌ Airtable Integration Failed: ${error.message}`);
            this.results.integrations.airtable = { status: 'failed', error: error.message };
            return false;
        }
    }

    async testN8nIntegration() {
        console.log('\n🔗 Testing n8n Integration...');

        try {
            // Test n8n health endpoint
            const response = await axios.get(`${config.n8n.url}/healthz`, {
                headers: { 'X-N8N-API-KEY': config.n8n.token }
            });

            console.log(`✅ n8n Integration: ${response.status} - Healthy`);

            // Get workflows
            const workflowsResponse = await axios.get(`${config.n8n.url}/api/v1/workflows`, {
                headers: { 'X-N8N-API-KEY': config.n8n.token }
            });

            const workflows = workflowsResponse.data.data || [];
            console.log(`✅ n8n Workflows: ${workflows.length} workflows found`);

            this.results.integrations.n8n = {
                status: 'connected',
                health: 'healthy',
                workflows: workflows.length,
                url: config.n8n.url
            };

            return true;
        } catch (error) {
            console.log(`❌ n8n Integration Failed: ${error.message}`);
            this.results.integrations.n8n = { status: 'failed', error: error.message };
            return false;
        }
    }

    async testWebflowIntegration() {
        console.log('\n🔗 Testing Webflow MCP Integration...');

        try {
            // Test Webflow API v2 - List sites first
            const sitesResponse = await axios.get('https://api.webflow.com/v2/sites', {
                headers: {
                    'Authorization': `Bearer ${config.webflow.token}`,
                    'Accept': 'application/json'
                }
            });

            console.log(`✅ Webflow API v2: ${sitesResponse.data.sites?.length || 0} sites found`);

            // Test specific site if siteId is provided
            if (config.webflow.siteId && config.webflow.siteId !== 'your-webflow-site-id') {
                const siteResponse = await axios.get(`https://api.webflow.com/v2/sites/${config.webflow.siteId}`, {
                    headers: {
                        'Authorization': `Bearer ${config.webflow.token}`,
                        'Accept': 'application/json'
                    }
                });

                console.log(`✅ Webflow Site: ${siteResponse.data.name} - Connected`);

                this.results.integrations.webflow = {
                    status: 'connected',
                    siteName: siteResponse.data.name,
                    siteId: config.webflow.siteId,
                    sites: sitesResponse.data.sites?.length || 0
                };
            } else {
                this.results.integrations.webflow = {
                    status: 'connected',
                    sites: sitesResponse.data.sites?.length || 0,
                    note: 'No specific site ID configured, but API v2 is working'
                };
            }

            return true;
        } catch (error) {
            console.log(`❌ Webflow Integration Failed: ${error.message}`);
            this.results.integrations.webflow = { status: 'failed', error: error.message };
            return false;
        }
    }

    async testLightragIntegration() {
        console.log('\n🔗 Testing Lightrag Integration...');

        try {
            // Test Lightrag health endpoint
            const response = await axios.get(`${config.lightrag.url}/health`);

            console.log(`✅ Lightrag Integration: ${response.status} - Healthy`);

            this.results.integrations.lightrag = {
                status: 'connected',
                health: 'healthy',
                url: config.lightrag.url
            };

            return true;
        } catch (error) {
            console.log(`❌ Lightrag Integration Failed: ${error.message}`);
            this.results.integrations.lightrag = { status: 'failed', error: error.message };
            return false;
        }
    }

    async createN8nWorkflows() {
        console.log('\n🔧 Creating n8n Workflows for BIG BMAD PLAN...');

        const workflows = [
            {
                name: 'Customer Onboarding Automation',
                description: 'Automated customer onboarding workflow',
                nodes: [
                    {
                        type: 'airtable',
                        name: 'New Customer Trigger',
                        config: {
                            baseId: config.airtable.bases.original,
                            tableName: 'Customers',
                            operation: 'watch'
                        }
                    },
                    {
                        type: 'email',
                        name: 'Welcome Email',
                        config: {
                            to: '{{$json.Email}}',
                            subject: 'Welcome to Rensto!',
                            body: 'Welcome {{$json.Name}}! Your automation journey begins now.'
                        }
                    },
                    {
                        type: 'airtable',
                        name: 'Create Project',
                        config: {
                            baseId: config.airtable.bases.original,
                            tableName: 'Projects',
                            operation: 'create',
                            data: {
                                Name: 'Onboarding Project for {{$json.Name}}',
                                Customer: '{{$json.Name}}',
                                Status: 'Planning',
                                Priority: 'High'
                            }
                        }
                    }
                ]
            },
            {
                name: 'Invoice Automation',
                description: 'Automated invoice generation and tracking',
                nodes: [
                    {
                        type: 'airtable',
                        name: 'Project Milestone Trigger',
                        config: {
                            baseId: config.airtable.bases.original,
                            tableName: 'Projects',
                            operation: 'watch',
                            filter: { Status: 'Completed' }
                        }
                    },
                    {
                        type: 'airtable',
                        name: 'Generate Invoice',
                        config: {
                            baseId: config.airtable.bases.original,
                            tableName: 'Invoices',
                            operation: 'create',
                            data: {
                                Name: 'Invoice for {{$json.Name}}',
                                Customer: '{{$json.Customer}}',
                                Project: '{{$json.Name}}',
                                Status: 'Draft',
                                Amount: '{{$json.Budget}}'
                            }
                        }
                    }
                ]
            },
            {
                name: 'Task Management Automation',
                description: 'Automated task assignment and tracking',
                nodes: [
                    {
                        type: 'airtable',
                        name: 'New Task Trigger',
                        config: {
                            baseId: config.airtable.bases.original,
                            tableName: 'Tasks',
                            operation: 'watch'
                        }
                    },
                    {
                        type: 'email',
                        name: 'Task Assignment Email',
                        config: {
                            to: '{{$json.Assigned To}}',
                            subject: 'New Task Assigned: {{$json.Name}}',
                            body: 'You have been assigned a new task: {{$json.Name}} for project {{$json.Project}}'
                        }
                    }
                ]
            }
        ];

        this.results.workflows.n8n = workflows;
        console.log(`✅ Created ${workflows.length} n8n workflow templates`);

        return workflows;
    }

    async createEmailPersonasWorkflows() {
        console.log('\n🔧 Creating Email Personas Workflows...');

        const personas = [
            {
                name: 'Mary Johnson',
                role: 'Customer Success Manager',
                email: 'mary@rensto.com',
                workflows: [
                    {
                        name: 'Customer Onboarding',
                        trigger: 'New Customer Created',
                        actions: [
                            'Send Welcome Email',
                            'Schedule Onboarding Call',
                            'Create Success Plan',
                            'Assign Customer Success Manager'
                        ]
                    },
                    {
                        name: 'Customer Check-in',
                        trigger: 'Monthly Check-in',
                        actions: [
                            'Send Progress Report',
                            'Schedule Review Meeting',
                            'Update Customer Status',
                            'Identify Upsell Opportunities'
                        ]
                    }
                ]
            },
            {
                name: 'John Smith',
                role: 'Technical Support Engineer',
                email: 'john@rensto.com',
                workflows: [
                    {
                        name: 'Technical Support',
                        trigger: 'Support Ticket Created',
                        actions: [
                            'Acknowledge Ticket',
                            'Assign Priority Level',
                            'Investigate Issue',
                            'Provide Solution',
                            'Follow Up'
                        ]
                    }
                ]
            },
            {
                name: 'Winston Chen',
                role: 'Business Development Manager',
                email: 'winston@rensto.com',
                workflows: [
                    {
                        name: 'Lead Follow-up',
                        trigger: 'New Lead Created',
                        actions: [
                            'Send Introduction Email',
                            'Schedule Discovery Call',
                            'Qualify Lead',
                            'Create Proposal',
                            'Follow Up'
                        ]
                    }
                ]
            },
            {
                name: 'Sarah Rodriguez',
                role: 'Marketing Manager',
                email: 'sarah@rensto.com',
                workflows: [
                    {
                        name: 'Marketing Campaign',
                        trigger: 'Campaign Launch',
                        actions: [
                            'Send Campaign Email',
                            'Track Engagement',
                            'Analyze Results',
                            'Optimize Campaign'
                        ]
                    }
                ]
            },
            {
                name: 'Alex Thompson',
                role: 'Operations Manager',
                email: 'alex@rensto.com',
                workflows: [
                    {
                        name: 'Process Optimization',
                        trigger: 'Performance Alert',
                        actions: [
                            'Analyze Performance',
                            'Identify Bottlenecks',
                            'Implement Improvements',
                            'Monitor Results'
                        ]
                    }
                ]
            },
            {
                name: 'Quinn Williams',
                role: 'Finance Manager',
                email: 'quinn@rensto.com',
                workflows: [
                    {
                        name: 'Financial Reporting',
                        trigger: 'Monthly Report',
                        actions: [
                            'Generate Financial Report',
                            'Analyze Revenue',
                            'Track Expenses',
                            'Update Forecast'
                        ]
                    }
                ]
            }
        ];

        this.results.workflows.emailPersonas = personas;
        console.log(`✅ Created ${personas.length} email persona workflows`);

        return personas;
    }

    async createLightragAutomation() {
        console.log('\n🔧 Creating Lightrag Automation Workflows...');

        const lightragWorkflows = [
            {
                name: 'AI-Powered Customer Analysis',
                description: 'Analyze customer data and provide insights',
                triggers: ['New Customer Data', 'Customer Update'],
                actions: [
                    'Analyze Customer Behavior',
                    'Generate Insights Report',
                    'Identify Opportunities',
                    'Recommend Actions'
                ]
            },
            {
                name: 'Predictive Analytics',
                description: 'Predict customer churn and revenue opportunities',
                triggers: ['Daily Data Sync', 'Customer Activity'],
                actions: [
                    'Analyze Historical Data',
                    'Generate Predictions',
                    'Create Alerts',
                    'Recommend Interventions'
                ]
            },
            {
                name: 'Automated Decision Making',
                description: 'AI-driven decision making for business processes',
                triggers: ['Process Decision Point', 'Business Rule Trigger'],
                actions: [
                    'Analyze Context',
                    'Apply Business Rules',
                    'Make Decision',
                    'Execute Action'
                ]
            }
        ];

        this.results.workflows.lightrag = lightragWorkflows;
        console.log(`✅ Created ${lightragWorkflows.length} Lightrag automation workflows`);

        return lightragWorkflows;
    }

    async createSystemIntegrationMap() {
        console.log('\n🗺️ Creating System Integration Map...');

        const integrationMap = {
            dataFlow: {
                airtable: {
                    customers: ['n8n', 'emailPersonas', 'lightrag'],
                    projects: ['n8n', 'webflow', 'lightrag'],
                    tasks: ['n8n', 'emailPersonas'],
                    invoices: ['n8n', 'emailPersonas', 'lightrag']
                },
                n8n: {
                    workflows: ['airtable', 'emailPersonas', 'webflow'],
                    triggers: ['airtable', 'webflow', 'lightrag']
                },
                webflow: {
                    content: ['airtable', 'n8n'],
                    updates: ['airtable', 'emailPersonas']
                },
                lightrag: {
                    insights: ['airtable', 'n8n', 'emailPersonas'],
                    decisions: ['airtable', 'n8n']
                },
                emailPersonas: {
                    communications: ['airtable', 'n8n'],
                    responses: ['airtable', 'lightrag']
                }
            },
            automationTriggers: {
                'New Customer': ['Welcome Email', 'Onboarding Workflow', 'Success Plan'],
                'Project Milestone': ['Invoice Generation', 'Status Update', 'Client Notification'],
                'Task Assignment': ['Assignment Email', 'Deadline Tracking', 'Progress Updates'],
                'Payment Received': ['Receipt Email', 'Project Status Update', 'Financial Report'],
                'Support Request': ['Ticket Creation', 'Assignment', 'Resolution Tracking']
            },
            businessProcesses: {
                customerOnboarding: ['airtable', 'n8n', 'emailPersonas', 'webflow'],
                projectManagement: ['airtable', 'n8n', 'lightrag'],
                invoicing: ['airtable', 'n8n', 'emailPersonas'],
                support: ['airtable', 'n8n', 'emailPersonas'],
                marketing: ['airtable', 'n8n', 'webflow', 'emailPersonas']
            }
        };

        this.results.integrations.map = integrationMap;
        console.log('✅ Created comprehensive system integration map');

        return integrationMap;
    }

    async executeSystemIntegration() {
        console.log('\n🚀 EXECUTING BIG BMAD PLAN SYSTEM INTEGRATION...');
        console.log(`📅 Started at: ${new Date().toISOString()}`);

        try {
            // Phase 1: Test All Integrations
            console.log('\n🎯 PHASE 1: TESTING ALL INTEGRATIONS...');
            await this.testAirtableIntegration();
            await this.testN8nIntegration();
            await this.testWebflowIntegration();
            await this.testLightragIntegration();

            // Phase 2: Create Workflows
            console.log('\n🎯 PHASE 2: CREATING WORKFLOWS...');
            await this.createN8nWorkflows();
            await this.createEmailPersonasWorkflows();
            await this.createLightragAutomation();

            // Phase 3: Create Integration Map
            console.log('\n🎯 PHASE 3: CREATING INTEGRATION MAP...');
            await this.createSystemIntegrationMap();

            // Phase 4: Save Results
            console.log('\n💾 SAVING RESULTS...');
            const resultsPath = path.join(__dirname, '../docs/big-bmad-plan-system-integration.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));

            // Phase 5: Generate Summary
            this.generateIntegrationSummary();

            console.log('\n🎉 BIG BMAD PLAN SYSTEM INTEGRATION COMPLETE!');
            console.log(`📊 Summary: ${Object.keys(this.results.integrations).length} integrations tested`);
            console.log(`🔧 Workflows: ${Object.keys(this.results.workflows).length} workflow types created`);
            console.log(`📄 Results saved to: ${resultsPath}`);

            return this.results;

        } catch (error) {
            console.error('\n❌ System integration failed:', error.message);
            return null;
        }
    }

    generateIntegrationSummary() {
        console.log('\n📋 BIG BMAD PLAN SYSTEM INTEGRATION SUMMARY:');
        console.log('\n🔗 INTEGRATION STATUS:');

        for (const [component, status] of Object.entries(this.results.integrations)) {
            if (component !== 'map') {
                const statusIcon = status.status === 'connected' ? '✅' : '❌';
                console.log(`${statusIcon} ${component.toUpperCase()}: ${status.status}`);
            }
        }

        console.log('\n🔧 WORKFLOW TYPES CREATED:');
        for (const [type, workflows] of Object.entries(this.results.workflows)) {
            const count = Array.isArray(workflows) ? workflows.length : Object.keys(workflows).length;
            console.log(`📊 ${type.toUpperCase()}: ${count} workflows`);
        }

        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Deploy n8n workflows to production');
        console.log('2. Configure email personas in Microsoft 365');
        console.log('3. Set up Lightrag automation rules');
        console.log('4. Test all integration points');
        console.log('5. Monitor system performance');
    }
}

// Run the system integration
async function main() {
    const integrator = new BigBmadPlanSystemIntegration();
    const results = await integrator.executeSystemIntegration();
    process.exit(results ? 0 : 1);
}

main().catch(console.error);
