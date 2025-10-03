#!/usr/bin/env node

/**
 * 🎯 BMAD METHODOLOGY - COMPREHENSIVE GAP ANALYSIS
 * 
 * This script performs a comprehensive audit to identify:
 * - Missing tables in bases
 * - Missing fields in tables
 * - Empty tables that need population
 * - Data inconsistencies
 */

import axios from 'axios';

console.log('🎯 BMAD METHODOLOGY - COMPREHENSIVE GAP ANALYSIS');
console.log('=================================================');

// Configuration
const CONFIG = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        bases: {
            // Core bases
            rensto: 'appQijHhqqP4z6wGe',
            coreBusiness: 'app4nJpP1ytGukXQT',
            integrations: 'appOvDNYenyx7WITR',

            // Additional bases
            entities: 'appfpXxb5Vq8acLTy',
            customerSuccess: 'appSCBZk03GUCTfhN',
            idempotency: 'app9DhsrZ0VnuEH3t',
            rgidManagement: 'appCGexgpGPkMUPXF',
            operations: 'app6saCaH88uK3kCO',
            financial: 'app6yzlm67lRNuQZD',
            marketing: 'appQhVkIaWoGJG301',
            analytics: 'app9oouVkvTkFjf3t'
        }
    }
};

class ComprehensiveGapAnalysis {
    constructor() {
        this.headers = {
            'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
            'Content-Type': 'application/json'
        };
        this.analysis = {
            bases: {},
            missingTables: [],
            missingFields: [],
            emptyTables: [],
            recommendations: []
        };
    }

    async getBaseInfo(baseId, baseName) {
        console.log(`\n🔍 Analyzing ${baseName} base (${baseId})...`);

        try {
            // Get tables
            const tablesResponse = await axios.get(
                `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
                { headers: this.headers }
            );

            const tables = tablesResponse.data.tables;
            const baseInfo = {
                name: baseName,
                id: baseId,
                tables: {},
                totalTables: tables.length,
                totalRecords: 0
            };

            console.log(`   📋 Found ${tables.length} tables`);

            // Analyze each table
            for (const table of tables) {
                console.log(`   📊 Analyzing table: ${table.name}`);

                // Get table fields
                const fieldsResponse = await axios.get(
                    `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${table.id}/fields`,
                    { headers: this.headers }
                );

                const fields = fieldsResponse.data.fields;

                // Get record count
                let recordCount = 0;
                try {
                    const recordsResponse = await axios.get(
                        `https://api.airtable.com/v0/${baseId}/${table.id}?maxRecords=1`,
                        { headers: this.headers }
                    );
                    recordCount = recordsResponse.data.records.length;
                } catch (error) {
                    // Table might be empty or have access issues
                    recordCount = 0;
                }

                baseInfo.tables[table.name] = {
                    id: table.id,
                    fields: fields.map(f => ({
                        name: f.name,
                        type: f.type,
                        description: f.description || ''
                    })),
                    fieldCount: fields.length,
                    recordCount: recordCount,
                    hasRGID: fields.some(f => f.name === 'RGID'),
                    hasName: fields.some(f => f.name === 'Name'),
                    hasStatus: fields.some(f => f.name === 'Status'),
                    hasDescription: fields.some(f => f.name === 'Description')
                };

                baseInfo.totalRecords += recordCount;

                // Check for missing essential fields
                const missingFields = [];
                if (!baseInfo.tables[table.name].hasRGID) missingFields.push('RGID');
                if (!baseInfo.tables[table.name].hasName) missingFields.push('Name');
                if (!baseInfo.tables[table.name].hasStatus) missingFields.push('Status');
                if (!baseInfo.tables[table.name].hasDescription) missingFields.push('Description');

                if (missingFields.length > 0) {
                    this.analysis.missingFields.push({
                        base: baseName,
                        table: table.name,
                        missing: missingFields
                    });
                }

                // Check for empty tables
                if (recordCount === 0) {
                    this.analysis.emptyTables.push({
                        base: baseName,
                        table: table.name,
                        tableId: table.id
                    });
                }

                console.log(`     • Fields: ${fields.length}, Records: ${recordCount}, RGID: ${baseInfo.tables[table.name].hasRGID ? '✅' : '❌'}`);
            }

            this.analysis.bases[baseName] = baseInfo;
            return baseInfo;

        } catch (error) {
            console.log(`❌ Error analyzing ${baseName} base:`, error.response?.data || error.message);
            return null;
        }
    }

    async analyzeAllBases() {
        console.log('🔧 B - BUSINESS ANALYSIS: Performing comprehensive gap analysis...');

        const expectedTables = {
            rensto: ['Customers', 'Leads', 'Projects', 'Invoices', 'Tasks', 'Workflows', 'n8n Nodes', 'n8n Creds'],
            coreBusiness: ['Companies', 'Contacts', 'Projects', 'Tasks', 'Time Tracking', 'Documents'],
            integrations: ['Integrations', 'n8n Nodes', 'n8n Creds'],
            entities: ['Organizations', 'People', 'Locations', 'Relationships'],
            customerSuccess: ['Customers', 'Support Tickets', 'Onboarding', 'Success Metrics', 'Feedback', 'Retention', 'Health Scores', 'Interventions', 'Success Stories', 'Churn Analysis'],
            idempotency: ['Idempotency Systems', 'Global Entities', 'External Identities', 'Operation Logs', 'Retry Policies', 'Circuit Breakers', 'Health Checks'],
            rgidManagement: ['RGID Entity Management', 'BMAD Projects', 'Entity Types', 'RGID Registry', 'Cross References', 'Audit Trail'],
            operations: ['Workflows', 'Automations', 'Integrations', 'System Logs', 'Maintenance', 'Backups', 'Technical Documentation', 'n8n Creds', 'n8n Nodes', 'Workflow Logs', 'Automation Rules', 'Performance Metrics', 'Error Tracking'],
            financial: ['Invoices', 'Payments', 'Expenses', 'Revenue', 'Budgets', 'Tax Records', 'Financial Reports', 'Budget Tracking', 'Cost Analysis', 'Revenue Forecasting'],
            marketing: ['Leads', 'Opportunities', 'Campaigns', 'Content', 'Social Media', 'Analytics', 'Campaign Performance', 'Lead Scoring', 'Conversion Tracking', 'ROI Analysis'],
            analytics: ['Table 1', 'MCP Servers', 'External Services', 'Metrics Dashboard', 'Alerts', 'Reports', 'Data Sources']
        };

        console.log('\n📋 M - MANAGEMENT PLANNING: Creating gap analysis plan...');
        console.log('\n🏗️ A - ARCHITECTURE DESIGN: Analyzing base architecture...');
        console.log('\n💻 D - DEVELOPMENT IMPLEMENTATION: Performing comprehensive analysis...');

        // Analyze all bases
        for (const [baseKey, baseId] of Object.entries(CONFIG.airtable.bases)) {
            const baseName = baseKey.charAt(0).toUpperCase() + baseKey.slice(1);
            await this.getBaseInfo(baseId, baseName);

            // Check for missing expected tables
            const expected = expectedTables[baseKey] || [];
            const actual = Object.keys(this.analysis.bases[baseName]?.tables || {});
            const missing = expected.filter(table => !actual.includes(table));

            if (missing.length > 0) {
                this.analysis.missingTables.push({
                    base: baseName,
                    missing: missing
                });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Generate recommendations
        this.generateRecommendations();

        return this.analysis;
    }

    generateRecommendations() {
        console.log('\n📝 Generating recommendations...');

        // Missing tables recommendations
        if (this.analysis.missingTables.length > 0) {
            this.analysis.recommendations.push({
                type: 'Missing Tables',
                priority: 'High',
                description: 'Create missing tables to complete base architecture',
                details: this.analysis.missingTables
            });
        }

        // Missing fields recommendations
        if (this.analysis.missingFields.length > 0) {
            this.analysis.recommendations.push({
                type: 'Missing Fields',
                priority: 'Medium',
                description: 'Add essential fields (RGID, Name, Status, Description) to tables',
                details: this.analysis.missingFields
            });
        }

        // Empty tables recommendations
        if (this.analysis.emptyTables.length > 0) {
            this.analysis.recommendations.push({
                type: 'Empty Tables',
                priority: 'Low',
                description: 'Populate empty tables with initial data',
                details: this.analysis.emptyTables
            });
        }

        // Data population recommendations
        const basesWithLowData = Object.entries(this.analysis.bases)
            .filter(([name, base]) => base.totalRecords < 10)
            .map(([name, base]) => ({ base: name, records: base.totalRecords }));

        if (basesWithLowData.length > 0) {
            this.analysis.recommendations.push({
                type: 'Data Population',
                priority: 'Medium',
                description: 'Populate bases with initial business data',
                details: basesWithLowData
            });
        }
    }

    printAnalysisReport() {
        console.log('\n🎉 COMPREHENSIVE GAP ANALYSIS COMPLETE!');
        console.log('=========================================');

        // Summary statistics
        const totalBases = Object.keys(this.analysis.bases).length;
        const totalTables = Object.values(this.analysis.bases).reduce((sum, base) => sum + base.totalTables, 0);
        const totalRecords = Object.values(this.analysis.bases).reduce((sum, base) => sum + base.totalRecords, 0);

        console.log(`📊 Summary Statistics:`);
        console.log(`   • Total Bases: ${totalBases}`);
        console.log(`   • Total Tables: ${totalTables}`);
        console.log(`   • Total Records: ${totalRecords}`);
        console.log(`   • Missing Tables: ${this.analysis.missingTables.length}`);
        console.log(`   • Missing Fields: ${this.analysis.missingFields.length}`);
        console.log(`   • Empty Tables: ${this.analysis.emptyTables.length}`);

        // Base-by-base breakdown
        console.log(`\n📋 Base-by-Base Breakdown:`);
        for (const [baseName, baseInfo] of Object.entries(this.analysis.bases)) {
            console.log(`   • ${baseName}: ${baseInfo.totalTables} tables, ${baseInfo.totalRecords} records`);
        }

        // Recommendations
        if (this.analysis.recommendations.length > 0) {
            console.log(`\n🎯 Recommendations:`);
            for (const rec of this.analysis.recommendations) {
                console.log(`   ${rec.priority === 'High' ? '🔴' : rec.priority === 'Medium' ? '🟡' : '🟢'} ${rec.type} (${rec.priority} Priority)`);
                console.log(`      ${rec.description}`);
            }
        } else {
            console.log(`\n✅ No major gaps identified! All bases are properly configured.`);
        }

        return this.analysis;
    }
}

// Execute
const analysis = new ComprehensiveGapAnalysis();
analysis.analyzeAllBases().then(results => {
    analysis.printAnalysisReport();
    console.log('\n✅ Comprehensive gap analysis completed');
    process.exit(0);
}).catch(error => {
    console.log('❌ Error:', error.message);
    process.exit(1);
});
