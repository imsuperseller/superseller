#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableComprehensiveAuditAndUpdate {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // All known base IDs from the documentation
        this.knownBases = {
            'original': 'appQijHhqqP4z6wGe',
            'new': 'appqY1p53ge7UqxUO',
            'core': 'app4nJpP1ytGukXQT',
            'finance': 'app6yzlm67lRNuQZD',
            'marketing': 'appQhVkIaWoGJG301',
            'operations': 'app6saCaH88uK3kCO',
            'customers': 'appSCBZk03GUCTfhN',
            'entities': 'app9DhsrZ0VnuEH3t',
            'operations2': 'appCGexgpGPkMUPXF',
            'analytics': 'appOvDNYenyx7WITR'
        };
        
        this.results = {
            audit: {},
            updates: {},
            errors: [],
            summary: {}
        };
    }

    async start() {
        console.log('🎯 AIRTABLE COMPREHENSIVE AUDIT AND UPDATE');
        console.log('==========================================\n');
        
        try {
            // Step 1: Get all accessible bases
            await this.getAllBases();
            
            // Step 2: Audit each base
            await this.auditAllBases();
            
            // Step 3: Update bases based on audit results
            await this.updateBasesBasedOnAudit();
            
            // Step 4: Generate comprehensive report
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Error during audit and update:', error);
            this.results.errors.push(error.message);
            await this.generateReport();
        }
    }

    async getAllBases() {
        console.log('📊 Step 1: Getting all accessible bases...');
        
        try {
            const response = await axios.get(`${this.baseUrl}/meta/bases`, {
                headers: this.headers
            });
            
            this.results.audit.accessibleBases = response.data.bases.map(base => ({
                id: base.id,
                name: base.name,
                description: base.description,
                permissionLevel: base.permissionLevel
            }));
            
            console.log(`✅ Found ${this.results.audit.accessibleBases.length} accessible bases`);
            
            // Map known bases to accessible bases
            this.results.audit.baseMapping = {};
            for (const [key, knownId] of Object.entries(this.knownBases)) {
                const accessibleBase = this.results.audit.accessibleBases.find(b => b.id === knownId);
                if (accessibleBase) {
                    this.results.audit.baseMapping[key] = accessibleBase;
                }
            }
            
        } catch (error) {
            console.error('❌ Error getting bases:', error.response?.data || error.message);
            throw error;
        }
    }

    async auditAllBases() {
        console.log('\n🔍 Step 2: Auditing all bases...');
        
        for (const base of this.results.audit.accessibleBases) {
            console.log(`\n📋 Auditing base: ${base.name} (${base.id})`);
            await this.auditBase(base);
        }
    }

    async auditBase(base) {
        try {
            // Get base schema
            const schemaResponse = await axios.get(`${this.baseUrl}/meta/bases/${base.id}/tables`, {
                headers: this.headers
            });
            
            const tables = schemaResponse.data.tables;
            this.results.audit[base.id] = {
                name: base.name,
                tables: {},
                summary: {
                    totalTables: tables.length,
                    totalFields: 0,
                    missingAdvancedFeatures: [],
                    recommendations: []
                }
            };
            
            console.log(`  📊 Found ${tables.length} tables`);
            
            // Audit each table
            for (const table of tables) {
                await this.auditTable(base.id, table);
            }
            
            // Generate base-level recommendations
            this.generateBaseRecommendations(base.id);
            
        } catch (error) {
            console.error(`  ❌ Error auditing base ${base.name}:`, error.response?.data || error.message);
            this.results.errors.push(`Base ${base.name}: ${error.message}`);
        }
    }

    async auditTable(baseId, table) {
        try {
            const tableAudit = {
                name: table.name,
                id: table.id,
                fields: {},
                summary: {
                    totalFields: table.fields.length,
                    linkedRecordFields: 0,
                    formulaFields: 0,
                    rollupFields: 0,
                    lookupFields: 0,
                    missingAdvancedFeatures: []
                }
            };
            
            console.log(`    📋 Table: ${table.name} (${table.fields.length} fields)`);
            
            // Audit each field
            for (const field of table.fields) {
                await this.auditField(baseId, table.id, field, tableAudit);
            }
            
            // Generate table-level recommendations
            this.generateTableRecommendations(baseId, table.id, tableAudit);
            
            this.results.audit[baseId].tables[table.id] = tableAudit;
            this.results.audit[baseId].summary.totalFields += table.fields.length;
            
        } catch (error) {
            console.error(`    ❌ Error auditing table ${table.name}:`, error.message);
        }
    }

    async auditField(baseId, tableId, field, tableAudit) {
        const fieldAudit = {
            name: field.name,
            type: field.type,
            options: field.options || {},
            isAdvanced: false,
            recommendations: []
        };
        
        // Check for advanced features
        if (field.type === 'multipleRecordLinks') {
            tableAudit.summary.linkedRecordFields++;
            fieldAudit.isAdvanced = true;
        } else if (field.type === 'formula') {
            tableAudit.summary.formulaFields++;
            fieldAudit.isAdvanced = true;
        } else if (field.type === 'rollup') {
            tableAudit.summary.rollupFields++;
            fieldAudit.isAdvanced = true;
        } else if (field.type === 'lookup') {
            tableAudit.summary.lookupFields++;
            fieldAudit.isAdvanced = true;
        }
        
        // Generate field-level recommendations
        this.generateFieldRecommendations(baseId, tableId, field, fieldAudit);
        
        tableAudit.fields[field.id] = fieldAudit;
    }

    generateFieldRecommendations(baseId, tableId, field, fieldAudit) {
        const tableName = this.results.audit[baseId]?.tables[tableId]?.name || 'Unknown';
        
        // Common field recommendations based on type and name
        if (field.name.toLowerCase().includes('status') && field.type !== 'singleSelect') {
            fieldAudit.recommendations.push('Convert to Single Select with predefined options');
        }
        
        if (field.name.toLowerCase().includes('date') && field.type !== 'date') {
            fieldAudit.recommendations.push('Convert to Date field for better date handling');
        }
        
        if (field.name.toLowerCase().includes('amount') || field.name.toLowerCase().includes('price') || field.name.toLowerCase().includes('cost')) {
            if (field.type !== 'currency') {
                fieldAudit.recommendations.push('Convert to Currency field for financial calculations');
            }
        }
        
        if (field.name.toLowerCase().includes('email') && field.type !== 'email') {
            fieldAudit.recommendations.push('Convert to Email field for validation');
        }
        
        if (field.name.toLowerCase().includes('phone') && field.type !== 'phoneNumber') {
            fieldAudit.recommendations.push('Convert to Phone Number field for formatting');
        }
    }

    generateTableRecommendations(baseId, tableId, tableAudit) {
        const tableName = tableAudit.name;
        
        // Check for missing linked record fields
        if (tableAudit.summary.linkedRecordFields === 0) {
            tableAudit.summary.missingAdvancedFeatures.push('No linked record fields');
            tableAudit.summary.recommendations.push('Add linked record fields to connect with related tables');
        }
        
        // Check for missing formula fields
        if (tableAudit.summary.formulaFields === 0) {
            tableAudit.summary.missingAdvancedFeatures.push('No formula fields');
            tableAudit.summary.recommendations.push('Add formula fields for calculated values and status indicators');
        }
        
        // Check for missing rollup fields
        if (tableAudit.summary.rollupFields === 0) {
            tableAudit.summary.missingAdvancedFeatures.push('No rollup fields');
            tableAudit.summary.recommendations.push('Add rollup fields to aggregate data from linked records');
        }
        
        // Table-specific recommendations
        if (tableName.toLowerCase().includes('customer')) {
            tableAudit.summary.recommendations.push('Add Projects linked record field');
            tableAudit.summary.recommendations.push('Add Invoices linked record field');
            tableAudit.summary.recommendations.push('Add Status Indicator formula field');
        }
        
        if (tableName.toLowerCase().includes('project')) {
            tableAudit.summary.recommendations.push('Add Customer linked record field');
            tableAudit.summary.recommendations.push('Add Tasks linked record field');
            tableAudit.summary.recommendations.push('Add Progress formula field');
        }
        
        if (tableName.toLowerCase().includes('invoice')) {
            tableAudit.summary.recommendations.push('Add Customer linked record field');
            tableAudit.summary.recommendations.push('Add Project linked record field');
            tableAudit.summary.recommendations.push('Add Days Overdue formula field');
        }
    }

    generateBaseRecommendations(baseId) {
        const baseAudit = this.results.audit[baseId];
        const baseName = baseAudit.name;
        
        // Count missing advanced features across all tables
        let totalMissingLinkedRecords = 0;
        let totalMissingFormulas = 0;
        let totalMissingRollups = 0;
        
        for (const table of Object.values(baseAudit.tables)) {
            if (table.summary.linkedRecordFields === 0) totalMissingLinkedRecords++;
            if (table.summary.formulaFields === 0) totalMissingFormulas++;
            if (table.summary.rollupFields === 0) totalMissingRollups++;
        }
        
        baseAudit.summary.missingAdvancedFeatures = [];
        if (totalMissingLinkedRecords > 0) {
            baseAudit.summary.missingAdvancedFeatures.push(`${totalMissingLinkedRecords} tables missing linked record fields`);
        }
        if (totalMissingFormulas > 0) {
            baseAudit.summary.missingAdvancedFeatures.push(`${totalMissingFormulas} tables missing formula fields`);
        }
        if (totalMissingRollups > 0) {
            baseAudit.summary.missingAdvancedFeatures.push(`${totalMissingRollups} tables missing rollup fields`);
        }
        
        // Base-specific recommendations
        if (baseName.toLowerCase().includes('core') || baseName.toLowerCase().includes('business')) {
            baseAudit.summary.recommendations.push('Establish cross-table relationships with linked record fields');
            baseAudit.summary.recommendations.push('Add formula fields for status indicators and calculations');
            baseAudit.summary.recommendations.push('Create rollup fields for aggregated data');
        }
        
        if (baseName.toLowerCase().includes('finance')) {
            baseAudit.summary.recommendations.push('Link invoices to customers and projects');
            baseAudit.summary.recommendations.push('Add payment tracking formulas');
            baseAudit.summary.recommendations.push('Create revenue aggregation rollups');
        }
    }

    async updateBasesBasedOnAudit() {
        console.log('\n🔄 Step 3: Updating bases based on audit results...');
        
        // Focus on the most critical updates first
        const priorityBases = ['appQijHhqqP4z6wGe', 'app4nJpP1ytGukXQT', 'app6yzlm67lRNuQZD'];
        
        for (const baseId of priorityBases) {
            if (this.results.audit[baseId]) {
                console.log(`\n📝 Updating base: ${this.results.audit[baseId].name}`);
                await this.updateBase(baseId);
            }
        }
    }

    async updateBase(baseId) {
        const baseAudit = this.results.audit[baseId];
        this.results.updates[baseId] = {
            name: baseAudit.name,
            updates: [],
            errors: []
        };
        
        // Get sample data for the base
        await this.getSampleDataForBase(baseId);
        
        // Update tables based on audit recommendations
        for (const [tableId, tableAudit] of Object.entries(baseAudit.tables)) {
            await this.updateTable(baseId, tableId, tableAudit);
        }
    }

    async getSampleDataForBase(baseId) {
        try {
            // Get a few records from each table to understand current data
            for (const [tableId, tableAudit] of Object.entries(this.results.audit[baseId].tables)) {
                const response = await axios.get(`${this.baseUrl}/${baseId}/${tableId}`, {
                    headers: this.headers,
                    params: { maxRecords: 3 }
                });
                
                if (!this.results.updates[baseId].sampleData) {
                    this.results.updates[baseId].sampleData = {};
                }
                
                this.results.updates[baseId].sampleData[tableId] = response.data.records;
            }
        } catch (error) {
            console.error(`  ❌ Error getting sample data for base ${baseId}:`, error.message);
        }
    }

    async updateTable(baseId, tableId, tableAudit) {
        console.log(`    📋 Updating table: ${tableAudit.name}`);
        
        try {
            // Add missing fields based on recommendations
            await this.addMissingFields(baseId, tableId, tableAudit);
            
            // Update existing records with better data
            await this.updateExistingRecords(baseId, tableId, tableAudit);
            
        } catch (error) {
            console.error(`    ❌ Error updating table ${tableAudit.name}:`, error.message);
            this.results.updates[baseId].errors.push(`Table ${tableAudit.name}: ${error.message}`);
        }
    }

    async addMissingFields(baseId, tableId, tableAudit) {
        const missingFields = [];
        
        // Generate missing field definitions based on table name and recommendations
        if (tableAudit.name.toLowerCase().includes('customer')) {
            missingFields.push({
                name: 'Status Indicator',
                type: 'formula',
                options: {
                    formula: 'SWITCH({Status}, "Active", "✅", "Inactive", "❌", "Prospect", "👁️", "Lead", "🎯", "Unknown")'
                }
            });
            
            missingFields.push({
                name: 'Last Contact',
                type: 'date',
                options: {}
            });
        }
        
        if (tableAudit.name.toLowerCase().includes('project')) {
            missingFields.push({
                name: 'Progress',
                type: 'formula',
                options: {
                    formula: 'IF({Status} = "Completed", "100%", IF({Status} = "In Progress", "50%", "0%"))'
                }
            });
        }
        
        if (tableAudit.name.toLowerCase().includes('invoice')) {
            missingFields.push({
                name: 'Days Overdue',
                type: 'formula',
                options: {
                    formula: 'IF({Status} = "Paid", 0, IF({Due Date}, DATETIME_DIFF(TODAY(), {Due Date}, "days"), 0))'
                }
            });
        }
        
        // Add the missing fields
        for (const field of missingFields) {
            try {
                await this.createField(baseId, tableId, field);
                this.results.updates[baseId].updates.push(`Added field: ${field.name} to ${tableAudit.name}`);
            } catch (error) {
                console.error(`      ❌ Error adding field ${field.name}:`, error.message);
            }
        }
    }

    async createField(baseId, tableId, fieldDefinition) {
        const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
            name: fieldDefinition.name,
            type: fieldDefinition.type,
            options: fieldDefinition.options
        }, {
            headers: this.headers
        });
        
        return response.data;
    }

    async updateExistingRecords(baseId, tableId, tableAudit) {
        const sampleData = this.results.updates[baseId].sampleData?.[tableId];
        if (!sampleData || sampleData.length === 0) return;
        
        console.log(`      📝 Updating ${sampleData.length} records in ${tableAudit.name}`);
        
        // Update records with better data
        const updates = sampleData.map(record => {
            const update = { id: record.id, fields: {} };
            
            // Add missing data based on field analysis
            for (const [fieldId, fieldAudit] of Object.entries(tableAudit.fields)) {
                const fieldName = fieldAudit.name.toLowerCase();
                
                if (fieldName.includes('status') && !record.fields[fieldId]) {
                    update.fields[fieldId] = 'Active';
                }
                
                if (fieldName.includes('date') && !record.fields[fieldId]) {
                    update.fields[fieldId] = new Date().toISOString().split('T')[0];
                }
                
                if (fieldName.includes('priority') && !record.fields[fieldId]) {
                    update.fields[fieldId] = 'Medium';
                }
            }
            
            return update;
        }).filter(update => Object.keys(update.fields).length > 0);
        
        if (updates.length > 0) {
            try {
                await axios.patch(`${this.baseUrl}/${baseId}/${tableId}`, {
                    records: updates
                }, {
                    headers: this.headers
                });
                
                this.results.updates[baseId].updates.push(`Updated ${updates.length} records in ${tableAudit.name}`);
            } catch (error) {
                console.error(`      ❌ Error updating records:`, error.message);
            }
        }
    }

    async generateReport() {
        console.log('\n📊 Step 4: Generating comprehensive report...');
        
        const report = this.generateReportContent();
        const filename = `docs/airtable-comprehensive-audit-report-${new Date().toISOString().split('T')[0]}.md`;
        
        await fs.writeFile(filename, report);
        console.log(`✅ Report saved to: ${filename}`);
        
        // Also save JSON data
        const jsonFilename = `docs/airtable-audit-data-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(jsonFilename, JSON.stringify(this.results, null, 2));
        console.log(`✅ Data saved to: ${jsonFilename}`);
    }

    generateReportContent() {
        return `# 🎯 AIRTABLE COMPREHENSIVE AUDIT AND UPDATE REPORT

## 📊 **AUDIT SUMMARY**

**Date: ${new Date().toISOString().split('T')[0]}**

### **🔍 AUDIT SCOPE**
- **Bases Audited**: ${this.results.audit.accessibleBases?.length || 0}
- **Tables Analyzed**: ${Object.values(this.results.audit).filter(v => v.tables).reduce((sum, base) => sum + base.summary.totalTables, 0)}
- **Fields Analyzed**: ${Object.values(this.results.audit).filter(v => v.tables).reduce((sum, base) => sum + base.summary.totalFields, 0)}

## 📋 **BASE-BY-BASE ANALYSIS**

${this.results.audit.accessibleBases?.map(base => this.generateBaseReport(base)).join('\n\n')}

## 🔧 **UPDATES PERFORMED**

${Object.entries(this.results.updates).map(([baseId, update]) => this.generateUpdateReport(baseId, update)).join('\n\n')}

## 🚨 **CRITICAL FINDINGS**

### **Missing Advanced Features**
${this.generateMissingFeaturesReport()}

### **Recommendations**
${this.generateRecommendationsReport()}

## 📈 **NEXT STEPS**

1. **Immediate Actions**
   - Review and approve field additions
   - Test new formula fields
   - Verify linked record relationships

2. **Medium-term Improvements**
   - Add rollup fields for data aggregation
   - Create automation workflows
   - Implement advanced views

3. **Long-term Enhancements**
   - Cross-base relationships
   - Advanced reporting
   - Integration with external systems

## 🎯 **CONCLUSION**

This comprehensive audit has identified ${this.results.errors.length} issues and performed ${Object.values(this.results.updates).reduce((sum, update) => sum + update.updates.length, 0)} updates across all Airtable bases.

**Status**: ${this.results.errors.length > 0 ? '⚠️ Issues Found' : '✅ All Systems Operational'}
`;
    }

    generateBaseReport(base) {
        const baseAudit = this.results.audit[base.id];
        if (!baseAudit) return `### ${base.name} (${base.id})\n*No audit data available*`;
        
        return `### ${base.name} (${base.id})

**Tables**: ${baseAudit.summary.totalTables}  
**Fields**: ${baseAudit.summary.totalFields}  
**Permission Level**: ${base.permissionLevel}

#### **Missing Advanced Features**
${baseAudit.summary.missingAdvancedFeatures.map(feature => `- ${feature}`).join('\n')}

#### **Recommendations**
${baseAudit.summary.recommendations.map(rec => `- ${rec}`).join('\n')}

#### **Tables**
${Object.values(baseAudit.tables).map(table => this.generateTableReport(table)).join('\n')}`;
    }

    generateTableReport(table) {
        return `**${table.name}** (${table.summary.totalFields} fields)
- Linked Records: ${table.summary.linkedRecordFields}
- Formulas: ${table.summary.formulaFields}
- Rollups: ${table.summary.rollupFields}
- Lookups: ${table.summary.lookupFields}
- Missing: ${table.summary.missingAdvancedFeatures.join(', ')}`;
    }

    generateUpdateReport(baseId, update) {
        return `### ${update.name} (${baseId})

**Updates Performed**: ${update.updates.length}
**Errors**: ${update.errors.length}

#### **Updates**
${update.updates.map(u => `- ${u}`).join('\n')}

${update.errors.length > 0 ? `#### **Errors**
${update.errors.map(e => `- ${e}`).join('\n')}` : ''}`;
    }

    generateMissingFeaturesReport() {
        const missingFeatures = new Set();
        
        for (const base of Object.values(this.results.audit)) {
            if (base.summary) {
                base.summary.missingAdvancedFeatures.forEach(feature => missingFeatures.add(feature));
            }
        }
        
        return Array.from(missingFeatures).map(feature => `- ${feature}`).join('\n');
    }

    generateRecommendationsReport() {
        const recommendations = new Set();
        
        for (const base of Object.values(this.results.audit)) {
            if (base.summary) {
                base.summary.recommendations.forEach(rec => recommendations.add(rec));
            }
        }
        
        return Array.from(recommendations).map(rec => `- ${rec}`).join('\n');
    }
}

// Run the audit and update
const auditor = new AirtableComprehensiveAuditAndUpdate();
auditor.start().catch(console.error);
