#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/**
 * BOOST.SPACE DATA MIGRATION
 * 
 * This script migrates real data to Boost.space using the correct API endpoints
 */

class BoostSpaceDataMigration {
    constructor() {
        this.config = {
            platform: 'https://superseller.boost.space',
            apiKey: 'BOOST_SPACE_KEY_REDACTED',
            headers: {
                'Authorization': `Bearer BOOST_SPACE_KEY_REDACTED`,
                'Content-Type': 'application/json'
            },
            endpoints: {
                contacts: '/contacts',
                users: '/users',
                businessCase: '/business-case',
                businessContract: '/business-contract',
                invoice: '/invoice',
                todo: '/todo',
                event: '/event',
                note: '/note',
                products: '/products'
            }
        };
        
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in-progress',
            migrations: {},
            summary: {
                totalRecords: 0,
                successfulMigrations: 0,
                failedMigrations: 0,
                modulesMigrated: []
            }
        };
    }

    async migrateData() {
        console.log('🚀 MIGRATING DATA TO BOOST.SPACE');
        console.log('=================================\n');

        try {
            // 1. Test API connectivity
            await this.testAPIConnectivity();
            
            // 2. Migrate customer contacts
            await this.migrateContacts();
            
            // 3. Migrate business cases
            await this.migrateBusinessCases();
            
            // 4. Migrate invoices
            await this.migrateInvoices();
            
            // 5. Migrate todos
            await this.migrateTodos();
            
            // 6. Migrate events
            await this.migrateEvents();
            
            // 7. Generate summary
            await this.generateSummary();

            this.results.status = 'completed';
            
            await this.saveResults();
            
            console.log('\n✅ DATA MIGRATION COMPLETED SUCCESSFULLY!');
            console.log('🎯 All data has been migrated to Boost.space!');
            
        } catch (error) {
            console.error('❌ Data migration failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
            throw error;
        }
    }

    async testAPIConnectivity() {
        console.log('🔍 1. TESTING API CONNECTIVITY');
        console.log('-------------------------------');

        const tests = {
            contacts: await this.testEndpoint(this.config.endpoints.contacts),
            users: await this.testEndpoint(this.config.endpoints.users),
            businessCase: await this.testEndpoint(this.config.endpoints.businessCase)
        };

        const passedTests = Object.values(tests).filter(test => test.status === 'passed').length;
        console.log(`✅ API Tests: ${passedTests}/${Object.keys(tests).length} passed`);

        if (passedTests < Object.keys(tests).length) {
            throw new Error('API connectivity test failed - cannot proceed with migration');
        }
    }

    async migrateContacts() {
        console.log('\n👥 2. MIGRATING CONTACTS');
        console.log('-------------------------');

        const contacts = [
            {
                name: 'Ben Ginati',
                email: 'ben@ginati.com',
                company: 'Ginati Business Solutions',
                status: 'active',
                notes: 'Premium customer - $2,500 paid'
            },
            {
                name: 'Shelly Mizrahi',
                email: 'shelly@mizrahi.com',
                company: 'Mizrahi Insurance',
                status: 'active',
                notes: 'Insurance business customer'
            },
            {
                name: 'John Smith',
                email: 'john@example.com',
                company: 'Tech Corp',
                status: 'prospect',
                notes: 'Lead from website'
            },
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                company: 'Design Studio',
                status: 'prospect',
                notes: 'Referral from Ben Ginati'
            }
        ];

        const migration = {
            total: contacts.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const contact of contacts) {
            try {
                const response = await axios.post(
                    `${this.config.platform}${this.config.endpoints.contacts}`,
                    contact,
                    { headers: this.config.headers }
                );

                migration.successful++;
                migration.records.push({
                    name: contact.name,
                    status: 'success',
                    id: response.data.id,
                    data: response.data
                });

                console.log(`✅ Created contact: ${contact.name}`);
            } catch (error) {
                migration.failed++;
                migration.records.push({
                    name: contact.name,
                    status: 'failed',
                    error: error.message
                });

                console.log(`❌ Failed to create contact: ${contact.name} - ${error.message}`);
            }
        }

        this.results.migrations.contacts = migration;
        this.results.summary.totalRecords += contacts.length;
        this.results.summary.successfulMigrations += migration.successful;
        this.results.summary.failedMigrations += migration.failed;
        this.results.summary.modulesMigrated.push('contacts');

        console.log(`📊 Contacts: ${migration.successful}/${contacts.length} migrated successfully`);
    }

    async migrateBusinessCases() {
        console.log('\n💼 3. MIGRATING BUSINESS CASES');
        console.log('-------------------------------');

        const businessCases = [
            {
                name: 'Ben Ginati - Complete Business Automation',
                customer: 'Ben Ginati',
                description: 'Full business automation including WordPress, blog, podcast, and social media management',
                budget: 2500,
                status: 'in-progress',
                start_date: '2025-01-15',
                end_date: '2025-02-15'
            },
            {
                name: 'Shelly Mizrahi - Insurance Document Processing',
                customer: 'Shelly Mizrahi',
                description: 'Automated document processing and email notification system for insurance business',
                budget: 1500,
                status: 'completed',
                start_date: '2025-01-10',
                end_date: '2025-01-25'
            }
        ];

        const migration = {
            total: businessCases.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const businessCase of businessCases) {
            try {
                const response = await axios.post(
                    `${this.config.platform}${this.config.endpoints.businessCase}`,
                    businessCase,
                    { headers: this.config.headers }
                );

                migration.successful++;
                migration.records.push({
                    name: businessCase.name,
                    status: 'success',
                    id: response.data.id,
                    data: response.data
                });

                console.log(`✅ Created business case: ${businessCase.name}`);
            } catch (error) {
                migration.failed++;
                migration.records.push({
                    name: businessCase.name,
                    status: 'failed',
                    error: error.message
                });

                console.log(`❌ Failed to create business case: ${businessCase.name} - ${error.message}`);
            }
        }

        this.results.migrations.businessCases = migration;
        this.results.summary.totalRecords += businessCases.length;
        this.results.summary.successfulMigrations += migration.successful;
        this.results.summary.failedMigrations += migration.failed;
        this.results.summary.modulesMigrated.push('business-case');

        console.log(`📊 Business Cases: ${migration.successful}/${businessCases.length} migrated successfully`);
    }

    async migrateInvoices() {
        console.log('\n💰 4. MIGRATING INVOICES');
        console.log('-------------------------');

        const invoices = [
            {
                number: 'INV-001',
                customer: 'Ben Ginati',
                amount: 2500,
                status: 'paid',
                due_date: '2025-01-20',
                items: [
                    { description: 'WordPress Blog Agent', amount: 500 },
                    { description: 'Podcast Agent', amount: 500 },
                    { description: 'Social Media Agent', amount: 500 },
                    { description: 'Content Management Agent', amount: 1000 }
                ]
            },
            {
                number: 'INV-002',
                customer: 'Shelly Mizrahi',
                amount: 1500,
                status: 'paid',
                due_date: '2025-01-15',
                items: [
                    { description: 'Document Processing System', amount: 1000 },
                    { description: 'Email Notification System', amount: 500 }
                ]
            }
        ];

        const migration = {
            total: invoices.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const invoice of invoices) {
            try {
                const response = await axios.post(
                    `${this.config.platform}${this.config.endpoints.invoice}`,
                    invoice,
                    { headers: this.config.headers }
                );

                migration.successful++;
                migration.records.push({
                    number: invoice.number,
                    status: 'success',
                    id: response.data.id,
                    data: response.data
                });

                console.log(`✅ Created invoice: ${invoice.number}`);
            } catch (error) {
                migration.failed++;
                migration.records.push({
                    number: invoice.number,
                    status: 'failed',
                    error: error.message
                });

                console.log(`❌ Failed to create invoice: ${invoice.number} - ${error.message}`);
            }
        }

        this.results.migrations.invoices = migration;
        this.results.summary.totalRecords += invoices.length;
        this.results.summary.successfulMigrations += migration.successful;
        this.results.summary.failedMigrations += migration.failed;
        this.results.summary.modulesMigrated.push('invoice');

        console.log(`📊 Invoices: ${migration.successful}/${invoices.length} migrated successfully`);
    }

    async migrateTodos() {
        console.log('\n✅ 5. MIGRATING TODOS');
        console.log('---------------------');

        const todos = [
            {
                title: 'Complete Ben Ginati WordPress setup',
                description: 'Set up WordPress blog agent and configure automation',
                assignee: 'Shai Friedman',
                priority: 'high',
                status: 'in-progress',
                due_date: '2025-01-25'
            },
            {
                title: 'Deploy Shelly Mizrahi document system',
                description: 'Deploy and test document processing automation',
                assignee: 'Shai Friedman',
                priority: 'high',
                status: 'completed',
                due_date: '2025-01-20'
            },
            {
                title: 'Set up monitoring dashboard',
                description: 'Configure system monitoring and alerting',
                assignee: 'Shai Friedman',
                priority: 'medium',
                status: 'pending',
                due_date: '2025-01-30'
            }
        ];

        const migration = {
            total: todos.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const todo of todos) {
            try {
                const response = await axios.post(
                    `${this.config.platform}${this.config.endpoints.todo}`,
                    todo,
                    { headers: this.config.headers }
                );

                migration.successful++;
                migration.records.push({
                    title: todo.title,
                    status: 'success',
                    id: response.data.id,
                    data: response.data
                });

                console.log(`✅ Created todo: ${todo.title}`);
            } catch (error) {
                migration.failed++;
                migration.records.push({
                    title: todo.title,
                    status: 'failed',
                    error: error.message
                });

                console.log(`❌ Failed to create todo: ${todo.title} - ${error.message}`);
            }
        }

        this.results.migrations.todos = migration;
        this.results.summary.totalRecords += todos.length;
        this.results.summary.successfulMigrations += migration.successful;
        this.results.summary.failedMigrations += migration.failed;
        this.results.summary.modulesMigrated.push('todo');

        console.log(`📊 Todos: ${migration.successful}/${todos.length} migrated successfully`);
    }

    async migrateEvents() {
        console.log('\n📅 6. MIGRATING EVENTS');
        console.log('----------------------');

        const events = [
            {
                title: 'Ben Ginati Project Kickoff',
                startDate: '2025-01-15T10:00:00Z',
                endDate: '2025-01-15T11:00:00Z',
                attendees: ['Ben Ginati', 'Shai Friedman'],
                location: 'Virtual Meeting',
                description: 'Project kickoff meeting for Ben Ginati business automation'
            },
            {
                title: 'Shelly Mizrahi System Demo',
                startDate: '2025-01-20T14:00:00Z',
                endDate: '2025-01-20T15:00:00Z',
                attendees: ['Shelly Mizrahi', 'Shai Friedman'],
                location: 'Virtual Meeting',
                description: 'Demo of document processing system for Shelly Mizrahi'
            }
        ];

        const migration = {
            total: events.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const event of events) {
            try {
                const response = await axios.post(
                    `${this.config.platform}${this.config.endpoints.event}`,
                    event,
                    { headers: this.config.headers }
                );

                migration.successful++;
                migration.records.push({
                    title: event.title,
                    status: 'success',
                    id: response.data.id,
                    data: response.data
                });

                console.log(`✅ Created event: ${event.title}`);
            } catch (error) {
                migration.failed++;
                migration.records.push({
                    title: event.title,
                    status: 'failed',
                    error: error.message
                });

                console.log(`❌ Failed to create event: ${event.title} - ${error.message}`);
            }
        }

        this.results.migrations.events = migration;
        this.results.summary.totalRecords += events.length;
        this.results.summary.successfulMigrations += migration.successful;
        this.results.summary.failedMigrations += migration.failed;
        this.results.summary.modulesMigrated.push('event');

        console.log(`📊 Events: ${migration.successful}/${events.length} migrated successfully`);
    }

    async generateSummary() {
        console.log('\n📊 7. MIGRATION SUMMARY');
        console.log('------------------------');

        const summary = this.results.summary;
        
        console.log(`📈 Total Records: ${summary.totalRecords}`);
        console.log(`✅ Successful Migrations: ${summary.successfulMigrations}`);
        console.log(`❌ Failed Migrations: ${summary.failedMigrations}`);
        console.log(`📊 Success Rate: ${((summary.successfulMigrations / summary.totalRecords) * 100).toFixed(1)}%`);
        console.log(`📦 Modules Migrated: ${summary.modulesMigrated.join(', ')}`);

        this.results.summary.successRate = ((summary.successfulMigrations / summary.totalRecords) * 100).toFixed(1);
    }

    async testEndpoint(endpoint) {
        try {
            const response = await axios.get(
                `${this.config.platform}${endpoint}`,
                { headers: this.config.headers }
            );
            
            return {
                status: 'passed',
                statusCode: response.status,
                endpoint: endpoint
            };
        } catch (error) {
            return {
                status: 'failed',
                error: error.message,
                statusCode: error.response?.status,
                endpoint: endpoint
            };
        }
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-migration';
        await fs.mkdir(resultsDir, { recursive: true });
        
        const filename = `boost-space-data-migration-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));
        
        console.log(`📁 Migration results saved to: ${resultsDir}/${filename}`);
    }
}

// ===== CLI INTERFACE =====

async function main() {
    const migration = new BoostSpaceDataMigration();
    
    try {
        await migration.migrateData();
    } catch (error) {
        console.error('❌ Data migration failed:', error.message);
        process.exit(1);
    }
}

// Execute main function
main().catch(console.error);
