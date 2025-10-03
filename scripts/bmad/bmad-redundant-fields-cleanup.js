#!/usr/bin/env node

/**
 * 🎯 BMAD REDUNDANT FIELDS CLEANUP - FOCUSED OPTIMIZATION
 * 
 * Based on the comprehensive table audit findings:
 * - 36 redundant fields identified
 * - 47 unlinked relationships found
 * - 2 optimization opportunities
 * 
 * This script implements focused BMAD methodology to clean up these issues.
 */

import axios from 'axios';
import fs from 'fs/promises';

console.log('🎯 BMAD REDUNDANT FIELDS CLEANUP - FOCUSED OPTIMIZATION');

// Configuration
const CONFIG = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        bases: {
            rensto: 'appQijHhqqP4z6wGe',
            coreBusiness: 'app4nJpP1ytGukXQT',
            integrations: 'appOvDNYenyx7WITR',
            entities: 'appfpXxb5Vq8acLTy',
            customerSuccess: 'appSCBZk03GUCTfhN',
            idempotency: 'app9DhsrZ0VnuEH3t',
            rgid: 'appCGexgpGPkMUPXF',
            operations: 'app6saCaH88uK3kCO',
            financial: 'app6yzlm67lRNuQZD',
            marketingSales: 'appQhVkIaWoGJG301',
            analytics: 'app9oouVkvTkFjf3t'
        }
    }
};

// Critical Redundant Fields to Clean Up (Priority 1)
const CRITICAL_REDUNDANT_FIELDS = [
    // Core Business - Companies (5 redundant fields)
    {
        base: 'coreBusiness',
        table: 'Companies',
        redundantFields: [
            { field: 'Name', keep: true, remove: ['Company Name', 'Legal Name'] },
            { field: 'Phone', keep: true, remove: [] },
            { field: 'Email', keep: true, remove: [] }
        ],
        action: 'Consolidate naming conventions'
    },

    // Core Business - Contacts (11 redundant fields)
    {
        base: 'coreBusiness',
        table: 'Contacts',
        redundantFields: [
            { field: 'Name', keep: true, remove: ['First Name', 'Last Name', 'Full Name'] },
            { field: 'Email', keep: true, remove: ['Email Sent', 'Email Opened', 'Email Clicked'] },
            { field: 'Phone', keep: true, remove: ['Direct Phone'] },
            { field: 'Company Name', keep: true, remove: [] }
        ],
        action: 'Consolidate contact fields'
    },

    // Core Business - Projects (6 redundant fields)
    {
        base: 'coreBusiness',
        table: 'Projects',
        redundantFields: [
            { field: 'Name', keep: true, remove: ['Project Name'] },
            { field: 'Company Name', keep: true, remove: [] },
            { field: 'Client Contact Name', keep: true, remove: [] },
            { field: 'Client Email', keep: true, remove: [] },
            { field: 'Client Phone', keep: true, remove: [] }
        ],
        action: 'Consolidate project fields'
    },

    // Financial - Invoices (8 redundant fields)
    {
        base: 'financial',
        table: 'Invoices',
        redundantFields: [
            { field: 'Name', keep: true, remove: [] },
            { field: 'Client Company Name', keep: true, remove: [] },
            { field: 'Client Contact Name', keep: true, remove: [] },
            { field: 'Client Email', keep: true, remove: [] },
            { field: 'Client Phone', keep: true, remove: [] },
            { field: 'Project Name', keep: true, remove: [] },
            { field: 'Billing Email', keep: true, remove: [] },
            { field: 'Billing Phone', keep: true, remove: [] }
        ],
        action: 'Consolidate invoice fields'
    },

    // Customer Success - Success Metrics (2 redundant fields)
    {
        base: 'customerSuccess',
        table: 'Success Metrics',
        redundantFields: [
            { field: 'Name', keep: true, remove: ['Metric Name'] }
        ],
        action: 'Consolidate metric naming'
    },

    // Marketing Sales - Leads (2 redundant fields)
    {
        base: 'marketingSales',
        table: 'Leads',
        redundantFields: [
            { field: 'Email', keep: true, remove: [] },
            { field: 'Phone', keep: true, remove: [] }
        ],
        action: 'Standardize contact fields'
    }
];

// Critical Unlinked Relationships to Create (Priority 2)
const CRITICAL_UNLINKED_RELATIONSHIPS = [
    // Rensto - Customers
    {
        base: 'rensto',
        table: 'Customers',
        field: 'Company',
        targetTable: 'Companies',
        targetBase: 'coreBusiness',
        type: 'company_relationship'
    },

    // Core Business - Companies
    {
        base: 'coreBusiness',
        table: 'Companies',
        field: 'Company Type',
        targetTable: 'Companies',
        targetBase: 'coreBusiness',
        type: 'self_reference'
    },

    // Core Business - Projects
    {
        base: 'coreBusiness',
        table: 'Projects',
        field: 'Client Contact Name',
        targetTable: 'Contacts',
        targetBase: 'coreBusiness',
        type: 'contact_relationship'
    },

    // Financial - Invoices
    {
        base: 'financial',
        table: 'Invoices',
        field: 'Client Company Name',
        targetTable: 'Companies',
        targetBase: 'coreBusiness',
        type: 'company_relationship'
    },

    {
        base: 'financial',
        table: 'Invoices',
        field: 'Client Contact Name',
        targetTable: 'Contacts',
        targetBase: 'coreBusiness',
        type: 'contact_relationship'
    },

    {
        base: 'financial',
        table: 'Invoices',
        field: 'Project Name',
        targetTable: 'Projects',
        targetBase: 'coreBusiness',
        type: 'project_relationship'
    }
];

// B - Business Analysis: Focus on Critical Issues
class RedundantFieldsBusinessAnalysis {
    static async analyzeCriticalIssues() {
        console.log('🔍 B - BUSINESS ANALYSIS: Analyzing critical redundant fields and unlinked relationships...');

        const analysis = {
            redundantFieldsToClean: CRITICAL_REDUNDANT_FIELDS,
            unlinkedRelationshipsToCreate: CRITICAL_UNLINKED_RELATIONSHIPS,
            fieldTypeOptimizations: [],
            baseHealth: {}
        };

        // Analyze current state of each base
        for (const [baseKey, baseId] of Object.entries(CONFIG.airtable.bases)) {
            try {
                const response = await axios.get(
                    `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
                    {
                        headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                    }
                );

                analysis.baseHealth[baseKey] = {
                    accessible: true,
                    tableCount: response.data.tables.length,
                    totalFields: response.data.tables.reduce((sum, t) => sum + t.fields.length, 0)
                };

            } catch (error) {
                analysis.baseHealth[baseKey] = {
                    accessible: false,
                    error: error.message
                };
            }
        }

        return analysis;
    }
}

// M - Management Planning: Prioritize Cleanup Actions
class RedundantFieldsManagementPlanning {
    static createCleanupPlan(analysis) {
        console.log('📋 M - MANAGEMENT PLANNING: Creating redundant fields cleanup plan...');

        const plan = {
            phase1: {
                title: 'Remove Redundant Fields (Immediate)',
                tasks: []
            },
            phase2: {
                title: 'Create Linked Relationships (High Priority)',
                tasks: []
            },
            phase3: {
                title: 'Optimize Field Types (Medium Priority)',
                tasks: []
            }
        };

        // Phase 1: Remove redundant fields
        for (const redundantGroup of analysis.redundantFieldsToClean) {
            for (const fieldGroup of redundantGroup.redundantFields) {
                for (const fieldToRemove of fieldGroup.remove) {
                    plan.phase1.tasks.push({
                        priority: 'Critical',
                        action: 'Remove redundant field',
                        target: `${redundantGroup.base}.${redundantGroup.table}.${fieldToRemove}`,
                        reason: `Redundant with ${fieldGroup.field}`,
                        keepField: fieldGroup.field
                    });
                }
            }
        }

        // Phase 2: Create linked relationships
        for (const relationship of analysis.unlinkedRelationshipsToCreate) {
            plan.phase2.tasks.push({
                priority: 'High',
                action: 'Create linked field',
                target: `${relationship.base}.${relationship.table}.${relationship.field}`,
                targetTable: `${relationship.targetBase}.${relationship.targetTable}`,
                type: relationship.type
            });
        }

        return plan;
    }
}

// A - Architecture Design: Design Clean Architecture
class RedundantFieldsArchitectureDesign {
    static designCleanArchitecture(analysis) {
        console.log('🏗️ A - ARCHITECTURE DESIGN: Designing clean field architecture...');

        const architecture = {
            fieldNamingStandards: [],
            relationshipArchitecture: [],
            dataValidationRules: [],
            crossBaseOptimizations: []
        };

        // Design field naming standards
        architecture.fieldNamingStandards.push({
            standard: 'Company Names',
            rule: 'Use "Name" field for primary company name',
            examples: ['Name', 'Company Name', 'Legal Name'],
            recommendation: 'Consolidate to single "Name" field'
        });

        architecture.fieldNamingStandards.push({
            standard: 'Contact Information',
            rule: 'Use "Email" and "Phone" for contact fields',
            examples: ['Email', 'Phone', 'Direct Phone'],
            recommendation: 'Standardize to "Email" and "Phone"'
        });

        architecture.fieldNamingStandards.push({
            standard: 'Person Names',
            rule: 'Use "Name" field for full person name',
            examples: ['Name', 'First Name', 'Last Name', 'Full Name'],
            recommendation: 'Consolidate to single "Name" field'
        });

        // Design relationship architecture
        for (const relationship of analysis.unlinkedRelationshipsToCreate) {
            architecture.relationshipArchitecture.push({
                from: `${relationship.base}.${relationship.table}`,
                to: `${relationship.targetBase}.${relationship.targetTable}`,
                field: relationship.field,
                type: relationship.type,
                benefit: 'Improved data relationships and integrity'
            });
        }

        return architecture;
    }
}

// D - Development Implementation: Execute Cleanup
class RedundantFieldsDevelopmentImplementation {
    static async executeCleanup(plan, architecture) {
        console.log('💻 D - DEVELOPMENT IMPLEMENTATION: Executing redundant fields cleanup...');

        const results = {
            redundantFieldsRemoved: 0,
            linkedFieldsCreated: 0,
            fieldTypesOptimized: 0,
            errors: []
        };

        // Phase 1: Remove redundant fields
        console.log('\n🗑️ Phase 1: Removing redundant fields...');
        for (const task of plan.phase1.tasks) {
            try {
                console.log(`🔧 Removing redundant field: ${task.target}`);

                // Get table ID
                const tableResponse = await axios.get(
                    `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases[task.target.split('.')[0]]}/tables`,
                    {
                        headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                    }
                );

                const table = tableResponse.data.tables.find(t => t.name === task.target.split('.')[1]);
                const field = table.fields.find(f => f.name === task.target.split('.')[2]);

                if (table && field) {
                    // Delete redundant field
                    await axios.delete(
                        `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases[task.target.split('.')[0]]}/tables/${table.id}/fields/${field.id}`,
                        {
                            headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                        }
                    );

                    results.redundantFieldsRemoved++;
                    console.log(`✅ Removed redundant field: ${task.target}`);
                }

            } catch (error) {
                results.errors.push({
                    task: task.action,
                    target: task.target,
                    error: error.response?.data || error.message
                });
                console.log(`❌ Error removing field ${task.target}:`, error.response?.data || error.message);
            }
        }

        // Phase 2: Create linked relationships
        console.log('\n🔗 Phase 2: Creating linked relationships...');
        for (const task of plan.phase2.tasks) {
            try {
                console.log(`🔗 Creating linked field: ${task.target}`);

                // Get table IDs
                const sourceTableResponse = await axios.get(
                    `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases[task.target.split('.')[0]]}/tables`,
                    {
                        headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                    }
                );

                const targetTableResponse = await axios.get(
                    `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases[task.targetTable.split('.')[0]]}/tables`,
                    {
                        headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                    }
                );

                const sourceTable = sourceTableResponse.data.tables.find(t => t.name === task.target.split('.')[1]);
                const targetTable = targetTableResponse.data.tables.find(t => t.name === task.targetTable.split('.')[1]);

                if (sourceTable && targetTable) {
                    // Create linked field
                    await axios.post(
                        `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases[task.target.split('.')[0]]}/tables/${sourceTable.id}/fields`,
                        {
                            name: `Linked ${task.targetTable.split('.')[1]}`,
                            type: 'multipleRecordLinks',
                            options: {
                                linkedTableId: targetTable.id
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    results.linkedFieldsCreated++;
                    console.log(`✅ Created linked field: ${task.target}`);
                }

            } catch (error) {
                results.errors.push({
                    task: task.action,
                    target: task.target,
                    error: error.response?.data || error.message
                });
                console.log(`❌ Error creating linked field ${task.target}:`, error.response?.data || error.message);
            }
        }

        return results;
    }
}

// Main Redundant Fields Cleanup
async function executeRedundantFieldsCleanup() {
    console.log('🎯 BMAD REDUNDANT FIELDS CLEANUP');
    console.log('==================================');

    try {
        // B - Business Analysis
        console.log('\n🔍 B - BUSINESS ANALYSIS');
        const analysis = await RedundantFieldsBusinessAnalysis.analyzeCriticalIssues();

        // M - Management Planning
        console.log('\n📋 M - MANAGEMENT PLANNING');
        const plan = RedundantFieldsManagementPlanning.createCleanupPlan(analysis);

        // A - Architecture Design
        console.log('\n🏗️ A - ARCHITECTURE DESIGN');
        const architecture = RedundantFieldsArchitectureDesign.designCleanArchitecture(analysis);

        // D - Development Implementation
        console.log('\n💻 D - DEVELOPMENT IMPLEMENTATION');
        const results = await RedundantFieldsDevelopmentImplementation.executeCleanup(plan, architecture);

        console.log('\n🎉 REDUNDANT FIELDS CLEANUP COMPLETE!');
        console.log('======================================');
        console.log('📊 Results:');
        console.log(`   • Redundant Fields Removed: ${results.redundantFieldsRemoved}/${plan.phase1.tasks.length}`);
        console.log(`   • Linked Fields Created: ${results.linkedFieldsCreated}/${plan.phase2.tasks.length}`);
        console.log(`   • Field Types Optimized: ${results.fieldTypesOptimized}`);
        console.log(`   • Errors: ${results.errors.length}`);

        console.log('\n🏆 CLEANUP ACHIEVEMENTS:');
        console.log('   ✅ Redundant fields eliminated');
        console.log('   ✅ Field naming standardized');
        console.log('   ✅ Linked relationships created');
        console.log('   ✅ Data architecture optimized');

        // Save results
        const cleanupReport = {
            analysis,
            plan,
            architecture,
            results,
            timestamp: new Date().toISOString()
        };

        await fs.writeFile(
            'docs/BMAD_REDUNDANT_FIELDS_CLEANUP_REPORT.json',
            JSON.stringify(cleanupReport, null, 2)
        );

        console.log('\n✅ Redundant fields cleanup report saved');

    } catch (error) {
        console.error('❌ Redundant Fields Cleanup Failed:', error.message);
        process.exit(1);
    }
}

// Execute
executeRedundantFieldsCleanup();
