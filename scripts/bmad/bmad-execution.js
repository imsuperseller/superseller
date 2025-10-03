#!/usr/bin/env node

/**
 * 🎯 BMAD METHODOLOGY EXECUTION - FOCUSED FIXES
 * 
 * This script executes the BMAD methodology to fix the specific issues identified:
 * 1. Move misplaced data (Webflow, n8n, Lightrag, Rensto teams)
 * 2. Create linked fields between tables
 * 3. Fix mock data (remove fake company names)
 * 4. Implement proper relationships
 */

import axios from 'axios';
import crypto from 'crypto';

console.log('🎯 BMAD METHODOLOGY EXECUTION STARTING...');

// Configuration
const CONFIG = {
    airtable: {
        apiKey: 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9',
        bases: {
            rensto: 'appQijHhqqP4z6wGe',
            coreBusiness: 'app4nJpP1ytGukXQT',
            integrations: 'appOvDNYenyx7WITR'
        }
    }
};

// RGID System
class RGIDSystem {
    static generateRGID(type, data) {
        const timestamp = Date.now();
        const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex').substring(0, 8);
        return `RGID_${type.toUpperCase()}_${timestamp}_${hash}`;
    }
}

// B - BUSINESS ANALYSIS (Mary's Role)
class BusinessAnalysis {
    static async identifyMisplacedData() {
        console.log('🔍 B - BUSINESS ANALYSIS: Identifying misplaced data...');
        
        const misplacedData = [
            {
                name: 'Webflow API v2',
                from: { base: 'rensto', table: 'customers' },
                to: { base: 'integrations', table: 'integrations', reason: 'Integration tool, not customer' }
            },
            {
                name: 'n8n VPS Instance',
                from: { base: 'rensto', table: 'customers' },
                to: { base: 'integrations', table: 'integrations', reason: 'Infrastructure, not customer' }
            },
            {
                name: 'Lightrag Deployment',
                from: { base: 'rensto', table: 'customers' },
                to: { base: 'integrations', table: 'integrations', reason: 'Deployment tool, not customer' }
            },
            {
                name: 'Rensto Development Team',
                from: { base: 'rensto', table: 'customers' },
                to: { base: 'coreBusiness', table: 'contacts', reason: 'Internal team, not customer' }
            },
            {
                name: 'Rensto Support Team',
                from: { base: 'rensto', table: 'customers' },
                to: { base: 'coreBusiness', table: 'contacts', reason: 'Internal team, not customer' }
            }
        ];

        console.log(`✅ Identified ${misplacedData.length} misplaced records`);
        return misplacedData;
    }

    static async identifyMockData() {
        console.log('🔍 B - BUSINESS ANALYSIS: Identifying mock data...');
        
        const mockData = [
            {
                name: 'Shelly Mizrahi',
                currentCompany: 'Shelly Mizrahi Consulting',
                realCompany: 'Shelly Mizrahi',
                issue: 'Fake "Consulting" company name'
            },
            {
                name: 'Ben Ginati',
                currentCompany: 'Ben Ginati Consulting',
                realCompany: 'Ben Ginati',
                issue: 'Fake "Consulting" company name'
            },
            {
                name: 'Tax4us',
                currentCompany: 'Tax4us LLC',
                realCompany: 'Tax4us',
                issue: 'Fake "LLC" company name'
            }
        ];

        console.log(`✅ Identified ${mockData.length} mock data records`);
        return mockData;
    }
}

// M - MANAGEMENT PLANNING (John's Role)
class ManagementPlanning {
    static createExecutionPlan(misplacedData, mockData) {
        console.log('📋 M - MANAGEMENT PLANNING: Creating execution plan...');
        
        const plan = {
            data_migration: {
                total_migrations: misplacedData.length,
                to_integrations: misplacedData.filter(item => item.to.base === 'integrations').length,
                to_core_business: misplacedData.filter(item => item.to.base === 'coreBusiness').length
            },
            data_quality: {
                mock_data_fixes: mockData.length
            },
            architecture: {
                linked_fields_to_create: 4, // Projects↔Tasks, Customers↔Projects, etc.
                lookup_fields_to_create: 3, // Auto-populate names from linked records
                rollup_fields_to_create: 2  // Count totals and sums
            }
        };

        console.log('✅ Execution plan created:', plan);
        return plan;
    }
}

// A - ARCHITECTURE DESIGN (Winston's Role)
class ArchitectureDesign {
    static designLinkedFields() {
        console.log('🏗️ A - ARCHITECTURE DESIGN: Designing linked fields...');
        
        const linkedFields = [
            {
                table: 'Projects',
                field: 'Customer',
                type: 'linked_record',
                linked_table: 'Companies',
                description: 'Link projects to actual customers'
            },
            {
                table: 'Tasks',
                field: 'Project',
                type: 'linked_record',
                linked_table: 'Projects',
                description: 'Link tasks to projects'
            },
            {
                table: 'Invoices',
                field: 'Project',
                type: 'linked_record',
                linked_table: 'Projects',
                description: 'Link invoices to projects'
            },
            {
                table: 'Time Tracking',
                field: 'Task',
                type: 'linked_record',
                linked_table: 'Tasks',
                description: 'Link time tracking to tasks'
            }
        ];

        console.log(`✅ Designed ${linkedFields.length} linked fields`);
        return linkedFields;
    }
}

// D - DEVELOPMENT IMPLEMENTATION (Sarah's Role)
class DevelopmentImplementation {
    static async executeDataMigration(misplacedData) {
        console.log('💻 D - DEVELOPMENT IMPLEMENTATION: Executing data migration...');
        
        let migrated = 0;
        
        for (const item of misplacedData) {
            try {
                console.log(`📦 Moving: ${item.name} from ${item.from.base} to ${item.to.base}`);
                
                // Get record from source
                const sourceResponse = await axios.get(
                    `https://api.airtable.com/v0/${CONFIG.airtable.bases[item.from.base]}/tbl6BMipQQPJvPIWw?filterByFormula={Name}="${item.name}"`,
                    {
                        headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                    }
                );
                
                if (sourceResponse.data.records.length > 0) {
                    const record = sourceResponse.data.records[0];
                    
                    // Create in destination
                    if (item.to.base === 'integrations') {
                        await axios.post(
                            `https://api.airtable.com/v0/${CONFIG.airtable.bases.integrations}/tblX93phi97sWf0Zj`,
                            {
                                fields: {
                                    'Name': record.fields.Name,
                                    'Entity RGID': RGIDSystem.generateRGID('INT', { name: item.name }),
                                    'Customer Link': 'Rensto'
                                }
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } else if (item.to.base === 'coreBusiness') {
                        await axios.post(
                            `https://api.airtable.com/v0/${CONFIG.airtable.bases.coreBusiness}/tblST9B2hqzDWwpdy`,
                            {
                                fields: {
                                    'Name': record.fields.Name,
                                    'Email': record.fields.Email || 'team@rensto.com',
                                    'Company': 'Rensto',
                                    'Type': 'Internal Team',
                                    'RGID': RGIDSystem.generateRGID('CONT', { name: item.name })
                                }
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    }
                    
                    // Delete from source
                    await axios.delete(
                        `https://api.airtable.com/v0/${CONFIG.airtable.bases[item.from.base]}/tbl6BMipQQPJvPIWw/${record.id}`,
                        {
                            headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                        }
                    );
                    
                    migrated++;
                    console.log(`✅ Migrated: ${item.name}`);
                }
            } catch (error) {
                console.log(`❌ Error migrating ${item.name}:`, error.response?.data || error.message);
            }
        }
        
        return migrated;
    }

    static async fixMockData(mockData) {
        console.log('💻 D - DEVELOPMENT IMPLEMENTATION: Fixing mock data...');
        
        let fixed = 0;
        
        for (const item of mockData) {
            try {
                console.log(`🔧 Fixing mock data: ${item.name}`);
                
                // Find the record
                const response = await axios.get(
                    `https://api.airtable.com/v0/${CONFIG.airtable.bases.rensto}/tbl6BMipQQPJvPIWw?filterByFormula={Name}="${item.name}"`,
                    {
                        headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                    }
                );
                
                if (response.data.records.length > 0) {
                    const record = response.data.records[0];
                    
                    // Update with real data
                    await axios.patch(
                        `https://api.airtable.com/v0/${CONFIG.airtable.bases.rensto}/tbl6BMipQQPJvPIWw/${record.id}`,
                        {
                            fields: {
                                'Company': item.realCompany,
                                'Notes': `REAL DATA - ${item.issue} fixed via BMAD methodology`
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    fixed++;
                    console.log(`✅ Fixed mock data: ${item.name}`);
                }
            } catch (error) {
                console.log(`❌ Error fixing mock data ${item.name}:`, error.response?.data || error.message);
            }
        }
        
        return fixed;
    }

    static async createLinkedFields(linkedFields) {
        console.log('💻 D - DEVELOPMENT IMPLEMENTATION: Creating linked fields...');
        
        let created = 0;
        
        for (const field of linkedFields) {
            try {
                console.log(`🔗 Creating linked field: ${field.field} in ${field.table}`);
                
                // Get table ID for the target table
                const tableId = await this.getTableId(field.table);
                
                if (tableId) {
                    await axios.post(
                        `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases.coreBusiness}/tables/${tableId}/fields`,
                        {
                            name: field.field,
                            type: 'multipleRecordLinks',
                            options: {
                                linkedTableId: await this.getTableId(field.linked_table),
                                isReversed: false,
                                prefersSingleRecordLink: false
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${CONFIG.airtable.apiKey}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    created++;
                    console.log(`✅ Created linked field: ${field.field}`);
                }
            } catch (error) {
                console.log(`❌ Error creating linked field ${field.field}:`, error.response?.data || error.message);
            }
        }
        
        return created;
    }

    static async getTableId(tableName) {
        try {
            const response = await axios.get(
                `https://api.airtable.com/v0/meta/bases/${CONFIG.airtable.bases.coreBusiness}/tables`,
                {
                    headers: { 'Authorization': `Bearer ${CONFIG.airtable.apiKey}` }
                }
            );
            
            const table = response.data.tables.find(t => t.name === tableName);
            return table ? table.id : null;
        } catch (error) {
            return null;
        }
    }
}

// Main BMAD Execution
async function executeBMADMethodology() {
    console.log('🎯 BMAD METHODOLOGY EXECUTION');
    console.log('=============================');
    
    try {
        // B - Business Analysis (Mary)
        console.log('\n🔍 B - BUSINESS ANALYSIS');
        const misplacedData = await BusinessAnalysis.identifyMisplacedData();
        const mockData = await BusinessAnalysis.identifyMockData();
        
        // M - Management Planning (John)
        console.log('\n📋 M - MANAGEMENT PLANNING');
        const plan = ManagementPlanning.createExecutionPlan(misplacedData, mockData);
        
        // A - Architecture Design (Winston)
        console.log('\n🏗️ A - ARCHITECTURE DESIGN');
        const linkedFields = ArchitectureDesign.designLinkedFields();
        
        // D - Development Implementation (Sarah)
        console.log('\n💻 D - DEVELOPMENT IMPLEMENTATION');
        const migrations = await DevelopmentImplementation.executeDataMigration(misplacedData);
        const mockFixes = await DevelopmentImplementation.fixMockData(mockData);
        const linkedFieldsCreated = await DevelopmentImplementation.createLinkedFields(linkedFields);
        
        console.log('\n🎉 BMAD METHODOLOGY EXECUTION COMPLETE!');
        console.log('========================================');
        console.log('📊 Results Summary:');
        console.log(`   • Data Migrations: ${migrations}/${misplacedData.length}`);
        console.log(`   • Mock Data Fixes: ${mockFixes}/${mockData.length}`);
        console.log(`   • Linked Fields Created: ${linkedFieldsCreated}/${linkedFields.length}`);
        
    } catch (error) {
        console.error('❌ BMAD Execution Failed:', error.message);
        process.exit(1);
    }
}

// Execute
executeBMADMethodology();
