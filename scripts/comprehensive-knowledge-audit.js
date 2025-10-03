#!/usr/bin/env node
import axios from 'axios';

class ComprehensiveKnowledgeAuditor {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' };

        // All Rensto bases for comprehensive audit
        this.renstoBases = {
            operations: {
                id: 'app6saCaH88uK3kCO',
                name: 'Operations & Automation (Op)',
                tables: {
                    system_logs: 'tblWE9DZnfE8e8x2o'
                }
            },
            integrations: {
                id: 'app9oouVkvTkFjf3t',
                name: 'Integrations (In)',
                tables: {
                    table_1: 'tblJj2hILjH2ciXjy'
                }
            },
            financial: {
                id: 'app6yzlm67lRNuQZD',
                name: 'Financial Management (Fi)',
                tables: {
                    invoices: 'tblpQ71TjMAnVJ5by'
                }
            },
            marketingSales: {
                id: 'appQhVkIaWoGJG301',
                name: 'Marketing & Sales (Ma)',
                tables: {
                    content: 'tblyouyRsrShihtsW'
                }
            },
            customerSuccess: {
                id: 'appSCBZk03GUCTfhN',
                name: 'Customer Success (Cu)',
                tables: {
                    customers: 'tblhzxwqGZCH4qOjR'
                }
            },
            coreBusiness: {
                id: 'app4nJpP1ytGukXQT',
                name: 'Core Business Operations (Co)',
                tables: {
                    companies: 'tbl1roDiTjOCU3wiz'
                }
            },
            idempotency: {
                id: 'app9DhsrZ0VnuEH3t',
                name: 'Idempotency Systems (Id)',
                tables: {
                    table_1: 'tblyjH6tiW4vMvw46'
                }
            },
            analytics: {
                id: 'appOvDNYenyx7WITR',
                name: 'Analytics & Monitoring (An)',
                tables: {
                    table_1: 'tblX93phi97sWf0Zj'
                }
            },
            rgid: {
                id: 'appCGexgpGPkMUPXF',
                name: 'RGID-based Entity Management (Rg)',
                tables: {
                    table_1: 'tblVC42de1P1K6or2'
                }
            },
            rensto: {
                id: 'appQijHhqqP4z6wGe',
                name: 'Rensto (Re)',
                tables: {
                    customers: 'tbl6BMipQQPJvPIWw'
                }
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

    auditMockData(records, baseName, tableName) {
        const issues = [];

        records.forEach((record, index) => {
            const fields = record.fields;

            // Check for mock data patterns
            if (fields.Name && fields.Name.includes('Test')) {
                issues.push(`MOCK DATA: Record ${index + 1} contains "Test" in Name`);
            }

            if (fields.Email && fields.Email.includes('example.com')) {
                issues.push(`MOCK DATA: Record ${index + 1} contains example.com email`);
            }

            if (fields.Phone && fields.Phone.includes('555')) {
                issues.push(`MOCK DATA: Record ${index + 1} contains 555 phone number`);
            }

            if (fields.Notes && fields.Notes.includes('This is a test')) {
                issues.push(`MOCK DATA: Record ${index + 1} contains test notes`);
            }

            // Check for placeholder values
            if (fields['Total Amount'] === 0 && fields.Name && !fields.Name.includes('System')) {
                issues.push(`MOCK DATA: Record ${index + 1} has $0 Total Amount but appears to be a real system`);
            }

            if (fields['Monthly Recurring Revenue'] === 0 && fields.Name && !fields.Name.includes('System')) {
                issues.push(`MOCK DATA: Record ${index + 1} has $0 MRR but appears to be a real system`);
            }
        });

        return issues;
    }

    auditConflicts(records, baseName, tableName) {
        const issues = [];
        const names = new Set();

        records.forEach((record, index) => {
            const fields = record.fields;

            // Check for duplicate names
            if (fields.Name) {
                if (names.has(fields.Name)) {
                    issues.push(`CONFLICT: Duplicate Name "${fields.Name}" found in record ${index + 1}`);
                }
                names.add(fields.Name);
            }

            // Check for conflicting statuses
            if (fields.Status && fields.Status === 'Inactive' && fields.Name && fields.Name.includes('Implementation')) {
                issues.push(`CONFLICT: Record ${index + 1} "${fields.Name}" is marked Inactive but claims to be implemented`);
            }
        });

        return issues;
    }

    auditContradictions(records, baseName, tableName) {
        const issues = [];

        records.forEach((record, index) => {
            const fields = record.fields;

            // Check for contradictions in implementation status
            if (fields.Name && fields.Name.includes('Implementation') && fields.Notes && fields.Notes.includes('Complete')) {
                if (fields.Status && fields.Status !== 'Active') {
                    issues.push(`CONTRADICTION: Record ${index + 1} "${fields.Name}" claims complete implementation but status is not Active`);
                }
            }

            // Check for contradictions in financial data
            if (fields['Total Amount'] === 0 && fields.Notes && fields.Notes.includes('revenue tracking')) {
                issues.push(`CONTRADICTION: Record ${index + 1} "${fields.Name}" claims revenue tracking but has $0 Total Amount`);
            }
        });

        return issues;
    }

    auditMissingInformation(records, baseName, tableName) {
        const issues = [];

        records.forEach((record, index) => {
            const fields = record.fields;

            // Check for missing critical information
            if (fields.Name && fields.Name.includes('Implementation') && !fields.Notes) {
                issues.push(`MISSING: Record ${index + 1} "${fields.Name}" lacks implementation details in Notes`);
            }

            if (fields.Name && fields.Name.includes('System') && !fields.Status) {
                issues.push(`MISSING: Record ${index + 1} "${fields.Name}" lacks Status information`);
            }

            if (fields.Name && fields.Name.includes('Integration') && !fields['Server ID']) {
                issues.push(`MISSING: Record ${index + 1} "${fields.Name}" lacks Server ID information`);
            }

            // Check for missing dates
            if (fields.Name && fields.Name.includes('Implementation') && !fields['Created Date']) {
                issues.push(`MISSING: Record ${index + 1} "${fields.Name}" lacks Created Date`);
            }
        });

        return issues;
    }

    auditVagueEntries(records, baseName, tableName) {
        const issues = [];

        records.forEach((record, index) => {
            const fields = record.fields;

            // Check for vague descriptions
            if (fields.Notes && fields.Notes.length < 50) {
                issues.push(`VAGUE: Record ${index + 1} "${fields.Name}" has very short Notes (${fields.Notes.length} chars)`);
            }

            if (fields.Description && fields.Description.length < 30) {
                issues.push(`VAGUE: Record ${index + 1} "${fields.Name}" has very short Description (${fields.Description.length} chars)`);
            }

            // Check for generic names
            if (fields.Name && fields.Name.length < 10) {
                issues.push(`VAGUE: Record ${index + 1} has very short Name "${fields.Name}"`);
            }

            // Check for overly generic descriptions
            const genericTerms = ['system', 'implementation', 'management', 'integration'];
            if (fields.Notes && genericTerms.every(term => fields.Notes.toLowerCase().includes(term))) {
                issues.push(`VAGUE: Record ${index + 1} "${fields.Name}" uses only generic terms in Notes`);
            }
        });

        return issues;
    }

    async auditAllBases() {
        console.log('🔍 COMPREHENSIVE KNOWLEDGE BASE AUDIT');
        console.log('=====================================');

        const allIssues = {
            mockData: [],
            conflicts: [],
            contradictions: [],
            missingInfo: [],
            vagueEntries: []
        };

        for (const [key, base] of Object.entries(this.renstoBases)) {
            console.log(`\n📊 Auditing ${base.name}...`);

            for (const [tableKey, tableId] of Object.entries(base.tables)) {
                const records = await this.getRecords(base.id, tableId);

                if (records.length === 0) {
                    console.log(`   ⚠️  No records found in ${tableKey}`);
                    continue;
                }

                console.log(`   📋 ${tableKey}: ${records.length} records`);

                // Run all audits
                const mockDataIssues = this.auditMockData(records, base.name, tableKey);
                const conflictIssues = this.auditConflicts(records, base.name, tableKey);
                const contradictionIssues = this.auditContradictions(records, base.name, tableKey);
                const missingInfoIssues = this.auditMissingInformation(records, base.name, tableKey);
                const vagueIssues = this.auditVagueEntries(records, base.name, tableKey);

                // Add base context to issues
                mockDataIssues.forEach(issue => allIssues.mockData.push(`${base.name} (${tableKey}): ${issue}`));
                conflictIssues.forEach(issue => allIssues.conflicts.push(`${base.name} (${tableKey}): ${issue}`));
                contradictionIssues.forEach(issue => allIssues.contradictions.push(`${base.name} (${tableKey}): ${issue}`));
                missingInfoIssues.forEach(issue => allIssues.missingInfo.push(`${base.name} (${tableKey}): ${issue}`));
                vagueIssues.forEach(issue => allIssues.vagueEntries.push(`${base.name} (${tableKey}): ${issue}`));
            }
        }

        // Generate comprehensive report
        console.log('\n📋 COMPREHENSIVE AUDIT REPORT');
        console.log('=============================');

        console.log(`\n❌ MOCK DATA ISSUES (${allIssues.mockData.length}):`);
        allIssues.mockData.forEach(issue => console.log(`   - ${issue}`));

        console.log(`\n⚠️  CONFLICTS (${allIssues.conflicts.length}):`);
        allIssues.conflicts.forEach(issue => console.log(`   - ${issue}`));

        console.log(`\n🔄 CONTRADICTIONS (${allIssues.contradictions.length}):`);
        allIssues.contradictions.forEach(issue => console.log(`   - ${issue}`));

        console.log(`\n📝 MISSING INFORMATION (${allIssues.missingInfo.length}):`);
        allIssues.missingInfo.forEach(issue => console.log(`   - ${issue}`));

        console.log(`\n💭 VAGUE ENTRIES (${allIssues.vagueEntries.length}):`);
        allIssues.vagueEntries.forEach(issue => console.log(`   - ${issue}`));

        const totalIssues = Object.values(allIssues).reduce((sum, issues) => sum + issues.length, 0);

        console.log(`\n📊 SUMMARY:`);
        console.log(`   Total Issues Found: ${totalIssues}`);
        console.log(`   Mock Data Issues: ${allIssues.mockData.length}`);
        console.log(`   Conflicts: ${allIssues.conflicts.length}`);
        console.log(`   Contradictions: ${allIssues.contradictions.length}`);
        console.log(`   Missing Information: ${allIssues.missingInfo.length}`);
        console.log(`   Vague Entries: ${allIssues.vagueEntries.length}`);

        if (totalIssues === 0) {
            console.log(`\n✅ EXCELLENT! No issues found in the knowledge base.`);
        } else {
            console.log(`\n🔧 RECOMMENDATION: Address these issues to improve knowledge base quality.`);
        }

        return allIssues;
    }
}

// Execute the comprehensive audit
const auditor = new ComprehensiveKnowledgeAuditor();
auditor.auditAllBases().catch(console.error);
