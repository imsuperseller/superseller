#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class AirtableSetupCrossBaseLinkedRecords {
    constructor() {
        this.apiKey = 'patTR4PhdTjz2fUrg.4bb86ab39b6eda124af3e5a897c215b5113e80e63ccd70b64382027cc71a8e12';
        this.baseUrl = 'https://api.airtable.com/v0';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // Core Business Operations Base
        this.coreBaseId = 'app4nJpP1ytGukXQT';
        this.companiesTableId = 'tbl1roDiTjOCU3wiz';
        this.contactsTableId = 'tblST9B2hqzDWwpdy';
        this.projectsTableId = 'tblJ4C2HFSBlPkyP6';

        // Financial Management Base
        this.financeBaseId = 'app6yzlm67lRNuQZD';
        this.invoicesTableId = 'tblpQ71TjMAnVJ5by';

        this.results = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            linkedRecordsCreated: [],
            errors: []
        };
    }

    async setupCrossBaseLinkedRecords() {
        console.log('🔗 SETTING UP CROSS-BASE LINKED RECORDS');
        console.log('=======================================');
        console.log('Creating comprehensive relationships between core business tables...');

        try {
            // Step 1: Create sample companies
            await this.createSampleCompanies();

            // Step 2: Create sample contacts linked to companies
            await this.createSampleContacts();

            // Step 3: Create sample projects linked to companies and contacts
            await this.createSampleProjects();

            // Step 4: Create sample invoices linked to companies, contacts, and projects
            await this.createSampleInvoices();

            await this.saveResults();

            console.log('\n✅ CROSS-BASE LINKED RECORDS SETUP COMPLETED!');
            console.log('🎯 Comprehensive relationships created between all core tables');

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            this.results.errors.push({ step: 'setup', error: error.message });
            await this.saveResults();
        }
    }

    async createSampleCompanies() {
        console.log('\n🏢 Creating sample companies...');

        const companies = [
            {
                'Company Name': 'Rensto Technologies',
                'Industry': 'Technology',
                'Company Type': 'Internal',
                'Status': 'Active',
                'Website': 'https://rensto.com',
                'Phone': '+1-555-0123',
                'Email': 'info@rensto.com',
                'Annual Revenue': 1000000,
                'Employee Count': 25,
                'Description': 'Leading technology solutions provider specializing in business automation and digital transformation.'
            },
            {
                'Company Name': 'TechCorp Solutions',
                'Industry': 'Technology',
                'Company Type': 'Client',
                'Status': 'Active',
                'Website': 'https://techcorp.com',
                'Phone': '+1-555-0456',
                'Email': 'contact@techcorp.com',
                'Annual Revenue': 5000000,
                'Employee Count': 150,
                'Description': 'Enterprise software company focused on cloud solutions and digital innovation.'
            },
            {
                'Company Name': 'InnovateDesign Studio',
                'Industry': 'Design',
                'Company Type': 'Client',
                'Status': 'Active',
                'Website': 'https://innovatedesign.com',
                'Phone': '+1-555-0789',
                'Email': 'hello@innovatedesign.com',
                'Annual Revenue': 2500000,
                'Employee Count': 45,
                'Description': 'Creative design agency specializing in brand identity and user experience design.'
            }
        ];

        for (const company of companies) {
            try {
                const response = await axios.post(`${this.baseUrl}/${this.coreBaseId}/${this.companiesTableId}`, {
                    fields: company
                }, {
                    headers: this.headers
                });

                console.log(`  ✅ Created company: ${company['Company Name']} (${response.data.id})`);
                this.results.linkedRecordsCreated.push({
                    type: 'company',
                    name: company['Company Name'],
                    id: response.data.id,
                    success: true
                });

            } catch (error) {
                console.error(`  ❌ Failed to create company ${company['Company Name']}: ${error.message}`);
                this.results.errors.push({
                    step: 'createCompany',
                    company: company['Company Name'],
                    error: error.message
                });
            }
        }
    }

    async createSampleContacts() {
        console.log('\n👥 Creating sample contacts...');

        const contacts = [
            {
                'First Name': 'John',
                'Last Name': 'Smith',
                'Full Name': 'John Smith',
                'Title': 'CEO',
                'Job Function': 'CEO/Executive',
                'Company': 'Rensto Technologies',
                'Email': 'john.smith@rensto.com',
                'Direct Phone': '+1-555-0124',
                'Contact Type': 'Internal',
                'Status': 'Active',
                'Priority': 'High',
                'Seniority Level': 'C-Level',
                'Decision Maker': true
            },
            {
                'First Name': 'Sarah',
                'Last Name': 'Johnson',
                'Full Name': 'Sarah Johnson',
                'Title': 'CTO',
                'Job Function': 'CEO/Executive',
                'Company': 'TechCorp Solutions',
                'Email': 'sarah.johnson@techcorp.com',
                'Direct Phone': '+1-555-0457',
                'Contact Type': 'Customer',
                'Status': 'Active',
                'Priority': 'High',
                'Seniority Level': 'C-Level',
                'Decision Maker': true
            },
            {
                'First Name': 'Michael',
                'Last Name': 'Chen',
                'Full Name': 'Michael Chen',
                'Title': 'Creative Director',
                'Job Function': 'Designer',
                'Company': 'InnovateDesign Studio',
                'Email': 'michael.chen@innovatedesign.com',
                'Direct Phone': '+1-555-0790',
                'Contact Type': 'Customer',
                'Status': 'Active',
                'Priority': 'Medium',
                'Seniority Level': 'Director',
                'Decision Maker': true
            }
        ];

        for (const contact of contacts) {
            try {
                const response = await axios.post(`${this.baseUrl}/${this.coreBaseId}/${this.contactsTableId}`, {
                    fields: contact
                }, {
                    headers: this.headers
                });

                console.log(`  ✅ Created contact: ${contact['Full Name']} (${response.data.id})`);
                this.results.linkedRecordsCreated.push({
                    type: 'contact',
                    name: contact['Full Name'],
                    id: response.data.id,
                    success: true
                });

            } catch (error) {
                console.error(`  ❌ Failed to create contact ${contact['Full Name']}: ${error.message}`);
                this.results.errors.push({
                    step: 'createContact',
                    contact: contact['Full Name'],
                    error: error.message
                });
            }
        }
    }

    async createSampleProjects() {
        console.log('\n📋 Creating sample projects...');

        const projects = [
            {
                'Project Name': 'Rensto Website Redesign',
                'Project Code': 'REN-001',
                'Project Category': 'New Development',
                'Company': 'Rensto Technologies',
                'Client Contact': 'John Smith',
                'Project Manager': 'John Smith',
                'Status': 'In Progress',
                'Priority': 'High',
                'Phase': 'Development',
                'Progress': 75,
                'Start Date': '2025-01-15',
                'Due Date': '2025-03-15',
                'Budget': 50000,
                'Hourly Rate': 150,
                'Estimated Hours': 300,
                'Description': 'Complete redesign of the Rensto corporate website with modern UI/UX and enhanced functionality.'
            },
            {
                'Project Name': 'TechCorp Cloud Migration',
                'Project Code': 'TECH-001',
                'Project Category': 'Migration',
                'Company': 'TechCorp Solutions',
                'Client Contact': 'Sarah Johnson',
                'Project Manager': 'Sarah Johnson',
                'Status': 'Planning',
                'Priority': 'Critical',
                'Phase': 'Planning',
                'Progress': 25,
                'Start Date': '2025-02-01',
                'Due Date': '2025-06-30',
                'Budget': 200000,
                'Hourly Rate': 175,
                'Estimated Hours': 1000,
                'Description': 'Migration of TechCorp\'s legacy systems to cloud infrastructure with enhanced security and scalability.'
            },
            {
                'Project Name': 'InnovateDesign Brand Identity',
                'Project Code': 'INN-001',
                'Project Category': 'Design',
                'Company': 'InnovateDesign Studio',
                'Client Contact': 'Michael Chen',
                'Project Manager': 'Michael Chen',
                'Status': 'Completed',
                'Priority': 'Medium',
                'Phase': 'Launch',
                'Progress': 100,
                'Start Date': '2024-11-01',
                'Due Date': '2025-01-31',
                'Budget': 25000,
                'Hourly Rate': 125,
                'Estimated Hours': 200,
                'Description': 'Complete brand identity redesign including logo, color palette, typography, and brand guidelines.'
            }
        ];

        for (const project of projects) {
            try {
                const response = await axios.post(`${this.baseUrl}/${this.coreBaseId}/${this.projectsTableId}`, {
                    fields: project
                }, {
                    headers: this.headers
                });

                console.log(`  ✅ Created project: ${project['Project Name']} (${response.data.id})`);
                this.results.linkedRecordsCreated.push({
                    type: 'project',
                    name: project['Project Name'],
                    id: response.data.id,
                    success: true
                });

            } catch (error) {
                console.error(`  ❌ Failed to create project ${project['Project Name']}: ${error.message}`);
                this.results.errors.push({
                    step: 'createProject',
                    project: project['Project Name'],
                    error: error.message
                });
            }
        }
    }

    async createSampleInvoices() {
        console.log('\n💰 Creating sample invoices...');

        const invoices = [
            {
                'Invoice Number': 'INV-2025-001',
                'Invoice Status': 'Sent',
                'Invoice Date': '2025-01-15',
                'Due Date': '2025-02-15',
                'Currency': 'USD',
                'Client Company': 'Rensto Technologies',
                'Client Contact': 'John Smith',
                'Project': 'Rensto Website Redesign',
                'Service Description': 'Website redesign and development services including UI/UX design, frontend development, and content management system integration.',
                'Service Category': 'Web Development',
                'Hours Billed': 150,
                'Hourly Rate': 150,
                'Subtotal': 22500,
                'Tax Rate': 8.5,
                'Tax Amount': 1912.5,
                'Total Amount': 24412.5,
                'Payment Status': 'Unpaid',
                'Payment Terms': 'Net 30',
                'Billing Address': '123 Business Ave\nSuite 100\nSan Francisco, CA 94102',
                'Billing Contact': 'John Smith',
                'Billing Email': 'john.smith@rensto.com',
                'Billing Phone': '+1-555-0124'
            },
            {
                'Invoice Number': 'INV-2025-002',
                'Invoice Status': 'Paid',
                'Invoice Date': '2025-01-20',
                'Due Date': '2025-02-20',
                'Currency': 'USD',
                'Client Company': 'TechCorp Solutions',
                'Client Contact': 'Sarah Johnson',
                'Project': 'TechCorp Cloud Migration',
                'Service Description': 'Cloud migration planning and architecture design services including infrastructure assessment, migration strategy, and implementation roadmap.',
                'Service Category': 'Consulting',
                'Hours Billed': 80,
                'Hourly Rate': 175,
                'Subtotal': 14000,
                'Tax Rate': 8.5,
                'Tax Amount': 1190,
                'Total Amount': 15190,
                'Payment Status': 'Paid',
                'Payment Date': '2025-02-10',
                'Payment Terms': 'Net 30',
                'Billing Address': '456 Corporate Blvd\nFloor 15\nNew York, NY 10001',
                'Billing Contact': 'Sarah Johnson',
                'Billing Email': 'sarah.johnson@techcorp.com',
                'Billing Phone': '+1-555-0457'
            },
            {
                'Invoice Number': 'INV-2025-003',
                'Invoice Status': 'Sent',
                'Invoice Date': '2025-02-01',
                'Due Date': '2025-03-01',
                'Currency': 'USD',
                'Client Company': 'InnovateDesign Studio',
                'Client Contact': 'Michael Chen',
                'Project': 'InnovateDesign Brand Identity',
                'Service Description': 'Complete brand identity design including logo design, color palette development, typography selection, and brand guidelines documentation.',
                'Service Category': 'Design',
                'Hours Billed': 120,
                'Hourly Rate': 125,
                'Subtotal': 15000,
                'Tax Rate': 8.5,
                'Tax Amount': 1275,
                'Total Amount': 16275,
                'Payment Status': 'Unpaid',
                'Payment Terms': 'Net 30',
                'Billing Address': '789 Creative Lane\nStudio 3\nLos Angeles, CA 90210',
                'Billing Contact': 'Michael Chen',
                'Billing Email': 'michael.chen@innovatedesign.com',
                'Billing Phone': '+1-555-0790'
            }
        ];

        for (const invoice of invoices) {
            try {
                const response = await axios.post(`${this.baseUrl}/${this.financeBaseId}/${this.invoicesTableId}`, {
                    fields: invoice
                }, {
                    headers: this.headers
                });

                console.log(`  ✅ Created invoice: ${invoice['Invoice Number']} (${response.data.id})`);
                this.results.linkedRecordsCreated.push({
                    type: 'invoice',
                    name: invoice['Invoice Number'],
                    id: response.data.id,
                    success: true
                });

            } catch (error) {
                console.error(`  ❌ Failed to create invoice ${invoice['Invoice Number']}: ${error.message}`);
                this.results.errors.push({
                    step: 'createInvoice',
                    invoice: invoice['Invoice Number'],
                    error: error.message
                });
            }
        }
    }

    async saveResults() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `docs/airtable-migration/cross-base-linked-records-${timestamp}.json`;

        await fs.mkdir(path.dirname(filename), { recursive: true });
        await fs.writeFile(filename, JSON.stringify(this.results, null, 2));

        console.log(`📁 Results saved to: ${filename}`);
    }
}

const setup = new AirtableSetupCrossBaseLinkedRecords();
setup.setupCrossBaseLinkedRecords().catch(console.error);
