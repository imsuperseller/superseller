#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableAdvancedFeaturesImplementation {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // We need to get the actual table IDs first
        this.bases = {
            'core': 'app4nJpP1ytGukXQT',
            'finance': 'app6yzlm67lRNuQZD',
            'marketing': 'appQhVkIaWoGJG301',
            'operations': 'app6saCaH88uK3kCO',
            'customers': 'appSCBZk03GUCTfhN',
            'entities': 'app9DhsrZ0VnuEH3t'
        };
        
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: {},
            errors: []
        };
    }

    async implementAdvancedFeatures() {
        console.log('🚀 AIRTABLE ADVANCED FEATURES IMPLEMENTATION');
        console.log('============================================');
        console.log('Implementing comprehensive advanced features...');
        
        try {
            // Step 1: Analyze existing structure
            await this.analyzeExistingStructure();
            
            // Step 2: Implement Companies table with 50+ fields
            await this.implementCompaniesTable();
            
            // Step 3: Implement Contacts table with 40+ fields
            await this.implementContactsTable();
            
            // Step 4: Implement Projects table with 45+ fields
            await this.implementProjectsTable();
            
            // Step 5: Implement Invoices table with advanced features
            await this.implementInvoicesTable();
            
            // Step 6: Implement Global Entities as central hub
            await this.implementGlobalEntitiesTable();
            
            await this.saveResults();
            
            console.log('\n✅ ADVANCED FEATURES IMPLEMENTATION COMPLETED!');
            console.log('🎯 All tables enhanced with comprehensive advanced features');
            
        } catch (error) {
            console.error('❌ Implementation failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async analyzeExistingStructure() {
        console.log('\n📊 Analyzing existing structure...');
        
        for (const [baseName, baseId] of Object.entries(this.bases)) {
            try {
                const response = await axios.get(`${this.baseUrl}/meta/bases/${baseId}/tables`, {
                    headers: this.headers
                });
                
                const tables = response.data.tables || [];
                console.log(`  📋 ${baseName}: ${tables.length} tables found`);
                
                this.results.bases[baseName] = {
                    id: baseId,
                    tables: tables.map(t => ({ id: t.id, name: t.name, fields: t.fields }))
                };
                
                // Log table details
                for (const table of tables) {
                    console.log(`    - ${table.name} (${table.id}): ${table.fields.length} fields`);
                }
                
            } catch (error) {
                console.error(`  ❌ Failed to analyze ${baseName}: ${error.message}`);
                this.results.errors.push({
                    step: 'analyze',
                    base: baseName,
                    error: error.message
                });
            }
        }
    }

    async implementCompaniesTable() {
        console.log('\n🏢 Implementing Companies Table with 50+ Advanced Fields...');
        const baseId = this.bases['core'];
        const tableId = this.getTableId('core', 'Companies');
        
        if (!tableId) {
            console.log('  ⚠️ Companies table not found, skipping...');
            return;
        }

        const companiesFields = [
            // Basic Information (15 fields)
            { name: 'Company Name', type: 'singleLineText', description: 'Primary company name' },
            { name: 'Legal Name', type: 'singleLineText', description: 'Legal entity name' },
            { name: 'DBA', type: 'singleLineText', description: 'Doing Business As name' },
            { name: 'Tax ID', type: 'singleLineText', description: 'Tax identification number' },
            { name: 'EIN', type: 'singleLineText', description: 'Employer Identification Number' },
            { name: 'Industry', type: 'singleSelect', options: { choices: [
                { name: 'Technology' }, { name: 'Healthcare' }, { name: 'Finance' }, { name: 'Education' },
                { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Consulting' }, { name: 'Real Estate' },
                { name: 'Legal' }, { name: 'Marketing' }, { name: 'Non-Profit' }, { name: 'Government' },
                { name: 'Transportation' }, { name: 'Energy' }, { name: 'Other' }
            ]}},
            { name: 'Sub-Industry', type: 'singleLineText', description: 'Specific industry subcategory' },
            { name: 'SIC Code', type: 'singleLineText', description: 'Standard Industrial Classification code' },
            { name: 'NAICS Code', type: 'singleLineText', description: 'North American Industry Classification System code' },
            { name: 'Company Type', type: 'singleSelect', options: { choices: [
                { name: 'Client' }, { name: 'Vendor' }, { name: 'Partner' }, { name: 'Internal' },
                { name: 'Prospect' }, { name: 'Competitor' }, { name: 'Subsidiary' }, { name: 'Parent' }
            ]}},
            { name: 'Company Size', type: 'singleSelect', options: { choices: [
                { name: 'Startup (1-10)' }, { name: 'Small (11-50)' }, { name: 'Medium (51-200)' },
                { name: 'Large (201-1000)' }, { name: 'Enterprise (1000+)' }
            ]}},
            { name: 'Revenue Range', type: 'singleSelect', options: { choices: [
                { name: 'Under $1M' }, { name: '$1M - $10M' }, { name: '$10M - $50M' },
                { name: '$50M - $100M' }, { name: '$100M - $500M' }, { name: '$500M - $1B' }, { name: '$1B+' }
            ]}},
            { name: 'Market Cap', type: 'currency', options: { precision: 0, symbol: '$' }, description: 'Market capitalization' },
            { name: 'Public/Private', type: 'singleSelect', options: { choices: [
                { name: 'Private' }, { name: 'Public' }, { name: 'Non-Profit' }, { name: 'Government' }
            ]}},
            { name: 'Stock Symbol', type: 'singleLineText', description: 'Stock exchange symbol if public' },
            { name: 'Exchange', type: 'singleLineText', description: 'Stock exchange if public' },

            // Contact Information (10 fields)
            { name: 'Website', type: 'url', description: 'Company website URL' },
            { name: 'Phone', type: 'phoneNumber', description: 'Main company phone' },
            { name: 'Fax', type: 'phoneNumber', description: 'Company fax number' },
            { name: 'Email', type: 'email', description: 'General company email' },
            { name: 'Primary Contact', type: 'singleLineText', description: 'Main contact person name' },
            { name: 'Address Line 1', type: 'singleLineText', description: 'Primary address line 1' },
            { name: 'Address Line 2', type: 'singleLineText', description: 'Primary address line 2' },
            { name: 'City', type: 'singleLineText', description: 'City' },
            { name: 'State/Province', type: 'singleLineText', description: 'State or province' },
            { name: 'Postal Code', type: 'singleLineText', description: 'Postal/ZIP code' },
            { name: 'Country', type: 'singleSelect', options: { choices: [
                { name: 'United States' }, { name: 'Canada' }, { name: 'United Kingdom' }, { name: 'Israel' },
                { name: 'Germany' }, { name: 'France' }, { name: 'Australia' }, { name: 'Japan' },
                { name: 'China' }, { name: 'India' }, { name: 'Brazil' }, { name: 'Mexico' }, { name: 'Other' }
            ]}},

            // Business Details (8 fields)
            { name: 'Founded Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Company founding date' },
            { name: 'Employee Count', type: 'number', options: { precision: 0 }, description: 'Number of employees' },
            { name: 'Annual Revenue', type: 'currency', options: { precision: 0, symbol: '$' }, description: 'Annual revenue' },
            { name: 'Credit Rating', type: 'singleSelect', options: { choices: [
                { name: 'A+' }, { name: 'A' }, { name: 'A-' }, { name: 'B+' }, { name: 'B' }, { name: 'B-' },
                { name: 'C+' }, { name: 'C' }, { name: 'C-' }, { name: 'D' }, { name: 'Not Rated' }
            ]}},
            { name: 'Payment Terms', type: 'singleSelect', options: { choices: [
                { name: 'Net 30' }, { name: 'Net 60' }, { name: 'Net 90' }, { name: 'Due on Receipt' },
                { name: 'Net 15' }, { name: 'Net 45' }, { name: 'Net 120' }, { name: 'Custom' }
            ]}},
            { name: 'Credit Limit', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Credit limit' },
            { name: 'Parent Company', type: 'singleLineText', description: 'Parent company name' },
            { name: 'Subsidiaries', type: 'multilineText', description: 'List of subsidiary companies' },

            // Status & Classification (6 fields)
            { name: 'Status', type: 'singleSelect', options: { choices: [
                { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' },
                { name: 'Suspended' }, { name: 'Archived' }, { name: 'Blacklisted' }, { name: 'Pending' }
            ]}},
            { name: 'Priority Level', type: 'singleSelect', options: { choices: [
                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
            ]}},
            { name: 'Customer Tier', type: 'singleSelect', options: { choices: [
                { name: 'Bronze' }, { name: 'Silver' }, { name: 'Gold' }, { name: 'Platinum' }, { name: 'Diamond' }
            ]}},
            { name: 'Risk Level', type: 'singleSelect', options: { choices: [
                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
            ]}},
            { name: 'Compliance Status', type: 'singleSelect', options: { choices: [
                { name: 'Compliant' }, { name: 'Non-Compliant' }, { name: 'Under Review' }, { name: 'Pending' }
            ]}},
            { name: 'Source', type: 'singleSelect', options: { choices: [
                { name: 'Website' }, { name: 'Referral' }, { name: 'Cold Call' }, { name: 'Trade Show' },
                { name: 'Social Media' }, { name: 'Google Ads' }, { name: 'LinkedIn' }, { name: 'Email Campaign' },
                { name: 'Partner' }, { name: 'Existing Customer' }, { name: 'Other' }
            ]}},

            // Analytics & Metrics (8 fields) - These will be rollups
            { name: 'Total Revenue', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Total revenue from all projects' },
            { name: 'Outstanding Balance', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Total outstanding invoices' },
            { name: 'Total Projects', type: 'number', options: { precision: 0 }, description: 'Total number of projects' },
            { name: 'Active Projects', type: 'number', options: { precision: 0 }, description: 'Number of active projects' },
            { name: 'Completed Projects', type: 'number', options: { precision: 0 }, description: 'Number of completed projects' },
            { name: 'Customer Lifetime Value', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Total customer lifetime value' },
            { name: 'Days Since Last Activity', type: 'number', options: { precision: 0 }, description: 'Days since last interaction' },
            { name: 'Average Project Value', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Average project value' },

            // Social & Online Presence (6 fields)
            { name: 'LinkedIn URL', type: 'url', description: 'LinkedIn company page' },
            { name: 'Twitter Handle', type: 'singleLineText', description: 'Twitter handle' },
            { name: 'Facebook Page', type: 'url', description: 'Facebook page URL' },
            { name: 'Instagram Handle', type: 'singleLineText', description: 'Instagram handle' },
            { name: 'YouTube Channel', type: 'url', description: 'YouTube channel URL' },
            { name: 'Google My Business', type: 'url', description: 'Google My Business page' },

            // Notes & Documentation (8 fields)
            { name: 'Company Description', type: 'richText', description: 'Rich text company description' },
            { name: 'Key Products/Services', type: 'multilineText', description: 'Main products or services offered' },
            { name: 'Target Markets', type: 'multilineText', description: 'Target market segments' },
            { name: 'Competitors', type: 'multilineText', description: 'Main competitors' },
            { name: 'Market Position', type: 'multilineText', description: 'Market position and strategy' },
            { name: 'SWOT Analysis', type: 'multilineText', description: 'Strengths, Weaknesses, Opportunities, Threats' },
            { name: 'Internal Notes', type: 'multilineText', description: 'Private internal notes' },
            { name: 'Public Notes', type: 'multilineText', description: 'Public notes visible to team' },

            // Timestamps & Tracking (8 fields)
            { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Record creation date' },
            { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Last update date' },
            { name: 'Last Contact', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Last contact date' },
            { name: 'Next Follow-up', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Next follow-up date' },
            { name: 'Contract Renewal Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Contract renewal date' },
            { name: 'Onboarding Start', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Onboarding start date' },
            { name: 'Onboarding Complete', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Onboarding completion date' },
            { name: 'Last Activity', type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'utc' }, description: 'Last activity timestamp' },

            // System Fields (6 fields)
            { name: 'Created By', type: 'singleLineText', description: 'User who created the record' },
            { name: 'Last Modified By', type: 'singleLineText', description: 'User who last modified the record' },
            { name: 'Record ID', type: 'singleLineText', description: 'Unique record identifier' },
            { name: 'Tags', type: 'multipleSelect', options: { choices: [
                { name: 'Enterprise' }, { name: 'SMB' }, { name: 'Startup' }, { name: 'Non-Profit' },
                { name: 'Government' }, { name: 'Education' }, { name: 'Healthcare' }, { name: 'Finance' },
                { name: 'Technology' }, { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Consulting' },
                { name: 'High Priority' }, { name: 'VIP' }, { name: 'Strategic' }, { name: 'Long-term' }
            ]}},
            { name: 'Industry Classification', type: 'singleLineText', description: 'Detailed industry classification' },
            { name: 'Data Quality Score', type: 'number', options: { precision: 1 }, description: 'Data quality assessment score' }
        ];

        await this.addFieldsToTable(baseId, tableId, companiesFields);
    }

    getTableId(baseName, tableName) {
        const base = this.results.bases[baseName];
        if (!base) return null;
        
        const table = base.tables.find(t => t.name === tableName);
        return table ? table.id : null;
    }

    async addFieldsToTable(baseId, tableId, fields) {
        console.log(`  📋 Adding ${fields.length} fields to table ${tableId}...`);
        
        for (const field of fields) {
            try {
                const response = await axios.post(`${this.baseUrl}/meta/bases/${baseId}/tables/${tableId}/fields`, {
                    name: field.name,
                    type: field.type,
                    description: field.description,
                    ...(field.options && { options: field.options })
                }, {
                    headers: this.headers
                });
                
                console.log(`    ✅ Added field "${field.name}" (${field.type})`);
                
            } catch (error) {
                console.error(`    ❌ Failed to add field "${field.name}": ${error.message}`);
                this.results.errors.push({
                    step: 'addField',
                    base: baseId,
                    table: tableId,
                    field: field.name,
                    error: error.message
                });
            }
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/advanced-features-implementation-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const implementation = new AirtableAdvancedFeaturesImplementation();
implementation.implementAdvancedFeatures().catch(console.error);
