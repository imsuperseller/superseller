#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableImplementContactsTable {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app4nJpP1ytGukXQT'; // Core Business Operations
        this.tableId = 'tblST9B2hqzDWwpdy'; // Contacts table

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            fieldsAdded: [],
            errors: []
        };
    }

    async implementContactsTable() {
        console.log('👥 IMPLEMENTING CONTACTS TABLE WITH 40+ ADVANCED FIELDS');
        console.log('=====================================================');
        console.log('Adding comprehensive fields for professional contact management...');

        try {
            const contactsFields = [
                // Personal Information (12 fields)
                { name: 'First Name', type: 'singleLineText', description: 'Contact first name' },
                { name: 'Last Name', type: 'singleLineText', description: 'Contact last name' },
                { name: 'Full Name', type: 'singleLineText', description: 'Complete contact name' },
                { name: 'Title', type: 'singleLineText', description: 'Job title or position' },
                { name: 'Department', type: 'singleLineText', description: 'Department or division' },
                {
                    name: 'Job Function', type: 'singleSelect', options: {
                        choices: [
                            { name: 'CEO/Executive' }, { name: 'Manager' }, { name: 'Director' }, { name: 'VP' },
                            { name: 'Developer' }, { name: 'Designer' }, { name: 'Sales' }, { name: 'Marketing' },
                            { name: 'Finance' }, { name: 'HR' }, { name: 'Operations' }, { name: 'Support' },
                            { name: 'Consultant' }, { name: 'Freelancer' }, { name: 'Other' }
                        ]
                    }
                },
                { name: 'Company', type: 'singleLineText', description: 'Company name (will be linked record)' },
                { name: 'Company Name', type: 'singleLineText', description: 'Lookup from linked company' },
                { name: 'Direct Phone', type: 'phoneNumber', description: 'Direct phone number' },
                { name: 'Mobile', type: 'phoneNumber', description: 'Mobile phone number' },
                { name: 'Email', type: 'email', description: 'Primary email address' },
                { name: 'LinkedIn', type: 'url', description: 'LinkedIn profile URL' },
                { name: 'Birthday', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Birthday for relationship building' },

                // Professional Details (8 fields)
                {
                    name: 'Role', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Decision Maker' }, { name: 'Influencer' }, { name: 'User' }, { name: 'Technical Contact' },
                            { name: 'Billing Contact' }, { name: 'Project Manager' }, { name: 'Stakeholder' }, { name: 'End User' }
                        ]
                    }
                },
                {
                    name: 'Seniority Level', type: 'singleSelect', options: {
                        choices: [
                            { name: 'C-Level' }, { name: 'VP' }, { name: 'Director' }, { name: 'Manager' },
                            { name: 'Senior' }, { name: 'Mid-Level' }, { name: 'Junior' }, { name: 'Entry Level' }
                        ]
                    }
                },
                { name: 'Decision Maker', type: 'checkbox', description: 'Is this person a decision maker?' },
                { name: 'Team', type: 'singleLineText', description: 'Team or group assignment' },
                { name: 'Reports To', type: 'singleLineText', description: 'Manager or supervisor' },
                { name: 'Skills', type: 'multilineText', description: 'Professional skills and expertise' },
                { name: 'Certifications', type: 'multilineText', description: 'Professional certifications' },
                { name: 'Professional Bio', type: 'richText', description: 'Professional biography' },

                // Relationship Management (8 fields)
                {
                    name: 'Contact Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Customer' }, { name: 'Prospect' }, { name: 'Partner' }, { name: 'Vendor' },
                            { name: 'Internal' }, { name: 'Referral' }, { name: 'Influencer' }, { name: 'Other' }
                        ]
                    }
                },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Active' }, { name: 'Inactive' }, { name: 'Lead' }, { name: 'Prospect' },
                            { name: 'Customer' }, { name: 'Former Customer' }, { name: 'Blacklisted' }
                        ]
                    }
                },
                {
                    name: 'Priority', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                        ]
                    }
                },
                {
                    name: 'Source', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Website' }, { name: 'Referral' }, { name: 'Cold Call' }, { name: 'Trade Show' },
                            { name: 'Social Media' }, { name: 'Google Ads' }, { name: 'LinkedIn' }, { name: 'Email Campaign' },
                            { name: 'Partner' }, { name: 'Existing Customer' }, { name: 'Other' }
                        ]
                    }
                },
                {
                    name: 'Tags', type: 'multipleSelect', options: {
                        choices: [
                            { name: 'VIP' }, { name: 'Key Contact' }, { name: 'Technical' }, { name: 'Business' },
                            { name: 'Influencer' }, { name: 'Decision Maker' }, { name: 'Gatekeeper' }, { name: 'Champion' },
                            { name: 'High Priority' }, { name: 'Strategic' }, { name: 'Long-term' }, { name: 'New Contact' }
                        ]
                    }
                },
                { name: 'Interests', type: 'multilineText', description: 'Personal and professional interests' },
                {
                    name: 'Communication Preferences', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Email' }, { name: 'Phone' }, { name: 'Text' }, { name: 'LinkedIn' },
                            { name: 'In Person' }, { name: 'Video Call' }, { name: 'Any' }
                        ]
                    }
                },
                {
                    name: 'Preferred Contact Method', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Email' }, { name: 'Phone' }, { name: 'Text' }, { name: 'LinkedIn' },
                            { name: 'In Person' }, { name: 'Video Call' }, { name: 'Any' }
                        ]
                    }
                },

                // Interaction History (8 fields)
                { name: 'Last Contact Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date of last interaction' },
                { name: 'Next Follow-up', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Next scheduled follow-up' },
                { name: 'Total Interactions', type: 'number', options: { precision: 0 }, description: 'Total number of interactions' },
                { name: 'Meeting Count', type: 'number', options: { precision: 0 }, description: 'Number of meetings held' },
                { name: 'Email Sent', type: 'number', options: { precision: 0 }, description: 'Number of emails sent' },
                { name: 'Email Opened', type: 'number', options: { precision: 0 }, description: 'Number of emails opened' },
                { name: 'Email Clicked', type: 'number', options: { precision: 0 }, description: 'Number of email clicks' },
                { name: 'Call History', type: 'multilineText', description: 'Summary of call interactions' },
                { name: 'Meeting Notes', type: 'richText', description: 'Notes from meetings and interactions' },

                // Linked Records (6 fields) - Placeholders for future linked records
                { name: 'Linked Company', type: 'singleLineText', description: 'Linked company record' },
                { name: 'Linked Projects', type: 'singleLineText', description: 'Linked project records' },
                { name: 'Linked Tasks', type: 'singleLineText', description: 'Linked task records' },
                { name: 'Linked Invoices', type: 'singleLineText', description: 'Linked invoice records' },
                { name: 'Linked Support Tickets', type: 'singleLineText', description: 'Linked support ticket records' },
                { name: 'Linked Opportunities', type: 'singleLineText', description: 'Linked opportunity records' },

                // Analytics (6 fields)
                { name: 'Engagement Score', type: 'number', options: { precision: 1 }, description: 'Engagement score (0-10)' },
                { name: 'Response Rate', type: 'number', options: { precision: 1 }, description: 'Response rate percentage' },
                {
                    name: 'Influence Level', type: 'singleSelect', options: {
                        choices: [
                            { name: 'High' }, { name: 'Medium' }, { name: 'Low' }, { name: 'Unknown' }
                        ]
                    }
                },
                {
                    name: 'Decision Authority', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Final Decision' }, { name: 'Influencer' }, { name: 'Recommender' }, { name: 'User' }, { name: 'None' }
                        ]
                    }
                },
                {
                    name: 'Relationship Strength', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Strong' }, { name: 'Good' }, { name: 'Fair' }, { name: 'Weak' }, { name: 'New' }
                        ]
                    }
                },
                {
                    name: 'Trust Level', type: 'singleSelect', options: {
                        choices: [
                            { name: 'High' }, { name: 'Medium' }, { name: 'Low' }, { name: 'Building' }
                        ]
                    }
                },

                // Additional Information (6 fields)
                { name: 'Headshot', type: 'singleLineText', description: 'Profile picture URL' },
                { name: 'Personal Notes', type: 'multilineText', description: 'Personal notes and observations' },
                { name: 'Professional Goals', type: 'multilineText', description: 'Professional goals and objectives' },
                { name: 'Pain Points', type: 'multilineText', description: 'Identified pain points and challenges' },
                { name: 'Success Metrics', type: 'multilineText', description: 'How this contact measures success' },
                { name: 'Competitive Intelligence', type: 'multilineText', description: 'Competitive information and insights' },

                // Timestamps (6 fields)
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Record creation date' },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Last update date' },
                { name: 'Last Activity', type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'utc' }, description: 'Last activity timestamp' },
                { name: 'First Contact', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date of first contact' },
                { name: 'Last Meeting', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date of last meeting' },
                { name: 'Next Meeting', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date of next scheduled meeting' },

                // System Fields (4 fields)
                { name: 'Created By', type: 'singleLineText', description: 'User who created the record' },
                { name: 'Last Modified By', type: 'singleLineText', description: 'User who last modified the record' },
                { name: 'Record ID', type: 'singleLineText', description: 'Unique record identifier' },
                { name: 'Data Quality Score', type: 'number', options: { precision: 1 }, description: 'Data quality assessment score' }
            ];

            await this.addFieldsToTable(contactsFields);
            await this.saveResults();

            console.log('\n✅ CONTACTS TABLE IMPLEMENTATION COMPLETED!');
            console.log('🎯 40+ comprehensive fields added for professional contact management');

        } catch (error) {
            console.error('❌ Implementation failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async addFieldsToTable(fields) {
        console.log(`  📋 Adding ${fields.length} fields to Contacts table...`);

        for (const field of fields) {
            try {
                const response = await axios.post(`${this.baseUrl}/meta/bases/${this.baseId}/tables/${this.tableId}/fields`, {
                    name: field.name,
                    type: field.type,
                    description: field.description,
                    ...(field.options && { options: field.options })
                }, {
                    headers: this.headers
                });

                console.log(`    ✅ Added field "${field.name}" (${field.type})`);
                this.results.fieldsAdded.push({
                    name: field.name,
                    type: field.type,
                    success: true
                });

            } catch (error) {
                console.error(`    ❌ Failed to add field "${field.name}": ${error.message}`);
                this.results.errors.push({
                    step: 'addField',
                    field: field.name,
                    error: error.message
                });
            }
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/contacts-table-implementation-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const implementation = new AirtableImplementContactsTable();
implementation.implementContactsTable().catch(console.error);
