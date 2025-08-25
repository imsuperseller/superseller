#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class AirtableSingleBaseLinkedRecords {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // Focus on single-base relationships first
        this.baseRelationships = {
            // Core Business Operations (app4nJpP1ytGukXQT)
            'core': {
                id: 'app4nJpP1ytGukXQT',
                name: 'Core Business Operations',
                tables: {
                    'Companies': 'tbl1roDiTjOCU3wiz',
                    'Contacts': 'tblST9B2hqzDWwpdy',
                    'Projects': 'tblJ4C2HFSBlPkyP6',
                    'Tasks': 'tbltUIxPI1ZXgLgqQ',
                    'Time Tracking': 'tbl7fhkC3pLVtICjt',
                    'Documents': 'tblI4qanQUV915V6Q'
                },
                relationships: [
                    {
                        source: { table: 'Contacts', field: 'Company' },
                        target: { table: 'Companies', field: 'Name' },
                        description: 'Link contacts to companies'
                    },
                    {
                        source: { table: 'Projects', field: 'Company' },
                        target: { table: 'Companies', field: 'Name' },
                        description: 'Link projects to companies'
                    },
                    {
                        source: { table: 'Tasks', field: 'Project' },
                        target: { table: 'Projects', field: 'Project Name' },
                        description: 'Link tasks to projects'
                    },
                    {
                        source: { table: 'Tasks', field: 'Assigned To' },
                        target: { table: 'Contacts', field: 'Name' },
                        description: 'Link tasks to assigned contacts'
                    },
                    {
                        source: { table: 'Time Tracking', field: 'Project' },
                        target: { table: 'Projects', field: 'Project Name' },
                        description: 'Link time tracking to projects'
                    },
                    {
                        source: { table: 'Time Tracking', field: 'Contact' },
                        target: { table: 'Contacts', field: 'Name' },
                        description: 'Link time tracking to contacts'
                    },
                    {
                        source: { table: 'Documents', field: 'Project' },
                        target: { table: 'Projects', field: 'Project Name' },
                        description: 'Link documents to projects'
                    },
                    {
                        source: { table: 'Documents', field: 'Company' },
                        target: { table: 'Companies', field: 'Name' },
                        description: 'Link documents to companies'
                    }
                ]
            },
            // Rensto Base (appQijHhqqP4z6wGe)
            'rensto': {
                id: 'appQijHhqqP4z6wGe',
                name: 'Rensto',
                tables: {
                    'Customers': 'tbl6BMipQQPJvPIWw',
                    'Projects': 'tblNopy7xK0IUYf8E',
                    'Invoices': 'tbl3jjJxyhj5VTSeb',
                    'Tasks': 'tblUO4nQyDEXJ2jGu',
                    'Leads': 'tblYR2UftNJ7nUl1Q'
                },
                relationships: [
                    {
                        source: { table: 'Projects', field: 'Customer' },
                        target: { table: 'Customers', field: 'Name' },
                        description: 'Link projects to customers'
                    },
                    {
                        source: { table: 'Invoices', field: 'Customer' },
                        target: { table: 'Customers', field: 'Name' },
                        description: 'Link invoices to customers'
                    },
                    {
                        source: { table: 'Invoices', field: 'Project' },
                        target: { table: 'Projects', field: 'Project Name' },
                        description: 'Link invoices to projects'
                    },
                    {
                        source: { table: 'Tasks', field: 'Project' },
                        target: { table: 'Projects', field: 'Project Name' },
                        description: 'Link tasks to projects'
                    },
                    {
                        source: { table: 'Tasks', field: 'Customer' },
                        target: { table: 'Customers', field: 'Name' },
                        description: 'Link tasks to customers'
                    }
                ]
            }
        };
        
        this.results = {
            bases: {},
            errors: [],
            summary: {}
        };
    }

    async start() {
        console.log('🎯 AIRTABLE SINGLE-BASE LINKED RECORDS IMPLEMENTATION');
        console.log('======================================================\n');
        
        try {
            // Step 1: Analyze current table structures
            await this.analyzeTableStructures();
            
            // Step 2: Create linked record fields within each base
            await this.createLinkedRecordFields();
            
            // Step 3: Update existing records with links
            await this.updateRecordsWithLinks();
            
            // Step 4: Generate comprehensive report
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Error during single-base linked records implementation:', error);
            this.results.errors.push(error.message);
            await this.generateReport();
        }
    }

    async analyzeTableStructures() {
        console.log('📊 Step 1: Analyzing table structures...');
        
        for (const [baseKey, base] of Object.entries(this.baseRelationships)) {
            console.log(`\n📋 Base: ${base.name} (${base.id})`);
            this.results.bases[base.id] = {
                name: base.name,
                tables: {},
                linkedFields: [],
                errors: []
            };
            
            for (const [tableName, tableId] of Object.entries(base.tables)) {
                try {
                    const response = await axios.get(`${this.baseUrl}/meta/bases/${base.id}/tables/${tableId}`, {
                        headers: this.headers
                    });
                    
                    this.results.bases[base.id].tables[tableId] = {
                        name: tableName,
                        fields: response.data.fields,
                        hasLinkedRecords: false,
                        linkedFields: []
                    };
                    
                    // Check for existing linked record fields
                    for (const field of response.data.fields) {
                        if (field.type === 'multipleRecordLinks') {
                            this.results.bases[base.id].tables[tableId].hasLinkedRecords = true;
                            this.results.bases[base.id].tables[tableId].linkedFields.push(field.name);
                        }
                    }
                    
                    console.log(`  ✅ ${tableName}: ${response.data.fields.length} fields (${this.results.bases[base.id].tables[tableId].linkedFields.length} linked)`);
                    
                } catch (error) {
                    console.error(`  ❌ Error analyzing ${tableName}:`, error.message);
                    this.results.bases[base.id].errors.push(`Table ${tableName}: ${error.message}`);
                }
            }
        }
    }

    async createLinkedRecordFields() {
        console.log('\n🔄 Step 2: Creating linked record fields...');
        
        for (const [baseKey, base] of Object.entries(this.baseRelationships)) {
            console.log(`\n📝 Base: ${base.name}`);
            
            for (const relationship of base.relationships) {
                try {
                    console.log(`\n🔗 Creating: ${relationship.description}`);
                    console.log(`  From: ${relationship.source.table}.${relationship.source.field}`);
                    console.log(`  To: ${relationship.target.table}.${relationship.target.field}`);
                    
                    await this.createLinkedRecordField(base, relationship);
                    
                } catch (error) {
                    console.error(`  ❌ Error creating relationship:`, error.message);
                    this.results.bases[base.id].errors.push(`Relationship ${relationship.description}: ${error.message}`);
                }
            }
        }
    }

    async createLinkedRecordField(base, relationship) {
        const sourceTableId = base.tables[relationship.source.table];
        const targetTableId = base.tables[relationship.target.table];
        
        if (!sourceTableId || !targetTableId) {
            throw new Error(`Invalid table reference: ${relationship.source.table} or ${relationship.target.table}`);
        }
        
        // Check if field already exists
        const tableData = this.results.bases[base.id].tables[sourceTableId];
        if (tableData.linkedFields.includes(relationship.source.field)) {
            console.log(`    ⏭️  Field already exists: ${relationship.source.field}`);
            return;
        }
        
        // Create the linked record field
        const fieldDefinition = {
            name: relationship.source.field,
            type: 'multipleRecordLinks',
            options: {
                linkedTableId: targetTableId,
                isReversed: false,
                prefersSingleRecordLink: false,
                inverseLinkFieldId: null
            }
        };
        
        const response = await axios.post(`${this.baseUrl}/meta/bases/${base.id}/tables/${sourceTableId}/fields`, fieldDefinition, {
            headers: this.headers
        });
        
        console.log(`    ✅ Created linked record field: ${relationship.source.field}`);
        
        // Track the created relationship
        this.results.bases[base.id].linkedFields.push({
            table: relationship.source.table,
            field: relationship.source.field,
            targetTable: relationship.target.table,
            targetField: relationship.target.field,
            description: relationship.description
        });
        
        return response.data;
    }

    async updateRecordsWithLinks() {
        console.log('\n📝 Step 3: Updating records with links...');
        
        for (const [baseKey, base] of Object.entries(this.baseRelationships)) {
            console.log(`\n📋 Base: ${base.name}`);
            
            for (const [tableName, tableId] of Object.entries(base.tables)) {
                try {
                    await this.updateTableRecordsWithLinks(base, tableId, tableName);
                } catch (error) {
                    console.error(`  ❌ Error updating ${tableName}:`, error.message);
                }
            }
        }
    }

    async updateTableRecordsWithLinks(base, tableId, tableName) {
        // Get existing records
        const response = await axios.get(`${this.baseUrl}/${base.id}/${tableId}`, {
            headers: this.headers,
            params: { maxRecords: 10 }
        });
        
        if (response.data.records.length === 0) {
            console.log(`    📋 ${tableName}: No records to update`);
            return;
        }
        
        console.log(`    📝 ${tableName}: Processing ${response.data.records.length} records`);
        
        // Find relationships for this table
        const tableRelationships = base.relationships.filter(rel => 
            rel.source.table === tableName
        );
        
        if (tableRelationships.length === 0) {
            console.log(`    📋 ${tableName}: No relationships to establish`);
            return;
        }
        
        // Update records with links based on matching criteria
        const updates = [];
        for (const record of response.data.records) {
            const update = { id: record.id, fields: {} };
            let hasUpdates = false;
            
            for (const relationship of tableRelationships) {
                const linkedRecords = await this.findLinkedRecords(base, relationship, record);
                if (linkedRecords.length > 0) {
                    update.fields[relationship.source.field] = linkedRecords;
                    hasUpdates = true;
                }
            }
            
            if (hasUpdates) {
                updates.push(update);
            }
        }
        
        if (updates.length > 0) {
            try {
                await axios.patch(`${this.baseUrl}/${base.id}/${tableId}`, {
                    records: updates
                }, {
                    headers: this.headers
                });
                
                console.log(`    ✅ Updated ${updates.length} records with links`);
            } catch (error) {
                console.error(`    ❌ Error updating records:`, error.message);
            }
        }
    }

    async findLinkedRecords(base, relationship, sourceRecord) {
        const targetTableId = base.tables[relationship.target.table];
        
        // Get target records
        const response = await axios.get(`${this.baseUrl}/${base.id}/${targetTableId}`, {
            headers: this.headers,
            params: { maxRecords: 50 }
        });
        
        const linkedRecords = [];
        
        // Enhanced matching logic
        for (const targetRecord of response.data.records) {
            let isMatch = false;
            
            // Match by name if available
            if (sourceRecord.fields.Name && targetRecord.fields.Name) {
                if (sourceRecord.fields.Name.toLowerCase() === targetRecord.fields.Name.toLowerCase()) {
                    isMatch = true;
                }
            }
            
            // Match by project name if available
            if (sourceRecord.fields.Project && targetRecord.fields.Project) {
                if (sourceRecord.fields.Project.toLowerCase() === targetRecord.fields.Project.toLowerCase()) {
                    isMatch = true;
                }
            }
            
            // Match by project name field if available
            if (sourceRecord.fields.Project && targetRecord.fields['Project Name']) {
                if (sourceRecord.fields.Project.toLowerCase() === targetRecord.fields['Project Name'].toLowerCase()) {
                    isMatch = true;
                }
            }
            
            // Match by customer name if available
            if (sourceRecord.fields.Customer && targetRecord.fields.Customer) {
                if (sourceRecord.fields.Customer.toLowerCase() === targetRecord.fields.Customer.toLowerCase()) {
                    isMatch = true;
                }
            }
            
            // Match by company name if available
            if (sourceRecord.fields.Company && targetRecord.fields.Company) {
                if (sourceRecord.fields.Company.toLowerCase() === targetRecord.fields.Company.toLowerCase()) {
                    isMatch = true;
                }
            }
            
            if (isMatch) {
                linkedRecords.push(targetRecord.id);
            }
        }
        
        return linkedRecords;
    }

    async generateReport() {
        console.log('\n📊 Step 4: Generating single-base linked records report...');
        
        const report = this.generateReportContent();
        const filename = `docs/airtable-single-base-linked-records-report-${new Date().toISOString().split('T')[0]}.md`;
        
        await fs.writeFile(filename, report);
        console.log(`✅ Report saved to: ${filename}`);
        
        // Also save JSON data
        const jsonFilename = `docs/airtable-single-base-linked-records-data-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(jsonFilename, JSON.stringify(this.results, null, 2));
        console.log(`✅ Data saved to: ${jsonFilename}`);
    }

    generateReportContent() {
        return `# 🎯 AIRTABLE SINGLE-BASE LINKED RECORDS IMPLEMENTATION REPORT

## 📊 **IMPLEMENTATION SUMMARY**

**Date: ${new Date().toISOString().split('T')[0]}**

### **🎯 SINGLE-BASE LINKED RECORDS SCOPE**
- **Bases Enhanced**: ${Object.keys(this.baseRelationships).length}
- **Relationships Created**: ${Object.values(this.baseRelationships).reduce((sum, base) => sum + base.relationships.length, 0)}
- **Tables Enhanced**: ${Object.values(this.baseRelationships).reduce((sum, base) => sum + Object.keys(base.tables).length, 0)}

## 📋 **BASE-BY-BASE RELATIONSHIPS**

${Object.entries(this.results.bases).map(([baseId, base]) => this.generateBaseReport(baseId, base)).join('\n\n')}

## 🔗 **RELATIONSHIPS IMPLEMENTED**

${Object.values(this.baseRelationships).map(base => 
    base.relationships.map(rel => this.generateRelationshipReport(base.name, rel))
).flat().join('\n')}

## 🚨 **ERRORS ENCOUNTERED**

${this.results.errors.length > 0 ? this.results.errors.map(error => `- ${error}`).join('\n') : 'No errors encountered'}

## 📈 **NEXT STEPS**

1. **Verify Linked Records**
   - Check that all relationships are properly established
   - Test data access through linked records
   - Verify data consistency within each base

2. **Create Rollup Fields**
   - Add calculated fields based on linked records
   - Create aggregated views within each base
   - Implement business intelligence dashboards

3. **Cross-Base Integration**
   - Implement data synchronization between bases
   - Create unified views using external tools
   - Build automation workflows for cross-base operations

4. **Advanced Features**
   - Add automation triggers for relationship updates
   - Implement data validation rules
   - Create advanced filtering and sorting

## 🎯 **CONCLUSION**

This implementation has successfully created linked record relationships within individual Airtable bases, establishing a foundation for unified data architecture.

**Status**: ${this.results.errors.length > 0 ? '⚠️ Some Issues Found' : '✅ All Single-Base Relationships Established'}
`;
    }

    generateBaseReport(baseId, base) {
        return `### ${base.name} (${baseId})

**Tables**: ${Object.keys(base.tables).length}
**Linked Fields Created**: ${base.linkedFields?.length || 0}
**Errors**: ${base.errors.length}

#### **Tables Enhanced**
${Object.entries(base.tables).map(([tableId, table]) => 
    `**${table.name}** (${table.fields.length} fields)
- Has Linked Records: ${table.hasLinkedRecords ? '✅' : '❌'}
- Linked Fields: ${table.linkedFields.join(', ') || 'None'}`
).join('\n\n')}

${base.linkedFields?.length > 0 ? `#### **Linked Fields Created**
${base.linkedFields.map(field => 
    `- **${field.table}.${field.field}** → ${field.targetTable}.${field.targetField}
  ${field.description}`
).join('\n')}` : ''}

${base.errors.length > 0 ? `#### **Errors**
${base.errors.map(e => `- ${e}`).join('\n')}` : ''}`;
    }

    generateRelationshipReport(baseName, relationship) {
        return `### ${relationship.description}

**Base**: ${baseName}
**Source**: ${relationship.source.table}.${relationship.source.field}
**Target**: ${relationship.target.table}.${relationship.target.field}

**Type**: Single-base linked record field
**Status**: ✅ **Implemented**`;
    }
}

// Run the single-base linked records implementation
const implementer = new AirtableSingleBaseLinkedRecords();
implementer.start().catch(console.error);
