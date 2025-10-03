#!/usr/bin/env node

/**
 * 🔄 SYNC WORKFLOW TEMPLATES TO NOTION (PROPER)
 * 
 * This script properly syncs all 12 workflow templates from Airtable to Notion
 * using the CORRECT data types for each property.
 */

const NOTION_TOKEN = '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';
const NOTION_DATABASE_ID = '6f3c687f-91b4-46fc-a54e-193b0951d1a5';

// 12 Workflow Templates from Airtable with FULL data
const workflowTemplates = [
    {
        templateId: 'n8n-01',
        name: 'Advanced Business Process Automation',
        type: 'n8n',
        status: 'Deployed',
        deploymentStatus: 'Active',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/n8n-workflows/01-advanced-business-process-automation.md',
        n8nWorkflowId: 'rawczJckEDeStnVL',
        webhookUrl: 'http://173.254.201.134:5678/webhook/business-process-automation',
        lastDeployed: '2025-01-25',
        successRate: 95,
        errorCount: 2,
        rgid: 'RGID_WORKFLOW_N8N_01_1737820800000_a1b2c3d4'
    },
    {
        templateId: 'n8n-02',
        name: 'Real-Time Analytics Dashboard',
        type: 'n8n',
        status: 'Deployed',
        deploymentStatus: 'Active',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/n8n-workflows/02-real-time-analytics-dashboard.md',
        n8nWorkflowId: 'yOH1RZI5ZaKc9zy4',
        webhookUrl: 'http://173.254.201.134:5678/webhook/analytics-dashboard',
        lastDeployed: '2025-01-25',
        successRate: 98,
        errorCount: 1,
        rgid: 'RGID_WORKFLOW_N8N_02_1737820800000_b2c3d4e5'
    },
    {
        templateId: 'n8n-03',
        name: 'Customer Onboarding Automation',
        type: 'n8n',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/n8n-workflows/03-customer-onboarding-automation.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_N8N_03_1737820800000_c3d4e5f6'
    },
    {
        templateId: 'email-01',
        name: 'Mary Johnson - Customer Success',
        type: 'Email Persona',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/email-personas/01-mary-johnson-customer-success.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_EMAIL_01_1737820800000_d4e5f6g7'
    },
    {
        templateId: 'email-02',
        name: 'John Smith - Technical Support',
        type: 'Email Persona',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/email-personas/02-john-smith-technical-support.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_EMAIL_02_1737820800000_e5f6g7h8'
    },
    {
        templateId: 'email-03',
        name: 'Winston Chen - Business Development',
        type: 'Email Persona',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/email-personas/03-winston-chen-business-development.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_EMAIL_03_1737820800000_f6g7h8i9'
    },
    {
        templateId: 'email-04',
        name: 'Sarah Williams - Marketing',
        type: 'Email Persona',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/email-personas/04-sarah-williams-marketing.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_EMAIL_04_1737820800000_g7h8i9j0'
    },
    {
        templateId: 'email-05',
        name: 'Alex Rodriguez - Operations',
        type: 'Email Persona',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/email-personas/05-alex-rodriguez-operations.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_EMAIL_05_1737820800000_h8i9j0k1'
    },
    {
        templateId: 'email-06',
        name: 'Quinn Williams - Finance',
        type: 'Email Persona',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/email-personas/06-quinn-williams-finance.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_EMAIL_06_1737820800000_i9j0k1l2'
    },
    {
        templateId: 'lightrag-01',
        name: 'AI-Powered Customer Analysis',
        type: 'Lightrag',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/lightrag-workflows/01-ai-powered-customer-analysis.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_LIGHTRAG_01_1737820800000_j0k1l2m3'
    },
    {
        templateId: 'lightrag-02',
        name: 'Predictive Analytics',
        type: 'Lightrag',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/lightrag-workflows/02-predictive-analytics.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_LIGHTRAG_02_1737820800000_k1l2m3n4'
    },
    {
        templateId: 'lightrag-03',
        name: 'Automated Decision Making',
        type: 'Lightrag',
        status: 'Missing',
        deploymentStatus: 'Pending',
        documentationUrl: 'https://github.com/rensto/rensto/blob/main/docs/workflow-templates/lightrag-workflows/03-automated-decision-making.md',
        successRate: 0,
        errorCount: 0,
        rgid: 'RGID_WORKFLOW_LIGHTRAG_03_1737820800000_l2m3n4o5'
    }
];

async function createNotionPage(template) {
    try {
        const response = await fetch(`https://api.notion.com/v1/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: { database_id: NOTION_DATABASE_ID },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: template.name
                                }
                            }
                        ]
                    },
                    Type: {
                        select: {
                            name: template.type
                        }
                    },
                    Status: {
                        select: {
                            name: template.status
                        }
                    },
                    Platform: {
                        rich_text: [
                            {
                                text: {
                                    content: template.type === 'n8n' ? 'n8n' : 
                                            template.type === 'Email Persona' ? 'Microsoft 365' : 'Lightrag'
                                }
                            }
                        ]
                    },
                    Priority: {
                        select: {
                            name: template.status === 'Deployed' ? 'High' : 'Medium'
                        }
                    },
                    'Automation Level': {
                        select: {
                            name: template.type === 'n8n' ? 'Advanced' : 
                                  template.type === 'Email Persona' ? 'Medium' : 'AI-Powered'
                        }
                    },
                    'AI Integration Status': {
                        select: {
                            name: template.type === 'Lightrag' ? 'Active' : 'None'
                        }
                    },
                    'Airtable Sync': {
                        checkbox: true
                    },
                    'Sync Status': {
                        rich_text: [
                            {
                                text: {
                                    content: 'Up to Date'
                                }
                            }
                        ]
                    },
                    Description: {
                        rich_text: [
                            {
                                text: {
                                    content: `Template ID: ${template.templateId}\n` +
                                            `Documentation: ${template.documentationUrl}\n` +
                                            `Deployment Status: ${template.deploymentStatus}\n` +
                                            `Success Rate: ${template.successRate}%\n` +
                                            `Error Count: ${template.errorCount}\n` +
                                            (template.n8nWorkflowId ? `n8n Workflow ID: ${template.n8nWorkflowId}\n` : '') +
                                            (template.webhookUrl ? `Webhook URL: ${template.webhookUrl}\n` : '') +
                                            (template.lastDeployed ? `Last Deployed: ${template.lastDeployed}` : '')
                                }
                            }
                        ]
                    },
                    RGID: {
                        rich_text: [
                            {
                                text: {
                                    content: template.rgid
                                }
                            }
                        ]
                    },
                    'Created By': {
                        rich_text: [
                            {
                                text: {
                                    content: 'System Sync'
                                }
                            }
                        ]
                    },
                    'Last Updated': {
                        date: {
                            start: new Date().toISOString().split('T')[0]
                        }
                    }
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Created: ${template.name} (${template.templateId}) - ${template.type}`);
            return result;
        } else {
            const error = await response.text();
            console.log(`❌ Failed to create ${template.name}: ${error}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Error creating ${template.name}: ${error.message}`);
        return null;
    }
}

async function syncWorkflowTemplates() {
    console.log('🔄 SYNCING WORKFLOW TEMPLATES TO NOTION (PROPER - FULL DATA)...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const template of workflowTemplates) {
        const result = await createNotionPage(template);
        if (result) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\n📊 SYNC COMPLETE:`);
    console.log(`✅ Successfully created: ${successCount}/12 templates`);
    console.log(`❌ Failed: ${failCount}/12 templates`);
    
    if (successCount === 12) {
        console.log('\n🎉 ALL WORKFLOW TEMPLATES SUCCESSFULLY SYNCED TO NOTION WITH FULL DATA!');
        console.log('📋 Each template includes:');
        console.log('   - Template ID and Name');
        console.log('   - Type and Status');
        console.log('   - Platform and Priority');
        console.log('   - Automation Level and AI Integration Status');
        console.log('   - Complete documentation URLs');
        console.log('   - Success rates and error counts');
        console.log('   - n8n Workflow IDs and Webhook URLs (where applicable)');
        console.log('   - RGID for cross-system tracking');
    } else {
        console.log('\n⚠️ Some templates failed to sync. Check the errors above.');
    }
}

// Run the sync
syncWorkflowTemplates().catch(console.error);
