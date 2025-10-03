#!/usr/bin/env node
import axios from 'axios';

class ComprehensiveBusinessSystemsAudit {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };

        // Comprehensive business systems inventory
        this.businessSystems = {
            // Customer Systems
            customerLogin: { name: 'Customer Login System', category: 'Customer', priority: 'Critical', status: 'Missing' },
            customerPortal: { name: 'Customer Portal', category: 'Customer', priority: 'Critical', status: 'Partial' },
            customerOnboarding: { name: 'Customer Onboarding Process', category: 'Customer', priority: 'High', status: 'Missing' },
            customerSupport: { name: 'Customer Support System', category: 'Customer', priority: 'High', status: 'Missing' },

            // Affiliate & Partnership Systems
            partnerStackAffiliate: { name: 'PartnerStack Affiliate System', category: 'Partnership', priority: 'High', status: 'Missing' },
            n8nAffiliateLinks: { name: 'n8n Affiliate Links System', category: 'Partnership', priority: 'High', status: 'Missing' },
            referralSystem: { name: 'Gamified Referral System', category: 'Partnership', priority: 'Medium', status: 'Missing' },
            commissionTracking: { name: 'Commission Tracking System', category: 'Partnership', priority: 'High', status: 'Missing' },

            // Business Goals & Strategy
            businessGoals: { name: 'Business Goals & KPIs', category: 'Strategy', priority: 'Critical', status: 'Missing' },
            revenueTargets: { name: 'Revenue Targets & Forecasting', category: 'Strategy', priority: 'Critical', status: 'Missing' },
            growthMetrics: { name: 'Growth Metrics & Analytics', category: 'Strategy', priority: 'High', status: 'Missing' },
            competitiveAnalysis: { name: 'Competitive Analysis System', category: 'Strategy', priority: 'Medium', status: 'Missing' },

            // Customer Journey & Automation
            customerJourney: { name: 'Complete Customer Journey Mapping', category: 'Process', priority: 'Critical', status: 'Missing' },
            leadNurturing: { name: 'Lead Nurturing Automation', category: 'Process', priority: 'High', status: 'Missing' },
            salesFunnel: { name: 'Sales Funnel Automation', category: 'Process', priority: 'High', status: 'Missing' },
            onboardingAutomation: { name: 'Onboarding Automation', category: 'Process', priority: 'High', status: 'Missing' },

            // Pricing & Revenue
            pricingStrategy: { name: 'Pricing Strategy & Models', category: 'Revenue', priority: 'Critical', status: 'Missing' },
            pricingAutomation: { name: 'Dynamic Pricing System', category: 'Revenue', priority: 'Medium', status: 'Missing' },
            subscriptionManagement: { name: 'Subscription Management', category: 'Revenue', priority: 'High', status: 'Missing' },
            revenueOptimization: { name: 'Revenue Optimization System', category: 'Revenue', priority: 'High', status: 'Missing' },

            // Rensto Agents & Automation
            renstoAgents: { name: 'Rensto AI Agents', category: 'Automation', priority: 'Critical', status: 'Missing' },
            agentMigration: { name: 'Agent Migration to VPS', category: 'Infrastructure', priority: 'High', status: 'Missing' },
            cursorToVps: { name: 'Cursor to VPS Migration', category: 'Infrastructure', priority: 'High', status: 'Missing' },
            agentOrchestration: { name: 'Agent Orchestration System', category: 'Automation', priority: 'High', status: 'Missing' },

            // Manual Processes to Automate
            manualProcesses: { name: 'Manual Process Inventory', category: 'Process', priority: 'High', status: 'Missing' },
            automationOpportunities: { name: 'Automation Opportunities', category: 'Process', priority: 'High', status: 'Missing' },
            workflowOptimization: { name: 'Workflow Optimization', category: 'Process', priority: 'Medium', status: 'Missing' },

            // Security & Compliance
            securitySystem: { name: 'Security & Compliance System', category: 'Security', priority: 'Critical', status: 'Missing' },
            dataProtection: { name: 'Data Protection & Privacy', category: 'Security', priority: 'Critical', status: 'Missing' },
            auditTrail: { name: 'Audit Trail System', category: 'Security', priority: 'Medium', status: 'Missing' }
        };

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
                name: 'Rensto (Re)',
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

    searchForBusinessSystemsInRecords(records, systemName) {
        const found = [];
        records.forEach((record, index) => {
            const fields = record.fields;
            const searchText = JSON.stringify(fields).toLowerCase();
            const systemNameLower = systemName.toLowerCase();

            if (searchText.includes(systemNameLower) ||
                (fields.Name && fields.Name.toLowerCase().includes(systemNameLower)) ||
                (fields.Description && fields.Description.toLowerCase().includes(systemNameLower)) ||
                (fields.Notes && fields.Notes.toLowerCase().includes(systemNameLower)) ||
                (fields.Message && fields.Message.toLowerCase().includes(systemNameLower)) ||
                (fields.Details && fields.Details.toLowerCase().includes(systemNameLower))) {
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

    async auditBusinessSystemsCoverage() {
        console.log('🔍 COMPREHENSIVE BUSINESS SYSTEMS AUDIT');
        console.log('========================================');
        console.log(`📊 Checking coverage for ${Object.keys(this.businessSystems).length} business systems`);

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

        // Check each business system
        for (const [systemKey, systemInfo] of Object.entries(this.businessSystems)) {
            const found = this.searchForBusinessSystemsInRecords(allRecords, systemInfo.name);

            if (found.length === 0) {
                coverage.missing.push({
                    system: systemKey,
                    name: systemInfo.name,
                    category: systemInfo.category,
                    priority: systemInfo.priority,
                    status: systemInfo.status
                });
            } else if (found.length === 1) {
                coverage.documented.push({
                    system: systemKey,
                    name: systemInfo.name,
                    category: systemInfo.category,
                    priority: systemInfo.priority,
                    status: systemInfo.status,
                    records: found
                });
            } else {
                coverage.partial.push({
                    system: systemKey,
                    name: systemInfo.name,
                    category: systemInfo.category,
                    priority: systemInfo.priority,
                    status: systemInfo.status,
                    records: found
                });
            }
        }

        return coverage;
    }

    async auditCustomerJourney() {
        console.log('\n👥 CUSTOMER JOURNEY AUDIT');
        console.log('==========================');

        const customerJourneyStages = [
            { stage: 'Awareness', systems: ['Marketing', 'SEO', 'Social Media'] },
            { stage: 'Interest', systems: ['Lead Generation', 'Content Marketing', 'Email Marketing'] },
            { stage: 'Consideration', systems: ['Sales Funnel', 'Product Demo', 'Case Studies'] },
            { stage: 'Decision', systems: ['Pricing', 'Contract Management', 'Payment Processing'] },
            { stage: 'Onboarding', systems: ['Customer Portal', 'Setup Process', 'Training'] },
            { stage: 'Retention', systems: ['Customer Support', 'Success Management', 'Upselling'] },
            { stage: 'Advocacy', systems: ['Referral Program', 'Reviews', 'Testimonials'] }
        ];

        const journeyIssues = [];

        for (const stage of customerJourneyStages) {
            console.log(`\n📋 ${stage.stage} Stage:`);

            for (const system of stage.systems) {
                // Check if this system is documented
                const allRecords = [];
                for (const [key, base] of Object.entries(this.renstoBases)) {
                    for (const [tableKey, tableId] of Object.entries(base.tables)) {
                        const records = await this.getRecords(base.id, tableId);
                        allRecords.push(...records);
                    }
                }

                const found = this.searchForBusinessSystemsInRecords(allRecords, system);

                if (found.length === 0) {
                    console.log(`   ❌ ${system} - NOT DOCUMENTED`);
                    journeyIssues.push(`${stage.stage}: ${system} - Missing`);
                } else if (found.length === 1) {
                    console.log(`   ✅ ${system} - Documented`);
                } else {
                    console.log(`   ⚠️  ${system} - Multiple entries (${found.length})`);
                }
            }
        }

        return journeyIssues;
    }

    async auditAutomationOpportunities() {
        console.log('\n⚙️ AUTOMATION OPPORTUNITIES AUDIT');
        console.log('==================================');

        const automationAreas = [
            { area: 'Lead Management', current: 'Manual', potential: 'Automated Lead Scoring & Routing' },
            { area: 'Customer Onboarding', current: 'Manual', potential: 'Automated Setup & Training' },
            { area: 'Billing & Invoicing', current: 'Semi-Automated', potential: 'Fully Automated Billing' },
            { area: 'Customer Support', current: 'Manual', potential: 'AI-Powered Support System' },
            { area: 'Reporting & Analytics', current: 'Manual', potential: 'Automated Dashboard & Alerts' },
            { area: 'Content Creation', current: 'Manual', potential: 'AI-Generated Content' },
            { area: 'Social Media', current: 'Manual', potential: 'Automated Social Media Management' },
            { area: 'Email Marketing', current: 'Semi-Automated', potential: 'Advanced Email Automation' },
            { area: 'Affiliate Management', current: 'Manual', potential: 'Automated Commission Tracking' },
            { area: 'Project Management', current: 'Manual', potential: 'Automated Project Tracking' }
        ];

        const automationOpportunities = [];

        for (const area of automationAreas) {
            console.log(`\n🔧 ${area.area}:`);
            console.log(`   Current: ${area.current}`);
            console.log(`   Potential: ${area.potential}`);

            automationOpportunities.push({
                area: area.area,
                current: area.current,
                potential: area.potential,
                priority: area.current === 'Manual' ? 'High' : 'Medium'
            });
        }

        return automationOpportunities;
    }

    async auditRenstoAgents() {
        console.log('\n🤖 RENSTO AGENTS AUDIT');
        console.log('======================');

        const renstoAgents = [
            { name: 'Content Creation Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Customer Support Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Lead Qualification Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Social Media Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Email Marketing Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Analytics Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Billing Agent', location: 'Cursor', migration: 'To VPS n8n' },
            { name: 'Onboarding Agent', location: 'Cursor', migration: 'To VPS n8n' }
        ];

        const agentIssues = [];

        for (const agent of renstoAgents) {
            console.log(`\n🤖 ${agent.name}:`);
            console.log(`   Current Location: ${agent.location}`);
            console.log(`   Migration Plan: ${agent.migration}`);

            agentIssues.push({
                agent: agent.name,
                currentLocation: agent.location,
                migrationPlan: agent.migration,
                status: 'Pending Migration'
            });
        }

        return agentIssues;
    }

    async performComprehensiveBusinessAudit() {
        console.log('🎯 COMPREHENSIVE BUSINESS SYSTEMS AUDIT');
        console.log('=======================================');

        const coverage = await this.auditBusinessSystemsCoverage();
        const journeyIssues = await this.auditCustomerJourney();
        const automationOpportunities = await this.auditAutomationOpportunities();
        const agentIssues = await this.auditRenstoAgents();

        // Generate comprehensive report
        console.log('\n📋 COMPREHENSIVE BUSINESS SYSTEMS AUDIT REPORT');
        console.log('================================================');

        console.log(`\n✅ DOCUMENTED BUSINESS SYSTEMS (${coverage.documented.length}):`);
        coverage.documented.forEach(item => {
            console.log(`   ✅ ${item.name} (${item.category}) - ${item.priority} priority`);
        });

        console.log(`\n❌ MISSING BUSINESS SYSTEMS (${coverage.missing.length}):`);
        coverage.missing.forEach(item => {
            console.log(`   ❌ ${item.name} (${item.category}) - ${item.priority} priority - ${item.status}`);
        });

        console.log(`\n⚠️  PARTIAL BUSINESS SYSTEMS (${coverage.partial.length}):`);
        coverage.partial.forEach(item => {
            console.log(`   ⚠️  ${item.name} (${item.category}) - ${item.priority} priority - ${item.records.length} entries`);
        });

        console.log(`\n👥 CUSTOMER JOURNEY ISSUES (${journeyIssues.length}):`);
        journeyIssues.forEach(issue => {
            console.log(`   ❌ ${issue}`);
        });

        console.log(`\n⚙️ AUTOMATION OPPORTUNITIES (${automationOpportunities.length}):`);
        automationOpportunities.forEach(opp => {
            console.log(`   🔧 ${opp.area}: ${opp.current} → ${opp.potential} (${opp.priority} priority)`);
        });

        console.log(`\n🤖 RENSTO AGENTS MIGRATION (${agentIssues.length}):`);
        agentIssues.forEach(agent => {
            console.log(`   🤖 ${agent.agent}: ${agent.currentLocation} → ${agent.migrationPlan}`);
        });

        const totalIssues = coverage.missing.length + journeyIssues.length + agentIssues.length;
        const coveragePercentage = Math.round((coverage.documented.length / Object.keys(this.businessSystems).length) * 100);

        console.log(`\n📊 SUMMARY:`);
        console.log(`   Business Systems Coverage: ${coveragePercentage}%`);
        console.log(`   Documented Systems: ${coverage.documented.length}/${Object.keys(this.businessSystems).length}`);
        console.log(`   Missing Systems: ${coverage.missing.length}`);
        console.log(`   Customer Journey Issues: ${journeyIssues.length}`);
        console.log(`   Automation Opportunities: ${automationOpportunities.length}`);
        console.log(`   Agent Migration Items: ${agentIssues.length}`);
        console.log(`   Total Issues: ${totalIssues}`);

        if (totalIssues === 0) {
            console.log(`\n🎉 EXCELLENT! All business systems are properly documented and automated!`);
        } else {
            console.log(`\n🔧 CRITICAL RECOMMENDATIONS:`);
            console.log(`   1. Document all missing business systems`);
            console.log(`   2. Complete customer journey mapping`);
            console.log(`   3. Implement automation opportunities`);
            console.log(`   4. Migrate Rensto agents to VPS n8n`);
            console.log(`   5. Implement gamified referral system`);
            console.log(`   6. Set up comprehensive pricing strategy`);
        }

        return {
            coverage,
            journeyIssues,
            automationOpportunities,
            agentIssues,
            totalIssues,
            coveragePercentage
        };
    }
}

// Execute the comprehensive business systems audit
const auditor = new ComprehensiveBusinessSystemsAudit();
auditor.performComprehensiveBusinessAudit().catch(console.error);
