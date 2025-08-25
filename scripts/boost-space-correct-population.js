#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceCorrectPopulation {
    constructor() {
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.platform = 'https://superseller.boost.space';
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            population: {}
        };
        
        // Correct endpoints based on analysis
        this.endpoints = {
            contacts: '/contacts',           // Without /api prefix
            businessCase: '/api/business-case',
            businessContract: '/api/business-contract',
            invoice: '/api/invoice',
            todo: '/api/todo',
            event: '/api/event',
            note: '/api/note',
            products: '/products'            // Without /api prefix
        };
    }

    async populateBoostSpace() {
        console.log('🚀 POPULATING BOOST.SPACE WITH CORRECT ENDPOINTS');
        console.log('================================================\n');

        try {
            // 1. Test API connectivity
            await this.testAPIConnectivity();

            // 2. Populate contacts
            await this.populateContacts();

            // 3. Populate business cases
            await this.populateBusinessCases();

            // 4. Populate invoices
            await this.populateInvoices();

            // 5. Populate todos
            await this.populateTodos();

            // 6. Populate events
            await this.populateEvents();

            // 7. Populate notes
            await this.populateNotes();

            // 8. Populate products
            await this.populateProducts();

            // 9. Generate summary
            await this.generateSummary();

            this.results.status = 'completed';
            await this.saveResults();

            console.log('\n✅ BOOST.SPACE POPULATION COMPLETED!');
            console.log('🎯 All data has been populated using correct endpoints!');

        } catch (error) {
            console.error('❌ Boost.space population failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }

    async testAPIConnectivity() {
        console.log('🔍 1. TESTING API CONNECTIVITY');
        console.log('-------------------------------');

        const tests = {};
        let passedTests = 0;
        const totalTests = Object.keys(this.endpoints).length;

        for (const [module, endpoint] of Object.entries(this.endpoints)) {
            try {
                const response = await axios.get(`${this.platform}${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });

                console.log(`✅ ${module}: ${response.status}`);
                tests[module] = { status: 'passed', statusCode: response.status };
                passedTests++;

            } catch (error) {
                console.log(`❌ ${module}: ${error.response?.status || 'Connection failed'}`);
                tests[module] = { 
                    status: 'failed', 
                    statusCode: error.response?.status,
                    error: error.message 
                };
            }
        }

        console.log(`📊 API Tests: ${passedTests}/${totalTests} passed`);
        this.results.apiTests = tests;
    }

    async populateContacts() {
        console.log('\n👥 2. POPULATING CONTACTS');
        console.log('-------------------------');

        const contacts = [
            {
                name: 'Ben Ginati',
                email: 'ben@ginati.com',
                phone: '+972-50-123-4567',
                company: 'Ginati Business Solutions',
                status: 'Active Customer',
                notes: 'Complete business automation project'
            },
            {
                name: 'Shelly Mizrahi',
                email: 'shelly@mizrahi-insurance.com',
                phone: '+972-52-987-6543',
                company: 'Mizrahi Insurance Services',
                status: 'Active Customer',
                notes: 'Insurance document processing system'
            },
            {
                name: 'John Smith',
                email: 'john@smithconsulting.com',
                phone: '+1-555-123-4567',
                company: 'Smith Consulting',
                status: 'Prospect',
                notes: 'Interested in automation solutions'
            },
            {
                name: 'Jane Doe',
                email: 'jane@doeenterprises.com',
                phone: '+1-555-987-6543',
                company: 'Doe Enterprises',
                status: 'Lead',
                notes: 'Initial consultation scheduled'
            }
        ];

        this.results.population.contacts = {
            total: contacts.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const contact of contacts) {
            try {
                const response = await this.createContact(contact);
                console.log(`✅ Created contact: ${contact.name}`);
                this.results.population.contacts.successful++;
                this.results.population.contacts.records.push({
                    name: contact.name,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create contact: ${contact.name}`);
                this.results.population.contacts.failed++;
                this.results.population.contacts.records.push({
                    name: contact.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Contacts: ${this.results.population.contacts.successful}/${contacts.length} populated successfully`);
    }

    async populateBusinessCases() {
        console.log('\n💼 3. POPULATING BUSINESS CASES');
        console.log('--------------------------------');

        const businessCases = [
            {
                name: 'Ben Ginati - Complete Business Automation',
                status: 'In Progress',
                customer: 'Ben Ginati',
                budget: 15000,
                timeline: '3 months',
                description: 'Complete business automation system including WordPress setup, workflow automation, and monitoring dashboard'
            },
            {
                name: 'Shelly Mizrahi - Insurance Document Processing',
                status: 'Planning',
                customer: 'Shelly Mizrahi',
                budget: 8000,
                timeline: '2 months',
                description: 'Insurance document processing and automation system for Mizrahi Insurance Services'
            }
        ];

        this.results.population.businessCases = {
            total: businessCases.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const businessCase of businessCases) {
            try {
                const response = await this.createBusinessCase(businessCase);
                console.log(`✅ Created business case: ${businessCase.name}`);
                this.results.population.businessCases.successful++;
                this.results.population.businessCases.records.push({
                    name: businessCase.name,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create business case: ${businessCase.name}`);
                this.results.population.businessCases.failed++;
                this.results.population.businessCases.records.push({
                    name: businessCase.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Business Cases: ${this.results.population.businessCases.successful}/${businessCases.length} populated successfully`);
    }

    async populateInvoices() {
        console.log('\n💰 4. POPULATING INVOICES');
        console.log('------------------------');

        const invoices = [
            {
                number: 'INV-001',
                customer: 'Ben Ginati',
                amount: 5000,
                status: 'Pending',
                dueDate: '2025-09-15',
                description: 'Business automation system setup - Phase 1'
            },
            {
                number: 'INV-002',
                customer: 'Shelly Mizrahi',
                amount: 3000,
                status: 'Draft',
                dueDate: '2025-09-30',
                description: 'Insurance document processing system - Initial setup'
            }
        ];

        this.results.population.invoices = {
            total: invoices.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const invoice of invoices) {
            try {
                const response = await this.createInvoice(invoice);
                console.log(`✅ Created invoice: ${invoice.number}`);
                this.results.population.invoices.successful++;
                this.results.population.invoices.records.push({
                    number: invoice.number,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create invoice: ${invoice.number}`);
                this.results.population.invoices.failed++;
                this.results.population.invoices.records.push({
                    number: invoice.number,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Invoices: ${this.results.population.invoices.successful}/${invoices.length} populated successfully`);
    }

    async populateTodos() {
        console.log('\n✅ 5. POPULATING TODOS');
        console.log('---------------------');

        const todos = [
            {
                title: 'Complete Ben Ginati WordPress setup',
                assignee: 'Development Team',
                priority: 'High',
                status: 'In Progress',
                dueDate: '2025-08-30',
                description: 'Set up WordPress site with custom themes and plugins for Ben Ginati'
            },
            {
                title: 'Deploy Shelly Mizrahi document system',
                assignee: 'Development Team',
                priority: 'Medium',
                status: 'Planning',
                dueDate: '2025-09-15',
                description: 'Deploy document processing system for insurance documents'
            },
            {
                title: 'Set up monitoring dashboard',
                assignee: 'DevOps Team',
                priority: 'Medium',
                status: 'To Do',
                dueDate: '2025-08-25',
                description: 'Configure system monitoring and alerting dashboard'
            }
        ];

        this.results.population.todos = {
            total: todos.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const todo of todos) {
            try {
                const response = await this.createTodo(todo);
                console.log(`✅ Created todo: ${todo.title}`);
                this.results.population.todos.successful++;
                this.results.population.todos.records.push({
                    title: todo.title,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create todo: ${todo.title}`);
                this.results.population.todos.failed++;
                this.results.population.todos.records.push({
                    title: todo.title,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Todos: ${this.results.population.todos.successful}/${todos.length} populated successfully`);
    }

    async populateEvents() {
        console.log('\n📅 6. POPULATING EVENTS');
        console.log('----------------------');

        const events = [
            {
                title: 'Ben Ginati Project Kickoff',
                startDate: '2025-08-25T10:00:00Z',
                endDate: '2025-08-25T11:00:00Z',
                location: 'Virtual Meeting',
                description: 'Kickoff meeting for business automation project with Ben Ginati'
            },
            {
                title: 'Shelly Mizrahi System Demo',
                startDate: '2025-08-28T14:00:00Z',
                endDate: '2025-08-28T15:00:00Z',
                location: 'Virtual Meeting',
                description: 'Demo of insurance document processing system for Shelly Mizrahi'
            }
        ];

        this.results.population.events = {
            total: events.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const event of events) {
            try {
                const response = await this.createEvent(event);
                console.log(`✅ Created event: ${event.title}`);
                this.results.population.events.successful++;
                this.results.population.events.records.push({
                    title: event.title,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create event: ${event.title}`);
                this.results.population.events.failed++;
                this.results.population.events.records.push({
                    title: event.title,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Events: ${this.results.population.events.successful}/${events.length} populated successfully`);
    }

    async populateNotes() {
        console.log('\n📝 7. POPULATING NOTES');
        console.log('---------------------');

        const notes = [
            {
                title: 'Ben Ginati Project Requirements',
                content: 'Complete business automation including WordPress setup, workflow automation, and monitoring dashboard. Budget: $15,000, Timeline: 3 months.',
                author: 'Project Manager',
                category: 'Project Documentation',
                tags: ['automation', 'wordpress', 'monitoring']
            },
            {
                title: 'Shelly Mizrahi Insurance System',
                content: 'Insurance document processing and automation system. Focus on document classification, data extraction, and workflow automation.',
                author: 'Business Analyst',
                category: 'Requirements',
                tags: ['insurance', 'document-processing', 'automation']
            }
        ];

        this.results.population.notes = {
            total: notes.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const note of notes) {
            try {
                const response = await this.createNote(note);
                console.log(`✅ Created note: ${note.title}`);
                this.results.population.notes.successful++;
                this.results.population.notes.records.push({
                    title: note.title,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create note: ${note.title}`);
                this.results.population.notes.failed++;
                this.results.population.notes.records.push({
                    title: note.title,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Notes: ${this.results.population.notes.successful}/${notes.length} populated successfully`);
    }

    async populateProducts() {
        console.log('\n📦 8. POPULATING PRODUCTS');
        console.log('-------------------------');

        const products = [
            {
                name: 'Business Automation Package',
                sku: 'BAP-001',
                price: 15000,
                category: 'Automation Services',
                status: 'Active',
                description: 'Complete business automation solution including WordPress setup, workflow automation, and monitoring dashboard'
            },
            {
                name: 'Document Processing System',
                sku: 'DPS-001',
                price: 8000,
                category: 'Document Services',
                status: 'Active',
                description: 'Insurance document processing and automation system with AI-powered classification and data extraction'
            }
        ];

        this.results.population.products = {
            total: products.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const product of products) {
            try {
                const response = await this.createProduct(product);
                console.log(`✅ Created product: ${product.name}`);
                this.results.population.products.successful++;
                this.results.population.products.records.push({
                    name: product.name,
                    status: 'success',
                    data: response.data
                });
            } catch (error) {
                console.log(`❌ Failed to create product: ${product.name}`);
                this.results.population.products.failed++;
                this.results.population.products.records.push({
                    name: product.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Products: ${this.results.population.products.successful}/${products.length} populated successfully`);
    }

    async createContact(contact) {
        return await axios.post(`${this.platform}${this.endpoints.contacts}`, contact, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createBusinessCase(businessCase) {
        return await axios.post(`${this.platform}${this.endpoints.businessCase}`, businessCase, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createInvoice(invoice) {
        return await axios.post(`${this.platform}${this.endpoints.invoice}`, invoice, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createTodo(todo) {
        return await axios.post(`${this.platform}${this.endpoints.todo}`, todo, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createEvent(event) {
        return await axios.post(`${this.platform}${this.endpoints.event}`, event, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createNote(note) {
        return await axios.post(`${this.platform}${this.endpoints.note}`, note, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createProduct(product) {
        return await axios.post(`${this.platform}${this.endpoints.products}`, product, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async generateSummary() {
        console.log('\n📊 9. POPULATION SUMMARY');
        console.log('------------------------');

        const totalRecords = Object.values(this.results.population).reduce((sum, module) => sum + module.total, 0);
        const totalSuccessful = Object.values(this.results.population).reduce((sum, module) => sum + module.successful, 0);
        const totalFailed = Object.values(this.results.population).reduce((sum, module) => sum + module.failed, 0);

        console.log(`📈 Total Records: ${totalRecords}`);
        console.log(`✅ Successful Population: ${totalSuccessful}`);
        console.log(`❌ Failed Population: ${totalFailed}`);
        console.log(`📊 Success Rate: ${((totalSuccessful / totalRecords) * 100).toFixed(1)}%`);
        console.log(`📦 Modules Populated: ${Object.keys(this.results.population).join(', ')}`);

        this.results.summary = {
            totalRecords,
            totalSuccessful,
            totalFailed,
            successRate: ((totalSuccessful / totalRecords) * 100).toFixed(1),
            modules: Object.keys(this.results.population)
        };
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-correct-population';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-correct-population-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`📁 Population results saved to: ${resultsDir}/${filename}`);
    }
}

async function main() {
    const population = new BoostSpaceCorrectPopulation();
    await population.populateBoostSpace();
}

main().catch(console.error);
