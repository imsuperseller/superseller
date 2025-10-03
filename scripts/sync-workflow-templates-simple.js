#!/usr/bin/env node

/**
 * 🔄 SYNC WORKFLOW TEMPLATES TO NOTION (SIMPLE)
 * 
 * This script syncs all 12 workflow templates from Airtable to Notion
 * using only the basic properties that exist in the database.
 */

const NOTION_TOKEN = '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';
const NOTION_DATABASE_ID = '6f3c687f-91b4-46fc-a54e-193b0951d1a5';

// 12 Workflow Templates from Airtable
const workflowTemplates = [
    { name: 'Advanced Business Process Automation', type: 'n8n', status: 'Deployed', rgid: 'RGID_WORKFLOW_N8N_01_1737820800000_a1b2c3d4' },
    { name: 'Real-Time Analytics Dashboard', type: 'n8n', status: 'Deployed', rgid: 'RGID_WORKFLOW_N8N_02_1737820800000_b2c3d4e5' },
    { name: 'Customer Onboarding Automation', type: 'n8n', status: 'Missing', rgid: 'RGID_WORKFLOW_N8N_03_1737820800000_c3d4e5f6' },
    { name: 'Mary Johnson - Customer Success', type: 'Email Persona', status: 'Missing', rgid: 'RGID_WORKFLOW_EMAIL_01_1737820800000_d4e5f6g7' },
    { name: 'John Smith - Technical Support', type: 'Email Persona', status: 'Missing', rgid: 'RGID_WORKFLOW_EMAIL_02_1737820800000_e5f6g7h8' },
    { name: 'Winston Chen - Business Development', type: 'Email Persona', status: 'Missing', rgid: 'RGID_WORKFLOW_EMAIL_03_1737820800000_f6g7h8i9' },
    { name: 'Sarah Williams - Marketing', type: 'Email Persona', status: 'Missing', rgid: 'RGID_WORKFLOW_EMAIL_04_1737820800000_g7h8i9j0' },
    { name: 'Alex Rodriguez - Operations', type: 'Email Persona', status: 'Missing', rgid: 'RGID_WORKFLOW_EMAIL_05_1737820800000_h8i9j0k1' },
    { name: 'Quinn Williams - Finance', type: 'Email Persona', status: 'Missing', rgid: 'RGID_WORKFLOW_EMAIL_06_1737820800000_i9j0k1l2' },
    { name: 'AI-Powered Customer Analysis', type: 'Lightrag', status: 'Missing', rgid: 'RGID_WORKFLOW_LIGHTRAG_01_1737820800000_j0k1l2m3' },
    { name: 'Predictive Analytics', type: 'Lightrag', status: 'Missing', rgid: 'RGID_WORKFLOW_LIGHTRAG_02_1737820800000_k1l2m3n4' },
    { name: 'Automated Decision Making', type: 'Lightrag', status: 'Missing', rgid: 'RGID_WORKFLOW_LIGHTRAG_03_1737820800000_l2m3n4o5' }
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
                    RGID: {
                        rich_text: [
                            {
                                text: {
                                    content: template.rgid
                                }
                            }
                        ]
                    }
                }
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Created: ${template.name} (${template.type})`);
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
    console.log('🔄 SYNCING WORKFLOW TEMPLATES TO NOTION (SIMPLE)...\n');
    
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
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n📊 SYNC COMPLETE:`);
    console.log(`✅ Successfully created: ${successCount}/12 templates`);
    console.log(`❌ Failed: ${failCount}/12 templates`);
    
    if (successCount === 12) {
        console.log('\n🎉 ALL WORKFLOW TEMPLATES SUCCESSFULLY SYNCED TO NOTION!');
    } else {
        console.log('\n⚠️ Some templates failed to sync. Check the errors above.');
    }
}

// Run the sync
syncWorkflowTemplates().catch(console.error);
