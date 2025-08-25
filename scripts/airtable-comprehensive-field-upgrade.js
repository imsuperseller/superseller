#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableComprehensiveFieldUpgrade {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        
        // All base IDs with their table mappings
        this.bases = {
            'rensto': {
                baseId: 'appQijHhqqP4z6wGe',
                tables: {
                    'Leads': 'tblU9N6hSBJaPemrd',
                    'Customers': 'tblqinQyqdCGIjKia', 
                    'Projects': 'tblnj6RW1B9Vbl5r0',
                    'Invoices': 'tblEkmMKUWmd6Ze8N',
                    'Tasks': 'tblqvYzEzMfUHZohB'
                }
            },
            'core': {
                baseId: 'app4nJpP1ytGukXQT',
                tables: {
                    'Companies': 'tblCompanies',
                    'Contacts': 'tblContacts',
                    'Projects': 'tblProjects',
                    'Tasks': 'tblTasks',
                    'Time Tracking': 'tblTimeTracking',
                    'Documents': 'tblDocuments'
                }
            },
            'finance': {
                baseId: 'app6yzlm67lRNuQZD',
                tables: {
                    'Invoices': 'tblInvoices',
                    'Payments': 'tblPayments',
                    'Expenses': 'tblExpenses',
                    'Revenue': 'tblRevenue',
                    'Budgets': 'tblBudgets',
                    'Tax Records': 'tblTaxRecords'
                }
            },
            'marketing': {
                baseId: 'appQhVkIaWoGJG301',
                tables: {
                    'Leads': 'tblLeads',
                    'Opportunities': 'tblOpportunities',
                    'Campaigns': 'tblCampaigns',
                    'Content': 'tblContent',
                    'Social Media': 'tblSocialMedia',
                    'Analytics': 'tblAnalytics'
                }
            },
            'operations': {
                baseId: 'app6saCaH88uK3kCO',
                tables: {
                    'Workflows': 'tblWorkflows',
                    'Automations': 'tblAutomations',
                    'Integrations': 'tblIntegrations',
                    'System Logs': 'tblSystemLogs',
                    'Maintenance': 'tblMaintenance',
                    'Backups': 'tblBackups'
                }
            },
            'customers': {
                baseId: 'appSCBZk03GUCTfhN',
                tables: {
                    'Customers': 'tblCustomers',
                    'Support Tickets': 'tblSupportTickets',
                    'Onboarding': 'tblOnboarding',
                    'Success Metrics': 'tblSuccessMetrics',
                    'Feedback': 'tblFeedback',
                    'Retention': 'tblRetention'
                }
            },
            'entities': {
                baseId: 'app9DhsrZ0VnuEH3t',
                tables: {
                    'Global Entities': 'tblyjH6tiW4vMvw46',
                    'External Identities': 'tblwVtFui8eHrkV47'
                }
            },
            'operations_advanced': {
                baseId: 'appCGexgpGPkMUPXF',
                tables: {
                    'Idempotency Keys': 'tblVC42de1P1K6or2',
                    'BMAD Projects': 'tblJj2hILjH2ciXjy'
                }
            },
            'analytics': {
                baseId: 'appOvDNYenyx7WITR',
                tables: {
                    'Usage Tracking': 'tblX93phi97sWf0Zj',
                    'Performance Metrics': 'tblVC42de1P1K6or2',
                    'Error Logs': 'tblJj2hILjH2ciXjy'
                }
            },
            'integrations': {
                baseId: 'app9oouVkvTkFjf3t',
                tables: {
                    'MCP Servers': 'tblJj2hILjH2ciXjy',
                    'External Services': 'tblVC42de1P1K6or2'
                }
            }
        };
        
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            bases: {},
            errors: []
        };
    }

    async upgradeAllFields() {
        console.log('🚀 AIRTABLE COMPREHENSIVE FIELD UPGRADE');
        console.log('=======================================');
        console.log('Upgrading all tables with advanced Airtable features...');
        
        try {
            await this.upgradeCoreBusinessFields();
            await this.upgradeFinancialFields();
            await this.upgradeMarketingFields();
            await this.upgradeOperationsFields();
            await this.upgradeCustomerFields();
            await this.upgradeEntityFields();
            await this.upgradeAdvancedOperationsFields();
            await this.upgradeAnalyticsFields();
            await this.upgradeIntegrationFields();
            
            await this.saveResults();
            
            console.log('\n✅ COMPREHENSIVE FIELD UPGRADE COMPLETED!');
            console.log('🎯 All tables enhanced with advanced Airtable features');
            
        } catch (error) {
            console.error('❌ Field upgrade failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async upgradeCoreBusinessFields() {
        console.log('\n🏢 Upgrading Core Business Operations...');
        const base = this.bases['core'];
        
        // Companies table with advanced features
        const companiesFields = [
            // Basic Info
            { name: 'Company Name', type: 'singleLineText' },
            { name: 'Legal Name', type: 'singleLineText' },
            { name: 'DBA', type: 'singleLineText' },
            { name: 'Company Type', type: 'singleSelect', options: { choices: [
                { name: 'Client' }, { name: 'Vendor' }, { name: 'Partner' }, { name: 'Internal' }, 
                { name: 'Prospect' }, { name: 'Competitor' }, { name: 'Subsidiary' }
            ]}},
            { name: 'Industry', type: 'singleSelect', options: { choices: [
                { name: 'Technology' }, { name: 'Healthcare' }, { name: 'Finance' }, { name: 'Education' },
                { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Consulting' }, { name: 'Other' }
            ]}},
            { name: 'Sub-Industry', type: 'singleLineText' },
            { name: 'SIC Code', type: 'singleLineText' },
            { name: 'NAICS Code', type: 'singleLineText' },
            
            // Contact Info
            { name: 'Website', type: 'url' },
            { name: 'Phone', type: 'phoneNumber' },
            { name: 'Fax', type: 'phoneNumber' },
            { name: 'Email', type: 'email' },
            { name: 'Primary Contact', type: 'singleLineText' },
            
            // Address
            { name: 'Address Line 1', type: 'singleLineText' },
            { name: 'Address Line 2', type: 'singleLineText' },
            { name: 'City', type: 'singleLineText' },
            { name: 'State/Province', type: 'singleLineText' },
            { name: 'Postal Code', type: 'singleLineText' },
            { name: 'Country', type: 'singleSelect', options: { choices: [
                { name: 'United States' }, { name: 'Canada' }, { name: 'United Kingdom' }, { name: 'Israel' },
                { name: 'Germany' }, { name: 'France' }, { name: 'Australia' }, { name: 'Other' }
            ]}},
            
            // Business Details
            { name: 'Founded Date', type: 'date', options: { dateFormat: { name: 'local' } } },
            { name: 'Employee Count', type: 'number', options: { precision: 0 } },
            { name: 'Annual Revenue', type: 'currency', options: { precision: 0, symbol: '$' } },
            { name: 'Revenue Range', type: 'singleSelect', options: { choices: [
                { name: 'Under $1M' }, { name: '$1M - $10M' }, { name: '$10M - $50M' },
                { name: '$50M - $100M' }, { name: '$100M - $500M' }, { name: '$500M+' }
            ]}},
            { name: 'Market Cap', type: 'currency', options: { precision: 0, symbol: '$' } },
            { name: 'Public/Private', type: 'singleSelect', options: { choices: [
                { name: 'Private' }, { name: 'Public' }, { name: 'Non-Profit' }, { name: 'Government' }
            ]}},
            
            // Financial
            { name: 'Credit Rating', type: 'singleSelect', options: { choices: [
                { name: 'A+' }, { name: 'A' }, { name: 'A-' }, { name: 'B+' }, { name: 'B' }, { name: 'B-' },
                { name: 'C+' }, { name: 'C' }, { name: 'C-' }, { name: 'D' }, { name: 'Not Rated' }
            ]}},
            { name: 'Payment Terms', type: 'singleSelect', options: { choices: [
                { name: 'Net 30' }, { name: 'Net 60' }, { name: 'Net 90' }, { name: 'Due on Receipt' },
                { name: 'Net 15' }, { name: 'Net 45' }, { name: 'Custom' }
            ]}},
            { name: 'Credit Limit', type: 'currency', options: { precision: 2, symbol: '$' } },
            
            // Status & Classification
            { name: 'Status', type: 'singleSelect', options: { choices: [
                { name: 'Active' }, { name: 'Inactive' }, { name: 'Prospect' }, { name: 'Lead' },
                { name: 'Suspended' }, { name: 'Archived' }, { name: 'Blacklisted' }
            ]}},
            { name: 'Priority Level', type: 'singleSelect', options: { choices: [
                { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
            ]}},
            { name: 'Customer Tier', type: 'singleSelect', options: { choices: [
                { name: 'Bronze' }, { name: 'Silver' }, { name: 'Gold' }, { name: 'Platinum' }, { name: 'Diamond' }
            ]}},
            
            // Relationships (will be linked records)
            { name: 'Linked Contacts', type: 'singleLineText' }, // Placeholder for linked records
            { name: 'Linked Projects', type: 'singleLineText' },
            { name: 'Linked Invoices', type: 'singleLineText' },
            { name: 'Linked Tasks', type: 'singleLineText' },
            
            // Analytics & Metrics
            { name: 'Total Projects', type: 'number', options: { precision: 0 } },
            { name: 'Active Projects', type: 'number', options: { precision: 0 } },
            { name: 'Total Revenue', type: 'currency', options: { precision: 2, symbol: '$' } },
            { name: 'Outstanding Balance', type: 'currency', options: { precision: 2, symbol: '$' } },
            { name: 'Days Since Last Activity', type: 'number', options: { precision: 0 } },
            { name: 'Customer Lifetime Value', type: 'currency', options: { precision: 2, symbol: '$' } },
            
            // Social & Online Presence
            { name: 'LinkedIn URL', type: 'url' },
            { name: 'Twitter Handle', type: 'singleLineText' },
            { name: 'Facebook Page', type: 'url' },
            { name: 'Instagram Handle', type: 'singleLineText' },
            { name: 'YouTube Channel', type: 'url' },
            
            // Notes & Additional Info
            { name: 'Company Description', type: 'multilineText' },
            { name: 'Key Products/Services', type: 'multilineText' },
            { name: 'Competitors', type: 'multilineText' },
            { name: 'Notes', type: 'multilineText' },
            { name: 'Internal Notes', type: 'multilineText' },
            
            // Timestamps
            { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } } },
            { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } } },
            { name: 'Last Contact', type: 'date', options: { dateFormat: { name: 'local' } } },
            { name: 'Next Follow-up', type: 'date', options: { dateFormat: { name: 'local' } } },
            
            // System Fields
            { name: 'Created By', type: 'singleLineText' },
            { name: 'Last Modified By', type: 'singleLineText' },
            { name: 'Source', type: 'singleSelect', options: { choices: [
                { name: 'Website' }, { name: 'Referral' }, { name: 'Cold Call' }, { name: 'Trade Show' },
                { name: 'Social Media' }, { name: 'Google Ads' }, { name: 'LinkedIn' }, { name: 'Other' }
            ]}},
            { name: 'Tags', type: 'multipleSelect', options: { choices: [
                { name: 'Enterprise' }, { name: 'SMB' }, { name: 'Startup' }, { name: 'Non-Profit' },
                { name: 'Government' }, { name: 'Education' }, { name: 'Healthcare' }, { name: 'Finance' },
                { name: 'Technology' }, { name: 'Manufacturing' }, { name: 'Retail' }, { name: 'Consulting' }
            ]}}
        ];

        await this.addFieldsToTable(base.baseId, base.tables['Companies'], companiesFields);
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
        const filename = `docs/airtable-migration/comprehensive-field-upgrade-${timestamp}.json`;
        
        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Results saved to: ${filename}`);
    }
}

const upgrade = new AirtableComprehensiveFieldUpgrade();
upgrade.upgradeAllFields().catch(console.error);
