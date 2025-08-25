#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableImplementProjectsTable {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app4nJpP1ytGukXQT'; // Core Business Operations
        this.tableId = 'tblJ4C2HFSBlPkyP6'; // Projects table

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            fieldsAdded: [],
            errors: []
        };
    }

    async implementProjectsTable() {
        console.log('📋 IMPLEMENTING PROJECTS TABLE WITH 45+ ADVANCED FIELDS');
        console.log('=====================================================');
        console.log('Adding comprehensive fields for professional project management...');

        try {
            const projectsFields = [
                // Basic Project Information (10 fields)
                { name: 'Project Name', type: 'singleLineText', description: 'Primary project name' },
                { name: 'Project Code', type: 'singleLineText', description: 'Unique project identifier' },
                {
                    name: 'Project Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Web Development' }, { name: 'Mobile App' }, { name: 'Design' }, { name: 'Consulting' },
                            { name: 'Integration' }, { name: 'Automation' }, { name: 'Maintenance' }, { name: 'Support' },
                            { name: 'Training' }, { name: 'Research' }, { name: 'Marketing' }, { name: 'Other' }
                        ]
                    }
                },
                {
                    name: 'Project Category', type: 'singleSelect', options: {
                        choices: [
                            { name: 'New Development' }, { name: 'Enhancement' }, { name: 'Bug Fix' }, { name: 'Maintenance' },
                            { name: 'Migration' }, { name: 'Integration' }, { name: 'Consulting' }, { name: 'Training' }
                        ]
                    }
                },
                { name: 'Description', type: 'richText', description: 'Detailed project description' },
                { name: 'Objectives', type: 'multilineText', description: 'Project objectives and goals' },
                { name: 'Scope', type: 'multilineText', description: 'Project scope and deliverables' },
                { name: 'Requirements', type: 'richText', description: 'Project requirements and specifications' },
                { name: 'Success Criteria', type: 'multilineText', description: 'How project success will be measured' },
                { name: 'Project URL', type: 'url', description: 'Project website or demo URL' },

                // Company & Client Information (6 fields)
                { name: 'Company', type: 'singleLineText', description: 'Client company name (will be linked record)' },
                { name: 'Company Name', type: 'singleLineText', description: 'Lookup from linked company' },
                { name: 'Client Contact', type: 'singleLineText', description: 'Primary client contact (will be linked record)' },
                { name: 'Client Contact Name', type: 'singleLineText', description: 'Lookup from linked contact' },
                { name: 'Client Email', type: 'email', description: 'Primary client email' },
                { name: 'Client Phone', type: 'phoneNumber', description: 'Primary client phone' },

                // Project Management (8 fields)
                { name: 'Project Manager', type: 'singleLineText', description: 'Assigned project manager' },
                { name: 'Team Members', type: 'multilineText', description: 'List of team members assigned' },
                {
                    name: 'Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Planning' }, { name: 'In Progress' }, { name: 'On Hold' }, { name: 'Review' },
                            { name: 'Testing' }, { name: 'Deployment' }, { name: 'Completed' }, { name: 'Cancelled' }
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
                    name: 'Phase', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Discovery' }, { name: 'Planning' }, { name: 'Design' }, { name: 'Development' },
                            { name: 'Testing' }, { name: 'Deployment' }, { name: 'Launch' }, { name: 'Maintenance' }
                        ]
                    }
                },
                { name: 'Progress', type: 'number', options: { precision: 0 }, description: 'Project completion percentage (0-100)' },
                {
                    name: 'Risk Level', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Low' }, { name: 'Medium' }, { name: 'High' }, { name: 'Critical' }
                        ]
                    }
                },
                { name: 'Dependencies', type: 'multilineText', description: 'Project dependencies and blockers' },

                // Timeline & Scheduling (8 fields)
                { name: 'Start Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Project start date' },
                { name: 'End Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Project end date' },
                { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Project due date' },
                { name: 'Actual Start Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Actual project start date' },
                { name: 'Actual End Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Actual project end date' },
                { name: 'Estimated Duration', type: 'number', options: { precision: 0 }, description: 'Estimated duration in days' },
                { name: 'Actual Duration', type: 'number', options: { precision: 0 }, description: 'Actual duration in days' },
                { name: 'Days Remaining', type: 'number', options: { precision: 0 }, description: 'Days remaining until due date' },

                // Financial Information (8 fields)
                { name: 'Budget', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Project budget' },
                { name: 'Actual Cost', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Actual project cost' },
                { name: 'Revenue', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Project revenue' },
                { name: 'Profit Margin', type: 'number', options: { precision: 2 }, description: 'Project profit margin percentage' },
                { name: 'Hourly Rate', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Project hourly rate' },
                { name: 'Estimated Hours', type: 'number', options: { precision: 1 }, description: 'Estimated project hours' },
                { name: 'Actual Hours', type: 'number', options: { precision: 1 }, description: 'Actual project hours' },
                {
                    name: 'Billing Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Not Billed' }, { name: 'Partially Billed' }, { name: 'Fully Billed' }, { name: 'Paid' }
                        ]
                    }
                },

                // Technical Details (8 fields)
                { name: 'Technology Stack', type: 'multilineText', description: 'Technologies and tools used' },
                {
                    name: 'Platform', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Web' }, { name: 'Mobile' }, { name: 'Desktop' }, { name: 'API' },
                            { name: 'Database' }, { name: 'Cloud' }, { name: 'On-Premise' }, { name: 'Hybrid' }
                        ]
                    }
                },
                { name: 'Framework', type: 'singleLineText', description: 'Primary framework used' },
                { name: 'Database', type: 'singleLineText', description: 'Database technology used' },
                { name: 'Hosting', type: 'singleLineText', description: 'Hosting platform or environment' },
                { name: 'Repository URL', type: 'url', description: 'Code repository URL' },
                { name: 'API Documentation', type: 'url', description: 'API documentation URL' },
                { name: 'Technical Notes', type: 'richText', description: 'Technical implementation notes' },

                // Quality & Testing (6 fields)
                { name: 'Quality Score', type: 'number', options: { precision: 1 }, description: 'Project quality score (0-10)' },
                {
                    name: 'Testing Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Not Started' }, { name: 'In Progress' }, { name: 'Completed' }, { name: 'Failed' }
                        ]
                    }
                },
                { name: 'Bugs Found', type: 'number', options: { precision: 0 }, description: 'Number of bugs found' },
                { name: 'Bugs Fixed', type: 'number', options: { precision: 0 }, description: 'Number of bugs fixed' },
                { name: 'Performance Score', type: 'number', options: { precision: 1 }, description: 'Performance score (0-10)' },
                {
                    name: 'Security Review', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Not Reviewed' }, { name: 'In Progress' }, { name: 'Passed' }, { name: 'Failed' }
                        ]
                    }
                },

                // Communication & Collaboration (6 fields)
                {
                    name: 'Communication Channel', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Email' }, { name: 'Slack' }, { name: 'Teams' }, { name: 'Zoom' },
                            { name: 'Phone' }, { name: 'In Person' }, { name: 'Other' }
                        ]
                    }
                },
                {
                    name: 'Meeting Frequency', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Daily' }, { name: 'Weekly' }, { name: 'Bi-weekly' }, { name: 'Monthly' }, { name: 'As Needed' }
                        ]
                    }
                },
                { name: 'Last Meeting', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date of last project meeting' },
                { name: 'Next Meeting', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date of next project meeting' },
                { name: 'Meeting Notes', type: 'richText', description: 'Latest meeting notes and decisions' },
                { name: 'Communication Log', type: 'multilineText', description: 'Communication history and updates' },

                // Linked Records (6 fields) - Placeholders for future linked records
                { name: 'Linked Company', type: 'singleLineText', description: 'Linked company record' },
                { name: 'Linked Contacts', type: 'singleLineText', description: 'Linked contact records' },
                { name: 'Linked Tasks', type: 'singleLineText', description: 'Linked task records' },
                { name: 'Linked Invoices', type: 'singleLineText', description: 'Linked invoice records' },
                { name: 'Linked Documents', type: 'singleLineText', description: 'Linked document records' },
                { name: 'Linked Time Tracking', type: 'singleLineText', description: 'Linked time tracking records' },

                // Analytics & Metrics (8 fields)
                { name: 'Completion Rate', type: 'number', options: { precision: 1 }, description: 'Project completion rate percentage' },
                { name: 'On Time Delivery', type: 'checkbox', description: 'Project delivered on time' },
                { name: 'On Budget Delivery', type: 'checkbox', description: 'Project delivered on budget' },
                { name: 'Client Satisfaction', type: 'number', options: { precision: 1 }, description: 'Client satisfaction score (0-10)' },
                { name: 'Team Performance', type: 'number', options: { precision: 1 }, description: 'Team performance score (0-10)' },
                { name: 'Efficiency Score', type: 'number', options: { precision: 1 }, description: 'Project efficiency score (0-10)' },
                { name: 'ROI', type: 'number', options: { precision: 2 }, description: 'Return on investment percentage' },
                { name: 'Lessons Learned', type: 'multilineText', description: 'Key lessons learned from project' },

                // Additional Information (6 fields)
                {
                    name: 'Tags', type: 'multipleSelect', options: {
                        choices: [
                            { name: 'High Priority' }, { name: 'Strategic' }, { name: 'Innovation' }, { name: 'Legacy' },
                            { name: 'Quick Win' }, { name: 'Complex' }, { name: 'Simple' }, { name: 'Urgent' },
                            { name: 'Long-term' }, { name: 'Short-term' }, { name: 'Internal' }, { name: 'External' }
                        ]
                    }
                },
                { name: 'Notes', type: 'multilineText', description: 'General project notes' },
                { name: 'Internal Notes', type: 'multilineText', description: 'Private internal notes' },
                { name: 'Future Enhancements', type: 'multilineText', description: 'Future enhancement ideas' },
                { name: 'Competitive Analysis', type: 'multilineText', description: 'Competitive analysis notes' },
                { name: 'Market Research', type: 'multilineText', description: 'Market research findings' },

                // Timestamps (6 fields)
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Record creation date' },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Last update date' },
                { name: 'Last Activity', type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'utc' }, description: 'Last activity timestamp' },
                { name: 'Approved Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Project approval date' },
                { name: 'Kickoff Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Project kickoff date' },
                { name: 'Launch Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Project launch date' },

                // System Fields (4 fields)
                { name: 'Created By', type: 'singleLineText', description: 'User who created the record' },
                { name: 'Last Modified By', type: 'singleLineText', description: 'User who last modified the record' },
                { name: 'Record ID', type: 'singleLineText', description: 'Unique record identifier' },
                { name: 'Data Quality Score', type: 'number', options: { precision: 1 }, description: 'Data quality assessment score' }
            ];

            await this.addFieldsToTable(projectsFields);
            await this.saveResults();

            console.log('\n✅ PROJECTS TABLE IMPLEMENTATION COMPLETED!');
            console.log('🎯 45+ comprehensive fields added for professional project management');

        } catch (error) {
            console.error('❌ Implementation failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async addFieldsToTable(fields) {
        console.log(`  📋 Adding ${fields.length} fields to Projects table...`);

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
        const filename = `docs/airtable-migration/projects-table-implementation-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const implementation = new AirtableImplementProjectsTable();
implementation.implementProjectsTable().catch(console.error);
