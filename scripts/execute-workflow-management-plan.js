#!/usr/bin/env node

import https from 'https';

class Tax4UsWorkflowManager {
    constructor() {
        this.baseUrl = 'https://tax4usllc.app.n8n.cloud';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw';

        // Workflows to keep (from analysis)
        this.workflowsToKeep = [
            'WF: Blog Master - AI Content Pipeline',
            'Tax4US Podcast Agent v2 - Fixed',
            '✨🤖Automate Multi-Platform Social Media Content Creation with AI',
            'Test Airtable Trigger',
            '1. WF-ERR: Alarm & Triage',
            'Tax4US Complete Workflow Test (With Documentation)',
            'Test JavaScript Code Execution'
        ];

        // Workflows to activate (currently inactive)
        this.workflowsToActivate = [
            'Test Airtable Trigger',
            '1. WF-ERR: Alarm & Triage',
            'Tax4US Complete Workflow Test (With Documentation)',
            'Test JavaScript Code Execution'
        ];
    }

    async makeRequest(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: method,
                headers: {
                    'X-N8N-API-KEY': this.apiKey,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                const jsonData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(jsonData);
            }

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsedData = responseData ? JSON.parse(responseData) : {};
                        resolve({
                            statusCode: res.statusCode,
                            data: parsedData
                        });
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            data: responseData
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }

    async getAllWorkflows() {
        try {
            const response = await this.makeRequest('GET', '/api/v1/workflows?limit=100');
            if (response.statusCode === 200) {
                return response.data.data || [];
            }
            throw new Error(`Failed to fetch workflows: ${response.statusCode}`);
        } catch (error) {
            console.error('Error fetching workflows:', error.message);
            return [];
        }
    }

    async getWorkflowDetails(workflowId) {
        try {
            const response = await this.makeRequest('GET', `/api/v1/workflows/${workflowId}`);
            if (response.statusCode === 200) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching workflow ${workflowId}:`, error.message);
            return null;
        }
    }

    async activateWorkflow(workflowId) {
        try {
            const response = await this.makeRequest('POST', `/api/v1/workflows/${workflowId}/activate`, {});
            return response.statusCode === 200;
        } catch (error) {
            console.error(`Error activating workflow ${workflowId}:`, error.message);
            return false;
        }
    }

    async archiveWorkflow(workflowId) {
        try {
            // Get workflow details first
            const workflow = await this.getWorkflowDetails(workflowId);
            if (!workflow) return false;

            // Update workflow to set archived: true
            const updateData = {
                name: workflow.name,
                nodes: workflow.nodes || [],
                connections: workflow.connections || {},
                settings: workflow.settings || {},
                active: false
            };

            const response = await this.makeRequest('PUT', `/api/v1/workflows/${workflowId}`, updateData);
            return response.statusCode === 200;
        } catch (error) {
            console.error(`Error archiving workflow ${workflowId}:`, error.message);
            return false;
        }
    }

    async exportWorkflow(workflowId, workflowName) {
        try {
            const workflow = await this.getWorkflowDetails(workflowId);
            if (!workflow) return false;

            // Create export directory
            const fs = await import('fs');
            const path = await import('path');
            const exportDir = path.join(process.cwd(), 'exports', 'tax4us-workflows');

            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Clean filename
            const cleanName = workflowName.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
            const filename = `${cleanName}_${workflowId}.json`;
            const filepath = path.join(exportDir, filename);

            // Export workflow
            fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
            return filepath;
        } catch (error) {
            console.error(`Error exporting workflow ${workflowId}:`, error.message);
            return false;
        }
    }

    async executeManagementPlan() {
        console.log('🚀 Executing Tax4Us Workflow Management Plan');
        console.log('=============================================');

        // Get all workflows
        const allWorkflows = await this.getAllWorkflows();
        console.log(`📊 Found ${allWorkflows.length} workflows`);

        // Separate workflows into keep/archive categories
        const workflowsToKeep = [];
        const workflowsToArchive = [];
        const workflowsToActivate = [];

        for (const workflow of allWorkflows) {
            if (this.workflowsToKeep.includes(workflow.name)) {
                workflowsToKeep.push(workflow);
                if (this.workflowsToActivate.includes(workflow.name) && !workflow.active) {
                    workflowsToActivate.push(workflow);
                }
            } else {
                workflowsToArchive.push(workflow);
            }
        }

        console.log(`\n📋 Workflow Categories:`);
        console.log(`   Keep: ${workflowsToKeep.length} workflows`);
        console.log(`   Archive: ${workflowsToArchive.length} workflows`);
        console.log(`   Activate: ${workflowsToActivate.length} workflows`);

        // Phase 1: Export all workflows before archiving
        console.log(`\n📦 Phase 1: Exporting workflows...`);
        const exportResults = [];

        for (const workflow of workflowsToArchive) {
            console.log(`   Exporting: ${workflow.name}`);
            const exportPath = await this.exportWorkflow(workflow.id, workflow.name);
            if (exportPath) {
                exportResults.push({ name: workflow.name, path: exportPath });
                console.log(`   ✅ Exported to: ${exportPath}`);
            } else {
                console.log(`   ❌ Failed to export: ${workflow.name}`);
            }
        }

        console.log(`\n📊 Export Summary: ${exportResults.length}/${workflowsToArchive.length} workflows exported`);

        // Phase 2: Activate required workflows
        console.log(`\n⚡ Phase 2: Activating workflows...`);
        const activationResults = [];

        for (const workflow of workflowsToActivate) {
            console.log(`   Activating: ${workflow.name}`);
            const success = await this.activateWorkflow(workflow.id);
            if (success) {
                activationResults.push({ name: workflow.name, success: true });
                console.log(`   ✅ Activated: ${workflow.name}`);
            } else {
                activationResults.push({ name: workflow.name, success: false });
                console.log(`   ❌ Failed to activate: ${workflow.name}`);
            }
        }

        console.log(`\n📊 Activation Summary: ${activationResults.filter(r => r.success).length}/${workflowsToActivate.length} workflows activated`);

        // Phase 3: Archive duplicate workflows
        console.log(`\n📦 Phase 3: Archiving duplicate workflows...`);
        const archiveResults = [];

        for (const workflow of workflowsToArchive) {
            console.log(`   Archiving: ${workflow.name}`);
            const success = await this.archiveWorkflow(workflow.id);
            if (success) {
                archiveResults.push({ name: workflow.name, success: true });
                console.log(`   ✅ Archived: ${workflow.name}`);
            } else {
                archiveResults.push({ name: workflow.name, success: false });
                console.log(`   ❌ Failed to archive: ${workflow.name}`);
            }
        }

        console.log(`\n📊 Archive Summary: ${archiveResults.filter(r => r.success).length}/${workflowsToArchive.length} workflows archived`);

        // Final summary
        console.log(`\n🎯 WORKFLOW MANAGEMENT COMPLETE`);
        console.log(`===============================`);
        console.log(`✅ Workflows Kept: ${workflowsToKeep.length}`);
        console.log(`📦 Workflows Archived: ${archiveResults.filter(r => r.success).length}`);
        console.log(`⚡ Workflows Activated: ${activationResults.filter(r => r.success).length}`);
        console.log(`📄 Workflows Exported: ${exportResults.length}`);

        // Save execution report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalWorkflows: allWorkflows.length,
                workflowsKept: workflowsToKeep.length,
                workflowsArchived: archiveResults.filter(r => r.success).length,
                workflowsActivated: activationResults.filter(r => r.success).length,
                workflowsExported: exportResults.length
            },
            keptWorkflows: workflowsToKeep.map(w => ({ id: w.id, name: w.name, active: w.active })),
            archivedWorkflows: archiveResults.filter(r => r.success).map(r => r.name),
            activatedWorkflows: activationResults.filter(r => r.success).map(r => r.name),
            exportedWorkflows: exportResults,
            errors: {
                activationFailures: activationResults.filter(r => !r.success),
                archiveFailures: archiveResults.filter(r => !r.success)
            }
        };

        const fs = await import('fs');
        const path = await import('path');
        const reportPath = path.join(process.cwd(), 'docs', 'workflow-management-execution-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`\n📄 Execution report saved to: ${reportPath}`);

        if (archiveResults.some(r => !r.success) || activationResults.some(r => !r.success)) {
            console.log(`\n⚠️  Some operations failed. Check the report for details.`);
        } else {
            console.log(`\n🎉 All operations completed successfully!`);
        }
    }
}

// Run the workflow management plan
async function main() {
    const manager = new Tax4UsWorkflowManager();
    await manager.executeManagementPlan();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} else {
    main().catch(console.error);
}
