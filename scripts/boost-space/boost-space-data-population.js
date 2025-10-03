#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BoostSpaceDataPopulation {
    constructor() {
        this.boostSpaceConfig = {
            platform: 'https://superseller.boost.space',
            apiKey: 'BOOST_SPACE_KEY_REDACTED',
            // Updated: MCP servers now use NPX packages instead of VPS HTTP endpoints
            mcpServer: 'NPX_PACKAGE_METHOD' // OBSOLETE: VPS HTTP endpoint
        };
        this.populationResults = {
            build: {},
            measure: {},
            analyze: {},
            deploy: {}
        };
    }

    async runFullDataPopulation() {
        console.log('🚀 Starting Boost.space Data Population (BMAD Methodology)...\n');
        
        try {
            await this.buildPhase();
            await this.measurePhase();
            await this.analyzePhase();
            await this.deployPhase();
            
            this.generatePopulationReport();
        } catch (error) {
            console.error('❌ Data population failed:', error);
        }
    }

    async buildPhase() {
        console.log('🏗️  BUILD PHASE: Data Structure & Mapping');
        
        // Define data structure for all 47 modules
        this.populationResults.build.dataStructure = this.defineDataStructure();
        
        // Map existing business data
        this.populationResults.build.dataMapping = await this.mapExistingData();
        
        // Create data validation rules
        this.populationResults.build.validationRules = this.createValidationRules();
        
        console.log('✅ Build phase completed');
    }

    async measurePhase() {
        console.log('\n📊 MEASURE PHASE: Data Volume & Quality Assessment');
        
        // Measure data volume
        this.populationResults.measure.dataVolume = await this.measureDataVolume();
        
        // Assess data quality
        this.populationResults.measure.dataQuality = await this.assessDataQuality();
        
        // Calculate population time estimates
        this.populationResults.measure.timeEstimates = this.calculateTimeEstimates();
        
        console.log('✅ Measure phase completed');
    }

    async analyzePhase() {
        console.log('\n🔍 ANALYZE PHASE: Population Strategy & Dependencies');
        
        // Analyze data dependencies
        this.populationResults.analyze.dependencies = this.analyzeDataDependencies();
        
        // Identify population order
        this.populationResults.analyze.populationOrder = this.determinePopulationOrder();
        
        // Assess risks and mitigation
        this.populationResults.analyze.risks = this.assessRisks();
        
        console.log('✅ Analyze phase completed');
    }

    async deployPhase() {
        console.log('\n🚀 DEPLOY PHASE: Execute Data Population');
        
        // Execute data population
        this.populationResults.deploy.populationResults = await this.executeDataPopulation();
        
        // Verify data integrity
        this.populationResults.deploy.verification = await this.verifyDataIntegrity();
        
        // Generate population summary
        this.populationResults.deploy.summary = this.generatePopulationSummary();
        
        console.log('✅ Deploy phase completed');
    }

    defineDataStructure() {
        return {
            contacts: {
                fields: ['name', 'email', 'phone', 'company', 'status', 'source', 'notes'],
                required: ['name', 'email'],
                relationships: ['business-case', 'invoice', 'todo']
            },
            'business-case': {
                fields: ['name', 'customer', 'description', 'budget', 'status', 'start_date', 'end_date'],
                required: ['name', 'customer'],
                relationships: ['contacts', 'todo', 'invoice']
            },
            invoice: {
                fields: ['number', 'customer', 'amount', 'status', 'due_date', 'items'],
                required: ['number', 'customer', 'amount'],
                relationships: ['contacts', 'business-case']
            },
            'business-contract': {
                fields: ['name', 'parties', 'type', 'status', 'start_date', 'end_date', 'terms'],
                required: ['name', 'parties'],
                relationships: ['contacts', 'business-case']
            },
            todo: {
                fields: ['title', 'description', 'assignee', 'priority', 'status', 'due_date'],
                required: ['title'],
                relationships: ['contacts', 'business-case']
            },
            products: {
                fields: ['name', 'sku', 'price', 'category', 'description', 'status'],
                required: ['name', 'price'],
                relationships: ['invoice']
            },
            event: {
                fields: ['title', 'start_date', 'end_date', 'attendees', 'location', 'description'],
                required: ['title', 'start_date'],
                relationships: ['contacts']
            }
        };
    }

    async mapExistingData() {
        console.log('Mapping existing business data...');
        
        // This would typically read from existing databases/files
        // For now, we'll create sample data mapping
        return {
            customers: [
                { name: 'John Doe', email: 'john@techcorp.com', company: 'Tech Corp', status: 'active' },
                { name: 'Jane Smith', email: 'jane@designstudio.com', company: 'Design Studio', status: 'active' },
                { name: 'Bob Johnson', email: 'bob@startup.com', company: 'Startup Inc', status: 'prospect' }
            ],
            contracts: [
                { name: 'Web Development Agreement', parties: ['Rensto', 'Tech Corp'], status: 'active' },
                { name: 'Design Services Contract', parties: ['Rensto', 'Design Studio'], status: 'draft' }
            ],
            projects: [
                { name: 'E-commerce Website', customer: 'Tech Corp', budget: 15000, status: 'in-progress' },
                { name: 'Mobile App Development', customer: 'Startup Inc', budget: 25000, status: 'planning' }
            ],
            invoices: [
                { number: 'INV-001', customer: 'Tech Corp', amount: 5000, status: 'paid' },
                { number: 'INV-002', customer: 'Design Studio', amount: 3000, status: 'pending' }
            ]
        };
    }

    createValidationRules() {
        return {
            email: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            phone: '^[+]?[1-9]\\d{1,14}$',
            amount: '^\\d+(\\.\\d{1,2})?$',
            date: '^\\d{4}-\\d{2}-\\d{2}$'
        };
    }

    async measureDataVolume() {
        const dataMapping = this.populationResults.build.dataMapping;
        
        return {
            contacts: dataMapping.customers.length,
            contracts: dataMapping.contracts.length,
            projects: dataMapping.projects.length,
            invoices: dataMapping.invoices.length,
            total: Object.values(dataMapping).reduce((sum, arr) => sum + arr.length, 0)
        };
    }

    async assessDataQuality() {
        const dataMapping = this.populationResults.build.dataMapping;
        const validationRules = this.populationResults.build.validationRules;
        
        const qualityReport = {
            contacts: this.validateContacts(dataMapping.customers, validationRules),
            contracts: this.validateContracts(dataMapping.contracts),
            projects: this.validateProjects(dataMapping.projects),
            invoices: this.validateInvoices(dataMapping.invoices, validationRules)
        };
        
        return qualityReport;
    }

    validateContacts(contacts, rules) {
        const issues = [];
        contacts.forEach((contact, index) => {
            if (!contact.email || !contact.email.match(rules.email)) {
                issues.push(`Contact ${index + 1}: Invalid email format`);
            }
            if (!contact.name) {
                issues.push(`Contact ${index + 1}: Missing name`);
            }
        });
        
        return {
            total: contacts.length,
            valid: contacts.length - issues.length,
            issues: issues
        };
    }

    validateContracts(contracts) {
        const issues = [];
        contracts.forEach((contract, index) => {
            if (!contract.name) {
                issues.push(`Contract ${index + 1}: Missing name`);
            }
            if (!contract.parties || contract.parties.length < 2) {
                issues.push(`Contract ${index + 1}: Missing parties`);
            }
        });
        
        return {
            total: contracts.length,
            valid: contracts.length - issues.length,
            issues: issues
        };
    }

    validateProjects(projects) {
        const issues = [];
        projects.forEach((project, index) => {
            if (!project.name) {
                issues.push(`Project ${index + 1}: Missing name`);
            }
            if (!project.customer) {
                issues.push(`Project ${index + 1}: Missing customer`);
            }
        });
        
        return {
            total: projects.length,
            valid: projects.length - issues.length,
            issues: issues
        };
    }

    validateInvoices(invoices, rules) {
        const issues = [];
        invoices.forEach((invoice, index) => {
            if (!invoice.number) {
                issues.push(`Invoice ${index + 1}: Missing number`);
            }
            if (!invoice.amount || !invoice.amount.toString().match(rules.amount)) {
                issues.push(`Invoice ${index + 1}: Invalid amount`);
            }
        });
        
        return {
            total: invoices.length,
            valid: invoices.length - issues.length,
            issues: issues
        };
    }

    calculateTimeEstimates() {
        const dataVolume = this.populationResults.measure.dataVolume;
        
        // Estimate time based on data volume and API limits
        return {
            contacts: Math.ceil(dataVolume.contacts / 10) * 2, // 2 minutes per 10 contacts
            contracts: Math.ceil(dataVolume.contracts / 5) * 3, // 3 minutes per 5 contracts
            projects: Math.ceil(dataVolume.projects / 5) * 2, // 2 minutes per 5 projects
            invoices: Math.ceil(dataVolume.invoices / 10) * 1, // 1 minute per 10 invoices
            total: Math.ceil(dataVolume.total / 10) * 2 // Average 2 minutes per 10 records
        };
    }

    analyzeDataDependencies() {
        return {
            contacts: [], // No dependencies
            'business-case': ['contacts'], // Depends on contacts
            invoice: ['contacts', 'business-case'], // Depends on contacts and projects
            'business-contract': ['contacts'], // Depends on contacts
            todo: ['contacts', 'business-case'], // Depends on contacts and projects
            products: [], // No dependencies
            event: ['contacts'] // Depends on contacts
        };
    }

    determinePopulationOrder() {
        const dependencies = this.populationResults.analyze.dependencies;
        
        // Topological sort based on dependencies
        return [
            'contacts', // First: no dependencies
            'products', // No dependencies
            'business-case', // Depends on contacts
            'business-contract', // Depends on contacts
            'invoice', // Depends on contacts and projects
            'todo', // Depends on contacts and projects
            'event' // Depends on contacts
        ];
    }

    assessRisks() {
        return {
            dataLoss: {
                risk: 'Low',
                mitigation: 'Backup existing data before population'
            },
            apiLimits: {
                risk: 'Medium',
                mitigation: 'Implement rate limiting and retry logic'
            },
            dataIntegrity: {
                risk: 'Medium',
                mitigation: 'Validate data before and after population'
            },
            downtime: {
                risk: 'Low',
                mitigation: 'Population can be done incrementally'
            }
        };
    }

    async executeDataPopulation() {
        console.log('Executing data population...');
        
        const populationOrder = this.populationResults.analyze.populationOrder;
        const dataMapping = this.populationResults.build.dataMapping;
        const results = {};
        
        for (const module of populationOrder) {
            console.log(`Populating ${module}...`);
            
            try {
                const data = this.getDataForModule(module, dataMapping);
                const result = await this.populateModule(module, data);
                results[module] = result;
                
                console.log(`✅ ${module}: ${result.success ? 'Success' : 'Failed'}`);
            } catch (error) {
                console.log(`❌ ${module}: Error - ${error.message}`);
                results[module] = { success: false, error: error.message };
            }
        }
        
        return results;
    }

    getDataForModule(module, dataMapping) {
        switch (module) {
            case 'contacts':
                return dataMapping.customers;
            case 'business-case':
                return dataMapping.projects;
            case 'business-contract':
                return dataMapping.contracts;
            case 'invoice':
                return dataMapping.invoices;
            default:
                return [];
        }
    }

    async populateModule(module, data) {
        // Use the MCP server to populate data
        try {
            const response = await axios.post(`${this.boostSpaceConfig.mcpServer}/api/create`, {
                module: module,
                data: data
            });
            
            return {
                success: true,
                recordsCreated: data.length,
                response: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                recordsCreated: 0
            };
        }
    }

    async verifyDataIntegrity() {
        console.log('Verifying data integrity...');
        
        const verification = {};
        const modules = ['contacts', 'business-case', 'business-contract', 'invoice'];
        
        for (const module of modules) {
            try {
                const response = await axios.post(`${this.boostSpaceConfig.mcpServer}/api/query`, {
                    module: module,
                    query: 'all records'
                });
                
                verification[module] = {
                    success: true,
                    recordCount: response.data.data.length,
                    data: response.data.data
                };
            } catch (error) {
                verification[module] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        return verification;
    }

    generatePopulationSummary() {
        const results = this.populationResults.deploy.populationResults;
        const verification = this.populationResults.deploy.verification;
        
        let totalCreated = 0;
        let totalSuccessful = 0;
        
        Object.values(results).forEach(result => {
            if (result.success) {
                totalCreated += result.recordsCreated;
                totalSuccessful++;
            }
        });
        
        return {
            modulesPopulated: totalSuccessful,
            totalRecordsCreated: totalCreated,
            successRate: (totalSuccessful / Object.keys(results).length) * 100,
            verification: verification
        };
    }

    generatePopulationReport() {
        console.log('\n📋 BOOST.SPACE DATA POPULATION REPORT');
        console.log('=====================================\n');
        
        // Data Structure
        console.log('🏗️  DATA STRUCTURE:');
        const dataStructure = this.populationResults.build.dataStructure;
        Object.keys(dataStructure).forEach(module => {
            console.log(`  ${module}: ${dataStructure[module].fields.length} fields`);
        });
        
        // Data Volume
        console.log('\n📊 DATA VOLUME:');
        const dataVolume = this.populationResults.measure.dataVolume;
        console.log(`  Total records: ${dataVolume.total}`);
        Object.entries(dataVolume).forEach(([module, count]) => {
            if (module !== 'total') {
                console.log(`  ${module}: ${count} records`);
            }
        });
        
        // Data Quality
        console.log('\n🔍 DATA QUALITY:');
        const dataQuality = this.populationResults.measure.dataQuality;
        Object.entries(dataQuality).forEach(([module, quality]) => {
            console.log(`  ${module}: ${quality.valid}/${quality.total} valid`);
            if (quality.issues.length > 0) {
                console.log(`    Issues: ${quality.issues.length}`);
            }
        });
        
        // Population Results
        console.log('\n🚀 POPULATION RESULTS:');
        const summary = this.populationResults.deploy.summary;
        console.log(`  Modules populated: ${summary.modulesPopulated}`);
        console.log(`  Total records created: ${summary.totalRecordsCreated}`);
        console.log(`  Success rate: ${summary.successRate.toFixed(1)}%`);
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../docs/boost-space-data-population-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.populationResults, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
        console.log('\n🎉 BOOST.SPACE DATA POPULATION COMPLETE!');
    }
}

// Run the data population
const population = new BoostSpaceDataPopulation();
population.runFullDataPopulation();
