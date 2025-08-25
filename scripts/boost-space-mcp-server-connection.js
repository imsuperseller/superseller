#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs/promises';
import path from 'path';

class BoostSpaceMCPServer {
    constructor() {
        this.mcpServerUrl = 'https://mcp.boost.space/v1/superseller/sse';
        this.apiKey = 'BOOST_SPACE_KEY_REDACTED';
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'in_progress',
            mcpConnection: {},
            dataPopulation: {}
        };
    }

    async connectToMCPServer() {
        console.log('🔗 CONNECTING TO BOOST.SPACE MCP SERVER');
        console.log('========================================\n');

        try {
            // Create MCP client
            const transport = new StdioClientTransport();
            const client = new Client(transport, {
                name: 'boost-space-mcp-client',
                version: '1.0.0'
            });

            console.log('✅ MCP Client created successfully');

            // Initialize the client
            await client.initialize();
            console.log('✅ MCP Client initialized');

            // List available tools
            const tools = await client.listTools();
            console.log('📋 Available MCP Tools:', tools.tools.length);

            this.results.mcpConnection = {
                status: 'connected',
                tools: tools.tools.length,
                serverUrl: this.mcpServerUrl
            };

            return client;

        } catch (error) {
            console.error('❌ MCP Server connection failed:', error.message);
            this.results.mcpConnection = {
                status: 'failed',
                error: error.message
            };
            throw error;
        }
    }

    async populateDataViaMCP(client) {
        console.log('\n🚀 POPULATING DATA VIA MCP SERVER');
        console.log('==================================\n');

        try {
            // 1. Populate Contacts
            await this.populateContactsViaMCP(client);

            // 2. Populate Business Cases
            await this.populateBusinessCasesViaMCP(client);

            // 3. Populate Invoices
            await this.populateInvoicesViaMCP(client);

            // 4. Populate Todos
            await this.populateTodosViaMCP(client);

            // 5. Populate Events
            await this.populateEventsViaMCP(client);

            console.log('\n✅ DATA POPULATION COMPLETED VIA MCP!');

        } catch (error) {
            console.error('❌ Data population failed:', error.message);
            throw error;
        }
    }

    async populateContactsViaMCP(client) {
        console.log('👥 POPULATING CONTACTS VIA MCP');
        console.log('-------------------------------');

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
            }
        ];

        this.results.dataPopulation.contacts = {
            total: contacts.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const contact of contacts) {
            try {
                const result = await client.callTool({
                    name: 'create_contact',
                    arguments: {
                        name: contact.name,
                        email: contact.email,
                        phone: contact.phone,
                        company: contact.company,
                        status: contact.status,
                        notes: contact.notes
                    }
                });

                console.log(`✅ Created contact via MCP: ${contact.name}`);
                this.results.dataPopulation.contacts.successful++;
                this.results.dataPopulation.contacts.records.push({
                    name: contact.name,
                    status: 'success',
                    mcpResult: result
                });

            } catch (error) {
                console.log(`❌ Failed to create contact via MCP: ${contact.name}`);
                this.results.dataPopulation.contacts.failed++;
                this.results.dataPopulation.contacts.records.push({
                    name: contact.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Contacts: ${this.results.dataPopulation.contacts.successful}/${contacts.length} populated via MCP`);
    }

    async populateBusinessCasesViaMCP(client) {
        console.log('\n💼 POPULATING BUSINESS CASES VIA MCP');
        console.log('------------------------------------');

        const businessCases = [
            {
                name: 'Ben Ginati - Complete Business Automation',
                status: 'In Progress',
                customer: 'Ben Ginati',
                budget: 15000,
                timeline: '3 months'
            },
            {
                name: 'Shelly Mizrahi - Insurance Document Processing',
                status: 'Planning',
                customer: 'Shelly Mizrahi',
                budget: 8000,
                timeline: '2 months'
            }
        ];

        this.results.dataPopulation.businessCases = {
            total: businessCases.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const businessCase of businessCases) {
            try {
                const result = await client.callTool({
                    name: 'create_business_case',
                    arguments: {
                        name: businessCase.name,
                        status: businessCase.status,
                        customer: businessCase.customer,
                        budget: businessCase.budget,
                        timeline: businessCase.timeline
                    }
                });

                console.log(`✅ Created business case via MCP: ${businessCase.name}`);
                this.results.dataPopulation.businessCases.successful++;
                this.results.dataPopulation.businessCases.records.push({
                    name: businessCase.name,
                    status: 'success',
                    mcpResult: result
                });

            } catch (error) {
                console.log(`❌ Failed to create business case via MCP: ${businessCase.name}`);
                this.results.dataPopulation.businessCases.failed++;
                this.results.dataPopulation.businessCases.records.push({
                    name: businessCase.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Business Cases: ${this.results.dataPopulation.businessCases.successful}/${businessCases.length} populated via MCP`);
    }

    async populateInvoicesViaMCP(client) {
        console.log('\n💰 POPULATING INVOICES VIA MCP');
        console.log('------------------------------');

        const invoices = [
            {
                number: 'INV-001',
                customer: 'Ben Ginati',
                amount: 5000,
                status: 'Pending',
                dueDate: '2025-09-15'
            },
            {
                number: 'INV-002',
                customer: 'Shelly Mizrahi',
                amount: 3000,
                status: 'Draft',
                dueDate: '2025-09-30'
            }
        ];

        this.results.dataPopulation.invoices = {
            total: invoices.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const invoice of invoices) {
            try {
                const result = await client.callTool({
                    name: 'create_invoice',
                    arguments: {
                        number: invoice.number,
                        customer: invoice.customer,
                        amount: invoice.amount,
                        status: invoice.status,
                        dueDate: invoice.dueDate
                    }
                });

                console.log(`✅ Created invoice via MCP: ${invoice.number}`);
                this.results.dataPopulation.invoices.successful++;
                this.results.dataPopulation.invoices.records.push({
                    number: invoice.number,
                    status: 'success',
                    mcpResult: result
                });

            } catch (error) {
                console.log(`❌ Failed to create invoice via MCP: ${invoice.number}`);
                this.results.dataPopulation.invoices.failed++;
                this.results.dataPopulation.invoices.records.push({
                    number: invoice.number,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Invoices: ${this.results.dataPopulation.invoices.successful}/${invoices.length} populated via MCP`);
    }

    async populateTodosViaMCP(client) {
        console.log('\n✅ POPULATING TODOS VIA MCP');
        console.log('---------------------------');

        const todos = [
            {
                title: 'Complete Ben Ginati WordPress setup',
                assignee: 'Development Team',
                priority: 'High',
                status: 'In Progress',
                dueDate: '2025-08-30'
            },
            {
                title: 'Deploy Shelly Mizrahi document system',
                assignee: 'Development Team',
                priority: 'Medium',
                status: 'Planning',
                dueDate: '2025-09-15'
            }
        ];

        this.results.dataPopulation.todos = {
            total: todos.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const todo of todos) {
            try {
                const result = await client.callTool({
                    name: 'create_todo',
                    arguments: {
                        title: todo.title,
                        assignee: todo.assignee,
                        priority: todo.priority,
                        status: todo.status,
                        dueDate: todo.dueDate
                    }
                });

                console.log(`✅ Created todo via MCP: ${todo.title}`);
                this.results.dataPopulation.todos.successful++;
                this.results.dataPopulation.todos.records.push({
                    title: todo.title,
                    status: 'success',
                    mcpResult: result
                });

            } catch (error) {
                console.log(`❌ Failed to create todo via MCP: ${todo.title}`);
                this.results.dataPopulation.todos.failed++;
                this.results.dataPopulation.todos.records.push({
                    title: todo.title,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Todos: ${this.results.dataPopulation.todos.successful}/${todos.length} populated via MCP`);
    }

    async populateEventsViaMCP(client) {
        console.log('\n📅 POPULATING EVENTS VIA MCP');
        console.log('----------------------------');

        const events = [
            {
                title: 'Ben Ginati Project Kickoff',
                startDate: '2025-08-25T10:00:00Z',
                endDate: '2025-08-25T11:00:00Z',
                location: 'Virtual Meeting',
                description: 'Kickoff meeting for business automation project'
            },
            {
                title: 'Shelly Mizrahi System Demo',
                startDate: '2025-08-28T14:00:00Z',
                endDate: '2025-08-28T15:00:00Z',
                location: 'Virtual Meeting',
                description: 'Demo of insurance document processing system'
            }
        ];

        this.results.dataPopulation.events = {
            total: events.length,
            successful: 0,
            failed: 0,
            records: []
        };

        for (const event of events) {
            try {
                const result = await client.callTool({
                    name: 'create_event',
                    arguments: {
                        title: event.title,
                        startDate: event.startDate,
                        endDate: event.endDate,
                        location: event.location,
                        description: event.description
                    }
                });

                console.log(`✅ Created event via MCP: ${event.title}`);
                this.results.dataPopulation.events.successful++;
                this.results.dataPopulation.events.records.push({
                    title: event.title,
                    status: 'success',
                    mcpResult: result
                });

            } catch (error) {
                console.log(`❌ Failed to create event via MCP: ${event.title}`);
                this.results.dataPopulation.events.failed++;
                this.results.dataPopulation.events.records.push({
                    title: event.title,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        console.log(`📊 Events: ${this.results.dataPopulation.events.successful}/${events.length} populated via MCP`);
    }

    async generateSummary() {
        console.log('\n📊 MCP POPULATION SUMMARY');
        console.log('==========================');

        const totalRecords = Object.values(this.results.dataPopulation).reduce((sum, module) => sum + module.total, 0);
        const totalSuccessful = Object.values(this.results.dataPopulation).reduce((sum, module) => sum + module.successful, 0);
        const totalFailed = Object.values(this.results.dataPopulation).reduce((sum, module) => sum + module.failed, 0);

        console.log(`📈 Total Records: ${totalRecords}`);
        console.log(`✅ Successful Population: ${totalSuccessful}`);
        console.log(`❌ Failed Population: ${totalFailed}`);
        console.log(`📊 Success Rate: ${((totalSuccessful / totalRecords) * 100).toFixed(1)}%`);
        console.log(`📦 Modules Populated: ${Object.keys(this.results.dataPopulation).join(', ')}`);

        this.results.summary = {
            totalRecords,
            totalSuccessful,
            totalFailed,
            successRate: ((totalSuccessful / totalRecords) * 100).toFixed(1),
            modules: Object.keys(this.results.dataPopulation)
        };
    }

    async saveResults() {
        const resultsDir = 'docs/boost-space-mcp-results';
        await fs.mkdir(resultsDir, { recursive: true });

        const filename = `boost-space-mcp-server-results-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(path.join(resultsDir, filename), JSON.stringify(this.results, null, 2));

        console.log(`📁 MCP results saved to: ${resultsDir}/${filename}`);
    }

    async execute() {
        try {
            // Connect to MCP server
            const client = await this.connectToMCPServer();

            // Populate data via MCP
            await this.populateDataViaMCP(client);

            // Generate summary
            await this.generateSummary();

            // Save results
            await this.saveResults();

            this.results.status = 'completed';
            console.log('\n🎉 BOOST.SPACE MCP SERVER POPULATION COMPLETED!');

        } catch (error) {
            console.error('❌ MCP server population failed:', error.message);
            this.results.status = 'failed';
            this.results.error = error.message;
            await this.saveResults();
        }
    }
}

async function main() {
    const mcpServer = new BoostSpaceMCPServer();
    await mcpServer.execute();
}

main().catch(console.error);
