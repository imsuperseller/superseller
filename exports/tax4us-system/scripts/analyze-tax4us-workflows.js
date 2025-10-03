#!/usr/bin/env node

import https from 'https';

class Tax4UsWorkflowAnalyzer {
    constructor() {
        this.baseUrl = 'https://tax4usllc.app.n8n.cloud';
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw';

        this.workflowCategories = {
            podcast: [],
            socialMedia: [],
            wordpress: [],
            content: [],
            automation: [],
            integration: [],
            test: [],
            other: []
        };
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

    categorizeWorkflow(workflow) {
        const name = workflow.name.toLowerCase();
        const tags = (workflow.tags || []).join(' ').toLowerCase();

        // Check for specific agent types
        if (name.includes('podcast') || name.includes('audio') || name.includes('captivate')) {
            return 'podcast';
        }
        if (name.includes('social') || name.includes('media') || name.includes('facebook') || name.includes('instagram') || name.includes('linkedin')) {
            return 'socialMedia';
        }
        if (name.includes('wordpress') || name.includes('blog') || name.includes('wp') || name.includes('content')) {
            return 'wordpress';
        }
        if (name.includes('content') || name.includes('ai') || name.includes('generate')) {
            return 'content';
        }
        if (name.includes('automation') || name.includes('workflow') || name.includes('process')) {
            return 'automation';
        }
        if (name.includes('integration') || name.includes('api') || name.includes('webhook')) {
            return 'integration';
        }
        if (name.includes('test') || name.includes('demo') || name.includes('example')) {
            return 'test';
        }

        return 'other';
    }

    analyzeWorkflowStructure(workflow) {
        const nodes = workflow.nodes || [];
        const connections = workflow.connections || {};

        // Analyze node types
        const nodeTypes = {};
        const triggers = [];
        const actions = [];

        nodes.forEach(node => {
            const type = node.type || 'unknown';
            nodeTypes[type] = (nodeTypes[type] || 0) + 1;

            if (type.includes('trigger') || type.includes('webhook') || type.includes('schedule')) {
                triggers.push({
                    name: node.name,
                    type: type,
                    parameters: node.parameters || {}
                });
            } else {
                actions.push({
                    name: node.name,
                    type: type,
                    parameters: node.parameters || {}
                });
            }
        });

        // Analyze connections
        const connectionCount = Object.keys(connections).length;
        const hasLoops = this.detectLoops(connections);

        return {
            nodeCount: nodes.length,
            nodeTypes,
            triggers,
            actions,
            connectionCount,
            hasLoops,
            complexity: this.calculateComplexity(nodes.length, connectionCount, triggers.length)
        };
    }

    detectLoops(connections) {
        // Simple loop detection - check if any node connects back to itself or earlier nodes
        const visited = new Set();
        const recursionStack = new Set();

        const hasCycle = (nodeId) => {
            if (recursionStack.has(nodeId)) return true;
            if (visited.has(nodeId)) return false;

            visited.add(nodeId);
            recursionStack.add(nodeId);

            const nodeConnections = connections[nodeId];
            if (nodeConnections) {
                for (const output of Object.values(nodeConnections)) {
                    for (const connection of output) {
                        if (hasCycle(connection.node)) return true;
                    }
                }
            }

            recursionStack.delete(nodeId);
            return false;
        };

        for (const nodeId of Object.keys(connections)) {
            if (hasCycle(nodeId)) return true;
        }

        return false;
    }

    calculateComplexity(nodeCount, connectionCount, triggerCount) {
        let score = 0;

        // Node count factor
        if (nodeCount <= 5) score += 1;
        else if (nodeCount <= 10) score += 2;
        else if (nodeCount <= 20) score += 3;
        else score += 4;

        // Connection density factor
        const density = connectionCount / Math.max(nodeCount, 1);
        if (density <= 0.5) score += 1;
        else if (density <= 1.0) score += 2;
        else if (density <= 1.5) score += 3;
        else score += 4;

        // Trigger complexity factor
        if (triggerCount === 1) score += 1;
        else if (triggerCount === 2) score += 2;
        else score += 3;

        if (score <= 3) return 'Low';
        if (score <= 6) return 'Medium';
        if (score <= 9) return 'High';
        return 'Very High';
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

    async analyzeAllWorkflows() {
        console.log('🔍 Analyzing Tax4Us Workflows...');
        console.log(`🎯 Target: ${this.baseUrl}`);

        // Get all workflows
        const response = await this.makeRequest('GET', '/api/v1/workflows?limit=100');
        if (response.statusCode !== 200) {
            console.error('Failed to fetch workflows:', response.data);
            return;
        }

        const workflows = response.data.data || [];
        console.log(`📊 Found ${workflows.length} workflows`);

        // Analyze each workflow
        const analysisResults = [];

        for (const workflow of workflows) {
            console.log(`\n🔍 Analyzing: ${workflow.name}`);

            // Get detailed workflow data
            const details = await this.getWorkflowDetails(workflow.id);
            if (!details) continue;

            // Categorize workflow
            const category = this.categorizeWorkflow(workflow);
            this.workflowCategories[category].push(workflow);

            // Analyze structure
            const structure = this.analyzeWorkflowStructure(details);

            // Extract key information
            const analysis = {
                id: workflow.id,
                name: workflow.name,
                category,
                active: workflow.active,
                createdAt: workflow.createdAt,
                updatedAt: workflow.updatedAt,
                tags: workflow.tags || [],
                structure,
                webhookPaths: this.extractWebhookPaths(details),
                credentials: this.extractCredentials(details),
                purpose: this.inferPurpose(workflow.name, details)
            };

            analysisResults.push(analysis);

            console.log(`   📋 Category: ${category}`);
            console.log(`   🔧 Nodes: ${structure.nodeCount}`);
            console.log(`   🔗 Connections: ${structure.connectionCount}`);
            console.log(`   📊 Complexity: ${structure.complexity}`);
            console.log(`   ⚡ Active: ${workflow.active ? 'Yes' : 'No'}`);
        }

        return analysisResults;
    }

    extractWebhookPaths(workflow) {
        const webhooks = [];
        const nodes = workflow.nodes || [];

        nodes.forEach(node => {
            if (node.type === 'n8n-nodes-base.webhook') {
                const path = node.parameters?.path || node.parameters?.httpMethod || 'unknown';
                webhooks.push({
                    name: node.name,
                    path: path,
                    method: node.parameters?.httpMethod || 'POST'
                });
            }
        });

        return webhooks;
    }

    extractCredentials(workflow) {
        const credentials = new Set();
        const nodes = workflow.nodes || [];

        nodes.forEach(node => {
            if (node.credentials) {
                Object.values(node.credentials).forEach(cred => {
                    if (cred.id) credentials.add(cred.id);
                });
            }
        });

        return Array.from(credentials);
    }

    inferPurpose(name, workflow) {
        const nameLower = name.toLowerCase();
        const nodes = workflow.nodes || [];

        // Check for specific patterns
        if (nameLower.includes('podcast')) return 'Podcast content creation and management';
        if (nameLower.includes('social')) return 'Social media content automation';
        if (nameLower.includes('blog') || nameLower.includes('wordpress')) return 'Blog content creation and publishing';
        if (nameLower.includes('content')) return 'Content generation and management';
        if (nameLower.includes('automation')) return 'Business process automation';
        if (nameLower.includes('integration')) return 'System integration and data flow';
        if (nameLower.includes('test')) return 'Testing and development';

        // Analyze node types for clues
        const nodeTypes = nodes.map(n => n.type).join(' ');
        if (nodeTypes.includes('openai') || nodeTypes.includes('anthropic')) return 'AI-powered content generation';
        if (nodeTypes.includes('webhook')) return 'API integration and webhook processing';
        if (nodeTypes.includes('schedule')) return 'Scheduled automation';

        return 'General automation workflow';
    }

    generateRecommendations(analysisResults) {
        const recommendations = {
            keep: [],
            archive: [],
            merge: [],
            update: []
        };

        // Group by category and analyze duplicates
        const categoryGroups = {};
        analysisResults.forEach(workflow => {
            if (!categoryGroups[workflow.category]) {
                categoryGroups[workflow.category] = [];
            }
            categoryGroups[workflow.category].push(workflow);
        });

        // Analyze each category
        Object.entries(categoryGroups).forEach(([category, workflows]) => {
            console.log(`\n📋 Analyzing ${category} category (${workflows.length} workflows):`);

            // Sort by update date (newest first)
            workflows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            if (workflows.length === 1) {
                recommendations.keep.push(workflows[0]);
                console.log(`   ✅ Keep: ${workflows[0].name} (only one in category)`);
            } else {
                // Find the most recent and active workflow
                const activeWorkflows = workflows.filter(w => w.active);
                const latestWorkflow = workflows[0];

                if (activeWorkflows.length === 1) {
                    recommendations.keep.push(activeWorkflows[0]);
                    recommendations.archive.push(...workflows.filter(w => w.id !== activeWorkflows[0].id));
                    console.log(`   ✅ Keep: ${activeWorkflows[0].name} (only active)`);
                    console.log(`   📦 Archive: ${workflows.length - 1} inactive workflows`);
                } else if (activeWorkflows.length > 1) {
                    // Multiple active workflows - need manual review
                    recommendations.keep.push(latestWorkflow);
                    recommendations.update.push(...activeWorkflows.filter(w => w.id !== latestWorkflow.id));
                    recommendations.archive.push(...workflows.filter(w => !w.active));
                    console.log(`   ⚠️  Multiple active workflows - manual review needed`);
                    console.log(`   ✅ Keep: ${latestWorkflow.name} (most recent)`);
                    console.log(`   🔄 Update: ${activeWorkflows.length - 1} other active workflows`);
                } else {
                    // No active workflows
                    recommendations.keep.push(latestWorkflow);
                    recommendations.archive.push(...workflows.slice(1));
                    console.log(`   ✅ Keep: ${latestWorkflow.name} (most recent, needs activation)`);
                    console.log(`   📦 Archive: ${workflows.length - 1} older workflows`);
                }
            }
        });

        return recommendations;
    }

    printSummary(analysisResults, recommendations) {
        console.log('\n🎯 TAX4US WORKFLOW ANALYSIS SUMMARY');
        console.log('=====================================');

        console.log('\n📊 CATEGORY BREAKDOWN:');
        Object.entries(this.workflowCategories).forEach(([category, workflows]) => {
            if (workflows.length > 0) {
                const active = workflows.filter(w => w.active).length;
                console.log(`   ${category}: ${workflows.length} workflows (${active} active)`);
            }
        });

        console.log('\n✅ RECOMMENDATIONS:');
        console.log(`   Keep: ${recommendations.keep.length} workflows`);
        console.log(`   Archive: ${recommendations.archive.length} workflows`);
        console.log(`   Update: ${recommendations.update.length} workflows`);
        console.log(`   Merge: ${recommendations.merge.length} workflows`);

        console.log('\n🎯 WORKFLOWS TO KEEP:');
        recommendations.keep.forEach(workflow => {
            console.log(`   ✅ ${workflow.name} (${workflow.category}) - ${workflow.active ? 'Active' : 'Inactive'}`);
        });

        if (recommendations.archive.length > 0) {
            console.log('\n📦 WORKFLOWS TO ARCHIVE:');
            recommendations.archive.forEach(workflow => {
                console.log(`   📦 ${workflow.name} (${workflow.category})`);
            });
        }

        if (recommendations.update.length > 0) {
            console.log('\n🔄 WORKFLOWS TO UPDATE:');
            recommendations.update.forEach(workflow => {
                console.log(`   🔄 ${workflow.name} (${workflow.category}) - Review for merging or archiving`);
            });
        }

        console.log('\n📋 NEXT STEPS:');
        console.log('   1. Review the recommendations above');
        console.log('   2. Archive duplicate/inactive workflows');
        console.log('   3. Update credentials in kept workflows');
        console.log('   4. Test all active workflows');
        console.log('   5. Document workflow purposes and usage');
    }

    async run() {
        try {
            const analysisResults = await this.analyzeAllWorkflows();
            const recommendations = this.generateRecommendations(analysisResults);
            this.printSummary(analysisResults, recommendations);

            // Save detailed report
            const report = {
                timestamp: new Date().toISOString(),
                totalWorkflows: analysisResults.length,
                categories: this.workflowCategories,
                analysis: analysisResults,
                recommendations
            };

            const fs = await import('fs');
            const path = await import('path');
            const reportPath = path.join(process.cwd(), 'docs', 'tax4us-workflow-analysis.json');
            const reportDir = path.dirname(reportPath);

            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }

            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📄 Detailed report saved to: ${reportPath}`);

        } catch (error) {
            console.error('Analysis failed:', error.message);
        }
    }
}

// Run the analysis
async function main() {
    const analyzer = new Tax4UsWorkflowAnalyzer();
    await analyzer.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} else {
    main().catch(console.error);
}
