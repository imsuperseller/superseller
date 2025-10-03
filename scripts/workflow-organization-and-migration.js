#!/usr/bin/env node
import axios from 'axios';
import fs from 'fs';
import path from 'path';

class WorkflowOrganizationAndMigration {
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
            },
            financial: {
                id: 'app6yzlm67lRNuQZD',
                name: 'Financial Management (Fi)',
                tables: { invoices: 'tblpQ71TjMAnVJ5by' }
            },
            marketingSales: {
                id: 'appQhVkIaWoGJG301',
                name: 'Marketing & Sales (Ma)',
                tables: { content: 'tblyouyRsrShihtsW' }
            },
            customerSuccess: {
                id: 'appSCBZk03GUCTfhN',
                name: 'Customer Success (Cu)',
                tables: { customers: 'tblhzxwqGZCH4qOjR' }
            },
            coreBusiness: {
                id: 'app4nJpP1ytGukXQT',
                name: 'Core Business Operations (Co)',
                tables: { companies: 'tbl1roDiTjOCU3wiz' }
            },
            idempotency: {
                id: 'app9DhsrZ0VnuEH3t',
                name: 'Idempotency Systems (Id)',
                tables: { table_1: 'tblyjH6tiW4vMvw46' }
            },
            analytics: {
                id: 'appOvDNYenyx7WITR',
                name: 'Analytics & Monitoring (An)',
                tables: { table_1: 'tblX93phi97sWf0Zj' }
            },
            rgid: {
                id: 'appCGexgpGPkMUPXF',
                name: 'RGID-based Entity Management (Rg)',
                tables: { table_1: 'tblVC42de1P1K6or2' }
            },
            rensto: {
                id: 'appQijHhqqP4z6wGe',
                name: 'Rensto Client Operations',
                tables: { customers: 'tbl6BMipQQPJvPIWw' }
            }
        };

        // Workflow categorization
        this.workflowCategories = {
            // Tax4Us Customer Workflows
            tax4us: {
                category: 'Customer',
                customer: 'Tax4Us',
                target: 'Tax4Us n8n Instance',
                priority: 'High',
                workflows: []
            },

            // Ben Customer Workflows
            ben: {
                category: 'Customer',
                customer: 'Ben',
                target: 'Ben n8n Instance',
                priority: 'High',
                workflows: []
            },

            // Shelly Customer Workflows
            shelly: {
                category: 'Customer',
                customer: 'Shelly',
                target: 'Shelly n8n Instance',
                priority: 'High',
                workflows: []
            },

            // Rensto Internal Workflows
            rensto: {
                category: 'Internal',
                customer: 'Rensto',
                target: 'Rensto n8n Instance (RackNerd)',
                priority: 'Critical',
                workflows: []
            },

            // Template Workflows
            templates: {
                category: 'Template',
                customer: 'Generic',
                target: 'Template Library',
                priority: 'Medium',
                workflows: []
            },

            // Legacy/Deprecated Workflows
            legacy: {
                category: 'Legacy',
                customer: 'Deprecated',
                target: 'Archive',
                priority: 'Low',
                workflows: []
            }
        };

        // Known recurring issues and fixes
        this.knownIssues = {
            settingsProperty: {
                issue: 'The issue is that the n8n API requires a settings property.',
                fix: 'Add settings: {} to workflow nodes that require it',
                pattern: /"settings":\s*undefined/
            },
            optionsToOption: {
                issue: 'The nodes have options (plural) but n8n expects option (singular).',
                fix: 'Change "options" to "option" in node configurations',
                pattern: /"options":\s*\[/
            },
            validationErrors: {
                issue: 'Additional properties causing validation errors.',
                fix: 'Remove unexpected properties from workflow nodes',
                pattern: /"additionalProperty":\s*"[^"]*"/
            },
            nonJsonOutput: {
                issue: 'The MCP server is returning non-JSON output.',
                fix: 'Ensure MCP server returns valid JSON format',
                pattern: /Invalid JSON/
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

    categorizeWorkflow(filename, content) {
        const lowerFilename = filename.toLowerCase();
        const lowerContent = JSON.stringify(content).toLowerCase();

        // Tax4Us workflows
        if (lowerFilename.includes('tax4us') || lowerFilename.includes('t4us')) {
            return 'tax4us';
        }

        // Ben workflows
        if (lowerFilename.includes('ben-') || lowerFilename.includes('ben_')) {
            return 'ben';
        }

        // Shelly workflows
        if (lowerFilename.includes('shelly')) {
            return 'shelly';
        }

        // Rensto internal workflows
        if (lowerFilename.includes('email-automation') ||
            lowerFilename.includes('contact-intake') ||
            lowerFilename.includes('facebook-group-scraper') ||
            lowerFilename.includes('finance-unpaid-invoices') ||
            lowerFilename.includes('leads-daily-followups') ||
            lowerFilename.includes('projects-digest') ||
            lowerFilename.includes('assets-renewals')) {
            return 'rensto';
        }

        // Template workflows
        if (lowerFilename.includes('smart_ai_blog_writing') ||
            lowerFilename.includes('workflow-importer') ||
            lowerFilename.includes('import-workflows')) {
            return 'templates';
        }

        // Legacy/backup workflows
        if (lowerFilename.includes('backup') ||
            lowerFilename.includes('main-workflow-backup') ||
            lowerFilename.includes('enhanced') && lowerFilename.includes('simple')) {
            return 'legacy';
        }

        // Default to templates for unknown workflows
        return 'templates';
    }

    detectIssues(workflowContent) {
        const issues = [];
        const contentStr = JSON.stringify(workflowContent);

        for (const [issueKey, issueInfo] of Object.entries(this.knownIssues)) {
            if (issueInfo.pattern.test(contentStr)) {
                issues.push({
                    type: issueKey,
                    description: issueInfo.issue,
                    fix: issueInfo.fix
                });
            }
        }

        return issues;
    }

    async analyzeWorkflows() {
        console.log('🔍 ANALYZING WORKFLOWS FOLDER');
        console.log('==============================');

        const workflowsDir = path.join(process.cwd(), 'workflows');
        const allFiles = [];

        // Recursively get all JSON files
        const getFilesRecursively = (dir) => {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    getFilesRecursively(filePath);
                } else if (file.endsWith('.json')) {
                    allFiles.push(filePath);
                }
            });
        };

        getFilesRecursively(workflowsDir);

        console.log(`📋 Found ${allFiles.length} workflow files`);

        for (const filePath of allFiles) {
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const filename = path.basename(filePath);
                const relativePath = path.relative(workflowsDir, filePath);

                const category = this.categorizeWorkflow(filename, content);
                const issues = this.detectIssues(content);

                const workflowInfo = {
                    filename,
                    relativePath,
                    fullPath: filePath,
                    category,
                    size: fs.statSync(filePath).size,
                    issues,
                    content,
                    nodeCount: content.nodes?.length || 0,
                    connectionsCount: Object.keys(content.connections || {}).length
                };

                this.workflowCategories[category].workflows.push(workflowInfo);

                console.log(`📄 ${filename} → ${category} (${workflowInfo.nodeCount} nodes, ${issues.length} issues)`);

            } catch (error) {
                console.error(`❌ Error reading ${filePath}:`, error.message);
            }
        }

        return this.workflowCategories;
    }

    async documentWorkflowsToAirtable() {
        console.log('\n📝 DOCUMENTING WORKFLOWS TO AIRTABLE');
        console.log('=====================================');

        for (const [categoryKey, categoryInfo] of Object.entries(this.workflowCategories)) {
            if (categoryInfo.workflows.length === 0) continue;

            console.log(`\n📋 Documenting ${categoryInfo.workflows.length} ${categoryKey} workflows`);

            for (const workflow of categoryInfo.workflows) {
                // Document to Operations base
                await this.createRecord(
                    this.renstoBases.operations.id,
                    this.renstoBases.operations.tables.system_logs,
                    {
                        Name: `Workflow: ${workflow.filename}`,
                        Message: `${categoryInfo.category} workflow for ${categoryInfo.customer}`,
                        Details: `Target: ${categoryInfo.target}, Nodes: ${workflow.nodeCount}, Connections: ${workflow.connectionsCount}, Issues: ${workflow.issues.length}, Size: ${Math.round(workflow.size / 1024)}KB`
                    }
                );

                // Document to Integrations base for technical details
                await this.createRecord(
                    this.renstoBases.integrations.id,
                    this.renstoBases.integrations.tables.table_1,
                    {
                        Name: workflow.filename,
                        'Server ID': categoryInfo.target,
                        Type: 'n8n Workflow',
                        Status: workflow.issues.length > 0 ? 'Needs Fix' : 'Ready',
                        Notes: `Category: ${categoryInfo.category}, Customer: ${categoryInfo.customer}, Priority: ${categoryInfo.priority}, Issues: ${workflow.issues.map(i => i.type).join(', ')}`
                    }
                );
            }
        }
    }

    async createMigrationPlan() {
        console.log('\n🚀 CREATING MIGRATION PLAN');
        console.log('===========================');

        const migrationPlan = {
            rensto: {
                instance: 'Rensto n8n Instance (RackNerd)',
                workflows: this.workflowCategories.rensto.workflows,
                actions: ['Deploy to RackNerd VPS', 'Configure environment variables', 'Set up monitoring']
            },
            tax4us: {
                instance: 'Tax4Us n8n Instance',
                workflows: this.workflowCategories.tax4us.workflows,
                actions: ['Deploy to Tax4Us n8n cloud', 'Configure Airtable integration', 'Set up webhooks']
            },
            ben: {
                instance: 'Ben n8n Instance',
                workflows: this.workflowCategories.ben.workflows,
                actions: ['Deploy to Ben n8n cloud', 'Configure integrations', 'Set up monitoring']
            },
            shelly: {
                instance: 'Shelly n8n Instance',
                workflows: this.workflowCategories.shelly.workflows,
                actions: ['Deploy to Shelly n8n cloud', 'Configure Excel processing', 'Set up automation']
            },
            templates: {
                instance: 'Template Library',
                workflows: this.workflowCategories.templates.workflows,
                actions: ['Store in template repository', 'Document usage', 'Create deployment guides']
            }
        };

        // Document migration plan to Airtable
        for (const [instanceKey, instanceInfo] of Object.entries(migrationPlan)) {
            if (instanceInfo.workflows.length === 0) continue;

            await this.createRecord(
                this.renstoBases.operations.id,
                this.renstoBases.operations.tables.system_logs,
                {
                    Name: `Migration Plan: ${instanceInfo.instance}`,
                    Message: `Migration plan for ${instanceInfo.workflows.length} workflows to ${instanceInfo.instance}`,
                    Details: `Actions: ${instanceInfo.actions.join(', ')}, Workflows: ${instanceInfo.workflows.map(w => w.filename).join(', ')}`
                }
            );
        }

        return migrationPlan;
    }

    async createCleanupPlan() {
        console.log('\n🧹 CREATING CLEANUP PLAN');
        console.log('=========================');

        const cleanupPlan = {
            keep: [],
            archive: [],
            delete: []
        };

        // Keep current active workflows
        for (const category of ['rensto', 'tax4us', 'ben', 'shelly', 'templates']) {
            cleanupPlan.keep.push(...this.workflowCategories[category].workflows);
        }

        // Archive legacy workflows
        cleanupPlan.archive.push(...this.workflowCategories.legacy.workflows);

        // Document cleanup plan
        await this.createRecord(
            this.renstoBases.operations.id,
            this.renstoBases.operations.tables.system_logs,
            {
                Name: 'Workflow Cleanup Plan',
                Message: 'Comprehensive cleanup and organization plan for workflows folder',
                Details: `Keep: ${cleanupPlan.keep.length}, Archive: ${cleanupPlan.archive.length}, Delete: ${cleanupPlan.delete.length}`
            }
        );

        return cleanupPlan;
    }

    async generateDocumentation() {
        console.log('\n📚 GENERATING DOCUMENTATION');
        console.log('============================');

        const documentation = {
            summary: {
                totalWorkflows: Object.values(this.workflowCategories).reduce((sum, cat) => sum + cat.workflows.length, 0),
                categories: Object.keys(this.workflowCategories).filter(key => this.workflowCategories[key].workflows.length > 0),
                issuesFound: Object.values(this.workflowCategories).reduce((sum, cat) => sum + cat.workflows.reduce((wSum, w) => wSum + w.issues.length, 0), 0)
            },
            locations: {
                rensto: 'Rensto n8n Instance (RackNerd VPS)',
                tax4us: 'Tax4Us n8n Cloud Instance',
                ben: 'Ben n8n Cloud Instance',
                shelly: 'Shelly n8n Cloud Instance',
                templates: 'Template Library (GitHub/Airtable)',
                legacy: 'Archive (Backup folder)'
            },
            knownIssues: this.knownIssues
        };

        // Document to Airtable
        await this.createRecord(
            this.renstoBases.operations.id,
            this.renstoBases.operations.tables.system_logs,
            {
                Name: 'Workflow Documentation & Locations',
                Message: 'Complete documentation of workflow organization and locations',
                Details: `Total: ${documentation.summary.totalWorkflows}, Categories: ${documentation.summary.categories.join(', ')}, Issues: ${documentation.summary.issuesFound}`
            }
        );

        return documentation;
    }

    async performWorkflowOrganization() {
        console.log('🎯 WORKFLOW ORGANIZATION AND MIGRATION');
        console.log('=======================================');

        // Step 1: Analyze workflows
        const categories = await this.analyzeWorkflows();

        // Step 2: Document to Airtable
        await this.documentWorkflowsToAirtable();

        // Step 3: Create migration plan
        const migrationPlan = await this.createMigrationPlan();

        // Step 4: Create cleanup plan
        const cleanupPlan = await this.createCleanupPlan();

        // Step 5: Generate documentation
        const documentation = await this.generateDocumentation();

        // Generate summary report
        console.log('\n📊 WORKFLOW ORGANIZATION SUMMARY');
        console.log('==================================');
        console.log(`Total Workflows: ${documentation.summary.totalWorkflows}`);
        console.log(`Categories: ${documentation.summary.categories.join(', ')}`);
        console.log(`Issues Found: ${documentation.summary.issuesFound}`);

        console.log('\n📍 WORKFLOW LOCATIONS:');
        for (const [key, location] of Object.entries(documentation.locations)) {
            const count = categories[key]?.workflows.length || 0;
            if (count > 0) {
                console.log(`   ${key.toUpperCase()}: ${location} (${count} workflows)`);
            }
        }

        console.log('\n🔧 KNOWN ISSUES TO FIX:');
        for (const [issueKey, issueInfo] of Object.entries(this.knownIssues)) {
            console.log(`   ${issueKey}: ${issueInfo.issue}`);
            console.log(`      Fix: ${issueInfo.fix}`);
        }

        console.log('\n✅ WORKFLOW ORGANIZATION COMPLETE!');
        console.log('📋 Next steps:');
        console.log('   1. Fix identified issues in workflows');
        console.log('   2. Deploy workflows to appropriate n8n instances');
        console.log('   3. Archive legacy workflows');
        console.log('   4. Update documentation with final locations');

        return {
            categories,
            migrationPlan,
            cleanupPlan,
            documentation
        };
    }
}

// Execute the workflow organization
const organizer = new WorkflowOrganizationAndMigration();
organizer.performWorkflowOrganization().catch(console.error);
