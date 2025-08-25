#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

class AirtableCorrectedUpdate {
    constructor() {
        this.apiKey = 'pat0dxG1HQcAUz2Kr.2c6134ed2b8df1435d7966f9434da6755d1467fd4a62fee0de7984b48f448ac9';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // Corrected table IDs based on actual Airtable structure
        this.targetBases = {
            'rensto': {
                id: 'appQijHhqqP4z6wGe',
                name: 'Rensto',
                tables: {
                    'Customers': 'tbl6BMipQQPJvPIWw',
                    'Projects': 'tblNopy7xK0IUYf8E',
                    'Invoices': 'tbl3jjJxyhj5VTSeb',
                    'Tasks': 'tblUO4nQyDEXJ2jGu',
                    'Leads': 'tblYR2UftNJ7nUl1Q'
                }
            },
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
                }
            }
        };
        
        this.results = {
            updates: {},
            errors: [],
            summary: {}
        };
    }

    async start() {
        console.log('🎯 AIRTABLE CORRECTED UPDATE - RENSTO BASES');
        console.log('============================================\n');
        
        try {
            // Step 1: Get current table schemas
            await this.getTableSchemas();
            
            // Step 2: Add missing advanced fields
            await this.addMissingFields();
            
            // Step 3: Update existing records
            await this.updateExistingRecords();
            
            // Step 4: Generate report
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Error during corrected update:', error);
            this.results.errors.push(error.message);
            await this.generateReport();
        }
    }

    async getTableSchemas() {
        console.log('📊 Step 1: Getting table schemas...');
        
        for (const [baseKey, base] of Object.entries(this.targetBases)) {
            console.log(`\n📋 Base: ${base.name} (${base.id})`);
            this.results.updates[base.id] = {
                name: base.name,
                tables: {},
                updates: [],
                errors: []
            };
            
            for (const [tableName, tableId] of Object.entries(base.tables)) {
                try {
                    const response = await axios.get(`${this.baseUrl}/meta/bases/${base.id}/tables/${tableId}`, {
                        headers: this.headers
                    });
                    
                    this.results.updates[base.id].tables[tableId] = {
                        name: tableName,
                        fields: response.data.fields,
                        hasLinkedRecords: false,
                        hasFormulas: false,
                        hasRollups: false
                    };
                    
                    // Check for advanced features
                    for (const field of response.data.fields) {
                        if (field.type === 'multipleRecordLinks') {
                            this.results.updates[base.id].tables[tableId].hasLinkedRecords = true;
                        } else if (field.type === 'formula') {
                            this.results.updates[base.id].tables[tableId].hasFormulas = true;
                        } else if (field.type === 'rollup') {
                            this.results.updates[base.id].tables[tableId].hasRollups = true;
                        }
                    }
                    
                    console.log(`  ✅ ${tableName}: ${response.data.fields.length} fields`);
                    
                } catch (error) {
                    console.error(`  ❌ Error getting schema for ${tableName}:`, error.message);
                    this.results.updates[base.id].errors.push(`Table ${tableName}: ${error.message}`);
                }
            }
        }
    }

    async addMissingFields() {
        console.log('\n🔄 Step 2: Adding missing advanced fields...');
        
        for (const [baseKey, base] of Object.entries(this.targetBases)) {
            console.log(`\n📝 Base: ${base.name}`);
            
            for (const [tableName, tableId] of Object.entries(base.tables)) {
                const tableData = this.results.updates[base.id].tables[tableId];
                if (!tableData) continue;
                
                console.log(`  📋 Table: ${tableName}`);
                
                // Add missing fields based on table type
                await this.addTableSpecificFields(base.id, tableId, tableName, tableData);
            }
        }
    }

    async addTableSpecificFields(baseId, tableId, tableName, tableData) {
        const missingFields = [];
        
        // Customer table enhancements
        if (tableName.toLowerCase().includes('customer')) {
            if (!tableData.hasFormulas) {
                missingFields.push({
                    name: 'Status Indicator',
                    type: 'formula',
                    options: {
                        formula: 'SWITCH({Status}, "Active", "✅", "Inactive", "❌", "Prospect", "👁️", "Lead", "🎯", "Unknown")'
                    }
                });
            }
            
            missingFields.push({
                name: 'Last Contact Date',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'Customer Since',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'Website',
                type: 'url',
                options: {}
            });
            
            missingFields.push({
                name: 'Industry',
                type: 'singleSelect',
                options: {
                    choices: [
                        { name: 'Technology', color: 'blue' },
                        { name: 'Healthcare', color: 'green' },
                        { name: 'Finance', color: 'yellow' },
                        { name: 'Education', color: 'orange' },
                        { name: 'Retail', color: 'red' },
                        { name: 'Other', color: 'gray' }
                    ]
                }
            });
        }
        
        // Project table enhancements
        if (tableName.toLowerCase().includes('project')) {
            if (!tableData.hasFormulas) {
                missingFields.push({
                    name: 'Progress',
                    type: 'formula',
                    options: {
                        formula: 'SWITCH({Status}, "Completed", "100%", "In Progress", "50%", "Planning", "25%", "0%")'
                    }
                });
            }
            
            missingFields.push({
                name: 'Start Date',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'End Date',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'Budget',
                type: 'currency',
                options: {
                    currency: 'USD'
                }
            });
            
            missingFields.push({
                name: 'Priority',
                type: 'singleSelect',
                options: {
                    choices: [
                        { name: 'Low', color: 'blue' },
                        { name: 'Medium', color: 'yellow' },
                        { name: 'High', color: 'orange' },
                        { name: 'Critical', color: 'red' }
                    ]
                }
            });
        }
        
        // Invoice table enhancements
        if (tableName.toLowerCase().includes('invoice')) {
            if (!tableData.hasFormulas) {
                missingFields.push({
                    name: 'Days Overdue',
                    type: 'formula',
                    options: {
                        formula: 'IF({Status} = "Paid", 0, IF({Due Date}, DATETIME_DIFF(TODAY(), {Due Date}, "days"), 0))'
                    }
                });
            }
            
            missingFields.push({
                name: 'Issue Date',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'Due Date',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'Amount',
                type: 'currency',
                options: {
                    currency: 'USD'
                }
            });
            
            missingFields.push({
                name: 'Payment Method',
                type: 'singleSelect',
                options: {
                    choices: [
                        { name: 'Credit Card', color: 'blue' },
                        { name: 'Bank Transfer', color: 'green' },
                        { name: 'Check', color: 'yellow' },
                        { name: 'Cash', color: 'orange' },
                        { name: 'Other', color: 'gray' }
                    ]
                }
            });
        }
        
        // Task table enhancements
        if (tableName.toLowerCase().includes('task')) {
            if (!tableData.hasFormulas) {
                missingFields.push({
                    name: 'Status Indicator',
                    type: 'formula',
                    options: {
                        formula: 'SWITCH({Status}, "Done", "✅", "In Progress", "🔄", "To Do", "📋", "Review", "👀", "Unknown")'
                    }
                });
            }
            
            missingFields.push({
                name: 'Due Date',
                type: 'date',
                options: {}
            });
            
            missingFields.push({
                name: 'Priority',
                type: 'singleSelect',
                options: {
                    choices: [
                        { name: 'Low', color: 'blue' },
                        { name: 'Medium', color: 'yellow' },
                        { name: 'High', color: 'orange' },
                        { name: 'Critical', color: 'red' }
                    ]
                }
            });
            
            missingFields.push({
                name: 'Estimated Hours',
                type: 'number',
                options: {
                    precision: 1
                }
            });
            
            missingFields.push({
                name: 'Actual Hours',
                type: 'number',
                options: {
                    precision: 1
                }
            });
        }
        
        // Add the missing fields
        for (const field of missingFields) {
            try {
                await this.createField(baseId, tableId, field);
                this.results.updates[baseId].updates.push(`Added field: ${field.name} to ${tableName}`);
                console.log(`    ✅ Added: ${field.name}`);
            } catch (error) {
                console.error(`    ❌ Error adding field ${field.name}:`, error.message);
                this.results.updates[baseId].errors.push(`Field ${field.name}: ${error.message}`);
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

    async updateExistingRecords() {
        console.log('\n📝 Step 3: Updating existing records...');
        
        for (const [baseKey, base] of Object.entries(this.targetBases)) {
            console.log(`\n📋 Base: ${base.name}`);
            
            for (const [tableName, tableId] of Object.entries(base.tables)) {
                try {
                    await this.updateTableRecords(base.id, tableId, tableName);
                } catch (error) {
                    console.error(`  ❌ Error updating records in ${tableName}:`, error.message);
                }
            }
        }
    }

    async updateTableRecords(baseId, tableId, tableName) {
        // Get existing records
        const response = await axios.get(`${this.baseUrl}/${baseId}/${tableId}`, {
            headers: this.headers,
            params: { maxRecords: 10 }
        });
        
        if (response.data.records.length === 0) {
            console.log(`    📋 ${tableName}: No records to update`);
            return;
        }
        
        console.log(`    📝 ${tableName}: Updating ${response.data.records.length} records`);
        
        // Update records with better data
        const updates = response.data.records.map(record => {
            const update = { id: record.id, fields: {} };
            
            // Add missing data based on field analysis
            for (const [fieldName, fieldValue] of Object.entries(record.fields)) {
                const fieldNameLower = fieldName.toLowerCase();
                
                // Set default status if missing
                if (fieldNameLower.includes('status') && !fieldValue) {
                    if (tableName.toLowerCase().includes('customer')) {
                        update.fields[fieldName] = 'Active';
                    } else if (tableName.toLowerCase().includes('project')) {
                        update.fields[fieldName] = 'Planning';
                    } else if (tableName.toLowerCase().includes('task')) {
                        update.fields[fieldName] = 'To Do';
                    } else if (tableName.toLowerCase().includes('invoice')) {
                        update.fields[fieldName] = 'Draft';
                    }
                }
                
                // Set default priority if missing
                if (fieldNameLower.includes('priority') && !fieldValue) {
                    update.fields[fieldName] = 'Medium';
                }
                
                // Set default dates if missing
                if (fieldNameLower.includes('date') && !fieldValue) {
                    update.fields[fieldName] = new Date().toISOString().split('T')[0];
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
                
                this.results.updates[baseId].updates.push(`Updated ${updates.length} records in ${tableName}`);
                console.log(`    ✅ Updated ${updates.length} records`);
            } catch (error) {
                console.error(`    ❌ Error updating records:`, error.message);
            }
        }
    }

    async generateReport() {
        console.log('\n📊 Step 4: Generating corrected update report...');
        
        const report = this.generateReportContent();
        const filename = `docs/airtable-corrected-update-report-${new Date().toISOString().split('T')[0]}.md`;
        
        await fs.writeFile(filename, report);
        console.log(`✅ Report saved to: ${filename}`);
        
        // Also save JSON data
        const jsonFilename = `docs/airtable-corrected-update-data-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(jsonFilename, JSON.stringify(this.results, null, 2));
        console.log(`✅ Data saved to: ${jsonFilename}`);
    }

    generateReportContent() {
        return `# 🎯 AIRTABLE CORRECTED UPDATE REPORT - RENSTO BASES

## 📊 **UPDATE SUMMARY**

**Date: ${new Date().toISOString().split('T')[0]}**

### **🎯 CORRECTED UPDATE SCOPE**
- **Bases Updated**: ${Object.keys(this.targetBases).length}
- **Tables Enhanced**: ${Object.values(this.targetBases).reduce((sum, base) => sum + Object.keys(base.tables).length, 0)}
- **Updates Performed**: ${Object.values(this.results.updates).reduce((sum, update) => sum + update.updates.length, 0)}

## 📋 **BASE-BY-BASE UPDATE RESULTS**

${Object.entries(this.results.updates).map(([baseId, update]) => this.generateUpdateReport(baseId, update)).join('\n\n')}

## 🚨 **ERRORS ENCOUNTERED**

${this.results.errors.length > 0 ? this.results.errors.map(error => `- ${error}`).join('\n') : 'No errors encountered'}

## 📈 **NEXT STEPS**

1. **Verify Field Additions**
   - Check that all new fields were created successfully
   - Test formula fields for correct calculations
   - Verify data types and options

2. **Data Quality Improvements**
   - Review updated records for accuracy
   - Add more comprehensive data where needed
   - Set up automation for ongoing data maintenance

3. **Advanced Features**
   - Add linked record fields for table relationships
   - Create rollup fields for data aggregation
   - Implement automation workflows

## 🎯 **CONCLUSION**

This corrected update has enhanced the core Rensto Airtable bases with proper table IDs and advanced features.

**Status**: ${this.results.errors.length > 0 ? '⚠️ Some Issues Found' : '✅ All Updates Successful'}
`;
    }

    generateUpdateReport(baseId, update) {
        return `### ${update.name} (${baseId})

**Updates Performed**: ${update.updates.length}
**Errors**: ${update.errors.length}

#### **Tables Enhanced**
${Object.entries(update.tables).map(([tableId, table]) => 
    `**${table.name}** (${table.fields.length} fields)
- Linked Records: ${table.hasLinkedRecords ? '✅' : '❌'}
- Formulas: ${table.hasFormulas ? '✅' : '❌'}
- Rollups: ${table.hasRollups ? '✅' : '❌'}`
).join('\n\n')}

#### **Updates**
${update.updates.map(u => `- ${u}`).join('\n')}

${update.errors.length > 0 ? `#### **Errors**
${update.errors.map(e => `- ${e}`).join('\n')}` : ''}`;
    }
}

// Run the corrected update
const updater = new AirtableCorrectedUpdate();
updater.start().catch(console.error);
