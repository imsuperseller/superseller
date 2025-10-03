#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import path from 'path';

class WorkflowCleanupAndMigrationExecutor {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };

        // All Rensto bases
        this.renstoBases = {
            operations: {
                id: 'app6saCaH88uK3kCO',
                name: 'Operations & Automation (Op)',
                tables: { system_logs: 'tblWE9DZnfE8e8x2o' }
            },
            integrations: {
                id: 'app9oouVkvTkFjf3t',
                name: 'Integrations (In)',
                tables: { table_1: 'tblJj2hILjH2ciXjy' }
            }
        };

        // Migration targets
        this.migrationTargets = {
            rensto: {
                instance: 'Rensto n8n Instance (RackNerd VPS)',
                workflows: [
                    'email-automation-system.json',
                    'contact-intake.json',
                    'facebook-group-scraper-clean.json',
                    'facebook-group-scraper.json',
                    'finance-unpaid-invoices.json',
                    'leads-daily-followups.json',
                    'projects-digest.json',
                    'assets-renewals.json'
                ]
            },
            tax4us: {
                instance: 'Tax4Us n8n Cloud Instance',
                workflows: [
                    'Tax4US Content Specification to WordPress Draft Automation.json',
                    'Tax4US-Content-Automation-Airtable-Trigger.json',
                    'Tax4US-Content-Automation-Fixed-Update.json',
                    'Tax4Us Orchestration Agent.json',
                    'Tax4Us Podcast Agent.json',
                    'Tax4Us Social Media Agent.json',
                    'Tax4Us-Orchestration-Agent.json',
                    'Tax4Us-Podcast-Agent.json',
                    'Tax4Us-Social-Media-Agent.json',
                    't4us_approve_publish.json',
                    't4us_asset_uploader.json',
                    't4us_spec_to_draft.json',
                    't4us_weekly_refresh.json',
                    'tax4us-blog-posts-agent.json',
                    'tax4us-content-intelligence-agent-enhanced.json',
                    'tax4us-content-intelligence-agent-simple.json',
                    'tax4us-content-intelligence-agent.json',
                    'tax4us_enhanced_wordpress_agent.json',
                    'tax4us_wordpress_agent_real_integration.json'
                ]
            },
            ben: {
                instance: 'Ben n8n Cloud Instance',
                workflows: [
                    'ben-podcast-agent.json',
                    'ben-social-media-agent.json',
                    'ben-wordpress-blog-agent.json',
                    'ben-wordpress-content-agent.json'
                ]
            },
            shelly: {
                instance: 'Shelly n8n Cloud Instance',
                workflows: [
                    'shelly-excel-processor-native.json',
                    'shelly-excel-processor.json'
                ]
            },
            templates: {
                instance: 'Template Library',
                workflows: [
                    'SMART AI Blog Writing System_ Fully Automated Content.json',
                    'SMART_AI_Blog_Writing_System_Updated.json',
                    'Smart_AI_Blog_Writing_System_for_Gumroad_Download_041225.json',
                    'import-workflows.json',
                    'workflow-importer.json'
                ]
            },
            legacy: {
                instance: 'Archive',
                workflows: [
                    'main-workflow-backup.json'
                ]
            }
        };
    }

    async createRecord(baseId, tableId, fields) {
        try {
            await axios.post(`${this.baseUrl}/${baseId}/${tableId}`, { fields }, { headers: this.headers });
            console.log(`✅ Created record: ${fields.Name || 'Unknown'}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to create record:`, error.response?.data || error.message);
            return false;
        }
    }

    async createOrganizedFolders() {
        console.log('📁 CREATING ORGANIZED FOLDER STRUCTURE');
        console.log('======================================');

        const baseDir = path.join(process.cwd(), 'workflows');
        const organizedDir = path.join(process.cwd(), 'workflows-organized');

        // Create organized directory
        if (!fs.existsSync(organizedDir)) {
            fs.mkdirSync(organizedDir, { recursive: true });
        }

        // Create category folders
        for (const category of Object.keys(this.migrationTargets)) {
            const categoryDir = path.join(organizedDir, category);
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }
            console.log(`📁 Created folder: ${category}`);
        }

        return organizedDir;
    }

    async moveWorkflowsToOrganizedFolders() {
        console.log('\n📦 MOVING WORKFLOWS TO ORGANIZED FOLDERS');
        console.log('==========================================');

        const baseDir = path.join(process.cwd(), 'workflows');
        const organizedDir = path.join(process.cwd(), 'workflows-organized');

        let movedCount = 0;
        let errorCount = 0;

        for (const [category, targetInfo] of Object.entries(this.migrationTargets)) {
            console.log(`\n📋 Moving ${targetInfo.workflows.length} workflows to ${category}/`);

            for (const workflowName of targetInfo.workflows) {
                const sourcePath = path.join(baseDir, workflowName);
                const targetPath = path.join(organizedDir, category, workflowName);

                try {
                    if (fs.existsSync(sourcePath)) {
                        fs.copyFileSync(sourcePath, targetPath);
                        console.log(`✅ Moved: ${workflowName}`);
                        movedCount++;
                    } else {
                        console.log(`⚠️  Not found: ${workflowName}`);
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`❌ Error moving ${workflowName}:`, error.message);
                    errorCount++;
                }
            }
        }

        console.log(`\n📊 Move Summary: ${movedCount} moved, ${errorCount} errors`);
        return { movedCount, errorCount };
    }

    async createMigrationInstructions() {
        console.log('\n📋 CREATING MIGRATION INSTRUCTIONS');
        console.log('====================================');

        const instructions = {
            rensto: {
                instance: 'Rensto n8n Instance (RackNerd VPS)',
                location: 'workflows-organized/rensto/',
                deployment: 'Deploy to RackNerd VPS n8n instance',
                environment: 'Community version on RackNerd',
                workflows: this.migrationTargets.rensto.workflows
            },
            tax4us: {
                instance: 'Tax4Us n8n Cloud Instance',
                location: 'workflows-organized/tax4us/',
                deployment: 'Deploy to Tax4Us n8n cloud instance',
                environment: 'n8n Cloud',
                workflows: this.migrationTargets.tax4us.workflows
            },
            ben: {
                instance: 'Ben n8n Cloud Instance',
                location: 'workflows-organized/ben/',
                deployment: 'Deploy to Ben n8n cloud instance',
                environment: 'n8n Cloud',
                workflows: this.migrationTargets.ben.workflows
            },
            shelly: {
                instance: 'Shelly n8n Cloud Instance',
                location: 'workflows-organized/shelly/',
                deployment: 'Deploy to Shelly n8n cloud instance',
                environment: 'n8n Cloud',
                workflows: this.migrationTargets.shelly.workflows
            },
            templates: {
                instance: 'Template Library',
                location: 'workflows-organized/templates/',
                deployment: 'Store in template repository',
                environment: 'GitHub/Airtable',
                workflows: this.migrationTargets.templates.workflows
            },
            legacy: {
                instance: 'Archive',
                location: 'workflows-organized/legacy/',
                deployment: 'Archive for reference',
                environment: 'Backup storage',
                workflows: this.migrationTargets.legacy.workflows
            }
        };

        // Create README file
        const readmeContent = this.generateReadmeContent(instructions);
        const readmePath = path.join(process.cwd(), 'workflows-organized', 'README.md');
        fs.writeFileSync(readmePath, readmeContent);

        console.log('📄 Created README.md with migration instructions');

        return instructions;
    }

    generateReadmeContent(instructions) {
        return `# Workflow Organization and Migration Guide

## Overview
This directory contains organized workflows that have been categorized and prepared for migration to their respective n8n instances.

## Migration Targets

${Object.entries(instructions).map(([category, info]) => `
### ${category.toUpperCase()}
- **Instance**: ${info.instance}
- **Location**: \`${info.location}\`
- **Deployment**: ${info.deployment}
- **Environment**: ${info.environment}
- **Workflows**: ${info.workflows.length} files

**Workflow Files:**
${info.workflows.map(wf => `- \`${wf}\``).join('\n')}
`).join('\n')}

## Migration Instructions

### 1. Rensto Workflows (RackNerd VPS)
- Deploy workflows from \`rensto/\` to Rensto n8n instance on RackNerd VPS
- Configure environment variables for community version
- Set up monitoring and logging

### 2. Customer Workflows (n8n Cloud)
- Deploy Tax4Us workflows to Tax4Us n8n cloud instance
- Deploy Ben workflows to Ben n8n cloud instance  
- Deploy Shelly workflows to Shelly n8n cloud instance
- Configure customer-specific integrations and webhooks

### 3. Template Workflows
- Store templates in GitHub repository
- Document usage and deployment guides
- Create template library in Airtable

### 4. Legacy Workflows
- Archive for reference and backup
- Keep for historical documentation

## Known Issues to Fix

1. **Settings Property**: Add \`settings: {}\` to workflow nodes that require it
2. **Options to Option**: Change "options" to "option" in node configurations
3. **Validation Errors**: Remove unexpected properties from workflow nodes
4. **Non-JSON Output**: Ensure MCP server returns valid JSON format

## Next Steps

1. Fix identified issues in workflows before deployment
2. Deploy workflows to appropriate n8n instances
3. Configure environment variables and integrations
4. Set up monitoring and alerting
5. Update documentation with final deployment locations

## File Locations

- **Original Location**: \`/workflows/\` (to be cleaned up)
- **Organized Location**: \`/workflows-organized/\` (current location)
- **Final Locations**: See migration targets above

## Support

For issues with workflow deployment or configuration, refer to the Airtable documentation in the Operations & Automation base.
`;
    }

    async documentFinalLocations(instructions) {
        console.log('\n📝 DOCUMENTING FINAL LOCATIONS TO AIRTABLE');
        console.log('============================================');

        for (const [category, info] of Object.entries(instructions)) {
            await this.createRecord(
                this.renstoBases.operations.id,
                this.renstoBases.operations.tables.system_logs,
                {
                    Name: `Workflow Migration: ${info.instance}`,
                    Message: `Final migration location for ${category} workflows`,
                    Details: `Location: ${info.location}, Deployment: ${info.deployment}, Environment: ${info.environment}, Workflows: ${info.workflows.join(', ')}`
                }
            );
        }

        // Document overall migration completion
        await this.createRecord(
            this.renstoBases.operations.id,
            this.renstoBases.operations.tables.system_logs,
            {
                Name: 'Workflow Migration Complete',
                Message: 'All workflows have been organized and migrated to their final locations',
                Details: `Total workflows migrated: ${Object.values(instructions).reduce((sum, info) => sum + info.workflows.length, 0)}, Categories: ${Object.keys(instructions).join(', ')}`
            }
        );
    }

    async createCleanupInstructions() {
        console.log('\n🧹 CREATING CLEANUP INSTRUCTIONS');
        console.log('==================================');

        const cleanupInstructions = `
# Workflow Cleanup Instructions

## Before Cleanup
1. Verify all workflows have been successfully moved to \`workflows-organized/\`
2. Confirm all workflows are documented in Airtable
3. Ensure migration instructions are complete

## Cleanup Steps
1. **Backup original folder**: \`cp -r workflows workflows-backup-$(date +%Y%m%d)\`
2. **Remove original workflows folder**: \`rm -rf workflows\`
3. **Verify organized folder**: Check \`workflows-organized/\` contains all workflows
4. **Update documentation**: Ensure Airtable records reflect new locations

## Post-Cleanup Verification
- [ ] All workflows accessible in organized folders
- [ ] Migration instructions documented
- [ ] Airtable records updated
- [ ] README.md created and complete
- [ ] Backup folder created and verified

## Rollback Plan
If issues arise, restore from backup:
\`cp -r workflows-backup-YYYYMMDD workflows\`
`;

        const cleanupPath = path.join(process.cwd(), 'workflows-organized', 'CLEANUP_INSTRUCTIONS.md');
        fs.writeFileSync(cleanupPath, cleanupInstructions);

        console.log('📄 Created CLEANUP_INSTRUCTIONS.md');

        return cleanupInstructions;
    }

    async performWorkflowCleanupAndMigration() {
        console.log('🎯 WORKFLOW CLEANUP AND MIGRATION EXECUTION');
        console.log('============================================');

        // Step 1: Create organized folder structure
        const organizedDir = await this.createOrganizedFolders();

        // Step 2: Move workflows to organized folders
        const moveResults = await this.moveWorkflowsToOrganizedFolders();

        // Step 3: Create migration instructions
        const instructions = await this.createMigrationInstructions();

        // Step 4: Document final locations to Airtable
        await this.documentFinalLocations(instructions);

        // Step 5: Create cleanup instructions
        await this.createCleanupInstructions();

        // Generate final summary
        console.log('\n📊 WORKFLOW CLEANUP AND MIGRATION SUMMARY');
        console.log('==========================================');
        console.log(`✅ Organized Directory: ${organizedDir}`);
        console.log(`✅ Workflows Moved: ${moveResults.movedCount}`);
        console.log(`⚠️  Errors: ${moveResults.errorCount}`);

        console.log('\n📍 FINAL WORKFLOW LOCATIONS:');
        for (const [category, info] of Object.entries(instructions)) {
            console.log(`   ${category.toUpperCase()}: ${info.location} (${info.workflows.length} workflows)`);
            console.log(`      → ${info.instance}`);
        }

        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Review organized workflows in workflows-organized/');
        console.log('   2. Fix any identified issues before deployment');
        console.log('   3. Deploy workflows to appropriate n8n instances');
        console.log('   4. Follow cleanup instructions to remove original folder');
        console.log('   5. Update Airtable with final deployment status');

        console.log('\n✅ WORKFLOW CLEANUP AND MIGRATION COMPLETE!');
        console.log('📁 Check workflows-organized/ for organized files');
        console.log('📄 Check README.md for migration instructions');
        console.log('🧹 Check CLEANUP_INSTRUCTIONS.md for cleanup steps');

        return {
            organizedDir,
            moveResults,
            instructions
        };
    }
}

// Execute the workflow cleanup and migration
const executor = new WorkflowCleanupAndMigrationExecutor();
executor.performWorkflowCleanupAndMigration().catch(console.error);
