#!/usr/bin/env node
import axios from 'axios';

class TechStackComprehensiveAudit {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };

        // Complete Rensto tech stack
        this.completeTechStack = {
            // Financial & Payment Systems
            quickbooks: { name: 'QuickBooks', category: 'Financial', priority: 'High' },
            stripe: { name: 'Stripe', category: 'Payment', priority: 'High' },

            // Infrastructure & Hosting
            cloudflare: { name: 'Cloudflare', category: 'Infrastructure', priority: 'High' },
            racknerd: { name: 'RackNerd VPS', category: 'Infrastructure', priority: 'High' },

            // Document & Signature Systems
            esignatures: { name: 'eSignatures', category: 'Documentation', priority: 'Medium' },

            // Form & Survey Systems
            typeform: { name: 'Typeform', category: 'Forms', priority: 'Medium' },

            // Website & CMS
            webflow: { name: 'Webflow', category: 'CMS', priority: 'High' },

            // Database & Storage
            airtable: { name: 'Airtable', category: 'Database', priority: 'High' },
            mongodb: { name: 'MongoDB', category: 'Database', priority: 'High' },

            // AI & ML Services
            huggingface: { name: 'Hugging Face', category: 'AI/ML', priority: 'Medium' },
            claude: { name: 'Claude AI', category: 'AI/ML', priority: 'High' },
            openrouter: { name: 'OpenRouter', category: 'AI/ML', priority: 'Medium' },
            openai: { name: 'OpenAI', category: 'AI/ML', priority: 'High' },

            // Monitoring & Error Tracking
            rollbar: { name: 'Rollbar', category: 'Monitoring', priority: 'Medium' },

            // Automation & Workflows
            apify: { name: 'Apify', category: 'Automation', priority: 'Medium' },
            n8n: { name: 'n8n', category: 'Automation', priority: 'High' },

            // Integration Platforms
            boostSpace: { name: 'Boost.space', category: 'Integration', priority: 'Medium' },

            // Development & Version Control
            github: { name: 'GitHub', category: 'Development', priority: 'High' },

            // Partnership & Affiliate
            partnerstack: { name: 'PartnerStack', category: 'Partnership', priority: 'Medium' },

            // Rensto Internal Systems
            lightrag: { name: 'Lightrag', category: 'Internal', priority: 'High' },
            bmad: { name: 'BMAD Methodology', category: 'Internal', priority: 'High' },
            mcpServers: { name: 'MCP Servers', category: 'Internal', priority: 'High' },
            adminPortal: { name: 'Admin Portal', category: 'Internal', priority: 'High' },
            customerPortal: { name: 'Customer Portal', category: 'Internal', priority: 'High' }
        };

        // All Rensto bases for comprehensive audit
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
    }

    async getRecords(baseId, tableId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${baseId}/${tableId}`, { headers: this.headers });
            return response.data.records || [];
        } catch (error) {
            console.error(`❌ Failed to get records from ${tableId}:`, error.response?.data || error.message);
            return [];
        }
    }

    searchForTechStackInRecords(records, techStackName) {
        const found = [];
        records.forEach((record, index) => {
            const fields = record.fields;
            const searchText = JSON.stringify(fields).toLowerCase();
            const techName = techStackName.toLowerCase();

            if (searchText.includes(techName) ||
                (fields.Name && fields.Name.toLowerCase().includes(techName)) ||
                (fields.Description && fields.Description.toLowerCase().includes(techName)) ||
                (fields.Notes && fields.Notes.toLowerCase().includes(techName)) ||
                (fields.Message && fields.Message.toLowerCase().includes(techName)) ||
                (fields.Details && fields.Details.toLowerCase().includes(techName))) {
                found.push({
                    recordIndex: index + 1,
                    recordId: record.id,
                    fields: fields,
                    baseName: record.baseName,
                    tableName: record.tableName
                });
            }
        });
        return found;
    }

    async auditTechStackCoverage() {
        console.log('🔍 COMPREHENSIVE TECH STACK AUDIT');
        console.log('==================================');
        console.log(`📊 Checking coverage for ${Object.keys(this.completeTechStack).length} tech stack items`);

        const coverage = {
            documented: [],
            missing: [],
            partial: []
        };

        // Get all records from all bases
        const allRecords = [];

        for (const [key, base] of Object.entries(this.renstoBases)) {
            for (const [tableKey, tableId] of Object.entries(base.tables)) {
                const records = await this.getRecords(base.id, tableId);
                records.forEach(record => {
                    record.baseName = base.name;
                    record.tableName = tableKey;
                });
                allRecords.push(...records);
            }
        }

        console.log(`📋 Total records analyzed: ${allRecords.length}`);

        // Check each tech stack item
        for (const [techKey, techInfo] of Object.entries(this.completeTechStack)) {
            const found = this.searchForTechStackInRecords(allRecords, techInfo.name);

            if (found.length === 0) {
                coverage.missing.push({
                    tech: techKey,
                    name: techInfo.name,
                    category: techInfo.category,
                    priority: techInfo.priority
                });
            } else if (found.length === 1) {
                coverage.documented.push({
                    tech: techKey,
                    name: techInfo.name,
                    category: techInfo.category,
                    priority: techInfo.priority,
                    records: found
                });
            } else {
                coverage.partial.push({
                    tech: techKey,
                    name: techInfo.name,
                    category: techInfo.category,
                    priority: techInfo.priority,
                    records: found
                });
            }
        }

        return coverage;
    }

    async auditCriticalSystems() {
        console.log('\n🚨 CRITICAL SYSTEMS AUDIT');
        console.log('=========================');

        const criticalSystems = [
            'quickbooks', 'stripe', 'cloudflare', 'racknerd', 'webflow',
            'airtable', 'mongodb', 'claude', 'openai', 'n8n', 'github',
            'lightrag', 'bmad', 'mcpServers', 'adminPortal', 'customerPortal'
        ];

        const criticalIssues = [];

        for (const system of criticalSystems) {
            const techInfo = this.completeTechStack[system];
            if (!techInfo) {
                criticalIssues.push(`❌ CRITICAL: ${system} not found in tech stack definition`);
                continue;
            }

            // Check if this critical system is properly documented
            const allRecords = [];
            for (const [key, base] of Object.entries(this.renstoBases)) {
                for (const [tableKey, tableId] of Object.entries(base.tables)) {
                    const records = await this.getRecords(base.id, tableId);
                    allRecords.push(...records);
                }
            }

            const found = this.searchForTechStackInRecords(allRecords, techInfo.name);

            if (found.length === 0) {
                criticalIssues.push(`🚨 CRITICAL: ${techInfo.name} (${system}) - NO DOCUMENTATION FOUND`);
            } else if (found.length === 1) {
                console.log(`✅ CRITICAL: ${techInfo.name} (${system}) - Documented`);
            } else {
                console.log(`⚠️  CRITICAL: ${techInfo.name} (${system}) - Multiple entries found`);
            }
        }

        return criticalIssues;
    }

    async auditIntegrationDependencies() {
        console.log('\n🔗 INTEGRATION DEPENDENCIES AUDIT');
        console.log('==================================');

        const integrationDependencies = [
            { primary: 'n8n', depends: ['airtable', 'mongodb', 'github'] },
            { primary: 'adminPortal', depends: ['airtable', 'mongodb', 'n8n'] },
            { primary: 'customerPortal', depends: ['airtable', 'mongodb', 'n8n'] },
            { primary: 'lightrag', depends: ['racknerd', 'github', 'n8n'] },
            { primary: 'mcpServers', depends: ['racknerd', 'n8n', 'airtable'] },
            { primary: 'webflow', depends: ['cloudflare', 'airtable'] },
            { primary: 'financial', depends: ['quickbooks', 'stripe'] }
        ];

        const dependencyIssues = [];

        for (const integration of integrationDependencies) {
            const primaryTech = this.completeTechStack[integration.primary];
            if (!primaryTech) {
                dependencyIssues.push(`❌ INTEGRATION: ${integration.primary} not found in tech stack`);
                continue;
            }

            // Check if primary system is documented
            const allRecords = [];
            for (const [key, base] of Object.entries(this.renstoBases)) {
                for (const [tableKey, tableId] of Object.entries(base.tables)) {
                    const records = await this.getRecords(base.id, tableId);
                    allRecords.push(...records);
                }
            }

            const primaryFound = this.searchForTechStackInRecords(allRecords, primaryTech.name);

            if (primaryFound.length === 0) {
                dependencyIssues.push(`🚨 INTEGRATION: ${primaryTech.name} (${integration.primary}) - Primary system not documented`);
                continue;
            }

            // Check dependencies
            for (const dep of integration.depends) {
                const depTech = this.completeTechStack[dep];
                if (!depTech) {
                    dependencyIssues.push(`❌ INTEGRATION: ${dep} dependency not found in tech stack`);
                    continue;
                }

                const depFound = this.searchForTechStackInRecords(allRecords, depTech.name);

                if (depFound.length === 0) {
                    dependencyIssues.push(`⚠️  INTEGRATION: ${primaryTech.name} depends on ${depTech.name} (${dep}) - Dependency not documented`);
                }
            }
        }

        return dependencyIssues;
    }

    async performComprehensiveAudit() {
        console.log('🎯 COMPREHENSIVE TECH STACK AUDIT');
        console.log('==================================');

        const coverage = await this.auditTechStackCoverage();
        const criticalIssues = await this.auditCriticalSystems();
        const integrationIssues = await this.auditIntegrationDependencies();

        // Generate comprehensive report
        console.log('\n📋 COMPREHENSIVE TECH STACK AUDIT REPORT');
        console.log('==========================================');

        console.log(`\n✅ DOCUMENTED SYSTEMS (${coverage.documented.length}):`);
        coverage.documented.forEach(item => {
            console.log(`   ✅ ${item.name} (${item.category}) - ${item.priority} priority`);
        });

        console.log(`\n❌ MISSING SYSTEMS (${coverage.missing.length}):`);
        coverage.missing.forEach(item => {
            console.log(`   ❌ ${item.name} (${item.category}) - ${item.priority} priority`);
        });

        console.log(`\n⚠️  PARTIAL DOCUMENTATION (${coverage.partial.length}):`);
        coverage.partial.forEach(item => {
            console.log(`   ⚠️  ${item.name} (${item.category}) - ${item.priority} priority - ${item.records.length} entries`);
        });

        console.log(`\n🚨 CRITICAL ISSUES (${criticalIssues.length}):`);
        criticalIssues.forEach(issue => {
            console.log(`   ${issue}`);
        });

        console.log(`\n🔗 INTEGRATION ISSUES (${integrationIssues.length}):`);
        integrationIssues.forEach(issue => {
            console.log(`   ${issue}`);
        });

        const totalIssues = coverage.missing.length + criticalIssues.length + integrationIssues.length;
        const coveragePercentage = Math.round((coverage.documented.length / Object.keys(this.completeTechStack).length) * 100);

        console.log(`\n📊 SUMMARY:`);
        console.log(`   Tech Stack Coverage: ${coveragePercentage}%`);
        console.log(`   Documented Systems: ${coverage.documented.length}/${Object.keys(this.completeTechStack).length}`);
        console.log(`   Missing Systems: ${coverage.missing.length}`);
        console.log(`   Critical Issues: ${criticalIssues.length}`);
        console.log(`   Integration Issues: ${integrationIssues.length}`);
        console.log(`   Total Issues: ${totalIssues}`);

        if (totalIssues === 0) {
            console.log(`\n🎉 EXCELLENT! All tech stack systems are properly documented!`);
        } else {
            console.log(`\n🔧 RECOMMENDATION: Address missing systems and critical issues to ensure complete coverage.`);
        }

        return {
            coverage,
            criticalIssues,
            integrationIssues,
            totalIssues,
            coveragePercentage
        };
    }
}

// Execute the comprehensive tech stack audit
const auditor = new TechStackComprehensiveAudit();
auditor.performComprehensiveAudit().catch(console.error);
