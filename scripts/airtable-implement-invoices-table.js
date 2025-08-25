#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableImplementInvoicesTable {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        this.baseId = 'app6yzlm67lRNuQZD'; // Financial Management Base
        this.tableId = 'tblpQ71TjMAnVJ5by'; // Invoices table

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            fieldsAdded: [],
            errors: []
        };
    }

    async implementInvoicesTable() {
        console.log('💰 IMPLEMENTING INVOICES TABLE WITH 40+ ADVANCED FIELDS');
        console.log('=====================================================');
        console.log('Adding comprehensive fields for professional invoice management...');

        try {
            const invoicesFields = [
                // Basic Invoice Information (8 fields)
                { name: 'Invoice Number', type: 'singleLineText', description: 'Unique invoice identifier' },
                {
                    name: 'Invoice Type', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Service' }, { name: 'Product' }, { name: 'Subscription' }, { name: 'Retainer' },
                            { name: 'Hourly' }, { name: 'Fixed Price' }, { name: 'Recurring' }, { name: 'One-time' }
                        ]
                    }
                },
                {
                    name: 'Invoice Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Draft' }, { name: 'Sent' }, { name: 'Viewed' }, { name: 'Paid' },
                            { name: 'Overdue' }, { name: 'Cancelled' }, { name: 'Disputed' }, { name: 'Refunded' }
                        ]
                    }
                },
                { name: 'Invoice Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date invoice was created' },
                { name: 'Due Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Payment due date' },
                {
                    name: 'Payment Terms', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Net 15' }, { name: 'Net 30' }, { name: 'Net 45' }, { name: 'Net 60' },
                            { name: 'Due on Receipt' }, { name: 'Custom' }
                        ]
                    }
                },
                {
                    name: 'Currency', type: 'singleSelect', options: {
                        choices: [
                            { name: 'USD' }, { name: 'EUR' }, { name: 'GBP' }, { name: 'CAD' },
                            { name: 'AUD' }, { name: 'JPY' }, { name: 'CHF' }, { name: 'Other' }
                        ]
                    }
                },
                { name: 'Exchange Rate', type: 'number', options: { precision: 4 }, description: 'Exchange rate if different from base currency' },

                // Client & Company Information (6 fields)
                { name: 'Client Company', type: 'singleLineText', description: 'Client company name (will be linked record)' },
                { name: 'Client Company Name', type: 'singleLineText', description: 'Lookup from linked company' },
                { name: 'Client Contact', type: 'singleLineText', description: 'Primary client contact (will be linked record)' },
                { name: 'Client Contact Name', type: 'singleLineText', description: 'Lookup from linked contact' },
                { name: 'Client Email', type: 'email', description: 'Client email for invoice delivery' },
                { name: 'Client Phone', type: 'phoneNumber', description: 'Client phone number' },

                // Project & Service Information (6 fields)
                { name: 'Project', type: 'singleLineText', description: 'Related project (will be linked record)' },
                { name: 'Project Name', type: 'singleLineText', description: 'Lookup from linked project' },
                { name: 'Service Description', type: 'richText', description: 'Detailed description of services provided' },
                {
                    name: 'Service Category', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Web Development' }, { name: 'Design' }, { name: 'Consulting' }, { name: 'Support' },
                            { name: 'Training' }, { name: 'Maintenance' }, { name: 'Integration' }, { name: 'Other' }
                        ]
                    }
                },
                { name: 'Hours Billed', type: 'number', options: { precision: 2 }, description: 'Total hours billed' },
                { name: 'Hourly Rate', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Hourly rate for services' },

                // Financial Information (8 fields)
                { name: 'Subtotal', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Subtotal before taxes and discounts' },
                { name: 'Tax Rate', type: 'number', options: { precision: 2 }, description: 'Tax rate percentage' },
                { name: 'Tax Amount', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Tax amount' },
                { name: 'Discount Rate', type: 'number', options: { precision: 2 }, description: 'Discount percentage' },
                { name: 'Discount Amount', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Discount amount' },
                { name: 'Total Amount', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Total invoice amount' },
                { name: 'Amount Paid', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Amount already paid' },
                { name: 'Balance Due', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Remaining balance' },

                // Payment Information (6 fields)
                {
                    name: 'Payment Method', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Credit Card' }, { name: 'Bank Transfer' }, { name: 'Check' }, { name: 'Cash' },
                            { name: 'PayPal' }, { name: 'Stripe' }, { name: 'Other' }
                        ]
                    }
                },
                {
                    name: 'Payment Status', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Unpaid' }, { name: 'Partially Paid' }, { name: 'Paid' }, { name: 'Overdue' },
                            { name: 'Cancelled' }, { name: 'Refunded' }
                        ]
                    }
                },
                { name: 'Payment Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date payment was received' },
                { name: 'Payment Reference', type: 'singleLineText', description: 'Payment reference or transaction ID' },
                { name: 'Late Fee', type: 'currency', options: { precision: 2, symbol: '$' }, description: 'Late payment fee' },
                { name: 'Interest Rate', type: 'number', options: { precision: 2 }, description: 'Interest rate for overdue payments' },

                // Billing & Shipping (6 fields)
                { name: 'Billing Address', type: 'multilineText', description: 'Billing address' },
                { name: 'Shipping Address', type: 'multilineText', description: 'Shipping address if different' },
                { name: 'Billing Contact', type: 'singleLineText', description: 'Billing contact person' },
                { name: 'Billing Email', type: 'email', description: 'Billing email address' },
                { name: 'Billing Phone', type: 'phoneNumber', description: 'Billing phone number' },
                { name: 'Purchase Order', type: 'singleLineText', description: 'Purchase order number' },

                // Invoice Details (6 fields)
                { name: 'Invoice Notes', type: 'richText', description: 'Additional notes on invoice' },
                { name: 'Terms & Conditions', type: 'multilineText', description: 'Payment terms and conditions' },
                { name: 'Internal Notes', type: 'multilineText', description: 'Private internal notes' },
                {
                    name: 'Invoice Template', type: 'singleSelect', options: {
                        choices: [
                            { name: 'Standard' }, { name: 'Professional' }, { name: 'Simple' }, { name: 'Custom' }
                        ]
                    }
                },
                {
                    name: 'Invoice Language', type: 'singleSelect', options: {
                        choices: [
                            { name: 'English' }, { name: 'Spanish' }, { name: 'French' }, { name: 'German' },
                            { name: 'Italian' }, { name: 'Portuguese' }, { name: 'Other' }
                        ]
                    }
                },
                { name: 'Invoice URL', type: 'url', description: 'Link to online invoice' },

                // Linked Records (6 fields) - Placeholders for future linked records
                { name: 'Linked Company', type: 'singleLineText', description: 'Linked company record' },
                { name: 'Linked Contact', type: 'singleLineText', description: 'Linked contact record' },
                { name: 'Linked Project', type: 'singleLineText', description: 'Linked project record' },
                { name: 'Linked Payments', type: 'singleLineText', description: 'Linked payment records' },
                { name: 'Linked Documents', type: 'singleLineText', description: 'Linked document records' },
                { name: 'Linked Time Tracking', type: 'singleLineText', description: 'Linked time tracking records' },

                // Analytics & Metrics (6 fields)
                { name: 'Days Outstanding', type: 'number', options: { precision: 0 }, description: 'Days since invoice was sent' },
                { name: 'Days Overdue', type: 'number', options: { precision: 0 }, description: 'Days overdue if past due date' },
                { name: 'Payment Probability', type: 'number', options: { precision: 1 }, description: 'Probability of payment (0-100)' },
                { name: 'Collection Score', type: 'number', options: { precision: 1 }, description: 'Collection risk score (0-10)' },
                { name: 'Customer Rating', type: 'number', options: { precision: 1 }, description: 'Customer payment history rating' },
                { name: 'Invoice Score', type: 'number', options: { precision: 1 }, description: 'Overall invoice health score' },

                // Additional Information (6 fields)
                {
                    name: 'Tags', type: 'multipleSelect', options: {
                        choices: [
                            { name: 'High Priority' }, { name: 'Large Amount' }, { name: 'New Client' }, { name: 'Recurring' },
                            { name: 'Urgent' }, { name: 'Disputed' }, { name: 'Overdue' }, { name: 'Paid' },
                            { name: 'Follow-up Needed' }, { name: 'Auto-generated' }, { name: 'Manual' }, { name: 'Custom' }
                        ]
                    }
                },
                { name: 'Notes', type: 'multilineText', description: 'General invoice notes' },
                { name: 'Follow-up Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date for follow-up' },
                { name: 'Follow-up Notes', type: 'multilineText', description: 'Follow-up action notes' },
                { name: 'Dispute Reason', type: 'multilineText', description: 'Reason for dispute if applicable' },
                { name: 'Resolution Notes', type: 'multilineText', description: 'Resolution notes for disputes' },

                // Timestamps (6 fields)
                { name: 'Created Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Record creation date' },
                { name: 'Last Updated', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Last update date' },
                { name: 'Last Activity', type: 'dateTime', options: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'utc' }, description: 'Last activity timestamp' },
                { name: 'Sent Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date invoice was sent' },
                { name: 'Viewed Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date invoice was viewed' },
                { name: 'Reminder Date', type: 'date', options: { dateFormat: { name: 'local' } }, description: 'Date for payment reminder' },

                // System Fields (4 fields)
                { name: 'Created By', type: 'singleLineText', description: 'User who created the record' },
                { name: 'Last Modified By', type: 'singleLineText', description: 'User who last modified the record' },
                { name: 'Record ID', type: 'singleLineText', description: 'Unique record identifier' },
                { name: 'Data Quality Score', type: 'number', options: { precision: 1 }, description: 'Data quality assessment score' }
            ];

            await this.addFieldsToTable(invoicesFields);
            await this.saveResults();

            console.log('\n✅ INVOICES TABLE IMPLEMENTATION COMPLETED!');
            console.log('🎯 40+ comprehensive fields added for professional invoice management');

        } catch (error) {
            console.error('❌ Implementation failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async addFieldsToTable(fields) {
        console.log(`  📋 Adding ${fields.length} fields to Invoices table...`);

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
        const filename = `docs/airtable-migration/invoices-table-implementation-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const implementation = new AirtableImplementInvoicesTable();
implementation.implementInvoicesTable().catch(console.error);
